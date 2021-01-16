var apiId = 'b82bfbb0d232dba1cfc5c18bf5ba88ff';
var dateObj;
var storedCitiesarr = [];

// get all elements to update data:
var searchBtn = document.querySelector("#searchBtn");
var cityNameEl = document.querySelector("#city-name");
var dateEl = document.querySelector("#date");
var iconEl = document.querySelector("#icon");
var tempEl = document.querySelector("#temp");
var humidityEl = document.querySelector("#humidity");
var wspeedEl = document.querySelector("#wspeed");
var uvIndexEl = document.querySelector("#uvi");
var futureDivEl = document.querySelector("#future-days");

var citiesList = document.querySelector("#cities-list");

// Function show current weather: prints data on div to show current weather condition
var showCurrentWeather = function(cityP, timeP, weatherIconP, tempP, humidityP, windSpeedP, uvIndexP){
    
    iconEl.textContent='';

    cityNameEl.textContent = cityP;
    dateEl.textContent = timeP;
    var iconImage = document.createElement("img");
    var scrString = 'http://openweathermap.org/img/wn/' + weatherIconP + '.png';
    var uvClass = '';
    iconImage.setAttribute("src", scrString );
    iconEl.appendChild(iconImage);
    
    tempEl.textContent ='Temperature: ' + tempP + ' °F';
    humidityEl.textContent = "Humidity: " + humidityP + '%';
    wspeedEl.textContent = "Wind Speed: " + windSpeedP + ' MPH';
    uvSpan = document.createElement("span");
    if(uvIndexP >= 0 && uvIndexP <=2){
        uvClass = 'bg-success p-2 text-white';
    }else if(uvIndexP >= 3 && uvIndexP <= 5){
        uvClass = 'bg-warning p-1 text-white';
    }else if(uvIndexP >= 6 && uvIndexP <= 10){
        uvClass = 'bg-danger p-1 text-white';
    }else if(uvIndexP >= 11){
        uvClass = 'bg-primary p-1 text-white';
    }
    uvSpan.textContent = uvIndexP;
    uvSpan.setAttribute("class", uvClass);
    
    uvIndexEl.textContent = "UV Index: ";
    uvIndexEl.appendChild(uvSpan);

}

// function get city date object from city offset
var getLocalTime = function(offset) {
    var d = new Date();
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (1000 * offset));
    return nd;  // return date object
}

// function to get weather data from api:
var getWeatherData = function(city){
    // format the weather api url:
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&APPID=" + apiId;
    // make request to the url:
    fetch(apiUrl)
    .then(function(response){
        // request was successfull
        if(response.ok){
            response.json()
            .then(function(data){
                var city = data.name;
                var lon = data.coord.lon;
                var lat = data.coord.lat;
                var weatherIcon = data.weather[0].icon;
                var temp = data.main.temp;
                var humidity = data.main.humidity;
                var windSpeed = data.wind.speed;
                // var tz_offset = data.timezone;
                dateObj = getLocalTime(data.timezone);
                var localTime = dateObj.getDate() + '/' + dateObj.getMonth() + 1 + '/' + dateObj.getFullYear();

                // fetch again with onecall to get uv index value:
                newApiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=hourly,minutely&appid=" + apiId;
                
                fetch(newApiUrl)
                    .then(function(response){
                        if(response.ok){
                            response.json()
                            .then(function(data){
                                var uvIndex = data.current.uvi;
                                
                                // print current weather condition
                                showCurrentWeather(city, localTime, weatherIcon, temp, humidity, windSpeed, uvIndex);
                                
                                // get array of 8 days forecast
                                var forecastArr = data.daily;
                                
                                // print future forecast 
                                showForecast(forecastArr);
                            })
                        }else{
                            // if second fetch unsuccessfull alert:
                            alert("Error: " + response.statusText);
                        }
                    })

            });
        }else{
            alert("Error: " + response.statusText);
        }
    })
    .catch(function(error){
        // if connection couldnot be established
        alert("Unable to connect to Weather API");
    });
}

