const db = require('../firebase/firebase-db');

module.exports = async (req, res, next) => {
    try {
        //Get token
        const userId = req.body.uid;
        const userRef = db.collection("users").doc(userId);
        const user = await userRef.get();
        // Check if user exists
        if (!user.exists) {
            return res.status(401).json({ msg: 'User not found' });
        } else {
            next();
        }


    } catch (err) {
        console.error(`something wrong with auth middleware ${err}`);
        res.status(500).json({ msg: 'Server Error' });
    }

}