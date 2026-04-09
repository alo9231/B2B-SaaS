'use client'

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PostStatus } from '@/types/post';


export default function AnalyticsPage(){
    const [posts, setPosts] = useState<PostStatus[]>([]);  

    useEffect(()=> {
        async function getStatsData() {
            const { data } = await supabase.from('posts').select('status');
            setPosts(data as PostStatus[]); // 'as'를 사용해 타입 단언해주기
        }
        getStatsData();
    },[]);

    
   
    // 💡 개수 계산 로직을 변수로 분리 (중복 방지 및 가독성)
    const activeCount = posts.filter(p => p.status === 'Active' || !p.status).length;
    const pendingCount = posts.filter(p => p.status === 'Pending').length;
    const closedCount = posts.filter(p => p.status === 'Closed').length;

    const chartData = [
        { name: '활성(Active)', value: activeCount, fill: '#10B981' },
        { name: '대기(Pending)', value: pendingCount, fill: '#FBBF24' },
        { name: '종료(Closed)', value: closedCount, fill: '#94A3B8' },
    ];

    return(
        <div className="space-y-6 sm:space-y-8">
            <h3 className="text-2xl font-bold text-slate-800">데이터 통계 분석</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 차트 영역 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold mb-4 text-gray-600">상태별 게시글 비율</h4>
                        
                        {/* ResponsiveContainer에 높이(h-[400px])를 가진 div가 필요함 */}
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData}
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                </div>

                {/* 요약 카드 영역  (전체/활성/대기/종료) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    {/* 전체 - 인디고 */}
                    <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-md sm:col-span-3 transition-transform hover:scale-[1.005]">
                        <p className="opacity-80 text-sm font-medium">전체 게시글 수</p>
                        <p className="text-4xl font-bold">{posts.length} <span className="text-xl font-normal opacity-70">개</span></p>
                    </div>
                    
                    {/* 활성 - 에메랄드 (Chart: #10B981) */}
                    <div className="bg-emerald-500 text-white p-6 rounded-2xl shadow-md transition-transform hover:scale-[1.01] md:col-span-3 lg:col-span-1">
                        <p className="opacity-80 text-sm font-medium">활성(Active)</p>
                        <p className="text-3xl font-bold">{activeCount} <span className="text-lg font-normal opacity-70">개</span></p>
                    </div>

                    {/* 대기 - 앰버 (Chart: #FBBF24) */}
                    <div className="bg-amber-400 text-white p-6 rounded-2xl shadow-md transition-transform hover:scale-[1.01] md:col-span-3 lg:col-span-1">
                        <p className="opacity-80 text-sm font-medium">대기(Pending)</p>
                        <p className="text-3xl font-bold">{pendingCount} <span className="text-lg font-normal opacity-70">개</span></p>
                    </div>

                    {/* 종료 - 슬레이트 (Chart: #94A3B8) */}
                    <div className="bg-slate-400 text-white p-6 rounded-2xl shadow-md transition-transform hover:scale-[1.01] md:col-span-3 lg:col-span-1">
                        <p className="opacity-80 text-sm font-medium">종료(Closed)</p>
                        <p className="text-3xl font-bold">{closedCount} <span className="text-lg font-normal opacity-70">개</span></p>
                    </div>


                    {/* 추가적인 통계 카드들 여기에 배치! */}
                </div>
            </div>
        
        </div>  
    )
}