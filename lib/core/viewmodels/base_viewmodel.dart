import 'package:flutter/foundation.dart';
import '../services/interfaces/snackbar_service_interface.dart';
import '../utils/service_locator.dart';

abstract class BaseViewModel extends ChangeNotifier {
  final SnackbarServiceInterface _snackbarService = sl<SnackbarServiceInterface>();
  
  bool _isLoading = false;
  String? _error;

  bool get isLoading => _isLoading;
  String? get error => _error;

  SnackbarServiceInterface get snackbarService => _snackbarService;

  void setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void setError(String? error) {
    _error = error;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void showError(String message) {
    _snackbarService.showError(message);
  }

  void showSuccess(String message) {
    _snackbarService.showSuccess(message);
  }

  void showWarning(String message) {
    _snackbarService.showWarning(message);
  }

  void showInfo(String message) {
    _snackbarService.showInfo(message);
  }

  @override
  void dispose() {
    super.dispose();
  }
}
