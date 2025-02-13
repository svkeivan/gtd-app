import { auth } from "./auth";
import {
  AuthenticationError,
  formatErrorResponse,
  logError,
} from "./errors";

type ActionResult<T> = Promise<
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; context?: any } }
>;

type ActionFunction<T> = (...args: any[]) => Promise<T>;

export function createSafeAction<T>(
  action: ActionFunction<T>,
  requireAuth = true
): (...args: Parameters<typeof action>) => ActionResult<T> {
  return async (...args) => {
    try {
      if (requireAuth) {
        const { user } = await auth();
        if (!user) {
          throw new AuthenticationError();
        }
      }

      const result = await action(...args);
      return { success: true, data: result } as const;
    } catch (error) {
      // Log all errors
      logError(error as Error, { actionName: action.name, args });

      // Format and return error response
      const errorResponse = formatErrorResponse(error as Error);
      return {
        success: false,
        error: {
          code: errorResponse.error.code,
          message: errorResponse.error.message,
          context: errorResponse.error.context,
        },
      } as const;
    }
  };
}