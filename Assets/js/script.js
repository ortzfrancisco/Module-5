/* Wrap all code that interacts with the DOM in a call to jQuery to ensure that 
the code isn't run until the browser has finished rendering all the elementsin the html. */
$(function () {
  var currentDay = $("#currentDay");
  var today = dayjs();
  var savedData = JSON.parse(localStorage.getItem("scheduleData"));

  // displays the current date in the header of the page.
  function getDate() {
    var todayDay = today.format("DD");
    var todayLastDigit = todayDay.split("")[1];
    var suffix = "";
    // Determines the ordinal suffix needed for display
    if (todayLastDigit === "1") {
      suffix = "st";
    } else if (todayLastDigit === "2") {
      suffix = "nd";
    } else if (todayLastDigit === "3") {
      suffix = "rd";
    } else {
      suffix = "th";
    }
    var todayDate = dayjs().format(`dddd, MMMM D[${suffix}] h:mmA`);
    currentDay.text(todayDate);
  }

  // change currentDay element by calling getDate function. updates the time displayed every second.
  getDate();
  setInterval(getDate, 1000);

  function createHourBlocks() {
    // loops for the set amount of hours in workday and creates a time block. i < 9 determines how many time blocks created.
    for (let i = 0; i < 9; i++) {
      var hour = i + 9;
      var blockColor = checkHour(hour);
      var hourBlock = $("<div>", {
        id: `hour-${hour}`,
        class: blockColor,
      });
      var hourDisplay = $("<div>", {
        class: "col-2 col-md-1 hour text-center py-3",
      });
      var textDisplay = $("<textarea>", {
        class: "col-8 col-md-10 description",
        rows: "3",
      });
      var saveButton = $("<button>", {
        class: "btn saveBtn col-2 col-md-1",
        "aria-label": "save",
      });

      // saving text input to local storage on click
      saveButton.click(saveData);

      var saveIcon = $("<i>", { class: "fas fa-save", "aria-hidden": "true" });

      // Time display. Converts the 24-hour clock to 12-hour and determines if AM or PM
      var amPM = "AM";
      if (hour === 12) {
        amPM = "PM";
      } else if (hour > 12) {
        hour %= 12;
        amPM = "PM";
      }
      hourDisplay.text(hour + amPM);

      // appends created hour block elements to the hour block container. renders the content in main container
      $(saveButton).append(saveIcon);
      $(hourBlock).append(hourDisplay, textDisplay, saveButton);
      $("#container").append(hourBlock);
    }
  }

  createHourBlocks();

  //  takes the  the current time and returns the appropriate class to
  function checkHour(hourArg) {
    var currentHour = Number(today.format("H"));
    if (hourArg < currentHour) {
      return "row time-block past";
    } else if (hourArg === currentHour) {
      return "row time-block present";
    } else {
      return "row time-block future";
    }
  }

  // Function saves the text area data into local storage
  function saveData() {
    var hourBlockID = "#" + $(this).parent().attr("id");
    var textAreaEl = $(hourBlockID).children()[1];
    var userText = $(textAreaEl).val();
    var eventObj = {};
    eventObj[hourBlockID] = userText;

    var editMade = false;

    if (savedData !== null) {
      // checks if savedData exists
      // for loop checks savedData for previously save hourBlocks
      for (let i = 0; i < savedData.length; i++) {
        // if hourBlock already exists, replace the text with new input
        if (Object.keys(savedData[i]).toString() === hourBlockID) {
          savedData[i][`${hourBlockID}`] = userText;
          localStorage.setItem("scheduleData", JSON.stringify(savedData));
          editMade = true;
          break;
        }
      }

      if (!editMade) {
        //if the hourBlock doesn't exists in local storage, push new object to storage.
        savedData.push(eventObj);
        localStorage.setItem("scheduleData", JSON.stringify(savedData));
      }
    }
    //function creates prompt notifying user that their text was saved
    eventSavedPrompt();
  }

  // Grabs data from localStorage and renders the text into the corresponding textareas
  function pullStoredData() {
    var data = JSON.parse(localStorage.getItem("scheduleData"));

    if (data !== null) {
      for (let i = 0; i < data.length; i++) {
        var hourBlockID = Object.keys(data[i]).toString();
        var storedText = data[i][hourBlockID];
        $(hourBlockID).children()[1].value = storedText;
      }
    } else {
      savedData = [];
      localStorage.setItem("scheduleData", JSON.stringify(savedData));
    }
  }

  pullStoredData();

  // renders prompt notifying user that data was saved
  function eventSavedPrompt() {
    var containerEl = $("#container");

    var confirmPrompt = $("<div>", {
      id: `confirm-prompt`,
      class: "text-center p-1",
    });
    confirmPrompt.html(
      "<strong>Appointment saved to <span >localStorage<span> 💾</strong>"
    );

    containerEl.prepend(confirmPrompt);

    setTimeout(function () {
      confirmPrompt.remove();
    }, 3000);
  }
});
