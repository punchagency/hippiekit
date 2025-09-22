import '../../../../core/network/api_result.dart';
import '../../../../shared/models/user_model.dart';

abstract class AuthRepository {
  Future<ApiResult<UserModel>> login(String email, String password);
  Future<ApiResult<UserModel>> register(String email, String password, String name);
  Future<ApiResult<void>> logout();
  Future<ApiResult<UserModel>> getCurrentUser();
  Future<ApiResult<void>> refreshToken();
  Future<ApiResult<void>> forgotPassword(String email);
  Future<ApiResult<void>> resetPassword(String token, String newPassword);
  Future<ApiResult<bool>> isLoggedIn();
  Future<ApiResult<UserModel?>> getCachedUser();
}
