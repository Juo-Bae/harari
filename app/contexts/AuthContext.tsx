'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

interface User {
  이름: string;
  번호: string;
  비밀번호변경완료: string;
  최종로그인시간: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (name: string, number: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
  needsPasswordChange: boolean;
  setPasswordChangeComplete: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'harari_auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 토큰 검증
  const verifyToken = useCallback(async (tokenToVerify?: string): Promise<boolean> => {
    const tokenToCheck = tokenToVerify || token;
    if (!tokenToCheck) {
      setIsLoading(false);
      return false;
    }

    try {
      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToCheck }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(tokenToCheck);
        setIsLoading(false);
        return true;
      } else {
        // 토큰이 유효하지 않으면 삭제
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Token verification error:', error);
      setIsLoading(false);
      return false;
    }
  }, [token]);

  // 로컬 스토리지에서 토큰 로드
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        setToken(storedToken);
        await verifyToken(storedToken);
      } else {
        setIsLoading(false);
      }
    };
    loadToken();
  }, [verifyToken]);

  // 로그인
  const login = useCallback(async (name: string, number: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, number }),
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.token;
        setToken(newToken);
        setUser(data.user);
        localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({ error: '로그인에 실패했습니다.' }));
        return { success: false, error: errorData.error || '로그인에 실패했습니다.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: '네트워크 오류가 발생했습니다. 다시 시도해주세요.' };
    }
  }, []);


  // 비밀번호 변경 필요 여부
  const needsPasswordChange = useMemo(() => user?.비밀번호변경완료 !== 'Y', [user]);

  // 비밀번호 변경 완료 처리
  const setPasswordChangeComplete = useCallback(() => {
    if (user) {
      setUser({ ...user, 비밀번호변경완료: 'Y' });
    }
  }, [user]);

  // 로그아웃 함수 최적화
  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    // 로그아웃 API 호출
    fetch('/api/auth/logout', {
      method: 'POST',
    }).catch(console.error);
  }, []);

  // verifyToken 래퍼 최적화
  const handleVerifyToken = useCallback(() => {
    return verifyToken();
  }, [verifyToken]);

  const contextValue = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      logout: handleLogout,
      verifyToken: handleVerifyToken,
      needsPasswordChange,
      setPasswordChangeComplete,
    }),
    [user, token, isLoading, login, handleLogout, handleVerifyToken, needsPasswordChange, setPasswordChangeComplete]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

