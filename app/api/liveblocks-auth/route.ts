import { api } from "@/convex/_generated/api";
import { auth, currentUser } from "@clerk/nextjs";
import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const liveBlocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { userId, orgId } = auth();
    const user = await currentUser();
    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { room } = await req.json();

    const board = await convex.query(api.board.get, { id: room });

    if (board?.orgId !== orgId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const userInfo = {
      name: user.firstName ?? "Teameate",
      picture: user.imageUrl,
    };
    const session = liveBlocks.prepareSession(user.id, { userInfo });

    if (room) {
      session.allow(room, session.FULL_ACCESS);
    }

    const { status, body } = await session.authorize();
    return new NextResponse(body, { status });
  } catch (error) {
    console.log("[ERROR_LIVEBLOCKS_AUTH]", error);

    return new NextResponse("Internal error", { status: 500 });
  }
}
