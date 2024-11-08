module.exports = {
    root: true,
    env: {
        node: true,
        browser: true,
        es6: true,
        jest: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    },
    rules: {
        'no-console': 'warn'
    },
    overrides: [
        {
            files: ['src/server/**/*.js'],
            env: {
                node: true,
                es6: true
            },
            parserOptions: {
                sourceType: 'module'
            }
        },
        {
            files: ['src/client/src/**/*.{js,jsx}'],
            env: {
                browser: true,
                es6: true
            },
            parserOptions: {
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true
                }
            }
        }
    ]
};
