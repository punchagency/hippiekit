import '../../../../core/viewmodels/base_viewmodel.dart';
import '../../../../core/services/interfaces/storage_service_interface.dart';
import '../../../../core/utils/di.dart';

class DashboardViewModel extends BaseViewModel {
  final StorageServiceInterface _storageService = DI.get<StorageServiceInterface>();

  String _userName = 'User';
  int _itemCount = 0;

  String get userName => _userName;
  int get itemCount => _itemCount;

  void initialize() {
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    setLoading(true);
    try {
      // Load user data from storage
      final storedName = _storageService.getString('user_name');
      if (storedName != null) {
        _userName = storedName;
      }
      
      // Load item count
      final storedCount = _storageService.getInt('item_count');
      if (storedCount != null) {
        _itemCount = storedCount;
      }
      
      notifyListeners();
    } catch (e) {
      showError('Failed to load user data: $e');
    } finally {
      setLoading(false);
    }
  }

  Future<void> updateItemCount(int count) async {
    try {
      _itemCount = count;
      await _storageService.setInt('item_count', count);
      notifyListeners();
      showSuccess('Item count updated');
    } catch (e) {
      showError('Failed to update item count: $e');
    }
  }

  Future<void> refreshData() async {
    await _loadUserData();
  }
}
