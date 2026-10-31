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
const CATEGORY_LABELS = new Map(CATEGORY_FILTERS.map(([id, label]) => [id, label]));
const GARMENT_CATEGORIES = new Set(CATEGORIES.slice(1).map(([id]) => id));
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const WEARERS = ['user', 'char'];
const TEMPLATE_OWNERS = [...WEARERS, 'image'];
const TEMPLATE_FIELDS = ['single', 'wardrobe'];
const TEMPLATE_VARIABLES = /\{\{(user|char|wearer|name|description|outfits|count)\}\}/g;
const DESCRIPTION_VARIABLES = /\{\{(name|category)\}\}/g;
const DEFAULT_DESCRIPTION_PROMPTS = {
    outfit: '请只描述图片中可见的服装与配饰，说明款式、颜色、材质、版型、层次、搭配及装饰细节。忽略人物的身份、面容、发型、表情、姿势、身材、皮肤和身体特征，不描述背景，不续写剧情。只写能从图中看出的信息，无法判断的材质和被遮挡的细节不要猜测。仅输出服装描述正文。',
    item: '请只描述当前服装单品“{{name}}”（分类：{{category}}）在图片中可见的款式、颜色、材质、剪裁、图案、装饰和穿着细节。忽略其他服装和配饰，不描述人物的身份、面容、发型、表情、姿势、身材、皮肤、身体特征及背景。无法辨认目标单品时请明确说明，不编造。仅输出该单品的描述正文。',
};
const DEFAULT_TEMPLATES = {
    user: {
        single: '{{user}} 当前穿着：{{name}}\n{{description}}',
        wardrobe: '{{user}} 的衣柜，共 {{count}} 套：\n{{outfits}}\n请根据剧情选择合适的一套，不要同时穿上所有套装。',
    },
    char: {
        single: '{{char}} 当前穿着：{{name}}\n{{description}}',
        wardrobe: '{{char}} 的衣柜，共 {{count}} 套：\n{{outfits}}\n请根据剧情选择合适的一套，不要同时穿上所有套装。',
    },
    image: {
        single: '{{wearer}} 的服装参考图：{{name}}。请仅参考图片中的服装、配饰、款式、颜色和穿搭，不采用图中人物的身份、面容、发型、身材、姿势或背景，不据此改变角色原有外貌。不编造看不到的服装细节。',
        wardrobe: '{{wearer}} 的衣柜包含 {{count}} 套服装，名称与图片按相同顺序对应：{{name}}。请根据剧情选择合适的一套，不要同时穿上所有套装。图片仅提供服装与配饰参考，忽略图中人物的身份、面容、发型、身材、姿势和背景，不改变角色原有外貌，不编造看不到的服装细节。',
    },
};

/**
 * 衣柜服装数据，导入和读取存档时统一校验，内部按稳定 ID 查找。
 * @typedef {Object} WardrobeItem
 * @property {string} id 服装标识。
 * @property {string} name 服装名称。
 * @property {string} category 服装分类标识。
 * @property {string} description 发送给 AI 的服装描述。
 * @property {string} image 图片数据地址，无图片时为空字符串。
 * @property {string} groupId 标签标识，空字符串表示未分组。
 */

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
 * 生成分类或快捷筛选入口，服装载入后由列表渲染同步实际数量。
 * @param {string[]} category 分类标识、名称与图标名称。
 * @returns {string} 分类按钮标记。
 */
function renderCategory([id, label, symbol]) {
    return `<button type="button" class="tw-category" data-category="${id}" aria-pressed="${id === 'all'}">${icon(symbol)}<span class="tw-category-label">${label}</span><span class="tw-count">0</span></button>`;
}

/**
 * 为角色和图片提示词生成同结构的模板编辑页；实际模板在存档入口加载，不拼接用户文本。
 * @param {string} wearer 模板所属的 user、char 或 image。
 * @param {string} label 页面中显示的角色名称。
 * @returns {string} 模板设置页标记。
 */
