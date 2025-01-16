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

이제 Docker 설정이 완료되었습니다. 주요 특징은 다음과 같습니다:
Multi-stage Build: Dockerfile에서 빌드 단계와 실행 단계를 분리하여 최종 이미지 크기를 최소화했습니다.
서비스 구성:
api: NestJS 애플리케이션
db: PostgreSQL 데이터베이스
prisma: 데이터베이스 마이그레이션
ngrinder: 성능 테스트 도구
네트워크: 모든 서비스가 app-network로 연결되어 있어 서로 통신이 가능합니다.
환경 설정: 데이터베이스 URL 등 환경 변수가 적절히 구성되어 있습니다.
이제 다음 명령어로 애플리케이션을 실행할 수 있습니다:
docker-compose up --build
docker-compose up --build
