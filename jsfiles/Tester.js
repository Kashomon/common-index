

var Tester = (function() {

  var paper;
  var log;
  
  var init = function(name, l1, l2, logname) {
    paper = Raphael(name, l1, l2);
    var numMessages = 20;
    log = new Log(logname, 20);
    log.println("starting");
  
    var padding = 5;
    var spacing = Math.min(l1 - 2 * padding, l2 - 2 * padding) / 10;
    var rad     = spacing / 2;

    var rectos = new Array(); 
    for (var i = 0; i < 9; i++) {
      var row = new Array();
      rectos[i] = row  
      for (var j = 0; j < 9; j++) {
        var y = i * spacing + padding; 
        var x = j * spacing + padding;
        var rect = paper.rect(x, y, spacing - padding, spacing - padding, 10);
        rectos[i][j] = new RectoWrapper(rect, i, j, log);
      }
    }
    log.println("done painting rectangles")
  };

  return init;

})();


var RectoWrapper = function(recto, i, j, log) {
  recto.attr({fill: "#ccc"}); 

  recto.mouseover(function(event)  { 
    this.animate({fill: "#F66"}, 50);
    log.println("mousedOver" + i + "," + j)
  }).mouseout(function(event) { 
    this.animate({fill: "#ccc"}, 400);
    });
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







