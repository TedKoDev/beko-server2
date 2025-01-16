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
