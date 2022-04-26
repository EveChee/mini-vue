let cbs = []
let waiting = false
function flushCallback() {
    cbs.forEach((fn) => fn())
    cbs = []
}
export function nextTick(fn) {
    cbs.push(fn)
    if (waiting) return
    setTimeout(flushCallback, 0)
    waiting = true
}
