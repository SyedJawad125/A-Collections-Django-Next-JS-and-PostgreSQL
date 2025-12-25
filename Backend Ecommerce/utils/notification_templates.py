from django.core.mail import EmailMultiAlternatives
from django.template import engines
from apps.notification.models import EmailTemplate
from core.settings import EMAIL_HOST_USER, BACKEND_BASE_URL


def send_email(template_name, to_emails, context):
    template = EmailTemplate.objects.filter(name=template_name, deleted=False).first()
    if not template:
        raise ValueError(f"Email template '{template_name}' not found.")

    context['base_url'] = BACKEND_BASE_URL
    django_engine = engines['django']
    subject = django_engine.from_string(template.subject).render(context).strip()
    body_html = django_engine.from_string(template.html_template).render(context)
    body_text = django_engine.from_string(template.alternative_text).render(context) if template.alternative_text else template_name
    email = EmailMultiAlternatives(subject, body_text, from_email=EMAIL_HOST_USER, to=to_emails)
    email.attach_alternative(body_html, "text/html")
    email.send()

