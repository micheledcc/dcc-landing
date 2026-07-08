import { google } from "googleapis";

function getAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google OAuth credentials not set");
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

export async function sendVerificationCode(
  to: string,
  code: string,
  linkLabel: string
) {
  const gmail = google.gmail({ version: "v1", auth: getAuth() });

  const subject = `${code} is your DCC verification code`;
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 0;">
      <div style="border-bottom: 1px solid #e5e2db; padding-bottom: 24px; margin-bottom: 32px;">
        <span style="font-family: monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.04em; border: 1px solid #17191c; padding: 6px 8px;">DCC</span>
        <span style="font-family: monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #3a3d42; margin-left: 12px;">Digital Collateral Corporation</span>
      </div>

      <p style="font-size: 15px; color: #41454b; line-height: 1.6; margin: 0 0 24px;">
        You've been invited to view <strong style="color: #17191c;">${linkLabel}</strong>. Enter the code below to access the data.
      </p>

      <div style="background: #f3efe7; padding: 24px; text-align: center; margin: 0 0 24px;">
        <div style="font-family: monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #8a6d40; margin-bottom: 8px;">Verification code</div>
        <div style="font-family: monospace; font-size: 36px; font-weight: 600; letter-spacing: 0.2em; color: #17191c;">${code}</div>
      </div>

      <p style="font-size: 13px; color: #5d6168; line-height: 1.5; margin: 0 0 8px;">
        This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.
      </p>

      <div style="border-top: 1px solid #e5e2db; margin-top: 32px; padding-top: 20px;">
        <p style="font-family: monospace; font-size: 10px; color: #b9b2a4; letter-spacing: 0.04em; margin: 0;">
          Digital Collateral Corporation &middot; Confidential
        </p>
      </div>
    </div>
  `;

  const from = "Digital Collateral Corporation <noreply@digitalcollateralcorporation.com>";

  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    html,
  ].join("\r\n");

  const encoded = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encoded },
  });
}
