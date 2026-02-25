import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { SKIP_TRANSFORM_KEY } from '../decorators/skip-transform.decorator';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<
    T,
    any
> {
    constructor(private readonly reflector: Reflector) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<any> {
        const skip = this.reflector.getAllAndOverride<boolean>(
            SKIP_TRANSFORM_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (skip) {
            return next.handle();
        }

        return next.handle().pipe(
            map((data) => ({
                success: true,
                data,
                timestamp: new Date().toISOString(),
            })),
        );
    }
}
