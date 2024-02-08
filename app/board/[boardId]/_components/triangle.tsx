import { colorToCss } from "@/lib/utils";
import { TriangleLayer } from "@/types/canvas";
import React from "react";

interface TriangleProps {
  id: string;
  layer: TriangleLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Triangle = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: TriangleProps) => {
  const { x, y, height, width, fill } = layer;

  return (
    <polygon
      points={` ${width / 2},10 ${width - 10},${height - 10} 10,${height - 10}`}
      className="drop-shadow-md"
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        transform: `translate(${x}px,${y}px)`,
      }}
      x={0}
      y={0}
      width={width}
      height={height}
      strokeWidth={1}
      fill={fill ? colorToCss(fill) : "#000"}
      stroke={selectionColor ?? "transparent"}
    />
  );
};
