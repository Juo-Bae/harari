'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useInventory } from '@/app/contexts/InventoryContext';
import { formatDateToYYYYMMDD } from '@/lib/dateUtils';

// 중요도에 따른 색상 반환
function getImportanceColor(중요도: string): string {
  const 중요도Lower = 중요도?.toLowerCase().trim() || '';
  
  if (중요도Lower.includes('높') || 중요도Lower.includes('high') || 중요도Lower === '1' || 중요도Lower === '상') {
    return 'bg-red-500'; // 빨간색
  } else if (중요도Lower.includes('중') || 중요도Lower.includes('medium') || 중요도Lower === '2' || 중요도Lower === '중') {
    return 'bg-yellow-500'; // 노란색
  } else if (중요도Lower.includes('낮') || 중요도Lower.includes('low') || 중요도Lower === '3' || 중요도Lower === '하') {
    return 'bg-green-500'; // 초록색
  }
  
  return 'bg-gray-400'; // 기본 회색
}

// 오늘 요일 반환 (한글)
function getTodayDay(): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[new Date().getDay()];
}

// 체크요일 포맷팅 (오늘 요일 강조)
function formatCheckDay(체크요일: string): React.ReactNode {
  if (!체크요일 || 체크요일.trim() === '') {
    return <span className="text-gray-400">-</span>;
  }

  const today = getTodayDay();
  const 요일들 = ['월', '화', '수', '목', '금', '토', '일'];
  
  // 체크요일 문자열에서 포함된 요일만 추출
  const checkedDays = 요일들.filter(요일 => 체크요일.includes(요일));
  
  if (checkedDays.length === 0) {
    return <span className="text-gray-400">-</span>;
  }
  
  return (
    <div className="flex gap-1">
      {checkedDays.map((요일) => {
        const isToday = 요일 === today;
        
        if (isToday) {
          // 오늘 요일 - 강조 표시 (파란색 원)
          return (
            <span
              key={요일}
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-semibold"
            >
              {요일}
            </span>
          );
        } else {
          // 체크된 요일 (오늘 아님) - 일반 표시
          return (
            <span
              key={요일}
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-[10px]"
            >
              {요일}
            </span>
          );
        }
      })}
    </div>
  );
}

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { inventory, inventoryLoading, refreshInventory } = useInventory();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);

  useEffect(() => {
    if (inventory.length > 0 && params.name) {
      const decodedName = decodeURIComponent(params.name as string);
      const foundItem = inventory.find((inv) => inv.이름 === decodedName);
      setItem(foundItem || null);
    }
  }, [inventory, params.name]);

  if (inventoryLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-lg text-gray-700">데이터를 불러오는 중...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!item) {
    return (
      <ProtectedRoute>
        <div className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              항목을 찾을 수 없습니다.
            </div>
            <button
              onClick={() => router.push('/inventory')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              재고현황으로 돌아가기
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
            >
              ← 뒤로가기
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{item.이름} 상세정보</h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* 1. 구매 상황 (단독) */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">구매 상황</label>
              <p className="text-lg text-gray-900">{item.구매상황 || '-'}</p>
            </div>

            {/* 2. 코드 중요도 (같은 줄) */}
            <div className="flex gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-500 mb-1">코드</label>
                <p className="text-lg text-gray-900">{item.코드 || '-'}</p>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-500 mb-1">중요도</label>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full ${getImportanceColor(item.중요도)}`}
                  ></div>
                  <p className="text-lg text-gray-900">{item.중요도 || '-'}</p>
                </div>
              </div>
            </div>

            {/* 3. 이름(크게) (단독) */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">이름</label>
              <p className="text-3xl font-bold text-gray-900">{item.이름 || '-'}</p>
            </div>

            {/* 4. 재고 소비량 안전 단위 (같은 줄) */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">재고</label>
                <p className="text-lg text-gray-900 font-semibold">{item.재고 || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">소비량</label>
                <p className="text-lg text-gray-900">{item.소비량 || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">안전</label>
                <p className="text-lg text-gray-900">{item.안전 || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">단위</label>
                <p className="text-lg text-gray-900">{item.단위 || '-'}</p>
              </div>
            </div>

            {/* 5. 체크요일 (단독) */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">체크 요일</label>
              <div className="mt-1">
                {formatCheckDay(item.체크요일)}
              </div>
            </div>

            {/* 6. 구매처 (단독) */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">구매처</label>
              <p className="text-lg text-gray-900">{item.구매처 || '-'}</p>
            </div>

            {/* 7. MOQ 리드타임 (같은 줄) */}
            <div className="flex gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-500 mb-1">MOQ</label>
                <p className="text-lg text-gray-900">{item.MOQ || '-'}</p>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-500 mb-1">리드타임</label>
                <p className="text-lg text-gray-900">{item.리드타임 || '-'}</p>
              </div>
            </div>

            {/* 8. 최근 구매수량 최근 구매일 (같은 줄) */}
            <div className="flex gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-500 mb-1">최근 구매수량</label>
                <p className="text-lg text-gray-900">{item.최근구매수량 || '-'}</p>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-500 mb-1">최근 구매일</label>
                <p className="text-lg text-gray-900">{formatDateToYYYYMMDD(item.최근구매일자) || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

