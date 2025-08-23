const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function analyzeRedundancy() {
  try {
    const template = await prisma.assessmentTemplate.findFirst({
      where: { id: "default" },
    });

    if (!template) {
      console.error("No template found");
      return;
    }

    const questions = template.questionBank;
    console.log(`Total questions: ${questions.length}\n`);

    // Group questions by module
    const moduleGroups = {};
    questions.forEach((q) => {
      if (!moduleGroups[q.module]) {
        moduleGroups[q.module] = [];
      }
      moduleGroups[q.module].push(q);
    });

    console.log("Questions per module:");
    Object.entries(moduleGroups).forEach(([module, qs]) => {
      console.log(`${module}: ${qs.length} questions`);
    });

    // Find similar questions
    console.log("\n\nPotential redundancies (similar text):");
    const redundancies = [];

    for (let i = 0; i < questions.length; i++) {
      for (let j = i + 1; j < questions.length; j++) {
        const q1 = questions[i];
        const q2 = questions[j];

        // Check for very similar text
        const text1 = q1.text.toLowerCase();
        const text2 = q2.text.toLowerCase();

        // Calculate similarity
        const words1 = text1.split(/\s+/);
        const words2 = text2.split(/\s+/);
        const commonWords = words1.filter(
          (w) => words2.includes(w) && w.length > 3
        );

        if (
          commonWords.length >= 3 &&
          commonWords.length >= Math.min(words1.length, words2.length) * 0.5
        ) {
          redundancies.push({
            q1: { id: q1.id, text: q1.text, module: q1.module },
            q2: { id: q2.id, text: q2.text, module: q2.module },
            similarity:
              commonWords.length / Math.max(words1.length, words2.length),
          });
        }
      }
    }

    // Sort by similarity
    redundancies.sort((a, b) => b.similarity - a.similarity);

    // Show top redundancies
    console.log(`\nTop 20 most similar questions:`);
    redundancies.slice(0, 20).forEach((r, i) => {
      console.log(
        `\n${i + 1}. Similarity: ${(r.similarity * 100).toFixed(1)}%`
      );
      console.log(`   [${r.q1.module}] ${r.q1.id}: ${r.q1.text}`);
      console.log(`   [${r.q2.module}] ${r.q2.id}: ${r.q2.text}`);
    });

    // Analyze question topics
    console.log("\n\nQuestion topic analysis:");
    const topics = {
      digestive: [],
      energy: [],
      pain: [],
      sleep: [],
      mood: [],
      skin: [],
      hormonal: [],
      immune: [],
      cardiovascular: [],
      respiratory: [],
      neurological: [],
      musculoskeletal: [],
      urinary: [],
      weight: [],
      dietary: [],
    };

    questions.forEach((q) => {
      const text = q.text.toLowerCase();
      if (
        text.includes("digest") ||
        text.includes("stomach") ||
        text.includes("bowel") ||
        text.includes("gas") ||
        text.includes("bloat")
      ) {
        topics.digestive.push(q.id);
      }
      if (
        text.includes("energy") ||
        text.includes("fatigue") ||
        text.includes("tired")
      ) {
        topics.energy.push(q.id);
      }
      if (
        text.includes("pain") ||
        text.includes("ache") ||
        text.includes("hurt")
      ) {
        topics.pain.push(q.id);
      }
      if (
        text.includes("sleep") ||
        text.includes("insomnia") ||
        text.includes("wake")
      ) {
        topics.sleep.push(q.id);
      }
      if (
        text.includes("mood") ||
        text.includes("depress") ||
        text.includes("anxiety") ||
        text.includes("stress")
      ) {
        topics.mood.push(q.id);
      }
      if (
        text.includes("skin") ||
        text.includes("rash") ||
        text.includes("acne") ||
        text.includes("eczema")
      ) {
        topics.skin.push(q.id);
      }
      if (
        text.includes("hormone") ||
        text.includes("menstrual") ||
        text.includes("thyroid")
      ) {
        topics.hormonal.push(q.id);
      }
      if (
        text.includes("immune") ||
        text.includes("infection") ||
        text.includes("cold") ||
        text.includes("flu")
      ) {
        topics.immune.push(q.id);
      }
      if (
        text.includes("heart") ||
        text.includes("blood pressure") ||
        text.includes("chest")
      ) {
        topics.cardiovascular.push(q.id);
      }
      if (
        text.includes("breath") ||
        text.includes("lung") ||
        text.includes("asthma")
      ) {
        topics.respiratory.push(q.id);
      }
      if (
        text.includes("headache") ||
        text.includes("dizzy") ||
        text.includes("memory") ||
        text.includes("focus")
      ) {
        topics.neurological.push(q.id);
      }
      if (
        text.includes("joint") ||
        text.includes("muscle") ||
        text.includes("back")
      ) {
        topics.musculoskeletal.push(q.id);
      }
      if (
        text.includes("urin") ||
        text.includes("bladder") ||
        text.includes("kidney")
      ) {
        topics.urinary.push(q.id);
      }
      if (
        text.includes("weight") ||
        text.includes("gain") ||
        text.includes("lose")
      ) {
        topics.weight.push(q.id);
      }
      if (
        text.includes("eat") ||
        text.includes("food") ||
        text.includes("diet") ||
        text.includes("meal")
      ) {
        topics.dietary.push(q.id);
      }
    });

    console.log("\nQuestions by topic:");
    Object.entries(topics).forEach(([topic, ids]) => {
      if (ids.length > 0) {
        console.log(`${topic}: ${ids.length} questions`);
      }
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeRedundancy();
