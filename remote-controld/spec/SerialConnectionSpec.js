
var SerialConnection=require("../SerialConnection.js");
var StateMachine=require('../StateMachine.js');

describe('SerialConnection',function() {
  var UUT;
  beforeEach(function() {
    UUT=new SerialConnection("/dev/null", {});
  });

  it('is an instance of SerialConnection', function() {
    expect(UUT instanceof SerialConnection).toBeTruthy();
  });

  it('has an openConnection function', function() {
    expect(UUT.openConnection).toBeDefined();
  });

  it('Starts in an idle state', function() {
    spyOn(UUT, 'openConnection');
    expect(UUT.currentState.name).toBe('Idle');
  });

  it('goes to Connecting and opens the port when we enable()', function() {
    spyOn(UUT, 'openConnection');
    expect(UUT.currentState.name).toBe('Idle');
    UUT.enable();
    expect(UUT.currentState.name).toBe('Connecting');
    expect(UUT.openConnection).toHaveBeenCalled();
  });

  it('goes to Connected if the port opens', function() {
    spyOn(UUT, 'openConnection');
    expect(UUT.currentState.name).toBe('Idle');
    UUT.enable();
    expect(UUT.currentState.name).toBe('Connecting');
    expect(UUT.openConnection).toHaveBeenCalled();
    UUT.connectionSucceeded();
    expect(UUT.currentState.name).toBe('Connected');
  });

  it('goes to WaitingRetry if the port doesnt open', function() {
    spyOn(UUT, 'openConnection');
    expect(UUT.currentState.name).toBe('Idle');
    UUT.enable();
    expect(UUT.currentState.name).toBe('Connecting');
    expect(UUT.openConnection).toHaveBeenCalled();
    UUT.connectionFailed();
    expect(UUT.currentState.name).toBe('WaitingRetry');
  });

  it('tries opening again upon timeout', function() {
    spyOn(UUT, 'openConnection');
    expect(UUT.currentState.name).toBe('Idle');
    UUT.enable();
    expect(UUT.currentState.name).toBe('Connecting');
    expect(UUT.openConnection).toHaveBeenCalled();
    UUT.connectionFailed();
    expect(UUT.currentState.name).toBe('WaitingRetry');
    UUT.openConnection.calls.reset();
    UUT.timeout();
    expect(UUT.currentState.name).toBe('Connecting');
    expect(UUT.openConnection).toHaveBeenCalled();
  });
});