function renderTemplateSettings(wearer, label) {
    return `<section id="tw-settings-${wearer}-template" data-settings-content="${wearer}-template" aria-labelledby="tw-${wearer}-template-title" hidden>
        <h3 id="tw-${wearer}-template-title">${label}模板</h3>
        <form class="tw-template-form" data-template-owner="${wearer}">
            <label><span>${wearer === 'image' ? '单套＋图片' : '单套模板'}</span><small>${wearer === 'image' ? '发送图片时，选择 1 套服装使用' : `${label} 选择 1 套时生效`}</small><textarea name="single" aria-label="${label}单套模板" required spellcheck="false"></textarea></label>
            <label><span>${wearer === 'image' ? '衣柜＋图片' : '衣柜模式'}</span><small>${wearer === 'image' ? '发送图片时，选择多套服装使用' : `${label} 选择多套时生效`}</small><textarea name="wardrobe" aria-label="${label}衣柜模式模板" required spellcheck="false"></textarea></label>
            <p class="tw-template-hint">变量：{{user}} 用户名 · {{char}} 角色名 · {{wearer}} 当前所属角色 · {{name}} 服装名称 · {{description}} 描述 · {{outfits}} 服装列表 · {{count}} 套数</p>
            <div class="tw-send-actions"><button type="submit">保存</button></div>
            <p class="tw-template-status" role="status" aria-live="polite"></p>
        </form>
    </section>`;
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
            <button type="button" class="tw-icon-button tw-settings-button" data-action="open-settings" aria-label="衣柜设置" aria-haspopup="dialog" aria-controls="tw-settings">${icon('settings')}</button>
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
                    <button type="button" class="tw-import" data-action="import">${icon('plus')}<span>导入服装</span></button>
                    <button type="button" class="tw-export-all" data-action="export-all">${icon('download')}<span>导出服装</span></button>
                </div>
            </aside>

            <main class="tw-library" aria-label="服装列表" data-layout="grid" data-multi-select="false">
                <div class="tw-group-bar">
                    <nav class="tw-group-tabs" aria-label="服装标签"></nav>
                    <button type="button" data-action="add-group" aria-label="新增标签" title="新增标签">${icon('plus')}</button>
                    <button type="button" data-action="toggle-multi" aria-pressed="false" aria-controls="tw-bulk-actions">多选</button>
                </div>
                <div class="tw-library-content">
                    <p class="tw-library-status" role="status" aria-live="polite"></p>
                    <div class="tw-items" hidden></div>
                    <div class="tw-empty" role="status" aria-live="polite">
                        ${icon('box')}
                        <h2 id="tw-empty-title">这里还没有服装</h2>
                    </div>
                </div>
                <div id="tw-bulk-actions" class="tw-bulk-actions" aria-label="服装批量操作" hidden>
                    <div class="tw-bulk-main">
                        <label class="tw-bulk-selection" title="全选当前列表"><input type="checkbox" class="tw-select-all" aria-label="全选当前列表"><span class="tw-selection-count">已选 0 件</span></label>
                        <label class="tw-bulk-picker tw-bulk-apply-picker">${icon('hanger')}<select class="tw-bulk-apply" aria-label="批量应用到角色" disabled>
                            <option value="" disabled selected>应用到…</option>
                            <optgroup label="应用到"><option value="apply-user">USER</option><option value="apply-char">Char</option></optgroup>
                            <optgroup label="取消应用"><option value="unapply-user">USER</option><option value="unapply-char">Char</option></optgroup>
                        </select></label>
                        <label class="tw-bulk-picker tw-bulk-group-picker">${icon('tag')}<select class="tw-bulk-group" aria-label="移动所选服装到标签" disabled></select></label>
                        <button type="button" data-bulk="export" disabled>${icon('download')}<span>导出</span></button>
                    </div>
                    <button type="button" class="tw-bulk-delete" data-bulk="delete" disabled>${icon('trash')}<span>删除</span></button>
                </div>
            </main>

            <aside id="tw-details" class="tw-details" aria-label="服装预览与详情">
                <div class="tw-wearer-modes" role="group" aria-label="选择服装所属角色">
                    <button type="button" data-wearer="user" aria-pressed="false">USER<span>0</span></button>
                    <button type="button" data-wearer="char" aria-pressed="true">Char<span>0</span></button>
                </div>
                <div class="tw-preview">${icon('hanger')}<span>未选择服装</span></div>
                <nav class="tw-detail-tabs" aria-label="详情分组">
                    <button type="button" data-detail="info" aria-pressed="true">${icon('info')}<span>信息</span></button>
                    <button type="button" data-detail="description" aria-pressed="false">${icon('file')}<span>描述</span></button>
                    <button type="button" data-detail="tags" aria-pressed="false">${icon('tag')}<span>标签</span></button>
                    <button type="button" data-detail="preferences" aria-pressed="false">${icon('settings')}<span>设置</span></button>
                </nav>
                <div class="tw-detail-content">
                    <section data-detail-page="info" aria-label="服装信息">
                        <dl class="tw-properties">
                            <dt>名称</dt><dd><input name="garment_name" aria-label="服装名称" required disabled></dd>
                            <dt>分类</dt><dd><select name="garment_category" aria-label="服装分类" disabled>${CATEGORIES.slice(1).map(([id, label]) => `<option value="${id}">${label}</option>`).join('')}</select></dd>
                            <dt>图片</dt><dd><span id="tw-garment-image-state">—</span><button type="button" data-action="remove-image" disabled>删除图片</button></dd>
                        </dl>
                    </section>
                    <section data-detail-page="description" aria-label="服装描述" hidden>
                        <div class="tw-description-actions">
                            <select name="description_mode" aria-label="描述生成类型" disabled><option value="outfit">服装描述</option><option value="item">单品描述</option></select>
                            <button type="button" class="tw-describe" data-action="describe" disabled>AI 生成描述</button>
                        </div>
                        <textarea name="garment_description" aria-label="服装描述" placeholder="填写款式、颜色、材质等服装描述" disabled></textarea>
                    </section>
                    <section data-detail-page="tags" aria-label="服装标签" hidden>
                        <label class="tw-garment-tag"><span>标签</span><select name="garment_group" aria-label="服装标签" disabled></select></label>
                    </section>
                    <section data-detail-page="preferences" aria-label="服装设置" hidden><span class="tw-detail-placeholder">—</span></section>
                </div>
                <div class="tw-detail-actions">
                    <button type="button" class="tw-apply" data-action="apply" disabled>${icon('hanger')}<span>应用到角色</span></button>
                    <div class="tw-action-row">
                        <button type="button" data-action="save-garment" disabled>${icon('pencil')}<span>保存修改</span></button>
                        <button type="button" data-action="export-one" disabled>${icon('download')}<span>导出</span></button>
                        <button type="button" class="tw-delete" data-action="delete-one" disabled>${icon('trash')}<span>删除</span></button>
                    </div>
                    <p class="tw-garment-status" role="status" aria-live="polite"></p>
                </div>
            </aside>
        </div>
        <footer class="tw-mobile-actions" aria-label="衣柜操作">
            <button type="button" class="tw-mobile-import" data-action="import">${icon('plus')}<span>导入</span></button>
            <button type="button" data-action="export-all">${icon('download')}<span>导出</span></button>
            <button type="button" data-action="toggle-details" aria-controls="tw-details" aria-expanded="false">${icon('info')}<span>服装详情</span></button>
        </footer>
        <input class="tw-image-import" type="file" accept="image/png,image/jpeg,image/webp,application/json,.json" multiple hidden>
    </div>
    <dialog id="tw-settings" aria-labelledby="tw-settings-title">
        <header class="tw-settings-header">
            <h2 id="tw-settings-title">衣柜设置</h2>
            <button type="button" class="tw-icon-button" data-action="close-settings" aria-label="关闭设置" autofocus>${icon('close')}</button>
        </header>
        <div class="tw-settings-body">
            <nav class="tw-settings-nav" aria-label="设置分组">
                <button type="button" data-settings-page="api" aria-pressed="true" aria-controls="tw-settings-api">${icon('settings')}<span>API</span></button>
                <button type="button" data-settings-page="send" aria-pressed="false" aria-controls="tw-settings-send">${icon('file')}<span>发送内容</span></button>
                <button type="button" data-settings-page="user-template" aria-pressed="false" aria-controls="tw-settings-user-template">${icon('file')}<span>USER模板</span></button>
                <button type="button" data-settings-page="char-template" aria-pressed="false" aria-controls="tw-settings-char-template">${icon('file')}<span>Char模板</span></button>
                <button type="button" data-settings-page="image-template" aria-pressed="false" aria-controls="tw-settings-image-template">${icon('file')}<span>图片模板</span></button>
                <button type="button" data-settings-page="description" aria-pressed="false" aria-controls="tw-settings-description">${icon('pencil')}<span>描述生成</span></button>
            </nav>
            <div class="tw-settings-content">
                <section id="tw-settings-api" data-settings-content="api" aria-labelledby="tw-settings-api-title">
                    <h3 id="tw-settings-api-title">API</h3>
                    <form class="tw-api-form">
                        <fieldset class="tw-api-fields">
                            <label class="tw-api-field"><span>连接方式</span>
                                <select name="mode">
                                    <option value="host">使用酒馆连接</option>
                                    <option value="custom">自定义（OpenAI 兼容）</option>
                                </select>
                            </label>
                            <fieldset class="tw-api-custom" hidden disabled>
                                <label class="tw-api-field"><span>接口地址</span><input name="apiurl" type="url" placeholder="https://api.example.com/v1" autocomplete="off" spellcheck="false"></label>
                                <label class="tw-api-field"><span>API Key</span>
                                    <span class="tw-api-input-action"><input name="key" type="password" autocomplete="off" spellcheck="false"><button type="button" data-action="toggle-api-key" aria-label="显示 API Key" aria-pressed="false">显示</button></span>
                                </label>
                                <div class="tw-api-field"><label id="tw-api-model-label" for="tw-api-model">模型</label>
                                    <div class="tw-api-input-action">
                                        <div class="tw-model-picker">
                                            <div class="tw-model-control">
                                                <input id="tw-api-model" name="model" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="tw-api-models" placeholder="输入或选择模型" autocomplete="off" spellcheck="false">
                                                <button type="button" data-action="toggle-models" aria-label="展开模型列表" aria-controls="tw-api-models" aria-expanded="false">${icon('chevron')}</button>
                                            </div>
                                            <div id="tw-api-models" class="tw-model-options" role="listbox" aria-labelledby="tw-api-model-label" hidden></div>
                                        </div>
                                        <button type="button" data-api-action="models">获取模型</button>
                                    </div>
                                </div>
                                <div class="tw-api-parameters">
                                    <label class="tw-api-field"><span>温度</span><input name="temperature" type="number" min="0" max="2" step="any" required></label>
                                    <label class="tw-api-field"><span>最大回复 Token</span><input name="max_tokens" type="number" min="1" step="1" required></label>
                                </div>
                            </fieldset>
                        </fieldset>
                        <div class="tw-api-actions">
                            <button type="button" data-api-action="test">测试连接</button>
                            <button type="submit" class="tw-api-save" data-api-action="save">保存</button>
                        </div>
                        <p class="tw-api-status" role="status" aria-live="polite"></p>
                    </form>
                </section>
                <section id="tw-settings-send" data-settings-content="send" aria-labelledby="tw-settings-send-title" hidden>
                    <h3 id="tw-settings-send-title">发送内容</h3>
                    <form class="tw-send-form">
                        <fieldset class="tw-send-group">
                            <legend>发送给 AI 的内容类型</legend>
                            <div class="tw-send-options">
                                <label class="tw-send-choice"><input type="radio" name="content_type" value="text" checked><span>文字描述</span></label>
                                <label class="tw-send-choice"><input type="radio" name="content_type" value="image"><span>图片</span></label>
                                <label class="tw-send-choice"><input type="radio" name="content_type" value="text_image"><span>文字＋图片</span></label>
                            </div>
                        </fieldset>
                        <fieldset class="tw-send-group">
                            <legend>注入位置</legend>
                            <div class="tw-send-options">
                                <label class="tw-send-choice"><input type="radio" name="position" value="system_end"><span>系统提示末尾</span></label>
                                <label class="tw-send-choice"><input type="radio" name="position" value="context_end"><span>上下文末尾</span></label>
                                <label class="tw-send-choice"><input type="radio" name="position" value="user_end" checked><span>用户消息末尾</span></label>
                            </div>
                        </fieldset>
                        <div class="tw-send-actions"><button type="submit">保存</button></div>
                        <p class="tw-send-status" role="status" aria-live="polite"></p>
                    </form>
                </section>
                ${renderTemplateSettings('user', 'USER')}
                ${renderTemplateSettings('char', 'Char')}
                ${renderTemplateSettings('image', '图片')}
                <section id="tw-settings-description" data-settings-content="description" aria-labelledby="tw-settings-description-title" hidden>
                    <h3 id="tw-settings-description-title">描述生成</h3>
                    <form class="tw-template-form tw-description-form">
                        <label><span>服装描述</span><textarea name="outfit" aria-label="服装描述生成提示词" required spellcheck="false"></textarea></label>
                        <label><span>单品描述</span><textarea name="item" aria-label="单品描述生成提示词" required spellcheck="false"></textarea></label>
                        <p class="tw-template-hint">变量：{{name}} 当前服装名称 · {{category}} 当前分类。生成时在服装详情的“描述”页选择类型。</p>
                        <div class="tw-send-actions"><button type="submit">保存</button></div>
                        <p class="tw-template-status" role="status" aria-live="polite"></p>
                    </form>
                </section>
            </div>
        </div>
    </dialog>
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
/* 隐藏状态优先于组件的网格布局，确保收起的模型列表和未启用的 API 分组不占位。 */
#tw-panel [hidden] { display: none !important; }
#tw-panel :is(h1, h2, h3, button, input, select, textarea, dl, dt, dd) { margin: 0; color: inherit; font: inherit; text-shadow: none; letter-spacing: normal; }
#tw-panel button { display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: auto; min-width: 0; padding: 0; border: 1px solid transparent; border-radius: 9px; background: transparent; box-shadow: none; cursor: pointer; }
/* 悬停和选中状态直接生效，不启用滤镜或逐帧颜色动画，减少大面板的绘制成本。 */
#tw-panel :is(button, input) { transition: none; animation: none; }
#tw-panel button:disabled { opacity: 1; color: var(--tw-muted); cursor: default; }
#tw-panel button, #tw-panel .tw-brand { -webkit-user-select: none; user-select: none; }
#tw-panel :is(button, input, select, textarea):focus-visible { outline: 2px solid var(--tw-accent); outline-offset: 3px; }
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
#tw-panel .tw-sidebar { display: flex; flex-direction: column; min-width: 0; min-height: 0; padding: 12px 18px 20px; font-size: 14px; }
#tw-panel .tw-mobile-filter, #tw-panel .tw-mobile-actions { display: none; }
/* 分类行随可用高度收紧，常用屏幕完整展示；极矮窗口仍可滚动，不显示滚动条占位。 */
#tw-panel .tw-category-list { display: flex; flex-direction: column; gap: 2px; flex: 1 1 auto; min-height: 0; overflow-y: auto; scrollbar-width: none; }
#tw-panel .tw-category-list::-webkit-scrollbar { display: none; }
#tw-panel .tw-category { display: grid; grid-template-columns: 22px minmax(0, 1fr) 24px; align-items: center; gap: 10px; flex: 0 1 40px; width: 100%; min-height: 32px; padding: 4px 10px; color: #e4e3ed; font-size: 14px; text-align: left; }
#tw-panel .tw-category > .tw-icon { width: 22px; height: 22px; color: #a6a5bc; }
#tw-panel .tw-category-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#tw-panel .tw-category:hover { background: #22232e; }
#tw-panel .tw-category[aria-pressed="true"] { border-color: #3d3055; background: #30283f; }
#tw-panel .tw-category[aria-pressed="true"] > .tw-icon { color: #d484f3; }
#tw-panel .tw-count { display: grid; min-width: 22px; height: 24px; place-items: center; border-radius: 6px; background: #232431; color: #ccc9e5; font-size: 12px; font-variant-numeric: tabular-nums; }
#tw-panel .tw-category[aria-pressed="true"] .tw-count { background: #3b3252; }
#tw-panel .tw-divider { flex-shrink: 0; width: 100%; margin: 8px 0; border: 0; border-top: 1px solid var(--tw-line); }
/* 导入与导出共用左对齐和内边距，使两行图标、文字及按钮边界保持一致。 */
#tw-panel .tw-import-footer { display: grid; grid-template-columns: minmax(0, 1fr); flex: 0 0 auto; padding-top: 12px; }
#tw-panel .tw-import-footer button { justify-content: flex-start; height: 44px; padding-left: 18px; border: 1px solid #7855b9; border-radius: 10px; background: #623da9; color: #f4eaff; }
#tw-panel .tw-import-footer .tw-export-all { grid-column: 1 / -1; margin-top: 8px; border-color: var(--tw-line); border-radius: 10px; background: #24232e; }
/* 列表独立滚动，选中后的操作栏停在列表底部，并为最后一张卡片保留完整空间。 */
#tw-panel .tw-library { display: flex; flex-direction: column; container-type: inline-size; min-width: 0; min-height: 0; margin-bottom: 24px; padding: 24px; overflow: hidden; border: 1px solid var(--tw-line); border-top: 0; border-radius: 0 0 16px 16px; background: #14171e; }
#tw-panel .tw-library-content { flex: 1; min-height: 0; overflow: auto; padding: 2px; }
#tw-panel .tw-group-bar, #tw-panel .tw-group-tabs, #tw-panel .tw-bulk-actions { display: flex; align-items: center; gap: 8px; }
/* 标签筛选与增删入口共用有边界的容器，明确这一整行属于标签管理。 */
#tw-panel .tw-group-bar { flex-shrink: 0; margin-bottom: 12px; padding: 6px; border: 1px solid var(--tw-line); border-radius: 12px; background: #1b1d26; font-size: 14px; }
#tw-panel .tw-group-tabs { flex: 1; min-width: 0; overflow-x: auto; }
#tw-panel .tw-group-bar button { flex-shrink: 0; min-height: 44px; padding: 8px 12px; border-color: var(--tw-line); }
#tw-panel .tw-group-tabs button { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#tw-panel .tw-group-tabs [aria-pressed="true"] { border-color: var(--tw-accent); background: var(--tw-selected); }
#tw-panel [data-action="toggle-multi"][aria-pressed="true"] { border-color: var(--tw-accent); background: var(--tw-selected); color: var(--tw-accent); }
/* 每个自定义标签自带删除入口，顶部右侧只保留新增与多选开关。 */
#tw-panel .tw-group-tab { display: inline-flex; align-items: center; flex-shrink: 0; border: 1px solid var(--tw-line); border-radius: 9px; }
#tw-panel .tw-group-tab[data-active="true"] { border-color: var(--tw-accent); background: var(--tw-selected); }
#tw-panel .tw-group-tab button { border: 0; }
#tw-panel .tw-group-tab [data-delete-group] { min-height: 32px; padding: 6px; color: var(--tw-muted); }
#tw-panel [data-delete-group] .tw-icon { width: 16px; height: 16px; }
#tw-panel .tw-bulk-actions { flex-shrink: 0; margin-top: 12px; border-radius: 10px; background: #14171e; box-shadow: 0 -8px 20px #0003; font-size: 13px; }
/* 常用动作收进同一条工具栏，删除单独放在右侧，避免按钮散落成多行。 */
#tw-panel .tw-bulk-main { display: grid; grid-template-columns: auto minmax(90px, 1fr) minmax(96px, 1fr) auto; align-items: center; gap: 6px; flex: 1; min-width: 0; padding: 6px; border: 1px solid var(--tw-line); border-radius: 10px; background: #1b1d26; }
#tw-panel .tw-bulk-selection { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 4px; white-space: nowrap; cursor: pointer; }
#tw-panel .tw-bulk-actions :is(button, select), #tw-panel [data-action="remove-image"] { min-height: 44px; padding: 6px 10px; border: 1px solid var(--tw-line); border-radius: 8px; background: #24232e; }
#tw-panel .tw-bulk-actions select { width: 100%; min-width: 0; text-overflow: ellipsis; }
#tw-panel .tw-bulk-actions button { gap: 6px; white-space: nowrap; }
#tw-panel .tw-bulk-picker { display: flex; align-items: center; gap: 6px; min-width: 0; padding: 0 8px; border: 1px solid var(--tw-line); border-radius: 8px; background: #24232e; }
#tw-panel .tw-bulk-picker select { padding: 6px 0; border: 0; background: transparent; }
#tw-panel .tw-bulk-actions .tw-bulk-delete { flex-shrink: 0; gap: 6px; border-color: #45303e; background: #241e26; color: #d77687; }
#tw-panel .tw-bulk-actions .tw-icon { width: 18px; height: 18px; }
/* 应用入口用紫色强调，图标放在原生选择器外侧，保留键盘和触屏的系统菜单行为。 */
#tw-panel .tw-bulk-apply-picker { border-color: #7855b9; background: #392957; color: #eadcff; }
/* 按列表自身宽度切换为两行，不让桌面窄中栏或手机把按钮挤出容器。 */
@container (max-width: 480px) {
    #tw-panel .tw-bulk-actions { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; gap: 6px; padding: 6px; border: 1px solid var(--tw-line); border-radius: 10px; background: #1b1d26; }
    #tw-panel .tw-bulk-main { display: contents; }
    #tw-panel .tw-bulk-selection { grid-column: 1; grid-row: 1; }
    #tw-panel .tw-bulk-apply-picker { grid-column: 2 / 4; grid-row: 1; }
    #tw-panel .tw-bulk-group-picker { grid-column: 1; grid-row: 2; }
    #tw-panel [data-bulk="export"] { grid-column: 2; grid-row: 2; }
    #tw-panel .tw-bulk-delete { grid-column: 3; grid-row: 2; }
}
#tw-panel .tw-library-status { margin: 0 0 12px; overflow-wrap: anywhere; color: var(--tw-accent); font-size: 14px; }
#tw-panel .tw-library-status:empty { display: none; }
#tw-panel .tw-library-status[data-error="true"] { color: #ef99a7; }
#tw-panel .tw-selection-count { color: var(--tw-muted); }
#tw-panel .tw-garment-entry { position: relative; min-width: 0; }
#tw-panel .tw-item-check { position: absolute; z-index: 1; top: 4px; right: 4px; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 8px; background: #14171ee6; opacity: 0; pointer-events: none; cursor: pointer; }
/* 默认隐藏勾选入口；键盘聚焦、多选模式或鼠标悬停时才显示，触屏通过多选开关进入。 */
#tw-panel .tw-library[data-multi-select="true"] .tw-item-check, #tw-panel .tw-garment-entry:focus-within .tw-item-check { opacity: 1; pointer-events: auto; }
@media (hover: hover) {
    #tw-panel .tw-garment-entry:hover .tw-item-check { opacity: 1; pointer-events: auto; }
}
#tw-panel :is(.tw-item-check, .tw-bulk-actions) input { width: 20px; height: 20px; accent-color: #b184e8; cursor: pointer; }
#tw-panel .tw-garment-entry[data-checked="true"] .tw-garment-card { outline: 2px solid var(--tw-accent); outline-offset: -2px; }
#tw-panel .tw-items { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(160px, 100%), 1fr)); gap: 16px; width: 100%; }
#tw-panel .tw-garment-card { display: grid; grid-template-columns: minmax(0, 1fr); justify-content: stretch; justify-items: stretch; align-content: start; gap: 10px; width: 100%; padding: 10px; overflow: hidden; border-color: var(--tw-line); background: #1c1e28; text-align: left; }
#tw-panel .tw-garment-card[aria-pressed="true"] { border-color: var(--tw-accent); background: var(--tw-selected); }
#tw-panel .tw-garment-card img { width: 100%; aspect-ratio: 1; object-fit: contain; border-radius: 6px; background: #13151c; }
#tw-panel .tw-garment-card > .tw-icon { width: 100%; height: auto; aspect-ratio: 1; padding: 30px; color: var(--tw-muted); }
#tw-panel .tw-garment-card span { overflow-wrap: anywhere; }
#tw-panel .tw-garment-card small { color: var(--tw-accent); font-size: 13px; }
#tw-panel .tw-library[data-layout="list"] .tw-items { grid-template-columns: minmax(0, 1fr); }
/* 列表模式为右侧复选框留位，避免长服装名称被批量选择入口遮挡。 */
#tw-panel .tw-library[data-layout="list"] .tw-garment-card { grid-template-columns: 64px minmax(0, 1fr); align-items: center; padding-right: 54px; }
#tw-panel .tw-library[data-layout="list"] .tw-garment-card :is(img, .tw-icon) { grid-row: 1 / 3; width: 64px; height: 64px; padding: 0; }
#tw-panel .tw-empty { display: grid; justify-items: center; align-content: center; gap: 18px; padding: 24px 0; color: #a6a7ba; text-align: center; }
#tw-panel .tw-empty > .tw-icon { width: 100px; height: 100px; color: #5c6072; stroke-width: 1.3; overflow: visible; }
#tw-panel h2 { font-size: 23px; font-weight: 500; }
#tw-panel .tw-details { display: flex; flex-direction: column; gap: 14px; min-width: 0; min-height: 0; padding: 20px 18px 36px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #393444 transparent; }
#tw-panel .tw-wearer-modes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; flex: 0 0 auto; }
#tw-panel .tw-wearer-modes button { min-height: 44px; padding: 8px 12px; border-color: var(--tw-line); background: #1c1e28; }
#tw-panel .tw-wearer-modes button[aria-pressed="true"] { border-color: #7855b9; background: var(--tw-selected); color: var(--tw-accent); }
#tw-panel .tw-wearer-modes span { color: var(--tw-muted); font-size: 13px; }
#tw-panel .tw-preview { display: flex; flex: 0 0 auto; flex-direction: column; align-items: center; justify-content: center; gap: 20px; height: clamp(220px, 34dvh, 346px); border: 1px solid #574274; border-radius: 11px; background: #1d202b; color: #b7b4cb; }
#tw-panel .tw-preview > .tw-icon { width: 84px; height: 84px; color: #9290ad; stroke-width: 1.6; }
#tw-panel .tw-preview img { width: 100%; height: 100%; object-fit: contain; border-radius: inherit; }
#tw-panel .tw-details :is(input, select, textarea) { width: 100%; min-width: 0; padding: 8px 10px; border: 1px solid #494052; border-radius: 8px; background: #15171f; box-shadow: none; }
#tw-panel .tw-details textarea { min-height: 200px; resize: vertical; }
/* 标签归类放在独立的标签页，继续使用同一保存入口和原有标签标识。 */
#tw-panel .tw-garment-tag { display: grid; gap: 10px; padding: 10px 0; }
/* 描述类型与生成按钮共享一行，选中的类型决定本次请求使用哪份已保存提示词。 */
#tw-panel .tw-description-actions { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; margin-bottom: 12px; }
#tw-panel .tw-describe { min-height: 44px; padding: 8px 14px; border-color: #494052; background: #24232e; }
#tw-panel .tw-garment-status { margin: 0; overflow-wrap: anywhere; color: var(--tw-accent); font-size: 14px; }
#tw-panel .tw-garment-status[data-error="true"] { color: #ef99a7; }
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
/* 设置使用独立原生模态框，浏览器负责焦点限制和 Escape；内容区独立滚动以容纳后续设置。 */
#tw-panel #tw-settings { inset: 0; width: min(920px, calc(100% - 64px)); height: min(680px, calc(100% - 64px)); max-width: none; max-height: none; margin: auto; padding: 0; overflow: hidden; border: 1px solid #494052; border-radius: 16px; background: #181921; color: var(--tw-ink); font: inherit; text-align: left; }
#tw-panel #tw-settings[open] { display: grid; grid-template-rows: auto minmax(0, 1fr); }
#tw-panel #tw-settings::backdrop { background: rgb(0 0 0 / 55%); }
#tw-panel .tw-settings-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 24px; border-bottom: 1px solid var(--tw-line); }
#tw-panel .tw-settings-body { display: grid; grid-template-columns: 180px minmax(0, 1fr); min-height: 0; }
#tw-panel .tw-settings-nav { display: flex; flex-direction: column; gap: 6px; padding: 16px 12px; overflow-y: auto; border-right: 1px solid var(--tw-line); }
#tw-panel .tw-settings-nav button { flex: 0 0 auto; justify-content: flex-start; min-height: 48px; padding: 10px 14px; color: var(--tw-muted); }
#tw-panel .tw-settings-nav button[aria-pressed="true"] { background: var(--tw-selected); color: var(--tw-accent); }
#tw-panel .tw-settings-content { min-width: 0; min-height: 0; padding: 28px; overflow-y: auto; overscroll-behavior: contain; }
#tw-panel .tw-settings-content h3 { margin-bottom: 24px; font-size: 20px; font-weight: 600; }
/* 表单使用纵向字段，双列参数在窄屏自动换行，不沿用旧的服装视图与分类行。 */
#tw-panel .tw-api-form, #tw-panel .tw-api-fields, #tw-panel .tw-api-custom { display: grid; gap: 20px; min-width: 0; margin: 0; padding: 0; border: 0; }
#tw-panel .tw-api-field { display: grid; gap: 8px; min-width: 0; }
#tw-panel .tw-api-field > :is(span, label):first-child { color: #c6c3d6; font-size: 14px; }
#tw-panel .tw-api-field :is(input, select) { width: 100%; min-width: 0; min-height: 44px; padding: 10px 12px; border: 1px solid #494052; border-radius: 9px; background: #15171f; box-shadow: none; color-scheme: dark; }
#tw-panel .tw-api-field input::placeholder { color: var(--tw-muted); opacity: 1; }
#tw-panel .tw-api-input-action { display: flex; align-items: flex-start; gap: 8px; min-width: 0; }
#tw-panel .tw-api-input-action input { flex: 1 1 0; }
#tw-panel .tw-api-form button { flex: 0 0 auto; min-height: 44px; padding: 8px 14px; border-color: #494052; background: #24232e; }
/* 模型列表放在表单流内，避免被设置内容区裁切；长列表只滚动自身，不遮住后续参数。 */
#tw-panel .tw-model-picker { display: grid; flex: 1 1 0; align-content: start; gap: 8px; min-width: 0; }
#tw-panel .tw-model-control { display: flex; align-items: center; min-width: 0; border: 1px solid #494052; border-radius: 9px; background: #15171f; }
#tw-panel .tw-model-control:focus-within { border-color: var(--tw-accent); }
#tw-panel .tw-model-control input { border: 0; background: transparent; }
#tw-panel .tw-model-control input:focus-visible { outline-offset: -3px; }
#tw-panel .tw-model-control button { width: 40px; min-height: 40px; padding: 8px; border: 0; background: transparent; color: var(--tw-muted); }
#tw-panel .tw-model-control .tw-icon { width: 18px; height: 18px; }
#tw-panel .tw-model-options { display: grid; gap: 4px; max-height: 220px; padding: 6px; overflow-y: auto; overscroll-behavior: contain; border: 1px solid #494052; border-radius: 10px; background: #1c1b26; scrollbar-width: thin; scrollbar-color: #51425f transparent; }
#tw-panel .tw-model-options button { justify-content: flex-start; width: 100%; min-height: 40px; padding: 10px; border: 0; background: transparent; text-align: left; overflow-wrap: anywhere; }
#tw-panel .tw-model-options button:is(:hover, [aria-selected="true"]) { background: var(--tw-selected); color: var(--tw-accent); }
#tw-panel .tw-model-empty { padding: 10px; color: var(--tw-muted); font-size: 14px; }
#tw-panel .tw-model-empty[data-error="true"] { color: #ef99a7; }
#tw-panel .tw-api-parameters { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr)); gap: 16px; }
#tw-panel .tw-api-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 12px; }
#tw-panel .tw-api-actions .tw-api-save { border-color: #7855b9; background: #623da9; color: #f4eaff; }
#tw-panel .tw-api-status { min-height: 24px; margin: 0; overflow-wrap: anywhere; color: var(--tw-muted); font-size: 14px; }
#tw-panel .tw-api-status[data-error="true"] { color: #ef99a7; }
/* 内容类型和注入位置使用原生单选卡，沿用紫色选中态，同时保留键盘切换能力。 */
#tw-panel .tw-send-form { display: grid; gap: 24px; min-width: 0; }
#tw-panel .tw-send-group { min-width: 0; margin: 0; padding: 0; border: 0; }
#tw-panel .tw-send-group legend { margin: 0 0 12px; padding: 0; color: #c6c3d6; font: inherit; font-size: 14px; }
#tw-panel .tw-send-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr)); gap: 10px; }
#tw-panel .tw-send-choice { display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 12px; border: 1px solid #494052; border-radius: 9px; background: #15171f; cursor: pointer; }
#tw-panel .tw-send-choice:has(input:checked) { border-color: #7855b9; background: var(--tw-selected); color: var(--tw-accent); }
#tw-panel .tw-send-choice input { flex: 0 0 auto; width: 18px; height: 18px; accent-color: var(--tw-accent); }
#tw-panel .tw-send-actions { display: flex; justify-content: flex-end; }
#tw-panel .tw-send-actions button { min-height: 44px; padding: 8px 18px; border-color: #7855b9; background: #623da9; color: #f4eaff; }
#tw-panel .tw-send-status { min-height: 24px; margin: 0; overflow-wrap: anywhere; color: var(--tw-muted); font-size: 14px; }
#tw-panel .tw-send-status[data-error="true"] { color: #ef99a7; }
/* 两个角色的模板采用同一编辑布局，较长模板在文本框中编辑，不挤占导航空间。 */
#tw-panel .tw-template-form, #tw-panel .tw-template-form label { display: grid; gap: 10px; min-width: 0; }
#tw-panel .tw-template-form { gap: 24px; }
#tw-panel .tw-template-form small, #tw-panel .tw-template-hint { color: var(--tw-muted); font-size: 13px; }
#tw-panel .tw-template-form textarea { width: 100%; min-height: 150px; padding: 12px; resize: vertical; border: 1px solid #494052; border-radius: 9px; background: #15171f; color: inherit; font: inherit; line-height: 1.6; box-shadow: none; }
#tw-panel .tw-template-hint { margin: 0; overflow-wrap: anywhere; line-height: 1.8; }
#tw-panel .tw-template-status { min-height: 24px; margin: 0; color: var(--tw-muted); font-size: 14px; }
#tw-panel .tw-template-status[data-error="true"] { color: #ef99a7; }
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
    #tw-panel .tw-category-list { flex-direction: row; gap: 6px; min-width: 0; padding: 3px; overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain; scrollbar-width: none; scroll-behavior: auto; }
    #tw-panel .tw-category { display: inline-flex; flex: 0 0 auto; gap: 8px; width: auto; min-height: 44px; padding: 8px 12px; font-size: 14px; }
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
    #tw-panel .tw-mobile-actions { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(96px, 1.3fr); gap: 6px; padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid var(--tw-line); background: #181921; }
    #tw-panel .tw-mobile-actions button { gap: 4px; min-height: 48px; padding: 8px 6px; border-color: #393544; background: #23212e; color: #d3c9e4; font-size: 14px; }
    #tw-panel .tw-mobile-actions .tw-mobile-import { border-color: #7855b9; background: #623da9; color: #f4eaff; }
    #tw-panel .tw-mobile-actions .tw-icon { width: 20px; height: 20px; }
    /* 紧凑屏幕给设置完整可用空间，分组横排，避免侧栏挤压表单。 */
    #tw-panel #tw-settings { width: 100%; height: 100%; margin: 0; padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px); border: 0; border-radius: 0; }
    #tw-panel .tw-settings-header { padding: 10px 16px; }
    #tw-panel .tw-settings-body { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); }
    #tw-panel .tw-settings-nav { flex-direction: row; padding: 8px 12px; overflow-x: auto; border-right: 0; border-bottom: 1px solid var(--tw-line); }
    #tw-panel .tw-settings-content { padding: 20px 16px; }
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
let settingsPanel;
let apiForm;
let sendForm;
let apiRequest;
let apiModels = [];
let modelListMessage = '请先获取模型，或手动输入';
let modelListError = false;
let activeModelIndex = -1;
let opener;
/** @type {Map<string, WardrobeItem>} 已在存档入口校验的服装表，按 ID 直接查找。 */
let garments = new Map();
/** @type {Map<string, string>} 用户创建的标签，空标识保留给未分组。 */
let garmentGroups = new Map();
let currentGroup = '*';
let multiSelectMode = false;
const checkedGarmentIds = new Set();
let visibleGarmentIds = new Set();
let selectedGarmentId = null;
let currentCategory = 'all';
let selectedWearer = 'char';
let wardrobeTemplates = { user: { ...DEFAULT_TEMPLATES.user }, char: { ...DEFAULT_TEMPLATES.char }, image: { ...DEFAULT_TEMPLATES.image } };
let descriptionPrompts = { ...DEFAULT_DESCRIPTION_PROMPTS };
let sendSettings = { content_type: 'text', position: 'user_end' };
let descriptionRequest;
let savedApiSettings = { mode: 'host' };
const subscriptions = [];
const imageReaders = new Set();
let exportUrl;

/**
 * 创建衣柜并加载服装与配置；只注册请求注入监听，不主动发送生成请求。
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
    settingsPanel = panel.querySelector('#tw-settings');
    apiForm = settingsPanel.querySelector('.tw-api-form');
    sendForm = settingsPanel.querySelector('.tw-send-form');
    loadApiSettings();
    loadSendSettings();
    loadWardrobeTemplates();
    loadDescriptionPrompts();
    loadGarments();

    menuEntry = hostDocument.createElement('button');
    menuEntry.id = 'tw-menu-entry';
    menuEntry.type = 'button';
    menuEntry.className = 'list-group-item flex-container flexGap5';
    menuEntry.innerHTML = '<i class="fa-solid fa-shirt" aria-hidden="true"></i><span>衣柜插件</span>';
    // 追加入口以保持酒馆已有菜单的顺序。
    menu.append(menuEntry);
    menuEntry.addEventListener('click', openWardrobe);
    panel.querySelector('[data-action="close"]').addEventListener('click', closeWardrobe);
    panel.querySelector('[data-action="open-settings"]').addEventListener('click', openSettings);
    settingsPanel.querySelector('[data-action="close-settings"]').addEventListener('click', closeSettings);
    settingsPanel.querySelector('.tw-settings-nav').addEventListener('click', selectSettingsPage);
    apiForm.addEventListener('submit', saveApiSettings);
    sendForm.addEventListener('submit', saveSendSettings);
    sendForm.addEventListener('change', clearSendStatus);
    for (const form of settingsPanel.querySelectorAll('.tw-template-form[data-template-owner]')) {
        form.addEventListener('submit', saveWardrobeTemplate);
        form.addEventListener('input', clearTemplateStatus);
    }
    const descriptionForm = settingsPanel.querySelector('.tw-description-form');
    descriptionForm.addEventListener('submit', saveDescriptionPrompts);
    descriptionForm.addEventListener('input', clearTemplateStatus);
    apiForm.elements.mode.addEventListener('change', updateApiMode);
    apiForm.elements.apiurl.addEventListener('input', clearApiUrlValidity);
    apiForm.elements.model.addEventListener('focus', openModelOptions);
    apiForm.elements.model.addEventListener('input', openModelOptions);
    settingsPanel.addEventListener('keydown', navigateModelOptions);
    apiForm.querySelector('[data-action="toggle-models"]').addEventListener('click', toggleModelOptions);
    apiForm.querySelector('#tw-api-models').addEventListener('click', selectModelOption);
    apiForm.querySelector('.tw-model-picker').addEventListener('focusout', leaveModelOptions);
    settingsPanel.addEventListener('click', dismissModelOptions);
    apiForm.querySelector('[data-action="toggle-api-key"]').addEventListener('click', toggleApiKey);
    apiForm.querySelector('[data-api-action="models"]').addEventListener('click', requestApi);
    apiForm.querySelector('[data-api-action="test"]').addEventListener('click', requestApi);
    settingsPanel.addEventListener('close', stopApiRequest);
    for (const button of panel.querySelectorAll('[data-action="import"]')) button.addEventListener('click', openImageImport);
    panel.querySelector('.tw-image-import').addEventListener('change', importGarments);
    panel.querySelector('.tw-items').addEventListener('click', selectGarment);
    panel.querySelector('.tw-items').addEventListener('change', checkGarment);
    panel.querySelector('.tw-select-all').addEventListener('change', selectAllGarments);
    panel.querySelector('.tw-bulk-actions').addEventListener('click', handleBulkAction);
    panel.querySelector('.tw-bulk-apply').addEventListener('change', handleBulkAction);
    panel.querySelector('.tw-bulk-group').addEventListener('change', moveCheckedGarments);
    panel.querySelector('.tw-group-tabs').addEventListener('click', selectGarmentGroup);
    panel.querySelector('.tw-group-tabs').addEventListener('click', deleteGarmentGroup);
    panel.querySelector('[data-action="add-group"]').addEventListener('click', addGarmentGroup);
    panel.querySelector('[data-action="toggle-multi"]').addEventListener('click', toggleMultiSelect);
    for (const button of panel.querySelectorAll('[data-action="export-all"], [data-action="export-one"], [data-action="delete-one"], [data-action="remove-image"]')) {
        button.addEventListener('click', handleGarmentAction);
    }
    panel.querySelector('[data-action="save-garment"]').addEventListener('click', saveSelectedGarment);
    panel.querySelector('[data-action="apply"]').addEventListener('click', applySelectedGarment);
    panel.querySelector('[data-action="describe"]').addEventListener('click', generateGarmentDescription);
    panel.querySelector('.tw-wearer-modes').addEventListener('click', selectWearer);
    panel.querySelector('.tw-category-list').addEventListener('click', selectCategory);
    panel.querySelector('.tw-mobile-filter select').addEventListener('change', selectCategoryOption);
    panel.querySelector('[data-action="toggle-details"]').addEventListener('click', toggleMobileDetails);
    panel.querySelector('.tw-view-modes').addEventListener('click', selectView);
    panel.querySelector('.tw-detail-tabs').addEventListener('click', selectDetail);
    panel.addEventListener('close', restoreFocus);
    window.addEventListener('pagehide', destroyWardrobe, { once: true });
    appendInexistentScriptButtons([{ name: '衣柜插件', visible: true }]);
    subscriptions.push(eventOn(getButtonEvent('衣柜插件'), openWardrobe));
    subscriptions.push(eventOn(tavern_events.CHAT_CHANGED, refreshWardrobe));
    subscriptions.push(eventMakeLast(tavern_events.CHAT_COMPLETION_PROMPT_READY, injectWardrobeContent));
    refreshWardrobe();
    console.info('[衣柜插件] 面板已就绪。');
}

/**
 * 打开原生对话框，交由浏览器处理模态焦点和 Escape 关闭。
 * @returns {void} 无返回值。
 */
function openWardrobe() {
    opener = hostDocument.activeElement;
    multiSelectMode = false;
    checkedGarmentIds.clear();
    setMobileDetails(false);
    refreshWardrobe();
    if (!panel.open) panel.showModal();
}

/**
 * 关闭当前面板；入口焦点由关闭事件恢复。
 * @returns {void} 无返回值。
 */
function closeWardrobe() {
    stopDescriptionRequest();
    closeSettings();
    panel.close();
}

/**
 * 在衣柜上方打开独立设置面板，保留衣柜的分类、详情和浏览位置。
 * @returns {void} 无返回值。
 */
function openSettings() {
    if (!settingsPanel.open) settingsPanel.showModal();
}

/**
 * 关闭设置并交由原生对话框恢复齿轮按钮焦点；关闭衣柜时一并使用此入口。
 * @returns {void} 无返回值。
 */
function closeSettings() {
    closeModelOptions();
    stopApiRequest();
    if (settingsPanel.open) settingsPanel.close();
}

/**
 * 从脚本变量读取服装，入口只接受当前数据结构，避免把不完整记录带入发送流程。
 * @returns {void} 无返回值。
 */
function loadGarments() {
    const saved = getVariables({ type: 'script' });
    const data = parseWardrobeData({ items: saved.wardrobe_items ?? [], groups: saved.wardrobe_groups ?? [] });
    garments = data.items;
    garmentGroups = data.groups;
    const selections = readWearerSelections();
    selectedGarmentId = selections.char.values().next().value ?? selections.user.values().next().value ?? garments.keys().next().value ?? null;
}

/**
 * 在存档或文件入口一次性校验数据；兼容没有标签字段的旧服装，拒绝不完整导入。
 * @param {unknown} data 待校验的衣柜数据。
 * @returns {{items: Map<string, WardrobeItem>, groups: Map<string, string>}} 可直接用于内部操作的数据。
 */
function parseWardrobeData(data) {
    if (!data || !Array.isArray(data.items) || !Array.isArray(data.groups)) throw new Error('服装文件格式错误，需要 items 和 groups 数组。');
    const groups = new Map();
    for (const group of data.groups) {
        if (!group || typeof group.id !== 'string' || !group.id || group.id === '*' || groups.has(group.id) ||
            typeof group.name !== 'string' || !group.name.trim()) throw new Error('标签格式错误或标识重复。');
        groups.set(group.id, group.name.trim());
    }
    const items = new Map();
    for (const item of data.items) {
        if (!item || typeof item.id !== 'string' || !item.id || typeof item.name !== 'string' || !item.name.trim() ||
            typeof item.description !== 'string' || typeof item.image !== 'string' ||
            items.has(item.id) || (item.image && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(item.image)) ||
            (item.groupId !== undefined && typeof item.groupId !== 'string')) {
            throw new Error('服装数据缺少名称、描述、有效图片，或标识重复。');
        }
        items.set(item.id, {
            id: item.id, name: item.name, description: item.description, image: item.image,
            category: GARMENT_CATEGORIES.has(item.category) ? item.category : 'other',
            groupId: groups.has(item.groupId) ? item.groupId : '',
        });
    }
    return { items, groups };
}

/**
 * 打开系统图片选择器，文件校验在真正读取文件时完成。
 * @returns {void} 无返回值。
 */
function openImageImport() {
    panel.querySelector('.tw-image-import').click();
}

/**
 * 将图片或导出的衣柜文件批量合并，全部读取成功后一次保存，避免部分失败覆盖已有服装。
 * @param {Event} event 图片选择器变化事件。
 * @returns {Promise<void>} 图片读取和保存结束后完成。
 */
async function importGarments(event) {
    const input = event.currentTarget;
    if (!input.files.length) return;
    try {
        const next = new Map(garments);
        const groups = new Map(garmentGroups);
        const groupNames = new Map(Array.from(groups, ([id, name]) => [name, id]));
        const importGroup = currentGroup === '*' ? '' : currentGroup;
        let selectedId;
        for (const file of input.files) {
            if (/\.json$/i.test(file.name) || file.type === 'application/json') {
                const exported = JSON.parse(await file.text());
                if (exported?.format !== 'tw-wardrobe' || exported.version !== 1) throw new Error('请选择本衣柜导出的 JSON 文件。');
                const data = parseWardrobeData(exported);
                const groupIds = new Map();
                // 用名称合并已有标签，服装重建标识，导入备份不会覆盖当前衣柜的同名服装。
                for (const [oldId, name] of data.groups) {
                    let id = groupNames.get(name);
                    if (!id) {
                        id = window.parent.crypto.randomUUID();
                        groups.set(id, name);
                        groupNames.set(name, id);
                    }
                    groupIds.set(oldId, id);
                }
                for (const item of data.items.values()) {
                    selectedId = window.parent.crypto.randomUUID();
                    next.set(selectedId, { ...item, id: selectedId, groupId: groupIds.get(item.groupId) ?? importGroup });
                }
            } else {
                const image = await readGarmentImage(file);
                selectedId = window.parent.crypto.randomUUID();
                next.set(selectedId, { id: selectedId, name: file.name.replace(/\.[^.]+$/, '') || '未命名服装', category: 'other', description: '', image, groupId: importGroup });
            }
        }
        commitGarments(next, selectedId ?? selectedGarmentId, groups);
        currentGroup = '*';
        updateCategory('all');
        setLibraryStatus('已导入');
        if (selectedId) showGarmentDescription();
    } catch (error) {
        if (root.isConnected) {
            setGarmentStatus(String(error), true);
            setLibraryStatus(String(error), true);
            toastr.error(String(error), '服装导入失败');
        }
    } finally {
        input.value = '';
    }
}

/**
 * 校验并读取图片为数据地址，保留原图供多模态请求使用；卸载时可中止读取。
 * @param {File} file 用户选择的 PNG、JPEG 或 WebP 文件。
 * @returns {Promise<string>} 图片数据地址。
 */
function readGarmentImage(file) {
    if (!IMAGE_TYPES.has(file.type)) throw new Error('仅支持 PNG、JPEG、WebP 图片。');
    return new Promise((resolve, reject) => {
        const reader = new window.parent.FileReader();
        imageReaders.add(reader);
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error(`无法读取图片：${file.name}`));
        reader.onabort = () => reject(new Error('图片读取已取消。'));
        reader.onloadend = () => imageReaders.delete(reader);
        reader.readAsDataURL(file);
    });
}

