import { Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../config/db';
import { createNotification } from '../utils/notifications';


// Helper to slugify track name
const slugify = (text: string | number): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

// Helper to pad challenges to exactly 5 for getMockBlueprint
const padChallenges = (challenges: any[], lessonTitle: string, trackName: string): any[] => {
  const padded = [...challenges];
  
  if (padded.length < 3) {
    padded.push({
      type: 'multiple-choice',
      question: `In an enterprise production system, how is the concept of "${lessonTitle}" typically applied?`,
      options: [
        'To optimize resource allocation and improve system resilience under high client load.',
        'To bypass local validation schemas.',
        'To force garbage collection sweeps on the heap.',
        'To delete unused data records automatically.'
      ],
      correct_index: 0,
      explanation: `Applying "${lessonTitle}" in production environments ensures components remain highly available, scalable, and modular.`
    });
  }

  if (padded.length < 4) {
    padded.push({
      type: 'fill-blank',
      question: `Complete the syntax to check state parameters for "${lessonTitle}":`,
      template: `if (state === "___") { runCheck(); }`,
      answer: 'active',
      explanation: 'Checking active status prevents null pointer errors.'
    });
  }

  if (padded.length < 5) {
    padded.push({
      type: 'multiple-choice',
      question: `Which of the following is a primary performance trade-off or edge case when using "${lessonTitle}"?`,
      options: [
        'Increased memory footprint vs execution latency reduction.',
        'Slower network upload speeds only.',
        'Data security rules are completely disabled.',
        'The application must run in JIT compiler mode only.'
      ],
      correct_index: 0,
      explanation: 'Managing resource caching and memory allocation requires balancing RAM utilization against lookup speed.'
    });
  }

  return padded.map(c => ({
    type: c.type || 'multiple-choice',
    question: c.question,
    options: c.options || [],
    correct_index: c.correct_index !== undefined ? c.correct_index : (c.correctIndex !== undefined ? c.correctIndex : 0),
    template: c.template || null,
    answer: c.answer || null,
    explanation: c.explanation || 'Review the core concept to understand this behavior.'
  }));
};

// Seeding/Mock blueprint content when Gemini key is not present or fails
const getMockBlueprint = (skill: string, level: string, goal: string): any => {
  const normalizedSkill = skill.trim();
  const normalizedLevel = level.toLowerCase().trim();
  const normalizedGoal = goal.toLowerCase().trim();

  // Define customization parameters based on level and goal
  let trackName = '';
  let trackDesc = '';
  let capstoneTitle = '';
  let capstoneDesc = '';
  let capstoneReqs = [];
  
  let mod1Name = '';
  let mod1Obj = '';
  let mod1ProjTitle = '';
  let mod1ProjDesc = '';
  let mod1ProjReqs = [];

  let mod2Name = '';
  let mod2Obj = '';
  let mod2ProjTitle = '';
  let mod2ProjDesc = '';
  let mod2ProjReqs = [];

  let lesson1Title = '';
  let lesson1ConceptTitle = '';
  let lesson1ConceptContent = '';
  let lesson1Highlights = [];
  let lesson1ExampleCode = '';
  let lesson1ExampleExplanation = '';
  let lesson1PracticeInstruction = '';
  let lesson1PracticeTemplate = '';
  let lesson1PracticeAnswer = '';
  let lesson1Summary = '';
  let lesson1Challenges = [];

  let lesson2Title = '';
  let lesson2ConceptTitle = '';
  let lesson2ConceptContent = '';
  let lesson2Highlights = [];
  let lesson2ExampleCode = '';
  let lesson2ExampleExplanation = '';
  let lesson2PracticeInstruction = '';
  let lesson2PracticeTemplate = '';
  let lesson2PracticeAnswer = '';
  let lesson2Summary = '';
  let lesson2Challenges = [];

  let lesson3Title = '';
  let lesson3ConceptTitle = '';
  let lesson3ConceptContent = '';
  let lesson3Highlights = [];
  let lesson3ExampleCode = '';
  let lesson3ExampleExplanation = '';
  let lesson3PracticeInstruction = '';
  let lesson3PracticeTemplate = '';
  let lesson3PracticeAnswer = '';
  let lesson3Summary = '';
  let lesson3Challenges = [];

  let lesson4Title = '';
  let lesson4ConceptTitle = '';
  let lesson4ConceptContent = '';
  let lesson4Highlights = [];
  let lesson4ExampleCode = '';
  let lesson4ExampleExplanation = '';
  let lesson4PracticeInstruction = '';
  let lesson4PracticeTemplate = '';
  let lesson4PracticeAnswer = '';
  let lesson4Summary = '';
  let lesson4Challenges = [];
  
  let color = 'hsl(217, 91%, 60%)';
  let icon = 'code';
  
  // 1. BEGINNER LEVEL
  if (normalizedLevel === 'beginner') {
    color = 'hsl(217, 91%, 60%)';
    icon = 'code';
    if (normalizedGoal.includes('job')) {
      trackName = `${normalizedSkill}: Job-Ready Foundations (Beginner)`;
      trackDesc = `Gain immediate, employable skills in ${normalizedSkill}. Learn how to configure local setups, implement core widgets, and build standard portfolio-ready assets.`;
      capstoneTitle = `Deploy a Portfolio-Ready ${normalizedSkill} Application`;
      capstoneDesc = `Construct and publish a fully functioning, well-documented beginner application utilizing the core syntax and components of ${normalizedSkill}.`;
      capstoneReqs = [
        'Set up a clean, scalable workspace repository.',
        'Declare variables, parse user inputs, and build responsive interfaces.',
        'Handle local data storage or state transitions cleanly.',
        'Verify production building processes.'
      ];
      
      mod1Name = 'Foundations, Terminology, and Workspace Setup';
      mod1Obj = 'Understand the terminology, workspace installation, and configuration patterns of the technology stack.';
      mod1ProjTitle = 'Local Workspace Configuration';
      mod1ProjDesc = 'Initialize a blank project repository, verify execution CLI commands, and configure system path variables.';
      mod1ProjReqs = ['Download runtimes', 'Verify --version logs', 'Push basic greeting code'];

      mod2Name = 'Core Widgets & UI Layouts';
      mod2Obj = 'Assemble user interfaces using standard widgets, layouts, inputs, and layout trees.';
      mod2ProjTitle = 'Interactive Form Builder';
      mod2ProjDesc = 'Construct an interactive interface containing inputs, submit buttons, and stateful widgets.';
      mod2ProjReqs = ['Collect text input fields', 'Validate field values', 'Update layout dynamically'];

      lesson1Title = 'Introduction to Flutter and Setup';
      lesson1ConceptTitle = `Welcome to ${normalizedSkill}`;
      lesson1ConceptContent = `${normalizedSkill} is an industry-standard engineering stack. For job preparation, it is critical to understand its market position, core terminology, and compiler properties.\n\nWe will examine how packages are built, managed, and structured in clean enterprise pipelines.`;
      lesson1Highlights = [normalizedSkill, 'workspace', 'architecture'];
      lesson1ExampleCode = `// Bootstrapping the environment\nconsole.log("Ready to build job portfolios!");`;
      lesson1ExampleExplanation = 'Outputs a verification line to standard console logs.';
      lesson1PracticeInstruction = 'Complete the statement to print success to the console:';
      lesson1PracticeTemplate = 'console.___("Workspace Setup Complete");';
      lesson1PracticeAnswer = 'log';
      lesson1Summary = 'You configured the workspace, initialized the project settings, and executed a hello-world validation log.';
      lesson1Challenges = [
        {
          type: 'multiple-choice',
          question: `What is the focus of a Job Prep path in ${normalizedSkill}?`,
          options: ['To study historical math theories.', 'To gain immediately employable skills and write production-ready code.', 'To rewrite underlying compilers.', 'To skip local installation entirely.'],
          correct_index: 1,
          explanation: 'Job preparation focuses on industry best practices, structured setups, and porting deployable apps.'
        },
        {
          type: 'fill-blank',
          question: 'The output channel that displays application logs is the ___:',
          template: '___ console',
          answer: 'terminal',
          explanation: 'The terminal console is the standard output tool for runtime debugging logs.'
        }
      ];
      
      lesson2Title = 'Workspace Configuration';
      lesson2ConceptTitle = 'Configuring Runtimes & CLIs';
      lesson2ConceptContent = 'To prepare for professional workflows, installing the correct SDK versions, PATH variables, and editor extensions is key.\n\nEnsuring that binaries execute globally in the shell saves time during build automation pipelines.';
      lesson2Highlights = ['SDK', 'CLI', 'PATH'];
      lesson2ExampleCode = `${slugify(normalizedSkill)} --version`;
      lesson2ExampleExplanation = 'CLI command flags display the exact active environment version.';
      lesson2PracticeInstruction = 'Enter the version verification command flag:';
      lesson2PracticeTemplate = `${slugify(normalizedSkill)} --___`;
      lesson2PracticeAnswer = 'version';
      lesson2Summary = 'Installing runtimes and setting system PATH directories enables universal command line tasks.';
      lesson2Challenges = [
        {
          type: 'multiple-choice',
          question: 'Why do we need correct system PATH variables?',
          options: ['To verify compiler version commands from any folder in terminal.', 'To store secure password hashes.', 'To accelerate local web loading speeds.', 'To download third-party files automatically.'],
          correct_index: 0,
          explanation: 'Adding binary paths to the OS PATH variable enables globally launching commands in the console shell.'
        },
        {
          type: 'fill-blank',
          question: 'The text command interface is the command line ___:',
          template: '___ interface',
          answer: 'interface',
          explanation: 'A Command Line Interface (CLI) is utilized to trigger binary workflows.'
        }
      ];

      lesson3Title = 'Stateless & Stateful Widgets Layouts';
      lesson3ConceptTitle = 'UI Component Basics';
      lesson3ConceptContent = 'Variables reference data addresses in system memory. Components compose layouts by structuring layout tags and variables.\n\nUsing clean coding variables prevents memory leaks and ensures high performance.';
      lesson3Highlights = ['variables', 'layouts', 'components'];
      lesson3ExampleCode = `let skillName = "${normalizedSkill}";\nlet count = 0;`;
      lesson3ExampleExplanation = 'Initializes mutable variables to track UI state in memory.';
      lesson3PracticeInstruction = 'Declare a mutable let variable score and set it to 100:';
      lesson3PracticeTemplate = 'let ___ = 100;';
      lesson3PracticeAnswer = 'score';
      lesson3Summary = 'Defining variables and binding them to component parameters creates dynamic interactive interfaces.';
      lesson3Challenges = [
        {
          type: 'multiple-choice',
          question: 'Which is a literal boolean primitive type?',
          options: ['"true"', 'false', '0', 'NULL'],
          correct_index: 1,
          explanation: 'false without quotes represents a boolean state.'
        },
        {
          type: 'fill-blank',
          question: 'Complete the string assignment containing the word beginner:',
          template: 'let difficulty = "___";',
          answer: 'beginner',
          explanation: 'Quotation marks delineate literal text values.'
        }
      ];

      lesson4Title = 'Interactive Inputs & Basic Navigation';
      lesson4ConceptTitle = 'Adding Logic and Forms';
      lesson4ConceptContent = 'Dynamic applications must process user inputs and route users between screens. Conditionals execute branching code blocks based on logic checks.\n\nValidating forms prevents invalid payloads from hitting backend databases.';
      lesson4Highlights = ['conditionals', 'inputs', 'routing'];
      lesson4ExampleCode = `if (score >= 50) {\n  navigate("/dashboard");\n} else {\n  alert("Incomplete");\n}`;
      lesson4ExampleExplanation = 'Redirects users dynamically depending on form state verification.';
      lesson4PracticeInstruction = 'Complete the conditional logic check keyword:';
      lesson4PracticeTemplate = '___ (score >= 50) {\n  console.log("Success");\n}';
      lesson4PracticeAnswer = 'if';
      lesson4Summary = 'Forms and conditionals let interfaces react dynamically to user input entries.';
      lesson4Challenges = [
        {
          type: 'multiple-choice',
          question: 'When does the else block execute?',
          options: ['When prior checks evaluate to true.', 'When prior checks evaluate to false.', 'Only on system crash.', 'When local variables are missing.'],
          correct_index: 1,
          explanation: 'Else statements execute fallback workflows when prior check parameters resolve to false.'
        },
        {
          type: 'fill-blank',
          question: 'Complete the comparison operator to check inequality:',
          template: 'if (status ___ "completed")',
          answer: '!=',
          explanation: '!= is the inequality operator.'
        }
      ];
    } else if (normalizedGoal.includes('interview')) {
      trackName = `${normalizedSkill}: Technical Interview Masterclass (Beginner)`;
      trackDesc = `Prepare for beginner technical assessments in ${normalizedSkill}. Master framework lifecycles, widget trees, and standard interview trivia.`;
      capstoneTitle = `Mock Technical Interview & Quiz Dashboard`;
      capstoneDesc = `Build an interactive dashboard containing a simulated technical screening assessment for ${normalizedSkill}.`;
      capstoneReqs = [
        'Design a timed quiz interface with tracking mechanisms.',
        'Implement whiteboard algorithm questions.',
        'Detail runtime complexity calculations in documentation.',
        'Validate correct answer selections dynamically.'
      ];
      
      mod1Name = 'Framework Core Concepts & Quiz Topics';
      mod1Obj = 'Understand the historical foundations, widget architecture, and memory lifecycles tested in technical screenings.';
      mod1ProjTitle = 'Interview Simulator Script';
      mod1ProjDesc = 'Write a terminal quiz runner that evaluates answers to common technical queries and tallies points.';
      mod1ProjReqs = ['Tally multiple questions', 'Track correct indices', 'Output percentage score'];

      mod2Name = 'Stateless vs Stateful Widgets Lifecycle';
      mod2Obj = 'Master the difference between stateless widgets, stateful lifecycles, and render trees frequently queried in coding rounds.';
      mod2ProjTitle = 'Lifecycle State Tracker';
      mod2ProjDesc = 'Create a simple widget that logs state transitions (init, build, dispose) to terminal logs.';
      mod2ProjReqs = ['Override init/dispose hooks', 'Print lifecycle states', 'Identify memory cleanup points'];

      lesson1Title = 'Understanding Widget Trees & Elements';
      lesson1ConceptTitle = 'The Three Trees Architecture';
      lesson1ConceptContent = `In ${normalizedSkill} interviews, candidates are frequently asked to explain the Three Trees: Widget, Element, and RenderObject.\n\nWidgets are lightweight configurations; Elements coordinate lifecycles; RenderObjects draw the actual pixels on the viewport screen.`;
      lesson1Highlights = ['widget tree', 'element tree', 'render object'];
      lesson1ExampleCode = `// Typical interview Q: What is a Widget?\n// Answer: A configuration blueprint for an Element.`;
      lesson1ExampleExplanation = 'Explains the conceptual purpose of declarative widget items.';
      lesson1PracticeInstruction = 'Complete the conceptual sentence: Widgets are immutable configurations:';
      lesson1PracticeTemplate = 'let widgetDescription = "immutable ___";';
      lesson1PracticeAnswer = 'configurations';
      lesson1Summary = 'You learned about the three trees architecture and element coordination mechanics.';
      lesson1Challenges = [
        {
          type: 'multiple-choice',
          question: 'What is the role of an Element in the tree architecture?',
          options: ['It contains static styles.', 'It manages the lifecycle state of widgets and links configurations to render configurations.', 'It handles server network calls.', 'It compiles native code.'],
          correct_index: 1,
          explanation: 'Elements represent an instantiation of a widget at a specific location in the tree, managing lifecycles.'
        },
        {
          type: 'fill-blank',
          question: 'The actual graphics on screen are drawn by the RenderObject tree:',
          template: 'Render___ tree',
          answer: 'Object',
          explanation: 'RenderObject handles sizing, layout, and painting operations.'
        }
      ];
      
      lesson2Title = 'Dart Language Core Quiz Topics';
      lesson2ConceptTitle = 'How Dart Compiles & Executes';
      lesson2ConceptContent = `Dart is the language powering ${normalizedSkill}. Interviews test your knowledge of JIT (Just-In-Time) compilation for hot reload and AOT (Ahead-Of-Time) compilation for release builds.\n\nUnderstanding Dart\'s single-threaded event loop execution queue is vital for async programming questions.`;
      lesson2Highlights = ['JIT', 'AOT', 'event loop'];
      lesson2ExampleCode = `void main() {\n  print("Hello Dart!");\n}`;
      lesson2ExampleExplanation = 'Entry point function required in all Dart programs.';
      lesson2PracticeInstruction = 'Enter the main function declaration keyword:';
      lesson2PracticeTemplate = '___ main() { }';
      lesson2PracticeAnswer = 'void';
      lesson2Summary = 'Dart uses JIT compilation during development for hot reload, and AOT compilation for release builds.';
      lesson2Challenges = [
        {
          type: 'multiple-choice',
          question: 'Which compilation mode enables Hot Reload in development?',
          options: ['AOT (Ahead-Of-Time)', 'JIT (Just-In-Time)', 'Decompilation', 'Transpilation'],
          correct_index: 1,
          explanation: 'JIT compilation compiles code on the fly, enabling rapid updates (Hot Reload).'
        },
        {
          type: 'fill-blank',
          question: 'Dart code runs inside a single-threaded execution context called an isolate:',
          template: '___ context',
          answer: 'isolate',
          explanation: 'Dart code runs inside isolates, which have their own private memory heaps.'
        }
      ];

      lesson3Title = 'Stateless vs Stateful Widgets Internals';
      lesson3ConceptTitle = 'Widget Rebuilding Mechanics';
      lesson3ConceptContent = 'Stateless widgets are immutable configuration details, whereas Stateful widgets maintain state instances that persist across rebuilds.\n\nCalling setState() schedules a build phase, triggering a redrawing loop on the Element.';
      lesson3Highlights = ['setState', 'lifecycle', 'rebuilds'];
      lesson3ExampleCode = `setState(() {\n  _counter++;\n});`;
      lesson3ExampleExplanation = 'setState notifies the framework that the internal state changed, scheduling a rebuild.';
      lesson3PracticeInstruction = 'Enter the state updater method name:';
      lesson3PracticeTemplate = '___(() { _value = 10; });';
      lesson3PracticeAnswer = 'setState';
      lesson3Summary = 'setState schedules widget rebuilds. Understanding state separation is highly tested in coding rounds.';
      lesson3Challenges = [
        {
          type: 'multiple-choice',
          question: 'Why must you avoid heavy tasks in build() methods?',
          options: ['Because it crashes the IDE.', 'Because build() runs frequently and must remain clean to prevent frame drops.', 'Because variables are private.', 'Because async code is forbidden.'],
          correct_index: 1,
          explanation: 'The build() method must be a pure, quick function since it is triggered frequently during rendering.'
        },
        {
          type: 'fill-blank',
          question: 'The method called exactly once when a stateful widget is inserted is initState:',
          template: '___State() method',
          answer: 'initState',
          explanation: 'initState is the entry hook for stateful lifecycles.'
        }
      ];

      lesson4Title = 'Basic Layout Constraints';
      lesson4ConceptTitle = 'How Layouts Calculate Sizing';
      lesson4ConceptContent = 'In Flutter, layout constraints flow Down the tree: Constraints go Down, Sizes go Up, Parent sets Position.\n\nUnderstanding how flex boxes, columns, and rows evaluate width/height parameters solves 90% of layout interview questions.';
      lesson4Highlights = ['constraints', 'flexbox', 'layout'];
      lesson4ExampleCode = `Row(children: [Text("Left"), Spacer(), Text("Right")]);`;
      lesson4ExampleExplanation = 'Distributes space horizontally using Spacer.';
      lesson4PracticeInstruction = 'Complete the layout rule: Constraints go down:';
      lesson4PracticeTemplate = 'let layoutRule = "Constraints go ___";';
      lesson4PracticeAnswer = 'down';
      lesson4Summary = 'Understanding constraints (down) and sizes (up) resolves common UI display bugs.';
      lesson4Challenges = [
        {
          type: 'multiple-choice',
          question: 'What happens if a child widget requests a size larger than its parent constraints?',
          options: ['It crashes the system.', 'The parent constraints override the child request, keeping it within bounds.', 'The screen turns blank.', 'It automatically scales down the font.'],
          correct_index: 1,
          explanation: 'Parent constraints are strict; children cannot bypass boundaries set by parents.'
        },
        {
          type: 'fill-blank',
          question: 'The alignment axis that runs vertically in a Column is the main axis:',
          template: '___ axis alignment',
          answer: 'main',
          explanation: 'MainAxis for Column runs vertically, whereas CrossAxis runs horizontally.'
        }
      ];
    } else {
      // Academic
      trackName = `${normalizedSkill}: Theoretical Principles (Beginner)`;
      trackDesc = `Analyze ${normalizedSkill} from a computer science perspective. Study cross-platform virtualization, declarative syntax grammars, and compilers.`;
      capstoneTitle = `Theoretical Research Report & Case Study`;
      capstoneDesc = `Compile an academic paper analyzing declarative UI rendering mathematics, comparative compile options, and framework metrics.`;
      capstoneReqs = [
        'Formulate formal definitions of declarative UI trees.',
        'Compare JIT/AOT performance graphs.',
        'Describe single-threaded event loop isolations.',
        'Document lexical grammar rules.'
      ];
      
      mod1Name = 'Declarative UI Paradigms & Architecture Theory';
      mod1Obj = 'Examine declarative UI math models, historical imperative UIs, and state-to-view compilation functions.';
      mod1ProjTitle = 'Formal Framework Comparison Paper';
      mod1ProjDesc = 'Draft a comparative analysis mapping declarative layout trees against traditional DOM modifications.';
      mod1ProjReqs = ['Explain tree diffing models', 'Analyze memory costs', 'Map compile strategies'];

      mod2Name = 'Dart Compilation & Syntax Rules';
      mod2Obj = 'Analyze Dart language compilation pipelines, syntax parsing, JIT/AOT architectures, and VM isolations.';
      mod2ProjTitle = 'Virtual Machine Isolation Report';
      mod2ProjDesc = 'Research and write a report detailing isolate execution environments and event loop scheduling.';
      mod2ProjReqs = ['Draw isolate heaps', 'Map microtask queues', 'Measure garbage collector logs'];

      lesson1Title = 'Declarative vs Imperative UI Theory';
      lesson1ConceptTitle = 'The State-to-View Function';
      lesson1ConceptContent = `In computer science, declarative UI is defined by the mathematical function: f(State) = View.\n\nImperative UI requires manual changes to UI elements, whereas declarative UI automatically derives the interface layout from the current state parameters.`;
      lesson1Highlights = ['declarative UI', 'state function', 'UI paradigms'];
      lesson1ExampleCode = `// Imperative: button.setText("Success");\n// Declarative: View = f(state)`;
      lesson1ExampleExplanation = 'Delineates the difference between manual mutation and structural mapping.';
      lesson1PracticeInstruction = 'Complete the declarative formula: f(State) = View:';
      lesson1PracticeTemplate = 'let formula = "f(State) = ___";';
      lesson1PracticeAnswer = 'View';
      lesson1Summary = 'Declarative systems map state values to visual representations using mathematical rendering pipelines.';
      lesson1Challenges = [
        {
          type: 'multiple-choice',
          question: 'What is the principal benefit of declarative UI models?',
          options: ['It uses less RAM.', 'It eliminates manual sync bugs by treating views as direct functions of state variables.', 'It requires no compilation.', 'It compiles to HTML only.'],
          correct_index: 1,
          explanation: 'Treating UIs as pure functions of state prevents desynchronization bugs between data and display components.'
        },
        {
          type: 'fill-blank',
          question: 'The imperative model requires developers to manually mutate layout nodes:',
          template: '___ layout nodes',
          answer: 'mutate',
          explanation: 'Imperative systems manually mutate nodes using getElementById or similar selectors.'
        }
      ];

      lesson2Title = 'Introduction to Compilers & Runtimes';
      lesson2ConceptTitle = 'Understanding JIT & AOT';
      lesson2ConceptContent = `Compilers translate human-readable source code into machine instructions. JIT (Just-in-Time) compilers translate source instructions dynamically during runtime execution.\n\nAOT (Ahead-of-Time) compilers output pre-compiled binary files prior to program execution, boosting performance.`;
      lesson2Highlights = ['compilers', 'JIT', 'AOT'];
      lesson2ExampleCode = `// Source Code -> Compiler -> Machine Instructions`;
      lesson2ExampleExplanation = 'Represents the standard pipeline of machine code compilation.';
      lesson2PracticeInstruction = 'Complete the abbreviation: Just-in-Time:';
      lesson2PracticeTemplate = 'let type = "Just-in-___";';
      lesson2PracticeAnswer = 'Time';
      lesson2Summary = 'JIT enables dynamic updates, whereas AOT compiles strict machine binaries for high runtime performance.';
      lesson2Challenges = [
        {
          type: 'multiple-choice',
          question: 'What is the primary advantage of AOT compilation?',
          options: ['Faster development compile times.', 'Increased execution performance and faster startup speeds.', 'It runs without an operating system.', 'It reduces security checks.'],
          correct_index: 1,
          explanation: 'AOT compiles code directly to machine-level binaries before execution, skipping runtime interpretation.'
        },
        {
          type: 'fill-blank',
          question: 'JIT compilation compiles code during runtime execution:',
          template: 'during ___ execution',
          answer: 'runtime',
          explanation: 'JIT (Just-in-Time) interprets and compiles source files while the application runs.'
        }
      ];

      lesson3Title = 'Syntax Grammars & Variables';
      lesson3ConceptTitle = 'Lexical Grammar Rules';
      lesson3ConceptContent = 'Lexical grammar defines the token rules for syntax validity. Variables bind identifiers to memory coordinates.\n\nStrongly typed compilation checks verify compatibility at build time, preventing class exception failures.';
      lesson3Highlights = ['grammar', 'type check', 'lexical'];
      lesson3ExampleCode = `int age = 20;\nString name = "Dart";`;
      lesson3ExampleExplanation = 'Declares strongly typed variables with explicit type prefixes.';
      lesson3PracticeInstruction = 'Enter the type prefix to declare a text variable:';
      lesson3PracticeTemplate = '___ title = "Course";';
      lesson3PracticeAnswer = 'String';
      lesson3Summary = 'Strong static typing checks variables during compilation, avoiding unexpected runtime failures.';
      lesson3Challenges = [
        {
          type: 'multiple-choice',
          question: 'What does a compiler parser do?',
          options: ['It displays UI layouts.', 'It builds an Abstract Syntax Tree (AST) to verify grammatical token structures.', 'It saves files to the cloud.', 'It runs code checks.'],
          correct_index: 1,
          explanation: 'Parsers analyze token patterns to structure an Abstract Syntax Tree (AST), checking for syntax compliance.'
        },
        {
          type: 'fill-blank',
          question: 'Variables that cannot be reassigned once set are called immutable constants:',
          template: '___ constants',
          answer: 'immutable',
          explanation: 'Immutable states protect data values from side-effect mutations.'
        }
      ];

      lesson4Title = 'Logic Tree Evaluations';
      lesson4ConceptTitle = 'Boolean Algebraic Operations';
      lesson4ConceptContent = 'Conditional logic branches program flow. Algebra expressions evaluate parameters, resolving paths using boolean math rules.\n\nParsing logic paths guarantees deterministic outputs under all parameter bounds.';
      lesson4Highlights = ['boolean logic', 'branching', 'determinism'];
      lesson4ExampleCode = `bool isEligible = (age >= 18) && isRegistered;`;
      lesson4ExampleExplanation = 'Evaluates eligibility status using logical AND operators.';
      lesson4PracticeInstruction = 'Complete the logical AND operator:';
      lesson4PracticeTemplate = 'bool result = cond1 ___ cond2;';
      lesson4PracticeAnswer = '&&';
      lesson4Summary = 'Logical conditions determine program pathways through algebraic execution proofs.';
      lesson4Challenges = [
        {
          type: 'multiple-choice',
          question: 'Which logic operator returns true if at least one condition evaluates to true?',
          options: ['&&', '||', '!', '=='],
          correct_index: 1,
          explanation: 'The logical OR operator (||) evaluates to true when either condition is met.'
        },
        {
          type: 'fill-blank',
          question: 'A program that always produces the same output for a given input is deterministic:',
          template: '___ program',
          answer: 'deterministic',
          explanation: 'Determinism ensures predictable logic branches without side-effect behaviors.'
        }
      ];
    }
  }

  // 2. INTERMEDIATE LEVEL
  if (normalizedLevel === 'intermediate') {
    color = 'hsl(142, 71%, 45%)';
    icon = 'globe';
    if (normalizedGoal.includes('job')) {
      trackName = `${normalizedSkill}: Practical Application (Intermediate)`;
      trackDesc = `Master practical workflows, package management, state stores, and try-catch diagnostics in ${normalizedSkill} for industrial application.`;
      capstoneTitle = `Build a Multi-Feature Portfolio ${normalizedSkill} Application`;
      capstoneDesc = `Construct and deploy a robust modular application integrating REST API calls, state controllers, and offline databases.`;
      capstoneReqs = [
        'Structure directories according to clean modular layouts.',
        'Integrate JSON web service calls with custom model parsing.',
        'Manage global state via centralized reactive stores.',
        'Implement offline SQLite or Hive caching strategies.'
      ];
      
      mod1Name = 'Practical Workflows & Package Managers';
      mod1Obj = 'Manage third-party libraries, compile manifests, and structure multi-module architectures.';
      mod1ProjTitle = 'Modular Dependency Configurator';
      mod1ProjDesc = 'Configure dependency locks, install networking libraries, and parse complex JSON objects.';
      mod1ProjReqs = ['Configure manifest files', 'Import client packages', 'Write custom deserializers'];

      mod2Name = 'Centralized State & Offline Storage';
      mod2Obj = 'Build reactive stores, map state lifecycles, and handle database persistence layers.';
      mod2ProjTitle = 'Offline Caching Dashboard';
      mod2ProjDesc = 'Construct a view that displays offline database cache data when internet connection is lost.';
      mod2ProjReqs = ['Write database schemas', 'Handle connection timeouts', 'Sync data dynamically'];

      lesson1Title = 'Design Patterns & Directory Structure';
      lesson1ConceptTitle = 'Structuring Scalable Code';
      lesson1ConceptContent = 'Industrial developers structure codebases using MVC or Feature-First architectures.\n\nDecoupling components from business services makes files easier to update, test, and maintain across large engineering teams.';
      lesson1Highlights = ['architecture', 'modular', 'scalable'];
      lesson1ExampleCode = `import { fetchProfile } from './services/profileService.js';`;
      lesson1ExampleExplanation = 'Imports separated network logic from a dedicated business services directory.';
      lesson1PracticeInstruction = 'Complete the statement to import a helper module:';
      lesson1PracticeTemplate = '___ { calculateTax } from "./utils/tax.js";';
      lesson1PracticeAnswer = 'import';
      lesson1Summary = 'Isolating concerns in modular file trees keeps code clean and testable.';
      lesson1Challenges = [
        {
          type: 'multiple-choice',
          question: 'What is the principal benefit of modular folder architectures?',
          options: ['Faster compile speeds.', 'Code isolation, which minimizes merge conflicts and regression bugs.', 'It allows skipping variable declarations.', 'It locks the file system.'],
          correct_index: 1,
          explanation: 'Splitting folders by feature domains isolates changes, preventing unrelated features from breaking.'
        },
        {
          type: 'fill-blank',
          question: 'The keyword used to export classes or helper objects is export:',
          template: '___ default class ApiClient {}',
          answer: 'export',
          explanation: 'The export statement exposes elements to other modules.'
        }
      ];

      lesson2Title = 'Dependencies & Packages';
      lesson2ConceptTitle = 'Managing External Libraries';
      lesson2ConceptContent = 'Package managers fetch community libraries. Lockfiles record exact dependency hashes, ensuring identical installations across developers and build runner instances.';
      lesson2Highlights = ['packages', 'dependencies', 'lockfile'];
      lesson2ExampleCode = 'npm install axios';
      lesson2ExampleExplanation = 'Installs an HTTP package and writes details to the manifest.';
      lesson2PracticeInstruction = 'Complete the package manager install command:';
      lesson2PracticeTemplate = 'npm ___ lodash';
      lesson2PracticeAnswer = 'install';
      lesson2Summary = 'Version locks prevent system builds from breaking due to upstream updates.';
      lesson2Challenges = [
        {
          type: 'multiple-choice',
          question: 'Why commit lockfiles to source repository systems?',
          options: ['To store code backups.', 'To guarantee all environments use the exact same package version hashes.', 'To encrypt database passwords.', 'To compile files faster.'],
          correct_index: 1,
          explanation: 'Lockfiles record exact sub-dependency version hashes, preventing differences during builds.'
        },
        {
          type: 'fill-blank',
          question: 'NPM stands for Node Package Manager:',
          template: 'Node Package ___',
          answer: 'Manager',
          explanation: 'Node Package Manager handles library lifecycles.'
        }
      ];

      lesson3Title = 'Centralized State Control';
      lesson3ConceptTitle = 'Managing Reactive Stores';
      lesson3ConceptContent = 'Reactive state stores decouple state variables from layout rendering widgets. Centralized stores notify listening components when data values change.';
      lesson3Highlights = ['state store', 'reactivity', 'decoupling'];
      lesson3ExampleCode = 'const [profile, setProfile] = useState({ id: 1 });';
      lesson3ExampleExplanation = 'Sets up a reactive hook to track user profile data.';
      lesson3PracticeInstruction = 'Complete the React state hook:';
      lesson3PracticeTemplate = 'const [score, setScore] = ___ (0);';
      lesson3PracticeAnswer = 'useState';
      lesson3Summary = 'State management coordinates data synchronization across multi-screen app dashboards.';
      lesson3Challenges = [
        {
          type: 'multiple-choice',
          question: 'What is the hazard of unmanaged state variables?',
          options: ['The database crashes.', 'Desynchronized data, where views show outdated or contradictory information.', 'Compile errors.', 'Memory leaks only.'],
          correct_index: 1,
          explanation: 'Without state coordination, updates to a value may fail to propagate, resulting in view bugs.'
        },
        {
          type: 'fill-blank',
          question: 'A global state container is commonly called a state store:',
          template: 'a state ___',
          answer: 'store',
          explanation: 'A store is a centralized data repository.'
        }
      ];

      lesson4Title = 'Try-Catch Error Handling';
      lesson4ConceptTitle = 'Robust Defensive Coding';
      lesson4ConceptContent = 'Uncaught exceptions crash runtime loops, destroying user retention. Try/catch blocks catch errors, enabling logging and displaying fallback screens.';
      lesson4Highlights = ['try-catch', 'exception', 'validation'];
      lesson4ExampleCode = 'try {\n  await saveData();\n} catch (err) {\n  log(err);\n}';
      lesson4ExampleExplanation = 'Wraps unsafe actions in error handlers to prevent system crashes.';
      lesson4PracticeInstruction = 'Complete the error catcher block keyword:';
      lesson4PracticeTemplate = 'try {\n  runTask();\n} ___ (e) {\n  console.error(e);\n}';
      lesson4PracticeAnswer = 'catch';
      lesson4Summary = 'Defensive coding protects application runtimes from network and storage failures.';
      lesson4Challenges = [
        {
          type: 'multiple-choice',
          question: 'What is the purpose of the finally block?',
          options: ['To suppress all errors.', 'To execute cleanup actions regardless of whether an error occurred.', 'To restart the compiler.', 'To encrypt logs.'],
          correct_index: 1,
          explanation: 'The finally block executes its code after try/catch exits, ensuring cleanup tasks run.'
        },
        {
          type: 'fill-blank',
          question: 'Handling errors gracefully to prevent crashes is called defensive coding:',
          template: '___ coding',
          answer: 'defensive',
          explanation: 'Defensive programming anticipates errors and handles them proactively.'
        }
      ];
    } else if (normalizedGoal.includes('interview')) {
      trackName = `${normalizedSkill}: Intermediate Coding Assessments`;
      trackDesc = `Pass intermediate coding tests and technical interviews. Master state management tradeoffs, lifecycle optimizations, and API coding tasks.`;
      capstoneTitle = `Timed API Integration Coding Challenge`;
      capstoneDesc = `Develop a fully functional application under timed mock conditions, integrating API queries and state stores.`;
      capstoneReqs = [
        'Complete implementation within a 60-minute mock timeline.',
        'Isolate components and write modular test cases.',
        'Explain state choice tradeoffs during the mock evaluation.',
        'Write clean try-catch blocks and handle status errors.'
      ];
      
      mod1Name = 'Managing State: Bloc vs Riverpod Tradeoffs';
      mod1Obj = 'Examine differences between state patterns (Bloc, Riverpod, Provider) often queried in senior interviews.';
      mod1ProjTitle = 'State Pattern Refactor Challenge';
      mod1ProjDesc = 'Refactor an app from Provider to Bloc, documenting architectural tradeoffs and data flows.';
      mod1ProjReqs = ['Map data event streams', 'Eliminate rebuild calls', 'Implement test mocks'];

      mod2Name = 'Advanced Lifecycle & Navigation Mock Qs';
      mod2Obj = 'Master complex widget lifecycles, navigation stack states, and routing questions from technical assessments.';
      mod2ProjTitle = 'Navigation Stack Inspector';
      mod2ProjDesc = 'Build a router that logs push/pop events, answering questions on navigation hierarchy.';
      mod2ProjReqs = ['Intercept route events', 'Explain deep links', 'Debug stack overflows'];

      lesson1Title = 'State Management Interview Questions';
      lesson1ConceptTitle = 'Bloc vs Riverpod vs Provider';
      lesson1ConceptContent = `Technical interviewers expect candidates to compare state models. Provider relies on InheritedWidgets; Riverpod uses global providers; Bloc enforces unidirectional stream events.\n\nChoosing the correct pattern depends on project size, testability requirements, and complexity bounds.`;
      lesson1Highlights = ['provider', 'riverpod', 'bloc'];
      lesson1ExampleCode = `// Bloc: Event -> State mapping\n// Riverpod: ProviderRef reads state`;
      lesson1ExampleExplanation = 'Delineates state update paths across different architectures.';
      lesson1PracticeInstruction = 'Unidirectional events are associated with the Bloc pattern:';
      lesson1PracticeTemplate = 'let pattern = "___";';
      lesson1PracticeAnswer = 'Bloc';
      lesson1Summary = 'Different state patterns resolve state syncing with varying testing and architectural trade-offs.';
      lesson1Challenges = [
        {
          type: 'multiple-choice',
          question: 'What mechanism does Provider use under the hood in Flutter?',
          options: ['Direct memory writes.', 'InheritedWidget, which propagates updates down the build context.', 'Database streams.', 'Native bridges.'],
          correct_index: 1,
          explanation: 'Provider wraps InheritedWidgets to pass data down the widget tree without manual parameters.'
        },
        {
          type: 'fill-blank',
          question: 'Unidirectional data flows make state changes highly predictable:',
          template: 'highly ___',
          answer: 'predictable',
          explanation: 'Unidirectional flows simplify tracking and debugging state changes.'
        }
      ];

      lesson2Title = 'Widget Lifecycle Hook Questions';
      lesson2ConceptTitle = 'DidUpdateWidget & Rebuilds';
      lesson2ConceptContent = `In interviews, you must explain when didUpdateWidget() is called. It triggers when parent configurations change, requiring child states to evaluate updates.\n\nOptimizing didUpdateWidget prevents redundant rendering calculations.`;
      lesson2Highlights = ['didUpdateWidget', 'lifecycle', 'rebuilds'];
      lesson2ExampleCode = `@override\nvoid didUpdateWidget(MyWidget oldWidget) {\n  super.didUpdateWidget(oldWidget);\n}`;
      lesson2ExampleExplanation = 'Hook that intercepts parent configuration changes.';
      lesson2PracticeInstruction = 'Enter the lifecycle update method name:';
      lesson2PracticeTemplate = 'void ___ (MyWidget oldWidget) { }';
      lesson2PracticeAnswer = 'didUpdateWidget';
      lesson2Summary = 'didUpdateWidget matches parent config changes, allowing widgets to trigger state mutations.';
      lesson2Challenges = [
        {
          type: 'multiple-choice',
          question: 'When is didUpdateWidget called?',
          options: ['Only once during startup.', 'When the widget is disposed.', 'Whenever the parent widget rebuilds and passes new configurations.', 'During database initialization.'],
          correct_index: 2,
          explanation: 'It runs whenever parent configurations change, allowing local states to sync.'
        },
        {
          type: 'fill-blank',
          question: 'The cleanup hook called when removing a widget is dispose:',
          template: 'void ___ () { super.dispose(); }',
          answer: 'dispose',
          explanation: 'dispose() cleans up controllers and listeners to prevent memory leaks.'
        }
      ];

      lesson3Title = 'Asynchronous Flow Coding Tasks';
      lesson3ConceptTitle = 'Completing Tasks Under Timer';
      lesson3ConceptContent = 'Assessments often present async tasks. Managing Futures, Streams, and error timeouts determines code scores.\n\nUsing Future.wait() parallelizes calls, preventing latency issues.';
      lesson3Highlights = ['future', 'async', 'timer'];
      lesson3ExampleCode = `await Future.wait([fetchUsers(), fetchPosts()]);`;
      lesson3ExampleExplanation = 'Invokes multiple tasks concurrently, resolving when all actions exit.';
      lesson3PracticeInstruction = 'Enter the concurrent Future resolver method:';
      lesson3PracticeTemplate = 'await Future.___([task1(), task2()]);';
      lesson3PracticeAnswer = 'wait';
      lesson3Summary = 'Resolving async operations concurrently optimizes application loading and passes time constraints.';
      lesson3Challenges = [
        {
          type: 'multiple-choice',
          question: 'What is the danger of nested async callbacks?',
          options: ['It crashes the engine.', 'Callback hell, which destroys code readability and complicates error handling.', 'It blocks threads.', 'It forces garbage collection.'],
          correct_index: 1,
          explanation: 'Nesting callbacks creates unmaintainable paths; use async/await syntaxes instead.'
        },
        {
          type: 'fill-blank',
          question: 'The keyword utilized to halt execution until a Future completes is await:',
          template: '___ task();',
          answer: 'await',
          explanation: 'await yields isolate execution until the target task completes.'
        }
      ];

      lesson4Title = 'API Status Error Diagnostics';
      lesson4ConceptTitle = 'Handling HTTP Exceptions';
      lesson4ConceptContent = 'Coding challenges test API resilience. Handling HTTP status codes (400, 404, 500) gracefully is a requirement.\n\nThrowing specific custom exceptions makes debugging easier.';
      lesson4Highlights = ['status code', 'exception', 'api'];
      lesson4ExampleCode = `if (response.statusCode != 200) throw HttpException("Failed");`;
      lesson4ExampleExplanation = 'Evaluates status codes and raises errors for non-200 responses.';
      lesson4PracticeInstruction = 'Complete the check for successful OK status:';
      lesson4PracticeTemplate = 'if (response.statusCode == ___) { }';
      lesson4PracticeAnswer = '200';
      lesson4Summary = 'Status checking ensures the app only parses valid JSON data, handling errors gracefully.';
      lesson4Challenges = [
        {
          type: 'multiple-choice',
          question: 'What does a 404 HTTP status code mean?',
          options: ['Internal server error.', 'Unauthorized request.', 'Resource not found.', 'Bad gateway.'],
          correct_index: 2,
          explanation: '404 indicates that the requested endpoint or resource does not exist on the server.'
        },
        {
          type: 'fill-blank',
          question: 'HTTP status codes starting with 5 represent server errors:',
          template: '___ errors',
          answer: 'server',
          explanation: '5xx status codes indicate errors originating on the server.'
        }
      ];
    } else {
      // Academic
      trackName = `${normalizedSkill}: Comparative Architectures`;
      trackDesc = `Compare cross-platform compilation paradigms, asynchronous threads, and state math frameworks of ${normalizedSkill}.`;
      capstoneTitle = `Comparative State Propagation Thesis`;
      capstoneDesc = `Submit a research paper detailing memory layout shifts, rebuild metrics, and type-safe state models in ${normalizedSkill}.`;
      capstoneReqs = [
        'Model declarative rebuild propagation trees mathematically.',
        'Profile CPU cycles across state architectures.',
        'Graph UI frame budgets (16ms) under high state changes.',
        'Compare Dart Isolates against multi-threaded engines.'
      ];
      
      mod1Name = 'Dart Streams & Futures Async Programming Theory';
      mod1Obj = 'Analyze reactive programming math, Event Loop FIFO queues, Microtasks, and Stream controllers.';
      mod1ProjTitle = 'Event Loop Scheduling Proof';
      mod1ProjDesc = 'Map a series of Futures, Microtasks, and synchronous operations, proving execution order.';
      mod1ProjReqs = ['Draw scheduling timeline', 'Isolate microtask outputs', 'Calculate latency differentials'];

      mod2Name = 'Declarative State Propagation Mathematics';
      mod2Obj = 'Study tree diffing algorithms, O(N) complexity constraints, and state propagation models.';
      mod2ProjTitle = 'Diffing Algorithm Simulation';
      mod2ProjDesc = 'Write a simulation comparing direct layout tree rebuilding against node diff updates.';
      mod2ProjReqs = ['Calculate node distance metrics', 'Plot recursion depths', 'Compare performance bounds'];

      lesson1Title = 'Asynchronous Event Loop Theory';
      lesson1ConceptTitle = 'Isolate Thread Scheduling';
      lesson1ConceptContent = `In Dart, async operations rely on a single-threaded Event Loop processing two queues: Microtasks and Events.\n\nMicrotasks handle quick internal actions, while Events handle user input, files, and networks, maintaining UI fluidity.`;
      lesson1Highlights = ['event loop', 'microtasks', 'concurrency'];
      lesson1ExampleCode = `// Microtasks execute first, then Event queue callbacks.`;
      lesson1ExampleExplanation = 'Explains scheduling order inside single-threaded isolate engines.';
      lesson1PracticeInstruction = 'Complete the scheduling rule: Microtasks run before Events:';
      lesson1PracticeTemplate = 'let rule = "Microtasks run before ___";';
      lesson1PracticeAnswer = 'Events';
      lesson1Summary = 'Isolate loops coordinate operations through ordered queue scheduling pipelines.';
      lesson1Challenges = [
        {
          type: 'multiple-choice',
          question: 'What happens if a heavy, synchronous calculation is run on the main isolate?',
          options: ['It starts a new thread.', 'It blocks the event loop, causing frame drops and freezing the UI.', 'It shifts to background queues.', 'It runs faster.'],
          correct_index: 1,
          explanation: 'Since isolates are single-threaded, synchronous tasks block the loop, preventing rendering and input updates.'
        },
        {
          type: 'fill-blank',
          question: 'The queue that handles internal system adjustments is the microtask queue:',
          template: '___ queue',
          answer: 'microtask',
          explanation: 'The microtask queue executes prior to processing the event queue.'
        }
      ];

      lesson2Title = 'Reactivity Math & Streams';
      lesson2ConceptTitle = 'Stream Controller Math Models';
      lesson2ConceptContent = `Streams represent async data pipelines. Formally, a Stream is a time-indexed sequence of data events, notifying listeners on changes.\n\nUnderstanding streams helps model asynchronous data flows and reactive architectures.`;
      lesson2Highlights = ['streams', 'reactivity', 'mathematical model'];
      lesson2ExampleCode = `StreamController<int> ctrl = StreamController();\nctrl.stream.listen((v) => print(v));`;
      lesson2ExampleExplanation = 'Creates a data stream and registers an event listener handler.';
      lesson2PracticeInstruction = 'Complete the Stream handler registration method:';
      lesson2PracticeTemplate = 'stream.___((v) => print(v));';
      lesson2PracticeAnswer = 'listen';
      lesson2Summary = 'Streams deliver async data events, driving reactive state frameworks.';
      lesson2Challenges = [
        {
          type: 'multiple-choice',
          question: 'What is a broadcast stream?',
          options: ['A stream that deletes itself.', 'A stream that allows multiple listeners, whereas single-subscription streams only allow one listener.', 'A database link.', 'A compiler option.'],
          correct_index: 1,
          explanation: 'Broadcast streams support multiple subscribers, while standard streams only support one.'
        },
        {
          type: 'fill-blank',
          question: 'The class that coordinates stream data publishing is StreamController:',
          template: 'Stream___',
          answer: 'Controller',
          explanation: 'StreamControllers manage stream creation, consumption, and events.'
        }
      ];

      lesson3Title = 'Algorithm Complexity of Tree Diffing';
      lesson3ConceptTitle = 'Calculated Render Updates';
      lesson3ConceptContent = 'Rebuilding entire layout trees on every state change is computationally expensive (O(N^3)).\n\nModern frameworks implement O(N) heuristic diffing algorithms, comparing current and previous trees to update only modified nodes.';
      lesson3Highlights = ['O(N) complexity', 'diffing', 'recursion'];
      lesson3ExampleCode = `// Heuristic check: comparing keys and widget types at each tree node.`;
      lesson3ExampleExplanation = 'Explains how the layout tree identifies and updates changed nodes.';
      lesson3PracticeInstruction = 'Heuristic tree diffing reduces calculation complexity to O(N):';
      lesson3PracticeTemplate = 'let complexity = "O(___)";';
      lesson3PracticeAnswer = 'N';
      lesson3Summary = 'Heuristic diffing processes tree updates in linear time (O(N)), keeping UIs fluid.';
      lesson3Challenges = [
        {
          type: 'multiple-choice',
          question: 'Why does assigning keys to widget items speed up diffing?',
          options: ['Keys compile code faster.', 'Keys help the framework match widgets across state changes, preserving state and skipping rebuilds.', 'Keys encrypt data.', 'Keys are mandatory for layout.'],
          correct_index: 1,
          explanation: 'Keys uniquely identify widgets, helping the diffing algorithm track changes and avoid rebuilding identical nodes.'
        },
        {
          type: 'fill-blank',
          question: 'Heuristics reduce recalculations from polynomial back to linear time:',
          template: '___ time',
          answer: 'linear',
          explanation: 'Linear time complexity (O(N)) ensures smooth updates on every frame.'
        }
      ];

      lesson4Title = 'Memory Life Bounds';
      lesson4ConceptTitle = 'Garbage Collector Optimization';
      lesson4ConceptContent = 'Declarative frameworks create many short-lived widget configurations, requiring garbage collectors to clean up discarded objects quickly.\n\nDart uses generational garbage collection, optimizing memory management for high-frequency object lifetimes.';
      lesson4Highlights = ['garbage collector', 'memory heap', 'optimization'];
      lesson4ExampleCode = `// GC sweep: cleaning up dereferenced widget configs in the young generation heap.`;
      lesson4ExampleExplanation = 'Explains how the runtime sweeps unused memory allocations.';
      lesson4PracticeInstruction = 'Complete the name of the memory cleanup system: Garbage Collector:';
      lesson4PracticeTemplate = 'let system = "Garbage ___";';
      lesson4PracticeAnswer = 'Collector';
      lesson4Summary = 'Generational garbage collection cleans up short-lived objects quickly, preventing UI stutters.';
      lesson4Challenges = [
        {
          type: 'multiple-choice',
          question: 'What is generational garbage collection?',
          options: ['Cleaning memory only on restart.', 'Dividing the heap into young and old generations to clean short-lived objects faster.', 'Converting code to assembly.', 'It is not used in modern runtimes.'],
          correct_index: 1,
          explanation: 'Dart divides the heap into young (short-lived) and old generations, optimizing cleanups for temporary objects.'
        },
        {
          type: 'fill-blank',
          question: 'Generational cleaning prevents UI frame drops or jank:',
          template: 'frame ___',
          answer: 'jank',
          explanation: 'GC pauses cause frame drops (jank) if cleanup processes are unoptimized.'
        }
      ];
    }
  }

  // 3. ADVANCED LEVEL (Mastery)
  if (normalizedLevel === 'advanced') {
    color = 'hsl(262, 83%, 58%)';
    icon = 'cpu';
    if (normalizedGoal.includes('job')) {
      trackName = `${normalizedSkill}: Enterprise Architecture (Advanced)`;
      trackDesc = `Design enterprise-level application architecture, implement CI/CD build scripts, optimize memory, and write native bridges for ${normalizedSkill}.`;
      capstoneTitle = `Deploy a Scalable, High-Availability Production ${normalizedSkill} Infrastructure`;
      capstoneDesc = `Architect a multi-module enterprise app with clean architecture layers, custom platform integrations, and automated deployment pipelines.`;
      capstoneReqs = [
        'Implement clean architecture directories and modules.',
        'Configure dependency injections and robust mock environments.',
        'Write automated unit and UI tests with coverage checks.',
        'Automate builds and store uploads using CI/CD pipelines.'
      ];
      
      mod1Name = 'Clean Architecture & Modularization';
      mod1Obj = 'Separate concerns using data, domain, and presentation layers in large enterprise codebases.';
      mod1ProjTitle = 'Clean Architecture Refactoring';
      mod1ProjDesc = 'Refactor an application to clean architecture, separating data fetching, business logic, and UI display layers.';
      mod1ProjReqs = ['Write entity models', 'Isolate repository tests', 'Inject dependencies'];

      mod2Name = 'Production CI/CD & Automated Testing';
      mod2Obj = 'Automate testing, linting, building, and deploying applications to app stores using CI/CD runner pipelines.';
      mod2ProjTitle = 'App Store Deployment Pipeline';
      mod2ProjDesc = 'Write a GitHub Actions script that compiles releases, runs tests, signs binaries, and uploads builds to stores.';
      mod2ProjReqs = ['Configure build steps', 'Add test coverage checks', 'Automate signing parameters'];

      lesson1Title = 'Clean Architecture Design';
      lesson1ConceptTitle = 'Data, Domain & UI Separation';
      lesson1ConceptContent = 'Enterprise applications separate concerns into Data, Domain, and Presentation layers.\n\nThe Domain layer contains core business logic and rules, remaining completely independent of networking details and UI components.';
      lesson1Highlights = ['clean architecture', 'domain logic', 'testing'];
      lesson1ExampleCode = `class GetUserDataUseCase {\n  final UserRepository repo;\n  GetUserDataUseCase(this.repo);\n}`;
      lesson1ExampleExplanation = 'UseCase that depends on a repository interface, decoupling business logic from data sources.';
      lesson1PracticeInstruction = 'Complete the clean architecture layer name: data, presentation, and domain:';
      lesson1PracticeTemplate = 'let layers = ["data", "presentation", "___"];';
      lesson1PracticeAnswer = 'domain';
      lesson1Summary = 'Decoupling layers makes enterprise codebases highly testable and maintainable.';
      lesson1Challenges = [
        {
          type: 'multiple-choice',
          question: 'What is the principal rule of clean architecture?',
          options: ['All code must be in one file.', 'Dependency direction flows inward; domain logic must not depend on database or UI implementation details.', 'UI code must compile first.', 'It disables local caches.'],
          correct_index: 1,
          explanation: 'The dependency rule ensures that business logic remains independent of external frameworks, databases, or UI changes.'
        },
        {
          type: 'fill-blank',
          question: 'Decoupling dependencies simplifies writing automated unit tests:',
          template: 'automated unit ___',
          answer: 'tests',
          explanation: 'Isolating modules allows developers to mock dependencies for fast, reliable unit testing.'
        }
      ];

      lesson2Title = 'Performance Profiling & Memory Leak Optimization';
      lesson2ConceptTitle = 'Diagnosing Frame Drops';
      lesson2ConceptContent = 'High-concurrency systems run into memory leaks and database bottlenecks. Heap profilers and DevTools locate leaks and resource allocation issues.\n\nCaching layers optimize read speeds and reduce database loads.';
      lesson2Highlights = ['heap profiling', 'memory leak', 'optimization'];
      lesson2ExampleCode = `// Profiling allocations: checking for unclosed stream subscriptions.`;
      lesson2ExampleExplanation = 'heap analyzers identify objects that remain allocated in memory after use.';
      lesson2PracticeInstruction = 'Complete the name of the memory tracking tool: heap profiler:';
      lesson2PracticeTemplate = 'let tool = "heap ___";';
      lesson2PracticeAnswer = 'profiler';
      lesson2Summary = 'Profiling helps identify memory leaks and performance bottlenecks, ensuring smooth operation.';
      lesson2Challenges = [
        {
          type: 'multiple-choice',
          question: 'What is a memory leak?',
          options: ['Deleting files from disk.', 'Allocated memory that is no longer needed but is not released, reducing available system resources.', 'Unsaved database changes.', 'A secure login error.'],
          correct_index: 1,
          explanation: 'Memory leaks occur when objects are no longer in use but remain referenced, preventing garbage collection.'
        },
        {
          type: 'fill-blank',
          question: 'Unclosed stream subscriptions are a common cause of memory leaks:',
          template: 'memory ___',
          answer: 'leaks',
          explanation: 'Leaving stream listeners open prevents their parent widgets from being cleaned up, leaking memory.'
        }
      ];

      lesson3Title = 'CI/CD Pipeline Automation';
      lesson3ConceptTitle = 'Continuous Delivery Workflows';
      lesson3ConceptContent = 'Automated pipelines prevent human error and speed up releases. CI/CD systems run tests, check linting, build binaries, and handle deployments on every commit.';
      lesson3Highlights = ['CI/CD', 'YAML config', 'runner'];
      lesson3ExampleCode = 'name: Deploy\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: npm run build';
      lesson3ExampleExplanation = 'GitHub Actions pipeline that compiles the application on code pushes.';
      lesson3PracticeInstruction = 'Complete the pipeline execute step keyword:';
      lesson3PracticeTemplate = '- ___: npm run test';
      lesson3PracticeAnswer = 'run';
      lesson3Summary = 'Automated pipelines enforce code quality through testing and direct integration steps.';
      lesson3Challenges = [
        {
          type: 'multiple-choice',
          question: 'What is the primary benefit of Continuous Deployment (CD)?',
          options: ['It builds code faster.', 'It automates releasing and deploying tested builds directly to production environments.', 'It removes unused files.', 'It requires no servers.'],
          correct_index: 1,
          explanation: 'CD automates delivery, ensuring that verified updates are deployed to users quickly and reliably.'
        },
        {
          type: 'fill-blank',
          question: 'Pipeline configurations are commonly structured using yaml files:',
          template: '___ configuration files',
          answer: 'yaml',
          explanation: 'YAML files are the standard format for pipeline configurations.'
        }
      ];

      lesson4Title = 'Production Telemetry Logs';
      lesson4ConceptTitle = 'Structured Observability';
      lesson4ConceptContent = 'Monitoring system health in production requires logging, metrics, and tracing. Structured JSON logs make querying and analysis easy.\n\nMetrics collectors track request downtime and CPU usage, helping configure alerts.';
      lesson4Highlights = ['telemetry', 'JSON logs', 'monitoring'];
      lesson4ExampleCode = 'logger.info({ event: "db_query", latency: 5 });';
      lesson4ExampleExplanation = 'Logs event details as a JSON object, enabling search and aggregation.';
      lesson4PracticeInstruction = 'Complete the log level keyword:';
      lesson4PracticeTemplate = 'logger.___({ message: "Task completed" });';
      lesson4PracticeAnswer = 'info';
      lesson4Summary = 'Structured logs and metrics scrapers provide visibility into production systems.';
      lesson4Challenges = [
        {
          type: 'multiple-choice',
          question: 'Why are structured JSON logs preferred in production?',
          options: ['They are smaller.', 'They are easily queried and filtered by log management software.', 'They execute code.', 'They prevent database crashes.'],
          correct_index: 1,
          explanation: 'JSON logs allow log management software to index fields, enabling fast, precise searches.'
        },
        {
          type: 'fill-blank',
          question: 'Exposing metrics to monitor system health is called production telemetry:',
          template: 'production ___',
          answer: 'telemetry',
          explanation: 'Telemetry provides visibility into running systems through logs, metrics, and traces.'
        }
      ];
    } else if (normalizedGoal.includes('interview')) {
      trackName = `${normalizedSkill}: Enterprise Architecture Assessments`;
      trackDesc = `Ace senior architectural reviews and system design interviews in ${normalizedSkill}. Master scalability, cache design, and live refactoring.`;
      capstoneTitle = `Enterprise System Design Interview Challenge`;
      capstoneDesc = `Design and present a high-concurrency enterprise architecture diagram and mock implementation for ${normalizedSkill}.`;
      capstoneReqs = [
        'Structure a highly scalable, decoupled microservices layout.',
        'Address memory cache eviction strategies (e.g. LRU).',
        'Model data streams and handles to prevent memory leaks.',
        'Document performance and security tradeoffs.'
      ];
      
      mod1Name = 'Enterprise System Design & High Concurrency';
      mod1Obj = 'Design scalable structures, load balancers, caching strategies, and data propagation flows.';
      mod1ProjTitle = 'System Design Presentation';
      mod1ProjDesc = 'Draft architecture diagrams and design notes for an enterprise-level, high-throughput application.';
      mod1ProjReqs = ['Map data storage scaling', 'Design caching layers', 'Draft security architectures'];

      mod2Name = 'Senior Architect Mock Assessments';
      mod2Obj = 'Solve advanced system architecture problems and explain performance tradeoffs in mock interviews.';
      mod2ProjTitle = 'Performance Optimization Challenge';
      mod2ProjDesc = 'Refactor an unoptimized application layout, profiling memory allocations and resolving performance issues.';
      mod2ProjReqs = ['Detect memory leaks', 'Optimize build contexts', 'Verify frame rates'];

      lesson1Title = 'Advanced System Design Interviews';
      lesson1ConceptTitle = 'Architecting High-Throughput Apps';
      lesson1ConceptContent = `System design interviews evaluate your ability to structure complex systems. You must address database replication, load balancing, caching, and API design.\n\nDesigning modular, decoupled systems ensures scalability and high availability under load.`;
      lesson1Highlights = ['system design', 'scalability', 'caching'];
      lesson1ExampleCode = `// Architecture: Client -> Load Balancer -> Service Cluster -> Cache -> Database`;
      lesson1ExampleExplanation = 'Basic diagram representing a scalable, high-availability architecture.';
      lesson1PracticeInstruction = 'Complete the architecture component name: load balancer:';
      lesson1PracticeTemplate = 'let component = "load ___";';
      lesson1PracticeAnswer = 'balancer';
      lesson1Summary = 'System design involves balancing scalability, reliability, and cost trade-offs.';
      lesson1Challenges = [
        {
          type: 'multiple-choice',
          question: 'What is the primary goal of horizontal scaling?',
          options: ['Upgrading CPU hardware.', 'Adding more server instances to distribute traffic and improve availability.', 'Reducing storage costs.', 'Bypassing security checks.'],
          correct_index: 1,
          explanation: 'Horizontal scaling adds node instances to handle growing traffic, avoiding vertical hardware limits.'
        },
        {
          type: 'fill-blank',
          question: 'Distributing traffic across multiple servers is called load balancing:',
          template: 'load ___',
          answer: 'balancing',
          explanation: 'Load balancing distributes network traffic to prevent any single server from becoming a bottleneck.'
        }
      ];

      lesson2Title = 'Custom Paint and Rendering Optimization';
      lesson2ConceptTitle = 'Custom Graphics & Layout Optimization';
      lesson2ConceptContent = 'Technical assessments query your custom rendering capabilities. Custom UIs must optimize repaint boundaries to prevent redrawing the entire screen on every frame.\n\nIsolating complex paint operations inside repaint boundaries maintains high frame rates.';
      lesson2Highlights = ['custom paint', 'repaint boundary', 'rendering'];
      lesson2ExampleCode = `// Wrap complex paint calculations inside RepaintBoundary widgets.`;
      lesson2ExampleExplanation = 'Limits redrawing operations to the designated subtree, saving CPU cycles.';
      lesson2PracticeInstruction = 'Enter the boundary widget name: RepaintBoundary:';
      lesson2PracticeTemplate = 'const widget = ___ (child: paintWidget);';
      lesson2PracticeAnswer = 'Boundary';
      lesson2Summary = 'Optimizing custom rendering paths protects UIs from frame drops during complex animations.';
      lesson2Challenges = [
        {
          type: 'multiple-choice',
          question: 'Why implement RepaintBoundary widgets?',
          options: ['To add background colors.', 'To isolate painting operations, preventing sibling widgets from rebuilding unnecessarily.', 'To store database records.', 'To compile code.'],
          correct_index: 1,
          explanation: 'RepaintBoundaries isolate paint subtrees, saving rendering time by preventing unrelated layout redraws.'
        },
        {
          type: 'fill-blank',
          question: 'Repaint boundaries protect the application from drop-frames:',
          template: 'drop-___',
          answer: 'frames',
          explanation: 'Unoptimized drawing operations cause frame drops, resulting in choppy animations.'
        }
      ];

      lesson3Title = 'High-Concurrency Caching Strategies';
      lesson3ConceptTitle = 'Designing Fast Storage Access';
      lesson3ConceptContent = 'Assessments check your caching design. Implementing LRU (Least Recently Used) cache eviction policies prevents memory overflow while preserving fast access.\n\nCaching frequently queried data reduces database load and network latency.';
      lesson3Highlights = ['caching', 'eviction policy', 'concurrency'];
      lesson3ExampleCode = `// LRU: Evicting the oldest, unused item when the cache reaches capacity.`;
      lesson3ExampleExplanation = 'Evicting stale entries keeps the memory footprint bounded.';
      lesson3PracticeInstruction = 'Complete the eviction acronym: Least Recently Used:';
      lesson3PracticeTemplate = 'let policy = "___";';
      lesson3PracticeAnswer = 'Used';
      lesson3Summary = 'Cache eviction policies balance retrieval speeds against memory footprint constraints.';
      lesson3Challenges = [
        {
          type: 'multiple-choice',
          question: 'What is the danger of an unbounded cache?',
          options: ['Slow network calls.', 'Memory leaks and out-of-memory crashes as cache size grows indefinitely.', 'It deletes source files.', 'It blocks database ports.'],
          correct_index: 1,
          explanation: 'Without eviction policies, cache memory consumption grows indefinitely, leading to resource starvation.'
        },
        {
          type: 'fill-blank',
          question: 'LRU stands for Least Recently Used:',
          template: 'Least Recently ___',
          answer: 'Used',
          explanation: 'LRU caches evict the oldest accessed items first.'
        }
      ];

      lesson4Title = 'Memory Leak Diagnostics';
      lesson4ConceptTitle = 'Profiling Senior Codebases';
      lesson4ConceptContent = 'Senior coding rounds require resolving memory leaks. Candidates use tools like heap diffing to identify leaks and optimize memory allocations.\n\nClosing resources and stream subscriptions is key to code health.';
      lesson4Highlights = ['memory leaks', 'profiling', 'optimization'];
      lesson4ExampleCode = `// Profiling: identifying objects that remain allocated in memory after dispose.`;
      lesson4ExampleExplanation = 'Heap profiling tracks object lifecycles to locate memory leaks.';
      lesson4PracticeInstruction = 'Complete the diagnostic method: heap diffing:';
      lesson4PracticeTemplate = 'let process = "heap ___";';
      lesson4PracticeAnswer = 'diffing';
      lesson4Summary = 'Resolving memory leaks ensures application stability and performance under heavy load.';
      lesson4Challenges = [
        {
          type: 'multiple-choice',
          question: 'Which tool identifies memory leaks by comparing allocation states?',
          options: ['A compiler parser.', 'Heap profiling and memory snapshot diffing tools.', 'A syntax checker.', 'An API validator.'],
          correct_index: 1,
          explanation: 'Memory profiling tools compare heaps over time to isolate leaked objects.'
        },
        {
          type: 'fill-blank',
          question: 'Leaked objects are prevented from being swept by the garbage collector:',
          template: 'garbage ___',
          answer: 'collector',
          explanation: 'Active references prevent the garbage collector from reclaiming unused memory.'
        }
      ];
    } else {
      // Academic
      trackName = `${normalizedSkill}: Engineering Research (Advanced)`;
      trackDesc = `Conduct advanced academic research in ${normalizedSkill} engine compilation, Skia/Impeller graphics execution, and declarative syntax math.`;
      capstoneTitle = `Declarative UI Mathematical Optimization Thesis`;
      capstoneDesc = `Conduct research and defend a thesis analyzing JIT/AOT compiler differences, engine execution queues, and rendering math.`;
      capstoneReqs = [
        'Formulate mathematical models of compiler structures.',
        'Contrast Skia and Impeller graphics architectures.',
        'Graph memory allocation layouts in compiler heaps.',
        'Defend your research findings in a mock thesis defense.'
      ];
      
      mod1Name = 'JIT vs AOT Compilation & Flutter Engine Research';
      mod1Obj = 'Analyze compilation theory, bytecode interpretation, JIT hot reloading, and native AOT compilation.';
      mod1ProjTitle = 'Compiler Performance Benchmark';
      mod1ProjDesc = 'Measure and document execution latency differences between interpreted JIT and compiled AOT binaries.';
      mod1ProjReqs = ['Measure startup speeds', 'Profile memory utilization', 'Graph execution timings'];

      mod2Name = 'Rendering Engines: Skia vs Impeller Architecture Theory';
      mod2Obj = 'Analyze graphics rendering engines, pipeline structures, shader precompilations, and viewport performance.';
      mod2ProjTitle = 'Graphics Engine Performance Analysis';
      mod2ProjDesc = 'Research and write a report detailing rendering performance differences between Skia and Impeller.';
      mod2ProjReqs = ['Graph frame rendering times', 'Analyze shader precompilation', 'Measure GPU utilization'];

      lesson1Title = 'Compilation Theory & Bytecode';
      lesson1ConceptTitle = 'Just-in-Time vs Ahead-of-Time';
      lesson1ConceptContent = `Compilation theory analyzes how code is translated into machine instructions. JIT (Just-in-Time) compilers compile bytecode dynamically during execution.\n\nAOT (Ahead-of-Time) compilers pre-compile code into native machine binaries, improving startup speeds and runtime performance.`;
      lesson1Highlights = ['compilers', 'JIT', 'AOT'];
      lesson1ExampleCode = `// Native Compiler: Source Code -> AST -> Bytecode -> Machine Binary`;
      lesson1ExampleExplanation = 'Standard compiler pipeline for native compilation.';
      lesson1PracticeInstruction = 'Complete the abbreviation: Ahead-of-Time:';
      lesson1PracticeTemplate = 'let type = "Ahead-of-___";';
      lesson1PracticeAnswer = 'Time';
      lesson1Summary = 'JIT enables rapid iteration in development, while AOT provides high performance in production.';
      lesson1Challenges = [
        {
          type: 'multiple-choice',
          question: 'What is the primary benefit of AOT compilation?',
          options: ['Faster development compilation.', 'Increased execution performance and faster startup times.', 'No hardware requirements.', 'It runs without an OS.'],
          correct_index: 1,
          explanation: 'AOT compiles code directly to native machine binaries before execution, skipping runtime interpretation.'
        },
        {
          type: 'fill-blank',
          question: 'JIT compilation compiles code during runtime execution:',
          template: 'during ___ execution',
          answer: 'runtime',
          explanation: 'JIT (Just-in-Time) compiles code while the application is running.'
        }
      ];

      lesson2Title = 'Graphics Pipelines & Shader Compilation';
      lesson2ConceptTitle = 'Skia vs Impeller Architecture';
      lesson2ConceptContent = `Graphics engines draw visuals. Skia compiles shaders dynamically, causing frame drops (jank) on first draw.\n\nImpeller precompiles shaders during build time, ensuring smooth rendering performance in production.`;
      lesson2Highlights = ['graphics engine', 'Skia', 'Impeller'];
      lesson2ExampleCode = `// Impeller: Precompiling GLSL shaders to SPIR-V bytecode during compilation.`;
      lesson2ExampleExplanation = 'Precompiling shaders avoids runtime compilation overhead and frame drops.';
      lesson2PracticeInstruction = 'Complete the name of the new graphics engine: Impeller:';
      lesson2PracticeTemplate = 'let engine = "___";';
      lesson2PracticeAnswer = 'Impeller';
      lesson2Summary = 'Impeller precompiles shaders, avoiding Skia runtime compilation overhead.';
      lesson2Challenges = [
        {
          type: 'multiple-choice',
          question: 'Why does Skia sometimes cause jank on first animation draw?',
          options: ['Due to internet latency.', 'Because it compiles shaders dynamically during animation execution.', 'Because it uses too much disk space.', 'It does not support animations.'],
          correct_index: 1,
          explanation: 'Skia compiles shaders on the fly, which can take longer than the 16ms frame budget, causing jank.'
        },
        {
          type: 'fill-blank',
          question: 'Impeller precompiles shaders to prevent runtime jank:',
          template: 'prevent runtime ___',
          answer: 'jank',
          explanation: 'Precompiling shaders ensures smooth rendering and prevents frame drops.'
        }
      ];

      lesson3Title = 'Declarative UI Mathematical Optimization';
      lesson3ConceptTitle = 'Formal Graph Theory in UI Trees';
      lesson3ConceptContent = 'Declarative UI trees can be modeled using Graph Theory. Nodes represent components, while edges represent parent-child relationships.\n\nOptimizing tree updates involves minimizing graph differences, reducing layout recalculations.';
      lesson3Highlights = ['graph theory', 'tree traversal', 'optimization'];
      lesson3ExampleCode = `// Tree traversal: traversing nodes to find and update changed configurations.`;
      lesson3ExampleExplanation = 'Tree traversal algorithms update layout nodes efficiently.';
      lesson3PracticeInstruction = 'Declarative UI nodes are represented as a directed acyclic graph:';
      lesson3PracticeTemplate = 'let structure = "directed acyclic ___";';
      lesson3PracticeAnswer = 'graph';
      lesson3Summary = 'Modeling UI trees as graphs helps design efficient traversal and update algorithms.';
      lesson3Challenges = [
        {
          type: 'multiple-choice',
          question: 'What graph traversal algorithm is commonly used to build layout trees?',
          options: ['Binary search.', 'Depth-First Search (DFS) or Pre-Order traversal.', 'Dijkstra\'s algorithm.', 'Bubble sort.'],
          correct_index: 1,
          explanation: 'DFS/Pre-order traversal builds and lays out UI trees in parent-to-child order.'
        },
        {
          type: 'fill-blank',
          question: 'Graph traversal optimizes rendering by reducing node rebuilds:',
          template: 'reducing node ___',
          answer: 'rebuilds',
          explanation: 'Optimizing traversal paths minimizes redundant node updates and redraws.'
        }
      ];

      lesson4Title = 'Advanced Memory Heaps';
      lesson4ConceptTitle = 'Generational GC Mechanics';
      lesson4ConceptContent = 'Generational garbage collection organizes memory heaps. The young generation stores short-lived objects, while the old generation stores persistent objects.\n\nOptimizing code to allocate fewer temporary objects reduces garbage collector pauses.';
      lesson4Highlights = ['memory heap', 'garbage collector', 'generational'];
      lesson4ExampleCode = `// Heap: promoting long-lived objects from the young generation to the old generation.`;
      lesson4ExampleExplanation = 'Objects that survive multiple GC sweeps are promoted to the old generation heap.';
      lesson4PracticeInstruction = 'Complete the name of the memory heap: old generation:';
      lesson4PracticeTemplate = 'let heap = "old ___";';
      lesson4PracticeAnswer = 'generation';
      lesson4Summary = 'Understanding heap organization helps write memory-efficient code and reduce GC pauses.';
      lesson4Challenges = [
        {
          type: 'multiple-choice',
          question: 'Which objects are stored in the young generation heap?',
          options: ['Long-lived static variables.', 'Short-lived, temporary objects like widget configurations.', 'System binary files.', 'Database connections.'],
          correct_index: 1,
          explanation: 'The young generation heap stores short-lived objects that are quickly allocated and collected.'
        },
        {
          type: 'fill-blank',
          question: 'Surviving objects are promoted to the old generation heap:',
          template: 'old ___ heap',
          answer: 'generation',
          explanation: 'Objects that persist are promoted to the old generation heap for less frequent collection.'
        }
      ];
    }
  }

  // If no match was found for level (fallback default if level was somehow different)
  if (!trackName) {
    trackName = `${normalizedSkill} Learning Path (${level})`;
    trackDesc = `Gain comprehensive skills in ${normalizedSkill} customized for ${goal}.`;
    capstoneTitle = `Capstone Project for ${normalizedSkill}`;
    capstoneDesc = `Design and implement a project utilizing ${normalizedSkill} key features.`;
    capstoneReqs = ['Configure workspace', 'Write clean components', 'Verify code operations'];
  }

  // Return the compiled blueprint object
  const blueprint = {
    track: {
      name: trackName,
      description: trackDesc,
      color,
      icon,
      capstone_project: {
        title: capstoneTitle,
        description: capstoneDesc,
        requirements: capstoneReqs
      }
    },
    modules: [
      {
        id: `${normalizedLevel}-module-1`,
        name: mod1Name,
        display_order: 1,
        learning_objective: mod1Obj,
        mini_project: {
          title: mod1ProjTitle,
          description: mod1ProjDesc,
          requirements: mod1ProjReqs
        }
      },
      {
        id: `${normalizedLevel}-module-2`,
        name: mod2Name,
        display_order: 2,
        learning_objective: mod2Obj,
        mini_project: {
          title: mod2ProjTitle,
          description: mod2ProjDesc,
          requirements: mod2ProjReqs
        }
      }
    ],
    lessons: [
      {
        slug: `${slugify(normalizedSkill)}-${normalizedLevel}-1`,
        title: lesson1Title,
        module_id: `${normalizedLevel}-module-1`,
        display_order: 1,
        estimated_minutes: 10,
        xp_reward: 25,
        concept_title: lesson1ConceptTitle,
        concept_content: lesson1ConceptContent,
        concept_highlights: lesson1Highlights,
        example_language: 'javascript',
        example_code: lesson1ExampleCode,
        example_explanation: lesson1ExampleExplanation,
        practice_type: 'fill-blank',
        practice_instruction: lesson1PracticeInstruction,
        practice_template: lesson1PracticeTemplate,
        practice_answer: lesson1PracticeAnswer,
        summary: lesson1Summary,
        challenges: lesson1Challenges
      },
      {
        slug: `${slugify(normalizedSkill)}-${normalizedLevel}-2`,
        title: lesson2Title,
        module_id: `${normalizedLevel}-module-1`,
        display_order: 2,
        estimated_minutes: 10,
        xp_reward: 25,
        concept_title: lesson2ConceptTitle,
        concept_content: lesson2ConceptContent,
        concept_highlights: lesson2Highlights,
        example_language: 'javascript',
        example_code: lesson2ExampleCode,
        example_explanation: lesson2ExampleExplanation,
        practice_type: 'fill-blank',
        practice_instruction: lesson2PracticeInstruction,
        practice_template: lesson2PracticeTemplate,
        practice_answer: lesson2PracticeAnswer,
        summary: lesson2Summary,
        challenges: lesson2Challenges
      },
      {
        slug: `${slugify(normalizedSkill)}-${normalizedLevel}-3`,
        title: lesson3Title,
        module_id: `${normalizedLevel}-module-2`,
        display_order: 3,
        estimated_minutes: 10,
        xp_reward: 25,
        concept_title: lesson3ConceptTitle,
        concept_content: lesson3ConceptContent,
        concept_highlights: lesson3Highlights,
        example_language: 'javascript',
        example_code: lesson3ExampleCode,
        example_explanation: lesson3ExampleExplanation,
        practice_type: 'fill-blank',
        practice_instruction: lesson3PracticeInstruction,
        practice_template: lesson3PracticeTemplate,
        practice_answer: lesson3PracticeAnswer,
        summary: lesson3Summary,
        challenges: lesson3Challenges
      },
      {
        slug: `${slugify(normalizedSkill)}-${normalizedLevel}-4`,
        title: lesson4Title,
        module_id: `${normalizedLevel}-module-2`,
        display_order: 4,
        estimated_minutes: 10,
        xp_reward: 25,
        concept_title: lesson4ConceptTitle,
        concept_content: lesson4ConceptContent,
        concept_highlights: lesson4Highlights,
        example_language: 'javascript',
        example_code: lesson4ExampleCode,
        example_explanation: lesson4ExampleExplanation,
        practice_type: 'fill-blank',
        practice_instruction: lesson4PracticeInstruction,
        practice_template: lesson4PracticeTemplate,
        practice_answer: lesson4PracticeAnswer,
        summary: lesson4Summary,
        challenges: lesson4Challenges
      }
    ]
  };

  // Pad challenges to exactly 5 per lesson
  blueprint.lessons = blueprint.lessons.map(lesson => ({
    ...lesson,
    challenges: padChallenges(lesson.challenges, lesson.title, blueprint.track.name)
  }));

  return blueprint;
};

// @desc    Generate AI learning path
// @route   POST /api/ai/generate
export const generatePath = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { skill, level, goal } = req.body;
    console.log(`📥 [API Route Hit] POST /api/ai/generate - Skill: "${skill}", Level: "${level}", Goal: "${goal}"`);

    if (!skill || !level || !goal) {
      console.warn('⚠️ Missing required parameters for generatePath');
      return res.status(400).json({ message: 'Skill, Level, and Goal parameters are required.' });
    }

    let blueprint = null;

    if (process.env.GROQ_API_KEY) {
      try {
        console.log(`🤖 [AI Request Start] Requesting Groq API blueprint for: "${skill}" (Level: "${level}", Goal: "${goal}")...`);
        
        const systemInstruction = 
          "You are a professional educational curriculum designer. You output high-quality technical blueprint learning paths in strict JSON format. " +
          "Do not include any conversational text, markdown formatting blocks (like ```json), or wrapping objects outside the requested JSON schema.";

        const prompt = `
Create a comprehensive technical course blueprint for learning the skill: "${skill}".
Difficulty Level: "${level}"
Learning Goal: "${goal}"

THE CURRICULUM MUST STRICTLY AND DISTINCTLY ADAPT TO THE COMBINATION OF DIFFICULTY LEVEL "${level}" AND LEARNING GOAL "${goal}":

[HOW DIFFICULTY LEVEL INFLUENCES CONTENT]
- Beginner: Assume zero prior knowledge. Focus on basic fundamentals, terminology, setup, core variables, conditional logic, and simple guided practice.
- Intermediate: Assume familiarity with basics. Skip introductory setup/hello-world concepts. Focus on applied skills, practical workflows, industry tools, best practices, and portfolio projects.
- Advanced: Assume professional experience. Focus on enterprise design patterns, system architecture, scalability, profiling, optimization, and production operations.

[HOW LEARNING GOAL INFLUENCES CONTENT]
- Job Preparation (case-insensitive):
  - Focus on industry skills, practical workflows, portfolio-worthy projects, real-world application, and production-grade tools.
  - The capstone project and module mini-projects must be practical portfolio assets using production tools.
  - Lessons must emphasize code quality, deployment, and practical industry workflows.
  - Challenges must be practical implementation scenarios.
- Interview Prep / Preparation (case-insensitive):
  - Focus on common interview questions, assessment topics (e.g. complexity, patterns, data structures, lifecycle hooks), mock tests, timed challenges, and problem solving.
  - The capstone project must be a simulated technical interview assessment or an exam challenge dashboard.
  - Quizzes and practice tasks must be interview-style.
- Academic / Academic Learning (case-insensitive):
  - Focus on computer science theory, definitions, core conceptual models/paradigms, examination preparation, and academic exercises.
  - The capstone project must be a research report or theoretical examination project.
  - Quizzes and practice tasks must check core theoretical definitions and concepts.

Ensure that the modules, lessons, challenges, projects, and learning objectives look completely different depending on the level and goal. Do not reuse the same module structures, titles, or lesson concepts across different levels or goals.

You must strictly output a single JSON object. The JSON object must contain EXACTLY the following structure and keys:
{
  "track": {
    "name": "Course Title (e.g. AI: Flutter Beginner Job-Prep, AI: Flutter Beginner Interview-Prep, or AI: Flutter Beginner Academic-Theory)",
    "description": "Course subtitle detail tailored specifically to the chosen level and goal",
    "color": "Vibrant HSL string, e.g. hsl(210, 90%, 50%)",
    "icon": "One word name of an SVG icon, e.g. database, code, globe, cpu, bar-chart, coffee",
    "capstone_project": {
      "title": "Comprehensive Capstone Project Title matching the level and goal",
      "description": "Detailed capstone project scope matching the level and goal",
      "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"]
    }
  },
  "modules": [
    {
      "id": "module-unique-id-string (e.g. foundations-setup or interview-widget-qs)",
      "name": "Module Title matching the level and goal requirements",
      "display_order": 1,
      "learning_objective": "What will students learn in this module?",
      "mini_project": {
        "title": "Module Mini-Project Title",
        "description": "Mini-project description",
        "requirements": ["Req 1", "Req 2"]
      }
    }
  ],
  "lessons": [
    {
      "slug": "unique-lesson-slug (e.g. flutter-setup-1 or flutter-quiz-1)",
      "title": "Lesson Title matching the level and goal requirements",
      "module_id": "Must match the module id above",
      "display_order": 1,
      "estimated_minutes": 10,
      "xp_reward": 25,
      "concept_title": "Concept Section Title",
      "concept_content": "Detailed educational text covering concepts and explanations. 2-3 paragraphs.",
      "concept_highlights": ["keyword1", "keyword2"],
      "learning_objective": "A numbered list of learning outcomes for this lesson",
      "why_matters": "Real-world context on why this specific topic matters and what bottleneck it solves.",
      "real_world_scenario": "🏢 Real-world industry application example (e.g. Amazon order JOINs, WhatsApp encryption, Netflix recommendations). Be specific and detailed.",
      "visual_explanation": {
        "type": "comparison",
        "title": "Title of the visual explanation",
        "headers": ["Option/Concept A", "Option/Concept B"],
        "rows": [["Row 1 Col 1", "Row 1 Col 2"]],
        "cards": [{"title": "Card Title", "description": "Card Description"}],
        "nodes": [{"id": "1", "label": "Node Label", "connections": ["2"]}]
      },
      "code_walkthrough": {
        "code": "Complete, working code example snippet demonstrating the concept",
        "explanation": "Detailed explanation of what this code snippet does",
        "annotations": [
          {
            "line": 3,
            "text": "Detailed explanation of what this specific line does in the execution flow."
          }
        ]
      },
      "example_language": "bash, python, javascript, html, css, or java",
      "example_code": "Duplicate of code_walkthrough.code for legacy compatibility",
      "example_explanation": "Duplicate of code_walkthrough.explanation for legacy compatibility",
      "practice_type": "fill-blank",
      "practice_instruction": "Task prompt for the interactive playground coding practice",
      "practice_template": "Code line with ___ blank, e.g. SELECT ___ FROM table",
      "practice_answer": "Value of the blank",
      "summary": "1-2 sentence lesson wrap-up summary",
      "key_takeaways": {
        "bullet_points": ["takeaway 1", "takeaway 2"],
        "common_mistakes": ["mistake 1", "mistake 2"],
        "quick_revision": "A quick summary statement for revision."
      },
      "flashcards": [
        {
          "front": "Question or term on front of card",
          "back": "Answer or explanation on back of card"
        }
      ],
      "challenges": [
        {
          "type": "multiple-choice",
          "question": "Quiz question text (Recall Level: terminology or basic syntax definition)",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_index": 0,
          "explanation": "Why this answer is correct"
        },
        {
          "type": "fill-blank",
          "question": "Quiz question text",
          "template": "Code line with ___",
          "answer": "correct_value",
          "explanation": "Why this answer is correct"
        },
        {
          "type": "output-prediction",
          "question": "Predict the output of the following code snippet",
          "starter_code": "def func():\n  print('Hello')\nfunc()",
          "expected_output": "Hello",
          "explanation": "Why this is the expected stdout"
        },
        {
          "type": "match-following",
          "question": "Match the term with its corresponding role/definition",
          "pairs": {
            "key1": "value1",
            "key2": "value2"
          },
          "explanation": "Why these pairings are correct"
        },
        {
          "type": "debugging",
          "question": "Fix the syntax or logical bug in the following code block to produce the correct behavior",
          "starter_code": "def buggy():\n  return x",
          "template": "def buggy(x):\n  return x",
          "answer": "def buggy(x):\n  return x",
          "explanation": "Adding parameters fixes the undefined variable reference"
        }
      ]
    }
  ]
}

Enforce:
1. Generate EXACTLY 2 modules.
2. Generate EXACTLY 2 lessons per module (Total 4 lessons).
3. Generate EXACTLY 5 challenges per lesson covering all 5 cognitive levels listed above (Recall, Concept, Application, Problem Solving, Advanced).
4. Ensure the capstone project is comprehensive.
5. Content should be highly professional and detailed.
`;

        const response = await fetch(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
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
          }
        );

        if (!response.ok) {
          throw new Error(`Groq API returned status ${response.status}`);
        }

        const data = await response.json();
        const rawJsonText = data?.choices?.[0]?.message?.content;
        blueprint = JSON.parse(rawJsonText);
        console.log(`✨ [AI Response Success] Groq API returned valid blueprint for: "${skill}"`);
      } catch (groqError) {
        console.error('⚠️ [AI Response Error] Groq generation failed or returned invalid JSON, falling back to Gemini or Mock:', groqError.message);
      }
    }

    if (!blueprint && process.env.GEMINI_API_KEY) {
      try {
        console.log(`🤖 [AI Request Start] Requesting Gemini API blueprint for: "${skill}" (Level: "${level}", Goal: "${goal}")...`);
        
        const systemInstruction = 
          "You are a professional educational curriculum designer. You output high-quality technical blueprint learning paths in strict JSON format. " +
          "Do not include any conversational text, markdown formatting blocks (like ```json), or wrapping objects outside the requested JSON schema.";

        const prompt = `
Create a comprehensive technical course blueprint for learning the skill: "${skill}".
Difficulty Level: "${level}"
Learning Goal: "${goal}"

THE CURRICULUM MUST STRICTLY AND DISTINCTLY ADAPT TO THE COMBINATION OF DIFFICULTY LEVEL "${level}" AND LEARNING GOAL "${goal}":

[HOW DIFFICULTY LEVEL INFLUENCES CONTENT]
- Beginner: Assume zero prior knowledge. Focus on basic fundamentals, terminology, setup, core variables, conditional logic, and simple guided practice.
- Intermediate: Assume familiarity with basics. Skip introductory setup/hello-world concepts. Focus on applied skills, practical workflows, industry tools, best practices, and portfolio projects.
- Advanced: Assume professional experience. Focus on enterprise design patterns, system architecture, scalability, profiling, optimization, and production operations.

[HOW LEARNING GOAL INFLUENCES CONTENT]
- Job Preparation (case-insensitive):
  - Focus on industry skills, practical workflows, portfolio-worthy projects, real-world application, and production-grade tools.
  - The capstone project and module mini-projects must be practical portfolio assets using production tools.
  - Lessons must emphasize code quality, deployment, and practical industry workflows.
  - Challenges must be practical implementation scenarios.
- Interview Prep / Preparation (case-insensitive):
  - Focus on common interview questions, assessment topics (e.g. complexity, patterns, data structures, lifecycle hooks), mock tests, timed challenges, and problem solving.
  - The capstone project must be a simulated technical interview assessment or an exam challenge dashboard.
  - Quizzes and practice tasks must be interview-style.
- Academic / Academic Learning (case-insensitive):
  - Focus on computer science theory, definitions, core conceptual models/paradigms, examination preparation, and academic exercises.
  - The capstone project must be a research report or theoretical examination project.
  - Quizzes and practice tasks must check core theoretical definitions and concepts.

Ensure that the modules, lessons, challenges, projects, and learning objectives look completely different depending on the level and goal. Do not reuse the same module structures, titles, or lesson concepts across different levels or goals.

You must strictly output a single JSON object. The JSON object must contain EXACTLY the following structure and keys:
{
  "track": {
    "name": "Course Title (e.g. AI: Flutter Beginner Job-Prep, AI: Flutter Beginner Interview-Prep, or AI: Flutter Beginner Academic-Theory)",
    "description": "Course subtitle detail tailored specifically to the chosen level and goal",
    "color": "Vibrant HSL string, e.g. hsl(210, 90%, 50%)",
    "icon": "One word name of an SVG icon, e.g. database, code, globe, cpu, bar-chart, coffee",
    "capstone_project": {
      "title": "Comprehensive Capstone Project Title matching the level and goal",
      "description": "Detailed capstone project scope matching the level and goal",
      "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"]
    }
  },
  "modules": [
    {
      "id": "module-unique-id-string (e.g. foundations-setup or interview-widget-qs)",
      "name": "Module Title matching the level and goal requirements",
      "display_order": 1,
      "learning_objective": "What will students learn in this module?",
      "mini_project": {
        "title": "Module Mini-Project Title",
        "description": "Mini-project description",
        "requirements": ["Req 1", "Req 2"]
      }
    }
  ],
  "lessons": [
    {
      "slug": "unique-lesson-slug (e.g. flutter-setup-1 or flutter-quiz-1)",
      "title": "Lesson Title matching the level and goal requirements",
      "module_id": "Must match the module id above",
      "display_order": 1,
      "estimated_minutes": 10,
      "xp_reward": 25,
      "concept_title": "Concept Section Title",
      "concept_content": "Detailed educational text covering concepts and explanations. 2-3 paragraphs.",
      "concept_highlights": ["keyword1", "keyword2"],
      "learning_objective": "A numbered list of learning outcomes for this lesson",
      "why_matters": "Real-world context on why this specific topic matters and what bottleneck it solves.",
      "real_world_scenario": "🏢 Real-world industry application example (e.g. Amazon order JOINs, WhatsApp encryption, Netflix recommendations). Be specific and detailed.",
      "visual_explanation": {
        "type": "comparison",
        "title": "Title of the visual explanation",
        "headers": ["Option/Concept A", "Option/Concept B"],
        "rows": [["Row 1 Col 1", "Row 1 Col 2"]],
        "cards": [{"title": "Card Title", "description": "Card Description"}],
        "nodes": [{"id": "1", "label": "Node Label", "connections": ["2"]}]
      },
      "code_walkthrough": {
        "code": "Complete, working code example snippet demonstrating the concept",
        "explanation": "Detailed explanation of what this code snippet does",
        "annotations": [
          {
            "line": 3,
            "text": "Detailed explanation of what this specific line does in the execution flow."
          }
        ]
      },
      "example_language": "bash, python, javascript, html, css, or java",
      "example_code": "Duplicate of code_walkthrough.code for legacy compatibility",
      "example_explanation": "Duplicate of code_walkthrough.explanation for legacy compatibility",
      "practice_type": "fill-blank",
      "practice_instruction": "Task prompt for the interactive playground coding practice",
      "practice_template": "Code line with ___ blank, e.g. SELECT ___ FROM table",
      "practice_answer": "Value of the blank",
      "summary": "1-2 sentence lesson wrap-up summary",
      "key_takeaways": {
        "bullet_points": ["takeaway 1", "takeaway 2"],
        "common_mistakes": ["mistake 1", "mistake 2"],
        "quick_revision": "A quick summary statement for revision."
      },
      "flashcards": [
        {
          "front": "Question or term on front of card",
          "back": "Answer or explanation on back of card"
        }
      ],
      "challenges": [
        {
          "type": "multiple-choice",
          "question": "Quiz question text (Recall Level: terminology or basic syntax definition)",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_index": 0,
          "explanation": "Why this answer is correct"
        },
        {
          "type": "fill-blank",
          "question": "Quiz question text",
          "template": "Code line with ___",
          "answer": "correct_value",
          "explanation": "Why this answer is correct"
        },
        {
          "type": "output-prediction",
          "question": "Predict the output of the following code snippet",
          "starter_code": "def func():\n  print('Hello')\nfunc()",
          "expected_output": "Hello",
          "explanation": "Why this is the expected stdout"
        },
        {
          "type": "match-following",
          "question": "Match the term with its corresponding role/definition",
          "pairs": {
            "key1": "value1",
            "key2": "value2"
          },
          "explanation": "Why these pairings are correct"
        },
        {
          "type": "debugging",
          "question": "Fix the syntax or logical bug in the following code block to produce the correct behavior",
          "starter_code": "def buggy():\n  return x",
          "template": "def buggy(x):\n  return x",
          "answer": "def buggy(x):\n  return x",
          "explanation": "Adding parameters fixes the undefined variable reference"
        }
      ]
    }
  ]
}

Enforce:
1. Generate EXACTLY 2 modules.
2. Generate EXACTLY 2 lessons per module (Total 4 lessons).
3. Generate EXACTLY 5 challenges per lesson covering all 5 cognitive levels listed above (Recall, Concept, Application, Problem Solving, Advanced).
4. Ensure the capstone project is comprehensive.
5. Content should be highly professional and detailed.
`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }],
              generationConfig: {
                responseMimeType: 'application/json'
              }
            })
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API returned status ${response.status}`);
        }

        const data = await response.json();
        const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        blueprint = JSON.parse(rawJsonText);
        console.log(`✨ [AI Response Success] Gemini API returned valid blueprint for: "${skill}"`);
      } catch (geminiError: any) {
        console.error('⚠️ [AI Response Error] Gemini generation failed or returned invalid JSON, falling back to mock:', geminiError.message);
        blueprint = getMockBlueprint(skill, level, goal);
      }
    }

    if (!blueprint) {
      console.log(`💡 [AI Mock Fallback] No API keys found or generation failed. Using local mock generator for: "${skill}"`);
      blueprint = getMockBlueprint(skill, level, goal);
    }

    if (!blueprint || !blueprint.track || !blueprint.modules || !blueprint.lessons) {
      console.error('❌ [API Route Error] Course blueprint validation failed: Missing track, modules or lessons', blueprint);
      return res.status(500).json({ message: 'Failed to generate a valid course blueprint.' });
    }

    console.log('💾 Storing AI learning blueprint in Supabase database...');

    // 1. Insert Track
    const trackSlug = `${slugify(blueprint.track.name)}-${Date.now().toString().slice(-4)}`;
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .insert({
        slug: trackSlug,
        name: blueprint.track.name,
        description: blueprint.track.description,
        icon: blueprint.track.icon || 'code',
        color: blueprint.track.color || 'hsl(217, 91%, 60%)',
        display_order: 100, // Custom tracks listed at the bottom
        total_lessons: blueprint.lessons.length,
        is_ai_generated: true,
        user_id: req.user!.id,
        capstone_project: blueprint.track.capstone_project || {},
      })
      .select()
      .single();

    if (trackError) throw trackError;

    // 2. Insert Modules
    const moduleMap = {}; // Maps prompt module IDs to database module primary keys
    for (const mod of blueprint.modules) {
      const dbModuleId = `${track.id}-${mod.id}`;
      const { error: modError } = await supabase
        .from('modules')
        .insert({
          id: dbModuleId,
          track_id: track.id,
          name: mod.name,
          display_order: mod.display_order,
          learning_objective: mod.learning_objective || '',
          mini_project: mod.mini_project || {},
        });

      if (modError) throw modError;
      moduleMap[mod.id] = dbModuleId;
    }

    // 3. Insert Lessons & Challenges
    for (const lessonData of blueprint.lessons) {
      const dbModuleId = moduleMap[lessonData.module_id] || `${track.id}-${lessonData.module_id}`;
      
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          slug: `${lessonData.slug}-${Date.now().toString().slice(-4)}`, // ensure unique slug
          track_id: track.id,
          module_id: dbModuleId,
          title: lessonData.title,
          display_order: lessonData.display_order,
          estimated_minutes: lessonData.estimated_minutes || 5,
          xp_reward: lessonData.xp_reward || 25,
          concept_title: lessonData.concept_title || lessonData.title,
          concept_content: lessonData.concept_content || '',
          concept_highlights: lessonData.concept_highlights || [],
          example_language: lessonData.example_language || 'javascript',
          example_code: lessonData.example_code || '',
          example_explanation: lessonData.example_explanation || '',
          practice_type: lessonData.practice_type || 'fill-blank',
          practice_instruction: lessonData.practice_instruction || '',
          practice_template: lessonData.practice_template || '',
          practice_answer: lessonData.practice_answer || '',
          summary: lessonData.summary || '',
          why_matters: lessonData.why_matters || '',
          real_world_scenario: lessonData.real_world_scenario || '',
          learning_objective: lessonData.learning_objective || '',
          visual_explanation: lessonData.visual_explanation || null,
          code_walkthrough: lessonData.code_walkthrough || null,
          key_takeaways: lessonData.key_takeaways || null,
          flashcards: lessonData.flashcards || null,
        })
        .select()
        .single();

      if (lessonError) throw lessonError;

      // Insert challenges associated with this lesson
      if (lessonData.challenges && lessonData.challenges.length > 0) {
        for (const challengeData of lessonData.challenges) {
          const { error: challengeError } = await supabase
            .from('challenges')
            .insert({
              lesson_id: lesson.id,
              type: challengeData.type || 'multiple-choice',
              question: challengeData.question || '',
              options: challengeData.options || [],
              correct_index: challengeData.correct_index,
              template: challengeData.template,
              answer: challengeData.answer,
              explanation: challengeData.explanation || '',
              xp_reward: 10,
              starter_code: challengeData.starter_code || null,
              expected_output: challengeData.expected_output || null,
              pairs: challengeData.pairs || null,
              hint: challengeData.hint || null,
              language: challengeData.language || null,
            });

          if (challengeError) throw challengeError;
        }
      }
    }

    console.log(`✨ [API Response Success] Stored AI learning blueprint successfully. Created Track Slug: "${trackSlug}"`);

    // Trigger AI Path Generated notification
    await createNotification(
      req.user!.id,
      'AI Learning Path Generated 🤖',
      `Your custom path "${track.name}" has been compiled and is ready!`,
      'AI',
      '🤖',
      `/track/${trackSlug}`
    );

    res.status(201).json({
      message: 'Learning blueprint generated and initialized.',
      trackSlug,
    });
  } catch (error: any) {
    console.error('❌ [API Route Error] POST /api/ai/generate failed:', error);
    next(error);
  }
};

// @desc    AI Mentor — contextual lesson help
// @route   POST /api/ai/mentor
export const mentorChat = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { message, lessonSlug, trackSlug, mode } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    // Fetch lesson context if provided
    let lessonContext = '';
    if (lessonSlug) {
      const { data: lesson } = await supabase
        .from('lessons')
        .select('title, content, concepts, objective')
        .eq('slug', lessonSlug)
        .maybeSingle();

      if (lesson) {
        lessonContext = `
