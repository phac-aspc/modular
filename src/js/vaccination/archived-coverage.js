//Repatriated Totals
		// if(urlProduct != "cov"){
			// const repatriated = d3.select("#mapGroup").datum(mapData.get("99").get(currentDate)[0]).append("g")
			// 	.attr("id", "repatriated")
			// 	.attr("tabindex", 0)
			// 	.attr("data-taborder", 15)
			// 	.attr("focusable", true)
			// 	.on("mouseover", function(d) {
			// 		// d3.select(this).raise();
			// 		currentRegion = d3.select(this).data()[0];
	
			// 		var txtName = pruid2prov("99");
					
			// 		d3.select(".currentRegion").text(function() {
			// 			return txtName;
			// 		})
					
			// 		var numTotal;
			// 		var numPercentTotal;
			// 		if (mapData.get("99").get(currentDate)) {
			// 			numPercentTotal = mapData.get(d.pruid).get(currentDate)[0][vaccineDropdowns];
	  //  				d3.selectAll(".currentNumberPercent").html(function() {
	  //  					return generateTxt(numPercentTotal,numPropDropdownVal);
	  //  				});
			// 		}
					
   // 				d3.selectAll(".textArticle1").text(function() {
   // 					if (language == "en") {
   // 						return "to";
   // 					}
   // 					else {
   // 						return "aux";
   // 					}
   // 				});
	
			// 		d3.selectAll(".txtCurrentDate").text(function() {
			// 			let timeValue;
			// 			if (language == "en") {
			// 				timeValue = d3.timeFormat("%B %e, %Y")(parseTime(currentDate));  //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
			// 			}
			// 			else {
			// 				timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
			// 			}
			// 			return timeValue;
			// 		})
	
			// 		currentRegion = dosesadministered[dosesadministered.length-1].values;
			// 		updateTrend(currentRegion);
			// 		$(".backgroundRepatriated").attr("stroke", "#000000").attr("stroke-width", 2);
			// 	})
			// 	.on("mouseout", function(d) {
			// 		//Add
			// 		$(".backgroundRepatriated").removeAttr("stroke");
			// 		$(".backgroundRepatriated").removeAttr("stroke-width");
			// 	})
			// 	.on("focus", function(d) {
			// 		// d3.select(this).raise();
			// 		currentRegion = d3.select(this).data()[0];
	
			// 		var txtName = pruid2prov("99");
					
			// 		d3.select(".currentRegion").text(function() {
			// 			return txtName;
			// 		})
					
			// 		var numTotal;
			// 		var numPercentTotal;
			// 		if (mapData.get("99").get(currentDate)) {
			// 			numPercentTotal = mapData.get(d.pruid).get(currentDate)[0][vaccineDropdowns];
	  //  				d3.selectAll(".currentNumberPercent").html(function() {
	  //  					return generateTxt(numPercentTotal,numPropDropdownVal);
	  //  				});
			// 		}
	
   // 				d3.selectAll(".textArticle1").text(function() {
   // 					if (language == "en") {
   // 						return "to";
   // 					}
   // 					else {
   // 						return "aux";
   // 					}
   // 				});
    				
			// 		d3.selectAll(".txtCurrentDate").text(function() {
			// 			let timeValue;
			// 			if (language == "en") {
			// 				timeValue = d3.timeFormat("%B %e, %Y")(parseTime(currentDate));  //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
			// 			}
			// 			else {
			// 				timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
			// 			}
			// 			return timeValue;
			// 		})
	
			// 		currentRegion = dosesadministered[dosesadministered.length-1].values;
			// 		updateTrend(currentRegion);
			// 		$(".backgroundRepatriated").attr("stroke", "#000000").attr("stroke-width", 2);
			// 	})
	
			// repatriated.append("rect")
			// 	.attr("class", "backgroundRepatriated")
			// 	.attr("x", 35)
			// 	.attr("y", 520)
			// 	.attr("width", function(d){
			// 		if(language == "en"){
			// 			return 255;
			// 		}else{
			// 			return 290;
			// 		}
			// 	})
			// 	.attr("height", 80)
			// 	.attr("fill", "none");
	
			// repatriated.append("text")
			// 	.attr("class", "textRepatriated")
			// 	.text(pruid2prov("99"))
			// 	.attr("x", 40)
			// 	.attr("y", 575)
			// 	.attr("font-size", "17px")
			// 	.attr("fill", "black");
	
			// repatriated.append("circle")
			// 	.attr("class", "circleRepatriated")
			// 	.attr("cx", function(d){
			// 		if(language == "en"){
			// 			return 260;
			// 		}else{
			// 			return 295;
			// 		}
			// 	})
			// 	.attr("cy", 570)
			// 	.attr("r", 24)
			// 	.attr("fill", "rgb(54, 54, 54)");
	
			// repatriated.append("text")
			// 	.attr("class", "repatriatedTextValue")
			// 	.text(function(d) {
			// 		return mapData.get("99").get(currentDate)[0][vaccineDropdowns];
			// 	})
			// 	.attr("x", function(d){
			// 		if(language == "en"){
			// 			return 260;
			// 		}else{
			// 			return 295;
			// 		}
			// 	})
			// 	.attr("y", 575)
			// 	.attr("font-size", "15px")
			// 	.style("text-anchor", "middle")
			// 	.style("fill", "white")
			// 	.transition()
			// 	.duration(600)
			// 	.tween("text", function(d) {
			// 		const that = d3.select(this);
			// 		let format;
			// 		if (language == "en") {
			// 			format = d3.format(",d");
			// 			const i = d3.interpolateNumber(0, mapData.get("99").get(currentDate)[0][vaccineDropdowns]);
			// 			return function(t) { that.text(format(i(t))); };
			// 		}
			// 		else {
			// 			format = d3.format(",d");
			// 			const i = d3.interpolateNumber(0, mapData.get("99").get(currentDate)[0][vaccineDropdowns]);
			// 			return function(t) { that.text(format(i(t)).replace(",", " ")); };
			// 		}
			// 	})
				
			// repatriated.append("text")
			// 	.attr("class", "textRepatriated2")
			// 	.text(function() {
			// 		if (language == "en") {
			// 			return "Federal allocation";
			// 		}
			// 		else {
			// 			return "Organismes fédéraux";
			// 		}
			// 	})
			// 	.attr("x", 40)
			// 	.attr("y", 540)
			// 	.attr("font-size", "18px")
			// 	.attr("fill", "black")
			// 	.attr("font-weight", "bold");
	// }



		
		// d3.select('.repatriatedTextValue').each(function(d) {
		// 	d3.select(this).transition().duration(600).tween("text", function() {
		// 		const that = d3.select(this);
		// 		let format;
		// 		let i;
		// 		let newVal;
		// 		// if(typeDropdownVal == "_administerec"){
		// 		// 	newVal = dosesadministered2["99"][currentDate];
		// 		// }else{
		// 			newVal = mapData.get("99").get(currentDate)[0][vaccineDropdowns];
		// 		// }
		// 		// format = d3.format(",d");
		// 		if (language == "en") {
		// 			i = d3.interpolateNumber(+that.text().replace(/,/g, "").replace(/%/g, ""), newVal);
		// 			return function(t) { that.text(generateTxt(i(t),numPropDropdownVal)); };
		// 		}
		// 		else {
		// 			i = d3.interpolateNumber(+that.text().replace(/ /g, "").replace(/,/g, ".").replace(/%/g, ""), newVal);
		// 			return function(t) { that.text(generateTxt(i(t),numPropDropdownVal)); };
		// 		}
		// 	});
		// });


