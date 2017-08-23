const request = require('request'),
	  { filter, find } = require('lodash'),
	  
	  moment = require('moment');
	  
var parseString = require('xml2js').parseString;
// const mapping = require('json-mapping');

//var $ = require('jquery')(require("jsdom").jsdom().parentWindow);
const database = require('../db');

var api_url = "api.openweathermap.org/data/2.5/forecast";
var api_key = "ea6cc151ef534964fe9b53210a1f4ea6";
// var api_url = "https://api.poslavu.com/cp/reqserv/";

module.exports = class WeatherService {

	loadWeather(location)  {
		console.log(location);
		return database.connect().then(db => {
			return db.collection('weather').find({ location: this.location }).sort({ created_at: -1 }).limit(1).toArray().then(row => {
				if (!row || row.length == 0)  {
					console.log("No weather pulled for " + location + " yet. Loading from OpenWeather Api...");
					return this.getWeatherFromApi(location)
					.then(weather => {
						return db.collection('weather')
							.insert(weather)
							.then(() => weather);
					});
				}
				return row;
			});
		});
	}

	getWeatherFromApi(location)  {
		return new Promise((resolve, reject) => {
			//console.log('Performing Weather API request', data.form.table, this.locationId);
			console.log(api_url + '?q=' + location + '&APPID=' + api_key);
			request.get('https://' + api_url + '?q=' + location + '&APPID=' + api_key)
			.on('response', function(response)  {
				resolve(response);
				// resolve(response);
			});
			// request.get(api_url + '?id=' + location, (error, response, body) => {
			// 	if (error) return reject(error);
			// 	resolve(body);
			// });
		});
	}
};
