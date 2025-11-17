'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import PasswordChangeModal from '@/app/components/PasswordChangeModal';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, isLoading: authLoading, needsPasswordChange } = useAuth();
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // 비밀번호 변경이 필요한 경우 모달 표시
  useEffect(() => {
    if (user && needsPasswordChange) {
      setShowPasswordModal(true);
    }
  }, [user, needsPasswordChange]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 숫자만 허용하고 최대 6자리로 제한
    if (value === '' || /^\d{0,6}$/.test(value)) {
      setNumber(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 비밀번호가 6자리가 아닌 경우 에러 표시
    if (number.length !== 6) {
      setError('비밀번호는 6자리 숫자여야 합니다.');
      return;
    }
    
    setIsLoading(true);

    const result = await login(name, number);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || '이름 또는 비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
    }
  };

  const handlePasswordChangeComplete = () => {
    setShowPasswordModal(false);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-lg text-gray-700">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="이름을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="number"
              type="password"
              value={number}
              onChange={handleNumberChange}
              required
              maxLength={6}
              inputMode="numeric"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="6자리 숫자를 입력하세요"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>

      {showPasswordModal && (
        <PasswordChangeModal
          onComplete={handlePasswordChangeComplete}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
}

