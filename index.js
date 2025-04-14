const { spawn } = require("child_process");
const logger = require("./utils/log");

function startBot(message) {
    if (message) logger(message, "[ Starting ]");
    
    const botProcess = spawn("node", ["--trace-warnings", "--async-stack-traces", "mirai.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    botProcess.on("close", (codeExit) => {
        if (codeExit != 0 || global.countRestart && global.countRestart < 5) {
            startBot("Restarting...");
            global.countRestart += 1;
        }
    });

    botProcess.on("error", (error) => {
        logger("An error occurred: " + JSON.stringify(error), "[ Bot ]");
    });
}

function startServer() {
    logger("Starting uptime server...", "[ Server ]");

    const serverProcess = spawn("node", ["server.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    serverProcess.on("error", (error) => {
        logger("Server error: " + JSON.stringify(error), "[ Server ]");
    });
}

startBot();
startServer();