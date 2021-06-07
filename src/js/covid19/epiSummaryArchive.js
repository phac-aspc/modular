var language = $('html').attr('lang');
var parseTimeEpiSummary = d3.timeParse("%Y-%m-%d");
var locale;
var formatFR;
var localeFormatter;
var numberFormat;
var N0;

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

if (language == "en") {
    numberFormat = d3.format(",d");
}
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
    localeFormatter = d3.formatDefaultLocale(locale);
    numberFormat = localeFormatter.format(",d");
}



//Load Data
var csvfiles = [
    '/src/data/covidLive/covid19-updateTime.csv', //0
    '/src/data/covidLive/covid19.csv', //1 
    '/src/data/covidLive/covid19-epiSummary-exceptions.csv', //2
    '/src/data/covidLive/covid19-epiSummary-NML.csv', //3
    '/src/data/covidLive/covid19-epiSummary-statements.csv', //4
    '/src/data/covidLive/covid19-epiSummary-agegroups2.csv', //5
    '/src/data/covidLive/covid19-nTotal.csv', //6
    '/src/data/covidLive/covid19-epiSummary-exposureByPT.csv', //7
    '/src/data/covidLive/covid19-epiSummary-severityUpdate.csv', //8
    '/src/data/covidLive/covid19-epiSummary-hospVentICU.csv', //9
    '/src/data/covidLive/covid19-epiSummary-severity.csv', //10
    '/src/data/covidLive/covid19-epiSummary-symptoms.csv', //11
    '/src/data/covidLive/covid19-epiSummary-voc.csv', //12
    '/src/data/covidLive/covid19-epiSummary-labIndicators.csv' //13
]
var promises = [];
csvfiles.forEach(function(url) {
    promises.push(d3.csv(url))
});
Promise.all(promises).then(function(values) {
    processDataEpiSummary(values[0], values[1], values[2], values[3], values[4], values[5], values[6], values[7], values[8], values[9], values[10], values[11], values[12], values[13]);
}).then(function() {
    nationalNumbers();
    epiSummaryStatements();
    epiSummarySymptoms();
    demographics();
    probableExposure();
    HospitalizationUpdate();
    HospVentICU();
    epiSummarySeverity();
    epiSummaryVOC();
});

var dateField, data, dataExceptions, NML, dataStatements, dataAgeGroups, nTotal, dataExposureByPT, dataHospSeverity, dataHospVentICU, dataSeverity, dataSymptoms, dataVOC, dataVOCByDate, labIndicators;

