'use client'

import { useEffect, useState } from 'react'
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';
import useModalStore from '@/store/useModalStore';
import PostsDetailModal from '@/components/dashboard/PostsDetailModal';
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
    const { error } = await supabase.from('posts').update({ status : nextStatus }).eq('id', post.id);
    if(!error) {
        getPosts();
        toast.success(`상태가 ${nextStatus}로 변경되었습니다.`);
    }
  }

  if (loading) return <div className="p-20 text-center text-gray-400">데이터 로딩 중...</div>;

  return (
    <div className="p-8 space-y-8">
      {/* 검색바 섹션 */}
      <div className="flex justify-end">
        <div className="relative w-72">
          <input 
            type="text" placeholder='데이터 검색...' 
            value={searchTerm} onChange={(e)=> setSearchTerm(e.target.value)}
            className='w-full pl-4 pr-4 py-2 border rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition'
          />
        </div>
      </div>

      {/* 통계 섹션 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">총 데이터</p>
          <p className="text-3xl font-bold text-indigo-600">{posts.length}개</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">오늘 상태</p>
          <p className="text-3xl font-bold text-green-500">Active</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">서버 상태</p>
          <p className="text-3xl font-bold text-orange-400">Normal</p>
        </div>
      </section>

      {/* 테이블 섹션 */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
            <tr>
              <th className="p-4 border-b cursor-pointer" onClick={() => requestSort('id')}>ID</th>
              <th className="p-4 border-b cursor-pointer" onClick={() => requestSort('status')}>상태</th>
              <th className="p-4 border-b">제목</th>
              <th className="p-4 border-b cursor-pointer" onClick={() => requestSort('created_at')}>생성일</th>
              <th className="p-4 border-b text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            {sortedPosts.map((post) => (
              <tr key={post.id} className="hover:bg-indigo-50/30 cursor-pointer transition-colors" onClick={() => openModal(post.id)}>
                <td className="p-4 text-gray-400 font-mono text-sm">{post.id}</td>
                <td className='p-4'>
                  <span onClick={(e)=> { e.stopPropagation(); toggleStatus(post); }} 
                        className={`px-2 py-1 rounded-md text-[10px] font-black border ${getStatusStyle(post.status || 'Active').style}`}>
                    {getStatusStyle(post.status || 'Active').label}
                  </span>
                </td>
                <td className="p-4 font-medium">
                  {editingId === post.id ? (
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onClick={(e)=>e.stopPropagation()} className='border rounded p-1 w-full'/>
                  ) : (
                    <div className="flex items-center gap-2">
                      {post.title}
                      {post.commentCount! > 0 && <span className="text-[10px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-full font-bold">{post.commentCount}</span>}
                    </div>
                  )}
                </td>
                <td className="p-4 text-gray-500 text-sm">{new Date(post.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-center" onClick={(e)=>e.stopPropagation()}>
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
      </section>

      <PostsDetailModal />
      
  
    </div>
  )
}