// function animateMap() {

	// 	//use array of years to loop through data for each PT
	// 	setTimeout(function() {
	// 		currentDate = datesArray[index];

	// 		d3.selectAll(".updateDate").text(function() {
	// 			let timeValue;
	// 			if (language == "en") {
	// 				timeValue = d3.timeFormat("%B %e, %Y")(parseTime(currentDate));  //+ordinalSuffix(d3.timeFormat("%e")(parseTime(currentDate)))
	// 			}
	// 			else {
	// 				timeValue = d3.timeFormat("%d %B %Y")(parseTime(currentDate));
	// 			}
	// 		// 			d3.select("#descText2").text(timeValue);
	// 			return timeValue;
	// 		})

	// 		//Transition Styles
	// 		d3.selectAll(".regions path").transition().duration(1200).style("fill", function(d) {
	// 			if (timeData2[d.properties.PRUID][currentDate]) {
	// 				// if (typeCases == "percentoday") {
	// 				// 	return color(timeData[d.properties.PRUID][currentDate][0][typeCases] * 100);
	// 				// }
	// 				// else {
	// 					return color(timeData2[d.properties.PRUID][currentDate][0][vaccineDropdowns]);
	// 				// }
	// 			}
	// 			else {
	// 				return colorScale["No data"];
	// 			}
	// 		});

	// 		//Transition Numbers

	// 		d3.selectAll('.regionCircleText').each(function(d) {
	// 			d3.select(this).transition().duration(1200).tween("text", function() {
	// 				const that = d3.select(this);
	// 				let currentVal;
	// 				if(numPropDropdownVal == "num"){
	// 					currentVal = +that.text().replace(/,/g, "").replace(/ /g, "");
	// 				}else{
	// 					currentVal = +that.text().replace(/,/g, ".").replace(/ /g, "").replace(/%/g, "");
	// 				}
	// 				let currentPT = d.properties.PRUID;
	// 				let newVal;
	// 				let percentSign = "";
	// 				if (timeData2[d.properties.PRUID][currentDate]) {
	// 					// if (vaccineDropdownVal == "percentoday") {
	// 					// 	newVal = timeData[d.properties.PRUID][currentDate][0][vaccineDropdowns] * 100;
	// 					// 	if (language == "en") {
	// 					// 		percentSign = "$";
	// 					// 	}
	// 					// 	else {
	// 					// 		percentSign = " $";
	// 					// 	}
	// 					// }
	// 					// else {
	// 						newVal = timeData2[d.properties.PRUID][currentDate][0][vaccineDropdowns];
	// 					// }
	// 				}
	// 				else {
	// 					if (index == 1) {
	// 						newVal = 0;
	// 					}
	// 					else {
	// 						newVal == currentVal;
	// 					}
	// 				}
	// 				if (!isNaN(+newVal)) {
	// 					// format = d3.format(",d");
	// 					d3.select(this.parentNode).classed("visible", true);
	// 					d3.select(this.parentNode).classed("invisible", false);
	// 					if (isNaN(+currentVal)) {
	// 						d3.select(this.parentNode).attr("fill-opacity", 0).transition().duration(500).attr("fill-opacity", 1);
	// 						currentVal = 0;
	// 					}
	// 					const i = d3.interpolateNumber(currentVal, +newVal);
	// 					return function(t) { that.text(generateTxt(i(t),numPropDropdownVal)); };
	// 				}
	// 			});
	// 		});

	// 		d3.select('.CanadaTextValue').each(function(d) {
	// 			d3.select(this).transition().duration(1200).tween("text", function() {
	// 				const that = d3.select(this);
	// 				// let format;
	// 				let i;
	// 				// let newVal;
	// 				// if (typeCases == "percentoday") {
	// 				// 	newVal = timeData[1][currentDate][0][vaccineDropdowns] * 100;
	// 				// }
	// 				// else {
	// 				let	newVal = timeData2[1][currentDate][0][vaccineDropdowns];
	// 				// }
	// 				// format = d3.format(",d");
	// 				if (language == "en") {
	// 					i = d3.interpolateNumber(that.text().replace(/,/g, ""), newVal);
	// 					return function(t) { that.text(generateTxt(i(t),numPropDropdownVal)); };
	// 				}
	// 				else {
	// 					i = d3.interpolateNumber(that.text().replace(/ /g, ""), newVal);
	// 					return function(t) { that.text(generateTxt(i(t),numPropDropdownVal)); };
	// 				}
	// 			});
	// 		});

	// 		/* d3.select('.repatriatedTextValue').each(function(d) {
	// 			d3.select(this).transition().duration(600).tween("text", function() {
	// 				const that = d3.select(this);
	// 				let format;
	// 				let i;
	// 				let newVal;
	// 				if (timeData[99][currentDate]) {
	// 					if (typeCases == "percentoday") {
	// 						newVal = timeData[99][currentDate][0][typeCases] * 100;
	// 					}
	// 					else {
	// 						newVal = timeData[99][currentDate][0][typeCases];
	// 					}
	// 				}
	// 				else {
	// 					newVal = 0;
	// 				}
	// 				format = d3.format(",d");
	// 				if (language == "en") {
	// 					i = d3.interpolateNumber(that.text().replace(/,/g, ""), newVal);
	// 					return function(t) { that.text(format(i(t))); };
	// 				}
	// 				else {
	// 					i = d3.interpolateNumber(that.text(), newVal);
	// 					return function(t) { that.text(format(i(t)).replace(",", " ")); };
	// 				}
	// 			});
	// 		}); */

	// 		d3.selectAll('.regionCircleText, .CanadaTextValue').attr("font-size", function() {
	// 			// if (vaccineDropdowns == "numtested") {
	// 			// 	return "13px";
	// 			// }
	// 			// else {
	// 				return "15px";
	// 			// };
	// 		});
			
		
	//         d3.select("#mapGroup").selectAll(".regions").selectAll(".regionDeathsLine").style("display",function(d,i){
	//         	if(mapData.get(d.properties.PRUID) && mapData.get(d.properties.PRUID).get(currentDate)){
	//         		return "";
	//         	}else{
	//         		return "none";
	//         	}
	//         })

	// 		if (animateSwitch == 0) {
	// 			d3.select("#animateMap").classed("btn-info", true);
	// 			d3.select("#animateMap").classed("btn-success", false);
	// 			d3.select("#animateMap").classed("off", true);
	// 			d3.select("#animateMap").classed("on", false);
	// 			d3.select("#animateMap").html('<i class="fa fa-play" aria-hidden="true"></i> Play');
	// 		}
	// 		else if (index == (datesArray.length - 1)) {
	// 			updateTrend();
	// 			index = 0;
	// 			d3.select("#animateMap").classed("btn-info", true);
	// 			d3.select("#animateMap").classed("btn-success", false);
	// 			d3.select("#animateMap").classed("off", true);
	// 			d3.select("#animateMap").classed("on", false);
	// 			d3.select("#animateMap").html('<i class="fa fa-play" aria-hidden="true"></i> Play');
	// 			animateSwitch = 0;
	// 			// createTable();
	// 			return;
	// 		}
	// 		else {
	// 			index++;
	// 			// createTable();
	// 			animateMap();
	// 			updateTrend();
	// 		}
	// 	}, 600)
	// }

	// d3.select("#animateMap").on("click", function() {
	// 	if (d3.select(this).classed("off")) {
	// 		d3.select(this).classed("btn-info", false);
	// 		d3.select(this).classed("btn-success", true);
	// 		d3.select(this).classed("off", false);
	// 		d3.select(this).classed("on", true);
	// 		d3.select(this).html('<i class="fa fa-pause" aria-hidden="true"></i> Pause');
	// 		animateSwitch = 1;
	// 		tempNums = { "1": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "24": 0, "35": 0, "46": 0, "47": 0, "48": 0, "59": 0, "60": 0, "61": 0, "62": 0, "99": 0 };
	// 		animateMap();
	// 	}
	// 	else {
	// 		d3.select(this).classed("btn-info", true);
	// 		d3.select(this).classed("btn-success", false);
	// 		d3.select(this).classed("off", true);
	// 		d3.select(this).classed("on", false);
	// 		d3.select(this).html('<i class="fa fa-play" aria-hidden="true"></i> Play');
	// 		animateSwitch = 0;
	// 	}
	// });
	
	
	
	// 		//JULY 17 NUMRECOVER
