package com.alpine.dataReductionServer

import org.scalatra._

import org.json4s._
import org.json4s.jackson.Serialization.{read, write}
import org.json4s.JsonDSL._
import org.json4s.jackson.JsonMethods._


import org.apache.spark.SparkContext
import org.apache.spark.SparkContext._
import org.apache.spark.SparkConf


case class Options( dataset: String, cube: Cube )
case class Cube(dimensions: List[Dimension], measures: List[Measure])
case class Dimension(name: String, i: Integer = 0)
case class Measure(aggregationOp: String, name: String = "", i: Integer = 0)

class DataReductionServlet extends ScalatraServlet {

  implicit val formats = DefaultFormats


  val conf = new SparkConf().setAppName("dataReduction").setMaster("local")
  val sc = new SparkContext(conf)


  val datasets = Map("datasets" -> "/home/hawk/projects/bigdata/datasets/")

  get("/reduceData") {

    val options = read[Options](params("options"))

    val dataset = datasets(options.dataset)
    val dataPath = dataset + "data.csv"
    val schemaPath = dataset + "schema.csv"
    var dimensions = options.cube.dimensions
    var measures = options.cube.measures

    val data = sc.textFile(dataPath)
    val schema = sc.textFile(schemaPath).collect()

    val attributeIndices = schema.map(_.split(",")(0).trim).zipWithIndex.toMap
    dimensions = dimensions.map(d => Dimension(d.name, attributeIndices(d.name)))
    measures = measures.map(m => 
      if (m.aggregationOp == "count"){ 

        Measure("count", "count")
      }
      else {

        Measure(m.aggregationOp, m.name, attributeIndices(m.name))
      }
    )

    val tupleSize = schema.length;
    val table = data.map(_.split(",").map(_.trim)).filter(_.length == tupleSize)

    val cube = table.map(row =>
      (
        dimensions.map(d => row(d.i)),

        measures.map(m =>
          if (m.aggregationOp == "count"){
            1.0
          } else {
            row(m.i).toDouble
          }
        )
      )
    ).reduceByKey((a, b) =>

      (a, b).zipped.map(_+_)

    ).collect()

    write(cube.map( observation =>
      (
        dimensions.map(_.name).zip(observation._1) :::
        measures.map(_.name).zip(observation._2)
      ).toMap
    ))

   
  }

  // Serve static files.
  notFound {
    contentType = "text/html"
    serveStaticResource() getOrElse resourceNotFound()
  }

}
