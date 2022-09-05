import axios from 'axios';
import jwt from 'jsonwebtoken';

import { addQueryParams } from '../utils/formatting';
import { getDataOrThrow } from '../utils/api';
import { filterMediaOffers } from '../utils/entitlements';
import type { GetPlaylistParams, Playlist, PlaylistItem } from '../../types/playlist';
import type { GetSeriesParams, SeriesData } from '../../types/series';

const Time = new Date();

type SigningParams = {apiSecret?: string, drmPolicyId?: string};

/**
 * Generatea a URL with signature.
 * @param {string} path
 * @param apiSecret
 * @returns {string} signed URL
 */
const getToken = (path: string, apiSecret: string) => {
  if (!apiSecret) {
    throw 'API Secret is missing';
  }

  return jwt.sign(
    {
      exp: Math.ceil((Time.getTime() + 3600) / 300) * 300, // Round to even 5 minutes for caching
      resource: path,
    },
    apiSecret,
  );
};

/**
 * Transform incoming media items
 * - Parses productId into MediaOffer[] for all cleeng offers
 *
 * @param item
 */
export const transformMediaItem = (item: PlaylistItem) => ({
  ...item,
  mediaOffers: item.productIds ? filterMediaOffers('cleeng', item.productIds) : undefined,
});

/**
 * Transform incoming playlists
 *
 * @param playlist
 * @param relatedMediaId
 */
export const transformPlaylist = (playlist: Playlist, relatedMediaId?: string) => {
  playlist.playlist = playlist.playlist.map(transformMediaItem);

  // remove the related media item (when this is a recommendations playlist)
  if (relatedMediaId) playlist.playlist.filter((item) => item.mediaid !== relatedMediaId);

  return playlist;
};

/**
 * Get playlist by id
 * @param {string} id
 * @param params
 * @param apiSecret
 * @param {string} [drmPolicyId]
 */
export const getPlaylistById = async (id?: string, params: GetPlaylistParams = {}, {apiSecret, drmPolicyId}: SigningParams = {}) => {
  if (!id) {
    return undefined;
  }

  const path = drmPolicyId ? `/v2/playlists/${id}/drm/${drmPolicyId}` : `/v2/playlists/${id}`;
  const token = apiSecret ? getToken(path, apiSecret) : null;

  const url = addQueryParams(`${import.meta.env.APP_API_BASE_URL}${path}`, { ...params, token });
  const response = await axios(url);
  const data = await getDataOrThrow(response);

  return transformPlaylist(data, params.related_media_id);
};

/**
 * Get watchlist by playlistId
 * @param {string} playlistId
 * @param mediaIds
 * @param {string} [token]
 */
export const getMediaByWatchlist = async (playlistId: string, mediaIds: string[], token?: string): Promise<PlaylistItem[] | undefined> => {
  if (!mediaIds?.length) {
    return [];
  }

  const pathname = `/apps/watchlists/${playlistId}`;
  const url = addQueryParams(`${import.meta.env.APP_API_BASE_URL}${pathname}`, { token, media_ids: mediaIds });
  const response = await axios(url);
  const data = (await getDataOrThrow(response)) as Playlist;

  if (!data) throw new Error(`The data was not found using the watchlist ${playlistId}`);

  return (data.playlist || []).map(transformMediaItem);
};

export const getMediaById = async (id: string, {apiSecret, drmPolicyId}: SigningParams = {}) => {
  if (!id) {
    return undefined;
  }

  const path = drmPolicyId ? `/v2/media/${id}/drm/${drmPolicyId}` : `/v2/media/${id}`;
  const token = apiSecret ? getToken(path, apiSecret) : null;

  const url = addQueryParams(`${import.meta.env.APP_API_BASE_URL}${path}`, { token });
  const response = await axios(url);
  const data = (await getDataOrThrow(response)) as Playlist;
  const mediaItem = data.playlist[0];

  if (!mediaItem) throw new Error('MediaItem not found');

  return transformMediaItem(mediaItem);
};

/**
 * Get series by id
 * @param {string} id
 * @param params
 */
export const getSeries = async (id: string, params: GetSeriesParams = {}): Promise<SeriesData | undefined> => {
  if (!id) {
    throw new Error('Series ID is required');
  }

  const pathname = `/apps/series/${id}`;
  const url = addQueryParams(`${import.meta.env.APP_API_BASE_URL}${pathname}`, params);
  const response = await axios(url);
  return await getDataOrThrow(response);
};
