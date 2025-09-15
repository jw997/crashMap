'use strict';

for (let j = 0; j < process.argv.length; j++) {
	console.log(j + ' -> ' + (process.argv[j]));
}

const crashFileName = process.argv[2] ?? './testcrashes.csv';
const partyFileName = process.argv[3] ?? './testparties.csv';
const iwpFileName = process.argv[4] ?? './testiwp.csv';

const outputFilename = process.argv[5] ?? './testoutput.json';

import * as fs from 'fs';

import Papa from 'papaparse';
import { exit } from 'process';

function stepper(results, accumulator, filter, transform) {
	const errs = results.errors
	if (errs && errs.length > 0) {

		console.log("Stepper Errors:", errs) // log id fields?
	}
	var row = results.data;

	const bInclude = filter(row);

	if (!bInclude) {
		return false;
	}

	if (transform) {
		const transformed = transform(results.data)
		accumulator.push(transformed)
	} else {
		accumulator.push(results.data);
	}

	return;
}

const constBerkeley = 'Berkeley'

function filterBerkeley(obj) {
	const city = obj['City Name'];
	if (!city || city != constBerkeley) {
		return false
	}
	return true
}

function transformCrash(obj) {
	var attrObj = {};
	if (obj) {
		attrObj.CollisionId = obj['Collision Id'];
		attrObj.Case_ID = obj['Collision Id'];
		attrObj.Primary_Collision_Factor_Code = obj["Primary Collision Factor Violation"]

		attrObj.Local_Report_Number = obj['Report Number']; // this would be the BPD transparency portal id
		attrObj.CityName = obj['City Name'];
		attrObj.CCRSDateTime = obj['Crash Date Time'];
		attrObj.NumberInjured = obj.NumberInjured
		attrObj.NumberKilled = obj.NumberKilled
		attrObj.PrimaryRoad = obj.PrimaryRoad
		attrObj.SecondaryRoad = obj.SecondaryRoad
		if (obj.SecondaryDistance) {
			attrObj.Accident_Location_Offset = '' + obj.SecondaryDistance +
				' ' + (obj.SecondaryUnitOfMeasure ?? 'F') +
				' ' + obj.SecondaryDirection;
		} else {
			attrObj.Accident_Location_Offset = ''
		}
		attrObj.Latitude = obj.Latitude
		attrObj.Longitude = obj.Longitude
	}
	var retObj = { attributes: attrObj };

	//retObj.attributes = obj;
	return retObj;
}

function transformParty(obj) {
	Parties.Vehicle1TypeId, Vehicle1TypeDesc
}

// todo return value for errors?
async function readCsv(importFile, accumlator, filter, transform) {
	console.log("Parsing ", importFile)
	const papaPromise = (importFile) => new Promise((resolve, reject) => {
		var bSuccess = true;

		const file = fs.createReadStream(importFile);
		Papa.parse(file, {
			header: true,
			dynamicTyping: true,
			//	fastMode: true,

			step: function (results, parser) {
				stepper(results, accumlator, filter, transform)

				//console.log("Row data:", results.data);

				//console.log("Row errors:", results.errors);


			},
			complete: function (results) {
				resolve(results);
			},
			error: function (error) {
				console.log("Error:", error)
				bSuccess = false;
				reject(error);
			}
		});
	})
	const results = await papaPromise(importFile);
	return results.data;
}

var rowsCrashes = [];
//await readCsv('./build/ccrsToJson/testcrashes.csv', rowsCrashes, filterBerkeley, transformCrash)


await readCsv(crashFileName, rowsCrashes, filterBerkeley, transformCrash)
console.log("Crashes:", rowsCrashes.length)

// make a set of collision ids
const ids = new Set();

for (const r of rowsCrashes) {
	ids.add(r.attributes.CollisionId);
}

