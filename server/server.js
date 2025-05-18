require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');
const cookieToken = require('_helpers/cookie-token');
const path = require('path');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// global error handler
app.use(errorHandler);
app.use((req, res, next) => {
    res.success = (data, msg = '成功') => {
        res.status(200).json({
            code: 0,
            msg,
            data
        });
    }
    res.fail = (code = 200, msg = '成功', data = null) => {
        res.status(code).json({
            code: 1,
            msg,
            data
        });
    }
    next();
    
});
app.use(cookieToken);
// use JWT auth to secure the api
app.use(jwt());
app.use(express.static('views'));


// api routes
app.use('/api/user', require('./user/user.controller'));
app.use('/api/order', require('./order/order.controller'));

// global error handler
app.use(errorHandler);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
})

// start server
// const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
const port = 80;
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});
