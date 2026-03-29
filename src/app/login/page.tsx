'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage(){

    const [email, setMail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {

        e.preventDefault()
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if(error) {
            alert("로그인 실패 😭 : " + error.message)
        }else{
            router.push('/') // 로그인 성공 시 메인 대시보드로 이동
        }
    }


    return(
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-800">B2B Admin</h2>
                    <p className="text-slate-500 mt-2">관리자 계정으로 로그인하세요</p>
                </div>
                   <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">이메일</label>
                    <input type="text" 
                           value={email}
                           onChange={(e) => setMail(e.target.value)}
                           className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-black"
                           placeholder='admin@test.com 입력해주세요'
                           required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">비밀번호</label>
                    <input type="password" 
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-black"
                         placeholder="admin 입력해주세요"
                         required
                    />
                </div>
                <button type='submit'
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >로그인</button>
            </form>
            </div>
         </div>
    )

}