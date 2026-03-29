import PostsDetailModal from '@/components/dashboard/PostsDetailModal';

export default function DashboardPage() {
    return (
        <div className="relative w-full min-h-screen">
            {/* 1. 모달은 모든 내용물과 "동등한 층" 혹은 "맨 아래"에 둡니다. */}
            <header>...</header>
            <main>...</main>
            
            {/* 리스트를 감싸는 div 밖에 있어야 합니다! */}
            <PostsDetailModal /> 
        </div>
    );
}