/**
 * 保存成功后才更新内存和界面，存储失败时继续保留原有服装记录。
 * @param {Map<string, WardrobeItem>} next 待保存的完整服装表。
 * @param {string|null} selectedId 保存后选中的服装标识。
 * @param {Map<string, string>} groups 同次保存的标签。
 * @returns {void} 无返回值。
 */
function commitGarments(next, selectedId, groups = garmentGroups) {
    insertOrAssignVariables({ wardrobe_items: Array.from(next.values()), wardrobe_groups: Array.from(groups, ([id, name]) => ({ id, name })) }, { type: 'script' });
    if (selectedId !== selectedGarmentId || next.get(selectedId)?.image !== garments.get(selectedGarmentId)?.image) stopDescriptionRequest();
    garments = next;
    garmentGroups = groups;
    if (currentGroup !== '*' && currentGroup && !groups.has(currentGroup)) currentGroup = '';
    selectedGarmentId = selectedId;
    refreshWardrobe();
}

/**
 * 把指定服装和对应标签打包成可重新导入的文件，图片以原始数据地址保存在文件内。
 * @param {Iterable<string>} ids 待导出的服装标识。
 * @param {boolean} includeEmptyGroups 是否连同空标签一起备份。
 * @returns {void} 无返回值。
 */
