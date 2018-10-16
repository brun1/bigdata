package com.ufrj.bigdata

import org.scalatra._

class bigdata extends ScalatraServlet {

  get("/") {
    views.html.hello()
  }

}
