import { useQuery } from 'react-query';
import type { SeriesData } from 'ott-common/types/series';
import type { ApiError } from 'ott-common/src/utils/api';
import { getSeries } from 'ott-common/src/services/mediaDelivery.service';

// 8 hours
export const SeriesStaleTime = 8 * 60 * 60 * 1000;

export default (seriesId: string) => {
  return useQuery<SeriesData | undefined, ApiError>(`series-${seriesId}`, async () => await getSeries(seriesId), {
    staleTime: SeriesStaleTime,
    retry: 2,
    retryDelay: 200,
  });
};
