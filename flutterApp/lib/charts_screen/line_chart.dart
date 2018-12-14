import 'package:bubble_tab_indicator/bubble_tab_indicator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_charts_deep/charts_widgets/simple_line_chart.dart';
//import 'package:flutter_charts_deep/colored_container.dart';
import 'package:flutter_charts_deep/weather_details_header.dart';

Widget getLineChart(double statusBarHeight){

  return new Column(
    mainAxisAlignment: MainAxisAlignment.center,
    children: <Widget>[
      new AspectRatio(
        aspectRatio: 100 / 70,
        child: WeatherDetailsHeader(statusBarHeight),
      ),
      new Expanded(child: TabBarControllerHome()),
    ],
  );
}

TabBarControllerHome() {
  return new DefaultTabController(
      length: 5,
      child: Scaffold(
        appBar: new PreferredSize(
          preferredSize: Size.fromHeight(kToolbarHeight),
          child: new TabBar(
            tabs: [
              Tab(
                text: "Temp",
              ),
              Tab(
                text: "Hum",
              ),
              Tab(
                text: "Light",
              ),
              Tab(
                text: "Noise",
              ),
            ],
            labelColor: Colors.white,
            unselectedLabelColor: Colors.blue,
            indicatorSize: TabBarIndicatorSize.tab,
            indicator: BubbleTabIndicator(
                indicatorColor: Colors.blue,
                indicatorHeight: 25.0,
                tabBarIndicatorSize: TabBarIndicatorSize.tab),
          ),
        ),
        body: new TabBarView(children: [
          new Padding(
            padding: const EdgeInsets.all(8.0),
            child: new SizedBox(
              height: 250.0,
              child: new SimpleLineChart.withRandomData(),
            ),
          ),
          new Padding(
            padding: const EdgeInsets.all(8.0),
            child: new SizedBox(
              height: 250.0,
              child: new SimpleLineChart.withRandomData(),
            ),
          ),
          new Padding(
            padding: const EdgeInsets.all(8.0),
            child: new SizedBox(
              height: 250.0,
              child: new SimpleLineChart.withRandomData(),
            ),
          ),
          new Padding(
            padding: const EdgeInsets.all(8.0),
            child: new SizedBox(
              height: 250.0,
              child: new SimpleLineChart.withRandomData(),
            ),
          ),
        ]),
      ));
}