CURRENT LESSON: "${lesson.title}"
OBJECTIVE: ${lesson.objective || 'N/A'}
CONCEPTS: ${Array.isArray(lesson.concepts) ? lesson.concepts.join(', ') : lesson.concepts || 'N/A'}
LESSON CONTENT SUMMARY: ${(lesson.content || '').substring(0, 800)}
`.trim();
      }
    }

    let trackContext = '';
    if (trackSlug) {
      const { data: track } = await supabase
        .from('tracks')
        .select('name, description')
        .eq('slug', trackSlug)
        .maybeSingle();

      if (track) {
        trackContext = `LEARNING TRACK: "${track.name}" — ${track.description || ''}`;
      }
    }

    // Build system instructions based on mode
    const modeInstructions = {
      'explain': 'Explain the concept differently using a fresh analogy or simpler language. Focus on clarity.',
      'example': 'Provide a concrete, real-world example or use case that demonstrates this concept practically.',
      'practice': 'Generate a relevant practice question or mini-challenge to test understanding of this concept.',
      'default': 'Answer the student\'s question helpfully, concisely, and with code examples where relevant.',
    };

    const systemPrompt = `You are an expert AI coding mentor for the Learn Station learning platform. You help students understand technical concepts clearly and engagingly.

${trackContext}
${lessonContext}

