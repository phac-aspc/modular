/*
JSON Format:
{
Quarters:{
   Counts: [
      {key: quarter, values: [{key: Location, values: [{key: Drug, value: rows of that drug for given location}]}, ...]]}, ...]
   Quantities:
      {key: quarter, values: [{key: Location, values: [{key: City, value: rows of that drug for given location}]}, ...]]}, ...]
   }
}
*/
$.fn.DataTable.ext.pager.numbers_length = 5;

Array.prototype.sum = function(prop) {
    var total = 0
    for (var i = 0, _len = this.length; i < _len; i++) {
        total += parseInt(this[i][prop])
    }
    return total
}

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

// Set up before/after handlers
var beforePrint = function() {
    $("details").attr('open', '');
};
var afterPrint = function() {
    $("details").removeAttr('open');
};

// Webkit
if (window.matchMedia) {
    var mediaQueryList = window.matchMedia('print');
    mediaQueryList.addListener(function(mql) {
        if (mql.matches) {
            beforePrint();
        }
        else {
            afterPrint();
        }
    });
}

// IE, Firefox
window.onbeforeprint = beforePrint;
window.onafterprint = afterPrint;

var language = $('html').attr('lang');
let isIE = /*@cc_on!@*/ false || !!document.documentMode;
if (/Edge\/\d./i.test(navigator.userAgent))
    isIE = true;
var locale;
var formatFR;
var rawData;
var numberFormat;
var percentFormat;
var newSubs;
if (language == "en") {
    numberFormat = d3.format(",d");
    percentFormat = d3.format(",.2f");
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
    formatTime = d3.timeFormat("%d %b %Y");
    // create custom locale formatter for numbers from the given locale options
    localeFormatter = d3.formatDefaultLocale(locale);
    numberFormat = localeFormatter.format(",d");
    percentFormat = localeFormatter.format(",.2f");
}

//Excel sheet uses these values/ways of identifying drug types in their pivot table
//==========================================================================================
// A) To check if cannabis, Cannabis.contains(key) where key is the name of the drug
let Cannabis = ["CAN", "SCCONC", "SCC", "PHYTOCAN", "NSCCONC", "NSCC", "CCONC"];


// B) To check if Controlled Substance, check if "annexe de la loi" == I, II, III, IV

// C) To check if Opioid, Check if Item No == 1,16,26 && "annexe de la loi" == I

// D) To check if New Substance use list provided in the excel sheet, check the same way you would for A (Cannabis)
let NewSubstances = ["NEU-47700", "MEOU-47700", "NCPU-47700", "ACHMINACA", "TILETAM", "4ANBOCP"];
//==========================================================================================

// NEU-47700
// MEOU-47700
// NCPU-47700
// ACHMINACA
// TILETAM
// ACHMINACA
// 4ANBOCP



//This JSON contains all data
let drugSummary = {};

let totalForLocation;
let curData;

let mainText;


//This will contain a list that can be used to get the names of drugs based on their LIMS code
let lookup;
let quant_lookup;
let provinceJson = {
    CA: "Canada",
    ON: "Ontario",
    NL: "Newfoundland and Labrador",
    QC: "Quebec",
    AB: "Alberta",
    MB: "Manitoba",
    SK: "Saskatchewan",
    BC: "British Columbia",
    NS: "Nova Scotia",
    NB: "New Brunswick",
    T: "Territories",
    // NT: "Northwest Territories",
    PE: "Prince Edward Island",
    // NU: "Nunavut",
    // YT: "Yukon",

};

let provinceJsonFR = {
    CA: "Canada",
    ON: "Ontario",
    NL: "Terre-Neuve-et-Labrador",
    QC: "Quebec",
    AB: "Alberta",
    MB: "Manitoba",
    SK: "Saskatchewan",
    BC: "Colombie-Britannique",
    NS: "Nouvelle-ecosse",
    NB: "Nouveau-Brunswick",
    T: "Territoires",
    // NT: "Northwest Territories",
    PE: "Île-du-Prince-edouard",
    // NU: "Nunavut",
    // YT: "Yukon",
};

// 2020
// q1
// q2
// q3
// q4
// all

const quarters = ["Q1", "Q2", "Q3", "Q4", "all"]
// for first year remove "compared to last year"

// 2020
// q1
// q2
// q3
// q4
// all
//total
//benzo
//stim
// 2021
// q1
// q2
// q3
// q4
// all
//total
//benzo
//stim

let dropdownOptions = {
    "2020": ["all"],
    "2021": ["Q1"]
}

let createDropdownOptions = function() {
    let years = Object.keys(dropdownOptions);
    years.forEach(function(d, i) {
        d3.select("#years").append("option")
            .attr("value", d)
            .text(d)

        dropdownOptions[d].forEach(function(quarter, i) {
            d3.select("#quarters").append("option")
                .attr("value", quarter)
                .text(quarterDropdownText[language][quarter]);
        })
    })

    let mostRecentYear = years[years.length - 1]
    $("#years").val(mostRecentYear)

    $("#quarters").val(dropdownOptions[mostRecentYear][dropdownOptions[mostRecentYear].length - 1])

    updateDropdownOptions()
}

let updateDropdownOptions = function() {
    let curSelectedYear = $("#years").val()
    d3.selectAll("#quarters option").style("display", "none")

    dropdownOptions[curSelectedYear].forEach(function(d, i) {
        $("#quarters option[value='" + d + "']").css("display", "")
    })

    $("#quarters").val(dropdownOptions[curSelectedYear][dropdownOptions[curSelectedYear].length - 1])

}

let quarterDropdownText = {
    "en": {
        "all": "January to December",
        "Q1": "January to March",
        "Q2": "April to June",
        "Q3": "July to September",
        "Q4": "October to December"
    },
    "fr": {
        "all": "Janvier à Décembre",
        "Q1": "Janvier à Mars",
        "Q2": "Avril à Juin",
        "Q3": "Juillet à Septembre",
        "Q4": "Octobre à Décembre"
    }
}

let opioidPercents = {
    "2020": {
        "all": {
            "CA": { "fent": "69", "fentWithHeroin": "62" },
            "AB": { "fent": "78", "fentWithHeroin": "71" },
            "BC": { "fent": "85", "fentWithHeroin": "80" },
            "MB": { "fent": "65", "fentWithHeroin": "56" },
            "NB": { "fent": "6", "fentWithHeroin": "50" },
            "NL": { "fent": "22", "fentWithHeroin": "0" },
            "NS": { "fent": "11", "fentWithHeroin": "75" },
            "ON": { "fent": "64", "fentWithHeroin": "57" },
            "PE": { "fent": "10", "fentWithHeroin": "0" },
            "QC": { "fent": "19", "fentWithHeroin": "17" },
            "SK": { "fent": "51", "fentWithHeroin": "61" },
            "T": { "fent": "52", "fentWithHeroin": "25" }
        }
    },
    "2021": {
        "Q1": {
            "CA": { "fent": "70", "fentWithHeroin": "46" },
            "AB": { "fent": "81", "fentWithHeroin": "28" },
            "BC": { "fent": "85", "fentWithHeroin": "79" },
            "MB": { "fent": "69", "fentWithHeroin": "83" },
            "NB": { "fent": "0", "fentWithHeroin": "0" },
            "NL": { "fent": "0", "fentWithHeroin": "0" },
            "NS": { "fent": "2", "fentWithHeroin": "0" },
            "ON": { "fent": "68", "fentWithHeroin": "37" },
            "PE": { "fent": "0", "fentWithHeroin": "0" },
            "QC": { "fent": "36", "fentWithHeroin": "49" },
            "SK": { "fent": "63", "fentWithHeroin": "86" },
            "T": { "fent": "100", "fentWithHeroin": "0" }
        }
    }

}

let totalsForLocations = {
    "2020": {
        "all": { 'QC': 31771, 'MB': 2477, 'ON': 33830, 'NB': 1981, 'NS': 1408, 'AB': 12412, 'SK': 2022, 'BC': 15584, 'NL': 482, 'PE': 212, 'T': 231, 'CA': 102410 }
    },
    "2021": {
        "Q1": { 'QC': 7973, 'MB': 542, 'ON': 10963, 'NB': 462, 'NS': 404, 'AB': 2599, 'SK': 459, 'BC': 3666, 'NL': 80, 'PE': 21, 'T': 90, 'CA': 27259 }
    }
}
//these 3 are covered by having last years data

//add year and quarter
let lastYearSameQuarter = {
    "2020": {
        "all": { "QC": 38189, "MB": 2515, "ON": 38205, "NB": 1354, "NS": 1758, "AB": 14714, "SK": 1947, "BC": 14766, "NL": 587, "PE": 155, "T": 205, "CA": 114395 }
    },
    "2021": {
        "Q1": { "BC": 3134, "QC": 6943, "ON": 7409, "AB": 2878, "SK": 507, "MB": 585, "NB": 394, "NS": 541, "NL": 97, "PE": 50, "T": 38, "CA": 22576 }
    }
}

//add year/quarter
let benzoLastYear = {
    "2020": {
        "all": { "ON": 867, "AB": 272, "QC": 1295, "MB": 54, "NS": 69, "NB": 65, "BC": 270, "SK": 20, "NL": 35, "PE": 2, "T": 4, "CA": 2953 }
    },
    "2021": {
        "Q1": { "BC": 59, "QC": 235, "ON": 158, "AB": 49, "SK": 4, "MB": 13, "NB": 21, "NS": 23, "NL": 2, "PE": 3, "T": 0, "CA": 567 }
    }
}

let stimulantLastYear = {
    "2020": {
        "all": { "ON": 19843, "AB": 8727, "QC": 20113, "MB": 1715, "NS": 705, "NB": 710, "BC": 7600, "SK": 1238, "NL": 173, "PE": 124, "T": 145, "CA": 61093 }
    },
    "2021": {
        "Q1": { "BC": 1501, "QC": 3280, "ON": 3653, "AB": 1708, "SK": 323, "MB": 360, "NB": 197, "NS": 225, "NL": 40, "PE": 28, "T": 24, "CA": 11339 }
    }
}
let quantTableDrugs = ["ACFENT_FB", "CARFENT_FB", "FENT_FB", "FUFENT_FB", "COC_FB", "COC_HCL", "HER_HCL", "MDMA_HCL", "METH_HCL"];

let ignoreTitleCase = ["LSD", "TFMPP", "BZP", "DMT", "2-CB", "FUB-AMB", "5FMDMBPICA", "5-CL-AKB48", "25I-NBOME", "25C-NBOME", "25B-NBOME", "AB-FUBINAC", "FUB-144", "25C-NBOH", "JWH-018", "3,4-MDPHP", "MDPV", "5F-ADB", "5-MAPB", "AM-2201", "5F-AMB", "25B-NBOH", "2C-C"]
let ignoreTitleCaseCSV;

//These will be used to keep track of current "filter"
let curType = "Count";
let curYear = "2021"
let curQuarter = "Q1";
let curProvince = "CA";
let nestedTrendData;
let nestedTrendTableData;
let Province;

drugSummary["Quarters"] = {};
drugSummary["Quarters"]["Count"] = {};
drugSummary["Quarters"]["Quant"] = {};

let queryStringOptions = {
    "p": ["CA", "ON", "NL", "QC", "AB", "MB", "SK", "BC", "NS", "NB", "T", "PE"],
    "y": {
        "2020": ["all"],
        "2021": ["Q1"]
    }
}
let queryStringValues = getParams()
if (typeof(queryStringValues.p) != "undefined" || typeof(queryStringValues.y) != "undefined" || typeof(queryStringValues.q) != "undefined") {
    if (queryStringOptions["p"].indexOf(queryStringValues.p) != -1 && typeof(queryStringOptions["y"][queryStringValues.y]) != "undefined") {
        if (queryStringOptions["y"][queryStringValues.y].indexOf(queryStringValues.q) != -1) {
            let value = queryStringValues.p;
            curProvince = value;
            $("#selectProvince").val(curProvince).change();
            $("#selectProvinceTrend").val(curProvince).change();
            $("#years").val(queryStringValues.y).change()
            $("#quarters").val(queryStringValues.q).change()
        }
    }
}

let getDataForCanadaByQuarter = function() {
    let byQuarter;
    let canada = { key: "CA", values: [] };
    let output = [];
    let input = [];
    let yearIndex = canadaData.map(function(o) { return o.key; }).indexOf($("#years").val());

    if ($("#quarters").val() == "all") {
        canadaData[yearIndex].values.forEach(function(d, i) {
            input.push.apply(input, d.values)
        })

        input.forEach(function(item) {
            item = Object.assign({}, item)
            var existing = output.filter(function(v, i) {
                return v.key == item.key;
            });
            if (existing.length) {
                var existingIndex = output.indexOf(existing[0]);
                output[existingIndex].value = output[existingIndex].value.slice().concat(item.value.slice());
            }
            else {
                if (typeof item.value == 'string')
                    [item.value] = [item.value];
                output.push(item);
            }
        });
        byQuarter = output;
    }
    else {
        let quarterIndex = canadaData[yearIndex].values.map(function(o) { return o.key; }).indexOf($("#quarters").val());
        byQuarter = canadaData[yearIndex].values[quarterIndex].values;
    }
    canada.values = byQuarter;

    totalForLocation = totalsForLocations[$("#years").val()][$("#quarters").val()]["CA"];
    //console.log(canada)
    return canada;
};

let getDataForProvinceByQuarter = function(q, p) {
    let byQuarter;
    let byProvince;
    let output = [];
    let input = [];
    let yearIndex = drugSummary["Quarters"][curType].map(function(o) { return o.key; }).indexOf($("#years").val());


    //something to get all
    if (q === "all") {
        byQuarter = drugSummary["Quarters"][curType][yearIndex].values.forEach(function(d, i) {
            let provinceIndex = d.values.map(function(o) { return o.key; }).indexOf(p);
            d.values[provinceIndex].values.forEach(function(drug, j) {
                input.push(drug)
            })
        })

        input.forEach(function(item) {
            item = Object.assign({}, item)
            var existing = output.filter(function(v, i) {
                return v.key == item.key;
            });
            if (existing.length) {
                var existingIndex = output.indexOf(existing[0]);
                output[existingIndex].value = output[existingIndex].value.slice().concat(item.value.slice());
            }
            else {
                if (typeof item.value == 'string')
                    [item.value] = [item.value];
                output.push(item);
            }
        });
        byQuarter = output;

        byProvince = { key: "p", values: output };

    }
    else {
        byQuarter = drugSummary["Quarters"][curType][yearIndex].values.filter(
            function(data) {
                return data.key === q;
            }
        );

        byProvince = byQuarter.slice();


        byProvince = byProvince[0].values.filter(
            function(data) {
                return data.key === p;
            }
        );

        byProvince = byProvince[0];
    }



    // this finds the total samples
    //console.log(byProvince)

    totalForLocation = totalsForLocations[$("#years").val()][q][p];

    return byProvince;
};

let generatePanCanTableData = function() {
    let tableObj = {};
    let tableData = [];
    let totalCount = 0;
    let canadaObj = { "Location": "Canada" };
    if (language == "en") {
        canadaObj["Opioids"] = 0;
        canadaObj["Benzodiazepines"] = 0;
        canadaObj["Stimulants"] = 0;
        canadaObj["Cannabis"] = 0;
    }
    else {
        canadaObj["Opioïdes"] = 0;
        canadaObj["Benzodiazépines"] = 0;
        canadaObj["Stimulants"] = 0;
        canadaObj["Cannabis"] = 0;
    }

    panCanData[$("#years").val()][$("#quarters").val()].forEach(function(d, i) {
        let tableRow;
        if (language == "en") {
            tableRow = { "Location": d.Province, "Opioids": d.Opioids, "Benzodiazepines": d.Benzodiazepines, "Stimulants": d.Stimulants, "Cannabis": d.Cannabis };
            canadaObj["Opioids"] += d.Opioids;
            canadaObj["Benzodiazepines"] += d.Benzodiazepines;
            canadaObj["Stimulants"] += d.Stimulants;
            canadaObj["Cannabis"] += d.Cannabis;
        }
        else {
            tableRow = { "Location": d.Province, "Opioïdes": d.Opioids, "Benzodiazépines": d.Benzodiazepines, "Stimulants": d.Stimulants, "Cannabis": d.Cannabis };
            canadaObj["Opioïdes"] += d.Opioids;
            canadaObj["Benzodiazépines"] += d.Benzodiazepines;
            canadaObj["Stimulants"] += d.Stimulants;
            canadaObj["Cannabis"] += d.Cannabis;
        }
        tableData.push(tableRow);
    });

    tableData.push(canadaObj)

    tableObj["data"] = tableData;
    if (language == "en")
        tableObj["columns"] = ["Location", "Opioids", "Benzodiazepines", "Stimulants", "Cannabis"];
    else
        tableObj["columns"] = ["Location", "Opioïdes", "Benzodiazépines", "Stimulants", "Cannabis"];

    return tableObj;
};

let createPanCanTable = function(data) {
    let columns = data.columns;

    let titleText;
    if (language == "en") {
        titleText = "Pan-Canadian Totals for Opioids, Benzodiazepines, Stimulants and Cannabis"
    }
    else {
        titleText = "Totaux pan-canadiens pour les opioïdes, les benzodiazépines, les stimulants et le cannabis"
    }
    d3.select("#panCanTile").select("#panCanTableContainer").select("table").select("tbody").remove()
    d3.select("#panCanTile").select("#panCanTableContainer").select("caption").remove()
    var table = d3.select("#panCanTile").select("#panCanTableContainer").select("table")
        .attr("class", "table table-striped table-bordered table-hover").attr("id", "panCanTable"),
        caption = table.append("caption").text(titleText),
        tbody = table.append("tbody");

    // append the header row


    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(data.data)
        .enter()
        .append("tr")
        .style("font-weight", function(d, i) {
            if (i == data.data.length - 1)
                return "bold"
        });



    // create a cell in each row for each column
    // At this point, the rows have data associated.
    // So the data function accesses it.
    var cells = rows.selectAll("td")
        .data(function(row) {
            // he does it this way to guarantee you only use the
            // values for the columns you provide.
            return columns.map(function(column) {
                // return a new object with a value set to the row's column value.
                if (language == "en")
                    return { Drug: row.Drug, value: row[column] };
                else
                    return { Drug: row.Drogue, value: row[column] };

            });
        })
        .enter()
        .append("td")
        .text(function(d) {
            if (isNaN(d.value))
                return d.value;
            else return numberFormat(d.value);
        });

    return table;
};


let generateTableData = function(data) {
    let startData = data.data;
    let tableObj = {};
    let tableData = [];
    let totalCount = 0;
    //console.log(startData)

    startData = startData.filter(function(d, i) {
        //console.log(d)
        return !d.key.includes("Autres") && !d.key.includes("Other")
    })




    startData.forEach(function(d, i) {
        //console.log(d)
        if (d.key !== "Other opioids" && d.key !== "Autres opioïdes" && d.key !== "Autres benzodiazépines" && d.key !== "Other benzodiazepines" && d.key !== "Autres stimulants" && d.key !== "Other stimulants" && d.key !== "Autres substances" && d.key !== "Other substances") {
            //console.log("in")
            totalCount += d.value.sum("count");
        }
    });

    startData.forEach(function(d, i) {

        let drugName = getDrugNameFromKey(d.key);
        let count = d.value.sum("count");
        let percent;
        let tableRow;
        if (language == "en") {
            percent = percentFormat((count / totalCount * 100).toFixed(2)) + "%"
            tableRow = { "Substance": titleCase(drugName), "Number of samples": numberFormat(count), "Percentage of total samples": percent };
        }
        else {
            percent = percentFormat((count / totalCount * 100).toFixed(2)) + " %"
            tableRow = { "Substance": titleCase(drugName), "Nombre d'échantillons": numberFormat(count), "Pourcentage du total": percent };
        }


        tableData.push(tableRow);
    });
    // if (language == "en")
    //     tableData.push({ "Substance": "Total", "Number of samples": numberFormat(totalCount), "Percentage of total samples": "100%" });

    // else
    //     tableData.push({ "Substance": "Total", "Nombre d'échantillons": numberFormat(totalCount), "Pourcentage du total": "100%" });

    tableObj["data"] = tableData;
    if (language == "en")
        tableObj["columns"] = ["Substance", "Number of samples", "Percentage of total samples"];
    else
        tableObj["columns"] = ["Substance", "Nombre d'échantillons", "Pourcentage du total"];
    tableObj["id"] = data.tileId;
    tableObj["title"] = data.title;

    return tableObj;
};

let generateMainSubTableData = function(data) {
    let startData = data.data;
    let tableObj = {};
    let tableData = [];
    let totalCount = 0;

    startData = startData.filter(function(d, i) {
        //console.log(d)
        return !d.key.includes("Autres") && !d.key.includes("Other")
    })

    startData = startData.sort(function(a, b) {
        return b.value.sum("count") - a.value.sum("count");
    });



    startData.forEach(function(d, i) {
        totalCount += d.value.sum("count");

    });

    startData.forEach(function(d, i) {

        let drugName = getDrugNameFromKey(d.key);
        let count = d.value.sum("count");
        let percent;
        let tableRow;
        if (language == "en") {
            percent = (count / totalCount * 100).toFixed(2) + "%"
            tableRow = { "Substance": titleCase(drugName), "Number of samples": numberFormat(count) };
        }
        else {
            percent = (count / totalCount * 100).toFixed(2) + " %"
            tableRow = { "Substance": titleCase(drugName), "Nombre d'échantillons": numberFormat(count) };
        }


        tableData.push(tableRow);
    });
    // if (language == "en")
    //     tableData.push({ "Substance": "Total", "Number of samples": numberFormat(totalCount) });

    // else
    //     tableData.push({ "Substance": "Total", "Nombre d'échantillons": numberFormat(totalCount) });

    tableObj["data"] = tableData;
    if (language == "en")
        tableObj["columns"] = ["Substance", "Number of samples"];
    else
        tableObj["columns"] = ["Substance", "Nombre d'échantillons"];
    tableObj["id"] = data.tileId;
    tableObj["title"] = data.title;

    return tableObj;
};

