'use strict';

/**
 * Calendar common counter
 *
 * @author      Anton Lukin <anton@lukin.me>
 * @license     MIT License
 * @since       2.0.0
 */

const redis = require('redis');
const express = require('express');

const app = express();
const websocket = require('express-ws')(app);

/**
 * Create redis clinet
 */
const database = redis.createClient();


/**
 * Get current counter from redis
 */
function sendCounter(socket) {
  let counter = 0;

  database.get('3september:counter', function (error, result) {
    if (result) {
      counter = parseInt(result);
    }

    if (socket.readyState === 1) {
      socket.send(counter);
    }
  });
}


/**
 * Some required express settings
 */
app.use(express.json());
app.disable('x-powered-by');


/**
 * Update counter via AJAX
 */
app.post('/update/', function(req, res, next) {
  if (req.headers.origin !== 'https://3september.ru') {
    return next();
  }

  if (req.body.data === 'counter') {
    database.incr('3september:counter');
  }

  res.status(200).json({
    'success': true,
  });
});


/**
 * Send current counter via websocket
 */
app.ws('/receive/', function(socket, req) {
  if (req.headers.origin !== 'https://3september.ru') {
    return socket.close();
  }

  sendCounter(socket);

  socket.on('message', function (data, req) {
    if (data === 'counter') {
      sendCounter(socket);
    }
  });
});


/**
 * Final middleware.
 */
app.use(function(req, res) {
  res.status(400).json({
    'success': false,
  });
});


/**
 * Let's start express app
 */
app.listen(process.env.PORT || 3002);

