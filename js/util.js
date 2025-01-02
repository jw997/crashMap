
import { getJson, streetArray } from "./utils_helper.js";

// set default chart font color to black
Chart.defaults.color = '#000';
Chart.defaults.font.size = 14;

const selectVehicleTypes = document.querySelector('#selectVehicleTypes');

const check2024 = document.querySelector('#check2024');
const check2023 = document.querySelector('#check2023');
const check2022 = document.querySelector('#check2022');
const check2021 = document.querySelector('#check2021');
const check2020 = document.querySelector('#check2020');

const check2019 = document.querySelector('#check2019');
const check2018 = document.querySelector('#check2018');
const check2017 = document.querySelector('#check2017');
const check2016 = document.querySelector('#check2016');
const check2015 = document.querySelector('#check2015');

const selectStreet = document.querySelector('#selectStreet');
const selectSeverity = document.querySelector('#severity');

const summary = document.querySelector('#summary');

// populate the street select options
function populateStreetSelect(mergedTransparencyJson, selectStreet) {
	const setStreets = new Set();

	for (const coll of mergedTransparencyJson) {
		const attr = coll.attributes;
		const loc = attr.Accident_Location;
		const arr = loc.split("/").map((s) => s.trim());

		for (const str of arr) {
			const e = str.trim();
			//	console.log("#", e, '#');
			if (!setStreets.has(e)) {
				setStreets.add(e);
			}
		}
	}

	// sort
	const arrSorted = Array.from(setStreets).sort();

	console.log(setStreets.size, arrSorted.length);
	//	console.debug("Streetnames")
	/*
	for (const str of arrSorted) {
		console.debug(str);
		const opt = document.createElement("option");
		opt.text = str;
		selectStreet.add(opt, null);
	}*/

	for (const str of streetArray) {
		const opt = document.createElement("option");
		opt.value = str;
		opt.text = str.split("|")[0];
		selectStreet.add(opt, null);
	}
}

var greenIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var goldIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var redIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

const collisionsJsonFile = './db/exports/BPCOLL.json';
const collisionsJson = await getJson(collisionsJsonFile);

const transparencyJsonFile = './db/exports/transparency.portal.2024.json';
const transparencyJson = await getJson(transparencyJsonFile);

async function getTransparencyData() {
	var arrays = [];
	for (var y = 2015; y <= 2024; y++) {
		const file = './data/' + y + '.json';
		const transparencyJson = await getJson(file);
		arrays.push(transparencyJson.features);
	}
	const retval = [].concat(...arrays)
	return retval;

}

const mergedTransparencyJson = await (getTransparencyData());

const popupFields = ['Date',
	'Time',
	//'Day_of_Week',
	'Case_Number',
	'Accident_Location',
	'Latitude',
	'Longitude',
	'Collision_Classification_Descri',
	'Collision_Type',
	'Primary_Collision_Factor_Code',
	'PCF_Description',
	//	'PCF_Category',
	'Involved_Objects',
	'Involved_Parties',
	'Party_at_Fault',
	'Number_of_Injuries',
	'Number_of_Fatalities',
	'Suspected_Serious_Injury'
];
function collisionPopup(obj) {
	var msg = "";
	for (const k of popupFields) {
		const v = obj[k];
		if (v) {
			msg += (k + ': ' + v + '<br>');
		}
	}
	return msg;
}

var map;

function createMap() {
	// Where you want to render the map.
	var element = document.getElementById('osm-map');
	// Height has to be set. You can do this in CSS too.
	//element.style = 'height:100vh;';
	// Create Leaflet map on map element.
	map = L.map(element);
	// Add OSM tile layer to the Leaflet map.
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	// Target's GPS coordinates.
	var target = L.latLng('37.87', '-122.27'); // berkeley 37°52′18″N 122°16′22″W
	// Set map's center to target with zoom 14.
	map.setView(target, 14);
	// add geojson precincts to map
}



createMap();

const resizeObserver = new ResizeObserver(() => {
	console.log("resize observer fired");
	map.invalidateSize();
});

resizeObserver.observe(document.getElementById('osm-map'));



// keep track of markers for removal
const markers = [];

