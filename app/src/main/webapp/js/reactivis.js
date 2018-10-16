define(['d3', 'model'], function(d3, Model){
  var Reactivis = {};

  Reactivis.margin = function (model) {
    model.margin = {
      top: 20,
      right: 20,
      bottom: 50,
      left: 55
    };

    model.when(["box", "margin"], function (box, margin) {
      model.width = box.width - margin.left - margin.right;
      model.height = box.height - margin.top - margin.bottom;
    });
  };

  function domain(data, options, get) {
    var zeroMin = options ? options.zeroMin : false;
    return zeroMin ? [ 0, d3.max(data, get) ] : d3.extent(data, get);
  }

  Reactivis.xDomain = function (model, options) {
    model.when(["data", "xAttribute"], function (data, xAttribute) {

      var getX = function (d) { return d[xAttribute]; };
      model.xDomain = domain(data, options, getX);
    });
  };
  Reactivis.yDomain = function (model, options) {
    model.when(["data", "yAttribute"], function (data, yAttribute) {

      var getY = function (d) { return d[yAttribute]; };
      model.yDomain = domain(data, options, getY);
    });
  };
  
  Reactivis.yLinearScale = function (model, options) {
    var scale = d3.scale.linear();
    model.when(["data", "yDomain", "height"], function (data, yDomain, height) {
      model.yScale = scale.domain(yDomain).range([height, 0]);
    });
  };

  Reactivis.xLinearScale = function (model) {
    var scale = d3.scale.linear();
    model.when(["data", "xDomain", "width"], function (data, xDomain, width) {
      model.xScale = scale.domain(xDomain).range([0, width]);
    });
  };

  Reactivis.xOrdinalScale = function (model) {
    var scale = d3.scale.ordinal();
    model.when(["data", "xAttribute", "width"], function (data, xAttribute, width) {
      var getX = function (d) { return d[xAttribute]; };
      model.xScale = scale
        .rangeRoundBands([0, width], 0.1)
        .domain(
          data.map(getX)
        );
    });
  };

  Reactivis.xTimeScale = function (model) {
    var scale = d3.time.scale();
    model.when(["data", "xDomain", "width"], function (data, xDomain, width) {
      model.xScale = scale.domain(xDomain).range([0, width]);
    });
  };


  Reactivis.svg = function (model) {
    model.when("container", function (container) {
      model.svg = d3.select(container).append('svg');      
    });

    model.when(["svg", "box"], function (svg, box) {

      svg.attr("width", box.width).attr("height", box.height);

    });

    model.when("svg", function (svg) {
      model.g = svg.append("g");
    });

    model.when(["g", "margin"], function (g, margin) {
      g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    });
  };

  Reactivis.xAxis = function (model) {
    var xAxis = d3.svg.axis().orient("bottom");

    model.when("g", function (g) {
      model.xAxisG = g.append("g").attr("class", "x axis");
    });

    model.when("xAxisG", function (xAxisG) {
      model.xAxisText = xAxisG.append("text")
        .attr("dy", "2.0em")
        .style("text-anchor", "middle");
    });

    model.when(["xAxisText", "width"], function (xAxisText, width) {
      xAxisText.attr("x", width / 2);
    });

    model.when(["xAxisG", "height"], function (xAxisG, height) {
      xAxisG.attr("transform", "translate(0," + height + ")");
    });

    model.when(["xAxisG", "xScale"], function (xAxisG, xScale) {
      xAxis.scale(xScale);
      xAxisG.call(xAxis);
    });

    model.when(["xAxisText", "xAxisLabel"], function (xAxisText, xAxisLabel) {
      xAxisText.text(xAxisLabel);
    });
  };

  Reactivis.yAxis = function (model) {
    var yAxis = d3.svg.axis().orient("left");

    model.when("g", function (g) {
      model.yAxisG = g.append("g").attr("class", "y axis");
    });

    model.when(["yAxisG"], function (yAxisG) {
      model.yAxisText = yAxisG.append("text")
        .attr("dy", "-2.8em")
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", 0);
    });

    model.when(["yAxisText", "height"], function (yAxisText, height) {
      yAxisText.attr("x", -height / 2);
    });

    model.when(["yAxisText", "yAxisLabel"], function (yAxisText, yAxisLabel) {
      yAxisText.text(yAxisLabel);
    });

    model.when(['yAxisNumTicks', 'yAxisTickFormat'], function (count, format) {
      yAxis.ticks(count, format);
    });

    model.when(["yAxisG", "yScale"], function (yAxisG, yScale) {

      var transitionDuration = 100;
      yAxis.scale(yScale);
      yAxisG
        .transition().duration(transitionDuration)
        .call(yAxis);
    });
  };

  return Reactivis;
});
