import { shallow } from "@liveblocks/client";
import { Layer, XYWH } from "@/types/canvas";
import { useSelf, useStorage } from "@/liveblocks.config";

const boundingBox = (layers: Layer[]): XYWH | null => {
  const firts = layers[0];
  if (!firts) return null;

  let left = firts.x;
  let rigth = firts.x + firts.width;
  let top = firts.y;
  let bottom = firts.y + firts.height;

  for (let i = 0; i < layers.length; i++) {
    const { x, y, width, height } = layers[i];

    if (left > x) {
      left = x;
    }
    if (rigth < x + width) {
      rigth = x + width;
    }
    if (top > y) {
      top = y;
    }
    if (bottom < y + height) {
      bottom = y + height;
    }
  }

  return {
    x: left,
    y: top,
    width: rigth - left,
    height: bottom - top,
  };
};

export const useSelectionBounds = () => {
  const selection = useSelf((me) => me.presence.selection);

  return useStorage((root) => {
    const selectedLayers = selection
      .map((layerId) => root.layers.get(layerId)!)
      .filter(Boolean);

    return boundingBox(selectedLayers);
  }, shallow);
};
