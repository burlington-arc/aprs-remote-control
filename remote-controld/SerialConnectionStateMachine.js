
var SerialPort=require('serialport');

var createSerialConnection=function(options) {
  var port;
  var connectionStateMachine;

  var openConnection=function() {
    port=new SerialPort(device, options, function(err) {
      if(!err) {
        connectionStateMachine.connectionSucceeded();
      } else {
        connectionStateMachine.connectionFailed(err);
      }
    });
    port.on('error', function(err) {
      connectionStateMachine.error(err);
    });
    port.on('data', function(data) {
      connectionStateMachine.emit('data', data);
    });
  }

  var closeConnection=function() {
    port.close();
  }

  var states= {
    Idle: {
      enable: ['Connecting', function() { openConnection();}],
      timeout: 'Idle'
    },
    Connecting: {
      connectionSucceeded: 'Connected',
      connectionFailed: ['WaitingRetry', function() {triggerWait(); }]
      disable: 'PendingDisable'
    },
    PendingDisable: {
      enable: 'Connecting'
    },
    Connected: {
      disable: ['Idle', function() {self.closeConnection()}]
      error: 'WaitingRetry'
    },
    WaitingRetry: {
      disable: 'Idle',
      timeout: ['Connecting', function() { self.openConnection()}]
    },
    PendingDisable: {
      connectionSucceeded: ['Idle', function(){self.closeConnection();}],
      connectionFailed: 'Idle',
      disable: 'Idle'
    }
  }
};

module.exports=createSerialConnection;
