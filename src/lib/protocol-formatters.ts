/**
 * Protocol Formatters - Generate professional documents from Claude Desktop protocol data
 * 
 * Transforms structured protocol data into formatted documents:
 * - Coaching Notes: Structured summary for practitioner use during client consultations
 * - Client Protocol Letter: Professional instructions for client implementation
 * - Supplement List: Organized supplement recommendations with dosages and timing
 */

// Client interface
interface Client {
  firstName: string;
  lastName: string;
  status?: string;
}

// Protocol data interfaces (same as import API)
interface Supplement {
  name: string;
  dosage: string;
  timing: string;
  duration?: string;
  notes?: string;
}

interface ProtocolData {
  analysisDate: string;
  rootCauseAnalysis: string;
  systemPriorities: string[];
  phase1Protocol: {
    supplements: Supplement[];
    dietaryChanges: string[];
    lifestyleModifications: string[];
    duration: string;
  };
  phase2Protocol?: {
    supplements: Supplement[];
    additionalInterventions: string[];
    duration: string;
  };
  phase3Protocol?: {
    maintenanceSupplements: Supplement[];
    longTermRecommendations: string[];
  };
  monitoringPlan: {
    keyBiomarkers: string[];
    retestingSchedule: string;
    progressIndicators: string[];
    warningSignsToWatch: string[];
  };
  practitionerNotes?: string;
}

