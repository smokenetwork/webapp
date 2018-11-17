import {Aes, key_utils, PrivateKey, PublicKey} from '@smokenetwork/smoke-js/lib/auth/ecc';

module.exports = {

  PrivateKey, PublicKey, Aes, key_utils,

  // Run once to start, then again to stop and print a report
  // https://facebook.github.io/react/docs/perf.html
  perf: () => {
    const Perf = require('react-addons-perf')
    if (perfStarted) {
      Perf.stop()
      const lm = Perf.getLastMeasurements()
      Perf.printInclusive(lm)
      Perf.printExclusive(lm)
      Perf.printWasted(lm)
      perfStarted = false
    } else {
      Perf.start()
      perfStarted = true
    }
    return Perf
  },

  resolve: (object, atty = '_') => {
    if (!object.then) {
      console.log(object)
      return object
    }
    return new Promise((resolve, reject) => {
      object.then(result => {
        console.log(result)
        resolve(result)
        window[atty] = result
      }).catch(error => {
        console.error(error)
        reject(error)
        window[atty] = error
      })
    })
  },

  init: context => {
    if (!context) return
    for (const obj in module.exports) {
      if (obj === 'init') continue
      context[obj] = module.exports[obj]
    }
  },
}

let perfStarted = false
