export class Map {
    //FIELDS
    #wrapper;
    #container;
    #ptGroup;
    #rvGroup;
    #invisGroup;
    #legendGroup;
    #canadaGroup;
    #markerGroup;

    //region identifiers
    #regionId = "PRUID";
    #regionName = "PRENAME";
    #markerRegionId = "Province";

    //toggles
    #interactive = false;
    #displayValues = false;
    #tooltips = false;
    #suppressed = false;
    #notApplicable = false;
    #percent = false;
    #canadaBubble = false;
    #zoomable = false;
    #SINotation = false;
    #legendGradient = false;

    #numberSeperator = ",";
    #numberFormat;
    #defaultNumberFormat = d3.format(",");


    #canadaValue;
    #canadaRadius;
    #canadaPosition = [225, 75];

    //callbacks
    #callbackClick;
    #callbackHover;
    #callbackZoom;

    //formatters
    #tooltipFunction;

    //Accessibility
    #figureAriaLabel = "Map of Canada";
    #figureAriaDescription = 'Contains different regions within Canada. Press the "Enter" key to tab through the regions. To exit the map, either tab through all the regions or press the "Escape" key';

    //legend
    #legendIntervals;
    #legendValues;
    #legendRectangleWidth = 100;
    #legendRectangleWidthReduction = 15;
    #legendRectangleHeight = 16;
    #legendSpacing = [15, 22];
    #legendPosition = [650, 60];
    #legendTitleHeight = 50;
    #legendTitleWidth = 300;
    #legendTitleX = 0;
    #legendTitle = "Legend title";
    #decimalPlaces = 0;
    #suppressedText = "Suppressed"
    #suppressedLabel = 'suppr.'
    #notApplicableText = "Not available"
    #notApplicableLabel = 'n/a';
    
    #customLegendTextSeries;

    //map
    #xMap = -500;
    #yMap = 800;
    #mapScale = 0.00015;
    #projection;
    #path;

    #currentZoomScale;
    #currentZoomTransform;



    #transitionDuration = 1000;

    #mapData; //to draw the map
    #data; //to add values to map
    #markerData;

    #markerRadius = 10;
    #markerOpacity = 0.5;
    #markerColour = 'black';
    #markerZoomScaler = 0.5;


    #width = 900;
    #height = 700;
    #colourSeries = ["#0868ac", "#43a2ca", "#7bccc4", "#bae4bc", "#f0f9e8", "#D3D3D3", 'white'];
    #defaultColour = "#43a2ca";
    #borderColour = "gray";
    #borderHighlightColour = 'black';
    #borderWidth = 1;
    #borderHighlightWidth = 2;

    //region values
    #minRadius = 20;
    #fontSize = 15;
    #offsetNB = [0, 55] //NB
    #offsetNS = [55, 20] //NS
    #offsetPEI = [65, -15] //PEI

