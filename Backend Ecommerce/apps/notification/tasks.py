from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.template import engines
from .models import EmailTemplate
from config.settings import EMAIL_HOST_USER, BACKEND_BASE_URL, MAX_RETRIES, RETRY_DELAY


@shared_task(bind=True, max_retries=MAX_RETRIES, default_retry_delay=RETRY_DELAY)
def send_email(self, template_code_name, to_emails, context):
    try:
        template = EmailTemplate.objects.filter(code_name=template_code_name, deleted=False).first()
        if not template:
            raise ValueError(f"Email template '{template_code_name}' not found.")

        context['base_url'] = BACKEND_BASE_URL
        django_engine = engines['django']
        subject = django_engine.from_string(template.subject).render(context).strip()
        body_html = django_engine.from_string(template.html_template).render(context)
        body_text = django_engine.from_string(template.alternative_text).render(context) if template.alternative_text else template.name
        email = EmailMultiAlternatives(subject, body_text, from_email=EMAIL_HOST_USER, to=to_emails)
        email.attach_alternative(body_html, "text/html")
        email.send()

    except Exception as e:
        print(str(e))
        raise self.retry(exc=e)


