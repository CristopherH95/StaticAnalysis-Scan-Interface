import { router, publicProcedure } from "./trpc";
import { scanInitSchema } from "./schemas";

const appRouter = router({
    scan: publicProcedure.input(scanInitSchema).mutation(async (opts) => {
        
    })
})

export type AppRouter = typeof appRouter;
