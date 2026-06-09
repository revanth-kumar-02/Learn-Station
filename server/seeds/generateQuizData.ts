import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { tracksData } from './curriculumData';




// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error('❌ Missing GROQ_API_KEY in .env file');
  process.exit(1);
}



// Output file paths
const JSON_FILE_PATH = path.join(__dirname, 'quizData.json');
const JS_FILE_PATH = path.join(__dirname, 'quizData.js');

// Load existing generated data if it exists
let quizDataStore = {};
if (fs.existsSync(JSON_FILE_PATH)) {
  try {
    quizDataStore = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf8'));
    console.log(`📂 Loaded existing quizData.json with ${Object.keys(quizDataStore).length} lessons.`);
  } catch (err: any) {
    console.warn('⚠️ Could not parse existing quizData.json, starting fresh.', err.message);
  }
}

// Extract all lessons from all tracks
const allLessons = [];
for (const track of tracksData) {
  for (const lesson of track.lessons) {
    allLessons.push({
      slug: lesson.slug,
      title: lesson.title,
      track: track.name,
      exampleExplanation: lesson.exampleExplanation || '',
      practiceInstruction: lesson.practiceInstruction || '',
      practiceTemplate: lesson.practiceTemplate || '',
      practiceAnswer: lesson.practiceAnswer || ''
    });
  }
}

console.log(`📊 Found ${allLessons.length} lessons in curriculum.`);

// Filter lessons that still need to be generated
const pendingLessons = allLessons.filter(l => !quizDataStore[l.slug]);
console.log(`⏳ ${pendingLessons.length} lessons remaining to be generated.`);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeGroqRequest = async (batch) => {
  const systemInstruction = 
    "You are a professional educational developer. You generate high-quality technical quizzes in strict JSON format. " +
    "You MUST output ONLY valid JSON. Do not write any explanations, markdown comments, or formatting blocks (like ```json).";

  const lessonsPrompt = batch.map((l, index) => {
    return `Lesson ${index + 1}:
Slug: "${l.slug}"
Title: "${l.title}"
Track: "${l.track}"
Concept Explanation: "${l.exampleExplanation}"
Practice Instruction: "${l.practiceInstruction}"
Practice Template: "${l.practiceTemplate}"
Practice Answer: "${l.practiceAnswer}"`;
  }).join('\n\n---\n\n');

  const prompt = `
Generate quiz questions for the following ${batch.length} lessons.
Each lesson needs exactly 5 quiz questions. The 5 questions must cover these 5 cognitive levels:
1. Recall (terminology/definition)
2. Concept Understanding (how/why it works)
3. Real-World Application (realistic industry scenario)
4. Problem Solving (code review, logic, or bug detection task)
5. Advanced Understanding (edge cases, performance tradeoffs, or constraints)

The output must be a single JSON object where keys are the lesson slugs, and values are arrays of exactly 5 challenge objects.
JSON Schema:
{
  "lesson-slug-1": [
    {
      "type": "multiple-choice",
      "question": "question text",
      "options": ["option 0", "option 1", "option 2", "option 3"],
      "correctIndex": 0,
      "explanation": "detailed explanation of why the correct answer is correct and why other options are wrong"
    },
    {
      "type": "fill-blank",
      "question": "question text with a blank represented as ___",
      "template": "code template with ___ representing the blank",
      "answer": "correct string to fill in the blank",
      "explanation": "detailed explanation of why this answer is correct"
    },
    ...
  ]
}

Make sure at least 3 questions are multiple-choice and up to 2 can be fill-blank.
Ensure all questions are high quality, educational, challenging, and strictly relevant to the lesson's content.

Here are the lessons to process:
${lessonsPrompt}
`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content;
  
  if (!rawText) {
    throw new Error('Groq API returned an empty response.');
  }

  return JSON.parse(rawText);
};

const run = async () => {
  const batchSize = 4;
  
  for (let i = 0; i < pendingLessons.length; i += batchSize) {
    const batch = pendingLessons.slice(i, i + batchSize);
    console.log(`🚀 Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(pendingLessons.length / batchSize)} (${batch.map(b => b.slug).join(', ')})...`);

    let success = false;
    let retries = 3;

    while (!success && retries > 0) {
      try {
        const result = await makeGroqRequest(batch);
        
        // Add to our store
        for (const lesson of batch) {
          if (result[lesson.slug]) {
            quizDataStore[lesson.slug] = result[lesson.slug];
          } else {
            console.warn(`⚠️ Warning: Response missing slug "${lesson.slug}"`);
          }
        }

        // Save progress to JSON file
        fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(quizDataStore, null, 2), 'utf8');
        console.log(`✅ Saved batch. Total completed: ${Object.keys(quizDataStore).length}/${allLessons.length}`);
        
        success = true;
      } catch (err: any) {
        retries--;
        console.error(`❌ Batch failed: ${err.message}. Retries remaining: ${retries}`);
        if (retries > 0) {
          console.log('⏳ Waiting 5 seconds before retrying...');
          await delay(5000);
        }
      }
    }

    if (!success) {
      console.error('❌ Exiting script due to repeated failures. Progress is saved.');
      process.exit(1);
    }

    // Wait between batches to prevent rate limits
    if (i + batchSize < pendingLessons.length) {
      console.log('⏳ Rate limit cooling: waiting 4 seconds...');
      await delay(4000);
    }
  }

  // Convert the JSON store to a clean CommonJS module exports file
  console.log('💾 Writing final quizData.js...');
  const jsContent = `/**
 * Learn Station — Full 5-Question Quiz Bank Data
 * Auto-generated by generateQuizData.js
 */

const quizData = ${JSON.stringify(quizDataStore, null, 2)};

export default quizData;
`;
  fs.writeFileSync(JS_FILE_PATH, jsContent, 'utf8');
  console.log('🎉 Generation complete! quizData.js has been successfully written.');
  process.exit(0);
};

run();