// 		d3.select("#bottomLeg text")
// 			.text(function() {
// 				if (language == "en") {
// 					if (typeCases == "numtoday") {
// 						return "Note: When displaying the number of new cases, data is only available for a complete day.";
// 					}
// 					else if (typeCases == "numtested") {
// 						return "Note: Provincial/territorial (PT) data reported on their websites should be used if there are discrepancies. This can be due to lags, differing reporting cut-offs, or changes in lab testing criteria. For PTs that report the number of tests completed, a formula is used to estimate the number of individuals tested.";
// 					}
// 					else if (typeCases == "numtotal") {
// 						return "Note: The cumulative number includes publicly reported confirmed and probable cases.";
// 					}
// 					else if (typeCases == "numrecover") {
// 						return "Note: On July 17, there was an increase in the number of recovered cases in Quebec due to a revision in how they define these cases."
// 					}
// 				}
// 				else {
// 					if (typeCases == "numtoday") {
// 						return "Remarque: Lorsque le nombre de nouveaux cas est affiché, les données sont seulement disponibles pour une jour complète.";
// 					}
// 					else if (typeCases == "numtested") {
// 						return "Remarque: Les données provinciales / territoriales (PT) signalées sur les sites Web des provinces et territoires être utilisées en cas d’écarts dans les données. Ces écarts peuvent être dûs à des retards, des dates de rapports différentes ou des changements dans les critères relatifs aux essais en laboratoire. Pour les provinces et territoires qui consignent le nombre de tests effectués, une formule est utilisée pour estimer le nombre de personnes testées.";
// 					}
// 					else if (typeCases == "numtotal") {
// 						return "Remarque: Le nombre cumulatif comprend les cas confirmés et probables rapportés publiquement.";
// 					}
// 					else if (typeCases == "numrecover") {
// 						return "Remarque: Le 17 juillet, il y avait une augmentation du nombre de personnes classifiées comme rétablies dans le Québec à cause des révisions de la façon dont ils définissent ces cas."
// 					}
// 				}
// 			})
// 			.call(wrap, 395)



// 		const bottomLeg = d3.select("#svg").append("g").attr("id", "bottomLeg").attr("transform", function(d, i) { return "translate(-100,545)" })

// 		//JULY 17 NUMRECOVER
// 		bottomLeg.append("text")
// 			.text(function() {
// 				if (language == "en") {
// 					if (typeCases == "numtoday") {
// 						return "Note: When displaying the number of new cases, data is only available for a complete day.";
// 					}
// 					else if (typeCases == "numtested") {
// 						return "Note: Provincial/territorial (PT) data reported on their websites should be used if there are discrepancies. This can be due to lags, differing reporting cut-offs, or changes in lab testing criteria. For PTs that report the number of tests completed, a formula is used to estimate the number of individuals tested.";
// 					}
// 					else if (typeCases == "numtotal") {
// 						return "Note: The cumulative number includes publicly reported confirmed and probable cases.";
// 					}
// 					else if (typeCases == "numrecover") {
// 						return "Note: On July 17, there was an increase in the number of recovered cases in Quebec due to a revision in how they define these cases."
// 					}
// 				}
// 				else {
// 					if (typeCases == "numtoday") {
// 						return "Remarque: Lorsque le nombre de nouveaux cas est affiché, les données sont seulement disponibles pour une jour complète.";
// 					}
// 					else if (typeCases == "numtested") {
// 						return "Remarque: Les données provinciales / territoriales (PT) signalées sur les sites Web des provinces et territoires être utilisées en cas d’écarts dans les données. Ces écarts peuvent être dûs à des retards, des dates de rapports différentes ou des changements dans les critères relatifs aux essais en laboratoire. Pour les provinces et territoires qui consignent le nombre de tests effectués, une formule est utilisée pour estimer le nombre de personnes testées.";
// 					}
// 					else if (typeCases == "numtotal") {
// 						return "Remarque: Le nombre cumulatif comprend les cas confirmés et probables rapportés publiquement.";
// 					}
// 					else if (typeCases == "numrecover") {
// 						return "Remarque: Le 17 juillet, il y avait une augmentation du nombre de personnes classifiées comme rétablies dans le Québec à cause des révisions de la façon dont ils définissent ces cas."
// 					}
// 				}
// 			})
// 			.attr("font-size", "12px")
// 			.attr("x", (x.range()[0] + 10))
// 			.style("text-anchor", "start")
// 			.attr("transform", "translate(90," + ((5) - (-1 * 0.3)) + ")")
// 			.call(wrap, 395)




// function draw_fig_vactype_leg(_option,_vaxStat,pruid,_update){
//     var chartDim = {
//         height: 600,
//         width: 1140,
//         margin: {
//             top: 20,
//             bottom: 145,
//             left: 150,
//             right: 50
//         }
//     };
	
// 	var legendDim = {
//     	sqr: 20,
//     	x: (chartDim.margin.left + 50),
//     	y: (chartDim.margin.top + 0),
//     	padding: 5,
//     	textPadding: 10
//     };
    
    
//     //find data row
//     let data;
//     for(let i=0; i<nestedData_byVac.length ; i++){
//         if(nestedData_byVac[i].key == pruid){
//             data = nestedData_byVac[i];
//             break;
//         }else{
//         	data = {key:pruid,values:[]};
//         }
//     }
    
    
//     let products_arr = ["Pfizer-BioNTech","Moderna","COVISHIELD","AstraZeneca","Not reported","Unknown"];
//     // let products_arr = ["Pfizer-BioNTech","Moderna","AstraZeneca","COVISHIELD","Not reported","Unknown"]; New vaccines
    
//     //check and if necessary, fill missing days with empty data
//     let noData = false;
//     if(data.values.length == 0 || (pruid == "24" && _vaxStat == "2doses")){ noData = true; }
    
    
//     datesArray.forEach(function(value,index){
//     	if(data.values.filter(function(el){ return el.key == value;}).length==0){
//     		data.values.splice(index,0,{key:value,values:[]});
//     	}
//     })
    
//     let vaxDateArray = [];
//     data.values.forEach(function(value,index){
//     	vaxDateArray.push(value.key);
//     })
    
//     //scales
//     var max = d3.max(data.values, function(value,i) {
// 		let currentSum = 0;
// 		value.values.forEach(function(value2,i2){
// 			currentSum += value2.value[_option + "_" + _vaxStat];
// 		})
// 		if(currentSum==0){
// 			return 5;
// 		}else{
// 			return currentSum;	
// 		}
// 	});
    
//     let maxPow = Math.floor(Math.log10(max));
//     let max2;
//     if(max != 0){
//     	max2 = Math.ceil(max/Math.pow(10,maxPow)) * Math.pow(10,maxPow);
//     }else{
//     	max2 = 0;
//     }
    
//     let x         = d3.scaleBand().domain(vaxDateArray).range([chartDim.margin.left,chartDim.width]).padding(0.05);
//     let y         = d3.scaleLinear().domain([0,max2]).range([(chartDim.height-chartDim.margin.bottom),chartDim.margin.top]);
//     let colour    = d3.scaleOrdinal().domain(products_arr).range(["#23763c","#31a354","#a1d99b","#e5f5e0","#bfbfbf","#000000"]);
//     // let colour    = d3.scaleOrdinal().domain(products_arr).range(["#377eb8","#4daf4a","#f4c20d","#ffffcc"]);
//     // let colour    = d3.scaleOrdinal().domain(products_arr).range(["#238b45","#74c476","#bae4b3","#edf8e9","#f4c20d","#ffffcc"]); New vaccines
    
//     let stackData = d3.stack()
// 		.keys(function(d){
// 			return products_arr;
// 		})
// 		.value(function(d,key){
// 			let currentVal = d.values.filter(function(el){ return el.key == key;});
// 			if(currentVal[0]){
// 				return currentVal[0].value[_option + "_" + _vaxStat];
// 			}else{
// 				return 0;
// 			}
// 		})(data.values);
		
//     if(_update){
//         if(d3.select("svg#byVaccine>#errText").node()){
//         	d3.select("svg#byVaccine>#errText").remove();
//         }
        
//         if(noData){
        	
//         	let errText = d3.select("svg#byVaccine").append("g")
// 				.attr("id","errText")
// 				.append("text")
// 				.attr("text-anchor","middle")
// 				.attr("font-size","1.5em")
// 				.attr("font-weight","bold")
// 				.attr("x",((chartDim.width + chartDim.margin.left) / 2))
// 				.attr("y",((chartDim.height - chartDim.margin.bottom)/2))
// 				.text(function(){
// 					if(language == "en"){
// 						return "Data Not Available";
// 					}else{
// 						return "Données non disponibles"
// 					}
// 				})
// 				.style("opacity",0)
// 				.transition().delay(600).duration(300).style("opacity",1);
    						
//     		d3.select("svg#byVaccine g").selectAll("g")
// 				// .data(stackData)
// 				.selectAll("rect")
// 				// .data(function(d){
// 				//     return d;
// 				// })
// 				.transition()
// 				.duration(700)
// 				.attr("y",function(d){
// 				    return chartDim.height - chartDim.margin.bottom;
// 				})
// 				.attr("height",function(d){
// 				    return 0;
// 				})
				
