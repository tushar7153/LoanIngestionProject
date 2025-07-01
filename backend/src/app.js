"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const loanRoutes_1 = __importDefault(require("./routes/loanRoutes"));
const wsServer_1 = require("./websocket/wsServer");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/loan", loanRoutes_1.default);
mongoose_1.default.connect(process.env.MONGO_URI)
    .then(() => {
    console.log("MongoDB connected");
    const server = app.listen(PORT, () => console.log(`Server on port ${PORT}`));
    (0, wsServer_1.initWebSocket)(server); // attach WebSocket
})
    .catch(err => console.error(err));
