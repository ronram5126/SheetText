import createDOMPurify, { type Config } from 'dompurify';

const sanitizerWindow = typeof window !== 'undefined' ? window : undefined;

const sanitizeConfig: Config = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'b',
    'strong',
    'i',
    'em',
    'a',
    'ul',
    'ol',
    'li',
    'blockquote',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'span',
    'div'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'title'],
  ALLOW_UNKNOWN_PROTOCOLS: false,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math'],
  FORBID_ATTR: ['style', 'onerror', 'onclick']
};

export function createSanitizer(windowObject?: any): ReturnType<typeof createDOMPurify> {
  return createDOMPurify(windowObject ?? sanitizerWindow ?? (globalThis as any));
}

export function sanitizeCellHtml(value: string, windowObject?: any): string {
  const purifier = createSanitizer(windowObject);
  return (purifier.sanitize(value, sanitizeConfig) ?? '') as string;
}

export function normalizeHtmlForEditor(value: string, windowObject?: any): string {
  const sanitizer = createSanitizer(windowObject);
  const cleaned = (sanitizer.sanitize(value ?? '', sanitizeConfig) ?? '') as string;

  if (!cleaned.trim()) {
    return '<p></p>';
  }

  return cleaned;
}
