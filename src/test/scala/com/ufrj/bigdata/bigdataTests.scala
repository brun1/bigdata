package com.ufrj.bigdata

import org.scalatra.test.scalatest._

class bigdataTests extends ScalatraFunSuite {

  addServlet(classOf[bigdata], "/*")

  test("GET / on bigdata should return status 200") {
    get("/") {
      status should equal (200)
    }
  }

}
