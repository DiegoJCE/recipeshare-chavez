export const COMMENT_MAX_LENGTH = 500;

export function isValidComment(body) {
  return typeof body === 'string' && body.length <= COMMENT_MAX_LENGTH
    && body.trim().length > 0 && !body.includes('\0');
}
