//Load Data
var csvfiles = [
	'/src/data/covidLive/covid19-updateTime.csv', //0
	'/src/data/covidLive/covid19.csv', //1 
	'/src/data/covidLive/covid19-epiSummary-exceptions.csv', //2
	'/src/data/covidLive/covid19-isc.csv', //3
	'/src/data/covidLive/covid19-epiSummary-labIndicators.csv', //4
  '/src/data/covidLive/covid19-epiSummary-NML.csv', //5
  '/src/data/covidLive/covid19-epiSummary-statements.csv', //6
  '/src/data/covidLive/covid19-epiSummary-agegroups2.csv', //7
  '/src/data/covidLive/covid19-nTotal.csv', //8
  '/src/data/covidLive/covid19-epiSummary-exposureByPT.csv', //9
  '/src/data/covidLive/covid19-epiSummary-severityUpdate.csv', //10
  '/src/data/covidLive/covid19-epiSummary-hospVentICU.csv', //11
  '/src/data/covidLive/covid19-epiSummary-severity.csv', //12
  '/src/data/covidLive/covid19-epiSummary-symptoms.csv', //13
  '/src/data/covidLive/covid19-epiSummary-voc.csv', //14
  '/src/data/covidLive/covid19-epiSummary-casesovertime.csv', //15
  '/src/data/covidLive/covid19-epiSummary-probableexposure2.csv', //16
  '/src/data/covidLive/covid19-epiSummary-epiCurveByAge.csv' //17
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

// if(document.getElementById("covid19TableContent") == true)


function loadCSV (epiSummary,outBreak){
  
  Promise.all(promises).then(function(files){
    fetchUpdateTime(files[0])
  //   processDataMap(values[0].value, values[1].value, values[2].value, values[3].value, values[4].value);
	 // buildMap(values[18].value);
	 // processDataEpiSummary(values[0].value, values[1].value, values[2].value, values[5].value, values[6].value, values[7].value, values[8].value, values[9].value, values[10].value, values[11].value, values[12].value, values[13].value, values[14].value, values[4].value);
	 // processDate(values[0].value);
  //   epiSummaryCasesOverTime(values[0].value, values[1].value, values[8].value, values[15].value, values[16].value);
  //   exposureHistoryAge(values[17].value);
  });
  
  
  if(epiSummary){
    //do a ting
  }
  
  if(outBreak){
    //do a ting
  }
  return 0;
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Promise.allSettled(promises)
  .then(function(values) {
    // console.log("values[0]: ",values[0].value);
    // console.log("values[1]: ",values[1].value);
    // console.log("values[2]: ",values[2].value);
    // console.log("values[3]: ",values[3].value);
    // console.log("values[4]: ",values[4].value);
    // console.log("values[5]: ",values[5].value);
    // console.log("values[6]: ",values[6].value);
    // console.log("values[7]: ",values[7].value);
    // console.log("values[8]: ",values[8].value);
    // console.log("values[9]: ",values[9].value);
    // console.log("values[10]: ",values[10].value);
    // console.log("values[11]: ",values[11].value);
    // console.log("values[12]: ",values[12].value);
    // console.log("values[13]: ",values[13].value);
    // console.log("values[14]: ",values[14].value);
    // console.log("values[15]: ",values[15].value);
    // console.log("values[16]: ",values[16].value);
    // console.log("values[17]: ",values[17].value);
    // console.log("values[17]: ",values[17].value);
    // console.log("values[18]: ",values[18].value);
    
	  processDataMap(values[0].value, values[1].value, values[2].value, values[3].value, values[4].value);
	  buildMap(values[18].value);
	  processDataEpiSummary(values[0].value, values[1].value, values[2].value, values[5].value, values[6].value, values[7].value, values[8].value, values[9].value, values[10].value, values[11].value, values[12].value, values[13].value, values[14].value, values[4].value);
	  processDate(values[0].value);
    epiSummaryCasesOverTime(values[0].value, values[1].value, values[8].value, values[15].value, values[16].value);
    exposureHistoryAge(values[17].value);
    // return values;
})
// .then(function(values) {
  
// });
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var updateTime;
function fetchUpdateTime(val){
  updateTime = val.columns[0];
  return 0;
}


	
// var , data, dataExceptions, dataISC, labIndicators, exceptions;

function processCovid19 (data){
  var datesArray = [];
	var dataTime = data.filter(function(d) { return d.pruid != "99"; })
	var timeData = d3.nest()
		.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
		.key(function(d) { if (datesArray.indexOf(d.date) < 0) { datesArray.push(d.date); } return d.date; }).sortKeys(d3.ascending)
		.object(dataTime);
  return 0;
}

var dataExceptions
var numberOfNotes = 0;
var notesMap      = [];
var typesOfNotes  = [];
function processCovid19Exceptions (dataExceptions){
	dataExceptions.forEach(function(d, i) {
		var typesOfNotes = [];
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

  return 0;
}
// function processDataMap(dateField_xx, data, dataExceptions, dataISC, labIndicators) {

// 	var timeData2SortOrder = ["1", "59", "48", "47", "46", "35", "24", "10", "13", "12", "11", "60", "61", "62", "98", "99"];
	
// 	dataExceptions.forEach(function(d, i) {
// 		typesOfNotes = [];
// 		if (d["Notes Map"] != "" && d["Notes Map"] != undefined) {
// 			for (var prop in d) {
// 				if (((prop == "Notes Cases") || (prop == "Notes Deaths") || (prop == "Notes Tests") || (prop == "Notes Recovered (Map only)") || (prop == "Notes Active (Map only)")) && d[prop] == "TRUE") {
// 					if (prop == "Notes Cases") {
// 						typesOfNotes.push("Cases");
// 					}
// 					else if (prop == "Notes Deaths") {
// 						typesOfNotes.push("Deaths")
// 					}
// 					else if (prop == "Notes Tests") {
// 						typesOfNotes.push("Tests")
// 					}
// 					else if (prop == "Notes Recovered (Map only)") {
// 						typesOfNotes.push("Recovered")
// 					}
// 					else if (prop == "Notes Active (Map only)") {
// 						typesOfNotes.push("Active")
// 					}
// 				}
// 			}
// 			notesMap.push({ pruid: d.PRUID, noteNumber: numberOfNotes, typesOfNotes: typesOfNotes });
// 			numberOfNotes++;
// 		}
// 	})

// 	exceptions = d3.nest()
// 		.key(function(d) { return d.PRUID; })
// 		.object(dataExceptions);
// 	// var exceptions = dataExceptions;

// 	datesArray = [];
// 	var dataTime = data.filter(function(d) { return d.pruid != "99"; })
// 	timeData = d3.nest()
// 		.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
// 		.key(function(d) { if (datesArray.indexOf(d.date) < 0) { datesArray.push(d.date); } return d.date; }).sortKeys(d3.ascending)
// 		.object(dataTime);

// 	datesArrayTests = [];
// 	// format the data
// 	labIndicators.forEach(function(d){
// 		d.date = formatTimeReverse(parseTimeReverse(d.date));
// 		if (datesArrayTests.indexOf(d.date) < 0) { datesArrayTests.push(d.date); }
// 		if (d.avgtests_last7 == "") {
// 			d.avgtests_last7 = null;
// 		}
// 		else {
// 			d.avgtests_last7 = +d.avgtests_last7;
// 		}
// 		if (d.avgratetests_last7 == "") {
// 			d.avgratetests_last7 = null;
// 		}
// 		else {
// 			d.avgratetests_last7 = +d.avgratetests_last7;
// 		}
// 		if (d.avgpositivity_last7 == "") {
// 			d.avgpositivity_last7 = null;
// 		}
// 		else {
// 			d.avgpositivity_last7 = +d.avgpositivity_last7;
// 		}
			
// 	})
// /* 	const headers = [...new Set(data.columns.concat(labIndicators.columns))].filter(function(d) {
// 	  return d !== "date"
// 	}); */
// 		const headers = ["pruid", "prname", "prnameFR", "update", "numconf", "numprob", "numdeaths", "numtotal", "numtested", "numtests", "numrecover", "percentrecover", "ratetested", "ratetests", "numtoday", "percentoday", "ratetotal", "ratedeaths", "numdeathstoday", "percentdeath", "numtestedtoday", "numteststoday", "numrecoveredtoday", "percentactive", "numactive", "rateactive", "numtotal_last14", "ratetotal_last14", "numdeaths_last14", "ratedeaths_last14", "numtotal_last7", "ratetotal_last7", "numdeaths_last7", "ratedeaths_last7", "avgtotal_last7", "avgincidence_last7", "avgdeaths_last7", "avgratedeaths_last7", "avgtests_last7", "avgratetests_last7", "avgpositivity_last7"];
// 	const mergedData = [];

// 	data.concat(labIndicators).forEach(function(row) {
// 	  const foundObject = mergedData.find(function(d) {
// 	    return d.date === row.date && d.pruid === row.pruid;
// 	  });
// 	  if (foundObject) {
// 	    headers.forEach(function(d) {
// 	      if (row[d]) foundObject[d] = row[d];
// 	    });
// 	  } else {
// 	    headers.forEach(function(d) {
// 	      if (!row[d]) row[d] = "";
// 	    });
// 	    mergedData.push(row)
// 	  };
// 	});
		
// 	data = mergedData;	

// 	//Set current date to default (latest data)
// 	if (typeCases == "numtoday") {
// 		currentDate = datesArray[datesArray.length - 2];
// 	} else if(typeCases == "numtests" || typeCases == "avgtests_last7" || typeCases == "avgratetests_last7" || typeCases == "avgpositivity_last7") {
// 		currentDate = datesArrayTests[datesArrayTests.length - 1];
// 	} else {
// 		currentDate = datesArray[datesArray.length - 1];
// 	}
	
// 	currentDateLab = datesArrayTests[datesArrayTests.length - 1];
	
//     if(language == "en"){
// 		var formatTime = d3.timeFormat("%B %-d, %Y, %-I %p EST");
// 		var parseTime3 = d3.timeParse("%Y-%m-%d %H:%M");
// 		var parseTime2 = d3.timeParse("%d-%m-%Y %H:%M");
// 		$(".updateTime").text(formatTime(parseTime3(dateField["columns"][0])).replace("PM", "pm").replace("AM", "am"));
// 		$(".updateTime2").text(formatTime(parseTime3(dateField["columns"][0])).replace("PM", "pm").replace("AM", "am"));
// 		if(typeCases == "numtests" || typeCases == "avgtests_last7" || typeCases == "avgratetests_last7" || typeCases == "avgpositivity_last7") {
// 			$(".updateTime").text(formatTime(parseTime2(datesArrayTests[datesArrayTests.length - 1]+" 17:00")).replace("PM", "pm").replace("AM", "am"));
// 		}
// 		if(typeCasesSM == "numtests" || typeCasesSM == "avgtests_last7" || typeCasesSM == "avgratetests_last7" || typeCasesSM == "avgpositivity_last7") {
// 			$(".updateTime2").text(formatTime(parseTime2(datesArrayTests[datesArrayTests.length - 1]+" 17:00")));
// 		}
//         // d3.select("#updateTime").text(dateField["columns"][0]);
//     }else{
// 	    var formatTime = d3.timeFormat("%-d %B %Y, %-H h HNE");
// 		var parseTime3 = d3.timeParse("%Y-%m-%d %H:%M");
// 		var parseTime2 = d3.timeParse("%d-%m-%Y %H:%M");
// 		$(".updateTime").text(formatTime(parseTime3(dateField["columns"][0])));
// 		$(".updateTime2").text(formatTime(parseTime3(dateField["columns"][0])));
// 		if(typeCases == "numtests" || typeCases == "avgtests_last7" || typeCases == "avgratetests_last7" || typeCases == "avgpositivity_last7") {
// 			$(".updateTime").text(formatTime(parseTime2(datesArrayTests[datesArrayTests.length - 1]+" 17:00")));
// 		}
// 		if(typeCasesSM == "numtests" || typeCasesSM == "avgtests_last7" || typeCasesSM == "avgratetests_last7" || typeCasesSM == "avgpositivity_last7") {
// 			$(".updateTime2").text(formatTime(parseTime2(datesArrayTests[datesArrayTests.length - 1]+" 17:00")));
// 		}
//         // d3.select("#updateTime").text(dateField["columns"][0].replace(":"," h "));
//     }
	
// 	/* 	var timeData2 = d3.nest()
// 			.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
// 			.key(function(d) { return +parseTime(d.date); }).sortKeys(d3.ascending)
// 			.entries(data); */

// 	timeData2 = d3.nest()
// 		.key(function(d) { return d.pruid; }).sortKeys(function(a, b) {
// 			return timeData2SortOrder.indexOf(a) - timeData2SortOrder.indexOf(b);
// 		}).key(function(d) { return +parseTime(d.date); }).sortKeys(d3.ascending)
// 		.entries(dataTime);


// 	d3.selectAll(".txtCurrentDate").text(function() {
// 		let timeValue;
// 		if (language == "en") {
// 			timeValue = d3.timeFormat("%B")(parseTime(currentDate)) + " " + d3.timeFormat("%e")(parseTime(currentDate)) + ", " + d3.timeFormat("%Y")(parseTime(currentDate)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
// 		}
// 		else {
// 			timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
// 		}
// 		d3.select("#descText2").text(timeValue);
// 		return timeValue;
// 	})

// 	d3.selectAll(".numArticle").text(function() {
// 		let txtNumArticle;
// 		if (language == "en") {
// 			if ((typeCases == "numdeaths") || (typeCases == "ratedeaths") || (typeCases == "numdeaths_last7") || (typeCases == "ratedeaths_last7") || (typeCases == "numdeaths_last14") || (typeCases == "ratedeaths_last14")) {
// 				return "related to";
// 			}
// 			// else if (typeCases == "numrecover") {
// 			// 	return "from";
// 			// }
// 			else if ((typeCases == "numtests") || (typeCases == "ratetests")) {
// 				return "for";
// 			}
// 			else {
// 				return "of";
// 			}
// 			return txtNumArticle;
// 		}
// 		else {
// 			if ((typeCases == "numtests") || (typeCases == "ratetests")) {
// 				txtNumArticle = "pour la";
// 			}
// 			else if ((typeCases == "numdeaths") || (typeCases == "ratedeaths") || (typeCases == "numdeaths_last7") || (typeCases == "ratedeaths_last7") || (typeCases == "numdeaths_last14") || (typeCases == "ratedeaths_last14")) {
// 				txtNumArticle = "liés à la";
// 			}
// 			else {
// 				txtNumArticle = "de la";
// 			}
// 			return txtNumArticle;
// 		}
// 	});


// 	d3.selectAll(".numArticle2").text(function() {
// 		if (language == "en") {
// 			if ((typeCasesSM == "numdeaths") || (typeCasesSM == "ratedeaths") || (typeCasesSM == "avgdeaths_last7") || (typeCases == "numdeaths_last7") || (typeCases == "ratedeaths_last7") || (typeCases == "numdeaths_last14") || (typeCases == "ratedeaths_last14")) {
// 				return "related to";
// 			}
// 			// else if (typeCasesSM == "numrecover") {
// 			// 	return "from";
// 			// }
// 			else if ((typeCasesSM == "numtests") || (typeCasesSM == "ratetests")) {
// 				return "for";
// 			}
// 			else {
// 				return "of";
// 			}
// 		}
// 		else {
// 			if ((typeCasesSM == "numtests") || (typeCasesSM == "ratetests")) {
// 				return "pour la";
// 			}
// 			else if ((typeCasesSM == "numdeaths") || (typeCasesSM == "ratedeaths") || (typeCasesSM == "avgdeaths_last7") || (typeCases == "numdeaths_last7") || (typeCases == "ratedeaths_last7") || (typeCases == "numdeaths_last14") || (typeCases == "ratedeaths_last14")) {
// 				return "liés à la";
// 			}
// 			else {
// 				return "de la";
// 			}
// 		}
// 	});
	
// 	data.forEach(function(d) {
// 		d.numconf = +d.numconf;
// 		d.numprob = +d.numprob;
// 		d.numtotal = +d.numtotal;
// 		d.numdeaths = +d.numdeaths;
// 		d.numtests = +d.numtests;
// 		d.deathstoday = +d.deathstoday;
// 		if (d.numrecover == "") {
// 			d.numrecover = null;
// 		}
// 		else {
// 			d.numrecover = +d.numrecover;
// 		}
// 		d.numactive = +d.numactive;
// 		d.numtoday = +d.numtoday;
// 		d.rateactive = +d.rateactive;
// 		d.ratetotal = +d.ratetotal;
// 		d.ratetests = +d.ratetests;
// 		d.percentrecover = +d.percentrecover;
// 		d.percentactive = +d.percentactive;
// 		d.ratedeaths = +d.ratedeaths;
// 		// d.percentoday = +d.percentoday;
// 		d.HRUID = +d.pruid;
// 		d.trend = timeData[+d.pruid];
// 		d.numtotal_last7 = +d.numtotal_last7;
// 		d.numtotal_last14 = +d.numtotal_last14;
// 		d.ratetotal_last7 = +d.ratetotal_last7;
// 		d.ratetotal_last14 = +d.ratetotal_last14;
// 		d.numdeaths_last7 = +d.numdeaths_last7;
// 		d.numdeaths_last14 = +d.numdeaths_last14;
// 		d.ratedeaths_last7 = +d.ratedeaths_last7;
// 		d.ratedeaths_last14 = +d.ratedeaths_last14;
// 		d.avgtotal_last7 = +d.avgtotal_last7;
// 		d.avgincidence_last7 = +d.avgincidence_last7;
// 		d.avgdeaths_last7 = +d.avgdeaths_last7;
// 		if (d.avgtests_last7 == "") {
// 			d.avgtests_last7 = null;
// 		}
// 		else {
// 			d.avgtests_last7 = +d.avgtests_last7;
// 		}
// 		if (d.avgratetests_last7 == "") {
// 			d.avgratetests_last7 = null;
// 		}
// 		else {
// 			d.avgratetests_last7 = +d.avgratetests_last7;
// 		}
// 		if (d.avgpositivity_last7 == "") {
// 			d.avgpositivity_last7 = null;
// 		}
// 		else {
// 			d.avgpositivity_last7 = +d.avgpositivity_last7;
// 		}
// 	});

// 	nestedData = d3.nest()
// 		.key(function(d) { return d.pruid; })
// 		.object(data);

// 	let dataISCNumberColumns = ["numconf", "numprob", "numtotal", "numdeaths", "numtests", "deathstoday", 
// 	"numrecover", "numactive", "numtoday", "rateactive", "ratetotal", "ratetests", "percentrecover", "percentactive", "ratedeaths", "numtotal_last7", 
// 	"numtotal_last14", "ratetotal_last7", "ratetotal_last14", "numdeaths_last7", "numdeaths_last14", "ratedeaths_last7", "ratedeaths_last14", "avgtotal_last7", "avgincidence_last7", "avgdeaths_last7"];
// 	dataISC.forEach(function(d) {
// 		// %d-%m-%Y
// 		d.date = d3.timeFormat("%d-%m-%Y")(parseTimeISC(d.date));
// 		dataISCNumberColumns.forEach(function(col, i){
// 			if(d[col] == ""){
// 				d[col] = null;
// 			}
// 			else{
// 				d[col] = +d[col]
// 			}
// 		})
		
// 		d.HRUID = +d.pruid;
// 		d.trend = timeData[+d.pruid]
// 	});

// 	datesArrayISC = [];
// 	timeDataISC = d3.nest()
// 		.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
// 		.key(function(d) { if (datesArrayISC.indexOf(d.date) < 0) { datesArrayISC.push(d.date); } return d.date; }).sortKeys(d3.ascending)
// 		.object(dataISC);

// 	currentDateISC = datesArrayISC[datesArrayISC.length - 1];

// 	timeDataISC2 = d3.nest()
// 		.key(function(d) { return d.pruid; }).sortKeys(function(a, b) {
// 			return timeData2SortOrder.indexOf(a) - timeData2SortOrder.indexOf(b);
// 		}).key(function(d) { return +parseTime(d.date); }).sortKeys(d3.ascending)
// 		.entries(dataISC);

// 	nestedDataISC = d3.nest()
// 		.key(function(d) { return d.pruid; })
// 		.object(dataISC);
	
// 	timeDataLab = d3.nest()
// 		.key(function(d) { return d.pruid; }).sortKeys(function(a, b) {
// 			return timeData2SortOrder.indexOf(a) - timeData2SortOrder.indexOf(b);
// 		}).key(function(d) { return d.date; }).sortKeys(d3.ascending)
// 		.object(labIndicators);
	
// 	timeDataLab2 = d3.nest()
// 		.key(function(d) { return d.pruid; }).sortKeys(function(a, b) {
// 			return timeData2SortOrder.indexOf(a) - timeData2SortOrder.indexOf(b);
// 		}).key(function(d) { return +parseTime(d.date); }).sortKeys(d3.ascending)
// 		.entries(labIndicators);

// }
