import 'package:flutter/material.dart';
import '../constants/app_resources.dart';
import 'interfaces/theme_service_interface.dart';
import 'interfaces/storage_service_interface.dart';
import '../utils/service_locator.dart';

class ThemeService extends ChangeNotifier implements ThemeServiceInterface {
  static const String _themeKey = AppResources.themeKey;
  
  ThemeMode _themeMode = ThemeMode.system;
  bool _isDarkMode = false;
  late final StorageServiceInterface _storageService;

  @override
  ThemeMode get themeMode => _themeMode;
  
  @override
  bool get isDarkMode => _isDarkMode;

  ThemeService() {
    _storageService = sl<StorageServiceInterface>();
    _loadTheme();
  }

  Future<void> _loadTheme() async {
    final themeIndex = _storageService.getInt(_themeKey) ?? 0;
    _themeMode = ThemeMode.values[themeIndex];
    _isDarkMode = _themeMode == ThemeMode.dark;
    notifyListeners();
  }

  @override
  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    _isDarkMode = mode == ThemeMode.dark;
    
    await _storageService.setInt(_themeKey, mode.index);
    
    notifyListeners();
  }

  @override
  Future<void> toggleTheme() async {
    if (_themeMode == ThemeMode.light) {
      await setThemeMode(ThemeMode.dark);
    } else if (_themeMode == ThemeMode.dark) {
      await setThemeMode(ThemeMode.light);
    } else {
      // If system, toggle to light
      await setThemeMode(ThemeMode.light);
    }
  }

  @override
  String get themeModeString {
    switch (_themeMode) {
      case ThemeMode.light:
        return 'Light';
      case ThemeMode.dark:
        return 'Dark';
      case ThemeMode.system:
        return 'System';
    }
  }
}

