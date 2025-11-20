'use strict';

var lastTime = 0;
function getMS(msg) {
	const thisTime = Date.now();
	const diff = thisTime - lastTime;
	lastTime = thisTime;

	if (msg) {
		console.log(msg, ':', diff, ' ms')
	}
	return diff;
}

function readJsonFile(path) {
	const data = fs.readFileSync(path);
	const json = JSON.parse(data);
	return json;
}

/*****************GPSADDR ***************** */

//var wayJson = JSON.parse(readFileSync('./temp/ways.json', 'utf8'));


async function getWaysJson() {
	const waysFileName = '../../data/geocoder/ways.json';
	const waysJson = readJsonFile(waysFileName)
	return waysJson;
}

const wayJson = await getWaysJson();

var wayData = [];

function initWayData(obj) {
	for (const way of obj.elements) {
		const tags = way.tags;

		if (!tags) {
			console.log("skipping no tag way");
			continue;
		}
		const name = tags.name;
		if (!name) {
			//console.log("Undefined name for way id:", way.id);
			continue;
		}
		const geometry = way.geometry; // list of lat long 

		const bounds = way.bounds;

		wayData.push({ 'name': name, 'geometry': geometry, 'bounds': bounds });

		//console.log(name, geometry.length);
	}
}

initWayData(wayJson);

function distGpsGps(gps1, gps2) {//  { "lat": 37.8655316, "lon": -122.3100479 },
	const dLat = Math.abs(gps1.lat - gps2.lat);
	const dLon = Math.abs(gps1.lon - gps2.lon);
	const retval = dLat + dLon;
	return retval;
}
function distGpsGeometry(gps, geom) {  // geom is array of gps points
	var minDist = 9999999999;
	for (const gps2 of geom) {
		const d = distGpsGps(gps, gps2);
		minDist = Math.min(minDist, d);
	}
	return minDist;
}


function isNear( gps, bounds) {
	/*
	gps
	 { "lat": 37.8655316, "lon": -122.3100479 },

	"bounds": {
		"minlat": 37.8665279,
		"minlon": -122.2427622,
		"maxlat": 37.8691466,
		"maxlon": -122.2402112
	  },
	  */

	if (!bounds) {
		return true;
	}
	const epsilon = 100.0 / metersPerDegree;



	if (gps.lat < bounds.minlat - epsilon) {
		return false;
	}
	if (gps.lat > bounds.maxlat + epsilon) {
		return false;
	}

	if (gps.lon < bounds.minllon - epsilon) {
		return false;
	}
	if (gps.lon > bounds.maxllon + epsilon) {
		return false;
	}


	return true;
}

// 1 degree approx 100,000 meteres
const metersPerDegree = 100000;
const fuzzLimit = 0.0001

function findClosest(gps) //  { "lat": 37.8655316, "lon": -122.3100479 },
{
	var min1 = 99999999999;  // min1 is closest node, min2 is 2nd closest
	// min2Name is always a different road name from min1Name
	var min1Name;
	var min2 = min1;
	var min2Name;

	var wayCount=0;
	var waySkip = 0;


	for (const w of wayData) {
		wayCount++
		// skip if gps is not in wayData bbox 
		if ( !isNear(gps, w.bounds)) {
			waySkip ++;
			continue;

		}
		const d = distGpsGeometry(gps, w.geometry);
		if (d < min1) {

			if (w.name != min1Name) { // avoid making min2Name equal to new min1Name
				min2Name = min1Name;
				min2 = min1;
			}


			min1Name = w.name;
			min1 = d;
			if (d < 10 * fuzzLimit) {
				//console.log(min1Name, ': ', metersPerDegree * d);
			}
			continue;
		}


		if (d < min2 && w.name != min1Name) { // avoid making min2Name equal to new min1Name
			min2Name = w.name;
			min2 = d;
			if (d < 10 * fuzzLimit) {
				//console.log(min2Name, ': ', metersPerDegree * d);
			}
		}

	}
	
	//console.log("Waycount: ", wayCount - waySkip,"/", waySkip );
	//console.log("WaySkipped: ", waySkip);

	if (min2) {
		return "" + min1Name + '/' + min2Name;
	} else {
		return min1Name;
	}
	

}





/*************END GPSADDR ****************** */

// read a transparency port geojson file
// output the features to a new json file after adding the street names
// filter out any unwanted fields??

for (let j = 0; j < process.argv.length; j++) {
	console.log(j + ' -> ' + (process.argv[j]));
}

const tpFileName = process.argv[2];
const outputFilename = process.argv[3] ?? './testoutput.json';

import * as fs from 'fs';


import { exit } from 'process';

const data = fs.readFileSync(tpFileName);
const tpJson = JSON.parse(data);



//const constBerkeley = 'Berkeley'

function fixStops(stops) {
	for (const s of stops) {
		const attr = s.attributes;

		const fme = attr.DateTime_FME;
		if ((!fme) || (fme.length < 12)) {
			console.log("stop with undefined DateTime_FME", attr.Stop_GlobalID);
			continue;
		}

		//starting in 2024 the format changes!
		// "DateTime_FME": "2024-02-22 11:35:00",

		const YYYY = fme.substr(0, 4);

		const y = parseInt(YYYY);
		if (y <= 2023) {
			const MM = fme.substr(4, 2);
			const DD = fme.substr(6, 2);
			const hh = fme.substr(8, 2);
			const mm = fme.substr(10, 2);
			const ss = "00";
			const hyphen = '-';
			const colon = ':';
			const newDate = YYYY + hyphen + MM + hyphen + DD;
			const newTime = hh + colon + mm + colon + ss;

			attr.Date = newDate;
			attr.Time = newTime;
			attr.Hour = parseInt(hh);
		} else {
			const newDate = fme.substr(0, 10);
			const newTime = fme.substr(11, 8);

			attr.Date = newDate;
			attr.Time = newTime;
			attr.Hour = parseInt(newTime.substr(0, 2));
		}
		attr.Year = parseInt(YYYY);
		if (attr.Hour < 0 || attr.Hour > 24) {
			console.log("Unexpected hour for stop ", attr.DateTime_FME, ' ', attr.Hour);
		}
	}
}





getMS();
fixStops(tpJson.features)
getMS('fix stop times');

function truncateFloat(f,fractionDigits) {
	return parseFloat(f.toFixed(fractionDigits))
}
const GPSPREC = 7;

function addStopLocations(stops) {
	for (const s of stops) {
		const attr = s.attributes;
		attr.Latitude = truncateFloat(attr.Latitude, GPSPREC);
		attr.Longitude = truncateFloat(attr.Longitude, GPSPREC);

		const lat = attr.Latitude;
		const lon = attr.Longitude;
		const gps = { 'lat': lat, 'lon': lon };

		const closest = findClosest(gps);
		if (closest) {
			attr.Stop_Location = closest;
		} else {
			console.log("Failed to find street for ", gps);
		}
	}
}

addStopLocations(tpJson.features);
getMS('added stop locations')


function deleteUnwantedFields(stop) {
	for (const s of stop) {
		const attr = s.attributes;
		delete attr.Date_of_Stop
		delete attr.Time_of_Stop
		delete attr.DateTime_ISO
	}
}


deleteUnwantedFields(tpJson.features);
getMS('delete unwanted fields')







// write to json file
const output = JSON.stringify(tpJson, null, 2);
fs.writeFileSync(outputFilename, output);

console.log("bye")
