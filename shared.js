export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeURL(value) {
  if (!value || typeof value !== 'string') return '';
  if (/^(https?:\/\/|mailto:)/i.test(value)) return value;
  if (/^(assets|uploads)\/[\w./% -]+$/i.test(value) && !value.split('/').includes('..')) return value;
  return '';
}
export function validateContent(d) {
  if (!d || !d.profile || typeof d.profile.name !== 'string' || !Array.isArray(d.works) || !Array.isArray(d.archive)) throw Error('内容格式不正确：需要 profile、works 和 archive。');
  if (!d.profile.name.trim()) throw Error('姓名不能为空。');
  if (!Array.isArray(d.profile.socials)) throw Error('社交链接格式错误。');
  const ids = new Set();
  for (const w of d.works) {
    if (!w.id || ids.has(w.id) || !w.title?.trim() || !Array.isArray(w.gallery)) throw Error('每个作品需要独立 ID、标题和图片列表。');
    ids.add(w.id);
  }
  for (const g of d.archive) if (!g.title || !Array.isArray(g.items)) throw Error('履历栏目需要标题和条目列表。');
  return d;
}
