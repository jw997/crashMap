import { getJson, streetArray } from "./utils_helper.js";

import { findClosest } from "./gpsaddr.js";

// touch or mouse?
let mql = window.matchMedia("(pointer: fine)");
const pointerFine = mql.matches;

// set default chart font color to black
Chart.defaults.color = '#000';
Chart.defaults.font.size = 14;

const selectData = document.querySelector('#selectData');

const selectVehicleTypes = document.querySelector('#selectVehicleTypes');

// ADD NEW YEAR

const check2025 = document.querySelector('#check2025');
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
const selectStopResult = document.querySelector('#stopResult');

const summary = document.querySelector('#summary');

const saveanchor = document.getElementById('saveanchor')

const mapLocalCaseIDToAttr = new Map();

// populate the street select options from the hard code street names in utils_helper
function populateStreetSelect(mergedTransparencyJson, selectStreet) {
	//const setStreets = new Set();

	for (const coll of mergedTransparencyJson) {
		const attr = coll.attributes;

		/* save gps info for missing state records */
		if (attr.Longitude && attr.Latitude) {
			mapLocalCaseIDToAttr.set(attr.Case_Number, attr);
		}
		/*
		const loc = attr.Accident_Location;

		if (loc.includes('&')) {
			console.log('break here')
		}
		const arr = loc.split("/").map((s) => s.trim());

		for (const str of arr) {
			const e = str.trim();
			//	console.log("#", e, '#');
			if (!setStreets.has(e)) {
				setStreets.add(e);
			}
		}*/
	}

	// sort
	//	const arrSorted = Array.from(setStreets).sort();

	//	console.log(setStreets.size, arrSorted.length);
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
		opt.text = str.split("|")[0];  // name is first synonym from streetArray
		selectStreet.add(opt, null);
	}
}

function getIcon(name) {
	const icon = new L.Icon({
		//	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/' + name,
		iconUrl: './images/' + name,
		//	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		shadowUrl: './images/marker-shadow.png',
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],
		shadowSize: [41, 41]
	});
	return icon;

}

const greenIcon = getIcon('marker-highway-green.png');
const redIcon = getIcon('marker-highway-red.png');
const orangeIcon = getIcon('marker-highway-orange.png');
const yellowIcon = getIcon('marker-highway-yellow.png');
const goldIcon = getIcon('marker-highway-brown.png');
const blueIcon = getIcon('marker-highway-blue.png');
const violetIcon = getIcon('marker-icon-violet.png');



const w3_highway_brown = '#633517';
const w3_highway_red = '#a6001a';
const w3_highway_orange = '#e06000';
const w3_highway_schoolbus = '#ee9600';
const w3_highway_yellow = '#ffab00';
const w3_highway_green = '#004d33';
const w3_highway_blue = '#00477e';

const violet = "#9400d3";//"#EE82EE";

const black = "#000000";

const grey = "#101010";

const stopNoAction = "No Action"
const stopCitation = "Citation"
const stopWarning = "Warning"
const stopArrest = "Arrest"
const stopUnkown = "unknown"

function getStopResultCategory(result) {
	switch (result) {
		case 1: // no action
			return stopNoAction;
			break;
		case 5: // arrest
		case 6:
			return stopArrest;
			break;
		case 2:
		case 14:
		case 15:
			return stopWarning;
			break;
		case 3: // citation
			return stopCitation;
			break;
		default:
			return stopUnkown;
			break;
	}
	return stopUnkown;
}

function getOptionsForStop(result) {
	var colorValue;
	var rad = 8;
	var opa = 0.5;

	switch (result) {
		case 1: // no action
			colorValue = w3_highway_green;
			break;
		case 5: // arrest
		case 6:
			colorValue = w3_highway_red;
			break;
		case 2: // warning
		case 14:
		case 15:
			colorValue = w3_highway_schoolbus;
			opa = 0.6;
			//colorValue = grey;
			break;
		case 3: // citation
			colorValue = w3_highway_blue;
			//colorValue = black;
			rad = 8;
			opa = 1;
			break;


		default:
			console.error("Unexpected Stop result", result);
			colorValue = violet;
			break;
	}
	const retval = {
		color: colorValue,
		radius: rad,
		fill: true,
		fillOpacity: opa,
		stroke: false // no border line
	};
	return retval;


}


