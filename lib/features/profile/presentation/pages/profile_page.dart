import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/theme_service.dart';
import '../../../../shared/widgets/custom_button.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {
              // Handle settings
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const CircleAvatar(
              radius: 50,
              backgroundColor: AppColors.primary,
              child: Icon(
                Icons.person,
                size: 50,
                color: AppColors.onPrimary,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'John Doe',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'john.doe@example.com',
              style: TextStyle(
                fontSize: 16,
                color: AppColors.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 32),
            Consumer<ThemeService>(
              builder: (context, themeService, child) {
                return CustomButton(
                  text: 'Toggle Theme (${themeService.themeModeString})',
                  onPressed: () {
                    themeService.toggleTheme();
                  },
                  type: ButtonType.outline,
                );
              },
            ),
            const SizedBox(height: 16),
            CustomButton(
              text: 'Settings',
              onPressed: () {
                // Handle settings
              },
              type: ButtonType.outline,
            ),
            const SizedBox(height: 16),
            CustomButton(
              text: 'Logout',
              onPressed: () {
                // Handle logout
              },
              type: ButtonType.text,
            ),
          ],
        ),
      ),
    );
  }
}
