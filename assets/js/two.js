// jQuery ready function to ensure the code runs after the DOM has fully loaded
$(document).ready(() => {

var cityInput = $('#city-search');
var cityValue = 'London';
var apiKey = '24c8e33d23ee0bf6a42fdd1ea9aa5f78';


$('#fetch-button').on('click', function() {
    var today = dayjs().format('MM/DD/YYYY');

    var searchInput = $("#city-search").val();
    console.log(searchInput);

    var urlCurrent = "https://api.openweathermap.org/data/2.5/weather?q=" + searchInput + "&appid=" + apiKey + "&units=imperial";
    var urlFiveDay = "https://api.openweathermap.org/data/2.5/forecast?q=" + searchInput + "&appid=" + apiKey + "&units=imperial";


    if (searchInput == "") {
        console.log(searchInput);
    } else {
        fetch(urlCurrent)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log(data);
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

        }); // then end

        fetch(urlFiveDay)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log(data);

            $('#fiveDayForecastTitle').show();

            // Results are in 3-hour blocks, so there are 8 results per 24 hours. If you only access below values, that'll give you the info for 5 separate / unique days
            var day = [0, 8, 16, 24, 32];
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


        }); // then end






    }; // if / else end



}); // fetch button end



}); // Document ready end

