import '../../../../core/viewmodels/base_viewmodel.dart';
import '../../../../core/services/interfaces/storage_service_interface.dart';
import '../../../../core/utils/di.dart';

class ScanViewModel extends BaseViewModel {
  final StorageServiceInterface _storageService = DI.get<StorageServiceInterface>();

  String? _scannedData;
  List<String> _scanHistory = [];

  String? get scannedData => _scannedData;
  List<String> get scanHistory => _scanHistory;

  void initialize() {
    _loadScanHistory();
  }

  Future<void> _loadScanHistory() async {
    try {
      final history = _storageService.getStringList('scan_history') ?? [];
      _scanHistory = history;
      notifyListeners();
    } catch (e) {
      showError('Failed to load scan history: $e');
    }
  }

  Future<void> scanQRCode(String data) async {
    setLoading(true);
    try {
      _scannedData = data;
      
      // Add to history
      _scanHistory.insert(0, data);
      if (_scanHistory.length > 50) {
        _scanHistory = _scanHistory.take(50).toList();
      }
      
      // Save to storage
      await _storageService.setStringList('scan_history', _scanHistory);
      
      // Process the scanned data
      await _processScannedData(data);
      
      notifyListeners();
      showSuccess('QR Code scanned successfully');
    } catch (e) {
      showError('Failed to scan QR Code: $e');
    } finally {
      setLoading(false);
    }
  }

  Future<void> _processScannedData(String data) async {
    // Example: Send data to server for processing
    try {
      // await _networkService.post('/scan/process', data: {'data': data});
      // For now, just simulate processing
      await Future.delayed(const Duration(seconds: 1));
    } catch (e) {
      showWarning('Failed to process scanned data: $e');
    }
  }

  Future<void> clearHistory() async {
    try {
      _scanHistory.clear();
      await _storageService.remove('scan_history');
      notifyListeners();
      showSuccess('Scan history cleared');
    } catch (e) {
      showError('Failed to clear history: $e');
    }
  }

  Future<void> removeFromHistory(int index) async {
    try {
      _scanHistory.removeAt(index);
      await _storageService.setStringList('scan_history', _scanHistory);
      notifyListeners();
      showSuccess('Item removed from history');
    } catch (e) {
      showError('Failed to remove item: $e');
    }
  }
}
