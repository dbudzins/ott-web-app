import React, { useEffect } from 'react';

import { PersonalShelf, PersonalShelves } from '#src/enum/PersonalShelf';
import usePlaylist from '#src/hooks/usePlaylist';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { PLAYLIST_LIMIT } from '#src/config';
import type { Playlist, PlaylistItem } from '#types/playlist';

type ChildrenParams = {
  playlist: Playlist;
  isLoading: boolean;
  error: unknown;
  style?: React.CSSProperties;
};

type Props = {
  playlistId?: string;
  type: 'playlist' | 'continue_watching' | 'favorites';
  relatedItem?: PlaylistItem;
  onPlaylistUpdate?: (playlist: Playlist) => void;
  children: (childrenParams: ChildrenParams) => JSX.Element;
  style?: React.CSSProperties;
  showEmpty?: boolean;
};

const PlaylistContainer = ({ playlistId, type, onPlaylistUpdate, style, children, showEmpty = false }: Props): JSX.Element | null => {
  const isAlternativeShelf = PersonalShelves.includes(playlistId as PersonalShelf);
  const {
    isLoading,
    error,
    data: fetchedPlaylist = { title: '', playlist: [] },
  } = usePlaylist(playlistId, { page_limit: PLAYLIST_LIMIT.toString() }, !isAlternativeShelf, true);
  let playlist = fetchedPlaylist;

  const favoritesPlaylist = useFavoritesStore((state) => state.getPlaylist());
  const watchHistoryPlaylist = useWatchHistoryStore((state) => state.getPlaylist());

  useEffect(() => {
    if (playlist && onPlaylistUpdate) onPlaylistUpdate(playlist);
  }, [playlist, onPlaylistUpdate]);

  if (type === PersonalShelf.Favorites) playlist = favoritesPlaylist;
  if (type === PersonalShelf.ContinueWatching) playlist = watchHistoryPlaylist;

  if (!playlistId && !type) return <p>No playlist id and type</p>;
  if (!playlist.playlist.length && !showEmpty) {
    return null;
  }

  return children({ playlist, isLoading, error, style });
};

export default PlaylistContainer;
