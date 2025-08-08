document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementsByTagName("button")[0]; 
  const input = document.getElementsByTagName("input")[0]; 
  const api_key = "0abc3614549de79d214feb26f97f20c6";
  const content = document.getElementsByClassName("data")[0]; 

  btn.addEventListener("click", () => {
    if (input.value.trim() === "") {
      getUserLocation();
    } else {
      getEnteredLocation(input.value.trim());
    }
  });

  // Getting Data
  async function fetchData(lat, long) {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${api_key}`
    );
    return await res.json(); // FIX: parse JSON
  }

  // Using GeoLocation API to get Coordinates of User
  function getCoordinates() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            resolve({ latitude, longitude });
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error("Geolocation is not supported by this browser."));
      }
    });
  }

  // Using Async Await to get coordinates and passing them to fetch data
  async function getUserLocation() {
    try {
      const coordinates = await getCoordinates();
      const obj = await fetchData(coordinates.latitude, coordinates.longitude);
      renderWeather(obj);
    } catch (error) {
      console.error("Error getting coordinates:", error);
    }
  }

  async function getEnteredLocation(city_name) {
    try {
      const obj = await User_Request(city_name);
      renderWeather(obj);
    } catch (err) {
      console.error("Error fetching city weather:", err);
    }
  }

  async function User_Request(city) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}`
      );
      return await res.json(); // FIX: parse JSON
    } catch {
      throw new Error("City Weather not Found");
    }
  }

  // Converts Kelvin to Celsius
  function kelvinToCelsius(k) {
    return (k - 273.15).toFixed(1);
  }

  // Formats Time from API
  function formatTime(unix, timezoneOffset) {
    return new Date((unix + timezoneOffset) * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Common rendering function to avoid duplication
  function renderWeather(obj) {
    if (!obj || obj.cod !== 200) {
      content.innerHTML = `<p>Error: ${
        obj?.message || "Data not available"
      }</p>`;
      return;
    }

    content.innerHTML = `
      <h2>${obj.name}, ${obj.sys.country}</h2>
      <p>Last updated: ${formatTime(obj.dt, obj.timezone)}</p>

      <div style="display: flex; align-items: center; gap: 15px;">
          <img src="https://openweathermap.org/img/wn/${
            obj.weather[0].icon
          }@2x.png" 
               alt="${obj.weather[0].description}">
          <div>
              <h1>${kelvinToCelsius(obj.main.temp)}°C</h1>
              <p>${obj.weather[0].main} - ${obj.weather[0].description}</p>
              <p>Feels like: ${kelvinToCelsius(obj.main.feels_like)}°C</p>
          </div>
      </div>

      <h3>Details</h3>
      <ul>
          <li>Min Temp: ${kelvinToCelsius(obj.main.temp_min)}°C</li>
          <li>Max Temp: ${kelvinToCelsius(obj.main.temp_max)}°C</li>
          <li>Humidity: ${obj.main.humidity}%</li>
          <li>Pressure: ${obj.main.pressure} hPa</li>
          <li>Visibility: ${(obj.visibility / 1000).toFixed(1)} km</li>
          <li>Wind: ${(obj.wind.speed * 3.6).toFixed(1)} km/h, ${
      obj.wind.deg
    }°</li>
          <li>Cloud Cover: ${obj.clouds.all}%</li>
          ${
            obj.rain?.["1h"]
              ? `<li>Rain (last 1h): ${obj.rain["1h"]} mm</li>`
              : ""
          }
      </ul>

      <h3>Sun</h3>
      <ul>
          <li>Sunrise: ${formatTime(obj.sys.sunrise, obj.timezone)}</li>
          <li>Sunset: ${formatTime(obj.sys.sunset, obj.timezone)}</li>
      </ul>
    `;
  }
});
