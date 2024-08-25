import { useState } from "react";

// TODO: remove - privateKey modal is not used in this version 
export const useModal = () => {
  const [isPrivateKeyModalOpen, setIsPrivateKeyModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsPrivateKeyModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPrivateKeyModalOpen(false);
  };
  return { isPrivateKeyModalOpen, handleOpenModal, handleCloseModal };
};
