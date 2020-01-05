import { types as sdkTypes } from './sdkLoader';
import { plainToClass, classToPlain } from 'class-transformer';
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
