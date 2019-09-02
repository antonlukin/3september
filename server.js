'use strict';

/**
 * Calendar common counter
 *
 * @author      Anton Lukin <anton@lukin.me>
 * @license     MIT License
 * @since       2.0
 */

const websocket = require('ws');
const redis = require('redis');

/**
 * Create websocket server
 */
const server = new websocket.Server({
  port: process.env.PORT || 3002
});

/**
 * Create redis clinet
 */
const database = redis.createClient();

/**
 * Get current counter from redis
 */
function getCounter(callback) {
  let counter = 0;

  database.get('3september:counter', function (error, result) {
    if (result) {
      counter = parseInt(result);
    }

    return callback(counter);
  });
}

/**
 * Setup server connection
 */
server.on('connection', function (socket, req) {

  // Send current counter on connect
  getCounter(function (counter) {
    socket.send(counter);
  });


  // Flip event message
  socket.on('message', function (data, req) {
    if (data === 'update') {
      database.incr('3september:counter');
    }
  });


  // Receive event message
  socket.on('message', function (data, req) {
    if (data === 'receive') {
      getCounter(function (counter) {
        socket.send(counter);
      });
    }
  });

});