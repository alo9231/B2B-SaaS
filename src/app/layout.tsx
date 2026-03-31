//전역 설정 (Provider, Toast, Wrapper)

import "./globals.css";
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
          <Toaster position="top-right" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}