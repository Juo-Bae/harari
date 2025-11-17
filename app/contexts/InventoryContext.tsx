'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// 재고 데이터 타입
export interface InventoryItem {
  구매상황: string;
  코드: string;
  중요도: string;
  이름: string;
  재고: string;
  소비량: string;
  안전: string;
  단위: string;
  체크요일: string;
  구매처: string;
  MOQ: string;
  리드타임: string;
  최근구매일자: string;
}

// 재고조사 데이터 타입
export interface InventoryCheckItem {
  항목: string;
  재고: string;
}

interface InventoryContextType {
  // 재고 데이터
  inventory: InventoryItem[];
  inventoryLoading: boolean;
  inventoryError: string | null;
  loadInventory: () => Promise<void>;
  refreshInventory: () => Promise<void>;

  // 재고조사 데이터
  inventoryCheck: InventoryCheckItem[];
  inventoryCheckLoading: boolean;
  inventoryCheckError: string | null;
  loadInventoryCheck: () => Promise<void>;
  refreshInventoryCheck: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // 재고 데이터 상태
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  // 재고조사 데이터 상태
  const [inventoryCheck, setInventoryCheck] = useState<InventoryCheckItem[]>([]);
  const [inventoryCheckLoading, setInventoryCheckLoading] = useState(false);
  const [inventoryCheckError, setInventoryCheckError] = useState<string | null>(null);

  // 재고 데이터 로드
  const loadInventory = useCallback(async () => {
    if (!user) return;

    setInventoryLoading(true);
    setInventoryError(null);

    try {
      const response = await fetch('/api/inventory');
      
      if (!response.ok) {
        throw new Error('재고 데이터를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setInventory(data.data || []);
    } catch (error: any) {
      console.error('Load inventory error:', error);
      setInventoryError(error.message || '재고 데이터를 불러오는데 실패했습니다.');
    } finally {
      setInventoryLoading(false);
    }
  }, [user]);

  // 재고조사 데이터 로드
  const loadInventoryCheck = useCallback(async () => {
    if (!user) return;

    setInventoryCheckLoading(true);
    setInventoryCheckError(null);

    try {
      const response = await fetch('/api/inventory-check');
      
      if (!response.ok) {
        throw new Error('재고조사 데이터를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setInventoryCheck(data.data || []);
    } catch (error: any) {
      console.error('Load inventory check error:', error);
      setInventoryCheckError(error.message || '재고조사 데이터를 불러오는데 실패했습니다.');
    } finally {
      setInventoryCheckLoading(false);
    }
  }, [user]);

  // 재고 데이터 새로고침
  const refreshInventory = useCallback(async () => {
    await loadInventory();
  }, [loadInventory]);

  // 재고조사 데이터 새로고침
  const refreshInventoryCheck = useCallback(async () => {
    await loadInventoryCheck();
  }, [loadInventoryCheck]);

  // 로그인 후 데이터 자동 로드
  useEffect(() => {
    if (user) {
      loadInventory();
      loadInventoryCheck();
    } else {
      // 로그아웃 시 데이터 초기화
      setInventory([]);
      setInventoryCheck([]);
    }
  }, [user, loadInventory, loadInventoryCheck]);

  const contextValue = useMemo(
    () => ({
      inventory,
      inventoryLoading,
      inventoryError,
      loadInventory,
      refreshInventory,
      inventoryCheck,
      inventoryCheckLoading,
      inventoryCheckError,
      loadInventoryCheck,
      refreshInventoryCheck,
    }),
    [
      inventory,
      inventoryLoading,
      inventoryError,
      loadInventory,
      refreshInventory,
      inventoryCheck,
      inventoryCheckLoading,
      inventoryCheckError,
      loadInventoryCheck,
      refreshInventoryCheck,
    ]
  );

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}

