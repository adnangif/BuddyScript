export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

// Cursor-based pagination for infinite scroll
export interface CursorPaginatedResult<T> {
    data: T[];
    nextCursor: string | null;
    hasMore: boolean;
    total?: number;
}

export interface CursorPaginationParams {
    cursor?: string | null;
    limit?: number;
}
