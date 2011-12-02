var webload = (function() {

  var webcontent = {};

  var loadWebpage = function() {
    $(document).ready( function() {
      var defaultPage = "home"; 
      if (window.location.hash) defaultPage = window.location.hash.slice(1);
      loadWebpage(defaultPage);
    });
  };

  // For the initial load --> Initializes the top buttons
  // and then performs a manual hashChange
  var loadWebpage = function(page) { 
    createButtons("newlinklist", ".jtoplink");
    hashChange(page);
  };

  var getContent = function(location) {
    $("#mainbox").empty();
    if (webcontent[location] === undefined) {
      $.get(location, function(data) {
        webcontent[location] = data; 
        replaceContent(data);
      }); 
    } else {
      replaceContent(webcontent[location]);
    }
  };

  var replaceContent = function(content) {
    $("#mainbox").empty();
    $("#mainbox").attr({type: "hidden"})
    $("#mainbox").append(content);
    createButtons("mainbox", ".jlink");
    $("#mainbox").attr({type: "visible"})
  }

  var createButtons = function(id, classname) {
    $("#"+id).find(classname).each(function(i) { 
      var that = this;
      $(this).click(function(){ 
        location.hash = that.getAttribute("location");
      });
      $(this).hover(
        function(){ $(that).css("color", "#880000"); },
        function(){ $(that).css("color", "#CC4500"); }
      )
    });
  };

  var hashChange = function(inhash) { 
    var hash = inhash || window.location.hash.slice(1);
    if (hash === undefined || hash === "") hash = "home";
    getContent(hash + ".html"); 
  };

  if (("onhashchange" in window) && !($.browser.msie)) {
    window.onhashchange = function() {
      hashChange();
    }   
  } else {
    var prevHash = window.location.hash;
    window.setInterval(function () {
      if (window.location.hash !== prevHash) {
        prevHash = window.location.hash;
        getContent(window.location.hash.slice(1));
      }   
    }, 300);
  };

  return loadWebpage();
});

