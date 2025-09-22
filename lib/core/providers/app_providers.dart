import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/theme_service.dart';
import '../utils/service_locator.dart';

class AppProviders {
  static List<ChangeNotifierProvider> get providers => [
    ChangeNotifierProvider<ThemeService>(create: (_) => sl<ThemeService>()),
    // Add other providers as needed
  ];

  static MultiProvider createApp(Widget child) {
    return MultiProvider(providers: providers, child: child);
  }
}
