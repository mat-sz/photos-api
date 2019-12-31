const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const env = process.env.NODE_ENV || 'development';
const cors = require('cors');

const userMiddleware = require('./middlewares/user');

const instance = require('./routes/instance');
const users = require('./routes/users');
const photos = require('./routes/photos');
const albums = require('./routes/albums');
const auth = require('./routes/auth');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(userMiddleware);

app.use('/v1/instance', instance);
app.use('/v1/users', users);
app.use('/v1/photos', photos);
app.use('/v1/albums', albums);
app.use('/v1/auth', auth);
app.use(express.static('public'));

app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        success: false,
        error: {
            message: err.message,
        }
    });
});

module.exports = app;