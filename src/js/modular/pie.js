export class PieChart {
    #data;
    #cKey;
    #cValues;
    #nKey;

    #wrapper;
    #container;
    #pieGroup;
    #invisPieGroup;

    #table;
    #tableCaption;
    #tableSummary = d3.select('html').attr('lang') == "fr" ? "Texte descriptif" : "Text description";
    #tableHeaderFunction;
    #tableCellFunction;
    #figureAriaLabel = "Pie chart";
    #figureAriaDescription = '';

    //add labels, add legend, add interaction, in that order

    #width = 720;
    #height = 480;
    #margins = { l: 100, r: 60, t: 60, b: 100 };
    #graphPosition;

    //pie values
    #pie;
    #radius = Math.min(this.#width, this.#height) / 2 * 0.9;
    #inner;
    #outer;
    #arc;
    #outerArc;

    #legendGroup;
    #legendRadius = 8;
    #legendTextOffset = 15;
    #legendCircleSpacing = 28;
    #legendSpacingFromGraph = 20;
    #legendOrientation = 'v';
    #legendPosition;

    #decimalPlaces
    #decimalType = "round";


    #colourSeries = ["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#37A86F", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"];
    #colourScale;

    #graphTitle;

    #transitionDuration = 1000;


    #captionAbove = false;
    #isDataTable = true;

    //#region =============== CHAINING METHODS (get/set) ================= 
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
                        Object.keys(v).length <= 1) {

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
                console.error('Data must be an array of object(s) with at least 2 fields');
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
            const validNum = (typeof input === "number") &&
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
            const validNum = (typeof inputWidth === "number") &&
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
            const validNum = (typeof inputHeight === "number") &&
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
    radius(input) {
        /*
        Parameters 
        ----------------
        inputHeight (type: number)
          - A non-negative number for the height of the bar graph. 
        */

        if (arguments.length === 0) {
            return this.#radius;
        }
        else {
            const validNum = (typeof input === "number") &&
                (input >= 0);

            if (validNum) {
                this.#radius = input;
                return this;
            }
            else {
                console.error('radius must be a non-negative number');
            }
        }
    }
    graphPosition(input) {
        /*
        Parameters 
        ----------------
        input (type: array)
          - [x, y] position of legend
        */
        if (arguments.length === 0) {
            return this.#graphPosition;
        }
        else {
            this.#graphPosition = input;
            return this;
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
                if (typeof n !== "number") {
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
    isDataTable(inputToggle) {
        /*
        Parameters 
        ----------------
        inputToggle (type: bool)
          - True to make the graph tick text wrap/shrink to fit size.
        */

        if (arguments.length === 0) {
            return this.#isDataTable;
        }
        else {
            const validBool = (typeof inputToggle == typeof true);

            if (validBool) {
                this.#isDataTable = inputToggle;
                return this;
            }
            else {
                console.error('isDataTable must be a boolean');
            }
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

        let x;
        let y;

        if (this.#graphPosition) {
            x = this.#graphPosition[0];
            y = this.#graphPosition[1];
        }
        else {
            x = this.#width / 2;
            y = this.#height / 2;
        }

        this.#pieGroup = this.#pieGroup ?? this.#container.append('g')
            .attr('class', 'pie-group')
            .attr("transform", `translate(${x}, ${y})`);

        this.#invisPieGroup = this.#invisPieGroup ?? this.#container.append('g')
            .attr('class', 'invis-pie-group')
            .attr("transform", `translate(${x}, ${y})`);
    }
    initCValues() {
        this.#cValues = this.#data.map(el => el[this.#cKey])
    }
    initColourScale() {
        /*
        Initializes a scaleOrdinal for the colours of the bars.
        */
        this.#colourScale = d3
            .scaleOrdinal()
            .domain(this.#cValues)
            .range(this.#colourSeries)
    }
    initPie() {
        this.#pie = d3.pie()
            .sort(null)
            .value(d => d[this.#nKey])

        this.#inner = this.#radius * 0.4;
        this.#outer = this.#radius * 0.8;

        //used for donut/pie
        this.#arc = d3.arc()
            .outerRadius(this.#outer)
            .innerRadius(this.#inner);

        //to be used for outside labels
        this.#outerArc = d3.arc()
            .innerRadius(this.#radius)
            .outerRadius(this.#radius);
    }
    init() {
        this.initContainer();
        this.initCValues();
        this.initColourScale();
        this.initPie();

        return this;
    }
    render() {
        this.#renderPie();
        this.#renderInvisPie();
        this.#renderLegend();

        this.#setTabbing();

        if (this.#table) {
            this.#addTable();
        }
        return this;
    }
    update() {
        this.#renderPie();
        this.#renderInvisPie();
        this.#renderLegend();

        if (this.#table) {
            this.#addTable();
        }
        return this;
    }
    //#endregion

    //#region ============== PRIVATE (logic) ============== //
    #midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }
    #renderPie() {
        const that = this;

        function arcTween(d) {
            var i = d3.interpolate(this._current, d);
            this._current = i(0);
            return function(t) {
                return that.#arc(i(t));
            };
        }

        const arcs = this.#pieGroup
            .selectAll('.arc-group')
            .data(this.#pie(this.#data).map((el, i) => {
                el["order"] = i
                return el;
            }))
            .join(
                enter => {
                    let g = enter.append('g')
                        .attr('class', 'arc-group')
                        .attr('tabindex', -1);


                    //arc paths
                    g.append('path')
                        .each(function(d) {
                            this._current = {
                                startAngle: d.endAngle,
                                endAngle: d.endAngle
                            };
                        })
                        .attr('opacity', 1)
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 1)
                        .attrTween("d", arcTween)
                        .attr('fill', d => this.#colourScale(d.data[this.#cKey]))

                    //labels
                    let text = g.append('text');

                    text
                        .attr("transform", function(d) {
                            let pos = that.#outerArc.centroid(d);
                            pos[0] = that.#radius * (that.#midAngle(d) < Math.PI ? 1 : -1);
                            return "translate(" + pos + ")";
                        })
                        .attr("text-anchor", function(d) {
                            return that.#midAngle(d) < Math.PI ? "start" : "end";
                        })
                        .attr('dominant-baseline', 'middle')
                        .attr('opacity', 0)
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 1)

                    text
                        .text(function(d) {
                            return d.value;
                        });

                    //label lines
                    let polyline = g.append('polyline')
                        .attr("points", function(d) {
                            let pos = that.#outerArc.centroid(d);
                            pos[0] = that.#radius * 0.95 * (that.#midAngle(d) < Math.PI ? 1 : -1);
                            let p1 = that.#arc.centroid(d);
                            let p2 = that.#outerArc.centroid(d);
                            p2 = [p2[0] * 0.95, p2[1]]
                            let p3 = pos;
                            return [p1, p2, p3];
                        })
                        .attr('fill', 'none')
                        .attr('stroke', 'black')
                        .attr('opacity', 0)
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 1)
                },
                update => {
                    //arc paths
                    update.select('path')
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('fill', d => this.#colourScale(d.data[this.#cKey]))
                        .attrTween("d", arcTween)

                    //labels
                    let text = update.select('text');

                    text
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr("transform", function(d) {
                            let pos = that.#outerArc.centroid(d);
                            pos[0] = that.#radius * (that.#midAngle(d) < Math.PI ? 1 : -1);
                            return "translate(" + pos + ")";
                        })
                        .attr("text-anchor", function(d) {
                            return that.#midAngle(d) < Math.PI ? "start" : "end";
                        })
                        .attr('dominant-baseline', 'middle')

                    text
                        .text(function(d) {
                            return d.value;
                        });

                    //label line
                    let polyline = update.select('polyline')
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr("points", function(d) {
                            let pos = that.#outerArc.centroid(d);
                            pos[0] = that.#radius * 0.95 * (that.#midAngle(d) < Math.PI ? 1 : -1);
                            let p1 = that.#arc.centroid(d);
                            let p2 = that.#outerArc.centroid(d);
                            p2 = [p2[0] * 0.95, p2[1]]
                            let p3 = pos;
                            return [p1, p2, p3];
                        })
                },
                exit => {
                    //path
                    exit.select('path')
                        .datum(function(d, i) {
                            return {
                                startAngle: d.endAngle,
                                endAngle: d.endAngle
                            };
                        })
                        .transition()
                        .duration(this.#transitionDuration)
                        .attrTween("d", arcTween)
                        .on('end', () => {
                            //if exit transition ends, remove whole exit group
                            exit.remove()
                        })

                    //label
                    exit.select('text')
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 0)

                    //label line
                    exit.select('polyline')
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 0)
                }
            )
    }
    #renderInvisPie() {
        //render invisible (no transition) overlay of the piechart for tabbing/focus reasons (currently, tabbing to a pie region has clipping issues with focus)
        const that = this;

        function arcTween(d) {
            var i = d3.interpolate(this._current, d);
            this._current = i(0);
            return function(t) {
                return that.#arc(i(t));
            };
        }

        const arcs = this.#invisPieGroup
            .selectAll('.arc-group')
            .data(this.#pie(this.#data).map((el, i) => {
                el["order"] = i
                return el;
            }))
            .join(
                enter => {
                    let g = enter.append('g')
                        .attr('class', 'arc-group')
                        .attr('tabindex', -1)
                        .attr('aria-label', d => `${d.data[this.#cKey]}: ${d.value}`)
                    // .attr('opacity', 0);

                    //arc paths
                    g.append('path')
                        .each(function(d) {
                            this._current = {
                                startAngle: d.endAngle,
                                endAngle: d.endAngle
                            };
                        })
                        .attr('opacity', 0)
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 0)
                        .attrTween("d", arcTween)
                    // .attr('fill', d => this.#colourScale(d.data[this.#cKey]))

                    //labels
                    let text = g.append('text');
                    text
                        .attr("transform", function(d) {
                            let pos = that.#outerArc.centroid(d);
                            pos[0] = that.#radius * (that.#midAngle(d) < Math.PI ? 1 : -1);
                            return "translate(" + pos + ")";
                        })
                        .attr("text-anchor", function(d) {
                            return that.#midAngle(d) < Math.PI ? "start" : "end";
                        })
                        .attr('dominant-baseline', 'middle')
                        .attr('opacity', 0)
                    // .transition()
                    // .duration(this.#transitionDuration)
                    // .attr('opacity', 0)

                    text
                        .text(function(d) {
                            return d.value;
                        });

                    //label lines
                    let polyline = g.append('polyline')
                        .attr("points", function(d) {
                            let pos = that.#outerArc.centroid(d);
                            pos[0] = that.#radius * 0.95 * (that.#midAngle(d) < Math.PI ? 1 : -1);
                            let p1 = that.#arc.centroid(d);
                            let p2 = that.#outerArc.centroid(d);
                            p2 = [p2[0] * 0.95, p2[1]]
                            let p3 = pos;
                            return [p1, p2, p3];
                        })
                        .attr('fill', 'none')
                        .attr('stroke', 'black')
                        .attr('opacity', 0)
                    // .transition()
                    // .duration(this.#transitionDuration)
                    // .attr('opacity', 0)
                },
                update => {
                    update.attr('aria-label', d => `${d.data[this.#cKey]}: ${d.value}`)

                    //arc paths
                    update.select('path')
                        .transition()
                        .duration(this.#transitionDuration)
                        // .attr('fill', d => this.#colourScale(d.data[this.#cKey]))
                        .attrTween("d", arcTween)

                    //labels
                    let text = update.select('text');
                    text
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr("transform", function(d) {
                            let pos = that.#outerArc.centroid(d);
                            pos[0] = that.#radius * (that.#midAngle(d) < Math.PI ? 1 : -1);
                            return "translate(" + pos + ")";
                        })
                        .attr("text-anchor", function(d) {
                            return that.#midAngle(d) < Math.PI ? "start" : "end";
                        })
                        .attr('dominant-baseline', 'middle')

                    text
                        .text(function(d) {
                            return d.value;
                        });

                    //label line
                    let polyline = update.select('polyline')
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr("points", function(d) {
                            let pos = that.#outerArc.centroid(d);
                            pos[0] = that.#radius * 0.95 * (that.#midAngle(d) < Math.PI ? 1 : -1);
                            let p1 = that.#arc.centroid(d);
                            let p2 = that.#outerArc.centroid(d);
                            p2 = [p2[0] * 0.95, p2[1]]
                            let p3 = pos;
                            return [p1, p2, p3];
                        })
                },
                exit => {
                    //path
                    exit.select('path')
                        .datum(function(d, i) {
                            return {
                                startAngle: d.endAngle,
                                endAngle: d.endAngle
                            };
                        })
                        .transition()
                        .duration(this.#transitionDuration)
                        .attrTween("d", arcTween)
                        .on('end', () => {
                            //if exit transition ends, remove whole exit group
                            exit.remove()
                        })

                    //label
                    exit.select('text')
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 0)

                    //label line
                    exit.select('polyline')
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 0)
                }
            )
    }
    #round(num) {
        return num;
    }
    #setTabbing() {
        //set tabbing and focus based rules like other modular versions
        this.#container.on('keydown', e => {
                const isContainer = e.target.id == this.#container.attr('id');
                let pieGroups = this.#invisPieGroup.selectAll('.arc-group')
                let pieArr = Array.from(pieGroups._groups[0]);
                if (e.key == 'Enter') {
                    if (isContainer) {
                        pieGroups.attr('tabindex', 0);
                        pieGroups.node().focus();
                    }
                }
                else if (e.key == 'Escape') {
                    pieGroups.attr('tabindex', -1);
                    this.#invisPieGroup.node().focus();
                }
                else if (e.key == "Tab") {
                    let decompIndex = pieArr.indexOf(e.target)
                    if (!e.shiftKey && decompIndex == pieArr.length - 1) {
                        // console.log("leave bar forwards")
                        pieGroups.attr('tabindex', -1);
                    }
                    else if (e.shiftKey && decompIndex == 0) {
                        // console.log("leave bar backwards")
                        pieGroups.attr('tabindex', -1);
                    }
                }
            })
            .on('click', (e) => {
                let pieGroups = this.#invisPieGroup.selectAll('.arc-group')
                let pieArr = Array.from(pieGroups._groups[0]);
                if (pieArr.includes(e.target.parentNode)) {
                    pieGroups.attr('tabindex', 0);
                }
            })
            .on('focusout', (e) => {
                let pieGroups = this.#invisPieGroup.selectAll('.arc-group')
                let pieArr = Array.from(pieGroups._groups[0]);
                if (!pieArr.includes(e.relatedTarget)) {
                    // console.log('focusout')
                    pieGroups.attr('tabindex', -1);
                }
            })
    }
    #renderLegend() {
        if (!this.#legendGroup)
            this.#legendGroup = this.#container.append('g').attr('class', 'legend')
        const legend = this.#legendGroup;
        // console.log(this.#data)

        let legendPosition = this.#legendPosition ? this.#legendPosition : [0, 0];

        legend.selectAll('g.legend-group')
            .data(this.#data)
            .join(
                (enter) => {
                    let g = enter.append('g')
                        .attr('class', 'legend-group')
                        .attr('tabindex', -1);

                    //circle
                    let circle = g.append('circle')
                        .attr('r', this.#legendRadius)
                        .attr('cx', (d, i) => {
                            return legendPosition[0] + (this.#legendOrientation == 'v' ? 0 : this.#legendCircleSpacing * i)

                        })
                        .attr('cy', (d, i) => {
                            return legendPosition[1] + (this.#legendOrientation == 'v' ? this.#legendCircleSpacing * i : 0)
                        })
                        // .attr('class', d => categoryLookup[d])
                        .attr('opacity', 0)
                        .attr('fill-opacity', 0)
                        .attr('fill', (d, i) => {
                            // console.log(d)
                            let myColour = this.#colourScale(d[this.#cKey]);
                            // if (this.#textures && this.#textureSeries[i] != 'solid') {
                            //     return this.#textureSeries[i].url();
                            // }
                            return myColour;
                        })
                        .classed('selected', true)
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 1)
                        .attr('fill-opacity', 1)

                    //text
                    let text = g.append('text')
                        // .attr('class', d => categoryLookup[d])
                        .attr('alignment-baseline', 'middle')
                        .attr('dominant-baseline', 'middle')
                        .attr('x', (d, i) => {

                            let spacing
                            if (i == 0) {
                                spacing = 0;
                            }
                            else {
                                spacing = this.#legendCircleSpacing * i
                                // + legendGroupBoundings.filter((el, index) => index < i).reduce((partialSum, el) => partialSum + el.width, 0)
                            }
                            return legendPosition[0] + this.#legendTextOffset + (this.#legendOrientation == 'v' ? 0 : spacing)

                        })
                        .attr('y', (d, i) => legendPosition[1] + (this.#legendOrientation == 'v' ? this.#legendCircleSpacing * i : 0))
                        .attr('opacity', 0)
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 1)

                    text.text(d => d[this.#cKey])
                    // if (this.#interactive) {
                    //     circle.attr('cursor', 'pointer')
                    //     text.attr('cursor', 'pointer')
                    // }
                },
                (update) => {
                    //circle
                    let circle = update.select('circle')
                        // .attr('class', d => categoryLookup[d])
                        .classed('selected', true)
                        // .attr('opacity', 0)
                        .attr('opacity', function(d) {
                            let selection = d3.select(this.parentNode)
                            if (selection.text() == d) {
                                return d3.select(this).attr('opacity')
                            }
                            return 0
                        })
                        .attr('fill-opacity', 1)
                        .attr('fill', (d, i) => {
                            let myColour = this.#colourScale(d[this.#cKey]);
                            // if (this.#textures && this.#textureSeries[i] != 'solid') {
                            //     return this.#textureSeries[i].url();
                            // }
                            return myColour
                        })
                        .attr('r', this.#legendRadius)
                        .attr('cx', (d, i) => {
                            let spacing
                            if (i == 0) {
                                spacing = 0;
                            }
                            else {
                                spacing = this.#legendCircleSpacing * i
                            }
                            return legendPosition[0] + (this.#legendOrientation == 'v' ? 0 : spacing)
                        })
                        .attr('cy', (d, i) => {
                            return legendPosition[1] + (this.#legendOrientation == 'v' ? this.#legendCircleSpacing * i : 0)

                        })
                        .transition().duration(this.#transitionDuration)
                        .attr('opacity', 1)


                    //text
                    let text = update.select('text')
                        // .attr('class', function(d) {
                        //     return categoryLookup[d];
                        // })
                        .attr('opacity', function(d) {
                            let selection = d3.select(this)
                            if (selection.text() == d) {
                                return selection.attr('opacity')
                            }
                            return 0
                        })
                        // .attr('opacity', 0)
                        .text(d => d[this.#cKey])

                    text
                        .attr('x', (d, i) => {

                            let spacing
                            if (i == 0) {
                                spacing = 0;
                            }
                            else {
                                spacing = this.#legendCircleSpacing * i
                                // + legendGroupBoundings.filter((el, index) => index < i).reduce((partialSum, el) => partialSum + el.width, 0)
                            }
                            return legendPosition[0] + this.#legendTextOffset + (this.#legendOrientation == 'v' ? 0 : spacing)

                        })
                        .attr('y', (d, i) => legendPosition[1] + (this.#legendOrientation == 'v' ? this.#legendCircleSpacing * i : 0))
                        .transition()
                        .duration(this.#transitionDuration)
                        .attr('opacity', 1)


                    // if (this.#interactive) {
                    //     circle.attr('cursor', 'pointer')
                    //     text.attr('cursor', 'pointer')
                    // }
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

        if (this.#tableCaption) {
            let caption = table.append('caption')
                .text(this.#tableCaption)

            caption.classed('wb-inv', this.#captionAbove)
        }

        const tr = table.append('thead').append('tr').attr('class', 'bg-primary')
        // let tableArr = this.#data.columns;
        let tableArr = []
        tableArr.push(this.#cKey)
        // if (this.#categoryKey) {
        //   tableArr.push(this.#categoryKey)
        // }
        tableArr.push(this.#nKey)
        // if (this.#displayUncertainties) {
        //   tableArr.push(this.#upperUncertainty)
        //   tableArr.push(this.#lowerUncertainty)
        // }
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

        if (this.#isDataTable) {
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

        // $('#' + tableID).trigger("wb-init.wb-tables")
        // $( ".wb-tables" ).trigger( "wb-init.wb-tables" );
    }
    //#endregion
}
