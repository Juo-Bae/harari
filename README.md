# 재고 관리 시스템

Google 스프레드시트 기반 재고 관리 시스템입니다.

## 기술 스택

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Google Sheets API

## 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_CREDENTIALS_PATH=./credentials/service-account-key.json
```

### 2. Google 서비스 계정 키 설정

1. Google Cloud Console에서 서비스 계정 키를 다운로드합니다.
2. `credentials` 폴더에 `service-account-key.json` 이름으로 저장합니다.
3. Google 스프레드시트를 서비스 계정 이메일과 공유합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 4. Google Sheets API 연결 테스트

연결이 제대로 설정되었는지 확인하려면:

1. 브라우저에서 [http://localhost:3000/test-connection](http://localhost:3000/test-connection) 접속
2. "연결 테스트" 버튼 클릭
3. 연결 성공 메시지 확인

연결이 실패하는 경우:
- `.env.local` 파일의 값이 올바른지 확인
- `credentials/service-account-key.json` 파일이 존재하는지 확인
- Google 스프레드시트가 서비스 계정 이메일과 공유되어 있는지 확인

## 프로젝트 구조

```
harari/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── components/         # React 컴포넌트
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈 페이지
├── lib/                    # 유틸리티 함수
│   └── googleSheets.ts    # Google Sheets API 유틸리티
├── credentials/           # 서비스 계정 키 (Git 제외)
└── PRD.md                 # 프로젝트 요구사항 문서
```

## 개발 단계

### 완료된 단계

- [x] **Phase 1**: 기본 설정
  - Next.js 프로젝트 초기화
  - Google Sheets API 연동 설정
  - 기본 레이아웃 및 라우팅 구성

- [x] **Phase 2**: 인증 시스템
  - AUTH 시트 연동
  - 로그인/로그아웃 기능
  - 자동 로그인 기능
  - 비밀번호 변경 팝업

- [x] **Phase 6**: 테스트 및 최적화
  - 에러 처리 개선
  - UI/UX 개선
  - 성능 최적화

- [x] **Phase 3**: 데이터 관리
  - Context API 설정
  - 재고 데이터 로딩 기능
  - 재고조사 데이터 로딩 기능

- [x] **Phase 4**: 페이지 구현
  - 홈 화면 구현
  - 마이페이지 구현
  - 재고현황 페이지 구현
  - 재고조사 페이지 구현

- [x] **Phase 5**: 업데이트 기능
  - 재고조사 데이터 업데이트 기능
  - 재고 시트 업데이트 로직
  - 재고로그 시트 업데이트 로직

## 라이선스

ISC

