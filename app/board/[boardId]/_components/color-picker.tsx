"use client";

import { ColorPickerPopover } from "@/components/color-picker";
import { Hint } from "@/components/hint";
import { colorToCss, hexToRgb } from "@/lib/utils";
import { Color } from "@/types/canvas";
import { Palette } from "lucide-react";

interface ColorPickerPrpps {
  onChange: (color: Color) => void;
}

export const ColorPicker = ({ onChange }: ColorPickerPrpps) => {
  return (
    <div className="flex flex-wrap gap-2 items-center max-w-[164px] pr-2 mr-2 border-r border-neutral-200">
      <ColorButton color={{ r: 243, g: 82, b: 35 }} onClick={onChange} />
      <ColorButton color={{ r: 255, g: 249, b: 177 }} onClick={onChange} />
      <ColorButton color={{ r: 68, g: 202, b: 99 }} onClick={onChange} />
      <ColorButton color={{ r: 39, g: 142, b: 237 }} onClick={onChange} />
      <ColorButton color={{ r: 155, g: 105, b: 245 }} onClick={onChange} />
      <ColorButton color={{ r: 252, g: 142, b: 42 }} onClick={onChange} />
      <ColorButton color={{ r: 0, g: 0, b: 0 }} onClick={onChange} />
      <ColorButton color={{ r: 255, g: 255, b: 255 }} onClick={onChange} />
      <ColorPickerPopover
        onChange={(s) => {
          console.log(s);
          onChange(hexToRgb(s));
        }}
      >
        <div className="size-8 rounded-md bg-blue-100 flex items-center justify-center cursor-pointer">
          <Palette className="text-blue-600" />
        </div>
      </ColorPickerPopover>
    </div>
  );
};

interface ColorButtonProps {
  onClick: (color: Color) => void;
  color: Color;
}

const ColorButton = ({ color, onClick }: ColorButtonProps) => {
  return (
    <button
      type="button"
      className="size-8 items-center flex justify-center hover:opacity-75 transition"
      onClick={() => onClick(color)}
    >
      <div
        className="size-8 rounded-md border-neutral-300 border"
        style={{ background: colorToCss(color) }}
      />
    </button>
  );
};
