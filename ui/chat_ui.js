export class ChatUI {
  constructor({ engine }) {
    this.engine = engine;
    this.chatPanel = document.querySelector(".chat");
    this.chatLog = document.querySelector("#chatLog");
    this.userInput = document.querySelector("#userInput");
    this.sendBtn = document.querySelector("#sendBtn");
    this.quickReplies = document.querySelector("#quickReplies");
    this.lessonActions = document.querySelector("#lessonActions");
    this.resetBtn = document.querySelector("#resetBtn");
    this.chatFooter = document.querySelector("#chatFooter");
    this.goalText = document.querySelector("#goalText");
    this.barFill = document.querySelector("#barFill");
    this.progressBarWrap = document.querySelector("#progressBarWrap");
    this.progressText = document.querySelector("#progressText");
    this.currentLessonCard = document.querySelector("#currentLessonCard");
    this.currentLessonText = document.querySelector("#currentLessonText");
    this.lessonsList = document.querySelector("#lessonsList");
    this.lessonsPanelCard = document.querySelector("#lessonsPanelCard");
    this.commandsPanelCard = document.querySelector("#commandsPanelCard");

    this.lessonStage = document.querySelector("#lessonStage");
    this.lessonHeaderTitle = document.querySelector("#lessonHeaderTitle");
    this.lessonHeaderMeta = document.querySelector("#lessonHeaderMeta");
    this.promptTitle = document.querySelector("#promptTitle");
    this.promptTarget = document.querySelector("#promptTarget");
    this.promptHint = document.querySelector("#promptHint");
    this.feedbackCard = document.querySelector("#feedbackCard");
    this.feedbackLines = document.querySelector("#feedbackLines");
    this.isLessonActive = false;

    this.bindEvents();
  }

  bindEvents() {
    this.sendBtn.addEventListener("click", () => this.submitInput(this.userInput.value));
    this.userInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") this.submitInput(this.userInput.value);
    });
    this.resetBtn.addEventListener("click", () => {
      this.chatLog.innerHTML = "";
      this.applyResponse(this.engine.resetSession());
    });
  }

  init() {
    this.applyResponse(this.engine.getBootResponse());
  }

  nowTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  addMessage(role, text) {
    if (!text) return;
    const wrapper = document.createElement("div");
    wrapper.className = `msg ${role}`;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${role === "bot" ? "LingoRaft" : "You"} - ${this.nowTime()}`;

    const bubbleWrap = document.createElement("div");
    bubbleWrap.appendChild(bubble);
    bubbleWrap.appendChild(meta);
    wrapper.appendChild(bubbleWrap);

    this.chatLog.appendChild(wrapper);
    this.chatLog.scrollTop = this.chatLog.scrollHeight;
  }

  submitInput(rawText) {
    const text = (rawText || "").trim();
    if (!text) return;
    this.userInput.value = "";
    if (!this.isLessonActive) this.addMessage("user", text);
    this.applyResponse(this.engine.handleMessage(text));
  }

  runAction(action) {
    if (!action) return;
    this.applyResponse(this.engine.handleMessage(action.value));
  }

  renderActionButtons(container, actions, options = {}) {
    container.innerHTML = "";
    for (const action of actions || []) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = action.variant === "primary" ? "btn primary" : "qr";
      button.textContent = action.label;
      button.addEventListener("click", () => {
        if (options.logButtonAsUser && !this.isLessonActive) this.addMessage("user", action.label);
        this.runAction(action);
      });
      container.appendChild(button);
    }
  }

  renderLessonsList(lessons) {
    this.lessonsList.innerHTML = "";
    for (const lesson of lessons || []) {
      const item = document.createElement("div");
      item.className = "lessonItem";

      const title = document.createElement("div");
      title.className = "lessonTitle";
      title.textContent = `${lesson.title} (${lesson.estimatedMinutes} min)`;

      const desc = document.createElement("div");
      desc.className = "muted small";
      desc.textContent = `${lesson.level} - ${lesson.description}`;

      const status = document.createElement("div");
      status.className = "muted small";
      status.textContent = lesson.completed
        ? `Completed. Last avg accuracy: ${lesson.lastAverageAccuracy ?? 0}%`
        : "Not completed yet.";

      const startBtn = document.createElement("button");
      startBtn.type = "button";
      startBtn.className = "btn primary smallBtn";
      startBtn.textContent = "Start Lesson";
      startBtn.addEventListener("click", () => this.runAction(lesson.startAction));

      item.append(title, desc, status, startBtn);
      this.lessonsList.appendChild(item);
    }
  }

  renderLessonStage(response) {
    const info = response.currentLessonInfo;
    const prompt = response.promptCard;
    let feedback = response.feedbackCard;
    const inLesson = Boolean(response.isLessonActive && info && prompt);

    if (inLesson && !feedback && response.messages?.length) {
      feedback = { status: "info", lines: response.messages };
    }

    this.chatPanel.classList.toggle("lessonMode", inLesson);
    this.lessonStage.classList.toggle("hidden", !inLesson);

    if (inLesson) {
      this.lessonHeaderTitle.textContent = `Lesson: ${info.lessonTitle}`;
      this.lessonHeaderMeta.textContent = `Section ${info.sectionNumber}/5 • Prompt ${info.promptNumber}/${info.totalPrompts}`;
      this.promptTitle.textContent = prompt.title || "Type this:";
      this.promptTarget.textContent = prompt.targetText || "";
      this.promptHint.textContent = prompt.hint ? `Hint: ${prompt.hint}` : "";
      this.promptHint.classList.toggle("hidden", !prompt.hint);
    } else {
      this.lessonHeaderTitle.textContent = "";
      this.lessonHeaderMeta.textContent = "";
      this.promptTitle.textContent = "";
      this.promptTarget.textContent = "";
      this.promptHint.textContent = "";
    }

    this.feedbackCard.className = "feedbackCard hidden";
    this.feedbackLines.innerHTML = "";
    if (feedback && Array.isArray(feedback.lines) && feedback.lines.length) {
      this.feedbackCard.classList.remove("hidden");
      if (feedback.status) this.feedbackCard.classList.add(`feedback-${feedback.status}`);
      for (const line of feedback.lines) {
        const div = document.createElement("div");
        div.className = "feedbackLine";
        div.textContent = line;
        this.feedbackLines.appendChild(div);
      }
    }
  }

  updateSidebar(response) {
    const info = response.currentLessonInfo;
    if (info) {
      this.currentLessonCard.classList.add("hidden");
      this.currentLessonText.textContent = `${info.lessonTitle}`;
      this.goalText.textContent = "Progress:";
      this.progressBarWrap.classList.add("hidden");
      this.progressText.textContent = `Prompt ${info.promptNumber} of ${info.totalPrompts}\nAccuracy Avg: ${info.averageAccuracy}%`;
    } else {
      this.currentLessonCard.classList.add("hidden");
      this.currentLessonText.textContent = "";
      this.goalText.textContent = "Chat mode: ask for help or start a lesson.";
      this.progressBarWrap.classList.remove("hidden");
      this.barFill.style.width = "0%";
      this.progressText.textContent = "No active lesson";
    }
  }

  applyLayoutMode(response) {
    this.isLessonActive = Boolean(response.isLessonActive);
    this.chatLog.classList.toggle("hidden", this.isLessonActive);
    this.quickReplies.classList.toggle("hidden", this.isLessonActive);
    this.chatFooter.classList.toggle("hidden", this.isLessonActive);
    this.lessonsPanelCard.classList.toggle("hidden", this.isLessonActive);
    this.commandsPanelCard.classList.toggle("hidden", this.isLessonActive);
    this.userInput.placeholder = this.isLessonActive
      ? "Type here and press Enter..."
      : "Type your answer or a command...";
  }

  applyResponse(response) {
    this.applyLayoutMode(response);
    if (!this.isLessonActive) {
      for (const message of response.messages || []) {
        this.addMessage("bot", message);
      }
    }
    this.renderActionButtons(this.quickReplies, response.quickActions || []);
    this.renderActionButtons(this.lessonActions, response.lessonActions || []);
    this.renderLessonsList(response.lessons || []);
    this.renderLessonStage(response);
    this.updateSidebar(response);
  }
}
