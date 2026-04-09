'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndContext, closestCorners, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { toast } from 'react-hot-toast';
import { SortTableTaskCard } from "@/components/kanban/TaskCard";
import { Task } from "@/types/task";

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
            toast.success("새로운 할 일이 등록되었습니다."); // ✅ 성공 토스트
        }
    });

    // ✅ 실제 버튼이 클릭될 때 실행되는 함수
    const handleAddTask = () => {
        if (!content.trim()) { // 빈칸(공백 포함) 체크
            toast.error("할 일을 입력해주세요."); // 👈 여기서 차단!
            return; 
        }
        addTask(); // 검증 통과시에만 실제 DB 등록 함수 실행
    };

 
    // 삭제 로직
    const { mutate: deleteTask } = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase.from('tasks').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('할 일이 삭제되었습니다.', {
                icon: '🗑️', });
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
            toast.success('내용이 수정되었습니다!', { icon: '📝',});
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
            <div className="space-y-6 sm:space-y-8">
                {/* 등록 및 필터 영역 */}
                <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-sm font-bold text-gray-500 ml-1">새로운 할 일</label>
                        <input  type="text" 
                                value={content}
                                onChange={(e)=> setContent(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddTask();
                                    } 
                                }}
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
                    <button onClick={handleAddTask}
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