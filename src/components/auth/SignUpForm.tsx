'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from "react";
import gsap from 'gsap';
import { useForm } from "react-hook-form"; 
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';


// 검증 스키마 정의 (Zod)
const signUpSchema = z.object({
    email: z.string().email({ message: "올바른 이메일 형식이 아닙니다."}),
    password: z.string().min(8, {message: "비밀번호는 최소 8자 이상이어야 합니다."}),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
});

type SignUpValues = z.infer<typeof signUpSchema>;


export default function SignUpForm(){
    // 폼 전체를 잡기 위한 ref 생성
    const formRef = useRef <HTMLFormElement>(null);

    // 라우터 사용 선언
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState : {errors, isSubmitting},        
    } = useForm<SignUpValues>({
        resolver: zodResolver(signUpSchema),
        mode:'onChange', // 실시간 검증 활성화
    });

    // 에러 발생할 때마다 실행되는 애니메이션
    useEffect(()=>{
        if(Object.keys(errors).length > 0){
            //폼 전체를 좌우로 10px씩 3번 흔들고(repeat) 제자리로 돌아옴(yoyo)
            gsap.to(formRef.current, {
                x: 10,
                duration: 0.05,
                repeat: 5,
                yoyo: true,
                clearProps: "x" // 애니메이션 종료 후 위치값 초기화
            })
        }
    }, [errors]);

    const onSubmit = async (data: SignUpValues) => {
        //여기서 Supabase Auth와 연동
        const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                // 가입 완료 후 돌아올 주소 (Vercel 주소나 localhost)
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            }
        })

        if(error) {
            alert(`회원가입 에러 🥺: ${error.message}`);
            return;
        } 

        if(authData.user){
            alert("회원가입 성공! 이메일을 확인해주세요 😄");
            // 가입 성공 후 대시보드로 이동
            router.push('/login');
        }
    };

    return(
        <form 
            // ref={formRef} 필수!
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)} 
            className="flex flex-col gap-4 w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg"
        >
            <h2 className="text-2xl font-bold mb-4">TaskFlow 시작하기</h2>

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

            {/* 비밀번호 확인 입력 */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">비밀번호 확인</label>
                <input type="password" // password 타입 필수
                        {...register('confirmPassword')}
                        className={`border p-2 rounded-md outline-none transition-all  ${errors.confirmPassword ? 'border-red-500' : 'focus:border-blue-500'}`}
                />  
                {errors.confirmPassword && <span className="text-xs text-red-500">${errors.confirmPassword.message}</span>}              
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