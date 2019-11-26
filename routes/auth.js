const { Router } = require('express');
const router = Router();

const { User, Token } = require('../models');
const isAuthenticated = require('../middlewares/isAuthenticated');

router.get('/', (req, res, next) => {
    res.json({
        authenticated: req.authenticated,
        user: req.user,
    });
});

router.post('/', async (req, res, next) => {
    console.log(req.body);
    
    if (!req.body.username || !req.body.password)
        return next(new Error("Username or password is incorrect."));

    const user = await User.findOne({ where: { username: req.body.username } });

    if (!user || !user.password || !await user.comparePassword(req.body.password))
        return next(new Error("Username or password is incorrect."));
    
    const token = await Token.create({
        userId: user.id,
        address: req.header('x-forwarded-for') || req.connection.remoteAddress,
    });

    res.json({
        success: true,
        token: token.id,
    });
});

router.delete('/:token?', isAuthenticated, async (req, res, next) => {
    const authorization = req.param('token') || req.header('authorization');
    const token = await Token.findByPk(authorization);

    token.active = false;
    await token.save();

    res.json({
        success: true,
    });
});

router.get('/sessions', isAuthenticated, async (req, res, next) => {
    const tokens = await req.user.getTokens();

    res.json(tokens);
});

router.post('/signup', (req, res, next) => {
    // TODO: sign up
});

router.post('/password', isAuthenticated, async (req, res, next) => {
    if (!req.body.password || !await req.user.comparePassword(req.body.password))
        return next(new Error("Password is incorrect."));

    req.user.password = req.body.password;
    await req.user.save();

    res.json({
        success: true,
    });
});

module.exports = router;