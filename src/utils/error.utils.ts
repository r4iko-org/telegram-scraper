export enum ErrorStatus {
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

export class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export function setupGlobalErrorHandlers() {
  process.on('uncaughtException', (err: Error) => {
    console.error('Uncaught Exception:', err.message);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any) => {
    console.error('Unhandled Rejection:', reason?.message || reason);
  });
}