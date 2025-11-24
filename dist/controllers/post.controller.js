"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyPost = exports.getAllPost = exports.savePost = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const Post_1 = require("../models/Post");
const savePost = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { title, content, tags } = req.body;
        let imageURL = "";
        if (req.file) {
            const result = await new Promise((resole, reject) => {
                const upload_stream = cloudinary_1.default.uploader.upload_stream({ folder: "posts" }, (error, result) => {
                    if (error) {
                        console.error(error);
                        return reject(error);
                    }
                    resole(result); // success return
                });
                upload_stream.end(req.file?.buffer);
            });
            imageURL = result.secure_url;
        }
        // "one,two,tree"
        const newPost = new Post_1.Post({
            title,
            content,
            tags: tags.split(","),
            imageURL,
            author: req.user.sub // from auth middleware
        });
        await newPost.save();
        res.status(201).json({
            message: "Post created",
            data: newPost
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Fail to save post" });
    }
};
exports.savePost = savePost;
// GET http://localhost:5000/api/v1/post?page=1&limit=10
// GET http://localhost:5000/api/v1/post?page=1&limit=2
const getAllPost = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // const posts = await Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
        const posts = await Post_1.Post.find()
            .populate("author", "email") // related model data
            .sort({ createdAt: -1 }) // desc order
            .skip(skip) // ignore data for pagination
            .limit(limit); // data count for currently need
        const total = await Post_1.Post.countDocuments();
        res.status(200).json({
            message: "Posts data",
            data: posts,
            totalPages: Math.ceil(total / limit),
            totalCount: total,
            page
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Fail to fetch post" });
    }
};
exports.getAllPost = getAllPost;
const getMyPost = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // const posts = await Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
        const posts = await Post_1.Post.find({ author: req.user.sub })
            .sort({ createdAt: -1 }) // desc order
            .skip(skip) // ignore data for pagination
            .limit(limit); // data count for currently need
        const total = await Post_1.Post.countDocuments();
        res.status(200).json({
            message: "Posts data",
            data: posts,
            totalPages: Math.ceil(total / limit),
            totalCount: total,
            page
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Fail to fetch post" });
    }
};
exports.getMyPost = getMyPost;
