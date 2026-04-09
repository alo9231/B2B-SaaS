export interface ModalState {
    isOpen : boolean;
    selectedPostId: number | null; // number 타입 확인!
    openModal: (id: number) => void;
    closeModal: () => void;
}