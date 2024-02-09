/*
    Really should start thinking about creating / using this. Placeholder to remind myself
    
    The point:
    - There are reuseable components that I would want for every piece of modular code, like the wrapper, container, margins, etc. Would create a one stop shop for all things generic chart
    - Class constructor, create a new chart that initializes all the basic stuff. Getters and setters would still work the same for users, just would reference the chart class internally
*/

export class Chart {
    #data;

    #container;
    #wrapper;
    #table;
    #tableCaption;
    #tableSummary = d3.select('html').attr('lang') == "fr" ? "Texte descriptif" : "Text description";
    #figureAriaLabel = "Chart";
    #figureAriaDescription = 'Chart description';

    #width = 720;
    #height = 480;
    #margins = { l: 100, r: 60, t: 60, b: 100 };

    #colourSeries = ["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#37A86F", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"];
    #colourScale;

    #graphTitle;

    #transitionDuration = 1000;

    // =============== CHAINING METHODS (get/set) ================= //
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

    // ============== PUBLIC (setup) ============== //
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
    init() {

    }
    render() {

    }
    update() {

    }

    // ============== PRIVATE (logic) ============== //

}