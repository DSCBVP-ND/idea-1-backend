const express = require("express");
const router = express.Router();
const db = require("../../firebase/firebase-db");
const auth = require("../../middleware/auth");

// @route    GET api/posts/allPosts
// @desc     show all posts
// @access   Private
router.get("/allPosts", async (req, res) => {
  try {
    const allPost = [];
    const response = await db.collection("posts").get();
    if (!response) throw new Error("something went wrong");
    response.forEach((doc) => {
      allPost.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ posts: allPost });
  } catch (err) {
    console.log(`Error occured while showing all posts ${err}`);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/posts/createPost/:uid
// @desc     create  post
// @access   Private
router.post("/createPost/:uid", auth, async (req, res) => {
  const userId = req.params.uid;
  const postText = req.body.postText;

  try {
    const newPost = {
      postText: postText,
      comments: [],
      likes: 0,
      dislikes: 0,
      creator: userId,
    };
    const newPostRef = db.collection("posts").doc();
    newPostRef.set(newPost);
    await db.runTransaction(async (t) => {
      await t.get(newPostRef);

      const userRef = db.collection("users").doc(userId);
      await t.update(userRef, {
        posts: admin.firestore.FieldValue.arrayUnion(
          db.doc("/posts/" + newPostRef.id)
        ),
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to create post");
  }
  res.status(201).json({ message: "post added successfully" });
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

//...................................................................

module.exports = router;