let createTable = function(data) {
    let tableData = generateTableData(data);
    tabulate(tableData);
    if (data.descText != null) {
        d3.select("#" + data.tileId).select(".descriptionText").html(data.descText);
    }
    else {
        d3.select("#" + data.tileId).select(".descriptionText").html("");
    }
};

let createMainSubTable = function(data) {
    let tableData = generateMainSubTableData(data);
    tabulate(tableData);
    if (data.descText != null) {
        d3.select("#" + data.tileId).select(".descriptionText").html(data.descText);
    }
    else {
        d3.select("#" + data.tileId).select(".descriptionText").html("");
    }
};



let titleCase = function(string) {
    if (string === "MDMA" || string === "MDA" || string === "GHB" || string == "BMDP" || ignoreTitleCase.includes(string) || ignoreTitleCaseCSV.includes(string))
        return string;
    var sentence = string.toLowerCase().split(" ");
    for (var i = 0; i < sentence.length; i++) {
        // console.log(sentence[i])
        sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
    }
    return sentence.join(" ");
};

let tabulate = function(data) {
    d3.select("#" + data.id).select(".tileHeader").text(data.title);

    let columns = data.columns;
    let id = data.id;
    if ($.fn.DataTable.isDataTable("#" + id + " table")) {
        $("#" + id + " table").DataTable().destroy();
    }
    d3.select("#" + id).select(".table").select("table").remove();

    var table = d3.select("#" + id).select(".table").append("table"),
        thead = table.append("thead"),
        tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function(column) {
            return column;
        });



    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(data.data)
        .enter()
        .append("tr")
    // .attr("class", function(d, i) {
    //     //console.log(d.Substance)
    //     if (d.Substance === "Other opioids" || d.Substance === "Autres Opioïdes" || d.Substance === "Autres Benzodiazépines" || d.Substance === "Other Benzodiazepines" || d.Substance === "Autres Stimulants" || d.Substance === "Other Stimulants") {
    //         return "other"
    //     }
    //     else if (i > 10 && i !== data.data.length - 1) {
    //         return "otherDrugs";
    //     }
    // })
    // .style("background-color", function() {
    //     if (d3.select(this).attr("class") === "otherDrugs") {
    //         return "#f5f5f5";
    //     }
    // })
    // .style("display", function() {
    //     if (d3.select(this).attr("class") === "otherDrugs") {
    //         return "none";
    //     }
    // });



    // create a cell in each row for each column
    // At this point, the rows have data associated.
    // So the data function accesses it.
    var drugLength = 0;
    var cells = rows.selectAll("td")
        .data(function(row) {
            // he does it this way to guarantee you only use the
            // values for the columns you provide.
            return columns.map(function(column, index) {
                //console.log()
                // return a new object with a value set to the row's column value.
                if (language == "en")
                    return { Drug: row.Substance, value: row[column], index: index };
                else
                    return { Drug: row.Substance, value: row[column], index: index };

            });
        })
        .enter()
        .append("td")
        .style("font-weight", function(d) {
            if (d.Drug === "Total") {
                return "bold"
            }
        })
        .attr("data-sort", function(d, i) {
            if (d.index == 1) {
                return d.value.replace(" ", "").replace(",", "")
            }
            else if (d.index == 2) {
                return d.value.replace("%", "").replace(",", ".").trim()
            }
        })
        .text(function(d, i) {
            if (i == 0) {
                drugLength += 1;
            }
            if (drugLength > 10 && i == 0) {
                return d.value + "*"
            }
            return d.value;
        });

    d3.select("#" + id).select(".other").on("click", function() {
        if (d3.select("#" + id).select(".otherDrugs").style("display") != "none") {
            d3.select("#" + id).select(".otherOpioidCaret").attr("class", "fa fa-caret-right otherOpioidCaret")
            $('#' + id + ' .otherDrugs').slideRow('up');
        }
        else {
            $('#' + id + ' .otherDrugs').slideRow('down');
            d3.select("#" + id).select(".otherOpioidCaret").attr("class", "fa fa-caret-down otherOpioidCaret")
        }
    });

    let prevText = "<i class=\"fa fa-caret-right otherOpioidCaret\" aria-hidden=\"true\"></i>" + $("#" + id + " .other td:first").text();
    $("#" + id + " .other td:first").html(prevText);

    $("#" + id + " table").DataTable({
        "searching": false,
        "lengthChange": false,
        "info": false,
        "order": [
            [1, "desc"]
        ]
    });
    $(".dataTables_paginate").css("width", "100%").css("text-align", "center")

    d3.select("#" + id + " .table .otherNote").remove();
    if (data.data.length > 10) {
        d3.select("#" + id + " .table").append("p").attr("class", "otherNote").text(function() {
            //console.log(data)
            if (language == "en") {
                if (id == "controlledSubstanceTile")
                    return '* Included in "Other controlled substances"'

                return '* Included in "Other ' + data.title + '"'
            }
            else {
                if (id == "controlledSubstanceTile")
                    return '* Inclus dans "Autres substances controlées"'

                return '* Inclus dans "Autres ' + data.title + '"'
            }
        })
    }

    return table;
};

let tabulateTrends = function(data, id, title) {
    let columns = Object.keys(data[0]);
    columns.unshift(columns.pop());

    d3.select("#" + id).select(".table-responsive").remove();
    d3.select("#" + id).append("div").attr("class", "table-responsive");
    var table = d3.select("#" + id).select("div").append("table").attr("class", "table table-striped table-bordered table-hover"),
        caption = table.append("caption").attr("class", "text-left").text(title),
        thead = table.append("thead"),
        tbody = table.append("tbody");

    let theadUpper = thead.append("tr");
    theadUpper.append("th").text("Substance").attr("rowspan", 2)
    if (language == "en")
        theadUpper.append("th").text("Number of samples").attr("colspan", columns.length - 1)
    else
        theadUpper.append("th").text("Nombre d'échantillons").attr("colspan", columns.length - 1)

    // Nombre d'échantillons
    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns.slice(1, columns.length))
        .enter()
        .append("th")

        .text(function(column) {
            return column;
        });




    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");



    // create a cell in each row for each column
    // At this point, the rows have data associated.
    // So the data function accesses it.
    var cells = rows.selectAll("td")
        .data(function(row) {
            // he does it this way to guarantee you only use the
            // values for the columns you provide.
            return columns.map(function(column) {
                // return a new object with a value set to the row's column value.
                if (language == "en")
                    return { Drug: row.Drug, value: row[column] };
                else
                    return { Drug: row.Drogue, value: row[column] };

            });
        })
        .enter()
        .append("td")
        .text(function(d) {
            if (!isNaN(d.value))
                return d3.format(",d")(d.value);
            else
                return d.value
        });

    return table;
};

let checkIfCannabis = function(d) {
    return d.value[0]["drugCat"] == "C"
}

let getCannabisDrugTotals = function() {
    let cannabisTotalsForProvince;

    cannabisTotalsForProvince = curData["values"].filter(
        function(data) {
            return checkIfCannabis(data)
        }
    );

    //merge cannabis concentrates
    let concentrateObj = { key: "CANNABIS CONCENTRATES(SOLID/NON-SOLID)" };
    let nonSolidConcentrate = cannabisTotalsForProvince.find(function(o) {
        return o.key === "NSCCONC"
    });
    let solidConcentrate = cannabisTotalsForProvince.find(function(o) {
        return o.key === "SCCONC"
    });

    let concentrateArr = [];
    if (solidConcentrate != null) {
        concentrateArr = concentrateArr.concat(solidConcentrate.value);
    }
    if (nonSolidConcentrate != null) {
        concentrateArr = concentrateArr.concat(nonSolidConcentrate.value);
    }
    concentrateObj.value = concentrateArr;

    if (nonSolidConcentrate != null) {
        let nonSolidCIndex = cannabisTotalsForProvince.map(function(e) {
            return e.key;
        }).indexOf('NSCCONC');
        cannabisTotalsForProvince.splice(nonSolidCIndex, 1);
    }
    if (solidConcentrate != null) {
        let solidCIndex = cannabisTotalsForProvince.map(function(e) {
            return e.key;
        }).indexOf('SCCONC');
        cannabisTotalsForProvince.splice(solidCIndex, 1);
    }
    if (concentrateObj.value.sum("count") !== 0) {
        cannabisTotalsForProvince.push(concentrateObj);
    }

    //merge substances containing cannabis
    let containingCannabisObj;
    if (language == "en")
        containingCannabisObj = { key: "Containing Cannabis (Solid/Non-Solid)" };
    else
        containingCannabisObj = { key: "Substances qui contiennent du cannabis (solides/pas solides)" };
    let nonSolidContainingCannabis = cannabisTotalsForProvince.find(function(o) {
        return o.key === "NSCC"
    });
    let solidContainingCannabis = cannabisTotalsForProvince.find(function(o) {
        return o.key === "SCC"
    });

    let newValueArr = [];
    if (nonSolidContainingCannabis != null) {
        newValueArr = newValueArr.concat(nonSolidContainingCannabis.value);
    }
    if (solidContainingCannabis != null) {
        newValueArr = newValueArr.concat(solidContainingCannabis.value);
    }
    containingCannabisObj.value = newValueArr;
    if (nonSolidContainingCannabis != null) {
        let nonSolidCCIndex = cannabisTotalsForProvince.map(function(e) {
            return e.key;
        }).indexOf('NSCC');
        cannabisTotalsForProvince.splice(nonSolidCCIndex, 1);
    }
    if (solidContainingCannabis != null) {
        let solidCCIndex = cannabisTotalsForProvince.map(function(e) {
            return e.key;
        }).indexOf('SCC');
        cannabisTotalsForProvince.splice(solidCCIndex, 1);
    }
    if (containingCannabisObj.value.sum("count") !== 0) {
        cannabisTotalsForProvince.push(containingCannabisObj);
    }


    cannabisTotalsForProvince = cannabisTotalsForProvince.sort(function(a, b) {
        return b.value.sum("count") - a.value.sum("count");
    });

    let totalCount = 0;

    cannabisTotalsForProvince.forEach(function(d, i) {
        totalCount += d.value.sum("count");
    });


    let descText;
    //console.log("can DATA:", cannabisTotalsForProvince)
    if (language == "en")
        descText = "Cannabis was identified in a total of " + numberFormat(totalCount) + " samples during this period. The determination of the THC level is not carried " +
        "out in samples submitted in the form of edible products. Results of these samples are thus by default reported as solids / non solids containing cannabis. " +
        "Note: Please refer to the <a href='https://laws-lois.justice.gc.ca/eng/regulations/SOR-2018-144/FullText.html' target='_blank'>Cannabis Regulations</a> for category definitions (section Definitions - Act and Regulations).";
    else {
        descText = "Du cannabis a été identifié dans un total de " + numberFormat(totalCount) + " échantillons au cours de cette période sous la Loi sur le cannabis. La détermination du taux de THC n'est pas effectuée pour les échantillons soumis sous forme de produits comestibles. Les resultats de ces échantillons sont donc par défaut rapportés comme des substances solides/pas solides qui contiennent du cannabis. Note: Veuillez vous référer au <a target='_blank' href='https://laws-lois.justice.gc.ca/fra/reglements/DORS-2018-144/TexteComplet.html'>Règlement sur le cannabis</a> pour les définitions des catégories (section Definitions - Loi et règlement).";
    }
    return {
        tileId: "cannabisTile",
        title: "Cannabis",
        data: cannabisTotalsForProvince,
        totalCount: totalCount,
        descText: descText
    };
};
let checkIfBenzo = function(d) {
    return d.value[0].drugCat === "B"
};

let getBenzoDrugTotals = function() {
    let benzoTotalsForProvince;

    benzoTotalsForProvince = curData["values"].filter(
        function(data) {
            return checkIfBenzo(data);
        }
    ).sort(function(a, b) {
        return b.value.sum("count") - a.value.sum("count");
    });

    //console.log(benzoTotalsForProvince)
    if (benzoTotalsForProvince.length > 10) {
        let otherOpiodsText;
        if (language == "en")
            otherOpiodsText = "Other benzodiazepines"
        else
            otherOpiodsText = "Autres benzodiazépines"
        let othersObj = { key: otherOpiodsText, value: [] };
        let others = benzoTotalsForProvince.slice(10, benzoTotalsForProvince.length);

        //console.log(others);
        others.forEach(function(el) {
            el.value.forEach(function(val) {
                othersObj.value.push(val);
            })
        });

        //console.log(benzoTotalsForProvince)
        // opioidTotalsForProvince = opioidTotalsForProvince.slice(0, 10);
        benzoTotalsForProvince.splice(10, 0, othersObj);
    }

    let totalCount = 0;

    benzoTotalsForProvince.forEach(function(d, i) {
        if (d.key !== "Other benzodiazepines" && d.key !== "Autres benzodiazépines") {
            //console.log(d)
            totalCount += d.value.sum("count");
        }
        else {
            //console.log(d)
        }
    });

    let percent;
    let increaseDecrease = "";
    if (language == "en")
        percent = Math.abs(100 - ((totalCount / benzoLastYear[$("#years").val()][$("#quarters").val()][curProvince]) * 100)).toFixed(0) + "%";
    else
        percent = Math.abs(100 - ((totalCount / benzoLastYear[$("#years").val()][$("#quarters").val()][curProvince]) * 100)).toFixed(0) + " %";

    if (totalCount < benzoLastYear[$("#years").val()][$("#quarters").val()][curProvince]) {
        if (language == "en")
            increaseDecrease = "decrease"
        else
            increaseDecrease = "diminution"
    }
    else {
        if (language == "en")
            increaseDecrease = "increase"
        else
            increaseDecrease = "augmentation"
    }
    let benzoText;
    if (language == "en")
        benzoText = "A total of " + d3.format(",d")(totalCount) + " benzodiazepines were submitted for analysis during that period which represents a " + percent + " " + increaseDecrease + " over the same period last year.";
    else
        benzoText = "Un total de " + d3.format(",d")(totalCount) + " benzodiazépines ont été soumises pour analyse au cours de cette période, ce qui représente une " + increaseDecrease + " de " + percent + " par rapport à la même période l'année dernière.";


    //console.log(benzoText)

    let benzoTitle;
    if (language == "en")
        benzoTitle = "Benzodiazepines";
    else
        benzoTitle = "Benzodiazépines";

    return {
        tileId: "benzoTile",
        title: benzoTitle,
        data: benzoTotalsForProvince,
        totalCount: totalCount,
        descText: benzoText
    };
};

let checkIfNewSubstance = function(d) {
    return Object.keys(newSubs[$("#years").val()][$("#quarters").val()]).indexOf(d.key) != -1;
    // return NewSubstances.includes(d.key) && d.value[0]["code impression SGIL-LIMS"] != "V";
};

let getNewSubstancesDrugTotals = function() {
    let newSubstancesTotalsForProvince;

    newSubstancesTotalsForProvince = curData["values"].filter(
        function(data) {
            return checkIfNewSubstance(data)
        }
    );

    newSubstancesTotalsForProvince = newSubstancesTotalsForProvince.sort(function(a, b) {
        return b.value.sum("count") - a.value.sum("count");
    });

    let newSubTitle;
    if (language == "en")
        newSubTitle = "Newly Identified Substances";
    else
        newSubTitle = "Substances nouvellement identifiées";

    if (newSubstancesTotalsForProvince.length > 10) {
        let otherOpiodsText;
        if (language == "en")
            otherOpiodsText = "Other substances"
        else
            otherOpiodsText = "Autres substances"
        let othersObj = { key: otherOpiodsText, value: [] };
        let others = newSubstancesTotalsForProvince.slice(10, newSubstancesTotalsForProvince.length);

        //console.log(others);
        others.forEach(function(el) {
            el.value.forEach(function(val) {
                othersObj.value.push(val);
            })
        });


        // opioidTotalsForProvince = opioidTotalsForProvince.slice(0, 10);
        newSubstancesTotalsForProvince.splice(10, 0, othersObj);
    }
    // console.log(newSubstancesTotalsForProvince)
    return {
        tileId: "newSubstancesTile",
        title: newSubTitle,
        data: newSubstancesTotalsForProvince
    };
};

let checkIfOpioid = function(d) {
    return d.value[0]["drugCat"] === "O";
};

let getOpioidDrugTotals = function() {
    let opioidTotalsForProvince;
    // console.log(curData)
    // let byLab = {};
    // curData.values.forEach(function(drug) {
    //     drug.value.forEach(function(drugRow) {
    //         if (byLab[drugRow["lab"]] == null) {
    //             // console.log(drugRow["no replicats"])
    //             if ((drugRow["drugEntered"] === "HER" || drugRow["drugEntered"] === "FENT")) {
    //                 byLab[drugRow["lab"]] = [];
    //                 byLab[drugRow["lab"]].push(drugRow);
    //             }
    //         }
    //         else {
    //             if ((drugRow["drugEntered"] === "HER" || drugRow["drugEntered"] === "FENT")) {
    //                 byLab[drugRow["lab"]].push(drugRow);
    //             }
    //         }
    //     })
    // });

    // let fentWithHeroin = 0;
    // Object.keys(byLab).forEach(function(category) {
    //     if (byLab[category].length == 2) {
    //         fentWithHeroin += 1;
    //     }
    // });
    // console.log(fentWithHeroin)

    //console.log(curData);
    opioidTotalsForProvince = curData["values"].filter(
        function(data) {
            return checkIfOpioid(data);
        }
    );

    // console.log(opioidTotalsForProvince)

    // console.log(opioidFentTotal, heroinTotal)
    opioidTotalsForProvince = opioidTotalsForProvince.sort(function(a, b) {
        return b.value.sum("count") - a.value.sum("count");
    });

    if (opioidTotalsForProvince.length > 10) {
        let otherOpiodsText;
        if (language == "en")
            otherOpiodsText = "Other opioids"
        else
            otherOpiodsText = "Autres opioïdes"
        let othersObj = { key: otherOpiodsText, value: [] };
        let others = opioidTotalsForProvince.slice(10, opioidTotalsForProvince.length);

        //console.log(others);
        others.forEach(function(el) {
            el.value.forEach(function(val) {
                othersObj.value.push(val);
            })
        });


        // opioidTotalsForProvince = opioidTotalsForProvince.slice(0, 10);
        opioidTotalsForProvince.splice(10, 0, othersObj);
    }

    let totalCount = 0;

    opioidTotalsForProvince.forEach(function(d, i) {
        if (d.key !== "Other opioids" && d.key !== "Autres opioïdes") {
            //console.log(d)
            totalCount += d.value.sum("count");
        }
        else {
            //console.log(d)
        }
    });

    // let fentWithHeroinPercent = ((fentWithHeroin / heroinTotal) * 100).toFixed(0);
    // if (isNaN(parseInt(fentWithHeroinPercent))) {
    //     fentWithHeroinPercent = 0;
    // }
    // //console.log(opioidFentTotal, totalCount)
    // let fentanyl = ((opioidFentTotal / totalCount) * 100).toFixed(0);
    // //console.log(fentanyl)
    // if (isNaN(parseInt(fentanyl))) {
    //     fentanyl = 0;
    // }
    let descText;
    // console.log('"'+curProvince+'": {', '"fent": "'+fentanyl+'", ','"fentWithHeroin": "'+fentWithHeroinPercent+'"},')
    if (language == "en")
        descText = "A total of " + numberFormat(totalCount) + " opioids were identified during that period where " + opioidPercents[$("#years").val()][$("#quarters").val()][curProvince]["fent"] + "% were fentanyl or fentanyl analogues. From all samples containing heroin, " + opioidPercents[$("#years").val()][$("#quarters").val()][curProvince]["fentWithHeroin"] + "% also contained fentanyl.";
    else
        descText = "Un total de " + numberFormat(totalCount) + " opioïdes ont été identifiés au cours de cette période alors que " + opioidPercents[$("#years").val()][$("#quarters").val()][curProvince]["fent"] + " % étaient du fentanyl ou des analogues du fentanyl. De tous les échantillons contenant de l'héroïne, " + opioidPercents[$("#years").val()][$("#quarters").val()][curProvince]["fentWithHeroin"] + " %  contenaient également du fentanyl.";

    let opioidTitle;
    if (language == "en")
        opioidTitle = "Opioids"
    else
        opioidTitle = "Opioïdes"

    return {
        title: opioidTitle,
        tileId: "opioidTile",
        data: opioidTotalsForProvince,
        totalCount: totalCount,
        descText: descText
    };
};

let checkIfControlledSubstance = function(d) {
    return d.value[0]["isControlledSubstance"] == "Y"
};

let getControlledSubstanceDrugTotals = function() {
    let controlledSubstanceTotalsForProvince;


    controlledSubstanceTotalsForProvince = curData["values"].filter(
        function(data) {
            return checkIfControlledSubstance(data);
        }
    );
    //console.log(controlledSubstanceTotalsForProvince)
    controlledSubstanceTotalsForProvince = controlledSubstanceTotalsForProvince.sort(function(a, b) {
        return b.value.sum("count") - a.value.sum("count");
    });

    // let totalCount = 0;

    // controlledSubstanceTotalsForProvince.forEach(function(d, i) {
    //     totalCount += d.value.sum("count");
    // });

    if (controlledSubstanceTotalsForProvince.length > 10) {
        let otherOpiodsText;
        if (language == "en")
            otherOpiodsText = "Other controlled substances"
        else
            otherOpiodsText = "Autres substances controlées"
        let othersObj = { key: otherOpiodsText, value: [] };
        let others = controlledSubstanceTotalsForProvince.slice(10, controlledSubstanceTotalsForProvince.length);

        //console.log(others);
        others.forEach(function(el) {
            el.value.forEach(function(val) {
                othersObj.value.push(val);
            })
        });

        //console.log(stimulantTotalsForProvince)
        // opioidTotalsForProvince = opioidTotalsForProvince.slice(0, 10);
        controlledSubstanceTotalsForProvince.splice(10, 0, othersObj);
    }

    let totalCount = 0;

    controlledSubstanceTotalsForProvince.forEach(function(d, i) {
        if (d.key !== "Other controlled substances" && d.key !== "Autres substances controlées") {
            //console.log(d)
            totalCount += d.value.sum("count");
        }
        else {
            //console.log(d)
        }
    });

    let percent;
    let increaseDecrease = "";


    if (language == "en")
        percent = Math.abs(100 - ((totalForLocation / lastYearSameQuarter[$("#years").val()][$("#quarters").val()][curProvince]) * 100)).toFixed(0) + "%";
    else
        percent = Math.abs(100 - ((totalForLocation / lastYearSameQuarter[$("#years").val()][$("#quarters").val()][curProvince]) * 100)).toFixed(0) + " %";

    if (totalForLocation < lastYearSameQuarter[$("#years").val()][$("#quarters").val()][curProvince]) {
        if (language == "en")
            increaseDecrease = "decrease"
        else
            increaseDecrease = "diminution"
    }
    else {
        if (language == "en")
            increaseDecrease = "increase"
        else
            increaseDecrease = "augmentation"
    }
    let title;
    if (language == "en") {
        mainText = "A total of <strong>" + d3.format(",d")(totalForLocation) + "</strong> samples (including cannabis) were submitted for analysis during that period which represents a <strong>" + percent + " " + increaseDecrease + "</strong> over the same period last year.";
        title = "Most Frequently Identified Controlled Substances"
    }
    else {
        mainText = "Un total de <strong>" + d3.format(",d")(totalForLocation) + "</strong> pièces à conviction (cannabis inclus) ont été soumises pour analyse au cours de cette période, ce qui représente une <strong>" + increaseDecrease + " de <span style='white-space:nowrap;'>" + percent + "</span></strong> par rapport à la même période l'année dernière.";
        title = "Principales substances controlées"
    }
    d3.select("#mainText").html(mainText);
    return {
        title: title,
        tileId: "controlledSubstanceTile",
        data: controlledSubstanceTotalsForProvince,
        totalCount: totalCount,
    };
};

