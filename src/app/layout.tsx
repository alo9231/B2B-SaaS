import type { Metadata } from "next";
import "./globals.css";  // CSS 파일이 src/app 안에 있음

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
        {children} {/* 여기에 내가 만든 page.tsx 내용이 들어감*/}
      </body>
    </html>
  );
}