import type { PlaylistItem } from '#types/playlist';

type RequiredProperties<T, P extends keyof T> = T & Required<Pick<T, P>>;

type DeprecatedPlaylistItem = {
  seriesPlayListId?: string;
  seriesPlaylistId?: string;
};

export const getSeriesId = (item: PlaylistItem & DeprecatedPlaylistItem) => {
  if (!item) {
    return undefined;
  }

  return item['seriesPlayListId'] || item.seriesPlaylistId || item.seriesId;
};

export const isSeriesPlaceholder = (item: PlaylistItem) => {
  return typeof getSeriesId(item) !== 'undefined';
};

export const isEpisode = (item: PlaylistItem) => {
  return item && 'episodeNumber' in item;
};

export const isLiveChannel = (item: PlaylistItem): item is RequiredProperties<PlaylistItem, 'contentType' | 'liveChannelsId'> =>
  item.contentType === 'LiveChannel' && !!item.liveChannelsId;

export const getSeriesIdFromEpisode = (item: PlaylistItem | undefined) => {
  if (!item || !isEpisode(item)) {
    return null;
  }

  const tags = item.tags ? item.tags.split(',') : [];
  const seriesIdTag = tags.find(function (tag) {
    return /seriesid_([\w\d]+)/i.test(tag);
  });

  if (seriesIdTag) {
    return seriesIdTag.split('_')[1];
  }

  if (item.seriesId) {
    return item.seriesId;
  }

  return null;
};
