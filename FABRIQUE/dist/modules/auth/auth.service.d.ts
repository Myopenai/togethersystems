import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { I18nService } from '../i18n/i18n.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    private readonly i18n;
    private readonly mailService;
    private readonly MAX_LOGIN_ATTEMPTS;
    private readonly LOCK_TIME;
    constructor(userRepository: Repository<User>, jwtService: JwtService, i18n: I18nService, mailService: MailService);
    validateUser(email: string, password: string, locale: string): Promise<User>;
    login(loginDto: LoginDto, locale: string): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import("../users/entities/user.entity").UserRole;
            isEmailVerified: boolean;
        };
    }>;
    register(registerDto: RegisterDto, locale: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import("../users/entities/user.entity").UserRole;
        isEmailVerified: boolean;
        resetPasswordToken?: string;
        resetPasswordExpires?: Date;
        loginAttempts: number;
        lockUntil?: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    verifyEmail(token: string, locale: string): Promise<{
        message: string;
    }>;
    requestPasswordReset(email: string, locale: string): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto, locale: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto, locale: string): Promise<{
        message: string;
    }>;
    private handleFailedLogin;
    private resetLoginAttempts;
    resendVerificationEmail(email: string, locale: string): Promise<{
        message: string;
    }>;
}
