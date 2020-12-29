const db = require('../../firebase/firebase-db');

module.exports = async (req) => {
    try {
        //Get token
        let userId = ' '
        if (req.headers?.authorization?.startsWith('Bearer ')) {
            userId = req.headers.authorization.split('Bearer ')[1];
        }
        const userRef = await db.collection("users").doc(userId);

        // Check if user exist
        return new Promise(async (resolve, reject) => {
            const user = await userRef.get();
            if (user.exists) {
                resolve(user)
            } else {
                reject(`User not found`)
            }
        })
    } catch (err) {
        console.error(`Something wrong with auth middleware ${err}`);
    }
}