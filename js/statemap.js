var storage = {}; //IN CASE I have multiple maps... and the tooltips start conflicting w/ eachother

InitializeStateMap = function(ref, parameters) {
    var margin = {
        right: 40,
        left: 40,
        top: 40,
        bottom: 40
    }

    var colorArray = ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'];
    var reverseCA = [];
    colorArray.forEach(function(clr) {
        reverseCA.unshift(clr);
    });

    var color = d3.scaleThreshold()
        .domain([0, 5, 10, 15, 20, 25, 30, 35, 40])
        .range(reverseCA); //d3.schemeBlues[9]

    var chartWidth = 900;
    var chartHeight = 600;

    var pBar = InitProgressBar();

    var path = d3.geoPath();

    var svg = d3.select("#asthma-map")
        .attr("class", "chart")
        .append("svg");

    var processing = false;
    var dimensions = "0 0 " +
        (chartWidth + margin.left + margin.right).toString() + " " +
        (chartHeight + margin.top + margin.bottom).toString();

    svg.attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", dimensions)
        .style("max-width", chartWidth + "px")
        .style("max-height", chartHeight + "px");


    d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
        if (error) throw error;
        var date = 1999;
        pBar.animate(0, {
            duration: 1
        });
        InititTopoMap(us);
        pBar.animate(.25);
        UpdateMap(date, us);
    });
    InitKey();

    $('.slider').on('slideStop', function(ev) {
        var date = $('#asthma-datepicker').val();
        pBar.animate(0, {
            duration: 1
        });
        d3.select("#asthma-container").classed("hidden", false);
        d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
            if (error) throw error;
            pBar.animate(.25);
            UpdateMap(date, us);
        });
    });

    function InitProgressBar() {
        var bar = new ProgressBar.Line("#asthma-container", {
            strokeWidth: 4,
            easing: 'easeInOut',
            duration: 1400,
            color: '#89cdef',
            trailColor: '#eee',
            trailWidth: 1,
            svgStyle: {
                width: '100%',
                height: '100%'
            },
            text: {
                style: {
                    // Text color.
                    // Default: same as stroke color (options.color)
                    color: '#999',
                    position: 'absolute',
                    right: '0',
                    top: '30px',
                    padding: 0,
                    margin: 0,
                    transform: null
                },
                autoStyleContainer: false
            },
            from: {
                color: '#FFEA82'
            },
            to: {
                color: '#ED6A5A'
            },
            step: (state, bar) => {
                bar.setText(Math.round(bar.value() * 100) + ' %');
            }
        });
        return bar;
    }

    function InitKey() {
        var x = d3.scaleLinear()
            .domain([1, 45])
            .rangeRound([600, 860]);

        var g = svg.append("g")
            .attr("class", "key")
            .attr("transform", "translate(0,40)");

        g.selectAll("rect")
            .data(color.range().map(function(d) {
                d = color.invertExtent(d);
                if (d[0] == null) d[0] = x.domain()[0];
                if (d[1] == null) d[1] = x.domain()[1];
                return d;
            }))
            .enter().append("rect")
            .attr("height", 8)
            .attr("x", function(d) {
                return x(d[0]);
            })
            .attr("width", function(d) {
                return x(d[1]) - x(d[0]);
            })
            .attr("fill", function(d) {
                return color(d[0]);
            });

        g.append("text")
            .attr("class", "caption")
            .attr("x", x.range()[0])
            .attr("y", -6)
            .attr("fill", "#000")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("Prevalance (%)");

        g.call(d3.axisBottom(x)
                .tickSize(13)
                .tickFormat(function(x, i) {
                    return i ? x : x + "%";
                })
                .tickValues(color.domain()))
            .select(".domain")
            .remove();
    }


    function InititTopoMap(us) {

        svg.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path);

        svg.append("path")
            .attr("class", "state-borders")
            .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) {
                return a !== b;
            })))
    }

    function UpdateMap(date, us) {
        //Set the data to be what ever the user chooses
        //(or maybe I won't let the user choose and just illustrate it myself)
        var numericDate = parseInt(date);
        pBar.animate(0.5);
        ref.orderByChild("Year").equalTo(numericDate.toString()).on("value", function(snapshot) {
            pBar.animate(0.75);
            var states = snapshot.val();
            var keys = [];
            for (var key in states) {
                if (states.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }

            svg.selectAll("path")
                .data(topojson.feature(us, us.objects.states).features)
                .on('mousemove', function(d) {
                    var prevalance = "";
                    var state = "";
                    var tooltipHTML = "";
                    keys.forEach(function(key) {
                        var numerID = parseInt(d.id );
                        // console.log(numerID.toString()+ "  " + states[key]["FIPS"].toString());
                        if (numerID == states[key]["FIPS"]) {
                            state = "State: " + states[key]["State"];
                            prevalance = "Prevalance %: " + states[key]["Prevalance (%)"].toString() + "%";
                            tooltipHTML = state + "</br>" + prevalance;
                        }
                    });
                    d3.select("#asthma-info").html(tooltipHTML);

                })
                .transition()
                .attr("fill", function(d) {
                    var result = "black";

                    keys.forEach(function(key) {
                        var numerID = parseInt(d.id );
                        // console.log(numerID.toString()+ "  " + states[key]["FIPS"].toString());
                        if (numerID == states[key]["FIPS"]) {
                            //This will be abysmally inefficient ( incredibly lazy algorithm)
                            result = color(states[key]["Prevalance (%)"]);
                        }
                    });
                    return result;
                })
                .attr("d", path);
            pBar.animate(1.0);
            setTimeout(function() {
                d3.select("#asthma-container").classed("hidden", true);
            }, 1000);

        });
    }
}
