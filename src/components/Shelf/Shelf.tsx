import React, { useCallback, useState } from 'react';
import type { Playlist, PlaylistItem } from 'types/playlist';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Card from '../Card/Card';
import TileDock from '../TileDock/TileDock';
import useBreakpoint, { Breakpoint, Breakpoints } from '../../hooks/useBreakpoint';
import ChevronLeft from '../../icons/ChevronLeft';
import ChevronRight from '../../icons/ChevronRight';
import { findPlaylistImageForWidth } from '../../utils/collection';
import type { AccessModel } from '../../../types/Config';
import { isAllowedToWatch } from '../../utils/cleeng';

import styles from './Shelf.module.scss';

export const tileBreakpoints: Breakpoints = {
  [Breakpoint.xs]: 1,
  [Breakpoint.sm]: 2,
  [Breakpoint.md]: 3,
  [Breakpoint.lg]: 4,
  [Breakpoint.xl]: 5,
};

export const featuredTileBreakpoints: Breakpoints = {
  [Breakpoint.xs]: 1,
  [Breakpoint.sm]: 1,
  [Breakpoint.md]: 1,
  [Breakpoint.lg]: 1,
  [Breakpoint.xl]: 1,
};

export type ShelfProps = {
  playlist: Playlist;
  onCardClick: (playlistItem: PlaylistItem, playlistId?: string) => void;
  onCardHover?: (playlistItem: PlaylistItem) => void;
  watchHistory?: { [key: string]: number };
  enableTitle?: boolean;
  enableCardTitles?: boolean;
  featured?: boolean;
  loading?: boolean;
  error?: unknown;
  title?: string;
  accessModel: AccessModel;
  isLoggedIn: boolean;
  hasSubscription: boolean;
};

const Shelf: React.FC<ShelfProps> = ({
  playlist,
  onCardClick,
  onCardHover,
  title,
  watchHistory,
  enableTitle = true,
  enableCardTitles = true,
  featured = false,
  loading = false,
  error = null,
  accessModel,
  isLoggedIn,
  hasSubscription,
}: ShelfProps) => {
  const breakpoint: Breakpoint = useBreakpoint();
  const { t } = useTranslation('common');
  const [didSlideBefore, setDidSlideBefore] = useState(false);
  const tilesToShow: number = featured ? featuredTileBreakpoints[breakpoint] : tileBreakpoints[breakpoint];
  const isLargeScreen = breakpoint >= Breakpoint.md;
  const imageSourceWidth = (featured ? 640 : 320) * (window.devicePixelRatio > 1 || isLargeScreen ? 2 : 1);

  const renderTile = useCallback(
    (item, isInView) => (
      <Card
        title={item.title}
        enableTitle={enableCardTitles}
        duration={item.duration}
        progress={watchHistory ? watchHistory[item.mediaid] : undefined}
        posterSource={findPlaylistImageForWidth(item, imageSourceWidth)}
        seriesId={item.seriesId}
        seasonNumber={item.seasonNumber}
        episodeNumber={item.episodeNumber}
        onClick={isInView ? () => onCardClick(item, playlist.feedid) : undefined}
        onHover={typeof onCardHover === 'function' ? () => onCardHover(item) : undefined}
        featured={featured}
        disabled={!isInView}
        loading={loading}
        isLocked={!isAllowedToWatch(accessModel, isLoggedIn, item.requiresSubscription !== 'false', hasSubscription)}
      />
    ),
    [
      enableCardTitles,
      featured,
      imageSourceWidth,
      loading,
      onCardClick,
      onCardHover,
      playlist.feedid,
      watchHistory,
      accessModel,
      isLoggedIn,
      hasSubscription,
    ],
  );

  const renderRightControl = useCallback(
    (doSlide) => (
      <div
        className={styles.chevron}
        role="button"
        tabIndex={0}
        aria-label={t('slide_right')}
        onKeyDown={(event: React.KeyboardEvent) => (event.key === 'Enter' || event.key === ' ') && handleSlide(doSlide)}
        onClick={() => handleSlide(doSlide)}
      >
        <ChevronRight />
      </div>
    ),
    [t],
  );

  const renderLeftControl = useCallback(
    (doSlide) => (
      <div
        className={classNames(styles.chevron, {
          [styles.disabled]: !didSlideBefore,
        })}
        role="button"
        tabIndex={didSlideBefore ? 0 : -1}
        aria-label={t('slide_left')}
        onKeyDown={(event: React.KeyboardEvent) => (event.key === 'Enter' || event.key === ' ') && handleSlide(doSlide)}
        onClick={() => handleSlide(doSlide)}
      >
        <ChevronLeft />
      </div>
    ),
    [didSlideBefore, t],
  );

  const renderPaginationDots = (index: number, pageIndex: number) => (
    <span key={pageIndex} className={classNames(styles.dot, { [styles.active]: index === pageIndex })} />
  );

  const handleSlide = (doSlide: () => void): void => {
    setDidSlideBefore(true);
    doSlide();
  };

  if (error || !playlist?.playlist) return <h2 className={styles.error}>Could not load items</h2>;

  return (
    <div className={classNames(styles.shelf, { [styles.featured]: featured })} data-mediaid={playlist.feedid}>
      {!featured && enableTitle ? <h2 className={classNames(styles.title, { [styles.loading]: loading })}>{title || playlist.title}</h2> : null}
      <TileDock<PlaylistItem>
        items={playlist.playlist}
        tilesToShow={tilesToShow}
        wrapWithEmptyTiles={featured && playlist.playlist.length === 1}
        cycleMode={'restart'}
        showControls={!matchMedia('(hover: none)').matches && !loading}
        showDots={featured}
        transitionTime={'0.3s'}
        spacing={8}
        renderLeftControl={renderLeftControl}
        renderRightControl={renderRightControl}
        renderPaginationDots={renderPaginationDots}
        renderTile={renderTile}
      />
    </div>
  );
};

export default Shelf;