// 			d3.select("#fig6_yAxisLabel")
//             .text(function(d,i){
//             	if(language == "en"){
//             		if(_option == "numtotal"){
//                 		return "Cumulative number of people vaccinated";
//             		}else{
//                 		return "Cumulative percent of people vaccinated";
//             		}
//             	}else{
//             		if(_option == "numtotal"){
//                 		return "Nombre cumulatif de personnes vaccinées";
//             		}else{
//                 		return "Pourcentage cumulatif  de personnes vaccinées";
//             		}
//             	}
//             })
			
//         	return 0;
//         }
        
//         d3.select("svg#byVaccine g").selectAll("g").on("click", function() {
// 	    	d3.event.sourceEvent.stopPropagation(); // silence other listeners
// 		});
		
//         d3.select("svg#byVaccine g").selectAll("g")
//             .on("click", function(d,i)  {
//      //       	stackData = d3.stack()
// 					// .keys(function(d){
// 					// 	return products_arr;
// 					// })
// 					// .value(function(d,key){
// 					// 	let currentVal = d.values.filter(function(el){ return el.key == key;});
// 					// 	if(currentVal[0]){
// 					// 		return currentVal[0].value[_option + "_" + _vaxStat];
// 					// 	}else{
// 					// 		return 0;
// 					// 	}
// 					// })(data.values);
					
// 	            let j = i;
// 	            if(i == 0)
// 	                j = 1;
// 	            else
// 	                j = 0;
// 	            if(products_arr.length > 1){
// 	                isolate(stackData, products_arr, d.key, d3.select("svg#byVaccine g"));
// 	                if(d3.selectAll(".serie1legend:not(." + d.key.replace(" ","")+ ")").select("text").attr("class") == "added" && d3.select(".serie1legend." + d.key.replace(" ","")).select("text").attr("class") == "removed"){
// 	                    d3.selectAll(".serie1legend").selectAll("text").style("fill","#333").attr("class","added");
// 	                    d3.selectAll(".serie1legend").selectAll("rect").attr("fill", function(e) { return greens4reverse[products_arr.indexOf(e)]; }).style("opacity", 100).attr("class","added");
// 	                }else if(d3.selectAll(".serie1legend:not(." + d.key.replace(" ","") + ")").select("text").attr("class") == "added"){
// 	                    d3.selectAll(".serie1legend:not(." + d.key.replace(" ","") + ")").select("text").style("fill","#bfbfbf").attr("class","removed");
// 	                    d3.selectAll(".serie1legend:not(." + d.key.replace(" ","") + ")").select("rect").attr("fill", function(e) { return greens4reverse[products_arr.indexOf(e)]; }).style("opacity", 15).attr("class","removed");
// 	                }else{
// 	                    d3.selectAll(".serie1legend:not(." + d.key.replace(" ","") + ")").select("text").style("fill","#333").attr("class","added");
// 	                    d3.selectAll(".serie1legend:not(." + d.key.replace(" ","") + ")").select("rect").attr("fill", function(e) { return greens4reverse[products_arr.indexOf(e)]; }).style("opacity", 100).attr("class","added");
// 	                }
//             	}
//             })
//             .data(stackData)
//             .selectAll("rect")
//             .data(function(d){
//                 return d;
//             })
//             .transition()
//             .duration(500)
//             .attr("y",function(d){
//                 return y(d[1]);
//             })
//             .attr("height",function(d){
//             	if((y(d[0]) - y(d[1]) > 0) && ( y(d[0]) - y(d[1]) < 1)){
//             		let _currY = d3.select(this).attr("y");
//             		let _newY;
//             		if(d3.select(this.parentNode).attr("id") == "serie1AstraZeneca"){
//             			_newY = _currY - 1.5;
//             		}else if(d3.select(this.parentNode).attr("id") == "serie1Unknown"){
//             			_newY = _currY - 2.0;
//             		}else{
//             			_newY = _currY - 0;
//             		}
//             		d3.select(this).attr("y",_newY);
//             		return 1.5;
//             	}else{
//             		return y(d[0]) - y(d[1]);
//             	}
//             })
            
//             d3.select("svg#byVaccine g").selectAll("rect").each(function(d){
//             	d3.select(this).select("title")
//             		.text(function(d,i){
// 			        	let vaccineType = this.parentNode.parentNode.id.slice(6);
// 			        	if(vaccineType == "Notreported"){
// 			        		vaccineType = short2txt(vaccineType);
// 			        	}
// 			        	return vaccineType + " " + "(" + formatTime(parseTime(d.data.key)) + "): " + generateTxt(d[1]-d[0],_option);
// 	        			// return this.parentNode.parentNode.id.slice(6) + " " + "(" + formatTime(parseTime(d.data.key)) + "): " + generateTxt(d[1]-d[0],_option);
// 	        		})
//             })
            
//         // d3.select("svg#byVaccine").selectAll("title").transition().duration(700)
//         // 	.text(function(d,i){
//         // 		console.log(d,i);
// 	       // 	return this.parentNode.parentNode.id.slice(6) + " " + "(" + formatTime(parseTime(d.data.key)) + "): " + generateTxt(d[1]-d[0],_option) + "--"+(d[1]-d[0]);
// 	       // })
        
//         d3.select("svg#byVaccine").select("g #fig6_y")
// 			.call(d3.axisLeft(y).ticks(5).tickFormat(function(d){
// 				if(_option == "prop"){
// 					if(language == "en"){
// 						return generateTxt(d,"prop");
// 					}else{
// 						return generateTxt(d,"prop");
// 					}
// 				}else{
// 					return numberFormat(d);
// 				}
// 			}))
// 		    .selectAll("text")
// 			.attr("class","axisTextLablez")
// 		    .attr("font-size","16px")
		    
// 		d3.select("#fig6_yAxisLabel")
//             .text(function(d,i){
//             	if(language == "en"){
//             		if(_option == "numtotal"){
//                 		return "Cumulative number of people vaccinated";
//             		}else{
//                 		return "Cumulative percent of people vaccinated";
//             		}
//             	}else{
//             		if(_option == "numtotal"){
//                 		return "Nombre cumulatif de personnes vaccinées";
//             		}else{
//                 		return "Pourcentage cumulatif  de personnes vaccinées";
//             		}
//             	}
//             })
            
//         d3.selectAll(".legendVaccineType").selectAll("g").on("click", function() {
// 	    	d3.event.sourceEvent.stopPropagation(); // silence other listeners
// 		});
		
//         d3.selectAll(".legendVaccineType")
// 	        .selectAll("g")
// 	        .on("click", function(d,i)  {
// 	            let j = i;
// 	            if(i == 0)
// 	                j = 1;
// 	            else
// 	                j = 0;
// 	            if(products_arr.length > 1){
// 	                isolate(stackData, products_arr, d, d3.select("svg#byVaccine g"));
// 	                if(d3.selectAll(".serie1legend:not(." + d.replace(" ","")+ ")").select("text").attr("class") == "added" && d3.select(".serie1legend." + d.replace(" ","")).select("text").attr("class") == "removed"){
// 	                    d3.selectAll(".serie1legend").selectAll("text").style("fill","#333").attr("class","added");
// 	                    d3.selectAll(".serie1legend").selectAll("rect").attr("fill", function(e) { return greens4reverse[products_arr.indexOf(e)]; }).style("opacity", 100).attr("class","added");
// 	                }else if(d3.selectAll(".serie1legend:not(." + d.replace(" ","") + ")").select("text").attr("class") == "added"){
// 	                    d3.selectAll(".serie1legend:not(." + d.replace(" ","") + ")").select("text").style("fill","#bfbfbf").attr("class","removed");
// 	                    d3.selectAll(".serie1legend:not(." + d.replace(" ","") + ")").select("rect").attr("fill", function(e) { return greens4reverse[products_arr.indexOf(e)]; }).style("opacity", 15).attr("class","removed");
// 	                }else{
// 	                    d3.selectAll(".serie1legend:not(." + d.replace(" ","") + ")").select("text").style("fill","#333").attr("class","added");
// 	                    d3.selectAll(".serie1legend:not(." + d.replace(" ","") + ")").select("rect").attr("fill", function(e) { return greens4reverse[products_arr.indexOf(e)]; }).style("opacity", 100).attr("class","added");
// 	                }
// 	        	}
// 	        })   

//         return 0;
//     }
    
