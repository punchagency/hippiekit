#!/usr/bin/env node

/**
 * Email Verification & OTP System - Integration Test
 *
 * This script tests the email verification and password reset flow
 * Run with: npx ts-node test-email-verification.ts
 * or: node dist/test-email-verification.js
 */

const API_URL = process.env.API_URL || 'http://localhost:8000';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  message?: string;
  duration?: number;
}

const results: TestResult[] = [];

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

const log = {
  success: (msg: string) =>
    console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg: string) =>
    console.log(`\n${colors.bright}${msg}${colors.reset}`),
  test: (msg: string) => console.log(`  ${colors.gray}→${colors.reset} ${msg}`),
};

async function apiCall<T>(
  method: string,
  endpoint: string,
  body?: Record<string, unknown>
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

function logResult(result: TestResult) {
  const icon = result.status === 'PASS' ? colors.green + '✓' : colors.red + '✗';
  const duration = result.duration ? ` (${result.duration}ms)` : '';
  console.log(
    `${icon}${colors.reset} ${result.name}${duration}${
      result.message ? ': ' + colors.gray + result.message + colors.reset : ''
    }`
  );
  results.push(result);
}

async function runTests() {
  console.clear();
  console.log(
    `${colors.bright}Email Verification & OTP System - Integration Tests${colors.reset}`
  );
  console.log(`Target API: ${API_URL}\n`);

  // Test 1: Register User
  log.section('1️⃣  User Registration Tests');

  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  let verificationToken = '';
  let userToken = '';

  log.test('Register new user');
  const startReg = Date.now();
  try {
    const registerResponse = await apiCall('POST', '/api/auth/register', {
      provider: 'credentials',
      providerAccountId: null,
      name: 'Test User',
      email: testEmail,
      password: testPassword,
      phoneNumber: '+1234567890',
    });

    if (registerResponse.success) {
      logResult({
        name: 'User registration successful',
        status: 'PASS',
        duration: Date.now() - startReg,
      });
      log.info(`Email: ${testEmail}`);
    } else {
      logResult({
        name: 'User registration failed',
        status: 'FAIL',
        message: registerResponse.message,
      });
    }
  } catch (error) {
    logResult({
      name: 'User registration endpoint',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Test 2: Verify Email with Invalid Token
  log.section('2️⃣  Email Verification Tests');

  log.test('Verify email with invalid token');
  const startInvalid = Date.now();
  try {
    const verifyResponse = await apiCall(
      'GET',
      '/api/auth/verify-email/invalid-token'
    );
    if (!verifyResponse.success) {
      logResult({
        name: 'Invalid token rejection',
        status: 'PASS',
        message: 'Correctly rejected invalid token',
        duration: Date.now() - startInvalid,
      });
    } else {
      logResult({
        name: 'Invalid token rejection',
        status: 'FAIL',
        message: 'Should have rejected invalid token',
      });
    }
  } catch (error) {
    logResult({
      name: 'Invalid token rejection',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Test 3: Login Before Verification
  log.section('3️⃣  Login Authorization Tests');

  log.test('Login without email verification (should fail with 403)');
  const startLoginFail = Date.now();
  try {
    const loginResponse = await apiCall('POST', '/api/auth/login', {
      email: testEmail,
      password: testPassword,
    });

    if (!loginResponse.success && loginResponse.message?.includes('verify')) {
      logResult({
        name: 'Pre-verification login blocked',
        status: 'PASS',
        message: 'Correctly blocked unverified user',
        duration: Date.now() - startLoginFail,
      });
    } else {
      logResult({
        name: 'Pre-verification login blocked',
        status: 'FAIL',
        message: 'Should block unverified users',
      });
    }
  } catch (error) {
    logResult({
      name: 'Pre-verification login blocked',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Test 4: Password Reset Flow
  log.section('4️⃣  Password Reset (OTP) Tests');

  log.test('Request password reset (forgot-password)');
  const startForgot = Date.now();
  try {
    const forgotResponse = await apiCall('POST', '/api/auth/forgot-password', {
      email: testEmail,
    });

    if (forgotResponse.success) {
      logResult({
        name: 'Password reset request',
        status: 'PASS',
        message: 'OTP generation endpoint working',
        duration: Date.now() - startForgot,
      });
      log.info('Note: Check SendGrid for OTP email (verify user exists)');
    } else {
      logResult({
        name: 'Password reset request',
        status: 'FAIL',
        message: forgotResponse.message || 'Unknown error',
      });
    }
  } catch (error) {
    logResult({
      name: 'Password reset request',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  log.test('Verify invalid OTP');
  const startInvalidOTP = Date.now();
  try {
    const otpResponse = await apiCall('POST', '/api/auth/verify-otp', {
      email: testEmail,
      otp: '000000',
    });

    if (!otpResponse.success) {
      logResult({
        name: 'Invalid OTP rejection',
        status: 'PASS',
        message: 'Correctly rejected invalid OTP',
        duration: Date.now() - startInvalidOTP,
      });
    } else {
      logResult({
        name: 'Invalid OTP rejection',
        status: 'FAIL',
        message: 'Should reject invalid OTP',
      });
    }
  } catch (error) {
    logResult({
      name: 'Invalid OTP rejection',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  log.test('Reset password with invalid OTP');
  const startInvalidReset = Date.now();
  try {
    const resetResponse = await apiCall('POST', '/api/auth/reset-password', {
      email: testEmail,
      otp: '000000',
      newPassword: 'NewPass456!',
    });

    if (!resetResponse.success) {
      logResult({
        name: 'Invalid password reset rejection',
        status: 'PASS',
        message: 'Correctly rejected invalid OTP in reset',
        duration: Date.now() - startInvalidReset,
      });
    } else {
      logResult({
        name: 'Invalid password reset rejection',
        status: 'FAIL',
        message: 'Should reject reset with invalid OTP',
      });
    }
  } catch (error) {
    logResult({
      name: 'Invalid password reset rejection',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Test 5: Summary
  log.section('5️⃣  Test Summary');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const total = results.length;

  console.log(
    `\nTotal Tests: ${total} | ${colors.green}Passed: ${passed}${colors.reset} | ${colors.red}Failed: ${failed}${colors.reset}`
  );

  if (failed === 0) {
    console.log(`\n${colors.green}✓ All tests passed!${colors.reset}`);
  } else {
    console.log(
      `\n${colors.red}✗ ${failed} test(s) failed. Please check the errors above.${colors.reset}`
    );
  }

  console.log(`\n${colors.bright}Next Steps:${colors.reset}`);
  console.log(`1. Get a valid verification token from SendGrid email`);
  console.log(`2. Visit: ${API_URL}/verify-email?token=YOUR_TOKEN`);
  console.log(`3. Get OTP from SendGrid email`);
  console.log(`4. Test OTP verification and password reset`);
  console.log(`5. Try logging in after email verification`);
}

// Run tests
runTests().catch((error) => {
  log.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});
