'use client'

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, LayoutGrid, BarChart3, Columns3 } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 1024px 반응형 로직
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsCollapsed(true);
      else setIsCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <aside className={`bg-slate-900 text-white transition-all duration-500 ease-in-out flex flex-col shrink-0  relative ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* 토글 버튼 */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex justify-center p-4 bg-indigo-600  p-2 border-4 border-[#111827] z-50 hover:scale-110 active:scale-95 transition-all shadow-lg group"
      >
        {isCollapsed ? (
          <Menu size={16} className="text-white group-hover:rotate-180 transition-transform duration-300" />
        ) : (
          <X size={16} className="text-white group-hover:rotate-90 transition-transform duration-300" />
        )}
      </button>

      {/* 로고 */} 
      <div className="mt-5 p-6 h-16 flex items-center border-b border-slate-800">
        {!isCollapsed ? (
          <span className="text-xl font-bold text-indigo-400 italic font-mono transition-opacity">B2B Admin</span>
        ) : (
          <span className=" text-xl font-bold text-indigo-400 mx-auto">B</span>
        )}
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 p-4 space-y-2">
        <MenuLink href="/dashboard" icon={<LayoutGrid size={20} />} label="대시보드" isCollapsed={isCollapsed} active={pathname === '/dashboard'} />
        <MenuLink href="/dashboard/analytics" icon={<BarChart3 size={20} />} label="통계 분석" isCollapsed={isCollapsed} active={pathname === '/dashboard/analytics'} />
        <MenuLink href="/dashboard/kanban" icon={<Columns3 size={20} />} label="할일 목록" isCollapsed={isCollapsed} active={pathname === '/dashboard/kanban'} />
      </nav>
    </aside>
  );
}

// 내부 링크 컴포넌트 (반복 줄이기)
function MenuLink({ href, icon, label, isCollapsed, active }: any) {
  return (
    <Link href={href} className={`flex items-center gap-4 p-3 rounded-lg transition-all ${active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
      <div className="shrink-0">{icon}</div>
      {!isCollapsed && <span className="whitespace-nowrap overflow-hidden text-sm font-medium">{label}</span>}
    </Link>
  );
}