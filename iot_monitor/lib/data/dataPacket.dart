class DataPacket<T> {
  final T value;
  final DateTime time;

  DataPacket(this.value, this.time);
}