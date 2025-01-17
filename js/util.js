
import { getJson, streetArray } from "./utils_helper.js";

// set default chart font color to black
Chart.defaults.color = '#000';
Chart.defaults.font.size = 14;

const selectData = document.querySelector('#selectData');

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

const saveanchor = document.getElementById('saveanchor')

const mapLocalCaseIDToAttr = new Map();

// populate the street select options
function populateStreetSelect(mergedTransparencyJson, selectStreet) {
	const setStreets = new Set();

	for (const coll of mergedTransparencyJson) {
		const attr = coll.attributes;

		/* save gps info for missing state records */
		if (attr.Longitude && attr.Latitude) {
			mapLocalCaseIDToAttr.set(attr.Case_Number, attr);
		}
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

function getIcon(name) {
	const icon = new L.Icon({
		iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/' + name,
		shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],
		shadowSize: [41, 41]
	});
	return icon;

}

const greenIcon = getIcon('marker-icon-green.png');
const redIcon = getIcon('marker-icon-red.png');
const orangeIcon = getIcon('marker-icon-orange.png');
const yellowIcon = getIcon('marker-icon-yellow.png');
const goldIcon = getIcon('marker-icon-gold.png');
const blueIcon = getIcon('marker-icon-blue.png');
const violetIcon = getIcon('marker-icon-violet.png');

// todo make a severity class with the icons and text wrapped together
function getIconForSeverity(sev) {
	var icon;
	switch (sev) {
		case 'Fatal':
			icon = redIcon;
			break;
		case "Serious Injury":
			icon = orangeIcon;
			break;
		case "Minor Injury":
			icon = goldIcon;
			break;
		case "Possible Injury":
			icon = yellowIcon;
			break;
		case "No Injury":
			icon = blueIcon;
			break;
		case "Unspecified Injury":
			icon = violetIcon;
			break;
		default:
			console.error("Unexpected Injury severity ", sev);
	}
	return icon;
}


/*
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
*/
//const collisionsJsonFile = './db/exports/BPCOLL.json';
//const collisionsJson = await getJson(collisionsJsonFile);

//const transparencyJsonFile = './db/exports/transparency.portal.2024.json';
//const transparencyJson = await getJson(transparencyJsonFile);

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

async function getSWITRSData() {
	var arrays = [];

	const fileNames = ['switrs2015-2019.json', 'switrs2020-2024.json'];
	for (const fName of fileNames) {
		const file = './data/' + fName;
		const swtrsJson = await getJson(file);
		arrays.push(swtrsJson.features);

	}
	/*
		const file = './data/statetest.json';
		const swtrsJson = await getJson(file);
		arrays.push(swtrsJson.features); */
	const retval = [].concat(...arrays)
	return retval;

}

const mergedSWITRSJson = await (getSWITRSData());

function makeTimeStampSet(arr) {
	var setTimeStamps = new Set();
	for (const coll of arr) {
		const d = coll.attributes.Date;
		const t = coll.attributes.Time;

		if (!d || !t) {
			console.log("collision with missing date time ", coll);
		} else {
			const str = d + ' ' + t;
			const ts = Date.parse(str);
			if (setTimeStamps.has(str)) {
				console.log("collsion with dupe date time ", coll);

			} else {
				setTimeStamps.add(ts);
				if (!coll.attributes.DateTime) {
					coll.attributes.DateTime = ts;
				}
			}
		}
	}
	return setTimeStamps;
}
// make set of swtrs collision time stamps
const tsSwtrs = makeTimeStampSet(mergedSWITRSJson);
const tsTransparency = makeTimeStampSet(mergedTransparencyJson);


const tsSwtrsUnionTransparency = tsSwtrs.union(tsTransparency);
const tsSwrtsIntersectionTransparency = tsSwtrs.intersection(tsTransparency);
const tsSwtrsMinusTransparency = tsSwtrs.difference(tsTransparency);
const tsTransparencyMinusSwtrs = tsTransparency.difference(tsSwtrs);

var mergedUnion = mergedSWITRSJson.slice();
for (const e of mergedTransparencyJson) {
	if (tsTransparencyMinusSwtrs.has(e.attributes.DateTime)) {
		mergedUnion.push(e);
	}
}

console.log(" mergedUnion: ", mergedUnion.length);





console.log("Swtrs time stamps: ", tsSwtrs.size);
console.log("Transparency time stamps: ", tsTransparency.size);

console.log("tsSwtrsUnionTransparency: ", tsSwtrsUnionTransparency.size);
console.log("tsSwrtsIntersectionTransparency :", tsSwrtsIntersectionTransparency.size);

console.log("tsSwtrsMinusTransparency: ", tsSwtrsMinusTransparency.size);

console.log("tsTransparencyMinusSwtrs: ", tsTransparencyMinusSwtrs.size);




//const mergedTransparencyJson = mergedSWITRSJson;

const popupFields = ['Date',
	'Time',
	//'Day_of_Week',
	'Case_Number',
	'Case_ID',
	'Local_Report_Number',
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
	'Suspected_Serious_Injury',
	'Injury_Severity'

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

function checkFilter(attr, tsSet, vehTypeRegExp,
	filter2024, filter2023,
	filter2022, filter2021, filter2020,
	filter2019,
	filter2018,
	filter2017,
	filter2016,
	filter2015,

	selectStreet, severity
) {
	if (!tsSet.has(attr.DateTime)) {
		return false;
	}
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
			const re = new RegExp(selectStreet, 'i');

			if (!loc.match(re)) {
				return false;
			}
		} else {
			const m = loc.toUpperCase().includes(selectStreet.toUpperCase());
			if (!m) {
				return false;
			}
		}

	}
	var acceptableSeverities = [];
	acceptableSeverities.push('Fatal');

	if (severity == 'Fatal') {
		if (acceptableSeverities.indexOf(attr.Injury_Severity) == -1) {
			return false;
		}
	}
	acceptableSeverities.push('Serious Injury');

	if (severity == 'Serious Injury') {
		if (acceptableSeverities.indexOf(attr.Injury_Severity) == -1) {
			return false;
		}
	}

	acceptableSeverities.push('Minor Injury');

	if (severity == 'Minor Injury') {
		if (acceptableSeverities.indexOf(attr.Injury_Severity) == -1) {
			return false;
		}
	}

	acceptableSeverities.push('Possible Injury');

	if (severity == 'Possible Injury') {
		if (acceptableSeverities.indexOf(attr.Injury_Severity) == -1) {
			return false;
		}
	}


	if (severity == 'No Injury') {
		if ((attr.Number_of_Injuries != 0) || (attr.Number_of_Fatalities != 0)) {
			return false;
		}
	}
	return true;
}

