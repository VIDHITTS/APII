module.exports = {
    testEnvironment: "node",
    setupFilesAfterEnv: ["./tests/setup.js"],
    verbose: true,
    testTimeout: 30000,
    forceExit: true,
    detectOpenHandles: false,
};