function processDataEpiSummary(dateFieldInt, dataInt, dataExceptionsInt, NMLInt, dataStatementsInt, dataAgeGroupsInt, nTotalInt, dataExposureByPTInt, dataHospSeverityInt, dataHospVentICUInt, dataSeverityInt, dataSymptomsInt, dataVOCInt, labIndicatorsInt) {
    dateField = dateFieldInt;
    data = dataInt;
    dataExceptions = dataExceptionsInt;
    NML = NMLInt;
    dataStatements = dataStatementsInt;
    dataAgeGroups = dataAgeGroupsInt;
    nTotal = nTotalInt;
    dataExposureByPT = dataExposureByPTInt;
    dataHospSeverity = dataHospSeverityInt;
    dataHospVentICU = dataHospVentICUInt;
    dataSeverity = dataSeverityInt;
    dataSymptoms = dataSymptomsInt;
    labIndicators = labIndicatorsInt;

    dataVOC = d3.nest().key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
        .entries(dataVOCInt);

    dataVOCByDate = d3.nest()
        .key(function(d) {
            return d.report_date;
        }).sortKeys(d3.ascending)
        .key(function(d) {
            return d.pruid;
        })//.sortKeys(d3.ascending)
        .entries(dataVOCInt);
    //txtCurrentDateProv = dateField
    if (language == "en") {
        d3.selectAll(".txtCurrentDateProv").text(dateField["columns"][0]);
    }
    else {
        d3.selectAll(".txtCurrentDateProv").text(formatFR(dateField["columns"][0]));
    }

    d3.select("#figure3-dropdown").on("change", function(d) {
        //)
        let selected = d3.select(this).node().value;

        if (selected == "gender") {
            $("#graphHospital").fadeOut(300, function() {
                $("#graphHospitalBySex").fadeIn();
            })
        }
        else {
            $("#graphHospitalBySex").fadeOut(300, function() {
                $("#graphHospital").fadeIn();
            })
        }
    })
    
    var parseTimeReverse = d3.timeParse("%Y-%m-%d");
    var formatTimeReverse = d3.timeFormat("%d-%m-%Y");
    
	labIndicators.forEach(function(d){
		d.date = formatTimeReverse(parseTimeReverse(d.date));
		d.avgtests_last7 = +d.avgtests_last7;
		d.avgratetests_last7 = +d.avgratetests_last7;
		d.avgpositivity_last7 = +d.avgpositivity_last7;
	})
	const headers = [...new Set(data.columns.concat(labIndicators.columns))].filter(function(d) {
	  return d !== "date"
	});
	const mergedData = [];

	data.concat(labIndicators).forEach(function(row) {
	  const foundObject = mergedData.find(function(d) {
	    return d.date === row.date && d.pruid === row.pruid;
	  });
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
}


function nationalNumbers() {
    var datesArray = [];
    var timeData = d3.nest()
        .key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
        .key(function(d) { if (datesArray.indexOf(d.date) < 0) { datesArray.push(d.date); } return d.date; }).sortKeys(d3.ascending)
        .object(data);

    let typeCases = "numtoday";
    let currentDate;
    //Set current date to default (latest data)
    if (typeCases == "numtoday") {
        currentDate = datesArray[datesArray.length - 2];
    }
    else {
        currentDate = datesArray[datesArray.length - 1];
    }


    var parseTime = d3.timeParse("%d-%m-%Y");

    var locale;
    var formatFR;
    if (language == "en") {
        numberFormat = d3.format(",d");
    }
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

    var timeData = d3.nest()
        .key(function(d) { return +parseTime(d.date); }).sortKeys(d3.descending)
        .key(function(d) { return d.pruid; })
        .entries(data.filter(function(d) { return d.pruid != 1 && d.pruid != 99 }));

    var timeDataCanada = d3.nest()
        .key(function(d) { return +parseTime(d.date); }).sortKeys(d3.descending)
        .key(function(d) { return d.pruid; })
        .entries(data.filter(function(d) { return d.pruid == 1 }));


    // format the data
    data.forEach(function(d) {
        d.numactive = +d.numactive;
        d.numconf = +d.numconf;
        d.numprob = +d.numprob;
        d.numtotal = +d.numtotal;
        d.numdeaths = +d.numdeaths;
        d.numtests = +d.numtests;
        d.numrecover = +d.numrecover;
        d.numtoday = +d.numtoday;
        /* d.testedtoday = +d.testedtoday;
        d.deathstoday = +d.deathstoday; */
        d.numteststoday = +d.numteststoday;
        d.numdeathstoday = +d.numdeathstoday;
        // d.percentoday = +d.percentoday;
        d.HR = +d.pruid;
        d.trend = timeData[+d.pruid];
    });

    var nestedData = d3.nest()
        .key(function(d) { return d.pruid; })
        .object(data);

    var notesNational = [];
    var numberOfNotes = 0;
    var typesOfNotes = [];
    var NAsNational = [];
    dataExceptions.forEach(function(d, i) {
        typesOfNotes = [];
        if (d["Notes National Overview Table"] != "" && d["Notes National Overview Table"] != undefined) {
            if (d["Notes Cases"] == "TRUE") {
                typesOfNotes.push("Cases");
            }
            if (d["Notes Deaths"] == "TRUE") {
                typesOfNotes.push("Deaths")
            }
            if (d["Notes Tests"] == "TRUE") {
                typesOfNotes.push("Tests")
            }
            notesNational.push({ pruid: d.PRUID, noteNumber: numberOfNotes, typesOfNotes: typesOfNotes });
            numberOfNotes++;
        }
        typesOfNotes = [];
        if (d["New Cases (N/A)"] == "TRUE" || d["New Deaths (N/A)"] == "TRUE" || d["New Tests (N/A)"] == "TRUE") {
            if (d["New Cases (N/A)"] == "TRUE") {
                typesOfNotes.push("Cases");
            }
            if (d["New Deaths (N/A)"] == "TRUE") {
                typesOfNotes.push("Deaths")
            }
            if (d["New Tests (N/A)"] == "TRUE") {
                typesOfNotes.push("Tests")
            }
            NAsNational.push({ pruid: d.PRUID, typesOfNotes: typesOfNotes });
        }
    })

    var exceptions = d3.nest()
        .key(function(d) { return d.PRUID; })
        .object(dataExceptions);

    var notesSymbols = ["†", "‡", "§", "¶", "**", "††", "‡‡", "§§", "¶¶"];

    var nationalNotesDiv = d3.select("#nationalNumbers-notes").selectAll(".nationalTableNote");
    nationalNotesDiv.data(notesNational)
        .enter()
        .append("p")
        .lower()
        .attr("class", "nationalTableNote")
        .html(function(d) {
            if (language == "en") {
                return "<sup>" + notesSymbols[d.noteNumber] + "</sup>" + " " + exceptions[d.pruid][0]["Notes National Overview Table"];
            }
            else {
                return "<sup>" + notesSymbols[d.noteNumber] + "</sup>" + " " + exceptions[d.pruid][0]["Notes Tableau Perspective Nationale"];
            }
        })

    //Add Canada Total
    const rowsCanada = d3.select(".nationalNumbers-data")
        .append("tr").attr("class", "nationalNumbers-canadaRow").style("background-color", "#bfbfbf");
    for (let key in data[0]) {
        if ((key == "prname" && language == "en") || (key == "prnameFR" && language == "fr") || key == "numteststoday" || key == "numtoday" || key == "numdeathstoday") {
            rowsCanada.append("td").attr("class", "nationalNumbers-canada").text(function() {
                if ((key == "prname") || (key == "prnameFR")) {
                    return "Canada";
                }
                else {
                    let typeOfNotes;
                    if (key == "numtoday") {
                        typeOfNotes = "Cases";
                    }
                    else if (key == "numdeathstoday") {
                        typeOfNotes = "Deaths";
                    }
                    else if (key == "numteststoday") {
                        typeOfNotes = "Tests";
                    }
                    const noteNational = notesNational.filter(function(e) {
                        return e.pruid == timeDataCanada[0].values[0].key && e.typesOfNotes.indexOf(typeOfNotes);
                    })
                    if (noteNational.length > 0 && noteNational[0].typesOfNotes == "Cases") {
                        currentNoteNumber = noteNational[0].noteNumber;
                        return numberFormat(timeDataCanada[0].values[0].values[0][key]) + notesSymbols[currentNoteNumber];
                    }
                    else if (noteNational.length > 0 && noteNational[0].typesOfNotes == "Deaths") {
                        currentNoteNumber = noteNational[0].noteNumber;
                        return numberFormat(timeDataCanada[0].values[0].values[0][key]) + notesSymbols[currentNoteNumber];
                    }
                    else if (noteNational.length > 0 && noteNational[0].typesOfNotes == "Tests") {
                        currentNoteNumber = noteNational[0].noteNumber;
                        return numberFormat(timeDataCanada[0].values[0].values[0][key]) + notesSymbols[currentNoteNumber];
                    }
                    else {
                        return numberFormat(timeDataCanada[0].values[0].values[0][key]);
                    }
                }
            });
        }
    }
    d3.selectAll(".nationalNumbers-canada").style("font-weight", "bold");

    const rows = d3.select(".nationalNumbers-data").selectAll("tr").filter(function() { return !this.classList.contains('nationalNumbers-canadaRow') }).data(timeData[0].values).enter().append("tr");
    for (let key in data[0]) {
        if ((key == "prname" && language == "en") || (key == "prnameFR" && language == "fr") || key == "numteststoday" || key == "numtoday" || key == "numdeathstoday") {
            rows.append("td").text(function(d) {
                if ((key == "prname") || (key == "prnameFR")) {
                    /* 						if(d.values[0].pruid == 62){
                    						return d.values[0][key]+"*";	
                    						}else{	 */
                    return d.values[0][key];
                    /* 						} */
                }
                else {
                    let typeOfNotes;
                    if (key == "numtoday") {
                        typeOfNotes = "Cases";
                    }
                    else if (key == "numdeathstoday") {
                        typeOfNotes = "Deaths";
                    }
                    else if (key == "numteststoday") {
                        typeOfNotes = "Tests";
                    }
                    let noteNational;
                    noteNational = notesNational.filter(function(e) {
                        return e.pruid == d.values[0].pruid && e.typesOfNotes.indexOf(typeOfNotes) > -1;
                    })
                    let NAsNational2;
                    NAsNational2 = NAsNational.filter(function(e) {
                        return e.pruid == d.values[0].pruid && e.typesOfNotes.indexOf(typeOfNotes) > -1;
                    })
                    if (key == "numdeathstoday" && (NAsNational2.length > 0 || noteNational.length > 0)) {
                        if (noteNational.length > 0) {
                            currentNoteNumber = noteNational[0].noteNumber;
                            if (NAsNational2.length > 0) {
                                if (language == "en") {
                                    return "N/A" + notesSymbols[currentNoteNumber];
                                }
                                else {
                                    return "S. O." + notesSymbols[currentNoteNumber];
                                }
                            }
                            else {
                                return numberFormat(d.values[0][key]) + notesSymbols[currentNoteNumber];
                            }
                        }
                        else {
                            if (language == "en") {
                                return "N/A";
                            }
                            else {
                                return "S. O.";
                            }
                        }
                    }
                    else if (key == "numtoday" && (NAsNational2.length > 0 || noteNational.length > 0)) {
                        if (noteNational.length > 0) {
                            currentNoteNumber = noteNational[0].noteNumber;
                            if (NAsNational2.length > 0) {
                                if (language == "en") {
                                    return "N/A" + notesSymbols[currentNoteNumber];
                                }
                                else {
                                    return "S. O." + notesSymbols[currentNoteNumber];
                                }
                            }
                            else {
                                return numberFormat(d.values[0][key]) + notesSymbols[currentNoteNumber];
                            }
                        }
                        else {
                            if (language == "en") {
                                return "N/A";
                            }
                            else {
                                return "S. O.";
                            }
                        }
                    }
                    else if (key == "numteststoday" && (NAsNational2.length > 0 || noteNational.length > 0)) {
                        if (noteNational.length > 0) {
                            currentNoteNumber = noteNational[0].noteNumber;
                            if (NAsNational2.length > 0) {
                                if (language == "en") {
                                    return "N/A" + notesSymbols[currentNoteNumber];
                                }
                                else {
                                    return "S. O." + notesSymbols[currentNoteNumber];
                                }
                            }
                            else {
                                return numberFormat(d.values[0][key]) + notesSymbols[currentNoteNumber];
                            }
                        }
                        else {
                            if (language == "en") {
                                return "N/A";
                            }
                            else {
                                return "S. O.";
                            }
                        }
                    }
                    else {
                        return numberFormat(d.values[0][key]);
                    }
                }
            });
        }
    }

    if (language == "en") {
        d3.selectAll(".numTests").text(numberFormat(timeDataCanada[0].values[0].values[0]["numtests"]));
        d3.selectAll(".rateTests").text(numberFormat(timeDataCanada[2].values[0].values[0]["avgratetests_last7"]));
        d3.selectAll(".totalCases").text(numberFormat(timeDataCanada[0].values[0].values[0]["numtotal"]));
        d3.selectAll(".active").text(numberFormat(timeDataCanada[0].values[0].values[0]["numactive"]));
        d3.selectAll(".percentActive").text((+timeDataCanada[0].values[0].values[0]["percentactive"]).toFixed(1));
        d3.selectAll(".recovered").text(numberFormat(timeDataCanada[0].values[0].values[0]["numrecover"]));
        d3.selectAll(".percentRecovered").text((+timeDataCanada[0].values[0].values[0]["percentrecover"]).toFixed(1));
        d3.selectAll(".deaths").text(numberFormat(timeDataCanada[0].values[0].values[0]["numdeaths"]));
        d3.selectAll(".percentDeaths").text((+timeDataCanada[0].values[0].values[0]["percentdeath"]).toFixed(1));
        d3.selectAll(".newCases").text(numberFormat(timeDataCanada[0].values[0].values[0]["numtoday"]));
        d3.selectAll(".newDeaths").text(numberFormat(timeDataCanada[0].values[0].values[0]["numdeathstoday"]));
        d3.selectAll(".percentPositive").text((+timeDataCanada[2].values[0].values[0]["avgpositivity_last7"]).toFixed(1));
    }
    else {
        d3.selectAll(".numTests").text(numberFormat(timeDataCanada[0].values[0].values[0]["numtests"]));
        d3.selectAll(".rateTests").text(numberFormat(timeDataCanada[2].values[0].values[0]["avgratetests_last7"]));
        d3.selectAll(".totalCases").text(numberFormat(timeDataCanada[0].values[0].values[0]["numtotal"]));
        d3.selectAll(".active").text(numberFormat(timeDataCanada[0].values[0].values[0]["numactive"]));
        d3.selectAll(".percentActive").text((+timeDataCanada[0].values[0].values[0]["percentactive"]).toFixed(1).replace(".", ","));
        d3.selectAll(".recovered").text(numberFormat(timeDataCanada[0].values[0].values[0]["numrecover"]));
        d3.selectAll(".percentRecovered").text((+timeDataCanada[0].values[0].values[0]["percentrecover"]).toFixed(1).replace(".", ","));
        d3.selectAll(".deaths").text(numberFormat(timeDataCanada[0].values[0].values[0]["numdeaths"]));
        d3.selectAll(".percentDeaths").text((+timeDataCanada[0].values[0].values[0]["percentdeath"]).toFixed(1).replace(".", ","));
        d3.selectAll(".newCases").text(numberFormat(timeDataCanada[0].values[0].values[0]["numtoday"]));
        d3.selectAll(".newDeaths").text(numberFormat(timeDataCanada[0].values[0].values[0]["numdeathstoday"]));
        d3.selectAll(".percentPositive").text((+timeDataCanada[2].values[0].values[0]["avgpositivity_last7"]).toFixed(1).replace(".", ","));
    }
    // d3.selectAll(".percentPositive").text(percentPositive.toFixed(1));

    // if (language == "en") {
    //     d3.selectAll(".percentPositive").text((+NML[0].percentpositive).toFixed(1));
    // }
    // else {
    //     d3.selectAll(".percentPositive").text((+NML[0].percentpositive).toFixed(1).replace(".", ","));
    // }

    // 		});
    // });

    /*         let x_scale;
            let y_scale;
            let graphWidth = 195;
            let graphHeight = 75; */

    /*         let stamp = [];
            let rateTested = [];
            let totalCases = [];
            let recovered = [];
            let deaths = [];
            let newCases = [];
            let positives = [];
            let line;
            
            let inversedTimeDataCanada = d3.nest()
            .key(function(d) { return +parseTime(d.date); }).sortKeys(d3.ascending)
            .key(function(d) { return d.pruid; })
            .entries(data.filter(function(d){ return d.pruid == 1 }));
        

            timeDataCanada.forEach(function(_item,_index){
                stamp.push(_index);
                rateTested.push((_item.values[0].values[0]["numtested"] * 1000000) / 37589262);
                totalCases.push(_item.values[0].values[0]["numtotal"]);
                recovered.push((isNaN(_item.values[0].values[0]["numrecover"]))?0:_item.values[0].values[0]["numrecover"]);
                deaths.push(_item.values[0].values[0]["numdeaths"]);
                newCases.push(_item.values[0].values[0]["numtoday"]);
                positives.push((_item.values[0].values[0]["numconf"] / timeDataCanada[0].values[0].values[0]["numtested"]) * 100);
            }); */


    /* x_scale = d3.scalePoint()
                .domain(stamp)
                .range([0, graphWidth]);
            
            y_scale = d3.scaleLinear()
                .domain([d3.min(rateTested)*0.99,d3.max(rateTested) * 1.01])
                .range([graphHeight,0]);
                
            line = d3.area()
            .x(function(d,i) { return x_scale(i)+65})
            .y(function(d,i) { return y_scale((d.values[0].values[0]["numtested"] * 1000000) / 37589262)+20}); */

    //  d3.select("svg.rateTested").attr("aria-label", "People tested per one million: "+numberFormat(testedPerMil));
    /*          if(language == "en"){
                d3.select("svg.rateTested").attr("aria-label", "People tested per one million: "+numberFormat(testedPerMil));
            }else{
                d3.select("svg.rateTested").attr("aria-label", "Personnes testées par un million: "+numberFormat(testedPerMil));
            } */

    // d3.select("svg.rateTested").append("path")
    //     .datum(inversedTimeDataCanada)
    //     .attr("fill", "none")
    //     .attr("stroke", "orange")
    //     .attr("stroke-linejoin", "round")
    //     .attr("stroke-linecap", "round")
    //     .attr("stroke-width", 2.5)
    //     .attr("x",0)
    //     .attr("y",0)
    //     .attr("stroke-opacity",0.2)
    //     .attr("d", line);


    /*         d3.select("svg.rateTested").append("text")
            .classed("h3",true)
            .attr("fill","black")
            .attr("text-anchor","middle")
            .attr("y","50%")
            .attr("x","50%")
            .text(numberFormat(testedPerMil));
            
            d3.select("svg.rateTested").append("text")
            .attr("fill","#6c686f")
            .attr("text-anchor","middle")
            .attr("y","70%")
            .attr("x","50%")
            .style("font-size", "14")
            .text(function(d){
                if(language == "en"){
                    return "People tested per 1 million";
                }else{
                    return "Personnes testées par 1 million";
                }
            });
            
            d3.select("#testedPositive").text(numberFormat(timeDataCanada[0].values[0].values[0]["ratepositive"]));
        
            
            y_scale = d3.scaleLinear()
                .domain([d3.min(totalCases)*0.99,d3.max(totalCases) * 1.01])
                .range([graphHeight,0]);
                
            line = d3.line()
            .x(function(d,i) { return x_scale(i)+65})
            .y(function(d,i) { return y_scale(d.values[0].values[0]["numtotal"])+20});
            
            d3.select("svg.totalCases").attr("aria-label", "Total cases: "+ numberFormat(timeDataCanada[0].values[0].values[0]["numtotal"])); */

    // d3.select("svg.totalCases").append("path")
    //     .datum(inversedTimeDataCanada)
    //     .attr("fill", "none")
    //     .attr("stroke", "orange")
    //     .attr("stroke-linejoin", "round")
    //     .attr("stroke-linecap", "round")
    //     .attr("stroke-width", 2.5)
    //     .attr("x",0)
    //     .attr("y",0)
    //     .attr("stroke-opacity",0.2)
    //     .attr("d", line);


    /*         d3.select("svg.totalCases")
            .append("text")
            .classed("h3",true)
            .attr("fill","black")
            .attr("text-anchor","middle")
            .attr("y","50%")
            .attr("x","50%")
            .text(numberFormat(timeDataCanada[0].values[0].values[0]["numtotal"]));
            
            d3.select("svg.totalCases").append("text")
            .attr("fill","#6c686f")
            .attr("text-anchor","middle")
            .attr("y","70%")
            .attr("x","50%")
            .style("font-size", "14")
            .text("Total cases");
            
            y_scale = d3.scaleLinear()
                .domain([d3.min(recovered)*0.99,d3.max(recovered) * 1.01])
                .range([graphHeight,0]);
                
            line = d3.line()
            .x(function(d,i) { return x_scale(i)+65})
            .y(function(d,i) { return y_scale((isNaN(d.values[0].values[0]["numrecover"]))?0:d.values[0].values[0]["numrecover"])+20});
            
            d3.select("svg.recovered").attr("aria-label", "Total recovered cases: "+ numberFormat(timeDataCanada[0].values[0].values[0]["numrecover"])+" ("+numberFormat(timeDataCanada[0].values[0].values[0]["percentrecover"])+"%)"); */

    // d3.select("svg.recovered").append("path")
    //     .datum(inversedTimeDataCanada)
    //     .attr("fill", "none")
    //     .attr("stroke", "orange")
    //     .attr("stroke-linejoin", "round")
    //     .attr("stroke-linecap", "round")
    //     .attr("stroke-width", 2.5)
    //     .attr("x",0)
    //     .attr("y",0)
    //     .attr("stroke-opacity",0.2)
    //     .attr("d", line);

    /*         d3.select("svg.recovered").append("text")
            .classed("h3",true)
            .attr("fill","black")
            .attr("text-anchor","middle")
            .attr("y","50%")
            .attr("x","50%")
            .text(numberFormat(timeDataCanada[0].values[0].values[0]["numrecover"])+" ("+numberFormat(timeDataCanada[0].values[0].values[0]["percentrecover"])+"%)");
            
            d3.select("svg.recovered").append("text")
            .attr("fill","#6c686f")
            .attr("text-anchor","middle")
            .attr("y","70%")
            .attr("x","50%")
            .style("font-size", "14")
            .text("Recovered");
            
            y_scale = d3.scaleLinear()
                .domain([d3.min(deaths)*0.99,d3.max(deaths) * 1.01])
                .range([graphHeight,0]);
                
            line = d3.line()
            .x(function(d,i) { return x_scale(i)+65})
            .y(function(d,i) { return y_scale(d.values[0].values[0]["numdeaths"])+20}); */


    /*         d3.select("svg.deaths").attr("aria-label", "Total deaths: "+numberFormat(timeDataCanada[0].values[0].values[0]["numdeaths"])+" ("+numberFormat(timeDataCanada[0].values[0].values[0]["percentdeath"])+"%)") */

    // d3.select("svg.deaths").append("path")
    //     .datum(inversedTimeDataCanada)
    //     .attr("fill", "none")
    //     .attr("stroke", "orange")
    //     .attr("stroke-linejoin", "round")
    //     .attr("stroke-linecap", "round")
    //     .attr("stroke-width", 2.5)
    //     .attr("x",0)
    //     .attr("y",0)
    //     .attr("stroke-opacity",0.2)
    //     .attr("d", line);


    /*         d3.select("svg.deaths").append("text")
            .classed("h3",true)
            .attr("fill","black")
            .attr("text-anchor","middle")
            .attr("y","50%")
            .attr("x","50%")
            .text(numberFormat(timeDataCanada[0].values[0].values[0]["numdeaths"])+" ("+numberFormat(timeDataCanada[0].values[0].values[0]["percentdeath"])+"%)");
            
            d3.select("svg.deaths").append("text")
            .attr("fill","#6c686f")
            .attr("text-anchor","middle")
            .attr("y","70%")
            .attr("x","50%")
            .style("font-size", "14")
            .text("Deaths"); */

    /*         y_scale = d3.scaleLinear()
                .domain([d3.min(newCases)*0.99,d3.max(newCases) * 1.01,])
                .range([graphHeight,0]);
                
            line = d3.line()
            .x(function(d,i) { return x_scale(i)+65})
            .y(function(d,i) { return y_scale(d.values[0].values[0]["numtoday"])+20});
            

             d3.select("svg.newCases").attr("aria-label", "New cases: "+numberFormat(timeDataCanada[0].values[0].values[0]["numtoday"])) */

    //chop out the most recent day because the new cases will always be 0
    // d3.select("svg.newCases").append("path")
    //     .datum(inversedTimeDataCanada.slice(0,inversedTimeDataCanada.length - 1))
    //     .attr("fill", "none")
    //     .attr("stroke", "orange")
    //     .attr("stroke-linejoin", "round")
    //     .attr("stroke-linecap", "round")
    //     .attr("stroke-width", 2.5)
    //     .attr("x",0)
    //     .attr("y",0)
    //     .attr("stroke-opacity",0.2)
    //     .attr("d", line);

    /*         d3.select("svg.newCases").append("text")
            .classed("h3",true)
            .attr("fill","black")
            .attr("text-anchor","middle")
            .attr("y","50%")
            .attr("x","50%")
            .text(numberFormat(timeDataCanada[0].values[0].values[0]["numtoday"]));
            
            d3.select("svg.newCases").append("text")
            .attr("fill","#6c686f")
            .attr("text-anchor","middle")
            .attr("y","70%")
            .attr("x","50%")
            .style("font-size", "14")
            .text("New cases"); */

    /*        y_scale = d3.scaleLinear()
               .domain([d3.min(positives)*0.99,d3.max(positives) * 1.01])
               .range([graphHeight,0]);
               
           line = d3.line()
           .x(function(d,i) { return x_scale(i)+65})
           .y(function(d,i) { return y_scale((d.values[0].values[0]["numconf"] / timeDataCanada[0].values[0].values[0]["numtested"]) * 100)+20});
           
           d3.select("svg.percentPositive").attr("aria-label", "Percent positive (total): "+percentPositive.toFixed(1)+"%") */

    // d3.select("svg.percentPositive").append("path")
    //     .datum(inversedTimeDataCanada)
    //     .attr("fill", "none")
    //     .attr("stroke", "orange")
    //     .attr("stroke-linejoin", "round")
    //     .attr("stroke-linecap", "round")
    //     .attr("stroke-width", 2.5)
    //     .attr("x",0)
    //     .attr("y",0)
    //     .attr("stroke-opacity",0.2)
    //     .attr("d", line);


    /*         d3.select("svg.percentPositive").append("text")
            .classed("h3",true)
            .attr("fill","black")
            .attr("text-anchor","middle")
            .attr("y","50%")
            .attr("x","50%")
            .text(percentPositive.toFixed(1)+"%");
            
            d3.select("svg.percentPositive").append("text")
            .attr("fill","#6c686f")
            .attr("text-anchor","middle")
            .attr("y","70%")
            .attr("x","50%")
            .style("font-size", "14")
            .text("Percent positive (total)"); */

    // });
}


//Confirmed Cases
function confirmedCases() {
    $("#newCaseNote").hide();

    // set the dimensions and margins of the graph
    let margin = {
        top: 20,
        right: 20,
        bottom: 100,
        left: 70
    };
    let isIE = /*@cc_on!@*/ false || !!document.documentMode;
    if (/Edge\/\d./i.test(navigator.userAgent))
        isIE = true;


    let width = 1140 - margin.left - margin.right;
    let height = 500 - margin.top - margin.bottom;

    //zoomAndPan="magnify" viewBox="0 0 800 350"appendrveAspectRatio="xMidYMid meet"
    let svg = d3.select("#cases-over-time").select("svg")
        .attr("width", function(d) {
            if (isIE) {
                return (width + margin.left + margin.right);
            }
            else {
                return;
            }
        })
        .attr("height", function(d) {
            if (isIE) {
                return (height + margin.top + margin.bottom);
            }
            else {
                return;
            }
        })
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1140 500")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    let x = d3.scaleBand()
        .range([0, width])
        .padding(0.2);

    let y = d3.scaleLinear()
        .range([height, 10]);

    svg.append("g")
        .attr("class", "y-axis");

    svg.append("g")
        .attr("class", "x-axis");

    let xAxisTitle = svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 70) + ")")
        .style("text-anchor", "middle")
        .attr("class", "x-axis-title");
    let yAxisTitle = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "y-axis-title");

    function drawGraph(data, key) {
        x.domain(data.map(function(d) {
            return parseTimeEpiSummary(d.date);
        }));

        svg.select(".x-axis").attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d-%b-%y")))
            .selectAll("text")
            .style("font-size", 12)
            .style("text-anchor", "end")
            .attr("transform", "rotate(-45)")
            .attr("x", -6)
            .attr("y", 4);

        y.domain([0, d3.max(data, function(d) {
            return +d[key];
        })]);

        d3.select(".y-axis")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y))
            .selectAll(".tick")
            .select("line")
            .style("stroke", "#e5e5e5")
            .attr('x2', width);

        svg.selectAll(".domain").remove();

        const bars = svg.selectAll(".bar")
            .data(data);

        const barsEntered = bars.enter();

        barsEntered.append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {
                return x(parseTimeEpiSummary(d.date));
            })
            .attr("width", x.bandwidth())
            .attr("y", function(d) {
                return y(d[key]);
            })
            .attr("height", function(d) {
                return height - y(d[key]);
            });

        const barsExit = bars.exit();
        barsExit.remove();

        bars.attr("x", function(d) {
                return x(parseTimeEpiSummary(d.date));
            })
            .transition()
            .duration(500)
            .attr("width", x.bandwidth())
            .attr("y", function(d) {
                return y(d[key]);
            })
            .attr("height", function(d) {
                return height - y(d[key]);
            });

        if (language == "en") {
            xAxisTitle.text("Date of illness onset");
        }
        else {
            xAxisTitle.text("Date d'apparition de la maladie");
        }

        yAxisTitle
            .transition()
            .duration(1000)
            .text(function() {
                if (language == "en") {
                    if (key == "new") {
                        return "Number of reported cases";
                    }
                    else {
                        return "Cumulative number of reported cases";
                    }
                }
                else {
                    if (key == "new") {
                        return "Nombre de cas rapportés";
                    }
                    else {
                        return "Nombre de cas totaux rapportés";
                    }
                }

            });

        const rows = d3.select(".confirmed-data").selectAll("tr").data(data).enter().append("tr");
        for (let key in data[0]) {
            if (key == "date" || key == "new")
                rows.append("td")
                .style("width", function(d) {
                    if (key == "date") {
                        return "50%";
                    }
                })
                .text(function(d) {
                    if (key == "date") {
                        return d[key];
                    }
                    else {
                        return numberFormat(d[key]);
                    }
                });
        }

        /*         d3.selectAll(".N1").text(numberFormat(d3.sum(data.map(function(d) { return +d["new"]})))); */

        d3.select(".x-axis")
            .selectAll(".tick")
            .each(function(d, i) {
                if (i % 3 != 0 && i != 0) {
                    d3.select(this).remove();
                }
            });
    }

    /*     d3.csv("/src/data/covidLive/covid19-epiSummary-casesovertime.csv", function(data) {
            $("#figure1-dropdown").on("change", function(e) {
                drawGraph(data, this.value);
                
                if (this.value == "new") {
                    $("#newCaseNote").fadeIn();
                    d3.select("#shaded-area").transition().duration(500).style("opacity", 0.5);
                } else {
                    $("#newCaseNote").fadeOut();
                    d3.select("#shaded-area").transition().duration(500).style("opacity", 0);
                }
            });
            drawGraph(data, "new");

            // drawing the rectangle
            let lastDate = parseTimeEpiSummary(data[data.length-data[0]["shaded"]].date);
            svg.append('rect')
                .attr("id", "shaded-area")
                .attr("x", x(lastDate)-2)
                .attr("y", 0)
                .attr("height", height+1)
                .style("opacity", 0.5)
                .style("fill", "#9fa3a7")
                .attr("width", width-x(lastDate)+1);
    			
        }); */
};

function epiSummaryStatements() {
    // d3.csv("/src/data/covidLive/covid19-epiSummary-statements.csv", function(dataStatements){
    var dataColumn;
    language == "en" ? dataColumn = "statementEN" : dataColumn = "statementFR";
    d3.select("#keyStatements")
        .selectAll("li")
        .data(dataStatements)
        .enter()
        .append("li")
        .style("font-weight", function(d, i) {
            /* 			if(i==0){
            			return "bold";
            		} */
        })
        .text(function(d) {
            return d[dataColumn];
        })
    // });
}

