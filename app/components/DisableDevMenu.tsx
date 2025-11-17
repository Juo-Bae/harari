'use client';

import { useEffect } from 'react';

export default function DisableDevMenu() {
  useEffect(() => {
    // 개발 모드 메뉴 비활성화
    const disableContextMenu = (e: MouseEvent) => {
      // Next.js 개발 모드 메뉴만 차단
      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        // 개발자 도구 단축키는 허용
        return;
      }
      
      // 특정 요소에서 우클릭 메뉴 차단
      const target = e.target as HTMLElement;
      if (target?.closest('[data-nextjs-dialog]')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // 개발 모드 오버레이 제거
    const removeOverlays = () => {
      const overlays = document.querySelectorAll(
        '[data-nextjs-dialog], [data-nextjs-dialog-overlay], [data-nextjs-toast], #devtools-indicator, .nextjs-toast'
      );
      overlays.forEach((overlay) => {
        const element = overlay as HTMLElement;
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.opacity = '0';
      });
    };

    document.addEventListener('contextmenu', disableContextMenu);
    
    // 주기적으로 오버레이 제거
    const interval = setInterval(removeOverlays, 100);
    
    // 초기 실행
    removeOverlays();

    return () => {
      document.removeEventListener('contextmenu', disableContextMenu);
      clearInterval(interval);
    };
  }, []);

  return null;
}

