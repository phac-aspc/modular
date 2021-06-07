function pruid2prov(pruid){
var pruid2provLookup = {
        99:"Repatriated Travellers",
        59:"British Columbia",
        48:"Alberta",
        47:"Saskatchewan",
        46:"Manitoba",
        35:"Ontario",
        24:"Quebec",
        10:"Newfoundland and Labrador",
        13:"New Brunswick",
        12:"Nova Scotia",
        11:"Prince Edward Island",
        61:"Northwest Territories",
        62:"Nunavut",
        60:"Yukon",
        99:"Repatriated",
        1:"Canada"
    }
    var pruid2provLookupFr = {
        99:"Voyageurs Rapatriés",
        59:"Colombie-Britannique",
        48:"Alberta",
        47:"Saskatchewan",
        46:"Manitoba",
        35:"Ontario",
        24:"Québec",
        10:"Terre-Neuve-et-Labrador",
        13:"Nouveau-Brunswick",
        12:"Nouvelle-Écosse",
        11:"Île-du-Prince-Édouard",
        61:"Territoires du Nord-Ouest",
        62:"Nunavut",
        60:"Yukon",
        99:"Rapatriés",
        1:"Canada"
    }
    
    if(language == "en"){
        return pruid2provLookup[pruid];
    }else{
        return pruid2provLookupFr[pruid];
    }
} 

function prov2pruid(prov){
    var prov2pruidLookup = {
        "BC":59,
        "AB":48,
        "SK":47,
        "MB":46,
        "ON":35,
        "QC":24,
        "NL":10,
        "NB":13,
        "NS":12,
        "PE":11,
        "NT":61,
        "NU":62,
        "YT":60,
        "Canada":1,
        "British Columbia":59,
        "Alberta":48,
        "Saskatchewan":47,
        "Manitoba":46,
        "Ontario":35,
        "Quebec":24,
        "Newfoundland and Labrador":10,
        "New Brunswick":13,
        "Nova Scotia":12,
        "Prince Edward Island":11,
        "Northwest Territories":61,
        "Nunavut":62,
        "Yukon":60,
		"Colombie-Britannique":59,
		"Québec":24,
		"Terre-Neuve-et-Labrador":10,
		"Nouveau-Brunswick":13,
		"Nouvelle-Écosse":12,
		"Île-du-Prince-Édouard":11,
		"Territoires du Nord-Ouest":61		
    }
    return prov2pruidLookup[prov];
}

let isIE2 = /*@cc_on!@*/ false || !!document.documentMode;
if (/Edge\/\d./i.test(navigator.userAgent)){
	isIE2 = true;
}
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
		"months": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "aoÃ»t", "septembre", "octobre", "novembre", "décembre"],
		"shortMonths": ["jan", "fév", "mar", "avr", "mai", "jui", "jul", "aoÃ»", "sep", "oct", "nov", "déc"],
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

var currentDate2;
var timeData3;


const ordinalSuffixes2 = ['th', 'st', 'nd', 'rd'];

function ordinalSuffix(number) {
	const value = number % 100;
	return ordinalSuffixes2[(value - 20) % 10] || ordinalSuffixes2[value] || ordinalSuffixes2[0];
}

//ON PROD
var HRmap_shapes = "/src/json/weather-dashboard/HybridRegionalHeathBoundaries-m.json";

var find_HRUID;
var find_website;
var find_CGNDB;
var mapTopo;

var find_postal;
var find_census;
var mobility;
var fluwatchers;

var tiles_arr = [];


var csvfiles = [
	'/src/data/covidLive/covidTrends/covid19-healthregions-hruid.csv',
	'/src/data/covidLive/covidTrends/file_out_v5_MZ7v2.csv',
	'/src/data/covidLive/vaccination-coverage-map.csv',
	'/src/data/covidLive/covidTrends/fluwatchers.csv',
	'/src/data/covidLive/covidTrends/mobility.csv',
	'/src/data/covidLive/covidTrends/hr_websites.csv',
	'/src/data/covidLive/covidTrends/FSA_HR2018.csv',
	'/src/data/covidLive/covidTrends/censusdistricts.csv',
	'/src/data/covidLive/vaccination-coverage-updateDate.csv'
	]

var qs = getURLparameters(window.location.href);

if(qs["source"]){
	if(qs["source"].toLowerCase() === "weathercan"){
		//load page for WeatherCAN
		
		//remove search box...
		d3.select("#searchRegion").remove();
		
		let filesToLoad = csvfiles.slice(0,6);
			filesToLoad.push('/src/data/covidLive/covidTrends/locationToHRUID/'+ qs["location"][0] +'.csv');
		
		let promises = [];
		filesToLoad.forEach(function(url) {
		    promises.push(d3.csv(url))
		});
		
		Promise.all(promises).then(function(values) {
		    processHRUIDLookup(values[0]);
		    processCSVLoad(values[1]);
		    processVaccination(values[2]);
		    processFluWatchers(values[3]);
		    processMobility(values[4]);
		    processWebsites(values[5]);
		    processPlacesToHR(values[6])
		    processVaxUpdateDate(values[8]);
		}).then(function(){
			d3.json(HRmap_shapes,function(d){
				return d;
			}).then(function(data){
				mapTopo = topojson.feature(data, data.objects["NewHybridRegionalHeathBoundaries"]);
				
				if(qs["location"]){
					let _hr = find_CGNDB[qs["location"]]; 
					let _color;
					if(!_hr){
						_hr = "1";
						_color = "red";
					}else{
						_color = getColour();
					}
					
					let tileData = tileDataAssembly(_hr);
					
					buildPanel_4_weatherCan(tileData,_color);
				}else{
					buildPanel_4_weatherCan({"HR_UID": "1", "ENGNAME": "Canada", "FRENAME": "Canada"}, "red")
				}
			});
		});
		
	}else if(qs["source"].toLowerCase() === "thrive"){
		//load page for Thrive
		
		let filesToLoad = csvfiles.slice(0);
		
		let promises = [];
		filesToLoad.forEach(function(url) {
		    promises.push(d3.csv(url))
		});
		
		Promise.all(promises).then(function(values) {
		    processHRUIDLookup(values[0]);
		    processCSVLoad(values[1]);
		    processVaccination(values[2]);
		    processFluWatchers(values[3]);
		    processMobility(values[4]);
		    processWebsites(values[5]);
			processPostalLookup(values[6]);
			processCensusDistrictLookup(values[7]);
		}).then(function(){
			d3.json(HRmap_shapes,function(d){
				return d;
			}).then(function(data){
				mapTopo = topojson.feature(data, data.objects["NewHybridRegionalHeathBoundaries"]);
				
				if(qs["location"]){
					let qs_locationARR = qs["location"].split(",");
					
					qs_locationARR.forEach(function(value,index){
						let _hr = value; //find_CGNDB[qs["location"]]; 
						let _color;
						if(!_hr){
							_hr = "1";
							_color = "red";
						}else{
							_color = getColour();
						}
						
						let tileData = tileDataAssembly(_hr);
						
						buildPanel_4_thrive(tileData,_color);
					})

				}else{
					buildPanel_4_thrive({"HR_UID": "1", "ENGNAME": "Canada", "FRENAME": "Canada"}, "red")
				}
			});
		});
	}
}else{
	//has no source ...load generic?
}


//Processors...
var vaxUpdateDate;
function processVaxUpdateDate(data){
	vaxUpdateDate = data["columns"][0];
	console.log(vaxUpdateDate)
}

var vaxData;
function processVaccination(data){
	vaxData = d3.nest()
			.key(function(d){
	            return d["pruid"];
	        })
	        .key(function(d){
	        	return d["week_end"];
	        })
	        .entries(data)
	
	//update table time
	d3.select("#vaxDate").select("span").text(function(){
		return d3.timeFormat("%B %d, %Y")(d3.timeParse("%Y-%m-%d")(vaxData[0].values[(vaxData[0].values.length - 1)].key));
	})
	
	return 0;
}

