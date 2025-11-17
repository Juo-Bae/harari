# 재고 관리 시스템 PRD (Product Requirements Document)

## 프로젝트 개요
Next.js 기반의 Google 스프레드시트 연동 재고 관리 시스템

## 기술 스택
- **프레임워크**: Next.js
- **데이터베이스**: Google 스프레드시트 (Google Sheets API)
- **상태 관리**: React Context API
- **인증**: 커스텀 인증 시스템 (Google 스프레드시트 기반)

---

## 1. 인증 시스템 (AUTH)

### 1.1 데이터 구조
Google 스프레드시트 "AUTH" 시트에 다음 컬럼 구조:

| 컬럼명 | 설명 | 데이터 타입 |
|--------|------|------------|
| 이름 | 사용자 이름 | String |
| 번호 | 사용자 번호/ID | String |
| 비밀번호 | 사용자 비밀번호 | String (암호화 권장) |
| 토큰 | 인증 토큰 | String |
| 비밀번호변경완료 | 비밀번호 변경 완료 여부 (Y/N) | String |
| 최종로그인시간 | 마지막 로그인 시간 | DateTime |

### 1.2 기능 요구사항

#### 1.2.1 로그인 기능
- 사용자는 이름과 번호를 입력하여 로그인
- 로그인 성공 시 토큰 생성 및 저장
  - 토큰은 **로컬 스토리지(LocalStorage)**에 저장
  - 스프레드시트의 "토큰" 컬럼에도 저장
- 최종로그인시간 업데이트

#### 1.2.2 자동 로그인 기능
- **동작 방식**:
  - 애플리케이션 시작 시 로컬 스토리지에서 토큰 확인
  - 토큰이 존재하는 경우:
    - 스프레드시트의 AUTH 시트에서 해당 토큰으로 사용자 정보 조회
    - 토큰이 유효한 경우 → 자동 로그인 처리
    - 토큰이 유효하지 않은 경우 → 로그인 페이지로 리다이렉트
  - 토큰이 없는 경우 → 로그인 페이지 표시
- **로그아웃 시**: 로컬 스토리지의 토큰 삭제

#### 1.2.3 비밀번호 변경 팝업
- **조건**: 비밀번호변경완료 컬럼이 "Y"가 아닌 경우
- **동작**:
  - 로그인 직후 비밀번호 변경 팝업 표시
  - 사용자가 비밀번호 변경 완료 시 → 비밀번호변경완료를 "Y"로 업데이트
  - 사용자가 비밀번호 변경 취소/닫기 시 → 팝업만 닫고 다음 로그인 시 다시 표시
- **비밀번호변경완료가 "Y"인 경우**: 팝업 표시하지 않음

---

## 2. 데이터 관리

### 2.1 데이터 소스
Google 스프레드시트의 다음 시트들을 데이터 소스로 사용:

#### 2.1.1 "재고" 시트
다음 컬럼들을 가져옴:
- 구매 상황
- 코드
- 중요도
- 이름
- 재고
- 소비량
- 안전
- 단위
- 체크 요일
- 구매처
- MOQ
- 리드타임
- 최근 구매일자

#### 2.1.2 "재고조사" 시트
다음 컬럼들을 가져옴:
- 항목
- 재고

### 2.2 데이터 저장
- 모든 데이터는 React Context에 저장
- 애플리케이션 시작 시 또는 로그인 후 데이터 로드
- 데이터 변경 시 Context 업데이트 및 스프레드시트 동기화

---

## 3. 홈 화면

### 3.1 UI 구성
- **재고현황** 버튼
  - 클릭 시 `/inventory` 페이지로 이동
- **재고조사** 버튼
  - 클릭 시 `/inventory-check` 페이지로 이동
- **마이페이지** 버튼/링크
  - 클릭 시 `/mypage` 페이지로 이동
  - 헤더 또는 네비게이션 바에 배치 가능

### 3.2 레이아웃
- 깔끔하고 직관적인 버튼 배치
- 반응형 디자인 지원

---

## 4. 마이페이지 (`/mypage`)

### 4.1 기능 개요
- 사용자 정보 조회 및 관리
- 비밀번호 변경 기능
- 로그아웃 기능

### 4.2 사용자 정보 표시
- **이름**: 사용자 이름 표시
- **번호**: 사용자 번호/ID 표시
- **최종로그인시간**: 마지막 로그인 시간 표시
- 정보는 AUTH 시트에서 가져와서 표시

### 4.3 비밀번호 변경 기능

#### 4.3.1 UI 구성
- **현재 비밀번호** 입력 필드
- **새 비밀번호** 입력 필드
- **새 비밀번호 확인** 입력 필드
- **변경** 버튼

