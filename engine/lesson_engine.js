import { createInitialSessionState } from "./session_store.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseSlashCommand(text) {
  if (!text.startsWith("/")) return null;
  const [command, ...args] = text.slice(1).trim().split(/\s+/);
  return { command: (command || "").toLowerCase(), args };
}

function isNaturalStartTyping(text) {
  const v = (text || "").trim().toLowerCase();
  return ["start typing", "start typing lesson", "typing lesson"].includes(v);
}

function isWhatCanYouDo(text) {
  return (text || "").toLowerCase().includes("what can you do");
}

function makeAction(id, label, value, variant = "secondary") {
  return { id, label, value, variant };
}

function emptyStats(totalPrompts) {
  return {
    totalPrompts,
    completedPrompts: 0,
    attemptCount: 0,
    accuracySum: 0,
    averageAccuracy: 0,
    commonMistakes: {
      missingSpaces: 0,
      extraSpaces: 0,
      wrongCapitalization: 0,
      other: 0
    }
  };
}

function applyMistakeFlags(stats, flags) {
  if (!flags) return;
  if (flags.missingSpaces) stats.commonMistakes.missingSpaces += 1;
  if (flags.extraSpaces) stats.commonMistakes.extraSpaces += 1;
  if (flags.wrongCapitalization) stats.commonMistakes.wrongCapitalization += 1;
  if (flags.other) stats.commonMistakes.other += 1;
}

export class LessonEngine {
  constructor({ registry, sessionStore }) {
    this.registry = registry;
    this.sessionStore = sessionStore;
    this.session = this.loadSession();
  }

  loadSession() {
    const loaded = this.sessionStore?.load?.();
    const base = createInitialSessionState();
    if (!loaded || typeof loaded !== "object") return base;
    const session = {
      ...base,
      ...loaded,
      completions: loaded.completions && typeof loaded.completions === "object" ? loaded.completions : {}
    };
    if (session.activeLessonId && !this.registry.get(session.activeLessonId)) {
      session.mode = "chat";
      session.activeLessonId = null;
      session.lessonStats = null;
      session.currentActivityIndex = 0;
    }
    if (typeof session.messageCount !== "number" || Number.isNaN(session.messageCount)) {
      session.messageCount = 0;
    }
    return session;
  }

  persist() {
    this.sessionStore?.save?.(this.session);
  }

  resetSession() {
    this.session = createInitialSessionState();
    this.sessionStore?.clear?.();
    return this.makeResponse({
      messages: ["Session reset.", "Hello! I'm LingoRaft. I can help you learn beginner English."],
      quickActions: this.getChatActions(),
      feedbackCard: null
    });
  }

  getLessonDef() {
    return this.session.activeLessonId ? this.registry.get(this.session.activeLessonId) : null;
  }

  getActivities() {
    const lesson = this.getLessonDef();
    return lesson ? lesson.buildActivities() : [];
  }

  getCurrentActivity() {
    if (this.session.mode !== "lesson") return null;
    return this.getActivities()[this.session.currentActivityIndex] || null;
  }

  getChatActions() {
    return [
      makeAction("start_typing", "Start Typing Lesson (20 min)", "/start typing_beginner_20min", "primary"),
      makeAction("see_lessons", "See Lessons", "/lessons"),
      makeAction("help", "Help", "/help")
    ];
  }

  getLessonActions() {
    return [
      makeAction("retry", "Retry", "retry"),
      makeAction("skip", "Skip", "skip"),
      makeAction("exit", "Exit", "/exit")
    ];
  }

  getQuickActionsForMode() {
    if (this.session.mode === "lesson") {
      return [
        makeAction("progress", "Progress", "/progress"),
        makeAction("restart", "Restart Lesson", "/restart")
      ];
    }
    return this.getChatActions();
  }

