import '../../../../core/network/api_result.dart';
import '../../../../core/repositories/base_repository.dart';
import '../../../../shared/models/user_model.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';

class AuthRepositoryImpl extends BaseRepository implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;

  AuthRepositoryImpl({required AuthRemoteDataSource remoteDataSource})
      : _remoteDataSource = remoteDataSource;

  @override
  Future<ApiResult<UserModel>> login(String email, String password) async {
    return await _remoteDataSource.login(email, password);
  }

  @override
  Future<ApiResult<UserModel>> register(String email, String password, String name) async {
    return await _remoteDataSource.register(email, password, name);
  }

  @override
  Future<ApiResult<void>> logout() async {
    final result = await _remoteDataSource.logout();
    
    // Clear local storage on successful logout
    return result.fold(
      (failure) => result,
      (success) async {
        await storageService.remove('user_token');
        await storageService.remove('user_data');
        return ApiResultHelper.success<void>(success);
      },
    );
  }

  @override
  Future<ApiResult<UserModel>> getCurrentUser() async {
    return await _remoteDataSource.getCurrentUser();
  }

  @override
  Future<ApiResult<void>> refreshToken() async {
    return await _remoteDataSource.refreshToken();
  }

  @override
  Future<ApiResult<void>> forgotPassword(String email) async {
    return await _remoteDataSource.forgotPassword(email);
  }

  @override
  Future<ApiResult<void>> resetPassword(String token, String newPassword) async {
    return await _remoteDataSource.resetPassword(token, newPassword);
  }

  @override
  Future<ApiResult<bool>> isLoggedIn() async {
    final token = storageService.getString('user_token');
    return ApiResultHelper.success(token != null);
  }

  @override
  Future<ApiResult<UserModel?>> getCachedUser() async {
    final userData = storageService.getString('user_data');
    if (userData != null) {
      try {
        // Parse cached user data
        // This would need proper JSON parsing in a real implementation
        return ApiResultHelper.success<UserModel?>(null);
      } catch (e) {
        return ApiResultHelper.failureFromMessage<UserModel?>('Failed to parse cached user data');
      }
    }
    return ApiResultHelper.success<UserModel?>(null);
  }
}
