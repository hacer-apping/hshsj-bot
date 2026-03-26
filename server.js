const axios = require('axios');

const OpenWeatherMapAPIKey = 'YOUR_API_KEY';

module.exports = function (app) {

    app.command('/weather', async ({ command, ack, respond }) => {
        await ack();
        const city = command.text;

        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OpenWeatherMapAPIKey}&units=metric`);
            const weather = response.data;
            await respond(`The current temperature in ${weather.name} is ${weather.main.temp}°C with ${weather.weather[0].description}.`);
        } catch (error) {
            console.error(error);
            await respond(`Sorry, I couldn't fetch the weather for ${city}. Please ensure the city name is correct.`);
        }
    });

    app.command('/forecast', async ({ command, ack, respond }) => {
        await ack();
        const city = command.text;

        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OpenWeatherMapAPIKey}&units=metric`);
            const forecast = response.data;
            let forecastMessage = `Forecast for ${forecast.city.name}:\n`;
            forecast.list.forEach(item => {
                forecastMessage += `Date: ${new Date(item.dt * 1000).toLocaleString()}, Temperature: ${item.main.temp}°C, ${item.weather[0].description}\n`;
            });
            await respond(forecastMessage);
        } catch (error) {
            console.error(error);
            await respond(`Sorry, I couldn't fetch the forecast for ${city}.`);
        }
    });

    app.command('/compare', async ({ command, ack, respond }) => {
        await ack();
        const cities = command.text.split(',').map(city => city.trim());
        const responses = await Promise.all(cities.map(async city => {
            try {
                const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OpenWeatherMapAPIKey}&units=metric`);
                return `City: ${response.data.name}, Temperature: ${response.data.main.temp}°C`;
            } catch (error) {
                return `Could not fetch data for ${city}.`;
            }
        }));
        await respond(responses.join('\n'));
    });
};