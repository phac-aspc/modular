//Load Data
// var csvfiles = [
//     '/src/data/covidLive/covid19-epiSummary-epiCurveByAge.csv' //0
// ]
// var promises = [];
// csvfiles.forEach(function(url) {
//     promises.push(d3.csv(url))
// });
// Promise.all(promises).then(function(values) {
//     exposureHistoryAge(values[0]);
// }).then(function(){
// });

var data, classJson;
function exposureHistoryAge(dataInt){
    data = dataInt;
    // d3.csv("/src/data/covidLive/covid19-epiSummary-epiCurveByAge.csv", function(data) {
    var numberFormat;

    //Format the data
    data.columns.push("20-39","40-59","60-79");
    data.columns.sort();	
        
    data.forEach(function(d){
        d.date = d.date;
        d["0-19"] = +d["0-19"];
        d["20-29"] = +d["20-29"];
        d["30-39"] = +d["30-39"];
        d["20-39"] = +d["20-29"]+(+d["30-39"]);
        d["40-49"] = +d["40-49"];
        d["50-59"] = +d["50-59"];
        d["40-59"] = +d["40-49"]+(+d["50-59"]);
        d["60-69"] = +d["60-69"];
        d["70-79"] = +d["70-79"];
        d["60-79"] = +d["60-69"]+(+d["70-79"]);
        d["80+"] = +d["80+"];
        d["80++"] = +d["80+"];
        d.new = +d.new;
        d["cumulative-n-age"] = +d["cumulative-n-age"];
            
        //;

        // var dataByDate = d3.nest()
        //       .key(function(d) { return d.date; })
        //       .entries(data);
             
            
        
        // let dataArr = [];
        // dataByDate.forEach(function(d,i){
        //     let newObj = {};
        //     newObj["date"] = d.key;
        //     newObj["cases"] = 0;
        //     newObj["deaths"] = 0;
            
        //     d.values.forEach(function(e, j){
        //         newObj["cases"] += e["cases"]
        //         newObj["deaths"] += e["deaths"]
        //     })
        //     dataArr.push(newObj);
        // })
        
    
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
		d3.select("#epiCurveTable1").style("display","inline");
		d3.select("#epiCurveTable2").style("display","none");
		d3.select("#epiCurveTable3").style("display","none");
		
		$("#figure1-dropdown").on("change", function(e) {
            data = dataInt;
                
			var val = this.value;
			var legendJSON = {};
			var keys = [];
			var colors = [];
			if (val == "new") {
				
				d3.select("#epiCurveTable1").style("display","inline");
				d3.select("#epiCurveTable2").style("display","none");
				d3.select("#epiCurveTable3").style("display","none");
				d3.selectAll(".legendG").style("display", "none");
			}
	/*         else if (val == "breakdown") {
				d3.select("#chart1").style("display", "none");
				d3.select("#chart2").style("display", "inline");
				d3.select("#chart3").style("display", "none");
				d3.select("#chart4").style("display", "none");
				d3.select(".N1").text(numberFormat(d3.sum(data.map(function(d) { return +d["NTotal_ExposureOnly"] }))));
				d3.selectAll(".legendG").style("display", "");

			} */
			else if (val == "breakdownAge") {
			   
				d3.select("#epiCurveTable1").style("display","none");
				d3.select("#epiCurveTable2").style("display","inline");
				d3.select("#epiCurveTable3").style("display","none");
				d3.selectAll(".N1").text(numberFormat(data[data.length - 1]["cumulative-n-age"]));
				d3.selectAll(".legendG").style("display", "");

			}
			else if (val == "breakdownAgeTwenty") {
				
				d3.select("#epiCurveTable1").style("display","none");
				d3.select("#epiCurveTable2").style("display","none");
				d3.select("#epiCurveTable3").style("display","inline");
				d3.selectAll(".N1").text(numberFormat(data[data.length - 1]["cumulative-n-age"]));
				d3.selectAll(".legendG").style("display", "");

			}
			else if (val == "exposure") {
				d3.select("#epiCurveTable1").style("display","inline");
				d3.select("#epiCurveTable2").style("display","none");
				d3.select("#epiCurveTable3").style("display","none");

				// d3.select(".N1").text(numberFormat(d3.sum(data.map(function(d) { return +d["NTotal_ExposureOnly"] }))));
				d3.selectAll(".legendG").style("display", "");

			}		
		
			if(val == "breakdownAge"){
				const rows = d3.select("#epiCurveTable2").select(".confirmed-data").selectAll("tr").data(data).enter().append("tr");	
				for (let key in data[0]) {
					if (key == "date" || key == "0-19" || key == "20-29" || key == "30-39" || key == "40-49" || key == "50-59" || key == "60-69" || key == "70-79" || key == "80+")
						rows.append("td")
						.style("width", function(d) {
							if (key == "date") {
								return "18%";
							}else{
								return "7%";
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
			}else if(val == "breakdownAgeTwenty"){
				const rows = d3.select("#epiCurveTable3").select(".confirmed-data").selectAll("tr").data(data).enter().append("tr");	
				for (let key in data[0]) {
					if (key == "date" || key == "0-19" || key == "20-39" || key == "40-59" || key == "60-79" || key == "80++")
						rows.append("td")
						.style("width", function(d) {
							if (key == "date") {
								return "20%";
							}else{
								return "12%";
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
			}
		});    
		d3.selectAll(".N1c").text(numberFormat(data[data.length - 1]["cumulative-n-age"]));
		d3.selectAll(".N1d").text(numberFormat(data[data.length - 1]["cumulative-n-age"]));
    });
    d3.select("#chart3").style("display","inline");
    
    epiCurve2("breakdownAge",data);
    epiCurve2("breakdownAgeTwenty",data);
    d3.select("#chart3").style("display", "none")
    $("#chart4").css("display", "none")
    d3.select(".legendG").style("display","none");
// });
}

function epiCurve2(checkbox,data) {
    var language = $('html').attr('lang');    
    var parseTimeEpiSummary = d3.timeParse("%Y-%m-%d");    
    var legendJSON = {};
    let classJson = {}
    var keys = [];
    var classes = [];
    var colors = [];
    var svg;
    // if (checkbox.checked != true){
    // if(checkbox == "new"){
    //     if(language == "en"){
    //         legendJSON = {
    //             "cases": "Newly reported cases"
    //         };
    //     }else{
    //         legendJSON = {
    //             "cases": "Cas nouvellement rapportés"
    //         };
    //     }
    //     keys = ["cases"];
    //     colors = ["#015B7E"];
    //     svg = d3.select("#exposure-history").select("#chart1");
    // }
    if(checkbox == "breakdownAge"){
        if(language == "en"){
            legendJSON = {
                "0-19": "0-19",
                "20-29": "20-29",
                "30-39": "30-39",
                "40-49": "40-49",
                "50-59": "50-59",
                "60-69": "60-69",
                "70-79": "70-79",
                "80+": "80+"
            };
            
        }else{
            legendJSON = {
                "0-19": "0 à 19",
                "20-29": "20 à 29",
                "30-39": "30 à 39",
                "40-49": "40 à 49",
                "50-59": "50 à 59",
                "60-69": "60 à 69",
                "70-79": "70 à 79",
                "80+": "80+"
            };
            
        }
        classJson = {
            "0-19": "groupA",
            "20-29": "groupB",
            "30-39": "groupC",
            "40-49": "groupD",
            "50-59": "groupE",
            "60-69": "groupF",
            "70-79": "groupG",
            "80+": "groupH"
        }
        classes = ["groupA","groupB","groupC","groupD","groupE","groupF","groupG","groupH"]
        keys = ["0-19", "20-29","30-39","40-49","50-59","60-69","70-79","80+"];
        colors = ['#f7fcfd','#e0ecf4','#bfd3e6','#9ebcda','#8c96c6','#8c6bb1','#88419d','#6e016b'];
        svg = d3.select("#exposure-history").select("#chart3");
    }
    else if(checkbox == "breakdownAgeTwenty"){
        if(language == "en"){
            legendJSON = {
                "0-19": "0-19",
                "20-39": "20-39",
                "40-59": "40-59",
                "60-79": "60-79",
                "80++": "80+"
            };
        }else{
            legendJSON = {
                "0-19": "0 à 19",
                "20-39": "20 à 39",
                "40-59": "40 à 59",
                "60-79": "60 à 79",
                "80++": "80+"
            };
            
        }
        classJson = {
            "0-19": "groupI",
            "20-39": "groupJ",
            "40-59": "groupK",
            "60-79": "groupL",
            "80++": "groupM"
        }
        classes = ["groupI","groupJ","groupK","groupL","groupM"]
        keys = ["0-19", "20-39","40-59","60-79","80++"];
        colors = ['#9ebcda','#8c96c6','#8c6bb1','#88419d','#6e016b'];
        svg = d3.select("#exposure-history").select("#chart4");
    }

    Array.prototype.cloneObjects = function() {
       let copy = [];
    
       for (let i in this) {
          copy[i] = Object.assign({}, this[i]);
       }
    
       return copy;
    };
    
    function isolateCategory(data, category) {
       let clonedData = data.cloneObjects();
    
       if (category != "all") {
		   (Object.keys(classJson)).forEach(function(c){
             if (c != category)
                clonedData.forEach(function(el) { el[c] = 0 });			   
		   })
/*           for (let c of Object.keys(classJson)) {
             if (c != category)
                clonedData.forEach(function(el) { el[c] = 0 });
          } */
       }
       return clonedData;
    }
    
    var max = function(data) {
        return d3.max(data, function(d) {
            var sum = 0;
            /* using a for loop to calculate the total instead of just grabbing the "aTotal" record from the csv
               allows us to add/remove categories to/from the oject "CATEGORIES" above without having to change anything else */
            for (var i=0; i<Object.keys(classJson).length; i++){
                sum += +d[Object.keys(classJson)[i]];
            }
            return sum;
        });
    };
    
    const margin = {
        top: 30,
        right: 20,
        bottom: 100,
        left: 70
    };

    let isIE = /*@cc_on!@*/ false || !!document.documentMode;
    if (/Edge\/\d./i.test(navigator.userAgent))
        isIE = true;

    let width = 1140 - margin.left - margin.right;
    let height = 620 - margin.top - margin.bottom;

    svg = svg
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
        .attr("viewBox", function(){
            if(isIE)
                return ""
            else
                return "0 0 1140 640"
        })
        .append("g")
        .attr("class", checkbox)
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    let x = d3.scaleBand()
        .range([0, width])
        .padding(0);

    let y = d3.scaleLinear()
        .range([height, 10]);

    var z = d3.scaleOrdinal()
        .range(colors);

    svg.append("g")
        .attr("class", "y-axis-3");

    svg.append("g")
        .attr("class", "x-axis-3");

    let xAxisTitle = svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 70) + ")")
        .style("text-anchor", "middle")
        .attr("class", "x-axis-title-3");

    let yAxisTitle = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", - 5 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "y-axis-title-3");
    
    
    let selectedBreakdown = "all";
    x.domain(data.map(function(d) {
        return parseTimeEpiSummary(d.date);
    }));

    z = d3.scaleOrdinal()
    .range(colors);
    
    z.domain(keys);

    svg.select(".x-axis-3").attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d-%b-%y")))
        .selectAll("text")
        .style("font-size", 14)
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)")
        .attr("x", -6)
        .attr("y", 4);
            
    svg.select(".x-axis-3")
    .selectAll(".tick")
    .each(function(d, i) {
        if (new Date(d).getDay() != 0 && i != 0 || ((i+1)%3 !== 1)) {
            d3.select(this).remove();
        }
    });

    y.domain([0, d3.max(data, function(d) {
        let sum = 0;
        for (let i = 0; i < keys.length; i++) {
            sum += +d[keys[i]];
        }
        return sum + 100;
    })]);

    svg.select(".y-axis-3")
        .transition()
        .duration(500)
        .call(d3.axisLeft(y))
        .selectAll(".tick")
        .style("font-size", 14)
        .select("line")
        .style("font-size", 14)
        .attr('x2', width);

 svg.select(".y-axis-3")
        .selectAll("text")
        .style("font-size", 14)

    var area = d3.area()
        .curve(d3.curveStep)
        .x(function(d) { return x(parseTimeEpiSummary(d.data.date)); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); });
        
    let texture = [];    
    let stack = d3.stack();
    
    svg.selectAll(".serie")
        .data(stack.keys(keys)(data))
        .enter()
        .append("g")
        .attr("class", function(d) {
            return "serie " + classJson[d.key];
        })
        .on("click", function(d) {
            var isolatedData = isolateCategory(data, d.key);
            
            // changing the domain to accomodate the new data
            // y.domain([0, max(isolatedData)]);
            
            // drawAreaChart(stack(isolatedData), y, x, svg);
            // if(keys.length > 1){
            isolate(stack.keys("1")(isolatedData), keys, classJson[d.key], svg, d.key, data);
            
        })
        // .attr("fill", function(d) { return z(d.key); })
        .append("path")
        .attr("d", function(d) { return area(d); })
        .attr("fill", function(d,i){     
            texture.push(textures.lines()
              .orientation("vertical")
              .stroke("black")
              .size(3)
              .strokeWidth(0.09)
              .shapeRendering("crispEdges")
              .background(z(d.key)));
            return texture[i].url();
        });
    
    texture.forEach(function(d,i){
        svg.call(d);
    })
    

    var legend = svg.append("g")
        .attr("class","legendG")
        .attr("font-family", "sans-serif")
        .attr("font-size", 16)
        .attr("text-anchor", "start")
        .attr("transform","translate(-1000,0)")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function(d,i) { return "translate("+ (width - margin.left) + "," + i * 20 + ")"; });
     
    legend.append("rect")
        .on("click", function(d) {
            var isolatedData = isolateCategory(data, selectedBreakdown);

            // changing the domain to accomodate the new data
            // y.domain([0, max(isolatedData)]);
            
            // drawAreaChart(stack(isolatedData), y, x, svg);
            if(keys.length > 1){
                isolate(stack(isolatedData), keys, classJson[d], svg, d,data);
            }
        })
        .attr("x", 30)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", function(d) { return z(d); })
        .attr("stroke", "black")
        .attr("stroke-width", 0.09);
        
    legend.append("text")
        .on("click", function(d) {
            var isolatedData = isolateCategory(data, selectedBreakdown);

            // changing the domain to accomodate the new data
            // y.domain([0, max(isolatedData)]);
            
            // drawAreaChart(stack(isolatedData), y, x, svg);
            if(keys.length > 1){
                isolate(stack(isolatedData), keys, classJson[d], svg, d,data);
            }
        })
        .attr("x", 59)
        .attr("y", 9.5)
        .attr("dy", "0.5em")
        .text(function(d) { return legendJSON[d]; });
        
    if (language == "en") {
        svg.select(".x-axis-title-3").text("Date of illness onset");
    }
    else {
        svg.select(".x-axis-title-3").text("Date d'apparition de la maladie");
    }

    yAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en") {
                return "Number of reported cases";
            }
            else {
                return "Nombre de cas rapportés";
            }
        });

    // drawing the rectangle
    let lastDate = parseTimeEpiSummary(data[data.length - data[0]["shaded"]].date);
    svg.append('rect')
        .attr("id", "shaded-area")
        .attr("x", x(lastDate) - 2)
        .attr("y", 0)
        .attr("height", height)
        .style("opacity", 0.5)
        .style("fill", "#9fa3a7")
        .style("pointer-events", "none")
        .attr("width", width - x(lastDate) + 1);
        

    function isolate(data, keys, key, svg, dataKey, actualData) {
    
        
        if (selectedBreakdown != "all" ) {
            y.domain([0, d3.max(actualData, function(d) {
        let sum = 0;
        for (let i = 0; i < keys.length; i++) {
            sum += +d[keys[i]];
        }
        return sum + 100;
    })]);

    svg.select(".y-axis-3")
        .transition()
        .duration(500)
        .call(d3.axisLeft(y))
        .selectAll(".tick")
        .style("font-size",  "14px")
        .select("line")
        .style("font-size",  "14px")
        .attr('x2', width);
            let stack = d3.stack();
            let stacked = stack.keys(keys)(data);
        
            svg.selectAll(".serie")
            .data(stacked)
            .selectAll("path")
            .transition()
            .duration(500)
            
            .attr("d", function(d) { 
                return area(d);                 
            })
            .style("opacity", 1)
            .style("stroke-width", "0px");
            
            selectedBreakdown = "all";
        } else {
            selectedBreakdown = key;
            
            // let bars = svg.selectAll("." + key + " rect");
            
            let max = d3.max(data[0], function(d) {
        return parseInt(d.data[dataKey])
    })
             y.domain([0, max + (max * 0.2)]);

    svg.select(".y-axis-3")
        .transition()
        .duration(500)
        .call(d3.axisLeft(y))
        .selectAll(".tick")
        .style("font-size", "14px")
        .select("line")
        .style("font-size", "14px")
        .attr('x2', width);
            
            svg.select("." + key).data(data)
                .selectAll("path")
                .transition()
                .duration(500)
                .style("stroke-width", "0.5px")
                .style("stroke", "black")
                .attrTween("d", function(d) {
                    var prevD = d3.select(this).attr("d");
                    
                    var newD = d3.area()
                                  .curve(d3.curveStep)
                                  .x(function(d) { return x(parseTimeEpiSummary(d.data.date)); })
                                  .y1(function(d) {
                                     return y(d[1] - d[0]);
                                  })
                                  .y0(function(d) {
                                     return height;
                                  });
                    
    
                    return d3.interpolatePath(prevD, newD(d));
                });
                // .attr("d", function(d) {
                //     let dataKey = Object.keys(classJson).find(function(key2){
                //         return classJson[key2] === key;
                //     });
                //     return area(d);//area(d);
                // });
            
            svg.selectAll(".serie:not(." + key + ")")
                .selectAll("path")
                .transition()
                .duration(500)
                .style("opacity", 0);
            //hide all bars that are not part of the isolated group    
            //scale the height of the isolated groups bars based on the new y scale    
            //adjust the legend to show which bar is being isolated (Fill => White, Stroke => Original Color for non isolated)    
            //this function should handle isolating one bar, the clicking on the legend to isolate another    
            //potential need for unisolate/reset graph function
        }
    }
}