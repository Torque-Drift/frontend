module.exports = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIDs: false
        }
      }
    },
    'removeDimensions',
    'cleanupIds',
    {
      name: 'removeAttrs',
      params: {
        attrs: ['xmlns:xlink', 'xlink:href']
      }
    }
  ]
};