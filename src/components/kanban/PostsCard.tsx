import useModalStore from "@/store/useModalStore";

export default function postsCard({ posts }: { posts: any }) {
    // 스토어에서 openModal 함수를 가져옴
    const openModal = useModalStore((state) => state.openModal);

    return(
        <div // 카드를 클릭하면 해당 post의 id를 넘겨주며 모달 오픈
             onClick={()=> openModal(posts.id)}
             className="cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all shadow-sm rounded-lg p-4"

        >
            <h4>{posts.title}</h4>
            {/* 기존 카드 내용 */}
            <p className="text-sm text-gray-500">{posts.content?.substring(0, 30)}...</p>
        </div>
    )
}