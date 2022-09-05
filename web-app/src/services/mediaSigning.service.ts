import axios from 'axios';
import { getDataOrThrow } from 'ott-common/src/utils/api';
import { getMediaById as getMediaUnsigned, getPlaylistById as getPlaylistUnsigned } from 'ott-common/src/services/mediaDelivery.service';
import type { GetPlaylistParams, Playlist, PlaylistItem } from 'ott-common/types/playlist';

type SigningParams = {
  host?: string;
  jwt?: string;
};

/**
 * Get playlist by id
 * @param {string} id
 * @param params
 * @param signingParams
 */
export const getPlaylistById = async (id?: string, params: GetPlaylistParams = {}, signingParams?: SigningParams): Promise<Playlist | undefined> => {
  // If signing service is not configured, call the delivery API directly
  if (!signingParams?.host) {
    return getPlaylistUnsigned(id, params);
  }

  return callSigningService<Playlist>(signingParams.jwt, `${signingParams.host}/playlist/${id}`);
};

/**
 * Get media by id
 * @param {string} id
 * @param {SigningParams} signingParams The host to use for the signing service and the jwt to authenticate with
 */
export const getMediaById = async (id: string, signingParams?: SigningParams): Promise<PlaylistItem | undefined> => {
  // If signing service is not configured, call the delivery API directly
  if (!signingParams?.host) {
    return getMediaUnsigned(id);
  }

  return callSigningService<PlaylistItem>(signingParams.jwt, `${signingParams.host}/media/${id}`);
};

/**
 * Gets multiple media items by the given ids. Filters out items that don't exist.
 * @param {string[]} ids
 * @param {SigningParams} signingParams
 */
export const getMediaByIds = async (ids: string[], signingParams?: SigningParams): Promise<PlaylistItem[]> => {
  // @todo this should be updated when it will become possible to request multiple media items in a single request
  const responses = await Promise.allSettled(ids.map((id) => getMediaById(id, signingParams)));

  function notEmpty<Value>(value: Value | null | undefined): value is Value {
    return value !== null && value !== undefined;
  }

  return responses.map((result) => (result.status === 'fulfilled' ? result.value : null)).filter(notEmpty);
};

const callSigningService = async <T>(jwt: string | undefined, url: string) => {
  const response = await axios(url, {
    method: 'GET',
    headers: {
      Authorization: jwt ? `Bearer ${jwt}` : '',
    },
  });

  return (await getDataOrThrow(response)) as T;
};
