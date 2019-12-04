const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const env = process.env.NODE_ENV || 'development';

const userMiddleware = require('./middlewares/user');

const instance = require('./routes/instance');
const users = require('./routes/users');
const photos = require('./routes/photos');
const albums = require('./routes/albums');
const auth = require('./routes/auth');

// Makes testing the React app easier.
if (env === 'development') {
    try {
        const cors = require('cors');
        app.use(cors());
        console.log('CORS enabled');
    } catch (e) {
        console.log('Development env, devDependencies probably not installed.');
    }
}

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
        message: err.message,
        error: (app.get('env') === 'development') ? err : {}
    });
});

module.exports = app;