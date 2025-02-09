module.exports = {
    env: {
        browser: true
    },
    parser: "@typescript-eslint/parser",
    plugins: ["@codeque"],
    rules: {
        "@codeque/error": ["error", [
            {
                query: 'window.eval("$$$")',
                mode: "include",
                message: "[CWE-74] Improper Neutralization of Special Elements in Output Used by a Downstream Component"
            }
        ]]
    }
}