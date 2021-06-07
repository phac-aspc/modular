function pruid2prov(pruid) {
	var pruid2provLookup = {
		99: "Repatriated Travellers",
		59: "British Columbia",
		48: "Alberta",
		47: "Saskatchewan",
		46: "Manitoba",
		35: "Ontario",
		24: "Quebec",
		10: "Newfoundland and Labrador",
		13: "New Brunswick",
		12: "Nova Scotia",
		11: "Prince Edward Island",
		61: "Northwest Territories",
		62: "Nunavut",
		60: "Yukon",
		99: "Repatriated",
		1: "Canada"
	}
	var pruid2provLookupFr = {
		99: "Voyageurs Rapatriés",
		59: "Colombie-Britannique",
		48: "Alberta",
		47: "Saskatchewan",
		46: "Manitoba",
		35: "Ontario",
		24: "Québec",
		10: "Terre-Neuve-et-Labrador",
		13: "Nouveau-Brunswick",
		12: "Nouvelle-Écosse",
		11: "Île-du-Prince-Édouard",
		61: "Territoires du Nord-Ouest",
		62: "Nunavut",
		60: "Yukon",
		99: "Rapatriés",
		1: "Canada"
	}

	if (language == "en") {
		return pruid2provLookup[pruid];
	}
	else {
		return pruid2provLookupFr[pruid];
	}
}

function enprov2frprov(enprov) {
	var pruid2provLookup = {
		"Repatriated Travellers": 99,
		"BC": 59,
		"Alberta": 48,
		"Saskatchewan": 47,
		"Manitoba": 46,
		"Ontario": 35,
		"Quebec": 24,
		"NL": 10,
		"New Brunswick": 13,
		"Nova Scotia": 12,
		"PEI": 11,
		"NWT": 61,
		"Nunavut": 62,
		"Yukon": 60,
		"Repatriated": 99,
		"Canada": 1
	}
	return pruid2prov(pruid2provLookup[enprov]);
}

var getParams2 = function(url) {
	var params = {};
	var parser = document.createElement('a');
	parser.href = url;
	var query = parser.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		params[pair[0]] = decodeURIComponent(pair[1]);
	}
	return params;
};

function getlength2(number) {
	return number.toString().length;
}


var COLOR_SCALE = {
	"6+": "#053361",
	"5-6": "#08519c",
	"4-5": "#3182bd",
	"3-4": "#6baed6",
	"2-3": "#bdd7e7",
	"1-2": "#eff3ff",
	"N/A": "lightgray"
};

let isIE2 = /*@cc_on!@*/ false || !!document.documentMode;
if (/Edge\/\d./i.test(navigator.userAgent))
	isIE2 = true;

var language = $('html').attr('lang');
// parse the date / time
var parseTime = d3.timeParse("%d-%m-%Y");
var locale;
var formatFR;
if (language == "en") {}
else {
	locale = {
		"dateTime": "%a %e %b %Y %X",
		"date": "%Y-%m-%d",
		"time": "%H:%M:%S",
		"periods": ["", ""],
		"days": ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
		"shortDays": ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
		"months": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
		"shortMonths": ["jan", "fév", "mar", "avr", "mai", "jui", "jul", "aoû", "sep", "oct", "nov", "déc"],
		"decimal": ",",
		"thousands": " ",
		"grouping": [3]
	}
	// create custom locale formatter for time from the given locale options
	d3.timeFormatDefaultLocale(locale);
	formatFR = d3.timeFormat("%d %B %Y");

	// create custom locale formatter for numbers from the given locale options
	var localeFormatter = d3.formatDefaultLocale(locale);
	var numberFormat = localeFormatter.format(",d");
}

var currentRegion2, currentDate2, indexDate2, timeData, timeData2, timeData3, timeData4, nestedData2, datesArray2;
var tempNums = { "1": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "24": 0, "35": 0, "46": 0, "47": 0, "48": 0, "59": 0, "60": 0, "61": 0, "62": 0, "99": 0 };
//Dropdown values
// let queryStringValues2 = getParams2(window.location.href);

// if (typeof(queryStringValues2.stat) != "undefined" && typeof(queryStringValues2.measure) != "undefined") {
// 	if ((queryStringValues2.stat == "num" && (queryStringValues2.measure == "total" || queryStringValues2.measure == "deaths" || queryStringValues2.measure == "recover" || queryStringValues2.measure == "tested")) || (queryStringValues2.stat == "rate" && (queryStringValues2.measure == "total" || queryStringValues2.measure == "deaths" || queryStringValues2.measure == "tested"))) {
// 		$("#dropdownType3").val(queryStringValues2.stat)
// 		$("#dropdownType1").val(queryStringValues2.measure)

// 		if ($('#dropdownType3').val() == "rate") {
// 			//$('#dropdownType1 option[value="deaths"]').css("display","none");
// 			$('#dropdownType1 option[value="recover"]').hide();
// 			$('#txtTotalMod').css('display', '');
// 		}
// 		else {
// 			//$('#dropdownType1 option[value="deaths"]').css("display",""); 
// 			$('#dropdownType1 option[value="recover"]').show();
// 			$('#txtTotalMod').css('display', 'none');
// 		}

// 	}
// }

var typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
var typeMod = $('#dropdownType3').val();
var txtTypeMod = $('#dropdownType3 option:selected').text();
var txtTypeCases = $('#dropdownType1 option:selected').text();
// var typeCasesSM = $('#dropdownType2').val();
// var txtTypeCasesSM = $('#dropdownType2 option:selected').text();

//Zoom values
var zoomK = "";

//Legend scale
var scale = 15000;
var scalePercent = 200;

var hrFRE = { "Canada": "Canada" };
var frenchJson;

var animateSwitch;
//Trendline//
// set the dimensions and margins of the graph
var margin = { top: 60, right: 15, bottom: 90, left: 54 },
	width = 292.5 - margin.left - margin.right,
	height = 250 - margin.top - margin.bottom;
// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);
// define the line
var trendline = d3.line()
	.defined(function(d) {
		if (d.value[0][typeCases] != null) {
			return true;
		}
		else {
			if (typeCases == "numrecover") {
				return false;
			}
			else {
				return true;
			}
		}
	})
	.x(function(d) { return x(parseTime(d.key)); })
	.y(function(d) { return y(d.value[0][typeCases]); });

const ordinalSuffixes2 = ['th', 'st', 'nd', 'rd'];

function ordinalSuffix(number) {
	const value = number % 100;
	return ordinalSuffixes2[(value - 20) % 10] || ordinalSuffixes2[value] || ordinalSuffixes2[0];
}


//Load Data
var csvfiles = [
    '/src/data/covidLive/covid19-updateTime.csv', //0
    '/src/data/covidLive/file_out_v5.csv', //1
    '/src/data/covidLive/covid19-healthregions-hruid.csv', //2
]
var promises = [];
csvfiles.forEach(function(url) {
    promises.push(d3.csv(url))
});
Promise.all(promises).then(function(values) {
	processData(values[0],values[1],values[2]);
}).then(function(){
    buildRegionsMap();
});

var dateField, data, find_HRUID;
function processData(dateField, data, find_HRUID) {

	// if (language == "en") {
	// 	document.getElementsByClassName("updateTime").innerHTML = dateField["columns"][0];
	// }
	// else {
	// 	document.getElementsByClassName("updateTime").innerHTML = (dateField["columns"][0]).replace(":", " h ");
	// }
	
	//reformat find_HRUID to make it useful
	var find_HRUID = d3.nest().key(function(d) { return d.Province }).sortKeys(d3.ascending)
		.key(function(d) { return d.health_region }).sortKeys(d3.ascending).object(find_HRUID);
	data.forEach(function(d) {
		d.numtotal = +d.cumulative_cases;
		d.numdeaths = +d.cumulative_deaths;
		d.numtoday = +d.cases;
		d.numdeathstoday = +d.deaths;
		// d.numtested = +d.numtested;
		// d.deathstoday = +d.deathstoday;
		d.numtotal_last14 = +d.numtotal_last14;
		d.numdeaths_last14 = +d.numdeaths_last14;
		d.numtotal_last7 = +d.numtotal_last7;
		d.numdeaths_last7 = +d.numdeaths_last7;
		// if (d.numrecover == "") {
		// 	d.numrecover = null;
		// }
		// else {
		// 	d.numrecover = +d.numrecover;
		// }
		// d.numrecover = +d.numrecover;
		// d.numtoday = +d.numtoday;
		// d.ratetested = +d.ratetested;
		// d.percentrecover = +d.percentrecover;
		// d.percentoday = +d.percentoday;
		if (d.health_region == "Not Reported") {
			return;
		}
		else {
			d.ratetotal = +d.cumulative_cases / find_HRUID[d.province][d.health_region][0].pop * 100000;
			d.ratedeaths = +d.cumulative_deaths / find_HRUID[d.province][d.health_region][0].pop * 100000;

			d.ratetoday = +d.cases / find_HRUID[d.province][d.health_region][0].pop * 100000;
			d.ratedeathstoday = +d.deaths / find_HRUID[d.province][d.health_region][0].pop * 100000;

			d.ratetotal_last14 = +d.numtotal_last14 / find_HRUID[d.province][d.health_region][0].pop * 100000;
			d.ratedeaths_last14 = +d.numdeaths_last14 / find_HRUID[d.province][d.health_region][0].pop * 100000;

			d.ratetotal_last7 = +d.numtotal_last7 / find_HRUID[d.province][d.health_region][0].pop * 100000;
			d.ratedeaths_last7 = +d.numdeaths_last7 / find_HRUID[d.province][d.health_region][0].pop * 100000;

			d.HRUID = find_HRUID[d.province][d.health_region][0].HR_UID;
		}
		//d.trend = timeData3[d.HRUID];
	});

	datesArray2 = [];
	timeData3 = d3.nest()
		.key(function(d) { return d.HRUID; }).sortKeys(d3.ascending)
		.key(function(d) { 
		if (datesArray2.indexOf(d.date_report) < 0) {
			datesArray2.push(d.date_report); 
		} 
		return d.date_report; 
			
		})
		.object(data);
	//Set current date to default (latest data)
	// if (typeCases == "numtoday") {
	// 	currentDate2 = datesArray2[datesArray2.length - 2];
	// }
	// else {
	currentDate2 = datesArray2[datesArray2.length - 1];
	// }

	data.forEach(function(d) {
		d.trend = timeData3[d.HRUID];
	})

	timeData4 = d3.nest()
		.key(function(d) { return d.HRUID; }).sortKeys(d3.ascending)
		.key(function(d) { return +parseTime(d.date_report); }).sortKeys(d3.ascending)
		.entries(data);

	if($("#dropdownType4").val()=="hr"){
		d3.selectAll(".txtCurrentDate").text(function() {
			let timeValue;
			if (language == "en") {
				timeValue = d3.timeFormat("%B")(parseTime(currentDate2)) + " " + d3.timeFormat("%e")(parseTime(currentDate2)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate2)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate2)))
			}
			else {
				timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate2));
			}
			d3.selectAll("#descText2").text(timeValue);
			return timeValue;
		})
	}

	d3.selectAll(".numArticle2").text(function() {
		let txtNumArticle;
		if (language == "en") {
			if ((typeCases == "numdeaths") || (typeCases == "ratedeaths")) {
				return "related to";
			}
			else if (typeCases == "numrecover") {
				return "from";
			}
			else if ((typeCases == "numtested") || (typeCases == "ratetested")) {
				return "for";
			}
			else {
				return "of";
			}
			return txtNumArticle;
		}
		else {
			if ((typeCases == "numtested") || (typeCases == "ratetested")) {
				txtNumArticle = "pour la";
			}
			else if ((typeCases == "numdeaths") || (typeCases == "ratedeaths")) {
				txtNumArticle = "liés à la";
			}
			else {
				txtNumArticle = "de la";
			}
			return txtNumArticle;
		}
	});

	nestedData2 = d3.nest()
		.key(function(d) { return d.HRUID; })
		.object(data);
}

