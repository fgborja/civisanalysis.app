/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Motion = require('./motion.model');

exports.register = function(socket) {
  Motion.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Motion.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('motion:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('motion:remove', doc);
}