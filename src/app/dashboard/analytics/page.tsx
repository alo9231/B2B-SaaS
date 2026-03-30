'use client'

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PostStatus {
  status: 'Active' | 'Pending' | 'Closed' | string;
}

export default function AnalyticsPage(){
    const [posts, setPosts] = useState<PostStatus[]>([]);  

    useEffect(()=> {
        async function getStatsData() {
            const { data } = await supabase.from('posts').select('status');
            setPosts(data as PostStatus[]); // 'as'를 사용해 타입 단언해주기
        }
        getStatsData();
    },[]);

    // 차트 데이터 가공
    const chartData = [
        { name: '활성(Active)', value: posts.filter(p => p.status === 'Active' || !p.status).length, fill: '#10B981' },
        { name: '대기(Pending)', value: posts.filter(p => p.status === 'Pending').length, fill: '#FBBF24' },
        { name: '종료(Closed)', value: posts.filter(p => p.status === 'Closed').length, fill: '#94A3B8' },
    ];

    return(
        <div className="p-8 space-y-8">
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

                {/* 요약 카드 영역 */}
                <div className="space-y-4">
                    <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-md">
                        <p className="opacity-80">전체 게시글 수</p>
                        <p className="text-4xl font-bold">{posts.length}개</p>
                    </div>
                    {/* 추가적인 통계 카드들 여기에 배치! */}
                </div>
            </div>
        
        </div>  
    )
}