# Map Class

The aim of this class is to quickly create 
reusable maps of Canada. Your job is to just send 
in the right data and style the graph with built in parameters or custom CSS.

##*Requirements*
 - Topojson library: `https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js`
 - PolyLabel: found internally at `/src/js/polylabel.js`
 - `Can_PR2016`: for Canadian provinces/territories map data `/src/json/Can_PR2016.json`
    - Health Regions data: `/src/json/health-regions-2022.json`


### Quickstart

First, create an `index.html` file and `main.js` 
file. For this example, they are made in the same directory. 
- For the HTML file, ensure 
  you have a div whose only child is an SVG element.
- Also **ensure that you load the `d3.js` library 
  and `main.js` as a module** (in that order).
- Example:

```
(index.html)
--------------------
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Map of Canada</title>
    <link href="./css/dummy.css" rel="stylesheet" type="text/css">
</head>
<body>
<body>
  <div id='mapWrapper'>
    <svg id='map'></svg>
  </div>
</body>

<script src="https://d3js.org/d3.v7.min.js"></script>
<!--for map-->
<script src="/src/js/polylabel.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js"></script>
<!-- -->
<script src='./main.js' type='module'></script>

</html>
```

Next, import `Map` from `map.js` in `main.js`. 
Can use this code as an example in `main.js` to 
initialise the map.

```
import { Map } from "/src/js/modular/map.js";

const map = new Map();
map
    .wrapper(d3.select('#mapWrapper'))
    .container(d3.select('#map'))
```

Now, add some more code to `main.js` to load the canada map 
data as well as the data you want to display on the map. 
First, the map data using `d3.json`:

```
d3.json(`/src/json/Can_PR2016.json`, (mapData) => mapData)
    .then(mapData => {
        map.mapData(topojson.feature(mapData, mapData.objects.Can_PR2016)); //mapData.objects.Can_PR2016 may be different if using different mapData
        
        //rest of code
    })

```

Note: the *data format for display must be key value pairs*.
 - *key*: PRUID of the province/territory
 - *value*: Value to be displayed for that province/territory
 - Format example: 
 ```
 let keyValue = {
    24:7,
    10:2,
    59:6,
    62:1,
    61:0,
    13:9,
    12:5,
    47:8,
    48:10,
    11:10,
    60:3,
    46:4,
    35:10
}
```
You can process your display data with a conversion
function. You can place the whole `d3.csv()` block within the last `d3.json().then()`
to avoid async issues.
```
function csvToKeyValue(data, keyName, valueName){
    let newData = {};
    for (let i of data){
        newData[i[keyName]] = i[valueName]
    }
    return newData;
}

d3.csv("./data/dummyPT.csv", (data) => data).then(data => {
    
    let formattedData = csvToKeyValue(data, "pt", "value")
    map
        .data(formattedData)
        .init()
        .render();
})
```

This should now create a basic map of Canada.

It is common with maps to want to *update the values*. This 
can be acheived easily by calling and passing in new 
data to `map.updateValues(updateData)`.
The data must be in the same format.

The methods for the map chain, meaning you can call them after one another. 
Methods that simply set an attribute of the map, can be left empty to get 
the value instead. Ex: `map.data(yourData)` sets the data, `map.data()` gets the data.

Here are a list of different ways you can customize all aspects of the map:

Customize the map
 - *Display data*: `map.data(csv)`
    - Not assigning this will create a uniformly coloured map without values or a legend
 - *Map data*: `map.mapData(topojson.feature(mapData, mapData.objects.yourObjectName)`
    - Creates the literal map, must be assigned.
 - *Marker data*: `map.markerData(markerData.objects.yourObjectName.geometries)`
    - Must have coordinates
    - `OUTLINE MARKERS ON TAB: css`
    // .marker:focus {
    //     outline: none;
    //     opacity: 1;
    // }
 - *Horizontal shift*: `map.xMap(-500)`
 - *Vertical shift*: `map.yMap(800)`
 - *Scale*: `map.mapScale(0.00015)`
 - *Viewbox width*: `map.width(900)`
 - *Viewbox height*: `map.height(700)`
 - *Radius of value circles*: `map.minRadius(20)`
 - *Fontsize of value circles*: `map.fontSize(15)`
 - *Value circle offset [x, y]*: 
    - New Brunswick: `map.offsetNB([0, 55])`
    - Nova Scotia: `map.offsetNS([55, 20])`
    - Prince Edward Island: `map.offsetPEI([65, -15])`
 - *Map / Legend colours*: `map.colourSeries(["#0868ac", "#43a2ca", "#7bccc4", "#bae4bc", "#f0f9e8", "#D3D3D3"])`
 - *Default colour*: `map.defaultColour("#43a2ca")`
    - Sets the default colour of the map if no data is given
 - *Border colour*: `map.borderColour("gray")`
 - *Border highlight colour on hover*: `map.borderHighlightColour("black")`
 - *Border width*: `map.borderWidth(1)`
 - *Border highlight width on hover*: `map.borderHighlightWidth(2)`
 - *Decimal roundoff*: `map.decimalPlaces(0)`;
 - *Number seperator (thousands)*: `map.numberSeperator(" ")`;

