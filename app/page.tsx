'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../src/lib/supabase'

// 타입을 정의해서 에러를 없앱니다
interface Post {
  id: number;
  title: string;
  created_at: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newTitle, setNewTitle] = useState('') // 입력창 글자 상태

  // 수정 상태 관리를 위한 state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')

  // 데이터 가져오기 함수
  async function getPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error('Error fetching:', error)
    else setPosts(data || [])
  }

  useEffect(() => {
    getPosts()
  }, [])

  // 추가 (Create)
  async function addPost() {
    if (newTitle.trim() === '') return

    const { error } = await supabase.from('posts').insert([{ title: newTitle }])
    
    if (error){ 
      alert('저장 실패!')
    }else {
      setNewTitle('')
      getPosts()
    }
  }

  // 삭제 (Delete)
  async function deletePost(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    const { error } = await supabase.from('posts').delete().eq('id', id)

    if(error){
      alert('삭제 실패!')
    }else{
      getPosts()
    }
    
  }

  // 수정 모드 진입
  function startEdit(post: Post) {
    setEditingId(post.id)
    setEditTitle(post.title)
  }

  // 4. 수정 완료 (Update)
  async function updatePost(id: number) {
    const { error } = await supabase
      .from('posts')
      .update({ title: editTitle })
      .eq('id', id)
    
    if (error) alert('수정 실패!')
    else {
      setEditingId(null)
      getPosts()
    }
  }


  return (
    <main className="p-10 max-w-2xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-indigo-600 text-center">CRUD</h1>
      
      {/* 등록 입력창 */}
      <div className="flex gap-2 mb-10 bg-white p-4 rounded-xl shadow-sm">
        <input 
          type="text" 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)} 
          placeholder="새로운 항목 입력"
          className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <button onClick={addPost} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold">저장</button>
      </div>

      {/* 목록 및 수정/삭제 */}
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col gap-3">
            {editingId === post.id ? (
              // 수정 모드일 때 보여줄 화면
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  className="flex-1 p-2 border border-orange-300 rounded-md outline-none"
                />
                <button onClick={() => updatePost(post.id)} className="text-green-600 font-bold px-2">완료</button>
                <button onClick={() => setEditingId(null)} className="text-gray-400 px-2">취소</button>
              </div>
            ) : (
              // 일반 모드일 때 보여줄 화면
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">{post.title}</span>
                <div className="flex gap-3">
                  <button onClick={() => startEdit(post)} className="text-blue-500 hover:underline text-sm">수정</button>
                  <button onClick={() => deletePost(post.id)} className="text-red-500 hover:underline text-sm">삭제</button>
                </div>
              </div>
            )}
            <span className="text-xs text-gray-300">{new Date(post.created_at).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}