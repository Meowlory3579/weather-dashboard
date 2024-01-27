var form = $('#search-form');
var cityInput = $('#city-search');
var cityList = $('#city-list');

// var formEl = $('#skills-form') = var form = $('#search-form');
// var nameInputEl = $('#skill-name') = var cityInput = $('#city-search');
// var dateInputEl = $('#datepicker');
// var skillsListEl = $('#skills-list') = var cityList = $('#city-list');


var printSkills = function (name) {
    var listEl = $('<li>');
    listEl.appendTo(cityList);
    var listDetail = name;
    listEl.addClass('list-group-item').text(listDetail);
};
  
var handleFormSubmit = function (event) {
    event.preventDefault();
  
    var nameInput = cityInput.val();
  
    if (!nameInput) {
      console.log('You need to fill out the form!');
      return;
    }
  
    printSkills(nameInput);
  
    // resets form
    cityInput.val('');
};
  
form.on('submit', handleFormSubmit);