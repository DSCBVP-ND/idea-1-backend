const db = require("../firebase/firebase-db");
const admin = require("firebase-admin");

//............................................

const getAllPosts = async (req, res, next) => {
  const allPost = [];
  try {
    const response = await db.collection("posts").get();
    if (!response) throw new Error("something went wrong");
    response.forEach((doc) => {
      allPost.push(doc.data());
    });
  } catch (err) {
    console.log(err);
    return next();
  }
  res.json({ posts: allPost });
};

//...........................................

const getPostByPostId = async (req, res, next) => {
  const postId = req.params.postId;
  let requiredPost;
  try {
    const response = await db.collection("posts").doc(postId.toString()).get();
    if (!requiredPost.empty) throw new Error("do not exits");

    requiredPost = response.data();
  } catch (err) {
    console.log(err);
    return next();
  }

  res.json({ post: requiredPost });
};

//...........................................

const createPost = async (req, res, next) => {
  const userId = req.params.userId;
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
    return next();
  }
  res.json({ message: "post added successfully" });
};

//...........................................

const updatePostByPostId = async (req, res, next) => {
  let postId = req.params.postId;
  let postText = req.body.postText;
  try {
    await db.collection("posts").doc(postId).update({ postText: postText });
  } catch (err) {
    return next();
  }
  res.json({ message: "post updated successfully" });
};

//...........................................

const addCommentOnPostId = async (req, res, next) => {
  let postId = req.params.postId;
  const { comment, userId } = req.body;
  let newComment = {
    comment: comment,
    userId: userId,
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
    return next();
  }
  res.json({ message: "comment added successfully" });
};

//...........................................

exports.getAllPosts = getAllPosts;
exports.getPostByPostId = getPostByPostId;
exports.createPost = createPost;
exports.updatePostByPostId = updatePostByPostId;
exports.addCommentOnPostId = addCommentOnPostId;
