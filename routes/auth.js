const { Router } = require('express');
const router = Router();

const config = require('../configs/app');
const { User, Token } = require('../models');
const isAuthenticated = require('../middlewares/isAuthenticated');

router.get('/', (req, res, next) => {
    res.json({
        success: true,
        data: req.user,
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
        data: token.id,
    });
});

router.delete('/:token?', isAuthenticated, async (req, res, next) => {
    const authorization = req.params['token'] || req.header('authorization');
    const token = await Token.findByPk(authorization);

    token.active = false;
    await token.save();

    res.json({
        success: true,
    });
});

router.get('/sessions', isAuthenticated, async (req, res, next) => {
    const tokens = await req.user.getTokens();

    res.json({
        success: true,
        data: tokens,
    });
});

router.post('/signup', async (req, res, next) => {
    if (!config.allowSignups)
        return next(new Error('Signups are not allowed.'));

    if (!req.body['username'] || !req.body['password'])
        return next(new Error('Not enough parameters.'));
    
    if ((await User.findAll({ where: { username: req.body.username }})).length > 0)
        return next(new Error('This username is already taken.'));
    
    const user = await User.create({
        username: req.body['username'],
        password: req.body['password'],
    });

    res.json({
        success: true,
        data: user,
    });
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