function exportGarments(ids, includeEmptyGroups = false) {
    const items = [];
    const groupIds = new Set();
    for (const id of ids) {
        const item = garments.get(id);
        items.push(item);
        if (item.groupId) groupIds.add(item.groupId);
    }
    if (!items.length) throw new Error('没有可导出的服装。');
    const groups = Array.from(includeEmptyGroups ? garmentGroups.keys() : groupIds, id => ({ id, name: garmentGroups.get(id) }));
    const data = { format: 'tw-wardrobe', version: 1, groups, items };
    const blob = new window.parent.Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    // 保留最近一次下载地址供浏览器异步读取，下次导出或卸载时释放，不引入延迟定时器。
    if (exportUrl) window.parent.URL.revokeObjectURL(exportUrl);
    exportUrl = window.parent.URL.createObjectURL(blob);
    const link = hostDocument.createElement('a');
    link.href = exportUrl;
    link.download = `${items.length === 1 ? items[0].name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') : '衣柜'}-${items.length}件.json`;
    link.hidden = true;
    hostDocument.body.append(link);
    try { link.click(); } finally { link.remove(); }
    setLibraryStatus(`已导出 ${items.length} 件服装`);
}

/**
 * 处理全部导出及单件导出、删除、移除图片；导出单件时先保存编辑内容。
 * @param {MouseEvent} event 操作按钮的点击事件。
 * @returns {void} 无返回值。
 */
