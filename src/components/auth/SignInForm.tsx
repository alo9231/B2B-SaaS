'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form"; 
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';


const signInSchema = z.object({
    email: z.string().email({ message: "올바른 이메일 형식이 아닙니다."}),
    password: z.string().min(8, {message: "비밀번호는 최소 8자 이상이어야 합니다."}),
});

type signInValues = z.infer<typeof signInSchema>;


export default function SignInForm(){
    // 라우터 사용 선언
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState : {errors, isSubmitting},        
    } = useForm<signInValues>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: signInValues) => {
   
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if(error) {
            alert(`로그인 실패 😢: ${error.message}`);
            return;
        }

        // 로그인 성공 시 대시보드로 이동!
        router.push('/dashboard');
        router.refresh(); // 세션 정보를 갱신하기 위해 필요함
    };

    return(
        <form 
            onSubmit={handleSubmit(onSubmit)} 
            className="flex flex-col gap-4 w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg"
        >
            <h2 className="text-2xl font-bold mb-4">TaskFlow 로그인</h2>

            {/* 이메일 입력 */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">이메일</label>
                <input 
                    type="email" // email 타입으로 권장
                    {...register('email')}
                    className={`border p-2 rounded-md outline-none transition-all  ${errors.email ? 'border-red-500' : 'focus:border-blue-500'}`}
                    placeholder="example@taskflow.com"                
                />            
                {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}    
            </div>

            {/* 비밀번호 입력 */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">비밀번호</label>
                <input 
                    type="password" // password 타입 필수
                    {...register('password')} 
                    className={`border p-2 rounded-md outline-none transition-all ${errors.password ? 'border-red-500' : 'focus:border-blue-500'}`}
                />
                {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}                     
            </div>

            <button type="submit"
                    disabled={isSubmitting}
                    className="mt-4 bg-blue-600 text-white p-3 rounded-md font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
                {isSubmitting ? '가입 중...' : '계정 생성😄'}
            </button>

        </form>

    )
}