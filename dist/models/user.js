"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRole = void 0;
const sequelize_1 = require("sequelize");
const checkin_1 = require("./checkin");
const profile_1 = require("./profile");
const promoterStore_1 = require("./promoterStore");
var UserRole;
(function (UserRole) {
    UserRole["PROMOTER"] = "promoter";
    UserRole["SUPERVISOR"] = "supervisor";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
class User extends sequelize_1.Model {
    static initModel(sequelize) {
        User.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                field: 'user_id',
                comment: 'auto incrementing user_id of each user, unique index',
            },
            userName: {
                type: sequelize_1.DataTypes.STRING(64),
                allowNull: false,
                unique: true,
                field: 'user_name',
                comment: "user's name, unique",
            },
            firstName: {
                type: sequelize_1.DataTypes.STRING(250),
                allowNull: true,
                field: 'user_first_name',
            },
            lastName: {
                type: sequelize_1.DataTypes.STRING(250),
                allowNull: true,
                field: 'user_last_name',
            },
            password: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
                field: 'user_password_hash',
                comment: "user's password in salted and hashed format",
            },
            email: {
                type: sequelize_1.DataTypes.STRING(64),
                allowNull: false,
                unique: true,
                field: 'user_email',
                comment: "user's email, unique",
            },
            active: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0,
                field: 'user_active',
                comment: "user's activation status",
            },
            accountType: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
                field: 'user_account_type',
                comment: "user's account type (basic, premium, etc)",
            },
            hasAvatar: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0,
                field: 'user_has_avatar',
                comment: '1 if user has a local avatar, 0 if not',
            },
            rememberMeToken: {
                type: sequelize_1.DataTypes.STRING(64),
                allowNull: true,
                field: 'user_rememberme_token',
                comment: "user's remember-me cookie token",
            },
            creationTimestamp: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
                field: 'user_creation_timestamp',
                comment: "timestamp of the creation of user's account",
            },
            lastLoginTimestamp: {
                type: sequelize_1.DataTypes.BIGINT,
                allowNull: true,
                field: 'user_last_login_timestamp',
                comment: "timestamp of user's last login",
            },
            failedLogins: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 0,
                field: 'user_failed_logins',
                comment: "user's failed login attempts",
            },
            lastFailedLogin: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'user_last_failed_login',
                comment: 'unix timestamp of last failed login attempt',
            },
            activationHash: {
                type: sequelize_1.DataTypes.STRING(40),
                allowNull: true,
                field: 'user_activation_hash',
                comment: "user's email verification hash string",
            },
            registrationIp: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
                field: 'user_registration_ip',
            },
            passwordResetHash: {
                type: sequelize_1.DataTypes.CHAR(40),
                allowNull: true,
                field: 'user_password_reset_hash',
                comment: "user's password reset code",
            },
            passwordResetTimestamp: {
                type: sequelize_1.DataTypes.BIGINT,
                allowNull: true,
                field: 'user_password_reset_timestamp',
                comment: 'timestamp of the password reset request',
            },
            providerType: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                field: 'user_provider_type',
            },
            facebookUid: {
                type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
                field: 'user_facebook_uid',
                comment: 'optional - facebook UID',
            },
            role: {
                type: sequelize_1.DataTypes.ENUM(UserRole.PROMOTER, UserRole.SUPERVISOR, UserRole.ADMIN),
                allowNull: false,
                defaultValue: UserRole.PROMOTER,
                field: 'user_role',
            },
        }, {
            sequelize,
            modelName: 'user',
            indexes: [{ unique: true, fields: ['user_email'] }],
        });
    }
    static associate() {
        User.hasMany(promoterStore_1.PromoterStore, {
            foreignKey: 'promoterId',
            as: 'promoterStores',
        });
        User.hasOne(profile_1.Profile, { as: 'profile', foreignKey: 'userId' });
        User.hasMany(checkin_1.Checkin, { as: 'checkins', foreignKey: 'userId' });
    }
}
exports.User = User;