#### 4.3.2 기능 요구사항
- 현재 비밀번호 검증
  - AUTH 시트의 해당 사용자 정보와 일치하는지 확인
- 새 비밀번호 유효성 검증
  - 최소 길이 제한 (예: 8자 이상)
  - 새 비밀번호와 확인 비밀번호 일치 확인
- 비밀번호 변경 성공 시
  - AUTH 시트의 비밀번호 업데이트
  - 비밀번호변경완료 컬럼을 "Y"로 업데이트
  - 성공 메시지 표시
- 비밀번호 변경 실패 시
  - 에러 메시지 표시 (현재 비밀번호 불일치 등)

#### 4.3.3 보안 요구사항
- 비밀번호 입력 필드는 마스킹 처리 (password type)
- API 통신 시 비밀번호 암호화 전송 고려

### 4.4 로그아웃 기능

#### 4.4.1 UI 구성
- **로그아웃** 버튼
  - 명확하고 눈에 띄는 위치에 배치
  - 확인 다이얼로그 표시 (선택사항)

#### 4.4.2 기능 요구사항
- 로그아웃 버튼 클릭 시:
  1. 로컬 스토리지에서 토큰 삭제
  2. AuthContext의 인증 상태 초기화
  3. 로그인 페이지(`/login`)로 리다이렉트
- 로그아웃 후에는 자동 로그인되지 않도록 처리

### 4.5 UI 요구사항
- 깔끔하고 직관적인 레이아웃
- 카드 형태 또는 섹션별 구분된 디자인
- 반응형 디자인 지원
- 비밀번호 변경 폼과 로그아웃 버튼을 명확히 구분

### 4.6 접근 제어
- 로그인하지 않은 사용자는 접근 불가
- 인증되지 않은 사용자는 로그인 페이지로 리다이렉트

---

## 5. 재고현황 페이지 (`/inventory`)

### 5.1 기능
- "재고" 시트의 모든 데이터를 표 형태로 표시
- 테이블 컬럼:
  - 구매 상황
  - 코드
  - 중요도
  - 이름
  - 재고
  - 소비량
  - 안전
  - 단위
  - 체크 요일
  - 구매처
  - MOQ
  - 리드타임
  - 최근 구매일자

### 5.2 UI 요구사항
- 읽기 전용 테이블 (현재는 조회만 가능)
- 정렬 기능 (선택사항)
- 검색 기능 (선택사항)
- 반응형 테이블 디자인

---

## 6. 재고조사 페이지 (`/inventory-check`)

### 6.1 기능
- "재고조사" 시트의 데이터를 표시
- 각 항목의 재고 값을 수정 가능한 입력 필드로 표시
- **수정** 버튼: 입력 필드를 편집 가능 상태로 변경
- **업데이트** 버튼: 변경된 데이터를 저장

### 6.2 데이터 업데이트 로직

#### 6.2.1 "재고" 시트 업데이트
- 업데이트 버튼 클릭 시:
  - "재고조사" 시트의 항목과 일치하는 "재고" 시트의 항목을 찾음
  - 해당 항목의 "재고" 값을 "재고조사" 시트의 재고 값으로 업데이트

#### 6.2.2 "재고로그" 시트 업데이트
- 업데이트 버튼 클릭 시:
  - "재고로그" 시트에 다음 데이터 추가/업데이트:
    - 일시: 현재 날짜/시간
    - 코드: 해당 항목의 코드 (재고 시트에서 가져옴)
    - 이름: 해당 항목의 이름 (재고 시트에서 가져옴)
    - 재고: 업데이트된 재고 값
  - **중복 처리**:
    - 일시와 코드가 동일한 경우 → 기존 행 덮어쓰기
    - 일시와 코드가 다른 경우 → 새 행 추가
  - **정렬**: 로그는 내림차순 정렬 (최신 항목이 위에)

### 6.3 UI 요구사항
- 항목과 재고를 한 눈에 볼 수 있는 테이블/리스트 형태
- 수정 모드와 읽기 모드 구분
- 업데이트 성공/실패 피드백

---

## 6. 기술 구현 상세

### 6.1 Google Sheets API 연동