function processPlacesToHR(data){
	find_CGNDB = d3.nest()
						.key(function(d) {
						    return d.CGNDB_ID;
						})
						.sortKeys(d3.ascending)
						.rollup(function(d){
							return d[0]["HR_UID"];
						})
						.object(data);
}

function processHRUIDLookup(data){
    find_HRUID = d3.nest().key(function(d) { return d.Province })
	  .sortKeys(d3.ascending)
	  .key(function(d) { return d.health_region })
	  .sortKeys(d3.ascending)
	  .object(data);
}

function processCSVLoad(data){
	data.forEach(function(d) {
		d.numtotal = +d.cumulative_cases;
		d.numdeaths = +d.cumulative_deaths;
		d.numtoday = +d.cases;
		d.numdeathstoday = +d.deaths;
		d.numtotal_last14 = +d.numtotal_last14;
		d.numdeaths_last14 = +d.numdeaths_last14;
		d.cumulative_cases = +d.cumulative_cases; 
		d.cumulative_deaths = +d.cumulative_deaths;
		
		if(d.health_region == "Not Reported"){
			return;
		}else{
			d.ratetotal = +d.cumulative_cases/find_HRUID[d.province][d.health_region][0].pop*100000;
			d.ratedeaths = +d.cumulative_deaths/find_HRUID[d.province][d.health_region][0].pop*100000;
			
			d.ratetoday = +d.cases/find_HRUID[d.province][d.health_region][0].pop*100000;
			d.ratedeathstoday = +d.deaths/find_HRUID[d.province][d.health_region][0].pop*100000;
			
			d.ratetotal_last14= +d.numtotal_last14/find_HRUID[d.province][d.health_region][0].pop*100000;
			d.ratedeaths_last14 = +d.numdeaths_last14/find_HRUID[d.province][d.health_region][0].pop*100000;
			d.HRUID = find_HRUID[d.province][d.health_region][0].HR_UID;
		}
	});
	
	var datesArray2 = [];
	timeData3 = d3.nest()
		.key(function(d) { return d.HRUID; }).sortKeys(d3.ascending)
		.key(function(d) { if (datesArray2.indexOf(d.date_report) < 0) { datesArray2.push(d.date_report); } return d.date_report; })
		.object(data);
		currentDate2 = datesArray2[datesArray2.length - 1];
	
	
    $(".updateTime").text(currentDate2);
	$(".dateModified").text(currentDate2);

	data.forEach(function(d){
		d.trend = timeData3[d.HRUID];
	});
	
		
}

function processPostalLookup(data){
	find_postal = d3.nest().key(function(d) { return d.FSA })
							   .object(data);
							   
	// byHRUID = d3.nest().key(function(d) { return d.HR_UID })
	// 						   .object(data);

}


function processCensusDistrictLookup (data){
    
	find_census = d3.nest().key(function(d) { return d.CSDName })
							   .object(data);
	   
	d3.select("#postalCode").attr("list", "")
	let ieSelect;
	if(isIE2){
		ieSelect = d3.select("#suggestions").append("select").attr("id", "ieSuggestions")
		ieSelect.append("option").text("Canada")
		
		Object.keys(find_census).sort().forEach(function(d,i){
		let curProv = "";
			find_census[d].forEach(function(e,j){
				//instead of PRAbbr we can use pruid2prov(PR) for full names
				if(curProv != e["PRAbbr"]){
					ieSelect.append("option").text(e["CSDName"]+", "+e["PRAbbr"]);
					curProv = e["PRAbbr"];
				}
			})
		
	})
	}
	else{
	d3.select("#suggestions").append("option").text("Canada")
	Object.keys(find_census).sort().forEach(function(d,i){
		let curProv = "";
			find_census[d].forEach(function(e,j){
				//instead of PRAbbr we can use pruid2prov(PR) for full names
				if(curProv != e["PRAbbr"]){
					d3.select("#suggestions").append("option").text(e["CSDName"]+", "+e["PRAbbr"]);
					curProv = e["PRAbbr"];
				}
			})
		
	})
	}
	
	find_census = d3.nest().key(function(d) { return d.CSDName })
							.key(function(d) { return d.PRAbbr })
							   .object(data);

		d3.select("#postalCode").on("keyup", function(){
		if(!isIE2){
		let postalText = d3.select(this).node().value;
		if(postalText.length >= 2){
			d3.select("#postalCode").attr("list", "suggestions")
			var input = d3.select(this).node(),
	       val = input.value,
	       options = document.getElementById("suggestions").childNodes;

		  for(var i = 0; i < options.length; i++) {
		    if(options[i].innerText === val) {
		      		$("#searchPostal").click();
		      break;
		    }
		  }
		}
		else{
			d3.select("#postalCode").attr("list", "")
		}
		}//if ie
		else{
			let postalText = d3.select(this).node().value;
		if(postalText.length >= 2){
			d3.select("#postalCode").attr("list", "suggestions")
			var input = d3.select(this).node(),
	       val = input.value,
	       options = document.getElementById("ieSuggestions").childNodes;

		  for(var i = 0; i < options.length; i++) {
		    if(options[i].innerText === val) {
		      		$("#searchPostal").click();
		      break;
		    }
		  }
		}
		else{
			d3.select("#postalCode").attr("list", "")
		}
		}//not ie
	})
	.on("keypress", function() {
        if(d3.event.keyCode === 13){
	    	$("#searchPostal").click();
        }
    })
    
    $(window).scroll(function() {
		$("#postalCode").blur();
    });

	//for search box.........
	$("#searchPostal").on("click",function(){
		if($("#postalCode").val().length>0){
			//input ok
			let _str = $("#postalCode").val();
			let _2ndDig = Number(_str[1]);
			let selectedHR = [];
			let _arr = [];
			if(_str.toUpperCase() == "CANADA"){
				buildPanel_4_thrive({"HR_UID": "1", "ENGNAME": "Canada", "FRENAME": "Canada"}, "red")
			}
			else if(Number.isInteger(_2ndDig)){
				//find by postal code
				let _fsa = (_str.toUpperCase()).substr(0,3);
				if(find_postal[_fsa]){
					selectedHR = find_postal[_fsa]; 
				}else{
					//not found
				}
			}else{
				let _strArr;
				let prov;
				_strArr = _str.split(", ")
				prov = _strArr.pop();
				if(find_census[_strArr.join(", ")]){
					selectedHR = find_census[_strArr.join(", ")][prov];
				}else{
					//not found
				}
			}
			if(selectedHR.length != 0 ){
				selectedHR.forEach(function(d, i){
					if(tiles_arr.indexOf(d["HR_UID"]) < 0){

	    			let curColor = getColour();
	    			d3.select("#feature-"+d["HR_UID"])
					  .style("opacity", 1)
					  .style("fill", curColor)
					  .style("stroke", curColor);
	    			
	    			buildPanel_4_thrive(d,curColor);
	    			_arr.push(d["HR_UID"]);
					}
	    		});
	    		
			}	
		}else{
			//no input
		}
	})

}


function processWebsites(data){
	find_website = d3.nest()
					  .key(function(d) { return d.HR_UID })
					  .sortKeys(d3.ascending)
					  .object(data);
}

function processFluWatchers(data){
	fluwatchers = d3.nest()
					  .key(function(d) { return d.HR_UID })
					  .sortKeys(d3.ascending)
					  .object(data);
					  //console.log("FluWatchers: ",fluwatchers);
}

function processMobility(data){
	mobility = d3.nest()
					  .key(function(d) { return d.HCR_id })
					  .sortKeys(d3.ascending)
					  .object(data);
					  //console.log("Mobility: ",mobility);
}

jQuery.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = new MouseEvent("mouseup");
    e.dispatchEvent(evt);
  });
};


