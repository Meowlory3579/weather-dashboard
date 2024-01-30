// jQuery ready function to ensure the code runs after the DOM has fully loaded
$(document).ready(() => {

    var cityList = $('#city-list');
    var apiKey = '24c8e33d23ee0bf6a42fdd1ea9aa5f78';

    // Get any search input that was saved in localStorage...
    var allItems = JSON.parse(localStorage.getItem('allItems'));

    // If search input exists, create a li for each searched item
    if (allItems !== null) {
        allItems.forEach(function(item) {
            // var buttonEl = $('<button>').addClass('list-group-item city-button').text(item.city);
            // var listEl = $('<li>').append(buttonEl);
            // listEl.appendTo(cityList);
            var buttonEl = $('<button>').addClass('btn list-group-item fetch-button').text(item.city);
            cityList.append(buttonEl);
        }); 
    };
    
    // Add a listener for click events on the search button that saves search history to localStorage, calls API, and does stuff with response
    $('.fetch-button').on('click', function() {
        // find the button that triggered the event
        var button = $(this);
        // then find the text within the button
        var buttonText = button.parent.text();
        // and set it the searchInput 
        var searchInput = buttonText;
        console.log(searchInput);

        // ... and store it in an object, if it's not empty
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

        }
    
        // Dynamically build request URLs based on user search input
        var urlCurrent = "https://api.openweathermap.org/data/2.5/weather?q=" + searchInput + "&appid=" + apiKey + "&units=imperial";
        var urlFiveDay = "https://api.openweathermap.org/data/2.5/forecast?q=" + searchInput + "&appid=" + apiKey + "&units=imperial";
        var today = dayjs().format('MM/DD/YYYY');
    
        // If the search input isn't null, send API requests
        if (searchInput == "") {
            console.log(searchInput);
        } else {
            // request for current weather info
            fetch(urlCurrent)
            .then(function (response) {
              return response.json();
            })
            .then(function (data) {
                console.log(data);

                // append returned data into currentCard section
                var currentCard = $('.currentCard');
                currentCard.append(
                    "<div class='something'>" + 
                    "<h5>" + data.name + " - " + today + "</h5>" + 
                    `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">` + 
                    "<p>" + data.weather[0].description + "</p>" +
                    "<p>" + "Temperature: " + data.main.temp  + " &deg;F</p>" + 
                    "<p>" + "Wind Speed: " + data.wind.speed + " MPH</p>" + 
                    "<p>" + "Humidity: " + data.main.humidity + "%" + "</p>" + 
                    "</div>"
                );
    
            }); // urlCurrent end
    
            // request for 5 day weather info
            fetch(urlFiveDay)
            .then(function (response) {
              return response.json();
            })
            .then(function (data) {
              console.log(data);
    
                // show '5 Day Forecast' in HTML once response is returned
                $('#fiveDayForecastTitle').show();
    
                // 5 day weather results are in 3-hour blocks, so there are 8 results per 24 hours. If you only access values listed in 'day' variable, that'll give you the info for 5 separate / unique days
                var day = [0, 8, 16, 24, 32];

                // append returned data into fiveDayForecast section
                var fiveDayForecast = $('.fiveDayForecast');
                day.forEach(function(item) {
                    fiveDayForecast.append(
                        "<div class='fiveDayColor'>" + 
                        `<img src="https://openweathermap.org/img/wn/${data.list[item].weather[0].icon}@2x.png">` + 
                        "<p>" + data.list[item].weather[0].description + "</p>" +
                        "<p>" + "Temperature: " + data.list[item].main.temp + " &deg;F</p>" + 
                        "<p>" + "Wind Speed: " + data.list[item].wind.speed + " MPH</p>" + 
                        "<p>" + "Humidity: " + data.list[item].main.humidity + "%" + "</p>" + 
                        "</div>"
                    );
                });
    
    
            }); // urlFiveDay end
    
    
        }; // if / else end
    
        // clear search field after each search
        searchInput.val('');
    
    }); // click function end
    
    
    }); // Document ready end
    
    