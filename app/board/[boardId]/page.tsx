import { Canvas } from "./_components/canvas";
import { Room } from "@/components/room";
import { Loading } from "./_components/loading";
type Props = {
  params: {
    boardId: string;
  };
};

export default function BoardIdPage({ params }: Props) {
  return (
    <Room fallback={<Loading />} roomId={params.boardId}>
      <Canvas boardId={params.boardId} />
    </Room>
  );
}
