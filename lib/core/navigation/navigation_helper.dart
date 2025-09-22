import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Global navigator key for context-free navigation
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

class NavigationHelper {
  static GoRouter? _router;

  /// Initialize the router reference for context-free navigation
  static void initialize(GoRouter router) {
    _router = router;
  }

  /// Get the current router instance
  static GoRouter? get router => _router;

  /// Pushes a new page onto the navigation stack.
  static Future<void> push({required String route}) async {
    if (_router != null) {
      await _router!.push(route);
    } else {
      print('NavigationHelper: Router not initialized');
    }
  }

  /// Pushes a new page with parameters onto the navigation stack.
  static Future<void> pushWithParams({
    required String route,
    required dynamic data,
  }) async {
    if (_router != null) {
      await _router!.push(route, extra: data);
    } else {
      print('NavigationHelper: Router not initialized');
    }
  }

  /// Replaces the current page, clearing the navigation stack.
  static Future<void> replace({required String route}) async {
    if (_router != null) {
      _router!.go(route);
    } else {
      print('NavigationHelper: Router not initialized');
    }
  }

  /// Pushes a new page onto the navigation stack (keeping history).
  static Future<void> pushReplacement({required String route}) async {
    if (_router != null) {
      _router!.pushReplacement(route);
    } else {
      print('NavigationHelper: Router not initialized');
    }
  }

  /// Navigates to a route without adding to history (for auth redirects).
  static Future<void> go({required String route}) async {
    if (_router != null) {
      _router!.go(route);
    } else {
      print('NavigationHelper: Router not initialized');
    }
  }

  /// Pop the current route
  static void pop() {
    if (_router != null) {
      _router!.pop();
    } else {
      print('NavigationHelper: Router not initialized');
    }
  }

  /// Check if can pop
  static bool canPop() {
    if (_router != null) {
      return _router!.canPop();
    }
    return false;
  }

  /// Get current location
  static String? get currentLocation {
    if (_router != null) {
      return _router!.routerDelegate.currentConfiguration.uri.toString();
    }
    return null;
  }

  // Legacy methods for backward compatibility
  static Future<void> pushWithContext({
    required BuildContext context,
    required String route,
  }) async {
    if (!context.mounted) return;
    await context.push(route);
  }

  static Future<void> pushWithParamsAndContext({
    required BuildContext context,
    required String route,
    required dynamic data,
  }) async {
    if (!context.mounted) return;
    await context.push(route, extra: data);
  }

  static Future<void> replaceWithContext({
    required BuildContext context,
    required String route,
  }) async {
    if (!context.mounted) return;
    context.go(route);
  }

  static Future<void> pushReplacementWithContext({
    required BuildContext context,
    required String route,
  }) async {
    if (!context.mounted) return;
    context.pushReplacement(route);
  }

  static Future<void> goWithContext({
    required BuildContext context,
    required String route,
  }) async {
    if (!context.mounted) return;
    context.go(route);
  }
}