let getStimulantDrugTotals = function() {
    let stimulantTotalsForProvince;

    stimulantTotalsForProvince = curData["values"].filter(
        function(data) {
            return checkIfStimulant(data);
        }
    );

    stimulantTotalsForProvince = stimulantTotalsForProvince.sort(function(a, b) {
        return b.value.sum("count") - a.value.sum("count");
    });

    if (stimulantTotalsForProvince.length > 10) {
        let otherOpiodsText;
        if (language == "en")
            otherOpiodsText = "Other stimulants"
        else
            otherOpiodsText = "Autres stimulants"
        let othersObj = { key: otherOpiodsText, value: [] };
        let others = stimulantTotalsForProvince.slice(10, stimulantTotalsForProvince.length);

        //console.log(others);
        others.forEach(function(el) {
            el.value.forEach(function(val) {
                othersObj.value.push(val);
            })
        });

        //console.log(stimulantTotalsForProvince)
        // opioidTotalsForProvince = opioidTotalsForProvince.slice(0, 10);
        stimulantTotalsForProvince.splice(10, 0, othersObj);
    }

    let totalCount = 0;

    stimulantTotalsForProvince.forEach(function(d, i) {
        if (d.key !== "Other stimulants" && d.key !== "Autres stimulants") {
            //console.log(d)
            totalCount += d.value.sum("count");
        }
        else {
            //console.log(d)
        }
    });

    let percent;
    let increaseDecrease = "";
    if (language == "en")
        percent = Math.abs(100 - ((totalCount / stimulantLastYear[$("#years").val()][$("#quarters").val()][curProvince]) * 100)).toFixed(0) + "%";
    else
        percent = Math.abs(100 - ((totalCount / stimulantLastYear[$("#years").val()][$("#quarters").val()][curProvince]) * 100)).toFixed(0) + " %";

    if (totalCount < stimulantLastYear[$("#years").val()][$("#quarters").val()][curProvince]) {
        if (language == "en")
            increaseDecrease = "decrease"
        else
            increaseDecrease = "diminution"
    }
    else {
        if (language == "en")
            increaseDecrease = "increase"
        else
            increaseDecrease = "augmentation"
    }
    let stimulantText;
    if (language == "en")
        stimulantText = "A total of " + d3.format(",d")(totalCount) + " stimulants were submitted for analysis during that period which represents a " + percent + " " + increaseDecrease + " over the same period last year.";
    else
        stimulantText = "Un total de " + d3.format(",d")(totalCount) + " stimulants ont été soumises pour analyse au cours de cette période, ce qui représente une " + increaseDecrease + " de " + percent + " par rapport à la même période l'année dernière.";



    return {
        title: "Stimulants",
        tileId: "stimulantTile",
        data: stimulantTotalsForProvince,
        totalCount: totalCount,
        descText: stimulantText
    };
};

// let generatePieChart = function(data) {
//     d3.select("#" + data.tileId).select(".tileHeader").text(data.title);

//     const width = 540;
//     const height = 540;
//     const radius = Math.min(width, height) / 2;
//     d3.select("#" + data.tileId).select(".pieChart").select("svg").remove();
//     const svg = d3.select("#" + data.tileId).select(".pieChart")
//         .append("svg")
//         .attr("width", width)
//         .attr("height", height)
//         .append("g")
//         .attr("transform", "translate(width / 2, height / 2)");

//     let color = d3.scaleOrdinal(d3.schemeCategory10);

//     // const pie = d3.pie()
//     //     .value(d => d.value.sum("count"))
//     //     .sort(null);

//     const arc = d3.arc()
//         .innerRadius(radius - 150)
//         .outerRadius(radius);

//     function type(d) {
//         d.length = Number(d.length);
//         return d.length;
//     }

//     function arcTween(a) {
//         //console.log(a);
//         const i = d3.interpolate(this._current, a);
//         this._current = i(1);
//         return (t) => arc(i(t));
//     }

//     let pieData = pie(data.data);

//     // Join new data
//     const path = svg.selectAll("path")
//         .data(pieData);

//     // Update existing arcs
//     path.transition().duration(200).attrTween("d", arcTween);

//     // Enter new arcs
//     path.enter().append("path")
//         .attr("fill", (d, i) => color(i))
//         .attr("d", arc)
//         .attr("stroke", "white")
//         .attr("stroke-width", "1px")
//         .each(function(d) {
//             this._current = d;
//         });

//     d3.select("#legend").selectAll('div').remove();
//     d3.select('#legend').selectAll('div')
//         .data(data.data)
//         .enter()
//         .append('div')
//         .attr('class', 'legendElement')
//         .style('padding', '3px 0px 3px 0px')
//         .style('margin-top', '8px')
//         .append('div')
//         .style('height', '25px')
//         .style('width', '25px')
//         .style('background-color', function(d, i) {
//             return color(i);
//         })
//         .style('vertical-align', 'middle')
//         .style('display', 'inline-block')

//     d3.select('#legend').selectAll('.legendElement')
//         .append('i')
//         .attr('class', 'fas fa-times-circle');

//     d3.select('#legend').selectAll('.legendElement')
//         .data(data.data)
//         .append('span')
//         .style('padding-left', '5px')
//         .style('overflow-wrap', 'break-word')
//         .text(function(d, i) {
//             //console.log(pieData[i]);
//             return getDrugNameFromKey(d.key) + " (" + (((pieData[i].endAngle - pieData[i].startAngle) / 6.283185307179586) * 100).toFixed(2) + '%) ' + pieData[i].value;
//         });
// };

let generateNewSubstanceVisual = function(data) {
    //console.log(data);
    data.data = data.data.filter(function(d, i) {
        //console.log(d)
        return !d.key.includes("Autres") && !d.key.includes("Other")
    })
    d3.select("#" + data.tileId).select(".tileHeader").html(data.title + "<i class='fas fa-exclamation-triangle'></i>");
    // d3.select("#newSubNumber").transition().duration(350)
    //     .tween("text", function (d) {
    //         let node = this;
    //         let i = d3.interpolate(node.textContent, data.data.length);
    //         return function (t) {
    //             node.textContent = d3.format("d")(i(t));
    //         };
    //     });

    // <th>Drug</th>
    //                             <th>Number of samples</th>
    if ($.fn.DataTable.isDataTable("#" + data.tileId + " table")) {
        $("#" + data.tileId + " table").DataTable().destroy();
    }
    d3.select("#" + data.tileId + " .table table thead tr").selectAll("th").remove();
    if (language == "en") {
        d3.select("#" + data.tileId + " .table table thead tr").append("th").text("Substance").style("min-width", "255px")
        d3.select("#" + data.tileId + " .table table thead tr").append("th").text("Number of samples")
    }
    else {
        d3.select("#" + data.tileId + " .table table thead tr").append("th").text("Substance").style("min-width", "255px")
        d3.select("#" + data.tileId + " .table table thead tr").append("th").text("Nombre d'échantillons")
    }

    d3.select("#" + data.tileId + " .table table tbody")
        .selectAll("tr").remove();

    data.data.forEach(function(d, i) {
        if (i > 9) {
            $("#" + data.tileId + " .table table tbody").append("<tr><td>" + getDrugNameFromKey(d.key) + "*</td><td>" + d.value.sum("count") + "</td></tr>")
        }
        else {
            $("#" + data.tileId + " .table table tbody").append("<tr><td>" + getDrugNameFromKey(d.key) + "</td><td>" + d.value.sum("count") + "</td></tr>")
        }
    });


    if (data.data.length === 0) {
        d3.select("#" + data.tileId).select(".visual").style("display", "none");
        d3.select("#" + data.tileId).select(".noData").style("display", "inline-block");
    }
    else {
        d3.select("#" + data.tileId).select(".visual").style("display", "inline-block");
        d3.select("#" + data.tileId).select(".noData").style("display", "none");
    }

    $("#" + data.tileId + " table").DataTable({
        "searching": false,
        "lengthChange": false,
        "info": false,
        "order": [
            [1, "desc"]
        ]
    });
    $(".dataTables_paginate").css("width", "100%").css("text-align", "center")
    d3.select("#" + data.tileId + " .table .otherNote").remove();
    if (data.data.length > 10) {
        d3.select("#" + data.tileId + " .table").append("p").attr("class", "otherNote").text(function() {
            //console.log(data)
            if (language == "en") {
                return '* Included in "Other substances"'

            }
            else {
                return '* Inclus dans "Autres substances"'
            }
        })
    }

}

let generateCirclePack = function(data) {
    var width = 350;
    var height = 330;
    d3.select("#" + data.tileId).select(".tileHeader").text(data.title);

    // append the svg object to the body of the page
    d3.select("#newSubstancesTile").select(".viz").select("svg").remove();

    var svg = d3.select("#newSubstancesTile").select(".viz")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Filter a bit the data -> more than 1 million inhabitants
    // Color palette for continents?
    let color = d3.scaleOrdinal(d3.schemeCategory10);

    let hierarchyData = getNewSubstancesDrugTotals().data;
    let newSubstanceData = d3.hierarchy({ key: "root", values: hierarchyData }, function(d) {
            return d.values;
        })
        .sum(function(d) {
            if (d.value === undefined)
                return 0;
            return d.value.sum("count");
        })
        .sort(function(a, b) {
            //console.log(a);
            return a.value - b.value;
        });

    let circleData = d3.pack()
        .size([width, height])
        .padding(2);

    // Initialize the circle: all located at the center of the svg area
    let node = svg.append("g")
        .selectAll("circle")
        .data(circleData(newSubstanceData).children)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", function(d) {
            return d.r
        })
        .attr("cx", function(d) {
            return d.x
        })
        .attr("cy", function(d) {
            return d.y
        })
        .style("fill", function(d) {
            return color(d.data.key)
        })
        .style("fill-opacity", 0.8)
        .attr("stroke", "black")
        .style("stroke-width", 1);

    let nodeText = svg.select("g")
        .selectAll("text")
        .data(circleData(newSubstanceData).children)
        .enter()
        .append("text")
        .attr("x", function(d) {
            return d.x - 5
        })
        .attr("y", function(d) {
            return d.y + 5
        })
        .text(function(d) {
            return d.value
        });


    d3.select('#legend').selectAll('div').remove();
    d3.select('#legend').selectAll('div')
        .data(circleData(newSubstanceData).children)
        .enter()
        .append('div')
        .attr('class', 'legendElement')
        .style('padding', '3px 0px 3px 0px')
        .style('margin-top', '8px')
        .append('div')
        .style('height', '25px')
        .style('width', '25px')
        .style('background-color', function(d, i) {
            return color(d.data.key);
        })
        .style("border", "1px solid black")
        .style('vertical-align', 'middle')
        .style('display', 'inline-block');

    d3.select('#legend').selectAll('.legendElement')
        .data(circleData(newSubstanceData).children)
        .append('span')
        .style('padding-left', '5px')
        .style('overflow-wrap', 'break-word')
        .text(function(d, i) {
            return getDrugNameFromKey(d.data.key);
        });
};

let updateCirclePack = function(data) {
    var width = 350;
    var height = 330;
    var svg = d3.select("#newSubstancesTile").select(".viz")
        .select("svg");

    // Filter a bit the data -> more than 1 million inhabitants
    // Color palette for continents?
    let color = d3.scaleOrdinal(d3.schemeCategory10);

    let hierarchyData = getNewSubstancesDrugTotals().data;
    let newSubstanceData = d3.hierarchy({ key: "root", values: hierarchyData }, function(d) {
            return d.values;
        })
        .sum(function(d) {
            if (d.value === undefined)
                return 0;
            return d.value.sum("count");
        })
        .sort(function(a, b) {
            return a.value - b.value;
        });

    let circleData = d3.pack()
        .size([width, height])
        .padding(2);

    if (circleData(newSubstanceData).children != undefined) {

        d3.select("#newSubstancesTile").select(".noData").style("display", "none");
        let node = svg.select("g")
            .selectAll("circle")
            .data(circleData(newSubstanceData).children);

        node
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", function(d) {
                return 0;
            })
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .style("opacity", 0)
            .transition()
            .duration(350)
            .style("opacity", 1)
            .attr("r", function(d) {
                return d.r
            })
            .attr("cx", function(d) {
                return d.x
            })
            .attr("cy", function(d) {
                return d.y
            })
            .style("fill", function(d) {
                return color(d.data.key)
            })
            .style("fill-opacity", 0.8)
            .attr("stroke", "black")
            .style("stroke-width", 1);

        // Initialize the circle: all located at the center of the svg area
        node
            .attr("class", "node")
            .transition().duration(350)
            .attr("r", function(d) {
                return d.r
            })
            .attr("cx", function(d) {
                return d.x
            })
            .attr("cy", function(d) {
                return d.y
            })
            .style("fill", function(d) {
                return color(d.data.key)
            })
            .style("fill-opacity", 0.8)
            .attr("stroke", "black")
            .style("stroke-width", 1);

        node.exit().transition().duration(300)
            .style("opacity", 0)
            .attr("r", 0)
            .remove();

        let nodeText = svg.select("g")
            .selectAll("text")
            .data(circleData(newSubstanceData).children);
        nodeText
            .enter()
            .append("text")
            .style("opacity", 0)
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("r", 0)
            .transition().duration(350)
            .style("opacity", 1)
            .attr("r", function(d) {
                return d.r
            })
            .attr("x", function(d) {
                return d.x - 5
            })
            .attr("y", function(d) {
                return d.y + 5
            })
            .text(function(d) {
                return d.value
            });

        nodeText
            .transition().duration(350)
            .attr("x", function(d) {
                return d.x - 5
            })
            .attr("y", function(d) {
                return d.y + 5
            })
            .text(function(d) {
                return d.value
            });

        nodeText.exit().transition().duration(300).style("opacity", 0)
            .remove();

        d3.select('#legend').selectAll('div').remove();
        d3.select('#legend').selectAll('div')
            .data(circleData(newSubstanceData).children)
            .enter()
            .append('div')
            .attr('class', 'legendElement')
            .style('padding', '3px 0px 3px 0px')
            .style('margin-top', '8px')
            .append('div')
            .style('height', '25px')
            .style('width', '25px')
            .style('background-color', function(d, i) {
                return color(d.data.key);
            })
            .style("border", "1px solid black")
            .style('vertical-align', 'middle')
            .style('display', 'inline-block')
            .style("opacity", 0)
            .transition().duration(350)
            .style("opacity", 1);

        d3.select('#legend').selectAll('.legendElement')
            .data(circleData(newSubstanceData).children)
            .append('span')
            .style('padding-left', '5px')
            .style('overflow-wrap', 'break-word')
            .text(function(d, i) {
                return getDrugNameFromKey(d.data.key);
            })
            .style("opacity", 0)
            .transition().duration(350)
            .style("opacity", 1);
    }
    else {
        d3.select("#newSubstancesTile").select(".noData").style("display", "block");
        d3.select("#newSubstancesTile").select(".viz")
            .select("svg").select("g").selectAll("circle")
            .transition().duration(300)
            .style("opacity", 0)
            .attr("r", 0)
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .remove();

        d3.select("#newSubstancesTile").select(".viz")
            .select("svg").select("g").selectAll("text")
            .transition().duration(300)
            .style("opacity", 0)
            .attr("x", width / 2)
            .attr("y", height / 2)
            .remove();

        d3.select("#newSubstancesTile")
            .select("#legend").selectAll("div").transition().duration(200).style("opacity", 0)
            .remove();
    }
};

// let updatePieChart = function(data) {
//     d3.select("#" + data.tileId).select(".tileHeader").text(data.title);

//     const width = 540;
//     const height = 540;
//     const radius = Math.min(width, height) / 2;

//     const svg = d3.select("#" + data.tileId).select(".pieChart")
//         .select("svg").select("g");

//     var color = d3.scaleOrdinal(d3.schemeCategory10);

//     const pie = d3.pie()
//         .value(d => d.value.sum("count"))
//         .sort(null);

//     const arc = d3.arc()
//         .innerRadius(radius - 150)
//         .outerRadius(radius);

//     function type(d) {
//         d.length = Number(d.length);
//         return d.length;
//     }

//     function key(d) {
//         return d.key;
//     }

//     function findNeighborArc(i, data0, data1, key) {
//         var d;
//         return (d = findPreceding(i, data0, data1, key)) ? { startAngle: d.endAngle, endAngle: d.endAngle } :
//             (d = findFollowing(i, data0, data1, key)) ? { startAngle: d.startAngle, endAngle: d.startAngle } :
//             null;
//     }

//     // Find the element in data0 that joins the highest preceding element in data1.
//     function findPreceding(i, data0, data1, key) {
//         var m = data0.length;
//         while (--i >= 0) {
//             var k = key(data1[i].data);
//             //console.log(k)
//             for (var j = 0; j < m; ++j) {
//                 //console.log(key(data0[j].data))
//                 if (key(data0[j].data) === k) return data0[j];
//             }
//         }
//     }

//     // Find the element in data0 that joins the lowest following element in data1.
//     function findFollowing(i, data0, data1, key) {
//         var n = data1.length,
//             m = data0.length;
//         while (++i < n) {
//             var k = key(data1[i].data);
//             for (var j = 0; j < m; ++j) {
//                 if (key(data0[j].data) === k) return data0[j];
//             }
//         }
//     }

//     function arcTween(d) {

//         var i = d3.interpolate(this._current, d);

//         this._current = i(0);

//         return function(t) {
//             return arc(i(t))
//         }

//     }

//     function cloneObj(obj) {
//         var o = {};
//         for (var i in obj) {
//             o[i] = obj[i];
//         }
//         return o;
//     }

//     let path = svg.selectAll("path");
//     let data0 = path.data();
//     let data1 = pie(data.data);

//     path = path.data(data1, key);
//     // Join new data


//     // Update existing arcs
//     path.transition().duration(1000).attrTween("d", arcTween);

//     // Enter new arcs
//     path.enter().append("path")
//         .each(function(d, i) {
//             var narc = findNeighborArc(i, data0, data1, key);
//             if (narc) {
//                 this._current = narc;
//                 this._previous = narc;
//             }
//             else {
//                 this._current = d;
//             }
//         })
//         .transition()
//         .duration(1000)
//         .attrTween("d", arcTween)


//     path
//         .exit()
//         .transition()
//         .duration(1000)
//         .attrTween("d", function(d, index) {
//             var i = d3.interpolateObject(d, this._previous);
//             return function(t) {
//                 return arc(i(t))
//             }

//         })
//         .remove()

//     svg.selectAll("path")
//         .attr("fill", function(d, i) {
//             //console.log(i);
//             return color(d.data.key);
//         });

//     d3.select("#legend").selectAll("div").remove();

//     d3.select('#legend').selectAll('div')
//         .data(data.data)
//         .enter()
//         .append('div')
//         .attr('class', 'legendElement')
//         .style('padding', '3px 0px 3px 0px')
//         .style('margin-top', '8px')
//         .append('div')
//         .style('height', '25px')
//         .style('width', '25px')
//         .style('background-color', function(d, i) {
//             return color(d.key);
//         })
//         .style('vertical-align', 'middle')
//         .style('display', 'inline-block')

//     d3.select('#legend').selectAll('.legendElement')
//         .append('i')
//         .attr('class', 'fas fa-times-circle');

//     d3.select('#legend').selectAll('.legendElement')
//         .data(data.data)
//         .append('span')
//         .style('padding-left', '5px')
//         .style('overflow-wrap', 'break-word')
//         .text(function(d, i) {
//             return getDrugNameFromKey(d.key) + " (" + (((data1[i].endAngle - data1[i].startAngle) / 6.283185307179586) * 100).toFixed(2) + '%)';
//         });
// };

let checkIfStimulant = function(d) {
    return d.value[0]["drugCat"] === "S"
}

function wrap(text, width) {
    //console.log("in", text, width)
    text.each(function() {
        const text = d3.select(this);
        let words = text.text().split(/\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        let lineHeight = 1.1;
        let x = text.attr("x");
        let y = text.attr("y");
        let dy = 0.25; //this may need to change depending on the orientation of the graph usually this number is 0
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
                    .attr("dy", +lineHeight + "em")
                    .text(word);

            }

        }
    });
}

