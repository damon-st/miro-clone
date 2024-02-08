"use client";

import { useStorage } from "@/liveblocks.config";
import { LayerType } from "@/types/canvas";
import React, { memo } from "react";
import { Rectangle } from "./rectangle";
import { Ellipse } from "./ellipse";
import { Text } from "./text";
import { Note } from "./note";
import { Path } from "./path";
import { colorToCss } from "@/lib/utils";
import { Triangle } from "./triangle";
import { Arrow } from "./arrow";
interface LayerPreviewProps {
  id: string;
  onLayerPointDown: (e: React.PointerEvent, layerId: string) => void;
  selectionColor?: string;
}

export const LayerPreview = memo(
  ({ id, onLayerPointDown, selectionColor }: LayerPreviewProps) => {
    const layer = useStorage((root) => root.layers.get(id));

    if (!layer) {
      return null;
    }
    switch (layer.type) {
      case LayerType.Arrow:
        return (
          <Arrow
            id={id}
            layer={layer}
            onPointerDown={onLayerPointDown}
            key={id}
            selectionColor={selectionColor}
          />
        );
      case LayerType.Triangle:
        return (
          <Triangle
            id={id}
            layer={layer}
            onPointerDown={onLayerPointDown}
            key={id}
            selectionColor={selectionColor}
          />
        );
      case LayerType.Path:
        return (
          <Path
            key={id}
            points={layer.points}
            onPointerDown={(e) => onLayerPointDown(e, id)}
            stroke={selectionColor}
            x={layer.x}
            y={layer.y}
            fill={layer.fill ? colorToCss(layer.fill) : "#00"}
          />
        );
      case LayerType.Rectangle:
        return (
          <Rectangle
            id={id}
            layer={layer}
            onPointerDown={onLayerPointDown}
            selectionColor={selectionColor}
          />
        );
      case LayerType.Ellipse:
        return (
          <Ellipse
            id={id}
            layer={layer}
            selectionColor={selectionColor}
            onPointerDown={onLayerPointDown}
          />
        );
      case LayerType.Text:
        return (
          <Text
            id={id}
            layer={layer}
            selectionColor={selectionColor}
            onPointerDown={onLayerPointDown}
          />
        );
      case LayerType.Note:
        return (
          <Note
            id={id}
            layer={layer}
            selectionColor={selectionColor}
            onPointerDown={onLayerPointDown}
          />
        );

      default:
        return null;
    }
  }
);

LayerPreview.displayName = "LayerPreview";
