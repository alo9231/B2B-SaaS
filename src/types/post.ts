// 상태 타입만 따로 정의 (재사용을 위해)
export interface PostStatus {
  status: 'Active' | 'Pending' | 'Closed';
}

// 전체 게시글 인터페이스
export interface Post {
  id: number;
  title: string;
  created_at: string;
  status?: 'Active' | 'Pending' | 'Closed';
  commentCount?: number; // 👈 DashboardPage에서 사용하므로 꼭 포함되어야 함
}