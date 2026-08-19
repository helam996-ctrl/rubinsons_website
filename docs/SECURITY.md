# SECURITY SPECIFICATIONS

## Core Security Stance
Role configurations, document assets, and dynamic APIs must enforce absolute server-side security. No trust is given to checks run solely within browser layouts.

---

## 1. Environment Variables & Secrets
All sensitive configuration variables must live in `.env` (locally) or platform variables (production) and must never be committed to Git:
* `DATABASE_URL`: PostgreSQL connection string.
* `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials.
* `NEXTAUTH_SECRET`: Used to encrypt sessions.
* `RESEND_API_KEY`: API key for transaction emails.
* `STORAGE_BUCKET_NAME`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`: Credentials for R2/Supabase.
* `LLM_API_KEY`: API keys for the corporate chatbot model.

*Strict Rule*: Do not prefix API keys with `NEXT_PUBLIC_` unless they are explicitly safe for browser inspection (e.g. Google Analytics ID).

---

## 2. Private Document Access Control
Confidential investor files must remain private in storage. They must not use public URLs.

### Proxy Endpoint Flow
1. Files in Object Storage are saved in a private bucket (`isPrivate = true` in DB).
2. Public downloads are blocked at the storage bucket policy level.
3. Access is mediated by a Next.js route handler (`app/api/documents/[id]/route.ts`):
   ```typescript
   export async function GET(req: Request, { params }: { params: { id: string } }) {
     // A. Verify Session
     const session = await getServerSession(authOptions);
     if (!session || !session.user) {
       return new Response("Unauthorized", { status: 401 });
     }

     // B. Fetch Document Metadata
     const doc = await prisma.investorDocument.findUnique({ where: { id: params.id } });
     if (!doc) return new Response("Not Found", { status: 404 });

     // C. Check authorization if file is private
     if (doc.isPrivate && !hasRole(session.user.role, ['INVESTOR', 'ADMIN', 'SUPER_ADMIN', 'INVESTOR_RELATIONS'])) {
       return new Response("Forbidden", { status: 403 });
     }

     // D. Generate Signed URL or stream directly from S3 client
     const fileStream = await streamFromBucket(doc.fileKey);
     return new Response(fileStream, {
       headers: {
         "Content-Type": "application/pdf",
         "Content-Disposition": `attachment; filename="${doc.title}.pdf"`
       }
     });
   }
   ```

---

## 3. Rate Limiting & Spam Protection
* **Public APIs**: Apply rate limiting to endpoints `/api/chatbot` and `/api/inquiry` (e.g., maximum 5 requests per minute per IP using Upstash Redis or memory-cache middleware).
* **Form Honeypot**: Add a visually hidden text input (`<input type="text" name="b_phone" style="display:none">`) to public forms. If populated on submission, silently drop the inquiry as spam.

---

## 4. Input Validation & Content Sanitization
* Validate all incoming request payloads using **Zod** schema parser. Reject malformed payloads immediately.
* Sanitize all Rich Text inputs saved via CMS to remove malicious scripting blocks (`<script>`, inline SVG events) before saving or rendering them (using a library like `isomorphic-dompurify`).
