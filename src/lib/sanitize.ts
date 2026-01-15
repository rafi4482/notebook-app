import sanitizeHtml from "sanitize-html";

// Restrict sanitized output to only bold and italic styling (and basic paragraphs/line breaks)
export const sanitizeOptions = {
  allowedTags: ["b", "i", "strong", "em", "p", "br"],
  allowedAttributes: {},
};

export function sanitizeContent(html: string) {
  return sanitizeHtml(html, sanitizeOptions);
}