Your role:
- Be concise and focused. Keep answers under 300 words unless a longer answer is clearly needed.
- ${modeInstructions[mode] || modeInstructions['default']}
- Use markdown formatting for code blocks.
- Be encouraging and supportive.
- If the question is outside the lesson topic, gently redirect to the lesson content.

Do NOT:
- Give long philosophical answers
- Repeat the same content already in the lesson
- Use jargon without explanation`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'AI service not configured.' });
    }

    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(message);
    const text = result.response.text();

    console.log(`🤖 [AI Mentor] Responded to: "${message.substring(0, 60)}..." (${text.length} chars)`);

    res.json({ response: text });
  } catch (error) {
    console.error('❌ [AI Mentor Error]:', error);
    next(error);
  }
};

// --- DYNAMIC AI PROGRESSION SERVICES ---

const extractJson = (text: string): any => {
  const start = text.indexOf('[');
  const startObj = text.indexOf('{');
  if (start !== -1 && (startObj === -1 || start < startObj)) {
    const end = text.lastIndexOf(']');
    if (end !== -1) {
      try {
        return JSON.parse(text.substring(start, end + 1));
      } catch (err) {
        console.error('Failed to parse JSON array:', err);
      }
    }
  } else if (startObj !== -1) {
    const end = text.lastIndexOf('}');
    if (end !== -1) {
      try {
        return JSON.parse(text.substring(startObj, end + 1));
      } catch (err) {
        console.error('Failed to parse JSON object:', err);
      }
    }
  }
  throw new Error('No valid JSON structure found in AI response.');
};

// @desc    AI Quiz Generator — adaptive questions
// @route   POST /api/ai/quiz/generate
export const generateQuiz = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { scope, difficulty, trackSlug, moduleId, lessonSlug } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'AI service not configured.' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Generate an adaptive technical quiz of exactly 5 questions on the topic scope "${scope || 'general development'}" with difficulty "${difficulty || 'medium'}".
Question types should include multiple choice (MCQ), fill-in-the-blank, debugging code, and output prediction.
Provide the output as a JSON array of objects with this exact structure:
[
  {
    "question": "question text",
    "type": "multiple-choice" or "fill-blank" or "debugging" or "output-prediction",
    "options": ["Option A", "Option B", "Option C", "Option D"] (only for multiple-choice),
    "correct_index": 0 (only for multiple-choice, index of correct option),
    "answer": "correct string answer" (only for non-MCQ),
    "explanation": "concise explanation of why the answer is correct"
  }
]`;

    const result = await model.generateContent(prompt);
    const questions = extractJson(result.response.text());

    res.json({ questions });
  } catch (error) {
    console.error('❌ [AI Quiz Gen Error]:', error);
    next(error);
  }
};

