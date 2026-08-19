# ANALYTICS & EVENT TRACKING

## Implementation Strategy
General web activity tracking uses Google Analytics 4 (GA4), while business-specific operations are logged in the PostgreSQL database for admin dashboard display.

---

## 1. Google Analytics 4 Setup
* GA4 Tracking ID (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) must be injected into the root layout via a script wrapper.
* Disable analytics collection on the `/admin` paths to keep administrative interactions from skewing public visitor counts.

---

## 2. Event Tracking Taxonomy
The following custom events must be logged to GA4:

| Event Name | Trigger Condition | Parameters Captured |
| :--- | :--- | :--- |
| `investor_cta_click` | Clicking "Explore Investors" or "Request Information" buttons | `location` (Header, Hero, Footer) |
| `investor_document_download` | User downloading a file from `/investors` or `/investor-portal` | `document_title`, `category`, `is_private` |
| `investor_enquiry_submitted` | Submitting the inquiry form with type `INVESTOR` | `form_id`, `method` (Form, Chatbot) |
| `contact_enquiry_submitted` | Submitting the general contact form | `form_id`, `type` |
| `business_viewed` | Page view on `/businesses/[slug]` | `business_slug`, `business_title` |
| `chatbot_opened` | User clicking the floating chatbot widget to open chat panel | `initial_state` |
| `chatbot_enquiry_created` | Chatbot conversation successfully transition to structured inquiry | `conversation_id`, `intent` |
| `investor_portal_login` | Successful authentication onto `/investor-portal` | `user_id` (hashed) |

---

## 3. Administrative DB Analytics
The `/admin` dashboard displays aggregates compiled from real-time database tables:
* **Chatbot KPI Queries**:
  * *Total Conversations*: `prisma.conversation.count()`
  * *Inquiry Conversion*: Count of inquiries with `source = CHATBOT` divided by total conversations.
  * *Intent Distribution*: Group by `intentId` on `Message` table.
  * *Keyword Trigger Hits*: Logging keywords matches during message processing.
* **Inquiry KPIs**:
  * Monthly chart of inquiries categorized by status (`NEW`, `CONTACTED`, `IN_PROGRESS`, `CLOSED`).
