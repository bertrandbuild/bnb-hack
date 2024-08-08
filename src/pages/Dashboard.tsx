import React, { useState} from "react";

// import components
import ChartSection from "../components/ChartSection";
import StrategyControls from "../components/StrategyControls/StrategyControls";
import PrivateKeyModal from "../components/PrivateKeyModal";

// import hooks
import { useModal } from "../hooks/useModal";

const Dashboard: React.FC = () => {
    const { isPrivateKeyModalOpen, handleCloseModal } = useModal();
    const [showBacktesting, setShowBacktesting] = useState(false);

  const handleConnect = (privateKey: string) => {
    // TODO :
    // Add logic to handle the private key connection
    // Example logic (to be replaced with real implementation):
    // connectToService(privateKey);
    console.log(privateKey);
  };

  const handleStartBacktesting = () => {
    setShowBacktesting(true);
  };

  return (
    <div className="p-4">
      <div className="p-4 bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-start">
          {/* Left Section: Chart and Trade History */}
          <ChartSection showBacktesting={showBacktesting} />
          {/* Right Section: Controls and Strategy Info */}
          <StrategyControls handleStartBacktesting={handleStartBacktesting} />
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
