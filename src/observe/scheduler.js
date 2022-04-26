let queue = []
const has = new Set()
import { nextTick } from '../utils/next-tick'
function flushQueue() {
    queue.forEach((watcher) => watcher.run())
    queue = []
    has.clear()
}

export function queueWatcher(watcher) {
    const id = watcher.id
    if (!has.has(id)) {
        has.add(id)
        queue.push(watcher)
        nextTick(flushQueue)
    }
}
