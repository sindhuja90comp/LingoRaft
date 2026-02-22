import { typingBeginner20MinLesson } from "./typing_beginner_20min.js";

function validateLessonDefinition(lesson) {
  const required = [
    "id",
    "title",
    "level",
    "estimatedMinutes",
    "description",
    "entryActivity",
    "buildActivities"
  ];
  for (const key of required) {
    if (!(key in lesson)) {
      throw new Error(`Lesson missing required field: ${key}`);
    }
  }
  return lesson;
}

export const LESSON_DEFINITIONS = [validateLessonDefinition(typingBeginner20MinLesson)];
