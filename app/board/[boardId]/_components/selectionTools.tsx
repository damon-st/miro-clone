"use client";

import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { useMutation, useSelf, useStorage } from "@/liveblocks.config";
import { ArrowLayer, Camera, Color, LayerType } from "@/types/canvas";
import { memo, useCallback } from "react";
import { ColorPicker } from "./color-picker";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { BringToFront, FlipHorizontal, SendToBack, Trash2 } from "lucide-react";

interface SelectionToolsProps {
  camera: Camera;
  setLastUsedColor: (color: Color) => void;
  scale: number;
}

export const SelectionTools = memo(
  ({ camera, setLastUsedColor, scale }: SelectionToolsProps) => {
    const selection = useSelf((me) => me.presence.selection);
    const allLayers = useStorage((root) => root.layers);
    const moveToBack = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const indeces: number[] = [];
        const arr = liveLayerIds.toImmutable();
        for (let i = 0; i < arr.length; i++) {
          if (selection.includes(arr[i])) {
            indeces.push(i);
          }
        }
        for (let i = 0; i < indeces.length; i++) {
          liveLayerIds.move(indeces[i], i);
        }
      },
      [selection]
    );
    const moveToFront = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const indeces: number[] = [];
        const arr = liveLayerIds.toImmutable();
        for (let i = 0; i < arr.length; i++) {
          if (selection.includes(arr[i])) {
            indeces.push(i);
          }
        }

        for (let i = indeces.length - 1; i >= 0; i--) {
          liveLayerIds.move(
            indeces[i],
            arr.length - 1 - (indeces.length - 1 - i)
          );
        }
      },
      [selection]
    );
    const setFill = useMutation(
      ({ storage }, fill: Color) => {
        const liveLayers = storage.get("layers");
        setLastUsedColor(fill);

        selection.forEach((id) => {
          liveLayers.get(id)?.set("fill", fill);
        });
      },
      [selection, setLastUsedColor]
    );

    const deleteLayers = useDeleteLayers();

    const selectionBounds = useSelectionBounds();
    const isArrow = selection.find(
      (e) => allLayers.get(e)?.type == LayerType.Arrow
    );

    const onFlipArrow = useMutation(
      ({ storage }) => {
        const layersIds = storage.get("layers");
        for (const selected of selection) {
          const layer = layersIds.get(selected);
          if (!layer) {
            continue;
          }
          if (layer.toObject().type == LayerType.Arrow) {
            layer.update({
              flip: !!!(layer.toObject() as ArrowLayer).flip,
            });
          }
        }
      },
      [selection]
    );

    if (!selectionBounds) return null;
    const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
    const y = selectionBounds.y + camera.y;

    return (
      <div
        className="absolute p-3 rounded-xl bg-white shadow-sm border flex select-none"
        style={{
          transform: `translate(calc(${x}px - 50%),calc(${y - 16}px - 100%)`,
        }}
      >
        <ColorPicker onChange={setFill} />
        <div className="flex flex-col gap-y-0.5">
          <Hint label="Bring to fron">
            <Button onClick={moveToFront} size="icon" variant="board">
              <BringToFront />
            </Button>
          </Hint>
          <Hint label="Send to back">
            <Button onClick={moveToBack} size="icon" variant="board">
              <SendToBack />
            </Button>
          </Hint>
        </div>
        {isArrow && (
          <div className="flex items-center pl-2 ml-2 border-l border-neutral-200">
            <Hint label="Flip">
              <Button variant="board" size={"icon"} onClick={onFlipArrow}>
                <FlipHorizontal />
              </Button>
            </Hint>
          </div>
        )}
        <div className="flex items-center pl-2 ml-2 border-l border-neutral-200">
          <Hint label="Delete">
            <Button variant="board" size={"icon"} onClick={deleteLayers}>
              <Trash2 />
            </Button>
          </Hint>
        </div>
      </div>
    );
  }
);

SelectionTools.displayName = "SelectionTools";
