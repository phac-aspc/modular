language = d3.select('html').attr('lang');
parseTime = d3.timeParse("%Y-%m-%d");
var parseTimeReverse = d3.timeParse("%d-%m-%Y");
var parseTimeLong = d3.timeParse("%Y-%m-%d %H %M");
formatTime = d3.timeFormat("%d %b %Y");
var formatTimeAdminDist = d3.timeFormat("%Y-%m-%d");
var formatTimeLong = d3.timeFormat("%b %d %Y ");
var locale;
// var formatTimeFR;
var localeFormatter;
var numberFormat, percentFormat;
let isIE = /*@cc_on!@*/ false || !!document.documentMode;
if (/Edge\/\d./i.test(navigator.userAgent))
	isIE = true;

Math.log10 = Math.log10 || function(x) {
	return Math.log(x) * Math.LOG10E;
};

var getURLProduct = function(url) {
	if ((url.search("administres") > -1) || url.search("administration") > -1 || url.search("distribution") > -1)
		return "admin";
	return "cov";
};

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

const greens4 = ["#c2e699", "#78c679", "#006837", "#bfbfbf"];
const greens3 = ["#c2e699", "#78c679", "#006837"];
const greens3reverse = ["#006837", "#78c679", "#c2e699"];
// const greens4reverse = ["#006837","#c2e699","#bfbfbf","#000000"];
const greens4reverse = ["#ceecc5", "#a1d99b", "#31a354", "#23763c", "#efefa2", "#bfbfbf"];
// ["#31a354","#a1d99b","#e5f5e0","#bfbfbf","#000000"];

// const greens4reverse = ["#238b45","#74c476","#bae4b3","#edf8e9","#bfbfbf","#000000"]; New vaccines

var numPropDropdownVal, numPropDropdownVal2, vaccineDropdownVal, typeDropdownVal, typeDropdownTxt, vaccineDropdowns, vaccineDropdownTxt;

//Helper Functions
var numberFormatted;

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
					.attr("dy", ++lineNumber * +lineHeight + dy + "em")
					.text(word);
			}
		}
	});
}

function getLength(number) {
	return number.toString().length;
}

function generateTxt(number, numPercent, decimal) {
	if (number[0] == "<" || number[0] == ">" || number[0] == "≥") {
		if (number[0] == "≥" && numPercent == "prop") {
			if (language == "en") {
				return number + "%";
			}
			else {
				return number + " %";
			}
		}
		return number;
		// if(number=="<5"){
		// 	return "<5";
		// }else if(number=="<0.1"){
		// 	return "<0.1";
	}
	else if ((number != "0") && (isNaN(+number) || (number == ""))) {
		if (language == "en") {
			return "n/a";
		}
		else {
			return "s.o.";
		}
	}

	if (numPercent == "num" || numPercent == "numtotal") {
		if (language == "en") {
			numberFormatted = numberFormat(number);
		}
		else {
			numberFormatted = (numberFormat(number)).replace(",", " ");
		}
	}
	else {
		if (language == "en") {
			if (number == 0) {
				numberFormatted = (numberFormat(number)) + "%";
			}
			else {
				if (!isNaN(decimal)) {
					numberFormatted = (d3.format(",.0f")(number)) + "%";
				}
				else {
					numberFormatted = (percentFormat(number)) + "%";
				}
			}
		}
		else {
			if (number == 0) {
				numberFormatted = (numberFormat(number)) + " %";
			}
			else {
				if (!isNaN(decimal)) {
					numberFormatted = (d3.format(",.0f")(number).replace(".", ",")) + "%";
				}
				else {
					numberFormatted = ((percentFormat(number)).replace(".", ",")) + " %";
				}
			}
		}
	}
	return numberFormatted;
}

function isInteger(num) {
	return (num ^ 0) === num;
}

function deltaDate(input, days, months, years) {
	return new Date(
		input.getFullYear() + years,
		input.getMonth() + months,
		Math.min(
			input.getDate() + days,
			new Date(input.getFullYear() + years, input.getMonth() + months + 1, 0).getDate()
		)
	);
}

function getPRUIDArticleText(PRUID) {
	if (language == "en") {
		return "in";
	}
	else {
		if (PRUID == 10) {
			return " à ";
		}
		else if (PRUID == 11) {
			return " à l'";
		}
		else if ((PRUID == 12) || (PRUID == 35) || (PRUID == 47) || (PRUID == 48) || (PRUID == 59)) {
			return " en ";
		}
		else if ((PRUID == 13) || (PRUID == 24) || (PRUID == 46) || (PRUID == 60) || (PRUID == 62)) {
			return " au ";
		}
		else if (PRUID == 61) {
			return " aux ";
		}
		return "au";
	}
}

function pruid2prov(pruid) {
	var pruid2provLookup = {
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
		97: "Canadian Armed Forces",
		90: "Federal allocation",
		1: "Canada"
	}
	var pruid2provLookupFr = {
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
		97: "Forces armées canadiennes",
		90: "Organismes fédéraux",
		1: "Canada"
	}

	if (language == "en") {
		return pruid2provLookup[pruid];
	}
	else {
		return pruid2provLookupFr[pruid];
	}
}

function prov2pruid(prov) {
	var prov2pruidLookup = {
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
		"Canada": 1
	}
	return prov2pruidLookup[prov];
}

function short2txt(short) {
	let shortLookup = {
		"m": "Male",
		"f": "Female",
		"Other": "Other",
		"Unknown": "Unknown",
		"Not reported": "Not reported",
		"Not reported v": "Vaccine not reported",
		"Notreported": "Not reported",
		"Not reported as": "Age and sex not reported",
		"Two doses:": "Two doses: ",
		"One dose:": "One dose: ",
		"prop_partially": "One dose",
		"prop_fully": "Two doses",
		"Adults aged 70-79": "Adults aged 70 to 79",
		"Adults aged 60-69": "Adults aged 60 to 69",
		"Adults aged 50-59": "Adults aged 50 to 59",
		"Adults aged 18-49": "Adults aged 18 to 49",
		"Youth aged 0-17": "Youth aged 0 to 17",
		"Adults aged 80+": "Adults aged 80 and older",
		"Adults aged 70-79": "Adults aged 70 to 79",
		"Adults in the territories": "Adults in the territories",
		"At least one dose": "At least one dose",
		"Partially vaccinated": "Partially vaccinated",
		"Fully vaccinated": "Fully vaccinated"
	}
	let shortLookupFR = {
		"m": "Hommes",
		"f": "Femmes",
		"Unknown": "Inconnu",
		"Other": "Autres",
		"Not reported": "Non rapporté",
		"Not reported v": "Vaccin non spécifié",
		"Not reported as": "Âge et sexe non spécifiés",
		"Notreported": "Non rapporté",
		"Two doses:": "Deux doses : ",
		"One dose:": "Une dose : ",
		"prop_partially": "Une dose",
		"prop_fully": "Deux doses",
		"Adultes de 80 ans et +": "80 ans et plus",
		"Adultes de 70 à 79 ans": "70 à 79 ans",
		"Adultes dans les territoires": "Adultes dans les territoires",
		"At least one dose": "Au moins une dose",
		"Partially vaccinated": "Partiellement vaccinées",
		"Fully vaccinated": "Entièrement vaccinées"
	}
	if (language == "en") {
		return shortLookup[short];
	}
	else {
		return shortLookupFR[short];
	}
}

const urlProduct = getURLProduct(window.location.href);

//Load Data
var csvfiles = [
	'/src/data/covidLive/vaccination-coverage-map.csv', //0
	'/src/data/covidLive/vaccination-coverage-keypops.csv', //1 
	'/src/data/covidLive/vaccination-coverage-overall.csv', //2
	'/src/data/covidLive/vaccination-coverage-byAgeAndSex.csv', //3
	'/src/data/covidLive/vaccination-coverage-byAgeAndSexDenominators.csv', //4
	'/src/data/covidLive/vaccination-coverage-byVaccineType.csv', //5
	'/src/data/covidLive/vaccination-administration.csv', //6
	'/src/data/covidLive/vaccination-administration-updateDate.csv', //7
	'/src/data/covidLive/vaccination-notes.csv', //8
	'/src/data/covidLive/vaccination-coverage-updateDate.csv', //9
	'/src/data/covidLive/vaccination-distribution.csv', //10
	'/src/data/covidLive/vaccination-forecast.csv', //11
	'/src/data/covidLive/vaccination-distribution-updateDate.csv' //12
]
var promises = [];
csvfiles.forEach(function(url) {
	promises.push(d3.csv(url))
});
Promise.all(promises).then(function(values) {
	if (urlProduct == "cov") {
		processData(values[2], values[1], values[3], values[4], values[5], values[0], 0, 0, 0, 0, values[8], values[9], 0, 0);
	}
	else {
		processData(0, 0, 0, 0, 0, 0, values[10], values[6], 0, values[7], values[8], 0, values[11], values[12]);
	}
}).then(function() {
	if (urlProduct == "cov") {
		buildKeyUpdates();

		draw_fig_covline(d3.select("select#covline-ddl-1").node().value, d3.select("select#covline-ddl-2").node().value);
		draw_fig_keyPops(d3.select("select#fig4-ddl-1").node().value, d3.select("select#fig4-ddl-2").node().value);
		draw_fig_agesex(d3.select("select#fig5-ddl-1").node().value, d3.select("select#fig5-ddl-2").node().value, d3.select("select#fig5-ddl-3").node().value);
		draw_fig_vactype(d3.select("select#fig6-ddl-1").node().value, d3.select("select#fig6-ddl-2").node().value, d3.select("select#fig6-ddl-3").node().value);

		//updates
		d3.selectAll("select.covline").on("change", function() {
			draw_fig_covline(d3.select("select#covline-ddl-1").node().value, d3.select("select#covline-ddl-2").node().value, true);
		})
		d3.selectAll("select.fig4").on("change", function() {
			draw_fig_keyPops(d3.select("select#fig4-ddl-1").node().value, d3.select("select#fig4-ddl-2").node().value, true);
			d3.select("#fig4-yAxisLabel").text(d3.select("select#fig4-ddl-1 option:checked").text() + " " + d3.select("select#fig4-ddl-2 option:checked").text() + " vaccinated")
		})
		d3.selectAll("select.fig5").on("change", function() {
			draw_fig_agesex(d3.select("select#fig5-ddl-1").node().value, d3.select("select#fig5-ddl-2").node().value, d3.select("select#fig5-ddl-3").node().value, true);
		})
		d3.selectAll("select.fig6").on("change", function() {
			draw_fig_vactype(d3.select("select#fig6-ddl-1").node().value, d3.select("select#fig6-ddl-2").node().value, d3.select("select#fig6-ddl-3").node().value, true);
		})

	}
	else {}

	buildTables();
});

//Process Data
var nestedData_byVac2, keyPop_nestedData, overall_nestedData, timeArray, data_overall, data_keyPop, current_numtotal_dosesdistributed, date_numtotal_dosesdistributed, current_numtotal_dosesadministered, current_numtotaldelta_all_administered, date_numtotal_dosesadministered, asofdate_numtotal_dosesadministered, nestedData_byAge, nestedData_bySex, nestedData_byVac, datesArray, datesArray2, datesArrayAdmin, datesArrayAdmin2, datesArrayDist, asofdatesArrayAdmin, asofdatesArrayAdmin2, mapData, mapDataDist, mapDataAdmin, dosesadministered, dosesadministered2, dosesadministered3, nestedData_bySexOnly, nestedData_bySexOnlyDenoms, covlineData, updateDateCov, mapDataDist, dataDistributed2, dataDistributed3, updateDateAdmin, updateDateAdmin2, updateDateDist;

