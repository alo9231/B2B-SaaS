import "./globals.css";
import type { Metadata } from "next";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { Toaster } from "react-hot-toast";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper"; // 새로 만들 컴포넌트

export const metadata: Metadata = {
  title: "비투비 어드민",
  description: "B2B Admin Project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ReactQueryProvider>
          {/* 주소를 확인해서 레이아웃을 결정하는 '클라이언트' 컴포넌트 */}
          <PageLayoutWrapper>
            {children}
          </PageLayoutWrapper>
          
          <Toaster position="top-right" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}