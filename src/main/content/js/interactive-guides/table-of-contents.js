var tableofcontents = (function() {
    "use strict";

    //orderedStepArray: populated with the guide steps in order in which whey will be followed
    //orderedStepNamesArray: will used to map guide step name to the index(step number)
    var orderedStepArray = [];
    var orderedStepNamesArray = [];


    var __getNextStepFromName = function(name) {
      var stepIdx = orderedStepNamesArray.indexOf(name);
      return orderedStepArray[stepIdx+1];
    };

    var __getPrevStepFromName = function(name) {
      var stepIdx = orderedStepNamesArray.indexOf(name);
      return orderedStepArray[stepIdx-1];
    };

    /*
        Creates the table of contents for the BluePrint based on the JSON representation.
        Input: The steps of the BluePrint represented as JSON
    */
    var __create = function(title, steps){
        var container = $("#toc_container");
        $(ID.tableOfContentsTitle).after(container);

        __setTitle(title);

        // Loop through the steps and append each one to the table of contents.
        for(var i = 0; i < steps.length; i++){
          var step = steps[i];
          __buildStep(container, step, 0);
        }
    };

    /*
        Set the table of content's title
    */
    var __setTitle = function(title) {
      var toc_title = $("#toc_title");
      toc_title.text(title);
    };

    /*
       Parses a given step and adds it to the container
       Depth is the given depth of the tree so that it can recursively create steps. The depth determines
       how much left-padding the step list item has in the table of contents.
       Input: {div} container, {JSON} step, {number} depth
    */
    var __buildStep = function(container, step, depth, parentName){
      var listItem = $("<li class='tableOfContentsStep'></li>");
      listItem.attr('title', step.title);
      listItem.attr('aria-label', step.title);
      listItem.attr('data-toc', step.name);
      listItem.attr('role', 'presentation');
      listItem.attr('tabindex', '0');
      if(parent){
        listItem.attr('data-parent', parentName);
      }

      // Indent based on depth
      listItem.css('padding-left', depth * 30 + 'px');

      // Set text for the step
      var span = $("<span class='tableOfContentsSpan'>");
      span.text(step.title);
      listItem.append(span);

      __addOnClickListener(listItem, step);
      container.append(listItem);

      //used for previous/next button functionality
      orderedStepArray.push(step);
      orderedStepNamesArray.push(step.name);

      console.log("Added: " + step.name);
      // Handle children steps recursively if the step has sub-steps.
      if(step.steps !== undefined && step.steps !== null){
        for(var i = 0; i < step.steps.length; i++){
          var child = step.steps[i];
          __buildStep(container, child, depth + 1, step.name);
        }
      }
    };

    /*
        Handler for clicking on a step in the table of contents.
        @param - `span` is the span of the step in the table of contents
        @param - `step` is the JSON containing information for the step
    */
    var __addOnClickListener = function(listItem, step) {
        var span = listItem.find('.tableOfContentsSpan');
        span.on("click", function(event){
            event.preventDefault();
            event.stopPropagation();

            console.log("Clicked step: " + step.name);
            stepContent.createContents(step);
        });

        listItem.on("keydown", function(event){
          // Enter key and space key
          if(event.which === 13 || event.which === 32){
            span.click();
            // Focus the description for improved accessibility
            $(ID.blueprintDescription).focus();
          }
        });
    };

    var __getStepElement = function(name){
      return $("[data-toc='" + name + "']");
    };

    /*
        Handles 1. table of content steps clicks and 2. Prev/Next step button clicks
        Select the step in the table of contents.
    */
    var __selectStep = function(stepObj, navButtonClick){
      // Clear previously selected step and highlight step
      $('.selectedStep').removeClass('selectedStep');
      var $step = __getStepElement(stepObj.name);
      $step.addClass('selectedStep');

      //Hide the previous and next buttons when not needed
      var stepIndex = orderedStepNamesArray.indexOf(stepObj.name);
      var last = orderedStepNamesArray.length - 1;

      jQuery.fn.visible = function() {
        return this.css('visibility', 'visible');
      };
      
      jQuery.fn.invisible = function() {
          return this.css('visibility', 'hidden');
      };
      
      jQuery.fn.visibilityToggle = function() {
          return this.css('visibility', function(i, visibility) {
              return (visibility == 'visible') ? 'hidden' : 'visible';
          });
      };
    
      if (stepIndex == 0) {
        // $(ID.prevButton).hide();
        $(ID.prevButton).invisible();
      } else {
        // $(ID.prevButton).show();
        $(ID.prevButton).visible();
      }
      if (stepIndex == last) {
        // $(ID.nextButton).hide();
        $(ID.nextButton).invisible();
      } else {
        // $(ID.nextButton).show();
        $(ID.nextButton).visible();
      }
    };

    return {
      create: __create,
      selectStep: __selectStep,
      nextStepFromName: __getNextStepFromName,
      prevStepFromName: __getPrevStepFromName
    };

})();
