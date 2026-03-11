/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://aicalculator.cloud',
  generateRobotsTxt: true,
  exclude: ['/api/*'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
  },
};