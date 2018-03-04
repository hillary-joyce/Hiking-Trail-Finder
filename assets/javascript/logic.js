////////////////////////// KAIRNS JAVASCRIPT ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


///////////////////////////// VARIABLES ////////////////////////////////////////
///////////////// Set initial variables to be used later ///////////////////////
var lat = 0;
var long = 0;
var radius = 0;
var rating = 0;
var trailID = "";
var trailValue = ""




////////////////////////// INITIATE FIREBASE ///////////////////////////////////
var config = {
  apiKey: "AIzaSyB6ExdUotK2xKs_cmCX99Ux-lNEZrZcXX8",
  authDomain: "hiking-trail-comment-manager.firebaseapp.com",
  databaseURL: "https://hiking-trail-comment-manager.firebaseio.com",
  projectId: "hiking-trail-comment-manager",
  storageBucket: "",
  messagingSenderId: "163877406033"
};
firebase.initializeApp(config);
var database = firebase.database();


/////////////////////////////// FUNCITONS //////////////////////////////////////


////////////////////////// FUNCTION FOR STAR RATING ////////////////////////////
function rateTrail() {
  var isRated = false;
  $(".mtn-img").on("click", function() {
    rating = $(this).attr("value");
    console.log(rating);
    $(this).prevAll().addBack().attr("src", "assets/images/mtn-2.png");
    isRated = true;
  });
  $(".mtn-img").mouseenter(function() {
    if (!isRated) {
      $(this).prevAll().addBack().attr("src", "assets/images/mtn-2.png");
    }
  })
  $(".mtn-img").mouseleave(function() {
    if (!isRated) {
      $(this).prevAll().addBack().attr("src", "assets/images/mtn-1.png");
    }
  })
  $(".reset").on("click", function() {
    $(".mtn-img").attr("src", "assets/images/mtn-1.png");
    isRated = false;
  })

}


//////////////////////GOOGLE MAPS AUTOCOMPLETE ////////////////////////////////
function initAutocomplete() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  autocomplete = new google.maps.places.Autocomplete(
    (document.getElementById('txtAddress')), {
      types: ['geocode']
    });
};


