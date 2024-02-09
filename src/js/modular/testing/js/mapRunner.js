import { Map } from "/src/js/modular/map.js";
import { BarGraph } from "/src/js/modular/bar.js";

const pruidToFull = {
    "24": "Quebec",
    "10": "Newfoundland and Labrador",
    "59": "British Columbia",
    "62": "Nunavut",
    "61": "Northwest Territories",
    "13": "New Brunswick",
    "12": "Nova Scotia",
    "47": "Saskatchewan",
    "48": "Alberta",
    "11": "Prince Edward Island",
    "60": "Yukon",
    "46": "Manitoba",
    "35": "Ontario"
};
const abbrToFull = {
    "QC": "Quebec",
    "NL": "Newfoundland and Labrador",
    "BC": "British Columbia",
    "NU": "Nunavut",
    "NT": "Northwest Territories",
    "NB": "New Brunswick",
    "NS": "Nova Scotia",
    "SK": "Saskatchewan",
    "AB": "Alberta",
    "PE": "Prince Edward Island",
    "YT": "Yukon",
    "MB": "Manitoba",
    "ON": "Ontario"
};
const pruidToAbbr = {
    "24": "QC",
    "10": "NL",
    "59": "BC",
    "62": "NU",
    "61": "NT",
    "13": "NB",
    "12": "NS",
    "47": "SK",
    "48": "AB",
    "11": "PE",
    "60": "YT",
    "46": "MB",
    "35": "ON"
};

function csvToKeyValue(data, keyName, valueName) {
        let newData = {};
        for (let i of data) {
            newData[i[keyName]] = i[valueName]
        }
        return newData;
    }
    
function buildMap1(mapData, data, barData, markerData){
    barData.map(el => {
        el.cars = +el.cars;
        el.houses = +el.houses;
        el.pets = +el.pets;
    })
    
    let myMarkers = []
    let myMarkers2 = []
    
    let ting = markerData.objects.AllPoints4.geometries
    // myMarkers.push(ting[0])
    // myMarkers.push(ting[600])
    myMarkers = ting.slice(900)
    myMarkers2.push(ting[0])
    console.log('markers', myMarkers)
    
    let myMarkerData = myMarkers;
    
    function filterData(barData, value){
        return barData.filter(el => el.pt == value)
    }
    
    function passedFunction(value) {
        bar
            .data(filterData(barData, value))
            .graphTitle(pruidToFull[value])
            .updateGraph()
    }
    
    function callbackHover(value){
        //find the corresponding points to the province, and display them somewhere
        
        let filtered = myMarkerData.filter(el => el.properties.PT == pruidToAbbr[value]) 
        //Newfoundland doesn't filter as it's the incorrect abbreviation in the dataset
        let markerDrop = d3.select("#markerDrop")
        markerDrop.text("")
        markerDrop.selectAll("*").remove()
        
        //display marker information
        filtered.map(el => {
            markerDrop
                .append("div")
                
            markerDrop.append("h3").text(el.properties.Hospital_name)
            let ul = markerDrop.append("ul")
            ul.append("li").text(`Year: ${el.properties.Year}`)
            ul.append("li").text(`Total beds: ${el.properties.Total_beds_all}`)
            
        })
    }

    
    
    

    const map = new Map();
    // console.log(mapData)
    map.wrapper(d3.select('#mapWrapper'))
        .container(d3.select('#map'))
        .mapData(topojson.feature(mapData, mapData.objects.Can_PR2016))
        .data(data[0])
        .markerData(myMarkerData)
        .legendIntervals([10000, 100, 50, 10, 0])
        .legendPosition([720, 50])
        .legendTitleX(-100)
        .interactive(true)
        .displayValues(true)
        .tooltips(true)
        .notApplicable(true)
        // .percent(true)
        .suppressed(true)
        .canadaBubble(true)
        .decimalPlaces(1)
        .zoomable(true)
        // .SINotation(true)
        
        .numberSeperator(" ")
        
        .callbackClick(passedFunction)
        .callbackHover(callbackHover)
        
        .init()
        .render();
        
    const bar = new BarGraph();
    bar
        .wrapper(d3.select('#mapBarchartWrapper'))
        .container(d3.select('#mapBarchart'))
        .data(filterData(barData, "24"))
        .cSeries('region')
        .nSeries(['cars', 'houses', 'pets'])
        .graphTitle(pruidToFull["24"])
        // .grouped(true)
        // .interactive(true)
        .vertical(true)
        .barLabels(true)
        // .callbackHover(callbackHover)
        .margins([80,40,30,100])
        .init()
        .render();
    
    let toggle = true;
    
    d3.select("#updateMap").on("click", () => {
        if (toggle) {
            myMarkerData = myMarkers2;
            map
                .markerData(myMarkerData)
                .updateValues(data[1])
        }
        else {
            myMarkerData = myMarkers;
            map
                .markerData(myMarkerData)
                .updateValues(data[0])
        }
        toggle = !toggle
    })
}

