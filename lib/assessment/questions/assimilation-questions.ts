// ASSIMILATION Module - Complete Question Set
// 65 total questions including 6 seed oil questions

import { AssessmentQuestion } from '../types';
import { assimilationQuestionsChunk1 } from './assimilation-chunk1';
import { assimilationQuestionsChunk2 } from './assimilation-chunk2';
import { assimilationQuestionsChunk3 } from './assimilation-chunk3';
import { assimilationQuestionsChunk4 } from './assimilation-chunk4';

export const assimilationQuestions: AssessmentQuestion[] = [
  ...assimilationQuestionsChunk1, // Questions 1-15
  ...assimilationQuestionsChunk2, // Questions 16-35
  ...assimilationQuestionsChunk3, // Questions 36-55
  ...assimilationQuestionsChunk4  // Questions 56-65
];

// Export chunks individually if needed
export {
  assimilationQuestionsChunk1,
  assimilationQuestionsChunk2,
  assimilationQuestionsChunk3,
  assimilationQuestionsChunk4
};
