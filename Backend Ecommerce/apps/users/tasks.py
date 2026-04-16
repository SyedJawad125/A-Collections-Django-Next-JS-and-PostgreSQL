# from celery import shared_task

# @shared_task(bind=True, max_retries=3, default_retry_delay=3)
# def send_welcome_email(self, user_id):
#     print('*********************************************************************')
#     print('Sending welcome email')
#     print('*********************************************************************')



"""
E-commerce Celery Tasks
Follows the same pattern as apps/notification/tasks.py (send_email.delay pattern).

All tasks use:
- bind=True          → allows self.retry()
- max_retries=3      → retries up to 3 times on failure
- default_retry_delay=3 → waits 3 seconds between retries
"""

from celery import shared_task
from django.utils import timezone


# ============================================================================
# ORDER CONFIRMATION
# ============================================================================

@shared_task(bind=True, max_retries=3, default_retry_delay=3)
def send_order_confirmation_email(self, order_id):
    """
    Sends order confirmation email to the customer after order is placed.
    Triggered by: PlaceOrderView → after transaction.atomic() succeeds.
    """
    try:
        from .models import Order
        from apps.notification.tasks import send_email
        from utils.response_messages import ORDER_CONFIRMATION_EMAIL_TEMP

        order = Order.objects.filter(id=order_id, deleted=False).select_related(
            'customer', 'shipping_method', 'coupon'
        ).first()

        if not order:
            print(f"[send_order_confirmation_email] Order #{order_id} not found")
            return

        order_items = []
        for detail in order.order_details.filter(deleted=False):
            product_name = (
                detail.product.name if detail.product
                else (detail.sales_product.name if detail.sales_product else "Product")
            )
            order_items.append({
                "name":        product_name,
                "quantity":    detail.quantity,
                "unit_price":  str(detail.unit_price),
                "total_price": str(detail.total_price),
            })

        context = {
            "full_name":        order.customer_name,
            "email":            order.customer_email,
            "order_id":         order.id,
            "order_date":       order.created_at.strftime("%B %d, %Y at %I:%M %p"),
            "items":            order_items,
            "subtotal":         str(order.subtotal),
            "shipping_cost":    str(order.shipping_cost),
            "discount_amount":  str(order.discount_amount),
            "bill":             str(order.bill),
            "payment_method":   order.get_payment_method_display(),
            "delivery_address": order.delivery_address,
            "shipping_method":  order.shipping_method.name if order.shipping_method else "Standard",
            "estimated_days":   order.shipping_method.estimated_days if order.shipping_method else "3-5",
        }

        send_email.delay(ORDER_CONFIRMATION_EMAIL_TEMP, [order.customer_email], context)
        print(f"[send_order_confirmation_email] Queued for Order #{order_id}")

    except Exception as exc:
        print(f"[send_order_confirmation_email] Failed for Order #{order_id}: {exc}")
        raise self.retry(exc=exc)


# ============================================================================
# ORDER STATUS UPDATE
# ============================================================================

@shared_task(bind=True, max_retries=3, default_retry_delay=3)
def send_order_status_update_email(self, order_id, new_status):
    """
    Notifies customer when their order status changes.
    Triggered by: OrderStatusUpdateView.patch()
    """
    try:
        from .models import Order
        from apps.notification.tasks import send_email
        from utils.response_messages import ORDER_STATUS_UPDATE_EMAIL_TEMP

        order = Order.objects.filter(id=order_id, deleted=False).first()
        if not order:
            return

        status_display_map = {
            "pending":    "Your order is pending confirmation",
            "booked":     "Your order has been confirmed and booked",
            "in_process": "Your order is being processed and packed",
            "delivered":  "Your order has been delivered",
            "cancelled":  "Your order has been cancelled",
        }

        context = {
            "full_name":      order.customer_name,
            "order_id":       order.id,
            "new_status":     new_status,
            "status_message": status_display_map.get(new_status, f"Order status updated to {new_status}"),
            "timestamp":      timezone.now().strftime("%B %d, %Y at %I:%M %p"),
        }

        send_email.delay(ORDER_STATUS_UPDATE_EMAIL_TEMP, [order.customer_email], context)
        print(f"[send_order_status_update_email] Queued for Order #{order_id} → {new_status}")

    except Exception as exc:
        print(f"[send_order_status_update_email] Failed: {exc}")
        raise self.retry(exc=exc)


# ============================================================================
# LOW STOCK ALERT
# ============================================================================