function bySex() {
    const ageGroupDiv = d3.select("#sex-groups")
    //zoomAndPan="magnify" viewBox="0 0 800 350" preserveAspectRatio="xMidYMid meet"
    ageGroupDiv.select("svg").attr("viewBox", "0 0 800 350").attr("preserveAspectRatio", "xMinYMin meet");

    const ageGroupSvg = ageGroupDiv.select("svg");

    d3.csv("/src/data/covidLive/bySex.csv", function(data) {
        data.reverse();

        var dataColumn;
        if (language == "en") {
            dataColumn = "Number of cases with case reports";
        }
        else {
            dataColumn = "Nombre de cas rapportés";
        }

        data.forEach(function(d) {
            d["Total"] = +d["Total"];
        });

        // set the dimensions and margins of the graph
        var margin = { top: 20, right: 20, bottom: 60, left: 70 },
            width = 800 - margin.left - margin.right,
            height = 350 - margin.top - margin.bottom;

        let isIE = /*@cc_on!@*/ false || !!document.documentMode;
        if (/Edge\/\d./i.test(navigator.userAgent))
            isIE = true;

        ageGroupSvg.attr("width", function(d) {
                if (isIE) {
                    return (width + margin.left + margin.right);
                }
                else {
                    return;
                }
            })
            .attr("height", function(d) {
                if (isIE) {
                    return (height + margin.top + margin.bottom);
                }
                else {
                    return;
                }
            })

        // set the ranges
        var y = d3.scaleBand()
            .range([height, 0])
            .padding(0.35);

        var x = d3.scaleLinear()
            .range([0, width]);

        var color = d3.scaleOrdinal()
            .range(["#015B7E", "#bdd7e7"]);

        // append the svg object to the body of the page
        // append a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        var svg = ageGroupSvg
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Scale the range of the data in the domains
        x.domain([0, d3.max(data, function(d) { return +d["Total"] + 450; })])
        y.domain(data.map(function(d) { return d["Sex"]; }));

        // add the x Axis
        const xAxis = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        const yAxis = svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top + 15) + ")")
            .style("text-anchor", "middle")
            .text(dataColumn)
            .attr("font-size", 10);

        svg.append("text")
            .attr("transform",
                "translate(" + (-43) + "," +
                (height / 2) + ") rotate(-90)")
            .style("text-anchor", "start")
            .text(function() {
                if (language == "en") {
                    return "Sex";
                }
                else {
                    return "Sexe";
                }
            })
            .style("text-anchor", "middle")
            .attr("font-size", 10);

        const ticks = xAxis.selectAll(".tick line");
        ticks.attr("y2", -height);
        ticks.attr("stroke", "#e5e5e5");

        yAxis.selectAll(".tick line").style("display", "none");

        svg.selectAll(".domain").style("display", "none");
        let ages = svg.append("g")
            .attr("class", "sexG")
            .data(data.reverse())

        let totalSex = d3.sum(data.map(function(d) { return +d["Total"] }));

        ages
            .selectAll("text")
            .data(data.reverse())
            .enter().append("text")
            .text(function(d) {
                let percent = ((d["Total"] / totalSex) * 100).toFixed(2);
                return percent + "%";
            })
            .attr("x", function(d) { return x(d["Total"]) + 5 })
            .attr("font-size", 10)
            .attr("y", function(d) { return y(d["Sex"]) + y.bandwidth() / 2 + 5 });

        // width_diff = 0;  
        ages.selectAll("rect")
            .data(data.reverse())
            .enter().append("rect")
            .attr("width", function(d) {
                return x(d.Total);
            })
            .attr("y", function(d) {
                return y(d.Sex);
            })
            .attr("x", function(d) {
                return 1;
            })
            .attr("height", y.bandwidth())
            .attr("class", function(d) {
                //   classLabel = d.name.replace(/\s/g, ''); //remove spaces
                //   return "bars class" + classLabel;
            })
            .style("fill", function(d) {
                return "rgb(1, 91, 126)";
            });


        //add in sex by age but hide from the get go

        let keys = ["<19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80+"];

        var z = d3.scaleOrdinal(d3.schemeCategory10);


        let stack = d3.stack();

        svg.selectAll(".serieAge")
            .data(stack.keys(keys)(data))
            .enter()
            .append("g")
            .attr("class", function(d) {
                return "serieAge " + d.key
            })
            .attr('opacity', 0)

            .attr("fill", function(d) { return z(d.key); })
            .selectAll("rect")
            .data(function(d) { return d; })
            .enter()
            .append("rect")
            .attr("y", function(d) {
                return y(d.data.Sex);
            })
            .attr("x", function(d) {
                return x(d[0]) + 1;
            })
            .attr("width", function(d) { return x(d[1]) - x(d[0]); })
            .attr("height", y.bandwidth());

        var legend = svg.append("g")
            .attr('id', 'serieL')
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice())
            .enter().append("g")
            .attr('opacity', 0)
            .attr("transform", function(d, i) { return "translate(0," + i * 15 + ")"; });

        legend.append("rect")
            .attr("x", width - 14)
            .attr("width", 14)
            .attr("height", 14)
            .attr("fill", z);

        legend.append("text")
            .attr("x", width - 19)
            .attr("y", 8.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; });



    });
    var dropdown2Value = $("#figure2-dropdown").val();
    $("#figure2-dropdown").on("change", function(e) {
        if (this.value == "sex") {
            $("#age-groups").fadeOut(150, function() {
                $("#sex-groups").fadeIn();
            });
            d3.selectAll("#serieL g").transition().delay(function(d, i) { return i * 50 }).attr("opacity", 0)
            d3.selectAll(".serieAge").transition().delay(function(d, i) { return i * 50 }).attr("opacity", 0)
        }
        else if (this.value == "sexByAge") {
            $("#age-groups").fadeOut(150, function() {
                $("#sex-groups").fadeIn(150, function() {
                    d3.selectAll("#serieL g").transition().delay(function(d, i) { return i * 50 }).attr("opacity", 1)
                    d3.selectAll(".serieAge").transition().delay(function(d, i) { return i * 50 }).attr("opacity", 1)


                });
            });

        }
        else {
            $("#sex-groups").fadeOut(150, function() {
                $("#age-groups").fadeIn(150, function() {
                    d3.selectAll("#serieL g").attr("opacity", 0)
                    d3.selectAll(".serieAge").attr("opacity", 0)
                });
            });

        }

    });
}

//Age groups and sex
function ageGroupsSex() {
    const ageGroupDiv = d3.select("#age-groups")
    //zoomAndPan="magnify" viewBox="0 0 800 350" preserveAspectRatio="xMidYMid meet"
    ageGroupDiv.select("svg").attr("viewBox", "0 0 885 350").attr("preserveAspectRatio", "xMinYMin meet");

    const ageGroupSvg = ageGroupDiv.select("svg");

    // d3.csv("/src/data/covidLive/covid19-epiSummary-agegroups2.csv", function(data) {
    data.reverse();

    var dataColumn;
    var dataColumn2;
    if (language == "en") {
        dataColumn = "Number of cases with case reports";
        dataColumn2 = "Number (Proportion (%))";
    }
    else {
        dataColumn = "Nombre de cas rapportés";
        dataColumn2 = "Nombre (Proportion (%))";
    }

    // 	d3.csv("/src/data/covidLive/covid19-nTotal.csv",function(nTotal){
    N0 = +nTotal.columns[0];
    d3.selectAll(".N2Total").text(numberFormat(+data[data.length - 1]["n"]));
    d3.selectAll(".N2").text(numberFormat(+data[data.length - 1]["n_Ageonly"]));
    if (language == "en") {
        d3.selectAll(".N2Percent").text((+data[data.length - 1]["n"] / N0 * 100).toFixed(2));
        d3.selectAll(".N5Percent").text((+data[data.length - 1]["n_Ageonly"] / N0 * 100).toFixed(2));
    }
    else {
        d3.selectAll(".N2Percent").text(((+data[data.length - 1]["n"] / N0 * 100).toFixed(2)).replace(".", ","));
        d3.selectAll(".N5Percent").text(((+data[data.length - 1]["n_Ageonly"] / N0 * 100).toFixed(2)).replace(".", ","));
    }
    d3.selectAll(".N5").text(numberFormat(+data[data.length - 1]["n_Ageonly"]));

    // 	});

    data.forEach(function(d) {
        d["Number of cases with case reports"] = +d["Number of cases with case reports"];
        d["Males"] = +d["Males"];
        d["Females"] = +d["Females"];
    });

    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 20, bottom: 60, left: 70 },
        width = 800 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

    let isIE = /*@cc_on!@*/ false || !!document.documentMode;
    if (/Edge\/\d./i.test(navigator.userAgent))
        isIE = true;

    ageGroupSvg.attr("width", function(d) {
            if (isIE) {
                return (width + margin.left + margin.right);
            }
            else {
                return;
            }
        })
        .attr("height", function(d) {
            if (isIE) {
                return (height + margin.top + margin.bottom);
            }
            else {
                return;
            }
        })

    // set the ranges
    var y = d3.scaleBand()
        .range([height, 0])
        .padding(0.35);

    var x = d3.scaleLinear()
        .range([0, width]);

    var color = d3.scaleOrdinal()
        .range(["#015B7E", "#bdd7e7"]);

    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = ageGroupSvg
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data in the domains
    x.domain([0, d3.max(data, function(d) { return +d["Number of cases with case reports"] + 150; })])
    y.domain(data.map(function(d) { return d["Age group (years)"]; }));

    // add the x Axis
    const xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    const yAxis = svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top + 15) + ")")
        .style("text-anchor", "middle")
        .text(dataColumn2)
        .attr("font-size", 14);

    svg.append("text")
        .attr("transform",
            "translate(" + (-43) + "," +
            (height / 2) + ") rotate(-90)")
        .style("text-anchor", "start")
        .text(function() {
            if (language == "en") {
                return "Age group (years)";
            }
            else {
                return "Groupe d'âge (années)";
            }
        })
        .style("text-anchor", "middle")
        .attr("font-size", 14);

    const ticks = xAxis.selectAll(".tick line");
    ticks.attr("y2", -height);
    ticks.attr("stroke", "#e5e5e5");

    yAxis.selectAll(".tick line").style("display", "none");

    svg.selectAll(".domain").style("display", "none");

    function drawGraph(data, dropdown2Value) {

        // Get highest sex and age group percentages
        // format the data
        var dataGraph;
        if (dropdown2Value == "age sex") {
            color.domain(["Males", "Females"]);

            data.forEach(function(d) {
                var myagegroup = d["Age group (years)"]; //add to stock code
                var x0 = 0;
                d.sex = color.domain().map(function(name) {
                    return {
                        myagegroup: myagegroup,
                        name: name,
                        x0: x0,
                        x1: x0 += +d[name],
                        value: +d[name],
                        valueMale: +d["Males"],
                        valueFemale: +d["Females"],
                        x_corrected: 0
                    };
                });
                d.total = d.sex[d.sex.length - 1].x1;
            })

            //This is the legend
            if (d3.select(".legendSexAgeChart").size() == 0) {
                const gLegendChart = svg.append("g").attr("class", "legendSexAgeChart")

                const legendSexAgeChart = gLegendChart.selectAll("legChart")
                    .data(function() {
                        if (language == "en") {
                            return ["Males", "Females"];
                        }
                        else {
                            return ["Hommes", "Femmes"];
                        }
                    })
                    .enter().append("g")
                    .attr("id", function(d, i) { return "leg" + i; })
                    .attr("class", "legSexAge")
                    .attr("transform", "translate(590,10)")

                let j = 0;
                let j2 = 13;
                legendSexAgeChart.append("text")
                    .text(function(d, i) {
                        return d;
                    })
                    .attr("font-size", "15px")
                    .style("text-anchor", "end")
                    //.attr("x", (z.range()[0]+10))
                    .attr("transform", function(d, i) { if (language == "en") { j2 = 13; } else { j2 = 16; } j = j + (d.length * j2); return "translate(" + (+j - 15) + ",12)"; })

                j = 0;
                j2 = 13;
                legendSexAgeChart.append("rect")
                    .attr("height", 12)
                    .attr("x", function(d, i) { if (language == "en") { j2 = 13; } else { j2 = 16; } j = j + (d.length * j2); return ((+j - 15) + 6); })
                    .attr("transform", "translate(0,1)")
                    .attr("width", 12)
                    .attr("fill", function(d, i) { return color(d); })
                    .attr("stroke", "#828080");
            }
            $(".legendSexAgeChart").css("display", "block");

        }
        else {
            color.domain("Totals");

            data.forEach(function(d) {
                var myagegroup = d["Age group (years)"]; //add to stock code
                var x0 = 0;
                d.sex = {
                    myagegroup: myagegroup,
                    name: "Number of cases with case reports",
                    x0: x0,
                    x1: x0 += +d["Number of cases with case reports"],
                    value: +d["Number of cases with case reports"],
                    valueMale: +d["Males"],
                    valueFemale: +d["Females"],
                    x_corrected: 0
                };
                d.total = d.sex.x1;
            })

            $(".legendSexAgeChart").css("display", "none");
        }

        function valueAge(item) {
            return item["Number of cases with case reports"];
        }

        function valueOldAge(item) {
            if (item["Age group (years)"] == "60-69" || item["Age group (years)"] == "70-79" || item["Age group (years)"] == "80+") {
                return item["Number of cases with case reports"];
            }
            else {
                return 0;
            }
        }

        function valueMales(item) {
            return item.Males;
        }

        function valueFemales(item) {
            return item.Females;
        }

        function sum(prev, next) {
            return prev + next;
        }

        function getPercentageText(value) {
            if (language == "en") {
                if (value >= 0.45) {
                    return "half";
                }
                else if (value >= 0.30) {
                    return "one-third";
                }
                else if (value >= 0.22) {
                    return "one-quarter";
                }
                else if (value >= 0.18) {
                    return "one-fifth";
                }
            }
            else {
                if (value >= 0.45) {
                    return "la moitié";
                }
                else if (value >= 0.30) {
                    return "un tiers";
                }
                else if (value >= 0.22) {
                    return "un quart";
                }
                else if (value >= 0.18) {
                    return "un cinquième";
                }
            }
        }

        var maxMales = data.map(valueMales).reduce(sum) / (data.map(valueMales).reduce(sum) + data.map(valueFemales).reduce(sum));
        var maxFemales = data.map(valueFemales).reduce(sum) / (data.map(valueMales).reduce(sum) + data.map(valueFemales).reduce(sum));
        var sexMost;
        if (maxMales > maxFemales) {
            if (language == "en") {
                $("#percentSex").text(d3.format(".1%")(maxMales));
                $("#sex").text("male");
            }
            else {
                $("#percentSex").text(d3.format(".1%")(maxMales).replace("%", " %"));
                $("#sex").text("hommes");
            }
            sexMost = data.map(valueMales).reduce(sum) / (data.map(valueMales).reduce(sum) + data.map(valueFemales).reduce(sum));
        }
        else if (maxMales == maxFemales) {
            if (language == "en") {
                $("#percentSex").text(d3.format(".1%")(maxFemales));
                $("#sex").text("female");
            }
            else {
                $("#percentSex").text(d3.format(".1%")(maxFemales).replace("%", " %"));
                $("#sex").text("femmes");
            }
        }
        else {
            if (language == "en") {
                $("#percentSex").text(d3.format(".1%")(maxFemales));
                $("#sex").text("female");
            }
            else {
                $("#percentSex").text(d3.format(".1%")(maxFemales).replace("%", " %"));
                $("#sex").text("femmes");
            }
            sexMost = data.map(valueFemales).reduce(sum) / (data.map(valueMales).reduce(sum) + data.map(valueFemales).reduce(sum));
        }
        $("#fractionSex").text(getPercentageText(sexMost));

        var maxOldAge = data.map(valueOldAge).reduce(sum) / data.map(valueAge).reduce(sum);
        if (language == "en") {
            $("#percentOver60").text(d3.format(".1%")(maxOldAge));
        }
        else {
            $("#percentOver60").text((d3.format(".1%")(maxOldAge)).replace("%", " %"));
        }
        $("#fractionOver60").text(getPercentageText(maxOldAge));

        var ages;
        if (svg.selectAll(".agesg").empty()) {
            ages = svg.selectAll(".agesg")
                .data(data)
                .enter().append("g")
                .attr("class", "agesg")

            ages
                .append("text")
                .text(function(d) {
                    if (language == "en") {
                        return numberFormat(d["Number of cases with case reports"]) + " (" + d["Proportion of cases"] + ")";
                    }
                    else {
                        return numberFormat(d["Number of cases with case reports"]) + " (" + d["Proportion of cases"].replace("%", " %").replace(".", ",") + ")";
                    }
                })
                .attr("x", function(d) { return x(d["Number of cases with case reports"]) + 5 })
                .attr("font-size", 14)
                .attr("y", function(d) { return y(d["Age group (years)"]) + y.bandwidth() - 7 });

            // width_diff = 0;  
            ages.selectAll("rect")
                .data(function(d) {
                    if (dropdown2Value == "age sex") {
                        return d.sex;
                    }
                    else {
                        return [d.sex];
                    }
                })
                .enter().append("rect")
                .attr("width", function(d) {
                    return x(0) + x(d.value);
                })
                .attr("y", function(d) {
                    return y(d.myagegroup);
                })
                .attr("x", function(d) {
                    x_corrected = x(d.x0) + 1;
                    d.x_corrected = x_corrected;
                    return x_corrected;
                })
                .attr("height", y.bandwidth())
                .attr("class", function(d) {
                    classLabel = d.name.replace(/\s/g, ''); //remove spaces
                    return "bars class" + classLabel;
                })
                .style("fill", function(d) {
                    return color("Totals");
                });

        }
        else {
            ages = svg.selectAll(".agesg")
                .data(data)

            ages.selectAll("rect")
                .data(function(d) {
                    if (dropdown2Value == "age sex") {
                        return d.sex;
                    }
                    else {
                        return [d.sex];
                    }
                })
                .enter().append("rect")
                .attr("width", 0)
                .attr("x", 0)
                .attr("y", function(d) {
                    return y(d.myagegroup);
                })
                .style("fill", function(d) {
                    return color(d.name);
                })
                .attr("height", y.bandwidth())

            ages.selectAll("rect").transition().duration(400)
                .attr("width", function(d) {
                    return x(0) + x(d.value);
                })
                .attr("y", function(d) {
                    return y(d.myagegroup);
                })
                .attr("x", function(d) {
                    x_corrected = x(d.x0) + 1;
                    d.x_corrected = x_corrected
                    return x_corrected;
                })
                .attr("class", function(d) {
                    classLabel = d.name.replace(/\s/g, ''); //remove spaces
                    return "bars class" + classLabel;
                })
                .style("fill", function(d) {
                    return color(d.name);
                });
            /*                 								 if(dropdown2Value == "age sex"){
            				d3.selectAll(".agesg text").remove();
            				d3.selectAll(".agesg rect").each(function(d,i){
            									var xPos = +d3.select(this).attr("x");
            									var widthAdj = +d3.select(this).attr("width")/2;
            									var heightAdj = +d3.select(this).attr("height")-3;
            									var yPos = +d3.select(this).attr("y");
            				if(i % 2 == 0) {
            					d3.select(this.parentNode).append("text").attr("x",xPos+widthAdj).attr("y",yPos+heightAdj).style("fill","white").attr("text-anchor","middle").text(d["valueMale"]);
            				}else{
            					d3.select(this.parentNode).append("text").attr("x",xPos+widthAdj).attr("y",yPos+heightAdj).style("fill","black").attr("text-anchor","middle").text(d["valueFemale"]);
            				}
            				})
            			}else{
            				
            			} */
            ages.selectAll("rect")
                .data(function(d) {
                    if (dropdown2Value == "age sex") {
                        return d.sex;
                    }
                    else {
                        return [d.sex];
                    }
                })
                .exit().transition().duration(400)
                .attr("width", "0")
                .style("fill", "none");

        }

        const rows = d3.select(".age-group-data").selectAll("tr").data(data.reverse()).enter().append("tr");
        for (let key in data[0]) {
            if (key == "Age group (years)" || key == "Number of cases with case reports" || key == "Males" || key == "Females") {
                rows.append("td").text(function(d) {
                    function percentSign(value) {
                        if (language == "fr") {
                            return value.replace("%", " %");
                        }
                        else {
                            return value;
                        }
                    }

                    if (key == "Males") {
                        return numberFormat(d[key]) + " (" + percentSign(d["Proportion male cases"]) + ")"
                    }
                    else if (key == "Females") {
                        return numberFormat(d[key]) + " (" + percentSign(d["Proportion female cases"]) + ")"
                    }
                    else if (key == "Number of cases with case reports") {
                        return numberFormat(d[key]) + " (" + percentSign(d["Proportion of cases"]) + ")"
                    }
                    else {
                        return d[key];
                    }
                })
            }
        }

        //   d3.selectAll(".number-of-cases").text(numberFormat(d3.sum(data.map(function(d) {
        //       return d["Number of cases with case reports"];
        //   }))))
    }

    var dropdown2Value = $("#figure2-dropdown").val();
    drawGraph(data, dropdown2Value);

    $("#figure2-dropdown").on("change", function(e) {
        if (this.value == "age") {
            d3.selectAll(".N2").text(numberFormat(+data[data.length - 1]["n_Ageonly"]));
            dataColumn = "Number of cases with case reports";
            // $("#newCaseNote").fadeIn();
            // d3.select("#shaded-area").transition().duration(500).style("opacity", 0.5);
        }
        else {
            d3.selectAll(".N2").text(numberFormat(+data[data.length - 1]["n"]));
            dataColumn = "";
            // $("#newCaseNote").fadeOut();
            // d3.select("#shaded-area").transition().duration(500).style("opacity", 0);
        }
        drawGraph(data, this.value);

    });
    // });
}