export async function generateCoachingNotes(client: Client, protocolData: ProtocolData): Promise<string> {
  return `# COACHING NOTES - ${client.firstName} ${client.lastName}

## 🎯 Quick Reference for Coaching Call
**Analysis Date**: ${protocolData.analysisDate}  
**Session Focus**: Protocol introduction and implementation strategy  
**Client Status**: ${client.status || 'Active'}  

---

## 🔍 ROOT CAUSE ANALYSIS
${protocolData.rootCauseAnalysis}

---

## 📊 SYSTEM PRIORITIES
${protocolData.systemPriorities.map((priority: string, index: number) => 
  `**${index + 1}. ${priority}**`
).join('\n')}

---

## 📋 PHASE 1 PROTOCOL OVERVIEW
**Duration**: ${protocolData.phase1Protocol.duration}  
**Focus**: Foundation building and core interventions

### 💊 Key Supplements to Discuss
${protocolData.phase1Protocol.supplements.map((supplement: Supplement) => 
  `- **${supplement.name}**: ${supplement.dosage} ${supplement.timing}${supplement.notes ? ` *(${supplement.notes})*` : ''}`
).join('\n')}

### 🥗 Dietary Changes to Review
${protocolData.phase1Protocol.dietaryChanges.map((change: string) => `- ${change}`).join('\n')}

### 🏃‍♂️ Lifestyle Modifications to Plan
${protocolData.phase1Protocol.lifestyleModifications.map((mod: string) => `- ${mod}`).join('\n')}

---

## 🔬 MONITORING PLAN

### 📈 Key Biomarkers to Track
${protocolData.monitoringPlan.keyBiomarkers.map((marker: string) => `- ${marker}`).join('\n')}

### ✅ Progress Indicators to Discuss
${protocolData.monitoringPlan.progressIndicators.map((indicator: string) => `- ${indicator}`).join('\n')}

### ⚠️ Warning Signs to Educate About
${protocolData.monitoringPlan.warningSignsToWatch.map((sign: string) => `- ${sign}`).join('\n')}

---

## 🗣️ COACHING CALL AGENDA

### 1. **Review Analysis** (10 minutes)
- Explain root causes and how they connect to symptoms
- Review system priorities and why they're important
- Address any questions about the analysis

### 2. **Protocol Introduction** (15 minutes)
- Walk through Phase 1 supplements and timing
- Explain the purpose of each supplement
- Discuss potential side effects or interactions

### 3. **Dietary Discussion** (10 minutes)
- Review recommended changes and rationale
- Create realistic implementation timeline
- Identify potential challenges and solutions

### 4. **Lifestyle Planning** (10 minutes)
- Discuss lifestyle modifications in order of priority
- Set realistic goals and milestones
- Plan accountability measures

### 5. **Monitoring Setup** (10 minutes)
- Explain what to track and how to track it
- Set expectations for progress timeline
- Schedule follow-up and retesting

### 6. **Questions & Support** (5 minutes)
- Address implementation concerns
- Provide resources and support contacts
- Confirm understanding and commitment

---

## 📅 FOLLOW-UP SCHEDULE

### 🔄 Short-term Follow-up
- **2 Weeks**: Protocol adjustment and compliance check-in call
- **4 Weeks**: Mid-protocol progress assessment
- **${protocolData.monitoringPlan.retestingSchedule}**: Comprehensive reassessment and lab review

### 🎯 Protocol Progression
${protocolData.phase2Protocol ? `- **Phase 2 Planning**: Schedule transition after successful Phase 1 completion
- **Advanced Interventions**: ${protocolData.phase2Protocol.additionalInterventions?.slice(0, 2).join(', ')}` : '- **Protocol Completion**: Assess for additional interventions based on progress'}

${protocolData.phase3Protocol ? `
### 🏃‍♂️ Long-term Maintenance
- **Maintenance Protocol**: Transition to simplified long-term support
- **Ongoing Monitoring**: Establish sustainable health practices
` : ''}

---

## 📝 PRACTITIONER NOTES

### 🎯 Key Points to Emphasize
- Protocol is specifically designed for their unique health pattern
- Consistency is more important than perfection
- Gradual implementation is acceptable if needed
- Progress may take time - patience is essential

### 💡 Implementation Tips
- Start with highest priority supplements if cost is a concern
- Phase in dietary changes gradually to improve compliance
- Use lifestyle modifications as building blocks, not overwhelming changes

### 🔍 What to Watch For
- Early improvement signs (usually within 2-4 weeks)
- Potential detox reactions in first week
- Compliance challenges and need for protocol adjustments

${protocolData.practitionerNotes ? `
### 📋 Additional Clinical Notes
${protocolData.practitionerNotes}
` : ''}

---

## 📞 NEXT STEPS CHECKLIST

- [ ] Client understands root cause analysis
- [ ] Supplement protocol reviewed and questions addressed  
- [ ] Dietary changes planned with realistic timeline
- [ ] Lifestyle modifications prioritized and scheduled
- [ ] Monitoring plan established and tracking tools provided
- [ ] Follow-up calls scheduled
- [ ] Emergency contact protocol established
- [ ] Protocol documents provided to client

---

*Coaching notes generated on ${new Date().toLocaleDateString()} for ${client.firstName} ${client.lastName}*
*Protocol Import System - FNTP Nutrition Lab*
`;
}

