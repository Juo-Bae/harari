/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅
 * @param dateString - 날짜 문자열 (다양한 형식 지원)
 * @returns YYYY-MM-DD 형식의 날짜 문자열, 변환 실패 시 원본 반환
 */
export function formatDateToYYYYMMDD(dateString: string | null | undefined): string {
  if (!dateString || dateString.trim() === '') {
    return '';
  }

  try {
    const trimmed = dateString.trim();
    
    // 이미 YYYY-MM-DD 형식인 경우
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    // ISO 형식 (2025-11-17T14:19:11.794Z) 처리
    if (trimmed.includes('T')) {
      const datePart = trimmed.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        return datePart;
      }
    }

    // Date 객체로 파싱 시도
    const date = new Date(trimmed);
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      return dateString; // 파싱 실패 시 원본 반환
    }

    // YYYY-MM-DD 형식으로 변환
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    // 에러 발생 시 원본 반환
    return dateString;
  }
}

