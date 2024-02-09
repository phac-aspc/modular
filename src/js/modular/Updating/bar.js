/*

BAR.JS

This file has a class with methods related to creating a bar graph. 

Note that d3.js must be loaded before using this file.

The following methods can be used:
- BarGraph() - bar graph constructor 
- init() - sets up axis generators, scale functions, data - all together. 
- initData() - prepares raw data for rendering grouped and stacked bar graph.
- initCScale() - sets up scale function for categorical data axis
- initNScale() - sets up scale function for numerical data axis
- initAxes() - sets up axis generator functions
- initBarWidth() - computes width of each bar based on data and graph size
- clear() - removes the existing graph (visuals removed, settings remain)
- render() - displays the graph after settings have been configured

Also, the following fields are useful to adjust: 
- data/cSeries/categories - raw data as an array of objects and the keys showing
  the categorical/numerical data field of objects
- graphTitle/cAxisTitle/nAxisTitle - the titles to display on top of the graph
  and on each axis
- vertical - whether to have vertical bars or horizontal
- grouped - whether to have side-by-side bars in groups or to stack the bars
- container - an SVG element to render the bar graph in
- wrapper - a div element containing the SVG element
- width/height/margins - controls the size and proportions of the bar graph

*/

// import { textures } from "/src/js/textures.js";