// read parties and iwp filtering by collision ids
function filterCollisionId(obj) {
	const objId = obj.CollisionId;
	if (!objId)
		return false;

	const retval = ids.has(obj.CollisionId);
	if (retval) {
		return true
	} else {
		return false;
	}
}
// YYYY-MM-DD
function formatDateYYYYMMDD(dateStr) {
	const d = new Date(Date.parse(dateStr));
	const retval = d.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
	return retval;
}
//"Time": "15:25:00",
function formatTimeHHMMSS(dateStr) {
	const d = new Date(Date.parse(dateStr));
	const retval = d.toLocaleTimeString('en-CA', { hour: '2-digit', hour12: false, minute: '2-digit', second: '2-digit' })
	return retval;
}
function fixCrashFields(c) {
	c.Accident_Location = c.PrimaryRoad + '/' + c.SecondaryRoad;

	const ccrsDate = c.CCRSDateTime;
	const d = new Date(Date.parse(ccrsDate));

	c.Hour = d.getHours();  // 0 - 23
	c.Year = d.getFullYear(); // YYYY
	c.Date = formatDateYYYYMMDD(ccrsDate);
	c.Time = formatTimeHHMMSS(ccrsDate);

	return

}

for (const r of rowsCrashes) {
	fixCrashFields(r.attributes)
}

var rowsParties = [];
await readCsv(partyFileName, rowsParties, filterCollisionId)
console.log("Parties:", rowsParties.length)

// sort parties by collision id and party nuumber
function compParty(p, q) {
	if (p.CollisionId != q.CollisionId) {
		return p.CollisionId - q.CollisionId;
	}
	return p.PartyNumber - q.PartyNumber
}
rowsParties.sort(compParty)


var rowsIWP = [];
await readCsv(iwpFileName, rowsIWP, filterCollisionId)
console.log("IWP:", rowsIWP.length)

// sort parties by collision id and party nuumber
function compIWP(p, q) {
	if (p.CollisionId != q.CollisionId) {
		return p.CollisionId - q.CollisionId;
	}
	return p.InjuredWitPassId - q.InjuredWitPassId
}
rowsIWP.sort(compIWP)



const sevCodes = [
	['Fatal', 1],
	['SuspectSerious', 2],
	['SevereInactive', 2],
	['OtherVisibleInactive', 3],
	['SuspectMinor', 3],
	['PossibleInjury', 4],
	['ComplaintOfPainInactive', 4]
	// No Injury, PDO 5
];
const NOINJURY = 5;

const mapSevStrToNum = new Map(sevCodes);

var mapCollisionIdToSeverityCode = new Map();
var mapCollisionIdToInjuryAges = new Map();

function makeIdToSeverityMap(iwp) {
	for (const r of iwp) {
		const collId = r.CollisionId;
		const sevStr = r.ExtentOfInjuryCode;
		const sevNum = mapSevStrToNum.get(sevStr) ?? NOINJURY;

		const oldVal = mapCollisionIdToSeverityCode.get(collId) ?? NOINJURY;
		const newVal = Math.min(oldVal, sevNum)
		mapCollisionIdToSeverityCode.set(collId, newVal);

		// if there is an injury add the age to the injured ages map
		const age = r.StatedAge;
		if (age) {
			if (sevNum < 5)
				appendToMapEntry(mapCollisionIdToInjuryAges, collId, age.toString())
		}
	}
}


makeIdToSeverityMap(rowsIWP)



