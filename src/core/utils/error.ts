export abstract class ClientError extends Error {
    public abstract readonly code: number;
}

export class BadRequestError extends ClientError {
    public readonly code = 400;
}

export class UnauthorizedError extends ClientError {
    public readonly code = 401;
}

export class ForbiddenError extends ClientError {
    public readonly code = 403;
}

export class TimeoutError extends ClientError {
    public readonly code = 408;
}

export class InternalServerError extends ClientError {
    public readonly code = 500;
}

export class NotImplementedError extends ClientError {
    public readonly code = 501;
}