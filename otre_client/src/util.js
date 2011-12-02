(function() {

otre.util =  {
  // returns true if a number is inside a bounds (non-inclusive) and not negative 
  inBounds: function(num, bounds) {
    return ((num < bounds) && (num >= 0));
  },

  // returns true if a number is outside a bounds (inclusive) or negative  
  outBounds: function(num, bounds) {
    var out = ((num >= bounds) || (num < 0));
    return out;
  },

  // Array utility functions
  // is_array is Taken from JavaScript: The Good Parts
  is_array: function (value) {
    return value && typeof value === 'object' && value.constructor === Array;
  },

  searchRemove: function(item, array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].toString() === item.toString()) {
        array.splice(i, 1);
      }
    }
  },

  searchRemovePts: function(pt, array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].toString() === pt.toString()) {
        array.splice(i, 1);
      }
    }
  },

  existsIn: function(item, array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].toString() == item.toString()) {
        return i;
      }
    }
    return -1;
  },

  uniqueElements: function(ptArray) {
    ptArray.sort();
    var cur = ptArray[0];
    for (var i = 1; i < ptArray.length; i++) {
      var next = ptArray[i];
      if (cur.toString() === next.toString()) {
        ptArray.splice(i, 1);
      }
      cur = next;
    }
    return ptArray;
  },

  uniqueNums: function(numArray) {
    numArray.sort();
    var cur = numArray[0];
    for (var i = 1; i < numArray.length; i++) {
      var next = numArray[i];
      if (cur === next) {
        numArray.splice(i, 1);
      }
      cur = next;
    }
    return numArray;
  },

  uniqueGroupsFromStones: function(stoneArray) {
    var groupIndices = [];
    for (var i = 0; i < stoneArray.length; i++) {
      var index = stoneArray[i].groupIndex;
      if (existsIn(index, groupIndices) === -1) {
        groupIndices.push(index);
      }
    }
    return groupIndices;
  },

};

otre.math = { 
  abs: function(num) {
    if (num >= 0) return num;
    else return num * -1; 
  },  
  max: function(num1, num2) {
    if (num1 > num2) return num1;
    else return num2;
  },  
  min: function(num1, num2) {
    if (num1 > num2) return num2;
    else return num1;
  },  
  isEven: function(num1) {
    if ((num1 % 2) == 0) return true;
    else return false;
  }
};


// Point data structure 
otre.util.Point = function(x, y) {
  this.x = x;
  this.y = y;
};

otre.util.Point.prototype.toString = function() {
  return this.x + "," + this.y; 
};

otre.util.Point.prototype.value = function() {
  return this.toString();
};

otre.util.Point.prototype.equals = function(point) {
  return this.x === point.x && this.y === point.y; 
};


otre.util.pointFromString = function(str) {
  try {
    var split = str.split(",");
    var x = parseInt(split[0]);
    var y = parseInt(split[1]);
    return new otre.util.Point(x, y); 
  } catch(e) {
    throw "Parsing Error! Couldn't parse a point from: " + str;
  }  
}

// Logging stuff (for debugging) 
var Log = function(logDiv, numMsgs) {
  this.name = logDiv;
  this.num = numMsgs;
  this.curMsgs = 0;
};


Log.prototype.println = function(msg) {
  var modmsg = msg;
  $('<p>' + modmsg + '</p>').appendTo(this.name);
  this.curMsgs++;
  if (this.curMsgs > this.num) {
    $(this.name).children("p:first").remove();
    this.curMsgs = this.curMsgs - 1;
  }
};

Log.prototype.printArr = function(arr) {
  for (var i = 0; i < arr.length; i++) {
    this.println(arr[i].toString());
  }
  this.println("----");
};

otre.logger = new Log("#otreLogger", 20);

})();

