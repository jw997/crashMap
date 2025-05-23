async function getJson(url) {
	try {
		const response = await fetch(url); // {cache: 'no-cache'} https://hacks.mozilla.org/2016/03/referrer-and-cache-control-apis-for-fetch/
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		return json;
	} catch (error) {
		console.error(error.message);
	}
}

const streetArray = [


	"62nd",
	"63rd",
	"65th",
	"66th",
	"67th",	
	
	"I80\|80",
	"NOT I80\|^(?!.*80).*$",
	
	"Acacia",
	"Acroft",
	"Acton\|Action",
	"Ada",
	"Addison\|Addis\|Adis",
	"Adeline\|Adeli\|Adline\|Adlein\|Aseline\|Adelle",
	"Ajax",
	"Alamo",
	"Albina",
	"Alcatraz\|Alcvatraz\|Alctraz",
	"Allston\|Allison",
	"Alta",
	"Alvarado",
	"Alvarez",
	"Amador",
	"Anthony",
	"Arcade\|Acrade",
	"Arch",
	"Arden",
	"Arlington",
	"Ashby\|Ahby\|Asby\|Ashbtave\|13\|ASBHY",
	"Atherton",
	"Atlas",
	"Avalon",
	"Avenida",
	"Avis",
	"Baker",
	"Bancroft\|Ban.roft",
	"Barrow",
	"Bataan",
	"Bateman",
	"Bay Street",
	"Bay Trail",
	"Bay Tree",
	"Bay View",
	"Belrose",
	"Belvedere",
	"Benvenue\|Benveue",
	"Berkeley\|BERKELY",
	"Berryman\|BERYMAN",
	"Beverly",


	"Bike Boulevards\|Russell\|Channing\|Virginia\|Milvia\|California\|9th\|Bowditch\|Hillegass\|King St",
	"Blake",
	"Boise",
	"Bolivar",
	"Bonar",
	"Bonita",
	"Bonnie",
	"Bowditch\|BOWDICH",
	"Boynton",
	"Breakwater",
	"Bret Harte",
	"Bridge",
	"Brookside",
	"Browning",
	"Buena Avenue",
	"Buena Vista",
	"Burnett",
	"Byron\|B..on",
	"California\|Calif",
	"Camelia\|Camel\|Ceamelia",
	"Campanile",
	"Campus",
	"Canyon",
	"Capistrano",
	"Carleton\|CARELTON",
	"Carlotta",
	"Carrison",
	"Catalina",
	"Catherine",
	"Cedar",
	"Cedarwood",
	"Centennial\|Centenial",
	"Center\|Cen.ter",
	"Central Park",
	"Chabolyn Terrace",
	"Chabot Crest",
	"Chamberlain",
	"Channing\|Chann",
	"Chaucer",
	"Cherry",
	"Chester",
	"Chestnut",
	"Chilton",
	"Chu Road",
	"Claremont\|C...EMONT",
	"Clauser",
	"Codornices",
	"Colby\|Cobly",
	"College\|C.llege",
	"Colorado",
	"Columbia",
	"Colusa\|C.lusa",
	"Comstock",
	"Contra Costa",
	"Cornell",
	"Corona",
	"Court Street",
	"Cowper",
	"Cragmont",
	"Creston",
	"Crossways",
	"Crystal",
	"Curtis",
	"Cutter",
	"Cyclotron",
	"Cypress",
	"Dana",
	"Deakin",
	"Delaware\|DELWARE",
	"Del Mar",
	"Del Norte",
	"Derby",
	"Devon",
	"Dohr",
	"Domingo",
	"Dover",
	"Dowling",
	"Durant\|Duran",
	"Dwight\|Dwigh\|Dwght\|D.ight",
	"Dwinelle Plaza",
	"Eastshore\|Easthore\|East.shore\|SHORE",
	"Edith",
	"Edwards",
	"Eighth\|8",
	"El Camino Real\|El.Camino",
	"El Dorado",
	"Ellis",
	"Ellsworth\|Ells..rth",
	"Elmwood Avenue\|Elmwood Av",
	"Elmwood Court\|Elmwood C",
	"El Portal",
	"Emerson",
	"Emeryville Greenway",
	"Encina",
	"Ensenada",
	"Eola",
	"Eshleman",
	"Essex Street\|Essex S",
	"Essex Way",
	"Etna",
	"Eton\|Eaton",
	"Eucalyptus",
	"Euclid\|EDCLID",
	"Eunice",
	"Evelyn\|Evalyn",
	"Fairlawn Drive",
	"Fairview Street\|Faiview\|Fairview",
	"Fernwald",
	"Fifth\|5",
	"Florence",
	"Florida",
	"Folger",
	"Forest Avenue\|Forest.Street",
	"Forest Lane\|Forrest.Lane",
	"Fourth\|4",
	"Francisco",
	"Franklin",
	"Frank Schlessinger",
	"Fresno",
	"Frontage\|Frntage\|Fr.ntag",
	"Fulton\|Fultn",
	"Garber",
	"Gayley\|Ga.ley",
	"Gilman\|.ilman\|Gillman\|Gilma",
	"Glaser",
	"Glen Avenue\|Glen A",
	"Glendale",
	"Glen Rose Alley",
	"Golf Course",
	"Grant",
	"Grayson",
	"Greenwood",
	"Gridiron",
	"Grizzly Peak\|Grizzl\|izzly\|Grizzy",
	"Haas Stairs",
	"Halcyon",
	"Halkin",
	"Harding",
	"Harmon",
	"Harold",
	"Harper",
	"Harrison\|Hrrison",
	"Harvard",
	"Haskell",
	"Haste\|Haset\|Hate",
	"Hawthorne",
	"Hazel",
	"Hearst\|Heast\|Harst",
	"Hearst Mining Circle",
	"Heinz\|Heniz\|Heanz",
	"Henry",
	"High Court",
	"Highland",
	"Hilgard\|Hillgard",
	"Hill Court\|HILL R",
	"Hillcrest\|Hillcr",
	"Hilldale",
	"Hillegass\|Hillegas\|Hillgas",
	"Hill Road",
	"Hillside\|Hills.ide",
	"Hillview",
	"Hollis",
	"Holly",
	"Hopkins",
	"Horseshoe Driveway",
	"Hospital",
	"Howe",	"I80\|80",
	"NOT I80\|^(?!.*80).*$",
	"Idaho",
	"Indian Rock",
	"Jaynes",
	"Jefferson\|.efferso",
	"Jones",
	"Josephine\|Joseph.ne",
	"Juanita",
	"Julia",
	"Kains",
	"Kala Bagai",
	"Keeler\|Keller\|KEELEE",
	"Keith",
	"Kelsey",
	"Kentucky",
	"Keoncrest",
	"King Street\|King st",
	"Kittredge\|Kittr\|Kitre",
	"La Loma\|LaLoma",
	"Lassen",
	"Latham",
	"Laurel Lane",
	"Laurel Street",
	"La Vereda\|La V.rda\|La.Var",
	"Lawrence",
	"Le Conte\|Lecont\|La Cont",
	"Le Roy\|Leroy",
	"Lewiston",
	"Lincoln\|Linc..",
	"Linden",
	"Lorina",
	"Los Angeles\|Los.Angel",
	"Lower Sproul Plaza",
	"Mabel\|Mable",
	"Madera",
	"Magnolia\|Magnal",
	"Marin Ave\|Marin\\b",
	"Marina",
	"Mariposa",
	"Market",
	"Martin Luther King\|Martin\|ML.JR\|MLK\|MK JR WY",
	"Maryland",
	"Masonic",
	"Mathews\|Matthews",
	"Maybeck Twin",
	"McGee\|Mc.gee",
	"McKinley",
	"McMIllan",
	"Mendocino",
	"Menlo",
	"Merced",
	"Michigan",
	"Middlefield",
	"Miller",
	"Milvia",
	"Miramar",
	"Miramonte",
	"Modoc",
	"Monterey",
	"Montrose",
	"Mosswood Lane",
	"Mosswood Road",
	"Muir",
	"Murray",
	"Mystic",
	"My Way",
	"Napa",
	"Neilson\|N..lson",
	"Newbury",
	"Ninth\|9th",
	"Nogales",
	"Northampton",
	"Northbrae Tunnel",
	"Northgate",
	"Northside",
	"North Street",
	"North Valley Street",
	"Oak",
	"Oak Knoll",
	"Oak Ridge",
	"Oakvale",
	"Occidental",
	"Ohlone Greenway",
	"Olympus",
	"Oppenheimer",
	"Orchard",
	"Ordway",
	"Oregon",
	"Otis",
	"Overlook",
	"Oxford",
	"Page",
	"Palm",
	"Panoramic\|Pano",
	"Pardee\|Padre",
	"Parker",
	"Park Gate",
	"Park Hills",
	"Parkside",
	"Park Street\|Park S",
	"Park Way",
	"Parnassus",
	"Peralta",
	"Perlmutter",
	"Piedmont\|Piemont",
	"Pine",
	"Poe",
	"Poplar\|Polar\|Polpa",
	"Poppy",
	"Portland",
	"Posen",
	"Potter",
	"Prince",
	"Prospect",
	"Quail",
	"Quarry",
	"Queens",
	"Redwood",
	"Regal",
	"Regent",
	"Ridge",
	"Roanoke",
	"Roble Court\|Roble C",
	"Roble Road\|Roble R",
	"Rochdale",
	"Rock",
	"Rockwell",
	"Roosevelt",
	"Rose",
	"Rosemont",
	"Roslyn",
	"Rugby",
	"Russell\|Rusell",
	"Sacramento\|S..rament\|\Sacra\|mento",
	"San Antonio",
	"San Benito",
	"San Diego",
	"San Fernando",
	"San Juan",
	"San Lorenzo\|Lorenzo",
	"San Luis",
	"San Mateo",
	"San Miguel",
	"San Pablo\|SanPab\|Pablo\|Bablo\|San P..l\|123",
	"San Pedro",
	"San Ramon",
	"Santa Barbara\|BARBERA",
	"Santa Clara",
	"Santa Fe",
	"Santa Rosa",
	"Sather Lane",
	"Sather Road",
	"Scenic",
	"Seabord",
	"Seaborg",
	"Seawall",
	"Second\|2",
	"Segre",
	"Senior",
	"Seventh\|7",
	"Shasta",
	"Shattuck\|Shat.*Ave\|Shat.*Pl\|SHUTTUCK",
	"Shellmound",
	"Short",
	"Sierra",
	"Sixth\|6",
	"Smoot",
	"Smyth",
	"Sojourner Truth",
	"Solano",
	"Somerset",
	"Sonoma",
	"Southampton\|Hampton",
	"South Drive",
	"South Hall Road",
	"South Street",
	"Southwest Place",
	"Spaulding",
	"Spieker Plaza",
	"Spinnaker",
	"Sports",
	"Springer Gateway",
	"Spring Way",
	"Sproul Plaza",
	"Spruce",
	"Stadium Rim",
	"Stanford\|Stan...d\|Sanford",
	"Stannage",
	"Stanton",
	"Station",
	"Sterling",
	"Stevenson",
	"Stoddard",
	"Stuart\|Stu..t\|Stuar",
	"Summer",
	"Summit Lane",
	"Summit Road",
	"Sunset",
	"Sutter",
	"Tacoma",
	"Talbot",
	"Tamalpais\|Tamal",
	"Tanglewood",
	"Telegraph\|Tel..raph",
	"Tenth\|10",
	"Terminal",
	"Tevlin",
	"Alameda\|Alamen\|Al.meda",
	"The Circle",
	"The Crescent",
	"The Plaza",
	"The Promenade",
	"The Spiral",
	"The Uplands",
	"Third\|3",
	"Thousand Oaks\|Thousand",
	"Tomlee",
	"Tremont",
	"Trumpetvine",
	"Tulare",
	"Tunbridge",
	"Tunnel",
	"Twain",
	"Tyler",
	"University\|Univer\|versity\|UNIV",
	"Upton",
	"Vallejo",
	"Valley",
	"Vassar",
	"Vermont",
	"Vicente",
	"Vincente",
	"Vine\|Bine",
	"Virginia\|Virgina\|Vir.gin",
	"Visalia",
	"Vistamont",
	"Walker",
	"Wallace",
	"Walnut",
	"Ward",
	"Warring\|Waring",
	"Watkins",
	"Webster",
	"West",
	"West Circle",
	"Wheeler",
	"Whitaker",
	"Whitney",
	"Wickson",
	"Wildcat Canyon",
	"Wilson",
	"Woodhaven",
	"Woodmont",
	"Woodside",
	"Woolsey\|Woosley",
	"Yolo",
	"Yosemite"];


export { getJson, streetArray };
