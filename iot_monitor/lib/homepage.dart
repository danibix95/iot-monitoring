import 'package:flutter/material.dart';

import 'package:iot_monitor/data/MQTTConnector.dart';
import 'package:iot_monitor/data/charts.dart';

class HomepageState extends State<Homepage> {
  bool switchValue = false;
  final clientMQTT = MQTTConnector.defaultClient();

  void _updateState() {
    setState(() {});
  }

  Future<bool> _connect() async => await clientMQTT.connect();

  void _disconnect() {
    clientMQTT.disconnect();
  }

  @override
  Widget build(BuildContext context) {
    return _buildLayout();
  }

  Widget _buildLayout() {
    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: new AppBar(
          title: Text("IoT Monitor"),
          actions: <Widget>[
            Switch.adaptive(
              activeColor: Colors.greenAccent,
              inactiveThumbColor: Colors.redAccent,
              value: switchValue,
              onChanged: (bool value) async {
                setState(() { switchValue = value; });
                if (value) {
                  try {
                    if (!await _connect()) {
                      setState(() { switchValue = false; });
                    }
                  }
                  catch (e) {
                    setState(() { switchValue = false; });
                  }
                }
                else {
                  _disconnect();
                }
              }
            )
          ],
          bottom: TabBar(
            tabs: [
              Tab(icon: Icon(Icons.wb_sunny)),
              Tab(icon: Icon(Icons.ac_unit)),
              Tab(icon: Icon(Icons.opacity)),
              Tab(icon: Icon(Icons.hearing)),
            ],
            indicatorColor: Colors.lightBlueAccent,
            indicatorWeight: 3.0,
          )
        ),
        body: _buildTabView()
      )
    );
  }

  Widget _buildTabView() {
    clientMQTT.onUpdate = _updateState;

    return TabBarView(
      children: [
        TimeSeriesBar.fromList(clientMQTT.lightMessages, true),
        TimeSeriesBar.fromList(clientMQTT.tempMessages, true),
        TimeSeriesBar.fromList(clientMQTT.humidMessages, true),
        TimeSeriesBar.fromList(clientMQTT.loudMessages, true)
      ],
    );
  }
}

class Homepage extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => new HomepageState();
}