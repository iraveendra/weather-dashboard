import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CityCard from './CityCard';
import './Dashboard.css';

const Dashboard = () => {
  const [cities, setCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestedCities, setSuggestedCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // Track the highlighted suggestion

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/cities`);
        setCities(response.data);

        // Load selected cities from local storage
        const savedCities = localStorage.getItem('selectedCities');
        if (savedCities) {
          setSelectedCities(JSON.parse(savedCities));
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    fetchCities();
  }, []);

  // Save selected cities to local storage whenever it changes
  useEffect(() => {
    if (selectedCities.length > 0) {
      localStorage.setItem('selectedCities', JSON.stringify(selectedCities));
    } else {
      localStorage.removeItem('selectedCities');
    }
  }, [selectedCities]);


  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 0) {
      const matches = cities.filter(city =>
        city.name.toLowerCase().includes(term.toLowerCase())
      );
      setSuggestedCities(matches);
      setHighlightedIndex(-1); // Reset highlighted index when the search term changes
    } else {
      setSuggestedCities([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowDown') {
      setHighlightedIndex(prevIndex => 
        prevIndex < suggestedCities.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex(prevIndex => 
        prevIndex > 0 ? prevIndex - 1 : prevIndex
      );
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestedCities.length) {
        handleCitySelect(suggestedCities[highlightedIndex]);
      } else if (suggestedCities.length > 0) {
        handleCitySelect(suggestedCities[0]); // Select the first suggested city if no arrow keys were used
      } else {
        const exactMatch = cities.find(city =>
          city.name.toLowerCase() === searchTerm.toLowerCase()
        );
        if (exactMatch) {
          handleCitySelect(exactMatch);
        }
      }
    }
  };

  const handleCitySelect = async (city) => {
    const existingCityIndex = selectedCities.findIndex(selectedCity => selectedCity.name === city.name);
    
    if (existingCityIndex !== -1) {
      // Trigger the blink effect on the already selected city
      setSelectedCities(selectedCities.map((selectedCity, index) => 
        index === existingCityIndex ? { ...selectedCity, blink: true } : selectedCity
      ));
      
      // Remove the blink effect after a short delay
      setTimeout(() => {
        setSelectedCities(selectedCities.map((selectedCity, index) => 
          index === existingCityIndex ? { ...selectedCity, blink: false } : selectedCity
        ));
      }, 1000); // Duration of the blink effect
  
      return;
    }
  
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/weather`, { params: { city: city.name } });
      setSelectedCities([...selectedCities, { ...city, weatherData: response.data, blink: false }]);
      setSearchTerm('');
      setSuggestedCities([]);
      setHighlightedIndex(-1);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };
  

  const handleDeleteCity = (cityName) => {
    setSelectedCities(selectedCities.filter(city => city.name !== cityName));
  };

  return (
    <div>
      <nav className="navbar">
        <h1>Weather Dashboard</h1>
        <div className="profile">
          <img src="profile.webp" alt="Profile" />
          <div className="dropdown">
            <a href={`${process.env.REACT_APP_API_BASE_URL}/logout`}>Logout</a>
          </div>
        </div>
      </nav>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for a city..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyPress} // Handle key presses
        />
        {suggestedCities.length > 0 && (
          <ul className="suggestions-list">
            {suggestedCities.map((city, index) => (
              <li
                key={city._id}
                className={index === highlightedIndex ? 'highlighted' : ''}
                onClick={() => handleCitySelect(city)}
              >
                {city.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="cards-container">
        {selectedCities.map((city) => (
          <CityCard
            key={city.name}
            city={city}
            handleDelete={() => handleDeleteCity(city.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
