import express from 'express';
import { getSubscriptions } from 'ott-common/src/services/subscription.service';
import { isLocked } from 'ott-common/src/utils/entitlements';
import type { Subscription } from 'ott-common/types/subscription';
import { getMediaById, getPlaylistById } from 'ott-common/src/services/mediaDelivery.service';

import {  notAuthorizedError, notFoundError } from '#src/utils/applicationError';

const DRM_POLICY_ID = import.meta.env.APP_DRM_POLICY_ID;
const ACCESS_MODEL = import.meta.env.APP_DRM_POLICY_ID;

// This is a runtime secret, not a vite secret,
// because it will be passed to the container in the cloud, not replaced at compile time
const { JW_API_SECRET } = process.env;

const router = express.Router();

// This is a runtime secret, not a vite secret,
// because it will be passed to the container in the cloud, not replaced at compile time

const mediaIdKey = 'mediaId';
const playlistIdKey = 'playlistId';

router.get(`/media/:${mediaIdKey}`,async (req, res, next) => {
  try {
    const mediaItem = await getMediaById(req.params[mediaIdKey], {apiSecret: JW_API_SECRET, drmPolicyId: DRM_POLICY_ID});

    if (!mediaItem) {
      return next(notFoundError('Media item not found'));
    }

    const subscriptionResponse = req.userIdentity ? (await getSubscriptions({ customerId: req.userIdentity?.userId }, true, req.userIdentity?.jwt)) : undefined;
    const subscriptionIds = subscriptionResponse?.items?.filter((item: Subscription) => item.status === "active").map((item: Subscription) => item.subscriptionId) || [];

    const isMediaLocked = isLocked(ACCESS_MODEL, !!req.userIdentity, !!subscriptionIds.length, mediaItem);

    if (isMediaLocked) {
      return next(notAuthorizedError('You do not have access to this item'));
    }

    res.send(mediaItem);

  } catch (error: unknown) {
    next(error);
  }
});

router.get(`/playlist/:${playlistIdKey}`,async (req, res, next) => {
  try {
    const playlist = await getPlaylistById(req.params[playlistIdKey], {},{apiSecret: JW_API_SECRET, drmPolicyId: DRM_POLICY_ID});

    if (!playlist) {
      return next(notFoundError('Playlist not found'));
    }

    const subscriptionResponse = req.userIdentity ? (await getSubscriptions({ customerId: req.userIdentity?.userId }, true, req.userIdentity?.jwt)) : undefined;
    const subscriptionIds = subscriptionResponse?.items?.filter((item: Subscription) => item.status === "active").map((item: Subscription) => item.subscriptionId) || [];

    const anyLocked = playlist.playlist.some(item => isLocked(ACCESS_MODEL, !!req.userIdentity, !!subscriptionIds.length, item));

    if (anyLocked) {
      return next(notAuthorizedError('You do not have access to one or more items in this playlist'));
    }

    res.send(playlist);

  } catch (error: unknown) {
    next(error);
  }
});

export default router;
