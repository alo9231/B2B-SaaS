'use client';

import { useEffect, useRef } from "react";
import gsap from 'gsap';
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardLayoit({ children } : { children : React.ReactNode}) {
    const sidebarRef = useRef(null);
    const contentRef = useRef(null);
    const router = useRouter(); 

    useEffect( () => {
        // GSAP로 입구 애니메이션 구현 (사이드바는 왼쪽에서, 콘텐츠는 아래에서)
        const tl = gsap.timeline();
        tl.formTo(
                sidebarRef.current, 
                { x: -100, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
            )
            .fromTo(
                contentRef.current, 
                { y: 20, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.5 }, "-=0.3"
        );
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return(
        <div className="flex h-screen bg-gray-50">
            {/* 사이드바 */}
            <aside ref={sidebarRef} className="w-64 bg-white border-r border-gray-200 flex flex-col p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-blue-600 mb-10">TaskFlow</h2>
                <nav className="flex-1 space-y-2">
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-lg font-medium cursor-pointer">📊 Dashboard</div>
                    <div className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">📅 My Tasks</div>
                    <div className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">👥 Members</div>
                </nav>
                <button onClick={handleLogout}
                        className="mt-auto p-3 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors text-left"
                >Logout</button>
            </aside>

            {/* 메인 콘텐츠 영역 */}
            <main ref={contentRef} className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}
