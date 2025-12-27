export function getItemStats(items = []) {
  const safeItems = Array.isArray(items) ? items : []
  const completed = safeItems.filter((item) => item && item.checked).length
  const total = safeItems.length
  const pending = total - completed
  return { total, completed, pending }
}
