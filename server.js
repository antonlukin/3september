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
const COUNTER_KEY = '3september:counter';

/**
 * Create redis clinet
 */
const database = redis.createClient();

database.on('error', function(error) {
  console.error('Redis error:', error);
});


/**
 * Ensure counter exists in redis
 */
function ensureCounter(callback) {
  database.setnx(COUNTER_KEY, 0, function(error) {
    if (error) {
      return callback(error);
    }

    callback(null);
  });
}


/**
 * Get current counter from redis
 */
function sendCounter(socket) {
  ensureCounter(function(initError) {
    if (initError) {
      console.error('Failed to initialize counter:', initError);
      return;
    }

    database.get(COUNTER_KEY, function(error, result) {
      let counter = 0;

      if (error) {
        console.error('Failed to read counter:', error);
        return;
      }

      if (result !== null) {
        counter = parseInt(result, 10);
      }

      if (socket.readyState === 1) {
        socket.send(String(counter));
      }
    });
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
    return ensureCounter(function(initError) {
      if (initError) {
        console.error('Failed to initialize counter:', initError);
        return res.status(500).json({
          'success': false,
        });
      }

      database.incr(COUNTER_KEY, function(error) {
        if (error) {
          console.error('Failed to increment counter:', error);
          return res.status(500).json({
            'success': false,
          });
        }

        res.status(200).json({
          'success': true,
        });
      });
    });
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
ensureCounter(function(error) {
  if (error) {
    console.error('Failed to initialize counter:', error);
    process.exit(1);
  }

  app.listen(process.env.PORT || 3002);
});
