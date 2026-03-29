import { create } from "zustand";

// 태스크 타입 정의 (TS)
interface Task {
    id : string;
    title : string;
    status : 'todo' | 'doing' | 'done';
    priority : 'low' | 'medium' | 'high';
}

interface TaskState {
    tasks: Task[];
    //상태 업데이트 액션
    setTasks: (tasks: Task[]) => void;
    moveTask: (taskId: string, newStatus: Task['status']) => void;
}

// Zustand Store 생성
export const iseTaskStore = create<TaskState>((set) => ({
    tasks: [], // 초기값은 빈 배열

    setTasks: (tasks) => set({ tasks }),

    // 드래그 앤 드롭 시 상태 변경 로직
    moveTask: (taskId, newStatus) => 
        set((state) => ({
            tasks: state.tasks.map((task) => 
                task.id === taskId ? {...task, status: newStatus} : task
            ),
        })),
}));