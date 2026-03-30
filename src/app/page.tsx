'use client'

import { useEffect, useState } from 'react'
import gsap from 'gsap';
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';
// 1. 추가: 모달 스토어와 모달 컴포넌트 임포트
import useModalStore from '@/store/useModalStore';
import PostsDetailModal from '@/components/dashboard/PostsDetailModal';

interface Post {
  id: number;
  title: string;
  created_at: string;
  status?: 'Active' | 'Pending' | 'Closed';
  commentCount?: number; // 추가
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [searchTerm, setSearchTerm] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter(); 
  const [loading, setLoading] = useState(true);

  // 2. 추가: 모달 열기 함수 가져오기
  const openModal = useModalStore((state) => state.openModal);

  const [sortConfig, setSortConfig] = useState<{key: keyof Post; direction: 'asc' | 'desc' }>({
    key : 'id',
    direction: 'desc'
  });

  const [toast, setToast] = useState<{ message : string; visible: boolean}>({
    message:'',
    visible: false,
  })

  const showToast = (msg: string) => {
    setToast({message : msg, visible: true})
    setTimeout(() => setToast({ message : '', visible : false}), 3000)
  }

  async function getPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select(`*, comments(id)`) // 댓글의 id 목록을 함께 가져옴
      .order('created_at', { ascending: false }) // DB에서 가져올 때 최신순 정렬
    
