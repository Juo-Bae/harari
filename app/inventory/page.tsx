'use client';

import { useEffect } from 'react';
import Link from 'next/link';
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

export default function InventoryPage() {
  const { inventory, inventoryLoading, inventoryError, refreshInventory } = useInventory();

  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);

  if (inventoryLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-lg text-gray-700">재고 데이터를 불러오는 중...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (inventoryError) {
    return (
      <ProtectedRoute>
        <div className="px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {inventoryError}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">재고현황</h1>
            <button
              onClick={refreshInventory}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              새로고침
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-0 py-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8 border border-gray-300">
                      <div className="px-2 py-2">
                        {/* 중요도 색상 점 */}
                      </div>
                    </th>
                    <th className="px-0 py-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      <div className="px-3 py-2">이름</div>
                    </th>
                    <th className="px-0 py-0 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      <div className="px-3 py-2">재고</div>
                    </th>
                    <th className="px-0 py-0 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      <div className="px-3 py-2">안전</div>
                    </th>
                    <th className="px-0 py-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      <div className="px-3 py-2">체크 요일</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-0 py-0 text-center text-gray-500 border border-gray-300">
                        <div className="px-3 py-2">데이터가 없습니다.</div>
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item, index) => {
                      const detailUrl = `/inventory/${encodeURIComponent(item.이름)}`;
                      return (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-0 py-0 whitespace-nowrap w-8 border border-gray-300">
                            <Link href={detailUrl} className="flex items-center justify-center px-2 py-2">
                              <div
                                className={`w-3 h-3 rounded-full ${getImportanceColor(item.중요도)}`}
                                title={`중요도: ${item.중요도 || '-'}`}
                              ></div>
                            </Link>
                          </td>
                          <td className="px-0 py-0 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
                            <Link href={detailUrl} className="block hover:text-blue-600 px-3 py-2">
                              {item.이름}
                            </Link>
                          </td>
                          <td className="px-0 py-0 whitespace-nowrap text-sm text-gray-900 border border-gray-300 text-right">
                            <Link href={detailUrl} className="block px-3 py-2">
                              {item.재고}
                            </Link>
                          </td>
                          <td className="px-0 py-0 whitespace-nowrap text-sm text-gray-900 border border-gray-300 text-right">
                            <Link href={detailUrl} className="block px-3 py-2">
                              {item.안전}
                            </Link>
                          </td>
                          <td className="px-0 py-0 whitespace-nowrap text-sm border border-gray-300">
                            <Link href={detailUrl} className="block px-3 py-2">
                              {formatCheckDay(item.체크요일)}
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

