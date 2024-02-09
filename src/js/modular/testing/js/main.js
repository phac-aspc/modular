import { BarGraph } from "/src/js/modular/bar.js";
import { BarGraph as BarWithUncertainties} from "/src/js/modular/Updating/bar.js" ;

function convert(value) {
    value.val1 = +value.val1;
    value.val2 = +value.val2;
    value.val3 = +value.val3;
    value.val4 = +value.val4;
    value.val5 = +value.val5;
    value.val6 = +value.val6;
    return value
}

function createBarWithUncertainties(data){
    console.log("uncertaintyData", data)
    
    let updateData = []
    
    data.map(el => {
        let changeValue = Math.random()*10
        let copy = {}
        for (let key in el){
            copy[key] = el[key]
        }
        // el["Average length of stay (days)"] = parseFloat(el["Average length of stay (days)"])
        
        copy["Average Length of Stay (days)"] = parseFloat(copy["Average Length of Stay (days)"]) + changeValue;
        copy["LCL"] = parseFloat(copy["LCL"]) + changeValue;
        copy["UCL"] = parseFloat(copy["UCL"]) + changeValue;
        
        updateData.push(copy);
    })
    console.log(updateData)
    let bar = new BarWithUncertainties();
    bar
        .wrapper(d3.select('#barWithUncertaintiesWrapper'))
        .container(d3.select('#barWithUncertaintiesContainer'))
        // .table(d3.select('#fig8Wrapper'))
        .data(data)
        .nAxisTitle("Average length of stay (days)")
        .cAxisTitle("Fiscal Year")
        .cSeries(['Fiscal Year'])
        .nKey("Average Length of Stay (days)")
        .categoryKey("Group")
        .lowerUncertainty("LCL")
        .upperUncertainty("UCL")
        .cAxisInitialHeight(0)
        .cAxisDrop(0)
        .vertical(true)
        .displayLegend(true)
        .grouped(true)
        .displayUncertainties(true)
        .gridlines(true)
        .tooltips(true)
        .interactive(true)
        // .specificTooltip(true)
        // .displayPoints(true)
        .legendPosition([50, 450])
        .legendOrientation('h')
        .legendCircleSpacing(250)
        .margins([20, 0, 150, 100])
        .init()
        .render();
    
    let toggle = true;
    d3.select("#updateUncertaintyBar").on("click", () => {
        console.log('updateBarUncertaintyClicked')
        if (toggle) {
            bar
                .data(updateData)
                .init()
                .update()
        }
        else {
            bar
                .data(data)
                .init()
                .update()
        }
        toggle = !toggle
    })
}

function createBarForBen(data){
    // data.map(el => {
    //     el["DDD_1000POP"] = parseFloat(el["DDD_1000POP"])
    // })
    
    let bar = new BarWithUncertainties();
    bar
        .wrapper(d3.select('#barWithUncertaintiesWrapper'))
        .container(d3.select('#barWithUncertaintiesContainer'))
        // .table(d3.select('#fig8Wrapper'))
        .data(data)
        // .nAxisTitle("Average length of stay (days)")
        // .cAxisTitle("Fiscal Year")
        .cSeries(['YEAR'])
        .nKey("DDD_1000POP")
        .categoryKey("PT")

        .cAxisInitialHeight(0)
        // .cAxisDrop(0)
        .vertical(true)
        .displayLegend(true)
        // .grouped(true)
        .gridlines(true)
        .tooltips(true)
        .interactive(true)
        .detectLegendSpacing(true)
        // .specificTooltip(true)
        // .displayPoints(true)
        .legendPosition([50, 450])
        .legendOrientation('h')
        .legendCircleSpacing(15)
        .margins([20, 0, 150, 100])
        .init()
        // .nScale(bar.nScale().domain([0, 6000]))
        .render();
}

//Load Data
var dataFiles = [
    './data/dummy.csv', //0
    "./data/dummy2.csv", //1
    '/src/data/cihi/figure8.csv', //2
    "/src/data/carss-app/graphs/01-human-antimicrobial-use-healthcare-sector-fig-1.csv"
]
var promises = [];
dataFiles.forEach(function(url) {
    if (url.match(/.*\.csv$/gm)) {
        promises.push(d3.csv(url))
    }
    else if (url.match(/.*\.json$/gm)) {
        promises.push(d3.json(url))
    }
});

