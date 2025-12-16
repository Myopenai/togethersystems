"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '..',
    testEnvironment: 'node',
    testRegex: '.e2e-spec.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@test/(.*)$': '<rootDir>/test/$1',
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/main.ts',
        '!**/*.module.ts',
        '!**/*.entity.ts',
        '!**/*.dto.ts',
        '!**/node_modules/**',
    ],
    coverageDirectory: './coverage',
    coverageReporters: ['text', 'lcov'],
    verbose: true,
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map