//     let svg = d3.select("#fig6").append("svg")
//             .attr("width", "100%")
//             .attr("height", function(d){
//             	if(isIE){
//             		return chartDim.height;
//             	}
//             })
//             .attr("perserveAspectRatio","xMinyMin meet")
//             .attr("viewBox","0 0 "+ chartDim.width +" "+ chartDim.height +"")
//             .attr("id","byVaccine");
            
//         svg.append("g")
//             .selectAll("g")
//             .data(stackData)
//             .enter()
//             .append("g")
//             .attr("id",function(d){
//                 return "serie1" + d.key.replace(" ","");
//             })
//             .attr("class","serie1")
//             .attr("fill", function(d,i){
//                 return greens4reverse[i];
//             })
//             .on("click", function(d,i)  {
//             	stackData = d3.stack()
// 					.keys(function(d){
// 						return products_arr;
// 					})
// 					.value(function(d,key){
// 						let currentVal = d.values.filter(function(el){ return el.key == key;});
// 						if(currentVal[0]){
// 							return currentVal[0].value[_option + "_" + _vaxStat];
// 						}else{
// 							return 0;
// 						}
// 					})(data.values);
					
// 	            let j = i;
// 	            if(i == 0)
// 	                j = 1;
// 	            else
// 	                j = 0;
// 	            if(products_arr.length > 1){
// 	                isolate(stackData, products_arr, d.key, svg);
// 	                if(d3.selectAll(".serie1legend:not(." + d.key.replace(" ","")+ ")").select("text").attr("class") == "added" && d3.select(".serie1legend." + d.key.replace(" ","")).select("text").attr("class") == "removed"){
// 	                    d3.selectAll(".serie1legend").selectAll("text").style("fill","#333").attr("class","added");
// 	                    d3.selectAll(".serie1legend").selectAll("rect").attr("fill", function(e) { return greens4reverse[products_arr.indexOf(e)]; }).style("opacity", 100).attr("class","added");
// 	                }else if(d3.selectAll(".serie1legend:not(." + d.key.replace(" ","") + ")").select("text").attr("class") == "added"){
// 	                    d3.selectAll(".serie1legend:not(." + d.key.replace(" ","") + ")").select("text").style("fill","#bfbfbf").attr("class","removed");
// 	                    d3.selectAll(".serie1legend:not(." + d.key.replace(" ","") + ")").select("rect").attr("fill", function(e) { return greens4reverse[products_arr.indexOf(e)]; }).style("opacity", 15).attr("class","removed");
// 	                }else{
// 	                    d3.selectAll(".serie1legend:not(." + d.key.replace(" ","") + ")").select("text").style("fill","#333").attr("class","added");
// 	                    d3.selectAll(".serie1legend:not(." + d.key.replace(" ","") + ")").select("rect").attr("fill", function(e) { return greens4reverse[products_arr.indexOf(e)]; }).style("opacity", 100).attr("class","added");
// 	                }
//             	}
//             })
//             .selectAll("rect")
//             .data(function(d){
//                 return d;
//             })
//             .enter()
//             .append("rect")
//             .attr("x",function(d){
//                 return x(d.data.key);
//             })
//             .attr("y",function(d){
//                 return y(d[1]);
//             })
//             .attr("height", function(d){
//             	if((y(d[0]) - y(d[1]) > 0) && ( y(d[0]) - y(d[1]) < 1)){
//             		let _currY = d3.select(this).attr("y");
//             		let _newY;
//             		if(d3.select(this.parentNode).attr("id") == "serie1AstraZeneca"){
//             			_newY = _currY - 1.5;
//             		}else if(d3.select(this.parentNode).attr("id") == "serie1Unknown"){
//             			_newY = _currY - 2.0;
//             		}else{
//             			_newY = _currY - 0;
//             		}
//             		d3.select(this).attr("y",_newY);
//             		return 1.5;
//             	}else{
//             		return y(d[0]) - y(d[1]);
//             	}
//             })
//             .attr("width",function(d){
//             	// if(x.bandwidth() > 50){
//             	// 	return 50;
//             	// }else{
//                 	return x.bandwidth();
//             	// }
//             })
// 	        .append("title")
// 	        .text(function(d,i){
// 	        	let vaccineType = this.parentNode.parentNode.id.slice(6);
// 	        	if(vaccineType == "Notreported"){
// 	        		vaccineType = short2txt(vaccineType);
// 	        	}
// 	        	return vaccineType + " " + "(" + formatTime(parseTime(d.data.key)) + "): " + generateTxt(d[1]-d[0],_option);
// 	        })
//             // .attr("fill", function(d,i){
//             //     return d3.schemeCategory10[i];
//             // })
            
//     let legend = svg.append("g")
//     	.attr("class","legendVaccineType")
//         .selectAll("g")
//         .data(products_arr.slice())
//         .enter().append("g")
//         .attr("class",function(d,i){
//             return "serie1legend " + d.replace(" ","");
//         })
//         .on("click", function(d,i)  {
//             let j = i;
//             if(i == 0)
//                 j = 1;
//             else
//                 j = 0;
//             if(products_arr.length > 1){
//                 isolate(stackData, products_arr, d, svg);
//                 if(d3.selectAll(".serie1legend:not(." + d.replace(" ","")+ ")").select("text").attr("class") == "added" && d3.select(".serie1legend." + d.replace(" ","")).select("text").attr("class") == "removed"){
//                     d3.selectAll(".serie1legend").selectAll("text").style("fill","#333").attr("class","added");
//                     d3.selectAll(".serie1legend").selectAll("rect").attr("fill", function(e) { return greens4reverse[products_arr.indexOf(e)]; }).style("opacity", 100).attr("class","added");
//                 }else if(d3.selectAll(".serie1legend:not(." + d.replace(" ","") + ")").select("text").attr("class") == "added"){
//                     d3.selectAll(".serie1legend:not(." + d.replace(" ","") + ")").select("text").style("fill","#bfbfbf").attr("class","removed");
//                     d3.selectAll(".serie1legend:not(." + d.replace(" ","") + ")").select("rect").attr("fill", function(e) { return greens4reverse[products_arr.indexOf(e)]; }).style("opacity", 15).attr("class","removed");
//                 }else{
//                     d3.selectAll(".serie1legend:not(." + d.replace(" ","") + ")").select("text").style("fill","#333").attr("class","added");
//                     d3.selectAll(".serie1legend:not(." + d.replace(" ","") + ")").select("rect").attr("fill", function(e) { return greens4reverse[products_arr.indexOf(e)]; }).style("opacity", 100).attr("class","added");
//                 }
//         	}
//         })
    		
// 	// products_arr.forEach(function(value,index){
// 	legend.append("rect")
// 	//.attr("stroke","#bfbfbf")
// 		// .attr("x", (legendDim.x + ((chartDim.width/5)*index)))
// 		.attr("x", (legendDim.x))
// 		// .attr("y", (legendDim2.y))
// 		.attr("y",function(d,i){
//     		return (legendDim.y + (i*(legendDim.padding + legendDim.sqr)));
//     	})
//     	.attr("width",legendDim.sqr)
//     	.attr("height",legendDim.sqr)
// 		.attr("fill",function(d,i){
//         	return greens4reverse[i];
// 		})
// 		.style("cursor","pointer")
			
// 	legend.append("text")
// 		.style("cursor","pointer")
// 		.attr("text-anchor","start")
//     	.attr("font-size","0.8em")
//     	.attr("font-weight","bold")
//     	.attr("x",function(){
//     		return legendDim.x + legendDim.sqr + legendDim.textPadding;
//     	})
//     	.attr("y",function(d,i){
//     		return (legendDim.y + legendDim.sqr +(i*(legendDim.padding + legendDim.sqr)));
//     	})
//     	.text(function(d,i){
//     		if(d == "Not reported" || d == "Unknown"){
//     			return short2txt(d);
//     		}else{
//     			return d;
//     		}
//     	})
//         .attr("class","added")
				
// 	// })
    
//     let axis = svg.append("g")
//                   .attr("id","axisG");
                  
