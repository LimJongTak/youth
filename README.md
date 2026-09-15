# 청년도약 인재양성 부트캠프

국립순천대학교 AI인재양성부트캠프사업단 — 청년도약 인재양성 부트캠프 공개 홈페이지 + 관리자 CMS.

모바일 전용 웹앱처럼 동작하는 반응형 사이트로, PC에서 열어도 실제 폰 화면 크기(390×844)로 렌더링되고, 실제 모바일 기기에서는 전체 화면으로 자연스럽게 펼쳐집니다.

## 기술 스택

- **프레임워크**: React 19 + TypeScript + Vite
- **스타일**: SCSS Modules (디자인 토큰: `src/styles/_tokens.scss`)
- **폰트**: [Pretendard](https://github.com/orioncactus/pretendard) (한글 UI 폰트)
- **데이터베이스 / 인증**: [Firebase](https://console.firebase.google.com/project/youth-4c20b) — Firestore + Authentication (이메일/비밀번호)
- **배포**: Cloudflare Pages (`youth.scnuai.com`)

## 로컬 개발

```bash
npm install
cp .env.example .env   # 아래 "Firebase 환경변수" 참고해 값 채우기
npm run dev            # http://localhost:5173
```

- 공개 사이트: `/`
- 관리자: `/admin` (로그인 필요)

## 프로젝트 구조

```
src/
  components/     공개 사이트 섹션들 (Hero, Curriculum, Benefits, ...)
  admin/          관리자 화면 (로그인, 기수/콘텐츠/계정 관리)
  context/        CohortContext(기수 데이터), SiteContentContext(페이지 문구)
  hooks/          useAppUser, useElementRect 등 커스텀 훅
  data/           기본값(seed) 데이터 — Firestore가 비어있을 때의 fallback
  types/          Cohort, SiteContent, AppUser 등 타입 정의
  lib/firebase.ts Firebase 앱 초기화
scripts/          Firebase 계정/데이터 시딩용 CLI 스크립트 (Node)
firestore.rules   Firestore 보안 규칙
```

## 데이터 모델 (Firestore)

| 컬렉션 | 설명 | 읽기 | 쓰기 |
|---|---|---|---|
| `cohorts/{id}` | 기수(회차)별 모집 정보, 신청 링크 | 누구나 | 로그인한 관리자/매니저 |
| `siteContent/main` | 페이지 전체 문구 (히어로, 소개, 체크리스트, 커리큘럼, 혜택, 여정, FAQ, 문의처) | 누구나 | 로그인한 관리자/매니저 |
| `users/{uid}` | 계정 권한 (`admin` \| `manager`) | 로그인한 사용자 | 본인 최초 1회, 이후 관리자만 |

관리자는 페이지의 거의 모든 문구와 기수 정보를 공개 사이트를 벗어나지 않고 실시간으로 수정할 수 있습니다. 변경사항은 저장 즉시 모든 방문자에게 반영됩니다 (Firestore 실시간 구독).

## 관리자 계정 / 권한

- **관리자(admin)**: 기수 관리 + 콘텐츠 관리 + 계정 관리(다른 관리자/매니저 계정 생성) 전체 권한
- **매니저(manager)**: 기수 관리 + 콘텐츠 관리만 가능 (계정 관리 불가)

로그인은 "아이디"로 하지만, 내부적으로는 Firebase Auth 이메일/비밀번호 로그인을 `아이디@youth-admin.local` 형태로 매핑해서 사용합니다 (`src/lib/authEmail.ts`).

### 계정 생성 (최초 부트스트랩)

첫 관리자 계정은 앱 UI만으로는 만들 수 없으므로(관리자가 있어야 관리자를 만들 수 있는 구조), CLI 스크립트로 생성합니다:

```bash
node --env-file=.env scripts/create-account.mjs <아이디> <비밀번호> admin
```

이후로는 관리자 화면의 "계정 관리" 탭에서 매니저/관리자 계정을 추가로 만들 수 있습니다.

### 초기 데이터 시딩

새 Firebase 프로젝트에 처음 연결할 때, 기수 데이터와 페이지 문구 기본값을 한 번 넣어줘야 합니다 (계정이 최소 1개 있어야 실행 가능):

```bash
node --env-file=.env scripts/seed-cohorts.mjs
node --env-file=.env --experimental-strip-types scripts/seed-site-content.mjs
```

## Firebase 환경변수

`.env.example`을 복사해 `.env`를 만들고, [Firebase 콘솔](https://console.firebase.google.com/project/youth-4c20b/settings/general) > 프로젝트 설정 > 일반 > 내 앱에서 값을 채웁니다. 같은 값을 Cloudflare Pages 빌드 환경변수에도 등록해야 프로덕션 빌드가 동작합니다.

## Firestore 보안 규칙 배포

`firestore.rules`를 수정한 뒤:

```bash
npx firebase-tools deploy --only firestore:rules --project youth-4c20b
```

## 배포 (Cloudflare Workers — 정적 자산)

`youth.scnuai.com`에 실제 배포되어 있는 구성입니다. Vite로 빌드한 정적 SPA를 Cloudflare Workers의 정적 자산(assets) 기능으로 서빙하며, `wrangler.jsonc`에 설정이 들어있습니다.

- `assets.directory`: `./dist` (빌드 출력)
- `assets.not_found_handling: "single-page-application"` — 존재하지 않는 경로(`/admin` 등)를 요청해도 `index.html`로 폴백되어 클라이언트 라우팅이 정상 동작합니다.
- `routes`에 `youth.scnuai.com` 커스텀 도메인이 등록되어 있고, Cloudflare가 SSL 인증서와 DNS까지 자동으로 관리합니다.

### 재배포 방법

```bash
npm run build
npx wrangler deploy
```

최초 1회는 `npx wrangler login`으로 Cloudflare 계정에 로그인해야 합니다 (이후에는 세션이 유지됩니다). 빌드에 필요한 `VITE_FIREBASE_*` 값은 로컬 `.env`에서 읽어 정적으로 번들되므로, 배포 전 `.env`가 최신 값인지 확인하세요.

### GitHub Actions 자동 배포

`.github/workflows/deploy.yml`이 이미 등록되어 있어, `main` 브랜치에 푸시하면 자동으로 빌드 후 `wrangler deploy`까지 실행됩니다. 최초 1회, 저장소 Settings > Secrets and variables > Actions에 아래 값들을 등록해야 동작합니다.

- `CLOUDFLARE_API_TOKEN`: [Cloudflare API 토큰 발급 페이지](https://dash.cloudflare.com/profile/api-tokens)에서 "Edit Cloudflare Workers" 템플릿으로 토큰을 만들어 등록
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`: 로컬 `.env`와 동일한 값

시크릿 등록 전까지는 워크플로가 실패하므로, 등록하기 전에는 지금처럼 `npm run build && npx wrangler deploy`로 수동 배포하면 됩니다.
