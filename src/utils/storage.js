export const get = (key) => localStorage.getItem(key)
export const set = (key,data) => localStorage.setItem(key, data)
export const remove = (key) => localStorage.removeItem(key)

export const setJSON = (data) => set(key, JSON.stringify(data))
export const getJSON = (key) => {
  let result = null
  const data = get(key)
  if (!data) {
    return result
  }

  try {
    result = JSON.parse(data)
  } catch {
    result = null
  }

  return result
}

export default {
  get,
  set,
  remove,
  setJSON,
  getJSON
}
