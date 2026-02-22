import { LessonRegistry } from "./engine/lesson_registry.js";
import { LessonEngine } from "./engine/lesson_engine.js";
import { createLocalSessionStore } from "./engine/session_store.js";
import { LESSON_DEFINITIONS } from "./lessons/index.js";
import { ChatUI } from "./ui/chat_ui.js";

const registry = new LessonRegistry(LESSON_DEFINITIONS);
const engine = new LessonEngine({
  registry,
  sessionStore: createLocalSessionStore()
});

const ui = new ChatUI({ engine });
ui.init();
