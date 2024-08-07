import { useState } from "react";

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
