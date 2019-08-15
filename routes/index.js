const express = require('express'),
    router = express.Router();

router.get('/', (req, res, next) => {
    res.sendFile('index.html', { root: __dirname + '/../public/views' });
});

module.exports = router;