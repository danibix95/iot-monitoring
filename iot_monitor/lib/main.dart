import 'package:flutter/material.dart';

import 'routes.dart';
import 'splashScreen.dart';
import 'homepage.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'MQTT Client',
        theme: new ThemeData(
          primaryColor: new Color.fromRGBO(11, 51, 224, 1.0),
        ),
        home: new SplashScreen(),
        debugShowCheckedModeBanner: false,
        routes: <String, WidgetBuilder>{
          AppRoutes.HOME : (BuildContext context) => new Homepage()
        }
    );
  }
}