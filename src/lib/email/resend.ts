import { Resend } from "resend";
import { signAuditToken } from "@/lib/auth/audit-token";

// Lazy-load Resend client to avoid throwing on import when API key is missing
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = "Boost <team@aboo.st>";

// Soft brutalist color palette (matches landing page)
const COLORS = {
  foreground: "#2C3E50", // borders, shadows, text
  cta: "#E67E22", // orange accent
  cream: "#FDFCFB", // background
  surface: "#F8F6F3", // receipt details bg
  muted: "#7F8C8D", // secondary text
};

// Soft brutalism shadow
const SOFT_SHADOW = "4px 4px 0 rgba(44, 62, 80, 0.15)";

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

    const resend = getResend();
    if (!resend) {
      console.warn('[Email] RESEND_API_KEY not set, skipping email');
      return;
    }
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your Boost is cooking`,
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
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.cream}; font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.cream}; padding: 48px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px;">

          <!-- Soft brutalist card -->
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" width="100%" style="border: 2px solid ${COLORS.foreground}; border-radius: 6px; background-color: #FFFFFF; box-shadow: ${SOFT_SHADOW};">
                <tr>
                  <td style="padding: 48px 40px 40px;">

                    <!-- Logo -->
                    <img src="https://aboo.st/logo.png" alt="Boost" width="120" height="28" style="display: block; margin: 0 0 32px; width: 120px; height: 28px;" />

                    <!-- Big headline -->
                    <h1 style="margin: 0 0 16px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 28px; font-weight: 700; color: ${COLORS.foreground}; line-height: 1.2;">
                      Your Boost is brewing.
                    </h1>

                    <p style="margin: 0 0 32px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 16px; line-height: 1.7; color: ${COLORS.muted};">
                      We're analyzing your competitors, researching your market, and crafting a growth playbook tailored to your situation. Give us a few minutes.
                    </p>

                    <!-- Receipt details (soft brutalist box) -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px; border: 2px solid ${COLORS.foreground}; border-radius: 4px; background-color: ${COLORS.surface};">
                      <tr>
                        <td style="padding: 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; color: ${COLORS.muted}; text-transform: uppercase; padding-bottom: 6px;">
                                PRODUCT
                              </td>
                              <td style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; color: ${COLORS.muted}; text-transform: uppercase; text-align: right; padding-bottom: 6px;">
                                AMOUNT
                              </td>
                            </tr>
                            <tr>
                              <td style="font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 16px; font-weight: 600; color: ${COLORS.foreground};">
                                ${productName}
                              </td>
                              <td style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 16px; font-weight: 700; color: ${COLORS.foreground}; text-align: right;">
                                ${amount}
                              </td>
                            </tr>
                            <tr>
                              <td colspan="2" style="padding-top: 12px;">
                                <span style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.05em; color: ${COLORS.muted};">
                                  ${date} · Paid
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button with soft shadow -->
                    <table cellpadding="0" cellspacing="0" style="border: 2px solid ${COLORS.foreground}; border-radius: 6px; box-shadow: ${SOFT_SHADOW};">
                      <tr>
                        <td style="background-color: ${COLORS.cta}; border-radius: 4px;">
                          <a href="${dashboardUrl}" style="display: inline-block; padding: 16px 32px; color: #FFFFFF; text-decoration: none; font-family: 'Source Sans 3', -apple-system, sans-serif; font-weight: 700; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em;">
                            Go to Dashboard
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 0; text-align: center;">
              <p style="margin: 0; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; color: ${COLORS.muted};">
                <a href="https://aboo.st" style="color: ${COLORS.muted}; text-decoration: none;">Boost</a>
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
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.cream}; font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.cream}; padding: 48px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px;">

          <!-- Soft brutalist card -->
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" width="100%" style="border: 2px solid ${COLORS.foreground}; border-radius: 6px; background-color: #FFFFFF; box-shadow: ${SOFT_SHADOW};">
                <tr>
                  <td style="padding: 48px 40px 40px;">

                    <!-- Logo -->
                    <img src="https://aboo.st/logo.png" alt="Boost" width="120" height="28" style="display: block; margin: 0 0 32px; width: 120px; height: 28px;" />

                    <!-- Big headline -->
                    <h1 style="margin: 0 0 16px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 28px; font-weight: 700; color: ${COLORS.foreground}; line-height: 1.2;">
                      Sign in to your account
                    </h1>

                    <p style="margin: 0 0 32px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 16px; line-height: 1.7; color: ${COLORS.muted};">
                      Click the button below to securely access your dashboard. This link expires in 1 hour.
                    </p>

                    <!-- CTA Button with soft shadow -->
                    <table cellpadding="0" cellspacing="0" style="border: 2px solid ${COLORS.foreground}; border-radius: 6px; box-shadow: ${SOFT_SHADOW}; margin-bottom: 32px;">
                      <tr>
                        <td style="background-color: ${COLORS.cta}; border-radius: 4px;">
                          <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; color: #FFFFFF; text-decoration: none; font-family: 'Source Sans 3', -apple-system, sans-serif; font-weight: 700; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em;">
                            Sign In
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 14px; color: ${COLORS.muted};">
                      If you didn't request this, you can safely ignore this email.
                    </p>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 0; text-align: center;">
              <p style="margin: 0; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; color: ${COLORS.muted};">
                <a href="https://aboo.st" style="color: ${COLORS.muted}; text-decoration: none;">Boost</a>
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

// =============================================================================
// RUN READY EMAIL
// =============================================================================

export interface RunReadyEmailData {
  to: string;
  runId: string;
}

/**
 * Send email when a run completes successfully.
 * Fire-and-forget: errors are logged but don't throw.
 */
export async function sendRunReadyEmail(data: RunReadyEmailData): Promise<void> {
  try {
    const { to, runId } = data;
    const resultsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/results/${runId}`;

    const resend = getResend();
    if (!resend) {
      console.warn('[Email] RESEND_API_KEY not set, skipping email');
      return;
    }
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Your growth strategy is ready",
      html: generateRunReadyHtml({ resultsUrl }),
    });

    console.log("[sendRunReadyEmail] Sent to:", to);
  } catch (error) {
    console.error("[sendRunReadyEmail] Failed:", error);
  }
}

