import { Button } from '@/components/ui/button';
import { TitleSubtitle } from '@/components/auth/title-subtitle';
import { useState, useRef, type KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';

function OtpVerification() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer] = useState(59);
  const [rememberDevice, setRememberDevice] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const digits = text.replace(/\D/g, '').slice(0, 4);
      const newOtp = digits.split('').concat(['', '', '', '']).slice(0, 4);
      setOtp(newOtp);

      // Focus the last filled input or first empty
      const nextIndex = Math.min(digits.length, 3);
      inputRefs.current[nextIndex]?.focus();
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleVerify = () => {
    const otpValue = otp.join('');
    console.log('OTP:', otpValue);
    console.log('Remember device:', rememberDevice);
    // Handle OTP verification
  };

  return (
    <section className="px-5 font-family-poppins text-[#222] min-h-full">
      <TitleSubtitle
        title="OTP Verification"
        subtitle="Verify Your Mobile Number"
      />

      <p className="mt-2 text-sm">
        Enter the 4 digit code sent to{' '}
        <span className="font-semibold">+123 456 7890</span>{' '}
        <span className="underline font-medium cursor-pointer">Change</span>
      </p>

      {/* OTP Input Fields */}
      <div className="flex gap-6 justify-center mt-8">
          {otp.map((digit, index) => (
            <div key={index} className="flex flex-col items-center">
              <Input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-[45px] h-[50px] text-center text-[30px] font-semibold border-none bg-transparent p-0 rounded-none"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              />
              <div className="w-[45px] h-px bg-[#b3b3b3] rounded-full mt-2" />
            </div>
          ))}
        </div>

      {/* Paste from Clipboard Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handlePaste}
          className="flex items-center gap-2 bg-neutral-200 px-3 py-2 rounded-lg text-sm"
        >
            <svg
              width="15"
              height="18"
              viewBox="0 0 15 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.9701 6.38853H11.6675V4.48318C11.6675 3.29417 11.1951 2.15385 10.3544 1.31309C9.51363 0.472335 8.37331 0 7.18429 0C5.99528 0 4.85496 0.472335 4.0142 1.31309C3.17344 2.15385 2.70111 3.29417 2.70111 4.48318V6.38853H2.38726C2.07281 6.38853 1.76151 6.45065 1.47114 6.57132C1.18077 6.692 0.917084 6.86885 0.695256 7.09172C0.473428 7.31459 0.297814 7.57908 0.178503 7.87001C0.059191 8.16095 -0.00144997 8.47259 2.632e-05 8.78704V15.6127C2.632e-05 16.2458 0.251519 16.853 0.699224 17.3008C1.14693 17.7485 1.75411 18 2.38726 18H11.9477C12.2621 18.0015 12.5737 17.9408 12.8647 17.8215C13.1556 17.7022 13.4202 17.5266 13.643 17.3047C13.8659 17.0829 14.0427 16.8192 14.1634 16.5289C14.2841 16.2385 14.3462 15.9271 14.3462 15.6127V8.78704C14.3462 8.15478 14.0966 7.54808 13.6516 7.09892C13.2067 6.64975 12.6023 6.39444 11.9701 6.38853ZM3.92281 4.53922C3.91538 4.10569 3.99414 3.67501 4.15458 3.27219C4.31502 2.86937 4.55395 2.50244 4.8574 2.19273C5.16085 1.88302 5.52278 1.6367 5.92224 1.46807C6.3217 1.29945 6.7507 1.21188 7.18429 1.21046C7.61355 1.21046 8.03856 1.29519 8.435 1.4598C8.83143 1.6244 9.19149 1.86565 9.4945 2.16969C9.79751 2.47374 10.0375 2.83461 10.2007 3.23161C10.364 3.62861 10.4473 4.05393 10.4458 4.48318V6.38853H3.91159L3.92281 4.53922ZM13.1694 15.6127C13.1694 15.7702 13.1383 15.9261 13.078 16.0716C13.0178 16.2171 12.9295 16.3493 12.8181 16.4607C12.7067 16.572 12.5745 16.6604 12.429 16.7206C12.2835 16.7809 12.1276 16.8119 11.9701 16.8119H2.4097C2.25221 16.8119 2.09625 16.7809 1.95075 16.7206C1.80525 16.6604 1.67307 16.572 1.56171 16.4607C1.45035 16.3493 1.36203 16.2171 1.30176 16.0716C1.24149 15.9261 1.21044 15.7702 1.21044 15.6127V8.78704C1.19969 8.62307 1.22279 8.45865 1.27823 8.30397C1.33366 8.14929 1.42026 8.00766 1.53271 7.88785C1.64516 7.76804 1.781 7.67262 1.93187 7.60751C2.08273 7.54239 2.24538 7.50898 2.4097 7.50933H11.9701C12.1276 7.50933 12.2835 7.54035 12.429 7.60062C12.5745 7.66088 12.7067 7.74922 12.8181 7.86058C12.9295 7.97194 13.0178 8.10415 13.078 8.24965C13.1383 8.39515 13.1694 8.55109 13.1694 8.70858V15.6127Z"
                fill="#222222"
              />
            </svg>
          <span className="capitalize font-medium text-[#222222]">
            paste from clipboard
          </span>
        </button>
      </div>

      {/* Timer and Resend Options */}
      <div className="mt-8 text-sm">
        <p>
          The OTP will expire in{' '}
          <span className="font-medium">
            (0:{timer.toString().padStart(2, '0')})
          </span>
        </p>

        <p className="mt-2">
          Didn't receive the code?{' '}
          <span className="underline font-medium cursor-pointer">Resend</span>{' '}
          or{' '}
          <span className="underline font-medium cursor-pointer">
            send to Email
          </span>
        </p>
      </div>

      {/* Verify Button */}
      <Button
        onClick={handleVerify}
        className="w-full text-[#FFF] mt-8"
        disabled={otp.some((digit) => !digit)}
      >
        Verify
      </Button>

      {/* Remember Device Checkbox */}
      <div className="flex items-center gap-2 justify-center mt-6 pb-8">
        <button
          onClick={() => setRememberDevice(!rememberDevice)}
          className="flex items-center justify-center"
        >
          <div
            className={`w-[18px] h-[18px] border-2 rounded ${
              rememberDevice ? 'bg-primary border-primary' : 'border-[#222]'
            } flex items-center justify-center`}
          >
            {rememberDevice && (
              <svg
                width="12"
                height="9"
                viewBox="0 0 12 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 4.5L4.5 8L11 1.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </button>
        <p className="text-sm">Remember this device.</p>
      </div>
    </section>
  );
}

export default OtpVerification;
