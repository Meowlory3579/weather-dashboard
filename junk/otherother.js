// jQuery ready function to ensure the code runs after the DOM has fully loaded
$(document).ready(() => {
    var formattedDate;

    // function to dynamically update the city list / search history
    function updateCityList() {
        var cityList = $('#city-list');

        // Get any search input that was saved in localStorage
        var storedCities = JSON.parse(localStorage.getItem('allItems')) || [];
        cityList.empty(); // Clear existing list

        // for each user entry and stored city, create a button and append list to HTML
        storedCities.forEach(function(item) {
            var buttonEl = $('<button>').addClass('btn list-group-item city-button').text(item.city);
            cityList.append(buttonEl);
        });
    };

    // Initial update of city list
    updateCityList();

    var searchInput = '';

    $(document).on('click', '.city-button', function() {
        // find the button that triggered the event
        var button = $(this);
        // then find the text within the button
        searchInput = button.text();
        console.log("button: " + searchInput);
        performSearch(); 
    });


    $('#fetch-button').on('click', function() {
        searchInput = $("#city-search").val().trim();

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

        console.log("City input: " + searchInput);
        performSearch(); 
    });

    // Figure out the indices that are going to be passed to urlFiveDay
    function findAndStoreIndices(dataSet, formattedDate) {
        var startIndex = -1;
    
        // Find the index of the first non-matching date
        for (var i = 0; i < dataSet.length; i++) {
            var itemDate = new Date(dataSet[i].dt_txt);
            var itemFormattedDate = (itemDate.getMonth() + 1) + '/' + itemDate.getDate() + '/' + itemDate.getFullYear();

            console.log("My formatted date is" + formattedDate)
    
            if (itemFormattedDate !== formattedDate) {
                startIndex = i;
                break;
            }
        }
    
        // If a non-matching date is found, create the array of indices
        var indicesArray = [];
        if (startIndex !== -1) {
            for (var j = 0; j < 5; j++) {
                indicesArray.push(startIndex + j * 8);
            }
        }
    
        return indicesArray;
    };
    

    function performSearch() {
        var apiKey = '24c8e33d23ee0bf6a42fdd1ea9aa5f78';

        if (searchInput !== '') {
            // Clear existing content from the relevant elements
            $('.currentCard').empty();
            $('.fiveDayForecast').empty();

            // Dynamically build request URLs based on user search input
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
                    // Get the current UTC date
                    var currentUtcDate = new Date();
                    // Get the UTC timezone from the response
                    var utcTimezone = data.timezone;

                    // UTC offset in milliseconds (3600 seconds = 1 hour)
                    var utcOffsetMilliseconds = utcTimezone * 1000;

                    // Add the UTC offset to the current UTC date
                    var localDate = new Date(currentUtcDate.getTime() + utcOffsetMilliseconds);

                    // separate into month, day, year for desired formatting
                    var month = localDate.getUTCMonth() + 1; // returns month from 0-11, so must add 1
                    var day = localDate.getUTCDate();
                    var year = localDate.getUTCFullYear();

                    var formattedDate = month + '/' + day + '/' + year;
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

                    return fetch(urlFiveDay);      

                }); // urlCurrent end


            // request for 5 day weather info
            fetch(urlFiveDay)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    console.log(data);

                    console.log("What is the formatted date here: " + formattedDate)
    
                    // show '5 Day Forecast' string in HTML once response is returned
                    $('#fiveDayForecastTitle').show();

                    // Call to the function to find indices
                    if (formattedDate) {
                        var indices = findAndStoreIndices(data.list, formattedDate);
                        console.log("Indices: ", indices);    

                        // Use the indices to process specific objects in data.list
                        indices.forEach(function(index) {
                            if (index < data.list.length) {
                             var forecastItem = data.list[index];
                                console.log("Forecast Item at Index " + index + ": ", forecastItem);
                            }
                        });
                    }    
                    
    
                    // 5 day weather results are in 3-hour blocks, so there are 8 results per 24 hours. If you only access values listed in 'day' variable, that'll give you the info for 5 separate / unique days. 
                    // var dayIndex = [7, 15, 23, 31, 39];
                    var dayIndex = [0, 8, 16, 24, 32];

                    // for each day (item), dynamically append returned data into fiveDayForecast section
                    var fiveDayForecast = $('.fiveDayForecast');
                    dayIndex.forEach(function(item) {

                        // figure out the next five dates for the city being searched for
                        // Get the date string from the response
                        var getFiveDayDate = new Date(data.list[item].dt_txt);
                        var fiveDayMonth = getFiveDayDate.getMonth() + 1; 
                        var fiveDayDay = getFiveDayDate.getDate();
                        var fiveDayYear = getFiveDayDate.getFullYear();
                        var fiveDayFormattedDate = fiveDayMonth + '/' + fiveDayDay + '/' + fiveDayYear;
                        console.log("Local Next 5 Dates: " + fiveDayFormattedDate);

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
    
    