//Probable Exposure
function probableExposure() {
    // set the dimensions and margins of the graph
    let margin = {
        top: 20,
        right: 20,
        bottom: 100,
        left: 70
    };

    let isIE = /*@cc_on!@*/ false || !!document.documentMode;
    if (/Edge\/\d./i.test(navigator.userAgent))
        isIE = true;

    let width = 1140 - margin.left - margin.right;
    let height = 500 - margin.top - margin.bottom;

    let svg = d3.select("#probable-exposure").select("svg")
        .attr("width", function(d) {
            if (isIE) {
                return (width + margin.left + margin.right);
            }
            else {
                return;
            }
        })
        .attr("height", function(d) {
            if (isIE) {
                return (height + margin.top + margin.bottom);
            }
            else {
                return;
            }
        })
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1140 500")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    // set the ranges
    let x = d3.scaleBand()
        .range([0, width])
        .padding(0.2);

    let y = d3.scaleLinear()
        .range([height, 0]);

    svg.append("g")
        .attr("class", "y-axis");

    svg.append("g")
        .attr("class", "x-axis");

    let xAxisTitle = svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 65) + ")")
        .style("text-anchor", "middle")
        .attr("class", "x-axis-title");
    let yAxisTitle = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "y-axis-title");

    function wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

    function drawGraph(data, key) {

        x.domain(data.filter(function(d) {
            return d["graph"] != "0";
        }).map(function(d) {
            if (language == "en") {
                return d["Probable exposure setting"];
            }
            else {
                return d["Contexte d'exposition probable"];
            }
        }));

        svg.select(".x-axis").attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll(".tick text")
            .call(wrap, x.bandwidth());


        y.domain([0, d3.max(data.filter(function(d) {
            return d["graph"] != "0";
        }), function(d) {
            return +d[key];
        }) + 10]);

        svg.select(".y-axis")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y).tickFormat(function(d) {
                if (language == "en") {
                    return d + "%";
                }
                else {
                    return d + " %";
                }

            }))
            .selectAll(".tick")
            .select("line")
            .style("stroke", "#e5e5e5")
            .attr('x2', width);

        svg.selectAll(".domain").remove();

        const bars = svg.selectAll(".bar")
            .data(data.filter(function(d) {
                return d["graph"] != "0";
            }));

        const barsEntered = bars.enter();

        barsEntered.append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {
                if (language == "en") {
                    return x(d["Probable exposure setting"]);
                }
                else {
                    return x(d["Contexte d'exposition probable"]);
                }
            })
            .attr("width", x.bandwidth())
            .attr("y", function(d) {
                return y(d[key]);
            })
            .attr("height", function(d) {
                return height - y(d[key]);
            });

        const barsExit = bars.exit();
        barsExit.remove();

        bars.attr("x", function(d) {
                if (language == "en") {
                    return x(d["Probable exposure setting"]);
                }
                else {
                    return x(d["Contexte d'exposition probable"]);
                }
            })
            .transition()
            .duration(500)
            .attr("width", x.bandwidth())
            .attr("y", function(d) {
                return y(d[key]);
            })
            .attr("height", function(d) {
                return height - y(d[key]);
            });

        barsEntered.append("text")
            .text(function(d) {
                if (language == "en") {
                    return d["Proportion of cases"] + "%";
                }
                else {
                    return d["Proportion of cases"] + " %";
                }
            })
            .attr("x", function(d) {
                if (language == "en") {
                    return x(d["Probable exposure setting"]) + x.bandwidth() / 2 - d3.select(this).node().getComputedTextLength() / 2;
                }
                else {
                    return x(d["Contexte d'exposition probable"]) + x.bandwidth() / 2 - d3.select(this).node().getComputedTextLength() / 2;
                }
            })
            .attr("font-size", 24)
            .attr("y", function(d) { return y(d["Proportion of cases"]) - 7 });



        if (language == "en") {
            xAxisTitle.text("Probable exposure setting");
        }
        else {
            xAxisTitle.text("Contexte d'exposition probable");
        }

        if (language == "en") {
            yAxisTitle.text("Proportion of cases (%)");
        }
        else {
            yAxisTitle.text("Proportion de cas (%)");
        }

        const rows = d3.select(".probable-exposure-data").selectAll("tr").data(data.filter(function(d) {
            return d["graph"] != "0";
        })).enter().append("tr");
        for (let key in data[0]) {
            if (key != "domestic" && key != "graph" && key != "Number of cases") {
                if (language == "en") {
                    if (key != "Contexte d'exposition probable") {
                        rows.append("td").text(function(d) {
                            if (key == "Probable exposure setting") {
                                return d[key];
                            }
                            else {
                                if (key == "Proportion of cases") {
                                    return numberFormat(d[key]) + "%";
                                }
                                else {
                                    if (d[key] == "") {
                                        return "N/A";
                                    }
                                    else {
                                        return numberFormat(d[key]);
                                    }
                                }
                            }
                        });
                    }
                }
                else {
                    if (key != "Probable exposure setting") {
                        rows.append("td").text(function(d) {
                            if (key == "Contexte d'exposition probable") {
                                return d[key];
                            }
                            else {
                                if (key == "Proportion of cases") {
                                    return numberFormat(d[key]) + " %";
                                }
                                else {
                                    if (d[key] == "") {
                                        return "n.d.";
                                    }
                                    else {
                                        return numberFormat(d[key]);
                                    }
                                }
                            }
                        });
                    }

                }
            }
        }


        /* d3.select("#spread").text(numberFormat(data.find(function(element) { return element["Probable exposure setting"] === "Spread" })["Number of cases"]));
        d3.select("#percentSpread").text(d3.format(".1f")(data.find(function(element) { return element["Probable exposure setting"] === "Spread" })["Proportion of cases"]));
        d3.select("#spreadContact").text(numberFormat(data.find(function(element) { return element["Probable exposure setting"] === "Domestic acquisition: Contact with COVID case" })["Number of cases"]));
        d3.select("#percentSpreadContact").text(d3.format(".1f")(data.find(function(element) { return element["Probable exposure setting"] === "Domestic acquisition: Contact with COVID case" })["Proportion of cases"]));
        d3.select("#spreadTraveller").text(numberFormat(data.find(function(element) { return element["Probable exposure setting"] === "Domestic acquisition: Contact with traveller" })["Number of cases"]));
        d3.select("#percentSpreadTraveller").text(d3.format(".1f")(data.find(function(element) { return element["Probable exposure setting"] === "Domestic acquisition: Contact with traveller" })["Proportion of cases"]));
        d3.select("#spreadUnknown").text(numberFormat(data.find(function(element) { return element["Probable exposure setting"] === "Domestic acquisition: Unknown source" })["Number of cases"]));
        d3.select("#percentSpreadUnknown").text(d3.format(".1f")(data.find(function(element) { return element["Probable exposure setting"] === "Domestic acquisition: Unknown source" })["Proportion of cases"]));
        d3.select("#unknownPending").text(numberFormat(data.find(function(element) { return element["Probable exposure setting"] === "Information pending" })["Number of cases"]));
        d3.select("#percentUnknownPending").text(d3.format(".1f")(data.find(function(element) { return element["Probable exposure setting"] === "Information pending" })["Proportion of cases"]));
        d3.select("#travelled").text(numberFormat(data.find(function(element) { return element["Probable exposure setting"] === "International travel" })["Number of cases"]));
        d3.select("#percentTravelled").text(d3.format(".1f")(data.find(function(element) { return element["Probable exposure setting"] === "International travel" })["Proportion of cases"]));
		
		d3.csv("/src/data/covidLive/covid19-nTotal.csv",function(nTotal){
			N0 = +nTotal.columns[0];
			d3.select(".N6").text(numberFormat(data.find(function(element) { return element["Probable exposure setting"] === "Cases with probable exposure data" })["Number of cases"]));
			d3.select(".N6Percent").text(d3.format(".1f")(data.find(function(element) { return element["Probable exposure setting"] === "Cases with probable exposure data" })["Number of cases"]/N0*100));
		})
    }

    d3.csv("/src/data/covidLive/covid19-epiSummary-probableexposure2.csv", function(data) {
        drawGraph(data, "Proportion of cases");
    }); */

        //Dropdown in Exposure Setting Section
        var exposureDropdown = d3.select("#exposureDropdown").node().value;
        exposureText(exposureDropdown);
        //On Change
        d3.select("#exposureDropdown").on("change", function() {
            exposureDropdown = d3.select("#exposureDropdown").node().value;
            d3.select("#textArticle2").text(function() {
                if (language == "en") {
                    return "In ";
                }
                else {
                    if (exposureDropdown == "10") {
                        return "À ";
                    }
                    else if (exposureDropdown == "11") {
                        return "À l'";
                    }
                    else if ((exposureDropdown == "12") || (exposureDropdown == "35") || (exposureDropdown == "47") || (exposureDropdown == "48") || (exposureDropdown == "59")) {
                        return "En ";
                    }
                    else if ((exposureDropdown == "13") || (exposureDropdown == "24") || (exposureDropdown == "46") || (exposureDropdown == "60") || (exposureDropdown == "62")) {
                        return "Au ";
                    }
                    else if (exposureDropdown == "61") {
                        return "Aux ";
                    }
                    return "Au ";
                }
            });
            exposureText(exposureDropdown);
        })

        function exposureText(exposureDropdown) {
            var exposureSelectionData = data.filter(function(element) { return element["pruid"] == exposureDropdown })
            d3.select("#spread").text(numberFormat(exposureSelectionData.find(function(element) { return element["Probable exposure setting"] === "Spread" })["Number of cases"]));
            d3.select("#percentSpread").text(d3.format(".1f")(exposureSelectionData.find(function(element) { return element["Probable exposure setting"] === "Spread" })["Proportion of cases"]));
            d3.select("#spreadContact").text(numberFormat(exposureSelectionData.find(function(element) { return element["Probable exposure setting"] === "Domestic acquisition: Contact with COVID case" })["Number of cases"]));
            d3.select("#percentSpreadContact").text(d3.format(".1f")(exposureSelectionData.find(function(element) { return element["Probable exposure setting"] === "Domestic acquisition: Contact with COVID case" })["Proportion of cases"]));
            d3.select("#spreadTraveller").text(numberFormat(exposureSelectionData.find(function(element) { return element["Probable exposure setting"] === "Domestic acquisition: Contact with traveller" })["Number of cases"]));
            d3.select("#percentSpreadTraveller").text(d3.format(".1f")(exposureSelectionData.find(function(element) { return element["Probable exposure setting"] === "Domestic acquisition: Contact with traveller" })["Proportion of cases"]));
            d3.select("#spreadUnknown").text(numberFormat(exposureSelectionData.find(function(element) { return element["Probable exposure setting"] === "Domestic acquisition: Unknown source" })["Number of cases"]));
            d3.select("#percentSpreadUnknown").text(d3.format(".1f")(exposureSelectionData.find(function(element) { return element["Probable exposure setting"] === "Domestic acquisition: Unknown source" })["Proportion of cases"]));
            d3.select("#unknownPending").text(numberFormat(exposureSelectionData.find(function(element) { return element["Probable exposure setting"] === "Information pending" })["Number of cases"]));
            d3.select("#percentUnknownPending").text(d3.format(".1f")(exposureSelectionData.find(function(element) { return element["Probable exposure setting"] === "Information pending" })["Proportion of cases"]));
            d3.select("#travelled").text(numberFormat(exposureSelectionData.find(function(element) { return element["Probable exposure setting"] === "International travel" })["Number of cases"]));
            d3.select("#percentTravelled").text(d3.format(".1f")(exposureSelectionData.find(function(element) { return element["Probable exposure setting"] === "International travel" })["Proportion of cases"]));
            //NEED n0 for all regions (will have to modify the nTotal sheet or add new "total cases" lines to the exposure setting tab)
            d3.csv("/src/data/covidLive/covid19-nTotal.csv", function(nTotal) {
                // 	N0 = +nTotal.columns[0];
                N0 = +exposureSelectionData[0]["NTotal"];
                d3.select("#N0exposure").text(numberFormat(N0));
            })
        }
    }

    // d3.csv("/src/data/covidLive/covid19-epiSummary-exposureByPT.csv", function(dataExposureByPT) {
    drawGraph(dataExposureByPT, "Proportion of cases");
    // });
};


//Symptoms
function epiSummarySymptoms() {
    // d3.csv("/src/data/covidLive/covid19-epiSummary-symptoms.csv", function(data) {
    let percentCough = dataSymptoms.find(function(element) { return element["symptom"] === "cough" })["percentage"];
    let percentWeakness = dataSymptoms.find(function(element) { return element["symptom"] === "fever and chills" })["percentage"];
    let percentHeadache = dataSymptoms.find(function(element) { return element["symptom"] === "headaches" })["percentage"];

    d3.select("#percentCough").text(percentCough);
    d3.select("#percentWeakness").text(percentWeakness);
    d3.select("#percentHeadache").text(percentHeadache);
    // });
}

