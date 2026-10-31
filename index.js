// 衣柜插件：将本文件完整复制到酒馆助手脚本编辑器，保存并启用。
// 模板、样式与界面逻辑均在本文件维护，不依赖外部界面资源。
/**
 * 隔离脚本内部状态，避免与酒馆及其他脚本共享变量。
 * @returns {void} 无返回值。
 */
(function runWardrobe() {
const ICONS = {
    hanger: '<path d="M9 5a3 3 0 1 1 5.2 2L12 9v3l9 6a1.2 1.2 0 0 1-.7 2H3.7a1.2 1.2 0 0 1-.7-2l9-6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    list: '<path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"/>',
    shirt: '<path d="m8 3-5 4 3 4 2-1v11h8V10l2 1 3-4-5-4c-1 3-7 3-8 0Z"/>',
    trousers: '<path d="M7 3h10l2 18h-5l-2-12-2 12H5L7 3Zm0 4h10M12 3v6"/>',
    dress: '<path d="m9 3-1 5 2 4-6 9h16l-6-9 2-4-1-5M8 8h8M10 12h4"/>',
    coat: '<path d="m9 3-5 3-2 13 4 1 2-10v11h8V10l2 10 4-1-2-13-5-3-3 4-3-4Zm3 4v14M9 3l-1 6 4-2 4 2-1-6"/>',
    bra: '<path d="M5 3 3 12m16-9 2 9M2 12c0 8 9 8 10 1 1 7 10 7 10-1-5-3-8-1-10 1-2-2-5-4-10-1Z"/>',
    sock: '<path d="M12 3h8v10c0 3-8 8-11 8-4 0-6-4-3-6l6-4V3Zm0 4h8M8 14l5 5"/>',
    shoe: '<path d="M3 14c4 0 6-3 8-6l4 4 6 2v6H3v-6Zm0 3h18M11 8l-1-3M12 11l2-2M15 13l2-2"/>',
    bow: '<path d="M10 10 4 5c-3 4-3 10 0 14l6-5m4-4 6-5c3 4 3 10 0 14l-6-5M10 10h4v4h-4zM10 14l-3 7m7-7 3 7"/>',
    star: '<path d="m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1 3-6Z"/>',
    more: '<circle cx="4" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="20" cy="12" r="1"/>',
    heart: '<path d="M12 21 3 12C-3 5 7-1 12 6 17-1 27 5 21 12l-9 9Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
    sliders: '<path d="M6 3v18M18 3v18M2 8h8m4 8h8"/>',
    settings: '<path d="m9 3 1-2h4l1 2 3 2 2 1v4l-2 2v3l1 2-3 3-3-1-2 1-2 1-3-3 1-3-1-2-3-1V8l3-1 1-2 3-2Z"/><circle cx="12" cy="11" r="3"/>',
    close: '<path d="m5 5 14 14M5 19 19 5"/>',
    plus: '<path d="M12 4v16M4 12h16"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    file: '<path d="M5 2h9l5 5v15H5V2Zm9 0v6h5M8 12h8M8 16h6"/>',
    tag: '<path d="M3 4v7l10 10 8-8L11 3H4l-1 1Z"/><circle cx="8" cy="8" r="1"/>',
    pencil: '<path d="m4 16 12-12 4 4L8 20l-5 1 1-5Zm10-10 4 4"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
    box: '<path d="m2 10 10-5 10 5-10 5-10-5Zm2 2v7l8 4 8-4v-7M12 15v8M2 10l-1 5 5 2m16-7 1 5-5 2M12 1V-1M5 3 3 1m16 2 2-2"/>',
};
const CATEGORIES = [
    ['all', '全部', 'grid'], ['tops', '上装', 'shirt'], ['bottoms', '下装', 'trousers'],
    ['dresses', '连衣裙', 'dress'], ['coats', '外套', 'coat'], ['underwear', '内衣', 'bra'],
    ['socks', '袜子', 'sock'], ['shoes', '鞋子', 'shoe'], ['accessories', '配饰', 'bow'],
    ['outfits', '套装', 'star'], ['other', '其他', 'more'],
];
const CATEGORY_FILTERS = [...CATEGORIES, ['favorites', '收藏', 'heart'], ['recent', '最近使用', 'clock']];

/**
 * 生成重复使用的线条图标，所有图形随当前控件文字颜色显示。
 * @param {string} name 图标名称，来自本文件的图标表。
 * @param {string} className 图标的附加样式类名。
 * @returns {string} 仅用于内部模板的 SVG 标记。
 */
function icon(name, className = '') {
    return `<svg class="tw-icon ${className}" viewBox="0 0 24 24" fill="none" aria-hidden="true">${ICONS[name]}</svg>`;
}

/**
 * 生成分类或快捷筛选入口；当前只提供布局，数量统一显示为空衣柜的零值。
 * @param {string[]} category 分类标识、名称与图标名称。
 * @returns {string} 分类按钮标记。
 */
function renderCategory([id, label, symbol]) {
    return `<button type="button" class="tw-category" data-category="${id}" aria-pressed="${id === 'all'}">${icon(symbol)}<span class="tw-category-label">${label}</span><span class="tw-count">0</span></button>`;
}

const PANEL_HTML = `
<dialog id="tw-panel" aria-labelledby="tw-panel-title" data-mobile-screen="library">
    <div class="tw-shell">
        <header class="tw-header">
            <div class="tw-brand">
                ${icon('hanger')}
                <div><h1 id="tw-panel-title">衣柜</h1><span class="tw-brand-subtitle">Wardrobe</span></div>
            </div>
            <label class="tw-search">${icon('search')}<input type="search" placeholder="搜索服装…" aria-label="搜索服装" disabled></label>
            <div class="tw-view-modes" role="group" aria-label="服装显示方式">
                <button type="button" class="tw-icon-button" data-view="grid" aria-label="网格视图" aria-pressed="true">${icon('grid')}</button>
                <button type="button" class="tw-icon-button" data-view="list" aria-label="列表视图" aria-pressed="false">${icon('list')}</button>
            </div>
            <button type="button" class="tw-icon-button tw-sort" aria-label="服装排序" disabled>${icon('sliders')}</button>
            <button type="button" class="tw-icon-button tw-settings-button" aria-label="衣柜设置" disabled>${icon('settings')}</button>
            <button type="button" class="tw-icon-button tw-close" data-action="close" aria-label="关闭衣柜">${icon('close')}</button>
        </header>

        <div class="tw-body">
            <aside class="tw-sidebar" aria-label="服装筛选">
                <label class="tw-mobile-filter">
                    ${icon('sliders')}
                    <select aria-label="选择服装分类">
                        ${CATEGORY_FILTERS.map(([id, label]) => `<option value="${id}">${label}</option>`).join('')}
                    </select>
                </label>
                <nav class="tw-category-list" aria-label="服装分类">
                    ${CATEGORIES.map(renderCategory).join('')}
                    <hr class="tw-divider">
                    ${renderCategory(['favorites', '收藏', 'heart'])}
                    ${renderCategory(['recent', '最近使用', 'clock'])}
                </nav>
                <div class="tw-import-footer">
                    <button type="button" class="tw-import" disabled>${icon('plus')}<span>导入服装</span></button>
                    <button type="button" class="tw-import-options" aria-label="更多导入方式" disabled>${icon('chevron')}</button>
                </div>
            </aside>

            <main class="tw-library" aria-label="服装列表" data-layout="grid">
                <div class="tw-empty" role="status" aria-live="polite">
                    ${icon('box')}
                    <h2 id="tw-empty-title">这里还没有服装</h2>
                </div>
            </main>

            <aside id="tw-details" class="tw-details" aria-label="服装预览与详情">
                <div class="tw-preview">${icon('hanger')}<span>未选择服装</span></div>
                <nav class="tw-detail-tabs" aria-label="详情分组">
                    <button type="button" data-detail="info" aria-pressed="true">${icon('info')}<span>信息</span></button>
                    <button type="button" data-detail="description" aria-pressed="false">${icon('file')}<span>描述</span></button>
                    <button type="button" data-detail="tags" aria-pressed="false">${icon('tag')}<span>标签</span></button>
                    <button type="button" data-detail="preferences" aria-pressed="false">${icon('settings')}<span>设置</span></button>
                </nav>
                <div class="tw-detail-content">
                    <section data-detail-page="info" aria-label="服装信息">
                        <dl class="tw-properties"><dt>名称</dt><dd>—</dd><dt>分类</dt><dd>—</dd><dt>来源</dt><dd>—</dd><dt>文件</dt><dd>—</dd><dt>标签</dt><dd>—</dd><dt>备注</dt><dd>—</dd></dl>
                    </section>
                    <section data-detail-page="description" aria-label="服装描述" hidden><span class="tw-detail-placeholder">—</span></section>
                    <section data-detail-page="tags" aria-label="服装标签" hidden><span class="tw-detail-placeholder">—</span></section>
                    <section data-detail-page="preferences" aria-label="服装设置" hidden><span class="tw-detail-placeholder">—</span></section>
                </div>
                <div class="tw-detail-actions">
                    <button type="button" class="tw-apply" disabled>${icon('hanger')}<span>应用到角色</span></button>
                    <div class="tw-action-row">
                        <button type="button" disabled>${icon('pencil')}<span>编辑</span></button>
                        <button type="button" disabled>${icon('download')}<span>导出</span></button>
                        <button type="button" class="tw-delete" disabled>${icon('trash')}<span>删除</span></button>
                    </div>
                </div>
            </aside>
        </div>
        <footer class="tw-mobile-actions" aria-label="衣柜操作">
            <button type="button" class="tw-mobile-import" disabled>${icon('plus')}<span>导入服装</span></button>
            <button type="button" data-action="toggle-details" aria-controls="tw-details" aria-expanded="false">${icon('info')}<span>服装详情</span></button>
        </footer>
    </div>
</dialog>`;

const PANEL_CSS = `
/* 样式只作用于衣柜，避免改变酒馆主题或其他脚本界面。 */
/* 入口位于模态面板外，也要关闭原生点击蒙层，避免开窗后仍残留菜单高亮。 */
#tw-menu-entry { display: flex; align-items: center; gap: 8px; width: 100%; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none; touch-action: manipulation; }
#tw-panel {
    --tw-ink: #ececf5;
    --tw-muted: #9697ad;
    --tw-line: #2d2f3d;
    --tw-accent: #cf91f5;
    --tw-selected: #30283f;
    position: fixed;
    inset: 0;
    width: auto;
    height: auto;
    min-width: 0;
    min-height: 0;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
    border: 1px solid #2b2d3a;
    border-radius: 18px;
    overflow: hidden;
    background: #15171f;
    color: var(--tw-ink);
    color-scheme: dark;
    box-shadow: none;
    font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
    text-align: left;
    text-shadow: none;
    -webkit-text-size-adjust: 100%;
    /* 触摸高亮由控件自身的选中态表达，避免浏览器蓝色点击蒙层遮住深色界面。 */
    -webkit-tap-highlight-color: transparent;
}
#tw-panel, #tw-panel *, #tw-panel *::before, #tw-panel *::after { box-sizing: border-box; }
#tw-panel [hidden] { display: none; }
#tw-panel :is(h1, h2, button, input, dl, dt, dd) { margin: 0; color: inherit; font: inherit; text-shadow: none; letter-spacing: normal; }
#tw-panel button { display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: auto; min-width: 0; padding: 0; border: 1px solid transparent; border-radius: 9px; background: transparent; box-shadow: none; cursor: pointer; }
/* 悬停和选中状态直接生效，不启用滤镜或逐帧颜色动画，减少大面板的绘制成本。 */
#tw-panel :is(button, input) { transition: none; animation: none; }
#tw-panel button:disabled { opacity: 1; color: var(--tw-muted); cursor: default; }
#tw-panel button, #tw-panel .tw-brand { -webkit-user-select: none; user-select: none; }
#tw-panel :is(button, input):focus-visible { outline: 2px solid var(--tw-accent); outline-offset: 3px; }
#tw-panel .tw-icon { display: block; width: 24px; height: 24px; flex: 0 0 auto; stroke: currentColor; stroke-width: 1.65; stroke-linecap: round; stroke-linejoin: round; }
/* 顶部工具栏独占一行；分类、列表和详情分别在自己的区域内滚动。 */
#tw-panel .tw-shell { display: grid; grid-template-rows: 76px minmax(0, 1fr); height: 100%; min-height: 0; }
#tw-panel .tw-header { display: flex; align-items: center; gap: 14px; min-width: 0; padding: 12px 18px 12px 24px; border-bottom: 1px solid var(--tw-line); background: #181921; }
#tw-panel .tw-brand { display: flex; align-items: center; gap: 16px; margin-right: auto; }
#tw-panel .tw-brand > .tw-icon { width: 46px; height: 46px; color: #e493f3; stroke-width: 1.8; }
#tw-panel h1 { font-size: 24px; font-weight: 600; line-height: 1.2; }
#tw-panel .tw-brand-subtitle { display: block; color: var(--tw-muted); font-size: 16px; }
#tw-panel .tw-search { display: flex; align-items: center; gap: 10px; width: clamp(200px, 19vw, 288px); height: 44px; padding: 0 12px; border: 1px solid var(--tw-line); border-radius: 10px; background: #15171f; color: var(--tw-muted); }
#tw-panel .tw-search .tw-icon { width: 20px; height: 20px; }
#tw-panel .tw-search input { width: 100%; min-width: 0; padding: 0; border: 0; background: transparent; box-shadow: none; font-size: 16px; }
#tw-panel .tw-search input::placeholder { color: var(--tw-muted); opacity: 1; }
#tw-panel .tw-view-modes { display: flex; padding: 0; border: 1px solid #252733; border-radius: 10px; background: #15171e; }
#tw-panel .tw-icon-button { width: 44px; height: 44px; }
#tw-panel .tw-icon-button:not(:disabled):hover { background: #242633; }
#tw-panel .tw-view-modes button[aria-pressed="true"] { background: #282a3a; color: #f4f2fc; }
#tw-panel .tw-body { display: grid; grid-template-columns: clamp(220px, 19.2vw, 295px) minmax(0, 1fr) clamp(300px, 27.4vw, 420px); min-width: 0; min-height: 0; }
#tw-panel .tw-sidebar { display: flex; flex-direction: column; min-width: 0; min-height: 0; padding: 12px 18px 36px; }
#tw-panel .tw-mobile-filter, #tw-panel .tw-mobile-actions { display: none; }
#tw-panel .tw-category-list { display: grid; grid-auto-rows: min-content; align-content: start; gap: 2px; flex: 1 1 auto; min-height: 0; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #393444 transparent; }
#tw-panel .tw-category { display: grid; grid-template-columns: 26px minmax(0, 1fr) 28px; align-items: center; gap: 14px; width: 100%; min-height: 54px; padding: 8px 12px; color: #e4e3ed; text-align: left; }
#tw-panel .tw-category > .tw-icon { width: 26px; height: 26px; color: #a6a5bc; }
#tw-panel .tw-category-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#tw-panel .tw-category:hover { background: #22232e; }
#tw-panel .tw-category[aria-pressed="true"] { border-color: #3d3055; background: #30283f; }
#tw-panel .tw-category[aria-pressed="true"] > .tw-icon { color: #d484f3; }
#tw-panel .tw-count { display: grid; min-width: 26px; height: 28px; place-items: center; border-radius: 8px; background: #232431; color: #ccc9e5; font-size: 14px; font-variant-numeric: tabular-nums; }
#tw-panel .tw-category[aria-pressed="true"] .tw-count { background: #3b3252; }
#tw-panel .tw-divider { width: 100%; margin: 16px 0; border: 0; border-top: 1px solid var(--tw-line); }
#tw-panel .tw-import-footer { display: grid; grid-template-columns: minmax(0, 1fr) 44px; flex: 0 0 auto; padding-top: 24px; }
#tw-panel .tw-import-footer button { height: 50px; border: 1px solid #7855b9; background: #623da9; color: #f4eaff; }
#tw-panel .tw-import-footer .tw-import { justify-content: flex-start; padding-left: 18px; border-radius: 10px 0 0 10px; }
#tw-panel .tw-import-footer .tw-import-options { border-left: 0; border-radius: 0 10px 10px 0; }
#tw-panel .tw-library { display: grid; place-items: center; min-width: 0; min-height: 0; margin-bottom: 24px; padding: 24px; overflow: auto; border: 1px solid var(--tw-line); border-top: 0; border-radius: 0 0 16px 16px; background: #14171e; }
#tw-panel .tw-empty { display: grid; justify-items: center; align-content: center; gap: 18px; padding: 24px 0; color: #a6a7ba; text-align: center; }
#tw-panel .tw-empty > .tw-icon { width: 100px; height: 100px; color: #5c6072; stroke-width: 1.3; overflow: visible; }
#tw-panel h2 { font-size: 23px; font-weight: 500; }
#tw-panel .tw-details { display: flex; flex-direction: column; gap: 14px; min-width: 0; min-height: 0; padding: 20px 18px 36px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #393444 transparent; }
#tw-panel .tw-preview { display: flex; flex: 0 0 auto; flex-direction: column; align-items: center; justify-content: center; gap: 20px; height: clamp(220px, 34dvh, 346px); border: 1px solid #574274; border-radius: 11px; background: #1d202b; color: #b7b4cb; }
#tw-panel .tw-preview > .tw-icon { width: 84px; height: 84px; color: #9290ad; stroke-width: 1.6; }
#tw-panel .tw-detail-tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); flex: 0 0 auto; border-bottom: 1px solid var(--tw-line); }
#tw-panel .tw-detail-tabs button { position: relative; gap: 7px; min-height: 48px; border-radius: 9px 9px 0 0; color: #9697ad; font-size: 14px; white-space: nowrap; }
#tw-panel .tw-detail-tabs .tw-icon { width: 18px; height: 18px; }
#tw-panel .tw-detail-tabs button[aria-pressed="true"] { background: #282536; color: #d392f5; }
#tw-panel .tw-detail-tabs button[aria-pressed="true"]::after { content: ''; position: absolute; right: 15px; bottom: -1px; left: 15px; height: 2px; background: #cc88ef; }
#tw-panel .tw-detail-content { flex: 1 0 auto; min-height: 180px; }
#tw-panel .tw-properties { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 22px 16px; padding: 10px 0 16px; color: #9e9eb2; }
#tw-panel .tw-detail-placeholder { display: block; padding: 10px 0; color: var(--tw-muted); }
#tw-panel .tw-detail-actions { display: grid; gap: 18px; flex: 0 0 auto; padding-top: 12px; }
#tw-panel .tw-apply { width: 100%; min-height: 64px; border-color: #39304d; background: #292239; color: #d1c7e5; }
#tw-panel .tw-action-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
#tw-panel .tw-action-row button { min-height: 62px; border-color: var(--tw-line); color: #aaa8bf; }
#tw-panel .tw-action-row .tw-icon { width: 22px; height: 22px; }
#tw-panel .tw-action-row .tw-delete { border-color: #45303e; background: #241e26; color: #d77687; }
/* 手机让列表与详情分别占用内容区，避免预览和表单把列表页拉成长页面。 */
@media (max-width: 900px), (max-height: 500px) and (pointer: coarse) {
    #tw-panel {
        height: 100vh;
        height: 100dvh;
        bottom: auto;
        padding-bottom: 0;
        border: 0;
        border-radius: 0;
    }
    #tw-panel .tw-shell { grid-template-rows: auto minmax(0, 1fr) auto; }
    #tw-panel .tw-header { flex-wrap: wrap; gap: 10px; }
    #tw-panel .tw-body { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); overflow: hidden; }
    #tw-panel .tw-sidebar { display: grid; grid-template-columns: 44px minmax(0, 1fr); align-items: center; gap: 8px; padding: 8px 12px; }
    /* 原生选择器一次展示全部分类，横向条带则保留快速切换，两者共享选中状态。 */
    #tw-panel .tw-mobile-filter { position: relative; display: grid; width: 44px; height: 44px; place-items: center; border: 1px solid var(--tw-line); border-radius: 9px; background: #20222d; color: #c6bddb; }
    #tw-panel .tw-mobile-filter .tw-icon { width: 20px; height: 20px; }
    #tw-panel .tw-mobile-filter select { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; font-size: 16px; }
    #tw-panel .tw-mobile-filter:focus-within { outline: 2px solid var(--tw-accent); outline-offset: 2px; }
    #tw-panel .tw-category-list { display: flex; gap: 6px; min-width: 0; padding: 3px; overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain; scrollbar-width: none; scroll-behavior: auto; }
    #tw-panel .tw-category { display: inline-flex; flex: 0 0 auto; gap: 8px; width: auto; min-height: 44px; padding: 8px 12px; font-size: 15px; }
    #tw-panel .tw-category > .tw-icon { width: 20px; height: 20px; }
    #tw-panel .tw-count, #tw-panel .tw-divider, #tw-panel .tw-import-footer { display: none; }
    #tw-panel .tw-library { min-height: 0; margin: 0 12px 12px; padding: 12px; border-top: 1px solid var(--tw-line); border-radius: 12px; overscroll-behavior: contain; }
    #tw-panel .tw-empty { gap: 12px; padding: 16px 0; }
    #tw-panel .tw-empty > .tw-icon { width: 72px; height: 72px; }
    #tw-panel h2 { font-size: 20px; }
    #tw-panel .tw-details { display: none; grid-column: 1; grid-row: 1 / -1; padding: 12px 12px 20px; overflow-y: auto; overscroll-behavior: contain; }
    #tw-panel[data-mobile-screen="details"] .tw-sidebar, #tw-panel[data-mobile-screen="details"] .tw-library { display: none; }
    #tw-panel[data-mobile-screen="details"] .tw-details { display: flex; }
    #tw-panel .tw-preview { height: 220px; }
    #tw-panel .tw-properties { grid-template-columns: 80px minmax(0, 1fr); }
    /* 操作栏占据独立网格行，并预留底部安全区，避免遮住列表或贴住系统手势条。 */
    #tw-panel .tw-mobile-actions { display: grid; grid-template-columns: minmax(0, 1fr) minmax(118px, .8fr); gap: 10px; padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid var(--tw-line); background: #181921; }
    #tw-panel .tw-mobile-actions button { min-height: 48px; padding: 8px 12px; border-color: #393544; background: #23212e; color: #d3c9e4; font-size: 15px; }
    #tw-panel .tw-mobile-actions .tw-mobile-import { border-color: #7855b9; background: #623da9; color: #f4eaff; }
    #tw-panel .tw-mobile-actions .tw-icon { width: 20px; height: 20px; }
}
@media (max-width: 600px) {
    #tw-panel .tw-header { display: grid; grid-template-columns: minmax(0, 1fr) 44px 44px; gap: 8px; padding: 8px 12px; }
    #tw-panel .tw-brand { grid-column: 1; grid-row: 1; gap: 10px; margin-right: 0; }
    #tw-panel .tw-brand > .tw-icon { width: 34px; height: 34px; }
    #tw-panel h1 { font-size: 20px; }
    #tw-panel .tw-brand-subtitle { font-size: 12px; }
    #tw-panel .tw-header > .tw-icon-button { width: 44px; height: 44px; }
    #tw-panel .tw-settings-button { grid-column: 2; grid-row: 1; }
    #tw-panel .tw-close { grid-column: 3; grid-row: 1; }
    #tw-panel .tw-sort { display: none; }
    #tw-panel .tw-search { grid-column: 1; grid-row: 2; width: 100%; min-width: 0; }
    #tw-panel .tw-view-modes { grid-column: 2 / 4; grid-row: 2; width: 100%; }
    #tw-panel .tw-view-modes .tw-icon-button { flex: 1 1 0; width: 44px; }
}
@media (pointer: coarse) {
    #tw-menu-entry { min-height: 44px; padding: 8px 10px; }
    #tw-panel button, #tw-panel select { touch-action: manipulation; }
}
@media (hover: none) {
    #tw-panel .tw-category:not([aria-pressed="true"]):hover { background: transparent; }
}
`;

// 酒馆助手使用独立 iframe 执行脚本，面板元素挂载到父级文档。
const hostDocument = window.parent.document;
const compactViewport = window.parent.matchMedia('(max-width: 900px), (max-height: 500px) and (pointer: coarse)');
let root;
let menuEntry;
let panel;
let opener;

/**
 * 创建菜单入口、完整面板和界面事件，不请求或改写业务数据。
 * @returns {void} 无返回值。
 */
function initializeWardrobe() {
    const menu = hostDocument.querySelector('#extensionsMenu');
    if (!menu) throw new Error('衣柜插件：找不到酒馆扩展菜单，请在酒馆助手脚本库中运行。');
    root = hostDocument.createElement('div');
    root.id = 'tw-script-root';
    root.innerHTML = `<style>${PANEL_CSS}</style>${PANEL_HTML}`;
    hostDocument.body.append(root);
    panel = root.querySelector('#tw-panel');

    menuEntry = hostDocument.createElement('button');
    menuEntry.id = 'tw-menu-entry';
    menuEntry.type = 'button';
    menuEntry.className = 'list-group-item flex-container flexGap5';
    menuEntry.innerHTML = '<i class="fa-solid fa-shirt" aria-hidden="true"></i><span>衣柜插件</span>';
    // 追加入口以保持酒馆已有菜单的顺序。
    menu.append(menuEntry);
    menuEntry.addEventListener('click', openWardrobe);
    panel.querySelector('[data-action="close"]').addEventListener('click', closeWardrobe);
    panel.querySelector('.tw-category-list').addEventListener('click', selectCategory);
    panel.querySelector('.tw-mobile-filter select').addEventListener('change', selectMobileCategory);
    panel.querySelector('[data-action="toggle-details"]').addEventListener('click', toggleMobileDetails);
    panel.querySelector('.tw-view-modes').addEventListener('click', selectView);
    panel.querySelector('.tw-detail-tabs').addEventListener('click', selectDetail);
    panel.addEventListener('close', restoreFocus);
    window.addEventListener('pagehide', destroyWardrobe, { once: true });
    appendInexistentScriptButtons([{ name: '衣柜插件', visible: true }]);
    eventOn(getButtonEvent('衣柜插件'), openWardrobe);
    console.info('[衣柜插件] 面板已就绪。');
}

/**
 * 打开原生对话框，交由浏览器处理模态焦点和 Escape 关闭。
 * @returns {void} 无返回值。
 */
function openWardrobe() {
    opener = hostDocument.activeElement;
    setMobileDetails(false);
    if (!panel.open) panel.showModal();
}

/**
 * 关闭当前面板；入口焦点由关闭事件恢复。
 * @returns {void} 无返回值。
 */
function closeWardrobe() {
    panel.close();
}

/**
 * 切换分类高亮及空态文案，数量和服装内容保持未接入的空状态。
 * @param {MouseEvent} event 分类列表中的点击事件。
 * @returns {void} 无返回值。
 */
function selectCategory(event) {
    const button = event.target.closest('button[data-category]');
    if (!button) return;
    updateCategory(button.dataset.category);
}

/**
 * 将手机系统选择器的分类变化转交给共用的分类界面更新逻辑。
 * @param {Event} event 原生分类选择器触发的变化事件。
 * @returns {void} 无返回值。
 */
function selectMobileCategory(event) {
    updateCategory(event.currentTarget.value);
}

/**
 * 同步分类按钮、手机选择器与空态；只在紧凑布局中滚动条带以露出当前分类。
 * @param {string} id 来自本文件分类入口的分类标识。
 * @returns {void} 无返回值。
 */
function updateCategory(id) {
    let selectedButton;
    for (const item of panel.querySelectorAll('[data-category]')) {
        const selected = item.dataset.category === id;
        item.setAttribute('aria-pressed', String(selected));
        if (selected) selectedButton = item;
    }
    panel.querySelector('.tw-mobile-filter select').value = id;
    const label = selectedButton.querySelector('.tw-category-label').textContent;
    panel.querySelector('#tw-empty-title').textContent = id === 'all' ? '这里还没有服装' : id === 'favorites' ? '还没有收藏的服装' : id === 'recent' ? '还没有最近使用的服装' : `暂无${label}`;
    if (compactViewport.matches) selectedButton.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

/**
 * 在手机列表和详情之间切换；界面状态保存在面板上，桌面仍由样式展示三栏。
 * @returns {void} 无返回值。
 */
function toggleMobileDetails() {
    setMobileDetails(panel.dataset.mobileScreen !== 'details');
}

/**
 * 同步手机内容区和底部返回入口，不复制预览或详情 DOM。
 * @param {boolean} expanded 是否展示详情页面。
 * @returns {void} 无返回值。
 */
function setMobileDetails(expanded) {
    panel.dataset.mobileScreen = expanded ? 'details' : 'library';
    const button = panel.querySelector('[data-action="toggle-details"]');
    button.setAttribute('aria-expanded', String(expanded));
    button.querySelector('span').textContent = expanded ? '返回列表' : '服装详情';
    // 每次进入详情从预览开始；返回列表时保留分类及列表原有的浏览位置。
    if (expanded) panel.querySelector('.tw-details').scrollTop = 0;
}

/**
 * 切换网格与列表按钮的显示状态；当前空衣柜不生成模拟条目。
 * @param {MouseEvent} event 显示方式按钮组中的点击事件。
 * @returns {void} 无返回值。
 */
function selectView(event) {
    const button = event.target.closest('button[data-view]');
    if (!button) return;
    for (const item of panel.querySelectorAll('[data-view]')) {
        item.setAttribute('aria-pressed', String(item === button));
    }
    panel.querySelector('.tw-library').dataset.layout = button.dataset.view;
}

/**
 * 切换右侧详情分组，所有分组仅提供尚未选择服装时的空白布局。
 * @param {MouseEvent} event 详情分组中的点击事件。
 * @returns {void} 无返回值。
 */
function selectDetail(event) {
    const button = event.target.closest('button[data-detail]');
    if (!button) return;
    for (const item of panel.querySelectorAll('[data-detail]')) {
        item.setAttribute('aria-pressed', String(item === button));
    }
    for (const page of panel.querySelectorAll('[data-detail-page]')) {
        page.hidden = page.dataset.detailPage !== button.dataset.detail;
    }
}

/**
 * 关闭后恢复到打开入口，让键盘操作可以接续酒馆页面。
 * @returns {void} 无返回值。
 */
function restoreFocus() {
    opener.focus({ preventScroll: true });
}

/**
 * 脚本停用或重载时清理挂载的 DOM，避免残留遮罩、样式与入口。
 * @returns {void} 无返回值。
 */
function destroyWardrobe() {
    panel.removeEventListener('close', restoreFocus);
    if (panel.open) panel.close();
    menuEntry.remove();
    root.remove();
}

/**
 * 在启动边界显示带脚本名称的错误提示，方便定位与其他脚本无关的报错。
 * @returns {void} 无返回值。
 */
function startWardrobe() {
    try {
        initializeWardrobe();
    } catch (error) {
        console.error('[衣柜插件] 启动失败', error);
        toastr.error(String(error), '衣柜插件启动失败', { timeOut: 0, extendedTimeOut: 0 });
    }
}

// 等待宿主文档就绪，避免把脚本 iframe 的加载状态误当成酒馆页面状态。
if (hostDocument.readyState === 'loading') {
    hostDocument.addEventListener('DOMContentLoaded', startWardrobe, { once: true });
} else {
    startWardrobe();
}
})();
