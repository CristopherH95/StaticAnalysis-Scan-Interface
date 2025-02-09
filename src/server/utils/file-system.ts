import AdmZip from "adm-zip";
import { dirname } from "path";
import { readFile } from "fs/promises";


/**
 * Extracts all of the files contained within the given compressed archive to a given target path.
 * 
 * @param compressed The archive to unpack.
 * @param target The target path.
 * @returns A promise wrapping the completion of the operation.
 */
export function extractFilesTo(compressed: AdmZip, target: string): Promise<void> {
    return new Promise((resolve, reject) => {
        compressed.extractAllToAsync(target, true, false, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Utility function which retrieves the current project root, based on
 * the current module's location.
 * 
 * @returns The project root file path.
 */
export function getProjectRoot(): string {
    return dirname(
        dirname(
            dirname(__dirname)
        )
    );
}

/**
 * Simple helper function which asynchronously reads in a JSON file to memory.
 * 
 * @param filePath The path to the file to read.
 * @returns The parsed file contents.
 */
export async function readJSONFile<O = object>(filePath: string): Promise<O> {
    const fileContent = await readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
}