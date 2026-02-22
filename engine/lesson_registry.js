export class LessonRegistry {
  constructor(lessons) {
    this.lessons = lessons;
    this.lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  }

  list() {
    return [...this.lessons];
  }

  get(lessonId) {
    return this.lessonMap.get(lessonId) || null;
  }
}
