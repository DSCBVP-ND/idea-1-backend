const express = require("express");
const router = express.Router();
const db = require("../../firebase/firebase-db");
const auth = require("../../middleware/auth");
const admin = require("firebase-admin");

// @route    GET api/comments/:commentId
// @desc     get comment by id
// @access   Public
router.get("/:commentId", async (req, res)=>{
    try {
        let commentId = req.params.commentId;
        let commentRef = db.collection("comments").doc(commentId);
        let comment = await commentRef.get();

        if(comment.exists) {
            return res.status(200).json({
                "message": "Comment found",
                comment: comment.data()
            });
        } else {
            throw new Error("comment doesn't exist");
        }
    } catch(err) {
        console.log(`Error occured while returning comment ${err}`);
        res.status(500).send("Server Error");
    }
})

// @route    POST api/comments/
// @desc     create comment
// @access   Private
router.post("/", auth, async (req, res)=> {
    try {   
        let commentRef = db.collection("comments").doc();
        let comment = await commentRef.set(req.body);

        let postRef = db.collection("posts").doc(req.body.postId);
        let post = await postRef.get();

        if(post.exists) {
            await postRef.update({
                comments: admin.firestore.FieldValue.arrayUnion(commentRef.id)
            }, {
                merge: true
            })
        } else {
            throw new Error("post doesn't exist");
        }

        return res.status(200).json({
            "message": "Comment created",
            comment: {
                id: commentRef.id,
                ...req.body
            }
        })
    } catch(err) {
        console.log(`Error occured while creating a comment ${err}`);
        res.status(500).send("Server Error");
    }
})

module.exports = router;