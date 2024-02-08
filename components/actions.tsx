"use client";

import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { ConfirmModal } from "./confirm-modal";
import { Button } from "./ui/button";
import { useRenameModal } from "@/store/use-rename-modal";
interface ActionsProps {
  children: ReactNode;
  side?: DropdownMenuContentProps["side"];
  sideOffset?: DropdownMenuContentProps["sideOffset"];
  id: string;
  title: string;
}

export const Actions = ({
  children,
  id,
  title,
  side,
  sideOffset,
}: ActionsProps) => {
  const { onOpen } = useRenameModal();
  const { mutate, pending } = useApiMutation(api.board.remove);
  const onCopy = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/board/${id}`)
      .then(() => toast.success("Linked copied"))
      .catch(() => toast.error("Failed to copy link"));
  };
  const onDelete = () => {
    mutate({
      id,
    })
      .then(() => toast.success("Board delete"))
      .catch(() => toast.error("Something wrong"));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        sideOffset={sideOffset}
        className="w-60"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem onClick={onCopy} className="p-3 cursor-pointer">
          <Link2 className="size-4 mr-2" />
          Copy board Link
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onOpen(id, title)}
          className="p-3 cursor-pointer"
        >
          <Pencil className="size-4 mr-2" />
          Rename
        </DropdownMenuItem>
        <ConfirmModal
          onConfirm={onDelete}
          header="Delete board?"
          description="This will delete board and all of its contents."
          disabled={pending}
        >
          <Button
            variant="ghost"
            className="p-3 cursor-pointer w-full flex justify-start"
          >
            <Trash2 className="size-4 mr-2" />
            Delete
          </Button>
        </ConfirmModal>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
