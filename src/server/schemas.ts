import z from "zod";

export type ScanSchemaType = "azure" | "local-zip";

export interface ScanTypeData<I> {
    storage: ScanSchemaType;
    identification: I;
}

export const azureScanIDSchema = z.object({
    storage: z.literal<ScanSchemaType>("azure"),
    identification: z.object({
        containerId: z.string(),
        blobId: z.string()
    })
});

export const localZipScanIDSchema = z.object({
    storage: z.literal<ScanSchemaType>("local-zip"),
    identification: z.string()
});


export const initScanSchema = localZipScanIDSchema.or(azureScanIDSchema);
