'use client';

import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // 로그인 페이지는 Layout 없이 전체 화면 사용
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                하라리
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <Link
                    href="/mypage"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    마이페이지
                  </Link>
                  <span className="text-gray-500 text-sm">
                    {user.이름}님
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

