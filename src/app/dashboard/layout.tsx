// src/app/dashboard/layout.tsx
'use client'

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ⬅️ 여기가 공통 사이드바 (거실) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 text-indigo-400 italic font-mono">B2B Admin</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className={`w-full p-3 rounded block transition ${pathname === '/dashboard' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>
            대시보드
          </Link>
          <Link href="/dashboard/analytics" className={`w-full p-3 rounded block transition ${pathname === '/dashboard/analytics' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>
            통계 분석
          </Link>
        </nav>
      </aside>

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