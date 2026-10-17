module.exports = [
"[turbopack-node]/transforms/postcss.ts?config=[project]/postcss.config.mjs { CONFIG => \"[project]/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "chunks/02eu_1mk3sjkkfdbhk._.js",
  "chunks/[root-of-the-server]__1kki86fknkq7y._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts?config=[project]/postcss.config.mjs { CONFIG => \"[project]/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];