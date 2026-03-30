'use client';

import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 중복되는 div, header, sidebar 싹 다 제거!
  return <>{children}</>;
}