//     axis.append("g")
//     	.attr("id","fig6_y")
//     	.attr("transform", "translate("+chartDim.margin.left+",0)")
// 		.call(d3.axisLeft(y).ticks(5).tickFormat(function(d){
// 			if(_option == "prop"){
// 				if(language == "en"){
// 					return generateTxt(d,"prop");
// 				}else{
// 					return generateTxt(d,"prop");
// 				}
// 			}else{
// 				return numberFormat(d);
// 			}
// 		}))
//     .selectAll("text")
// 			.attr("class","axisTextLablez")
//     	.attr("font-size","16px")
    
    
//     // (data.values).forEach(function(value,index){
//     //     axis.append("g")
//     //             .attr("class","xSub")
//     //             .attr("transform", "translate("+ x(value.key) +","+(chartDim.height - chartDim.margin.bottom)+")")
//     //             .call(d3.axisBottom(xSubgroup));
//     // })
    
    
//     axis.append("g")
//             .attr("id","fig6_x")
//             .attr("transform", "translate(0,"+ (chartDim.height - chartDim.margin.bottom)+")")
//             .call(d3.axisBottom(x).tickFormat(function(d){
//             	return d3.timeFormat("%d %b %Y")(parseTime(d));
//             }))
//             .selectAll("text")
//             .attr("transform","rotate(-45)")
//             .style("text-anchor","end")
// 			.attr("class","axisTextLablez")
//             // .attr("fill","red")
//             .attr("dy","1.2em")
//             .attr("font-size","16px");
    
//     axis.append("text")
//             .attr("font-size","20px")
//             .attr("font-weight","bold")
//             .attr("text-anchor","middle")
//             .attr("y",function(){
//                 // return chartDim.margin.left/2;
//                 return chartDim.margin.left/3;
//             })
//             .attr("x",function(d,i){
//                 return 0;
//             })
//             .attr("transform",function(){
//                 return "translate("+ -25 +","+ ((chartDim.height/2) - 50) +")rotate(-90)";
//             })
//             .append("tspan")
//             .attr("id","fig6_yAxisLabel")
//             .text(function(d,i){
//             	if(language == "en"){
//             		if(_option == "numtotal"){
//                 		return "Cumulative number of people vaccinated";
//             		}else{
//                 		return "Cumulative percent of people vaccinated";
//             		}
//             	}else{
//             		if(_option == "numtotal"){
//                 		return "Nombre cumulatif de personnes vaccinées";
//             		}else{
//                 		return "Pourcentage cumulatif  de personnes vaccinées";
//             		}
//             	}
//             })
    
//     axis.append("text")
//             .attr("font-size","16px")
//             .attr("font-weight","bold")
//             .attr("text-anchor","middle")
//             .attr("y",function(){
//                 return -10;
//             })
//             .attr("x",function(d,i){
//                 return 0;
//             })
//             .attr("transform",function(){
//                 return "translate("+ 
//                         (chartDim.width/2) +
//                         ","+ chartDim.height +")";
//             })
//             .append("tspan")
//             .attr("id","fig6_xAxisLabel")
//             .text(function(d,i){
//             	if(language == "en"){
//             		return "Report week";
//             	}else{
//             		//FRENCH
//             		return "Semaine de rapport";
//             	}
//             })

// 	function isolate(data, keys1, key, svg) {
// 	    if (selectedBreakdown != null ) {
	    	
// 	    	svg.selectAll(".serie1")
// 	            .data(data)
// 	            .selectAll("rect")
// 	            .data(function(d){
// 	                return d;
// 	            })
	            
// 	        svg.select("#serie1" + selectedBreakdown)
// 		        .selectAll("rect")
// 	            .interrupt()
// 		        .transition()
// 	            .ease(d3.easeBounce)
// 		        .duration(800)
// 		        .attr("y", function(d) { return y(d[1]); })
	        
// 	        svg.selectAll(".serie1:not(#serie1" + selectedBreakdown + ")")
// 		        .selectAll("rect")
// 	            // .interrupt()
// 		        .transition()
// 	            .delay(500)
// 		        .duration(500)
// 		        .style("opacity", 1);
	        
// 	        selectedBreakdown = null;
	        
// 	    } else {
// 	        selectedBreakdown = key.replace(" ","");
// 	        let i = 0;
// 	        if(selectedBreakdown == "Moderna"){
// 	        	i = 1;
// 	        }else if(selectedBreakdown == "Notreported" || selectedBreakdown == "Nonrapporté"){
// 	        	i = 2;
// 	        }else if(selectedBreakdown == "Unknown" || selectedBreakdown == "Inconnu"){
// 	        	i = 3;
// 	        }
	        
// 	        svg.selectAll(".serie1:not(#serie1" + selectedBreakdown + ")")
// 	            .selectAll("rect")
// 	        	.interrupt()
// 	            .transition()
// 	            .duration(500)    
// 	            .style("opacity", 0)
	            
// 	        svg.select("#serie1" + selectedBreakdown)
// 	            .selectAll("rect")
// 	            // .interrupt()
// 	            .transition()
// 	            .delay(500)
// 	            .ease(d3.easeBounce)
// 	            .duration(800)
// 	            .attr("y", function(d) { return y(0) - this.height.baseVal.value; })
	            
// 	    }
// 	}
    			
//     return 0;
// }

//Build Figure 3. Key populations - Stacked Bar Small Multiple
// function buildKeyPopSmallMultiple(data_keyPop) {
//     var totalMax = d3.max(data_keyPop,function(d){return +d.prop_atleast1dose});
	
//     let maxPow = Math.floor(Math.log10(totalMax));
//     let max2;
//     if(totalMax != 0){
//     	max2 = Math.ceil(totalMax/Math.pow(10,maxPow)) * Math.pow(10,maxPow);
//     }else{
//     	max2 = 0;
//     }
    
//     //Get array of subgroups
//     var subgroups = ["prop_2doses","prop_1dose"]
    
//     var fig3ddlVal = d3.select("#fig3-ddl").property("value");
    
//     //Set the stage for the small multiples
//     var margin = {top: 10, right: 0, bottom: 80, left: 60},
//     width = 330 - margin.left - margin.right,
//     height = 350 - margin.top - margin.bottom;

//     var keyPopContainer = d3.selectAll("#keyPop-sm .keyPop").data(keyPop_nestedData);
    
//     //Small Multiple Circles + Text
//     // var currentDataCirc = keyPopContainer.select(".currentDataCirc").append("svg").style("overflow","visible").attr("width","100%").attr("height","88px").append("g").attr("transform","translate(-27,0)");
        
//     //     currentDataCirc.append("circle").attr("cx",67).attr("cy",55).attr("r",60)
//     //     .attr("fill","none").attr("stroke","#aba6a6").attr("stroke-dasharray",4)
        
//     //     currentDataCirc.append("text").style("text-anchor", "middle").attr("x",67).attr("y",50).attr("fill","black").attr("font-size","14")
//     //     .text(function(d){
//     //     	//Get latest data (full vax)
//     //     	return short2txt("Two doses:") + generateTxt(+d.values[timeArray.length-1].prop_2doses,"prop");
//     //     })   
        
//     //     currentDataCirc.append("text").style("text-anchor", "middle").attr("x",67).attr("y",70).attr("fill","black").attr("font-size","14")
//     //     .text(function(d){
//     //     	//Get latest data (partial)
//     //     	return short2txt("One dose:") + generateTxt(+d.values[timeArray.length-1].prop_1dose,"prop");
//     //     }) 
        
        
//     //Small Multiple Graphs
//     var svg = keyPopContainer.select(".stackedBar").append("svg")
//     .attr("class",function(d,i){
//         return "svg"+i;
//     })
//     .attr("width", "100%")
//     .attr("height", height + margin.top + margin.bottom)
//     .attr("perserveAspectRatio","xMinyMin meet")
//     .attr("viewBox","0 0 "+ (width + margin.left + margin.right) +" "+ (height + margin.top + margin.bottom)+"")
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
//     // Add X axis
//     var keyPop_x = d3.scaleBand()
//       .domain(timeArray)
//       .range([0, width])
//       .padding([0.2])
    
//     var keyPop_xAxis = svg.append("g");
//     keyPop_xAxis.attr("class","x-axis")
//     			.attr("transform", "translate(0," + height + ")")
//     			.call(d3.axisBottom(keyPop_x))
//     			.selectAll("text")
//     			.attr("y", 0)
//     			.attr("x", -6)
//     			.attr("dy", ".71em")
//     			.attr("transform", "rotate(-45)")
//     			.style("text-anchor", "end");
    			
//     keyPop_xAxis.append("text")
//     .attr("fill","black")
//     .attr("font-size","14px")
//     .attr("font-weight","bold")
//     .style("text-anchor", "middle")
// 	.attr("y", 70)
// 	.attr("x", width/2)
//     .text(function(){
//     	if(language=="en"){
//     		return "Report week";
//     	}else{
//     		return "Semaine de rapport";
//     	}
//     });		

	
//     // Add Y axis
//     var keyPop_y = d3.scaleLinear()
//     .domain([0, max2])
//     .range([height, 0 ]);
    
