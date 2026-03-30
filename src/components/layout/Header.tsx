'use client';

// ✅ 함수 createClient가 아니라, 이미 생성된 supabase 객체를 가져옴
import { supabase } from '@/lib/supabase';

export default function Header() {

  const handleLogout = async () => {
    console.log("로그아웃 실행 중...");

    //✅ 가져온 supabase 객체를 그대로 사용하여 로그아웃 실행
    const { error } = await supabase.auth.signOut();

    if(error) {
        console.log("로그아웃 오류: ", error.message);
        alert("로그아웃에 실패했습니다 😭");
        return;
    }

    // 로그아웃 성공 후 로그인 페이지로 강제 이동 및 상태 초기화
    // router.push('/login') 보다 확실하게 처리하기 위해 아래 방식을 권장(Next.js router 대신 브라우저 기본 기능 사용)
    window.location.href = '/login';
  };



  return (
       <header className="h-16 flex items-center justify-between px-6 border-b bg-white shrink-0">
          <h1 className="font-bold text-gray-800">관리자 시스템</h1>

          {/* 헤더 우측 유저 정보 */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              <strong className="text-gray-900">admin@test.com</strong>님
            </span>
            <button 
              onClick={handleLogout}
              className="text-xs font-bold text-gray-400 hover:text-red-500 border px-2 py-1 rounded"
            >
              로그아웃
            </button>
          </div>
        </header>
  );
}