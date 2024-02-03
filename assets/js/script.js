// jQuery ready function to ensure the code runs after the DOM has fully loaded
$(document).ready(() => {
    var formattedDate;
    var searchInput = '';

    // Function to dynamically update the city list / search history
    function updateCityList() {
        var cityList = $('#city-list');

        // Get any search input that was saved in localStorage
        var storedCities = JSON.parse(localStorage.getItem('allItems')) || [];
        cityList.empty(); // Clear existing list so it's dynamically built

        // For each user entry and stored city, create a button and append list to HTML
        storedCities.forEach(function(item) {
            var buttonEl = $('<button>').addClass('btn list-group-item city-button').text(item.city);
            cityList.append(buttonEl);
        });
    };

    // Initial update of cityList
    updateCityList();

    // Listen for clicks on buttons in search history (aka cityList). If clicked, capture the button text and initialize performSearch function
    $(document).on('click', '.city-button', function() {
        // Find the button that triggered the event
        var button = $(this);
        // Then find and store the text within the button
        searchInput = button.text();
        console.log("button: " + searchInput);
        // Initialize performSearch function
        performSearch(); 
    });

    // Listen for click on search button. If clicked, capture user input and store with other searches, if applicable
    $('#fetch-button').on('click', function() {
        searchInput = $("#city-search").val().trim();

        // Store user input
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

            // After adding new city to localStorage, update the cityList
            updateCityList();

            // Initialize performSearch function
            performSearch();
        }
    });


    // Find weather forecast entries in the dataset beginning after the last occurrence of formattedDate and then select specific subsequent entries based on a defined interval
    function findAndStoreIndices(dataSet, formattedDate) {
        var lastIndexForCurrentDate = -1;
    
        // Find the last index that contains formattedDate
        for (var i = 0; i < dataSet.length; i++) {
            var itemDate = new Date(dataSet[i].dt_txt);
            var itemFormattedDate = (itemDate.getMonth() + 1) + '/' + itemDate.getDate() + '/' + itemDate.getFullYear(); // getMonth returns month from 0-11, so must add 1

            if (itemFormattedDate === formattedDate) {
                lastIndexForCurrentDate = i;
            } else if (lastIndexForCurrentDate !== -1) {
                break;
            }
        }
    
        // Calculate indices beginning from the index immediately following lastIndexForCurrentDate. For up to 5 iterations, calculate nextIndex by adding multiples of 8 to startIndex. Note: This logic accounts for the weather data being in 3-hour segments (8 segments per 24 hours), aiming to select one data point per day for the next 5 days. 
        var indicesArray = [];
        var startIndex = lastIndexForCurrentDate + 1;
        for (var j = 0; j < 5; j++) {
            var nextIndex = startIndex + j * 8;

            if (nextIndex < dataSet.length) {
                indicesArray.push(nextIndex);
            } else {
                break;
            }
        }

        return indicesArray;
    };
    
    // Send and receive API calls / responses and append desired results to HTML
    function performSearch() {
        var apiKey = '24c8e33d23ee0bf6a42fdd1ea9aa5f78';

        if (searchInput !== '') {
            // Clear existing content from the relevant elements after each search
            $('.currentCard').empty();
            $('.fiveDayForecast').empty();

            // Dynamically build request URLs based on user search input or history selection
            var urlCurrent = "https://api.openweathermap.org/data/2.5/weather?q=" + searchInput + "&appid=" + apiKey + "&units=imperial";
            var urlFiveDay = "https://api.openweathermap.org/data/2.5/forecast?q=" + searchInput + "&appid=" + apiKey + "&units=imperial";
            
            // Request for current weather info
            fetch(urlCurrent)
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('Network response was not ok for current weather.');
                    }
                    return response.json();
                })
                .then(function (data) {
                    console.log(data);

                    // Show card border after results are returned
                    $('.card').removeClass('hidden-border');

                    // Figure out the current date for the city being searched for
                    var currentUtcDate = new Date();
                    // Get the UTC timezone from the response
                    var utcTimezone = data.timezone;
                    // UTC offset in milliseconds
                    var utcOffsetMilliseconds = utcTimezone * 1000;
                    // Add the UTC offset to the current UTC date
                    var localDate = new Date(currentUtcDate.getTime() + utcOffsetMilliseconds);
                    // Parse into month, day, year for desired formatting
                    formattedDate = (localDate.getUTCMonth() + 1) + '/' + localDate.getUTCDate() + '/' + localDate.getUTCFullYear(); // getUTCMonth returns month from 0-11, so must add 1
                    console.log("Local Date: " + formattedDate);

                    // Append returned data into currentCard section
                    var currentCard = $('.currentCard');
                        currentCard.append(
                            "<div class='currentDayCard'>" + 
                            "<h4>" + data.name + "</h4>" +
                            "<p>" + formattedDate + "</p>" + 
                            `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">` + 
                            "<p>" + data.weather[0].description + "</p>" +
                            "<p>" + "Temperature: " + data.main.temp  + " &deg;F</p>" + 
                            "<p>" + "Wind Speed: " + data.wind.speed + " MPH</p>" + 
                            "<p>" + "Humidity: " + data.main.humidity + "%" + "</p>" + 
                            "</div>"
                        );

                    return fetch(urlFiveDay);  // Request for 5 day weather info. Nesting fetches to ensure urlFiveDay runs after urlCurrent b/c I need formattedDate from urlCurrent

                }) // urlCurrent end

                // Process 5 day weather response
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('Network response was not ok for 5-day weather.');
                    }
                    return response.json();
                })
                .then(function (data) {
                    console.log(data);
                    console.log("Formatted Date as appears in 5 day: " + formattedDate)
                    
                    // Call to findAndStoreIndices to find indices
                    if (formattedDate) {
                        var indices = findAndStoreIndices(data.list, formattedDate);
                        console.log("Indices: ", indices);    
                    }    

                    // Insert '% Day Forecast' string in HTML based on indices array length
                    $('#fiveDayForecastTitle').text(indices.length + " Day Forecast");

                    // For each day (determined by index stored in 'indices'), dynamically append returned data into fiveDayForecast section
                    var fiveDayForecast = $('.fiveDayForecast');
                    indices.forEach(function(item) {

                        // Get the date string from the response
                        var getFiveDayDate = new Date(data.list[item].dt_txt);
                        var fiveDayFormattedDate = (getFiveDayDate.getMonth() + 1) + '/' + getFiveDayDate.getDate() + '/' + getFiveDayDate.getFullYear(); // getUTCMonth returns month from 0-11, so must add 1
                        console.log("Local Next 5 Dates: " + fiveDayFormattedDate);

                        // Append returned data into fiveDayForecast section
                        fiveDayForecast.append(
                        "<div class='fiveDayCard'>" +
                        "<p>" + fiveDayFormattedDate + "</p>" + 
                        `<img src="https://openweathermap.org/img/wn/${data.list[item].weather[0].icon}@2x.png">` + 
                        "<p>" + data.list[item].weather[0].description + "</p>" +
                        "<p>" + "Temperature: " + data.list[item].main.temp + " &deg;F</p>" + 
                        "<p>" + "Wind Speed: " + data.list[item].wind.speed + " MPH</p>" + 
                        "<p>" + "Humidity: " + data.list[item].main.humidity + "%" + "</p>" + 
                        "</div>"
                        );
                    });

                }) // urlFiveDay end
                // Return error message to user, if applicable
                .catch(function (error) {
                    console.error('There has been a problem with your fetch operation:', error);
                    // Determine the type of error based on the message
                    if (error.message.includes('current weather')) {
                        $('.currentCard').html("<p>Error loading current weather data. Please try again later.</p>");
                    } else if (error.message.includes('5-day weather')) {
                        $('.fiveDayForecast').html("<p>Error loading 5-day weather data. Please try again later.</p>");
                    } else {
                        // Generic error handling for unexpected issues
                        $('.currentCard').html("<p>Unexpected error. Please try again later.</p>");
                        $('.fiveDayForecast').html("<p>Unexpected error. Please try again later.</p>");
                    }
                }); // catch error end
                
        }; // searchInput !== '' end
    
    }; // performSearch end
    
}); // Document ready end
    
    