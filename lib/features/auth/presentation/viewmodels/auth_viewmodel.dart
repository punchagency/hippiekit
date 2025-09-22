import '../../../../core/viewmodels/base_viewmodel.dart';
import '../../../../core/utils/di.dart';
import '../../../../shared/models/user_model.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthViewModel extends BaseViewModel {
  final AuthRepository _authRepository = DI.get<AuthRepository>();

  UserModel? _currentUser;
  bool _isLoggedIn = false;

  UserModel? get currentUser => _currentUser;
  bool get isLoggedIn => _isLoggedIn;

  void initialize() {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    setLoading(true);
    try {
      final isLoggedInResult = await _authRepository.isLoggedIn();
      
      isLoggedInResult.fold(
        (failure) => showError('Failed to check auth status: ${failure.toString()}'),
        (isLoggedIn) async {
          _isLoggedIn = isLoggedIn;
          
          if (isLoggedIn) {
            await _loadCurrentUser();
          }
          
          notifyListeners();
        },
      );
    } finally {
      setLoading(false);
    }
  }

  Future<void> _loadCurrentUser() async {
    final result = await _authRepository.getCurrentUser();
    
    result.fold(
      (failure) => showError('Failed to load user: ${failure.toString()}'),
      (user) {
        _currentUser = user;
        notifyListeners();
      },
    );
  }

  Future<void> login(String email, String password) async {
    setLoading(true);
    clearError();
    
    try {
      final result = await _authRepository.login(email, password);
      
      result.fold(
        (failure) {
          showError('Login failed: ${failure.toString()}');
          setError(failure.toString());
        },
        (user) async {
          _currentUser = user;
          _isLoggedIn = true;
          
          // Save user data to storage
          await _saveUserData(user);
          
          notifyListeners();
          showSuccess('Login successful!');
        },
      );
    } finally {
      setLoading(false);
    }
  }

  Future<void> register(String email, String password, String name) async {
    setLoading(true);
    clearError();
    
    try {
      final result = await _authRepository.register(email, password, name);
      
      result.fold(
        (failure) {
          showError('Registration failed: ${failure.toString()}');
          setError(failure.toString());
        },
        (user) async {
          _currentUser = user;
          _isLoggedIn = true;
          
          // Save user data to storage
          await _saveUserData(user);
          
          notifyListeners();
          showSuccess('Registration successful!');
        },
      );
    } finally {
      setLoading(false);
    }
  }

  Future<void> logout() async {
    setLoading(true);
    
    try {
      final result = await _authRepository.logout();
      
      result.fold(
        (failure) => showError('Logout failed: ${failure.toString()}'),
        (success) {
          _currentUser = null;
          _isLoggedIn = false;
          notifyListeners();
          showSuccess('Logged out successfully');
        },
      );
    } finally {
      setLoading(false);
    }
  }

  Future<void> forgotPassword(String email) async {
    setLoading(true);
    clearError();
    
    try {
      final result = await _authRepository.forgotPassword(email);
      
      result.fold(
        (failure) {
          showError('Failed to send reset email: ${failure.toString()}');
          setError(failure.toString());
        },
        (success) {
          showSuccess('Password reset email sent!');
        },
      );
    } finally {
      setLoading(false);
    }
  }

  Future<void> resetPassword(String token, String newPassword) async {
    setLoading(true);
    clearError();
    
    try {
      final result = await _authRepository.resetPassword(token, newPassword);
      
      result.fold(
        (failure) {
          showError('Password reset failed: ${failure.toString()}');
          setError(failure.toString());
        },
        (success) {
          showSuccess('Password reset successful!');
        },
      );
    } finally {
      setLoading(false);
    }
  }

  Future<void> _saveUserData(UserModel user) async {
    // This would typically save to storage service
    // For now, we'll just update the local state
  }

  Future<void> refreshUser() async {
    if (_isLoggedIn) {
      await _loadCurrentUser();
    }
  }
}