// @desc    AI Practice Generator — challenges
// @route   POST /api/ai/practice/generate
export const generatePractice = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { language, topic } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'AI service not configured.' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Generate a unique practice challenge for language "${language || 'Javascript'}" and topic "${topic || 'general logic'}".
Return a JSON object with this exact structure:
{
  "title": "challenge title",
  "description": "brief scenario description and requirements",
  "starter_code": "template code with placeholder comments",
  "expected_output": "expected output of correct solution",
  "language": "lowercase language slug"
}`;

    const result = await model.generateContent(prompt);
    const challenge = extractJson(result.response.text());

    res.json({ challenge });
  } catch (error) {
    console.error('❌ [AI Practice Gen Error]:', error);
    next(error);
  }
};

// @desc    AI Flashcards — study items
// @route   POST /api/ai/flashcards/generate
export const generateFlashcards = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { topic } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'AI service not configured.' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Generate exactly 5 flashcards for revision of "${topic || 'web development concepts'}".
Return a JSON array of objects with this exact structure:
[
  {
    "question": "short question or term",
    "answer": "concise answer or definition",
    "category": "topic area"
  }
]`;

    const result = await model.generateContent(prompt);
    const cards = extractJson(result.response.text());

    res.json({ cards });
  } catch (error) {
    console.error('❌ [AI Flashcards Error]:', error);
    next(error);
  }
};

