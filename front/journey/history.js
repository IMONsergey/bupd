import { CASES, indexFromHash } from './chapters.js';

/** Only navigation state is retained. Never include the visitor's draft title. */
export function readView(value, hash) {
  const saved = value?.baevJourney;
  return {
    chapter: indexFromHash(hash),
    caseIndex: Number.isInteger(saved?.caseIndex) && saved.caseIndex >= 0 && saved.caseIndex < CASES.length
      ? saved.caseIndex : 0,
  };
}

export function historyEntry(value, chapter, caseIndex) {
  const previous = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return {
    ...previous,
    baevJourney: {
      version: 1,
      chapter,
      caseIndex: Number.isInteger(caseIndex) && caseIndex >= 0 && caseIndex < CASES.length ? caseIndex : 0,
    },
  };
}
