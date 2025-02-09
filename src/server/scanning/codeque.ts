import { ESLint } from "eslint";
import { ScannerAdapter } from "./adapter";
import { EslintSarifTranslator } from "./sarif";
import { writeFile } from "fs/promises";
import { rules } from "./rules/codeque";

/**
 * Code scanner which uses the codeque linting library, integrated
 * with eslint, to generate SARIF findings.
 */
export class CodeQueScanner extends ScannerAdapter {
    protected async runScan(target: string, resultsFile: string): Promise<void> {
        const eslintEngine = new ESLint({ 
            cwd: target,
            baseConfig: {
                plugins: {"@codeque": {}},
                rules
            }
        });
        const results = await eslintEngine.lintFiles(["*.js", "*.ts"]);
        const translator = new EslintSarifTranslator();
        translator.initFromEslint(results, eslintEngine);
        await writeFile(resultsFile, translator.getJSON());
    }
}
