const express = require("express");
const os = require("os");
const moment = require("moment");
const path = require("path");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let startTime = moment();
let previousCPUMeasurement = {
    totalIdle: 0,
    totalTick: 0
};

// Hàm tính CPU usage chính xác
function getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0,
        totalTick = 0;

    cpus.forEach(cpu => {
        for (let type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    });

    const deltaIdle = totalIdle - previousCPUMeasurement.totalIdle;
    const deltaTotal = totalTick - previousCPUMeasurement.totalTick;
    const cpuUsage = 100 - (100 * deltaIdle / deltaTotal);

    previousCPUMeasurement = {
        totalIdle,
        totalTick
    };

    return cpuUsage;
}

// Route API
app.get("/uptime", (req, res) => {
    const uptimeSeconds = moment().diff(startTime, "seconds");
    const memoryUsed = os.totalmem() - os.freemem();
    const cpuLoad = getCPUUsage();

    res.json({
        status: "running",
        uptime: uptimeSeconds,
        cpuLoad: parseFloat(cpuLoad.toFixed(2)),
        memoryUsage: Math.round(memoryUsed / (1024 * 1024)),
        totalMemory: Math.round(os.totalmem() / (1024 * 1024)),
        timestamp: moment().format()
    });
});

// SSH Proxy Endpoint
app.post("/ssh-proxy", (req, res) => {
    res.json({ 
        status: "ready",
        message: "SSH connections should be made via WebSocket"
    });
});

// Route chính - phục vụ file HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket for terminal
io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });

    socket.on("ssh-connect", (data) => {
        console.log("SSH connection requested to", data.host);
    });

    socket.on("ssh-command", (command) => {
        console.log("Command received:", command);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`API uptime: http://localhost:${PORT}/uptime`);
    console.log(`WebSocket ready at ws://localhost:${PORT}`);
});