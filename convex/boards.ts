import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAllOrThrow } from "convex-helpers/server/relationships";
export const get = query({
  args: {
    orgId: v.string(),
    search: v.optional(v.string()),
    favorites: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identy = await ctx.auth.getUserIdentity();
    if (!identy) {
      throw new Error("Unauthorized");
    }
    if (args.favorites) {
      const favorteBoards = await ctx.db
        .query("userFavorites")
        .withIndex("by_user_org", (q) =>
          q.eq("userId", identy.subject).eq("orgId", args.orgId)
        )
        .order("desc")
        .collect();
      const ids = favorteBoards.map((b) => b.boardId);
      const boards = await getAllOrThrow(ctx.db, ids);
      return boards.map((board) => ({
        ...board,
        isFavorite: true,
      }));
    }
    const title = args.search as string;
    let boards = [];
    if (title) {
      boards = await ctx.db
        .query("boards")
        .withSearchIndex("search_title", (q) =>
          q.search("title", title).eq("orgId", args.orgId)
        )
        .collect();
    } else {
      boards = await ctx.db
        .query("boards")
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
        .order("desc")
        .collect();
    }

    const boardsWithaFavoriteRelacion = boards.map((board) => {
      return ctx.db
        .query("userFavorites")
        .withIndex("by_user_board", (q) =>
          q.eq("userId", identy.subject).eq("boardId", board._id)
        )
        .unique()
        .then((favorite) => {
          return {
            ...board,
            isFavorite: !!favorite,
          };
        });
    });
    const boardWithFavoriteBolean = await Promise.all(
      boardsWithaFavoriteRelacion
    );
    return boardWithFavoriteBolean;
  },
});