    //lookups
    #provinceLookupByAbbr = {
        "QC": "Quebec",
        "NL": "Newfoundland and Labrador",
        "BC": "British Columbia",
        "NU": "Nunavut",
        "NT": "Northwest Territories",
        "NB": "New Brunswick",
        "NS": "Nova Scotia",
        "SK": "Saskatchewan",
        "AB": "Alberta",
        "PE": "Prince Edward Island",
        "YT": "Yukon",
        "MB": "Manitoba",
        "ON": "Ontario"
    };
    #provinceLookupByPRUID = {
        "24": "QC",
        "10": "NL",
        "59": "BC",
        "62": "NU",
        "61": "NT",
        "13": "NB",
        "12": "NS",
        "47": "SK",
        "48": "AB",
        "11": "PE",
        "60": "YT",
        "46": "MB",
        "35": "ON"
    };

    //Chain methods
    wrapper(input) {
        if (arguments.length === 0) {
            return this.#wrapper;
        }
        else {
            this.#wrapper = input
            return this;
        }
    }
    container(input) {
        if (arguments.length === 0) {
            return this.#container;
        }
        else {
            this.#container = input
            return this;
        }
    }
    regionId(input) {
        if (arguments.length === 0) {
            return this.#regionId;
        }
        else {
            this.#regionId = input
            return this;
        }
    }
    regionName(input) {
        if (arguments.length === 0) {
            return this.#regionName;
        }
        else {
            this.#regionName = input
            return this;
        }
    }
    markerRegionId(input) {
        if (arguments.length === 0) {
            return this.#markerRegionId;
        }
        else {
            this.#markerRegionId = input
            return this;
        }
    }
    xMap(input) {
        if (arguments.length === 0) {
            return this.#xMap;
        }
        else {
            this.#xMap = input
            return this;
        }
    }
    mapScale(input) {
        if (arguments.length === 0) {
            return this.#mapScale;
        }
        else {
            this.#mapScale = input
            return this;
        }
    }
    projection(input) {
        if (arguments.length === 0) {
            return this.#projection;
        }
        else {
            this.#projection = input
            return this;
        }
    }
    path(input) {
        if (arguments.length === 0) {
            return this.#path;
        }
        else {
            this.#path = input
            return this;
        }
    }
    mapData(input) {
        if (arguments.length === 0) {
            return this.#mapData;
        }
        else {
            this.#mapData = input
            return this;
        }
    }
    data(input) {
        if (arguments.length === 0) {
            return this.#data;
        }
        else {
            this.#data = input
            return this;
        }
    }
    markerData(input) {
        if (arguments.length === 0) {
            return this.#markerData;
        }
        else {
            this.#markerData = input
            return this;
        }
    }
    markerRadius(input) {
        if (arguments.length === 0) {
            return this.#markerRadius;
        }
        else {
            this.#markerRadius = input
            return this;
        }
    }
    markerOpacity(input) {
        if (arguments.length === 0) {
            return this.#markerOpacity;
        }
        else {
            this.#markerOpacity = input
            return this;
        }
    }
    markerColour(input) {
        if (arguments.length === 0) {
            return this.#markerColour;
        }
        else {
            this.#markerColour = input
            return this;
        }
    }
    markerZoomScaler(input) {
        if (arguments.length === 0) {
            return this.#markerZoomScaler;
        }
        else {
            this.#markerZoomScaler = input
            return this;
        }
    }
    width(input) {
        if (arguments.length === 0) {
            return this.#width;
        }
        else {
            this.#width = input
            return this;
        }
    }
    height(input) {
        if (arguments.length === 0) {
            return this.#height;
        }
        else {
            this.#height = input
            return this;
        }
    }
    ptGroup(input) {
        if (arguments.length === 0) {
            return this.#ptGroup;
        }
        else {
            this.#ptGroup = input
            return this;
        }
    }
    legendGroup(input) {
        if (arguments.length === 0) {
            return this.#legendGroup;
        }
        else {
            this.#legendGroup = input
            return this;
        }
    }
    rvGroup(input) {
        if (arguments.length === 0) {
            return this.#rvGroup;
        }
        else {
            this.#rvGroup = input
            return this;
        }
    }
    invisGroup(input) {
        if (arguments.length === 0) {
            return this.#invisGroup;
        }
        else {
            this.#invisGroup = input
            return this;
        }
    }
    canadaGroup(input) {
        if (arguments.length === 0) {
            return this.#canadaGroup;
        }
        else {
            this.#canadaGroup = input
            return this;
        }
    }
    markerGroup(input) {
        if (arguments.length === 0) {
            return this.#markerGroup;
        }
        else {
            this.#markerGroup = input
            return this;
        }
    }
    currentZoomScale(input) {
        if (arguments.length === 0) {
            return this.#currentZoomScale;
        }
        else {
            this.#currentZoomScale = input
            return this;
        }
    }
    currentZoomTransform(input) {
        if (arguments.length === 0) {
            return this.#currentZoomTransform;
        }
        else {
            this.#currentZoomTransform = input
            return this;
        }
    }


    // #currentZoomScale;
    // #currentZoomTransform;

    canadaValue(input) {
        if (arguments.length === 0) {
            return this.#canadaValue;
        }
        else {
            this.#canadaValue = input
            return this;
        }
    }
    canadaRadius(input) {
        if (arguments.length === 0) {
            return this.#canadaRadius;
        }
        else {
            this.#canadaRadius = input
            return this;
        }
    }
    canadaPosition(input) {
        if (arguments.length === 0) {
            return this.#canadaPosition;
        }
        else {
            const nonEmptyArray = (typeof input == typeof []) &&
                (input.length == 2);
            let allInts = true;

            if (nonEmptyArray) {
                for (let element of input) {
                    if (typeof element != typeof 5) {
                        allInts = false;
                        break;
                    }
                }
            }

            // Set field
            if (nonEmptyArray && allInts) {
                this.#canadaPosition = input
                return this;
            }
            else {
                console.error('canadaPosition must be an array of 2 numbers, where the array [x, y] represent the x and y position of the canada region value group');
            }
        }
    }
    legendIntervals(input) {
        //expects input = array of 4 int numbers
        //TODO: Allow non-integer numbers, of varying sizes.
        if (arguments.length === 0) {
            return this.#legendIntervals;
        }
        else {
            const nonEmptyArray = (typeof input == typeof []) 
            // &&
            //     (input.length == 4);
            let allInts = true;
            let decrementing = true;
            let lastElement;

            if (nonEmptyArray) {
                for (let element of input) {
                    if (typeof element != typeof 5) {
                        allInts = false;
                        break;
                    }
                    if (lastElement && lastElement < element) {
                        decrementing = false;
                        break;
                    }
                    lastElement = element;
                }
            }

            // Set field
            if (nonEmptyArray && allInts && decrementing) {
                this.#legendIntervals = input
                return this;
            }
            else {
                console.error('legendIntervals must be an array of decrementing integers');
            }
        }
    }
    customLegendTextSeries(input) {
        if (arguments.length === 0) {
            return this.#customLegendTextSeries;
        }
        else {
            this.#customLegendTextSeries = input
            return this;
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
    minRadius(input) {
        if (arguments.length === 0) {
            return this.#minRadius;
        }
        else {
            const validNum = (typeof input == typeof 5) &&
                (input > 0);

            if (validNum) {
                this.#minRadius = input
                return this;
            }
            else {
                console.error('minRadius must be a number greater than 0');
            }
        }
    }
    fontSize(input) {
        if (arguments.length === 0) {
            return this.#fontSize;
        }
        else {
            const validNum = (typeof input == typeof 5) &&
                (input > 0);

            if (validNum) {
                this.#fontSize = input
                return this;
            }
            else {
                console.error('fontSize must be a number greater than 0');
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
                this.#transitionDuration = input
                return this;
            }
            else {
                console.error('transitionDuration must be a non-negative number');
            }
        }
    }
    numberFormat(input) {
        if (arguments.length === 0) {
            return this.#numberFormat;
        }
        else {
            this.#numberFormat = input
            return this;
        }
    }
    numberSeperator(input) {
        if (arguments.length === 0) {
            return this.#numberSeperator;
        }
        else {
            this.#numberSeperator = input
            return this;
        }
    }
    legendRectangleWidth(input) {
        if (arguments.length === 0) {
            return this.#legendRectangleWidth;
        }
        else {
            const validNum = (typeof input == typeof 5) &&
                (input > 0);

            if (validNum) {
                this.#legendRectangleWidth = input
                return this;
            }
            else {
                console.error('legendRectangleWidth must be a number greater than 0');
            }
        }
    }
    legendRectangleWidthReduction(input) {
        if (arguments.length === 0) {
            return this.#legendRectangleWidthReduction;
        }
        else {
            const validNum = (typeof input == typeof 5) &&
                (input >= 0);

            if (validNum) {
                this.#legendRectangleWidthReduction = input
                return this;
            }
            else {
                console.error('legendRectangleWidthReduction must be a non-negative number');
            }
        }
    }
    legendRectangleHeight(input) {
        if (arguments.length === 0) {
            return this.#legendRectangleHeight;
        }
        else {
            const validNum = (typeof input == typeof 5) &&
                (input >= 0);

            if (validNum) {
                this.#legendRectangleHeight = input
                return this;
            }
            else {
                console.error('legendRectangleHeight must be a non-negative number');
            }
        }
    }
    legendSpacing(input) {
        if (arguments.length === 0) {
            return this.#legendSpacing;
        }
        else {
            const nonEmptyArray = (typeof input == typeof []) &&
                (input.length == 2);
            let allInts = true;

            if (nonEmptyArray) {
                for (let element of input) {
                    if (typeof element != typeof 5) {
                        allInts = false;
                        break;
                    }
                }
            }

            // Set field
            if (nonEmptyArray && allInts) {
                this.#legendSpacing = input
                return this;
            }
            else {
                console.error('legendSpacing must be an array of 2 numbers, where the numbers represent the x and y spacing of the legend rectangles');
            }
        }
    }
    legendPosition(input) {
        if (arguments.length === 0) {
            return this.#legendPosition;
        }
        else {
            const nonEmptyArray = (typeof input == typeof []) &&
                (input.length == 2);
            let allInts = true;

            if (nonEmptyArray) {
                for (let element of input) {
                    if (typeof element != typeof 5) {
                        allInts = false;
                        break;
                    }
                }
            }

            // Set field
            if (nonEmptyArray && allInts) {
                this.#legendPosition = input
                return this;
            }
            else {
                console.error('legendPosition must be an array of 2 numbers, where the numbers represent the x and y translation of the legend group');
            }
        }
    }
    legendTitleHeight(input) {
        if (arguments.length === 0) {
            return this.#legendTitleHeight;
        }
        else {
            const validNum = (typeof input == typeof 5);

            if (validNum) {
                this.#legendTitleHeight = input
                return this;
            }
            else {
                console.error('legendTitleHeight must be a number');
            }
        }
    }
    legendTitleWidth(input) {
        if (arguments.length === 0) {
            return this.#legendTitleWidth;
        }
        else {
            const validNum = (typeof input == typeof 5) &&
                (input > 0);

            if (validNum) {
                this.#legendTitleWidth = input
                return this;
            }
            else {
                console.error('legendTitleWidth must be a number greater than 0');
            }
        }
    }
    legendTitleX(input) {
        if (arguments.length === 0) {
            return this.#legendTitleX;
        }
        else {
            const validNum = (typeof input == typeof 5);

            if (validNum) {
                this.#legendTitleX = input
                return this;
            }
            else {
                console.error('legendTitleX must be a number');
            }
        }
    }
    legendTitle(input) {
        if (arguments.length === 0) {
            return this.#legendTitle;
        }
        else {
            const validString = (typeof input == typeof 'abc') && input;

            if (validString) {
                this.#legendTitle = input
                return this;
            }
            else {
                console.error('legendTitle must be a non-empty string');
            }
        }
    }
    decimalPlaces(input) {
        if (arguments.length === 0) {
            return this.#decimalPlaces;
        }
        else {
            const validNum = (typeof input == typeof 5) &&
                (input >= 0);

            if (validNum) {
                this.#decimalPlaces = parseInt(input)
                return this;
            }
            else {
                console.error('decimalPlaces must be an integer number greater or equal to 0');
            }
        }
    }
    offsetNB(input) {
        if (arguments.length === 0) {
            return this.#offsetNB;
        }
        else {
            const nonEmptyArray = (typeof input == typeof []) &&
                (input.length == 2);
            let allInts = true;

            if (nonEmptyArray) {
                for (let element of input) {
                    if (typeof element != typeof 5) {
                        allInts = false;
                        break;
                    }
                }
            }

            // Set field
            if (nonEmptyArray && allInts) {
                this.#offsetNB = input
                return this;
            }
            else {
                console.error('offsetNB must be an array of 2 numbers, where the array [x, y] represent the x and y offset of the value circle from the New Brunswick group');
            }
        }
    }
    offsetNS(input) {
        if (arguments.length === 0) {
            return this.#offsetNS;
        }
        else {
            const nonEmptyArray = (typeof input == typeof []) &&
                (input.length == 2);
            let allInts = true;

            if (nonEmptyArray) {
                for (let element of input) {
                    if (typeof element != typeof 5) {
                        allInts = false;
                        break;
                    }
                }
            }

            // Set field
            if (nonEmptyArray && allInts) {
                this.#offsetNS = input
                return this;
            }
            else {
                console.error('offsetNB must be an array of 2 numbers, where the array [x, y] represent the x and y offset of the value circle from the New Brunswick group');
            }
        }
    }
    offsetPEI(input) {
        if (arguments.length === 0) {
            return this.#offsetPEI;
        }
        else {
            const nonEmptyArray = (typeof input == typeof []) &&
                (input.length == 2);
            let allInts = true;

            if (nonEmptyArray) {
                for (let element of input) {
                    if (typeof element != typeof 5) {
                        allInts = false;
                        break;
                    }
                }
            }

            // Set field
            if (nonEmptyArray && allInts) {
                this.#offsetPEI = input
                return this;
            }
            else {
                console.error('offsetNB must be an array of 2 numbers, where the array [x, y] represent the x and y offset of the value circle from the New Brunswick group');
            }
        }
    }
    defaultColour(input) {
        if (arguments.length === 0) {
            return this.#defaultColour;
        }
        else {
            this.#defaultColour = input
            return this;
        }
    }
    borderColour(input) {
        if (arguments.length === 0) {
            return this.#borderColour;
        }
        else {
            this.#borderColour = input
            return this;
        }
    }
    borderHighlightColour(input) {
        if (arguments.length === 0) {
            return this.#borderHighlightColour;
        }
        else {
            this.#borderHighlightColour = input
            return this;
        }
    }
    borderWidth(input) {
        if (arguments.length === 0) {
            return this.#borderWidth;
        }
        else {
            this.#borderWidth = input
            return this;
        }
    }
    borderHighlightWidth(input) {
        if (arguments.length === 0) {
            return this.#borderHighlightWidth;
        }
        else {
            this.#borderHighlightWidth = input
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
    callbackZoom(input) {
        if (arguments.length === 0) {
            return this.#callbackZoom;
        }
        else {
            this.#callbackZoom = input
            return this;
        }
    }

    //formatters
    tooltipFunction(input) {
        if (arguments.length === 0) {
            return this.#tooltipFunction;
        }
        else {
            this.#tooltipFunction = input
            return this;
        }
    }

    //Chaining toggle methods
    interactive(input) {
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
            const validBool = (typeof input == typeof true);

            if (validBool) {
                this.#interactive = input;
                return this;
            }
            else {
                console.error('interactive must be a boolean');
            }
        }
    }
    displayValues(input) {
        /*
        Parameters 
        ----------------
        inputToggle (type: bool)
          - True to make the graph display region values. False otherwise.
        */
        if (arguments.length === 0) {
            return this.#displayValues;
        }
        else {
            const validBool = (typeof input == typeof true);

            if (validBool) {
                this.#displayValues = input;
                return this;
            }
            else {
                console.error('displayValues must be a boolean');
            }
        }
    }
    tooltips(input) {
        /*
        Parameters 
        ----------------
        inputToggle (type: bool)
          - True to make the graph display region values. False otherwise.
        */
        if (arguments.length === 0) {
            return this.#tooltips;
        }
        else {
            const validBool = (typeof input == typeof true);

            if (validBool) {
                this.#tooltips = input;
                return this;
            }
            else {
                console.error('tooltips must be a boolean');
            }
        }
    }
    notApplicable(input) {
        /*
        Parameters 
        ----------------
        inputToggle (type: bool)
          - True to make the legend display the notApplicable.
        */
        if (arguments.length === 0) {
            return this.#notApplicable;
        }
        else {
            const validBool = (typeof input == typeof true);

            if (validBool) {
                this.#notApplicable = input;
                return this;
            }
            else {
                console.error('notApplicable must be a boolean');
            }
        }
    }
    suppressed(input) {
        /*
        Parameters 
        ----------------
        inputToggle (type: bool)
          - True to make the legend display the suppressed.
        */
        if (arguments.length === 0) {
            return this.#suppressed;
        }
        else {
            const validBool = (typeof input == typeof true);

            if (validBool) {
                this.#suppressed = input;
                return this;
            }
            else {
                console.error('suppressed must be a boolean');
            }
        }
    }
    percent(input) {
        /*
        Parameters 
        ----------------
        inputToggle (type: bool)
          - True to make the graph display region values. False otherwise.
        */
        if (arguments.length === 0) {
            return this.#percent;
        }
        else {
            const validBool = (typeof input == typeof true);

            if (validBool) {
                this.#percent = input;
                return this;
            }
            else {
                console.error('percent must be a boolean');
            }
        }
    }
    canadaBubble(input) {
        /*
        Parameters 
        ----------------
        inputToggle (type: bool)
          - True to make the graph display region values. False otherwise.
        */
        if (arguments.length === 0) {
            return this.#canadaBubble;
        }
        else {
            const validBool = (typeof input == typeof true);

            if (validBool) {
                this.#canadaBubble = input;
                return this;
            }
            else {
                console.error('canadaBubble must be a boolean');
            }
        }
    }
    zoomable(input) {
        /*
        Parameters 
        ----------------
        inputToggle (type: bool)
          - True to make the graph zoomable.
        */
        if (arguments.length === 0) {
            return this.#zoomable;
        }
        else {
            const validBool = (typeof input == typeof true);

            if (validBool) {
                this.#zoomable = input;
                return this;
            }
            else {
                console.error('zoomable must be a boolean');
            }
        }
    }
    SINotation(input) {
        /*
        Parameters 
        ----------------
        inputToggle (type: bool)
          - True to make the graph zoomable.
        */
        if (arguments.length === 0) {
            return this.#SINotation;
        }
        else {
            const validBool = (typeof input == typeof true);

            if (validBool) {
                this.#SINotation = input;
                return this;
            }
            else {
                console.error('SINotation must be a boolean');
            }
        }
    }
    legendGradient(input) {
        /*
        Parameters 
        ----------------
        inputToggle (type: bool)
          - True to make the graph zoomable.
        */
        if (arguments.length === 0) {
            return this.#legendGradient;
        }
        else {
            const validBool = (typeof input == typeof true);

            if (validBool) {
                this.#legendGradient = input;
                return this;
            }
            else {
                console.error('legendGradient must be a boolean');
            }
        }
    }

    //PUBLIC
    init() {
        this.#initProjection();
        this.#initPath();
        this.#initNumberFormat();

        this.#initContainer();
        this.#initPtGroup(); // bottom layer
        this.#initRvGroup();
        this.#initMarkerGroup();
        this.#initCanadaGroup();
        this.#initInvisGroup(); //interactive layer

        return this;
    }

    render() {
        if (this.#data) {
            this.#renderLegend();
        }
        this.#renderMap();
        if (this.#data && this.#displayValues) {
            this.#renderRegionValues();
        }
        if (this.#markerData) {
            this.#renderMarkers();
        }
        if (this.#canadaBubble) {
            this.#renderCanadaBubble()
        }
        this.#renderInvisMap();

        if (this.#markerData) {
            this.#renderMarkers(this.#invisGroup, true)
        }

        this.#setTabbing(this.#container);
        if (this.#zoomable)
            this.#zoom();

        return this;
    }

    updateValues(newData) {
        const that = this;
        const mapScale = this.#mapScale;
        const data = this.#data;
        this.#data = newData;
        const minRadius = this.#minRadius;

        const regionId = this.#regionId;

        //#region updateRegionValues
        this.#container.selectAll(".region")
            .transition()
            .duration(this.#transitionDuration)
            .style("fill", d => {
                return this.#getRegionColour(this.#data[d.properties[regionId]]);
            })

        let regionValues = this.#container.selectAll(".regionValue")

        let circles = regionValues
            .selectAll("circle")
            .transition()
            .duration(this.#transitionDuration)
            .attr('r', (d) => {
                let textVal = this.#getDisplayValue(newData, d)
                let newRadius = this.#calculateRadius(textVal.length, this.#fontSize)
                return newRadius < minRadius ? minRadius : newRadius;
            })


        let text = regionValues
            .selectAll('text')
            .transition()
            .duration(this.#transitionDuration)
            .tween("text", function(d) {
                var selection = d3.select(this);
                var oldVal = parseFloat(selection.text().replaceAll('%', '').replaceAll(that.#numberSeperator, ''));
                let newVal = that.#round(newData[d.properties[regionId]])

                if (!isNaN(oldVal) && !isNaN(newVal)) {
                    const i = d3.interpolate(oldVal, newVal);
                    return function(t) {
                        if (newVal % 1 == 0)
                            selection.text(that.#formatNumber(Math.round(i(t))));
                        else
                            selection.text(that.#formatNumber(that.#round(i(t))));
                    };
                }
                else {
                    selection
                        .attr('opacity', 0)
                        .text(that.#getDisplayValue(newData, d))
                    selection
                        .transition()
                        .duration(that.#transitionDuration)
                        .attr('opacity', 1)
                }
            })
        //#endregion

        //#region updateCanadaValue
        if (this.#canadaBubble) {
            let canadaValue = this.#calculateCanadaValue();
            //configure the display text
            let textVal = this.#formatNumber(canadaValue) + (this.#percent ? '%' : '')

            let canadaCircle = this.#canadaGroup.select("circle.canadaCircle")
            let canadaCircleText = this.#canadaGroup.select("text.canadaCircleText")
                .transition()
                .duration(this.#transitionDuration)
                .tween("text", function(d) {
                    var selection = d3.select(this);
                    var oldVal = parseFloat(selection.text().replaceAll('%', '').replaceAll(that.#numberSeperator, ''));
                    // console.log(oldVal)
                    let newVal = canadaValue
                    if (!isNaN(oldVal) && !isNaN(newVal)) {
                    const i = d3.interpolate(oldVal, newVal);
                    return function(t) {
                        if (newVal % 1 == 0)
                            selection.text(that.#formatNumber(Math.round(i(t))));
                        else
                            selection.text(that.#formatNumber(that.#round(i(t))));
                    };
                    } else {
                        selection.text(newVal)
                    }
                })

            let canadaRadius = this.#calculateCanadaRadius(canadaCircleText, textVal)

            canadaCircle
                .transition()
                .duration(this.#transitionDuration)
                .attr("r", canadaRadius)

            //shift 'Canada' text to accomodate the radius
            this.#canadaGroup.select("text.canadaText")
                .transition()
                .duration(this.#transitionDuration)
                .attr("transform", `translate(${-(canadaRadius + 10)}, 0)`)

        }
        //#endregion

        //#region updateMarkers
        if (this.#markerData) {
            this.#renderMarkers();
            this.#renderMarkers(this.#invisGroup, true)
        }
        //#endregion
        return this;
    }

    //PRIVATE
    #parseNumber(value) {

    }
    #formatNumber(num) {
        if (this.#numberFormat) {
            return this.#numberFormat(num)
        }
        return this.#defaultNumberFormat(this.#round(num)).replaceAll(',', this.#numberSeperator) + (this.#percent ? '%' : '')
    }
    #getDisplayValue(data, d) {
        if (!this.#data) {
            return "N/A"
        }
        let value = data[d.properties[this.#regionId]];

        if (value == this.#suppressedLabel && this.#suppressed)
            return value;
        else if (isNaN(value)) {
            return this.#notApplicableLabel;
        }
        else {
            return this.#formatNumber(data[d.properties[this.#regionId]])
            // return this.#numberFormat(this.#round(data[d.properties[this.#regionId]])).replaceAll(',', this.#numberSeperator) + (this.#percent ? '%' : '')
        }
    }
    #initProjection() {
        this.#projection = d3
            .geoIdentity(function(x, y) {
                return [x, -y];
            })
            .reflectY(true)
            .scale(this.#mapScale)
            .translate([this.#xMap, this.#yMap]);
    }
    #initPath() {
        this.#path = d3.geoPath().projection(this.#projection);
    }
    #initContainer() {
        // console.log(this.#container)
        this.#container
            .attr('width', '100%')
            .attr("viewBox", `0 0 ${this.#width} ${this.#height}`)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr('aria-label', this.#figureAriaLabel)
            .attr('aria-description', this.#figureAriaDescription)
            .attr('tabindex', 0)
    }
    #initPtGroup() {
        //create container for pt paths
        this.#ptGroup = this.#container.append('g')
            .attr('class', 'ptGroup')
    }
    #initRvGroup() {
        //create container for region value annotation over the map
        this.#rvGroup = this.#container.append('g')
            .attr('class', 'rvGroup')
    }
    #initMarkerGroup() {
        this.#markerGroup = this.#container.append('g')
            .attr('class', 'markerGroup')
    }
    #initInvisGroup() {
        //create invisible interaction layer that will overlay the map
        this.#invisGroup = this.#container.append('g')
            .attr('class', 'invisGroup')
        // .attr('tabindex', 0)
    }
    #initCanadaGroup() {
        this.#canadaGroup = this.#container
            .append("g")
            .attr("class", "canadaGroup")
    }
    #initNumberFormat() {
        if (this.#SINotation) {
            this.#numberFormat = number => {
                // console.log(d3.formatPrefix(".2s", 1e-2)(number))

                return d3.format(`.2s`)(number).replace('G', 'B');
            }

        }
    }

    #getRegionColour(value) {
        const legendValues = this.#legendValues;

        if (!isNaN(value))
            value = this.#round(value)
        // console.log(value)

        let found = false;
        for (let i = 0; i < legendValues.length && !found; i++) {
            if (isNaN(value)) {
                if (value == this.#suppressedLabel && legendValues[i].value == this.#suppressedText && this.#suppressed) {
                    //suppr.
                    found = true;
                    return legendValues[i].colour;
                }
                else if (value != this.#suppressedLabel && legendValues[i].value == this.#notApplicableText && this.#notApplicable) {
                    //n/a
                    found = true;
                    return legendValues[i].colour;
                }
            }
            else if (value >= legendValues[i].value) {
                found = true;
                return legendValues[i].colour;
            }
        }
    }
    #round(number) {
        let multiplier = Math.pow(10, this.#decimalPlaces)
        return Math.round(number * multiplier) / multiplier
    }
    #renderMap() {
        const mapData = this.#mapData;
        const data = this.#data;
        const path = this.#path;
        const legendValues = this.#legendValues;
        const ptGroup = this.#ptGroup

        const regionId = this.#regionId

        // let fake = {}
        // let fake = "pt,region,cars,houses,pets\n";

        //create map paths for different pt's
        var regionPaths = ptGroup
            .selectAll(".region")
            .data(mapData.features)
            .enter()
            .append("g")
            .attr("class", function(d) {
                return "region";
            })
            .attr("data-id", d => d.properties[regionId])
            // .attr("data-taborder", function(d, i) {
            //     // console.log(d.properties)
            //     return d.properties.TABORDER ? d.properties.TABORDER : i
            // })
            .attr("data-pt", d => d.properties["PRNAME"])
            .attr("tabindex", d => -1)
            // .attr("focusable", "true")
            .attr("fill", (d, i) => {
                // fake[d.properties[regionId]] = Math.floor(Math.random() * 10000)
                // fake += `${d.properties[regionId]},reg1,${Math.floor(Math.random() * 15)},${Math.floor(Math.random() * 15)},${Math.floor(Math.random() * 15)}\n`;
                // fake += `${d.properties[regionId]},reg2,${Math.floor(Math.random() * 15)},${Math.floor(Math.random() * 15)},${Math.floor(Math.random() * 15)}\n`;
                // fake += `${d.properties[regionId]},reg3,${Math.floor(Math.random() * 15)},${Math.floor(Math.random() * 15)},${Math.floor(Math.random() * 15)}\n`;
                if (this.#data) {
                    return this.#getRegionColour(this.#data[d.properties[regionId]]);
                }
                else {
                    return this.#defaultColour;
                }

            })
            .attr("opacity", 1)

        // console.log('fakeDataGen', fake)

        regionPaths
            .append("path")
            .attr("d", path)
            .attr('stroke', this.#borderColour)
            .attr('stroke-width', this.#borderWidth)

    }
    #highlightRegion(selection) {
        const that = this;
        const ptGroup = this.#ptGroup;
        // const borderWidth = this.#borderWidth;
        // const borderHighlightWidth = this.#borderHighlightWidth;
        const borderColour = this.#borderColour;
        const borderHighlightColour = this.#borderHighlightColour;

        const callbackClick = this.#callbackClick;
        const callbackHover = this.#callbackHover;

        selection
            .on('focus', function(e, d) {
                // console.log('focus region')
                let selection = d3.select(this)
                let dataId = selection.attr('data-id')

                if (callbackClick) {
                    callbackClick(dataId)
                }
            })
            .on('mouseover', function(e, d) {
                let selection = d3.select(this)
                let dataId = selection.attr('data-id')

                let gs = ptGroup.select(`.region[data-id='${dataId}']`).raise()
                gs.select('path')
                    .attr('stroke-width', that.#calculateRegionBorderWidth(that.#borderHighlightWidth))
                    .attr('stroke', borderHighlightColour)
                    // .attr('stroke', 'purple')
                    .attr('class', 'active')

                if (callbackHover) {
                    callbackHover(dataId)
                }
            })
            .on('mouseout', function(e, d) {
                let selection = d3.select(this)
                let dataId = selection.attr('data-id')

                ptGroup
                    .selectAll(`.region[data-id='${dataId}']`)
                    .select('path')
                    .attr('stroke-width', that.#calculateRegionBorderWidth(that.#borderWidth))
                    .attr('stroke', borderColour)
                    .attr('class', null)
            })
    }
    #calculateMarkerRadius() {
        if (this.#currentZoomScale) {
            let scaleFraction = this.#currentZoomScale * this.#markerZoomScaler;
            let markerSize = scaleFraction >= 1 ? this.#markerRadius / scaleFraction : this.#markerRadius;
            return markerSize;
        }
        return this.#markerRadius;
    }
    #calculateRegionBorderWidth(borderWidth) {
        if (this.#currentZoomScale) {
            let scaleFraction = 1 / this.#currentZoomScale;
            let calcBorderWidth = borderWidth * scaleFraction;
            return calcBorderWidth;
        }
        return borderWidth;
    }
    #calculateOutlineWidth() {
        let baseStrokeWidth = 5;
        if (this.#currentZoomScale) {
            let scaleFraction = 1 / this.#currentZoomScale;
            let calcOutlineWidth = baseStrokeWidth * scaleFraction;
            return calcOutlineWidth;
        }
        return baseStrokeWidth;
    }
    #zoom() {
        const that = this
        let lastClicked;

        that.#container.on('click.zoom', function() {
            reset()
        })
        that.#canadaGroup.on('click.zoom', function() {
            reset()
        })
        let paths = that.#invisGroup.selectAll('path').on('click.zoom', clicked)

        let zoom = d3.zoom()
            // .extent([
            //     [0, 0],
            //     [this.#width, this.#height]
            // ])
            .scaleExtent([1, 8])
            .translateExtent([
                [0, 0],
                [this.#width, this.#height]
            ])
            .on("zoom", zoomed)

        that.#container.call(zoom);
        that.#container.on("dblclick.zoom", null);


        function reset() {
            // console.log('reset click')
            paths.transition().style("fill", null);
            that.#container.transition().duration(that.#transitionDuration).call(
                zoom.transform,
                d3.zoomIdentity,
                d3.zoomTransform(that.#container.node()).invert([that.#width / 2, that.#height / 2])
            );
            lastClicked = null;
        }

        function clicked(event, d) {
            if (lastClicked == d.properties[that.#regionId]) {
                reset();
            }
            else {

                // let scrollX = window.scrollX, scrollY = window.scrollY;
                // console.log(scrollY)
                lastClicked = d.properties[that.#regionId];
                const [
                    [x0, y0],
                    [x1, y1]
                ] = that.#path.bounds(d);
                event.stopPropagation();
                // event.preventDefault();



                that.#container.transition().duration(that.#transitionDuration).call(
                    zoom.transform,
                    d3.zoomIdentity
                    .translate(that.#width / 2, that.#height / 2)
                    .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / that.#width, (y1 - y0) / that.#height)))
                    .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                    d3.pointer(event, that.#container.node())
                );

                event.target.focus({
                    preventScroll: true
                })

                //add tabbing to the groups. This is blocked in setTabbing by event.stopPropagation(), but needed as it would reset() otherwise.
                that.#invisGroup.selectAll('g').attr('tabindex', 0);
                that.#canadaGroup.attr('tabindex', 0)
                // window.scrollTo(scrollX, scrollY);
            }
        }

        function zoomed({ transform }) {
            that.#currentZoomScale = transform.k;
            that.#currentZoomTransform = transform;

            that.#ptGroup.attr("transform", transform);
            that.#rvGroup.attr("transform", transform);
            that.#canadaGroup.attr("transform", transform);
            that.#markerGroup.attr("transform", transform);
            if (that.#markerData) {
                // that.#markerGroup.selectAll('circle').attr('transform', transform) //funky 3d effect

                that.#markerGroup.selectAll('circle.marker')
                    .attr('r', that.#calculateMarkerRadius())

                that.#invisGroup.selectAll('circle')
                    .attr('r', that.#calculateMarkerRadius())
                    .attr('stroke-width', that.#calculateOutlineWidth())

                //CSS NEEDED FOR MARKERS OUTLINE ON FOCUS (aka tabbing through)
                // .marker:focus {
                //     outline: none;
                //     opacity: 1;
                // }

                that.#invisGroup.selectAll('circle')
            }
            that.#ptGroup.selectAll('path')
                .attr('stroke-width', function(d) {
                    if (d3.select(this).classed('active')) {
                        return that.#calculateRegionBorderWidth(that.#borderHighlightWidth)
                    }
                    else {
                        return that.#calculateRegionBorderWidth(that.#borderWidth)
                    }
                })

            if (that.#callbackZoom) {
                that.#callbackZoom();
            }
            that.#invisGroup.attr("transform", transform);
        }

    }
    #setTabbing(selection) {
        const that = this;
        const invisGroup = this.#invisGroup;
        const container = this.#container;
        const canadaGroup = this.#canadaGroup;

        selection
            .on('keydown', function(e) {
                const isContainer = e.target.id == container.attr('id');
                const targetSelection = d3.select(e.target)
                // const currSelection = isContainer ? invisGroup : e.target


                if (e.key == 'Enter') {
                    //begin inner tabbing between regions
                    if (isContainer) {
                        let children = invisGroup.selectAll('g.region')
                        if (!children.empty()) {
                            children
                                .attr('tabindex', 0);

                            if (that.#canadaBubble) {
                                canadaGroup.attr('tabindex', 0);
                                // children
                                canadaGroup
                                    ._groups[0][0].focus(); //first child
                                d3.select(canadaGroup._groups[0][0]).dispatch('click');
                            }
                            else {
                                children._groups[0][0].focus(); //first child
                                d3.select(children._groups[0][0]).select('path').dispatch('click');
                            }

                        }
                    }
                    // //enter on a region, select marker inside
                    else if (that.#markerData && targetSelection.attr('class') == 'region') {

                        let markers = targetSelection.selectAll('.marker')
                        markers.attr('tabindex', 0)

                        markers._groups[0][0].focus();
                    }

                }
                //get out of inner indexes, reset to svg, zoom out
                else if (e.key == 'Escape' && !isContainer) {
                    invisGroup.selectAll('g').attr('tabindex', -1);
                    invisGroup.selectAll('.marker').attr('tabindex', -1);
                    canadaGroup.attr('tabindex', -1);
                    container._groups[0][0].focus();
                    container.dispatch('click')
                }

                //check where in dom. If leaving regions, hide indexes from order. If staying in, zoom
                else if (e.key == "Tab") {
                    let targetSelection = d3.select(e.target);
                    let isMarker = targetSelection.attr('class') == 'marker'
                    let regions = invisGroup.selectAll('g')
                    let allMarkers = invisGroup.selectAll('.marker')
                    let subMarkers = isMarker ?
                        d3.select(e.target.parentNode).selectAll('.marker') :
                        targetSelection.selectAll('.marker');
                    let regionArr = Array.from(regions._groups[0])
                    let markerArr = Array.from(allMarkers._groups[0])
                    let subMarkerArr = Array.from(subMarkers._groups[0])
                    if (that.#canadaBubble) {
                        regionArr.unshift(canadaGroup.node())
                    }
                    let index = regionArr.indexOf(e.target);
                    let markerIndex = markerArr.indexOf(e.target);
                    let subMarkerIndex = subMarkerArr.indexOf(e.target);

                    //if currently on a region, hide markers
                    if (index != -1) {
                        allMarkers.attr('tabindex', -1)
                    }


                    //if at end of subMarkers and you are about to leave, find the next region
                    //forwards leave
                    if (!e.shiftKey && subMarkerIndex != -1 && subMarkerIndex == subMarkerArr.length - 1) {

                        let parentIndex = regionArr.indexOf(e.target.parentNode);
                        //if next group exists, zoom to it
                        if (parentIndex + 1 < regionArr.length) {
                            d3.select(regionArr[parentIndex + 1]).select('path').dispatch('click')
                        }
                        //else you left the container
                        else {
                            regions.attr('tabindex', -1)
                            allMarkers.attr('tabindex', -1)
                            canadaGroup.attr('tabindex', -1)
                            container.dispatch('click')
                        }
                    }

                    //backwards leave
                    else if (e.shiftKey && subMarkerIndex == 0) {
                        let parentIndex = regionArr.indexOf(e.target.parentNode);
                    }

                    //checks for leaving the container
                    else if (
                        !e.shiftKey &&
                        (
                            (index != -1 && index == regionArr.length - 1) ||
                            (markerIndex != -1 && markerIndex == markerArr.length - 1)
                        )
                    ) {
                        regions.attr('tabindex', -1)
                        allMarkers.attr('tabindex', -1)
                        canadaGroup.attr('tabindex', -1)
                        container.dispatch('click')

                    }
                    else if (e.shiftKey && ((index != -1 && index == 0) || (markerIndex != -1 && markerIndex == 0))) {
                        regions.attr('tabindex', -1)
                        canadaGroup.attr('tabindex', -1)
                        container.dispatch('click')

                    }

                    //checks to zoom into the next tab object
                    if (!e.shiftKey && regionArr[index + 1] && index != -1) {
                        allMarkers.attr('tabindex', -1)
                        d3.select(regionArr[index + 1]).select('path').dispatch('click')

                    }
                    else if (e.shiftKey && regionArr[index - 1]) {

                        let path = d3.select(regionArr[index - 1]).select('path');
                        if (path.empty()) {
                            //if no path, either going back to the canada bubble or the container
                            if (that.#canadaBubble) {
                                d3.select(regionArr[index - 1]).dispatch('click')
                            }
                            else {
                                container.dispatch('click')
                            }
                        }
                        else {

                            //zoom in to the next path that the tab goes to
                            path.dispatch('click')
                        }
                    }
                }
            })
            .on('click.tab', function(e) {
                // console.log(e)
                const isContainer = e.target.id == container.attr('id');

                if (isContainer) {
                    invisGroup.selectAll('g').attr('tabindex', -1);
                    canadaGroup.attr('tabindex', -1)
                }
                else {
                    invisGroup.selectAll('g').attr('tabindex', 0);
                    if (that.#canadaBubble) {
                        canadaGroup.attr('tabindex', 0)
                    }
                }
            })
            .on('focusout', function(e) {

                let regions = invisGroup.selectAll('g')
                let regionArr = Array.from(regions._groups[0])
                let allMarkers = invisGroup.selectAll('.marker')
                let markerArr = Array.from(allMarkers._groups[0])
                if (that.#canadaBubble) {
                    regionArr.unshift(canadaGroup.node())
                }

                if (!regionArr.includes(e.relatedTarget) && !markerArr.includes(e.relatedTarget)) {
                    invisGroup.selectAll('g').attr('tabindex', -1)
                    canadaGroup.attr('tabindex', -1)
                }
            })
    }
    #renderTooltips(selection) {
        const regionId = this.#regionId;
        const regionName = this.#regionName;
        const data = this.#data;
        
        console.log('tooltipSelection', selection)

        const tooltip = this.#wrapper.select(".tooltip").empty() ?
            this.#wrapper
            .append('div')
            .attr('class', 'tooltip')
            .attr('opacity', 0) :
            this.#wrapper.select(".tooltip")
        selection
            .on('mouseenter', (e, d) => {
                let html;
                // console.log(d, regionId, this.#data)
                
                let myRegionId;
                // if (typeof d === 'object') {
                    myRegionId = this.#data[d.properties[regionId]];
                // } else {
                //     myRegionId = d;
                // }
                
                let colour = this.#data ? this.#getRegionColour(myRegionId) : this.#defaultColour;
                if (this.#tooltipFunction){
                    html = this.#tooltipFunction(d, colour);
                } else {
                    
                    let spanAttr = `style="border-left:5px solid ${colour}; padding-left:3px; display:block"`;
                    html = `<span ${spanAttr}>` + d.properties[regionName] + '<br />';
    
    
                    html += `` + this.#getDisplayValue(this.#data, d);
                    html += '</span>';
                }
                

                tooltip.html(html)
                    .style('opacity', 1)
                    .style("display", "block")
            })
            .on('mouseleave', function(e, d) {
                tooltip
                    .style('opacity', 0)
                    .style("display", "none")
            })
            .on('mousemove', function(e, d) {
                tooltip
                    .style("transform", `translateX(25px)`)
                    .style("left", `${(e.clientX)}px`)
                    .style("top", `${(e.clientY)}px`)
            })
    }
    #renderInvisMap() {
        const that = this;
        const mapData = this.#mapData;
        const path = this.#path;
        const invisGroup = this.#invisGroup;
        const ptGroup = this.#ptGroup;
        const borderWidth = this.#borderWidth;
        const borderColour = this.#borderColour;
        const regionId = this.#regionId;
        const regionName = this.#regionName;
        console.log('InvisMapData', mapData)

        var invisPaths = invisGroup
            .selectAll(".region")
            .data(mapData.features)
            .enter()
            .append("g")
            .attr("class", function(d) {
                return "region";
            })
            .attr("data-id", d => d.properties[regionId])
            .attr("data-taborder", function(d, i) {
                // console.log(d.properties)
                return d.properties.TABORDER ? d.properties.TABORDER : i
            })
            .attr("data-pt", d => d.properties["PRNAME"])
            .attr("tabindex", d => -1)
            .attr("focusable", "true")
            .attr("aria-label", d => `${d.properties[regionName]}: ${this.#getDisplayValue(this.#data, d)}`)

        if (this.#interactive) {
            this.#highlightRegion(invisPaths);
        }
        if (this.#tooltips) {
            this.#renderTooltips(invisPaths);
        }

        invisPaths.sort((a, b) => {
            return (+a.properties.TABORDER) - (+b.properties.TABORDER)
        })

        invisPaths
            .append("path")
            .attr("d", path)
            .attr('stroke', this.#borderColour)
            .attr('stroke-width', this.#borderWidth)
            .attr('opacity', 0)
    }
    #renderRegionValues() {
        const mapScale = this.#mapScale;
        const xMap = this.#xMap;
        const yMap = this.#yMap;
        const data = this.#data;
        const mapData = this.#mapData;
        const regionId = this.#regionId;

        // let pt = topojson.feature(mapData, mapData.objects.Can_PR2016);

        const offsetNB = this.#offsetNB;
        const offsetNS = this.#offsetNS;
        const offsetPEI = this.#offsetPEI;

        let regionValues = this.#rvGroup
            .selectAll(".regionValue")
            .data(mapData.features)
            .enter()
            .append("g")
            .attr("class", 'regionValue')
            .attr("data-id", d => d.properties[regionId])
            .attr("data-pt", d => d.properties["PRNAME"])
            .attr("tabindex", d => -1)
            .attr('transform', function(d, i) {
                // get the largest sub-polygon's coordinates
                let coord = d.geometry.coordinates;

                if (d.geometry.type == 'MultiPolygon') {
                    const u = d3.scan(coord.map(function(p) {
                        return -d3.polygonArea(p[0]);
                    }));
                    if (u == undefined) {
                        coord = [coord];
                    }
                    else {
                        coord = coord[u];
                    }
                }
                const n = polylabel(coord, 0.01)
                // if (d.properties[regionId] == 10) {
                //     d3.select(this.parentNode.parentNode).raise();
                // }
                return "translate(" + ((n[0] * (mapScale)) + xMap) + "," + (+n[1] * (-1 * mapScale) + yMap) + ")";
            })


        if (this.#interactive) {
            this.#highlightRegion(regionValues);
        }
        if (this.#tooltips) {
            this.#renderTooltips(regionValues);
        }

        let circles = regionValues
            .append("circle")
            .attr("class", "regionValuesCircle")
            .attr("r", d => {
                let textVal = this.#getDisplayValue(this.#data, d)
                let newRadius = this.#calculateRadius(textVal.length, this.#fontSize)
                return newRadius < this.#minRadius ? this.#minRadius : newRadius;
            })
            .attr("fill", "rgb(54, 54, 54)")
            .attr("stroke", "none")

        let text = regionValues
            .append("text")
            .attr('class', "regionValuesText")
            .attr('opacity', 1)
            .attr("stroke", "white")
            .attr("fill", "white")
            .attr("font-size", `${this.#fontSize}px`)
            .attr('alignment-baseline', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .style('user-select', 'none')
            .text((d) => {
                return this.#getDisplayValue(this.#data, d);
            })


        //Tweak positioning and size of text for regions whos circles cannot fit inside. EX: PEI, NB, NS
        regionValues.each(function(d) {
            let selection = d3.select(this);
            const currentTransform = selection.attr('transform')
            const transformVals = currentTransform.substring(currentTransform.indexOf("(") + 1, currentTransform.indexOf(")")).split(/[\s,]+/);

            function applyOffset(offsetInput) {
                selection.attr("transform", "translate(" + ((+transformVals[0]) + (+offsetInput[0])) + "," + ((+transformVals[1]) + (+offsetInput[1])) + ")");

                selection.insert("line", "circle")
                    .attr("class", "regionDeathsLine")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", -offsetInput[0])
                    .attr("y2", -offsetInput[1])
                    .attr("stroke-width", 2)
                    .attr("stroke", "rgb(54, 54, 54)")
            }

            if (d.properties[regionId] == 13) {
                applyOffset(offsetNB) //Shift the value circle for New Brunswick
            }
            else if (d.properties[regionId] == 12) {
                applyOffset(offsetNS) //Nova Scotia
            }
            else if (d.properties[regionId] == 11) {
                applyOffset(offsetPEI) //Prince Edward Island
            }
        });
    }
    #renderMarkers(markerGroup = this.#markerGroup, invis = false) {
        const that = this;
        // console.log(markerGroup, this.#markerData)
        let myGroup = !invis ? markerGroup : markerGroup.selectAll('g.region');
        myGroup
            .selectAll('circle.marker')
            .data(d => !invis ?
                this.#markerData :
                this.#markerData.filter(md => md.properties[this.#markerRegionId] == d.properties[this.#regionId])
            )
            .join(
                enter => {
                    enter
                        .append('circle')
                        .attr('tabindex', -1)
                        .attr("cx", (d) => {
                            return this.#projection([d.coordinates[0], d.coordinates[1]])[0]; // Put coordinates from the circle here
                        })
                        .attr("cy", (d) => {
                            return this.#projection([d.coordinates[0], d.coordinates[1]])[1]; // And here
                        })
                        .attr('r', (d) => {
                            return this.#calculateMarkerRadius()
                            // return Math.ceil(Math.random() * 20)
                        })
                        .attr('fill', invis ? 'none' : this.#markerColour)
                        .attr('stroke', invis ? 'black' : 'none')
                        .attr('stroke-width', invis ? 2 : 0)
                        .attr('class', 'marker')
                        .attr('opacity', 0)
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', invis ? 0 : this.#markerOpacity)
                },
                update => {
                    update
                        .transition()
                        .duration(this.#transitionDuration / 2)
                        .attr('opacity', 0)
                        .on('end', function(d, i) {
                            d3.select(this)
                                .attr("cx", (d) => {
                                    return that.#projection([d.coordinates[0], d.coordinates[1]])[0]; // Put coordinates from the circle here
                                })
                                .attr("cy", (d) => {
                                    return that.#projection([d.coordinates[0], d.coordinates[1]])[1]; // And here
                                })
                                .transition()
                                .duration(that.#transitionDuration / 2)
                                // .attr('r', (d) => {
                                //     return that.#calculateMarkerRadius()
                                // })
                                .attr('opacity', invis ? 0 : that.#markerOpacity)
                        })

                },
                exit => {
                    exit.transition().duration(this.#transitionDuration / 2).attr('opacity', 0).remove()
                }
            )
    }
    #calculateCanadaValue() {
        let canadaValue = this.#canadaValue ?? 0;

        //calculate the canada value by default if one is not provided
        if (!this.#canadaValue) {
            let count = 0;
            for (let regionValue in this.#data) {
                let val = +this.#data[regionValue]
                if (!isNaN(val)) {
                    canadaValue += val;
                    count++;
                }
            }

            if (this.#percent && count !== 0) {
                canadaValue /= count
            }
        }
        else {

        }
        return canadaValue;
    }
    #calculateCanadaRadius(element, value) {
        if (this.#canadaRadius){
            return this.#canadaRadius;
        }
        let canadaTextFont = parseFloat(window.getComputedStyle(element.node(), null)["fontSize"])
        let padding = this.#SINotation ? 5 : 0
        let newRadius = this.#calculateRadius(value.length, canadaTextFont) + padding
        return newRadius < this.#minRadius ? this.#minRadius : newRadius;
    }
    #renderCanadaBubble() {
        let canadaGroupContainer = this.#canadaGroup.append('g')
            .attr("transform", `translate(${this.#canadaPosition[0]},${this.#canadaPosition[1]})`);

        let canadaValue = this.#calculateCanadaValue();

        let textVal;
        //configure the display text
        if (typeof canadaValue === 'string') {
            textVal = canadaValue;
        }
        else {
            textVal = this.#formatNumber(canadaValue)
        }

        // let canadaBackground = canadaGroupContainer.append('rect')
        //canadaCircle renders first to get the proper overlap. attributes come later so that we can modify the radius to accomodate the fully rendered text in the circle
        let canadaCircle = canadaGroupContainer.append("circle")
        let canadaCircleText = canadaGroupContainer.append("text")
            .attr('class', "canadaCircleText")
            .attr("fill", "white")
            // .attr("stroke", "white")
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .text(textVal)

        let canadaRadius = this.#calculateCanadaRadius(canadaCircleText, textVal)

        canadaCircle
            .attr("class", "canadaCircle")
            .attr("r", canadaRadius)
            .attr("fill", "rgb(54, 54, 54)")
            .attr("stroke", "none")

        //shift 'Canada' text to accomodate the radius
        canadaGroupContainer.append("text")
            .attr("class", "canadaText")
            .attr("transform", `translate(${-(canadaRadius + 10)}, 0)`)
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', 'middle')
            // .attr('dominant-baseline', 'middle')
            .text("Canada")

        // let bounding = canadaGroupContainer.node().getBBox();
        // let rectPadding = 5
        // canadaBackground
        //     .attr('opacity', 0.8)
        //     .attr('fill', 'white')
        //     .attr('rx', 10)
        //     .attr('ry', 10)
        //     .attr('x', bounding.x - rectPadding)
        //     .attr('y', -bounding.height / 2 - rectPadding)
        //     .attr('width', bounding.width + rectPadding * 2)
        //     .attr('height', bounding.height + rectPadding * 2)
    }
    #calculateRadius(textLength, textSize) {
        if (textLength == 1)
            return textLength * (textSize / 1.5)
        else if (textLength == 2)
            return textLength * (textSize / 2.5)
        else
            return textLength * (textSize / 3)
    }
    #calculateLegendIntervals() {
        //determining the intervals for the legend values
        let legendIntervals = []
        let maxVal = 0;
        for (let i in this.#data) {
            if (maxVal < this.#data[i]) {
                maxVal = this.#data[i];
            }
        }

        let topInterval = Math.ceil(maxVal * .75);
        legendIntervals.push(topInterval);
        legendIntervals.push(Math.ceil(topInterval * .75))
        legendIntervals.push(Math.ceil(topInterval * .5))
        legendIntervals.push(Math.ceil(topInterval * .25))

        // console.log("legendIntervals", legendIntervals)

        this.#legendIntervals = legendIntervals;
    }
    #setLegendValues() {
        const legendIntervals = this.#legendIntervals;
        const colourSeries = this.#colourSeries;
        
        let count = 0;
        this.#legendValues = []
        this.#legendIntervals.map((el, i) => {
            this.#legendValues.push({ "value": legendIntervals[i], "colour": colourSeries[i] })
            count++;
        })

        // //set of legend value ranges, and corresponding colours
        // this.#legendValues = [
        //     { "value": legendIntervals[0], "colour": colourSeries[0] },
        //     { "value": legendIntervals[1], "colour": colourSeries[1] },
        //     { "value": legendIntervals[2], "colour": colourSeries[2] },
        //     { "value": legendIntervals[3], "colour": colourSeries[3] },
        //     { "value": 0, "colour": colourSeries[4] },
        // ]
        if (this.#notApplicable) {
            this.#legendValues.push({ "value": this.#notApplicableText, "colour": colourSeries[count++] })
        }
        if (this.#suppressed) {
            this.#legendValues.push({ "value": this.#suppressedText, "colour": colourSeries[count] }, )
        }
        
        // console.log(this.#legendValues)
    }
    #renderLegend() {
        const colourSeries = this.#colourSeries;
        if (!this.#legendIntervals) {
            this.#calculateLegendIntervals();
        }
        this.#setLegendValues();

        const that = this;

        let legendValues = this.#legendValues;

        const rectWidth = this.#legendRectangleWidth;
        const rectReduction = this.#legendRectangleWidthReduction;
        const rectHeight = this.#legendRectangleHeight;
        const legendSpacing = this.#legendSpacing;
        const legendPosition = this.#legendPosition;
        const titleHeight = this.#legendTitleHeight;
        const titleWidth = this.#legendTitleWidth;
        const titleX = this.#legendTitleX;
        const title = this.#legendTitle;
        const notApplicableText = this.#notApplicableText;
        const suppressedText = this.#suppressedText;

        function wrap(text, width) {
            text.each(function() {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    alignmentBaseline = text.attr('alignment-baseline'),
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    x = text.attr("x"),
                    y = text.attr("y"),
                    dy = 0, //parseFloat(text.attr("dy")),
                    tspan = text
                    .text(null)
                    .append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr('alignment-baseline', alignmentBaseline)
                    .attr("dy", dy + "em");
                while ((word = words.pop())) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text
                            .append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr('alignment-baseline', alignmentBaseline)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
                    }
                }
            });
        }

        //legend for interactive map
        let legend = this.#container
            .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${legendPosition[0]}, ${legendPosition[1]})`)

        this.#legendGroup = legend;

        let legendBackground = legend.append('rect')

        //legend-title
        let legendTitle = legend.append("text")
            .attr("class", "legend-title")
            .attr("y", 0)
            .attr("x", titleX)
            .attr("alignment-baseline", 'hanging')
            .text(title ? title : "")

        wrap(legendTitle, titleWidth)

        //create legend piece for each part of legendValues
        if (this.#legendGradient) {
            let legendGroup = legend.append("g")
                .attr("class", "legend-group")
                .attr("transform", "translate(0, " + (titleHeight + legendSpacing[1]) + ")")
            legendValues = [...legendValues]
            // console.log('legendValues', legendValues);
            if (this.#notApplicable) {
                legendValues.pop();
            }
            if (this.#suppressed) {
                legendValues.pop();
            }

            let extent = d3.extent(legendValues, d => d.value);
            // console.log(extent)
            let dataValues = [];
            for (let i in this.#data) {
                if (!isNaN(this.#data[i]))
                    dataValues.push(this.#data[i]);
            }
            let dataMax = d3.max(dataValues);
            // console.log(dataValues)
            extent[1] = extent[1] > dataMax ? extent[1] : dataMax;

            // console.log(extent)

            //A color scale
            let colourScale = d3.scaleLinear()
                .domain(extent)
                .range([0, rectWidth])

            let defs = legendGroup.append("defs");
            let linearGradient = defs.append("linearGradient").attr("id", `${this.#container.attr('id')}-urlGradient`);

            // horizontal gradient
            linearGradient
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%");

            linearGradient.selectAll("stop")
                .data(legendValues)
                .enter().append("stop")
                .attr("offset", d => {
                    return ((d.value - extent[1]) / (extent[0] - extent[1]) * 100) + "%"
                })
                .attr("stop-color", (d, i) => legendValues[legendValues.length - 1 - i].colour);

            legendGroup.append("rect")
                .attr("width", rectWidth)
                .attr("height", rectHeight)
                .attr('stroke', 'black')
                .attr("fill", `url(#${this.#container.attr('id')}-urlGradient)`);

            legendGroup.selectAll('text.legendLabel')
                .data(extent)
                .enter().append('text').attr('class', 'legendLabel')
                .attr('text-anchor', (d, i) => i == 0 ? 'start' : 'end')
                .attr('alignment-baseline', 'hanging')
                .attr('x', (d, i) => i == 0 ? 0 : rectWidth)
                .attr('y', (d, i) => rectHeight)
                .text(d => d + (this.#percent ? '%' : ''))



        }
        else {
            legendValues.map((d, i) => {
                let legendGroup = legend.append("g")
                    .attr("class", "legend-group")
                    .attr("transform", "translate(0, " + (titleHeight + legendSpacing[1] * i) + ")")



                let textWidth = 0
                legendGroup.append('text')
                    .attr("text-anchor", "end")
                    .text(() => {
                        let str = ""
                        if (this.#customLegendTextSeries && this.#customLegendTextSeries[i]){
                            str = this.#customLegendTextSeries[i];
                        }
                        else if (i === 0) {
                            str = d.value + (this.#percent ? '%' : '') + " and higher";
                        }
                        else if (d.value === notApplicableText || d.value === suppressedText) {
                            str = d.value
                        }
                        else {
                            str = `${d.value + (this.#percent ? '%' : '')} to ${(legendValues[i-1].value - Math.pow(10, -this.#decimalPlaces) ) + (this.#percent ? '%' : '')}`;
                        }


                        return str;
                    });

                legendGroup.append("rect")
                    .attr("width", rectWidth - rectReduction * i)
                    .attr("height", rectHeight)
                    .attr("fill", d.colour)
                    .attr("stroke", "gray")
                    .attr("x", legendSpacing[0])
                    .attr("y", -rectHeight)
            })
        }

        //change background rect position and size to fit text/rect/title
        let bounding = legend.node().getBBox();
        let rectPadding = 10
        legendBackground
            .attr('opacity', 0.8)
            .attr('fill', 'white')
            .attr('rx', 10)
            .attr('ry', 10)
            .attr('x', bounding.x - rectPadding)
            .attr('y', -rectPadding)
            .attr('width', bounding.width + rectPadding * 2)
            .attr('height', bounding.height + rectPadding * 2)
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
}
