import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError, ApiResponse } from './types';

/**
 * Create a success response
 */
export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
        success: true,
        data,
        message,
    });
}

/**
 * Create an error response
 */
export function errorResponse(
    error: string,
    statusCode: number = 500,
    details?: any
): NextResponse<ApiError> {
    return NextResponse.json(
        {
            success: false,
            error,
            details,
            statusCode,
        },
        { status: statusCode }
    );
}

/**
 * Handle errors and return appropriate response
 */
export function handleError(error: unknown): NextResponse<ApiError> {
    console.error('API Error:', error);

    // Zod validation errors
    if (error instanceof ZodError) {
        return errorResponse(
            'Validation failed',
            400,
            error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message,
            }))
        );
    }

    // Prisma errors
    if (error && typeof error === 'object' && 'code' in error && typeof (error as any).code === 'string' && (error as any).constructor.name.includes('PrismaClientKnownRequestError')) {
        const prismaError = error as any;
        switch (prismaError.code) {
            case 'P2002':
                return errorResponse(
                    'A record with this unique field already exists',
                    409,
                    { field: prismaError.meta?.target }
                );
            case 'P2025':
                return errorResponse('Record not found', 404);
            case 'P2003':
                return errorResponse(
                    'Foreign key constraint failed',
                    400,
                    { field: prismaError.meta?.field_name }
                );
            default:
                return errorResponse('Database error', 500, { code: prismaError.code });
        }
    }

    // Custom application errors
    if (error instanceof Error) {
        // Check for specific error messages
        if (error.message.includes('not found')) {
            return errorResponse(error.message, 404);
        }
        if (error.message.includes('Insufficient stock')) {
            return errorResponse(error.message, 400);
        }
        if (error.message.includes('Credit limit exceeded')) {
            return errorResponse(error.message, 400);
        }
        if (error.message.includes('No pricing tier found')) {
            return errorResponse(error.message, 404);
        }

        return errorResponse(error.message, 500);
    }

    // Unknown errors
    return errorResponse('An unexpected error occurred', 500);
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequest<T extends z.ZodTypeAny>(
    request: Request,
    schema: T
): Promise<z.infer<T>> {
    try {
        const body = await request.json();
        return schema.parse(body);
    } catch (error) {
        throw error;
    }
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQuery<T extends z.ZodTypeAny>(
    searchParams: URLSearchParams,
    schema: T
): z.infer<T> {
    const params = Object.fromEntries(searchParams.entries());
    return schema.parse(params);
}
