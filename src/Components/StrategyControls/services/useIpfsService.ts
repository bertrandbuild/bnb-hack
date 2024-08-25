import toast from "react-hot-toast";
import { uploadToIpfs } from "../../../utils/ipfs";
import { uploadUrlToPinata } from "../../../utils/pinataUpload";

// Service for IPFS operations
const useIpfsService = () => {
    const uploadToIpfsFromBlobs = async (blobs: Blob[]): Promise<string[]> => {
      const ipfsHashes: string[] = [];
      for (const blob of blobs) {
        try {
          const ipfsHash = await uploadToIpfs(blob);
          ipfsHashes.push(ipfsHash);
          toast.success("Image uploaded to IPFS successfully.");
        } catch (error) {
          toast.error("Failed to upload image to IPFS.");
          console.error("Error uploading blob to IPFS:", error);
          throw error;
        }
      }
      return ipfsHashes;
    };
  
    const uploadToIpfsFromImages = async (
      urlPaths: string[]
    ): Promise<string[]> => {
      const ipfsHashes: string[] = [];
  
      for (const urlPath of urlPaths) {
        try {
          const ipfsHash = (await uploadUrlToPinata(urlPath)).IpfsHash;
          ipfsHashes.push(ipfsHash);
          toast.success(`Image ${urlPath} uploaded to IPFS successfully.`);
        } catch (error) {
          toast.error(`Failed to upload image ${urlPath} to IPFS.`);
          console.error(`Error uploading image ${urlPath}:`, error);
          throw new Error(`Upload failed for ${urlPath}`);
        }
      }
      return ipfsHashes;
    };
  
    return {
      uploadToIpfsFromBlobs,
      uploadToIpfsFromImages,
    };
  };
  
  export default useIpfsService;
  