[![NPM](https://img.shields.io/npm/l/async-atomic-store)](https://www.npmjs.com/package/delayable-idle-abort-promise)
[![npm](https://img.shields.io/npm/v/delayable-idle-abort-promise)](https://www.npmjs.com/package/delayable-idle-abort-promise)
[![npm](https://img.shields.io/npm/types/delayable-idle-abort-promise)](https://www.npmjs.com/package/delayable-idle-abort-promise)

# delayable-idle-abort-promise

Race an array of promises against a promise that rejects if nothing happens in the specified time window, but that can be postponed by signaling activity

## Example

```js
import DelayAbort, { AbortError } from 'delayable-idle-abort-promise'

const onePromise = (abort) => new Promise(() => {
  setTimeout(abort, Math.round(Math.random() * 1000))
})

const control = DelayAbort(1000)

setInterval(() => {
  // postpone() will delay the "natural" internal interval,
  // but not calls to abort()
  control.postpone()
}, 100)

try {
  const result = await control.race([
    onePromise(control.abort),
    anotherPromise
  ])

  // do something with result
} catch (e) {
  if (e instanceof AbortError) {
    console.log(e.lastActivity, e.asDate())
  }
}
```

## License

MIT