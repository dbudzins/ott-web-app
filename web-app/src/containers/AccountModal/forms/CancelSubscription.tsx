import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { formatDate } from 'ott-common/src/utils/formatting';

import CancelSubscriptionForm from '../../../components/CancelSubscriptionForm/CancelSubscriptionForm';
import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';
import SubscriptionCancelled from '../../../components/SubscriptionCancelled/SubscriptionCancelled';

import { removeQueryParam } from '#src/utils/history';
import { useAccountStore } from '#src/stores/AccountStore';
import { updateSubscription } from '#src/stores/AccountController';

const CancelSubscription = () => {
  const { t } = useTranslation('account');
  const history = useHistory();
  const subscription = useAccountStore((s) => s.subscription);
  const [cancelled, setCancelled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelSubscriptionConfirmHandler = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await updateSubscription('cancelled');
      setCancelled(true);
    } catch (error: unknown) {
      setError(t('cancel_subscription.unknown_error_occurred'));
    }

    setSubmitting(false);
  };

  const closeHandler = () => {
    history.replace(removeQueryParam(history, 'u'));
  };

  if (!subscription) return null;

  return (
    <React.Fragment>
      {cancelled ? (
        <SubscriptionCancelled expiresDate={formatDate(subscription.expiresAt)} onClose={closeHandler} />
      ) : (
        <CancelSubscriptionForm onConfirm={cancelSubscriptionConfirmHandler} onCancel={closeHandler} submitting={submitting} error={error} />
      )}
      {submitting ? <LoadingOverlay transparentBackground inline /> : null}
    </React.Fragment>
  );
};
export default CancelSubscription;
