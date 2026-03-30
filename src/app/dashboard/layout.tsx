// src/app/dashboard/layout.tsx
'use client'

import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 사이드바 상태 관리
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 1024px(lg) 기준으로 자동 접힘 로직
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    handleResize(); // 초기 로드 시 실행
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ✅ 공통 토스트 */}
      <Toaster 
        position="top-center" // ✅ 최상단 가운데
        toastOptions={{
          duration: 1500, // 지속시간
          style: {
            borderRadius: '99px', // ✅ 아주 둥근 모양 (알약 형태)
            background: '#333',   // 배경색
            color: '#fff',        // 글자색
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            icon: '😊', // ✅ 웃는 이모지 고정
            // 만약 체크 아이콘을 쓰고 싶다면 icon: '✅' 로 변경 가능
          },
        }}
      />
      {/* ⬅️  공통 사이드바 (거실) : isCollapsed 상태에 따라 너비가 변함 */}
      
      {/* ➡️ 여기가 내용이 바뀌는 곳 (안방/건너방) */}
      <div className="flex-1 flex flex-col overflow-hidden">

        <header className="h-16 bg-white border-b flex items-center px-8">
           <h1 className="font-semibold text-gray-700">관리자 시스템</h1>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children} {/* 여기에 dashboard/page.tsx나 analytics/page.tsx 내용이 들어옴! */}

        </main>
      </div>
    </div>
  );
}