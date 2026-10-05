import type { QueueItem } from "../types";

// Simulates a Cloudinary upload. Swap this whole function for the real
// XHR/fetch call later — the signature stays the same.
export const mockUpload = (
  item: QueueItem,
  onProgress: (pct: number) => void,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    let progress = 0;
    const tick = () => {
      progress += Math.random() * 18 + 4;
      if (progress >= 100) {
        onProgress(100);
        // 8% random failure so we can design the error path now
        if (Math.random() < 0.08) {
          reject(new Error("Simulated upload failure"));
          return;
        }
        const ext = item.file.name.split(".").pop() ?? "bin";
        const kind = item.mediaType === "video" ? "video" : "image";
        resolve(
          `https://res.cloudinary.com/demo/${kind}/upload/v${Date.now()}/${Math.random()
            .toString(36)
            .slice(2, 10)}.${ext}`,
        );
        return;
      }
      onProgress(Math.min(progress, 99));
      setTimeout(tick, 180 + Math.random() * 220);
    };
    setTimeout(tick, 250);
  });
};
