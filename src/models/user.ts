import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Checkin } from './checkin';
import { Profile } from './profile';
import { PromoterStore } from './promoterStore';

export enum UserRole {
  PROMOTER = 'promoter',
  SUPERVISOR = 'supervisor',
  ADMIN = 'admin',
}

export interface IUser {
  id?: number;
  userName: string;
  firstName?: string;
  lastName?: string;
  password: string;
  email: string;
  active: boolean;
  accountType: number;
  hasAvatar: boolean;
  rememberMeToken?: string;
  creationTimestamp: Date;
  lastLoginTimestamp?: number;
  failedLogins: number;
  lastFailedLogin?: number;
  activationHash?: string;
  registrationIp?: string;
  passwordResetHash?: string;
  passwordResetTimestamp?: number;
  providerType?: string;
  facebookUid?: number;
  role: UserRole;
}

type UserCreationAttributes = Optional<IUser, 'id'>;

export class User
  extends Model<IUser, UserCreationAttributes>
  implements IUser
{
  public role!: UserRole;
  public id!: number;
  public userName!: string;
  public firstName?: string;
  public lastName?: string;
  public password!: string;
  public email!: string;
  public active!: boolean;
  public accountType!: number;
  public hasAvatar!: boolean;
  public rememberMeToken?: string;
  public creationTimestamp!: Date;
  public lastLoginTimestamp?: number;
  public failedLogins!: number;
  public lastFailedLogin?: number;
  public activationHash?: string;
  public registrationIp?: string;
  public passwordResetHash?: string;
  public passwordResetTimestamp?: number;
  public providerType?: string;
  public facebookUid?: number;

  static initModel(sequelize: Sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          field: 'user_id',
          comment: 'auto incrementing user_id of each user, unique index',
        },
        userName: {
          type: DataTypes.STRING(64),
          allowNull: false,
          unique: true,
          field: 'user_name',
          comment: "user's name, unique",
        },
        firstName: {
          type: DataTypes.STRING(250),
          allowNull: true,
          field: 'user_first_name',
        },
        lastName: {
          type: DataTypes.STRING(250),
          allowNull: true,
          field: 'user_last_name',
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: 'user_password_hash',
          comment: "user's password in salted and hashed format",
        },
        email: {
          type: DataTypes.STRING(64),
          allowNull: false,
          unique: true,
          field: 'user_email',
          comment: "user's email, unique",
        },
        active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: 0,
          field: 'user_active',
          comment: "user's activation status",
        },
        accountType: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          field: 'user_account_type',
          comment: "user's account type (basic, premium, etc)",
        },
        hasAvatar: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: 0,
          field: 'user_has_avatar',
          comment: '1 if user has a local avatar, 0 if not',
        },
        rememberMeToken: {
          type: DataTypes.STRING(64),
          allowNull: true,
          field: 'user_rememberme_token',
          comment: "user's remember-me cookie token",
        },
        creationTimestamp: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'user_creation_timestamp',
          comment: "timestamp of the creation of user's account",
        },
        lastLoginTimestamp: {
          type: DataTypes.BIGINT,
          allowNull: true,
          field: 'user_last_login_timestamp',
          comment: "timestamp of user's last login",
        },
        failedLogins: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: 0,
          field: 'user_failed_logins',
          comment: "user's failed login attempts",
        },
        lastFailedLogin: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'user_last_failed_login',
          comment: 'unix timestamp of last failed login attempt',
        },
        activationHash: {
          type: DataTypes.STRING(40),
          allowNull: true,
          field: 'user_activation_hash',
          comment: "user's email verification hash string",
        },
        registrationIp: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: 'user_registration_ip',
        },
        passwordResetHash: {
          type: DataTypes.CHAR(40),
          allowNull: true,
          field: 'user_password_reset_hash',
          comment: "user's password reset code",
        },
        passwordResetTimestamp: {
          type: DataTypes.BIGINT,
          allowNull: true,
          field: 'user_password_reset_timestamp',
          comment: 'timestamp of the password reset request',
        },
        providerType: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'user_provider_type',
        },
        facebookUid: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: true,
          field: 'user_facebook_uid',
          comment: 'optional - facebook UID',
        },
        role: {
          type: DataTypes.ENUM(
            UserRole.PROMOTER,
            UserRole.SUPERVISOR,
            UserRole.ADMIN
          ),
          allowNull: false,
          defaultValue: UserRole.PROMOTER,
          field: 'user_role',
        },
      },
      {
        sequelize,
        modelName: 'user',
        indexes: [{ unique: true, fields: ['user_email'] }],
      }
    );
  }

  static associate() {
    User.hasMany(PromoterStore, {
      foreignKey: 'promoterId',
      as: 'promoterStores',
    });

    User.hasOne(Profile, { as: 'profile', foreignKey: 'userId' });
    User.hasMany(Checkin, { as: 'checkins', foreignKey: 'userId' });
  }
}
