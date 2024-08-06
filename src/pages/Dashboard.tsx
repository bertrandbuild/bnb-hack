import React from "react";

// import components
import ChartSection from "../components/ChartSection";
import StrategyControls from "../components/StrategyControls";
import PrivateKeyModal from "../components/PrivateKeyModal";

// import hooks
import { useModal } from "../hooks/useModal";

const Dashboard: React.FC = () => {
  const { isPrivateKeyModalOpen, handleOpenModal, handleCloseModal } =
    useModal();

  const handleConnect = (privateKey: string) => {
    // Add logic to handle the private key connection
    // Example logic (to be replaced with real implementation):
    // connectToService(privateKey);
    console.log(privateKey);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto px-4 py-4 bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-start">
          {/* Left Section: Chart and Trade History */}
          <ChartSection />
          {/* Right Section: Controls and Strategy Info */}
          <StrategyControls onOpenModal={handleOpenModal} />
        </div>
      </div>

      {/* Private Key Modal */}
      <PrivateKeyModal
        isOpen={isPrivateKeyModalOpen}
        onClose={handleCloseModal}
        onConnect={handleConnect}
      />
    </div>
  );
};

export default Dashboard;
