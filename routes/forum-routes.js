const express = require("express");

const router = express.Router();

const postControllers = require("../controllers/posts-controllers");

router.get("/allPosts", postControllers.getAllPosts);

router.post("/post/createPost/:userId", postControllers.createPost);

router.get("/post/:postId", postControllers.getPostByPostId);

router.patch("/post/:postId/updatePost", postControllers.updatePostByPostId);

router.post("/post/:postId/addComment", postControllers.addCommentOnPostId);

module.exports = router;
