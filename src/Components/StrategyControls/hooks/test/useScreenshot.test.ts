import { renderHook, act } from "@testing-library/react";
import useScreenshot from "../useScreenshot";

describe("useScreenshot hook", () => {
  beforeAll(() => {
    // Manually mock the URL global object
    global.URL.createObjectURL = jest.fn(() => "mockedUrl");
    global.URL.revokeObjectURL = jest.fn();

    // Mock the navigator.mediaDevices object
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getDisplayMedia: jest.fn(),
      },
      writable: true,
    });
  });

  afterAll(() => {
    // Restore the global URL object to its original state
    (global.URL.createObjectURL as jest.Mock).mockRestore();
    (global.URL.revokeObjectURL as jest.Mock).mockRestore();

    // Restore the navigator.mediaDevices object
    (navigator.mediaDevices.getDisplayMedia as jest.Mock).mockRestore();
  });

  it("Should initialize with null screenshot", () => {
    const { result } = renderHook(() => useScreenshot());
    expect(result.current.screenshot).toBeNull();
  });

  it("Should clean up by revoking object URL when unmounted", () => {
    const { result, unmount } = renderHook(() => useScreenshot());

    act(() => {
      result.current.setScreenshot("mockedUrl");
    });

    unmount();

    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("mockedUrl");
  });

  it("Should take a screenshot and return blob and URL", async () => {
    // Mock the video element and canvas with proper types
    const mockBlob = new Blob(["test"], { type: "image/png" });
    const toBlobSpy = jest.fn((callback: (blob: Blob | null) => void) =>
      callback(mockBlob)
    );

    // Make sure that createElement returns actual DOM elements
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockImplementation((element: string) => {
      if (element === "video") {
        const video = originalCreateElement.call(document, "video");
        Object.assign(video, {
          play: jest.fn().mockResolvedValue(undefined),
          videoWidth: 1920,
          videoHeight: 1080,
          srcObject: {},
        });
        return video;
      }

      if (element === "canvas") {
        const canvas = originalCreateElement.call(document, "canvas");
        Object.assign(canvas, {
          getContext: jest.fn().mockReturnValue({
            drawImage: jest.fn(),
          }),
          toBlob: toBlobSpy,
          width: 1920,
          height: 1080,
        });
        return canvas;
      }

      return originalCreateElement.call(document, element);
    });

    document.querySelector = jest.fn().mockReturnValue({
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
      }),
      offsetWidth: 1920,
      offsetHeight: 1080,
    });

    const mockStream = {
      getTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }]),
    };
    (navigator.mediaDevices.getDisplayMedia as jest.Mock).mockResolvedValue(
      mockStream
    );

    const { result } = renderHook(() => useScreenshot());

    let screenshotResult;
    await act(async () => {
      screenshotResult = await result.current.takeTradingViewScreenshot();
    });

    expect(screenshotResult).toEqual({
      blob: mockBlob,
      screenshotUrl: "mockedUrl",
    });
    expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalled();
    expect(mockStream.getTracks).toHaveBeenCalled();
  });

  it("Should handle error during screenshot capture", async () => {
    (navigator.mediaDevices.getDisplayMedia as jest.Mock).mockRejectedValue(
      new Error("Permission denied")
    );

    const { result } = renderHook(() => useScreenshot());

    await expect(result.current.takeTradingViewScreenshot()).rejects.toThrow(
      "Permission denied"
    );
  });
});
