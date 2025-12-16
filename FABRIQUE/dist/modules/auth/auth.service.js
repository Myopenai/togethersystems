"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const crypto_1 = require("crypto");
const util_1 = require("util");
const user_entity_1 = require("../users/entities/user.entity");
const i18n_service_1 = require("../i18n/i18n.service");
const mail_service_1 = require("../mail/mail.service");
const randomBytesAsync = (0, util_1.promisify)(crypto_1.randomBytes);
let AuthService = class AuthService {
    userRepository;
    jwtService;
    i18n;
    mailService;
    MAX_LOGIN_ATTEMPTS = 5;
    LOCK_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds
    constructor(userRepository, jwtService, i18n, mailService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.i18n = i18n;
        this.mailService = mailService;
    }
    async validateUser(email, password, locale) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException(this.i18n.t('auth.invalid_credentials', locale));
        }
        if (user.isLocked()) {
            throw new common_1.ForbiddenException(this.i18n.t('auth.account_locked', locale));
        }
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            await this.handleFailedLogin(user);
            throw new common_1.UnauthorizedException(this.i18n.t('auth.invalid_credentials', locale));
        }
        if (!user.isEmailVerified) {
            throw new common_1.ForbiddenException(this.i18n.t('auth.verification_required', locale));
        }
        // Reset login attempts on successful login
        await this.resetLoginAttempts(user);
        return user;
    }
    async login(loginDto, locale) {
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
    async register(registerDto, locale) {
        const { name, email, password } = registerDto;
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new common_1.BadRequestException(this.i18n.t('auth.email_already_exists', locale));
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
    async verifyEmail(token, locale) {
        const user = await this.userRepository.findOne({
            where: {
                verificationToken: token,
                verificationTokenExpires: new Date(),
            },
        });
        if (!user) {
            throw new common_1.BadRequestException(this.i18n.t('auth.verification_invalid', locale));
        }
        if (user.isEmailVerified) {
            throw new common_1.BadRequestException(this.i18n.t('auth.verification_already_verified', locale));
        }
        user.isEmailVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;
        await this.userRepository.save(user);
        return { message: this.i18n.t('auth.verification_success', locale) };
    }
    async requestPasswordReset(email, locale) {
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
    async resetPassword(resetPasswordDto, locale) {
        const { token, newPassword } = resetPasswordDto;
        const user = await this.userRepository.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: new Date(),
            },
        });
        if (!user) {
            throw new common_1.BadRequestException(this.i18n.t('auth.invalid_reset_token', locale));
        }
        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await this.userRepository.save(user);
        return { message: this.i18n.t('auth.password_changed', locale) };
    }
    async changePassword(userId, changePasswordDto, locale) {
        const { currentPassword, newPassword } = changePasswordDto;
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException(this.i18n.t('auth.user_not_found', locale));
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException(this.i18n.t('auth.invalid_current_password', locale));
        }
        user.password = newPassword;
        await this.userRepository.save(user);
        return { message: this.i18n.t('auth.password_changed', locale) };
    }
    async handleFailedLogin(user) {
        user.loginAttempts += 1;
        if (user.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
            user.lockUntil = new Date(Date.now() + this.LOCK_TIME);
        }
        await this.userRepository.save(user);
    }
    async resetLoginAttempts(user) {
        if (user.loginAttempts > 0 || user.lockUntil) {
            user.loginAttempts = 0;
            user.lockUntil = null;
            await this.userRepository.save(user);
        }
    }
    async resendVerificationEmail(email, locale) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.BadRequestException(this.i18n.t('auth.user_not_found', locale));
        }
        if (user.isEmailVerified) {
            throw new common_1.BadRequestException(this.i18n.t('auth.verification_already_verified', locale));
        }
        // Update verification token
        user.verificationToken = (await randomBytesAsync(32)).toString('hex');
        user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await this.userRepository.save(user);
        // Send verification email
        await this.mailService.sendVerificationEmail(user, locale);
        return { message: this.i18n.t('auth.verification_resend_success', locale) };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        i18n_service_1.I18nService, typeof (_a = typeof mail_service_1.MailService !== "undefined" && mail_service_1.MailService) === "function" ? _a : Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map