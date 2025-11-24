"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.register);
router.post("/login", auth_controller_1.login);
router.post("/refresh", auth_controller_1.refreshAccessToken);
// protected (USER, AUTHOR, ADMIN)
// requireRole([Role.USER])
router.get("/me", auth_1.authenticate, auth_controller_1.getMyDetails);
// protected
// ADMIN only
// need create middleware for check req is from ADMIN
//   requireRole([Role.ADMIN, Role.AUTHOR]) // for admin and author both can access
router.post("/admin/register", auth_1.authenticate, (0, role_1.requireRole)([User_1.Role.ADMIN]), auth_controller_1.registerAdmin);
// Refresh token end point
exports.default = router;
