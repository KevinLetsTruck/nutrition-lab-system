import { SupplementProtocol, SupplementRecommendation } from './client-data-aggregator'

interface Product {
  name: string
  brand: string
  price: number
  url: string
  inStock: boolean
  dosage: string
  form: string
  description: string
}

interface RecommendedSupplement {
  name: string
  form: string
  dosage: string
  timing: string
  rationale: string
  phase: number
  truckCompatible: boolean
  instructions: string
}

export class SupplementRecommender {
  
  async generateSupplementRecommendations(
    analysis: any
  ): Promise<SupplementProtocol> {
    
    // Generate supplement recommendations based on analysis
    const recommendedSupplements = this.generateRecommendationsFromAnalysis(analysis);
    
    const recommendations: SupplementRecommendation[] = [];
    
    for (const supplement of recommendedSupplements) {
      const recommendation = await this.findBestSupplementOption(supplement);
      recommendations.push(recommendation);
    }
    
    // Group by phase
    const phase1 = recommendations.filter(r => r.phase === 1);
    const phase2 = recommendations.filter(r => r.phase === 2);
    const phase3 = recommendations.filter(r => r.phase === 3);
    
    return {
      phase1,
      phase2,
      phase3,
      totalMonthlyCost: this.calculateMonthlyCost(recommendations)
    };
  }
  
  private generateRecommendationsFromAnalysis(analysis: any): RecommendedSupplement[] {
    const recommendations: RecommendedSupplement[] = [];
    
    // Generate recommendations based on root causes and system priorities
    const systemsPriority = analysis.systemsPriority || {};
    
    // Digestive system priority
    if (systemsPriority.digestive >= 6) {
      recommendations.push({
        name: "Probiotic",
        form: "capsule",
        dosage: "1 capsule twice daily",
        timing: "30 minutes before meals",
        rationale: "Support gut microbiome and reduce inflammation",
        phase: 1,
        truckCompatible: true,
        instructions: "Take on empty stomach, store in cool place"
      });
      
      recommendations.push({
        name: "Digestive Enzymes",
        form: "capsule",
        dosage: "1-2 capsules with meals",
        timing: "with each meal",
        rationale: "Improve nutrient absorption and reduce digestive symptoms",
        phase: 1,
        truckCompatible: true,
        instructions: "Take with first bite of food"
      });
    }
    
    // Immune system priority
    if (systemsPriority.immune >= 6) {
      recommendations.push({
        name: "Vitamin D3",
        form: "liquid",
        dosage: "1 drop daily",
        timing: "with breakfast",
        rationale: "Optimize immune function and reduce inflammation",
        phase: 1,
        truckCompatible: true,
        instructions: "Take with fat-containing meal for better absorption"
      });
      
      recommendations.push({
        name: "Zinc",
        form: "capsule",
        dosage: "15mg daily",
        timing: "with dinner",
        rationale: "Support immune function and wound healing",
        phase: 1,
        truckCompatible: true,
        instructions: "Take with food to avoid stomach upset"
      });
    }
    
    // Nervous system priority
    if (systemsPriority.nervous >= 6) {
      recommendations.push({
        name: "Magnesium Glycinate",
        form: "capsule",
        dosage: "200mg twice daily",
        timing: "with meals",
        rationale: "Support nervous system function and improve sleep",
        phase: 1,
        truckCompatible: true,
        instructions: "Take with food, may cause drowsiness"
      });
      
      recommendations.push({
        name: "B-Complex",
        form: "capsule",
        dosage: "1 capsule daily",
        timing: "with breakfast",
        rationale: "Support energy production and nervous system function",
        phase: 1,
        truckCompatible: true,
        instructions: "Take with food, may turn urine bright yellow"
      });
    }
    
    // Endocrine system priority
    if (systemsPriority.endocrine >= 6) {
      recommendations.push({
        name: "Omega-3",
        form: "capsule",
        dosage: "2 capsules daily",
        timing: "with meals",
        rationale: "Support hormone production and reduce inflammation",
        phase: 1,
        truckCompatible: true,
        instructions: "Take with food, store in refrigerator if possible"
      });
    }
    
    // Phase 2 recommendations (more advanced)
    if (systemsPriority.digestive >= 7) {
      recommendations.push({
        name: "Glutamine",
        form: "powder",
        dosage: "5g daily",
        timing: "on empty stomach",
        rationale: "Heal gut lining and reduce inflammation",
        phase: 2,
        truckCompatible: true,
        instructions: "Mix with water, take 30 minutes before meals"
      });
    }
    
    if (systemsPriority.immune >= 7) {
      recommendations.push({
        name: "Vitamin C",
        form: "capsule",
        dosage: "1000mg daily",
        timing: "with breakfast",
        rationale: "Support immune function and collagen production",
        phase: 2,
        truckCompatible: true,
        instructions: "Take with food, may cause loose stools if too much"
      });
    }
    
    // Phase 3 recommendations (optimization)
    if (systemsPriority.detoxification >= 5) {
      recommendations.push({
        name: "NAC",
        form: "capsule",
        dosage: "600mg daily",
        timing: "with dinner",
        rationale: "Support detoxification and antioxidant production",
        phase: 3,
        truckCompatible: true,
        instructions: "Take with food, may cause mild stomach upset"
      });
    }
    
    return recommendations;
  }
  