export async function generateClientLetter(client: Client, protocolData: ProtocolData): Promise<string> {
  return `# Your Personalized Health Protocol

**Dear ${client.firstName},**

I'm excited to share your personalized functional medicine protocol, developed from our comprehensive health analysis. This protocol is specifically designed to address your unique health pattern and optimize your wellbeing.

---

## 🔍 Understanding Your Health Pattern

${protocolData.rootCauseAnalysis}

### 🎯 Our Focus Areas
${protocolData.systemPriorities.map((priority: string, index: number) => 
  `${index + 1}. **${priority}**`
).join('\n')}

---

## 💊 Your Phase 1 Protocol (${protocolData.phase1Protocol.duration})

### Daily Supplement Protocol

${protocolData.phase1Protocol.supplements.map((supplement: Supplement, index: number) => 
  `**${index + 1}. ${supplement.name}**
- **Dosage**: ${supplement.dosage}
- **When to Take**: ${supplement.timing}
- **Duration**: ${supplement.duration || protocolData.phase1Protocol.duration}
${supplement.notes ? `- **Important**: ${supplement.notes}` : ''}`
).join('\n\n')}

### 🥗 Dietary Recommendations

To support your healing process, please implement these dietary changes:

${protocolData.phase1Protocol.dietaryChanges.map((change: string) => `- ${change}`).join('\n')}

### 🏃‍♂️ Lifestyle Modifications

These lifestyle adjustments will enhance your protocol's effectiveness:

${protocolData.phase1Protocol.lifestyleModifications.map((mod: string) => `- ${mod}`).join('\n')}

---

## 📈 What to Expect

During your first ${protocolData.phase1Protocol.duration}, you may notice:

${protocolData.monitoringPlan.progressIndicators.map((indicator: string) => `✅ ${indicator}`).join('\n')}

### 🕒 Timeline for Improvement
- **Week 1-2**: Initial protocol adjustment period
- **Week 3-4**: Early improvement signs may begin
- **${protocolData.phase1Protocol.duration}**: Full protocol benefits should be apparent

---

## ⚠️ Important Guidelines

### When to Contact Me Immediately
Please reach out if you experience any of the following:

${protocolData.monitoringPlan.warningSignsToWatch.map((sign: string) => `🚨 ${sign}`).join('\n')}

### 📞 Your Support System
- **2-Week Check-in**: We'll schedule a call to assess progress and address questions
- **Ongoing Support**: Email or call with any concerns - don't wait for scheduled appointments
- **Emergency Protocol**: Contact me immediately for any concerning symptoms

---

## 🔬 Monitoring Your Progress

### 📊 Key Markers We're Tracking
${protocolData.monitoringPlan.keyBiomarkers.map((marker: string) => `- ${marker}`).join('\n')}

### 📅 Follow-Up Schedule
- **2-Week Check-in Call**: Progress assessment and protocol adjustments
- **Comprehensive Reassessment**: ${protocolData.monitoringPlan.retestingSchedule}
- **Ongoing Monitoring**: Monthly progress reviews as needed

${protocolData.phase2Protocol ? `

---

## 🚀 Looking Ahead - Phase 2 Protocol

After successfully completing Phase 1, we'll transition to Phase 2 (${protocolData.phase2Protocol.duration}), which will include:

### Enhanced Supplement Protocol
${protocolData.phase2Protocol.supplements ? 
  protocolData.phase2Protocol.supplements.map((supplement: Supplement) => 
    `- **${supplement.name}**: ${supplement.dosage} ${supplement.timing}`
  ).join('\n') : 'Customized based on Phase 1 progress'}

### Advanced Interventions
${protocolData.phase2Protocol.additionalInterventions ? 
  protocolData.phase2Protocol.additionalInterventions.map((intervention: string) => 
    `- ${intervention}`
  ).join('\n') : 'Additional therapeutic approaches as needed'}
` : ''}

${protocolData.phase3Protocol ? `

---

## 🌟 Long-Term Health Maintenance

Our ultimate goal is sustainable, long-term health optimization through:

### Maintenance Protocol
${protocolData.phase3Protocol.maintenanceSupplements ? 
  protocolData.phase3Protocol.maintenanceSupplements.map((supplement: Supplement) => 
    `- **${supplement.name}**: ${supplement.dosage} ${supplement.timing}`
  ).join('\n') : ''}

### Ongoing Wellness Strategies
${protocolData.phase3Protocol.longTermRecommendations ? 
  protocolData.phase3Protocol.longTermRecommendations.map((rec: string) => 
    `- ${rec}`
  ).join('\n') : ''}
` : ''}

---

## 💪 Your Health Journey Success Tips

### 🎯 Focus on Consistency
- Take supplements at the same times daily
- Implement dietary changes gradually but consistently
- Track your progress to stay motivated

### 🤝 Communication is Key
- Report both improvements AND concerns
- Ask questions - no question is too small
- Keep me informed of any other health changes

### 🌱 Be Patient with the Process
- Functional medicine addresses root causes, not just symptoms
- True healing takes time but creates lasting results
- Each step forward is progress, even if small

---

## 📋 Your Action Steps

**This Week:**
- [ ] Review all supplement instructions carefully
- [ ] Schedule supplement timing into your daily routine
- [ ] Begin implementing dietary recommendations
- [ ] Set up progress tracking system

**Ongoing:**
- [ ] Take supplements consistently as prescribed
- [ ] Follow dietary and lifestyle recommendations
- [ ] Monitor progress indicators
- [ ] Maintain regular communication about your experience

---

I'm here to support you every step of the way on your journey to optimal health. This protocol represents a personalized roadmap based on your unique health needs and goals.

Remember: You have everything you need to succeed. Trust the process, stay consistent, and reach out whenever you need support or guidance.

**To your health and vitality,**

**[Your Practitioner Name]**  
**[Title/Credentials]**  
**[Contact Information]**  
**[Practice Name]**

---

*Protocol developed on ${new Date().toLocaleDateString()}*  
*Personalized for ${client.firstName} ${client.lastName}*  
*FNTP Functional Medicine Protocol System*
`;
}

