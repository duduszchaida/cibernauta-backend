import { Controller, Post, Body, Get, UseGuards, Request, Query, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { FirebaseAuthGuard } from '../firebase/firebase.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.authService.validateUser(req.user.uid);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(forgotPasswordDto);
  }

  @Get('verify-reset-token')
  async verifyResetToken(@Query('oobCode') oobCode: string) {
    return this.authService.verifyResetToken(oobCode);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.uid, changePasswordDto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete('delete-account')
  async deleteAccount(@Request() req) {
    return this.authService.deleteAccount(req.user.uid);
  }

  @Post('resend-verification-email')
  async resendVerificationEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.resendVerificationEmail(verifyEmailDto.user_email);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('check-email-verification')
  async checkEmailVerification(@Request() req) {
    return this.authService.checkEmailVerificationStatus(req.user.uid);
  }
}