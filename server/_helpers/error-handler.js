module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    if (typeof (err) === 'string') {
        // custom application error
        return res.fail(400, err);
    }

    if (err.name === 'ValidationError') {
        // mongoose validation error
        return res.fail(400, err.message);
    }

    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        return res.fail(401, err.message);
    }

    // default to 500 server error
    return res.fail(500, err.message);
}