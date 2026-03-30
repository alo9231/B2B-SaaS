'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 1. 포털 추가
import { supabase } from '@/lib/supabase';
import useModalStore from '@/store/useModalStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function PostsDetailModal() {
    const [mounted, setMounted] = useState(false); // 2. 마운트 상태 관리
    const [commentInput, setCommentInput] = useState('');
    const selectedPostId = useModalStore((state) => state.selectedPostId);
    const closeModal = useModalStore((state) => state.closeModal);
    const queryClient = useQueryClient();

    // 하이드레이션 오류 방지를 위한 useEffect
    useEffect(() => {
        setMounted(true);
    }, []);

   // 1. 게시글 상세 (로딩 상태를 isLoadingPost로 정의)
    const { data: postsDetail, isLoading: isLoadingPost, isError } = useQuery({
        queryKey: ['posts', selectedPostId],
        queryFn: async () => {
            if (!selectedPostId) return null;
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('id', Number(selectedPostId))
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!selectedPostId,
    });

    // 2. 댓글 리스트 (로딩 상태를 isLoadingComments로 정의)
    const { data: commentsList, isLoading: isLoadingComments } = useQuery({
        queryKey: ['comments', selectedPostId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('posts_id', selectedPostId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!selectedPostId,
    });

    const isLoading = isLoadingPost || isLoadingComments;
    

    // 2. 댓글 등록 기능
    const { mutate: addComment, isPending } = useMutation({
        mutationFn: async () => {
            const targetId = postsDetail?.id;

            // 💡 현재 로그인한 유저의 정보(이메일 포함) 가져오기
            const { data: { user } } = await supabase.auth.getUser();

            if (!targetId) throw new Error("게시글 정보를 불러오는 중입니다.");
            if (!user) throw new Error("로그인이 필요합니다.");


            const { data, error } = await supabase
                .from('comments')
                .insert([{ 
                    posts_id: targetId,
                    content: commentInput,
                    user_email: user.email, // 💡 방금 만든 컬럼에 이메일 저장!
                }])
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            setCommentInput(''); 
            // 💡 게시물 전체가 아닌 '댓글 목록'만 새로고침
            queryClient.invalidateQueries({ queryKey: ['comments', selectedPostId] });
           // alert('댓글이 등록되었습니다! 🎉');
        },
        onError: (error: any) => {
            alert(`에러 발생: ${error.message}`);
        }
    });

    // 댓글 삭제 기능
    const { mutate: deleteComment } = useMutation({
        mutationFn: async (commentId: number) => {
            console.log("삭제 시도 중인 ID:", commentId); // 💡 여기서 ID가 찍히는지 확인!

            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId)
                .select(); // 💡 삭제된 데이터를 다시 반환
            if (error) {
            console.error("Supabase 삭제 에러 상세:", error); // 💡 에러 내용 확인
            throw error;
         
        }
        },
        onSuccess: () => {
            // 댓글 입력창 비우기
            setCommentInput(''); 
            
            // 💡 게시글 전체가 아니라 '댓글 목록'만 정밀 타격해서 새로고침!
            queryClient.invalidateQueries({ queryKey: ['comments', selectedPostId] });
            
            //alert('댓글이 등록되었습니다! 🎉');
        },
        onError: (error: any) => {
            alert(`삭제 실패: ${error.message}`);
        }
    });

    // 상태별 스타일 맵핑 객체 추가
    const statusStyles: { [key: string]: string } = {
        Pending: 'rounded-md bg-amber-50 text-amber-600 border-amber-200',  // 대기 (주황)
        Active: 'rounded-md  bg-green-100 text-green-700 border-green-200', // 활성 (초록)
        Closed: 'rounded-md bg-gray-50 text-gray-400 border-gray-200',       // 종료 (회색)
    };

    // 상태별 한글 이름 맵핑 객체 
    const statusNames: { [key: string]: string } = {
        Pending: '대기',
        Active: '활성',
        Closed: '종료',
    };

    // 마운트 전이거나 선택된 ID가 없으면 아무것도 렌더링하지 않음
    if (!mounted || !selectedPostId) return null;

    // 3. createPortal을 사용하여 body 태그에 직접 렌더링
    return createPortal(
        <div 
            className="fixed inset-0 w-screen h-screen bg-black/70 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm" 
            onClick={closeModal}
        >
            {/* 모달 안쪽 클릭 시 닫힘 방지 */}
            <div 
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] relative z-[10000]" 
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* 헤더 */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800">
                        {/* 게시글 로딩 상태에 따라 제목 표시 */}
                        {isLoadingPost ? (
                            <span className="text-gray-400">로딩 중...</span>
                        ) : (
                            <>
                                {postsDetail?.title || '상세 보기'}
                                {/* 💡 댓글이 있을 때만 개수 표시 (예: (3)) */}
                                {!isLoadingComments && commentsList && commentsList.length > 0 && (
                                    <span className="text-lg font-medium text-indigo-500">
                                        ({commentsList.length})
                                    </span>
                                )}
                            </>
                        )}
                    </h2>
                    <button onClick={closeModal} className="text-2xl text-gray-400 hover:text-gray-600 transition-colors">&times;</button>
                </div>

                {/* 본문 및 댓글 리스트 */}
                <div className="p-8 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="text-center py-20 text-gray-400">데이터를 가져오는 중입니다...</div>
                    ) : isError || !postsDetail ? (
                        <div className="text-center py-20 text-red-400">
                            게시글(ID: {selectedPostId})을 찾을 수 없습니다.
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border mb-3 inline-block shadow-sm ${statusStyles[postsDetail.status] || statusStyles['Closed']}`}>
                                    {statusNames[postsDetail.status] || postsDetail.status}
                                </span>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">{postsDetail.content}</p>
                            </div>
                            
                            <div className="border-t pt-8">
                                <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
                                    💬 댓글 <span className="text-blue-600">{commentsList?.length || 0}</span>
                                </h3>
                                <div className="space-y-4 mb-6">
                                    {commentsList?.map((c: any) => ( // commentsList는 쿼리에서 이미 정렬해왔으므로 .sort() 생략 가능
                                        <div key={c.id}
                                            className="group bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden transition-all hover:bg-white hover:border-blue-100"
                                        >
                                        {/* 💡 이름표 추가 */}
                                        <span className="text-[11px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                                            {/* 데이터가 오기 전엔 '작성자'라고 보여주다가, 오면 이메일로 교체 */}
                                            {(c.user_email || '작성자').split('@')[0]} 님
                                        </span>
                                        <p className="text-gray-700 text-sm pr-10 leading-relaxed">{c.content}</p> {/* 버튼과 겹치지 않게 pr-8 추가 */}
                                        <span className="text-[10px] text-gray-400 mt-2 block">
                                            {new Date(c.created_at).toLocaleString()}
                                        </span>
                                        
                                        {/* 💡 휴지통 버튼 수정 */}
                                        <button 
                                            type="button" // 폼 전송 방지
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation(); // 1. 부모 클릭 이벤트 전파 차단
                                                if (window.confirm('이 댓글을 정말 삭제할까요?')) {
                                                    deleteComment(c.id); // 2. 삭제 함수 호출
                                                }
                                            }}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1 z-[10]" 
                                            title="삭제"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                  {(!commentsList || commentsList.length === 0) && (
                                        <div className="text-center py-10 text-gray-300 italic">첫 댓글의 주인공이 되어보세요!</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* 댓글 입력 영역 */}
                <div className="p-6 border-t bg-gray-50">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isPending && commentInput && addComment()}
                            placeholder={postsDetail ? "따뜻한 댓글을 남겨주세요..." : "게시글 로딩 중..."}
                            disabled={!postsDetail || isPending}
                            className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all bg-white disabled:bg-gray-100"
                        />
                        <button 
                            onClick={() => addComment()}
                            disabled={!commentInput || isPending || !postsDetail}
                            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:bg-gray-300 transition-all shadow-md active:scale-95"
                        >
                            {isPending ? '등록 중' : '등록'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body // 4. 렌더링 타겟을 body로 고정
    );
}