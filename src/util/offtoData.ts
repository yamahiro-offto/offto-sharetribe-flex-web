import { types as sdkTypes } from './sdkLoader';
import { plainToClass, classToPlain } from 'class-transformer';
import { LabelHTMLAttributes } from 'react';
import { propTypes } from './types';
import { Decimal } from 'decimal.js';
const { LatLng, UUID, Money } = sdkTypes;
type C_UUID = typeof UUID;
type C_LatLng = typeof LatLng;
type C_Money = typeof Money;

// ================ const definitions ================ //

export enum UserType {
  CUSTOMER = 'customer',
  SHOP = 'shop',
}

export enum Activity {
  SKI_SNOWBOARD = 'ski_snowboard',
  CYCLE = 'cycle',
  OTHER = 'other',
}

export enum RentalStyle {
  CUSTOMER_SELECT = 'customer_select',
  SHOP_RECOMMEND = 'shop_recommend',
}

export enum Size {
  XL = 'xl',
  L = 'l',
  M = 'm',
  S = 's',
  XS = 'xs',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  // UNISEX = 'unisex',
}

export enum Age {
  ADULT = 'adult',
  CHILD = 'child',
  // ALL_AGE = 'all_age',
}

export enum Skill {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum Color {
  BLACK = 'black',
  GRAY = 'gray',
  WHITE = 'white',
  RED = 'red',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  PURPLE = 'purple',
  PINK = 'pink',
  LIGHT_BLUE = 'light_blue',
  YELLOW_GREEN = 'yellow_green',
  SILVER = 'silver',
  GOLD = 'gold',
}

export enum Condition {
  LIKELY_NEW = 'likely_new',
  LITTLE_DAMAGED = 'lettle_damaged',
  SOME_DAMAGED = 'some_damaged',
}

export enum ActivityTypeSnow {
  ALL_MOUNTAIN = 'all_mountain',
  BACK_COUNTRY = 'back_country',
}

export enum ActivityTypeCycle {}

export enum ActivityTypeOther {
  NONE = 'none',
}

export type ActivityType = ActivityTypeSnow | ActivityTypeCycle | ActivityTypeOther;
export const ACTIVITYTYPE_TABLE = {
  [Activity.SKI_SNOWBOARD]: ActivityTypeSnow,
  [Activity.CYCLE]: ActivityTypeCycle,
  [Activity.OTHER]: ActivityTypeOther,
};

// ================ class definitions ================ //

export class BusinessHour {
  isRegularHoliday: boolean = false;
  startTime: string = '0';
  endTime: string = '0';
}

export class BusinessDate {
  sunday: BusinessHour = new BusinessHour();
  monday: BusinessHour = new BusinessHour();
  tuesday: BusinessHour = new BusinessHour();
  wednesday: BusinessHour = new BusinessHour();
  thursday: BusinessHour = new BusinessHour();
  friday: BusinessHour = new BusinessHour();
  saturday: BusinessHour = new BusinessHour();
}

export class OfftoUserPublicData {
  type?: string = UserType.CUSTOMER;
  geolocation?: C_LatLng = new LatLng(0, 0);
  businessDate?: BusinessDate = new BusinessDate();
  activity?: Activity = Activity.OTHER;
  phoneNumber?: string = '000-000-0000';
  additionalItems?: AdditionalItem[] = [];

  constructor(publicData?: any) {
    this.type = !(publicData && publicData.type) ? this.type : publicData.type;
    this.geolocation = !(publicData && publicData.geolocation)
      ? this.geolocation
      : publicData.geolocation;
    this.businessDate = !(publicData && publicData.businessDate)
      ? this.businessDate
      : { ...classToPlain(this.businessDate), ...publicData.businessDate };
    this.activity = !(publicData && publicData.activity) ? this.activity : publicData.activity;
    this.phoneNumber = !(publicData && publicData.phoneNumber)
      ? this.phoneNumber
      : publicData.phoneNumber;
    this.additionalItems = !(publicData && publicData.additionalItems)
      ? this.additionalItems
      : publicData.additionalItems;
  }

  static publicDataIsShop(publicData: any): boolean {
    return !!publicData && !!publicData.type && publicData.type === UserType.SHOP;
  }

