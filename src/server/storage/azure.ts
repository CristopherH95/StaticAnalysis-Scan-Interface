import { v4 as uuidv4 } from 'uuid';
import { BlobClient, BlobServiceClient } from "@azure/storage-blob";
import { StorageAdapter } from "./adapter";
import { join } from 'path';
import { createWriteStream } from 'fs';
import AdmZip from 'adm-zip';
import { extractFilesTo } from '../utils/file-system';
import { unlink } from 'fs/promises';


export interface BlobIdentification {
    containerId: string;
    blobId: string;
}


/**
 * Azure storage download interface.
 */
export class AzureStorage extends StorageAdapter<BlobIdentification> {
    /**
     * Downloads files using the Azure cloud client.
     * 
     * @param identification Identification data needed to locate the blob to download.
     * @param directory The target directory to download files to.
     */
    protected async downloadFiles(identification: BlobIdentification, directory: string): Promise<void> {
        const blobClient = this.#getBlobClient(identification);
        const archivePath = await this.#writeDownload(blobClient, directory);
        const archive = new AdmZip(archivePath);
        await extractFilesTo(archive, directory);
        await unlink(archivePath);
    }

    /**
     * Retrieves a blob client, capable of downloading a specific blob in Azure storage.
     * 
     * @param identification Identification data used to locate the blob.
     * @returns The client instance.
     */
    #getBlobClient(identification: BlobIdentification): BlobClient {
        const blobService= this.#getBlobService();
        const containerClient = blobService.getContainerClient(identification.containerId);
        const blobClient = containerClient.getBlobClient(identification.blobId);
        return blobClient
    }

    /**
     * Generates an instance of an Azure BlobServiceClient, for interacting with the Azure storage service.
     * 
     * @returns The service client.
     */
    #getBlobService(): BlobServiceClient {
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_URL;
        if (!connectionString) {
            throw new Error("Environment variable AZURE_STORAGE_CONNECTION_URL is not defined!");
        }
        return BlobServiceClient.fromConnectionString(connectionString);
    }

    /**
     * Downloads an Azure blob to the given directory.
     * 
     * @param client The azure blob client to use to trigger the download.
     * @param directory The target directory for the download.
     * @returns The full file path for the downloaded blob.
     */
    async #writeDownload(client: BlobClient, directory: string): Promise<string> {
        const fileName = uuidv4();
        const fullFilePath = join(directory, fileName);
        const writeStream = createWriteStream(fullFilePath);
        const downloadResponse = await client.download();
        downloadResponse.readableStreamBody?.pipe(writeStream);
        return fullFilePath;
    }
}

