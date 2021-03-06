"use strict"  // Use strict JavaScript mode

// Pull in the modules we're going to use
var cocos  = require('cocos2d')
  , geo    = require('geometry')  // Import the geometry module
  , ccp    = geo.ccp              // Short hand to create points
  , Player = require('/Player');
var io = require('./socket.io');


function Connection(address) {

    // Socket.IO socket.
    this.socket = io.connect(address);

    // To allow referencing the connection inside Socket.IO callbacks.
    var that = this;

    // Upon connecting to the server.
    this.socket.on('connect', function() {
        console.log('connected!');
    });

    // Add a player to the world.
    this.socket.on('createPlayer', function (data) {

        that.onPlayerAdded(data.networkID, data.isLocal);
        console.log('Created a player; pos='+data.pos.toString()+', rot='+data.rot);
    });

    // Remove a player from the world.
    this.socket.on('removePlayer', function (data) {

        that.onPlayerRemoved(data.networkID);
        console.log('Removed a player (networkID='+data.networkID+')');
    });

    // Update multiple players' physics state.
    this.socket.on('updatePlayers', function (data) {
        for(var index in data.players) {
            var elm = data.players[index];
            that.onPlayerMoved(elm.networkID,
                               ccp(elm.pos[0],elm.pos[1]),
                               ccp(elm.vel[0],elm.vel[1]),
                               ccp(elm.acc[0],elm.acc[1]),
                               elm.rot,
                               elm.tagged);
        }
    });

    this.sendPlayerStatus = function(player) {
        console.log('sending update..');
        var pos = [ parseFloat(player.position.x.toFixed()),
                    parseFloat(player.position.y.toFixed()) ];
        var vel = [ parseFloat(player.velocity.x.toFixed(6)),
                    parseFloat(player.velocity.y.toFixed(6)) ];
        var acc = [ parseFloat(player.acceleration.x.toFixed(6)),
                    parseFloat(player.acceleration.y.toFixed(6)) ];
        var data = {
              'pos': pos,
              'rot': player.rotation,
              'vel': vel,
              'acc': acc
              };
        that.socket.emit('updatePlayerStatus', data);
    };
}

module.exports = Connection;

