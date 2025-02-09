import { join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';


export interface ScannerConfig {
    resultsDirectory: string;
}

/**
 * Basic adapater class which abstracts away the internal logic required
 * to run an individual code scanner.
 */
export abstract class ScannerAdapter {
    /**
     * Executes the scanner on the given target directory.
     * 
     * @param target The target directory.
     * @param config The scanner configuration.
     * @returns A promise wrapping the path to the final results file.
     */
    public async scan(target: string, config: ScannerConfig): Promise<string> {
        const resultsFile = this.getResultsFilePath(config);
        await this.runScan(target, resultsFile);
        return resultsFile;
    }

    /**
     * Internally executes the scanner, saving the results into a given
     * results file path.
     * 
     * @param target The target directory to scan.
     * @param resultsFile The path to the results file.
     */
    protected abstract runScan(target: string, resultsFile: string): Promise<void>;

    /**
     * Generates a unique results file path.
     * 
     * @param config The current scanner config.
     * @returns The generated results file path.
     */
    protected getResultsFilePath(config: ScannerConfig): string {
        return join(config.resultsDirectory, `${uuidv4()}.sarif`);
    }
}