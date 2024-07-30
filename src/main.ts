import {
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import * as config from 'config';

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters';
import { CustomException } from './plugins';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[] = []) => {
        const getErrorContent = (e: ValidationError) => {
          return e.constraints
            ? {
                property: e.property,
                errors: e.constraints && Object.keys(e.constraints),
              }
            : e.children
              ? {
                  property: e.property,
                  children: e.children.map(getErrorContent),
                }
              : {
                  property: e.property,
                };
        };

        return new CustomException({
          code: 'common/validation-error',
          statusCode: 400,
          expands: {
            detail: errors.map(getErrorContent),
          },
        });
      },
    }),
  );

  app.enableVersioning({ type: VersioningType.URI });

  app.useGlobalFilters(HttpExceptionFilter(config.get<boolean>('debug')));

  const port = config.get<number>('port') ?? 5050;

  console.log(
    `🚀 Server is running on ${port}, mode: [${config.get<string>('env')}], debug: [${config.get<boolean>('debug')}]`,
  );

  await app.listen(port);
}
bootstrap();