function buildRegionsMap() {


	//d3.json('/src/json/Can_PR2016.json', function(mapJSON) {

	//Load JSON
	var jsonfiles = [
	    '/src/json/HealthRegionsMod.json' //0
	]
	var promises = [];
	jsonfiles.forEach(function(url) {
	    promises.push(d3.json(url))
	});
	Promise.all(promises).then(function(values) {
		buildRegionsMap2(values[0])
	}).then(function(){
	    // buildMap();
	});

	function buildRegionsMap2(mapJSON) {
		
		let active = d3.select(null);
		// mapJSON.objects.health_regions_with_bc_sk_ont_modifications.geometries.forEach(function(d,i){
		// 	hrFRE[d.properties.ENG_LABEL] = d.properties.FRE_LABEL
		// })

		function zoomed() {
			zoomK = +d3.event.transform.k;
			d3.select("#map2").select("svg").select("#mapGroup2").selectAll(".regions2 path").attr("stroke-width", 1 / d3.event.transform.k);
			// g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
			d3.select("#map2").select("svg").select("#mapGroup2").attr("transform", d3.event.transform); // updated for d3 v4
		}
	
		var zoom = d3.zoom()
			// no longer in d3 v4 - zoom initialises with zoomIdentity, so it's already at origin
			// .translate([0, 0]) 
			// .scale(1) 
			.scaleExtent([2, 8])
			.on("zoom", zoomed);

		function clicked(d, element) {
			if (active.node() === element.node()) {
				d3.select("#bgLegend2").style("display", "none")
				return reset();
			}
			d3.select("#bgLegend2").style("display", "")
			active.classed("activeRegion", false);
			active = element.classed("activeRegion", true);
			// -460, 700
			let svgWidth = d3.select("#map svg").node().getBoundingClientRect().width;
			let gWidth = d3.select("#map g").node().getBoundingClientRect().width;
			let translateWidth = (svgWidth - gWidth) / 2;
			var bounds = path.bounds(d),
				dx = bounds[1][0] - bounds[0][0],
				dy = bounds[1][1] - bounds[0][1],
				x = (bounds[0][0] + bounds[1][0]) / 2,
				y = (bounds[0][1] + bounds[1][1]) / 2,
				scale = Math.max(2, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
				translate = [width / 2 - scale * x, height / 2 - scale * y];

			d3.select("#map2").select("svg").transition()
				.duration(750)
				// .call(zoom.translate(translate).scale(scale).event); // not in d3 v4
				.call(zoom.transform, d3.zoomIdentity.translate(translate[0] + 230 + translateWidth, translate[1] + 350).scale(scale)); // updated for d3 v4
		}

		function reset() {
			active.classed("activeRegion", false);
			active = d3.select(null);

			d3.select("#map2").select("svg").transition()
				.duration(750)
				// .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
				.call(zoom.transform, d3.zoomIdentity); // updated for d3 v4
		}


		svg = d3.select('#map2')
			.append('svg')
			.attr("id", "svg")
			.attr('width', "100%")
			.attr('height', function(d) {
				if (isIE2) {
					return '750px';
				}
				else {}
			})
			.attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox", "0 0 730 650")
			.append("g");

		var healthregions = topojson.feature(mapJSON, mapJSON.objects.health_regions_with_bc_sk_ont_modifications);

		const projection = d3.geoIdentity(function(x, y) { return [x, -y]; })
			.reflectY(true).scale(0.00013).translate([-460, 700]);

		var path = d3.geoPath().projection(projection);

		var hrid = svg
			.append('g')
			.attr("id", "mapGroup2")
			.attr("transform", "translate(0,0)")
			.selectAll('g')
			.data(healthregions.features)
			.enter()

		hrid
			.append("g")
			.attr("class", "regions2")
			.style("transform", "translate(18.5px,-18.5px)rotate(2.9deg)")
			.attr("id", function(d) { return "g" + d.properties["HR_UID"] })
			.attr("tabindex", 0)
			.attr("data-taborder", function(d) {
				return d.properties.TABORDER;
			})
			.attr("focusable", "true")
			.on("keydown", function(d) {
				if (d3.event.keyCode == 32) {
					d3.event.preventDefault();
					clicked(d, d3.select(this))
				}
			})
			.on("keyup", function(d) {
				if (d3.event.keyCode == 9) {
					if (active.node() != null) {
						clicked(d, d3.select(this))
					}
				}
			})
			.on("click", function(d) {
				clicked(d, d3.select(this))
			})
			.append('path')
			.attr("id", function(d) {
				// FRE_LABEL
				// hrFRE[d.properties["ENG_LABEL"]] = d.properties["FRE_LABEL"];

				return "path" + d.properties["HR_UID"]
			})
			.attr("class", "HR_UID")
			.attr("d", path)
			.attr("stroke", "#828080")
			.attr("stroke-width", 1)
			//.on("click", clicked);

		const regionsCircles = d3.select("#mapGroup2").selectAll(".regions2")
			.append("g")
			.data(healthregions.features.filter(function(d) {
				return d.properties.PRUID;
			}))
			.attr("class", "regionValues2");

		//Append circle label backgrounds
		regionsCircles.append("circle")
			.attr("class", "regionValuesCircle2")
			.attr("r", function(d) {
				if (getlength2(timeData3[d.properties.PRUID][currentDate2][0][typeCases]) > 6) {
					return 32;
				}
				else if (getlength2(timeData3[d.properties.PRUID][currentDate2][0][typeCases]) > 5) {
					return 28;
				}
				else if (getlength2(timeData3[d.properties.PRUID][currentDate2][0][typeCases]) > 4) {
					return 26;
				}
				else {
					return 24;
				}
			})
			.attr("fill", "rgb(54, 54, 54)")
			.attr('transform', function(d, i) {
				// get the largest sub-polygon's coordinates
				let coord = d.geometry.coordinates;

				if (d.geometry.type == 'MultiPolygon') {
					const u = d3.scan(coord.map(function(p) {
						return -d3.polygonArea(p[0]);
					}));
					if (u == undefined) {
						coord = [coord];
					}
					else {
						coord = coord[u];
					}
				}
				const n = polylabel(coord, 0.01)
				if (d.properties.PRUID == 10) {
					// 			d3.select(this.parentNode.parentNode).raise();
				}
				return "translate(" + ((n[0] * (0.00013)) - 460) + "," + (+n[1] * (-0.00013) + 700) + ")";
			})

		//Add text to circle label backgrounds
		regionsCircles.append("text")
			.text(function(d) {
				if (language == "en") {
					return timeData3[d.properties.PRUID][currentDate2][0][typeCases];
				}
				else {
					return (d3.format("0.1f")(timeData3[d.properties.PRUID][currentDate2][0][typeCases])).replace(",", " ");
				}
			})
			.attr("transform", function(d) {
				return $("#g" + d.properties.PRUID + " .regionValues2 circle").attr("transform");
			})
			.attr("font-size", function() {
				if (typeCases == "numtested") {
					return "13px";
				}
				else {
					return "15px";
				};
			})
			.attr("fill", "white")
			.attr("class", "regionCircleText2")
			.style("text-anchor", "middle")
			.style("fill", "white")
			.transition()
			.duration(600)
			.tween("text", function(d) {
				const that = d3.select(this);
				let format;
				if (language == "en") {
					format = d3.format(",d");
					const i = d3.interpolateNumber(0, timeData3[d.properties.PRUID][currentDate2][0][typeCases]);
					return function(t) { that.text(format(i(t))); };
				}
				else {
					format = d3.format(",d");
					const i = d3.interpolateNumber(0, timeData3[d.properties.PRUID][currentDate2][0][typeCases]);
					return function(t) { that.text(format(i(t)).replace(",", " ")); };
				}
			})


		//Tweak positioning and size of text
		d3.selectAll('.regionCircleText2').each(function(d) {
			const currentTransform = $("#g" + d.properties.PRUID + " .regionValues2 circle").attr("transform");
			const transformVals = currentTransform.substring(currentTransform.indexOf("(") + 1, currentTransform.indexOf(")")).split(/[\s,]+/);
			let offsetsCircle;
			let offsetsLine;

			if (d.properties.PRUID == 13) {
				offsetsCircle = [0, 55];
				offsetsLine = [0, 33];
				$("#g" + d.properties.PRUID + " .regionValues2 circle").attr("transform", "translate(" + ((+transformVals[0]) + (+offsetsCircle[0])) + "," + ((+transformVals[1]) + (+offsetsCircle[1])) + ")");
				d3.select(this.parentNode).append("line")
					.attr("class", "regionDeathsLine")
					.attr("x1", (+transformVals[0]))
					.attr("y1", (+transformVals[1]))
					.attr("x2", ((+transformVals[0]) + (+offsetsLine[0])))
					.attr("y2", ((+transformVals[1]) + (+offsetsLine[1])))
					.attr("stroke-width", 2)
					.attr("stroke", "black")
			}
			else if (d.properties.PRUID == 12) {
				offsetsCircle = [55, 0];
				offsetsLine = [33, 0];
				$("#g" + d.properties.PRUID + " .regionValues2 circle").attr("transform", "translate(" + ((+transformVals[0]) + (+offsetsCircle[0])) + "," + ((+transformVals[1]) + (+offsetsCircle[1])) + ")");
				d3.select(this.parentNode).append("line")
					.attr("class", "regionDeathsLine")
					.attr("x1", (+transformVals[0]))
					.attr("y1", (+transformVals[1]))
					.attr("x2", ((+transformVals[0]) + (+offsetsLine[0])))
					.attr("y2", ((+transformVals[1]) + (+offsetsLine[1])))
					.attr("stroke-width", 2)
					.attr("stroke", "black")
			}
			else if (d.properties.PRUID == 11) {
				offsetsCircle = [55, -15];
				offsetsLine = [33, -15];
				$("#g" + d.properties.PRUID + " .regionValues2 circle").attr("transform", "translate(" + ((+transformVals[0]) + (+offsetsCircle[0])) + "," + ((+transformVals[1]) + (+offsetsCircle[1])) + ")");
				d3.select(this.parentNode).append("line")
					.attr("class", "regionDeathsLine")
					.attr("x1", (+transformVals[0]))
					.attr("y1", (+transformVals[1]))
					.attr("x2", ((+transformVals[0]) + (+offsetsLine[0])))
					.attr("y2", ((+transformVals[1]) + (+offsetsLine[1])))
					.attr("stroke-width", 2)
					.attr("stroke", "black")
				// 			d3.select(this.parentNode.parentNode).raise();
			}
			else {
				offsetsCircle = [0, 0];
				offsetsLine = [0, 0];
			}
			//const txtHeight = this.getBBox().height / 3; //Divide by three looks best
			const txtHeight = 0; //Divide by three looks best
			const txtWidth = this.getBBox().width; //Not used currently
			//Determine position
			d3.select(this).attr("transform", function() {
				return "translate(" + (+transformVals[0] + offsetsCircle[0]) + "," + ((+transformVals[1] + txtHeight + offsetsCircle[1]) + 6) + ")";
			})
		});

		//Repatriated Totals
		const repatriated = d3.select("#mapGroup2").datum(nestedData2[99][0]).append("g")
			.attr("id", "repatriated2")
			.attr("tabindex", 0)
			.attr("data-taborder", 15)
			.attr("focusable", true)
			.on("mouseover", function(d) {
				//Add
				// d3.select(this).raise();
				currentRegion2 = d3.select(this).data()[0];
				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

				var txtName;
				if (language == "en") {
					txtName = currentRegion2.health_region;
				}
				else {
					txtName = (currentRegion2.health_regionFR).toLowerCase();
				}
				d3.selectAll("#txtName").text(function() {
					return txtName;
				})
				// d3.select("#txtName#dropdownType6-txtName").text(pruid2prov(currentRegion2.HRUID.slice(0,2)))
				var txtTotal;
				if (timeData3[currentRegion2.HR_UID][currentDate2]) {
					txtTotal = timeData3[currentRegion2.HR_UID][currentDate2][0][typeCases];
				}
				else {
					txtTotal = 0;
				}
				d3.selectAll("#txtTotal").text(function() {
					if (language == "en") {
						return d3.format(",d")(txtTotal);
					}
					else {
						return (d3.format(",d")(txtTotal)).replace(",", " ");
					}
				});

				d3.selectAll(".txtCurrentDate").text(function() {
					let timeValue;
					if (language == "en") {
						timeValue = d3.timeFormat("%B")(parseTime(currentDate2)) + " " + d3.timeFormat("%e")(parseTime(currentDate2)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate2)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate2)))
					}
					else {
						timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate2));
					}
					d3.selectAll("#descText2").text(timeValue);
					return timeValue;
				})

				d3.select("#textArticle1").text(function() {
					if (language == "en") {
						return "among";
					}
					else {
						return "parmi les";
					}
				});

				updateTrend(currentRegion2.trend);
				$(".backgroundRepatriated2").attr("stroke", "#000000").attr("stroke-width", 2);
			})
			.on("mouseout", function(d) {
				//Add
				$(".backgroundRepatriated2").removeAttr("stroke");
				$(".backgroundRepatriated2").removeAttr("stroke-width");
			})
			.on("focus", function(d) {
				//Add
				unfocus();
				d3.select(this).classed("activeRegion", true);
				currentRegion2 = d3.select(this).data()[0];

				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

				var txtName;
				if (language == "en") {
					txtName = currentRegion2.prname;
				}
				else {
					txtName = (currentRegion2.prnameFR).toLowerCase();
				}
				d3.selectAll("#txtName").text(function() {
					return txtName;
				})
				// d3.select("#txtName#dropdownType6-txtName").text(pruid2prov(currentRegion2.HRUID.slice(0,2)))
				var txtTotal;
				if (timeData3[currentRegion2.HR_UID][currentDate2]) {
					txtTotal = timeData3[currentRegion2.HR_UID][currentDate2][0][typeCases];
				}
				else {
					txtTotal = 0;
				}
				d3.selectAll("#txtTotal").text(function() {
					if (language == "en") {
						return d3.format(",d")(txtTotal);
					}
					else {
						return (d3.format(",d")(txtTotal)).replace(",", " ");
					}
				});

				d3.selectAll(".txtCurrentDate").text(function() {
					let timeValue;
					if (language == "en") {
						timeValue = d3.timeFormat("%B")(parseTime(currentDate2)) + " " + d3.timeFormat("%e")(parseTime(currentDate2)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate2)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate2)))
					}
					else {
						timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate2));
					}
					d3.selectAll("#descText2").text(timeValue);
					return timeValue;
				})

				d3.select("#textArticle1").text(function() {
					if (language == "en") {
						return "among";
					}
					else {
						return "parmi les";
					}
				});

				updateTrend(currentRegion2.trend);
				$(".backgroundRepatriated2").attr("stroke", "#000000").attr("stroke-width", 2);
			})

		// repatriated.append("rect")
		// 	.attr("class", "backgroundRepatriated2")
		// 	.attr("x", 490)
		// 	.attr("y", 590)
		// 	.attr("width", 195)
		// 	.attr("height", 40)
		// 	.attr("fill", "none");

		// repatriated.append("text")
		// 	.attr("class", "textCanada2")
		// 	.text(function() {
		// 		if (language == "en") {
		// 			return "Repatriated Travellers";
		// 		}
		// 		else {
		// 			return "Voyageurs rapatriés"
		// 		}
		// 	})
		// 	.attr("x", 530)
		// 	.attr("y", 615)
		// 	.attr("font-size", "14px")
		// 	.attr("fill", "black");

		// repatriated.append("circle")
		// 	.attr("class", "circleRepatriated2")
		// 	.attr("cx", 510)
		// 	.attr("cy", 610)
		// 	.attr("r", 16)
		// 	.attr("fill", "rgb(54, 54, 54)");

		// repatriated.append("text")
		// 	.attr("class", "repatriatedTextValue2")
		// 	.text(function(d) {
		// 		typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
		// 		return timeData3[99][currentDate2][0][typeCases];
		// 	})
		// 	.attr("x", 510)
		// 	.attr("y", 615)
		// 	.attr("font-size", "14px")
		// 	.style("text-anchor", "middle")
		// 	.style("fill", "white")
		// 	.transition()
		// 	.duration(600)
		// 	.tween("text", function(d) {
		// 		const that = d3.select(this);
		// 		let format;
		// 		typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
		// 		if (language == "en") {
		// 			format = d3.format(",d");
		// 			const i = d3.interpolateNumber(0, timeData3[99][currentDate2][0][typeCases]);
		// 			return function(t) { that.text(format(i(t))); };
		// 		}
		// 		else {
		// 			format = d3.format(",d");
		// 			const i = d3.interpolateNumber(0, timeData3[99][currentDate2][0][typeCases]);
		// 			return function(t) { that.text(format(i(t)).replace(",", " ")); };
		// 		}
		// 	})

		//Add Canada2 Totals
		const mapCanada = d3.select("#mapGroup2").datum(nestedData2[1][0]).append("g")
			.attr("id", "Canada2")
			.attr("tabindex", 0)
			.attr("data-taborder", 1)
			.attr("focusable", "true")
			.on("mouseover", function(d) {
				//  d3.select(this).raise();
				currentRegion2 = d3.select(this).data()[0];
				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

				var txtName;
				
					txtName = currentRegion2.health_region;
				
				d3.selectAll("#txtName").text(function() {
					return txtName;
				})

				// d3.select("#txtName#dropdownType6-txtName").text(pruid2prov(currentRegion2.HRUID.slice(0,2)))
				var txtTotal;
				if (timeData3[currentRegion2.HR_UID][currentDate2]) {
					txtTotal = timeData3[currentRegion2.HR_UID][currentDate2][0][typeCases];
				}
				else {
					txtTotal = 0;
				}
				d3.selectAll("#txtTotal").text(function() {
					if (language == "en") {
						return d3.format(",d")(txtTotal);
					}
					else {
						return (d3.format(",d")(txtTotal)).replace(",", " ");
					}
				});

				d3.selectAll(".txtCurrentDate").text(function() {
					let timeValue;
					if (language == "en") {
						timeValue = d3.timeFormat("%B")(parseTime(currentDate2)) + " " + d3.timeFormat("%e")(parseTime(currentDate2)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate2)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate2)))
					}
					else {
						timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate2));
					}
					d3.selectAll("#descText2").text(timeValue);
					return timeValue;
				})

				d3.select("#textArticle1").text(function() {
					if (language == "en") {
						return "in";
					}
					else {
						return "au";
					}
				});

				updateTrend(currentRegion2.trend);
				$(".backgroundCanada2").attr("stroke", "#000000").attr("stroke-width", 2);
			})
			.on("mouseout", function(d) {
				$(".backgroundCanada2").removeAttr("stroke");
				$(".backgroundCanada2").removeAttr("stroke-width");
			})
			.on("focus", function(d) {
				unfocus();
				d3.select(this).classed("activeRegion", true);
				currentRegion2 = d3.select(this).data()[0];
				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

				var txtName;
				
					txtName = currentRegion2.health_region;
				d3.selectAll("#txtName").text(function() {
					return txtName;
				})

				// d3.select("#txtName#dropdownType6-txtName").text(pruid2prov(currentRegion2.HRUID.slice(0,2)))
				var txtTotal;
				if (timeData3[currentRegion2.HR_UID][currentDate2]) {
					// Scott HR Canada
					txtTotal = timeData[currentRegion2.HR_UID][currentDate][0][typeCases];
					// txtTotal = timeData3[currentRegion2.HR_UID][currentDate2][0][typeCases];
				
				}
				else {
					txtTotal = 0;
				}
				d3.selectAll("#txtTotal").text(function() {
					if (language == "en") {
						return d3.format(",d")(txtTotal);
					}
					else {
						return (d3.format(",d")(txtTotal)).replace(",", " ");
					}
				});

				d3.selectAll(".txtCurrentDate").text(function() {
					let timeValue;
					if (language == "en") {
						timeValue = d3.timeFormat("%B")(parseTime(currentDate2)) + " " + d3.timeFormat("%e")(parseTime(currentDate2)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate2)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate2)))
					}
					else {
						timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate2));
					}
					d3.selectAll("#descText2").text(timeValue);
					return timeValue;
				})

				d3.select("#textArticle1").text(function() {
					if (language == "en") {
						return "in";
					}
					else {
						return "au";
					}
				});

				updateTrend(currentRegion2.trend);
				$(".backgroundCanada2").attr("stroke", "#000000").attr("stroke-width", 2);
			})

		mapCanada.append("rect")
			.attr("class", "backgroundCanada2")
			.attr("x", 40)
			.attr("y", 33)
			.attr("width", 180)
			.attr("height", 82)
			.attr("fill", "none");

		mapCanada.append("text")
			.attr("class", "textCanada2")
			.text("Canada")
			.attr("x", 44)
			.attr("y", 80)
			.attr("font-size", "24px")
			.attr("fill", "black");

		mapCanada.append("circle")
			.attr("class", "circleCanada2")
			.attr("cx", 175)
			.attr("cy", 74)
			.attr("r", 35)
			.attr("fill", "rgb(54, 54, 54)");

		mapCanada.append("text")
			.attr("class", "CanadaTextValue2")
			.text(function(d) {
				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
				// Scott HR Canada
				return timeData[1][currentDate][0][typeCases];
				// return timeData3[1][currentDate2][0][typeCases];
			})
			.attr("x", 175)
			.attr("y", 79)
			.attr("font-size", "15px")
			.style("text-anchor", "middle")
			.style("fill", "white")
			.transition()
			.duration(600)

			.tween("text", function(d) {
				const that = d3.select(this);
				let format;
				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
				if (language == "en") {
					format = d3.format(",d");
					// Scott HR Canada
					const i = d3.interpolateNumber(0, timeData[1][currentDate][0][typeCases]);
					// const i = d3.interpolateNumber(0, timeData3[1][currentDate2][0][typeCases]);
					return function(t) { that.text(format(i(t))); };
				}
				else {
					format = d3.format(",d");
					// Scott HR Canada
					const i = d3.interpolateNumber(0, timeData[1][currentDate][0][typeCases]);
					// const i = d3.interpolateNumber(0, timeData3[1][currentDate2][0][typeCases]);
					return function(t) { that.text(format(i(t)).replace(",", " ")); };
				}
			})

		//Set default DOM order
		var domNodeList = d3.selectAll("#mapGroup2 > g").nodes().sort(function(a, b) {
			var aNode = +d3.select(a).attr("data-taborder");
			var bNode = +d3.select(b).attr("data-taborder");
			return aNode - bNode;
		})
		d3.selectAll(domNodeList).order();

		//Set defaults

		// let queryStringValues2 = getParams2(window.location.href);

		// if (typeof(queryStringValues2.stat) != "undefined" && typeof(queryStringValues2.measure) != "undefined") {
		// 	if ((queryStringValues2.stat == "num" && (queryStringValues2.measure == "total" || queryStringValues2.measure == "deaths" || queryStringValues2.measure == "recover" || queryStringValues2.measure == "tested")) || (queryStringValues2.stat == "rate" && (queryStringValues2.measure == "total" || queryStringValues2.measure == "deaths" || queryStringValues2.measure == "tested"))) {
		// 		$("#dropdownType3").val(queryStringValues2.stat)
		// 		$("#dropdownType1").val(queryStringValues2.measure)

		// 		if ($('#dropdownType3').val() == "rate") {
		// 			//$('#dropdownType1 option[value="deaths"]').css("display","none");
		// 			$('#dropdownType1 option[value="recover"]').css("display", "none");
		// 			$('#txtTotalMod').css('display', '');
		// 		}
		// 		else {
		// 			//$('#dropdownType1 option[value="deaths"]').css("display",""); 
		// 			$('#dropdownType1 option[value="recover"]').css("display", "");
		// 			$('#txtTotalMod').css('display', 'none');
		// 		}
		// 		indexDate2 = 1;
		// 		while (isNaN(timeData3[1][currentDate2][0][typeCases]) || timeData3[1][currentDate2][0][typeCases] == 0) {
		// 			currentDate2 = datesArray2[datesArray2.length - indexDate2];
		// 			indexDate2 += 1;
		// 		}

		// 		typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
		// 	}
		// }
		// else
		// 	typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

		typeMod = $('#dropdownType3').val();
		typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
		txtTypeCases = $('#dropdownType1 option:selected').text();
		txtTypeMod = $('#dropdownType3 option:selected').text();

		$(".txtType").text(txtTypeCases.toLowerCase());
		$(".txtTypeMod").text(txtTypeMod.toLowerCase());

		if (typeCases == "ratetested") {
			if (language == "en") {
				$('#txtTotalMod').text("per 1,000,000 population");
			}
			else {
				$('#txtTotalMod').text("par 1 000 000 population");
			}
		}
		else {
			if (language == "en") {
				$('#txtTotalMod').text("per 100,000 population");
			}
			else {
				$('#txtTotalMod').text("par 100 000 population");
			}
		}

		//Add/Remove bottom legend note
		//JULY 17 NUMRECOVER
		// if (typeCases == "numtotal" || typeCases == "numconf" || typeCases == "numprob" || typeCases == "numtoday" || typeCases == "numrecover") {
		// 	d3.select(".bottomLeg text").style("display", "inline");
		// }

		d3.selectAll('.categoryLegend2').selectAll("text").remove();

		var gap = 5;
		var squareSize = 13;
		var topMargin = 5;
		d3.selectAll('.categoryLegend2')
			.append('text')
			.attr("class", "legend-text2")
			.style("font-size", "15px")
			.attr("x", function(d, i) {
				return 675
			})
			.attr("y", function(d, i) {
				return (squareSize + gap) * i + squareSize / 2 + topMargin + 12;
			})
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d, i) {
				return updateLegendText(d, i);
			});
		d3.select("#legendTitle2").remove()
		d3.select("#legend2")
			.append("text")
			.attr("x", 550)
			.attr("font-size", "15px")
			.attr("font-weight", "bold")
			.attr("id", "legendTitle2")
			.attr("y", topMargin - 30)
			.text(function() {
				if (language == "en") {
					if (typeCases == "numdeaths" || typeCases == "numdeaths_last14" || typeCases == "numdeaths_last7") {
						return "Count of " + txtTypeCases.toLowerCase() + " related to COVID-19";
					}
					else if (typeCases == "numrecover") {
						return "Count of " + txtTypeCases.toLowerCase() + " from COVID-19";
					}
					else if (typeCases == "numtested") {
						return "Count of " + txtTypeCases.toLowerCase() + " for COVID-19";
					}
					else if (typeCases == "numtotal" || typeCases == "numactive" || typeCases == "numtotal_last14" || typeCases == "numtotal_last7") {
						return "Count of " + txtTypeCases.toLowerCase() + " of COVID-19";
					}
					else if (typeCases == "ratedeaths" || typeCases == "ratedeaths_last14") {
						return "Rate of " + txtTypeCases.toLowerCase() + " related to COVID-19 per 100,000 population"
					}
					else if (typeCases == "ratetested") {
						return "Rate of " + txtTypeCases.toLowerCase() + " for COVID-19 per 1,000,000 population"
					}
					else {
						return "Rate of " + txtTypeCases.toLowerCase() + " of COVID-19 per 100,000 population";
					}
				}
				else {
					if (typeCases == "numdeaths" || typeCases == "numdeaths_last14" || typeCases == "numdeaths_last7") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " liés à la COVID-19";
					}
					else if (typeCases == "numrecover") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " de la COVID-19";
					}
					else if (typeCases == "numtested") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " pour la COVID-19";
					}
					else if (typeCases == "numtotal" || typeCases == "numactive" || typeCases == "numtotal_last14" || typeCases == "numtotal_last7") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " de la COVID-19";
					}
					else if (typeCases == "ratedeaths" || typeCases == "ratedeaths_last14") {
						return "Taux de " + txtTypeCases.toLowerCase() + " liés à la COVID-19 par 100 000 population"
					}
					else if (typeCases == "ratetested") {
						return "Taux de " + txtTypeCases.toLowerCase() + " pour la COVID-19 par 1 000 000 population"
					}
					else {
						return "Taux de " + txtTypeCases.toLowerCase() + " de la COVID-19 par 100 000 population";
					}
				}
			}).call(wrap, 250)

		d3.selectAll(".numArticle2").text(function() {
			let txtNumArticle;
			if (language == "en") {
				if ((typeCases == "numdeaths") || (typeCases == "ratedeaths")) {
					return "related to";
				}
				else if (typeCases == "numrecover") {
					return "from";
				}
				else if ((typeCases == "numtested") || (typeCases == "ratetested")) {
					return "for";
				}
				else {
					return "of";
				}
				return txtNumArticle;
			}
			else {
				if ((typeCases == "numtested") || (typeCases == "ratetested")) {
					txtNumArticle = "pour la";
				}
				else if ((typeCases == "numdeaths") || (typeCases == "ratedeaths")) {
					txtNumArticle = "liés à la";
				}
				else {
					txtNumArticle = "de la";
				}
				return txtNumArticle;
			}
		})

		currentRegion2 = d3.select("#Canada2").data()[0];

		if ($("#dropdownType4").val() == "hr") {
			// Scott HR Canada
			d3.selectAll("#txtTotal").text(d3.format(",d")(timeData[1][currentDate][0][typeCases]));
			// d3.selectAll("#txtTotal").text(d3.format(",d")(timeData3[1][currentDate2][0][typeCases]));
		}

		//Finish initial load    
		drawLegend(timeData4);
		colorMap();
		drawTrend();
		// if($("#dropdownType4").val() == "hr"){
		// 	initializeBar(timeData3,currentDate);
		// }

		// queryStringValues = getParams(window.location.href);
		// if (queryStringValues.f) {
		// 	if (queryStringValues.f != "true") {
		// 		if (window.innerWidth >= 991) {
		// 			$(".fullscreen").click();
		// 		}
		// 	}
		// }

		if($("#dropdownType4").val()=="hr"){
			d3.selectAll(".txtCurrentDate").text(function() {
				let timeValue;
				if (language == "en") {
					timeValue = d3.timeFormat("%B")(parseTime(currentDate2)) + " " + d3.timeFormat("%e")(parseTime(currentDate2)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate2)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate2)))
				}
				else {
					timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate2));
				}
				d3.selectAll("#descText2").text(timeValue);
				return timeValue;
			})
		}

		d3.select("#mapGroup2")
			.selectAll(".regions2")
			.on("mouseover", function(d) {
				//Styling
				// d3.select(this).raise();
			d3.select(this).select("path").attr("stroke", "black").attr("stroke-width",function(){					
				return +d3.select(this).attr("stroke-width")*3;
			});

				//Do things with data
				currentRegion2 = d3.select(this).data()[0];
				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

				var txtName;
				if (language == "en") {
					txtName = currentRegion2.properties.ENG_LABEL;
				}
				else {
					txtName = currentRegion2.properties.FRE_LABEL;
				}
				d3.selectAll("#txtName").text(function() {
					return txtName;
				})
				let hruid = currentRegion2.properties.HR_UID.slice(0, 2);
				if (hruid == "70")
					hruid = "59";
				// d3.select("#txtName#dropdownType6-txtName").text(pruid2prov(hruid))

				var txtTotal;
				if (timeData3[currentRegion2.properties.HR_UID]) {
					if (timeData3[currentRegion2.properties.HR_UID][currentDate2]) {
						txtTotal = timeData3[currentRegion2.properties.HR_UID][currentDate2][0][typeCases];
					}
				}
				else {
					txtTotal = 0;
				}

				if ($("dropdownType4").val() == "hr") {

					d3.selectAll("#txtTotal").text(function() {
						if (language == "en") {
							/* if(currentRegion2.properties.PRUID == "62" && typeCases == "numtotal")
								return d3.format(",d")(txtTotal) + "*"; */
							return d3.format(",d")(txtTotal);
						}
						else {
							/* if(currentRegion2.properties.PRUID == "62" && typeCases == "numtotal")
								return (d3.format(",d")(txtTotal)).replace(",", " ") + "*"; */
							return (d3.format(",d")(txtTotal)).replace(",", " ");
						}
					});
				}

				d3.selectAll(".txtCurrentDate").text(function() {
					let timeValue;
					if (language == "en") {
						timeValue = d3.timeFormat("%B")(parseTime(currentDate2)) + " " + d3.timeFormat("%e")(parseTime(currentDate2)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate2)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate2)))
					}
					else {
						timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate2));
					}
					d3.selectAll("#descText2").text(timeValue);
					return timeValue;
				})

				d3.select("#textArticle1").text(function() {
					if (language == "en") {
						return "in";
					}
					else {
						if (currentRegion2.properties.PRUID == 10) {
							return " à ";
						}
						else if (currentRegion2.properties.PRUID == 11) {
							return " à l'";
						}
						else if ((currentRegion2.properties.PRUID == 12) || (currentRegion2.properties.PRUID == 35) || (currentRegion2.properties.PRUID == 47) || (currentRegion2.properties.PRUID == 48) || (currentRegion2.properties.PRUID == 59)) {
							return " en ";
						}
						else if ((currentRegion2.properties.PRUID == 13) || (currentRegion2.properties.PRUID == 24) || (currentRegion2.properties.PRUID == 46) || (currentRegion2.properties.PRUID == 60) || (currentRegion2.properties.PRUID == 62)) {
							return " au ";
						}
						else if (currentRegion2.properties.PRUID == 61) {
							return " aux ";
						}
						return "au";
					}
				});

				updateTrend();
			})
			.on("mouseout", function(d) {
				//Styling
				d3.select(this).select("path").attr("stroke", "#828080").attr("stroke-width", function() {
					if(isFinite(zoomK)){
						return 1/zoomK;
					}else{
						return 1;
					}
				});
			})
			.on("focus", function(d) {
				unfocus();
				//Styling
				d3.select(this).classed("activeRegion", true);
				d3.select(this).select("path").attr("stroke", "black").attr("stroke-width", function() {
					if(isFinite(zoomK)){
						return 3/zoomK;
					}else{
						return 3;
					}
				});
				//Do things with data
				currentRegion2 = d3.select(this).data()[0];
				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

				var txtName;
				if (language == "en") {
					txtName = d.properties.ENG_LABEL;
				}
				else {
					txtName = d.properties.FRE_LABEL;
				}
				d3.selectAll("#txtName").text(function() {
					return txtName;
				})
				let hruid = currentRegion2.properties.HR_UID.slice(0, 2);
				if (hruid == "70")
					hruid = "59";
				// d3.select("#txtName#dropdownType6-txtName").text(pruid2prov(hruid))
				var txtTotal;
				if (timeData3[currentRegion2.properties.HR_UID][currentDate2]) {
					txtTotal = timeData3[currentRegion2.properties.HR_UID][currentDate2][0][typeCases];
				}
				else {
					txtTotal = 0;
				}
				d3.selectAll("#txtTotal").text(function() {
					if (language == "en") {
						/* if(currentRegion2.properties.PRUID == "62" && typeCases == "numtotal")
							return d3.format(",d")(txtTotal) + "*"; */
						return d3.format(",d")(txtTotal);
					}
					else {
						/* if(currentRegion2.properties.PRUID == "62" && typeCases == "numtotal")
							return (d3.format(",d")(txtTotal)).replace(",", " ") + "*"; */
						return (d3.format(",d")(txtTotal)).replace(",", " ");
					}
				});

				d3.selectAll(".txtCurrentDate").text(function() {
					let timeValue;
					if (language == "en") {
						timeValue = d3.timeFormat("%B")(parseTime(currentDate2)) + " " + d3.timeFormat("%e")(parseTime(currentDate2)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate2)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate2)))
					}
					else {
						timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate2));
					}
					d3.selectAll("#descText2").text(timeValue);
					return timeValue;
				})

				d3.select("#textArticle1").text(function() {
					if (language == "en") {
						return "in";
					}
					else {
						if (currentRegion2.properties.PRUID == 10) {
							return " à ";
						}
						else if (currentRegion2.properties.PRUID == 11) {
							return " à l'";
						}
						else if ((currentRegion2.properties.PRUID == 12) || (currentRegion2.properties.PRUID == 35) || (currentRegion2.properties.PRUID == 47) || (currentRegion2.properties.PRUID == 48) || (currentRegion2.properties.PRUID == 59)) {
							return " en ";
						}
						else if ((currentRegion2.properties.PRUID == 13) || (currentRegion2.properties.PRUID == 24) || (currentRegion2.properties.PRUID == 46) || (currentRegion2.properties.PRUID == 60) || (currentRegion2.properties.PRUID == 62)) {
							return " au ";
						}
						else if (currentRegion2.properties.PRUID == 61) {
							return " aux ";
						}
						return "au";
					}
				});

				updateTrend();
			})
	};

	d3.select("#animateMap").on("focus", function() {
		unfocus();
	});

