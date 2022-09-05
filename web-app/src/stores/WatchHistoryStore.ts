import type { Playlist, PlaylistItem } from 'ott-common/types/playlist';

import { VideoProgressMinMax } from '../config';
import { PersonalShelf } from '../enum/PersonalShelf';

import { createStore } from './utils';

import type { WatchHistoryItem } from '#types/watchHistory';

type WatchHistoryState = {
  watchHistory: WatchHistoryItem[];
  playlistItemsLoaded: boolean;
  getItem: (item: PlaylistItem) => WatchHistoryItem | undefined;
  getPlaylist: () => Playlist;
  getDictionary: () => { [key: string]: number };
};

export const useWatchHistoryStore = createStore<WatchHistoryState>('WatchHistoryStore', (_, get) => ({
  watchHistory: [],
  playlistItemsLoaded: false,
  getItem: (item: PlaylistItem) =>
    get().watchHistory.find(({ mediaid, progress }) => {
      return mediaid === item.mediaid && progress > VideoProgressMinMax.Min && progress < VideoProgressMinMax.Max;
    }),
  getPlaylist: () =>
    ({
      feedid: PersonalShelf.ContinueWatching,
      title: 'Continue watching',
      playlist: get()
        .watchHistory.filter(({ playlistItem, progress }) => !!playlistItem && progress > VideoProgressMinMax.Min && progress < VideoProgressMinMax.Max)
        .map(({ playlistItem }) => playlistItem),
    } as Playlist),
  getDictionary: () =>
    get().watchHistory.reduce((dict: { [key: string]: number }, item) => {
      dict[item.mediaid] = item.progress;

      return dict;
    }, {}),
}));
