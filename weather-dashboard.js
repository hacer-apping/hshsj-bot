class WeatherDashboard {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${this.apiKey}`;
    }
    async getWeather(city) {
        const response = await fetch(`${this.apiUrl}&q=${city}`);
        if (!response.ok) {
            throw new Error('Error fetching weather data');
        }
        return await response.json();
    }
    displayWeather(data) {
        const weatherInfo = `City: ${data.name}, Temperature: ${data.main.temp}, Weather: ${data.weather[0].description}`;
        console.log(weatherInfo);
    }
}

// Example usage:
// const dashboard = new WeatherDashboard('your_api_key_here');
// dashboard.getWeather('London').then(data => dashboard.displayWeather(data));
