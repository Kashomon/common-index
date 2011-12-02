(function() {
 
var log = otre.logger; 

otre.display = {

  // Initialize the otre display 
  // @paper: The raphael paper object 
  // @divName: The name of the div in which the paper lives.  (TODO this should probably be eliminated)
  // @maxIntersects: the maximum # of intersects on each side.  
  //    Typically: 19x19, 13x13, or 9x9
  //    Note that the real number of intersects will often be smaller than
  //    the max due to a cropbox
  // 
  // Some side effects:
  //    GoStones are initialized and added to the global data.
  //    The maxIntersects are added to the global data
  //
  init: function(paper, divName, maxIntersects) {
    var cropbox = this.createDefaultBox();
    var drawDetails = this.createDetails(paper, divName, maxIntersects, cropbox); 
    var drawBackground = this.drawBackground(paper, drawDetails);
    this.drawLines(paper, drawDetails);
    var foundIntersects = this.findIntersections(drawDetails);
    this.drawStarPoints(paper, drawDetails, foundIntersects);
    
    // create the stones and stone-event handlers and init some global data.
    otre.global.stones = this.createHandlers(paper, drawDetails, foundIntersects);
    otre.global.maxIntersects = maxIntersects; 
    otre.global.paper = paper;
  },

  createDefaultBox: function() {
    var out = {};
    out["topLeft"] = new otre.util.Point(1, 1);
    out["botRight"] = new otre.util.Point(19, 19); 
    //out["topLeft"] = new Point(9, 1);
    //out["botRight"] = new Point(19, 10);
    return out;
  },

  createDetails: function(paper, divName, maxIntersects, cropbox) {
    var divHeight = ($(divName).innerHeight()),
        divWidth  = ($(divName).innerWidth()),
        xpoints   = cropbox.botRight.x - cropbox.topLeft.x + 1,
        ypoints   = cropbox.botRight.y - cropbox.topLeft.y + 1,
        spacing   = otre.math.min(divHeight / (ypoints + 1), divWidth / (xpoints + 1) ),
        xbuffer   = divWidth  - (xpoints - 1) * spacing, // different if cropbox makes a rectangle 
        ybuffer   = divHeight - (ypoints - 1) * spacing, // different if cropbox makes a rectangle 
        top       = ybuffer / 2,
        bot       = divHeight - ybuffer / 2,
        left      = xbuffer / 2,
        right     = divWidth - xbuffer / 2,
        width     = right - left,
        height    = bot - top,
        topExt    = (cropbox.topLeft.y > 1) ? spacing / 2 : 0,
        botExt    = (cropbox.botRight.y < maxIntersects) ? spacing / 2 : 0,
        leftExt   = (cropbox.topLeft.x > 1) ? spacing / 2 : 0,
        rightExt  = (cropbox.botRight.x < maxIntersects) ? spacing / 2 : 0;

    if ((bot - top).toInt !== (right - left).toInt) 
      throw "Height and Width must be equal: h: " + (bot - top) + ", w: " + (right- left);

    var drawDetails = { 
      divName: divName,
      maxIntersects: maxIntersects,
      topLeft: cropbox.topLeft,
      botRight: cropbox.botRight,
      xpoints: xpoints,
      ypoints: ypoints,

      // The spacing between intersections (and also lines)
      spacing: spacing,

      // The edges of the Go Board 
      top: top,
      bot: bot,
      left: left,
      right: right,

      // for making the background
      width: width,
      height: height,

      // Note that extensions are for when we have a cropbox (so everything
      // remains square).
      topExt: topExt, 
      botExt: botExt,
      leftExt: leftExt,
      rightExt: rightExt,
    };

    return drawDetails;
  },

  drawBackground: function(paper, details) {
    var halfspacing = details.spacing / 2;
    paper.rect(details.left - halfspacing, details.top - halfspacing, details.width + details.spacing, details.height + details.spacing).attr({fill: "#f5be7e"});
    //paper.rect(details.top, details.left, details.width, details.height).attr({fill: "#f1b67a"});
  },

  drawLines: function(paper, details) {
    var filling = function(line, index, maxSects) {
      if (index === 1 || index === maxSects) {
        line.attr("stroke-width", 2.5);
      } else {
        line.attr("stroke-with", 0.5);
      }
      line.attr("stroke-linecap", "round");
    };

    for (var i = 0; i < details.ypoints; i++) {
      var spaceAmt = i * details.spacing;
      var hline = paper.path("M" + (details.left - details.leftExt) + " " +
          (details.top + spaceAmt) + "L" + (details.right + details.rightExt) +
          " " + (details.top + spaceAmt));
      filling(hline, i + details.topLeft.y, details.maxIntersects);
    }

    for (var i = 0; i < details.xpoints; i++) {
      var spaceAmt = i * details.spacing;
      var hline = paper.path("M" + (details.left + spaceAmt) + " " +
          (details.top - details.topExt) + "L" + (details.left + spaceAmt) + 
          " " + (details.bot + details.botExt));
      filling(hline, i + details.topLeft.x, details.maxIntersects);
    }
  },

  // Find all the coordinates of each intersection (for drawing purposes)
  // @details: drawDetails created by otre.display.createDetails 
  // @return: an array indexed by [x][y] of pixel coordinates for intersections
  findIntersections: function(details) {
    var columns = [];
    for (var i = 0; i < details.xpoints; i++) { // 
      columns[details.topLeft.x + i - 1] = [];
      for (var j = 0; j < details.ypoints; j++) {
        columns[details.topLeft.x + i - 1][details.topLeft.y + j - 1] = new otre.util.Point(details.left + details.spacing * i, details.top + details.spacing * j);
      }     
    }     
    return columns;
  },

  drawStarPoints: function(paper, details, intersects) {
    var starSize = details.spacing / 10;
    var points = [];
    var starSet = paper.set();

    // Add the center star point for all boards 
    if (!otre.math.isEven(intersects.length)) points.push((intersects.length - 1) / 2); 

    // add the star points for the 19x19 board 
    if (details.maxIntersects === 19) { points.push(3); points.push(15); }
    

    for (var i = 0; i < points.length; i++) {
      for (var j = 0; j < points.length; j++) {
        if (intersects[points[i]] !== undefined && intersects[points[i]][points[j]] !== undefined) {
          var sect = intersects[points[i]][points[j]];
          starSet.push(paper.circle(sect.x, sect.y, starSize))
        }
      }
    }
    starSet.attr({fill: "black"});
  },

  createHandlers: function(paper, details, intersects) {
    var columns = [];
    var radius = details.spacing / 2 - .1;
    for (var i = 0; i < details.maxIntersects; i++) {
      var row = [];
      for (var j = 0; j < details.maxIntersects; j++) {
        // It is necessary to check for undefined intersects when go board is cropped 
        if (intersects[i] != undefined && intersects[i][j] !== undefined) {
          row[j] = new otre.GoStone(paper, intersects[i][j], new otre.util.Point(i, j), radius);
        }
      }
      columns[i] = row;
    }
    return columns;
  },
}

})();
