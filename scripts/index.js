
document.addEventListener("DOMContentLoaded", function () {
  
   let cityInput = document.querySelector("#cities");

  if (cityInput) {
    // Adaugă un eveniment pentru când se face clic pe butonul de căutare
    const searchButton = document.getElementById("search-btn");

    if (searchButton) {
      searchButton.addEventListener("click", searchAndLoadWeather);
    } else {
      console.error("Search button not found.");
    }

    // Dezactivează lista de derulare
function disableDropdown() {
  const citiesInput = document.getElementById("cities");
  if (citiesInput) {
    citiesInput.setAttribute("disabled", true);
  }
}

// Reactivează lista de derulare
function enableDropdown() {
  const citiesInput = document.getElementById("cities");
  if (citiesInput) {
    citiesInput.removeAttribute("disabled");
  }
}

// Afiseaza spinner-ul
function showSpinner() {
  isSpinnerVisible = true;

  const spinnerContainer = document.getElementById("spinner-container");
  if (spinnerContainer) {
    spinnerContainer.classList.remove("hidden");
  } else {
    console.error("Spinner container not found.");
  }
  // Dezactivează temporar lista de derulare
  disableDropdown();
}

// Ascunde spinner-ul
function hideSpinner() {
  isSpinnerVisible = false;

  const spinnerContainer = document.getElementById("spinner-container");
  if (spinnerContainer) {
    spinnerContainer.classList.add("hidden");
  } else {
    console.error("Spinner container not found.");
  }
  // Reactivează lista de derulare
  enableDropdown();
}

// Functie pentru a obtine datele despre vreme
async function fetchWeatherData(city) {
  try {
    showSpinner(); // Afișează spinner-ul înainte de a începe cererea

    const apiKeyWeatherMap = "8236a9d40dcd51f73c60f00c09eb6189";
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKeyWeatherMap}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKeyWeatherMap}`;

    const [currentWeatherResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl),
    ]);

    const currentWeatherData = await currentWeatherResponse.json();
    const forecastData = await forecastResponse.json();

    if (currentWeatherData.cod === 200 && forecastData.cod === "200") {
      const today = new Date();
      const nextDays = forecastData.list.filter((item) => {
        const forecastDate = new Date(item.dt_txt);
        return forecastDate.getDate() !== today.getDate(); // Exclude current day
      });

      const weatherInfo = {
        city: currentWeatherData.name,
        temperature: currentWeatherData.main.temp,
        description: currentWeatherData.weather[0].description,
        humidity: currentWeatherData.main.humidity,
        windSpeed: currentWeatherData.wind.speed,
        forecast: nextDays,
      };

      await fetchCityImage(city);
      renderWeatherInfo(weatherInfo);
    } else {
      console.error(
        "Error fetching weather data:",
        currentWeatherData.message || forecastData.message
      );
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
  } finally {
    hideSpinner(); // Ascunde spinner-ul după ce datele au fost încărcate
  }
}

const pexelsApiKey = "NVor2IqUsqygQRfibld7bMcrSPePovVdQIOpF2SzgABdknOJHdrhT1Q6";

// Funcție pentru a obține și afișa imaginea de fundal
async function fetchCityImage(city) {
  try {
    const pexelsApiUrl = `https://api.pexels.com/v1/search?query=${city}`;
    const response = await fetch(pexelsApiUrl, {
      headers: {
        Authorization: pexelsApiKey,
      },
    });
    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      //alege prima imagine
      const imageUrl = data.photos[0].src.original;

      document.body.style.backgroundImage = `url(${imageUrl})`;
    } else {
      // Dacă nu există imagini, elimină imaginea de fundal
      document.body.style.backgroundImage = "none";
      document.body.style.backgroundColor = "pink";
    }
  } catch (error) {
    console.error("Error fetching city image:", error);
  }
}

function renderWeatherInfo(weatherData) {
  const weatherInfoContainer = document.getElementById("weather-info");
  weatherInfoContainer.innerHTML = `
      <button id="favorite-btn" title="Add to Favorites"><i class="fas fa-heart"></i></button>
      <h2>${weatherData.city}</h2>
      <div id="today-card" class="forecast-card">
        <p><strong>Today</strong></p>
        <p>Temperature: ${weatherData.temperature}°C</p>
        <p>Weather: ${weatherData.description}</p>
        <p>Humidity: ${weatherData.humidity}%</p>
        <p>Wind Speed: ${weatherData.windSpeed}%</p>
        <i class="${getWeatherIconClass(weatherData.description)}"></i>
      </div>
      <h2>The rest of the days:</h2>
      <div id="forecast-container"></div> 
      
        `;
  const favoriteBtn = document.getElementById("favorite-btn");
  favoriteBtn.onclick = () => toggleFavorite(weatherData.city);
  updateFavoriteButton(favoriteBtn, weatherData.city);

  // urmatoarele zile
  const forecastContainer = document.getElementById("forecast-container");
  for (let i = 0; i < 5; i++) {
    const forecastItem = weatherData.forecast[i * 8];
    const forecastCard = document.createElement("div");
    forecastCard.classList.add("forecast-card");
    const date = new Date(forecastItem.dt_txt);
    const dayOfWeek = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
    }).format(date);
    forecastCard.innerHTML = `
        <p><strong>${dayOfWeek}</strong></p>
        <p>Temperature: ${forecastItem.main.temp}°C</p>
        <p>Weather: ${forecastItem.weather[0].description}</p>
        <p>Humidity: ${forecastItem.main.humidity}%</p>
        <p>Wind Speed: ${forecastItem.wind.speed} m/s</p>
        <i class="${getWeatherIconClass(
          forecastItem.weather[0].description
        )}"></i>
    `;
    forecastContainer.appendChild(forecastCard);
  }
}

