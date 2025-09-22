abstract class StorageServiceInterface {
  Future<bool> setString(String key, String value);
  Future<bool> setInt(String key, int value);
  Future<bool> setBool(String key, bool value);
  Future<bool> setDouble(String key, double value);
  Future<bool> setStringList(String key, List<String> value);
  
  String? getString(String key);
  int? getInt(String key);
  bool? getBool(String key);
  double? getDouble(String key);
  List<String>? getStringList(String key);
  
  Future<bool> remove(String key);
  Future<bool> clear();
  Future<bool> containsKey(String key);
  Set<String> getKeys();
}
