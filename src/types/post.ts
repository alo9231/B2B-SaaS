// 상태 타입만 따로 정의 (재사용을 위해)
export type PostStatus = 'Active' | 'Pending' | 'Closed' | (string & {}); //👈 이렇게 쓰면 자동 완성 목록에 저 3개가 뜨면서도 다른 문자열을 입력할 수 있음


// 전체 게시글 인터페이스
export interface Post {
  id: number;
  title: string;
  created_at: string;
  status?: 'Active' | 'Pending' | 'Closed';
  commentCount?: number; // 👈 DashboardPage에서 사용하므로 꼭 포함되어야 함
}