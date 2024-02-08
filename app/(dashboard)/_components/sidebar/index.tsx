import { List } from "./list";
import { NewButton } from "./new-button";

type Props = {};

export default function Sidebar({}: Props) {
  return (
    <aside className="fixed z-[1] left-0 bg-blue-950 h-full w-[60px] p-3 flex-col flex gap-y-4 text-white">
      <List />
      <NewButton />
    </aside>
  );
}