function buildPanel_4_weatherCan(data,colour){
	// buildTable(data,colour);
		
	//===========================================================================
		
	let tile = d3.select("#tileSection")
			 .append("section")
			 .style("box-shadow","none")
			 .attr("class", "panel")
			 .attr("id", "tile-"+ data["HR_UID"])
	
				
	let tileHead = tile.append("header")
					.attr("class","panel-heading text-center");
		
		tileHead.append("h2")
				//.attr("class","panel-title")				
				.style("display", "block")
				.style("margin-top","0")
				.text(function(){
					if((data["HR_UID"] == 1) || (language == "en")){
						return data["ENGNAME"];
					}else{
						if(data["FRENAME"]!=""){
							return data["FRENAME"];
						}else{
							return data["ENGNAME"];
						}
						
					}
				})
		
	let thumbnail = tileHead.append("svg")
					.attr("class","mapThumbnail adjust")
					.attr("height","100px")
					.attr("width","100px")
					.attr("id",function(){
						return "Section_thumbnail-"+data["HR_UID"]+"";
					})
					.style("display","inline-block");
	
		if(data["HR_UID"] != 1){
			tileHead.select("h2")
				.append("small")
				.text(function(){
					if(data["Prov"]){
						//console.log(data["Prov"]);
						return " ("+data["Prov"]+")"
					}else{
						//Prov is empty
					}
				})
		}
			
		
		let tileBody_top = tile.append("div") //THIS IS -> centerColumn_Left
							.attr("class","panel-body")
							.style("position","relative")
							.style("border-top","1px solid #ddd")
							.style("border-top-right-radius","3px")
							.style("border-top-left-radius","3px");
		
		let tileBody_bottom = tile.append("div") //THIS IS -> centerColumn_Right
							.attr("class","panel-body")
							.style("border-top","1px solid #ddd")
							.style("border-top-right-radius","3px")
							.style("border-top-left-radius","3px");
		
		let tileBody_vax = tile.append("div") //THIS IS -> vaccination coverage
							.attr("class","panel-body")
							// .style("position","relative")
							.style("border-top","1px solid #ddd")
							.style("border-top-right-radius","3px")
							.style("border-top-left-radius","3px");	
							
		let tileFooter = tile.append("footer")
				.attr("class","panel-footer text-center")
				// .style("margin-top","0")
				// .style("margin-bottom","0")
				.style("background-color","#fbfbfb")
									
			if(data["HR_UID"] != 1){
				thumbnail.append("g")
						 .append("path")
						 .attr("d",buildThumbnailShape(data["HR_UID"]))
						 .style("fill-opacity", 0.4)
	    				 .style("fill", colour)
	    				 .style("stroke", colour);
			}else{
				thumbnail.attr("viewBox","-70 -50 600 600")
						 .append("g")
						 .append("path")
						 .style("fill-opacity",0.4)
						 .style("fill","red")
						 .style("stroke","red")
						 .style("stroke-width","10px")
						 .attr("d","m495.418 146.225-83.042 19.497-4.409-52.266-66.698 60.703 19.321-120.659-57.056 20.039-47.534-73.539-47.534 73.539-57.056-20.039 19.321 120.659-66.698-60.703-4.409 52.266-83.042-19.497 28.696 89.179-45.278 21.577 128.397 99.961-14.238 57.32 126.841-20.633v118.371h30v-118.371l126.841 20.633-14.238-57.32 128.397-99.961-45.278-21.577z")
			}
									
	if(true){//check vax data
		let _panel_body_3 = tileBody_vax.append("div")
									.attr("class","row")
									.style("text-align","center")
									.attr("id","trendStats");
		let _region_vaxData;
		let regionToSearch;
		console.log(data)
		if(data["HR_UID"] == "1"){
			regionToSearch = "1";
		}else{
			if(data["Prov"]){
				if(Number.isInteger(Number(data["Prov"]))){
					regionToSearch = data["Prov"];
				}else{
					regionToSearch = prov2pruid(data["Prov"]);
				}
			}else if(data["PR"]){
				regionToSearch = data["PR"];
				console.log(data["Prov"])
			}else{
				regionToSearch = "1";
			}
		}
		
		for(let i=0; i<vaxData.length; i++){
			if(vaxData[i].key == regionToSearch){
				_region_vaxData = vaxData[i];
				break;
			}
		}	
		console.log(_region_vaxData)
		console.log(regionToSearch);
		let _panel_body_3_vax_title = _panel_body_3.append("h3")
													// .attr("class","h3")
													.style("text-align","center")
													.style("margin-top","5px")
													.text(function(){
														if(language == "en"){
															return "Population vaccinated in ";
														}else{
															return "Population vaccinée en ";
														}
													});
		
		_panel_body_3_vax_title.append("span")
								.style("color",colour)
								.append("strong")
								.text(function(){
									if(data["Prov"]){
										
										return data["Prov"];
									}else if(data["PR"]){
										return pruid2prov(data["PR"])
									}else{
										//Prov is empty
										if(data["HR_UID"] == "1"){
											return "Canada";
										}
									}
								})
								
		let _panel_body_3_vaxText  = _panel_body_3.append("div")
													.attr("class","col-xs-12")
													.attr("id","vaccination")
													
		let vaxData_text = _panel_body_3_vaxText.append("p")
												.style("line-height","1.2")
												.style("text-align","start")
												
		let _vaxSpan =	vaxData_text.append("span")
							.attr("class","h4")
							.style("display","inline-block")
							.style("margin-bottom","0px")
							.style("margin-top","15px")
							.text(function(){
								let val = _region_vaxData.values[(_region_vaxData.values.length - 1)].values[0]["proptotal_atleast1dose"];
								if(language == "en"){
									return d3.format(".1f")(val) + "%";
								}else{
									return d3.format(".1f")(val) + " %";
								}
							});
							
		vaxData_text.append("small")
					// .style("font-size","0.8em")
					.text(function(){
							if(language == "en"){
								return " of the population has received at least one dose of a COVID-19 vaccine as of " + d3.timeFormat("%B %d, %Y")(d3.timeParse("%Y-%m-%d")(vaxData[0].values[(vaxData[0].values.length - 1)].key)); //May 22, 2021"
							}else{
								return " de la population ayant reçu au moins une dose d'un vaccin contre la COVID-19 en date du " + d3.timeFormat("%B %d, %Y")(d3.timeParse("%Y-%m-%d")(vaxData[0].values[(vaxData[0].values.length - 1)].key)); //22 mai 2021"
							}
					})
									
		//VACCINATION COVERAGE							
		let updateFreq_3 = tileBody_vax.append("div")
									.attr("class","row pull-right")
									.append("div")
									.attr("class","col-sm-12")
									.append("small")
									.attr("class","xsmall")
									.style("font-size",function(){
										if(language == "en"){
											return "0.8em";
										}else{
											return "0.65em"
										}	
									})
									.style("color","#b3b3b3")
									//HARDCODED
									.text(function(){
										if(language == "en"){
											return "updated weekly: May 28, 2021"//+ d3.timeFormat("%B %d, %Y")(d3.timeParse("%Y-%m-%d")(_region_vaxData.values[(_region_vaxData.values.length - 1)].key));+""
										}else{
											return "mise à jour hebdomadaire : le 28 mai 2021"//+ d3.timeFormat("%B %d, %Y")(d3.timeParse("%Y-%m-%d")(_region_vaxData.values[(_region_vaxData.values.length - 1)].key))+""//
										}
									});
									//DYNAMIC
									// .text(function(){
									// 	if(language == "en"){
									// 		return "updated weekly: "+ d3.timeFormat("%B %d, %Y")(d3.timeParse("%Y-%m-%d")(vaxUpdateDate));//May 28, 2021" //timeFormat(timeParser(mobility[data["HR_UID"]][0].wk_day_1)) //
									// 	}else{
									// 		return "mise à jour hebdomadaire, " + d3.timeFormat("%B %d, %Y")(d3.timeParse("%Y-%m-%d")(vaxUpdateDate));//le 28 mai 2021" //d3.timeFormat("%_d %b %Y")(timeParser(mobility[data["HR_UID"]][0].wk_day_1))//
									// 	}
									// });
									
		if(data["HR_UID"] != "1"){
			
			// tileBody_vax.append("div")
			tileFooter.append("div")
						.attr("class","row")
						.style("text-align","center")
						.append("button")
						// .attr("class","btn btn-primary")
						.attr("class","btn btn-default")
						// .style("padding","10px 5px 10px")
						.style("margin","5px 0px")
						.style("width","100%")
						.html(function(){
								if(language =="en"){
									return '<i class="fa fa-external-link"></i> Vaccination booking site'
								}else{
									return '<i class="fa fa-external-link"></i> site de réservation de vaccination'
								}
							// }
						})
						.on("mouseup",function(){
							console.log("do a ting")
							let _websiteLink;
							if(find_website[data["HR_UID"]][0][language+"_prov_vaccine_site"] != ""){
								_websiteLink = find_website[data["HR_UID"]][0][language+"_prov_vaccine_site"];
							}else{
								_websiteLink = "#";
							}
							
							window.open(_websiteLink);
						})
		}							
	}

		
									
		if(timeData3[data["HR_UID"]]){
			let caseslast7_M, deathslast7_M, caseslast7_T, deathslast7_T;
			caseslast7_M  = d3.format(",d")(timeData3[data["HR_UID"]][currentDate2][0]["avgtotal_last7"]);
			deathslast7_M = d3.format(",d")(timeData3[data["HR_UID"]][currentDate2][0]["avgdeaths_last7"]);
			caseslast7_T  = d3.format(",d")(timeData3[data["HR_UID"]][currentDate2][0]["numtotal_last7"]);
			deathslast7_T = d3.format(",d")(timeData3[data["HR_UID"]][currentDate2][0]["numdeaths_last7"]);
			

			let trendStats = tileBody_top.append("div")
										.attr("class","row")
										.style("text-align","center")
										.attr("id","trendStats");
										
				trendStats.append("h3")
							.attr("class","nowrap")
							.style("margin-top","5px")
							.text(function(){
								if(language == "en"){
									return "Last 7 days";
								}else{
									return "7 derniers jours";
								}
							});
							
				let trend_cases = trendStats.append("div")
											.attr("class","col-xs-6 text-center")
											.attr("id","trend_cases");
											
				let trend_deaths= trendStats.append("div")
											.attr("class","col-xs-6 text-center")
											.attr("id","trend_deaths");
										
        	        					
			let _keysArr = Object.keys(timeData3[data["HR_UID"]])
   //==========================================================================
        	let _casesText = trend_cases.append("p").style("line-height","1.2");
        		
        		_casesText.append("span")
        				.attr("class","h4")
        				.style("display","block")
						.style("margin-bottom","0px")
						.style("margin-top","15px")
        				.text(function(){
        					if(language == "en"){
								if(caseslast7_T != 1){
									return caseslast7_T+ " cases";
								}else{
									return caseslast7_T+ " case";
								}
        					}else{
        						return caseslast7_T+ " cas";
        					}
        				});
        				
			
        		_casesText.append("span")
        				.append("small")
        				.style("display","block")
        				.text(function(){
        					if(language == "en"){
        						return "average of "+caseslast7_M;
        					}else{
        						return "moyenne de "+caseslast7_M;
        					}
        					
        				});
        				
        		_casesText.append("span")
        				.append("small")
        				.style("display","block")
        				.text(function(){
        					if(language == "en"){
        						return "per day";
        					}else{
        						return "par jour";
        					}
        				});
   //==========================================================================
   let _deathsText = trend_deaths.append("p").style("line-height","1.2");
        		
        		_deathsText.append("span")
        				.attr("class","h4")
        				.style("display","block")
						.style("margin-bottom","0px")
						.style("margin-top","15px")
        				.text(function(){
		    				if(language == "en"){
								if(deathslast7_T != 1){
									return deathslast7_T+" deaths";
								}else{
									return deathslast7_T+" death";
								}
		    				}else{
		    					return deathslast7_T+" décès";
		    				}
		    			});

        				
			
         		_deathsText.append("span")
        				.append("small")
        				.style("display","block")
        				.text(function(){
        					if(language == "en"){
        						return "average of "+deathslast7_M;
        					}else{
        						return "moyenne de "+deathslast7_M;
        					}
        					
        				});
        				
        		_deathsText.append("span")
        				.append("small")
        				.style("display","block")
        				.text(function(){
        					if(language == "en"){
        						return "per day"
        					}else{
        						return "par jour"
        					}
        				});
   //==========================================================================		
			let updateFreq = tileBody_top.append("div")
										.attr("class","row pull-right")
										.append("div")
										.attr("class","col-sm-12")
										.append("small")
										.attr("class","xsmall")
										.style("font-size",function(){
											if(language == "en"){
												return "0.8em";
											}else{
												return "0.65em"
											}	
										})
										.style("color","#b3b3b3")
										.text(function(){
											if(language == "en"){
												return "updated daily: "+ d3.timeFormat("%B %d, %Y")(d3.timeParse("%Y-%m-%d")(_keysArr[_keysArr.length-1]));
											}else{
												return "mise à jour quotidienne, le "+ d3.timeFormat("%_d %b %Y")(d3.timeParse("%Y-%m-%d")(_keysArr[_keysArr.length-1]));
											}
										})
		}
		else{
			//No data available...
			tile.append("p").text(function(){
				if(language == "en"){
					return "No data available."
				}else{
					return "Aucune donnée disponible."
				}
			})
		}
		
		
		
		if(find_website[data["HR_UID"]]){
			if(find_website[data["HR_UID"]][0]["En_website"] != "" || find_website[data["HR_UID"]][0]["Fr_website"] != ""){
				let link;
				if(language == "en"){
					if(find_website[data["HR_UID"]][0]["En_website"] != ""){
						link = find_website[data["HR_UID"]][0]["En_website"];
					}
					else{
						link = find_website[data["HR_UID"]][0]["Fr_website"];
					}
				}
				else{
					if(find_website[data["HR_UID"]][0]["Fr_website"] != ""){
						link = find_website[data["HR_UID"]][0]["Fr_website"];
					}
					else{
						link = find_website[data["HR_UID"]][0]["En_website"];
					}
				}
				
				let linkWording;	
				
				tileFooter.append("div")
							.attr("class","row")
							.style("text-align","center")
							.append("button")
							// .attr("class","btn btn-primary")
							.attr("class","btn btn-default")
							.style("margin","5px 0px")
							.style("width","100%")
							.html(function(){
								if(language == "en"){
									linkWording = "See details from <span class='wb-inv'>"+data["ENGNAME"]+"</span><span aria-hidden='true'>your health region</span>";
									if(data["HR_UID"] == 1){
										linkWording = "See national data";
									}						
								}else{
									linkWording = "Voir les détails de <span class='wb-inv'>la "+data["FRENAME"]+"</span><span aria-hidden='true'>votre région sanitaire</span>";
									if(data["HR_UID"] == 1){
										linkWording = "Voir données nationales";
									}
								}
								
								return '<i class="fa fa-external-link"></i>'+ linkWording;
							})
							.on("mouseup",function(){
								
								// window.location = _websiteLink;
								window.open(link);
							})
				
			}else{
				//empty field for website...
			}
		}else{
			//not on websites list...
		}
		
		//facts
		//formaters
		let timeFormat = d3.timeFormat("%B %d, %Y");
		let timeParser = d3.timeParse("%Y-%m-%d");
		let f_mob      = d3.format(".1f");
		let f_flu	   = d3.format(",")
		
		let facts = tileBody_bottom.append("div")
										.attr("class","row")
										.style("text-align","center")
										.attr("id","facts");
			facts.append("h3")
				//.attr("class","h4")
				.style("margin-top","5px")
				.text(function(){
				if(language == "en"){
					return "Week of "+timeFormat(timeParser(mobility[data["HR_UID"]][0].wk_day_1))+"";//
				}else{
					return "Semaine du "+ d3.timeFormat("%_d %B %Y")(timeParser(mobility[data["HR_UID"]][0].wk_day_1))+"";//
				}
				})
			//Table header update...
			d3.select("#mobFlu_header").text(function(){
				if(language == "en"){
					return "Week of "+timeFormat(timeParser(mobility[data["HR_UID"]][0].wk_day_1))+"";//
				}else{
					return "Semaine du "+ d3.timeFormat("%_d %B %Y")(timeParser(mobility[data["HR_UID"]][0].wk_day_1))+"";//
				}
				
			})
										
			let mobilityData = facts.append("div")
									.attr("class","col-xs-6 text-center")
									.style("padding","0 5%")
									//.style("text-align","left")
				
				let mobilityData_text = mobilityData.append("p").style("line-height","1.2");
				
				let _span =	mobilityData_text.append("span")
									.attr("class","h4")
									.style("display","block")
									.style("margin-bottom","0px")
									.style("margin-top","15px")
							
							_span.html(function(d){
								let _num = f_mob(mobility[data["HR_UID"]][0].pct_change_Mobility);
								//Temporary
/* 																			if(language == "en"){
												return "Mobility data";
											}else{
												return "Données de mobilité";
											}	 */
										if(_num > 0){
											if(language == "en"){
												return "<i class='fa fa-sort-up' aria-hidden='true'></i><span class='wb-inv'>Increase of</span> "+ f_mob(Math.abs(_num)) +"% mobility";
											}else{
												return "<i class='fa fa-sort-up' aria-hidden='true'></i><span class='wb-inv'>Augmentation de</span> "+ f_mob(_num) +"% mobilité";
											}
										}else if(_num < 0){
											if(language == "en"){
												return "<i class='fa fa-sort-down' aria-hidden='true'></i><span class='wb-inv'>Decrease of</span> "+ f_mob(Math.abs(_num)) +"% mobility";
											}else{
												return "<i class='fa fa-sort-down' aria-hidden='true'></i><span class='wb-inv'>Diminution de</span> "+ f_mob(_num.slice(1)) +" % mobilité";
											}
 										
										}else{
											if(language == "en"){
												return "No change in mobility";
											}else{
												return "Aucun changement de mobilité";
											}
										}
									});
					mobilityData_text.append("small")
									.style("font-size","0.8em")
									.text(function(){
										if(language == "en"){
											return " compared to previous week - "
										}else{
											return " comparé à la semaine précédente - "
										}
									})
					
					mobilityData_text.append("a")
									.attr("href","#MobilityDataSection")
									.append("small")
									.style("font-size","0.8em")
									.text(function(){
										if(language == "en"){
											return "learn more"
										}else{
											return "en savoir plus"
										}
									});
										
			let fluWatchData = facts.append("div")
									.attr("class","col-xs-6 text-center")
									.style("padding","0 5%")
									//.style("text-align","left")
				
				let fluWatchData_text = fluWatchData.append("p").style("line-height","1.2");
				if(isNaN(fluwatchers[data["HR_UID"]][0].confirmed_positive)){
					fluWatchData_text.append("span")
									// .attr("class","h5")
									.style("font-size","0.8em")
									.style("display","block")
									.style("margin-bottom","0px")
									.style("margin-top","15px")
									.text(function(d){
										if(language == "en"){
												return "There are insufficient FluWatchers reporting symptoms - "
											}else{
												return "Il n'y a pas assez de participants pour signaler les symptômes - "
											}
									})
									.append("a")
									.attr("href",function(){
										if(language == "en"){
											return "https://cnphi.canada.ca/fluWatcher/register"
										}else{
											return "https://rcrsp.canada.ca/fluWatcher/enregistrer"
										}
									})
									.attr("target","_blank")
									.text(function(){
										if(language == "en"){
											return "sign up!"
										}else{
											return "participez!"
										}
									});
					
				}else{
					fluWatchData_text.append("span")
									.attr("class","h4")
									.style("display","block")
									.style("margin-bottom","0px")
									.style("margin-top","15px")
									.text(function(d){
										if(data["HR_UID"] == 1){
											if(language == "en"){
												return f_flu(fluwatchers[data["HR_UID"]][0].confirmed_positive) +" out of "+ f_flu(fluwatchers[data["HR_UID"]][0].participants) +""
											}else{
												return f_flu(fluwatchers[data["HR_UID"]][0].confirmed_positive) +" sur "+ f_flu(fluwatchers[data["HR_UID"]][0].participants) +""
											}
										}
										if(language == "en"){
											return f_flu(fluwatchers[data["HR_UID"]][0].confirmed_positive) +" out of "+ f_flu(fluwatchers[data["HR_UID"]][0].participants) +""
										}else{
											return f_flu(fluwatchers[data["HR_UID"]][0].confirmed_positive) +" sur "+ f_flu(fluwatchers[data["HR_UID"]][0].participants) +""
										}
									})				
					
					fluWatchData_text.append("small")
									.style("font-size","0.8em")
									.text(function(){
										if(language == "en"){
											return " reported cough or fever - "
										}else{
											return " ont signalé une toux ou fièvre - "
										}
									})
									.append("a")
									.attr("href",function(){
										if(language == "en"){
											return "https://cnphi.canada.ca/fluWatcher/register"
										}else{
											return "https://rcrsp.canada.ca/fluWatcher/enregistrer"
										}
									})
									.attr("target","_blank")
									.text(function(){
										if(language == "en"){
											return "sign up!"
										}else{
											return "participez!"
										}
									})
					
					fluWatchData_text.insert("a","small")
									.attr("href","#FluWatchersDataSection")
									// .attr("target","_blank")
									.append("small")
									.style("font-size","0.8em")
									.text(function(){
										if(language == "en"){
											return "FluWatchers"
										}else{
											return "ActionGrippe"
										}
									});
									
					if(language == "fr"){
						fluWatchData_text.insert("small","a")
									.style("font-size","0.8em")
									.text(function(){
										return "participants "
									});
					}
				}

					
		//MOBILITY AND FLUWATCHERS
		let updateFreq = tileBody_bottom.append("div")
										.attr("class","row pull-right")
										.append("div")
										.attr("class","col-sm-12")
										.append("small")
										.attr("class","xsmall")
										.style("font-size",function(){
											if(language == "en"){
												return "0.8em";
											}else{
												return "0.65em"
											}										
										})
										.style("color","#b3b3b3")
										.text(function(){
											if(language == "en"){
												return "updated weekly: June 03, 2021"//+ timeFormat(timeParser(mobility[data["HR_UID"]][0].wk_day_1))+""
											}else{
												return "mise à jour hebdomadaire : le 03 juin 2021"//+ d3.timeFormat("%_d %b %Y")(timeParser(mobility[data["HR_UID"]][0].wk_day_1))+""//
											}
										})

							
	// }else{
		//tile duplicate, don't add tile...
	// }
}