Toggle Options
 - *Interactive*: `map.interactive(true)`
    - Turns hover and click options on/off.
 - *displayValues*: `map.displayValues(true)`
    - Displays the region value for each region
 - *Tooltips*: `map.tooltips(true)`
 - *Suppressed*: `map.suppressed(true)`
    - Add suppressed option to the legend.
 - *notApplicable*: `map.notApplicable(true)`
    - Add n/a option to the legend
 - *percent*: `map.percent(true)`
    - Displays the legend and region values as percents
 - *canadaBubble*: `map.canadaBubble(true)`
    - Displays a canada region value in the top left by default
    - To manually change the value, use `map.canadaValue(yourValue)` where *yourValue* is a number
 - *Zoomable*: `map.zoomable(true)`
    - Adds zoom, drag, click focus, zoom on tab, scroll wheel
 - *Scientific Notation*: `map.SINotation(true)`


Callback functions (requires interactive to be true). Executes the callback function when condition is met
 - *Callback on click*: `map.callbackClick(yourCallbackFunction)`
 - *Callback on hover*: `map.callbackHover(yourCallbackFunction)`

Region identifiers (changes based on mapData set)
 - *Region ID*: `map.regionId("PRUID")`
 - *Region name*: `map.regionName("PRENAME")`

Accessibility
 - *figureAriaLabel*: `map.figureAriaLabel("Map of Canada")`;
 - *figureAriaDescription*: `map.figureAriaDescription('Map description, can be used to show users how to get in. The default description does this generically')`;

Customize the legend
 - *Colour intervals*: `map.legendIntervals([1000, 100, 50, 10])`
    - Last interval of [0] is auto generated
 - *Rectangle width*: `map.legendRectangleWidth(100)`
 - *Rectangle width reduction value*: `map.legendRectangleWidthReduction(15)`
 - *Rectangle height*: `map.legendRectangleHeight(16)`
 - *Spacing between legend elements [x, y]*: `map.legendSpacing([15, 22])`
    - x: distance between text and rectangle
    - y: distance between vertical rect/text groups
 - *Position [x,y]*: `map.legendPosition([650, 60])`
 - *Title height*: `map.legendTitleHeight(50)`
 - *Title width*: `map.legendTitleWidth(300)`
    - Will wrap the title if it extends beyond the declared width
 - *Horizontal title translation*: `map.legendTitleX(0)`
 - *Title text*: `map.legendTitle("Legend title")`
 - *Suppressed*: `map.suppressed(true)`
    - Add suppressed option to the legend.
 - *notApplicable*: `map.notApplicable(true)`
    - Add n/a option to the legend
 - *Suppressed text*: `suppressedText("Suppressed")`
    - How it shows in legend
 - *Suppressed label*: `suppressedLabel("suppr.")`
    - How it shows in region values
 - *Not applicable text*: `notApplicableText("Not available")`
    - Display in legend
 - *Not applicable label*: `notApplicableLabel("n/a")`
    - Display in region values

Selections:
 - *Wrapper div*: `map.wrapper(selection)`
 - *Container svg*: `map.container(selection)`

`OVERWRITE AT YOUR OWN RISK. will probably break everything :). Use to get selection groups as demonstrated if needed`
 - *Region group (visible)*: `map.ptGroup()`
 - *Region values overlaid over regions*: `map.rvGroup()`
 - *Interactive layer*: `map.invisGroup()`
 - *Legend*: `map.legend()`
 - *Canada group and value*: `map.canadaGroup()`
 - *Markers overlaid over regions*: `map.markerGroup()`
    