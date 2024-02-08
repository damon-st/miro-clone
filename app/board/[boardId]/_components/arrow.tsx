import { colorToCss } from "@/lib/utils";
import { ArrowLayer } from "@/types/canvas";
import { ArrowRight } from "lucide-react";
import React from "react";

interface ArrowProps {
  id: string;
  layer: ArrowLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Arrow = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: ArrowProps) => {
  const { x, y, height, width, fill, flip } = layer;
  const filt = !!flip ? -1 : 1;
  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        outline: selectionColor ? `1px solid ${selectionColor}` : "none",
      }}
    >
      <svg
        width={width}
        height={height}
        x={x}
        y={y}
        style={{ transform: `scaleX(${filt})` }}
      >
        <defs>
          <marker
            id="head"
            orient="auto"
            markerWidth="10" // Ancho del marcador
            markerHeight="10" // Alto del marcador
            refX="0.1"
            refY="5"
          >
            <path
              d="M0,0 V10 L10,5 Z"
              fill={fill ? colorToCss(fill) : "#000"}
            />
          </marker>
        </defs>

        <line
          x={x}
          y={y}
          x1={0}
          y1={height / 2}
          x2={width - 40} // Ancho del SVG - Ancho del marcador
          y2={height / 2}
          markerEnd="url(#head)"
          strokeWidth="4"
          stroke={fill ? colorToCss(fill) : "#000"}
          fill="none"
        />
      </svg>
    </foreignObject>
  );
};