function generateRunReadyHtml(data: { resultsUrl: string }): string {
  const { resultsUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.cream}; font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.cream}; padding: 48px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px;">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" width="100%" style="border: 2px solid ${COLORS.foreground}; border-radius: 6px; background-color: #FFFFFF; box-shadow: ${SOFT_SHADOW};">
                <tr>
                  <td style="padding: 48px 40px 40px;">
                    <img src="https://aboo.st/logo.png" alt="Boost" width="120" height="28" style="display: block; margin: 0 0 32px; width: 120px; height: 28px;" />
                    <h1 style="margin: 0 0 16px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 28px; font-weight: 700; color: ${COLORS.foreground}; line-height: 1.2;">
                      Your growth strategy is ready.
                    </h1>
                    <p style="margin: 0 0 32px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 16px; line-height: 1.7; color: ${COLORS.muted};">
                      We've finished analyzing your competitors, researching your market, and crafting a personalized growth playbook. Your strategy includes quick wins, a 30-day roadmap, and specific tactics to start growing.
                    </p>
                    <table cellpadding="0" cellspacing="0" style="border: 2px solid ${COLORS.foreground}; border-radius: 6px; box-shadow: ${SOFT_SHADOW};">
                      <tr>
                        <td style="background-color: ${COLORS.cta}; border-radius: 4px;">
                          <a href="${resultsUrl}" style="display: inline-block; padding: 16px 32px; color: #FFFFFF; text-decoration: none; font-family: 'Source Sans 3', -apple-system, sans-serif; font-weight: 700; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em;">
                            View Your Strategy
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 0; text-align: center;">
              <p style="margin: 0; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; color: ${COLORS.muted};">
                <a href="https://aboo.st" style="color: ${COLORS.muted}; text-decoration: none;">Boost</a>
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

