
'use client';

import { useState } from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/task';
import { toast } from 'react-hot-toast';

// ✅ 개별 카드 컴포넌트
export function SortTableTaskCard({ task, onDelete, onUpdate }: { 
    task: Task, 
    onDelete: (id: number) => void,
    onUpdate: (id: number, newContent: string) => void // ✅ 업데이트 함수 추가 
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(task.content);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
        id: task.id,
        disabled: isEditing // ✅ 수정 중에는 드래그 기능을 잠시 끄기 (텍스트 선택을 위해)
    });

    const handleUpdate = () => {
        if (!editContent.trim()) { // 공백만 있거나 비어있으면
            toast.error("내용을 입력해주세요!");
            return;
        }
        // ❌ updateTask({ id, content }) 가 아니라
        // ✅ Props로 받은 onUpdate를 사용해야 함
        onUpdate(task.id, editContent);
        setIsEditing(false);
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}
            className={`group relative p-5 rounded-2xl shadow-sm border transition-all cursor-grab active:cursor-grabbing ${
                isDragging ? 'bg-indigo-50 border-indigo-300 scale-105 rotate-1 z-50' : 'bg-white border-gray-100 hover:border-indigo-100 shadow-sm'
            }`}
        >
            {/* ➡️ 상단 영역: ID와 기능 버튼들 (수정, 삭제) */}
            <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md">#{task.id}</span>
            
            <div className="flex items-center gap-1">
                {/* 연필(수정) 버튼 */}
                <button 
                onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
                className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                title="수정"
                >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
                </button>

                {/* 휴지통(삭제) 버튼 */}
                {!isEditing && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="삭제"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                </button>
                )}
            </div>
            </div>

            {/* ➡️ 본문 영역: 수정 모드일 때와 아닐 때 */}
            <div className="min-h-[48px] flex items-center"> {/* 최소 높이를 주어 정렬 유지 */}
            {isEditing ? (
                <div className="w-full space-y-3">
                <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    // ✅ 엔터 누르면 저장, ESC 누르면 취소하는 로직
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { // Shift+Enter는 줄바꿈
                            e.preventDefault();
                            handleUpdate();
                        }
                        if (e.key === 'Escape') {
                            setIsEditing(false);
                        }
                    }}
                    className="w-full p-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed"
                    rows={2}
                    autoFocus
                />
                <div className="flex gap-2 justify-end">
                    <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-md transition-colors">취소</button>
                    <button onClick={handleUpdate} className="px-3 py-1 text-xs bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition-colors shadow-sm">저장</button>
                </div>
                </div>
            ) : (
                <p className="text-gray-700 font-medium break-all leading-relaxed w-full">
                    {task.content}
                </p>
            )}
            </div>
        </div>
        );

}
