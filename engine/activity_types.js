export const ActivityTypes = {
  TYPING: "typing",
  SPEECH: "speech"
};

export function createTypingActivity(config) {
  return {
    type: ActivityTypes.TYPING,
    ...config,
    evaluate(input, runtime) {
      return evaluateTyping(config, input, runtime);
    }
  };
}

export function createSpeechActivity(config) {
  return {
    type: ActivityTypes.SPEECH,
    ...config,
    evaluate() {
      return {
        accepted: false,
        accuracy: 0,
        missingText: null,
        extraText: null,
        tip: "Speech is not implemented yet.",
        shortLabel: "Speech activity placeholder"
      };
    }
  };
}

function normalizeSpaces(text) {
  return (text || "").trim().replace(/\s+/g, " ");
}

function comparisonText(text, options) {
  return options?.normalizeSpaces ? normalizeSpaces(text) : (text ?? "");
}

function computeAccuracy(target, actual) {
  const maxLen = Math.max(target.length, actual.length, 1);
  let matches = 0;
  for (let i = 0; i < maxLen; i += 1) {
    if ((target[i] ?? "") === (actual[i] ?? "")) matches += 1;
  }
  return Math.round((matches / maxLen) * 100);
}

function findDiffSpans(target, actual) {
  if (target === actual) return { missing: "", extra: "" };

  let start = 0;
  while (start < target.length && start < actual.length && target[start] === actual[start]) {
    start += 1;
  }

  let targetEnd = target.length - 1;
  let actualEnd = actual.length - 1;
  while (targetEnd >= start && actualEnd >= start && target[targetEnd] === actual[actualEnd]) {
    targetEnd -= 1;
    actualEnd -= 1;
  }

  const missing = target.slice(start, targetEnd + 1);
  const extra = actual.slice(start, actualEnd + 1);
  return { missing, extra };
}

function summarizeMissing(missing) {
  if (!missing) return null;
  if (missing === " ") return "Missing: space";
  return `Missing: \"${missing}\"`;
}

function summarizeExtra(extra) {
  if (!extra) return null;
  if (extra === " ") return "Extra: space";
  return `Extra: \"${extra}\"`;
}

function inferTip(targetRaw, actualRaw, options) {
  const tSpaces = (targetRaw.match(/ /g) || []).length;
  const aSpaces = (actualRaw.match(/ /g) || []).length;
  if (tSpaces !== aSpaces) return "Tip: Slow down and watch spaces.";
  if (targetRaw.toLowerCase() === actualRaw.toLowerCase() && targetRaw !== actualRaw) {
    return "Tip: Check capital letters.";
  }
  if (options?.strict) return "Tip: Slow down and check each character.";
  return "Tip: Slow down and check each character.";
}

function detectMistakeFlags(target, actual) {
  const tSpaces = (target.match(/ /g) || []).length;
  const aSpaces = (actual.match(/ /g) || []).length;
  return {
    missingSpaces: aSpaces < tSpaces,
    extraSpaces: aSpaces > tSpaces,
    wrongCapitalization: target.toLowerCase() === actual.toLowerCase() && target !== actual,
    other: target !== actual && !(aSpaces < tSpaces) && !(aSpaces > tSpaces) && !(target.toLowerCase() === actual.toLowerCase() && target !== actual)
  };
}

function evaluateTyping(config, input) {
  const rawTarget = config.target ?? "";
  const rawActual = input ?? "";

  const target = comparisonText(rawTarget, config.evaluation);
  const actual = comparisonText(rawActual, config.evaluation);

  const accepted = target === actual;
  const accuracy = computeAccuracy(target, actual);
  const { missing, extra } = findDiffSpans(rawTarget, rawActual);

  return {
    accepted,
    accuracy,
    missingText: accepted ? null : summarizeMissing(missing),
    extraText: accepted ? null : summarizeExtra(extra),
    tip: accepted ? null : inferTip(rawTarget, rawActual, config.evaluation),
    shortLabel: accepted ? "Nice!" : "Almost!",
    mistakeFlags: detectMistakeFlags(rawTarget, rawActual)
  };
}