#### 6.1.1 사전 준비
1. **Google Cloud Console 설정**
   - Google Cloud Console (https://console.cloud.google.com/) 접속
   - 새 프로젝트 생성 또는 기존 프로젝트 선택
   - "API 및 서비스" > "라이브러리"에서 "Google Sheets API" 활성화

2. **서비스 계정 생성 (권장)**
   - "API 및 서비스" > "사용자 인증 정보" 이동
   - "사용자 인증 정보 만들기" > "서비스 계정" 선택
   - 서비스 계정 이름 입력 후 생성
   - 생성된 서비스 계정의 이메일 주소 복사

3. **서비스 계정 키 다운로드**
   - 생성된 서비스 계정 클릭
   - "키" 탭 > "키 추가" > "새 키 만들기"
   - JSON 형식 선택 후 다운로드
   - 다운로드한 JSON 파일을 프로젝트 루트의 `credentials` 폴더에 저장 (`.gitignore`에 추가 필수)

4. **Google 스프레드시트 공유 설정**
   - 사용할 Google 스프레드시트 열기
   - "공유" 버튼 클릭
   - 서비스 계정 이메일 주소를 편집자 권한으로 추가

#### 6.1.2 패키지 설치
```bash
npm install googleapis
# 또는
yarn add googleapis
```

#### 6.1.3 환경 변수 설정
`.env.local` 파일 생성:
```env
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_CREDENTIALS_PATH=./credentials/service-account-key.json
```

또는 JSON 내용을 직접 환경 변수로 사용:
```env
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_CREDENTIALS=base64_encoded_json_content
```

#### 6.1.4 Google Sheets 클라이언트 유틸리티 생성
`lib/googleSheets.ts` 파일 생성 예시:
```typescript
import { google } from 'googleapis';

// Google Sheets API 클라이언트 초기화
export async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SHEETS_CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  
  return sheets;
}

// 스프레드시트 ID 가져오기
export function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!id) {
    throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID 환경 변수가 설정되지 않았습니다.');
  }
  return id;
}

// 시트 데이터 읽기
export async function readSheetData(range: string) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  
  return response.data.values || [];
}

// 시트 데이터 쓰기
export async function writeSheetData(range: string, values: any[][]) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  
  const response = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    resource: {
      values,
    },
  });
  
  return response.data;
}

// 시트 데이터 추가 (append)
export async function appendSheetData(range: string, values: any[][]) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values,
    },
  });
  
  return response.data;
}

// 특정 행 찾기 및 업데이트
export async function findAndUpdateRow(
  sheetName: string,
  searchColumnIndex: number,
  searchValue: string,
  updateColumnIndex: number,
  updateValue: any
) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  
  // 전체 데이터 읽기
  const range = `${sheetName}!A:Z`;
  const data = await readSheetData(range);
  
  if (!data || data.length === 0) {
    throw new Error('데이터를 찾을 수 없습니다.');
  }
  
  // 헤더 제외하고 데이터 검색
  const rowIndex = data.findIndex(
    (row, index) => index > 0 && row[searchColumnIndex] === searchValue
  );
  
  if (rowIndex === -1) {
    throw new Error('해당 데이터를 찾을 수 없습니다.');
  }
  
  // 실제 시트의 행 번호는 1부터 시작 (헤더 포함)
  const actualRowNumber = rowIndex + 1;
  const columnLetter = String.fromCharCode(65 + updateColumnIndex); // A=0, B=1, ...
  const updateRange = `${sheetName}!${columnLetter}${actualRowNumber}`;
  
  // 데이터 업데이트
  await writeSheetData(updateRange, [[updateValue]]);
  
  return { rowIndex: actualRowNumber };
}
```

#### 6.1.5 API Route에서 사용 예시
`pages/api/inventory/index.ts` 또는 `app/api/inventory/route.ts` 예시:
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { readSheetData } from '@/lib/googleSheets';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // "재고" 시트의 데이터 읽기 (A2:M 범위는 헤더 제외한 데이터)
    const data = await readSheetData('재고!A2:M');
    
    // 데이터를 객체 배열로 변환
    const inventory = data.map((row) => ({
      구매상황: row[0],
      코드: row[1],
      중요도: row[2],
      이름: row[3],
      재고: row[4],
      소비량: row[5],
      안전: row[6],
      단위: row[7],
      체크요일: row[8],
      구매처: row[9],
      MOQ: row[10],
      리드타임: row[11],
      최근구매일자: row[12],
    }));
    
    return res.status(200).json({ data: inventory });
  } catch (error) {
    console.error('Error reading inventory:', error);
    return res.status(500).json({ error: 'Failed to read inventory data' });
  }
}
```

#### 6.1.6 스프레드시트 ID 찾기
- Google 스프레드시트 URL에서 찾기:
  - URL 형식: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
  - 중괄호 안의 문자열이 스프레드시트 ID입니다.

#### 6.1.7 주의사항
- 서비스 계정 키 파일은 절대 Git에 커밋하지 않기 (`.gitignore`에 추가)
- 환경 변수를 통한 인증 정보 관리
- API 호출 제한 확인 (Google Sheets API는 분당 60회 요청 제한)
- 에러 핸들링 필수
- 배치 요청 활용으로 API 호출 최소화 고려

### 6.2 상태 관리
- React Context API 사용
- Context 구조:
  - `AuthContext`: 인증 정보 관리
    - 토큰을 로컬 스토리지와 Context에 동시 저장
    - 애플리케이션 시작 시 로컬 스토리지에서 토큰 로드
    - 자동 로그인 처리 로직 포함
  - `InventoryContext`: 재고 데이터 관리
  - `InventoryCheckContext`: 재고조사 데이터 관리

### 6.3 API 엔드포인트 (Next.js API Routes)
- `/api/auth/login`: 로그인 처리
- `/api/auth/verify-token`: 토큰 검증 (자동 로그인용)
- `/api/auth/logout`: 로그아웃 처리
- `/api/auth/change-password`: 비밀번호 변경
- `/api/auth/user-info`: 사용자 정보 조회 (마이페이지용)
- `/api/inventory`: 재고 데이터 조회
- `/api/inventory-check`: 재고조사 데이터 조회
- `/api/inventory-check/update`: 재고조사 데이터 업데이트

### 6.4 데이터 동기화
- 클라이언트 측에서 Context에 데이터 캐싱
- 필요 시 스프레드시트에서 최신 데이터 가져오기
- 업데이트 시 즉시 스프레드시트 반영

---

## 7. 보안 요구사항

### 7.1 인증
- 로그인하지 않은 사용자는 접근 불가
- 토큰 기반 인증 사용
- 토큰은 로컬 스토리지에 저장하여 자동 로그인 지원
- 토큰 검증을 통한 보안 강화
- 로그아웃 시 토큰 삭제
- 세션 관리

### 7.2 데이터 보안
- Google Sheets API 인증 정보 보호
- 환경 변수를 통한 민감 정보 관리
- API 키 노출 방지

---

## 8. 사용자 경험 (UX)

### 8.1 로딩 상태
- 데이터 로딩 중 로딩 인디케이터 표시
- 업데이트 진행 중 피드백 제공

### 8.2 에러 처리
- 네트워크 오류 시 에러 메시지 표시
- 스프레드시트 접근 오류 처리
- 사용자 친화적인 에러 메시지

### 8.3 성능
- 데이터 캐싱을 통한 빠른 응답
- 불필요한 API 호출 최소화
- 자동 로그인으로 사용자 편의성 향상

### 8.4 자동 로그인 UX
- 페이지 새로고침 시에도 로그인 상태 유지
- 브라우저를 닫았다가 다시 열어도 자동 로그인
- 토큰 검증 실패 시 명확한 에러 메시지 표시

---

## 9. 향후 확장 가능성

### 9.1 추가 기능 (선택사항)
- 재고 알림 기능 (재고 부족 시)
- 통계 및 차트
- 데이터 내보내기 (CSV, Excel)
- 사용자 권한 관리
- 재고 히스토리 상세 조회

### 9.2 개선 사항
- 실시간 데이터 동기화
- 오프라인 모드 지원
- 모바일 앱 버전

---

## 10. 개발 단계

### Phase 1: 기본 설정
1. Next.js 프로젝트 초기화
2. Google Sheets API 연동 설정
3. 기본 레이아웃 및 라우팅 구성

### Phase 2: 인증 시스템
1. AUTH 시트 연동
2. 로그인 기능 구현
3. 토큰 로컬 스토리지 저장 기능 구현
4. 자동 로그인 기능 구현 (토큰 검증)
5. 로그아웃 기능 구현
6. 비밀번호 변경 팝업 구현

### Phase 3: 데이터 관리
1. Context API 설정
2. 재고 데이터 로딩 기능
3. 재고조사 데이터 로딩 기능

### Phase 4: 페이지 구현
1. 홈 화면 구현
2. 마이페이지 구현
   - 사용자 정보 표시
   - 비밀번호 변경 기능
   - 로그아웃 기능
3. 재고현황 페이지 구현
4. 재고조사 페이지 구현

### Phase 5: 업데이트 기능
1. 재고조사 데이터 업데이트 기능
2. 재고 시트 업데이트 로직
3. 재고로그 시트 업데이트 로직

### Phase 6: 테스트 및 최적화
1. 기능 테스트
2. 성능 최적화
3. UI/UX 개선

---

## 11. 참고사항

### 11.1 Google Sheets API 제한사항
- API 호출 제한 확인 필요
- 배치 요청 활용 고려
- 에러 핸들링 중요

### 11.2 데이터 형식
- 날짜 형식 통일
- 숫자 형식 통일
- 빈 값 처리 방법 정의

---

**작성일**: 2024년
**버전**: 1.0