function buildHrMap(mapData){
    let hrData = {1011: 6476, 1012: 2807, 1013: 7643, 1014: 2263, 1100: 7345, 1201: 2332, 1202: 2016, 1203: 499, 1204: 2522, 1301: 3072, 1302: 3959, 1303: 827, 1304: 5005, 1305: 2807, 1306: 9429, 1307: 5418, 2401: 9312, 2402: 8813, 2403: 3150, 2404: 3171, 2405: 3084, 2406: 1574, 2407: 9330, 2408: 5896, 2409: 5235, 2410: 4821, 2411: 1610, 2412: 8338, 2413: 832, 2414: 3828, 2415: 481, 2416: 8557, 2417: 5226, 2418: 4046, 3526: 5161, 3527: 7885, 3530: 1942, 3533: 5651, 3534: 134, 3535: 6212, 3536: 9995, 3537: 4864, 3538: 7899, 3539: 1782, 3540: 4750, 3541: 8201, 3542: 9662, 3543: 7213, 3544: 4503, 3546: 9923, 3547: 1417, 3549: 241, 3551: 2152, 3553: 3387, 3555: 3962, 3556: 2596, 3557: 1649, 3558: 9509, 3560: 5807, 3561: 385, 3562: 9696, 3563: 8576, 3565: 8112, 3566: 224, 3568: 6045, 3570: 9785, 3575: 2800, 3595: 5064, 4601: 6317, 4602: 3048, 4603: 9980, 4604: 7853, 4605: 4500, 4701: 9701, 4702: 7786, 4703: 2934, 4704: 3042, 4705: 195, 4706: 895, 4707: 4141, 4708: 7336, 4709: 9863, 4710: 2370, 4711: 3022, 4712: 728, 4713: 5422, 4831: 8334, 4832: 7705, 4833: 4939, 4834: 6661, 4835: 3155, 6001: 2890, 6101: 7833, 6201: 3225, 7001: 5464, 7002: 7195, 7003: 4649, 7004: 8818, 7005: 9210}
    let hrDataUpdate = {1011: 64760, 1012: 28070, 1013: 76430, 1014: 22630, 1100: 73450, 1201: 23320, 1202: 20160, 1203: 4990, 1204: 25220, 1301: 30720, 1302: 39590, 1303: 8270, 1304: 50050, 1305: 28070, 1306: 94290, 1307: 54180, 2401: 93120, 2402: 88130, 2403: 31500, 2404: 31710, 2405: 30840, 2406: 15740, 2407: 93300, 2408: 58960, 2409: 52350, 2410: 48210, 2411: 16100, 2412: 83380, 2413: 8320, 2414: 38280, 2415: 4810, 2416: 85570, 2417: 52260, 2418: 40460, 3526: 51610, 3527: 78850, 3530: 19420, 3533: 56510, 3534: 1340, 3535: 62120, 3536: 99950, 3537: 48640, 3538: 78990, 3539: 17820, 3540: 47500, 3541: 82010, 3542: 96620, 3543: 72130, 3544: 45030, 3546: 99230, 3547: 14170, 3549: 2410, 3551: 21520, 3553: 33870, 3555: 39620, 3556: 25960, 3557: 16490, 3558: 95090, 3560: 58070, 3561: 3850, 3562: 96960, 3563: 85760, 3565: 81120, 3566: 2240, 3568: 60450, 3570: 97850, 3575: 28000, 3595: 50640, 4601: 63170, 4602: 30480, 4603: 99800, 4604: 78530, 4605: 45000, 4701: 97010, 4702: 77860, 4703: 29340, 4704: 30420, 4705: 1950, 4706: 8950, 4707: 41410, 4708: 73360, 4709: 98630, 4710: 23700, 4711: 30220, 4712: 7280, 4713: 54220, 4831: 83340, 4832: 77050, 4833: 49390, 4834: 66610, 4835: 31550, 6001: 28900, 6101: 78330, 6201: 32250, 7001: 54640, 7002: 71950, 7003: 46490, 7004: 88180, 7005: 9210}

    const map = new Map();
    map.wrapper(d3.select('#hr-wrapper'))
        .container(d3.select('#hr-map'))
        .mapData(topojson.feature(mapData, mapData.objects.HR_BND_10022020))
        .data(hrData)
        // .legendIntervals([10000, 100, 50, 10])
        
        .interactive(true)
        // .displayValues(true)
        .tooltips(true)
        .zoomable(true)
        .regionId("HR_UID")
        .regionName("ENG_LABEL")
        .init()
        .render();
    let toggle = true;
    
    d3.select("#updateHr").on("click", () => {
        if (toggle) {
            map.updateValues(hrDataUpdate)
        }
        else {
            map.updateValues(hrData)
        }
        toggle = !toggle
    })
}

