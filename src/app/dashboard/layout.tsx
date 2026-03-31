// (사이드바+헤더 틀)
import Sidebar from '@/components/layout/Sidebar';
import Header from "@/components/layout/Header"; 


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar /> 
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 bg-gray-50 overflow-auto">
          {children} {/* page.tsx 내용*/}
        </main>
      </div>
    </div>
  );
}