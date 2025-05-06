const isPeopleSubdomain = process.env.SUBDOMAIN === 'people';

module.exports = {
  assetPrefix: isPeopleSubdomain ? 'https://people.alfieai.fyi' : '',
};