import type { Metadata } from 'next';
import './globals.css';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { InventoryProvider } from './contexts/InventoryContext';
import DisableDevMenu from './components/DisableDevMenu';

export const metadata: Metadata = {
  title: '하라리',
  description: 'Google 스프레드시트 기반 재고 관리 시스템',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <DisableDevMenu />
        <AuthProvider>
          <InventoryProvider>
            <Layout>{children}</Layout>
          </InventoryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

