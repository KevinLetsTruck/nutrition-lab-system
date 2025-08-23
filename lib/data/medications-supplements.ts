// Common medications and supplements database for autocomplete

export const commonMedications = [
  // Cardiovascular
  { name: "Atorvastatin (Lipitor)", category: "Cholesterol", commonDosages: ["10mg", "20mg", "40mg", "80mg"] },
  { name: "Lisinopril", category: "Blood Pressure", commonDosages: ["2.5mg", "5mg", "10mg", "20mg", "40mg"] },
  { name: "Metoprolol", category: "Blood Pressure/Heart", commonDosages: ["25mg", "50mg", "100mg", "200mg"] },
  { name: "Amlodipine", category: "Blood Pressure", commonDosages: ["2.5mg", "5mg", "10mg"] },
  { name: "Losartan", category: "Blood Pressure", commonDosages: ["25mg", "50mg", "100mg"] },
  
  // Diabetes
  { name: "Metformin", category: "Diabetes", commonDosages: ["500mg", "850mg", "1000mg"] },
  { name: "Glipizide", category: "Diabetes", commonDosages: ["5mg", "10mg"] },
  { name: "Insulin", category: "Diabetes", commonDosages: ["Varies by type"] },
  { name: "Januvia (Sitagliptin)", category: "Diabetes", commonDosages: ["25mg", "50mg", "100mg"] },
  
  // Pain/Inflammation
  { name: "Ibuprofen", category: "Pain/Inflammation", commonDosages: ["200mg", "400mg", "600mg", "800mg"] },
  { name: "Naproxen", category: "Pain/Inflammation", commonDosages: ["220mg", "250mg", "500mg"] },
  { name: "Acetaminophen", category: "Pain", commonDosages: ["325mg", "500mg", "650mg"] },
  { name: "Meloxicam", category: "Pain/Inflammation", commonDosages: ["7.5mg", "15mg"] },
  
  // Digestive
  { name: "Omeprazole (Prilosec)", category: "Acid Reflux", commonDosages: ["20mg", "40mg"] },
  { name: "Pantoprazole", category: "Acid Reflux", commonDosages: ["20mg", "40mg"] },
  { name: "Famotidine (Pepcid)", category: "Acid Reflux", commonDosages: ["20mg", "40mg"] },
  
  // Mental Health
  { name: "Sertraline (Zoloft)", category: "Depression/Anxiety", commonDosages: ["25mg", "50mg", "100mg", "200mg"] },
  { name: "Escitalopram (Lexapro)", category: "Depression/Anxiety", commonDosages: ["5mg", "10mg", "20mg"] },
  { name: "Fluoxetine (Prozac)", category: "Depression/Anxiety", commonDosages: ["10mg", "20mg", "40mg"] },
  { name: "Bupropion (Wellbutrin)", category: "Depression", commonDosages: ["75mg", "100mg", "150mg", "300mg"] },
  
  // Sleep/Anxiety
  { name: "Trazodone", category: "Sleep", commonDosages: ["50mg", "100mg", "150mg"] },
  { name: "Zolpidem (Ambien)", category: "Sleep", commonDosages: ["5mg", "10mg"] },
  { name: "Alprazolam (Xanax)", category: "Anxiety", commonDosages: ["0.25mg", "0.5mg", "1mg", "2mg"] },
  { name: "Lorazepam (Ativan)", category: "Anxiety", commonDosages: ["0.5mg", "1mg", "2mg"] },
  
  // Thyroid
  { name: "Levothyroxine", category: "Thyroid", commonDosages: ["25mcg", "50mcg", "75mcg", "100mcg", "125mcg"] },
  
  // Allergies
  { name: "Cetirizine (Zyrtec)", category: "Allergies", commonDosages: ["5mg", "10mg"] },
  { name: "Loratadine (Claritin)", category: "Allergies", commonDosages: ["10mg"] },
  { name: "Montelukast (Singulair)", category: "Allergies/Asthma", commonDosages: ["10mg"] },
  
  // Other Common
  { name: "Gabapentin", category: "Nerve Pain", commonDosages: ["100mg", "300mg", "400mg", "600mg", "800mg"] },
  { name: "Prednisone", category: "Steroid", commonDosages: ["5mg", "10mg", "20mg", "50mg"] },
  { name: "Albuterol", category: "Asthma", commonDosages: ["90mcg inhaler"] },
  { name: "Hydrochlorothiazide", category: "Diuretic", commonDosages: ["12.5mg", "25mg", "50mg"] },
];

