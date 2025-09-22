import 'package:flutter/material.dart';
import '../../../../core/navigation/app_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/constants/app_resources.dart';

class DashboardPage extends StatefulWidget {
  final Widget? child;

  const DashboardPage({super.key, this.child});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  int _currentIndex = 0;

  final List<BottomNavigationItem> _bottomNavItems = [
    BottomNavigationItem(
      icon: Icons.home_outlined,
      activeIcon: Icons.home,
      label: 'Home',
      route: '/dashboard',
    ),
    BottomNavigationItem(
      icon: Icons.qr_code_scanner_outlined,
      activeIcon: Icons.qr_code_scanner,
      label: 'Scan',
      route: '/scan',
    ),
    BottomNavigationItem(
      icon: Icons.favorite_outline,
      activeIcon: Icons.favorite,
      label: 'Favorites',
      route: '/favorites',
    ),
    BottomNavigationItem(
      icon: Icons.person_outline,
      activeIcon: Icons.person,
      label: 'Profile',
      route: '/profile',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child ?? const HomeView(),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppResources.mediumPadding,
              vertical: AppResources.smallPadding,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: _bottomNavItems.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                final isSelected = _currentIndex == index;
                
                return Expanded(
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        _currentIndex = index;
                      });
                      AppRouter.goTo(item.route);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        vertical: AppResources.smallPadding,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isSelected ? item.activeIcon : item.icon,
                            color: isSelected 
                              ? AppColors.primary 
                              : AppColors.onSurfaceVariant,
                            size: 24,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item.label,
                            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: isSelected 
                                ? AppColors.primary 
                                : AppColors.onSurfaceVariant,
                              fontWeight: isSelected 
                                ? FontWeight.w600 
                                : FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }
}

class BottomNavigationItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String route;

  const BottomNavigationItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.route,
  });
}

class HomeView extends StatelessWidget {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('HippieKit'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              // Handle notifications
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 40),
            // Decorative title using SegoePrint
            Text(
              'Welcome to HippieKit!',
              style: AppTextStyles.decorativeLarge(context),
            ),
            const SizedBox(height: 16),
            // Main heading using Poppins
            Text(
              'Your Lifestyle Companion',
              style: Theme.of(context).textTheme.displaySmall,
            ),
            const SizedBox(height: 8),
            // Body text using Lato
            Text(
              'Discover the perfect blend of modern technology and hippie vibes. Scan, save, and share your favorite moments with our intuitive interface.',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 32),
            // Font showcase section
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.onSurfaceVariant.withOpacity(0.2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Font Showcase',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Poppins - Headings & Titles',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Lato - Body Text & UI Elements',
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'SegoePrint - Decorative Text',
                    style: AppTextStyles.decorativeMedium(context),
                  ),
                ],
              ),
            ),
            const Spacer(),
            // Call to action
            Center(
              child: ElevatedButton(
                onPressed: () {
                  // Handle action
                },
                child: Text(
                  'Get Started',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: AppColors.onPrimary,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

