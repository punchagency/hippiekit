import 'package:flutter/material.dart';

abstract class ThemeServiceInterface {
  ThemeMode get themeMode;
  bool get isDarkMode;
  String get themeModeString;
  
  Future<void> setThemeMode(ThemeMode mode);
  Future<void> toggleTheme();
}
