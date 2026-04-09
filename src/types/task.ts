export interface Task {
    id: number; // Supabase ID 타입에 맞춤
    content: string;
    status: 'todo' | 'doing' | 'done';
}