///////////////////////// FUNCTION -- Get Trail Info //////////////////////////
////////////// Get trail info from APIs and populate divs with info ///////////
function getTrailInfo() {
  var queryURL = "https://www.hikingproject.com/data/get-trails?lat=" +
    lat + "&lon=" + long + "&maxDistance=" + radius +
    "&maxResults=12&key=200206461-4fa8ac1aa85295888ce833cca1b5929f"
  //Ajax call
  $.ajax({
      url: queryURL,
      method: "GET"
    })
    .done(function(response) {
      //if no trails are returned, produce an error message
      if (response.trails.length === 0) {
        $("#search-results").html('<h3 style="color:white">No trails found</h3>' +
          '<p style="color:white">Try expanding your radius and search again</p>')
      } else {
        // loop through the response trails and add info to the site
        for (i = 0; i < response.trails.length; i++) {
          // create divs to hold the trail name and additional trail info
          var contentDivTitle = $("<div class='newTrailTitle'>");
          var contentDivMain = $("<div class='newTrailDescription'>");

          var currentTrail = response.trails[i];
          //give the trail name div attributes for latitude, longitude, and value
          //(Used to call weather api later)
          lat = currentTrail.latitude;
          long = currentTrail.longitude;
          contentDivTitle.attr("latitude", lat);
          contentDivTitle.attr("longitude", long);

          //Give the content div an value attribute equal to i
          contentDivTitle.attr("value", i);

          //give div title a custom attribute called TrailID set to the name of the trail
          //this will be used later for our firebase calls
          contentDivTitle.attr("trailID", currentTrail.name.split(' ').join(''));

          //create variables to hold the details, map, and comments
          var contentDivDetails = $("<div class='details'>");
          var contentDivMap = $("<div class='map'>");
          var contentDivComments = $("<div class='comments' id='" + currentTrail.name.split(' ').join('') + "''>");

          //Create variable to embed the google map at the latitude and longitude
          var embedMap = "<iframe class=\"map\" width=\"200\" height=\"200\" frameborder=\"0\" scrolling=\"no\" marginheight=\"0\" marginwidth=\"0\" src=\"https://maps.google.com/maps?q=" + lat + "," + long + "&hl=en&z=12&output=embed\"></iframe>"

          //Add content to the trail name and additional trail info divs
          //for the div title add the name and location (city, state)
          //Add the mountain images used to display average user rating
          //If there is no image related to the id, use a placeholder image
          var trailimg;
          if (currentTrail.imgMedium === "") {
            trailimg = "assets/images/hiking-trail-placeholder.jpg";
          } else {
            trailimg = currentTrail.imgMedium;
          }
          contentDivTitle.html(
            "<img class='trail-img' src='" + trailimg +
            "'><div class='trail-name'><p class='trail-name-name'>" +
            currentTrail.name + "</p><p class='trail-name-location'>" +
            currentTrail.location + "</p></div>");

          //Check to see if the trail conditions are known
          //Create a variable to hold the current trail conditions
          var trailConditions = ""
          if (currentTrail.conditionStatus != "Unknown") {
            trailConditions = "<br>Current Conditions: " + currentTrail.conditionStatus;
          }
          //to the details div, add the summary, length, ascent, current conditions, and current weather
          contentDivDetails.html("Summary: " + currentTrail.summary +
            "<br>Average Rating: " +
            "<div class='overall-rating standard-rating-mtns'>" +
            "<img class='tiny-mtn' src='assets/images/mtn-2.png'>" +
            "<img class='tiny-mtn' src='assets/images/mtn-2.png'>" +
            "<img class='tiny-mtn' src='assets/images/mtn-2.png'>" +
            "<img class='tiny-mtn' src='assets/images/mtn-2.png'>" +
            "<img class='tiny-mtn' src='assets/images/mtn-2.png'>" +
            "<div class='overall-rating user-ratings'  id='averageRatingFor" + i + "'></div></div>" +
            "<br>Length: " + currentTrail.length +
            " mi <br> Ascent: " + currentTrail.ascent +
            " ft" + trailConditions +
            "<br>Current Weather: <span id='trailWeather" + i +
            //add a link that will go to a full forecast on open weather app
            "'></span><a href='#' id='fullForecast" + i + "' target='_blank'> Get full forecast</a>" +
            "<br><a href='" + currentTrail.url + "' target='_blank'>Trail Map & More Info </a></div>")

          //Add the google map to the map div along with a link to more info
          contentDivMap.html(embedMap);

          //Add form to submit new comments to the comment div
          //includes mountian rating system, date, and comment inputs
          contentDivComments.html("<h2>Leave a Review</h2>" +
            //Main comment div
            "<div class='newCommentDiv'>" +
            "<div><label for='dateVisited'>Date Visited</label>" +
            "<input type='date' class='dateVisited' id='dateVisited" + i + "'>" +
            "</input></div>" +
            //Add div for mountains (rating system)
            "<div class='mtn-rating'>" + "<label for='mtn-img'>Rating</label>" +
            "<img class='mtn-img' value='1' src='assets/images/mtn-1.png'>" +
            "<img class='mtn-img' value='2' src='assets/images/mtn-1.png'>" +
            "<img class='mtn-img' value='3' src='assets/images/mtn-1.png'>" +
            "<img class='mtn-img' value='4' src='assets/images/mtn-1.png'>" +
            "<img class='mtn-img' value='5' src='assets/images/mtn-1.png'></div>"
            //div for user comments
            +
            "<div><label for='userComment'>Comments</label>" +
            "<textarea rows='4' cols='30' class='userComment' id='userComment" + i + "'></textarea>" +
            "</div></div><button class='addComment u-full-width' name='" + currentTrail.name +
            "'>Add Comment</button>" +
            "<h2>User Comments</h2><div class='user-reviews' prevcomment='" + currentTrail.name.split(' ').join('') + "'>");

          //Add a container div for the trail modal
          var contentDivContainer = $("<div class='trail-info-container' display='block'>");
          var closebutton = $("<button class='close-trail-info'>").html("Close");
          //Append details, map, and comments to the div
          $(contentDivContainer).append(contentDivMap, contentDivDetails, contentDivComments);
          $(contentDivMain).append(closebutton, contentDivContainer).hide();

          //Append the new divs to the search results div
          $("#search-results").append(contentDivTitle);
          $("#search-results").append(contentDivMain);
        }
      }
    });
}


///////////////////////////FUNCTION - Submit////////////////////////////////////
/////////////When a user clicks the search icon, run the following//////////////

function submissionCallback() {
  //empty the search results
  $("#search-results").empty();
  //store the value of user input in a variable
  var userInput = $("#txtAddress").val();
  //trim the user input to the form needed for the api
  var userSearchTerm = userInput.split(' ').join('+');
  //Check the user has entered a search term, return error if not
  if (userSearchTerm === '') {
    $("#error-enter-address").text("Please enter a location");
  } else {
    $("#error-enter-address").text("");
    radius = $("input:checked").val();
    $("#miles").text(radius);

    //call the google maps geocoding api using user search term
    var queryURLGeocode = "https://maps.googleapis.com/maps/api/geocode/json?address=" + userSearchTerm + "&key=AIzaSyCSAYHZn9fz13c3bsl_RcS13HJu8wDJXCU"
    $.ajax({
        url: queryURLGeocode,
        method: "GET",
      })
      .done(function(response) {
        //Set latitude from the returned object
        lat = response.results[0].geometry.location.lat;
        //limit decimal points to 4 (xx.xxxx) - form needed for hiking api
        lat = lat.toFixed(4);
        //repeat with longitute
        long = response.results[0].geometry.location.lng;
        long = long.toFixed(4);

        //Next, call the hiking project data api using the latitude and longitude pulled fromt google geocoding
        getTrailInfo();
      });
    // Scroll the user down to search results
    // $('html, body').animate({
    //   scrollTop: $("#search-results").offset().top
    // }, 2000);
  }
};


