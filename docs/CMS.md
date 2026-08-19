# CUSTOM CMS SPECIFICATIONS

## Route & Portal Security
* **Path**: `/admin` (all sub-paths require authenticated access).
* **Security constraint**: Only active accounts with roles `SUPER_ADMIN`, `ADMIN`, `EDITOR`, or `INVESTOR_RELATIONS` are authorized. Access is validated server-side on every route and server action request.
* **Layout**: Collapsible left navigation sidebar, top stats bar, main container with scrollable table/forms.

---

## 1. CMS Dashboard Metrics
* **Total Enquiries**: Real-time count of active inquiries in database.
* **Unresolved Enquiries**: Inquiries where `status` is `NEW` or `IN_PROGRESS`.
* **Investor Conversations**: Total chatbot sessions matching detected investor intent.
* **Recent Submissions**: Dynamic list of the latest 5 incoming inquiries with quick links to response threads.
* **System Log Status**: Displaying total count of documents, active business divisions, and chatbot fallback rates.
* *No Fabricated Data*: Charts and count indicators must be bound strictly to dynamic database aggregates.

---

## 2. Content Sections CRUD Specifications

### Business Divisions & Projects
* **Fields**: Title, Slug (auto-generated, editable), Short Description (character-capped), Detailed Description (rich text editor), Business Head Name, Main Image, Gallery, Status (Active/Planned), Order (sorting weight), SEO metadata (Title, Description).
* **Actions**: Add business, Edit details, Delete (warning: cascade blocks to projects), Re-order weight.

### Leadership Profiles
* **Fields**: Full Name, Role Title, Biography (text area), Image Asset, Order weight.
* **Actions**: Add profile, Edit profile, Delete, Drag/drop weight sorting.

### Stories & Corporate Updates
* **Fields**: Title, Slug, Category (Corporate, Press Release, CSR), Content (Rich Text), Image, Status (Draft, Published), SEO tags, Publication Date.
* **Actions**: CRUD support with filters by Category and Status.

---

## 3. Investor Documents & Files
* **Fields**: Title, Category (Annual Report, Presentation, Financial statement), File upload (triggers object storage pipeline), File Size, Privacy Level (Public / Authenticated-Only), Order.
* **Actions**: PDF File uploader, visibility toggles, categorization dropdowns.

---

## 4. Inquiry Inbox & Communication Hub
* **Components**: Filter toolbar (Status, Type, Date range), Search bar (matches Name, Email, Content).
* **Interaction Drawer**:
  * View details: Shows complete message, date, and source session.
  * Update status dropdown: `NEW`, `CONTACTED`, `IN_PROGRESS`, `CLOSED`, `SPAM`.
  * Assign dropdown: Assigns responsibility to a database Admin User.
  * Notes interface: Rich internal text notes, appending log messages.
  * Actions: Quick click-to-email and click-to-WhatsApp (prefilled templates).

---

## 5. AI Chatbot Tuning panel
* **Intent List**: Table showing intents, description, priority, enabled/disabled state, and CTAs.
* **Intent Editor**:
  * Text area: Prompt Guidance additions (tells the bot how to frame answers).
  * Keyword chip selector: Add/remove keywords associated with intent.
  * Quick questions: List of questions shown to users triggering this intent.
* **Fallback Config**: Edit fallback prompts and automated escalation thresholds.
