import React, { useState } from 'react';
import './CityCard.css';

const CityCard = ({ city, handleDelete }) => {
  const { weatherData, name } = city; // 'name' is the name selected from the dropdown
  const [isCelsius, setIsCelsius] = useState(true);

  const toggleUnit = () => setIsCelsius(!isCelsius);

  const temperature = isCelsius ? weatherData.main.temp : (weatherData.main.temp * 9/5) + 32;
  const unit = isCelsius ? '°C' : '°F';

  return (
    <div className={`city-card ${city.blink ? 'blink' : ''}`}>
      <button className="delete-btn" onClick={handleDelete}>✖</button>
      <div className="city-card-content">
        <div className="city-info">
          <h2>{name}</h2> {/* City name chosen from dropdown */}
          <h3>({weatherData.name})</h3> {/* City name from OpenWeather API */}
          <p className="weather-description">{weatherData.weather[0].description}</p>
        </div>
        <div className="temperature-info">
          <p className="temperature">{Math.round(temperature)}{unit}</p>
          <button className="toggle-btn" onClick={toggleUnit}>Switch to {isCelsius ? '°F' : '°C'}</button>
        </div>
      </div>
    </div>
  );
};

export default CityCard;
