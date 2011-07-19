var webload = (function() {

  var loadWebpage = function() {
    $(document).ready( function() {
      createButtons("newlinklist", ".jtoplink");
      loadContent("indexcontent.html")
    });
  };

  var loadContent = function(location) {
    $("#mainbox").load(location, function() { createButtons("mainbox", "jlink"); });
    /*
    $.get(location, function(data) {
      $("#mainbox").empty();
      $("#mainbox").append(data);
      createButtons("mainbox", "jlink");
    });
    */
  };

  var createButtons = function(id, classname) {
    $("#"+id).find(classname).each(function(i){ 
      var that = this;
      $(this).click(function(){ loadContent(that.getAttribute("location")); });
    });
  };

  return loadWebpage();
});

