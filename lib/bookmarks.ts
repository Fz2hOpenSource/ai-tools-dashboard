'use client'

const BOOKMARKS_KEY = 'cc-lens-bookmarks'

export function getBookmarks(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function toggleBookmark(sessionId: string): boolean {
  const current = getBookmarks()
  const index = current.indexOf(sessionId)
  if (index === -1) {
    current.push(sessionId)
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(current))
    return true // now bookmarked
  } else {
    current.splice(index, 1)
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(current))
    return false // now unbookmarked
  }
}

export function isBookmarked(sessionId: string): boolean {
  return getBookmarks().includes(sessionId)
}