function handleGarmentAction(event) {
    try {
        const action = event.currentTarget.dataset.action;
        if (action === 'export-all') exportGarments(garments.keys(), true);
        else if (action === 'export-one') {
            if (saveSelectedGarment()) exportGarments([selectedGarmentId]);
        } else if (action === 'delete-one') deleteGarments(new Set([selectedGarmentId]));
        else if (action === 'remove-image') {
            const item = garments.get(selectedGarmentId);
            const selections = readWearerSelections();
            if (sendSettings.content_type !== 'text' && (selections.user.has(item.id) || selections.char.has(item.id))) {
                throw new Error('这件服装正在以图片模式应用，请先取消应用或切换为文字模式，再删除图片。');
            }
            if (!window.parent.confirm('删除这件服装的图片？名称和描述会保留。')) return;
            const saved = saveSelectedGarment();
            if (!saved) return;
            const next = new Map(garments);
            next.set(item.id, { ...saved, image: '' });
            commitGarments(next, item.id);
            setLibraryStatus('图片已删除，名称和描述已保留');
        }
    } catch (error) {
        setLibraryStatus(String(error), true);
        setGarmentStatus(String(error), true);
    }
}

/**
 * 删除指定服装并清理当前聊天的应用选择；其他聊天在读取选择时自动过滤失效标识。
 * @param {Set<string>} ids 待删除的服装标识集合。
 * @returns {void} 无返回值。
 */
function deleteGarments(ids) {
    if (!ids.size || !window.parent.confirm(`删除所选的 ${ids.size} 件服装及其图片？此操作不可撤销。`)) return;
    const next = new Map(garments);
    for (const id of ids) next.delete(id);
    commitGarments(next, next.has(selectedGarmentId) ? selectedGarmentId : next.keys().next().value ?? null);
    if (SillyTavern.getCurrentChatId()) {
        const selections = readWearerSelections();
        insertOrAssignVariables({ wardrobe_selections: { user: Array.from(selections.user), char: Array.from(selections.char) }, wardrobe_active_id: null }, { type: 'chat' });
    }
    setLibraryStatus(`已删除 ${ids.size} 件服装`);
}

/**
 * 新增可持久保存的标签并切换过去，重复名称直接定位已有标签。
 * @returns {void} 无返回值。
 */
function addGarmentGroup() {
    const name = window.parent.prompt('标签名称');
    if (!name?.trim()) return;
    try {
        let id;
        for (const [groupId, label] of garmentGroups) if (label === name.trim()) id = groupId;
        if (!id) {
            id = window.parent.crypto.randomUUID();
            const groups = new Map(garmentGroups);
            groups.set(id, name.trim());
            commitGarments(garments, selectedGarmentId, groups);
        }
        currentGroup = id;
        renderGarmentLibrary();
    } catch (error) { setLibraryStatus(String(error), true); }
}

/**
 * 删除指定标签，仅将其中服装移回未分组；无事件时供内部按当前标签处理。
 * @param {MouseEvent} [event] 标签关闭按钮的点击事件。
 * @returns {void} 无返回值。
 */
function deleteGarmentGroup(event) {
    const button = event?.target.closest('[data-delete-group]');
    if (event && !button) return;
    const groupId = button ? button.dataset.deleteGroup : currentGroup;
    if (!garmentGroups.has(groupId) || !window.parent.confirm(`删除标签“${garmentGroups.get(groupId)}”？其中的服装将移到“未分组”。`)) return;
    try {
        const next = new Map(garments);
        for (const [id, item] of next) if (item.groupId === groupId) next.set(id, { ...item, groupId: '' });
        const groups = new Map(garmentGroups);
        groups.delete(groupId);
        commitGarments(next, selectedGarmentId, groups);
        setLibraryStatus('标签已删除，服装已移到未分组');
    } catch (error) { setLibraryStatus(String(error), true); }
}

/**
 * 切换标签筛选；全选始终只作用于当前标签和分类下可见的服装。
 * @param {MouseEvent} event 标签导航点击事件。
 * @returns {void} 无返回值。
 */
function selectGarmentGroup(event) {
    const button = event.target.closest('[data-group]');
    if (!button) return;
    currentGroup = button.dataset.group;
    checkedGarmentIds.clear();
    renderGarmentLibrary();
}

/**
 * 同步带独立删除入口的标签导航和归类选择器，所有用户文本通过文本节点写入。
 * @returns {void} 无返回值。
 */
function renderGarmentGroups() {
    const tabs = hostDocument.createDocumentFragment();
    for (const [id, name] of [['*', '全部'], ['', '未分组'], ...garmentGroups]) {
        const button = hostDocument.createElement('button');
        button.type = 'button';
        button.dataset.group = id;
        button.textContent = name;
        button.setAttribute('aria-pressed', String(id === currentGroup));
        if (garmentGroups.has(id)) {
            const tab = hostDocument.createElement('span');
            tab.className = 'tw-group-tab';
            tab.dataset.active = String(id === currentGroup);
            const remove = hostDocument.createElement('button');
            remove.type = 'button';
            remove.dataset.deleteGroup = id;
            remove.setAttribute('aria-label', `删除标签${name}`);
            remove.title = `删除标签${name}`;
            remove.innerHTML = icon('close');
            tab.append(button, remove);
            tabs.append(tab);
        } else tabs.append(button);
    }
    panel.querySelector('.tw-group-tabs').replaceChildren(tabs);
    for (const selector of ['.tw-bulk-group', '[name="garment_group"]']) {
        const select = panel.querySelector(selector);
        const value = select.value;
        select.replaceChildren();
        const options = selector === '.tw-bulk-group' ? [['*', '移动到…'], ['', '未分组']] : [['', '未分组']];
        for (const [id, name] of [...options, ...garmentGroups]) {
            const option = hostDocument.createElement('option');
            option.value = id;
            option.textContent = name;
            if (id === '*') option.disabled = true;
            select.append(option);
        }
        select.value = selector === '.tw-bulk-group' ? '*' : (garmentGroups.has(value) ? value : '');
    }
}

/**
 * 切换卡片多选；退出时清空勾选并收起操作栏，保留单件预览和已应用的服装。
 * @returns {void} 无返回值。
 */
function toggleMultiSelect() {
    multiSelectMode = !multiSelectMode;
    if (!multiSelectMode) checkedGarmentIds.clear();
    renderBulkState();
}

/**
 * 勾选独立于预览选择，不因批量勾选在手机上跳入详情页。
 * @param {Event} event 服装复选框变化事件。
 * @returns {void} 无返回值。
 */
function checkGarment(event) {
    const input = event.target.closest('[data-check-garment]');
    if (!input) return;
    if (input.checked) {
        multiSelectMode = true;
        checkedGarmentIds.add(input.dataset.checkGarment);
    }
    else checkedGarmentIds.delete(input.dataset.checkGarment);
    renderBulkState();
}

/**
 * 一次勾选或取消当前筛选结果，隐藏服装不会混入批量操作。
 * @param {Event} event 全选框变化事件。
 * @returns {void} 无返回值。
 */
function selectAllGarments(event) {
    checkedGarmentIds.clear();
    if (event.currentTarget.checked) for (const id of visibleGarmentIds) checkedGarmentIds.add(id);
    renderBulkState();
}

/**
 * 同步多选模式、勾选和底部操作栏显隐，不重建图片，保留勾选时的键盘焦点。
 * @returns {void} 无返回值。
 */
function renderBulkState() {
    const count = checkedGarmentIds.size;
    panel.querySelector('.tw-library').dataset.multiSelect = String(multiSelectMode);
    panel.querySelector('[data-action="toggle-multi"]').setAttribute('aria-pressed', String(multiSelectMode));
    panel.querySelector('.tw-bulk-actions').hidden = count === 0;
    const all = panel.querySelector('.tw-select-all');
    all.checked = count > 0 && count === visibleGarmentIds.size;
    all.indeterminate = count > 0 && count < visibleGarmentIds.size;
    all.disabled = visibleGarmentIds.size === 0;
    panel.querySelector('.tw-selection-count').textContent = `已选 ${count} 件`;
    for (const control of panel.querySelectorAll('[data-bulk], .tw-bulk-group, .tw-bulk-apply')) control.disabled = count === 0;
    for (const input of panel.querySelectorAll('[data-check-garment]')) {
        input.checked = checkedGarmentIds.has(input.dataset.checkGarment);
        const entry = input.closest('.tw-garment-entry');
        entry.dataset.checked = String(input.checked);
        const card = entry.querySelector('[data-garment]');
        card.setAttribute('aria-pressed', String(multiSelectMode ? input.checked : card.dataset.garment === selectedGarmentId));
    }
    for (const button of panel.querySelectorAll('[data-action="export-all"]')) button.disabled = garments.size === 0;
}

/**
 * 统一处理批量按钮和角色下拉菜单，菜单操作后复位，允许连续对同一角色执行操作。
 * @param {MouseEvent|Event} event 批量按钮点击或角色菜单变化事件。
 * @returns {void} 无返回值。
 */
function handleBulkAction(event) {
    const control = event.type === 'change' ? event.currentTarget : event.target.closest('button[data-bulk]');
    if (!control || !checkedGarmentIds.size) return;
    try {
        const action = event.type === 'change' ? control.value : control.dataset.bulk;
        if (action === 'export') exportGarments(checkedGarmentIds);
        else if (action === 'delete') deleteGarments(new Set(checkedGarmentIds));
        else {
            const wearer = action.endsWith('-user') ? 'user' : 'char';
            const removing = action.startsWith('unapply-');
            applyGarments(checkedGarmentIds, wearer, removing);
            renderGarmentLibrary();
            renderWearerState();
            setLibraryStatus(removing ? `已取消 ${wearer === 'user' ? 'USER' : 'Char'} 的 ${checkedGarmentIds.size} 件服装应用` : `已应用 ${checkedGarmentIds.size} 件服装到 ${wearer === 'user' ? 'USER' : 'Char'}`);
        }
    } catch (error) { setLibraryStatus(String(error), true); }
    finally { if (event.type === 'change') control.value = ''; }
}

/**
 * 批量保存前验证每件服装的发送内容，任一不满足时保持两个角色原有选择。
 * @param {Iterable<string>} ids 待处理的服装标识。
 * @param {string} wearer 目标角色 user 或 char。
 * @param {boolean} removing 是否取消应用。
 * @returns {void} 无返回值。
 */
function applyGarments(ids, wearer, removing = false) {
    if (!SillyTavern.getCurrentChatId()) throw new Error('请先打开一个聊天，再应用服装。');
    const selections = readWearerSelections();
    for (const id of ids) {
        if (removing) selections[wearer].delete(id);
        else {
            const item = garments.get(id);
            try { buildWardrobeContent(item, sendSettings); }
            catch (error) { throw new Error(`${item.name}：${error.message}`); }
            selections[wearer].add(id);
        }
    }
    insertOrAssignVariables({ wardrobe_selections: { user: Array.from(selections.user), char: Array.from(selections.char) }, wardrobe_active_id: null }, { type: 'chat' });
}

/**
 * 将已勾选服装移动到选定标签，使用一次存储提交保持列表与存档一致。
 * @param {Event} event 批量标签选择器变化事件。
 * @returns {void} 无返回值。
 */
function moveCheckedGarments(event) {
    try {
        const groupId = event.currentTarget.value;
        const count = checkedGarmentIds.size;
        const next = new Map(garments);
        for (const id of checkedGarmentIds) next.set(id, { ...next.get(id), groupId });
        commitGarments(next, selectedGarmentId);
        setLibraryStatus(`已移动 ${count} 件服装`);
    } catch (error) { setLibraryStatus(String(error), true); }
}

/**
 * 在列表区域报告导入导出及批量操作结果，手机无需进入详情查看。
 * @param {string} message 操作结果。
 * @param {boolean} error 是否为错误。
 * @returns {void} 无返回值。
 */
function setLibraryStatus(message, error = false) {
    const status = panel.querySelector('.tw-library-status');
    status.textContent = message;
    status.dataset.error = String(error);
}

/**
 * 在聊天变量入口归一化 USER 与 Char 选择；旧版单套应用归入 Char，不改变原有穿着归属。
 * @returns {{user: Set<string>, char: Set<string>}} 两个角色的有效服装标识集合。
 */
function readWearerSelections() {
    const selections = { user: new Set(), char: new Set() };
    if (!SillyTavern.getCurrentChatId()) return selections;
    const variables = getVariables({ type: 'chat' });
    const saved = variables.wardrobe_selections;
    if (saved && typeof saved === 'object') {
        for (const wearer of WEARERS) {
            if (!Array.isArray(saved[wearer])) continue;
            for (const id of saved[wearer]) if (garments.has(id)) selections[wearer].add(id);
        }
    } else if (garments.has(variables.wardrobe_active_id)) selections.char.add(variables.wardrobe_active_id);
    return selections;
}