// @desc    AI Interview Simulator — mock chat steps
// @route   POST /api/ai/interview/chat
export const interviewChat = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { category, mode, history, message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'AI service not configured.' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const historyPrompt = (history || []).map((h: any) => `${h.sender === 'user' ? 'Candidate' : 'Interviewer'}: ${h.text}`).join('\n');

    const prompt = `You are a senior technical mock interviewer conducting a ${mode || 'technical'} interview for a ${category || 'Software Engineer'} role.
Conversation history:
${historyPrompt}
Candidate response: "${message || 'Hello, I am ready to start.'}"

Your role:
- Ask exactly ONE relevant follow-up question or present a mini coding/system design challenge.
- Be realistic, professional, and technical.
- Do not explain yourself, just output the interviewer's question.`;

    const result = await model.generateContent(prompt);
    res.json({ response: result.response.text().trim() });
  } catch (error) {
    console.error('❌ [AI Interview Chat Error]:', error);
    next(error);
  }
};

// @desc    AI Interview Simulator — scorecard evaluate
// @route   POST /api/ai/interview/evaluate
export const interviewEvaluate = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { category, mode, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'AI service not configured.' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const historyPrompt = (history || []).map((h: any) => `${h.sender === 'user' ? 'Candidate' : 'Interviewer'}: ${h.text}`).join('\n');

    const prompt = `Evaluate the candidate's performance in this simulated mock interview:
Interview Details: Category=${category || 'General'}, Mode=${mode || 'Technical'}
Chat transcript:
${historyPrompt}

Generate a concise report and scorecards (out of 100). Return a JSON object with this exact structure:
{
  "communicationScore": 85,
  "technicalAccuracyScore": 75,
  "confidenceScore": 80,
  "problemSolvingScore": 70,
  "overallFeedback": "detailed summary of candidates performance, strengths, and improvement areas",
  "keyTakeaways": ["key point 1", "key point 2"]
}`;

    const result = await model.generateContent(prompt);
    const evaluation = extractJson(result.response.text());

    res.json(evaluation);
  } catch (error) {
    console.error('❌ [AI Interview Eval Error]:', error);
    next(error);
  }
};