function removeAllMakers() {
	for (const m of markers) {
		m.remove();
	}
}

function checkFilter(attr, vehTypeRegExp,
	filter2024, filter2023,
	filter2022, filter2021, filter2020,
	filter2019,
	filter2018,
	filter2017,
	filter2016,
	filter2015,

	selectStreet, severity
) {
	const involved = attr.Involved_Objects;

	const m = involved.match(vehTypeRegExp);

	if (!m) {
		return false;
	}

	const year = attr.Year;
	if ((year == 2024) && !filter2024) {
		return false;

	}
	if ((year == 2023) && !filter2023) {
		return false;

	}
	if ((year == 2022) && !filter2022) {
		return false;

	}
	if ((year == 2021) && !filter2021) {
		return false;

	}
	if ((year == 2020) && !filter2020) {
		return false;

	}
	if ((year == 2019) && !filter2019) {
		return false;

	}
	if ((year == 2018) && !filter2018) {
		return false;

	}
	if ((year == 2017) && !filter2017) {
		return false;

	}
	if ((year == 2016) && !filter2016) {
		return false;

	}
	if ((year == 2015) && !filter2015) {
		return false;

	}
	if ((year < 2015) || (year > 2024)) {
		return false;
	}
	const loc = attr.Accident_Location;

	if (selectStreet != "Any") {

		if (selectStreet.includes('|')) {
			const re = new RegExp(selectStreet);

			if (!loc.match(re)) {
				return false;
			} else {
				return true;
			}
		} else {
			return loc.includes(selectStreet);

		}

	}
	if (severity == 'Fatality') {
		if (attr.Number_of_Fatalities == 0) {
			return false;
		}
	}
	if (severity == 'Injury') {
		if (attr.Number_of_Injuries == 0) {
			return false;
		}
	}
	if (severity == 'NonInjury') {
		if ((attr.Number_of_Injuries != 0) || (attr.Number_of_Fatalities != 0)) {
			return false;
		}
	}
	return true;
}


function addMarkers(collisionJson, histData, histFaultData,
	vehTypeRegExp,
	filter2024, filter2023, filter2022, filter2021, filter2020,

	filter2019,
	filter2018,
	filter2017,
	filter2016,
	filter2015,

	selectStreet, selectSeverity

) {
	removeAllMakers();
	const markersAtLocation = new Map();
	// add collisions to map
	var markerCount = 0
	var skipped = 0, plotted = 0;

	for (const coll of collisionJson) {
		const attr = coll.attributes;
		/*if (!attr.Accident_Location.includes('Fulton')) {
			skipped++;
			continue;
		}*/
		const checked = checkFilter(attr, vehTypeRegExp,
			filter2024, filter2023, filter2022, filter2021, filter2020,
			filter2019,
			filter2018,
			filter2017,
			filter2016,
			filter2015,

			selectStreet, selectSeverity);
		if (!checked) {
			continue;
		}
		plotted++;
		histData.set(attr.Year, histData.get(attr.Year) + 1);

		histFaultData.set(attr.Party_at_Fault, histFaultData.get(attr.Party_at_Fault) + 1);

		if (attr.Latitude && attr.Longitude) {
			const loc = [attr.Latitude, attr.Longitude];
			const roundLoc = loc.map((c) => c.toFixed(3));
			const ct = markersAtLocation.get(JSON.stringify(loc)) ?? 0;

			if (ct > 0) {
				console.log("adjusting marker")
			}

			var myMarker;
			if (attr.Number_of_Fatalities > 0) {
				myMarker = redIcon;
			} else if (attr.Number_of_Injuries > 0) {
				myMarker = goldIcon
			} else {
				myMarker = greenIcon;
			}
			const marker = L.marker([attr.Latitude + ct * 0.0001, attr.Longitude - ct * 0.0001],
				{ icon: myMarker });
			markersAtLocation.set(JSON.stringify(loc), ct + 1);
			const msg = collisionPopup(attr);
			marker.bindPopup(msg).openPopup();
			marker.addTo(map);
			markers.push(marker);
			markerCount++;
		}
	}
	console.log('Skipped', skipped);
	console.log('Plotted', plotted);
	console.log("markerCount ", markerCount)

	const summaryMsg = '<br>Matching collsions: ' + plotted;//+ '<br>' + 'Skipped: ' + skipped + '<br>';
	summary.innerHTML = summaryMsg;


}
//	map.setView(target, 14);
//	addMarkers(mergedTransparencyJson, true, true, true, true, true, true, true, true);