function processData(data_overall, data_keyPop, data_byAge, data_denoms, data_byVaccine, data_map, data_distributed, data_map_admin, data_map_dist, updateDateAdmin, notes, updateDateCov, data_forecast, updateDateDist) {
	if (urlProduct == "cov") {
		//data_overall
		data_overall.forEach(function(d) {
			d.date = parseTime(d.week_end);
			d.prop_atleast1dose = +d.prop_atleast1dose;
			d.prop_partially = +d.prop_partially;
			d.prop_fully = +d.prop_fully;
			d.numtotal_atleast1dose = +d.numtotal_atleast1dose;
			d.numtotal_partially = +d.numtotal_partially;
			d.numtotal_fully = +d.numtotal_fully;
			d.propweekdelta_atleast1dose = +d.propweekdelta_atleast1dose;
			d.propweekdelta_partially = +d.propweekdelta_partially;
			d.propweekdelta_fully = +d.propweekdelta_fully;
			d.numweekdelta_atleast1dose = +d.numweekdelta_atleast1dose;
			d.numweekdelta_fully = +d.numweekdelta_fully;
		});
		//Nest data
		overall_nestedData = d3.nest()
			.key(function(d) { return d.date })
			.entries(data_overall);
		
		//data_keyPop
		//Parse data
		data_keyPop.forEach(function(d) {
			d.date = parseTime(d.week_end);
			d.prop_partially = +d.prop_partially;
			d.prop_fully = +d.prop_fully;
			d.prop_atleast1dose = +d.prop_atleast1dose;
		});

		//Nest data
		keyPop_nestedData = d3.nest()
			.key(function(d) {
				if (language == "en") {
					return d.priority_group_en;
				}
				else {
					return d.priority_group_fr;
				}
			})
			.entries(data_keyPop);
		keyPop_nestedData = keyPop_nestedData.filter(function(d, i) {
			return d.key != "Health care workers" && d.key != "Group living settings for seniors" && d.key != "Travailleurs de la santé" && d.key != "Milieux de vie collectifs pour personnes âgées";
		})

		//Get array of time values
		timeArray = d3.nest().key(function(d) {
			return d["week_end"];
		}).map(data_overall).keys();

		//data_byAge
		nestedData_byAge = d3.nest()
			.key(function(d) {
				return d["pruid"];
			})
			.key(function(d) {
				return d["week_end"];
			})
			.key(function(d) {
				return d["age"];
			})
			.key(function(d) {
				return d["sex"];
			})
			.rollup(function(d) {
				return {
					numtotal_partially: d[0]["numtotal_partially"],
					numtotal_partiallyrange: d[0]["numtotal_partiallyrange"],
					numtotal_fully: d[0]["numtotal_fully"],
					numtotal_fullyrange: d[0]["numtotal_fullyrange"],
					numtotal_atleast1dose: d[0]["numtotal_atleast1dose"],
					prop_partially: d[0]["prop_partially"],
					prop_partiallyrange: d[0]["prop_partiallyrange"],
					prop_fully: d[0]["prop_fully"],
					prop_fullyrange: d[0]["prop_fullyrange"],
					prop_atleast1dose: d[0]["prop_atleast1dose"]

					// numtotal_partially: d3.sum(leaves,function(leaf){
					//      	return leaf["numtotal_partially"];
					//      	}),
					//      numtotal_fully: d3.sum(leaves,function(leaf){
					//      	return leaf["numtotal_fully"];
					//      	}),
					//      numtotal_atleast1dose: d3.sum(leaves,function(leaf){
					//      	return +leaf["numtotal_atleast1dose"];
					//      	}),
					//      prop_partially: d3.sum(leaves,function(leaf){
					//      	return leaf["numtotal_partially"];
					//      	}),
					//      prop_fully: d3.sum(leaves,function(leaf){
					//      	return +leaf["prop_fully"];
					//      	}),
					//      prop_atleast1dose: d3.sum(leaves,function(leaf){
					//      	return +leaf["prop_atleast1dose"];
					//      	})
				};
			})
			.entries(data_byAge)

		nestedData_bySexDenoms = d3.nest()
			.key(function(d) {
				return d["pruid"];
			})
			.key(function(d) {
				return d["week_end"];
			})
			.key(function(d) {
				return d["sex"];
			})
			.key(function(d) {
				return d["age"];
			})
			.rollup(function(d) {
				return {
					numtotal_population: +d[0]["population"]
				};
			})
			.map(data_denoms)

		//data_bySex
		let currPRUID, currWeekend, currSex, currAge;
		nestedData_bySex = d3.nest()
			.key(function(d) {
				return d["pruid"];
			})
			.key(function(d) {
				return d["week_end"];
			})
			.key(function(d) {
				return d["sex"];
			})
			.key(function(d) {
				return d["age"];
			})
			.rollup(function(d) {
				return {
					numtotal_partially: d[0]["numtotal_partially"],
					numtotal_partiallyrange: d[0]["numtotal_partiallyrange"],
					numtotal_fully: d[0]["numtotal_fully"],
					numtotal_fullyrange: d[0]["numtotal_fullyrange"],
					numtotal_atleast1dose: d[0]["numtotal_atleast1dose"],
					prop_partially: d[0]["prop_partially"],
					prop_partiallyrange: d[0]["prop_partiallyrange"],
					prop_fully: d[0]["prop_fully"],
					prop_fullyrange: d[0]["prop_fullyrange"],
					prop_atleast1dose: d[0]["prop_atleast1dose"],
					// -------- DISABLED FOR TESTING (IT ERRORS OUT!) -------
					// population: nestedData_bySexDenoms.get(d[0].pruid).get(d[0].week_end).get(d[0].sex).get(d[0].age).numtotal_population
					// ------------------------------------------------------
					// numtotal_fully: d3.sum(leaves,function(leaf){
					// 	return leaf["numtotal_fully"];
					// 	}),
					// numtotal_atleast1dose: d3.sum(leaves,function(leaf){
					// 	return +leaf["numtotal_atleast1dose"];
					// 	}),
					// prop_fully: d3.sum(leaves,function(leaf){
					// 	return +leaf["prop_fully"];
					// 	}),
					// prop_atleast1dose: d3.sum(leaves,function(leaf){
					// 	return +leaf["prop_atleast1dose"];
					// 	})
				};
			})
			.entries(data_byAge)

		nestedData_bySexOnly = d3.nest()
			.key(function(d) {
				return d["pruid"];
			})
			.key(function(d) {
				return d["week_end"];
			})
			.key(function(d) {
				return d["sex"];
			})
			.rollup(function(leaves) {
				return {
					prop_fully: d3.sum(leaves, function(leaf) {
						if (leaf.age != "All Ages") {
							return +leaf["prop_fully"];
						}
					}),
					prop_fullyrange: d3.sum(leaves, function(leaf) {
						if (leaf.age != "All Ages") {
							return +leaf["prop_fullyrange"];
						}
					}),
					prop_atleast1dose: d3.sum(leaves, function(leaf) {
						if (leaf.age != "All Ages") {
							return +leaf["prop_atleast1dose"];
						}
					}),
					prop_partially: d3.sum(leaves, function(leaf) {
						if (leaf.age != "All Ages") {
							return +leaf["prop_partially"];
						}
					}),
					prop_partiallyrange: d3.sum(leaves, function(leaf) {
						if (leaf.age != "All Ages") {
							return +leaf["prop_partiallyrange"];
						}
					}),
					numtotal_fully: d3.sum(leaves, function(leaf) {
						if (leaf.age != "All Ages") {
							return +leaf["numtotal_fully"];
						}
					}),
					numtotal_fullyrange: d3.sum(leaves, function(leaf) {
						if (leaf.age != "All Ages") {
							return +leaf["numtotal_fullyrange"];
						}
					}),
					numtotal_atleast1dose: d3.sum(leaves, function(leaf) {
						if (leaf.age != "All Ages") {
							return +leaf["numtotal_atleast1dose"];
						}
					}),
					numtotal_partially: d3.sum(leaves, function(leaf) {
						if (leaf.age != "All Ages") {
							return +leaf["numtotal_partially"];
						}
					}),
					numtotal_partiallyrange: d3.sum(leaves, function(leaf) {
						if (leaf.age != "All Ages") {
							return +leaf["numtotal_partiallyrange"];
						}
					})
				};
			})
			.entries(data_byAge)

		nestedData_bySexOnlyDenoms = d3.nest()
			.key(function(d) {
				return d["pruid"];
			})
			.key(function(d) {
				return d["week_end"];
			})
			.key(function(d) {
				return d["sex"];
			})
			.rollup(function(leaves) {
				return {
					numtotal_population: d3.sum(leaves, function(leaf) {
						if (leaf.age != "All Ages") {
							return leaf["population"];
						}
					})
				};
			})
			.entries(data_denoms)

		var nestedData_byVacSortOrder = ["Pfizer-BioNTech", "Moderna", "COVISHIELD", "AstraZeneca", "Unknown", "Not reported"];
		nestedData_byVac = d3.nest()
			.key(function(d) {
				return d["pruid"];
			})
			.key(function(d) {
				return d["week_end"];
			})
			.key(function(d) {
				return d["product_name"];
			}).sortKeys(function(a, b) {
				return nestedData_byVacSortOrder.indexOf(a) - nestedData_byVacSortOrder.indexOf(b);
			})
			.rollup(function(leaves) {
				return {
					numtotal_fully: d3.sum(leaves, function(leaf) {
						return +leaf["numtotal_fully"];
					}),
					numtotal_atleast1dose: d3.sum(leaves, function(leaf) {
						return +leaf["numtotal_atleast1dose"];
					}),
					numtotal_partially: d3.sum(leaves, function(leaf) {
						return +leaf["numtotal_partially"];
					}),
					prop_fully: d3.sum(leaves, function(leaf) {
						return +leaf["prop_fully"];
					}),
					prop_atleast1dose: d3.sum(leaves, function(leaf) {
						return +leaf["prop_atleast1dose"];
					}),
					prop_partially: d3.sum(leaves, function(leaf) {
						return +leaf["prop_partially"];
					}),
					table_numtotal_partially: leaves[0]["numtotal_partially"],
					table_numtotal_fully: leaves[0]["numtotal_fully"],
					table_numtotal_atleast1dose: leaves[0]["numtotal_atleast1dose"],
					table_prop_partially: leaves[0]["prop_partially"],
					table_prop_fully: leaves[0]["prop_fully"],
					table_prop_atleast1dose: leaves[0]["prop_atleast1dose"]
				};
			})
			.entries(data_byVaccine)

		nestedData_byVac2 = d3.nest()
			.key(function(d) {
				return d["pruid"];
			})
			.key(function(d) {
				return d["product_name"];
			}).sortKeys(function(a, b) {
				return nestedData_byVacSortOrder.indexOf(a) - nestedData_byVacSortOrder.indexOf(b);
			})
			.key(function(d) {
				return d["week_end"];
			})
			.rollup(function(leaves) {
				return {
					numtotal_fully: d3.sum(leaves, function(leaf) {
						return +leaf["numtotal_fully"];
					}),
					numtotal_atleast1dose: d3.sum(leaves, function(leaf) {
						return +leaf["numtotal_atleast1dose"];
					}),
					numtotal_partially: d3.sum(leaves, function(leaf) {
						return +leaf["numtotal_partially"];
					}),
					prop_fully: d3.sum(leaves, function(leaf) {
						return +leaf["prop_fully"];
					}),
					prop_atleast1dose: d3.sum(leaves, function(leaf) {
						return +leaf["prop_atleast1dose"];
					}),
					prop_partially: d3.sum(leaves, function(leaf) {
						return +leaf["prop_partially"];
					}),
					table_numtotal_partially: leaves[0]["numtotal_partially"],
					table_numtotal_fully: leaves[0]["numtotal_fully"],
					table_numtotal_atleast1dose: leaves[0]["numtotal_atleast1dose"],
					table_prop_partially: leaves[0]["prop_partially"],
					table_prop_fully: leaves[0]["prop_fully"],
					table_prop_atleast1dose: leaves[0]["prop_atleast1dose"]
				};
			})
			.entries(data_byVaccine)
		//Process map data
		datesArray = [];
		datesArray2 = [];

		mapData = d3.nest()
			.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
			.key(function(d) { if (datesArray.indexOf(d["week_end"]) < 0) { datesArray.push(d["week_end"]); } return d["week_end"]; }).sortKeys(d3.ascending)
			.map(data_map);

		covlineData = d3.nest()
			.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
			.entries(data_map);

		datesArray.sort(function(a, b) { return new Date(a) - new Date(b); })
		datesArray.forEach(function(d) {
			datesArray2.push(parseTime(d));
		})

		let parseTimeCov = d3.timeParse("%Y-%m-%d");

		let formatTimeCov;
		if (language == "en") {
			formatTimeCov = d3.timeFormat("%B %-d, %Y");
		}
		else {
			let locale = {
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
			// create custom locale formatter for numbers from the given locale options
			localeFormatter = d3.formatDefaultLocale(locale);
			formatTimeCov = d3.timeFormat("%-d %B %Y");
		}

		$(".reportUpdateDate").text(formatTimeCov(parseTimeCov(updateDateCov.columns[0])));
		$(".dateModified").text(updateDateCov.columns[0]);

		buildMap(data_map);

	}
	else {

		//   //Process map data
		datesArray = [];
		datesArray2 = [];
		
		let formatTimeAdmin;
		let parseTimeAdmin;
		parseTimeAdmin = d3.timeParse("%Y-%m-%d %H:%M");
		
		//   mapDataDist = d3.nest()
		// 	.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
		// 	.key(function(d) { if (datesArray.indexOf(d["week_end"]) < 0) { datesArray.push(d["week_end"]); } return d["week_end"];	}).sortKeys(d3.ascending)
		// 	.map(data_map_dist);

		// datesArray.forEach(function(d){
		// 	datesArray2.push(parseTime(d));
		// })

		//   current_numtotal_dosesdistributed = +mapDataDist.get("1").get(datesArray[datesArray.length-1])[0].numtotal_all_distributed;
		//   date_numtotal_dosesdistributed = datesArray[datesArray.length-1];
		//   let current_numtotal_pfizerbiontech_distributed = +mapDataDist.get("1").get(datesArray[datesArray.length-1])[0].numtotal_pfizerbiontech_distributed;
		//   let current_numtotal_moderna_distributed = +mapDataDist.get("1").get(datesArray[datesArray.length-1])[0].numtotal_moderna_distributed;

		//   d3.selectAll(".numtotal_dosesdistributed_txt").text(numberFormat(current_numtotal_dosesdistributed));
		//   d3.selectAll(".numtotal_dosesdistributed_pfizerbiontech_txt").text(numberFormat(current_numtotal_pfizerbiontech_distributed));
		//   d3.selectAll(".numtotal_dosesdistributed_moderna_txt").text(numberFormat(current_numtotal_moderna_distributed));
		//   d3.selectAll(".date_dosesdistributed_txt").text(function(){
		//   	if(language=="en"){
		// 		return d3.timeFormat("%B %e, %Y")(parseTime(date_numtotal_dosesdistributed));
		//   	}else{
		// 		return d3.timeFormat("%d %B %Y")(parseTime(date_numtotal_dosesdistributed));
		//   	}
		//   }); 
		//data_distributed
		datesArrayDist = [];
		datesArrayDist2 = [];
		data_distributed.forEach(function(d) {
			// d.date = parseTime(d.date); // actually, don't do this
			d.numtotal_pfizerbiontech_distributed = +d.numtotal_pfizerbiontech_distributed;
			d.numtotal_moderna_distributed = +d.numtotal_moderna_distributed;
			d.numtotal_astrazeneca_distributed = +d.numtotal_astrazeneca_distributed;
			d.numtotal_all_distributed = +d.numtotal_all_distributed;
		})
		
		mapDataDist = d3.nest()
			.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
			.key(function(d) { if (datesArrayDist.indexOf(d.date) < 0) { datesArrayDist.push(d.date); } return d.date; }).sortKeys(d3.ascending)
			.map(data_distributed);
		//  dataDistributed = d3.nest()
		// .key(function(d) { if (datesArrayDist.indexOf(d.date) < 0) { datesArrayDist.push(d.date); } return d.date; }).sortKeys(d3.ascending)
		// .key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
		//   .entries(data_distributed);

		dataDistributed2 = d3.nest()
			.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
			.key(function(d) { return d.date; }).sortKeys(d3.ascending)
			.object(data_distributed);
		
		dataDistributed3 = d3.nest()
			.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
			.key(function(d) { return d.date; }).sortKeys(d3.ascending)
			.entries(data_distributed)
		
		//  mapDataDist = d3.nest()
		// .key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
		// .key(function(d) { return d.date; }).sortKeys(d3.ascending)
		//   .map(data_distributed);
		
		datesArrayDist.sort(function(a, b) { return new Date(a) - new Date(b); })
		datesArrayDist.forEach(function(d) {
			datesArrayDist2.push(parseTime(d));
		})
		
		current_numtotal_dosesdistributed = +mapDataDist.get("1").get(datesArrayDist[datesArrayDist.length - 1])[0].numtotal_all_distributed;
		date_numtotal_dosesdistributed = datesArrayDist[datesArrayDist.length - 1];
		d3.selectAll(".numtotal_dosesdistributed_txt").text(numberFormat(current_numtotal_dosesdistributed));

		data_map_admin.forEach(function(d) {
			d.date = d["report_date"];
			d.as_of_date = d["as_of_date"];
		})

		// data_forecast
		data_forecast.forEach(function(d) {
			// d.date = parseTime(d.forecast_week); // actually, don't do this
			d.numtotal_pfizerbiontech_forecasted = +d.numtotal_pfizerbiontech_forecasted;
			d.numtotal_moderna_forecasted = +d.numtotal_moderna_forecasted;
			d.numtotal_astrazeneca_forecasted = +d.numtotal_astrazeneca_forecasted;
			d.numtotal_all_forecasted = +d.numtotal_all_forecasted;
		})

		datesArrayFcst = [];
		mapDataFcst = d3.nest()
			.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
			.key(function(d) { if (datesArrayFcst.indexOf(d.date) < 0) { datesArrayFcst.push(d.date); } return d.date; }).sortKeys(d3.ascending)
			.map(data_forecast);
		
		chartDataFcst = d3.nest()
			.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
			.key(function(d) { if (datesArrayFcst.indexOf(d.date) < 0) { datesArrayFcst.push(d.date); } return d.date; }).sortKeys(d3.ascending)
			.entries(data_forecast);

		// mapDataAdmin
		datesArrayAdmin = [];
		datesArrayAdmin2 = [];
		asofdatesArrayAdmin = [];
		asofdatesArrayAdmin2 = [];
		mapDataAdmin = d3.nest()
			.key(function(d) { return d.pruid; }).sortKeys(d3.ascending) //prov2pruid(d.province)
			.key(function(d) { if (datesArrayAdmin.indexOf(d.date) < 0) { datesArrayAdmin.push(d.date); } if (asofdatesArrayAdmin.indexOf(d.as_of_date) < 0) { asofdatesArrayAdmin.push(d.as_of_date); } return d.date; }).sortKeys(d3.ascending)
			.map(data_map_admin);
		
		dosesadministered = d3.nest()
			.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
			.key(function(d) { return d.date; }).sortKeys(d3.ascending)
			.entries(data_map_admin);

		dosesadministered2 = d3.nest()
			.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
			.key(function(d) { return d.date; }).sortKeys(d3.ascending)
			.object(data_map_admin);
		
		dosesadministered3 = d3.nest()
			.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
			.key(function(d) { return d.date; }).sortKeys(d3.ascending)
			.map(data_map_admin);
		
		datesArrayAdmin.sort(function(a, b) { return new Date(a) - new Date(b); })
		datesArrayAdmin.forEach(function(d) {
			datesArrayAdmin2.push(parseTime(d));
		})
		asofdatesArrayAdmin.sort(function(a, b) { return new Date(a) - new Date(b); })
		asofdatesArrayAdmin.forEach(function(d) {
			asofdatesArrayAdmin2.push(parseTime(d));
		})

		// key updates for admin
		current_numtotal_dosesadministered = +mapDataAdmin.get("1").get(datesArrayAdmin[datesArrayAdmin.length - 1])[0]["numtotal_all_administered"];
		current_numdelta_all_administered = +mapDataAdmin.get("1").get(datesArrayAdmin[datesArrayAdmin.length - 2])[0]["numdelta_all_administered"];
		date_numtotal_dosesadministered = datesArrayAdmin[datesArrayAdmin.length - 1];
		asofdate_numtotal_dosesadministered = asofdatesArrayAdmin[asofdatesArrayAdmin.length - 1];
		let date_numtotal_dosesadministered2 = datesArrayAdmin[datesArrayAdmin.length - 2];

		// key updates for dist
		current_numtotal_dosesdistributed = +mapDataDist.get("1").get(datesArrayDist[datesArrayDist.length - 1])[0]["numtotal_all_distributed"];
		current_numdelta_all_distributed = +mapDataDist.get("1").get(datesArrayDist[datesArrayDist.length - 2])[0]["numdelta_all_distributed"];
		date_numtotal_dosesdistributed = datesArrayDist[datesArrayDist.length - 1];
		let date_numtotal_dosesdistributed2 = datesArrayDist[datesArrayDist.length - 2];

		d3.selectAll(".numtotal_dosesadministered_txt").text(numberFormat(current_numtotal_dosesadministered));
		d3.selectAll(".numdelta_all_administered_txt").text(numberFormat(current_numdelta_all_administered));
		d3.selectAll(".numtotal_dosesdistributed_txt").text(numberFormat(current_numtotal_dosesdistributed));
		d3.selectAll(".numdelta_all_distributed_txt").text(numberFormat(current_numdelta_all_distributed));		

		d3.selectAll(".date_dosesadministered_txt").text(function() {
			if (language == "en") {
				return d3.timeFormat("%B %e, %Y")(parseTime(date_numtotal_dosesadministered));
			}
			else {
				return d3.timeFormat("%d %B %Y")(parseTime(date_numtotal_dosesadministered));
			}
		});
		d3.selectAll(".date_dosesdistributed_txt").text(function() {
			if (language == "en") {
				return d3.timeFormat("%B %e, %Y")(parseTime(date_numtotal_dosesdistributed));
			}
			else {
				return d3.timeFormat("%d %B %Y")(parseTime(date_numtotal_dosesdistributed));
			}
		});
		d3.selectAll(".updateDateAdminDist").text(function() {
			if (language == "en") {
				return d3.timeFormat("%B %e, %Y")(parseTime(asofdate_numtotal_dosesadministered));
			}
			else {
				return d3.timeFormat("%d %B %Y")(parseTime(asofdate_numtotal_dosesadministered));
			}
		});
		d3.selectAll(".date_dosesadministered_txt2").text(function() {
			if (language == "en") {
				return d3.timeFormat("%B %e, %Y")(parseTime(date_numtotal_dosesadministered2));
			}
			else {
				return d3.timeFormat("%d %B %Y")(parseTime(date_numtotal_dosesadministered2));
			}
		});
				d3.selectAll(".date_dosesdistributed_txt2").text(function() {
			if (language == "en") {
				return d3.timeFormat("%B %e, %Y")(parseTime(date_numtotal_dosesdistributed2));
			}
			else {
				return d3.timeFormat("%d %B %Y")(parseTime(date_numtotal_dosesdistributed2));
			}
		});

		updateDateAdmin = updateDateAdmin["columns"][0];
		updateDateDist = updateDateDist["columns"][0];
		updateDateAdmin2 = updateDateAdmin;
		updateDateDist2 = updateDateDist;
		let updateDateAdminDistData;
		formatTime = d3.timeFormat("%Y-%m-%d");
		$(".dateModified").text(formatTime(parseTimeAdmin(updateDateAdmin)));

		buildMap(data_map_admin);
	}

	var allNotes = [];
	var notesLocation;
	var numberOfNotes = 0;
	var note1Text;
	var note2Text;
	notes.forEach(function(d, i) {
		if (d.Location == "Key Update Box 1" || d.Location == "Key Update Box 2" || d.Location == "Key Update Box 3" || d.Location == "Key Update Box 4" || d.Location == "Key Update Box 5" || d.Location == "Key Update Box 6" || d.Location == "Key Update Box 7" || d.Location == "Key Update Box 8") {
			if (d["Note1 Applied"] == "TRUE" && d["Note2 Applied"] == "TRUE") {
				if (language == "en") {
					note1Text = d["Note1"];
					note2Text = d["Note2"];
				}
				else {
					note1Text = d["Note1FR"];
					note2Text = d["Note2FR"];
				}
				d3.selectAll(".keyupdatesbox" + (i + 1)).html("<sup>a b</sup>");
			}
			else if (d["Note1 Applied"] == "TRUE") {
				if (language == "en") {
					note1Text = d["Note1"];
				}
				else {
					note1Text = d["Note1FR"];
				}
				d3.selectAll(".keyupdatesbox" + (i + 1)).html("<sup>a</sup>");
			}
			else if (d["Note2 Applied"] == "TRUE") {
				if (language == "en") {
					note2Text = d["Note2"];
				}
				else {
					note2Text = d["Note2FR"];
				}
				d3.selectAll(".keyupdatesbox" + (i + 1)).html("<sup>b</sup>");
			}
			else {
				d3.selectAll(".keyupdatesbox" + (i + 1)).html("");
			}

			if (d3.select("#keyupdatesnote1")._groups[0][0] == null) {
				d3.select("#keyupdatesnotes").append("p").attr("id", "keyupdatesnote1");
			}
			if (note1Text != undefined) {
				d3.select("#keyupdatesnote1").html("<sup>a</sup> " + note1Text);
			}
			if (d3.select("#keyupdatesnote2")._groups[0][0] == null) {
				d3.select("#keyupdatesnotes").append("p").attr("id", "keyupdatesnote2");
			}
			if (note2Text != undefined) {
				d3.select("#keyupdatesnote2").html("<sup>b</sup> " + note2Text);
			}
		}
		else {
			note1Text = "";
			note2Text = "";
			if (d["Note1 Applied"] == "TRUE" && d["Note2 Applied"] == "TRUE") {
				if (language == "en") {
					note1Text = d["Note1"];
					note2Text = d["Note2"];
				}
				else {
					note1Text = d["Note1FR"];
					note2Text = d["Note2FR"];
				}
			}
			else if (d["Note1 Applied"] == "TRUE") {
				if (language == "en") {
					note1Text = d["Note1"];
				}
				else {
					note1Text = d["Note1FR"];
				}
			}
			else if (d["Note2 Applied"] == "TRUE") {
				if (language == "en") {
					note2Text = d["Note2"];
				}
				else {
					note2Text = d["Note2FR"];
				}
			}
			else {
				note1Text = "";
				note2Text = "";
			}
			let extraNotes;
			if (d.Location == "Map - Coverage") {
				if (language == "en") {
					extraNotes = ' Use caution when comparing data over time. Some increases are due to jurisdictions providing their first reports on different weeks. Reporting delays can result in artificial changes in weekly counts. Information is subject to change and may differ from provincial and territorial reports, due to the suppression of values less than five for seven provinces and territories and the timing of updates (see <a href="/covid-19/vaccination-coverage/technical-notes.html#a6">limitations</a>).';
					d3.selectAll(".mapnotes").html("<h4>Note</h4><p>" + note1Text + extraNotes + "</p><p>" + note2Text + "</p>");
				}
				else {
					extraNotes = ' Les tendances temporelles doivent être interprétées avec prudence. Certaines augmentations sont dues au fait que les provinces ou territoires ont fourni leurs premiers rapports sur différentes semaines. Les retards dans la soumission des rapports peuvent entraîner des changements artificiels au nombre de personnes vaccinées par semaine. Les informations sont sujettes à changement et peuvent différer des rapports provinciaux et territoriaux selon le moment où les données sont mises à jour et puisque les valeurs inférieures à cinq ont été supprimées pour sept provinces et territoires (voir <a href="/covid-19/couverture-vaccinale/notes-techniques.html#a6">limites</a>).';
					d3.selectAll(".mapnotes").html("<h4>Remarque</h4><p>" + note1Text + extraNotes + "</p><p>" + note2Text + "</p>");
				}
			}
			else if (d.Location == "Age Sex - Bar Chart - Coverage") {
				if (language == "en") {
					extraNotes = ' Information is subject to change and may differ from provincial and territorial reports, due to the suppression of values less than five for seven provinces and territories and the timing of updates (see <a href="/covid-19/vaccination-coverage/technical-notes.html#a6">limitations</a>). If only one province or territory has a category with a value of less than five, we remove its value from national totals for privacy reasons.';
					d3.select("#agesexnotes").html("<h4>Note</h4><p>" + note1Text + extraNotes + "</p><p>" + note2Text + "</p>");
				}
				else {
					extraNotes = ' Les informations sont sujettes à changement et peuvent différer des rapports provinciaux et territoriaux selon le moment où les données sont mises à jour et puisque les valeurs inférieures à cinq ont été supprimées pour sept provinces et territoires (voir <a href="/covid-19/couverture-vaccinale/notes-techniques.html#a6">limites</a>). Si une seule province ou un seul territoire a une catégorie avec une valeur inférieure à cinq, cette valeur est supprimée des totaux nationaux pour des raisons de protection de la vie privée.';
					d3.select("#agesexnotes").html("<h4>Remarque</h4><p>" + note1Text + extraNotes + "</p><p>" + note2Text + "</p>");
				}
			}
			else if (d.Location == "Vaccine Type - Stacked Bar Chart - Coverage") {
				if (language == "en") {
					extraNotes = ' Reporting delays can result in artificial changes in weekly counts. Information is subject to change and may differ from provincial and territorial reports, due to the suppression of values less than five for seven provinces and territories and the timing of updates (see <a href="/covid-19/vaccination-coverage/technical-notes.html#a6">limitations</a>).';
					d3.select("#vaccinetypenotes").html("<h4>Note</h4><p>" + note1Text + extraNotes + "</p><p>" + note2Text + "</p>");
				}
				else {
					extraNotes = ' Les retards dans la soumission des rapports peuvent entraîner des changements artificiels au nombre de personnes vaccinées par semaine. Les informations sont sujettes à changement et peuvent différer des rapports provinciaux et territoriaux selon le moment où les données sont mises à jour et puisque les valeurs inférieures à cinq ont été supprimées pour sept provinces et territoires (voir <a href="/covid-19/couverture-vaccinale/notes-techniques.html#a6">limites</a>).';
					d3.select("#vaccinetypenotes").html("<h4>Remarque</h4><p>" + note1Text + extraNotes + "</p><p>" + note2Text + "</p>");
				}
			}
			else if (d.Location == "Key Populations - Line Chart - Coverage") {
				if (language == "en") {
					extraNotes = ' Use caution when comparing data over time. Some increases are due to provinces and territories providing their first reports on different weeks. Reporting delays can result in artificial changes in weekly counts. Information is subject to change and may differ from provincial and territorial reports, due to the suppression of values less than five for seven provinces and territories and the timing of updates (see <a href="/covid-19/vaccination-coverage/technical-notes.html#a6">limitations</a>).'; // Data on adults in remote and isolated Indigenous communities will be included in future reports, when available.';
					d3.select("#keypopslinenotes").html("<h4>Note</h4><p>" + note1Text + extraNotes + "</p><p>" + note2Text + "</p>");
				}
				else {
					extraNotes = ' Les tendances temporelles doivent être interprétées avec prudence. Certaines augmentations sont dues au fait que les provinces ou territoires ont fourni leurs premiers rapports sur différentes semaines. Les retards dans la soumission des rapports peuvent entraîner des changements artificiels au nombre de personnes vaccinées par semaine. Les informations sont sujettes à changement et peuvent différer des rapports provinciaux et territoriaux selon le moment où les données sont mises à jour et puisque les valeurs inférieures à cinq ont été supprimées pour sept provinces et territoires (voir <a href="/covid-19/couverture-vaccinale/notes-techniques.html#a6">limites</a>).'; // Les données portant sur les adultes des communautés autochtones éloignées et isolées seront ajoutées dans les prochains rapports lorsqu’elles seront disponibles.';
					d3.select("#keypopslinenotes").html("<h4>Remarque</h4><p>" + note1Text + extraNotes + "</p><p>" + note2Text + "</p>");
				}
			}
			else if (d.Location == "Map - Administration Distribution") {
				if (language == "en") {
					extraNotes = ' We update these numbers throughout the day. Not every province and territory updates their numbers on a daily basis, so use caution when comparing data over time or between jurisdictions (see <a href="/covid-19/vaccine-administration/technical-notes.html#a1">data sources</a>). Green bars show the cumulative number of doses administered as of the report date. Grey bars indicate that no data was updated on that day. Information is subject to change and may differ from provincial and territorial reports, depending on the timing of updates (see <a href="/covid-19/vaccine-administration/technical-notes.html#a3">limitations</a>).';
					d3.select("#mapadmindistnotes").html("<h4>Note</h4><p>" + note1Text + extraNotes + "</p><p>" + note2Text + "</p>");
				}
				else {
					extraNotes = 'Nous mettons à jour ces informations tout au long de la journée. Certaines provinces et certains territoires ne mettent pas à jour leurs données quotidiennement. C’est pourquoi il faut faire preuve de prudence lors de la comparaison dans le temps et entre provinces et territoires (voir les <a href="/covid-19/vaccins-administres/notes-techniques.html#a1">sources de données</a>). Les barres vertes présentent le nombre cumulatif de doses administrées à la date de mise à jour indiquée. Les barres grises indiquent qu’il n’y a pas eu de mise à jour des données à cette date. Les renseignements sont sujets à changement et peuvent différer des rapports provinciaux et territoriaux selon le moment où les données sont mises à jour (voir <a href="/covid-19/vaccins-administres/notes-techniques.html#a3">limites</a>).';
					d3.select("#mapadmindistnotes").html("<h4>Remarque</h4><p>" + note1Text + extraNotes + "</p><p>" + note2Text + "</p>");
				}
			}
		}
	})
}

//Build Key updates
function buildKeyUpdates() {
	var timeArrayEndPos = timeArray.length - 1;
	//d3.selectAll(".numtotal_doses_txt").text(numberFormat(+overall_nestedData[timeArrayEndPos].values[0].numtotal_partially+2*overall_nestedData[timeArrayEndPos].values[0].numtotal_fully))
	d3.selectAll(".prop_atleast1dose_txt").text(generateTxt(overall_nestedData[timeArrayEndPos].values[0].prop_atleast1dose, "prop"));
	d3.selectAll(".prop_fully_txt").text(generateTxt(overall_nestedData[timeArrayEndPos].values[0].prop_fully, "prop"));
	d3.selectAll(".prop_partially_txt").text(generateTxt(overall_nestedData[timeArrayEndPos].values[0].prop_partially, "prop"));
	d3.selectAll(".numtotal_atleast1dose_txt").text(generateTxt(overall_nestedData[timeArrayEndPos].values[0].numtotal_atleast1dose, "num"));
	d3.selectAll(".numtotal_fully_txt").text(generateTxt(overall_nestedData[timeArrayEndPos].values[0].numtotal_fully, "num"));
	d3.selectAll(".numtotal_partially_txt").text(generateTxt(overall_nestedData[timeArrayEndPos].values[0].numtotal_partially, "num"));
	d3.selectAll(".propweekdelta_atleast1dose_txt").text(generateTxt(overall_nestedData[timeArrayEndPos].values[0].propweekdelta_atleast1dose, "prop"));
	d3.selectAll(".propweekdelta_fully_txt").text(generateTxt(overall_nestedData[timeArrayEndPos].values[0].propweekdelta_fully, "prop"));
	d3.selectAll(".propweekdelta_partially_txt").text(generateTxt(overall_nestedData[timeArrayEndPos].values[0].propweekdelta_partially, "prop"));
	d3.selectAll(".numweekdelta_atleast1dose_txt").text(generateTxt(overall_nestedData[timeArrayEndPos].values[0].numweekdelta_atleast1dose, "num"));
	d3.selectAll(".numweekdelta_fully_txt").text(generateTxt(overall_nestedData[timeArrayEndPos].values[0].numweekdelta_fully, "num"));

	d3.selectAll(".numtotal_dosesdistributed_txt").text(numberFormat(current_numtotal_dosesdistributed));
	d3.selectAll(".date_dosesdistributed_txt").text(function() {
		if (language == "en") {
			return d3.timeFormat("%B %e, %Y")(date_numtotal_dosesdistributed);
		}
		else {
			return d3.timeFormat("%d %B %Y")(date_numtotal_dosesdistributed);
		}
	});

	d3.selectAll(".age80_num_atleast1dose_txt").text(generateTxt(keyPop_nestedData[0].values[timeArrayEndPos].numtotal_atleast1dose, "num"));
	d3.selectAll(".age80_prop_atleast1dose_txt").text(generateTxt(keyPop_nestedData[0].values[timeArrayEndPos].prop_atleast1dose, "prop"));
	d3.selectAll(".age80_num_partially_txt").text(generateTxt(keyPop_nestedData[0].values[timeArrayEndPos].numtotal_partially, "num"));
	d3.selectAll(".age80_prop_partially_txt").text(generateTxt(keyPop_nestedData[0].values[timeArrayEndPos].prop_partially, "prop"));
	d3.selectAll(".age80_num_fully_txt2").text(generateTxt(keyPop_nestedData[0].values[timeArrayEndPos].numtotal_fully, "num"));
	d3.selectAll(".age80_prop_fully_txt2").text(generateTxt(keyPop_nestedData[0].values[timeArrayEndPos].prop_fully, "prop"));

	let age70TimeArrayEndPos = keyPop_nestedData[1].values.length - 1;
	d3.selectAll(".age70_num_atleast1dose_txt").text(generateTxt(keyPop_nestedData[1].values[age70TimeArrayEndPos].numtotal_atleast1dose, "num"));
	d3.selectAll(".age70_prop_atleast1dose_txt").text(generateTxt(keyPop_nestedData[1].values[age70TimeArrayEndPos].prop_atleast1dose, "prop"));
	d3.selectAll(".age70_num_partially_txt").text(generateTxt(keyPop_nestedData[1].values[age70TimeArrayEndPos].numtotal_partially, "num"));
	d3.selectAll(".age70_prop_partially_txt").text(generateTxt(keyPop_nestedData[1].values[age70TimeArrayEndPos].prop_partially, "prop"));
	d3.selectAll(".age70_num_fully_txt").text(generateTxt(keyPop_nestedData[1].values[age70TimeArrayEndPos].numtotal_fully, "num"));
	d3.selectAll(".age70_prop_fully_txt").text(generateTxt(keyPop_nestedData[1].values[age70TimeArrayEndPos].prop_fully, "prop"));

	let territoriesTimeArrayEndPos = keyPop_nestedData[2].values.length - 1;
	d3.selectAll(".territories_num_atleast1dose_txt").text(generateTxt(keyPop_nestedData[2].values[territoriesTimeArrayEndPos].numtotal_atleast1dose, "num"));
	d3.selectAll(".territories_prop_atleast1dose_txt").text(generateTxt(keyPop_nestedData[2].values[territoriesTimeArrayEndPos].prop_atleast1dose, "prop"));
	d3.selectAll(".territories_num_partially_txt").text(generateTxt(keyPop_nestedData[2].values[territoriesTimeArrayEndPos].numtotal_partially, "num"));
	d3.selectAll(".territories_prop_partially_txt").text(generateTxt(keyPop_nestedData[2].values[territoriesTimeArrayEndPos].prop_partially, "prop"));
	d3.selectAll(".territories_num_fully_txt2").text(generateTxt(keyPop_nestedData[2].values[territoriesTimeArrayEndPos].numtotal_fully, "num"));
	d3.selectAll(".territories_prop_fully_txt2").text(generateTxt(keyPop_nestedData[2].values[territoriesTimeArrayEndPos].prop_fully, "prop"));

	d3.selectAll(".numtotal_atleast1dose_txt").text(numberFormat(overall_nestedData[timeArrayEndPos].values[0].numtotal_atleast1dose));
	d3.selectAll(".numtotal_partially_txt").text(numberFormat(overall_nestedData[timeArrayEndPos].values[0].numtotal_partially));
	d3.selectAll(".numtotal_fully_txt").text(numberFormat(overall_nestedData[timeArrayEndPos].values[0].numtotal_fully));

	d3.selectAll(".female_prop_atleast1dose_txt").text(generateTxt((+nestedData_bySexOnly[0].values[timeArrayEndPos].values[0].value.numtotal_atleast1dose / +nestedData_bySexOnlyDenoms[0].values[timeArrayEndPos].values[0].value.numtotal_population * 100), "prop"));
	d3.selectAll(".female_prop_partially_txt").text(generateTxt((+nestedData_bySexOnly[0].values[timeArrayEndPos].values[0].value.numtotal_partially / +nestedData_bySexOnlyDenoms[0].values[timeArrayEndPos].values[0].value.numtotal_population * 100), "prop"));
	d3.selectAll(".female_prop_fully_txt").text(generateTxt((+nestedData_bySexOnly[0].values[timeArrayEndPos].values[0].value.numtotal_fully / +nestedData_bySexOnlyDenoms[0].values[timeArrayEndPos].values[0].value.numtotal_population * 100), "prop"));
	d3.selectAll(".male_prop_atleast1dose_txt").text(generateTxt((+nestedData_bySexOnly[0].values[timeArrayEndPos].values[1].value.numtotal_atleast1dose / +nestedData_bySexOnlyDenoms[0].values[timeArrayEndPos].values[1].value.numtotal_population * 100), "prop"));
	d3.selectAll(".male_prop_partially_txt").text(generateTxt((+nestedData_bySexOnly[0].values[timeArrayEndPos].values[1].value.numtotal_partially / +nestedData_bySexOnlyDenoms[0].values[timeArrayEndPos].values[1].value.numtotal_population * 100), "prop"));
	d3.selectAll(".male_prop_fully_txt").text(generateTxt((+nestedData_bySexOnly[0].values[timeArrayEndPos].values[1].value.numtotal_fully / +nestedData_bySexOnlyDenoms[0].values[timeArrayEndPos].values[1].value.numtotal_population * 100), "prop"));

	d3.selectAll(".female_num_atleast1dose_txt").text(generateTxt((+nestedData_bySexOnly[0].values[timeArrayEndPos].values[0].value.numtotal_atleast1dose), "num"));
	d3.selectAll(".female_num_partially_txt").text(generateTxt((+nestedData_bySexOnly[0].values[timeArrayEndPos].values[0].value.numtotal_partially), "num"));
	d3.selectAll(".female_num_fully_txt").text(generateTxt((+nestedData_bySexOnly[0].values[timeArrayEndPos].values[0].value.numtotal_fully), "num"));
	d3.selectAll(".male_num_atleast1dose_txt").text(generateTxt((+nestedData_bySexOnly[0].values[timeArrayEndPos].values[1].value.numtotal_atleast1dose), "num"));
	d3.selectAll(".male_num_partially_txt").text(generateTxt((+nestedData_bySexOnly[0].values[timeArrayEndPos].values[1].value.numtotal_partially), "num"));
	d3.selectAll(".male_num_fully_txt").text(generateTxt((+nestedData_bySexOnly[0].values[timeArrayEndPos].values[1].value.numtotal_fully), "num"));

	d3.selectAll(".pfizer_prop_atleast1dose_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[0].value.prop_atleast1dose, "prop"));
	d3.selectAll(".pfizer_prop_partially_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[0].value.prop_partially, "prop"));
	d3.selectAll(".pfizer_prop_fully_txt").text(generateTxt(nestedData_byVac[0].values[timeArrayEndPos].values[0].value.prop_fully, "prop"));
	d3.selectAll(".moderna_prop_atleast1dose_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[1].value.prop_atleast1dose, "prop"));
	d3.selectAll(".moderna_prop_partially_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[1].value.prop_partially, "prop"));
	d3.selectAll(".moderna_prop_fully_txt").text(generateTxt(nestedData_byVac[0].values[timeArrayEndPos].values[1].value.prop_fully, "prop"));
	d3.selectAll(".covishield_prop_atleast1dose_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[2].value.prop_atleast1dose, "prop"));
	d3.selectAll(".covishield_prop_partially_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[2].value.prop_partially, "prop"));
	d3.selectAll(".covishield_prop_fully_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[2].value.prop_fully, "prop"));
	d3.selectAll(".astrazeneca_prop_atleast1dose_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[3].value.prop_atleast1dose, "prop"));
	d3.selectAll(".astrazeneca_prop_partially_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[3].value.prop_partially, "prop"));
	d3.selectAll(".astrazeneca_prop_fully_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[3].value.prop_fully, "prop"));

	d3.selectAll(".pfizer_num_atleast1dose_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[0].value.numtotal_atleast1dose, "num"));
	d3.selectAll(".pfizer_num_partially_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[0].value.numtotal_partially, "num"));
	d3.selectAll(".pfizer_num_fully_txt").text(generateTxt(nestedData_byVac[0].values[timeArrayEndPos].values[0].value.numtotal_fully, "num"));
	d3.selectAll(".moderna_num_atleast1dose_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[1].value.numtotal_atleast1dose, "num"));
	d3.selectAll(".moderna_num_partially_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[1].value.numtotal_partially, "num"));
	d3.selectAll(".moderna_num_fully_txt").text(generateTxt(nestedData_byVac[0].values[timeArrayEndPos].values[1].value.numtotal_fully, "num"));
	d3.selectAll(".covishield_num_atleast1dose_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[2].value.numtotal_atleast1dose, "num"));
	d3.selectAll(".covishield_num_partially_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[2].value.numtotal_partially, "num"));
	d3.selectAll(".covishield_num_fully_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[2].value.numtotal_fully, "num"));
	d3.selectAll(".astrazeneca_num_atleast1dose_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[3].value.numtotal_atleast1dose, "num"));
	d3.selectAll(".astrazeneca_num_partially_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[3].value.numtotal_partially, "num"));
	d3.selectAll(".astrazeneca_num_fully_txt").text(generateTxt(+nestedData_byVac[0].values[timeArrayEndPos].values[3].value.numtotal_fully, "num"));
}

//Build Figure 1. National Distribution - Map
function buildMap(data) {
	var marginSideGraph = { top: 22, right: 15, bottom: 70, left: 54 },
		widthSideGraph = 292.5 - marginSideGraph.left - marginSideGraph.right,
		heightSideGraph = 230 - marginSideGraph.top - marginSideGraph.bottom;

	var xSideGraph = d3.scaleBand().range([0, widthSideGraph]).paddingOuter(0.1).paddingInner(0.2);
	var ySideGraph = d3.scaleLinear().range([heightSideGraph, 0]);

	// define the line
	// var trendline = d3.line()
	// 	.defined(function(d) {
	// 		if (d.value[0][vaccineDropdowns] != null) {
	// 			return true;
	// 		}
	// 		else {
	// 			return true;
	// 		}
	// 	})
	// 	.x(function(d) { return xSideGraph(parseTime(d.key)); })
	// 	.y(function(d) { return ySideGraph(d.value[0][vaccineDropdowns]); });

	var timeDataSortOrder = ["1", "59", "48", "47", "46", "35", "24", "10", "13", "12", "11", "60", "61", "62"];

	var timeData = d3.nest()
		.key(function(d) { return d.pruid; }).sortKeys(function(a, b) {
			return timeDataSortOrder.indexOf(a) - timeDataSortOrder.indexOf(b);
		}).key(function(d) { return +parseTime(d.date); }).sortKeys(d3.ascending)
		.entries(data);

	var timeData2 = d3.nest()
		.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
		.key(function(d) { return d["week_end"]; }).sortKeys(d3.ascending)
		.object(data);

	var timeData3 = d3.nest()
		.key(function(d) { return d.pruid; }).sortKeys(d3.ascending)
		.key(function(d) { return d["week_end"]; }).sortKeys(d3.ascending)
		.map(data);

	numPropDropdownVal2 = $('#map-ddl-1').val();
	if (numPropDropdownVal2 == undefined) {
		numPropDropdownVal2 = "numtotal";
	}
	if (numPropDropdownVal2.slice(0, 3) == "num") {
		numPropDropdownVal = "num";
	}
	else {
		numPropDropdownVal = "prop";
	}
	vaccineDropdownVal = $('#map-ddl-2').val();
	if (vaccineDropdownVal == undefined) {
		if (urlProduct != "cov") {
			vaccineDropdownVal = "_all";
		}
		else {
			vaccineDropdownVal = "";
		}
	}
	typeDropdownVal = $('#map-ddl-3').val();
	if (typeDropdownVal == undefined) {
		if (urlProduct != "cov") {
			typeDropdownVal = "_administered";
		}
		else {
			typeDropdownVal = "";
		}
	}
	typeDropdownTxt = $('#map-ddl-3 option:selected').text();
	if (typeDropdownTxt == "") {
		if (urlProduct != "cov") {
			if (language == "en") {
				typeDropdownTxt = "administered";
			}
			else {
				typeDropdownTxt = "administrées";
			}
		}
		else {
			typeDropdownTxt = "";
		}
	}
	vaccineDropdowns = numPropDropdownVal2 + vaccineDropdownVal + typeDropdownVal;
	vaccineDropdownTxt = $('#map-ddl-2 option:selected').text();
	if (vaccineDropdownTxt == "") {
		if (urlProduct != "cov") {
			if (language == "en") {
				vaccineDropdownTxt = "all";
			}
			else {
				vaccineDropdownTxt = "total";
			}
		}
		else {
			vaccineDropdownTxt = "";
		}
	}
	var currentRegion;

	//Set current date to default (latest data)
	let currentDate;
	let currentIDMap = "1";
	if (typeDropdownVal == "_distributed") {
		mapData = mapDataDist;
		currentDate = datesArrayDist[datesArrayDist.length - 1];
		var parseTimeAdmin = d3.timeParse("%Y-%m-%d %H:%M");
		// initialize update date for distribution data
		d3.selectAll(".updateDateAdminDistData").text(function() {
			if (language == "en") {
				formatTimeAdmin = d3.timeFormat("%B %-d, %Y, %-I %p EST");
				return formatTimeAdmin(parseTimeAdmin(updateDateDist2)).replace("PM", "pm").replace("AM", "am");
			}
			else {
				formatTimeAdmin = d3.timeFormat("%-d %B %Y, %-H h (Heure de l'Est)");
				return formatTimeAdmin(parseTimeAdmin(updateDateDist2));
			}
		});
		// initialize dropdown for vaccine type
		$('#map-ddl-2 option[value="_pfizerbiontech"]').prop("disabled", "");
		$('#map-ddl-2 option[value="_moderna"]').prop("disabled", "");
		$('#map-ddl-2 option[value="_astrazeneca"]').prop("disabled", "");
		$('#map-ddl-2 option[value="_all"]').prop({ selected: true });
		// initialize download button for distribution data
		$("#dlAdmin").hide();
		$("#dlDist").show();
	} else if (typeDropdownVal == "_administered") {
		mapData = mapDataAdmin;
		currentDate = datesArrayAdmin[datesArrayAdmin.length - 1];
		//initialize update data for administration data
		var parseTimeAdmin = d3.timeParse("%Y-%m-%d %H:%M");
		d3.selectAll(".updateDateAdminDistData").text(function() {
			if (language == "en") {
				formatTimeAdmin = d3.timeFormat("%B %-d, %Y, %-I %p EST");
				return formatTimeAdmin(parseTimeAdmin(updateDateAdmin2)).replace("PM", "pm").replace("AM", "am");
			}
			else {
				formatTimeAdmin = d3.timeFormat("%-d %B %Y, %-H h (Heure de l'Est)");
				return formatTimeAdmin(parseTimeAdmin(updateDateAdmin2));
			}
		});
		// initialize dropdown for vaccine type
		$('#map-ddl-2 option[value="_pfizerbiontech"]').prop("disabled", "true");
		$('#map-ddl-2 option[value="_moderna"]').prop("disabled", "true");
		$('#map-ddl-2 option[value="_astrazeneca"]').prop("disabled", "true");
		$('#map-ddl-2 option[value="_all"]').prop({ selected: true });
		// initialize download button for administration data
		$("#dlDist").hide();
		$("#dlAdmin").show();
	} else {
		currentDate = datesArray[datesArray.length - 1];
	}
	var currentDateStart = deltaDate(new Date(parseTime(currentDate)), -6, 0, 0);

	$(".ddl1Txt").text(function(d) {
		if (vaccineDropdownVal == "_all" || vaccineDropdownVal == "_pfizerbiontech" || vaccineDropdownVal == "_moderna") {
			if (numPropDropdownVal == "num") {
				if (numPropDropdownVal2 == "numtotal") {
					if (language == "en") {
						return "cumulative number";
					}
					else {
						return "nombre cumulatif";
					}
				}
				else {
					if (language == "en") {
						return "weekly number";
					}
					else {
						return "nombre hebdomadaire";
					}

				}
			}
		}
		else {
			if (numPropDropdownVal == "num") {
				if (numPropDropdownVal2 == "numtotal") {
					if (language == "en") {
						return "cumulative number of people";
					}
					else {
						return "nombre cumulatif de personnes";
					}
				}
				else {
					if (language == "en") {
						return "weekly number of people";
					}
					else {
						return "nombre hebdomadaire de personnes";
					}
				}
			}
			else {
				if (numPropDropdownVal2 == "proptotal") {
					if (language == "en") {
						return "cumulative percent of the population";
					}
					else {
						return "pourcentage cumulatif de la population";
					}
				}
				else {
					if (language == "en") {
						return "weekly percent of the population";
					}
					else {
						return "pourcentage hebdomadaire de la population";
					}
				}
			}
		}
	});
	if (urlProduct == "cov") {
		$(".ddl2Txt").text(vaccineDropdownTxt.toLowerCase());
		if (vaccineDropdownVal == "_atleast1dose") {
			if (language == "en") {
				d3.selectAll(".ddl1mapTxt2").style("display", "");
				d3.selectAll(".ddl1mapTxt3").text("of");
			}
			else {
				d3.selectAll(".ddl1mapTxt2").style("display", "");
				d3.selectAll(".ddl1mapTxt3").text("d'");
			}
		}
		else {
			if (language == "en") {
				d3.selectAll(".ddl1mapTxt2").style("display", "none");
				d3.selectAll(".ddl1mapTxt3").text("with");
			}
			else {
				d3.selectAll(".ddl1mapTxt2").style("display", "none");
				d3.selectAll(".ddl1mapTxt3").text("avec ");
			}
		}
	}
	else {
		$(".ddl2Txt").text(vaccineDropdownTxt);
	}

	var colorScale = {
		"5": "#efefa2",
		"4": "#c2e699",
		"3": "#78c679",
		"2": "#31a354",
		"1": "#006837",
		"No data": "#bfbfbf"
	};

	d3.selectAll(".updateDate").text(function() {
		let timeValue;
		if (language == "en") {
			timeValue = d3.timeFormat("%B %e, %Y")(parseTime(currentDate)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
		}
		else {
			timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
		}
		// 			d3.select("#descText2").text(timeValue);
		return timeValue;
	})
	d3.selectAll(".updateDateStart").text(function() {
		let timeValue;
		if (language == "en") {
			timeValue = d3.timeFormat("%B %e, %Y")(parseTime(currentDate)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
		}
		else {
			timeValue = d3.timeFormat("%d %B %Y")(currentDateStart);
		}
		// 			d3.select("#descText2").text(timeValue);
		return timeValue;
	})

	let ddl1mapTxt;
	// if(numPropDropdownVal == "num"){
	if (language == "en") {
		ddl1mapTxt = "people";
	}
	else {
		ddl1mapTxt = "personnes";
	}
	// }else{
	// 	if(language == "en"){
	// 		ddl1mapTxt = "the population";
	// 	}else{
	// 		ddl1mapTxt = "la population";
	// 	}
	// }
	d3.selectAll(".ddl1mapTxt").text(ddl1mapTxt);

	// format the data
	data.forEach(function(d) {
		d.numtotal_atleast1dose = d["numtotal_atleast1dose"];
		d.numtotal_fully = d["numtotal_fully"];
		d.numweekdelta_atleast1dose = d["numweekdelta_atleast1dose"];
		d.numweekdelta_fully = d["numweekdelta_fully"];
		// d.numtotal_pfizerbiontech_distributed = d["numtotal_pfizerbiontech_distributed"];
		// d.numtotal_moderna_distributed = d["numtotal_moderna_distributed"];
		// d.numtotal_all_distributed = d["numtotal_all_distributed"];
		d.proptotal_atleast1dose = d["proptotal_atleast1dose"];
		d.proptotal_fully = d["proptotal_fully"];
		d.propweekdelta_atleast1dose = d["propweekdelta_atleast1dose"];
		d.propweekdelta_fully = d["propweekdelta_fully"];
		d.trend = timeData2[+d.pruid];
	});

	var jsonfiles = [
		'/src/json/Can_PR2016.json'
	]

	var promisesJson = [];

	jsonfiles.forEach(function(url) {
		promisesJson.push(d3.json(url))
	});

	Promise.all(promisesJson).then(function(values) {
		vaccineCoverageMap(values[0]);
	}).then(function() {});

	function vaccineCoverageMap(mapJSON) {
		svg = d3.selectAll('#map-container')
			.append('svg')
			.attr("id", "map")
			.attr('width', "100%")
			.attr('height', function() {
				if (isIE) {
					return 650;
				}
			})
			.attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox", "0 0 715 620");

		var provinces = topojson.feature(mapJSON, mapJSON.objects.Can_PR2016);
		const projection = d3.geoIdentity(function(x, y) { return [x, -y]; })
			.reflectY(true).scale(0.00013).translate([-460, 700]);
		var path = d3.geoPath().projection(projection);

		var province = svg
			.append('g')
			.attr("id", "mapGroup")
			.attr("transform", "translate(0,0)")
			.selectAll('g')
			.data(provinces.features)
			.enter()

		province
			.append("g")
			.attr("class", "regions")
			.attr("id", function(d) { return "g" + d.properties["PRUID"] })
			.attr("tabindex", 0)
			.attr("data-taborder", function(d) {
				return d.properties.TABORDER;
			})
			.attr("focusable", "true")
			.append('path')
			.attr("id", function(d) { return "map" + d.properties["PRUID"] })
			.attr("class", "PRUID")
			.attr("d", path)
			.attr("stroke", "#333")
			.attr("stroke-width", 1);

		d3.select("#mapGroup")
			.selectAll(".regions")
			.on("mouseover", function(d) {
				//Styling
				// d3.select(this).raise();
				d3.select(this).select("path").attr("stroke", "black").attr("stroke-width", 3);

				//Do things with data
				currentRegion = d3.select(this).data()[0];
				currentIDMap = d.properties.PRUID;

				var txtName;
				if (language == "en") {
					txtName = currentRegion.properties.PRENAME;
				}
				else {
					txtName = currentRegion.properties.PRFNAME;
				}
				d3.select(".currentRegion").text(function() {
					return txtName;
				})

				var numTotal;
				var numPercentTotal;
				if (mapData.get(d.properties.PRUID)) {
					numPercentTotal = mapData.get(d.properties.PRUID).get(currentDate)[0][vaccineDropdowns];
					if (numPercentTotal == "") {
						if (language == "en") {
							numPercentTotal = "not available";
						}
						else {
							numPercentTotal = "non disponible";
						}
					}
					d3.selectAll(".currentNumberPercent").html(function() {
						if (mapData.get(d.properties.PRUID).get(currentDate)[0][vaccineDropdowns] == "") {
							return numPercentTotal;
						}
						else {
							return generateTxt(numPercentTotal, numPropDropdownVal);
						}
					});
				}

				d3.selectAll(".currentDate").text(function() {
					let timeValue;
					if (language == "en") {
						timeValue = d3.timeFormat("%B%e, %Y")(parseTime(currentDate)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
					}
					else {
						timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
					}
					return timeValue;
				})

				if (urlProduct != "cov") {
					// let date_numtotal_dosesadministered2 = date_numtotal_dosesadministered;
					// while(!checkDate(date_numtotal_dosesadministered2,d.properties.PRUID,"graph")){
					// 	date_numtotal_dosesadministered2 = formatTimeAdminDist(deltaDate(parseTime(date_numtotal_dosesadministered2), -1, 0, 0));
					// }
					let asofdate_numtotal_dosesadministered = date_numtotal_dosesadministered;
					d3.selectAll(".updateDateAdminDist").text(function() {
						if (language == "en") {
							return d3.timeFormat("%B %e, %Y")(parseTime(asofdate_numtotal_dosesadministered));
						}
						else {
							return d3.timeFormat("%d %B %Y")(parseTime(asofdate_numtotal_dosesadministered));
						}
					});
				}

				d3.selectAll(".textArticle1").text(function() {
					return getPRUIDArticleText(+currentRegion.properties.PRUID);
				});

				updateTrend();
			})
			.on("mouseout", function(d) {
				//Styling
				// d3.select(this).select("path").attr("stroke", "#828080").attr("stroke-width", 1);
				d3.select(this).select("path").attr("stroke", "black").attr("stroke-width", 1);
			})
			.on("focus", function(d) {
				unfocus();
				//Styling
				d3.select(this).classed("activeRegion", true);
				d3.select(this).select("path").attr("stroke", "black").attr("stroke-width", 3);
				//Do things with data
				currentRegion = d3.select(this).data()[0];
				currentIDMap = d.properties.PRUID;

				var txtName;
				if (language == "en") {
					txtName = d.properties.PRENAME;
				}
				else {
					txtName = d.properties.PRFNAME;
				}
				d3.select(".currentRegion").text(function() {
					return txtName;
				})

				var numTotal;
				var numPercentTotal;
				if (mapData.get(d.properties.PRUID)) {
					numPercentTotal = mapData.get(d.properties.PRUID).get(currentDate)[0][vaccineDropdowns];
					if (numPercentTotal == "") {
						if (language == "en") {
							numPercentTotal = "not available";
						}
						else {
							numPercentTotal = "non disponible";
						}
					}
					d3.selectAll(".currentNumberPercent").html(function() {
						if (numPercentTotal == "") {
							return numPercentTotal;
						}
						else {
							return generateTxt(numPercentTotal, numPropDropdownVal);
						}
					});
				}

				d3.selectAll(".currentDate").text(function() {
					let timeValue;
					if (language == "en") {
						timeValue = d3.timeFormat("%B%e, %Y")(parseTime(currentDate)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
					}
					else {
						timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
					}
					return timeValue;
				})

				d3.selectAll(".textArticle1").text(function() {
					return getPRUIDArticleText(+currentRegion.properties.PRUID);
				});

				updateTrend();
			})

		const regionsCircles = d3.select("#mapGroup").selectAll(".regions")
			.append("g")
			.data(provinces.features.filter(function(d) {
				return d.properties.PRUID;
			}))
			.attr("class", "regionValues");

		//Append circle label backgrounds
		regionsCircles.append("circle")
			.attr("class", "regionValuesCircle")
			.attr("r", function(d) {
				if (mapData.get(d.properties.PRUID)) {
					let numPow = Math.floor(Math.log10(mapData.get(d.properties.PRUID).get(currentDate)[0][vaccineDropdowns]));
					if (numPow == 8 || numPow == -5) {
						return 38;
					}
					else if (numPow == 7 || numPow == -4) {
						return 36;
					}
					else if (numPow == 6 || numPow == -3) {
						return 32;
					}
					else if (numPow == 5 || numPow == -2) {
						return 30;
					}
					else if (numPow == 4 || numPow == -1) {
						return 28;
					}
					else {
						return 26;
					}
				}
				else {
					return 0;
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
				if (mapData.get(d.properties.PRUID)) {
					return (generateTxt(mapData.get(d.properties.PRUID).get(currentDate)[0][vaccineDropdowns], numPropDropdownVal));
				}
				else {
					return "N/A";
				}
			})
			.attr("transform", function(d) {
				return $("#g" + d.properties.PRUID + " .regionValues circle").attr("transform");
			})
			.attr("font-size", function() {
				return "14px";
			})
			.attr("fill", "white")
			.attr("class", "regionCircleText")
			.style("text-anchor", "middle")
			.style("fill", "white")
			.transition()
			.duration(600)
			.tween("text", function(d) {
				const that = d3.select(this);
				if (mapData.get(d.properties.PRUID)) {
					if (d.properties.PRUID, mapData.get(d.properties.PRUID).get(currentDate)[0][vaccineDropdowns] != "") {
						const i = d3.interpolateNumber(0, mapData.get(d.properties.PRUID).get(currentDate)[0][vaccineDropdowns]);
						return function(t) { that.text(generateTxt(i(t), numPropDropdownVal)); };
					}
					else {
						if (language == "en") {
							that.text("N/A");
						}
						else {
							that.text("s.o.");
						}
						return 0;
					}
				}
				else {
					that.text("N/A")
					return 0;
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
					.attr("stroke", "black")
			}
			else if (d.properties.PRUID == 12) {
				offsetsCircle = [55, 0];
				offsetsLine = [30, 0];
				$("#g" + d.properties.PRUID + " .regionValues circle").attr("transform", "translate(" + ((+transformVals[0]) + (+offsetsCircle[0])) + "," + ((+transformVals[1]) + (+offsetsCircle[1])) + ")");
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
				offsetsLine = [30, -15];
				$("#g" + d.properties.PRUID + " .regionValues circle").attr("transform", "translate(" + ((+transformVals[0]) + (+offsetsCircle[0])) + "," + ((+transformVals[1]) + (+offsetsCircle[1])) + ")");
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

		d3.select("#mapGroup").selectAll(".regions").selectAll(".regionDeathsLine").style("display", function(d, i) {
			if (mapData.get(d.properties.PRUID) && mapData.get(d.properties.PRUID).get(currentDate)) {
				return "";
			}
			else {
				return "none";
			}
		})

		const mapCanada = d3.select("#mapGroup").datum(mapData.get("1").get(currentDate)[0]).append("g")
			.attr("id", "Canada")
			.attr("tabindex", 0)
			.attr("data-taborder", 1)
			.attr("focusable", "true")
			.on("mouseover", function(d) {
				//  d3.select(this).raise();
				currentRegion = d3.select(this).data()[0];
				currentIDMap = "1";

				var txtName = pruid2prov("1");

				d3.select(".currentRegion").text(function() {
					return txtName;
				})

				var numTotal;
				var numPercentTotal;
				if (mapData.get("1").get(currentDate)) {
					numPercentTotal = mapData.get("1").get(currentDate)[0][vaccineDropdowns];
					d3.selectAll(".currentNumberPercent").html(function() {
						return generateTxt(numPercentTotal, numPropDropdownVal);
					});
				}

				d3.selectAll(".txtCurrentDate").text(function() {
					let timeValue;
					if (language == "en") {
						timeValue = d3.timeFormat("%B %e, %Y")(parseTime(currentDate)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
					}
					else {
						timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
					}
					return timeValue;
				})

				d3.selectAll(".textArticle1").text(function() {
					return getPRUIDArticleText(1);
				});

				if (typeDropdownVal == "_administered") {
					currentRegion = dosesadministered[0].values;
					updateTrend(currentRegion);
				}
				else {
					currentRegion = d3.select("#Canada").data()[0];
					updateTrend(currentRegion.trend);
				}
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

				var txtName = pruid2prov("1");

				d3.select(".currentRegion").text(function() {
					return txtName;
				})

				var numTotal;
				var percentTotal;
				if (mapData.get("1").get(currentDate)) {
					numPercentTotal = mapData.get("1").get(currentDate)[0][vaccineDropdowns];
					d3.selectAll(".currentNumberPercent").html(function() {
						return generateTxt(numPercentTotal, numPropDropdownVal);
					});
				}

				d3.selectAll(".txtCurrentDate").text(function() {
					let timeValue;
					if (language == "en") {
						timeValue = d3.timeFormat("%B%e, %Y")(parseTime(currentDate)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
					}
					else {
						timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
					}
					d3.select("#descText2").text(timeValue);
					return timeValue;
				})

				d3.selectAll(".textArticle1").text(function() {
					return getPRUIDArticleText(1);
				});

				if (typeDropdownVal == "_administered") {
					currentRegion = dosesadministered[0].values;
					updateTrend(currentRegion);
				}
				else {
					currentRegion = d3.select("#Canada").data()[0];
					updateTrend(currentRegion.trend);
				}
				$(".backgroundCanada").attr("stroke", "#000000").attr("stroke-width", 2);
			})

		numPercentTotal = mapData.get(1).get(currentDate)[0][vaccineDropdowns];
		d3.selectAll(".currentNumberPercent").html(function() {
			return generateTxt(numPercentTotal, numPropDropdownVal);
		});

		d3.selectAll(".currentNumberPercentPost").html(function() {
			if (numPropDropdownVal == "num") {
				if (language == "en") {
					return "";
				}
				else {
					return "personnes";
				}
			}
			else {
				if (language == "en") {
					return "";
				}
				else {
					return "de la population";
				}
			}
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
			.attr("r", function(d) {
				let numPow = Math.floor(Math.log10(mapData.get("1").get(currentDate)[0][vaccineDropdowns]));
				if (numPow == 8 || numPow == -5) {
					return 40;
				}
				else if (numPow == 7 || numPow == -4) {
					return 38;
				}
				else if (numPow == 6 || numPow == -3) {
					return 36;
				}
				else if (numPow == 5 || numPow == -2) {
					return 34;
				}
				else if (numPow == 4 || numPow == -1) {
					return 32;
				}
				else {
					return 30;
				}
			})
			.attr("fill", "rgb(54, 54, 54)");

		mapCanada.append("text")
			.attr("class", "CanadaTextValue")
			.text(function(d) {
				return mapData.get("1").get(currentDate)[0][vaccineDropdowns];
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
				const i = d3.interpolateNumber(0, mapData.get("1").get(currentDate)[0][vaccineDropdowns]);
				return function(t) { that.text(generateTxt(i(t), numPropDropdownVal)); };
			})


		//Repatriated Totals
		// if(urlProduct != "cov"){
		// }

		d3.selectAll(".numArticle").text(function() {
			let txtNumArticle;
			if (language == "en") {
				// if ((typeCases == "numdeaths")||(typeCases == "ratedeaths")) {
				// 	return  "related to";
				// }
				// else if (typeCases == "numrecover") {
				// 	return "from";
				// }
				// else if ((typeCases == "numtested")||(typeCases == "ratetested")) {
				// 	return "for";
				// }else {
				return "of";
				// }
				return txtNumArticle;
			}
			else {
				// if ((typeCases == "numtested")||(typeCases == "ratetested")) {
				txtNumArticle = "pour la";
				// }
				// else if ((typeCases == "numdeaths")||(typeCases == "ratedeaths")) {
				// 	txtNumArticle = "liés à la";
				// }
				// else {
				// 	txtNumArticle = "de la";
				// }
				return txtNumArticle;
			}
		})

		d3.selectAll(".map-ddl-3-txt").text(function(d) {
			return typeDropdownTxt;
		})

		regionsCircles.style("display", function(d, i) {
			if (checkDate(currentDate, d.properties.PRUID)) {
				return "";
			}
			else {
				return "none";
			}
		})

		//Set default DOM order
		var domNodeList = d3.selectAll("#mapGroup > g").nodes().sort(function(a, b) {
			var aNode = +d3.select(a).attr("data-taborder");
			var bNode = +d3.select(b).attr("data-taborder");
			return aNode - bNode;
		})
		d3.selectAll(domNodeList).order();

		currentRegion = d3.select("#Canada").data()[0];

		drawLegend(timeData);
		colorMap();
		drawTrend();
	}

	function colorMap() {
		d3.selectAll(".PRUID")
			.attr("fill", function(d, i) {
				if (mapData.get(d.properties.PRUID)) {
					if (mapData.get(d.properties.PRUID).get(currentDate)) {
						if (typeDropdownVal == "_administered") {
							if (checkDate(currentDate, d.properties.PRUID, "map")) {
								if (mapData.get(d.properties.PRUID).get(currentDate)[0][vaccineDropdowns] != "") {
									return color(mapData.get(d.properties.PRUID).get(currentDate)[0][vaccineDropdowns]);
								}
								else {
									return "#bfbfbf";
								}
							}
							else {
								return "#bfbfbf";
							}
						}
						else {
							if (mapData.get(d.properties.PRUID).get(currentDate)[0][vaccineDropdowns] != "") {
								return color(mapData.get(d.properties.PRUID).get(currentDate)[0][vaccineDropdowns]);
							}
							else {
								return "#bfbfbf";
							}
						}
					}
					else {
						return "#bfbfbf";
					}
				}
				else {
					return "#bfbfbf";
				}
			});
	}

	// d3.select("#animateMap").on("focus", function() {
	// 	unfocus();
	// });

	function unfocus() {
		var activeRegion = d3.select(".activeRegion");
		activeRegion.select("path").attr("stroke", "black").attr("stroke-width", 1);
		activeRegion.classed("activeRegion", false);
		d3.select("#Canada").select("rect").attr("stroke", "");
		d3.select("#Canada").select("rect").attr("stroke-width", "");
		d3.select("#repatriated").select("rect").attr("stroke", "");
		d3.select("#repatriated").select("rect").attr("stroke-width", "");
	}

	var index = 0;

	$('#map-ddl-1, #map-ddl-2, #map-ddl-3').on('change', function() {

		if (typeDropdownVal == "_administered") {
			$('#map-ddl-2 option[value="_pfizerbiontech"]').prop("disabled", "true");
			$('#map-ddl-2 option[value="_moderna"]').prop("disabled", "true");
			$('#map-ddl-2 option[value="_astrazeneca"]').prop("disabled", "true");
			$('#map-ddl-2 option[value="_all"]').prop({ selected: true });
		}
		else {
			$('#map-ddl-2 option[value="_pfizerbiontech"]').prop("disabled", "");
			$('#map-ddl-2 option[value="_moderna"]').prop("disabled", "");
			$('#map-ddl-2 option[value="_astrazeneca"]').prop("disabled", "");
			$('#map-ddl-2 option[value="_all"]').prop({ selected: true });
		}

		if ($('#map-ddl-3').val() == "_distributed") {
			currentDate = datesArrayDist[datesArrayDist.length - 1];
			mapData = mapDataDist;
			// show download button for distribution data
			$("#dlAdmin").hide();
			$("#dlDist").show();
		}
		else if ($('#map-ddl-3').val() == "_administered") {
			currentDate = datesArrayAdmin[datesArrayAdmin.length - 1];
			mapData = mapDataAdmin;
			// show download button for administration data
			$("#dlDist").hide();
			$("#dlAdmin").show();
		}
		
		// window.history.pushState(null, null, window.location.origin + window.location.pathname + '?stat='+$("#dropdownType3").val()+"&measure="+ $("#dropdownType1").val()+"#a2");		

		//Disable choices where necessary
		// 	    if($('#dropdownType3').val()=="rate"){
		// 	       //$('#dropdownType1 option[value="deaths"]').css("display","none");
		// 	       $('#dropdownType1 option[value="recover"]').css("display","none");
		// 		   $('#dropdownType1 option[value="recover"]').prop("disabled","true");
		// 	       $('#txtTotalMod').css('display','');
		// 	    }else{
		// 	       //$('#dropdownType1 option[value="deaths"]').css("display",""); 
		// 	       $('#dropdownType1 option[value="recover"]').css("display","");
		// 		   $('#dropdownType1 option[value="recover"]').prop("disabled","");
		// 	       $('#txtTotalMod').css('display','none');
		// 	    }
		//         // $('#dropdownType1').val()=="deaths" ? $('#dropdownType3 option[value="rate"]').css("display","none") : $('#dropdownType3 option[value="rate"]').css("display","");
		//         $('#dropdownType1').val()=="recover" ? $('#dropdownType3 option[value="rate"]').css("display","none") : $('#dropdownType3 option[value="rate"]').css("display","");
		// 		$('#dropdownType1').val()=="recover" ? $('#dropdownType3 option[value="rate"]').prop("disabled","true") : $('#dropdownType3 option[value="rate"]').prop("disabled","");

		if ($('#map-ddl-1').val() == "numweekdelta" || $('#map-ddl-1').val() == "propweekdelta") {
			//$('#dropdownType1 option[value="deaths"]').css("display","none");
			//$('#map-ddl-2 option[value="_partially"]').css("display","none");
			$('#map-ddl-2 option[value="_partially"]').prop("disabled", "true");
		}
		else {
			$('#map-ddl-2 option[value="_partially"]').prop("disabled", "");
		}

		if ($('#map-ddl-2').val() == "_partially") {
			//$('#dropdownType1 option[value="deaths"]').css("display","none");
			//$('#map-ddl-2 option[value="_partially"]').css("display","none");
			$('#map-ddl-1 option[value="numweekdelta"]').prop("disabled", "true");
			$('#map-ddl-1 option[value="propweekdelta"]').prop("disabled", "true");
		}
		else {
			$('#map-ddl-1 option[value="numweekdelta"]').prop("disabled", "");
			$('#map-ddl-1 option[value="propweekdelta"]').prop("disabled", "");
		}

		numPropDropdownVal2 = $('#map-ddl-1').val();
		if (numPropDropdownVal2 == undefined) {
			numPropDropdownVal2 = "numtotal";
		}
		if (numPropDropdownVal2.slice(0, 3) == "num") {
			numPropDropdownVal = "num";
		}
		else {
			numPropDropdownVal = "prop";
		}
		vaccineDropdownVal = $('#map-ddl-2').val();
		typeDropdownVal = $('#map-ddl-3').val();
		if (typeDropdownVal == undefined) {
			typeDropdownVal = "";
		}
		typeDropdownTxt = $('#map-ddl-3 option:selected').text();
		vaccineDropdowns = numPropDropdownVal2 + vaccineDropdownVal + typeDropdownVal;
		vaccineDropdownTxt = $('#map-ddl-2 option:selected').text();

		$(".ddl1Txt").text(function(d) {
			if (vaccineDropdownVal == "_all" || vaccineDropdownVal == "_pfizerbiontech" || vaccineDropdownVal == "_moderna") {
				if (numPropDropdownVal == "num") {
					if (numPropDropdownVal2 == "numtotal") {
						if (language == "en") {
							return "cumulative number";
						}
						else {
							return "nombre cumulatif";
						}
					}
					else {
						if (language == "en") {
							return "weekly number";
						}
						else {
							return "nombre hebdomadaire";
						}

					}
				}
			}
			else {
				if (numPropDropdownVal == "num") {
					if (numPropDropdownVal2 == "numtotal") {
						if (language == "en") {
							return "cumulative number of people";
						}
						else {
							return "nombre cumulatif de personnes";
						}
					}
					else {
						if (language == "en") {
							return "weekly number of people";
						}
						else {
							return "nombre hebdomadaire de personnes";
						}
					}
				}
				else {
					if (numPropDropdownVal2 == "proptotal") {
						if (language == "en") {
							return "cumulative percent of the population";
						}
						else {
							return "pourcentage cumulatif de la population";
						}
					}
					else {
						if (language == "en") {
							return "weekly percent of the population";
						}
						else {
							return "pourcentage hebdomadaire de la population";
						}
					}
				}
			}
		});
		if (urlProduct == "cov") {
			$(".ddl2Txt").text(vaccineDropdownTxt.toLowerCase());
			if (vaccineDropdownVal == "_atleast1dose") {
				if (language == "en") {
					d3.selectAll(".ddl1mapTxt2").style("display", "");
					d3.selectAll(".ddl1mapTxt3").text("of");
				}
				else {
					d3.selectAll(".ddl1mapTxt2").style("display", "");
					d3.selectAll(".ddl1mapTxt3").text("d'");
				}
			}
			else {
				if (language == "en") {
					d3.selectAll(".ddl1mapTxt2").style("display", "none");
					d3.selectAll(".ddl1mapTxt3").text("with");
				}
				else {
					d3.selectAll(".ddl1mapTxt2").style("display", "none");
					d3.selectAll(".ddl1mapTxt3").text("avec ");
				}
			}
		}
		else {
			$(".ddl2Txt").text(vaccineDropdownTxt);
		}

		d3.selectAll(".updateDate").text(function() {
			let timeValue;
			if (language == "en") {
				timeValue = d3.timeFormat("%B %e, %Y")(parseTime(currentDate)); //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
			}
			else {
				timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
			}
			// 			d3.select("#descText2").text(timeValue);
			return timeValue;
		})

		//Transition Styles
		colorMap()
		drawLegend()

		// 		Transition Numbers
		d3.selectAll('.regionCircleText').each(function(d) {
			d3.select(this).transition().duration(600).tween("text", function() {
				const that = d3.select(this);
				let currentVal;
				if (numPropDropdownVal == "num") {
					currentVal = +that.text().replace(/,/g, "").replace(/ /g, "");
				}
				else {
					currentVal = +that.text().replace(/,/g, ".").replace(/ /g, "").replace(/%/g, "");
				}
				let currentPT = d.properties.PRUID;
				let newVal;
				if (mapData.get(d.properties.PRUID) && mapData.get(d.properties.PRUID).get(currentDate) && mapData.get(d.properties.PRUID).get(currentDate)[0][vaccineDropdowns] != "") {
					newVal = +mapData.get(d.properties.PRUID).get(currentDate)[0][vaccineDropdowns];
				}
				else {
					if (index == 1) {
						newVal = 0;
					}
					else {
						//newVal == currentVal;
						if (language == "en") {
							that.text("N/A");
						}
						else {
							that.text("s.o.");
						}
						return 0;
					}
				}
				let format;
				if (!isNaN(+newVal)) {
					// format = d3.format(",d");
					d3.select(this.parentNode).classed("visible", true);
					d3.select(this.parentNode).classed("invisible", false);
					if (isNaN(+currentVal)) {
						d3.select(this.parentNode).attr("fill-opacity", 0).transition().duration(500).attr("fill-opacity", 1);
						currentVal = 0;
					}
					const i = d3.interpolateNumber(currentVal, +newVal);
					return function(t) { that.text(generateTxt(i(t), numPropDropdownVal)); };
				}
			});
		});

		let regionsCircles = d3.select("#mapGroup").selectAll(".regions").selectAll(".regionValues");

		regionsCircles.style("display", function(d, i) {
			if (checkDate(currentDate, d.properties.PRUID)) {
				return "";
			}
			else {
				return "none";
			}
		})

		d3.selectAll('.regionValuesCircle')
			.transition().duration(600)
			.attr("r", function(d, i) {
				if (mapData.get(d.properties.PRUID)) {
					let numPow = Math.floor(Math.log10(mapData.get(d.properties.PRUID).get(currentDate)[0][vaccineDropdowns]));
					if (numPow == 7 || numPow == -4) {
						return 36;
					}
					else if (numPow == 6 || numPow == -3) {
						return 32;
					}
					else if (numPow == 5 || numPow == -2) {
						return 30;
					}
					else if (numPow == 4 || numPow == -1) {
						return 28;
					}
					else {
						return 26;
					}
				}
				else {
					return 0;
				}
			})

		d3.selectAll('.circleCanada')
			.transition().duration(600)
			.attr("r", function(d, i) {
				let numPow = Math.floor(Math.log10(mapData.get("1").get(currentDate)[0][vaccineDropdowns]));
				if (numPow == 8 || numPow == -5) {
					return 40;
				}
				else if (numPow == 7 || numPow == -4) {
					return 38;
				}
				else if (numPow == 6 || numPow == -3) {
					return 36;
				}
				else if (numPow == 5 || numPow == -2) {
					return 34;
				}
				else if (numPow == 4 || numPow == -1) {
					return 32;
				}
				else {
					return 30;
				}
			})

		d3.select('.CanadaTextValue').each(function(d) {
			d3.select(this).transition().duration(600).tween("text", function() {
				const that = d3.select(this);
				let format;
				let i;
				let newVal;
				// if(typeDropdownVal == "_administered"){
				// 	newVal = dosesadministered2["1"][currentDate];
				// }else{
				newVal = mapData.get("1").get(currentDate)[0][vaccineDropdowns];
				// }
				// format = d3.format(",d");
				if (language == "en") {
					i = d3.interpolateNumber(+that.text().replace(/,/g, "").replace(/%/g, ""), newVal);
					return function(t) { that.text(generateTxt(i(t), numPropDropdownVal)); };
				}
				else {
					i = d3.interpolateNumber(+that.text().replace(/ /g, "").replace(/,/g, ".").replace(/%/g, ""), newVal);
					return function(t) { that.text(generateTxt(i(t), numPropDropdownVal)); };
				}
			});
		});

		d3.select("#legendTitle1")
			.text(function() {
				if (numPropDropdownVal == "num") {
					if (numPropDropdownVal2 == "numtotal") {
						if (typeDropdownVal == "_administered" || typeDropdownVal == "_distributed") {
							if (language == "en") {
								return "Cumulative number of COVID-19 vaccine doses " + typeDropdownTxt;
							}
							else {
								return "Nombre cumulatif de doses de vaccin  " + typeDropdownTxt + " contre la COVID-19";
							}
						}
						else {
							if (vaccineDropdownVal == "_atleast1dose") {
								if (language == "en") {
									return "Cumulative number of people who have received " + vaccineDropdownTxt.toLowerCase() + " of a COVID-19 vaccine";
								}
								else {
									return "Nombre cumulatif de personnes ayant reçu " + vaccineDropdownTxt.toLowerCase() + " d'un vaccin contre la COVID-19";
								}
							}
							else {
								if (language == "en") {
									return "Cumulative number of people " + vaccineDropdownTxt.toLowerCase() + " with a COVID-19 vaccine";
								}
								else {
									return "Nombre cumulatif de personnes ayant reçu " + vaccineDropdownTxt.toLowerCase() + " avec un vaccin contre la COVID-19";
								}
							}
						}
					}
					else {
						if (typeDropdownVal == "_administered" || typeDropdownVal == "_distributed") {
							if (language == "en") {
								return "Daily number of COVID-19 vaccine doses " + typeDropdownTxt;
							}
							else {
								return "Nombre quotidien de doses de vaccin  " + typeDropdownTxt + " contre la COVID-19";
							}
						}
						else {
							if (vaccineDropdownVal == "_atleast1dose") {
								if (language == "en") {
									return "Weekly number of people who have received " + vaccineDropdownTxt.toLowerCase() + " of a COVID-19 vaccine";
								}
								else {
									return "Nombre hebdomadaire de personnes ayant reçu " + vaccineDropdownTxt.toLowerCase() + " d'un vaccin contre la COVID-19";
								}
							}
							else {
								if (language == "en") {
									return "Weekly number of people " + vaccineDropdownTxt.toLowerCase() + " with a COVID-19 vaccine";
								}
								else {
									return "Nombre hebdomadaire de personnes " + vaccineDropdownTxt.toLowerCase() + " avec un vaccin contre la COVID-19";
								}
							}
						}
					}
				}
				else {
					if (numPropDropdownVal2 != "propweekdelta") {
						if (vaccineDropdownVal == "_atleast1dose") {
							if (language == "en") {
								return "Cumulative percent of the population who have received " + vaccineDropdownTxt.toLowerCase() + " of a COVID-19 vaccine";
							}
							else {
								return "Pourcentage cumulatif de la population ayant reçu " + vaccineDropdownTxt.toLowerCase() + " d'un vaccin contre la COVID-19";
							}
						}
						else {
							if (language == "en") {
								return "Cumulative percent of the population " + vaccineDropdownTxt.toLowerCase() + " with a COVID-19 vaccine";
							}
							else {
								return "Pourcentage cumulatif de la population " + vaccineDropdownTxt.toLowerCase() + " avec un vaccin contre la COVID-19";
							}
						}
					}
					else {
						if (language == "en") {
							return "Weekly percent of the population who have received " + vaccineDropdownTxt.toLowerCase() + " of a COVID-19 vaccine";
						}
						else {
							return "Pourcentage hebdomadaire de la population ayant reçu " + vaccineDropdownTxt.toLowerCase() + " d'un vaccin contre la COVID-19";
						}

					}
				}
			}).call(wrap, 275)

		var numTotal;
		var numPercentTotal;
		if (mapData.get(currentIDMap)) {
			numPercentTotal = mapData.get(currentIDMap).get(currentDate)[0][vaccineDropdowns];
			if (numPercentTotal == "") {
				if (language == "en") {
					numPercentTotal = "not available";
				}
				else {
					numPercentTotal = "non disponible";
				}
			}
			d3.selectAll(".currentNumberPercent").html(function() {
				if (mapData.get(currentIDMap).get(currentDate)[0][vaccineDropdowns] == "") {
					return numPercentTotal;
				}
				else {
					return generateTxt(numPercentTotal, numPropDropdownVal);
				}
			});
		}

		d3.selectAll(".map-ddl-3-txt").text(function(d) {
			return typeDropdownTxt;
		})

		let ddl1mapTxt;
		if (numPropDropdownVal == "num") {
			if (language == "en") {
				ddl1mapTxt = "people";
			}
			else {
				ddl1mapTxt = "personnes";
			}
		}
		else {
			if (language == "en") {
				ddl1mapTxt = "the population";
			}
			else {
				ddl1mapTxt = "la population";
			}
		}
		d3.selectAll(".ddl1mapTxt").text(ddl1mapTxt);
		// 		let timeDataMax = [];
		// 		timeData2.forEach(function(d) {
		// 			if (d.key != 1) {
		// 				return d.values.forEach(function(e) {
		// 					timeDataMax.push(e.values[0][typeCases]);
		// 				});
		// 			}
		// 		});
		// 		//scale = roundup(d3.max(timeDataMax));



		// 		createTable();
		if (typeDropdownVal == "_distributed") {
			var parseTimeAdmin = d3.timeParse("%Y-%m-%d %H:%M");
			d3.selectAll(".updateDateAdminDistData").text(function() {
				if (language == "en") {
					formatTimeAdmin = d3.timeFormat("%B %-d, %Y, %-I %p EST");
					return formatTimeAdmin(parseTimeAdmin(updateDateDist2)).replace("PM", "pm").replace("AM", "am");
				}
				else {
					formatTimeAdmin = d3.timeFormat("%-d %B %Y, %-H h (Heure de l'Est)");
					return formatTimeAdmin(parseTimeAdmin(updateDateDist2));
				}
			});
		} else if (typeDropdownVal == "_administered") {
			var parseTimeAdmin = d3.timeParse("%Y-%m-%d %H:%M");
			d3.selectAll(".updateDateAdminDistData").text(function() {
				if (language == "en") {
					formatTimeAdmin = d3.timeFormat("%B %-d, %Y, %-I %p EST");
					return formatTimeAdmin(parseTimeAdmin(updateDateAdmin2)).replace("PM", "pm").replace("AM", "am");
				}
				else {
					formatTimeAdmin = d3.timeFormat("%-d %B %Y, %-H h (Heure de l'Est)");
					return formatTimeAdmin(parseTimeAdmin(updateDateAdmin2));
				}
			});
		}
		if (typeDropdownVal == "_administered") {
			var parseTimeAdmin = d3.timeParse("%Y-%m-%d %H:%M");
			d3.selectAll(".updateDateAdminDist").text(function() {
				if (language == "en") {
					return d3.timeFormat("%B %e, %Y")(parseTime(asofdate_numtotal_dosesadministered));
				}
				else {
					return d3.timeFormat("%d %B %Y")(parseTime(asofdate_numtotal_dosesadministered));
				}
			});
			currentRegion = dosesadministered[0].values;
			updateTrend(currentRegion);
		}
		else if (typeDropdownVal == "_distributed") {
				d3.selectAll(".updateDateAdminDist").text(function() {
					if (language == "en") {
						return d3.timeFormat("%B %e, %Y")(parseTime(asofdate_numtotal_dosesadministered));
					}
					else {
						return d3.timeFormat("%d %B %Y")(parseTime(asofdate_numtotal_dosesadministered));
					}
				});
			}
			currentRegion = d3.select("#Canada").data()[0];
			updateTrend(currentRegion.trend);
		}
	);

	function color(value) {
		if (urlProduct == "cov") {
			if (vaccineDropdownVal == "_all" || vaccineDropdownVal == "_pfizerbiontech" || vaccineDropdownVal == "_moderna") {
				if (value >= 300000) return colorScale["1"];
				else if (value >= 100000) return colorScale["2"];
				else if (value >= 10000) return colorScale["3"];
				else if (value > 0) return colorScale["4"];
				else if (value >= 0) return colorScale["5"]
				else return colorScale["No data"];
			}
			else if (vaccineDropdownVal == "_fully") {
				if (numPropDropdownVal == "num") {
					if (numPropDropdownVal2 == "numtotal") {
						if (value >= 100000) return colorScale["1"];
						else if (value >= 50000) return colorScale["2"];
						else if (value >= 30000) return colorScale["3"];
						else if (value >= 20000) return colorScale["4"];
						else if (value >= 0) return colorScale["5"]
						else return colorScale["No data"];
					}
					else {
						if (value >= 10000) return colorScale["1"];
						else if (value >= 5000) return colorScale["2"];
						else if (value >= 3000) return colorScale["3"];
						else if (value >= 1000) return colorScale["4"];
						else if (value >= 0) return colorScale["5"]
						else return colorScale["No data"];
					}
				}
				else {
					if (numPropDropdownVal2 != "propweekdelta") {
						if (value >= 50.00) return colorScale["1"];
						else if (value >= 20.00) return colorScale["2"];
						else if (value >= 10.00) return colorScale["3"];
						else if (value >= 5.00) return colorScale["4"];
						else if (value >= 0) return colorScale["5"]
						else return colorScale["No data"];
					}
					else {
						if (value >= 10.00) return colorScale["1"];
						else if (value >= 5.00) return colorScale["2"];
						else if (value >= 3.00) return colorScale["3"];
						else if (value >= 1.00) return colorScale["4"];
						else if (value >= 0) return colorScale["5"]
						else return colorScale["No data"];
					}
				}
			}
			else if (vaccineDropdownVal == "_partially") {
				if (numPropDropdownVal == "num") {
					if (numPropDropdownVal2 == "numtotal") {
						if (value >= 2000000) return colorScale["1"];
						else if (value >= 500000) return colorScale["2"];
						else if (value >= 200000) return colorScale["3"];
						else if (value >= 50000) return colorScale["4"];
						else if (value >= 0) return colorScale["5"]
						else return colorScale["No data"];
					}
					else {
						if (value >= 2000000) return colorScale["1"];
						else if (value >= 500000) return colorScale["2"];
						else if (value >= 200000) return colorScale["3"];
						else if (value >= 50000) return colorScale["4"];
						else if (value >= 0) return colorScale["5"]
						else return colorScale["No data"];
					}
				}
				else {
					if (numPropDropdownVal2 != "propweekdelta") {
						if (value >= 50.00) return colorScale["1"];
						else if (value >= 30.00) return colorScale["2"];
						else if (value >= 20.00) return colorScale["3"];
						else if (value >= 10.00) return colorScale["4"];
						else if (value >= 0) return colorScale["5"]
						else return colorScale["No data"];
					}
					else {
						if (value >= 10.00) return colorScale["1"];
						else if (value >= 5.00) return colorScale["2"];
						else if (value >= 3.00) return colorScale["3"];
						else if (value >= 1.00) return colorScale["4"];
						else if (value >= 0) return colorScale["5"]
						else return colorScale["No data"];
					}
				}
			}
			else if (vaccineDropdownVal == "_atleast1dose") {
				if (numPropDropdownVal == "num") {
					if (numPropDropdownVal2 == "numtotal") {
						if (value >= 2000000) return colorScale["1"];
						else if (value >= 1000000) return colorScale["2"];
						else if (value >= 200000) return colorScale["3"];
						else if (value >= 50000) return colorScale["4"];
						else if (value >= 0) return colorScale["5"]
						else return colorScale["No data"];
					}
					else {
						if (value >= 2000000) return colorScale["1"];
						else if (value >= 1000000) return colorScale["2"];
						else if (value >= 200000) return colorScale["3"];
						else if (value >= 50000) return colorScale["4"];
						else if (value >= 0) return colorScale["5"]
						else return colorScale["No data"];
					}
				}
				else {
					if (numPropDropdownVal2 != "propweekdelta") {
						if (value >= 50.00) return colorScale["1"];
						else if (value >= 40.00) return colorScale["2"];
						else if (value >= 30.00) return colorScale["3"];
						else if (value >= 20.00) return colorScale["4"];
						else if (value >= 0) return colorScale["5"]
						else return colorScale["No data"];
					}
					else {
						if (value >= 10.00) return colorScale["1"];
						else if (value >= 5.00) return colorScale["2"];
						else if (value >= 3.00) return colorScale["3"];
						else if (value >= 1.00) return colorScale["4"];
						else if (value >= 0) return colorScale["5"]
						else return colorScale["No data"];
					}
				}
			}
		}
		else {
			if (value >= 1000000) return colorScale["1"];
			else if (value >= 500000) return colorScale["2"];
			else if (value >= 100000) return colorScale["3"];
			else if (value > 50000) return colorScale["4"];
			else if (value >= 0) return colorScale["5"]
			else return colorScale["No data"];
		}
	}

	function updateLegendText(d, i) {
		if (urlProduct == "cov") {
			if (vaccineDropdownVal == "_all" || vaccineDropdownVal == "_pfizerbiontech" || vaccineDropdownVal == "_moderna") {
				if (language == "en") {
					if (i == 0) {
						return "300,000 and higher";
					}
					else if (i == 1) {
						return "100,000 to 299,999";
					}
					else if (i == 2) {
						return "10,000 to 99,999";
					}
					else if (i == 3) {
						return "1 to 9,999";
					}
					else if (i == 4) {
						return "0";
					}
					else {
						return "Not available";
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
						return "10 000 à 99 999";
					}
					else if (i == 3) {
						return "1 à 9 999";
					}
					else if (i == 4) {
						return "0";
					}
					else {
						return "Non disponible";
					}
				}
			}
			else if (vaccineDropdownVal == "_fully") {
				if (numPropDropdownVal == "num") {
					if (language == "en") {
						if (i == 0) {
							return "100,000 and higher";
						}
						else if (i == 1) {
							return "50,000 to 99,999";
						}
						else if (i == 2) {
							return "30,000 to 49,999";
						}
						else if (i == 3) {
							return "20,000 to 29,999";
						}
						else if (i == 4) {
							return "0 to 19,999";
						}
						else {
							return "Not available";
						}
					}
					else {
						if (i == 0) {
							return "100 000 et plus";
						}
						else if (i == 1) {
							return "50 000 à 99 999";
						}
						else if (i == 2) {
							return "30 000 à 49 999";
						}
						else if (i == 3) {
							return "20 000 à 29 999";
						}
						else if (i == 4) {
							return "0 à 19 999";
						}
						else {
							return "Non disponible";
						}
					}
				}
				else {
					if (language == "en") {
						if (i == 0) {
							return "50.0% and higher";
						}
						else if (i == 1) {
							return "20.0% to 49.99%";
						}
						else if (i == 2) {
							return "10.0% to 19.99%";
						}
						else if (i == 3) {
							return "5.0% to 9.99%";
						}
						else if (i == 4) {
							return "0% to 4.99%";
						}
						else {
							return "Not available";
						}
					}
					else {
						if (i == 0) {
							return "10,0 % et plus";
						}
						else if (i == 1) {
							return "5,00 % à 9,99 %";
						}
						else if (i == 2) {
							return "1,00 % à 4,99 %";
						}
						else if (i == 3) {
							return "0,01 % à 0,99 %";
						}
						else if (i == 4) {
							return "0 %";
						}
						else {
							return "Non disponible";
						}
					}
				}
			}
			else if (vaccineDropdownVal == "_partially") {
				if (numPropDropdownVal == "num") {
					if (language == "en") {
						if (i == 0) {
							return "2,000,000 and higher";
						}
						else if (i == 1) {
							return "500,000 to 1,999,999";
						}
						else if (i == 2) {
							return "200,000 to 499,999";
						}
						else if (i == 3) {
							return "50,000 to 199,999";
						}
						else if (i == 4) {
							return "0 to 49,999";
						}
						else {
							return "Not available";
						}
					}
					else {
						if (i == 0) {
							return "2 000 000 et plus";
						}
						else if (i == 1) {
							return "500 000 à 1 999 999";
						}
						else if (i == 2) {
							return "200 000 à 499 999";
						}
						else if (i == 3) {
							return "50 000 à 199 999";
						}
						else if (i == 4) {
							return "0 à 49 999";
						}
						else {
							return "Non disponible";
						}
					}
				}
				else {
					if (language == "en") {
						if (i == 0) {
							return "50.0% and higher";
						}
						else if (i == 1) {
							return "30.0% to 49.99%";
						}
						else if (i == 2) {
							return "20.0% to 29.99%";
						}
						else if (i == 3) {
							return "10.0% to 19.99%";
						}
						else if (i == 4) {
							return "0% to 9.99%";
						}
						else {
							return "Not available";
						}
					}
					else {
						if (i == 0) {
							return "50,0 % et plus";
						}
						else if (i == 1) {
							return "30,0 % à 49,99 %";
						}
						else if (i == 2) {
							return "20,0 % à 29,99 %";
						}
						else if (i == 3) {
							return "10,0 % à 19,99 %";
						}
						else if (i == 4) {
							return "0 % à 9.99 %";
						}
						else {
							return "Non disponible";
						}
					}
				}
			}
			else if (vaccineDropdownVal == "_atleast1dose") {
				if (numPropDropdownVal == "num") {
					if (language == "en") {
						if (i == 0) {
							return "2,000,000 and higher";
						}
						else if (i == 1) {
							return "1,000,000 to 1,999,999";
						}
						else if (i == 2) {
							return "200,000 to 999,999";
						}
						else if (i == 3) {
							return "50,000 to 199,999";
						}
						else if (i == 4) {
							return "0 to 49,999";
						}
						else {
							return "Not available";
						}
					}
					else {
						if (i == 0) {
							return "2 000 000 et plus";
						}
						else if (i == 1) {
							return "1 000 000 à 1 999 999";
						}
						else if (i == 2) {
							return "200 000 à 999 999";
						}
						else if (i == 3) {
							return "50 000 à 199 999";
						}
						else if (i == 4) {
							return "0 à 49 999";
						}
						else {
							return "Non disponible";
						}
					}
				}
				else {
					if (language == "en") {
						if (i == 0) {
							return "50.0% and higher";
						}
						else if (i == 1) {
							return "40.0% to 49.99%";
						}
						else if (i == 2) {
							return "30.0% to 39.99%";
						}
						else if (i == 3) {
							return "20.0% to 29.99%";
						}
						else if (i == 4) {
							return "0% to 19.99%";
						}
						else {
							return "Not available";
						}
					}
					else {
						if (i == 0) {
							return "50,0 % et plus";
						}
						else if (i == 1) {
							return "40,0 % à 49,99 %";
						}
						else if (i == 2) {
							return "30,0 % à 39,99 %";
						}
						else if (i == 3) {
							return "20,0 % à 29,99 %";
						}
						else if (i == 4) {
							return "0 % à 19.99 %";
						}
						else {
							return "Non disponible";
						}
					}
				}
			}
		}
		else {
			if (language == "en") {
				if (i == 0) {
					return "1,000,000 and higher";
				}
				else if (i == 1) {
					return "500,000 to 999,999";
				}
				else if (i == 2) {
					return "100,000 to 499,999";
				}
				else if (i == 3) {
					return "50,000 to 99,999";
				}
				else if (i == 4) {
					return "0 to 49,999";
				}
				else {
					return "Not available";
				}
			}
			else {
				if (i == 0) {
					return "1 000 000 et plus";
				}
				else if (i == 1) {
					return "500 000 à 999 999";
				}
				else if (i == 2) {
					return "100 000 à 499 999";
				}
				else if (i == 3) {
					return "50 000 à 99 999";
				}
				else if (i == 4) {
					return "0 à 49 999";
				}
				else {
					return "Non disponible";
				}
			}
		}
	}

	function drawLegend(timeData) {
		var target = svg;
		// typeCases = $('#dropdownType3').val()+$('#dropdownType1').val();

		d3.selectAll('.legend').remove();

		var gap = 5;
		var squareSize = 13;
		var topMargin = 5;
		target.append('g')
			.attr('class', 'legend')
			.attr('id', 'legend')
			.attr("transform", "translate(-95,80)")
			.selectAll('g.categoryLegend')
			.data(Object.keys(colorScale))
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
				return colorScale[d];
			})
			.attr("stroke", "#828080");

		d3.select("#legendTitle1").remove()

		d3.select("#legend")
			.append("text")
			.attr("x", 535)
			.attr("font-size", "15px")
			.attr("font-weight", "bold")
			.attr("id", "legendTitle1")
			.attr("y", function(d) {
				if (language == "fr" && numPropDropdownVal == "prop") {
					return topMargin - 45;
				}
				else {
					return topMargin - 30;
				}
			})
			.text(function() {
				if (numPropDropdownVal == "num") {
					if (numPropDropdownVal2 == "numtotal") {
						if (typeDropdownVal == "_administered" || typeDropdownVal == "_distributed") {
							if (language == "en") {
								return "Cumulative number of COVID-19 vaccine doses " + typeDropdownTxt;
							}
							else {
								return "Nombre cumulatif de doses de vaccin  " + typeDropdownTxt + " contre la COVID-19";
							}
						}
						else {
							if (vaccineDropdownVal == "_atleast1dose") {
								if (language == "en") {
									return "Cumulative number of people who have received " + vaccineDropdownTxt.toLowerCase() + " of a COVID-19 vaccine";
								}
								else {
									return "Nombre cumulatif de personnes ayant reçu " + vaccineDropdownTxt.toLowerCase() + " d'un vaccin contre la COVID-19";
								}
							}
							else {
								if (language == "en") {
									return "Cumulative number of people " + vaccineDropdownTxt.toLowerCase() + " with a COVID-19 vaccine";
								}
								else {
									return "Nombre cumulatif de personnes ayant reçu " + vaccineDropdownTxt.toLowerCase() + " avec un vaccin contre la COVID-19";
								}
							}
						}
					}
					else {
						if (typeDropdownVal == "_administered" || typeDropdownVal == "_distributed") {
							if (language == "en") {
								return "Daily number of COVID-19 vaccine doses " + typeDropdownTxt;
							}
							else {
								return "Nombre quotidien de doses de vaccin  " + typeDropdownTxt + " contre la COVID-19";
							}
						}
						else {
							if (vaccineDropdownVal == "_atleast1dose") {
								if (language == "en") {
									return "Weekly number of people who have received " + vaccineDropdownTxt.toLowerCase() + " of a COVID-19 vaccine";
								}
								else {
									return "Nombre hebdomadaire de personnes ayant reçu " + vaccineDropdownTxt.toLowerCase() + " d'un vaccin contre la COVID-19";
								}
							}
							else {
								if (language == "en") {
									return "Weekly number of people " + vaccineDropdownTxt.toLowerCase() + " with a COVID-19 vaccine";
								}
								else {
									return "Nombre hebdomadaire de personnes " + vaccineDropdownTxt.toLowerCase() + " avec un vaccin contre la COVID-19";
								}
							}
						}
					}
				}
				else {
					if (numPropDropdownVal2 != "propweekdelta") {
						if (vaccineDropdownVal == "_atleast1dose") {
							if (language == "en") {
								return "Cumulative percent of the population who have received " + vaccineDropdownTxt.toLowerCase() + " of a COVID-19 vaccine";
							}
							else {
								return "Pourcentage cumulatif de la population ayant reçu " + vaccineDropdownTxt.toLowerCase() + " d'un vaccin contre la COVID-19";
							}
						}
						else {
							if (language == "en") {
								return "Cumulative percent of the population " + vaccineDropdownTxt.toLowerCase() + " with a COVID-19 vaccine";
							}
							else {
								return "Pourcentage cumulatif de la population " + vaccineDropdownTxt.toLowerCase() + " avec un vaccin contre la COVID-19";
							}
						}
					}
					else {
						if (language == "en") {
							return "Weekly percent of the population who have received " + vaccineDropdownTxt.toLowerCase() + " of a COVID-19 vaccine";
						}
						else {
							return "Pourcentage hebdomadaire de la population ayant reçu " + vaccineDropdownTxt.toLowerCase() + " d'un vaccin contre la COVID-19";
						}

					}
				}
			}).call(wrap, 275)

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

	}

	let currentID;

	function drawTrend(filter) {
		var dataTrend;
		var trendPosition;
		var label;

		if (currentRegion.pruid) {
			currentID = currentRegion.pruid;
		}
		else if (currentRegion.properties) {
			currentID = currentRegion.properties.PRUID;
		}
		else {
			currentID = filter[filter.length - 1].values[0].pruid;
		}

		let max;
		if (typeDropdownVal == "_administered") {
			if (filter) {
				max = +filter[filter.length - 1].values[0][vaccineDropdowns];
			}
			else {
				max = d3.max(dosesadministered, function(d) {
					if (d.key == currentID) {
						return d3.max(d.values, function(_d) {
							return Number(_d.values[0][vaccineDropdowns]);
						})
					}
				})
			}
		}
		else if (typeDropdownVal == "_distributed") {
			if (filter) {
				max = +filter[filter.length - 1].values[0][vaccineDropdowns];
			}
			else {
				max = d3.max(dataDistributed3, function(d) {
					if (d.key == currentID) {
						return d3.max(d.values, function(_d) {
							return Number(_d.values[0][vaccineDropdowns]);
						})
					}
				})
			}
		}
		else {
			if (currentID == 1 && numPropDropdownVal == "num") {
				max = d3.max(timeData, function(d) {
					if (d.key == "1") {
						return d3.max(d.values[0].values, function(_d) {
							return Number(_d[vaccineDropdowns]);
						})
					}
				})
			}
			else if (currentID != 1 && numPropDropdownVal == "num") {
				max = d3.max(timeData, function(d) {
					if (d.key != "1") {
						return d3.max(d.values[0].values, function(_d) {
							return Number(_d[vaccineDropdowns]);
						})
					}
				})
			}
			else {
				max = d3.max(timeData, function(d) {
					return d3.max(d.values[0].values, function(_d) {
						return Number(_d[vaccineDropdowns]);
					})
				})
			}
		}

		if (typeDropdownVal == "_administered") {
			dataTrend = d3.entries(dosesadministered2[currentID]);
			if (dataTrend.length > 0) {
				if (dosesadministered2[currentID][currentDate]) {
					txtTotal = +dosesadministered2[currentID][currentDate][0][vaccineDropdowns];
				}
				else {
					txtTotal = 0;
				}
			}
			else {
				let errText = d3.select("#trendData g").append("g")
					.attr("id", "errTextGraph")
					.append("text")
					.attr("text-anchor", "middle")
					.attr("font-size", "15px")
					.attr("font-weight", "bold")
					.attr("x", widthSideGraph / 2)
					.attr("y", heightSideGraph / 2)
					.text(function() {
						if (language == "en") {
							return "Data not available";
						}
						else {
							return "Données non disponibles";
						}

					})
					.style("opacity", 0)
					.transition().duration(500).style("opacity", 1)

				if (language == "en") {
					txtTotal = "not available";
				}
				else {
					txtTotal = "non disponible";
				}
			}

		}
		else if (typeDropdownVal == "_distributed") {
			dataTrend = d3.entries(dataDistributed2[currentID]);
			if (dataTrend.length > 0) {
				if (dataDistributed2[currentID][currentDate]) {
					txtTotal = +dataDistributed2[currentID][currentDate][0][vaccineDropdowns];
				}
				else {
					txtTotal = 0;
				}
			}
			else {
				let errText = d3.select("#trendData g").append("g")
					.attr("id", "errTextGraph")
					.append("text")
					.attr("text-anchor", "middle")
					.attr("font-size", "15px")
					.attr("font-weight", "bold")
					.attr("x", widthSideGraph / 2)
					.attr("y", heightSideGraph / 2)
					.text(function() {
						if (language == "en") {
							return "Data not available";
						}
						else {
							return "Données non disponibles";
						}

					})
					.style("opacity", 0)
					.transition().duration(500).style("opacity", 1)

				if (language == "en") {
					txtTotal = "not available";
				}
				else {
					txtTotal = "non disponible";
				}
			}
		}
		else {
			dataTrend = d3.entries(timeData2[currentID]);
			if (dataTrend.length > 0) {
				if (timeData2[currentID][currentDate]) {
					txtTotal = timeData2[currentID][currentDate][0][vaccineDropdowns];
				}
				else {
					txtTotal = 0;
				}
			}
			else {
				let errText = d3.select("#trendData g").append("g")
					.attr("id", "errTextGraph")
					.append("text")
					.attr("text-anchor", "middle")
					.attr("font-size", "15px")
					.attr("font-weight", "bold")
					.attr("x", widthSideGraph / 2)
					.attr("y", heightSideGraph / 2)
					.text(function() {
						if (language == "en") {
							return "Data not available";
						}
						else {
							return "Données non disponibles";
						}

					})
					.style("opacity", 0)
					.transition().duration(500).style("opacity", 1)

				if (language == "en") {
					txtTotal = "not available";
				}
				else {
					txtTotal = "non disponible";
				}
			}
		}

		var svg = d3.select("#trendData")
			.attr("height", function(d) {
				if (isIE) {
					return heightSideGraph + marginSideGraph.top + marginSideGraph.bottom
				}
			})
			.append("g")
			.attr("transform", "translate(" + marginSideGraph.left + "," + marginSideGraph.top + ")");

		let maxPow = Math.floor(Math.log10(max));
		let max2;
		if (max != 0) {
			max2 = Math.ceil(max / Math.pow(10, maxPow)) * Math.pow(10, maxPow);
		}
		else {
			max2 = 0;
		}
		let xTickLength;
		if (dataTrend.length > 0 && max > 0) {
			if (typeDropdownVal == "_administered") {
				xSideGraph.domain(datesArrayAdmin2);
				xTickLength = datesArrayAdmin.length;
			}
			else {
				xSideGraph.domain(datesArrayDist2);
				xTickLength = datesArray.length;
			}
			ySideGraph.domain([0, max2]);
		}
		else {
			if (typeDropdownVal == "_administered") {
				xSideGraph.domain(datesArrayAdmin2);
				xTickLength = datesArrayAdmin.length;
			}
			else {
				xSideGraph.domain(datesArrayDist2);
				xTickLength = datesArray.length;
			}
			ySideGraph.domain([0, 10]);
		}
		// ySideGraph.domain([0, d3.max(dataTrend, function(d) { return d.value[0][vaccineDropdowns]; })]);

		updateGraph(dataTrend);

		// Add the X Axis
		let xTickLengthOE = xTickLength % 2;
		svg.append("g")
			.attr("id", "trendX")
			.attr("transform", "translate(0," + (heightSideGraph) + ")")
			.transition()
			.duration(500)
			.call(d3.axisBottom(xSideGraph).ticks(xTickLength).tickFormat(d3.timeFormat("%d %b %Y")))
			.selectAll("text")
			.attr("y", 10)
			.attr("x", -28)
			.attr("dy", ".35em")
			.attr("transform", "rotate(-38)");

		if (dataTrend.length > 6) {
			let currentDateDate = new Date(parseTime(currentDate)).getDay();
			d3.select("#trendX").selectAll(".tick")
				.each(function(d, i) {
					if (typeDropdownVal == "_administered") {
						if (i % 7 == xTickLengthOE) {}
						else {
							d3.select(this).remove();
						}
					}
					else {
						if (i % 2 == xTickLengthOE) {
							d3.select(this).remove();
						}
					}
				});
		}

		if (numPropDropdownVal == "num") {
			svg.append("g")
				.attr("id", "trendY")
				.transition()
				.duration(500)
				.call(d3.axisLeft(ySideGraph).ticks(null, "s"))
		}
		else {
			svg.append("g")
				.attr("id", "trendY")
				.transition()
				.duration(500)
				.call(d3.axisLeft(ySideGraph).ticks(6))
				.selectAll("text")
				.text(function(tick) {
					if (language == "en") {
						return tick + "%";
					}
					else {
						return tick + " %";
					}
				})
		}

		svg.append("text")
			.attr("class", "titleTrendLabel")
			.attr("transform", "translate(" + widthSideGraph / 2 + "," + (-10) + ")")
			.attr("font-size", "16px")
			.attr("text-anchor", "middle")
			.attr("font-weight", "bold")
			.text("Canada");

		svg.append("text")
			.attr("class", "xAxisTrendLabel")
			.attr("transform", "translate(" + widthSideGraph / 2 + "," + (heightSideGraph + 65) + ")")
			.attr("font-size", "14px")
			.attr("text-anchor", "middle")
			.text(function() {
				if (language == "en") {
					if (typeDropdownVal == "_administered") {
						return "Report date";
					}
					else {
						return "Report week";
					}
				}
				else {
					if (typeDropdownVal == "_administered") {
						return "Date de mise à jour";
					}
					else {
						return "Semaine de rapport";
					}
				}
			})

		svg.append("text")
			.attr("class", "yAxisTrendLabel")
			.attr("transform", "translate(-43," + ((heightSideGraph / 2) + 13) + ")rotate(-90)")
			.attr("font-size", "12px")
			.attr("text-anchor", "middle")
			.text(function() {
				if (language == "en") {
					if (numPropDropdownVal == "num") {
						if (typeDropdownVal == "_administered" || typeDropdownVal == "_distributed") {
							return "Number of doses"
						}
						else {
							return "Number of people vaccinated"; // + vaccineDropdownTxt;
						}
					}
					else {
						return "Percent of people vaccinated"; // + vaccineDropdownTxt;
					}

				}
				else {
					if (numPropDropdownVal == "num") {
						if (typeDropdownVal == "_administered" || typeDropdownVal == "_distributed") {
							return "Nombre de doses"
						}
						else {
							return "Nombre de personnes vaccinées"; // + vaccineDropdownTxt;
						}
					}
					else {
						return "Pourcentage de personnes vaccinées"; // + vaccineDropdownTxt;
					}
				}
			})
		// .call(wrapVert,200)

		//Add Current Date Highlighter
		// svg.append("g")
		// 	.attr("id", "trendHighlight")
		// 	.append("rect")
		// 	.attr("height", heightSideGraph)
		// 	.attr("width", "10px")
		// 	.attr("fill", "lightgrey")
		// 	.attr("transform", function(d) {
		// 		return "translate(" + (xSideGraph(parseTime(currentDate)) - 5) + ",0)";
		// 	})
		// 	.attr("opacity", 0.8);

		// d3.select("#trendHighlight").lower();
	}

	function updateTrend(filter) {
		var dataTrend;
		// typeCases = $('#dropdownType3').val() + $('#dropdownType1').val();
		// txtTypeCases = $('#dropdownType1 option:selected').text();

		if (currentRegion.pruid) {
			currentID = currentRegion.pruid;
		}
		else if (currentRegion.properties) {
			currentID = currentRegion.properties.PRUID;
		}
		else {
			currentID = filter[filter.length - 1].values[0].pruid;
		}

		let max;
		if (typeDropdownVal == "_administered") {
			if (filter) {
				max = +filter[filter.length - 1].values[0][vaccineDropdowns];
			}
			else {
				max = d3.max(dosesadministered, function(d) {
					if (d.key == currentID) {
						return d3.max(d.values, function(_d) {
							return Number(_d.values[0][vaccineDropdowns]);
						})
					}
				})
			}
		}
		else if (typeDropdownVal == "_distributed") {
			if (filter) {
				max = +filter[filter.length - 1].values[0][vaccineDropdowns];
			}
			else {
				max = d3.max(dataDistributed3, function(d) {
					if (d.key == currentID) {
						return d3.max(d.values, function(_d) {
							return Number(_d.values[0][vaccineDropdowns]);
						})
					}
				})
			}
		}
		else {
			if (currentID == 1 && numPropDropdownVal == "num") {
				max = d3.max(timeData, function(d) {
					if (d.key == "1") {
						return d3.max(d.values[0].values, function(_d) {
							return Number(_d[vaccineDropdowns]);
						})
					}
				})
			}
			else if (currentID != 1 && numPropDropdownVal == "num") {
				max = d3.max(timeData, function(d) {
					if (d.key == currentID) {
						return d3.max(d.values[0].values, function(_d) {
							return Number(_d[vaccineDropdowns]);
						})
					}
				})
			}
			else {
				max = d3.max(timeData, function(d) {
					if (d.key == currentID) {
						return d3.max(d.values[0].values, function(_d) {
							return Number(_d[vaccineDropdowns]);
						})
					}
				})
			}
		}
		let maxPow = Math.floor(Math.log10(max));
		let max2;
		if (max != 0) {
			max2 = Math.ceil(max / Math.pow(10, maxPow)) * Math.pow(10, maxPow);
		}
		else {
			max2 = 0;
		}

		if (d3.select("#trendData g>#errTextGraph").node()) {
			d3.select("#trendData g>#errTextGraph").remove();
		}

		if (currentID == "24" && urlProduct == "cov" && vaccineDropdownVal == "_fully") {
			let errText = d3.select("#trendData g").append("g")
				.attr("id", "errTextGraph")
				.append("text")
				.attr("text-anchor", "middle")
				.attr("font-size", "15px")
				.attr("font-weight", "bold")
				.attr("x", widthSideGraph / 2)
				.attr("y", heightSideGraph / 2)
				.text(function() {
					if (language == "en") {
						return "Data Not Available";
					}
					else {
						return "Données non disponibles";
					}

				})
				.style("opacity", 0)
				.transition().duration(500).style("opacity", 1)
		}

		if (filter) {
			dataTrend = d3.entries(filter);
			var txtTotal;
			if (typeDropdownVal == "_administered") {
				if (filter[filter.length - 1].values[0].pruid == "1") {
					dataTrend = dosesadministered[0].values;
				}
				else {
					dataTrend = dosesadministered[dosesadministered.length - 1].values;
				}
				txtTotal = +filter[filter.length - 1].values[0][vaccineDropdowns];
			}
			else {
				if (timeData[currentID][currentDate]) {
					txtTotal = timeData[currentID][currentDate][0][vaccineDropdowns];
				}
				else {
					txtTotal = 0;
				}
			}
			d3.select("#txtTotal").html(function() {
				return generateTxt(txtTotal, "num");
			});

			if (language == "en") {
				d3.select(".titleTrendLabel").text(currentRegion.prename);
			}
			else {
				d3.select(".titleTrendLabel").text(currentRegion.prfname);
			}
		}
		else {
			if (typeDropdownVal == "_administered") {
				dataTrend = d3.entries(dosesadministered2[currentID]);
				if (dataTrend.length > 0) {
					if (dosesadministered2[currentID][currentDate]) {
						txtTotal = +dosesadministered2[currentID][currentDate][0][vaccineDropdowns];
					}
					else {
						txtTotal = 0;
					}
				}
				else {
					let errText = d3.select("#trendData g").append("g")
						.attr("id", "errTextGraph")
						.append("text")
						.attr("text-anchor", "middle")
						.attr("font-size", "15px")
						.attr("font-weight", "bold")
						.attr("x", widthSideGraph / 2)
						.attr("y", heightSideGraph / 2)
						.text(function() {
							if (language == "en") {
								return "Data not available";
							}
							else {
								return "Données non disponibles";
							}

						})
						.style("opacity", 0)
						.transition().duration(500).style("opacity", 1)

					if (language == "en") {
						txtTotal = "not available";
					}
					else {
						txtTotal = "non disponible";
					}
				}
			}
			else if (typeDropdownVal == "_distributed") {
				dataTrend = d3.entries(dataDistributed2[currentID]);
				if (dataTrend.length > 0) {
					if (dataDistributed2[currentID][currentDate]) {
						txtTotal = +dataDistributed2[currentID][currentDate][0][vaccineDropdowns];
					}
					else {
						txtTotal = 0;
					}
				}
				else {
					let errText = d3.select("#trendData g").append("g")
						.attr("id", "errTextGraph")
						.append("text")
						.attr("text-anchor", "middle")
						.attr("font-size", "15px")
						.attr("font-weight", "bold")
						.attr("x", widthSideGraph / 2)
						.attr("y", heightSideGraph / 2)
						.text(function() {
							if (language == "en") {
								return "Data not available";
							}
							else {
								return "Données non disponibles";
							}

						})
						.style("opacity", 0)
						.transition().duration(500).style("opacity", 1)

					if (language == "en") {
						txtTotal = "not available";
					}
					else {
						txtTotal = "non disponible";
					}
				}
			}
			else {
				dataTrend = d3.entries(timeData2[currentID]);
				if (dataTrend.length > 0) {
					if (timeData2[currentID][currentDate] && timeData2[currentID][currentDate][0][vaccineDropdowns] != "") {
						txtTotal = timeData2[currentID][currentDate][0][vaccineDropdowns];
					}
					else {
						txtTotal = txtTotal;
					}
				}
				else {
					let errText = d3.select("#trendData g").append("g")
						.attr("id", "errTextGraph")
						.append("text")
						.attr("text-anchor", "middle")
						.attr("font-size", "15px")
						.attr("font-weight", "bold")
						.attr("x", widthSideGraph / 2)
						.attr("y", heightSideGraph / 2)
						.text(function() {
							if (language == "en") {
								return "Data not available";
							}
							else {
								return "Données non disponibles";
							}

						})
						.style("opacity", 0)
						.transition().duration(500).style("opacity", 1)

					if (language == "en") {
						txtTotal = "not available";
					}
					else {
						txtTotal = "non disponible";
					}
				}
			}
			// d3.selectAll(".currentNumberPercent").html(function() {
			// 	if(dataTrend.length > 0){
			// 		return generateTxt(txtTotal,numPropDropdownVal);
			// 	}else{
			// 		return txtTotal;
			// 	}
			// if (language == "en") {
			// 	if(currentRegion.properties.PRUID == "60" && typeCases == "numrecover")
			// 		return d3.format(",d")(txtTotal) + "*";
			// 	/* if(currentRegion.properties.PRUID == "24" && typeCases == "numtested")
			// 		return d3.format(",d")(txtTotal) + "*"; */
			// 	return d3.format(",d")(txtTotal);
			// }
			// else {
			// 	if(currentRegion.properties.PRUID == "60" && typeCases == "numrecover")
			// 		return d3.format(",d")(txtTotal) + "*";
			// 	/* if(currentRegion.properties.PRUID == "24" && typeCases == "numtested")
			// 		return (d3.format(",d")(txtTotal)).replace(",", " ") + "*"; */
			// 	return (d3.format(",d")(txtTotal)).replace(",", " ");
			// }
			// });

			d3.selectAll(".currentNumberPercentPost").html(function() {
				if (numPropDropdownVal == "num") {
					if (language == "en") {
						return "";
					}
					else {
						return "personnes";
					}
				}
				else {
					if (language == "en") {
						return "";
					}
					else {
						if (dataTrend.length > 0) {
							return "de la population";
						}
						else {
							return "";
						}
					}
				}
			})
		}

		if (filter) {
			if (typeDropdownVal == "_administered") {
				if (filter[filter.length - 1].values[0].pruid == "1") {
					d3.select(".titleTrendLabel").text(pruid2prov("1"));
				}
				else {
					d3.select(".titleTrendLabel").text(pruid2prov("99"));
				}
			}
			else {
				d3.select(".titleTrendLabel").text(pruid2prov(currentID));
			}
		}
		else {
			d3.select(".titleTrendLabel").text(pruid2prov(currentID));
		}

		//check and if necessary, fill missing days with empty data
		datesArray.forEach(function(value, index) {
			if (dataTrend.filter(function(el) { return el.key == value; }).length == 0) {
				dataTrend.splice(index, 0, { key: value, values: [] });
			}
		})
		let xTickLength;
		if (dataTrend.length > 0 && max > 0) {
			if (typeDropdownVal == "_administered") {
				xSideGraph.domain(datesArrayAdmin2);
				xTickLength = datesArrayAdmin.length;
			}
			else if (typeDropdownVal == "_distributed") {
				xSideGraph.domain(datesArrayDist2);
				xTickLength = datesArrayDist.length;
			}
			else {
				xSideGraph.domain(datesArray);
				xTickLength = datesArray.length;
			}
			ySideGraph.domain([0, max2]);
		}
		else {
			if (typeDropdownVal == "_administered") {
				xSideGraph.domain(datesArrayAdmin2);
				xTickLength = datesArrayAdmin.length;
				if (datesArrayAdmin.length >= 8) {
					xTickLength = 5;
				}
			}
			else if (typeDropdownVal == "_distributed") {
				xSideGraph.domain(datesArrayDist);
				xTickLength = datesArrayDist.length;
				if (datesArrayDist.length >= 8) {
					xTickLength = 5;
				}
			}
			else {
				xSideGraph.domain(datesArray);
				xTickLength = datesArray.length;
			}
			ySideGraph.domain([0, 5]);
		}
		// ySideGraph.domain([0, d3.max(dataTrend, function(d) { return d.value[0][vaccineDropdowns]; })]);

		//Transition the X Axis
		xTickLengthOE = xTickLength % 2;
		d3.select("#trendX")
			.transition()
			.duration(500)
			.call(d3.axisBottom(xSideGraph).ticks(10).tickFormat(d3.timeFormat("%d %b %Y")))
			.selectAll("text")
			.attr("y", 10)
			.attr("x", -28)
			.attr("dy", ".35em")
			.attr("transform", "rotate(-38)");

		if (dataTrend.length > 6) {
			let currentDateDate = new Date(parseTime(currentDate)).getDay();
			d3.select("#trendX").selectAll(".tick")
				.each(function(d, i) {
					if (typeDropdownVal == "_administered" || typeDropdownVal == "_distributed") {
						if (i % 7 == xTickLengthOE) {}
						else {
							d3.select(this).remove();
						}
					}
					else {
						if (i % 2 == xTickLengthOE) {
							d3.select(this).remove();
						}
					}
				});
		}

		//Transition the Y Axis
		// Add the Y Axis
		if (numPropDropdownVal == "num") {
			d3.select("#trendY")
				.transition()
				.duration(500)
				.call(d3.axisLeft(ySideGraph).ticks(null, "s"))
		}
		else {
			d3.select("#trendY")
				.transition()
				.duration(500)
				.call(d3.axisLeft(ySideGraph).ticks(5))
				.selectAll("text")
				.text(function(tick) {
					if (language == "en") {
						return tick + "%";
					}
					else {
						return tick + " %";
					}
				})
		}

		d3.selectAll(".xAxisTrendLabel").text(function(d) {
			if (language == "en") {
				if (typeDropdownVal == "_administered" || typeDropdownVal == "_distributed") {
					return "Report date";
				}
				else {
					return "Report week";
				}
			}
			else {
				if (typeDropdownVal == "_administered" || typeDropdownVal == "_distributed") {
					return "Date de mise à jour";
				}
				else {
					return "Semaine de rapport";
				}
			}
		})

		d3.selectAll(".yAxisTrendLabel").text(function(d) {
			if (language == "en") {
				if (numPropDropdownVal == "num") {
					if (typeDropdownVal == "_administered" || typeDropdownVal == "_distributed") {
						return "Number of doses " + typeDropdownTxt;
					}
					else {
						return "Number of people vaccinated"; // + vaccineDropdownTxt;
					}
				}
				else {
					return "Percent of people vaccinated"; // + vaccineDropdownTxt;
				}

			}
			else {
				if (numPropDropdownVal == "num") {
					if (typeDropdownVal == "_administered" || typeDropdownVal == "_distributed") {
						return "Nombre de doses " + typeDropdownTxt;
					}
					else {
						return "Nombre de personnes vaccinées"; // + vaccineDropdownTxt;
					}
				}
				else {
					return "Pourcentage de personnes vaccinées"; // + vaccineDropdownTxt;
				}
			}
			// if (language == "en") {
			// 	return "Number of " + vaccineDropdownTxt;
			// }
			// else {
			// 	return "Nombre de personnes " + vaccineDropdownTxt.toLowerCase();
			// }
		})

		updateGraph(dataTrend);

		//Transition the Date Highlighter
		// d3.select("#trendHighlight rect")
		// 	.transition()
		// 	.duration(600)
		// 	.attr("transform", function(d) {
		// 		if (x(parseTime(currentDate)) < 0) {
		// 			d3.select(this).style("display", "none");
		// 			return "translate(-5,0)";
		// 		}
		// 		else {
		// 			d3.select(this).style("display", "block");
		// 			return "translate(" + (x(parseTime(currentDate)) - 5) + ",0)";

		// 		}
		// 	})
	}

	function updateGraph(data) {

		d3.select("#trendData g").selectAll(".sideChartBars")
			.data(data)
			.join(
				function(enter) {
					enter.append("rect")
						.attr("class", "sideChartBars")
						.attr("x", function(d, i) { return xSideGraph(parseTime(d.key)); })
						.attr("y", function(d, i) {
							if (d.values) {
								if (d.values.length > 0) {
									return ySideGraph(+d.values[0][vaccineDropdowns]);
								}
								else {
									return ySideGraph(0);
								}
							}
							else if (d.value) {
								if (d.value.length > 0) {
									return ySideGraph(+d.value[0][vaccineDropdowns]);
								}
								else {
									return ySideGraph(0);
								}
							}
						})
						.attr("height", function(d, i) {
							if (d.values) {
								if (d.values.length > 0) {
									return heightSideGraph - ySideGraph(+d.values[0][vaccineDropdowns]);
								}
								else {
									return heightSideGraph - ySideGraph(0);
								}
							}
							else if (d.value) {
								if (d.value.length > 0) {
									return heightSideGraph - ySideGraph(+d.value[0][vaccineDropdowns]);
								}
								else {
									return heightSideGraph - ySideGraph(0);
								}
							}
						})
						.attr("width", function(d, i) {
							// if(xSideGraph.bandwidth() > 32){
							// 	return 32;
							// }else{
							return xSideGraph.bandwidth();
							// }
						})
						.attr("fill", function(d) {
							if (typeDropdownVal == "_administered") {
								if (checkDate(d.key, currentID, "graph")) {
									if (d.values) {
										if (d.values.length > 0) {
											return color(d.values[0][vaccineDropdowns]);
										}
										else {
											return color(-1);
										}
									}
									else if (d.value) {
										if (d.value.length > 0) {
											return color(d.value[0][vaccineDropdowns]);
										}
										else {
											return color(-1);
										}
									}
								}
								else {
									return color(-1);
								}
							}
							else {
								if (d.values) {
									if (d.values.length > 0) {
										return color(d.values[0][vaccineDropdowns]);
									}
									else {
										return color(-1);
									}
								}
								else if (d.value) {
									if (d.value.length > 0) {
										return color(d.value[0][vaccineDropdowns]);
									}
									else {
										return color(-1);
									}
								}
							}
						})
						.attr("stroke", function(d) {
							if (typeDropdownVal == "_administered") {
								return "";
							}
							else {
								return "#828080";
							}
						})
						.append("title")
						.text(function(d, i) {
							if (d.values) {
								if (d.values.length > 0) {
									return pruid2prov(d.values[0].pruid) + " (" + formatTime(parseTime(d.key)) + "): " + generateTxt(d.values[0][vaccineDropdowns], numPropDropdownVal);
								}
								else {
									return pruid2prov(d.values[0].pruid) + " (" + formatTime(parseTime(d.key)) + "): " + generateTxt(0, numPropDropdownVal);
								}
							}
							else if (d.value) {
								if (d.value.length > 0) {
									return pruid2prov(d.value[0].pruid) + " (" + formatTime(parseTime(d.key)) + "): " + generateTxt(d.value[0][vaccineDropdowns], numPropDropdownVal);
								}
								else {
									return pruid2prov(d.value[0].pruid) + " (" + formatTime(parseTime(d.key)) + "): " + generateTxt(0, numPropDropdownVal);
								}
							}
						});
				},
				function(update) {
					update.selectAll("title").remove();
					update.transition().duration(500)
						.attr("x", function(d, i) { return xSideGraph(parseTime(d.key)); })
						.attr("y", function(d, i) {
							if (d.values) {
								if (d.values.length > 0) {
									return ySideGraph(d.values[0][vaccineDropdowns]);
								}
								else {
									return ySideGraph(0);
								}
							}
							else if (d.value) {
								if (d.value.length > 0) {
									if (d.value[0][vaccineDropdowns] == "na") {
										return ySideGraph(0);
									}
									else {
										return ySideGraph(d.value[0][vaccineDropdowns]);
									}
								}
								else {
									return ySideGraph(0);
								}
							}
						})
						.attr("height", function(d, i) {
							if (d.values) {
								if (d.values.length > 0) {
									return heightSideGraph - ySideGraph(d.values[0][vaccineDropdowns]);
								}
								else {
									return heightSideGraph - ySideGraph(0);
								}
							}
							else if (d.value) {
								if (d.value.length > 0) {
									if (d.value[0][vaccineDropdowns] == "na") {
										return heightSideGraph - ySideGraph(0);
									}
									else {
										return heightSideGraph - ySideGraph(d.value[0][vaccineDropdowns]);
									}
								}
								else {
									return heightSideGraph - ySideGraph(0);
								}
							}
						})
						.attr("width", xSideGraph.bandwidth())
						.attr("fill", function(d) {
							if (typeDropdownVal == "_administered") {
								if (checkDate(d.key, currentID, "graph")) {
									if (d.values) {
										if (d.values.length > 0) {
											return color(d.values[0][vaccineDropdowns]);
										}
										else {
											return color(-1);
										}
									}
									else if (d.value) {
										if (d.value.length > 0) {
											return color(d.value[0][vaccineDropdowns]);
										}
										else {
											return color(-1);
										}
									}
								}
								else {
									return color(-1);
								}
							}
							else {
								if (d.values) {
									if (d.values.length > 0) {
										return color(d.values[0][vaccineDropdowns]);
									}
									else {
										return color(-1);
									}
								}
								else if (d.value) {
									if (d.value.length > 0) {
										return color(d.value[0][vaccineDropdowns]);
									}
									else {
										return color(-1);
									}
								}
							}
						})
						.attr("stroke", function(d) {
							if (typeDropdownVal == "_administered") {
								return "";
							}
							else {
								return "#828080";
							}
						})

					update.append("title")
						.text(function(d, i) {
							if (d.values) {
								if (d.values.length > 0) {
									return pruid2prov(d.values[0].pruid) + " (" + formatTime(parseTime(d.key)) + "): " + generateTxt(d.values[0][vaccineDropdowns], numPropDropdownVal);
								}
							}
							else if (d.value) {
								if (d.value.length > 0) {
									return pruid2prov(d.value[0].pruid) + " (" + formatTime(parseTime(d.key)) + "): " + generateTxt(d.value[0][vaccineDropdowns], numPropDropdownVal);
								}
								else {
									return pruid2prov(d.value[0].pruid) + " (" + formatTime(parseTime(d.key)) + "): " + generateTxt(0, numPropDropdownVal);
								}
							}
						});
				},
				function(exit) {
					exit.transition().duration(50)
						.transition()
						.duration(500)
						.attr("y", function(d, i) { return ySideGraph(0); })
						.attr("height", function(d) { return heightSideGraph - ySideGraph(0); })
				}
			)
	}

	function checkDate(date, pruid, mapOrGraph) {
		if (urlProduct == "cov") {
			if (timeData3.get(pruid).get(date)) {
				return true;
			}
			else {
				return false;
			}
		}
		else {
			if (mapOrGraph == "graph") {
				if (typeDropdownVal == "_distributed") {
					if (mapDataDist.get(pruid).get(date)) {
						// if(mapDataDist.get(pruid).get(date)[0]["updated"] == "1"){
						return true;
						// }else{
						// 		return false;
						// 	}
					}
					else {
						return false;
					}
				}
				else {
					if (dosesadministered3.get(pruid).get(date)) {
						if (dosesadministered3.get(pruid).get(date)[0]["updated"] == "1") {
							return true;
						}
						else {
							return false;
						}
					}
					else {
						return false;
					}
				}
			}
			else {
				if (typeDropdownVal == "_distributed") {
					if (mapDataDist.get(pruid).get(date)) {
						// if(dosesadministered3.get(pruid).get(date)[0]["updated"] == "1"){
						return true;
						// }else{
						// 	return false;
						// }
					}
					else {
						return false;
					}
				}
				else {
					if (dosesadministered3.get(pruid).get(date)) {
						// if(dosesadministered3.get(pruid).get(date)[0]["updated"] == "1"){
						return true;
						// }else{
						// 	return false;
						// }
					}
					else {
						return false;
					}
				}
			}
		}
	}
}

//Build Figure 4. Key populations - Line Graph
function draw_fig_keyPops(_option, _vaxStat, _update) {
	let clickedKeypop = [];

	var trendLineDimKP = {
		height: 550,
		width: 1140,
		margin: {
			top: 20,
			bottom: 140,
			left: 150,
			right: 50
		}
	};

	var legendDim = {
		sqr: 20,
		x: (trendLineDimKP.margin.left + 50),
		y: (trendLineDimKP.margin.top + 0),
		padding: 5,
		textPadding: 10
	};

	let keyPops = [];
	keyPop_nestedData.forEach(function(d) {
		keyPops.push(d.key); // "a 5", "b 7", "c 9"
	});

	let y_domainMax;

	if (clickedKeypop.length < 1) {
		y_domainMax = d3.max(keyPop_nestedData, function(d) {
			return d3.max(d.values, function(d) {
				if (Number(d[_option + "_" + _vaxStat]) == 0) {
					return 5;
				}
				else {
					return Number(d[_option + "_" + _vaxStat]);
				}
			})
		})
	}
	else {
		y_domainMax = d3.max(keyPop_nestedData.filter(function(d) {
			return clickedKeypop.indexOf(d.key) < 0;
		}), function(d) {
			return d3.max(d.values, function(d) {
				if (Number(d[_option + "_" + _vaxStat]) == 0) {
					return 5;
				}
				else {
					return Number(d[_option + "_" + _vaxStat]);
				}
			})
		})
	}

	// let y_domainMax = d3.max(keyPop_nestedData,function(d){
	//     return d3.max(d.values,function(d){
	//     	if(Number(d[_option+"_"+_vaxStat])==0){
	//     		return 5;
	//     	}else{
	//     		return Number(d[_option+"_"+_vaxStat]);	
	//     	}
	//     })
	// })

	let y_domainMaxPow = Math.floor(Math.log10(y_domainMax));
	let y_domainMax2;
	if (y_domainMax != 0) {
		y_domainMax2 = Math.ceil(y_domainMax / Math.pow(10, y_domainMaxPow)) * Math.pow(10, y_domainMaxPow);
	}
	else {
		y_domainMax2 = 0;
	}

	let dateLength = keyPop_nestedData[0].values.length;
	let x = d3.scaleTime().domain([keyPop_nestedData[0].values[0].date, keyPop_nestedData[0].values[dateLength - 1].date])
		.range([trendLineDimKP.margin.left, trendLineDimKP.width - trendLineDimKP.margin.right]) //.nice(dateLength);

	let y = d3.scaleLinear().domain([0, y_domainMax2])
		.range([(trendLineDimKP.height) - (trendLineDimKP.margin.bottom), (trendLineDimKP.margin.top)]);

	if (_vaxStat == "atleast1dose") {
		if (language == "en") {
			d3.selectAll(".fig4-ddl-txt1").style("display", "");
			d3.selectAll(".fig4-ddl-txt2").text("of");
		}
		else {
			d3.selectAll(".fig4-ddl-txt1").style("display", "");
			d3.selectAll(".fig4-ddl-txt2").text("d'");
		}
	}
	else {
		if (language == "en") {
			d3.selectAll(".fig4-ddl-txt1").style("display", "none");
			d3.selectAll(".fig4-ddl-txt2").text("with");
		}
		else {
			d3.selectAll(".fig4-ddl-txt1").style("display", "none");
			d3.selectAll(".fig4-ddl-txt2").text("avec ");
		}
	}

	// var parseTime = d3.timeParse("%Y-%m-%d");
	// var formatTime = d3.timeFormat("%b %d '%y");

	var pathGen = d3.line()
		.x(function(d) {
			return x(d.date);
		})
		.y(function(d) {
			return y(Number(d[_option + "_" + _vaxStat]));
		});

	//UPDATE
	if (_update) {

		keyPop_nestedData.forEach(function(value, index) {
			d3.select("#trendLineSVG #" + (value.key).replace(/[^A-Z0-9]/ig, "") + "-path")
				.data([value.values])
				.transition()
				.duration(700)
				.attrTween("d", function(d) {
					let prev = d3.select(this).attr("d");
					let curr = pathGen(d);
					return d3.interpolatePath(prev, curr);
				});

			d3.select("#trendLineSVG #" + (value.key).replace(/[^A-Z0-9]/ig, "") + "-path").style("opacity", function(d, i) {
				if (clickedKeypop.indexOf(keyPop_nestedData[i].values.key) < 0) {
					d3.select("#trendLineSVGLegend").selectAll(".trendLineSVGLegendItem-" + (i + 1)).style("opacity", 1);
					return 1;
				}
				else {
					d3.select("#trendLineSVGLegend").selectAll(".trendLineSVGLegendItem-" + (i + 1)).style("opacity", 0.3);
					return 0;
				}
			})
		});

		d3.select("#yAxis").transition().duration(500).call(d3.axisLeft(y).ticks(5).tickFormat(
			function(d, i) {
				if (_option == "prop" || _option == "propweekdelta") {
					return generateTxt(d, "prop", 0);
				}
				else if (_option == "numtotal") {
					return numberFormat(d);
				}
			}));

		d3.select("#fig4_yAxisLabel")
			.text(function(d, i) {
				if (language == "en") {
					if (_option == "numtotal") {
						return "Cumulative number of people vaccinated";
					}
					else {
						return "Cumulative percent of people vaccinated";
					}
				}
				else {
					if (_option == "numtotal") {
						return "Nombre cumulatif de personnes vaccinées";
					}
					else {
						return "Pourcentage cumulatif de personnes vaccinées";
					}
				}
			})

		//Hover situation on update
		let _hoverLine = d3.select("#trendLineSVG_hoverLine");
		let _hoverCircles = d3.select("#trendLineSVGLegend").selectAll("circle");
		let legend = d3.select("#trendLineSVGLegend");

		d3.select("#trendLineSVG_hoverSpace")
			.on("mouseover", function() {
				_hoverLine.style("opacity", 1);
			})
			.on("mousemove", function() {
				let xStep = d3.select(this).attr("width") / (datesArray2.length - 1);
				let mouseRelative = (d3.mouse(this)[0] - trendLineDimKP.margin.left);
				let dateIndex = Math.round((mouseRelative / xStep));
				let hoveringDate = datesArray2[dateIndex];
				let hoveringX = x(hoveringDate);

				_hoverLine.attr("x1", hoveringX)
					.attr("x2", hoveringX);

				_hoverCircles.attr("cx", hoveringX)
					.attr("cy", function(d, i) {
						if ((keyPop_nestedData[i].values.length == datesArray2.length) && (clickedKeypop.indexOf(keyPops) < 0)) {
							d3.select(this).style("opacity", 1);
							return y(Number(keyPop_nestedData[i].values[dateIndex][_option + "_" + _vaxStat]));
						}
						else {
							for (let z = 0; z < keyPop_nestedData[0].values.length; z++) {
								if ((keyPop_nestedData[i].values.length[z].key == d3.timeFormat("%Y-%m-%d")(hoveringDate)) && (clickedKeypop.indexOf(keyPops) < 0)) {
									d3.select(this).style("opacity", 1);
									return y(Number(keyPop_nestedData[i].values[dateIndex][_option + "_" + _vaxStat]));
								}
							}
							d3.select(this).style("opacity", 0);
							return trendLineDimKP.margin.top;
						}
					});

				legend.selectAll("text")
					.select("tspan")
					.text(function(d, i) {
						if (keyPop_nestedData[i].values.length == datesArray2.length) {
							return ": " + generateTxt(keyPop_nestedData[i].values[dateIndex][_option + "_" + _vaxStat], _option)
						}
						else {
							for (let z = 0; z < keyPop_nestedData[i].values.length; z++) {
								if (keyPop_nestedData[i].values[dateIndex].key == d3.timeFormat("%Y-%m-%d")(hoveringDate)) {
									return ": " + generateTxt(keyPop_nestedData[i].values[z][_option + "_" + _vaxStat], _option)
								}
							}
							return ": " + generateTxt("");
						}
					})
			})
			.on("mouseout", function() {
				_hoverLine.style("opacity", 0);
				_hoverCircles.style("opacity", 0);
				legend.selectAll("text").select("tspan").text("")
			});

		return 0;
	}

	//Draw
	let svg = d3.select("#fig4Trend").append("svg")
		.attr("width", "100%")
		.attr("height", function(d) {
			if (isIE) {
				return trendLineDimKP.height;
			}
		})
		.attr("perserveAspectRatio", "xMinyMin meet")
		.attr("viewBox", "0 0 " + trendLineDimKP.width + " " + trendLineDimKP.height + "")
		.attr("id", "trendLineSVG");

	let legend = svg.append("g").attr("id", "trendLineSVGLegend");

	//Paths
	keyPop_nestedData.forEach(function(value, index) {
		svg.append("g")
			.attr("id", function() {
				return (value.key).replace(/[^A-Z0-9]/ig, "");
			})
			.append("path")
			.attr("id", function() {
				return (value.key).replace(/[^A-Z0-9]/ig, "") + "-path";
			})
			.data([value.values])
			.attr("d", function(d, i) {
				return pathGen(d);
			})
			.attr("fill", "none")
			.attr("stroke", function(d, i) {
				return greens3[index];
			})
			.attr("stroke-width", 7)
			.attr("stroke-linejoin", "round")

		legend.append("rect")
			.attr("x", legendDim.x)
			.attr("y", function() {
				return (legendDim.y + (index * (legendDim.padding + legendDim.sqr)));
			})
			.attr("width", legendDim.sqr)
			.attr("height", legendDim.sqr)
			//.attr("stroke", "#bfbfbf")
			.attr("class", "trendLineSVGLegendItem-" + index)
			.attr("fill", function() {
				return greens3[index];
			})
			.on("mouseup", function(d, i) {
				if (clickedKeypop.indexOf(value.key) < 0) {
					clickedKeypop.push(value.key);
					if (clickedKeypop.length == keyPops.length) {
						clickedKeypop = [];
						d3.select("#trendLineSVGLegend").selectAll("rect").style("opacity", 1);
						d3.select("#trendLineSVGLegend").selectAll("text").style("opacity", 1);
						rescaleChart();
						d3.select("#trendLineSVG>#pathGroup").selectAll("path").transition().delay(750).duration(300).style("opacity", 1);
					}
					else {
						d3.select("#trendLineSVGLegend").selectAll(".trendLineSVGLegendItem-" + index).style("opacity", 0.3);
						d3.select("#" + (value.key).replace(/[^A-Z0-9]/ig, "") + "-path").transition().duration(300).style("opacity", 0);
						setTimeout(function() { rescaleChart(); }, 350);
					}
				}
				else {
					clickedKeypop.splice(clickedKeypop.indexOf(value.key), 1);
					d3.select("#trendLineSVGLegend").selectAll(".trendLineSVGLegendItem-" + index).style("opacity", 1);
					rescaleChart();
					d3.select("#" + (value.key).replace(/[^A-Z0-9]/ig, "") + "-path").transition().delay(350).duration(300).style("opacity", 1);
				}

				//rescaleChart();
			})
			.style("opacity", function() {
				if (clickedKeypop.indexOf(value.key) < 0) {
					return 1;
				}
				else {
					return 0.3;
				}
			})
			.style("cursor", "pointer")

		legend.append("text")
			.attr("x", function() {
				return legendDim.x + legendDim.sqr + legendDim.textPadding;
			})
			.attr("y", function() {
				return (legendDim.y + legendDim.sqr + (index * (legendDim.padding + legendDim.sqr)));
			})
			.attr("class", "trendLineSVGLegendItem-" + index)
			.attr("text-anchor", "start")
			.attr("font-size", "16px")
			.attr("font-weight", "bold")
			.text(function() {
				return short2txt(value.key);
			})
			.on("mouseup", function(d, i) {
				if (clickedKeypop.indexOf(value.key) < 0) {
					clickedKeypop.push(value.key);
					if (clickedKeypop.length == keyPops.length) {
						clickedKeypop = [];
						d3.select("#trendLineSVGLegend").selectAll("rect").style("opacity", 1);
						d3.select("#trendLineSVGLegend").selectAll("text").style("opacity", 1);
						rescaleChart();
						d3.select("#trendLineSVG>#pathGroup").selectAll("path").transition().delay(750).duration(300).style("opacity", 1);
					}
					else {
						d3.select("#trendLineSVGLegend").selectAll(".trendLineSVGLegendItem-" + index).style("opacity", 0.3);
						d3.select("#" + (value.key).replace(/[^A-Z0-9]/ig, "") + "-path").transition().duration(300).style("opacity", 0);
						setTimeout(function() { rescaleChart(); }, 350);
					}
				}
				else {
					clickedKeypop.splice(clickedKeypop.indexOf(value.key), 1);
					d3.select("#trendLineSVGLegend").selectAll(".trendLineSVGLegendItem-" + index).style("opacity", 1);
					rescaleChart();
					d3.select("#" + (value.key).replace(/[^A-Z0-9]/ig, "") + "-path").transition().delay(350).duration(300).style("opacity", 1);
				}

				//rescaleChart();
			})
			.style("opacity", function() {
				if (clickedKeypop.indexOf(value.key) < 0) {
					return 1;
				}
				else {
					return 0.3;
				}
			})
			.style("cursor", "pointer")
			//tspan for hover...
			.append("tspan")
			.data([{ key: value.key, index: index }])
			.attr("dx", 0)
			.attr("dy", 0)
	})

	let axis = svg.append("g")
		.attr("id", "fig4_axisG");

	axis.append("g")
		.attr("transform", "translate(" + trendLineDimKP.margin.left + ",0)")
		.call(d3.axisLeft(y).ticks(5).tickFormat(
			function(d, i) {
				if (_option == "prop" || _option == "propweekdelta") {
					return generateTxt(d, "prop", 0);
				}
				else if (_option == "numtotal") {
					return numberFormat(d);
				}
			}))
		// .selectAll("text")
		.attr("class", "axisTextLablez")
		.attr("font-size", "16px")
		.attr("id", "yAxis");

	axis.append("g")
		//.attr("id","y")
		.attr("transform", "translate(0," + (trendLineDimKP.height - trendLineDimKP.margin.bottom) + ")")
		.call(d3.axisBottom(x).tickValues(datesArray2).tickFormat(d3.timeFormat("%d %b %Y")))
		.attr("id", "xAxis")
		.selectAll("text")
		.attr("class", "axisTextLablez")
		.attr("transform", "rotate(-45)")
		.attr("y", "0")
		.attr("dy", "1em")
		.attr("font-size", "13px")
		.attr("x", "-6")
		.style("text-anchor", "end")
	//<text fill="currentColor" y="0" dy=".71em" x="-6" transform="rotate(-45)" style="text-anchor: end;">Jan 30 '21</text>

	axis.append("text")
		// .attr("font-size","13px")
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle")
		.attr("y", function() {
			// return chartDim.margin.left/2;
			return trendLineDimKP.margin.left / 3;
		})
		.attr("x", function(d, i) {
			return 0;
		})
		.attr("transform", function() {
			return "translate(" + -2 + "," + ((trendLineDimKP.height / 2) - 5) + ")rotate(-90)";
		})
		.append("tspan")
		.attr("font-size", "20px")
		.attr("id", "fig4_yAxisLabel")
		.text(function(d, i) {
			if (language == "en") {
				if (_option == "numtotal") {
					return "Cumulative number of people vaccinated";
				}
				else {
					return "Cumulative percent of people vaccinated";
				}
			}
			else {
				if (_option == "numtotal") {
					return "Nombre cumulatif de personnes vaccinées";
				}
				else {
					return "Pourcentage cumulatif de personnes vaccinées";
				}
			}
		})

	axis.append("text")
		.attr("font-size", "16px")
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle")
		.attr("y", function() {
			return -5;
		})
		.attr("x", function(d, i) {
			return 0;
		})
		.attr("transform", function() {
			return "translate(" +
				(trendLineDimKP.width / 2) +
				"," + trendLineDimKP.height + ")";
		})
		.append("tspan")
		.attr("id", "fig4_xAxisLabel")
		.text(function(d, i) {
			if (language == "en") {
				return "Report week";
			}
			else {
				return "Semaine de rapport";
			}
		})

	//Hover Situation ...
	let hoverGroup = d3.select("#trendLineSVGLegend");

	let hoverSpace = hoverGroup.append("rect")
		.attr("width", (trendLineDimKP.width - trendLineDimKP.margin.right - trendLineDimKP.margin.left))
		.attr("height", (trendLineDimKP.height - trendLineDimKP.margin.bottom - trendLineDimKP.margin.top))
		.attr("x", trendLineDimKP.margin.left)
		.attr("y", trendLineDimKP.margin.top)
		.style("opacity", 0)
		.attr("id", "trendLineSVG_hoverSpace")
		.on("mouseover", function() {
			_hoverLine.style("opacity", 1);
		})
		.on("mousemove", function() {
			let xStep = d3.select(this).attr("width") / (datesArray2.length - 1);
			let mouseRelative = (d3.mouse(this)[0] - trendLineDimKP.margin.left);
			let dateIndex = Math.round((mouseRelative / xStep));
			let hoveringDate = datesArray2[dateIndex];
			let hoveringX = x(hoveringDate);

			_hoverLine.attr("x1", hoveringX)
				.attr("x2", hoveringX);

			_hoverCircles.attr("cx", hoveringX)
				.attr("cy", function(d, i) {

					if ((keyPop_nestedData[i].values.length == datesArray2.length) && (clickedKeypop.indexOf(keyPops) < 0)) {
						d3.select(this).style("opacity", 1);
						return y(Number(keyPop_nestedData[i].values[dateIndex][_option + "_" + _vaxStat]));
					}
					else {
						for (let z = 0; z < keyPop_nestedData[0].values.length; z++) {
							if ((keyPop_nestedData[i].values.length[z].key == d3.timeFormat("%Y-%m-%d")(hoveringDate)) && (clickedKeypop.indexOf(keyPops) < 0)) {
								d3.select(this).style("opacity", 1);
								return y(Number(keyPop_nestedData[i].values[dateIndex][_option + "_" + _vaxStat]));
							}
						}

						d3.select(this).style("opacity", 0);
						return trendLineDimKP.margin.top;

					}

				});

			// legend.selectAll("rect")
			// 		.attr("x",function(){
			// 			if(hoveringX > (trendLineDimKP.width*0.75)){
			// 				return (trendLineDimKP.width*0.73);
			// 			}else{
			// 				return hoveringX + 10;
			// 			}
			// 		})

			legend.selectAll("text")
				// .attr("x",function(){
				// 	if(hoveringX > (trendLineDimKP.width*0.75)){
				// 		return (trendLineDimKP.width*0.73)+ legendDim.sqr+ legendDim.textPadding;
				// 	}else{
				// 		return (hoveringX  + 10 + legendDim.sqr+ legendDim.textPadding);
				// 	}
				// })
				.select("tspan")
				.text(function(d, i) {
					if (keyPop_nestedData[i].values.length == datesArray2.length) {
						return ": " + generateTxt(keyPop_nestedData[i].values[dateIndex][_option + "_" + _vaxStat], _option)
					}
					else {
						for (let z = 0; z < keyPop_nestedData[i].values.length; z++) {
							if (keyPop_nestedData[i].values[dateIndex].key == d3.timeFormat("%Y-%m-%d")(hoveringDate)) {
								return ": " + generateTxt(keyPop_nestedData[i].values[z][_option + "_" + _vaxStat], _option)
							}
						}
						return ": " + generateTxt("");
					}
				})

		})
		.on("mouseout", function() {
			_hoverLine.style("opacity", 0);
			_hoverCircles.style("opacity", 0);
			legend.selectAll("text").select("tspan").text("")
		});

	let _hoverLine = hoverGroup.insert("line", "rect")
		.attr("id", "trendLineSVG_hoverLine")
		.attr("x1", 100)
		.attr("y1", trendLineDimKP.margin.top)
		.attr("x2", 100)
		.attr("y2", (trendLineDimKP.height - trendLineDimKP.margin.bottom))
		.style("stroke-width", 2)
		.style("stroke", "#aaaaaa")
		.style("fill", "none")
		.style("opacity", 0);

	let _hoverCircles = hoverGroup.insert("g", "rect")
		.selectAll("circle")
		.data(keyPops)
		.enter()
		.append("circle")
		// .style("stroke",)
		.style("fill", function(d, i) {
			return greens3[i];
		})
		.attr("class", "hoverCirlesKP")
		.attr("id", function(d, i) {
			return "hoverCirleKP-" + (i + 1);
		})
		.attr("r", 7)
		.attr("cx", function(d, i) {
			return 50 + (i * 10)
		})
		.attr("cy", function(d, i) {
			return 50 + (i * 10)
		})
		.style("opacity", 0);

	return 0;
}

//Build Figure 5. Vaccination coverage by age, sex, and province/territory - Stacked Bar
function draw_fig_agesex(_option, _vaxStat, pruid, _update) {

	let _vaxStatRange = _vaxStat + "range";

	//creat new
	var chartDim = {
		height: 500,
		width: 1140,
		margin: {
			top: 100,
			bottom: 60,
			left: 135,
			right: 50
		}
	};

	var legendDim = {
		sqr: 20,
		x: ((chartDim.width / 6)),
		y: ((chartDim.margin.top / 2) - (10)),
		padding: 25,
		textPadding: 10
	};

	//find current data row
	let data;
	for (let i = 0; i < nestedData_byAge.length; i++) {
		if (nestedData_byAge[i].key == pruid) {
			data = nestedData_byAge[i].values[nestedData_byAge[i].values.length - 1];
			break;
		}
		else {
			data = "";
		}
	}

	let noData = false;
	if (!data || data.values.length == 0) {
		noData = true;
	}

	//let dataMax;
	// for(let i=0; i<nestedData_byAge.length ; i++){
	//     if(nestedData_byAge[i].key == 1){
	//         dataMax = nestedData_byAge[i].values[nestedData_byAge[i].values.length-1];
	//         break;
	//     }
	// }

	let ageGroups_arr = { en: ["0-17", "18-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80+", "Unknown", "Not reported"], fr: ["0-17", "18-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80+", "Inconnu", "Non rapporté"] };
	let sexSubgroups_arr = ["f", "m", "Other", "Unknown"];


	let max;
	let foundNan = false;
	let foundNonNan = false;

	if (data) {
		max = d3.max(data.values, function(d) {

			if (d.key == "All Ages") { //EXCLUDE ALL AGES
				return 0;
			}
			else {
				return d3.max(d.values, function(_d) {
					if (isNaN(+_d.value[_option + "_" + _vaxStat]) || _d.value[_option + "_" + _vaxStat] == "") {
						foundNan = true;
						return 0;
					}
					else {
						foundNonNan = true;
					}
					return Number(_d.value[_option + "_" + _vaxStat]);
				})
			}
		})
	}
	else {
		max = 5;
	}



	if (foundNan && !foundNonNan && max == 0) {
		noData = true;
	}

	let maxPow = Math.floor(Math.log10(max));
	let max2;
	if (max != 0) {
		max2 = Math.ceil(max / Math.pow(10, maxPow)) * Math.pow(10, maxPow);
	}
	else {
		max2 = 5;
	}

	//scales
	let x = d3.scaleBand().domain(ageGroups_arr[language]).range([chartDim.margin.left, chartDim.width]).padding(0.2);
	let xSubgroup = d3.scaleBand().domain(sexSubgroups_arr).range([0, x.bandwidth()]).padding(0.05);
	let y = d3.scaleLinear().domain([0, max2]).range([(chartDim.height - chartDim.margin.bottom), chartDim.margin.top]).nice();

	d3.select("#smallNum_note").text(function() {
		if (_option == "numtotal") {
			if (language == "en") {
				return "five";
			}
			else {
				return "cinq";
			}
		}
		else {
			if (language == "en") {
				return "0.1%";
			}
			else {
				return "0.1 %";
			}
		}
	});

	if (_vaxStat == "atleast1dose") {
		if (language == "en") {
			d3.selectAll(".fig5-ddl-txt1").style("display", "");
			d3.selectAll(".fig5-ddl-txt2").text("of");
		}
		else {
			d3.selectAll(".fig5-ddl-txt1").style("display", "");
			d3.selectAll(".fig5-ddl-txt2").text("d'");
		}
	}
	else {
		if (language == "en") {
			d3.selectAll(".fig5-ddl-txt1").style("display", "none");
			d3.selectAll(".fig5-ddl-txt2").text("with");
		}
		else {
			d3.selectAll(".fig5-ddl-txt1").style("display", "none");
			d3.selectAll(".fig5-ddl-txt2").text("avec ");
		}
	}

	//IF CALL TO FUNCTION IS AN UPDATE
	if (_update) {
		if (d3.select("svg#byAgeGroup>#errText").node()) {
			d3.select("svg#byAgeGroup>#errText").remove();
		}

		d3.select("#smallNum_note").text(function() {
			if (_option == "numtotal") {
				if (language == "en") {
					return "five";
				}
				else {
					return "cinq";
				}
			}
			else {
				if (language == "en") {
					return "0.1%";
				}
				else {
					return "0,1 %";
				}
			}
		});

		d3.selectAll(".lessThan5").remove();

		if (noData) {
			let errText = d3.select("svg#byAgeGroup").append("g")
				.attr("id", "errText")
				.append("text")
				.attr("text-anchor", "middle")
				.attr("font-size", "1.5em")
				.attr("font-weight", "bold")
				.attr("x", (((chartDim.width - chartDim.margin.left - chartDim.margin.right) / 2) + chartDim.margin.left))
				.attr("y", (chartDim.height / 2))
				.text(function() {
					if (language == "en") {
						return "Data Not Available";
					}
					else {
						return "Données non disponibles"
					}
				})
				.style("opacity", 0)
				.transition().delay(600).duration(300).style("opacity", 1);

			d3.select("svg#byAgeGroup") //.selectAll("g")
				// .data(stackData)
				.selectAll("g.ageGroup>rect")
				// .data(function(d){
				//     return d;
				// })
				.transition()
				.duration(700)
				.attr("y", function(d) {
					return chartDim.height - chartDim.margin.bottom;
				})
				.attr("height", function(d) {
					return 0;
				})

			d3.select("#fig5_yAxisLabel")
				.text(function(d, i) {
					if (language == "en") {
						if (_option == "numtotal") {
							return "Cumulative number of people vaccinated";
						}
						else {
							return "Cumulative percent of people vaccinated";
						}
					}
					else {
						if (_option == "numtotal") {
							return "Nombre cumulatif de personnes vaccinées";
						}
						else {
							return "Pourcentage cumulatif  de personnes vaccinées";
						}
					}
				})
			d3.select("#fig5>svg").on("mousemove", null)
			return 0;
		}

		let _currAgeGroup;
		let _currSexGroup;
		d3.selectAll("svg#byAgeGroup>g.ageGroup").each(function(value, index) {
			_currAgeGroup = (data.values).filter(function(d, i) {
				return d.key == (ageGroups_arr.en)[index];
			})[0];

			d3.select(this).selectAll("rect").each(function(value, index2) {

				if (_currAgeGroup) {
					_currSexGroup = (_currAgeGroup.values).filter(function(d, i) {
						return d.key == sexSubgroups_arr[index2];
					})[0];
				}

				// d3.select(this).selectAll("title").transition().duration(700)
				// 	.text(function(d,i){
				// 		if(_currAgeGroup){
				// 	if(_currSexGroup){
				// 		if(isNaN(_currSexGroup.value[_option + "_" + _vaxStat])){
				// 			return short2txt(d.key)+" ("+x.domain()[index]+"): "+numberFormat(0);
				// 		}else{
				// 			let titleVal;
				// 			if(_currSexGroup.value[_option + "_" + _vaxStatRange] != "0"){
				// 				titleVal = generateTxt(_currSexGroup.value[_option + "_" + _vaxStat]) + " - " + generateTxt(_currSexGroup.value[_option + "_" + _vaxStat] + _currSexGroup.value[_option + "_" + _vaxStatRange]);
				// 			}else{
				// 				titleVal = generateTxt(_currSexGroup.value[_option + "_" + _vaxStat],_option);
				// 			}
				// 			return short2txt(d.key)+" ("+x.domain()[index]+"): "+titleVal;
				// 		}
				// 	}else{
				// 		return short2txt(d.key)+" ("+x.domain()[index]+"): "+numberFormat(0);
				// 	}
				// }else{
				// 	return short2txt(d.key)+" ("+x.domain()[index]+"): "+numberFormat(0);
				// }
				// })

				d3.select(this).transition()
					.duration(700)
					.attr("y", function(d) {
						if (_currAgeGroup) {
							if (_currSexGroup) {
								if (isNaN(_currSexGroup.value[_option + "_" + _vaxStat])) {
									if (_currSexGroup.value[_option + "_" + _vaxStat][0] == "≥")
										return y(95);
									return y(0);
								}
								else {
									return y(_currSexGroup.value[_option + "_" + _vaxStat]) - 1;
								}
							}
							else {
								return y(0);
							}
						}
						else {
							return y(0);
						}
					})
					.attr("height", function() {
						if (_currAgeGroup) {
							if (_currSexGroup) {
								if (isNaN(y(_currSexGroup.value[_option + "_" + _vaxStat]))) {
									if (_currSexGroup.value[_option + "_" + _vaxStat] == "<5" || _currSexGroup.value[_option + "_" + _vaxStat] == "<0.1") {
										d3.select(this.parentNode)
											.append("text")
											.attr("class", "lessThan5")
											.attr("text-anchor", "middle")
											.attr("font-size", "26px")
											.attr("font-weight", "bold")
											.attr("fill", function() {
												return greens4[index2]
											})
											.attr("y", (chartDim.height - chartDim.margin.bottom) - 1)
											.attr("x", function() {
												return (xSubgroup(_currSexGroup.key) + xSubgroup.bandwidth() / 2);
											})
											.text("*");
									}
									else if (_currSexGroup.value[_option + "_" + _vaxStat][0] == "≥") {
										return (chartDim.height - chartDim.margin.bottom) - y(95);
									}
									return 0;
								}
								else {
									return 1 + ((chartDim.height - chartDim.margin.bottom) - y(_currSexGroup.value[_option + "_" + _vaxStat]));
								}
							}
							else {
								return 0;
							}
						}
						else {
							return 0;
						}
					});


				d3.select(this).data(function() {
					if (_currAgeGroup) {
						if (_currSexGroup) {
							return [_currSexGroup];
						}
						else {
							return [];
						}
					}
					else {
						return [];
					}
				})

			})

		})


		d3.select("svg#byAgeGroup").select("g #fig5_y")
			.transition()
			.delay(300)
			.duration(600)
			.call(d3.axisLeft(y).ticks(5).tickFormat(function(d) {
				if (_option == "prop") {
					if (language == "en") {
						return generateTxt(d, "prop", 0);
					}
					else {
						return generateTxt(d, "prop", 0);
					}
				}
				else {
					return numberFormat(d);
				}
			}))
			.selectAll("text")
			.attr("class", "axisTextLablez")
			.attr("font-size", "16px")

		d3.select("#fig5_yAxisLabel")
			.text(function(d, i) {
				if (language == "en") {
					if (_option == "numtotal") {
						return "Cumulative number of people vaccinated";
					}
					else {
						return "Cumulative percent of people vaccinated";
					}
				}
				else {
					if (_option == "numtotal") {
						return "Nombre cumulatif de personnes vaccinées";
					}
					else {
						return "Pourcentage cumulatif  de personnes vaccinées";
					}
				}
			})

		//-------------------- Hover Function update (MZ) --------------------
		d3.select("#fig5>svg").on("mousemove", function(d, i) {
				let eachBandGroup = x.step();
				let eachBandSubG = xSubgroup.step();
				let index = Math.floor(((d3.mouse(this)[0] - chartDim.margin.left) / eachBandGroup));
				let subgroupIndex = Math.floor((((d3.mouse(this)[0] - chartDim.margin.left) % eachBandGroup) / eachBandSubG)) - 1;
				if (subgroupIndex < 0) { subgroupIndex = 0; }
				let subgroupIndex_byKey;

				if (subgroupIndex < 0) {
					subgroupIndex = 0;
				}
				if (index < 0) {
					index = 0;
				}
				else if (index > (data.values.length - 1)) {
					index = data.values.length - 1;
					subgroupIndex = sexSubgroups_arr.length - 1;
				}

				if (data.values[index].values.length < sexSubgroups_arr.length) {
					if (subgroupIndex > (data.values[index].values.length - 1)) {
						subgroupIndex = data.values[index].values.length - 1;
					}
					subgroupIndex_byKey = sexSubgroups_arr.indexOf(data.values[index].values[subgroupIndex].key);
				}
				else {
					subgroupIndex_byKey = subgroupIndex;
				}
				let y_val;
				let x_val;

				if (index < (data.values.length - 1) && data.values[index]) { //-1 FOR EXCLUDED ALL AGES
					//age group exists...
					if (subgroupIndex < data.values[index].values.length && data.values[index].values[subgroupIndex]) {
						//sex group exists...
						if (data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStat]) {
							if (isNaN(data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStat])) {
								if (data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStat][0] == "≥") {
									y_val = y(95);
								}
								else {
									y_val = y(0);
								}
							}
							else {
								y_val = y(data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStat]);
							}
							x_val = (xSubgroup.bandwidth() / 2) + (x(ageGroups_arr[language][index])) + (xSubgroup(sexSubgroups_arr[subgroupIndex_byKey]));

							let _poly = d3.select("#indicator_poly_byAgeSex");
							let _text = d3.select("#indicator_text_byAgeSex");

							_poly.style("opacity", 1)
								.attr("points", function() {
									return "" + (x_val - (xSubgroup.bandwidth() / 2)) + "," + (y_val - 20) + " " +
										(x_val) + "," + (y_val) + " " +
										(x_val + (xSubgroup.bandwidth() / 2)) + "," + (y_val - 20) + "";
								})
								.attr("fill", function() {
									return greens4[subgroupIndex_byKey];
								}).raise();

							_text.style("opacity", 1)
								.attr("x", function() {
									if (index < 2) {
										return (x_val - (xSubgroup.bandwidth() / 2));
									}
									else if (index > 4) {
										return (x_val + (xSubgroup.bandwidth() / 2));
									}
									else {
										return x_val;
									}
								})
								.attr("text-anchor", function() {
									if (index < 2) {
										return "start";
									}
									else if (index > 4) {
										return "end";
									}
									else {
										return "middle";
									}
								})
								.attr("y", (y_val - 25))
								.text(function() {
									let langSpacing = "";
									if (language == "fr") {
										langSpacing = " ";
									}
									if (data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStat]) {
										let titleVal;
										if (data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStatRange] != "" && _vaxStat != "atleast1dose") {
											let _rangeTxt = (Number(data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStat]) +
												Number(data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStatRange]));
											if (isNaN(_rangeTxt)) {
												titleVal = generateTxt("");
											}
											else {
												titleVal = generateTxt(data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStat], _option) + "-" + generateTxt(_rangeTxt, _option);
											}
										}
										else {
											titleVal = generateTxt(data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStat], _option)
										}
										if (ageGroups_arr.en[index] == "Unknown") {
											return short2txt(data.values[index].values[subgroupIndex].key) + " (" + short2txt(ageGroups_arr.en[index]) + ")" + langSpacing + ": " + titleVal;
										}
										return short2txt(data.values[index].values[subgroupIndex].key) + " (" + ageGroups_arr.en[index] + ")" + langSpacing + ": " + titleVal;
									}
									else {
										return generateTxt("");
									}
								}).raise()

						}
						else {
							//...
						}
					}
					else {
						//...
					}
				}
				else {
					//...
				}

			})
			.on("mouseleave", function(d, i) {
				d3.select("#indicator_poly_byAgeSex").transition().delay(200).duration(250).style("opacity", 0)
				d3.select("#indicator_text_byAgeSex").transition().delay(200).duration(250).style("opacity", 0)
			})
		//--------------------------------------------------------------------

		return 0;
	}

	var svg = d3.select("#fig5").append("svg")
		.attr("width", "100%")
		.attr("height", function(d) {
			if (isIE) {
				return chartDim.height;
			}
		})
		.attr("perserveAspectRatio", "xMinyMin meet")
		.attr("viewBox", "0 0 " + chartDim.width + " " + chartDim.height + "")
		.attr("id", "byAgeGroup")
		//----------------------- Hover Function (MZ) -----------------------
		.on("mousemove", function(d, i) {
			let eachBandGroup = x.step();
			let eachBandSubG = xSubgroup.step();
			let index = Math.floor(((d3.mouse(this)[0] - chartDim.margin.left) / eachBandGroup));
			let subgroupIndex = Math.floor((((d3.mouse(this)[0] - chartDim.margin.left) % eachBandGroup) / eachBandSubG)) - 1;
			let subgroupIndex_byKey;

			if (subgroupIndex < 0) {
				subgroupIndex = 0;
			}
			if (index < 0) {
				index = 0;
			}
			else if (index > (data.values.length - 1)) {
				index = data.values.length - 1;
				subgroupIndex = sexSubgroups_arr.length - 1;
			}

			if (data.values[index].values.length < sexSubgroups_arr.length) {
				if (subgroupIndex > (data.values[index].values.length - 1)) {
					subgroupIndex = data.values[index].values.length - 1;
				}
				subgroupIndex_byKey = sexSubgroups_arr.indexOf(data.values[index].values[subgroupIndex].key);
			}
			else {
				subgroupIndex_byKey = subgroupIndex;
			}

			let y_val;
			let x_val;

			if (index < (data.values.length - 1) && data.values[index]) { //-1 FOR EXCLUDED ALL AGES
				//age group exists...
				if (subgroupIndex < data.values[index].values.length && data.values[index].values[subgroupIndex]) {
					//sex group exists...
					if (data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStat]) {
						if (isNaN(data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStat])) {
							if (data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStat][0] == "≥") {
								y_val = y(95);
							}
							else {
								y_val = y(0);
							}
						}
						else {
							y_val = y(data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStat]);
						}

						// x_val = (xSubgroup.bandwidth()/2) + (x(ageGroups_arr[language][index])) + (xSubgroup(sexSubgroups_arr[subgroupIndex]));
						x_val = (xSubgroup.bandwidth() / 2) + (x(ageGroups_arr[language][index])) + (xSubgroup(sexSubgroups_arr[subgroupIndex_byKey]));

						indicator_poly.style("opacity", 1)
							.attr("points", function() {
								return "" + (x_val - (xSubgroup.bandwidth() / 2)) + "," + (y_val - 20) + " " +
									(x_val) + "," + (y_val) + " " +
									(x_val + (xSubgroup.bandwidth() / 2)) + "," + (y_val - 20) + "";
							})
							.attr("fill", function() {
								return greens4[subgroupIndex_byKey];
							}).raise();

						indicator_text.style("opacity", 1)
							.attr("x", function() {
								if (index < 2) {
									return (x_val - (xSubgroup.bandwidth() / 2));
								}
								else if (index > 4) {
									return (x_val + (xSubgroup.bandwidth() / 2));
								}
								else {
									return x_val;
								}
							})
							.attr("text-anchor", function() {
								if (index < 2) {
									return "start";
								}
								else if (index > 4) {
									return "end";
								}
								else {
									return "middle";
								}
							})
							.attr("y", (y_val - 25))
							.text(function() {
								let langSpacing = "";
								if (language == "fr") {
									langSpacing = " ";
								}
								if (data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStat]) {
									let titleVal;
									if (data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStatRange] != "0" && _vaxStat != "atleast1dose") {
										let _rangeTxt = (Number(data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStat]) +
											Number(data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStatRange]));
										if (isNaN(_rangeTxt)) {
											titleVal = generateTxt("");
										}
										else {
											titleVal = generateTxt(data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStat], _option) + "-" + generateTxt(_rangeTxt, _option);
										}
									}
									else {
										titleVal = generateTxt(data.values[index].values[subgroupIndex].value[_option + "_" + _vaxStat], _option)
									}
									if (ageGroups_arr.en[index] == "Unknown") {
										return short2txt(data.values[index].values[subgroupIndex].key) + " (" + short2txt(ageGroups_arr.en[index]) + ")" + langSpacing + ": " + titleVal;
									}
									return short2txt(data.values[index].values[subgroupIndex].key) + " (" + ageGroups_arr.en[index] + ")" + langSpacing + ": " + titleVal;
								}
								else {
									return generateTxt("");
								}
							}).raise()

					}
					else {}
				}
				else {}
			}
			else {}

		})
		.on("mouseleave", function(d, i) {
			indicator_poly.transition().delay(200).duration(250).style("opacity", 0)
			indicator_text.transition().delay(200).duration(250).style("opacity", 0)
		})

	let indicator_poly = svg.insert("polygon", "g")
		.attr("id", "indicator_poly_byAgeSex")
		.attr("points", function() {
			return "" + 0 + "," + 0 + " " +
				(xSubgroup.bandwidth() / 2) + "," + 20 + " " +
				xSubgroup.bandwidth() + "," + 0 + "";
		})
		.style("opacity", 0);

	let indicator_text = svg.insert("text", "g")
		.attr("text-anchor", "start")
		.attr("id", "indicator_text_byAgeSex")
		.attr("font-size", "16px")
		.attr("font-weight", "bold")
		.style("opacity", 0);
	//-------------------------------------------------------------------

	let _currAgeGroup;
	let _currSexGroup;
	(ageGroups_arr.en).forEach(function(value, index) {
		let group = svg.append("g")
			.attr("transform", function(d, i) {
				return "translate(" + x(ageGroups_arr[language][index]) + ",0)";
			})
			.attr("class", "ageGroup")


		_currAgeGroup = (data.values).filter(function(d, i) {
			return d.key == value;
		})[0];

		sexSubgroups_arr.forEach(function(value2, index2) {
			if (_currAgeGroup) {
				_currSexGroup = (_currAgeGroup.values).filter(function(d, i) {
					return d.key == value2;
				})[0];
			}

			group.append("rect")
				.attr("x", function(d) {
					return xSubgroup(value2);
				})
				.attr("y", function(d) {
					if (_currAgeGroup) {
						if (_currSexGroup) {
							if (isNaN(_currSexGroup.value[_option + "_" + _vaxStat])) {
								if (_currSexGroup.value[_option + "_" + _vaxStat][0] == "≥")
									return y(95);
								return y(0);
							}
							else {
								return y(_currSexGroup.value[_option + "_" + _vaxStat]) - 1;
							}
						}
						else {
							return y(0);
						}
					}
					else {
						return y(0);
					}
				})
				.attr("width", function() {
					return xSubgroup.bandwidth();
				})
				.attr("height", function() {
					if (_currAgeGroup) {
						if (_currSexGroup) {
							if (isNaN(y(_currSexGroup.value[_option + "_" + _vaxStat]))) {
								if (_currSexGroup.value[_option + "_" + _vaxStat] == "<5" || _currSexGroup.value[_option + "_" + _vaxStat] == "<0.1") {
									d3.select(this.parentNode)
										.append("text")
										.attr("class", "lessThan5")
										.attr("text-anchor", "middle")
										.attr("font-size", "26px")
										.attr("font-weight", "bold")
										.attr("fill", function() {
											return greens4[index2]
										})
										.attr("y", (chartDim.height - chartDim.margin.bottom) - 1)
										.attr("x", function() {
											return (xSubgroup(_currSexGroup.key) + xSubgroup.bandwidth() / 2);
										})
										.text("*");
								}
								else if (_currSexGroup.value[_option + "_" + _vaxStat][0] == "≥") {
									return (chartDim.height - chartDim.margin.bottom) - y(95);
								}
								return 0;
							}
							else {
								return 1 + ((chartDim.height - chartDim.margin.bottom) - y(_currSexGroup.value[_option + "_" + _vaxStat]));
							}
						}
						else {
							return 0;
						}
					}
					else {
						return 0;
					}
				})
				.attr("fill", function() {
					if (value2 == "Not reported") {
						return "#bfbfbf";
					}
					else {
						return greens4[index2];
					}
				})
				.data(function() {
					if (_currAgeGroup) {
						if (_currSexGroup) {
							return [_currSexGroup];
						}
						else {
							return [];
						}
					}
					else {
						return [];
					}
				})
			// .append("title").text(function(d,i){
			// 	if(_currAgeGroup){
			// 		if(_currSexGroup){
			// 			if(isNaN(_currSexGroup.value[_option + "_" + _vaxStat])){
			// 				return short2txt(d.key)+" ("+x.domain()[index]+"): "+numberFormat(0);
			// 			}else{
			// 				let titleVal = generateTxt(_currSexGroup.value[_option + "_" + _vaxStat],_option);
			// 				return short2txt(d.key)+" ("+x.domain()[index]+"): "+titleVal;
			// 			}
			// 		}else{
			// 			return short2txt(d.key)+" ("+x.domain()[index]+"): "+numberFormat(0);
			// 		}
			// 	}else{
			// 		return short2txt(d.key)+" ("+x.domain()[index]+"): "+numberFormat(0);
			// 	}   
			// })
		})



	})

	let legend = svg.append("g");

	sexSubgroups_arr.forEach(function(value, index) {
		legend.append("rect")
			.attr("stroke", "none")
			.attr("x", (legendDim.x + ((chartDim.width / 5) * index)))
			.attr("y", legendDim.y)
			.attr("width", legendDim.sqr)
			.attr("height", legendDim.sqr)
			.attr("fill", function() {
				return greens4[index];
			})

		legend.append("text")
			.attr("text-anchor", "start")
			.attr("font-size", "16px")
			.attr("font-weight", "bold")
			.attr("x", (legendDim.x + ((chartDim.width / 5) * index) + legendDim.sqr + legendDim.textPadding))
			.attr("y", (legendDim.y + legendDim.sqr))
			.text(function(d) {
				if (value == "Not reported") {
					return short2txt(value + " as");
				}
				return short2txt(value);
			})
	})

	let axis = svg.append("g")
		.attr("id", "axisG");

	axis.append("g")
		.attr("id", "fig5_y")
		.attr("transform", "translate(" + chartDim.margin.left + ",0)")
		.call(d3.axisLeft(y).ticks(5).tickFormat(function(d) {
			if (_option == "prop") {
				if (language == "en") {
					return generateTxt(d, "prop", 0);
				}
				else {
					return generateTxt(d, "prop", 0);
				}
			}
			else {
				return numberFormat(d);
			}
		}))
		.selectAll("text")
		.attr("font-size", "16px")

	axis.append("g")
		.attr("id", "fig5_x")
		.attr("transform", "translate(0," + (chartDim.height - chartDim.margin.bottom) + ")")
		.call(d3.axisBottom(x).tickSize(0))
		.selectAll("text")
		.attr("class", "axisTextLablez")
		// .attr("fill","red")
		.attr("dy", "1em")
		.attr("font-size", function() {
			if (language == "en") {
				return "1.7em";
			}
			else {
				return "1.6em";
			}
		});

	axis.select("#fig5_y").selectAll(".axisTextLablez")
		.html(function(d) {
			if (d == "Unknown") {
				return "<abbr>Age group is unknown during data collection</abbr>";
			}
			else {
				return d;
			}
		})

	axis.append("text")
		.attr("font-size", "20px")
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle")
		.attr("y", function() {
			// return chartDim.margin.left/2;
			return chartDim.margin.left / 3;
		})
		.attr("x", function(d, i) {
			return 0;
		})
		.attr("transform", function() {
			return "translate(" + -2 + "," + ((chartDim.height / 2) - 5) + ")rotate(-90)";
		})
		.append("tspan")
		.attr("id", "fig5_yAxisLabel")
		.text(function(d, i) {
			if (language == "en") {
				if (_option == "numtotal") {
					return "Cumulative number of people vaccinated";
				}
				else {
					return "Cumulative percent of people vaccinated";
				}
			}
			else {
				if (_option == "numtotal") {
					return "Nombre cumulatif de personnes vaccinées";
				}
				else {
					return "Pourcentage cumulatif  de personnes vaccinées";
				}
			}
		})

	axis.append("text")
		.attr("font-size", "16px")
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle")
		.attr("y", function() {
			return -8;
		})
		.attr("x", function(d, i) {
			return 0;
		})
		.attr("transform", function() {
			return "translate(" +
				((chartDim.width / 2)) +
				"," + chartDim.height + ")";
		})
		.append("tspan")
		.attr("id", "fig5_xAxisLabel")
		.text(function(d, i) {
			if (language == "en") {
				return "Age group";
			}
			else {
				return "Groupe d’âge";
			}
		})

	return 0;

}

let selectedBreakdown = null;

//Build Figure 6. Coverage by vaccine product - Grouped Bar
var clickedVax = ["Not reported"];

function draw_fig_vactype(_option, _vaxStat, pruid, _update) {
	// let clickedVax = ["Not reported"];

	var trendLineDim = {
		height: 550,
		width: 1140,
		margin: {
			top: 20,
			bottom: 140,
			left: 150,
			right: 50
		}
	};

	var legendDim = {
		sqr: 20,
		x: (trendLineDim.margin.left + 50),
		y: (trendLineDim.margin.top + 0),
		padding: 5,
		textPadding: 10
	};

	let products_arr = ["Pfizer-BioNTech", "Moderna", "COVISHIELD", "AstraZeneca", "Unknown", "Not reported"];
	let data;
	for (let i = 0; i < nestedData_byVac2.length; i++) {
		if (nestedData_byVac2[i].key == pruid) {
			data = nestedData_byVac2[i];
			break;
		}
		else {
			data = { key: pruid, values: [] };
		}
	}

	let noData = false;
	if (!data || data.values.length == 0) {
		noData = true;
	}




	let y_domainMax;

	if (clickedVax.length < 1) {
		y_domainMax = d3.max(data.values, function(d) {
			return d3.max(d.values, function(d) {
				if (Number(d.value[_option + "_" + _vaxStat]) == 0) {
					if (d.value["table_" + _option + "_" + _vaxStat] == "") {
						noData = true;
					}
					return 5;
				}
				else {
					noData = false;
					return Number(d.value[_option + "_" + _vaxStat]);
				}
			})
		})
	}
	else {
		y_domainMax = d3.max(data.values.filter(function(d) {
			return clickedVax.indexOf(d.key) < 0;
		}), function(d) {
			return d3.max(d.values, function(d) {
				if (Number(d.value[_option + "_" + _vaxStat]) == 0) {
					if (d.value["table_" + _option + "_" + _vaxStat] == "") {
						noData = true;
					}
					return 5;
				}
				else {
					noData = false;
					return Number(d.value[_option + "_" + _vaxStat]);
				}
			})
		})
	}


	let maxPow = Math.floor(Math.log10(y_domainMax));
	let max2;
	if (y_domainMax != 0) {
		max2 = Math.ceil(y_domainMax / Math.pow(10, maxPow)) * Math.pow(10, maxPow);
	}
	else {
		max2 = 0;
	}

	// let dateLength = d3.max(nestedData_byVac2[0].values,function(d){
	// 	return d.values.length;
	// })
	let dateLength = nestedData_byVac[0].values.length;

	let startDate = nestedData_byVac[0].values[0].key;
	let endDate = nestedData_byVac[0].values[dateLength - 1].key;

	var parseTime = d3.timeParse("%Y-%m-%d");

	var x = d3.scaleTime().domain([parseTime(startDate), parseTime(endDate)])
		.range([trendLineDim.margin.left, trendLineDim.width - trendLineDim.margin.right]);

	var y = d3.scaleLinear().domain([0, max2])
		.range([(trendLineDim.height) - (trendLineDim.margin.bottom), (trendLineDim.margin.top)]);

	// var parseTime = d3.timeParse("%Y-%m-%d");
	// // var formatTime = d3.timeFormat("%b %d '%y");

	var pathGen = d3.line()
		.x(function(d) {
			return x(parseTime(d.key));
		})
		.y(function(d) {
			return y(Number(d.value[_option + "_" + _vaxStat]));
		});


	//Rescale
	function rescaleChart() {
		let y_domainMax;

		if (clickedVax.length < 1) {
			y_domainMax = d3.max(data.values, function(d) {
				return d3.max(d.values, function(d) {
					if (Number(d.value[_option + "_" + _vaxStat]) == 0) {
						return 5;
					}
					else {
						return Number(d.value[_option + "_" + _vaxStat]);
					}
				})
			})
		}
		else {
			y_domainMax = d3.max(data.values.filter(function(d) {
				return clickedVax.indexOf(d.key) < 0;
			}), function(d) {
				return d3.max(d.values, function(d) {
					if (Number(d.value[_option + "_" + _vaxStat]) == 0) {
						return 5;
					}
					else {
						return Number(d.value[_option + "_" + _vaxStat]);
					}
				})
			})
		}


		let maxPow = Math.floor(Math.log10(y_domainMax));
		let max2;
		if (y_domainMax != 0) {
			max2 = Math.ceil(y_domainMax / Math.pow(10, maxPow)) * Math.pow(10, maxPow);
		}
		else {
			max2 = 0;
		}

		y = d3.scaleLinear().domain([0, max2])
			.range([(trendLineDim.height) - (trendLineDim.margin.bottom), (trendLineDim.margin.top)]);


		d3.select("#byVaccine>#pathGroup").selectAll("path").each(function(d, i) {
			d3.select(this).data([data.values[i].values])
				.transition()
				.duration(300)
				.attrTween("d", function(d2, i2) {
					let prev = d3.select(this).attr("d");
					let curr = pathGen(d2);
					return d3.interpolatePath(prev, curr);
				});
		})

		d3.select("svg#byVaccine").select("g #fig6_y")
			.call(d3.axisLeft(y).ticks(5).tickFormat(function(d) {
				if (_option == "prop") {
					if (language == "en") {
						return generateTxt(d, "prop", 0);
					}
					else {
						return generateTxt(d, "prop", 0);
					}
				}
				else {
					return numberFormat(d);
				}
			}))
			.selectAll("text")
			.attr("class", "axisTextLablez")
			.attr("font-size", "16px")

	}


	if (_vaxStat == "atleast1dose") {
		if (language == "en") {
			d3.selectAll(".fig6-ddl-txt1").style("display", "");
			d3.selectAll(".fig6-ddl-txt2").text("of");
		}
		else {
			d3.selectAll(".fig6-ddl-txt1").style("display", "");
			d3.selectAll(".fig6-ddl-txt2").text("d'");
		}
	}
	else {
		if (language == "en") {
			d3.selectAll(".fig6-ddl-txt1").style("display", "none");
			d3.selectAll(".fig6-ddl-txt2").text("with");
		}
		else {
			d3.selectAll(".fig6-ddl-txt1").style("display", "none");
			d3.selectAll(".fig6-ddl-txt2").text("avec ");
		}
	}

	//UPDATE
	if (_update) {
		if (d3.select("svg#byVaccine>#errText").node()) {
			d3.select("svg#byVaccine>#errText").remove();
		}

		if (noData) {
			let errText = d3.select("svg#byVaccine").append("g")
				.attr("id", "errText")
				.append("text")
				.attr("text-anchor", "middle")
				.attr("font-size", "1.5em")
				.attr("font-weight", "bold")
				.attr("x", (((trendLineDim.width - trendLineDim.margin.left - trendLineDim.margin.right) / 2) + trendLineDim.margin.left))
				.attr("y", (trendLineDim.height / 2))
				.text(function() {
					if (language == "en") {
						return "Data Not Available";
					}
					else {
						return "Données non disponibles"
					}
				})
				.style("opacity", 0)
				.transition().delay(600).duration(300).style("opacity", 1);

			// 		d3.select("svg#byVaccine")//.selectAll("g")
			// // .data(stackData)
			// .selectAll("g.ageGroup>rect")
			// // .data(function(d){
			// //     return d;
			// // })
			// .transition()
			// .duration(700)
			// .attr("y",function(d){
			//     return chartDim.height - chartDim.margin.bottom;
			// })
			// .attr("height",function(d){
			//     return 0;
			// })
			d3.select("#byVaccine>#pathGroup").selectAll("path").style("opacity", 0);

			// d3.select("#fig5_yAxisLabel")
			//         .text(function(d,i){
			//         	if(language == "en"){
			//         		if(_option == "numtotal"){
			//             		return "Cumulative number of people vaccinated";
			//         		}else{
			//             		return "Cumulative percent of people vaccinated";
			//         		}
			//         	}else{
			//         		if(_option == "numtotal"){
			//             		return "Nombre cumulatif de personnes vaccinées";
			//         		}else{
			//             		return "Pourcentage cumulatif  de personnes vaccinées";
			//         		}
			//         	}
			//         })

			d3.select("svg#byVaccine").select("g #fig6_y")
				.call(d3.axisLeft(y).ticks(5).tickFormat(function(d) {
					if (_option == "prop") {
						if (language == "en") {
							return generateTxt(d, "prop", 0);
						}
						else {
							return generateTxt(d, "prop", 0);
						}
					}
					else {
						return numberFormat(d);
					}
				}))
				.selectAll("text")
				.attr("class", "axisTextLablez")
				.attr("font-size", "16px")

			d3.select("#fig6_yAxisLabel")
				.text(function(d, i) {
					if (language == "en") {
						if (_option == "numtotal") {
							return "Cumulative number of people vaccinated";
						}
						else {
							return "Cumulative percent of people vaccinated";
						}
					}
					else {
						if (_option == "numtotal") {
							return "Nombre cumulatif de personnes vaccinées";
						}
						else {
							return "Pourcentage cumulatif  de personnes vaccinées";
						}
					}
				})

			d3.select("#fig5_hoverSpace").on("mouseover", null).on("mousemove", null).on("mouseout", null);
			return 0;
		}



		d3.select("#byVaccine>#pathGroup").selectAll("path").each(function(d, i) {
			d3.select(this).data([data.values[i].values])
				.transition()
				.duration(700)
				.attrTween("d", function(d2, i2) {
					let prev = d3.select(this).attr("d");
					let curr = pathGen(d2);
					return d3.interpolatePath(prev, curr);
				});

			d3.select(this).style("opacity", function() {
				if (clickedVax.indexOf(data.values[i].key) < 0) {
					d3.select("#fig5_legendG").selectAll(".fig5_legendItem-" + i).style("opacity", 1);
					return 1;
				}
				else {
					d3.select("#fig5_legendG").selectAll(".fig5_legendItem-" + i).style("opacity", 0.3);
					return 0;
				}

			})
		})

		d3.select("svg#byVaccine").select("g #fig6_y")
			.call(d3.axisLeft(y).ticks(5).tickFormat(function(d) {
				if (_option == "prop") {
					if (language == "en") {
						return generateTxt(d, "prop", 0);
					}
					else {
						return generateTxt(d, "prop", 0);
					}
				}
				else {
					return numberFormat(d);
				}
			}))
			.selectAll("text")
			.attr("class", "axisTextLablez")
			.attr("font-size", "16px")

		d3.select("#fig6_yAxisLabel")
			.text(function(d, i) {
				if (language == "en") {
					if (_option == "numtotal") {
						return "Cumulative number of people vaccinated";
					}
					else {
						return "Cumulative percent of people vaccinated";
					}
				}
				else {
					if (_option == "numtotal") {
						return "Nombre cumulatif de personnes vaccinées";
					}
					else {
						return "Pourcentage cumulatif  de personnes vaccinées";
					}
				}
			})
		//Hover situation on update
		let _hoverLine = d3.select("#fig5_hoverLine");
		let _hoverCircles = d3.select("#fig5_hoverG").selectAll("circle");
		let legend = d3.select("#fig5_legendG");

		d3.select("#fig5_hoverSpace").on("mouseover", function() {
				_hoverLine.style("opacity", 1);
			})
			.on("mousemove", function() {
				let xStep = d3.select(this).attr("width") / (datesArray2.length - 1);
				let mouseRelative = (d3.mouse(this)[0] - trendLineDim.margin.left);
				let dateIndex = Math.round((mouseRelative / xStep));
				let hoveringDate = datesArray2[dateIndex];
				let hoveringX = x(hoveringDate);

				_hoverLine.attr("x1", hoveringX)
					.attr("x2", hoveringX);

				_hoverCircles.attr("cx", hoveringX)
					.attr("cy", function(d, i) {


						if ((data.values[i].values.length == datesArray2.length) && (clickedVax.indexOf(data.values[i].key) < 0)) {
							d3.select(this).style("opacity", 1);
							return y(Number(data.values[i].values[dateIndex].value[_option + "_" + _vaxStat]));
						}
						else {
							for (let z = 0; z < data.values[i].values.length; z++) {
								if ((data.values[i].values[z].key == d3.timeFormat("%Y-%m-%d")(hoveringDate)) && (clickedVax.indexOf(data.values[i].key) < 0)) {
									d3.select(this).style("opacity", 1);
									return y(Number(data.values[i].values[z].value[_option + "_" + _vaxStat]));
								}
							}

							d3.select(this).style("opacity", 0);
							return trendLineDim.margin.top;

						}

					});

				legend.selectAll("rect")
					.on("mouseup", function(d, i) {
						if (clickedVax.indexOf(data.values[i].key) < 0) {
							clickedVax.push(data.values[i].key);
							if (clickedVax.length == products_arr.length) {
								clickedVax = [];
								d3.select("#fig5_legendG").selectAll("rect").style("opacity", 1);
								d3.select("#fig5_legendG").selectAll("text").style("opacity", 1);
								rescaleChart();
								d3.select("#byVaccine>#pathGroup").selectAll("path").transition().delay(320).duration(300).style("opacity", 1);
							}
							else {
								d3.select("#fig5_legendG").selectAll(".fig5_legendItem-" + i).style("opacity", 0.3);
								d3.select("#" + (data.values[i].key).replace(/[^A-Z0-9]/ig, "") + "-path").transition().duration(300).style("opacity", 0);
								setTimeout(function() { rescaleChart(); }, 350);
							}

						}
						else {
							clickedVax.splice(clickedVax.indexOf(data.values[i].key), 1);
							d3.select("#fig5_legendG").selectAll(".fig5_legendItem-" + i).style("opacity", 1);
							rescaleChart();
							d3.select("#" + (data.values[i].key).replace(/[^A-Z0-9]/ig, "") + "-path").transition().delay(320).duration(300).style("opacity", 1);
						}
					})
				// 		.attr("x",function(){
				// 			if(hoveringX > (trendLineDim.width*0.75)){
				// 				return (trendLineDim.width*0.73);
				// 			}else{
				// 				return hoveringX + 10;
				// 			}
				// 		})

				legend.selectAll("text")
					.on("mouseup", function(d, i) {
						if (clickedVax.indexOf(data.values[i].key) < 0) {
							clickedVax.push(data.values[i].key);
							if (clickedVax.length == products_arr.length) {
								clickedVax = [];
								d3.select("#fig5_legendG").selectAll("rect").style("opacity", 1);
								d3.select("#fig5_legendG").selectAll("text").style("opacity", 1);
								rescaleChart();
								d3.select("#byVaccine>#pathGroup").selectAll("path").transition().delay(320).duration(300).style("opacity", 1);
							}
							else {
								d3.select("#fig5_legendG").selectAll(".fig5_legendItem-" + i).style("opacity", 0.3);
								d3.select("#" + (data.values[i].key).replace(/[^A-Z0-9]/ig, "") + "-path").transition().duration(300).style("opacity", 0);
								setTimeout(function() { rescaleChart(); }, 350);
							}
						}
						else {
							clickedVax.splice(clickedVax.indexOf(data.values[i].key), 1);
							d3.select("#fig5_legendG").selectAll(".fig5_legendItem-" + i).style("opacity", 1);
							rescaleChart();
							d3.select("#" + (data.values[i].key).replace(/[^A-Z0-9]/ig, "") + "-path").transition().delay(320).duration(300).style("opacity", 1);
						}
						// rescaleChart();
					})
					// .attr("x",function(){
					// 	if(hoveringX > (trendLineDim.width*0.75)){
					// 		return (trendLineDim.width*0.73)+ legendDim.sqr+ legendDim.textPadding;
					// 	}else{
					// 		return (hoveringX  + 10 + legendDim.sqr+ legendDim.textPadding);
					// 	}
					// })
					.select("tspan")
					.text(function(d) {
						if (data.values[d.index].values.length == datesArray2.length) {
							return ": " + generateTxt(data.values[d.index].values[dateIndex].value[_option + "_" + _vaxStat], _option)
						}
						else {
							for (let z = 0; z < data.values[d.index].values.length; z++) {
								if (data.values[d.index].values[z].key == d3.timeFormat("%Y-%m-%d")(hoveringDate)) {
									return ": " + generateTxt(data.values[d.index].values[z].value[_option + "_" + _vaxStat], _option)
								}
							}
							return ": " + generateTxt("");
						}
					})

			})
			.on("mouseout", function() {
				_hoverLine.style("opacity", 0);
				_hoverCircles.style("opacity", 0);
				legend.selectAll("text").select("tspan").text("")

				// legend.selectAll("rect").transition().duration(300).attr("x",legendDim.x)
				// legend.selectAll("text").transition().duration(300).attr("x",function(){
				// 							return legendDim.x + legendDim.sqr + legendDim.textPadding;
				// 						})
			});


		return 0;
	}

	//Draw
	let svg = d3.select("#fig6").append("svg")
		.attr("width", "100%")
		.attr("height", function(d) {
			if (isIE) {
				return trendLineDim.height;
			}
		})
		.attr("perserveAspectRatio", "xMinyMin meet")
		.attr("viewBox", "0 0 " + trendLineDim.width + " " + trendLineDim.height + "")
		.attr("id", "byVaccine");

	let legend = svg.insert("g", "g").attr("id", "fig5_legendG");

	//Paths
	let pathGroup = svg.append("g").attr("id", "pathGroup")
	data.values.forEach(function(value, index) {
		pathGroup.append("path")
			.attr("id", function() {
				return (value.key).replace(/[^A-Z0-9]/ig, "") + "-path";
			})
			.data([value.values])
			.attr("d", function(d, i) {
				return pathGen(d);
			})
			.attr("fill", "none")
			.attr("stroke", function(d, i) {
				return greens4reverse[index];
			})
			.attr("stroke-width", 5)
			.attr("stroke-linejoin", "round")
			.style("opacity", function() {
				if (clickedVax.indexOf(value.key) < 0) {
					return 1;
				}
				else {
					return 0;
				}
			})

		legend.append("rect")
			.attr("x", legendDim.x)
			.attr("y", function() {
				return (legendDim.y + (index * (legendDim.padding + legendDim.sqr)));
			})
			.attr("width", legendDim.sqr)
			.attr("height", legendDim.sqr)
			.attr("class", "fig5_legendItem-" + index)
			//.attr("stroke", "#bfbfbf")
			.attr("fill", function() {
				return greens4reverse[index];
			})
			.on("mouseup", function(d, i) {
				if (clickedVax.indexOf(value.key) < 0) {
					clickedVax.push(value.key);
					if (clickedVax.length == products_arr.length) {
						clickedVax = [];
						d3.select("#fig5_legendG").selectAll("rect").style("opacity", 1);
						d3.select("#fig5_legendG").selectAll("text").style("opacity", 1);
						rescaleChart();
						d3.select("#byVaccine>#pathGroup").selectAll("path").transition().delay(320).duration(300).style("opacity", 1);
					}
					else {
						d3.select("#fig5_legendG").selectAll(".fig5_legendItem-" + index).style("opacity", 0.3);
						d3.select("#" + (value.key).replace(/[^A-Z0-9]/ig, "") + "-path").transition().duration(300).style("opacity", 0);
						setTimeout(function() { rescaleChart(); }, 350);
					}
				}
				else {
					clickedVax.splice(clickedVax.indexOf(value.key), 1);
					d3.select("#fig5_legendG").selectAll(".fig5_legendItem-" + index).style("opacity", 1);
					rescaleChart();
					d3.select("#" + (value.key).replace(/[^A-Z0-9]/ig, "") + "-path").transition().delay(320).duration(300).style("opacity", 1);
				}

				//rescaleChart();
			})
			.style("opacity", function() {
				if (clickedVax.indexOf(value.key) < 0) {
					return 1;
				}
				else {
					return 0.3;
				}
			})
			.style("cursor", "pointer")

		// 	d3.select(this).style(function(){
		// 		if(clickedVax.indexOf(data.values[i].key)<0){
		// 			d3.select("#fig5_legendG").selectAll(".fig5_legendItem-"+i).style("opacity",1);
		// 			return 1;
		// 		}
		//  })

		legend.append("text")
			.attr("x", function() {
				return legendDim.x + legendDim.sqr + legendDim.textPadding;
			})
			.attr("y", function() {
				return (legendDim.y + legendDim.sqr + (index * (legendDim.padding + legendDim.sqr)));
			})
			.attr("class", "fig5_legendItem-" + index)
			.attr("text-anchor", "start")
			.attr("font-size", "16px")
			.attr("font-weight", "bold")
			.text(function() {
				if (value.key == "Not reported" || value.key == "Unknown") {
					if (value.key == "Not reported") {
						return short2txt(value.key + " v");
					}
					return short2txt(value.key);
				}
				else {
					return value.key;
				}
			})
			.on("mouseup", function(d, i) {
				if (clickedVax.indexOf(value.key) < 0) {
					clickedVax.push(value.key);
					if (clickedVax.length == products_arr.length) {
						clickedVax = [];
						// .attr("id","hoverCirle-"+1)
						// d3.select("#fig5_hoverG").selectAll(".hoverCirles").style("opacity",1);
						d3.select("#fig5_legendG").selectAll("rect").style("opacity", 1);
						d3.select("#fig5_legendG").selectAll("text").style("opacity", 1);
						rescaleChart();
						d3.select("#byVaccine>#pathGroup").selectAll("path").transition().delay(320).duration(300).style("opacity", 1);
					}
					else {
						// d3.select("#fig5_hoverG").select("#hoverCirle"+index).style("opacity",0);
						d3.select("#fig5_legendG").selectAll(".fig5_legendItem-" + index).style("opacity", 0.3);
						d3.select("#" + (value.key).replace(/[^A-Z0-9]/ig, "") + "-path").transition().duration(300).style("opacity", 0);
						setTimeout(function() { rescaleChart(); }, 350);
					}

				}
				else {
					clickedVax.splice(clickedVax.indexOf(value.key), 1);
					// d3.select("#fig5_hoverG").select("#hoverCirle"+index).style("opacity",1);
					d3.select("#fig5_legendG").selectAll(".fig5_legendItem-" + index).style("opacity", 1);
					rescaleChart();
					d3.select("#" + (value.key).replace(/[^A-Z0-9]/ig, "") + "-path").transition().delay(320).duration(300).style("opacity", 1);
				}
				// rescaleChart();
			})
			.style("opacity", function() {
				if (clickedVax.indexOf(value.key) < 0) {
					return 1;
				}
				else {
					return 0.3;
				}
			})
			.style("cursor", "pointer")
			//tspan for hover...
			.append("tspan")
			.data([{ key: value.key, index: index }])
			.attr("dx", 0)
			.attr("dy", 0)

	})


	//Hover Situation ...
	let hoverGroup = svg.insert("g", "#fig5_legendG")
		.attr("id", "fig5_hoverG");

	let hoverSpace = hoverGroup.append("rect")
		.attr("width", (trendLineDim.width - trendLineDim.margin.right - trendLineDim.margin.left))
		.attr("height", (trendLineDim.height - trendLineDim.margin.bottom - trendLineDim.margin.top))
		.attr("x", trendLineDim.margin.left)
		.attr("y", trendLineDim.margin.top)
		.style("opacity", 0)
		.attr("id", "fig5_hoverSpace")
		.on("mouseover", function() {
			_hoverLine.style("opacity", 1);
		})
		.on("mousemove", function() {
			let xStep = d3.select(this).attr("width") / (datesArray2.length - 1);
			let mouseRelative = (d3.mouse(this)[0] - trendLineDim.margin.left);
			let dateIndex = Math.round((mouseRelative / xStep));
			let hoveringDate = datesArray2[dateIndex];
			let hoveringX = x(hoveringDate);

			_hoverLine.attr("x1", hoveringX)
				.attr("x2", hoveringX);

			_hoverCircles.attr("cx", hoveringX)
				.attr("cy", function(d, i) {

					if ((data.values[i].values.length == datesArray2.length) && (clickedVax.indexOf(data.values[i].key) < 0)) {
						d3.select(this).style("opacity", 1);
						return y(Number(data.values[i].values[dateIndex].value[_option + "_" + _vaxStat]));
					}
					else {
						for (let z = 0; z < data.values[i].values.length; z++) {
							if ((data.values[i].values[z].key == d3.timeFormat("%Y-%m-%d")(hoveringDate)) && (clickedVax.indexOf(data.values[i].key) < 0)) {
								d3.select(this).style("opacity", 1);
								return y(Number(data.values[i].values[z].value[_option + "_" + _vaxStat]));
							}
						}

						d3.select(this).style("opacity", 0);
						return trendLineDim.margin.top;

					}

				});

			// legend.selectAll("rect")
			// 		.attr("x",function(){
			// 			if(hoveringX > (trendLineDim.width*0.75)){
			// 				return (trendLineDim.width*0.73);
			// 			}else{
			// 				return hoveringX + 10;
			// 			}
			// 		})

			legend.selectAll("text")
				// .attr("x",function(){
				// 	if(hoveringX > (trendLineDim.width*0.75)){
				// 		return (trendLineDim.width*0.73)+ legendDim.sqr+ legendDim.textPadding;
				// 	}else{
				// 		return (hoveringX  + 10 + legendDim.sqr+ legendDim.textPadding);
				// 	}
				// })
				.select("tspan")
				.text(function(d) {
					if (data.values[d.index].values.length == datesArray2.length) {
						return ": " + generateTxt(data.values[d.index].values[dateIndex].value[_option + "_" + _vaxStat], _option)
					}
					else {
						for (let z = 0; z < data.values[d.index].values.length; z++) {
							if (data.values[d.index].values[z].key == d3.timeFormat("%Y-%m-%d")(hoveringDate)) {
								return ": " + generateTxt(data.values[d.index].values[z].value[_option + "_" + _vaxStat], _option)
							}
						}
						return ": " + generateTxt("");
					}
				})

		})
		.on("mouseout", function() {
			_hoverLine.style("opacity", 0);
			_hoverCircles.style("opacity", 0);
			legend.selectAll("text").select("tspan").text("")

			legend.selectAll("rect").transition().duration(300).attr("x", legendDim.x)
			legend.selectAll("text").transition().duration(300).attr("x", function() {
				return legendDim.x + legendDim.sqr + legendDim.textPadding;
			})
		});

	let _hoverLine = hoverGroup.insert("line", "rect")
		.attr("id", "fig5_hoverLine")
		.attr("x1", 100)
		.attr("y1", trendLineDim.margin.top)
		.attr("x2", 100)
		.attr("y2", (trendLineDim.height - trendLineDim.margin.bottom))
		.style("stroke-width", 2)
		.style("stroke", "#aaaaaa")
		.style("fill", "none")
		.style("opacity", 0);

	let _hoverCircles = hoverGroup.insert("g", "rect")
		.selectAll("circle")
		.data(products_arr)
		.enter()
		.append("circle")
		// .style("stroke",)
		.style("fill", function(d, i) {
			return greens4reverse[i];
		})
		.attr("class", "hoverCirles")
		.attr("id", "hoverCirle-" + 1)
		.attr("r", 7)
		.attr("cx", function(d, i) {
			return 50 + (i * 10)
		})
		.attr("cy", function(d, i) {
			return 50 + (i * 10)
		})
		.style("opacity", 0);

	//Axis
	let axis = svg.append("g")
		.attr("id", "axisG");

	axis.append("g")
		.attr("id", "fig6_y")
		.attr("transform", "translate(" + trendLineDim.margin.left + ",0)")
		.call(d3.axisLeft(y).ticks(5).tickFormat(function(d) {
			if (_option == "prop") {
				if (language == "en") {
					return generateTxt(d, "prop", 0);
				}
				else {
					return generateTxt(d, "prop", 0);
				}
			}
			else {
				return numberFormat(d);
			}
		}))
		.selectAll("text")
		.attr("class", "axisTextLablez")
		.attr("font-size", "16px")




	axis.append("g")
		.attr("id", "fig6_x")
		.attr("transform", "translate(0," + (trendLineDim.height - trendLineDim.margin.bottom) + ")")
		.call(d3.axisBottom(x).tickValues(datesArray2).tickFormat(function(d) {
			return d3.timeFormat("%d %b %Y")(d);
		}))
		.selectAll("text")
		.attr("transform", "rotate(-45)")
		.style("text-anchor", "end")
		.attr("class", "axisTextLablez")
		// .attr("fill","red")
		.attr("dy", "1.2em")
		.attr("font-size", "16px");

	axis.append("text")
		.attr("font-size", "20px")
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle")
		.attr("y", function() {
			return trendLineDim.margin.left / 3;
		})
		.attr("x", function(d, i) {
			return 0;
		})
		.attr("transform", function() {
			return "translate(" + -25 + "," + ((trendLineDim.height / 2) - 50) + ")rotate(-90)";
		})
		.append("tspan")
		.attr("id", "fig6_yAxisLabel")
		.text(function(d, i) {
			if (language == "en") {
				if (_option == "numtotal") {
					return "Cumulative number of people vaccinated";
				}
				else {
					return "Cumulative percent of people vaccinated";
				}
			}
			else {
				if (_option == "numtotal") {
					return "Nombre cumulatif de personnes vaccinées";
				}
				else {
					return "Pourcentage cumulatif  de personnes vaccinées";
				}
			}
		})

	axis.append("text")
		.attr("font-size", "16px")
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle")
		.attr("y", function() {
			return -10;
		})
		.attr("x", function(d, i) {
			return 0;
		})
		.attr("transform", function() {
			return "translate(" +
				(trendLineDim.width / 2) +
				"," + trendLineDim.height + ")";
		})
		.append("tspan")
		.attr("id", "fig6_xAxisLabel")
		.text(function(d, i) {
			if (language == "en") {
				return "Report week";
			}
			else {
				//FRENCH
				return "Semaine de rapport";
			}
		})



	//Build data table


	return 0;
}

//Build Figure 6. Coverage by vaccine product - Grouped Bar
var clickedDose = [];

function draw_fig_covline(_option, pruid, _update) {

	// let _vaxStat = "atleast1dose";
	// let _vaxStat2 = "";

	var trendLineDim = {
		height: 550,
		width: 1140,
		margin: {
			top: 20,
			bottom: 140,
			left: 150,
			right: 50
		}
	};

	var legendDim = {
		sqr: 20,
		x: (trendLineDim.margin.left + 50),
		y: (trendLineDim.margin.top + 0),
		padding: 5,
		textPadding: 10
	};

	let vaxStat_arr = [{ key: "atleast1dose", value: "At least one dose" },
		{ key: "partially", value: "Partially vaccinated" },
		{ key: "fully", value: "Fully vaccinated" }
	];
	let data;
	for (let i = 0; i < covlineData.length; i++) {
		if (covlineData[i].key == pruid) {
			data = covlineData[i];
			break;
		}
		else {
			data = { key: pruid, values: [] };
		}
	}

	let noData = false;
	if (!data || data.values.length == 0) {
		noData = true;
	}

	let y_domainMax;

	if (clickedDose.length < 1) {
		y_domainMax = d3.max(data.values, function(d) {
			if (Number(d[_option + "_atleast1dose"]) == 0) {
				if (d["table_" + _option + "_atleast1dose"] == "") {
					noData = true;
				}
				return 5;
			}
			else {
				noData = false;
				return Number(d[_option + "_atleast1dose"]);
			}
		})
	}
	else {
		y_domainMax = d3.max(data.values, function(d) {
			vaxStat_arr.forEach(function(value, index) {
				if (clickedDose.indexOf(value.key) < 0) {
					if (Number(d[_option + "_" + value.key]) == 0) {
						return 5;
					}
					else {
						return Number(d[_option + "_" + value.key]);
					}
				}
			})

		})
	}


	let maxPow = Math.floor(Math.log10(y_domainMax));
	let max2;
	// if(_option == "proptotal"){
	// 	max2 = 50;
	// }else 
	if (y_domainMax != 0) {
		max2 = Math.ceil(y_domainMax / Math.pow(10, maxPow)) * Math.pow(10, maxPow);
	}
	else {
		max2 = 0;
	}

	let dateLength = covlineData[0].values.length;

	let startDate = covlineData[0].values[0]["week_end"];
	let endDate = covlineData[0].values[dateLength - 1]["week_end"];

	var parseTime = d3.timeParse("%Y-%m-%d");

	var x = d3.scaleTime().domain([parseTime(startDate), parseTime(endDate)])
		.range([trendLineDim.margin.left, trendLineDim.width - trendLineDim.margin.right]);

	var y = d3.scaleLinear().domain([0, max2])
		.range([(trendLineDim.height) - (trendLineDim.margin.bottom), (trendLineDim.margin.top)]);

	function generatePath(d, _vaxStat) {
		var pathGen = d3.line()
			.defined(function(d) {
				if ((d[_option + "_" + _vaxStat] === "") || isNaN(d[_option + "_" + _vaxStat])) {
					return false;
				}
				else {
					return true;
				}
			})
			.x(function(d) {
				return x(parseTime(d["week_end"]));
			})
			.y(function(d) {
				return y(Number(d[_option + "_" + _vaxStat]));
			});

		return pathGen(d);
	}



	//Rescale
	function rescaleChart() {
		let y_domainMax;

		if (clickedDose.length < 1) {
			y_domainMax = d3.max(data.values, function(d) {
				if (Number(d[_option + "_atleast1dose"]) == 0) {
					return 5;
				}
				else {
					return Number(d[_option + "_atleast1dose"]);
				}
			})
		}
		else {
			y_domainMax = d3.max(data.values, function(d) {
				let _max = 0;
				vaxStat_arr.forEach(function(value, index) {
					if (clickedDose.indexOf(value.key) < 0) {
						if (Number(d[_option + "_" + value.key]) == 0) {
							_max = Math.max(_max, 5);
						}
						else {
							_max = Math.max(_max, Number(d[_option + "_" + value.key]));
						}
					}
				})
				return _max;
			})
		}


		let maxPow = Math.floor(Math.log10(y_domainMax));
		let max2;
		// if(_option == "proptotal"){
		// 	max2 = 50;
		// }else 
		if (y_domainMax != 0) {
			max2 = Math.ceil(y_domainMax / Math.pow(10, maxPow)) * Math.pow(10, maxPow);
		}
		else {
			max2 = 0;
		}

		y = d3.scaleLinear().domain([0, max2])
			.range([(trendLineDim.height) - (trendLineDim.margin.bottom), (trendLineDim.margin.top)]);


		d3.select("#covline>#pathGroupCovline").selectAll("path").each(function(d, i) {
			// _vaxStat2 = Object.keys(vaxStat_arr[i]);
			d3.select(this).data([data.values])
				.transition()
				.duration(300)
				.attrTween("d", function(d2, i2) {
					let prev = d3.select(this).attr("d");
					let curr = generatePath(d2, vaxStat_arr[i].key);
					return d3.interpolatePath(prev, curr);
				});
		})

		d3.select("svg#covline").select("g #covline_y")
			.call(d3.axisLeft(y).ticks(5).tickFormat(function(d) {
				if (_option == "proptotal") {
					if (language == "en") {
						return generateTxt(d, "prop", 0);
					}
					else {
						return generateTxt(d, "prop", 0);
					}
				}
				else {
					return numberFormat(d);
				}
			}))
			.selectAll("text")
			.attr("class", "axisTextLabels")
			.attr("font-size", "16px")

	}

	//UPDATE
	if (_update) {

		// rescaleChart();

		if (d3.select("svg#covline>#errText").node()) {
			d3.select("svg#covline>#errText").remove();
		}

		if (noData) {
			let errText = d3.select("svg#covline").append("g")
				.attr("id", "errText")
				.append("text")
				.attr("text-anchor", "middle")
				.attr("font-size", "1.5em")
				.attr("font-weight", "bold")
				.attr("x", (((trendLineDim.width - trendLineDim.margin.left - trendLineDim.margin.right) / 2) + trendLineDim.margin.left))
				.attr("y", (trendLineDim.height / 2))
				.text(function() {
					if (language == "en") {
						return "Data Not Available";
					}
					else {
						return "Données non disponibles"
					}
				})
				.style("opacity", 0)
				.transition().delay(600).duration(300).style("opacity", 1);

			// 		d3.select("svg#byVaccine")//.selectAll("g")
			// // .data(stackData)
			// .selectAll("g.ageGroup>rect")
			// // .data(function(d){
			// //     return d;
			// // })
			// .transition()
			// .duration(700)
			// .attr("y",function(d){
			//     return chartDim.height - chartDim.margin.bottom;
			// })
			// .attr("height",function(d){
			//     return 0;
			// })
			d3.select("#covline>#pathGroupCovline").selectAll("path").style("opacity", 0);

			// d3.select("#fig5_yAxisLabel")
			//         .text(function(d,i){
			//         	if(language == "en"){
			//         		if(_option == "numtotal"){
			//             		return "Cumulative number of people vaccinated";
			//         		}else{
			//             		return "Cumulative percent of people vaccinated";
			//         		}
			//         	}else{
			//         		if(_option == "numtotal"){
			//             		return "Nombre cumulatif de personnes vaccinées";
			//         		}else{
			//             		return "Pourcentage cumulatif  de personnes vaccinées";
			//         		}
			//         	}
			//         })

			d3.select("svg#covline").select("g #covline_y")
				.call(d3.axisLeft(y).ticks(5).tickFormat(function(d) {
					if (_option == "proptotal") {
						if (language == "en") {
							return generateTxt(d, "prop", 0);
						}
						else {
							return generateTxt(d, "prop", 0);
						}
					}
					else {
						return numberFormat(d);
					}
				}))
				.selectAll("text")
				.attr("class", "axisTextLabels")
				.attr("font-size", "16px")

			d3.select("#covline_yAxisLabel")
				.text(function(d, i) {
					if (language == "en") {
						if (_option == "numtotal") {
							return "Cumulative number of people vaccinated";
						}
						else {
							return "Cumulative percent of people vaccinated";
						}
					}
					else {
						if (_option == "numtotal") {
							return "Nombre cumulatif de personnes vaccinées";
						}
						else {
							return "Pourcentage cumulatif  de personnes vaccinées";
						}
					}
				})

			d3.select("#covline_hoverSpace").on("mouseover", null).on("mousemove", null).on("mouseout", null);
			return 0;
		}


		d3.select("#covline>#pathGroupCovline").selectAll("path").each(function(d, i) {
			let _vaxStat2 = d3.select(this).attr("id").slice(0, -5);

			d3.select(this).data([data.values])
				.transition()
				.duration(700)
				.attrTween("d", function(d2, i2) {
					let prev = d3.select(this).attr("d");
					let curr = generatePath(d2, vaxStat_arr[i].key);
					return d3.interpolatePath(prev, curr);
				});

			d3.select(this).style("opacity", function() {
				if (clickedDose.indexOf(vaxStat_arr[i].key) < 0) {
					d3.select("#covline_legendG").selectAll(".covline_legendItem-" + i).style("opacity", 1);
					return 1;
				}
				else {
					d3.select("#covline_legendG").selectAll(".covline_legendItem-" + i).style("opacity", 0.3);
					return 0;
				}

			})
		})

		d3.select("svg#covline").select("g #covline_y")
			.call(d3.axisLeft(y).ticks(5).tickFormat(function(d) {
				if (_option == "proptotal") {
					if (language == "en") {
						return generateTxt(d, "prop", 0);
					}
					else {
						return generateTxt(d, "prop", 0);
					}
				}
				else {
					return numberFormat(d);
				}
			}))
			.selectAll("text")
			.attr("class", "axisTextLabels")
			.attr("font-size", "16px")

		// d3.select("svg#covline").select("g #covline_y")
		// 	.call(d3.axisLeft(y).ticks(5).tickFormat(function(d){
		// 		if(_option == "prop"){
		// 			if(language == "en"){
		// 				return generateTxt(d,"prop");
		// 			}else{
		// 				return generateTxt(d,"prop");
		// 			}
		// 		}else{
		// 			return numberFormat(d);
		// 		}
		// 	}))
		//     .selectAll("text")
		// 	.attr("class","axisTextLabels")
		//     .attr("font-size","16px")

		d3.select("#covline_yAxisLabel")
			.text(function(d, i) {
				if (language == "en") {
					if (_option == "numtotal") {
						return "Cumulative number of people vaccinated";
					}
					else {
						return "Cumulative percent of people vaccinated";
					}
				}
				else {
					if (_option == "numtotal") {
						return "Nombre cumulatif de personnes vaccinées";
					}
					else {
						return "Pourcentage cumulatif  de personnes vaccinées";
					}
				}
			})
		//Hover situation on update
		let _hoverLine = d3.select("#covline_hoverLine");
		let _hoverCircles = d3.select("#covline_hoverG").selectAll("circle");
		let legend = d3.select("#covline_legendG");

		d3.select("#covline_hoverSpace").on("mouseover", function() {
				_hoverLine.style("opacity", 1);
			})
			.on("mousemove", function() {
				let xStep = d3.select(this).attr("width") / (datesArray2.length - 1);
				let mouseRelative = (d3.mouse(this)[0] - trendLineDim.margin.left);
				let dateIndex = Math.round((mouseRelative / xStep));
				let hoveringDate = datesArray2[dateIndex];
				let hoveringX = x(hoveringDate);

				_hoverLine.attr("x1", hoveringX)
					.attr("x2", hoveringX);

				_hoverCircles.attr("cx", hoveringX)
					.attr("cy", function(d, i) {
						if ((data.values.length == datesArray2.length) && (clickedDose.indexOf(d.key) < 0)) {
							d3.select(this).style("opacity", 1);
							return y(Number(data.values[dateIndex][_option + "_" + d.key]));
						}
						else {

							for (let z = 0; z < data.values.length; z++) {
								if ((data.values[z]["week_end"] == d3.timeFormat("%Y-%m-%d")(hoveringDate)) && (clickedDose.indexOf(d.key) < 0)) {
									d3.select(this).style("opacity", 1);
									return y(Number(data.values[z][_option + "_" + d.key]));
								}
							}
							d3.select(this).style("opacity", 0);
							return trendLineDim.margin.top;
						}

					});

				legend.selectAll("text")
					.select("tspan")
					.text(function(d) {
						if (data.values.length == datesArray2.length) {
							return ": " + generateTxt(data.values[dateIndex][_option + "_" + d.key], _option)
						}
						else {
							for (let z = 0; z < data.values.length; z++) {
								if (data.values[z]["week_end"] == d3.timeFormat("%Y-%m-%d")(hoveringDate)) {
									return ": " + generateTxt(data.values[z][_option + "_" + d.key], _option)
								}
							}
							return ": " + generateTxt("");
						}
					})
			})
			.on("mouseout", function() {
				_hoverLine.style("opacity", 0);
				_hoverCircles.style("opacity", 0);
				legend.selectAll("text").select("tspan").text("")

				// legend.selectAll("rect").transition().duration(300).attr("x",legendDim.x)
				// legend.selectAll("text").transition().duration(300).attr("x",function(){
				// 							return legendDim.x + legendDim.sqr + legendDim.textPadding;
				// 						})
			});

		legend.selectAll("rect")
			.on("mouseup", function(d, i) {
				if (clickedDose.indexOf(vaxStat_arr[i].key) < 0) {
					clickedDose.push(vaxStat_arr[i].key);
					if (clickedDose.length == vaxStat_arr.length) {
						clickedDose = [];
						d3.select("#covline_legendG").selectAll("rect").style("opacity", 1);
						d3.select("#covline_legendG").selectAll("text").style("opacity", 1);
						rescaleChart();
						d3.select("#covline>#pathGroupCovline").selectAll("path").transition().delay(320).duration(300).style("opacity", 1);
					}
					else {
						d3.select("#covline_legendG").selectAll(".covline_legendItem-" + i).style("opacity", 0.3);
						d3.select("#" + vaxStat_arr[i].key + "-path").transition().duration(300).style("opacity", 0);
						setTimeout(function() { rescaleChart(); }, 350);
					}

				}
				else {
					clickedDose.splice(clickedDose.indexOf(data.values[i].key), 1);
					d3.select("#covline_legendG").selectAll(".covline_legendItem-" + i).style("opacity", 1);
					rescaleChart();
					d3.select("#" + vaxStat_arr[i].key + "-path").transition().delay(320).duration(300).style("opacity", 1);
				}
			})

		legend.selectAll("text")
			.on("mouseup", function(d, i) {
				if (clickedDose.indexOf(vaxStat_arr[i].key) < 0) {
					clickedDose.push(vaxStat_arr[i].key);
					if (clickedDose.length == vaxStat_arr.length) {
						clickedDose = [];
						d3.select("#covline_legendG").selectAll("rect").style("opacity", 1);
						d3.select("#covline_legendG").selectAll("text").style("opacity", 1);
						rescaleChart();
						d3.select("#covline>#pathGroupCovline").selectAll("path").transition().delay(320).duration(300).style("opacity", 1);
					}
					else {
						d3.select("#covline_legendG").selectAll(".covline_legendItem-" + i).style("opacity", 0.3);
						d3.select("#" + vaxStat_arr[i].key + "-path").transition().duration(300).style("opacity", 0);
						setTimeout(function() { rescaleChart(); }, 350);
					}
				}
				else {
					clickedDose.splice(clickedDose.indexOf(vaxStat_arr[i].key), 1);
					d3.select("#covline_legendG").selectAll(".covline_legendItem-" + i).style("opacity", 1);
					rescaleChart();
					d3.select("#" + vaxStat_arr[i].key + "-path").transition().delay(320).duration(300).style("opacity", 1);
				}
				// rescaleChart();
			})
		// .attr("x",function(){
		// 	if(hoveringX > (trendLineDim.width*0.75)){
		// 		return (trendLineDim.width*0.73)+ legendDim.sqr+ legendDim.textPadding;
		// 	}else{
		// 		return (hoveringX  + 10 + legendDim.sqr+ legendDim.textPadding);
		// 	}
		// })
		// .select("tspan")
		// .text(function(d){
		// 	if(data.values.length == datesArray2.length){
		// 		return ": "+generateTxt(data.values[dateIndex][_option+"_"+d.key],_option)
		// 	}else{
		// 		for(let z=0 ; z<data.values.length ; z++){
		// 			if(data.values[z]["week_end"] == d3.timeFormat("%Y-%m-%d")(hoveringDate)){
		// 				return ": "+generateTxt(data.values[z][_option+"_"+d.key],_option)
		// 			}
		// 		}
		// 		return ": "+generateTxt("");
		// 	}
		// })



		return 0;
	}

	//Draw
	let svg = d3.select("#covline").append("svg")
		.attr("width", "100%")
		.attr("height", function(d) {
			if (isIE) {
				return trendLineDim.height;
			}
		})
		.attr("perserveAspectRatio", "xMinyMin meet")
		.attr("viewBox", "0 0 " + trendLineDim.width + " " + trendLineDim.height + "")
		.attr("id", "covline");

	let legend = svg.insert("g", "g").attr("id", "covline_legendG");

	//Paths
	let pathGroupCovline = svg.append("g").attr("id", "pathGroupCovline")

	vaxStat_arr.forEach(function(value, index) {
		let vaxStatKey = value.key;

		pathGroupCovline.append("path")
			.attr("id", function() {
				return vaxStatKey + "-path";
			})
			.data([data.values])
			.attr("d", function(d, i) {
				// return pathGen(d);
				return generatePath(d, vaxStatKey)
			})
			.attr("fill", "none")
			.attr("stroke", function(d, i) {
				return greens3reverse[index];
			})
			.attr("stroke-width", 5)
			.attr("stroke-linejoin", "round")
			.style("opacity", function() {
				//FIX HERE MZ
				if (clickedDose.indexOf(vaxStatKey) < 0) {
					return 1;
				}
				else {
					return 0;
				}
			})

		legend.append("rect")
			.attr("x", legendDim.x)
			.attr("y", function() {
				return (legendDim.y + (index * (legendDim.padding + legendDim.sqr) + 3));
			})
			.attr("width", legendDim.sqr)
			.attr("height", legendDim.sqr)
			.attr("class", "covline_legendItem-" + index)
			//.attr("stroke", "#bfbfbf")
			.attr("fill", function() {
				return greens3reverse[index];
			})
			.on("mouseup", function(d, i) {
				//FIX HERE MZ
				if (clickedDose.indexOf(vaxStatKey) < 0) {
					clickedDose.push(vaxStatKey);
					if (clickedDose.length == vaxStat_arr.length) {
						clickedDose = [];
						d3.select("#covline_legendG").selectAll("rect").style("opacity", 1);
						d3.select("#covline_legendG").selectAll("text").style("opacity", 1);
						rescaleChart();
						d3.select("#covline>#pathGroupCovline").selectAll("path").transition().delay(320).duration(300).style("opacity", 1);
					}
					else {
						d3.select("#covline_legendG").selectAll(".covline_legendItem-" + index).style("opacity", 0.3);
						d3.select("#" + vaxStatKey + "-path").transition().duration(300).style("opacity", 0);
						setTimeout(function() { rescaleChart(); }, 350);
					}
				}
				else {
					clickedDose.splice(clickedDose.indexOf(vaxStatKey), 1);
					d3.select("#covline_legendG").selectAll(".covline_legendItem-" + index).style("opacity", 1);
					rescaleChart();
					d3.select("#" + vaxStatKey + "-path").transition().delay(320).duration(300).style("opacity", 1);
				}

				//rescaleChart();
			})
			.style("opacity", function() {
				if (clickedDose.indexOf(vaxStatKey) < 0) {
					return 1;
				}
				else {
					return 0.3;
				}
			})
			.style("cursor", "pointer")

		// 	d3.select(this).style(function(){
		// 		if(clickedDose.indexOf(data.values[i].key)<0){
		// 			d3.select("#fig5_legendG").selectAll(".fig5_legendItem-"+i).style("opacity",1);
		// 			return 1;
		// 		}
		//  })

		legend.append("text")
			.attr("x", function() {
				return legendDim.x + legendDim.sqr + legendDim.textPadding;
			})
			.attr("y", function() {
				return (legendDim.y + legendDim.sqr + (index * (legendDim.padding + legendDim.sqr)));
			})
			.attr("class", "covline_legendItem-" + index)
			.attr("text-anchor", "start")
			.attr("font-size", "16px")
			.attr("font-weight", "bold")
			.text(function() {
				//   			if(value.key == "Not reported" || value.key == "Unknown"){
				// 	return short2txt(value.key);
				// }else{
				// return value[Object.keys(value)[0]];
				return short2txt(vaxStat_arr[index].value);
				// }
			})
			.on("mouseup", function(d, i) {
				//FIX HERE MZ
				if (clickedDose.indexOf(vaxStatKey) < 0) {
					clickedDose.push(vaxStatKey);
					if (clickedDose.length == vaxStat_arr.length) {
						clickedDose = [];
						// .attr("id","hoverCirle-"+1)
						// d3.select("#fig5_hoverG").selectAll(".hoverCirles").style("opacity",1);
						d3.select("#covline_legendG").selectAll("rect").style("opacity", 1);
						d3.select("#covline_legendG").selectAll("text").style("opacity", 1);
						rescaleChart();
						d3.select("#covline>#pathGroupCovline").selectAll("path").transition().delay(320).duration(300).style("opacity", 1);
					}
					else {
						// d3.select("#fig5_hoverG").select("#hoverCirle"+index).style("opacity",0);
						d3.select("#covline_legendG").selectAll(".covline_legendItem-" + index).style("opacity", 0.3);
						d3.select("#" + vaxStatKey + "-path").transition().duration(300).style("opacity", 0);
						setTimeout(function() { rescaleChart(); }, 350);
					}

				}
				else {
					clickedDose.splice(clickedDose.indexOf(vaxStatKey), 1);
					// d3.select("#fig5_hoverG").select("#hoverCirle"+index).style("opacity",1);
					d3.select("#covline_legendG").selectAll(".covline_legendItem-" + index).style("opacity", 1);
					rescaleChart();
					d3.select("#" + vaxStatKey + "-path").transition().delay(320).duration(300).style("opacity", 1);
				}
				// rescaleChart();
			})
			.style("opacity", function() {
				if (clickedDose.indexOf(vaxStatKey) < 0) {
					return 1;
				}
				else {
					return 0.3;
				}
			})
			.style("cursor", "pointer")
			//tspan for hover...
			.append("tspan")
			.data([{ key: vaxStatKey, index: index }])
			.attr("dx", 0)
			.attr("dy", 0)

	})

	//Hover Situation ...
	let hoverGroup = svg.insert("g", "#covline_legendG")
		.attr("id", "covline_hoverG");

	let hoverSpace = hoverGroup.append("rect")
		.attr("width", (trendLineDim.width - trendLineDim.margin.right - trendLineDim.margin.left))
		.attr("height", (trendLineDim.height - trendLineDim.margin.bottom - trendLineDim.margin.top))
		.attr("x", trendLineDim.margin.left)
		.attr("y", trendLineDim.margin.top)
		.style("opacity", 0)
		.attr("id", "covline_hoverSpace")
		.on("mouseover", function() {
			_hoverLine.style("opacity", 1);
		})
		.on("mousemove", function() {
			let xStep = d3.select(this).attr("width") / (datesArray2.length - 1);
			let mouseRelative = (d3.mouse(this)[0] - trendLineDim.margin.left);
			let dateIndex = Math.round((mouseRelative / xStep));
			let hoveringDate = datesArray2[dateIndex];
			let hoveringX = x(hoveringDate);

			_hoverLine.attr("x1", hoveringX)
				.attr("x2", hoveringX);

			_hoverCircles.attr("cx", hoveringX)
				.attr("cy", function(d, i) {
					if ((data.values.length == datesArray2.length) && (clickedDose.indexOf(d.key) < 0)) {
						d3.select(this).style("opacity", 1);
						return y(Number(data.values[dateIndex][_option + "_" + d.key]));
					}
					else {
						for (let z = 0; z < data.values.length; z++) {
							if ((data.values[z].key == d3.timeFormat("%Y-%m-%d")(hoveringDate)) && (clickedDose.indexOf(d.key) < 0)) {
								d3.select(this).style("opacity", 1);
								return y(Number(data.values[z][_option + "_" + d.key]));
							}
						}
						d3.select(this).style("opacity", 0);
						return trendLineDim.margin.top;
					}

				});

			// legend.selectAll("rect")
			// 		.attr("x",function(){
			// 			if(hoveringX > (trendLineDim.width*0.75)){
			// 				return (trendLineDim.width*0.73);
			// 			}else{
			// 				return hoveringX + 10;
			// 			}
			// 		})

			legend.selectAll("text")
				// .attr("x",function(){
				// 	if(hoveringX > (trendLineDim.width*0.75)){
				// 		return (trendLineDim.width*0.73)+ legendDim.sqr+ legendDim.textPadding;
				// 	}else{
				// 		return (hoveringX  + 10 + legendDim.sqr+ legendDim.textPadding);
				// 	}
				// })
				.select("tspan")
				.text(function(d) {
					if (data.values.length == datesArray2.length) {
						return ": " + generateTxt(data.values[dateIndex][_option + "_" + d.key], _option)
					}
					else {
						for (let z = 0; z < data.values.length; z++) {
							if (data.values[z].key == d3.timeFormat("%Y-%m-%d")(hoveringDate)) {
								return ": " + generateTxt(data.values[z][_option + "_" + d.key], _option)
							}
						}
						return ": " + generateTxt("");
					}
				})

		})
		.on("mouseout", function() {
			_hoverLine.style("opacity", 0);
			_hoverCircles.style("opacity", 0);
			legend.selectAll("text").select("tspan").text("")

			legend.selectAll("rect").transition().duration(300).attr("x", legendDim.x)
			legend.selectAll("text").transition().duration(300).attr("x", function() {
				return legendDim.x + legendDim.sqr + legendDim.textPadding;
			})
		});

	let _hoverLine = hoverGroup.insert("line", "rect")
		.attr("id", "covline_hoverLine")
		.attr("x1", 100)
		.attr("y1", trendLineDim.margin.top)
		.attr("x2", 100)
		.attr("y2", (trendLineDim.height - trendLineDim.margin.bottom))
		.style("stroke-width", 2)
		.style("stroke", "#aaaaaa")
		.style("fill", "none")
		.style("opacity", 0);

	let _hoverCircles = hoverGroup.insert("g", "rect")
		.selectAll("circle")
		.data(vaxStat_arr)
		.enter()
		.append("circle")
		// .style("stroke",)
		.style("fill", function(d, i) {
			return greens3reverse[i];
		})
		.attr("class", "hoverCirles")
		.attr("id", function(d, i) {
			return "hoverCirle-" + i;
		})
		// .attr("id","hoverCirle-"+i)
		.attr("r", 7)
		.attr("cx", function(d, i) {
			return 50 // + (i*10)
		})
		.attr("cy", function(d, i) {
			return 50 + (i * 10)
		})
		.style("opacity", 0);

	//Axis
	let axis = svg.append("g")
		.attr("id", "axisGcovline");

	axis.append("g")
		.attr("id", "covline_y")
		.attr("transform", "translate(" + trendLineDim.margin.left + ",0)")
		.call(d3.axisLeft(y).ticks(5).tickFormat(function(d) {
			if (_option == "proptotal") {
				if (language == "en") {
					return generateTxt(d, "prop", 0);
				}
				else {
					return generateTxt(d, "prop", 0);
				}
			}
			else {
				return numberFormat(d);
			}
		}))
		.selectAll("text")
		.attr("class", "axisTextLabels")
		.attr("font-size", "16px")

	axis.append("g")
		.attr("id", "covline_x")
		.attr("transform", "translate(0," + (trendLineDim.height - trendLineDim.margin.bottom) + ")")
		.call(d3.axisBottom(x).tickValues(datesArray2).tickFormat(function(d) {
			return d3.timeFormat("%d %b %Y")(d);
		}))
		.selectAll("text")
		.attr("transform", "rotate(-45)")
		.style("text-anchor", "end")
		.attr("class", "axisTextLablez")
		// .attr("fill","red")
		.attr("dy", "1.2em")
		.attr("font-size", "16px");

	axis.append("text")
		.attr("font-size", "20px")
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle")
		.attr("y", function() {
			return trendLineDim.margin.left / 3;
		})
		.attr("x", function(d, i) {
			return 0;
		})
		.attr("transform", function() {
			return "translate(" + -25 + "," + ((trendLineDim.height / 2) - 50) + ")rotate(-90)";
		})
		.append("tspan")
		.attr("id", "covline_yAxisLabel")
		.text(function(d, i) {
			if (language == "en") {
				if (_option == "numtotal") {
					return "Cumulative number of people vaccinated";
				}
				else {
					return "Cumulative percent of people vaccinated";
				}
			}
			else {
				if (_option == "numtotal") {
					return "Nombre cumulatif de personnes vaccinées";
				}
				else {
					return "Pourcentage cumulatif  de personnes vaccinées";
				}
			}
		})

	axis.append("text")
		.attr("font-size", "16px")
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle")
		.attr("y", function() {
			return -10;
		})
		.attr("x", function(d, i) {
			return 0;
		})
		.attr("transform", function() {
			return "translate(" +
				(trendLineDim.width / 2) +
				"," + trendLineDim.height + ")";
		})
		.append("tspan")
		.attr("id", "covline_xAxisLabel")
		.text(function(d, i) {
			if (language == "en") {
				return "Report week";
			}
			else {
				//FRENCH
				return "Semaine de rapport";
			}
		})
	return 0;
}

function buildTables() {

	if (urlProduct == "cov") {
		//Create Data Table for Figure 1
		d3.selectAll(".fig1-table tbody").selectAll("td").remove();
		mapData.each(function(value, index) {
			value.each(function(value2, index2) {
				let currentRow = d3.selectAll(".fig1-table tbody").append("tr");
				currentRow.append("td")
					.attr("data-order", function() {
						return d3.timeFormat("%s")(parseTime(value2[0]["week_end"]));
					})
					.text(value2[0]["week_end"]);
				currentRow.append("td").attr("data-sort", value2[0].pruid).text(pruid2prov(value2[0].pruid));
				currentRow.append("td").text(generateTxt((value2[0].numtotal_atleast1dose), "num"));
				currentRow.append("td").text(generateTxt((value2[0].numtotal_partially), "num"));
				currentRow.append("td").text(generateTxt((value2[0].numtotal_fully), "num"));
				currentRow.append("td").text(generateTxt(value2[0].proptotal_atleast1dose, "prop"));
				currentRow.append("td").text(generateTxt(value2[0].proptotal_partially, "prop"));
				currentRow.append("td").text(generateTxt(value2[0].proptotal_fully, "prop"));
			})
		})

		d3.selectAll(".covline-table tbody").selectAll("td").remove();
		mapData.each(function(value, index) {
			value.each(function(value2, index2) {
				let currentRow = d3.selectAll(".covline-table tbody").append("tr");
				currentRow.append("td")
					.attr("data-order", function() {
						return d3.timeFormat("%s")(parseTime(value2[0]["week_end"]));
					})
					.text(value2[0]["week_end"]);
				currentRow.append("td").attr("data-sort", value2[0].pruid).text(pruid2prov(value2[0].pruid));
				currentRow.append("td").text(generateTxt((value2[0].numtotal_atleast1dose), "num"));
				currentRow.append("td").text(generateTxt((value2[0].numtotal_partially), "num"));
				currentRow.append("td").text(generateTxt((value2[0].numtotal_fully), "num"));
				currentRow.append("td").text(generateTxt(value2[0].proptotal_atleast1dose, "prop"));
				currentRow.append("td").text(generateTxt(value2[0].proptotal_partially, "prop"));
				currentRow.append("td").text(generateTxt(value2[0].proptotal_fully, "prop"));
			})
		})

		//Create Data Table for Figure 3 & Figure 4
		d3.selectAll(".fig34-table tbody").selectAll("td").remove();
		keyPop_nestedData.forEach(function(value, index) {
			value.values.forEach(function(value2, index2) {
				let currentRow = d3.selectAll(".fig34-table tbody").append("tr");
				currentRow.append("td").text(function() {
					if (language == "en") {
						return value2.priority_group_en;
					}
					else {
						return value2.priority_group_fr;
					}
				})
				currentRow.append("td")
					.attr("data-order", function() {
						return d3.timeFormat("%s")(parseTime(value2.week_end));
					})
					.text(function() {
						return value2.week_end;
					})
				currentRow.append("td").text(function() {
					return numberFormat(value2.numtotal_atleast1dose);
				})
				currentRow.append("td").text(function() {
					return numberFormat(value2.numtotal_partially);
				})
				currentRow.append("td").text(function() {
					return numberFormat(value2.numtotal_fully);
				})
				currentRow.append("td").text(function() {
					return generateTxt(value2.prop_atleast1dose, "prop");
				})
				currentRow.append("td").text(function() {
					return generateTxt(value2.prop_partially, "prop");
				})
				currentRow.append("td").text(function() {
					return generateTxt(value2.prop_fully, "prop");
				})
				// currentRow.append("td").text(function(){
				// return numberFormat(value2.numweekdelta_atleast1dose);
				// })
				// currentRow.append("td").text(function(){
				// return numberFormat(value2.numweekdelta_partially);
				// })
				// currentRow.append("td").text(function(){
				// return numberFormat(value2.numweekdelta_fully);
				// })
				// currentRow.append("td").text(function(){
				// return percentFormat(value2.propweekdelta_atleast1dose);
				// })
				// currentRow.append("td").text(function(){
				// return percentFormat(value2.propweekdelta_partially);
				// })
				// currentRow.append("td").text(function(){
				// return percentFormat(value2.propweekdelta_fully);
				// })
			})
		})

		//Create Data Table for Figure by Age and Sex
		d3.select("#fig5-table tbody").selectAll("td").remove();
		nestedData_bySex.forEach(function(value, index) {
			let currentPRUID = pruid2prov(+value.key);

			value.values[value.values.length - 1].values.forEach(function(value2, index) {
				let currentSex = value2.key;
				let currentSexSum_partialOrFull = 0;
				let currentSexSum_partial = 0;
				let currentSexSum_full = 0;
				let currentSexSum_prop_partialOrFull = 0;
				let currentSexSum_prop_partial = 0;
				let currentSexSum_prop_full = 0;
				let currentAge_denominator = 0;
				value2.values.forEach(function(value3, index) {
					let currentRow = d3.select("#fig5-table tbody").append("tr");
					let currentAge = value3.key;
					if (!isNaN(value3.value.population)) {
						currentAge_denominator += +value3.value.population;
					}
					else {
						currentAge_denominator += 0;
					}
					currentSexSum_partialOrFull += +value3.value.numtotal_atleast1dose;
					currentSexSum_partial += +value3.value.numtotal_partially;
					currentSexSum_full += +value3.value.numtotal_fully;

					if (isNaN(value3.value.prop_atleast1dose)) {}
					else {
						currentSexSum_prop_partialOrFull += +value3.value.prop_atleast1dose;
					}
					currentSexSum_prop_partial += +value3.value.prop_partially;
					if (isNaN(value3.value.prop_fully)) {}
					else {
						currentSexSum_prop_full += +value3.value.prop_fully;
					}

					currentRow.append("td").text(function() {
						return currentPRUID;
					})
					currentRow.append("td").text(function() {
						return short2txt(currentSex);
					})
					currentRow.append("td").text(function() {
						if (currentAge == "Unknown" && language == "fr") {
							return "Inconnu";
						}
						else if (currentAge == "Not reported" && language == "fr") {
							return "Non rapporté";
						}
						else {
							return currentAge;
						}
					})
					currentRow.append("td").text(function() {
						return generateTxt(value3.value.numtotal_atleast1dose, "num");
					})
					currentRow.append("td").text(function() {
						if (value3.value.numtotal_partiallyrange != "") {
							let _rangeTxt = (Number(value3.value.numtotal_partially) +
								Number(value3.value.numtotal_partiallyrange));
							let titleValTable;
							if (isNaN(_rangeTxt)) {
								titleValTable = generateTxt("");
							}
							else {
								titleValTable = generateTxt(value3.value.numtotal_partially, "num") + "-" + generateTxt(_rangeTxt, "num");
							}
							return titleValTable;
						}
						else {
							return generateTxt(value3.value.numtotal_partially, "num");
						}
					})
					currentRow.append("td").text(function() {
						if (value3.value.numtotal_fullyrange != "") {
							let _rangeTxt = (Number(value3.value.numtotal_fully) +
								Number(value3.value.numtotal_fullyrange));
							let titleValTable;
							if (isNaN(_rangeTxt)) {
								titleValTable = generateTxt("");
							}
							else {
								titleValTable = generateTxt(value3.value.numtotal_fully, "num") + "-" + generateTxt(_rangeTxt, "num");
							}
							return titleValTable;
						}
						else {
							return generateTxt(value3.value.numtotal_fully, "num");
						}
					})

					currentRow.append("td").text(function() {
						return generateTxt(value3.value.prop_atleast1dose, "prop");
					})
					currentRow.append("td").text(function() {
						if (value3.value.prop_partiallyrange != "") {
							let _rangeTxt = (Number(value3.value.prop_partially) +
								Number(value3.value.prop_partiallyrange));
							let titleValTable;
							if (isNaN(_rangeTxt)) {
								titleValTable = generateTxt("");
							}
							else {
								titleValTable = generateTxt(value3.value.prop_partially, "prop") + "-" + generateTxt(_rangeTxt, "prop");
							}
							return titleValTable;
						}
						else {
							return generateTxt(value3.value.prop_partially, "prop");
						}
					})
					currentRow.append("td").text(function() {
						if (value3.value.prop_fullyrange != "") {
							let _rangeTxt = (Number(value3.value.prop_fully) +
								Number(value3.value.prop_fullyrange));
							let titleValTable;
							if (isNaN(_rangeTxt)) {
								titleValTable = generateTxt("");
							}
							else {
								titleValTable = generateTxt(value3.value.prop_fully, "prop") + "-" + generateTxt(_rangeTxt, "prop");
							}
							return titleValTable;
						}
						else {
							return generateTxt(value3.value.prop_fully, "prop");
						}
					})
				})
			})
		})

		//Create Data Table for Figure By Vaccine Type 
		d3.select("#fig6-table tbody").selectAll("td").remove();
		nestedData_byVac.forEach(function(value, index) {
			let currentPRUID = value.key;
			value.values.forEach(function(value2, index2) {
				let currentDate = value2.key;
				value2.values.forEach(function(value3, index3) {
					let currentRow = d3.select("#fig6-table tbody").append("tr");
					let currentProduct = value3.key;
					currentRow.append("td")
						.attr("data-order", function() {
							return d3.timeFormat("%s")(parseTime(currentDate));
						}).text(currentDate);
					currentRow.append("td").text(pruid2prov(currentPRUID));
					if (currentProduct == "Not reported" || currentProduct == "Unknown") {
						currentProduct = short2txt(currentProduct);
					}
					currentRow.append("td").text(currentProduct);
					currentRow.append("td").text(generateTxt(value3.value.table_numtotal_atleast1dose, "num"));
					if (isNaN(value3.value.table_numtotal_partially) && value3.value.table_numtotal_partially != "na") {
						currentRow.append("td").text(value3.value.table_numtotal_partially);
					}
					else {
						currentRow.append("td").text(generateTxt(value3.value.table_numtotal_partially, "num"));
					}
					currentRow.append("td").text(generateTxt(value3.value.table_numtotal_fully, "num"));
					currentRow.append("td").text(generateTxt(value3.value.table_prop_atleast1dose, "prop"));
					if (isNaN(value3.value.table_prop_partially) && value3.value.table_prop_partially != "na") {
						currentRow.append("td").text(value3.value.table_prop_partially);
					}
					else {
						currentRow.append("td").text(generateTxt(value3.value.table_prop_partially, "prop"));
					}
					currentRow.append("td").text(generateTxt(value3.value.table_prop_fully, "prop"));
				})
			})
		})
	}
	else {
		d3.select("#map-administered-table tbody").selectAll("tr").remove();
		mapDataAdmin.each(function(value, index) {
			value.each(function(value2, index2) {
				if (value2[0].pruid != "99") {
					let currentRow = d3.select("#map-administered-table tbody").append("tr");
					currentRow.append("td")
						.attr("data-order", function() {
							return d3.timeFormat("%s")(parseTime(value2[0].date));
						})
						.attr("data-sort", value2[0].date)
						.text(value2[0].date);
					currentRow.append("td").text(pruid2prov(value2[0].pruid));
					currentRow.append("td").text(numberFormat(value2[0].numtotal_all_administered));
				}
			})
		})
		
		d3.select("#map-distribution-table tbody").selectAll("tr").remove();
		mapDataDist.each(function(value, index) {
			value.each(function(value2, index2) {
				if (value2.key != "99") { // we could consider leaving 99 (federal allocation) in the table
					let currentRow = d3.select("#map-distribution-table tbody").append("tr");
					currentRow.append("td")
						.attr("data-order", function() {
							return d3.timeFormat("%s")(parseTime(value2[0].date));
						})
						.attr("data-sort", value2[0].date)
						.text(value2[0].date);
					currentRow.append("td").text(pruid2prov(value2[0].pruid));
					currentRow.append("td").text(numberFormat(value2[0].numtotal_pfizerbiontech_distributed));
					currentRow.append("td").text(numberFormat(value2[0].numtotal_moderna_distributed));
					currentRow.append("td").text(numberFormat(value2[0].numtotal_astrazeneca_distributed));
					currentRow.append("td").text(numberFormat(value2[0].numtotal_all_distributed));
				}
			})
		})
		
		// forecast plot
		// set the dimensions and margins of the graph
		var fdmargin = {top: 10, right: 30, bottom: 30, left: 60},
		    fdwidth = 460 - fdmargin.left - fdmargin.right,
		    fdheight = 400 - fdmargin.top - fdmargin.bottom;
		
		// append the svg object to the body of the page
		var fdsvg = d3.select("#fcstdistplot")
		  .append("svg")
		    .attr("width", fdwidth + fdmargin.left + fdmargin.right)
		    .attr("height", fdheight + fdmargin.top + fdmargin.bottom)
		  .append("g")
		    .attr("transform",
		          "translate(" + fdmargin.left + "," + fdmargin.top + ")");
		console.log(chartDataFcst)
		var canFcst = chartDataFcst.filter(function(d) {
			return d.key == 1; 
		});
		console.log(canFcst.date)

		// //Read the data
		// d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/connectedscatter.csv",
		//   // When reading the csv, I must format variables:
		//   function(d){
		//     return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
		//   },
		//   // Now I can use this dataset:
		//   function(data) {
		//     // Add X axis --> it is a date format
		//     var fdx = d3.scaleTime()
		//       .domain(d3.extent(data, function(d) { return d.date; }))
		//       .range([ 0, fdwidth ]);
		//     fdsvg.append("g")
		//       .attr("transform", "translate(0," + fdheight + ")")
		//       .call(d3.axisBottom(fdx));
		//     // Add Y axis
		//     var fdy = d3.scaleLinear()
		//       .domain( [8000, 9200])
		//       .range([ fdheight, 0 ]);
		//     fdsvg.append("g")
		//       .call(d3.axisLeft(fdy));
		//     // Add the line
		//     fdsvg.append("path")
		//       .datum(data)
		//       .attr("fill", "none")
		//       .attr("stroke", "#69b3a2")
		//       .attr("stroke-width", 1.5)
		//       .attr("d", d3.line()
		//         .fdx(function(d) { return fdx(d.date) })
		//         .fdy(function(d) { return fdy(d.value) })
		//         )
		//     // Add the points
		//     fdsvg
		//       .append("g")
		//       .selectAll("dot")
		//       .data(data)
		//       .enter()
		//       .append("circle")
		//         .attr("cx", function(d) { return fdx(d.date) } )
		//         .attr("cy", function(d) { return fdy(d.value) } )
		//         .attr("r", 5)
		//         .attr("fill", "#69b3a2")
		//   })
		
		//forecast table
		d3.select("#forecast-table tbody").selectAll("tr").remove();
		mapDataFcst.each(function(value, index) {
			value.each(function(value2, index2) {
				if (value2.key != "99") { // we could consider leaving 99 (federal allocation) in the table
					let currentRow = d3.select("#forecast-table tbody").append("tr");
					currentRow.append("td")
						.attr("data-order", function() {
							return d3.timeFormat("%s")(parseTime(value2[0].forecast_week));
						})
						.attr("data-sort", value2[0].forecast_week)
						.text(value2[0].forecast_week);
					currentRow.append("td").text(pruid2prov(value2[0].pruid));
					currentRow.append("td").text(
						isNaN(value2[0].numtotal_pfizerbiontech_forecasted) ? "" : numberFormat(value2[0].numtotal_pfizerbiontech_forecasted)
					);
					currentRow.append("td").text(
						isNaN(value2[0].numtotal_moderna_forecasted) ? "" : numberFormat(value2[0].numtotal_moderna_forecasted)
					);
					currentRow.append("td").text(
						isNaN(value2[0].numtotal_astrazeneca_forecasted) ? "" : numberFormat(value2[0].numtotal_astrazeneca_forecasted)
					);
					currentRow.append("td").text(
						isNaN(value2[0].numtotal_all_forecasted) ? "" : numberFormat(value2[0].numtotal_all_forecasted)
					);
				}
			})
		})
	}
}
