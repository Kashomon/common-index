(function() {

var util = otre.util;
var log = otre.logger;
var global = otre.global;

otre.rules = {
  getCurrentPlayerColor: function() { 
    return global.stoneColors[global.currentPlayer];
  },

  getCurrentLabelColor: function() {
    return global.labelColors[global.currentPlayer]; 
  },

  getOtherPlayerColor: function() {
    return global.stoneColors[1 - global.currentPlayer];
  },

  getLabelColor: function(color) {
    if (color !== undefined && global.playerNumbers[color] !== undefined) {
      return global.labelColors[global.playerNumbers[color]];
    } else {
      return global.labelColors[global.currentPlayer];
    }
  },

  getGradient: function() {
    return global.gradients[global.currentPlayer];
  },                  

  oppositeColor: function(color) {
    return global.stoneColors[1 - global.playerNumbers[color]];
  },

  getStone: function(point) {
    return global.stones[point.x][point.y];
  },

  nextPlayer: function() {
    global.currentPlayer = 1 - global.currentPlayer;
  },
};
var rules = otre.rules;

otre.rules.stones = {

  // Determine whether a stone is legally allowed to be placed
  // @returns: the number of liberties of the stone after placing 
  placeable: function(stone) {
    if (stone.state.placed === true) {
      return false;
    } else {
      return true;
    } 
  },

  // Place a stone 
  place: function(point, color) {
    var stone = rules.getStone(point);
    if (stone.state.placed === true) return;

    // place the stone and see what happens
    this.setActive(stone, color);

    var captures = this.newCaptureObject();
    var oppColor = rules.oppositeColor(color);

    // check for captures in adjacent squares 
    this.getCaptures(captures, new util.Point(point.x + 1, point.y), oppColor);
    this.getCaptures(captures, new util.Point(point.x - 1, point.y), oppColor);
    this.getCaptures(captures, new util.Point(point.x, point.y - 1), oppColor, "up");
    this.getCaptures(captures, new util.Point(point.x, point.y + 1), oppColor, "down");

    if (captures.numCaptures <= 0) {
      // check if move is self capture 
      this.getCaptures(captures, point, color);
  
      // self-capture 
      if (captures.numCaptures > 0) {
        this.setInactive(stone);
        return -1;
      }
    } 

    this.setColor(stone, color, 1);  
    
    this.removeCaptures(captures);

    return 1;
  },

  // Check if "color" stones are captured at the point
  // @param color: the color of the stones that checking to see whether they
  //    got captured or not
  getCaptures: function(captures, point, color, dir) {
    this.findConnected(captures, point, color);
    if (captures.liberties <= 0) this.addCaptures(captures);
    this.clearExceptCaptures(captures);
  },

  // find the stones of the same color connected to eachother 
  findConnected: function(captures, point, color) {
    // check to make sure we haven't already seen a stone
    // and that the point is not out of bounds.  If 
    // either of these conditions fail, return immediately. 
    //
    // TODO: Change so it works with a cropped board 
    if (captures.seen[point.toString()] !== undefined || 
        util.outBounds(point.x, global.maxIntersects) ||
        util.outBounds(point.y, global.maxIntersects)) { 
      // we're done 
    } else {

      // note that we've seen the point 
      captures.seen[point.toString()] = true;

      var stoneColor = rules.getStone(point).state.color;
      if (stoneColor === "empty" )    {
        // add a liberty if the point is empty and return 
        captures.liberties = captures.liberties + 1; 
      } else if (stoneColor === rules.oppositeColor(color)) {
        // return and don't add liberties 
      } else if (stoneColor === color) {
        // recursively add connected stones 
        captures.considering.push(point);
        this.findConnected(captures, new util.Point(point.x + 1, point.y), color);
        this.findConnected(captures, new util.Point(point.x - 1, point.y), color);
        this.findConnected(captures, new util.Point(point.x, point.y + 1), color);
        this.findConnected(captures, new util.Point(point.x, point.y - 1), color);
      } else {
        // Sanity check. Alternatively, we could treat this as the "empty" state.
        throw "Unknown color error: " + stone.state.color;
      }
    }
  },

  clearExceptCaptures: function(capobj) {
    capobj.considering = [];
    capobj.seen = {};
    capobj.liberties = 0; 
  },

  removeCaptures: function(capobj) {
    var toCapture = capobj.toCapture;
    for (cindex in toCapture) {
      var point = util.pointFromString(cindex);
      var stone = rules.getStone(point);
      this.setInactive(stone);
      this.clearColor(stone);
    } 
  },

  addCaptures: function(capobj) {
    for (var i = 0; i < capobj.considering.length; i++) {
      var value = capobj.considering[i];
      // we need a hash to guarantee uniqueness
      if (capobj.toCapture[value] === undefined) {
        capobj.toCapture[value.toString()] = true;
        capobj.numCaptures++;
      }
    } 
  },

  newCaptureObject: function() {
    return {toCapture: {}, numCaptures: 0, considering: [], seen: {}, liberties: 0}; 
  },

  setActive: function(stone, color) {
    stone.state.color = color;
    stone.state.placed = true;
  },

  setInactive: function(stone) {
    stone.state.color = global.states.EMPTY;
    stone.state.placed = false;
  },

  setColor: function(stone, color, opacity) {
    var gradient = rules.getGradient();
    stone.circ.attr({
      fill: color, // color or gradient
      "stroke-opacity": 1,
    });
    stone.circ.show();
    if (opacity >= 0 && opacity <= 1) {
      stone.circ.attr({
        "fill-opacity": opacity,
        opacity: opacity,
      });
    } else {
      stone.circ.attr({
        "fill-opacity": 1,
        opacity: 1,
      });
    }
  },

  clearColor: function(stone) {
    stone.circ.attr({
      fill: "white", 
      opacity: 0,
      "fill-opacity" : 0,
    });
    stone.circ.attr("fill-opacity", 0);
    stone.circ.hide();
  },
};

})();