/**
 * 切换当前编辑的所属角色，不覆盖服装描述中尚未保存的修改。
 * @param {MouseEvent} event 角色按钮组点击事件。
 * @returns {void} 无返回值。
 */
function selectWearer(event) {
    const button = event.target.closest('[data-wearer]');
    if (!button) return;
    selectedWearer = button.dataset.wearer;
    renderGarmentLibrary();
    renderWearerState();
    setGarmentStatus('');
}

/**
 * 同步角色选择数量和当前服装的加入或取消入口，多套选择不会替换之前选择的服装。
 * @returns {void} 无返回值。
 */
function renderWearerState() {
    const selections = readWearerSelections();
    for (const button of panel.querySelectorAll('[data-wearer]')) {
        button.setAttribute('aria-pressed', String(button.dataset.wearer === selectedWearer));
        button.querySelector('span').textContent = String(selections[button.dataset.wearer].size);
    }
    panel.querySelector('.tw-apply span').textContent = selections[selectedWearer].has(selectedGarmentId) ? '取消应用' : `应用到${selectedWearer === 'user' ? 'USER' : 'Char'}`;
}

/**
 * 刷新服装列表与详情，在切换聊天或修改服装后同步应用状态。
 * @returns {void} 无返回值。
 */
function refreshWardrobe() {
    renderGarmentLibrary();
    renderGarmentDetails();
}

/**
 * 单次遍历生成当前分类和数量，按 ID 读取选中与应用状态，避免在循环内重复查找服装。
 * @returns {void} 无返回值。
 */
function renderGarmentLibrary() {
    renderGarmentGroups();
    const selected = readWearerSelections()[selectedWearer];
    const counts = new Map();
    const cards = hostDocument.createDocumentFragment();
    visibleGarmentIds = new Set();
    for (const item of garments.values()) {
        if (currentGroup !== '*' && currentGroup !== item.groupId) continue;
        counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
        if (currentCategory !== 'all' && currentCategory !== item.category) continue;
        visibleGarmentIds.add(item.id);
        const entry = hostDocument.createElement('div');
        entry.className = 'tw-garment-entry';
        const label = hostDocument.createElement('label');
        label.className = 'tw-item-check';
        const checkbox = hostDocument.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.checkGarment = item.id;
        checkbox.setAttribute('aria-label', `选择${item.name}`);
        label.append(checkbox);
        const card = hostDocument.createElement('button');
        card.type = 'button';
        card.className = 'tw-garment-card';
        card.dataset.garment = item.id;
        card.setAttribute('aria-pressed', String(item.id === selectedGarmentId));
        if (item.image) {
            const image = hostDocument.createElement('img');
            image.src = item.image;
            image.alt = item.name;
            // 多图列表延迟加载并异步解码缩略图，原图数据仍保留给 AI，不另存放缩略副本。
            image.loading = 'lazy';
            image.decoding = 'async';
            card.append(image);
        } else card.innerHTML = icon('shirt');
        const name = hostDocument.createElement('span');
        name.textContent = item.name;
        card.append(name);
        if (selected.has(item.id)) {
            const badge = hostDocument.createElement('small');
            badge.textContent = '已应用';
            card.append(badge);
        }
        entry.append(label, card);
        cards.append(entry);
    }
    // 删除、移动或切换筛选后移除不可见的勾选，避免用户误操作当前看不到的服装。
    for (const id of checkedGarmentIds) if (!visibleGarmentIds.has(id)) checkedGarmentIds.delete(id);
    const visible = visibleGarmentIds.size;
    const list = panel.querySelector('.tw-items');
    list.replaceChildren(cards);
    list.hidden = visible === 0;
    panel.querySelector('.tw-library').dataset.hasItems = String(visible !== 0);
    panel.querySelector('.tw-empty').hidden = visible !== 0;
    for (const button of panel.querySelectorAll('[data-category]')) {
        button.querySelector('.tw-count').textContent = String(button.dataset.category === 'all' ? Array.from(counts.values()).reduce((sum, count) => sum + count, 0) : counts.get(button.dataset.category) ?? 0);
    }
    panel.querySelector('#tw-empty-title').textContent = currentCategory === 'all' ? '这里还没有服装' : currentCategory === 'favorites' ? '还没有收藏的服装' : currentCategory === 'recent' ? '还没有最近使用的服装' : `暂无${CATEGORY_LABELS.get(currentCategory)}`;
    renderBulkState();
}

/**
 * 根据当前选中服装填充可编辑详情，并显示当前聊天的应用或取消应用入口。
 * @returns {void} 无返回值。
 */
function renderGarmentDetails() {
    const item = garments.get(selectedGarmentId);
    const preview = panel.querySelector('.tw-preview');
    preview.replaceChildren();
    if (item?.image) {
        const image = hostDocument.createElement('img');
        image.src = item.image;
        image.alt = item.name;
        preview.append(image);
    } else {
        preview.innerHTML = icon('hanger');
        const title = hostDocument.createElement('span');
        title.textContent = item?.name ?? '未选择服装';
        preview.append(title);
    }
    panel.querySelector('[name="garment_name"]').value = item?.name ?? '';
    panel.querySelector('[name="garment_category"]').value = item?.category ?? 'other';
    panel.querySelector('[name="garment_group"]').value = item?.groupId ?? '';
    panel.querySelector('[name="garment_description"]').value = item?.description ?? '';
    panel.querySelector('#tw-garment-image-state').textContent = item ? (item.image ? '已导入' : '无图片') : '—';
    setDescriptionBusy(Boolean(descriptionRequest));
    renderWearerState();
}

/**
 * 普通模式打开详情，多选模式点击卡片即勾选，手机不跳转到详情页。
 * @param {MouseEvent} event 服装列表点击事件。
 * @returns {void} 无返回值。
 */
function selectGarment(event) {
    const card = event.target.closest('[data-garment]');
    if (!card) return;
    if (multiSelectMode) {
        card.parentElement.querySelector('[data-check-garment]').click();
        return;
    }
    stopDescriptionRequest();
    selectedGarmentId = card.dataset.garment;
    refreshWardrobe();
    setGarmentStatus('');
    if (compactViewport.matches) setMobileDetails(true);
}

/**
 * 打开描述编辑区域；手机同步显示详情，不复制表单内容。
 * @returns {void} 无返回值。
 */
function showGarmentDescription() {
    panel.querySelector('[data-detail="description"]').click();
    if (compactViewport.matches) setMobileDetails(true);
    panel.querySelector('[name="garment_description"]').focus();
}

/**
 * 使用所选类型的已保存提示词识别图片，替换服装名称和分类后发给 API，结果由用户保存或应用。
 * @returns {Promise<void>} 识别请求与编辑框更新完成后结束。
 */
async function generateGarmentDescription() {
    const item = garments.get(selectedGarmentId);
    let request;
    try {
        const config = savedApiSettings;
        if (config.mode === 'custom' && (!config.apiurl || !config.model)) throw new Error('请先在 API 页保存完整的接口地址与模型。');
        request = { generationId: `wardrobe-description-${window.parent.crypto.randomUUID()}` };
        descriptionRequest = request;
        setDescriptionBusy(true);
        setGarmentStatus('正在生成服装描述…');
        const { mode, ...customApi } = config;
        const values = { name: item.name, category: CATEGORY_LABELS.get(item.category) };
        const prompt = descriptionPrompts[panel.querySelector('[name="description_mode"]').value];
        const reply = await generateRaw({
            generation_id: request.generationId,
            image: item.image,
            // 仅替换一次变量，服装名中的模板标记保留为普通文本，不带入聊天历史或角色提示。
            user_input: prompt.replace(DESCRIPTION_VARIABLES, (_match, name) => values[name]),
            ordered_prompts: ['user_input'],
            max_chat_history: 0,
            should_stream: false,
            should_silence: true,
            ...(mode === 'custom' ? { custom_api: customApi } : {}),
        });
        if (descriptionRequest !== request) return;
        if (typeof reply !== 'string' || !reply.trim()) throw new Error('接口未返回服装描述。');
        panel.querySelector('[name="garment_description"]').value = reply.trim();
        setGarmentStatus('描述已生成，请保存或应用');
    } catch (error) {
        if (root.isConnected && (!request || descriptionRequest === request)) setGarmentStatus(describeApiError(error), true);
    } finally {
        if (request && descriptionRequest === request) {
            descriptionRequest = null;
            setDescriptionBusy(false);
        }
    }
}

/**
 * 识别期间暂时锁定当前服装编辑；选择其他服装仍可取消本次识别。
 * @param {boolean} busy 是否正在识别。
 * @returns {void} 无返回值。
 */
function setDescriptionBusy(busy) {
    const item = garments.get(selectedGarmentId);
    for (const control of panel.querySelectorAll('.tw-details input, .tw-details select, .tw-details textarea, [data-action="save-garment"], [data-action="apply"]')) {
        control.disabled = !item || busy;
    }
    const button = panel.querySelector('[data-action="describe"]');
    button.disabled = !item?.image || busy;
    button.textContent = busy ? '正在生成…' : 'AI 生成描述';
    for (const control of panel.querySelectorAll('[data-action="export-one"], [data-action="delete-one"]')) control.disabled = !item || busy;
    panel.querySelector('[data-action="remove-image"]').disabled = !item?.image || busy;
}

/**
 * 切换服装、关闭衣柜或卸载时停止本次识别，防止结果写到另一个服装的编辑框。
 * @returns {void} 无返回值。
 */
function stopDescriptionRequest() {
    if (!descriptionRequest) return;
    const request = descriptionRequest;
    descriptionRequest = null;
    stopGenerationById(request.generationId);
    setDescriptionBusy(false);
}

/**
 * 保存当前编辑内容；若服装正在发送，先验证修改后仍满足已保存的内容类型。
 * @returns {WardrobeItem|undefined} 保存后的服装，失败时为空。
 */
function saveSelectedGarment() {
    const item = garments.get(selectedGarmentId);
    if (!item) return undefined;
    const name = panel.querySelector('[name="garment_name"]');
    name.value = name.value.trim();
    if (!name.value) {
        panel.querySelector('[data-detail="info"]').click();
        name.reportValidity();
        return undefined;
    }
    try {
        const updated = { ...item, name: name.value, category: panel.querySelector('[name="garment_category"]').value, groupId: panel.querySelector('[name="garment_group"]').value, description: panel.querySelector('[name="garment_description"]').value.trim() };
        const selections = readWearerSelections();
        if (selections.user.has(item.id) || selections.char.has(item.id)) buildWardrobeContent(updated, sendSettings);
        const next = new Map(garments);
        next.set(item.id, updated);
        commitGarments(next, item.id);
        setGarmentStatus('已保存');
        return updated;
    } catch (error) {
        setGarmentStatus(String(error), true);
        return undefined;
    }
}

/**
 * 为当前聊天的 USER 或 Char 切换一套服装选择，保留该角色已选择的其他服装。
 * @returns {void} 无返回值。
 */
function applySelectedGarment() {
    try {
        const removing = readWearerSelections()[selectedWearer].has(selectedGarmentId);
        if (!removing) {
            const item = saveSelectedGarment();
            if (!item) return;
        }
        applyGarments([selectedGarmentId], selectedWearer, removing);
        refreshWardrobe();
        setGarmentStatus(removing ? '已取消应用' : '已加入选择，下次对话会使用对应角色模板');
    } catch (error) {
        showGarmentDescription();
        setGarmentStatus(String(error), true);
    }
}

/**
 * 在详情区域显示保存或应用结果。
 * @param {string} message 状态文字。
 * @param {boolean} error 是否为操作错误。
 * @returns {void} 无返回值。
 */
function setGarmentStatus(message, error = false) {
    const status = panel.querySelector('.tw-garment-status');
    status.textContent = message;
    status.dataset.error = String(error);
}

/**
 * 按发送模式构建真正的文本或图片内容块，不把图片地址伪装成文字描述。
 * @param {WardrobeItem} item 当前应用的服装。
 * @param {{content_type: string, position: string}} settings 已保存的发送设置。
 * @returns {Object[]} 符合酒馆多模态消息格式的内容块。
 */
function buildWardrobeContent(item, settings) {
    const parts = [];
    if (settings.content_type !== 'image') {
        if (!item.description.trim()) throw new Error('当前内容类型需要文字描述，请先填写服装描述。');
        parts.push({ type: 'text', text: `当前服装：${item.name}\n${item.description}` });
    }
    if (settings.content_type !== 'text') {
        if (!item.image) throw new Error('当前内容类型需要图片，请先导入服装图片。');
        parts.push({ type: 'image_url', image_url: { url: item.image, detail: 'auto' } });
    }
    return parts;
}

/**
 * 按角色实际选择数量使用单套或衣柜模板；包含图片时额外附带对应的图片提示词。
 * @param {WardrobeItem[]} items 该角色选择的服装。
 * @param {string} wearer user 或 char。
 * @param {{content_type: string, position: string}} settings 已保存的发送设置。
 * @param {Object} templates USER 和 Char 的已保存模板。
 * @param {{user: string, char: string}} names 当前聊天的用户与角色名称。
 * @param {{single: string, wardrobe: string}} imageTemplates 已保存的单套与衣柜图片模板。
 * @returns {Object[]} 该角色的模板文本与真实图片内容块，未选择时为空数组。
 */
