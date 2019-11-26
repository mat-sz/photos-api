const { Router } = require('express');
const router = Router();
const Hashids = require('hashids/cjs');

const config = require('../configs/app');
const hashids = new Hashids(config.hashidSalt);
const { Album, Photo } = require('../models');
const isAuthenticated = require('../middlewares/isAuthenticated');

const albumMiddleware = (viewing = false) => async (req, res, next) => {
    const id = hashids.decode(req.params['id']);
    const album = await Album.findByPk(+id);

    if (!album)
        return next(new Error('Not found.'));

    let permissionRequired = !viewing || album.private;

    if (permissionRequired && (!req.user || (album.userId !== req.user.id && !req.user.superuser)))
        return next(new Error('No permissions.'));
    
    req.album = album;
    next();
};

router.get('/', isAuthenticated, async (req, res, next) => {
    const albums = await req.user.getAlbums();
    res.json(albums);
});

router.post('/', isAuthenticated, async (req, res, next) => {
    const album = await Album.create(req.body);
    req.json(album);
});

router.get('/:id', isAuthenticated, albumMiddleware(true), (req, res, next) => {
    req.json(req.album);
});

router.get('/:id/photos', isAuthenticated, albumMiddleware(true), async (req, res, next) => {
    req.json(await req.album.getPhotos());
});

router.post('/:id/photos', isAuthenticated, albumMiddleware(true), async (req, res, next) => {
    let photos = [];
    
    if (req.body['photos'] && Array.isArray(req.body['photos'])) {
        let photoIds = req.body['photos'].map((id) => hashids.decode(id));
        photos = Photo.where({ id: photoIds, userId: req.user.id });
    }

    await req.album.setPhotos(photos);
    req.json(await req.album.getPhotos());
});

router.post('/:id', isAuthenticated, albumMiddleware(false), async (req, res, next) => {
    if (req.body.hasOwnProperty('private'))
        req.album.private = +req.body.private;
    if (req.body.hasOwnProperty('title'))
        req.album.title = req.body.title;

    await req.album.save();
    res.json(req.album);
});

router.delete('/:id', isAuthenticated, async (req, res, next) => {
    // TODO: an option to delete all photos

    await req.album.destroy();
});

module.exports = router;