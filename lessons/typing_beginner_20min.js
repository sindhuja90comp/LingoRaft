import { createTypingActivity, createSpeechActivity } from "../engine/activity_types.js";

function typing(config) {
  return createTypingActivity(config);
}

export const typingBeginner20MinLesson = {
  id: "typing_beginner_20min",
  title: "Beginner English Typing – 20 Minutes",
  level: "beginner",
  estimatedMinutes: 20,
  sections: [
    { number: 1, title: "Home Row Keys" },
    { number: 2, title: "Short Words" },
    { number: 3, title: "Simple Sentences" },
    { number: 4, title: "Common Patterns" },
    { number: 5, title: "Review" }
  ],
  description: "A calm 20-minute beginner typing lesson with short prompts and simple feedback.",
  entryActivity: 0,
  activities: null,

  buildActivities() {
    if (this.activities) return this.activities;
    const total = 23;
    this.activities = [
      typing({ id: "p1", sectionNumber: 1, sectionTitle: "Home Row Keys", promptNumber: 1, totalPrompts: total, target: "asdf jkl;", hint: "Keep a steady rhythm.", evaluation: { normalizeSpaces: true } }),
      typing({ id: "p2", sectionNumber: 1, sectionTitle: "Home Row Keys", promptNumber: 2, totalPrompts: total, target: "f j f j", hint: "Use one space between letters.", evaluation: { normalizeSpaces: true } }),
      typing({ id: "p3", sectionNumber: 1, sectionTitle: "Home Row Keys", promptNumber: 3, totalPrompts: total, target: "a a s s d d", hint: "Match each space.", evaluation: { normalizeSpaces: true } }),
      typing({ id: "p4", sectionNumber: 1, sectionTitle: "Home Row Keys", promptNumber: 4, totalPrompts: total, target: "j j k k l l", hint: "Keep the same pattern.", evaluation: { normalizeSpaces: true } }),
      typing({ id: "p5", sectionNumber: 1, sectionTitle: "Home Row Keys", promptNumber: 5, totalPrompts: total, target: "sad; lad;", hint: "Watch the semicolons.", evaluation: { normalizeSpaces: true } }),

      typing({ id: "p6", sectionNumber: 2, sectionTitle: "Short Words", promptNumber: 6, totalPrompts: total, target: "I am", hint: "Capital I matters.", evaluation: { normalizeSpaces: true } }),
      typing({ id: "p7", sectionNumber: 2, sectionTitle: "Short Words", promptNumber: 7, totalPrompts: total, target: "You are", hint: "Use one space between words.", evaluation: { normalizeSpaces: true } }),
      typing({ id: "p8", sectionNumber: 2, sectionTitle: "Short Words", promptNumber: 8, totalPrompts: total, target: "We are", hint: "Keep capitals where shown.", evaluation: { normalizeSpaces: true } }),
      typing({ id: "p9", sectionNumber: 2, sectionTitle: "Short Words", promptNumber: 9, totalPrompts: total, target: "I am happy", hint: "Check spaces.", evaluation: { normalizeSpaces: true } }),
      typing({ id: "p10", sectionNumber: 2, sectionTitle: "Short Words", promptNumber: 10, totalPrompts: total, target: "You are kind", hint: "Type each word carefully.", evaluation: { normalizeSpaces: true } }),
      typing({ id: "p11", sectionNumber: 2, sectionTitle: "Short Words", promptNumber: 11, totalPrompts: total, target: "We are ready", hint: "Accuracy first.", evaluation: { normalizeSpaces: true } }),

      typing({ id: "p12", sectionNumber: 3, sectionTitle: "Simple Sentences", promptNumber: 12, totalPrompts: total, target: "Hello.", hint: "Capitals and punctuation matter.", evaluation: { strict: true }, maxRetriesBeforeSuggestSkip: 2 }),
      typing({ id: "p13", sectionNumber: 3, sectionTitle: "Simple Sentences", promptNumber: 13, totalPrompts: total, target: "My name is Ana.", hint: "Watch capitals and the period.", evaluation: { strict: true }, maxRetriesBeforeSuggestSkip: 2 }),
      typing({ id: "p14", sectionNumber: 3, sectionTitle: "Simple Sentences", promptNumber: 14, totalPrompts: total, target: "I like tea.", hint: "Check the period.", evaluation: { strict: true }, maxRetriesBeforeSuggestSkip: 2 }),
      typing({ id: "p15", sectionNumber: 3, sectionTitle: "Simple Sentences", promptNumber: 15, totalPrompts: total, target: "Do you like coffee?", hint: "Question mark at the end.", evaluation: { strict: true }, maxRetriesBeforeSuggestSkip: 2 }),
      typing({ id: "p16", sectionNumber: 3, sectionTitle: "Simple Sentences", promptNumber: 16, totalPrompts: total, target: "It is a sunny day.", hint: "Type every word and the period.", evaluation: { strict: true }, maxRetriesBeforeSuggestSkip: 2 }),
      typing({ id: "p17", sectionNumber: 3, sectionTitle: "Simple Sentences", promptNumber: 17, totalPrompts: total, target: "Please type slowly.", hint: "Slow and accurate is best.", evaluation: { strict: true }, maxRetriesBeforeSuggestSkip: 2 }),

      typing({ id: "p18", sectionNumber: 4, sectionTitle: "Common Patterns", promptNumber: 18, totalPrompts: total, target: "This is my book.", hint: "Pattern: This is...", evaluation: { strict: true } }),
      typing({ id: "p19", sectionNumber: 4, sectionTitle: "Common Patterns", promptNumber: 19, totalPrompts: total, target: "I have a pen.", hint: "Pattern: I have...", evaluation: { strict: true } }),
      typing({ id: "p20", sectionNumber: 4, sectionTitle: "Common Patterns", promptNumber: 20, totalPrompts: total, target: "I can read.", hint: "I can = ability.", evaluation: { strict: true } }),
      typing({ id: "p21", sectionNumber: 4, sectionTitle: "Common Patterns", promptNumber: 21, totalPrompts: total, target: "Can you help me?", hint: "Question mark at the end.", evaluation: { strict: true } }),

      typing({ id: "p22", sectionNumber: 5, sectionTitle: "Review", promptNumber: 22, totalPrompts: total, target: "Today I practice English.", hint: "Final review: accuracy first.", evaluation: { strict: true } }),
      typing({ id: "p23", sectionNumber: 5, sectionTitle: "Review", promptNumber: 23, totalPrompts: total, target: "Thank you. Goodbye.", hint: "Final prompt.", evaluation: { strict: true } }),

      createSpeechActivity({ id: "speech_stub", hidden: true })
    ].filter((a) => !a.hidden);

    return this.activities;
  }
};
