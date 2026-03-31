'use client';

import { usePathname } from 'next/navigation';

export default function PageLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 로그인 페이지일 때는 그냥 출력, 그 외(대시보드 등)일 때만 배경색 등을 지정
  const isLoginPage = pathname === '/login';

  // 1. 로그인 페이지일 때: 사이드바/헤더 없이 알맹이만
  if (isLoginPage) {
    return <main className="h-screen w-full">{children}</main>;
  }

  // 2. 관리자 페이지일 때: 사이드바 + 헤더 포함된 정석 구조
  return (
    <div className="flex h-screen w-full overflow-hidden">
     
      <div className="flex-1 flex flex-col min-w-0">       
        {/* 스크롤이 생겨야 하는 핵심 영역입니다.
          flex-1: 남은 높이를 다 차지하게 함
          overflow-y-auto: 내용이 길어지면 세로 스크롤 생성
        */}
        <main className="flex-1 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}