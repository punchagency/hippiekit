import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';

abstract class NetworkException extends Equatable {
  const NetworkException();

  @override
  List<Object?> get props => [];
}

class NoInternetConnection extends NetworkException {
  const NoInternetConnection() : super();
}

class ServerException extends NetworkException {
  final String message;
  final int? statusCode;

  const ServerException(this.message, {this.statusCode});

  @override
  List<Object?> get props => [message, statusCode];
}

class TimeoutException extends NetworkException {
  const TimeoutException() : super();
}

class UnknownException extends NetworkException {
  final String message;

  const UnknownException(this.message);

  @override
  List<Object?> get props => [message];
}

class NetworkExceptions {
  static NetworkException getDioException(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const TimeoutException();
      
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final message = _getErrorMessage(error.response?.data);
        return ServerException(message, statusCode: statusCode);
      
      case DioExceptionType.cancel:
        return const UnknownException('Request was cancelled');
      
      case DioExceptionType.connectionError:
        return const NoInternetConnection();
      
      case DioExceptionType.unknown:
        if (error.error is NetworkException) {
          return error.error as NetworkException;
        }
        return UnknownException(error.message ?? 'An unknown error occurred');
      
      default:
        return UnknownException(error.message ?? 'An unknown error occurred');
    }
  }

  static String _getErrorMessage(dynamic data) {
    if (data is Map<String, dynamic>) {
      return data['message'] ?? 
             data['error'] ?? 
             data['detail'] ?? 
             'An error occurred';
    }
    return 'An error occurred';
  }
}

