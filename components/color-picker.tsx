"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReactNode } from "react";
import { HexColorPicker } from "react-colorful";

type Props = {
  color?: string;
  onChange: (value: string) => void;
  children: ReactNode;
  sideOffset?: number;
};

export const ColorPickerPopover = ({
  onChange,
  color,
  children,
  sideOffset = 18,
}: Props) => {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        sideOffset={sideOffset}
        className="w-full flex items-center justify-center"
      >
        <HexColorPicker color={color} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
};
