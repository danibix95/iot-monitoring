import 'dart:async';
import 'dart:convert';
import 'dart:collection';

import 'package:flutter/material.dart';
import 'package:mqtt_client/mqtt_client.dart';

import 'package:iot_monitor/data/dataPacket.dart';

class MQTTConnector {
  final MqttClient _client;
  final topic;
  final Queue<DataPacket<double>> _lightMessages = Queue();
  final Queue<DataPacket<double>> _tempMessages = Queue();
  final Queue<DataPacket<double>> _humidMessages = Queue();
  final Queue<DataPacket<double>> _loudMessages = Queue();
  Function onUpdate;

  Queue<DataPacket<double>> get lightMessages => _lightMessages;
  Queue<DataPacket<double>> get tempMessages => _tempMessages;
  Queue<DataPacket<double>> get humidMessages => _humidMessages;
  Queue<DataPacket<double>> get loudMessages => _loudMessages;

  final jsonDec = JsonDecoder();
  Color connectedColor = Colors.white;
  bool switchValue = false;
  bool topicConnected = false;

  MQTTConnector(this._client, this.topic);

  /*test.mosquitto.org*/
  MQTTConnector.defaultClient()
      : _client = MqttClient.withPort('iot.eclipse.org', 'iotClient', 1883),
        topic = 'ciaone' {
    _client
      ..logging(on: false)
      ..keepAlivePeriod = 30
      ..onDisconnected = _onDisconnected
      ..onConnected = _onConnected
      ..onSubscribed = _onSubscribed;
  }

  /// The subscribed callback
  void _onSubscribed(String topic) {
    topicConnected = true;
//    connectedColor = Colors.lightGreenAccent;
  }

  /// The unsolicited disconnect callback
  void _onDisconnected() {
      topicConnected = false;
//      connectedColor = Colors.white;
  }

  /// The successful connect callback
  void _onConnected() {
//      connectedColor = Colors.lightBlueAccent;
  }

  Future<bool> connect() async {
    const MAX_BARS = 16;
    try {
      // reset received messages
      _lightMessages.clear();
      _tempMessages.clear();
      _humidMessages.clear();
      _loudMessages.clear();

      await _client.connect();

      // check connection status
      if (_client.connectionStatus.state == MqttConnectionState.connected) {
        // register messages
        _client.updates.listen((List<MqttReceivedMessage<MqttMessage>> m) {
          final MqttPublishMessage recMess = m[0].payload;

          var pkg = MqttPublishPayload.bytesToStringAsString(recMess.payload.message);
          var res = jsonDec.convert(pkg);
          var dt = DateTime.parse(res["datetime"]);
          try {
            _lightMessages.add(DataPacket(res['luminosity'].toDouble(), dt, anomaly: res['anomaly']));
            _tempMessages.add(DataPacket(res['temperature'].toDouble(), dt, anomaly: res['anomaly']));
            _humidMessages.add(DataPacket(res['humidity'].toDouble(), dt, anomaly: res['anomaly']));
            _loudMessages.add(DataPacket(res['loudness'].toDouble(), dt, anomaly: res['anomaly']));

            if (_lightMessages.length > MAX_BARS) {
              _lightMessages.removeFirst();
            }
            if (_tempMessages.length > MAX_BARS) {
              _tempMessages.removeFirst();
            }
            if (_humidMessages.length > MAX_BARS) {
              _humidMessages.removeFirst();
            }
            if (_loudMessages.length > MAX_BARS) {
              _loudMessages.removeFirst();
            }
          }
          catch (e) { /* ignore errors */ }

          // update the state of the Widget that has passed this function
          if (onUpdate != null) onUpdate();
        });

      } else {
        /// Use status here rather than state if you also want the broker return code.
        _client.disconnect();
        return false;
      }

      /// Ok, lets try a subscription
      _client.subscribe(topic, MqttQos.atMostOnce);

      return true;
    }
    on Exception catch (e) {
      _client.disconnect();
      return false;
    }
  }

  void disconnect() async {
    if (topicConnected) {
      _client.unsubscribe("ciaone");

      await MqttUtilities.asyncSleep(1);
      _client.disconnect();
    }
  }
}

/*
  @override
  Widget build(BuildContext context) {
    return new Switch.adaptive(
        value: switchValue,
        onChanged: _onChanged,
        activeColor: connectedColor,
    );
  }
class MQTTConnector extends StatefulWidget {
  State<MQTTConnector> currentState;
  @override
  State<StatefulWidget> createState() {
    currentState = new MQTTConnectorState();
    return currentState;
  }
}*/
