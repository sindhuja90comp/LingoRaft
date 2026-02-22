# LingoRaft (LR)

LingoRaft is a simple beginner English lesson chatbot that runs in the browser and stores progress locally.

## What it does

- Beginner-friendly chat mode with simple guidance
- Button-first lesson UX (commands still supported)
- Calm lesson UI with a persistent lesson header, typing prompt card, and compact feedback card
- Complete 20-minute typing lesson: `typing_beginner_20min`
- Local progress persistence with `localStorage` (refresh-safe)
- Modular lesson engine with pluggable activity types

## Run

This app is a static web app using ES modules. Run it with a local server.

1. Open a terminal in the project folder
2. Start a server:

```bash
python3 -m http.server 8000
```

3. Open:

```text
http://localhost:8000
```

## Beginner Usage

- Click `Start Typing Lesson` in the UI, or type `start typing`
- You can also use `/start typing_beginner_20min`
- During lesson mode, use buttons: `Retry`, `Skip`, `Exit`
- `Reset Session` clears local progress and current lesson state
- The target text appears in a dedicated typing card (not split across chat bubbles)

## Commands

- `/help`
- `/lessons`
- `/start <lessonId>`
- `/progress`
- `/restart`
- `/exit`
- In lesson mode: `retry`, `skip`

Natural input supported:

- `start typing`
- `typing lesson`
- `what can you do?`

## Architecture (Scalable)

Folders:

- `engine/lesson_registry.js` - lesson registry metadata and lookup
- `engine/lesson_engine.js` - lesson state machine / routing / persistence integration
- `engine/activity_types.js` - pluggable activity types (`TypingPromptActivity`, `SpeechPromptActivity` stub)
- `engine/session_store.js` - local session persistence
- `lessons/` - lesson definitions and activity sequences
- `ui/chat_ui.js` - DOM rendering and button wiring

### Add a new lesson type later (example: Speech)

1. Add a new activity creator / evaluator in `engine/activity_types.js`
   - `createSpeechActivity(...)` is already included as a placeholder stub.
2. Define a lesson in `lessons/` with metadata + `buildActivities()`.
3. Register it in `lessons/index.js`.
4. The `LessonEngine` can route it without refactoring the core chat flow.

## Manual Test Flow (confirmed)

1. Open the app and click `Start Typing Lesson (20 min)`
2. Verify the first prompt shows `asdf jkl;` with no quotes required
3. Type `asdf jkl` (missing `;`) and confirm:
   - Accuracy is shown
   - short missing/extra feedback is shown
   - a short tip is shown
4. Type `asdf jkl;` and confirm it advances to the next prompt
5. Type `/progress` and confirm prompt count and average accuracy are shown
6. Refresh the page during lesson mode and confirm the current prompt is restored
7. Complete or exit the lesson and confirm Lessons panel shows completion status after finishing

## Notes

- No external APIs are used.
- No test framework is currently configured in this repo, so automated tests were not added.
