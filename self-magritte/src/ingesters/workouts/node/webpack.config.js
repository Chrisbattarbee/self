const path = require('path');

module.exports = {
     target: "node", // Or "async-node"
     mode: "production", /* or "development", or "none" */
     output: {
          filename: 'jefit_extractor.js',
          path: path.resolve('../../../../build/')
     }
}
