import { create } from 'zustand';

interface ModalState {
    isOpen : boolean;
    selectedPostId: number | null; // number 타입 확인!
    openModal: (id: number) => void;
    closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  selectedPostId: null,
  // 인자 이름도 id로 통일해서 헷갈리지 않게 함
  openModal: (id) => set({ isOpen: true, selectedPostId: id }),
  closeModal: () => set({ isOpen: false, selectedPostId: null }),
}));

export default useModalStore;