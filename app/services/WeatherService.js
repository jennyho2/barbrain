const request = require('request'),
	  { filter, find } = require('lodash'),
	  
	  moment = require('moment');
	  
var https = require('https');
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
			const request = https.get('https://' + api_url + '?q=' + location + '&APPID=' + api_key, (response) => {
				// handle http errors
			    if (response.statusCode < 200 || response.statusCode > 299) {
			        reject(new Error('Failed to load page, status code: ' + response.statusCode));
			    }
			    // temporary data holder
			    const body = [];
			    // on every content chunk, push it to the data array
			    response.on('data', (chunk) => body.push(chunk));
			    // we are done, resolve promise with those joined chunks
			    response.on('end', () => {
			    	var res = Array.from(JSON.parse(body.join('')).list);
			    	var res2 = [];
			    	for (var i = 0; i < res.length; i++)  {
			    		if (moment(res[i].dt_txt).hour() == 18)  {
			    			res2.push(res[i]);
			    		}
			    	}
			    	resolve(res2);
				});
			});
			// handle connection errors of the request
			request.on('error', (err) => reject(err))
		});
	};
			// })
			// request.get('https://' + api_url + '?q=' + location + '&APPID=' + api_key)
			// .on('response', function(error, response, body)  {
			// 	//console.log(error);
			// 	//console.log(response);
			// 	console.log(body);
			// 	if (error) return reject(error);
			// 	resolve(body);
			// 	// resolve(response);
			// });

			// 			  return new Promise((resolve, reject) => {
			//     // select http or https module, depending on reqested url
			//     const lib = url.startsWith('https') ? require('https') : require('http');
			//     const request = lib.get(url, (response) => {
			//       // handle http errors
			//       if (response.statusCode < 200 || response.statusCode > 299) {
			//          reject(new Error('Failed to load page, status code: ' + response.statusCode));
			//        }
			//       // temporary data holder
			//       const body = [];
			//       // on every content chunk, push it to the data array
			//       response.on('data', (chunk) => body.push(chunk));
			//       // we are done, resolve promise with those joined chunks
			//       response.on('end', () => resolve(body.join('')));
			//     });
			//     // handle connection errors of the request
			//     request.on('error', (err) => reject(err))
			//     })
			// // request.get(api_url + '?id=' + location, (error, response, body) => {
			// // 	if (error) return reject(error);
			// // 	resolve(body);
			// // });
	// 	});
	// }
};