  private async findBestSupplementOption(supplement: RecommendedSupplement): Promise<SupplementRecommendation> {
    
    // Step 1: Check LetsTrack.com first (for truck drivers)
    const letsTrackOption = await this.checkLetsTrack(supplement);
    if (letsTrackOption) {
      return {
        name: supplement.name,
        dosage: supplement.dosage,
        timing: supplement.timing,
        source: 'LetsTrack',
        productUrl: letsTrackOption.url,
        price: letsTrackOption.price,
        inStock: letsTrackOption.inStock,
        phase: supplement.phase,
        rationale: supplement.rationale,
        truckCompatible: supplement.truckCompatible,
        instructions: supplement.instructions
      };
    }
    
    // Step 2: Check Biotics Research
    const bioticsOption = await this.checkBiotics(supplement);
    if (bioticsOption) {
      return {
        name: supplement.name,
        dosage: supplement.dosage,
        timing: supplement.timing,
        source: 'Biotics',
        productUrl: bioticsOption.url,
        price: bioticsOption.price,
        inStock: bioticsOption.inStock,
        practitionerCode: process.env.BIOTICS_PRACTITIONER_CODE,
        phase: supplement.phase,
        rationale: supplement.rationale,
        truckCompatible: supplement.truckCompatible,
        instructions: supplement.instructions
      };
    }
    
    // Step 3: Fallback to Fullscript
    const fullscriptOption = await this.checkFullscript(supplement);
    return {
      name: supplement.name,
      dosage: supplement.dosage,
      timing: supplement.timing,
      source: 'Fullscript',
      productUrl: fullscriptOption.url,
      price: fullscriptOption.price,
      inStock: fullscriptOption.inStock,
      practitionerCode: process.env.FULLSCRIPT_PRACTITIONER_CODE,
      phase: supplement.phase,
      rationale: supplement.rationale,
      truckCompatible: supplement.truckCompatible,
      instructions: supplement.instructions
    };
  }
  
