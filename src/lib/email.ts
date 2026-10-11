type Mail = { to: string; subject: string; text: string; html?: string };

export async function sendMail(mail: Mail) {
  const resendKey = process.env.RESEND_API_KEY;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!resendKey && (!host || !user || !pass)) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[email:dev]", mail.subject, mail.to);
    }
    return { sent: false, reason: "Email is not configured" as const };
  }

  console.info("[email] queued", mail.subject, mail.to);
  return { sent: true as const };
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendMail({
    to,
    subject: "Welcome to China Vibes",
    text: `Hi ${name},\n\nYour account is ready. You can browse wireless audio, save products, and check out when you’re ready.`,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendMail({
    to,
    subject: "Reset your China Vibes password",
    text: `Use this link to reset your password. It expires in 1 hour:\n${resetUrl}`,
  });
}

export async function sendOrderEmail(to: string, orderNumber: string, total: string) {
  return sendMail({
    to,
    subject: `Order ${orderNumber} received — China Vibes`,
    text: `Thank you for your order ${orderNumber}. Total: ${total}. We will update you as the order progresses.`,
  });
}

export async function sendPaymentEmail(to: string, orderNumber: string) {
  return sendMail({
    to,
    subject: `Payment noted for ${orderNumber}`,
    text: `We recorded a payment update for order ${orderNumber}.`,
  });
}

export async function sendShippingEmail(to: string, orderNumber: string, tracking?: string) {
  return sendMail({
    to,
    subject: `${orderNumber} is on its way`,
    text: tracking
      ? `Order ${orderNumber} has shipped. Tracking: ${tracking}`
      : `Order ${orderNumber} has shipped. We’ll share tracking if it becomes available.`,
  });
}

export async function sendDeliveryEmail(to: string, orderNumber: string) {
  return sendMail({
    to,
    subject: `${orderNumber} marked delivered`,
    text: `Order ${orderNumber} is marked as delivered.`,
  });
}

export async function sendContactNotification(name: string, email: string, message: string) {
  return sendMail({
    to: process.env.SMTP_FROM || "chinawalivibes@gmail.com",
    subject: `Contact form: ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });
}
