import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const bucketName = process.env.STORAGE_BUCKET_NAME || "";
const accessKey = process.env.STORAGE_ACCESS_KEY || "";
const secretKey = process.env.STORAGE_SECRET_KEY || "";
const endpoint = process.env.STORAGE_ENDPOINT || "";
const region = process.env.STORAGE_REGION || "us-east-1";

const isS3Configured = !!(bucketName && accessKey && secretKey);

let s3Client: S3Client | null = null;
if (isS3Configured) {
  s3Client = new S3Client({
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    region,
    endpoint: endpoint || undefined,
    forcePathStyle: endpoint ? true : false, // Required for R2/MinIO
  });
}

// Local Storage directories
const PROJECT_ROOT = process.cwd();
const LOCAL_PUBLIC_DIR = path.join(PROJECT_ROOT, "public", "uploads");
const LOCAL_PRIVATE_DIR = path.join(PROJECT_ROOT, "storage", "uploads");

// Helper to ensure directories exist
function ensureLocalDirsExist() {
  if (!fs.existsSync(LOCAL_PUBLIC_DIR)) {
    fs.mkdirSync(LOCAL_PUBLIC_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_PRIVATE_DIR)) {
    fs.mkdirSync(LOCAL_PRIVATE_DIR, { recursive: true });
  }
}

/**
 * Uploads a file to S3/R2 or local storage fallback.
 * @returns The fileUrl to be stored in the database.
 */
export async function uploadToBucket(
  fileKey: string,
  fileBuffer: Buffer,
  mimeType: string,
  isPrivate: boolean = true
): Promise<string> {
  const cleanKey = fileKey.replace(/\\/g, "/"); // normalize paths
  const filename = path.basename(cleanKey);

  if (isS3Configured && s3Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: cleanKey,
        Body: fileBuffer,
        ContentType: mimeType,
      });
      await s3Client.send(command);
      
      // Construct S3 URL
      if (endpoint) {
        // e.g., Cloudflare R2 custom domain or public endpoint
        return `${endpoint.replace(/\/$/, "")}/${bucketName}/${cleanKey}`;
      }
      return `https://${bucketName}.s3.${region}.amazonaws.com/${cleanKey}`;
    } catch (error) {
      console.error("Failed to upload to S3. Falling back to local storage.", error);
    }
  }

  // Local Storage Fallback
  ensureLocalDirsExist();
  const targetDir = isPrivate ? LOCAL_PRIVATE_DIR : LOCAL_PUBLIC_DIR;
  const targetPath = path.join(targetDir, filename);

  fs.writeFileSync(targetPath, fileBuffer);

  // Return public URL if not private, else local filepath tracker or proxy url template
  if (!isPrivate) {
    return `/uploads/${filename}`;
  }
  return `/api/documents/local-file/${filename}`; // Placeholder proxy indicator
}

/**
 * Streams/reads a file from S3/R2 or local storage fallback.
 */
export async function streamFromBucket(
  fileKey: string
): Promise<Buffer> {
  const cleanKey = fileKey.replace(/\\/g, "/");
  const filename = path.basename(cleanKey);

  if (isS3Configured && s3Client) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: cleanKey,
      });
      const response = await s3Client.send(command);
      if (response.Body) {
        const byteArray = await response.Body.transformToByteArray();
        return Buffer.from(byteArray);
      }
    } catch (error) {
      console.error("Failed to retrieve file from S3. Trying local filesystem.", error);
    }
  }

  // Local Storage Fallback: check private, then public
  const privatePath = path.join(LOCAL_PRIVATE_DIR, filename);
  const publicPath = path.join(LOCAL_PUBLIC_DIR, filename);

  if (fs.existsSync(privatePath)) {
    return fs.readFileSync(privatePath);
  } else if (fs.existsSync(publicPath)) {
    return fs.readFileSync(publicPath);
  }

  throw new Error(`File not found locally or in cloud storage: ${filename}`);
}

/**
 * Deletes a file from S3/R2 or local storage fallback.
 */
export async function deleteFromBucket(
  fileKey: string
): Promise<void> {
  const cleanKey = fileKey.replace(/\\/g, "/");
  const filename = path.basename(cleanKey);

  if (isS3Configured && s3Client) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: cleanKey,
      });
      await s3Client.send(command);
      return;
    } catch (error) {
      console.error("Failed to delete from S3. Trying local filesystem.", error);
    }
  }

  // Local Storage Fallback
  const privatePath = path.join(LOCAL_PRIVATE_DIR, filename);
  const publicPath = path.join(LOCAL_PUBLIC_DIR, filename);

  if (fs.existsSync(privatePath)) {
    fs.unlinkSync(privatePath);
  }
  if (fs.existsSync(publicPath)) {
    fs.unlinkSync(publicPath);
  }
}