export const commonSupplements = [
  // Vitamins
  { name: "Vitamin D3", category: "Vitamin", commonDosages: ["1000 IU", "2000 IU", "5000 IU", "10000 IU"] },
  { name: "Vitamin C", category: "Vitamin", commonDosages: ["500mg", "1000mg", "2000mg"] },
  { name: "Vitamin B12", category: "Vitamin", commonDosages: ["500mcg", "1000mcg", "5000mcg"] },
  { name: "B-Complex", category: "Vitamin", commonDosages: ["1 capsule", "2 capsules"] },
  { name: "Vitamin E", category: "Vitamin", commonDosages: ["200 IU", "400 IU", "800 IU"] },
  { name: "Vitamin K2", category: "Vitamin", commonDosages: ["45mcg", "90mcg", "120mcg"] },
  
  // Minerals
  { name: "Magnesium Glycinate", category: "Mineral", commonDosages: ["200mg", "400mg", "600mg"] },
  { name: "Magnesium Citrate", category: "Mineral", commonDosages: ["200mg", "400mg"] },
  { name: "Zinc", category: "Mineral", commonDosages: ["15mg", "25mg", "30mg", "50mg"] },
  { name: "Iron", category: "Mineral", commonDosages: ["18mg", "27mg", "65mg"] },
  { name: "Calcium", category: "Mineral", commonDosages: ["500mg", "600mg", "1000mg"] },
  { name: "Selenium", category: "Mineral", commonDosages: ["100mcg", "200mcg"] },
  
  // Omega Fatty Acids
  { name: "Fish Oil", category: "Omega-3", commonDosages: ["1000mg", "2000mg", "3000mg"] },
  { name: "Omega-3", category: "Omega-3", commonDosages: ["500mg EPA/DHA", "1000mg EPA/DHA"] },
  { name: "Krill Oil", category: "Omega-3", commonDosages: ["500mg", "1000mg"] },
  { name: "Flaxseed Oil", category: "Omega-3", commonDosages: ["1000mg", "2000mg"] },
  
  // Probiotics & Digestive
  { name: "Probiotic", category: "Digestive", commonDosages: ["10 billion CFU", "25 billion CFU", "50 billion CFU"] },
  { name: "Digestive Enzymes", category: "Digestive", commonDosages: ["1 capsule", "2 capsules with meals"] },
  { name: "Betaine HCl", category: "Digestive", commonDosages: ["350mg", "650mg"] },
  { name: "L-Glutamine", category: "Digestive/Amino Acid", commonDosages: ["5g", "10g", "15g"] },
  
  // Herbs & Botanicals
  { name: "Turmeric/Curcumin", category: "Anti-inflammatory", commonDosages: ["500mg", "1000mg", "1500mg"] },
  { name: "Ashwagandha", category: "Adaptogen", commonDosages: ["300mg", "600mg", "1000mg"] },
  { name: "Rhodiola", category: "Adaptogen", commonDosages: ["200mg", "400mg"] },
  { name: "Milk Thistle", category: "Liver Support", commonDosages: ["150mg", "300mg", "600mg"] },
  { name: "Ginger", category: "Digestive", commonDosages: ["250mg", "500mg", "1000mg"] },
  { name: "Garlic Extract", category: "Cardiovascular", commonDosages: ["600mg", "1000mg"] },
  
  // Amino Acids & Proteins
  { name: "Collagen Peptides", category: "Protein", commonDosages: ["10g", "20g"] },
  { name: "Whey Protein", category: "Protein", commonDosages: ["20g", "25g", "30g"] },
  { name: "L-Theanine", category: "Amino Acid", commonDosages: ["100mg", "200mg", "400mg"] },
  { name: "5-HTP", category: "Amino Acid", commonDosages: ["50mg", "100mg", "200mg"] },
  
  // Other Popular
  { name: "CoQ10", category: "Antioxidant", commonDosages: ["100mg", "200mg", "300mg"] },
  { name: "Melatonin", category: "Sleep", commonDosages: ["1mg", "3mg", "5mg", "10mg"] },
  { name: "Glucosamine Chondroitin", category: "Joint Health", commonDosages: ["1500mg/1200mg"] },
  { name: "MSM", category: "Joint Health", commonDosages: ["1000mg", "2000mg", "3000mg"] },
  { name: "Alpha Lipoic Acid", category: "Antioxidant", commonDosages: ["300mg", "600mg"] },
  { name: "N-Acetyl Cysteine (NAC)", category: "Antioxidant", commonDosages: ["600mg", "1200mg"] },
  { name: "Resveratrol", category: "Antioxidant", commonDosages: ["250mg", "500mg"] },
  { name: "Green Tea Extract", category: "Antioxidant", commonDosages: ["250mg EGCG", "500mg EGCG"] },
];

// Helper function to search medications
export function searchMedications(query: string): typeof commonMedications {
  const lowercaseQuery = query.toLowerCase();
  return commonMedications.filter(med => 
    med.name.toLowerCase().includes(lowercaseQuery) ||
    med.category.toLowerCase().includes(lowercaseQuery)
  );
}

// Helper function to search supplements
export function searchSupplements(query: string): typeof commonSupplements {
  const lowercaseQuery = query.toLowerCase();
  return commonSupplements.filter(supp => 
    supp.name.toLowerCase().includes(lowercaseQuery) ||
    supp.category.toLowerCase().includes(lowercaseQuery)
  );
}
