const User = require("../models/user-model");
const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(401);
  }

  console.log("This is cookie", cookies.jwt);

  const refreshToken = cookies.jwt;

  // const foundUser = usersDB.users.find(
  //   (person) => person.refreshToken === refreshToken
  // );
  const foundUser = await User.findOne({ refreshToken }).exec();
  console.log("🚀 ~ handleRefreshToken ~ foundUser:", foundUser);

  if (!foundUser) return res.sendStatus(403); // Forbidden

  // evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.name !== decoded.username) {
      return res.sendStatus(403);
    }
    // const roles = Object.values(foundUser.roles);

    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: decoded.username,
          // roles: roles,
        },
      },

      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "600s" }
    );
    const username = foundUser.name;
    const mail = foundUser.account;

    res.json({ accessToken, username, mail });
  });
};

module.exports = { handleRefreshToken };
