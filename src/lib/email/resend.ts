import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Actionboo.st <hello@actionboo.st>";

// Brand colors
const COLORS = {
  navy: "#1C2B3A",
  orange: "#E67E22",
  orangeLight: "#D4A574",
  cream: "#FDFCFB",
  surface: "#F8F6F3",
  muted: "#7F8C8D",
  border: "#E0DCD7",
  blue: "#4F7CAC",
};

export interface ReceiptEmailData {
  to: string;
  productName: string;
  amount: string;
  date: string;
}

/**
 * Send a purchase receipt email.
 * Fire-and-forget: errors are logged but don't throw.
 */
export async function sendReceiptEmail(data: ReceiptEmailData): Promise<void> {
  try {
    const { to, productName, amount, date } = data;
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your action plan is cooking`,
      html: generateReceiptHtml({ productName, amount, date, dashboardUrl }),
    });

    console.log("[sendReceiptEmail] Sent to:", to);
  } catch (error) {
    console.error("[sendReceiptEmail] Failed:", error);
  }
}

function generateReceiptHtml(data: {
  productName: string;
  amount: string;
  date: string;
  dashboardUrl: string;
}): string {
  const { productName, amount, date, dashboardUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.cream}; font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.cream}; padding: 48px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px;">

          <!-- Orange accent bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, ${COLORS.orange} 0%, ${COLORS.orangeLight} 100%);"></td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 48px 40px 40px; border: 1px solid ${COLORS.border}; border-top: none;">

              <!-- Logo text -->
              <p style="margin: 0 0 40px; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; color: ${COLORS.muted}; text-transform: uppercase;">
                Actionboo.st
              </p>

              <!-- Big headline -->
              <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 700; color: ${COLORS.navy}; line-height: 1.2;">
                Your action plan is brewing.
              </h1>

              <p style="margin: 0 0 40px; font-size: 17px; line-height: 1.7; color: ${COLORS.muted};">
                We're analyzing your competitors, researching your market, and crafting a growth playbook tailored to your situation. Give us a few minutes.
              </p>

              <!-- Receipt details - left aligned, minimal -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 40px; border-top: 1px solid ${COLORS.border}; border-bottom: 1px solid ${COLORS.border};">
                <tr>
                  <td style="padding: 20px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 14px; color: ${COLORS.muted}; padding-bottom: 8px;">${productName}</td>
                        <td style="font-size: 14px; color: ${COLORS.navy}; text-align: right; padding-bottom: 8px;">${amount}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: ${COLORS.muted};">${date}</td>
                        <td style="font-size: 13px; color: ${COLORS.muted}; text-align: right;">Paid</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: ${COLORS.navy}; border-radius: 6px;">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 16px 28px; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 15px;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: ${COLORS.muted};">
                <a href="https://actionboo.st" style="color: ${COLORS.muted}; text-decoration: none;">actionboo.st</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate magic link email HTML for Supabase SMTP.
 * Copy this output to Supabase Dashboard > Auth > Email Templates > Magic Link
 */
export function generateMagicLinkTemplate(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.cream}; font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.cream}; padding: 48px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px;">

          <!-- Orange accent bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, ${COLORS.orange} 0%, ${COLORS.orangeLight} 100%);"></td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 48px 40px 40px; border: 1px solid ${COLORS.border}; border-top: none;">

              <!-- Logo text -->
              <p style="margin: 0 0 40px; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; color: ${COLORS.muted}; text-transform: uppercase;">
                Actionboo.st
              </p>

              <!-- Big headline -->
              <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 700; color: ${COLORS.navy}; line-height: 1.2;">
                Sign in to your account
              </h1>

              <p style="margin: 0 0 32px; font-size: 17px; line-height: 1.7; color: ${COLORS.muted};">
                Click the button below to securely access your dashboard. This link expires in 1 hour.
              </p>

              <!-- CTA - Orange for magic link (higher urgency) -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="background: linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.orangeLight} 100%); border-radius: 6px;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 15px;">
                      Sign In
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: ${COLORS.muted};">
                If you didn't request this, you can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: ${COLORS.muted};">
                <a href="https://actionboo.st" style="color: ${COLORS.muted}; text-decoration: none;">actionboo.st</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
