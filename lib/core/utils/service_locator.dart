import 'package:get_it/get_it.dart';
import '../services/theme_service.dart';
import '../services/network_service.dart';
import '../services/storage_service.dart';
import '../services/snackbar_service.dart';
import '../services/interfaces/theme_service_interface.dart';
import '../services/interfaces/network_service_interface.dart';
import '../services/interfaces/storage_service_interface.dart';
import '../services/interfaces/snackbar_service_interface.dart';
import '../network/api_client.dart';
import '../../features/auth/data/datasources/auth_remote_datasource.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';

final GetIt sl = GetIt.instance;

Future<void> init() async {
  // Core Services
  sl.registerLazySingleton<StorageServiceInterface>(() => StorageService());
  sl.registerLazySingleton<ThemeServiceInterface>(() => ThemeService());
  sl.registerLazySingleton<NetworkServiceInterface>(() => NetworkService());
  sl.registerLazySingleton<SnackbarServiceInterface>(() => SnackbarService());
  
  // API Services
  sl.registerLazySingleton<ApiClient>(() => ApiClient());
  
  // Data Sources
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(),
  );
  
  // Repositories
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl<AuthRemoteDataSource>(),
    ),
  );
  
  // Initialize storage first
  sl.get<StorageServiceInterface>();
  
  // Initialize theme service
  sl.get<ThemeServiceInterface>();
}
