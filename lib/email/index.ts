import { Resend } from "resend";
import { prisma } from "@/lib/db/client";

const resendApiKey = process.env.RESEND_API_KEY || "";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface InquiryPayload {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  organisation?: string | null;
  type: string;
  message: string;
}

export async function sendInquiryNotification(payload: InquiryPayload) {
  // A. Determine recipient emails from SiteSetting or fallback default
  let toEmails = ["admin@rubinsons.com"];
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "admin_emails" },
    });
    if (setting && setting.value) {
      toEmails = setting.value.split(",").map((e) => e.trim()).filter(Boolean);
    }
  } catch (error) {
    console.error("[Email Service] Database offline fetching recipient settings, using default admin email:", error);
  }

  const subject = `[New Corporate Inquiry] - ${payload.type} - From ${payload.name}`;

  // B. Construct premium HTML template
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Inquiry Notification</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #F8FAFC;
            color: #475569;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            background-color: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 4px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            margin: 0 auto;
          }
          .header {
            background-color: #0F172A;
            color: #FFFFFF;
            padding: 30px;
            border-bottom: 3px solid #C5A880;
          }
          .header h2 {
            font-family: 'Georgia', serif;
            font-weight: 500;
            font-size: 20px;
            margin: 0;
            color: #FFFFFF;
          }
          .header p {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 5px 0 0 0;
            color: #C5A880;
          }
          .content {
            padding: 35px;
          }
          .table-title {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #0F172A;
            font-weight: bold;
            border-bottom: 1px solid #E2E8F0;
            padding-bottom: 8px;
            margin: 0 0 15px 0;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .info-table td {
            padding: 8px 0;
            font-size: 13px;
            vertical-align: top;
          }
          .info-table td.label {
            font-weight: bold;
            color: #0F172A;
            width: 120px;
          }
          .message-box {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 4px;
            padding: 20px;
            font-size: 14px;
            line-height: 1.6;
            color: #1E293B;
            white-space: pre-wrap;
            margin-bottom: 35px;
          }
          .btn-container {
            text-align: center;
          }
          .btn {
            display: inline-block;
            background-color: #0F172A;
            color: #FFFFFF;
            border: 1px solid #0F172A;
            border-radius: 4px;
            padding: 12px 24px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            text-decoration: none;
            transition: background-color 0.2s;
          }
          .footer {
            background-color: #F8FAFC;
            border-t: 1px solid #E2E8F0;
            padding: 20px;
            text-align: center;
            font-size: 10px;
            color: #94A3B8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <p>Rubinsons Group Alert</p>
            <h2>New Corporate Inquiry</h2>
          </div>
          <div class="content">
            <div class="table-title">Lead Overview</div>
            <table class="info-table">
              <tr>
                <td class="label">Name:</td>
                <td>${payload.name}</td>
              </tr>
              <tr>
                <td class="label">Email:</td>
                <td><a href="mailto:${payload.email}" style="color: #9A7E56;">${payload.email}</a></td>
              </tr>
              <tr>
                <td class="label">Phone:</td>
                <td>${payload.phone || "N/A"}</td>
              </tr>
              <tr>
                <td class="label">Organization:</td>
                <td>${payload.organisation || "Individual"}</td>
              </tr>
              <tr>
                <td class="label">Type / Sector:</td>
                <td><span style="font-weight: 600; text-transform: uppercase; font-size: 11px; background-color: #F1F5F9; padding: 2px 6px; border-radius: 3px; border: 1px solid #E2E8F0;">${payload.type}</span></td>
              </tr>
            </table>

            <div class="table-title">Submitted Message</div>
            <div class="message-box">${payload.message}</div>

            <div class="btn-container">
              <a href="https://rubinsons.com/admin/inquiries" target="_blank" class="btn" style="color: #FFFFFF;">
                Open Inquiries Inbox
              </a>
            </div>
          </div>
          <div class="footer">
            &copy; 2026 Rubinsons Group Corporate Infrastructure. Private & Confidential.
          </div>
        </div>
      </body>
    </html>
  `;

  // C. Send alert via Resend or fall back to stdout logging
  if (resend && toEmails.length > 0) {
    try {
      const response = await resend.emails.send({
        from: "Rubinsons Notifications <system@rubinsons.com>",
        to: toEmails,
        subject,
        html: emailHtml,
      });

      if (response.error) {
        console.error("[Email Service] Resend API error details:", response.error);
        return { success: false, error: response.error.message };
      }

      console.log(`[Email Service] Notification sent successfully via Resend. Recipients: ${toEmails.join(", ")}`);
      return { success: true };
    } catch (error) {
      console.error("[Email Service] Resend sending exception:", error);
      return { success: false, error: "Resend client execution failed." };
    }
  }

  // Sandbox Sandbox Log Fallback
  console.log("=================================================================");
  console.log("=== [EMAIL NOTIFICATION SANDBOX FALLBACK] ===");
  console.log(`Date Logged: ${new Date().toISOString()}`);
  console.log(`To Recipients: ${toEmails.join(", ")}`);
  console.log(`Subject: ${subject}`);
  console.log("--- Content Payload ---");
  console.log(`Name: ${payload.name}`);
  console.log(`Email: ${payload.email}`);
  console.log(`Phone: ${payload.phone || "N/A"}`);
  console.log(`Organization: ${payload.organisation || "Individual"}`);
  console.log(`Type: ${payload.type}`);
  console.log(`Message:\n${payload.message}`);
  console.log("=================================================================");

  return { success: true, sandbox: true };
}
