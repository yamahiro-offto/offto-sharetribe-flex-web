import { types as sdkTypes } from './sdkLoader';
import { plainToClass, classToPlain } from 'class-transformer';
const { LatLng, LatLngBounds } = sdkTypes;

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
  fricday: BusinessHour = new BusinessHour();
  saturday: BusinessHour = new BusinessHour();
}

export class OfftoUserPublicData {
  type?: string = UserType.CUSTOMER;
  geolocation?: { lat: string; lng: string } = LatLng(0, 0);
  businessDate?: BusinessDate;
  activity?: Activity = Activity.OTHER;
  phoneNumber?: string = '000-000-0000';

  static publicDataIsShop(publicData: any): boolean {
    return !!publicData.type && publicData.type === UserType.SHOP;
  }
}

export class OfftoUser {
  publicData?: OfftoUserPublicData = new OfftoUserPublicData();

  static userIsShop(user: any): boolean {
    return !!user && OfftoUserPublicData.publicDataIsShop(user.attributes.profile.publicData);
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
}
