'use client'

import { useEffect, useState } from 'react'
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';
import useModalStore from '@/store/useModalStore';
import PostsDetailModal from './PostsDetailModal';
// 1. react-hot-toast 임포트 확인
import { toast } from 'react-hot-toast';

interface Post {
  id: number;
  title: string;
  created_at: string;
  status?: 'Active' | 'Pending' | 'Closed';
  commentCount?: number;
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [newPostTitle, setNewPostTitle] = useState(''); // 새글 등록
  const router = useRouter(); 
  const openModal = useModalStore((state) => state.openModal);

  const [sortConfig, setSortConfig] = useState<{key: keyof Post; direction: 'asc' | 'desc' }>({
    key : 'id',
    direction: 'desc'
  });

  async function getPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select(`*, comments(id)`)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching:', error);
    } else {
      const statusOptions : ('Active' | 'Pending' | 'Closed')[] = ['Active', 'Pending', 'Closed'];
      const updatedData = data?.map((item: any) => ({
        ...item, 
        status: item.status || statusOptions[item.id % 3],
        commentCount: item.comments ? item.comments.length : 0
      }))
      setPosts(updatedData || []);
      setLoading(false);
    }
  }

  // 새 글 등록
  async function addPost() {
    if (!newPostTitle.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    const { error } = await supabase
      .from('posts')
      .insert([{ title: newPostTitle, status: 'Active' }]);

    if (error) {
      toast.error('등록 실패');
    } else {
      setNewPostTitle(''); // 입력창 초기화
      getPosts(); // 목록 새로고침
      toast.success('✅ 게시글이 등록되었습니다.');
    }
  }

  useEffect(() => {
    const checkUser = async () => {
        const { data : { user } } = await supabase.auth.getUser();
        if(!user) {
            router.push('/login');                  
        } else {
            getPosts();
        }
    }
    checkUser();

    const channel = supabase
      .channel('realatime-comments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments'}, (payload) => {
          // 2. 실시간 댓글 알림 -> 공통 토스트로 교체
          toast.success(`💬 새 댓글이 등록되었습니다!`);
          getPosts();
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredPosts = posts.filter((post) => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const aValue = a[sortConfig.key] ?? '';
    const bValue = b[sortConfig.key] ?? '';
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  })

  const requestSort = (key: keyof Post) => {
    let direction : 'asc' | 'desc' = 'asc';
    if(sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
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

  async function updatePost(id: number) {
    const { error } = await supabase.from('posts').update({ title: editTitle }).eq('id', id)
    if (!error) {
      setEditingId(null);
      getPosts();
      // 3. 수정 알림 -> 공통 토스트로 교체
      toast.success('✅ 수정되었습니다.');
    }
  }

  async function deletePost(id: number) {
    if (!confirm('삭제하시겠습니까?')) return
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (!error) { 
        getPosts(); 
        // 4. 삭제 알림 -> 공통 토스트로 교체
        toast.success('✅ 삭제되었습니다.'); 
    }
  }

  const toggleStatus = async (post: Post) => {
    const statusOrder: ('Active' | 'Pending' | 'Closed')[] = ['Active', 'Pending', 'Closed'];
    const nextStatus = statusOrder[(statusOrder.indexOf(post.status || 'Active') + 1) % 3];
    
    const { error } = await supabase
      .from('posts')
      .update({ status : nextStatus })
      .eq('id', post.id);

    if(!error) {
        getPosts();
        // ✅ getStatusStyle 함수를 사용해 한글 레이블(활성, 대기, 종료)을 가져옵니다.
        const statusLabel = getStatusStyle(nextStatus).label;
        toast.success(`상태가 "${statusLabel} 상태" 로 변경되었습니다.😊`);
    }
  }

  if (loading) return <div className="p-20 text-center text-gray-400">데이터 로딩 중...</div>;

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* 새글 등록 섹션 */}
      <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <input 
          type="text" 
          placeholder="새 게시글 제목 입력..." 
          value={newPostTitle}
          onChange={(e) => setNewPostTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPost()} // 엔터로 등록 가능
          className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
        />
        <button 
          onClick={addPost}
          className="w-full md:w-24 p-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md active:scale-95 transition-all"
        >
          등록하기
        </button>
      </div>

      {/* 검색바 섹션 */}
      <div className="flex justify-end">
        <div className="relative w-full">
          <input 
            type="text" placeholder='데이터 검색...' 
            value={searchTerm} onChange={(e)=> setSearchTerm(e.target.value)}
            className="bg-white w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* 통계 섹션 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">총 데이터</p>
          <p className="text-3xl font-bold text-indigo-600">{posts.length}개</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">오늘 상태</p>
          <p className="text-3xl font-bold text-green-500">Active</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">서버 상태</p>
          <p className="text-3xl font-bold text-orange-400">Normal</p>
        </div>
      </section>

      {/* 테이블 섹션 */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 w-full overflow-x-auto">
        <div className="w-full overflow-x-auto overflow-y-hidden min-w-[900px]">{/* ✅ 모바일 가로 스크롤 허용 */}
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                <tr>
                  <th className="p-4 border-b hidden  whitespace-nowrap">ID</th>
                  <th className="p-4 border-b whitespace-nowrap">상태</th>
                  <th className="p-4 border-b whitespace-nowrap">제목</th>          
                  <th className="p-4 border-b hidden  whitespace-nowrap">생성일</th>
                  <th className="p-4 border-b whitespace-nowrap">관리</th>
                </tr>
              </thead>
              <tbody>
                {sortedPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-indigo-50/30 cursor-pointer transition-colors" onClick={() => openModal(post.id)}>
                    <td className="p-4 hidden  whitespace-nowrap">{post.id}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span 
                          onClick={(e) => { e.stopPropagation(); toggleStatus(post); }} 
                          // ✅ whitespace-nowrap과 min-w-[50px] (또는 w-fit) 추가
                          className={`px-2 py-1 rounded-md text-[10px] font-black border whitespace-nowrap min-w-[48px] text-center inline-block ${getStatusStyle(post.status || 'Active').style}`}
                        >
                          {getStatusStyle(post.status || 'Active').label}
                      </span>
                    </td>
                    <td className="p-4 font-medium">
                      {editingId === post.id ? (
                        <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onClick={(e)=>e.stopPropagation()} className='border rounded p-1 w-full'/>
                      ) : (
                        <div className="min-w-[400px] whitespace-nowrap flex items-center gap-2">
                          {post.title}
                          {post.commentCount! > 0 && <span className="text-[10px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-full font-bold">{post.commentCount}</span>}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 text-sm hidden ">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 whitespace-nowrap text-center" onClick={(e)=>e.stopPropagation()}>
                      <div className="flex justify-center gap-2">
                        {editingId === post.id ? (
                          <button onClick={()=> updatePost(post.id)} className="text-green-600 text-sm font-bold">완료</button>
                        ) : (
                          <button onClick={()=> { setEditingId(post.id); setEditTitle(post.title); }} className="text-indigo-500 text-sm">수정</button>
                        )}
                        <button onClick={()=> deletePost(post.id)} className="text-red-400 text-sm">삭제</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>       
      </section>

      <PostsDetailModal />
      
  
    </div>
  )
}