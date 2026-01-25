import type { CommandContext } from "./types";

export type Middleware = (ctx: CommandContext, next: () => Promise<void>) => Promise<void>;

export function compose(middlewares: Middleware[]): (ctx: CommandContext, final: () => Promise<void>) => Promise<void> {
    return async (ctx, final) => {
        let index = -1;

        const dispatch = async (i: number): Promise<void> => {
            if (i <= index) throw new Error("next() called multiple times");
            index = i;

            const fn = i === middlewares.length ? final : middlewares[i];
            if (!fn) return;

            await fn(ctx, () => dispatch(i + 1));
        };

        await dispatch(0);
    };
}