function getOptionsForSeverity(sev) {
	var colorValue;
	var rad = 6;
	var opa = 0.5;

	switch (sev) {
		case 'Fatal':
			colorValue = w3_highway_red;
			rad = 10;
			opa = 1;
			break;
		case "Serious Injury":
			colorValue = w3_highway_orange;
			rad = 8;
			opa = 1;
			break;
		case "Minor Injury":
			colorValue = w3_highway_brown;
			opa = 1;
			break;
		case "Possible Injury":
			colorValue = w3_highway_yellow;
			break;
		case "No Injury":
			colorValue = w3_highway_blue;
			break;
		case "Unspecified Injury":
			colorValue = violet;
			break;
		default:
			console.error("Unexpected Injury severity ", sev);
	}
	if (!pointerFine) {
		rad *= 1.5;
	}
	const retval = {
		color: colorValue,
		radius: rad,
		fill: true,
		fillOpacity: opa
	};
	return retval;

}



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

function getIconForStop(Result_of_Stop) {
	var icon;
	switch (Result_of_Stop) {
		case 3:
			icon = redIcon; // warning
			break;
		case 2:
			icon = orangeIcon;  // warning
			break;

		default:
			icon = violetIcon; // field interview / other??
			console.error("Unexpected stop results ", Result_of_Stop);
	}
	return icon;
}

async function getCityBoundary() {
	const file = './data/cityboundary/Land_Boundary.geojson';
	const cityGeoJson = await getJson(file);
	return cityGeoJson;
}

const cityGeoJson = await getCityBoundary();

async function getTransparencyData() {
	var arrays = [];
	for (var y = 2015; y <= 2025; y++) {
		const file = './data/' + y + '.json';
		const transparencyJson = await getJson(file);
		arrays.push(transparencyJson.features);
	}
	const retval = [].concat(...arrays)
	return retval;

}

const mergedTransparencyJson = await (getTransparencyData());

async function getCCRSData() {
	var arrays = [];
	// ADD NEW YEAR
	for (var y = 2016; y <= 2025; y++) {
		const file = './data/ccrs/ccrs' + y + '.json';

		//const fileNames = ['ccrs/ccrs2025.json'];
		//for (const fName of fileNames) {
		//	const file = './data/' + fName;
		const ccrsJson = await getJson(file);
		arrays.push(ccrsJson.features);

	}
	const retval = [].concat(...arrays)
	return retval;
}

const mergedCCRSJson = await (getCCRSData());

async function getSWITRSData() {
	var arrays = [];
	// ADD NEW YEAR
	const fileNames = ['switrs2015-2019.json', 'switrs2020-2024.json'];
	for (const fName of fileNames) {
		const file = './data/' + fName;
		const swtrsJson = await getJson(file);
		arrays.push(swtrsJson.features);

	}
	const retval = [].concat(...arrays)
	return retval;
}

const mergedSWITRSJson = await (getSWITRSData());

// read fatal crash override data
async function getOverrideData() {
	var arrays = [];

	const fileNames = ['fatal.json'];
	for (const fName of fileNames) {
		const file = './data/override/' + fName;
		const overrideJson = await getJson(file);
		arrays.push(overrideJson.features);

	}
	const retval = [].concat(...arrays)
	return retval;
}

const overrideJson = await getOverrideData();



async function getStopData() {
	var arrays = [];
	for (var y = 2020; y <= 2025; y++) {
		const file = './data/stop/ts_' + y + '.json';
		const stopJson = await getJson(file);
		arrays.push(stopJson.features);
	}
	const retval = [].concat(...arrays)
	return retval;

}

const mergedStopJson = await (getStopData());

