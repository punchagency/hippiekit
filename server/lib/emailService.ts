import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  try {
    // Resend free tier restriction: only send to verified email
    // For development, redirect all emails to the verified email
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const verifiedEmail = 'ayodelebabajidechris123@gmail.com'; // Your Resend verified email
    const actualRecipient = isDevelopment ? verifiedEmail : to;
    
    // Add note in subject if redirecting in development
    const actualSubject = isDevelopment && to !== verifiedEmail 
      ? `[FOR: ${to}] ${subject}` 
      : subject;
    
    // If no HTML provided, create a simple HTML version from text
    const emailHtml =
      html ||
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #650084; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Hippiekit</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background-color: white; padding: 20px; border-radius: 5px;">
              <p style="white-space: pre-line;">${text}</p>
            </div>
            <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
              © ${new Date().getFullYear()} Hippiekit. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Hippiekit <onboarding@resend.dev>', // Use your domain once verified: noreply@yourdomain.com
      to: actualRecipient,
      subject: actualSubject,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    if (isDevelopment && to !== verifiedEmail) {
      console.log(`📧 [DEV MODE] Email redirected from ${to} to ${verifiedEmail}`);
    }
    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}
