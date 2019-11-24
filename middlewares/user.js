const models = require('../models');

module.exports = async (req, res, next) => {
    const authorization = req.header('authorization');
    req.user = null;
    req.authenticated = false;

    if (!authorization)
        return next();

    const token = await models.Token.findOne({
        where: {
            id: authorization
        },
        include: [ models.User ]
    });

    if (token && token.active) {
        const user = token.user;

        if (user) {
            req.user = user;
            req.authenticated = true;
        }
    }

    next();
};