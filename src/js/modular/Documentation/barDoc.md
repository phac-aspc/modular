## BarGraph Class

The aim of this class is to quickly create 
reusable bar graphs. Your job is to just send 
in the right data and style the graph with built in parameters or custom CSS.

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
    <title>Bar chart</title>
    <link href="./css/dummy.css" rel="stylesheet" type="text/css">
</head>
<body>
<body>
  <div id='wrapper1'>
    <svg id='bar1'></svg>
  </div>
</body>

<script src="https://d3js.org/d3.v7.min.js"></script>
<script src='./main.js' type='module'></script>

</html>
```

Next, import `BarGraph` from `bar.js` in `main.js`. 
Can use this code as an example in `main.js` to 
set the basics for the graph.

```
(main.js)
---------------------
import { BarGraph } from "/src/js/modular/bar.js";

// Init
const Bar = new BarGraph();
Bar
  .wrapper(d3.select('div#wrapper1'))
  .container(d3.select('svg#bar1'))
  .table(d3.select('div#wrapper1'))

// Set titles
Bar
  .graphTitle('Graph title')
  .nAxisTitle('nAxis')
  .cAxisTitle('cAxis')
```

Now, add some more code to `main.js` to 
load the data you want and display the bar graph.
Note: the **nSeries variables must be numbers**.

**Example data format**
```
country,val1,val2,val3,val4,val5,val6
Schleswig-Holstein2,1,3,7,7.12345,2,10
Schleswig-Holstein,7,8,10,7,2,10
Nigeria,4,9,5,7,2,10
Ireland,10,5,2,7,2,15
United States of America,7,2,10,7,2,10
```


You can process your data with a callback
function as an argument to `d3.csv()` to achieve 
this.

```
(main.js)
---------------------
// Load data
d3.csv('./YOURDATAHERE.csv', yourNumberConvertFunc)
  .then(d => {
    // Select x and y-axis data
    Bar.data(d);
    //represents the "x" or independent variable. Column name in data
    Bar.cSeries('yourIndepedentVarName'); //with example data, it would be 'country'
    // Multiple series for stacked/grouped graph. Column names in data. Represents the "y" or dependent variables
    Bar.nSeries(['dependentVar1', 'dependentVar2', 'dependentVar3']); //with example data, it would be 'val1' through 'val6'
    
    // Initiliase scales, axes, generators, etc. Init and render are seperate calls incase an override of initialized variables is desired before render.
    Bar.init();
    
    // Generate Bars
    Bar.render();
  });
```

You should now see a bar graph with minimal default styling.
when you launch `index.html`. Note that **the styling is mostly left to you**.

A common use case is for graphs is to update display. To do so, simply change any desired parameters, and call updateGraph().
**Note: Cannot currently remove interactivity or labels after initial render through an update.** `Attempting to do so will break`
Example:

```
(main.js)
---------------------
Bar
  .data(newData)
  .cSeries('region')
  .nSeries(['cars', 'houses', "two words"])
  .graphTitle('Region stats')
  .nAxisTitle('Stats')
  .cAxisTitle('Region')
  .log(true)
  .proportional(true)
  .grouped(true)
  .colourSeries(['blue', 'red', 'yellow', 'purple', 'pink'])
  .updateGraph();
```

The following CSS selectors might be useful:
- *Bars*: `svg#bar1>g.bars` contains a subgroup for each series of data
  you have. For instance, it may contain `g.var0` and `g.var1`
  (if you set those values in your ySeries array). Each of these subgroups 
  will have `rect` elements whose fill you can change. 
- *Titles*: `svg#bar1>g.titles` contains three text elements 
  which represent the graph title (`text.graph-title`), 
  y-axis title (`text.n-axis-title`), and x-axis title 
  (`text.c-axis-title`).
- *Axes*: `svg#bar1>g.axes>g.y text` - all the text in the 
  y-axis. Similarly, `svg#bar1>g.axes>g.x text` selects 
  all the text in the x-axis.
- *Legend*: `svg#bar1>g.legend` contains a `circle` and `text` element
  per output series that you have. Each will have a class based on 
  the values you set in your ySeries array. Ex: You might have 
  elements like `text.var0` and `circle.var1`.
