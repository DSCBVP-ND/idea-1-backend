const db = require("../firebase/firebase-db");
const admin = require("firebase-admin");
//...................................................
const getAllUsers = async (req, res, next) => {
  const allUsers = [];
  try {
    const response = await db.collection("users").get();

    if (!response) throw new Error("something went wrong");
    response.forEach((doc) => {
      allUsers.push(doc.data());
    });
    console.log(allUsers);
  } catch (err) {
    console.log(err);
    return next(err);
  }
  res.json({ allUsers: allUsers });
};
//...................................................
const createUser = async (req, res, next) => {
  const userId = req.body.userId;
  try {
    const newUser = {
      comments: [],
      posts: [],
    };
    await db.collection("users").doc(userId).set(newUser);
  } catch (err) {
    console.log(err);
    return next(err);
  }
  res.json({ message: "user created successfully" });
};

//...................................................

exports.getAllUsers = getAllUsers;
exports.createUser = createUser;
