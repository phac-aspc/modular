import { PieChart } from "/src/js/modular/pie.js";

//Load Data
var dataFiles = [
    "./data/dummy.csv", //0
    "./data/dummy2.csv", //1
]
var promises = [];
dataFiles.forEach(function(url) {
    if (url.match(/.*\.csv$/gm)){
        promises.push(d3.csv(url))
    }
    else if (url.match(/.*\.json$/gm)){
        promises.push(d3.json(url))
    }
});
Promise.all(promises).then(function(values) {
    console.log('myData', values)
    
    //make pie :D
    let pie = new PieChart();
    
    pie
        .wrapper(d3.select('#pieWrapper'))
        .container(d3.select('#pie'))
        .data(values[0])
        .cKey("country")
        .nKey("val1")
        // .radius(200)
        .graphPosition([240, 240])
        .legendPosition([500, 50])
        // .legendOrientation('h')
        .init()
        .render()
        
    
    
    let toggle = true;
    
    d3.select("#updatePie").on("click", () => {
        if (toggle) {
            pie
            .wrapper(d3.select('#pieWrapper'))
            .container(d3.select('#pie'))
            .data(values[1])
            .cKey("region")
            .nKey("cars")
            .init()
            .update()
        }
        else {
            pie
            .wrapper(d3.select('#pieWrapper'))
            .container(d3.select('#pie'))
            .data(values[0])
            .cKey("country")
            .nKey("val1")
            .init()
            .update()
        }
        toggle = !toggle
    })
})