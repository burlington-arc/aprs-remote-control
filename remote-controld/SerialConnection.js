
var SerialPort=require('serialport');
var util=require('util');
var StateMachine=require('./StateMachine.js');
var EventEmitter=require('events');

var states= {
  Idle: {
    enable: 'Connecting',
    timeout: 'Idle'
  },
  Connecting: {
    connectionSucceeded: 'Connected',
    connectionFailed: 'WaitingRetry',
    disable: ['Idle', function() {this.closeConnection(); }],
    onEntry: function() { this.openConnection(); },
  },
  Connected: {
    disable: 'Idle',
    error: 'WaitingRetry',
    onExit: function() { this.closeConnection(); }
  },
  WaitingRetry: {
    disable: 'Idle',
    timeout: 'Connecting',
    onEntry: function() { this.triggerWait(); },
  }
}

var SerialConnection=function(device, options) {
  var self=this;

  StateMachine.call(this, states, 'Idle');
};

util.inherits(SerialConnection, EventEmitter);

SerialConnection.prototype.openConnection=function() {
  this.port=new SerialPort(device, options, function(err) {
    if(!err) {
      this.connectionSucceeded();
    } else {
      this.connectionFailed(err);
    }
  });
  this.port.on('error', function(err) {
    this.error(err);
  });
  this.port.on('data', function(data) {
    this.emit('data', data);
  });
}

SerialConnection.prototype.closeConnection=function() {
  this.port.close();
}

SerialConnection.prototype.triggerWait=function() {
  // TODO: Put in a wait function.
}

module.exports=SerialConnection;
