'use client';

import Link from 'next/link';
import ProtectedRoute from './components/ProtectedRoute';
import PasswordChangeModal from './components/PasswordChangeModal';
import { useAuth } from './contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user, needsPasswordChange, setPasswordChangeComplete } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (user && needsPasswordChange) {
      setShowPasswordModal(true);
    }
  }, [user, needsPasswordChange]);

  const handlePasswordChangeComplete = () => {
    setPasswordChangeComplete();
    setShowPasswordModal(false);
  };

  return (
    <ProtectedRoute>
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            하라리
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/inventory"
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                재고현황
              </h2>
              <p className="text-gray-600">
                재고 데이터를 조회합니다.
              </p>
            </Link>
            <Link
              href="/inventory-check"
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                재고조사
              </h2>
              <p className="text-gray-600">
                재고를 조사하고 업데이트합니다.
              </p>
            </Link>
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

