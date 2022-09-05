import React from 'react';
import { render } from '@testing-library/react';
import type { Subscription } from 'ott-common/types/subscription';

import customer from '../../fixtures/customer.json';
import subscription from '../../fixtures/subscription.json';

import RenewSubscriptionForm from './RenewSubscriptionForm';

import type { Customer } from '#types/account';

describe('<RenewSubscriptionForm>', () => {
  test('renders and matches snapshot', () => {
    const { container } = render(
      <RenewSubscriptionForm
        customer={customer as Customer}
        subscription={subscription as Subscription}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
        error={null}
        submitting={false}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