function buildWearerContent(items, wearer, settings, templates, names, imageTemplates = wardrobeTemplates.image) {
    if (!items.length) return [];
    const images = [];
    const outfitNames = [];
    const descriptions = [];
    const outfits = [];
    for (const item of items) {
        for (const part of buildWardrobeContent(item, settings)) if (part.type === 'image_url') images.push(part);
        outfitNames.push(item.name);
        descriptions.push(item.description);
        outfits.push(`${outfits.length + 1}. ${item.name}\n${item.description}`);
    }
    const values = {
        user: names.user, char: names.char, wearer: names[wearer],
        name: outfitNames.join('、'), description: descriptions.join('\n'),
        outfits: outfits.join('\n\n'), count: String(items.length),
    };
    const field = items.length === 1 ? 'single' : 'wardrobe';
    const texts = [];
    // 一次替换受支持的变量，不再次解释服装描述里原有的双花括号，也不执行模板代码。
    if (settings.content_type !== 'image') texts.push(templates[wearer][field].replace(TEMPLATE_VARIABLES, (_match, name) => values[name]));
    // 图片模式无需预先填写描述，但必须带上图片提示词，避免把图中人物当作角色设定。
    if (settings.content_type !== 'text') texts.push(imageTemplates[field].replace(TEMPLATE_VARIABLES, (_match, name) => values[name]));
    return [{ type: 'text', text: texts.join('\n\n') }, ...images];
}

/**
 * 复制目标消息后追加服装内容，保留原有文本、图片与工具字段，不修改聊天历史对象。
 * @param {Object} message 请求中的目标消息。
 * @param {Object[]} parts 要追加的服装内容块。
 * @returns {Object} 新的请求消息对象。
 */
function appendWardrobeContent(message, parts) {
    if (typeof message.content === 'string' && parts.length === 1 && parts[0].type === 'text') {
        return { ...message, content: message.content ? `${message.content}\n\n${parts[0].text}` : parts[0].text };
    }
    const content = Array.isArray(message.content) ? message.content.slice() : message.content ? [{ type: 'text', text: message.content }] : [];
    content.push(...parts);
    return { ...message, content };
}

/**
 * 将内容按三个位置写入最终请求：系统前缀末尾、完整上下文末尾或最后一条用户消息末尾。
 * @param {Object[]} messages 酒馆最终发送的消息数组。
 * @param {Object[]} parts 已构建的服装内容块。
 * @param {string} position 已保存的注入位置。
 * @returns {void} 原地更新请求数组，不修改原消息对象。
 */
function insertWardrobeContent(messages, parts, position) {
    if (position === 'system_end') {
        let end = 0;
        while (end < messages.length && messages[end].role === 'system') end++;
        if (end) messages[end - 1] = appendWardrobeContent(messages[end - 1], parts);
        else messages.unshift(appendWardrobeContent({ role: 'system', content: '' }, parts));
    } else if (position === 'user_end') {
        let index = messages.length - 1;
        while (index >= 0 && messages[index].role !== 'user') index--;
        if (index >= 0) messages[index] = appendWardrobeContent(messages[index], parts);
        else messages.push(appendWardrobeContent({ role: 'user', content: '' }, parts));
    } else {
        messages.push(appendWardrobeContent({ role: 'system', content: '' }, parts));
    }
}

/**
 * 注入当前聊天 USER 与 Char 各自选择的服装，按各自套数独立切换模板，不读取未保存表单。
 * @param {{chat: Object[], dryRun: boolean}} event 酒馆最终消息与预览标记。
 * @returns {void} 只修改发送载荷，连接测试不携带服装内容。
 */
function injectWardrobeContent(event) {
    if (apiRequest?.generationId || descriptionRequest) return;
    try {
        const selections = readWearerSelections();
        const names = { user: SillyTavern.name1 || 'USER', char: SillyTavern.name2 || 'Char' };
        const parts = [];
        for (const wearer of WEARERS) {
            const items = Array.from(selections[wearer], id => garments.get(id));
            for (const part of buildWearerContent(items, wearer, sendSettings, wardrobeTemplates, names)) parts.push(part);
        }
        if (parts.length) insertWardrobeContent(event.chat, parts, sendSettings.position);
    } catch (error) {
        toastr.error(String(error), '服装内容未发送');
    }
}

/**
 * 在存档入口加载角色及图片模板，旧存档缺少图片模板时补默认值，并填充编辑器。
 * @returns {void} 无返回值。
 */
function loadWardrobeTemplates() {
    const saved = getVariables({ type: 'script' }).wardrobe_templates;
    for (const wearer of TEMPLATE_OWNERS) {
        const form = settingsPanel.querySelector(`[data-template-owner="${wearer}"]`);
        for (const field of TEMPLATE_FIELDS) {
            const value = saved?.[wearer]?.[field];
            wardrobeTemplates[wearer][field] = typeof value === 'string' && value.trim() ? value : DEFAULT_TEMPLATES[wearer][field];
            form.elements[field].value = wardrobeTemplates[wearer][field];
        }
    }
}

/**
 * 独立保存当前角色或图片的两种模板；成功后才更新发送缓存，保留其他模板及设置。
 * @param {SubmitEvent} event 角色或图片模板表单提交事件。
 * @returns {void} 无返回值。
 */
function saveWardrobeTemplate(event) {
    event.preventDefault();
    const form = event.currentTarget;
    for (const field of TEMPLATE_FIELDS) form.elements[field].value = form.elements[field].value.trim();
    if (!form.reportValidity()) return;
    const wearer = form.dataset.templateOwner;
    const status = form.querySelector('.tw-template-status');
    try {
        const next = { ...wardrobeTemplates, [wearer]: { single: form.elements.single.value, wardrobe: form.elements.wardrobe.value } };
        insertOrAssignVariables({ wardrobe_templates: next }, { type: 'script' });
        wardrobeTemplates = next;
        status.textContent = '已保存';
        status.dataset.error = 'false';
    } catch (error) {
        status.textContent = `保存失败：${String(error)}`;
        status.dataset.error = 'true';
    }
}

/**
 * 修改模板后清除旧保存提示，避免尚未保存的模板被误认为已经用于发送。
 * @param {InputEvent} event 模板表单中的输入事件。
 * @returns {void} 无返回值。
 */
function clearTemplateStatus(event) {
    event.currentTarget.querySelector('.tw-template-status').textContent = '';
}

/**
 * 在存档入口归一化两种描述提示词；旧存档或空白字段补充只描述服饰的默认提示词。
 * @returns {void} 无返回值。
 */
function loadDescriptionPrompts() {
    const saved = getVariables({ type: 'script' }).wardrobe_description_prompts;
    const form = settingsPanel.querySelector('.tw-description-form');
    for (const field of Object.keys(DEFAULT_DESCRIPTION_PROMPTS)) {
        const value = saved?.[field];
        descriptionPrompts[field] = typeof value === 'string' && value.trim() ? value : DEFAULT_DESCRIPTION_PROMPTS[field];
        // item 与原生控件集合的方法同名，统一通过 namedItem 读取实际表单控件。
        form.elements.namedItem(field).value = descriptionPrompts[field];
    }
}

/**
 * 保存服装和单品的生成提示词；空白内容不可提交，存储失败时保留当前生效配置。
 * @param {SubmitEvent} event 描述生成设置表单的提交事件。
 * @returns {void} 无返回值。
 */
function saveDescriptionPrompts(event) {
    event.preventDefault();
    const form = event.currentTarget;
    for (const field of Object.keys(DEFAULT_DESCRIPTION_PROMPTS)) {
        const input = form.elements.namedItem(field);
        input.value = input.value.trim();
    }
    if (!form.reportValidity()) return;
    const status = form.querySelector('.tw-template-status');
    try {
        const next = { outfit: form.elements.namedItem('outfit').value, item: form.elements.namedItem('item').value };
        insertOrAssignVariables({ wardrobe_description_prompts: next }, { type: 'script' });
        descriptionPrompts = next;
        status.textContent = '已保存';
        status.dataset.error = 'false';
    } catch (error) {
        status.textContent = `保存失败：${String(error)}`;
        status.dataset.error = 'true';
    }
}

/**
 * 在配置入口校验内容类型和注入位置；未保存或旧版深度选项默认使用用户消息末尾。
 * @returns {void} 无返回值。
 */
function loadSendSettings() {
    const saved = getVariables({ type: 'script' }).wardrobe_send;
    if (saved && typeof saved === 'object') {
        if (saved.content_type === 'text' || saved.content_type === 'image' || saved.content_type === 'text_image') {
            sendForm.elements.content_type.value = saved.content_type;
        }
        if (saved.position === 'system_end' || saved.position === 'context_end' || saved.position === 'user_end') {
            sendForm.elements.position.value = saved.position;
        }
    }
    sendSettings = { content_type: sendForm.elements.content_type.value, position: sendForm.elements.position.value };
}

/**
 * 选项变化后清除上次保存反馈，避免把尚未保存的选择误认为已保存。
 * @returns {void} 无返回值。
 */
function clearSendStatus() {
    sendForm.querySelector('.tw-send-status').textContent = '';
}

/**
 * 保存内容类型与三种语义注入位置，替换旧版深度配置并保留 API 配置。
 * @param {SubmitEvent} event 发送内容表单的提交事件。
 * @returns {void} 无返回值。
 */
function saveSendSettings(event) {
    event.preventDefault();
    const fields = sendForm.elements;
    const status = sendForm.querySelector('.tw-send-status');
    try {
        const nextSettings = {
            content_type: fields.content_type.value,
            position: fields.position.value,
        };
        const selections = readWearerSelections();
        for (const wearer of WEARERS) {
            for (const id of selections[wearer]) buildWardrobeContent(garments.get(id), nextSettings);
        }
        insertOrAssignVariables({ wardrobe_send: nextSettings }, { type: 'script' });
        sendSettings = nextSettings;
        status.textContent = '已保存';
        status.dataset.error = 'false';
    } catch (error) {
        status.textContent = `保存失败：${String(error)}`;
        status.dataset.error = 'true';
    }
}

/**
 * 加载脚本配置；旧版跟随预设的参数显示为当前实际数值，使显示、保存与请求保持一致。
 * @returns {void} 无返回值。
 */
function loadApiSettings() {
    const saved = getVariables({ type: 'script' }).wardrobe_api;
    const preset = getPreset('in_use').settings;
    if (saved && typeof saved === 'object') {
        apiForm.elements.mode.value = saved.mode === 'custom' ? 'custom' : 'host';
        for (const name of ['apiurl', 'key', 'model']) {
            const value = saved[name];
            if (typeof value === 'string' || typeof value === 'number') {
                apiForm.elements[name].value = String(value);
            }
        }
    }
    // 参数只在配置入口归一化；零温度是有效配置，不能用真值判断覆盖它。
    for (const [name, fallback] of [['temperature', preset.temperature], ['max_tokens', preset.max_completion_tokens]]) {
        const value = saved?.[name];
        apiForm.elements[name].value = String(typeof value === 'number' && Number.isFinite(value) ? value : fallback);
    }
    updateApiMode();
    savedApiSettings = collectApiSettings();
}

/**
 * 隐藏并禁用未使用的自定义字段，让酒馆连接不受这些字段的表单校验影响。
 * @returns {void} 无返回值。
 */
function updateApiMode() {
    closeModelOptions();
    const custom = apiForm.elements.mode.value === 'custom';
    const fields = apiForm.querySelector('.tw-api-custom');
    fields.hidden = !custom;
    fields.disabled = !custom;
    apiForm.elements.apiurl.required = custom;
    apiForm.elements.model.required = custom;
    apiForm.querySelector('.tw-api-status').textContent = '';
}

/**
 * 根据输入单次过滤模型；没有选项时展示本次获取状态，避免失败后仍显示首次使用提示。
 * @param {Event} [event] 输入事件触发搜索；焦点、展开按钮和刷新模型时展示全部选项。
 * @returns {void} 无返回值。
 */
function openModelOptions(event) {
    const input = apiForm.elements.model;
    const list = apiForm.querySelector('#tw-api-models');
    const query = event?.type === 'input' ? input.value.trim().toLowerCase() : '';
    const options = hostDocument.createDocumentFragment();
    let count = 0;
    for (const model of apiModels) {
        if (query && !model.toLowerCase().includes(query)) continue;
        const option = hostDocument.createElement('button');
        option.type = 'button';
        option.id = `tw-api-model-option-${count++}`;
        option.tabIndex = -1;
        option.dataset.model = model;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', String(model === input.value));
        option.textContent = model;
        options.append(option);
    }
    if (!count) {
        const empty = hostDocument.createElement('span');
        empty.className = 'tw-model-empty';
        empty.textContent = apiModels.length ? '无匹配模型，可继续手动输入' : modelListMessage;
        empty.dataset.error = String(!apiModels.length && modelListError);
        empty.setAttribute('role', 'status');
        options.append(empty);
    }
    list.replaceChildren(options);
    list.hidden = false;
    activeModelIndex = -1;
    input.removeAttribute('aria-activedescendant');
    input.setAttribute('aria-expanded', 'true');
    const toggle = apiForm.querySelector('[data-action="toggle-models"]');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '收起模型列表');
}

/**
 * 收起模型列表并清理辅助技术状态，保留输入的模型和已获取的模型数据。
 * @returns {void} 无返回值。
 */
function closeModelOptions() {
    apiForm.querySelector('#tw-api-models').hidden = true;
    apiForm.elements.model.setAttribute('aria-expanded', 'false');
    apiForm.elements.model.removeAttribute('aria-activedescendant');
    const toggle = apiForm.querySelector('[data-action="toggle-models"]');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '展开模型列表');
    activeModelIndex = -1;
}

/**
 * 用箭头按钮展开或收起列表，展开时将输入焦点交回模型框。
 * @returns {void} 无返回值。
 */
function toggleModelOptions() {
    if (!apiForm.querySelector('#tw-api-models').hidden) {
        closeModelOptions();
        return;
    }
    apiForm.elements.model.focus();
    openModelOptions();
}

