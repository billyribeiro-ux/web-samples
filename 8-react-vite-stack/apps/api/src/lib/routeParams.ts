import { HttpError } from '../middleware/errors.js';

export function routeString(param: string | string[] | undefined): string {
  const v = Array.isArray(param) ? param[0] : param;
  if (!v) throw new HttpError(400, 'Bad route parameter');
  return v;
}
