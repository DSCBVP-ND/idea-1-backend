const express = require("express");
const router = express.Router();
const db = require("../../firebase/firebase-db");
const auth = require("../../middleware/auth");
const firebase  = require('firebase');
const { firestore } = require("firebase-admin");

// @route    GET api/posts/allPosts
// @desc     show all posts
// @access   Public
router.get("/allPosts", async (req, res) => {
  try {
    const allPost = [];
    const response = await db.collection("posts").get();

    await response.forEach(async (doc) => {
      // const comments = [];
      const comments = await doc.data().comments.map(async (commentRef)=>{
        // console.log(commentRef)
        const commentDoc = await commentRef.get();
        const commentData = commentDoc.data();
        const userRef =  await commentData.userId.get();
        const user = userRef.data();
        const comment = {
          id: commentDoc.id,
          comment: commentData.comment,
          user: {id: userRef.id, ...user}
        };
        return comment;
      })

      await allPost.push({ 
        id: doc.id, 
        creator: doc.data().creator, 
        dislikes: doc.data().dislikes, 
        likes: doc.data.likes, 
        postText: doc.data().postText, 
        comments
      });
    });

    res.status(200).json({ posts: allPost });
  } catch (err) {
    console.log(`Error occured while showing all posts ${err}`);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/posts/createPost
// @desc     create  post
// @access   Private
router.post("/createPost", auth, async (req, res) => {
  const userId = req.body.uid;
  const postText = req.body.postText;

  try {
    const postData = {
      postText: postText,
      comments: [],
      likes: [],
      dislikes: [],
      creator: userId,
    };

    const newPostRef = db.collection("posts").doc();
    await newPostRef.set(postData);

    const newPost = await newPostRef.get();

    const userRef = db.collection("users").doc(userId);
    userRef.set({
      posts: [`/posts/${newPost.id}`]
    }, {
      merge: true
    })
 
    res.status(200).json({ message: "post added successfully" , post: { id: newPost.id, ...newPost.data() }});

  } catch (err) {
    console.log(`Failed to create post ${err}`);
    res.status(500).send("Server Error");
  }
  
});

// @route    GET api/post/
// @desc     get post by postId
// @access   Public
router.get("/:postId", async (req, res) => {
  const postId = req.params.postId;
  let requiredPost;
  try {
    const response = await db.collection("posts").doc(postId.toString()).get();
    if (!requiredPost.empty) throw new Error("do not exits");

    requiredPost = response.data();
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to get the post");
  }

  res.status(200).json({ post: requiredPost });
});

// @route    PATCH api/post/:postId/updatePost
// @desc     update post
// @access   Private
router.patch("/:postId/updatePost", auth, async (req, res) => {
  let postId = req.params.postId;
  let postText = req.body.postText;
  try {
    await db.collection("posts").doc(postId).update({ postText: postText });
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to update post");
  }
  res.status(201).json({ message: "post updated successfully" });
});

// @route    POST api/posts/:postId/addComment
// @desc     add comment on post
// @access   Private
router.post("/:postId/addComment", auth, async (req, res) => {
  let postId = req.params.postId;
  const { comment, uid } = req.body;
  let newComment = {
    comment: comment,
    userId: uid,
    postId: postId,
  };
  try {
    await db.runTransaction(async (t) => {
      const newCommentRef = db.collection("comments").doc();

      await t.set(newCommentRef, newComment);

      await t.update(db.collection("posts").doc(postId), {
        comments: admin.firestore.FieldValue.arrayUnion(
          db.doc("/comments/" + newCommentRef.id)
        ),
      });

      await t.update(db.collection("users").doc(userId), {
        comments: admin.firestore.FieldValue.arrayUnion(
          db.doc("/comments/" + newCommentRef.id)
        ),
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to add comment");
  }
  res.status(201).json({ message: "comment added successfully" });
});


module.exports = router;
