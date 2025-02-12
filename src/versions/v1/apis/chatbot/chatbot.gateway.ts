import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatbotService } from './chatbot.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chatbot',
})
export class ChatbotGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly chatbotService: ChatbotService) {}

  @SubscribeMessage('ask')
  async handleMessage(
    @MessageBody() question: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // 스트림 시작을 알림
      client.emit('responseStart');

      const response = await this.chatbotService.generateResponse(question);

      // 답변과 관련 문서를 클라이언트에 전송
      client.emit('response', response);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
