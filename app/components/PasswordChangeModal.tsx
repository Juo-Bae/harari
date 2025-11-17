'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface PasswordChangeModalProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function PasswordChangeModal({ onComplete, onClose }: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, setPasswordChangeComplete } = useAuth();

  const handlePasswordChange = (value: string, setter: (value: string) => void) => {
    // 숫자만 허용하고 최대 6자리로 제한
    if (value === '' || /^\d{0,6}$/.test(value)) {
      setter(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검증
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (currentPassword.length !== 6) {
      setError('현재 비밀번호는 6자리 숫자여야 합니다.');
      return;
    }

    if (newPassword.length !== 6) {
      setError('새 비밀번호는 6자리 숫자여야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('harari_auth_token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          token,
        }),
      });

      if (response.ok) {
        setPasswordChangeComplete();
        onComplete();
      } else {
        const data = await response.json();
        setError(data.error || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setError('비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">비밀번호 변경</h2>
        <p className="text-sm text-gray-600 mb-4">
          처음 로그인하셨습니다. 비밀번호를 변경해주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              현재 비밀번호
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => handlePasswordChange(e.target.value, setCurrentPassword)}
              required
              maxLength={6}
              inputMode="numeric"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="6자리 숫자를 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              새 비밀번호
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => handlePasswordChange(e.target.value, setNewPassword)}
              required
              maxLength={6}
              inputMode="numeric"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="6자리 숫자를 입력하세요"
            />
            <p className="text-xs text-gray-500 mt-1">6자리 숫자를 입력해주세요.</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              새 비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => handlePasswordChange(e.target.value, setConfirmPassword)}
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

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              나중에
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '변경 중...' : '변경'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

