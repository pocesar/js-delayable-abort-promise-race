import Racer, { AbortError } from '../src'

const resolveDelayed = (postpone: () => void) => <T>(millis: number, resolveValue: T) => new Promise<T>((resolve) => {
  const interval = setInterval(postpone, 50) // postpone the abort every 50ms

  setTimeout(() => {
    resolve(resolveValue)
    clearInterval(interval)
  }, millis)
});

(async () => {
  const delayable = Racer(100, 10)

  const resolve = resolveDelayed(delayable.postpone)

  const returns10 = await delayable.run<number | void>([
    Promise.resolve(10),
    Promise.resolve(),
  ])

  console.log(10 === returns10)

  setTimeout(delayable.abort, 50)

  try {
    // manually aborts after 50ms with the setTimeout above
    await delayable.run([
      new Promise(() => {}) // never resolves
    ]);
  } catch (e) {
    console.error(e)
    console.log('last activity time', (e as AbortError).asDate())
  }

  const values = await delayable.run([
    Promise.all([
      resolve(111, 1), // every item
      resolve(122, 2), // is higher than
      resolve(133, 3), // the maxIdleMs that is 100
    ])
  ])

  console.log('values', values, '=', [1,2,3])
})()