//Hospitalization
function Hospitalization() {
    //csv data should like this
    //  d3.csv("/src/data/covidLive/covid19-epiSummary-severityAge.csv", function(hospitalizationData) {



    let isIE = /*@cc_on!@*/ false || !!document.documentMode;
    if (/Edge\/\d./i.test(navigator.userAgent))
        isIE = true;

    hospitalizationData.forEach(function(d) {
        d["All Hospitalizations"] = +d["All Hospitalizations"];
        d["Admitted to ICU"] = +d["Admitted to ICU"];
        if (d["Deceased"] != "NA")
            d["Deceased"] = +d["Deceased"];
    });

    const columns = ["Age groups", "All Hospitalizations", "Admitted to ICU", "Deceased"];
    let columnLabels = [];
    if (language == "en") {
        columnLabels = ["Age groups", "All Hospitalizations", "Admitted to ICU", "Deceased"];
    }
    else {
        columnLabels = ["Groupes d'âge", "Toutes les hospitalisations", "Admis aux soins intensifs", "Décès"];
    }

    let hospitalTotal = 0;
    let ICUTotal = 0;
    let deathTotal = 0;

    hospitalizationData.forEach(function(d, i) {
        if (d["Age groups"] != "Total") {

            hospitalTotal += d["All Hospitalizations"];
            ICUTotal += d["Admitted to ICU"];
            if (d["Deceased"] != "NA")
                deathTotal += d["Deceased"];
        }
    })


    let hospitalizationDataPercentages = [];
    let totalObj = {};

    hospitalizationData.forEach(function(d, i) {
        if (d["Age groups"] != "Total") {
            let percentObj = {};
            percentObj["Age groups"] = d["Age groups"];
            percentObj["All Hospitalizations"] = parseFloat((d["All Hospitalizations"] / hospitalTotal));
            percentObj["Admitted to ICU"] = parseFloat((d["Admitted to ICU"] / ICUTotal));
            if (d["Deceased"] != "NA")
                percentObj["Deceased"] = parseFloat((d["Deceased"] / deathTotal));
            else
                percentObj["Deceased"] = 0;

            hospitalizationDataPercentages.push(percentObj);
        }
        else {
            totalObj["Age groups"] = d["Age groups"];
            totalObj["All Hospitalizations"] = parseFloat((d["All Hospitalizations"] / hospitalTotal));
            totalObj["Admitted to ICU"] = parseFloat((d["Admitted to ICU"] / ICUTotal));
            totalObj["Deceased"] = parseFloat((d["Deceased"] / deathTotal));
        }
    })



    var svg = d3.select("#graphHospital"),
        margin = { top: 20, right: 20, bottom: 60, left: 90 },
        width = 1140 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.select("#graphHospital")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1140 500")
        .attr("width", function(d) {
            if (isIE) {
                return (width + margin.left + margin.right);
            }
            else {
                return;
            }
        })
        .attr("height", function(d) {
            if (isIE) {
                return (height + margin.top + margin.bottom);
            }
            else {
                return;
            }
        });
    // The scale spacing the groups:
    var x0 = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1);

    // The scale for spacing each group's bar:
    var x1 = d3.scaleBand()
        .padding(0.05);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    //change this to a json => drug: color
    var z = d3.scaleOrdinal(d3.schemeCategory10);

    var keys = columns.slice(1);
    var keysLabel = columnLabels.slice(1);

    let xAxisTitle = svg.append("text")
        .attr("transform", "translate(" + ((width / 2) + margin.left) + " ," + (height + margin.top + 50) + ")")
        .style("text-anchor", "middle")
        .attr("class", "x-axis-title")
        .text(function(d, i) {
            if (language == "en") {
                return "Age group (years)";
            }
            else {
                return "Groupe d'âge (années)";
            }
        });
    let yAxisTitle = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", (0 + margin.left / 4) - 10)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "y-axis-title")
        .text(function(d, i) {
            if (language == "en") {
                return "Proportion of cases (%)";
            }
            else {
                return "Proportion de cas (%)";
            }
        });


    x0.domain(hospitalizationDataPercentages.map(function(d) { return d["Age groups"]; }));
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    y.domain([0, 1]).nice();
    // y.domain([0, d3.max(hospitalizationDataPercentages, function(d) { return d3.max(keys, function(key) { return d[key]; }); })+.20]).nice();


    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0))
        .selectAll("text")
        // .style("font-size", 16)
        .attr("fill", "black")
        .attr("stroke", "none");

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y).ticks(null, ".0%"))
        .selectAll("text")
        // .style("font-size", 16)
        .attr("fill", "black")
        .attr("stroke", "none")
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")

    svg.select('.y').selectAll(".tick")
        .select("line")
        .style("stroke", "#e5e5e5")
        .attr('x2', width);

    g.append("g")
        .selectAll("g")
        .data(hospitalizationDataPercentages)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x0(d["Age groups"]) + ",0)"; })
        .attr("height", "100%")
        .attr("pointer-events", "none")
        .selectAll("rect")
        .data(function(d) { return keys.map(function(key) { return { key: key, value: d[key] }; }); })
        .enter().append("rect")
        .attr("x", function(d) { return x1(d.key); })
        .attr("y", function(d) {
            if (d["Deceased"] == "NA")
                return y(0);
            return y(d.value);
        })
        .attr("width", x1.bandwidth())
        .attr("height", function(d) {
            if (d["Deceased"] == "NA")
                return 0
            return height - y(d.value);
        })
        .attr("fill", function(d) { return z(d.key); })
        .attr("stroke-width", 0)

    d3.select("#graphHospital").selectAll(".bar").selectAll("text")
        .data(function(d) {
            return keys.map(function(key) { return { key: key, value: d[key] }; });
        })
        .enter().append("text")
        .text(function(d) {
            let languageFormat = "";
            if (language == "fr") {
                languageFormat = " ";
            }
            return (d.value * 100).toFixed(1) + languageFormat + "%"
        })
        .attr("x", function(d) {
            return x1(d.key) + x1.bandwidth() / 2 - d3.select(this).node().getComputedTextLength() / 2 + 2;
        })
        .attr("font-size", 16)
        .attr("fill", "black")
        .attr("stroke", "none")
        .attr("y", function(d) {
            if (d["Deceased"] == "NA")
                return y(0) - 7

            return y(d.value) - 7

        });

    var legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 14)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 17)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", z)
        .attr("stroke", z)
        .attr("stroke-width", 2)
        .on("click", function(d) { update(d) });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .attr("fill", "black")
        .text(function(d, i) { return keysLabel[i]; });


    // {"Age groups":"≤ 19","All Hospitalizations":33,"Admitted to ICU":2,"Deceased":0},

    hospitalizationDataPercentages.push(totalObj);

    const rows = d3.select(".hospitalization-data").selectAll("tr").data(hospitalizationDataPercentages.reverse()).enter().append("tr");
    for (let key in hospitalizationDataPercentages[0]) {
        if (key == "Age groups" || key == "All Hospitalizations" || key == "Admitted to ICU" || key == "Deceased") {
            rows.append("td").text(function(d, i) {
                function percentSign(value) {
                    if (language == "fr") {
                        return value.replace("%", " %");
                    }
                    else {
                        return value;
                    }
                }

                if (key == "All Hospitalizations") {

                    return numberFormat(hospitalizationData[i][key])
                }
                else if (key == "Admitted to ICU") {
                    return numberFormat(hospitalizationData[i][key])
                }
                else if (key == "Deceased") {
                    if (isNaN(hospitalizationData[i][key]))
                        return hospitalizationData[i][key]

                    return numberFormat(hospitalizationData[i][key])
                }
                else {
                    return d[key];
                }
            })
        }

        if (key != "Age groups") {
            rows.append("td").text(function(d, i) {
                function percentSign(value) {
                    if (language == "fr") {
                        return value.replace("%", " %");
                    }
                    else {
                        return value;
                    }
                }

                if (key == "All Hospitalizations") {

                    return (d["All Hospitalizations"] * 100).toFixed(1) + "%"
                }
                else if (key == "Admitted to ICU") {
                    return (d["Admitted to ICU"] * 100).toFixed(1) + "%"
                }
                else if (key == "Deceased") {
                    return (d["Deceased"] * 100).toFixed(1) + "%"
                }
                else {
                    return d[key];
                }
            })
        }
    }

    var filtered = [];

    ////
    //// Update and transition on click:
    ////

    function update(d) {
        //
        // Update the array to filter the chart by:
        //

        // add the clicked key if not included:
        if (filtered.indexOf(d) == -1) {
            filtered.push(d);
            // if all bars are un-checked, reset:
            if (filtered.length == keys.length) filtered = [];
        }
        // otherwise remove it:
        else {
            filtered.splice(filtered.indexOf(d), 1);
        }

        //
        // Update the scales for each group(/states)'s items:
        //
        var newKeys = [];
        keys.forEach(function(d) {
            if (filtered.indexOf(d) == -1) {
                newKeys.push(d);
            }
        })
        x1.domain(newKeys).rangeRound([0, x0.bandwidth()]);
        // y.domain([0, d3.max(filtered, function(d) { return d3.max(keys, function(key) { return d[key]; }); })+.20]).nice();

        // // update the y axis:
        // svg.select(".y")
        //     .transition()
        //     .call(d3.axisLeft(y).ticks(null, ".0%"))
        //     .duration(500);


        //
        // Filter out the bands that need to be hidden:
        //
        var bars = svg.selectAll(".bar").selectAll("rect")
            .data(function(d) { return keys.map(function(key) { return { key: key, value: d[key] }; }); })

        var percents = svg.selectAll(".bar").selectAll("text")
            .data(function(d) { return keys.map(function(key) { return { key: key, value: d[key] }; }); })


        bars.filter(function(d) {
                return filtered.indexOf(d.key) > -1;
            })
            .transition()
            .attr("x", function(d) {
                return (+d3.select(this).attr("x")) + (+d3.select(this).attr("width")) / 2;
            })
            .attr("height", 0)
            .attr("width", 0)
            .attr("y", function(d) { return height; })
            .duration(500);

        percents.filter(function(d) {
                return filtered.indexOf(d.key) > -1;
            })
            .transition()
            .attr("opacity", 0)
            .attr("y", function(d) { return height; })
            .duration(500);

        //
        // Adjust the remaining bars:
        //
        bars.filter(function(d) {
                return filtered.indexOf(d.key) == -1;
            })
            .transition()
            .attr("x", function(d) { return x1(d.key); })
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })
            .attr("width", x1.bandwidth())
            .attr("fill", function(d) { return z(d.key); })
            .duration(500);

        percents.filter(function(d) {
                return filtered.indexOf(d.key) == -1;
            })
            .transition()

            .attr("x", function(d) {
                return x1(d.key) + x1.bandwidth() / 2 - d3.select(this).node().getComputedTextLength() / 2;
            })
            .attr("opacity", 1)
            .attr("font-size", 14)
            .attr("fill", "black")
            .attr("stroke", "none")
            .attr("y", function(d) { return y(d.value) - 7 })
            .duration(500);

        // update legend:
        legend.selectAll("rect")
            .transition()
            .attr("fill", function(d) {
                if (filtered.length) {
                    if (filtered.indexOf(d) == -1) {
                        return z(d);
                    }
                    else {
                        return "white";
                    }
                }
                else {
                    return z(d);
                }
            })
            .duration(100);
    }
    //  });
}

//Hospitalization
function HospitalizationSex() {
    //csv data should like this


    // d3.csv("/src/data/covidLive/covid19-epiSummary-severityGender.csv", function(hospitalizationDataSex) {


    let columns = ["Gender", "Genre", "All Hospitalizations", "Admitted to ICU", "Deceased"];
    let columnLabels = [];
    if (language == "en") {
        columnLabels = ["Gender", "Genre", "All Hospitalizations", "Admitted to ICU", "Deceased"];
    }
    else {
        columnLabels = ["Genre", "Genre", "Toutes les hospitalisations", "Admis aux soins intensifs", "Décès"];
    }

    hospitalizationDataSex.forEach(function(d) {
        d["All Hospitalizations"] = +d["All Hospitalizations"];
        d["Admitted to ICU"] = +d["Admitted to ICU"];
        if (d["Deceased"] != "NA")
            d["Deceased"] = +d["Deceased"];
    });

    let hospitalTotal = 0;
    let ICUTotal = 0;
    let deathTotal = 0;

    hospitalizationDataSex.forEach(function(d, i) {
        if (d["Gender"] != "Total") {
            hospitalTotal += d["All Hospitalizations"];
            ICUTotal += d["Admitted to ICU"];
            if (d["Deceased"] != "NA")
                deathTotal += d["Deceased"];
        }
    })


    let hospitalizationDataPercentages = [];
    let totalObj = {};

    hospitalizationDataSex.forEach(function(d, i) {
        if (d["Gender"] != "Total") {
            let percentObj = {};
            percentObj["Gender"] = d["Gender"];
            percentObj["Genre"] = d["Genre"];
            percentObj["All Hospitalizations"] = parseFloat((d["All Hospitalizations"] / hospitalTotal));
            percentObj["Admitted to ICU"] = parseFloat((d["Admitted to ICU"] / ICUTotal));
            percentObj["Deceased"] = parseFloat((d["Deceased"] / deathTotal));

            hospitalizationDataPercentages.push(percentObj);
        }
        else {
            totalObj["Gender"] = d["Gender"];
            totalObj["Genre"] = d["Genre"];
            totalObj["All Hospitalizations"] = parseFloat((d["All Hospitalizations"] / hospitalTotal));
            totalObj["Admitted to ICU"] = parseFloat((d["Admitted to ICU"] / ICUTotal));
            totalObj["Deceased"] = parseFloat((d["Deceased"] / deathTotal));
        }
    })



    var svg = d3.select("#graphHospitalBySex"),
        margin = { top: 20, right: 20, bottom: 60, left: 90 },
        width = 1140 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.select("#graphHospitalBySex")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1140 500").attr("width", function(d) {
            if (isIE) {
                return (width + margin.left + margin.right);
            }
            else {
                return;
            }
        })
        .attr("height", function(d) {
            if (isIE) {
                return (height + margin.top + margin.bottom);
            }
            else {
                return;
            }
        });
    // The scale spacing the groups:
    var x0 = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1);

    // The scale for spacing each group's bar:
    var x1 = d3.scaleBand()
        .padding(0.05);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    //change this to a json => drug: color
    var z = d3.scaleOrdinal(d3.schemeCategory10);

    var keys = columns.slice(2);
    var keysLabel = columnLabels.slice(2);

    let xAxisTitle = svg.append("text")
        .attr("transform", "translate(" + ((width / 2) + margin.left) + " ," + (height + margin.top + 50) + ")")
        .style("text-anchor", "middle")
        .attr("class", "x-axis-title")
        .text(function(d, i) {
            if (language == "en") {
                return "Gender";
            }
            else {
                return "Genre";
            }
        });

    let yAxisTitle = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", (0 + margin.left / 4) - 10)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "y-axis-title")
        .text(function(d, i) {
            if (language == "en") {
                return "Proportion of cases (%)";
            }
            else {
                return "Proportion de cas (%)";
            }
        });

    let genderENFR;
    if (language == "en") {
        genderENFR = "Gender";
    }
    else {
        genderENFR = "Genre";
    }
    x0.domain(hospitalizationDataPercentages.map(function(d) { return d[genderENFR]; }));
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    y.domain([0, 1]).nice();
    // y.domain([0, d3.max(hospitalizationDataPercentages, function(d) { return d3.max(keys, function(key) { return d[key]; }); })+.20]).nice();

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0))
        .selectAll("text")
        // .style("font-size", 14)
        .attr("fill", "black")
        .attr("stroke", "none");

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y).ticks(null, ".0%"))
        .selectAll("text")
        // .style("font-size", 14)
        .attr("fill", "black")
        .attr("stroke", "none")
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")

    svg.select('.y').selectAll(".tick")
        .select("line")
        .style("stroke", "#e5e5e5")
        .attr('x2', width);

    g.append("g")
        .selectAll("g")
        .data(hospitalizationDataPercentages)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x0(d[genderENFR]) + ",0)"; })
        .attr("height", "100%")
        .attr("pointer-events", "none")
        .selectAll("rect")
        .data(function(d) { return keys.map(function(key) { return { key: key, value: d[key] }; }); })
        .enter().append("rect")
        .attr("x", function(d) { return x1(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x1.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", function(d) { return z(d.key); })
        .attr("stroke-width", 0)

    d3.select("#graphHospitalBySex").selectAll(".bar").selectAll("text")
        .data(function(d) {
            return keys.map(function(key) { return { key: key, value: d[key] }; });
        })
        .enter().append("text")
        .text(function(d) {
            let languageFormat = "";
            if (language == "fr") {
                languageFormat = " ";
            }
            return (d.value * 100).toFixed(1) + languageFormat + "%"
        })
        .attr("x", function(d) {
            return x1(d.key) + x1.bandwidth() / 2 - d3.select(this).node().getComputedTextLength() / 2 - 16;
        })
        // .attr("font-size", 14)
        .attr("fill", "black")
        .attr("stroke", "none")
        .attr("y", function(d) { return y(d.value) - 7 });

    var legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 14)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 17)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", z)
        .attr("stroke", z)
        .attr("stroke-width", 2)
        .on("click", function(d) { update(d) });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .attr("fill", "black")
        .text(function(d, i) { return keysLabel[i]; });


    // {"Age groups":"≤ 19","All Hospitalizations":33,"Admitted to ICU":2,"Deceased":0},

    hospitalizationDataPercentages.push(totalObj);
    const rows = d3.select(".hospitalization-data-sex").selectAll("tr").data(hospitalizationDataPercentages.reverse()).enter().append("tr");
    for (let key in hospitalizationDataPercentages[0]) {
        if (key == genderENFR || key == "All Hospitalizations" || key == "Admitted to ICU" || key == "Deceased") {
            rows.append("td").text(function(d, i) {
                function percentSign(value) {
                    if (language == "fr") {
                        return value.replace("%", " %");
                    }
                    else {
                        return value;
                    }
                }

                if (key == "All Hospitalizations") {

                    return numberFormat(hospitalizationDataSex[i][key])
                }
                else if (key == "Admitted to ICU") {
                    return numberFormat(hospitalizationDataSex[i][key])
                }
                else if (key == "Deceased") {
                    return numberFormat(hospitalizationDataSex[i][key])
                }
                else {
                    return d[key];
                }
            })
        }
        if (key != "Gender" && key != "Genre") {
            rows.append("td").text(function(d, i) {
                function percentSign(value) {
                    if (language == "fr") {
                        return value.replace("%", " %");
                    }
                    else {
                        return value;
                    }
                }

                if (key == "All Hospitalizations") {

                    return (d["All Hospitalizations"] * 100).toFixed(1) + "%"
                }
                else if (key == "Admitted to ICU") {
                    return (d["Admitted to ICU"] * 100).toFixed(1) + "%"
                }
                else if (key == "Deceased") {
                    return (d["Deceased"] * 100).toFixed(1) + "%"
                }
                else {
                    return d[key];
                }
            })
        }
    }

    var filtered = [];

    ////
    //// Update and transition on click:
    ////

    function update(d) {

        //
        // Update the array to filter the chart by:
        //

        // add the clicked key if not included:
        if (filtered.indexOf(d) == -1) {
            filtered.push(d);
            // if all bars are un-checked, reset:
            if (filtered.length == keys.length) filtered = [];
        }
        // otherwise remove it:
        else {
            filtered.splice(filtered.indexOf(d), 1);
        }

        //
        // Update the scales for each group(/states)'s items:
        //
        var newKeys = [];
        keys.forEach(function(d) {
            if (filtered.indexOf(d) == -1) {
                newKeys.push(d);
            }
        })
        x1.domain(newKeys).rangeRound([0, x0.bandwidth()]);
        // y.domain([0, d3.max(filtered, function(d) { return d3.max(keys, function(key) { return d[key]; }); })+.20]).nice();

        // // update the y axis:
        // svg.select(".y")
        //     .transition()
        //     .call(d3.axisLeft(y).ticks(null, ".0%"))
        //     .duration(500);


        //
        // Filter out the bands that need to be hidden:
        //
        var bars = svg.selectAll(".bar").selectAll("rect")
            .data(function(d) { return keys.map(function(key) { return { key: key, value: d[key] }; }); })

        var percents = svg.selectAll(".bar").selectAll("text")
            .data(function(d) { return keys.map(function(key) { return { key: key, value: d[key] }; }); })


        bars.filter(function(d) {
                return filtered.indexOf(d.key) > -1;
            })
            .transition()
            .attr("x", function(d) {
                return (+d3.select(this).attr("x")) + (+d3.select(this).attr("width")) / 2;
            })
            .attr("height", 0)
            .attr("width", 0)
            .attr("y", function(d) { return height; })
            .duration(500);

        percents.filter(function(d) {
                return filtered.indexOf(d.key) > -1;
            })
            .transition()
            .attr("opacity", 0)
            .attr("y", function(d) { return height; })
            .duration(500);

        //
        // Adjust the remaining bars:
        //
        bars.filter(function(d) {
                return filtered.indexOf(d.key) == -1;
            })
            .transition()
            .attr("x", function(d) { return x1(d.key); })
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })
            .attr("width", x1.bandwidth())
            .attr("fill", function(d) { return z(d.key); })
            .duration(500);

        percents.filter(function(d) {
                return filtered.indexOf(d.key) == -1;
            })
            .transition()
            .attr("x", function(d) {
                return x1(d.key) + x1.bandwidth() / 2 - d3.select(this).node().getComputedTextLength() / 2;
            })
            .attr("opacity", 1)
            .attr("font-size", 14)
            .attr("fill", "black")
            .attr("stroke", "none")
            .attr("y", function(d) { return y(d.value) - 7 })
            .duration(500);

        // update legend:
        legend.selectAll("rect")
            .transition()
            .attr("fill", function(d) {
                if (filtered.length) {
                    if (filtered.indexOf(d) == -1) {
                        return z(d);
                    }
                    else {
                        return "white";
                    }
                }
                else {
                    return z(d);
                }
            })
            .duration(100);
    }
    //  });
}

