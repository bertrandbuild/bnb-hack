import React, { useState } from "react";

interface PrivateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (privateKey: string) => void;
}

const PrivateKeyModal: React.FC<PrivateKeyModalProps> = ({
  isOpen,
  onClose,
  onConnect,
}) => {
  const [privateKey, setPrivateKey] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrivateKey(event.target.value);
  };

  const handleConnect = () => {
    onConnect(privateKey);
    setPrivateKey(""); // Clear the input field after connecting
    onClose(); // Close the modal
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-semibold mb-4 text-primary">Add your private key</h2>
        <input
          type="password"
          placeholder="Enter your private key"
          value={privateKey}
          onChange={handleInputChange}
          className="input input-bordered w-full mb-4"
        />
        <p className="text-sm mb-4 text-secondary">
          Your private key is securely on a decentralized server. But this app
          is only for demo purpose, so never trust ot on mainnet for now (we
          will improve this later).
        </p>
        <div className="flex justify-end">
          <button className="btn btn-secondary mr-2" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleConnect}>
            Connect with 0x20...05E
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivateKeyModal;
