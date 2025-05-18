const express = require('express');
const router = express.Router();
const userService = require('./user.service');

// routes
router.post('/authenticate', authenticate);
router.post('/login', authenticate);
router.get('/authenticate', authenticateGet);
router.post('/register', register);
router.get('/list', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);
router.post('/logout', logout)

module.exports = router;

async function authenticate(req, res, next) {
    try {
        const user = await userService.authenticate(req.body);
        const { token } = user;
        res.cookie('token', token, { httpOnly: true }); 
        user ? res.success(user) : res.fail(200,'用户名或者密码不正确');
    } catch(err) {
        res.fail(200, '用户名或者密码不正确');
        // next(err);
    }
}


// get 请求，测试使用
async function authenticateGet(req, res, next) {
    try {
        const user = await userService.authenticate(req.query);
        const { token } = user;
        res.cookie('token', token, { httpOnly: true }); 
        user ? res.success(user)  : res.status(400).json({ message: 'Username or password is incorrect' });
    } catch(err) {
        next(err);
    }
}

async function logout(req, res, next){
    res.cookie('token', '', { httpOnly: true }); 
    res.success(); 
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.success({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll(req.query)
        .then(users => res.success(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.success(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.success(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(() => res.success({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.success({}))
        .catch(err => next(err));
}