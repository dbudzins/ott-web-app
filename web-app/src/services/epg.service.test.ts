import { afterEach, beforeEach, describe, expect } from 'vitest';
import { register, unregister } from 'timezone-mock';
import type { Playlist } from 'ott-common/types/playlist';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import epgService, { EpgProgram } from '#src/services/epg.service';
import scheduleFixture from '#src/fixtures/schedule.json';
import livePlaylistFixture from '#src/fixtures/livePlaylist.json';

const livePlaylist = livePlaylistFixture as Playlist;
const scheduleData = scheduleFixture as EpgProgram[];
let mockAdapter: MockAdapter;

describe('epgService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockAdapter = new MockAdapter(axios);
  });

  afterEach(() => {
    // must be called before `vi.useRealTimers()`
    unregister();
    vi.restoreAllMocks();
    vi.useRealTimers();
    mockAdapter.restore();
  });

  test('fetchSchedule performs a request', async () => {
    mockAdapter.onGet('/epg/channel1.json').reply(200, []);

    const data = await epgService.fetchSchedule(livePlaylist.playlist[0]);

    const requestHeaders = mockAdapter.history['get'][0].headers;

    expect(data).toEqual([]);
    expect(mockAdapter.history['get'].length).toEqual(1);
    expect(requestHeaders).toEqual({ Accept: 'application/json, text/plain, */*' }); // only default header expected
  });

  test('fetchSchedule adds authentication token', async () => {
    mockAdapter.onGet('/epg/channel1.json').reply(200, []);
    const item = Object.assign({}, livePlaylist.playlist[0]);

    item.scheduleToken = 'AUTH-TOKEN';
    const data = await epgService.fetchSchedule(item);

    const requestHeaders = mockAdapter.history['get'][0].headers;

    expect(data).toEqual([]);
    expect(mockAdapter.history['get'].length).toEqual(1);
    expect(requestHeaders).toEqual({ Accept: 'application/json, text/plain, */*', 'API-KEY': 'AUTH-TOKEN' });
  });

  test('getSchedule fetches and validates a valid schedule', async () => {
    mockAdapter.onGet('/epg/channel1.json').reply(200, scheduleData);
    const schedule = await epgService.getSchedule(livePlaylist.playlist[0]);

    expect(mockAdapter.history['get'].length).toEqual(1);
    expect(schedule.title).toEqual('Channel 1');
    expect(schedule.programs.length).toEqual(14);
    expect(schedule.catchupHours).toEqual(7);
  });

  test('getSchedule enables the demo transformer when scheduleDemo is set', async () => {
    mockAdapter.onGet('/epg/channel1.json').reply(200, scheduleData);

    // mock the date
    vi.setSystemTime('2036-06-03T14:30:10.500Z');

    const item = Object.assign({}, livePlaylist.playlist[0]);
    item.scheduleDemo = '1';

    const schedule = await epgService.getSchedule(item);

    expect(mockAdapter.history['get'].length).toEqual(1);
    expect(schedule.title).toEqual('Channel 1');
    // first program
    expect(schedule.programs[0].startTime).toEqual('2036-06-03T23:50:00.000Z');
    expect(schedule.programs[0].endTime).toEqual('2036-06-04T00:55:00.000Z');

    // last program
    expect(schedule.programs[13].startTime).toEqual('2036-06-04T07:00:00.000Z');
    expect(schedule.programs[13].endTime).toEqual('2036-06-04T07:40:00.000Z');
  });

  test('getSchedules fetches and validates multiple schedules', async () => {
    const channel1 = '/epg/channel1.json';
    const channel2 = '/epg/channel2.json';
    const channel3 = '/epg/does-not-exist.json';
    const channel4 = '/epg/network-error.json';

    mockAdapter.onGet(channel1).reply(200, scheduleData);
    mockAdapter.onGet(channel2).reply(200, []);
    mockAdapter.onGet(channel3).reply(404);
    mockAdapter.onGet(channel4).networkError();

    // getSchedules for multiple playlist items
    const schedules = await epgService.getSchedules(livePlaylist.playlist);

    // make sure we are testing a playlist with four media items
    expect(livePlaylistFixture.playlist.length).toBe(4);

    // all channels have fetched
    expect(mockAdapter.history['get'].length).toEqual(4);
    expect(mockAdapter.history['get'].filter((req) => req.url === channel1).length).toEqual(1);
    expect(mockAdapter.history['get'].filter((req) => req.url === channel2).length).toEqual(1);
    expect(mockAdapter.history['get'].filter((req) => req.url === channel3).length).toEqual(1);
    expect(mockAdapter.history['get'].filter((req) => req.url === channel4).length).toEqual(1);

    // valid schedule with 10 programs
    expect(schedules[0].title).toEqual('Channel 1');
    expect(schedules[0].programs.length).toEqual(14);

    // empty schedule
    expect(schedules[1].title).toEqual('Channel 2');
    expect(schedules[1].programs.length).toEqual(0);

    // empty schedule (failed fetching)
    expect(schedules[2].title).toEqual('Channel 3');
    expect(schedules[2].programs.length).toEqual(0);

    // empty schedule (network error)
    expect(schedules[3].title).toEqual('Channel 4');
    expect(schedules[3].programs.length).toEqual(0);
  });

  test('parseSchedule should remove programs where required fields are missing', async () => {
    // missing title
    const schedule1 = await epgService.parseSchedule([
      {
        id: '1234-1234-1234-1234-1234',
        startTime: '2022-07-19T09:00:00Z',
        endTime: '2022-07-19T12:00:00Z',
      },
    ]);
    // missing startTime
    const schedule2 = await epgService.parseSchedule([
      {
        id: '1234-1234-1234-1234-1234',
        title: 'The title',
        endTime: '2022-07-19T12:00:00Z',
      },
    ]);
    // missing endTime
    const schedule3 = await epgService.parseSchedule([
      {
        id: '1234-1234-1234-1234-1234',
        title: 'The title',
        startTime: '2022-07-19T09:00:00Z',
      },
    ]);
    // missing id
    const schedule4 = await epgService.parseSchedule([
      {
        title: 'The title',
        startTime: '2022-07-19T09:00:00Z',
        endTime: '2022-07-19T12:00:00Z',
      },
    ]);

    expect(schedule1.length).toEqual(0);
    expect(schedule2.length).toEqual(0);
    expect(schedule3.length).toEqual(0);
    expect(schedule4.length).toEqual(0);
  });

  test('parseSchedule should remove programs where the startTime or endTime are not valid ISO8601', async () => {
    // invalid startTime
    const schedule1 = await epgService.parseSchedule([
      {
        id: '1234-1234-1234-1234-1234',
        title: 'Test item',
        startTime: 'this is not ISO8601',
        endTime: '2022-07-19T12:00:00Z',
      },
    ]);
    // invalid endTime
    const schedule2 = await epgService.parseSchedule([
      {
        id: '1234-1234-1234-1234-1234',
        title: 'The title',
        startTime: '2022-07-19T09:00:00Z',
        endTime: 'this is not ISO8601',
      },
    ]);

    expect(schedule1.length).toEqual(0);
    expect(schedule2.length).toEqual(0);
  });

  test('parseSchedule should update the start and end time when demo is enabled', async () => {
    // some date in the far future
    vi.setSystemTime(new Date(2036, 5, 3, 14, 30, 10, 500));

    const schedule = await epgService.parseSchedule(
      [
        {
          id: '1234-1234-1234-1234-1234',
          title: 'Test item 1',
          startTime: '2022-07-19T12:00:00Z',
          endTime: '2022-07-19T17:00:00Z',
        },
        {
          id: '1234-1234-1234-1234-1234',
          title: 'Test item 2',
          startTime: '2022-07-19T17:00:00Z',
          endTime: '2022-07-19T23:00:00Z',
        },
        {
          id: '1234-1234-1234-1234-1234',
          title: 'Test item 3',
          startTime: '2022-07-19T23:00:00Z',
          endTime: '2022-07-20T05:30:00Z',
        },
        {
          id: '1234-1234-1234-1234-1234',
          title: 'Test item 4',
          startTime: '2022-07-20T05:30:00Z',
          endTime: '2022-07-20T12:00:00Z',
        },
      ],
      true,
    );

    expect(schedule.length).toEqual(4);

    expect(schedule[0].startTime).toEqual('2036-06-03T12:00:00.000Z');
    expect(schedule[0].endTime).toEqual('2036-06-03T17:00:00.000Z');

    expect(schedule[1].startTime).toEqual('2036-06-03T17:00:00.000Z');
    expect(schedule[1].endTime).toEqual('2036-06-03T23:00:00.000Z');

    expect(schedule[2].startTime).toEqual('2036-06-03T23:00:00.000Z');
    expect(schedule[2].endTime).toEqual('2036-06-04T05:30:00.000Z');

    expect(schedule[3].startTime).toEqual('2036-06-04T05:30:00.000Z');
    expect(schedule[3].endTime).toEqual('2036-06-04T12:00:00.000Z');
  });

  test('parseSchedule should use the correct demo dates in different timezones', async () => {
    // some date in the far future
    vi.setSystemTime('2036-06-03T01:30:10.5Z');

    register('Australia/Adelaide');

    const schedule = await epgService.parseSchedule(
      [
        {
          id: '1234-1234-1234-1234-1234',
          title: 'Test item 1',
          startTime: '2022-07-19T22:00:00Z',
          endTime: '2022-07-19T23:30:00Z',
        },
      ],
      true,
    );

    expect(schedule.length).toEqual(1);
    expect(schedule[0].startTime).toEqual('2036-06-03T22:00:00.000Z');
    expect(schedule[0].endTime).toEqual('2036-06-03T23:30:00.000Z');

    register('US/Pacific');

    const schedule2 = await epgService.parseSchedule(
      [
        {
          id: '1234-1234-1234-1234-1234',
          title: 'Test item 1',
          startTime: '2022-07-19T22:00:00Z',
          endTime: '2022-07-19T23:30:00Z',
        },
      ],
      true,
    );

    expect(schedule2.length).toEqual(1);
    expect(schedule2[0].startTime).toEqual('2036-06-03T22:00:00.000Z');
    expect(schedule2[0].endTime).toEqual('2036-06-03T23:30:00.000Z');
  });

  test('transformProgram should transform valid program entries', async () => {
    const program1 = await epgService.transformProgram({
      id: '1234-1234-1234-1234',
      title: 'Test item',
      startTime: '2022-07-19T12:00:00Z',
      endTime: '2022-07-19T15:00:00Z',
    });
    const program2 = await epgService.transformProgram({
      id: '1234-1234-1234-1234',
      title: 'Test item 2',
      startTime: '2022-07-19T12:00:00Z',
      endTime: '2022-07-19T15:00:00Z',
      chapterPointCustomProperties: [],
    });
    const program3 = await epgService.transformProgram({
      id: '1234-1234-1234-1234',
      title: 'Test item 3',
      startTime: '2022-07-19T12:00:00Z',
      endTime: '2022-07-19T15:00:00Z',
      chapterPointCustomProperties: [
        {
          key: 'description',
          value: 'A description',
        },
        {
          key: 'image',
          value: 'https://cdn.jwplayer/logo.jpg',
        },
        {
          key: 'other-key',
          value: 'this property should be ignored',
        },
      ],
    });

    expect(program1).toEqual({
      id: '1234-1234-1234-1234',
      title: 'Test item',
      startTime: '2022-07-19T12:00:00Z',
      endTime: '2022-07-19T15:00:00Z',
      description: undefined,
      image: undefined,
    });

    expect(program2).toEqual({
      id: '1234-1234-1234-1234',
      title: 'Test item 2',
      startTime: '2022-07-19T12:00:00Z',
      endTime: '2022-07-19T15:00:00Z',
      description: undefined,
      image: undefined,
    });

    expect(program3).toEqual({
      id: '1234-1234-1234-1234',
      title: 'Test item 3',
      startTime: '2022-07-19T12:00:00Z',
      endTime: '2022-07-19T15:00:00Z',
      description: 'A description',
      image: 'https://cdn.jwplayer/logo.jpg',
    });
  });
});
