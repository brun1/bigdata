require(["jquery", "barChart"], function ($, BarChart) {

    var container = $("#container")[0];
    var barChart = BarChart(container);

    barChart.set({
        yAttribute: "count",
        yAxisLabel: "Count",
        yAxisTickFormat: "",
        margin: {
          top: 20,
          right: 20,
          bottom: 50,
          left: 100
        }
    });

    function reduceData(dimension, callback){
        $.ajax({
            type: "GET",
            url: "/reduceData",
            data: {
                options: JSON.stringify({
                    dataset: "datasets",
                    cube: {
                        dimensions: [
                            { name: dimension }
                        ],
                        measures: [
                            { aggregationOp: "count" }
                        ]
                    }
                })
            },
            success: function(data){
                console.log(JSON.parse(data));  
                callback(JSON.parse(data));
            }
           
        });
    }

    $("#nominalColumns").change(function (a){
        var selectedOption = $("#nominalColumns option:selected")[0];
        var selectedColumn = selectedOption.value;
        var selectedColumnLabel = selectedOption.text;

        reduceData(selectedColumn, function(data){
            data = _.sortBy(data, "count").reverse();
            barChart.data = data;
            barChart.xAttribute = selectedColumn;
            barChart.xAxisLabel = selectedColumnLabel;
        });
    }).change();
    
    function computeBox(){
        barChart.box = {
            width: container.clientWidth,
            height: container.clientHeight
        };
        console.log(barChart.box);
    }

    computeBox();

    window.addEventListener("resize", computeBox);
});
