import { create } from 'zustand';
import { ModalState } from '@/types/modal'; // 모달 타입 정의

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  selectedPostId: null,
  // 인자 이름도 id로 통일해서 헷갈리지 않게 함
  openModal: (id) => set({ isOpen: true, selectedPostId: id }),
  closeModal: () => set({ isOpen: false, selectedPostId: null }),
}));

export default useModalStore;