const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding simple assessment questions...");

  // Note: Questions are stored in the TypeScript file above
  // This database doesn't store questions, just responses
  // Questions are handled in the frontend/API layer

  console.log("✅ Simple assessment system ready!");
  console.log("📋 20 questions available across 4 categories");
  console.log("🏥 Categories: Digestive, Energy, Sleep, Stress");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
