import { Module } from '@nestjs/common';
import { EmailsService } from './email.service';

@Module({
  controllers: [],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailModule {}
