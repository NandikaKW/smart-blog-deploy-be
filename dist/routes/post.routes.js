"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controller_1 = require("../controllers/post.controller");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const User_1 = require("../models/User");
const upload_1 = require("../middleware/upload");
const ai_controller_1 = require("../controllers/ai.controller");
const route = (0, express_1.Router)();
route.post("/create", auth_1.authenticate, (0, role_1.requireRole)([User_1.Role.ADMIN, User_1.Role.AUTHOR]), upload_1.upload.single("image"), // form data key name
post_controller_1.savePost);
route.get("/", post_controller_1.getAllPost);
route.get("/me", auth_1.authenticate, (0, role_1.requireRole)([User_1.Role.ADMIN, User_1.Role.AUTHOR]), post_controller_1.getMyPost);
route.post("/ai/generate", ai_controller_1.genrateContent);
exports.default = route;
