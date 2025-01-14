import { useQueries } from 'react-query';
import shallow from 'zustand/shallow';
import type { MediaOffer } from 'ott-common/types/media';
import type { PlaylistItem } from 'ott-common/types/playlist';
import { isLocked } from 'ott-common/src/utils/entitlements';

import type { GetEntitlementsResponse } from '#types/checkout';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';
import { getEntitlements } from '#src/services/checkout.service';

export type UseEntitlementResult = {
  isEntitled: boolean;
  isMediaEntitlementLoading: boolean;
  mediaOffers: MediaOffer[];
};

export type UseEntitlement = (playlistItem?: PlaylistItem) => UseEntitlementResult;

type QueryResult = {
  responseData?: GetEntitlementsResponse;
};

/**
 * useEntitlement()
 *
 * Free items: Access
 * AVOD - Regular items free, TVOD items need entitlement
 * AuthVOD - For regular items user should be logged in, TVOD items need entitlement
 * SVOD - For regular items user should have subscription OR entitlement, premier items need entitlement
 *
 *  */
const useEntitlement: UseEntitlement = (playlistItem) => {
  const { sandbox, accessModel } = useConfigStore(
    ({ config, accessModel }) => ({
      sandbox: Boolean(config?.integrations?.cleeng?.useSandbox),
      accessModel,
    }),
    shallow,
  );
  const { user, subscription, auth } = useAccountStore(
    ({ user, subscription, auth }) => ({
      user,
      subscription,
      auth,
    }),
    shallow,
  );

  const isPreEntitled = playlistItem && !isLocked(accessModel, !!user, !!subscription, playlistItem);
  const mediaOffers = playlistItem?.mediaOffers || [];

  // this query is invalidated when the subscription gets reloaded
  const mediaEntitlementQueries = useQueries(
    mediaOffers.map(({ offerId }) => ({
      queryKey: ['entitlements', offerId],
      queryFn: () => getEntitlements({ offerId }, sandbox, auth?.jwt || ''),
      enabled: !!playlistItem && !!auth?.jwt && !!offerId && !isPreEntitled,
      refetchOnMount: 'always' as const,
    })),
  );

  // when the user is logged out the useQueries will be disabled but could potentially return its cached data
  const isMediaEntitled = !!auth?.jwt && mediaEntitlementQueries.some((item) => item.isSuccess && (item.data as QueryResult)?.responseData?.accessGranted);
  const isMediaEntitlementLoading = !isMediaEntitled && mediaEntitlementQueries.some((item) => item.isLoading);

  const isEntitled = !!playlistItem && (isPreEntitled || isMediaEntitled);

  return { isEntitled, isMediaEntitlementLoading, mediaOffers };
};

export default useEntitlement;