// map CCRS vehicle type codes to Simplified UI categories
const arrVcodes = [
	[1, 'Car'],  //PassengerCarStationWagonJeep
	[2, 'Motorcycle'],  //Motorcycle
	[3, 'Motorcycle'],  //MotorDrivenCycleScooter15HpOrLess
	[4, 'Bicycle'], //Bicycle
	[7, 'Car'],  //SportUtilityVehicle
	[8, 'Car'],  //MiniVan
	[9, 'Bus'], //Paratransit
	[10, 'Bus'],  //TourBus
	//11,,OtherCommercial
	[13, 'Bus'],  //SchoolBusPublicTypeI
	[17, 'Bus'],  //SchoolBusContractualTypeI
	[20, 'Bus'],  //PublicTransitAuthority
	[22, 'Truck'], //PickupsAndPanels
	[25, 'Truck'],  //TruckTractor
	[26, 'Truck'],  //TwoAxleTruck
	[27, 'Truck'],  //ThreeOrMoreAxleTruck
	//32,,PullTrailer
	[33, 'Truck'], //TwoTrailersIncludesSemiAndPull
	[43, 'Fire Truck'], //FireTruck
	//45,,HighwayConstructionEquipment
	[48, 'Police Car'], //PoliceCar
	[55, 'Truck'], //TwoAxleTowTruck
	[60, 'Pedestrian'], //Pedestrian
	[91, 'Electric Bicycle'],//ElectricBicycles
	[93, 'Electric Skateboard'],
	[94, 'Electric Scooter'], //GoPedZipElectricScooterAndMotorboard
	//[96,,MiscMotorVehicleSnowmobileGolfCart
	[99, 'Car Hit and Run'] // ,OtherUnknownHitAndRunDriver
];

const mapVtypeIdtoStr = new Map(arrVcodes);

function getObjectforVid(vTypeId) {
	return mapVtypeIdtoStr.get(vTypeId) ?? 'UNKNOWN';
}

var mapIdToParties = new Map();

function appendToMapEntry(map, k, v) {
	const oldVal = map.get(k);
	if (!oldVal) {
		map.set(k, v)
	} else {
		map.set(k, oldVal + '/' + v)
	}
}

// loop throug parties to figure out involved objects and party at fault
var mapCollisionIdToAtFault = new Map();

const mapConvertAtFaultPartyStr = new Map(
	[['Driver', 'Driver'],
	['ParkedVehicle', 'Driver'],  // ??
	['Bicyclist', 'Bicyclist'],
	['Pedestrian', 'Pedestrian'],
	['Other', 'Other']
	]
);


// map collision id to involved object string
// map collision id to at fault party type string
class InvolvedObjects {
	car = 0;
	ped = 0;
	truck = 0;
	motorcycle = 0;
	parkedcar = 0;
	bicycle = 0;
	ebike = 0;
	escooter = 0;
	eskateboard = 0;
	ambulance=0;
	policecar = 0;
	firetruck = 0;
	bus = 0;
	schoolbus = 0;
	hitandrun = 0;
	unknown = 0;
	solo = null;

	incrementSolo() {  // null -> true -> false
		if (null == this.solo) {
			this.solo = true;
		} else 	if (true == this.solo ) {
			this.solo = false;
		} 
	}

