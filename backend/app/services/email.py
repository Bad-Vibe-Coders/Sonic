"""Outbound transactional email (password reset, etc.).

No email provider is wired up yet — when SONIC_SMTP_HOST is unset (the
default, dev-only fallback), send_email() just logs the message instead of
sending it, so the password-reset flow is fully testable without real SMTP
credentials. Set SONIC_SMTP_HOST/USER/PASSWORD to send for real; the smtplib
call below works with SES, SendGrid, Postmark, etc.'s SMTP endpoints as-is.
"""
import logging
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, body: str) -> None:
    settings = get_settings()
    if not settings.smtp_host:
        logger.info("email (dev, not sent — no SMTP configured) to=%s subject=%r body=%r", to, subject, body)
        return

    msg = EmailMessage()
    msg["From"] = settings.smtp_from
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        if settings.smtp_use_tls:
            server.starttls()
        if settings.smtp_user and settings.smtp_password:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
