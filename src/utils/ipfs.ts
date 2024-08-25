class IpfsUploadError extends Error {
  constructor(message: string) {
    super(message);
    console.error(message);
    this.name = 'IpfsUploadError';
  }
}

// TODO: remove and use pinata directly
export const uploadToIpfs = async (blob: Blob): Promise<string> => {
  if (!blob) {
    throw new IpfsUploadError("No image URL to upload");
  }

  try {
    // Create FormData and append the Blob as if it were a file
    const formData = new FormData();
    formData.append("file", blob, "filename.json"); // Add a filename

    // Optional: Add metadata and options as before
    const metadata = JSON.stringify({
      name: "File name",
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    // Adjust the fetch call as necessary
    const res = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_PUBLIC_PINATA_JWT}`,
        },
        body: formData,
      }
    );
    const resData = await res.json();
    if (resData.error) {
      throw new IpfsUploadError(`Error during upload: ${JSON.stringify(resData.error)}`);
    }
    return resData.IpfsHash;
  } catch (error) {
    throw new IpfsUploadError(`Error during upload: ${error}`);
  }
};