let generateBarGraph = function(data) {

    data.data.sort(function(a, b) {
        return a.value.sum("count") - b.value.sum("count") || b.key.localeCompare(a.key);
    });
    if (data.tileId == "benzoTile" || data.tileId == "opioidTile" || data.tileId == "stimulantTile" || data.tileId == "newSubstancesTile" || data.tileId == "controlledSubstanceTile") {
        let otherIndex = data.data.findIndex(function(d) {
            return d.key === "Other opioids" || d.key === "Autres opioïdes" || d.key === "Autres benzodiazépines" || d.key === "Other benzodiazepines" || d.key === "Other stimulants" || d.key === "Autres stimulants" || d.key === "Other substances" || d.key === "Autres substances" || d.key === "Other controlled substances" || d.key === "Autres substances controlées"
        })
        if (otherIndex != -1)
            data.data.unshift(data.data.splice(otherIndex, 1)[0]);
    }
    d3.select("#" + data.tileId).select(".tileHeader").text(data.title);
    //set up svg using margin conventions - we'll need plenty of room on the left for labels
    let margin = {
        top: 15,
        right: 40,
        bottom: 15,
        left: 240
    };

    // if (data.tileId == "cannabisTile") {
    //     margin.left = 300;
    // }

    let width = 450 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    d3.select("#" + data.tileId).select("svg").remove();
    let svg = d3.select("#" + data.tileId).select(".barGraph").append("svg")
        .attr("width", function() {
            if (isIE)
                return width + margin.left + margin.right
            else {}
        })
        .attr("height", function() {
            if (isIE)
                return height + margin.top + margin.bottom
            else {}
        })

        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 450 400")

        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let x = d3.scaleLinear()
        .range([0, width])
        .domain([0, d3.max(data.data, function(d) {

            return d.value.sum("count");
        })]);

    let padding;


    let y = d3.scaleBand()
        .rangeRound([height, 0])
        .padding(0.3)
        .domain(data.data.map(function(d) {
            return getDrugNameFromKey(d.key);
        }));

    let color = d3.scaleOrdinal(d3.schemeCategory10);


    //make y axis to show bar names

    let gy = svg.append("g")
        .attr("class", "y axis")
        .call(axisLeft(y))

    gy.append("text")
        .attr("x", 2)
        .attr("y", 0)
        .attr("dy", "0em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .attr("font-size", "18px")
        .text(function() {
            if (language == "en")
                return "Number of samples"
            else
                return "Nombre d'échantillons"
        });

    gy.append("text")
        .attr("x", -10)
        .attr("y", 0)
        .attr("dy", "0em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "end")
        .attr("font-size", "18px")
        .text(function() {
            if (language == "en")
                return "Substance"
            else
                return "Substance"
        });


    let bars = svg.selectAll(".bar")
        .data(data.data)
        .enter()
        .append("g")
        .attr("class", "gBar");

    //append rects
    bars.append("rect")
        .attr("class", "bar")
        .attr("y", function(d) {
            return (y(getDrugNameFromKey(d.key)) + y.bandwidth() / 2) - 12.5;
        })
        .style("fill", function(d) {
            if (d.key == "Other controlled substances" || d.key == "Autres substances controlées" || d.key == "Other substances" || d.key == "Autres substances") {
                return "#808080"
            }
            if (checkIfCannabis(d)) {
                return "#ABE071"
            }
            else if (checkIfBenzo(d)) {
                return "#9EDCF5"
            }
            else if (checkIfOpioid(d)) {
                return "#4D6FC2"
            }
            else if (checkIfStimulant(d)) {
                return "#FF645E"
            }
            else {
                return "#808080"
            }
        })
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .attr("height", 25)
        .attr("x", 1)
        .attr("width", function(d) {
            return x(d.value.sum("count"));
        });

    //add a value label to the right of each bar
    bars.append("text")
        .attr("class", "label")
        //y position of the label is halfway down the bar
        .attr("y", function(d) {
            return y(getDrugNameFromKey(d.key)) + y.bandwidth() / 2 + 4;
        })
        //x position is 3 pixels to the right of the bar
        .attr("x", function(d) {
            return x(d.value.sum("count")) + 3;
        })
        .text(function(d) {
            return d3.format(",d")(d.value.sum("count"));
        })

    //console.log(data);
    if (data.descText != null) {
        d3.select("#" + data.tileId).select(".descriptionText").html(data.descText);
    }

};

let updateBarGraph = function(data) {
    console.log("in", data.tileId)
    // console.log(data)
    data.data.sort(function(a, b) {
        return a.value.sum("count") - b.value.sum("count") || b.key.localeCompare(a.key);
    });

    if (data.tileId == "benzoTile" || data.tileId == "opioidTile" || data.tileId == "stimulantTile" || data.tileId == "newSubstancesTile" || data.tileId == "controlledSubstanceTile") {
        let otherIndex = data.data.findIndex(function(d) {
            return d.key === "Other opioids" || d.key === "Autres opioïdes" || d.key === "Autres benzodiazépines" || d.key === "Other benzodiazepines" || d.key === "Other stimulants" || d.key === "Autres stimulants" || d.key === "Other substances" || d.key === "Autres substances" || d.key === "Other controlled substances" || d.key === "Autres substances controlées"
        })
        if (otherIndex != -1)
            data.data.unshift(data.data.splice(otherIndex, 1)[0]);
    }
    // console.log(data)
    d3.select("#" + data.tileId).select(".tileHeader").text(data.title);
    //set up svg using margin conventions - we'll need plenty of room on the left for labels
    let margin = {
        top: 15,
        right: 40,
        bottom: 15,
        left: 240
    };


    if (data.tileId == "cannabisTile") {
        margin.left = 300;
    }

    let width = 450 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    let svg = d3.select("#" + data.tileId).select(".barGraph").select("svg").select("g");

    let x = d3.scaleLinear()
        .range([0, width])
        .domain([0, d3.max(data.data, function(d) {
            return d.value.sum("count");
        })]);

    let y = d3.scaleBand()
        .rangeRound([height, 0])
        .padding(0.1)
        .domain(data.data.map(function(d) {
            return getDrugNameFromKey(d.key);
        }));

    let color = d3.scaleOrdinal(d3.schemeCategory10);

    //make y axis to show bar names

    let gy = svg.select(".y")
        .transition().duration(350)
        .call(axisLeft(y))

    // svg.selectAll(".y g text");




    let bars = svg.selectAll(".gBar")
        .data(data.data);

    bars.each(function(d) {
        d3.select(this).select(".bar")
            .transition().duration(350)
            .attr("y", function() {
                return (y(getDrugNameFromKey(d.key)) + y.bandwidth() / 2) - 12.5;
            })
            .style("fill", function(d) {
                if (d.key == "Other controlled substances" || d.key == "Autres substances controlées" || d.key == "Other substances" || d.key == "Autres substances") {
                    return "#808080"
                }
                if (checkIfCannabis(d)) {
                    return "#ABE071"
                }
                else if (checkIfBenzo(d)) {
                    return "#9EDCF5"
                }
                else if (checkIfOpioid(d)) {
                    return "#4D6FC2"
                }
                else if (checkIfStimulant(d)) {
                    return "#FF645E"
                }
                else {
                    return "#808080"
                }
            })
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .attr("height", 25)
            .attr("width", function(d) {
                return x(d.value.sum("count"));
            });

        d3.select(this).select(".label")
            .transition().duration(350)
            //y position of the label is halfway down the bar
            .attr("y", function(d) {
                return y(getDrugNameFromKey(d.key)) + y.bandwidth() / 2 + 4;
            })
            //x position is 3 pixels to the right of the bar
            .attr("x", function(d) {
                return x(d.value.sum("count")) + 3;
            })
            .text(function(d) {
                return numberFormat(d.value.sum("count"));
            });
    });
    //append rects
    bars.enter().append("g")
        .attr("class", "gBar")
        .each(function(d) {
            d3.select(this).append("rect")
                .attr("class", "bar")
                .attr("y", function() {
                    return (y(getDrugNameFromKey(d.key)) + y.bandwidth() / 2) - 12.5;
                })
                .attr("x", 1)
                .style("opacity", 0)
                .interrupt()
                .transition().duration(350)
                .style("fill", function(d) {
                    if (d.key == "Other controlled substances" || d.key == "Autres substances controlées") {
                        return "#808080"
                    }
                    if (checkIfCannabis(d)) {
                        return "#ABE071"
                    }
                    else if (checkIfBenzo(d)) {
                        return "#9EDCF5"
                    }
                    else if (checkIfOpioid(d)) {
                        return "#4D6FC2"
                    }
                    else if (checkIfStimulant(d)) {
                        return "#FF645E"
                    }
                    else {
                        return "#808080"
                    }
                })
                .style("opacity", 1)

                .style("stroke", "black")
                .style("stroke-width", "1px")
                .attr("height", 25)
                .attr("width", function(d) {
                    return x(d.value.sum("count"));
                });;
            d3.select(this).append("text").attr("class", "label")
                .attr("y", function(d) {
                    return y(getDrugNameFromKey(d.key)) + y.bandwidth() / 2 + 4;
                })

                //x position is 3 pixels to the right of the bar
                .style("opacity", 0)
                .interrupt()
                .transition().duration(350)
                .style("opacity", 1)

                //x position is 3 pixels to the right of the bar
                .attr("x", function(d) {
                    return x(d.value.sum("count")) + 3;
                })
                .text(function(d) {
                    return d.value.sum("count");
                });
        })
        .merge(bars);

    bars.exit().style("opacity", 1).interrupt()
        .transition().duration(350)
        .style("opacity", 0)
        .remove();

    if (data.descText != null) {
        d3.select("#" + data.tileId).select(".descriptionText").html(data.descText);
    }
    else {
        d3.select("#" + data.tileId).select(".descriptionText").html("");
    }
};

let updateTitle = function() {
    d3.select("#province").text(function() {
        return provinceJson[curProvince];
    });

    d3.select("#quarter").text(function() {
        if (language == "en")
            return "January to December - 2020";
        else
            return "Janvier à Décembre - 2020"

    });
};

let getDrugNameFromKey = function(name) {
    let drugRow = lookup.filter(function(data) {
        return data["LIMS"] === name;
    })[0];


    if (drugRow === undefined) {
        return name;
    }
    if (language == "en") {
        if (ignoreTitleCase.includes(name) || ignoreTitleCaseCSV.includes(name))
            return drugRow["Name - English"]
        return titleCase(drugRow["Name - English"]);
    }
    else {
        if (ignoreTitleCase.includes(name) || ignoreTitleCaseCSV.includes(name))
            return drugRow["Name - French"]
        if (drugRow["Name - French"].split(" ").length > 1)
            return drugRow["Name - French"]
        else {
            console.log(drugRow["Name - French"])
            return titleCase(drugRow["Name - French"])
        }
    }


};

let tablulateQuantData = function() {
    let data = generateQuantTableData();
    //console.log("here", data)
    let languageKey;
    if (language == "en") {
        languageKey = "Name (English)"
    }
    else {
        languageKey = "Name (French)"
    }
    d3.selectAll("#quantTile table tbody *").remove()
    // data.forEach(function(d, i) {
    //     if (typeof(quant_lookup[d["drug"]]) != "undefined")
    //         $("#quantTile table tbody").append("<tr><td>" + quant_lookup[d["drug"]][0][languageKey] + "</td><td>" + numberFormat(d["powderCount"]) + "</td><td>" + percentFormat(d["powderMean"]) + "</td><td>" + numberFormat(d["tabletCount"]) + "</td><td>" + percentFormat(d["tabletMean"]) + "</td></tr>")
    // })

    Object.keys(quant_lookup).forEach(function(d, i) {
        let obj = data.filter(function(e) {
            return e.drug == d;
        })
        if (obj.length == 0) {
            $("#quantTile table tbody").append("<tr><td>" + quant_lookup[d][0][languageKey] + "</td><td>" + numberFormat(0) + "</td><td>" + percentFormat(0) + "</td><td>" + numberFormat(0) + "</td><td>" + percentFormat(0) + "</td></tr>")
        }
        else
            $("#quantTile table tbody").append("<tr><td>" + quant_lookup[d][0][languageKey] + "</td><td>" + numberFormat(obj[0]["powderCount"]) + "</td><td>" + percentFormat(obj[0]["powderMean"]) + "</td><td>" + numberFormat(obj[0]["tabletCount"]) + "</td><td>" + percentFormat(obj[0]["tabletMean"]) + "</td></tr>")

    })

    // if (curProvince == "CA") {
    //     $("#quantTile").css("display", "block")
    // }
    // else {
    //     $("#quantTile").css("display", "none")
    // }

};

let generateQuantTableData = function() {
    let tableData = [];
    let filteredData;


    // console.log(drugSummary["Quarters"]["Quant"])

    if ($("#quarters").val() == "all") {
        filteredData = drugSummary["Quarters"]["Quant"].filter(function(d) {
            return d.quarter.slice(0, 4) == $("#years").val();
        })
        filteredData = d3.nest()
            .key(function(d) {
                return d['drug'];
            })
            .rollup(function(leaves) {
                return leaves;
            })
            .entries(filteredData);
        // console.log(filteredData)

        let quantArray = [];
        filteredData.forEach(function(drug, i) {
            let quantObj = { drug: drug.key, powderMean: 0, powderCount: 0, tabletMean: 0, tabletCount: 0 }
            drug.value.forEach(function(drugObj, j) {

                quantObj.powderCount += +drugObj.powderCount

                if (!isNaN(drugObj.powderMean))
                    quantObj.powderMean = +drugObj.powderMean / 3

                quantObj.tabletCount += +drugObj.tabletCount

                if (!isNaN(drugObj.tabletMean))
                    quantObj.tabletMean = +drugObj.tabletMean / 3
            })
            quantObj.powderMean = quantObj.powderMean.toFixed(1)
            quantObj.tabletMean = quantObj.tabletMean.toFixed(1)
            quantArray.push(quantObj)
        })
        return quantArray;

    }
    else {
        filteredData = drugSummary["Quarters"]["Quant"].filter(function(d) {
            return d.quarter.slice(0, 4) == $("#years").val() && d.quarter.slice(4) == $("#quarters").val();
        })
        filteredData.forEach(function(drugObj, i) {
            if (drugObj.powderMean != "")
                drugObj.powderMean = parseFloat(drugObj.powderMean).toFixed(1)
            if (drugObj.tabletMean != "")
                drugObj.tabletMean = parseFloat(drugObj.tabletMean).toFixed(1)
        })
        return filteredData
    }
};

let generatePanCanadianData = function() {
    let panCanData = [];
    let columns = ["Province", "Opioids", "Cannabis", "Stimulants", "Benzodiazepines"];
    Object.keys(provinceJson).forEach(function(d, i) {
        if (d !== "CA") {
            let provinceObj = {};
            provinceObj["Province"] = d;

            curData = getDataForProvinceByQuarter($("#quarters").val(), d);

            provinceObj["Opioids"] = getOpioidDrugTotals().totalCount;
            provinceObj["Cannabis"] = getCannabisDrugTotals().totalCount;
            provinceObj["Stimulants"] = getStimulantDrugTotals().totalCount;
            provinceObj["Benzodiazepines"] = getBenzoDrugTotals().totalCount;


            panCanData.push(provinceObj);
        }
        panCanData["columns"] = columns;
    });

    return JSON.stringify(panCanData);
};

let panCanData = {
    "2020": {
        "all": [
            { "Province": "ON", "Opioids": 9207, "Cannabis": 4192, "Stimulants": 17154, "Benzodiazepines": 1421 },
            { "Province": "NL", "Opioids": 55, "Cannabis": 113, "Stimulants": 192, "Benzodiazepines": 14 },
            { "Province": "QC", "Opioids": 1015, "Cannabis": 7691, "Stimulants": 15453, "Benzodiazepines": 1288 },
            { "Province": "AB", "Opioids": 2753, "Cannabis": 818, "Stimulants": 7285, "Benzodiazepines": 482 },
            { "Province": "MB", "Opioids": 453, "Cannabis": 152, "Stimulants": 1744, "Benzodiazepines": 96 },
            { "Province": "SK", "Opioids": 233, "Cannabis": 251, "Stimulants": 1239, "Benzodiazepines": 31 },
            { "Province": "BC", "Opioids": 6481, "Cannabis": 1201, "Stimulants": 7295, "Benzodiazepines": 730 },
            { "Province": "NS", "Opioids": 99, "Cannabis": 289, "Stimulants": 670, "Benzodiazepines": 64 },
            { "Province": "NB", "Opioids": 206, "Cannabis": 209, "Stimulants": 1035, "Benzodiazepines": 142 },
            { "Province": "T", "Opioids": 29, "Cannabis": 31, "Stimulants": 126, "Benzodiazepines": 6 },
            { "Province": "PE", "Opioids": 21, "Cannabis": 21, "Stimulants": 154, "Benzodiazepines": 5 }
        ]
    },
    "2021": {
        "Q1": [{ "Province": "ON", "Opioids": 3833, "Cannabis": 1547, "Stimulants": 4189, "Benzodiazepines": 1135 }, { "Province": "NL", "Opioids": 10, "Cannabis": 6, "Stimulants": 44, "Benzodiazepines": 1 }, { "Province": "QC", "Opioids": 294, "Cannabis": 1565, "Stimulants": 4191, "Benzodiazepines": 394 }, { "Province": "AB", "Opioids": 597, "Cannabis": 199, "Stimulants": 1450, "Benzodiazepines": 159 }, { "Province": "MB", "Opioids": 94, "Cannabis": 33, "Stimulants": 397, "Benzodiazepines": 23 }, { "Province": "SK", "Opioids": 78, "Cannabis": 33, "Stimulants": 273, "Benzodiazepines": 17 }, { "Province": "BC", "Opioids": 1457, "Cannabis": 309, "Stimulants": 1563, "Benzodiazepines": 242 }, { "Province": "NS", "Opioids": 55, "Cannabis": 52, "Stimulants": 214, "Benzodiazepines": 16 }, { "Province": "NB", "Opioids": 39, "Cannabis": 50, "Stimulants": 280, "Benzodiazepines": 22 }, { "Province": "T", "Opioids": 2, "Cannabis": 16, "Stimulants": 43, "Benzodiazepines": 2 }, { "Province": "PE", "Opioids": 3, "Cannabis": 2, "Stimulants": 13, "Benzodiazepines": 0 }]
    }
}


let panCanDataXAxis = {
    "en": { "ON": "ON", "NL": "NL", "QC": "QC", "AB": "AB", "MB": "MB", "SK": "SK", "BC": "BC", "NS": "NS", "NB": "NB", "T": "Territories", "PE": "PE" },
    "fr": { "ON": "ON", "NL": "NL", "QC": "QC", "AB": "AB", "MB": "MB", "SK": "SK", "BC": "BC", "NS": "NS", "NB": "NB", "T": "Territoires", "PE": "PE" }
}
let panCanClassList = {
    "en": { "ON": "ON", "NL": "NL", "QC": "QC", "AB": "AB", "MB": "MB", "SK": "SK", "BC": "BC", "NS": "NS", "NB": "NB", "Territories": "T", "PE": "PE" },
    "fr": { "ON": "ON", "NL": "NL", "QC": "QC", "AB": "AB", "MB": "MB", "SK": "SK", "BC": "BC", "NS": "NS", "NB": "NB", "Territoires": "T", "PE": "PE" }
}
panCanData["columns"] = ["Province", "Opioids", "Cannabis", "Benzodiazepines", "Stimulants"];
var frenchColumns = ["Province", "Opioïdes", "Cannabis", "Benzodiazépines", "Stimulants"]
//console.log(panCanData)

// let generatePanCanVisual = function(){
//     let data = panCanData;
//     d3.select("#panCanTile").select(".multiBarGraph").append("svg").attr("width", 450).attr("height", $(window).height() - 250);
//     var svg = d3.select("#panCanTile").select(".multiBarGraph").select("svg"),
//         margin = {top: 20, right: 115, bottom: 30, left: 40},
//         width = +svg.attr("width") - margin.left - margin.right,
//         height = +svg.attr("height") - margin.top - margin.bottom,
//         g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//     // The scale spacing the groups:
//     var y0 = d3.scaleBand()
//         .rangeRound([height, 0])
//         .paddingInner(0.1);

//     // The scale for spacing each group's bar:
//     var y1 = d3.scaleBand()
//         .padding(0.05);

//     var x = d3.scaleLinear()
//         .rangeRound([0, width]);

//     //change this to a json => drug: color
//     var z = d3.scaleOrdinal()
//         .range(["#4D6FC2", "#ABE071", "#9EDCF5", "#FF645E"]);


//         var keys = data.columns.slice(1);

//         data = data.sort(function (a,b) {
//             return a.Stimulants - b.Stimulants;
//         })

//         //console.log('keys');
//         //console.log(keys);
//         y0.domain(data.map(function(d) { return d.Province; }));
//         y1.domain(keys).rangeRound([0, y0.bandwidth()]);
//         x.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

//     g.append("g")
//         .attr("class", "provinceGroup")
//         .selectAll("rect")
//         .data(data)
//         .enter()
//         .append("rect")
//         .attr("cursor", "pointer")
//         .attr("class", function (d,i) {
//             return d["Province"]
//         })
//         .attr("width", (width+18))

//         .style("stroke", "black")
//         .style("stroke-width", "1px")
//         .style("opacity", function (d) {
//             if(d["Province"] !== curProvince){
//                 return 0
//             }
//             else{
//                 return 0.1
//             }
//         })
//         .attr("height", y1.bandwidth() * 5)
//         .attr("y", function (d,i) {
//             return y0(d["Province"]) - 2
//         })
//         .attr("x", 1)
//         .on("click", function (d) {
//             if(d["Province"] == curProvince){
//                 $("#selectProvince").val("CA").change();
//                 updatePage();
//             }
//             else{
//                 $("#selectProvince").val(d["Province"]).change();
//                 updatePage();
//             }
//         })
//         .on("mouseover", function (d) {
//             d3.select(this).style("opacity", 0.1);

//             // d3.select("#hovLocation").text(provinceJson[d["Province"]]);
//             // d3.select("#hovOpioids").text(d["Opioids"]);
//             // d3.select("#hovCannabis").text(d["Cannabis"]);
//             // d3.select("#hovStimulants").text(d["Stimulants"]);
//             // d3.select("#hovBenzo").text(d["Benzodiazepines"]);
//         })
//         .on("mouseout", function (d) {
//             if(d["Province"] !== curProvince){
//                 d3.select(this).style("opacity", 0);

//                 // d3.select("#hovLocation").text("");
//                 // d3.select("#hovOpioids").text("");
//                 // d3.select("#hovCannabis").text("");
//                 // d3.select("#hovStimulants").text("");
//                 // d3.select("#hovBenzo").text("");
//             }
//     })

//         g.append("g")
//             .attr("id","rectG")
//             .selectAll("g")
//             .data(data)
//             .enter().append("g")
//             .attr("class","bar")
//             .attr("id", function (d,i) {
//                 return d.Province+"g"
//             })
//             .attr("transform", function(d) { return "translate(0, "+ y0(d.Province) +")"; })
//             .attr("width", "100%")
//             .attr("pointer-events", "none")
//             .selectAll("rect")
//             .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
//             .enter().append("rect")
//             .attr("class", function (d) {
//                 return d.key;
//             })

//                 .style("stroke", "black")
//                 .style("stroke-width", "1px")
//             .attr("y", function(d) { return y1(d.key); })
//             .attr("x", function(d) { return 1; })
//             .attr("height", y1.bandwidth())
//             .attr("width", function(d) { return width - (width - x(d.value)); })
//             .attr("fill", function(d) { return z(d.key); });





//         g.append("g")
//             .attr("class", "axis")
//             // .attr("transform", "translate("+width+", 0)")
//             .call(axisLeft(y0));

//         g.append("g")
//             .attr("class", "y axis")
//             .call(d3.axisTop(x).ticks(null, "s"))
//             .append("text")
//             .attr("y", 2)
//             .attr("x", x(x.ticks().pop()) + 0.5)
//             .attr("dy", "0.32em")
//             .attr("fill", "#000")
//             .attr("font-weight", "bold")
//             .attr("text-anchor", "start")
//             .text(function(){
//                 if(language == "en")
//                     return "Number of samples"
//                 else
//                     return "pièces à conviction"
//             });

//         var legend = g.append("g")
//             .attr("font-family", "sans-serif")
//             .attr("font-size", 12)
//             .attr("text-anchor", "end")
//             .attr("transform", function() { return "translate(0," + (height - 75) + ")"; })
//             .selectAll("g")
//             .data(keys.slice())
//             .enter().append("g")
//             .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

//         legend.append("rect")
//             .attr("x", width - 17)
//             .attr("width", 15)
//             .attr("height", 15)
//             .attr("fill", z)
//             .attr("stroke", z)
//             .attr("stroke-width",2)
//             .attr("id", function (d) {
//                 //console.log(d);
//                 return "legend"+d;
//             })
//             .on("click",function(d) { update(d) });

//         legend.append("text")
//             .attr("x", width - 24)
//             .attr("y", 9.5)
//             .attr("dy", "0.32em")
//             .text(function(d, i) {
//                 if(language == "en")
//                     return panCanData["columns"][i+1];
//                 else
//                     return frenchColumns[i];

//             });

//         var filtered = [];

//         ////
//         //// Update and transition on click:
//         ////

//         function update(d) {

//             //
//             // Update the array to filter the chart by:
//             //

//             // add the clicked key if not included:
//             if (filtered.indexOf(d) == -1) {
//                 filtered.push(d);
//                 // if all bars are un-checked, reset:
//                 if(filtered.length == keys.length) filtered = [];
//             }
//             // otherwise remove it:
//             else {
//                 filtered.splice(filtered.indexOf(d), 1);
//             }

//             //
//             // Update the scales for each group(/states)'s items:
//             //
//             var newKeys = [];
//             keys.forEach(function(d) {
//                 if (filtered.indexOf(d) == -1 ) {
//                     newKeys.push(d);
//                 }
//             })
//             y1.domain(newKeys).rangeRound([0, y0.bandwidth()]);
//             x.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { if (filtered.indexOf(key) == -1) return d[key]; }); })]).nice();

//             // update the y axis:
//             svg.select(".y")
//                 .transition()
//                 .call(d3.axisTop(x).ticks(null, "s"))
//                 .duration(350);


//             //
//             // Filter out the bands that need to be hidden:
//             //
//             var bars = svg.selectAll(".bar").selectAll("rect")
//                 .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })

//             bars.filter(function(d) {
//                 return filtered.indexOf(d.key) > -1;
//             })
//                 .transition()
//                 .attr("y", function(d) {
//                     return (+d3.select(this).attr("y")) + (+d3.select(this).attr("height"))/2;
//                 })
//                 .attr("height",0)
//                 .attr("width",0)
//                 // .attr("y", function(d) { return height; })
//                 .duration(350);

//             //
//             // Adjust the remaining bars:
//             //
//             bars.filter(function(d) {
//                 return filtered.indexOf(d.key) == -1;
//             })
//                 .transition()
//                 .attr("y", function(d) { return y1(d.key); })
//                 .attr("x", function(d) { return 1; })
//                 .attr("height", y1.bandwidth())
//                 .attr("width", function(d) { return width - (width - x(d.value)); })
//                 .attr("fill", function(d) { return z(d.key); })
//                 .duration(350);


//             // update legend:
//             legend.selectAll("rect")
//                 .transition()
//                 .attr("fill",function(d) {
//                     if (filtered.length) {
//                         if (filtered.indexOf(d) == -1) {
//                             return z(d);
//                         }
//                         else {
//                             return "white";
//                         }
//                     }
//                     else {
//                         return z(d);
//                     }
//                 })
//                 .duration(100);


//         }


// };

let updatePanCanVisual = function() {
    var svg = d3.select("#panCanTile").select(".multiBarGraph").select("svg"),
        margin = { top: 20, right: 20, bottom: 70, left: 75 },
        width = 1100 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,
        g = svg.select("g");


    let data = panCanData[$("#years").val()][$("#quarters").val()];

    data.sort(function(a, b) {
        var nameA = a.Province.toLowerCase(),
            nameB = b.Province.toLowerCase()
        if (nameA < nameB) //sort string ascending
            return -1
        if (nameA > nameB)
            return 1
        return 0 //default return value (no sorting)
    })

    let keys = panCanData.columns.slice(1);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

    var barGroups = g.selectAll("g.bar").data(data);

    var bars = g.selectAll("g.bar").selectAll("rect")
        .data(function(d) {
            return keys.map(function(key) {
                return { key: key, value: d[key] };
            });
        });

    bars
        .transition().duration(750)
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });


    const yAxisTicks = y.ticks()
        .filter(Number.isInteger);
    const yAxis = d3.axisLeft(y)
        .tickValues(yAxisTicks)
        .tickFormat(d3.format(','));

    d3.select("#panCanTile").select(".y")
        .transition()
        .duration(350)
        .call(yAxis);

    d3.select("#panCanTile").select(".ygrid")
        .transition()
        .duration(350)
        .call(yAxis.ticks(null, "s").tickFormat("").tickSize(-width)).selectAll("line").style("opacity", 0.4)

    d3.select("#panCanTile").select(".ygrid").select(".domain").remove();


    createPanCanTable(generatePanCanTableData())
}

