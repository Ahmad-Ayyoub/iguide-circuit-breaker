var fileBrowser = (function(){

  var _fileStructure = []; // JSON of the file browser structure
  var _fileBrowserRoot;

  var __create = function(container, fileTree) {
      _fileBrowserRoot = $("<div class='fileBrowser'></div>");
      container.append(_fileBrowserRoot);
  };

  /*
    Find the specified name within the file browser JSON.
    Inputs: {String} name: Name of the file/directory to find.
            {Object} dir: Directory
  */
  var __findElement = function(name, dir){
    var found = null;
    for(var i = 0; i < dir.length; i++){
      var elem = dir[i];
      // If the elem is a directory, check its name
      if(typeof(elem) === 'object'){
        if(elem.name === name){
          return elem;
        }
        else{
          // Check the files/directories under the directory
          if(elem.files){
            found = __findElement(name, elem.files);
            if(found){
              return found;
            }
          }
        }
      }
      // Elem is a file
      else{
        if(elem === name){
          return elem;
        }
      }
    }

    // If no elements are found in the directory return null
    return found;
  };

  /*
    Gets the jQuery DOM element using the data-name attribute.
  */
  var __getDomElement = function(name) {
    return $("[data-name='" + name + "']");
  };

  /*
    Insert the file or directory alphabetically into the container array
  */
  var __insertSorted = function($elem, container) {
      var index = 0;
      var val = $elem.text();
      var siblings = container.children();

      // Empty container
      if(siblings.length === 0){
        container.append($elem);
      }
      else{
        while(index < siblings.length && val.localeCompare(siblings.get(index).innerText) === 1){
          index++;
        }
        // If reached the end of the siblings then append at the end
        if(index === siblings.length){
          container.append($elem);
        }
        // Otherwise, append the $elem before the first sibling with a greater value
        else{
          var $sibling = $(siblings.get(index));
          $sibling.before($elem);
        }
      }
  };

  /*
    Creates a file or directory and adds it to the file browser.
    Inputs: {String} parent: Name of the parent DOM element.
            {String} name: Name of the new file/directory to be created.
            {Boolean} isDirectory: true if the element will be a directory / false if it is just a file
  */
  var __addFileElement = function(elem, parent, isDirectory){
    var $domElem = $("<div></div");
    var name = isDirectory ? elem.name : elem;
    $domElem.text(name);
    $domElem.attr('aria-label', name);
    $domElem.attr('tabindex', '0');
    $domElem.attr('data-name', name);
    $domElem.addClass('fileBrowserElement');

    var elemStructure;
    if(isDirectory){
      elemStructure = {};
      elemStructure.name = elem.name;
      elemStructure.files = [];
      $domElem.addClass('fileBrowserDirectory');
    }
    else{
      elemStructure = elem;
      $domElem.addClass('fileBrowserFile');
    }

    __addOnClickListener($domElem);

    // If no parent is specified then create the element under the root level
    if(!parent){
      $domElem.attr('data-treeLevel', 0);
      _fileStructure.push(elemStructure);
      __insertSorted($domElem, _fileBrowserRoot);
      // _fileBrowserRoot.append($domElem);
    }
    else{
      // Find the parent element in the fileBrowser object
      var parentDir = __findElement(parent, _fileStructure);
      var $parentDomElem = __getDomElement(parent);
      var treeLevel = $parentDomElem.attr('data-treeLevel');
      $domElem.attr('data-treeLevel', treeLevel + 1);
      __insertSorted($domElem, $parentDomElem);
      // $parentDomElem.append($domElem);

      // Only if the parent is a directory, add the file under it. If the parent is not a directory,
      // then we can't add the new file to it so add it to the root level directory.
      if(typeof(parentDir) === 'object'){
        parentDir.files.push(elemStructure);
      }
      else{
        _fileStructure.push(elemStructure);
      }
    }
  };

  var __addOnClickListener = function($elem) {
    $elem.on("keydown", function(event){
        event.stopPropagation();
        if(event.which === "13" || event.which === "32"){ // Enter key, Space key
          __handleClick($elem);
        }
    });
    $elem.on("dblclick", function(event){
        event.stopPropagation();
        __handleClick($elem);
    });
  };

  var __handleClick = function($elem){
    if($elem.hasClass('fileBrowserDirectory')){
      if($elem.hasClass('directory_collapsed')){
        // Expand the directory and its children
        $elem.removeClass('directory_collapsed');
        $elem.addClass('directory_expanded');
        $elem.children('.fileBrowserElement').attr('tabindex', '0'); // Using filter selector to only affect the first generation of children
        $elem.children().show();
      }
      else{
        // Collapse directory and its children
        $elem.removeClass('directory_expanded');
        $elem.addClass('directory_collapsed');
        $elem.children('.fileBrowserElement').attr('tabindex', '-1'); // Using filter selector to only affect the first generation of children
        $elem.children().hide();
      }
    }
    else{
      // TODO: Figure out what to do when the user clicks on a file.
    }
  };

  return {
    create: __create,
    addFileElement: __addFileElement
  }
})();
