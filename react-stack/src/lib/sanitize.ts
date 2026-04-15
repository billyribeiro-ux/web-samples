import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(dirty: string) {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
  });
}
