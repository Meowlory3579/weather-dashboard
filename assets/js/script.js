// jQuery ready function to ensure the code runs after the DOM has fully loaded
$(document).ready(() => {


    var cityList = $('#city-list');

    // Get any search input that was saved in localStorage...
    var allItems = JSON.parse(localStorage.getItem('allItems'));

    // If search input exists, create a li for each searched item
    if (allItems !== null) {
        allItems.forEach(function(item) {
            var listEl = $('<li>');
            listEl.appendTo(cityList);
            var listDetail = item.city;
            listEl.addClass('list-group-item').text(listDetail);
        }); 
    };


    // Add a listener for click events on the search button that getsAPI and saves search history to localStorage
    $('#fetch-button').on('click', function() {
        var cityInput = $('#city-search');
        var cityValue = cityInput.val().trim();

        // Store the city value in an object, if it's not empty
        if (cityValue !== '') {

            var newCityItem = {
                city: cityValue
            };
        
            // Retrieve allItems array from localstorage, if exists. If not, set allItems to empty
            var allItems = localStorage.getItem('allItems');

            if (allItems === null) {
              allItems = [];
            } else {
                allItems = JSON.parse(allItems);
            }

            // Push new events into the allItems array
            allItems.push(newCityItem);

            // Store allItems in localStorage
            var setStoredItems = localStorage.setItem('allItems', JSON.stringify(allItems));

        }

        getApi();

        // clear search field after each search
        // cityInput.val('');



    }); // fetch-button listener end


    function getApi() {
        // var cityName = cityInput.val().trim();
        var cityName = 'London';
        console.log(cityName);
        var apiKey = '24c8e33d23ee0bf6a42fdd1ea9aa5f78';
        var urlCurrent = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey;
        var urlFiveDay = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=" + apiKey + "&units=imperial";

      
        fetch(urlCurrent)
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            console.log(data)
            // var currentCard = $('.currentCard');
            // // currentCard.empty();
            // var currentCity = currentCard.append('<p>');
            // currentCard.append(currentCity);



          });



          fetch(urlFiveDay)
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            console.log(data)
            // do stuff with the results
          });



    }; // getApi end

 

}); // Document ready end





