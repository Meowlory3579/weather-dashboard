// jQuery ready function to ensure the code runs after the DOM has fully loaded
$(document).ready(() => {
    var formattedDate;
    var searchInput = '';

    // function to dynamically update the city list / search history
    function updateCityList() {
        var cityList = $('#city-list');

        // Get any search input that was saved in localStorage
        var storedCities = JSON.parse(localStorage.getItem('allItems')) || [];
        cityList.empty(); // Clear existing list so it's dynamically built

        // for each user entry and stored city, create a button and append list to HTML
        storedCities.forEach(function(item) {
            var buttonEl = $('<button>').addClass('btn list-group-item city-button').text(item.city);
            cityList.append(buttonEl);
        });
    };

    // Initial update of city list
    updateCityList();

    // listen for clicks on buttons in search history. If clicked, capture the button text, and initialize performSearch function
    $(document).on('click', '.city-button', function() {
        // find the button that triggered the event
        var button = $(this);
        // then find and store the text within the button
        searchInput = button.text();
        console.log("button: " + searchInput);
        // initialize performSearch function
        performSearch(); 
    });

    // listen for click on search button. If clicked, capture user input and store with other searched, if applicable
    $('#fetch-button').on('click', function() {
        searchInput = $("#city-search").val().trim();

        // store user input in object
        if (searchInput !== '') {
            var newCityItem = {
                city: searchInput
            };

            // Retrieve all[searched for]Items array from localstorage, if exists. If not, set allItems to empty
            var allItems = localStorage.getItem('allItems');

            if (allItems === null) {
                allItems = [];
            } else {
                allItems = JSON.parse(allItems);
            }

            // Push new search events into the allItems array
            allItems.push(newCityItem);

            // Store allItems in localStorage
            var setStoredItems = localStorage.setItem('allItems', JSON.stringify(allItems));

            // After adding new city to localStorage, update the city list
            updateCityList();

        }

        // initialize performSearch function
        performSearch(); 
    });


    // 5 day weather results are in 3-hour segments, so there are 8 results per 24 hours. The below function determines which results from API response to pass to urlFiveDay
    function findAndStoreIndices(dataSet, formattedDate) {
        var startIndex = -1;
    
        // Find the index of the first non-matching date
        for (var i = 0; i < dataSet.length; i++) {
            var itemDate = new Date(dataSet[i].dt_txt);
            var itemFormattedDate = (itemDate.getMonth() + 1) + '/' + itemDate.getDate() + '/' + itemDate.getFullYear(); // getMonth returns month from 0-11, so must add 1
    
            if (itemFormattedDate !== formattedDate) {
                startIndex = i;
                break;
            }
        }
    
        // If a non-matching date is found, create an array of indices that increments by 8 to account for 8 results per 24-hour period for a total of 5 times to comprise the 5 day forecast
        var indicesArray = [];
        if (startIndex !== -1) {
            for (var j = 0; j < 5; j++) {
                indicesArray.push(startIndex + j * 8);
            }
        }
    
        return indicesArray;
    };
    
    // function to send and receive API calls / responses and append desired results to HTML
    function performSearch() {
        var apiKey = '24c8e33d23ee0bf6a42fdd1ea9aa5f78';

        if (searchInput !== '') {
            // Clear existing content from the relevant elements after each search
            $('.currentCard').empty();
            $('.fiveDayForecast').empty();

            // Dynamically build request URLs based on user search input or history selection
            var urlCurrent = "https://api.openweathermap.org/data/2.5/weather?q=" + searchInput + "&appid=" + apiKey + "&units=imperial";
            var urlFiveDay = "https://api.openweathermap.org/data/2.5/forecast?q=" + searchInput + "&appid=" + apiKey + "&units=imperial";
            
            // request for current weather info
            fetch(urlCurrent)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    console.log(data);

                    // figure out the current date for the city being searched for
                    var currentUtcDate = new Date();
                    // Get the UTC timezone from the response
                    var utcTimezone = data.timezone;
                    // UTC offset in milliseconds
                    var utcOffsetMilliseconds = utcTimezone * 1000;
                    // Add the UTC offset to the current UTC date
                    var localDate = new Date(currentUtcDate.getTime() + utcOffsetMilliseconds);
                    // separate into month, day, year for desired formatting
                    // var month = localDate.getUTCMonth() + 1; // returns month from 0-11, so must add 1
                    // var day = localDate.getUTCDate();
                    // var year = localDate.getUTCFullYear();
                    // formattedDate = month + '/' + day + '/' + year;
                    formattedDate = (localDate.getUTCMonth() + 1) + '/' + localDate.getUTCDate() + '/' + localDate.getUTCFullYear(); // getUTCMonth returns month from 0-11, so must add 1
                    console.log("Local Date: " + formattedDate);

                    
                    // append returned data into currentCard section
                    var currentCard = $('.currentCard');
                        currentCard.append(
                            "<div class='something'>" + 
                            "<h4>" + data.name + "</h4>" +
                            "<p>" + formattedDate + "</p>" + 
                            `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">` + 
                            "<p>" + data.weather[0].description + "</p>" +
                            "<p>" + "Temperature: " + data.main.temp  + " &deg;F</p>" + 
                            "<p>" + "Wind Speed: " + data.wind.speed + " MPH</p>" + 
                            "<p>" + "Humidity: " + data.main.humidity + "%" + "</p>" + 
                            "</div>"
                        );

                    return fetch(urlFiveDay);  // request for 5 day weather info. Nesting fetches to ensure urlFiveDay runs after urlCurrent b/c I need formattedDate from urlCurrent

                }) // urlCurrent end

                // process 5 day weather response
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    console.log(data);
                    console.log("Formatted Date as appears in 5 day: " + formattedDate)
    
                    // show '5 Day Forecast' string in HTML once response is returned
                    $('#fiveDayForecastTitle').show();

                    // Call to findAndStoreIndices to find indices
                    if (formattedDate) {
                        var indices = findAndStoreIndices(data.list, formattedDate);
                        console.log("Indices: ", indices);    
                    }    

                    // for each day (determined by index stored in 'indices'), dynamically append returned data into fiveDayForecast section
                    var fiveDayForecast = $('.fiveDayForecast');
                    indices.forEach(function(item) {

                        // figure out the next five dates for the city being searched for
                        // Get the date string from the response
                        var getFiveDayDate = new Date(data.list[item].dt_txt);
                        // var fiveDayMonth = getFiveDayDate.getMonth() + 1; 
                        // var fiveDayDay = getFiveDayDate.getDate();
                        // var fiveDayYear = getFiveDayDate.getFullYear();
                        // var fiveDayFormattedDate = fiveDayMonth + '/' + fiveDayDay + '/' + fiveDayYear;
                        var fiveDayFormattedDate = (getFiveDayDate.getMonth() + 1) + '/' + getFiveDayDate.getDate() + '/' + getFiveDayDate.getFullYear(); // getUTCMonth returns month from 0-11, so must add 1
                        console.log("Local Next 5 Dates: " + fiveDayFormattedDate);

                        // append returned data into fiveDayForecast section
                        fiveDayForecast.append(
                        "<div class='fiveDayColor'>" +
                        "<p>" + fiveDayFormattedDate + "</p>" + 
                        `<img src="https://openweathermap.org/img/wn/${data.list[item].weather[0].icon}@2x.png">` + 
                        "<p>" + data.list[item].weather[0].description + "</p>" +
                        "<p>" + "Temperature: " + data.list[item].main.temp + " &deg;F</p>" + 
                        "<p>" + "Wind Speed: " + data.list[item].wind.speed + " MPH</p>" + 
                        "<p>" + "Humidity: " + data.list[item].main.humidity + "%" + "</p>" + 
                        "</div>"
                        );
                    });
                }); // urlFiveDay end


        }; // searchInput !== '' end
    
    
    }; // performSearch end
    
    
}); // Document ready end
    
    