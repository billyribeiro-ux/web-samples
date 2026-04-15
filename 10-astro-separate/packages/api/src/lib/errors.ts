export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorBody(err: unknown) {
  if (err instanceof ApiError) {
    return {
      error: {
        message: err.message,
        code: err.code ?? "ERROR",
        details: err.details,
      },
    };
  }
  console.error(err);
  return {
    error: {
      message: "Internal server error",
      code: "INTERNAL",
    },
  };
}
