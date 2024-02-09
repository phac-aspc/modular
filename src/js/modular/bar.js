/*

BAR.JS

This file has a class with methods related to creating a bar graph. 

Note that d3.js must be loaded before using this file.

The following methods can be used:
- BarGraph() - bar graph constructor 
- init() - sets up axis generators, scale functions, data - all together. 
- initStack() - prepares raw data for rendering stack bar graph.
- initCScale() - sets up scale function for categorical data axis
- initNScale() - sets up scale function for numerical data axis
- initAxes() - sets up axis generator functions
- initBarWidth() - computes width of each bar based on data and graph size
- clear() - removes the existing graph (visuals removed, settings remain)
- render() - displays the graph after settings have been configured

Also, the following fields are useful to adjust: 
- data/cSeries/nSeries - raw data as an array of objects and the keys showing
  the categorical/numerical data field of objects
- graphTitle/cAxisTitle/nAxisTitle - the titles to display on top of the graph
  and on each axis
- vertical - whether to have vertical bars or horizontal
- grouped - whether to have side-by-side bars in groups or to stack the bars
- container - an SVG element to render the bar graph in
- wrapper - a div element containing the SVG element
- width/height/margins - controls the size of the bar graph

*/


export class BarGraph {
  // =============== DECLARE FIELDS ===================
  #data;
  #cSeries;
  #cKeys;
  #nSeries;
  #selectedNSeries;
  #colourSeries = [
    "#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#37A86F",
    "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab",
    "#6b9ac4", "#d84b2a", "#8c8c8c", "#69cc58", "#e279a3",
    "#665191", "#f7b6d2", "#dbdb8d", "#bcbd22", "#17becf",
    "#9467bd", "#69312d", "#e377c2", "#c49c94",
  ]
  #tooltipSeries;

  #nSeriesLookup = {}
  #nSeriesReverseLookup = {}

  #graphTitle;
  #cAxisTitle;
  #nAxisTitle;

  #cAxisTitleSpacing = 50;
  #nAxisTitleSpacing = 60;

  #vertical = false;
  #grouped = false;
  #tooltips = false;
  #specificTooltip = false;
  #barLabels = false;
  #interactive = false;
  #loadAnimation = false; // functionality currently removed
  #gridlines = false;
  #log = false;
  #proportional = false;
  #textContrastChecker = false; // functionality currently removed
  #displayLegend = false;

  #decimalPlaces = 1;
  #decimalType = 'round';

  //internalCheck
  #updateCalled = false;

  #transitionDuration = 1000;

  //formatters
  #tableHeaderFunction;
  #nTickFormat;

  //callbacks
  #callbackClick;
  #callbackHover;

  //Accessibility
  #figureAriaLabel = "Bargraph";
  #figureAriaDescription = 'Contains different bars. Press the "Enter" key to tab through the bar groups, and enter again to tab through bars within a group. To exit the graph, either tab through all the groups or press the "Escape" key';

  // #logMin = 0.001;
  #min;
  #max;

  /*
     things to add functionality for:
     - Allow barlabels to be toggled on/off between updates
     - Consider dynamically hiding text that does not fit in respective bar (currently thinking no, let graph maker decide whats right for graph)
  */

  #container;
  #wrapper;

  #table;
  #tableCaption;
  #tableSummary = d3.select('html').attr('lang') == "fr" ? "Texte descriptif" : "Text description";

  #axisGens;
  #stackGen;
  #stackData;

  //private
  #proportionalStack;

  #cScale;
  #nScale;
  #selectedNScale;
  #colourScale;

  #cSubScale;

  #width = 720;
  #height = 480;
  #margins = { l: 100, r: 60, t: 60, b: 100 };
  #padding = 0.25;
  #subPadding = 0;

  #barWidth;
  #legendRadius = 8;
  #legendTextOffset = 15;
  #legendCircleSpacing = 28;
  #legendSpacingFromGraph = 20;

  // =============== CHAINING METHODS - with validation ===================
  data(inputData) {
    /*
    Parameters 
    ----------------
    inputData (type: array)
      - An array of object(s) with 2+ fields per object
      - Each object represents one row of data. Each field represents a column
    */
    if (arguments.length === 0) {
      return this.#data;
    }
    else {
      // Check input
      const nonEmptyArray = (typeof inputData == typeof []) &&
        (inputData.length > 0);
      let validElements = true;

      if (nonEmptyArray) {
        for (let v of inputData) {
          if ((typeof v != typeof {}) ||
            Object.keys(v).length < 2) {

            validElements = false;
            break;
          }
        }
      }

      // Set field
      if (nonEmptyArray && validElements) {
        this.#data = inputData;
        return this;
      }
      else {
        console.error('Data must be an array of object(s) with 2+ fields');
      }
    }
  }
  cSeries(inputKey) {
    /*
    Parameters 
    ----------------
    inputKey (type: string)
      - A string representing a key that the data field has. 
      - This string should indicate some key to use for the categoricl axis
    */
    if (arguments.length === 0) {
      return this.#cSeries;
    }
    else {

      const validString = (typeof inputKey == typeof 'abc') && inputKey;

      if (validString) {
        this.#cSeries = inputKey;
        return this;
      }
      else {
        console.error('cSeries must be a non-empty string');
      }
    }
  }
  nSeries(inputKeys) {
    /*
    Parameters 
    ----------------
    inputKeys (type: array)
      - An array of string(s) representing key(s) that the data field has. 
      - This array should indicate some key(s) to use for the numerical axis
    */
    let createLookups = (nSeries) => {
      this.#nSeriesLookup = {};
      this.#nSeriesReverseLookup = {};

      nSeries.map((el, i) => {
        this.#nSeriesLookup[el] = "val" + i;
        this.#nSeriesReverseLookup["val" + i] = el;
      })
    }

    if (arguments.length === 0) {
      return this.#nSeries;
    }
    else {
      // Check input
      const nonEmptyArray = (typeof inputKeys == typeof []) &&
        (inputKeys.length > 0);
      let validElements = true;

      if (nonEmptyArray) {
        for (let v of inputKeys) {
          if ((typeof v != typeof 'abc') || !v) {
            validElements = false;
            break;
          }
        }
      }

      // Set field
      if (nonEmptyArray && validElements) {
        this.#nSeries = inputKeys;
        createLookups(inputKeys);
        return this;
      }
      else {
        console.error('nSeries must be an array of non-empty string(s)');
      }
    }
  }
  selectedNSeries(inputKeys) {
    /*
    Parameters 
    ----------------
    inputKeys (type: array)
      - An array of string(s) representing key(s) that the data field has currently selected. 
      - This array should indicate some key(s) to use for the numerical axis
    */

    if (arguments.length === 0) {
      return this.#selectedNSeries;
    }
    else {
      // Check input
      const nonEmptyArray = (typeof inputKeys == typeof []) &&
        (inputKeys.length > 0);
      let validElements = true;

      if (nonEmptyArray) {
        for (let v of inputKeys) {
          if ((typeof v != typeof 'abc') || !v) {
            validElements = false;
            break;
          }
        }
      }

      // Set field
      if (nonEmptyArray && validElements) {
        this.#selectedNSeries = inputKeys;
        return this;
      }
      else {
        console.error('selectedNSeries must be an array of non-empty string(s)');
      }
    }
  }
  colourSeries(inputKeys) {
    /*
    Parameters 
    ----------------
    inputKeys (type: array)
      - An array of string(s) representing key(s) that the data field has currently selected. 
      - This array should indicate some key(s) to use for the numerical axis
    */

    if (arguments.length === 0) {
      return this.#colourSeries;
    }
    else {
      // Check input
      const nonEmptyArray = (typeof inputKeys == typeof []) &&
        (inputKeys.length > 0);
      let validElements = true;

      if (nonEmptyArray) {
        for (let v of inputKeys) {
          if ((typeof v != typeof 'abc') || !v) {
            validElements = false;
            break;
          }
        }
      }

      // Set field
      if (nonEmptyArray && validElements) {
        this.#colourSeries = inputKeys;
        return this;
      }
      else {
        console.error('colourSeries must be an array of non-empty string(s)');
      }
    }
  }
  tooltipSeries(inputKeys) {
    /*
    Parameters 
    ----------------
    inputKeys (type: array)
      - An array of string(s) representing key(s) that the data field has. 
      - This array should indicate some key(s) to use for the tooltips
    */

    if (arguments.length === 0) {
      return this.#tooltipSeries;
    }
    else {
      // Check input
      const nonEmptyArray = (typeof inputKeys == typeof []) &&
        (inputKeys.length > 0);
      let validElements = true;

      if (nonEmptyArray) {
        for (let v of inputKeys) {
          if ((typeof v != typeof 'abc') || !v) {
            validElements = false;
            break;
          }
        }
      }

      // Set field
      if (nonEmptyArray && validElements) {
        this.#tooltipSeries = inputKeys;
        return this;
      }
      else {
        console.error('tooltipSeries must be an array of non-empty string(s)');
      }
    }
  }

  graphTitle(inputTitle) {
    /*
    Parameters 
    ----------------
    inputTitle (type: string)
      - A string containing the title for the graph. 
    */

    if (arguments.length === 0) {
      return this.#graphTitle;
    }
    else {
      const validString = (typeof inputTitle == typeof 'abc') && inputTitle;

      if (validString) {
        this.#graphTitle = inputTitle;
        return this;
      }
      else {
        console.error('graphTitle must be a non-empty string');
      }
    }
  }
  cAxisTitle(inputTitle) {
    /*
    Parameters 
    ----------------
    inputTitle (type: string)
      - A string containing the title for the categorical axis. 
    */

    if (arguments.length === 0) {
      return this.#cAxisTitle;
    }
    else {
      const validString = (typeof inputTitle == typeof 'abc');

      if (validString) {
        this.#cAxisTitle = inputTitle;
        return this;
      }
      else {
        console.error('cAxisTitle must be a string');
      }
    }
  }
  nAxisTitle(inputTitle) {
    /*
    Parameters 
    ----------------
    inputTitle (type: string)
      - A string containing the title for the numerical axis. 
    */

    if (arguments.length === 0) {
      return this.#nAxisTitle;
    }
    else {
      const validString = (typeof inputTitle == typeof 'abc');

      if (validString) {
        this.#nAxisTitle = inputTitle;
        return this;
      }
      else {
        console.error('nAxisTitle must be a string');
      }
    }
  }
  cAxisTitleSpacing(inputSpacing) {
    /*
    Parameters 
    ----------------
    inputSpacing (type: number)
      - A number for the spacing from the cAxis.
    */
    if (arguments.length === 0) {
      return this.#cAxisTitleSpacing;
    }
    else {
      const validNum = (typeof inputSpacing == typeof 5) &&
        (inputSpacing >= 0);

      if (validNum) {
        this.#cAxisTitleSpacing = inputSpacing;
        return this;
      }
      else {
        console.error('cAxisTitleSpacing must be a number');
      }
    }
  }
  nAxisTitleSpacing(inputSpacing) {
    /*
    Parameters 
    ----------------
    inputSpacing (type: number)
      - A number for the spacing from the cAxis.
    */
    if (arguments.length === 0) {
      return this.#nAxisTitleSpacing;
    }
    else {
      const validNum = (typeof inputSpacing == typeof 5) &&
        (inputSpacing >= 0);

      if (validNum) {
        this.#nAxisTitleSpacing = inputSpacing;
        return this;
      }
      else {
        console.error('nAxisTitleSpacing must be a number');
      }
    }
  }
  decimalPlaces(input) {
    /*
    Parameters 
    ----------------
    input (type: number)
      - Number of decimal places.
    */
    if (arguments.length === 0) {
      return this.#decimalPlaces;
    }
    else {
      const validNum = (typeof input == typeof 5) &&
        (input >= 0);

      if (validNum) {
        this.#decimalPlaces = input;
        return this;
      }
      else {
        console.error('decimalPlaces must be a number');
      }
    }
  }
  decimalType(input) {
    /*
    Parameters 
    ----------------
    input (type: number)
      - Number of decimal places.
    */
    let accepted = ['round', 'fixed']
    if (arguments.length === 0) {
      return this.#decimalType;
    }
    else {
      const valid = (typeof input == typeof 'abc' && accepted.includes(input.toLowerCase()));

      if (valid) {
        this.#decimalType = input;
        return this;
      }
      else {
        console.error('decimalType must be either "round" or "fixed"');
      }
    }
  }

  vertical(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph have vertical bars. False otherwise.
    */
    if (arguments.length === 0) {
      return this.#vertical;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#vertical = inputToggle;
        return this;
      }
      else {
        console.error('vertical must be a boolean');
      }
    }
  }
  grouped(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph have grouped bars. False otherwise.
    */
    if (arguments.length === 0) {
      return this.#grouped;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#grouped = inputToggle;
        return this;
      }
      else {
        console.error('grouped must be a boolean');
      }
    }
  }
  tooltips(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph have tooltips. False otherwise.
    */
    if (arguments.length === 0) {
      return this.#tooltips;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#tooltips = inputToggle;
        return this;
      }
      else {
        console.error('tooltips must be a boolean');
      }
    }
  }
  specificTooltip(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph have tooltips. False otherwise.
    */
    if (arguments.length === 0) {
      return this.#specificTooltip;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#specificTooltip = inputToggle;
        return this;
      }
      else {
        console.error('specificTooltip must be a boolean');
      }
    }
  }
  barLabels(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph have barLabels. False otherwise.
    */
    if (arguments.length === 0) {
      return this.#barLabels;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#barLabels = inputToggle;
        return this;
      }
      else {
        console.error('barLabels must be a boolean');
      }
    }
  }
  interactive(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph interactive. False otherwise.
    */
    if (arguments.length === 0) {
      return this.#interactive;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#interactive = inputToggle;
        return this;
      }
      else {
        console.error('interactive must be a boolean');
      }
    }
  }
  loadAnimation(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph have a loading animation. False otherwise.
    */
    if (arguments.length === 0) {
      return this.#loadAnimation;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#loadAnimation = inputToggle;
        return this;
      }
      else {
        console.error('loadAnimation must be a boolean');
      }
    }
  }
  gridlines(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph have gridlines. False otherwise.
    */

    if (arguments.length === 0) {
      return this.#gridlines;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#gridlines = inputToggle;
        return this;
      }
      else {
        console.error('gridlines must be a boolean');
      }
    }
  }

  log(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph have a logarithmic scale
    */

    if (arguments.length === 0) {
      return this.#log;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#log = inputToggle;
        return this;
      }
      else {
        console.error('log must be a boolean');
      }
    }
  }
  proportional(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph have a logarithmic scale
    */

    if (arguments.length === 0) {
      return this.#proportional;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#proportional = inputToggle;
        return this;
      }
      else {
        console.error('proportional must be a boolean');
      }
    }
  }
  displayLegend(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph displayLegend
    */

    if (arguments.length === 0) {
      return this.#displayLegend;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#displayLegend = inputToggle;
        return this;
      }
      else {
        console.error('displayLegend must be a boolean');
      }
    }
  }

  legendRadius(inputRadius) {
    /*
    Parameters 
    ----------------
    inputRadius (type: number)
      - A non-negative number for the radius of the legend circles.
    */
    if (arguments.length === 0) {
      return this.#legendRadius;
    }
    else {
      const validNum = (typeof inputRadius == typeof 5) &&
        (inputRadius >= 0);

      if (validNum) {
        this.#legendRadius = inputRadius;
        return this;
      }
      else {
        console.error('legendRadius must be a non-negative number');
      }
    }
  }
  legendTextOffset(inputOffset) {
    /*
    Parameters 
    ----------------
    inputOffset (type: number)
      - A number for the space between text and the legend circles.
    */
    if (arguments.length === 0) {
      return this.#legendTextOffset;
    }
    else {
      const validNum = (typeof inputOffset == typeof 5);

      if (validNum) {
        this.#legendTextOffset = inputOffset;
        return this;
      }
      else {
        console.error('legendTextOffset must be a number');
      }
    }
  }
  legendCircleSpacing(inputSpacing) {
    /*
    Parameters 
    ----------------
    inputSpacing (type: number)
      - A number for the spacing between legend circles.
    */
    if (arguments.length === 0) {
      return this.#legendCircleSpacing;
    }
    else {
      const validNum = (typeof inputSpacing == typeof 5);

      if (validNum) {
        this.#legendCircleSpacing = inputSpacing;
        return this;
      }
      else {
        console.error('legendCircleSpacing must be a number');
      }
    }
  }
  legendSpacingFromGraph(inputSpacing) {
    /*
    Parameters 
    ----------------
    inputSpacing (type: number)
      - A number for the spacing between the graph and the legend.
    */
    if (arguments.length === 0) {
      return this.#legendSpacingFromGraph;
    }
    else {
      const validNum = (typeof inputSpacing == typeof 5);

      if (validNum) {
        this.#legendSpacingFromGraph = inputSpacing;
        return this;
      }
      else {
        console.error('legendCircleSpacing must be a number');
      }
    }
  }
  transitionDuration(input) {
    if (arguments.length === 0) {
      return this.#transitionDuration;
    }
    else {
      const validNum = (typeof input == typeof 5) &&
        (input >= 0);

      if (validNum) {
        this.#transitionDuration = input;
        return this;
      }
      else {
        console.error('transitionDuration must be a non-negative number');
      }
    }
  }
  barWidth(inputBarWidth) {
    /*
    Parameters 
    ----------------
    inputBarWidth (type: number)
      - A non-negative number for the width of bars.
    */
    if (arguments.length === 0) {
      return this.#barWidth;
    }
    else {
      const validNum = (typeof inputBarWidth == typeof 5) &&
        (inputBarWidth >= 0);

      if (validNum) {
        this.#barWidth = inputBarWidth;
        return this;
      }
      else {
        console.error('barWidth must be a non-negative number');
      }
    }
  }

  width(inputWidth) {
    /*
    Parameters 
    ----------------
    inputWidth (type: number)
      - A non-negative number for the width of the bar graph.
    */
    if (arguments.length === 0) {
      return this.#width;
    }
    else {
      const validNum = (typeof inputWidth == typeof 5) &&
        (inputWidth >= 0);

      if (validNum) {
        this.#width = inputWidth;
        return this;
      }
      else {
        console.error('width must be a non-negative number');
      }
    }
  }
  height(inputHeight) {
    /*
    Parameters 
    ----------------
    inputHeight (type: number)
      - A non-negative number for the height of the bar graph. 
    */

    if (arguments.length === 0) {
      return this.#height;
    }
    else {
      const validNum = (typeof inputHeight == typeof 5) &&
        (inputHeight >= 0);

      if (validNum) {
        this.#height = inputHeight;
        return this;
      }
      else {
        console.error('height must be a non-negative number');
      }
    }
  }
  margins(inputMargins) {
    /*
    Parameters 
    ----------------
    inputMargins (type: array)
      - An array of numbers representing margins between the 
        bar graph and the SVG container. 
      - Specify margins in clockwise order (top, right, bottom, left)
    */
    if (arguments.length === 0) {
      return this.#margins;
    }
    else {
      // Validate nums
      let validNums = true;
      for (let n of inputMargins) {
        if (typeof n != typeof 5) {
          validNums = false;
          break;
        }
      }

      // Set fields
      if (validNums) {
        this.#margins = {
          l: inputMargins[3],
          r: inputMargins[1],
          t: inputMargins[0],
          b: inputMargins[2]
        };
        return this;
      }
      else {
        console.error(
          'Please input an array of four numbers to configure top,' +
          'right, bottom, and left margins in that order.'
        );
      }
    }
  }
  padding(inputPadding) {
    /*
    Parameters 
    ----------------
    inputPadding (type: number)
      - A number between 0 and 1 that represents a decimal percentage. 
      - This should indicate what percent of a bar's width should 
        be cut away for padding.
    */
    if (arguments.length === 0) {
      return this.#padding;
    }
    else {
      const validNum = (typeof inputPadding == typeof 5) &&
        (inputPadding <= 1) && (inputPadding >= 0);

      if (validNum) {
        this.#padding = inputPadding;
        return this;
      }
      else {
        console.error('padding must be a decimal number between 0-1');
      }
    }
  }
  subPadding(inputSubPadding) {
    /*
    Parameters 
    ----------------
    inputSubPadding (type: number)
      - A number between 0 and 1 that represents a decimal percentage. 
      - This should indicate what percent of a bar's width should 
        be cut away for padding.
    */
    if (arguments.length === 0) {
      return this.#subPadding;
    }
    else {
      const validNum = (typeof inputSubPadding == typeof 5) &&
        (inputSubPadding <= 1) && (inputSubPadding >= 0);

      if (validNum) {
        this.#subPadding = inputSubPadding;
        return this;
      }
      else {
        console.error('subPadding must be a decimal number between 0-1');
      }
    }
  }
  tableCaption(inputCaption) {
    /*
    Parameters 
    ----------------
    inputCaption (type: string)
      - A string containing the caption for the table. 
    */

    if (arguments.length === 0) {
      return this.#tableCaption;
    }
    else {
      const validString = (typeof inputCaption == typeof 'abc') && inputCaption;

      if (validString) {
        this.#tableCaption = inputCaption;
        return this;
      }
      else {
        console.error('tableCaption must be a non-empty string');
      }
    }
  }
  tableSummary(inputSummary) {
    /*
    Parameters 
    ----------------
    inputCaption (type: string)
      - A string containing the caption for the table. 
    */

    if (arguments.length === 0) {
      return this.#tableSummary;
    }
    else {
      const validString = (typeof inputSummary == typeof 'abc') && inputSummary;

      if (validString) {
        this.#tableSummary = inputSummary;
        return this;
      }
      else {
        console.error('tableSummary must be a non-empty string');
      }
    }
  }

  // NO VALIDATION chaining methods (read: bugs are your responsibility)
  axisGens(inputAxes) {
    /*
    Parameters 
    ----------------
    inputAxes (type: array)
      - An array with two d3.axis generator functions.
      - The first is the category axis. The second as the numerical axis
    */
    if (arguments.length === 0) {
      return this.#axisGens;
    }
    else {
      this.#axisGens = { c: inputAxes[0], n: inputAxes[1] };
      return this;
    }
  }
  stackGen(inputStackGen) {
    /*
    Parameters 
    ----------------
    inputStackGen (type: function)
      - An d3.stack generator function.
    */
    if (arguments.length === 0) {
      return this.#stackGen;
    }
    else {
      this.#stackGen = inputStackGen;
      return this;
    }
  }
  stackData(inputStackData) {
    /*
    Parameters 
    ----------------
    inputStackData (type: array)
      - The return array of objects from calling a d3.stack 
        generator function.
    */
    if (arguments.length === 0) {
      return this.#stackData;
    }
    else {
      this.#stackData = inputStackData;
      return this;
    }
  }

  cScale(inputCScale) {
    /*
    Parameters 
    ----------------
    inputCScale (type: function)
      - A d3.scale function that will be used to space the labels and 
        categorical position of bars.
    */
    if (arguments.length === 0) {
      return this.#cScale;
    }
    else {
      this.#cScale = inputCScale;
      return this;
    }
  }
  nScale(inputNScale) {
    /*
    Parameters 
    ----------------
    inputNScale (type: function)
      - A d3.scale function that will be used to set the height of the bars
    */
    if (arguments.length === 0) {
      return this.#nScale;
    }
    else {
      this.#nScale = inputNScale;
      return this;
    }
  }
  selectedNScale(inputNScale) {
    /*
    Parameters 
    ----------------
    inputNScale (type: function)
      - A d3.scale function that will be used to set the height of the bars
    */
    if (arguments.length === 0) {
      return this.#selectedNScale;
    }
    else {
      this.#selectedNScale = inputNScale;
      return this;
    }
  }
  cSubScale(inputCSubScale) {
    /*
    Parameters 
    ----------------
    inputCSubScale (type: function)
      - A d3.scale function that will be used to space the labels and 
        categorical position of bars for the subgroups in a grouped bar chart.
    */
    if (arguments.length === 0) {
      return this.#cSubScale;
    }
    else {
      this.#cSubScale = inputCSubScale;
      return this;
    }
  }
  colourScale(inputColourScale) {
    /*
    Parameters 
    ----------------
    inputCSubScale (type: function)
      - A d3.scaleOrdinal function that will be used to colour the bars.
    */
    if (arguments.length === 0) {
      return this.#colourScale;
    }
    else {
      this.#colourScale = inputColourScale;
      return this;
    }
  }

  container(inputContainer) {
    /*
    Parameters 
    ----------------
    inputContainer (type: D3.js selection)
      - A SVG DOM element to render the bar graph in 
        (inputted as a d3.js selection)
    */
    if (arguments.length === 0) {
      return this.#container;
    }
    else {
      this.#container = inputContainer;
      return this;
    }
  }
  wrapper(inputWrapper) {
    /*
    Parameters 
    ----------------
    inputWrapper (type: D3.js selection)
      - A div containing the container element to render the 
        tooltips in (inputted as a d3.js selection)
    */
    if (arguments.length === 0) {
      return this.#wrapper;
    }
    else {
      this.#wrapper = inputWrapper;
      return this;
    }
  }
  table(inputTable) {
    /*
    Parameters 
    ----------------
    inputWrapper (type: D3.js selection)
      - A div to append the table to.
    */
    if (arguments.length === 0) {
      return this.#table;
    }
    else {
      this.#table = inputTable;
      return this;
    }
  }
  figureAriaLabel(input) {
    if (arguments.length === 0) {
      return this.#figureAriaLabel;
    }
    else {
      const validString = (typeof input == typeof 'abc') && input;

      if (validString) {
        this.#figureAriaLabel = input
        return this;
      }
      else {
        console.error('figureAriaLabel must be a non-empty string');
      }
    }
  }

  figureAriaDescription(input) {
    if (arguments.length === 0) {
      return this.#figureAriaDescription;
    }
    else {
      const validString = (typeof input == typeof 'abc') && input;

      if (validString) {
        this.#figureAriaDescription = input
        return this;
      }
      else {
        console.error('figureAriaDescription must be a non-empty string');
      }
    }
  }

  callbackClick(input) {
    if (arguments.length === 0) {
      return this.#callbackClick;
    }
    else {
      this.#callbackClick = input
      return this;
    }
  }
  callbackHover(input) {
    if (arguments.length === 0) {
      return this.#callbackHover;
    }
    else {
      this.#callbackHover = input
      return this;
    }
  }

  tableHeaderFunction(input) {
    if (arguments.length === 0) {
      return this.#tableHeaderFunction;
    }
    else {
      this.#tableHeaderFunction = input
      return this;
    }
  }
  nTickFormat(input) {
    if (arguments.length === 0) {
      return this.#nTickFormat;
    }
    else {
      this.#nTickFormat = input
      return this;
    }
  }


  // =============== HELPER METHODS (PUBLIC) ===================
  initContainer() {
    /*
    Assigns the basic attributes to the container svg.
    
    Parameters
    ----------------
    undefined
    - Note: Requires height and width to have a value

    Returns
    ----------------
    undefined
    
    */

    this.#container
      // .attr('height', this.#height)
      .attr('width', '100%')
      .attr('viewBox', `0 0 ${this.#width} ${this.#height}`)
      .attr("perserveAspectRatio", "xMinyMin meet")
      .attr('aria-label', this.#figureAriaLabel)
      .attr('aria-description', this.#figureAriaDescription)
      .attr('tabindex', 0)
  }
  initStack() {
    /* 
    This function initialises a d3.stack() function and its return data. 
    
    Parameters
    ----------------
    undefined
    - Though note that the scales will be initialised using
      the values of #ySeries, and #data.

    Returns
    ----------------
    undefined
    
    */


    this.#cKeys = this.#createCKeys(); // data

    // Create stack first (data needed for yScale)
    this.#stackGen = this.#createStackGen(); // nSeries

    //if proportional, change the values as a percent value of the total
    if (this.#proportional) {
      this.#stackData = this.#createProportionalStackData(); // data, nSeries, stackGen
    }
    else {
      this.#stackData = this.#stackGen(this.#data);
    }

    //convert the stack such that it's rebased on the dependent variables instead of the independent


    this.#stackData = this.#rebaseStackData(); //stackData, cKeys

    // console.log("newStack", newStackData)
    // console.log("stack", this.#stackData)
  }
  initNScale(log = false) {
    /*
      This function initialises a d3.scale function to set bar height.
      
      NOTE: Ensure that this.#stackGen and this.#stackData are set
      before calling this method.
    
      Parameters 
      -----------------
      log (type: bool)
        - Whether to set the bar height with a log scale.
    */

    let [min, max] = this.#dataMinMax();
    this.#min = min;
    this.#max = max;

    // Create log/lin functions
    if (log && this.#grouped) {
      this.#nScale = d3
        .scaleLog()
        // .domain([min > this.#logMin ? min : this.#logMin, max])
        .domain([min, max])
        .range([(this.#height - this.#margins.b), this.#margins.t]);
    }
    else if (this.#proportional && !this.#grouped) {
      this.#nScale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([(this.#height - this.#margins.b), this.#margins.t]);
    }
    else {
      this.#nScale = d3
        .scaleLinear()
        .domain([0, max])
        .range([(this.#height - this.#margins.b), this.#margins.t]);
    }

    // Adjust for horizontal bar graphs
    if (!this.#vertical) {
      if (log && this.#grouped) {
        this.#nScale = this.#nScale
          .range([this.#margins.l, this.#width - this.#margins.l - this.#margins.r]);
      }
      else {
        this.#nScale = this.#nScale
          .range([this.#margins.l, this.#width - this.#margins.l - this.#margins.r]);
      }
    }

  }
  initCScale() {
    /* 
    Initialises a bandscale for the categorical axis
    
    Parameters
    -------------------
    undefined
    - Though note that this method relies on values of #data, #cSeries, 
      #margins, #padding, and #width. Please initialise those before calling the method
      
    Returns
    -------------------
    undefined
    */

    this.#cScale = d3
      .scaleBand()
      .domain(this.#data.map(d => d[this.#cSeries]))
      .range([this.#margins.l, this.#width - this.#margins.l - this.#margins.r])
      .padding([this.#padding]);

    // Adjust for horizontal bar graphs
    if (!this.#vertical) {
      this.#cScale = this.#cScale
        .range([this.#margins.t, this.#height - this.#margins.b]);
    }
  }
  initCSubScale() {
    /* 
    Initialises a bandscale for the categorical axis
    
    Parameters
    -------------------
    undefined
    - Though note that this method relies on values of #data, #cSeries, #nSeries, #cScale,
      #margins, #subPadding, and #width. Please initialise those before calling the method
      
    Returns
    -------------------
    undefined
    */

    this.#cSubScale = d3
      .scaleBand()
      .domain(this.#nSeries)
      .range([0, this.#cScale.bandwidth()])
      .padding([this.#subPadding]);
  }
  initColourScale() {
    /*
    Initializes a scaleOrdinal for the colours of the bars.
    */
    this.#colourScale = d3
      .scaleOrdinal()
      .domain(this.#nSeries)
      .range(this.#colourSeries)
  }
  initAxes(cAxisOptions = {}, nAxisOptions = {}) {
    /*
    This function initialises the bottom and left scales for the bar graph
    
    Parameters
    -----------------
    cAxisOptions/nAxisOptions (type: object)
    - Objects with settings to configure the categorical and numerical axes. 
    - Input settings as key-value pairs in the objects. 
    - Valid keys are `ticks`, `tickValues`, `tickFormat`, `tickPadding`, and
      `tickSize`.
    - See d3.js documentation for valid values;
    - Also note that this function relies on #cScale and #nScale. 
      Make sure these are initialised.
      
    Returns
    -----------------
    undefined
    */

    // Create axes
    let n = d3.axisLeft(this.#nScale);
    let c = d3.axisBottom(this.#cScale);

    if (!this.#vertical) {
      n = d3.axisBottom(this.#nScale);
      c = d3.axisLeft(this.#cScale);
    }

    // Set options
    function setOptions(ax, obj) {
      if (obj.ticks) ax.ticks(obj.ticks);
      if (obj.tickValues) ax.tickValues(obj.tickValues);
      if (obj.tickFormat) ax.tickFormat(obj.tickFormat);
      if (obj.tickPadding) ax.tickPadding(obj.tickPadding);
      if (obj.tickSizeOuter) ax.tickSizeOuter(obj.tickSizeOuter);
      if (obj.tickSizeInner) ax.tickSizeInner(obj.tickSizeInner);
    }

    setOptions(n, nAxisOptions);
    setOptions(c, cAxisOptions);

    this.#axisGens = { c, n };
  }
  initBarWidth() {
    /*
    Computes width of each bar
    
    Parameters
    ---------------
    undefined
    - Though note that this method relies on #margins, #width, 
      #data, #grouped, and #padding. Initialise those as you'd like first
      
    Returns
    ---------------
    undefined
    */

    if (this.#grouped) {
      this.#barWidth = this.#cSubScale.bandwidth()
    }
    else {
      this.#barWidth = this.#cScale.bandwidth()
    }

  }
  init() {
    /* 
    This is a generic method that calls all the above methods
    with default parameters. Ie. It initialises a default cScale, nScale,
    stack, barWidth, cAxis, and nAxis. 
    
    Feel free to call this and then some of the more specific methods above
    to adjust a certain variable (ex: the axes only or the cScale only)
    
    Parameters: 
    -------------------
    undefined
    
    Returns:
    -------------------
    undefined
    */
    this.initContainer();
    this.initStack();
    this.initNScale(this.#log);
    this.initCScale();
    this.initCSubScale();
    this.initColourScale();

    let nAxisOptions = {};
    let cAxisOptions = {};
    if (this.#gridlines) {
      const gridHeight = this.#height - this.#margins.b - this.#margins.t;
      const gridWidth = this.#width - this.#margins.l * 2 - this.#margins.r;
      const gridlineLength = this.#vertical ? -gridWidth : -gridHeight;

      nAxisOptions["tickSizeInner"] = gridlineLength
      nAxisOptions["tickPadding"] = 10
    }
    if (this.#proportional && !this.#grouped && !this.#nTickFormat) {
      nAxisOptions["tickFormat"] = d => d + '%';
    }
    if (this.#nTickFormat) {
      nAxisOptions["tickFormat"] = this.#nTickFormat;
    }

    this.initAxes(cAxisOptions, nAxisOptions);
    this.initBarWidth();

    return this;
  }

  clear() {
    /* 
    Clears all contents of the SVG container, wrapper
    */

    this.#wrapper
      .select('div.tooltip')
      .remove();
    this.#container
      .selectAll("*")
      .remove();

    return this;
  }
  render() {
    // Render tooltips
    let tooltipEnter, tooltipLeave, tooltipMove;
    if (this.#tooltips) {
      [tooltipEnter, tooltipLeave, tooltipMove] = this.#renderTooltips();
    }


    // Render bars
    this.#renderBars(tooltipEnter, tooltipLeave, tooltipMove);

    // Render axes
    this.#renderAxes();

    // Render legends
    this.#renderLegend();

    // Render chart titles
    this.#renderTitles();


    if (this.#interactive) {
      this.#addInteraction();
    }

    this.#setTabbing();

    if (this.#table) {
      this.#addTable();
    }



    return this;
  }
  updateGraph() {
    this.#updateCalled = true;
    //update all the axes, scales, etc
    this.init();

    // Update tooltips
    let tooltipEnter, tooltipLeave, tooltipMove;
    if (this.#tooltips) {
      [tooltipEnter, tooltipLeave, tooltipMove] = this.#renderTooltips();
    }

    this.#updateAxes();
    // Update bars
    this.#renderBars(tooltipEnter, tooltipLeave, tooltipMove);

    this.#renderLegend();

    // update chart titles
    this.#renderTitles();

    if (this.#interactive) {
      this.#addInteraction();
    }

    if (this.#table) {
      this.#addTable();
    }
    this.#updateCalled = false;
    return this;
  }

  // =============== HELPER METHODS (PRIVATE) ===================
  #createCKeys(data = this.#data) {
    let cKeys = [];
    data.map(el => {
      if (!cKeys.includes(el[this.#cSeries]))
        cKeys.push(el[this.#cSeries])
    })
    return cKeys;
  }
  #createStackGen(nSeries = this.#nSeries) {
    return d3.stack().keys(nSeries);
  }
  #createProportionalStackData(data = this.#data, nSeries = this.#nSeries, stackGen = this.#stackGen) {
    let sData = stackGen(data)
    // console.log(sData)
    sData.map(el => {
      el.map(d => {
        let total = 0
        nSeries.map(n => {
          total += +d.data[n]
        })
        d["total"] = total;
        d[0] = Math.round(d[0] / total * 100)
        d[1] = Math.round(d[1] / total * 100)
      })
    });
    return sData;
  }
  #rebaseStackData(stackData = this.#stackData, cKeys = this.#cKeys) {
    let newStackData = cKeys.map((ckey, i) => {
      let newRow = []
      stackData.map((el, k) => {
        let newArr = el[i]
        newArr["key"] = el.key
        newRow.push(newArr)
      })
      newRow["key"] = ckey;
      return newRow;
    })
    return newStackData;
  }
  #getCssProperty(element, property) {
    return window.getComputedStyle(element, null).getPropertyValue(property);
  }
  #getFullFont(element) {
    let fontWeight = this.#getCssProperty(element, 'font-weight') || 'normal';
    let fontSize = this.#getCssProperty(element, 'font-size') || '16px';
    let fontFamily = this.#getCssProperty(element, 'font-family') || '"Noto Sans",sans-serif';
    return `${fontWeight} ${fontSize} ${fontFamily}`;
  }
  #calculateTextDimensions(text, font) {
    let canvas = this.#calculateTextDimensions.canvas || (this.#calculateTextDimensions.canvas = document.createElement("canvas"));
    let context = canvas.getContext("2d");
    context.font = font;
    let metrics = context.measureText(text);
    // console.log('metrics', metrics)
    let width = metrics.width;
    let height = metrics.fontBoundingBoxAscent;
    return { width, height };
  }
  #labelFitsStackedBar(textWidth, textHeight, nScale, d) {
    let xVal = this.#vertical ? textWidth : textHeight;
    let yVal = this.#vertical ? textHeight : textWidth;
    let rectY = Math.abs(nScale(d[0]) - nScale(d[1]))

    // console.log(xVal, this.#barWidth)

    //does the text fit in the rect?
    return yVal <= rectY && xVal <= this.#barWidth;
  }
  #labelFitsGroupedBar(textWidth, textHeight, d) {
    let xVal = this.#vertical ? textWidth : textHeight;
    let paddedWidth = this.#cSubScale.step()

    return xVal <= paddedWidth;
  }
  #round(number) {
    let multiplier = Math.pow(10, this.#decimalPlaces)
    return Math.round(number * multiplier) / multiplier
  }
  #getLabel(d, isProportionalLabel = true) {
    //stacked
    if (!this.#grouped) {
      // console.log("stacked label")
      if (d[1] - d[0] >= 0) {
        if (this.#decimalType == "fixed") {
          return d3.format(`.${this.#decimalPlaces}f`)(this.#round(d.val)) + (isProportionalLabel ? '%' : 0)
        }
        return this.#round(d[1] - d[0]) + (isProportionalLabel ? '%' : 0);
      }
    }
    // grouped
    else {
      if (isNaN(d.val)) {
        return d.val
      }
      if (this.#decimalType == "fixed") {
        return d3.format(`.${this.#decimalPlaces}f`)(this.#round(d.val))
      }
      return this.#round(d.val);
    }
  }
  #renderBars(tooltipEnter, tooltipLeave, tooltipMove) {
    // Add SVG subgroup
    const bars = this.#container.select('.bars').empty() ?
      this.#container
      .append('g')
      .attr('class', 'bars') :
      this.#container.select('.bars');

    // Save private fields (can't access 'this' when rendering bars)
    const that = this;
    const cSeries = this.#cSeries;
    const nSeries = this.#nSeries;
    const nScale = this.#nScale;
    const cScale = this.#cScale;
    const cSubScale = this.#cSubScale;
    const barWidth = this.#barWidth;
    const graphWidth = this.#width;
    const barLabels = this.#barLabels;
    const colourScale = this.#colourScale;
    const loadAnimation = this.#loadAnimation; // this doesn't do anything right now
    const proportional = this.#proportional;
    const grouped = this.#grouped;


    const nSeriesLookup = this.#nSeriesLookup;
    const nSeriesReverseLookup = this.#nSeriesReverseLookup;

    // Vertical / horizontal adjustment
    const vertical = this.#vertical;
    const x = vertical ? 'x' : 'y';
    const y = vertical ? 'y' : 'x';
    const h = vertical ? 'height' : 'width';
    const w = vertical ? 'width' : 'height';
    const verticalTextAnchor = vertical ? 'middle' : 'start';

    // Create subgroups for each bar series
    const first = this.#vertical ? 0 : 1;
    const last = this.#vertical ? 1 : 0;

    const lightFontColour = "white"
    const darkFontColour = "black";



    //colour checkers to determine font color for stacked barcharts
    //https://www.w3.org/TR/2008/REC-WCAG20-20081211/
    const contrastRatio = 4.5;

    let checkContrastToWhite = (hexColour) => {
      return contrastToWhite(hexColour) > contrastRatio;
    };

    let contrastToWhite = (hexColour) => {
      let whiteIlluminance = 1;
      let illuminance = calculateIlluminance(hexColour);
      return whiteIlluminance / illuminance;
    };

    let hex2Rgb = (hexColour) => {
      let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColour);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    //relative contrast coefficients, relative luminance section of above doc
    const rCC = 0.2126; //red
    const gCC = 0.7152; //green
    const bCC = 0.0722; //blue
    const gamma = 2.4;

    let calculateIlluminance = (hexColour) => {
      let rgbColour = hex2Rgb(hexColour);
      let r = rgbColour.r,
        g = rgbColour.g,
        b = rgbColour.b;
      let a = [r, g, b].map(function(v) {
        v /= 255;
        return (v <= 0.03928) ?
          v / 12.92 :
          Math.pow(((v + 0.055) / 1.055), gamma);
      });
      return a[0] * rCC + a[1] * gCC + a[2] * bCC;
    };

    //log of 0 does not exist, cannot have 0 on a log scale
    let lowestNValue = this.#grouped && this.#log ? this.#min : 0;

    let rectCount = 0;

    // for stacked bar graphs
    if (!this.#grouped) {
      // console.log('categories', this.#nSeries)
      // console.log('stack', this.#stackData)
      let barGroups = bars
        .selectAll('g')
        .data(this.#stackData)
        .join(
          (enter) => {
            let g = enter.append('g')
              .attr('class', 'bar-group')
              .attr('aria-label', d => {
                return `${d.key}`
              })
            let rect = g
              .selectAll('rect')
              .data(d => d)
              .join('rect')

            rect
              .attr(x, d => cScale(d.data[cSeries]))
              .attr(w, barWidth)
              .attr(y, d => {
                // console.log(nScale(lowestNValue))
                return nScale(lowestNValue)
              })
              .attr('opacity', 0)
              .attr('class', d => nSeriesLookup[d.key])
              .transition()
              .duration(this.#transitionDuration)
              .attr(y, d => nScale(d[last]))
              .attr(h, d => {
                // console.log(d)
                let height = nScale(d[first]) - nScale(d[last])
                return height == 0 ? 0.1 : height
              })
              .attr('opacity', 1)
              .attr('fill', (d, i) => {
                if (this.#nSeries.length > 1) {
                  return colourScale(d.key)
                }
                else {
                  return this.#colourSeries[rectCount++ % this.#colourSeries.length];
                }
              })

            rect
              .attr('aria-label', d => {
                return `${d.key}: ${this.#getLabel(d, proportional)}`
              })

            rect
              .on('mouseenter', tooltipEnter)
              .on('mouseleave', tooltipLeave)
              .on('mousemove', tooltipMove);

            // creates bar labels
            if (barLabels) {
              let text = g
                .selectAll('text')
                .data(d => d)
                .join('text')

              text
                .attr('class', d => {
                  return `bar-label ${nSeriesLookup[d.key]}-label`
                })
                .attr('fill', d => {
                  return checkContrastToWhite(colourScale(d.key)) ? lightFontColour : darkFontColour;
                })
                .attr("alignment-baseline", 'middle')
                .attr('text-anchor', 'middle')
                .on('mouseenter', tooltipEnter)
                .on('mouseleave', tooltipLeave)
                .on('mousemove', tooltipMove)
                .text(d => {
                  // console.log(d)
                  if (typeof d[last] == 'number' && d[1] - d[0] >= 0) {
                    // console.log(d)
                    // console.log(this.#getLabel(d, proportional))
                    return this.#getLabel(d, proportional);
                  }
                });
              text
                .attr('opacity', 0)
                .attr(x, d => {
                  // console.log(cScale(d.data[cSeries]))
                  return cScale(d.data[cSeries]) + barWidth / 2
                })
                .attr(y, d => nScale(lowestNValue))
                .transition()
                .duration(this.#transitionDuration)
                .attr(y, d => {
                  let avg = (d[1] + d[0]) / 2
                  return nScale(avg)
                })
                .attr('opacity', function(d) {
                  let dimensions = that.#calculateTextDimensions(that.#getLabel(d, proportional), that.#getFullFont(this))
                  return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d) ? 1 : 0;
                })
                .on('end', function(d) {
                  let selection = d3.select(this);
                  selection.attr('display', function(d) {
                    let dimensions = that.#calculateTextDimensions(that.#getLabel(d, proportional), that.#getFullFont(this))
                    return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d) ? 'block' : 'none';
                  })
                })

            }
          },
          (update) => {
            // console.log('updatRect', update.selectAll('rect'))
            update
              .attr('class', 'bar-group')
              .attr('aria-label', d => {
                return `${d.key}`
              })

            let updateRect = selection => {
              selection
                .attr('aria-label', d => {
                  return `${d.key}: ${this.#getLabel(d, proportional)}`
                })
                .attr(w, function(d) {
                  let value = d3.select(this).attr(w)
                  if (value === null)
                    return barWidth;
                  else
                    return value;
                })
                .attr('class', d => nSeriesLookup[d.key])
                .attr(x, function(d) {
                  let value = d3.select(this).attr(x)
                  if (value === null)
                    return cScale(d.data[cSeries]);
                  else
                    return value;
                })
                .attr(y, function(d) {
                  let value = d3.select(this).attr(y)
                  if (value === null)
                    return nScale(lowestNValue);
                  else
                    return value;
                })
                .on('mouseenter', tooltipEnter)
                .on('mouseleave', tooltipLeave)
                .on('mousemove', tooltipMove)
                .transition()
                .duration(this.#transitionDuration)
                .attr(y, d => nScale(d[last]))
                .attr(h, d => {
                  // console.log('height update', d)
                  let height = nScale(d[first]) - nScale(d[last])
                  return height == 0 ? 0.1 : height
                })
                .attr(x, d => cScale(d.data[cSeries]))
                .attr(w, barWidth)
                // .attr('opacity', 1)
                .attr('fill', (d, i) => {
                  if (this.#nSeries.length > 1) {
                    return colourScale(d.key)
                  }
                  else {
                    return this.#colourSeries[rectCount++ % this.#colourSeries.length];
                  }
                })
                .attr('opacity', 1)
            }

            let rect = update.selectAll('rect')
              .data(d => d)
              .join(
                (enter) => {
                  updateRect(enter.append('rect'))
                },
                (update) => {
                  updateRect(update)
                },
                (exit) => {
                  exit.transition().duration(this.#transitionDuration)
                    .attr('opacity', 0)
                    .attr(h, 0)
                    .attr(y, nScale(lowestNValue))
                    .remove()
                }
              )

            // // update bar labels
            if (barLabels) {

              let updateText = selection => {
                selection
                  .attr("alignment-baseline", 'middle')
                  .attr('text-anchor', 'middle')
                  //for new text that aren't in new groups, set default values before transition. Avoids transitioning from top left
                  .attr(x, function(d) {
                    let value = d3.select(this).attr(x)
                    if (value === null)
                      return cScale(d.data[cSeries]) + barWidth / 2;
                    else
                      return value;
                  })
                  .attr(y, function(d) {
                    let value = d3.select(this).attr(y)
                    if (value === null)
                      return nScale(lowestNValue);
                    else
                      return value;
                  })
                  .attr('class', d => {
                    return `bar-label ${nSeriesLookup[d.key]}-label`
                  })
                  .attr('display', 'block')
                  .transition()
                  .duration(this.#transitionDuration)
                  .attr('fill', d => {
                    return checkContrastToWhite(colourScale(d.key)) ? lightFontColour : darkFontColour;
                  })
                  .attr(x, d => {
                    return cScale(d.data[cSeries]) + barWidth / 2;
                  })
                  .attr(y, d => {
                    let avg = (d[1] + d[0]) / 2;
                    return nScale(avg);
                  })
                  .attr('opacity', function(d) {
                    let dimensions = that.#calculateTextDimensions(that.#getLabel(d, proportional), that.#getFullFont(this))
                    return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d) ? 1 : 0;
                  })
                  .tween("text", function(d) {
                    let selection = d3.select(this);
                    let oldVal = selection.text().replace('%', '');
                    let newVal = that.#getLabel(d, proportional).toString().replace('%', '');
                    // console.log(newVal)
                    // const i = d3.interpolate(+oldVal, newVal);
                    // return function(t) {
                    //   if (newVal % 1 == 0)
                    //     selection.text(Math.round(i(t)) + (proportional ? '%' : ''));
                    //   else
                    //     selection.text(that.#round(i(t)) + (proportional ? '%' : ''));
                    // };

                    if (!isNaN(oldVal) && !isNaN(newVal)) {
                      const i = d3.interpolate(+oldVal, +newVal);
                      return function(t) {
                        if (newVal % 1 == 0)
                          selection.text(Math.round(i(t)) + (proportional ? '%' : ''));
                        else
                          selection.text(that.#round(i(t)) + (proportional ? '%' : ''));
                      };
                    }
                    else {
                      selection
                        .attr('opacity', 0)
                        .text(that.#getLabel(d, proportional))
                      selection
                        .transition()
                        .duration(that.#transitionDuration)
                        .attr('opacity', 1)
                    }
                  })
                  .on('end', function(d) {
                    let selection = d3.select(this);
                    selection.attr('display', function(d) {
                      let dimensions = that.#calculateTextDimensions(that.#getLabel(d, proportional), that.#getFullFont(this))
                      return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d) ? 'block' : 'none';
                    })
                  })

                selection
                  .on('mouseenter', tooltipEnter)
                  .on('mouseleave', tooltipLeave)
                  .on('mousemove', tooltipMove)
              }

              let text = update
                .selectAll('text')
                .data(d => d)
                // .join('text')
                .join(
                  (enter) => {
                    updateText(enter.append('text'))
                  },
                  (update) => {
                    updateText(update)
                  },
                  (exit) => {
                    exit
                      .transition()
                      .duration(this.#transitionDuration)
                      .attr('opacity', 0)
                      .attr(y, nScale(lowestNValue))
                      .remove()
                  }
                )
            }
          },
          (exit) => {
            exit.selectAll('*')
              .transition()
              .duration(this.#transitionDuration)
              .attr('opacity', 0)
              .attr(h, 0)
              .attr(y, nScale(lowestNValue))
              .on('end', () => {
                exit.remove()
              })
          })
    }

    // for grouped bar graphs
    else {
      function numericalSeries(d) {
        let numericalSeries = [];
        Object.keys(d).forEach(k => {
          if (nSeries.includes(k))
            numericalSeries.push({ 'cat': d[cSeries], 'type': k, 'val': d[k], 'data': d });
        });
        return numericalSeries;
      }

      bars
        // Create groups and update loops for data changes
        .selectAll('g')
        .data(this.#data)
        .join(
          enter => {
            let g = enter.append('g').attr('class', 'bar-group')
              .attr('aria-label', d => {
                return d[cSeries]
              })

            let rect = g
              .selectAll('rect')
              .data(d => {
                return numericalSeries(d)
              })
              .join('rect')

            rect
              .attr('aria-label', d => {
                return `${d.type}: ${d.val}`
              })
              .attr('opacity', 1)
              .attr('fill', (d, i) => {
                if (this.#nSeries.length > 1) {
                  return colourScale(d.type)
                }
                else {
                  return this.#colourSeries[rectCount++ % this.#colourSeries.length];
                }
              })
              .attr('class', d => {
                return nSeriesLookup[d.type]
              })
              .attr(y, d => {
                return nScale(lowestNValue);
              })
              .attr(x, (d, i) => {
                return cSubScale(d.type) + cScale(d.cat)
              })
              .attr(w, barWidth)
              .transition()
              .duration(this.#transitionDuration)
              .attr(h, d => {
                let height = Math.abs(nScale(d.val) - nScale(lowestNValue))
                return height == 0 ? 0.1 : height
              })
              .attr(y, d => {
                const input = (typeof d.val !== 'number') ? 0 : d.val;
                return vertical ? nScale(input) : nScale(lowestNValue);
              })

            rect
              .on('mouseenter', tooltipEnter)
              .on('mouseleave', tooltipLeave)
              .on('mousemove', tooltipMove)

            // creates bar labels
            if (barLabels) {
              let text = g
                .selectAll('text')
                .data(d => numericalSeries(d))
                .join('text')

              text
                .attr('class', d => {
                  return `bar-label ${nSeriesLookup[d.type]}-label`
                })
                .attr('fill', darkFontColour)
                .attr("alignment-baseline", 'middle')
                .attr('text-anchor', verticalTextAnchor)
                .attr('opacity', 0)
                .attr(x, (d, i) => {
                  return cSubScale(d.type) + cScale(d.cat) + barWidth / 2
                })
                .attr(y, d => {
                  const input = (typeof d.val !== 'number') ? 0 : d.val;
                  return nScale(lowestNValue) + (vertical ? -10 : 5);
                })
                .on('mouseenter', tooltipEnter)
                .on('mouseleave', tooltipLeave)
                .on('mousemove', tooltipMove)

              // .text(d => (typeof d.val !== 'number') ? 'NA' : d.val);

              text
                .transition()
                .duration(this.#transitionDuration)
                .attr(y, d => {
                  const input = (typeof d.val !== 'number') ? 0 : d.val;
                  return nScale(input) + (vertical ? -10 : 5);
                })
                .attr('opacity', function(d) {
                  let dimensions = that.#calculateTextDimensions(d.val, that.#getFullFont(this))
                  return that.#labelFitsGroupedBar(dimensions.width, dimensions.height, d) ? 1 : 0;
                })
                .tween("text", function(d) {
                  let selection = d3.select(this);
                  let oldVal = selection.text();
                  let newVal = d.val;
                  // const i = d3.interpolate(+oldVal, newVal);
                  // return function(t) {
                  //   // selection.text(Math.round(i(t)));
                  //   if (that.#decimalType == 'fixed')
                  //     selection.text(d3.format(`.${that.#decimalPlaces}f`)(that.#round(i(t))))
                  //   else
                  //     selection.text(that.#round(i(t)));
                  // };

                  if (!isNaN(oldVal) && !isNaN(newVal)) {
                    const i = d3.interpolate(+oldVal, newVal);
                    return function(t) {
                      // selection.text(Math.round(i(t)));
                      if (that.#decimalType == 'fixed')
                        selection.text(d3.format(`.${that.#decimalPlaces}f`)(that.#round(i(t))))
                      else
                        selection.text(that.#round(i(t)));
                    };
                  }
                  else {
                    selection
                      // .attr('opacity', 0)
                      .text(that.#getLabel(d, proportional))
                    // selection
                    //   .transition()
                    //   .duration(that.#transitionDuration)
                    //   .attr('opacity', 1)
                  }
                })
            }
          },
          update => {
            update
              .attr('class', 'bar-group')
              .attr('aria-label', d => {
                return d[cSeries]
              })
            let updateRect = selection => {
              selection
                .attr('aria-label', d => {
                  return `${d.type}: ${d.val}`
                })
                .attr(w, function(d) {
                  let value = d3.select(this).attr(w)
                  if (value === null)
                    return barWidth;
                  else
                    return value;
                })
                .attr(x, function(d, i) {
                  let value = d3.select(this).attr(x)
                  if (value === null)
                    return cSubScale(d.type) + cScale(d.cat);
                  else
                    return value;
                })
                .attr(y, function(d) {
                  let value = d3.select(this).attr(y)
                  if (value === null)
                    return nScale(lowestNValue);
                  else
                    return value;
                })
                .on('mouseenter', tooltipEnter)
                .on('mouseleave', tooltipLeave)
                .on('mousemove', tooltipMove)
                .transition()
                .duration(this.#transitionDuration)
                .attr('opacity', 1)
                .attr('fill', (d, i) => {
                  if (this.#nSeries.length > 1) {
                    return colourScale(d.type)
                  }
                  else {
                    return this.#colourSeries[rectCount++ % this.#colourSeries.length];
                  }
                })
                .attr('class', d => nSeriesLookup[d.type])
                .attr(x, (d, i) => {
                  return cSubScale(d.type) + cScale(d.cat)
                })
                .attr(w, barWidth)
                .attr(h, d => {
                  if (isNaN(d.val)) {
                    return 0.1;
                  }
                  let height = Math.abs(nScale(d.val) - nScale(lowestNValue))
                  return height == 0 ? 0.1 : height
                })
                .attr(y, d => {

                  const input = (isNaN(d.val)) ? 0 : d.val;
                  return vertical ? nScale(input) : nScale(lowestNValue);
                })
            }

            let rect = update.selectAll('rect')
              .data(d => numericalSeries(d))
              .join(
                enter => {
                  updateRect(enter.append('rect'))
                },
                update => {
                  updateRect(update)
                },
                exit => {
                  exit.transition().duration(this.#transitionDuration)
                    .attr('opacity', 0)
                    .attr(h, 0)
                    .attr(y, nScale(lowestNValue))
                    .remove()
                }
              )

            if (barLabels) {
              let updateText = selection => {
                selection
                  .attr('class', d => {
                    return `bar-label ${nSeriesLookup[d.type]}-label`
                  })
                  .attr("alignment-baseline", 'middle')
                  .attr('text-anchor', verticalTextAnchor)
                  .attr(x, function(d, i) {
                    let value = d3.select(this).attr(x)
                    if (value === null)
                      return cSubScale(d.type) + cScale(d.cat) + barWidth / 2;
                    else
                      return value;
                  })
                  .attr(y, function(d) {
                    let value = d3.select(this).attr(y)
                    if (value === null)
                      return nScale(lowestNValue);
                    else
                      return value;
                  })
                  .on('mouseenter', tooltipEnter)
                  .on('mouseleave', tooltipLeave)
                  .on('mousemove', tooltipMove)
                // .text(d => (typeof d.val !== 'number') ? 'NA' : d.val);

                selection
                  .transition()
                  .duration(this.#transitionDuration)
                  .attr(y, d => {
                    const input = (isNaN(d.val)) ? 0 : d.val;
                    return nScale(input) + (vertical ? -10 : 5);
                  })
                  .attr(x, (d, i) => {
                    return cSubScale(d.type) + cScale(d.cat) + barWidth / 2;
                  })
                  .attr('fill', darkFontColour)
                  .attr('opacity', function(d) {
                    let dimensions = that.#calculateTextDimensions(d.val, that.#getFullFont(this))
                    return that.#labelFitsGroupedBar(dimensions.width, dimensions.height, d) ? 1 : 0;
                  })
                  // .tween("text", function(d) {
                  //   let selection = d3.select(this);
                  //   let oldVal = +selection.text().replace('%', '');
                  //   let newVal = d.val;
                  //   const i = d3.interpolate(+oldVal, newVal);
                  //   return function(t) {
                  //     if (that.#decimalType == 'fixed')
                  //       selection.text(d3.format(`.${that.#decimalPlaces}f`)(that.#round(i(t))))
                  //     else
                  //       selection.text(that.#round(i(t)));
                  //   };
                  // })
                  .tween("text", function(d) {
                    let selection = d3.select(this);
                    let oldVal = selection.text();
                    let newVal = d.val;
                    // const i = d3.interpolate(+oldVal, newVal);
                    // return function(t) {
                    //   // selection.text(Math.round(i(t)));
                    //   if (that.#decimalType == 'fixed')
                    //     selection.text(d3.format(`.${that.#decimalPlaces}f`)(that.#round(i(t))))
                    //   else
                    //     selection.text(that.#round(i(t)));
                    // };

                    if (!isNaN(oldVal) && !isNaN(newVal)) {
                      const i = d3.interpolate(+oldVal, newVal);
                      return function(t) {
                        // selection.text(Math.round(i(t)));
                        if (that.#decimalType == 'fixed')
                          selection.text(d3.format(`.${that.#decimalPlaces}f`)(that.#round(i(t))))
                        else
                          selection.text(that.#round(i(t)));
                      };
                    }
                    else {
                      selection
                        // .attr('opacity', 0)
                        .text(that.#getLabel(d, proportional))
                      // selection
                      //   .transition()
                      //   .duration(that.#transitionDuration)
                      //   .attr('opacity', 1)
                    }
                  })
              }

              let text = update.selectAll('text')
                .data(d => numericalSeries(d))
                .join(
                  enter => {
                    updateText(enter.append('text'))
                  },
                  update => {
                    updateText(update)
                  },
                  exit => {
                    exit
                      .transition()
                      .duration(this.#transitionDuration)
                      .attr('opacity', 0)
                      .attr(y, nScale(lowestNValue))
                      .remove()
                  }
                )
            }

            update
              .on('mouseenter', tooltipEnter)
              .on('mouseleave', tooltipLeave)
              .on('mousemove', tooltipMove);
          },
          exit => {
            exit.selectAll('*')
              .transition()
              .duration(this.#transitionDuration)
              .attr('opacity', 0)
              .attr(h, 0)
              .attr(y, nScale(lowestNValue))
              .on('end', () => {
                exit.remove()
              })
          }
        )
    }
  }
  #renderAxes() {
    // Create subgroup
    const axes = this.#container
      .append('g')
      .attr('class', 'axes');

    // Render vertical axis
    const v = this.#vertical ? 'n' : 'c';
    let vAxis = axes
      .append('g')
      .attr('class', v)
      .attr('transform', `translate(${this.#margins.l},0)`)
      .call(this.#axisGens[v]);

    if (v == 'c') {
      vAxis
        .selectAll('.tick text')
        .call(this.#wrap, this.#cAxisTitle ? this.#cAxisTitleSpacing - 10 : this.#margins.l) //replace 10 with fontsize of axis title/2, but would need to have the fontsize as a class attribute instead of css (or change load order of render title and renderAxes, then read the fontSize with getCssProperty)
        .call(this.#fitToConstraints, this.#cScale.bandwidth() + this.#cScale.padding(), this)
    }

    // Render horizontal axis
    const h = this.#vertical ? 'c' : 'n';
    const height = this.#vertical ?
      this.#height - this.#margins.b :
      this.#height - this.#margins.b;

    let hAxis = axes
      .append('g')
      .attr('class', h)
      .attr('transform', `translate(0, ${height})`)
      .call(this.#axisGens[h])

    if (h == 'c') {
      hAxis
        .selectAll('.tick text')
        .call(this.#wrap, this.#cScale.bandwidth() + this.#cScale.padding())
        .call(this.#fitToConstraints, this.#cAxisTitle ? this.#cAxisTitleSpacing : this.#margins.b, this)
    }


  }
  #updateAxes() {
    const that = this;
    const axes = this.#container.select(".axes")

    // update vertical axis
    const v = this.#vertical ? 'n' : 'c';

    let vText = []
    axes
      .select(`.${v}`)
      .selectAll('.tick text')
      .each(el => vText.push(el))

    // console.log(hText, this.#cScale.domain())
    if (v == 'n') {
      axes
        .select(`.${v}`)
        .transition().duration(this.#transitionDuration)
        .call(this.#axisGens[v]);
    }
    else if (this.#cScale.domain().join("") != vText.join("")) {
      let vAxis = axes
        .select(`.${v}`)
        .call(this.#axisGens[v])
      vAxis
        .selectAll(".tick text")
        .call(this.#wrap, this.#cAxisTitle ? this.#cAxisTitleSpacing - 10 : this.#margins.l)
        .call(this.#fitToConstraints, this.#cScale.bandwidth() + this.#cScale.padding(), this)

      vAxis
        .selectAll(".tick text")
        .style("opacity", 0)
        .transition().duration(this.#transitionDuration)
        .style("opacity", 1)
    }

    // update horizontal axis
    const h = this.#vertical ? 'c' : 'n';

    const height = this.#vertical ?
      this.#height - this.#margins.b :
      this.#height - this.#margins.b;

    let hText = []
    axes
      .select(`.${h}`)
      .selectAll('.tick text')
      .each(el => hText.push(el))

    // console.log(hText, this.#cScale.domain())
    if (h == 'n') {
      axes
        .select(`.${h}`)
        .transition().duration(this.#transitionDuration)
        .call(this.#axisGens[h]);
    }
    else if (this.#cScale.domain().join("") != hText.join("")) {
      let hAxis = axes
        .select(`.${h}`)
        .call(this.#axisGens[h])
      hAxis
        .selectAll(".tick text")
        .call(this.#wrap, this.#cScale.bandwidth() + this.#cScale.padding())
        .call(this.#fitToConstraints, this.#cAxisTitle ? this.#cAxisTitleSpacing : this.#margins.b, this)

      hAxis
        .selectAll(".tick text")
        .style("opacity", 0)
        .transition().duration(this.#transitionDuration)
        .style("opacity", 1)
    }
  }
  #renderTitles() {
    // Create subgroup 
    const titles = this.#container.select('.titles').empty() ?
      this.#container
      .append('g')
      .attr('class', 'titles') :
      this.#container.select('.titles');

    const graphTitle = titles.select('.graph-title')

    // Render chart title
    if (graphTitle.empty()) {
      //add title
      titles
        .append('text')
        .attr('class', 'graph-title')
        .attr('x', (this.#width - this.#margins.r) / 2)
        .attr('y', this.#margins.t / 2)
        .attr('dy', 0)
        .attr('opacity', 1)
        .attr('text-anchor', 'middle')
        .text(this.#graphTitle)
        .call(this.#wrap, this.#width)
    }
    else if (graphTitle.text() !== this.#graphTitle) {
      //transition existing title to new title
      graphTitle
        .attr('opacity', 0)
        .text(this.#graphTitle)
        .call(this.#wrap, this.#width)
      graphTitle
        .transition()
        .duration(this.#transitionDuration)
        .attr('opacity', 1)
      // .transition()
      // .duration(this.#transitionDuration / 2)
      // .attr('opacity', 0)
      // .on('end', () => {
      //   graphTitle.text(this.#graphTitle)

      //   graphTitle
      //     .transition()
      //     .duration(this.#transitionDuration / 2)
      //     .attr('opacity', 1)
      // })
    }


    const height = this.#height;
    const v = this.#vertical ? 'n' : 'c';
    const vTitle = this.#vertical ? this.#nAxisTitle : this.#cAxisTitle;
    const vSpacing = this.#vertical ? this.#nAxisTitleSpacing : this.#cAxisTitleSpacing;
    const vAxis = titles.select(`.${v}-axis-title`)

    // Render axis titles
    if (vAxis.empty()) {
      titles
        .append('text')
        .attr('class', v + '-axis-title')
        .attr('opacity', 1)
        .attr('x', (-height + this.#margins.t) / 2)
        .attr('y', () => {
          return this.#margins.l - vSpacing;
        })
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', v == 'c' ? "after-edge" : null)
        .text(vTitle);
    }
    else if (vAxis.text() !== vTitle) {

      vAxis
        .attr('opacity', 0)
        .text(vTitle)
      vAxis
        .transition()
        .duration(this.#transitionDuration)
        .attr('opacity', 1)
      // .transition()
      // .duration(this.#transitionDuration / 2)
      // .attr('opacity', 0)
      // .on('end', () => {
      //   vAxis.text(vTitle)
      //   vAxis
      //     .transition()
      //     .duration(this.#transitionDuration / 2)
      //     .attr('opacity', 1)
      // })
    }

    const h = this.#vertical ? 'c' : 'n';
    const hTitle = this.#vertical ? this.#cAxisTitle : this.#nAxisTitle;
    const hSpacing = this.#vertical ? this.#cAxisTitleSpacing : this.#nAxisTitleSpacing;
    const hAxis = titles.select(`.${h}-axis-title`)

    if (hAxis.empty()) {
      titles
        .append('text')
        .attr('class', h + '-axis-title')
        .attr('opacity', 1)
        .attr('x', (this.#width - this.#margins.r) / 2)
        .attr('y', height - this.#margins.b + hSpacing)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', h == 'c' ? "before-edge" : null)
        .text(hTitle);
    }
    else if (hAxis.text() !== hTitle) {
      hAxis
        .attr('opacity', 0)
        .text(hTitle)
      hAxis
        .transition()
        .duration(this.#transitionDuration)
        .attr('opacity', 1)
      // hAxis
      //   .transition()
      //   .duration(this.#transitionDuration / 2)
      //   .attr('opacity', 0)
      //   .on('end', () => {
      //     hAxis.text(hTitle)
      //     hAxis
      //       .transition()
      //       .duration(this.#transitionDuration / 2)
      //       .attr('opacity', 1)
      //   })
    }
  }
  #addInteraction() {
    const bars = this.#container
    // .select('.bars');

    const legend = this.#container
      .select('.legend');

    // Save private fields (can't access 'this' when rendering bars)
    const that = this;
    const cSeries = this.#cSeries;
    const nSeries = this.#nSeries;
    let nScale = this.#nScale;
    const cScale = this.#cScale;
    const cSubScale = this.#cSubScale;
    const barWidth = this.#barWidth;
    const graphWidth = this.#width;
    const barLabels = this.#barLabels;
    const proportional = this.#proportional;
    const height = this.#vertical ?
      this.#height - this.#margins.b :
      this.#height - this.#margins.b;

    let cKeys = this.#cKeys;

    const transitionDuration = this.#transitionDuration;

    const bottomAxisPosition = this.#height - this.#margins.b;
    const leftAxisPosition = 0 + this.#margins.l;

    // Vertical / horizontal adjustment
    const vertical = this.#vertical;
    const x = vertical ? 'x' : 'y';
    const y = vertical ? 'y' : 'x';
    const h = vertical ? 'height' : 'width';
    const w = vertical ? 'width' : 'height';

    // Create subgroups for each bar series
    const first = this.#vertical ? 0 : 1;
    const last = this.#vertical ? 1 : 0;


    const nSeriesLookup = this.#nSeriesLookup;
    const nSeriesReverseLookup = this.#nSeriesReverseLookup;

    let collapsed = false;
    let nSeriesBeforeCollapse = []

    let selectedValues = [];

    function fadeLegendCenter(classVal) {
      legend.selectAll(`circle.${classVal}`)
        .attr("fill-opacity", 1)
        .transition()
        .duration(transitionDuration)
        .attr("fill-opacity", 0.5);

      legend.selectAll(`text.${classVal}`)
        .attr("opacity", 1)
        .transition()
        .duration(transitionDuration)
        .attr("opacity", 0.5);

      legend.selectAll(`circle.${classVal}`)
        .classed('selected', false);
    }

    function reverseFadeCenter(classVal) {
      legend.selectAll(`circle.${classVal}`)
        .transition()
        .duration(transitionDuration)
        .attr("fill-opacity", 1);

      legend.selectAll(`text.${classVal}`)
        .transition()
        .duration(transitionDuration)
        .attr("opacity", 1);

      legend.selectAll(`circle.${classVal}`)
        .classed('selected', true);
    }

    let shiftSelectedGroupRect = (barGroups) => {
      let lowestNValue = this.#grouped && this.#log ? this.#min : 0;
      //expand the rest of the selected bars
      let selector = this.#selectedNSeries.map(el => `rect.${el}`).join(",");
      // console.log(selector)
      if (selector.length !== 0) {
        barGroups.selectAll(selector)
          .transition()
          .duration(this.#transitionDuration)
          .attr(w, cSubScale.bandwidth())
          .attr(x, (d, i) => {
            // console.log(d)
            return cSubScale(d.type) + cScale(d.cat)
          })
          .attr(y, function(d) {
            const input = (typeof d.val !== 'number') ? 0 : d.val;
            return vertical ? nScale(input) : nScale(lowestNValue);
          })
          .attr(h, d => {
            let height = Math.abs(nScale(d.val) - nScale(lowestNValue))
            return height == 0 ? 0.1 : height
          })
          .attr('opacity', 1)
      }
    }

    let shiftSelectedGroupLabels = () => {
      //for labels that stay
      let textSelector = this.#selectedNSeries.map(el => `text.${el}-label`).join(",");
      if (textSelector.length !== 0) {
        let text_labels_stay = bars.selectAll(textSelector)
        text_labels_stay
          .transition()
          .duration(this.#transitionDuration)
          .attr(x, (d, i) => {
            return cSubScale(d.type) + cScale(d.cat) + cSubScale.bandwidth() / 2
          })
          .attr(y, d => {
            const input = (typeof d.val !== 'number') ? 0 : d.val;
            return nScale(input) + (vertical ? -10 : 5);
          })
          .attr('opacity', function(d) {
            let dimensions = that.#calculateTextDimensions(d.val, that.#getFullFont(this))
            return that.#labelFitsGroupedBar(dimensions.width, dimensions.height, d) ? 1 : 0;
          })
      }
    }

    function calculateSubtractionValue(currIndex, removed, d) {
      if (!proportional) {
        //non-proportional: sum the values of the removed items below the current index
        let subValue = 0
        removed.map(el => {
          if (nSeries.indexOf(nSeriesReverseLookup[el.key]) < currIndex && el.group == d.data[cSeries]) {
            subValue += el.value;
          }
        })
        return subValue;
      }
      else {
        //proportional: sum all the removed values in a group
        let subValue = 0
        removed.map(el => {
          if (el.group == d.data[cSeries]) {
            subValue += el.value;
          }
        })
        return subValue;
      }

    }

    let createNewProportionalData = (data, nSeries) => {

      cKeys = this.#createCKeys(data); // data

      // Create stack first (data needed for yScale)
      let stackGen = this.#createStackGen(nSeries); // nSeries

      //if proportional, change the values as a percent value of the total
      let stackData = this.#createProportionalStackData(data, nSeries, stackGen); // data, nSeries, stackGen

      this.#proportionalStack = this.#rebaseStackData(stackData, cKeys)
      //convert the stack such that it's rebased on the dependent variables instead of the independent
      return this.#proportionalStack; //stackData, cKeys
    }

    let getRowInData = (proportionalStack, subSeries, i, countBy = subSeries) => {

      let numSelected = countBy.length;
      let remainder = (i) % numSelected
      let multiple = Math.floor((i) / numSelected)

      let row = proportionalStack[multiple][remainder]
      return row;
    }

    let calculateProportionalYShift = (currIndex, subSeries, proportionalStack, i, notSelected) => {
      // for proportional, need to know what the value below it is, and shift to where it will go
      let shiftToY = 0;

      //a value of 0 would just need to return 0, hence the initial value
      if (currIndex > 0) {
        let breakLoop = false;
        //keep looking until either a value is found, or the index becomes negative
        for (let k = 1; currIndex - k > -1 && !breakLoop; k++) {
          let valBelow = nSeries[currIndex - k]
          let subIndexBelow = subSeries.indexOf(valBelow)
          //if index exists, then a value exists below it
          if (subIndexBelow > -1) {
            let belowRow = getRowInData(proportionalStack, subSeries, Math.floor(i / notSelected.length) * (cKeys.length) + subIndexBelow, cKeys)
            shiftToY = belowRow[1]
            breakLoop = true;
          }
        }
      }

      return shiftToY;
    }

    let removeBars = (classVal) => {
      this.#selectedNSeries = this.#findSelectedValues()

      let subSeries = this.#selectedNSeries.map(el => {
        return nSeriesReverseLookup[el]
      })

      this.#cSubScale = this.#cSubScale.domain(subSeries)
      //is grouped
      if (this.#grouped) {
        let barGroups = bars.selectAll(".bar-group");
        //for selected legend class, remove those bars
        barGroups.selectAll(`rect.${classVal}`)
          .transition()
          .duration(this.#transitionDuration)
          .attr('opacity', 0)
          .attr(y, function(d) {
            return vertical ? bottomAxisPosition : leftAxisPosition
          })
          .attr(h, 0.1)

        // shift bar labels
        if (barLabels) {
          let text_labels_out = bars.selectAll(`text.${classVal}-label`)

          //for labels that disappear
          text_labels_out
            .transition()
            .duration(this.#transitionDuration)
            .attr(y, d => {
              return vertical ? bottomAxisPosition : leftAxisPosition
            })
            .attr('opacity', 0)

          //for labels of still selected values
          shiftSelectedGroupLabels()
        }

        //move the rest of the selected bars to their respective locations 
        shiftSelectedGroupRect(barGroups)
      }
      //is stacked
      else {
        let proportionalStack = proportional ? createNewProportionalData(this.#data, subSeries) : null;

        let removed = []
        let notSelected = []
        this.#nSeries.map((el, i) => {
          let translatedEl = nSeriesLookup[el]
          if (!this.#selectedNSeries.includes(translatedEl)) {
            notSelected.push(translatedEl)
          }
        })
        let notSelectorRect = notSelected.map(el => `rect.${el}`).join(",");
        let rectGroups = bars.selectAll(notSelectorRect)
        //for bars that need to be removed
        rectGroups
          .transition()
          .duration(this.#transitionDuration)
          .attr(h, 0.1)
          .attr('opacity', 0)
          .attr(y, function(d, i) {
            let currentClass = d3.select(this).attr('class')
            let currIndex = nSeries.indexOf(nSeriesReverseLookup[currentClass])

            //for each removed 
            removed.push({
              "key": currentClass,
              "group": d.data[cSeries],
              "value": Math.abs(d[last] - d[first])
            })

            let subValue = calculateSubtractionValue(currIndex, removed, d)
            if (!proportional)
              return nScale(d[vertical ? first : last] - subValue);
            else {


              // return nScale((d[last] + d[first]) / 2)
              let shiftToY = calculateProportionalYShift(currIndex, subSeries, proportionalStack, i, notSelected)
              return nScale(shiftToY)
            }

          })
        if (barLabels) {
          let notSelectorText = notSelected.map(el => `text.${el}-label`).join(",");
          let textGroups = bars.selectAll(notSelectorText)

          //for text that needs to be removed
          textGroups
            .transition()
            .duration(this.#transitionDuration)
            .attr('opacity', 0)
            .attr(y, function(d, i) {
              let currentClass = d3.select(this).attr('class').split(" ")[1].replace("-label", "")
              let currIndex = nSeries.indexOf(nSeriesReverseLookup[currentClass])

              let subValue = calculateSubtractionValue(currIndex, removed, d)
              if (!proportional)
                return nScale(d[vertical ? first : last] - subValue);
              else {
                // return nScale((d[last] + d[first]) / 2)
                let shiftToY = calculateProportionalYShift(currIndex, subSeries, proportionalStack, i, notSelected)
                return nScale(shiftToY)
              }
            })
            .on('end', function(d, i) {
              let selection = d3.select(this);
              selection.attr('display', 'none')
            })
        }

        //for bars not removed but that need to slide down
        let selectorRect = this.#selectedNSeries.map(el => `rect.${el}`).join(",");

        if (selectorRect.length !== 0) {
          bars.selectAll(selectorRect)
            .transition()
            .duration(this.#transitionDuration)
            .attr(y, function(d, i) {
              // console.log(d)
              if (!proportional) {
                let currentClass = d3.select(this).attr('class')
                let currIndex = nSeries.indexOf(nSeriesReverseLookup[currentClass])

                let subValue = calculateSubtractionValue(currIndex, removed, d)
                return nScale(d[last] - subValue);
              }
              else {
                let row = getRowInData(proportionalStack, subSeries, i)
                return nScale(row[last]);
              }

            })
            .attr('opacity', 1)
            .attr(h, (d, i) => {
              if (!proportional) {
                let height = nScale(d[first]) - nScale(d[last]);
                return height == 0 ? 0.1 : height
              }
              else {
                let row = getRowInData(proportionalStack, subSeries, i)
                let height = nScale(row[first]) - nScale(row[last]);
                return height == 0 ? 0.1 : height;
              }
            })


          if (barLabels) {
            let selectorText = this.#selectedNSeries.map(el => `text.${el}-label`).join(",");
            //for text that needs to slide down
            bars.selectAll(selectorText)
              .attr('display', 'block')
              .transition()
              .duration(this.#transitionDuration)
              .attr(y, function(d, i) {
                if (!proportional) {
                  let currentClass = d3.select(this).attr('class').split(" ")[1].replace("-label", "")
                  let currIndex = nSeries.indexOf(nSeriesReverseLookup[currentClass])
                  let subValue = calculateSubtractionValue(currIndex, removed, d)
                  return nScale(d[vertical ? last : first] - subValue - Math.abs(d[last] - d[first]) / 2);
                }
                else {
                  let row = getRowInData(proportionalStack, subSeries, i)
                  return nScale(row[vertical ? last : first] - Math.abs(row[last] - row[first]) / 2);
                }

              })
              .attr('opacity', function(d, i) {
                d = proportional ? getRowInData(proportionalStack, subSeries, i) : d
                let dimensions = that.#calculateTextDimensions(that.#getLabel(d, proportional), that.#getFullFont(this))
                return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d) ? 1 : 0;
              })
              .tween("text", function(d, i) {
                if (proportional) {
                  let row = getRowInData(proportionalStack, subSeries, i)
                  let selection = d3.select(this);
                  let oldVal = +selection.text().replace('%', '');
                  let newVal = row[1] - row[0]
                  const interpolate = d3.interpolate(+oldVal, newVal);
                  return function(t) {
                    selection.text(Math.round(interpolate(t)) + (proportional ? '%' : ''));
                  };
                }
              })
              .on('end', function(d, i) {
                let selection = d3.select(this);
                selection.attr('display', function(d) {
                  d = proportional ? getRowInData(proportionalStack, subSeries, i) : d
                  let dimensions = that.#calculateTextDimensions(that.#getLabel(d, proportional), that.#getFullFont(this))
                  return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d) ? 'block' : 'none';
                })
              })
          }
        }
      }
    }

    let addBars = (classVal) => {
      this.#selectedNSeries = this.#findSelectedValues()
      let subSeries = this.#selectedNSeries.map(el => {
        return nSeriesReverseLookup[el]
      })
      this.#cSubScale = this.#cSubScale.domain(subSeries)
      if (this.#grouped) {
        //grouped
        let barGroups = bars.selectAll(".bar-group");
        //shift bars
        shiftSelectedGroupRect(barGroups)
        // shift bar labels
        if (barLabels) {
          shiftSelectedGroupLabels()
        }
      }
      else {
        //stacked
        let removed = []
        let proportionalStack = proportional ? createNewProportionalData(this.#data, subSeries) : null;
        // console.log(proportionalStack)

        let notSelected = []
        this.#nSeries.map((el, i) => {
          let translatedEl = nSeriesLookup[el]
          if (!this.#selectedNSeries.includes(translatedEl)) {
            notSelected.push(translatedEl)
          }
        })
        // console.log(this.#selectedNSeries)
        if (notSelected.length != 0) {
          let notSelector = notSelected.map(el => `rect.${el}`).join(",");
          let rectGroups = bars.selectAll(notSelector)
          rectGroups.each(function(d, i) {
            let currentClass = d3.select(this).attr('class')

            removed.push({
              "key": currentClass,
              "group": d.data[cSeries],
              "value": Math.abs(d[last] - d[first])
            })
          })
        }


        let selectorRect = this.#selectedNSeries.map(el => `rect.${el}`).join(",");
        bars.selectAll(selectorRect)
          .transition()
          .duration(this.#transitionDuration)
          .attr(y, function(d, i) {
            if (!proportional) {
              let currentClass = d3.select(this).attr('class')
              let currIndex = nSeries.indexOf(nSeriesReverseLookup[currentClass])

              let subValue = calculateSubtractionValue(currIndex, removed, d)
              return nScale(d[last] - subValue);
            }
            else {
              let row = getRowInData(proportionalStack, subSeries, i)
              return nScale(row[last]);
            }
          })
          .attr('opacity', 1)
          .attr(h, (d, i) => {
            if (!proportional) {
              let height = nScale(d[first]) - nScale(d[last]);
              return height == 0 ? 0.1 : height
            }
            else {
              let row = getRowInData(proportionalStack, subSeries, i)
              let height = nScale(row[first]) - nScale(row[last]);
              return height == 0 ? 0.1 : height;
            }
          })

        if (barLabels) {
          let selectorText = this.#selectedNSeries.map(el => `text.${el}-label`).join(",");
          bars.selectAll(selectorText)
            .attr('display', 'block')
            .transition()
            .duration(this.#transitionDuration)
            .attr(y, function(d, i) {
              if (!proportional) {
                let currentClass = d3.select(this).attr('class').split(" ")[1].replace("-label", "")
                let currIndex = nSeries.indexOf(nSeriesReverseLookup[currentClass])
                let subValue = calculateSubtractionValue(currIndex, removed, d)
                return nScale(d[vertical ? last : first] - subValue - Math.abs(d[last] - d[first]) / 2);
              }
              else {
                let row = getRowInData(proportionalStack, subSeries, i)
                return nScale(row[vertical ? last : first] - Math.abs(row[last] - row[first]) / 2);
              }
            })
            .attr('opacity', function(d, i) {
              d = proportional ? getRowInData(proportionalStack, subSeries, i) : d
              let dimensions = that.#calculateTextDimensions(that.#getLabel(d, proportional), that.#getFullFont(this))
              return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d) ? 1 : 0;
            })
            .tween("text", function(d, i) {
              // return d[1] - d[0] + (isProportionalLabel ? '%' : 0);
              if (proportional) {
                let row = getRowInData(proportionalStack, subSeries, i)
                let selection = d3.select(this);
                let oldVal = +selection.text().replace('%', '');
                let newVal = row[1] - row[0]
                const interpolate = d3.interpolate(+oldVal, newVal);
                return function(t) {
                  selection.text(Math.round(interpolate(t)) + (proportional ? '%' : ''));
                };
              }
            })
            .on('end', function(d, i) {
              let selection = d3.select(this);
              selection.attr('display', function(d) {
                d = proportional ? getRowInData(proportionalStack, subSeries, i) : d
                let dimensions = that.#calculateTextDimensions(that.#getLabel(d, proportional), that.#getFullFont(this))
                return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d) ? 'block' : 'none';
              })
            })
        }
      }
    }

    let updateNAxis = () => {
      //reinitialize all the nAxis variables to accomodate the removed bars, and update it
      this.initNScale(this.#log);

      let nAxisOptions = {};
      let cAxisOptions = {};
      if (this.#gridlines) {
        const gridHeight = this.#height - this.#margins.b - this.#margins.t;
        const gridWidth = this.#width - this.#margins.l * 2 - this.#margins.r;
        const gridlineLength = this.#vertical ? -gridWidth : -gridHeight;

        nAxisOptions["tickSizeInner"] = gridlineLength
        nAxisOptions["tickPadding"] = 10
      }
      if (this.#proportional && !this.#grouped) {
        nAxisOptions["tickFormat"] = d => d + '%';
      }

      this.initAxes(cAxisOptions, nAxisOptions);
      this.#updateAxes();

      //update local reference to the nScale
      nScale = this.#nScale;
    }

    let barClicked = (clickedClass) => {
      let circles = legend.selectAll('circle')

      if (!collapsed) {
        nSeriesBeforeCollapse = this.#findSelectedValues()
        circles.each(function(d) {
          let circle = d3.select(this)
          let classVal = circle.attr("class").split(" ")[0]

          if (circle.classed("selected") && classVal != clickedClass) {
            fadeLegendCenter(classVal)
            updateNAxis()
            removeBars(classVal)
          }
        })
        collapsed = true;
      }
      else {
        nSeriesBeforeCollapse.map(el => {
          reverseFadeCenter(el)
        })
        updateNAxis()
        addBars()
        collapsed = false;
      }
    }

    //for all bar-group rectangles (bars), react on click
    let barGroups = bars.selectAll('.bar-group')

    barGroups.selectAll("rect")
      .on('click', function(e, d) {
        let clicked = d3.select(this)
        let clickedClass = clicked.attr("class");

        barClicked(clickedClass)

        if (that.#callbackClick) {
          that.#callbackClick(d)
        }
      })
      .on('mouseover', (e, d) => {
        if (this.#callbackHover) {
          this.#callbackHover(d)
        }
      })


    //legend interaction
    legend.selectAll('circle')
      .on('click', (e, d) => {
        let last = false;
        selectedValues = this.#findSelectedValues();
        if (selectedValues.length <= 1) {
          last = true;
        }

        collapsed = false;
        let clicked = d3.select(e.target)
        let classVal = clicked.attr("class").split(" ")[0]

        if (clicked.classed("selected")) {
          if (last) {
            nSeries.filter(el => !selectedValues.includes(nSeriesLookup[el])).map(el => {
              reverseFadeCenter(nSeriesLookup[el])
              updateNAxis()
              addBars(nSeriesLookup[el])
            })
          }
          else {
            fadeLegendCenter(classVal)
            updateNAxis()
            removeBars(classVal)
          }
        }
        else {
          reverseFadeCenter(classVal)
          updateNAxis()
          addBars(classVal)
        }
      });
    legend.selectAll('text')
      .on('click', (e, d) => {
        let last = false;
        selectedValues = this.#findSelectedValues();
        if (selectedValues.length <= 1) {
          last = true;
        }

        collapsed = false;
        let clickedClass = d3.select(e.target).attr("class")
        let attachedCircle = legend.selectAll(`circle.${clickedClass}`)

        if (attachedCircle.classed("selected")) {
          if (last) {
            nSeries.filter(el => !selectedValues.includes(nSeriesLookup[el])).map(el => {
              reverseFadeCenter(nSeriesLookup[el])
              updateNAxis()
              addBars(nSeriesLookup[el])
            })
          }
          else {
            fadeLegendCenter(clickedClass)
            updateNAxis()
            removeBars(clickedClass)
          }
        }
        else {
          reverseFadeCenter(clickedClass)
          updateNAxis()
          addBars(clickedClass)
        }
      });
  }
  #renderLegend() {
    const legend = this.#container.select("g.legend").empty() ? this.#container.append('g').attr('class', 'legend') : this.#container.select("g.legend")

    // Save private fields (can't access 'this' when rendering items)
    const r = this.#legendRadius;
    const textOffset = this.#legendTextOffset;
    const circleSpacing = this.#legendCircleSpacing;
    const spaceFromGraph = this.#legendSpacingFromGraph;
    const heightFromTop = this.#margins.t

    const colourScale = this.#colourScale;

    const nSeriesLookup = this.#nSeriesLookup;

    legend.attr('display', this.#displayLegend ? "block" : "none")
    // Render legend
    legend
      .selectAll('circle')
      .data(this.#nSeries)
      .join(
        (enter) => {
          let circle = enter.append('circle')
            .attr('r', r)
            .attr('cx', this.#width - this.#margins.l - this.#margins.r + spaceFromGraph)
            .attr('cy', (d, i) => heightFromTop + circleSpacing * i)
            .attr('class', d => nSeriesLookup[d])
            .attr('opacity', 0)
            .attr('fill-opacity', 0)
            .attr('fill', function(d) {
              return colourScale(d)
            })
            .classed('selected', true)
            .transition()
            .duration(this.#transitionDuration)
            .attr('opacity', 1)
            .attr('fill-opacity', 1)

          if (this.#interactive) {
            circle.attr('cursor', 'pointer')
          }

        },
        (update) => {
          let circle = update
            .attr('class', d => nSeriesLookup[d])
            .classed('selected', true)
            .transition().duration(this.#transitionDuration)
            .attr('opacity', 1)
            .attr('fill-opacity', 1)
            .attr('fill', function(d) {
              return colourScale(d)
            })
          if (this.#interactive) {
            circle.attr('cursor', 'pointer')
          }
        },
        (exit) => {
          exit.transition().duration(this.#transitionDuration)
            .attr('opacity', 0)
            .remove()
        }
      )


    legend
      .selectAll('text')
      .data(this.#nSeries)
      .join(
        (enter) => {
          let text = enter.append('text')
            .attr('class', d => nSeriesLookup[d])
            .attr('alignment-baseline', 'middle')
            .attr('x', this.#width - this.#margins.l - this.#margins.r + spaceFromGraph + textOffset)
            .attr('y', (d, i) => heightFromTop + circleSpacing * i)
            .attr('opacity', 0)
            .transition()
            .duration(this.#transitionDuration)
            .attr('opacity', 1)
          if (this.#interactive) {
            text.attr('cursor', 'pointer')
          }
          text.text(d => d)
        },
        (update) => {
          update.attr('class', function(d) {
            return nSeriesLookup[d];
          })
          update
            .attr('opacity', function(d) {
              let selection = d3.select(this)
              if (selection.text() == d) {
                return selection.attr('opacity')
              }
              return 0
            })
            .text(d => d)
          update
            .transition()
            .duration(this.#transitionDuration)
            .attr('opacity', 1)
          // update
          //   .transition()
          //   .duration(this.#transitionDuration / 2)
          //   .attr('opacity', 0).on('end', () => {
          //     update.text(d => d)
          //     update.transition().duration(this.#transitionDuration / 2).attr('opacity', 1)
          //   })

        },
        (exit) => {
          exit.transition().duration(this.#transitionDuration)
            .attr('opacity', 0)
            .remove()
        }

      )
  }
  #findSelectedValues() {
    let selectedValues = [];
    this.#container.select('.legend').selectAll(`circle.selected`).each(function(d) {
      let clicked = d3.select(this);
      if (d3.select(this).classed("selected")) {
        selectedValues.push(clicked.attr("class").split(" ")[0]);
      }
    })
    return selectedValues;
  }
  #setTabbing() {
    const container = this.#container;
    const bars = this.#container.select(".bars");

    container
      .on('keydown', (e) => {
        const isContainer = e.target.id == container.attr('id');
        //find which legend values are toggled on or off
        let selectedValues = this.#findSelectedValues();
        // console.log(e)

        if (e.key == 'Enter') {
          //begin inner tabbing between regions
          if (isContainer && selectedValues.length != 1) {
            let children = bars.selectAll('g')
            if (!children.empty()) {
              children
                .attr('tabindex', 0);
              children.node().focus(); //first child
            }
          }
          else if (isContainer && selectedValues.length == 1) {
            let rects = bars.selectAll('rect').filter(d => selectedValues.includes(this.#nSeriesLookup[this.#grouped ? d.type : d.key]))
            rects.attr('tabindex', 0)
            rects.node().focus();
          }
          else if (d3.select(e.target).attr('class') == 'bar-group') {
            //set all selectable rectangles tabindex
            let rects = d3.select(e.target).selectAll('rect')
              .filter(d => selectedValues.includes(this.#nSeriesLookup[this.#grouped ? d.type : d.key]))
            rects.attr('tabindex', 0)
            rects.node().focus();
          }
          else {
            // like you clicked a rect
            d3.select(e.target).dispatch('click')
            //refind the selected values since they changed on click
            selectedValues = this.#findSelectedValues();

            //identify selectable and unselectable rectangles
            let barGroups = bars.selectAll('g');
            let rects = barGroups.selectAll('rect')
              .filter(d => selectedValues.includes(this.#nSeriesLookup[this.#grouped ? d.type : d.key]))

            let notSelectedRects = barGroups.selectAll('rect')
              .filter(d => !selectedValues.includes(this.#nSeriesLookup[this.#grouped ? d.type : d.key]))

            //set all tabindexes of selectable and unselectable rectangles
            rects.attr('tabindex', 0)
            notSelectedRects.attr('tabindex', -1)
            selectedValues.length == 1 ? barGroups.attr('tabindex', -1) : barGroups.attr('tabindex', 0)

          }

        }
        //get out of inner indexes, reset to svg
        else if (e.key == 'Escape' && !isContainer) {
          bars.selectAll('g').attr('tabindex', -1);
          container.node().focus();
        }

        //check where in dom. If leaving graph, hide indexes from order.
        else if (e.key == "Tab") {
          // console.log(e)
          let barGroups = bars.selectAll('g');
          let rects = bars.selectAll('rect');

          let barArr = Array.from(barGroups._groups[0])
          let rectArr = Array.from(rects._groups[0])

          let barIndex = barArr.indexOf(e.target)
          let rectIndex = rectArr.indexOf(e.target)


          if (barIndex != -1) {
            rects.attr('tabindex', -1)
            if (!e.shiftKey && barIndex == barArr.length - 1) {
              barGroups.attr('tabindex', -1)
            }
            else if (e.shiftKey && barIndex == 0) {
              barGroups.attr('tabindex', -1)
            }
          }
          else if (!e.shiftKey && rectIndex != -1 && rectIndex == rectArr.length - 1) {
            rects.attr('tabindex', -1)
            barGroups.attr('tabindex', -1)
          }
        }
      })
      // //sets indexing for clicked item before the 'onclick event' of a bar
      .on('mousedown', (e) => {
        let selectedValues = this.#findSelectedValues();
        // console.log('mousedown', selectedValues)
        let barGroups = bars.selectAll('g');
        let rects = bars.selectAll('rect');

        let barArr = Array.from(barGroups._groups[0])
        let rectArr = Array.from(rects._groups[0])
        let jointGroups = barArr.concat(rectArr)

        //check if any of the outlined groups contain the target. focus it if it is
        if (jointGroups.includes(e.target)) {
          //check which specific group it belongs to and set the indexing accordingly for that specific entry
          if (rectArr.includes(e.target)) {
            d3.select(e.target).attr('tabindex', 0)
            barGroups.attr('tabindex', 0)
          }
          else if (barArr.includes(e.target)) {
            // rects.attr('tabindex', -1)
            barGroups.attr('tabindex', 0)
          }
        }
      })
      //sets indexing for other rect after the 'onclick event' of a bar
      .on('click', (e) => {
        //find which legend values are toggled on or off
        let selectedValues = this.#findSelectedValues();

        //set all selectable rectangles tabindex
        // let rects = d3.select(e.target.parentNode).selectAll('rect')
        let rects = bars.selectAll('rect')
          .filter(d => {
            return selectedValues.includes(this.#nSeriesLookup[this.#grouped ? d.type : d.key])
          })

        // console.log('rects', rects)

        let barGroups = bars.selectAll('g');

        let barArr = Array.from(barGroups._groups[0])
        let rectArr = Array.from(rects._groups[0])
        let jointGroups = barArr.concat(rectArr)

        //check if any of the outlined groups contain the target. focus it if it is
        if (jointGroups.includes(e.target)) {
          //check which specific group it belongs to and set the indexing accordingly
          if (rectArr.includes(e.target)) {
            bars.selectAll('rect').attr('tabindex', -1)
            rects.attr('tabindex', 0)
            selectedValues.length == 1 ? barGroups.attr('tabindex', -1) : barGroups.attr('tabindex', 0)
            e.target.focus()
          }
          else if (barArr.includes(e.target)) {
            barGroups.attr('tabindex', 0)
            e.target.focus()
          }

        }
        else {
          // console.log('target not in joint')
        }
      })
      .on('focusout', function(e) {
        // console.log('focusout', e)
        let barGroups = bars.selectAll('g');
        let rects = bars.selectAll('rect');

        let jointGroups = Array.from(barGroups._groups[0]) //bar groups
          .concat(Array.from(rects._groups[0])) //rect

        if (!jointGroups.includes(e.relatedTarget)) {
          rects.attr('tabindex', -1)
          barGroups.attr('tabindex', -1)
        }
      })
  }
  #renderTooltips() {
    /*
    This function adds a tooltip box to the graph's wrapper
    and returns event handlers needed to control it.
    
    Parameters
    ---------------------
    undefined
    
    Returns
    ---------------------
    array
    - An array of three functions that handle the following events:
      onMouseEnter, onMouseLeave, and onMouseMove
    - These event handlers are meant to be added to the graph's bars.
    */

    // Grab field. Won't be able to access this keyword later
    const tooltipSeries = this.#tooltipSeries ?
      this.#tooltipSeries : [this.#cSeries, ...this.#nSeries];

    const proportional = this.#proportional;

    // Create tooltip element
    const tooltip = this.#wrapper.select(".tooltip").empty() ?
      this.#wrapper
      .append('div')
      .attr('class', 'tooltip')
      .attr('opacity', 0) :
      this.#wrapper.select(".tooltip")

    const colourScale = this.#colourScale;
    const nSeries = this.#nSeries;
    const cSeries = this.#cSeries;

    const nSeriesLookup = this.#nSeriesLookup;
    const nSeriesReverseLookup = this.#nSeriesReverseLookup;
    let cKeys = this.#cKeys;

    let findRow = (data, cKey, nKey) => {
      let row = data.find(el => el.key == cKey)
      return row.find(el => el.key == nKey);
    }

    // Create event handlers
    let onEnter = (e, d) => {
      // console.log(e,d)
      if (!Object.keys(d).includes('data')) d.data = d;

      const selectedNSeries = this.#findSelectedValues();
      const subSeries = selectedNSeries.map(el => nSeriesReverseLookup[el])
      const proportionalStack = this.#proportionalStack;
      const stackData = this.#stackData;

      // Get series
      let html = '';
      if (this.#specificTooltip) {
        html += `<span>${cSeries}: ${d.data[cSeries]}</span><br/>`;
        let spanAttr = `style="border-left:5px solid ${colourScale(d.key)}; padding-left:3px"`
        let value = d.data[d.key];
        if (proportional) {
          let row = findRow(proportionalStack ?? stackData, d.data[cSeries], d.key)
          value = row[1] - row[0] + '%'
        }
        html += `<div ${spanAttr}>${d.key}:${value} </div>`;

      }
      else {
        for (let s of tooltipSeries) {
          //if value is the independant variable (display it)
          if (cSeries == s) {
            html += `<span>` + s.charAt(0).toUpperCase() + s.slice(1);
            let value = d.data[s];
            html += ': ' + (value);
            html += '</span><br /> ';
          }
          //else if value is selected dependant variable (display it)
          else if (selectedNSeries.includes(nSeriesLookup[s])) {
            let spanAttr = `style="border-left:5px solid ${colourScale(s)}; padding-left:3px"`
            html += `<div ${spanAttr}>` + s.charAt(0).toUpperCase() + s.slice(1);
            let value = d.data[s];
            if (proportional) {
              let row = findRow(proportionalStack ?? stackData, d.data[cSeries], s)
              value = row[1] - row[0] + '%'
            }
            html += ': ' + (value);
            html += '</div><br /> ';
          }
          //else if value is also not a general dependent variable (display error/NA)
          else if (!nSeries.includes(s)) {
            html += '<span>N/A</span><br />'
          }


        }
      }

      tooltip
        .html(html)
        .style('opacity', 1)
        .style("display", "block")
    }

    function onLeave(e, d) {
      tooltip
        .style('opacity', 0)
        .style("display", "none")
    }

    function onMove(e, d) {
      tooltip
        .style("transform", `translateX(25px)`)
        .style("left", `${(e.clientX)}px`)
        .style("top", `${(e.clientY)}px`)
    }


    return [onEnter, onLeave, onMove];
  }
  #addTable() {
    let data = this.#data;
    /* 
      Adds a table to the #table property. Contains the standard classes typically used on infobase products.
      
      Note: uses #table, #tableSummary, #tableDetails, #data, #cSeries, #nSeries
    */

    const tableExists = !this.#table.select('details').empty();

    let tableDetails;

    if (tableExists) {
      this.#table.select('details').selectAll("*").remove();
      tableDetails = this.#table.select('details');
    }
    else {
      tableDetails = this.#table.append('details');
    }

    // let tableID = this.#table.attr('id') + "-table";


    tableDetails.append("summary").text(this.#tableSummary)
    const tableContainer = tableDetails.append("div").attr("class", "table-responsive")
    const table = tableContainer.append("table")
      // .attr('id', tableID)
      .attr("class", "wb-table table table-bordered table-striped table-hover")

    if (this.#tableCaption)
      table.append('caption').text(this.#tableCaption)
    const tr = table.append('thead').append('tr').attr('class', 'bg-primary')
    let tableArr = []
    tableArr.push(this.#cSeries)
    tableArr = tableArr.concat(this.#nSeries)

    tableArr.map(el => {
      tr.append('th')
        // .style("vertical-align", "top").attr('scope', 'col')
        .text(() => {
          return this.#tableHeaderFunction ? this.#tableHeaderFunction(el) : el
        })
    })

    const tbody = table.append("tbody")

    this.#data.map(row => {
      let tr = tbody.append("tr")

      tableArr.map(el => {
        tr.append('td').text(row[el])
      })
    })

    let language = d3.select('html').attr('lang');
  	if (language == 'en'){
  		$(table.node()).DataTable();
  	}else{		
				$(table.node()).DataTable({
					"language": {
						"sProcessing":     "Traitement en cours...",
						"sSearch":         "Rechercher&nbsp;:",
						"sLengthMenu":     "Afficher _MENU_ &eacute;l&eacute;ments",
						"sInfo":           "Affichage de l'&eacute;lement _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
						"sInfoEmpty":      "Affichage de l'&eacute;lement 0 &agrave; 0 sur 0 &eacute;l&eacute;ments",
						"sInfoFiltered":   "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
						"sInfoPostFix":    "",
						"sLoadingRecords": "Chargement en cours...",
						"sZeroRecords":    "Aucun &eacute;l&eacute;ment &agrave; afficher",
						"sEmptyTable":     "Aucune donn&eacute;e disponible dans le tableau",
						"oPaginate": {
							"sFirst":      "Premier",
							"sPrevious":   "Pr&eacute;c&eacute;dent",
							"sNext":       "Suivant",
							"sLast":       "Dernier"
						},
						"oAria": {
							"sSortAscending":  ": activer pour trier la colonne par ordre croissant",
							"sSortDescending": ": activer pour trier la colonne par ordre d&eacute;croissant"
						}
					},
				});
				table.on('click', 'th', function() {
					let tableID = table.attr('id');
					$("#" + table.attr('id') + " th").addClass("sorting")
					//$(this).removeClass("sorting")
				});			
		}
  }
  #dataMinMax() {
    /* gets min and max values in selected dataset */

    let min, max;

    const nSeriesReverseLookup = this.#nSeriesReverseLookup;
    let selectedKeys;

    if (this.#updateCalled) {
      selectedKeys = this.#nSeries;
    }
    else {
      selectedKeys = this.#findSelectedValues().map(el => nSeriesReverseLookup[el])
      selectedKeys = selectedKeys.length === 0 ? this.#nSeries : selectedKeys;
    }

    // computes min max across stack data
    if (!this.#grouped) {

      //find/sum local (one bar) min/max, compare against global (all bars) min/max. replace as logical
      this.#stackData.map((el, i) => {
        let thisMin;
        let thisMax;

        el.map(rectData => {

          thisMin = thisMin ? (rectData[0] < thisMin ? rectData[0] : thisMin) : rectData[0];
          if (selectedKeys.includes(rectData.key)) {
            thisMax = thisMax ? (thisMax + rectData[1] - rectData[0]) : rectData[1] - rectData[0];
          }
        })
        if (!min) {
          min = thisMin
        }
        else {
          min = thisMin < min ? thisMin : min;
        }
        if (!max) {
          max = thisMax
        }
        else {
          max = thisMax > max ? thisMax : max;
        }
      })
    }

    // computes min max across raw data
    else {
      this.#data.map(el => {
        selectedKeys.map(key => {
          let curr = el[key]

          max = max ? (curr > max ? curr : max) : el[key]
          min = min ? (curr < min ? curr : min) : el[key]

        })
      })
    }
    min = isNaN(min) ? 0 : min
    max = isNaN(max) ? 1 : max
    return [min, max];
  }
  #wrap(text, width) {
    let splitRegex = /\s+/;

    text.each(function() {
      var text = d3.select(this),
        words = text.text().split(splitRegex).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr("x") ?? 0,
        y = text.attr("y") ?? 0,
        dy = parseFloat(text.attr("dy")) ?? 0,
        tspan = text
        .text(null)
        .append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", dy + "em");

      //loop through the words and add them to a tspan
      while ((word = words.pop())) {
        line.push(word)
        let lineJoin = line.join(" ")
        tspan.text(lineJoin) // make array a sentence based on last split. If only one word in line array, then stays one word

        //if sentence is now too big for width, you've added too many words / word itself is too large. Modify to be under the width then render the tspan
        if (tspan.node().getComputedTextLength() > width) {

          //means the word alone is too long, so modify the font size until it fits. remove / modify this section if we don't want text shrinking
          if (line.length <= 1) {
            let fontSize = parseFloat(window.getComputedStyle(tspan.node(), null)["fontSize"])
            //go down a font-size until it fits
            while (tspan.node().getComputedTextLength() > width && fontSize > 0) {
              fontSize = parseFloat(window.getComputedStyle(tspan.node(), null)["fontSize"]);
              tspan.attr('font-size', `${fontSize - 1}px`)
            }
            text.selectAll('tspan').attr('font-size', `${fontSize - 1}px`)
            text.attr('font-size', `${fontSize - 1}px`)
          }
          //else there's a sentence. Make the sentence shorter by putting the last word of the line back on the word list
          else {
            words.push(line.pop());
            lineJoin = line.join(" ")
            tspan.text(lineJoin);
          }
          //make the next tspan if there are still words left and reset whats in a line
          if (words.length != 0) {
            tspan = text
              .append("tspan")
              .attr('font-size', text.attr('font-size')) // remove if we don't want text shrinking. gets font-size from parent text element if it exists
              .attr("x", x)
              .attr("y", y)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")

            line = []
          }

        }
        //if there are no more words to loop through, then render the last joined words
        if (words.length == 0) {
          tspan
            .text(lineJoin);
        }
      }
    });
  }
  #fitToConstraints(text, constraint, that) {
    /* center tick titles, and shrink font-size if it extends beyond bounds */
    text.each(function() {
      let text = d3.select(this);
      let tspans = text.selectAll('tspan')
      let bounds = this.getBBox()
      // console.log(bounds, this.getBBox())
      let size = that.#vertical ? bounds.height : bounds.width;
      let fontSize = parseFloat(window.getComputedStyle(tspans.node(), null)["fontSize"]);
      // console.log(text.text())
      // console.log(size, constraint)
      while (size > constraint) {

        fontSize = parseFloat(window.getComputedStyle(tspans.node(), null)["fontSize"]) - 1;
        tspans.attr('font-size', `${fontSize}px`)

        bounds = this.getBBox()
        size = that.#vertical ? bounds.width : bounds.height;
        // console.log(size, constraint)
      }
      bounds = this.getBBox()
      size = that.#vertical ? bounds.width : bounds.height;
      text.attr('font-size', `${fontSize}px`)
      if (!that.#vertical) {
        let lineCount = tspans.size()
        text.attr("transform", `translate(0,${-size/2 + fontSize/2})`)
      }
    })
  }
}
