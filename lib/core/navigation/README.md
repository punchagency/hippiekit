# NavigationHelper

A comprehensive navigation utility class for the HippieKit app that provides both context-free and context-based navigation methods.

## Features

- **Context-free navigation**: Navigate without needing BuildContext
- **Backward compatibility**: Legacy methods that require BuildContext
- **Router initialization**: Automatic router setup
- **Error handling**: Graceful handling of navigation errors
- **Multiple navigation types**: Push, replace, go, pop operations

## Setup

The NavigationHelper is automatically initialized in `main.dart`:

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await init();
  AppRouter.initialize(); // Initialize NavigationHelper
  runApp(const HippieKitApp());
}
```

## Usage

### Context-free Navigation (Recommended)

```dart
import 'package:hippiekit/core/navigation/navigation_helper.dart';

// Navigate to a route
await NavigationHelper.go(route: '/dashboard');

// Push a new route
await NavigationHelper.push(route: '/profile');

// Push with data
await NavigationHelper.pushWithParams(
  route: '/user-details',
  data: {'userId': 123, 'name': 'John'},
);

// Replace current route
await NavigationHelper.replace(route: '/login');

// Push replacement
await NavigationHelper.pushReplacement(route: '/onboarding');

// Pop current route
NavigationHelper.pop();

// Check if can pop
bool canGoBack = NavigationHelper.canPop();

// Get current location
String? currentRoute = NavigationHelper.currentLocation;
```

### Legacy Context-based Navigation

```dart
import 'package:hippiekit/core/navigation/navigation_helper.dart';

// Using with BuildContext
await NavigationHelper.goWithContext(
  context: context,
  route: '/dashboard',
);

await NavigationHelper.pushWithContext(
  context: context,
  route: '/profile',
);

await NavigationHelper.pushWithParamsAndContext(
  context: context,
  route: '/user-details',
  data: userData,
);
```

## Integration with ViewModels

The NavigationHelper is particularly useful in ViewModels where you don't have access to BuildContext:

```dart
class AuthViewModel extends BaseViewModel {
  Future<void> login(String email, String password) async {
    // ... authentication logic ...
    
    if (loginSuccessful) {
      // Navigate to dashboard without context
      NavigationHelper.go(route: '/dashboard');
    }
  }
}
```

## Available Routes

- `/splash` - Splash screen
- `/onboarding` - Onboarding flow
- `/login` - Login page
- `/signup` - Sign up page
- `/dashboard` - Main dashboard
- `/scan` - Scan functionality
- `/favorites` - Favorites page
- `/profile` - User profile

## Error Handling

The NavigationHelper includes built-in error handling:

- Router not initialized: Prints warning message
- Context not mounted: Returns early for context-based methods
- Navigation failures: Handled gracefully by GoRouter

## Best Practices

1. **Use context-free methods** in ViewModels and business logic
2. **Use context-based methods** only when you have direct access to BuildContext
3. **Initialize early** in your app lifecycle
4. **Handle navigation errors** appropriately in your UI
5. **Use appropriate navigation type**:
   - `go()` for auth redirects and main navigation
   - `push()` for modal-like navigation
   - `replace()` for replacing current screen
   - `pushReplacement()` for onboarding flows