@shared_task(bind=True, max_retries=3, default_retry_delay=3)
def send_low_stock_alert_email(self, inventory_id):
    """
    Notifies admin/staff when a product variant's stock falls below minimum level.
    Triggered by: PlaceOrderView after decrementing inventory.
    """
    try:
        from .models import Inventory
        from apps.notification.tasks import send_email
        from utils.response_messages import LOW_STOCK_ALERT_EMAIL_TEMP
        from django.contrib.auth import get_user_model

        User = get_user_model()

        inventory = Inventory.objects.filter(id=inventory_id).select_related(
            'product_variant__product'
        ).first()

        if not inventory:
            return

        # Send to all staff/admin users
        admin_emails = list(
            User.objects.filter(is_staff=True, is_active=True, deleted=False)
            .values_list('email', flat=True)
        )

        if not admin_emails:
            print(f"[send_low_stock_alert_email] No admin emails found")
            return

        context = {
            "product_name":  inventory.product_variant.product.name,
            "sku":           inventory.product_variant.sku,
            "current_stock": inventory.current_stock,
            "minimum_level": inventory.minimum_stock_level,
            "reorder_point": inventory.reorder_point,
            "timestamp":     timezone.now().strftime("%B %d, %Y at %I:%M %p"),
        }

        send_email.delay(LOW_STOCK_ALERT_EMAIL_TEMP, admin_emails, context)
        print(f"[send_low_stock_alert_email] Queued for inventory #{inventory_id}")

    except Exception as exc:
        print(f"[send_low_stock_alert_email] Failed: {exc}")
        raise self.retry(exc=exc)


# ============================================================================
# RETURN REQUEST
# ============================================================================

@shared_task(bind=True, max_retries=3, default_retry_delay=3)
def send_return_request_email(self, return_request_id):
    """
    Sends confirmation to customer and alert to admin when a return is requested.
    Triggered by: ReturnRequestView.post()
    """
    try:
        from .models import ReturnRequest
        from apps.notification.tasks import send_email
        from utils.response_messages import RETURN_REQUEST_EMAIL_TEMP, RETURN_REQUEST_ADMIN_EMAIL_TEMP
        from django.contrib.auth import get_user_model

        User = get_user_model()

        ret = ReturnRequest.objects.filter(id=return_request_id).select_related(
            'order', 'order_detail'
        ).first()

        if not ret:
            return

        # Email to customer
        customer_context = {
            "full_name":       ret.order.customer_name,
            "order_id":        ret.order.id,
            "reason":          ret.get_reason_display(),
            "return_id":       ret.id,
            "timestamp":       ret.created_at.strftime("%B %d, %Y at %I:%M %p"),
        }
        send_email.delay(RETURN_REQUEST_EMAIL_TEMP, [ret.order.customer_email], customer_context)

        # Alert to admins
        admin_emails = list(
            User.objects.filter(is_staff=True, is_active=True, deleted=False)
            .values_list('email', flat=True)
        )
        if admin_emails:
            admin_context = {
                **customer_context,
                "customer_name":  ret.order.customer_name,
                "customer_email": ret.order.customer_email,
                "description":    ret.description,
            }
            send_email.delay(RETURN_REQUEST_ADMIN_EMAIL_TEMP, admin_emails, admin_context)

        print(f"[send_return_request_email] Queued for ReturnRequest #{return_request_id}")

    except Exception as exc:
        print(f"[send_return_request_email] Failed: {exc}")
        raise self.retry(exc=exc)


# ============================================================================
# PAYMENT CONFIRMATION
# ============================================================================

@shared_task(bind=True, max_retries=3, default_retry_delay=3)
def send_payment_confirmation_email(self, payment_id):
    """
    Sends payment confirmation to customer after successful payment.
    Triggered when payment status is marked as 'completed'.
    """
    try:
        from .models import Payment
        from apps.notification.tasks import send_email
        from utils.response_messages import PAYMENT_CONFIRMATION_EMAIL_TEMP

        payment = Payment.objects.filter(id=payment_id).select_related('order').first()
        if not payment:
            return

        context = {
            "full_name":       payment.order.customer_name,
            "order_id":        payment.order.id,
            "transaction_id":  payment.transaction_id or "N/A",
            "amount":          str(payment.amount),
            "payment_gateway": payment.payment_gateway,
            "paid_at":         payment.paid_at.strftime("%B %d, %Y at %I:%M %p") if payment.paid_at else "N/A",
        }

        send_email.delay(PAYMENT_CONFIRMATION_EMAIL_TEMP, [payment.order.customer_email], context)
        print(f"[send_payment_confirmation_email] Queued for Payment #{payment_id}")

    except Exception as exc:
        print(f"[send_payment_confirmation_email] Failed: {exc}")
        raise self.retry(exc=exc)