const LatitudeDefault = 37.868412;
const LongitudeDefault = -122.349938;

function addMarkers(collisionJson, tsSet, histData, histFaultData,
	vehTypeRegExp,
	filter2024, filter2023, filter2022, filter2021, filter2020,
	filter2019, filter2018, filter2017, filter2016, filter2015,
	selectStreet, selectSeverity

) {
	removeAllMakers();
	const markersAtLocation = new Map();
	// add collisions to map
	var markerCount = 0
	var skipped = 0, plotted = 0;

	var arrMappedCollisions = [];

	for (const coll of collisionJson) {
		const attr = coll.attributes;
		const checked = checkFilter(attr, tsSet, vehTypeRegExp,
			filter2024, filter2023, filter2022, filter2021, filter2020,
			filter2019, filter2018, filter2017, filter2016, filter2015,
			selectStreet, selectSeverity);
		if (!checked) {
			continue;
		}
		plotted++;
		arrMappedCollisions.push(attr); // add to array for export function

		histData.set(attr.Year, histData.get(attr.Year) + 1);
		histFaultData.set(attr.Party_at_Fault, histFaultData.get(attr.Party_at_Fault) + 1);
		histSeverityData.set(attr.Injury_Severity, histSeverityData.get(attr.Injury_Severity) + 1);

		for (const v of arrObjectKeys) {
			if (attr.Involved_Objects.includes(v)) {

				histObjectData.set(v, histObjectData.get(v) + 1);
			}
		}



		if (!(attr.Latitude && attr.Longitude)) {
			// try to get it from the map
			const matchingLocalReport = mapLocalCaseIDToAttr.get(attr.Local_Report_Number);
			if (matchingLocalReport) {
				attr.Latitude = matchingLocalReport.Latitude;
				attr.Longitude = matchingLocalReport.Longitude;
				//console.log("Fixed GPS for ", attr.Local_Report_Number);
			} else {
				console.log("Failed to fix GPS for ", attr.Local_Report_Number);
			}
		}

		if (attr.Latitude && attr.Longitude) {
			const loc = [attr.Latitude, attr.Longitude];
			//	const roundLoc = loc.map((c) => c.toFixed(3));
			const ct = markersAtLocation.get(JSON.stringify(loc)) ?? 0;

			if (ct > 0) {
				console.log("adjusting marker")
			}

			var myMarker = getIconForSeverity(attr.Injury_Severity);
			/*
			if (attr.Number_of_Fatalities > 0) {
				myMarker = redIcon;
			} else if (attr.Number_of_Injuries > 0) {
				myMarker = goldIcon
			} else {
				myMarker = greenIcon;
			}*/
			const marker = L.marker([attr.Latitude + ct * 0.0001, attr.Longitude - ct * 0.0001],
				{ icon: myMarker });
			markersAtLocation.set(JSON.stringify(loc), ct + 1);
			const msg = collisionPopup(attr);
			marker.bindPopup(msg).openPopup();
			marker.addTo(map);
			markers.push(marker);
			markerCount++;
		} else {
			histMissingGPSData.set(attr.Year, histMissingGPSData.get(attr.Year) + 1);
			skipped++;
		}
	}
	console.log('Skipped', skipped);
	console.log('Plotted', plotted);
	console.log("markerCount ", markerCount)

	const summaryMsg = '<br>Matching collsions: ' + plotted;//+ '<br>' + 'Skipped: ' + skipped + '<br>';
	summary.innerHTML = summaryMsg;

	// set array for download
	const json = JSON.stringify(arrMappedCollisions, null, 2);
	const inputblob = new Blob([json], {
		type: "application/json",
	});
	const u = URL.createObjectURL(inputblob);
	saveanchor.href = u;

}

