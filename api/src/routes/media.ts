import express from 'express';

import authenticatedRequest from '#src/utils/authenticatedRequest';
import signUrl from '#src/services/signingService';

const router = express.Router();

const mediaId = 'mediaId';

router.get(
  `/:${mediaId}/signed`,
  authenticatedRequest(async (req, res) => {
    const signed = signUrl(`/v2/media/${req.params[mediaId]}`);

    res.redirect(signed);
  }),
);

export default router;
