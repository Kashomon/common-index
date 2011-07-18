/*
 * JGoDiaplay
 *
 *  Created by Josh Hoak
 *  Licensed under the MIT license 
 *
 */


var testCircle = function(paper) {
  var circle = paper.circle(50, 40, 10);
  circle.attr("fill", "#f00");
  circle.attr("stroke", "#fff");
}


var GoInstance = (function() {

  var labelColors = ["white", "white"];
  var stoneColors = ["blue", "red"];
  var currentPlayer = 0;
  var placeOpacity = 1;
  var stoneArray = new Array();

  // group tracking 
  var instanceGroups = new Array();
  var log;

  var numIntersects;

  var createInstance = function(paper, spacing, numIntersectsIn, logName) {
    numIntersects = numIntersectsIn;
    this.spacing = spacing;
    log = new Log(logName, 20)

    var starSize = spacing / 16;
    var left = spacing; var top = spacing;
    var right = left + (numIntersects - 1) * spacing;
    var bot = top + (numIntersects - 1) * spacing;

    var sectCoords = new Array();
    this.sectCoords = sectCoords;

    for (var i = 0; i < numIntersects; i++) {
      var spaceAmt = i * spacing;
      var row = new Array();

      for (var j = 0; j < numIntersects; j++) {
        row[j] = new Point(j * spacing + spacing, spaceAmt + spacing) 
      }


      /* Store the pixel coordinates of the intersection */
      sectCoords[i] = row;
      
      /* Initialize the lines */
      var hline = paper.path("M" + left + " " + (top + spaceAmt) + 
          "L" + right + " " + (top + spaceAmt));
      var vline = paper.path("M" + (left + spaceAmt) + " " + (top) + 
          "L" + (left + spaceAmt) + " " + (bot));


      if (i == 0 || i == numIntersects - 1) {
        hline.attr("stroke-width", 1);
        vline.attr("stroke-width", 1); 
      } else {
        hline.attr("stroke-width", .5);
        vline.attr("stroke-width", .5);
      }

      vline.attr("stroke-linecap", "round");
      hline.attr("stroke-linecap", "round");
    }

    /* Initialize the star points */
    if (numIntersects === 19) {
      var starPoints = paper.set();
      starPoints.push(
        paper.circle(sectCoords[3][3].x, sectCoords[3][3].y, starSize),
        paper.circle(sectCoords[3][9].x, sectCoords[3][9].y, starSize),
        paper.circle(sectCoords[3][15].x, sectCoords[3][15].y, starSize),
        paper.circle(sectCoords[9][3].x, sectCoords[9][3].y, starSize),
        paper.circle(sectCoords[9][9].x, sectCoords[9][9].y, starSize),
        paper.circle(sectCoords[9][15].x, sectCoords[9][15].y, starSize),
        paper.circle(sectCoords[15][3].x, sectCoords[15][3].y, starSize),
        paper.circle(sectCoords[15][9].x, sectCoords[15][9].y, starSize),
        paper.circle(sectCoords[15][15].x, sectCoords[15][15].y, starSize)
      );
      starPoints.attr({fill: "black"});
    }

    /* Initialize the stones */
    var x = 0;
    var tmpStoneArray = new Array();
    var stoneSpacing = spacing / 2 -.5;
    for (var i = 0; i < numIntersects; i++)  {
      var stoneRow = new Array()
      for (var j = 0; j < numIntersects; j++) {
        var newStone = new GoStone(sectCoords[i][j], stoneSpacing, new Point(j, i));
        stoneRow[j] = newStone;
        x += 1;
      }
      tmpStoneArray[i] = stoneRow;
    }
    stoneArray = tmpStoneArray;
      
    /* Initialize stones */
  };

  var Group = function(stone, libArray) {

    this.index = stone.groupIndex
    this.stones = new Array(0);
    this.stones[0] = stone;
    this.liberties = libArray;
    var gthat = this;
    var pindex = this.index;

  };

  Group.prototype.addStone = function(stone) {
    this.stones.push(stone);
  };

  Group.prototype.addStoneRecalc = function(stone) {
    this.stones.push(stone);
    this.calcLibs();
  };

  Group.prototype.removeAll = function() {
    for(var i = 0; i < this.stones.length; i++) {
      this.stones[i].remove();
    }
    this.stones.length = 0;
  };

  Group.prototype.calcLibs = function() {
    log.println("Calculating liberties");
    var libs = new Array(); // array of points 
    for(var i = 0; i < this.stones.length; i++) {
      var pts = this.stones[i].freeSpaces(); 
      for (var j = 0; j < pts.length; j++) {
        libs.push(pts[j]);
      }
    } 
    // remove repeats
    this.liberties = uniqueElements(libs);
    this.relabel()
  };

  Group.prototype.combineGroup = function(grp) {
    while (grp.stones.length > 0) {
      var tmpStone = grp.stones.pop();
      tmpStone.groupIndex = this.index;
      this.stones.push(tmpStone); 
    }
    this.calcLibs();
    grp.stones.length = 0;
    grp.liberties.length = 0;
  };

  Group.prototype.removeLiberty = function(pt) {
    searchRemovePts(pt, this.liberties);
    if (this.liberties.length <= 0) {
      return this.index;
    }
    this.relabel();
    return -1;
  };

  Group.prototype.captureGroup = function() {
    var groupIndices = new Array();
    for (var i = 0; i < this.stones.length; i++) {
      var nstones = this.stones[i].findNeighborsOpp();
      for (var j = 0; j < nstones.length; j++) {
        groupIndices.push(nstones[j].groupIndex);
      }
    }
    uniqueNums(groupIndices);
    this.removeAll();
    for (var i = 0; i < groupIndices.length; i++) {
      instanceGroups[groupIndices[i]].calcLibs();
    }
  };

  Group.prototype.relabel = function() {
    for(var i = 0; i < this.stones.length; i++) {
      this.stones[i].relabel();
    }
  };

  /* Go Stone object */
  var GoStone = function(pixelSect, rad, boardSect) {
  
    var that = this;

    this.placed = false; // set on mousedown
    this.color = "notset"; // set on mousedown

    this.groupIndex = -2;

    this.lbl = undefined;
    this.boardSect = boardSect;
    this.pixelSect = pixelSect;
    var pBoardPoint = boardSect;
    var pPixelSect = pixelSect;

    var ms = 100;
    var circ = paper.circle(pixelSect.x, pixelSect.y, rad); 
    this.circ = circ;
    circ.attr({
      fill: "blue",
      opacity: 0});

    this.lbl; 
    circ.hover(function (event) {
      var libs = checkLiberties(that);
      if (libs > 0) {
        if (that.placed === false) {
          circ.attr({
            fill: stoneColors[currentPlayer],
            opacity: .50});
        } else { // placed === true 

        }
      }
    }, function (event) {
      if (that.placed === false) {
        circ.animate({
          opacity: 0}, 400); 
      }
    }); 

    circ.mousedown(function() {
      if (that.placed === false) {
        var libs = checkLiberties(that);

        if (libs > 0) {
          libArray = addedLibs(that)

          circ.attr({ 
            fill: stoneColors[currentPlayer],
            opacity: 1 
          });
  
          that.placed = true;
          that.color = stoneColors[currentPlayer];
          connectToGroup(that);
        
          //  Create a label 
          if (that.lbl !== undefined) {
            that.lbl.remove()
          }

          var player = colorToPlayer(that.color)

          that.lbl = paper.text(pPixelSect.x, pPixelSect.y, instanceGroups[that.groupIndex].liberties.length)
            .attr({"font": '14px Fontin-Sans, Arial', stroke: "none", fill: labelColors[1 - player]});
  
          currentPlayer = 1 - currentPlayer;
        }
      }
    });
  };

  var findNborPoints = function(fthat) {
    var pts = new Array();
    for(var i = 0; i < 2; i++) {
      for(var j = 0; j < 2; j++) {
        var xIndex = (1 - j * 2) * (1 - i) + fthat.boardSect.x; 
        var yIndex = (1 - j * 2) * (i) + fthat.boardSect.y;
        var pt = new Point(xIndex, yIndex);
        pts[(1 - i) * 2 + j] = pt;
      }
    }
    return pts; 
  }; 

  var findNeighbors = function(pthat) {
    var neighbors = new Array();
    for(var i = 0; i < 2; i++) {
      for(var j = 0; j < 2; j++) {
        var xIndex = (1 - j * 2) * (1 - i) + pthat.boardSect.x;
        var yIndex = (1 - j * 2) * (i) + pthat.boardSect.y;
        if (inBounds(xIndex, numIntersects) && 
            inBounds(yIndex, numIntersects)) {
          var stone = stoneArray[yIndex][xIndex];
          if (stone.color !== "notset") {
            neighbors.push(stone);
          }
        }
      }
    }
    return neighbors;
  };


  // Useful for Capturing purposes 
  GoStone.prototype.findNeighborsOpp = function() {
    var neighbors = new Array();
    for(var i = 0; i < 2; i++) {
      for(var j = 0; j < 2; j++) {
        var xIndex = (1 - j * 2) * (1 - i) + this.boardSect.x;
        var yIndex = (1 - j * 2) * (i) + this.boardSect.y;
        if (inBounds(xIndex, numIntersects) && 
            inBounds(yIndex, numIntersects)) {
          var nstone = stoneArray[yIndex][xIndex];
          if (nstone.color !== "notset" && nstone.color !== this.color) {
            neighbors.push(nstone);
          }
        }
      }
    }
    return neighbors;
  };

  var findOppSpaces = function(pthat) {
    var oppSpaces = new Array();
    for(var i = 0; i < 2; i++) {
      for(var j = 0; j < 2; j++) {
        var xIndex = (1 - j * 2) * (1 - i) + pthat.boardSect.x;
        var yIndex = (1 - j * 2) * (i) + pthat.boardSect.y;
        if (inBounds(xIndex, numIntersects) && 
            inBounds(yIndex, numIntersects)) {
          var stone = stoneArray[yIndex][xIndex];
          if (stone.color !== "notset" && stone.color !== stoneColor[currentPlayer]) {
            oppSpaces.push(new Point(xIndex, yIndex));
          }
        }
      }
    }
    return oppSpaces; 
  };

  var findFreeSpaces = function(pthat) {
    var freeSpaces = new Array();
    for(var i = 0; i < 2; i++) {
      for(var j = 0; j < 2; j++) {
        var xIndex = (1 - j * 2) * (1 - i) + pthat.boardSect.x;
        var yIndex = (1 - j * 2) * (i) + pthat.boardSect.y;
        if (inBounds(xIndex, numIntersects) && 
            inBounds(yIndex, numIntersects)) {
          var stone = stoneArray[yIndex][xIndex];
          if (stone.color === "notset") {
            freeSpaces.push(new Point(xIndex, yIndex));
          }
        }
      }
    }
    return freeSpaces;
  };

  var addedLibs = function(pthat) {
    var pts = findNborPoints(pthat);
    var liberties = 4;
    var libArray = pts.slice() // copy pts 
    for(var i = 0; i < pts.length; i++) {
      if (outBounds(pts[i].x, numIntersects, log) ||
          outBounds(pts[i].y, numIntersects, log)) {
        liberties--;
        searchRemovePts(pts[i], libArray, log);
      } else {
        var nStone = stoneArray[pts[i].y][pts[i].x];
        // Check to see if opposite color 
        if (nStone.color === stoneColors[1 - currentPlayer]) {
          liberties--;
          searchRemovePts(pts[i], libArray, log); 
        // Check to see if same color 
        } else if (nStone.color === stoneColors[currentPlayer] ) {
          liberties = liberties - 2
          searchRemovePts(pts[i], libArray, log); 
        } else if (nStone.color === "notset") {
          // no effect on liberties
        } else {
          // nothing here 
        }
      }
    }
    return libArray;
  };  

  var checkLiberties = function(pthat) {
    var pts = findNborPoints(pthat);
    var liberties = 4;
    for(var i = 0; i < pts.length; i++) {
      if (!(inBounds(pts[i].x, numIntersects) &&
            inBounds(pts[i].y, numIntersects))) {
        liberties--;
      } else {
        var nStone = stoneArray[pts[i].y][pts[i].x];
        // Opposite color 
        if (nStone.color === stoneColors[1 - currentPlayer]) {
          liberties--;

        // Same color 
        } else if (nStone.color === stoneColors[currentPlayer] ) {
          liberties = liberties + instanceGroups[nStone.groupIndex].liberties.length - 2;
        } else if (nStone.color === "notset") {
          // no effect on liberties
        } else {
          //alert("not caught")
        }
      }
    }
    return liberties;
  };  

  var connectToGroup = function(pthat) {
    var nbors = findNeighbors(pthat);
    var captureGroups = new Array(); // of ints (groupIndices);
    for(var i = 0; i < nbors.length; i++) {  
      var nStone = nbors[i];

      // Case: Neighboring stone same color as that-stone
      if (nStone.groupIndex > -1 && nStone.color === pthat.color) {
        // that Stone already part of group, diff than nStone 
        if (nStone.groupIndex !== pthat.groupIndex &&
            pthat.groupIndex > -1) {
          // connect groups
          log.println("Connecting groups");
          instanceGroups[pthat.groupIndex].combineGroup(instanceGroups[nStone.groupIndex]);

        // that  Stone not part of group yet
        } else if (nStone.groupIndex !== pthat.groupIndex &&
                   pthat.groupIndex < 0) {   
          log.println("Adding Stone to Existing group");
          pthat.groupIndex = nStone.groupIndex;
          instanceGroups[nStone.groupIndex].addStoneRecalc(pthat);
        }

      // Case: Neighboring stone different color as that-stone 
      // Problem: Need to capture after group is assigned 
      } else if (nStone.groupIndex > -1 && nStone.color !== pthat.color) {
        log.println("Removing Liberty");
        var captureGrp = instanceGroups[nStone.groupIndex].removeLiberty(pthat.boardSect);
        if (captureGrp >= 0) {
          captureGroups.push(captureGrp);
        }
      }
    }

    if (pthat.groupIndex < 0 ) {
      log.println("Creating new group");
      pthat.groupIndex = instanceGroups.length;
      var libArray = findFreeSpaces(pthat);
      instanceGroups.push(new Group(pthat, libArray));
    }

    for (var i = 0; i < captureGroups.length; i++) { 
      log.println("Capturing Group");
      instanceGroups[captureGroups[i]].captureGroup();
    }

  };

  GoStone.prototype.relabel = function() {
    if (this.lbl !== undefined) {
       this.lbl.remove();
    }
    var player = colorToPlayer(this.color);
    this.lbl = paper.text(this.pixelSect.x, this.pixelSect.y, instanceGroups[this.groupIndex].liberties.length)
      .attr({"font": '14px Fontin-Sans, Arial', stroke: "none", fill: labelColors[1 - player]});
  };

  GoStone.prototype.remove = function() {
    this.groupIndex = -10;
    this.placed = false;
    this.color = "notset"; 
    this.lbl.remove();
    this.circ.attr({
      opacity: 0  
    });
  };

  GoStone.prototype.freeSpaces = function() { 
    return findFreeSpaces(this);
  }


  // Utility Functions 
  var inBounds = function(num, bounds) {
    return ((num < bounds) && (num > -1));
  };
  
  var outBounds = function(num, bounds, log) {
    var out = ((num >= bounds) || (num < 0));
    return out;
  };

  var colorToPlayer = function(color) {
    if (color === stoneColors[0]) {
      return 0;
    } else if (color === stoneColors[1]) {
      return 1;
    } else {
      return -1;
    }
  };
  
  // Array utility functions
  var searchRemove = function(item, array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].toString() === item.toString()) {
        array.splice(i, 1);
      }
    }
  };
  
  var searchRemovePts = function(pt, array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].toString() === pt.toString()) {
        array.splice(i, 1);
      }
    }
  };
  
  var existsIn = function(item, array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].toString() == item.toString()) {
        return i; 
      }
    }
    return -1;
  };


  var uniqueElements = function(ptArray) {
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
  };
  
  var uniqueNums = function(numArray) {
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
  };

  var uniqueGroupsFromStones = function(stoneArray) {
    var groupIndices = new Array();
    for (var i = 0; i < stoneArray.length; i++) {
      var index = stoneArray[i].groupIndex;
      if (existsIn(index, groupIndices) === -1) {
        groupIndices.push(index); 
      }
    }
    return groupIndices;
  };

  return createInstance; 
})();




// Utility Functions 



// A Generic Point  -- The most frequent data structure used 
var Point = function(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.toString = function() {
  return "(" + this.x + "," + this.y + ")"
}

Point.prototype.value = function() {
  return this.toString();
}




// Logging 
var Log = function(logDiv, numMsgs) {
  this.name = logDiv;
  this.num = numMsgs;
  this.curMsgs = 0;
};

Log.prototype.println = function(msg) {
  var modmsg = msg ? msg : " ";
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


