import { register } from "node:module"

register("./alias-loader.mjs", import.meta.url)

class MemoryStorage {
  #data = new Map()
  getItem(key) {
    return this.#data.has(key) ? this.#data.get(key) : null
  }
  setItem(key, value) {
    this.#data.set(key, String(value))
  }
  removeItem(key) {
    this.#data.delete(key)
  }
  clear() {
    this.#data.clear()
  }
}

globalThis.window = globalThis
globalThis.sessionStorage = new MemoryStorage()
