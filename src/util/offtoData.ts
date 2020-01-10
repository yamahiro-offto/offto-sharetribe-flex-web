import { types as sdkTypes } from './sdkLoader';
import { plainToClass, classToPlain } from 'class-transformer';
import { LabelHTMLAttributes } from 'react';
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
  SOME_DAMAGED = 'some_daaged',
}

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

export interface OfftoListingDetailInfo {}

export class OfftoListingDetailInfoSkiSnowboard implements OfftoListingDetailInfo {
  length: Decimal = new Decimal(0); // cm
  radius: Decimal = new Decimal(0); // m
  headWidth: Decimal = new Decimal(0); // cm
  waistWidth: Decimal = new Decimal(0); // cm
  tailWidth: Decimal = new Decimal(0); // cm
  binding: any = {};
  modelYear: string = '';
}

export class OfftoListingDetailInfoOther implements OfftoListingDetailInfo {}

export class OfftoListingPubilcData {
  activity: Activity = Activity.OTHER;
  rentalStyle: RentalStyle = RentalStyle.CUSTOMER_SELECT;
  gearId: string = '';
  color: Color = Color.WHITE;
  condition: Condition = Condition.LIKELY_NEW;
  desc = '';
  detailInfo?: OfftoListingDetailInfo = new OfftoListingDetailInfoOther();
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
}
