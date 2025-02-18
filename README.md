## 설치하기

```
pnpm install
```

## postsql 로컬 환경 세팅

### 시작하기

docker를 활성화 시켜주세요.

```
mkdir db
pnpm docker:compose
pnpm prisma:init
```

### 마이그레이션

```
pnpm prisma:migrate
```

npx prisma generate --schema=prisma/postsql.prisma

### 스타트

```
pnpm start:dev
```

npx prisma migrate dev --name post_status_default --schema=prisma/postsql.prisma

npx prisma migrate dev --name like_isliked_deleted --schema=prisma/postsql.prisma

### s3 prisigned 서비스

pnpm install @aws-sdk/s3-request-presigner

### google 로그인

pnpm add @nestjs/passport passport passport-google-oauth20

### node-cron

pnpm add node-cron
pnpm add -D @types/node-cron

# Prisma를 사용한 데이터 리셋

npx prisma migrate reset --schema=prisma/postsql.prisma

## 추가 진행할 사항

- 글로벌화 = ip를 통한 접속자 국가확인 그에따른 언어 제공

  - 프론트에서 처리

- 모르는 단어 유사단어 알려주는 기능 임베딩 + vector DB

- 서버의 도커 컨테이너 화 -> 무중단배포 AWS ECS 이용해서 배포하기

- 웹버전 개발 시작

## nGrinder

ngrinder로 API 부하 테스트를 하기 위해서는 실제로 테스트할 서버가 실행되고 있어야 합니다. 그래서 맞습니다. pnpm run start:dev로 서버를 실행해두어야 합니다.
테스트 스크립트 작성 과정을 설명해드리겠습니다:
먼저 서버를 실행해주세요:
dev 2. ngrinder 웹 인터페이스(http://localhost:9000)에 접속하여 로그인 (admin/admin)
스크립트 작성 순서:
상단 메뉴에서 "Script" 클릭
"Create" 버튼 클릭
"Create a script" 선택
테스트할 API의 정보를 입력:
Script Name: 원하는 이름 (예: api_test)
URL: 테스트할 API 주소 (예: http://host.docker.internal:3000/api/v1/users)
프로토콜: HTTP
메소드: GET/POST/PUT 등 API에 맞게 선택

# sentry 로깅 서비스 설치

pnpm add @sentry/node @sentry/profiling-node

# 벡터를 위한 페키지 추가부터

## PGVector 설정하기

### 1. Docker Compose 설정

- PostgreSQL 16 버전과 PGVector를 함께 사용하기 위해 `docker-compose.yml`의 db 서비스 이미지를 수정:

```yaml
db:
  image: pgvector/pgvector:pg16
```

### 2. Prisma 스키마 설정

- `prisma/postsql.prisma` 파일에 vector 확장 추가:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRE_SQL_DATABASE_URL")
  extensions = [vector, uuidOssp(map: "uuid-ossp")]
}
```

### 3. 마이그레이션 실행

```bash
pnpm prisma migrate dev --schema=prisma/postsql.prisma --name add_vector_document
```

### 주의사항

- 기존 데이터베이스가 보존된 상태에서 PGVector 설정이 추가됩니다.
- `./db` 디렉토리의 데이터는 볼륨 마운트로 인해 보존됩니다.

# OpenAI 임베딩과 벡터 문서 기능

## 설정 방법

### 1. OpenAI API 키 설정

`config/default.json` 파일에 OpenAI API 키를 직접 설정:

```json
{
  "openai": {
    "apiKey": "your-api-key-here"
  }
}
```

### 2. 필요한 패키지 설치

```bash
pnpm add openai
```

## 벡터 문서 API 사용법

### 문서 생성

POST `/api/v1/vector-documents`

```json
{
  "title": "문서 제목",
  "content": "문서 내용"
}
```

- 문서 내용은 자동으로 OpenAI의 `text-embedding-3-small` 모델을 통해 1536차원의 벡터로 변환됩니다.
- 변환된 벡터는 PostgreSQL의 vector 타입으로 저장됩니다.

### 주의사항

- OpenAI API 키가 환경변수에 설정되어 있어야 합니다.
- PGVector 확장이 설치되어 있어야 합니다.
- 문서 내용이 너무 길 경우 OpenAI API 제한에 걸릴 수 있습니다.

# WebSocket 챗봇 기능

## 설치

WebSocket 관련 패키지 설치:

```bash
pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io
```

## 사용 방법

### 1. 문서 등록

먼저 벡터 문서를 등록합니다:

```http
POST /api/v1/vector-documents
Content-Type: application/json

{
  "title": "문서 제목",
  "content": "문서 내용"
}
```

### 2. WebSocket 연결

클라이언트에서 다음과 같이 연결합니다:

```typescript
import { io } from 'socket.io-client';

const socket = io('http://your-server:3000/chatbot');

// 연결 이벤트
socket.on('connect', () => {
  console.log('Connected to chat server');
});

// 질문하기
socket.emit('ask', '질문 내용');

// 응답 시작 이벤트
socket.on('responseStart', () => {
  console.log('챗봇이 응답을 시작합니다...');
});

// 응답 받기
socket.on('response', (data) => {
  console.log('답변:', data.answer);
  console.log('관련 문서:', data.relevantDocuments);
});

// 에러 처리
socket.on('error', (error) => {
  console.error('Error:', error.message);
});
```

### 응답 형식

```typescript
{
  answer: string; // GPT가 생성한 답변
  relevantDocuments: {
    // 관련 문서 목록
    id: string;
    title: string;
    content: string;
    similarity: number; // 유사도 점수 (0-1)
  }
  [];
}
```

### 주요 기능

- 실시간 양방향 통신
- 문서 내용 기반 답변 생성
- 유사도 기반 문서 검색
- 다국어 지원 (자동 번역)
- 에러 처리 및 상태 알림

### 기술 스택

- NestJS WebSocket
- Socket.IO
- OpenAI GPT-4
- PostgreSQL pgvector
- OpenAI Embeddings


1. 개발 환경에서 실행 (자동 재시작):
pm2 start ecosystem.config.js --env development

2. 프로덕션 환경에서 실행 (수동 업데이트):
pm2 start ecosystem.config.js --env production

프로덕션 환경에서 업데이트가 필요할 때는:
pnpm run build
pm2 reload beko-app