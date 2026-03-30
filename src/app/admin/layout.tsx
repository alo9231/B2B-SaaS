// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import Sidebar from '@/components/layout/Sidebar';
import Header from "@/components/layout/Header";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "비투비 어드민",
  description: "B2B Admin Project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="flex h-screen w-full overflow-hidden"> {/* 전체 flex */}
        <ReactQueryProvider>
          {/* 1. 사이드바 (왼쪽 고정) */}
          <Sidebar /> 
          
          {/* 2. 오른쪽 영역 (헤더 + 콘텐츠 수직 배치) */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header /> {/* 상단 헤더 */}
            
            <main className="flex-1 bg-gray-50 overflow-auto p-6">
              {children} {/* 여기에 dashboard 페이지 내용이 들어옴 */}
            </main>
          </div>

          <Toaster position="top-right" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}