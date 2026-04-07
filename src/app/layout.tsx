//전역 설정 (Provider, Toast, Wrapper)

import "@/styles/globals.css";
import type { Metadata } from "next";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "비투비 어드민",
  description: "B2B Admin Project",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ReactQueryProvider>
          {children} {/* Wrapper 삭제 */}
          <Toaster
            position="top-right" // 우측 상단 고정 (대시보드 표준)
            reverseOrder={false}
            toastOptions={{
              // 모든 토스트에 적용되는 기본 스타일
              duration: 3000, // 3초간 노출
              style: {
                background: '#333',
                color: '#fff', // 
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '12px',
                padding: '12px 18px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },

              // 성공 시 스타일 (초록색 계열)
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981', // Emerald 500
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid #d1fae5',
                },
              },

              // 에러 시 스타일 (빨간색 계열)
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444', // Red 500
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid #fee2e2',
                },
              },
            }}
          />
        </ReactQueryProvider>
      </body>
    </html>
  );
}