// =============================================================================
// WEEK READY EMAIL (Boost Weekly)
// =============================================================================

export interface WeekReadyEmailData {
  to: string;
  runId: string;
}

/**
 * Send email when a new weekly strategy is ready (Monday morning).
 * Fire-and-forget: errors are logged but don't throw.
 */
export async function sendWeekReadyEmail(data: WeekReadyEmailData): Promise<void> {
  try {
    const { to, runId } = data;
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

    const resend = getResend();
    if (!resend) {
      console.warn('[Email] RESEND_API_KEY not set, skipping email');
      return;
    }
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Your week is ready",
      html: generateWeekReadyHtml({ dashboardUrl }),
    });

    console.log("[sendWeekReadyEmail] Sent to:", to);
  } catch (error) {
    console.error("[sendWeekReadyEmail] Failed:", error);
  }
}

function generateWeekReadyHtml(data: { dashboardUrl: string }): string {
  const { dashboardUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.cream}; font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.cream}; padding: 48px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px;">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" width="100%" style="border: 2px solid ${COLORS.foreground}; border-radius: 6px; background-color: #FFFFFF; box-shadow: ${SOFT_SHADOW};">
                <tr>
                  <td style="padding: 48px 40px 40px;">
                    <img src="https://aboo.st/logo.png" alt="Boost" width="120" height="28" style="display: block; margin: 0 0 32px; width: 120px; height: 28px;" />
                    <h1 style="margin: 0 0 16px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 28px; font-weight: 700; color: ${COLORS.foreground}; line-height: 1.2;">
                      Your new week is ready.
                    </h1>
                    <p style="margin: 0 0 32px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 16px; line-height: 1.7; color: ${COLORS.muted};">
                      Based on what happened last week and where you are now, here's your updated focus. New tasks, fresh priorities, same momentum.
                    </p>
                    <table cellpadding="0" cellspacing="0" style="border: 2px solid ${COLORS.foreground}; border-radius: 6px; box-shadow: ${SOFT_SHADOW};">
                      <tr>
                        <td style="background-color: ${COLORS.cta}; border-radius: 4px;">
                          <a href="${dashboardUrl}" style="display: inline-block; padding: 16px 32px; color: #FFFFFF; text-decoration: none; font-family: 'Source Sans 3', -apple-system, sans-serif; font-weight: 700; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em;">
                            See This Week's Plan
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 0; text-align: center;">
              <p style="margin: 0; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; color: ${COLORS.muted};">
                <a href="https://aboo.st" style="color: ${COLORS.muted}; text-decoration: none;">Boost</a>
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

// =============================================================================
// RUN FAILED EMAIL
// =============================================================================

export interface RunFailedEmailData {
  to: string;
  runId: string;
}

/**
 * Send email when a run fails.
 * Fire-and-forget: errors are logged but don't throw.
 */
export async function sendRunFailedEmail(data: RunFailedEmailData): Promise<void> {
  try {
    const { to } = data;

    const resend = getResend();
    if (!resend) {
      console.warn('[Email] RESEND_API_KEY not set, skipping email');
      return;
    }
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "We hit a snag with your strategy",
      html: generateRunFailedHtml(),
    });

    console.log("[sendRunFailedEmail] Sent to:", to);
  } catch (error) {
    console.error("[sendRunFailedEmail] Failed:", error);
  }
}

