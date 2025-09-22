import 'package:dio/dio.dart';
import '../network/dio_client.dart';
import 'interfaces/network_service_interface.dart';

class NetworkService implements NetworkServiceInterface {
  @override
  Dio get dio => DioClient.instance;

  @override
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    return await dio.get<T>(
      path,
      queryParameters: queryParameters,
    );
  }

  @override
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    return await dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
    );
  }

  @override
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    return await dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
    );
  }

  @override
  Future<Response<T>> delete<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    return await dio.delete<T>(
      path,
      queryParameters: queryParameters,
    );
  }

  @override
  Future<void> reset() async {
    await DioClient.reset();
  }
}