- *Tooltip*: `div#wrapper1>div.tooltip` is the tooltip element. You
  will likely want to change its size, background colour, etc. 

For example, use the following CSS:
```
/* Graph background */
svg {
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Text sizing */
svg#bar1 text.graph-title {
  font-size: larger;
}
svg#bar1 g.axes text {
  font-size: small;
}

svg#bar1 text.c-axis-title, svg#bar1 text.n-axis-title {
  font-size: large;
}
svg#bar1 .axes .c text{
  transform: rotate(30deg);
  text-anchor: start;
}

svg#bar1 g.legend text {
  font-size: small;
  /*text-transform: capitalize;*/
}
svg#bar1 g.bars text{
  font-size: small;
}

svg .n .tick:not(:nth-of-type(1)) line{
  stroke: lightgray;
}

/* table */
table th {
  text-transform: capitalize;
  scope: col;
  vertical-align: top;
}

table caption {
  text-align: left;
}


/* Tooltip styling */
div.tooltip {
  background-color: white;
  color: black;
  border: 1px solid black;
  border-radius: 5px;
  padding: 10px;
  position: fixed;
  max-width: 200px;
}
```

The format of the graph will change based on the selected graph type (grouped, stacked). As such, some selectors may change.

**A better way to change the legend and bar colours** would be to set the Bar.colourSeries to a new array of desired colours.
 - `Bar.colourSeries(['blue', 'red', 'yellow'])`
This assigns the colours in order, such that `val0` is coloured `blue`, `val1` is coloured `red`, etc.

There are many other common ways to customize the bar graph listed below. These boolean values control whether that functionality appears, but are defaulted to false:
 - *Vertical*: `Bar.vertical(true);`
 - *Grouped*: `Bar.grouped(true);`
 - *Bar labels*: `Bar.barLabels(true);`
 - *Tooltips*: `tooltips(true);`
    - Requires the tooltip css to display properly
 - *Interactive*: `Bar.interactive(true);`
 - *Gridlines*: `Bar.gridlines(true);`
 - *Logarithmic scale*: `Bar.log(true);`
    - Only affects grouped bar charts
 - *Proportional*: `Bar.proportional(true);`
    - Only affects stacked bar charts
 - *Display legend*: `Bar.displayLegend(true);`

Customize the spacing, size and bar padding:
 - *Height*: `Bar.height(480);`
 - *Width*: `Bar.width(720);`
    - Width of the SVG will always be 100% of the container. The height and width attributes are the viewbox ratio of the SVG.
 - *Margins [Top, right, bottom, left]*: `Bar.margins([80,40,120,100]);`
 - *Padding between bar groups*: `Bar.padding(0.25);`
 - *Sub padding for grouped bar charts*: `Bar.subPadding(0.25);`
 - *c-Axis-title distance from axis*: `Bar.cAxisTitleSpacing(50);`
 - *n-Axis-title distance from axis*: `Bar.nAxisTitleSpacing(60);`

Customize the legend:
 - *Radius*: `Bar.legendRadius(6);`
 - *Horizontal space between circle and text*: `Bar.legendTextOffset(15);`
 - *Vertical space between vertical circles*: `Bar.legendCircleSpacing(15);`
 - *Horizontal space between graph and legend*: `Bar.legendSpacingFromGraph(30);`
 
Customize formatting/misc.:
 - *How many decimals to round off to*: `Bar.decimalPlaces(1)`;
 - *Transition duration*: `Bar.transitionDuration(1000)`;

Callbacks:
 - *Callback on click*: `Bar.callbackClick(yourCallback)`;
 - *Callback on hover*: `Bar.callbackHover(yourCallback)`;

Accessibility:
 - *Aria figure label*: `Bar.figureAriaLabel("Bargraph")`;
 - *Aria figure description*: `Bar.figureAriaDescription('Your description. Default is generic how to use.');`

Create/customize the table:
 - *Create table in div*: `Bar.table(d3.select('div#wrapper1'))`
 - *Caption*: `Bar.tableCaption('Example caption')`
 - *Summary*: `Bar.tableSummary('Example - Text description')`