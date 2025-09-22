import 'package:dartz/dartz.dart';
import '../errors/network_exceptions.dart';

/// Represents the result of an API call
/// Left: Failure (NetworkException)
/// Right: Success (T)
typedef ApiResult<T> = Either<NetworkException, T>;

/// Extension methods for ApiResult
extension ApiResultExtension<T> on ApiResult<T> {
  /// Check if the result is a success
  bool get isSuccess => isRight();
  
  /// Check if the result is a failure
  bool get isFailure => isLeft();
  
  /// Get the success value or null
  T? get successValue => fold((l) => null, (r) => r);
  
  /// Get the failure value or null
  NetworkException? get failureValue => fold((l) => l, (r) => null);
  
  /// Transform the success value
  ApiResult<R> mapSuccess<R>(R Function(T) transform) {
    return map(transform);
  }
  
  /// Transform the failure value
  ApiResult<T> mapFailure(NetworkException Function(NetworkException) transform) {
    return leftMap(transform);
  }
  
  /// Execute different functions based on success or failure
  R fold<R>(
    R Function(NetworkException) onFailure,
    R Function(T) onSuccess,
  ) {
    return fold(onFailure, onSuccess);
  }
  
  /// Execute a function if success
  ApiResult<T> onSuccess(void Function(T) action) {
    fold(
      (failure) => null,
      (success) => action(success),
    );
    return this;
  }
  
  /// Execute a function if failure
  ApiResult<T> onFailure(void Function(NetworkException) action) {
    fold(
      (failure) => action(failure),
      (success) => null,
    );
    return this;
  }
}

/// Helper functions for creating ApiResult
class ApiResultHelper {
  /// Create a success result
  static ApiResult<T> success<T>(T value) => Right(value);
  
  /// Create a failure result
  static ApiResult<T> failure<T>(NetworkException exception) => Left(exception);
  
  /// Create a failure result from a generic exception
  static ApiResult<T> failureFromException<T>(Exception exception) {
    return Left(UnknownException(exception.toString()));
  }
  
  /// Create a failure result from a string message
  static ApiResult<T> failureFromMessage<T>(String message) {
    return Left(UnknownException(message));
  }
}
