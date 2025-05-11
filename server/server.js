require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');
const path = require('path');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());



// global error handler
app.use(errorHandler);
app.use((req, res, next) => {
    res.success = (data, message = '成功') => {
        res.status(200).json({
            code: 0,
            message,
            data
        });
    }
    res.fail = (code = 200, message = '成功', data = null) => {
        res.status(code).json({
            code: 1,
            message,
            data
        });
    }
    next();
    
});
// use JWT auth to secure the api
// app.use(jwt());


// api routes
app.use('/api/users', require('./users/users.controller'));
app.use('/api/orders', require('./orders/orders.controller'));

// global error handler
app.use(errorHandler);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
})

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});
