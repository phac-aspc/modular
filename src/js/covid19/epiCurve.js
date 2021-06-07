

//Load Data
// var csvfiles = [
//     '/src/data/covidLive/covid19-updateTime.csv', //0
//     '/src/data/covidLive/covid19.csv', //1
//     '/src/data/covidLive/covid19-nTotal.csv', //2
//     '/src/data/covidLive/covid19-epiSummary-casesovertime.csv', //3
//     '/src/data/covidLive/covid19-epiSummary-probableexposure2.csv' //4
// ]
// var promises = [];
// csvfiles.forEach(function(url) {
//     promises.push(d3.csv(url))
// });
// Promise.all(promises).then(function(values) {
//     epiSummaryCasesOverTime(values[0],values[1],values[2],values[3],values[4]);
// }).then(function(){
// });

var dateField, data, nTotal, dataCasesOverTime, numC;
function epiSummaryCasesOverTime(dateFieldInt, dataInt, nTotalInt, dataCasesOverTimeInt, Number_of_cases){
    
    dateField = dateFieldInt;
    data = dataInt;
    nTotal = nTotalInt;
    dataCasesOverTime = dataCasesOverTimeInt;
    numC = Number_of_cases
    
// d3.csv("/src/data/covidLive/covid19-epiSummary-casesovertime.csv", function(data) {
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
    
    $("#figure1-dropdown").on("change", function(e) {
        var checkbox = this.value;
        var legendJSON = {};
        var keys = [];
        var colors = [];
        if(checkbox == "new"){
            $("#chart1").css("display","")
			$("#chart2").css("display","none")
			$("#chart3").css("display","none")
			$("#chart4").css("display","none")
			$("#chart5").css("display","none")			
            d3.selectAll(".N1").text(numberFormat(d3.sum(dataCasesOverTime.map(function(d) { return +d["new"] }))));			
            d3.select(".legendG").style("display","none");
        }else if (checkbox == "exposure"){
            $("#chart1").css("display","none")
			$("#chart2").css("display","")
			$("#chart3").css("display","none")
			$("#chart4").css("display","none")
			$("#chart5").css("display","none")
			d3.selectAll(".N1").text(numberFormat(d3.sum(dataCasesOverTime.map(function(d) { return +d["new"] }))));			
        }
        else if (checkbox == "breakdownAge") {
            $("#chart1").css("display","none")
			$("#chart2").css("display","none")
			$("#chart3").css("display","")
			$("#chart4").css("display","none")
			$("#chart5").css("display","none")
            d3.selectAll(".legendG").style("display", "");
        }
        else if (checkbox == "breakdownAgeTwenty") {
            $("#chart1").css("display","none")
			$("#chart2").css("display","none")
			$("#chart3").css("display","none")
			$("#chart4").css("display","")
			$("#chart5").css("display","none")
            d3.selectAll(".legendG").style("display", "");

        }
        else if (checkbox == "breakdown") {
            $("#chart1").css("display","none")
			$("#chart2").css("display","none")
			$("#chart3").css("display","none")
			$("#chart4").css("display","none")
			$("#chart5").css("display","")
            d3.selectAll(".legendG").style("display", "");
        }
    });
	
    /* d3.select("#chart3").style("display","inline"); */
    
//  	d3.csv("/src/data/covidLive/covid19-nTotal.csv",function(nTotal){
	N0 = +nTotal.columns[0];		
 	d3.selectAll(".N0").text(numberFormat(nTotal.columns[0]));
	d3.selectAll(".N1").text(numberFormat(d3.sum(dataCasesOverTime.map(function(d) { return +d["new"] }))));
			//console.log("dataCasesOverTime",dataCasesOverTime);
			//console.log("N1",numberFormat(d3.sum(dataCasesOverTime.map(function(d) { return +d["new"] }))));
	d3.selectAll(".N1Total").text(numberFormat(d3.sum(dataCasesOverTime.map(function(d) { return +d["new"] }))));
	d3.selectAll(".N1Percent").text((d3.sum(dataCasesOverTime.map(function(d) { return +d["new"] }))/N0*100).toFixed(1));
	d3.selectAll(".N3Total").text(numberFormat(d3.sum(dataCasesOverTime.map(function(d) { return +d["NTotal_ExposureOnly"] }))));
	d3.selectAll(".N3Percent").text((d3.sum(dataCasesOverTime.map(function(d) { return +d["NTotal_ExposureOnly"] }))/N0*100).toFixed(1));		
	
	
	// Set up before/after handlers		
	d3.selectAll(".N1a").text(numberFormat(d3.sum(dataCasesOverTime.map(function(d) { return +d["new"] }))));
	d3.selectAll(".N1b").text(numberFormat(d3.sum(dataCasesOverTime.map(function(d) { return +d["NTotal_ExposureOnly"] }))));
		
//  	});
    
    epiCurve("new",dataCasesOverTime);
    epiCurve("exposure",dataCasesOverTime);
            $("#chart1").css("display","")
            $("#chart2").css("display", "none")
    d3.select(".legendG").style("display","none");
    
    const rows = d3.select(".confirmed-data").selectAll("tr").data(dataCasesOverTime).enter().append("tr");
    dataCasesOverTime.columns.forEach(function(key){
        if (key == "date" || key == "new" || key == "domestic-contactWithCase" || key == "domestic-contactWithTraveller" || key == "domestic-unknown" || key == "internationalTravel" || key == "infopending") {
            rows.append("td")
            .style("width", function(d) {
                if (key == "date") {
                    return "20%";
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
    })
    
// d3.csv("/src/data/covidLive/covid19.csv", function(data) {
/*     var numberFormat;
    dataCasesOverTime.forEach(function(d, i) {
        d.numtoday = +d.numtoday || 0;
        d.deathstoday = +d.deathstoday || 0;
    })

    dataCasesOverTime = dataCasesOverTime.filter(function(d) {
        return d.prname == "Canada";
    }) */



    // var dataByLocation = d3.nest()
    //       .key(function(d) { return d.prname; })
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


    // d3.csv("/src/data/covidLive/covid19-nTotal.csv", function(nTotal) {
    //     N0 = +nTotal.columns[0];
    //     d3.selectAll(".N0").text(numberFormat(nTotal.columns[0]));
    //     d3.selectAll(".N1").text(numberFormat(d3.sum(data.map(function(d) { return +d["new"] }))));
    //     d3.selectAll(".N1Total").text(numberFormat(d3.sum(data.map(function(d) { return +d["new"] }))));
    //     d3.selectAll(".N1Percent").text((d3.sum(data.map(function(d) { return +d["new"] })) / N0 * 100).toFixed(1));
    //     d3.selectAll(".N3Total").text(numberFormat(d3.sum(data.map(function(d) { return +d["NTotal_ExposureOnly"] }))));
    //     d3.selectAll(".N3Percent").text((d3.sum(data.map(function(d) { return +d["NTotal_ExposureOnly"] })) / N0 * 100).toFixed(1));
    // });

    epiCurve("breakdown", dataCasesOverTime);
    $("#chart5").css("display", "none")
    d3.select(".legendG").style("display", "none");

    // const rows = d3.select(".confirmed-data").selectAll("tr").data(data).enter().append("tr");
    // for (let key in data[0]) {
    //     if (key == "date" || key == "new" || key == "domestic-contactWithCase" || key == "domestic-contactWithTraveller" || key == "domestic-unknown" || key == "internationalTravel" || key == "infopending")
    //         rows.append("td")
    //         .style("width", function(d) {
    //             if (key == "date") {
    //                 return "50%";
    //             }
    //         })
    //         .text(function(d) {
    //             if (key == "date") {
    //                 return d[key];
    //             }
    //             else {
    //                 return numberFormat(d[key]);
    //             }
    //         });
    // }
};
    var legendJSON = {};

function isolateCategory2(data, category) {
       let clonedData = data.cloneObjects();    
       if (category != "all") {
		  (Object.keys(legendJSON)).forEach(function(c){
             if (c != category)
                clonedData.forEach(function(el) { el[c] = 0 });			  
		  });		   
/*           for (let c of Object.keys(legendJSON)) {
             if (c != category)
                clonedData.forEach(function(el) { el[c] = 0 });
          } */
       }
       return clonedData;
}

function epiCurve(checkbox,data) {
    var language = $('html').attr('lang');
    
    var parseTimeEpiSummary;

    var keys = [];
    var colors = [];
    var svg;
    // if (checkbox.checked != true){
    if(checkbox == "new"){
                parseTimeEpiSummary = d3.timeParse("%Y-%m-%d")

        if(language == "en"){
            legendJSON = {
                "new": "Newly reported cases"
            };
        }else{
            legendJSON = {
                "new": "Cas nouvellement rapportés"
            };
        }
        keys = ["new"];
        colors = ["#015B7E"];
        svg = d3.select("#exposure-history").select("#chart1");
    }
        else if (checkbox == "exposure") {
                    parseTimeEpiSummary = d3.timeParse("%Y-%m-%d")

        if(language == "en"){
            legendJSON = {
                "domestic-contactWithCase": "Domestic - Contact with a COVID case",
                "domestic-contactWithTraveller": "Domestic - Contact with a traveller",
                "domestic-unknown": "Domestic - Unknown",
                "internationalTravel": "Travelled outside of Canada",
                "infopending": "Information pending"
            };
        }else{
            legendJSON = {
                "domestic-contactWithCase": "Infection locale - Contact avec un cas de COVID",
                "domestic-contactWithTraveller": "Infection locale - contact avec un voyageur",
                "domestic-unknown": "Infection locale - Source d'exposition inconnue",
                "internationalTravel": "Personnes ayant voyagé à l’extérieur du Canada",
                "infopending": "Contexte inconnue pour le moment"
            };
        }
        keys = ["domestic-contactWithCase", "domestic-contactWithTraveller", "domestic-unknown", "internationalTravel", "infopending"];
        /* colors = ["#88419d", "#8c96c6", "#b3cde3", "#edf8fb", "#b3b3b3"]; */
        colors = ["#edf8fb", "#8c96c6", "#b3cde3", "#c393d2", "#666666"];
        svg = d3.select("#exposure-history").select("#chart2");
    }
    else if(checkbox == "breakdown"){
        parseTimeEpiSummary = d3.timeParse("%d-%m-%Y")
        if (language == "en") {
            legendJSON = {
                "numtoday": "Daily total cases",
                "deathstoday": "Daily total deaths"
            };
        }
        else {
            legendJSON = {
                "numtoday": "Daily total cases",
                "deathstoday": "Daily total deaths"
            };
        }
        keys = ["numtoday", "deathstoday"];
        colors = ["#88419d", "#8c96c6", "#b3cde3", "#edf8fb", "#b3b3b3"];
        svg = d3.select("#exposure-history").select("#chart5");
    }
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
        .attr("viewBox", "0 0 1140 640")
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
        .attr("class", "y-axis-2");

    svg.append("g")
        .attr("class", "x-axis-2");

    let xAxisTitle = svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 70) + ")")
        .style("text-anchor", "middle")
        .attr("class", "x-axis-title-2");

    let yAxisTitle = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", - 5 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "y-axis-title-2");
    
    
    let selectedBreakdown = null;
    x.domain(data.map(function(d) {
        return parseTimeEpiSummary(d.date);
    }));

    z = d3.scaleOrdinal()
    .range(colors);
    
    z.domain(keys);

    svg.select(".x-axis-2").attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d-%b-%y")))
        .selectAll("text")
        .style("font-size", 14)
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)")
        .attr("x", -6)
        .attr("y", 4);
            
    svg.select(".x-axis-2")
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

    svg.select(".y-axis-2")
        .transition()
        .duration(500)
        .call(d3.axisLeft(y))
        .selectAll(".tick")
        .style("font-size", 14)
        .select("line")
        .style("font-size", 12)
        .attr('x2', width);

        svg.select(".y-axis-2")
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
            return "serie " + d.key;
        })
        .on("click", function(d) {
            var isolatedData = isolateCategory2(data, d.key);
            
            // changing the domain to accomodate the new data
            // y.domain([0, max(isolatedData)]);
            
            // drawAreaChart(stack(isolatedData), y, x, svg);
            // if(keys.length > 1){
            isolate(stack.keys("1")(isolatedData), keys, d.key, svg, d.key, data);
        })
        .attr("fill", function(d) { return z(d.key); })
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

