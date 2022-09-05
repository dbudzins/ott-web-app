import { useQuery } from 'react-query';
import type { GetPlaylistParams, Playlist } from 'ott-common/types/playlist';

import { generatePlaylistPlaceholder } from '#src/utils/collection';
import { queryClient } from '#src/providers/QueryProvider';
import { useAccountStore } from '#src/stores/AccountStore';
import { getPlaylistById } from '#src/services/mediaSigning.service';

const placeholderData = generatePlaylistPlaceholder(30);

export default function usePlaylist(
  playlistId?: string,
  params: GetPlaylistParams = {},
  enabled: boolean = true,
  usePlaceholderData: boolean = true,
): {
  data: Playlist | undefined;
  isLoading: boolean;
  error: unknown;
  isError: boolean;
} {
  const jwt = useAccountStore.getState().auth?.jwt;

  // const signingConfig = useConfigStore((store) => store.config.contentSigningService);
  // const host = signingConfig?.host;

  return useQuery(
    [playlistId, jwt],
    async () => {
      const playlist = await getPlaylistById(playlistId, params);

      // This pre-caches all playlist items and makes navigating a lot faster. This doesn't work when DRM is enabled
      // because of the token mechanism.
      playlist?.playlist?.forEach((playlistItem) => {
        queryClient.setQueryData(['media', playlistItem.mediaid, {}, undefined], playlistItem);
      });

      return playlist;
    },
    {
      retry: false,
      enabled: enabled && !!playlistId,
      keepPreviousData: false,
      placeholderData: usePlaceholderData ? placeholderData : undefined,
    },
  );
}