    if (error) {
      console.error('Error fetching:', error);
    } else {
      const statusOptions : ('Active' | 'Pending' | 'Closed')[] = ['Active', 'Pending', 'Closed'];
      const updatedData = data?.map((item: any) => ({
        ...item, 
        status: item.status || statusOptions[item.id % 3], // DB에 상태가 없으면 배분
        // 💡 댓글 개수를 미리 계산해서 넣어줌
        commentCount: item.comments ? item.comments.length : 0
      }))

      // 💡 혹시 모르니 클라이언트 측에서도 한 번 더 정렬해주면 확실
      const sortedData = updatedData?.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPosts(updatedData || []);
    }
  }

  useEffect(() => {
    const checkUser = async () => {
        const { data : { user } } = await supabase.auth.getUser();
        if(!user) {
            router.push('/login');                  
        } else {
            setUserEmail(user.email || '관리자'); 
            setLoading(false);          
            getPosts();
        }
    }
    checkUser();
  }, []);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-white text-black">인증 확인 중...</div>;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredPosts = posts.filter((post) => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key] ?? '';
    const bValue = b[sortConfig.key] ?? '';
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  })

  const requestSort = (key: keyof Post) => {
    let direction : 'asc' | 'desc' = 'asc';
    if(sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active': return { label: '활성', style: 'bg-green-100 text-green-700 border-green-200' };
      case 'Pending': return { label: '대기', style: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'Closed': return { label: '종료', style: 'bg-gray-100 text-gray-600 border-gray-200' };
      default: return { label: '미정', style: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
  }

  async function addPost() {
    if (!newTitle.trim()) return
    const { error } = await supabase.from('posts').insert([{ title: newTitle }])
    if (error) { 
      showToast('❌ 저장에 실패했습니다 😭');
    } else {
      setNewTitle('');
      getPosts();
      showToast('✅ 성공적으로 등록되었습니다 😊')
    }
  }

  async function deletePost(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if(error) {
      showToast('❌ 삭제에 실패했습니다 😭');
    } else {
      getPosts()
      showToast('✅ 성공적으로 삭제되었습니다 😊')
    }
  }

  async function updatePost(id: number) {
    const { error } = await supabase
      .from('posts')
      .update({ title: editTitle })
      .eq('id', id)
    if (error) {
       showToast('❌ 수정에 실패했습니다 😭');
    } else {
      setEditingId(null)
      getPosts()
      showToast('✅ 성공적으로 수정되었습니다 😊')
    }
  }

  const toggleStatus = (post: Post) => {
    const statusOrder: ('Active' | 'Pending' | 'Closed')[] = ['Active', 'Pending', 'Closed'];
    const currentIndex = statusOrder.indexOf(post.status || 'Active');
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIndex];

    setPosts(prev => prev.map(p => p.id === post.id ? {...p, status: nextStatus }: p));
    showToast(`상태가 ${getStatusStyle(nextStatus).label}(으)로 변경 되었습니다. 😊`);
    updateStatusInDB(post.id, nextStatus);
  }

  async function updateStatusInDB(id: number, nextStatus: string) {
    const { error } = await supabase.from('posts').update({ status : nextStatus }).eq('id', id);
    if(error) console.error('DB 업데이트 실패:', error.message);
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {toast.visible && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-lg border border-indigo-100 animate-in fade-in-down">
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* 1. 사이드바 */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 text-indigo-400">B2B Admin</div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full text-left p-3 rounded bg-indigo-600 text-white font-semibold">대시보드</button>
          <button className="w-full text-left p-3 rounded text-slate-400 hover:bg-slate-800 transition">고객 관리</button>
        </nav>
      </aside>

      {/* 2. 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
            <h2 className="text-xl font-semibold">데이터 관리 대시보드</h2>
            <div className="relative w-96">
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                <input type="text" placeholder='검색어를 입력해주세요..'
                       value={searchTerm} onChange={(e)=> setSearchTerm(e.target.value)}
                       className='w-full pl-10 pr-4 py-2 border rounded-full bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition'
                />
            </div>
            <div className="flex items-center gap-6 text-sm">
                <span><em className="text-indigo-600 font-bold">{userEmail}</em>님</span>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 border-l pl-6 transition">로그아웃</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* 통계 섹션 */}
            <section className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">총 데이터</p>
                    <p className="text-3xl font-bold text-indigo-600">{posts.length}개</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">오늘 상태</p>
                    <p className="text-3xl font-bold text-green-500 font-black">Active</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">서버 상태</p>
                    <p className="text-3xl font-bold text-orange-400 font-black">Normal</p>
                </div>
            </section>

            {/* 테이블 섹션 */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-4 border-b cursor-pointer" onClick={() => requestSort('id')}>ID {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↓'}</th>
                            <th className="p-4 border-b cursor-pointer" onClick={() => requestSort('status')}>상태 {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↓'}</th>
                            <th className="p-4 border-b cursor-pointer" onClick={() => requestSort('title')}>제목 {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↓'}</th>
                            <th className="p-4 border-b cursor-pointer" onClick={() => requestSort('created_at')}>생성일 {sortConfig.key === 'created_at' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↓'}</th>
                            <th className="p-4 border-b text-center">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPosts.length === 0 ? (
                            <tr><td colSpan={5} className="p-10 text-center text-gray-400">데이터가 없습니다.</td></tr>
                        ) : (
                            sortedPosts.map((post)=> (
                                <tr 
                                      key={post.id} 
                                      className="group cursor-pointer hover:bg-indigo-50/50 transition-colors"
                                      onClick={() => openModal(post.id)} // 💡 tr에만 걸어두는 것이 가장 깔끔합니다.
                                  >
                                    <td className="p-4 text-gray-400 font-mono">{post.id}</td>
                                    <td className='p-4'>
                                        <span onClick={(e)=> { e.stopPropagation(); toggleStatus(post); }} // 버블링 방지
                                              className={`px-2 py-1 rounded-md text-[10px] font-black border cursor-pointer active:scale-95 transition-all ${getStatusStyle(post.status || 'Active').style}`}>
                                          {getStatusStyle(post.status || 'Active').label}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium text-gray-700 group-hover:text-indigo-600 transition-all">
                                        {editingId === post.id ? (
                                            <input type="text" 
                                                   value={editTitle} 
                                                   onChange={(e) => setEditTitle(e.target.value)}
                                                   className='border border-indigo-300 rounded p-1 w-full outline-none'
                                                   onClick={(e) => e.stopPropagation()} 
                                            />
                                        ) : (
                                          <>
                                            <span className="truncate max-w-[200px]">{post.title}</span>
                                            {/* 💡 댓글 숫자가 0보다 클 때만 작은 뱃지로 표시 */}
                                            {(post as any).commentCount > 0 && (
                                              <span className="ml-1.5 text-[10px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded font-bold border border-indigo-100">
                                                {(post as any).commentCount}
                                              </span>
                                            )}
                                          </>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-500">{new Date(post.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-3" onClick={(e) => e.stopPropagation()}> 
                                            {editingId === post.id ? (
                                                <button onClick={()=> updatePost(post.id)} className="text-green-600 font-bold">완료</button>
                                            ) : (
                                                <button onClick={()=> { setEditingId(post.id); setEditTitle(post.title); }} className="text-indigo-500 hover:font-bold">수정</button>
                                            )}
                                            <button onClick={()=> deletePost(post.id)} className="text-red-400 hover:text-red-600">삭제</button>
                                        </div>
                                    </td>
                                </tr>
                            ))                          
                        )}
                    </tbody>
                </table>
            </section>
        </div>

        {/* 3. 중요: 모달 컴포넌트를 메인 영역 안에 배치 (Portal이 body로 보내줍니다) */}
        <PostsDetailModal />
      </main>
    </div>
  )
}