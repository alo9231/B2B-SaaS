import "./globals.css";
import type { Metadata } from "next";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";

export const metadata: Metadata = {
  title: "비투비",
  description: "B2B Admin Project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="ko">
      <body>
        {/* Provider로 감싸주어 useQuery 에러를 해결 */}
        <ReactQueryProvider>
             {children} {/* 여기에 내가 만든 page.tsx 내용이 들어감*/}
        </ReactQueryProvider>
     
      </body>
    </html>
  );
}