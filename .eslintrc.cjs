/* eslint-env node */
module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:prettier/recommended'
    ],
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
        'prettier'
    ],
    root: true,
    rules: {
        "semi": ["error", "never"],
        "@typescript-eslint/semi": ["error", "never"],
        "prettier/prettier": ["error", {
            "semi": false,
            "singleQuote": true // This is an example; adjust other Prettier options
        }]
    }
};