import 'package:flutter/material.dart';
import 'package:flutter_charts_deep/res/Res.dart';
import 'colored_container.dart';
import 'fancy_fab_step_1.dart';



Widget WeatherDetailsHeader(double statusBarHeight) {
  String _location = "Ufficio/Primo Piano";
  String _condition = "N:#[dB]";
  String _timestamp = "N:#[dB]";
  String _roundedTemperature = "T:33 C°";
  String _city = "Humidity: 40%";
  Color currentColor = Colors.blue;
  changeColor() {
    if( currentColor == Colors.blue) {
      currentColor = Colors.red;
    }
  }

  return new Container(
    color: Colors.blue,
    child: new Center(
      child: new Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: <Widget>[
          new Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              new Text(
                _location,
                style: new TextStyle(
                    fontSize: 21.0,
                    fontWeight: FontWeight.w700,
                    color: $Colors.textColorWheatherHeader),
              ),
            ],
          ),
          new Center(
            child: new Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: <Widget>[
                new Column(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: <Widget>[
                    new Text(
                      _city,
                      style: new TextStyle(
                          fontSize: 21.0,
                          fontWeight: FontWeight.w700,
                          color: $Colors.textColorWheatherHeader),
                    ),
                    new Text(
                      _condition,
                      style: new TextStyle(
                        fontSize: 21.0,
                        color: $Colors.textColorWheatherHeader,
                      ),
                    ),
                    new Text(_roundedTemperature,
                        style: new TextStyle(
                            fontSize: 45.0,
                            color: $Colors.textColorWheatherHeader,
                            fontFamily: "Roboto")),
                  ],
                ),
                new Column(//Fai Pulsante

                  children: <Widget>[
                    Container(
                      width: 80.0,
                      height: 80.0,
                      child: FancyFab(),
                    ),
                  ],
                )
              ],
            ),
          )
        ],
      ),
    ),
    padding: new EdgeInsets.only(top: statusBarHeight),
  );
}

/*
          */
