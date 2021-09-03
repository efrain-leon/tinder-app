const development = 'tinder_development';
const testing = 'tinder_testing';

export default {
  development: {uri: `mongodb://localhost/${development}`, name: development},
  testing: {uri: `mongodb://localhost/${testing}?authSource=admin`, name: testing},
};