let generatePanCanVisual = function() {
    let data = panCanData[$("#years").val()][$("#quarters").val()];
    //console.log(data)
    data.sort(function(a, b) {
        var nameA = a.Province.toLowerCase(),
            nameB = b.Province.toLowerCase()
        if (nameA < nameB) //sort string ascending
            return -1
        if (nameA > nameB)
            return 1
        return 0 //default return value (no sorting)
    })

    data.forEach(function(d) {
        d["Province"] = panCanDataXAxis[language][d["Province"]]
    })
    d3.select("#panCanTile").select(".multiBarGraph").append("svg")
        .attr("width", function() {
            if (isIE)
                return 1100
            else {}
        })
        .attr("height", function() {
            if (isIE)
                return 400
            else {}
        })

        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1100 400")
    var svg = d3.select("#panCanTile").select(".multiBarGraph").select("svg").style("font-size", "16px"),
        margin = { top: 20, right: 20, bottom: 70, left: 75 },
        width = 1100 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
    var z = d3.scaleOrdinal()
        .range(["#4D6FC2", "#ABE071", "#9EDCF5", "#FF645E"]);


    var keys;

    // if(language == "en"){
    keys = panCanData.columns.slice(1);
    // }
    // else{
    //     keys = frenchColumns.slice(1)
    // }

    //console.log('keys');
    //console.log(keys);
    x0.domain(data.map(function(d) { return d.Province; }));
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();
    g.append("g")
        .attr("class", "ygrid")
        .call(d3.axisLeft(y).ticks(null, "s").tickFormat("").tickSize(-width)).selectAll("line").style("opacity", 0.15)
    g.select(".ygrid").select(".domain").remove();

    g.append("text")
        .attr("class", "yAxisTrendLabel2")
        .attr("transform", "translate(-60," + ((height / 2) + 20) + ")rotate(-90)")
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .text(function() {
            if (language == "en") {
                return "Number of samples"
            }
            else {
                return "Nombre d'échantillons"
            }
        })

    g.append("g")
        .attr("class", "provinceGroup")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", function(d, i) {
            return panCanClassList[language][d["Province"]]
        })
        .attr("height", height)
        .style("opacity", function(d) {
            if (panCanClassList[language][d["Province"]] !== curProvince) {
                return 0
            }
            else {
                return 0.1
            }
        })
        .style("cursor", "pointer")
        .attr("width", x1.bandwidth() * 4.5)
        .attr("x", function(d, i) {
            return x0(d["Province"]) - 1.5
        })
        // .attr("y", 8)
        .on("click", function(d) {
            let value = panCanClassList[language][d["Province"]];
            if (value != curProvince) {
                let newPdfString = pdfString.replace(/\${lang}/g, language).replace(/\${province}/g, value).replace(/\${year}/g, $("#years").val()).replace(/\${quarter}/g, $("#quarters").val());
                d3.select(".pdfDownload").attr("href", newPdfString);
                curProvince = value
                $("#selectProvince").val(value).change();
                $("#selectProvinceTrend").val(value).change();
                updatePage();
                trendChange(value);
            }
            else {
                let newPdfString = pdfString.replace(/\${lang}/g, language).replace(/\${province}/g, "CA").replace(/\${year}/g, $("#years").val()).replace(/\${quarter}/g, $("#quarters").val());
                d3.select(".pdfDownload").attr("href", newPdfString);
                curProvince = "CA"
                $("#selectProvince").val("CA").change();
                $("#selectProvinceTrend").val("CA").change();
                updatePage();
                trendChange("CA");
            }
        })
        .on("mouseover", function(d) {
            d3.select(this).style("opacity", 0.1);

            d3.select("#hovLocation").text(provinceJson[panCanClassList[language][d["Province"]]]);
            d3.select("#hovOpioids").text(d["Opioids"]);
            d3.select("#hovCannabis").text(d["Cannabis"]);
            d3.select("#hovStimulants").text(d["Stimulants"]);
            d3.select("#hovBenzo").text(d["Benzodiazepines"]);
        })
        .on("mouseout", function(d) {
            if (panCanClassList[language][d["Province"]] !== curProvince) {
                d3.select(this).style("opacity", 0);

                d3.select("#hovLocation").text("");
                d3.select("#hovOpioids").text("");
                d3.select("#hovCannabis").text("");
                d3.select("#hovStimulants").text("");
                d3.select("#hovBenzo").text("");
            }
        })

    g.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x0(d.Province) + ",0)"; })
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
        .attr("stroke", "black")
        .attr("stroke-width", "1px");





    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0))
        .selectAll("text")
    // .attr("y", 12)
    // .attr("x", -21)
    // .attr("dy", ".35em")
    // .attr("transform", "rotate(-45)");

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y))
    // .append("text")
    // .attr("x", 2)
    // .attr("y", y(y.ticks().pop()) - 5.5)
    // .attr("dy", "0.32em")
    // .attr("fill", "#000")
    // .attr("font-weight", "bold")
    // .attr("text-anchor", "start")
    // .attr("font-size", "18px")
    // .text(function() {
    //     if (language == "en")
    //         return "Number of samples (k = 1,000)"
    //     else
    //         return "Nombre d'échantillons"
    // });

    g.append("text")
        .attr("class", "xAxisTrendLabel")
        .attr("transform", "translate(" + width / 2 + "," + (height + 45) + ")")
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .text(function() {
            return "Location"
        })
    var legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("class", "legendRect")
        .attr("x", width - 17)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", z)
        .attr("stroke", z)
        .attr("stroke-width", 2)
        .on("click", function(d) { update(d) });


    // d3.selectAll(".legendRect")
    //             <path id="svg_1" d="m1.59382,7.90332l5.74993,4.56244" stroke-opacity="null" stroke-linecap="undefined" stroke-linejoin="undefined" stroke-width="1.5" stroke="#000" fill-opacity="null" fill="none"/>
    //   <path id="svg_2" d="m6.40626,12.52826l7.31241,-9.31238" stroke-opacity="null" stroke-linecap="undefined" stroke-linejoin="undefined" stroke-width="1.5" stroke="#000" fill-opacity="null" fill="none"/>



    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d, i) {
            if (language == "en") {
                return panCanData["columns"].slice(1).reverse()[i]
            }
            else {
                return frenchColumns.slice(1).reverse()[i];
            }
        });

    var filtered = [];

    ////
    //// Update and transition on click:
    ////

    function update(d) {
        //console.log(d)
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
        y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { if (filtered.indexOf(key) == -1) return d[key]; }); })]).nice();



        // update the y axis:
        svg.select(".y")
            .transition()
            .call(d3.axisLeft(y).tickFormat(d3.format(',')))
            .duration(350);


        //
        // Filter out the bands that need to be hidden:
        //
        var bars = svg.selectAll(".bar").selectAll("rect")
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
            .duration(350);

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
            .duration(350);


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


};

let updateCurTable = function() {
    let curData = panCanData[$("#years").val()][$("#quarters").val()].find(function(d) {
        return panCanClassList[language][d["Province"]] === curProvince;
    });
    // //console.log(curData);
    // if(curData == undefined){
    //     d3.select("#curLocation").text();
    //     d3.select("#curOpioids").text();
    //     d3.select("#curCannabis").text();
    //     d3.select("#curStimulants").text();
    //     d3.select("#curBenzo").text();
    // }
    // else{
    //     d3.select("#curLocation").text(provinceJson[curData["Province"]]);
    //     d3.select("#curOpioids").text(curData["Opioids"]);
    //     d3.select("#curCannabis").text(curData["Cannabis"]);
    //     d3.select("#curStimulants").text(curData["Stimulants"]);
    //     d3.select("#curBenzo").text(curData["Benzodiazepines"]);
    // }

};

let generateTile = function(data) {
    if (data.data.length === 0) {
        d3.select("#" + data.tileId).select(".visual").style("display", "none");
        d3.select("#" + data.tileId).select(".noData").style("display", "inline-block");
    }
    else {
        d3.select("#" + data.tileId).select(".visual").style("display", "inline-block");
        d3.select("#" + data.tileId).select(".noData").style("display", "none");

        if (data.tileId === "opioidTile" || data.tileId === "benzoTile" || data.tileId === "stimulantTile" || data.tileId == "newSubstancesTile") {
            createTable(data);
            let opioidBarGraphData = data;
            opioidBarGraphData.data = opioidBarGraphData.data.slice(0, 11);
            generateBarGraph(opioidBarGraphData);

        }
        else if (data.tileId === "controlledSubstanceTile") {
            createMainSubTable(data);
            let opioidBarGraphData = data;
            opioidBarGraphData.data = opioidBarGraphData.data.slice(0, 11);
            generateBarGraph(opioidBarGraphData);
        }
        else {
            createTable(data);
            generateBarGraph(data);
        }
    }
};

let updateTile = function(data) {
    // console.log(data.tileId == "controlledSubstanceTile")
    if (data.data.length === 0) {
        $("#" + data.tileId + " .visual").fadeOut(200, function() {
            $("#" + data.tileId + " .noData").fadeIn();
        });
        // d3.select("#" + data.tileId).select(".visual").style("display", "none");
        // d3.select("#" + data.tileId).select(".noData").style("display", "inline-block");
    }
    else {
        // console.log("in else")
        $("#" + data.tileId + " .noData").fadeOut(200, function() {
            $("#" + data.tileId + " .visual").fadeIn(200, function() {
                if (data.tileId === "opioidTile" || data.tileId === "benzoTile" || data.tileId === "stimulantTile" || data.tileId == "newSubstancesTile") {
                    createTable(data);
                    let opioidBarGraphData = data;
                    opioidBarGraphData.data = opioidBarGraphData.data.slice(0, 11);
                    updateBarGraph(opioidBarGraphData);
                }
                else if (data.tileId === "controlledSubstanceTile") {
                    // console.log("IN IF STATEMENT")
                    createMainSubTable(data);
                    let opioidBarGraphData = data;
                    opioidBarGraphData.data = opioidBarGraphData.data.slice(0, 11);
                    updateBarGraph(opioidBarGraphData);
                }
                else {
                    updateBarGraph(data);
                    createTable(data);
                }
            });
        });


    }
};

let checkNoData = function(data) {


};

let canadaData;

//Load Data
var csvfiles = [
    "/src/data/DAS/DAS_Raw_Data.csv", //0
    "/src/data/DAS/newsubs_new.csv", //1
    "/src/data/DAS/ignoreTitleCase.csv", //2
    "/src/data/DAS/quant_lookup.csv", //3
    "/src/data/DAS/quant_output.csv", //4
    "/src/data/DAS/das_raw_lookup.csv", //5
    "/src/data/DAS/trendData2020.csv" // 6
]
var promises = [];
csvfiles.forEach(function(url) {
    promises.push(d3.csv(url))
});

if (Promise && !Promise.allSettled) {
    Promise.allSettled = function(promises) {
        return Promise.all(promises.map(function(promise) {
            return promise.then(function(value) {
                return { state: 'fulfilled', value: value };
            }).catch(function(reason) {
                return { state: 'rejected', reason: reason };
            });
        }));
    };
}
Promise.allSettled(promises).then(function(values) {
    processData(values[0].value, values[1].value, values[2].value, values[3].value, values[4].value, values[5].value, values[6].value);
    return values[5].value;
})

let processData = function(outputData, newSubsData, ignoreTitleCaseData, quantLookupData, quantData, rawLookupData, trendData) {

    createDropdownOptions();


    $("#years").on("change", function() {
        updateDropdownOptions();

        if ($("#quarters").val() !== "all") {
            d3.select("#trends").style("display", "none")
            d3.select("#trendTitle").style("display", "none")
            d3.select("#trendTables").style("display", "none")
        }
        else {
            d3.select("#trends").style("display", "")
            d3.select("#trendTitle").style("display", "")
            d3.select("#trendTables").style("display", "")
        }

        updatePage();
        updatePanCanVisual();

        tablulateQuantData();

    })

    newSubs = d3.nest()
        .key(function(d) {
            return d['year'];
        }).key(function(d) {
            return d['quarter'];
        })
        .key(function(d) {
            return d['drug'];
        })
        .rollup(function(leaves) {
            return leaves;
        })
        .object(newSubsData);;
    //console.log(newSubs)
    ignoreTitleCaseCSV = [];
    ignoreTitleCaseData.forEach(function(d, i) {
        ignoreTitleCaseCSV.push(d.drug)
    })

    rawData = outputData;
    let nestedData = d3.nest()
        .key(function(d) {
            return d['year'];
        }).key(function(d) {
            return d['quarter'];
        })
        .key(function(d) {
            return d['province'];
        })
        .key(function(d) {
            return d['drug'];
        })
        .rollup(function(leaves) {
            return leaves;
        })
        .entries(outputData);

    drugSummary["Quarters"]["Count"] = nestedData;

    canadaData = d3.nest()
        .key(function(d) {
            return d['year'];
        }).key(function(d) {
            return d['quarter'];
        })
        .key(function(d) {
            return d['drug'];
        })
        .rollup(function(leaves) {
            return leaves;
        })
        .entries(outputData);

    quant_lookup = d3.nest()
        .key(function(d) {
            return d['Code'];
        })
        .object(quantLookupData);

    drugSummary["Quarters"]["Quant"] = quantData;

    tablulateQuantData();

    lookup = rawLookupData;

    nestedTrendData = d3.nest()
        .key(function(d) {
            return d['LOCATION'];
        })
        .rollup(function(leaves) {
            return leaves;
        })
        .entries(trendData);

    nestedTrendData[0].value.forEach(function(d) {
        d.CANNABIS = +d.CANNABIS;
        d.TOTAL = +d.TOTAL;
        d.COCAINE = +d.COCAINE;
        d.METHAMPHETAMINE = +d.METHAMPHETAMINE;
        d.FENTANYL = +d.FENTANYL;
        d.HEROIN = +d.HEROIN;
        //,HYDROMORPHONE,OXYCODONE,MORPHINE,CODEINE
        d.HYDROMORPHONE = +d.HYDROMORPHONE;
        d.OXYCODONE = +d.OXYCODONE;
        d.MORPHINE = +d.MORPHINE;
        d.CODEINE = +d.CODEINE;
        // d.YEAR = +d.YEAR;

        d.CARFENTANIL = +d.CARFENTANIL;
        d["FURANYL FENTANYL"] = +d["FURANYL FENTANYL"];
        d["ACETYL FENTANYL"] = +d["ACETYL FENTANYL"];
        d["CYCLOCPROPYL FENTANYL"] = +d["CYCLOCPROPYL FENTANYL"];
        d["MeOAc FENTANYL"] = +d["MeOAc FENTANYL"];
        d["OTHER ANALOGUES"] = +d["OTHER ANALOGUES"];
    });

    $(document).ready(function() {


        let queryStringValues = getParams(window.location.href);
        //console.log(queryStringValues)
        if (typeof(queryStringValues.p) != "undefined" || typeof(queryStringValues.y) != "undefined" || typeof(queryStringValues.q) != "undefined") {
            if (queryStringOptions["p"].indexOf(queryStringValues.p) != -1 && typeof(queryStringOptions["y"][queryStringValues.y]) != "undefined") {
                if (queryStringOptions["y"][queryStringValues.y].indexOf(queryStringValues.q) != -1) {
                    let value = queryStringValues.p;
                    curProvince = value;
                    $("#selectProvince").val(curProvince).change();
                    $("#selectProvinceTrend").val(curProvince).change();
                    $("#years").val(queryStringValues.y).change()
                    $("#quarters").val(queryStringValues.q).change()
                    trendChange(curProvince)
                }
            }
        }
        if ($("#quarters").val() !== "all") {
            d3.select("#trends").style("display", "none")
            d3.select("#trendTitle").style("display", "none")
            d3.select("#trendTables").style("display", "none")
        }
        else {
            d3.select("#trends").style("display", "")
            d3.select("#trendTitle").style("display", "")
            d3.select("#trendTables").style("display", "")
        }
        if (curProvince == "CA") {
            curData = getDataForCanadaByQuarter();
            //     d3.select("#quantTile").style("display", "block")
        }
        else {
            curData = getDataForProvinceByQuarter($("#quarters").val(), curProvince);
            //     console.log("in")
            //     d3.select("#quantTile").style("display", "none")
        }

        let newPdfString = pdfString.replace(/\${lang}/g, language).replace(/\${province}/g, curProvince).replace(/\${year}/g, $("#years").val()).replace(/\${quarter}/g, $("#quarters").val());
        d3.select(".pdfDownload").attr("href", newPdfString);

        d3.select(".pdfDownload").attr("disabled", null)


        updateTitle();

        generateTile(getCannabisDrugTotals());

        generateTile(getControlledSubstanceDrugTotals());

        generateTile(getOpioidDrugTotals());

        generateNewSubstanceVisual(getNewSubstancesDrugTotals());
        let newSubData = getNewSubstancesDrugTotals();
        newSubData.data = newSubData.data.slice(0, 11);
        generateBarGraph(newSubData);




        generateTile(getBenzoDrugTotals());

        generateTile(getStimulantDrugTotals());

        generatePanCanVisual();
        createPanCanTable(generatePanCanTableData())

        updateCurTable();




        //console.log(nestedTrendData);

        // format the data


        totalAndCan(nestedTrendData[0].value)
        cocaineAndMeth(nestedTrendData[0].value)
        fentAndHeroin(nestedTrendData[0].value)
        otherOpioids(nestedTrendData[0].value)
        mainFent(nestedTrendData[0].value)


        let trendTablesData = createTrendTableData();
        if (language == "en") {
            tabulateTrends(trendTablesData.slice(0, 2), "totalAndCanTable", "Samples Received")
            tabulateTrends(trendTablesData.slice(2, 4), "cocaineAndMethTable", "Cocaine and Methamphetamine")
            tabulateTrends(trendTablesData.slice(4, 6), "fentAndHeroinTable", "Fentanyl and Heroin")
            tabulateTrends(trendTablesData.slice(6, 10), "otherCommonTable", "Other Common Opioids")
            tabulateTrends(trendTablesData.slice(10, 16), "mainFentTable", "Main Fentanyl Analogues")
        }
        else {
            tabulateTrends(trendTablesData.slice(0, 2), "totalAndCanTable", "Échantillons reçus")
            tabulateTrends(trendTablesData.slice(2, 4), "cocaineAndMethTable", "Cocaïne et méthamphétamine")
            tabulateTrends(trendTablesData.slice(4, 6), "fentAndHeroinTable", "Fentanyl et héroïne")
            tabulateTrends(trendTablesData.slice(6, 10), "otherCommonTable", "Autres opioïdes courants")
            tabulateTrends(trendTablesData.slice(10, 16), "mainFentTable", "Principaux analogues du fentanyl")
        }

    });


}