Promise.all(promises).then(function(values) {
    
    // createBarWithUncertainties(values[2])
    createBarForBen(values[3])
    
    values[0].map(el => {
        el.val1 = +el.val1
        el.val2 = +el.val2
        el.val3 = +el.val3
        el.val4 = +el.val4
        el.val5 = +el.val5
        el.val6 = +el.val6
    })
    
    values[1].map(el => {
        el.cars = +el.cars;
        el.houses = +el.houses;
        el["two words"] = +el["two words"];
    })

    function callbackHover(value) {
        console.log(value.key + ' was hovered')
    }

    function callbackClick(value) {
        console.log(value.key + ' was clicked')
    }

    // Init
    const Bar = new BarGraph();
    console.log(values[0])
    Bar
        .wrapper(d3.select('div#wrapper1'))
        .container(d3.select('svg#bar1'))
        .table(d3.select('div#wrapper1'))

        // Set svg sizing (px)
        .height(480)
        .width(720)
        // Top, right, bottom, left margins
        .margins([80, 40, 120, 160])
        //padding
        .padding(0.25)
        .subPadding(0.25)
        .cAxisTitleSpacing(50)

        //legend customization
        .legendRadius(6)
        .legendTextOffset(15)
        .legendCircleSpacing(15)
        .legendSpacingFromGraph(30)

        // Set titles
        .graphTitle('Graph title')
        .nAxisTitle('yAxis')
        .cAxisTitle('xAxis')

        // Select x and y-axis data
        .data(values[0])
        .cSeries('country')
        // Multiple series for stacked graph
        .nSeries(['val1', 'val2', 'val3', 'val4'])
        // .nSeries(['val1'])

        // .colourSeries(['blue', 'red', 'yellow', 'purple', 'pink'])

        .vertical(true)
        .grouped(true)
        .barLabels(true)
        .interactive(true)
        .gridlines(true)
        .tooltips(true)
        // .log(true)
        // .proportional(true)
        .displayLegend(true)

        .tableCaption('Example caption')
        .tableSummary('Example - Text description')

        .transitionDuration(1000)

        // .callbackHover(callbackHover)
        // .callbackClick(callbackClick)

        // Initiliase scales, axes, generators, etc. Called seperately from render incase caller wants to override one of the initialized values before render.
        .init()

        // .nScale(Bar.nScale().domain([0, 100]))

        // Generate Bars
        .render();


    let toggle = true;
    d3.select("#updateBar1").on("click", () => {
        if (toggle) {
            Bar
                .data(values[1])
                .cSeries('region')
                .nSeries(['cars', 'houses', "two words"])
                // .data(d)
                // .cSeries('country')
                // .nSeries(['val1', 'val2', 'val5'])
                .graphTitle('Region stats')
                .nAxisTitle('Stats')
                .cAxisTitle('Region')
                // .log(true)
                // .proportional(true)
                .grouped(true)
                // .colourSeries(['blue', 'red', 'yellow', 'purple', 'pink'])


                // .barLabels(false)
                // .interactive(false)
                // .gridlines(false)
                // .tooltips(false)
                .updateGraph();
        }
        else {
            Bar
                .data(values[0])
                .cSeries('country')
                .nSeries(['val1', 'val2', 'val3', 'val4', 'val5'])
                // .nSeries(['val1'])
                .graphTitle('Graph title')
                .nAxisTitle('Dependent')
                .cAxisTitle('Independent')
                .displayLegend(false)
                // .log(false)
                // .grouped(false)
                // .proportional(false)
                // .colourSeries(["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#37A86F", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"])
                .updateGraph();
        }
        toggle = !toggle
    })

    d3.select("#toggleLog").on("click", () => {
        Bar
            .log(!Bar.log())
            .updateGraph();

    })
    d3.select("#toggleProp").on("click", () => {
        Bar
            .proportional(!Bar.proportional())
            .updateGraph();

    })
    d3.select("#toggleGrouped").on("click", () => {
        Bar
            .grouped(!Bar.grouped())
            .updateGraph();

    })
    
    const Bar2 = new BarGraph();
    
    Bar2
        .wrapper(d3.select('div#wrapper2'))
        .container(d3.select('svg#bar2'))
        .data(values[0])
        .cSeries('country')
        // .nSeries(['val4', 'val5', 'val6'])
        .nSeries(['val4'])
        .grouped(true)
        .barLabels(true)
        // .vertical(true)
        .init()
        .render();
})