function demographics() {

    function drawDemo(chartID, data) {
        if (chartID == "age") {
            chart = d3.select("#demo-age");
        }
        else {
            chart = d3.select("#demo-age-gender");
        }
        chart.attr("viewBox", "0 0 820 350").attr("preserveAspectRatio", "xMinYMin meet")

        // set the dimensions and margins of the graph
        var margin = { top: 20, right: 20, bottom: 60, left: 70 },
            width = 800 - margin.left - margin.right,
            height = 350 - margin.top - margin.bottom;

        let isIE = /*@cc_on!@*/ false || !!document.documentMode;
        if (/Edge\/\d./i.test(navigator.userAgent))
            isIE = true;

        chart.attr("width", function(d) {
                if (isIE) {
                    return (width + margin.left + margin.right);
                }
                else {
                    return;
                }
            })
            .attr("height", function(d) {
                if (isIE) {
                    return (height + margin.top + margin.bottom);
                }
                else {
                    return;
                }
            })

        // set the ranges
        var y = d3.scaleBand()
            .range([height, 0])
            .padding(0.35);

        var x = d3.scaleLinear()
            .range([0, width]);

        var color = d3.scaleOrdinal()
            .range(["#015B7E", "#bdd7e7", "#000"]);

        // append the svg object to the body of the page
        // append a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        var svg = chart
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Scale the range of the data in the domains
        x.domain([0, d3.max(data, function(d) { return +d["Number of cases with case reports"] * 1.15; })])
        y.domain(data.map(function(d) { return d["Age group (years)"]; }));

        // add the x Axis
        const xAxis = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        const yAxis = svg.append("g")
            .call(d3.axisLeft(y));

        var dataColumn;
        if (language == "en") {
            dataColumn = "Number (Proportion (%))";
        }
        else {
            dataColumn = "Nombre (proportion (%))";
        }

        svg.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top + 15) + ")")
            .style("text-anchor", "middle")
            .text(dataColumn)
            .attr("font-size", 14);

        svg.append("text")
            .attr("transform",
                "translate(" + (-43) + "," +
                (height / 2) + ") rotate(-90)")
            .style("text-anchor", "start")
            .text(function() {
                if (language == "en") {
                    return "Age group (years)";
                }
                else {
                    return "Groupe d'âge (années)";
                }
            })
            .style("text-anchor", "middle")
            .attr("font-size", 14);

        const ticks = xAxis.selectAll(".tick line");
        ticks.attr("y2", -height);
        ticks.attr("stroke", "#e5e5e5");

        yAxis.selectAll(".tick line").style("display", "none");

        svg.selectAll(".domain").style("display", "none");

        // Get highest sex and age group percentages
        // format the data
        var dataGraph;
        if (chartID == "gender") {

            color.domain(["Males", "Females", "Other"]);

            data.forEach(function(d) {
                var myagegroup = d["Age group (years)"]; //add to stock code
                var x0 = 0;
                d.sex = color.domain().map(function(name) {
                    return {
                        myagegroup: myagegroup,
                        name: name,
                        x0: x0,
                        x1: x0 += +d[name],
                        value: +d[name],
                        valueMale: +d["Males"],
                        valueFemale: +d["Females"],
                        valueOther: +d["Other"],
                        x_corrected: 0
                    };
                });
                d.total = d.sex[d.sex.length - 1].x1;
            })

            //This is the legend
            if (d3.select(".legendSexAgeChart").size() == 0) {
                const gLegendChart = svg.append("g").attr("class", "legendSexAgeChart")

                const legendSexAgeChart = gLegendChart.selectAll("legChart")
                    .data(function() {
                        if (language == "en") {
                            return ["Male", "Female", "Other"];
                        }
                        else {
                            return ["Homme", "Femme", "Autre"];
                        }
                    })
                    .enter().append("g")
                    .attr("id", function(d, i) { return "leg" + i; })
                    .attr("class", "legSexAge")
                    .attr("transform", "translate(490,-10)")

                let j = 0;
                let j2 = 13;
                legendSexAgeChart.append("text")
                    .text(function(d, i) {
                        return d;
                    })
                    .attr("font-size", "15px")
                    .style("text-anchor", "end")
                    //.attr("x", (z.range()[0]+10))
                    .attr("transform", function(d, i) { if (language == "en") { j2 = 13; } else { j2 = 16; } j = j + (d.length * j2); return "translate(" + (+j - 15) + ",12)"; })

                j = 0;
                j2 = 13;
                legendSexAgeChart.append("rect")
                    .attr("height", 12)
                    .attr("x", function(d, i) { if (language == "en") { j2 = 13; } else { j2 = 16; } j = j + (d.length * j2); return ((+j - 15) + 6); })
                    .attr("transform", "translate(0,1)")
                    .attr("width", 12)
                    .attr("fill", function(d, i) { return color(i); })
                    .attr("stroke", "#828080");
            }
            $(".legendSexAgeChart").css("display", "block");

        }
        else {
            color.domain("Totals");

            data.forEach(function(d) {
                var myagegroup = d["Age group (years)"]; //add to stock code
                var x0 = 0;
                d.sex = {
                    myagegroup: myagegroup,
                    name: "Number of cases with case reports",
                    x0: x0,
                    x1: x0 += +d["Number of cases with case reports"],
                    value: +d["Number of cases with case reports"],
                    x_corrected: 0
                };
                d.total = d.sex.x1;
            })

            $(".legendSexAgeChart").css("display", "none");
        }

        function valueAge(item) {
            return item["Number of cases with case reports"];
        }

        function valueOldAge(item) {
            if (item["Age group (years)"] == "60-69" || item["Age group (years)"] == "70-79" || item["Age group (years)"] == "80+") {
                return item["Number of cases with case reports"];
            }
            else {
                return 0;
            }
        }

        function valueMales(item) {
            return item.Males;
        }

        function valueFemales(item) {
            return item.Females;
        }

        function sum(prev, next) {
            return prev + next;
        }

        function getPercentageText(value) {
            if (language == "en") {
                if (value >= 0.45) {
                    return "half";
                }
                else if (value >= 0.30) {
                    return "one-third";
                }
                else if (value >= 0.22) {
                    return "one-quarter";
                }
                else if (value >= 0.18) {
                    return "one-fifth";
                }
            }
            else {
                if (value >= 0.45) {
                    return "la moitié";
                }
                else if (value >= 0.30) {
                    return "un tiers";
                }
                else if (value >= 0.22) {
                    return "un quart";
                }
                else if (value >= 0.18) {
                    return "un cinquième";
                }
            }
        }

        var maxMales = data.map(valueMales).reduce(sum) / (data.map(valueMales).reduce(sum) + data.map(valueFemales).reduce(sum));
        var maxFemales = data.map(valueFemales).reduce(sum) / (data.map(valueMales).reduce(sum) + data.map(valueFemales).reduce(sum));
        var sexMost;
        if (maxMales > maxFemales) {
            if (language == "en") {
                $("#percentSex").text(d3.format(".1%")(maxMales));
                $("#sex").text("male");
            }
            else {
                $("#percentSex").text(d3.format(".1%")(maxMales).replace("%", " %"));
                $("#sex").text("hommes");
            }
            sexMost = data.map(valueMales).reduce(sum) / (data.map(valueMales).reduce(sum) + data.map(valueFemales).reduce(sum));
        }
        else if (maxMales == maxFemales) {
            if (language == "en") {
                $("#sex").text("female");
            }
            else {
                $("#percentSex").text(d3.format(".1%")(maxFemales));
                $("#sex").text("femmes");
            }
        }
        else {
            if (language == "en") {
                $("#percentSex").text(d3.format(".1%")(maxFemales));
                $("#sex").text("female");
            }
            else {
                $("#percentSex").text(d3.format(".1%")(maxFemales).replace("%", " %"));
                $("#sex").text("femmes");
            }
            sexMost = data.map(valueFemales).reduce(sum) / (data.map(valueMales).reduce(sum) + data.map(valueFemales).reduce(sum));
        }
        $("#fractionSex").text(getPercentageText(sexMost));

        var maxOldAge = data.map(valueOldAge).reduce(sum) / data.map(valueAge).reduce(sum);
        if (language == "en") {
            $("#percentOver60").text(d3.format(".1%")(maxOldAge));
        }
        else {
            $("#percentOver60").text(d3.format(".1%")(maxOldAge).replace("%", " %"));
        }
        $("#fractionOver60").text(getPercentageText(maxOldAge));

        ages = svg.selectAll(".agesg")
            .data(data)
            .enter().append("g")
            .attr("class", "agesg")

        ages.selectAll("rect")
            .data(function(d) {
                if (chartID == "gender") {
                    return d.sex;
                }
                else {
                    return [d.sex];
                }
            })
            .enter().append("rect")
            .attr("width", function(d) {
                return x(0) + x(d.value);
            })
            .attr("y", function(d, i) {
                return y(d.myagegroup);
            })
            .attr("x", function(d) {
                x_corrected = x(d.x0) + 1;
                d.x_corrected = x_corrected;
                return x_corrected;
            })
            .attr("height", y.bandwidth())
            .attr("class", function(d) {
                classLabel = d.name.replace(/\s/g, ''); //remove spaces
                return "bars class" + classLabel;
            })
            .style("fill", function(d) {
                return color(d.name);
            })
            .attr("stroke", function(d, i) {
                return color(d.name);
            })
            .attr("stroke-width", "1");

        ages.selectAll("text")
            .data(function(d) {
                if (chartID == "gender") {
                    return d.sex;
                }
                else {
                    return [d.sex];
                }
            })
            .enter()
            .append("text")
            .text(function(d, i) {
                if (i == 0) {

                }
                if (chartID == "age") {
                    if (language == "en") {
                        return numberFormat(d.value) + " (" + (d3.format(".1%")(d.value / (+data[data.length - 1]["n_Ageonly"]))) + ")";
                    }
                    else {
                        return numberFormat(d.value) + " (" + (d3.format(".1%")(d.value / (+data[data.length - 1]["n_Ageonly"]))).replace("%", " %") + ")";
                    }
                }
                else {
                    if (language == "en") {
                        if (i == 0) {
                            return numberFormat(d.value) + " (" + (d3.format(".1%")(d.valueMale / (d.valueMale + d.valueFemale + d.valueOther))) + ")";
                        }
                        else if (i == 1) {
                            return numberFormat(d.value) + " (" + (d3.format(".1%")(d.valueFemale / (d.valueMale + d.valueFemale + d.valueOther))) + ")";
                        }
                        else {
                            return numberFormat(d.value) + " (" + (d3.format(".1%")(d.valueOther / (d.valueMale + d.valueFemale + d.valueOther))) + ")";
                        }
                    }
                    else {
                        if (i == 0) {
                            return numberFormat(d.value) + " (" + (d3.format(".1%")(d.valueMale / (d.valueMale + d.valueFemale + d.valueOther))).replace("%", " %") + ")";
                        }
                        else if (i == 1) {
                            return numberFormat(d.value) + " (" + (d3.format(".1%")(d.valueFemale / (d.valueMale + d.valueFemale + d.valueOther))).replace("%", " %") + ")";
                        }
                        else {
                            return numberFormat(d.value) + " (" + (d3.format(".1%")(d.valueOther / (d.valueMale + d.valueFemale + d.valueOther))).replace("%", " %") + ")";
                        }
                    }
                }
            })
            .attr("text-anchor", function(d, i) {
                if (i == 0 || i == 1) {
                    return "middle";
                }
                else {
                    return "start";
                }
            })
            .style("fill", function(d, i) {
                if (i == 0) {
                    return "white";
                }
                else {
                    return "black";
                }
            })
            .attr("x", function(d, i) {
                if (chartID == "gender") {
                    if (i == 0) {
                        return x(d.valueMale / 2) + 0;
                    }
                    else if (i == 1) {
                        return x(d.valueMale + d.valueFemale - (d.valueFemale / 2)) + 0;
                    }
                    else {
                        return x(d.valueMale + d.valueFemale + d.valueOther) + 5;
                    }
                }
                else {
                    return x(d.value / 2) + 0;
                }

            })
            .attr("font-size", 12)
            .attr("y", function(d) { return y(d["myagegroup"]) + y.bandwidth() - 7 });

        const rows = d3.select(".age-group-data").selectAll("tr").data(data.reverse()).enter().append("tr");
        let totalRowDemo;
        let totalRowDataDemo;
        if(chartID == "age"){
            totalRowDemo = d3.select(".age-group-data").append("tr");
        }
        for (let key in data[0]) {
            if (key == "Age group (years)" || key == "Number of cases with case reports" || key == "Males" || key == "Females" || key == "Other") {
                rows.append("td").text(function(d) {
                    function percentSign(value) {
                        if (language == "fr") {
                            return value.replace(".", ",").replace("%", " %");
                        }
                        else {
                            return value;
                        }
                    }

                    if (key == "Males") {
                        return numberFormat(d[key]) + " (" + percentSign(d["Proportion male cases"]) + ")"
                    }
                    else if (key == "Females") {
                        return numberFormat(d[key]) + " (" + percentSign(d["Proportion female cases"]) + ")"
                    }
                    else if (key == "Other") {
                        return numberFormat(d[key]) + " (" + percentSign(d["Proportion other cases"]) + ")"
                    }
                    else if (key == "Number of cases with case reports") {
                        return numberFormat(d[key]) + " (" + percentSign(d["Proportion of cases"]) + ")"
                    }
                    else {
                        return d[key];
                    }
                })
                if(chartID == "age"){
                    totalRowDataDemo = d3.sum(data.reverse(),function(d){ 
                        if(key != "Age group (years)"){ 
                            return +d[key];
                        }else{
                            return 0;
                        }
                    });
                    
                    totalRowDemo.append("td").text(function(d) {
                        function percentSign(value) {
                            if (language == "fr") {
                                return value.replace(".", ",").replace("%", " %");
                            }
                            else {
                                return value;
                            }
                        }
    
                        if (key != "Age group (years)") {
                            return numberFormat(totalRowDataDemo) + " (" + percentSign("100%") + ")"
                        }else{
                            return "Total";
                        }
                    })
                }
                // totalRow.append("td")
                //     .style("width", function(d) {
                //         if (key == "date") {
                //             return "40%";
                //         }
                //     })
                //     .text(function(d) {
                //         if (key == "Date") {
                //             return "Total";
                //         }
                //         else {
                //             return numberFormat(totalRowData);
                //         }
                //     });
            }
        }
    }

    // d3.csv("/src/data/covidLive/covid19-epiSummary-agegroups2.csv", function(dataAgeGroups) {

    // 		d3.csv("/src/data/covidLive/covid19-nTotal.csv",function(nTotal){
    dataAgeGroups.reverse()
    N0 = +nTotal.columns[0];
    d3.selectAll(".N2Total").text(numberFormat(+dataAgeGroups[dataAgeGroups.length - 1]["n"]));
    d3.selectAll(".N2").text(numberFormat(+dataAgeGroups[dataAgeGroups.length - 1]["n_Ageonly"]));
    if (language == "en") {
        d3.selectAll(".N2Percent").text((+dataAgeGroups[dataAgeGroups.length - 1]["n"] / N0 * 100).toFixed(2));
        d3.selectAll(".N5Percent").text((+dataAgeGroups[dataAgeGroups.length - 1]["n_Ageonly"] / N0 * 100).toFixed(2));
    }
    else {
        d3.selectAll(".N2Percent").text(((+dataAgeGroups[dataAgeGroups.length - 1]["n"] / N0 * 100).toFixed(2)).replace(".", ","));
        d3.selectAll(".N5Percent").text(((+dataAgeGroups[dataAgeGroups.length - 1]["n_Ageonly"] / N0 * 100).toFixed(2)).replace(".", ","));
    }
    d3.selectAll(".N5").text(numberFormat(+dataAgeGroups[dataAgeGroups.length - 1]["n_Ageonly"]));

    // 		});

    dataAgeGroups.forEach(function(d) {
        d["Number of cases with case reports"] = +d["Number of cases with case reports"];
        d["Males"] = +d["Males"];
        d["Females"] = +d["Females"];
        d["Other"] = +d["Other"];
    });

    $("#figure2-dropdown").on("change", function(e) {
        if (this.value == "age") {
            d3.select("#demo-age").style("display", "inline-block");
            d3.select("#demo-age-gender").style("display", "none");
            d3.selectAll(".N2").text(numberFormat(+dataAgeGroups[dataAgeGroups.length - 1]["n_Ageonly"]));
        }
        else {
            d3.select("#demo-age").style("display", "none");
            d3.select("#demo-age-gender").style("display", "inline-block");
            d3.selectAll(".N2").text(numberFormat(+dataAgeGroups[dataAgeGroups.length - 1]["n"]));
        }
    });

    // d3.select("#demo-age").style("display","inline-block");
    // d3.select("#demo-age-gender").style("display","none");
    // 		dataAgeGroups.reverse();
    drawDemo("age", dataAgeGroups);
    dataAgeGroups.reverse();
    drawDemo("gender", dataAgeGroups);
    // })
}

