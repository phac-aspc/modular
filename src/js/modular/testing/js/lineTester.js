import { LineGraph } from "/src/js/modular/line.js";
import { LineGraph as NestedLineGraph } from "/src/js/modular/Updating/line.js";
import { BarGraph } from "/src/js/modular/Updating/bar.js";

function buildLine(data, data2) {
    
    let addUncertainties = (data, valueKey) => {
        data.map(d => {
            let uncertaintyDifference = parseInt(d[valueKey])*.2
            d['upper'] = parseInt(d[valueKey]) + uncertaintyDifference
            d['lower'] = parseInt(d[valueKey]) - uncertaintyDifference
        })
    }
    addUncertainties(data, "Age-standardized rate per 100,000 population");
    
    
    console.log("fig1data", data)
    console.log("fig1data2", data2)
    let line = new LineGraph();
    line
        .wrapper(d3.select('#lineWrapper'))
        .container(d3.select('#lineContainer'))
        // .table(d3.select('#fig1Wrapper'))
        .data(data)
        .cAxisTitle("Fiscal year")
        .nAxisTitle("Rate per 100,000 (Age-adjusted)")
        .cKey("Fiscal year")
        .nKey("Age-standardized rate per 100,000 population")
        .categoryKey("Sex")
        // .colourSeries(["#f28e2c", "#4e79a7", "#000000"])
        // .lineTypeSeries(["solid", "solid", "solid"])
        // .pointTypeSeries(["triangle", "square", "diamond"])
        .gridlines(true)
        .displayPoints(true)
        .hideLines(true)
        .interactive(true)
        .displayUncertainties(true)
        .upperUncertainty("Upper confidence limit")
        .lowerUncertainty("Lower confidence limit")
        .legendPosition([175, 450])
        .legendOrientation('h')
        .legendSpacing([10, 150])
        .margins([20, 40, 150, 100])
        .init()
        // .nScale(line.nScale().domain([0, 100]))
        .render();
    
    let toggle = true;
    d3.select("#updateLine").on('click', (e, d) => {
        if (toggle) {
            line
                .data(data2)
                .nAxisTitle("Rate per 100,000 population (Crude)")
                .cAxisTitle("Fiscal Year")
                .cKey("Fiscal year")
                .nKey("Crude rate per 100,000 population")
                .categoryKey("Age")
                
                .upperUncertainty("Crude Upper confidence limit")
                .lowerUncertainty("Crude Lower confidence limit")
                .legendPosition([90, 450])
                // .legendOrientation('h')
                // .legendSpacing([10, 150])
                // .margins([20, 40, 150, 100])
                .init()
                .update();
            
            toggle = !toggle;
        }
        else {
            line
                .data(data)
                .cAxisTitle("Fiscal year")
                .nAxisTitle("Rate per 100,000 (Age-adjusted)")
                .cKey("Fiscal year")
                .nKey("Age-standardized rate per 100,000 population")
                .categoryKey("Sex")
                
                .upperUncertainty("Upper confidence limit")
                .lowerUncertainty("Lower confidence limit")
                
                .legendPosition([175, 450])
                
                .init()
                .update();
            
            toggle = !toggle;
        }
    })
}

function buildCarrsLine(data) {
    console.log('carrsLine')
    
    let line = new LineGraph();
    line
        .wrapper(d3.select('#carssLineWrapper'))
        .container(d3.select('#carssLineContainer'))
        // .table(d3.select('#fig1Wrapper'))
        .data(data)
        .cAxisTitle("Fiscal year")
        .nAxisTitle("Rate per 100,000 (Age-adjusted)")
        .cKey("YEAR")
        .nKey("DDD_1000PTDAYS")
        .categoryKey("CLASS")
        // .colourSeries(["#f28e2c", "#4e79a7", "#000000"])
        // .lineTypeSeries(["solid", "solid", "solid"])
        // .pointTypeSeries(["triangle", "square", "diamond"])
        .gridlines(true)
        .displayPoints(true)
        .interactive(true)
        .hoverFade(true)
        // .displayUncertainties(true)
        // .upperUncertainty("Upper confidence limit")
        // .lowerUncertainty("Lower confidence limit")
        .legendPosition([175, 450])
        .legendOrientation('h')
        .legendSpacing([10, 150])
        .margins([20, 40, 150, 100])
        .init()
        // .nScale(line.nScale().domain([0, 100]))
        .render();
}

function buildStackedAxisLine(data){
    console.log('-----------nestedLine')
    
    let line = new NestedLineGraph();
    line
        .wrapper(d3.select('#stackedLineWrapper'))
        .container(d3.select('#stackedLineContainer'))
        .table(d3.select('#stackedLineWrapper'))
        .data(data)
        .cAxisTitle("")
        .nAxisTitle("Rate per 100,000 (Age-adjusted)")
        .cSeries(["SEX", "YEAR"])
        .nKey("RATE_100RX")
        .categoryKey("AGEGROUP")
        // .colourSeries(["#f28e2c", "#4e79a7", "#000000"])
        // .lineTypeSeries(["solid", "solid", "solid"])
        // .pointTypeSeries(["triangle", "square", "diamond"])
        .gridlines(true)
        .displayPoints(true)
        .interactive(true)
        .hoverFade(true)
        // .displayUncertainties(true)
        // .upperUncertainty("Upper confidence limit")
        // .lowerUncertainty("Lower confidence limit")
        .legendPosition([10, 450])
        .legendOrientation('h')
        .legendSpacing([10, 150])
        .margins([20, 40, 150, 100])
        .init()
        // .nScale(line.nScale().domain([0, 100]))
        .render();
}