//     var keyPop_yAxis = svg.append("g");
    
//     keyPop_yAxis.append("g").attr("class", "y-axis")
//     .call(d3.axisLeft(keyPop_y));
    
//     let _option = d3.select("#fig3-ddl").node().value;
    
//     keyPop_yAxis.append("text")
//             .attr("font-weight","bold")
//             .attr("text-anchor","middle")
//             .attr("y",function(){
//     		    // return chartDim.margin.left/2;
//     		    return 0;
//     		})
//     		.attr("x",function(d,i){
//     		    return 0;
//     		})
//     		.attr("transform",function(){
//     		    return "translate("+ -50 +","+ ((height/2) + 30) +")rotate(-90)";
//     		})
//             .append("tspan")
//             .attr("font-size","14px")
//             .attr("class","fig2_yAxisLabel")
//             .text(function(d,i){
//             		if(language == "en"){
//             			if(_option == "numtotal"){
//             	    		return "Cumulative number of people vaccinated";
//             			}else{
//             	    		return "Cumulative percent of people vaccinated";
//             			}
//             		}else{
//             			if(_option == "numtotal"){
//             	    		return "Nombre cumulatif de personnes vaccinées";
//             			}else{
//             	    		return "Pourcentage cumulatif de personnes vaccinées";
//             			}
//             		}
//             });
		
// 	// color palette = one color per subgroup
//     var color = d3.scaleOrdinal()
//         .domain(subgroups)
//         .range(['#31a354','#c2e699'])
        
//     // Show the bars
//     var currentSubGroup;
    
//     svg.append("g")
//     .attr("class","stacks")
//     .selectAll("g")
//     // Enter in the stack data = loop key per key = group per group
//     .data(function(d,i){
//         return d3.stack().keys(subgroups)(d.values);
//     })
//     .enter().append("g")
//         .attr("class",function(d,i) {
//         	currentSubGroup = subgroups[i];
//         	return currentSubGroup;
//         })
//         .attr("fill", function(d) { return color(d.key); })
//         .selectAll("rect")
//         // enter a second time = loop subgroup per subgroup to add all rectangles
//         .data(function(d) { return d; })
//         .enter().append("rect")
//         .attr("class",function(d){
//         	return currentSubGroup;
//         })
//         .attr("x", function(d) { 
//     		return keyPop_x(formatTime(d.data.date)); 
//         })
//         .attr("y", function(d) { return keyPop_y(d[1]); })
//         .attr("height", function(d) { return keyPop_y(d[0]) - keyPop_y(d[1]); })
//         .attr("width",function(d,i) {
//             if(i == (+timeArray.length-1)){
//                 return keyPop_x.bandwidth();
//             }else{
//                 return keyPop_x.bandwidth();
//             }
//         })
//         .append("title")
//         .text(function(d,i){
//         	let numDoses;
//     		if(this.parentNode.parentNode.classList[0] == "prop_1dose" || this.parentNode.parentNode.classList[0] == "numtotal_1dose"){
//     			numDoses = "_1dose";
//     		}else{
//     			numDoses = "_2doses";
//     		}
//         	return short2txt(this.parentNode.parentNode.classList[0]) + " " + "(" + formatTime(d.data.date) + "): " + generateTxt(d.data[fig3ddlVal+numDoses],fig3ddlVal);
//         })
    
//         //Update Figure 3
//         function updateKeyPopSmallMultiple () {
//                 var fig3ddlVal = d3.select("#fig3-ddl").property("value");
//                 subgroups = [fig3ddlVal+"_2doses",fig3ddlVal+"_1dose"];
                
//                 //Transition to new y-axis
//                 totalMax = d3.max(data_keyPop,function(d){return +d[fig3ddlVal+"_atleast1dose"]});
// 			    let maxPow = Math.floor(Math.log10(totalMax));
// 			    let max2;
// 			    if(totalMax != 0){
// 			    	max2 = Math.ceil(totalMax/Math.pow(10,maxPow)) * Math.pow(10,maxPow);
// 			    }else{
// 			    	max2 = 0;
// 			    }
//                 keyPop_y = d3.scaleLinear()
//                 .domain([0, max2])
//                 .range([height, 0 ]);
//                 d3.selectAll(".y-axis").transition().duration(500).call(d3.axisLeft(keyPop_y));
    
//                 //Bind and transition to new stack data
//                 keyPop_nestedData.forEach(function(d,i){
//                     var newStack = d3.stack().keys(subgroups)(d.values);
//                     d3.selectAll(".svg"+i+" .stacks g").data(newStack);
//                     d3.selectAll(".svg"+i+" .stacks g").each(function(d,j){
//                         d3.select(this).selectAll("rect")
//                         .data(function(d,i){ return newStack[j%2] })
//                         .transition().duration(500)
//                         .attr("y", function(d) { return keyPop_y(d[1]); })
//                         .attr("height", function(d) { return keyPop_y(d[0]) - keyPop_y(d[1]); })
                        
//                         d3.select(this).selectAll("title")
//                         .data(function(d,i){ return newStack[j%2] })
// 				        .text(function(d,i){
// 				        	let numDoses;
// 	                		if(this.parentNode.parentNode.classList[0] == "prop_1dose" || this.parentNode.parentNode.classList[0] == "numtotal_1dose"){
// 	                			numDoses = "_1dose";
// 	                		}else{
// 	                			numDoses = "_2doses";
// 	                		}
// 				        	return short2txt(this.parentNode.parentNode.classList[0]) + " " + "(" + formatTime(d.data.date) + "): " + generateTxt(d.data[fig3ddlVal+numDoses],fig3ddlVal);
// 				        })
    
//                     })
//                 })
                
                
//                 _option = d3.select("#fig3-ddl").node().value;
//                 d3.selectAll(".fig2_yAxisLabel").text(function(d){
//                 	if(language == "en"){
//             			if(_option == "numtotal"){
//             	    		return "Cumulative number of people vaccinated";
//             			}else{
//             	    		return "Cumulative percent of people vaccinated";
//             			}
//             		}else{
//             			if(_option == "numtotal"){
//             	    		return "Nombre cumulatif de personnes vaccinées";
//             			}else{
//             	    		return "Pourcentage cumulatif de personnes vaccinées";
//             			}
//             		}
//                 })
                
//                 // d3.selectAll("#keyPop-sm .keyPop").selectAll(".currentDataCirc").selectAll("text")
//                 // .text(function(d,i){
//                 // 	if(i==1){
//                 // 		if(fig3ddlVal == "prop"){
//                 // 			return short2txt("One dose:") + generateTxt(+d.values[timeArray.length-1][fig3ddlVal+"_1dose"],"prop");
//                 // 		}else{
//                 // 			return short2txt("One dose:") + generateTxt(+d.values[timeArray.length-1][fig3ddlVal+"_1dose"],"num");
//                 // 		}
//                 // 	}else if(i==0){
//                 // 		if(fig3ddlVal == "prop"){
//                 // 			return short2txt("Two doses:") + generateTxt(+d.values[timeArray.length-1][fig3ddlVal+"_2doses"],"prop");
//                 // 		}else{
//                 // 			return short2txt("Two doses:") + generateTxt(+d.values[timeArray.length-1][fig3ddlVal+"_2doses"],"num");
//                 // 		}
//                 // 	}
//                 // })
//         }
        
//     d3.select("#fig3-ddl").on("change",function(){
//     	var timeArrayEndPos = timeArray.length-1;
//     	if(this.value == "numtotal"){
// 		    d3.selectAll(".age80_prop_atleast1dose_txt").text(generateTxt(keyPop_nestedData[0].values[timeArrayEndPos].numtotal_atleast1dose,"numtotal"));
// 		    d3.selectAll(".hcw_prop_atleast1dose_txt").text(generateTxt(keyPop_nestedData[1].values[timeArrayEndPos].numtotal_atleast1dose,"numtotal"));
// 		    d3.selectAll(".congregate_prop_atleast1dose_txt").text(generateTxt(keyPop_nestedData[2].values[timeArrayEndPos].numtotal_atleast1dose,"numtotal"));
// 		    //d3.selectAll(".remoteIsolated_prop_atleast1dose_txt").text(percentFormat(keyPop_nestedData[3].values[timeArrayEndPos].prop_atleast1dose));
		    
