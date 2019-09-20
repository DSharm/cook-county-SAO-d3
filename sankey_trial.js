var margin = {top: 40,right: 40,bottom: 25,left: 40};
var width = 900;
var height = 400;
var barChartWidth = width - margin.right;
var barChartHeight = height  - margin.top*9;
var pieChartsWidth = 0.1 * width;
var pieChartsHeight = 0.5 * barChartHeight;

// https://observablehq.com/@mbostock/flow-o-matic
var flow = [];
var starting_year = "2019";

d3.json("processed_data/sent_intake_dispo_join_final.json")
.then(function(data) {
    dataset = data;
    make_sankey(dataset,starting_year);    
});

function make_sankey(data, year) {
    data_nested = d3.nest()
            .key(function(d) {
                return d.receive_year;
            })
            .entries(data)
    console.log(data_nested);


    var sankey = d3.sankey().nodeWidth(20)
        .nodePadding(50)
        .size([barChartWidth, height]);

    const svg = d3.select("#Sankey")
    .append('svg')
      .style("background", "#fff")
      .style("width", width)
      .style("height", height);    

      graph = {"nodes" : [], "links" : []};

    //console.log(graph);
   // console.log(data_nested["2019"]);
    data_nested.forEach(function (d) {
        if (d.key === year) {
            d.values.forEach(function (d) {
                //console.log(d);
                graph.nodes.push({ "name": d.source });
                graph.nodes.push({ "name": d.target });
                graph.links.push({ "source": d.source,
                                    "target": d.target,
                                    "value": +d.value,
                                    "color": "#dddddd"  });
            })
        }
        
      });
      //console.log(graph);

      // return only the distinct / unique nodes
      // console.log(graph.nodes);
      graph.nodes = d3.map(graph.nodes, function(d) {return d.name;}).keys()

      // graph.nodes = d3.keys(d3.nest()
      //   .key(function (d) { 
      //     //console.log(d); 
      //     return d.name; 
      //   }));
      // //   .map(graph.nodes));

      //console.log(graph);
      

      // loop through each link replacing the text with its index from node
      graph.links.forEach(function (d, i) {
        graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
        graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
        // if (graph.links[i].value < 100) {
        //     console.log(graph.links[i].value);
        //     console.log(graph.links[i].color);

        //     //graph.links[i].color = "#ffffff";
        // } 
      });

      //console.log(graph);

      //now loop through each nodes to make nodes an array of objects
      // rather than an array of strings
      graph.nodes.forEach(function (d, i) {
        graph.nodes[i] = { "name": d };
      });

    
        const {nodes, links} = sankey({
            nodes: graph.nodes.map(d => Object.assign({}, d)),
            links: graph.links.map(d => Object.assign({}, d))
        });
        //console.log(nodes);
    svg.append("g")
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", d => d.x0 + 1)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0 - 2)
        .attr("fill", d => {
            let c;
            for (const link of d.sourceLinks) {
            if (c === undefined) c = link.color;
            else if (c !== link.color) c = null;
            }
            if (c === undefined) for (const link of d.targetLinks) {
            if (c === undefined) c = link.color;
            else if (c !== link.color) c = null;
            }
            return (d3.color(c) || d3.color(color)).darker(0.5);
        })
        .append("title")
        .text(d => `${d.name}\n${d.value.toLocaleString()}`);

    const link = svg.append("g")
        .attr("fill", "none")
        .selectAll("g")
        .data(links)
        .join("g")
        .attr("stroke", function(d) {
            if (d.value < 100) {
                return d3.color("white");
            }
            else {
                return d3.color(d.color);
            }
        })

//        .attr("stroke", d => d3.color(d.color) || color)
        .style("mix-blend-mode", "multiply");

    link.append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke-width", d => Math.max(1, d.width));

    link.append("title")
        .text(d => `${d.source.name} → ${d.target.name}\n${d.value.toLocaleString()}`);

    svg.append("g")
        .style("font", "10px sans-serif")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => d.name)
        .append("tspan")
        .attr("fill-opacity", 0.7)
        .text(d => ` ${d.value.toLocaleString()}`);

    return svg.node();
}
// Time Slider

var dataTime = d3.range(0, 10).map(function(d) {
    return new Date(2011 + d, 10, 3);
  });
  
  var sliderTime = d3
    .sliderBottom()
    .min(d3.min(dataTime))
    .max(d3.max(dataTime))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(300)
    .tickFormat(d3.timeFormat('%Y'))
    .tickValues(dataTime)
    .default(new Date(1998, 10, 3))
    .on('onchange', function(val) {
        //console.log(d3.timeFormat('%Y')(val));
        year = d3.timeFormat('%Y')(val);
        $("#Sankey").empty();
        //console.log(year);
        make_sankey(dataset, year);
    
        // val => {
        // d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
        // console.log(value);
    });
  
  var gTime = d3
    .select('div#slider-time')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');
  
  gTime.call(sliderTime);

//   d3.select("div#slider-time").on("onchange", function(d) {
//     console.log(d);
//     selectValue = this.value;
//     console.log(selectValue);
// })
// d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));