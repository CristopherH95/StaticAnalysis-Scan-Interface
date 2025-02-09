import { ESLint, Linter, Rule } from "eslint";
import { SarifBuilder, SarifResultBuilder, SarifRuleBuilder, SarifRunBuilder } from "node-sarif-builder";
import { relative } from "path";
import { getProjectRoot } from "../utils/file-system";


export type SeverityLabel = "warning" | "error" | "note";

/**
 * Class responsible for translating eslint data to SARIF
 */
export class EslintSarifTranslator {
    protected builder: SarifBuilder;

    constructor() {
        this.builder = new SarifBuilder();
    }

    /**
     * Renders the current translation out to
     * JSON SARIF.
     * 
     * @returns A JSON string.
     */
    public getJSON(): string {
        return this.builder.buildSarifJsonString();
    }

    /**
     * Translates eslint results, and optionally an eslint config,
     * to a SARIF run.
     * 
     * @param results The eslint results to translate.
     * @param lint The optional lint config to include.
     */
    public initFromEslint(results: Array<ESLint.LintResult>, lint?: ESLint) {
        const runBuilder = new SarifRunBuilder();
        runBuilder.initSimple({
            toolDriverName: "web-tool-scanner",
            toolDriverVersion: "0.0.0",
        });
        if (lint) {
            this.initRulesFromEslint(runBuilder, results, lint);
        }
        this.initResultsFromEslint(runBuilder, results);
        this.builder.addRun(runBuilder);
    }

    /**
     * Translates an eslint config into a series of SARIF rules.
     * 
     * @param run The sarif run to attach the translation to.
     * @param results The results to draw the rules from.
     * @param lint The eslint config to use to retrieve the rules.
     */
    protected initRulesFromEslint(run: SarifRunBuilder, results: Array<ESLint.LintResult>, lint: ESLint) {
        const rulesMeta = lint.getRulesMetaForResults(results);

        for (const ruleId in rulesMeta) {
            this.initEslintRule(run, ruleId, rulesMeta[ruleId]);
        }
    }

    /**
     * Translates an individual eslint rule to a SARIF rule.
     * 
     * @param run The run to attach the rule to.
     * @param ruleId The ID of the eslint rule.
     * @param data The eslint rule metadata.
     */
    protected initEslintRule(run: SarifRunBuilder, ruleId: string, data: Rule.RuleMetaData) {
        const ruleBuilder = new SarifRuleBuilder();
        ruleBuilder.initSimple({
            ruleId,
            shortDescriptionText: data.docs?.description || "Custom ESLint rule.",
            helpUri: data.docs?.url
        });
        run.addRule(ruleBuilder);
    }

    /**
     * Translates eslint results into SARIF results.
     * 
     * @param run The run to attach the results to.
     * @param results The eslint results to translate.
     */
    protected initResultsFromEslint(run: SarifRunBuilder, results: Array<ESLint.LintResult>) {
        for (const resultData of results) {
            for (const message of resultData.messages) {
                this.initEslintResult(run, resultData, message);
            }
        }
    }

    /**
     * Translates an individual eslint message into a SARIF result.
     * 
     * @param run The run to attach the result to.
     * @param result The eslint result the message is drawn from.
     * @param message The eslint message to translate.
     */
    protected initEslintResult(run: SarifRunBuilder, result: ESLint.LintResult, message: Linter.LintMessage) {
        if (!message.ruleId) {
            console.warn(`Skipping message "${message.message}" as ruleId is null`);
            return;
        }

        const filePath = relative(getProjectRoot(), result.filePath);
        const resultBuilder = new SarifResultBuilder();
        resultBuilder.initSimple({
            level: EslintSarifTranslator.getSeverityLabel(message.severity),
            messageText: message.message,
            ruleId: message.ruleId,
            fileUri: filePath,
            startLine: message.line,
            startColumn: message.column,
            endLine: message.endLine,
            endColumn: message.endColumn
        });
        run.addResult(resultBuilder);
    }

    /**
     * Utility method which translates eslint severity numbers to SARIF severity
     * labels.
     * 
     * @param severity The severity number to translate.
     * @returns The label for the number.
     */
    protected static getSeverityLabel(severity: number): SeverityLabel {
        switch (severity) {
            case 1:
                return "warning";
        
            case 2:
                return "error";

            default:
                return "note";
        }
    }
}