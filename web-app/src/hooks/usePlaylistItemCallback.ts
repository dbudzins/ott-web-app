import type { PlaylistItem } from 'ott-common/types/playlist';
import { addQueryParams } from 'ott-common/src/utils/formatting';

import { useAccountStore } from '../stores/AccountStore';
import { useConfigStore } from '../stores/ConfigStore';

import useEventCallback from '#src/hooks/useEventCallback';
import { getMediaById } from '#src/services/mediaSigning.service';

export const usePlaylistItemCallback = (startDateTime?: string | null, endDateTime?: string | null) => {
  const signingConfig = useConfigStore((state) => state.config?.contentSigningService);

  const applyLiveStreamOffset = (item: PlaylistItem) => {
    if (!startDateTime) return item;

    // The timeParam can either be just a start date like `2022-08-08T20:00:00` (to extend DVR) or a range like
    // `2022-08-08T20:00:00-2022-08-08T22:00:00` to select a VOD from the live stream.
    const timeParam = [startDateTime, endDateTime].filter(Boolean).join('-');

    return {
      ...item,
      allSources: undefined, // `allSources` need to be cleared otherwise JW Player will use those instead
      sources: item.sources.map((source) => ({
        ...source,
        file: addQueryParams(source.file, {
          t: timeParam,
        }),
      })),
    };
  };

  return useEventCallback(async (item: PlaylistItem) => {
    const jwt = useAccountStore(({ auth }) => auth)?.jwt;
    const host = signingConfig?.host;
    const signingEnabled = !!host;

    if (!signingEnabled) return applyLiveStreamOffset(item);

    const signedMediaItem = await getMediaById(item.mediaid, { host: signingConfig.host, jwt: jwt });

    return signedMediaItem && applyLiveStreamOffset(signedMediaItem);
  });
};