const histData = new Map();
function clearHistData() {
	for (var y = 2015; y < 2025; y++) {
		histData.set(y, 0);
	}
}
clearHistData();
var histChart;

var histFaultData = new Map();
const faultKeys = [
	"Bicyclist",
	"Driver",
	"Object",
	"Other",
	"Pedestrian"
];

function clearFaultData() {
	for (const f of faultKeys) {
		histFaultData.set(f, 0);
	}
}
clearFaultData();
var histFaultChart;

function handleFilterClick() {
	clearHistData();
	clearFaultData();
	addMarkers(mergedTransparencyJson, histData, histFaultData,

		selectVehicleTypes.value,

		check2024.checked,
		check2023.checked,
		check2022.checked,
		check2021.checked,
		check2020.checked,

		check2019.checked,
		check2018.checked,
		check2017.checked,
		check2016.checked,
		check2015.checked,

		selectStreet.value,
		selectSeverity.value


	);
	// make fault histo
	console.dir(histFaultData);

	(function () {
		const data = [];
		for (const k of faultKeys) {
			data.push({ party: k, count: histFaultData.get(k) })
		}
		if (histFaultChart == undefined) {
			histFaultChart = new Chart(
				document.getElementById('crashFaultHist'),
				{
					type: 'bar',
					data: {
						labels: data.map(row => row.party),
						datasets: [
							{
								label: 'matching crashes by fault',
								data: data.map(row => row.count)
							}
						]
					}
				}
			);
		} else {
			//const newData = data.map(row => row.count);
			// update data

			const newData = {
				label: 'matching crashes by fault',
				data: data.map(row => row.count)
			}

			histFaultChart.data.datasets.pop();
			histFaultChart.data.datasets.push(newData);
			console.log(newData);
			histFaultChart.update();
		}
	})();

	console.dir(histData);

	(function () {
		const data = [
			{ year: 2015, count: histData.get(2015) },
			{ year: 2016, count: histData.get(2016) },
			{ year: 2017, count: histData.get(2017) },
			{ year: 2018, count: histData.get(2018) },
			{ year: 2019, count: histData.get(2019) },
			{ year: 2020, count: histData.get(2020) },
			{ year: 2021, count: histData.get(2021) },
			{ year: 2022, count: histData.get(2022) },
			{ year: 2023, count: histData.get(2023) },
			{ year: 2024, count: histData.get(2024) },

		];
		if (histChart == undefined) {
			histChart = new Chart(
				document.getElementById('crashHist'),
				{
					type: 'bar',
					data: {
						labels: data.map(row => row.year),
						datasets: [
							{
								label: 'matching crashes by year',
								data: data.map(row => row.count)
							}
						]
					}
				}
			);
		} else {
			//const newData = data.map(row => row.count);
			// update data

			const newData = {
				label: 'matching crashes by year',
				data: data.map(row => row.count)
			}

			histChart.data.datasets.pop();
			histChart.data.datasets.push(newData);
			console.log(newData);
			histChart.update();
		}
	})();



}
/* unused stuff
function randomOffset() {
	const r = Math.random() - 0.5;
	return r / 5000;
}
function objToString(obj) {
	var msg = "";

	for (const [key, value] of Object.entries(obj)) {
		msg += ('<br>' + key + ':' + value);
	}
	return msg;
}


const bikeIcon = L.icon({ iconUrl: './test/bicycle.png' });
const pedIcon = L.icon({ iconUrl: './test/pedestrian.png' });
const carIcon = L.icon({ iconUrl: './test/suv.png' });


*/

export {
	collisionsJson, transparencyJson, mergedTransparencyJson, greenIcon, goldIcon, redIcon,
	populateStreetSelect, collisionPopup,
	map, handleFilterClick
};