function generateRunFailedHtml(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.cream}; font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.cream}; padding: 48px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px;">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" width="100%" style="border: 2px solid ${COLORS.foreground}; border-radius: 6px; background-color: #FFFFFF; box-shadow: ${SOFT_SHADOW};">
                <tr>
                  <td style="padding: 48px 40px 40px;">
                    <img src="https://aboo.st/logo.png" alt="Boost" width="120" height="28" style="display: block; margin: 0 0 32px; width: 120px; height: 28px;" />
                    <h1 style="margin: 0 0 16px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 28px; font-weight: 700; color: ${COLORS.foreground}; line-height: 1.2;">
                      We hit a snag.
                    </h1>
                    <p style="margin: 0 0 24px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 16px; line-height: 1.7; color: ${COLORS.muted};">
                      Something went wrong while generating your growth strategy. We're looking into it and will refund your credit automatically.
                    </p>
                    <p style="margin: 0 0 32px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 16px; line-height: 1.7; color: ${COLORS.muted};">
                      If you'd like to try again or have questions, just reply to this email.
                    </p>
                    <table cellpadding="0" cellspacing="0" style="border: 2px solid ${COLORS.foreground}; border-radius: 6px; box-shadow: ${SOFT_SHADOW};">
                      <tr>
                        <td style="background-color: ${COLORS.foreground}; border-radius: 4px;">
                          <a href="mailto:team@aboo.st" style="display: inline-block; padding: 16px 32px; color: #FFFFFF; text-decoration: none; font-family: 'Source Sans 3', -apple-system, sans-serif; font-weight: 700; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em;">
                            Contact Support
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 0; text-align: center;">
              <p style="margin: 0; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; color: ${COLORS.muted};">
                <a href="https://aboo.st" style="color: ${COLORS.muted}; text-decoration: none;">Boost</a>
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

// =============================================================================
// FREE AUDIT UPSELL EMAIL
// =============================================================================

export interface FreeAuditUpsellEmailData {
  to: string;
  freeAuditId: string;
}

/**
 * Send upsell email after free audit completes.
 * Fire-and-forget: errors are logged but don't throw.
 */
export async function sendFreeAuditUpsellEmail(
  data: FreeAuditUpsellEmailData
): Promise<void> {
  try {
    const { to, freeAuditId } = data;
    // Generate signed token for secure access to results
    const token = signAuditToken(freeAuditId);
    const freeResultsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/free-results/${freeAuditId}?token=${encodeURIComponent(token)}`;
    const upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/start`;

    const resend = getResend();
    if (!resend) {
      console.warn('[Email] RESEND_API_KEY not set, skipping email');
      return;
    }
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Liked your free audit? Here's the full picture",
      html: generateFreeAuditUpsellHtml({ freeResultsUrl, upgradeUrl }),
    });

    console.log("[sendFreeAuditUpsellEmail] Sent to:", to);
  } catch (error) {
    console.error("[sendFreeAuditUpsellEmail] Failed:", error);
  }
}

function generateFreeAuditUpsellHtml(data: {
  freeResultsUrl: string;
  upgradeUrl: string;
}): string {
  const { freeResultsUrl, upgradeUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.cream}; font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.cream}; padding: 48px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px;">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" width="100%" style="border: 2px solid ${COLORS.foreground}; border-radius: 6px; background-color: #FFFFFF; box-shadow: ${SOFT_SHADOW};">
                <tr>
                  <td style="padding: 48px 40px 40px;">
                    <img src="https://aboo.st/logo.png" alt="Boost" width="120" height="28" style="display: block; margin: 0 0 32px; width: 120px; height: 28px;" />
                    <h1 style="margin: 0 0 16px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 28px; font-weight: 700; color: ${COLORS.foreground}; line-height: 1.2;">
                      Want the full picture?
                    </h1>
                    <p style="margin: 0 0 24px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 16px; line-height: 1.7; color: ${COLORS.muted};">
                      Your <a href="${freeResultsUrl}" style="color: ${COLORS.cta}; text-decoration: none;">free audit</a> scratched the surface. The full growth strategy goes deeper:
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid ${COLORS.surface};">
                          <span style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; font-weight: 700; color: ${COLORS.cta};">01</span>
                          <span style="font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 15px; color: ${COLORS.foreground}; margin-left: 12px;">Deep competitive research with traffic data</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid ${COLORS.surface};">
                          <span style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; font-weight: 700; color: ${COLORS.cta};">02</span>
                          <span style="font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 15px; color: ${COLORS.foreground}; margin-left: 12px;">Specific tactics tailored to your situation</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <span style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; font-weight: 700; color: ${COLORS.cta};">03</span>
                          <span style="font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 15px; color: ${COLORS.foreground}; margin-left: 12px;">30-day roadmap with quick wins</span>
                        </td>
                      </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" style="border: 2px solid ${COLORS.foreground}; border-radius: 6px; box-shadow: ${SOFT_SHADOW};">
                      <tr>
                        <td style="background-color: ${COLORS.cta}; border-radius: 4px;">
                          <a href="${upgradeUrl}" style="display: inline-block; padding: 16px 32px; color: #FFFFFF; text-decoration: none; font-family: 'Source Sans 3', -apple-system, sans-serif; font-weight: 700; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em;">
                            Get Full Strategy — $29
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 0; text-align: center;">
              <p style="margin: 0; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; color: ${COLORS.muted};">
                <a href="https://aboo.st" style="color: ${COLORS.muted}; text-decoration: none;">Boost</a>
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

