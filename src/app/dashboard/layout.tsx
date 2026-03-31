// (사이드바+헤더 틀)
import Sidebar from '@/components/layout/Sidebar';
import Header from "@/components/layout/Header"; 


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* 왼쪽 사이드바 (고정) */}
      <Sidebar /> 

      {/* 오른쪽 콘텐츠 영역 (헤더 + 본문) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* 상단 헤더 (고정) */}
        <Header />

        {/* 실제 페이지 내용 (스크롤 가능 영역) */}
        <main className="flex-1 bg-gray-50 overflow-auto p-8 space-y-8">
          {children} {/* page.tsx 내용*/}
        </main>

      </div>
    </div>
  );
}