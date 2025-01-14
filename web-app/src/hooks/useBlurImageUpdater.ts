import { useCallback, useEffect } from 'react';
import type { PlaylistItem } from 'ott-common/types/playlist';

import { useUIStore } from '../stores/UIStore';

const useBlurImageUpdater = (data?: PlaylistItem[] | PlaylistItem) => {
  useEffect(() => {
    const targetItem = Array.isArray(data) ? data?.[0] : data;

    if (!targetItem?.image) return;

    useUIStore.setState({
      blurImage: targetItem.image,
    });
  }, [data]);

  return useCallback((image: string) => {
    useUIStore.setState({
      blurImage: image,
    });
  }, []);
};

export default useBlurImageUpdater;
