import { Linter } from "eslint";

export const rules: Linter.RulesRecord = {
    "@codeque/error": ["error", [
        {
            query: 'window.eval("$$$")',
            mode: "include",
            message: "[CWE-74] Improper Neutralization of Special Elements in Output Used by a Downstream Component"
        }
    ]]
};