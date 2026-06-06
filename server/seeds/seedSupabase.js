const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });


const { createClient } = require('@supabase/supabase-js');
const { tracksData } = require('./curriculumData');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const seed = async () => {
  try {
    console.log('🗑  Clearing database tables...');
    // We clear challenges, lessons, modules, and tracks.
    await supabase.from('challenges').delete().gt('created_at', '1970-01-01');
    await supabase.from('lessons').delete().gt('created_at', '1970-01-01');
    await supabase.from('modules').delete().neq('id', '');
    await supabase.from('tracks').delete().gt('created_at', '1970-01-01');

    console.log('🌱 Seeding tracks, modules, lessons, and challenges into Supabase...\n');

    let totalModules = 0;
    let totalLessons = 0;
    let totalChallenges = 0;

    for (const trackData of tracksData) {
      console.log(`🚀 Seeding Track: ${trackData.name}...`);
      
      // 1. Insert Track
      const { data: track, error: trackError } = await supabase
        .from('tracks')
        .insert({
          slug: trackData.slug,
          name: trackData.name,
          description: trackData.description,
          icon: trackData.icon,
          color: trackData.color,
          display_order: trackData.order,
          total_lessons: trackData.lessons.length,
          is_ai_generated: false,
          capstone_project: trackData.capstone_project || {}
        })
        .select()
        .single();

      if (trackError) throw trackError;

      // 2. Insert Modules
      for (const mod of trackData.modules) {
        const { error: modError } = await supabase
          .from('modules')
          .insert({
            id: mod.id,
            track_id: track.id,
            name: mod.name,
            display_order: mod.order,
            learning_objective: mod.learning_objective || '',
            mini_project: mod.mini_project || {}
          });
        
        if (modError) throw modError;
        totalModules++;
      }

      // 3. Insert Lessons
      for (const lessonData of trackData.lessons) {
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            slug: lessonData.slug,
            track_id: track.id,
            module_id: lessonData.moduleId,
            title: lessonData.title,
            display_order: lessonData.order,
            estimated_minutes: lessonData.estimatedMinutes,
            xp_reward: lessonData.xpReward,
            concept_title: lessonData.conceptTitle,
            concept_content: lessonData.conceptContent,
            concept_highlights: lessonData.conceptHighlights,
            example_language: lessonData.exampleLanguage,
            example_code: lessonData.exampleCode,
            example_explanation: lessonData.exampleExplanation,
            practice_type: lessonData.practiceType,
            practice_instruction: lessonData.practiceInstruction,
            practice_template: lessonData.practiceTemplate,
            practice_answer: lessonData.practiceAnswer,
            summary: lessonData.summary || ''
          })
          .select()
          .single();

        if (lessonError) throw lessonError;
        totalLessons++;

        // 4. Insert Challenges
        for (const challengeData of lessonData.challenges) {
          const { error: challengeError } = await supabase
            .from('challenges')
            .insert({
              lesson_id: lesson.id,
              type: challengeData.type,
              question: challengeData.question,
              options: challengeData.options || [],
              correct_index: challengeData.correctIndex,
              template: challengeData.template || null,
              answer: challengeData.answer || null,
              explanation: challengeData.explanation,
              xp_reward: 10
            });

          if (challengeError) throw challengeError;
          totalChallenges++;
        }
      }

      console.log(`   - Seeded ${trackData.name}: ${trackData.modules.length} modules, ${trackData.lessons.length} lessons`);
    }

    console.log(`\n🎉 Supabase Database Seeded Successfully!`);
    console.log(`📊 Total Seeded: ${tracksData.length} tracks, ${totalModules} modules, ${totalLessons} lessons, ${totalChallenges} challenges.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
