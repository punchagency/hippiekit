import 'package:flutter/material.dart';
import 'package:hippiekit/core/theme/app_text_styles.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/di.dart';
import '../../../../core/navigation/navigation_helper.dart';
import '../../../auth/domain/repositories/auth_repository.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _navigateToOnboarding();
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.6, curve: Curves.easeIn),
      ),
    );

    _scaleAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.2, 0.8, curve: Curves.elasticOut),
      ),
    );

    _animationController.forward();
  }

  Future<void> _navigateToOnboarding() async {
    await Future.delayed(const Duration(seconds: 3));
    if (mounted) {
      await _checkAuthAndNavigate();
    }
  }

  Future<void> _checkAuthAndNavigate() async {
    try {
      final authRepository = DI.get<AuthRepository>();
      final isLoggedInResult = await authRepository.isLoggedIn();

      isLoggedInResult.fold(
        (failure) {
          // If auth check fails, go to onboarding
          NavigationHelper.go(route: '/onboarding');
        },
        (isLoggedIn) {
          if (isLoggedIn) {
            // User is already logged in, go to dashboard
            NavigationHelper.go(route: '/dashboard');
          } else {
            // User is not logged in, go to onboarding
            NavigationHelper.go(route: '/onboarding');
          }
        },
      );
    } catch (e) {
      // If there's an error, default to onboarding
      NavigationHelper.go(route: '/onboarding');
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              const Color(0xFF01C063), // #01C063
              const Color(0xFF650084), // #650084
            ],
          ),
        ),
        child: Center(
          child: AnimatedBuilder(
            animation: _animationController,
            builder: (context, child) {
              return FadeTransition(
                opacity: _fadeAnimation,
                child: ScaleTransition(
                  scale: _scaleAnimation,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // App Logo/Icon
                      // Container(
                      //   width: 120,
                      //   height: 120,
                      //   decoration: BoxDecoration(
                      //     shape: BoxShape.circle,
                      //     gradient: LinearGradient(
                      //       colors: [AppColors.primary, AppColors.secondary],
                      //     ),
                      //     boxShadow: [
                      //       BoxShadow(
                      //         color: AppColors.primary.withOpacity(0.3),
                      //         blurRadius: 20,
                      //         spreadRadius: 5,
                      //       ),
                      //     ],
                      //   ),
                      //   child: const Icon(
                      //     Icons.eco,
                      //     size: 60,
                      //     color: AppColors.onPrimary,
                      //   ),
                      // ),
                      Image.asset(
                        "assets/logo/logo.png",
                        width: 150,
                        height: 150,
                      ),
                      const SizedBox(height: 32),

                      // App Name

                      // App Tagline
                      Text(
                        'WHO ARE WE NOT TO\n CHANGE THE WORLD?',
                        style: AppTextStyles.decorativeLarge(context).copyWith(
                          color:  AppColors.darkOnSurfaceVariant,
                          fontSize:20
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 48),

                      // Loading Indicator
                      Positioned(
                        bottom: 0,
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 3,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              AppColors.primary,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
