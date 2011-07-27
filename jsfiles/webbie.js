var webload = (function() {

  var webcontent = {};

  var loadWebpage = function() {
    $(document).ready( function() {
      createButtons("newlinklist", ".jtoplink");
      loadContent("indexcontent.html")
    });
  };

  var loadContent = function(location) {
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
    $("#mainbox").append(content);
    createButtons("mainbox", "jlink");
  }

  var createButtons = function(id, classname) {
    $("#"+id).find(classname).each(function(i) { 
      var that = this;
      $(this).click(function(){ loadContent(that.getAttribute("location")); });
      $(this).hover(
        function(){ $(that).css("color", "#880000"); },
        function(){ $(that).css("color", "#CC4500"); }
      )
    });
  };

  return loadWebpage();
});

