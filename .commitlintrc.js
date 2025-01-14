module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'project',
        'home',
        'playlist',
        'videodetail',
        'player',
        'series',
        'search',
        'user',
        'watchhistory',
        'favorites',
        'analytics',
        'pwa',
        'seo',
        'auth',
        'menu',
        'payment',
        'e2e',
        'signing',
        'entitlement',
        'config',
        'epg',
      ],
    ],
  },
};
