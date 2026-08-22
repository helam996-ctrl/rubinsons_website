import "dotenv/config";
import prisma from "../lib/db/client";

async function main() {
  console.log("Seeding database...");

  // 1. Create a Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@rubinsons.com" },
    update: {},
    create: {
      email: "admin@rubinsons.com",
      name: "Rubinsons Admin",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log(`Upserted Super Admin: ${superAdmin.email}`);

  const developerAdmin = await prisma.user.upsert({
    where: { email: "helam996@gmail.com" },
    update: { role: "SUPER_ADMIN", isActive: true },
    create: {
      email: "helam996@gmail.com",
      name: "Developer Admin",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log(`Upserted Developer Admin: ${developerAdmin.email}`);

  // 2. Create Business Divisions (Verified only)
  const businesses = [
    {
      slug: "builders-infrastructure",
      title: "Rubinsons Builders & Infrastructure",
      shortDescription: "Civil construction, engineering, land development, residential and commercial infrastructure.",
      detailedDescription: "Rubinsons Builders & Infrastructure focuses on executing major civil construction works, infrastructure development, real estate ventures, and land engineering projects with a dedication to safety and quality across India.",
      businessHead: "Information to be updated via CMS",
      status: "ACTIVE" as const,
      order: 1,
    },
    {
      slug: "contracting",
      title: "Rubinsons Contracting",
      shortDescription: "Private and public sector contracting services, procurement, and project execution.",
      detailedDescription: "Rubinsons Contracting delivers specialized contracting services for commercial developments, municipal infrastructure projects, procurement workflows, and technical construction execution.",
      businessHead: "Information to be updated via CMS",
      status: "ACTIVE" as const,
      order: 2,
    },
    {
      slug: "ich-dine-academia",
      title: "ICH Dine Academia",
      shortDescription: "Education, skill development, hospitality training, vocational programs, and professional events.",
      detailedDescription: "ICH Dine Academia is an education and events venture dedicated to professional skill development, culinary training, hospitality vocational tracks, and corporate event management.",
      businessHead: "Information to be updated via CMS",
      status: "ACTIVE" as const,
      order: 3,
    },
    {
      slug: "healthcare",
      title: "Healthcare / Shanti Medical Hall",
      shortDescription: "Distribution of medical supplies, retail pharmaceuticals, and healthcare consulting.",
      detailedDescription: "Operating under the Shanti Medical Hall lineage, this division delivers pharmaceutical supplies, healthcare logistics, and retail dispensing, with plans for expanded diagnostic clinics and wellness centers.",
      businessHead: "Information to be updated via CMS",
      status: "ACTIVE" as const,
      order: 4,
    },
    {
      slug: "digital-media-marketing",
      title: "Rubinsons Digital Media & Marketing",
      shortDescription: "Digital advertising, consulting, brand strategy, e-commerce support, and media creation.",
      detailedDescription: "Rubinsons Digital Media & Marketing provides digital consulting, creative campaigns, e-commerce optimization, video/text asset creation, and brand strategy positioning for corporate growth.",
      businessHead: "Information to be updated via CMS",
      status: "ACTIVE" as const,
      order: 5,
    },
  ];

  for (const b of businesses) {
    const record = await prisma.business.upsert({
      where: { slug: b.slug },
      update: {
        title: b.title,
        shortDescription: b.shortDescription,
        detailedDescription: b.detailedDescription,
        order: b.order,
      },
      create: b,
    });
    console.log(`Upserted Business: ${record.title}`);
  }

  // 3. Create Leadership Profiles (Verified only)
  const leaders = [
    { name: "Dr. Rudra Bhanu", role: "Managing Director", order: 1 },
    { name: "Bindu Sharma", role: "Director", order: 2 },
    { name: "Shreyashi Sharma", role: "Director", order: 3 },
    { name: "Nipun Sharma", role: "Director", order: 4 },
    { name: "Stuti Sharma", role: "Director", order: 5 },
  ];

  for (const l of leaders) {
    const existing = await prisma.leadership.findFirst({ where: { name: l.name } });
    if (!existing) {
      const record = await prisma.leadership.create({
        data: {
          name: l.name,
          role: l.role,
          biography: "Biography details to be loaded via CMS.",
          order: l.order,
        },
      });
      console.log(`Created Leader: ${record.name}`);
    } else {
      await prisma.leadership.update({
        where: { id: existing.id },
        data: { role: l.role, order: l.order },
      });
      console.log(`Updated Leader: ${existing.name}`);
    }
  }

  // 4. Create Chatbot Intents
  const intents = [
    {
      name: "INVESTOR",
      description: "Handles inquiries about investment, partnerships, and group strategy.",
      responseGuidance: "Provide guidance on the Rubinsons investment philosophy. Prompt user to visit the /investors page or submit an investor inquiry form. Under no circumstances quote return metrics or valuation.",
      priority: 10,
      keywords: ["invest", "investment", "funding", "shares", "equity", "partnership"],
    },
    {
      name: "BUSINESS",
      description: "Handles requests for sector details and dynamic business offerings.",
      responseGuidance: "Explain the active sectors of Rubinsons: Builders & Infrastructure, Contracting, ICH Dine Academia, Healthcare, and Digital Media. Guide user to browse sector-specific pages.",
      priority: 8,
      keywords: ["builders", "construction", "contracting", "dine", "academia", "healthcare", "shanti", "digital"],
    },
    {
      name: "LEADERSHIP",
      description: "Explains board members, Managing Director, and directors structure.",
      responseGuidance: "State the leadership team: Dr. Rudra Bhanu (Managing Director), Bindu Sharma, Shreyashi Sharma, Nipun Sharma, and Stuti Sharma (Directors). Avoid inventing biographies.",
      priority: 6,
      keywords: ["director", "board", "bhanu", "rudra bhanu", "sharma", "governance", "management"],
    },
    {
      name: "IMPACT",
      description: "Explains CSR work and the independent Rudra Vahini Foundation.",
      responseGuidance: "Introduce the Rudra Vahini Foundation as an independent social impact organization focused on rural education, community welfare, and skill empowerment. Emphasize it is not a commercial division.",
      priority: 7,
      keywords: ["foundation", "rudra vahini", "charity", "social", "welfare", "csr", "ngo"],
    },
    {
      name: "CONTACT",
      description: "Routes users to support channels and recruitment pipelines.",
      responseGuidance: "Provide links to submit a public inquiry or contact the administration team. Mention email contact points and WhatsApp Click-to-Chat shortcuts.",
      priority: 5,
      keywords: ["contact", "job", "apply", "careers", "email", "phone", "office", "location", "address"],
    },
  ];

  for (const i of intents) {
    const record = await prisma.chatbotIntent.upsert({
      where: { name: i.name },
      update: {
        description: i.description,
        responseGuidance: i.responseGuidance,
        priority: i.priority,
      },
      create: {
        name: i.name,
        description: i.description,
        responseGuidance: i.responseGuidance,
        priority: i.priority,
      },
    });

    console.log(`Upserted ChatbotIntent: ${record.name}`);

    // Create/update keywords
    for (const kw of i.keywords) {
      await prisma.chatbotKeyword.upsert({
        where: {
          intentId_keyword: {
            intentId: record.id,
            keyword: kw,
          },
        },
        update: {},
        create: {
          intentId: record.id,
          keyword: kw,
          isExact: false,
        },
      });
    }
  }

  // 5. Default Site Settings
  const settings = [
    { key: "site_name", value: "Rubinsons Group", description: "Global title of the corporate portal" },
    { key: "contact_email", value: "contact@rubinsons.com", description: "Main public contact inbox" },
    { key: "admin_emails", value: "admin@rubinsons.com", description: "Comma-separated list of administrative emails for alerts" },
    { key: "whatsapp_number", value: "919999999999", description: "WhatsApp Business target contact number (including country code)" },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
    console.log(`Upserted SiteSetting: ${s.key}`);
  }

  console.log("Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
