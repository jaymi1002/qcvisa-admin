

const cookieToken = async(req, res, next) => {
    const JWT_TOKEN = req.cookies.token;
    if (JWT_TOKEN) {
        req.headers.authorization = 'Bearer ' + JWT_TOKEN;
    }
    next();
  }

  module.exports = cookieToken;