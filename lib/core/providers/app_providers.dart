import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/theme_service.dart';
import '../utils/di.dart';

class AppProviders {
  static List<ChangeNotifierProvider> get providers => [
    ChangeNotifierProvider<ThemeService>(
      create: (_) => DI.get<ThemeService>(),
    ),
    // Add other providers as needed
  ];

  static MultiProvider createApp(Widget child) {
    return MultiProvider(
      providers: providers,
      child: child,
    );
  }
}
