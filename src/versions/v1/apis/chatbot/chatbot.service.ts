import { Injectable } from '@nestjs/common';
import * as config from 'config';
import OpenAI from 'openai';
import { VectorDocumentService } from '../vector-document/vector-document.service';

@Injectable()
export class ChatbotService {
  private readonly openai: OpenAI;

  constructor(private readonly vectorDocumentService: VectorDocumentService) {
    this.openai = new OpenAI({
      apiKey: config.get<string>('openai.apiKey'),
    });
  }

  async generateResponse(question: string): Promise<{
    answer: string;
    relevantDocuments: any[];
  }> {
    // 1. 관련 문서 검색
    const similarDocuments =
      await this.vectorDocumentService.findSimilarDocuments(question, 3);

    console.log(
      `Found ${similarDocuments.length} relevant documents for query: "${question}"`,
    );

    // 검색 결과가 없을 경우
    if (similarDocuments.length === 0) {
      return {
        answer:
          '죄송합니다. 질문하신 내용과 관련된 문서를 찾지 못했습니다. 다른 방식으로 질문을 해보시거나, 새로운 문서를 등록해주세요.',
        relevantDocuments: [],
      };
    }

    // 2. 컨텍스트 구성
    const context = similarDocuments
      .map((doc: any) => {
        let content = doc.content;
        try {
          // JSON 형식인 경우 가독성 있게 변환
          const jsonContent = JSON.parse(doc.content);
          content = JSON.stringify(jsonContent, null, 2);
        } catch (e) {
          // JSON이 아닌 경우 원본 사용
        }
        return `제목: ${doc.title}\n내용: ${content}\n유사도: ${doc.similarity.toFixed(4)}`;
      })
      .join('\n\n');

    // 3. ChatGPT에 질문과 컨텍스트 전달
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `당신은 도움이 되는 챗봇 어시스턴트입니다. 
          주어진 문서들의 정보를 최대한 활용하여 사용자의 질문에 답변해주세요.
          문서에서 찾은 정보를 바탕으로 답변하되, 문맥을 이해하고 자연스럽게 설명해주세요.
          JSON 형식의 데이터는 사용자가 이해하기 쉽게 풀어서 설명해주세요.
          날짜, 시간, 장소 등 구체적인 정보는 정확하게 언급해주세요.
          찾은 정보의 유사도 점수를 고려하여 신뢰도 높은 정보를 우선적으로 활용해주세요.
          외국어로 질문할 경우 해당 언어로 번역해서 전달해주세요.`,
        },
        {
          role: 'user',
          content: `참고 문서:\n${context}\n\n질문: ${question}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      answer: completion.choices[0].message.content,
      relevantDocuments: similarDocuments,
    };
  }
}
