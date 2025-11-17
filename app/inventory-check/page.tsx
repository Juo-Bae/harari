'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useInventory } from '@/app/contexts/InventoryContext';

export default function InventoryCheckPage() {
  const { inventoryCheck, inventoryCheckLoading, inventoryCheckError, refreshInventoryCheck } = useInventory();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    refreshInventoryCheck();
  }, [refreshInventoryCheck]);

  useEffect(() => {
    // 편집 모드 진입 시 현재 데이터를 편집 가능한 상태로 복사
    if (isEditing) {
      const initialData: Record<string, string> = {};
      inventoryCheck.forEach((item) => {
        initialData[item.항목] = item.재고;
      });
      setEditedData(initialData);
    }
  }, [isEditing, inventoryCheck]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({});
  };

  const handleChange = (항목: string, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [항목]: value,
    }));
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/inventory-check/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: Object.entries(editedData).map(([항목, 재고]) => ({
            항목,
            재고,
          })),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsEditing(false);
        setEditedData({});
        await refreshInventoryCheck();
        
        if (result.warning) {
          alert(`재고가 업데이트되었습니다.\n\n주의: ${result.warning}`);
        } else {
          alert(result.message || '재고가 성공적으로 업데이트되었습니다.');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || '업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (inventoryCheckLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-lg text-gray-700">재고조사 데이터를 불러오는 중...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (inventoryCheckError) {
    return (
      <ProtectedRoute>
        <div className="px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {inventoryCheckError}
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
            <h1 className="text-3xl font-bold text-gray-900">재고조사</h1>
            <div className="flex space-x-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={refreshInventoryCheck}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    새로고침
                  </button>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    조사
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? '업데이트 중...' : '업데이트'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      항목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      재고
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryCheck.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                        데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    inventoryCheck.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.항목}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedData[item.항목] || item.재고}
                              onChange={(e) => handleChange(item.항목, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <span>{item.재고}</span>
                          )}
                        </td>
                      </tr>
                    ))
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

