import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {

    let response = NextResponse.next({
        request : {
            headers: request.headers,
        }
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({ name, value, ...options})
                },
                remove(name : string, options: CookieOptions) {
                    request.cookies.set({name, value : '', ...options})
                    response = NextResponse.next({
                        request : {
                            headers: request.headers,
                        }
                    })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    const { data : { user } } = await supabase.auth.getUser();

    // 로그인 안 된 상태로 대시보드 접근 시 로그인 페이지로 리다이렉트
    if(!user && request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return response;
}

export const config = {
    matcher: [
    /*
     * 아래 경로를 제외한 모든 요청에 미들웨어 적용:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}