class DataPacket<T> {
  final T value;
  final DateTime time;
  final bool anomaly;

  DataPacket(this.value, this.time, {this.anomaly : false});
}