// fix up stop json by adding a few computed fields
//"DateTime_FME": "20201009232500-07:00",
//"Date": "2024-09-30",
//"Time": "09:35:00",
//"Year": 2024
function fixStops() {
	for (const s of mergedStopJson) {
		const attr = s.attributes;

		const fme = attr.DateTime_FME;
		if ((!fme) || (fme.length < 12)) {
			console.log("undefined DateTime_FME");
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

fixStops();

function addStopLocations() {
	for (const s of mergedStopJson) {
		const attr = s.attributes;
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

addStopLocations();




function makeTimeStamp(c) {
	const d = coll.attributes.Date;
	const t = coll.attributes.Time;

	if (!d || !t) {
		console.log("collision with missing date time ", coll);
		return undefined;
	} else {
		const str = d + ' ' + t;
		const ts = Date.parse(str);
		return ts;
	}

}

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

function makeTimeStampMap(arr) {
	var setTimeStamps = new Map();
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
				setTimeStamps.set(ts, coll);
				if (!coll.attributes.DateTime) {
					coll.attributes.DateTime = ts;
				}
			}
		}
	}
	return setTimeStamps;
}

// make set of swtrs collision time stamps
const tsCcrs = makeTimeStampSet(mergedCCRSJson);
const tsSwtrs = makeTimeStampSet(mergedSWITRSJson);
const tsTransparency = makeTimeStampSet(mergedTransparencyJson);

const tsStops = makeTimeStampSet(mergedStopJson);

// make maps of ts to coll
const tsMapCcrs = makeTimeStampMap(mergedCCRSJson);
const tsMapSwtrs = makeTimeStampMap(mergedSWITRSJson);
const tsMapTransparency = makeTimeStampMap(mergedTransparencyJson);

// make sets of local collision ids
function makeLocalCollisionIdMap(arr) {
	// for arr of SWITRS reports "Local_Report_Number": "2022-00060191",
	// for arr of CCRS reports   "Local_Report_Number": "9370-2025-00208",
	// for arr of BPD reports "Case_Number": "2022-00060191",
	const retval = new Map();
	for (const c of arr) {
		const a = c.attributes;
		if (a.Local_Report_Number) {
			retval.set(a.Local_Report_Number, c);
		} else if (a.Case_Number) {
			retval.set(a.Case_Number, c);
		}
	}
	return retval;
}

const lidMapCcrs = makeLocalCollisionIdMap(mergedCCRSJson);
const lidMapSwitrs = makeLocalCollisionIdMap(mergedSWITRSJson);
const lidMapTransparency = makeLocalCollisionIdMap(mergedTransparencyJson);

// apply overrides by local id
// these correct severity for fatal crashes, and add news urls
function applyOverrides(overrides) {
	for (const o of overrides) {
		const oa = o.attributes;
		const t = lidMapTransparency.get(oa.Case_Number);
		if (t) {
			const attr = t.attributes;
			attr.Injury_Severity = oa.Injury_Severity;
			attr.url = oa.url;
		} else {
			console.log("override not matched ", oa.Case_Number)
		}

		const s = lidMapSwitrs.get(oa.Case_Number);
		if (s) {
			const attr = s.attributes;
			attr.Injury_Severity = oa.Injury_Severity;
			attr.url = oa.url;
		}
	}
}

applyOverrides(overrideJson);

const lidSwitrs = new Set(lidMapSwitrs.keys());
const lidCcrs = new Set(lidMapCcrs.keys());

const tsCcrsUnionTransparency = tsCcrs.union(tsTransparency);
const tsSwtrsUnionTransparency = tsSwtrs.union(tsTransparency);
/*
const tsSwrtsIntersectionTransparency = tsSwtrs.intersection(tsTransparency);
const tsSwtrsMinusTransparency = tsSwtrs.difference(tsTransparency);
const tsTransparencyMinusSwtrs = tsTransparency.difference(tsSwtrs);
*/
// for union, start with switrs and ccrs
var mergedUnionSwitrs = mergedSWITRSJson.slice();
var mergedUnionCcrs = mergedCCRSJson.slice();

// add any bpd records that differ in both timestamp and local case id
for (const e of mergedTransparencyJson) {
	const ts = e.attributes.DateTime;
	const lid = e.attributes.Case_Number;

	// 
	if (!tsCcrs.has(ts)) {
		if (!lidCcrs.has(lid)) {
			mergedUnionCcrs.push(e);
		}
	}

	if (!tsSwtrs.has(ts)) {
		if (!lidSwitrs.has(lid)) {
			mergedUnionSwitrs.push(e);
		}
	}
}

// each bpd report has a "Case_Number": "2022-00019693", and a date time
// each switrs report has a "Local_Report_Number": "2022-00019693", and a date and time
function getSwitrsReportForLocalReport(localColl) {
	const ts = localColl.attributes.DateTime;
	const lid = localColl.attributes.Case_Number;

	// first lookup by case number
	const r1 = lidMapSwitrs.get(lid);
	if (r1) {
		return r1;
	}
	// then try by date time
	const r2 = tsMapSwtrs.get(ts);
	if (r2) {
		return r2;
	}
	return undefined;
}
for (const localColl of mergedTransparencyJson) {
	localColl.switrsRecord = getSwitrsReportForLocalReport(localColl);
}

// each bpd report has a "Case_Number": "2022-00019693", and a date time
// each switrs report has a "Local_Report_Number": "2022-00019693", and a date and time
function getLocalReportForSwitrsReport(switrsColl) {
	const ts = switrsColl.attributes.DateTime;
	const lid = switrsColl.attributes.Local_Report_Number;

	// first lookup by case number
	const r1 = lidMapTransparency.get(lid);
	if (r1) {
		return r1;
	}
	// then try by date time
	const r2 = tsMapTransparency.get(ts);
	if (r2) {
		return r2;
	}
	return undefined;
}

function getLocalReportForCCRSReport(ccrsColl) {

	const lid = ccrsColl.attributes.Local_Report_Number;

	// first lookup by case number
	const r1 = lidMapTransparency.get(lid);
	if (r1) {
		return r1;
	}
	/*
	// then try by date time
	const r2 = tsMapTransparency.get(ts);
	if (r2) {
		return r2;
	}
	return undefined;*/
}

/* This Link is used to 
1) attempt to find a replacement value for missing gps coordinates in SWITRS by use the BPD Transparency report values
2) add the BPD collision info in the popup to the SWITRS info for comparision
*/
for (const switrsColl of mergedSWITRSJson) {
	switrsColl.localRecord = getLocalReportForSwitrsReport(switrsColl);
}

for (const ccrsColl of mergedCCRSJson) {
	ccrsColl.localRecord = getLocalReportForCCRSReport(ccrsColl)
}
/*
console.log(" mergedUnion: ", mergedUnion.length);

console.log("Swtrs time stamps: ", tsSwtrs.size);
console.log("Transparency time stamps: ", tsTransparency.size);

console.log("tsSwtrsUnionTransparency: ", tsSwtrsUnionTransparency.size);
console.log("tsSwrtsIntersectionTransparency :", tsSwrtsIntersectionTransparency.size);

console.log("tsSwtrsMinusTransparency: ", tsSwtrsMinusTransparency.size);

console.log("tsTransparencyMinusSwtrs: ", tsTransparencyMinusSwtrs.size);
*/



//const mergedTransparencyJson = mergedSWITRSJson;

const popupFields = ['Date',
	'Time',// 'Hour',
	//'Day_of_Week',
	'Case_Number',
	'Case_ID',
	'Local_Report_Number',
	'Accident_Location',
	'Accident_Location_Offset',
	'Latitude',
	'Longitude',
	//'Collision_Classification_Descri',
	//'Collision_Type',
	'Primary_Collision_Factor_Code',
	'PCF_Description',
	//	'PCF_Category',
	'Involved_Objects',
	//'Involved_Parties',
	'Party_at_Fault',
	'Number_of_Injuries',
	'Number_of_Fatalities',
	//'Suspected_Serious_Injury',
	'Injury_Severity',
	"Injury_Ages",
	"url",
	"Traffic_Violation_Offense_Code_",
	"Type_Of_Stop", "bGeoPointAddress", "bGeneralLocationDesc",
	"ReasonForStopNarrative",
	"Result_of_Stop_text",
	"Stop_Location"


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
	map = L.map(element, {
		preferCanvas: true
	});
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


/*
const greenIcon = getIcon('marker-highway-green.png');
const redIcon = getIcon('marker-highway-red.png');
const orangeIcon = getIcon('marker-highway-orange.png');
const yellowIcon = getIcon('marker-highway-yellow.png');
const goldIcon = getIcon('marker-highway-brown.png');
const blueIcon = getIcon('marker-highway-blue.png');
const violetIcon = getIcon('marker-icon-violet.png');

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

*/

/*
{
				label: "Circle",
				type: "circle",
				radius: 6,
				color: "blue",
				fillColor: "#FF0000",
				fillOpacity: 0.6,
				weight: 2,
				layers: [marker],
				inactive: true,
			}


			const greenIcon = getIcon('marker-highway-green.png');
const redIcon = getIcon('marker-highway-red.png');
const orangeIcon = getIcon('marker-highway-orange.png');
const yellowIcon = getIcon('marker-highway-yellow.png');
const goldIcon = getIcon('marker-highway-brown.png');
const blueIcon = getIcon('marker-highway-blue.png');
const violetIcon = getIcon('marker-icon-violet.png');



const w3_highway_brown = '#633517';
const w3_highway_red = '#a6001a';
const w3_highway_orange = '#e06000';
const w3_highway_schoolbus = '#ee9600';
const w3_highway_yellow = '#ffab00';
const w3_highway_green = '#004d33';
const w3_highway_blue = '#00477e';

const violet = "#9400d3";//"#EE82EE";

const black = "#000000";

const grey = "#101010";


*/
function createLegend() {
	const legend = L.control.Legend({
		position: "bottomleft",
		title: 'Injury',
		collapsed: false,
		symbolWidth: 24,
		opacity: 0.8,
		column: 1,

		legends: [{
			label: "Fatal",
			type: "circle",
			color: w3_highway_red,
			fillColor: w3_highway_red

			//url: "./images/marker-highway-red.png",
		}, {
			label: "Serious",
			type: "circle",

			color: w3_highway_orange,
			fillColor: w3_highway_orange
			//url: "./images/marker-highway-orange.png",
		}, {
			label: "Minor",
			type: "circle",
			color: w3_highway_brown,
			fillColor: w3_highway_brown
			//url: "./images/marker-highway-brown.png"
		}, {
			label: "Possible",
			type: "circle",
			color: w3_highway_yellow,
			fillColor: w3_highway_yellow

			//url: "./images/marker-highway-yellow.png",
		}, {
			label: "No Injury",
			type: "circle",
			color: w3_highway_blue,
			fillColor: w3_highway_blue
			//url: "./images/marker-highway-blue.png"
		}, {
			label: "Unspecified",
			type: "circle",
			color: violet,
			fillColor: violet
			//url: "./images/marker-icon-violet.png",

		}, {
			label: "Stop: Arrest",
			type: "circle",
			color: w3_highway_red,
			fillColor: w3_highway_red,
			fillOpacity: 1
			//url: "./images/marker-icon-violet.png",

		},
		{
			label: "Stop: Citation",
			type: "circle",
			color: w3_highway_blue,
			fillColor: w3_highway_blue,
			fillOpacity: 1
			//url: "./images/marker-icon-violet.png",

		}, {
			label: "Stop: Warning",
			type: "circle",
			color: w3_highway_schoolbus,
			fillColor: w3_highway_schoolbus,
			fillOpacity: 0.5
			//url: "./images/marker-icon-violet.png",

		}, {
			label: "Stop: No Action",
			type: "circle",
			color: w3_highway_green,
			fillColor: w3_highway_green,
			fillOpacity: 0.5
			//url: "./images/marker-icon-violet.png",
		}
		]



		/*
		legends: [{
			label: "Fatal",
			type: "image",
			url: "./images/marker-highway-red.png",
		}, {
			label: "Serious",
			type: "image",
			url: "./images/marker-highway-orange.png",
		}, {
			label: "Minor",
			type: "image",
			url: "./images/marker-highway-brown.png"
		}, {
			label: "Possible",
			type: "image",
			url: "./images/marker-highway-yellow.png",
		}, {
			label: "No Injury",
			type: "image",
			url: "./images/marker-highway-blue.png"
		}, {
			label: "Unspecified",
			type: "image",
			url: "./images/marker-icon-violet.png",

		}]*/
	})
		.addTo(map);
}

createMap();

if (pointerFine) { // skip the legend for the mobile case.  maybe make a smaller legend?
	createLegend();
}

// add city boundary to map
L.geoJSON(cityGeoJson, { fillOpacity: 0.05 }).addTo(map);

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

function checkFilter(coll, tsSet, vehTypeRegExp,
	filter2025,
	filter2024, filter2023,
	filter2022, filter2021, filter2020,
	filter2019,
	filter2018,
	filter2017,
	filter2016,
	filter2015,

	selectStreet, severity, selectStopResult
) {

	// for traffic stops, just return true
	//if (coll.attributes.Stop_GlobalID) {
	//	return true;
	//}
	const attr = coll.attributes;

	if (!tsSet.has(attr.DateTime)) {
		return false;
	}

	const year = attr.Year;
	if ((year == 2025) && !filter2025) {
		return false;

	}
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
	if ((year < 2015) || (year > 2025)) {
		return false;
	}

	if (coll.attributes.Stop_GlobalID) {
		const loc = attr.Stop_Location;

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
		if (selectStopResult != "Any") {

			const res = getStopResultCategory(attr.Result_of_Stop);
			if (res != selectStopResult) {
				return false;
			}
		}

		/*
			if (coll.attributes.Result_of_Stop != 3) {

			return false;
		}

				const hour = parseInt(coll.attributes.Time);
				//if (hour >= 6 &&  hour <= 10) {
				if ((hour <= 5) || (hour >= 21 && hour <= 23)) {
					return true;
				}*/

		return true;
	}

	const involved = attr.Involved_Objects;
	const m = involved.match(vehTypeRegExp);

	if (!m) {
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
	// if coll has unspecifed severity, but switrs gives a severity use that instead
	var coll_severity = attr.Injury_Severity;

	if (coll_severity == 'Unspecified Injury') {
		if (coll.switrsRecord) {
			coll_severity = coll.switrsRecord.attributes.Injury_Severity
		}
	}

	acceptableSeverities.push('Fatal');

	if (severity == 'Fatal') {
		if (acceptableSeverities.indexOf(coll_severity) == -1) {
			return false;
		}
	}
	acceptableSeverities.push('Serious Injury');

	if (severity == 'Serious Injury') {
		if (acceptableSeverities.indexOf(coll_severity) == -1) {
			return false;
		}
	}

	acceptableSeverities.push('Minor Injury');

	if (severity == 'Minor Injury') {
		if (acceptableSeverities.indexOf(coll_severity) == -1) {
			return false;
		}
	}

	acceptableSeverities.push('Possible Injury');

	if (severity == 'Possible Injury') {
		if (acceptableSeverities.indexOf(coll_severity) == -1) {
			return false;
		}
	}

	if (severity == 'No Injury') {
		if (coll_severity != 'No Injury') {
			return false;
		}
		/*if ((attr.Number_of_Injuries != 0) || (attr.Number_of_Fatalities != 0)) {
			return false;
		}*/
	}
	return true;
}

const LatitudeDefault = 37.868412;
const LongitudeDefault = -122.349938;

function isStopAttr(a) {
	if (a.Stop_GlobalID) {
		return true;
	}
	return false;

}
function incrementMapKey(m, k) {
	m.set(k, m.get(k) + 1);
}
function addMarkers(collisionJson, tsSet, histYearData, histHourData, histFaultData, histAgeInjuryData,
	vehTypeRegExp,
	// ADD NEW YEAR
	filter2025,
	filter2024, filter2023, filter2022, filter2021, filter2020,
	filter2019, filter2018, filter2017, filter2016, filter2015,
	selectStreet, selectSeverity, selectStopResult

) {
	removeAllMakers();
	const markersAtLocation = new Map();
	// add collisions to map
	var markerCount = 0
	var skipped = 0, plotted = 0;

	var arrMappedCollisions = [];

	for (const coll of collisionJson) {
		const attr = coll.attributes;
		const checked = checkFilter(coll, tsSet, vehTypeRegExp,
			// ADD NEW YEAR
			filter2025,
			filter2024, filter2023, filter2022, filter2021, filter2020,
			filter2019, filter2018, filter2017, filter2016, filter2015,
			selectStreet, selectSeverity, selectStopResult);
		if (!checked) {
			continue;
		}
		plotted++;
		arrMappedCollisions.push(attr); // add to array for export function

		// ADD NEW CHART
		//histData.set(attr.Year, histData.get(attr.Year) + 1);
		incrementMapKey(histYearData, attr.Year);

		if (!attr.Month) {
			//console.log("Undefined hour " , attr.Case_Number);
			// try to set it from time
			attr.Month = parseInt(attr.Date.substr(5, 2));
		}
		incrementMapKey(histMonthData, attr.Month);

		if (!attr.Hour) {
			//console.log("Undefined hour " , attr.Case_Number);
			// try to set it from time
			attr.Hour = parseInt(attr.Time.substr(0, 2));
		}
		const hour = 3 * Math.floor(attr.Hour / 3);
		//console.log ( "Hour is " , attr.Hour, ' ' , attr.Case_Number);
		incrementMapKey(histHourData, hour);

		if (isStopAttr(attr)) {
			incrementMapKey(histStopResultData, getStopResultCategory(attr.Result_of_Stop));
		}

		if (!isStopAttr(attr)) {
			//histFaultData.set(attr.Party_at_Fault, histFaultData.get(attr.Party_at_Fault) + 1);
			incrementMapKey(histFaultData, attr.Party_at_Fault);
			//histSeverityData.set(attr.Injury_Severity, histSeverityData.get(attr.Injury_Severity) + 1);
			incrementMapKey(histSeverityData, attr.Injury_Severity);
			for (const v of arrObjectKeys) {
				if (attr.Involved_Objects.includes(v)) {

					histObjectData.set(v, histObjectData.get(v) + 1);
				}
			}

			//histAgeInjuryData
			const ageStr = attr.Injury_Ages;
			if (ageStr) {
				// split 
				const ages = ageStr.split("/");
				for (const a of ages) {
					const k = 10 * Math.floor(a / 10);
					incrementMapKey(histAgeInjuryData, k);
				}
			}
		}
		/*
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
				}*/
		// if lat  or long is missing, try the linked coll record
		var lat = attr.Latitude;
		if (!lat) {
			if (coll.localRecord) {
				lat = coll.localRecord.attributes.Latitude;

			}
		}
		if (!lat) {
			if (coll.switrsRecord) {
				lat = coll.switrsRecord.attributes.Latitude;
			}
		}
		//const long = attr.Latitude ?? coll.switrsColl.Latitude ?? coll.localColl.Latitude;
		var long = attr.Longitude;
		if (!long) {
			if (coll.localRecord) {
				long = coll.localRecord.attributes.Longitude;
			}

		}
		if (!long) {
			if (coll.switrsRecord) {
				long = coll.switrsRecord.attributes.Longitude;
			}
		}

		if (lat && long) {
			const loc = [lat, long];
			//	const roundLoc = loc.map((c) => c.toFixed(3));
			const ct = markersAtLocation.get(JSON.stringify(loc)) ?? 0;

			if (ct > 0) {
				console.log("adjusting marker")
			}

			var marker;

			if (!isStopAttr(attr)) {
				//var myMarker = getIconForSeverity(attr.Injury_Severity);
				//marker = L.marker([lat + ct * 0.0001, long - ct * 0.0001],
				//		{ icon: myMarker });

				const opt = getOptionsForSeverity(attr.Injury_Severity);



				marker = L.circleMarker([lat + ct * 0.0001, long - ct * 0.0001], opt
					/*	{
						color: '#3388ff',
						radius: 5,
						fill: true,
						fillOpacity: 1
					}
					*/
				);

			} else {
				//myMarker = getIconForStop(attr.Result_of_Stop);
				const opt = getOptionsForStop(attr.Result_of_Stop);

				marker = L.circleMarker([lat + ct * 0.0001, long - ct * 0.0001], opt /*{
					color: '#3388ff',
					radius: 5,
					fill: true,
					fillOpacity: 0.5
				}*/
				);

			}
			/*const marker = L.marker([lat + ct * 0.0001, long - ct * 0.0001],
				{ icon: myMarker });*/

			markersAtLocation.set(JSON.stringify(loc), ct + 1);
			var msg = collisionPopup(attr);
			if (coll.switrsRecord) {
				const msg2 = collisionPopup(coll.switrsRecord.attributes);
				msg += '<br>Switrs properties:<br>' + msg2;
			} else if (coll.localRecord) {
				const msg2 = collisionPopup(coll.localRecord.attributes);
				msg += '<br>BPD properties:<br>' + msg2;
			}

			if (pointerFine) {

				//marker.bindTooltip(msg).openTooltip(); can copy from tooltip!
				marker.bindPopup(msg).openPopup();
			} else {
				marker.bindPopup(msg).openPopup();
			}

			marker.addTo(map);
			markers.push(marker);
			markerCount++;
		} else {
			//histMissingGPSData.set(attr.Year, histMissingGPSData.get(attr.Year) + 1);
			console.log("Missing gps for collision id:", attr.Case_Number)
			incrementMapKey(histMissingGPSData, attr.Year);
			skipped++;
		}
	}
	console.log('Skipped', skipped);
	console.log('Plotted', plotted);
	console.log("markerCount ", markerCount)

	const summaryMsg = '<br>Matching collisions or Stops: ' + plotted;//+ '<br>' + 'Skipped: ' + skipped + '<br>';
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
// ADD NEW CHART
const histYearData = new Map();
const histMonthData = new Map();
const arrMonthKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const histHourData = new Map();
const arrHourKeys = [0, 3, 6, 9, 12, 15, 18, 21];

const histMissingGPSData = new Map();
var histFaultData = new Map();

var histSeverityData = new Map();
var histObjectData = new Map();


var histAgeInjuryData = new Map();  // bars 0-9, 10-19, 20-, 30, 40, 50, 60, 70, 80+
const arrAgeKeys = [0, 10, 20, 30, 40, 50, 60, 70, 80];

var histStopResultData = new Map();
const arrStopResultKeys = [stopArrest, stopCitation, stopWarning, stopNoAction, stopUnkown];


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

/* histogram data */
function clearHistData(keys, data) {
	for (const f of keys) {
		data.set(f, 0);
	}
}

// ADD NEW CHART
clearHistData(arrObjectKeys, histObjectData);
clearHistData(arrSeverityKeys, histSeverityData);
clearHistData(arrAgeKeys, histAgeInjuryData);
clearHistData(arrStopResultKeys, histStopResultData);
clearHistData(arrHourKeys, histHourData);
clearHistData(arrMonthKeys, histMonthData);


// clear data functions
function clearHistYearData() {
	// ADD NEW YEAR
	for (var y = 2015; y <= 2025; y++) {
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
// ADD NEW CHART
var histYearChart;
var histMonthChart;
var histHourChart;

var histChartGPS;
var histFaultChart;

var histObjectChart;
var histSeverityChart;
var histAgeInjuryChart;

var histStopResultChart;



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
	// ADD NEW CHART
	clearHistYearData();
	clearHistData(arrMonthKeys, histMonthData);
	clearHistData(arrHourKeys, histHourData);
	clearFaultData();
	clearHistData(arrObjectKeys, histObjectData);
	clearHistData(arrSeverityKeys, histSeverityData);
	clearHistData(arrAgeKeys, histAgeInjuryData);
	clearHistData(arrStopResultKeys, histStopResultData);

	const dataSpec = selectData.value;
	var tsSet;
	var collData;

	switch (selectData.value) {
		case 'T':
			collData = mergedTransparencyJson;
			tsSet = tsTransparency;
			break;
		case 'C':
			collData = mergedCCRSJson;
			tsSet = tsCcrs;
			break;
		case 'S':
			collData = mergedSWITRSJson;
			tsSet = tsSwtrs;
			break;
		case "CUT":
			collData = mergedUnionCcrs; // TODO UNION
			tsSet = tsCcrsUnionTransparency;
			break;
		case "SUT":
			collData = mergedUnionSwitrs; // TODO UNION
			tsSet = tsSwtrsUnionTransparency;
			break;
		case "STOPS":
			collData = mergedStopJson;
			tsSet = tsStops;
			break;
		/*	case 'SNT':
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
				break;*/
		default:
			console.log("Unepxected data spec")

	}
	addMarkers(collData, tsSet, histYearData, histHourData, histFaultData, histAgeInjuryData,

		selectVehicleTypes.value,
		// ADD NEW YEAR
		check2025.checked,
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
		selectSeverity.value,
		selectStopResult.value
	);

	// ADD NEW CHART
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

	const dataStopResult = [];
	for (const k of arrStopResultKeys) {
		dataStopResult.push({ bar: k, count: histStopResultData.get(k) })
	}


	// ADD NEW CHART
	histFaultChart = createOrUpdateChart(dataFault, histFaultChart, document.getElementById('crashFaultHist'), 'Collisions by Fault');

	histObjectChart = createOrUpdateChart(dataObject, histObjectChart, document.getElementById('involvedObjectHist'), 'Crash Particpants');

	histSeverityChart = createOrUpdateChart(dataSeverity, histSeverityChart, document.getElementById('severityHist'), 'Injury Severity');

	const dataByYear = [];
	// ADD NEW YEAR
	for (var bar = 2015; bar <= 2025; bar++) {
		dataByYear.push({ bar: bar, count: histYearData.get(bar) });
	}

	histYearChart = createOrUpdateChart(dataByYear, histYearChart, document.getElementById('yearHist'), 'Collisions or Stops by Year');

	const dataByMonth = [];
	for (const k of arrMonthKeys) {
		dataByMonth.push({ bar: k, count: histMonthData.get(k) })
	}

	histMonthChart = createOrUpdateChart(dataByMonth, histMonthChart, document.getElementById('monthHist'), 'Collisions or Stops by Month');


	const dataByHour = [];
	for (const k of arrHourKeys) {
		dataByHour.push({ bar: k, count: histHourData.get(k) })
	}

	histHourChart = createOrUpdateChart(dataByHour, histHourChart, document.getElementById('hourHist'), 'Collisions or Stops by Hour');

	const dataGPSByYear = [];
	// ADD NEW YEAR
	for (var bar = 2015; bar <= 2025; bar++) {
		dataGPSByYear.push({ bar: bar, count: histMissingGPSData.get(bar) });
	}

	histChartGPS = createOrUpdateChart(dataGPSByYear, histChartGPS, document.getElementById('gpsHist'), 'Missing GPS by Year');
	//ageInjuryHist

	const dataInjurybyAge = [];
	for (const k of arrAgeKeys) {
		dataInjurybyAge.push({ bar: k, count: histAgeInjuryData.get(k) })
	}

	histAgeInjuryChart = createOrUpdateChart(dataInjurybyAge, histAgeInjuryChart, document.getElementById('ageInjuryHist'), 'Injury by Age');

	histStopResultChart = createOrUpdateChart(dataStopResult, histStopResultChart, document.getElementById('stopResultHist'), 'Stop Results');

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
	mergedTransparencyJson, greenIcon, goldIcon, redIcon,
	populateStreetSelect, collisionPopup,
	map, handleFilterClick
};