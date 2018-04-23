const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;

module.exports = (req, res, next) => {
  const token = req.cookies.jwtToken;
  if (token) {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.status(403).json('Invalid Token');
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.status(403).json('No Token Provided');
  }
};
