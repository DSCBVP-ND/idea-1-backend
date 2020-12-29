const express = require("express");
const router = express.Router();
const db = require("../../firebase/firebase-db");
const auth = require("../../middleware/auth");

// @route    GET api/posts/allPosts
// @desc     show all posts
// @access   Public
router.get("/allPosts", async (req, res) => {
  try {
    let allPosts = [];
    await db.collection("posts").get().then((querySnapshot) => {
      querySnapshot.forEach(async (doc) => {
        // let comments = [];
        // for await (let commentId of doc.data().comments) {
        //   const comment  = await db.collection("comments").doc(commentId).get();
        //   comments.push(comment.data());
        // }
        // let comments = await Promise.all(doc.data().comments.map(async (commentId)=>{
        //   // console.log(commentRef)
        //   const comment  = await db.collection("comments").doc(commentId).get();
        //   return comment;
        // }));

        allPosts.push({
          id: doc.id,
          creator: doc.data().creator,
          dislikes: doc.data().dislikes,
          likes: doc.data.likes,
          postText: doc.data().postText,
          comments: doc.data().comments
        });
      })
    })

    return res.status(200).json({ posts: allPosts });
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

    res.status(200).json({ message: "post added successfully", post: { id: newPost.id, ...newPost.data() } });

  } catch (err) {
    console.log(`Failed to create post ${err}`);
    res.status(500).send("Server Error");
  }

});

// @route    GET api/posts/
// @desc     get post by postId
// @access   Public
router.get("/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const response = await db.collection("posts").doc(postId).get();
    if (!requiredPost.empty) throw new Error("do not exits");
    let requiredPost = response.data();
    res.status(200).json({ post: requiredPost });
  } catch (err) {
    console.log(`Failed to get the post ${err}`);
    res.status(500).send("Server Error");
  }


});

// @route    PATCH api/posts/:postId/updatePost
// @desc     update post
// @access   Private
router.patch("/:postId/updatePost", auth, async (req, res) => {
  try {
    let postId = req.params.postId;
    let postText = req.body.postText;
    let postRef = await db.collection("posts").doc(postId);
    let post = await postRef.get();

    //check if post exists
    if (post.exists) {
      //check if current user is the creator
      if (post.data().creator == req.body.uid) {
        await postRef.update({ postText: postText });
        post = await postRef.get();
        res.status(200).json({ message: "post updated successfully", post: post.data() });
      }
    } else {
      //can't update
      throw new Error("can't update post");
    }
  } catch (err) {
    console.log(`Failed to update post ${err}`);
    res.status(500).send("Server Error");
  }

});


module.exports = router;
