const { Router } = require('express');
const router = Router();

const { User } = require('../models');
const isSuperuser = require('../middlewares/isSuperuser');

router.get('/', isSuperuser, async (req, res, next) => {
  req.json({
    success: true,
    data: await User.findAll(),
  });
});

router.post('/', isSuperuser, async (req, res, next) => {
  const user = await User.create(req.body);
  req.json({
    success: true,
    data: user,
  });
});

router.get('/:id', isSuperuser, async (req, res, next) => {
  const user = await User.findByPk(req.params['id']);
  req.json({
    success: true,
    data: user,
  });
});

router.post('/:id', isSuperuser, async (req, res, next) => {
  const user = await User.findByPk(req.params['id']);

  if (req.body.hasOwnProperty('username')) user.username = req.body.username;
  if (req.body.hasOwnProperty('password')) user.password = req.body.password;
  if (req.body.hasOwnProperty('superuser') && user.id !== req.user.id)
    user.superuser = +req.body.superuser;

  user.save();
  req.json({
    success: true,
    data: user,
  });
});

router.delete('/:id', isSuperuser, async (req, res, next) => {
  // TODO: delete all photos and then user
});

module.exports = router;
