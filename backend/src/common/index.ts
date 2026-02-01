// Middleware
export {
  SanitizeMiddleware,
  sanitizeMiddleware,
} from './middleware/sanitize.middleware';

// Pipes
export {
  XssSanitizePipe,
  sanitizeXss,
  containsXssPatterns,
} from './pipes/xss-sanitize.pipe';
export { ParseMongoIdPipe } from './pipes/parse-mongo-id.pipe';

// Decorators
export {
  SanitizeXss,
  SanitizeXssArray,
  TrimAndSanitize,
} from './decorators/sanitize.decorator';

// Filters
export { ThrottlerExceptionFilter } from './filters/throttler-exception.filter';
