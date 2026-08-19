# MEDIA & ASSET MANAGEMENT

## Storage Philosophy
To ensure high-performance deployments, static files are separated from dynamic CMS uploads:
1. **Static Assets (In-Git)**: Saved under `/public`. Only design elements, structural icons, and fallback background images belong here.
2. **Dynamic Assets (Object Storage)**: CMS-uploaded business gallery images, news thumbnails, and investor documents belong in Object Storage (e.g., Cloudflare R2 or Supabase Storage). They must never be committed to Git.

---

## 1. Directory Structure for Static Assets
```text
public/
├── images/           # Editorial placeholder images
├── icons/            # Brand system iconography
├── logos/            # Rubinsons Group logos (light, dark, favicon)
└── fonts/            # Custom type face files if not using Google Fonts API
```

---

## 2. File Upload Pipeline & Validation
All uploads must trigger a server-side action verifying security constraints before dispatching to Cloudflare R2/Supabase Storage.

### Validation Constraints
* **Images (Business Galleries, Stories, Leadership)**:
  * Supported Types: `image/jpeg`, `image/png`, `image/webp`. WebP is preferred.
  * Maximum Size: `2MB`.
  * Dimensions: System forces auto-cropping or responsive resizing via Next.js `next/image`.
* **Documents (Investor Reports, Presentations)**:
  * Supported Types: `application/pdf`.
  * Maximum Size: `10MB`.

### Upload Security Logic
```typescript
// Example validation logic inside API route / Server Action
export async function uploadMedia(file: File, userId: string) {
  // 1. Check user authentication and roles
  const session = await getSession();
  if (!session || !hasRole(session.user.role, ['ADMIN', 'SUPER_ADMIN', 'INVESTOR_RELATIONS'])) {
    throw new Error("Unauthorized");
  }

  // 2. Validate MIME type and File Size
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Invalid file type");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File exceeds size limit");
  }

  // 3. Generate unique Key
  const fileExtension = file.name.split('.').pop();
  const fileKey = `uploads/${uuidv4()}.${fileExtension}`;

  // 4. Stream upload to R2 Bucket
  const url = await uploadToBucket(fileKey, file);

  // 5. Log Metadata in PostgreSQL
  await prisma.mediaAsset.create({
    data: { fileName: file.name, fileUrl: url, fileKey, mimeType: file.type, fileSize: file.size, uploaderId: userId }
  });

  return url;
}
```

---

## 3. Storage Deletion (Cascade Cleanup)
When a business, project, leadership profile, or investor document is deleted in the CMS, the underlying file in Cloudflare R2 must also be deleted using its saved `fileKey`. The CMS must not leave orphaned files in the object storage bucket.
