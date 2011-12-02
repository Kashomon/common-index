// Otre: A Go Studying Program 
// Copyright (c) 2011, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License

(function(window) {

// From JQuery: expose Otre to the global object
otre = window.otre || {} 

otre.global = {
  stoneColors: ["black", "white"],
  labelColors: ["white", "black"],
  gradients:  {
    0: "r(0.25, 0.25)#888-#000",
    1: "r(0.25, 0.25)#fff-#bbb",
  },
  currentPlayer: 0,
  stones: [],

  // TODO: remove groups
  groups: [],
  playerNumbers: {},

  // TODO: should use stoneStates everywhere
  states: { 
    BLACK: "black", 
    WHITE: "white",
    EMPTY: "empty", 
  },

  // maxIntersects is changed via the otre.display.init method. 
  // TODO: make this better defined?
  maxIntersects: 19,

  // paper: undefined // set in display 
};
var global = otre.global

otre.global.playerNumbers[global.stoneColors[0]] = 0;
otre.global.playerNumbers[global.stoneColors[1]] = 1;

})(window)

