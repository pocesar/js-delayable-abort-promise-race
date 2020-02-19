import { BaseError } from 'make-error'

export class AbortError extends BaseError {
  constructor(public lastActivity: number) {
    super('Aborted')
  }

  asDate() {
    return new Date(this.lastActivity)
  }
}

const DelayAbort = (maxIdleMs: number, pollingMs = 100) => {
  let lastActivity: number
  let rejectRace: ((err: AbortError) => void) | undefined
  let resolveRace: (() => void) | undefined

  return {
    postpone() {
      lastActivity = Date.now()
    },
    async run<T>(promises: Promise<T>[]): Promise<T> {
      let interval: number | undefined
      lastActivity = Date.now()

      const abort = new Promise((resolve, reject) => {
        rejectRace = reject
        resolveRace = resolve

        interval = setInterval(() => {
          if (Date.now() - lastActivity >= maxIdleMs) {
            reject(new AbortError(lastActivity))
          }
        }, pollingMs)
      })

      try {
        return await Promise.race<T | any>([
          ...promises,
          abort
        ])
      } finally {
        // cleanup
        if (resolveRace) {
          resolveRace()
        }

        resolveRace = undefined
        rejectRace = undefined

        if (interval) {
          clearInterval(interval)
        }
      }
    },
    abort() {
      if (rejectRace) {
        rejectRace(new AbortError(lastActivity || 0))
      } else {
        throw new Error(`You must call run(...) before trying to abort`)
      }
    }
  }
}

export default DelayAbort