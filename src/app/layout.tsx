import "./globals.css";
import type { Metadata } from "next";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import Sidebar from '@/components/layout/Sidebar';
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "비투비 어드민",
  description: "B2B Admin Project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="flex"> {/* flex를 주어 사이드바와 콘텐츠를 나란히 배치 */}
        <ReactQueryProvider>
          {/* 사이드바 배치 */}
          <Sidebar /> 
          
          {/* 메인 콘텐츠 영역 */}
          <main className="flex-1 bg-gray-50 min-h-screen overflow-auto">
            {children}
          </main>

          {/* 알림 토스트를 위해 최상단에 배치 */}
          <Toaster position="top-right" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}