import React, { useState, useEffect } from 'react';
import { CssBaseline, Grid } from '@material-ui/core';

import { getPlacesData, getWeatherData } from './api/index';
import Header from './components/Header/Header';
import List from './components/List/List';
import Map from './components/Map/Map';

const App = () => {
    // State variables
    const [type, setType] = useState('restaurants');
    const [rating, setRating] = useState('');

    const [coords, setCoords] = useState({}); // Initialized coords state
    const [bounds, setBounds] = useState(null);

    const [weatherData, setWeatherData] = useState([]);
    const [filteredPlaces, setFilteredPlaces] = useState([]);
    const [places, setPlaces] = useState([]);

    const [autocomplete, setAutocomplete] = useState(null);
    const [childClicked, setChildClicked] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Effect for fetching user's current location
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
            setCoords({ lat: latitude, lng: longitude }); // Setting coords state
        });
    }, []);

    // Effect for filtering places based on rating
    useEffect(() => {
        const filtered = places.filter((place) => Number(place.rating) > Number(rating)); // Added Number conversion

        setFilteredPlaces(filtered);
    }, [rating, places]); // Added places dependency

    // Effect for fetching weather data and places based on bounds and type
    useEffect(() => {
        if (bounds) {
            setIsLoading(true);

            getWeatherData(coords.lat, coords.lng)
                .then((data) => setWeatherData(data))
                .catch((error) => console.error("Error fetching weather data:", error)); // Error handling for weather data fetching

            getPlacesData(type, bounds.sw, bounds.ne)
                .then((data) => {
                    setPlaces(data.filter((place) => place.name && place.num_reviews > 0));
                    setFilteredPlaces([]); // Clearing filteredPlaces when new places are fetched
                    setRating('');
                    setIsLoading(false);
                })
                .catch((error) => console.error("Error fetching places data:", error)); // Error handling for places data fetching
        }
    }, [bounds, coords, type]); // Added coords dependency

    // Function to handle loading autocomplete
    const onLoad = (autoC) => setAutocomplete(autoC);

    // Function to handle place changed in autocomplete
    const onPlaceChanged = () => {
        const lat = autocomplete.getPlace().geometry.location.lat();
        const lng = autocomplete.getPlace().geometry.location.lng();

        setCoords({ lat, lng });
    };

    return (
        <>
            <CssBaseline />
            <Header onPlaceChanged={onPlaceChanged} onLoad={onLoad} />
            <Grid container spacing={3} style={{ width: '100%' }}>
                <Grid item xs={12} md={4}>
                    <List
                        isLoading={isLoading}
                        childClicked={childClicked}
                        places={filteredPlaces.length ? filteredPlaces : places}
                        type={type}
                        setType={setType}
                        rating={rating}
                        setRating={setRating}
                    />
                </Grid>
                <Grid item xs={12} md={8} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Map
                        setChildClicked={setChildClicked}
                        setBounds={setBounds}
                        setCoords={setCoords}
                        coords={coords}
                        places={filteredPlaces.length ? filteredPlaces : places}
                        weatherData={weatherData}
                    />
                </Grid>
            </Grid>
        </>
    );
};

export default App;
