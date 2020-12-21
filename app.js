//..............................
const express = require("express");
const bodyParser = require("body-parser");

const forumRoutes = require("./routes/forum-routes");
const usersRoutes = require("./routes/users-routes");
const app = express();
//..............................
const cors = require("cors");
const { response } = require("express");
app.use(cors({ origin: true }));

//accepting json data..........

app.use(bodyParser.json());

// forum routes.............
app.use("/api/forum", forumRoutes);

// users routes............
app.use("/api/users", usersRoutes);
//............................
app.use((req, res) => {
  res.json({ message: "wrong route" });
});
//................................

app.listen(process.env.PORT || 3000, () => {
  console.log("server running at port 3000");
});
