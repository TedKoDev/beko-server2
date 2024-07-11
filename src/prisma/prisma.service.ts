import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as config from 'config';
import {
  PrismaClient as MongoClient,
  Prisma as MongoPrisma,
} from '../../prisma/generated/mongo-client';

@Injectable()
export class MongoPrismaService
  extends MongoClient<MongoPrisma.PrismaClientOptions, 'query' | 'error'>
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        `warn`,
        `error`,
      ],
    });

    if (config.get<boolean>('debug')) {
      this.$on('query', (e) => {
        console.log('Query: ' + e.query);
        console.log('Params: ' + e.params);
        console.log('Duration: ' + e.duration + 'ms');
      });
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
