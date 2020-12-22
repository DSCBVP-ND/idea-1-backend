const db = require('../firebase/firebase-db');

module.exports = async (req, res, next) => {
    try{
        //Get token
        const userId = req.body.uid;

        // Check if user exists
        if (!userId || !db.collection('users').doc(userId) ) {
            return res.status(401).json({ msg: 'User not found' });
        } else {
            next();
        }


    }   catch(err) {
        console.error(`something wrong with auth middleware ${err}`);
        res.status(500).json({ msg: 'Server Error' });
    }

}