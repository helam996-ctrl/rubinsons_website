# AUTHENTICATION & AUTHORIZATION

## Framework & Protocol
* **Provider**: Google OAuth 2.0.
* **Library**: NextAuth.js (or direct Next.js Route Handlers using standard OAuth tokens).
* **Session Storage**: Secure, HTTP-only, encrypted session cookie storing JWT payload.

---

## 1. Database-Backed Role System
Authentication is separate from authorization. Simply possessing a Google account does not grant administrative privileges.

### Role Definitions
1. **SUPER_ADMIN**: Full system control. Can add other admin users and modify chatbot system configurations.
2. **ADMIN**: Full CRUD rights over content, leadership, news, and inquiries. Cannot manage other users' permissions.
3. **EDITOR**: Write and edit rights on business descriptions and stories. Cannot delete records or view inquiries.
4. **INVESTOR_RELATIONS**: Access to inquiries inbox and investor document uploads. No CMS edit rights over core business structure.
5. **INVESTOR**: Public credentials granted to verified external stakeholders. Authorized to view private files in `/investor-portal`.

---

## 2. Onboarding Workflow
```text
                  User clicks "Sign in with Google"
                                  │
                       Authenticate with Google
                                  │
                  Find email in DB `User` table?
                    ┌─────────────┴─────────────┐
                   Yes                          No
                    │                            │
            Is User.isActive?           Create new User in DB
            ┌───────┴───────┐           with role = INVESTOR
           Yes              No          and status = ACTIVE
            │               │                    │
      Grant Session   Deny Session         Grant Session
      with DB Role    Redirect to Error    Redirect to /investor-portal
```

---

## 3. Server-Side Protection Rules
Admin routes and functions must be explicitly protected. Do not rely on client-side state checks.

### Page Routes & Middleware
* Next.js Middleware checks requests to `/admin/:path*`.
* If no session exists or user role is `INVESTOR`, redirect to `/login` or `/unauthorized`.

### Server Actions & API Route Protection
* Every Server Action or API handler must fetch the active session using the server utility (e.g. `getServerSession`).
* Check the user's role against the required permissions:
  ```typescript
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !hasPermission(session.user.role, 'WRITE_CONTENT')) {
    throw new Error("Unauthorized action");
  }
  ```
* Reject invalid requests immediately with a `403 Forbidden` response.
