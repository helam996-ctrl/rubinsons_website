# DATABASE SCHEMA & MODELS

## Schema Design Principles
The database is built on PostgreSQL using Prisma ORM. It stores admin authentication profiles, corporate content, investor materials, inquiries, and chatbot configurations.

---

## Prisma Models Spec

### User & Roles
```prisma
enum Role {
  SUPER_ADMIN
  ADMIN
  EDITOR
  INVESTOR_RELATIONS
  INVESTOR
}

model User {
  id            String        @id @default(uuid())
  email         String        @unique
  name          String?
  role          Role          @default(INVESTOR)
  isActive      Boolean       @default(true)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  assignedInqs  Inquiry[]     @relation("AssignedToUser")
  inquiryNotes  InquiryNote[]
  mediaAssets   MediaAsset[]
}
```

### Business Divisions & Projects
```prisma
enum BusinessStatus {
  ACTIVE
  PLANNED
}

model Business {
  id                  String         @id @default(uuid())
  slug                String         @unique
  title               String
  shortDescription    String
  detailedDescription String         @db.Text
  businessHead        String?
  imageUrl            String?
  galleryUrls         String[]       // Array of image paths/URLs
  status              BusinessStatus @default(ACTIVE)
  order               Int            @default(0)
  seoTitle            String?
  seoDescription      String?
  projects            Project[]
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt
}

model Project {
  id          String    @id @default(uuid())
  businessId  String
  business    Business  @relation(fields: [businessId], references: [id], onDelete: Cascade)
  title       String
  slug        String    @unique
  description String    @db.Text
  imageUrl    String?
  status      String    @default("ACTIVE") // ACTIVE, COMPLETED, FUTURE
  order       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Leadership & Stories
```prisma
model Leadership {
  id        String   @id @default(uuid())
  name      String
  role      String
  biography String?  @db.Text
  imageUrl  String?
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Story {
  id             String    @id @default(uuid())
  title          String
  slug           String    @unique
  content        String    @db.Text
  category       String    // e.g., Corporate, CSR, Press Release
  imageUrl       String?
  status         String    @default("DRAFT") // DRAFT, PUBLISHED
  seoTitle       String?
  seoDescription String?
  publishedAt    DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

### Investor Experience & Files
```prisma
model InvestorDocument {
  id          String   @id @default(uuid())
  title       String
  category    String   // Annual Report, Presentation, Corporate Profile, Governance
  fileUrl     String
  fileKey     String   // Storage identifier for deletion
  fileSize    Int
  isPrivate   Boolean  @default(true)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model MediaAsset {
  id          String   @id @default(uuid())
  fileName    String
  fileUrl     String
  fileKey     String   @unique
  mimeType    String
  fileSize    Int
  uploaderId  String
  uploader    User     @relation(fields: [uploaderId], references: [id])
  createdAt   DateTime @default(now())
}
```

### Inquiries & Notes
```prisma
enum InquiryStatus {
  NEW
  CONTACTED
  IN_PROGRESS
  CLOSED
  SPAM
}

enum InquirySource {
  FORM
  CHATBOT
}

model Inquiry {
  id             String         @id @default(uuid())
  name           String
  email          String
  phone          String?
  organisation   String?
  type           String         @default("GENERAL") // GENERAL, INVESTOR, CAREER, business slugs
  message        String         @db.Text
  source         InquirySource  @default(FORM)
  conversationId String?        @unique
  conversation   Conversation?  @relation(fields: [conversationId], references: [id], onDelete: SetNull)
  status         InquiryStatus  @default(NEW)
  assignedToId   String?
  assignedTo     User?          @relation("AssignedToUser", fields: [assignedToId], references: [id])
  internalNotes  InquiryNote[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}

model InquiryNote {
  id        String   @id @default(uuid())
  inquiryId String
  inquiry   Inquiry  @relation(fields: [inquiryId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  content   String   @db.Text
  createdAt DateTime @default(now())
}
```

### Chatbot System
```prisma
model ChatbotIntent {
  id               String               @id @default(uuid())
  name             String               @unique // e.g. INVESTOR, HEALTHCARE
  description      String?
  responseGuidance String               @db.Text
  priority         Int                  @default(0)
  enabled          Boolean              @default(true)
  destinationUrl   String?
  optionalCtaText  String?
  keywords         ChatbotKeyword[]
  quickActions     ChatbotQuickAction[]
  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt
}

model ChatbotKeyword {
  id        String        @id @default(uuid())
  intentId  String
  intent    ChatbotIntent @relation(fields: [intentId], references: [id], onDelete: Cascade)
  keyword   String
  isExact   Boolean       @default(false)
  createdAt DateTime      @default(now())

  @@unique([intentId, keyword])
}

model ChatbotQuickAction {
  id        String        @id @default(uuid())
  intentId  String
  intent    ChatbotIntent @relation(fields: [intentId], references: [id], onDelete: Cascade)
  label     String
  promptText String
  order     Int           @default(0)
  createdAt DateTime      @default(now())
}

model Conversation {
  id            String        @id @default(uuid())
  sessionId     String        @unique
  status        String        @default("ACTIVE") // ACTIVE, CLOSED
  startedAt     DateTime      @default(now())
  lastMessageAt DateTime      @updatedAt
  messages      Message[]
  inquiry       Inquiry?
}

enum SenderType {
  USER
  BOT
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender         SenderType
  content        String       @db.Text
  intentId       String?      // Links message to detected intent if applicable
  createdAt      DateTime     @default(now())
}

model SiteSetting {
  id          String   @id @default(uuid())
  key         String   @unique
  value       String   @db.Text
  description String?
  updatedAt   DateTime @updatedAt
}
```
