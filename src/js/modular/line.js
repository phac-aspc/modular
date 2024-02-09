/*
Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

export class LineGraph {
    #data;
    #cKey;
    #nKey;
    #categoryKey;

    #secondaryNDomain;

    #categoryLookup = {}
    #categoryReverseLookup = {}

    #cValues;
    #categories;
    #selectedCategories;

    #cScale;
    #nScale;
    #secondaryNScale;

    #axisGens;
    #lineGen;

    #container;
    #wrapper;
    #table;
    #tableCaption;
    #tableSummary = d3.select('html').attr('lang') == "fr" ? "Texte descriptif" : "Text description";
    #figureAriaLabel = "Chart";
    #figureAriaDescription = 'Chart description';

    #lineGroup;
    #pointGroup;
    #legendGroup;
    #axesGroup;
    #titleGroup;

    #gridlines = false;
    #displayPoints = false;
    #hideLines = false;
    #displayUncertainties = false;
    #interactive = false;
    #hoverFade = false;

    #decimalPlaces = 1;

    #upperUncertainty;
    #lowerUncertainty;
    #uncertaintyWidth = 8;

    #cAxisTickSkip = 0;

    #width = 720;
    #height = 480;
    #margins = { l: 100, r: 60, t: 60, b: 100 };

    #min;
    #max;

    // #colourSeries = ["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#37A86F", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"];
    #colourSeries = [
        "#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#37A86F",
        "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab",
        "#6b9ac4", "#d84b2a", "#8c8c8c", "#69cc58", "#e279a3",
        "#665191", "#f7b6d2", "#dbdb8d", "#bcbd22", "#17becf",
        "#9467bd", "#69312d", "#e377c2", "#c49c94",
    ]
    #colourScale;
    #lineTypeSeries;
    #pointTypeSeries;
    #pointSymbolMap;
    #categorySymbolMap = {};
    #pointSize = 100;
    #pointSymbolDefault = d3.symbol().type(d3.symbolCircle).size(100);
    #defaultSymbol = 'circle';

    #graphTitle;
    #cAxisTitle;
    #nAxisTitle;
    #secondaryNTitle;

    #legendSpacing = [15, 22];
    #legendPosition = [550, 100];
    #legendOrientation = 'v';
    #legendLineLength = 50;
    #legendTextWrapWidth;

    #cAxisTitleSpacing = 50;
    #nAxisTitleSpacing = 60;
    #secondaryNTitleSpacing = 60;

    #transitionDuration = 1000;

    //formatters
    #tableHeaderFunction;
    #nTickFormat;

    //#region =============== CHAINING METHODS (get/set) ================= //
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
                        Object.keys(v).length <= 2) {

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
    cKey(inputKey) {
        /*
        Parameters 
        ----------------
        inputKey (type: string)
          - A string representing a key that the data field has. 
          - This string should indicate the key (data header) for the independent variable
        */
        if (arguments.length === 0) {
            return this.#cKey;
        }
        else {

            const validString = (typeof inputKey == typeof 'abc') && inputKey;

            if (validString) {
                this.#cKey = inputKey;
                return this;
            }
            else {
                console.error('cKey must be a non-empty string');
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
    secondaryNDomain(inputKey) {
        if (arguments.length === 0) {
            return this.#secondaryNDomain;
        }
        else {
            this.#secondaryNDomain = inputKey;
            return this;
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
    secondaryNTitle(inputTitle) {
        /*
        Parameters 
        ----------------
        inputTitle (type: string)
          - A string containing the title for the numerical axis. 
        */

        if (arguments.length === 0) {
            return this.#secondaryNTitle;
        }
        else {
            const validString = (typeof inputTitle == typeof 'abc') && inputTitle;

            if (validString) {
                this.#secondaryNTitle = inputTitle;
                return this;
            }
            else {
                console.error('secondaryNTitle must be a non-empty string');
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
    secondaryNTitleSpacing(inputSpacing) {
        /*
        Parameters 
        ----------------
        inputSpacing (type: number)
          - A number for the spacing from the cAxis.
        */
        if (arguments.length === 0) {
            return this.#secondaryNTitleSpacing;
        }
        else {
            const validNum = (typeof inputSpacing == typeof 5) &&
                (inputSpacing >= 0);

            if (validNum) {
                this.#secondaryNTitleSpacing = inputSpacing;
                return this;
            }
            else {
                console.error('secondaryNTitleSpacing must be a number');
            }
        }
    }
    cAxisTickSkip(input) {
        /*
        Parameters 
        ----------------
        input (type: number)
          - A number for the number of ticks skipped after the first. Display, skip n, display, skip n, etc.
        */
        if (arguments.length === 0) {
            return this.#cAxisTickSkip;
        }
        else {
            const validNum = (typeof input == typeof 5) &&
                (input >= 0);

            if (validNum) {
                this.#cAxisTickSkip = input;
                return this;
            }
            else {
                console.error('cAxisTickSkip must be a number');
            }
        }
    }
    decimalPlaces(input) {
        /*
        Parameters 
        ----------------
        input (type: number)
          - A number for the number of ticks skipped after the first. Display, skip n, display, skip n, etc.
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
    lineGroup(input) {
        if (arguments.length === 0) {
            return this.#lineGroup;
        }
        else {
            this.#lineGroup = input;
            return this;
        }
    }
    pointGroup(input) {
        if (arguments.length === 0) {
            return this.#pointGroup;
        }
        else {
            this.#pointGroup = input;
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
    axisGens(input) {
        if (arguments.length === 0) {
            return this.#axisGens;
        }
        else {
            this.#axisGens = input;
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
    lineTypeSeries(inputKeys) {
        /*
        Parameters 
        ----------------
        inputKeys (type: array)
          - An array of string(s) representing key(s) that denote which lines are dashed, dotted, straight
        */

        let accepted = ["dashed", "dotted", "solid"]

        if (arguments.length === 0) {
            return this.#lineTypeSeries;
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
                this.#lineTypeSeries = inputKeys;
                return this;
            }
            else {
                console.error('lineTypeSeries must be an array of non-empty string(s) where the options are "dashed", "dotted", and "solid"');
            }
        }
    }
    pointTypeSeries(inputKeys) {
        /*
        Parameters 
        ----------------
        inputKeys (type: array)
          - An array of string(s) representing key(s) that denote which lines are dashed, dotted, straight
        */

        let accepted = ["circle", "square", "diamond", "triangle"]

        if (arguments.length === 0) {
            return this.#pointTypeSeries;
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
                this.#pointTypeSeries = inputKeys;
                return this;
            }
            else {
                console.error('pointTypeSeries must be an array of non-empty string(s) where the options are "circle", "square", "diamond", and "triangle"');
            }
        }
    }
    pointSize(inputSize) {
        /*
        Parameters 
        ----------------
        inputWidth (type: number)
          - A non-negative number for the pointSize of the bar graph.
        */
        if (arguments.length === 0) {
            return this.#pointSize;
        }
        else {
            const validNum = (typeof inputSize == typeof 5) &&
                (inputSize >= 0);

            if (validNum) {
                this.#pointSize = inputSize;
                return this;
            }
            else {
                console.error('pointSize must be a non-negative number');
            }
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
                console.error('legendSpacing must be an array of 2 numbers, where the first reprents the horizontal space between the symbol and the text, and the second the vertical/horizontal space between subgroups.');
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
    legendOrientation(input) {
        /*
        Parameters 
        ----------------
        input (type: char)
          - A number for the spacing between the graph and the legend.
        */
        let accepted = ["h", "v"]

        if (arguments.length === 0) {
            return this.#legendOrientation;
        }
        else {
            const valid = (typeof input == typeof 'a' && accepted.includes(input));

            if (valid) {
                this.#legendOrientation = input;
                return this;
            }
            else {
                console.error('legendOrientation must be "v" for vertical, or "h" for horizontal');
            }
        }
    }
    legendLineLength(inputSpacing) {
        /*
        Parameters 
        ----------------
        inputSpacing (type: number)
          - A number for the spacing from the cAxis.
        */
        if (arguments.length === 0) {
            return this.#legendLineLength;
        }
        else {
            const validNum = (typeof inputSpacing == typeof 5) &&
                (inputSpacing >= 0);

            if (validNum) {
                this.#legendLineLength = inputSpacing;
                return this;
            }
            else {
                console.error('legendLineLength must be a number');
            }
        }
    }
    legendTextWrapWidth(inputSpacing) {
        /*
        Parameters 
        ----------------
        inputSpacing (type: number)
          - A number for the spacing from the cAxis.
        */
        if (arguments.length === 0) {
            return this.#legendTextWrapWidth;
        }
        else {
            const validNum = (typeof inputSpacing == typeof 5) &&
                (inputSpacing >= 0);

            if (validNum) {
                this.#legendTextWrapWidth = inputSpacing;
                return this;
            }
            else {
                console.error('legendTextWrapWidth must be a number');
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
    displayPoints(inputToggle) {
        /*
        Parameters 
        ----------------
        inputToggle (type: bool)
          - True to make the graph have gridlines. False otherwise.
        */

        if (arguments.length === 0) {
            return this.#displayPoints;
        }
        else {
            const validBool = (typeof inputToggle == typeof true);

            if (validBool) {
                this.#displayPoints = inputToggle;
                return this;
            }
            else {
                console.error('displayPoints must be a boolean');
            }
        }
    }
    hideLines(inputToggle) {
        /*
        Parameters 
        ----------------
        inputToggle (type: bool)
          - True to make the graph have gridlines. False otherwise.
        */

        if (arguments.length === 0) {
            return this.#hideLines;
        }
        else {
            const validBool = (typeof inputToggle == typeof true);

            if (validBool) {
                this.#hideLines = inputToggle;
                return this;
            }
            else {
                console.error('hideLines must be a boolean');
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
    hoverFade(inputToggle) {
        /*
        Parameters 
        ----------------
        inputToggle (type: bool)
          - True to make the graph interactive. False otherwise.
        */
        if (arguments.length === 0) {
            return this.#hoverFade;
        }
        else {
            const validBool = (typeof inputToggle == typeof true);

            if (validBool) {
                this.#hoverFade = inputToggle;
                return this;
            }
            else {
                console.error('hoverFade must be a boolean');
            }
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
    //#endregion

    //#region ============== PUBLIC (setup) ============== //
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
        // console.log('categories', categories)
        this.#categories = categories;
    }
    initSymbols() {
        this.#pointSymbolDefault.size(this.#pointSize)

        let triangle = d3.symbol().type(d3.symbolTriangle).size(this.#pointSize);
        let circle = d3.symbol().type(d3.symbolCircle).size(this.#pointSize);
        let square = d3.symbol().type(d3.symbolSquare).size(this.#pointSize);
        let diamond = d3.symbol().type(d3.symbolDiamond2).size(this.#pointSize);

        this.#pointSymbolMap = {
            "circle": circle,
            "square": square,
            "diamond": diamond,
            "triangle": triangle
        }
        if (this.#pointTypeSeries) {
            this.#categories.map((cat, i) => {
                this.#categorySymbolMap[cat] = this.#pointTypeSeries[i];
            })
        }
    }
    initNScale(update = true) {
        /*
          This function initialises a linear scale to place line heights.
        
          Parameters 
          -----------------
          log (type: bool)
            - Whether to set the bar height with a log scale.
        */
        // console.log('nKey', this.#nKey)
        // console.log('data', this.#data)
        this.#selectedCategories = this.#findSelectedCategories();
        // console.log('sCat', this.#selectedCategories)
        let data = this.#data;
        if (!update && this.#selectedCategories && this.#selectedCategories.length != 0) {
            // console.log()
            data = data.filter(d => {
                // console.log(d[this.#categoryKey])
                return this.#selectedCategories.includes(d[this.#categoryKey])
            })
        }
        // console.log('filteredData', data)
        this.#min = d3.min(data, (d) => {
            // console.log('posMin', parseFloat(d[this.#nKey]))

            // if (this.#selectedCategories && this.#selectedCategories.includes(d[this.#categoryKey])){
            //     console.log(d[this.#categoryKey], d[this.#nKey])
            //     return parseFloat(d[this.#nKey])
            // }
            // else if (!this.#selectedCategories)
            //     return parseFloat(d[this.#nKey])
            return parseFloat(d[this.#nKey])
        });
        this.#max = d3.max(data, (d) => {
            // if (this.#selectedCategories && this.#selectedCategories.includes(d[this.#categoryKey])){
            //     return parseFloat(d[this.#nKey])
            // }
            // else if (!this.#selectedCategories)
            //     return parseFloat(d[this.#nKey])
            return parseFloat(d[this.#nKey])
        });

        // console.log("min", this.#min)
        // console.log("max", this.#max)

        this.#nScale = d3
            .scaleLinear()
            .domain([this.#min, this.#max])
            .range([(this.#height - this.#margins.b), this.#margins.t]);

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
        // let myDomain = d3.extent(this.#data, (d) => { return d[this.#cKey]; }) // get range of values along c axis
        let myDomain = [...new Set(this.#data.map(d => d[this.#cKey]))]; // get unique cValues
        this.#cValues = myDomain;
        // console.log('domain', myDomain)

        this.#cScale = d3
            // .scaleLinear()
            .scalePoint()
            // .scaleBand()
            .domain(myDomain) //this.#data.map(d => d[this.#cSeries])
            .range([this.#margins.l, this.#width - this.#margins.r])
    }
    initSecondaryScale() {
        this.#secondaryNScale = d3
            .scaleLinear()
            .domain(this.#secondaryNDomain)
            .range([(this.#height - this.#margins.b), this.#margins.t]);
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
    initAxes(cAxisOptions = {}, nAxisOptions = {}, sAxisOptions = {}) {
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
        let s;


        // Set options
        function setOptions(ax, obj) {
            if (obj.ticks) ax.ticks(obj.ticks);
            if (obj.tickValues) ax.tickValues(obj.tickValues);
            if (obj.tickFormat) ax.tickFormat(obj.tickFormat);
            if (obj.tickPadding) ax.tickPadding(obj.tickPadding);
            if (obj.tickSizeOuter) ax.tickSizeOuter(obj.tickSizeOuter);
            if (obj.tickSizeInner) ax.tickSizeInner(obj.tickSizeInner);
        }

        // console.log(cAxisOptions.ticks)

        if (this.#secondaryNDomain) {
            s = d3.axisRight(this.#secondaryNScale);
            setOptions(s, sAxisOptions);
        }

        setOptions(n, nAxisOptions);
        setOptions(c, cAxisOptions);


        // console.log(c)

        this.#axisGens = { c, n, s };
        // console.log(this.#axisGens)
    }
    init() {
        this.initContainer();
        this.initCategories();
        this.initSymbols();
        this.initNScale();
        this.initCScale();
        if (this.#secondaryNDomain) {
            this.initSecondaryScale();
        }
        this.initColourScale();

        let nAxisOptions = {};
        let cAxisOptions = {};
        let sAxisOptions = {};
        if (this.#gridlines) {
            const gridHeight = this.#height - this.#margins.b - this.#margins.t;
            const gridWidth = this.#width - this.#margins.l - this.#margins.r;
            const gridlineLength = -gridWidth

            nAxisOptions["tickSizeInner"] = gridlineLength
            nAxisOptions["tickPadding"] = 10
        }
        if (this.#cAxisTickSkip > 0) {
            cAxisOptions['tickValues'] = this.#cScale.domain().filter((d, i) => i % this.#cAxisTickSkip === 0)
        }
        if (this.#nTickFormat) {
            nAxisOptions["tickFormat"] = this.#nTickFormat;
        }

        this.initAxes(cAxisOptions, nAxisOptions, sAxisOptions);
        return this;
    }
    render() {
        this.#renderAxes();
        this.#renderLines();
        this.#renderTitles();
        this.#renderLegend();

        if (this.#hoverFade) {
            this.#addHoverFadeout();
        }

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
        this.#updateAxes();
        this.#renderLines();
        this.#renderTitles();
        this.#renderLegend();

        if (this.#hoverFade) {
            this.#addHoverFadeout();
        }

        if (this.#interactive) {
            this.#addInteraction();
        }

        if (this.#table) {
            this.#addTable();
        }

        return this;
    }
    //#endregion

    //#region ============== PRIVATE (logic) ============== //

    #renderAxes() {
        // Create subgroup
        const axes = this.#container
            .append('g')
            .attr('class', 'axes');

        this.#axesGroup = axes;

        // Render vertical axis
        const v = 'n';
        let vAxis = axes
            .append('g')
            .attr('class', v)
            .attr('transform', `translate(${this.#margins.l},0)`)
            .call(this.#axisGens[v]);

        //render secondary vertical axis
        if (this.#secondaryNDomain) {
            const s = 's';
            let sAxis = axes.append('g')
                .attr('class', s)
                .attr('transform', `translate(${this.#width - this.#margins.r},0)`)
                .call(this.#axisGens[s]);
        }


        // Render horizontal axis
        const h = 'c';
        const height = this.#height - this.#margins.b;

        let hAxis = axes
            .append('g')
            .attr('class', h)
            .attr('transform', `translate(0, ${height})`)
            .call(this.#axisGens[h])

        if (h == 'c') {
            hAxis
                .selectAll('.tick text')
            // .call(this.#wrap, this.#cScale.bandwidth() + this.#cScale.padding())
            // .call(this.#fitToConstraints, this.#cAxisTitleSpacing, this)
        }


    }
    #updateAxes() {
        const that = this;
        const axes = this.#axesGroup;

        // update vertical axis
        const v = 'n';

        let vText = []
        axes
            .select(`.${v}`)
            .selectAll('.tick text')
            .each(el => vText.push(el))

        // console.log(hText, this.#cScale.domain())

        axes
            .select(`.${v}`)
            .transition().duration(this.#transitionDuration)
            .call(this.#axisGens[v]);


        // update horizontal axis
        const h = 'c';

        const height = this.#height - this.#margins.b

        let hText = []
        axes
            .select(`.${h}`)
            .selectAll('.tick text')
            .each(el => hText.push(el))

        // console.log(hText, this.#cScale.domain())

        if (hText.join("") != this.#cScale.domain().join("")) {
            let hAxis = axes
                .select(`.${h}`)
                .call(this.#axisGens[h])
            hAxis
                .selectAll(".tick text")
            // .call(this.#wrap, this.#cScale.bandwidth() + this.#cScale.padding())
            // .call(this.#fitToConstraints, this.#cAxisTitleSpacing, this)

            hAxis
                .selectAll(".tick text")
                .style("opacity", 0)
                .transition().duration(this.#transitionDuration)
                .style("opacity", 1)
        }
        else {
            axes
                .select(`.${h}`)
                .transition().duration(this.#transitionDuration)
                .call(this.#axisGens[h]);
        }
    }
    #pathTween(lineGen, precision) {
        return function(d, k) {
            let d1 = lineGen(d)
            const path0 = this;
            const path1 = path0.cloneNode();
            path1.setAttribute("d", d1);
            const n0 = path0.getTotalLength();
            const n1 = path1.getTotalLength();

            // Uniform sampling of distance based on specified precision.
            const distances = [0];
            const dt = precision / Math.max(n0, n1);
            let i = 0;
            while ((i += dt) < 1) distances.push(i);
            distances.push(1);

            // Compute point-interpolators at each distance.
            const points = distances.map((t) => {
                const p0 = path0.getPointAtLength(t * n0);
                const p1 = path1.getPointAtLength(t * n1);
                return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
            });

            return (t) => t < 1 ? "M" + points.map((p) => p(t)).join("L") : d1;
        };
    }
    #updateUncertaintyLine(selection, key, vertical = true) {
        selection
            .transition()
            .duration(this.#transitionDuration)
            .attr('y1', d => vertical ? this.#nScale(d[this.#lowerUncertainty]) : this.#nScale(d[key]))
            .attr('y2', d => vertical ? this.#nScale(d[this.#upperUncertainty]) : this.#nScale(d[key]))
            .attr('x1', d => {
                return vertical ? this.#cScale(d[this.#cKey]) : this.#cScale(d[this.#cKey]) - this.#uncertaintyWidth / 2
            })
            .attr('x2', d => vertical ? this.#cScale(d[this.#cKey]) : this.#cScale(d[this.#cKey]) + this.#uncertaintyWidth / 2)
    }
    #renderLines() {
        // this.#container
        if (!this.#lineGroup)
            this.#lineGroup = this.#container.append('g').attr('class', 'lines')

        this.#lineGen = d3.line()
            // .curve(
            //     d3.curveCardinal
            //         .tension(0.75)
            // d3.curveNatural
            // )
            .x((d) => { return this.#cScale(d[this.#cKey]); })
            .y((d) => { return this.#nScale(d[this.#nKey]); });

        //find all the relevant line data
        let lineData = []
        this.#categories.map(cat => {
            // console.log(this.#data.filter(el => el[this.#categoryKey] == cat))
            lineData.push(this.#data.filter(el => el[this.#categoryKey] == cat && !isNaN(el[this.#nKey])))
        })

        let createuncertaintyLine = (selection, id, key, vertical = true) => {
            selection.append('line')
                // .attr('class', 'uncertainty')
                .attr('data-uncertainty', id)
                // .attr("fill", (d, i) => this.#colourScale(this.#categories[i]))

                .attr("stroke", 'black')
                // .attr("stroke", (d, i) => this.#colourScale(d[this.#categoryKey]))
                .attr('opacity', d => {
                    // console.log(d)
                    if (d[this.#lowerUncertainty] && d[this.#upperUncertainty])
                        return 1
                    else
                        return 0
                })

                .attr('y1', d => vertical ? this.#nScale(d[this.#lowerUncertainty]) : this.#nScale(d[key]))
                .attr('y2', d => vertical ? this.#nScale(d[this.#upperUncertainty]) : this.#nScale(d[key]))
                .attr('x1', d => vertical ? this.#cScale(d[this.#cKey]) : this.#cScale(d[this.#cKey]) - this.#uncertaintyWidth / 2)
                .attr('x2', d => vertical ? this.#cScale(d[this.#cKey]) : this.#cScale(d[this.#cKey]) + this.#uncertaintyWidth / 2)
        }

        //https://observablehq.com/@d3/path-tween
        // function pathTween(lineGen, precision) {
        //     return function(d, k) {
        //         let d1 = lineGen(d)
        //         const path0 = this;
        //         const path1 = path0.cloneNode();
        //         path1.setAttribute("d", d1);
        //         const n0 = path0.getTotalLength();
        //         const n1 = path1.getTotalLength();

        //         // Uniform sampling of distance based on specified precision.
        //         const distances = [0];
        //         const dt = precision / Math.max(n0, n1);
        //         let i = 0;
        //         while ((i += dt) < 1) distances.push(i);
        //         distances.push(1);

        //         // Compute point-interpolators at each distance.
        //         const points = distances.map((t) => {
        //             const p0 = path0.getPointAtLength(t * n0);
        //             const p1 = path1.getPointAtLength(t * n1);
        //             return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
        //         });

        //         return (t) => t < 1 ? "M" + points.map((p) => p(t)).join("L") : d1;
        //     };
        // }

        this.#lineGroup
            .selectAll('g.line-group')
            .data(lineData)
            .join(
                enter => {
                    let g = enter.append('g')
                        .attr('class', 'line-group')
                        .attr('data-category', (d, i) => this.#categoryLookup[this.#categories[i]])
                        .attr('opacity', 1)
                        .attr('tabindex', -1)
                        .attr('aria-label', (d, i) => this.#categories[i])
                    // .attr('data-category', (d, i) => this.#categoryLookup[this.#categories[i]])

                    if (!this.#hideLines) {
                        g.append('path')
                            .attr('class', 'line')
                            .attr('opacity', 1)
                            .attr("fill", "none")
                            .attr("stroke", (d, i) => this.#colourScale(this.#categories[i]))
                            .attr("stroke-width", 4)
                            .style("stroke-dasharray", (d, i) => {
                                // console.log(d)
                                if (!this.#lineTypeSeries) {
                                    return 0
                                }
                                if (this.#lineTypeSeries[i] == "dashed") {
                                    return 10
                                }
                                else if (this.#lineTypeSeries[i] == "dotted") {
                                    return 4
                                }
                                else if (this.#lineTypeSeries[i] == "solid") {
                                    return 0
                                }
                            })
                            .attr("d", this.#lineGen)
                            .attr('opacity', 0)
                            .transition()
                            .duration(this.#transitionDuration)
                            .attr('opacity', 1);
                    }


                    if (this.#displayPoints) {
                        g
                            .selectAll('path.point')
                            .data(d => d.filter(el => !isNaN(el[this.#nKey])))
                            .join(
                                enter => {
                                    enter.append('path')
                                        .attr('class', 'point')
                                        .attr('d', d => {
                                            //get the symbol for the category
                                            if (this.#pointTypeSeries)
                                                return this.#pointSymbolMap[this.#categorySymbolMap[d[this.#categoryKey]]](d);
                                            return this.#pointSymbolMap[this.#defaultSymbol](d);
                                        })
                                        .attr("fill", d => this.#colourScale(d[this.#categoryKey]))
                                        .attr("transform", d => `translate(${this.#cScale(d[this.#cKey])}, ${this.#nScale(d[this.#nKey])})`)
                                        .attr('opacity', 0)
                                        .transition()
                                        .duration(this.#transitionDuration)
                                        .attr('opacity', 1);
                                }
                            )

                    }
                    if (this.#displayUncertainties) {
                        g
                            .selectAll('g.uncertainty')
                            .data(d => d.filter(el => !isNaN(el[this.#nKey])))
                            .join(
                                enter => {
                                    let g = enter.append('g')
                                    g
                                        .attr('class', 'uncertainty')
                                        .attr('opacity', 0)
                                        .transition()
                                        .duration(this.#transitionDuration)
                                        .attr('opacity', 1)

                                    createuncertaintyLine(g, 'top', this.#upperUncertainty, false)
                                    createuncertaintyLine(g, 'bottom', this.#lowerUncertainty, false)
                                    createuncertaintyLine(g, 'connector')
                                }
                            )
                    }
                    if (this.#interactive) {
                        g.attr('cursor', 'pointer')
                    }
                },
                update => {
                    update
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 1);
                    if (!this.#hideLines) {
                        update.select('path.line')
                            .transition()
                            .duration(this.#transitionDuration)
                            // .style("stroke-dasharray", (d, i) => {
                            //     if (this.#lineTypeSeries[i] == "dashed"){
                            //         return 10
                            //     }
                            //     else if (this.#lineTypeSeries[i] == "dotted"){
                            //         return 4
                            //     }
                            //     else if (this.#lineTypeSeries[i] == "solid"){
                            //         return 0
                            //     }
                            // })
                            .attr("stroke", (d, i) => this.#colourScale(this.#categories[i]))
                            .attrTween("d", this.#pathTween(this.#lineGen, 4))
                    }
                    
                    if (this.#displayPoints) {
                        update
                            .selectAll('path.point')
                            .data(d => d.filter(el => !isNaN(el[this.#nKey])))
                            .join(
                                enter => {
                                    enter.append('path')
                                        .attr('class', 'point')
                                        .attr('d', d => {
                                            //get the symbol for the category
                                            if (this.#pointTypeSeries)
                                                return this.#pointSymbolMap[this.#categorySymbolMap[d[this.#categoryKey]]](d);
                                            return this.#pointSymbolMap[this.#defaultSymbol](d);
                                        })
                                        .attr("fill", d => this.#colourScale(d[this.#categoryKey]))
                                        .attr("transform", d => `translate(${this.#cScale(d[this.#cKey])}, ${this.#nScale(d[this.#nKey])})`)
                                        .attr('opacity', 0)
                                        .transition()
                                        .duration(this.#transitionDuration)
                                        .attr('opacity', 1);
                                },
                                update => {
                                    update
                                        .transition()
                                        .duration(this.#transitionDuration)
                                        .attr('d', d => {
                                            //get the symbol for the category
                                            if (this.#pointTypeSeries)
                                                return this.#pointSymbolMap[this.#categorySymbolMap[d[this.#categoryKey]]](d);
                                            return this.#pointSymbolMap[this.#defaultSymbol](d);
                                        })
                                        .attr("fill", d => this.#colourScale(d[this.#categoryKey]))
                                        .attr("transform", d => {
                                            return `translate(${this.#cScale(d[this.#cKey])}, ${this.#nScale(d[this.#nKey])})`;
                                        })
                                        .attr('opacity', 1);
                                },
                                exit => {
                                    exit
                                        .transition()
                                        .duration(this.#transitionDuration)
                                        .attr('opacity', 0)
                                        .remove()
                                }
                            )

                    }
                    else {
                        update
                            .selectAll('path.point')
                            .transition()
                            .duration(this.#transitionDuration)
                            .attr('opacity', 0)
                            .remove()
                    }
                    if (this.#displayUncertainties) {
                        update
                            .selectAll('g.uncertainty')
                            .data(d => d.filter(el => !isNaN(el[this.#nKey])))
                            .join(
                                enter => {
                                    let g = enter.append('g')
                                    g
                                        .attr('class', 'uncertainty')
                                        .attr('opacity', 0)
                                        .transition()
                                        .duration(this.#transitionDuration)
                                        .attr('opacity', 1)

                                    createuncertaintyLine(g, 'top', this.#upperUncertainty, false)
                                    createuncertaintyLine(g, 'bottom', this.#lowerUncertainty, false)
                                    createuncertaintyLine(g, 'connector')
                                },
                                update => {


                                    this.#updateUncertaintyLine(update.select(`line[data-uncertainty='top']`), this.#upperUncertainty, false)
                                    this.#updateUncertaintyLine(update.select(`line[data-uncertainty='bottom']`), this.#lowerUncertainty, false)
                                    this.#updateUncertaintyLine(update.select(`line[data-uncertainty='connector']`))
                                },
                                exit => {
                                    exit
                                        .transition()
                                        .duration(this.#transitionDuration)
                                        .attr('opacity', 0)
                                        .remove()
                                }
                            )
                    }
                    else {
                        update
                            .selectAll('g.uncertainty')
                            .transition()
                            .duration(this.#transitionDuration)
                            .attr('opacity', 0)
                            .remove()
                    }
                },
                exit => {
                    // console.log('exit', exit)
                    exit
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 0)
                        .remove()
                }
            )
    }
    #renderTitles() {
        // Create subgroup 
        if (!this.#titleGroup)
            this.#titleGroup = this.#container.append('g').attr('class', 'titles')

        const titles = this.#titleGroup

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
            // .call(this.#wrap, this.#width)
        }
        else if (graphTitle.text() !== this.#graphTitle) {
            //transition existing title to new title
            graphTitle
                .attr('opacity', 0)
                .text(this.#graphTitle)
            // .call(this.#wrap, this.#width)
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
        const v = 'n'
        const vTitle = this.#nAxisTitle
        const vSpacing = this.#nAxisTitleSpacing
        const vAxis = titles.select(`.${v}-axis-title`)
        const vtAxisLength = height + this.#margins.t - this.#margins.b

        // Render axis titles
        if (vAxis.empty()) {
            titles
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
                .html(vTitle)
                .call(this.#wrap, vtAxisLength - vtAxisLength * 0.2)
        }
        else if (vAxis.text() !== vTitle) {

            vAxis
                .attr('opacity', 0)
                .html(vTitle)
                .call(this.#wrap, vtAxisLength - vtAxisLength * 0.2)
            vAxis
                .transition()
                .duration(this.#transitionDuration)
                .attr('opacity', 1)

        }

        const s = 's'
        const sTitle = this.#secondaryNTitle
        const sSpacing = this.#secondaryNTitleSpacing
        const sAxis = titles.select(`.${s}-axis-title`)

        // Render axis titles
        if (sAxis.empty()) {
            titles
                .append('text')
                .attr('class', v + '-axis-title')
                .attr('opacity', 1)
                .attr('x', (-height - this.#margins.t + this.#margins.b) / 2)
                .attr('y', () => {
                    return this.#width - this.#margins.r + sSpacing;
                })
                .attr('transform', `rotate(-90)`)
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', v == 'c' ? "after-edge" : null)
                .attr('dominant-baseline', v == 'c' ? "hanging" : null)
                .text(sTitle);
        }
        else if (sAxis.text() !== sTitle) {

            sAxis
                .attr('opacity', 0)
                .text(sTitle)
            sAxis
                .transition()
                .duration(this.#transitionDuration)
                .attr('opacity', 1)
        }

        const h = 'c'
        const hTitle = this.#cAxisTitle
        const hSpacing = this.#cAxisTitleSpacing
        const hAxis = titles.select(`.${h}-axis-title`)

        if (hAxis.empty()) {
            titles
                .append('text')
                .attr('class', h + '-axis-title')
                .attr('opacity', 1)
                .attr('x', (this.#width - this.#margins.r + this.#margins.l) / 2)
                .attr('y', height - this.#margins.b + hSpacing)
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', h == 'c' ? "before-edge" : null)
                .attr('dominant-baseline', h == 'c' ? "hanging" : null)
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
    #renderLegend() {
        if (this.#legendGroup) {
            this.#legendGroup
                .transition()
                .duration(this.#transitionDuration)
                .attr('transform', `translate(${this.#legendPosition[0]}, ${this.#legendPosition[1]})`)
        }

        if (!this.#legendGroup) {
            this.#legendGroup = this.#container.append('g')
                .attr('class', 'legend')
                .attr('transform', `translate(${this.#legendPosition[0]}, ${this.#legendPosition[1]})`)
        }

        this.#legendGroup
            .selectAll('g')
            .data(this.#categories)
            .join(
                enter => {
                    let lineLength = this.#legendLineLength;
                    let textOffset = this.#legendSpacing[0]
                    let legendIntervalSpacing = this.#legendSpacing[1];

                    let g = enter.append('g');
                    g
                        .attr('class', d => 'legend-group selected')
                        .attr('data-category', (d, i) => this.#categoryLookup[d])
                        .attr('transform', (d, i) => `translate(${this.#legendOrientation == "h" ? legendIntervalSpacing * i : 0}, ${this.#legendOrientation == "v" ? legendIntervalSpacing * i : 0})`)
                        .attr('opacity', 0)
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 1)
                    if (!this.#hideLines) {
                        g.append('line')
                            .attr("stroke", (d, i) => this.#colourScale(d))
                            .attr("stroke-width", 4)
                            .attr("x1", 0)
                            .attr("y1", 0)
                            .attr("x2", lineLength)
                            .attr("y2", 0)
                            .style("stroke-dasharray", (d, i) => {
                                if (!this.#lineTypeSeries) {
                                    return 0
                                }
                                if (this.#lineTypeSeries[i] == "dashed") {
                                    return 10
                                }
                                else if (this.#lineTypeSeries[i] == "dotted") {
                                    return 4
                                }
                                else if (this.#lineTypeSeries[i] == "solid") {
                                    return 0
                                }
                            })
                    }

                    let text = g.append('text')
                        .attr('x', lineLength + textOffset)
                        .attr('y', 0)
                        .attr('dy', 0)
                        .attr('alignment-baseline', 'middle')
                        .attr('dominant-baseline', 'middle')
                        .attr('opacity', 1)
                        .text(d => d)

                    //wrap legend text
                    // console.log(text)
                    if (this.#legendTextWrapWidth && text.node() && text.node().getComputedTextLength() > this.#legendTextWrapWidth) {
                        // console.log(text.node().getComputedTextLength(), this.#legendTextWrapWidth)
                        text.call(this.#wrap, this.#legendTextWrapWidth)
                        text.call(this.#centerTSpans)
                    }

                    if (this.#displayPoints) {
                        g.append('path')
                            .attr('d', d => {
                                //get the symbol for the category
                                // console.log(this.#categorySymbolMap[d])
                                if (this.#pointTypeSeries) {
                                    return this.#pointSymbolMap[this.#categorySymbolMap[d]](d)
                                }
                                return this.#pointSymbolMap[this.#defaultSymbol](d);
                            })
                            .attr("fill", d => this.#colourScale(d))
                            .attr("transform", d => `translate(${lineLength/2}, 0)`)
                    }

                    if (this.#interactive) {
                        g.attr('cursor', 'pointer')
                    }
                },
                update => {
                    let lineLength = this.#legendLineLength;
                    let textOffset = this.#legendSpacing[0]
                    let legendIntervalSpacing = this.#legendSpacing[1];

                    update
                        .attr('class', d => 'legend-group selected')
                        .attr('data-category', (d, i) => this.#categoryLookup[d])
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('transform', (d, i) => `translate(${this.#legendOrientation == "h" ? legendIntervalSpacing * i : 0}, ${this.#legendOrientation == "v" ? legendIntervalSpacing * i : 0})`)
                        .attr('opacity', 1)


                    update.select('line')
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr("stroke", (d, i) => this.#colourScale(d))
                        .attr("x2", lineLength)

                    let text = update.select('text')

                    text
                        .attr('opacity', function(d) {
                            //will need some logic to check if check is equal for wrapped text (tspan join)
                            let selection = d3.select(this)
                            if (selection.text() == d) {
                                return selection.attr('opacity');
                            }
                            return 0;
                        })
                        .text(d => d)
                    // console.log(text)
                    // if (this.#legendTextWrapWidth && text.node().getComputedTextLength() > this.#legendTextWrapWidth) {
                    //     console.log(text.node().getComputedTextLength(), this.#legendTextWrapWidth)
                    //     text.call(this.#wrap, this.#legendTextWrapWidth)
                    // }

                    text
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('x', lineLength + textOffset)
                        .attr('opacity', 1)

                },
                exit => {
                    exit
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 0)
                        .remove()
                }
            )
    }
    #findSelectedCategories(dataCategory = true) {
        let selectedValues = [];
        this.#container.select('.legend').selectAll(`g.selected`).each(function(d) {
            let current = d3.select(this);
            if (dataCategory) {
                selectedValues.push(current.data()[0])
            }
            else {
                selectedValues.push(current.attr('data-category'))
            }

        })
        return selectedValues;
    }
    #addInteraction() {
        const that = this;
        this.#selectedCategories = this.#findSelectedCategories();

        let fadeLegendCenter = (category, group) => {
            //fade out legend group and unselect it
            let gSelection = group ? group : this.#legendGroup.select(`g[data-category='${category}']`)
            gSelection
                // .attr("opacity", 1)
                .transition()
                .duration(this.#transitionDuration)
                .attr("opacity", 0.5);

            gSelection
                .classed('selected', false);

            this.#selectedCategories = this.#findSelectedCategories();
        }

        let reverseFadeCenter = (category, group) => {
            //fade in legend group and select it
            let gSelection = group ? group : this.#legendGroup.select(`g[data-category='${category}']`)
            gSelection
                .transition()
                .duration(this.#transitionDuration)
                .attr("opacity", 1);

            gSelection
                .classed('selected', true);

            this.#selectedCategories = this.#findSelectedCategories();
        }

        let removeLine = (category, group) => {
            let lineSelection = group ? group : this.#lineGroup.select(`g[data-category='${category}']`);

            lineSelection
                .transition()
                .duration(this.#transitionDuration)
                .attr('opacity', 0)
        }

        let addLine = (category, group) => {
            let lineSelection = group ? group : this.#lineGroup.select(`g[data-category='${category}']`);

            lineSelection
                .transition()
                .duration(this.#transitionDuration)
                .attr('opacity', 1)
        }

        // //or update selected lines
        let updateSelectedLines = (category, group) => {
            that.#findSelectedCategories(false).map(cat => {
                let g = this.#lineGroup.select(`g[data-category='${cat}']`)
                g
                    .transition()
                    .duration(this.#transitionDuration)
                    .attr('opacity', 1)
                if (!this.#hideLines) {
                    g.select('path.line')
                        .transition()
                        .duration(this.#transitionDuration)
                        .attrTween("d", this.#pathTween(this.#lineGen, 4))
                }

                if (this.#displayPoints) {
                    g.selectAll('path.point')
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr("transform", d => {
                            return `translate(${this.#cScale(d[this.#cKey])}, ${this.#nScale(d[this.#nKey])})`;
                        })
                }

                if (this.#displayUncertainties) {
                    console.log(g.select(`line[data-uncertainty='top']`))
                    g.selectAll('g.uncertainty').each(function(d) {
                        // console.log(d, this)
                        let uncertaintyGroup = d3.select(this)

                        that.#updateUncertaintyLine(uncertaintyGroup.select(`line[data-uncertainty='top']`), that.#upperUncertainty, false)
                        that.#updateUncertaintyLine(uncertaintyGroup.select(`line[data-uncertainty='bottom']`), that.#lowerUncertainty, false)
                        that.#updateUncertaintyLine(uncertaintyGroup.select(`line[data-uncertainty='connector']`))
                    })

                }
            })
        }

        let updateNAxis = () => {
            //reinitialize all the nAxis variables to accomodate the removed bars, and update it
            this.initNScale(false);

            let nAxisOptions = {};
            let cAxisOptions = {};
            let sAxisOptions = {};
            if (this.#gridlines) {
                const gridHeight = this.#height - this.#margins.b - this.#margins.t;
                const gridWidth = this.#width - this.#margins.l - this.#margins.r;
                const gridlineLength = -gridWidth

                nAxisOptions["tickSizeInner"] = gridlineLength
                nAxisOptions["tickPadding"] = 10
            }
            if (this.#cAxisTickSkip > 0) {
                cAxisOptions['tickValues'] = this.#cScale.domain().filter((d, i) => i % this.#cAxisTickSkip === 0)
            }

            this.initAxes(cAxisOptions, nAxisOptions, sAxisOptions);
            this.#updateAxes();

            // //update local reference to the nScale
            // nScale = this.#nScale;
        }

        let isolated = false;
        let categoriesBeforeCollapse = []

        //line listeners
        this.#lineGroup.selectAll('.line-group').on('click', function(e, d) {
            //set what groups were there before isolating to the clicked line
            if (isolated == false)
                categoriesBeforeCollapse = that.#findSelectedCategories(false);

            let clickedGroup = this;
            let allLines = that.#lineGroup.selectAll('.line-group')

            //loop through all lines
            allLines.each(function(d, i) {
                let currSelection = d3.select(this);
                let currDataCat = currSelection.attr('data-category');
                //if not the one that was clicked
                if (this != clickedGroup) {
                    //add hidden group back
                    if (isolated && categoriesBeforeCollapse.includes(currDataCat)) {
                        reverseFadeCenter(currDataCat)
                        // updateNAxis()
                        // addLine(null, currSelection)
                    }
                    //remove group
                    else {
                        fadeLegendCenter(currDataCat)
                        // updateNAxis()
                        removeLine(null, currSelection)
                    }
                }
            })
            isolated = !isolated;
            updateNAxis()
            updateSelectedLines()
        })

        //legend listeners
        this.#legendGroup.selectAll('.legend-group').on('click', function(e, d) {
            isolated = false;
            let clickedG = d3.select(this);
            let dataCat = clickedG.attr('data-category');
            //remove group
            if (clickedG.classed('selected')) {
                fadeLegendCenter(null, clickedG)
                updateNAxis()
                removeLine(dataCat)
                updateSelectedLines()
            }
            //add group
            else {
                reverseFadeCenter(null, clickedG) //clickedG.attr('data-category')
                updateNAxis()
                // addLine(dataCat)
                updateSelectedLines()
            }
        })

    }
    #addHoverFadeout() {
        let that = this;

        this.#lineGroup.selectAll('.line-group')
            .on('mouseover', function(d) {
                let selectedLines = that.#findSelectedCategories(false);
                // console.log(selectedLines)
                let current = d3.select(this)
                let otherGroups = that.#lineGroup.selectAll('.line-group').filter(function(el) {
                    return d3.select(this).attr('data-category') != current.attr('data-category') && selectedLines.includes(d3.select(this).attr('data-category'))
                })
                otherGroups.attr('opacity', 0.3)
            })
            .on('focus', function(d) {
                let selectedLines = that.#findSelectedCategories(false);
                // console.log(selectedLines)
                let current = d3.select(this)
                let otherGroups = that.#lineGroup.selectAll('.line-group').filter(function(el) {
                    return d3.select(this).attr('data-category') != current.attr('data-category') && selectedLines.includes(d3.select(this).attr('data-category'))
                })
                otherGroups.attr('opacity', 0.3)
            })
            .on('mouseout', function(d) {
                let selectedLines = that.#findSelectedCategories(false);
                let otherGroups = that.#lineGroup.selectAll('.line-group').filter(function(el) {
                    return selectedLines.includes(d3.select(this).attr('data-category'))
                })

                otherGroups.attr('opacity', 1)
            })
            .on('focusout', function(d) {
                let selectedLines = that.#findSelectedCategories(false);
                let otherGroups = that.#lineGroup.selectAll('.line-group').filter(function(el) {
                    return selectedLines.includes(d3.select(this).attr('data-category'))
                })

                otherGroups.attr('opacity', 1)
            })

        this.#legendGroup.selectAll('.legend-group')
            .on('mouseover', function(d) {
                let selectedLines = that.#findSelectedCategories(false);
                let current = d3.select(this)
                let otherGroups = that.#lineGroup.selectAll('.line-group').filter(function(el) {
                    return d3.select(this).attr('data-category') != current.attr('data-category') && selectedLines.includes(d3.select(this).attr('data-category'))
                })
                otherGroups.attr('opacity', 0.3)
            })
            .on('mouseout', function(d) {
                let selectedLines = that.#findSelectedCategories(false);
                let otherGroups = that.#lineGroup.selectAll('.line-group').filter(function(el) {
                    return selectedLines.includes(d3.select(this).attr('data-category'))
                })
                otherGroups.attr('opacity', 1)
            })
    }
    #setTabbing() {
        const container = this.#container;
        const lines = this.#container.select(".lines");

        container
            .on('keydown', (e) => {
                const isContainer = e.target.id == container.attr('id');
                //find which legend values are toggled on or off
                let selectedCategories = this.#findSelectedCategories(false);
                let selectedChildren = lines.selectAll(".line-group").filter(function(d) {
                    return selectedCategories.includes(d3.select(this).attr('data-category'))
                })
                // console.log('sc', selectedChildren)
                // console.log(e)
                let targetSelection = d3.select(e.target);

                if (e.key == 'Enter') {
                    //begin inner tabbing between regions
                    // console.log(isContainer)
                    if (isContainer) {

                        if (!selectedChildren.empty()) {
                            // console.log(selectedChildren.node())
                            selectedChildren
                                .attr('tabindex', 0);
                            selectedChildren.node().focus(); //first child
                        }
                    }
                    else {
                        let selection = d3.select(e.target)
                        selection.dispatch('click')
                    }
                }
                //get out of inner indexes, reset to svg
                else if (e.key == 'Escape' && !isContainer) {
                    selectedChildren.attr('tabindex', -1);
                    container.node().focus();
                }
                else if (e.key == "Tab") {
                    // console.log(e)

                    // console.log("tablayers", barArrOfArr)
                    let lineArr = Array.from(selectedChildren._groups[0])

                    let index = lineArr.indexOf(e.target)

                    //this chunk controls the tab indexing when moving between group and rect, need to extend between group layers
                    if (index != -1) {
                        //if leaving all the bargroups in either min/max, turn off the bargroups
                        if (!e.shiftKey && index == lineArr.length - 1) {
                            selectedChildren.attr('tabindex', -1)
                        }
                        else if (e.shiftKey && index == 0) {
                            selectedChildren.attr('tabindex', -1)
                        }
                    }
                }
            })
            .on('focusout', (e) => {
                // console.log('focusout', e)
                let selectedCategories = this.#findSelectedCategories(false);
                let selectedChildren = lines.selectAll(".line-group").filter(function(d) {
                    return selectedCategories.includes(d3.select(this).attr('data-category'))
                })
                let lineArr = Array.from(selectedChildren._groups[0])

                if (!lineArr.includes(e.relatedTarget)) {
                    selectedChildren.attr('tabindex', -1)
                }
            })
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
    #centerTSpans(text) {
        text.each(function() {
            let text = d3.select(this)
            let tspans = text.selectAll('tspan')
            let bounds = this.getBBox()
            let fontSize = parseFloat(window.getComputedStyle(tspans.node(), null)["fontSize"]);

            text.attr("transform", `translate(0,${-bounds.height/2 + fontSize})`)
        })
    }
    #round(number) {
        let multiplier = Math.pow(10, this.#decimalPlaces)
        return Math.round(number * multiplier) / multiplier
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
        const tableContainer = tableDetails.append("div").attr("class", "table-responsive")
        const table = tableContainer.append("table")
            // .attr('id', tableID)
            .attr("class", "wb-table table table-bordered table-striped table-hover")

        if (this.#tableCaption)
            table.append('caption').text(this.#tableCaption)
        const tr = table.append('thead').append('tr').attr('class', 'bg-primary')
        // let tableArr = this.#data.columns;
        let tableArr = [this.#cKey, this.#categoryKey, this.#nKey]
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

        this.#data.map(row => {
            let tr = tbody.append("tr")

            tableArr.map(el => {
                tr.append('td').text(() => {
                    let text = row[el]
                    if (!isNaN(text)) {
                        let value = parseFloat(text)
                        value = this.#round(value)
                        // if (this.#decimalType == "fixed") {
                        //     value = value.toFixed(this.#decimalPlaces)
                        // }
                        return value;
                    }

                    return text
                })
            })
        })

        let language = d3.select('html').attr('lang');
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
    }
    //#endregion
}
