define(["d3", "lodash", "model", "reactivis"], function (d3, _, Model, Reactivis) {

  return function BarChart (container) {

    var defaults = {

          yAxisNumTicks: 10,
          yAxisTickFormat: "",

          container: container
        },
        model = Model(),

        transitionDuration = 100;

    model.set(defaults);
    
    Reactivis.svg(model);

    Reactivis.margin(model);

    Reactivis.xOrdinalScale(model);
    Reactivis.xAxis(model);

    Reactivis.yLinearScale(model);
    Reactivis.yDomain(model, { zeroMin: true });
    Reactivis.yAxis(model);

    model.when(["g", "data", "xAttribute", "yAttribute", "xScale", "yScale", "height"],
        _.throttle(function (g, data, xAttribute, yAttribute, xScale, yScale, height) {

      var bars = g.selectAll(".bar").data(data);

      bars.enter().append("rect").attr("class", "bar");

      bars
        .transition().duration(transitionDuration)
        .attr("x", function(d) { return xScale(d[xAttribute]); })
        .attr("width", xScale.rangeBand())
        .attr("y", function(d) { return yScale(d[yAttribute]); })
        .attr("height", function(d) { return height - yScale(d[yAttribute]); });

      bars.exit().remove();
    }), transitionDuration);

    return model;
  };
});
