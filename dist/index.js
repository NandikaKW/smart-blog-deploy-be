"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const SERVER_PORT = process.env.SERVER_PORT;
const MONGO_URI = process.env.MONGO_URI;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/post", post_routes_1.default);
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => {
    console.log("DB connected");
})
    .catch((err) => {
    console.error(`DB connection fail: ${err}`);
    process.exit(1);
});
app.listen(SERVER_PORT, () => {
    console.log(`Server is running on ${SERVER_PORT}`);
});
