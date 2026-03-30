// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // 메인 주소로 오면 바로 대시보드로 보냄
  redirect('/dashboard'); 
}