if(checkbox != "new"){
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
             var isolatedData = isolateCategory2(data, selectedBreakdown);

            // changing the domain to accomodate the new data
            // y.domain([0, max(isolatedData)]);
            
            // drawAreaChart(stack(isolatedData), y, x, svg);
            if(keys.length > 1){
                isolate(stack(isolatedData), keys, d, svg, d,data);
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
            var isolatedData = isolateCategory2(data, selectedBreakdown);

            // changing the domain to accomodate the new data
            // y.domain([0, max(isolatedData)]);
            
            // drawAreaChart(stack(isolatedData), y, x, svg);
            if(keys.length > 1){
                isolate(stack(isolatedData), keys, d, svg, d,data);
            }
        })
        .attr("x", 59)
        .attr("y", 9.5)
        .attr("dy", "0.5em")
        .text(function(d) { return legendJSON[d]; });
        
}  
    if (language == "en") {
        svg.select(".x-axis-title-2").text("Date of illness onset");
    }
    else {
        svg.select(".x-axis-title-2").text("Date d'apparition de la maladie");
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

if(checkbox != "breakdown" ){
    // drawing the rectangle
    let lastDate = parseTimeEpiSummary(data[data.length - data[0]["shaded"]].date);
    svg.append('rect')
        .attr("id", "shaded-area")
        .attr("x", x(lastDate) - 2)
        .attr("y", 0)
        .attr("height", height)
        .style("opacity", 0.5)
        .style("fill", "#9fa3a7")
        .attr("width", width - x(lastDate) + 1);
}

       function isolate(data, keys, key, svg, dataKey, actualData) {
    
        if(checkbox != "new"){
        if (selectedBreakdown != null ) {
            y.domain([0, d3.max(actualData, function(d) {
        let sum = 0;
        for (let i = 0; i < keys.length; i++) {
            sum += +d[keys[i]];
        }
        return sum + 100;
    })]);

    svg.select(".y-axis-2")
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
            
            selectedBreakdown = null;
        } else {
            selectedBreakdown = key;
            
            // let bars = svg.selectAll("." + key + " rect");
            
            let max = d3.max(data[0], function(d) {
        return parseInt(d.data[key])
    })
             y.domain([0, max + (max * 0.2)]);

    svg.select(".y-axis-2")
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
}