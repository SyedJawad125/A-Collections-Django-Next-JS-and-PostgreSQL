from celery import shared_task

@shared_task(bind=True, max_retries=3, default_retry_delay=3)
def send_welcome_email(self, user_id):
    print('*********************************************************************')
    print('Sending welcome email')
    print('*********************************************************************')
