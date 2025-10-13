import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/navigation/navigation_helper.dart';
import '../../data/models/onboarding_slide.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentIndex < OnboardingData.slides.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _completeOnboarding();
    }
  }

  void _previousPage() {
    if (_currentIndex > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _skipOnboarding() {
    NavigationHelper.go(route: '/signup');
  }

  void _completeOnboarding() {
    // Navigate to login screen
    NavigationHelper.go(route: '/login');
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Container(
        // color:AppColors.accent,
        child: Stack(
          children: [
            // Background
            // Container(
            //   decoration: BoxDecoration(
            //     gradient: LinearGradient(
            //       begin: Alignment.topCenter,
            //       end: Alignment.bottomCenter,
            //       colors: isDark
            //           ? [AppColors.darkBackground, AppColors.darkSurface]
            //           : [AppColors.background, AppColors.surface],
            //     ),
            //   ),
            // ),
        
            // Skip Button
            Positioned(
              top: MediaQuery.of(context).padding.top + 16,
              right: 16,
              child: InkWell(
                onTap: _skipOnboarding,
                child: Container(
                  decoration:BoxDecoration(
                    color:Color(0xff00AC58),
                    borderRadius:BorderRadius.circular(60)
                  ),
                  height:34,
                  padding:EdgeInsets.symmetric(horizontal:16.0,vertical:5),
                  child:  Center(
                    child: Text(
                        'Skip',
                        textAlign:TextAlign.center,
                        maxLines:1,
                        style: TextStyle(
                          color: AppColors.background,
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                  ),
                ),
              ),
            ),
            // PageView
            PageView.builder(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() {
                  _currentIndex = index;
                });
              },
              itemCount: OnboardingData.slides.length,
              itemBuilder: (context, index) {
                final slide = OnboardingData.slides[index];
                return _buildSlide(slide, isDark);
              },
            ),
        
            // Bottom Section
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Page Indicators
                    _buildPageIndicators(isDark),
                    const SizedBox(height: 32),
        
                    // Navigation Buttons
                    Row(
                      children: [
                        // Back Button (only show if not first page)
                        if (_currentIndex > 0) ...[
                          Expanded(
                            child: OutlinedButton(
                              onPressed: _previousPage,
                              style: OutlinedButton.styleFrom(
                                side: BorderSide(
                                  color: isDark
                                      ? AppColors.darkOnSurfaceVariant
                                      : AppColors.onSurfaceVariant,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                padding: const EdgeInsets.symmetric(vertical: 16),
                              ),
                              child: Text(
                                'Back',
                                style: TextStyle(
                                  color: isDark
                                      ? AppColors.darkOnSurfaceVariant
                                      : AppColors.onSurfaceVariant,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                        ],
        
                        // Next/Get Started Button
                        Expanded(
                          flex: _currentIndex == 0 ? 1 : 1,
                          child: ElevatedButton(
                            onPressed: _nextPage,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: AppColors.onPrimary,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(100),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            child: Text(
                              _currentIndex == OnboardingData.slides.length - 1
                                  ? 'Get Started'
                                  : 'Next',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSlide(OnboardingSlide slide, bool isDark) {
    return Stack(
      children: [
        Container(
          decoration:BoxDecoration(
            image:DecorationImage(
              image: NetworkImage('assets/images/onboarding_1.png'),
              fit:BoxFit.cover
            )
          ),
          width:MediaQuery.of(context).size.width,
          height:MediaQuery.of(context).size.height * 0.6,
          child:SizedBox(),
        ),
        Column(
           mainAxisAlignment:MainAxisAlignment.end,
          children: [
            Container(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                decoration:BoxDecoration(
                  color:Colors.transparent,
                  borderRadius:BorderRadius.only(
                    topLeft:Radius.circular(100)
                  )
                ),
                height:512,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Spacer(flex: 2),
                    // Icon
                    if (slide.icon != null) ...[
                      Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            colors: [
                              AppColors.primary.withOpacity(0.1),
                              AppColors.secondary.withOpacity(0.1),
                            ],
                          ),
                        ),
                        child: Center(
                          child: Text(slide.icon!, style: const TextStyle(fontSize: 60)),
                        ),
                      ),
                      const SizedBox(height: 48),
                    ],
              
                    // Title
                    Text(
                      slide.title,
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: isDark ? AppColors.darkOnSurface : AppColors.onSurface,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
              
                    // Subtitle
                    Text(
                      slide.subtitle,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
              
                    // Description
                    Text(
                      slide.description,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: isDark
                            ? AppColors.darkOnSurfaceVariant
                            : AppColors.onSurfaceVariant,
                        height: 1.6,
                      ),
                      textAlign: TextAlign.center,
                    ),
              
                    const Spacer(flex: 3),
                  ],
                ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPageIndicators(bool isDark) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(
        OnboardingData.slides.length,
        (index) => Container(
          margin: const EdgeInsets.symmetric(horizontal: 4),
          width: _currentIndex == index ? 24 : 8,
          height: 8,
          decoration: BoxDecoration(
            color: _currentIndex == index
                ? AppColors.primary
                : (isDark
                          ? AppColors.darkOnSurfaceVariant
                          : AppColors.onSurfaceVariant)
                      .withOpacity(0.3),
            borderRadius: BorderRadius.circular(4),
          ),
        ),
      ),
    );
  }
}
