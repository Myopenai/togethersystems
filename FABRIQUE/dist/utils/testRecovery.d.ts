declare class TestRecovery {
    private testDir;
    private testFile;
    runTests(): Promise<void>;
    private testDirectoryRecovery;
    private testMonitoring;
    private cleanup;
}
export { TestRecovery };
