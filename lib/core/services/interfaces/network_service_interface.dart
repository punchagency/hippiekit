import 'package:dio/dio.dart';

abstract class NetworkServiceInterface {
  Dio get dio;
  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters});
  Future<Response<T>> post<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters});
  Future<Response<T>> put<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters});
  Future<Response<T>> delete<T>(String path, {Map<String, dynamic>? queryParameters});
  Future<void> reset();
}
