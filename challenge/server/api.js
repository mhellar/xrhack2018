const express = require('express');
const router = express.Router();

const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();
const url = require('url');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const https = require('https');

/* GET home page. */
router.get('/labels', function(req, res, next) {
  const fileURL = req.query.url;
  const parsed = url.parse(fileURL);
  const filename = `${crypto.createHash('md5').update(fileURL).digest("hex")}${path.extname(parsed.pathname)}`;
  const dest = `${__dirname}/static/tmp/${filename}`;
  console.log(dest);
  const file = fs.createWriteStream(dest);
  const request = (fileURL.startsWith('https') ? https : http).get(fileURL, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(function() {
        client
          .labelDetection(`https://webxr.ngrok.io/tmp/${filename}`)
          .then(results => {
            console.log('results:', results);
            const labels = results[0].labelAnnotations;

            console.log('Labels:');
            labels.forEach(label => console.log(label.description));
            res.send({ labels: labels });
          })
          .catch(err => {
            console.error('ERROR:', err);
            res.send({ error: err });
          });
      });
    }).on('error', function(err) {
      fs.unlink(dest);
      res.send({ error: err });
    });
  });
});

module.exports = router;
