import { renderHook } from "@testing-library/react";
import toast from "react-hot-toast";
import useIpfsService from "../useIpfsService";
import { uploadToIpfs } from "../../../../utils/ipfs";
import { uploadUrlToPinata } from "../../../../utils/pinataUpload";

// Mock des dépendances
jest.mock("react-hot-toast");
jest.mock("../../../../utils/ipfs", () => ({
  uploadToIpfs: jest.fn(),
}));
jest.mock("../../../../utils/pinataUpload", () => ({
  uploadUrlToPinata: jest.fn(),
}));

describe("useIpfsService", () => {
  const mockedUploadToIpfs = uploadToIpfs as jest.Mock;
  const mockedUploadUrlToPinata = uploadUrlToPinata as jest.Mock;
  const mockedToastSuccess = toast.success as jest.Mock;
  const mockedToastError = toast.error as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should upload blobs to IPFS and return hashes", async () => {
    const blob = new Blob(["dummy content"], { type: "text/plain" });
    const ipfsHash = "QmDummyHash";

    mockedUploadToIpfs.mockResolvedValue(ipfsHash);

    const { result } = renderHook(() => useIpfsService());
    const hashes = await result.current.uploadToIpfsFromBlobs([blob]);

    expect(hashes).toEqual([ipfsHash]);
    expect(mockedUploadToIpfs).toHaveBeenCalledWith(blob);
    expect(mockedToastSuccess).toHaveBeenLastCalledWith(
      "Image uploaded to IPFS successfully."
    );
  });

  it("Should upload URLs to IPFS and return hashes", async () => {
    const urlPath = "https://example.com/image.png";
    const ipfsHash = "QmDummyHash";

    mockedUploadUrlToPinata.mockResolvedValue({ IpfsHash: ipfsHash });

    const { result } = renderHook(() => useIpfsService());
    const hashes = await result.current.uploadToIpfsFromImages([urlPath]);

    expect(hashes).toEqual([ipfsHash]);
    expect(mockedUploadUrlToPinata).toHaveBeenCalledWith(urlPath);
    expect(mockedToastSuccess).toHaveBeenLastCalledWith(
      `Image ${urlPath} uploaded to IPFS successfully.`
    );
  });

  it("Should handle errors when uploading URLs to IPFS fails", async () => {
    const urlPath = "https://example.com/image.png";
    const errorMessage = "Upload failed";

    mockedUploadUrlToPinata.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useIpfsService());

    await expect(result.current.uploadToIpfsFromImages([urlPath])).rejects.toThrow(
      `Upload failed for ${urlPath}`
    );
    expect(mockedUploadUrlToPinata).toHaveBeenCalledWith(urlPath);
    expect(mockedToastError).toHaveBeenLastCalledWith(
      `Failed to upload image ${urlPath} to IPFS.`
    );
  });
});
