module.exports = {
    parser: "babel",
    trailingComma: "none",
    useTabs: false,
    tabWidth: 4,
    semi: true,
    bracketSpacing: false,
    printWidth: 90,
    overrides: [
        {
            files: "package.json",
            options: {
                tabWidth: 2,
                parser: "json"
            }
        }
    ]
};
