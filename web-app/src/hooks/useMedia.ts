import { useQuery } from 'react-query';

import { useAccountStore } from '#src/stores/AccountStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import { getMediaById } from '#src/services/mediaSigning.service';

export default function useMedia(mediaId: string, enabled: boolean = true) {
  const jwt = useAccountStore.getState().auth?.jwt;

  const signingConfig = useConfigStore((store) => store.config.contentSigningService);
  const host = signingConfig?.host;

  return useQuery([mediaId, jwt], async () => await getMediaById(mediaId, { host, jwt }), {
    enabled: !!mediaId && enabled,
    retry: true,
    keepPreviousData: true,
  });
}
