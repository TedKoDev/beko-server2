import { Module } from '@nestjs/common';
import { VectorDocumentModule } from '../vector-document/vector-document.module';
import { ChatbotController } from './chatbot.controller';
import { ChatbotGateway } from './chatbot.gateway';
import { ChatbotService } from './chatbot.service';

@Module({
  imports: [VectorDocumentModule],
  controllers: [ChatbotController],
  providers: [ChatbotService, ChatbotGateway],
})
export class ChatbotModule {}
