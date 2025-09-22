import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'core/navigation/app_router.dart';
import 'core/services/theme_service.dart';
import 'core/services/snackbar_service.dart';
import 'core/utils/service_locator.dart';
import 'core/providers/app_providers.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await init();
  runApp(const HippieKitApp());
}

class HippieKitApp extends StatelessWidget {
  const HippieKitApp({super.key});

  @override
  Widget build(BuildContext context) {
    return AppProviders.createApp(
      Consumer<ThemeService>(
        builder: (context, themeService, child) {
          return MaterialApp.router(
            title: 'HippieKit',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeService.themeMode,
            routerConfig: AppRouter.router,
            scaffoldMessengerKey: SnackbarService.scaffoldKey,
          );
        },
      ),
    );
  }
}