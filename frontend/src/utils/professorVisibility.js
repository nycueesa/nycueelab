export function hasInterviewAnswer(professor) {
  return Array.isArray(professor?.faqs) && professor.faqs.some(
    (faq) => typeof faq?.answer === 'string' && faq.answer.trim() !== ''
  );
}

export function isVisibleOnTopicPage(professor) {
  if (typeof professor?.topicPageVisible === 'boolean') {
    return professor.topicPageVisible;
  }
  return !professor?.hidden && hasInterviewAnswer(professor);
}
