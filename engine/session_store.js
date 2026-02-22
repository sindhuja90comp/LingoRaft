export const STORAGE_KEY = "lingoraft_lr_session_v2";

export function createInitialSessionState() {
  return {
    mode: "chat",
    activeLessonId: null,
    currentActivityIndex: 0,
    currentPromptNumber: 0,
    currentSectionNumber: 0,
    retriesOnCurrentPrompt: 0,
    lessonStats: null,
    completions: {},
    messageCount: 0,
    pendingPromptRendered: false
  };
}

export function createLocalSessionStore(storageKey = STORAGE_KEY) {
  return {
    load() {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : null;
      } catch {
        return null;
      }
    },
    save(state) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {
        // Ignore storage errors.
      }
    },
    clear() {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // Ignore storage errors.
      }
    }
  };
}