	addCar() {
		this.car++; this.incrementSolo();
	}
	addPed() {
		this.ped++; this.incrementSolo();
	}
	addMotorcyle() {
		this.motorcycle++; this.incrementSolo();
	}
	addBicycle() {
		this.bicycle++; this.incrementSolo();
	}
	addTruck() {
		this.truck++; this.incrementSolo();
	}
	addParkedCar() {
		this.parkedcar++; this.incrementSolo();
	}
	addEbike() {
		this.ebike++; this.incrementSolo();
	}
	addEScooter() {
		this.escooter++; this.incrementSolo();
	}
	addESkateBoard() {
		this.eskateboard++; this.incrementSolo();
	}
	addAmbulance() {
		this.ambulance++; this.incrementSolo();
	}
	addPolicecar() {
		this.policecar++; this.incrementSolo();
	}
	addFireTruck() {
		this.firetruck++; this.incrementSolo();
	}
	addBus() {
		this.bus++; this.incrementSolo();
	}
	addSchooolBus() {
		this.schoolbus++; this.incrementSolo();
	}
	addHitAndRun() {
		this.hitandrun++; this.incrementSolo();
	}
	addUnkown(id) {
		this.unknown++; this.incrementSolo();
	}
	addObjectByCCRSVehicleTypeId(vTypeId) {
		/*
				// map CCRS vehicle type codes to Simplified UI categories
		const arrVcodes = [
		
			[1, 'Car'],  //PassengerCarStationWagonJeep
			[2, 'Motorcycle'],  //Motorcycle
			[3, 'Motorcycle'],  //MotorDrivenCycleScooter15HpOrLess
			[4, 'Bicycle'], //Bicycle
			[7, 'Car'],  //SportUtilityVehicle
			[8, 'Car'],  //MiniVan
			[9, 'Bus'], //Paratransit
			[10, 'Bus'],  //TourBus
			//11,,OtherCommercial

			[13, 'Bus'],  //SchoolBusPublicTypeI
			[17, 'Bus'],  //SchoolBusContractualTypeI
			
			[20, 'Bus'],  //PublicTransitAuthority
			[22, 'Truck'], //PickupsAndPanels
			[25, 'Truck'],  //TruckTractor
			[26, 'Truck'],  //TwoAxleTruck
			[27, 'Truck'],  //ThreeOrMoreAxleTruck
			//32,,PullTrailer
			[33, 'Truck'], //TwoTrailersIncludesSemiAndPull
			[43, 'Fire Truck'], //FireTruck
			//45,,HighwayConstructionEquipment
			[48, 'Police Car'], //PoliceCar
			[55, 'Truck'], //TwoAxleTowTruck
			[60, 'Pedestrian'], //Pedestrian
			[91, 'Electric Bicycle'],//ElectricBicycles
			[93, 'Electric Skateboard'],
			[94, 'Electric Scooter'], //GoPedZipElectricScooterAndMotorboard
			//[96,,MiscMotorVehicleSnowmobileGolfCart
			[99,'Car Hit and Run'] // ,OtherUnknownHitAndRunDriver
		];*/

		// maybe use ranges?
		switch (vTypeId) {
			case 1: case 7: case 8: case 9:
				this.addCar(); break;
			case 2: case 3:
				this.addMotorcyle(); break;
			case 4:
				this.addBicycle(); break;
			case 9: case 10: case 11: case 12: case 20:
				this.addBus(); break;
			case 13: case 14: case 15: case 16: case 17: case 18: case 19:
				this.addSchooolBus(); break;
			case 11: case 21: case 22: case 23: case 24: case 25: case 26: case 27: case 28: case 31: case 32: case 33: case 45: case 47: case 55:
			case 87: 
				this.addTruck(); break;
			case 41:
				this.addAmbulance(); break;
			case 43:
				this.addFireTruck(); break;
			case 48:
				this.addPolicecar(); break;
			case 60:
				this.addPed(); break;
			case 91:
				this.addEbike(); break;
			case 93:
				this.addESkateBoared(); break;
			case 94:
				this.addEScooter(); break;
			case 99:
				this.addHitAndRun(); break;
			default:
				console.log("Unexpected data ccrs vehicle type id ", vTypeId)
				this.addUnkown(); break;

		}

	}

	getString() {
		var objs = '';
		if (this.motorcycle) {
			objs += "Motorcycle/"
		}
		if (this.bicycle) {
			objs += "Bicycle/"
		}
		if (this.ebike) {
			objs += "Electric Bike/"
		}
		if (this.escooter) {
			objs += "Electric Scooter/"
		}
		if (this.eskateboard) {
			objs += "Electric Skateboard/"
		}
		if (this.schoolbus) {
			objs += "School Bus/"
		}
		if (this.bus) {
			objs += "Bus/"
		}
		if (this.ambulance) {
			objs += "Ambulance/"
		}
		if (this.firetruck) {
			objs += "Fire Truck/"
		}
		if (this.truck) {
			objs += "Truck/"
		}
		if (this.hitandrun) {
			objs += "Hit and Run Car/"
		}
		if (this.policecar) {
			objs += "Police Car/"
		}
		if (this.car) {
			objs += "Car/"
		}
		if (this.parkedcar) {
			objs += "Parked Car/"
		}
		if (this.ped) {
			objs += "Ped/"
		}
		if (this.solo) {
			objs += 'Solo/'
		}
		if (objs.length>0) {
			return objs.slice(0,-1);
		} 
		return "UNKNOWN"
		
	}
}

