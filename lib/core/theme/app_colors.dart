import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors - Hippie-inspired palette
  static const Color primary = Color(0xFF6B46C1); // Purple
  static const Color primaryVariant = Color(0xFF553C9A);
  static const Color secondary = Color(0xFFF59E0B); // Amber
  static const Color secondaryVariant = Color(0xFFD97706);
  
  // Accent Colors
  static const Color accent = Color(0xFF10B981); // Emerald
  static const Color accentVariant = Color(0xFF059669);
  
  // Neutral Colors
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF3F4F6);
  static const Color background = Color(0xFFFAFAFA);
  static const Color onSurface = Color(0xFF1F2937);
  static const Color onSurfaceVariant = Color(0xFF6B7280);
  static const Color onBackground = Color(0xFF1F2937);
  
  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
  
  // Text Colors
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color onSecondary = Color(0xFFFFFFFF);
  static const Color onError = Color(0xFFFFFFFF);
  
  // Dark Theme Colors
  static const Color darkSurface = Color(0xFF1F2937);
  static const Color darkSurfaceVariant = Color(0xFF374151);
  static const Color darkBackground = Color(0xFF111827);
  static const Color darkOnSurface = Color(0xFFF9FAFB);
  static const Color darkOnSurfaceVariant = Color(0xFFD1D5DB);
  static const Color darkOnBackground = Color(0xFFF9FAFB);

  // Light Color Scheme
  static const ColorScheme lightColorScheme = ColorScheme.light(
    primary: primary,
    onPrimary: onPrimary,
    secondary: secondary,
    onSecondary: onSecondary,
    surface: surface,
    onSurface: onSurface,
    error: error,
    onError: onError,
    surfaceContainerHighest: surfaceVariant,
    onSurfaceVariant: onSurfaceVariant,
  );

  // Dark Color Scheme
  static const ColorScheme darkColorScheme = ColorScheme.dark(
    primary: primary,
    onPrimary: onPrimary,
    secondary: secondary,
    onSecondary: onSecondary,
    surface: darkSurface,
    onSurface: darkOnSurface,
    error: error,
    onError: onError,
    surfaceContainerHighest: darkSurfaceVariant,
    onSurfaceVariant: darkOnSurfaceVariant,
  );
}

