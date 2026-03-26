'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../src/lib/supabase'
import { Sree_Krushnadevaraya } from 'next/font/google';

// 타입을 정의해서 에러를 없앱니다
interface Post {
  id: number;
  title: string;
  created_at: string;
  status?: 'Active' | 'Pending' | 'Closed';
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newTitle, setNewTitle] = useState('') // 입력창 글자 상태

  // 수정 상태 관리를 위한 state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')

  // 테이블 : 어떤 컬럼을, 어떤 방향(asc/desc)으로 정렬할지 저장
  // 처음부터 'ID' 기준으로 '내림차순(최신순)' 정렬하라고 지정
  const [sortConfig, setSortConfig] = useState<{key: keyof Post; direction: 'asc' | 'desc' }>({
    key : 'id',
    direction: 'desc'
  });
  
  // 정렬함수
  const requestSort = (key: keyof Post) => {
    let direction : 'asc' | 'desc' = 'asc';
    
    if(sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }


  // --- [검색 기능 추가] --- state
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태

  // --- [토스트 상태 추가] --- state
  const [toast, setToast] = useState<{ message : string; visible: boolean}>({
    message:'',
    visible: false,
  })

  // 토스트 띄우기 함수
  const showToast = (msg: string) => {
    setToast({message : msg, visible: true})
    setTimeout(() => setToast({ message : '', visible : false}), 3000) // 3초 뒤 사라짐
  }


  
  // 데이터 가져오기 함수
  async function getPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching:', error);
    }else{
      // 💡 임시로 데이터마다 상태값을 랜덤하게 부여함 (나중에 DB 컬럼으로 관리 가능)
      const statusOptions : ('Active' | 'Pending' | 'Closed')[] = ['Active', 'Pending', 'Closed'];
      const updatedData = data?.map((item: any) => ({...item, status: statusOptions[item.id % 3] // ID 값을 기준으로 규칙적으로 배분
      }))

      setPosts(updatedData || []);
    }
  }

  useEffect(() => {
    getPosts()
  }, [])

  // --- [필터링 로직] ---
  // 원본 데이터(posts)는 건드리지 않고, 검색어가 포함된 것만 골라서 보여줌
  const filteredPosts = posts.filter((post) => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  //실제 정렬된 데이터를 계산하는 로직 (filteredPosts 아래에 있어야함) 
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key] ?? '';
    const bValue = b[sortConfig.key] ?? '';

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;

    return 0;

  })


  // 테이블 상태별 뱃지 맵핑 함수
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active': 
        return { label: '활성', style: 'bg-green-100 text-green-700 border-green-200' };
      case 'Pending': 
        return { label: '대기', style: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'Closed': 
        return { label: '종료', style: 'bg-gray-100 text-gray-600 border-gray-200' };
      default: 
        return { label: '미정', style: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
  }

  // 뱃지 클릭했을 때 호출할 함수
  const toggleStatus = (post: Post) => {
    const statusOrder: ('Active' | 'Pending' | 'Closed')[] = ['Active', 'Pending', 'Closed'];
    const currentIndex = statusOrder.indexOf(post.status || 'Active');
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIndex];

    // 화면 업데이트(Optimistic Update)
    setPosts(prev => prev.map(p =>
      p.id === post.id ? {...p, status: nextStatus }: p
    ));

    // 한글로 변환해서 토스트 알림
    const nextLabel = getStatusStyle(nextStatus).label;
    showToast(`상태가 ${nextLabel}(으)로 변경 되었습니다. 😊`);

    // Supabase DB 업데이트
    updateStatusInDB(post.id, nextStatus);
  }

  // 뱃지 클릭 후 실제 DB에도 저장
  async function updateStatusInDB(id: number, nextStatus: string) {
    const { error } = await supabase
        .from('posts')
        .update({ status : nextStatus })
        .eq('id', id);
        if(error) console.error('DB 업데이트 실패 😭👉 ', error);
  }

  // 추가 (Create)
  async function addPost() {
    if (!newTitle.trim()) return

    const { error } = await supabase.from('posts').insert([{ title: newTitle }])
    
    if (error){ 
      showToast('❌ 저장에 실패했습니다 😭');
    }else {
      setNewTitle('');
      getPosts();
      showToast('✅ 성공적으로 등록되었습니다 😊')
    }
  }

  // 삭제 (Delete)
  async function deletePost(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    const { error } = await supabase.from('posts').delete().eq('id', id)

    if(error){
      showToast('❌ 삭제에 실패했습니다 😭');
    }else{
      getPosts()
      showToast('✅ 성공적으로 삭제되었습니다 😊')
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
    
    if (error) {
       showToast('❌ 수정에 실패했습니다 😭');
    }else {
      setEditingId(null)
      getPosts()
      showToast('✅ 성공적으로 수정되었습니다 😊')
    }
  }


  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 font-sans relative">
      {/* --- [토스트 UI 컴포넌트] --- */}
      {toast.visible && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] 
                        flex items-center gap-3 
                        bg-slate-900/90 backdrop-blur-md text-white
                        px-6 py-3 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)]
                        border border-indigo-100
                        transition-all duration-500 ease-out
                        animate-in fade-in-down slide-in-from-top-8">
          <div className="flex items-center justify-center w-6 h-6 bg-indigo-600 rounded-full">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
          <span className="text-sm font-bold tracking-tight">{toast.message}</span>
        </div>
      )}
      {/* 1. 사이드바 (Sidebar) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="p-6 text-2xl font-bold border-b border-slate-700 text-indigo-400">
            B2B Admin
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <button className="w-full text-left p-3 rounded bg-slate-800 text-indigo-300 font-semibold">대시보드</button>
            <button className="w-full text-left p-3 rounded hover:bg-slate-800 transition">고객 관리</button>
            <button className="w-full text-left p-3 rounded hover:bg-slate-800 transition">결제 내역</button>
            <button className="w-full text-left p-3 rounded hover:bg-slate-800 transition">시스템 설정</button>
          </nav>
          <div className="p-4 border-t border-slate-700 text-sm text-slate-400">
              alo9231 BaaS 프로젝트
          </div>
      </aside>

      {/* 2. 메인 콘텐츠 영역 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 헤더 */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
            <h2 className="text-xl font-semibold">데이터 관리 대시보드</h2>
            {/* 검색창 UI 추가 */}
            <div className="relative w-96">
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                <input type="text" placeholder='검색어를 입력해주세요..'
                       value={searchTerm}
                       onChange={(e)=> setSearchTerm(e.target.value)}
                       className='w-full pl-10 pr-4 py-2 border rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none transition text-sm text-black'
                />
            </div>
   
            <div className="flex items-center gap-4">
                <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">관리자 모드</span>
                <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
            </div>

        </header>

        {/* 콘텐츠 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-8">
            <h3 className="text-3xl font-bold mb-8 text-blue-600">Next.js + Supabase Blog</h3>

            {/* 상단 통계 카드 (Stats) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">총 등록 개수</p>
                    <p className="text-3xl font-bold text-indigo-600">{posts.length}개</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">오늘 활성 상태</p>
                  <p className="text-3xl font-bold text-green-500">Active</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">서버 응답</p>
                  <p className="text-3xl font-bold text-orange-400">Normal</p>
                </div>
            </div>

            {/* 데이터 추가 섹션 */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">새로운 데이터 등록</h3>
                <div className="flex gap-3">
                    <input type="text" value={newTitle} 
                           onChange={(e) => setNewTitle(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && addPost()}
                           placeholder="내용을 입력하세요..." className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition"
                    />
                    <button onClick={addPost} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">등록</button>
                </div>
            </div>

            {/* 데이터 테이블 (Table) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                        <tr>
                          <th className="p-4 border-b cursor-pointer hover:text-indigo-600 transition" onClick={() => requestSort('id')}>
                              ID {
                                sortConfig?.key === 'id' 
                                ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↓' // 클릭 안 했을 때 보여줄 기본 아이콘
                              }
                            </th>
                            <th className="p-4 border-b cursor-pointer hover:text-indigo-600 transition" onClick={() => requestSort('status')}>
                              상태 {
                                sortConfig?.key === 'status' 
                                ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↓' // 클릭 안 했을 때 보여줄 기본 아이콘
                              }
                            </th>
                            <th className="p-4 border-b cursor-pointer hover:text-indigo-600 transition" onClick={() => requestSort('title')}>
                              제목 {
                                sortConfig?.key === 'title' 
                                ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↓' // 클릭 안 했을 때 보여줄 기본 아이콘
                              }
                            </th>
                            <th className="p-4 border-b cursor-pointer hover:text-indigo-600 transition" onClick={() => requestSort('created_at')}> 
                                생성일 {
                                  sortConfig?.key === 'created_at' 
                                  ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↓' // 클릭 안 했을 때 보여줄 기본 아이콘
                                }
                            </th>
                            <th className="p-4 border-b text-center">수정</th>
                        </tr>
                    </thead>
                    <tbody>
                      {
                        posts.length === 0 ? (
                          <tr>
                              <td colSpan={4} className="p-10 text-center text-gray-400">데이터가 없습니다. 첫 데이터를 등록해보세요!</td>
                          </tr>
                        ) : (
                           sortedPosts.map((post)=> (
                              <tr key={post.id} className='hover:bg-gray-50 transition border-b last:border-0 text-sm'>
                                  <td className="p-4 text-gray-400">{post.id}</td>
                                  <td className='p-4'>
                                      {/* 💡 상태 뱃지 컴포넌트 */}
                                      <span onClick={()=> toggleStatus(post)}
                                            className={`px-2 py-1 rounded-md text-[10px] font-black border transition-all active:scale-95 hover:brightness-90
                                            ${getStatusStyle(post.status || 'Active').style}`}>
                                        {getStatusStyle(post.status || 'Active').label}
                                      </span>
                                  </td>
                                  <td className="p-4 font-medium">
                                    {editingId === post.id ? (
                                      <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                                            className='border border-indigo-300 rounded p-1 w-full outline-none'
                                      />
                                    ) : (
                                      post.title
                                    )}
                                  </td>
                                  <td className="p-4 text-gray-500">{new Date(post.created_at).toLocaleDateString()}</td>
                                  <td className="p-4 text-center">
                                      <div className="flex justify-center gap-2">
                                        {editingId === post.id ? (
                                          <>
                                            <button onClick={()=> { updatePost(post.id) }} className="text-green-600 font-bold hover:underline">완료</button>
                                            <button onClick={()=> { setEditingId(null) }} className="text-gray-400 hover:underline">취소</button>
                                          </>
                                        ) : (
                                          <>
                                            <button onClick={()=> {  setEditingId(post.id); setEditTitle(post.title);}} className="text-indigo-600 hover:underline">수정</button>
                                            <button onClick={()=> { deletePost(post.id)}} className="text-red-500 hover:underline">삭제</button>
                                          </>
                                        )}
                                      </div>
                                  </td>
                              </tr>
                            ))                          
                        )
                      }
                     

                     
                    </tbody>
                </table>
            </div>

        </div>
         
        </main>
    </div>
  
  )
}