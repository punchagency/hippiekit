abstract class SnackbarServiceInterface {
  void showError(String message);
  void showSuccess(String message);
  void showWarning(String message);
  void showInfo(String message);
  void hideCurrent();
}
