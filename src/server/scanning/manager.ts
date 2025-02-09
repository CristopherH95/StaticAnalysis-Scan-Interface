import { ScannerAdapter } from "./adapter";
import { mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from "node:child_process";
import multitoolPath from "@microsoft/sarif-multitool";

/**
 * Manager class responsible for executing multiple scanners
 * and aggregating the results from each of them into a single
 * SARIF results file.
 */
export class ScanAggregationManager {
    #scanTypes: Array<ScannerAdapter>;
    #runCounter: number;

    constructor(scanTypes: Array<ScannerAdapter>) {
        this.#scanTypes = scanTypes;
        this.#runCounter = 0;
    }

    /**
     * Executes all currently configured scanners on the given
     * target directory.
     * 
     * @param target The target directory.
     * @returns The path to the final SARIF results file.
     */
    public async runScanners(target: string): Promise<string> {
        const runDirectory = await mkdtemp(`scan-${this.#runCounter}`);

        for (const scanner of this.#scanTypes) {
            await scanner.scan(target, { resultsDirectory: runDirectory })
        }
        const finalFile = await this.#mergeFiles(runDirectory);

        return finalFile;
    }

    /**
     * Merges all files in the run directory.
     * 
     * @param runDirectory The current run directory.
     * @returns The path to the final merged file.
     */
    async #mergeFiles(runDirectory: string): Promise<string> {
        const finalFile = `${uuidv4()}.sarif`;
        await this.#executeMergeUtility(runDirectory, finalFile);
        return join(runDirectory, finalFile);
    }

    /**
     * Runs the sarif-multitool merge utility, in order to merge
     * multiple SARIF files into a single results file.
     * 
     * @param runDirectory The run directory to draw files from.
     * @param outputFile The name of the outpuf file.
     * @returns A promise wrapping the completion of the operation.
     */
    #executeMergeUtility(runDirectory: string, outputFile: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const utilityProcess = spawn(
                    multitoolPath, 
                    [join(runDirectory, "*.sarif"), `--output-directory=${runDirectory}`, `--output-file=${outputFile}`]
                );
                utilityProcess.on("close", (code) => {
                    if (code !== 0) {
                        reject(`Merge utility returned non-zero exit code: ${code}`);
                    } else {
                        resolve();
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}