let updateTotalAndCan = function(data) {
    var margin = { top: 20, right: 20, bottom: 120, left: 70 },
        width = 450 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%d-%b-%y");

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var color = d3.scaleOrdinal()
        .range(["rgb(0,146,146)", "rgb(73,0,146)"]);

    // define the 1st line
    var valueline = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.CANNABIS); });

    // define the 2nd line
    var valueline2 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.TOTAL); });
    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.YEAR; }));
    y.domain([0, d3.max(data, function(d) {
        return Math.max(d.CANNABIS, d.TOTAL) + (Math.max(d.CANNABIS, d.TOTAL) * 0.150);
    })]);
    // Add the valueline path.
    d3.select("#totalAndCan").select("svg").select("#cannabisLine")
        .data([data])
        .transition()
        .duration(350)
        .attr("d", valueline);

    d3.select("#totalAndCan").select("svg").select("#totalLine")
        .data([data])
        .transition()
        .duration(350)
        .attr("d", valueline2);

    // Add the X Axis
    d3.select("#canTotalx")
        .transition()
        .duration(350)
        .call(d3.axisBottom(x).ticks(8, "d"));

    const yAxisTicks = y.ticks()
        .filter(Number.isInteger);
    const yAxis = d3.axisLeft(y)
        .tickValues(yAxisTicks)
        .tickFormat(d3.format(','));

    // Add the Y Axis
    d3.select("#canTotaly")
        .transition()
        .duration(350)
        .call(yAxis);


    d3.selectAll(".totalCircle").each(function(d, i) {
        d3.select(this).transition()

            .duration(350)
            .attr("cx", function() {
                return x(data[i].YEAR)
            })
            .attr("cy", function() {
                return y(data[i].TOTAL)
            })
    })

    d3.selectAll(".canCircle").each(function(d, i) {
        d3.select(this).transition()
            .duration(350)
            .attr("cx", function() {
                return x(data[i].YEAR)
            })
            .attr("cy", function() {
                return y(data[i].CANNABIS)
            })
    })

    d3.select("#totalAndCan").select(".ygrid")
        .transition()
        .duration(350)
        .call(yAxis.ticks(null, "s").tickFormat("").tickSize(-width)).selectAll("line").style("opacity", 0.4)
    d3.select("#totalAndCan").select(".ygrid").select(".domain").remove();
}

let totalAndCan = function(data) {
    var margin = { top: 20, right: 20, bottom: 120, left: 70 },
        width = 450 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%d-%b-%y");

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var color = d3.scaleOrdinal()
        .range(["rgb(73,0,146)", "#abe071"]);

    // define the 1st line
    var valueline = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.CANNABIS); });

    // define the 2nd line
    var valueline2 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.TOTAL); });

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#totalAndCan").append("svg")
        .attr("width", function() {
            if (isIE)
                return width + margin.left + margin.right
            else {}
        })
        .attr("height", function() {
            if (isIE)
                return height + margin.top + margin.bottom
            else {}
        })

        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 450 450")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    svg.append("text")
        .attr("class", "xAxisTrendLabel")
        .attr("transform", "translate(" + (width / 2) + "," + (height + 40) + ")")
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .text(function() {
            if (language == "en") {
                return "Year";
            }
            else {
                return "Année";
            }
        })

    svg.append("text")
        .attr("class", "yAxisTrendLabel2")
        .attr("transform", "translate(-60," + ((height / 2) + 20) + ")rotate(-90)")
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .text(function() {
            if (language == "en") {
                return "Number of samples"
            }
            else {
                return "Nombre d'échantillons"
            }
        })

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.YEAR; }));
    y.domain([0, d3.max(data, function(d) {
        return Math.max(d.CANNABIS, d.TOTAL) + (Math.max(d.CANNABIS, d.TOTAL) * 0.150);
    })]);

    // Add the valueline path.
    // "rgb(0,146,146)", "rgb(73,0,146)"
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("id", "cannabisLine")
        .style("stroke", "#abe071")
        .attr("d", valueline);

    // Add the valueline2 path.
    svg.append("path")
        .data([data])
        .attr("id", "totalLine")
        .attr("class", "line")
        .style("stroke", "rgb(73,0,146)")
        .attr("d", valueline2);


    data.forEach(function(d, i) {
        svg.append("circle")
            .attr("class", "totalCircle")
            .attr("r", 3.5)
            .attr("cx", function() {
                return x(d.YEAR)
            })
            .attr("cy", function() {
                return y(d.TOTAL)
            })

        svg.append("circle")
            .attr("class", "canCircle")
            .attr("r", 3.5)
            .attr("cx", function() {
                return x(d.YEAR)
            })
            .attr("cy", function() {
                return y(d.CANNABIS)
            })

    })

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("id", "canTotalx")
        .call(d3.axisBottom(x).ticks(8, "d"));


    const yAxisTicks = y.ticks()
        .filter(Number.isInteger);
    const yAxis = d3.axisLeft(y)
        .tickValues(yAxisTicks)
        .tickFormat(d3.format(','));

    svg.append("g")
        .attr("id", "canTotaly")
        .call(yAxis);

    svg.append("g")
        .attr("class", "ygrid")
        .call(yAxis.ticks(null, "s").tickFormat("").tickSize(-width)).selectAll("line").style("opacity", 0.4)
    svg.select(".ygrid").select(".domain").remove();
    // Add the Y Axis


    const gLegendChart = svg.append("g").attr("class", "legendSexAgeChartSeverity")

    const legendSexAgeChart = gLegendChart.selectAll("legChart")
        .data(function() {
            if (language == "en")
                return ["Total", "Cannabis"];
            else
                return ["Total", "Cannabis"];

        })
        .enter().append("g")
        .attr("id", function(d, i) { return "leg" + i; })
        .attr("class", "legSexAge")
        .attr("transform", "translate(70, 360)")

    let j = 0;
    let j2 = 13;
    legendSexAgeChart.append("text")
        .text(function(d, i) {
            return d;
        })
        .attr("font-size", "15px")
        .style("text-anchor", "end")
        //.attr("x", (z.range()[0]+10))
        .attr("transform", function(d, i) { j = j + (d.length * j2); return "translate(" + (+j - 15) + ",12)"; })

    j = 0;
    j2 = 13;
    legendSexAgeChart.append("rect")
        .attr("height", 12)
        .attr("x", function(d, i) { j = j + (d.length * j2); return ((+j - 15) + 6); })
        .attr("transform", "translate(0,1)")
        .attr("width", 12)
        .attr("fill", function(d, i) { return color(i); })
        .attr("stroke", "#828080");

    $(".legendSexAgeChart").css("display", "block");


};

let cocaineAndMeth = function(data) {
    var margin = { top: 20, right: 20, bottom: 120, left: 70 },
        width = 450 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%d-%b-%y");

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var color = d3.scaleOrdinal()
        .range(["#FF0000", "#FF69B4"]);

    // define the 1st line
    var valueline = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.COCAINE); });

    // define the 2nd line
    var valueline2 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.METHAMPHETAMINE); });

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#CocaineAndMeth").append("svg")
        .attr("width", function() {
            if (isIE)
                return width + margin.left + margin.right
            else {}
        })
        .attr("height", function() {
            if (isIE)
                return height + margin.top + margin.bottom
            else {}
        })

        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 450 450")

        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    svg.append("text")
        .attr("class", "xAxisTrendLabel")
        .attr("transform", "translate(" + (width / 2) + "," + (height + 40) + ")")
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .text(function() {
            if (language == "en") {
                return "Year";
            }
            else {
                return "Année";
            }
        })

    svg.append("text")
        .attr("class", "yAxisTrendLabel2")
        .attr("transform", "translate(-60," + ((height / 2) + 20) + ")rotate(-90)")
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .text(function() {
            if (language == "en") {
                return "Number of samples"
            }
            else {
                return "Nombre d'échantillons"
            }
        })



    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.YEAR; }));
    y.domain([0, d3.max(data, function(d) {
        return Math.max(d.COCAINE, d.METHAMPHETAMINE) + (Math.max(d.COCAINE, d.METHAMPHETAMINE) * 0.150);
    })]);


    // Add the valueline path.
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("id", "cocaineLine")
        .style("stroke", "#FF0000")
        .attr("d", valueline);

    // Add the valueline2 path.
    svg.append("path")
        .data([data])
        .attr("id", "methLine")
        .attr("class", "line")
        .style("stroke", "#FF69B4")
        .attr("d", valueline2);

    data.forEach(function(d, i) {
        svg.append("circle")
            .attr("class", "cocaineCircle")
            .attr("r", 3.5)
            .attr("cx", function() {
                return x(d.YEAR)
            })
            .attr("cy", function() {
                return y(d.COCAINE)
            })

        svg.append("circle")
            .attr("class", "methCircle")
            .attr("r", 3.5)
            .attr("cx", function() {
                return x(d.YEAR)
            })
            .attr("cy", function() {
                return y(d.METHAMPHETAMINE)
            })

    })

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("id", "cmx")
        .call(d3.axisBottom(x).ticks(8, "d"));

    const yAxisTicks = y.ticks()
        .filter(Number.isInteger);
    const yAxis = d3.axisLeft(y)
        .tickValues(yAxisTicks)
        .tickFormat(d3.format(','));

    // Add the Y Axis
    svg.append("g")
        .attr("id", "cmy")
        .call(yAxis);

    svg.append("g")
        .attr("class", "ygrid")
        .call(yAxis.ticks(null, "s").tickFormat("").tickSize(-width)).selectAll("line").style("opacity", 0.4)
    svg.select(".ygrid").select(".domain").remove();

    const gLegendChart = svg.append("g").attr("class", "legendSexAgeChartSeverity")

    const legendSexAgeChart = gLegendChart.selectAll("legChart")
        .data(function() {
            if (language == "en")
                return ["Cocaine", "Methamphetamine"];
            else {
                return ["Cocaïne", "Méthamphétamine"]
            }
        })
        .enter().append("g")
        .attr("id", function(d, i) { return "leg" + i; })
        .attr("class", "legSexAge")
        .attr("transform", "translate(70, 360)")

    let j = 0;
    let j2 = 11;
    legendSexAgeChart.append("text")
        .text(function(d, i) {
            return d;
        })
        .attr("font-size", "15px")
        .style("text-anchor", "end")
        //.attr("x", (z.range()[0]+10))
        .attr("transform", function(d, i) { j = j + (d.length * j2); return "translate(" + (+j - 15) + ",12)"; })

    j = 0;
    j2 = 11;
    legendSexAgeChart.append("rect")
        .attr("height", 12)
        .attr("x", function(d, i) { j = j + (d.length * j2); return ((+j - 15) + 6); })
        .attr("transform", "translate(0,1)")
        .attr("width", 12)
        .attr("fill", function(d, i) { return color(i); })
        .attr("stroke", "#828080");

    $(".legendSexAgeChart").css("display", "block");


};

let updateCocaineAndMeth = function(data) {
    var margin = { top: 20, right: 20, bottom: 120, left: 70 },
        width = 450 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%d-%b-%y");

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var color = d3.scaleOrdinal()
        .range(["#FF645E", "blue"]);

    // define the 1st line
    var valueline = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.COCAINE); });

    // define the 2nd line
    var valueline2 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.METHAMPHETAMINE); });
    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.YEAR; }));
    y.domain([0, d3.max(data, function(d) {
        return Math.max(d.COCAINE, d.METHAMPHETAMINE) + (Math.max(d.COCAINE, d.METHAMPHETAMINE) * 0.150);
    })]);
    // Add the valueline path.
    d3.select("#CocaineAndMeth").select("svg").select("#cocaineLine")
        .data([data])
        .transition()
        .duration(350)
        .attr("d", valueline);

    d3.select("#CocaineAndMeth").select("svg").select("#methLine")
        .data([data])
        .transition()
        .duration(350)
        .attr("d", valueline2);

    // Add the X Axis
    d3.select("#cmx")
        .transition()
        .duration(350)
        .call(d3.axisBottom(x).ticks(8, "d"));

    const yAxisTicks = y.ticks()
        .filter(Number.isInteger);
    const yAxis = d3.axisLeft(y)
        .tickValues(yAxisTicks)
        .tickFormat(d3.format(','));

    // Add the Y Axis
    d3.select("#cmy")
        .transition()
        .duration(350)
        .call(yAxis);

    d3.selectAll(".cocaineCircle").each(function(d, i) {
        d3.select(this).transition()
            .duration(350)
            .attr("cx", function() {
                return x(data[i].YEAR)
            })
            .attr("cy", function() {
                return y(data[i].COCAINE)
            })
    })

    d3.selectAll(".methCircle").each(function(d, i) {
        d3.select(this).transition()
            .duration(350)
            .attr("cx", function() {
                return x(data[i].YEAR)
            })
            .attr("cy", function() {
                return y(data[i].METHAMPHETAMINE)
            })
    })

    d3.select("#CocaineAndMeth").select(".ygrid")
        .transition()
        .duration(350)
        .call(yAxis.ticks(null, "s").tickFormat("").tickSize(-width)).selectAll("line").style("opacity", 0.4)
    d3.select("#CocaineAndMeth").select(".ygrid").select(".domain").remove();
};

let fentAndHeroin = function(data) {
    var margin = { top: 20, right: 20, bottom: 120, left: 60 },
        width = 450 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%d-%b-%y");

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var color = d3.scaleOrdinal()
        .range(["rgb(0,146,146)", "rgb(73,0,146)"]);

    // define the 1st line
    var valueline = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.FENTANYL); });

    // define the 2nd line
    var valueline2 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.HEROIN); });

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#fentAndHeroin").append("svg")
        .attr("width", function() {
            if (isIE)
                return width + margin.left + margin.right
            else {}
        })
        .attr("height", function() {
            if (isIE)
                return height + margin.top + margin.bottom
            else {}
        })

        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 450 450")

        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    svg.append("text")
        .attr("class", "xAxisTrendLabel")
        .attr("transform", "translate(" + (width / 2) + "," + (height + 40) + ")")
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .text(function() {
            if (language == "en") {
                return "Year";
            }
            else {
                return "Année";
            }
        })

    svg.append("text")
        .attr("class", "yAxisTrendLabel2")
        .attr("transform", "translate(-50," + ((height / 2) + 20) + ")rotate(-90)")
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .text(function() {
            if (language == "en") {
                return "Number of samples"
            }
            else {
                return "Nombre d'échantillons"
            }
        })

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.YEAR; }));
    y.domain([0, d3.max(data, function(d) {
        return Math.max(d.FENTANYL, d.HEROIN) + (Math.max(d.FENTANYL, d.HEROIN) * 0.150);
    })]);





    // "rgb(0,146,146)", "rgb(73,0,146)", "rgb(182,109,255)", "rgb(146,73,0)"
    // Add the valueline path.
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("id", "fentLine")
        .style("stroke", "rgb(0,146,146)")
        .attr("d", valueline);

    // Add the valueline2 path.
    svg.append("path")
        .data([data])
        .attr("id", "heroinLine")
        .attr("class", "line")
        .style("stroke", "rgb(73,0,146)")
        .attr("d", valueline2);

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("id", "fhx")
        .call(d3.axisBottom(x).ticks(8, "d"));
    const yAxisTicks = y.ticks()
        .filter(Number.isInteger);
    const yAxis = d3.axisLeft(y)
        .tickValues(yAxisTicks)
        .tickFormat(d3.format(','));
    // Add the Y Axis
    svg.append("g")
        .attr("id", "fhy")
        .call(yAxis);

    svg.append("g")
        .attr("class", "ygrid")
        .call(yAxis.ticks(null, "s").tickFormat("").tickSize(-width)).selectAll("line").style("opacity", 0.4)
    svg.select(".ygrid").select(".domain").remove();

    data.forEach(function(d, i) {
        svg.append("circle")
            .attr("class", "fentCircle")
            .attr("r", 3.5)
            .attr("cx", function() {
                return x(d.YEAR)
            })
            .attr("cy", function() {
                return y(d.FENTANYL)
            })

        svg.append("circle")
            .attr("class", "heroinCircle")
            .attr("r", 3.5)
            .attr("cx", function() {
                return x(d.YEAR)
            })
            .attr("cy", function() {
                return y(d.HEROIN)
            })

    })

    const gLegendChart = svg.append("g").attr("class", "legendSexAgeChartSeverity")

    const legendSexAgeChart = gLegendChart.selectAll("legChart")
        .data(function() {
            if (language == "en")
                return ["Fentanyl", "Heroin"];
            else
                return ["Fentanyl", "Héroïne"]
        })
        .enter().append("g")
        .attr("id", function(d, i) { return "leg" + i; })
        .attr("class", "legSexAge")
        .attr("transform", "translate(70, 360)")

    let j = 0;
    let j2 = 13;
    legendSexAgeChart.append("text")
        .text(function(d, i) {
            return d;
        })
        .attr("font-size", "15px")
        .style("text-anchor", "end")
        //.attr("x", (z.range()[0]+10))
        .attr("transform", function(d, i) { j = j + (d.length * j2); return "translate(" + (+j - 15) + ",12)"; })

    j = 0;
    j2 = 13;
    legendSexAgeChart.append("rect")
        .attr("height", 12)
        .attr("x", function(d, i) { j = j + (d.length * j2); return ((+j - 15) + 6); })
        .attr("transform", "translate(0,1)")
        .attr("width", 12)
        .attr("fill", function(d, i) { return color(i); })
        .attr("stroke", "#828080");

    $(".legendSexAgeChart").css("display", "block");


};

let updatefentAndHeroin = function(data) {
    var margin = { top: 20, right: 20, bottom: 120, left: 60 },
        width = 450 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%d-%b-%y");

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var color = d3.scaleOrdinal()
        .range(["#FF645E", "blue"]);

    // define the 1st line
    var valueline = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.FENTANYL); });

    // define the 2nd line
    var valueline2 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.HEROIN); });
    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.YEAR; }));
    y.domain([0, d3.max(data, function(d) {
        return Math.max(d.FENTANYL, d.HEROIN) + (Math.max(d.FENTANYL, d.HEROIN) * 0.15);
    })]);
    // Add the valueline path.
    d3.select("#fentAndHeroin").select("svg").select("#fentLine")
        .data([data])
        .transition()
        .duration(350)
        .attr("d", valueline);

    d3.select("#fentAndHeroin").select("svg").select("#heroinLine")
        .data([data])
        .transition()
        .duration(350)
        .attr("d", valueline2);

    d3.selectAll(".fentCircle").each(function(d, i) {
        d3.select(this).transition()
            .duration(350)
            .attr("cx", function() {
                return x(data[i].YEAR)
            })
            .attr("cy", function() {
                return y(data[i].FENTANYL)
            })
    })

    d3.selectAll(".heroinCircle").each(function(d, i) {
        d3.select(this).transition()
            .duration(350)
            .attr("cx", function() {
                return x(data[i].YEAR)
            })
            .attr("cy", function() {
                return y(data[i].HEROIN)
            })
    })

    // Add the X Axis
    d3.select("#fhx")
        .transition().duration(350)
        .call(d3.axisBottom(x).ticks(8, "d"));

    const yAxisTicks = y.ticks()
        .filter(Number.isInteger);
    const yAxis = d3.axisLeft(y)
        .tickValues(yAxisTicks)
        .tickFormat(d3.format(','));

    // Add the Y Axis
    d3.select("#fhy")
        .transition().duration(350)
        .call(yAxis);

    d3.select("#fentAndHeroin").select(".ygrid")
        .transition().duration(350)
        .call(yAxis.ticks(null, "s").tickFormat("").tickSize(-width)).selectAll("line").style("opacity", 0.4)
    d3.select("#fentAndHeroin").select(".ygrid").select(".domain").remove();
};

