# INQUIRY MANAGEMENT SYSTEM

## Submission Lifecycle Flow
Inquiries represent the primary conversion action of the digital platform. All inquiries must be securely routed, logged, and tracked:

```text
       Submission Source (Form / Chatbot Widget)
                         │
                 Validate Inputs
            (Name, Email, Message, Captcha)
                         │
               Insert DB Record (NEW)
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
      Trigger Admin Email       Update CMS Dashboard
      (Resend Integration)      (Real-time notification)
                                      │
                                Admin reviews inbox
                                      │
                         Action: Click-to-WhatsApp/Email
                                      │
                           Update Status to CLOSED
```

---

## 1. Inquiry Database Fields
All form and chatbot inputs map to the `Inquiry` table. The backend enforces strict validation before DB inserts:
* `name`: Required, max 100 characters.
* `email`: Required, must pass email regex validation.
* `phone`: Optional, formats validated against standard international/Indian digits.
* `organisation`: Optional, text string.
* `type`: Categorized on submission (`GENERAL`, `INVESTOR`, `BUILDERS`, `CONTRACTING`, `ACADEMIA`, `HEALTHCARE`, `DIGITAL`).
* `message`: Required, min 10, max 2000 characters.
* `source`: Enforces enum `FORM` or `CHATBOT`.
* `conversationId`: Linked if submission originated in a chatbot session.

---

## 2. Notification Dispatch (Resend Integration)
On successful DB insert, the server-side service (`lib/email/index.ts`) dispatches an email:
* **Sender**: `Rubinsons Notifications <system@rubinsons.com>` (verified domain).
* **Receiver**: Configured administrators in `SiteSetting` (e.g. `admin@rubinsons.com`).
* **Subject**: `[New Corporate Inquiry] - ${type} - From ${name}`
* **Template Content**:
  * Submitter Name & Email.
  * Phone Number & Organization (if provided).
  * Inquiry Message text.
  * Direct Link to the CMS management page: `https://rubinsons.com/admin/inquiries/${id}`.

---

## 3. Communication Actions (Email & WhatsApp)
To allow administrators to reply instantly, the CMS inquiry drawer provides two custom trigger anchors:

### Email Direct Action
* **Anchor URL**: `mailto:${email}?subject=Re: Rubinsons Group Inquiry&body=Dear ${name},%0D%0A%0D%0AThank you for contacting Rubinsons Group.`

### WhatsApp Click-to-Chat Action
* **Anchor URL**: `https://wa.me/${cleanedPhoneNumber}?text=${prefilledMessage}`
* **Cleaned Phone Number Rules**: Strip all non-numeric characters. For Indian phone numbers, prepend country code `91` if not present.
* **Prefilled Message Template**:
  ```text
  Hello [Name], this is [AdminName] from Rubinsons Group. We received your inquiry regarding [Type]: "[ShortMessage]". We would like to follow up on your request.
  ```
  *(All text must be properly URL-encoded).*
