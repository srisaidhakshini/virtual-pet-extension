export function companionMessage(hour: number, context: string, turn = 0): string {
  const studying = /\b(exam|study|studying|revision|syllabus|lecture|homework|calculus|physics|chemistry)\b/i.test(context);
  const coding = /\b(code|coding|typescript|javascript|python|debug|programming)\b/i.test(context);
  const messages = hour < 5 || hour >= 23
    ? studying
      ? ["It's pretty late. Want to finish one small topic, then get some sleep?", "Late-night revision? I'm here with you. A short break might be nice before the next topic."]
      : ["Still up? Want to wrap things up and get some rest?", "A quiet little check-in: how are you feeling? It's okay to call it a night."]
    : studying
      ? ["Study break? Tell me one thing you learned. Tiny progress still counts.", "One topic at a time. Want a little stretch before the next one?"]
      : coding
        ? ["How's the code coming along? A fresh look after a little break can help.", "Stuck on something? Try explaining the next small step out loud. I'll keep you company."]
        : ["Just checking in. How's your day going?", "A tiny pause? Relax your shoulders and take a moment for yourself.", "I'm happy to keep you company. What's one little thing you'd like to finish next?"];
  return messages[Math.abs(turn) % messages.length];
}

/** Read only visible headings, never inputs, editable text, or entire page contents. */
export function visiblePageContext(document: Document): string {
  if (document.visibilityState !== 'visible') return '';
  return [...document.querySelectorAll('h1, h2')]
    .filter(element => !element.closest('input, textarea, [contenteditable], [data-private]') && element.getClientRects().length > 0)
    .slice(0, 6).map(element => (element.textContent || '').slice(0, 160)).join(' ').slice(0, 800);
}
