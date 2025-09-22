import 'package:dio/dio.dart';
import 'api_result.dart';
import '../errors/network_exceptions.dart';
import '../services/interfaces/network_service_interface.dart';
import '../utils/di.dart';

class ApiClient {
  final NetworkServiceInterface _networkService = DI.get<NetworkServiceInterface>();

  /// GET request with Either return type
  Future<ApiResult<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _networkService.get<T>(
        path,
        queryParameters: queryParameters,
      );
      
      if (fromJson != null) {
        final data = fromJson(response.data);
        return ApiResultHelper.success(data);
      }
      
      return ApiResultHelper.success(response.data as T);
    } on NetworkException catch (e) {
      return ApiResultHelper.failure<T>(e);
    } on Exception catch (e) {
      return ApiResultHelper.failureFromException<T>(e);
    }
  }

  /// POST request with Either return type
  Future<ApiResult<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _networkService.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
      );
      
      if (fromJson != null) {
        final responseData = fromJson(response.data);
        return ApiResultHelper.success(responseData);
      }
      
      return ApiResultHelper.success(response.data as T);
    } on NetworkException catch (e) {
      return ApiResultHelper.failure<T>(e);
    } on Exception catch (e) {
      return ApiResultHelper.failureFromException<T>(e);
    }
  }

  /// PUT request with Either return type
  Future<ApiResult<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _networkService.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
      );
      
      if (fromJson != null) {
        final responseData = fromJson(response.data);
        return ApiResultHelper.success(responseData);
      }
      
      return ApiResultHelper.success(response.data as T);
    } on NetworkException catch (e) {
      return ApiResultHelper.failure<T>(e);
    } on Exception catch (e) {
      return ApiResultHelper.failureFromException<T>(e);
    }
  }

  /// DELETE request with Either return type
  Future<ApiResult<T>> delete<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _networkService.delete<T>(
        path,
        queryParameters: queryParameters,
      );
      
      if (fromJson != null) {
        final responseData = fromJson(response.data);
        return ApiResultHelper.success(responseData);
      }
      
      return ApiResultHelper.success(response.data as T);
    } on NetworkException catch (e) {
      return ApiResultHelper.failure<T>(e);
    } on Exception catch (e) {
      return ApiResultHelper.failureFromException<T>(e);
    }
  }

  /// Upload file with Either return type
  Future<ApiResult<T>> uploadFile<T>(
    String path,
    String filePath, {
    String fieldName = 'file',
    Map<String, dynamic>? additionalData,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final formData = FormData.fromMap({
        fieldName: await MultipartFile.fromFile(filePath),
        ...?additionalData,
      });

      final response = await _networkService.post<T>(
        path,
        data: formData,
      );
      
      if (fromJson != null) {
        final responseData = fromJson(response.data);
        return ApiResultHelper.success(responseData);
      }
      
      return ApiResultHelper.success(response.data as T);
    } on NetworkException catch (e) {
      return ApiResultHelper.failure<T>(e);
    } on Exception catch (e) {
      return ApiResultHelper.failureFromException<T>(e);
    }
  }
}