/**
 * 输入框支持方向键选择与回车确认；滚动条将焦点交给对话框后，Escape 仍优先收起列表。
 * @param {KeyboardEvent} event 设置面板内冒泡的键盘事件。
 * @returns {void} 无返回值。
 */
function navigateModelOptions(event) {
    if (event.target !== apiForm.elements.model && event.key !== 'Escape') return;
    const list = apiForm.querySelector('#tw-api-models');
    if (event.key === 'Tab') {
        closeModelOptions();
        return;
    }
    if (event.key === 'Escape' && !list.hidden) {
        event.preventDefault();
        event.stopPropagation();
        closeModelOptions();
        return;
    }
    if (event.key === 'Enter' && !list.hidden) {
        event.preventDefault();
        const active = list.querySelectorAll('[role="option"]')[activeModelIndex];
        if (active) apiForm.elements.model.value = active.dataset.model;
        closeModelOptions();
        return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    if (list.hidden) openModelOptions();
    const options = list.querySelectorAll('[role="option"]');
    if (!options.length) return;
    activeModelIndex = activeModelIndex < 0 ? (event.key === 'ArrowDown' ? 0 : options.length - 1) : (activeModelIndex + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
    for (let index = 0; index < options.length; index++) {
        options[index].setAttribute('aria-selected', String(index === activeModelIndex));
    }
    const active = options[activeModelIndex];
    apiForm.elements.model.setAttribute('aria-activedescendant', active.id);
    active.scrollIntoView({ block: 'nearest' });
}

/**
 * 将点击的模型写回输入框，选项数据已经在模型接口入口校验。
 * @param {MouseEvent} event 模型列表内的点击事件。
 * @returns {void} 无返回值。
 */
function selectModelOption(event) {
    const option = event.target.closest('[data-model]');
    if (!option) return;
    apiForm.elements.model.value = option.dataset.model;
    apiForm.elements.model.focus();
    closeModelOptions();
}

/**
 * 焦点明确移到外部控件时收起列表；滚动条交互造成的空目标或对话框焦点回退仍保留列表。
 * @param {FocusEvent} event 模型选择器的焦点离开事件。
 * @returns {void} 无返回值。
 */
function leaveModelOptions(event) {
    // 浏览器点击原生滚动条时会把焦点交给外层对话框；是否点击外部空白由点击监听判断。
    if (event.relatedTarget && event.relatedTarget !== settingsPanel && !event.currentTarget.contains(event.relatedTarget)) closeModelOptions();
}

/**
 * 点击设置中的其他区域时收起模型列表，避免列表占用无关表单的空间。
 * @param {MouseEvent} event 设置面板的点击事件。
 * @returns {void} 无返回值。
 */
function dismissModelOptions(event) {
    // 获取按钮属于模型操作，保留刚展开的加载结果；点击其他区域仍按原有方式收起。
    if (!event.target.closest('.tw-model-picker, [data-api-action="models"]')) closeModelOptions();
}

/**
 * 按用户操作切换密钥可见性，不修改密钥内容或保存状态。
 * @param {MouseEvent} event 密钥显示按钮的点击事件。
 * @returns {void} 无返回值。
 */
function toggleApiKey(event) {
    const visible = apiForm.elements.key.type === 'password';
    apiForm.elements.key.type = visible ? 'text' : 'password';
    event.currentTarget.textContent = visible ? '隐藏' : '显示';
    event.currentTarget.setAttribute('aria-pressed', String(visible));
    event.currentTarget.setAttribute('aria-label', `${visible ? '隐藏' : '显示'} API Key`);
}

/**
 * 修改地址后清除上次协议校验提示，让原生表单能够再次触发保存校验。
 * @param {InputEvent} event 接口地址输入事件。
 * @returns {void} 无返回值。
 */
function clearApiUrlValidity(event) {
    event.currentTarget.setCustomValidity('');
}

/**
 * 校验用户输入并读取连接配置；获取模型时允许尚未填写模型名称。
 * @param {boolean} requireModel 是否要求自定义连接已填写模型。
 * @returns {Object|null} 可交给酒馆助手的配置及连接方式，校验不通过时返回空值。
 */
function readApiSettings(requireModel) {
    const fields = apiForm.elements;
    const custom = fields.mode.value === 'custom';
    fields.model.required = custom && requireModel;
    fields.apiurl.value = fields.apiurl.value.trim();
    fields.model.value = fields.model.value.trim();
    fields.apiurl.setCustomValidity('');
    if (custom && fields.apiurl.value && fields.apiurl.validity.valid) {
        const url = new URL(fields.apiurl.value);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            fields.apiurl.setCustomValidity('接口地址必须使用 HTTP 或 HTTPS。');
        }
    }
    if (!apiForm.reportValidity()) return null;
    return collectApiSettings();
}

/**
 * 将已校验或在加载入口归一化的表单值转换为 API 配置，供保存与首次加载共同使用。
 * @returns {Object} API 连接配置。
 */
function collectApiSettings() {
    const fields = apiForm.elements;
    return {
        mode: fields.mode.value,
        apiurl: fields.apiurl.value,
        key: fields.key.value.trim(),
        model: fields.model.value,
        source: 'openai',
        temperature: fields.temperature.valueAsNumber,
        max_tokens: fields.max_tokens.valueAsNumber,
    };
}

/**
 * 将配置保存到当前脚本变量，保留同一脚本中其他功能的变量。
 * @param {SubmitEvent} event API 表单的提交事件。
 * @returns {void} 无返回值。
 */
function saveApiSettings(event) {
    event.preventDefault();
    const config = readApiSettings(true);
    if (!config) return;
    try {
        insertOrAssignVariables({ wardrobe_api: config }, { type: 'script' });
        savedApiSettings = config;
        setApiStatus('已保存');
    } catch (error) {
        setApiStatus(`保存失败：${String(error)}`, true);
    }
}

/**
 * 获取模型或测试当前表单连接，复用宿主请求接口，避免另建跨域代理和请求协议。
 * @param {MouseEvent} event 获取模型或测试连接按钮的点击事件。
 * @returns {Promise<void>} 请求及状态更新完成后结束。
 */
async function requestApi(event) {
    const action = event.currentTarget.dataset.apiAction;
    const config = readApiSettings(action === 'test');
    if (!config) return;
    const request = { generationId: action === 'test' ? `wardrobe-test-${Date.now()}` : null };
    apiRequest = request;
    setApiBusy(true);
    if (action === 'models') {
        // 每次获取都绑定当前地址和密钥，失败时不继续展示上一次连接的旧模型。
        apiModels = [];
        modelListMessage = '正在获取模型…';
        modelListError = false;
        openModelOptions();
    }
    setApiStatus(action === 'models' ? '正在获取模型…' : '正在测试连接…');
    try {
        if (action === 'models') {
            const models = await getModelList({ apiurl: config.apiurl, key: config.key });
            if (apiRequest !== request) return;
            // 模型名称在接口入口校验一次，后续过滤与选择只处理已确定的字符串。
            if (!Array.isArray(models) || models.some(model => typeof model !== 'string')) {
                throw new Error('接口返回的模型列表格式不正确。');
            }
            apiModels = Array.from(new Set(models));
            // 宿主可能只返回空列表；没有明确鉴权错误时，不能断言一定是密钥无效。
            modelListMessage = '未获取到模型，请检查接口地址、API Key 或模型列表权限，也可手动输入';
            openModelOptions();
            setApiStatus(apiModels.length ? `已获取 ${apiModels.length} 个模型` : '接口未返回模型，可手动输入模型名称');
        } else {
            const { mode, ...customApi } = config;
            // 测试只发送固定短句，不携带角色、世界书或聊天历史，也不写入聊天记录。
            const reply = await generateRaw({
                generation_id: request.generationId,
                user_input: '请只回复 OK。',
                ordered_prompts: ['user_input'],
                max_chat_history: 0,
                should_stream: false,
                should_silence: true,
                ...(mode === 'custom' ? { custom_api: customApi } : {}),
            });
            if (apiRequest !== request) return;
            if (typeof reply !== 'string' || !reply.trim()) throw new Error('接口未返回文本回复。');
            setApiStatus('连接成功，模型已响应');
        }
    } catch (error) {
        if (apiRequest === request) {
            const message = describeApiError(error);
            if (action === 'models') {
                modelListMessage = `获取模型失败：${message}`;
                modelListError = true;
                openModelOptions();
            }
            setApiStatus(`请求失败：${message}`, true);
        }
    } finally {
        if (apiRequest === request) {
            apiRequest = null;
            setApiBusy(false);
        }
    }
}

/**
 * 将接口明确返回的鉴权或权限错误转成可操作提示，其余错误保留原始原因。
 * @param {unknown} error 宿主请求接口抛出的错误。
 * @returns {string} 供模型列表和连接测试共同使用的错误说明。
 */
function describeApiError(error) {
    const message = typeof error?.message === 'string' ? error.message : String(error);
    const status = String(error?.status ?? error?.response?.status ?? '');
    if (status === '401' || /\b401\b|unauthorized|(?:invalid|incorrect|expired)[\s_-]+(?:api[\s_-]+)?key/i.test(message)) {
        return 'API Key 验证失败，请检查密钥是否正确或已失效';
    }
    if (status === '403' || /\b403\b|forbidden/i.test(message)) {
        return '访问被拒绝，请检查 API Key 权限或服务端访问限制';
    }
    return message;
}

/**
 * 同步请求期间的可编辑状态，避免重复提交及返回结果对应到已改动的地址。
 * @param {boolean} busy 是否正在执行 API 请求。
 * @returns {void} 无返回值。
 */
function setApiBusy(busy) {
    if (busy) closeModelOptions();
    apiForm.querySelector('.tw-api-fields').disabled = busy;
    for (const button of apiForm.querySelectorAll('.tw-api-actions button')) button.disabled = busy;
    apiForm.setAttribute('aria-busy', String(busy));
}

/**
 * 将操作结果写入现有状态区，使键盘与屏幕阅读器用户都能收到结果。
 * @param {string} message 要显示的操作结果。
 * @param {boolean} error 是否使用错误样式。
 * @returns {void} 无返回值。
 */
function setApiStatus(message, error = false) {
    const status = apiForm.querySelector('.tw-api-status');
    status.textContent = message;
    status.dataset.error = String(error);
}

/**
 * 关闭或卸载时停止本次测试；宿主模型列表接口不提供取消能力，因此丢弃失效结果。
 * @returns {void} 无返回值。
 */
function stopApiRequest() {
    if (!apiRequest) return;
    const request = apiRequest;
    apiRequest = null;
    if (request.generationId) stopGenerationById(request.generationId);
    else {
        modelListMessage = '获取已取消，可重新获取模型或手动输入';
        modelListError = false;
        closeModelOptions();
    }
    setApiBusy(false);
    setApiStatus('请求已取消');
}

/**
 * 切换 API、发送内容、模板与描述生成设置，仅更新设置页，保留服装详情的未保存内容。
 * @param {MouseEvent} event 设置导航中的点击事件。
 * @returns {void} 无返回值。
 */
function selectSettingsPage(event) {
    const button = event.target.closest('button[data-settings-page]');
    if (!button) return;
    for (const item of settingsPanel.querySelectorAll('[data-settings-page]')) {
        item.setAttribute('aria-pressed', String(item === button));
    }
    for (const page of settingsPanel.querySelectorAll('[data-settings-content]')) {
        page.hidden = page.dataset.settingsContent !== button.dataset.settingsPage;
    }
    settingsPanel.querySelector('.tw-settings-content').scrollTop = 0;
}

/**
 * 切换分类高亮和真实服装列表，手机与侧栏共用同一分类状态。
 * @param {MouseEvent} event 分类列表中的点击事件。
 * @returns {void} 无返回值。
 */
function selectCategory(event) {
    const button = event.target.closest('button[data-category]');
    if (!button) return;
    updateCategory(button.dataset.category);
}

/**
 * 将手机选择器的分类选择转交给侧栏共用入口，避免两处选项状态分离。
 * @param {Event} event 原生分类选择器触发的变化事件。
 * @returns {void} 无返回值。
 */
function selectCategoryOption(event) {
    updateCategory(event.currentTarget.value);
}

/**
 * 同步分类按钮、手机选择器和服装筛选；只在紧凑布局中滚动条带以露出当前分类。
 * @param {string} id 来自本文件分类入口的分类标识。
 * @returns {void} 无返回值。
 */
function updateCategory(id) {
    checkedGarmentIds.clear();
    currentCategory = id;
    let selectedButton;
    for (const item of panel.querySelectorAll('[data-category]')) {
        const selected = item.dataset.category === id;
        item.setAttribute('aria-pressed', String(selected));
        if (selected) selectedButton = item;
    }
    panel.querySelector('.tw-mobile-filter select').value = id;
    renderGarmentLibrary();
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
 * 同步工具栏与真实服装列表的网格或列表显示方式。
 * @param {MouseEvent} event 显示方式按钮组中的点击事件。
 * @returns {void} 无返回值。
 */
function selectView(event) {
    const button = event.target.closest('button[data-view]');
    if (!button) return;
    for (const item of panel.querySelectorAll('[data-view]')) {
        item.setAttribute('aria-pressed', String(item.dataset.view === button.dataset.view));
    }
    panel.querySelector('.tw-library').dataset.layout = button.dataset.view;
}

/**
 * 切换右侧详情分组，保留名称、分类与描述的未保存编辑内容。
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
 * 停用或重载时中止图片读取、注销请求和聊天监听，并清理界面。
 * @returns {void} 无返回值。
 */
function destroyWardrobe() {
    stopDescriptionRequest();
    for (const subscription of subscriptions) subscription.stop();
    for (const reader of imageReaders) reader.abort();
    if (exportUrl) window.parent.URL.revokeObjectURL(exportUrl);
    panel.removeEventListener('close', restoreFocus);
    closeSettings();
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
