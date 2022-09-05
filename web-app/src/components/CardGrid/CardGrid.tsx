import React from 'react';
import type { GridCellProps } from 'react-virtualized';
import { isLocked } from 'ott-common/src/utils/entitlements';
import type { PlaylistItem } from 'ott-common/types/playlist';
import type { AccessModel } from 'ott-common/types/accessModel';

import styles from './CardGrid.module.scss';

import useBreakpoint, { Breakpoint, Breakpoints } from '#src/hooks/useBreakpoint';
import { chunk, findPlaylistImageForWidth } from '#src/utils/collection';
import Card from '#src/components/Card/Card';
import VirtualizedGrid from '#src/components/VirtualizedGrid/VirtualizedGrid';
import CardTag from '#src/components/Tag/CardTag';

const defaultCols: Breakpoints = {
  [Breakpoint.xs]: 2,
  [Breakpoint.sm]: 2,
  [Breakpoint.md]: 3,
  [Breakpoint.lg]: 4,
  [Breakpoint.xl]: 5,
};

type CardGridProps = {
  playlist: PlaylistItem[];
  onCardHover?: (item: PlaylistItem) => void;
  onCardClick: (item: PlaylistItem, playlistId?: string) => void;
  watchHistory?: { [key: string]: number };
  isLoading: boolean;
  enableCardTitles?: boolean;
  cols?: Breakpoints;
  currentCardItem?: PlaylistItem;
  currentCardLabel?: string;
  accessModel: AccessModel;
  isLoggedIn: boolean;
  hasSubscription: boolean;
};

function CardGrid({
  playlist,
  onCardClick,
  onCardHover,
  watchHistory,
  enableCardTitles = true,
  isLoading = false,
  cols = defaultCols,
  currentCardItem,
  currentCardLabel,
  accessModel,
  isLoggedIn,
  hasSubscription,
}: CardGridProps) {
  const breakpoint: Breakpoint = useBreakpoint();
  const isLargeScreen = breakpoint >= Breakpoint.md;
  const imageSourceWidth = 320 * (window.devicePixelRatio > 1 || isLargeScreen ? 2 : 1);
  const rows = chunk<PlaylistItem>(playlist, cols[breakpoint]);

  const cellRenderer = ({ columnIndex, rowIndex, style }: GridCellProps) => {
    if (!rows[rowIndex][columnIndex]) return;

    const playlistItem: PlaylistItem = rows[rowIndex][columnIndex];
    const { mediaid, title } = playlistItem;

    return (
      <div className={styles.cell} style={style} key={mediaid} role="row">
        <div role="cell">
          <Card
            key={mediaid}
            title={title}
            enableTitle={enableCardTitles}
            tag={<CardTag item={playlistItem} />}
            posterSource={findPlaylistImageForWidth(playlistItem, imageSourceWidth)}
            progress={watchHistory ? watchHistory[mediaid] : undefined}
            onClick={() => onCardClick(playlistItem, playlistItem.feedid)}
            onHover={typeof onCardHover === 'function' ? () => onCardHover(playlistItem) : undefined}
            loading={isLoading}
            isCurrent={currentCardItem && currentCardItem.mediaid === mediaid}
            currentLabel={currentCardLabel}
            isLocked={isLocked(accessModel, isLoggedIn, hasSubscription, playlistItem)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <VirtualizedGrid rowCount={rows.length} cols={cols} cellRenderer={cellRenderer} spacing={enableCardTitles ? 50 : 4} />
    </div>
  );
}

export default CardGrid;
