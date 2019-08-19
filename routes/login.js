const express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'),
  db = require('../queries');

router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', (req, res, next) => {
  res.sendFile('login.html', { root: __dirname + '/../public/views' });
});

router.post('/', (req, res, next) => {
  console.log(req.body);
  db.authorize(req.body.username, req.body.password).then(data => {
    if (data) {
      res.sendFile('index.html', { root: __dirname + '/../public/views' });
    } else {
      res.sendFile('login.html', { root: __dirname + '/../public/views' });
    }
  });
});

module.exports = router;
