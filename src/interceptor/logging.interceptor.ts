import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const method = request.method;
    const ip = request.get('x-forwarded-for');
    const userAgent = request.headers['user-agent'];
    const statusCode = response.statusCode;

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `${method} ${statusCode} - ${userAgent} ${ip} ${Date.now() - now}ms`,
        );
      }),
    );
  }
}
