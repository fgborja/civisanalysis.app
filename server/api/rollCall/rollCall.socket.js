/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var RollCall = require('./rollCall.model');

exports.register = function(socket) {
  RollCall.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  RollCall.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('rollCall:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('rollCall:remove', doc);
}