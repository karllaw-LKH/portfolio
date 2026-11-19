export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeURL(value) {
  if (!value || typeof value !== 'string') return '';
  if (/^(https?:\/\/|mailto:)/i.test(value)) return value;
  if (/^(assets|uploads)\/[\w./% -]+$/i.test(value) && !value.split('/').includes('..')) return value;
  return '';
}
export function workCategories(work, categories = []) {
  if (Array.isArray(work.categoryIds)) return categories.filter(c => work.categoryIds.includes(c.id));
  const existing = categories.find(c => c.id === work.category || c.label === work.category || (work.category_zh && c.label_zh === work.category_zh));
  if (existing) return [existing];
  return work.category ? [{id:work.category,label:work.category,label_zh:work.category_zh||work.category}] : [];
}
export function validateContent(d) {
  if (!d || !d.profile || typeof d.profile.name !== 'string' || !Array.isArray(d.works) || !Array.isArray(d.archive)) throw Error('内容格式不正确：需要 profile、works 和 archive。');
  if (!d.profile.name.trim()) throw Error('姓名不能为空。');
  if (!Array.isArray(d.profile.socials)) throw Error('社交链接格式错误。');
  const categoryIds = new Set();
  if (d.categories !== undefined) {
    if (!Array.isArray(d.categories)) throw Error('作品分类需要列表。');
    for (const c of d.categories) {
      if (!c.id || categoryIds.has(c.id) || typeof c.label !== 'string' || !c.label.trim()) throw Error('每个分类需要独立 ID 和英文名称。');
      categoryIds.add(c.id);
    }
  }
  const ids = new Set();
  for (const w of d.works) {
    if (!w.id || ids.has(w.id) || !w.title?.trim() || !Array.isArray(w.gallery)) throw Error('每个作品需要独立 ID、标题和图片列表。');
    ids.add(w.id);
    if (w.categoryIds !== undefined && (!Array.isArray(w.categoryIds) || new Set(w.categoryIds).size !== w.categoryIds.length || w.categoryIds.some(id => !categoryIds.has(id)))) throw Error('作品分类无效，请选择已存在的分类。');
  }
  for (const g of d.archive) if (!g.title || !Array.isArray(g.items)) throw Error('履历栏目需要标题和条目列表。');
  return d;
}
