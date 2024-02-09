export class PieChart {
    #data;
    #cKey;
    #cValues;
    #nKey;

    #container;
    #containerGroup;
    #wrapper;
    #table;
    #tableCaption;
    #tableSummary = d3.select('html').attr('lang') == "fr" ? "Texte descriptif" : "Text description";
    #figureAriaLabel = "Pie chart";
    #figureAriaDescription = '';

    //add labels, add legend, add interaction, in that order

    #width = 720;
    #height = 480;
    #margins = { l: 100, r: 60, t: 60, b: 100 };
    #radius = Math.min(this.#width, this.#height) / 2 * 0.9;
    #graphPosition;

    #legendGroup;
    #legendRadius = 8;
    #legendTextOffset = 15;
    #legendCircleSpacing = 28;
    #legendSpacingFromGraph = 20;
    #legendOrientation = 'v';
    #legendPosition;


    #colourSeries = ["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#37A86F", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"];
    #colourScale;

    #graphTitle;

    #transitionDuration = 1000;

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

        this.#containerGroup = this.#containerGroup ?? this.#container.append('g')
            .attr('class', 'container-group')
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
    init() {
        this.initContainer();
        this.initCValues();
        this.initColourScale();

        return this;
    }
    render() {
        this.#renderPie();
        this.#renderLegend();
        return this;
    }
    update() {
        this.#renderPie();
        this.#renderLegend();
        return this;
    }
    //#endregion

    //#region ============== PRIVATE (logic) ============== //

    #renderPie() {
        const that = this;

        const pie = d3.pie()
            .sort(null)
            .value(d => d[this.#nKey])

        let inner = this.#radius * 0.4;
        let outer = this.#radius * 0.8;

        //used for donut/pie
        const arc = d3.arc()
            .outerRadius(outer)
            .innerRadius(inner);

        //to be used for outside labels
        const outerArc = d3.arc()
            .innerRadius(this.#radius)
            .outerRadius(this.#radius);

        function arcTween(d) {
            var i = d3.interpolate(this._current, d);
            this._current = i(0);
            return function(t) {
                return arc(i(t));
            };
        }

        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }

        const arcs = this.#containerGroup
            .selectAll('.arc-group')
            .data(pie(this.#data).map((el, i) => {
                el["order"] = i
                return el;
            }))
            .join(
                enter => {
                    let g = enter.append('g')
                        .attr('class', 'arc-group')

                    //arc paths
                    g.append('path')
                        .each(function(d) {
                            // console.log(d)
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
                            let pos = outerArc.centroid(d);
                            pos[0] = that.#radius * (midAngle(d) < Math.PI ? 1 : -1);
                            return "translate(" + pos + ")";
                        })
                        .attr("text-anchor", function(d) {
                            return midAngle(d) < Math.PI ? "start" : "end";
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
                            let pos = outerArc.centroid(d);
                            pos[0] = that.#radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                            let p1 = arc.centroid(d);
                            let p2 = outerArc.centroid(d);
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
                            let pos = outerArc.centroid(d);
                            pos[0] = that.#radius * (midAngle(d) < Math.PI ? 1 : -1);
                            return "translate(" + pos + ")";
                        })
                        .attr("text-anchor", function(d) {
                            return midAngle(d) < Math.PI ? "start" : "end";
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
                            let pos = outerArc.centroid(d);
                            pos[0] = that.#radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                            let p1 = arc.centroid(d);
                            let p2 = outerArc.centroid(d);
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
    //#endregion
}
