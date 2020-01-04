// ================ const definitions ================ //
export const USER_PUBLICDATA_ATTRIBUTES = {
  TYPE: {
    type: 'enum',
    name: 'type',
    values: {
      CUSTOMER: 'customer',
      SHOP: 'shop',
    },
  },
};

export const USERTYPE_IS_SHOP = currentUser => {
  return (
    currentUser &&
    currentUser.attributes.profile.publicData.type &&
    currentUser.attributes.profile.publicData.type === USER_PUBLICDATA_ATTRIBUTES.TYPE.values.SHOP
  );
};
