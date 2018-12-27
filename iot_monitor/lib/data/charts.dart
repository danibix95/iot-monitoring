import 'package:flutter/material.dart';
import 'package:charts_flutter/flutter.dart' as charts;

import 'package:iot_monitor/data/dataPacket.dart';

class TimeSeriesBar extends StatelessWidget {
  final List<charts.Series<DataPacket<double>, DateTime>> seriesList;
  final bool animate;

  TimeSeriesBar(this.seriesList, {this.animate});

  /// Creates a [TimeSeriesChart] with sample data and no transition.
  factory TimeSeriesBar.withSampleData() {
    return TimeSeriesBar(
      _createSampleData(),
      // Disable animations for image tests.
      animate: false,
    );
  }

  factory TimeSeriesBar.fromList(Iterable<DataPacket<double>> packetsList, animate) {
    return TimeSeriesBar(
      [
        new charts.Series<DataPacket<double>, DateTime>(
          id: 'Sensors',
          colorFn: (DataPacket<double> pkt, _) =>
          pkt.value > 60 ? charts.MaterialPalette.deepOrange.shadeDefault
              : charts.MaterialPalette.indigo.shadeDefault,
          domainFn: (DataPacket<double> pkt, _) => pkt.time,
          measureFn: (DataPacket<double> pkt, _) => pkt.value,
          data: List.from(packetsList)
        )
      ],
      // Disable animations for image tests.
      animate: animate,
    );
  }

  @override
  Widget build(BuildContext context) {
    return new charts.TimeSeriesChart(
      seriesList,
      animate: animate,
      // Set the default renderer to a bar renderer.
      // This can also be one of the custom renderers of the time series chart.
      defaultRenderer: new charts.BarRendererConfig<DateTime>(),
      // Indicate that this time axis is being used with a bar renderer.
      domainAxis: new charts.DateTimeAxisSpec(usingBarRenderer: true),
      // It is recommended that default interactions be turned off if using bar
      // renderer, because the line point highlighter is the default for time
      // series chart.
      defaultInteractions: false,
      // If default interactions were removed, optionally add select nearest
      // and the domain highlighter that are typical for bar charts.
      behaviors: [new charts.SelectNearest(), new charts.DomainHighlighter()],
    );
  }

  /// Create one series with sample hard coded data.
  static List<charts.Series<DataPacket<double>, DateTime>> _createSampleData() {
    var data = [
      DataPacket<double>(5, DateTime(2017, 9, 1)),
      DataPacket<double>(5, DateTime(2017, 9, 2)),
      DataPacket<double>(25, DateTime(2017, 9, 3)),
      DataPacket<double>(100, DateTime(2017, 9, 4)),
      DataPacket<double>(75, DateTime(2017, 9, 5)),
      DataPacket<double>(88, DateTime(2017, 9, 6)),
      DataPacket<double>(65, DateTime(2017, 9, 7)),
      DataPacket<double>(91, DateTime(2017, 9, 8)),
      DataPacket<double>(100, DateTime(2017, 9, 9)),
      DataPacket<double>(111, DateTime(2017, 9, 10)),
      DataPacket<double>(90, DateTime(2017, 9, 11)),
      DataPacket<double>(50, DateTime(2017, 9, 12)),
      DataPacket<double>(40, DateTime(2017, 9, 13)),
      DataPacket<double>(30, DateTime(2017, 9, 14)),
      DataPacket<double>(40, DateTime(2017, 9, 15)),
      DataPacket<double>(50, DateTime(2017, 9, 16)),
      DataPacket<double>(30, DateTime(2017, 9, 17)),
      DataPacket<double>(35, DateTime(2017, 9, 18)),
      DataPacket<double>(40, DateTime(2017, 9, 19)),
      DataPacket<double>(32, DateTime(2017, 9, 20)),
      DataPacket<double>(31, DateTime(2017, 9, 21)),
    ];

    return [
      new charts.Series<DataPacket<double>, DateTime>(
        id: 'Sensors',
        colorFn: (DataPacket data, _) =>
          data.value > 60 ? charts.MaterialPalette.deepOrange.shadeDefault
                          : charts.MaterialPalette.indigo.shadeDefault,
        domainFn: (DataPacket data, _) => data.time,
        measureFn: (DataPacket data, _) => data.value,
        data: data,
      )
    ];
  }
}