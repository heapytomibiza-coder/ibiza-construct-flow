/**
 * @core/services/api - API services barrel export
 */

export { httpClient, type HttpClientOptions } from './httpClient';
export { APIError } from '../../dto/common';
export {
  getErrorMessage,
  normalizeError,
  handleApiError,
  isAuthError,
  isPermissionError,
  isNotFoundError,
  isValidationError,
  isNetworkError,
  type ErrorHandlerOptions,
} from './errorHandler';
