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

### 스타트

```
pnpm start:dev
```

npx prisma migrate dev --name post_status_default --schema=prisma/postsql.prisma