  static sanitize(publicData: any): Object {
    const default_publicData = classToPlain(new OfftoUserPublicData());
    const new_publicData = {
      ...default_publicData,
      ...publicData,
    };

    return new_publicData;
  }

  // toPlain(): any {
  //   return classToPlain(this);
  // }
}

export class OfftoListingDetailInfoSkiSnowboard {
  brand: string = '';
  length: number = 180; // cm
  radius: number = 20; // m
  widthHead: number = 20; // cm
  widthWaist: number = 15; // cm
  widthTail: number = 20; // cm
  binding: string = '';
  modelYear: string = '';

  constructor(params?: any) {
    if (params) {
      Object.assign(this, params);
    }
  }
}

export class OfftoListingDetailInfoCycle {
  constructor(params?: any) {}
}
export class OfftoListingDetailInfoOther {
  constructor(params?: any) {}
}

export type OfftoListingDetailInfo =
  | OfftoListingDetailInfoSkiSnowboard
  | OfftoListingDetailInfoCycle
  | OfftoListingDetailInfoOther;

// export const OFFTOLISTING_DETAILINFO_TABLE: { [key: string]: OfftoListingDetailInfo } = {
export const OFFTOLISTING_DETAILINFO_TABLE = {
  [Activity.SKI_SNOWBOARD]: OfftoListingDetailInfoSkiSnowboard,
  [Activity.CYCLE]: OfftoListingDetailInfoCycle,
  [Activity.OTHER]: OfftoListingDetailInfoOther,
};

export class AdditionalItem {
  id: string = '';
  label: string = '';
  price: C_Money = new Money(0, 'JPY');
}

export class OfftoListingPubilcData {
  activity: Activity = Activity.OTHER;
  rentalStyle: RentalStyle = RentalStyle.CUSTOMER_SELECT;
  gearId: string = '';
  activityType: ActivityType = ActivityTypeOther.NONE;
  size: Size = Size.M;
  skill: Skill = Skill.BEGINNER;
  age: Age = Age.ADULT;
  gender: Gender = Gender.FEMALE;
  color: Color = Color.WHITE;
  condition: Condition = Condition.LIKELY_NEW;
  description: string = '';
  additionalItems: AdditionalItem[] = [];
  detailInfo: OfftoListingDetailInfo = new OfftoListingDetailInfoOther();

  constructor(publicData?: any) {
    if (publicData) {
      Object.assign(this, publicData);
      const activity = this.activity;
      const detailInfoType = OFFTOLISTING_DETAILINFO_TABLE[activity];
      this.detailInfo = new detailInfoType(detailInfoType);
    }
  }
}

// ================ class definitions ================ //

export class OfftoUser {
  firstName: string = '';
  lastName: string = '';
  displayName: string = '';
  abbreviatedName: string = '';
  bio?: string = '';
  publicData: OfftoUserPublicData = new OfftoUserPublicData();
  protectedData: {} = {};
  privateData: {} = {};
  profileImageId: C_UUID = new UUID();

  static userIsShop(user: any): boolean {
    return (
      !!user &&
      !!user.attributes.profile.publicData &&
      OfftoUserPublicData.publicDataIsShop(user.attributes.profile.publicData)
    );
  }

  static createUserParam(createUserParams: any, isShop: boolean = false) {
    // add UserType in publicData.type
    const publicData = isShop
      ? {
          ...createUserParams.publicData,
          type: UserType.SHOP,
        }
      : {
          ...createUserParams.publicData,
          type: UserType.CUSTOMER,
        };

    // overwrite publicData
    return { ...createUserParams, publicData: publicData };
  }

  static sanitizePublicData(pubilcData: any) {
    return OfftoUserPublicData.sanitize(pubilcData);
  }
}

export class OfftoListingAttributes {
  title: string = '(no title)';
  description: string = '';
  geolocation: C_LatLng = new LatLng(0, 0);
  price: C_Money = new Money(0, 'JPY');
  publicData: OfftoListingPubilcData = new OfftoListingPubilcData();

  constructor(attributes: any) {
    if (attributes) {
      Object.assign(this, attributes);
    }
  }
}
