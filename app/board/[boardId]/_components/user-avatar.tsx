import { Hint } from "@/components/hint";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOther, useOthers } from "@/liveblocks.config";
import { Camera } from "@/types/canvas";

interface UserAvatarProps {
  src?: string;
  name?: string;
  fallback?: string;
  borderColor?: string;
  onClick?: (camera: Camera) => void;
  connectionId?: number;
}

export const UserAvatar = ({
  borderColor,
  fallback,
  name,
  src,
  connectionId,
  onClick,
}: UserAvatarProps) => {
  const others = useOthers();

  return (
    <Hint label={name ?? "Teameate"} side="bottom" sideOffset={18}>
      <Avatar
        onClick={() => {
          if (others && onClick && connectionId) {
            const position = others.find((e) => e.connectionId == connectionId)
              ?.presence.cursor;
            if (!position) return;
            onClick({
              x: position!.x,
              y: position!.y,
            });
          }
        }}
        className="size-8 border-2"
        style={{ borderColor }}
      >
        <AvatarImage src={src} />
        <AvatarFallback className="text-xs font-semibold">
          {fallback}
        </AvatarFallback>
      </Avatar>
    </Hint>
  );
};