let otherOpioids = function(data) {
    var margin = { top: 20, right: 20, bottom: 120, left: 60 },
        width = 450 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%d-%b-%y");

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var color = d3.scaleOrdinal()

        // rgb(0,146,146)", "rgb(73,0,146)", "rgb(182,109,255)", "rgb(146,73,0)", "rgb(219,109,0)", "rgb(255,182,219)
        .range(["rgb(0,146,146)", "rgb(73,0,146)", "rgb(182,109,255)", "rgb(146,73,0)"]);

    // define the 1st line
    var valueline = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.HYDROMORPHONE); });

    // define the 2nd line
    var valueline2 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.OXYCODONE); });

    var valueline3 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.MORPHINE); });

    var valueline4 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.CODEINE); });

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#otherCommon").append("svg")
        .attr("width", function() {
            if (isIE)
                return width + margin.left + margin.right
            else {}
        })
        .attr("height", function() {
            if (isIE)
                return height + margin.top + margin.bottom
            else {}
        })

        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 450 450")

        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    svg.append("text")
        .attr("class", "xAxisTrendLabel")
        .attr("transform", "translate(" + (width / 2) + "," + (height + 40) + ")")
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .text(function() {
            if (language == "en") {
                return "Year";
            }
            else {
                return "Année";
            }
        })

    svg.append("text")
        .attr("class", "yAxisTrendLabel2")
        .attr("transform", "translate(-50," + ((height / 2) + 20) + ")rotate(-90)")
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .text(function() {
            if (language == "en") {
                return "Number of samples"
            }
            else {
                return "Nombre d'échantillons"
            }
        })

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.YEAR; }));
    y.domain([0, d3.max(data, function(d) {
        return Math.max(d.HYDROMORPHONE, d.OXYCODONE, d.MORPHINE, d.CODEINE) + (Math.max(d.HYDROMORPHONE, d.OXYCODONE, d.MORPHINE, d.CODEINE) * 0.15);
    })]);



    // Add the valueline path.
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("id", "hLine")
        .style("stroke", "rgb(0,146,146)")
        .attr("d", valueline);

    // Add the valueline2 path.
    svg.append("path")
        .data([data])
        .attr("id", "oLine")
        .attr("class", "line")
        .style("stroke", "rgb(73,0,146)")
        .attr("d", valueline2);

    svg.append("path")
        .data([data])
        .attr("id", "mLine")
        .attr("class", "line")
        .style("stroke", "rgb(182,109,255)")
        .attr("d", valueline3);

    svg.append("path")
        .data([data])
        .attr("id", "cLine")
        .attr("class", "line")
        .style("stroke", "rgb(146,73,0)")
        .attr("d", valueline4);

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("id", "ox")
        .call(d3.axisBottom(x).ticks(8, "d"));

    const yAxisTicks = y.ticks()
        .filter(Number.isInteger);
    const yAxis = d3.axisLeft(y)
        .tickValues(yAxisTicks)
        .tickFormat(d3.format(','));

    // Add the Y Axis
    svg.append("g")
        .attr("id", "oy")
        .call(yAxis);


    svg.append("g")
        .attr("class", "ygrid")
        .call(yAxis.ticks(null, "s").tickFormat("").tickSize(-width)).selectAll("line").style("opacity", 0.4)
    svg.select(".ygrid").select(".domain").remove();

    data.forEach(function(d, i) {
        // //console.log(d)
        svg.append("circle")
            .attr("class", "hydromorphoneCircle")
            .attr("r", 3.5)
            .attr("cx", function() {
                return x(d.YEAR)
            })
            .attr("cy", function() {
                return y(d.HYDROMORPHONE)
            })

        svg.append("circle")
            .attr("class", "oxycodoneCircle")
            .attr("r", 3.5)
            .attr("cx", function() {
                return x(d.YEAR)
            })
            .attr("cy", function() {
                return y(d.OXYCODONE)
            })

        svg.append("circle")
            .attr("class", "morphineCircle")
            .attr("r", 3.5)
            .attr("cx", function() {
                return x(d.YEAR)
            })
            .attr("cy", function() {
                return y(d.MORPHINE)
            })

        svg.append("circle")
            .attr("class", "codeineCircle")
            .attr("r", 3.5)
            .attr("cx", function() {
                return x(d.YEAR)
            })
            .attr("cy", function() {
                return y(d.CODEINE)
            })

    })

    const gLegendChart = svg.append("g").attr("class", "legendSexAgeChartSeverity")

    const legendSexAgeChart = gLegendChart.selectAll("legChart")
        .data(function() {
            if (language == "en")
                return ["Hydromorphone", "Oxycodone", "Morphine", "Codeine"];
            else
                return ["Hydromorphone", "Oxycodone", "Morphine", "Codéine"]
        })
        .enter().append("g")
        .attr("id", function(d, i) { return "leg" + i; })
        .attr("class", "legSexAge")
        .attr("transform", "translate(25, 360)")

    let j = 0;
    let j2 = 12;
    legendSexAgeChart.append("text")
        .text(function(d, i) {
            return d;
        })
        .attr("font-size", "15px")
        .style("text-anchor", "end")
        //.attr("x", (z.range()[0]+10))
        .attr("transform", function(d, i) { j = j + (d.length * j2); return "translate(" + (+j - 100) + ",12)"; })

    j = 0;
    j2 = 12;
    legendSexAgeChart.append("rect")
        .attr("height", 12)
        .attr("x", function(d, i) { j = j + (d.length * j2); return ((+j - 100) + 6); })
        .attr("transform", "translate(0,1)")
        .attr("width", 12)
        .attr("fill", function(d, i) { return color(i); })
        .attr("stroke", "#828080");

    $(".legendSexAgeChart").css("display", "block");


};

let updateOther = function(data) {
    var margin = { top: 20, right: 20, bottom: 120, left: 60 },
        width = 450 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%d-%b-%y");

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var color = d3.scaleOrdinal()
        .range(["#FF645E", "blue", "green", "purple"]);

    // define the 1st line
    var valueline = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.HYDROMORPHONE); });

    // define the 2nd line
    var valueline2 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.OXYCODONE); });

    var valueline3 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.MORPHINE); });

    var valueline4 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.CODEINE); });



    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.YEAR; }));
    y.domain([0, d3.max(data, function(d) {
        return Math.max(d.HYDROMORPHONE, d.OXYCODONE, d.MORPHINE, d.CODEINE) + (Math.max(d.HYDROMORPHONE, d.OXYCODONE, d.MORPHINE, d.CODEINE) * 0.15);
    })]);

    // Add the valueline path.
    d3.select("#hLine")
        .data([data])
        .transition().duration(350)
        .attr("d", valueline);

    // Add the valueline2 path.
    d3.select("#oLine")
        .data([data])
        .transition().duration(350)
        .attr("d", valueline2);

    d3.select("#mLine")
        .data([data])
        .transition().duration(350)
        .attr("d", valueline3);

    d3.select("#cLine")
        .data([data])
        .transition().duration(350)
        .attr("d", valueline4);
    // Add the valueline path.

    d3.selectAll(".hydromorphoneCircle").each(function(d, i) {
        d3.select(this).transition().duration(350)
            .attr("cx", function() {
                return x(data[i].YEAR)
            })
            .attr("cy", function() {
                return y(data[i].HYDROMORPHONE)
            })
    })

    d3.selectAll(".oxycodoneCircle").each(function(d, i) {
        d3.select(this).transition().duration(350)
            .attr("cx", function() {
                return x(data[i].YEAR)
            })
            .attr("cy", function() {
                return y(data[i].OXYCODONE)
            })
    })

    d3.selectAll(".morphineCircle").each(function(d, i) {
        d3.select(this).transition().duration(350)
            .attr("cx", function() {
                //console.log((data[i].YEAR))
                return x(data[i].YEAR)
            })
            .attr("cy", function() {
                //console.log(data[i])
                return y(data[i].MORPHINE)
            })
    })

    d3.selectAll(".codeineCircle").each(function(d, i) {
        d3.select(this).transition().duration(350)
            .attr("cx", function() {
                return x(data[i].YEAR)
            })
            .attr("cy", function() {
                return y(data[i].CODEINE)
            })
    })

    // Add the X Axis
    d3.select("#ox")
        .transition().duration(350)
        .call(d3.axisBottom(x).ticks(8, "d"));

    const yAxisTicks = y.ticks()
        .filter(Number.isInteger);
    const yAxis = d3.axisLeft(y)
        .tickValues(yAxisTicks)
        .tickFormat(d3.format(','));

    // Add the Y Axis
    d3.select("#oy")
        .transition().duration(350)
        .call(yAxis);

    d3.select("#otherCommon").select(".ygrid")
        .transition().duration(350)
        .call(yAxis.ticks(null, "s").tickFormat("").tickSize(-width)).selectAll("line").style("opacity", 0.4)
    d3.select("#otherCommon").select(".ygrid").select(".domain").remove();
};

let mainFent = function(data) {
    var margin = { top: 20, right: 20, bottom: 120, left: 60 },
        width = 1000 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%d-%b-%y");

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var color = d3.scaleOrdinal()
        .range(["rgb(0,146,146)", "rgb(73,0,146)", "rgb(182,109,255)", "rgb(146,73,0)", "rgb(219,109,0)", "rgb(255,182,219)"]);

    //CARFENTANIL,FURANYL FENTANYL,ACETYL FENTANYL,CYCLOCPROPYL FENTANYL,MeOAc FENTANYL,OTHER ANALOGUES
    // define the 1st line
    var valueline = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.CARFENTANIL); });

    // define the 2nd line
    var valueline2 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d["FURANYL FENTANYL"]); });

    var valueline3 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d["ACETYL FENTANYL"]); });

    var valueline4 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d["CYCLOCPROPYL FENTANYL"]); });

    var valueline5 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d["MeOAc FENTANYL"]); });

    var valueline6 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d["OTHER ANALOGUES"]); });

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#mainFent").append("svg")
        .attr("width", function() {
            if (isIE)
                return width + margin.left + margin.right
            else {}
        })
        .attr("height", function() {
            if (isIE)
                return height + margin.top + margin.bottom
            else {}
        })

        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1000 450")

        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    svg.append("text")
        .attr("class", "xAxisTrendLabel")
        .attr("transform", "translate(" + (width / 2) + "," + (height + 40) + ")")
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .text(function() {
            if (language == "en") {
                return "Year";
            }
            else {
                return "Année";
            }
        })

    svg.append("text")
        .attr("class", "yAxisTrendLabel2")
        .attr("transform", "translate(-50," + ((height / 2) + 20) + ")rotate(-90)")
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .text(function() {
            if (language == "en") {
                return "Number of samples"
            }
            else {
                return "Nombre d'échantillons"
            }
        })

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.YEAR; }));
    y.domain([0, d3.max(data, function(d) {
        return Math.max(d.CARFENTANIL = +d.CARFENTANIL,
                d["FURANYL FENTANYL"] = +d["FURANYL FENTANYL"],
                d["ACETYL FENTANYL"] = +d["ACETYL FENTANYL"],
                d["CYCLOCPROPYL FENTANYL"] = +d["CYCLOCPROPYL FENTANYL"],
                d["MeOAc FENTANYL"] = +d["MeOAc FENTANYL"],
                d["OTHER ANALOGUES"] = +d["OTHER ANALOGUES"]) +
            (Math.max(d.CARFENTANIL = +d.CARFENTANIL,
                d["FURANYL FENTANYL"] = +d["FURANYL FENTANYL"],
                d["ACETYL FENTANYL"] = +d["ACETYL FENTANYL"],
                d["CYCLOCPROPYL FENTANYL"] = +d["CYCLOCPROPYL FENTANYL"],
                d["MeOAc FENTANYL"] = +d["MeOAc FENTANYL"],
                d["OTHER ANALOGUES"] = +d["OTHER ANALOGUES"]) * 0.15);
    })]);




    // Add the valueline path.
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("id", "carfentLine")
        .style("stroke", "rgb(0,146,146)")
        .attr("d", valueline);

    // Add the valueline2 path.
    svg.append("path")
        .data([data])
        .attr("id", "furanylLine")
        .attr("class", "line")
        .style("stroke", "rgb(73,0,146)")
        .attr("d", valueline2);

    svg.append("path")
        .data([data])
        .attr("id", "acetylLine")
        .attr("class", "line")
        .style("stroke", "rgb(182,109,255)")
        .attr("d", valueline3);

    svg.append("path")
        .data([data])
        .attr("id", "cycloLine")
        .attr("class", "line")
        .style("stroke", "rgb(146,73,0)")
        .attr("d", valueline4);

    svg.append("path")
        .data([data])
        .attr("id", "MeOAcLine")
        .attr("class", "line")
        .style("stroke", "rgb(219,109,0)")
        .attr("d", valueline5);

    svg.append("path")
        .data([data])
        .attr("id", "otherALine")
        .attr("class", "line")
        .style("stroke", "rgb(255,182,219)")
        .attr("d", valueline6);

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("id", "mx")
        .call(d3.axisBottom(x).ticks(8, "d"));

    const yAxisTicks = y.ticks()
        .filter(Number.isInteger);
    const yAxis = d3.axisLeft(y)
        .tickValues(yAxisTicks)
        .tickFormat(d3.format(','));

    // Add the Y Axis
    svg.append("g")
        .attr("id", "my")
        .call(yAxis);

    svg.append("g")
        .attr("class", "ygrid")
        .call(yAxis.ticks(null, "s").tickFormat("").tickSize(-width)).selectAll("line").style("opacity", 0.4)
    svg.select(".ygrid").select(".domain").remove();

    data.forEach(function(d, i) {

        //CARFENTANIL,FURANYL FENTANYL,ACETYL FENTANYL,CYCLOCPROPYL FENTANYL,MeOAc FENTANYL,OTHER ANALOGUES

        //console.log(d)
        svg.append("circle")
            .attr("class", "carfentCircle")
            .attr("r", 3.5)
            .attr("cx", function() {
                return x(d.YEAR)
            })
            .attr("cy", function() {
                return y(d.CARFENTANIL)
            })

        svg.append("circle")
            .attr("class", "furanylCircle")
            .attr("r", 3.5)
            .attr("cx", function() {
                return x(d.YEAR)
            })
            .attr("cy", function() {
                return y(d["FURANYL FENTANYL"])
            })

        svg.append("circle")
            .attr("class", "acetylCircle")
            .attr("r", 3.5)
            .attr("cx", function() {
                return x(d.YEAR)
            })
            .attr("cy", function() {
                return y(d["ACETYL FENTANYL"])
            })

        svg.append("circle")
            .attr("class", "cyclocpropylCircle")
            .attr("r", 3.5)
            .attr("cx", function() {
                return x(d.YEAR)
            })
            .attr("cy", function() {
                return y(d["CYCLOCPROPYL FENTANYL"])
            })


        svg.append("circle")
            .attr("class", "meoacCircle")
            .attr("r", 3.5)
            .attr("cx", function() {
                return x(d.YEAR)
            })
            .attr("cy", function() {
                return y(d["MeOAc FENTANYL"])
            })

        svg.append("circle")
            .attr("class", "otherCircle")
            .attr("r", 3.5)
            .attr("cx", function() {
                return x(d.YEAR)
            })
            .attr("cy", function() {
                return y(d["OTHER ANALOGUES"])
            })

    })

    const gLegendChart = svg.append("g").attr("class", "legendSexAgeChartSeverity")


    const legendSexAgeChart = gLegendChart.selectAll("legChart")
        .data(function() {
            if (language == "en")
                return ["Carfentanil", "Furanyl Fentanyl", "Acetyl Fentanyl", "Cyclopropyl Fentanyl", "MeOAc Fentanyl", "Other Analogues"];
            else
                return ["Carfentanil", "Furanyl fentanyl", "Acétyl fentanyl", "Cyclopropyl fentanyl", "MeOAc fentanyl", "Autres analogues"];


        })
        .enter().append("g")
        .attr("id", function(d, i) { return "leg" + i; })
        .attr("class", "legSexAge")
        .attr("transform", "translate(70, 360)")

    let j = 0;
    let j2 = 10;
    legendSexAgeChart.append("text")
        .text(function(d, i) {
            return d;
        })
        .attr("font-size", "15px")
        .style("text-anchor", "end")
        //.attr("x", (z.range()[0]+10))
        .attr("transform", function(d, i) { j = j + (d.length * j2); return "translate(" + (+j - 145) + ",12)"; })

    j = 0;
    j2 = 10;
    legendSexAgeChart.append("rect")
        .attr("height", 12)
        .attr("x", function(d, i) { j = j + (d.length * j2); return ((+j - 145) + 6); })
        .attr("transform", "translate(0,1)")
        .attr("width", 12)
        .attr("fill", function(d, i) { return color(i); })
        .attr("stroke", "#828080");

    $(".legendSexAgeChart").css("display", "block");


};

let updateMainFent = function(data) {
    var margin = { top: 20, right: 20, bottom: 120, left: 60 },
        width = 1000 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%d-%b-%y");

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var color = d3.scaleOrdinal()
        .range(["#FF645E", "blue", "green", "purple", "orange", "lightblue"]);

    //CARFENTANIL,FURANYL FENTANYL,ACETYL FENTANYL,CYCLOCPROPYL FENTANYL,MeOAc FENTANYL,OTHER ANALOGUES
    // define the 1st line
    var valueline = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.CARFENTANIL); });

    // define the 2nd line
    var valueline2 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d["FURANYL FENTANYL"]); });

    var valueline3 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d["ACETYL FENTANYL"]); });

    var valueline4 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d["CYCLOCPROPYL FENTANYL"]); });

    var valueline5 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d["MeOAc FENTANYL"]); });

    var valueline6 = d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d["OTHER ANALOGUES"]); });

    x.domain(d3.extent(data, function(d) { return d.YEAR; }));
    y.domain([0, d3.max(data, function(d) {
        return Math.max(d.CARFENTANIL = +d.CARFENTANIL,
                d["FURANYL FENTANYL"] = +d["FURANYL FENTANYL"],
                d["ACETYL FENTANYL"] = +d["ACETYL FENTANYL"],
                d["CYCLOCPROPYL FENTANYL"] = +d["CYCLOCPROPYL FENTANYL"],
                d["MeOAc FENTANYL"] = +d["MeOAc FENTANYL"],
                d["OTHER ANALOGUES"] = +d["OTHER ANALOGUES"]) +
            (Math.max(d.CARFENTANIL = +d.CARFENTANIL,
                d["FURANYL FENTANYL"] = +d["FURANYL FENTANYL"],
                d["ACETYL FENTANYL"] = +d["ACETYL FENTANYL"],
                d["CYCLOCPROPYL FENTANYL"] = +d["CYCLOCPROPYL FENTANYL"],
                d["MeOAc FENTANYL"] = +d["MeOAc FENTANYL"],
                d["OTHER ANALOGUES"] = +d["OTHER ANALOGUES"]) * 0.15);
    }) + 1]);

    d3.selectAll(".carfentCircle").each(function(d, i) {
        d3.select(this).transition().duration(350)
            .attr("cx", function() {
                return x(data[i].YEAR)
            })
            .attr("cy", function() {
                return y(data[i].CARFENTANIL)
            })
    })

    d3.selectAll(".furanylCircle").each(function(d, i) {
        d3.select(this).transition().duration(350)
            .attr("cx", function() {
                return x(data[i].YEAR)
            })
            .attr("cy", function() {
                return y(data[i]["FURANYL FENTANYL"])
            })
    })

    d3.selectAll(".acetylCircle").each(function(d, i) {
        d3.select(this).transition().duration(350)
            .attr("cx", function() {
                return x(data[i].YEAR)
            })
            .attr("cy", function() {
                return y(data[i]["ACETYL FENTANYL"])
            })
    })


    d3.selectAll(".cyclocpropylCircle").each(function(d, i) {
        d3.select(this).transition().duration(350)
            .attr("cx", function() {
                return x(data[i].YEAR)
            })
            .attr("cy", function() {
                return y(data[i]["CYCLOCPROPYL FENTANYL"])
            })
    })

    d3.selectAll(".meoacCircle").each(function(d, i) {
        d3.select(this).transition().duration(350)
            .attr("cx", function() {
                return x(data[i].YEAR)
            })
            .attr("cy", function() {
                return y(data[i]["MeOAc FENTANYL"])
            })
    })

    d3.selectAll(".otherCircle").each(function(d, i) {
        d3.select(this).transition().duration(350)
            .attr("cx", function() {
                return x(data[i].YEAR)
            })
            .attr("cy", function() {
                return y(data[i]["OTHER ANALOGUES"])
            })
    })
    // Add the valueline path.
    d3.select("#carfentLine")
        .data([data])
        .transition().duration(350)
        .attr("d", valueline);

    // Add the valueline2 path.
    d3.select("#furanylLine")
        .data([data])
        .transition().duration(350)
        .attr("d", valueline2);

    d3.select("#acetylLine")
        .data([data])
        .transition().duration(350)
        .attr("d", valueline3);

    d3.select("#cycloLine")
        .data([data])
        .transition().duration(350)
        .attr("d", valueline4);

    d3.select("#MeOAcLine")
        .data([data])
        .transition().duration(350)
        .attr("d", valueline5);

    d3.select("#otherALine")
        .data([data])
        .transition().duration(350)
        .attr("d", valueline6);


    // Add the X Axis
    d3.select("#mx")
        .transition().duration(350)
        .call(d3.axisBottom(x).ticks(8, "d"));

    const yAxisTicks = y.ticks()
        .filter(Number.isInteger);
    const yAxis = d3.axisLeft(y)
        .tickValues(yAxisTicks)
        .tickFormat(d3.format(','));

    // Add the Y Axis
    d3.select("#my")
        .transition().duration(350)
        .call(yAxis);

    d3.select("#mainFent").select(".ygrid")
        .transition().duration(350)
        .call(yAxis.tickFormat("").tickSize(-width)).selectAll("line").style("opacity", 0.4)
    d3.select("#mainFent").select(".ygrid").select(".domain").remove();
};

