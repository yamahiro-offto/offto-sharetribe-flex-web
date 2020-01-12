/* eslint-disable no-console */
import EditListingAdditionalitemForm from './EditListingAdditionalitemForm';

export const Empty = {
  component: EditListingAdditionalitemForm,
  props: {
    onSubmit: values => {
      console.log('Submit EditListingAdditionalitemForm with (unformatted) values:', values);
    },
    saveActionMsg: 'Save description',
    updated: false,
    updateInProgress: false,
    disabled: false,
    ready: false,
  },
  group: 'forms',
};
