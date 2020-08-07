const { Router } = require('express');
const router = Router();
const multer = require('multer');
const Hashids = require('hashids/cjs');
const fs = require('fs');
const path = require('path');

const unlink = path =>
  new Promise((resolve, reject) => {
    try {
      fs.unlink(path, () => resolve());
    } catch (e) {
      // Fail gracefully.
      resolve();
    }
  });

const destination = __dirname + '/../storage/';

const config = require('../configs/app');
const hashids = new Hashids(config.hashidSalt);
const upload = multer({ dest: destination });

const { Photo } = require('../models');
const isAuthenticated = require('../middlewares/isAuthenticated');
const isAuthenticatedConditional = require('../middlewares/isAuthenticatedConditional');

const photoMiddleware = (viewing = false) => async (req, res, next) => {
  const id = hashids.decode(req.params['id']);
  const photo = await Photo.findByPk(+id);

  if (!photo) return next(new Error('Not found.'));

  let permissionRequired = !viewing || photo.private;

  if (viewing && req.query['key'] === photo.filename)
    permissionRequired = false;

  if (
    permissionRequired &&
    (!req.user || (photo.userId !== req.user.id && !req.user.superuser))
  )
    return next(new Error('No permissions.'));

  req.photo = photo;
  next();
};

router.get('/', isAuthenticated, async (req, res, next) => {
  const photos = await req.user.getPhotos();

  res.json({
    success: true,
    data: photos,
  });
});

router.post(
  '/',
  isAuthenticatedConditional(!config.allowAnonymousUploads),
  upload.fields([
    { name: 'full', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  async (req, res, next) => {
    if (!req.files || !req.files['full'] || req.files['full'].length === 0)
      return next(new Error('Image file missing.'));
    if (!req.files['thumbnail'] || req.files['thumbnail'].length === 0)
      return next(new Error('Thumbnail file missing.'));

    const photo = await Photo.create({
      userId: req.user ? req.user.id : null,
      title: req.body.title,
      private: req.user ? +req.body.private : false,
      filename: req.files['full'][0].filename,
      mimetype: req.files['full'][0].mimetype,
      thumbnailFilename: req.files['thumbnail'][0].filename,
      thumbnailMimetype: req.files['thumbnail'][0].mimetype,
    });

    res.json({
      success: true,
      data: photo,
    });
  }
);

router.get('/:id', photoMiddleware(true), (req, res, next) => {
  res.json({
    success: true,
    data: req.photo,
  });
});

router.post(
  '/:id',
  isAuthenticated,
  photoMiddleware(false),
  async (req, res, next) => {
    if (req.body.hasOwnProperty('private'))
      req.photo.private = +req.body.private;
    if (req.body.hasOwnProperty('title')) req.photo.title = req.body.title;

    await req.photo.save();
    res.json({
      success: true,
      data: req.photo,
    });
  }
);

router.get('/:id/file/:size', photoMiddleware(true), (req, res, next) => {
  const isThumbnail = req.params['size'] === 'thumbnail';
  res.sendFile(
    path.resolve(
      destination,
      isThumbnail ? req.photo.thumbnailFilename : req.photo.filename
    ),
    {
      headers: {
        'Content-Type': isThumbnail
          ? req.photo.thumbnailMimetype
          : req.photo.mimetype,
      },
    }
  );
});

router.post(
  '/:id/file/:size',
  isAuthenticated,
  photoMiddleware(false),
  upload.single('file'),
  async (req, res, next) => {
    if (!req.file) return next(new Error('File missing.'));

    const isThumbnail = req.params['size'] === 'thumbnail';

    await unlink(
      path.resolve(
        destination,
        isThumbnail ? req.photo.thumbnailFilename : req.photo.filename
      )
    );

    if (isThumbnail) {
      req.photo.thumbnailFilename = req.file.filename;
      req.photo.thumbnailMimetype = req.file.mimetype;
    } else {
      req.photo.filename = req.file.filename;
      req.photo.mimetype = req.file.mimetype;
    }

    await req.photo.save();
    req.json({
      success: true,
      data: req.photo,
    });
  }
);

router.delete(
  '/:id',
  isAuthenticated,
  photoMiddleware(false),
  async (req, res, next) => {
    await unlink(path.resolve(destination, req.photo.filename));
    await unlink(path.resolve(destination, req.photo.thumbnailFilename));

    await req.photo.destroy();

    res.json({
      success: true,
    });
  }
);

module.exports = router;