function buildPanel_4_thrive(data,colour){
	console.log(data,data["HR_UID"]);
	if(tiles_arr.indexOf(data["HR_UID"]) < 0 ){
		
	tiles_arr.push(data["HR_UID"]);
		
	window.history.pushState(null, null, window.location.origin + window.location.pathname + '?source=thrive&location='+tiles_arr.join(","));		
	//===========================================================================
		let tile = d3.select("#tileSection")
				 .append("section")
				 //.insert("section","section")
				 .style("box-shadow","none")
				 .style("border-bottom","2px solid #ccc")
				 .style("border-radius","0px")
				 .attr("class", "panel")
				 .attr("id", "tile-"+ data["HR_UID"])
		
					
		let tileHead = tile.append("header")
						.attr("class","panel-heading text-center");
			
			tileHead.append("h2")
					.style("display", "block")
					.style("margin-top","0")
					.text(function(){
						if((data["HR_UID"] == 1) || (language == "en")){
							return data["ENGNAME"];
						}else{
							if(data["FRENAME"]!=""){
								return data["FRENAME"];
							}else{
								return data["ENGNAME"];
							}
							
						}
					})
			
		let thumbnail = tileHead.append("svg")
						.attr("class","mapThumbnail adjust")
						.attr("height","100px")
						.attr("width","100px")
						.attr("id",function(){
							return "Section_thumbnail-"+data["HR_UID"]+"";
						})
						.style("display","inline-block");
		
			if(data["HR_UID"] != 1){
				tileHead.select("h2")
					.append("small")
					.text(function(){
						if(data["Prov"]){
							return " ("+data["Prov"]+")"
						}else{
							//Prov is empty
						}
					})
			}
			
		
		let tileBody_vax = tile.append("div") //THIS IS -> vaccination Stuff
							.attr("class","panel-body")
							// .style("position","relative")
							.style("border-top","1px solid #ddd")
							.style("border-top-right-radius","3px")
							.style("border-top-left-radius","3px");
		
		let tileBody_top = tile.append("div") //THIS IS -> centerColumn_Left
							.attr("class","panel-body")
							// .style("position","relative")
							.style("border-top","1px solid #ddd")
							.style("border-top-right-radius","3px")
							.style("border-top-left-radius","3px");
		
		let tileBody_bottom = tile.append("div") //THIS IS -> centerColumn_Right
							.attr("class","panel-body")
							.style("border-top","1px solid #ddd")
							.style("border-top-right-radius","3px")
							.style("border-top-left-radius","3px");
										
									
			if(data["HR_UID"] != 1){
				thumbnail.append("g")
						 .append("path")
						 .attr("d",buildThumbnailShape(data["HR_UID"]))
						 .style("fill-opacity", 0.4)
	    				 .style("fill", colour)
	    				 .style("stroke", colour);
			}else{
				thumbnail.attr("viewBox","-70 -50 600 600")
						 .append("g")
						 .append("path")
						 .style("fill-opacity",0.4)
						 .style("fill","red")
						 .style("stroke","red")
						 .style("stroke-width","10px")
						 .attr("d","m495.418 146.225-83.042 19.497-4.409-52.266-66.698 60.703 19.321-120.659-57.056 20.039-47.534-73.539-47.534 73.539-57.056-20.039 19.321 120.659-66.698-60.703-4.409 52.266-83.042-19.497 28.696 89.179-45.278 21.577 128.397 99.961-14.238 57.32 126.841-20.633v118.371h30v-118.371l126.841 20.633-14.238-57.32 128.397-99.961-45.278-21.577z")
			}
									
		if(true){//check vax data
			let _panel_body_3 = tileBody_vax.append("div")
										.attr("class","row")
										.style("text-align","center")
										.attr("id","trendStats");
			let _region_vaxData;
			let regionToSearch;
			console.log(data)
			if(data["HR_UID"] == "1"){
				regionToSearch = "1";
			}else{
				if(data["Prov"]){
					if(Number.isInteger(Number(data["Prov"]))){
						regionToSearch = data["Prov"];
					}else{
						regionToSearch = prov2pruid(data["Prov"]);
					}
				}else if(data["PR"]){
					regionToSearch = data["PR"];
					console.log(data["Prov"])
				}else{
					regionToSearch = "1";
				}
			}
			
			for(let i=0; i<vaxData.length; i++){
				if(vaxData[i].key == regionToSearch){
					_region_vaxData = vaxData[i];
					break;
				}
			}	
			console.log(_region_vaxData)
			console.log(regionToSearch);
			let _panel_body_3_vax_title = _panel_body_3.append("p")
														.attr("class","h3")
														.style("text-align","center")
														.style("margin-top","5px")
														.text(function(){
															if(language == "en"){
																return "Population vaccinated in ";
															}else{
																return "Population vaccinée en ";
															}
														});
			
			_panel_body_3_vax_title.append("span")
									.style("color",colour)
									.append("strong")
									.text(function(){
										if(data["Prov"]){
											
											return data["Prov"];
										}else if(data["PR"]){
											return pruid2prov(data["PR"])
										}else{
											//Prov is empty
											if(data["HR_UID"] == "1"){
												return "Canada";
											}
										}
									})
									
			let _panel_body_3_vaxText  = _panel_body_3.append("div")
														.attr("class","col-xs-12")
														.attr("id","vaccination")
														
			let vaxData_text = _panel_body_3_vaxText.append("p")
													.style("line-height","1.2")
													.style("text-align","start")
													
			let _vaxSpan =	vaxData_text.append("span")
								.attr("class","h4")
								.style("display","inline-block")
								.style("margin-bottom","0px")
								.style("margin-top","15px")
								.text(function(){
									console.log(_region_vaxData)
									let val = _region_vaxData.values[(_region_vaxData.values.length - 1)].values[0]["proptotal_atleast1dose"];
									if(language == "en"){
										return d3.format(".1f")(val) + "%";
									}else{
										return d3.format(".1f")(val) + " %";
									}
								});
								
			vaxData_text.append("small")
						// .style("font-size","0.8em")
						.text(function(){
							if(language == "en"){
								return " of the population has received at least one dose of a COVID-19 vaccine"
							}else{
								return " de la population ayant reçu au moins une dose d'un vaccin contre la COVID-19"
							}
						})
										
			//VACCINATION COVERAGE							
			let updateFreq_3 = tileBody_vax.append("div")
										.attr("class","row pull-right")
										.append("div")
										.attr("class","col-sm-12")
										.append("small")
										.attr("class","xsmall")
										.style("font-size",function(){
											if(language == "en"){
												return "0.8em";
											}else{
												return "0.65em"
											}	
										})
										.style("color","#b3b3b3")
										//HARDCODED
										.text(function(){
											if(language == "en"){
												return "updated weekly: May 28, 2021"//+ d3.timeFormat("%B %d, %Y")(d3.timeParse("%Y-%m-%d")(_region_vaxData.values[(_region_vaxData.values.length - 1)].key));+""
											}else{
												return "mise à jour hebdomadaire : le 28 mai 2021"//+ d3.timeFormat("%B %d, %Y")(d3.timeParse("%Y-%m-%d")(_region_vaxData.values[(_region_vaxData.values.length - 1)].key))+""//
											}
										});
										//DYNAMIC
										// .text(function(){
										// 	if(language == "en"){
										// 		return "updated weekly: "+ d3.timeFormat("%B %d, %Y")(d3.timeParse("%Y-%m-%d")(vaxUpdateDate));//May 28, 2021" //timeFormat(timeParser(mobility[data["HR_UID"]][0].wk_day_1)) //
										// 	}else{
										// 		return "mise à jour hebdomadaire, " + d3.timeFormat("%B %d, %Y")(d3.timeParse("%Y-%m-%d")(vaxUpdateDate));//le 28 mai 2021" //d3.timeFormat("%_d %b %Y")(timeParser(mobility[data["HR_UID"]][0].wk_day_1))//
										// 	}
										// });
										
			if(data["HR_UID"] != "1"){
				
				tileBody_vax.append("div")
							.attr("class","row")
							.style("text-align","center")
							.append("button")
							// .attr("class","btn btn-primary")
							.attr("class","btn btn-default")
							// .style("padding","10px 5px 10px")
							.style("width","100%")
							.html(function(){
									if(language =="en"){
										return '<i class="fa fa-external-link"></i> Vaccination booking site'
									}else{
										return '<i class="fa fa-external-link"></i> site de réservation de vaccination'
									}
							})
							.on("mouseup",function(){
								console.log("do a ting")
								let _websiteLink;
								if(find_website[data["HR_UID"]][0][language+"_prov_vaccine_site"] != ""){
									_websiteLink = find_website[data["HR_UID"]][0][language+"_prov_vaccine_site"];
								}else{
									_websiteLink = "#";
								}
								
								// window.location = _websiteLink;
								window.open(_websiteLink);
							})
			}							

		}
									
		if(timeData3[data["HR_UID"]]){
			let caseslast7_M, deathslast7_M, caseslast7_T, deathslast7_T;
			caseslast7_M  = d3.format(",d")(timeData3[data["HR_UID"]][currentDate2][0]["avgtotal_last7"]);
			deathslast7_M = d3.format(",d")(timeData3[data["HR_UID"]][currentDate2][0]["avgdeaths_last7"]);
			caseslast7_T  = d3.format(",d")(timeData3[data["HR_UID"]][currentDate2][0]["numtotal_last7"]);
			deathslast7_T = d3.format(",d")(timeData3[data["HR_UID"]][currentDate2][0]["numdeaths_last7"]);
			

			let trendStats = tileBody_top.append("div")
										.attr("class","row")
										.style("text-align","center")
										.attr("id","trendStats");
										
			
				trendStats.append("h3")
							.attr("class","nowrap")
							.style("margin-top","5px")
							.text(function(){
								if(language == "en"){
									return "Last 7 days";
								}else{
									return "7 derniers jours";
								}
							});
							
				let trend_cases = trendStats.append("div")
											.attr("class","col-xs-6 text-center")
											.attr("id","trend_cases");
											
				let trend_deaths= trendStats.append("div")
											.attr("class","col-xs-6 text-center")
											.attr("id","trend_deaths");
										
        	        					
			let _keysArr = Object.keys(timeData3[data["HR_UID"]])
   //==========================================================================
        	let _casesText = trend_cases.append("p").style("line-height","1.2");
        		
        		_casesText.append("span")
        				.attr("class","h4")
        				.style("display","block")
						.style("margin-bottom","0px")
						.style("margin-top","15px")
        				.text(function(){
        					if(language == "en"){
								if(caseslast7_T != 1){
									return caseslast7_T+ " cases";
								}else{
									return caseslast7_T+ " case";
								}
        					}else{
        						return caseslast7_T+ " cas";
        					}
        				});
        				
			
        		_casesText.append("span")
        				.append("small")
        				.style("display","block")
        				.text(function(){
        					if(language == "en"){
        						return "average of "+caseslast7_M;
        					}else{
        						return "moyenne de "+caseslast7_M;
        					}
        					
        				});
        				
        		_casesText.append("span")
        				.append("small")
        				.style("display","block")
        				.text(function(){
        					if(language == "en"){
        						return "per day";
        					}else{
        						return "par jour";
        					}
        				});
   //==========================================================================
   let _deathsText = trend_deaths.append("p").style("line-height","1.2");
        		
        		_deathsText.append("span")
        				.attr("class","h4")
        				.style("display","block")
						.style("margin-bottom","0px")
						.style("margin-top","15px")
        				.text(function(){
		    				if(language == "en"){
								if(deathslast7_T != 1){
									return deathslast7_T+" deaths";
								}else{
									return deathslast7_T+" death";
								}
		    				}else{
		    					return deathslast7_T+" décès";
		    				}
		    			});

        				
			
         		_deathsText.append("span")
        				.append("small")
        				.style("display","block")
        				.text(function(){
        					if(language == "en"){
        						return "average of "+deathslast7_M;
        					}else{
        						return "moyenne de "+deathslast7_M;
        					}
        					
        				});
        				
        		_deathsText.append("span")
        				.append("small")
        				.style("display","block")
        				.text(function(){
        					if(language == "en"){
        						return "per day"
        					}else{
        						return "par jour"
        					}
        				});
   //==========================================================================		
			let updateFreq = tileBody_top.append("div")
										.attr("class","row pull-right")
										.append("div")
										.attr("class","col-sm-12")
										.append("small")
										.attr("class","xsmall")
										.style("font-size",function(){
											if(language == "en"){
												return "0.8em";
											}else{
												return "0.65em"
											}	
										})
										.style("color","#b3b3b3")
										.text(function(){
											if(language == "en"){
												return "updated daily: "+ d3.timeFormat("%B %d, %Y")(d3.timeParse("%Y-%m-%d")(_keysArr[_keysArr.length-1]));
											}else{
												return "mise à jour quotidienne, le "+ d3.timeFormat("%_d %b %Y")(d3.timeParse("%Y-%m-%d")(_keysArr[_keysArr.length-1]));
											}
										})
		}
		else{
			//No data available...
			tile.append("p").text(function(){
				if(language == "en"){
					return "No data available."
				}else{
					return "Aucune donnée disponible."
				}
			})
		}
		
		
		
		if(find_website[data["HR_UID"]]){
			if(find_website[data["HR_UID"]][0]["En_website"] != "" || find_website[data["HR_UID"]][0]["Fr_website"] != ""){
				let link;
				if(language == "en"){
					if(find_website[data["HR_UID"]][0]["En_website"] != ""){
						link = find_website[data["HR_UID"]][0]["En_website"];
					}
					else{
						link = find_website[data["HR_UID"]][0]["Fr_website"];
					}
				}
				else{
					if(find_website[data["HR_UID"]][0]["Fr_website"] != ""){
						link = find_website[data["HR_UID"]][0]["Fr_website"];
					}
					else{
						link = find_website[data["HR_UID"]][0]["En_website"];
					}
				}
				
				let linkWording;	
				
				
				let tileFooter = tile.append("footer")
				.attr("class","panel-footer text-center")
				.style("background-color","#fbfbfb")
							.append("div")
							.attr("class","row")
							.style("text-align","center")
							.append("button")
							// .attr("class","btn btn-primary")
							.attr("class","btn btn-default")
							.style("margin","5px 0px")
							.style("width","100%")
							.html(function(){
								if(language == "en"){
									linkWording = "See details from <span class='wb-inv'>"+data["ENGNAME"]+"</span><span aria-hidden='true'>your health region</span>";
									if(data["HR_UID"] == 1){
										linkWording = "See national data";
									}						
								}else{
									linkWording = "Voir les détails de <span class='wb-inv'>la "+data["FRENAME"]+"</span><span aria-hidden='true'>votre région sanitaire</span>";
									if(data["HR_UID"] == 1){
										linkWording = "Voir données nationales";
									}
								}
								
								return '<i class="fa fa-external-link"></i>'+ linkWording;
							})
							.on("mouseup",function(){
								
								// window.location = _websiteLink;
								window.open(link);
							})
			}else{
				//empty field for website...
			}
		}else{
			//not on websites list...
		}
		
		//facts
		//formaters
		let timeFormat = d3.timeFormat("%B %d, %Y");
		let timeParser = d3.timeParse("%Y-%m-%d");
		let f_mob      = d3.format(".1f");
		let f_flu	   = d3.format(",")
		
		let facts = tileBody_bottom.append("div")
										.attr("class","row")
										.style("text-align","center")
										.attr("id","facts");
			facts.append("h3")
				//.attr("class","h4")
				.style("margin-top","5px")
				.text(function(){
				if(language == "en"){
					return "Week of "+timeFormat(timeParser(mobility[data["HR_UID"]][0].wk_day_1))+"";//
				}else{
					return "Semaine du "+ d3.timeFormat("%_d %B %Y")(timeParser(mobility[data["HR_UID"]][0].wk_day_1))+"";//
				}
				})
			//Table header update...
			d3.select("#mobFlu_header").text(function(){
				if(language == "en"){
					return "Week of "+timeFormat(timeParser(mobility[data["HR_UID"]][0].wk_day_1))+"";//
				}else{
					return "Semaine du "+ d3.timeFormat("%_d %B %Y")(timeParser(mobility[data["HR_UID"]][0].wk_day_1))+"";//
				}
				
			})
										
			let mobilityData = facts.append("div")
									.attr("class","col-xs-6 text-center")
									.style("padding","0 5%")
									//.style("text-align","left")
				
				let mobilityData_text = mobilityData.append("p").style("line-height","1.2");
				
				let _span =	mobilityData_text.append("span")
									.attr("class","h4")
									.style("display","block")
									.style("margin-bottom","0px")
									.style("margin-top","15px")
							
							_span.html(function(d){
								let _num = f_mob(mobility[data["HR_UID"]][0].pct_change_Mobility);
										if(_num > 0){
											if(language == "en"){
												return "<i class='fa fa-sort-up' aria-hidden='true'></i><span class='wb-inv'>Increase of</span> "+ f_mob(Math.abs(_num)) +"% mobility";
											}else{
												return "<i class='fa fa-sort-up' aria-hidden='true'></i><span class='wb-inv'>Augmentation de</span> "+ f_mob(_num) +"% mobilité";
											}
										}else if(_num < 0){
											if(language == "en"){
												return "<i class='fa fa-sort-down' aria-hidden='true'></i><span class='wb-inv'>Decrease of</span> "+ f_mob(Math.abs(_num)) +"% mobility";
											}else{
												return "<i class='fa fa-sort-down' aria-hidden='true'></i><span class='wb-inv'>Diminution de</span> "+ f_mob(_num.slice(1)) +" % mobilité";
											}
 										
										}else{
											if(language == "en"){
												return "No change in mobility";
											}else{
												return "Aucun changement de mobilité";
											}
										}
									});
					mobilityData_text.append("small")
									.style("font-size","0.8em")
									.text(function(){
										if(language == "en"){
											return " compared to previous week - "
										}else{
											return " comparé à la semaine précédente - "
										}
									})
					
					mobilityData_text.append("a")
									.attr("href","#MobilityDataSection")
									.append("small")
									.style("font-size","0.8em")
									.text(function(){
										if(language == "en"){
											return "learn more"
										}else{
											return "en savoir plus"
										}
									});
										
			let fluWatchData = facts.append("div")
									.attr("class","col-xs-6 text-center")
									.style("padding","0 5%")
				
				let fluWatchData_text = fluWatchData.append("p").style("line-height","1.2");
				if(isNaN(fluwatchers[data["HR_UID"]][0].confirmed_positive)){
					fluWatchData_text.append("span")
									// .attr("class","h5")
									.style("font-size","0.8em")
									.style("display","block")
									.style("margin-bottom","0px")
									.style("margin-top","15px")
									.text(function(d){
										if(language == "en"){
												return "There are insufficient FluWatchers reporting symptoms - "
											}else{
												return "Il n'y a pas assez de participants pour signaler les symptômes - "
											}
									})
									.append("a")
									.attr("href",function(){
										if(language == "en"){
											return "https://cnphi.canada.ca/fluWatcher/register"
										}else{
											return "https://rcrsp.canada.ca/fluWatcher/enregistrer"
										}
									})
									.attr("target","_blank")
									.text(function(){
										if(language == "en"){
											return "sign up!"
										}else{
											return "participez!"
										}
									});
					
				}else{
					fluWatchData_text.append("span")
									.attr("class","h4")
									.style("display","block")
									.style("margin-bottom","0px")
									.style("margin-top","15px")
									.text(function(d){
										if(data["HR_UID"] == 1){
											if(language == "en"){
												return f_flu(fluwatchers[data["HR_UID"]][0].confirmed_positive) +" out of "+ f_flu(fluwatchers[data["HR_UID"]][0].participants) +""
											}else{
												return f_flu(fluwatchers[data["HR_UID"]][0].confirmed_positive) +" sur "+ f_flu(fluwatchers[data["HR_UID"]][0].participants) +""
											}
										}
										if(language == "en"){
											return f_flu(fluwatchers[data["HR_UID"]][0].confirmed_positive) +" out of "+ f_flu(fluwatchers[data["HR_UID"]][0].participants) +""
										}else{
											return f_flu(fluwatchers[data["HR_UID"]][0].confirmed_positive) +" sur "+ f_flu(fluwatchers[data["HR_UID"]][0].participants) +""
										}
									})				
					
					fluWatchData_text.append("small")
									.style("font-size","0.8em")
									.text(function(){
										if(language == "en"){
											return " reported cough or fever - "
										}else{
											return " ont signalé une toux ou fièvre - "
										}
									})
									.append("a")
									.attr("href",function(){
										if(language == "en"){
											return "https://cnphi.canada.ca/fluWatcher/register"
										}else{
											return "https://rcrsp.canada.ca/fluWatcher/enregistrer"
										}
									})
									.attr("target","_blank")
									.text(function(){
										if(language == "en"){
											return "sign up!"
										}else{
											return "participez!"
										}
									})
					
					fluWatchData_text.insert("a","small")
									.attr("href","#FluWatchersDataSection")
									// .attr("target","_blank")
									.append("small")
									.style("font-size","0.8em")
									.text(function(){
										if(language == "en"){
											return "FluWatchers"
										}else{
											return "ActionGrippe"
										}
									});
									
					if(language == "fr"){
						fluWatchData_text.insert("small","a")
									.style("font-size","0.8em")
									.text(function(){
										return "participants "
									});
					}
				}

					
		//MOBILITY AND FLUWATCHERS
		let updateFreq = tileBody_bottom.append("div")
										.attr("class","row pull-right")
										.append("div")
										.attr("class","col-sm-12")
										.append("small")
										.attr("class","xsmall")
										.style("font-size",function(){
											if(language == "en"){
												return "0.8em";
											}else{
												return "0.65em"
											}										
										})
										.style("color","#b3b3b3")
										.text(function(){
											if(language == "en"){
												return "updated weekly: June 03, 2021"//+ timeFormat(timeParser(mobility[data["HR_UID"]][0].wk_day_1))+""
											}else{
												return "mise à jour hebdomadaire : le 03 juin 2021"//+ d3.timeFormat("%_d %b %Y")(timeParser(mobility[data["HR_UID"]][0].wk_day_1))+""//
											}
										})


							
	}else{
		//tile duplicate, don't add tile...
	}
}


