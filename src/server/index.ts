import { router, publicProcedure } from "./trpc";
import { initScanSchema, ScanSchemaType, ScanTypeData } from "./schemas";
import { StorageAdapter } from "./storage/adapter";
import { AzureStorage } from "./storage/azure";
import { LocalZipStorage } from "./storage/local-zip";
import { ScanAggregationManager } from "./scanning/manager";
import { CodeQueScanner } from "./scanning/codeque";
import { readJSONFile } from "./utils/file-system";

function getStorageBackend(storageType: ScanSchemaType): StorageAdapter<unknown> {
    switch (storageType) {
        case "azure":
            return new AzureStorage()
    
        case "local-zip":
            return new LocalZipStorage();

        default:
            throw new TypeError(`Unexpected storage type "${storageType}"`);
    }
}

async function runScans(targetDirectory: string): Promise<object> {
    const manager = new ScanAggregationManager([
        new CodeQueScanner(),
        // TODO: add the semgrep scanner here
    ]);
    try {
        const resultsFile = await manager.runScanners(targetDirectory);
        const resultsObject = await readJSONFile(resultsFile);    
        return resultsObject;
    } catch (error) {
        console.error("Failed to complete scanning process");
        throw new Error("Backend scanning failure");
    }
}

const appRouter = router({
    scan: publicProcedure.input(initScanSchema).mutation(async (opts) => {
        const { input } = opts;
        try {
            const storageBackend = getStorageBackend(input.storage);
            const sourceFiles = await storageBackend.getFiles(input.identification);
            return {
                success: true,
                payload: await runScans(sourceFiles)
            };
        } catch (error) {
            console.error("Failed to respond to scan request");
            return {
                success: false,
                payload: String(error)
            };
        }
        
    })
})

export type AppRouter = typeof appRouter;