// 		    d3.selectAll(".age80_prop_1dose_txt").text(generateTxt(keyPop_nestedData[0].values[timeArrayEndPos].numtotal_1dose,"numtotal"));
// 		    d3.selectAll(".hcw_prop_1dose_txt").text(generateTxt(keyPop_nestedData[1].values[timeArrayEndPos].numtotal_1dose,"numtotal"));
// 		    d3.selectAll(".congregate_prop_1dose_txt").text(generateTxt(keyPop_nestedData[2].values[timeArrayEndPos].numtotal_1dose,"numtotal"));
// 		    //d3.selectAll(".remoteIsolated_prop_atleast1dose_txt").text(percentFormat(keyPop_nestedData[3].values[timeArrayEndPos].prop_atleast1dose));
		    
// 		    d3.selectAll(".age80_prop_2doses_txt2").text(generateTxt(keyPop_nestedData[0].values[timeArrayEndPos].numtotal_2doses,"numtotal"));
// 		    d3.selectAll(".hcw_prop_2doses_txt2").text(generateTxt(keyPop_nestedData[1].values[timeArrayEndPos].numtotal_2doses,"numtotal"));
// 		    d3.selectAll(".congregate_prop_2doses_txt2").text(generateTxt(keyPop_nestedData[2].values[timeArrayEndPos].numtotal_2doses,"numtotal"));
//     	}else{
//     		d3.selectAll(".age80_prop_atleast1dose_txt").text(generateTxt(keyPop_nestedData[0].values[timeArrayEndPos].prop_atleast1dose,"prop"));
// 		    d3.selectAll(".hcw_prop_atleast1dose_txt").text(generateTxt(keyPop_nestedData[1].values[timeArrayEndPos].prop_atleast1dose,"prop"));
// 		    d3.selectAll(".congregate_prop_atleast1dose_txt").text(generateTxt(keyPop_nestedData[2].values[timeArrayEndPos].prop_atleast1dose,"prop"));
		    
//     		d3.selectAll(".age80_prop_1dose_txt").text(generateTxt(keyPop_nestedData[0].values[timeArrayEndPos].prop_1dose,"prop"));
// 		    d3.selectAll(".hcw_prop_1dose_txt").text(generateTxt(keyPop_nestedData[1].values[timeArrayEndPos].prop_1dose,"prop"));
// 		    d3.selectAll(".congregate_prop_1dose_txt").text(generateTxt(keyPop_nestedData[2].values[timeArrayEndPos].prop_1dose,"prop"));
// 		    //d3.selectAll(".remoteIsolated_prop_atleast1dose_txt").text(percentFormat(keyPop_nestedData[3].values[timeArrayEndPos].prop_atleast1dose));
		    
// 		    d3.selectAll(".age80_prop_2doses_txt2").text(generateTxt(keyPop_nestedData[0].values[timeArrayEndPos].prop_2doses,"prop"));
// 		    d3.selectAll(".hcw_prop_2doses_txt2").text(generateTxt(keyPop_nestedData[1].values[timeArrayEndPos].prop_2doses,"prop"));
// 		    d3.selectAll(".congregate_prop_2doses_txt2").text(generateTxt(keyPop_nestedData[2].values[timeArrayEndPos].prop_2doses,"prop"));
//     	}
		    
//     	updateKeyPopSmallMultiple();
//     })
// }

// <h3 class="figTitle">Figure 2. 
//         <select id="fig3-ddl">
//             <option value="numtotal">Nombre cumulatif</option>
//             <option selected value="prop">Pourcentage cumulatif</option>
//             <!--<option value="propweekdelta">Pourcentage depuis le dernier rapport</option>-->
//         </select>
//         des populations clés ayant reçu <strong><span style="background-color:#c2e699;color:black">une dose</span></strong> ou <strong><span style="background-color:#268745;color:white;">deux doses</span></strong> d'un vaccin contre la COVID-19 au Canada par semaine de rapport, <span class="updateDate">JJ MMM, AAAA</span></h3>
        
//         <p id="keyPopInstruct"><i class="fa fa-info-circle" aria-hidden="true"></i> Survolez les barres pour voir le nombre ou le pourcentage cumulatif de personnes vaccinées au fil du temps.</p>     
//         <div class="row">
//         <div id="keyPop-sm" class="col-md-12">
//             <div class="col-md-4 keyPop" id="keyPop-age80">
//                 <div class="row">
//                     <div class="col-xs-12" style="padding-left:10px;height:255px;">
//                         <h4 style="font-size:19px;margin-bottom:0px;margin-top:20px;">80 ans et plus</h4>
//                         <small><span class="age80_prop_atleast1dose_txt">{pourcentage des adultes âgées de 80 ans et plus partiellement vaccinées}</span> des adultes de 80 ans et plus ont reçu au moins une dose d’un vaccin contre la COVID-19. <span class="age80_prop_1dose_txt">{pourcentage des adultes âgées de 80 ans et plus partiellement vaccinées}</span> ont reçu une seule dose tandis que <span class="age80_prop_2doses_txt2">{Pourcentage des adultes âgées de 80 ans et plus entièrement vaccinées}</span> en ont reçu deux.</small>
//                         <br><br>
//                     </div>
//                     <!--<div class="col-xs-4 currentDataCirc">-->
//                     <!--</div>-->
//                 </div>
//                 <div class="row">
//                 <div class="stackedBar col-md-12"></div>
//                 </div>
//             </div>
//             <div class="col-md-4 keyPop" id="keyPop-hcw">
//                  <div class="row">
//                     <div class="col-xs-12" style="padding-left:10px;height:255px;">
//                         <h4 style="font-size:19px;margin-bottom:0px;margin-top:20px;">Travailleurs de la santé désignés pour une vaccination prioritaire</h4>
//                         <small><span class="hcw_prop_atleast1dose_txt">{pourcentage de travailleurs de la santé partiellement vaccinés}</span> des travailleurs de la santé ont reçu au moins une dose d’un vaccin contre la COVID-19. <span class="hcw_prop_1dose_txt">{pourcentage de travailleurs de la santé partiellement vaccinés}</span> ont reçu une seule dose tandis que <span class="hcw_prop_2doses_txt2">{Pourcentage de travailleurs de la santé entièrement vaccinés}</span> en ont reçu deux.</small>
//                         <br>
//                     </div>
//                     <!--<div class="col-xs-4 currentDataCirc">-->
//                     <!--</div>-->
//                 </div>
//                 <div class="row">
//                 <div class="stackedBar col-md-12"></div>
//                 </div>
//             </div>
//             <div class="col-md-4 keyPop" id="keyPop-congregate">
//                  <div class="row">
//                     <div class="col-xs-12" style="padding-left:10px;height:255px;">
//                         <h4 style="font-size:19px;margin-bottom:0px;margin-top:20px;">Résidents de milieux de vie collectifs pour personnes âgées</h4>
//                         <small><span class="congregate_prop_atleast1dose_txt">{Pourcentage de personnes en milieux de vie collectifs partiellement vaccinées}</span> des résidents de milieux de vie collectifs pour personnes âgées ont reçu au moins une dose d’un vaccin contre la COVID-19. <span class="congregate_prop_1dose_txt">{Pourcentage de personnes en milieux de vie collectifs partiellement vaccinées}</span> ont reçu une seule dose tandis que <span class="congregate_prop_2doses_txt2">{Pourcentage de personnes en milieux de vie collectifs vaccinées}</span> en ont reçu deux.</small>
//                     </div>
//                     <!--<div class="col-xs-4 currentDataCirc">-->
//                     <!--</div>-->
//                 </div>
//                 <div class="row">
//                 <div class="stackedBar col-md-12"></div>
//                 </div>
//             </div>
//             <!--<div class="col-md-3" id="keyPop-remoteIsolated">-->
//             <!--     <div class="row">-->
//             <!--         <div class="col-md-8" style="padding-left:10px;">-->
//             <!--    <h3 class="small" style="height:100px;margin-bottom:0px;margin-top:20px;">Adultes dans des communautés autochtones isolées et éloignées, ou du Nord</h3>-->
//             <!--    </div>-->
//             <!--        <div class="col-md-4 currentDataCirc">-->
//             <!--        </div>-->
//             <!--    </div>-->
//             <!--    <div class="stackedBar"></div>-->
//             <!--</div>-->
//         </div>
//         </div>
//         <div class="clearfix"></div>
// 		<div id="keypopsbarnotes"></div>