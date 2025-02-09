import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtemp } from 'node:fs/promises';


/**
 * Generic storage adapter, used to abstract the low level operations
 * used to retrieve files.
 */
export abstract class StorageAdapter<I = string> {

    /**
     * Retrieve files based on an ID value.
     * 
     * @param identification The ID value to use to lookup the files.
     * @returns A string representing the directory containing the files.
     */
    public async getFiles(identification: I): Promise<string> {
        const tempDir = await this._getTempDirectory();
        await this.downloadFiles(identification, tempDir);
        return tempDir;
    }

    protected abstract downloadFiles(id: I, directory: string): Promise<void>;

    /**
     * Utility method which generates a temp directory to download files to.
     * 
     * @returns The temp directory path, wrapped in a promise.
     */
    protected async _getTempDirectory(): Promise<string> {
        return await mkdtemp(join(tmpdir(), "scanner-"));
    }
}