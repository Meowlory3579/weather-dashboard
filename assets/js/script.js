// jQuery ready function to ensure the code runs after the DOM has fully loaded
$(document).ready(() => {

    var cityList = $('#city-list');
    var apiKey = '24c8e33d23ee0bf6a42fdd1ea9aa5f78';

    function updateCityList() {
        // Get any search input that was saved in localStorage...
        var storedCities = JSON.parse(localStorage.getItem('allItems')) || [];
        cityList.empty(); // Clear existing list

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


    function performSearch() {

        if (searchInput !== '') {
            // Clear existing content from the relevant elements
            $('.currentCard').empty();
            $('.fiveDayForecast').empty();

            // Dynamically build request URLs based on user search input
            var urlCurrent = "https://api.openweathermap.org/data/2.5/weather?q=" + searchInput + "&appid=" + apiKey + "&units=imperial";
            var urlFiveDay = "https://api.openweathermap.org/data/2.5/forecast?q=" + searchInput + "&appid=" + apiKey + "&units=imperial";
            var today = dayjs().format('MM/DD/YYYY');

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



        }; // searchInput !== '' end
    

    
    }; // performSearch end
    
    
    }); // Document ready end
    
    