  getLessonsListView() {
    return this.registry.list().map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      level: lesson.level,
      estimatedMinutes: lesson.estimatedMinutes,
      description: lesson.description,
      completed: Boolean(this.session.completions[lesson.id]?.completed),
      lastAverageAccuracy: this.session.completions[lesson.id]?.averageAccuracy ?? null,
      startAction: makeAction(`start_${lesson.id}`, "Start Lesson", `/start ${lesson.id}`, "primary")
    }));
  }

  buildCurrentLessonInfo() {
    const lesson = this.getLessonDef();
    const activity = this.getCurrentActivity();
    if (!lesson || !activity || this.session.mode !== "lesson") return null;
    return {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      sectionNumber: activity.sectionNumber,
      sectionTitle: activity.sectionTitle,
      promptNumber: activity.promptNumber,
      totalPrompts: activity.totalPrompts,
      averageAccuracy: this.session.lessonStats?.averageAccuracy ?? 0,
      completedPrompts: this.session.lessonStats?.completedPrompts ?? 0
    };
  }

  buildPromptCard() {
    const activity = this.getCurrentActivity();
    if (!activity) return null;
    return {
      title: "Type this:",
      targetText: activity.target,
      hint: activity.hint || ""
    };
  }

  makeResponse({ messages = [], quickActions = null, lessonActions = null, feedbackCard = undefined, showLessonsPanel = true } = {}) {
    const inLesson = this.session.mode === "lesson";
    return {
      isLessonActive: inLesson,
      messages,
      mode: this.session.mode,
      quickActions: quickActions ?? this.getQuickActionsForMode(),
      lessonActions: lessonActions ?? (inLesson ? this.getLessonActions() : []),
      currentLessonInfo: inLesson ? this.buildCurrentLessonInfo() : null,
      promptCard: inLesson ? this.buildPromptCard() : null,
      feedbackCard: feedbackCard === undefined ? null : feedbackCard,
      lessons: showLessonsPanel ? this.getLessonsListView() : [],
      canReset: true
    };
  }

  getBootResponse() {
    if (this.session.mode === "lesson" && this.getCurrentActivity()) {
      const lesson = this.getLessonDef();
      return this.makeResponse({
        messages: [`Welcome back to ${lesson.title}.`],
        feedbackCard: null
      });
    }
    return this.makeResponse({
      messages: ["Hello! I'm LingoRaft. I can help you learn beginner English.", "Choose one:"],
      quickActions: this.getChatActions(),
      feedbackCard: null
    });
  }

  listLessonsResponse() {
    const lines = ["Available lessons:"];
    for (const lesson of this.registry.list()) {
      lines.push(`- ${lesson.id}: ${lesson.title} (${lesson.estimatedMinutes} min)`);
    }
    return this.makeResponse({ messages: [lines.join("\n")] });
  }

  helpResponse() {
    return this.makeResponse({
      messages: [["Commands:", "/help", "/lessons", "/start <lessonId>", "/restart", "/exit", "Lesson mode: retry, skip"].join("\n")]
    });
  }

  startLesson(lessonId) {
    const lesson = this.registry.get(lessonId);
    if (!lesson) {
      return this.makeResponse({ messages: [`Lesson not found: ${lessonId}`] });
    }
    const activities = lesson.buildActivities();
    const total = activities.filter((a) => a.type === "typing").length;
    this.session.mode = "lesson";
    this.session.activeLessonId = lesson.id;
    this.session.currentActivityIndex = lesson.entryActivity || 0;
    this.session.retriesOnCurrentPrompt = 0;
    this.session.lessonStats = emptyStats(total);
    this.persist();

    return this.makeResponse({
      messages: [],
      feedbackCard: null
    });
  }

  clearLessonSessionToChat() {
    this.session.mode = "chat";
    this.session.activeLessonId = null;
    this.session.currentActivityIndex = 0;
    this.session.currentPromptNumber = 0;
    this.session.currentSectionNumber = 0;
    this.session.retriesOnCurrentPrompt = 0;
    this.session.lessonStats = null;
  }

  exitLesson() {
    if (this.session.mode !== "lesson") {
      return this.makeResponse({ messages: ["No active lesson."] });
    }
    this.clearLessonSessionToChat();
    this.persist();
    return this.makeResponse({
      messages: ["Exited lesson.", "Choose one:"],
      quickActions: this.getChatActions(),
      lessonActions: [],
      feedbackCard: null
    });
  }

  restartLesson() {
    const lessonId = this.session.activeLessonId || "typing_beginner_20min";
    return this.startLesson(lessonId);
  }

  progressResponse() {
    if (this.session.mode !== "lesson" || !this.session.lessonStats) {
      return this.makeResponse({ messages: ["No active lesson."] });
    }
    const stats = this.session.lessonStats;
    const info = this.buildCurrentLessonInfo();
    return this.makeResponse({
      messages: [
        `Progress: ${stats.completedPrompts}/${stats.totalPrompts}`,
        `Average accuracy: ${stats.averageAccuracy}%`,
        info ? `Section ${info.sectionNumber}/5 • Prompt ${info.promptNumber}/${info.totalPrompts}` : ""
      ].filter(Boolean)
    });
  }

  finishLesson() {
    const lesson = this.getLessonDef();
    const statsCopy = clone(this.session.lessonStats || emptyStats(0));
    const avg = statsCopy.averageAccuracy || 0;

    if (lesson) {
      this.session.completions[lesson.id] = {
        completed: true,
        averageAccuracy: avg,
        completedAt: new Date().toISOString()
      };
    }

    this.clearLessonSessionToChat();
    this.persist();

    return this.makeResponse({
      messages: ["Lesson complete!", `Average accuracy: ${avg}%`, "Great work. Keep practicing."],
      quickActions: [
        makeAction("restart", "Restart Lesson", lesson ? `/start ${lesson.id}` : "/lessons", "primary"),
        makeAction("lessons", "Back to Lessons", "/lessons"),
        makeAction("reset", "Reset Session", "__reset_session__")
      ],
      lessonActions: [],
      feedbackCard: null
    });
  }

  nextPromptResponse(feedbackCard = null) {
    const activity = this.getCurrentActivity();
    if (!activity) return this.finishLesson();
    return this.makeResponse({ feedbackCard });
  }

  moveNext(feedbackCard = null) {
    this.session.currentActivityIndex += 1;
    this.session.retriesOnCurrentPrompt = 0;
    this.persist();
    if (!this.getCurrentActivity()) return this.finishLesson();
    return this.nextPromptResponse(feedbackCard);
  }

  feedbackForResult(result, extraLine = null) {
    const lines = [];
    if (result.accepted) {
      lines.push(`✓ Nice! Accuracy: ${result.accuracy}%`);
    } else {
      lines.push("Almost!");
      lines.push(`Accuracy: ${result.accuracy}%`);
      if (result.missingText) lines.push(result.missingText);
      if (result.extraText) lines.push(result.extraText);
      if (result.tip) lines.push(result.tip);
      if (extraLine) lines.push(extraLine);
    }
    return {
      status: result.accepted ? "success" : "warning",
      lines
    };
  }

  handleLessonControl(control) {
    if (this.session.mode !== "lesson") return this.makeResponse({ messages: ["No active lesson."] });
    if (control === "retry") {
      return this.makeResponse({
        feedbackCard: { status: "info", lines: ["Try again."] }
      });
    }
    if (control === "skip") {
      if (this.session.lessonStats) this.session.lessonStats.completedPrompts += 1;
      return this.moveNext({ status: "info", lines: ["Skipped. Moving on."] });
    }
    return this.makeResponse({ messages: ["Unknown lesson action."] });
  }

  handleLessonInput(text) {
    const activity = this.getCurrentActivity();
    if (!activity) return this.finishLesson();

    const result = activity.evaluate(text, {
      retriesOnCurrentPrompt: this.session.retriesOnCurrentPrompt,
      lessonStats: this.session.lessonStats
    });

    const stats = this.session.lessonStats;
    stats.attemptCount += 1;
    stats.accuracySum += result.accuracy;
    stats.averageAccuracy = Math.round(stats.accuracySum / stats.attemptCount);
    applyMistakeFlags(stats, result.mistakeFlags);

    if (result.accepted) {
      stats.completedPrompts += 1;
      return this.moveNext(this.feedbackForResult(result));
    }

    this.session.retriesOnCurrentPrompt += 1;
    this.persist();

    const extraLine =
      typeof activity.maxRetriesBeforeSuggestSkip === "number" &&
      this.session.retriesOnCurrentPrompt >= activity.maxRetriesBeforeSuggestSkip
        ? "You can tap Skip if you feel stuck."
        : null;

    return this.makeResponse({ feedbackCard: this.feedbackForResult(result, extraLine) });
  }

  handleNaturalChat(text) {
    if (isNaturalStartTyping(text)) return this.startLesson("typing_beginner_20min");
    if (isWhatCanYouDo(text)) {
      return this.makeResponse({
        messages: ["I can help with beginner English practice.", "Choose one:"],
        quickActions: this.getChatActions()
      });
    }
    return this.makeResponse({
      messages: ["I can help with beginner English and typing practice.", "Choose one:"],
      quickActions: this.getChatActions()
    });
  }

  handleMessage(rawText) {
    const text = (rawText || "").trim();
    if (!text) return this.makeResponse({ messages: [] });
    this.session.messageCount += 1;

    if (text === "__reset_session__") return this.resetSession();

    const slash = parseSlashCommand(text);
    if (slash) {
      switch (slash.command) {
        case "help":
          this.persist();
          return this.helpResponse();
        case "lessons":
          this.persist();
          return this.listLessonsResponse();
        case "start":
          return slash.args[0] ? this.startLesson(slash.args[0]) : this.makeResponse({ messages: ["Usage: /start <lessonId>"] });
        case "restart":
          return this.restartLesson();
        case "exit":
          return this.exitLesson();
        case "progress":
          this.persist();
          return this.progressResponse();
        default:
          return this.makeResponse({ messages: [`Unknown command: /${slash.command}`] });
      }
    }

    if (this.session.mode === "lesson") {
      const lower = text.toLowerCase();
      if (lower === "retry" || lower === "skip") return this.handleLessonControl(lower);
      return this.handleLessonInput(text);
    }

    return this.handleNaturalChat(text);
  }
}
