import 'service_locator.dart';

/// Dependency Injection helper for easier access to services
class DI {
  // Services
  static T get<T extends Object>() => sl<T>();
  
  // Specific service getters for convenience
  static T theme<T extends Object>() => sl<T>();
  static T network<T extends Object>() => sl<T>();
  static T storage<T extends Object>() => sl<T>();
  static T snackbar<T extends Object>() => sl<T>();
}
