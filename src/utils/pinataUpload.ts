import { PinataSDK } from "pinata";
import toast from "react-hot-toast";

// Interface for Pinata upload response
interface PinResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

// Initialize Pinata SDK with JWT and gateway
const pinata = new PinataSDK({
  pinataJwt: `${import.meta.env.VITE_PUBLIC_PINATA_JWT}`,
});

// Function to upload URL to Pinata with optional parameters
export const uploadUrlToPinata = async (
  url: string,
  metadata?: { name: string; keyValues?: Record<string, string | number> },
  groupId?: string,
  apiKey?: string,
  cidVersion?: 0 | 1
): Promise<PinResponse> => {
  try {
    let upload = pinata.upload.url(url);

    // Add optional metadata
    if (metadata) {
      upload = upload.addMetadata(metadata);
    }

    // Specify group for the upload
    if (groupId) {
      upload = upload.group(groupId);
    }

    // Use a specific API key
    if (apiKey) {
      upload = upload.key(apiKey);
    }

    // Specify CID version
    if (cidVersion !== undefined) {
      upload = upload.cidVersion(cidVersion);
    }

    // Execute the upload
    const response: PinResponse = await upload;

    toast.success("Upload successful");
    return response;
  } catch (error) {
    console.error("Upload failed:", error);
    toast.error("Upload failed");
    throw new Error(`Failed to upload URL to Pinata: ${error}`);
  }
};