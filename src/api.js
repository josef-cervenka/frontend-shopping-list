const DEFAULT_BASE_URL = 'http://localhost:8081'

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || DEFAULT_BASE_URL

function buildUrl(path) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${API_BASE_URL}${path}`
}

function encodeSegment(value) {
  return encodeURIComponent(String(value))
}

function getStoredToken() {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return null
  }
  try {
    return window.localStorage.getItem('bearerToken')
  } catch {
    return null
  }
}

async function readResponse(response) {
  if (response.status === 204) {
    return null
  }
  const text = await response.text()
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function request(path, { method = 'GET', body, headers = {}, token, auth = true } = {}) {
  const finalHeaders = { Accept: 'application/json', ...headers }
  const options = {
    method,
    headers: finalHeaders,
  }

  if (body !== undefined) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body)
    if (!finalHeaders['Content-Type']) {
      finalHeaders['Content-Type'] = 'application/json'
    }
  }

  if (auth) {
    const authToken = token ?? getStoredToken()
    if (authToken) {
      finalHeaders.Authorization = `Bearer ${authToken}`
    }
  }

  const response = await fetch(buildUrl(path), options)
  const data = await readResponse(response)

  if (!response.ok) {
    const message = (data && data.message) || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return data
}

export function login(username, password) {
  return request('/login', {
    method: 'POST',
    body: { username, password },
    auth: false,
  })
}

export function logout() {
  return request('/logout', { method: 'POST' })
}

export function getShoppingLists(options = {}) {
  const { archived } = options
  const params = new URLSearchParams()
  if (typeof archived === 'boolean') {
    params.set('archived', archived ? 'true' : 'false')
  }
  const query = params.toString()
  const path = query ? `/shoppingList?${query}` : '/shoppingList'
  return request(path)
}

export function createShoppingList(name) {
  const trimmed = (name || '').trim()
  if (!trimmed) {
    return Promise.reject(new Error('List name is required'))
  }
  const listName = encodeSegment(trimmed)
  return request(`/shoppingList/${listName}`, {
    method: 'POST',
  })
}

export function updateShoppingList(shoppingListId, payload = {}) {
  return request(`/shoppingList/${encodeSegment(shoppingListId)}`, {
    method: 'PUT',
    body: payload,
  })
}

export function renameShoppingList(currentName, nextName) {
  const trimmed = (nextName || '').trim()
  if (!trimmed) {
    return Promise.reject(new Error('List name is required'))
  }
  return updateShoppingList(currentName, { name: trimmed })
}

export function setShoppingListArchived(shoppingListId, archived) {
  return updateShoppingList(shoppingListId, { archived })
}

export function getShoppingList(shoppingListId) {
  return request(`/shoppingList/${encodeSegment(shoppingListId)}`)
}

export function getItems(shoppingListId) {
  return request(`/shoppingList/${encodeSegment(shoppingListId)}/items`)
}

export function addItem(shoppingListId, name) {
  return request(`/shoppingList/${encodeSegment(shoppingListId)}/item`, {
    method: 'POST',
    body: { name },
  })
}

export function toggleItem(shoppingListId, itemName, checked) {
  const body = typeof checked === 'boolean' ? { checked } : {}
  return request(
    `/shoppingList/${encodeSegment(shoppingListId)}/item/${encodeSegment(itemName)}/mark`,
    {
      method: 'PUT',
      body,
    },
  )
}

export function deleteItem(shoppingListId, itemName) {
  return request(
    `/shoppingList/${encodeSegment(shoppingListId)}/item/${encodeSegment(itemName)}`,
    {
      method: 'DELETE',
    },
  )
}

export function getMembers(shoppingListId) {
  return request(`/shoppingList/${encodeSegment(shoppingListId)}/members`)
}

export async function addMember(shoppingListId, name) {
  const response = await request(
    `/shoppingList/${encodeSegment(shoppingListId)}/invite`,
    {
      method: 'POST',
      body: { name },
    },
  )
  if (Array.isArray(response?.members)) {
    return response.members
  }
  return Array.isArray(response) ? response : []
}

export async function removeMember(shoppingListId, name) {
  const response = await request(
    `/shoppingList/${encodeSegment(shoppingListId)}/remove`,
    {
      method: 'DELETE',
      body: { name },
    },
  )
  if (Array.isArray(response?.members)) {
    return response.members
  }
  return Array.isArray(response) ? response : []
}
