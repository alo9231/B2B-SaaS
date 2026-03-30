'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndContext, closestCorners, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Toaster, toast } from 'react-hot-toast';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 타입 정의 (에러 방지)
interface Task {
    id: number;
    content: string;
    status: 'todo' | 'doing' | 'done';
}

// ✅ 개별 카드 컴포넌트
function SortTableTaskCard({ task, onDelete, onUpdate }: { 
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

                {/* 휴지통(삭제) 버튼 - 이제 상단에 같이 배치해서 정렬을 맞춥니다 */}
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

// ✅ 메인 페이지 컴포넌트
export default function KanbanPage () { // 컴포넌트 첫 글자는 대문자여야 함!!!
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'todo' | 'doing' | 'done'>('todo');
    const [filter, setFilter] = useState<'all' | 'todo' | 'doing' | 'done'>('all');
    const queryClient = useQueryClient();

    // ✅ 센서 설정 (클릭 이벤트와 드래그가 겹치지 않게 방지)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 3 }, // 3px 이상 움직여야 드래그 시작
        })
    );

    // 데이터 불러오기
    const { data: tasks= [] } = useQuery<Task[]>({
        queryKey: ['tasks'],
        queryFn: async () => {
            const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('task_order', {ascending: true});
            
            if (error) throw error;
            return data as Task[];
        }
    })

    // 할 일 등록 로직
    const { mutate: addTask } = useMutation({
        mutationFn: async () => {
            const { data: {user} } = await supabase.auth.getUser();
            const { error } = await supabase.from('tasks').insert([
                { content, status, user_email: user?.email }
            ]);
            if (error) throw error;
        },
        onSuccess: () => {
            setContent('');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });

    // 삭제 로직
    const { mutate: deleteTask } = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase.from('tasks').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('할 일이 삭제되었습니다.', {
                icon: '🗑️',
                style: { borderRadius: '12px', background: '#333', color: '#fff' }
            });
        }
    });

    // 수정 로직 
    const { mutate: updateTask } = useMutation({
        mutationFn: async ({ id, content }: { id: number; content: string }) => {
            const { error } = await supabase
                .from('tasks')
                .update({ content })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('내용이 수정되었습니다!', {
                icon: '📝',
                style: { borderRadius: '12px', background: '#333', color: '#fff' }
            });
        }
    });

    // ✅ 드래그 종료 핸들러
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as number;
        const overId = over.id;

        const activeTask = tasks.find((t) => t.id === activeId);
        if (!activeTask) return;

        // 1. 새로운 상태 결정
        let newStatus: Task['status'];

        //  overId가 컬럼명 그 자체인 경우 (빈 컬럼으로 던졌을 때)
        if (['todo', 'doing', 'done'].includes(overId as string)) {
            newStatus = overId as Task['status'];
        } else {
            // 2. 다른 카드 위로 던졌을 때
            const overTask = tasks.find((t) => t.id === overId);
            newStatus = overTask ? overTask.status : activeTask.status;
        }

        // 2. 위치 및 상태 업데이트 로직
        if (activeId !== overId || activeTask.status !== newStatus) {
            const oldIndex = tasks.findIndex((t) => t.id === activeId);
            let newIndex = tasks.findIndex((t) => t.id === overId);

            if (newIndex === -1) newIndex = oldIndex; 

            let updatedTasks = arrayMove(tasks, oldIndex, newIndex);
            updatedTasks = updatedTasks.map(t => 
                t.id === activeId ? { ...t, status: newStatus } : t
            );

            // 즉시 업데이트 (화면에 즉시 반영)
            queryClient.setQueryData(['tasks'], updatedTasks);

            // ✅ [핵심] 공통 토스트 띄우기
            const statusText = newStatus === 'todo' ? '예정' : newStatus === 'doing' ? '진행 중' : '완료';
            
            if (activeTask.status !== newStatus) {
                // 상태가 변경되었을 때 (컬럼 이동)
                toast.success(`'${activeTask.content}' -> [${statusText}]`, {
                    icon: '🚀', // 이동할 때는 로켓 아이콘!
                });
            } else if (activeId !== overId) {
                // 같은 컬럼 내에서 순서만 바뀌었을 때
                toast.success('순서가 변경되었습니다.', {
                    duration: 1000, // ✅ 이 토스트만 특별히 1초!
                    icon: '🔃', // 순서 변경 아이콘
                });
            }

            // 3. Supabase 실제 데이터 업데이트
            const { error } = await supabase
                .from('tasks')
                .update({ status: newStatus })
                .eq('id', activeId);

            if (error) {
                toast.error('저장에 실패했습니다.');
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
            }
        }
    };

    // 필터링 로직
    const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

    return(
        // ✅ DndContext로 전체를 감싸주기
        <DndContext 
            sensors={sensors}
            collisionDetection={closestCorners} 
            onDragEnd={handleDragEnd}
        >   
            <div className="p-8 space-y-8">
                {/* 등록 및 필터 영역 */}
                <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-sm font-bold text-gray-500 ml-1">새로운 할 일</label>
                        <input  type="text" 
                                value={content}
                                onChange={(e)=> setContent(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="무엇을 해야 하나요?"
                        />
                    </div>

                    <div className="w-full md:w-40 space-y-2">
                        <label className="text-sm font-bold text-gray-500 ml-1">초기상태</label>
                        <select value={status} 
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full p-3 rounded-xl border border-gray-200 outline-none cursor-pointer"
                        >
                            <option value="todo">예정</option>
                            <option value="doing">진행 중</option>
                            <option value="done">완료</option>
                        </select>
                    </div>
                    <button onClick={() => addTask()}
                            className="w-full md:w-24 p-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md active:scale-95 transition-all"
                    >등록
                    </button>

                    {/* 필터 셀렉트박스 */}
                    <div className="w-full md:w-40 space-y-2 border-l pl-4 ml-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            보기 필터
                        </label>
                        <select value={filter} onChange={(e) => setFilter(e.target.value as any)}
                                className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none text-indigo-600 font-bold"
                        >
                            <option value="all">전체 보기</option>
                            <option value="todo">예정만</option>
                            <option value="doing">진행중만</option>
                            <option value="done">완료만</option>
                        </select>
                    </div>
                </div>

                {/* 칸반 보드 리스트 (필터 적용) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['todo', 'doing', 'done'].map((col)=>(
                        // 필터가 'all'이거나 현재 컬럼과 필터가 같을 때만 표시
                        (filter === 'all' || filter === col) && (
                            <div key={col} className="bg-gray-50/50 rounded-3xl p-5 border border-dashed border-gray-200 min-h-[500px]">
                                <h3 className="text-lg font-black text-gray-400 mb-4 px-2 uppercase tracking-widest">{col}</h3>
                                
                               {/* ✅ id={col} 을 추가해서 컬럼 자체를 드롭 영역으로 만듦 */}
                                <SortableContext 
                                    id={col} // 컬럼 ID
                                    items={tasks.filter(t => t.status === col).map(t => t.id)} // id 배열만 추출
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-4 min-h-[100px]"> {/* ✅ 빈 칸이어도 잡히게 최소 높이 추가 */}
                                        {filteredTasks.filter(t => t.status === col).map((task) => 
                                        
                                            <SortTableTaskCard 
                                                key={task.id} 
                                                task={task} 
                                                onDelete={(id) => {
                                                    if(confirm('정말 삭제하시겠습니까?')) deleteTask(id);
                                                }}
                                                onUpdate={(id, content) => updateTask({ id, content })}
                                            />
                                        )}
                                    </div>
                                </SortableContext> 
                            </div>
                        )
                    ))}
                </div>
            </div>
        </DndContext>
    );
}