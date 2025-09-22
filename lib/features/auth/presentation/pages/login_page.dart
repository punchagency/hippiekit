import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/constants/app_resources.dart';
import '../../../../core/navigation/navigation_helper.dart';
import '../../../../shared/widgets/custom_button.dart';
import '../../../../shared/widgets/custom_input_field.dart';
import '../viewmodels/auth_viewmodel.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  late final AuthViewModel _authViewModel;

  @override
  void initState() {
    super.initState();
    _authViewModel = AuthViewModel();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _authViewModel.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => _authViewModel,
      child: Scaffold(
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(AppResources.largePadding),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo or App Title
                  const Icon(Icons.eco, size: 80, color: AppColors.primary),
                  const SizedBox(height: AppResources.largePadding),

                  Text(
                    'Welcome to HippieKit',
                    style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppResources.smallPadding),

                  Text(
                    'Sign in to continue',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: AppColors.onSurfaceVariant,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppResources.largePadding * 2),

                  // Email Field
                  CustomInputField(
                    controller: _emailController,
                    label: 'Email',
                    hint: 'Enter your email',
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your email';
                      }
                      if (!value.contains('@')) {
                        return 'Please enter a valid email';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: AppResources.mediumPadding),

                  // Password Field
                  CustomInputField(
                    controller: _passwordController,
                    label: 'Password',
                    hint: 'Enter your password',
                    obscureText: true,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your password';
                      }
                      if (value.length < 6) {
                        return 'Password must be at least 6 characters';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: AppResources.mediumPadding),

                  // Forgot Password
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () {
                        _showForgotPasswordDialog();
                      },
                      child: const Text('Forgot Password?'),
                    ),
                  ),
                  const SizedBox(height: AppResources.largePadding),

                  // Login Button
                  Consumer<AuthViewModel>(
                    builder: (context, authViewModel, child) {
                      return CustomButton(
                        text: 'Sign In',
                        onPressed: authViewModel.isLoading
                            ? null
                            : () {
                                if (_formKey.currentState!.validate()) {
                                  authViewModel.login(
                                    _emailController.text.trim(),
                                    _passwordController.text,
                                  );
                                }
                              },
                        isLoading: authViewModel.isLoading,
                        type: ButtonType.primary,
                      );
                    },
                  ),
                  const SizedBox(height: AppResources.mediumPadding),

                  // Register Button
                  CustomButton(
                    text: 'Create Account',
                    onPressed: () {
                      NavigationHelper.go(route: '/signup');
                    },
                    type: ButtonType.outline,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showForgotPasswordDialog() {
    final emailController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Forgot Password'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Enter your email address and we\'ll send you a reset link.',
            ),
            const SizedBox(height: AppResources.mediumPadding),
            CustomInputField(
              controller: emailController,
              label: 'Email',
              hint: 'Enter your email',
              keyboardType: TextInputType.emailAddress,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          Consumer<AuthViewModel>(
            builder: (context, authViewModel, child) {
              return CustomButton(
                text: 'Send Reset Link',
                onPressed: authViewModel.isLoading
                    ? null
                    : () {
                        if (emailController.text.isNotEmpty) {
                          authViewModel.forgotPassword(
                            emailController.text.trim(),
                          );
                          Navigator.of(context).pop();
                        }
                      },
                isLoading: authViewModel.isLoading,
                type: ButtonType.primary,
              );
            },
          ),
        ],
      ),
    );
  }
}
