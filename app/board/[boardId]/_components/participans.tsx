"use client";

import { connectionIdToColor } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";

import { useOther, useOthers, useSelf } from "@/liveblocks.config";
import { Camera } from "@/types/canvas";

const MAX_SHOW_USERS = 2;
type Props = {
  onUserCamera: (camera: Camera) => void;
};

export const Participans = ({ onUserCamera }: Props) => {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > MAX_SHOW_USERS;

  return (
    <div className="absolute h-12 top-2 right-2 bg-white rounded-md p-3 flex items-center  shadow-md">
      <div className="flex gap-x-2">
        {users.slice(0, MAX_SHOW_USERS).map(({ connectionId, info }) => (
          <UserAvatar
            onClick={onUserCamera}
            connectionId={connectionId}
            borderColor={connectionIdToColor(connectionId)}
            key={connectionId}
            src={info?.picture}
            name={info?.name}
            fallback={info?.name?.[0] ?? "T"}
          />
        ))}
        {currentUser && (
          <UserAvatar
            borderColor={connectionIdToColor(currentUser.connectionId)}
            src={currentUser.info?.picture}
            name={`${currentUser.info?.name} (YOU)`}
            fallback={currentUser.info?.name?.[0]}
          />
        )}
        {hasMoreUsers && (
          <UserAvatar
            name={`${users.length - MAX_SHOW_USERS} more`}
            fallback={`+${users.length - MAX_SHOW_USERS}`}
          />
        )}
      </div>
    </div>
  );
};

export function ParticipansSkeleton() {
  return (
    <div className="absolute h-12 top-2 right-2 bg-white rounded-md p-3 flex items-center  shadow-md w-[100px]" />
  );
}
