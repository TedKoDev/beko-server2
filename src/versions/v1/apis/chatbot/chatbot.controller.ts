import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';

class ChatbotQuestionDto {
  question: string;
}

@Controller({
  path: 'chatbot',
  version: '1',
})
@ApiTags('챗봇')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  @ApiOperation({ summary: '챗봇에게 질문하기' })
  async ask(@Body() { question }: ChatbotQuestionDto) {
    return this.chatbotService.generateResponse(question);
  }
}
