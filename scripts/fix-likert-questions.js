const fs = require('fs');
const path = require('path');

// Questions that should be YES_NO (questions asking "Do you..." or "Are you...")
const shouldBeYesNo = [
  'SCR057', // Are you sensitive to chemicals, perfumes, or smoke?
  'DEF004', // Do you experience chronic pain or inflammation anywhere in your body?
  'DEF018', // Are you sensitive to chemicals, perfumes, or strong odors?
  'ENE006', // Are you sensitive to cold temperatures?
  'ENE_SO01', // Do you notice energy differences when eating home-cooked versus restaurant meals?
  'ENE_SO03', // Do you feel more energetic when eating simple, whole foods?
  'ENE_SO07', // Do you have more sustained energy when avoiding packaged and processed foods?
  'DEF_SO04', // Have you noticed improvement in inflammatory symptoms when eating whole, unprocessed foods?
  'BIO_SO01', // Do you feel "cleaner" or lighter when avoiding fried and processed foods?
  'COM081', // Do you feel unmotivated or lack drive?
  'COM085', // Do you have difficulty with impulse control?
  'COM100', // Do you have difficulty with mental math or calculations?
  'COM110', // Do you have difficulty with balance or coordination?
  'COM115', // Do you feel emotionally numb or disconnected?
  'STR012', // Do you have good flexibility?
  'STR045', // Does structural pain limit your daily activities?
  'ASM052', // Do you experience digestive symptoms when stressed?
  'TRA027', // Are you concerned about your heart health?
  'BIO018', // Are you sensitive to electromagnetic fields (WiFi, cell phones)?
];

// Questions that should be FREQUENCY (questions about how often something happens)
const shouldBeFrequency = [
  'BIO001', // How sensitive are you to chemicals, perfumes, or cleaning products?
];

// Function to update a question file
function updateQuestionFile(filePath) {
  console.log(`Processing ${path.basename(filePath)}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix YES_NO questions
  shouldBeYesNo.forEach(questionId => {
    const regex = new RegExp(`(id:\\s*"${questionId}"[\\s\\S]*?type:\\s*)"LIKERT_SCALE"`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, '$1"YES_NO"');
      
      // Add YES_NO options if not present
      const optionsRegex = new RegExp(`(id:\\s*"${questionId}"[\\s\\S]*?type:\\s*"YES_NO"[\\s\\S]*?)(scale:|scaleMin:|scaleMax:|clinicalRelevance:)`, 'g');
      content = content.replace(optionsRegex, `$1options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    $2`);
      
      // Remove scale properties
      const scaleRegex = new RegExp(`(id:\\s*"${questionId}"[\\s\\S]*?)scaleMin:[^,\\n]*,?\\s*`, 'g');
      content = content.replace(scaleRegex, '$1');
      const scaleMaxRegex = new RegExp(`(id:\\s*"${questionId}"[\\s\\S]*?)scaleMax:[^,\\n]*,?\\s*`, 'g');
      content = content.replace(scaleMaxRegex, '$1');
      const scaleObjRegex = new RegExp(`(id:\\s*"${questionId}"[\\s\\S]*?)scale:\\s*{[^}]*},?\\s*`, 'g');
      content = content.replace(scaleObjRegex, '$1');
      
      modified = true;
      console.log(`  Fixed ${questionId} to YES_NO`);
    }
  });

  // Fix FREQUENCY questions
  shouldBeFrequency.forEach(questionId => {
    const regex = new RegExp(`(id:\\s*"${questionId}"[\\s\\S]*?type:\\s*)"LIKERT_SCALE"`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, '$1"FREQUENCY"');
      
      // Add FREQUENCY options if not present
      const optionsRegex = new RegExp(`(id:\\s*"${questionId}"[\\s\\S]*?type:\\s*"FREQUENCY"[\\s\\S]*?)(scale:|scaleMin:|scaleMax:|clinicalRelevance:)`, 'g');
      content = content.replace(optionsRegex, `$1options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 },
    ],
    $2`);
      
      // Remove scale properties
      const scaleRegex = new RegExp(`(id:\\s*"${questionId}"[\\s\\S]*?)scaleMin:[^,\\n]*,?\\s*`, 'g');
      content = content.replace(scaleRegex, '$1');
      const scaleMaxRegex = new RegExp(`(id:\\s*"${questionId}"[\\s\\S]*?)scaleMax:[^,\\n]*,?\\s*`, 'g');
      content = content.replace(scaleMaxRegex, '$1');
      const scaleObjRegex = new RegExp(`(id:\\s*"${questionId}"[\\s\\S]*?)scale:\\s*{[^}]*},?\\s*`, 'g');
      content = content.replace(scaleObjRegex, '$1');
      
      modified = true;
      console.log(`  Fixed ${questionId} to FREQUENCY`);
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Updated ${path.basename(filePath)}`);
  }
}

// Process all question files
const questionsDir = path.join(__dirname, '../lib/assessment/questions');
const files = fs.readdirSync(questionsDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  updateQuestionFile(path.join(questionsDir, file));
});

console.log('\nDone! Remember to reseed the database with: curl -X POST http://localhost:3000/api/assessment/seed');
