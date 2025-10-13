import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTextStyles {
  // Font weights
  static const FontWeight regular = FontWeight.w400;
  static const FontWeight medium = FontWeight.w500;
  static const FontWeight semiBold = FontWeight.w600;
  static const FontWeight bold = FontWeight.w700;

  // Light Theme Text Styles
  static const TextTheme lightTextTheme = TextTheme(
    displayLarge: TextStyle(
      fontFamily: 'Poppins',
      fontSize: 32,
      fontWeight: bold,
      color: AppColors.onBackground,
      height: 1.2,
    ),
    displayMedium: TextStyle(
      fontFamily: 'Poppins',
      fontSize: 28,
      fontWeight: bold,
      color: AppColors.onBackground,
      height: 1.2,
    ),
    displaySmall: TextStyle(
      fontFamily: 'Poppins',
      fontSize: 24,
      fontWeight: bold,
      color: AppColors.onBackground,
      height: 1.3,
    ),
    headlineLarge: TextStyle(
      fontFamily: 'Poppins',
      fontSize: 22,
      fontWeight: semiBold,
      color: AppColors.onBackground,
      height: 1.3,
    ),
    headlineMedium: TextStyle(
      fontFamily: 'Poppins',
      fontSize: 20,
      fontWeight: semiBold,
      color: AppColors.onBackground,
      height: 1.3,
    ),
    headlineSmall: TextStyle(
      fontFamily: 'Poppins',
      fontSize: 18,
      fontWeight: semiBold,
      color: AppColors.onBackground,
      height: 1.4,
    ),
    titleLarge: TextStyle(
      fontFamily: 'Poppins',
      fontSize: 16,
      fontWeight: semiBold,
      color: AppColors.onBackground,
      height: 1.4,
    ),
    titleMedium: TextStyle(
      fontFamily: 'Lato',
      fontSize: 14,
      fontWeight: medium,
      color: AppColors.onBackground,
      height: 1.4,
    ),
    titleSmall: TextStyle(
      fontFamily: 'Lato',
      fontSize: 12,
      fontWeight: medium,
      color: AppColors.onBackground,
      height: 1.4,
    ),
    bodyLarge: TextStyle(
      fontFamily: 'Lato',
      fontSize: 16,
      fontWeight: regular,
      color: AppColors.onBackground,
      height: 1.5,
    ),
    bodyMedium: TextStyle(
      fontFamily: 'Lato',
      fontSize: 14,
      fontWeight: regular,
      color: AppColors.onBackground,
      height: 1.5,
    ),
    bodySmall: TextStyle(
      fontFamily: 'Lato',
      fontSize: 12,
      fontWeight: regular,
      color: AppColors.onSurfaceVariant,
      height: 1.5,
    ),
    labelLarge: TextStyle(
      fontFamily: 'Lato',
      fontSize: 14,
      fontWeight: medium,
      color: AppColors.onBackground,
      height: 1.4,
    ),
    labelMedium: TextStyle(
      fontFamily: 'Lato',
      fontSize: 12,
      fontWeight: medium,
      color: AppColors.onBackground,
      height: 1.4,
    ),
    labelSmall: TextStyle(
      fontFamily: 'Lato',
      fontSize: 10,
      fontWeight: medium,
      color: AppColors.onSurfaceVariant,
      height: 1.4,
    ),
  );

  // Dark Theme Text Styles
  static const TextTheme darkTextTheme = TextTheme(
    displayLarge: TextStyle(
      fontFamily: 'Poppins',
      fontSize: 32,
      fontWeight: bold,
      color: AppColors.darkOnBackground,
      height: 1.2,
    ),
    displayMedium: TextStyle(
      fontFamily: 'Poppins',
      fontSize: 28,
      fontWeight: bold,
      color: AppColors.darkOnBackground,
      height: 1.2,
    ),
    displaySmall: TextStyle(
      fontFamily: 'Poppins',
      fontSize: 24,
      fontWeight: bold,
      color: AppColors.darkOnBackground,
      height: 1.3,
    ),
    headlineLarge: TextStyle(
      fontFamily: 'Poppins',
      fontSize: 22,
      fontWeight: semiBold,
      color: AppColors.darkOnBackground,
      height: 1.3,
    ),
    headlineMedium: TextStyle(
      fontFamily: 'Poppins',
      fontSize: 20,
      fontWeight: semiBold,
      color: AppColors.darkOnBackground,
      height: 1.3,
    ),
    headlineSmall: TextStyle(
      fontFamily: 'Poppins',
      fontSize: 18,
      fontWeight: semiBold,
      color: AppColors.darkOnBackground,
      height: 1.4,
    ),
    titleLarge: TextStyle(
      fontFamily: 'Poppins',
      fontSize: 16,
      fontWeight: semiBold,
      color: AppColors.darkOnBackground,
      height: 1.4,
    ),
    titleMedium: TextStyle(
      fontFamily: 'Lato',
      fontSize: 14,
      fontWeight: medium,
      color: AppColors.darkOnBackground,
      height: 1.4,
    ),
    titleSmall: TextStyle(
      fontFamily: 'Lato',
      fontSize: 12,
      fontWeight: medium,
      color: AppColors.darkOnBackground,
      height: 1.4,
    ),
    bodyLarge: TextStyle(
      fontFamily: 'Lato',
      fontSize: 16,
      fontWeight: regular,
      color: AppColors.darkOnBackground,
      height: 1.5,
    ),
    bodyMedium: TextStyle(
      fontFamily: 'Lato',
      fontSize: 14,
      fontWeight: regular,
      color: AppColors.darkOnBackground,
      height: 1.5,
    ),
    bodySmall: TextStyle(
      fontFamily: 'Lato',
      fontSize: 12,
      fontWeight: regular,
      color: AppColors.darkOnSurfaceVariant,
      height: 1.5,
    ),
    labelLarge: TextStyle(
      fontFamily: 'Lato',
      fontSize: 14,
      fontWeight: medium,
      color: AppColors.darkOnBackground,
      height: 1.4,
    ),
    labelMedium: TextStyle(
      fontFamily: 'Lato',
      fontSize: 12,
      fontWeight: medium,
      color: AppColors.darkOnBackground,
      height: 1.4,
    ),
    labelSmall: TextStyle(
      fontFamily: 'Lato',
      fontSize: 10,
      fontWeight: medium,
      color: AppColors.darkOnSurfaceVariant,
      height: 1.4,
    ),
  );

  // Theme-aware decorative text styles using SegoePrint
  static TextStyle decorativeLarge(BuildContext context) => TextStyle(
    fontFamily: 'SegoePrint',
    fontSize: 24,
    fontWeight: FontWeight.w400,
    color: Theme.of(context).colorScheme.onSurface,
    height: 1.2,
  );

  static TextStyle decorativeMedium(BuildContext context) => TextStyle(
    fontFamily: 'SegoePrint',
    fontSize: 18,
    fontWeight: FontWeight.w400,
    color: Theme.of(context).colorScheme.onSurface,
    height: 1.3,
  );

  static TextStyle decorativeSmall(BuildContext context) => TextStyle(
    fontFamily: 'SegoePrint',
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: Theme.of(context).colorScheme.onSurface,
    height: 1.4,
  );
}