// Functie pentru a obtine clasa FontAwesome pentru iconul vremii
function getWeatherIconClass(description) {
  if (description.toLowerCase().includes("sunny")) {
    return "fas fa-sun"; // FontAwesome class pentru soare
  } else if (description.toLowerCase().includes("rain")) {
    return "fas fa-cloud-showers-heavy"; // FontAwesome class pentru ploaie
  } else if (description.toLowerCase().includes("cloud")) {
    return "fas fa-cloud"; // FontAwesome class pentru nori
  } else if (description.toLowerCase().includes("clear")) {
    return "fas fa-sun"; // FontAwesome class pentru senin
  } else if (description.toLowerCase().includes("mist")) {
    return "fas fa-cloud-meatball"; // FontAwesome class pentru aburi
  } else if (description.toLowerCase().includes("snow")) {
    return "fas fa-snowflake"; // FontAwesome class pentru zapada
  } else {
    return "fas fa-question-circle"; // FontAwesome class implicit
  }
}

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function updateFavoriteButton(button, city) {
  if (favorites.includes(city)) {
    button.classList.add("fas");
    button.classList.remove("far");
  } else {
    button.classList.add("far");
    button.classList.remove("fas");
  }
}

function renderFavorites() {
  const container = document.getElementById("favorites-list");
  container.innerHTML = "";
  favorites.forEach((city) => {
    const listItem = document.createElement("li");
    listItem.textContent = city;
    listItem.onclick = () => {
      cityInput.value = city; // Optional: Update the city input field with the selected city
      fetchWeatherData(city);
    };
    container.appendChild(listItem);
  });
}


// Functie pentru a adauga sau scoate un oras din lista de favorite
function toggleFavorite(city) {
  const index = favorites.indexOf(city);
  if (index > -1) {
    favorites.splice(index, 1); // Remove from favorites
  } else {
    favorites.push(city); // Add to favorites
  }
  saveFavorites();
  renderFavorites();
  updateFavoriteButton(document.getElementById("favorite-btn"), city);
}


    
    function renderDatalist(data) {
      // creaza elementul datalist
      let datalist = document.createElement("datalist");
      datalist.id = "cities-data";
      cityInput.setAttribute("list", datalist.id);

      let fragment = document.createDocumentFragment();

      // creaza lista de optiuni
      for (let city of data) {
        let option = document.createElement("option");
        option.textContent = city.properties.formatted;
        fragment.append(option);
      }

      datalist.append(fragment);

      cityInput.after(datalist);
    }

    // Functie pentru a obtine sugestiile de orase
    async function fetchAndRenderCities(inputValue) {
      try {
        const apiKey = "d9912e272db34196b74fc9b32ab741e5";
        const apiUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${inputValue}&apiKey=${apiKey}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          renderDatalist(data.features);
        } else {
          console.error("No results found for the entered city.");
        }
      } catch (error) {
        console.error("Error while searching for the city:", error);
      }
    }

    // face autocompletarea oraselor
    cityInput.addEventListener("input", function () {
      const inputValue = cityInput.value.trim().toLowerCase();

      if (inputValue) {
        fetchAndRenderCities(inputValue);
      }
    });

    // Adaugă un eveniment pentru când se schimbă valoarea din lista de derulare
    cityInput.addEventListener("change", function () {
      const selectedCity = cityInput.value.trim();
      if (selectedCity) {
        fetchWeatherData(selectedCity);
      }
    });
  } else {
    console.error("City input field not found.");
  }

  //functia care este apelata atunci cand se face cautarea si se incarca vremea
  async function searchAndLoadWeather() {
    const selectedCity = cityInput.value.trim();

    if (selectedCity) {
      showSpinner();

      try {
        await fetchWeatherData(selectedCity);
      } catch (error) {
        console.error("Error loading weather data:", error);
      } finally {
        hideSpinner();
      }
    } else {
      console.error("Please enter a city name.");
    }
  }

  //functia care se asigura ca sugestiile nu sunt afisate cand spinner-ul e vizibil
  function handleCityInput() {
    if (!isSpinnerVisible) {
      const inputValue = cityInput.value.trim().toLowerCase();
      if (inputValue) {
        fetchAndRenderCities(inputValue);
      }
    }
  }

  // Adaugă un eveniment pentru când se tastează în câmpul de intrare
  cityInput.addEventListener("input", handleCityInput);

  renderFavorites();
});