export class BarGraph {
  // =============== DECLARE FIELDS ===================
  #data;
  #cSeries;
  #cKeys;
  #nKey; //only one key now
  #selectedCategories; //selected categories
  #colourSeries = [
    "#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#37A86F",
    "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab",
    "#6b9ac4", "#d84b2a", "#8c8c8c", "#69cc58", "#e279a3",
    "#665191", "#f7b6d2", "#dbdb8d", "#bcbd22", "#17becf",
    "#9467bd", "#69312d", "#e377c2", "#c49c94",
  ]
  #textureSeries = [];
  #textureTypeSeries;
  #textures;
  #tooltipSeries;

  #categoryKey;
  #categories;

  #categoryLookup = {}
  #categoryReverseLookup = {}
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
  #alwaysDisplayBarLabels = false;
  #interactive = false;
  #loadAnimation = false; // functionality currently removed (can't toggle it off)
  #gridlines = false;
  #log = false;
  #proportional = false;
  #textContrastChecker = false; // functionality currently removed (can't toggle it off)
  #displayLegend = false;
  #hideLegendText = false;
  #displayUncertainties = false;
  #percent = false;
  #fitTickText = false;
  #detectLegendSpacing = false;
  #addCustomGroup = false;
  #captionAbove = false;

  #legendHoverFade = false;
  #barHoverFade = false;

  #upperUncertainty;
  #lowerUncertainty;
  #uncertaintyWidth = 8;

  #averageLines;
  #averageLinesColours = ["black", "red", "orange"]
  #averageLinesType = ["solid", "dashed", "dashed"]
  #averageLinesLegendText;

  #decimalPlaces;
  #decimalType = 'round';

  #transitionDuration = 1000;

  //formatters
  #tableHeaderFunction;
  #tableCellFunction;
  #tooltipFunction;
  #nTickFormat;

  //callbacks
  #callbackClick;
  #callbackHover;
  #callbackLegendHover;

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
  #barGroup;
  #legendGroup;
  #axesGroup;
  #titleGroup;
  #averageGroup;
  #customGroup;

  #table;
  #tableCaption;
  #tableSummary = d3.select('html').attr('lang') == "fr" ? "Texte descriptif" : "Text description";


  #axisGens;
  #stackGen;
  #stackData;
  #groupData;

  //private
  #proportionalStack;

  #cScales = [];
  #nScale;
  #selectedNScale;
  #colourScale;

  // #surGroups = [];
  #surKeys = [];
  // #surScales = [];
  #cSubScale;

  #cAxisInitialHeight = 0; //90
  #cAxisDrop = 0; //45

  #width = 720;
  #height = 480;
  #margins = { l: 100, r: 60, t: 60, b: 100 };
  #defaultPadding = 0.25;
  #subPadding;
  #cPaddingSeries;

  #barWidth;
  #legendRadius = 8;
  #legendTextOffset = 15;
  #legendCircleSpacing = 28;
  #legendSpacingFromGraph = 20;
  #legendOrientation = 'v';
  #legendPosition;
  #legendItemWrapCounter;
  #legendInteractionType = 'toggle';

  //#region =============== CHAINING METHODS - with validation ===================
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
  nKey(inputKey) {
    /*
    Parameters 
    ----------------
    inputKey (type: string)
      - A string representing a key that the data field has. 
      - This string should indicate the key (data header) for the dependent variable
    */
    if (arguments.length === 0) {
      return this.#nKey;
    }
    else {

      const validString = (typeof inputKey == typeof 'abc') && inputKey;

      if (validString) {
        this.#nKey = inputKey;
        return this;
      }
      else {
        console.error('nKey must be a non-empty string');
      }
    }
  }
  cSeries(inputKeys) {
    /*
    Parameters 
    ----------------
    inputKeys (type: array)
      - An array of string(s) representing key(s) that the data field has. 
      - This array should indicate some key(s) to use for the numerical axis
    */

    if (arguments.length === 0) {
      return this.#cSeries;
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
        this.#cSeries = inputKeys;
        return this;
      }
      else {
        console.error('cSeries must be an array of non-empty string(s)');
      }
    }
  }
  categoryKey(inputKey) {
    /*
    Parameters 
    ----------------
    inputKey (type: string)
      - A string representing a key that the data field has. 
      - This string should indicate the key (data header) for the dependent variable
    */
    if (arguments.length === 0) {
      return this.#categoryKey;
    }
    else {

      const validString = (typeof inputKey == typeof 'abc') && inputKey;

      if (validString) {
        this.#categoryKey = inputKey;
        return this;
      }
      else {
        console.error('categoryKey must be a non-empty string');
      }
    }
  }
  selectedCategories(inputKeys) {
    /*
    Parameters 
    ----------------
    inputKeys (type: array)
      - An array of string(s) representing key(s) that the data field has currently selected. 
      - This array should indicate some key(s) to use for the numerical axis
    */

    if (arguments.length === 0) {
      return this.#selectedCategories;
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
        this.#selectedCategories = inputKeys;
        return this;
      }
      else {
        console.error('selectedCategories must be an array of non-empty string(s)');
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
  textures(input) {
    if (arguments.length === 0) {
      return this.#textures;
    }
    else {
      this.#textures = input
      try {
        textures;
      }
      catch {
        console.error('Textures are not defined. They must be loaded in from "/src/js/textures.js" before your own script using the bar.js module. Ex: "<script src="/src/js/textures.js"></script>"')
      }

      return this;
    }
  }
  textureSeries(input) {
    if (arguments.length === 0) {
      return this.#textureSeries;
    }
    else {
      this.#textureSeries = input
      return this;
    }
  }
  textureTypeSeries(inputKeys) {
    /*
    Parameters 
    ----------------
    inputKeys (type: array)
      - An array of string(s) representing key(s) that denote which lines are dashed, dotted, straight
    */

    let accepted = ["solid", "grid", "dots", "diagonal"]

    if (arguments.length === 0) {
      return this.#textureTypeSeries;
    }
    else {
      // Check input
      const nonEmptyArray = (typeof inputKeys == typeof []) &&
        (inputKeys.length > 0);
      let validElements = true;

      if (nonEmptyArray) {
        for (let v of inputKeys) {
          if ((typeof v != typeof 'abc') || !v || !accepted.includes(v)) {
            validElements = false;
            break;
          }
        }
      }

      // Set field
      if (nonEmptyArray && validElements) {
        this.#textureTypeSeries = inputKeys;
        return this;
      }
      else {
        console.error(`textureTypeSeries must be an array of non-empty string(s) where the options are: ${accepted}`);
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
  alwaysDisplayBarLabels(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph alwaysDisplayBarLabels. False otherwise.
    */
    if (arguments.length === 0) {
      return this.#alwaysDisplayBarLabels;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#alwaysDisplayBarLabels = inputToggle;
        return this;
      }
      else {
        console.error('alwaysDisplayBarLabels must be a boolean');
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
  hideLegendText(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph hideLegendText
    */

    if (arguments.length === 0) {
      return this.#hideLegendText;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#hideLegendText = inputToggle;
        return this;
      }
      else {
        console.error('hideLegendText must be a boolean');
      }
    }
  }
  displayUncertainties(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph have gridlines. False otherwise.
    */

    if (arguments.length === 0) {
      return this.#displayUncertainties;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#displayUncertainties = inputToggle;
        if ((!this.#upperUncertainty || !this.#lowerUncertainty) && inputToggle) {
          console.warn("lowerUncertainty and upperuncertainty keys must both be set for them to display")
        }
        return this;
      }
      else {
        console.error('displayUncertainties must be a boolean');
      }
    }
  }
  percent(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph have gridlines. False otherwise.
    */

    if (arguments.length === 0) {
      return this.#percent;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#percent = inputToggle;
        return this;
      }
      else {
        console.error('percent must be a boolean');
      }
    }
  }
  fitTickText(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph tick text wrap/shrink to fit size.
    */

    if (arguments.length === 0) {
      return this.#fitTickText;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#fitTickText = inputToggle;
        return this;
      }
      else {
        console.error('fitTickText must be a boolean');
      }
    }
  }
  detectLegendSpacing(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph tick text wrap/shrink to fit size.
    */

    if (arguments.length === 0) {
      return this.#detectLegendSpacing;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#detectLegendSpacing = inputToggle;
        return this;
      }
      else {
        console.error('detectLegendSpacing must be a boolean');
      }
    }
  }
  addCustomGroup(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph tick text wrap/shrink to fit size.
    */

    if (arguments.length === 0) {
      return this.#addCustomGroup;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#addCustomGroup = inputToggle;
        return this;
      }
      else {
        console.error('addCustomGroup must be a boolean');
      }
    }
  }
  captionAbove(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph tick text wrap/shrink to fit size.
    */

    if (arguments.length === 0) {
      return this.#captionAbove;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#captionAbove = inputToggle;
        return this;
      }
      else {
        console.error('captionAbove must be a boolean');
      }
    }
  }
  legendHoverFade(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph tick text wrap/shrink to fit size.
    */

    if (arguments.length === 0) {
      return this.#legendHoverFade;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#legendHoverFade = inputToggle;
        return this;
      }
      else {
        console.error('legendHoverFade must be a boolean');
      }
    }
  }
  barHoverFade(inputToggle) {
    /*
    Parameters 
    ----------------
    inputToggle (type: bool)
      - True to make the graph tick text wrap/shrink to fit size.
    */

    if (arguments.length === 0) {
      return this.#barHoverFade;
    }
    else {
      const validBool = (typeof inputToggle == typeof true);

      if (validBool) {
        this.#barHoverFade = inputToggle;
        return this;
      }
      else {
        console.error('barHoverFade must be a boolean');
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
  legendItemWrapCounter(inputSpacing) {
    /*
    Parameters 
    ----------------
    inputSpacing (type: number)
      - A number for the spacing between the graph and the legend.
    */
    if (arguments.length === 0) {
      return this.#legendItemWrapCounter;
    }
    else {
      const validNum = (typeof inputSpacing == typeof 5);

      if (validNum) {
        this.#legendItemWrapCounter = inputSpacing;
        return this;
      }
      else {
        console.error('legendItemWrapCounter must be a number');
      }
    }
  }

  upperUncertainty(inputKey) {
    /*
    Parameters 
    ----------------
    inputKey (type: string)
      - A string representing a key that the data field has. 
      - This string should indicate the key (data header) for the dependent variable
    */
    if (arguments.length === 0) {
      return this.#upperUncertainty;
    }
    else {

      const validString = (typeof inputKey == typeof 'abc') && inputKey;

      if (validString) {
        this.#upperUncertainty = inputKey;
        return this;
      }
      else {
        console.error('upperUncertainty must be a non-empty string');
      }
    }
  }
  lowerUncertainty(inputKey) {
    /*
    Parameters 
    ----------------
    inputKey (type: string)
      - A string representing a key that the data field has. 
      - This string should indicate the key (data header) for the dependent variable
    */
    if (arguments.length === 0) {
      return this.#lowerUncertainty;
    }
    else {

      const validString = (typeof inputKey == typeof 'abc') && inputKey;

      if (validString) {
        this.#lowerUncertainty = inputKey;
        return this;
      }
      else {
        console.error('lowerUncertainty must be a non-empty string');
      }
    }
  }
  uncertaintyWidth(input) {
    /*
    Parameters 
    ----------------
    inputSpacing (type: number)
      - A number for the spacing from the cAxis.
    */
    if (arguments.length === 0) {
      return this.#uncertaintyWidth;
    }
    else {
      const validNum = (typeof input == typeof 5) &&
        (input >= 0);

      if (validNum) {
        this.#uncertaintyWidth = input;
        return this;
      }
      else {
        console.error('uncertaintyWidth must be a number');
      }
    }
  }

  legendOrientation(input) {
    /*
    Parameters 
    ----------------
    input (type: char)
      - A number for the spacing between the graph and the legend.
    */
    if (arguments.length === 0) {
      return this.#legendOrientation;
    }
    else {
      const valid = (typeof input == typeof 'a');

      if (valid) {
        this.#legendOrientation = input;
        return this;
      }
      else {
        console.error('legendOrientation must be "v" for vertical, or "h" for horizontal');
      }
    }
  }
  legendInteractionType(input) {
    /*
    Parameters 
    ----------------
    input (type: char)
      - A number for the spacing between the graph and the legend.
    */
    let accepted = ['toggle', 'isolate']

    if (arguments.length === 0) {
      return this.#legendInteractionType;
    }
    else {
      const valid =
        // (typeof input == typeof 'a') && 
        accepted.includes(input);

      if (valid) {
        this.#legendInteractionType = input;
        return this;
      }
      else {
        console.error('legendInteractionType must be either "toggle" or "isolate"');
      }
    }
  }
  legendPosition(input) {
    /*
    Parameters 
    ----------------
    input (type: array)
      - [x, y] position of legend
    */
    if (arguments.length === 0) {
      return this.#legendPosition;
    }
    else {
      this.#legendPosition = input;
      return this;
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
  cAxisInitialHeight(inputSpacing) {
    /*
    Parameters 
    ----------------
    inputSpacing (type: number)
      - A number for the spacing between the graph and the legend.
    */
    if (arguments.length === 0) {
      return this.#cAxisInitialHeight;
    }
    else {
      const validNum = (typeof inputSpacing == typeof 5);

      if (validNum) {
        this.#cAxisInitialHeight = inputSpacing;
        return this;
      }
      else {
        console.error('cAxisInitialHeight must be a number');
      }
    }
  }
  cAxisDrop(inputSpacing) {
    /*
    Parameters 
    ----------------
    inputSpacing (type: number)
      - A number for the spacing between the graph and the legend.
    */
    if (arguments.length === 0) {
      return this.#cAxisDrop;
    }
    else {
      const validNum = (typeof inputSpacing == typeof 5);

      if (validNum) {
        this.#cAxisDrop = inputSpacing;
        return this;
      }
      else {
        console.error('cAxisDrop must be a number');
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
  defaultPadding(inputPadding) {
    /*
    Parameters 
    ----------------
    inputPadding (type: number)
      - A number between 0 and 1 that represents a decimal percentage. 
      - This should indicate what percent of a bar's width should 
        be cut away for padding.
    */
    if (arguments.length === 0) {
      return this.#defaultPadding;
    }
    else {
      const validNum = (typeof inputPadding == typeof 5) &&
        (inputPadding <= 1) && (inputPadding >= 0);

      if (validNum) {
        this.#defaultPadding = inputPadding;
        return this;
      }
      else {
        console.error('defaultPadding must be a decimal number between 0-1');
      }
    }
  }
  cPaddingSeries(input) {
    if (arguments.length === 0) {
      return this.#cPaddingSeries;
    }
    else {
      this.#cPaddingSeries = input;
      return this;
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
  cScales(inputCScale) {
    /*
    Parameters 
    ----------------
    inputCScale (type: function)
      - A d3.scale function that will be used to space the labels and 
        categorical position of bars.
    */
    if (arguments.length === 0) {
      return this.#cScales;
    }
    else {
      this.#cScales = inputCScale;
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
  barGroup(input) {
    if (arguments.length === 0) {
      return this.#barGroup;
    }
    else {
      this.#barGroup = input;
      return this;
    }
  }
  legendGroup(input) {
    if (arguments.length === 0) {
      return this.#legendGroup;
    }
    else {
      this.#legendGroup = input;
      return this;
    }
  }
  customGroup(input) {
    if (arguments.length === 0) {
      return this.#customGroup;
    }
    else {
      this.#customGroup = input;
      return this;
    }
  }
  axesGroup(input) {
    if (arguments.length === 0) {
      return this.#axesGroup;
    }
    else {
      this.#axesGroup = input;
      return this;
    }
  }
  titleGroup(input) {
    if (arguments.length === 0) {
      return this.#titleGroup;
    }
    else {
      this.#titleGroup = input;
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

  averageLines(input) {
    if (arguments.length === 0) {
      return this.#averageLines;
    }
    else {
      this.#averageLines = input
      return this;
    }
  }
  averageLinesColours(input) {
    if (arguments.length === 0) {
      return this.#averageLinesColours;
    }
    else {
      this.#averageLinesColours = input
      return this;
    }
  }
  averageLinesType(input) {
    if (arguments.length === 0) {
      return this.#averageLinesType;
    }
    else {
      this.#averageLinesType = input
      return this;
    }
  }
  averageLinesLegendText(input) {
    if (arguments.length === 0) {
      return this.#averageLinesLegendText;
    }
    else {
      this.#averageLinesLegendText = input
      return this;
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
  callbackLegendHover(input) {
    if (arguments.length === 0) {
      return this.#callbackLegendHover;
    }
    else {
      this.#callbackLegendHover = input
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
  tableCellFunction(input) {
    if (arguments.length === 0) {
      return this.#tableCellFunction;
    }
    else {
      this.#tableCellFunction = input
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
  tooltipFunction(input) {
    if (arguments.length === 0) {
      return this.#tooltipFunction;
    }
    else {
      this.#tooltipFunction = input
      return this;
    }
  }
  //#endregion

  //#region =============== HELPER METHODS (PUBLIC) ===================
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
  initCategories() {
    let categories = [];
    this.#data.map(el => {
      let cat = el[this.#categoryKey];
      if (!categories.includes(cat)) {
        categories.push(cat)
      }
    })
    this.#categoryLookup = {};
    this.#categoryReverseLookup = {};

    categories.map((el, i) => {
      this.#categoryLookup[el] = "val" + i;
      this.#categoryReverseLookup["val" + i] = el;
    })
    this.#categories = categories;
  }
  initData(categories = this.#categories) {
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
    this.#stackGen = this.#createStackGen();

    let dataMaps = this.#cSeries.map(fv => function(d) { return d[fv] });
    this.#groupData = d3.rollups(this.#data, v => v, ...dataMaps);

    //make the data stacked
    if (!this.#grouped) {
      let createStackRow = (el) => {
        let stackRow = { ...el[1][0] }
        delete stackRow[this.#nKey]
        delete stackRow[this.#categoryKey]
        // console.log(el[1])
        el[1].map(el => {
          stackRow[el[this.#categoryKey]] = el[this.#nKey]
        })
        if (this.#proportional) {
          let total = 0;

          categories.map(n => {
            total += +stackRow[n]
          })
          categories.map(n => {
            stackRow[n] = stackRow[n] / total * 100.0
          })
          stackRow["total"] = total;
        }

        // console.log('row', stackRow)
        el[1] = d3.stack().keys(categories)([stackRow])
      }

      let levels = [];
      this.#cSeries.map((c, i) => {
        let row = []
        if (i == 0) {
          if (i == this.#cSeries.length - 1) {
            this.#groupData.map(el => createStackRow(el))
          }
          row = this.#groupData.map(el => el)
        }
        else {
          levels[i - 1].map(el => {
            el[1].map(el => {
              if (i == this.#cSeries.length - 1) {
                createStackRow(el)
              }
              row.push(el)
            })
          })
        }
        levels[i] = row;
      })
      // console.log('levels', levels)
      this.#stackData = this.#groupData;
      if (this.#proportional) {
        this.#proportionalStack = this.#stackData
      }
    }
  }
  initcScales() {
    this.#surKeys = []
    this.#cScales = []

    // if (this.#surGroups.length != 0){
    this.#cSeries.map((group, i) => {

      //get unique keys from group
      let keys = []
      this.#data.map(el => {
        if (!keys.includes(el[group])) {
          keys.push(el[group])
        }
      })
      this.#surKeys.push(keys)

      //create cScales
      let scale;
      if (i == 0) {
        scale = d3
          .scaleBand()
          .domain(this.#surKeys[i])
          .range([this.#margins.l, this.#width - this.#margins.r])
          .padding([this.#cPaddingSeries ? this.#cPaddingSeries[i] : this.#defaultPadding]);

        // Adjust for horizontal bar graphs
        if (!this.#vertical) {
          scale = scale
            .range([this.#margins.t, this.#height - this.#margins.b]);
        }
      }
      else {
        scale = d3
          .scaleBand()
          .domain(this.#surKeys[i])
          .range([0, this.#cScales[i - 1].bandwidth()])
          .padding([this.#cPaddingSeries ? this.#cPaddingSeries[i] : this.#defaultPadding])
      }

      this.#cScales.push(scale);
    })
    // }
    // console.log("surKeys", this.#surKeys)
    // console.log("scales", this.#cScales)
  }
  initNScale(log = false, dataUpdate = true) {
    /*
      This function initialises a d3.scale function to set bar height.
      
      NOTE: Ensure that this.#stackGen and this.#stackData are set
      before calling this method.
    
      Parameters 
      -----------------
      log (type: bool)
        - Whether to set the bar height with a log scale.
    */

    let [min, max] = this.#dataMinMax(dataUpdate);
    this.#min = min;
    this.#max = max;
    // console.log('min', min, 'max', max)

    if (isNaN(min)) {
      this.#min = 0;
      min = 0;
    }
    if (isNaN(max)) {
      this.#max = 1;
      max = 1;
    }

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
          .range([this.#margins.l, this.#width - this.#margins.r]);
      }
    }

  }
  initCSubScale() {
    /* 
    Initialises a bandscale for the categorical axis
    
    Parameters
    -------------------
    undefined
    - Though note that this method relies on values of #data, #cSeries, #categories, #cScale,
      #margins, #subPadding, and #width. Please initialise those before calling the method
      
    Returns
    -------------------
    undefined
    */

    this.#cSubScale = d3
      .scaleBand()
      .domain(this.#categories)
      .range([0, this.#cScales[this.#cScales.length - 1].bandwidth()])
      .padding([this.#subPadding ?? this.#defaultPadding]);
  }
  initColourScale() {
    /*
    Initializes a scaleOrdinal for the colours of the bars.
    */
    this.#colourScale = d3
      .scaleOrdinal()
      .domain(this.#categories)
      .range(this.#colourSeries)
  }
  initTextures() {
    //copied from /src/js/textures.js
    // let textures;
    // !function(t,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r():"function"==typeof define&&define.amd?define(r):t.textures=r()}(this,function(){"use strict";var t=function(){return(Math.random().toString(36)+"00000000000000000").replace(/[^a-z]+/g,"").slice(0,5)};return{circles:function(){var r=20,n="",e=2,a=!1,u="#343434",i="#343434",c=0,l=t(),o=function(t){var o=t.append("defs").append("pattern").attr("id",l).attr("patternUnits","userSpaceOnUse").attr("width",r).attr("height",r);n&&o.append("rect").attr("width",r).attr("height",r).attr("fill",n),o.append("circle").attr("cx",r/2).attr("cy",r/2).attr("r",e).attr("fill",u).attr("stroke",i).attr("stroke-width",c),a&&[[0,0],[0,r],[r,0],[r,r]].forEach(function(t){o.append("circle").attr("cx",t[0]).attr("cy",t[1]).attr("r",e).attr("fill",u).attr("stroke",i).attr("stroke-width",c)})};return o.heavier=function(t){return 0===arguments.length?e*=2:e*=2*t,o},o.lighter=function(t){return 0===arguments.length?e/=2:e/=2*t,o},o.thinner=function(t){return 0===arguments.length?r*=2:r*=2*t,o},o.thicker=function(t){return 0===arguments.length?r/=2:r/=2*t,o},o.background=function(t){return n=t,o},o.size=function(t){return r=t,o},o.complement=function(t){return a=0===arguments.length||t,o},o.radius=function(t){return e=t,o},o.fill=function(t){return u=t,o},o.stroke=function(t){return i=t,o},o.strokeWidth=function(t){return c=t,o},o.id=function(t){return 0===arguments.length?l:(l=t,o)},o.url=function(){return"url(#"+l+")"},o},lines:function(){var r=20,n="#343434",e=2,a="",u=t(),i=["diagonal"],c="auto",l=function(t){var n=r;switch(t){case"0/8":case"vertical":return"M "+n/2+", 0 l 0, "+n;case"1/8":return"M "+n/4+",0 l "+n/2+","+n+" M "+-n/4+",0 l "+n/2+","+n+" M "+3*n/4+",0 l "+n/2+","+n;case"2/8":case"diagonal":return"M 0,"+n+" l "+n+","+-n+" M "+-n/4+","+n/4+" l "+n/2+","+-n/2+" M "+.75*n+","+5/4*n+" l "+n/2+","+-n/2;case"3/8":return"M 0,"+.75*n+" l "+n+","+-n/2+" M 0,"+n/4+" l "+n+","+-n/2+" M 0,"+5*n/4+" l "+n+","+-n/2;case"4/8":case"horizontal":return"M 0,"+n/2+" l "+n+",0";case"5/8":return"M 0,"+-n/4+" l "+n+","+n/2+"M 0,"+n/4+" l "+n+","+n/2+" M 0,"+3*n/4+" l "+n+","+n/2;case"6/8":return"M 0,0 l "+n+","+n+" M "+-n/4+","+.75*n+" l "+n/2+","+n/2+" M "+3*n/4+","+-n/4+" l "+n/2+","+n/2;case"7/8":return"M "+-n/4+",0 l "+n/2+","+n+" M "+n/4+",0 l "+n/2+","+n+" M "+3*n/4+",0 l "+n/2+","+n;default:return"M "+n/2+", 0 l 0, "+n}},o=function(t){var o=t.append("defs").append("pattern").attr("id",u).attr("patternUnits","userSpaceOnUse").attr("width",r).attr("height",r);a&&o.append("rect").attr("width",r).attr("height",r).attr("fill",a),i.forEach(function(t){o.append("path").attr("d",l(t)).attr("stroke-width",e).attr("shape-rendering",c).attr("stroke",n).attr("stroke-linecap","square")})};return o.heavier=function(t){return 0===arguments.length?e*=2:e*=2*t,o},o.lighter=function(t){return 0===arguments.length?e/=2:e/=2*t,o},o.thinner=function(t){return 0===arguments.length?r*=2:r*=2*t,o},o.thicker=function(t){return 0===arguments.length?r/=2:r/=2*t,o},o.background=function(t){return a=t,o},o.size=function(t){return r=t,o},o.orientation=function(){for(var t=arguments.length,r=Array(t),n=0;n<t;n++)r[n]=arguments[n];return 0===arguments.length?o:(i=r,o)},o.shapeRendering=function(t){return c=t,o},o.stroke=function(t){return n=t,o},o.strokeWidth=function(t){return e=t,o},o.id=function(t){return 0===arguments.length?u:(u=t,o)},o.url=function(){return"url(#"+u+")"},o},paths:function(){var r=1,n=1,e=20,a="#343434",u=2,i="",c=function(t){return"M "+t/4+","+3*t/4+"l"+t/4+","+-t/2+"l"+t/4+","+t/2},l=t(),o="transparent",s="auto",f=function(t){var a=e;switch(t){case"squares":return"M "+a/4+" "+a/4+" l "+a/2+" 0 l 0 "+a/2+" l "+-a/2+" 0 Z";case"nylon":return"M 0 "+a/4+" l "+a/4+" 0 l 0 "+-a/4+" M "+3*a/4+" "+a+" l 0 "+-a/4+" l "+a/4+" 0 M "+a/4+" "+a/2+" l 0 "+a/4+" l "+a/4+" 0 M "+a/2+" "+a/4+" l "+a/4+" 0 l 0 "+a/4;case"waves":return"M 0 "+a/2+" c "+a/8+" "+-a/4+" , "+3*a/8+" "+-a/4+" , "+a/2+" 0 c "+a/8+" "+a/4+" , "+3*a/8+" "+a/4+" , "+a/2+" 0 M "+-a/2+" "+a/2+" c "+a/8+" "+a/4+" , "+3*a/8+" "+a/4+" , "+a/2+" 0 M "+a+" "+a/2+" c "+a/8+" "+-a/4+" , "+3*a/8+" "+-a/4+" , "+a/2+" 0";case"woven":return"M "+a/4+","+a/4+"l"+a/2+","+a/2+"M"+3*a/4+","+a/4+"l"+a/2+","+-a/2+" M"+a/4+","+3*a/4+"l"+-a/2+","+a/2+"M"+3*a/4+","+5*a/4+"l"+a/2+","+-a/2+" M"+-a/4+","+a/4+"l"+a/2+","+-a/2;case"crosses":return"M "+a/4+","+a/4+"l"+a/2+","+a/2+"M"+a/4+","+3*a/4+"l"+a/2+","+-a/2;case"caps":return"M "+a/4+","+3*a/4+"l"+a/4+","+-a/2+"l"+a/4+","+a/2;case"hexagons":return r=3,n=Math.sqrt(3),"M "+a+",0 l "+a+",0 l "+a/2+","+a*Math.sqrt(3)/2+" l "+-a/2+","+a*Math.sqrt(3)/2+" l "+-a+",0 l "+-a/2+","+-a*Math.sqrt(3)/2+" Z M 0,"+a*Math.sqrt(3)/2+" l "+a/2+",0 M "+3*a+","+a*Math.sqrt(3)/2+" l "+-a/2+",0";default:return t(a)}},h=function(t){var h=f(c),d=t.append("defs").append("pattern").attr("id",l).attr("patternUnits","userSpaceOnUse").attr("width",e*r).attr("height",e*n);i&&d.append("rect").attr("width",e*r).attr("height",e*n).attr("fill",i),d.append("path").attr("d",h).attr("fill",o).attr("stroke",a).attr("stroke-width",u).attr("stroke-linecap","square").attr("shape-rendering",s)};return h.heavier=function(t){return 0===arguments.length?u*=2:u*=2*t,h},h.lighter=function(t){return 0===arguments.length?u/=2:u/=2*t,h},h.thinner=function(t){return 0===arguments.length?e*=2:e*=2*t,h},h.thicker=function(t){return 0===arguments.length?e/=2:e/=2*t,h},h.background=function(t){return i=t,h},h.shapeRendering=function(t){return s=t,h},h.size=function(t){return e=t,h},h.d=function(t){return c=t,h},h.fill=function(t){return o=t,h},h.stroke=function(t){return a=t,h},h.strokeWidth=function(t){return u=t,h},h.id=function(t){return 0===arguments.length?l:(l=t,h)},h.url=function(){return"url(#"+l+")"},h}}});

    // this.#textureSeries.map(t => {
    //   this.#container.call(t)
    // })

    let gridTexture = (stroke, background) => {
      let t = textures.lines()
        .orientation("vertical", "horizontal")
        .size(4)
        .strokeWidth(0.5)
        .shapeRendering("crispEdges")
        .stroke(stroke)
        .background(background);
      this.#container.call(t)
      return t;
    }
    let dotsTexture = (stroke, background) => {
      let t = textures.circles()
        .complement()
        .thicker()
        .radius(1)
        .stroke(stroke)
        .background(background);
      this.#container.call(t)
      return t;
    }
    let diagonalTexture = (stroke, background) => {
      let t = textures.lines()
        .orientation("diagonal")
        .size(10)
        .strokeWidth(1)
        .stroke(stroke)
        .background(background);
      this.#container.call(t)
      return t;
    }

    this.#categories.map((cat, index) => {
      let stroke = 'black'
      let myColour = this.#colourScale(cat)
      let chosenTexture = this.#textureTypeSeries[index % this.#textureTypeSeries.length]

      let t;
      if (chosenTexture == 'solid') {
        t = 'solid';
      }
      else if (chosenTexture == "grid") {
        t = gridTexture(stroke, myColour)
      }
      else if (chosenTexture == "dots") {
        t = dotsTexture(stroke, myColour)
      }
      else if (chosenTexture == "diagonal") {
        t = diagonalTexture(stroke, myColour)
      }

      this.#textureSeries.push(t)
    })

    // console.log(this.#textureSeries)

    // this.#container.call(t);
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
    let n = this.#vertical ? d3.axisLeft(this.#nScale) : d3.axisBottom(this.#nScale);
    let c = [];

    this.#cScales.map(scale => {
      c.push(this.#vertical ? d3.axisBottom(scale) : d3.axisLeft(scale));
    })

    // if (!this.#vertical) {
    //   n = d3.axisBottom(this.#nScale);
    //   c = d3.axisLeft(this.#cScales[0]);
    // }

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
    // console.log(c)
    c.map(c => {
      setOptions(c, cAxisOptions);
    })


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
      this.#barWidth = this.#cScales[this.#cScales.length - 1].bandwidth()
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
    this.initCategories();
    this.initData();
    this.initcScales();
    // console.log(this.#surKeys)
    // console.log(this.#cScales)
    this.initNScale(this.#log);
    // this.initCScale();
    this.initCSubScale();
    this.initColourScale();
    if (this.#textures) {
      this.initTextures();
    }

    let nAxisOptions = {};
    let cAxisOptions = {};
    if (this.#gridlines) {
      const gridHeight = this.#height - this.#margins.b - this.#margins.t;
      const gridWidth = this.#width - this.#margins.l - this.#margins.r;
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

    // Render axes
    this.#renderAxes();
    // Render bars
    this.#renderBars(tooltipEnter, tooltipLeave, tooltipMove);
    //Render average lines
    if (this.#averageLines) {
      this.#renderAverageLines();
    }


    // Render legends
    this.#renderLegend();

    if (this.#addCustomGroup) {
      this.#renderCustomGroup();
    }

    if (this.#averageLines) {
      this.#renderAverageLinesLegend();
    }

    if (this.#barHoverFade) {
      this.#addBarHoverFade();
    }
    if (this.#legendHoverFade) {
      this.#addLegendHoverFade();
    }

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
  update() {

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

    return this;
  }
  //#endregion

  //#region =============== HELPER METHODS (PRIVATE) ===================
  #createCKeys(data = this.#data) {
    let cKeys = [];
    data.map(el => {
      if (!cKeys.includes(el[this.#cSeries]))
        cKeys.push(el[this.#cSeries])
    })
    return cKeys;
  }
  #createStackGen(categories = this.#categories) {
    return d3.stack().keys(categories);
  }
  #createProportionalStackData(data = this.#data, categories = this.#categories, stackGen = this.#stackGen) {
    let sData = stackGen(data)
    // console.log(sData)
    sData.map(el => {
      el.map(d => {
        let total = 0
        categories.map(n => {
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
    if (this.#alwaysDisplayBarLabels)
      return true;
    let xVal = this.#vertical ? textWidth : textHeight;
    let yVal = this.#vertical ? textHeight : textWidth;
    let rectY = Math.abs(nScale(d[0]) - nScale(d[1]))

    // console.log(xVal, this.#barWidth)

    //does the text fit in the rect?
    return yVal <= rectY && xVal <= this.#barWidth;
  }
  #labelFitsGroupedBar(textWidth, textHeight, d) {
    if (this.#alwaysDisplayBarLabels)
      return true;
    let xVal = this.#vertical ? textWidth : textHeight;
    let paddedWidth = this.#cSubScale.step()

    // console.log(xVal, this.#barWidth)

    return xVal <= paddedWidth;

  }
  #round(number) {
    if (!isNaN(this.#decimalPlaces)) {
      let multiplier = Math.pow(10, this.#decimalPlaces)
      return Math.round(number * multiplier) / multiplier
    }
    else {
      return number;
    }
  }
  #getLabel(d, isProportionalLabel = true) {
    let value;
    //stacked
    if (!this.#grouped) {
      if (d[1] - d[0] >= 0) {
        value = this.#round(d[1] - d[0])
        if (this.#decimalType = "fixed") {
          value = value.toFixed(this.#decimalPlaces)
        }

        return value + (isProportionalLabel || this.#percent ? '%' : '');
      }
      // else {
      //   console.log(this.#categoryKey)
      //   return d.data[this.#nKey];
      // }
    }
    //grouped
    else {
      value = this.#round(d[this.#nKey])
      if (this.#decimalType == "fixed") {
        value = value.toFixed(this.#decimalPlaces)
      }
      // console.log(value)
      if (isNaN(value)) {
        return d[this.#nKey];
      }
      return value + (this.#percent ? '%' : '');
    }
  }
  #calcGroupedXPos(d) {
    // console.log(d)
    let xPos = 0;

    this.#cSeries.map((c, i) => {
      xPos += this.#cScales[i](d[c])
      // console.log(this.#cScales)
      // console.log(d.data[c])
    })
    // console.log(xPos)
    return xPos;
  }
  #uncertaintyIsNaN(d) {
    return isNaN(d[this.#upperUncertainty]) || isNaN(d[this.#lowerUncertainty]);
  }
  #updateUncertaintyLine(selection, key, verticalLine = true) {
    let y1 = this.#vertical ? 'y1' : 'x1';
    let y2 = this.#vertical ? 'y2' : 'x2';
    let x1 = this.#vertical ? 'x1' : 'y1';
    let x2 = this.#vertical ? 'x2' : 'y2';

    selection
      .transition()
      .duration(this.#transitionDuration)
      .attr(y1, d => {
        if (this.#uncertaintyIsNaN(d)) {
          return this.#nScale(0)
        }
        return verticalLine ? this.#nScale(d[this.#lowerUncertainty]) : this.#nScale(d[key]);
      })
      .attr(y2, d => {
        if (this.#uncertaintyIsNaN(d)) {
          return this.#nScale(0)
        }
        return verticalLine ? this.#nScale(d[this.#upperUncertainty]) : this.#nScale(d[key])
      })
      .attr(x1, d => verticalLine ? this.#cSubScale(d[this.#categoryKey]) + this.#calcGroupedXPos(d) + this.#cSubScale.bandwidth() / 2 : this.#cSubScale(d[this.#categoryKey]) + this.#calcGroupedXPos(d) - this.#uncertaintyWidth / 2 + this.#cSubScale.bandwidth() / 2)
      .attr(x2, d => verticalLine ? this.#cSubScale(d[this.#categoryKey]) + this.#calcGroupedXPos(d) + this.#cSubScale.bandwidth() / 2 : this.#cSubScale(d[this.#categoryKey]) + this.#calcGroupedXPos(d) + this.#uncertaintyWidth / 2 + this.#cSubScale.bandwidth() / 2)
      .attr('opacity', d => this.#uncertaintyIsNaN(d) ? 0 : 1)
  }
  #updateUncertaintyLineRemove(selection, key, verticalLine = true) {
    let y1 = this.#vertical ? 'y1' : 'x1';
    let y2 = this.#vertical ? 'y2' : 'x2';
    // let x1 = this.#vertical ? 'x1' : 'y1';
    // let x2 = this.#vertical ? 'x2' : 'y2';

    selection
      .transition()
      .duration(this.#transitionDuration)
      .attr(y1, d => this.#nScale(0))
      .attr(y2, d => this.#nScale(0))
      .attr('opacity', 0)
  }
  #renderCustomGroup() {
    if (!this.#customGroup)
      this.#customGroup = this.#container.append('g').attr('class', 'custom')
  }
  #renderBars(tooltipEnter, tooltipLeave, tooltipMove) {

    if (!this.#barGroup)
      this.#barGroup = this.#container.append('g').attr('class', 'bars')

    let bars = this.#barGroup

    // Save private fields (can't access 'this' when rendering bars)
    const that = this;
    const cSeriesLast = this.#cSeries[this.#cSeries.length - 1];
    const cSeries = this.#cSeries
    const categories = this.#categories;
    const nScale = this.#nScale;
    const cScales = this.#cScales;
    const cScale = this.#cScales[this.#cScales.length - 1];
    const cSubScale = this.#cSubScale;
    const barWidth = this.#barWidth;
    const graphWidth = this.#width;
    const barLabels = this.#barLabels;
    const colourScale = this.#colourScale;
    const loadAnimation = this.#loadAnimation; // this doesn't do anything right now
    const proportional = this.#proportional;
    const grouped = this.#grouped;

    // console.log("cScales", cScales);


    const categoryLookup = this.#categoryLookup;
    const categoryReverseLookup = this.#categoryReverseLookup;

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

    let createUncertaintyLine = (selection, id, key, verticalLine = true) => {
      let y1 = this.#vertical ? 'y1' : 'x1';
      let y2 = this.#vertical ? 'y2' : 'x2';
      let x1 = this.#vertical ? 'x1' : 'y1';
      let x2 = this.#vertical ? 'x2' : 'y2';

      // console.log()

      selection.append('line')
        // .attr('class', 'uncertainty')
        .attr('data-uncertainty', id)
        // .attr("fill", 'black')
        .attr("stroke", 'black')
        .attr(y1, d => {
          if (this.#uncertaintyIsNaN(d)) {
            return this.#nScale(0)
          }
          return verticalLine ? this.#nScale(d[this.#lowerUncertainty]) : this.#nScale(d[key])
        })
        .attr(y2, d => {
          if (this.#uncertaintyIsNaN(d)) {
            return this.#nScale(0)
          }
          return verticalLine ? this.#nScale(d[this.#upperUncertainty]) : this.#nScale(d[key])
        })
        .attr(x1, d => verticalLine ? cSubScale(d[this.#categoryKey]) + this.#calcGroupedXPos(d) + barWidth / 2 : cSubScale(d[this.#categoryKey]) + this.#calcGroupedXPos(d) - this.#uncertaintyWidth / 2 + barWidth / 2)
        .attr(x2, d => verticalLine ? cSubScale(d[this.#categoryKey]) + this.#calcGroupedXPos(d) + barWidth / 2 : cSubScale(d[this.#categoryKey]) + this.#calcGroupedXPos(d) + this.#uncertaintyWidth / 2 + barWidth / 2)
        .attr('opacity', d => this.#uncertaintyIsNaN(d) ? 0 : 1)

    }

    // for stacked bar graphs
    if (!this.#grouped) {
      // console.log("stackData", this.#stackData)
      let barGroups = bars
        .selectAll("g[data-layer='0']")
        .data(this.#stackData)
        // .data(this.#groupData)
        .join(
          (enter) => {
            let g = enter.append('g').attr('class', 'bar-group')
              .attr('aria-label', d => {
                // console.log(d)
                return d[0] // key
              })
              .attr('data-layer', 0)

            this.#cSeries.map((c, i) => {
              if (i != 0) {
                g = g
                  .selectAll('g')
                  .data(d => {
                    return d[1]
                  })
                  .join('g')

                g
                  .attr('class', 'bar-group')
                  .attr('aria-label', d => {
                    // console.log(d)
                    return d[0] // key
                  })
                  .attr('data-layer', i)
                  .attr('opacity', 1)
              }
            })

            let rect = g
              .selectAll('rect')
              .data(d => {
                // console.log(d)
                return d[1]
              })
              .join('rect')

            rect
              .attr(x, d => {
                // console.log(d)
                // return cScale(d.data[cSeries])
                return this.#calcGroupedXPos(d[0].data)
              })
              .attr(w, barWidth)
              .attr(y, d => nScale(lowestNValue))
              .attr('opacity', 0)
              .attr('class', d => categoryLookup[d.key])
              .transition()
              .duration(this.#transitionDuration)
              .attr(y, d => {
                // let value = nScale(d[0][last])
                return nScale(d[0][last]);
              })
              .attr(h, d => {
                let height = nScale(d[0][first]) - nScale(d[0][last])
                return height == 0 || isNaN(height) ? 0.1 : height
              })
              .attr('opacity', 1)
              .attr('fill', (d, i) => {
                let myColour;
                if (this.#categories.length > 1) {
                  myColour = colourScale(d.key)
                }
                else {
                  myColour = this.#colourSeries[rectCount++ % this.#colourSeries.length];
                }
                if (this.#textures && this.#textureSeries[i] != 'solid') {
                  return this.#textureSeries[i].url();
                }
                return myColour
              })

            rect
              .attr('aria-label', d => {
                // console.log(d)
                return `${d.key}: ${this.#getLabel(d[0], proportional)}`
              })
              .attr('tabindex', -1)

            rect
              .on('mouseenter', tooltipEnter)
              // .on('focus', (e, d) => {
              //   tooltipEnter(e, d)
              // })
              .on('mouseleave', tooltipLeave)
              // .on('focus.bar', tooltipLeave)
              .on('mousemove', tooltipMove);

            if (this.#interactive) {
              rect.attr('cursor', 'pointer')
            }

            // creates bar labels
            if (barLabels) {
              let text = g
                .selectAll('text')
                .data(d => {
                  // console.log(d)
                  return d[1]
                })
                .join('text')

              text
                .attr('class', d => {
                  return `bar-label ${categoryLookup[d.key]}-label`
                })
                .attr('fill', d => {
                  return checkContrastToWhite(colourScale(d.key)) ? lightFontColour : darkFontColour;
                })
                .attr("alignment-baseline", 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('text-anchor', 'middle')
                .on('mouseenter', tooltipEnter)
                .on('mouseleave', tooltipLeave)
                .on('mousemove', tooltipMove)
                .text(d => {
                  if (typeof d[0][last] == 'number' && d[0][1] - d[0][0] >= 0) {
                    return this.#getLabel(d[0], proportional);
                  }
                });
              text
                .attr('opacity', 0)
                .attr(x, d => {
                  // console.log(d)
                  // console.log(cScale(d.data[cSeries]))
                  // return cScale(d.data[cSeries]) + barWidth / 2
                  return this.#calcGroupedXPos(d[0].data) + barWidth / 2
                })
                .attr(y, d => nScale(lowestNValue))
                .transition()
                .duration(this.#transitionDuration)
                .attr(y, d => {
                  let avg = (d[0][first] + d[0][last]) / 2
                  if (avg != 0) {
                    return nScale(avg)
                  }
                })
                .attr('opacity', function(d) {
                  let dimensions = that.#calculateTextDimensions(that.#getLabel(d[0], proportional), that.#getFullFont(this))
                  return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d[0]) ? 1 : 0;
                })
                .on('end', function(d) {
                  let selection = d3.select(this);
                  selection.attr('display', function(d) {
                    let dimensions = that.#calculateTextDimensions(that.#getLabel(d[0], proportional), that.#getFullFont(this))
                    return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d[0]) ? 'block' : 'none';
                  })
                })

            }
          },
          (update) => {
            // console.log('updateStacked', update)
            // console.log('updatRect', update.selectAll('rect'))
            let g = update
              .attr('class', 'bar-group')
              .attr('aria-label', d => {
                // console.log(d)
                return d[0] // key
              })

            this.#cSeries.map((c, i) => {
              if (i != 0) {
                g
                  .selectAll(`g[data-layer='${i}']`)
                  .data(d => {
                    return d[1]
                  })
                  // .join('g')
                  .join(
                    enter => {
                      g = enter.append('g')
                        .attr('class', 'bar-group')
                        .attr('aria-label', d => {
                          // console.log(d)
                          return d[0] // key
                        })
                        .attr('data-layer', i)
                        .attr('opacity', 1)
                    },
                    update => {
                      // console.log('midg', update)
                      let newg = update
                        .attr('class', 'bar-group')
                        .attr('aria-label', d => {
                          // console.log(d)
                          return d[0] // key
                        })
                        .attr('data-layer', i)
                        .transition().duration(this.#transitionDuration)
                        .attr('opacity', 1)
                      g = g.merge(newg)
                    },
                    exit => {
                      //remove rectangles in removed groups to be removed
                      exit.selectAll('rect').transition().duration(this.#transitionDuration)
                        // .attr('opacity', 0)
                        .attr(h, 0)
                        .attr(y, nScale(lowestNValue))
                        .remove()

                      exit.selectAll('text').transition().duration(this.#transitionDuration)
                        .attr(y, nScale(lowestNValue))
                        .remove()

                      //remove groups
                      exit
                        .attr('opacity', 1)
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 0)
                        .remove();
                    }
                  )

                // g
                //   .attr('class', 'bar-group')
                //   .attr('aria-label', d => {
                //     // console.log(d)
                //     return d[0] // key
                //   })
                //   .attr('data-layer', i)
              }
            })

            // console.log(g)

            let updateRect = selection => {
              selection
                .attr('aria-label', d => {
                  return `${d.key}: ${this.#getLabel(d[0], proportional)}`
                })
                .attr(w, function(d) {
                  let value = d3.select(this).attr(w)
                  if (value === null)
                    return barWidth;
                  else
                    return value;
                })
                .attr('class', d => categoryLookup[d.key])
                .attr(x, function(d) {
                  let value = d3.select(this).attr(x)
                  if (value === null)
                    return that.#calcGroupedXPos(d[0].data)
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
                .attr(y, d => {
                  return nScale(d[0][last]);
                })
                .attr(h, d => {
                  let height = nScale(d[0][first]) - nScale(d[0][last])
                  return height == 0 || isNaN(height) ? 0.1 : height
                })
                .attr(x, d => {
                  // console.log(d)
                  // return cScale(d.data[cSeries])
                  return this.#calcGroupedXPos(d[0].data)
                })
                .attr(w, barWidth)
                // .attr('opacity', 1)
                .attr('fill', (d, i) => {
                  let myColour;
                  if (this.#categories.length > 1) {
                    myColour = colourScale(d.key)
                  }
                  else {
                    myColour = this.#colourSeries[rectCount++ % this.#colourSeries.length];
                  }
                  if (this.#textures && this.#textureSeries[i] != 'solid') {
                    return this.#textureSeries[i].url();
                  }
                  return myColour
                })
                .attr('opacity', 1)

              if (this.#interactive) {
                selection.attr('cursor', 'pointer')
              }
            }

            let rect = g.selectAll('rect')
              .data(d => d[1])
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
                  .attr('dominant-baseline', 'middle')
                  .attr('text-anchor', 'middle')
                  //for new text that aren't in new groups, set default values before transition. Avoids transitioning from top left
                  .attr(x, function(d) {
                    let value = d3.select(this).attr(x)
                    if (value === null)
                      return that.#calcGroupedXPos(d[0].data) + barWidth / 2;
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
                    return `bar-label ${categoryLookup[d.key]}-label`
                  })
                  .attr('display', 'block')
                  .transition()
                  .duration(this.#transitionDuration)
                  .attr('fill', d => {
                    return checkContrastToWhite(colourScale(d.key)) ? lightFontColour : darkFontColour;
                  })
                  .attr(x, d => {
                    return this.#calcGroupedXPos(d[0].data) + barWidth / 2
                  })
                  .attr(y, d => {
                    let avg = (d[0][first] + d[0][last]) / 2
                    if (avg != 0) {
                      return nScale(avg)
                    }
                  })
                  .attr('opacity', function(d) {
                    let dimensions = that.#calculateTextDimensions(that.#getLabel(d[0], proportional), that.#getFullFont(this))
                    return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d[0]) ? 1 : 0;
                  })
                  .tween("text", function(d) {
                    let selection = d3.select(this);
                    let oldVal = +selection.text().replace('%', '');
                    // console.log(d)
                    // console.log(that.#getLabel(d[0], proportional))
                    let label = that.#getLabel(d[0], proportional);
                    if (!isNaN(label)) {
                      let newVal = +that.#getLabel(d[0], proportional).toString().replace('%', '');
                      // console.log(newVal)
                      const i = d3.interpolate(+oldVal, newVal);
                      return function(t) {
                        if (newVal % 1 == 0)
                          selection.text(Math.round(i(t)) + (proportional ? '%' : ''));
                        else
                          selection.text(that.#round(i(t)) + (proportional ? '%' : ''));
                      };
                    }
                    else {
                      selection.text("")
                    }
                  })
                  // .tween("text", function(d) {
                  //   let selection = d3.select(this);
                  //   let oldVal = +selection.text().replace('%', '');
                  //   let newVal = d[that.#nKey];
                  //   if (!isNaN(oldVal) && !isNaN(newVal)) {
                  //     const i = d3.interpolate(+oldVal, newVal);
                  //     return function(t) {
                  //       // selection.text(Math.round(i(t)));
                  //       if (that.#decimalType == 'fixed')
                  //         selection.text(d3.format(`.${that.#decimalPlaces}f`)(that.#round(i(t))) + (that.#percent ? '%' : ''))
                  //       else
                  //         selection.text(that.#round(i(t)) + (that.#percent ? '%' : ''));
                  //     };
                  //   }
                  //   else {
                  //     selection
                  //       .text(that.#getLabel(d, proportional))
                  //   }
                  // })
                  .on('end', function(d) {
                    let selection = d3.select(this);
                    selection.attr('display', function(d) {
                      let dimensions = that.#calculateTextDimensions(that.#getLabel(d[0], proportional), that.#getFullFont(this))
                      return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d[0]) ? 'block' : 'none';
                    })
                  })

                selection
                  .on('mouseenter', tooltipEnter)
                  .on('mouseleave', tooltipLeave)
                  .on('mousemove', tooltipMove)
              }

              let text = g
                .selectAll('text')
                .data(d => d[1])
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
      // console.log("groupData", this.#groupData)
      bars
        // Create groups and update loops for data changes
        .selectAll("g[data-layer='0']")
        // .data(groupedData)
        .data(this.#groupData)
        .join(
          enter => {
            // let groups = []

            let g = enter.append('g').attr('class', 'bar-group')
              .attr('aria-label', d => {
                // console.log(d)
                return d[0] // key
              })
              .attr('data-layer', 0)
              .attr('tabindex', -1)

            this.#cSeries.map((c, i) => {
              if (i != 0) {
                g = g
                  .selectAll('g')
                  .data(d => {
                    return d[1]
                  })
                  .join('g')

                g
                  .attr('class', 'bar-group')
                  .attr('aria-label', d => {
                    // console.log(d)
                    return d[0] // key
                  })
                  .attr('data-layer', i)
                  .attr('opacity', 1)
                  .attr('tabindex', -1)
              }
            })

            let rect = g
              .selectAll('rect')
              .data(d => {
                // console.log(d[1]);
                return d[1]
              })
              .join('rect')

            rect
              .attr('tabindex', -1)
              .attr('aria-label', d => {
                if (this.#categoryKey) {
                  return `${d[this.#categoryKey]}: ${d[this.#nKey]}`
                }
                else {
                  return `${this.#getLabel(d, proportional)}`
                }
              })
              .attr('opacity', 1)
              .attr('fill', (d, i) => {
                if (this.#categories.length > 1) {
                  return colourScale(d[this.#categoryKey])
                }
                else {
                  return this.#colourSeries[rectCount++ % this.#colourSeries.length];
                }
              })
              .attr('class', d => {
                return categoryLookup[d[this.#categoryKey]]
              })
              .attr(y, d => {
                return nScale(lowestNValue);
              })
              .attr(x, (d, i) => {
                // return cSubScale(d.type) + cScale(d.cat)
                return cSubScale(d[this.#categoryKey]) + this.#calcGroupedXPos(d)
              })
              .attr(w, barWidth)
              .attr("opacity", 0)
              .transition()
              .duration(this.#transitionDuration)
              .attr("opacity", 1)
              .attr(h, d => {
                let height = Math.abs(nScale(d[this.#nKey]) - nScale(lowestNValue))
                return height == 0 || isNaN(height) ? 0.1 : height
              })
              .attr(y, d => {
                const input = isNaN(d[this.#nKey]) ? 0 : d[this.#nKey];
                return vertical ?
                  nScale(input) :
                  nScale(lowestNValue);
                // return nScale(input)
              })

            rect
              .on('mouseenter', tooltipEnter)
              .on('mouseleave', tooltipLeave)
              .on('mousemove', tooltipMove)

            if (this.#interactive) {
              rect.attr('cursor', 'pointer')
            }

            // creates bar labels
            if (barLabels) {
              let text = g
                .selectAll('text')
                .data(d => d[1])
                .join('text')

              text
                .attr('class', d => {
                  return `bar-label ${categoryLookup[d[this.#categoryKey]]}-label`
                })
                .attr('fill', darkFontColour)
                .attr("alignment-baseline", 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('text-anchor', verticalTextAnchor)
                .attr('opacity', 0)
                .attr(x, (d, i) => {
                  // return cSubScale(d.type) + cScale(d.cat) + barWidth / 2
                  // return cSubScale(d.type) + this.#calcGroupedXPos(d) + barWidth / 2
                  return cSubScale(d[this.#categoryKey]) + this.#calcGroupedXPos(d) + barWidth / 2
                })
                .attr(y, d => {
                  // const input = (typeof d.val !== 'number') ? 0 : d.val;
                  // return nScale(lowestNValue) + (vertical ? -10 : 5);
                  // const input = isNaN(d[this.#nKey]) ? 0 : d[this.#nKey];
                  // const input = isNaN(d[this.#nKey]) ? 0 : (this.#displayUncertainties ? d[this.#upperUncertainty] : d[this.#nKey]);
                  const input = isNaN(d[this.#nKey]) ? 0 : (this.#displayUncertainties && d[this.#upperUncertainty] ? d[this.#upperUncertainty] : d[this.#nKey]);
                  // console.log(input)
                  return nScale(input) + (vertical ? -10 : 5)
                })
                .on('mouseenter', tooltipEnter)
                .on('mouseleave', tooltipLeave)
                .on('mousemove', tooltipMove)

              text
                .transition()
                .duration(this.#transitionDuration)
                .attr(y, d => {
                  // const input = isNaN(d[this.#nKey]) ? 0 : d[this.#nKey];
                  // const input = isNaN(d[this.#nKey]) ? 0 : (this.#displayUncertainties ? d[this.#upperUncertainty] : d[this.#nKey]);
                  const input = isNaN(d[this.#nKey]) ? 0 : (this.#displayUncertainties && d[this.#upperUncertainty] ? d[this.#upperUncertainty] : d[this.#nKey]);
                  return nScale(input) + (vertical ? -10 : 5)
                })
                .attr('opacity', function(d) {
                  let dimensions = that.#calculateTextDimensions(d.val, that.#getFullFont(this))
                  return that.#labelFitsGroupedBar(dimensions.width, dimensions.height, d) ? 1 : 0;
                })
                .tween("text", function(d) {
                  let selection = d3.select(this);
                  let oldVal = +selection.text();
                  let newVal = parseFloat(d[that.#nKey]);
                  // console.log(oldVal, newVal)
                  if (!isNaN(oldVal) && !isNaN(newVal)) {
                    const i = d3.interpolate(+oldVal, newVal);
                    return function(t) {
                      // selection.text(Math.round(i(t)));
                      if (that.#decimalType == 'fixed')
                        selection.text(d3.format(`.${that.#decimalPlaces}f`)(that.#round(i(t))) + (that.#percent ? '%' : ''))
                      else
                        selection.text(that.#round(i(t)) + (that.#percent ? '%' : ''));
                    };
                  }
                  else {
                    selection
                      .text(that.#getLabel(d, proportional))
                  }
                })
                .on('end', function(d) {
                  let selection = d3.select(this);
                  selection.attr('display', function(d) {
                    // let dimensions = that.#calculateTextDimensions(that.#getLabel(d[0], proportional), that.#getFullFont(this))
                    // return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d[0]) ? 'block' : 'none';
                    let dimensions = that.#calculateTextDimensions(d.val, that.#getFullFont(this))
                    return that.#labelFitsGroupedBar(dimensions.width, dimensions.height, d) ? 'block' : 'none';
                  })
                })
            }

            //creates uncertainties
            if (this.#displayUncertainties) {
              g
                .selectAll('g.uncertainty')
                .data(d => d[1])
                .join(
                  enter => {


                    let g = enter.append('g')
                    g
                      .attr('class', 'uncertainty')
                      .attr('data-category', d => categoryLookup[d[this.#categoryKey]])

                    createUncertaintyLine(g, 'top', this.#upperUncertainty, false)
                    createUncertaintyLine(g, 'bottom', this.#lowerUncertainty, false)
                    createUncertaintyLine(g, 'connector')
                  }
                )
            }
          },
          update => {
            // console.log(update)
            let g = update
              .attr('class', 'bar-group')
              .attr('aria-label', d => {
                // console.log(d)
                return d[0] // key
              })

            this.#cSeries.map((c, i) => {
              if (i != 0) {
                g
                  .selectAll(`g[data-layer='${i}']`)
                  .data(d => {
                    return d[1]
                  })
                  // .join('g')
                  .join(
                    enter => {
                      g = enter.append('g')
                        .attr('class', 'bar-group')
                        .attr('aria-label', d => {
                          // console.log(d)
                          return d[0] // key
                        })
                        .attr('data-layer', i)
                        .attr('opacity', 1)
                    },
                    update => {
                      let newg = update
                        .attr('class', 'bar-group')
                        .attr('aria-label', d => {
                          // console.log(d)
                          return d[0] // key
                        })
                        .attr('data-layer', i)
                        .transition().duration(this.#transitionDuration)
                        .attr('opacity', 1)
                      g = g.merge(newg)
                    },
                    exit => {
                      //remove rectangles in removed groups to be removed
                      exit.selectAll('rect').transition().duration(this.#transitionDuration)
                        // .attr('opacity', 0)
                        .attr(h, 0)
                        .attr(y, nScale(lowestNValue))
                        .remove()

                      exit.selectAll('text').transition().duration(this.#transitionDuration)
                        .attr(y, nScale(lowestNValue))
                        .remove()

                      //remove groups
                      exit
                        .attr('opacity', 1)
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 0)
                        .remove();
                    }
                  )

                // g
                //   .attr('class', 'bar-group')
                //   .attr('aria-label', d => {
                //     // console.log(d)
                //     return d[0] // key
                //   })
                //   .attr('data-layer', i)
              }
            })

            let updateRect = selection => {
              selection
                .attr('aria-label', d => {
                  if (this.#categoryKey) {
                    return `${d[this.#categoryKey]}: ${d[this.#nKey]}`
                  }
                  else {
                    return `${this.#getLabel(d, proportional)}`
                  }
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
                    // return cSubScale(d.type) + cScale(d.cat);
                    return cSubScale(d[that.#categoryKey]) + that.#calcGroupedXPos(d)
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
                  if (this.#categories.length > 1) {
                    // return colourScale(d.type)
                    return colourScale(d[this.#categoryKey])
                  }
                  else {
                    return this.#colourSeries[rectCount++ % this.#colourSeries.length];
                  }
                })
                .attr('class', d => categoryLookup[d[this.#categoryKey]])
                .attr(x, (d, i) => {
                  // return cSubScale(d.type) + cScale(d.cat)
                  // return cSubScale(d.type) + this.#calcGroupedXPos(d)
                  // console.log(x, cSubScale(d[this.#categoryKey]) + this.#calcGroupedXPos(d))
                  return cSubScale(d[this.#categoryKey]) + this.#calcGroupedXPos(d)
                })
                .attr(w, barWidth)
                .attr(h, d => {
                  // let height = Math.abs(nScale(d.val) - nScale(lowestNValue))
                  // return height == 0 ? 0.1 : height
                  let height = Math.abs(nScale(d[this.#nKey]) - nScale(lowestNValue))
                  return height == 0 || isNaN(height) ? 0.1 : height
                })
                .attr(y, d => {
                  const input = isNaN(d[this.#nKey]) ? 0 : d[this.#nKey];
                  return vertical ?
                    nScale(input) :
                    nScale(lowestNValue);
                })

              if (this.#interactive) {
                selection.attr('cursor', 'pointer')
              }
            }

            let rect = g
              .selectAll('rect')
              .data(d => d[1])
              .join(
                enter => {
                  updateRect(enter.append('rect'))
                },
                update => {
                  // console.log('updateRect', update)
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

            //update bar Labels
            if (barLabels) {
              let updateText = selection => {
                selection
                  .attr('class', d => {
                    return `bar-label ${categoryLookup[d[this.#categoryKey]]}-label`
                  })
                  .attr("alignment-baseline", 'middle')
                  .attr('dominant-baseline', 'middle')
                  .attr('text-anchor', verticalTextAnchor)
                  .attr(x, function(d, i) {
                    let value = d3.select(this).attr(x)
                    if (value === null)
                      return cSubScale(d[that.#categoryKey]) + that.#calcGroupedXPos(d) + barWidth / 2;
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
                  .attr('display', 'block')
                  .on('mouseenter', tooltipEnter)
                  .on('mouseleave', tooltipLeave)
                  .on('mousemove', tooltipMove)
                // .text(d => (typeof d.val !== 'number') ? 'NA' : d.val);

                selection
                  .transition()
                  .duration(this.#transitionDuration)
                  .attr(y, d => {
                    // const input = (typeof d.val !== 'number') ? 0 : d[this.#nKey];
                    // return nScale(input) + (vertical ? -10 : 5);
                    // const input = isNaN(d[this.#nKey]) ? 0 : d[this.#nKey];
                    // const input = isNaN(d[this.#nKey]) ? 0 : (this.#displayUncertainties ? d[this.#upperUncertainty] : d[this.#nKey]);
                    const input = isNaN(d[this.#nKey]) ? 0 : (this.#displayUncertainties && d[this.#upperUncertainty] ? d[this.#upperUncertainty] : d[this.#nKey]);
                    // console.log('updateY', input)
                    return nScale(input) + (vertical ? -10 : 5)
                  })
                  .attr(x, (d, i) => {
                    // return cSubScale(d.type) + cScale(d.cat) + barWidth / 2;
                    return cSubScale(d[this.#categoryKey]) + this.#calcGroupedXPos(d) + barWidth / 2
                  })
                  .attr('fill', darkFontColour)
                  .attr('opacity', function(d) {
                    let dimensions = that.#calculateTextDimensions(d.val, that.#getFullFont(this))
                    return that.#labelFitsGroupedBar(dimensions.width, dimensions.height, d) ? 1 : 0;
                  })
                  .tween("text", function(d) {
                    let selection = d3.select(this);
                    let oldVal = +selection.text().replace('%', '');
                    let newVal = d[that.#nKey];
                    if (!isNaN(oldVal) && !isNaN(newVal)) {
                      // console.log(newVal)
                      const i = d3.interpolate(+oldVal, newVal);
                      return function(t) {
                        // selection.text(Math.round(i(t)));
                        if (that.#decimalType == 'fixed') {
                          // console.log('fixed')
                          selection.text(d3.format(`.${that.#decimalPlaces}f`)(that.#round(i(t))) + (that.#percent ? '%' : ''))
                        }

                        else {
                          // console.log(that.#round(i(t)))
                          selection.text(that.#round(i(t)) + (that.#percent ? '%' : ''));
                        }

                      };
                    }
                    else {
                      selection
                        .text(that.#getLabel(d, proportional))
                    }
                  })
                  .on('end', function(d) {
                    let selection = d3.select(this);
                    selection.attr('display', function(d) {
                      // let dimensions = that.#calculateTextDimensions(that.#getLabel(d[0], proportional), that.#getFullFont(this))
                      // return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d[0]) ? 'block' : 'none';
                      let dimensions = that.#calculateTextDimensions(d.val, that.#getFullFont(this))
                      return that.#labelFitsGroupedBar(dimensions.width, dimensions.height, d) ? 'block' : 'none';
                    })
                  })
              }

              let text = g
                .selectAll('text')
                .data(d => d[1])
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

            //update uncertainties
            if (this.#displayUncertainties) {
              g
                .selectAll('g.uncertainty')
                .data(d => d[1])
                .join(
                  enter => {
                    let g = enter.append('g')
                    g
                      .attr('class', 'uncertainty')

                    createUncertaintyLine(g, 'top', this.#upperUncertainty, false)
                    createUncertaintyLine(g, 'bottom', this.#lowerUncertainty, false)
                    createUncertaintyLine(g, 'connector')
                  },
                  update => {
                    // console.log('uncertaintyUpdate', update, g)
                    update.transition().duration(this.#transitionDuration)
                      .attr('opacity', 1)
                    this.#updateUncertaintyLine(update.select(`line[data-uncertainty='top']`), this.#upperUncertainty, false)
                    this.#updateUncertaintyLine(update.select(`line[data-uncertainty='bottom']`), this.#lowerUncertainty, false)
                    this.#updateUncertaintyLine(update.select(`line[data-uncertainty='connector']`))
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
            // console.log(exit.selectAll('*'))
            // exit.selectAll('*')
            //   .transition()
            //   .duration(this.#transitionDuration)
            //   .attr('opacity', 0)
            //   .attr(h, 0)
            //   .attr(y, nScale(lowestNValue))
            //   .on('end', () => {
            //     console.log('end remove everything')
            //     exit.remove()
            //   })

            exit.selectAll('rect')
              .transition()
              .duration(this.#transitionDuration)
              .attr('opacity', 0)
              .attr(h, 0)
              .attr(y, nScale(lowestNValue))
              .on('end', () => {
                // console.log('end remove everything')
                exit.remove()
              })

            if (barLabels) {
              exit.selectAll('text')
                .transition()
                .duration(this.#transitionDuration)
                .attr('opacity', 0)
                .attr(y, nScale(lowestNValue))
            }

            if (this.#displayUncertainties) {
              exit.selectAll('g.uncertainty')
                .transition()
                .duration(this.#transitionDuration)
                .attr(y, nScale(lowestNValue))
                .attr('opacity', 0)
            }


          }
        )
    }
  }
  #renderAverageLines() {
    if (!this.#averageGroup)
      this.#averageGroup = this.#container.append('g').attr('class', 'averageLines')

    this.#averageGroup.selectAll("line")
      .data(this.#averageLines)
      .join(
        enter => {
          let line = enter.append('line')
          // .attr("transform", d => `translate(${this.#cScale(d[this.#cKey])}, ${this.#nScale(d[this.#nKey])})`)
          line
            .attr('y1', d => this.#nScale(d))
            .attr('y2', d => this.#nScale(d))
            .attr('x1', this.#margins.l)
            .attr('x2', this.#width - this.#margins.r)
            .attr("stroke", (d, i) => this.#averageLinesColours[i])
            .attr("stroke-width", 2)
            .style("stroke-dasharray", (d, i) => {
              // console.log(d)
              if (!this.#averageLinesType) {
                return 0
              }
              if (this.#averageLinesType[i] == "dashed") {
                return 10
              }
              else if (this.#averageLinesType[i] == "dotted") {
                return 4
              }
              else if (this.#averageLinesType[i] == "solid") {
                return 0
              }
            })
        }
      )
  }
  #renderAverageLinesLegend() {
    this.#legendGroup
      .selectAll('g')
      .data(this.#averageLines)
      .join(
        enter => {
          let lineLength = 30;
          let textOffset = this.#legendTextOffset
          let legendIntervalSpacing = this.#legendCircleSpacing;
          const r = this.#legendRadius;
          const circleSpacing = this.#legendCircleSpacing;
          const spaceFromGraph = this.#legendSpacingFromGraph;
          const heightFromTop = this.#margins.t
          const legendPosition = this.#legendPosition ?? [this.#width - this.#margins.l - this.#margins.r + spaceFromGraph, heightFromTop]

          let g = enter.append('g');
          g
            .attr('class', d => 'legend-group')
            // .attr('data-category', (d, i) => this.#categoryLookup[d])
            // .attr('transform', (d, i) => `translate(${this.#legendOrientation == "h" ? legendIntervalSpacing * i : 0}, ${this.#legendOrientation == "v" ? legendIntervalSpacing * i : 0})`)
            .attr('transform', (d, i) => `translate(${legendPosition[0] - lineLength + (this.#legendOrientation == 'v' ? 0 : circleSpacing * i)}, ${legendPosition[1] + (this.#legendOrientation == 'v' ? circleSpacing * i : 0) + 30})`)
            .attr('opacity', 0)
            .transition()
            .duration(this.#transitionDuration)
            .attr('opacity', 1)

          g.append('line')
            .attr("stroke", (d, i) => this.#averageLinesColours[i])
            .attr("stroke-width", 2)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", lineLength)
            .attr("y2", 0)
            .style("stroke-dasharray", (d, i) => {
              // console.log(d)
              if (!this.#averageLinesType) {
                return 0
              }
              if (this.#averageLinesType[i] == "dashed") {
                return 10
              }
              else if (this.#averageLinesType[i] == "dotted") {
                return 4
              }
              else if (this.#averageLinesType[i] == "solid") {
                return 0
              }
            })
            .attr("opacity", 1)

          let text = g.append('text')
            .attr('x', lineLength + textOffset)
            .attr('y', 0)
            .attr('dy', 0)
            .attr('alignment-baseline', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('opacity', 1)
            .text((d, i) => {
              if (this.#averageLinesLegendText && this.#averageLinesLegendText[i]) {
                return this.#averageLinesLegendText[i]
              }
              return d
            })
        }
      )
  }
  //nested cAxis stuff
  #renderFancyAxes(axesGroup, orientation) {
    let that = this;
    const height = this.#vertical ?
      this.#height - this.#margins.b :
      0;

    let axisInitialHeight = this.#cAxisInitialHeight;
    let axisDrop = this.#cAxisDrop;
    let hAxis;

    function addAxis(selection, axisGen, i, yPos, xPos, series = null, displayPath = true) {
      if (series == null) {
        // console.log("nullPosition", xPos, height)
        hAxis = selection
          .append('g')
          .attr('class', orientation + i)
          .attr('transform', `translate(${xPos}, ${height})`)
          // .attr('transform', `translate(${height}, ${0})`)
          .call(axisGen)
      }
      else {
        // console.log(selection)
        let trans = -that.#cScales[i - 1].bandwidth() / 2
        let transX = that.#vertical ? trans : 0;
        let transY = that.#vertical ? 0 : trans;
        hAxis = selection.selectAll('g')
          .data(series)
          .append('g')
          .attr('transform', `translate(${transX}, ${transY})`)
          .attr('class', orientation + i)
          .call(axisGen)
        // console.log(hAxis)
      }
      let cAxisTitleExists = that.#cAxisTitle && that.#cAxisTitle.trim() != "";
      let wrapWidth = that.#vertical ? that.#cScales[i].bandwidth() + that.#cScales[i].padding() : (cAxisTitleExists ? that.#cAxisTitleSpacing : that.#margins.l); //that.#cAxisTitleSpacing
      let fitWidth = that.#vertical ? (cAxisTitleExists ? that.#cAxisTitleSpacing : that.#margins.b) : (cAxisTitleExists ? that.#cAxisTitleSpacing : that.#margins.l);

      let hAxisYPos = that.#vertical ? yPos : 0;
      let hAxisXPos = that.#vertical ? 0 : yPos;


      if (that.#fitTickText) {
        hAxis
          .selectAll('.tick text')
          .attr('transform', `translate(${hAxisXPos}, ${hAxisYPos})`)
          .call(that.#wrap, wrapWidth)
          .call(that.#fitToConstraints, that.#vertical ? that.#cAxisTitleSpacing : that.#cScales[i].bandwidth() + that.#cScales[i].padding(), that) //that.#cAxisTitleSpacing
        // .call(that.#fitToConstraints, that.#cAxisTitleSpacing, that) //that.#cAxisTitleSpacing
      }
      else {
        hAxis
          .selectAll('.tick text')
          .attr('transform', `translate(${hAxisXPos}, ${hAxisYPos})`)
        // .call(that.#wrap, wrapWidth)
      }




      hAxis
        .selectAll('.tick line')
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('x1', 0)
        .attr('x2', 0)

      if (!displayPath) {
        hAxis.select("path").remove()
      }
    }
    // console.log(this.#axisGens);
    this.#axisGens[orientation].map((cAxisGen, i) => {
      let yPos = that.#vertical ? axisInitialHeight - axisDrop * i : -axisInitialHeight + axisDrop * i;
      let xPos = that.#vertical ? 0 : that.#margins.l;
      if (i == 0) {
        addAxis(axesGroup, cAxisGen, i, yPos, xPos)
      }
      else {
        // console.log(this.#surKeys[i-1])
        addAxis(hAxis, cAxisGen, i, yPos, xPos, this.#surKeys[i - 1], false)
      }
    })
  }
  #renderAxes() {
    const that = this;
    // console.log("axisGens", this.#axisGens)
    // Create subgroup

    if (!this.#axesGroup)
      this.#axesGroup = this.#container.append('g').attr('class', 'axes');
    const axes = this.#axesGroup

    // Render vertical axis
    const v = this.#vertical ? 'n' : 'c';
    if (v != 'c') {
      let vAxis = axes
        .append('g')
        .attr('class', v)
        .attr('transform', `translate(${this.#margins.l},0)`)
        .call(this.#axisGens[v]);
    }
    else {
      this.#renderFancyAxes(axes, v)
      // vAxis
      //   .selectAll('.tick text')
      // .call(this.#wrap, this.#cAxisTitleSpacing - 10) //replace 10 with fontsize of axis title/2, but would need to have the fontsize as a class attribute instead of css (or change load order of render title and renderAxes, then read the fontSize with getCssProperty)
      // .call(this.#fitToConstraints, this.#cScale.bandwidth() + this.#cScale.padding(), this)
    }

    // Render horizontal axis
    const h = this.#vertical ? 'c' : 'n';
    const height = this.#vertical ?
      this.#height - this.#margins.b :
      this.#height - this.#margins.b;
    if (h != 'c') {
      let hAxis = axes
        .append('g')
        .attr('class', h)
        .attr('transform', `translate(0, ${height})`)
        .call(this.#axisGens[h])
    }
    else {
      this.#renderFancyAxes(axes, h)
    }
  }
  #updateAxes() {
    const that = this;
    const axes = this.#axesGroup

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
    else {
      let joinAxisText = () => {
        let arrayOfJoins = [];
        this.#cSeries.map((c, i) => {
          //get text for each cSeries row before being replaced to use for transition comparing down the line
          let cText = []
          axes
            .selectAll(`.${v + i} > .tick > text`)
            .each(el => cText.push(el))
          //ensure the text array is unique to match the domain format
          // myArray.push([... new Set(cText)].join(""))
          arrayOfJoins.push(cText.join(""))
        })
        return arrayOfJoins;
      }
      //get hAxis text
      let vText = joinAxisText();

      //remove axes
      axes.select(`.${v}0`).remove();
      //render axes again
      this.#renderFancyAxes(axes, v)
      //get newly rendered hAxis text
      let newVText = joinAxisText();
      //find which need to be transitioned in by comparing past axis text to new axis text
      this.#cSeries.map((c, i) => {
        if (newVText[i] != vText[i])
          axes.selectAll(`.${v + i} > .tick > text`)
          .attr('opacity', 0)
          .transition().duration(this.#transitionDuration)
          .attr("opacity", 1)
      })
    }

    // update horizontal axis
    const h = this.#vertical ? 'c' : 'n';

    const height = this.#vertical ?
      this.#height - this.#margins.b :
      this.#height - this.#margins.b;

    if (h == 'n') {
      axes
        .select(`.${h}`)
        .transition().duration(this.#transitionDuration)
        .call(this.#axisGens[h]);
    }
    else {
      let joinAxisText = () => {
        let arrayOfJoins = [];
        this.#cSeries.map((c, i) => {
          //get text for each cSeries row before being replaced to use for transition comparing down the line
          let cText = []
          axes
            .selectAll(`.${h + i} > .tick > text`)
            .each(el => cText.push(el))
          //ensure the text array is unique to match the domain format
          // myArray.push([... new Set(cText)].join(""))
          arrayOfJoins.push(cText.join(""))
        })
        return arrayOfJoins;
      }
      //get hAxis text
      let hText = joinAxisText();

      //remove axes
      axes.select(`.${h}0`).remove();
      //render axes again
      this.#renderFancyAxes(axes, h)
      //get newly rendered hAxis text
      let newHText = joinAxisText();
      //find which need to be transitioned in by comparing past axis text to new axis text
      this.#cSeries.map((c, i) => {
        if (newHText[i] != hText[i])
          axes.selectAll(`.${h + i} > .tick > text`)
          .attr('opacity', 0)
          .transition().duration(this.#transitionDuration)
          .attr("opacity", 1)
      })
    }
  }
  #renderTitles() {
    // Create subgroup 
    if (!this.#titleGroup)
      this.#titleGroup = this.#container.append('g').attr('class', 'titles')

    const titles = this.#titleGroup

    const graphTitle = titles.select('.graph-title')

    // Render chart title
    if (graphTitle.empty() && this.#graphTitle) {
      //add title
      titles
        .append('text')
        .attr('class', 'graph-title')
        .attr('x', (this.#width - this.#margins.r) / 2)
        .attr('y', this.#margins.t / 2)
        .attr('opacity', 1)
        .attr('text-anchor', 'middle')
        .text(this.#graphTitle)
        .call(this.#wrap, this.#width)
    }
    else if (!graphTitle.empty() && graphTitle.text() !== this.#graphTitle) {
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
    let vAxisText;
    if (!vAxis.empty()) {
      vAxisText = Array.from(vAxis.selectAll("tspan")._groups[0])
        .map(tspan => d3.select(tspan).text()).join(" ")
    }

    const vtAxisLength = height + this.#margins.t - this.#margins.b

    // Render axis titles
    if (vAxis.empty()) {
      let vt = titles
        .append('text')
        .attr('class', v + '-axis-title')
        .attr('opacity', 1)
        .attr('x', (-height - this.#margins.t + this.#margins.b) / 2)
        .attr('y', () => {
          return this.#margins.l - vSpacing;
        })
        .attr('dy', 0)
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', v == 'c' ? "after-edge" : null)
        .attr('dominant-baseline', v == 'c' ? "hanging" : null)
        .html(vTitle);

      vt.call(this.#wrap, vtAxisLength - vtAxisLength * 0.2)
    }
    else if (vAxisText !== vTitle) {
      // console.log(vAxis.join(" "))

      vAxis
        .attr('opacity', 0)
        .text(vTitle)
        .call(this.#wrap, vtAxisLength - vtAxisLength * 0.2)

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
        .attr('x', (this.#width + this.#margins.l - this.#margins.r) / 2)
        .attr('y', height - this.#margins.b + hSpacing)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', h == 'c' ? "before-edge" : null)
        .attr('dominant-baseline', h == 'c' ? "hanging" : null)
        .html(hTitle);
    }
    else if (hAxis.text() !== hTitle) {
      hAxis
        .attr('opacity', 0)
        .html(hTitle)
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
  #addBarHoverFade() {
    let that = this;
    this.#barGroup
      .on('mouseover.fade', function(e, d) {

        let current = d3.select(e.target)
        let targetClass = current.attr('class')

        that.#barGroup.selectAll(`rect:not(.${targetClass})`)
          .attr('opacity', 0.3)

        that.#barGroup.selectAll(`rect.${targetClass}`)
          .attr('stroke', 'black')
      })
      .on('mouseout.fade', function(e, d) {
        let current = d3.select(e.target)
        let targetClass = current.attr('class')

        d3.selectAll(`rect:not(.${targetClass})`)
          .attr('opacity', 1)

        that.#barGroup.selectAll(`rect.${targetClass}`)
          .attr('stroke', null)
      })

    // console.log(this.#barGroup.selectAll('rect'))
  }
  #addLegendHoverFade() {
    if (!this.#selectedCategories){
      this.#selectedCategories = this.#findSelectedValues();
    }
    // let that = this;
  
    //mouseover
    let fadeOut = (selection) => {
      this.#selectedCategories = this.#findSelectedValues();

        let targetClass = selection.attr('class').split(" ")[0]
        
        this.#selectedCategories = this.#findSelectedValues();
        let selectorArray = [];
        this.#selectedCategories.map(el => {
          if (el != targetClass)
            selectorArray.push(`rect.${el}`);
        })
        
        if (selectorArray.length != 0){
          let selector = selectorArray.join(",");
          let rectGroups = this.#barGroup.selectAll(selector)
          
          rectGroups
            .attr('opacity', 0.3)
        }

        this.#barGroup.selectAll(`rect.${targetClass}`)
          .attr('stroke', 'black')
    }
    
    //mouseout
    let fadeIn = (selection) => {
        
        let targetClass = selection.attr('class').split(" ")[0];
        
        this.#selectedCategories = this.#findSelectedValues();
        let selector = this.#selectedCategories.map(el => `rect.${el}`).join(",");
        let rectGroups = this.#barGroup.selectAll(selector)
        
        // console.log(selector)

        rectGroups //:not(.${targetClass})
          .attr('opacity', 1)

        this.#barGroup.selectAll(`rect.${targetClass}`)
          .attr('stroke', null)
    }

    this.#legendGroup.selectAll('.legend-group')
      .on('mouseover.fade', function(e, d) {
        fadeOut(d3.select(e.target))
      })
      .on('mouseout.fade', function(e, d) {
        fadeIn(d3.select(e.target))
      })
      .on('focus.fade', function(e, d){
        fadeOut(d3.select(e.target).select('circle'))
      })
      .on('focusout.fade', function(e,d){
        fadeIn(d3.select(e.target).select('circle'))
      })


  }
  #addInteraction() {
    const bars = this.#container
    // .select('.bars');

    // const legend = this.#container
    //   .select('.legend');

    const legend = this.#legendGroup;

    // Save private fields (can't access 'this' when rendering bars)
    const that = this;
    const cSeries = this.#cSeries;
    const categories = this.#categories;
    let nScale = this.#nScale;
    const cScale = this.#cScales[this.#cScales.length - 1];
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


    const categoryLookup = this.#categoryLookup;
    const categoryReverseLookup = this.#categoryReverseLookup;

    let collapsed = false;
    let categoriesBeforeCollapse = []

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
      let selector = this.#selectedCategories.map(el => `rect.${el}`).join(",");
      // console.log(selector)
      if (selector.length !== 0) {
        barGroups.selectAll(selector)
          .transition()
          .duration(this.#transitionDuration)
          .attr(w, cSubScale.bandwidth())
          .attr(x, (d, i) => {
            return cSubScale(d[this.#categoryKey]) + this.#calcGroupedXPos(d)
          })
          .attr(h, d => {
            let height = Math.abs(nScale(d[this.#nKey]) - nScale(lowestNValue))
            return height == 0 || isNaN(height) ? 0.1 : height
          })
          .attr(y, d => {
            const input = isNaN(d[this.#nKey]) ? 0 : d[this.#nKey];
            return vertical ?
              nScale(input) :
              nScale(lowestNValue);
          })
          .attr('opacity', 1)
      }
    }

    let shiftSelectedGroupUncertainties = () => {
      let uncertaintySelector = this.#selectedCategories.map(el => `g.uncertainty[data-category='${el}']`);
      // console.log("uncertaintySelector", uncertaintySelector)
      if (uncertaintySelector.length !== 0) {
        //grab those and move them to their new home :D. Before calling the method, hide the ones that don't fit
        bars.selectAll(uncertaintySelector).each(function(d) {
          // console.log(d, this)
          let uncertaintyGroup = d3.select(this)

          that.#updateUncertaintyLine(uncertaintyGroup.select(`line[data-uncertainty='top']`), that.#upperUncertainty, false)
          that.#updateUncertaintyLine(uncertaintyGroup.select(`line[data-uncertainty='bottom']`), that.#lowerUncertainty, false)
          that.#updateUncertaintyLine(uncertaintyGroup.select(`line[data-uncertainty='connector']`))
        })

      }
    }

    let shiftSelectedGroupLabels = () => {
      //for labels that stay
      let textSelector = this.#selectedCategories.map(el => `text.${el}-label`).join(",");
      if (textSelector.length !== 0) {
        let text_labels_stay = bars.selectAll(textSelector)
        text_labels_stay
          .transition()
          .duration(this.#transitionDuration)
          .attr(x, (d, i) => {
            return cSubScale(d[this.#categoryKey]) + this.#calcGroupedXPos(d) + cSubScale.bandwidth() / 2
          })
          .attr(y, d => {
            // const input = isNaN(d[this.#nKey]) ? 0 : d[this.#nKey];
            const input = isNaN(d[this.#nKey]) ? 0 : (this.#displayUncertainties && d[this.#upperUncertainty] ? d[this.#upperUncertainty] : d[this.#nKey]);
            return nScale(input) + (vertical ? -10 : 5)
          })
          .attr('opacity', function(d) {
            let dimensions = that.#calculateTextDimensions(d.val, that.#getFullFont(this))
            return that.#labelFitsGroupedBar(dimensions.width, dimensions.height, d) ? 1 : 0;
          })
      }
    }

    function calculateSubtractionValue(currIndex, removed, d) {
      // if (!proportional) {
      //non-proportional: sum the values of the removed items below the current index
      let subValue = 0

      removed.map(el => {
        let matchedGroup = true;
        cSeries.map(c => {
          if (el.data[c] != d[0].data[c]) {
            matchedGroup = false;
          }
        })
        if (categories.indexOf(el.key) < currIndex &&
          matchedGroup
        ) {
          subValue += el.value;
        }
      })
      return subValue;
      // }
      // else {
      //   //proportional: sum all the removed values in a group. NOT UPDATED
      //   let subValue = 0
      //   removed.map(el => {
      //     if (el.group == d.data[cSeries]) {
      //       subValue += el.value;
      //     }
      //   })
      //   return subValue;
      // }

    }

    let createNewProportionalData = (data, categories) => {

      cKeys = this.#createCKeys(data); // data

      // // Create stack first (data needed for yScale)
      // let stackGen = this.#createStackGen(categories); // categories

      // //if proportional, change the values as a percent value of the total
      // let stackData = this.#createProportionalStackData(data, categories, stackGen); // data, categories, stackGen

      // this.#proportionalStack = this.#rebaseStackData(stackData, cKeys)
      // //convert the stack such that it's rebased on the dependent variables instead of the independent

      this.initData(categories);

      return this.#proportionalStack; //stackData, cKeys
    }

    let getRowIdentifiers = (d) => {
      // console.log(d)
      let identifiers = [];

      this.#cSeries.map(c => {
        identifiers.push(d[0].data[c])
      })

      identifiers.push(d.key)

      return identifiers;
    }

    let getRowInData = (proportionalStack, identifiers, d) => {
      // console.log(subSeries, d)

      // let currentCValues = [];

      // this.#cSeries.map(c => {
      //   currentCValues.push(d[0].data[c])
      // })

      let layer = proportionalStack;

      identifiers.map((cVal, i) => {
        //if its a cSeries value
        if (i < this.#cSeries.length) {
          layer = layer.find(l => l[0] == cVal)[1]
        }
        //else its the category key value
        else {
          // console.log('isolate cat', layer)
          layer = layer.find(l => l.key == cVal)
        }
      })

      // console.log(layer)

      // let numSelected = subSeries.length;
      // let remainder = (i) % numSelected
      // let multiple = Math.floor((i) / numSelected)
      // console.log(proportionalStack, numSelected, i)

      // let row = proportionalStack[multiple][remainder]
      return layer;
    }

    let calculateProportionalYShift = (currIndex, subSeries, proportionalStack, i, notSelected, d) => {
      // for proportional, need to know what the value below it is, and shift to where it will go
      let shiftToY = 0;

      //a value of 0 would just need to return 0, hence the initial value
      if (currIndex > 0) {
        let breakLoop = false;
        //keep looking until either a value is found, or the index becomes negative
        for (let k = 1; currIndex - k > -1 && !breakLoop; k++) {
          let valBelow = categories[currIndex - k]
          let subIndexBelow = subSeries.indexOf(valBelow)
          //if index exists, then a value exists below it
          if (subIndexBelow > -1) {
            // let belowRow = getRowInData(proportionalStack, subSeries, Math.floor(i / notSelected.length) * (cKeys.length) + subIndexBelow, cKeys)
            // let belowRow = getRowInData(proportionalStack, subSeries, Math.floor(i / notSelected.length) * (cKeys.length) + subIndexBelow, cKeys)
            let identifiers = getRowIdentifiers(d);
            identifiers[identifiers.length - 1] = subSeries[subIndexBelow]
            let belowRow = getRowInData(proportionalStack, identifiers)[0];
            shiftToY = belowRow[1]
            breakLoop = true;
          }
        }
      }
      console.log()

      return shiftToY;
    }

    let removeBars = (classVal) => {
      //find selected categories
      this.#selectedCategories = this.#findSelectedValues()

      let subSeries = this.#selectedCategories.map(el => {
        return categoryReverseLookup[el]
      })

      this.#cSubScale = this.#cSubScale.domain(subSeries)

      //find categories that are not selected
      let notSelected = []
      this.#categories.map((el, i) => {
        let translatedEl = categoryLookup[el]
        if (!this.#selectedCategories.includes(translatedEl)) {
          notSelected.push(translatedEl)
        }
      })
      let notSelectorRect = notSelected.map(el => `rect.${el}`).join(",");
      let rectGroups = bars.selectAll(notSelectorRect)


      //is grouped
      if (this.#grouped) {
        let barGroups = bars.selectAll(".bar-group");
        //for selected legend class, remove those bars
        barGroups.selectAll(notSelectorRect)
          .transition()
          .duration(this.#transitionDuration)
          .attr('opacity', 0)
          .attr(y, function(d) {
            return vertical ? bottomAxisPosition : leftAxisPosition
          })
          .attr(h, 0.1)

        // shift bar labels
        if (barLabels) {
          let notSelectorText = notSelected.map(el => `text.${el}-label`).join(",");
          let textGroups = bars.selectAll(notSelectorText)

          //for labels that disappear
          textGroups
            .transition()
            .duration(this.#transitionDuration)
            .attr(y, d => {
              return vertical ? bottomAxisPosition : leftAxisPosition
            })
            .attr('opacity', 0)

          //for labels of still selected values
          shiftSelectedGroupLabels()
        }

        //shift uncertainties
        if (this.#displayUncertainties) {
          let notSelectorText = notSelected.map(el => `g.uncertainty[data-category='${el}']`).join(",");
          let uncertaintyGroups = bars.selectAll(notSelectorText)

          uncertaintyGroups.each(function(d) {
            // console.log(d, this)
            let uncertaintyGroup = d3.select(this)

            that.#updateUncertaintyLineRemove(uncertaintyGroup.select(`line[data-uncertainty='top']`), that.#upperUncertainty)
            that.#updateUncertaintyLineRemove(uncertaintyGroup.select(`line[data-uncertainty='bottom']`), that.#lowerUncertainty)
            that.#updateUncertaintyLineRemove(uncertaintyGroup.select(`line[data-uncertainty='connector']`))
          })

          shiftSelectedGroupUncertainties()
        }

        //move the rest of the selected bars to their respective locations 
        shiftSelectedGroupRect(barGroups)
      }
      //is stacked
      else {
        let proportionalStack = proportional ? createNewProportionalData(this.#data, subSeries) : null;

        let removed = []

        //for bars that need to be removed
        rectGroups
          .transition()
          .duration(this.#transitionDuration)
          .attr(h, 0.1)
          .attr('opacity', 0)
          .attr(y, function(d, i) {
            // let currentClass = d3.select(this).attr('class')
            // let currIndex = categories.indexOf(categoryReverseLookup[currentClass])
            let key = d.key;
            let currIndex = categories.indexOf(key);
            // console.log(d)

            //for each removed 
            removed.push({
              "key": key,
              "data": d[0].data, //group: d[cSeries]
              "value": Math.abs(d[0][last] - d[0][first])
            })

            let subValue = calculateSubtractionValue(currIndex, removed, d)
            // console.log(nScale(d[0][vertical ? first : last] - subValue))
            if (!proportional)
              return nScale(d[0][vertical ? first : last] - subValue);
            else {
              // return nScale((d[last] + d[first]) / 2)
              let shiftToY = calculateProportionalYShift(currIndex, subSeries, proportionalStack, i, notSelected, d)
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
              let currIndex = categories.indexOf(categoryReverseLookup[currentClass])

              let subValue = calculateSubtractionValue(currIndex, removed, d)
              if (!proportional)
                return nScale(d[0][vertical ? first : last] - subValue);
              else {
                // return nScale((d[last] + d[first]) / 2)
                let shiftToY = calculateProportionalYShift(currIndex, subSeries, proportionalStack, i, notSelected, d)
                return nScale(shiftToY)
              }
            })
            .attr('display', 'none')
        }

        // console.log('removed', removed)

        //for bars not removed but that need to slide down
        let selectorRect = this.#selectedCategories.map(el => `rect.${el}`).join(",");

        if (selectorRect.length !== 0) {
          bars.selectAll(selectorRect)
            .transition()
            .duration(this.#transitionDuration)
            .attr(y, function(d, i) {
              // console.log(d)
              if (!proportional) {
                // const input = isNaN(d[this.#nKey]) ? 0 : d[this.#nKey];
                // return vertical ?
                //   nScale(input) :
                //   nScale(lowestNValue);
                // let currentClass = d3.select(this).attr('class')
                let currIndex = categories.indexOf(d.key)

                let subValue = calculateSubtractionValue(currIndex, removed, d)
                // console.log('subValueSlide', subValue, that.#stackData)
                return nScale(d[0][last] - subValue);
              }
              else {
                let identifiers = getRowIdentifiers(d);
                let row = getRowInData(proportionalStack, identifiers, d)[0]
                return nScale(row[last]);
              }

            })
            .attr('opacity', 1)
            .attr(h, (d, i) => {
              if (!proportional) {
                let height = nScale(d[0][first]) - nScale(d[0][last]);
                return height == 0 || isNaN(height) ? 0.1 : height
              }
              else {
                let identifiers = getRowIdentifiers(d);
                let row = getRowInData(proportionalStack, identifiers, d)[0]
                let height = nScale(row[first]) - nScale(row[last]);
                return height == 0 || isNaN(height) ? 0.1 : height;
              }
            })


          if (barLabels) {
            let selectorText = this.#selectedCategories.map(el => `text.${el}-label`).join(",");
            //for text that needs to slide down
            bars.selectAll(selectorText)
              .attr('display', 'block')
              .transition()
              .duration(this.#transitionDuration)
              .attr(y, function(d, i) {
                if (!proportional) {
                  let currentClass = d3.select(this).attr('class').split(" ")[1].replace("-label", "")
                  let currIndex = categories.indexOf(categoryReverseLookup[currentClass])
                  let subValue = calculateSubtractionValue(currIndex, removed, d)
                  return nScale(d[0][vertical ? last : first] - subValue - Math.abs(d[0][last] - d[0][first]) / 2);
                }
                else {
                  let identifiers = getRowIdentifiers(d);
                  let row = getRowInData(proportionalStack, identifiers, d)[0]
                  return nScale(row[vertical ? last : first] - Math.abs(row[last] - row[first]) / 2);
                }

              })
              .attr('opacity', function(d, i) {
                // d = proportional ? getRowInData(proportionalStack, d) : d
                if (proportional) {
                  let identifiers = getRowIdentifiers(d);
                  d = getRowInData(proportionalStack, identifiers, d)
                }
                let dimensions = that.#calculateTextDimensions(that.#getLabel(d[0], proportional), that.#getFullFont(this))
                return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d[0]) ? 1 : 0;
              })
              .tween("text", function(d, i) {
                if (proportional) {
                  let identifiers = getRowIdentifiers(d);
                  let row = getRowInData(proportionalStack, identifiers, d)[0]
                  // let row = d[0]
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
                  // d = proportional ? getRowInData(proportionalStack, d) : d
                  if (proportional) {
                    let identifiers = getRowIdentifiers(d);
                    d = getRowInData(proportionalStack, identifiers, d)
                  }
                  let dimensions = that.#calculateTextDimensions(that.#getLabel(d[0], proportional), that.#getFullFont(this))
                  return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d[0]) ? 'block' : 'none';
                })
              })
          }
        }
      }
    }

    let addBars = (classVal) => {
      this.#selectedCategories = this.#findSelectedValues()
      let subSeries = this.#selectedCategories.map(el => {
        return categoryReverseLookup[el]
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
        if (this.#displayUncertainties) {
          shiftSelectedGroupUncertainties()
        }
      }
      else {
        //stacked
        let removed = []
        let proportionalStack = proportional ? createNewProportionalData(this.#data, subSeries) : null;
        // console.log(proportionalStack)

        let notSelected = []
        this.#categories.map((el, i) => {
          let translatedEl = categoryLookup[el]
          if (!this.#selectedCategories.includes(translatedEl)) {
            notSelected.push(translatedEl)
          }
        })
        // console.log(this.#selectedCategories)
        if (notSelected.length != 0) {
          let notSelector = notSelected.map(el => `rect.${el}`).join(",");
          let rectGroups = bars.selectAll(notSelector)
          rectGroups.each(function(d, i) {
            // let currentClass = d3.select(this).attr('class')

            removed.push({
              "key": d.key,
              "data": d[0].data,
              "value": Math.abs(d[0][last] - d[0][first])
            })
          })
        }


        let selectorRect = this.#selectedCategories.map(el => `rect.${el}`).join(",");
        bars.selectAll(selectorRect)
          .transition()
          .duration(this.#transitionDuration)
          .attr(y, function(d, i) {
            if (!proportional) {
              let currentClass = d3.select(this).attr('class')
              let currIndex = categories.indexOf(categoryReverseLookup[currentClass])

              let subValue = calculateSubtractionValue(currIndex, removed, d)
              return nScale(d[0][last] - subValue);
            }
            else {
              let identifiers = getRowIdentifiers(d);
              let row = getRowInData(proportionalStack, identifiers, d)[0]
              return nScale(row[last]);
            }
          })
          .attr('opacity', 1)
          .attr(h, (d, i) => {
            if (!proportional) {
              let height = nScale(d[0][first]) - nScale(d[0][last]);
              return height == 0 || isNaN(height) ? 0.1 : height
            }
            else {
              let identifiers = getRowIdentifiers(d);
              let row = getRowInData(proportionalStack, identifiers, d)[0]
              let height = nScale(row[first]) - nScale(row[last]);
              return height == 0 || isNaN(height) ? 0.1 : height;
            }
          })

        if (barLabels) {
          let selectorText = this.#selectedCategories.map(el => `text.${el}-label`).join(",");
          bars.selectAll(selectorText)
            .attr('display', 'block')
            .transition()
            .duration(this.#transitionDuration)
            .attr(y, function(d, i) {
              if (!proportional) {
                let currentClass = d3.select(this).attr('class').split(" ")[1].replace("-label", "")
                let currIndex = categories.indexOf(categoryReverseLookup[currentClass])
                let subValue = calculateSubtractionValue(currIndex, removed, d)
                return nScale(d[0][vertical ? last : first] - subValue - Math.abs(d[0][last] - d[0][first]) / 2);
              }
              else {
                let identifiers = getRowIdentifiers(d);
                let row = getRowInData(proportionalStack, identifiers, d)[0]
                return nScale(row[vertical ? last : first] - Math.abs(row[last] - row[first]) / 2);
              }
            })
            .attr('opacity', function(d, i) {
              // d = proportional ? getRowInData(proportionalStack, d) : d
              if (proportional) {
                let identifiers = getRowIdentifiers(d);
                d = getRowInData(proportionalStack, identifiers, d)
              }
              let dimensions = that.#calculateTextDimensions(that.#getLabel(d[0], proportional), that.#getFullFont(this))
              return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d[0]) ? 1 : 0;
            })
            .tween("text", function(d, i) {
              // return d[1] - d[0] + (isProportionalLabel ? '%' : 0);
              if (proportional) {
                let identifiers = getRowIdentifiers(d);
                let row = getRowInData(proportionalStack, identifiers, d)[0]
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
                // d = proportional ? getRowInData(proportionalStack, d) : d
                if (proportional) {
                  let identifiers = getRowIdentifiers(d);
                  d = getRowInData(proportionalStack, identifiers, d)
                }
                let dimensions = that.#calculateTextDimensions(that.#getLabel(d[0], proportional), that.#getFullFont(this))
                return that.#labelFitsStackedBar(dimensions.width, dimensions.height, nScale, d[0]) ? 'block' : 'none';
              })
            })
        }
      }
    }

    let updateNAxis = () => {
      //reinitialize all the nAxis variables to accomodate the removed bars, and update it
      this.initNScale(this.#log, false);

      let nAxisOptions = {};
      let cAxisOptions = {};
      if (this.#gridlines) {
        const gridHeight = this.#height - this.#margins.b - this.#margins.t;
        const gridWidth = this.#width - this.#margins.l - this.#margins.r;
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
        categoriesBeforeCollapse = this.#findSelectedValues()
        circles.each(function(d) {
          let circle = d3.select(this)
          let classVal = circle.attr("class").split(" ")[0]

          if (circle.classed("selected") && classVal != clickedClass) {
            fadeLegendCenter(classVal)

          }
        })
        updateNAxis()
        removeBars()
        collapsed = true;
      }
      else {
        categoriesBeforeCollapse.map(el => {
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
      .on('focus', (e, d) => {
        if (this.#callbackHover) {
          this.#callbackHover(d);
        }
      })

    let legendClicked = (circleSelection) => {
      let last = false;
      selectedValues = this.#findSelectedValues();
      if (selectedValues.length <= 1) {
        last = true;
      }

      collapsed = false;
      let clicked = circleSelection // circleSelection
      let classVal = clicked.attr("class").split(" ")[0]

      if (clicked.classed("selected")) {
        if (last) {
          categories.filter(el => !selectedValues.includes(categoryLookup[el])).map(el => {
            reverseFadeCenter(categoryLookup[el])

          })
          updateNAxis()
          addBars()
        }
        else {
          fadeLegendCenter(classVal)
          updateNAxis()
          removeBars()
        }
      }
      else {
        reverseFadeCenter(classVal)
        updateNAxis()
        addBars()
      }
    }

    //legend interaction
    legend.selectAll('circle')
      .on('click', (e, d) => {
        let selection = d3.select(e.target)
        // legendClicked(selection);
        if (this.#legendInteractionType == "toggle") {
          legendClicked(selection);
        }
        else if (this.#legendInteractionType == 'isolate') {
          barClicked(selection.attr('class').split(' ')[0]);
        }
      });
    legend.selectAll('text')
      .on('click', (e, d) => {
        let clickedClass = d3.select(e.target).attr("class")
        let attachedCircle = legend.selectAll(`circle.${clickedClass}`)
        if (this.#legendInteractionType == "toggle") {
          legendClicked(attachedCircle);
        }
        else if (this.#legendInteractionType == 'isolate') {
          barClicked(clickedClass.split(' ')[0]);
        }
      });

    legend.selectAll('g')
      .on('mouseover', (e, d) => {
        if (this.#callbackLegendHover) {
          this.#callbackLegendHover(d);
        }
      })
      .on('focus', (e, d) => {
        if (this.#callbackLegendHover) {
          this.#callbackLegendHover(d);
        }
      })
  }
  #renderLegend() {
    if (!this.#legendGroup)
      this.#legendGroup = this.#container.append('g').attr('class', 'legend')
    const legend = this.#legendGroup

    // Save private fields (can't access 'this' when rendering items)
    const r = this.#legendRadius;
    const textOffset = this.#legendTextOffset;
    const circleSpacing = this.#legendCircleSpacing;
    const spaceFromGraph = this.#legendSpacingFromGraph;
    const heightFromTop = this.#margins.t
    // console.log("legendPos", this.#l)
    const legendPosition = this.#legendPosition ?? [this.#width - this.#margins.l - this.#margins.r + spaceFromGraph, heightFromTop]

    const colourScale = this.#colourScale;

    const categoryLookup = this.#categoryLookup;

    legend.attr('display', this.#displayLegend ? "block" : "none")

    //dummy legend to get background size
    let dummyLegend = legend.append('g').attr('opacity', 0)

    dummyLegend
      .selectAll('g')
      .data(this.#categories)
      .join(
        (enter) => {
          let g = enter.append('g');

          let circle = g.append('circle')
            .attr('r', r)
            .attr('cx', (d, i) => legendPosition[0] + (this.#legendOrientation == 'v' ? 0 : circleSpacing * i))
            .attr('cy', (d, i) => legendPosition[1] + (this.#legendOrientation == 'v' ? circleSpacing * i : 0))

          let text = g.append('text')
            .attr('alignment-baseline', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('x', (d, i) => legendPosition[0] + textOffset + (this.#legendOrientation == 'v' ? 0 : (circleSpacing) * i))
            .attr('y', (d, i) => legendPosition[1] + (this.#legendOrientation == 'v' ? circleSpacing * i : 0))
          text.text(d => d)
        }
      )

    // background rectangle
    let legendBackground = legend.select(".background-rect").empty() ? legend.append('rect').attr('class', "background-rect") : legend.select(".background-rect")
    //change background rect position and size to fit text/rect/title
    let bounding = dummyLegend.node().getBBox();
    // console.log(bounding)
    let rectPadding = 5
    legendBackground
      .attr('opacity', 0.8)
      .attr('fill', 'white')
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('x', bounding.x - rectPadding)
      .attr('y', bounding.y - rectPadding)
      .attr('width', bounding.width + rectPadding * 2)
      .attr('height', bounding.height + rectPadding * 2)

    let legendGroupBoundings = []
    if (this.#detectLegendSpacing) {
      dummyLegend.selectAll('g').each(function() {
        legendGroupBoundings.push(this.getBBox())
      })
      // console.log(legendGroupBoundings)
    }

    //remove the placeholder/dummy legend
    dummyLegend.remove()

    legend.selectAll('g.legend-group')
      .data(this.#categories)
      .join(
        (enter) => {
          let g = enter.append('g')
            .attr('class', 'legend-group')
            .attr('tabindex', -1);

          //circle
          let circle = g.append('circle')
            .attr('r', r)
            .attr('cx', (d, i) => {
              if (this.#legendItemWrapCounter) {
                return legendPosition[0] + (this.#legendOrientation == 'v' ? circleSpacing * Math.floor(i / this.#legendItemWrapCounter) : circleSpacing * (i % this.#legendItemWrapCounter))
              }
              else if (this.#detectLegendSpacing) {
                let spacing
                if (i == 0) {
                  spacing = 0;
                }
                else {
                  spacing = circleSpacing * i + legendGroupBoundings.filter((el, index) => index < i).reduce((partialSum, el) => partialSum + el.width, 0)
                }
                // console.log(spacing)
                return legendPosition[0] + (this.#legendOrientation == 'v' ? 0 : spacing)
              }
              return legendPosition[0] + (this.#legendOrientation == 'v' ? 0 : circleSpacing * i)

            })
            .attr('cy', (d, i) => {
              if (this.#legendItemWrapCounter) {
                return legendPosition[1] + (this.#legendOrientation == 'v' ? (circleSpacing * (i % this.#legendItemWrapCounter)) : (circleSpacing * Math.floor(i / this.#legendItemWrapCounter)))
              }
              else
              if (this.#detectLegendSpacing) {
                return legendPosition[1] + (this.#legendOrientation == 'v' ? circleSpacing * i : 0)
              }
              return legendPosition[1] + (this.#legendOrientation == 'v' ? circleSpacing * i : 0)

            })
            .attr('class', d => categoryLookup[d])
            .attr('opacity', 0)
            .attr('fill-opacity', 0)
            .attr('fill', (d, i) => {
              let myColour = colourScale(d);
              if (this.#textures && this.#textureSeries[i] != 'solid') {
                return this.#textureSeries[i].url();
              }
              return myColour
            })
            .classed('selected', true)
            .transition()
            .duration(this.#transitionDuration)
            .attr('opacity', 1)
            .attr('fill-opacity', 1)

          //text
          let text = g.append('text')
            .attr('display', this.#hideLegendText ? "none" : "block")
            .attr('class', d => categoryLookup[d])
            .attr('alignment-baseline', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('x', (d, i) => {
              if (!this.#detectLegendSpacing)
                return legendPosition[0] + textOffset + (this.#legendOrientation == 'v' ? 0 : (circleSpacing) * i)
              else {
                let spacing
                if (i == 0) {
                  spacing = 0;
                }
                else {
                  spacing = circleSpacing * i + legendGroupBoundings.filter((el, index) => index < i).reduce((partialSum, el) => partialSum + el.width, 0)
                }
                return legendPosition[0] + textOffset + (this.#legendOrientation == 'v' ? 0 : spacing)
              }
            })
            .attr('y', (d, i) => legendPosition[1] + (this.#legendOrientation == 'v' ? circleSpacing * i : 0))
            .attr('opacity', 0)
            .transition()
            .duration(this.#transitionDuration)
            .attr('opacity', 1)

          text.text(d => d)
          if (this.#interactive) {
            circle.attr('cursor', 'pointer')
            text.attr('cursor', 'pointer')
          }
        },
        (update) => {
          //circle
          let circle = update.select('circle')
            .attr('class', d => categoryLookup[d])
            .classed('selected', true)
            // .attr('opacity', 0)
            .attr('opacity', function(d) {
              // console.log(d)
              let selection = d3.select(this.parentNode)
              // console.log(selection.text(), d)
              if (selection.text() == d) {
                return d3.select(this).attr('opacity')
              }
              return 0
            })
            .attr('fill-opacity', 1)
            .attr('fill', (d, i) => {
              let myColour = colourScale(d);
              if (this.#textures && this.#textureSeries[i] != 'solid') {
                return this.#textureSeries[i].url();
              }
              return myColour
            })
            .attr('r', r)
            .attr('cx', (d, i) => {
              if (!this.#detectLegendSpacing)
                return legendPosition[0] + (this.#legendOrientation == 'v' ? 0 : circleSpacing * i)
              else {
                let spacing
                if (i == 0) {
                  spacing = 0;
                }
                else {
                  spacing = circleSpacing * i + legendGroupBoundings.filter((el, index) => index < i).reduce((partialSum, el) => partialSum + el.width, 0)
                }
                // console.log(spacing)
                return legendPosition[0] + (this.#legendOrientation == 'v' ? 0 : spacing)
              }
            })
            .attr('cy', (d, i) => {
              if (!this.#detectLegendSpacing)
                return legendPosition[1] + (this.#legendOrientation == 'v' ? circleSpacing * i : 0)
              else {
                return legendPosition[1] + (this.#legendOrientation == 'v' ? circleSpacing * i : 0)
              }
            })
            .transition().duration(this.#transitionDuration)
            .attr('opacity', 1)


          //text
          let text = update.select('text')
            .attr('class', function(d) {
              return categoryLookup[d];
            })
            .attr('opacity', function(d) {
              let selection = d3.select(this)
              if (selection.text() == d) {
                return selection.attr('opacity')
              }
              return 0
            })
            // .attr('opacity', 0)
            .attr('display', this.#hideLegendText ? "none" : "block")
            .text(d => d)

          text
            .attr('x', (d, i) => {
              if (!this.#detectLegendSpacing)
                return legendPosition[0] + textOffset + (this.#legendOrientation == 'v' ? 0 : (circleSpacing) * i)
              else {
                let spacing
                if (i == 0) {
                  spacing = 0;
                }
                else {
                  spacing = circleSpacing * i + legendGroupBoundings.filter((el, index) => index < i).reduce((partialSum, el) => partialSum + el.width, 0)
                }
                return legendPosition[0] + textOffset + (this.#legendOrientation == 'v' ? 0 : spacing)
              }
            })
            .attr('y', (d, i) => legendPosition[1] + (this.#legendOrientation == 'v' ? circleSpacing * i : 0))
            .transition()
            .duration(this.#transitionDuration)
            .attr('opacity', 1)


          if (this.#interactive) {
            circle.attr('cursor', 'pointer')
            text.attr('cursor', 'pointer')
          }
        },
        (exit) => {
          // exit.select('text')
          //   .transition()
          //   .duration(this.#transitionDuration)
          //   .attr('opacity', 0)

          // exit.select('circle')
          //   .transition()
          //   .duration(this.#transitionDuration)
          //   .attr('opacity', 0)
          //   .on('end', () => exit.remove())
          exit.remove()
        }
      )

  }
  #findSelectedValues() {
    let selectedValues = [];
    this.#legendGroup.selectAll(`circle.selected`).each(function(d) {
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
    const that = this;
    let layer = 0;

    container
      .on('keydown', (e) => {
        const isContainer = e.target.id == container.attr('id');
        //find which legend values are toggled on or off
        let selectedValues = this.#findSelectedValues();
        // console.log(e)
        let targetSelection = d3.select(e.target);

        if (e.key == 'Enter') {
          //begin inner tabbing between regions
          if (isContainer && selectedValues.length != 1) {
            //merge children bar groups and legend groups to set all the tabbing
            let children = bars.selectAll("g[data-layer='0']")
            let legendGroups = this.#legendGroup.selectAll('.legend-group')
            if (!children.empty()) {
              children
                .attr('tabindex', 0);
              children.node().focus(); //first child
              legendGroups
                .attr('tabindex', 0);

              // console.log('entered container')
            }
          }
          //dont remember, think the idea was that if there's a single rect available, go directly to it and skip the parent groups
          else if (isContainer && selectedValues.length == 1) {
            // console.log('how')
            let rects = bars.selectAll('rect')
              .filter(d => selectedValues.includes(this.#categoryLookup[this.#grouped ? d[this.#categoryKey] : d.key]))
            rects.attr('tabindex', 0)
            rects.node().focus();
            let legendGroups = this.#legendGroup.selectAll('.legend-group')
            legendGroups
              .attr('tabindex', 0);
          }
          //go deeper in grouping on enter
          else if (targetSelection.attr('class') == 'bar-group') {
            let dataLayer = parseInt(targetSelection.attr('data-layer'))
            if (dataLayer + 1 < this.#cSeries.length) {
              //select next bar-group child
              let nextBG = targetSelection.selectAll(`g[data-layer='${dataLayer + 1}']`)
              nextBG.attr('tabindex', 0)
              nextBG.node().focus();
            }
            else {
              //select first child rect
              //set all selectable rectangles tabindex
              let rects = targetSelection.selectAll('rect')
                .filter(d => selectedValues.includes(this.#categoryLookup[this.#grouped ? d[this.#categoryKey] : d.key]))
              rects.attr('tabindex', 0)
              rects.node().focus();
            }


          }
          // like you clicked a rect
          else {
            let selection = d3.select(e.target);
            // console.log('click from enter', e.target)
            //if it's the legend, act like it clicked the circle (didn't want to go rework the legend interactivity)
            if (selection.attr('class') == 'legend-group') {
              selection.select('circle').dispatch('click')
            }
            else {
              selection.dispatch('click')
            }

            //refind the selected values since they changed on click
            selectedValues = this.#findSelectedValues();

            //identify selectable and unselectable rectangles
            let barGroups = bars.selectAll('g');
            let rects = barGroups.selectAll('rect')
              .filter(d => selectedValues.includes(this.#categoryLookup[this.#grouped ? d.type : d.key]))

            let notSelectedRects = barGroups.selectAll('rect')
              .filter(d => !selectedValues.includes(this.#categoryLookup[this.#grouped ? d.type : d.key]))

            //set all tabindexes of selectable and unselectable rectangles
            rects.attr('tabindex', 0)
            notSelectedRects.attr('tabindex', -1)
            selectedValues.length == 1 ? barGroups.attr('tabindex', -1) : barGroups.attr('tabindex', 0)

          }

        }
        //get out of inner indexes, reset to svg
        else if (e.key == 'Escape') {
          bars.selectAll('g').attr('tabindex', -1);
          this.#legendGroup.selectAll('.legend-group').attr('tabindex', -1)
          container.node().focus();
          // console.log('escape')
        }

        //check where in dom. If leaving graph, hide indexes from order.
        else if (e.key == "Tab") {
          // console.log(e)
          let barGroups = bars.selectAll('g');
          let rects = bars.selectAll('rect');
          let legendGroups = this.#legendGroup.selectAll('.legend-group');

          let barArrOfArr = [];
          // let barArr = Array.from(barGroups._groups[0])
          let barArr = [...barGroups, ...legendGroups]
          let legendArr = [...legendGroups]
          this.#cSeries.map((c, i) => {
            barArrOfArr.push(bars.selectAll(`g[data-layer='${i}']`))
          })
          // console.log("tablayers", barArrOfArr)
          // console.log(barArr)
          let rectArr = Array.from(rects._groups[0])

          let barIndex = barArr.indexOf(e.target)
          let rectIndex = rectArr.indexOf(e.target)
          let legendIndex = legendArr.indexOf(e.target)

          // console.log('barIndex', barIndex, 'legendIndex', legendIndex)

          //this chunk controls the tab indexing when moving between group and rect, need to extend between group layers
          if (barIndex != -1 || legendIndex != -1) {
            // console.log('isBarOrLegend')
            //if in a bargroup, not looking at rects
            rects.attr('tabindex', -1)

            //if in a bargroup, turn off the bargroups below it. This makes it so that when you pop out of a subgroup after tabbing through it all, it gets removed from taborder again
            let dataLayer = parseInt(d3.select(e.target).attr('data-layer'));
            this.#cSeries.map((c, i) => {
              if (i > dataLayer) {
                barArrOfArr[i].attr('tabindex', -1)
              }
            })

            //if leaving all the bargroups in either min/max, turn off the bargroups
            if (!e.shiftKey && barIndex == barArr.length - 1) {
              // console.log("leave bar forwards")
              barGroups.attr('tabindex', -1)
            }
            else if (e.shiftKey && barIndex == 0) {
              // console.log("leave bar backwards")
              barGroups.attr('tabindex', -1)
            }
          }
          else if (!e.shiftKey && rectIndex != -1 && rectIndex == rectArr.length - 1) {
            // console.log('is rect')
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

        // console.log(e.target)

        //set all selectable rectangles tabindex
        // let rects = d3.select(e.target.parentNode).selectAll('rect')
        let rects = bars.selectAll('rect')
          .filter(d => {
            return selectedValues.includes(this.#categoryLookup[this.#grouped ? d.type : d.key])
          })

        // console.log('rects', rects)

        let barGroups = bars.selectAll('g');
        let legendGroups = this.#legendGroup.selectAll('.legend-group');


        let barArr = Array.from(barGroups._groups[0])
        let rectArr = Array.from(rects._groups[0])
        let legendArr = [...legendGroups]
        let jointGroups = [...barGroups, ...rects, ...legendGroups]

        let legendClicked = legendArr.includes(e.target.parentNode);

        // console.log(legendClicked);

        //check if any of the outlined groups contain the target. focus it if it is
        if (jointGroups.includes(e.target) || legendClicked) {
          legendGroups.attr('tabindex', 0)
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
          else if (legendClicked) {
            barGroups.attr('tabindex', 0)
            e.target.parentNode.focus()
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
        let legendGroups = that.#legendGroup.selectAll('.legend-group');

        // let jointGroups = Array.from(barGroups._groups[0]) //bar groups
        //   .concat(Array.from(rects._groups[0])) //rect

        let jointGroups = [...barGroups, ...rects, ...legendGroups]

        if (!jointGroups.includes(e.relatedTarget)) {
          rects.attr('tabindex', -1)
          barGroups.attr('tabindex', -1)
          legendGroups.attr('tabindex', -1)
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

    const colourScale = this.#colourScale;
    const categories = this.#categories;
    const cSeries = this.#cSeries;
    const cSeriesLast = this.#cSeries[this.#cSeries.length - 1]

    const tooltipSeries = this.#tooltipSeries ?
      this.#tooltipSeries : [cSeriesLast, ...this.#categories];

    const proportional = this.#proportional;

    // Create tooltip element
    const tooltip = this.#wrapper.select(".tooltip").empty() ?
      this.#wrapper
      .append('div')
      .attr('class', 'tooltip')
      .attr('opacity', 0) :
      this.#wrapper.select(".tooltip")



    const categoryLookup = this.#categoryLookup;
    const categoryReverseLookup = this.#categoryReverseLookup;
    let cKeys = this.#cKeys;

    let findRow = (data, cKey, nKey) => {
      let row = data.find(el => el.key == cKey)
      return row.find(el => el.key == nKey);
    }

    let orientations = ['tr', 'br', 'bl', 'tl']

    // Create event handlers
    let onEnter = (e, d) => {
      // console.log(d)
      if (!Object.keys(d).includes('data')) d.data = d;

      const selectedCategories = this.#findSelectedValues();
      const subSeries = selectedCategories.map(el => categoryReverseLookup[el])
      const proportionalStack = this.#proportionalStack;
      const stackData = this.#stackData;

      // Get series
      let html = '';
      // console.log(cSeriesLast)
      // html += `<span>${cSeriesLast}: ${d.data[cSeriesLast]}</span><br/>`;
      // let key = this.#grouped ? d.key : d.key;
      let key = d[this.#categoryKey] ?? d.key;

      if (this.#tooltipFunction) {
        html = this.#tooltipFunction(d, colourScale(key))
      }
      else {

        let spanAttr = `style="border-left:5px solid ${colourScale(key)}; padding-left:3px"`

        // let value = d.data[key];
        let value = this.#grouped ? this.#getLabel(d, proportional) : this.#getLabel(d[0], proportional);
        // let value = d[this.#nKey]
        // if (!this.#grouped) {
        //   value = this.#round(parseFloat(d[0][1] - d[0][0])) + (this.#proportional ? '%' : '');
        // }
        html += `<div ${spanAttr}>${value} </div>`;
      }

      tooltip
        .html(html)
        .attr('data-orientation', orientations[1])
        .style('opacity', 1)
        .style("display", "block")
    }

    function onLeave(e, d) {
      tooltip
        .style('opacity', 0)
        .style("display", "none")
    }

    function onMove(e, d) {
      // let tooltipRect = tooltip.node().getBoundingClientRect();
      // let tooltipOrientation = tooltip.attr('data-orientation');
      // let multiplierX = tooltipOrientation == orientations[0] || tooltipOrientation == orientations[1] ? 1 : 2
      let gap = 25;
      // let escapesXBounds = false;
      // if (tooltipRect.x + (tooltipRect.width)*multiplierX > window.innerWidth){
      //   escapesXBounds = true;
      // }



      let xPos = e.clientX;
      let yPos = e.clientY;

      // if (escapesXBounds){
      //   gap = -gap
      //   xPos = xPos - tooltipRect.width
      //   tooltip
      //     .attr('data-orientation', orientations[2])
      // } else {
      //   tooltip
      //     .attr('data-orientation', orientations[1])
      // }

      tooltip
        .style("transform", `translateX(${gap}px)`)
        .style("left", `${xPos}px`)
        .style("top", `${yPos}px`)
    }


    return [onEnter, onLeave, onMove];
  }
  #addTable() {
    let data = this.#data;
    // console.log('tableData', this.#data)
    /*
      Adds a table to the #table property. Contains the standard classes typically used on infobase products.
      
      Note: uses #table, #tableSummary, #tableDetails, #data, #cSeries, #categories
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
    
    // visual caption
    if (this.#tableCaption && this.#captionAbove)
        tableDetails.append('p')
            .attr('aria-hidden', true)
            .attr('class', 'caption')
            .text(this.#tableCaption)
    
    const tableContainer = tableDetails.append("div").attr("class", "table-responsive")
    const table = tableContainer.append("table")
      // .attr('id', tableID)
      .attr("class", "wb-table table table-bordered table-striped table-hover")

    if (this.#tableCaption){
      let caption = table.append('caption')
        .text(this.#tableCaption)
        
      caption.classed('wb-inv', this.#captionAbove)
    }
      
    const tr = table.append('thead').append('tr').attr('class', 'bg-primary')
    // let tableArr = this.#data.columns;
    let tableArr = [...this.#cSeries]
    if (this.#categoryKey) {
      tableArr.push(this.#categoryKey)
    }
    tableArr.push(this.#nKey)
    if (this.#displayUncertainties) {
      tableArr.push(this.#upperUncertainty)
      tableArr.push(this.#lowerUncertainty)
    }
    // tableArr.push(this.#cKey)
    // tableArr = tableArr.concat(this.#categories)

    tableArr.map(el => {
      tr.append('th')
        // .style("vertical-align", "top").attr('scope', 'col')
        .text(() => {
          return this.#tableHeaderFunction ? this.#tableHeaderFunction(el) : el
        })
    })

    const tbody = table.append("tbody")

    let language = d3.select('html').attr('lang');

    this.#data.map(row => {
      let tr = tbody.append("tr")

      tableArr.map(el => {
        tr.append('td')
          .attr('data-sort', () => {
            let text = row[el]
            let number = parseFloat(text)
            if (!isNaN(number)) {
              return number
            }
          })
          .html(() => { //security would be better as .text, but want to be able to insert html
            let text = row[el]
            if (this.#tableCellFunction) {
              text = this.#tableCellFunction(text, row, el)
            }

            if (!isNaN(text)) {
              let value = parseFloat(text)
              if (!isNaN(this.#decimalPlaces)) {
                value = this.#round(value)
                if (this.#decimalType == "fixed" && this.#decimalPlaces) {
                  value = value.toFixed(this.#decimalPlaces)

                }
                // console.log(value, this.#decimalPlaces)
              }

              return language == 'fr' ? (value + "").replace('.', ',') : value;
              // return value
            }

            return text
          })
      })
    })
    // console.log("---------", table)
    // $('#' + tableID).DataTable();


    if (language == 'en') {
      $(table.node()).DataTable();
    }
    else {
      $(table.node()).DataTable({
        "language": {
          "sProcessing": "Traitement en cours...",
          "sSearch": "Rechercher&nbsp;:",
          "sLengthMenu": "Afficher _MENU_ &eacute;l&eacute;ments",
          "sInfo": "Affichage de l'&eacute;lement _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
          "sInfoEmpty": "Affichage de l'&eacute;lement 0 &agrave; 0 sur 0 &eacute;l&eacute;ments",
          "sInfoFiltered": "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
          "sInfoPostFix": "",
          "sLoadingRecords": "Chargement en cours...",
          "sZeroRecords": "Aucun &eacute;l&eacute;ment &agrave; afficher",
          "sEmptyTable": "Aucune donn&eacute;e disponible dans le tableau",
          "oPaginate": {
            "sFirst": "Premier",
            "sPrevious": "Pr&eacute;c&eacute;dent",
            "sNext": "Suivant",
            "sLast": "Dernier"
          },
          "oAria": {
            "sSortAscending": ": activer pour trier la colonne par ordre croissant",
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

    // $('#' + tableID).trigger("wb-init.wb-tables")
    // $( ".wb-tables" ).trigger( "wb-init.wb-tables" );
  }
  #dataMinMax(updateCalled) {
    /* gets min and max values in selected dataset */

    let min, max;

    const categoryReverseLookup = this.#categoryReverseLookup;
    let selectedKeys;

    if (updateCalled) {
      selectedKeys = this.#categories;
    }
    else {
      selectedKeys = this.#findSelectedValues().map(el => categoryReverseLookup[el])
      selectedKeys = selectedKeys.length === 0 ? this.#categories : selectedKeys;
    }

    // computes min max across stack data
    if (!this.#grouped) {

      //find/sum local (one bar) min/max, compare against global (all bars) min/max. replace as logical
      // this.#stackData.map((el, i) => {
      //   let thisMin;
      //   let thisMax;

      //   el.map(rectData => {

      //     thisMin = thisMin ? (rectData[0] < thisMin ? rectData[0] : thisMin) : rectData[0];
      //     if (selectedKeys.includes(rectData.key)) {
      //       thisMax = thisMax ? (thisMax + rectData[1] - rectData[0]) : rectData[1] - rectData[0];
      //     }
      //   })
      //   if (!min) {
      //     min = thisMin
      //   }
      //   else {
      //     min = thisMin < min ? thisMin : min;
      //   }
      //   if (!max) {
      //     max = thisMax
      //   }
      //   else {
      //     max = thisMax > max ? thisMax : max;
      //   }
      // })

      let cmp = function(a, b) {
        if (a > b) return +1;
        if (a < b) return -1;
        return 0;
      }
      let sortedData = [...this.#data].sort((a, b) => {
        let compareArr = []
        this.#cSeries.map(c => {
          compareArr.push(cmp(a[c], b[c]))
        })
        let result;
        compareArr.map(el => {
          if (!result) {
            result = el
          }
          else {
            result = result || el;
          }
        })
        // console.log(result, compareArr[0] || compareArr[1])
        return result;
      })

      let sumPerStack = []
      // let lastCKey = this.#cSeries[this.#cSeries.length -1]
      // console.log(this.#data.sort((a,b) => a[lastCKey] - b[lastCKey]))
      // console.log(this.#stackData)
      sortedData.map((el, i) => {

        if (selectedKeys.includes(el[this.#categoryKey])) {
          let index = parseInt(i / this.#categories.length)
          // console.log(index, el[this.#nKey])
          if (!sumPerStack[index]) {
            sumPerStack[index] = 0.0;
          }
          let value = isNaN(el[this.#nKey]) ? 0 : parseFloat(el[this.#nKey])
          sumPerStack[index] = +parseFloat(sumPerStack[index] + value).toFixed(10)

          // max = max ? (currMax > max ? currMax : max) : currMax

          // min = min ? (curr < min ? curr : min) : curr
        }
      })
      // console.log(sumPerStack)
      min = d3.min(sumPerStack)
      max = d3.max(sumPerStack)
    }

    // computes min max across raw data
    else {
      this.#data.map(el => {
        if (selectedKeys.includes(el[this.#categoryKey])) {
          let curr = +el[this.#nKey]
          let currMax = curr;
          if (this.#displayUncertainties && +el[this.#upperUncertainty]) {
            currMax = curr > +el[this.#upperUncertainty] ? curr : +el[this.#upperUncertainty]
          }
          max = max ? (currMax > max ? currMax : max) : currMax

          min = min ? (curr < min ? curr : min) : curr
        }
      })
    }

    return [min, max];
  }
  #wrap(text, width) {
    let that = this;
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
  //#endregion
}
