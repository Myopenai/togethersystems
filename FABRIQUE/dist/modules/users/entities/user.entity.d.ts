export declare enum UserRole {
    USER = "user",
    ADMIN = "admin",
    MANAGER = "manager"
}
export declare class User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isEmailVerified: boolean;
    verificationToken?: string;
    verificationTokenExpires?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    loginAttempts: number;
    lockUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
    isLocked(): boolean;
    toJSON(): Omit<this, "password" | "verificationToken" | "verificationTokenExpires" | "resetPasswordToken" | "resetPasswordExpires" | "hashPassword" | "validatePassword" | "isLocked" | "toJSON">;
}