function unfocus() {
	var activeRegion = d3.select(".activeRegion");
	activeRegion.select("path").attr("stroke", "#828080").attr("stroke-width", function() {
				if(isFinite(zoomK)){
					return 1/zoomK;
				}else{
					return 1;
				}
	});
	activeRegion.classed("activeRegion", false);
	d3.select("#Canada2").select("rect").attr("stroke", "");
	d3.select("#Canada2").select("rect").attr("stroke-width", "");
	d3.select("#repatriated2").select("rect").attr("stroke", "");
	d3.select("#repatriated2").select("rect").attr("stroke-width", "");
}

	var index = 0;
	var mapLoop;

	function animateMap2() {

		//use array of years to loop through data for each PT
		mapLoop = setTimeout(function() {
			currentDate = datesArray[index];
			currentDate2 = datesArray2[index];

			typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

			d3.selectAll(".txtCurrentDate").text(function() {
				let timeValue;
				if (language == "en") {
					timeValue = d3.timeFormat("%B")(parseTime(currentDate2)) + " " + d3.timeFormat("%e")(parseTime(currentDate2)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate2)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate2)))
				}
				else {
					timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate2));
				}
				d3.selectAll("#descText2").text(timeValue);
				return timeValue;
			})

			//Transition Styles
			d3.selectAll(".regions2 path").transition().duration(600).style("fill", function(d) {
				if (timeData3[d.properties.HR_UID]) {
					if (timeData3[d.properties.HR_UID][currentDate2]) {
						if (typeCases == "percentoday") {
							return color(timeData3[d.properties.HR_UID][currentDate2][0][typeCases] * 100);
						}
						else {
							return color(timeData3[d.properties.HR_UID][currentDate2][0][typeCases]);
						}

					}
				}
				else {
					return COLOR_SCALE["N/A"];
				}
			});

			//Transition Numbers

			d3.selectAll('.regionCircleText2').each(function(d) {
				d3.select(this).transition().duration(600).tween("text", function() {
					const that = d3.select(this);
					let currentVal = +that.text().replace(/,/g, "").replace(/ /g, "");
					let currentPT = d.properties.HR_UID;
					let newVal;
					let percentSign = "";
					if (timeData3[d.properties.HR_UID][currentDate2]) {
						if (typeCases == "percentoday") {
							newVal = timeData3[d.properties.HR_UID][currentDate2][0][typeCases] * 100;
							if (language == "en") {
								percentSign = "$";
							}
							else {
								percentSign = " $";
							}
						}
						else {
							newVal = timeData3[d.properties.HR_UID][currentDate2][0][typeCases];
						}
					}
					else {
						if (index == 1) {
							newVal = 0;
						}
						else {
							newVal == currentVal;
						}
					}
					let format;
					if (!isNaN(+newVal)) {
						format = d3.format(",d");
						d3.select(this.parentNode).classed("visible", true);
						d3.select(this.parentNode).classed("invisible", false);
						if (isNaN(+currentVal)) {
							d3.select(this.parentNode).attr("fill-opacity", 0).transition().duration(500).attr("fill-opacity", 1);
							currentVal = 0;
						}
						const i = d3.interpolateNumber(currentVal, +newVal);
						return function(t) { that.text(format(i(t))); };
					}
				});
			});

			d3.select('.CanadaTextValue2').each(function(d) {
				d3.select(this).transition().duration(600).tween("text", function() {
					const that = d3.select(this);
					let format;
					let i;
					let newVal;
					if (typeCases == "percentoday") {
						// Scott HR Canada
						newVal = timeData[1][currentDate][0][typeCases] * 100;
						// newVal = timeData3[1][currentDate2][0][typeCases] * 100;
					}
					else {
						// Scott HR Canada
						newVal = timeData[1][currentDate][0][typeCases];
						// newVal = timeData3[1][currentDate2][0][typeCases];
					}
					format = d3.format(",d");
					if (language == "en") {
						i = d3.interpolateNumber(that.text().replace(/,/g, ""), newVal);
						return function(t) { that.text(format(i(t))); };
					}
					else {
						i = d3.interpolateNumber(that.text().replace(/ /g, ""), newVal);
						return function(t) { that.text(format(i(t))); };
					}
				});
			});

			// d3.select('.repatriatedTextValue2').each(function(d) {
			// 	d3.select(this).transition().duration(600).tween("text", function() {
			// 		const that = d3.select(this);
			// 		let format;
			// 		let i;
			// 		let newVal;
			// 		if (timeData3[99][currentDate2]) {
			// 			if (typeCases == "percentoday") {
			// 				newVal = timeData3[99][currentDate2][0][typeCases] * 100;
			// 			}
			// 			else {
			// 				newVal = timeData3[99][currentDate2][0][typeCases];
			// 			}
			// 		}
			// 		else {
			// 			newVal = 0;
			// 		}
			// 		format = d3.format(",d");
			// 		if (language == "en") {
			// 			i = d3.interpolateNumber(that.text().replace(/,/g, ""), newVal);
			// 			return function(t) { that.text(format(i(t))); };
			// 		}
			// 		else {
			// 			i = d3.interpolateNumber(that.text(), newVal);
			// 			return function(t) { that.text(format(i(t)).replace(",", " ")); };
			// 		}
			// 	});
			// });

			d3.selectAll('.regionCircleText2, .CanadaTextValue2, repatriatedTextValue2').attr("font-size", function() {
				if (typeCases == "numtested") {
					return "13px";
				}
				else {
					return "15px";
				};
			});

			if (animateSwitch == 0) {
				d3.select("#animateMap").classed("btn-info", true);
				d3.select("#animateMap").classed("btn-success", false);
				d3.select("#animateMap").classed("off", true);
				d3.select("#animateMap").classed("on", false);
				d3.select("#animateMap").html('<i class="fa fa-play" aria-hidden="true"></i> Play');
			}
			else if (index == (datesArray.length - 1) || (index == (datesArray.length - 2) && typeCases == "numtoday")) {
				updateTrend();
				index = 0;
				d3.select("#animateMap").classed("btn-info", true);
				d3.select("#animateMap").classed("btn-success", false);
				d3.select("#animateMap").classed("off", true);
				d3.select("#animateMap").classed("on", false);
				d3.select("#animateMap").html('<i class="fa fa-play" aria-hidden="true"></i> Play');
				animateSwitch = 0;
				// $("#dataTable2").DataTable().destroy();
				createTable();
				return;
			}
			else {
				index++;
				// $("#dataTable2").DataTable().destroy();
				createTable();
				animateMap2();
				updateTrend();
			}
		}, 600)
	}

	$("#animateMap").on("click", function() {
		if ($("#dropdownType4").val() == "hr") {
			if (d3.select(this).classed("off")) {
				d3.select(this).classed("btn-info", false);
				d3.select(this).classed("btn-success", true);
				d3.select(this).classed("off", false);
				d3.select(this).classed("on", true);
				d3.select(this).html('<i class="fa fa-pause" aria-hidden="true"></i> Pause');
				animateSwitch = 1;
				tempNums = { "1": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "24": 0, "35": 0, "46": 0, "47": 0, "48": 0, "59": 0, "60": 0, "61": 0, "62": 0, "99": 0 };
				animateMap2();
			}
			else {
				d3.select(this).classed("btn-info", true);
				d3.select(this).classed("btn-success", false);
				d3.select(this).classed("off", true);
				d3.select(this).classed("on", false);
				d3.select(this).html('<i class="fa fa-play" aria-hidden="true"></i> Play');
				animateSwitch = 0;
			}
		}
	});

	$("#dropdownType4").on("change", function() {
		clearTimeout(mapLoop)

		if (animateSwitch == 1) {

			d3.select("#animateMap").classed("btn-info", true);
			d3.select("#animateMap").classed("btn-success", false);
			d3.select("#animateMap").classed("off", true);
			d3.select("#animateMap").classed("on", false);
			d3.select("#animateMap").html('<i class="fa fa-play" aria-hidden="true"></i> Play');
			animateSwitch = 0;
			createTable();
			index = 0;
		}
		if ($("#dropdownType4").val() == "hr") {
			// $("#dataTable2").DataTable().destroy()

			currentRegion2 = d3.select("#Canada2").data()[0];
			typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

			var txtName;
			if (language == "en") {
				txtName = currentRegion2.health_region;
			}
			else {
				txtName = currentRegion2.health_regionFR;
			}
			d3.selectAll("#txtName").text(function() {
				return txtName;
			})

			// d3.select("#txtName#dropdownType6-txtName").text(pruid2prov(currentRegion2.HRUID.slice(0,2)))
			var txtTotal;
			if (timeData3[currentRegion2.HR_UID][currentDate2]) {
				txtTotal = timeData3[currentRegion2.HR_UID][currentDate2][0][typeCases];
			}
			else {
				txtTotal = 0;
			}
			d3.selectAll("#txtTotal").text(function() {
				if (language == "en") {
					return d3.format(",d")(txtTotal);
				}
				else {
					return (d3.format(",d")(txtTotal)).replace(",", " ");
				}
			});

			d3.selectAll(".txtCurrentDate").text(function() {
				let timeValue;
				if (language == "en") {
					timeValue = d3.timeFormat("%B")(parseTime(currentDate2)) + " " + d3.timeFormat("%e")(parseTime(currentDate2)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate2)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate2)))
				}
				else {
					timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate2));
				}
				d3.selectAll("#descText2").text(timeValue);
				return timeValue;
			})

			d3.select("#textArticle1").text(function() {
				if (language == "en") {
					return "in";
				}
				else {
					return "au";
				}
			});

			updateTrend(currentRegion2.trend);

		}
	})

	$('#dropdownType1, #dropdownType3').on('change', function() {
		if (d3.select("#dropdownType4").node().value == "hr") {
			//right now the value is reversed.

			//Disable choices where necessary
			if ($('#dropdownType3').val() == "rate") {
				//$('#dropdownType1 option[value="deaths"]').css("display","none");
				$('#dropdownType1 option[value="recover"]').hide();
				//$('#dropdownType1 option[value="recover"]').prop("disabled","true");
				$('#txtTotalMod').css('display', '');
			}
			else {
				//$('#dropdownType1 option[value="deaths"]').css("display",""); 
				//$('#dropdownType1 option[value="recover"]').prop("disabled","");
				$('#dropdownType1 option[value="recover"]').hide();
				$('#txtTotalMod').css('display', 'none');
			}
			// $('#dropdownType1').val()=="deaths" ? $('#dropdownType3 option[value="rate"]').css("display","none") : $('#dropdownType3 option[value="rate"]').css("display","");
			// $('#dropdownType1').val()=="recover" ? $('#dropdownType3 option[value="rate"]').css("display","none") : $('#dropdownType3 option[value="rate"]').css("display","");
			$('#dropdownType1').val() == "recover" ? $('#dropdownType3 option[value="rate"]').attr("disabled", "disabled") : $('#dropdownType3 option[value="rate"]').removeAttr('disabled');

			typeMod = $('#dropdownType3').val();
			typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
			txtTypeCases = $('#dropdownType1 option:selected').text();
			txtTypeMod = $('#dropdownType3 option:selected').text();

			$(".txtType").text(txtTypeCases.toLowerCase());
			$(".txtTypeMod").text(txtTypeMod.toLowerCase());
			// 		scale = 6000;
			// 		scalePercent = 200;

			if (typeCases == "numtoday") {
				currentDate2 = datesArray2[datesArray2.length - 2];
			}
			else {
				currentDate2 = datesArray2[datesArray2.length - 1];
			}

			if ($("#dropdownType4").val() == "hr") {
				if ($('#dropdownType1').val() == "tested" || $('#dropdownType1').val() == "active" || $('#dropdownType1').val() == "recover") {
					$('#dropdownType1').val("total");
					$('#dropdownType1').change();
				}
			}

			indexDate2 = 1;
			if (timeData3[1][currentDate2][0]) {
				while (isNaN(timeData3[1][currentDate2][0][typeCases]) || timeData3[1][currentDate2][0][typeCases] == 0) {
					currentDate2 = datesArray2[datesArray2.length - indexDate2];
					indexDate2 += 1;
				}
			}

			if (typeCases == "ratetested") {
				if (language == "en") {
					$('#txtTotalMod').text("per 1,000,000 population");
				}
				else {
					$('#txtTotalMod').text("par 1 000 000 de population");
				}
			}
			else {
				if (language == "en") {
					$('#txtTotalMod').text("per 100,000 population");
				}
				else {
					$('#txtTotalMod').text("par 100 000 de population");
				}
			}

			//Add/Remove bottom legend2 note
			//JULY 17 NUMRECOVER
			// if (typeCases == "numtotal" || typeCases == "numconf" || typeCases == "numprob" || typeCases == "numtoday" || typeCases == "numrecover") {
			// 	d3.select(".bottomLeg text").style("display", "inline");
			// }
			// 		else{
			// 		    d3.select(".bottomLeg text").style("display","none");
			// 		}

			d3.selectAll(".txtCurrentDate").text(function() {
				let timeValue;
				if (language == "en") {
					timeValue = d3.timeFormat("%B")(parseTime(currentDate2)) + " " + d3.timeFormat("%e")(parseTime(currentDate2)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate2)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate2)))
				}
				else {
					timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate2));
				}
				d3.selectAll("#descText2").text(timeValue);
				return timeValue;
			})

			//Transition Styles
			d3.selectAll(".regions2 path").transition().duration(600).style("fill", function(d) {
				if (timeData3[d.properties.HR_UID]) {
					if (timeData3[d.properties.HR_UID][currentDate2]) {
						if (typeCases == "percentoday") {
							return color(timeData3[d.properties.HR_UID][currentDate2][0][typeCases] * 100);
						}
						else {
							if (timeData3[d.properties.HR_UID])
								return color(timeData3[d.properties.HR_UID][currentDate2][0][typeCases]);
						}
					}
					else {
						return COLOR_SCALE["N/A"];
					}
				}
				else {
					return COLOR_SCALE["N/A"];
				}
			});

			//Transition Numbers
			d3.selectAll('.regionCircleText2').each(function(d) {
				d3.select(this).transition().duration(600).tween("text", function() {
					const that = d3.select(this);
					let currentVal = +that.text().replace(/,/g, "").replace(/ /g, "");
					let currentPT = d.properties.HR_UID;
					let newVal;
					if (timeData3[d.properties.HR_UID][currentDate2]) {
						if (typeCases == "percentoday") {
							newVal = timeData3[d.properties.HR_UID][currentDate2][0][typeCases] * 100;
						}
						else {
							newVal = timeData3[d.properties.HR_UID][currentDate2][0][typeCases];
						}
					}
					else {
						if (index == 1) {
							newVal = 0;
						}
						else {
							newVal == currentVal;
						}
					}
					let format;
					if (!isNaN(+newVal)) {
						format = d3.format(",d");
						d3.select(this.parentNode).classed("visible", true);
						d3.select(this.parentNode).classed("invisible", false);
						if (isNaN(+currentVal)) {
							d3.select(this.parentNode).attr("fill-opacity", 0).transition().duration(500).attr("fill-opacity", 1);
							currentVal = 0;
						}
						if (language == "en") {
							const i = d3.interpolateNumber(currentVal, +newVal);
							return function(t) { that.text(format(i(t))); };
						}
						else {
							const i = d3.interpolateNumber(currentVal, +newVal);
							return function(t) { that.text(format(i(t))); };
						}
					}
				});
			});

			d3.selectAll('.regionValuesCircle2')
				.transition().duration(600)
				.attr("r", function(d, i) {
					if (getlength2(timeData3[d.properties.HR_UID][currentDate2][0][typeCases]) > 6) {
						return 32;
					}
					else if (getlength2(timeData3[d.properties.HR_UID][currentDate2][0][typeCases]) > 5) {
						return 28;
					}
					else if (getlength2(timeData3[d.properties.HR_UID][currentDate2][0][typeCases]) > 4) {
						return 26;
					}
					else {
						return 24;
					}
				})

			d3.select('.CanadaTextValue2').each(function(d) {
				d3.select(this).transition().duration(600).tween("text", function() {
					const that = d3.select(this);
					let format;
					let i;
					let newVal;
					if (typeCases == "percentoday") {
						// Scott HR Canada
						newVal = timeData[1][currentDate][0][typeCases] * 100;
						// newVal = timeData3[1][currentDate2][0][typeCases] * 100;
					}
					else {
						// Scott HR Canada
						newVal = timeData[1][currentDate][0][typeCases];
						// newVal = timeData3[1][currentDate2][0][typeCases];
					}
					format = d3.format(",d");
					if (language == "en") {
						i = d3.interpolateNumber(that.text().replace(/,/g, ""), newVal);
						return function(t) { that.text(format(i(t))); };
					}
					else {
						i = d3.interpolateNumber(that.text().replace(/ /g, ""), newVal);
						return function(t) { that.text(format(i(t))); };
					}
				});
			});

			// d3.select('.repatriatedTextValue2').each(function(d) {
			// 	d3.select(this).transition().duration(600).tween("text", function() {
			// 		const that = d3.select(this);
			// 		let format;
			// 		let i;
			// 		let newVal;
			// 		if (timeData3[99][currentDate2]) {
			// 			if (typeCases == "percentoday") {
			// 				newVal = timeData3[99][currentDate2][0][typeCases] * 100;
			// 			}
			// 			else {
			// 				newVal = timeData3[99][currentDate2][0][typeCases];
			// 			}
			// 		}
			// 		else {
			// 			newVal = 0;
			// 		}
			// 		format = d3.format(",d");
			// 		if (language == "en") {
			// 			i = d3.interpolateNumber(that.text().replace(/,/g, ""), newVal);
			// 			return function(t) { that.text(format(i(t))); };
			// 		}
			// 		else {
			// 			i = d3.interpolateNumber(that.text(), newVal);
			// 			return function(t) { that.text(format(i(t)).replace(",", " ")); };
			// 		}
			// 	});
			// });

			d3.selectAll('.regionCircleText2, .CanadaTextValue2, repatriatedTextValue2').attr("font-size", function() {
				if (typeCases == "numtested" || typeCases == "ratetested") {
					return "13px";
				}
				else {
					return "15px";
				};
			});

			let timeDataMax = [];
			timeData4.forEach(function(d) {
				if (d.key != 1) {
					return d.values.forEach(function(e) {
						timeDataMax.push(e.values[0][typeCases]);
					});
				}
			});
			//scale = roundup(d3.max(timeDataMax));

			d3.selectAll('.categoryLegend2').selectAll("text").remove();

			var gap = 5;
			var squareSize = 13;
			var topMargin = 5;
			d3.selectAll('.categoryLegend2')
				.append('text')
				.attr("class", "legend-text2")
				.style("font-size", "15px")
				.attr("x", function(d, i) {
					return 675
				})
				.attr("y", function(d, i) {
					return (squareSize + gap) * i + squareSize / 2 + topMargin + 12;
				})
				.attr("dy", ".35em")
				.style("text-anchor", "end")
				.text(function(d, i) { return updateLegendText(d, i); });
			d3.select("#legendTitle2").remove()
			d3.select("#legend2")
				.append("text")
				.attr("x", 550)
				.attr("font-size", "15px")
				.attr("font-weight", "bold")
				.attr("id", "legendTitle2")
			.attr("y", topMargin - 30)

				// .attr("y", topMargin - 30)
				.text(function() {
					if (language == "en") {
						if (typeCases == "numdeaths" || typeCases == "numdeaths_last14" || typeCases == "numdeaths_last7") {
							return "Count of " + txtTypeCases.toLowerCase() + " related to COVID-19";
						}
						else if (typeCases == "numrecover") {
							return "Count of " + txtTypeCases.toLowerCase() + " from COVID-19";
						}
						else if (typeCases == "numtested") {
							return "Count of " + txtTypeCases.toLowerCase() + " for COVID-19";
						}
						else if (typeCases == "numtotal" || typeCases == "numactive" || typeCases == "numtotal_last14"  || typeCases == "numtotal_last7") {
							return "Count of " + txtTypeCases.toLowerCase() + " of COVID-19";
						}
						else if (typeCases == "ratedeaths" || typeCases == "ratedeaths_last14") {
							return "Rate of " + txtTypeCases.toLowerCase() + " related to COVID-19 per 100,000 population"
						}
						else if (typeCases == "ratetested") {
							return "Rate of " + txtTypeCases.toLowerCase() + " for COVID-19 per 1,000,000 population"
						}
						else {
							return "Rate of " + txtTypeCases.toLowerCase() + " of COVID-19 per 100,000 population";
						}
					}
					else {
						if (typeCases == "numdeaths" || typeCases == "numdeaths_last14" || typeCases == "numdeaths_last7") {
							return "Nombre de " + txtTypeCases.toLowerCase() + " liés à la COVID-19";
						}
						else if (typeCases == "numrecover") {
							return "Nombre de " + txtTypeCases.toLowerCase() + " de la COVID-19";
						}
						else if (typeCases == "numtested") {
							return "Nombre de " + txtTypeCases.toLowerCase() + " pour la COVID-19";
						}
						else if (typeCases == "numtotal" || typeCases == "numactive" || typeCases == "numtotal_last14"  || typeCases == "numtotal_last7") {
							return "Nombre de " + txtTypeCases.toLowerCase() + " de la COVID-19";
						}
						else if (typeCases == "ratedeaths" || typeCases == "ratedeaths_last14") {
							return "Taux de " + txtTypeCases.toLowerCase() + " liés à la COVID-19 per 100 000 population"
						}
						else if (typeCases == "ratetested") {
							return "Taux de " + txtTypeCases.toLowerCase() + " pour la COVID-19 per 1 000 000 population"
						}
						else {
							return "Taux de " + txtTypeCases.toLowerCase() + " de la COVID-19 per 100 000 population";
						}
					}
				}).call(wrap, 250)

			d3.selectAll(".numArticle2").text(function() {
				let txtNumArticle;
				if (language == "en") {
					if ((typeCases == "numdeaths") || (typeCases == "ratedeaths") || (typeCases == "numdeaths_last14") || (typeCases == "ratedeaths_last14")) {
						return "related to";
					}
					else if (typeCases == "numrecover") {
						return "from";
					}
					else if ((typeCases == "numtested") || (typeCases == "ratetested")) {
						return "for";
					}
					else {
						return "of";
					}
					return txtNumArticle;
				}
				else {
					if ((typeCases == "numtested") || (typeCases == "ratetested")) {
						txtNumArticle = "pour la";
					}
					else if ((typeCases == "numdeaths") || (typeCases == "ratedeaths") || (typeCases == "numdeaths_last14") || (typeCases == "ratedeaths_last14")) {
						txtNumArticle = "liés à la";
					}
					else {
						txtNumArticle = "de la";
					}
					return txtNumArticle;
				}
			})

			/* 		d3.selectAll(".numArticle2").text(function() {
						let txtNumArticle2;
						if (typeCases == "numtested") {
							txtNumArticle2 = "d'";
						}
						else {
							txtNumArticle2 = "de ";
						}
						return txtNumArticle2;
					}); */

			//JULY 17 NUMRECOVER
			// d3.select(".bottomLeg text")
			// 	.text(function() {
			// 		if (language == "en") {
			// 			if (typeCases == "numtoday") {
			// 				return "Note: When displaying the number of new cases, data is only available for a complete day.";
			// 			}
			// 			else if (typeCases == "numtested") {
			// 				return "Note: Provincial/territorial (PT) data reported on their websites should be used if there are discrepancies. This can be due to lags, differing reporting cut-offs, or changes in lab testing criteria. For PTs that report the number of tests completed, a formula is used to estimate the number of individuals tested.";
			// 			}
			// 			else if (typeCases == "numtotal") {
			// 				return "Note: The total number includes publicly reported confirmed and probable cases.";
			// 			}
			// 			/* else if (typeCases == "numrecover") {
			// 				return "Note: On July 17, there was an increase in the number of recovered cases in Quebec due to a revision in how they define these cases."
			// 			} */
			// 		}
			// 		else {
			// 			if (typeCases == "numtoday") {
			// 				return "Remarque: Lorsque le nombre de nouveaux cas est affiché, les données sont seulement disponibles pour une jour complète.";
			// 			}
			// 			else if (typeCases == "numtested") {
			// 				return "Remarque: Les données provinciales / territoriales (PT) signalées sur les sites Web des provinces et territoires être utilisées en cas d’écarts dans les données. Ces écarts peuvent être dûs à des retards, des dates de rapports différentes ou des changements dans les critères relatifs aux essais en laboratoire. Pour les provinces et territoires qui consignent le nombre de tests effectués, une formule est utilisée pour estimer le nombre de personnes testées.";
			// 			}
			// 			else if (typeCases == "numtotal") {
			// 				return "Remarque: Le nombre total comprend les cas confirmés et probables rapportés publiquement.";
			// 			}
			// 			/* else if (typeCases == "numrecover") {
			// 				return "Remarque: Le 17 juillet, il y avait une augmentation du nombre de personnes classifiées comme rétablies dans le Québec à cause des révisions de la façon dont ils définissent ces cas."
			// 			} */
			// 		}
			// 	})
			// 	.call(wrap, 395)

			createTable();
			updateTrend(1);
		}
	});

	function drawTrend() {
		var data;
		var trendPosition;
		var label;
		// typeCases = $('#dropdownType3').val()+$('#dropdownType1').val();

		if (currentRegion2.trend) {
			data = d3.entries(currentRegion2.trend);
			trendPosition = d3.keys(currentRegion2.trend);
			if (language == "en") {
				label = currentRegion2.prname;
			}
			else {
				label = currentRegion2.prnameFR;
			}
		}
		else {
			data = d3.entries(timeData3[currentRegion2.properties.HR_UID]);
			trendPosition = d3.keys(timeData3[currentRegion2.properties.HR_UID]);
			if (language == "en") {
				label = currentRegion2.properties.ENG_LABEL;
			}
			else {
				label = currentRegion2.properties.FRE_LABEL;
			}
		}

		var svg = d3.selectAll("#trendData2")
			.attr("height", function(d) {
				if (isIE2) {
					return height + margin.top + margin.bottom
				}
			})
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		x.domain(d3.extent(data, function(d) { return parseTime(d.key); }));

		y.domain([0, d3.max(data, function(d) { return d.value[0][typeCases]; })]);


		// Add connector2 path
		d3.selectAll("#trendData2 g").append("path")
			.attr("class", "connector2")
			.attr("stroke", "#ccc")
			.attr("fill", "none")

		if (data[0].value[0][typeCases]) {
			d3.selectAll(".connector2").datum(data.filter(trendline.defined()))
				.attr("d", trendline);
		}

		// Add the trendline path.
		svg.append("path")
			.attr("class", "trendPath2 line")
			.attr("stroke", "rgb(8, 81, 156)")
		if (data[0].value[0][typeCases]) {
			d3.selectAll(".trendPath2")
				.datum(data)


				.attr("d", trendline);
		}

		// Add the X Axis
		svg.append("g")
			.attr("class", "trendX2")
			.attr("transform", "translate(0," + height + ")")
			.transition()
			.duration(600)
			.call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%b %d")))
			.selectAll("text")
			.attr("y", 12)
			.attr("x", -21)
			.attr("dy", ".35em")
			.attr("transform", "rotate(-45)");

		// Add the Y Axis
		const yAxisTicks = y.ticks(6, "s")
			.filter(function(tick) { return isInteger(tick); });

		svg.append("g")
			.attr("class", "trendY2")
			.transition()
			.duration(600)
			.call(d3.axisLeft(y).tickValues(yAxisTicks).ticks(6, "s"))
		// .call(d3.axisLeft(y).tickValues(yAxisTicks).tickFormat(d3.format('d')));   

		svg.append("text")
			.attr("class", "titleTrendLabel")
			.attr("transform", "translate(" + ((width / 2)) + "," + (-40) + ")")
			.attr("font-size", "16px")
			.attr("text-anchor", "middle")
			.attr("font-weight", "bold")
			.attr("x", 0)
			.attr("y", 0)
			.text("Canada")
			.call(wrap, 230);

		svg.append("text")
			.attr("class", "xAxisTrendLabel")
			.attr("transform", "translate(" + width / 2 + "," + (height + 60) + ")")
			.attr("font-size", "14px")
			.attr("text-anchor", "middle")
			.text(function() {
				if (language == "en") {
					return "Reporting date";
				}
				else {
					return "Date de signalement";
				}
			})

		svg.append("text")
			.attr("class", "yAxisTrendLabel2")
			.attr("transform", "translate(-43," + ((height / 2) + 13) + ")rotate(-90)")
			.attr("font-size", "14px")
			.attr("text-anchor", "middle")
			.text(function() {
				if (language == "en") {
					if ($('#dropdownType3').val() == "rate")
						return "Rate of " + txtTypeCases;
					else
						return "Count of " + txtTypeCases;

				}
				else {
					if ($('#dropdownType3').val() == "rate")
						return "Taux de " + txtTypeCases;
					else
						return "Nombre de " + txtTypeCases;
				}
			})

		//Add Current Date Highlighter
		svg.append("g")
			.attr("class", "trendHighlight2")
			.append("rect")
			.attr("height", height)
			.attr("width", "10px")
			.attr("fill", "lightgrey")
			.attr("transform", function(d) {
				return "translate(" + (x(parseTime(currentDate2)) - 5) + ",0)";
			})
			.attr("opacity", 0.8);

		d3.selectAll(".trendHighlight2").lower();
	}


	function updateTrend(filter) {
		var data;
		// typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
		// txtTypeCases = $('#dropdownType1 option:selected').text();
		if (currentRegion2.trend) {
			data = d3.entries(currentRegion2.trend);
			var txtTotal;
			if (timeData3[currentRegion2.HRUID][currentDate2]) {
				if(currentRegion2.HRUID == 1){
					// Scott HR Canada
					txtTotal = timeData[currentRegion2.HRUID][currentDate][0][typeCases]
					// txtTotal = timeData3[currentRegion2.HRUID][currentDate2][0][typeCases]
				}
				else
					txtTotal = timeData3[currentRegion2.HRUID][currentDate2][0][typeCases];
			}
			else {
				txtTotal = 0;
			}
			d3.selectAll("#txtTotal").transition().duration(600).text(function() {
				if (language == "en") {
					if (typeCases == "percentoday") {
						return d3.format("%")(txtTotal);
					}
					else {
						/* if(currentRegion2.pruid == "62" && typeCases == "numtotal")
							return d3.format(",d")(txtTotal) + "*"; */
						return d3.format(",d")(txtTotal);
					}
				}
				else {
					if (typeCases == "percentoday") {
						return d3.format("%")(txtTotal).replace("%", " %");
					}
					else {
						/* if(currentRegion2.pruid == "62" && typeCases == "numtotal")
							return (d3.format(",d")(txtTotal)).replace(",", " ") + "*"; */
						return (d3.format(",d")(txtTotal)).replace(",", " ");
					}
				}
			});

			if (language == "en") {
				if (currentRegion2.province == "Repatriated")
					d3.selectAll(".titleTrendLabel").text("Repatriated Travellers")
				else
					d3.selectAll(".titleTrendLabel").text(currentRegion2.province).call(wrap, 230);
			}
			else {
				if (currentRegion2.province == "Repatriated")
					d3.selectAll(".titleTrendLabel").text("Repatriated Travellers")
				else
					d3.selectAll(".titleTrendLabel").text(currentRegion2.province).call(wrap, 230);
			}
		}
		else {
			data = d3.entries(timeData3[currentRegion2.properties.HR_UID]);
			if (timeData3[currentRegion2.properties.HR_UID]) {
				if (timeData3[currentRegion2.properties.HR_UID][currentDate2]) {
					txtTotal = timeData3[currentRegion2.properties.HR_UID][currentDate2][0][typeCases];
				}
			}
			else {
				txtTotal = 0;
			}
			d3.selectAll("#txtTotal")
				// .transition().duration(600)
				.text(function() {
					if (language == "en") {
						/* if(currentRegion2.properties.PRUID == "62" && typeCases == "numtotal")
							return d3.format(",d")(txtTotal) + "*"; */
						return d3.format(",d")(txtTotal);
					}
					else {
						/* if(currentRegion2.properties.PRUID == "62" && typeCases == "numtotal")
							return (d3.format(",d")(txtTotal)).replace(",", " ") + "*"; */
						return (d3.format(",d")(txtTotal)).replace(",", " ");
					}
				});

			if (language == "en") {
				d3.selectAll(".titleTrendLabel").text(currentRegion2.properties.ENG_LABEL).call(wrap, 230);
			}
			else {
				d3.selectAll(".titleTrendLabel").text(currentRegion2.properties.FRE_LABEL).call(wrap, 230);
			}
		}
		if ($('#dropdownType3').val() == "rate")
			data = data.slice(0, data.length - 2)

		x.domain(d3.extent(data, function(d) { return parseTime(d.key); }));
		y.domain([0, d3.max(data, function(d) {
			return +d.value[0][typeCases];
		})]);

		trendline
			.defined(function(d) {
				if (d.value[0][typeCases] != null) {
					return true;
				}
				else {
					if (typeCases == "numrecover") {
						return false;
					}
					else {
						return true;
					}
				}
			})
			.x(function(d) {
				return x(parseTime(d.key));
			})
			.y(function(d) {
				return y(d.value[0][typeCases]);
			});
		if (data.length != 0 && $("#dropdownType4").val() == "hr") {
			d3.selectAll(".trendNoData").style("display", "none")
			d3.selectAll("#trendData2").style("display", "")
			d3.selectAll(".trendData").style("display", "none")

			//Create updated trendline path d
			d3.selectAll(".trendUpdate2").remove();
			d3.selectAll("#trendData2 g").append("path")
				.attr("class", "trendUpdate2")
				.datum(data)
				.attr("d", trendline)
				.style("display", "none");

			//Transition the valueline path.
			d3.selectAll(".trendPath2")
				.datum(data)
				.transition()
				.duration(600)
				.attr("stroke", function(d) {
					return "rgb(8, 81, 156)";
				})
				.attrTween("d", function(d) {
					var previous = d3.select(this).attr("d");
					var current = d3.selectAll(".trendUpdate2").attr("d");
					return d3.interpolatePath(previous, current);
				});

			d3.selectAll(".connector2Update2").remove();
			d3.selectAll("#trendData2 g").append("path")
				.attr("class", "connector2Update2")
				.datum(data.filter(trendline.defined()))
				.attr("d", trendline)
				.style("display", "none");

			//Transition the connector2 line path.
			d3.selectAll(".connector2")
				.datum(data.filter(trendline.defined()))
				.transition()
				.duration(600)
				.style("stroke-dasharray", ("3, 3"))
				.attrTween("d", function(d) {
					var previous = d3.select(this).attr("d");
					var current = d3.selectAll(".connector2Update2").attr("d");
					return d3.interpolatePath(previous, current);
				});

			//Transition the X Axis
			d3.selectAll(".trendX2")
				.transition()
				.duration(600)
				.call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%b %d")))
				.selectAll("text")
				.attr("y", 12)
				.attr("x", -21)
				.attr("dy", ".35em")
				.attr("transform", "rotate(-45)");

			//Transition the Y Axis
			// Add the Y Axis
			const yAxisTicks = y.ticks(6, "s")
				.filter(function(tick) { return isInteger(tick); });

			d3.selectAll(".trendY2")
				.transition()
				.duration(600)
				.call(d3.axisLeft(y).tickValues(yAxisTicks).ticks(6, "s"))

			d3.selectAll(".yAxisTrendLabel2").text(function(d) {
				if (language == "en") {
					return txtTypeMod + " of " + txtTypeCases;
				}
				else {
					return txtTypeMod + " de " + txtTypeCases.toLowerCase();
				}
			})

			//Transition the Date Highlighter
			d3.selectAll(".trendHighlight2 rect")
				.transition()
				.duration(600)
				.attr("transform", function(d) {
					if (x(parseTime(currentDate2)) < 0) {
						d3.select(this).style("display", "none");
						return "translate(-5,0)";
					}
					else {
						d3.select(this).style("display", "block");
						return "translate(" + (x(parseTime(currentDate2)) - 5) + ",0)";

					}
				})
		}
		else {
			if ($("#dropdownType4").val() == "hr") {
				d3.selectAll(".trendNoData").style("display", "")
				d3.selectAll("#trendData2").style("display", "none")
				d3.selectAll(".trendData").style("display", "none")
			}
		}
	}

	function colorMap() {
		// typeCases = $('#dropdownType3').val()+$('#dropdownType1').val();
		d3.selectAll(".regions2")
			.style("fill", function(d) {
				if (timeData3[d.properties.HR_UID]) {
					var colorData = timeData3[d.properties.HR_UID][currentDate2][0];
					if (typeCases == "percentoday") {
						return color(colorData[typeCases] * 100);
					}
					else {
						return color(colorData[typeCases]);
					}
				}
				else {
					return "lightgray";
				}
			});
	}

	function color(value) {
		//because we only have nums for the hr, we will have to calculate per 100,000
		if (typeCases == "numtotal") {
			if (value > 20000) return COLOR_SCALE["6+"];
			else if (value > 10000) return COLOR_SCALE["5-6"];
			else if (value > 5000) return COLOR_SCALE["4-5"];
			else if (value > 1000) return COLOR_SCALE["3-4"];
			else if (value > 500) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "ratetotal") {
			if (value > 2000) return COLOR_SCALE["6+"];
			else if (value > 1000) return COLOR_SCALE["5-6"];
			else if (value > 500) return COLOR_SCALE["4-5"];
			else if (value > 250) return COLOR_SCALE["3-4"];
			else if (value > 100) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "numdeaths") {
			if (value >= 500) return COLOR_SCALE["6+"];
			if (value >= 300) return COLOR_SCALE["5-6"];
			else if (value >= 100) return COLOR_SCALE["4-5"];
			else if (value >= 25) return COLOR_SCALE["3-4"];
			else if (value >= 5) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "ratedeaths") {
			if (value > 100) return COLOR_SCALE["6+"];
			if (value > 50) return COLOR_SCALE["5-6"];
			else if (value > 25) return COLOR_SCALE["4-5"];
			else if (value > 15) return COLOR_SCALE["3-4"];
			else if (value > 10) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "numtotal_last14") {
			if (value > 3000) return COLOR_SCALE["6+"];
			else if (value > 2000) return COLOR_SCALE["5-6"];
			else if (value > 1000) return COLOR_SCALE["4-5"];
			else if (value > 500) return COLOR_SCALE["3-4"];
			else if (value > 250) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "ratetotal_last14") {
			if (value > 400) return COLOR_SCALE["6+"];
			else if (value > 200) return COLOR_SCALE["5-6"];
			else if (value > 100) return COLOR_SCALE["4-5"];
			else if (value > 50) return COLOR_SCALE["3-4"];
			else if (value > 15) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "numdeaths_last14") {
			if (value > 50) return COLOR_SCALE["6+"];
			else if (value > 40) return COLOR_SCALE["5-6"];
			else if (value > 20) return COLOR_SCALE["4-5"];
			else if (value > 10) return COLOR_SCALE["3-4"];
			else if (value > 5) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "ratedeaths_last14") {
			if (value > 10) return COLOR_SCALE["6+"];
			else if (value > 6) return COLOR_SCALE["5-6"];
			else if (value > 4) return COLOR_SCALE["4-5"];
			else if (value > 2) return COLOR_SCALE["3-4"];
			else if (value > 1) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "numtotal_last7") {
			if (value > 1000) return COLOR_SCALE["6+"];
			else if (value > 500) return COLOR_SCALE["5-6"];
			else if (value > 100) return COLOR_SCALE["4-5"];
			else if (value > 50) return COLOR_SCALE["3-4"];
			else if (value > 25) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "ratetotal_last7") {
			if (value > 200) return COLOR_SCALE["6+"];
			else if (value > 150) return COLOR_SCALE["5-6"];
			else if (value > 100) return COLOR_SCALE["4-5"];
			else if (value > 50) return COLOR_SCALE["3-4"];
			else if (value > 25) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "numdeaths_last7") {
			if (value > 25) return COLOR_SCALE["6+"];
			else if (value > 20) return COLOR_SCALE["5-6"];
			else if (value > 15) return COLOR_SCALE["4-5"];
			else if (value > 10) return COLOR_SCALE["3-4"];
			else if (value > 5) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "ratedeaths_last7") {
			if (value > 6) return COLOR_SCALE["6+"];
			else if (value > 4) return COLOR_SCALE["5-6"];
			else if (value > 3) return COLOR_SCALE["4-5"];
			else if (value > 2) return COLOR_SCALE["3-4"];
			else if (value > 1) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "ratetoday") {
			if (value > 1.5) return COLOR_SCALE["6+"];
			else if (value > 1) return COLOR_SCALE["5-6"];
			else if (value > 0.6) return COLOR_SCALE["4-5"];
			else if (value > 0.4) return COLOR_SCALE["3-4"];
			else if (value > 0.2) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "ratedeathstoday") {
			if (value > 1.5) return COLOR_SCALE["6+"];
			else if (value > 1) return COLOR_SCALE["5-6"];
			else if (value > 0.6) return COLOR_SCALE["4-5"];
			else if (value > 0.4) return COLOR_SCALE["3-4"];
			else if (value > 0.2) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
	}

	function updateLegendText(d, i) {
		if (typeCases == "numtotal") {
			if (language == "en") {
				if (i == 0) {
					return "20,000 and higher";
				}
				else if (i == 1) {
					return "10,000 to 19,999";
				}
				else if (i == 2) {
					return "5,000 to 9,999";
				}
				else if (i == 3) {
					return "1,000 to 4,999";
				}
				else if (i == 4) {
					return "500 to 999";
				}
				else if (i == 5) {
					return "1 to 499";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "20 000 et plus";
				}
				else if (i == 1) {
					return "10 000 à 19 999";
				}
				else if (i == 2) {
					return "5 000 à 9 999";
				}
				else if (i == 3) {
					return "1 000 à 4 999";
				}
				else if (i == 4) {
					return "500 à 999";
				}
				else if (i == 5) {
					return "1 à 499";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "ratetotal") {
			if (language == "en") {
				if (i == 0) {
					return "2,000 and higher";
				}
				else if (i == 1) {
					return "1,000 to 1,999.9";
				}
				else if (i == 2) {
					return "500 to 999.9";
				}
				else if (i == 3) {
					return "250 to 499.9";
				}
				else if (i == 4) {
					return "100 to 249.9";
				}
				else if (i == 5) {
					return "0.1 to 99.9";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return ">2 000 et plus";
				}
				else if (i == 1) {
					return "1 000 à 1 999,9";
				}
				else if (i == 2) {
					return "500 à 999,9";
				}
				else if (i == 3) {
					return "250 à 499,9";
				}
				else if (i == 4) {
					return "100 à 249,9";
				}
				else if (i == 5) {
					return "0,1 à 99,9";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "numdeaths") {
			if (language == "en") {
				if (i == 0) {
					return "500 and higher";
				}
				else if (i == 1) {
					return "300 to 499";
				}
				else if (i == 2) {
					return "100 to 299";
				}
				else if (i == 3) {
					return "25 to 99";
				}
				else if (i == 4) {
					return "5 to 24";
				}
				else if (i == 5) {
					return "1 to 4";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "500 et plus";
				}
				else if (i == 1) {
					return "300 à 499";
				}
				else if (i == 2) {
					return "100 à 299";
				}
				else if (i == 3) {
					return "25 à 99";
				}
				else if (i == 4) {
					return "5 à 24";
				}
				else if (i == 5) {
					return "1 à 4";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "ratedeaths") {
			if (language == "en") {
				if (i == 0) {
					return "100 and higher";
				}
				else if (i == 1) {
					return "50 to 99.9";
				}
				else if (i == 2) {
					return "25 to 49.9";
				}
				else if (i == 3) {
					return "15 to 24.9";
				}
				else if (i == 4) {
					return "10 to 14.9";
				}
				else if (i == 5) {
					return "0.1 to 9.9";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "100 et plus";
				}
				else if (i == 1) {
					return "50 à 99,9";
				}
				else if (i == 2) {
					return "25 à 49,9";
				}
				else if (i == 3) {
					return "15 à 24,9";
				}
				else if (i == 4) {
					return "10 à 14,9";
				}
				else if (i == 5) {
					return "0,1 à 9,9";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "numtotal_last14") {
			if (language == "en") {
				if (i == 0) {
					return "3,000 and higher";
				}
				else if (i == 1) {
					return "2,000 to 2,999";
				}
				else if (i == 2) {
					return "1,000 to 1,999";
				}
				else if (i == 3) {
					return "500 to 999";
				}
				else if (i == 4) {
					return "250 to 499";
				}
				else if (i == 5) {
					return "1 to 249";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "3 000 et plus";
				}
				else if (i == 1) {
					return "2 000 à 2 999";
				}
				else if (i == 2) {
					return "1 000 à 1 999";
				}
				else if (i == 3) {
					return "500 à 999";
				}
				else if (i == 4) {
					return "250 à 499";
				}
				else if (i == 5) {
					return "1 à 249";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "ratetotal_last14") {
			if (language == "en") {
				if (i == 0) {
					return "400 and higher";
				}
				else if (i == 1) {
					return "200 to 399.9";
				}
				else if (i == 2) {
					return "100 to 199.9";
				}
				else if (i == 3) {
					return "50 to 99.9";
				}
				else if (i == 4) {
					return "15 to 49.9";
				}
				else if (i == 5) {
					return "0.1 to 14.9";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "400 et plus";
				}
				else if (i == 1) {
					return "200 à 399,9";
				}
				else if (i == 2) {
					return "100 à 199,9";
				}
				else if (i == 3) {
					return "50 à 99,9";
				}
				else if (i == 4) {
					return "15 à 49,9";
				}
				else if (i == 5) {
					return "0,1 à 14,9";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "numdeaths_last14") {
			if (language == "en") {
				if (i == 0) {
					return "50 and higher";
				}
				else if (i == 1) {
					return "40 to 49";
				}
				else if (i == 2) {
					return "20 to 39";
				}
				else if (i == 3) {
					return "10 to 19";
				}
				else if (i == 4) {
					return "5 to 9";
				}
				else if (i == 5) {
					return "1 to 4";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "50 et plus";
				}
				else if (i == 1) {
					return "40 à 49";
				}
				else if (i == 2) {
					return "20 à 39";
				}
				else if (i == 3) {
					return "10 à 19";
				}
				else if (i == 4) {
					return "5 à 9";
				}
				else if (i == 5) {
					return "1 à 4";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "ratedeaths_last14") {
			if (language == "en") {
				if (i == 0) {
					return "10 and higher";
				}
				else if (i == 1) {
					return "6 to 9.9";
				}
				else if (i == 2) {
					return "4 to 5.9";
				}
				else if (i == 3) {
					return "2 to 3.9";
				}
				else if (i == 4) {
					return "1 to 1.9";
				}
				else if (i == 5) {
					return "0.1 to 0.9";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "10 et plus";
				}
				else if (i == 1) {
					return "6 à 9,9";
				}
				else if (i == 2) {
					return "4 à 5,9";
				}
				else if (i == 3) {
					return "2 à 3,9";
				}
				else if (i == 4) {
					return "1 à 1,9";
				}
				else if (i == 5) {
					return "0,1 à 0,9";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "numtotal_last7") {
			if (language == "en") {
				if (i == 0) {
					return "1,000 and higher";
				}
				else if (i == 1) {
					return "500 to 999";
				}
				else if (i == 2) {
					return "100 to 499";
				}
				else if (i == 3) {
					return "50 to 99";
				}
				else if (i == 4) {
					return "25 to 49";
				}
				else if (i == 5) {
					return "1 to 24";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "1 000 et plus";
				}
				else if (i == 1) {
					return "500 à 999";
				}
				else if (i == 2) {
					return "100 à 499";
				}
				else if (i == 3) {
					return "50 à 99";
				}
				else if (i == 4) {
					return "25 à 49";
				}
				else if (i == 5) {
					return "1 à 24";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "ratetotal_last7") {
			if (language == "en") {
				if (i == 0) {
					return "200 and higher";
				}
				else if (i == 1) {
					return "150 to 199.9";
				}
				else if (i == 2) {
					return "100 to 149.9";
				}
				else if (i == 3) {
					return "50 to 99.9";
				}
				else if (i == 4) {
					return "25 to 49.9";
				}
				else if (i == 5) {
					return "0.1 to 24.9";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "200 et plus";
				}
				else if (i == 1) {
					return "150 à 199,9";
				}
				else if (i == 2) {
					return "100 à 149,9";
				}
				else if (i == 3) {
					return "50 à 99,9";
				}
				else if (i == 4) {
					return "25 à 49,9";
				}
				else if (i == 5) {
					return "0,1 à 24,9";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "numdeaths_last7") {
			if (language == "en") {
				if (i == 0) {
					return "25 and higher";
				}
				else if (i == 1) {
					return "20 to 24";
				}
				else if (i == 2) {
					return "15 to 19";
				}
				else if (i == 3) {
					return "10 to 14";
				}
				else if (i == 4) {
					return "5 to 9";
				}
				else if (i == 5) {
					return "1 to 4";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "25 et plus";
				}
				else if (i == 1) {
					return "20 à 24";
				}
				else if (i == 2) {
					return "15 à 19";
				}
				else if (i == 3) {
					return "10 à 14";
				}
				else if (i == 4) {
					return "5 à 9";
				}
				else if (i == 5) {
					return "1 à 4";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "ratedeaths_last7") {
			if (language == "en") {
				if (i == 0) {
					return "6 and higher";
				}
				else if (i == 1) {
					return "4 to 5.9";
				}
				else if (i == 2) {
					return "3 to 3.9";
				}
				else if (i == 3) {
					return "2 to 2.9";
				}
				else if (i == 4) {
					return "1 to 1.9";
				}
				else if (i == 5) {
					return "0.1 to 0.9";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "6 et plus";
				}
				else if (i == 1) {
					return "4 à 5,9";
				}
				else if (i == 2) {
					return "3 à 3,9";
				}
				else if (i == 3) {
					return "2 à 2,9";
				}
				else if (i == 4) {
					return "1 à 1,9";
				}
				else if (i == 5) {
					return "0,1 à 0,9";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "ratetoday") {
			if (language == "en") {
				if (i == 0) {
					return "1.5 and higher";
				}
				else if (i == 1) {
					return "1.0 to 1.49";
				}
				else if (i == 2) {
					return "0.6 to 0.99";
				}
				else if (i == 3) {
					return "0.4 to 0.59";
				}
				else if (i == 4) {
					return "0.2 to 0.39";
				}
				else if (i == 5) {
					return "0.1 to 0.19";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "1,5 et plus";
				}
				else if (i == 1) {
					return "1,0 à 1,49";
				}
				else if (i == 2) {
					return "0,6 à 0,99";
				}
				else if (i == 3) {
					return "0,4 à 0,59";
				}
				else if (i == 4) {
					return "0,2 à 0,39";
				}
				else if (i == 5) {
					return "0,1 à 0,19";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "ratedeathstoday") {
			if (language == "en") {
				if (i == 0) {
					return "1.5 and higher";
				}
				else if (i == 1) {
					return "1.0 to 1.49";
				}
				else if (i == 2) {
					return "0.6 to 0.99";
				}
				else if (i == 3) {
					return "0.4 to 0.59";
				}
				else if (i == 4) {
					return "0.2 to 0.39";
				}
				else if (i == 5) {
					return "0.1 to 0.19";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "1,5 et plus";
				}
				else if (i == 1) {
					return "1,0 à 1,49";
				}
				else if (i == 2) {
					return "0,6 à 0,99";
				}
				else if (i == 3) {
					return "0,4 à 0,59";
				}
				else if (i == 4) {
					return "0,2 à 0,39";
				}
				else if (i == 5) {
					return "0,1 à 0,19";
				}
				else {
					return "0";
				}
			}
		}
	}

	function drawLegend(timeData4) {
		var target = svg;
		// typeCases = $('#dropdownType3').val()+$('#dropdownType1').val();

		var gap = 5;
		var squareSize = 13;
		var topMargin = 5;

		let legend = target.append('g')
			.attr('class', 'legend2')
			.attr('id', 'legend2')
			.attr("transform", "translate(-80,100)")

		legend.append("rect")
			.attr("id", "bgLegend2")
			.style("display", "none")
			.attr("x", 537)
			.attr("y", -40)
			.attr("height", 190)
			.attr("width", 300)
			.style("fill", "white")
			.style("opacity", "0.75")

		legend.selectAll('g.categoryLegend2')
			.data(Object.keys(COLOR_SCALE))
			.enter()
			.append('g')
			.attr('class', 'categoryLegend2')
			.append('rect')
			.attr('x', 685)
			.attr('y', function(d, i) {
				return (squareSize + gap) * i + topMargin + 12;
			})
			.attr('height', squareSize)
			.attr('width', function(d, i) {
				return squareSize * (7 - i);
			})
			.style('fill', function(d) {
				return COLOR_SCALE[d];
			})
			.attr("stroke", "#828080");
		d3.select("#legendTitle2").remove()
		d3.select("#legend2")
			.append("text")
			.attr("x", 550)
			.attr("font-size", "15px")
			.attr("font-weight", "bold")
			.attr("id", "legendTitle2")
			.attr("y", topMargin - 30)

			// .attr("y", topMargin - 30)
			.text(function() {
				if (language == "en") {
					if (typeCases == "numdeaths" || typeCases == "numdeaths_last14" || typeCases == "numdeaths_last7") {
						return "Count of " + txtTypeCases.toLowerCase() + " related to COVID-19";
					}
					else if (typeCases == "numrecover") {
						return "Count of " + txtTypeCases.toLowerCase() + " from COVID-19";
					}
					else if (typeCases == "numtested") {
						return "Count of " + txtTypeCases.toLowerCase() + " for COVID-19";
					}
					else if (typeCases == "numtotal" || typeCases == "numactive" || typeCases == "numtotal_last14"  || typeCases == "numtotal_last7") {
						return "Count of " + txtTypeCases.toLowerCase() + " of COVID-19";
					}
					else if (typeCases == "ratedeaths" || typeCases == "ratedeaths_last14") {
						return "Rate of " + txtTypeCases.toLowerCase() + " related to COVID-19 per 100,000 population"
					}
					else if (typeCases == "ratetested") {
						return "Rate of " + txtTypeCases.toLowerCase() + " for COVID-19 per 1,000,000 population"
					}
					else {
						return "Rate of " + txtTypeCases.toLowerCase() + " of COVID-19 per 100,000 population";
					}
				}
				else {
					if (typeCases == "numdeaths" || typeCases == "numdeaths_last14" || typeCases == "numdeaths_last7") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " liés à la COVID-19";
					}
					else if (typeCases == "numrecover") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " de la COVID-19";
					}
					else if (typeCases == "numtested") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " pour la COVID-19";
					}
					else if (typeCases == "numtotal" || typeCases == "numactive" || typeCases == "numtotal_last14"  || typeCases == "numtotal_last7") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " de la COVID-19";
					}
					else if (typeCases == "ratedeaths" || typeCases == "ratedeaths_last14") {
						return "Taux de " + txtTypeCases.toLowerCase() + " liés à la COVID-19 par 100 000 population"
					}
					else if (typeCases == "ratetested") {
						return "Taux de " + txtTypeCases.toLowerCase() + " pour la COVID-19 par 1 000 000 population"
					}
					else {
						return "Taux de " + txtTypeCases.toLowerCase() + " de la COVID-19 par 100 000 population";
					}
				}
			}).call(wrap, 250)

		let timeDataMax = [];
		timeData4.forEach(function(d) {
			if (d.key != 1) {
				return d.values.forEach(function(e) {
					timeDataMax.push(e.values[0][typeCases]);
				});
			}
		})
		const totalMax = d3.max(timeDataMax);

		d3.selectAll('.categoryLegend2')
			.append('text')
			.attr("class", "legend-text2")
			.style("font-size", "15px")
			.attr("x", function(d, i) {
				return 675;
			})
			.attr("y", function(d, i) {
				return (squareSize + gap) * i + squareSize / 2 + topMargin + 12;
			})
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d, i) { return updateLegendText(d, i); })

		const bottomLeg2 = d3.select("#map2 svg").append("g").attr("class", "bottomLeg").attr("transform", function(d, i) { return "translate(-100,545)" })
		bottomLeg2.append("text").text(function() {
				if (language == "en") {
					return "Source: Berry I, Soucy J-PR, Tuite A, Fisman D. Open access epidemiologic data and an interactive dashboard to monitor the COVID-19 outbreak in Canada. CMAJ. 2020 Apr 14;192(15):E420. doi:https://doi.org/10.1503/cmaj.75262";
				}
				else {
					return "Source: Berry I, Soucy J-PR, Tuite A, Fisman D. Open access epidemiologic data and an interactive dashboard to monitor the COVID-19 outbreak in Canada. CMAJ. 2020 Apr 14;192(15):E420. doi:https://doi.org/10.1503/cmaj.75262";
				}
			})
			.attr("font-size", "12px")
			.attr("x", (x.range()[0] + 10))
			.attr("y", 0)
			.style("text-anchor", "start")
			.attr("transform", "translate(90," + ((5) - (-1 * 0.3)) + ")")
			.call(wrap, 395)

		// if(!bottomLeg.select("text")){
		// 	bottomLeg.append("text")
		// 		.text(function() {
		// 			if (language == "en") {
		// 				if (typeCases == "numtoday") {
		// 					return "Note: When displaying the number of new cases, data is only available for a complete day.";
		// 				}
		// 				else if (typeCases == "numtested") {
		// 					return "Note: Provincial/territorial (PT) data reported on their websites should be used if there are discrepancies. This can be due to lags, differing reporting cut-offs, or changes in lab testing criteria. For PTs that report the number of tests completed, a formula is used to estimate the number of individuals tested.";
		// 				}
		// 				else if (typeCases == "numtotal") {
		// 					return "Note: The total number includes publicly reported confirmed and probable cases.";
		// 				}
		// 				/* else if (typeCases == "numrecover") {
		// 					return "Note: On July 17, there was an increase in the number of recovered cases in Quebec due to a revision in how they define these cases."
		// 				} */
		// 			}
		// 			else {
		// 				if (typeCases == "numtoday") {
		// 					return "Remarque: Lorsque le nombre de nouveaux cas est affiché, les données sont seulement disponibles pour une jour complète.";
		// 				}
		// 				else if (typeCases == "numtested") {
		// 					return "Remarque: Les données provinciales / territoriales (PT) signalées sur les sites Web des provinces et territoires être utilisées en cas d’écarts dans les données. Ces écarts peuvent être dûs à des retards, des dates de rapports différentes ou des changements dans les critères relatifs aux essais en laboratoire. Pour les provinces et territoires qui consignent le nombre de tests effectués, une formule est utilisée pour estimer le nombre de personnes testées.";
		// 				}
		// 				else if (typeCases == "numtotal") {
		// 					return "Remarque: Le nombre total comprend les cas confirmés et probables rapportés publiquement.";
		// 				}
		// 				/* else if (typeCases == "numrecover") {
		// 					return "Remarque: Le 17 juillet, il y avait une augmentation du nombre de personnes classifiées comme rétablies dans le Québec à cause des révisions de la façon dont ils définissent ces cas."
		// 				} */
		// 			}
		// 		})
		// 		.attr("font-size", "12px")
		// 		.attr("x", (x.range()[0] + 10))
		// 		.style("text-anchor", "start")
		// 		.attr("transform", "translate(90," + ((5) - (-1 * 0.3)) + ")")
		// 		.call(wrap, 395)
		// }
	}

	// var logSwitch = 0;
	// var relativeSwitch = 0;
	// var smallMultipleData = [];
	// // set the dimensions and margins of the graph
	// var margin2 = { top: 50, right: 65, bottom: 70, left: 63 },
	// 	width2 = 370.5 - margin2.left - margin2.right,
	// 	height2 = 330 - margin2.top - margin2.bottom;
	// // set the ranges
	// var x2 = d3.scaleTime().range([0, width2]);
	// var y2 = d3.scaleLinear().range([height2, 0]);
	// x2.domain(d3.extent(timeData4[0].values, function(d) { return d.key; }));
	// y2.domain([0, d3.max(timeData4[0].values, function(d) { return d.values[0].numtotal; })]);
	// //optional log stuff
	// var yLog = d3.scaleLog().range([height2, 0]);
	// // var logFormat10alt = yLog.tickFormat(10, "");
	// yLog.domain([Math.exp(0), d3.max(timeData4[0].values, function(d) { return d.values[0].numtotal; })]);

	// $('#dropdownType2').on('change', function() {
	// 	typeCasesSM = $('#dropdownType2').val();
	// 	txtTypeCasesSM = $('#dropdownType2 option:selected').text();
	// 	updateSmallMultipleTrends(logSwitch, relativeSwitch);
	// });

	// //clean-up later
	// d3.select("#logSwitch").on("click", function() {
	// 	if (logSwitch == 1) {
	// 		logSwitch = 0
	// 		d3.select(this).classed("btn-info", true);
	// 		d3.select(this).classed("btn-success", false);
	// 	}
	// 	else {
	// 		logSwitch = 1;
	// 		d3.select(this).classed("btn-info", false);
	// 		d3.select(this).classed("btn-success", true);
	// 	}
	// 	updateSmallMultipleTrends(logSwitch, relativeSwitch);
	// });
	// d3.select("#relativeSwitch").on("click", function() {
	// 	if (relativeSwitch == 1) {
	// 		relativeSwitch = 0;
	// 		d3.select(this).classed("btn-info", false);
	// 		d3.select(this).classed("btn-success", true);

	// 	}
	// 	else {
	// 		relativeSwitch = 1;
	// 		d3.select(this).classed("btn-info", true);
	// 		d3.select(this).classed("btn-success", false);
	// 	}
	// 	updateSmallMultipleTrends(logSwitch, relativeSwitch);
	// });

	// drawSmallMultipleTrends(logSwitch, relativeSwitch);

	// function updateSmallMultipleTrends(logSwitch, relativeSwitch) {


	// 	var yaxis = d3.axisLeft();
	// 	if (logSwitch == 1) {
	// 		yaxis.scale(yLog).tickFormat(function(e) {
	// 			return yLog.tickFormat(1, d3.format(",d"))(e)
	// 		})
	// 	}
	// 	else {
	// 		if (typeCasesSM == "numtested") {
	// 			yaxis.scale(y2).ticks(6, "s");
	// 		}
	// 		else {
	// 			yaxis.scale(y2).tickFormat(function(e) {
	// 				return y2.tickFormat(1, d3.format(",d"))(e);
	// 			})
	// 		}
	// 	}

	// 	var smallMultipleSVG = d3.select("#smallMultiple").selectAll("#smallMultiple svg");

	// 	// define the line to be used
	// 	var messedUp = 0;

	// 	smallMultipleSVG.selectAll(".line").each(function(d) {
	// 		if (logSwitch == 1) {
	// 			if (relativeSwitch == 1) {
	// 				yLog.domain([Math.exp(0), d3.max(d, function(d) { if (d.values[0][typeCasesSM] == 0) { return Math.exp(0); } else { return d.values[0][typeCasesSM]; } })]);
	// 			}
	// 			else {
	// 				yLog.domain([Math.exp(0), d3.max(timeData4[0].values, function(d) { return d.values[0][typeCasesSM]; })]);
	// 			}
	// 		}
	// 		else {
	// 			if (relativeSwitch == 1) {
	// 				y2.domain([0, d3.max(d, function(d) { return d.values[0][typeCasesSM]; })]);
	// 			}
	// 			else {
	// 				y2.domain([0, d3.max(timeData4[0].values, function(d) { return d.values[0][typeCasesSM]; })]);
	// 			}
	// 		}

	// 		smallMultipleTrendline = d3.line()
	// 			.x(function(d) {
	// 				return x2(d.key);
	// 			})
	// 			.y(function(d) {
	// 				if (!isNaN(d.values[0][typeCasesSM])) {
	// 					if (logSwitch == 1) {
	// 						if (d.values[0][typeCasesSM] == 0) {
	// 							return yLog(Math.exp(0));
	// 						}
	// 						else {
	// 							return yLog(d.values[0][typeCasesSM]);
	// 						}
	// 					}
	// 					else {
	// 						return y2(d.values[0][typeCasesSM]);
	// 					}
	// 				}
	// 				else {
	// 					return y2(0);
	// 				}
	// 			});

	// 		d3.select(this)
	// 			.transition().duration(600)
	// 			.attr("d", smallMultipleTrendline);

	// 		//Transition the Y Axis
	// 		d3.select(this.parentNode).select("#trendY2SM")
	// 			.transition()
	// 			.duration(600)
	// 			.call(yaxis);
	// 	})

	// 	smallMultipleSVG.select(".yAxisSMLabel")
	// 		.text(function() {
	// 			if (language == "en") {
	// 				return "Number of " + txtTypeCasesSM.toLowerCase();
	// 			}
	// 			else {
	// 				return "Nombre de " + txtTypeCasesSM.toLowerCase();
	// 			}
	// 		})
	// }
	if(language == "fr"){
	d3.json("/src/data/covidLive/hrFRE.json", function(hrJSON) {
		hrFRE = hrJSON;
		d3.json("/src/data/covidLive/French.json", function(frJSON) {
			frenchJson = frJSON
			createTable();
		})
	})
	}
	else{
		createTable()
	}

	function createTable() {
		let curPage;
		let curSort;
		let curLength;
		let curSearch;
		if ($.fn.DataTable.isDataTable('#dataTable2')) {
			curPage = $("#dataTable2").DataTable().page.info().page;
			curSort = $("#dataTable2").dataTable().fnSettings().aaSorting;
			curLength = $('#dataTable2').DataTable().page.len();
			curSearch = $("#dataTable2").DataTable().search().trim();
			$("#dataTable2").DataTable().destroy();
		}
		else {
			curPage = 0;
			curSort = [
				[2, "desc"]
			];
			curLength = 10;
			curSearch = "";
		}

		d3.selectAll("#dataTable2 tbody tr").each(function(d) {
			d3.select(this).remove();
		});

		var dataRow = d3.select("#dataTable2 tbody").selectAll("tr")
			.data(timeData4)
			.enter()
			.append("tr");

		dataRow.append("td")
			.attr("id", "provinceName")
			.attr("class", "tdTable")
			.text(function(d) {
				return enprov2frprov(d.values[0].values[0]["province"]);
			});

		dataRow.append("td")
			.attr("id", "regionName")
			.attr("class", "tdTable")
			.text(function(d) {
				if (language == "en") {
					return d.values[0].values[0]["health_region"];
				}
				else {
					if (hrFRE[d.values[0].values[0]["health_region"]] == undefined)
						return d.values[0].values[0]["health_region"];
					return hrFRE[d.values[0].values[0]["health_region"]];
				}
			});

		dataRow.append("td")
			.attr("id", "numtotal")
			.attr("class", "tdTable")
			.text(function(d) {
				if (timeData3[d.key][currentDate2]) {
					return d3.format(",d")(timeData3[d.key][currentDate2][0].numtotal);
				}
				else {
					return "0";
				}
			})
			.attr("data-order", function(d, i) {
				if (timeData3[d.key][currentDate2]) {
					if (isNaN(timeData3[d.key][currentDate2][0].numtotal))
						return 0
					return timeData3[d.key][currentDate2][0].numtotal;
				}
				else {
					return 0;
				}
			});;

		dataRow.append("td")
			.attr("id", "ratetotal")
			.attr("class", "tdTable")
			.text(function(d, i) {
				if (timeData3[d.key][currentDate2]) {
					if (isNaN(timeData3[d.key][currentDate2][0].ratetotal))
						return "N/A"
					return d3.format(",d")(timeData3[d.key][currentDate2][0].ratetotal);
				}
				else {
					return "0";
				}
			})
			.attr("data-order", function(d, i) {
				if (timeData3[d.key][currentDate2]) {
					if (isNaN(timeData3[d.key][currentDate2][0].ratetotal))
						return 0
					return timeData3[d.key][currentDate2][0].ratetotal;
				}
				else {
					return 0;
				}
			});

		dataRow.append("td")
			.attr("class", "numtotal_last14 tdTable")
			.html(function(d) {
				if (timeData3[d.key][currentDate2]) {

					// const noteMap = notesMap.filter(function(e){
					// 	return e.pruid == d.key
					// })
					// if(noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Cases") > -1){
					// 	currentNoteNumber = noteMap[0].noteNumber;
					// 	return d3.format(",d")(timeData[d.key][currentDate][0].numtotal_last14) + "<sup>"+notesSymbols[currentNoteNumber + 3]+"</sup>";
					// }else{
					return d3.format(",d")(timeData3[d.key][currentDate2][0].numtotal_last14);
					// }
				}
				else {
					return "0";
				}
			})
			.attr("data-order", function(d, i) {
				if (timeData3[d.key][currentDate2]) {
					if (isNaN(timeData3[d.key][currentDate2][0].numtotal_last14))
						return 0
					return timeData3[d.key][currentDate2][0].numtotal_last14;
				}
				else {
					return 0;
				}
			});



		dataRow.append("td")
			.attr("class", "ratetotal_last14 tdTable")
			.html(function(d) {
				if (timeData3[d.key][currentDate2]) {

					// const noteMap = notesMap.filter(function(e){
					// 	return e.pruid == d.key
					// })
					// if(noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Cases") > -1){
					// 	currentNoteNumber = noteMap[0].noteNumber;
					// 	return d3.format(",d")(timeData[d.key][currentDate][0].ratetotal_last14) + "<sup>"+notesSymbols[currentNoteNumber + 3]+"</sup>";
					// }else{
					if (isNaN(timeData3[d.key][currentDate2][0].ratetotal_last14))
						return "N/A"
					return d3.format(",d")(timeData3[d.key][currentDate2][0].ratetotal_last14);
					// }
				}
				else {
					return "0";
				}
			})
			.attr("data-order", function(d, i) {
				if (timeData3[d.key][currentDate2]) {
					if (isNaN(timeData3[d.key][currentDate2][0].ratetotal_last14))
						return 0
					return timeData3[d.key][currentDate2][0].ratetotal_last14;
				}
				else {
					return 0;
				}
			});

		dataRow.append("td")
			.attr("id", "numdeath")
			.attr("class", "tdTable")
			.text(function(d) {
				if (timeData3[d.key][currentDate2]) {
					/* if (d.key == "62")
						return d3.format(",d")(timeData3[d.key][currentDate2][0].numdeaths) + "***"; */

					return d3.format(",d")(timeData3[d.key][currentDate2][0].numdeaths);
				}
				else {
					return "0";
				}
			})
			.attr("data-order", function(d, i) {
				if (timeData3[d.key][currentDate2]) {
					if (isNaN(timeData3[d.key][currentDate2][0].numdeaths))
						return 0
					return timeData3[d.key][currentDate2][0].numdeaths;
				}
				else {
					return 0;
				}
			});

		dataRow.append("td")
			.attr("id", "ratedeath")
			.attr("class", "tdTable")
			.text(function(d) {
				if (timeData3[d.key][currentDate2]) {
					if (isNaN(timeData3[d.key][currentDate2][0].ratedeaths))
						return "N/A"
					return d3.format(",d")(timeData3[d.key][currentDate2][0].ratedeaths);
				}
				else {
					return "0";
				}
			})
			.attr("data-order", function(d, i) {
				if (timeData3[d.key][currentDate2]) {
					if (isNaN(timeData3[d.key][currentDate2][0].ratedeaths))
						return 0
					return timeData3[d.key][currentDate2][0].ratedeaths;
				}
				else {
					return 0;
				}
			});

		dataRow.append("td")
			.attr("class", "numdeaths_last14 tdTable")
			.html(function(d) {
				if (timeData3[d.key][currentDate2]) {

					// const noteMap = notesMap.filter(function(e){
					// 	return e.pruid == d.key
					// })
					// if(noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Cases") > -1){
					// 	currentNoteNumber = noteMap[0].noteNumber;
					// 	return d3.format(",d")(timeData[d.key][currentDate][0].numtotal_last14) + "<sup>"+notesSymbols[currentNoteNumber + 3]+"</sup>";
					// }else{
					return d3.format(",d")(timeData3[d.key][currentDate2][0].numdeaths_last14);
					// }
				}
				else {
					return "0";
				}
			}).attr("data-order", function(d, i) {
				if (timeData3[d.key][currentDate2]) {
					if (isNaN(timeData3[d.key][currentDate2][0].numdeaths_last14))
						return 0
					return timeData3[d.key][currentDate2][0].numdeaths_last14;
				}
				else {
					return 0;
				}
			});


		dataRow.append("td")
			.attr("class", "ratedeaths_last14 tdTable")
			.html(function(d) {
				if (timeData3[d.key][currentDate2]) {

					// const noteMap = notesMap.filter(function(e){
					// 	return e.pruid == d.key
					// })
					// if(noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Cases") > -1){
					// 	currentNoteNumber = noteMap[0].noteNumber;
					// 	return d3.format(",d")(timeData[d.key][currentDate][0].ratetotal_last14) + "<sup>"+notesSymbols[currentNoteNumber + 3]+"</sup>";
					// }else{
					if (isNaN(timeData3[d.key][currentDate2][0].ratedeaths_last14))
						return "N/A"
					return d3.format(",d")(timeData3[d.key][currentDate2][0].ratedeaths_last14);
					// }
				}
				else {
					return "0";
				}
			})
			.attr("data-order", function(d, i) {
				if (timeData3[d.key][currentDate2]) {
					if (isNaN(timeData3[d.key][currentDate2][0].ratedeaths_last14))
						return 0
					return timeData3[d.key][currentDate2][0].ratedeaths_last14;
				}
				else {
					return 0;
				}
			});

		let printText = "";
		// "Showing 1 to 10 of 95 entries sorted by x, y with search value z"
		// x = column name
		// y = asc/desc
		// z = search value

		// this array corresponds directly with the tables columns
		let columnNames = {
			"en": ["province", "health region", "total cases", "rate* of total cases", "cases last 14 days", "rate* of cases last 14 days", "deaths", "rate* of deaths", "deaths last 14 days", "rate* of deaths last 14 days"],
			"fr": ["province", "régions sanitaires", "nombre total de cas", "taux de cas totaux", "nombre de cas (derniers 14 jours)", "taux de cas (derniers 14 jours)", "nombre de décès totaux", "taux de décès totaux", "nombre de décès (derniers 14 jours)", "taux de décès (derniers 14 jours)"]
		}
		let sortText = {
			"en": { "asc": "ascending", "desc": "descending" },
			"fr": { "asc": "croissant", "desc": "décroissant" }
		}

		let curCol = columnNames[language][curSort[0][0]];
		let curAscDesc = sortText[language][curSort[0][1]];

		// $(document).ready(function() {
		if (language == "en") {
			$('#dataTable2').DataTable({
				"dom": '<"top"lf>rt<"bottom"ip><"clear">',
				"order": curSort,
				"pageLength": curLength,
				"fnInfoCallback": function(oSettings, iStart, iEnd, iMax, iTotal, sPre) {
					// Showing 1 to 1 of 1 entries (filtered from 126 total entries)
					let curText = $("#dataTable2").DataTable().search();
					if (curText == "")
						return sPre;
					else {
						return sPre + " with search value \"" + curText + "\"";
					}
				}
			}).page(curPage).search(curSearch).draw(false);
		}
		else {
			// avec la valeur de recherche
			$('#dataTable2').DataTable({
				"oLanguage": frenchJson,
				"dom": '<"top"lf>rt<"bottom"ip><"clear">',
				"order": curSort,
				"pageLength": curLength,
				"fnInfoCallback": function(oSettings, iStart, iEnd, iMax, iTotal, sPre) {
					// Showing 1 to 1 of 1 entries (filtered from 126 total entries)
					let curText = $("#dataTable2").DataTable().search();
					if (curText == "")
						return sPre;
					else {
						return sPre + " avec la valeur de recherche \"" + curText + "\"";
					}
				}
			}).page(curPage).search(curSearch).draw(false);
 
		}
		if (language == "en") {
			printText = " ordered by " + curCol + ", " + curAscDesc
		}
		else {
			printText = " classés par " + curCol + ", " + curAscDesc
		}
		//html and css has not been added in for french yet
		d3.select("#printText").text(printText)
		$('#dataTable2').DataTable().on('order.dt', function() {
			// This will show: "Ordering on column 1 (asc)", for example
			curCol = columnNames[language][curSort[0][0]];
			curAscDesc = sortText[language][curSort[0][1]];
			if (language == "en") {
				printText = " ordered by " + curCol + ", " + curAscDesc
			}
			else {
				printText = " classés par " + curCol + ", " + curAscDesc
			}
			d3.select("#printText").text(printText)

		});
		// } );

	}

	// function drawSmallMultipleTrends(logSwitch, relativeSwitch) {
	// 	var txtTypeCasesSM = $('#dropdownType2 option:selected').text();
	// 	// define the line to be used
	// 	var smallMultipleTrendline = d3.line()
	// 		.x(function(d) { return x2(d.key); })
	// 		.y(function(d) {
	// 			return y2(d.values[0][typeCasesSM]);
	// 		});

	// 	timeData4.forEach(function(d) {
	// 		smallMultipleData.push(d.values);
	// 	});

	// 	var smallMultipleSVG = d3.select("#smallMultiple").selectAll("#smallMultiple svg")
	// 		.data(timeData4)
	// 		.enter()
	// 		.append('div')
	// 		.style("flex", "1 1 30%")
	// 		.append("svg")
	// 		.attr("width", width2 + margin2.left + margin2.right)
	// 		.attr("height", height2 + margin2.top + margin2.bottom)
	// 		.append("g")
	// 		.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")")

	// 	smallMultipleSVG.append("path")
	// 		.data(smallMultipleData)
	// 		.attr("class", "line")
	// 		.attr("stroke", "rgb(8, 81, 156)")
	// 		.transition().duration(600)
	// 		.attr("d", smallMultipleTrendline);

	// 	// Add the X Axis
	// 	smallMultipleSVG.append("g")
	// 		.attr("id", "trendX2SM")
	// 		.attr("transform", "translate(0," + height2 + ")")
	// 		.call(d3.axisBottom(x2).tickFormat(d3.timeFormat("%b %d")))
	// 		.selectAll("text")
	// 		.attr("y", 12)
	// 		.attr("x", -21)
	// 		.attr("dy", ".35em")
	// 		.attr("transform", "rotate(-45)");

	// 	// Add the Y Axis
	// 	if (logSwitch == 0) {
	// 		smallMultipleSVG.append("g")
	// 			.attr("id", "trendY2SM")
	// 			.transition()
	// 			.duration(600)
	// 			.call(d3.axisLeft(y2));
	// 	}
	// 	else {
	// 		smallMultipleSVG.append("g")
	// 			.attr("id", "trendY2SM")
	// 			.transition()
	// 			.duration(600)
	// 			.call(d3.axisLeft(yLog));
	// 	}

	// 	smallMultipleSVG.append("text")
	// 		.attr("class", "titleSMLabel")
	// 		.attr("transform", "translate(" + width2 / 2 + "," + (-10) + ")")
	// 		.attr("font-size", "16px")
	// 		.attr("text-anchor", "middle")
	// 		.attr("font-weight", "bold")
	// 		.text(function(d) {
	// 			if (language == "en") {
	// 				return d.values[0].values[0].prname;
	// 			}
	// 			else {
	// 				return d.values[0].values[0].prnameFR;
	// 			}
	// 		})

	// 	smallMultipleSVG.append("text")
	// 		.attr("class", "xAxisSMLabel")
	// 		.attr("transform", "translate(" + width2 / 2 + "," + (height2 + 60) + ")")
	// 		.attr("font-size", "14px")
	// 		.attr("text-anchor", "middle")
	// 		.text(function() {
	// 			if (language == "en") {
	// 				return "Reporting date";
	// 			}
	// 			else {
	// 				return "Date de signalement";
	// 			}
	// 		})

	// 	smallMultipleSVG.append("text")
	// 		.attr("class", "yAxisSMLabel")
	// 		.attr("transform", "translate(-45," + (height2 / 2) + ")rotate(-90)")
	// 		.attr("font-size", "14px")
	// 		.attr("text-anchor", "middle")
	// 		.text(function() {
	// 			if (language == "en") {
	// 				return "Number of " + txtTypeCasesSM.toLowerCase();
	// 			}
	// 			else {
	// 				return "Nombre de " + txtTypeCasesSM.toLowerCase();
	// 			}
	// 		})
	// }

	// function findMostRecentDataByDateType(date, type, place) {
	// 	let indexDate2 = 1;
	// 	let tempDate = date;
	// 	let startPoint = datesArray2.indexOf(date)

	// 	while (isNaN(timeData3[place][tempDate][0]["numrecover"]) || indexDate2 > datesArray2.length) {
	// 		tempDate = datesArray2[startPoint - indexDate2];
	// 		indexDate2 += 1;
	// 	}

	// 	return timeData3[1][tempDate][0][typeCases];
	// }

	function wrap(text, width) {
		text.each(function() {
			const text = d3.select(this);
			let words = text.text().split(/\s+/).reverse();
			let word;
			let line = [];
			let lineNumber = 0;
			let lineHeight = 1.1;
			let x = text.attr("x");
			let y = text.attr("y");
			let dy = 0;
			let tspan = text.text(null)
				.append("tspan")
				.attr("x", x)
				.attr("y", y)
				.attr("dy", dy + "em");
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan")
						.attr("x", x)
						.attr("y", y)
						.attr("dy", +lineHeight + dy + "em")
						.text(word);
						
						lineHeight += 1.1;
				}
			}
		});
	}

	// function wrap(text, width) {
	// 	text.each(function() {
	// 		const text = d3.select(this);
	// 		let words = text.text().split(/\s+/).reverse();
	// 		let word;
	// 		let line = [];
	// 		let lineNumber = 0;
	// 		let lineHeight = 1.1;
	// 		if(text.attr("class") == "titleTrendLabel"){
	// 		// if(d3.select("#full").classed("fullscreen")){
	// 		// 	text.attr("transform", "translate(" + ((width / 2)) + "," + (-40) + ")")
	// 		// 	lineHeight = 1.1;
	// 		// }
	// 		// else{
	// 			text.attr("transform", "translate(" + ((width / 2)) + "," + (-20) + ")")
	// 			lineHeight = 0.8;
	// 		// }
	// 		}
	// 		let x = text.attr("x");
	// 		let y = text.attr("y");
	// 		let dy = 0;
	// 		let tspan = text.text(null)
	// 			.append("tspan")
	// 			.attr("x", x)
	// 			.attr("y", y)
	// 			.attr("dy", dy + "em");
	// 		while (word = words.pop()) {
	// 			line.push(word);
	// 			tspan.text(line.join(" "));
	// 			if (tspan.node().getComputedTextLength() > width) {
	// 				line.pop();
	// 				tspan.text(line.join(" "));
	// 				line = [word];
	// 				tspan = text.append("tspan")
	// 					.attr("x", x)
	// 					.attr("y", y)
	// 					.attr("dy", +lineHeight+ "em")
	// 					.text(word);
	// 					if(text.node().className.baseVal == "titleTrendLabel")
	// 						lineHeight += lineHeight;
	// 			}

	// 		}
	// 	});
	// }

	function isInteger(num) {
		return (num ^ 0) === num;
	}

};

// $(document).ready(function() {
// 	$("[data-figure=1]").on("click", function() {

// 		let stat = $(this).data("type-stat");
// 		let measure = $(this).data("type-measure");

// 		$("#dropdownType3").val(stat).change()
// 		$("#dropdownType1").val(measure).change()

// 		window.history.pushState(null, null, window.location.origin + window.location.pathname + '?stat='+$("#dropdownType3").val()+"&measure="+ $("#dropdownType1").val()+"#a2");		
// 	})
// })
