// jQuery ready function to ensure the code runs after the DOM has fully loaded
$(document).ready(() => {

    var cityInput = $('#city-search');
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

        // clear search field after each search
        cityInput.val('');

    }); // fetch-button listener end



}); // Document ready end