// @desc    AI Learning Planner — roadmaps
// @route   POST /api/ai/planner/roadmap
export const plannerRoadmap = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { careerGoal, skillLevel, hoursAvailable } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'AI service not configured.' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Create a custom, step-by-step learning roadmap to achieve the career goal of "${careerGoal || 'Full Stack Engineer'}".
Skill level: ${skillLevel || 'Beginner'}.
Study commitment: ${hoursAvailable || '5'} hours per week.
Provide a JSON array of stages representing milestones:
[
  {
    "title": "Stage title (e.g. Frontend basics)",
    "duration": "Estimated weeks",
    "topics": ["topic A", "topic B", "topic C"]
  }
]`;

    const result = await model.generateContent(prompt);
    const roadmap = extractJson(result.response.text());

    res.json({ roadmap });
  } catch (error) {
    console.error('❌ [AI Planner Error]:', error);
    next(error);
  }
};

// @desc    AI Study Assistant — cheat sheets and guide sheets
// @route   POST /api/ai/study/assist
export const studyAssist = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { topic, type } = req.body; // type is 'summary' | 'cheatsheet' | 'mindmap'
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'AI service not configured.' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Create a markdown formatted study assistant document of type "${type || 'summary'}" for the concept/topic "${topic || 'software engineering'}".
Include cheat sheet parameters, definitions, clean styling, and markdown headers.`;

    const result = await model.generateContent(prompt);
    res.json({ markdown: result.response.text() });
  } catch (error) {
    console.error('❌ [AI Study Assist Error]:', error);
    next(error);
  }
};

