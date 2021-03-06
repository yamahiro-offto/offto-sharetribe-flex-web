/**
 * Export reducers from ducks modules of different containers (i.e. default export)
 * We are following Ducks module proposition:
 * https://github.com/erikras/ducks-modular-redux
 */
import CheckoutPage from './CheckoutPage/CheckoutPage.duck';
import ContactDetailsPage from './ContactDetailsPage/ContactDetailsPage.duck';
import EditListingPage from './EditListingPage/EditListingPage.duck';
import InboxPage from './InboxPage/InboxPage.duck';
import InputCustomerDetailInfoPage from './InputCustomerDetailInfoPage/InputCustomerDetailInfoPage.duck';
import ListingPage from './ListingPage/ListingPage.duck';
import ManageListingsPage from './ManageListingsPage/ManageListingsPage.duck';
import ManageAdditionalItemsPage from './ManageAdditionalItemsPage/ManageAdditionalItemsPage.duck';
import PasswordChangePage from './PasswordChangePage/PasswordChangePage.duck';
import PasswordRecoveryPage from './PasswordRecoveryPage/PasswordRecoveryPage.duck';
import PasswordResetPage from './PasswordResetPage/PasswordResetPage.duck';
import PaymentMethodsPage from './PaymentMethodsPage/PaymentMethodsPage.duck';
import ProfilePage from './ProfilePage/ProfilePage.duck';
import ProfileShopPage from './ProfileShopPage/ProfileShopPage.duck';
import ProfileSettingsPage from './ProfileSettingsPage/ProfileSettingsPage.duck';
import ProfileSettingsShopPage from './ProfileSettingsShopPage/ProfileSettingsShopPage.duck';
import SearchPage from './SearchPage/SearchPage.duck';
import SelectAdditionalItemsPage from './SelectAdditionalItemsPage/SelectAdditionalItemsPage.duck';
import StripePayoutPage from './StripePayoutPage/StripePayoutPage.duck';
import TransactionPage from './TransactionPage/TransactionPage.duck';

export {
  CheckoutPage,
  ContactDetailsPage,
  EditListingPage,
  InboxPage,
  InputCustomerDetailInfoPage,
  ListingPage,
  ManageListingsPage,
  ManageAdditionalItemsPage,
  PasswordChangePage,
  PasswordRecoveryPage,
  PasswordResetPage,
  PaymentMethodsPage,
  ProfilePage,
  ProfileShopPage,
  ProfileSettingsPage,
  ProfileSettingsShopPage,
  SearchPage,
  SelectAdditionalItemsPage,
  StripePayoutPage,
  TransactionPage,
};