function buildThumbnailShape (hruid){
	
		let _hrFeature = (mapTopo.features).filter(function(d){
			return d.properties.HR_UID === hruid;
		})[0]
		
		//special case
		if(hruid === "4601"){
			let custFeat = {
				type: "Feature",
				properties: _hrFeature.properties,
				geometry: {
					type: _hrFeature.geometry.type,
					coordinates: [_hrFeature.geometry.coordinates[0]]
				}
			}
			
			let sp_projection = d3.geoMercator().fitSize(["100","100"],custFeat);
			let sp_path = d3.geoPath().projection(sp_projection);
			
			return sp_path(custFeat);
		}
		
		let projection = d3.geoMercator().fitSize(["100","100"],_hrFeature)
		var path = d3.geoPath().projection(projection);
		
		
		return path(_hrFeature)
	
}

var colIndex = 0;
function getColour (){
	
	let x = d3.schemeCategory10[(colIndex%10)];
	colIndex++;
	return x;
}


function tileDataAssembly (tileHruid){
	
	if(tileHruid === "1"){
		return {"HR_UID": "1", "ENGNAME": "Canada", "FRENAME": "Canada"}
	}
	// {"HR_UID": "1", "ENGNAME": "Canada", "FRENAME": "Canada"}
	let _hrFeature = (mapTopo.features).filter(function(d){
						return d.properties.HR_UID == tileHruid;
					})[0]
	
	// let d            = buildThumbnail(_hrFeature);
	let feature_data = {"HR_UID":tileHruid, "ENGNAME":  _hrFeature.properties["ENGNAME"], "FRENAME":  _hrFeature.properties["FRENAME"], "Prov": pruid2prov(_hrFeature.properties["HR_UID"].substr(0,2))};
	//let feature_data = {"HR_UID":tileHruid, "ENGNAME":  _hrFeature.properties["ENGNAME"], "FRENAME":  _hrFeature.properties["FRENAME"], "Prov":  _hrFeature.properties["Prov"]}};
	//console.log("Prov",pruid2prov(_hrFeature.properties["HR_UID"].substr(0,2)));
	return feature_data
}

function getURLparameters (url){
	let params = {};
	let parser = document.createElement('a');
	    parser.href = url;
	let query = parser.search.substring(1);
	let vars = query.split('&');
	for (let i = 0; i < vars.length; i++) {
		let pair = vars[i].split('=');
		params[pair[0]] = decodeURIComponent(pair[1]);
	}
	//console.log(params);
	return params;
}