// chart data variables
const histYearData = new Map();
const histMissingGPSData = new Map();
var histFaultData = new Map();

var histSeverityData = new Map();
var histObjectData = new Map();

const arrSeverityKeys = [
	"Unspecified Injury",
	"No Injury",

	"Possible Injury",
	"Minor Injury",

	"Serious Injury",
	"Fatal"


];

const arrObjectKeys = [
	"Car", "Motorcycle", "Bicycle", "Pedestrian", "Truck", "Bus", "Parked Car", "Object", "Electric Bike", "Electric Scooter", "Electric Skateboard"
];

function clearHistData(keys, data) {
	for (const f of keys) {
		data.set(f, 0);
	}
}

clearHistData(arrObjectKeys, histObjectData);
clearHistData(arrSeverityKeys, histSeverityData);


// clear data functions
function clearHistYearData() {
	for (var y = 2015; y < 2025; y++) {
		histYearData.set(y, 0);
		histMissingGPSData.set(y, 0);
	}
}
clearHistYearData();

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

// chart variables
var histChart;
var histChartGPS;
var histFaultChart;

var histObjectChart;
var histSeverityChart;


function createOrUpdateChart(data, chartVar, element, labelText) {
	// data should be an array of objects with members bar and count
	if (chartVar == undefined) {
		chartVar = new Chart(element
			,
			{
				type: 'bar',
				data: {
					labels: data.map(row => row.bar),
					datasets: [
						{
							label: labelText,
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
			label: labelText,
			data: data.map(row => row.count)
		}

		chartVar.data.datasets.pop();
		chartVar.data.datasets.push(newData);
		//	console.log(newData);
		chartVar.update();
	}
	return chartVar;
}


function handleFilterClick() {
	clearHistYearData();
	clearFaultData();
	clearHistData(arrObjectKeys, histObjectData);
	clearHistData(arrSeverityKeys, histSeverityData);



	const dataSpec = selectData.value;
	var tsSet;
	var collData;

	switch (selectData.value) {
		case 'T':
			collData = mergedTransparencyJson;
			tsSet = tsTransparency;
			break;
		case 'S':
			collData = mergedSWITRSJson;
			tsSet = tsSwtrs;
			break;
		case "SUT":
			collData = mergedUnion; // TODO UNION
			tsSet = tsSwtrsUnionTransparency;
			break;
		case 'SNT':
			collData = mergedSWITRSJson;
			tsSet = tsSwrtsIntersectionTransparency;
			break;
		case 'TMS': //>BPD minus State</option>
			collData = mergedTransparencyJson;
			tsSet = tsTransparencyMinusSwtrs;
			break;

		case 'SMT':
			collData = mergedSWITRSJson;
			tsSet = tsSwtrsMinusTransparency;
			break;
		default:
			console.log("Unepxected data spec")

	}
	addMarkers(collData, tsSet, histYearData, histFaultData,

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






	const dataFault = [];
	for (const k of faultKeys) {
		dataFault.push({ bar: k, count: histFaultData.get(k) })
	}

	const dataObject = [];
	for (const k of arrObjectKeys) {
		dataObject.push({ bar: k, count: histObjectData.get(k) })
	}

	const dataSeverity = [];
	for (const k of arrSeverityKeys) {
		dataSeverity.push({ bar: k, count: histSeverityData.get(k) })
	}

	histFaultChart = createOrUpdateChart(dataFault, histFaultChart, document.getElementById('crashFaultHist'), 'Collisions by Fault');

	histObjectChart = createOrUpdateChart(dataObject, histObjectChart, document.getElementById('objectHist'), 'Crash Particpants');

	histSeverityChart = createOrUpdateChart(dataSeverity, histSeverityChart, document.getElementById('severityHist'), 'Injury Severity');

	/*
		console.dir(histData);
	
		const dataByYear = [
			{ bar: 2015, count: histData.get(2015) },
			{ bar: 2016, count: histData.get(2016) },
			{ bar: 2017, count: histData.get(2017) },
			{ bar: 2018, count: histData.get(2018) },
			{ bar: 2019, count: histData.get(2019) },
			{ bar: 2020, count: histData.get(2020) },
			{ bar: 2021, count: histData.get(2021) },
			{ bar: 2022, count: histData.get(2022) },
			{ bar: 2023, count: histData.get(2023) },
			{ bar: 2024, count: histData.get(2024) },
	
		];*/
	const dataByYear = [];
	for (var bar = 2015; bar <= 2024; bar++) {
		dataByYear.push({ bar: bar, count: histYearData.get(bar) });
	}


	histChart = createOrUpdateChart(dataByYear, histChart, document.getElementById('crashHist'), 'Collisions by Year');

	const dataGPSByYear = [];
	for (var bar = 2015; bar <= 2024; bar++) {
		dataGPSByYear.push({ bar: bar, count: histMissingGPSData.get(bar) });
	}

	histChartGPS = createOrUpdateChart(dataGPSByYear, histChartGPS, document.getElementById('gpsHist'), 'Missing GPS by Year');

}

function handleExportClick() {
	handleFilterClick();
}

saveanchor.addEventListener(
	"click", handleExportClick
	// (event) => (event.target.href = canvas.toDataURL()),
);


/* unused stuff

const json = JSON.stringify(3.1415, null, 2);
const inputblob = new Blob([json], {
	type: "application/json",
});


const u = URL.createObjectURL(inputblob);

saveanchor.href = u;

async function saveFile1() {
	// create a new handle
	const newHandle = await window.showSaveFilePicker();

	// create a FileSystemWritableFileStream to write to
	const writableStream = await newHandle.createWritable();

	// write our file
	await writableStream.write(inputblob);

	// close the file and write the contents to disk.
	await writableStream.close();
}



async function saveFile() {



	//const inputblob = { hello: "world" };
	const json = JSON.stringify(3.1415, null, 2);
	const inputblob = new Blob([json], {
		type: "application/json",
	});





	const downloadelem = document.createElement("a");
	const url = URL.createObjectURL(inputblob);
	document.body.appendChild(downloadelem);
	downloadelem.src = url;
	downloadelem.click();
	downloadelem.remove();
	window.URL.revokeObjectURL(url);
}
//downloadBlob(yourblob);


async function handleExportClick() {
	await saveFile();

}



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
	
	
/*
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
								label: 'Collisions by Year',
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
				label: 'Collisions by Year',
				data: data.map(row => row.count)
			}
	
			histChart.data.datasets.pop();
			histChart.data.datasets.push(newData);
			console.log(newData);
			histChart.update();
		}
	})();
	
*/




export {
	/*collisionsJson, transparencyJson, */ mergedTransparencyJson, greenIcon, goldIcon, redIcon,
	populateStreetSelect, collisionPopup,
	map, handleFilterClick
};