function HospitalizationUpdate() {

    function drawDemo(chartID, data) {
        if (chartID == "hospital") {
            chart = d3.select("#graphHospitalizations");
        }
        if (chartID == "icu") {
            chart = d3.select("#graphICU");
        }
        if (chartID == "death") {
            chart = d3.select("#graphDeath");
        }

        chart.attr("viewBox", "0 0 820 350").attr("preserveAspectRatio", "xMinYMin meet")

        // set the dimensions and margins of the graph
        var margin = { top: 20, right: 20, bottom: 60, left: 70 },
            width = 800 - margin.left - margin.right,
            height = 350 - margin.top - margin.bottom;

        let isIE = /*@cc_on!@*/ false || !!document.documentMode;
        if (/Edge\/\d./i.test(navigator.userAgent))
            isIE = true;

        chart.attr("width", function(d) {
                if (isIE) {
                    return (width + margin.left + margin.right);
                }
                else {
                    return;
                }
            })
            .attr("height", function(d) {
                if (isIE) {
                    return (height + margin.top + margin.bottom);
                }
                else {
                    return;
                }
            })

        // set the ranges
        var y = d3.scaleBand()
            .range([height, 0])
            .padding(0.35);

        var x = d3.scaleLinear()
            .range([0, width]);

        var color = d3.scaleOrdinal()
            .range(["#015B7E", "#bdd7e7", "#000"]);

        // append the svg object to the body of the page
        // append a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        var svg = chart
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Scale the range of the data in the domains
        x.domain([0, d3.max(data, function(d) { return +d["count_total"] * 1.15; })])
        y.domain(data.map(function(d) { return d["age_group"]; }));

        // add the x Axis
        const xAxis = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        const yAxis = svg.append("g")
            .call(d3.axisLeft(y));

        var dataColumn;
        if (language == "en") {
            dataColumn = "Number (Proportion (%))";
        }
        else {
            dataColumn = "Nombre (proportion (%))";
        }

        svg.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top + 15) + ")")
            .style("text-anchor", "middle")
            .text(dataColumn)
            .attr("font-size", 14);

        svg.append("text")
            .attr("transform",
                "translate(" + (-43) + "," +
                (height / 2) + ") rotate(-90)")
            .style("text-anchor", "start")
            .text(function() {
                if (language == "en") {
                    return "Age group (years)";
                }
                else {
                    return "Groupe d'âge (années)";
                }
            })
            .style("text-anchor", "middle")
            .attr("font-size", 14);

        const ticks = xAxis.selectAll(".tick line");
        ticks.attr("y2", -height);
        ticks.attr("stroke", "#e5e5e5");

        yAxis.selectAll(".tick line").style("display", "none");

        svg.selectAll(".domain").style("display", "none");

        // Get highest sex and age group percentages
        // format the data
        var dataGraph;

        color.domain(["count_male", "count_female", "count_other"]);

        data.forEach(function(d) {
            var myagegroup = d["age_group"]; //add to stock code
            var x0 = 0;
            d.sex = color.domain().map(function(name) {
                return {
                    myagegroup: myagegroup,
                    name: name,
                    x0: x0,
                    x1: x0 += +d[name],
                    value: +d[name],
                    valueMale: +d["count_male"],
                    valueFemale: +d["count_female"],
                    valueOther: +d["count_other"],
                    valueTotal: d["count_total"],
                    propTotal: d["prop_total"],
                    x_corrected: 0
                };
            });
            d.total = d.sex[d.sex.length - 1].x1;
        })

        //This is the legend
        const gLegendChart = svg.append("g").attr("class", "legendSexAgeChartSeverity")

        const legendSexAgeChart = gLegendChart.selectAll("legChart")
            .data(function() {
                if (language == "en") {
                    return ["Male", "Female", "Other"];
                }
                else {
                    return ["Homme", "Femme", "Autre"];
                }
            })
            .enter().append("g")
            .attr("id", function(d, i) { return "leg" + i; })
            .attr("class", "legSexAge")
            .attr("transform", "translate(490,-10)")

        let j = 0;
        let j2 = 13;
        legendSexAgeChart.append("text")
            .text(function(d, i) {
                return d;
            })
            .attr("font-size", "15px")
            .style("text-anchor", "end")
            //.attr("x", (z.range()[0]+10))
            .attr("transform", function(d, i) { if (language == "en") { j2 = 13; } else { j2 = 16; } j = j + (d.length * j2); return "translate(" + (+j - 15) + ",12)"; })

        j = 0;
        j2 = 13;
        legendSexAgeChart.append("rect")
            .attr("height", 12)
            .attr("x", function(d, i) { if (language == "en") { j2 = 13; } else { j2 = 16; } j = j + (d.length * j2); return ((+j - 15) + 6); })
            .attr("transform", "translate(0,1)")
            .attr("width", 12)
            .attr("fill", function(d, i) { return color(i); })
            .attr("stroke", "#828080");

        $(".legendSexAgeChart").css("display", "block");



        function valueAge(item) {
            return item["Number of cases with case reports"];
        }

        function valueOldAge(item) {
            if (item["Age group (years)"] == "60-69" || item["Age group (years)"] == "70-79" || item["Age group (years)"] == "80+") {
                return item["Number of cases with case reports"];
            }
            else {
                return 0;
            }
        }

        function valueMales(item) {
            return item.Males;
        }

        function valueFemales(item) {
            return item.Females;
        }

        function sum(prev, next) {
            return prev + next;
        }

        ages = svg.selectAll(".agesg")
            .data(data)
            .enter().append("g")
            .attr("class", "agesg")

        ages.selectAll("rect")
            .data(function(d) {
                // if (chartID == "gender") {
                return d.sex;
                // }else {
                //     return [d.sex];
                // }
            })
            .enter().append("rect")
            .attr("width", function(d, i) {
                if (i == 2) {
                    if (x(0) + x(d.value) == 0)
                        return 0;
                    return x(0) + x(d.value) + 1;
                }
                return x(0) + x(d.value);
            })
            .attr("y", function(d, i) {
                return y(d.myagegroup);
            })
            .attr("x", function(d) {
                x_corrected = x(d.x0) + 1;
                d.x_corrected = x_corrected;
                return x_corrected;
            })
            .attr("height", y.bandwidth())
            .attr("class", function(d) {
                classLabel = d.name.replace(/\s/g, ''); //remove spaces
                return "bars class" + classLabel;
            })
            .style("fill", function(d) {
                return color(d.name);
            })
            .attr("stroke", function(d, i) {
                return color(d.name);
            })
            .attr("stroke-width", "1")

        ages.selectAll("text")
            .data(function(d) {
                // if (chartID == "gender") {
                return d.sex;
                // }else {
                //     return [d.sex];
                // }
            })
            .enter()
            .append("text")
            .text(function(d, i) {

                if (language == "en") {
                    if (i == 2) {
                        return "n = " + numberFormat(d.valueTotal) + " (" + (d.propTotal) + ")";
                    }
                }
                else {
                    if (i == 2) {
                        return "n = " + numberFormat(d.valueTotal) + " (" + (d.propTotal).replace(".", ",").replace("%", " %") + ")";
                    }
                }

            })
            .attr("text-anchor", function(d, i) {
                if (i == 0 || i == 1) {
                    return "middle";
                }
                else {
                    return "start";
                }
            })
            .style("fill", function(d, i) {
                if (i == 0) {
                    return "white";
                }
                else {
                    return "black";
                }
            })
            .attr("x", function(d, i) {
                // if(chartID == "gender"){
                if (i == 0) {
                    return x(d.valueMale / 2) + 0;
                }
                else if (i == 1) {
                    return x(d.valueMale + d.valueFemale - (d.valueFemale / 2)) + 0;
                }
                else {
                    return x(d.valueMale + d.valueFemale + d.valueOther) + 5;
                }
                // }else{
                //     return x(d.value / 2) + 0;
                // }

            })
            .attr("font-size", 12)
            .attr("y", function(d) { return y(d["myagegroup"]) + y.bandwidth() - 6 });
            
        if (chartID == "hospital") {
            const rows = d3.select(".hospitalization-data").selectAll("tr").data(data.reverse()).enter().append("tr");
            
            rows.append("td").text(function(d) {

                return d["age_group"]
            })

            rows.append("td").text(function(d) {
                function percentSign(value) {
                    if (language == "fr") {
                        return value.replace(".", ",").replace("%", " %");
                    }
                    else {
                        return value;
                    }
                }

                return numberFormat(d["count_total"]) + " (" + percentSign(d["prop_total"]) + ")"
            })

            rows.append("td").text(function(d) {
                function percentSign(value) {
                    if (language == "fr") {
                        return value.replace(".", ",").replace("%", " %");
                    }
                    else {
                        return value;
                    }
                }

                return numberFormat(d["count_male"]) + " (" + percentSign(d["prop_male"]) + ")"
            })

            rows.append("td").text(function(d) {
                function percentSign(value) {
                    if (language == "fr") {
                        return value.replace(".", ",").replace("%", " %");
                    }
                    else {
                        return value;
                    }
                }

                return numberFormat(d["count_female"]) + " (" + percentSign(d["prop_female"]) + ")"
            })

            rows.append("td").text(function(d) {
                function percentSign(value) {
                    if (language == "fr") {
                        return value.replace(".", ",").replace("%", " %");
                    }
                    else {
                        return value;
                    }
                }

                return numberFormat(d["count_other"]) + " (" + percentSign(d["prop_other"]) + ")"
            })
        }

        if (chartID == "icu") {
            const rows = d3.select(".icu-data").selectAll("tr").data(data.reverse()).enter().append("tr");

            rows.append("td").text(function(d) {

                return d["age_group"]
            })

            rows.append("td").text(function(d) {
                function percentSign(value) {
                    if (language == "fr") {
                        return value.replace(".", ",").replace("%", " %");
                    }
                    else {
                        return value;
                    }
                }

                return numberFormat(d["count_total"]) + " (" + percentSign(d["prop_total"]) + ")"
            })

            rows.append("td").text(function(d) {
                function percentSign(value) {
                    if (language == "fr") {
                        return value.replace(".", ",").replace("%", " %");
                    }
                    else {
                        return value;
                    }
                }

                return numberFormat(d["count_male"]) + " (" + percentSign(d["prop_male"]) + ")"
            })

            rows.append("td").text(function(d) {
                function percentSign(value) {
                    if (language == "fr") {
                        return value.replace(".", ",").replace("%", " %");
                    }
                    else {
                        return value;
                    }
                }

                return numberFormat(d["count_female"]) + " (" + percentSign(d["prop_female"]) + ")"
            })

            rows.append("td").text(function(d) {
                function percentSign(value) {
                    if (language == "fr") {
                        return value.replace(".", ",").replace("%", " %");
                    }
                    else {
                        return value;
                    }
                }

                return numberFormat(d["count_other"]) + " (" + percentSign(d["prop_other"]) + ")"
            })

        }

        if (chartID == "death") {
            const rows = d3.select(".deaths-data").selectAll("tr").data(data.reverse()).enter().append("tr");

            rows.append("td").text(function(d) {

                return d["age_group"]
            })

            rows.append("td").text(function(d) {
                function percentSign(value) {
                    if (language == "fr") {
                        return value.replace(".", ",").replace("%", " %");
                    }
                    else {
                        return value;
                    }
                }

                return numberFormat(d["count_total"]) + " (" + percentSign(d["prop_total"]) + ")"
            })

            rows.append("td").text(function(d) {
                function percentSign(value) {
                    if (language == "fr") {
                        return value.replace(".", ",").replace("%", " %");
                    }
                    else {
                        return value;
                    }
                }

                return numberFormat(d["count_male"]) + " (" + percentSign(d["prop_male"]) + ")"
            })

            rows.append("td").text(function(d) {
                function percentSign(value) {
                    if (language == "fr") {
                        return value.replace(".", ",").replace("%", " %");
                    }
                    else {
                        return value;
                    }
                }

                return numberFormat(d["count_female"]) + " (" + percentSign(d["prop_female"]) + ")"
            })

            rows.append("td").text(function(d) {
                function percentSign(value) {
                    if (language == "fr") {
                        return value.replace(".", ",").replace("%", " %");
                    }
                    else {
                        return value;
                    }
                }

                return numberFormat(d["count_other"]) + " (" + percentSign(d["prop_other"]) + ")"
            })

        }
    }
    // d3.csv("/src/data/covidLive/covid19-epiSummary-severityUpdate.csv", function(dataHospSeverity) {
    // data = data.reverse();
    dataHospSeverity.forEach(function(d) {
        d["count_total"] = +d["count_total"];
        d["count_male"] = +d["count_male"];
        d["count_female"] = +d["count_female"];
        d["count_other"] = +d["count_other"];
    });

    let nObj = {};
    dataHospSeverity = dataHospSeverity.filter(function(d, i) {
        if (d["age_group"] == "total") {
            nObj[d["severity"]] = d["count_total"]
        }
        return d["age_group"] != "total"
    })

    let dataObj = d3.nest()
        .key(function(d) { return d["severity"]; })
        .entries(dataHospSeverity);
    //                           <svg class="chart" id="graphHospitalizations">
    // </svg>
    // <svg class="chart" id="graphICU">
    // </svg>
    // <svg class="chart" id="graphDeath">
    // </svg>
    $("#figure3-dropdown").on("change", function(e) {
        if (this.value == "hospital") {
            d3.select("#graphHospitalizations").style("display", "inline-block");
            d3.select("#graphICU").style("display", "none");
            d3.select("#graphDeath").style("display", "none");
            d3.select("#fig3-n").text(numberFormat(nObj["hospitalization"]))
        }
        else if (this.value == "death") {
            d3.select("#graphHospitalizations").style("display", "none");
            d3.select("#graphICU").style("display", "none");
            d3.select("#graphDeath").style("display", "inline-block");
            d3.select("#fig3-n").text(numberFormat(nObj["deaths"]))
        }
        else if (this.value == "icu") {
            d3.select("#graphHospitalizations").style("display", "none");
            d3.select("#graphICU").style("display", "inline-block");
            d3.select("#graphDeath").style("display", "none");
            d3.select("#fig3-n").text(numberFormat(nObj["icu"]))
        }
    });
    // fig3-h-n

    d3.select("#fig3-n").text(numberFormat(nObj["hospitalization"]))
    d3.selectAll(".fig3-h-n").text(numberFormat(nObj["hospitalization"]))
    d3.selectAll(".fig3-d-n").text(numberFormat(nObj["deaths"]))
    d3.selectAll(".fig3-i-n").text(numberFormat(nObj["icu"]))
    d3.select("#graphHospitalizations").style("display", "inline-block");
    d3.select("#graphICU").style("display", "none");
    d3.select("#graphDeath").style("display", "none");

    let hospitalData = dataObj.find(function(element) { return element["key"] === "hospitalization" })
    let icuData = dataObj.find(function(element) { return element["key"] === "icu" })
    let deathData = dataObj.find(function(element) { return element["key"] === "deaths" })

    drawDemo("hospital", hospitalData.values);
    drawDemo("icu", icuData.values);
    drawDemo("death", deathData.values);
    // drawDemo("gender", data);

    // })


    // d3.csv("data/covid19-epiSummary-agegroups2.csv", function(data) {
    //     data.reverse();

    //     d3.selectAll(".N2").text(numberFormat(+data[data.length - 1]["n"]));

    // data.forEach(function(d) {
    //     d["Number of cases with case reports"] = +d["Number of cases with case reports"];
    //     d["Males"] = +d["Males"];
    //     d["Females"] = +d["Females"];
    //     d["Other"] = +d["Other"];
    // });

    //     $("#figure2-dropdown").on("change", function(e) {
    //         if(this.value == "age"){
    //             d3.select("#demo-age").style("display","inline-block");
    //             d3.select("#demo-age-gender").style("display","none");
    //         }else{
    //             d3.select("#demo-age").style("display","none");
    //             d3.select("#demo-age-gender").style("display","inline-block");
    //         }
    //     });

    //     d3.select("#demo-age").style("display","inline-block");
    //     d3.select("#demo-age-gender").style("display","none");
    //     drawDemo("age", data);
    //     drawDemo("gender", data);
    // })

}

