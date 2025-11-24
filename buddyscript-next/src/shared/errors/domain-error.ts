export class DomainError extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly statusCode: number = 400
    ) {
        super(message);
        this.name = "DomainError";
    }

    static notFound(resource: string, id?: string): DomainError {
        const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
        return new DomainError("NOT_FOUND", message, 404);
    }

    static unauthorized(message: string = "Authentication required"): DomainError {
        return new DomainError("UNAUTHORIZED", message, 401);
    }

    static forbidden(message: string = "Access forbidden"): DomainError {
        return new DomainError("FORBIDDEN", message, 403);
    }

    static conflict(message: string): DomainError {
        return new DomainError("CONFLICT", message, 409);
    }

    static validation(message: string): DomainError {
        return new DomainError("VALIDATION_ERROR", message, 422);
    }
}
