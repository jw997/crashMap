
import {getJson} from "./utils_helper.js";



const collisionsJsonFile = './db/exports/BPCOLL.json';
const collisionsJson = await getJson(collisionsJsonFile);

const transparencyJsonFile = './db/exports/transparency.portal.2024.json';
const transparencyJson = await getJson(transparencyJsonFile);

async function getTransparencyData() {
	var arrays = [];
	for (var y = 2015; y<=2024; y++ ) {
		const file = './data/' + y + '.json';
		const transparencyJson = await getJson(file);
		arrays.push(transparencyJson.features);
	}
	const retval = [].concat(...arrays)
	return retval;

}

const mergedTransparencyJson = await(getTransparencyData());



export {collisionsJson,transparencyJson, mergedTransparencyJson};