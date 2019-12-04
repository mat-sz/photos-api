const { Router } = require('express');
const router = Router();

const config = require('../configs/app');

router.get('/', (req, res, next) => {
    res.json({
        allowSignups: config.allowSignups,
        allowAnonymousUploads: config.allowAnonymousUploads,
        title: config.title,
    });
});

module.exports = router;