// @desc    AI Career Coach — portfolios and resumes suggestions
// @route   POST /api/ai/career/coach
export const careerCoach = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { careerGoal, skills } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'AI service not configured.' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `As an expert career coach, evaluate this candidate wanting to become a "${careerGoal || 'Data Analyst'}".
Candidate reported skills: ${skills || 'none stated'}
Return a JSON object detailing actions:
{
  "skillGaps": ["gap 1", "gap 2"],
  "resumeTips": ["tip 1", "tip 2"],
  "projects": ["suggested project 1 with features", "suggested project 2"],
  "nextTracks": ["suggested tracks or learning areas"]
}`;

    const result = await model.generateContent(prompt);
    const advice = extractJson(result.response.text());

    res.json(advice);
  } catch (error) {
    console.error('❌ [AI Career Coach Error]:', error);
    next(error);
  }
};

// @desc    AI Weak Topic Detection
// @route   POST /api/ai/detect-weakness
export const detectWeakness = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { mistakes } = req.body; // mistakes array
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'AI service not configured.' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Analyze these recent technical mistakes/errors made by a learner:
${JSON.stringify(mistakes || [])}

Identify exactly 3 specific weakness topics (e.g. "SQL INNER vs OUTER JOINs", "CSS Box Model alignment").
Return a JSON array of strings:
["topic 1", "topic 2", "topic 3"]`;

    const result = await model.generateContent(prompt);
    const weakTopics = extractJson(result.response.text());

    await supabase
      .from('profiles')
      .update({ weak_topics: weakTopics })
      .eq('id', userId);

    res.json({ weakTopics });
  } catch (error) {
    console.error('❌ [AI Weakness Detection Error]:', error);
    next(error);
  }
};