  private async checkLetsTrack(supplement: RecommendedSupplement): Promise<Product | null> {
    try {
      // Mock LetsTrack API response for now
      // In production, this would be a real API call to LetsTrack
      console.log(`[SUPPLEMENT] Mocking LetsTrack search for: ${supplement.name}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Return mock product data
      return {
        name: supplement.name,
        brand: 'LetsTrack Premium',
        price: Math.random() * 50 + 15, // Random price between $15-65
        url: 'https://letstrack.com/products',
        inStock: true,
        dosage: supplement.dosage,
        form: supplement.form,
        description: `High-quality ${supplement.name} from LetsTrack`
      };
    } catch (error) {
      console.error('Error checking LetsTrack:', error);
    }
    
    return null;
  }
  
  private async checkBiotics(supplement: RecommendedSupplement): Promise<Product | null> {
    try {
      // Mock Biotics Research API response for now
      console.log(`[SUPPLEMENT] Mocking Biotics search for: ${supplement.name}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Return mock product data
      return {
        name: supplement.name,
        brand: 'Biotics Research',
        price: Math.random() * 40 + 20, // Random price between $20-60
        url: 'https://bioticsresearch.com/products',
        inStock: true,
        dosage: supplement.dosage,
        form: supplement.form,
        description: `Professional-grade ${supplement.name} from Biotics Research`
      };
    } catch (error) {
      console.error('Error checking Biotics:', error);
    }
    
    return null;
  }
  
  private async checkFullscript(supplement: RecommendedSupplement): Promise<Product> {
    try {
      // Mock Fullscript API response for now
      console.log(`[SUPPLEMENT] Mocking Fullscript search for: ${supplement.name}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Return mock product data
      const mockProduct = {
        name: supplement.name,
        brand: 'Fullscript',
        price: Math.random() * 30 + 10, // Random price between $10-40
        url: 'https://fullscript.com/products',
        inStock: true,
        dosage: supplement.dosage,
        form: supplement.form,
        description: `${supplement.name} available through Fullscript`
      };
      
      return mockProduct;
    } catch (error) {
      console.error('Error checking Fullscript:', error);
    }
    
    // Return fallback product
    return {
      name: supplement.name,
      brand: 'Generic',
      price: 25.00,
      url: 'https://fullscript.com',
      inStock: true,
      dosage: supplement.dosage,
      form: supplement.form,
      description: `${supplement.name} supplement`
    };
  }
  
  private findBestMatch(products: Product[], supplement: RecommendedSupplement): Product | null {
    if (!products || products.length === 0) {
      return null;
    }
    
    // Score products based on match quality
    const scoredProducts = products.map(product => {
      let score = 0;
      
      // Name match
      if (product.name.toLowerCase().includes(supplement.name.toLowerCase())) {
        score += 10;
      }
      
      // Form match
      if (product.form.toLowerCase() === supplement.form.toLowerCase()) {
        score += 5;
      }
      
      // Brand preference (Biotics Research preferred)
      if (product.brand.toLowerCase().includes('biotics')) {
        score += 3;
      }
      
      // Price consideration (lower is better, but not too low)
      if (product.price > 10 && product.price < 100) {
        score += 2;
      }
      
      // Availability
      if (product.inStock) {
        score += 2;
      }
      
      return { product, score };
    });
    
    // Sort by score and return the best match
    scoredProducts.sort((a, b) => b.score - a.score);
    
    return scoredProducts[0]?.score > 5 ? scoredProducts[0].product : null;
  }
  
  private calculateMonthlyCost(recommendations: SupplementRecommendation[]): number {
    return recommendations.reduce((total, rec) => {
      return total + (rec.price || 0);
    }, 0);
  }
  
  // Helper method to get supplement recommendations for specific conditions
  getRecommendationsForCondition(condition: string, phase: number): RecommendedSupplement[] {
    const recommendations: RecommendedSupplement[] = [];
    
    switch (condition.toLowerCase()) {
      case 'digestive issues':
        recommendations.push({
          name: "Probiotic",
          form: "capsule",
          dosage: "1 capsule twice daily",
          timing: "30 minutes before meals",
          rationale: "Restore gut microbiome balance",
          phase,
          truckCompatible: true,
          instructions: "Take on empty stomach"
        });
        break;
        
      case 'fatigue':
        recommendations.push({
          name: "B-Complex",
          form: "capsule",
          dosage: "1 capsule daily",
          timing: "with breakfast",
          rationale: "Support energy production",
          phase,
          truckCompatible: true,
          instructions: "Take with food"
        });
        break;
        
      case 'inflammation':
        recommendations.push({
          name: "Omega-3",
          form: "capsule",
          dosage: "2 capsules daily",
          timing: "with meals",
          rationale: "Reduce systemic inflammation",
          phase,
          truckCompatible: true,
          instructions: "Take with food"
        });
        break;
        
      case 'sleep issues':
        recommendations.push({
          name: "Magnesium Glycinate",
          form: "capsule",
          dosage: "200mg before bed",
          timing: "30 minutes before sleep",
          rationale: "Support relaxation and sleep quality",
          phase,
          truckCompatible: true,
          instructions: "May cause drowsiness"
        });
        break;
        
      case 'immune support':
        recommendations.push({
          name: "Vitamin D3",
          form: "liquid",
          dosage: "1 drop daily",
          timing: "with breakfast",
          rationale: "Optimize immune function",
          phase,
          truckCompatible: true,
          instructions: "Take with fat-containing meal"
        });
        break;
    }
    
    return recommendations;
  }
} 