import fs from 'fs';
import path from 'path';
import { tracksData } from './curriculumData';




const JSON_FILE_PATH = path.join(__dirname, 'quizData.json');
const JS_FILE_PATH = path.join(__dirname, 'quizData.js');

let quizDataStore = {};
if (fs.existsSync(JSON_FILE_PATH)) {
  try {
    quizDataStore = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf8'));
  } catch (e: any) {
    console.error('Failed to read quizData.json', e);
  }
}

// Helper to pad challenges
const padChallenges = (challenges: any[], lessonTitle: string) => {
  const padded = [...challenges];
  
  if (padded.length < 3) {
    padded.push({
      type: 'multiple-choice',
      question: `In production environments, what is the primary consideration when working with ${lessonTitle}?`,
      options: [
        'Ensuring clean error boundaries, resource cleanup, and scalability under high client concurrent load.',
        'Bypassing system security access rules.',
        'Using manual garbage collection triggers.',
        'Converting all variables to global scope.'
      ],
      correctIndex: 0,
      explanation: `Proper execution of ${lessonTitle} requires resource safety, thread isolation, and error handling.`
    });
  }

  if (padded.length < 4) {
    padded.push({
      type: 'fill-blank',
      question: `Complete the validation check for ${lessonTitle} states:`,
      template: `if (state === "___") { processRequest(); }`,
      answer: 'active',
      explanation: 'Checking active status coordinates lifecycle states and prevents null references.'
    });
  }

  if (padded.length < 5) {
    padded.push({
      type: 'multiple-choice',
      question: `Which of the following is a primary architectural tradeoff associated with ${lessonTitle}?`,
      options: [
        'Memory consumption footprint vs lookup execution speed.',
        'Complete removal of network timeouts.',
        'Using interpreted execution only.',
        'Elimination of database indexing.'
      ],
      correctIndex: 0,
      explanation: 'Optimizing memory footprint vs retrieval performance is a core system design trade-off.'
    });
  }

  return padded.map((c, idx) => ({
    type: c.type || 'multiple-choice',
    question: c.question,
    options: c.options || [],
    correctIndex: c.correctIndex !== undefined ? c.correctIndex : (c.correct_index !== undefined ? c.correct_index : 0),
    template: c.template || null,
    answer: c.answer || null,
    explanation: c.explanation || 'Review the lesson concepts to verify syntax and logic rules.'
  }));
};

// Process all lessons
let mergedCount = 0;
let paddedCount = 0;

for (const track of tracksData) {
  for (const lesson of track.lessons) {
    if (quizDataStore[lesson.slug]) {
      // Ensure existing challenges have correctIndex mapped properly
      quizDataStore[lesson.slug] = quizDataStore[lesson.slug].map(c => ({
        type: c.type || 'multiple-choice',
        question: c.question,
        options: c.options || [],
        correctIndex: c.correctIndex !== undefined ? c.correctIndex : (c.correct_index !== undefined ? c.correct_index : 0),
        template: c.template || null,
        answer: c.answer || null,
        explanation: c.explanation
      }));
      mergedCount++;
    } else {
      // Merge from curriculumData and pad
      quizDataStore[lesson.slug] = padChallenges(lesson.challenges || [], lesson.title);
      paddedCount++;
    }
  }
}

console.log(`📊 Quiz Data Completion stats:`);
console.log(`- High quality Groq-generated lessons: ${mergedCount}`);
console.log(`- Padded mock lessons: ${paddedCount}`);
console.log(`- Total lessons: ${mergedCount + paddedCount}`);

// Save to JSON
fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(quizDataStore, null, 2), 'utf8');

// Save to JS
const jsContent = `/**
 * Learn Station — Full 5-Question Quiz Bank Data
 * Auto-generated and padded to complete all tracks
 */

const quizData = ${JSON.stringify(quizDataStore, null, 2)};

export default quizData;
`;
fs.writeFileSync(JS_FILE_PATH, jsContent, 'utf8');
console.log('🎉 quizData.js completed successfully!');
