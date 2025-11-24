"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = exports.registerAdmin = exports.getMyDetails = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const tokens_1 = require("../utils/tokens");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const register = async (req, res) => {
    try {
        const { firstname, lastname, email, password, role } = req.body;
        // data validation
        if (!firstname || !lastname || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (role !== User_1.Role.USER && role !== User_1.Role.AUTHOR) {
            return res.status(400).json({ message: "Invalid role" });
        }
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email alrady registered" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const approvalStatus = role === User_1.Role.AUTHOR ? User_1.Status.PENDING : User_1.Status.APPROVED;
        const newUser = new User_1.User({
            firstname, // firstname: firstname
            lastname,
            email,
            password: hashedPassword,
            roles: [role],
            approved: approvalStatus
        });
        await newUser.save();
        res.status(201).json({
            message: role === User_1.Role.AUTHOR
                ? "Author registered successfully. waiting for approvel"
                : "User registered successfully",
            data: {
                id: newUser._id,
                email: newUser.email,
                roles: newUser.roles,
                approved: newUser.approved
            }
        });
    }
    catch (err) {
        res.status(500).json({ message: err?.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User_1.User.findOne({ email });
        if (!existingUser) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const valid = await bcryptjs_1.default.compare(password, existingUser.password);
        if (!valid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        //create jwt token
        const accessToken = (0, tokens_1.signAccessToken)(existingUser);
        const refreshToken = (0, tokens_1.signRefreshToken)(existingUser);
        res.status(200).json({
            message: "success",
            data: {
                email: existingUser.email,
                roles: existingUser.roles,
                accessToken,
                refreshToken
            }
        });
    }
    catch (err) {
        res.status(500).json({ message: err?.message });
    }
};
exports.login = login;
const getMyDetails = async (req, res) => {
    // const roles = req.user.roles
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user.sub;
    const user = (await User_1.User.findById(userId).select("-password")) || null;
    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }
    const { firstname, lastname, email, roles, approved } = user;
    res.status(200).json({
        message: "Ok",
        data: { firstname, lastname, email, roles, approved }
    });
};
exports.getMyDetails = getMyDetails;
const registerAdmin = (req, res) => {
};
exports.registerAdmin = registerAdmin;
const refreshAccessToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const payload = jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
        // obtain the userID
        const user = await User_1.User.findById(payload.sub);
        if (!user) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const accessToken = (0, tokens_1.signAccessToken)(user);
        res.status(200).json({ accessToken });
    }
    catch (err) {
        res.status(500).json({ message: err?.message });
    }
};
exports.refreshAccessToken = refreshAccessToken;
