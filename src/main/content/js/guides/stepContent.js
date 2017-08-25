var stepContent = (function() {
  "use strict";

  var currentStepName;
  var _steps;

  var __setSteps = function(steps) {
    _steps = steps;
  };

  var __getCurrentStepName = function() {
    return currentStepName;
  };

  // Hide the previous selected step content by looking for data-step attribute with the step name in it
  var __hideContents = function() {
    var stepToBeHidden = $("[data-step=" + currentStepName + "]");
    stepToBeHidden.addClass("hidden");
  };

  var __updateTitle = function(title) {
    $(ID.blueprintTitle).html(title);
  };

  // Update the step description text
  var __updateDescription = function(description, instruction) {
    var jointDescription = description;
    if ($.isArray(description)) {
      jointDescription = description.join("<br/>");
    }
    $(ID.blueprintDescription).html(jointDescription);
    if (instruction) {
      $(ID.blueprintDescription).append("<div class=\"instruction\">" + instruction + "</div>");
    }
  };

  /*
    Before create content for the selected step,
    - hide the content of the previous selected step
    - check whether the content of the selected step has been created before
      - if it has, show the existing content
      - otherwise create the new content
      Inputs: {JSON} step
              {Boolean} navButtonClick: True if they clicked on prev/next buttons and false otherwise
  */
  var __createContents = function(step, navButtonClick) {

    tableofcontents.selectStep(step, navButtonClick);
    __updateTitle(step.title);
    __updateDescription(step.description, step.instruction);

    __hideContents();
    currentStepName = step.name;

    if (!__lookForExistingContents(step)) {
      if (step.content) {
        var content = step.content;
        var displayTypeNum = 1;
        $.each(step.content, function(index, content) {
          if (content.displayType) {
            // create a new div under the main contentContainer to load the content of each display type
            var subContainerDivId = step.name + '-' + content.displayType + '-' + displayTypeNum;
            // data-step attribute is used to look for content of an existing step in __hideContents
            // and __lookForExistingContents.
            var subContainerDiv = '<div id="' + subContainerDivId + '" data-step="' + step.name + '" class="subContainerDiv col-sm-6"></div>';
            var mainContainer = $('#contentContainer');
            console.log(mainContainer);
            mainContainer.append(subContainerDiv);
            var subContainer = $("#" + subContainerDivId);
            displayTypeNum++;

            //__parseDescriptionForButton(subContainer, step);

            console.log("displayType: ", content.displayType);
            switch (content.displayType) {
              case 'fileEditor':
                var newEditor = editor.create(subContainer, step.name, content);
                console.log(newEditor);
                contentManager.setEditor(step.name, newEditor);
                break;
              case 'commandPrompt':
                console.log("commandPrompt detected");
                var newCmdPrompt = cmdPrompt.create(subContainer, step.name, content);
                contentManager.setCommandPrompt(step.name, newCmdPrompt);
                break;
              case 'webBrowser':
                var newWebBrowser = webBrowser.create(subContainer, step.name, content);
                contentManager.setWebBrowser(step.name, newWebBrowser);
                break;
              case 'fileBrowser':
                console.log("fileBrowser type found.");
                var newFileBrowser = fileBrowser.create(subContainer, content, step.name);
                contentManager.setFileBrowser(step.name, newFileBrowser);
                break;
              case 'pod':
                var newPod = pod.create(subContainer, step.name, content);
                break;
            }
          }
        });
      }
    }

    //TODO: add buttons here based off of step

  };

  // Look for step content using data-step attribute with the step name in it
  var __lookForExistingContents = function(step) {
    var existingStep = $("[data-step=" + step.name + "]");
    if (existingStep.length > 0) {
      existingStep.removeClass("hidden");
      return true;
    }
    return false;
  };

  var __createButton = function(buttonId, buttonName, callbackMethod) {
    return $('<button/>', {
      type: 'button',
      text: buttonName,
      id: buttonId,
      click: eval(callbackMethod)
    });
  };

  var __parseDescriptionForButton = function(subContainer, step) {
    var description = step.description;
    console.log("description: ", description);
    if (description) {
      var buttonArray = [];
      if ($.isArray(description)) {
        for (var desc in description) {
          //console.log("str ", desc);
          var descStr = description[desc];
          //console.log("descStr ", descStr);
          var parseStringButton = utils.parseString(descStr);
          if (parseStringButton) {
            //console.log("string not empty");
            buttonArray.push(parseStringButton);
          } //else {
          //console.log("string is empty");
          //}
        }
      } else {
        var parseStringButton = utils.parseString(description);
        if (parseStringButton) {
          //console.log("string is not empty");
          buttonArray.push(parseStringButton);
        }
      }

      //subContainer.append("<div class=\"buttonContainer\">");
      $(ID.blueprintDescription).append("<br>");
      $(ID.blueprintDescription).append("<div class=\"buttonContainer\">");
      for (var i = 0; i < buttonArray.length; i++) {
        console.log("button ", buttonArray[i]);
        //var buttonId = subContainer[0].id + "-button-" + i;
        var buttonId = utils.replaceString(buttonArray[i], " ");
        console.log("id ", buttonId);
        var callbackMethod = "(function test(currentStepName) {testCallBack." + buttonId + "(\"" + currentStepName + "\")})";
        console.log("callbackMethod ", callbackMethod);

        var button = __createButton(buttonId, buttonArray[i], callbackMethod);
        $(".buttonContainer").append(button);
      }
      //subContainer.append("</div>");
      $(ID.blueprintDescription).append("</div>");
    }
  };

  return {
    setSteps: __setSteps,
    createContents: __createContents,
    currentStepName: __getCurrentStepName
  };
})();
