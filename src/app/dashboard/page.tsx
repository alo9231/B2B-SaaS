'use client';

export default function DashboardPage(){
    return(
        <div>
            <header>
                <h2 className="text-3xl font-bold text-gray-800">Welcome Back! 👋</h2>
                <p className="text-gray-500">오늘 완료해야 할 업무가 5개 있습니다.</p>
            </header>

            {/* 통계 카드 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-400 font-medium">진행 중인 프로젝트</p>
                    <h3 className="text-2xl font-bold mt-1">12개</h3>
                </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-400 font-medium">이번 주 마감 태스크</p>
                    <h3 className="text-2xl font-bold mt-1 text-orange-500">8개</h3>
                </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-400 font-medium">완료된 업무</p>
                    <h3 className="text-2xl font-bold mt-1 text-green-500">128개</h3>
                </div>
            </div>

            {/* 칸반 보드로 가는 섹션 (예시) */}
            <section className="bg-blue-600 p-8 rounded-3xl text-white flex justify-between items-center shadow-xl shadow-blue-100">
                <div>
                    <h3 className="text-xl font-bold">지금 협업을 시작해보세요</h3>
                    <p className="opacity-80 mt-1">칸반 보드에서 팀원들과 업무를 공유하세요.</p>
                </div>
                <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                    칸반 보드 열기 
                </button>
            </section>



        </div>
    )
}