# Dartz Integration for API Requests

This project uses Dartz for functional programming with Either types to handle API request responses in a robust and type-safe manner.

## Overview

Dartz provides:
- **Either<L, R>**: Represents a value that is either a Left (failure) or Right (success)
- **Type Safety**: Compile-time guarantees about success/failure states
- **Functional Programming**: Immutable, composable operations
- **Error Handling**: Explicit error handling without exceptions

## Architecture

### ApiResult<T>
```dart
typedef ApiResult<T> = Either<NetworkException, T>;
```
- **Left**: NetworkException (failure)
- **Right**: T (success data)

### ApiClient
Centralized HTTP client that returns `ApiResult<T>` for all requests:
```dart
final result = await apiClient.get<UserModel>('/users/1');
result.fold(
  (failure) => print('Error: $failure'),
  (user) => print('User: $user'),
);
```

## Usage Examples

### Basic API Call
```dart
class UserRepository {
  final ApiClient _apiClient = DI.get<ApiClient>();

  Future<ApiResult<UserModel>> getUser(String id) async {
    return await _apiClient.get<UserModel>(
      '/users/$id',
      fromJson: (json) => UserModel.fromJson(json),
    );
  }
}
```

### Handling Results in ViewModels
```dart
class UserViewModel extends BaseViewModel {
  Future<void> loadUser(String id) async {
    setLoading(true);
    
    final result = await _userRepository.getUser(id);
    
    result.fold(
      (failure) {
        showError('Failed to load user: ${failure.toString()}');
        setError(failure.toString());
      },
      (user) {
        _currentUser = user;
        notifyListeners();
      },
    );
    
    setLoading(false);
  }
}
```

### Chaining Operations
```dart
Future<ApiResult<String>> processUser(String id) async {
  return await getUser(id)
    .mapSuccess((user) => user.name)
    .mapSuccess((name) => name.toUpperCase());
}
```

### Error Handling
```dart
result.fold(
  (failure) {
    switch (failure.runtimeType) {
      case NoInternetConnection:
        showError('No internet connection');
        break;
      case ServerException:
        showError('Server error: ${failure.message}');
        break;
      case TimeoutException:
        showError('Request timeout');
        break;
      default:
        showError('Unknown error');
    }
  },
  (data) {
    // Handle success
  },
);
```

## Benefits

### 1. Type Safety
- Compile-time guarantees about success/failure states
- No null pointer exceptions from API responses
- Clear error types

### 2. Explicit Error Handling
- Forces you to handle both success and failure cases
- No silent failures or uncaught exceptions
- Clear error propagation

### 3. Functional Composition
- Chain operations with `map`, `flatMap`, `fold`
- Immutable data structures
- Predictable behavior

### 4. Testability
- Easy to mock `ApiResult` for testing
- Clear separation of success/failure paths
- No side effects in pure functions

## API Response Patterns

### Simple Response
```dart
Future<ApiResult<UserModel>> getUser(String id) async {
  return await _apiClient.get<UserModel>('/users/$id');
}
```

### Paginated Response
```dart
Future<ApiResult<PaginatedResponse<UserModel>>> getUsers({
  int page = 1,
  int limit = 10,
}) async {
  return await _apiClient.get<PaginatedResponse<UserModel>>(
    '/users',
    queryParameters: {'page': page, 'limit': limit},
  );
}
```

### File Upload
```dart
Future<ApiResult<String>> uploadAvatar(String filePath) async {
  return await _apiClient.uploadFile<String>(
    '/users/avatar',
    filePath,
    fieldName: 'avatar',
  );
}
```

## Error Types

### NetworkException
- `NoInternetConnection`: No internet connection
- `ServerException`: HTTP error responses
- `TimeoutException`: Request timeout
- `UnknownException`: Unexpected errors

### Usage in UI
```dart
result.fold(
  (failure) {
    if (failure is NoInternetConnection) {
      // Show offline message
    } else if (failure is ServerException) {
      // Show server error
    } else {
      // Show generic error
    }
  },
  (data) {
    // Update UI with data
  },
);
```

## Best Practices

1. **Always handle both cases**: Use `fold` to handle both success and failure
2. **Use specific error types**: Create custom error types for different scenarios
3. **Chain operations**: Use `map` and `flatMap` for data transformation
4. **Keep functions pure**: Avoid side effects in data transformation functions
5. **Test both paths**: Write tests for both success and failure scenarios

## Migration from Traditional Error Handling

### Before (Exception-based)
```dart
try {
  final user = await api.getUser(id);
  // Handle success
} catch (e) {
  // Handle error
}
```

### After (Either-based)
```dart
final result = await api.getUser(id);
result.fold(
  (failure) => // Handle error,
  (user) => // Handle success,
);
```

This approach provides better type safety, explicit error handling, and functional composition capabilities.
