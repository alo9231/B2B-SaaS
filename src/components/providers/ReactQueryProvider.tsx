'use client';

//(React Query, Recoil, Redux 등)의 설정을 담은 컴포넌트들

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // 컴포넌트 내부에서 QueryClient를 생성해야 안전
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}