function HospVentICU() {

    // set the dimensions and margins of the graph
    var margin2 = { top: 50, right: 65, bottom: 70, left: 75 },
        width2 = 380 - margin2.left - margin2.right,
        height2 = 360 - margin2.top - margin2.bottom;

    // set the ranges
    var x = d3.scaleBand().range([0, width2]).padding(0);;
    var y = d3.scaleLinear().range([height2, 0]);

    let isIE = /*@cc_on!@*/ false || !!document.documentMode;
    if (/Edge\/\d./i.test(navigator.userAgent))
        isIE = true;

    function hospVentICUCreate(checkbox, timeData) {
        txtLocation = $('#figure4-dropdown option:selected').text();

        var variables = ["COVID_OTHER", "COVID_ICU", "COVID_VENT"];
        var titles;
        if (language == "en") {
            titles = ["Patients hospitalized", "Patients in ICU", "Patients mechanically vented"];
            titles2 = ["patients hospitalized", "patients in ICU", "patients mechanically vented"];
        }
        else {
            titles = ["Patients hospitalisés", "Patients admis aux soins intensifs", "Patients ventilé artificiellement"];
            titles2 = ["patients hospitalisés", "patients admis aux soins intensifs", "patients ventilé artificiellement"];
        }

        timeDataColumns = timeData.columns.sort(function(a, b) {
            return variables.indexOf(a) - variables.indexOf(b);
        })

        var yMaxArray = [];
        variables.forEach(function(variable, i) {
            yMaxArray.push(d3.max(timeData.map(function(d) { return +d[variable]; })));
        });
        var yMax = d3.max(yMaxArray);

        timeDataColumns.forEach(function(graphColumn, i) {
            if (variables.indexOf(graphColumn) >= 0) {
                var index = variables.indexOf(graphColumn);

                x.domain(timeData.map(function(d) { return d.Date; }));

                if (relativeSwitch == 0) {
                    yMax = d3.max(timeData.map(function(d) { return +d[graphColumn]; }));
                }
                y.domain([0, yMax]);
                y.domain([0, yMax]);

                // define the line to be used
                // 		var hospVentICUTrendline = d3.line()
                // 			.x(function(d) { return x2(d.Date); })
                // 			.y(function(d) { return y2(d[graphColumn]);	});

                var hospVentICUsvg = d3.select("#graphHospVentICU")
                    .append('div')
                    .attr("class", "col-xs-12 col-md-6 col-lg-4 col-print-4")
                    .style("padding", "0px")
                    //.style("flex", "1 1 30%")
                    .append("svg")
                    .attr("id", graphColumn)
                    .attr("width", "100%")
                    .attr('height', function(d) {
                        if (isIE) {
                            return '400px';
                        }
                        else {}
                    })
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .attr("viewBox", "0 0 345 370")
                // 			.attr("height", 500)

                var hospVentICUg = hospVentICUsvg
                    .append("g")
                    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

                hospVentICUg
                    .selectAll("rect")
                    .data(timeData)
                    .enter()
                    .append("rect")
                    .attr("x", function(d) { return x(d.Date); })
                    .attr("y", function(d) { return y(d[graphColumn]); })
                    .attr("height", function(d) { return height2 - y(d[graphColumn]); })
                    .attr("width", x.bandwidth())
                    .attr("fill", "#015B7E")
                    .append("title")
                    .text(function(d) { return d.Date + ": " + d[graphColumn]; });

                // 		hospVentICUsvg.append("path")
                // 			.data()
                // 			.attr("class", "line")
                // 			.attr("stroke", "rgb(8, 81, 156)")
                // 			.transition().duration(600)
                // 			.attr("d", hospVentICUTrendline);

                // Add the X Axis
                hospVentICUg.append("g")
                    .attr("id", "xSM")
                    .attr("transform", "translate(0," + height2 + ")")
                    .call(d3.axisBottom(x))
                    .selectAll("text")
                    .attr("y", 11)
                    .attr("x", -30)
                    .attr("dy", ".65em")
                    .attr("transform", "rotate(-45)");

                hospVentICUg.select("#xSM")
                    .selectAll(".tick")
                    .each(function(d, i) {
                        if (i % 21 != 0) {
                            d3.select(this).remove();
                        }
                    });

                // Add the Y Axis
                hospVentICUg.append("g")
                    .attr("id", "ySM")
                    .transition()
                    .duration(400)
                    .call(d3.axisLeft(y))
                    .selectAll("text")
                    .style("font-size", "13px")

                hospVentICUg.append("text")
                    .attr("class", "titleSMLabel")
                    .attr("transform", "translate(" + ((width2 / 2) - 10) + "," + (-10) + ")")
                    .attr("font-size", "16px")
                    .attr("text-anchor", "middle")
                    .attr("font-weight", "bold")
                    .text(titles[index])

                hospVentICUg.append("text")
                    .attr("class", "xAxisSMLabel")
                    .attr("transform", "translate(" + width2 / 2 + "," + (height2 + 70) + ")")
                    .attr("font-size", "14px")
                    .attr("text-anchor", "middle")
                    .text(function() {
                        if (language == "en") {
                            return "Date";
                        }
                        else {
                            return "Date";
                        }
                    })

                hospVentICUg.append("text")
                    .attr("class", "yAxisSMLabel")
                    .attr("transform", "translate(-50," + (height2 / 2) + ")rotate(-90)")
                    .attr("font-size", "14px")
                    .attr("text-anchor", "middle")
                    .text(function() {
                        if (language == "en") {
                            return "Number of " + titles2[index];
                        }
                        else {
                            return "Nombre de " + titles2[index];
                        }
                    })
            }
        })

        var formatTime;
        if (language == "en") {
            formatTime = d3.timeFormat("%B %-d, %Y");
        }
        else {
            formatTime = d3.timeFormat("%-d %B %Y");
        }
        var parseTime = d3.timeParse("%Y-%m-%d");
        $(".lastWeek").text(formatTime(parseTime(timeData[timeData.length - 8]["Date"])));
        $(".thisWeek").text(formatTime(parseTime(timeData[timeData.length - 1]["Date"])));
        $(".lastWeekICU").text(numberFormat(timeData[timeData.length - 8]["COVID_ICU"]));
        $(".lastWeekHosp").text(numberFormat(timeData[timeData.length - 8]["COVID_OTHER"]));
        $(".lastWeekVent").text(numberFormat(timeData[timeData.length - 8]["COVID_VENT"]));
        $(".thisWeekICU").text(numberFormat(timeData[timeData.length - 1]["COVID_ICU"]));
        $(".thisWeekHosp").text(numberFormat(timeData[timeData.length - 1]["COVID_OTHER"]));
        $(".thisWeekVent").text(numberFormat(timeData[timeData.length - 1]["COVID_VENT"]));
        if (language == "en") {
            $(".changeHosp").text(+timeData[timeData.length - 8]["COVID_OTHER"] > +timeData[timeData.length - 1]["COVID_OTHER"] ? "decreased" : +timeData[timeData.length - 8]["COVID_OTHER"] < +timeData[timeData.length - 1]["COVID_OTHER"] ? "increased" : "remains unchanged");
            $(".changeICU").text(+timeData[timeData.length - 8]["COVID_ICU"] > +timeData[timeData.length - 1]["COVID_ICU"] ? "decreased" : +timeData[timeData.length - 8]["COVID_ICU"] < +timeData[timeData.length - 1]["COVID_ICU"] ? "increased" : "remains unchanged");
            $(".changeVent").text(+timeData[timeData.length - 8]["COVID_VENT"] > +timeData[timeData.length - 1]["COVID_VENT"] ? "decreased" : +timeData[timeData.length - 8]["COVID_VENT"] < +timeData[timeData.length - 1]["COVID_VENT"] ? "increased" : "remains unchanged");
        }
        else {
            $(".changeHosp").text(+timeData[timeData.length - 8]["COVID_OTHER"] > +timeData[timeData.length - 1]["COVID_OTHER"] ? "diminué" : +timeData[timeData.length - 8]["COVID_OTHER"] < +timeData[timeData.length - 1]["COVID_OTHER"] ? "augmenté" : "demeure inchangé");
            $(".changeICU").text(+timeData[timeData.length - 8]["COVID_ICU"] > +timeData[timeData.length - 1]["COVID_ICU"] ? "diminué" : +timeData[timeData.length - 8]["COVID_ICU"] < +timeData[timeData.length - 1]["COVID_ICU"] ? "augmenté" : "demeure inchangé");
            $(".changeVent").text(+timeData[timeData.length - 8]["COVID_VENT"] > +timeData[timeData.length - 1]["COVID_VENT"] ? "diminué" : +timeData[timeData.length - 8]["COVID_VENT"] < +timeData[timeData.length - 1]["COVID_VENT"] ? "augmenté" : "demeure inchangé");
        }
        $(".percentICU").text(numberFormat(+timeData[timeData.length - 1]["COVID_ICU"] / +timeData[timeData.length - 1]["BEDCAP_ICU"] * 100));
    }

    function hospVentICUUpdate(checkbox, timeData, relativeSwitch) {
        txtLocation = $('#figure4-dropdown option:selected').text();

        var variables = ["COVID_OTHER", "COVID_ICU", "COVID_VENT"];
        var titles;
        if (language == "en") {
            titles = ["Patients who were hospitalized", "Patients who were in ICU", "Patients who were mechanically vented"];
            titles2 = ["patients who were hospitalized", "patients who were in ICU", "patients who were mechanically vented"];
        }
        else {
            titles = ["Patients qui ont fait l’objet d’une hospitalisation", "Patients qui ont été admis aux soins intensifs", "Patients qui ont nécessité une ventilation artificielle"];
            titles2 = ["patients qui ont fait l’objet d’une hospitalisation", "patients qui ont été admis aux soins intensifs", "patients qui ont nécessité une ventilation artificielle"];
        }

        timeDataColumns = timeData.columns.sort(function(a, b) {
            return variables.indexOf(a) - variables.indexOf(b);
        })

        var yMaxArray = [];
        variables.forEach(function(variable, i) {
            yMaxArray.push(d3.max(timeData.map(function(d) { return +d[variable]; })));
        });
        var yMax = d3.max(yMaxArray);

        timeDataColumns.forEach(function(graphColumn, i) {
            if (variables.indexOf(graphColumn) >= 0) {
                var index = variables.indexOf(graphColumn);

                x.domain(timeData.map(function(d) { return d.Date; }));
                if (relativeSwitch == 0) {
                    yMax = d3.max(timeData.map(function(d) { return +d[graphColumn]; }));
                }
                y.domain([0, yMax]);

                var hospVentICUg = d3.select("#" + graphColumn + " g");

                hospVentICUg.selectAll("rect").transition().duration(600)
                    .attr("y", function(d) { return y(d[graphColumn]); })
                    .attr("height", function(d) { return height2 - y(d[graphColumn]); })

                hospVentICUg.select("#ySM")
                    .transition()
                    .duration(600)
                    .call(d3.axisLeft(y))
                    .selectAll("text")
                    .style("font-size", "13px");

            }
        })

        // 		// define the line to be used
        // 		hospVentICUg.selectAll(".rect").each(function(d) {
        // 			if (relativeSwitch == 1) {
        // 				y2.domain([0, d3.max(d, function(d) { return d.values[0][typeCasesSM]; })]);
        // 			}
        // 			else {
        // 				y2.domain([0, d3.max(timeData, function(d) { return d3.max(d.values, function(d) { return d.values[0][typeCasesSM]; })})]);
        // 			}

        // 			hospVentICUTrendline = d3.line()
        // 				.x(function(d) {
        // 					return x2(d.Date);
        // 				})
        // 				.y(function(d) {
        // 					if (!isNaN(d[graphColumn]) && d[graphColumn] != null) {
        // 						return y2(d[graphColumn]);
        // 					}
        // 					else {
        // 						return y2(0);
        // 					}
        // 				});


        // 			//Transition the Y Axis
        // 			d3.select(this.parentNode).select("#ySM")
        // 				.transition()
        // 				.duration(600)
        // 				.call(yaxis);

        // // 			d3.select(this)
        // // 				.transition().duration(600)
        // // 				.attr("d", hospVentICUTrendline);


        // 		})

        // 		hospVentICUsvg.select(".yAxisSMLabel")
        // 			.text(function() {
        // 				if (language == "en") {
        // 					return txtTypeModSM + " of " + txtTypeCasesSM.toLowerCase();
        // 				}
        // 				else {
        // 					return txtTypeModSM + " de " + txtTypeCasesSM.toLowerCase();
        // 				}
        // 			})

    }

    // d3.csv("/src/data/covidLive/covid19-epiSummary-hospVentICU.csv", function(dataHospVentICU) {
    var parseTime = d3.timeParse("%Y-%m-%d");
    var numberFormat;
    if (language == "en") {
        numberFormat = d3.format(",d");
    }
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
        localeFormatter = d3.formatDefaultLocale(locale);
        numberFormat = localeFormatter.format(",d");
    }

    var checkbox = "1";
    var relativeSwitch = 1;
    var variables = ["COVID_OTHER", "COVID_VENT", "COVID_ICU"];
    var timeData;
    if (dataHospVentICU[0].pruid) {
        timeData = dataHospVentICU.filter(function(d) { return d.pruid == checkbox; })
    }
    else {
        timeData = dataHospVentICU;
    }

    $("#figure4-dropdown").on("change", function(e) {
        checkbox = this.value;
        if (dataHospVentICU[0].pruid) {
            timeData = dataHospVentICU.filter(function(d) { return d.pruid == checkbox; })
        }
        else {
            timeData = dataHospVentICU;
        }
        hospVentICUUpdate(checkbox, timeData, relativeSwitch);
    });

    d3.select("#figure4-relativeSwitch").on("click", function() {
        if (relativeSwitch == 1) {
            relativeSwitch = 0;
            d3.select(this).classed("btn-info", true);
            d3.select(this).classed("btn-success", false);

        }
        else {
            relativeSwitch = 1;
            d3.select(this).classed("btn-info", false);
            d3.select(this).classed("btn-success", true);
        }
        hospVentICUUpdate(checkbox, timeData, relativeSwitch);
    });

    hospVentICUCreate(checkbox, timeData, relativeSwitch);
    // d3.select(".legendG").style("display","none");

    const rows = d3.select(".hospVentICU-data").selectAll("tr").data(dataHospVentICU).enter().append("tr");
    let totalRow = d3.select(".hospVentICU-data").append("tr");
    let totalRowData;
    dataHospVentICU.columns.forEach(function(key) {
        if (key == "Date" || key == "COVID_OTHER" || key == "COVID_VENT" || key == "COVID_ICU") {
            rows.append("td")
                .style("width", function(d) {
                    if (key == "date") {
                        return "40%";
                    }
                })
                .text(function(d) {
                    if (key == "Date") {
                        return d[key];
                    }
                    else {
                        return numberFormat(d[key]);
                    }
                });
            totalRowData = d3.sum(dataHospVentICU,function(d){ 
                if(key != "Date"){ 
                    return +d[key];
                }else{
                    return 0;
                }
            });
            totalRow.append("td")
                .style("width", function(d) {
                    if (key == "date") {
                        return "40%";
                    }
                })
                .text(function(d) {
                    if (key == "Date") {
                        return "Total";
                    }
                    else {
                        return numberFormat(totalRowData);
                    }
                });
        }
    })
    // });
}

//Severity
function epiSummarySeverity() {
    // d3.csv("/src/data/covidLive/covid19-epiSummary-severity.csv", function(dataSeverity) {
    let numCasesData = numberFormat(dataSeverity.find(function(element) { return element["severity"] === "cases with hospitalization status" })["number of cases"]);
    let numHospitalized = numberFormat(dataSeverity.find(function(element) { return element["severity"] === "hospitalized" })["number of cases"]);
    let percentHospitalized = +dataSeverity.find(function(element) { return element["severity"] === "hospitalized" })["number of cases"] / +dataSeverity.find(function(element) { return element["severity"] === "cases with hospitalization status" })["number of cases"] * 100;
    let numIntensiveCare = numberFormat(dataSeverity.find(function(element) { return element["severity"] === "intensive care" })["number of cases"]);
    let percentIntensiveCare = +dataSeverity.find(function(element) { return element["severity"] === "intensive care" })["number of cases"] / +dataSeverity.find(function(element) { return element["severity"] === "hospitalized" })["number of cases"] * 100;
    let numMechVent = numberFormat(dataSeverity.find(function(element) { return element["severity"] === "mechanical ventilation" })["number of cases"]);
    let percentMechVent = +dataSeverity.find(function(element) { return element["severity"] === "mechanical ventilation" })["number of cases"] / +dataSeverity.find(function(element) { return element["severity"] === "hospitalized" })["number of cases"] * 100;
    let numDeaths = numberFormat(dataSeverity.find(function(element) { return element["severity"] === "death" })["number of cases"]);
    // let numDeath =  numberFormat(dataSeverity.find(function(element) { return element["severity"] === "death" })["number of cases"]);
    let severityN = numberFormat(+dataSeverity.find(function(element) { return element["severity"] === "cases with hospitalization status" })["number of cases"]);

    N0 = nTotal.columns[0];
    d3.selectAll(".N7").text(severityN);
    d3.selectAll(".N7Percent").text(d3.format(".1f")(+dataSeverity[0]["number of cases"] / N0 * 100));

    d3.select("#numCasesData").text(numCasesData);
    d3.select("#numHospitalized").text(numHospitalized);
    d3.select("#percentHospitalized").text(d3.format(".1f")(percentHospitalized));
    d3.select("#numIntensiveCare").text(numIntensiveCare);
    d3.select("#percentIntensiveCare").text(d3.format(".1f")(percentIntensiveCare));
    d3.select("#numMechVent").text(numMechVent);
    d3.select("#percentMechVent").text(d3.format(".1f")(percentMechVent));
    d3.select("#numDeaths").text(numDeaths);
    // d3.select("#numDeceased").text(numDeath);
    // });
}

function epiSummaryVOC() {
    let _data = dataVOCByDate[dataVOCByDate.length - 1].values;
    let _dataDate = dataVOCByDate[dataVOCByDate.length - 1].key;
    let _table = d3.select(".voc-data");
    let _row;
    _data.forEach(function(value, index) {
        let _cells = [];

		if(value.key == "1"){
			_row = _table.insert("tr","tr")
				.style("background-color", 'rgb(191, 191, 191)')
                .style("font-weight", "bold");
		}else{
			_row = _table.append("tr");
		}
		
        //if (index < 1) {
        //    _row.style("background-color", 'rgb(191, 191, 191)')
        //        .style("font-weight", "bold");
        //}
        // _row.style("background-color",function(){
        //     if(index==0){
        //         return 'rgb(191, 191, 191)';
        //     }
        // });

        _cells.push(pruid2prov(value.key))

        if (value.values[0]["b117"]) {
            _cells.push(numberFormat(value.values[0]["b117"]));
        }
        else {
            _cells.push("0");
        }

        if (value.values[0]["b1351"]) {
            _cells.push(numberFormat(value.values[0]["b1351"]));
        }
        else {
            _cells.push("0");
        }

        if (value.values[0]["p1"]) {
            _cells.push(numberFormat(value.values[0]["p1"]));
        }
        else {
            _cells.push("0");
        }

        // _cells.push(value.values[0]["b117"]);
        // _cells.push(value.values[0]["b1351"]);
        // _cells.push(value.values[0]["p1"]);

        _cells.forEach(function(value2, index2) {
            _row.append("td").text(function() {
                return value2;
            })
        })
    })
    let vocFormat;
    var formatTime;
    var parseTime = d3.timeParse("%Y-%m-%d");;
    if (language == "en") {
        formatTime = d3.timeFormat("%B %-d, %Y");
    }
    else {
        formatTime = d3.timeFormat("%-d %B %Y");

    }
    d3.selectAll(".dateVOC").text(function() {
        return formatTime(parseTime(_dataDate));
    })

};
