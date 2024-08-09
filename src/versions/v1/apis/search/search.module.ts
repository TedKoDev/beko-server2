import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';
import { PostsModule } from '../posts';
import { UserModule } from '../user';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [UserModule, PostsModule],
  controllers: [SearchController],
  providers: [SearchService, PrismaService],
})
export class SearchModule {}
