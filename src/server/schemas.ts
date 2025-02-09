import z from "zod";


export const scanInitSchema = z.object({
    identification: z.object({
        containerId: z.string(),
        blobId: z.string()
    })
});