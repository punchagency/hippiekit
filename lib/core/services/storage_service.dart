import 'package:shared_preferences/shared_preferences.dart';
import 'interfaces/storage_service_interface.dart';

class StorageService implements StorageServiceInterface {
  static SharedPreferences? _prefs;
  
  static Future<SharedPreferences> get _preferences async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  @override
  Future<bool> setString(String key, String value) async {
    final prefs = await _preferences;
    return await prefs.setString(key, value);
  }

  @override
  Future<bool> setInt(String key, int value) async {
    final prefs = await _preferences;
    return await prefs.setInt(key, value);
  }

  @override
  Future<bool> setBool(String key, bool value) async {
    final prefs = await _preferences;
    return await prefs.setBool(key, value);
  }

  @override
  Future<bool> setDouble(String key, double value) async {
    final prefs = await _preferences;
    return await prefs.setDouble(key, value);
  }

  @override
  Future<bool> setStringList(String key, List<String> value) async {
    final prefs = await _preferences;
    return await prefs.setStringList(key, value);
  }

  @override
  String? getString(String key) {
    return _prefs?.getString(key);
  }

  @override
  int? getInt(String key) {
    return _prefs?.getInt(key);
  }

  @override
  bool? getBool(String key) {
    return _prefs?.getBool(key);
  }

  @override
  double? getDouble(String key) {
    return _prefs?.getDouble(key);
  }

  @override
  List<String>? getStringList(String key) {
    return _prefs?.getStringList(key);
  }

  @override
  Future<bool> remove(String key) async {
    final prefs = await _preferences;
    return await prefs.remove(key);
  }

  @override
  Future<bool> clear() async {
    final prefs = await _preferences;
    return await prefs.clear();
  }

  @override
  Future<bool> containsKey(String key) async {
    final prefs = await _preferences;
    return prefs.containsKey(key);
  }

  @override
  Set<String> getKeys() {
    return _prefs?.getKeys() ?? <String>{};
  }
}