let createDefs = function(svg) {
    svg.append("defs")
        .attr('id', 'drugPatterns')
        .append("pattern")
        .attr("id", "linePatternClose")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 10)
        .attr("height", 5)

    svg.select("#linePatternClose")
        .append("path")
        .attr("d", 'M 10, 0 l 0, 20')
        .attr("stroke-width", 3)
        .attr("shape-rendering", "crispEdges")
        .attr("stroke", "white")
        .attr("stroke-linecap", "square");

    svg.select("defs")
        .append("pattern")
        .attr("id", "linePatternFar")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 35)
        .attr("height", 5)

    svg.select("#linePatternFar")
        .append("path")
        .attr("d", 'M 10, 0 l 0, 20')
        .attr("stroke-width", 3)
        .attr("shape-rendering", "crispEdges")
        .attr("stroke", "white")
        .attr("stroke-linecap", "square");
}

let createTrendTableData = function() {
    let drugKeys = Object.keys(nestedTrendData[0].value[0]).slice(2, nestedTrendData[0].value[0].length);
    let drugTitleCaseKeys = ["Total", "Cannabis", "Methamphetamine", "Cocaine", "Fentanyl", "Heroin", "Hydromorphone", "Oxycodone", "Morphine", "Codeine", "Carfentanil", "Furanyl Fentanyl", "Acetyl Fentanyl", "Cyclopropyl Fentanyl", "MeOAc Fentanyl", "Other Analogues"]
    let provinceIndex = nestedTrendData.map(function(e) { return e.key; }).indexOf($("#selectProvinceTrend").val());
    let drugTitleCaseKeysFR = ["Total", "Cannabis", "Méthamphétamine", "Cocaïne", "Fentanyl", "Héroïne", "Hydromorphone", "Oxycodone", "Morphine", "Codeïne", "Carfentanil", "Furanyl fentanyl", "Acétyl fentanyl", "Cyclopropyl fentanyl", "MeOAc Fentanyl", "Autres Analogues"]
    let dataArray = [];


    let objCounter = 0;
    drugKeys.forEach(function(drug, index) {
        let trendObj = {}
        nestedTrendData[provinceIndex].value.forEach(function(row, j) {
            trendObj[row.YEAR] = row[drug]
        })
        if (language == "en")
            trendObj["Substance"] = drugTitleCaseKeys[index]
        else
            trendObj["Substance"] = drugTitleCaseKeysFR[index]


        dataArray.push(trendObj);
    })
    // console.log(dataArray)

    dataArray.splice(2, 1, dataArray.splice(3, 1, dataArray[2])[0]);
    //Substance:tasd, 2012:123, 2013:123, ...

    return dataArray;
}
let trendChange = function(value) {
    d3.select("#trendProvince").text(function() {
        if (language == "en") {
            return provinceJson[value]
        }
        else
            return provinceJsonFR[value]
        return value;
    })

    //console.log(nestedTrendData)

    let index = nestedTrendData.findIndex(function(item, i) {
        return item.key === value
    });

    // format the data
    nestedTrendData[index].value.forEach(function(d) {
        d.CANNABIS = +d.CANNABIS;
        d.TOTAL = +d.TOTAL;
        d.COCAINE = +d.COCAINE;
        d.METHAMPHETAMINE = +d.METHAMPHETAMINE;
        d.FENTANYL = +d.FENTANYL;
        d.HEROIN = +d.HEROIN;
        // d.YEAR = +d.YEAR;
        d.HYDROMORPHONE = +d.HYDROMORPHONE;
        d.OXYCODONE = +d.OXYCODONE;
        d.MORPHINE = +d.MORPHINE;
        d.CODEINE = +d.CODEINE;

        d.CARFENTANIL = +d.CARFENTANIL;
        d["FURANYL FENTANYL"] = +d["FURANYL FENTANYL"];
        d["ACETYL FENTANYL"] = +d["ACETYL FENTANYL"];
        d["CYCLOCPROPYL FENTANYL"] = +d["CYCLOCPROPYL FENTANYL"];
        d["MeOAc FENTANYL"] = +d["MeOAc FENTANYL"];
        d["OTHER ANALOGUES"] = +d["OTHER ANALOGUES"];


    });

    updateTotalAndCan(nestedTrendData[index].value)
    updateCocaineAndMeth(nestedTrendData[index].value)
    updatefentAndHeroin(nestedTrendData[index].value)
    updateOther(nestedTrendData[index].value)
    updateMainFent(nestedTrendData[index].value)

    let trendTablesData = createTrendTableData();
    if (language == "en") {
        tabulateTrends(trendTablesData.slice(0, 2), "totalAndCanTable", "Samples Received")
        tabulateTrends(trendTablesData.slice(2, 4), "cocaineAndMethTable", "Cocaine and Methamphetamine")
        tabulateTrends(trendTablesData.slice(4, 6), "fentAndHeroinTable", "Fentanyl and Heroin")
        tabulateTrends(trendTablesData.slice(6, 10), "otherCommonTable", "Other Common Opioids")
        tabulateTrends(trendTablesData.slice(10, 16), "mainFentTable", "Main Fentanyl Analogues")
    }
    else {
        tabulateTrends(trendTablesData.slice(0, 2), "totalAndCanTable", "Échantillons reçus")
        tabulateTrends(trendTablesData.slice(2, 4), "cocaineAndMethTable", "Cocaïne et méthamphétamine")
        tabulateTrends(trendTablesData.slice(4, 6), "fentAndHeroinTable", "Fentanyl et héroïne")
        tabulateTrends(trendTablesData.slice(6, 10), "otherCommonTable", "Autres opioïdes courants")
        tabulateTrends(trendTablesData.slice(10, 16), "mainFentTable", "Principaux analogues du fentanyl")
    }
}
const pdfString = "/src/data/DAS/pdf/${lang}/DAS_${year}${quarter}_${lang}_${province}.pdf"

d3.select("#selectProvinceTrend").on("change", function() {
    let value = d3.select(this).node().value;
    let newPdfString = pdfString.replace(/\${lang}/g, language).replace(/\${province}/g, value).replace(/\${year}/g, $("#years").val()).replace(/\${quarter}/g, $("#quarters").val());
    d3.select(".pdfDownload").attr("href", newPdfString);
    $("#selectProvince").val(value);
    $("#selectProvince").change();
    updatePage()
    trendChange(value)


});


d3.select("#selectProvince").on("change", function() {
    let value = d3.select(this).node().value;
    let newPdfString = pdfString.replace(/\${lang}/g, language).replace(/\${province}/g, value).replace(/\${year}/g, $("#years").val()).replace(/\${quarter}/g, $("#quarters").val());
    d3.select(".pdfDownload").attr("href", newPdfString);
    $("#selectProvinceTrend").val(value);
    $("#selectProvinceTrend").change();
    updatePage();
    trendChange(value);

});

let updatePage = function() {
    // // if (curProvince !== "") {
    // if (d3.select(".provinceGroup rect." + curProvince).node() !== null)
    //     d3.select(".provinceGroup rect." + curProvince).transition().duration(350).style("opacity", 0);
    // // }
    if (d3.select('#selectProvince').node().value == "CA") {
        d3.select(".provinceGroup rect." + curProvince).transition().duration(350).style("opacity", 0);
        curProvince = "CA"
        $("#selectProvince").val(curProvince);
        $("#selectProvince").change();
        $("#selectProvinceTrend").val(curProvince);
        $("#selectProvinceTrend").change();
        trendChange("CA")

    }
    else {
        curProvince = d3.select('#selectProvince').node().value;
        d3.selectAll(".provinceGroup rect").transition().duration(350).style("opacity", 0);
        d3.select(".provinceGroup rect." + curProvince).style("opacity", 0.1).transition().duration(350).style("opacity", 0.1);
    }
    window.history.replaceState(null, null, window.location.origin + window.location.pathname + '?p=' + curProvince + "&y=" + $("#years").val() + "&q=" + $("#quarters").val());

    if (curProvince === "CA") {
        curData = getDataForCanadaByQuarter();
        //     d3.select("#quantTile").style("display", "block")

    }
    else {
        curData = getDataForProvinceByQuarter($("#quarters").val(), curProvince);
        //     d3.select("#quantTile").style("display", "none")

    }
    updateTitle();
    updateTile(getControlledSubstanceDrugTotals());

    // console.log(getCannabisDrugTotals())
    updateTile(getCannabisDrugTotals());
    // console.log(curData)

    updateTile(getOpioidDrugTotals());

    generateNewSubstanceVisual(getNewSubstancesDrugTotals());
    let newSubData = getNewSubstancesDrugTotals();
    newSubData.data = newSubData.data.slice(0, 11);
    updateBarGraph(newSubData);

    updateTile(getStimulantDrugTotals());

    updateTile(getBenzoDrugTotals());

    updateCurTable();

    d3.select("#rectG").selectAll("rect").attr("stroke", "");
    // d3.selectAll(".y .axis text").call(wrap, 200);
    // tilesInView();
};

//console.log("Quantities/Counts added to JSON", drugSummary);

d3.selectAll(".btnSwitch").on("click", function() {
    //console.log(d3.select(this).text());
    //console.log(d3.select(this.parentNode));

    if (d3.select(this).html() == "View Table" || d3.select(this).html() == "Voir le tableau") {
        d3.select(this.parentNode).select(".barGraph").style("display", "none");
        d3.select(this.parentNode).select(".table").style("display", "block");
        if (language == "en")
            d3.select(this).html("View Graph")
        else
            d3.select(this).html("Voir le graphique")
    }
    else {
        d3.select(this.parentNode).select(".barGraph").style("display", "block");
        d3.select(this.parentNode).select(".table").style("display", "none");
        if (language == "en")
            d3.select(this).html("View Table")
        else
            d3.select(this).html("Voir le tableau")
    };
});

d3.select("#navHeader").on("click", function() {
    if ($("#drugNav ul").data("open") === false) {
        $("#drugNav ul").data("open", true);
        $("#drugNav ul").slideDown();
        d3.select(".nav-caret").attr("class", "nav-caret fa fa-caret-down")
    }
    else {
        $("#drugNav ul").data("open", false);
        $("#drugNav ul").slideUp();
        d3.select(".nav-caret").attr("class", "nav-caret fa fa-caret-right")
    }
});

d3.selectAll("#drugNav a").on("click", function() {
    $("#drugNav ul").data("open", false);
    $("#drugNav ul").slideUp();
});

// function isScrolledIntoView(elem)
// {
//     var docViewTop = $(window).scrollTop();
//     var docViewBottom = docViewTop + $(window).height();

//     var elemTop = $(elem).offset().top;
//     var elemBottom = elemTop + $(elem).height();

//     return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
// }

// function Utils() {

// }

// Utils.prototype = {
//     constructor: Utils,
//     isElementInView: function (element, fullyInView) {
//         var pageTop = $(window).scrollTop();
//         var pageBottom = pageTop + $(window).height();
//         var elementTop = $(element).offset().top;
//         var elementBottom = elementTop + $(element).height();

//         if (fullyInView === true) {
//             return ((pageTop < elementTop) && (pageBottom > elementBottom));
//         } else {
//             return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
//         }
//     }
// };

// var Utils = new Utils();

// var ScrollDebounce = true;
// $( document ).ready(function() {
//     $(window).scroll(function () {
//         if (ScrollDebounce) {
//             ScrollDebounce = false;
//             tilesInView();
//             setTimeout(function () {
//                 ScrollDebounce = true;
//             }, 350);
//         }
//     });
// });
// let tilesInView = function(){

//     var isOpioidInView = Utils.isElementInView($('#opioidTile'), true);

//     if (isOpioidInView) {
//         d3.select("#"+curProvince+"g").select(".Opioids").attr("stroke", "black");
//         if(d3.select("#legendOpioids").attr("fill") === "rgb(255, 255, 255)")
//             document.getElementById("legendOpioids").dispatchEvent(new Event('click'));
//         if(d3.select("#legendCannabis").attr("fill") === "rgb(50, 205, 50)" || d3.select("#legendCannabis").attr("fill") === "#ABE071")
//             document.getElementById("legendCannabis").dispatchEvent(new Event('click'));
//         if(d3.select("#legendBenzodiazepines").attr("fill") === "rgb(135, 206, 250)" || d3.select("#legendBenzodiazepines").attr("fill") === "#9EDCF5")
//             document.getElementById("legendBenzodiazepines").dispatchEvent(new Event('click'));
//         if(d3.select("#legendStimulants").attr("fill") === "rgb(255, 0, 0)" || d3.select("#legendStimulants").attr("fill") === "#FF645E")
//             document.getElementById("legendStimulants").dispatchEvent(new Event('click'));
//     } else {
//         d3.select("#"+curProvince+"g").select(".Opioids").attr("stroke", "")
//     }

//     var isCannabisInView = Utils.isElementInView($('#cannabisTile'), true);

//     if (isCannabisInView) {
//         d3.select("#"+curProvince+"g").select(".Cannabis").attr("stroke", "black")
//         if(d3.select("#legendCannabis").attr("fill") === "rgb(255, 255, 255)")
//             document.getElementById("legendCannabis").dispatchEvent(new Event('click'));
//         if(d3.select("#legendOpioids").attr("fill") === "rgb(0, 0, 139)" || d3.select("#legendOpioids").attr("fill") === "#4D6FC2")
//             document.getElementById("legendOpioids").dispatchEvent(new Event('click'));
//         if(d3.select("#legendBenzodiazepines").attr("fill") === "rgb(135, 206, 250)" || d3.select("#legendBenzodiazepines").attr("fill") === "#9EDCF5")
//             document.getElementById("legendBenzodiazepines").dispatchEvent(new Event('click'));
//         if(d3.select("#legendStimulants").attr("fill") === "rgb(255, 0, 0)" || d3.select("#legendStimulants").attr("fill") === "#FF645E")
//             document.getElementById("legendStimulants").dispatchEvent(new Event('click'));
//     } else {
//         d3.select("#"+curProvince+"g").select(".Cannabis").attr("stroke", "")
//     }

//     var isBenzoInView = Utils.isElementInView($('#benzoTile'), true);

//     if (isBenzoInView) {
//         d3.select("#"+curProvince+"g").select(".Benzodiazepines").attr("stroke", "black")
//         if(d3.select("#legendBenzodiazepines").attr("fill") === "rgb(255, 255, 255)")
//             document.getElementById("legendBenzodiazepines").dispatchEvent(new Event('click'));
//         if(d3.select("#legendOpioids").attr("fill") === "rgb(0, 0, 139)" || d3.select("#legendOpioids").attr("fill") === "#4D6FC2")
//             document.getElementById("legendOpioids").dispatchEvent(new Event('click'));
//         if(d3.select("#legendCannabis").attr("fill") === "rgb(50, 205, 50)" || d3.select("#legendCannabis").attr("fill") === "#ABE071")
//             document.getElementById("legendCannabis").dispatchEvent(new Event('click'));
//         if(d3.select("#legendStimulants").attr("fill") === "rgb(255, 0, 0)" || d3.select("#legendStimulants").attr("fill") === "#FF645E")
//             document.getElementById("legendStimulants").dispatchEvent(new Event('click'));
//     } else {
//         d3.select("#"+curProvince+"g").select(".Benzodiazepines").attr("stroke", "")
//     }

//     var isStimulantInView = Utils.isElementInView($('#stimulantTile'), true);

//     if (isStimulantInView) {
//         d3.select("#"+curProvince+"g").select(".Stimulants").attr("stroke", "black")
//         if(d3.select("#legendStimulants").attr("fill") === "rgb(255, 255, 255)")
//             document.getElementById("legendStimulants").dispatchEvent(new Event('click'));
//         if(d3.select("#legendOpioids").attr("fill") === "rgb(0, 0, 139)" || d3.select("#legendOpioids").attr("fill") === "#4D6FC2")
//             document.getElementById("legendOpioids").dispatchEvent(new Event('click'));
//         if(d3.select("#legendCannabis").attr("fill") === "rgb(50, 205, 50)" || d3.select("#legendCannabis").attr("fill") === "#ABE071")
//             document.getElementById("legendCannabis").dispatchEvent(new Event('click'));
//         if(d3.select("#legendBenzodiazepines").attr("fill") === "rgb(135, 206, 250)" || d3.select("#legendBenzodiazepines").attr("fill") === "#9EDCF5")
//             document.getElementById("legendBenzodiazepines").dispatchEvent(new Event('click'));
//     } else {
//         d3.select("#"+curProvince+"g").select(".Stimulants").attr("stroke", "")
//     }

//     if(!isOpioidInView && !isCannabisInView && !isBenzoInView && !isStimulantInView){
//         if(d3.select("#legendOpioids").attr("fill") === "rgb(255, 255, 255)")
//             document.getElementById("legendOpioids").dispatchEvent(new Event('click'));
//         if(d3.select("#legendCannabis").attr("fill") === "rgb(255, 255, 255)")
//             document.getElementById("legendCannabis").dispatchEvent(new Event('click'));
//         if(d3.select("#legendBenzodiazepines").attr("fill") === "rgb(255, 255, 255)")
//             document.getElementById("legendBenzodiazepines").dispatchEvent(new Event('click'));
//         if(d3.select("#legendStimulants").attr("fill") === "rgb(255, 255, 255)")
//             document.getElementById("legendStimulants").dispatchEvent(new Event('click'));
//     }
// };




// axis testing

var top = 1,
    right = 2,
    bottom = 3,
    left = 4,
    epsilon = 1e-6;

function translateX(x) {
    return "translate(" + (x + 0.5) + ",0)";
}

function translateY(y) {
    return "translate(0," + (y + 0.5) + ")";
}

// function number(scale) {
//     return d => +scale(d);
// }

function center(scale) {
    var offset = Math.max(0, scale.bandwidth() - 1) / 2; // Adjust for 0.5px offset.
    if (scale.round()) offset = Math.round(offset);
    return function(d) {
        return +scale(d) + offset;
    };
}

function entering() {
    return !this.__axis;
}

function axis(orient, scale) {
    var tickArguments = [],
        tickValues = null,
        tickFormat = null,
        tickSizeInner = 6,
        tickSizeOuter = 6,
        tickPadding = 3,
        k = orient === top || orient === left ? -1 : 1,
        x = orient === left || orient === right ? "x" : "y",
        transform = orient === top || orient === bottom ? translateX : translateY;

    function axis(context) {
        var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
            format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity) : tickFormat,
            spacing = Math.max(tickSizeInner, 0) + tickPadding,
            range = scale.range(),
            range0 = +range[0] + 0.5,
            range1 = +range[range.length - 1] + 0.5,
            position = (scale.bandwidth ? center : number)(scale.copy()),
            selection = context.selection ? context.selection() : context,
            path = selection.selectAll(".domain").data([null]),
            tick = selection.selectAll(".tick").data(values, scale).order(),
            tickExit = tick.exit(),
            tickEnter = tick.enter().append("g").attr("class", "tick"),
            line = tick.select("line"),
            text = tick.select("text");
        let textEnter;

        path = path.merge(path.enter().insert("path", ".tick")
            .attr("class", "domain")
            .attr("stroke", "currentColor"));

        tick = tick.merge(tickEnter);

        line = line.merge(tickEnter.append("line")
            .attr("stroke", "currentColor")
            .attr(x + "2", k * tickSizeInner));

        // textEnter =

        text = text.merge(tickEnter.append("text")
            .attr("fill", "currentColor")
            .attr(x, k * spacing)
            .attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em")).call(wrap, 200);

        //console.log(text)
        if (context !== selection) {
            path = path.transition(context);
            tick = tick.transition(context);
            line = line.transition(context);
            //console.log(context)
            //   text = text.transition(context);

            tickExit = tickExit.transition(context)
                .style("opacity", epsilon)
                .attr("transform", function(d) { return isFinite(d = position(d)) ? transform(d) : this.getAttribute("transform"); });

            tickEnter
                .style("opacity", epsilon)
                .attr("transform", function(d) { var p = this.parentNode.__axis; return transform(p && isFinite(p = p(d)) ? p : position(d)); });


            text.call(wrap, 200)

        }

        tickExit.remove();

        path
            .attr("d", orient === left || orient === right ?
                (tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H0.5V" + range1 + "H" + k * tickSizeOuter : "M0.5," + range0 + "V" + range1) :
                (tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V0.5H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + ",0.5H" + range1));

        tick
            .style("opacity", 1)
            .attr("transform", function(d) { return transform(position(d)); });

        line
            .attr(x + "2", k * tickSizeInner);

        text
            .attr(x, k * spacing)
            .text(format).call(wrap, 200)

        text.selectAll("text").call(wrap, 200)

        selection.filter(entering)
            .attr("fill", "none")
            .attr("font-size", 10)
            .attr("font-family", "sans-serif")
            .attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");

        selection
            .each(function() { this.__axis = position; });
    }

    axis.scale = function(_) {
        return arguments.length ? (scale = _, axis) : scale;
    };

    axis.ticks = function() {
        return tickArguments = Array.prototype.slice.call(arguments), axis;
    };

    axis.tickArguments = function(_) {
        return arguments.length ? (tickArguments = _ == null ? [] : Array.prototype.slice.call(_), axis) : tickArguments.slice();
    };

    axis.tickValues = function(_) {
        return arguments.length ? (tickValues = _ == null ? null : Array.prototype.slice.call(_), axis) : tickValues && tickValues.slice();
    };

    axis.tickFormat = function(_) {
        return arguments.length ? (tickFormat = _, axis) : tickFormat;
    };

    axis.tickSize = function(_) {
        return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
    };

    axis.tickSizeInner = function(_) {
        return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
    };

    axis.tickSizeOuter = function(_) {
        return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
    };

    axis.tickPadding = function(_) {
        return arguments.length ? (tickPadding = +_, axis) : tickPadding;
    };

    return axis;
}

function identity(x) {
    return x;
}

function axisTop(scale) {
    return axis(top, scale);
}

function axisRight(scale) {
    return axis(right, scale);
}

function axisBottom(scale) {
    return axis(bottom, scale);
}

function axisLeft(scale) {
    return axis(left, scale);
}