// function to show weather forecast
var showForecast = function(forecaseArrPara){

    // clear future div
    futureDivEl.textContent="";

    var futureTitleEl = document.createElement("h5");
    futureTitleEl.textContent = "5-Day Forecast:";
    futureDivEl.appendChild(futureTitleEl);

    // get array or forecast elements
    var arr = forecaseArrPara;

    // loop for 5 days:
    for(var i = 0; i< 5; i++){

        // get the array elements
        var weatherIcon = arr[i].weather[0].icon;
        var temp = arr[i].temp.day;
        var humidity = arr[i].humidity;
        var forcaseDateObj = dateObj;
        var forcastTime = (forcaseDateObj.getDate()+i+1) + '/' + forcaseDateObj.getMonth() + 1 + '/' + forcaseDateObj.getFullYear();
        // console.log(weatherIcon, temp, humidity);

        // set the elements
        var dateEl = document.createElement("h6");
        dateEl.setAttribute("class", "card-title");
        dateEl.textContent = forcastTime;
        

        var iconSpan = document.createElement("span");
        var foreIconEl = document.createElement("img");
        str = 'http://openweathermap.org/img/wn/' + weatherIcon + '.png';
        foreIconEl.setAttribute("src", str );
        iconSpan.appendChild(foreIconEl);

        var tempEl = document.createElement("span");
        tempEl.textContent = 'Temp: ' + temp + ' °F';

        var humidityEl = document.createElement("span");
        humidityEl.textContent = humidity + '%';

        var cardEl = document.createElement("div");
        cardEl.setAttribute("class", "card text-white bg-primary m-3 p-3 col-md-2");

        cardEl.appendChild(dateEl);
        cardEl.appendChild(iconSpan);
        cardEl.appendChild(tempEl);
        cardEl.appendChild(humidityEl);

        futureDivEl.appendChild(cardEl);
    }
}

// save at local storage:
var saveLocalStorage = function(city){

    storedCitiesarr = JSON.parse(localStorage.getItem("cities"));
    // storedCities.push(city);

    // localStorage.setItem("cities", JSON.stringify(storedCities));

    if(storedCitiesarr != null){   // if storedCitiesarr array is not empty:
        storedCitiesarr.push(city);
    }else{
        storedCitiesarr=[];
        storedCitiesarr.push(city);
    }
    localStorage.setItem("cities", JSON.stringify(storedCitiesarr));
    loadLocalStorage();
}

//load from local storage:
var loadLocalStorage = function(){
    var cities = localStorage.getItem("cities");
    if(!cities){
        return false;
    }
    cities = JSON.parse(cities);
    //console.log(cities);
    
    
    citiesList.textContent="";
    for(var i=0; i<cities.length; i++){
       // console.log(cities[i]);
       var anchorTag = document.createElement("a");
       anchorTag.setAttribute("href", "javascript:");
       anchorTag.setAttribute("class", "text-decoration-none text-dark");

       var citiesListItem = document.createElement("li");
       citiesListItem.setAttribute("class", "list-group-item");
       citiesListItem.textContent = cities[i];

       anchorTag.appendChild(citiesListItem);
       citiesList.appendChild(anchorTag);
    }
}


// Search city function calls get weather data function
var searchByCity = function(){
    var city = document.querySelector("#searchBox").value;
    getWeatherData(city);
    saveLocalStorage(city);
}

// When cities list item is clicked:
var citiesListHandler = function(event){
    var targetEl = event.target;
    
    if(targetEl.matches(".list-group-item")){
        var cityText = targetEl.textContent;
        getWeatherData(cityText);
    }
}

// load saved cities from storage to show in list:
loadLocalStorage();

// Search button click:
searchBtn.addEventListener("click", searchByCity);

// vity list item clicked:
citiesList.addEventListener("click", citiesListHandler);