export async function generateSupplementList(protocolData: ProtocolData): Promise<string> {
  const allSupplements = [];
  
  // Collect all supplements from all phases
  if (protocolData.phase1Protocol?.supplements) {
    allSupplements.push(...protocolData.phase1Protocol.supplements.map((s: Supplement) => ({
      ...s,
      phase: 'Phase 1',
      duration: s.duration || protocolData.phase1Protocol.duration
    })));
  }
  
  if (protocolData.phase2Protocol?.supplements) {
    allSupplements.push(...protocolData.phase2Protocol.supplements.map((s: Supplement) => ({
      ...s,
      phase: 'Phase 2',
      duration: s.duration || protocolData.phase2Protocol.duration
    })));
  }
  
  if (protocolData.phase3Protocol?.maintenanceSupplements) {
    allSupplements.push(...protocolData.phase3Protocol.maintenanceSupplements.map((s: Supplement) => ({
      ...s,
      phase: 'Maintenance',
      duration: 'Ongoing'
    })));
  }

  return `# 💊 Complete Supplement Protocol Summary

## 📋 Master Supplement List

${allSupplements.map((supplement, index) => 
  `### ${index + 1}. ${supplement.name}
**Phase**: ${supplement.phase}  
**Dosage**: ${supplement.dosage}  
**Timing**: ${supplement.timing}  
**Duration**: ${supplement.duration}  
${supplement.notes ? `**Special Instructions**: ${supplement.notes}  ` : ''}
${supplement.phase === 'Phase 1' ? '🔸 **Priority**: Start immediately' : supplement.phase === 'Phase 2' ? '🔹 **Priority**: Begin after Phase 1 completion' : '🔹 **Priority**: Long-term maintenance'}
`
).join('\n')}

---

## 📊 Phase-by-Phase Breakdown

### 🚀 Phase 1 Supplements (Immediate Start)
**Duration**: ${protocolData.phase1Protocol.duration}

${protocolData.phase1Protocol.supplements?.map((s: Supplement, index: number) => 
  `${index + 1}. **${s.name}**  
   - Dosage: ${s.dosage}  
   - Timing: ${s.timing}  
   ${s.notes ? `- Notes: ${s.notes}` : ''}`
).join('\n\n') || 'None specified'}

${protocolData.phase2Protocol?.supplements ? `
### ⚡ Phase 2 Supplements (After Phase 1)
**Duration**: ${protocolData.phase2Protocol.duration}

${protocolData.phase2Protocol.supplements.map((s: Supplement, index: number) => 
  `${index + 1}. **${s.name}**  
   - Dosage: ${s.dosage}  
   - Timing: ${s.timing}  
   ${s.notes ? `- Notes: ${s.notes}` : ''}`
).join('\n\n')}
` : ''}

${protocolData.phase3Protocol?.maintenanceSupplements ? `
### 🌟 Maintenance Supplements (Long-term)
**Duration**: Ongoing

${protocolData.phase3Protocol.maintenanceSupplements.map((s: Supplement, index: number) => 
  `${index + 1}. **${s.name}**  
   - Dosage: ${s.dosage}  
   - Timing: ${s.timing}  
   ${s.notes ? `- Notes: ${s.notes}` : ''}`
).join('\n\n')}
` : ''}

---

## 🛒 Shopping List

### Phase 1 (Start Immediately)
${protocolData.phase1Protocol.supplements?.map((s: Supplement) => `□ ${s.name}`).join('\n') || 'None'}

${protocolData.phase2Protocol?.supplements ? `
### Phase 2 (Purchase Later)
${protocolData.phase2Protocol.supplements.map((s: Supplement) => `□ ${s.name}`).join('\n')}
` : ''}

${protocolData.phase3Protocol?.maintenanceSupplements ? `
### Maintenance (Long-term)
${protocolData.phase3Protocol.maintenanceSupplements.map((s: Supplement) => `□ ${s.name}`).join('\n')}
` : ''}

---

## ⏰ Daily Schedule Template

### 🌅 Morning (with or before breakfast)
${allSupplements
  .filter(s => s.timing.toLowerCase().includes('morning') || s.timing.toLowerCase().includes('breakfast') || s.timing.toLowerCase().includes('am'))
  .map(s => `- ${s.name} (${s.dosage})`)
  .join('\n') || 'None specified'}

### 🌞 Midday (with lunch)
${allSupplements
  .filter(s => s.timing.toLowerCase().includes('lunch') || s.timing.toLowerCase().includes('midday') || s.timing.toLowerCase().includes('noon'))
  .map(s => `- ${s.name} (${s.dosage})`)
  .join('\n') || 'None specified'}

### 🌅 Evening (with dinner)
${allSupplements
  .filter(s => s.timing.toLowerCase().includes('evening') || s.timing.toLowerCase().includes('dinner') || s.timing.toLowerCase().includes('pm'))
  .map(s => `- ${s.name} (${s.dosage})`)
  .join('\n') || 'None specified'}

### 🌙 Bedtime
${allSupplements
  .filter(s => s.timing.toLowerCase().includes('bedtime') || s.timing.toLowerCase().includes('bed') || s.timing.toLowerCase().includes('sleep'))
  .map(s => `- ${s.name} (${s.dosage})`)
  .join('\n') || 'None specified'}

---

## 📱 Supplement Tracker Checklist

**Week of: ___________**

${allSupplements
  .filter(s => s.phase === 'Phase 1')
  .map(s => `
**${s.name}**
- [ ] Mon  - [ ] Tue  - [ ] Wed  - [ ] Thu  - [ ] Fri  - [ ] Sat  - [ ] Sun
`)
  .join('')}

---

## 💡 Important Reminders

### ✅ Best Practices
- Take supplements with food unless specified otherwise
- Maintain consistent timing for optimal absorption
- Store supplements in a cool, dry place away from direct sunlight
- Check expiration dates regularly

### ⚠️ Safety Notes
- Do not exceed recommended dosages unless directed
- Inform all healthcare providers about supplements you're taking
- Report any adverse reactions immediately
- Some supplements may interact with medications - check with pharmacist if needed

### 📞 Questions or Concerns?
Contact your practitioner if you experience:
- Digestive upset that doesn't improve after a few days
- Any unusual symptoms after starting supplements
- Questions about timing or dosages
- Need for protocol modifications due to lifestyle or cost constraints

---

**Total Supplements**: ${allSupplements.length}  
**Current Phase**: Phase 1  
**Generated**: ${new Date().toLocaleDateString()}  

*This supplement protocol is personalized for your specific health needs. Follow instructions carefully and maintain regular communication with your practitioner for optimal results.*
`;
}