function buildBarLineCombo(data){
    let categories = ["HAMU total: DDDs (per 1,000 inhabitants) per day (ATC group J01)", "AAMU total: mg/PCU (overall sales)"]
    
    data.map(el => {
        el["HAMU"] = categories[0];
        el["AAMU"] = categories[1];
    })
    
    console.log('BarLineComboData', data)
    let marginLeft = 100
    let marginRight = 100
    
    let bar = new BarGraph();
    bar
        .wrapper(d3.select('#barAndLineWrapper'))
        .container(d3.select('#barAndLineContainer'))
        // .table(d3.select('#fig8Wrapper'))
        .data(data)
        .nAxisTitle("Defined daily doses (per 1,000 inhabitants) per day")
        .cSeries(["COUNTRY"])
        .nKey("HAMU_DDD1000POP")
        .categoryKey("HAMU")
        .colourSeries(["#4e79a7"])
        .averageLines([20, 10, 5])

        .cAxisInitialHeight(0)
        // .cAxisDrop(0)
        .vertical(true)
        .displayLegend(true)
        // .grouped(true)
        // .gridlines(true)
        // .tooltips(true)
        // .interactive(true)
        // .specificTooltip(true)
        // .displayPoints(true)
        .legendPosition([35, 430])
        .legendOrientation('h')
        .legendCircleSpacing(80)
        .legendTextOffset(35)
        .margins([20, marginRight, 150, marginLeft])
        .init()
        .nScale(bar.nScale().domain([0, 30]))
        .render();
        
    bar.axesGroup().select('.c0').selectAll('.tick text')
        .attr('text-anchor', 'end')
        .attr('transform', `translate(-${bar.barWidth()/2},${0}) rotate(-45)`)
    
    let line = new LineGraph();
    line
        .wrapper(d3.select('#barAndLineWrapper'))
        .container(d3.select('#barAndLineContainer'))
        .data(data)
        .cKey("COUNTRY")
        .nKey("AAMU_MGPCU")
        .categoryKey("AAMU")
        .nAxisTitle("Quantity of active ingredients per kg of animal (mg/PCU)")
        .colourSeries(["#f28e2c"])
        // .gridlines(true)
        .displayPoints(true)
        // .interactive(true)
        // .hoverFade(true)
        .legendPosition([10, 450])
        .legendOrientation('h')
        .legendSpacing([10, 150])
        .margins([20, marginRight, 150, marginLeft])
        .init()
    
    let domain = line.cScale().domain()
    let range = line.cScale().range()
    let padding = bar.defaultPadding();
    
    let newCScale = d3
      .scaleBand()
      .domain(domain)
      .range(range)
      .padding(padding);
        
    // overwrite the axis generator for the "n" axis, then render
    let axisGens = line.axisGens();
    let nScale = line.nScale();
    axisGens["n"] = d3.axisRight(nScale);
    
    line
        .axisGens(axisGens)
        .nScale(line.nScale().domain([0, 350]))
        .cScale(newCScale)
        .render();
    
    //position the overwritten axis
    line.axesGroup().select('.n').attr('transform', `translate(${line.width() - marginRight}, 0)`)
    line.lineGroup().attr('transform', `translate(${bar.barWidth()/2}, 0)`)
    line.axesGroup().select('.c').remove()
    let text = line.titleGroup().select('.n-axis-title').attr('transform', `rotate(90)`)
    text.selectAll('tspan')
        .attr('x', `${(line.height() + line.margins().t - line.margins().b)/2}`).attr('y', `-${(line.width()-30)}`)
}

//Load Data
let dataFiles = [
    '/src/data/cihi/figure1.csv', //0
    '/src/data/cihi/figure3.csv', //1
    '/src/data/carss-app/graphs/01-human-antimicrobial-use-healthcare-sector-fig-5.csv', //2
    '/src/data/carss-app/graphs/03-human-antimicrobial-use-community-fig-1.csv', //3,
    '/src/data/carss-app/graphs/07-amu-homepage-fig-2.csv', //4
]
let promises = [];
dataFiles.forEach(function(url) {
    if (url.match(/.*\.csv$/gm)) {
        promises.push(d3.csv(url))
    }
    else if (url.match(/.*\.json$/gm)) {
        promises.push(d3.json(url))
    }
});
Promise.all(promises).then(function(values) {
    console.log('lineData', values)
    // let inputTitle = ''
    // let validString = (typeof inputTitle == typeof 'abc');
    // console.log(validString, inputTitle)
    // console.log("All points", values[6])
    // let header = 
    let dataSet = 0; //dataSet++

    buildLine(values[0], values[1])

    buildCarrsLine(values[2])
    
    buildStackedAxisLine(values[3])
    buildBarLineCombo(values[4])
})