import AdmZip from "adm-zip";
import { StorageAdapter } from "./adapter";
import { extractFilesTo } from "../utils/file-system";


/**
 * Storage interface for working with locally available zip files.
 */
export class LocalZipStorage extends StorageAdapter {
    protected async downloadFiles(id: string, directory: string): Promise<void> {
        const archive = new AdmZip(id);
        await extractFilesTo(archive, directory);
    }
}