function buildMapWithGradient(mapData){
    let ptLookup = {
        "24": "QC",
        "10": "NL",
        "59": "BC",
        "62": "NU",
        "61": "NT",
        "13": "NB",
        "12": "NS",
        "47": "SK",
        "48": "AB",
        "11": "PE",
        "60": "YT",
        "46": "MB",
        "35": "ON"
    };
    
    let keyValue = { //key value pairs
        24: 7
        ,10: 15
        ,59: 6
        ,62: 1
        ,61: 0
        ,13: 9
        ,12: 5
        ,47: 8
        ,48: 10
        ,11: 10
        ,60: 3
        ,46: 4
        ,35: 10
    }
    
    const map = new Map();
    // console.log(mapData)
    map.wrapper(d3.select('#mapGradientWrapper'))
        .container(d3.select('#mapGradientContainer'))
        .mapData(topojson.feature(mapData, mapData.objects.Can_PR2016))
        .data(keyValue)
        .legendGradient(true)
        .percent(true)
        .legendTitleHeight(5)
        .legendTitleX(15)
        .legendRectangleWidth(150)
        .init()
        .render();
}

//Load Data
var dataFiles = [
    '/src/json/Can_PR2016.json', //0
    "./data/dummyPT.csv", //1
    '/src/json/health-regions-2022.json', //2
    "/src/json/ProvincesTerritories.json", //3
    "./data/dummy2.csv", //4
    "./data/mapBar.csv", //5
    "/Joelle/AllPoints4.json", //6
]
var promises = [];
dataFiles.forEach(function(url) {
    if (url.match(/.*\.csv$/gm)){
        promises.push(d3.csv(url))
    }
    else if (url.match(/.*\.json$/gm)){
        promises.push(d3.json(url))
    }
});
Promise.all(promises).then(function(values) {
    console.log('myData', values)
    // console.log("All points", values[6])
    
    let keyValue = { //key value pairs
        24: 7
        ,10: 1000
        ,59: 6
        ,62: 1
        ,61: 0
        ,13: 9
        ,12: 5
        ,47: 8
        ,48: 10
        ,11: 10
        ,60: 3
        ,46: 4
        ,35: 10
    }
    let updateData = { //key value pairs
        24: 70,
        10: 20,
        59: 60,
        62: 10,
        61: 5,
        13: 90,
        12: 50,
        47: 80,
        48: 10000,
        11: 105,
        60: 30,
        46: 40,
        35: 10100000
    }
    
    let formattedData = csvToKeyValue(values[1], "pt", "value")
    
    buildMap1(values[0], [formattedData, updateData], values[5], values[6])
    buildHrMap(values[2])
    
    buildMapWithGradient(values[0])
    
})