// =============================================================================
// ABANDONED CHECKOUT EMAIL (Cart Abandonment Recovery)
// =============================================================================

export interface AbandonedCheckoutEmailData {
  to: string;
  freeAuditId: string;
}

/**
 * Send cart abandonment recovery email with free audit results.
 * Sent when a Stripe checkout session expires.
 * Fire-and-forget: errors are logged but don't throw.
 */
export async function sendAbandonedCheckoutEmail(
  data: AbandonedCheckoutEmailData
): Promise<void> {
  try {
    const { to, freeAuditId } = data;
    // Generate signed token for secure access to results
    const token = signAuditToken(freeAuditId);
    const freeResultsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/free-results/${freeAuditId}?token=${encodeURIComponent(token)}`;
    const upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/start`;

    const resend = getResend();
    if (!resend) {
      console.warn('[Email] RESEND_API_KEY not set, skipping email');
      return;
    }
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "We saved something for you",
      html: generateAbandonedCheckoutHtml({ freeResultsUrl, upgradeUrl }),
    });

    console.log("[sendAbandonedCheckoutEmail] Sent to:", to);
  } catch (error) {
    console.error("[sendAbandonedCheckoutEmail] Failed:", error);
  }
}

function generateAbandonedCheckoutHtml(data: {
  freeResultsUrl: string;
  upgradeUrl: string;
}): string {
  const { freeResultsUrl, upgradeUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.cream}; font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.cream}; padding: 48px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px;">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" width="100%" style="border: 2px solid ${COLORS.foreground}; border-radius: 6px; background-color: #FFFFFF; box-shadow: ${SOFT_SHADOW};">
                <tr>
                  <td style="padding: 48px 40px 40px;">
                    <img src="https://aboo.st/logo.png" alt="Boost" width="120" height="28" style="display: block; margin: 0 0 32px; width: 120px; height: 28px;" />
                    <h1 style="margin: 0 0 16px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 28px; font-weight: 700; color: ${COLORS.foreground}; line-height: 1.2;">
                      We saved something for you.
                    </h1>
                    <p style="margin: 0 0 24px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 16px; line-height: 1.7; color: ${COLORS.muted};">
                      While you were deciding, we went ahead and did a quick analysis of your business. Consider it a preview of what we can do.
                    </p>
                    <p style="margin: 0 0 32px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 16px; line-height: 1.7; color: ${COLORS.muted};">
                      No strings attached. If you like what you see, the full strategy goes much deeper.
                    </p>

                    <!-- Primary CTA: View Free Audit -->
                    <table cellpadding="0" cellspacing="0" style="border: 2px solid ${COLORS.foreground}; border-radius: 6px; box-shadow: ${SOFT_SHADOW}; margin-bottom: 16px;">
                      <tr>
                        <td style="background-color: ${COLORS.cta}; border-radius: 4px;">
                          <a href="${freeResultsUrl}" style="display: inline-block; padding: 16px 32px; color: #FFFFFF; text-decoration: none; font-family: 'Source Sans 3', -apple-system, sans-serif; font-weight: 700; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em;">
                            View Your Free Audit
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Secondary link -->
                    <p style="margin: 0; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 14px; color: ${COLORS.muted};">
                      Ready for the full picture? <a href="${upgradeUrl}" style="color: ${COLORS.cta}; text-decoration: none; font-weight: 600;">Get your complete strategy for $29</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 0; text-align: center;">
              <p style="margin: 0; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; color: ${COLORS.muted};">
                <a href="https://aboo.st" style="color: ${COLORS.muted}; text-decoration: none;">Boost</a>
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

