import '../services/interfaces/network_service_interface.dart';
import '../services/interfaces/storage_service_interface.dart';
import '../utils/service_locator.dart';

abstract class BaseRepository {
  final NetworkServiceInterface _networkService = sl<NetworkServiceInterface>();
  final StorageServiceInterface _storageService = sl<StorageServiceInterface>();

  NetworkServiceInterface get networkService => _networkService;
  StorageServiceInterface get storageService => _storageService;
}
