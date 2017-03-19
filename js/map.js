var storage = {};//IN CASE I have multiple maps... and the tooltips start conflicting w/ eachother

InitializeMap = function(ref,parameters) {
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
        .domain(d3.range(2, 10))
        .range(reverseCA); //d3.schemeBlues[9]

    var chartWidth = 900;
    var chartHeight = 600;

    var pBar = InitProgressBar();

    var path = d3.geoPath();

    var svg = d3.select("#us-map")
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
        InititTopoMap(us)
        pBar.animate(.25);
        UpdateMap(date, us)
    });
    InitKey();

    $('.slider').on('slideStop', function(ev) {
        var date = $('#datepicker').val();
        pBar.animate(0, {
            duration: 1
        });
        d3.select("#container").classed("hidden",false);
        d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
            if (error) throw error;
            pBar.animate(.25);
            UpdateMap(date, us);
        });
    });

    function InitProgressBar() {
        var bar = new ProgressBar.Line("#container", {
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
            .domain([1, 10])
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
            .text("% of days > acceptable PM2.5");

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

        svg.append("path")
            .datum(topojson.feature(us, us.objects.states))
            .attr("class", "state")
            .attr("d", path);

        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) {
                return a !== b;
            }))
            .attr("class", "state-border")
            .attr("d", path)
            .style("stroke-width", "1.5px");

        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("fill", function(d) {

            })
            .attr("d", path);

        svg.append("path")
            .datum(topojson.mesh(us, us.objects.counties, function(a, b) {
                return a !== b && !(a.id / 1000 ^ b.id / 1000);
            }))
            .attr("class", "county-borders")
            .attr("d", path)
            .style("stroke-width", ".5px");
    }

    function UpdateMap(date, us) {
        //Set the data to be what ever the user chooses
        //(or maybe I won't let the user choose and just illustrate it myself)
        var numericDate = parseInt(date);
        pBar.animate(0.5);
        ref.orderByChild("ReportYear").equalTo(numericDate).on("value", function(snapshot) {
            pBar.animate(0.75);
            var counties = snapshot.val();
            var keys = [];
            for (var key in counties) {
                if (counties.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }
            svg.selectAll("path")
                .data(topojson.feature(us, us.objects.counties).features) //topojson.feature(us, us.objects.counties).features
                .on('mousemove', function(d) {
                    var county = "";
                    var pm25 = "";
                    var state = "";
                    var tooltipHTML = "";
                    keys.forEach(function(key) {
                        if (d.id == counties[key]["CountyFips"]) {
                            pm25 = "% of days > PM2.5 threshold: " + counties[key]["Value"].toFixed(2).toString() + "%";
                            county = "County: " + counties[key]["CountyName"];
                            state = "State: " + counties[key]["StateName"];
                            tooltipHTML = state + "</br>" + county + "</br>" + pm25;
                        }
                    });
                    d3.select("#map-info").html(tooltipHTML);

                })
                .transition()
                .attr("fill", function(d) {
                    var result = "black";
                    keys.forEach(function(key) {
                        if (d.id == counties[key]["CountyFips"]) {
                            //This will be abysmally inefficient ( incredibly lazy algorithm)
                            result = "yellow"; //instead of yellow map the county to w.e the degree of thing is
                            result = color(counties[key]["Value"]);
                        }
                    });
                    return result;
                })
                .attr("d", path);
            pBar.animate(1.0);
            setTimeout(function(){ d3.select("#container").classed("hidden",true); }, 1000);

        });
    }
}
