/**
 * Strip HTML tags and decode HTML entities from HTML content
 * @param html - HTML string to process
 * @returns Plain text with decoded entities
 */
export const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

/**
 * Decode HTML entities in plain text (e.g., &#038; -> &, &amp; -> &)
 * @param text - Text containing HTML entities
 * @returns Decoded text
 */
export const decodeHtmlEntities = (text: string): string => {
  const txt = document.createElement('textarea');
  txt.innerHTML = text;
  return txt.value;
};
