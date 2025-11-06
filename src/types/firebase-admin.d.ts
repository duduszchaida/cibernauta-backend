// Type augmentation for firebase-admin Auth methods
import 'firebase-admin/auth';

declare module 'firebase-admin/auth' {
  interface BaseAuth {
    /**
     * Verifies a password reset code sent to the user by email or other out-of-band mechanism.
     * Returns the user's email address if valid.
     *
     * @param code - The password reset code to verify.
     * @returns A promise fulfilled with the user's email address if valid.
     */
    verifyPasswordResetCode(code: string): Promise<string>;

    /**
     * Completes the password reset process, given a confirmation code and new password.
     *
     * @param code - The confirmation code send via email to the user.
     * @param newPassword - The new password.
     * @returns A promise that resolves when the password reset is complete.
     */
    confirmPasswordReset(code: string, newPassword: string): Promise<void>;
  }
}
