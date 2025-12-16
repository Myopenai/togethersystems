import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
import { User } from '../users/entities/user.entity';
import { I18nService } from '../i18n/i18n.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailService } from '../mail/mail.service';

const randomBytesAsync = promisify(randomBytes);

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, password: string, locale: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException(this.i18n.t('auth.invalid_credentials', locale));
    }

    if (user.isLocked()) {
      throw new ForbiddenException(this.i18n.t('auth.account_locked', locale));
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException(this.i18n.t('auth.invalid_credentials', locale));
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException(this.i18n.t('auth.verification_required', locale));
    }

    // Reset login attempts on successful login
    await this.resetLoginAttempts(user);

    return user;
  }

  async login(loginDto: LoginDto, locale: string) {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password, locale);
    
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async register(registerDto: RegisterDto, locale: string) {
    const { name, email, password } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException(this.i18n.t('auth.email_already_exists', locale));
    }

    const user = this.userRepository.create({
      name,
      email,
      password,
      verificationToken: (await randomBytesAsync(32)).toString('hex'),
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await this.userRepository.save(user);

    // Send verification email
    await this.mailService.sendVerificationEmail(user, locale);

    // Don't return sensitive data
    const { password: _, verificationToken, verificationTokenExpires, ...result } = user;
    return result;
  }

  async verifyEmail(token: string, locale: string) {
    const user = await this.userRepository.findOne({
      where: {
        verificationToken: token,
        verificationTokenExpires: new Date(),
      },
    });

    if (!user) {
      throw new BadRequestException(this.i18n.t('auth.verification_invalid', locale));
    }

    if (user.isEmailVerified) {
      throw new BadRequestException(this.i18n.t('auth.verification_already_verified', locale));
    }

    user.isEmailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await this.userRepository.save(user);

    return { message: this.i18n.t('auth.verification_success', locale) };
  }

  async requestPasswordReset(email: string, locale: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (user) {
      user.resetPasswordToken = (await randomBytesAsync(32)).toString('hex');
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
      await this.userRepository.save(user);
      
      await this.mailService.sendPasswordResetEmail(user, locale);
    }

    // Always return success to prevent email enumeration
    return { message: this.i18n.t('auth.reset_link_sent', locale) };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, locale: string) {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: new Date(),
      },
    });

    if (!user) {
      throw new BadRequestException(this.i18n.t('auth.invalid_reset_token', locale));
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.userRepository.save(user);

    return { message: this.i18n.t('auth.password_changed', locale) };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto, locale: string) {
    const { currentPassword, newPassword } = changePasswordDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException(this.i18n.t('auth.user_not_found', locale));
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(this.i18n.t('auth.invalid_current_password', locale));
    }

    user.password = newPassword;
    await this.userRepository.save(user);

    return { message: this.i18n.t('auth.password_changed', locale) };
  }

  private async handleFailedLogin(user: User) {
    user.loginAttempts += 1;

    if (user.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + this.LOCK_TIME);
    }

    await this.userRepository.save(user);
  }

  private async resetLoginAttempts(user: User) {
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = null;
      await this.userRepository.save(user);
    }
  }

  async resendVerificationEmail(email: string, locale: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException(this.i18n.t('auth.user_not_found', locale));
    }

    if (user.isEmailVerified) {
      throw new BadRequestException(this.i18n.t('auth.verification_already_verified', locale));
    }

    // Update verification token
    user.verificationToken = (await randomBytesAsync(32)).toString('hex');
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.userRepository.save(user);

    // Send verification email
    await this.mailService.sendVerificationEmail(user, locale);

    return { message: this.i18n.t('auth.verification_resend_success', locale) };
  }
}
