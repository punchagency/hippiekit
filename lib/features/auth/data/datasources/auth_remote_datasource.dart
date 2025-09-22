import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_result.dart';
import '../../../../shared/models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<ApiResult<UserModel>> login(String email, String password);
  Future<ApiResult<UserModel>> register(String email, String password, String name);
  Future<ApiResult<void>> logout();
  Future<ApiResult<UserModel>> getCurrentUser();
  Future<ApiResult<void>> refreshToken();
  Future<ApiResult<void>> forgotPassword(String email);
  Future<ApiResult<void>> resetPassword(String token, String newPassword);
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final ApiClient _apiClient = ApiClient();

  @override
  Future<ApiResult<UserModel>> login(String email, String password) async {
    return await _apiClient.post<UserModel>(
      '/auth/login',
      data: {
        'email': email,
        'password': password,
      },
      fromJson: (json) => UserModel.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<ApiResult<UserModel>> register(String email, String password, String name) async {
    return await _apiClient.post<UserModel>(
      '/auth/register',
      data: {
        'email': email,
        'password': password,
        'name': name,
      },
      fromJson: (json) => UserModel.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<ApiResult<void>> logout() async {
    return await _apiClient.post<void>('/auth/logout');
  }

  @override
  Future<ApiResult<UserModel>> getCurrentUser() async {
    return await _apiClient.get<UserModel>(
      '/auth/me',
      fromJson: (json) => UserModel.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<ApiResult<void>> refreshToken() async {
    return await _apiClient.post<void>('/auth/refresh');
  }

  @override
  Future<ApiResult<void>> forgotPassword(String email) async {
    return await _apiClient.post<void>(
      '/auth/forgot-password',
      data: {'email': email},
    );
  }

  @override
  Future<ApiResult<void>> resetPassword(String token, String newPassword) async {
    return await _apiClient.post<void>(
      '/auth/reset-password',
      data: {
        'token': token,
        'password': newPassword,
      },
    );
  }
}
