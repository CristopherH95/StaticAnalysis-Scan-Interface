import { promisify } from "util";
import { exec } from "child_process";
import { existsSync } from "fs";
import { ScannerAdapter } from "./adapter";


const execAsync = promisify(exec);

/**
 * Code scanner which uses the semgrep library to generate SARIF findings.
 */
export class SemGrepScanner extends ScannerAdapter {
    protected async runScan(target: string, resultsFile: string): Promise<void> {
        try {
            await execAsync(
                `semgrep scan --config \"p/cwe-top-25\" ${target} --sarif --json-output=${resultsFile}`
            );
            if (!existsSync(resultsFile)) {
                throw new TypeError("Results file not found");
            }
        } catch (error) {
            console.error("Failed to complete semgrep scan");
            throw error;
        }
    }
}