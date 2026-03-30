'use client';

export default function Header() {
  const handleLogout = () => {
    console.log("로그아웃 실행");
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