(function() {

var rules = otre.rules;
var log = otre.logger;
var util = otre.util;

// A GoStone function object
// There will be one GoStone for each intersection on the board.
otre.GoStone = function(paper, pixelSect, boardSect, radius) {

  var that = this;

  this.state = { 
    placed: false, // set on mousedown
    color: "empty", // set on mousedown or on Add
    groupIndex: -2, 
    lbl: undefined,
    boardSect: boardSect,
    pixelSect: pixelSect,
  }   

  this.circ = paper.circle(pixelSect.x, pixelSect.y, radius); 

  this.boundingbox = paper.rect(pixelSect.x - radius, pixelSect.y - radius, 2 * radius, 2 * radius).attr({
    fill: "white", 
    "fill-opacity": 0, 
    opacity: 0.0,
    "stroke-opacity": 0,
  });

  this.circ.attr({
    fill: "blue",
    opacity: 0,
    "stroke-opacity": 0,
  }); 
  
  this.boundingbox.hover(function(event) {
    if (rules.stones.placeable(that)) {
      rules.stones.setColor(that, rules.getCurrentPlayerColor(), .5);
    }
  }, function(event) {
    if (! that.state.placed) rules.stones.clearColor(that);
  });

  this.boundingbox.mousedown(function() {
    var code = rules.stones.place(that.state.boardSect, rules.getCurrentPlayerColor());
    if (code > 0) rules.nextPlayer();
  }); 
};  

})();
