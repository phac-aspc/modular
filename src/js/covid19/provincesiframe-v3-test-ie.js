var getParams = function(url) {
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

function getlength(number) {
	if(number == null)
		return 3;
	return number.toString().length;
}

function getCircleRadius(numberLength, pruid) {
	let canadaAdd = 2
	if (pruid && pruid == "1") {
		canadaAdd = 6;
	}

	if (numberLength > 8) {
		return 36 + canadaAdd;
	}
	else if (numberLength > 7) {
		return 34 + canadaAdd;
	}
	else if (numberLength > 6) {
		return 32 + canadaAdd;
	}
	else if (numberLength > 5) {
		return 28 + canadaAdd;
	}
	else if (numberLength > 4) {
		return 26 + canadaAdd;
	}
	else {
		return 24 + canadaAdd;
	}
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

let isIE = /*@cc_on!@*/ false || !!document.documentMode;
if (/Edge\/\d./i.test(navigator.userAgent))
	isIE = true;

var language = $('html').attr('lang');
// parse the date / time
var parseTime = d3.timeParse("%d-%m-%Y");
var parseTimeReverse = d3.timeParse("%Y-%m-%d");
var parseTimeISC = d3.timeParse("%m-%d-%Y");
var formatTimeReverse = d3.timeFormat("%d-%m-%Y");
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

var currentRegion, currentDate, currentDateISC, indexDate, timeData, timeData2, timeDataISC, timeDataISC2, datesArray, datesArrayISC, nestedData, nestedDataISC;
var tempNums = { "1": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "24": 0, "35": 0, "46": 0, "47": 0, "48": 0, "59": 0, "60": 0, "61": 0, "62": 0, "99": 0 };
//Dropdown values
let queryStringValues = getParams(window.location.href);

let queryStringOptions = {
	"pt": {
		"num": ["total", "deaths", "active", "total_last14", "deaths_last14", "total_last7", "deaths_last7", "tests", "recover"],
		"rate": ["total", "deaths", "active", "total_last14", "deaths_last14", "total_last7", "deaths_last7"],
		"avg": ["tests_last7", "ratetests_last7", "positivity_last7"]
	}
}

//once the map and the small multiples show the same measures, this one can be deleted
let queryStringOptionsMultiples = {
	"pt": {
		"num": ["total", "deaths", "active", "total_last14", "deaths_last14", "total_last7", "deaths_last7", "tests", "recover"],
		"rate": ["total", "deaths", "active", "total_last14", "deaths_last14", "total_last7", "deaths_last7"],
		"avg": ["tests_last7", "ratetests_last7", "positivity_last7", "total_last7", "deaths_last7"]
	}
}

let valueDictionary;
if(language == "en"){
	valueDictionary = {
		"active": "active cases",
		"total": "total cases",
		"deaths": "deaths",
		"total_last7": "cases (last 7 days)",
		"total_last14": "cases (last 14 days)",
		"deaths_last7": "deaths (last 7 days)",
		"deaths_last14": "deaths (last 14 days)",
		"recover": "resolved cases",
		"tests": "tests performed",
		"tests_last7": "tests performed (last 7 days)",
		"ratetests_last7": "tests per 100,000 population (last 7 days)",
		"positivity_last7": "percent positivity (last 7 days)"
	}
}else{
	valueDictionary = {
		"active": "cas actifs",
		"total": "cas totaux",
		"deaths": "décès",
		"total_last7": "cas (derniers 7 jours)",
		"total_last14": "cas (derniers 14 jours)",
		"deaths_last7": "décès (derniers 7 jours)",
		"deaths_last14": "décès (derniers 14 jours)",
		"recover": "personnes rétablies",
		"tests": "tests effectués (total)",
		"tests_last7": "tests effectués (derniers 7 jours)",
		"ratetests_last7": "tests par 100 000 personnes (derniers 7 jours)",
		"positivity_last7": "pourcentage de tests positifs (derniers 7 jours)"
	}
}

let displayOptions = function(map,measure){
	if(typeof(map) == "undefined")
		map = "pt"
	
	if(typeof(measure) != "undefined"){
		
		d3.selectAll("#dropdownType3 option").style("display", "none")
		d3.selectAll("#dropdownType1 option").style("display", "none")
		
		Object.keys(queryStringOptions[map]).forEach(function(d,i){
			d3.selectAll("#dropdownType3 option[value='"+d+"']").style("display", "")
		})
		
		d3.selectAll("#dropdownType1 option").remove()
		queryStringOptions[map][measure].forEach(function(d,i){
			d3.selectAll("#dropdownType1").append("option")
			.attr("class", "toggleBtns")
				.attr("value", d)
				.text(valueDictionary[d])
		})
		
		if(measure == "rate")
			d3.select(".txtTotalMod").style("display", "")
		else
			d3.select(".txtTotalMod").style("display", "none")
	}
		
		
			
}

let displayOptionsMultiples = function(map,measure){
	d3.selectAll("#dropdownType5 option").style("display", "none")
	d3.selectAll("#dropdownType6 option").style("display", "none")
	
	Object.keys(queryStringOptions[map]).forEach(function(d,i){
		d3.selectAll("#dropdownType5 option[value='"+d+"']").style("display", "")
	})
	
	d3.selectAll("#dropdownType6 option").remove()
	queryStringOptions[map][measure].forEach(function(d,i){
		d3.selectAll("#dropdownType6").append("option")
		.attr("class", "toggleBtns")
			.attr("value", d)
			.text(valueDictionary[d])
	})
}
													// num      // total
let updateSelectOptions = function(changedDropdown, curStat, curMeasure){
	let curMap = $("#dropdownType4").val()
	let newMeasure = $("#dropdownType1").val()
	let newStat = $("#dropdownType3").val()
	
	if(typeof(curMap) == "undefined" || curMap == null)
		curMap = "pt"
		
	// if the PT/HR dropdown changes, we need to make sure that the current measure exists, otherwise set it to the first/default
	// example -> if on PT/avg and switching to HR, it should become HR/num, furthermore, we will need to check it the current stat exists in the new measure and repeat the same idea as 

	// This series of if statements will make sure measure/stat are good values 
	
	
	//PT/HR
	if(Object.keys(queryStringOptions[curMap]).indexOf(newStat) != -1){
		curStat = newStat
	}
	else{
		curStat = Object.keys(queryStringOptions[curMap])[0]
	}
	if(queryStringOptions[curMap][curStat].indexOf(newMeasure) != -1){
		curMeasure = newMeasure;
	}
	else{
		curMeasure = queryStringOptions[curMap][curStat][0]
	}
	
	//Measure
	
	if(changedDropdown.attr("id") == 'dropdownType4' || changedDropdown.attr("id") == 'dropdownType3'){
		displayOptions(curMap, curStat)
	}
	
	//hide/show options
	
	//set query string
	
	window.history.replaceState(null, null, window.location.origin + window.location.pathname + '?stat=' + curStat + "&measure=" + curMeasure + "&map=" + curMap + "#a2");
	
	
	//set dropdown values
	$("#dropdownType3").val(curStat)
	$("#dropdownType1").val(curMeasure)
	
	
}

if (typeof(queryStringValues.stat) != "undefined" && typeof(queryStringValues.measure) != "undefined" && typeof(queryStringValues.map) != "undefined") {
	if (queryStringOptions[queryStringValues.map]) {
		if (queryStringOptions[queryStringValues.map][queryStringValues.stat]) {
			if (queryStringOptions[queryStringValues.map][queryStringValues.stat].indexOf(queryStringValues.measure) != -1) {
				$("#dropdownType3").val(queryStringValues.stat)
				$("#dropdownType4").val(queryStringValues.map)
				$("#dropdownType1").val(queryStringValues.measure)
				displayOptions(queryStringValues.map, queryStringValues.stat)
				// if ($('#dropdownType3').val() == "rate") {
				// 	//$('#dropdownType1 option[value="deaths"]').css("display","none");
				// 	$('#dropdownType1 option').css("display","");
				// 	$('#dropdownType1 option').prop("disabled","");
				// 	$('#dropdownType1 option[value="recover"]').hide();
				// 	$('.txtTotalMod').css('display', '');
				// 	$('#dropdownType1 option[value="tests"]').prop("disabled", "true");
				// 	$('#dropdownType1 option[value="tests"]').css("display", "none");
				// 	$('#dropdownType1 option[value="tests_last7"]').prop("disabled", "true");
				// 	$('#dropdownType1 option[value="tests_last7"]').css("display", "none");
				// 	$('#dropdownType1 option[value="ratetests_last7"]').prop("disabled", "true");
				// 	$('#dropdownType1 option[value="ratetests_last7"]').css("display", "none");
				// 	$('#dropdownType1 option[value="positivity_last7"]').prop("disabled", "true");
				// 	$('#dropdownType1 option[value="positivity_last7"]').css("display", "none");
				// }
				// else if ($('#dropdownType3').val() == "avg") {
				// 	$('#dropdownType1 option[value="recover"]').hide();
				// 	$('#dropdownType1 option[value="tests_last7"]').prop("disabled", "");
				// 	$('#dropdownType1 option[value="tests_last7"]').css("display", "");
				// 	$('#dropdownType1 option[value="ratetests_last7"]').prop("disabled", "");
				// 	$('#dropdownType1 option[value="ratetests_last7"]').css("display", "");
				// 	$('#dropdownType1 option[value="positivity_last7"]').prop("disabled", "");
				// 	$('#dropdownType1 option[value="positivity_last7"]').css("display", "");
				// }
				// else {
				// 	//$('#dropdownType1 option[value="deaths"]').css("display",""); 
				// 	$('#dropdownType1 option').css("display","");
				// 	$('#dropdownType1 option').prop("disabled","");
				// 	$('#dropdownType1 option[value="recover"]').show();
				// 	$('.txtTotalMod').css('display', 'none');
				// 	$('#dropdownType1 option[value="tests_last7"]').prop("disabled", "true");
				// 	$('#dropdownType1 option[value="tests_last7"]').css("display", "none");
				// 	$('#dropdownType1 option[value="ratetests_last7"]').prop("disabled", "true");
				// 	$('#dropdownType1 option[value="ratetests_last7"]').css("display", "none");
				// 	$('#dropdownType1 option[value="positivity_last7"]').prop("disabled", "true");
				// 	$('#dropdownType1 option[value="positivity_last7"]').css("display", "none");
				// }
				
				if ($("#dropdownType4").val() == "pt") {
					d3.select("#map1").style("display", "");
					d3.select("#map2").style("display", "none");
					d3.selectAll(".pthr").text(function(d){
						if(language == "en"){
							return "provinces and territories";
						}else{
							return "provinces et les territoires";
						}
					})
					d3.selectAll(".hrremove").style("display","");
				}
				else {
					d3.select("#map1").style("display", "none");
					d3.select("#map2").style("display", "");
					d3.selectAll(".pthr").text(function(d){
						if(language == "en"){
							return "health regions";
						}else{
							return "régions de santé";
						}
					})
					d3.selectAll(".hrremove").style("display","none");
				}

			}

		}
	}
}
else if (typeof(queryStringValues.stat) != "undefined" && typeof(queryStringValues.measure) != "undefined") {
	if (queryStringOptions["pt"][queryStringValues.stat]) {
		if (queryStringOptions["pt"][queryStringValues.stat].indexOf(queryStringValues.measure) != -1) {
			$("#dropdownType3").val(queryStringValues.stat)
			$("#dropdownType1").val(queryStringValues.measure)
			displayOptions($("#dropdownType4").val(), queryStringValues.stat)
			// if ($('#dropdownType3').val() == "rate") {
			// 	//$('#dropdownType1 option[value="deaths"]').css("display","none");
			// 	$('#dropdownType1 option').css("display","");
			// 	$('#dropdownType1 option').prop("disabled","");
			// 	$('.txtTotalMod').css('display', '');
			// 	$('#dropdownType1 option[value="recover"]').hide();
			// 	$('#dropdownType1 option[value="tests"]').prop("disabled", "true");
			// 	$('#dropdownType1 option[value="tests"]').css("display", "none");
			// 	$('#dropdownType1 option[value="tests_last7"]').prop("disabled", "true");
			// 	$('#dropdownType1 option[value="tests_last7"]').css("display", "none");
			// 	$('#dropdownType1 option[value="ratetests_last7"]').prop("disabled", "true");
			// 	$('#dropdownType1 option[value="ratetests_last7"]').css("display", "none");
			// 	$('#dropdownType1 option[value="positivity_last7"]').prop("disabled", "true");
			// 	$('#dropdownType1 option[value="positivity_last7"]').css("display", "none");
			// }
			// else if ($('#dropdownType3').val() == "avg") {
			// 	$('#dropdownType1 option[value="recover"]').hide();
			// 	$('#dropdownType1 option[value="tests_last7"]').prop("disabled", "");
			// 	$('#dropdownType1 option[value="tests_last7"]').css("display", "");
			// 	$('#dropdownType1 option[value="ratetests_last7"]').prop("disabled", "");
			// 	$('#dropdownType1 option[value="ratetests_last7"]').css("display", "");
			// 	$('#dropdownType1 option[value="positivity_last7"]').prop("disabled", "");
			// 	$('#dropdownType1 option[value="positivity_last7"]').css("display", "");
			// }
			// else {
			// 	//$('#dropdownType1 option[value="deaths"]').css("display","");
			// 	$('#dropdownType1 option').css("display","");
			// 	$('#dropdownType1 option').prop("disabled","");
			// 	$('.txtTotalMod').css('display', 'none');
			// 	$('#dropdownType1 option[value="recover"]').show();
			// 	$('#dropdownType1 option[value="tests_last7"]').prop("disabled", "true");
			// 	$('#dropdownType1 option[value="tests_last7"]').css("display", "none");
			// 	$('#dropdownType1 option[value="ratetests_last7"]').prop("disabled", "true");
			// 	$('#dropdownType1 option[value="ratetests_last7"]').css("display", "none");
			// 	$('#dropdownType1 option[value="positivity_last7"]').prop("disabled", "true");
			// 	$('#dropdownType1 option[value="positivity_last7"]').css("display", "none");
			// }

		}

	}
}

var typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
var typeMod = $('#dropdownType3').val();
var txtTypeMod = $('#dropdownType3 option:selected').text();
var typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
var txtTypeCases = $('#dropdownType1 option:selected').text();
var typeCasesSM = $('#dropdownType2').val();
var txtTypeCasesSM = $('#dropdownType2 option:selected').text();

$(document).ready(function(){
	displayOptions($("#dropdownType4").val(), $("#dropdownType3").val())
})

var iframeElementMap = document.getElementById("covid19TableContent");
var test1 = d3.select(iframeElementMap);

//Legend scale
var scale = 15000;
var scalePercent = 200;
var scaleTests = 250000;

var animateSwitch;
//Trendline//
// set the dimensions and margins of the graph
var margin = { top: 60, right: 15, bottom: 70, left: 54 },
	width = 292.5 - margin.left - margin.right,
	height = 230 - margin.top - margin.bottom;
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

const ordinalSuffixes = ['th', 'st', 'nd', 'rd'];

function ordinalSuffix(number) {
	const value = number % 100;
	return ordinalSuffixes[(value - 20) % 10] || ordinalSuffixes[value] || ordinalSuffixes[0];
}

//Load Data
var csvfiles = [
	'/src/data/covidLive/covid19-updateTime.csv', //0
	'/src/data/covidLive/covid19.csv', //1 
	'/src/data/covidLive/covid19-epiSummary-exceptions.csv', //2
	'/src/data/covidLive/covid19-isc.csv', //3
	'/src/data/covidLive/covid19-epiSummary-labIndicators.csv' //3
]
var promises = [];
csvfiles.forEach(function(url) {
	promises.push(d3.csv(url))
});
promises.push(d3.json('/src/json/Can_PR2016.json'));

if (Promise && !Promise.allSettled) {
  Promise.allSettled = function (promises) {
    return Promise.all(promises.map(function (promise) {
      return promise.then(function (value) {
        return { state: 'fulfilled', value: value };
      }).catch(function (reason) {
        return { state: 'rejected', reason: reason };
      });
    }));
  };
}

Promise.allSettled(promises).then(function(values) {
	processDataMap(values[0].value, values[1].value, values[2].value, values[3].value, values[4].value);
	return values[5].value;
}).then(function(mapJSON) {
	buildMap(mapJSON);
}).catch(function(e) {
    console.log(e);
});

var notesMap = [],
	numberOfNotes = 0,
	typesOfNotes = [];
var dateField, data, dataExceptions, dataISC, labIndicators, exceptions;

function processDataMap(dateField, data, dataExceptions, dataISC, labIndicators) {	
	
	dataExceptions.forEach(function(d, i) {
		typesOfNotes = [];
		if (d["Notes Map"] != "" && d["Notes Map"] != undefined) {
			for (var prop in d) {
				if (((prop == "Notes Cases") || (prop == "Notes Deaths") || (prop == "Notes Tests") || (prop == "Notes Recovered (Map only)") || (prop == "Notes Active (Map only)")) && d[prop] == "TRUE") {
					if (prop == "Notes Cases") {
						typesOfNotes.push("Cases");
					}
					else if (prop == "Notes Deaths") {
						typesOfNotes.push("Deaths")
					}
					else if (prop == "Notes Tests") {
						typesOfNotes.push("Tests")
					}
					else if (prop == "Notes Recovered (Map only)") {
						typesOfNotes.push("Recovered")
					}
					else if (prop == "Notes Active (Map only)") {
						typesOfNotes.push("Active")
					}
				}
			}
			notesMap.push({ pruid: d.PRUID, noteNumber: numberOfNotes, typesOfNotes: typesOfNotes });
			numberOfNotes++;
		}
	})

	exceptions = d3.nest()
		.key(function(d) { return d.PRUID; })
		.object(dataExceptions);
	// var exceptions = dataExceptions;

	datesArray = [];
	var dataTime = data.filter(function(d) { return d.pruid != "99"; })
	timeData = d3.nest()
		.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
		.key(function(d) { if (datesArray.indexOf(d.date) < 0) { datesArray.push(d.date); } return d.date; }).sortKeys(d3.ascending)
		.object(dataTime);

	datesArrayTests = [];
	// format the data
	labIndicators.forEach(function(d){
		d.date = formatTimeReverse(parseTimeReverse(d.date));
		if (datesArrayTests.indexOf(d.date) < 0) { datesArrayTests.push(d.date); }
		if (d.avgtests_last7 == "") {
			d.avgtests_last7 = null;
		}
		else {
			d.avgtests_last7 = +d.avgtests_last7;
		}
		if (d.avgratetests_last7 == "") {
			d.avgratetests_last7 = null;
		}
		else {
			d.avgratetests_last7 = +d.avgratetests_last7;
		}
		if (d.avgpositivity_last7 == "") {
			d.avgpositivity_last7 = null;
		}
		else {
			d.avgpositivity_last7 = +d.avgpositivity_last7;
		}
			
	})
/* 	const headers = [...new Set(data.columns.concat(labIndicators.columns))].filter(function(d) {
	  return d !== "date"
	}); */
	const headers = ["pruid", "prname", "prnameFR", "update", "numconf", "numprob", "numdeaths", "numtotal", "numtested", "numtests", "numrecover", "percentrecover", "ratetested", "ratetests", "numtoday", "percentoday", "ratetotal", "ratedeaths", "numdeathstoday", "percentdeath", "numtestedtoday", "numteststoday", "numrecoveredtoday", "percentactive", "numactive", "rateactive", "numtotal_last14", "ratetotal_last14", "numdeaths_last14", "ratedeaths_last14", "numtotal_last7", "ratetotal_last7", "numdeaths_last7", "ratedeaths_last7", "avgtotal_last7", "avgincidence_last7", "avgdeaths_last7", "avgratedeaths_last7", "avgtests_last7", "avgratetests_last7", "avgpositivity_last7"];
	let mergedData = [];
	
	function altFind(arr, callback) {
  for (var i = 0; i < arr.length; i++) {
    var match = callback(arr[i]);
    if (match) {
      return arr[i];
    }
  }
}

// var result = altFind(data, function(e) {
//   return e.id == 2;
// })


	data.concat(labIndicators).forEach(function(row) {
	  //let foundObject = mergedData.find(function(d) {
	  //  return d.date === row.date && d.pruid === row.pruid;
	  //});
	   var foundObject = altFind(mergedData, function(d) {
return d.date === row.date && d.pruid === row.pruid;
})
	  if (foundObject) {
	    headers.forEach(function(d) {
	      if (row[d]) foundObject[d] = row[d];
	    });
	  } else {
	    headers.forEach(function(d) {
	      if (!row[d]) row[d] = "";
	    });
	    mergedData.push(row)
	  };
	});
		
	data = mergedData;	

	//Set current date to default (latest data)
	if (typeCases == "numtoday") {
		currentDate = datesArray[datesArray.length - 2];
	} else if(typeCases == "numtests" || typeCases == "avgtests_last7" || typeCases == "avgratetests_last7" || typeCases == "avgpositivity_last7") {
		currentDate = datesArrayTests[datesArrayTests.length - 1];
	} else {
		currentDate = datesArray[datesArray.length - 1];
	}
	
	currentDateLab = datesArrayTests[datesArrayTests.length - 1];	

    if(language == "en"){
		var formatTime = d3.timeFormat("%B %-d, %Y, %-I %p EST");
		var parseTime3 = d3.timeParse("%Y-%m-%d %H:%M");
		var parseTime2 = d3.timeParse("%d-%m-%Y %H:%M");
		$(".updateTime").text(formatTime(parseTime2(dateField["columns"][0])).replace("PM", "pm").replace("AM", "am"));
		$(".updateTime2").text(formatTime(parseTime3(dateField["columns"][0])).replace("PM", "pm").replace("AM", "am"));
		if(typeCases == "numtests" || typeCases == "avgtests_last7" || typeCases == "avgratetests_last7" || typeCases == "avgpositivity_last7") {
			$(".updateTime").text(formatTime(parseTime2(datesArrayTests[datesArrayTests.length - 1]+" 17:00")).replace("PM", "pm").replace("AM", "am"));
		}
        d3.select("#updateTime").text(dateField["columns"][0]);
    }else{
	    var formatTime = d3.timeFormat("%-d %B %Y, %-H h HNE");
		var parseTime3 = d3.timeParse("%Y-%m-%d %H:%M");
		var parseTime2 = d3.timeParse("%d-%m-%Y %H:%M");
        $(".updateTime").text(formatTime(parseTime2(dateField["columns"][0])));
		$(".updateTime2").text(formatTime(parseTime3(dateField["columns"][0])));
		if(typeCases == "numtests" || typeCases == "avgtests_last7" || typeCases == "avgratetests_last7" || typeCases == "avgpositivity_last7") {
			$(".updateTime").text(formatTime(parseTime2(datesArrayTests[datesArrayTests.length - 1]+" 17:00")));
		}
        d3.select("#updateTime").text(dateField["columns"][0].replace(":"," h "));
    }

	var timeData2SortOrder = ["1", "59", "48", "47", "46", "35", "24", "10", "13", "12", "11", "60", "61", "62", "98", "99"];

	/* 	var timeData2 = d3.nest()
			.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
			.key(function(d) { return +parseTime(d.date); }).sortKeys(d3.ascending)
			.entries(data); */

	timeData2 = d3.nest()
		.key(function(d) { return d.pruid; }).sortKeys(function(a, b) {
			return timeData2SortOrder.indexOf(a) - timeData2SortOrder.indexOf(b);
		}).key(function(d) { return +parseTime(d.date); }).sortKeys(d3.ascending)
		.entries(dataTime);

	d3.selectAll(".txtCurrentDate").text(function() {
		let timeValue;
		if (language == "en") {
			timeValue = d3.timeFormat("%B")(parseTime(currentDate)) + " " + d3.timeFormat("%e")(parseTime(currentDate)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
		}
		else {
			timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
		}
		d3.select("#descText2").text(timeValue);
		return timeValue;
	})

	d3.selectAll(".numArticle").text(function() {
		let txtNumArticle;
		if (language == "en") {
			if ((typeCases == "numdeaths") || (typeCases == "ratedeaths")) {
				return "related to";
			}
			else if (typeCases == "numrecover") {
				return "from";
			}
			else if ((typeCases == "numtests") || (typeCases == "ratetests")) {
				return "for";
			}
			else {
				return "of";
			}
			return txtNumArticle;
		}
		else {
			if ((typeCases == "numtests") || (typeCases == "ratetests")) {
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

	/* 	d3.selectAll(".numArticle2").text(function() {
			let txtNumArticle2;
			if (typeCases == "numtests") {
				txtNumArticle2 = "d'";
			}
			else {
				txtNumArticle2 = "de ";
			}
			return txtNumArticle2;
		}); */

	// format the data
	data.forEach(function(d) {
		d.numconf = +d.numconf;
		d.numprob = +d.numprob;
		d.numtotal = +d.numtotal;
		d.numdeaths = +d.numdeaths;
		d.numtests = +d.numtests;
		d.deathstoday = +d.deathstoday;
		if (d.numrecover == "") {
			d.numrecover = null;
		}
		else {
			d.numrecover = +d.numrecover;
		}
		d.numactive = +d.numactive;
		d.numtoday = +d.numtoday;
		d.rateactive = +d.rateactive;
		d.ratetotal = +d.ratetotal;
		d.ratetests = +d.ratetests;
		d.percentrecover = +d.percentrecover;
		d.percentactive = +d.percentactive;
		d.ratedeaths = +d.ratedeaths;
		// d.percentoday = +d.percentoday;
		d.HRUID = +d.pruid;
		d.trend = timeData[+d.pruid];
		d.numtotal_last7 = +d.numtotal_last7;
		d.numtotal_last14 = +d.numtotal_last14;
		d.ratetotal_last7 = +d.ratetotal_last7;
		d.ratetotal_last14 = +d.ratetotal_last14;
		d.numdeaths_last7 = +d.numdeaths_last7;
		d.numdeaths_last14 = +d.numdeaths_last14;
		d.ratedeaths_last7 = +d.ratedeaths_last7;
		d.ratedeaths_last14 = +d.ratedeaths_last14;
		d.avgtotal_last7 = +d.avgtotal_last7;
		d.avgincidence_last7 = +d.avgincidence_last7;
		d.avgdeaths_last7 = +d.avgdeaths_last7;
		if (d.avgtests_last7 == "") {
			d.avgtests_last7 = null;
		}
		else {
			d.avgtests_last7 = +d.avgtests_last7;
		}
		if (d.avgratetests_last7 == "") {
			d.avgratetests_last7 = null;
		}
		else {
			d.avgratetests_last7 = +d.avgratetests_last7;
		}
		if (d.avgpositivity_last7 == "") {
			d.avgpositivity_last7 = null;
		}
		else {
			d.avgpositivity_last7 = +d.avgpositivity_last7;
		}
	});

	nestedData = d3.nest()
		.key(function(d) { return d.pruid; })
		.object(data);

	let dataISCNumberColumns = ["numconf", "numprob", "numtotal", "numdeaths", "numtests", "deathstoday", 
	"numrecover", "numactive", "numtoday", "rateactive", "ratetotal", "ratetests", "percentrecover", "percentactive", "ratedeaths", "numtotal_last7", 
	"numtotal_last14", "ratetotal_last7", "ratetotal_last14", "numdeaths_last7", "numdeaths_last14", "ratedeaths_last7", "ratedeaths_last14", "avgtotal_last7", "avgincidence_last7", "avgdeaths_last7","avgtests_last7","avgratetests_last7","avgpositivity_last7"];
	dataISC.forEach(function(d) {
		// %d-%m-%Y
		d.date = d3.timeFormat("%d-%m-%Y")(parseTimeISC(d.date));
		dataISCNumberColumns.forEach(function(col, i){
			if(d[col] == ""){
				d[col] = null;
			}
			else{
				d[col] = +d[col]
			}
		})
		
		d.HRUID = +d.pruid;
		d.trend = timeData[+d.pruid]
	});

	datesArrayISC = [];
	timeDataISC = d3.nest()
		.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
		.key(function(d) { if (datesArrayISC.indexOf(d.date) < 0) { datesArrayISC.push(d.date); } return d.date; }).sortKeys(d3.ascending)
		.object(dataISC);

	currentDateISC = datesArrayISC[datesArrayISC.length - 1];

	timeDataISC2 = d3.nest()
		.key(function(d) { return d.pruid; }).sortKeys(function(a, b) {
			return timeData2SortOrder.indexOf(a) - timeData2SortOrder.indexOf(b);
		}).key(function(d) { return +parseTime(d.date); }).sortKeys(d3.ascending)
		.entries(dataISC);

	nestedDataISC = d3.nest()
		.key(function(d) { return d.pruid; })
		.object(dataISC);
	
	timeDataLab = d3.nest()
		.key(function(d) { return d.pruid; }).sortKeys(function(a, b) {
			return timeData2SortOrder.indexOf(a) - timeData2SortOrder.indexOf(b);
		}).key(function(d) { return d.date; }).sortKeys(d3.ascending)
		.object(labIndicators);
	
	timeDataLab2 = d3.nest()
		.key(function(d) { return d.pruid; }).sortKeys(function(a, b) {
			return timeData2SortOrder.indexOf(a) - timeData2SortOrder.indexOf(b);
		}).key(function(d) { return +parseTime(d.date); }).sortKeys(d3.ascending)
		.entries(labIndicators);

}

function buildMap(mapJSON) {

	// //Load JSON
	// var jsonfiles = [
	//     '/src/json/Can_PR2016.json' //0
	// ]
	// var promises = [];
	// jsonfiles.forEach(function(url) {
	//     promises.push(d3.json(url))
	// });
	// Promise.all(promises).then(function(values) {
	// 	buildMap2(values[0])
	// }).then(function(){
	//     // buildMap();
	// });
	buildMap2(mapJSON);


	function buildMap2(mapJSON) {
		svg = d3.select('#map')
			.append('svg')
			.attr("id", "svg")
			.attr('width', "100%")
			.attr('height', function(d) {
				if (isIE) {
					return '750px';
				}
				else {}
			})
			.attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox", "0 0 730 650");

		var healthregions = topojson.feature(mapJSON, mapJSON.objects.Can_PR2016);

		const projection = d3.geoIdentity(function(x, y) { return [x, -y]; })
			.reflectY(true).scale(0.00013).translate([-460, 700]);

		var path = d3.geoPath().projection(projection);

		var hrid = svg
			.append('g')
			.attr("id", "mapGroup")
			.attr("transform", "translate(0,0)")
			.selectAll('g')
			.data(healthregions.features)
			.enter()

		hrid
			.append("g")
			.attr("class", "regions")
			.attr("id", function(d) { return "g" + d.properties["PRUID"] })
			.attr("tabindex", 0)
			.attr("data-taborder", function(d) {
				return d.properties.TABORDER;
			})
			.attr("focusable", "true")
			.append('path')
			.attr("id", function(d) { return "path" + d.properties["PRUID"] })
			.attr("class", "PRUID")
			.attr("d", path)
			.attr("stroke", "#828080")
			.attr("stroke-width", 1)

		const regionsCircles = d3.select("#mapGroup").selectAll(".regions")
			.append("g")
			.data(healthregions.features.filter(function(d) {
				return d.properties.PRUID;
			}))
			.attr("class", "regionValues");

		//Append circle label backgrounds
		regionsCircles.append("circle")
			.attr("class", "regionValuesCircle")
			.attr("r", function(d) {
				return getCircleRadius(getlength(timeData[d.properties.PRUID][currentDate][0][typeCases]));
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
					if(timeData[d.properties.PRUID][currentDate][0][typeCases] == null)
						return "N/A"
					return timeData[d.properties.PRUID][currentDate][0][typeCases];
				}
				else {
					if(timeData[d.properties.PRUID][currentDate][0][typeCases] == null)
						return "s.o."
					return (d3.format("0.1f")(timeData[d.properties.PRUID][currentDate][0][typeCases])).replace(",", " ");
				}
			})
			.attr("transform", function(d) {
				return $("#g" + d.properties.PRUID + " .regionValues circle").attr("transform");
			})
			.attr("font-size", function() {
				if (typeCases == "numtests") {
					return "13px";
				}
				else {
					return "15px";
				};
			})
			.attr("fill", "white")
			.attr("class", "regionCircleText")
			.style("text-anchor", "middle")
			.style("fill", "white")
			.transition()
			.duration(600)
			.tween("text", function(d) {
				const that = d3.select(this);
				let format;
				if(typeCases == "avgpositivity_last7"){
					format = d3.format("0.1f");
				}else{
					format = d3.format(",d");	
				}
				if (language == "en") {
					const i = d3.interpolateNumber(0, timeData[d.properties.PRUID][currentDate][0][typeCases]);
					return function(t) { that.text(format(i(t))); };
				}
				else {
					const i = d3.interpolateNumber(0, timeData[d.properties.PRUID][currentDate][0][typeCases]);
					return function(t) { that.text(format(i(t)).replace(",", " ")); };
				}
			})


		//Tweak positioning and size of text
		d3.selectAll('.regionCircleText').each(function(d) {
			const currentTransform = $("#g" + d.properties.PRUID + " .regionValues circle").attr("transform");
			const transformVals = currentTransform.substring(currentTransform.indexOf("(") + 1, currentTransform.indexOf(")")).split(/[\s,]+/);
			let offsetsCircle;
			let offsetsLine;

			if (d.properties.PRUID == 13) {
				offsetsCircle = [0, 55];
				offsetsLine = [0, 33];
				$("#g" + d.properties.PRUID + " .regionValues circle").attr("transform", "translate(" + ((+transformVals[0]) + (+offsetsCircle[0])) + "," + ((+transformVals[1]) + (+offsetsCircle[1])) + ")");
				d3.select(this.parentNode).append("line")
					.attr("class", "regionDeathsLine")
					.attr("x1", (+transformVals[0]))
					.attr("y1", (+transformVals[1]))
					.attr("x2", ((+transformVals[0]) + (+offsetsLine[0])))
					.attr("y2", ((+transformVals[1]) + (+offsetsLine[1])))
					.attr("stroke-width", 2)
					.attr("stroke", "rgb(54, 54, 54)")
			}
			else if (d.properties.PRUID == 12) {
				offsetsCircle = [55, 0];
				offsetsLine = [33, 0];
				$("#g" + d.properties.PRUID + " .regionValues circle").attr("transform", "translate(" + ((+transformVals[0]) + (+offsetsCircle[0])) + "," + ((+transformVals[1]) + (+offsetsCircle[1])) + ")");
				d3.select(this.parentNode).append("line")
					.attr("class", "regionDeathsLine")
					.attr("x1", (+transformVals[0]))
					.attr("y1", (+transformVals[1]))
					.attr("x2", ((+transformVals[0]) + (+offsetsLine[0])))
					.attr("y2", ((+transformVals[1]) + (+offsetsLine[1])))
					.attr("stroke-width", 2)
					.attr("stroke", "rgb(54, 54, 54)")
			}
			else if (d.properties.PRUID == 11) {
				offsetsCircle = [55, -15];
				offsetsLine = [33, -15];
				$("#g" + d.properties.PRUID + " .regionValues circle").attr("transform", "translate(" + ((+transformVals[0]) + (+offsetsCircle[0])) + "," + ((+transformVals[1]) + (+offsetsCircle[1])) + ")");
				d3.select(this.parentNode).append("line")
					.attr("class", "regionDeathsLine")
					.attr("x1", (+transformVals[0]))
					.attr("y1", (+transformVals[1]))
					.attr("x2", ((+transformVals[0]) + (+offsetsLine[0])))
					.attr("y2", ((+transformVals[1]) + (+offsetsLine[1])))
					.attr("stroke-width", 2)
					.attr("stroke", "rgb(54, 54, 54)")
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
		const repatriated = d3.select("#mapGroup").datum(nestedDataISC[98][0]).append("g")
			.attr("id", "repatriated")
			.attr("tabindex", 0)
			.attr("data-taborder", 15)
			.attr("focusable", true)
			.on("mouseover", function(d) {
				//Add
				// d3.select(this).raise();

				currentRegion = d3.select(this).data()[0];
				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

				var txtName;
				if (language == "en") {
					txtName = "on First Nations reserves";
				}
				else {
					txtName = "dans les réserves des Premières Nations";
				}
				d3.select("#txtName").text(function() {
					return txtName;
				})
				d3.select("#txtTotal").text(function() {
					if(timeDataISC[currentRegion.pruid][currentDateISC][0][typeCases] == null){
						if(language == "en"){
							return "N/A";
						}else{
							return "s.o.";
						}
					}else{
						return generateTxtTotal(timeDataISC[currentRegion.pruid][currentDateISC][0][typeCases], currentRegion.pruid, typeCases);
					}
				});

				d3.selectAll(".ISCDescTxt, .ISCDescTxt2").style("display", "");

				d3.select("#textarea").style("margin-top", "20px");
				//.style("height", "295px");

				d3.selectAll(".txtCurrentDate").text(function() {
					let timeValue;
					if (language == "en") {
						timeValue = d3.timeFormat("%B")(parseTime(currentDateISC)) + " " + d3.timeFormat("%e")(parseTime(currentDateISC)) + ", " + d3.timeFormat("%Y")(parseTime(currentDateISC)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
					}
					else {
						timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDateISC));
					}
					d3.select("#descText2").text(timeValue);
					return timeValue;
				})

				d3.select("#textArticle1").text(function() {
					if (language == "en") {
						return "";
					}
					else {
						return "";
					}
				});
				// .call(wrap,220)

				updateTrend(currentRegion.trend);
				$(".backgroundRepatriated").attr("stroke", "#000000").attr("stroke-width", 2);
			})
			.on("mouseout", function(d) {
				//Add
				$(".backgroundRepatriated").removeAttr("stroke");
				$(".backgroundRepatriated").removeAttr("stroke-width");
			})
			.on("focus", function(d) {
				//Add
				unfocus();
				d3.select(this).classed("activeRegion", true);
				currentRegion = d3.select(this).data()[0];

				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

				var txtName;
				if (language == "en") {
					txtName = "on First Nations reserves";
				}
				else {
					txtName = "dans les réserves des Premières Nations";
				}
				d3.select("#txtName").text(function() {
					return txtName;
				})
				d3.select("#txtTotal").text(function() {
					if(timeDataISC[currentRegion.pruid][currentDateISC][0][typeCases] == null){
						if(language == "en"){
							return "N/A";
						}else{
							return "s.o.";
						}
					}else{
						return generateTxtTotal(timeDataISC[currentRegion.pruid][currentDateISC][0][typeCases], currentRegion.pruid, typeCases);
					}
				});

				d3.selectAll(".ISCDescTxt, .ISCDescTxt2").style("display", "");

				d3.select("#textarea").style("margin-top", "20px");
				//.style("height", "295px");

				d3.selectAll(".txtCurrentDate").text(function() {
					let timeValue;
					if (language == "en") {
						timeValue = d3.timeFormat("%B")(parseTime(currentDateISC)) + " " + d3.timeFormat("%e")(parseTime(currentDateISC)) + ", " + d3.timeFormat("%Y")(parseTime(currentDateISC)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
					}
					else {
						timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDateISC));
					}
					d3.select("#descText2").text(timeValue);
					return timeValue;
				})

				d3.select("#textArticle1").text(function() {
					if (language == "en") {
						return "";
					}
					else {
						return "";
					}
				});

				updateTrend(currentRegion.trend);
				$(".backgroundRepatriated").attr("stroke", "#000000").attr("stroke-width", 2);
			})

		repatriated.append("rect")
			.attr("class", "backgroundRepatriated")
			.attr("x", 480)
			.attr("y", 580)
			.attr("width", 235)
			.attr("height", 60)
			.attr("fill", "none");
		// x="480" y="580" width="235" height="60"

		repatriated.append("text")
			.attr("class", "textRepatriated")
			.html(function() {
				var txtName;
				if (language == "en") {
					txtName = nestedDataISC["98"][nestedDataISC["98"].length - 1].prname;
				}
				else {
					txtName = nestedDataISC["98"][nestedDataISC["98"].length - 1].prnameFR;
				}
				return txtName;
			})
			.attr("x", 545)
			.attr("y", function() {
				if (language == "en") {
					return 615;
				}
				else {
					return 607;
				}
			})
			.attr("font-size", "14px")
			.attr("fill", "black")
			.call(wrap, 200)

		repatriated.append("circle")
			.attr("class", "circleRepatriated")
			.attr("cx", 510)
			.attr("cy", 610)
			.attr("r", function() {
				return getCircleRadius(getlength(timeDataISC[98][currentDateISC][0][typeCases]));
			})
			.attr("fill", "rgb(54, 54, 54)");
			
		if(isNaN(timeDataISC[98][currentDateISC][0][typeCases])){
			repatriated.append("text")
				.attr("class", "repatriatedTextValue")
				.text(function(d) {
					typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
						if (language == "en")
							return "N/A"
						else
							return "s.o."
					
				})
				.attr("x", 510)
				.attr("y", 615)
				.attr("font-size", "14px")
				.style("text-anchor", "middle")
				.style("fill", "white")
		}
		else{
			repatriated.append("text")
			.attr("class", "repatriatedTextValue")
			.attr("x", 510)
			.attr("y", 615)
			.attr("font-size", "14px")
			.style("text-anchor", "middle")
			.style("fill", "white")
			.transition()
			.duration(600)
			.tween("text", function(d) {
				const that = d3.select(this);
				let format;
				if(typeCases == "avgpositivity_last7"){
					format = d3.format("0.1f");
				}else{
					format = d3.format(",d");	
				}
				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
				if (language == "en") {
					const i = d3.interpolateNumber(0, timeDataISC[98][currentDateISC][0][typeCases]);
					return function(t) { that.text(format(i(t))); };
				}
				else {
					const i = d3.interpolateNumber(0, timeDataISC[98][currentDateISC][0][typeCases]);
					return function(t) { that.text(format(i(t)).replace(",", " ")); };
				}
			})
		}

		//Add Canada Totals
		const mapCanada = d3.select("#mapGroup").datum(nestedData[1][0]).append("g")
			.attr("id", "Canada")
			.attr("tabindex", 0)
			.attr("data-taborder", 1)
			.attr("focusable", "true")
			.on("mouseover", function(d) {
				//  d3.select(this).raise();
				currentRegion = d3.select(this).data()[0];
				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

				var txtName;
				if (language == "en") {
					txtName = currentRegion.prname;
				}
				else {
					txtName = currentRegion.prnameFR;
				}
				d3.select("#txtName").text(function() {
					return txtName;
				})
				var txtTotal;
				if (timeData[currentRegion.HRUID][currentDate]) {
					txtTotal = timeData[currentRegion.HRUID][currentDate][0][typeCases];
				}
				else {
					txtTotal = 0;
				}
				d3.select("#txtTotal").html(function() {
					return generateTxtTotal(txtTotal, currentRegion.HRUID, typeCases);
				});

				d3.selectAll(".ISCDescTxt, .ISCDescTxt2").style("display", "none");
				d3.select("#textarea").style("margin-top", "115px");
				//.style("height", "185px");

				d3.selectAll(".txtCurrentDate").text(function() {
					let timeValue;
					if (language == "en") {
						timeValue = d3.timeFormat("%B")(parseTime(currentDate)) + " " + d3.timeFormat("%e")(parseTime(currentDate)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
					}
					else {
						timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
					}
					d3.select("#descText2").text(timeValue);
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

				updateTrend(currentRegion.trend);
				$(".backgroundCanada").attr("stroke", "#000000").attr("stroke-width", 2);
			})
			.on("mouseout", function(d) {
				$(".backgroundCanada").removeAttr("stroke");
				$(".backgroundCanada").removeAttr("stroke-width");
			})
			.on("focus", function(d) {
				unfocus();
				d3.select(this).classed("activeRegion", true);
				currentRegion = d3.select(this).data()[0];

				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

				var txtName;
				if (language == "en") {
					txtName = currentRegion.prname;
				}
				else {
					txtName = currentRegion.prnameFR;
				}
				d3.select("#txtName").text(function() {
					return txtName;
				})
				var txtTotal;
				if (timeData[currentRegion.pruid][currentDate]) {
					txtTotal = timeData[currentRegion.pruid][currentDate][0][typeCases];
				}
				else {
					txtTotal = 0;
				}
				d3.select("#txtTotal").html(function() {
					return generateTxtTotal(txtTotal, currentRegion.pruid, typeCases);
				});

				d3.selectAll(".ISCDescTxt, .ISCDescTxt2").style("display", "none");
				d3.select("#textarea").style("margin-top", "115px");
				//.style("height", "185px");

				d3.selectAll(".txtCurrentDate").text(function() {
					let timeValue;
					if (language == "en") {
						timeValue = d3.timeFormat("%B")(parseTime(currentDate)) + " " + d3.timeFormat("%e")(parseTime(currentDate)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
					}
					else {
						timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
					}
					d3.select("#descText2").text(timeValue);
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

				updateTrend(currentRegion.trend);
				$(".backgroundCanada").attr("stroke", "#000000").attr("stroke-width", 2);
			})

		mapCanada.append("rect")
			.attr("class", "backgroundCanada")
			.attr("x", 40)
			.attr("y", 33)
			.attr("width", 180)
			.attr("height", 82)
			.attr("fill", "none");

		mapCanada.append("text")
			.attr("class", "textCanada")
			.text("Canada")
			.attr("x", 44)
			.attr("y", 80)
			.attr("font-size", "24px")
			.attr("fill", "black");

		mapCanada.append("circle")
			.attr("class", "circleCanada")
			.attr("cx", 175)
			.attr("cy", 74)
			.attr("r", function() {
				return getCircleRadius(getlength(timeData[1][currentDate][0][typeCases]), "1");
			})
			.attr("fill", "rgb(54, 54, 54)");

		mapCanada.append("text")
			.attr("class", "CanadaTextValue")
			.text(function(d) {
				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
				return timeData[1][currentDate][0][typeCases];
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
				if(typeCases == "avgpositivity_last7"){
					format = d3.format("0.1f");
				}else{
					format = d3.format(",d");	
				}
				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
				if (language == "en") {
					const i = d3.interpolateNumber(0, timeData[1][currentDate][0][typeCases]);
					return function(t) { that.text(format(i(t))); };
				}
				else {
					const i = d3.interpolateNumber(0, timeData[1][currentDate][0][typeCases]);
					return function(t) { that.text(format(i(t)).replace(",", " ")); };
				}
			})

		//Set default DOM order
		var domNodeList = d3.selectAll("#mapGroup > g").nodes().sort(function(a, b) {
			var aNode = +d3.select(a).attr("data-taborder");
			var bNode = +d3.select(b).attr("data-taborder");
			return aNode - bNode;
		})
		d3.selectAll(domNodeList).order();

		//Set defaults
		if (iframeElementMap == null) {
			let queryStringValues = getParams(window.location.href);

			if (typeof(queryStringValues.stat) != "undefined" && typeof(queryStringValues.measure) != "undefined") {
				if ((queryStringValues.stat == "num" && (queryStringValues.measure == "total" || queryStringValues.measure == "deaths" || queryStringValues.measure == "recover" || queryStringValues.measure == "tests")) || (queryStringValues.stat == "rate" && (queryStringValues.measure == "total" || queryStringValues.measure == "deaths" || queryStringValues.measure == "tests"))) {
					$("#dropdownType3").val(queryStringValues.stat)
					$("#dropdownType1").val(queryStringValues.measure)
					displayOptions($("#dropdownType4").val(), queryStringValues.stat)

					if ($('#dropdownType3').val() == "rate") {
						//$('#dropdownType1 option[value="deaths"]').css("display","none");
						$('#dropdownType1 option[value="recover"]').css("display", "none");
						$('#dropdownType1 option[value="recover"]').prop("disabled", "true");
						$('#txtTotalMod').css('display', '');
					}
					else {
						//$('#dropdownType1 option[value="deaths"]').css("display",""); 
						$('#dropdownType1 option[value="recover"]').css("display", "");
						$('#dropdownType1 option[value="recover"]').prop("disabled", "");
						$('#txtTotalMod').css('display', 'none');
					}
					if ($("#dropdownType4").val() == "hr") {
						$('#dropdownType1 option[value="recover"]').hide();
					}
					indexDate = 1;
					while (isNaN(timeData[1][currentDate][0][typeCases]) || timeData[1][currentDate][0][typeCases] == 0) {
						currentDate = datesArray[datesArray.length - indexDate];
						indexDate += 1;
					}

					typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
				}
			}
			else
				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

			typeMod = $('#dropdownType3').val();
			typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
			txtTypeCases = $('#dropdownType1 option:selected').text();
			txtTypeMod = $('#dropdownType3 option:selected').text();

			$(".txtType").text(txtTypeCases.toLowerCase());
			$(".txtTypeMod").text(txtTypeMod.toLowerCase());

			if (typeCases == "ratetests") {
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
			if (typeCases == "numtotal" || typeCases == "numconf" || typeCases == "numprob" || typeCases == "numtoday" || typeCases == "numrecover") {
				d3.select(".bottomLeg text").style("display", "inline");
			}

			d3.selectAll('.categoryLegend').selectAll("text").remove();

			var gap = 5;
			var squareSize = 13;
			var topMargin = 5;
			d3.selectAll('.categoryLegend')
				.append('text')
				.attr("class", "legend-text")
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
			d3.select("#legendTitle1").remove()
			d3.select("#legend")
				.append("text")
				.attr("x", 550)
				.attr("font-size", "13.5px")
				.attr("font-weight", "bold")
				.attr("id", "legendTitle1")
				.attr("y", topMargin - 20)
			.text(function() {
				if (language == "en") {
					if (typeCases == "numdeaths") {
						return "Count of " + txtTypeCases.toLowerCase() + " related to COVID-19";
					}
					else if (typeCases == "numdeaths_last7") {
						return "Count of " + txtTypeCases.toLowerCase() + " related to COVID-19";
					}
					else if (typeCases == "numdeaths_last14") {
						return "Count of " + txtTypeCases.toLowerCase() + " related to COVID-19";
					}
					else if (typeCases == "numrecover") {
						return "Count of " + txtTypeCases.toLowerCase() + " from COVID-19";
					}
					else if (typeCases == "numtests") {
						return "Count of " + txtTypeCases.toLowerCase() + " for COVID-19";
					}
					else if ((typeCases == "numtotal") || (typeCases == "numactive") || (typeCases == "numtotal_last7") || (typeCases == "numtotal_last14")) {
						return "Count of " + txtTypeCases.toLowerCase() + " of COVID-19";
					}
					else if ((typeCases == "ratedeaths") || (typeCases == "ratedeaths_last7") || (typeCases == "ratedeaths_last14")) {
						return "Rate of " + txtTypeCases.toLowerCase() + " related to COVID-19"
					}
					else if (typeCases == "ratetests") {
						return "Rate of " + txtTypeCases.toLowerCase() + " for COVID-19"
					}
					else if (typeCases == "avgpositivity_last7" || typeCases == "avgtests_last7") {
						return "Moving average of " + txtTypeCases.toLowerCase() + " for COVID-19"
					}
					else {
						return "Rate of " + txtTypeCases.toLowerCase() + " of COVID-19";
					}
				}
				else {
					if (typeCases == "numdeaths") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " liés à la COVID-19";
					}
					else if (typeCases == "numdeaths_last7") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " liés à la COVID-19";
					}
					else if (typeCases == "numdeaths_last14") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " liés à la COVID-19";
					}
					else if (typeCases == "numrecover") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " de la COVID-19";
					}
					else if (typeCases == "numtests") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " pour la COVID-19";
					}
					else if ((typeCases == "numtotal") || (typeCases == "numactive") || (typeCases == "numtotal_last7") || (typeCases == "numtotal_last14")) {
						return "Nombre de " + txtTypeCases.toLowerCase() + " de COVID-19";
					}
					else if ((typeCases == "ratedeaths" || (typeCases == "ratedeaths_last7") || (typeCases == "ratedeaths_last14"))) {
						return "Taux de " + txtTypeCases.toLowerCase() + " liés à la COVID-19"
					}
					else if (typeCases == "ratetests") {
						return "Taux de " + txtTypeCases.toLowerCase() + " pour la COVID-19"
					}
					else if (typeCases == "avgpositivity_last7" || typeCases == "avgtests_last7") {
						return "Moyenne mobile " + txtTypeCases.toLowerCase() + " pour la COVID-19"
					}
					else {
						return "Taux de " + txtTypeCases.toLowerCase() + " de la COVID-19";
					}
				}
			}).call(wrap, 240)

			d3.selectAll(".numArticle").text(function() {
				let txtNumArticle;
				if (language == "en") {
					if ((typeCases == "numdeaths") || (typeCases == "ratedeaths")) {
						return "related to";
					}
					else if (typeCases == "numrecover") {
						return "from";
					}
					else if ((typeCases == "numtests") || (typeCases == "ratetests")) {
						return "for";
					}
					else {
						return "of";
					}
					return txtNumArticle;
				}
				else {
					if ((typeCases == "numtests") || (typeCases == "ratetests")) {
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

			currentRegion = d3.select("#Canada").data()[0];
			d3.select("#txtTotal").text(d3.format(",d")(currentRegion.trend[currentDate][0][typeCases]));

			//Finish initial load    
			drawLegend(timeData2);
			colorMap();
			drawTrend();

		}

		if ($("#dropdownType4").val() == "pt") {
			d3.selectAll(".txtCurrentDate").text(function() {
				let timeValue;
				if (language == "en") {
					timeValue = d3.timeFormat("%B")(parseTime(currentDate)) + " " + d3.timeFormat("%e")(parseTime(currentDate)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
				}
				else {
					timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
				}
				d3.select("#descText2").text(timeValue);
				return timeValue;
			})
		}

		d3.select("#mapGroup")
			.selectAll(".regions")
			.on("mouseover", function(d) {
				//Styling
				// d3.select(this).raise();
				d3.select(this).select("path").attr("stroke", "black").attr("stroke-width", 3);

				//Do things with data
				currentRegion = d3.select(this).data()[0];
				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

				var txtName;
				if (language == "en") {
					txtName = currentRegion.properties.PRENAME;
				}
				else {
					txtName = currentRegion.properties.PRFNAME;
				}
				d3.select("#txtName").text(function() {
					return txtName;
				})
				var txtTotal;
				if (timeData[currentRegion.properties.PRUID][currentDate]) {
					txtTotal = timeData[currentRegion.properties.PRUID][currentDate][0][typeCases];
				}
				else {
					txtTotal = 0;
				}
				d3.select("#txtTotal").html(function() {
					return generateTxtTotal(txtTotal, currentRegion.properties.PRUID, typeCases);
				});

				d3.selectAll(".ISCDescTxt, .ISCDescTxt2").style("display", "none");

				d3.select("#textarea").style("margin-top", "115px");
				//.style("height", "185px");

				d3.selectAll(".txtCurrentDate").text(function() {
					let timeValue;
					if (language == "en") {
						timeValue = d3.timeFormat("%B")(parseTime(currentDate)) + " " + d3.timeFormat("%e")(parseTime(currentDate)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
					}
					else {
						timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
					}
					d3.select("#descText2").text(timeValue);
					return timeValue;
				})

				d3.select("#textArticle1").text(function() {
					if (language == "en") {
						return "in";
					}
					else {
						if (currentRegion.properties.PRUID == 10) {
							return " à ";
						}
						else if (currentRegion.properties.PRUID == 11) {
							return " à l'";
						}
						else if ((currentRegion.properties.PRUID == 12) || (currentRegion.properties.PRUID == 35) || (currentRegion.properties.PRUID == 47) || (currentRegion.properties.PRUID == 48) || (currentRegion.properties.PRUID == 59)) {
							return " en ";
						}
						else if ((currentRegion.properties.PRUID == 13) || (currentRegion.properties.PRUID == 24) || (currentRegion.properties.PRUID == 46) || (currentRegion.properties.PRUID == 60) || (currentRegion.properties.PRUID == 62)) {
							return " au ";
						}
						else if (currentRegion.properties.PRUID == 61) {
							return " aux ";
						}
						return "au";
					}
				});
				
				updateTrend();
			})
			.on("mouseout", function(d) {
				//Styling
				d3.select(this).select("path").attr("stroke", "#828080").attr("stroke-width", 1);
			})
			.on("focus", function(d) {
				unfocus();
				//Styling
				d3.select(this).classed("activeRegion", true);
				d3.select(this).select("path").attr("stroke", "black").attr("stroke-width", 3);
				//Do things with data
				currentRegion = d3.select(this).data()[0];
				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

				var txtName;
				if (language == "en") {
					txtName = d.properties.PRENAME;
				}
				else {
					txtName = d.properties.PRFNAME;
				}
				d3.select("#txtName").text(function() {
					return txtName;
				})
				var txtTotal;
				if (timeData[currentRegion.properties.PRUID][currentDate]) {
					txtTotal = timeData[currentRegion.properties.PRUID][currentDate][0][typeCases];
				}
				else {
					txtTotal = 0;
				}
				d3.select("#txtTotal").html(function() {
					return generateTxtTotal(txtTotal, currentRegion.properties.PRUID, typeCases);
				});

				d3.selectAll(".ISCDescTxt, .ISCDescTxt2").style("display", "none");

				d3.select("#textarea").style("margin-top", "115px");
				//.style("height", "185px");

				d3.selectAll(".txtCurrentDate").text(function() {
					let timeValue;
					if (language == "en") {
						timeValue = d3.timeFormat("%B")(parseTime(currentDate)) + " " + d3.timeFormat("%e")(parseTime(currentDate)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
					}
					else {
						timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
					}
					d3.select("#descText2").text(timeValue);
					return timeValue;
				})

				d3.select("#textArticle1").text(function() {
					if (language == "en") {
						return "in";
					}
					else {
						if (currentRegion.properties.PRUID == 10) {
							return " à ";
						}
						else if (currentRegion.properties.PRUID == 11) {
							return " à l'";
						}
						else if ((currentRegion.properties.PRUID == 12) || (currentRegion.properties.PRUID == 35) || (currentRegion.properties.PRUID == 47) || (currentRegion.properties.PRUID == 48) || (currentRegion.properties.PRUID == 59)) {
							return " en ";
						}
						else if ((currentRegion.properties.PRUID == 13) || (currentRegion.properties.PRUID == 24) || (currentRegion.properties.PRUID == 46) || (currentRegion.properties.PRUID == 60) || (currentRegion.properties.PRUID == 62)) {
							return " au ";
						}
						else if (currentRegion.properties.PRUID == 61) {
							return " aux ";
						}
						return "au";
					}
				});

				updateTrend();
			})
		updateMapNotes();
	}
	// });

	d3.select("#animateMap").on("focus", function() {
		unfocus();
	});

	function unfocus() {
		var activeRegion = d3.select(".activeRegion");
		activeRegion.select("path").attr("stroke", "#828080").attr("stroke-width", 1);
		activeRegion.classed("activeRegion", false);
		d3.select("#Canada").select("rect").attr("stroke", "");
		d3.select("#Canada").select("rect").attr("stroke-width", "");
		/* d3.select("#repatriated").select("rect").attr("stroke", "");
		d3.select("#repatriated").select("rect").attr("stroke-width", ""); */
	}

	var index = 0;

	function animateMap() {

		//use array of years to loop through data for each PT
		setTimeout(function() {
			currentDate = datesArray[index];
			typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();

			d3.selectAll(".txtCurrentDate").text(function() {
				let timeValue;
				if (language == "en") {
					timeValue = d3.timeFormat("%B")(parseTime(currentDate)) + " " + d3.timeFormat("%e")(parseTime(currentDate)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
				}
				else {
					timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
				}
				d3.select("#descText2").text(timeValue);
				return timeValue;
			})

			//Transition Styles
			d3.selectAll(".regions path").transition().duration(600).style("fill", function(d) {
				if (timeData[d.properties.PRUID][currentDate]) {
					if (typeCases == "percentoday") {
						return color(timeData[d.properties.PRUID][currentDate][0][typeCases] * 100);
					}
					else {
						return color(timeData[d.properties.PRUID][currentDate][0][typeCases]);
					}

				}
				else {
					return COLOR_SCALE["N/A"];
				}
			});

			//Transition Numbers

			d3.selectAll('.regionCircleText').each(function(d) {
				d3.select(this).transition().duration(600).tween("text", function() {
					const that = d3.select(this);
					let currentVal = +that.text().replace(/,/g, "").replace(/ /g, "");
					let currentPT = d.properties.PRUID;
					let newVal;
					let percentSign = "";
					if (timeData[d.properties.PRUID][currentDate]) {
						if (typeCases == "percentoday") {
							newVal = timeData[d.properties.PRUID][currentDate][0][typeCases] * 100;
							if (language == "en") {
								percentSign = "$";
							}
							else {
								percentSign = " $";
							}
						}
						else {
							newVal = timeData[d.properties.PRUID][currentDate][0][typeCases];
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
						let format;
						if(typeCases == "avgpositivity_last7"){
							format = d3.format("0.1f");
						}else{
							format = d3.format(",d");	
						}
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

			d3.select('.CanadaTextValue').each(function(d) {
				d3.select(this).transition().duration(600).tween("text", function() {
					const that = d3.select(this);
					let format;
					let i;
					let newVal;
					if (typeCases == "percentoday") {
						newVal = timeData[1][currentDate][0][typeCases] * 100;
					}
					else {
						newVal = timeData[1][currentDate][0][typeCases];
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

			d3.select('.repatriatedTextValue').each(function(d) {
				typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
				if (timeDataISC[98][currentDateISC][0][typeCases] == null) {

					d3.select(this).text(function() {
						if (language == "en")
							return "N/A"
						else
							return "s.o."
					})
				}
				else
					d3.select(this).transition().duration(600).tween("text", function() {
						const that = d3.select(this);
						let format;
						let i;
						let newVal;
						if (timeDataISC[98][currentDateISC]) {
							if (typeCases == "percentoday") {
								newVal = timeDataISC[98][currentDateISC][0][typeCases] * 100;
							}
							else {
								newVal = timeDataISC[98][currentDateISC][0][typeCases];
							}
						}
						else {
							newVal = 0;
						}
						format = d3.format(",d");
						let oldVal;
						if (language == "en") {
							oldVal = that.text().replace(/,/g, "");
							if (isNaN(oldVal))
								oldVal = 0;
							i = d3.interpolateNumber(oldVal, newVal);
							return function(t) { that.text(format(i(t))); };
						}
						else {
							oldVal = that.text();
							if (isNaN(oldVal))
								oldVal = 0;
							i = d3.interpolateNumber(oldVal, newVal);
							return function(t) { that.text(format(i(t)).replace(",", " ")); };
						}
					});
			});

			d3.selectAll('.regionCircleText, .CanadaTextValue, repatriatedTextValue').attr("font-size", function() {
				if (typeCases == "numtests") {
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
				createTable();
				createTableIframe();
				return;
			}
			else {
				index++;
				createTable();
				createTableIframe();
				animateMap();
				updateTrend();
			}
		}, 600)
	}

	d3.select("#animateMap").on("click", function() {
		if(!$("#dropdownType4").val()){
				if(d3.select(this).classed("off")){
				d3.select(this).classed("btn-info",false);
				d3.select(this).classed("btn-success",true);
				d3.select(this).classed("off",false);
				d3.select(this).classed("on",true);
				d3.select(this).html('<i class="fa fa-pause" aria-hidden="true"></i> Pause');
				animateSwitch=1;
				tempNums = {"1": 0,"10": 0,"11": 0,"12": 0,"13": 0,"14": 0,"24": 0,"35": 0,"46": 0,"47": 0,"48": 0,"59": 0,"60": 0,"61": 0,"62": 0,"99": 0};
				animateMap();
				}else{
				d3.select(this).classed("btn-info",true);
				d3.select(this).classed("btn-success",false);
				d3.select(this).classed("off",true);
				d3.select(this).classed("on",false);
				d3.select(this).html('<i class="fa fa-play" aria-hidden="true"></i> Play');
				animateSwitch=0;
				}
		}
		if ($("#dropdownType4").val() == "pt") {

			if (d3.select(this).classed("off")) {
				d3.select(this).classed("btn-info", false);
				d3.select(this).classed("btn-success", true);
				d3.select(this).classed("off", false);
				d3.select(this).classed("on", true);
				d3.select(this).html('<i class="fa fa-pause" aria-hidden="true"></i> Pause');
				animateSwitch = 1;
				tempNums = { "1": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "24": 0, "35": 0, "46": 0, "47": 0, "48": 0, "59": 0, "60": 0, "61": 0, "62": 0, "99": 0 };
				animateMap();
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

	let firstSwitch = true;
	if ($("#dropdownType4").val() == "pt") {
		$("#dropdownType4").on("change", function() {
			// straight dirt fix, caused by the same thing that messes with the maps

			if (firstSwitch) {
				let text = d3.select("#map2 svg .bottomLeg text").text();
				d3.selectAll("#map2 svg .bottomLeg text tspan").remove();
				d3.select("#map2 svg .bottomLeg text").text(text);
				d3.select("#map2").style("display", "")
				d3.select("#map2 svg .bottomLeg text").call(wrap, 395);
				firstSwitch = false;
			}
		});
	}

	$('#dropdownType1, #dropdownType3, #dropdownType4').on('change', function() {

		// window.history.replaceState(null, null, window.location.origin + window.location.pathname + '?stat=' + $("#dropdownType3").val() + "&measure=" + $("#dropdownType1").val() + "&map=" + $("#dropdownType4").val() + "#a2");

		updateSelectOptions(d3.select(this), typeMod, typeCases.replace(typeMod, ""));
		
		typeMod = $('#dropdownType3').val();
		typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
		txtTypeCases = $('#dropdownType1 option:selected').text();
		txtTypeMod = $('#dropdownType3 option:selected').text();

		$(".txtType").text(txtTypeCases.toLowerCase());
		$(".txtTypeMod").text(txtTypeMod.toLowerCase());
		// 		scale = 6000;
		// 		scalePercent = 200;

		if (typeCases == "numtoday") {
			currentDate = datesArray[datesArray.length - 2];
		} else if(typeCases == "numtests" || typeCases == "avgtests_last7" || typeCases == "avgratetests_last7" || typeCases == "avgpositivity_last7") {
			currentDate = datesArrayTests[datesArrayTests.length - 1];
		} else {
			currentDate = datesArray[datesArray.length - 1];
		}

		indexDate = 1;
		while (isNaN(timeData[1][currentDate][0][typeCases]) || timeData[1][currentDate][0][typeCases] == 0) {
			currentDate = datesArray[datesArray.length - indexDate];
			indexDate += 1;
		}

		if (typeCases == "ratetests") {
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

		//Add/Remove bottom legend note
		//JULY 17 NUMRECOVER
		if (typeCases == "numtotal" || typeCases == "numconf" || typeCases == "numprob" || typeCases == "numtoday" || typeCases == "numrecover") {
			d3.select("#map svg .bottomLeg text").style("display", "inline");
		}
		// 		else{
		// 		    d3.select("#bottomLeg text").style("display","none");
		// 		}

		d3.selectAll(".txtCurrentDate").text(function() {
			let timeValue;
			if (language == "en") {
				timeValue = d3.timeFormat("%B")(parseTime(currentDate)) + " " + d3.timeFormat("%e")(parseTime(currentDate)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
			}
			else {
				timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
			}
			d3.select("#descText2").text(timeValue);
			return timeValue;
		})

		//Transition Styles
		d3.selectAll(".regions path").transition().duration(600).style("fill", function(d) {
			if (timeData[d.properties.PRUID][currentDate]) {
				if (typeCases == "percentoday") {
					return color(timeData[d.properties.PRUID][currentDate][0][typeCases] * 100);
				}
				else {
					return color(timeData[d.properties.PRUID][currentDate][0][typeCases]);
				}
			}
			else {
				return COLOR_SCALE["N/A"];
			}
		});

		//Transition Numbers
		d3.selectAll('.regionCircleText').each(function(d) {
			if(timeData[d.properties.PRUID][currentDate][0][typeCases] == null){
				d3.select(this).text(function() {
				    if (language == "en") {
						return "N/A"
					}
					else {
						return "s.o."
					}
				})
			}
			d3.select(this).transition().duration(600).tween("text", function() {
				const that = d3.select(this);
				let currentVal = +that.text().replace(/,/g, "").replace(/ /g, "");
				let currentPT = d.properties.PRUID;
				let newVal;
				if (timeData[d.properties.PRUID][currentDate]) {
					if (typeCases == "percentoday") {
						newVal = timeData[d.properties.PRUID][currentDate][0][typeCases] * 100;
					}
					else {
						newVal = timeData[d.properties.PRUID][currentDate][0][typeCases];
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
					if(typeCases == "avgpositivity_last7"){
						format = d3.format("0.1f");
					}else{
						format = d3.format(",d");	
					}
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

		d3.selectAll('.regionValuesCircle')
			.transition().duration(600)
			.attr("r", function(d) {
				return getCircleRadius(getlength(timeData[d.properties.PRUID][currentDate][0][typeCases]));
			})

		d3.selectAll('.circleRepatriated')
			.transition().duration(600)
			.attr("r", function(d) {
				return getCircleRadius(getlength(timeDataISC[98][currentDateISC][0][typeCases]));
			})

		d3.selectAll('.circleCanada')
			.transition().duration(600)
			.attr("r", function(d) {
				return getCircleRadius(getlength(timeData[1][currentDate][0][typeCases]), "1");
			})

		d3.select('.CanadaTextValue').each(function(d) {
			d3.select(this).transition().duration(600).tween("text", function() {
				const that = d3.select(this);
				let format;
				let i;
				let newVal;
				if (typeCases == "percentoday") {
					newVal = timeData[1][currentDate][0][typeCases] * 100;
				}
				else {
					newVal = timeData[1][currentDate][0][typeCases];
				}
				if(typeCases == "avgpositivity_last7"){
					format = d3.format("0.1f");
				}else{
					format = d3.format(",d");	
				}
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

		d3.select('.repatriatedTextValue').each(function(d) {
			if (typeCases == "numtests" || typeCases == "avgtests_last7" || typeCases == "avgratetests_last7" || typeCases == "avgpositivity_last7") {
				d3.select(this).text(function() {
					if (language == "en")
						return "N/A"
					else
						return "s.o."
				})
			}
			else
				d3.select(this).transition().duration(600).tween("text", function() {
					const that = d3.select(this);
					let format;
					let i;
					let newVal;
					if (timeDataISC[98][currentDateISC]) {
						if (typeCases == "percentoday") {
							newVal = timeDataISC[98][currentDateISC][0][typeCases] * 100;
						}
						else {
							newVal = timeDataISC[98][currentDateISC][0][typeCases];
						}
					}
					else {
						newVal = 0;
					}
					if(typeCases == "avgpositivity_last7"){
						format = d3.format("0.1f");
					}else{
						format = d3.format(",d");	
					}
					let oldVal;
					if (language == "en") {
						oldVal = that.text().replace(/,/g, "");
						if (isNaN(oldVal))
							oldVal = 0;
						i = d3.interpolateNumber(oldVal, newVal);
						return function(t) { that.text(format(i(t))); };
					}
					else {
						oldVal = that.text();
						if (isNaN(oldVal))
							oldVal = 0;
						i = d3.interpolateNumber(oldVal, newVal);
						return function(t) { that.text(format(i(t)).replace(",", " ")); };
					}
				});
		});

		d3.selectAll('.regionCircleText, .CanadaTextValue, repatriatedTextValue').attr("font-size", function() {
			if (typeCases == "numtests" || typeCases == "ratetests") {
				return "13px";
			}
			else {
				return "15px";
			};
		});

		let timeDataMax = [];
		timeData2.forEach(function(d) {
			if (d.key != 1) {
				return d.values.forEach(function(e) {
					timeDataMax.push(e.values[0][typeCases]);
				});
			}
		});
		//scale = roundup(d3.max(timeDataMax));

		d3.selectAll('.categoryLegend').selectAll("text").remove();

		var gap = 5;
		var squareSize = 13;
		var topMargin = 5;
		d3.selectAll('.categoryLegend')
			.append('text')
			.attr("class", "legend-text")
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
		d3.select("#legendTitle1").remove()
		d3.select("#legend")
			.append("text")
			.attr("x", 550)
			.attr("font-size", "13.5px")
			.attr("font-weight", "bold")
			.attr("id", "legendTitle1")
			.attr("y", topMargin - 20)
			.text(function() {
				if (language == "en") {
					if (typeCases == "numdeaths") {
						return "Count of " + txtTypeCases.toLowerCase() + " related to COVID-19";
					}
					else if (typeCases == "numdeaths_last7") {
						return "Count of " + txtTypeCases.toLowerCase() + " related to COVID-19";
					}
					else if (typeCases == "numdeaths_last14") {
						return "Count of " + txtTypeCases.toLowerCase() + " related to COVID-19";
					}
					else if (typeCases == "numrecover") {
						return "Count of " + txtTypeCases.toLowerCase() + " from COVID-19";
					}
					else if (typeCases == "numtests") {
						return "Count of " + txtTypeCases.toLowerCase() + " for COVID-19";
					}
					else if ((typeCases == "numtotal") || (typeCases == "numactive") || (typeCases == "numtotal_last7") || (typeCases == "numtotal_last14")) {
						return "Count of " + txtTypeCases.toLowerCase() + " of COVID-19";
					}
					else if ((typeCases == "ratedeaths") || (typeCases == "ratedeaths_last7") || (typeCases == "ratedeaths_last14")) {
						return "Rate of " + txtTypeCases.toLowerCase() + " related to COVID-19"
					}
					else if (typeCases == "ratetests") {
						return "Rate of " + txtTypeCases.toLowerCase() + " for COVID-19"
					}
					else if (typeCases == "avgpositivity_last7" || typeCases == "avgtests_last7") {
						return "Moving average of " + txtTypeCases.toLowerCase() + " for COVID-19"
					}
					else {
						return "Rate of " + txtTypeCases.toLowerCase() + " of COVID-19";
					}
				}
				else {
					if (typeCases == "numdeaths") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " liés à la COVID-19";
					}
					else if (typeCases == "numdeaths_last7") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " liés à la COVID-19";
					}
					else if (typeCases == "numdeaths_last14") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " liés à la COVID-19";
					}
					else if (typeCases == "numrecover") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " de la COVID-19";
					}
					else if (typeCases == "numtests") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " pour la COVID-19";
					}
					else if ((typeCases == "numtotal") || (typeCases == "numactive") || (typeCases == "numtotal_last7") || (typeCases == "numtotal_last14")) {
						return "Nombre de " + txtTypeCases.toLowerCase() + " de COVID-19";
					}
					else if ((typeCases == "ratedeaths" || (typeCases == "ratedeaths_last7") || (typeCases == "ratedeaths_last14"))) {
						return "Taux de " + txtTypeCases.toLowerCase() + " liés à la COVID-19"
					}
					else if (typeCases == "ratetests") {
						return "Taux de " + txtTypeCases.toLowerCase() + " pour la COVID-19"
					}
					else if (typeCases == "avgpositivity_last7" || typeCases == "avgtests_last7") {
						return "Moyenne mobile " + txtTypeCases.toLowerCase() + " pour la COVID-19"
					}
					else {
						return "Taux de " + txtTypeCases.toLowerCase() + " de la COVID-19";
					}
				}
			}).call(wrap, 240)

		d3.selectAll(".numArticle").text(function() {
			let txtNumArticle;
			if (language == "en") {
				if ((typeCases == "numdeaths") || (typeCases == "ratedeaths")) {
					return "related to";
				}
				else if (typeCases == "numrecover") {
					return "from";
				}
				else if ((typeCases == "numtests") || (typeCases == "ratetests")) {
					return "for";
				}
				else {
					return "of";
				}
				return txtNumArticle;
			}
			else {
				if ((typeCases == "numtests") || (typeCases == "ratetests")) {
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

		/* 		d3.selectAll(".numArticle2").text(function() {
					let txtNumArticle2;
					if (typeCases == "numtests") {
						txtNumArticle2 = "d'";
					}
					else {
						txtNumArticle2 = "de ";
					}
					return txtNumArticle2;
				}); */
				
		updateMapNotes();
		bottomLegendText();
		createTable();
		createTableIframe();
		updateTrend(1);
	});
	
	function updateMapNotes(){
		d3.select("#mapNotes").attr("font-size",function(d){
			let dateLab, dateNormal;
			if(language == "en"){
				dateLab = d3.timeFormat("%B %-d, %Y")(d3.timeParse("%d-%m-%Y")(currentDate));
				dateNormal = d3.timeFormat("%B %-d, %Y")(d3.timeParse("%d-%m-%Y")(datesArray[datesArray.length - 1]));
			}else{
				dateLab = d3.timeFormat("%-d %B %Y")(d3.timeParse("%d-%m-%Y")(currentDate));
				dateNormal = d3.timeFormat("%-d %B %Y")(d3.timeParse("%d-%m-%Y")(datesArray[datesArray.length - 1]));
			}
			if(typeCases == "numtests_last7" || typeCases == "avgtests_last7" || typeCases == "avgratetests_last7" || typeCases == "avgpositivity_last7"){
				if(language == "en"){					
					var formatTime = d3.timeFormat("%B %-d, %Y, %-I %p EST");
					var parseTime2 = d3.timeParse("%d-%m-%Y %H:%M");
					$(".updateTime").text(formatTime(parseTime2(datesArrayTests[datesArrayTests.length - 1]))+" 17:00".replace("PM", "pm").replace("AM", "am"));
					
					var t2 = document.getElementById("mapNotesText")
					t2.innerHTML = "<ol type='a'><li>This information is based on data from our provincial and territorial partners. Data about cases was last updated on "+dateLab+". Laboratory data includes specimens received by labs up to <span class='updateDateLab'></span>. For the most up to date data for any province, territory or city, please visit their web site.</li>" + 
					"<li>The 7-day moving average is the total of the daily numbers for the previous 7 days (up to and including the day of the last update), divided by the number of days for which data is available. We go back and update the moving averages as provinces and territories submit more data. We calculate the national 7-day moving average by summing the 7-day moving average from the provinces and territories then dividing by the national population if a rate is calculated.</li></ol>";
				}else{
					var formatTime = d3.timeFormat("%-d %B %Y, %-H h HNE");
					var parseTime2 = d3.timeParse("%d-%m-%Y %H:%M");
					$(".updateTime").text(formatTime(parseTime2(datesArrayTests[datesArrayTests.length - 1]))+" 17 h 00");

					var t2 = document.getElementById("mapNotesText")
					t2.innerHTML = "<ol type='a'><li>Ces renseignements sont fondés sur les données de nos partenaires provinciaux et territoriaux. Les données sur les cas ont été mises à jour le "+dateLab+". Les données de laboratoire comprennent les échantillons reçus par les laboratoires jusqu’au <span class='updateDateLab'></span>. Pour obtenir les données les plus à jour pour une province, un territoire ou une ville, veuillez consulter leur site Web respectif.</li>" + 
					"<li>La moyenne mobile sur 7 jours est le total des chiffres quotidiens des 7 jours précédents (jusqu’au jour de la dernière mise à jour inclusivement) divisé par le nombre de jours pour lesquels des données sont disponibles. Nous mettons à jour les moyennes mobiles à mesure que les provinces et les territoires fournissent de nouvelles données. Nous calculons la moyenne mobile nationale sur 7 jours en additionnant les moyennes mobiles sur 7 jours des provinces et territoires, puis en divisant par la population nationale si un taux est calculé.</li></ol>";
				}
			}else{
				if(language == "en"){
					var t2 = document.getElementById("mapNotesText")
					t2.innerHTML = "This information is based on data our provincial and territorial partners published on cases, deaths, and testing daily, and are current as of the day they are published. Today’s numbers are current as of "+dateNormal+". For the most up to date data for any province, territory or city, please visit their website.  The number of cases or deaths reported on previous days may differ slightly from those on the provincial and territorial websites as these websites may update historic case and death counts as new information becomes available.";
				}else{
					var t2 = document.getElementById("mapNotesText")
					t2.innerHTML = "L’information est fondée sur des données publiées par nos partenaires provinciaux et territoriaux concernant les cas, les décès et les tests quotidiens et est actuelle en date de sa publication. Les chiffres d’aujourd’hui sont à jour en date du "+dateNormal+". Pour obtenir les plus récentes données d’une province ou d’un territoire, ou d’une ville, veuillez consulter leur site Web. Le nombre de cas ou de décès déclarés au cours des jours précédents peut différer légèrement de celui affiché sur les sites Web des provinces et des territoires, puisque ces sites peuvent être mis à jour à mesure que de nouveaux renseignements sont connus.";
				}
				
			}
			return "20px";
		})
	}

	function bottomLegendText(){
		
		d3.select("#map svg .bottomLeg text")
			.text(function() {
				if (language == "en") {
					// These numbers may also be counted in the provincial and territorial numbers. To find out more: <a href="https://www.sac-isc.gc.ca/eng/1589895506010/1589895527965">Epidemiological summary of COVID-19 cases in First Nations communities</a>.
					if (typeCases == "numtoday") {
						return "Note: When displaying the number of new cases, data is only available for a complete day. On First Nations reserves numbers reported to Indigenous Services Canada may be counted in the provincial and territorial total numbers.";
					}
					else if (typeCases == "numtests") {
						return "Note: Provincial/territorial (PT) data reported on their websites should be used if there are discrepancies. This can be due to lags, differing reporting cut-offs, or changes in lab testing criteria. On First Nations reserves numbers reported to Indigenous Services Canada may be counted in the provincial and territorial total numbers.";
					}
					else if (typeCases == "numtotal") {
						return "Note: The total number includes publicly reported confirmed and probable cases. On First Nations reserves numbers reported to Indigenous Services Canada may be counted in the provincial and territorial total numbers.";
					}
					else if (typeCases == "numrecover") {
						return "Note: On July 17, there was an increase in the number of recovered cases in Quebec due to a revision in how they define these cases. On First Nations reserves numbers reported to Indigenous Services Canada may be counted in the provincial and territorial total numbers."
					}
					else{
						return "Note: On First Nations reserves numbers reported to Indigenous Services Canada may be counted in the provincial and territorial total numbers. ";
					}
				}
				else {
						
					if (typeCases == "numtoday") {
						return "Remarque : Lorsque le nombre de nouveaux cas est affiché, les données sont seulement disponibles pour une jour complète. Dans les réserves des Premières Nations, les chiffres signalés à Services aux Authochtones Canada peuvent également être comptés dans les chiffres provinciaux et territoriaux.";
					}
					else if (typeCases == "numtests") {
						return "Remarque : Les données provinciales / territoriales (PT) signalées sur les sites Web des provinces et territoires être utilisées en cas d’écarts dans les données. Ces écarts peuvent être dûs à des retards, des dates de rapports différentes ou des changements dans les critères relatifs aux essais en laboratoire. Dans les réserves des Premières Nations, les chiffres signalés à Services aux Authochtones Canada peuvent également être comptés dans les chiffres provinciaux et territoriaux.";
					}
					else if (typeCases == "numtotal") {
						return "Remarque : Le nombre total comprend les cas confirmés et probables rapportés publiquement. Dans les réserves des Premières Nations, les chiffres signalés à Services aux Authochtones Canada peuvent également être comptés dans les chiffres provinciaux et territoriaux.";
					}
					else if (typeCases == "numrecover") {
						return "Remarque : Le 17 juillet, il y avait une augmentation du nombre de personnes classifiées comme rétablies dans le Québec à cause des révisions de la façon dont ils définissent ces cas. Dans les réserves des Premières Nations, les chiffres signalés à Services aux Authochtones Canada peuvent également être comptés dans les chiffres provinciaux et territoriaux."
					}
					else{
						return "Remarque : Dans les réserves des Premières Nations, les chiffres signalés à Services aux Authochtones Canada peuvent également être comptés dans les chiffres provinciaux et territoriaux.";
					}
				}
			})
			.call(wrap, 395)
	}
	
	function drawTrend() {
		var data;
		var trendPosition;
		var label;
		// typeCases = $('#dropdownType3').val()+$('#dropdownType1').val();

		if (currentRegion.trend) {
			data = d3.entries(currentRegion.trend);
			trendPosition = d3.keys(currentRegion.trend);
			if (language == "en") {
				label = currentRegion.prname;
			}
			else {
				label = currentRegion.prnameFR;
			}
		}
		else {
			data = d3.entries(timeData[currentRegion.properties.PRUID]);
			trendPosition = d3.keys(timeData[currentRegion.properties.PRUID]);
			if (language == "en") {
				label = currentRegion.properties.PRENAME;
			}
			else {
				label = currentRegion.properties.PRFNAME;
			}
		}
		
		if(typeCases == "numtests_last7" || typeCases == "avgtests_last7" || typeCases == "avgratetests_last7" || typeCases == "avgpositivity_last7"){
			data = data.filter(function(d){
				return parseTime(d.value[0].date) <= parseTime(currentDate);
			})	
		}
		// 		let testsIndex = data.findIndex(function(d){
		// 			return d.key == "31-01-2021"	
		// 		})
		// if ($('#dropdownType1').val() == "tests")
		// 			data = data.slice(testsIndex, data.length)

		var svg = d3.select("#trendData")
			.attr("height", function(d) {
				if (isIE) {
					return height + margin.top + margin.bottom
				}
			})
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		x.domain(d3.extent(data, function(d) { return parseTime(d.key); }));
		y.domain([0, d3.max(data, function(d) { return d.value[0][typeCases]; })]);

		// Add connector path
		d3.select("#trendData g").append("path")
			.datum(data.filter(trendline.defined()))
			.attr("id", "connector")
			.attr("stroke", "#ccc")
			.attr("fill", "none")
			.attr("d", trendline);

		// Add the trendline path.
		svg.append("path")
			.data([data])
			.attr("id", "trendPath")
			.attr("class", "line")
			.attr("stroke", "rgb(8, 81, 156)")
			.attr("d", trendline);

		// Add the X Axis
		//this fixes repeating x axis ticks while there is not enough data
		// if(typeCases == "numtests" || typeCases == "ratetests"){
		// 	svg.append("g")
		// 		.attr("id", "trendX")
		// 		.attr("transform", "translate(0," + height + ")")
		// 		.transition()
		// 		.duration(600)an
		// 		.call(d3.axisBottom(x).ticks(5).tickValues(data.map(function(d){return parseTime(d.key)})).tickFormat(d3.timeFormat("%b %d")))
		// 		.selectAll("text")
		// 		.attr("y", 12)
		// 		.attr("x", -21)
		// 		.attr("dy", ".35em")
		// 		.attr("transform", "rotate(-45)");	
		// }
		// else{
		svg.append("g")
			.attr("id", "trendX")
			.attr("transform", "translate(0," + height + ")")
			.transition()
			.duration(600)
			.call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%d %b '%y")))
			.selectAll("text")
			.attr("y", 12)
			.attr("x", -21)
			.attr("dy", ".35em")
			.attr("transform", "rotate(-45)");
		// }




		// Add the Y Axis
		const yAxisTicks = y.ticks(6, "s")
			.filter(function(tick) { return isInteger(tick); });

		svg.append("g")
			.attr("id", "trendY")
			.transition()
			.duration(600)
			.call(d3.axisLeft(y).tickValues(yAxisTicks).ticks(6, "s"))
		// .call(d3.axisLeft(y).tickValues(yAxisTicks).tickFormat(d3.format('d')));   

		svg.append("text")
			.attr("class", "titleTrendLabel")
			.attr("transform", "translate(" + width / 2 + "," + (-40) + ")")
			.attr("x", "0").attr("y", "0")
			.attr("font-size", "16px")
			.attr("text-anchor", "middle")
			.attr("font-weight", "bold")
			.text(label)
			.call(wrap, 300);

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
			.attr("class", "yAxisTrendLabel")
			.attr("transform", "translate(-43," + ((height / 2) + 13) + ")rotate(-90)")
			.attr("font-size",function(d){
				if(typeCases == "avgratetests_last7" || typeCases == "avgpositivity_last7" || typeCases == "avgtests_last7") {
					return "9px";
				}else if(typeCases == "numtests") {
					return "10px";
				}else{
					return "12px";
				}
			})
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
			.attr("id", "trendHighlight")
			.append("rect")
			.attr("height", height)
			.attr("width", "10px")
			.attr("fill", "lightgrey")
			.attr("transform", function(d) {
				return "translate(" + (x(parseTime(currentDate)) - 5) + ",0)";
			})
			.attr("opacity", 0.8);

		d3.select("#trendHighlight").lower();
	}


	function updateTrend(filter) {
		var data;
		var isISC = false;
		// typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
		// txtTypeCases = $('#dropdownType1 option:selected').text();

		if (currentRegion.trend) {
			data = d3.entries(currentRegion.trend);
			var txtTotal;
			if (timeData[currentRegion.HRUID][currentDate]) {
				txtTotal = timeData[currentRegion.HRUID][currentDate][0][typeCases];
			}
			else {
				txtTotal = 0;
			}
			d3.select("#txtTotal").html(function() {
				return generateTxtTotal(txtTotal, currentRegion.HRUID, typeCases);
			});

			if (language == "en") {
				d3.select(".titleTrendLabel").text(currentRegion.prname).call(wrap, 300);
			}
			else {
				d3.select(".titleTrendLabel").text(currentRegion.prnameFR).call(wrap, 300);
			}
		}
		else if (currentRegion.HRUID == "98") {
			isISC = true;
			data = d3.entries(timeDataISC[currentRegion.HRUID]);
			
			d3.select("#txtTotal").text(function() {
				if(timeDataISC[currentRegion.pruid][currentDateISC][0][typeCases] == null){
					if(language == "en"){
						return "N/A";
					}else{
						return "s.o.";
					}
				}else{
					return generateTxtTotal(timeDataISC[currentRegion.pruid][currentDateISC][0][typeCases], currentRegion.HRUID, typeCases);
				}
			});

			if (language == "en") {
				d3.select(".titleTrendLabel").text(currentRegion.prname).call(wrap, 300);
			}
			else {
				d3.select(".titleTrendLabel").text(currentRegion.prnameFR).call(wrap, 300);
			}
		}
		else {
			data = d3.entries(timeData[currentRegion.properties.PRUID]);
			if (timeData[currentRegion.properties.PRUID][currentDate]) {
				txtTotal = timeData[currentRegion.properties.PRUID][currentDate][0][typeCases];
			}
			else {
				txtTotal = 0;
			}
			d3.select("#txtTotal").html(function() {
				return generateTxtTotal(txtTotal, currentRegion.properties.PRUID, typeCases);
				// if (language == "en") {
				// 	if(currentRegion.properties.PRUID == "60" && typeCases == "numrecover")
				// 		return d3.format(",d")(txtTotal) + "*";
				// 	/* if(currentRegion.properties.PRUID == "24" && typeCases == "numtests")
				// 		return d3.format(",d")(txtTotal) + "*"; */
				// 	return d3.format(",d")(txtTotal);
				// }
				// else {
				// 	if(currentRegion.properties.PRUID == "60" && typeCases == "numrecover")
				// 		return d3.format(",d")(txtTotal) + "*";
				// 	/* if(currentRegion.properties.PRUID == "24" && typeCases == "numtests")
				// 		return (d3.format(",d")(txtTotal)).replace(",", " ") + "*"; */
				// 	return (d3.format(",d")(txtTotal)).replace(",", " ");
				// }
			});

			if (language == "en") {
				d3.select(".titleTrendLabel").text(currentRegion.properties.PRENAME).call(wrap, 300);
			}
			else {
				d3.select(".titleTrendLabel").text(currentRegion.properties.PRFNAME).call(wrap, 300);
			}
		}
		// this was breaking the trend on load with query string
		// 		let testsIndex = data.findIndex(function(d){
		// 			return d.key == "31-01-2021"	
		// 		})
		// if ($('#dropdownType1').val() == "tests")
		// 			data = data.slice(testsIndex, data.length)

		if(typeCases == "numtests_last7" || typeCases == "avgtests_last7" || typeCases == "avgratetests_last7" || typeCases == "avgpositivity_last7"){
			data = data.filter(function(d){
				return parseTime(d.value[0].date) <= parseTime(currentDate);
			})	
		}
		
		x.domain(d3.extent(data, function(d) {
			return parseTime(d.key);

		}));
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

		//Create updated trendline path d
		d3.select("#trendUpdate").remove();
		d3.select("#trendData g").append("path")
			.attr("id", "trendUpdate")
			.data([data])
			.attr("d", trendline)
			.style("display", "none");

		//Transition the valueline path.
		d3.select("#trendPath")
			.data([data])
			.transition()
			.duration(600)
			.attr("stroke", function(d) {
				return "rgb(8, 81, 156)";
			})
			.attrTween("d", function(d) {
				var previous = d3.select(this).attr("d");
				var current = d3.select("#trendUpdate").attr("d");
				return d3.interpolatePath(previous, current);
			});

		d3.select("#connectorUpdate").remove();
		d3.select("#trendData g").append("path")
			.attr("id", "connectorUpdate")
			.datum(data.filter(trendline.defined()))
			.attr("d", trendline)
			.style("display", "none");

		//Transition the connector line path.
		d3.select("#connector")
			.datum(data.filter(trendline.defined()))
			.transition()
			.duration(600)
			.style("stroke-dasharray", ("3, 3"))
			.attrTween("d", function(d) {
				var previous = d3.select(this).attr("d");
				var current = d3.select("#connectorUpdate").attr("d");
				return d3.interpolatePath(previous, current);
			});

		//Transition the X Axis
		//this fixes repeating x axis tixks while there is not enough data for tests
		// if(typeCases == "numtests" || typeCases == "ratetests"){
		// d3.select("#trendX")
		// .transition()
		// .duration(600)
		// .call(d3.axisBottom(x).ticks(5).tickValues(data.map(function(d){return parseTime(d.key)})).tickFormat(d3.timeFormat("%b %d")))
		// .selectAll("text")
		// .attr("y", 12)
		// .attr("x", -21)
		// .attr("dy", ".35em")
		// .attr("transform", "rotate(-45)");
		// }
		// else{
		d3.select("#trendX")
			.transition()
			.duration(600)
			.call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%d %b '%y")))
			.selectAll("text")
			.attr("y", 12)
			.attr("x", -21)
			.attr("dy", ".35em")
			.attr("transform", "rotate(-45)");
		// }


		//Transition the Y Axis
		// Add the Y Axis
		const yAxisTicks = y.ticks(6, "s")
			.filter(function(tick) { return isInteger(tick); });

		d3.select("#trendY")
			.transition()
			.duration(600)
			.call(d3.axisLeft(y).tickValues(yAxisTicks).ticks(6, "s"))

		d3.select(".yAxisTrendLabel").text(function(d) {
			if (language == "en") {
				return txtTypeMod + " of " + txtTypeCases;
			}
			else {
				return txtTypeMod + " de " + txtTypeCases.toLowerCase();
			}
		})
		.attr("font-size",function(d){
			
			if(typeCases == "avgratetests_last7" || typeCases == "avgpositivity_last7"){	
				if(language == "fr"){
					return "7px";
				}
				return "8px";
			}else if(typeCases == "avgtests_last7") {
				return "9px";
			}else if(typeCases == "numtests") {
				return "10px";
			}else{
				return "12px";
			}
		})

		//Transition the Date Highlighter
		d3.select("#trendHighlight rect")
			.transition()
			.duration(600)
			.attr("transform", function(d) {
				if (x(parseTime(currentDate)) < 0) {
					d3.select(this).style("display", "none");
					return "translate(-5,0)";
				}
				else {
					d3.select(this).style("display", "block");
					return "translate(" + (x(parseTime(currentDate)) - 5) + ",0)";

				}
			})
	}

	function colorMap() {
		// typeCases = $('#dropdownType3').val()+$('#dropdownType1').val();
		d3.selectAll(".regions")
			.style("fill", function(d) {
				var colorData = timeData[d.properties.PRUID][currentDate][0];
				if (typeCases == "percentoday") {
					return color(colorData[typeCases] * 100);
				}
				else {
					return color(colorData[typeCases]);
				}
			});
	}

	function color(value) {
		if (typeCases == "numtotal") {
			if (value > 300000) return COLOR_SCALE["6+"];
			else if (value > 100000) return COLOR_SCALE["5-6"];
			else if (value > 50000) return COLOR_SCALE["4-5"];
			else if (value > 10000) return COLOR_SCALE["3-4"];
			else if (value > 1000) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "ratetotal") {
			if (value > 2500) return COLOR_SCALE["6+"];
			else if (value > 1500) return COLOR_SCALE["5-6"];
			else if (value > 500) return COLOR_SCALE["4-5"];
			else if (value > 200) return COLOR_SCALE["3-4"];
			else if (value > 100) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "numdeaths") {
			if (value > 5000) return COLOR_SCALE["6+"];
			else if (value > 1000) return COLOR_SCALE["5-6"];
			else if (value > 500) return COLOR_SCALE["4-5"];
			else if (value > 100) return COLOR_SCALE["3-4"];
			else if (value > 25) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "ratedeaths") {
			if (value > 100) return COLOR_SCALE["6+"];
			else if (value > 50) return COLOR_SCALE["5-6"];
			else if (value > 20) return COLOR_SCALE["4-5"];
			else if (value > 10) return COLOR_SCALE["3-4"];
			else if (value > 5) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "numtests") {
			if (value > 1660000) return COLOR_SCALE["6+"];
			else if (value > 562000) return COLOR_SCALE["5-6"];
			else if (value > 188000) return COLOR_SCALE["4-5"];
			else if (value > 60800) return COLOR_SCALE["3-4"];
			else if (value > 17600) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "ratetests") {
			if (value > 243000) return COLOR_SCALE["6+"];
			else if (value > 183000) return COLOR_SCALE["5-6"];
			else if (value > 143000) return COLOR_SCALE["4-5"];
			else if (value > 123000) return COLOR_SCALE["3-4"];
			else if (value > 103000) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "numactive") {
			if (value > 30000) return COLOR_SCALE["6+"];
			else if (value > 10000) return COLOR_SCALE["5-6"];
			else if (value > 5000) return COLOR_SCALE["4-5"];
			else if (value > 500) return COLOR_SCALE["3-4"];
			else if (value > 50) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "rateactive") {
			if (value > 300) return COLOR_SCALE["6+"];
			else if (value > 200) return COLOR_SCALE["5-6"];
			else if (value > 100) return COLOR_SCALE["4-5"];
			else if (value > 50) return COLOR_SCALE["3-4"];
			else if (value > 10) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "numrecover") {
			if (value > 300000) return COLOR_SCALE["6+"];
			else if (value > 100000) return COLOR_SCALE["5-6"];
			else if (value > 50000) return COLOR_SCALE["4-5"];
			else if (value > 10000) return COLOR_SCALE["3-4"];
			else if (value > 1000) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "numtotal_last7") {
			if (value > 10000) return COLOR_SCALE["6+"];
			else if (value > 5000) return COLOR_SCALE["5-6"];
			else if (value > 500) return COLOR_SCALE["4-5"];
			else if (value > 50) return COLOR_SCALE["3-4"];
			else if (value > 25) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "ratetotal_last7") {
			if (value > 200) return COLOR_SCALE["6+"];
			else if (value > 150) return COLOR_SCALE["5-6"];
			else if (value > 50) return COLOR_SCALE["4-5"];
			else if (value > 25) return COLOR_SCALE["3-4"];
			else if (value > 5) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "numdeaths_last7") {
			if (value > 250) return COLOR_SCALE["6+"];
			else if (value > 150) return COLOR_SCALE["5-6"];
			else if (value > 50) return COLOR_SCALE["4-5"];
			else if (value > 25) return COLOR_SCALE["3-4"];
			else if (value > 10) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "ratedeaths_last7") {
			if (value > 6.0) return COLOR_SCALE["6+"];
			else if (value > 4.0) return COLOR_SCALE["5-6"];
			else if (value > 3.0) return COLOR_SCALE["4-5"];
			else if (value > 2.0) return COLOR_SCALE["3-4"];
			else if (value > 1.0) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "numtotal_last14") {
			if (value > 20000) return COLOR_SCALE["6+"];
			else if (value > 10000) return COLOR_SCALE["5-6"];
			else if (value > 1000) return COLOR_SCALE["4-5"];
			else if (value > 100) return COLOR_SCALE["3-4"];
			else if (value > 50) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "ratetotal_last14") {
			if (value > 400) return COLOR_SCALE["6+"];
			else if (value > 300) return COLOR_SCALE["5-6"];
			else if (value > 100) return COLOR_SCALE["4-5"];
			else if (value > 50) return COLOR_SCALE["3-4"];
			else if (value > 10) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "numdeaths_last14") {
			if (value > 500) return COLOR_SCALE["6+"];
			else if (value > 300) return COLOR_SCALE["5-6"];
			else if (value > 100) return COLOR_SCALE["4-5"];
			else if (value > 50) return COLOR_SCALE["3-4"];
			else if (value > 5) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "ratedeaths_last14") {
			if (value > 10.0) return COLOR_SCALE["6+"];
			else if (value > 6.0) return COLOR_SCALE["5-6"];
			else if (value > 4.0) return COLOR_SCALE["4-5"];
			else if (value > 2.0) return COLOR_SCALE["3-4"];
			else if (value > 1.0) return COLOR_SCALE["2-3"];
			else if (value > 0) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "avgtests_last7") {
			if (value > 30000) return COLOR_SCALE["6+"];
			else if (value > 10000) return COLOR_SCALE["5-6"];
			else if (value > 5000) return COLOR_SCALE["4-5"];
			else if (value > 3000) return COLOR_SCALE["3-4"];
			else if (value > 1000) return COLOR_SCALE["2-3"];
			else if (value >= 0 && value != null) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "avgratetests_last7") {
			if (value > 800) return COLOR_SCALE["6+"];
			else if (value > 600) return COLOR_SCALE["5-6"];
			else if (value > 400) return COLOR_SCALE["4-5"];
			else if (value > 200) return COLOR_SCALE["3-4"];
			else if (value > 100) return COLOR_SCALE["2-3"];
			else if (value >= 0 && value != null) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else if (typeCases == "avgpositivity_last7") {
			if (value >= 15.0) return COLOR_SCALE["6+"];
			else if (value >= 10.0) return COLOR_SCALE["5-6"];
			else if (value >= 5.0) return COLOR_SCALE["4-5"];
			else if (value >= 3.0) return COLOR_SCALE["3-4"];
			else if (value >= 1.0) return COLOR_SCALE["2-3"];
			else if (value >= 0 && value != null) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
		else {
			if (value >= (scale * 10 / 3) + 1) return COLOR_SCALE["6+"];
			else if (value >= ((scale * 2) + 1)) return COLOR_SCALE["5-6"];
			else if (value >= ((scale * 2 / 3) + 1)) return COLOR_SCALE["4-5"];
			else if (value >= ((scale / 3) + 1)) return COLOR_SCALE["3-4"];
			else if (value >= ((scale / 15) + 1)) return COLOR_SCALE["2-3"];
			else if (value >= 1) return COLOR_SCALE["1-2"]
			else return COLOR_SCALE["N/A"];
		}
	}

	function updateLegendText(d, i) {
		if (typeCases == "numtotal") {
			if (language == "en") {
				if (i == 0) {
					return "300,000 and higher";
				}
				else if (i == 1) {
					return "100,000 to 299,999";
				}
				else if (i == 2) {
					return "50,000 to 99,999";
				}
				else if (i == 3) {
					return "10,000 to 49,999";
				}
				else if (i == 4) {
					return "1,000 to 9,999";
				}
				else if (i == 5) {
					return "1 to 999";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "300 000 et plus";
				}
				else if (i == 1) {
					return "100 000 à 299 999";
				}
				else if (i == 2) {
					return "50 000 à 99 999";
				}
				else if (i == 3) {
					return "10 000 à 49 999";
				}
				else if (i == 4) {
					return "1,000 à 9,999";
				}
				else if (i == 5) {
					return "1 à 999";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "ratetotal") {
			if (language == "en") {
				if (i == 0) {
					return "2,500.0 and higher";
				}
				else if (i == 1) {
					return "1,000.0 to 2,499.9";
				}
				else if (i == 2) {
					return "500.0 to 999.9";
				}
				else if (i == 3) {
					return "200.0 to 499.9";
				}
				else if (i == 4) {
					return "100.0 to 199.9";
				}
				else if (i == 5) {
					return "0 to 99.9";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "2 500,0 et plus";
				}
				else if (i == 1) {
					return "1 000,0 à 2 499,9";
				}
				else if (i == 2) {
					return "500,0 à 999,9";
				}
				else if (i == 3) {
					return "200,0 à 499,9";
				}
				else if (i == 4) {
					return "100,0 à 199,9";
				}
				else if (i == 5) {
					return "0 à 99,9";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "numdeaths") {
			if (language == "en") {
				if (i == 0) {
					return "5,000 and higher";
				}
				else if (i == 1) {
					return "1,000 to 4,999";
				}
				else if (i == 2) {
					return "500 to 999";
				}
				else if (i == 3) {
					return "100 to 499";
				}
				else if (i == 4) {
					return "25 to 99";
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
					return "5 000 et plus";
				}
				else if (i == 1) {
					return "1 000 à 4 999";
				}
				else if (i == 2) {
					return "500 à 999";
				}
				else if (i == 3) {
					return "100 à 499";
				}
				else if (i == 4) {
					return "25 à 99";
				}
				else if (i == 5) {
					return "1 à 24";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "ratedeaths") {
			if (language == "en") {
				if (i == 0) {
					return "100.0 and higher";
				}
				else if (i == 1) {
					return "50.0 to 99.9";
				}
				else if (i == 2) {
					return "10.0 to 49.9";
				}
				else if (i == 3) {
					return "5.0 to 9.9";
				}
				else if (i == 4) {
					return "1.0 to 4.9";
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
					return "100,0 et plus";
				}
				else if (i == 1) {
					return "50,0 à 99,9";
				}
				else if (i == 2) {
					return "10,0 à 49,9";
				}
				else if (i == 3) {
					return "5,0 à 9,9";
				}
				else if (i == 4) {
					return "1,0 à 4,9";
				}
				else if (i == 5) {
					return "0,1 à 0,9";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "numtests") {
			if (language == "en") {
				if (i == 0) {
					return "1.660M and higher";
				}
				else if (i == 1) {
					return "562K to 1.660M";
				}
				else if (i == 2) {
					return "188K to 562K";
				}
				else if (i == 3) {
					return "60.8K to 188K";
				}
				else if (i == 4) {
					return "17.6K to 60.8K";
				}
				else if (i == 5) {
					return "1 to 17.6K";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "1,660 M et plus";
				}
				else if (i == 1) {
					return "562 k à 1,660 M";
				}
				else if (i == 2) {
					return "188 k à 562 k";
				}
				else if (i == 3) {
					return "60,8 k à 188 k";
				}
				else if (i == 4) {
					return "17,6 k à 60,8 k";
				}
				else if (i == 5) {
					return "1 à 17,6 k";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "ratetests") {
			if (language == "en") {
				if (i == 0) {
					return "243 000 and higher";
				}
				else if (i == 1) {
					return "183K to 243K";
				}
				else if (i == 2) {
					return "143K to 183K";
				}
				else if (i == 3) {
					return "123K to 143K";
				}
				else if (i == 4) {
					return "103K to 123K";
				}
				else if (i == 5) {
					return "0 to 103K";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "243 k et plus";
				}
				else if (i == 1) {
					return "183 k à 243 k";
				}
				else if (i == 2) {
					return "143 k à 183 k";
				}
				else if (i == 3) {
					return "123 k à 143 k";
				}
				else if (i == 4) {
					return "103 k à 123 k";
				}
				else if (i == 5) {
					return "0 à 103 k";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "numrecover") {
			if (language == "en") {
				if (i == 0) {
					return "300,000 and higher";
				}
				else if (i == 1) {
					return "100,000 to 299,999";
				}
				else if (i == 2) {
					return "50,000 to 99,999";
				}
				else if (i == 3) {
					return "10,000 to 49,999";
				}
				else if (i == 4) {
					return "1,000 to 9,999";
				}
				else if (i == 5) {
					return "1 to 999";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "300 000 et plus";
				}
				else if (i == 1) {
					return "100 000 à 299 999";
				}
				else if (i == 2) {
					return "50 000 à 99 999";
				}
				else if (i == 3) {
					return "10 000 à 49 999";
				}
				else if (i == 4) {
					return "1 000 à 9 999";
				}
				else if (i == 5) {
					return "1 à 999";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "numactive") {
			if (language == "en") {
				if (i == 0) {
					return "30,000 and higher";
				}
				else if (i == 1) {
					return "10,000 to 29,999";
				}
				else if (i == 2) {
					return "5,000 to 9,999";
				}
				else if (i == 3) {
					return "500 to 4,999";
				}
				else if (i == 4) {
					return "50 to 499";
				}
				else if (i == 5) {
					return "1 to 49";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "30 000 et plus";
				}
				else if (i == 1) {
					return "10 000 à 29 000";
				}
				else if (i == 2) {
					return "5 000 à 9 999";
				}
				else if (i == 3) {
					return "500 à 4,999";
				}
				else if (i == 4) {
					return "50 à 499";
				}
				else if (i == 5) {
					return "1 à 49";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "rateactive") {
			if (language == "en") {
				if (i == 0) {
					return "300.0 and higher";
				}
				else if (i == 1) {
					return "200.0 to 299.9";
				}
				else if (i == 2) {
					return "100.0 to 199.9";
				}
				else if (i == 3) {
					return "50.0 to 99.9";
				}
				else if (i == 4) {
					return "10.0 to 49.9";
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
					return "300,0 et plus";
				}
				else if (i == 1) {
					return "200,0 à 299,9";
				}
				else if (i == 2) {
					return "100,0 à 199,9";
				}
				else if (i == 3) {
					return "50,0 à 99,9";
				}
				else if (i == 4) {
					return "10,0 à 49,9";
				}
				else if (i == 5) {
					return "0,1 à 9,9";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "numtotal_last7") {
			if (language == "en") {
				if (i == 0) {
					return "10,000 and higher";
				}
				else if (i == 1) {
					return "5,000 to 9,999";
				}
				else if (i == 2) {
					return "500 to 4,999";
				}
				else if (i == 3) {
					return "50 to 499";
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
					return "10 000 et plus";
				}
				else if (i == 1) {
					return "5 000 à 9 999";
				}
				else if (i == 2) {
					return "500 à 4 999";
				}
				else if (i == 3) {
					return "50 à 499";
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
					return "200.0 and higher";
				}
				else if (i == 1) {
					return "150.0 to 199.9";
				}
				else if (i == 2) {
					return "50.0 to 149.9";
				}
				else if (i == 3) {
					return "25.0 to 49.9";
				}
				else if (i == 4) {
					return "5.0 to 24.9";
				}
				else if (i == 5) {
					return "0.1 to 4.9";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "200,0 et plus";
				}
				else if (i == 1) {
					return "150,0 à 199,9";
				}
				else if (i == 2) {
					return "50,0 à 149,9";
				}
				else if (i == 3) {
					return "25,0 à 49,9";
				}
				else if (i == 4) {
					return "5,0 à 24,9";
				}
				else if (i == 5) {
					return "0,1 à 4,9";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "numdeaths_last7") {
			if (language == "en") {
				if (i == 0) {
					return "250 and higher";
				}
				else if (i == 1) {
					return "150 to 249";
				}
				else if (i == 2) {
					return "50 to 149";
				}
				else if (i == 3) {
					return "25 to 49";
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
					return "250 et plus";
				}
				else if (i == 1) {
					return "150 à 249";
				}
				else if (i == 2) {
					return "50 à 149";
				}
				else if (i == 3) {
					return "25 à 49";
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
		else if (typeCases == "ratedeaths_last7") {
			if (language == "en") {
				if (i == 0) {
					return "6.0 and higher";
				}
				else if (i == 1) {
					return "4.0 to 5.9";
				}
				else if (i == 2) {
					return "3.0 to 3.9";
				}
				else if (i == 3) {
					return "2.0 to 2.9";
				}
				else if (i == 4) {
					return "1.0 to 1.9";
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
					return "6,0 et plus";
				}
				else if (i == 1) {
					return "4,0 à 5,9";
				}
				else if (i == 2) {
					return "3,0 à 3,9";
				}
				else if (i == 3) {
					return "2,0 à 2,9";
				}
				else if (i == 4) {
					return "1,0 à 1,9";
				}
				else if (i == 5) {
					return "0,1 à 0,9";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "numtotal_last14") {
			if (language == "en") {
				if (i == 0) {
					return "20,000 and higher";
				}
				else if (i == 1) {
					return "10,000 to 19,999";
				}
				else if (i == 2) {
					return "1,000 to 9,999";
				}
				else if (i == 3) {
					return "100 to 999";
				}
				else if (i == 4) {
					return "50 to 99";
				}
				else if (i == 5) {
					return "1 to 49";
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
					return "1 000 à 9 999";
				}
				else if (i == 3) {
					return "100 à 999";
				}
				else if (i == 4) {
					return "50 à 99";
				}
				else if (i == 5) {
					return "1 à 49";
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
					return "300 to 399";
				}
				else if (i == 2) {
					return "100 to 299";
				}
				else if (i == 3) {
					return "50 to 99";
				}
				else if (i == 4) {
					return "10 to 49";
				}
				else if (i == 5) {
					return "0 to 9";
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
					return "300 à 399";
				}
				else if (i == 2) {
					return "100 à 299";
				}
				else if (i == 3) {
					return "50 à 99";
				}
				else if (i == 4) {
					return "10 à 49";
				}
				else if (i == 5) {
					return "0 à 9";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "numdeaths_last14") {
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
					return "50 to 99";
				}
				else if (i == 4) {
					return "5 to 49";
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
					return "50 à 99";
				}
				else if (i == 4) {
					return "5 à 49";
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
					return "10.0 and higher";
				}
				else if (i == 1) {
					return "6.0 to 9.9";
				}
				else if (i == 2) {
					return "4.0 to 5.9";
				}
				else if (i == 3) {
					return "2.0 to 3.9";
				}
				else if (i == 4) {
					return "1.0 to 1.9";
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
					return "10,0 et plus";
				}
				else if (i == 1) {
					return "6,0 à 9,9";
				}
				else if (i == 2) {
					return "4,0 à 5,9";
				}
				else if (i == 3) {
					return "2,0 à 3,9";
				}
				else if (i == 4) {
					return "1,0 à 1,9";
				}
				else if (i == 5) {
					return "0,1 à 0,9";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "avgtests_last7") {
			if (language == "en") {
				if (i == 0) {
					return "30,000 and higher";
				}
				else if (i == 1) {
					return "10,000 to 29,999";
				}
				else if (i == 2) {
					return "5,000 to 9,999";
				}
				else if (i == 3) {
					return "3,000 to 4,999";
				}
				else if (i == 4) {
					return "1,000 to 2,999";
				}
				else if (i == 5) {
					return "1 to 999";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "30 000 et plus";
				}
				else if (i == 1) {
					return "10 000 à 29 999";
				}
				else if (i == 2) {
					return "5 000 à 9 999";
				}
				else if (i == 3) {
					return "3 000 à 4,999";
				}
				else if (i == 4) {
					return "1 000 à 2 999";
				}
				else if (i == 5) {
					return "1 à 999";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "avgratetests_last7") {
			if (language == "en") {
				if (i == 0) {
					return "800 and higher";
				}
				else if (i == 1) {
					return "600 to 799";
				}
				else if (i == 2) {
					return "400 to 599";
				}
				else if (i == 3) {
					return "200 to 399";
				}
				else if (i == 4) {
					return "100 to 199";
				}
				else if (i == 5) {
					return "1 to 99";
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return "800 et plus";
				}
				else if (i == 1) {
					return "600 à 799";
				}
				else if (i == 2) {
					return "400 à 599";
				}
				else if (i == 3) {
					return "200 à 399";
				}
				else if (i == 4) {
					return "1 à 199";
				}
				else if (i == 5) {
					return "0 à 49";
				}
				else {
					return "0";
				}
			}
		}
		else if (typeCases == "avgpositivity_last7") {
			if (language == "en") {
				if (i == 0) {
					return "15.0 and higher";
				}
				else if (i == 1) {
					return "10.0 to 14.99";
				}
				else if (i == 2) {
					return "5.0 to 9.99";
				}
				else if (i == 3) {
					return "3.0 to 4.99";
				}
				else if (i == 4) {
					return "1.0 to 2.99";
				}
				else if (i == 5) {
					return "0.1 to 0.99";
				}
				else {
					return "N/A";
				}
			}
			else {
				if (i == 0) {
					return "15,0 et plus";
				}
				else if (i == 1) {
					return "10,0 à 14,99";
				}
				else if (i == 2) {
					return "5,0 à 9,99";
				}
				else if (i == 3) {
					return "3,0 à 4,99";
				}
				else if (i == 4) {
					return "1,0 à 2,99";
				}
				else if (i == 5) {
					return "0,1 à 0,99";
				}
				else {
					return "s.o.";
				}
			}
		}
		else {
			if (language == "en") {
				if (i == 0) {
					return d3.format(",d")((scale * 10 / 3) + 1) + " and higher";
				}
				else if (i == 1) {
					return d3.format(",d")(scale * 2 + 1) + " to " + d3.format(",d")(scale * 10 / 3);
				}
				else if (i == 2) {
					return d3.format(",d")((scale * 2 / 3) + 1) + " to " + d3.format(",d")(scale * 2);
				}
				else if (i == 3) {
					return d3.format(",d")((scale / 3) + 1) + " to " + d3.format(",d")(scale * 2 / 3);
				}
				else if (i == 4) {
					return d3.format(",d")((scale / 15) + 1) + " to " + d3.format(",d")(scale / 3);
				}
				else if (i == 5) {
					return "1 to " + d3.format(",d")(scale / 15);
				}
				else {
					return "0";
				}
			}
			else {
				if (i == 0) {
					return d3.format(",d")((scale * 10 / 3) + 1) + " et plus";
				}
				else if (i == 1) {
					return d3.format(",d")(scale * 2 + 1) + " à " + d3.format(",d")(scale * 10 / 3);
				}
				else if (i == 2) {
					return d3.format(",d")((scale * 2 / 3) + 1) + " à " + d3.format(",d")(scale * 2);
				}
				else if (i == 3) {
					return d3.format(",d")((scale / 3) + 1) + " à " + d3.format(",d")(scale * 2 / 3);
				}
				else if (i == 4) {
					return d3.format(",d")((scale / 15) + 1) + " à " + d3.format(",d")(scale / 3);
				}
				else if (i == 5) {
					return "1 à " + d3.format(",d")(scale / 15);
				}
				else {
					return "0";
				}
			}
		}
	}

	function drawLegend(timeData2) {
		var target = svg;
		// typeCases = $('#dropdownType3').val()+$('#dropdownType1').val();

		var gap = 5;
		var squareSize = 13;
		var topMargin = 5;

		target.append('g')
			.attr('class', 'legend')
			.attr('id', 'legend')
			.attr("transform", "translate(-60,100)")
			.selectAll('g.categoryLegend')
			.data(Object.keys(COLOR_SCALE))
			.enter()
			.append('g')
			.attr('class', 'categoryLegend')
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
		d3.select("#legendTitle1").remove()
		d3.select("#legend")
			.append("text")
			.attr("x", 550)
			.attr("font-size", "13.5px")
			.attr("font-weight", "bold")
			.attr("id", "legendTitle1")
			.attr("y", topMargin - 20)
			.text(function() {
				if (language == "en") {
					if (typeCases == "numdeaths") {
						return "Count of " + txtTypeCases.toLowerCase() + " related to COVID-19";
					}
					else if (typeCases == "numdeaths_last7") {
						return "Count of " + txtTypeCases.toLowerCase() + " related to COVID-19";
					}
					else if (typeCases == "numdeaths_last14") {
						return "Count of " + txtTypeCases.toLowerCase() + " related to COVID-19";
					}
					else if (typeCases == "numrecover") {
						return "Count of " + txtTypeCases.toLowerCase() + " from COVID-19";
					}
					else if (typeCases == "numtests") {
						return "Count of " + txtTypeCases.toLowerCase() + " for COVID-19";
					}
					else if ((typeCases == "numtotal") || (typeCases == "numactive") || (typeCases == "numtotal_last7") || (typeCases == "numtotal_last14")) {
						return "Count of " + txtTypeCases.toLowerCase() + " of COVID-19";
					}
					else if ((typeCases == "ratedeaths") || (typeCases == "ratedeaths_last7") || (typeCases == "ratedeaths_last14")) {
						return "Rate of " + txtTypeCases.toLowerCase() + " related to COVID-19"
					}
					else if (typeCases == "ratetests") {
						return "Rate of " + txtTypeCases.toLowerCase() + " for COVID-19"
					}
					else if (typeCases == "avgpositivity_last7" || typeCases == "avgtests_last7") {
						return "Moving average of " + txtTypeCases.toLowerCase() + " for COVID-19"
					}
					else {
						return "Rate of " + txtTypeCases.toLowerCase() + " of COVID-19";
					}
				}
				else {
					if (typeCases == "numdeaths") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " liés à la COVID-19";
					}
					else if (typeCases == "numdeaths_last7") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " liés à la COVID-19";
					}
					else if (typeCases == "numdeaths_last14") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " liés à la COVID-19";
					}
					else if (typeCases == "numrecover") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " de la COVID-19";
					}
					else if (typeCases == "numtests") {
						return "Nombre de " + txtTypeCases.toLowerCase() + " pour la COVID-19";
					}
					else if ((typeCases == "numtotal") || (typeCases == "numactive") || (typeCases == "numtotal_last7") || (typeCases == "numtotal_last14")) {
						return "Nombre de " + txtTypeCases.toLowerCase() + " de COVID-19";
					}
					else if ((typeCases == "ratedeaths" || (typeCases == "ratedeaths_last7") || (typeCases == "ratedeaths_last14"))) {
						return "Taux de " + txtTypeCases.toLowerCase() + " liés à la COVID-19"
					}
					else if (typeCases == "ratetests") {
						return "Taux de " + txtTypeCases.toLowerCase() + " pour la COVID-19"
					}
					else if (typeCases == "avgpositivity_last7" || typeCases == "avgtests_last7") {
						return "Moyenne mobile " + txtTypeCases.toLowerCase() + " pour la COVID-19"
					}
					else {
						return "Taux de " + txtTypeCases.toLowerCase() + " de la COVID-19";
					}
				}
			}).call(wrap, 240)

		let timeDataMax = [];
		timeData2.forEach(function(d) {
			if (d.key != 1) {
				return d.values.forEach(function(e) {
					timeDataMax.push(e.values[0][typeCases]);
				});
			}
		})
		const totalMax = d3.max(timeDataMax);

		d3.selectAll('.categoryLegend')
			.append('text')
			.attr("class", "legend-text")
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

		const bottomLeg = d3.select("#map svg").append("g").attr("class", "bottomLeg").attr("transform", function(d, i) { return "translate(-100,545)" })

		//JULY 17 NUMRECOVER
		bottomLeg.append("text")
			// .text(function() {
			// 	// if (language == "en") {
			// 	// 	if (typeCases == "numtoday") {
			// 	// 		return "Note: When displaying the number of new cases, data is only available for a complete day.";
			// 	// 	}
			// 	// 	else if (typeCases == "numtests") {
			// 	// 		return "Note: Provincial/territorial (PT) data reported on their websites should be used if there are discrepancies. This can be due to lags, differing reporting cut-offs, or changes in lab testing criteria.";
			// 	// 	}
			// 	// 	else if (typeCases == "numtotal") {
			// 	// 		return "Note: The total number includes publicly reported confirmed and probable cases.";
			// 	// 	}
			// 	// 	else if (typeCases == "numrecover") {
			// 	// 		return "Note: On July 17, there was an increase in the number of recovered cases in Quebec due to a revision in how they define these cases."
			// 	// 	}
			// 	// }
			// 	// else {
			// 	// 	if (typeCases == "numtoday") {
			// 	// 		return "Remarque: Lorsque le nombre de nouveaux cas est affiché, les données sont seulement disponibles pour une jour complète.";
			// 	// 	}
			// 	// 	else if (typeCases == "numtests") {
			// 	// 		return "Remarque: Les données provinciales / territoriales (PT) signalées sur les sites Web des provinces et territoires être utilisées en cas d’écarts dans les données. Ces écarts peuvent être dûs à des retards, des dates de rapports différentes ou des changements dans les critères relatifs aux essais en laboratoire.";
			// 	// 	}
			// 	// 	else if (typeCases == "numtotal") {
			// 	// 		return "Remarque: Le nombre total comprend les cas confirmés et probables rapportés publiquement.";
			// 	// 	}
			// 	// 	else if (typeCases == "numrecover") {
			// 	// 		return "Remarque: Le 17 juillet, il y avait une augmentation du nombre de personnes classifiées comme rétablies dans le Québec à cause des révisions de la façon dont ils définissent ces cas."
			// 	// 	}
			// 	// }
			// })
			.attr("font-size", "12px")
			.attr("x", (x.range()[0] + 10))
			.attr("y", 0)
			.style("text-anchor", "start")
			.attr("transform", "translate(90," + ((5) - (-1 * 0.3)) + ")")
			.call(wrap, 395)
			
			bottomLegendText();
	}

	var logSwitch = 0;
	var relativeSwitch = 0;
	var smallMultipleData = [];
	// set the dimensions and margins of the graph
	var margin2 = { top: 50, right: 65, bottom: 70, left: 63 },
		width2 = 370.5 - margin2.left - margin2.right,
		height2 = 330 - margin2.top - margin2.bottom;
	// set the ranges
	var x2 = d3.scaleTime().range([0, width2]);
	var y2 = d3.scaleLinear().range([height2, 0]);
	x2.domain(d3.extent(timeData2[0].values, function(d) { return d.key; }));
	y2.domain([0, d3.max(timeData2[0].values, function(d) { return d.values[0].avgtotal_last7; })]);
	//optional log stuff
	var yLog = d3.scaleLog().range([height2, 0]);
	// var logFormat10alt = yLog.tickFormat(10, "");
	yLog.domain([Math.exp(0), d3.max(timeData2[0].values, function(d) { return d.values[0].avgtotal_last7; })]);

	$('#dropdownType6').on('change', function() {
		/* 			$('#dropdownType5').val()=="recover" ? $('#dropdownType4 option[value="rate"]').css("display","none") : $('#dropdownType4 option[value="rate"]').css("display","");
				$('#dropdownType5').val()=="recover" ? $('#dropdownType4 option[value="rate"]').prop("disabled","true") : $('#dropdownType4 option[value="rate"]').prop("disabled","");
				$('#dropdownType5').val()=="recover" ? $('#dropdownType4 option[value="avg"]').css("display","none") : $('#dropdownType4 option[value="avg"]').css("display","");
				$('#dropdownType5').val()=="recover" ? $('#dropdownType4 option[value="avg"]').prop("disabled","true") : $('#dropdownType4 option[value="avg"]').prop("disabled",""); */
		typeModSM = $('#dropdownType5').val();
		typeCasesSM = $('#dropdownType5').val() + $('#dropdownType6').val();
		txtTypeCasesSM = $('#dropdownType6 option:selected').text();
		txtTypeModSM = $('#dropdownType5 option:selected').text();
		updateSmallMultipleTrends(logSwitch, relativeSwitch);
	})

	$('#dropdownType5').on('change', function() {
		//Disable choices where necessary
		if ($('#dropdownType5').val() == "rate") {
			d3.selectAll('#dropdownType5 option').style("display", "").attr("disabled", null);
			if ($('#dropdownType6').val() == "total_last7") {
				$('#dropdownType6 option[value="total"]').prop("selected", "true");
			}
			else if ($('#dropdownType6').val() == "deaths_last7") {
				$('#dropdownType6 option[value="deaths"]').prop("selected", "true");
			}
			else if ($('#dropdownType5').val() == "recover") {
				$('#dropdownType6 option[value="total"]').prop("selected", "true");
			}
			/* $('#dropdownType5 option[value="total_last7"]').css("display","none");
			$('#dropdownType5 option[value="total_last7"]').prop("disabled","true");
			$('#dropdownType5 option[value="deaths_last7"]').css("display","none");
			$('#dropdownType5 option[value="deaths_last7"]').prop("disabled","true");
			$('#dropdownType5 option[value="total_last14"]').css("display","none");
			$('#dropdownType5 option[value="total_last14"]').prop("disabled","true");
			$('#dropdownType5 option[value="deaths_last14"]').css("display","none");
			$('#dropdownType5 option[value="deaths_last14"]').prop("disabled","true"); */
			$('#dropdownType6 option[value="recover"]').css("display", "none");
			$('#dropdownType6 option[value="recover"]').prop("disabled", "true");
			$('#txtTotalMod').css('display', '');
			//relativeSwitch = 1;
			//d3.select("#relativeSwitch").classed("btn-info", true);
			//d3.select("#relativeSwitch").classed("btn-success", false);
			//$("#relativeSwitch").prop("disabled","true");
		}
		else if ($('#dropdownType5').val() == "num") {
			d3.selectAll('#dropdownType6 option').style("display", "").attr("disabled", null);
			if ($('#dropdownType6').val() == "total_last7") {
				$('#dropdownType6 option[value="total"]').prop("selected", "true");
			}
			else if ($('#dropdownType6').val() == "deaths_last7") {
				$('#dropdownType6 option[value="deaths"]').prop("selected", "true");
			}
			/* $('#dropdownType5 option[value="total_last7"]').css("display","none");
		    $('#dropdownType5 option[value="total_last7"]').prop("disabled","true");
	        $('#dropdownType5 option[value="deaths_last7"]').css("display","none");
		    $('#dropdownType5 option[value="deaths_last7"]').prop("disabled","true");
	        $('#dropdownType5 option[value="total_last14"]').css("display","none");
		    $('#dropdownType5 option[value="total_last14"]').prop("disabled","true");
	        $('#dropdownType5 option[value="deaths_last14"]').css("display","none");
		    $('#dropdownType5 option[value="deaths_last4"]').prop("disabled","true"); */
			$('#txtTotalMod').css('display', 'none');
			//$("#relativeSwitch").prop("disabled","");
		}
		else {
			d3.selectAll('#dropdownType6 option').style("display", "none").attr("disabled", "true");
			$('#dropdownType6 option[value="total_last7"]').prop("selected", "true");
			$('#dropdownType6 option[value="total_last7"]').prop("disabled", "");
			$('#dropdownType6 option[value="total_last7"]').css("display", "");
			$('#dropdownType6 option[value="deaths_last7"]').prop("disabled", "");
			$('#dropdownType6 option[value="deaths_last7"]').css("display", "");
			$('#txtTotalMod').css('display', 'none');
			//$("#relativeSwitch").prop("disabled","");				
		}


		typeModSM = $('#dropdownType5').val();
		typeCasesSM = $('#dropdownType5').val() + $('#dropdownType6').val();
		txtTypeCasesSM = $('#dropdownType6 option:selected').text();
		txtTypeModSM = $('#dropdownType5 option:selected').text();
		updateSmallMultipleTrends(logSwitch, relativeSwitch);
	})

	//clean-up later
	d3.select("#logSwitch").on("click", function() {
		if (logSwitch == 1) {
			logSwitch = 0
			d3.select(this).classed("btn-info", true);
			d3.select(this).classed("btn-success", false);
		}
		else {
			logSwitch = 1;
			d3.select(this).classed("btn-info", false);
			d3.select(this).classed("btn-success", true);
		}
		updateSmallMultipleTrends(logSwitch, relativeSwitch);
	});
	d3.select("#relativeSwitch").on("click", function() {
		if (relativeSwitch == 1) {
			relativeSwitch = 0;
			d3.select(this).classed("btn-info", false);
			d3.select(this).classed("btn-success", true);

		}
		else {
			relativeSwitch = 1;
			d3.select(this).classed("btn-info", true);
			d3.select(this).classed("btn-success", false);
		}
		updateSmallMultipleTrends(logSwitch, relativeSwitch);
	});

	drawSmallMultipleTrends(logSwitch, relativeSwitch);

	function updateSmallMultipleTrends(logSwitch, relativeSwitch) {
		txtTypeModSM = $('#dropdownType5 option:selected').text();
		typeCasesSM = $('#dropdownType5').val() + $('#dropdownType6').val();
		var yaxis = d3.axisLeft();
		var xaxis = d3.axisBottom(x2).tickFormat(d3.timeFormat("%d %b '%y"));
		
		if(typeCasesSM == "numtests_last7" || typeCasesSM == "avgtests_last7" || typeCasesSM == "avgratetests_last7" || typeCasesSM == "avgpositivity_last7"){	
			x2.domain(d3.extent(timeDataLab2[0].values, function(d) { return d.key; }));
		}else{
			x2.domain(d3.extent(timeData2[0].values, function(d) { return d.key; }));
		}
		
		if (logSwitch == 1) {
			yaxis.scale(yLog).tickFormat(function(e) {
				return yLog.tickFormat(1, d3.format(",d"))(e)
			})
		}
		else {
			if (typeCasesSM == "numtests") {
				yaxis.scale(y2).ticks(null, "s");
			}
			else {
				yaxis.scale(y2).tickFormat(function(e) {
					return y2.tickFormat(1, d3.format(",d"))(e);
				})
			}
		}

		d3.selectAll(".numArticle2").text(function() {
			let txtNumArticle2;
			if (language == "en") {
				if ((typeCasesSM == "numdeaths") || (typeCasesSM == "ratedeaths") || (typeCasesSM == "avgdeaths_last7")) {
					return "related to";
				}
				else if (typeCasesSM == "numrecover") {
					return "from";
				}
				else if ((typeCasesSM == "numtests") || (typeCasesSM == "ratetests")) {
					return "for";
				}
				else {
					return "of";
				}
				return txtNumArticle2;
			}
			else {
				if ((typeCasesSM == "numtests") || (typeCasesSM == "ratetests")) {
					txtNumArticle2 = "pour la";
				}
				else if ((typeCasesSM == "numdeaths") || (typeCasesSM == "ratedeaths") || (typeCasesSM == "avgdeaths_last7")) {
					txtNumArticle2 = "liés à la";
				}
				else {
					txtNumArticle2 = "de la";
				}
				return txtNumArticle2;
			}
		});

		var smallMultipleSVG = d3.select("#smallMultiple").selectAll("#smallMultiple svg");

		// define the line to be used
		smallMultipleSVG.selectAll(".line").each(function(d) {
			if (logSwitch == 1) {
				if (relativeSwitch == 1) {
					yLog.domain([Math.exp(0), d3.max(d, function(d) { if (d.values[0][typeCasesSM] == 0) { return Math.exp(0); } else { return d.values[0][typeCasesSM]; } })]);
				}
				else {
					yLog.domain([Math.exp(0), d3.max(timeData2, function(d) { return d3.max(d.values, function(d) { return d.values[0][typeCasesSM]; }) })]);
				}
			}
			else {
				if (relativeSwitch == 1) {
					y2.domain([0, d3.max(d, function(d) { return d.values[0][typeCasesSM]; })]);
				}
				else {
					y2.domain([0, d3.max(timeData2, function(d) { return d3.max(d.values, function(d) { return d.values[0][typeCasesSM]; }) })]);
				}
			}

			smallMultipleTrendline = d3.line()
				.defined(function(d) {
					if (d.values[0][typeCasesSM] != null) {
						return true;
					}
					else {
						return false;
					}
				})
				.x(function(d) {
					return x2(d.key);
				})
				.y(function(d) {
					if (!isNaN(d.values[0][typeCasesSM]) && d.values[0][typeCasesSM] != null) {
						if (logSwitch == 1) {
							if ((d.values[0][typeCasesSM] == 0) || (d.values[0][typeCasesSM] < 1)) {
								return yLog(Math.exp(0));
							}
							else {
								return yLog(d.values[0][typeCasesSM]);
							}
						}
						else {
							return y2(d.values[0][typeCasesSM]);
						}
					}
					else {
						return y2(0);
					}
				});


			//Transition the Y Axis
			d3.select(this.parentNode).select("#trendYSM")
				.transition()
				.duration(600)
				.call(yaxis);

			d3.select(this)
				.transition().duration(600)
				.attr("d", smallMultipleTrendline);


		})

		smallMultipleSVG.select(".yAxisSMLabel")
			.text(function() {
				if (language == "en") {
					return txtTypeModSM + " of " + txtTypeCasesSM.toLowerCase();
				}
				else {
					return txtTypeModSM + " de " + txtTypeCasesSM.toLowerCase();
				}
			})
	}

	var notesSymbols = ["*", "†", "¶", "§", "‡", "**", "††", "‡‡", "§§", "¶¶"];
	var numTxtTotalFormatted;
	var currentNoteNumber;
	var typeCasesExceptions;

	function generateTxtTotal(numTxtTotal, id, typeCases) {
		if (typeCases == "numtotal" || typeCases == "ratetotal") {
			typeCasesExceptions = "Notes Cases";
		}
		else if (typeCases == "numdeaths" || typeCases == "ratedeaths") {
			typeCasesExceptions = "Notes Deaths";
		}
		else if (typeCases == "numtests" || typeCases == "ratetests") {
			typeCasesExceptions = "Notes Tests";
		}
		else if (typeCases == "numrecover") {
			typeCasesExceptions = "Notes Recovered (Map only)";
		}
		else if (typeCases == "numactive" || typeCases == "rateactive") {
			typeCasesExceptions = "Notes Active (Map only)";
		}
		notesMap.forEach(function(d) {
			if (d.pruid == id) {
				currentNoteNumber = d.noteNumber;
			}
		})
		if (id != "98") {
			if (exceptions[id][0]["Notes Map"] != "" && exceptions[id][0][typeCasesExceptions] == "TRUE") {
				if (language == "en") {
					numTxtTotalFormatted = d3.format(",d")(numTxtTotal) + "<sup>" + notesSymbols[currentNoteNumber] + "</sup>";
				}
				else {
					numTxtTotalFormatted = (d3.format(",d")(numTxtTotal) + "<sup>" + notesSymbols[currentNoteNumber]).replace(",", " ") + "</sup>";
				}
				numberOfNotes++;
			}
			else {
				if (language == "en") {
					numTxtTotalFormatted = d3.format(",d")(numTxtTotal);
				}
				else {
					numTxtTotalFormatted = (d3.format(",d")(numTxtTotal)).replace(",", " ");
				}
			}
		}
		else {
			if (language == "en") {
				numTxtTotalFormatted = d3.format(",d")(numTxtTotal);
			}
			else {
				numTxtTotalFormatted = (d3.format(",d")(numTxtTotal)).replace(",", " ");
			}
		}
		return numTxtTotalFormatted;
	}

	var mapNotesDiv = d3.select("#mapNotes").selectAll(".mapNote");
	mapNotesDiv.data(notesMap)
		.enter()
		.append("p")
		.lower()
		.attr("class", "mapNote")
		.html(function(d) {
			if (language == "en") {
				return "<sup>" + notesSymbols[d.noteNumber] + "</sup>" + " " + exceptions[d.pruid][0]["Notes Map"];
			}
			else {
				return "<sup>" + notesSymbols[d.noteNumber] + "</sup>" + " " + exceptions[d.pruid][0]["Notes Carte"];
			}
		})

	var mapNotesDiv = d3.select(".dataTableNotes").selectAll(".mapTableNote");
	mapNotesDiv.data(notesMap)
		.enter()
		.append("p")
		.lower()
		.attr("class", "mapTableNote")
		.html(function(d) {
			if (language == "en") {
				return "<sup>" + notesSymbols[d.noteNumber + 3] + "</sup>" + " " + exceptions[d.pruid][0]["Notes Map"];
			}
			else {
				return "<sup>" + notesSymbols[d.noteNumber + 3] + "</sup>" + " " + exceptions[d.pruid][0]["Notes Carte"];
			}
		})
	timeData["98"] = timeDataISC["98"]
	timeData2.push(timeDataISC2[0]);
	createTable();

	function createTable() {
		d3.selectAll("#dataTable tbody tr").remove();

		var dataRow = d3.select("#dataTable tbody").selectAll("tr")
			.data(timeData2)
			.enter()
			.append("tr")
			.attr("class", function(d) {
				if (d.values[0].values[0].prname == "Canada") {
					return "CanadaMapRow";
				}
			});

		dataRow.append("td")
			.attr("class", "regionName tdTable")
			.text(function(d) {
				if (language == "en") {
					return d.values[0].values[0].prname;
				}
				else {
					return d.values[0].values[0].prnameFR;
				}
			});

		dataRow.append("td")
			.attr("class", "numtotal tdTable")
			.html(function(d) {
				if (timeData[d.key][currentDate]) {
					if(timeData[d.key][currentDate][0].numtotal == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Cases") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][currentDate][0].numtotal) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][currentDate][0].numtotal);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "ratetotal tdTable")
			.html(function(d, i) {
				if (timeData[d.key][currentDate]) {
					if(timeData[d.key][currentDate][0].ratetotal == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Cases") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][currentDate][0].ratetotal) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][currentDate][0].ratetotal);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "numtotal_last7 tdTable")
			.html(function(d) {
				if (timeData[d.key][currentDate]) {
					if(timeData[d.key][currentDate][0].numtotal_last7 == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Cases") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][currentDate][0].numtotal_last7) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][currentDate][0].numtotal_last7);
					}
				}
				else {
					return "0";
				}
			});


		dataRow.append("td")
			.attr("class", "ratetotal_last7 tdTable")
			.html(function(d) {
				if (timeData[d.key][currentDate]) {
					if(timeData[d.key][currentDate][0].ratetotal_last7 == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Cases") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][currentDate][0].ratetotal_last7) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][currentDate][0].ratetotal_last7);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "numactive tdTable")
			.html(function(d) {
				if (timeData[d.key][currentDate] && timeData[d.key][currentDate][0].numactive >= 0) {
					if(timeData[d.key][currentDate][0].numactive == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Active") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][currentDate][0].numactive) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][currentDate][0].numactive);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "rateactive tdTable")
			.html(function(d) {
				if (timeData[d.key][currentDate] && timeData[d.key][currentDate][0].rateactive >= 0) {
					if(timeData[d.key][currentDate][0].rateactive == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Active") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][currentDate][0].rateactive) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][currentDate][0].rateactive);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "numrecover tdTable")
			.html(function(d) {
				if (timeData[d.key][currentDate]) {
					if(timeData[d.key][currentDate][0].numrecover == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					// if (timeData[d.key][currentDate][0].numrecover == null || timeData[d.key][currentDate][0].numrecover == 0) {
					// 	if (d.key == "62")
					// 		return 0;
					// 	return d3.format(",d")(tempNums[d.key]) + "**";
					// }
					// tempNums[d.key] = timeData[d.key][currentDate][0].numrecover;

					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Recovered") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][currentDate][0].numrecover) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][currentDate][0].numrecover);
					}
				}
				else {
					if (d.key == "62")
						return 0;
					return tempNums[d.key] + "**";
				}
			});

		dataRow.append("td")
			.attr("class", "numdeaths tdTable")
			.html(function(d) {
				if (timeData[d.key][currentDate]) {
					if(timeData[d.key][currentDate][0].numdeaths == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Deaths") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][currentDate][0].numdeaths) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][currentDate][0].numdeaths);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "ratedeaths tdTable")
			.html(function(d) {
				if (timeData[d.key][currentDate]) {
					if(timeData[d.key][currentDate][0].ratedeaths == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Deaths") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][currentDate][0].ratedeaths) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][currentDate][0].ratedeaths);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "numdeaths_last7 tdTable")
			.html(function(d) {
				if (timeData[d.key][currentDate]) {
					if(timeData[d.key][currentDate][0].numdeaths_last7 == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Deaths") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][currentDate][0].numdeaths_last7) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][currentDate][0].numdeaths_last7);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "ratedeaths_last7 tdTable")
			.html(function(d) {
				if (timeData[d.key][currentDate]) {
					if(timeData[d.key][currentDate][0].ratedeaths_last7 == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Deaths") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][currentDate][0].ratedeaths_last7) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][currentDate][0].ratedeaths_last7);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "numTests tdTable")
			.html(function(d) {
				if (timeData[d.key][currentDate]) {
					if(timeData[d.key][currentDate][0].numtests == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Tests") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return "<span class='nowrap'>" + d3.format(",d")(timeData[d.key][currentDate][0].numtests) + "</span>" + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return "<span class='nowrap'>" + d3.format(",d")(timeData[d.key][currentDate][0].numtests) + "</span>";
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "rateTests tdTable")
			.html(function(d) {
				if (timeData[d.key][currentDate]) {
					if(timeData[d.key][currentDate][0].ratetests == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Tests") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return "<span class='nowrap'>" + d3.format(",d")(timeData[d.key][currentDate][0].ratetests) + "</span>" + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return "<span class='nowrap'>" + d3.format(",d")(timeData[d.key][currentDate][0].ratetests) + "</span>";
					}
				}
				else {
					return "0";
				}
			});


		//ISC row here
	}

	createTableIframe();

	function createTableIframe() {
		d3.selectAll("#dataTableIf tbody tr").each(function(d) {
			d3.select(this).remove();
		});

		var dataRow = d3.select("#dataTableIf tbody").selectAll("tr")
			.data(timeData2)
			.enter()
			.append("tr");

		dataRow.append("td")
			.attr("class", "regionName tdTable")
			.text(function(d) {
				if (language == "en") {
					return d.values[0].values[0].prname;
				}
				else {
					return d.values[0].values[0].prnameFR;
				}
			});

		var tableDate;
        dataRow.append("td")
            .attr("class", "numtotal tdTable")
            .html(function(d) {
                if(d.values[0].values[0].HRUID==98){
                    tableDate = currentDateISC;
                }else{
                    tableDate = currentDate;
                }
				if (timeData[d.key][tableDate]) {
					if(timeData[d.key][tableDate][0].numtotal == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Cases") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][tableDate][0].numtotal) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][tableDate][0].numtotal);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "ratetotal tdTable")
			.html(function(d, i) {
				if (timeData[d.key][tableDate]) {
					if(timeData[d.key][tableDate][0].ratetotal == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Cases") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][tableDate][0].ratetotal) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][tableDate][0].ratetotal);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "numtotal_last7 tdTable")
			.html(function(d) {
				if (timeData[d.key][tableDate]) {
					if(timeData[d.key][tableDate][0].numtotal_last7 == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Cases") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][tableDate][0].numtotal_last7) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][tableDate][0].numtotal_last7);
					}
				}
				else {
					return "0";
				}
			});


		dataRow.append("td")
			.attr("class", "ratetotal_last7 tdTable")
			.html(function(d) {
				if (timeData[d.key][tableDate]) {
					if(timeData[d.key][tableDate][0].ratetotal_last7 == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Cases") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][tableDate][0].ratetotal_last7) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][tableDate][0].ratetotal_last7);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "numactive tdTable")
			.html(function(d) {
				if (timeData[d.key][tableDate] && timeData[d.key][tableDate][0].numactive >= 0) {
					if(timeData[d.key][tableDate][0].numactive == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Active") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][tableDate][0].numactive) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][tableDate][0].numactive);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "rateactive tdTable")
			.html(function(d) {
				if (timeData[d.key][tableDate] && timeData[d.key][tableDate][0].rateactive >= 0) {
					if(timeData[d.key][tableDate][0].rateactive == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Active") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][tableDate][0].rateactive) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][tableDate][0].rateactive);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "numrecover tdTable")
			.html(function(d) {
				if (timeData[d.key][tableDate]) {
					if(timeData[d.key][tableDate][0].numrecover == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					// if (timeData[d.key][tableDate][0].numrecover == null || timeData[d.key][tableDate][0].numrecover == 0) {
					// 	if (d.key == "62")
					// 		return 0;
					// 	return d3.format(",d")(tempNums[d.key]) + "**";
					// }
					// tempNums[d.key] = timeData[d.key][tableDate][0].numrecover;

					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Recovered") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][tableDate][0].numrecover) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][tableDate][0].numrecover);
					}
				}
				else {
					if (d.key == "62")
						return 0;
					return tempNums[d.key] + "**";
				}
			});

		dataRow.append("td")
			.attr("class", "numdeaths tdTable")
			.html(function(d) {
				if (timeData[d.key][tableDate]) {
					if(timeData[d.key][tableDate][0].numdeaths == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Deaths") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][tableDate][0].numdeaths) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][tableDate][0].numdeaths);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "ratedeaths tdTable")
			.html(function(d) {
				if (timeData[d.key][tableDate]) {
					if(timeData[d.key][tableDate][0].ratedeaths == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Deaths") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][tableDate][0].ratedeaths) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][tableDate][0].ratedeaths);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "numdeaths_last7 tdTable")
			.html(function(d) {
				if (timeData[d.key][tableDate]) {
					if(timeData[d.key][tableDate][0].numdeaths_last7 == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Deaths") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][tableDate][0].numdeaths_last7) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][tableDate][0].numdeaths_last7);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "ratedeaths_last7 tdTable")
			.html(function(d) {
				if (timeData[d.key][tableDate]) {
					if(timeData[d.key][tableDate][0].ratedeaths_last7 == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}
					const noteMap = notesMap.filter(function(e) {
						return e.pruid == d.key
					})
					if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Deaths") > -1) {
						currentNoteNumber = noteMap[0].noteNumber;
						return d3.format(",d")(timeData[d.key][tableDate][0].ratedeaths_last7) + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
					}
					else {
						return d3.format(",d")(timeData[d.key][tableDate][0].ratedeaths_last7);
					}
				}
				else {
					return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "numTests tdTable")
			.html(function(d) {
				if (timeDataLab[d.key] && timeData[d.key][tableDate]) {
					if(timeData[d.key][tableDate][0].numtests == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}else{
						const noteMap = notesMap.filter(function(e) {
							return e.pruid == d.key
						})
						if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Tests") > -1) {
							currentNoteNumber = noteMap[0].noteNumber;
							return "<span class='nowrap'>" + d3.format(",d")(timeData[d.key][tableDate][0].numtests) + "</span>" + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
						}
						else {
							return "<span class='nowrap'>" + d3.format(",d")(timeData[d.key][tableDate][0].numtests) + "</span>";
						}
					}
				}
				else {
					if(language == "en")
						return "N/A"
					else
						return "s.o."
					// return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "avgTestsLast7 tdTable")
			.html(function(d) {
				if (timeDataLab[d.key] && timeDataLab[d.key][currentDateLab]) {
					if(timeDataLab[d.key][currentDateLab][0].avgtests_last7 == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}else{
						const noteMap = notesMap.filter(function(e) {
							return e.pruid == d.key
						})
						if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Tests") > -1) {
							currentNoteNumber = noteMap[0].noteNumber;
							return "<span class='nowrap'>" + d3.format(",d")(timeDataLab[d.key][currentDateLab][0].avgtests_last7) + "</span>" + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
						}
						else {
							return "<span class='nowrap'>" + d3.format(",d")(timeDataLab[d.key][currentDateLab][0].avgtests_last7) + "</span>";
						}
					}
				}
				else {
					if(language == "en")
						return "N/A"
					else
						return "s.o."
					// return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "avgRateTestsLast7 tdTable")
			.html(function(d) {
				if (timeDataLab[d.key] && timeDataLab[d.key][currentDateLab]) {
					if(timeDataLab[d.key][currentDateLab][0].avgratetests_last7 == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}else{
						const noteMap = notesMap.filter(function(e) {
							return e.pruid == d.key
						})
						if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Tests") > -1) {
							currentNoteNumber = noteMap[0].noteNumber;
							return "<span class='nowrap'>" + d3.format(",d")(timeDataLab[d.key][currentDateLab][0].avgratetests_last7) + "</span>" + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
						}
						else {
							return "<span class='nowrap'>" + d3.format(",d")(timeDataLab[d.key][currentDateLab][0].avgratetests_last7) + "</span>";
						}
					}
				}
				else {
					if(language == "en")
						return "N/A"
					else
						return "s.o."
					// return "0";
				}
			});

		dataRow.append("td")
			.attr("class", "positivityLast7 tdTable")
			.html(function(d) {
				if (timeDataLab[d.key] && timeDataLab[d.key][currentDateLab]) {
					if(timeDataLab[d.key][currentDateLab][0].avgpositivity_last7 == null){
						if(language == "en")
							return "N/A"
						else
							return "s.o."
					}else{
						const noteMap = notesMap.filter(function(e) {
							return e.pruid == d.key
						})
						let percentSign = "";
						if(language == "en"){ 
							percentSign = "%";
						}else{
							percentSign = " %";
						}
						if (noteMap.length > 0 && noteMap[0].typesOfNotes.indexOf("Tests") > -1) {
							currentNoteNumber = noteMap[0].noteNumber;
							return "<span class='nowrap'>" + d3.format(".1f")(timeDataLab[d.key][currentDateLab][0].avgpositivity_last7) + percentSign + "</span>" + "<sup>" + notesSymbols[currentNoteNumber + 3] + "</sup>";
						}
						else {
							return "<span class='nowrap'>" + d3.format(".1f")(timeDataLab[d.key][currentDateLab][0].avgpositivity_last7) + percentSign + "</span>";
						}
					}
				}
				else {
					if(language == "en")
						return "N/A"
					else
						return "s.o."
					// return "0";
				}
			});
	}

	function drawSmallMultipleTrends(logSwitch, relativeSwitch) {
		txtTypeCasesSM = $('#dropdownType6 option:selected').text();
		txtTypeModSM = $('#dropdownType5 option:selected').text();
		typeCasesSM = $('#dropdownType5').val() + $('#dropdownType6').val();
		// define the line to be used
		var smallMultipleTrendline = d3.line()
			.defined(function(d) {
				if (d.values[0][typeCasesSM] != null) {
					return true;
				}
				else {
					return false;
				}
			})
			.x(function(d) { return x2(d.key); })
			.y(function(d) {
				return y2(d.values[0][typeCasesSM]);
			});

		timeData2.forEach(function(d) {
			smallMultipleData.push(d.values);
		});

		var smallMultipleSVG = d3.select("#smallMultiple").selectAll("#smallMultiple svg")
			.data(timeData2)
			.enter()
			.append('div')
			.attr("class", "col-xs-12 col-md-6 col-lg-4 col-print-4")
			.style("padding", 0)
			//.style("flex", "1 1 30%")
			.append("svg")
			.attr("width", "100%")
			.attr('height', function(d) {
				if (isIE) {
					return '400px';
				}
				else {}
			})
			.attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox", "0 0 345 360")
			.append("g")
			.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")")

		smallMultipleSVG.append("path")
			.data(smallMultipleData)
			.attr("class", "line")
			.attr("stroke", "rgb(8, 81, 156)")
			.transition().duration(600)
			.attr("d", smallMultipleTrendline);

		// Add the X Axis
		smallMultipleSVG.append("g")
			.attr("id", "trendXSM")
			.attr("transform", "translate(0," + height2 + ")")
			.call(d3.axisBottom(x2).tickFormat(d3.timeFormat("%d %b '%y")))
			.selectAll("text")
			.attr("y", 12)
			.attr("x", -21)
			.attr("dy", ".35em")
			.attr("transform", "rotate(-45)");

		// Add the Y Axis
		if (logSwitch == 0) {
			smallMultipleSVG.append("g")
				.attr("id", "trendYSM")
				.transition()
				.duration(600)
				.call(d3.axisLeft(y2));
		}
		else {
			smallMultipleSVG.append("g")
				.attr("id", "trendYSM")
				.transition()
				.duration(600)
				.call(d3.axisLeft(yLog));
		}

		smallMultipleSVG.append("text")
			.attr("class", "titleSMLabel")
			.attr("transform", "translate(" + width2 / 2 + "," + (-10) + ")")
			.attr("font-size", "16px")
			.attr("text-anchor", "middle")
			.attr("font-weight", "bold")
			.text(function(d) {
				if (language == "en") {
					return d.values[0].values[0].prname;
				}
				else {
					return d.values[0].values[0].prnameFR;
				}
			})

		smallMultipleSVG.append("text")
			.attr("class", "xAxisSMLabel")
			.attr("transform", "translate(" + width2 / 2 + "," + (height2 + 60) + ")")
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

		smallMultipleSVG.append("text")
			.attr("class", "yAxisSMLabel")
			.attr("transform", "translate(-45," + (height2 / 2) + ")rotate(-90)")
			.attr("font-size", "14px")
			.attr("text-anchor", "middle")
			.text(function() {
				if (language == "en") {
					return txtTypeModSM + " of " + txtTypeCasesSM.toLowerCase();
				}
				else {
					return txtTypeModSM + " de " + txtTypeCasesSM.toLowerCase();
				}
			})
	}

	function findMostRecentDataByDateType(date, type, place) {
		let indexDate = 1;
		let tempDate = date;
		let startPoint = datesArray.indexOf(date)

		while (isNaN(timeData[place][tempDate][0]["numrecover"]) || indexDate > datesArray.length) {
			tempDate = datesArray[startPoint - indexDate];
			indexDate += 1;
		}

		return timeData[1][tempDate][0][typeCases];
	}

	function wrap(text, width) {
		text.each(function() {
			const text = d3.select(this);
			let words = text.text().split(/\s+/).reverse();
			let word;
			let line = [];
			let lineNumber = 0;
			let lineHeight = 1.1;
			//this means the element needs an x and y value
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

	function isInteger(num) {
		return (num ^ 0) === num;
	}

	// })

}

// });

$(document).ready(function() {
	$("[data-figure=1]").on("click", function() {

		let stat = $(this).data("type-stat");
		let measure = $(this).data("type-measure");

		$("#dropdownType3").val(stat).change()
		$("#dropdownType1").val(measure).change()

		window.history.replaceState(null, null, window.location.origin + window.location.pathname + '?stat=' + $("#dropdownType3").val() + "&measure=" + $("#dropdownType1").val() + "&map=" + $("#dropdownType4").val() + "#a2");
	})
})