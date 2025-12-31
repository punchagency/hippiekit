import { toast as sonnerToast } from 'sonner';

const baseStyle = {
  background: '#FFFFFF',
  border: '2px solid #650084',
  color: '#1a1a1a',
  padding: '16px',
  borderRadius: '10px',
  fontFamily: 'Roboto, sans-serif',
  fontSize: '14px',
  fontWeight: '500',
  boxShadow: '0px 4px 12px rgba(101, 0, 132, 0.15)',
};

const iconColor = '#650084';

const SuccessIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke={iconColor} viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke={iconColor} viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke={iconColor} viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke={iconColor} viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4v2m0-10a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export const toast = {
  success: (message: string, options?: any) =>
    sonnerToast.success(message, {
      style: baseStyle,
      duration: 4000,
      icon: <SuccessIcon />,
      ...options,
    }),

  error: (message: string, options?: any) =>
    sonnerToast.error(message, {
      style: baseStyle,
      duration: 5000,
      icon: <ErrorIcon />,
      ...options,
    }),

  info: (message: string, options?: any) =>
    sonnerToast.info(message, {
      style: baseStyle,
      duration: 4000,
      icon: <InfoIcon />,
      ...options,
    }),

  warning: (message: string, options?: any) =>
    sonnerToast.warning(message, {
      style: baseStyle,
      duration: 4500,
      icon: <WarningIcon />,
      ...options,
    }),

  // Alias for backward compatibility
  message: (message: string, options?: any) =>
    sonnerToast.info(message, {
      style: baseStyle,
      duration: 3500,
      ...options,
    }),
};
