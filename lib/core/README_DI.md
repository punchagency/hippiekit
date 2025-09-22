# Dependency Injection Setup

This project uses GetIt for dependency injection with a clean architecture approach.

## Structure

### Services
- **Interfaces**: Define contracts for all services
- **Implementations**: Concrete implementations of service interfaces
- **Registration**: All services are registered in `service_locator.dart`

### Available Services

#### ThemeServiceInterface
- Manages app theme (light/dark/system)
- Persists theme preference using StorageService
- Access via: `DI.get<ThemeServiceInterface>()`

#### NetworkServiceInterface
- Handles all HTTP requests using Dio
- Includes interceptors for auth, logging, error handling
- Access via: `DI.get<NetworkServiceInterface>()`

#### StorageServiceInterface
- Manages local storage using SharedPreferences
- Provides typed access to stored data
- Access via: `DI.get<StorageServiceInterface>()`

#### SnackbarServiceInterface
- Shows user notifications and error messages
- Global access without context
- Access via: `DI.get<SnackbarServiceInterface>()`

## Usage Examples

### In ViewModels
```dart
class MyViewModel extends BaseViewModel {
  final NetworkServiceInterface _networkService = DI.get<NetworkServiceInterface>();
  final StorageServiceInterface _storageService = DI.get<StorageServiceInterface>();

  Future<void> fetchData() async {
    setLoading(true);
    try {
      final response = await _networkService.get('/api/data');
      // Process response
    } catch (e) {
      showError('Failed to fetch data: $e');
    } finally {
      setLoading(false);
    }
  }
}
```

### In Repositories
```dart
class MyRepository extends BaseRepository {
  Future<MyModel> getData() async {
    try {
      final response = await networkService.get('/api/data');
      return MyModel.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to get data: $e');
    }
  }
}
```

### In Widgets
```dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final themeService = DI.get<ThemeServiceInterface>();
    
    return Consumer<ThemeServiceInterface>(
      builder: (context, theme, child) {
        return Text('Current theme: ${theme.themeModeString}');
      },
    );
  }
}
```

## Adding New Services

1. Create interface in `lib/core/services/interfaces/`
2. Create implementation in `lib/core/services/`
3. Register in `service_locator.dart`
4. Use `DI.get<YourServiceInterface>()` to access

## Benefits

- **Testability**: Easy to mock services for testing
- **Loose Coupling**: Dependencies are injected, not hardcoded
- **Single Responsibility**: Each service has a clear purpose
- **Maintainability**: Easy to swap implementations
- **Type Safety**: Interfaces provide compile-time safety