var mapCollisionIdToInvolvedObjects = new Map();

for (const p of rowsParties) {
	const id = p.CollisionId;

	if (mapCollisionIdToInvolvedObjects.get(id) == null) {
		mapCollisionIdToInvolvedObjects.set(id, new InvolvedObjects())
	}
	mapCollisionIdToInvolvedObjects.get(id).addObjectByCCRSVehicleTypeId(p.Vehicle1TypeId)

	// compute involved objects
	const vType = getObjectforVid(p.Vehicle1TypeId);
	appendToMapEntry(mapIdToParties, id, vType)




	// compute at fault
	if (p.IsAtFault == 'True') {
		const pTypeStr = p.PartyType;

		const temp = mapConvertAtFaultPartyStr.get(pTypeStr) ?? 'UNKNOWN';
		mapCollisionIdToAtFault.set(id, temp);
	}
}

function getAtFaultPartyForCollision(collisionId) {
	const atFaultParty = mapCollisionIdToAtFault.get(collisionId) ?? ""
	return atFaultParty;
}

function getInvolvedObjectsForCollision(collisionId) {
	//	const involvedObjects = mapIdToParties.get(collisionId) ?? "NONE"
	const involvedObjects = mapCollisionIdToInvolvedObjects.get(collisionId).getString();
	return involvedObjects;
}


// ExtentOfInjuryCode
/*
Fatal 1
SuspectSerious   2
SevereInactive  2
OtherVisibleInactive 3
SuspectMinor 3
PossibleInjury 4
ComplaintOfPainInactive 4



SWITRS numberical values

	1 - Fatal injury
	2 - Suspected serious injury or severe injury
	3 - Suspected minor injury or visible injury
	4 - Possible injury or complaint of pain
	0 - No injury, also known as "property damage only" or PDO (PDO crashes not included on TIMS)

*/

const sevDeCodes = [
	[1, 'Fatal', 1],
	[2, 'Serious Injury', 2],
	[3, 'Minor Injury', 3],
	[4, 'Possible Injury', 4],
	[5, "No Injury"] // No Injury, PDO 5
];

const mapSevCodeToStr = new Map(sevDeCodes);

function getInjurySeverityForCollision(collisionId) {
	// crash recorde has numkilled, numinjured
	// iwp records have ExtentOfInjuryCode
	const sevCode = mapCollisionIdToSeverityCode.get(collisionId) ?? NOINJURY;

	const retval = mapSevCodeToStr.get(sevCode);
	if (!retval) {
		console.error("Unexpected sevcode for collisionId", collisionId, ' ', sevCode)
		return ('UNKNOWN')
	}
	return retval

}

function getInjuryAgesForCollision(collisionId) {
	const retval = mapCollisionIdToInjuryAges.get(collisionId) ?? "";
	return retval;
}

// Append computed values to crash objects
for (const r of rowsCrashes) {
	const a = r.attributes;
	a.Involved_Objects = getInvolvedObjectsForCollision(a.CollisionId);
	a.Injury_Severity = getInjurySeverityForCollision(a.CollisionId);
	a.Party_at_Fault = getAtFaultPartyForCollision(a.CollisionId);
	a.Injury_Ages = getInjuryAgesForCollision(a.CollisionId);


}

// from parties 

const feature = { features: rowsCrashes };

// write to json file
const output = JSON.stringify(feature, null, 2);
fs.writeFileSync(outputFilename, output);

console.log("bye")