/////////////////////// FUNCTION -- Get Weather ////////////////////////////////
////// Get current trail weather info and add it to the trail div //////////////
function getWeather(trail) {
  //Run the Open Weather Map API, using the latitude and longitude stored earlier
  var queryURL = "https://api.openweathermap.org/data/2.5/forecast?" + "lat=" +
    $(trail).attr("latitude") + "&lon=" + $(trail).attr("longitude") +
    "&units=imperial&cnt=1&appid=9cebf51611031e41d40169d2d6224b0a";
  // Run AJAX call to the OpenWeatherMap API
  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {
    //Grab relevant response data and post to current trail div
    var currentTemp = Math.round(response.list[0].main.temp);
    console.log(currentTemp);
    var weatherIconID = (response.list[0].weather[0].id).toString();;

    if (weatherIconID != "800") {
      weatherIconID = weatherIconID.slice(0, 1)
    }

    $("span#trailWeather" + trailValue).html(
      "<img class='weather-icon' src='assets/images/forecast_icons/weather-icon-" +
      weatherIconID + ".png'</img> " +
      currentTemp + "&#176");
    //add the city id to the url for more info
    $("#fullForecast" + trailValue).attr("href", "http://openweathermap.org/city/" +
      response.city.id);
  });
}


//////////////////////// FUNCTION - Check for Trail ////////////////////////////
//////// Check if the current trail exists in firebase. If not - add ///////////
function checkForTrail() {
  //Check to see if the current trail exists in firebase
  database.ref().once('value', function(snapshot) {
    if (snapshot.hasChild(trailID)) {
      console.log("exists");
    } else {
      //If it doesn't add it to the database
      database.ref(trailID).set({
        name: trailID
      });
    }
  });
}



///////////////////////////// FUNCTION - Add Ratings ///////////////////////////
/////////// Add all the current ratings associated with this trail /////////////
function addRatings() {
  //set variable for ratings
  var allRatings = [];
  var totalRating = 0;

  //funciton to add comments associated with the trail
  database.ref(trailID + "/comments").on("child_added", function(snapshot) {
    //create a div to hold the comment
    //add the date and the comment
    var newComment = $("<div class='user-comment'>").html("<div>" + snapshot.val().date +
      "</div><div>" + snapshot.val().comment + "</div>");
    //Add the new rating visually with mountains
    var newRating = $("<div>");
    //For loop adds correct number of mountains for the rating
    for (i = 0; i < snapshot.val().rating; i++) {
      newRating.append("<img class='tiny-mtn' src='assets/images/mtn-2.png'>");
    }
    //add the rating to the all ratings array
    allRatings.push(parseInt(snapshot.val().rating));

    //add the value of the rating to the variable total rating
    totalRating += parseInt(snapshot.val().rating);

    console.log(totalRating);

    //To find the average, divide the total rating by the length of the array (total number of ratings)
    //multiply to get percentage
    var averageRating = (totalRating / (allRatings.length)) * 20;

    //Find the remaining percentage to determine the whitespace to cover
    var whiteSpace = 100 - averageRating;
    console.log(averageRating);
    console.log(trailValue);
    //set the width of the whitespace value to the number determined
    $("#averageRatingFor" + trailValue).attr("style", "width: " + whiteSpace + "%")

    $(newComment).append(newRating)
    $("div[prevcomment='" + trailID + "']").append(newComment);
  }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });
}


///////////////////////// FUNCTION -- Add New Comment /////////////////////////
///////////// When a user adds a new comment - store in firebase //////////////
function addNewComment() {
  //grab the user comment and date visited values
  var userComment = $("#userComment" + trailValue).val();
  var userDate = $("#dateVisited" + trailValue).val();

  //Add user comment, date visted, and rating to
  database.ref(trailID + "/comments").push({
    comment: userComment,
    rating: rating,
    date: userDate
  });
}


////////////////////////////////////////////////////////////////////////////////
////////////////////////////// WHEN THE PAGE RUNS //////////////////////////////
////////////////////////////////////////////////////////////////////////////////

$(document).ready(initAutocomplete);

window.onbeforeunload = function() {
  window.scrollTo(0, 0);
}

//When user clicks the "submit" button...
$("#submit").click(submissionCallback);
//...or when user presses "Enter" key, it'll execute the callback function
$("input").keypress(function(event) {
  if (event.which == 13) submissionCallback();
});

//When user selects a trail
$(document).on('click', '.newTrailTitle', function() {
  //Run the rate trail function
  rateTrail();
  //slide toggle the info portion down
  $(this).next("div").show(600);
  $(".user-reviews").html('');
  //store the value of the current trail and trail ID as variables
  trailID = $(this).attr("trailID");
  trailValue = $(this).attr("value");
  getWeather(this);
  checkForTrail();
  addRatings();
});

//function to hide the trail when close button is clicked
$(document).on('click', '.close-trail-info', function(){
  console.log("close button clicked");
  $('.newTrailDescription').hide(600);
})

//When the user adds a comment
$(document).on("click", ".addComment", addNewComment);


//STYLING
//When user scrolls down the page, fade the search div
$(window).scroll(function() {
    console.log($(".pageHeader").scrollTop());
});