// =============================================================================
// FEEDBACK REQUEST EMAIL
// =============================================================================

export interface FeedbackRequestEmailData {
  to: string;
  runId: string;
}

/**
 * Send feedback request 48hrs after run completion.
 * Fire-and-forget: errors are logged but don't throw.
 */
export async function sendFeedbackRequestEmail(
  data: FeedbackRequestEmailData
): Promise<void> {
  try {
    const { to, runId } = data;
    const resultsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/results/${runId}`;
    // For MVP, link to mailto. Can replace with feedback form later.
    const feedbackUrl = `mailto:team@aboo.st?subject=Feedback on my growth strategy&body=Run ID: ${runId}%0A%0A`;

    const resend = getResend();
    if (!resend) {
      console.warn('[Email] RESEND_API_KEY not set, skipping email');
      return;
    }
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "How did we do?",
      html: generateFeedbackRequestHtml({ resultsUrl, feedbackUrl }),
    });

    console.log("[sendFeedbackRequestEmail] Sent to:", to);
  } catch (error) {
    console.error("[sendFeedbackRequestEmail] Failed:", error);
  }
}

function generateFeedbackRequestHtml(data: {
  resultsUrl: string;
  feedbackUrl: string;
}): string {
  const { resultsUrl, feedbackUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.cream}; font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.cream}; padding: 48px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px;">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" width="100%" style="border: 2px solid ${COLORS.foreground}; border-radius: 6px; background-color: #FFFFFF; box-shadow: ${SOFT_SHADOW};">
                <tr>
                  <td style="padding: 48px 40px 40px;">
                    <img src="https://aboo.st/logo.png" alt="Boost" width="120" height="28" style="display: block; margin: 0 0 32px; width: 120px; height: 28px;" />
                    <h1 style="margin: 0 0 16px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 28px; font-weight: 700; color: ${COLORS.foreground}; line-height: 1.2;">
                      How did we do?
                    </h1>
                    <p style="margin: 0 0 24px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 16px; line-height: 1.7; color: ${COLORS.muted};">
                      You received your <a href="${resultsUrl}" style="color: ${COLORS.cta}; text-decoration: none;">growth strategy</a> a couple days ago. We'd love to hear how it's working for you.
                    </p>
                    <p style="margin: 0 0 32px; font-family: 'Source Sans 3', -apple-system, sans-serif; font-size: 16px; line-height: 1.7; color: ${COLORS.muted};">
                      Your feedback helps us improve and means more than you know.
                    </p>
                    <table cellpadding="0" cellspacing="0" style="border: 2px solid ${COLORS.foreground}; border-radius: 6px; box-shadow: ${SOFT_SHADOW};">
                      <tr>
                        <td style="background-color: ${COLORS.cta}; border-radius: 4px;">
                          <a href="${feedbackUrl}" style="display: inline-block; padding: 16px 32px; color: #FFFFFF; text-decoration: none; font-family: 'Source Sans 3', -apple-system, sans-serif; font-weight: 700; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em;">
                            Leave Feedback
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 0; text-align: center;">
              <p style="margin: 0; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; color: ${COLORS.muted};">
                <a href="https://aboo.st" style="color: ${COLORS.muted}; text-decoration: none;">Boost</a>
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
