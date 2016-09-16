
module.exports=function(stateDescriptions, initialState) {
  var machine={};

  // Create the machine...
  // Go through the states, and create the list of events.
  machine.events={};
  for(var stateName in stateDescriptions) {
    for (event in stateDescriptions[stateName]) {
      if(!machine.events[event]) {
        machine.events[event]=[];
      }
    }
  }
  machine.events=Object.keys(machine.events);
  // Now put in a function in the main object for every event.
  machine.events.forEach(function(eventName) {
    machine[eventName]=function() {
      /* The process is:
        - For the event (method) we're running, lookup the transition function
        on the current state object and run it.  The transition function sets
        the current state to the required new state, then runs any user-supplied
        transition function.

        So.. Each state needs a dictionary of transition functions, one for each
        event.  The transition function sets the new state, then runs the
        user-supplied transition function.

        If the user-supplied state description doesn't specify a transition for
        a given event, then we'll throw an error.
      */
      //console.log("event '" + eventName + "', args=" + JSON.stringify(arguments));
      var transitionFunc=machine.currentState[eventName];
      transitionFunc.apply(machine,arguments);
    };
  });

  // Create the states...We do this first, so the event functions created
  // below have the states, and don't have to do a lookup.
  for (var stateName in stateDescriptions) {
    var newState={};
    // Default entry and exit functions are empty
    newState.onEntry=function() {}
    newState.onExit=function() {}

    machine[stateName]=newState;
    newState.name=stateName;
  }

  var nop=function() {}

  // Now fill in the events.
  for (var stateName in stateDescriptions) {
    var newState=machine[stateName];
    machine[stateName]=newState;
    var currentState=machine[stateName];
    var stateDescription=stateDescriptions[stateName];
    machine.events.forEach(function(eventName) {
      var eventDescription=stateDescription[eventName];
      if(eventDescription!=undefined) {
        if (typeof eventDescription=='string') {
        var nextState=machine[eventDescription];
          if (nextState != currentState) {
            newState[eventName]=function() {
              currentState.onExit();
              machine.currentState=nextState;
              nextState.onEntry();
            };
          } else {
            newState[eventName]=nop;
          }
        } else if (typeof eventDescription=='function') {
          newState[eventName]=eventDescription;
          // No new state, as there was just a function, so stay in current state.
        } else { /* There's a transition function  */
          var nextState=machine[eventDescription[0]];
          var transitionFunction=eventDescription[1];
          if (nextState != currentState) {
            newState[eventName]=function() {
              currentState.onExit();
              machine.currentState=nextState;
              /*
              console.log("Calling transition function with args=" +
                JSON.stringify(arguments));
              */
              transitionFunction.apply(machine,arguments);
              nextState.onEntry();
            };
          } else {
            newState[eventName]=function() {
              machine.currentState=nextState;
              /*
              console.log("Calling transition function with args=" +
                JSON.stringify(arguments));
              */
              transitionFunction.apply(machine,arguments);
            };
          }
        }
      } else {
        if(eventName != 'onEntry' && eventName != 'onExit') {
          newState[eventName]=function() {
            throw new Error('Event \'' + eventName + '\' not allowed in state ' +
            newState.name + "\'");
          }
        }
      }
    });
  }

  // Set the initial state
  /*
  console.log('Initial state is ' + initialState);
  console.log('machine[initialState] is ' + JSON.stringify(machine[initialState]));
  */
  machine.currentState=machine[initialState];
  return machine;
}
