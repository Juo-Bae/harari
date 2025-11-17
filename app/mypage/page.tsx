'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/contexts/AuthContext';
import PasswordChangeModal from '@/app/components/PasswordChangeModal';

export default function MyPage() {
  const { user, logout, setPasswordChangeComplete } = useAuth();
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handlePasswordChangeComplete = () => {
    setPasswordChangeComplete();
    setShowPasswordModal(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <ProtectedRoute>
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">마이페이지</h1>

          {/* 사용자 정보 카드 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">사용자 정보</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">이름</span>
                <span className="text-gray-900">{user?.이름 || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">번호</span>
                <span className="text-gray-900">{user?.번호 || '-'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 font-medium">최종 로그인 시간</span>
                <span className="text-gray-900">{formatDate(user?.최종로그인시간 || '')}</span>
              </div>
            </div>
          </div>

          {/* 비밀번호 변경 카드 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">비밀번호 변경</h2>
            <p className="text-gray-600 mb-4">
              비밀번호를 변경하려면 아래 버튼을 클릭하세요.
            </p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              비밀번호 변경
            </button>
          </div>

          {/* 로그아웃 카드 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">로그아웃</h2>
            <p className="text-gray-600 mb-4">
              로그아웃하면 현재 세션이 종료됩니다.
            </p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <PasswordChangeModal
          onComplete={handlePasswordChangeComplete}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </ProtectedRoute>
  );
}

