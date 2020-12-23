const express = require('express');
const router = express.Router();
const db = require('../../firebase/firebase-db');
const auth = require('../../middleware/auth');

// @route    POST api/posts/allPosts
// @desc     show all posts
// @access   Private
router.post("/allPosts", auth, async (req, res)=> {
    try {
        const allPost = [];
        const response = await db.collection("posts").get();
        if (!response) throw new Error("something went wrong");
        response.forEach((doc) => {
            allPost.push({id: doc.id, ...doc.data()});
        });

        res.status(200).json({ posts: allPost });
    } catch(err) {
        console.log(`Error occured while showing all posts ${err}`);
        res.status(500).send('Server Error');
    }
});

module.exports = router;