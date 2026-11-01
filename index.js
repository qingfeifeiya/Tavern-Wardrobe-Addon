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
const QUICK_FILTERS = [
    ['combinations', '搭配', 'star'],
    ['favorites', '收藏', 'heart'], ['recent', '最近使用', 'clock'],
    ['assigned-user', '已分配 USER', 'hanger'], ['assigned-char', '已分配 Char', 'hanger'],
    ['unassigned', '未分配', 'shirt'], ['missing-description', '缺描述', 'file'], ['missing-image', '无图片', 'info'],
];
const CATEGORY_FILTERS = [...CATEGORIES, ...QUICK_FILTERS];
const CATEGORY_LABELS = new Map(CATEGORY_FILTERS.map(([id, label]) => [id, label]));
const GARMENT_CATEGORIES = new Set(CATEGORIES.slice(1).map(([id]) => id));
// 排序时复用中文比较器，避免为每一次名称比较重复创建格式化对象。
const GARMENT_NAME_COLLATOR = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' });
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
// 使用酒馆原生图片目录，存档只保留路径，避免每次保存服装时重复序列化整张原图。
const IMAGE_FOLDER = 'tavern_wardrobe';
const DATA_IMAGE_PATTERN = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/;
const STORED_IMAGE_PATTERN = /^user\/images\/tavern_wardrobe\/[^/\\?#%]+\.(png|jpg|webp)$/;
// 限制聊天参考图的像素和 JPEG 质量，减少多套服装请求体积；不改动保存的原图。
const SEND_IMAGE_MAX_EDGE = 1280;
const SEND_IMAGE_QUALITY = 0.82;
const WEARERS = ['user', 'char'];
const TEMPLATE_OWNERS = [...WEARERS, 'image'];
const TEMPLATE_FIELDS = ['single', 'wardrobe'];
const TEMPLATE_VARIABLES = /\{\{(user|char|wearer|name|description|outfits|count)\}\}/g;
const DESCRIPTION_VARIABLES = /\{\{(name|category)\}\}/g;
const DEFAULT_DESCRIPTION_PROMPTS = {
    outfit: '请只描述图片中可见的服装与配饰，说明款式、颜色、材质、版型、层次、搭配及装饰细节。忽略人物的身份、面容、发型、表情、姿势、身材、皮肤和身体特征，不描述背景，不续写剧情。只写能从图中看出的信息，无法判断的材质和被遮挡的细节不要猜测。仅输出包含 name（服装名称）、description（服装描述）和 category（衣柜标签名称）的 JSON 对象。',
    item: '请只描述当前服装单品“{{name}}”（分类：{{category}}）在图片中可见的款式、颜色、材质、剪裁、图案、装饰和穿着细节。忽略其他服装和配饰，不描述人物的身份、面容、发型、表情、姿势、身材、皮肤、身体特征及背景。无法辨认目标单品时请明确说明，不编造。仅输出包含 name（单品名称）、description（单品描述）和 category（衣柜标签名称）的 JSON 对象。',
};
// 仅识别上一版的原始默认值，更新时替换这些模板，保留用户实际编辑过的内容。
const PREVIOUS_DEFAULT_TEMPLATES = {
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

const DEFAULT_TEMPLATES = {
    user: {
        single: '{{user}} 当前穿着：{{name}}\n{{description}}\n（禁止编造其他服装。严禁集中罗列服装信息，服装细节必须分散融入不同的动作、触感、环境互动中，每次只带出一两个细节。）',
        wardrobe: '{{user}} 的衣柜，共 {{count}} 套：\n{{outfits}}\n请根据剧情选择合适的一套，不要同时穿上所有套装。\n（禁止编造以上之外的服装。根据场景标签匹配穿搭，若回复中出现场景转换则对应切换穿搭。严禁集中罗列服装信息，服装细节必须分散融入动作、触感、环境互动中，每次只带出一两个细节。）',
    },
    char: {
        single: '{{char}} 当前穿着：{{name}}\n{{description}}\n（禁止编造其他服装。严禁集中罗列服装信息，服装细节必须分散融入不同的动作、触感、环境互动中，每次只带出一两个细节。）',
        wardrobe: '{{char}} 的衣柜，共 {{count}} 套：\n{{outfits}}\n请根据剧情选择合适的一套，不要同时穿上所有套装。\n（禁止编造以上之外的服装。根据场景标签匹配穿搭，若回复中出现场景转换则对应切换穿搭。严禁集中罗列服装信息，服装细节必须分散融入动作、触感、环境互动中，每次只带出一两个细节。）',
    },
    image: {
        single: '图中为角色当前穿着，禁止编造其他服装，也不编造看不到的服装细节。严禁集中罗列，服装细节必须分散融入动作、触感、环境互动中，每次只带出一两个细节。\n\n{{wearer}} 的服装参考图：{{name}}。请仅参考图片中的服装、配饰、款式、颜色和穿搭，不采用图中人物的身份、面容、发型、身材、姿势或背景，不据此改变角色原有外貌。',
        wardrobe: '以上图片为可选穿搭，根据场景标签匹配，场景转换则切换穿搭，禁止编造其他服装，也不编造看不到的服装细节。严禁集中罗列，细节分散融入动作和互动中。\n\n{{wearer}} 的衣柜包含 {{count}} 套服装，名称与图片按相同顺序对应：{{name}}。请根据剧情选择合适的一套，不要同时穿上所有套装。图片仅提供服装与配饰参考，忽略图中人物的身份、面容、发型、身材、姿势和背景，不改变角色原有外貌。',
    },
};

/**
 * 衣柜服装数据，导入和读取存档时统一校验，内部按稳定 ID 查找。
 * @typedef {Object} WardrobeItem
 * @property {string} id 服装标识。
 * @property {string} name 服装名称。
 * @property {string} category 服装分类标识。
 * @property {string} description 发送给 AI 的服装描述。
 * @property {string} image 酒馆图片路径或尚未迁移的数据地址，无图片时为空字符串。
 * @property {string} groupId 标签标识，空字符串表示未分组。
 * @property {boolean} favorite 是否已收藏，旧存档默认未收藏。
 * @property {number} lastUsedAt 最近一次成功应用的毫秒时间戳，0 表示尚无使用记录。
 * @property {string[]} [componentIds] 搭配包含的服装 ID；分类不限，成员不可再嵌套搭配，缺省表示普通服装。
 * @property {boolean} [descriptionOverride] 搭配描述是否已由用户整段编辑；未编辑时继续自动引用成员描述。
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
            <label class="tw-search">${icon('search')}<input type="search" placeholder="搜索服装…" aria-label="搜索服装"></label>
            <div class="tw-view-modes" role="group" aria-label="服装显示方式">
                <button type="button" class="tw-icon-button" data-view="grid" aria-label="网格视图" aria-pressed="true">${icon('grid')}</button>
                <button type="button" class="tw-icon-button" data-view="list" aria-label="列表视图" aria-pressed="false">${icon('list')}</button>
            </div>
            <label class="tw-sort">${icon('sliders')}<select aria-label="服装排序">
                <option value="default">导入顺序</option><option value="name-asc">名称升序</option><option value="name-desc">名称降序</option><option value="recent">最近使用</option>
            </select></label>
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
                    ${QUICK_FILTERS.map(renderCategory).join('')}
                </nav>
                <label class="tw-selection-scope"><span>穿搭范围</span><select aria-label="穿搭范围">
                    <option value="global">全局</option><option value="character">按角色卡</option><option value="chat">按聊天</option>
                </select></label>
                <div class="tw-import-footer">
                    <button type="button" class="tw-import" data-action="import">${icon('plus')}<span>导入服装</span></button>
                    <button type="button" class="tw-export-all" data-action="export-all">${icon('download')}<span>导出服装</span></button>
                </div>
            </aside>

            <main class="tw-library" aria-label="服装列表" data-layout="grid" data-multi-select="false">
                <div class="tw-group-bar">
                    <nav class="tw-group-tabs" aria-label="服装标签"></nav>
                    <button type="button" data-action="add-group" aria-label="新增标签" title="新增标签">${icon('plus')}</button>
                    <button type="button" data-action="manage-groups" aria-label="管理标签" title="重命名与排序">${icon('pencil')}</button>
                    <button type="button" data-action="toggle-multi" aria-pressed="false" aria-controls="tw-bulk-actions">多选</button>
                    <button type="button" data-action="create-combination">${icon('plus')}<span>合并搭配</span></button>
                    <button type="button" data-action="describe-all">一键识图</button>
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
                        <label class="tw-bulk-picker tw-bulk-category-picker">${icon('shirt')}<select class="tw-bulk-category" aria-label="批量修改分类" disabled>
                            <option value="" disabled selected>修改分类…</option>${CATEGORIES.slice(1).map(([id, label]) => `<option value="${id}">${label}</option>`).join('')}
                        </select></label>
                        <label class="tw-bulk-picker tw-bulk-favorite-picker">${icon('heart')}<select class="tw-bulk-favorite" aria-label="批量收藏" disabled>
                            <option value="" disabled selected>收藏…</option><option value="favorite">收藏</option><option value="unfavorite">取消收藏</option>
                        </select></label>
                        <button type="button" data-bulk="export" disabled>${icon('download')}<span>导出</span></button>
                    </div>
                    <button type="button" class="tw-bulk-delete" data-bulk="delete" disabled>${icon('trash')}<span>删除</span></button>
                </div>
            </main>

            <aside id="tw-details" class="tw-details" aria-label="服装预览与详情">
                <div class="tw-wearer-modes" role="group" aria-label="允许穿这件服装的角色">
                    <label><input type="checkbox" data-wearer="user" disabled>USER</label>
                    <label><input type="checkbox" data-wearer="char" disabled>Char</label>
                </div>
                <div class="tw-preview">${icon('hanger')}<span>未选择服装</span></div>
                <nav class="tw-detail-tabs" aria-label="详情分组">
                    <button type="button" data-detail="info" aria-pressed="true">${icon('info')}<span>信息</span></button>
                    <button type="button" data-detail="description" aria-pressed="false">${icon('file')}<span>描述</span></button>
                    <button type="button" data-detail="tags" aria-pressed="false">${icon('tag')}<span>标签</span></button>
                </nav>
                <div class="tw-detail-content">
                    <section data-detail-page="info" aria-label="服装信息">
                        <dl class="tw-properties">
                            <dt>名称</dt><dd><input name="garment_name" aria-label="服装名称" required disabled></dd>
                            <dt>分类</dt><dd><select name="garment_category" aria-label="服装分类" disabled>${CATEGORIES.slice(1).map(([id, label]) => `<option value="${id}">${label}</option>`).join('')}</select></dd>
                            <dt>图片</dt><dd class="tw-image-actions"><span id="tw-garment-image-state">—</span><button type="button" data-action="replace-image" disabled>替换图片</button><button type="button" data-action="remove-image" disabled>删除图片</button></dd>
                        </dl>
                    </section>
                    <section data-detail-page="description" aria-label="服装描述" hidden>
                        <div class="tw-combination-details" hidden><button type="button" data-action="edit-combination">编辑搭配</button></div>
                        <div class="tw-description-actions">
                            <select name="description_mode" aria-label="描述生成类型" disabled><option value="outfit">服装描述</option><option value="item">单品描述</option></select>
                            <button type="button" class="tw-describe" data-action="describe" disabled>AI 生成描述</button>
                        </div>
                        <textarea name="garment_description" aria-label="服装描述" placeholder="填写款式、颜色、材质等服装描述" disabled></textarea>
                    </section>
                    <section data-detail-page="tags" aria-label="服装标签" hidden>
                        <label class="tw-garment-tag"><span>标签</span><select name="garment_group" aria-label="服装标签" disabled></select></label>
                    </section>
                </div>
                <div class="tw-detail-actions">
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
        <input class="tw-folder-import" type="file" accept="image/png,image/jpeg,image/webp" webkitdirectory multiple hidden>
        <input class="tw-image-replace" type="file" accept="image/png,image/jpeg,image/webp" hidden>
    </div>
    <dialog id="tw-import-picker" aria-labelledby="tw-import-picker-title">
        <header><h2 id="tw-import-picker-title">导入服装</h2><button type="button" data-action="cancel-import" aria-label="关闭导入">${icon('close')}</button></header>
        <div class="tw-import-tools">
            <button type="button" data-action="add-import-files">添加图片</button>
            <button type="button" data-action="add-import-folder">选择图片文件夹</button>
            <button type="button" data-import-selection="all" disabled>全选</button>
            <button type="button" data-import-selection="none" disabled>全不选</button>
        </div>
        <p class="tw-import-empty">先选择图片或图片文件夹</p>
        <div class="tw-import-grid" aria-label="待导入文件"></div>
        <p class="tw-import-status" role="status" aria-live="polite"></p>
        <footer><span class="tw-import-count" aria-live="polite">已选 0 / 0 个文件</span><button type="button" data-action="confirm-import" disabled>导入所选</button></footer>
    </dialog>
    <dialog id="tw-combination-editor" aria-labelledby="tw-combination-title">
        <form class="tw-combination-form">
            <h2 id="tw-combination-title">搭配</h2>
            <label class="tw-combination-name">名称<input name="combination_name" aria-label="搭配名称" required></label>
            <div class="tw-combination-items" aria-label="选择搭配成员"></div>
            <div class="tw-send-actions"><button type="button" data-action="cancel-combination">取消</button><button type="submit">保存搭配</button></div>
            <p class="tw-combination-status" role="status" aria-live="polite"></p>
        </form>
    </dialog>
    <dialog id="tw-group-manager" aria-labelledby="tw-group-manager-title">
        <form class="tw-group-form">
            <h2 id="tw-group-manager-title">管理标签</h2>
            <div class="tw-group-rows"></div>
            <div class="tw-send-actions"><button type="button" data-action="cancel-groups">取消</button><button type="submit">保存</button></div>
            <p class="tw-group-status" role="status" aria-live="polite"></p>
        </form>
    </dialog>
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
                <button type="button" data-settings-page="data" aria-pressed="false" aria-controls="tw-settings-data">${icon('download')}<span>导入／导出数据</span></button>
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
                <section id="tw-settings-data" data-settings-content="data" aria-labelledby="tw-settings-data-title" hidden>
                    <h3 id="tw-settings-data-title">导入／导出数据</h3>
                    <div class="tw-template-form">
                        <p class="tw-template-hint">发送内容、USER／Char／图片模板、描述生成提示词。仅导出已保存的设置；导入会替换这五项设置，不包含或覆盖任何 API 连接信息。</p>
                        <div class="tw-send-actions">
                            <button type="button" data-action="import-data">${icon('plus')}导入数据</button>
                            <button type="button" data-action="export-data">${icon('download')}导出数据</button>
                        </div>
                        <p class="tw-template-status tw-data-status" role="status" aria-live="polite"></p>
                        <input class="tw-data-import" type="file" accept="application/json,.json" hidden>
                    </div>
                </section>
            </div>
        </div>
    </dialog>
</dialog>`;

const PANEL_CSS = `
/* 样式只作用于衣柜，避免改变酒馆主题或其他脚本界面。 */
#tw-menu-entry {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none;
    user-select: none;
    touch-action: manipulation;
}

#tw-panel {
    --tw-bg-base: #0d0e14;
    --tw-bg-surface: #13151f;
    --tw-bg-elevated: #191c28;
    --tw-bg-card: #171a26;
    --tw-bg-hover: #212536;
    --tw-bg-input: #0f1119;
    --tw-ink: #f2f3f8;
    --tw-ink-secondary: #c2c5d6;
    --tw-muted: #7f849c;
    --tw-line: rgba(255, 255, 255, 0.075);
    --tw-line-strong: rgba(255, 255, 255, 0.14);
    --tw-accent: #c084fc;
    --tw-accent-strong: #9333ea;
    --tw-accent-glow: rgba(192, 132, 252, 0.22);
    --tw-selected: rgba(168, 85, 247, 0.16);
    --tw-selected-border: rgba(192, 132, 252, 0.45);
    --tw-danger: #fb7185;
    --tw-danger-bg: rgba(244, 63, 94, 0.12);
    --tw-danger-border: rgba(244, 63, 94, 0.32);

    /* 主面板铺满酒馆视口，不再受桌面尺寸上限限制；动态高度随移动端浏览器工具栏变化。 */
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    min-width: 0;
    min-height: 0;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
    border: 0;
    border-radius: 0;
    overflow: hidden;
    background: var(--tw-bg-base);
    color: var(--tw-ink);
    color-scheme: dark;
    box-shadow: none;
    font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Inter", "SF Pro Text", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    text-align: left;
    text-shadow: none;
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
}

#tw-panel::backdrop {
    background: rgba(5, 6, 11, 0.68);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

#tw-panel, #tw-panel *, #tw-panel *::before, #tw-panel *::after {
    box-sizing: border-box;
}

/* 隐藏状态优先于组件的网格布局，确保收起的模型列表和未启用的 API 分组不占位。 */
#tw-panel [hidden] {
    display: none !important;
}

#tw-panel :is(h1, h2, h3, button, input, select, textarea, dl, dt, dd) {
    margin: 0;
    color: inherit;
    font: inherit;
    text-shadow: none;
    letter-spacing: normal;
}

#tw-panel button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: auto;
    min-width: 0;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    box-shadow: none;
    cursor: pointer;
    transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease, transform 0.12s ease, box-shadow 0.16s ease;
}

#tw-panel button:active:not(:disabled) {
    transform: scale(0.98);
}

#tw-panel button:disabled {
    opacity: 0.42;
    color: var(--tw-muted);
    cursor: not-allowed;
    transform: none;
}

#tw-panel button, #tw-panel .tw-brand {
    -webkit-user-select: none;
    user-select: none;
}

#tw-panel :is(button, input, select, textarea):focus-visible {
    outline: 2px solid var(--tw-accent);
    outline-offset: 2px;
}

#tw-panel .tw-icon {
    display: block;
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    stroke: currentColor;
    stroke-width: 1.75;
    stroke-linecap: round;
    stroke-linejoin: round;
}

/* 顶部工具栏独占一行；分类、列表和详情分别在自己的区域内滚动。 */
#tw-panel .tw-shell {
    display: grid;
    grid-template-rows: 66px minmax(0, 1fr);
    height: 100%;
    min-height: 0;
}

/* 顶部导航栏 */
#tw-panel .tw-header {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    padding: 0 20px;
    border-bottom: 1px solid var(--tw-line);
    background: linear-gradient(180deg, rgba(28, 31, 46, 0.85) 0%, rgba(19, 21, 31, 0.9) 100%);
}

#tw-panel .tw-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-right: auto;
}

#tw-panel .tw-brand > .tw-icon {
    width: 36px;
    height: 36px;
    padding: 7px;
    border: 1px solid rgba(192, 132, 252, 0.35);
    border-radius: 11px;
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.24), rgba(99, 102, 241, 0.12));
    color: #e9d5ff;
    box-shadow: 0 4px 14px -2px rgba(168, 85, 247, 0.25);
    stroke-width: 1.85;
}

#tw-panel h1 {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: 0.01em;
    color: #fff;
}

#tw-panel .tw-brand-subtitle {
    display: block;
    margin-top: 2px;
    color: var(--tw-muted);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

#tw-panel .tw-search {
    display: flex;
    align-items: center;
    gap: 8px;
    width: clamp(190px, 18vw, 270px);
    height: 36px;
    padding: 0 12px;
    border: 1px solid var(--tw-line);
    border-radius: 10px;
    background: var(--tw-bg-input);
    color: var(--tw-muted);
    transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

#tw-panel .tw-search:focus-within {
    border-color: var(--tw-selected-border);
    box-shadow: 0 0 0 3px rgba(192, 132, 252, 0.12);
}

#tw-panel .tw-search .tw-icon {
    width: 16px;
    height: 16px;
}

#tw-panel .tw-search input {
    width: 100%;
    min-width: 0;
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
    font-size: 13px;
}

#tw-panel .tw-search input::placeholder {
    color: var(--tw-muted);
    opacity: 0.75;
}

/* 使用原生排序菜单，键盘和触屏共用同一入口，无需额外管理弹层及焦点。 */
#tw-panel .tw-sort {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 8px;
    border: 1px solid var(--tw-line);
    border-radius: 10px;
    background: var(--tw-bg-input);
    color: var(--tw-muted);
}

#tw-panel .tw-sort select {
    width: auto;
    min-width: 0;
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
    font-size: 12px;
}

#tw-panel .tw-view-modes {
    display: flex;
    gap: 2px;
    padding: 3px;
    border: 1px solid var(--tw-line);
    border-radius: 10px;
    background: var(--tw-bg-input);
}

#tw-panel .tw-icon-button {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    color: var(--tw-ink-secondary);
}

#tw-panel .tw-view-modes .tw-icon-button {
    width: 30px;
    height: 28px;
    border-radius: 7px;
}

#tw-panel .tw-icon-button:not(:disabled):hover {
    background: var(--tw-bg-hover);
    color: #fff;
}

#tw-panel .tw-view-modes button[aria-pressed="true"] {
    background: var(--tw-bg-elevated);
    color: var(--tw-accent);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}

#tw-panel .tw-close:not(:disabled):hover {
    background: var(--tw-danger-bg);
    border-color: var(--tw-danger-border);
    color: var(--tw-danger);
}

/* 主体三栏工作区 */
#tw-panel .tw-body {
    display: grid;
    grid-template-columns: clamp(205px, 16.5vw, 248px) minmax(0, 1fr) clamp(310px, 26vw, 390px);
    min-width: 0;
    min-height: 0;
    background: var(--tw-bg-base);
}

/* 左侧分类边栏 */
#tw-panel .tw-sidebar {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding: 14px 12px 16px;
    border-right: 1px solid var(--tw-line);
    background: var(--tw-bg-surface);
    font-size: 13px;
}

#tw-panel .tw-mobile-filter,
#tw-panel .tw-mobile-actions {
    display: none;
}

#tw-panel .tw-category-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    /* 新增快捷筛选后侧栏需要滚动，保留细滚动条让桌面用户能发现下方入口。 */
    scrollbar-width: thin;
    scrollbar-color: var(--tw-line-strong) transparent;
}

#tw-panel .tw-category-list::-webkit-scrollbar {
    width: 5px;
}
#tw-panel .tw-category-list::-webkit-scrollbar-thumb { background: var(--tw-line-strong); border-radius: 5px; }

#tw-panel .tw-category {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    flex: 0 0 auto;
    width: 100%;
    min-height: 36px;
    padding: 6px 10px;
    border-radius: 9px;
    color: var(--tw-ink-secondary);
    font-size: 13px;
    font-weight: 500;
    text-align: left;
}

#tw-panel .tw-category > .tw-icon {
    width: 17px;
    height: 17px;
    color: var(--tw-muted);
    transition: color 0.16s ease;
}

#tw-panel .tw-category-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#tw-panel .tw-category:hover {
    background: rgba(255, 255, 255, 0.045);
    color: #fff;
}

#tw-panel .tw-category:hover > .tw-icon {
    color: var(--tw-ink-secondary);
}

#tw-panel .tw-category[aria-pressed="true"] {
    border-color: var(--tw-selected-border);
    background: linear-gradient(90deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.08) 100%);
    color: #fff;
    box-shadow: 0 2px 10px -2px rgba(147, 51, 234, 0.22);
}

#tw-panel .tw-category[aria-pressed="true"] > .tw-icon {
    color: var(--tw-accent);
}

#tw-panel .tw-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.055);
    color: var(--tw-muted);
    font-size: 11px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}

#tw-panel .tw-category[aria-pressed="true"] .tw-count {
    background: rgba(192, 132, 252, 0.24);
    color: #f3e8ff;
}

#tw-panel .tw-divider {
    flex-shrink: 0;
    width: 100%;
    margin: 8px 0;
    border: 0;
    border-top: 1px solid var(--tw-line);
}

/* 左下角导入导出区 */
#tw-panel .tw-selection-scope {
    display: grid;
    gap: 8px;
    flex: 0 0 auto;
    padding: 12px 0;
    color: var(--tw-ink-secondary);
}

#tw-panel .tw-selection-scope select {
    width: 100%;
    min-height: 38px;
    padding: 0 10px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 10px;
    background: var(--tw-bg-elevated);
    color: var(--tw-ink);
}

#tw-panel .tw-import-conflict {
    width: min(420px, calc(100% - 32px));
    padding: 20px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 14px;
    background: var(--tw-bg-surface);
    color: var(--tw-ink);
}

#tw-panel .tw-import-conflict::backdrop { background: rgb(0 0 0 / 55%); }
#tw-panel .tw-import-conflict p { overflow-wrap: anywhere; }
#tw-panel .tw-import-conflict form { display: flex; flex-wrap: wrap; gap: 8px; }
#tw-panel .tw-import-conflict button { flex: 1; justify-content: center; padding: 10px; }

/* 文件夹只授予本地文件读取权限，缩略图在插件内直接勾选，确认前不上传。 */
#tw-panel #tw-import-picker {
    width: min(820px, calc(100vw - 24px));
    max-height: calc(100dvh - 32px);
    margin: auto;
    padding: 18px;
    overflow-y: auto;
    border: 1px solid var(--tw-line-strong);
    border-radius: 14px;
    background: var(--tw-bg-surface);
    color: var(--tw-ink);
}
#tw-panel #tw-import-picker::backdrop { background: rgb(0 0 0 / 65%); }
#tw-panel #tw-import-picker header, #tw-panel #tw-import-picker footer, #tw-panel .tw-import-tools {
    display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
}
#tw-panel #tw-import-picker header, #tw-panel #tw-import-picker footer { justify-content: space-between; }
#tw-panel #tw-import-picker button { min-height: 38px; padding: 8px 12px; border-color: var(--tw-line-strong); background: var(--tw-bg-elevated); }
#tw-panel .tw-import-tools { margin: 14px 0; }
/* 文件夹可能包含大量图片，只让缩略图区滚动，保留全选和确认按钮在可见范围。 */
#tw-panel .tw-import-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(125px, 1fr)); gap: 10px; max-height: min(55dvh, 480px); overflow-y: auto; }
#tw-panel .tw-import-card {
    position: relative; display: flex; flex-direction: column; gap: 6px; min-width: 0; padding: 8px;
    border: 1px solid var(--tw-line-strong); border-radius: 10px; cursor: pointer;
}
#tw-panel .tw-import-card:has(:checked) { border-color: var(--tw-selected-border); background: var(--tw-selected); }
#tw-panel .tw-import-card input { position: absolute; top: 12px; right: 12px; width: 18px; height: 18px; accent-color: var(--tw-accent-strong); }
#tw-panel .tw-import-card img { width: 100%; height: 120px; object-fit: contain; border-radius: 6px; }
#tw-panel .tw-import-card > .tw-icon { width: 100%; height: 120px; }
#tw-panel .tw-import-card span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
#tw-panel .tw-import-status { color: var(--tw-danger); }
#tw-panel #tw-import-picker footer { margin-top: 14px; }
#tw-panel [data-action="confirm-import"] { background: var(--tw-accent-strong); }

#tw-panel .tw-import-footer {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
    flex: 0 0 auto;
    padding-top: 12px;
    margin-top: 6px;
    border-top: 1px solid var(--tw-line);
}

#tw-panel .tw-import-footer button {
    justify-content: center;
    height: 38px;
    padding: 0 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
}

#tw-panel .tw-import-footer .tw-import {
    border-color: rgba(192, 132, 252, 0.45);
    background: linear-gradient(135deg, #9333ea 0%, #6366f1 100%);
    color: #fff;
    box-shadow: 0 6px 16px -4px rgba(147, 51, 234, 0.5);
}

#tw-panel .tw-import-footer .tw-import:not(:disabled):hover {
    filter: brightness(1.08);
    box-shadow: 0 8px 20px -4px rgba(147, 51, 234, 0.65);
}

#tw-panel .tw-import-footer .tw-export-all {
    margin-top: 0;
    border-color: var(--tw-line-strong);
    background: var(--tw-bg-elevated);
    color: var(--tw-ink-secondary);
}

#tw-panel .tw-import-footer .tw-export-all:not(:disabled):hover {
    background: var(--tw-bg-hover);
    color: #fff;
}

/* 中栏不留外边距，标签栏贴齐左右和顶部；卡片内容单独保留阅读留白。 */
#tw-panel .tw-library {
    display: flex;
    flex-direction: column;
    container-type: inline-size;
    min-width: 0;
    min-height: 0;
    padding: 0;
    overflow: hidden;
    background: var(--tw-bg-base);
}

#tw-panel .tw-library-content {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 16px 22px 18px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.14) transparent;
}

#tw-panel .tw-group-bar,
#tw-panel .tw-group-tabs,
#tw-panel .tw-bulk-actions {
    display: flex;
    align-items: center;
    gap: 6px;
}

#tw-panel .tw-group-bar {
    flex-shrink: 0;
    padding: 8px 12px;
    border: 0;
    border-bottom: 1px solid var(--tw-line);
    border-radius: 0;
    background: var(--tw-bg-surface);
    font-size: 13px;
}

#tw-panel .tw-group-tabs {
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
}

#tw-panel .tw-group-tabs::-webkit-scrollbar {
    display: none;
}

#tw-panel .tw-group-bar > button,
#tw-panel .tw-group-tabs > button {
    flex-shrink: 0;
    min-height: 32px;
    padding: 4px 12px;
    border-radius: 8px;
    border-color: transparent;
    color: var(--tw-ink-secondary);
    font-size: 12.5px;
    font-weight: 500;
}

#tw-panel .tw-group-bar > button {
    border-color: var(--tw-line);
    background: var(--tw-bg-elevated);
}

#tw-panel .tw-group-bar > button:hover,
#tw-panel .tw-group-tabs > button:hover {
    background: var(--tw-bg-hover);
    color: #fff;
}

#tw-panel .tw-group-tabs button {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#tw-panel .tw-group-tabs > button[aria-pressed="true"] {
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: #f3e8ff;
}

#tw-panel [data-action="toggle-multi"][aria-pressed="true"] {
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: var(--tw-accent);
}

/* 自定义标签胶囊 */
#tw-panel .tw-group-tab {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    border: 1px solid transparent;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    transition: background-color 0.16s ease, border-color 0.16s ease;
}

#tw-panel .tw-group-tab:hover {
    background: var(--tw-bg-hover);
}

#tw-panel .tw-group-tab[data-active="true"] {
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: #f3e8ff;
}

#tw-panel .tw-group-tab button {
    min-height: 30px;
    padding: 4px 8px 4px 10px;
    border: 0;
    font-size: 12.5px;
}

#tw-panel .tw-group-tab [data-delete-group] {
    min-height: 26px;
    padding: 4px 6px;
    border-radius: 6px;
    color: var(--tw-muted);
}

#tw-panel .tw-group-tab [data-delete-group]:hover {
    color: var(--tw-danger);
    background: var(--tw-danger-bg);
}

#tw-panel [data-delete-group] .tw-icon {
    width: 14px;
    height: 14px;
}

/* 批量操作悬浮底栏 */
#tw-panel .tw-bulk-actions {
    flex-shrink: 0;
    margin: 10px 20px 18px;
    padding: 6px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 14px;
    background: rgba(25, 28, 40, 0.92);
    backdrop-filter: blur(12px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
    font-size: 12.5px;
}

#tw-panel .tw-bulk-main {
    /* 批量控件增加后按可用宽度换行，桌面和窄屏都保留完整操作入口。 */
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
}

#tw-panel .tw-bulk-selection {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    padding: 0 10px;
    white-space: nowrap;
    cursor: pointer;
    font-weight: 500;
}

#tw-panel .tw-bulk-actions :is(button, select),
#tw-panel [data-action="remove-image"],
#tw-panel [data-action="replace-image"] {
    min-height: 36px;
    padding: 6px 12px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 9px;
    background: var(--tw-bg-elevated);
    font-size: 12.5px;
}

#tw-panel .tw-bulk-actions button:not(:disabled):hover,
#tw-panel [data-action="remove-image"]:not(:disabled):hover,
#tw-panel [data-action="replace-image"]:not(:disabled):hover {
    background: var(--tw-bg-hover);
}

#tw-panel .tw-bulk-actions select {
    width: 100%;
    min-width: 0;
    text-overflow: ellipsis;
}

#tw-panel .tw-bulk-actions button {
    gap: 6px;
    white-space: nowrap;
}

#tw-panel .tw-bulk-picker {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    flex: 1 1 115px;
    padding: 0 10px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 9px;
    background: var(--tw-bg-elevated);
}

/* 标签和搭配编辑复用原生模态框，保存前不改变存档，Escape 保留原数据。 */
#tw-panel #tw-group-manager,
#tw-panel #tw-combination-editor {
    width: min(480px, calc(100vw - 24px));
    max-height: calc(100dvh - 40px);
    margin: auto;
    padding: 20px;
    overflow-y: auto;
    border: 1px solid var(--tw-line-strong);
    border-radius: 14px;
    background: var(--tw-bg-surface);
    color: var(--tw-ink);
}
#tw-panel #tw-group-manager::backdrop { background: rgba(5, 6, 11, 0.68); }
#tw-panel #tw-combination-editor::backdrop { background: rgba(5, 6, 11, 0.68); }
/* 搭配复用原服装，不生成拼接图片；可滚动成员列表同时适配手机和键盘选择。 */
#tw-panel .tw-combination-name { display: grid; gap: 8px; }
#tw-panel .tw-combination-name input { width: 100%; padding: 8px; background: var(--tw-bg-input); border: 1px solid var(--tw-line-strong); border-radius: 8px; }
#tw-panel .tw-combination-items { display: grid; gap: 8px; margin: 16px 0; max-height: 50dvh; overflow-y: auto; }
#tw-panel .tw-combination-item { display: flex; align-items: center; gap: 10px; min-height: 44px; cursor: pointer; }
#tw-panel .tw-combination-item img { width: 44px; height: 52px; object-fit: contain; }
#tw-panel .tw-combination-status { color: var(--tw-danger); }
/* 编辑成员属于描述页的独立操作区，与整套正文编辑框保持清晰间距。 */
#tw-panel .tw-combination-details {
    margin-bottom: 12px;
    padding: 12px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 10px;
    background: var(--tw-bg-elevated);
}
#tw-panel .tw-combination-details button { width: 100%; min-height: 38px; }
/* 顶部增加合并入口后，窄屏标签独占一行，操作按钮可换行，避免挤出手机视口。 */
@media (max-width: 540px) {
    #tw-panel .tw-group-bar { flex-wrap: wrap; }
    #tw-panel .tw-group-tabs { flex-basis: 100%; }
}
#tw-panel .tw-group-rows { display: grid; gap: 8px; margin: 16px 0; }
#tw-panel .tw-group-row { display: flex; align-items: center; gap: 8px; }
#tw-panel .tw-group-row input {
    flex: 1;
    min-width: 0;
    padding: 8px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 8px;
    background: var(--tw-bg-input);
}
#tw-panel .tw-group-row button { min-width: 36px; min-height: 36px; border-color: var(--tw-line-strong); }
#tw-panel .tw-group-status { color: var(--tw-danger); }

#tw-panel .tw-bulk-picker select {
    padding: 6px 0;
    border: 0;
    background: transparent;
    cursor: pointer;
}

#tw-panel .tw-bulk-actions .tw-bulk-delete {
    flex-shrink: 0;
    gap: 6px;
    border-color: var(--tw-danger-border);
    background: var(--tw-danger-bg);
    color: var(--tw-danger);
}

#tw-panel .tw-bulk-actions .tw-bulk-delete:not(:disabled):hover {
    background: rgba(244, 63, 94, 0.22);
}

#tw-panel .tw-bulk-actions .tw-icon {
    width: 16px;
    height: 16px;
}

#tw-panel .tw-bulk-apply-picker {
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: #f3e8ff;
}

@container (max-width: 480px) {
    #tw-panel .tw-bulk-actions {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
        gap: 6px;
    }
    #tw-panel .tw-bulk-main {
        display: contents;
    }
    #tw-panel .tw-bulk-selection {
        grid-column: 1;
        grid-row: 1;
    }
    #tw-panel .tw-bulk-apply-picker {
        grid-column: 2 / 4;
        grid-row: 1;
    }
    #tw-panel .tw-bulk-group-picker {
        grid-column: 1;
        grid-row: 2;
    }
    #tw-panel .tw-bulk-category-picker {
        grid-column: 2 / 4;
        grid-row: 2;
    }
    #tw-panel .tw-bulk-favorite-picker {
        grid-column: 1;
        grid-row: 3;
    }
    #tw-panel [data-bulk="export"] {
        grid-column: 2;
        grid-row: 3;
    }
    #tw-panel .tw-bulk-delete {
        grid-column: 3;
        grid-row: 3;
    }
}

#tw-panel .tw-library-status {
    margin: 0 0 12px;
    padding: 8px 12px;
    border-radius: 9px;
    border: 1px solid rgba(192, 132, 252, 0.25);
    background: rgba(168, 85, 247, 0.1);
    overflow-wrap: anywhere;
    color: #e9d5ff;
    font-size: 12.5px;
}

#tw-panel .tw-library-status:empty {
    display: none;
}

#tw-panel .tw-library-status[data-error="true"] {
    border-color: var(--tw-danger-border);
    background: var(--tw-danger-bg);
    color: #fda4af;
}

#tw-panel .tw-selection-count {
    color: var(--tw-ink-secondary);
}

/* 服装卡片与网格 */
#tw-panel .tw-garment-entry {
    position: relative;
    min-width: 0;
}

#tw-panel .tw-item-check,
#tw-panel .tw-favorite {
    position: absolute;
    z-index: 2;
    top: 8px;
    right: 8px;
    place-items: center;
    width: 32px;
    height: 32px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 9px;
    background: rgba(13, 14, 20, 0.78);
    backdrop-filter: blur(6px);
    cursor: pointer;
}

/* 普通模式彻底隐藏勾选框，鼠标悬停和键盘聚焦都不会意外进入多选。 */
#tw-panel .tw-item-check {
    display: none;
}

#tw-panel .tw-library[data-multi-select="true"] .tw-item-check {
    display: grid;
}

#tw-panel .tw-favorite {
    display: grid;
    border: 0;
    border-radius: 50%;
    padding: 0;
    color: var(--tw-ink-secondary);
}

#tw-panel .tw-favorite:hover,
#tw-panel .tw-favorite[aria-pressed="true"] {
    color: #f472b6;
}

#tw-panel .tw-favorite[aria-pressed="true"] .tw-icon {
    fill: currentColor;
}

#tw-panel .tw-library[data-multi-select="true"] .tw-favorite {
    display: none;
}

#tw-panel :is(.tw-item-check, .tw-bulk-actions) input {
    width: 17px;
    height: 17px;
    accent-color: var(--tw-accent-strong);
    cursor: pointer;
}

#tw-panel .tw-garment-entry[data-checked="true"] .tw-garment-card {
    border-color: var(--tw-accent);
    box-shadow: 0 0 0 2px var(--tw-accent-glow);
}

#tw-panel .tw-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(156px, 100%), 1fr));
    gap: 14px;
    width: 100%;
}

#tw-panel .tw-garment-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    justify-content: stretch;
    justify-items: stretch;
    align-content: start;
    gap: 8px;
    width: 100%;
    padding: 10px;
    overflow: hidden;
    border: 1px solid var(--tw-line);
    border-radius: 14px;
    background: var(--tw-bg-card);
    text-align: left;
    transition: transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
}

#tw-panel .tw-garment-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.16);
    background: var(--tw-bg-elevated);
    box-shadow: 0 10px 24px -8px rgba(0, 0, 0, 0.55);
}

#tw-panel .tw-garment-card[aria-pressed="true"] {
    border-color: var(--tw-selected-border);
    background: linear-gradient(180deg, rgba(168, 85, 247, 0.18) 0%, rgba(25, 28, 40, 0.95) 100%);
    box-shadow: 0 0 0 1px rgba(192, 132, 252, 0.3), 0 10px 24px -6px rgba(147, 51, 234, 0.28);
}

#tw-panel .tw-garment-card img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: contain;
    padding: 6px;
    border-radius: 10px;
    background: radial-gradient(circle at 50% 42%, #23273a 0%, #10121b 100%);
}

#tw-panel .tw-garment-card > .tw-icon {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    padding: 34px;
    border-radius: 10px;
    background: radial-gradient(circle at 50% 42%, #202436 0%, #10121b 100%);
    color: var(--tw-muted);
}

#tw-panel .tw-garment-card span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13.5px;
    font-weight: 600;
    color: var(--tw-ink);
}

/* 穿着状态与标签并排显示，标签容器占据右侧；空间不足时换行，长标签省略但保留完整提示。 */
#tw-panel .tw-card-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    min-width: 0;
}

#tw-panel .tw-card-tags {
    display: flex;
    justify-content: flex-end;
    min-width: 0;
    max-width: 100%;
    margin-left: auto;
}

#tw-panel .tw-garment-card small {
    min-width: 0;
    max-width: 100%;
    padding: 2px 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: 999px;
    background: rgba(192, 132, 252, 0.14);
    border: 1px solid rgba(192, 132, 252, 0.24);
    color: #e9d5ff;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.4;
}

#tw-panel .tw-library[data-layout="list"] .tw-items {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
}

#tw-panel .tw-library[data-layout="list"] .tw-garment-card {
    grid-template-columns: 56px minmax(0, 1fr);
    align-items: center;
    gap: 4px 12px;
    padding: 8px 48px 8px 10px;
}

#tw-panel .tw-library[data-layout="list"] .tw-garment-card :is(img, .tw-icon) {
    grid-row: 1 / 3;
    width: 56px;
    height: 56px;
    padding: 4px;
}

#tw-panel .tw-library[data-layout="list"] :is(.tw-item-check, .tw-favorite) {
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
}

/* 空状态 */
#tw-panel .tw-empty {
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 14px;
    min-height: 280px;
    padding: 36px 20px;
    color: var(--tw-muted);
    text-align: center;
}

#tw-panel .tw-empty > .tw-icon {
    width: 76px;
    height: 76px;
    padding: 18px;
    border-radius: 22px;
    border: 1px dashed var(--tw-line-strong);
    background: rgba(255, 255, 255, 0.02);
    color: var(--tw-muted);
    stroke-width: 1.35;
    overflow: visible;
}

#tw-panel h2 {
    font-size: 16px;
    font-weight: 500;
    color: var(--tw-ink-secondary);
}

/* 右侧详情与预览栏 */
#tw-panel .tw-details {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    min-height: 0;
    padding: 16px 18px 20px;
    overflow-y: auto;
    border-left: 1px solid var(--tw-line);
    background: var(--tw-bg-surface);
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.14) transparent;
}

#tw-panel .tw-wearer-modes {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    flex: 0 0 auto;
}

#tw-panel .tw-wearer-modes label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 38px;
    padding: 6px 12px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 10px;
    background: var(--tw-bg-elevated);
    color: var(--tw-ink-secondary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.16s ease;
}

#tw-panel .tw-wearer-modes label:hover {
    background: var(--tw-bg-hover);
    color: #fff;
}

#tw-panel .tw-wearer-modes label:has(:checked) {
    border-color: var(--tw-selected-border);
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.24), rgba(99, 102, 241, 0.16));
    color: #f3e8ff;
    box-shadow: 0 4px 12px -2px rgba(147, 51, 234, 0.25);
}

#tw-panel .tw-preview {
    position: relative;
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: clamp(200px, 28dvh, 290px);
    padding: 12px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 14px;
    background:
        radial-gradient(circle at 50% 35%, rgba(168, 85, 247, 0.14) 0%, rgba(15, 17, 25, 0.96) 72%),
        var(--tw-bg-input);
    color: var(--tw-muted);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

#tw-panel .tw-preview > .tw-icon {
    width: 56px;
    height: 56px;
    color: rgba(192, 132, 252, 0.45);
    stroke-width: 1.5;
}

#tw-panel .tw-preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 8px;
    filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45));
}
/* 用原图组成预览网格，保留每件成员的名称；发送与备份仍使用独立图片。 */
#tw-panel .tw-preview[data-combination="true"] { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: minmax(0, 1fr); gap: 8px; }
#tw-panel .tw-preview-member { display: flex; flex-direction: column; align-items: center; min-height: 0; min-width: 0; gap: 4px; }
#tw-panel .tw-preview-member img { flex: 1; min-height: 0; }
#tw-panel .tw-preview-member span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; }

#tw-panel .tw-details :is(input, select, textarea) {
    width: 100%;
    min-width: 0;
    padding: 8px 11px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 9px;
    background: var(--tw-bg-input);
    color: var(--tw-ink);
    font-size: 13px;
    box-shadow: none;
    transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

#tw-panel .tw-details :is(input, select, textarea):focus {
    border-color: var(--tw-selected-border);
    box-shadow: 0 0 0 3px rgba(192, 132, 252, 0.12);
}

#tw-panel .tw-wearer-modes input {
    width: 16px;
    height: 16px;
    margin: 0;
    padding: 0;
    accent-color: var(--tw-accent-strong);
    cursor: pointer;
}

#tw-panel .tw-details textarea {
    min-height: 170px;
    line-height: 1.6;
    resize: vertical;
}

#tw-panel .tw-garment-tag {
    display: grid;
    gap: 8px;
    padding: 6px 0;
    color: var(--tw-ink-secondary);
    font-size: 13px;
}

#tw-panel .tw-description-actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    margin-bottom: 10px;
}

#tw-panel .tw-describe {
    min-height: 36px;
    padding: 6px 14px;
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: #f3e8ff;
    font-size: 12.5px;
    font-weight: 600;
}

#tw-panel .tw-describe:not(:disabled):hover {
    background: rgba(168, 85, 247, 0.26);
}

#tw-panel .tw-garment-status {
    margin: 0;
    overflow-wrap: anywhere;
    color: var(--tw-accent);
    font-size: 12.5px;
    text-align: center;
}

#tw-panel .tw-garment-status:empty {
    display: none;
}

#tw-panel .tw-garment-status[data-error="true"] {
    color: var(--tw-danger);
}

/* 详情只保留信息、描述和标签三页，等宽填满导航。 */
#tw-panel .tw-detail-tabs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    flex: 0 0 auto;
    padding: 4px;
    border: 1px solid var(--tw-line);
    border-radius: 11px;
    background: var(--tw-bg-input);
}

#tw-panel .tw-detail-tabs button {
    position: relative;
    gap: 5px;
    min-height: 34px;
    border-radius: 8px;
    color: var(--tw-muted);
    font-size: 12.5px;
    font-weight: 500;
    white-space: nowrap;
}

#tw-panel .tw-detail-tabs button:hover {
    color: var(--tw-ink-secondary);
}

#tw-panel .tw-detail-tabs .tw-icon {
    width: 15px;
    height: 15px;
}

#tw-panel .tw-detail-tabs button[aria-pressed="true"] {
    background: var(--tw-bg-elevated);
    color: #f3e8ff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
}

#tw-panel .tw-detail-content {
    flex: 1 0 auto;
    min-height: 160px;
}

#tw-panel .tw-properties {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    align-items: center;
    gap: 14px 12px;
    padding: 6px 0 12px;
    color: var(--tw-ink-secondary);
    font-size: 13px;
}

#tw-panel .tw-properties dd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

/* 图片状态与两个操作分行，避免窄详情栏把按钮文字挤成多行。 */
#tw-panel .tw-properties .tw-image-actions { flex-wrap: wrap; justify-content: flex-start; gap: 6px; }
#tw-panel #tw-garment-image-state { flex-basis: 100%; }

/* 详情底部操作按钮组 */
#tw-panel .tw-detail-actions {
    display: grid;
    gap: 10px;
    flex: 0 0 auto;
    padding-top: 12px;
    border-top: 1px solid var(--tw-line);
}

#tw-panel .tw-action-row {
    display: grid;
    grid-template-columns: 1.35fr 1fr 1fr;
    gap: 8px;
}

#tw-panel .tw-action-row button {
    min-height: 40px;
    padding: 0 10px;
    border-color: var(--tw-line-strong);
    border-radius: 10px;
    background: var(--tw-bg-elevated);
    color: var(--tw-ink-secondary);
    font-size: 13px;
    font-weight: 600;
}

#tw-panel .tw-action-row button:not(:disabled):hover {
    background: var(--tw-bg-hover);
    color: #fff;
}

#tw-panel .tw-action-row [data-action="save-garment"]:not(:disabled) {
    border-color: rgba(192, 132, 252, 0.45);
    background: linear-gradient(135deg, #9333ea 0%, #6366f1 100%);
    color: #fff;
    box-shadow: 0 4px 14px -3px rgba(147, 51, 234, 0.45);
}

#tw-panel .tw-action-row [data-action="save-garment"]:not(:disabled):hover {
    filter: brightness(1.08);
}

#tw-panel .tw-action-row .tw-icon {
    width: 16px;
    height: 16px;
}

#tw-panel .tw-action-row .tw-delete {
    border-color: var(--tw-danger-border);
    background: var(--tw-danger-bg);
    color: var(--tw-danger);
}

#tw-panel .tw-action-row .tw-delete:not(:disabled):hover {
    background: rgba(244, 63, 94, 0.22);
    color: #fda4af;
}

/* 设置弹窗宽高较原尺寸扩大 20%，保留视口边距以便小窗口仍能完整显示。 */
#tw-panel #tw-settings {
    inset: 0;
    width: min(1056px, calc(100% - 48px));
    height: min(768px, calc(100% - 48px));
    max-width: none;
    max-height: none;
    margin: auto;
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--tw-line-strong);
    border-radius: 18px;
    background: var(--tw-bg-surface);
    color: var(--tw-ink);
    font: inherit;
    text-align: left;
    box-shadow: 0 28px 70px -12px rgba(0, 0, 0, 0.82);
}

#tw-panel #tw-settings[open] {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
}

#tw-panel #tw-settings::backdrop {
    background: rgba(4, 5, 10, 0.65);
    backdrop-filter: blur(6px);
}

#tw-panel .tw-settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 22px;
    border-bottom: 1px solid var(--tw-line);
    background: var(--tw-bg-elevated);
}

#tw-panel .tw-settings-body {
    display: grid;
    grid-template-columns: 185px minmax(0, 1fr);
    min-height: 0;
}

#tw-panel .tw-settings-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 14px 10px;
    overflow-y: auto;
    border-right: 1px solid var(--tw-line);
    background: var(--tw-bg-base);
}

#tw-panel .tw-settings-nav button {
    flex: 0 0 auto;
    justify-content: flex-start;
    min-height: 38px;
    padding: 8px 12px;
    border-radius: 9px;
    color: var(--tw-ink-secondary);
    font-size: 13px;
    font-weight: 500;
}

#tw-panel .tw-settings-nav button:hover {
    background: rgba(255, 255, 255, 0.04);
    color: #fff;
}

#tw-panel .tw-settings-nav button[aria-pressed="true"] {
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: #f3e8ff;
}

#tw-panel .tw-settings-content {
    min-width: 0;
    min-height: 0;
    padding: 24px 28px;
    overflow-y: auto;
    overscroll-behavior: contain;
}

#tw-panel .tw-settings-content h3 {
    margin-bottom: 18px;
    font-size: 17px;
    font-weight: 600;
    color: #fff;
}

#tw-panel .tw-api-form,
#tw-panel .tw-api-fields,
#tw-panel .tw-api-custom {
    display: grid;
    gap: 16px;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
}

#tw-panel .tw-api-field {
    display: grid;
    gap: 6px;
    min-width: 0;
}

#tw-panel .tw-api-field > :is(span, label):first-child {
    color: var(--tw-ink-secondary);
    font-size: 13px;
    font-weight: 500;
}

#tw-panel .tw-api-field :is(input, select) {
    width: 100%;
    min-width: 0;
    min-height: 38px;
    padding: 8px 12px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 9px;
    background: var(--tw-bg-input);
    box-shadow: none;
    color-scheme: dark;
    font-size: 13px;
}

#tw-panel .tw-api-field input::placeholder {
    color: var(--tw-muted);
    opacity: 0.75;
}

#tw-panel .tw-api-input-action {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
}

#tw-panel .tw-api-input-action input {
    flex: 1 1 0;
}

#tw-panel .tw-api-form button {
    flex: 0 0 auto;
    min-height: 38px;
    padding: 6px 14px;
    border-color: var(--tw-line-strong);
    border-radius: 9px;
    background: var(--tw-bg-elevated);
    font-size: 13px;
    font-weight: 500;
}

#tw-panel .tw-api-form button:not(:disabled):hover {
    background: var(--tw-bg-hover);
}

#tw-panel .tw-model-picker {
    display: grid;
    flex: 1 1 0;
    align-content: start;
    gap: 6px;
    min-width: 0;
}

#tw-panel .tw-model-control {
    display: flex;
    align-items: center;
    min-width: 0;
    border: 1px solid var(--tw-line-strong);
    border-radius: 9px;
    background: var(--tw-bg-input);
}

#tw-panel .tw-model-control:focus-within {
    border-color: var(--tw-selected-border);
}

#tw-panel .tw-model-control input {
    border: 0;
    background: transparent;
}

#tw-panel .tw-model-control input:focus-visible {
    outline-offset: -3px;
}

#tw-panel .tw-model-control button {
    width: 36px;
    min-height: 36px;
    padding: 6px;
    border: 0;
    background: transparent;
    color: var(--tw-muted);
}

#tw-panel .tw-model-control .tw-icon {
    width: 16px;
    height: 16px;
}

#tw-panel .tw-model-options {
    display: grid;
    gap: 3px;
    max-height: 200px;
    padding: 6px;
    overflow-y: auto;
    overscroll-behavior: contain;
    border: 1px solid var(--tw-line-strong);
    border-radius: 10px;
    background: var(--tw-bg-elevated);
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.16) transparent;
}

#tw-panel .tw-model-options button {
    justify-content: flex-start;
    width: 100%;
    min-height: 34px;
    padding: 6px 10px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    text-align: left;
    overflow-wrap: anywhere;
}

#tw-panel .tw-model-options button:is(:hover, [aria-selected="true"]) {
    background: var(--tw-selected);
    color: #f3e8ff;
}

#tw-panel .tw-model-empty {
    padding: 8px 10px;
    color: var(--tw-muted);
    font-size: 12.5px;
}

#tw-panel .tw-model-empty[data-error="true"] {
    color: var(--tw-danger);
}

#tw-panel .tw-api-parameters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr));
    gap: 14px;
}

#tw-panel .tw-api-actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 4px;
}

#tw-panel .tw-api-actions .tw-api-save,
#tw-panel .tw-send-actions button {
    min-height: 38px;
    padding: 6px 20px;
    border-color: rgba(192, 132, 252, 0.45);
    border-radius: 9px;
    background: linear-gradient(135deg, #9333ea 0%, #6366f1 100%);
    color: #fff;
    font-weight: 600;
    box-shadow: 0 4px 14px -3px rgba(147, 51, 234, 0.45);
}

#tw-panel .tw-api-actions .tw-api-save:hover,
#tw-panel .tw-send-actions button:hover {
    filter: brightness(1.08);
}

#tw-panel .tw-api-status,
#tw-panel .tw-send-status,
#tw-panel .tw-template-status {
    min-height: 22px;
    margin: 0;
    overflow-wrap: anywhere;
    color: var(--tw-accent);
    font-size: 13px;
}

#tw-panel .tw-api-status[data-error="true"],
#tw-panel .tw-send-status[data-error="true"],
#tw-panel .tw-template-status[data-error="true"] {
    color: var(--tw-danger);
}

/* 发送设置单选卡 */
#tw-panel .tw-send-form {
    display: grid;
    gap: 20px;
    min-width: 0;
}

#tw-panel .tw-send-group {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
}

#tw-panel .tw-send-group legend {
    margin: 0 0 10px;
    padding: 0;
    color: var(--tw-ink-secondary);
    font: inherit;
    font-size: 13px;
    font-weight: 500;
}

#tw-panel .tw-send-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr));
    gap: 10px;
}

#tw-panel .tw-send-choice {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 46px;
    padding: 10px 14px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 10px;
    background: var(--tw-bg-input);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.16s ease;
}

#tw-panel .tw-send-choice:hover {
    background: var(--tw-bg-elevated);
}

#tw-panel .tw-send-choice:has(input:checked) {
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: #f3e8ff;
    box-shadow: 0 2px 10px -2px rgba(147, 51, 234, 0.25);
}

#tw-panel .tw-send-choice input {
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
    accent-color: var(--tw-accent-strong);
}

#tw-panel .tw-send-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-end;
}

/* 模板编辑表单 */
#tw-panel .tw-template-form,
#tw-panel .tw-template-form label {
    display: grid;
    gap: 8px;
    min-width: 0;
}

#tw-panel .tw-template-form {
    gap: 18px;
}

#tw-panel .tw-template-form small,
#tw-panel .tw-template-hint {
    color: var(--tw-muted);
    font-size: 12px;
}

#tw-panel .tw-template-form textarea {
    width: 100%;
    min-height: 136px;
    padding: 10px 12px;
    resize: vertical;
    border: 1px solid var(--tw-line-strong);
    border-radius: 10px;
    background: var(--tw-bg-input);
    color: inherit;
    font: inherit;
    font-size: 13px;
    line-height: 1.6;
    box-shadow: none;
}

#tw-panel .tw-template-form textarea:focus {
    border-color: var(--tw-selected-border);
    box-shadow: 0 0 0 3px rgba(192, 132, 252, 0.12);
}

#tw-panel .tw-template-hint {
    margin: 0;
    padding: 8px 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    overflow-wrap: anywhere;
    line-height: 1.7;
}

/* 移动端与紧凑视口响应式布局 */
@media (max-width: 900px), (max-height: 500px) and (pointer: coarse) {
    #tw-panel {
        padding-bottom: 0;
    }
    #tw-panel .tw-shell {
        grid-template-rows: auto minmax(0, 1fr) auto;
    }
    #tw-panel .tw-header {
        flex-wrap: wrap;
        gap: 8px;
        padding: 10px 14px;
    }
    #tw-panel .tw-body {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto minmax(0, 1fr);
        overflow: hidden;
    }
    #tw-panel .tw-sidebar {
        display: grid;
        grid-template-columns: 40px minmax(0, 1fr);
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-right: 0;
        border-bottom: 1px solid var(--tw-line);
    }
    #tw-panel .tw-mobile-filter {
        position: relative;
        display: grid;
        width: 40px;
        height: 40px;
        place-items: center;
        border: 1px solid var(--tw-line-strong);
        border-radius: 10px;
        background: var(--tw-bg-elevated);
        color: #e9d5ff;
    }
    #tw-panel .tw-mobile-filter .tw-icon {
        width: 18px;
        height: 18px;
    }
    #tw-panel .tw-mobile-filter select {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        font-size: 16px;
    }
    #tw-panel .tw-mobile-filter:focus-within {
        outline: 2px solid var(--tw-accent);
        outline-offset: 2px;
    }
    #tw-panel .tw-category-list {
        flex-direction: row;
        gap: 6px;
        min-width: 0;
        padding: 2px;
        overflow-x: auto;
        overflow-y: hidden;
        overscroll-behavior-x: contain;
        scrollbar-width: none;
        scroll-behavior: auto;
    }
    /* 窄屏分类栏下方保留范围入口，不随桌面的导入区一起隐藏。 */
    #tw-panel .tw-selection-scope {
        grid-column: 1 / -1;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
        padding: 0;
    }
    #tw-panel .tw-category {
        display: inline-flex;
        flex: 0 0 auto;
        gap: 6px;
        width: auto;
        min-height: 38px;
        padding: 6px 12px;
        font-size: 13px;
    }
    #tw-panel .tw-category > .tw-icon {
        width: 16px;
        height: 16px;
    }
    #tw-panel .tw-count,
    #tw-panel .tw-divider,
    #tw-panel .tw-import-footer {
        display: none;
    }
    #tw-panel .tw-library {
        min-height: 0;
        margin: 0;
        overscroll-behavior: contain;
    }
    #tw-panel .tw-library-content {
        padding: 12px;
    }
    #tw-panel .tw-bulk-actions {
        margin: 10px 12px 12px;
    }
    #tw-panel .tw-empty {
        gap: 10px;
        min-height: 200px;
        padding: 16px 0;
    }
    #tw-panel .tw-empty > .tw-icon {
        width: 64px;
        height: 64px;
    }
    #tw-panel h2 {
        font-size: 15px;
    }
    #tw-panel .tw-details {
        display: none;
        grid-column: 1;
        grid-row: 1 / -1;
        padding: 14px 14px 20px;
        border-left: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
    }
    #tw-panel[data-mobile-screen="details"] .tw-sidebar,
    #tw-panel[data-mobile-screen="details"] .tw-library {
        display: none;
    }
    #tw-panel[data-mobile-screen="details"] .tw-details {
        display: flex;
    }
    #tw-panel .tw-preview {
        height: 210px;
    }
    #tw-panel .tw-properties {
        grid-template-columns: 64px minmax(0, 1fr);
    }
    #tw-panel .tw-mobile-actions {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(104px, 1.25fr);
        gap: 8px;
        padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
        border-top: 1px solid var(--tw-line);
        background: var(--tw-bg-surface);
    }
    #tw-panel .tw-mobile-actions button {
        gap: 6px;
        min-height: 44px;
        padding: 8px 10px;
        border-color: var(--tw-line-strong);
        border-radius: 10px;
        background: var(--tw-bg-elevated);
        color: var(--tw-ink-secondary);
        font-size: 13px;
        font-weight: 600;
    }
    #tw-panel .tw-mobile-actions .tw-mobile-import {
        border-color: rgba(192, 132, 252, 0.45);
        background: linear-gradient(135deg, #9333ea 0%, #6366f1 100%);
        color: #fff;
    }
    #tw-panel .tw-mobile-actions .tw-icon {
        width: 18px;
        height: 18px;
    }
    #tw-panel #tw-settings {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
        border: 0;
        border-radius: 0;
    }
    #tw-panel .tw-settings-header {
        padding: 12px 16px;
    }
    #tw-panel .tw-settings-body {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto minmax(0, 1fr);
    }
    #tw-panel .tw-settings-nav {
        flex-direction: row;
        padding: 8px 12px;
        overflow-x: auto;
        border-right: 0;
        border-bottom: 1px solid var(--tw-line);
    }
    #tw-panel .tw-settings-content {
        padding: 18px 16px;
    }
}

@media (max-width: 600px) {
    #tw-panel .tw-header {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 68px 38px 38px;
        gap: 8px;
        padding: 10px 12px;
    }
    #tw-panel .tw-brand {
        grid-column: 1 / 3;
        grid-row: 1;
        gap: 10px;
        margin-right: 0;
    }
    #tw-panel .tw-brand > .tw-icon {
        width: 32px;
        height: 32px;
        padding: 6px;
    }
    #tw-panel h1 {
        font-size: 15px;
    }
    #tw-panel .tw-brand-subtitle {
        font-size: 10px;
    }
    #tw-panel .tw-header > .tw-icon-button {
        width: 38px;
        height: 38px;
    }
    #tw-panel .tw-settings-button {
        grid-column: 3;
        grid-row: 1;
    }
    #tw-panel .tw-close {
        grid-column: 4;
        grid-row: 1;
    }
    #tw-panel .tw-sort {
        grid-column: 3 / 5;
        grid-row: 2;
        height: 38px;
        padding: 0 4px;
        gap: 2px;
    }
    #tw-panel .tw-sort .tw-icon {
        display: none;
    }
    #tw-panel .tw-sort select {
        width: 100%;
        font-size: 11px;
    }
    #tw-panel .tw-search {
        grid-column: 1;
        grid-row: 2;
        width: 100%;
        min-width: 0;
        height: 38px;
    }
    #tw-panel .tw-view-modes {
        grid-column: 2;
        grid-row: 2;
        width: 100%;
        height: 38px;
    }
    #tw-panel .tw-view-modes .tw-icon-button {
        flex: 1 1 0;
        width: auto;
        height: 100%;
    }
}

@media (pointer: coarse) {
    #tw-menu-entry {
        min-height: 44px;
        padding: 8px 10px;
    }
    #tw-panel button,
    #tw-panel select {
        touch-action: manipulation;
    }
}

@media (hover: none) {
    #tw-panel .tw-category:not([aria-pressed="true"]):hover {
        background: transparent;
    }
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
let garmentSearch = '';
let garmentSort = 'default';
let garmentSearchTimer;
let wardrobeTemplates = { user: { ...DEFAULT_TEMPLATES.user }, char: { ...DEFAULT_TEMPLATES.char }, image: { ...DEFAULT_TEMPLATES.image } };
let descriptionPrompts = { ...DEFAULT_DESCRIPTION_PROMPTS };
let sendSettings = { content_type: 'text', position: 'user_end' };
let descriptionRequest;
let savedApiSettings = { mode: 'host' };
const subscriptions = [];
const imageReaders = new Set();
// 仅在 AI 发图或导出时缓存已读取的图片；同一路径复用读取任务，失败后允许重试，卸载时释放。
const imageDataCache = new Map();
// 聊天发图缓存有损参考副本，避免衣柜模式每次重复解码、缩放和发送大原图；备份仍走原图缓存。
const sendImageCache = new Map();
const imageDecoders = new Set();
const imageReadController = new window.parent.AbortController();
let exportUrl;
let libraryStatusTimer;
let importingGarments = false;
/** @type {Map<string, {file: File, url: string, selected: boolean}>} 待选本地文件，确认导入前不读取 Base64 或上传。 */
const pendingGarmentImports = new Map();
let replacingImage = false;
let importConflictDialog;

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
    settingsPanel.querySelector('[data-action="export-data"]').addEventListener('click', handleWardrobeData);
    settingsPanel.querySelector('[data-action="import-data"]').addEventListener('click', handleWardrobeData);
    settingsPanel.querySelector('.tw-data-import').addEventListener('change', handleWardrobeData);
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
    panel.querySelector('.tw-folder-import').addEventListener('change', importGarments);
    panel.querySelector('[data-action="add-import-files"]').addEventListener('click', chooseImportFiles);
    panel.querySelector('[data-action="add-import-folder"]').addEventListener('click', chooseImportFiles);
    panel.querySelector('[data-action="cancel-import"]').addEventListener('click', closeImageImport);
    panel.querySelector('[data-action="confirm-import"]').addEventListener('click', confirmImageImport);
    panel.querySelector('.tw-import-grid').addEventListener('change', selectPendingImports);
    for (const button of panel.querySelectorAll('[data-import-selection]')) button.addEventListener('click', selectPendingImports);
    panel.querySelector('#tw-import-picker').addEventListener('close', clearPendingImports);
    panel.querySelector('#tw-import-picker').addEventListener('cancel', preventImportCancellation);
    panel.querySelector('[data-action="replace-image"]').addEventListener('click', openImageReplacement);
    panel.querySelector('.tw-image-replace').addEventListener('change', replaceGarmentImage);
    panel.addEventListener('dragover', handleGarmentTransfer);
    panel.addEventListener('drop', handleGarmentTransfer);
    panel.addEventListener('paste', handleGarmentTransfer);
    panel.querySelector('.tw-selection-scope select').addEventListener('change', selectSelectionScope);
    panel.querySelector('.tw-items').addEventListener('click', selectGarment);
    panel.querySelector('.tw-items').addEventListener('change', checkGarment);
    panel.querySelector('.tw-select-all').addEventListener('change', selectAllGarments);
    panel.querySelector('.tw-bulk-actions').addEventListener('click', handleBulkAction);
    // 新建搭配直接打开成员选择弹窗，不受多选模式及批量操作的勾选门槛限制。
    panel.querySelector('[data-action="create-combination"]').addEventListener('click', openCombinationEditor);
    panel.querySelector('[data-action="edit-combination"]').addEventListener('click', openCombinationEditor);
    panel.querySelector('[data-action="cancel-combination"]').addEventListener('click', closeCombinationEditor);
    panel.querySelector('.tw-combination-form').addEventListener('submit', saveCombination);
    panel.querySelector('.tw-bulk-apply').addEventListener('change', handleBulkAction);
    panel.querySelector('.tw-bulk-group').addEventListener('change', moveCheckedGarments);
    panel.querySelector('.tw-bulk-category').addEventListener('change', updateCheckedGarments);
    panel.querySelector('.tw-bulk-favorite').addEventListener('change', updateCheckedGarments);
    panel.querySelector('[name="garment_group"]').addEventListener('change', assignGarmentGroup);
    panel.querySelector('.tw-group-tabs').addEventListener('click', selectGarmentGroup);
    panel.querySelector('.tw-group-tabs').addEventListener('click', deleteGarmentGroup);
    panel.querySelector('[data-action="add-group"]').addEventListener('click', addGarmentGroup);
    panel.querySelector('[data-action="manage-groups"]').addEventListener('click', openGarmentGroupManager);
    panel.querySelector('[data-action="cancel-groups"]').addEventListener('click', closeGarmentGroupManager);
    panel.querySelector('.tw-group-rows').addEventListener('click', reorderGarmentGroup);
    panel.querySelector('.tw-group-form').addEventListener('submit', saveGarmentGroups);
    panel.querySelector('[data-action="toggle-multi"]').addEventListener('click', toggleMultiSelect);
    panel.querySelector('[data-action="describe-all"]').addEventListener('click', generateMissingGarmentDescriptions);
    for (const button of panel.querySelectorAll('[data-action="export-all"], [data-action="export-one"], [data-action="delete-one"], [data-action="remove-image"]')) {
        button.addEventListener('click', handleGarmentAction);
    }
    panel.querySelector('[data-action="save-garment"]').addEventListener('click', saveSelectedGarment);
    panel.querySelector('[data-action="describe"]').addEventListener('click', generateGarmentDescription);
    panel.querySelector('.tw-wearer-modes').addEventListener('change', selectWearer);
    panel.querySelector('.tw-category-list').addEventListener('click', selectCategory);
    panel.querySelector('.tw-mobile-filter select').addEventListener('change', selectCategoryOption);
    panel.querySelector('[data-action="toggle-details"]').addEventListener('click', toggleMobileDetails);
    panel.querySelector('.tw-view-modes').addEventListener('click', selectView);
    panel.querySelector('.tw-search input').addEventListener('input', searchGarments);
    panel.querySelector('.tw-sort select').addEventListener('change', sortGarments);
    panel.querySelector('.tw-detail-tabs').addEventListener('click', selectDetail);
    panel.addEventListener('close', restoreFocus);
    window.addEventListener('pagehide', destroyWardrobe, { once: true });
    appendInexistentScriptButtons([{ name: '衣柜插件', visible: true }]);
    subscriptions.push(eventOn(getButtonEvent('衣柜插件'), openWardrobe));
    subscriptions.push(eventOn(tavern_events.CHAT_CHANGED, refreshWardrobe));
    subscriptions.push(eventMakeLast(tavern_events.CHAT_COMPLETION_PROMPT_READY, injectWardrobeContent));
    refreshWardrobe();
    void migrateLegacyImages();
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
    if (importConflictDialog?.open) importConflictDialog.close();
    closeImageImport();
    closeGarmentGroupManager();
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
 * @param {boolean} allowStoredImages 是否允许本机图片路径；导入备份时必须内嵌图片。
 * @returns {{items: Map<string, WardrobeItem>, groups: Map<string, string>}} 可直接用于内部操作的数据。
 */
function parseWardrobeData(data, allowStoredImages = true) {
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
            items.has(item.id) || (item.image && !DATA_IMAGE_PATTERN.test(item.image) && !STORED_IMAGE_PATTERN.test(item.image)) ||
            (item.groupId !== undefined && typeof item.groupId !== 'string') ||
            (item.favorite !== undefined && typeof item.favorite !== 'boolean') ||
            (item.descriptionOverride !== undefined && typeof item.descriptionOverride !== 'boolean') ||
            (item.lastUsedAt !== undefined && (!Number.isSafeInteger(item.lastUsedAt) || item.lastUsedAt < 0))) {
            throw new Error('服装数据缺少名称、描述、有效图片，或标识重复、收藏状态无效、使用时间无效。');
        }
        if (!allowStoredImages && item.image && STORED_IMAGE_PATTERN.test(item.image)) {
            throw new Error(`“${item.name}”的图片只有本机路径，无法跨设备导入。请在原酒馆中重新导出包含图片的 JSON。`);
        }
        items.set(item.id, {
            id: item.id, name: item.name, description: item.description, image: item.image,
            category: GARMENT_CATEGORIES.has(item.category) ? item.category : 'other',
            groupId: groups.has(item.groupId) ? item.groupId : '',
            favorite: item.favorite ?? false,
            lastUsedAt: item.lastUsedAt ?? 0,
            ...(item.componentIds !== undefined ? { componentIds: item.componentIds } : {}),
            ...(item.descriptionOverride ? { descriptionOverride: true } : {}),
        });
    }
    // 完整读取后一次校验关联，允许成员在文件中排在搭配之后；禁止空搭配、悬空和嵌套关系。
    for (const item of items.values()) {
        if (item.componentIds === undefined) continue;
        if (!Array.isArray(item.componentIds) || !item.componentIds.length || new Set(item.componentIds).size !== item.componentIds.length) {
            throw new Error('搭配必须包含不重复的服装成员。');
        }
        for (const id of item.componentIds) {
            if (typeof id !== 'string' || !items.has(id) || items.get(id).componentIds !== undefined) {
                throw new Error('搭配成员必须是文件中存在的普通服装，不能嵌套搭配。');
            }
        }
    }
    return { items, groups };
}

/**
 * 在文件入口识别本衣柜与 Outfit Manager 备份，转换后复用现有合并、上传和回滚流程。
 * @param {unknown} data JSON 文件解析结果，支持 User、单角色、全部角色及完整备份。
 * @returns {{items: Map<string, WardrobeItem>, groups: Map<string, string>}} 已校验的服装与标签。
 */
function parseWardrobeFile(data) {
    if (data?.format === 'tw-wardrobe' && data.version === 1) return parseWardrobeData(data, false);
    if (!data || typeof data !== 'object' || data.format !== undefined ||
        (data.type !== undefined && !['user', 'char', 'chars_all'].includes(data.type)) ||
        (data.type !== 'chars_all' && !Array.isArray(data.outfits))) {
        throw new Error('请选择本衣柜或 Outfit Manager 导出的服装 JSON 文件。');
    }
    const partitions = data.type === 'chars_all' ? [] : [data];
    if (data.chars !== undefined) {
        if (!data.chars || typeof data.chars !== 'object' || Array.isArray(data.chars)) throw new Error('Outfit Manager 角色数据格式错误。');
        partitions.push(...Object.values(data.chars));
    } else if (data.type === 'chars_all') throw new Error('Outfit Manager 文件缺少角色数据。');
    if (data._assets !== undefined && (!data._assets || typeof data._assets !== 'object' || Array.isArray(data._assets))) {
        throw new Error('Outfit Manager 图片资源格式错误。');
    }
    const items = [];
    const groups = new Map();
    const categoryIds = new Map(CATEGORIES.slice(1).map(([id, label]) => [label, id]));
    const imagePrefix = '/api/plugins/outfit-manager/images/';
    for (const [partitionIndex, partition] of partitions.entries()) {
        if (!partition || !Array.isArray(partition.outfits) ||
            (partition.accessories !== undefined && !Array.isArray(partition.accessories))) {
            throw new Error('Outfit Manager 穿搭或单品列表格式错误。');
        }
        for (const [kind, records] of [['outfits', partition.outfits], ['accessories', partition.accessories ?? []]]) {
            for (const item of records) {
                if (!item || typeof item !== 'object' ||
                    (item.category !== undefined && typeof item.category !== 'string') ||
                    (item.subCategory !== undefined && typeof item.subCategory !== 'string') ||
                    (item.sceneTag !== undefined && typeof item.sceneTag !== 'string') ||
                    (item.imageData != null && typeof item.imageData !== 'string')) {
                    throw new Error('Outfit Manager 服装分类、场景或图片格式错误。');
                }
                // 对方分类表示风格而非衣物类型；整套统一归入套装，场景优先作为现有标签。
                const category = item.category?.trim() ?? '';
                const subCategory = item.subCategory?.trim() ?? '';
                const label = item.sceneTag?.trim() || [category, subCategory].filter(Boolean).join(' / ');
                let groupId = '';
                if (label) {
                    if (!groups.has(label)) groups.set(label, `om-group-${groups.size}`);
                    groupId = groups.get(label);
                }
                let image = item.imageData ?? '';
                if (image && !image.startsWith('data:')) {
                    // 服务端导出通过 _assets 携带原图，不读取另一台酒馆的路径，避免导入缺图记录。
                    const assetName = image.startsWith(imagePrefix) ? image.slice(imagePrefix.length) : '';
                    if (!assetName || !Object.hasOwn(data._assets ?? {}, assetName)) {
                        throw new Error(`“${item.name}”的备份缺少原图，请在 Outfit Manager 中重新导出包含图片的 JSON。`);
                    }
                    image = data._assets[assetName];
                    if (typeof image !== 'string' || !image) throw new Error(`“${item.name}”的图片资源无效。`);
                }
                // 角色分区和穿搭／单品可使用相同 ID，增加来源前缀避免误判；最终导入仍生成新 ID。
                items.push({
                    id: typeof item.id === 'string' && item.id ? `${partitionIndex}:${kind}:${item.id}` : item.id,
                    name: item.name, description: item.description ?? '', image, groupId,
                    category: kind === 'outfits' ? 'outfits' : (categoryIds.get(category) ?? 'accessories'),
                    favorite: item.favorite,
                });
            }
        }
    }
    // 通用字段只在现有入口校验；不迁移对方的应用状态、设置或预设副本，保留当前衣柜行为。
    return parseWardrobeData({ items, groups: Array.from(groups, ([name, id]) => ({ id, name })) }, false);
}

/**
 * 打开插件内的勾选面板，支持先选文件夹或分次添加文件，不依赖系统窗口的修饰键多选。
 * @returns {void} 无返回值。
 */
function openImageImport() {
    panel.querySelector('#tw-import-picker').showModal();
}

/**
 * 按入口打开文件或文件夹选择器，文件仍只在用户确认时上传。
 * @param {MouseEvent} event 添加图片或选择文件夹按钮的点击事件。
 * @returns {void} 无返回值。
 */
function chooseImportFiles(event) {
    panel.querySelector(event.currentTarget.dataset.action === 'add-import-folder' ? '.tw-folder-import' : '.tw-image-import').click();
}

/**
 * 累积本次选择，文件夹只列出支持的图片；取消文件选择不清空之前已添加的文件。
 * @param {Event} event 图片选择器变化事件。
 * @returns {void} 更新待选缩略图，不读取原图数据或提交存档。
 */
function importGarments(event) {
    const input = event.currentTarget;
    addPendingImports(input.files, input.classList.contains('tw-folder-import'));
    input.value = '';
}

/**
 * 选择器与拖放共用的本地文件入口，按来源过滤支持的类型并保留之前的勾选状态。
 * @param {Iterable<File>} files 用户选择、拖入或粘贴的本地文件。
 * @param {boolean} folder 是否来自文件夹入口，文件夹仅接收图片。
 * @returns {void} 累积待选文件并更新缩略图。
 */
function addPendingImports(files, folder = false) {
    for (const file of files) {
        const image = IMAGE_TYPES.has(file.type);
        if (!image && (folder || !(/\.json$/i.test(file.name) || file.type === 'application/json'))) continue;
        // 文件相对路径、大小和修改时间仅用于待选列表去重，正式导入仍沿用原图哈希查重。
        const key = JSON.stringify([file.webkitRelativePath || file.name, file.size, file.lastModified]);
        // 文件夹用作浏览来源，默认不选；明确添加的文件默认选中，避免误导入整个图片目录。
        if (!pendingGarmentImports.has(key)) pendingGarmentImports.set(key, { file, url: image ? window.parent.URL.createObjectURL(file) : '', selected: !folder });
    }
    renderPendingImports();
}

/**
 * 用对象地址绘制本地缩略图，避免在勾选阶段提前把整批原图转成 Base64。
 * @returns {void} 添加文件后重建列表，勾选时不重建图片。
 */
function renderPendingImports() {
    const list = hostDocument.createDocumentFragment();
    for (const [key, entry] of pendingGarmentImports) {
        const label = hostDocument.createElement('label');
        label.className = 'tw-import-card';
        const checkbox = hostDocument.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.importKey = key;
        checkbox.checked = entry.selected;
        checkbox.setAttribute('aria-label', `导入${entry.file.webkitRelativePath || entry.file.name}`);
        if (entry.url) {
            const image = hostDocument.createElement('img');
            image.src = entry.url;
            image.alt = '';
            image.loading = 'lazy';
            image.decoding = 'async';
            label.append(image);
        } else label.innerHTML = icon('file');
        const name = hostDocument.createElement('span');
        name.textContent = entry.file.name;
        label.title = entry.file.webkitRelativePath || entry.file.name;
        label.append(checkbox, name);
        list.append(label);
    }
    panel.querySelector('.tw-import-grid').replaceChildren(list);
    updatePendingImportCount();
}

/**
 * 单击图片对应复选框即可切换选择，也支持全选和全不选；不触发任何上传。
 * @param {Event|MouseEvent} event 缩略图复选框变化或批量选择按钮事件。
 * @returns {void} 同步勾选与数量，保留当前焦点和缩略图。
 */
function selectPendingImports(event) {
    const input = event.target.closest('[data-import-key]');
    if (input) pendingGarmentImports.get(input.dataset.importKey).selected = input.checked;
    else {
        const selected = event.currentTarget.dataset.importSelection === 'all';
        for (const entry of pendingGarmentImports.values()) entry.selected = selected;
        for (const checkbox of panel.querySelectorAll('[data-import-key]')) checkbox.checked = selected;
    }
    updatePendingImportCount();
}

/**
 * 同步待选总数、已选数及空列表状态，只有选择了文件才允许开始导入。
 * @returns {void} 无返回值。
 */
function updatePendingImportCount() {
    let selected = 0;
    for (const entry of pendingGarmentImports.values()) if (entry.selected) selected++;
    panel.querySelector('.tw-import-count').textContent = `已选 ${selected} / ${pendingGarmentImports.size} 个文件`;
    panel.querySelector('.tw-import-empty').hidden = pendingGarmentImports.size > 0;
    panel.querySelector('[data-action="confirm-import"]').disabled = selected === 0;
    for (const button of panel.querySelectorAll('[data-import-selection]')) button.disabled = pendingGarmentImports.size === 0;
}

/**
 * 把勾选文件交给原有整批导入流程，成功后关闭；失败保留本地选择供重试。
 * @returns {Promise<void>} 导入完成并恢复面板控件后结束。
 */
async function confirmImageImport() {
    const files = [];
    for (const entry of pendingGarmentImports.values()) if (entry.selected) files.push(entry.file);
    if (!files.length || importingGarments) return;
    const dialog = panel.querySelector('#tw-import-picker');
    for (const control of dialog.querySelectorAll('button, input')) control.disabled = true;
    panel.querySelector('.tw-import-status').textContent = '';
    try {
        if (await importGarmentFiles(files)) closeImageImport();
        else panel.querySelector('.tw-import-status').textContent = '导入未完成，已保留当前选择，可调整后重试。';
    } finally {
        for (const control of dialog.querySelectorAll('button, input')) control.disabled = false;
        updatePendingImportCount();
    }
}

/**
 * 导入过程中阻止 Escape 丢弃正在使用的待选列表，完成或失败后恢复原生关闭行为。
 * @param {Event} event 原生对话框取消事件。
 * @returns {void} 无返回值。
 */
function preventImportCancellation(event) {
    if (importingGarments) event.preventDefault();
}

/**
 * 关闭待选面板并释放缩略图对象地址；取消选择不改变现有衣柜。
 * @returns {void} 无返回值。
 */
function closeImageImport() {
    const dialog = panel.querySelector('#tw-import-picker');
    if (dialog.open) dialog.close();
    clearPendingImports();
}

/**
 * 在取消、导入成功或卸载时释放全部本地文件及对象地址，避免重复打开时累积内存。
 * @returns {void} 无返回值。
 */
function clearPendingImports() {
    for (const entry of pendingGarmentImports.values()) if (entry.url) window.parent.URL.revokeObjectURL(entry.url);
    pendingGarmentImports.clear();
    panel.querySelector('.tw-import-grid').replaceChildren();
    panel.querySelector('.tw-import-status').textContent = '';
    updatePendingImportCount();
}

/**
 * 接收面板内拖放文件和剪贴板图片；文本编辑保留原生粘贴，设置面板不接收服装。
 * @param {DragEvent|ClipboardEvent} event 面板拖放或粘贴事件。
 * @returns {Promise<void>} 文件导入完成后结束。
 */
async function handleGarmentTransfer(event) {
    if (settingsPanel.open || importConflictDialog?.open) return;
    if (event.type === 'paste' && event.target.closest('input, textarea, [contenteditable="true"]')) return;
    const transfer = event.clipboardData ?? event.dataTransfer;
    if (event.type === 'dragover') {
        if (Array.from(transfer.types).includes('Files')) {
            event.preventDefault();
            transfer.dropEffect = 'copy';
        }
        return;
    }
    const files = Array.from(transfer.files).filter(file => event.type !== 'paste' || IMAGE_TYPES.has(file.type));
    if (!files.length) return;
    event.preventDefault();
    if (panel.querySelector('#tw-import-picker').open) {
        // 导入面板内拖放和粘贴只累积候选，保持“确认前不上传”的同一操作预期。
        addPendingImports(files);
    } else await importGarmentFiles(files);
}

/**
 * 先校验整批文件并按名称与原图哈希处理重复项，再上传及一次提交；任一失败回收新图。
 * @param {File[]} files 选择、拖放或粘贴获得的文件。
 * @returns {Promise<boolean>} 成功保存或全部跳过时为真，取消、忙碌或失败时为假。
 */
async function importGarmentFiles(files) {
    if (!files.length || importingGarments) return false;
    importingGarments = true;
    for (const button of panel.querySelectorAll('[data-action="import"]')) button.disabled = true;
    const uploaded = [];
    try {
        const candidates = [];
        const groups = new Map(garmentGroups);
        const groupNames = new Map(Array.from(groups, ([id, name]) => [name, id]));
        const importGroup = currentGroup === '*' ? '' : currentGroup;
        for (const file of files) {
            if (/\.json$/i.test(file.name) || file.type === 'application/json') {
                const data = parseWardrobeFile(JSON.parse(await file.text()));
                const groupIds = new Map();
                // 每份文件先获得独立的临时 ID，防止多文件原 ID 相同；查重后再映射到最终记录。
                const itemIds = new Map(Array.from(data.items.keys(), id => [id, window.parent.crypto.randomUUID()]));
                // 标签按名称复用，服装等整批校验后再决定新增或覆盖，跳过项不上传图片。
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
                    candidates.push({ ...item, id: itemIds.get(item.id), groupId: groupIds.get(item.groupId) ?? importGroup,
                        ...(item.componentIds ? { componentIds: item.componentIds.map(id => itemIds.get(id)) } : {}) });
                }
            } else {
                const image = await readGarmentImage(file);
                candidates.push({ name: file.name.replace(/\.[^.]+$/, '') || '未命名服装', category: 'other', description: '', image, groupId: importGroup, favorite: false, lastUsedAt: 0 });
            }
        }
        const names = new Set(candidates.map(item => item.name.trim()));
        const fingerprints = new Map();
        const imageHashes = new Map();
        const candidateItems = new Map(candidates.map(item => [item.id, item]));
        // 只读取本批同名的旧图片，并缓存同图哈希；索引查重避免每件导入都遍历整个衣柜。
        for (const item of garments.values()) {
            if (names.has(item.name.trim())) fingerprints.set(await garmentFingerprint(item, imageHashes), item);
        }
        const next = new Map();
        const importedIds = new Map();
        let duplicateAction;
        let skipped = 0;
        let overwritten = 0;
        for (const item of candidates) {
            const key = await garmentFingerprint(item, imageHashes, candidateItems);
            const existing = fingerprints.get(key);
            if (existing) {
                duplicateAction ??= await chooseImportDuplicate(item.name);
                if (!duplicateAction) return false;
                if (duplicateAction === 'skip') { importedIds.set(item.id, existing.id); skipped++; continue; }
            }
            const replacing = existing && duplicateAction === 'overwrite';
            const id = replacing ? existing.id : window.parent.crypto.randomUUID();
            importedIds.set(item.id, id);
            // 相同原图沿用已有文件，覆盖保留 ID 和最近使用历史，角色选择无需重新绑定。
            const imported = { ...item, id, image: replacing ? existing.image : item.image, lastUsedAt: replacing ? Math.max(item.lastUsedAt, existing.lastUsedAt) : item.lastUsedAt };
            next.set(id, imported);
            fingerprints.set(key, imported);
            if (replacing) overwritten++;
        }
        // 跳过或覆盖的成员也映射到实际保留项，搭配永远不引用备份里的旧 ID。
        for (const item of next.values()) {
            if (item.componentIds) item.componentIds = Array.from(new Set(item.componentIds.map(id => importedIds.get(id))));
        }
        // 整库备份允许只有空标签；没有新增服装时仍需恢复新标签，不能把有效备份当成空操作。
        if (!next.size && groups.size === garmentGroups.size) { setLibraryStatus(`已跳过 ${skipped} 件重复服装`); return true; }
        for (const item of next.values()) {
            if (!DATA_IMAGE_PATTERN.test(item.image)) continue;
            item.image = await uploadGarmentImage(item.image, imageHashes.get(item.image));
            uploaded.push(item.image);
        }
        if (!root.isConnected) throw new Error('衣柜已卸载，导入已取消。');
        // 读文件和上传会等待网络，只合并本批记录，保留期间完成的其他服装编辑。
        const merged = new Map(garments);
        for (const [id, item] of next) merged.set(id, item);
        const selectedId = next.keys().next().value ?? selectedGarmentId;
        commitGarments(merged, selectedId, groups);
        currentGroup = '*';
        updateCategory('all');
        setLibraryStatus(`已导入 ${next.size} 件，覆盖 ${overwritten} 件，跳过 ${skipped} 件`);
        if (next.size) showGarmentDescription();
        return true;
    } catch (error) {
        // 保存失败也要回收新文件；已经成功提交的路径由清理函数保留，不因界面刷新异常误删。
        await deleteGarmentImages(uploaded);
        if (root.isConnected) {
            setGarmentStatus(String(error), true);
            setLibraryStatus(String(error), true);
            toastr.error(String(error), '服装导入失败');
        }
        return false;
    } finally {
        importingGarments = false;
        for (const button of panel.querySelectorAll('[data-action="import"]')) button.disabled = false;
    }
}

/**
 * 普通服装按名称与原图 SHA-256 查重，纯文字使用空图标记；搭配再比较成员指纹及顺序。
 * @param {WardrobeItem} item 已校验的服装或搭配。
 * @param {Map<string, string>} imageHashes 本批共享的图片路径／数据地址哈希缓存。
 * @param {Map<string, WardrobeItem>} items 关联成员所在的服装表，导入时使用本批临时表。
 * @returns {Promise<string>} 名称与图片哈希组成的稳定指纹。
 */
async function garmentFingerprint(item, imageHashes, items = garments) {
    if (item.componentIds) {
        const members = [];
        // 关联只允许一层，复用图片哈希缓存；同名但成员不同的搭配不会误判为重复。
        for (const id of item.componentIds) members.push(await garmentFingerprint(items.get(id), imageHashes, items));
        return JSON.stringify([item.name.trim(), 'combination', members]);
    }
    let hash = imageHashes.get(item.image);
    if (hash === undefined) {
        hash = '';
        if (item.image) {
            const data = await loadImageDataUrl(item.image);
            hash = await hashGarmentImage(data);
        }
        imageHashes.set(item.image, hash);
    }
    return JSON.stringify([item.name.trim(), hash]);
}

/**
 * 对解码后的原图字节计算 SHA-256，供导入查重与固定文件名共用，避免名称或数据地址头影响结果。
 * @param {string} dataUrl 已在入口校验的原图数据地址。
 * @returns {Promise<string>} 完整的 64 位小写十六进制哈希。
 */
async function hashGarmentImage(dataUrl) {
    const bytes = Uint8Array.from(window.parent.atob(dataUrl.slice(dataUrl.indexOf(',') + 1)), char => char.charCodeAt(0));
    const digest = await window.parent.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * 使用原生对话框选择本批所有重复项的处理方式，Escape 或取消会放弃整批导入。
 * @param {string} name 首件重复服装的名称，通过文本节点显示。
 * @returns {Promise<string>} skip、overwrite、keep 或取消时的空字符串。
 */
function chooseImportDuplicate(name) {
    return new Promise(resolve => {
        const dialog = hostDocument.createElement('dialog');
        dialog.className = 'tw-import-conflict';
        dialog.setAttribute('aria-label', '处理重复服装');
        dialog.innerHTML = '<h2>发现重复服装</h2><p></p><form method="dialog"><button value="skip" autofocus>跳过</button><button value="overwrite">覆盖</button><button value="keep">保留两份</button><button value="">取消</button></form>';
        dialog.querySelector('p').textContent = `“${name}”名称和图片相同。此选择应用于本次所有重复项。`;
        dialog.addEventListener('close', () => {
            importConflictDialog = undefined;
            dialog.remove();
            resolve(dialog.returnValue);
        }, { once: true });
        panel.append(dialog);
        importConflictDialog = dialog;
        dialog.showModal();
    });
}

/**
 * 校验图片并读取数据地址，供上传、AI 或导出使用；统一登记读取器以便卸载时中止。
 * @param {File|Blob} file PNG、JPEG 或 WebP 图片文件或读取到的图片内容。
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
 * 使用原图 SHA-256 派生固定 UUID 文件名，再按原格式上传；同图跨导入复用路径，不重新压缩或裁剪。
 * @param {string} dataUrl 已在导入入口校验或由读取器生成的图片数据地址。
 * @param {string} [imageHash] 本批查重已算出的完整哈希，省去重复解码和摘要计算；其他入口自行计算。
 * @returns {Promise<string>} 当前酒馆用户目录中的图片相对路径。
 */
async function uploadGarmentImage(dataUrl, imageHash) {
    const [, format, image] = DATA_IMAGE_PATTERN.exec(dataUrl);
    const hash = imageHash ?? await hashGarmentImage(dataUrl);
    // 截取摘要前 128 位并设置 UUID v8 的版本与变体位；查重仍使用完整 SHA-256，不用截断值代替。
    const variant = ((parseInt(hash[16], 16) & 3) | 8).toString(16);
    const filename = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-8${hash.slice(13, 16)}-${variant}${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
    const response = await window.parent.fetch('/api/images/upload', {
        method: 'POST',
        headers: SillyTavern.getRequestHeaders(),
        body: JSON.stringify({ image, format: format === 'jpeg' ? 'jpg' : format, filename, ch_name: IMAGE_FOLDER }),
    });
    if (!response.ok) throw new Error(`图片保存失败（HTTP ${response.status}）。`);
    const path = String((await response.json()).path ?? '').replace(/^\//, '');
    if (!STORED_IMAGE_PATTERN.test(path)) throw new Error(`酒馆返回了无法识别的图片路径：${path}`);
    return path;
}

/**
 * 删除本插件中已无服装引用的图片，供删除、导入回滚和迁移失败共用。
 * @param {Iterable<string>} images 待清理的路径；空值、数据地址和其他目录不会删除。
 * @returns {Promise<void>} 清理结束；文件删除失败只记录日志，不撤销已保存的服装操作。
 */
async function deleteGarmentImages(images) {
    // 同一路径可能由多件服装共用，用集合一次收集引用，避免逐图扫描整个衣柜。
    const referenced = new Set();
    for (const item of garments.values()) if (item.image) referenced.add(item.image);
    for (const image of new Set(images)) {
        if (!image || referenced.has(image)) continue;
        imageDataCache.delete(image);
        sendImageCache.delete(image);
        if (!STORED_IMAGE_PATTERN.test(image)) continue;
        try {
            const response = await window.parent.fetch('/api/images/delete', {
                method: 'POST', headers: SillyTavern.getRequestHeaders(), body: JSON.stringify({ path: image }),
            });
            if (!response.ok && response.status !== 404) console.warn(`[衣柜插件] 删除图片失败（HTTP ${response.status}）：${image}`);
        } catch (error) { console.warn('[衣柜插件] 删除图片失败：', image, error); }
    }
}

/**
 * 仅在 AI 和备份需要图片内容时读取文件；列表及预览直接交给浏览器加载和缓存。
 * @param {string} image 已校验的图片路径、旧数据地址或空字符串。
 * @returns {Promise<string>} 原图数据地址，无图片时返回空字符串。
 */
async function loadImageDataUrl(image) {
    if (!STORED_IMAGE_PATTERN.test(image)) return image;
    let pending = imageDataCache.get(image);
    if (!pending) {
        pending = (async () => {
            const response = await window.parent.fetch(image, { signal: imageReadController.signal });
            if (!response.ok) throw new Error(`读取图片失败（HTTP ${response.status}）：${image}，文件可能已被删除。`);
            const type = image.endsWith('.jpg') ? 'image/jpeg' : image.endsWith('.webp') ? 'image/webp' : 'image/png';
            // 静态文件响应的 MIME 可能是通用二进制，按已校验的扩展名恢复图片类型。
            return readGarmentImage(new window.parent.Blob([await response.blob()], { type }));
        })();
        imageDataCache.set(image, pending);
    }
    try { return await pending; }
    catch (error) {
        imageDataCache.delete(image);
        throw error;
    }
}

/**
 * 为聊天生成并缓存参考图，长边最多 1280 像素；小图仅在压缩后更小时替换，失败可重试。
 * @param {string} image 已校验的原图路径或旧数据地址。
 * @returns {Promise<string>} JPEG 参考图或体积更小的小尺寸原图数据地址。
 */
async function loadSendImageDataUrl(image) {
    let pending = sendImageCache.get(image);
    if (!pending) {
        pending = (async () => {
            const original = await loadImageDataUrl(image);
            if (imageReadController.signal.aborted) throw new Error('图片读取已取消。');
            return new Promise((resolve, reject) => {
                const decoded = hostDocument.createElement('img');
                imageDecoders.add(decoded);
                decoded.onerror = () => {
                    imageDecoders.delete(decoded);
                    reject(new Error('无法解码服装图片，请替换为有效图片后重试。'));
                };
                decoded.onload = () => {
                    imageDecoders.delete(decoded);
                    try {
                        const scale = Math.min(1, SEND_IMAGE_MAX_EDGE / Math.max(decoded.naturalWidth, decoded.naturalHeight));
                        const canvas = hostDocument.createElement('canvas');
                        canvas.width = Math.max(1, Math.round(decoded.naturalWidth * scale));
                        canvas.height = Math.max(1, Math.round(decoded.naturalHeight * scale));
                        const context = canvas.getContext('2d');
                        // JPEG 不保留透明度，铺白底避免透明服装图被默认合成为黑底。
                        context.fillStyle = '#fff';
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        context.drawImage(decoded, 0, 0, canvas.width, canvas.height);
                        const compressed = canvas.toDataURL('image/jpeg', SEND_IMAGE_QUALITY);
                        resolve(scale < 1 || compressed.length < original.length ? compressed : original);
                    } catch (error) { reject(error); }
                };
                decoded.src = original;
            });
        })();
        sendImageCache.set(image, pending);
    }
    try { return await pending; }
    catch (error) {
        sendImageCache.delete(image);
        throw error;
    }
}

/**
 * 选择替换文件时记住目标 ID，避免原生文件选择器关闭后替换到另一件服装。
 * @returns {void} 打开单图选择器，取消选择不更改原图。
 */
function openImageReplacement() {
    const input = panel.querySelector('.tw-image-replace');
    input.dataset.garmentId = selectedGarmentId;
    input.click();
}

/**
 * 上传新图后只替换图片字段，保留服装 ID、归属和详情草稿；存档成功才清理旧文件。
 * @param {Event} event 单图选择器的变化事件。
 * @returns {Promise<void>} 替换或失败回收结束后完成。
 */
async function replaceGarmentImage(event) {
    const input = event.currentTarget;
    if (!input.files.length || replacingImage) return;
    const id = input.dataset.garmentId;
    replacingImage = true;
    panel.querySelector('[data-action="replace-image"]').disabled = true;
    let uploaded;
    try {
        uploaded = await uploadGarmentImage(await readGarmentImage(input.files[0]));
        const item = garments.get(id);
        if (!root.isConnected || !item) throw new Error('服装已删除或衣柜已卸载，图片替换已取消。');
        const next = new Map(garments);
        next.set(id, { ...item, image: uploaded });
        commitGarments(next, selectedGarmentId, garmentGroups, false);
        if (id === selectedGarmentId) {
            stopDescriptionRequest();
            renderGarmentImage();
        }
        await deleteGarmentImages([item.image]);
        setLibraryStatus('图片已替换');
    } catch (error) {
        if (uploaded) await deleteGarmentImages([uploaded]);
        if (root.isConnected) setLibraryStatus(String(error), true);
    } finally {
        replacingImage = false;
        input.value = '';
        if (root.isConnected) setDescriptionBusy(Boolean(descriptionRequest));
    }
}

/**
 * 启动时逐张迁移旧图片，上传和存档都成功才替换原数据；失败后下次启动继续。
 * @returns {Promise<void>} 迁移结束，失败通过提示说明，尚未迁移的原图保留在存档中。
 */
async function migrateLegacyImages() {
    const legacy = [];
    for (const item of garments.values()) if (DATA_IMAGE_PATTERN.test(item.image)) legacy.push({ id: item.id, image: item.image });
    let migrated = 0;
    for (const item of legacy) {
        if (!root.isConnected) break;
        let uploaded;
        try {
            uploaded = await uploadGarmentImage(item.image);
            const current = garments.get(item.id);
            // 上传期间用户仍可编辑或删除服装，合并最新记录，避免恢复已删除服装或覆盖描述。
            if (!root.isConnected || current?.image !== item.image) {
                await deleteGarmentImages([uploaded]);
                continue;
            }
            const next = new Map(garments);
            next.set(item.id, { ...current, image: uploaded });
            commitGarments(next, selectedGarmentId, garmentGroups, false);
            migrated++;
        } catch (error) {
            if (uploaded) await deleteGarmentImages([uploaded]);
            if (root.isConnected) toastr.error(`${String(error)} 未迁移的原图仍保留，下次启动继续。`, '服装图片迁移未完成');
            break;
        }
    }
    if (migrated && root.isConnected) toastr.success(`已将 ${migrated} 张服装图片保存为文件。`, '衣柜插件');
}

/**
 * 保存成功后才更新内存和界面，存储失败时继续保留原有服装记录。
 * @param {Map<string, WardrobeItem>} next 待保存的完整服装表。
 * @param {string|null} selectedId 保存后选中的服装标识。
 * @param {Map<string, string>} groups 同次保存的标签。
 * @param {boolean} refreshDetails 是否重填详情；后台迁移和标签分配保留用户正在编辑的表单及识别请求。
 * @returns {void} 无返回值。
 */
function commitGarments(next, selectedId, groups = garmentGroups, refreshDetails = true) {
    const saved = { wardrobe_items: Array.from(next.values()), wardrobe_groups: Array.from(groups, ([id, name]) => ({ id, name })) };
    // 只有删除服装才清理所有范围，普通编辑不扫描历史聊天；与服装在同次提交中保存，失败不留半份删除。
    if (next.size < garments.size) Object.assign(saved, pruneDeletedSelections(next));
    insertOrAssignVariables(saved, { type: 'script' });
    if (refreshDetails && (selectedId !== selectedGarmentId || next.get(selectedId)?.image !== garments.get(selectedGarmentId)?.image)) stopDescriptionRequest();
    garments = next;
    garmentGroups = groups;
    if (currentGroup !== '*' && currentGroup && !groups.has(currentGroup)) currentGroup = '';
    selectedGarmentId = selectedId;
    // 不影响详情内容的更新只重绘列表，保留尚未保存的名称、描述和当前识别请求。
    if (refreshDetails) refreshWardrobe();
    else renderGarmentLibrary();
}

/**
 * 把指定服装、搭配成员及对应标签打包成可独立恢复的文件，图片以原始数据地址保存在文件内。
 * @param {Iterable<string>} ids 待导出的服装标识。
 * @param {boolean} includeEmptyGroups 是否连同空标签一起备份。
 * @returns {Promise<void>} 图片读取完成并触发下载后结束。
 */
async function exportGarments(ids, includeEmptyGroups = false) {
    const items = [];
    const groupIds = new Set();
    // 单独导出搭配时同时包含成员，确保文件可独立恢复；Set 避免共享单品重复打包。
    const exportIds = new Set(ids);
    for (const id of exportIds) {
        const item = garments.get(id);
        if (item.componentIds) for (const memberId of item.componentIds) exportIds.add(memberId);
        items.push({ ...item });
        if (item.groupId) groupIds.add(item.groupId);
    }
    if (!items.length) throw new Error('没有可导出的服装。');
    const groups = Array.from(includeEmptyGroups ? garmentGroups.keys() : groupIds, id => ({ id, name: garmentGroups.get(id) }));
    // 先快照记录及标签再读取图片，导出期间切换选择或编辑不会混入本次备份。
    for (const item of items) item.image = await loadImageDataUrl(item.image);
    if (!root.isConnected) throw new Error('衣柜已卸载，导出已取消。');
    const data = { format: 'tw-wardrobe', version: 1, groups, items };
    downloadWardrobeJson(data, `${items.length === 1 ? items[0].name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') : '衣柜'}-${items.length}件.json`);
    setLibraryStatus(`已导出 ${items.length} 件服装`);
}

/**
 * 下载服装或设置备份共用的 JSON 文件，复用最近下载地址的释放流程。
 * @param {Object} data 调用方已明确选取字段的备份数据。
 * @param {string} filename 下载时显示的文件名。
 * @returns {void} 触发浏览器下载，不读取脚本变量或 API 配置。
 */
function downloadWardrobeJson(data, filename) {
    const blob = new window.parent.Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    // 保留最近一次下载地址供浏览器异步读取，下次导出或卸载时释放，不引入延迟定时器。
    if (exportUrl) window.parent.URL.revokeObjectURL(exportUrl);
    exportUrl = window.parent.URL.createObjectURL(blob);
    const link = hostDocument.createElement('a');
    link.href = exportUrl;
    link.download = filename;
    link.hidden = true;
    hostDocument.body.append(link);
    try { link.click(); } finally { link.remove(); }
}

/**
 * 处理全部导出及单件导出、删除、移除图片；导出单件时先保存编辑内容。
 * @param {MouseEvent} event 操作按钮的点击事件。
 * @returns {Promise<void>} 所选操作结束后完成。
 */
async function handleGarmentAction(event) {
    try {
        const action = event.currentTarget.dataset.action;
        if (action === 'export-all') await exportGarments(garments.keys(), true);
        else if (action === 'export-one') {
            if (saveSelectedGarment()) await exportGarments([selectedGarmentId]);
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
            validateAppliedGarmentChange(item.id, next);
            commitGarments(next, item.id);
            void deleteGarmentImages([item.image]);
            setLibraryStatus('图片已删除，名称和描述已保留');
        }
    } catch (error) {
        setLibraryStatus(String(error), true);
        setGarmentStatus(String(error), true);
    }
}

/**
 * 删除前阻止留下悬空搭配，删除成功时清理所有范围的应用选择，再回收无引用的原图。
 * @param {Set<string>} ids 待删除的服装标识集合。
 * @returns {void} 无返回值。
 */
function deleteGarments(ids) {
    for (const item of garments.values()) {
        if (!ids.has(item.id) && item.componentIds?.some(id => ids.has(id))) {
            throw new Error(`所选服装仍被搭配“${item.name}”使用，请先编辑该搭配移除成员，或一并删除搭配。`);
        }
    }
    if (!ids.size || !window.parent.confirm(`删除所选的 ${ids.size} 件服装及其图片？此操作不可撤销。`)) return;
    const next = new Map(garments);
    const removedImages = [];
    for (const id of ids) {
        removedImages.push(next.get(id).image);
        next.delete(id);
    }
    commitGarments(next, next.has(selectedGarmentId) ? selectedGarmentId : next.keys().next().value ?? null);
    // 先保存删除结果，再清理不再被引用的文件，存档失败时仍可继续查看原图。
    void deleteGarmentImages(removedImages);
    setLibraryStatus(`已删除 ${ids.size} 件服装`);
}

/**
 * 直接打开搭配编辑器，新建时可选地带入已有勾选，编辑时读取原搭配并保留当前详情草稿。
 * @param {MouseEvent} event 顶部新建或详情编辑按钮的点击事件，通过按钮动作区分两种入口。
 * @returns {void} 仅填充模态框，保存前不修改服装和应用选择。
 */
function openCombinationEditor(event) {
    const item = event.currentTarget.dataset.action === 'edit-combination' ? garments.get(selectedGarmentId) : undefined;
    const selected = new Set();
    for (const id of item?.componentIds ?? checkedGarmentIds) {
        const garment = garments.get(id);
        for (const member of getGarmentMembers(garment)) selected.add(member.id);
    }
    const dialog = panel.querySelector('#tw-combination-editor');
    dialog.dataset.garmentId = item?.id ?? '';
    dialog.querySelector('[name="combination_name"]').value = item ? panel.querySelector('[name="garment_name"]').value : '新搭配';
    const rows = dialog.querySelector('.tw-combination-items');
    rows.replaceChildren();
    for (const garment of garments.values()) {
        if (garment.componentIds) continue;
        const row = hostDocument.createElement('label');
        row.className = 'tw-combination-item';
        const checkbox = hostDocument.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = garment.id;
        checkbox.checked = selected.has(garment.id);
        row.append(checkbox);
        if (garment.image) {
            const image = hostDocument.createElement('img');
            image.src = garment.image;
            image.alt = '';
            image.loading = 'lazy';
            row.append(image);
        }
        const name = hostDocument.createElement('span');
        name.textContent = `${garment.name} · ${CATEGORY_LABELS.get(garment.category)}`;
        row.append(name);
        rows.append(row);
    }
    dialog.querySelector('.tw-combination-status').textContent = '';
    dialog.showModal();
}

/** 关闭搭配编辑器并丢弃未提交的成员选择；无参数，无返回值。 */
function closeCombinationEditor() {
    const dialog = panel.querySelector('#tw-combination-editor');
    if (dialog.open) dialog.close();
}

/**
 * 一次保存搭配及成员关系，保留用户编辑的整段描述；未编辑描述时继续引用成员，不复制原图。
 * @param {SubmitEvent} event 搭配表单提交事件。
 * @returns {void} 保存成功后显示搭配详情，失败保留编辑内容。
 */
function saveCombination(event) {
    event.preventDefault();
    const dialog = panel.querySelector('#tw-combination-editor');
    try {
        const name = dialog.querySelector('[name="combination_name"]').value.trim();
        const componentIds = [];
        for (const input of dialog.querySelectorAll('.tw-combination-items input:checked')) {
            // 模态框打开期间可能删除记录；在这一个编辑入口确认成员仍存在。
            if (!garments.has(input.value) || garments.get(input.value).componentIds) throw new Error('搭配成员已变化，请重新打开编辑器。');
            componentIds.push(input.value);
        }
        if (!name || !componentIds.length) throw new Error('请填写搭配名称，并至少选择一件服装。');
        const previous = garments.get(dialog.dataset.garmentId);
        const id = previous?.id ?? window.parent.crypto.randomUUID();
        const item = { id, name, category: 'outfits', description: '', image: '', groupId: currentGroup === '*' ? '' : currentGroup,
            favorite: false, lastUsedAt: 0, ...previous, componentIds };
        item.name = name;
        if (previous) {
            item.category = panel.querySelector('[name="garment_category"]').value;
            Object.assign(item, readGarmentDescriptionDraft(previous));
        }
        const next = new Map(garments);
        next.set(id, item);
        const selections = readWearerSelections();
        if (selections.user.has(id) || selections.char.has(id)) buildWardrobeContent(item, sendSettings, next);
        commitGarments(next, id);
        closeCombinationEditor();
        checkedGarmentIds.clear();
        multiSelectMode = false;
        currentGroup = '*';
        updateCategory('combinations');
        panel.querySelector('[data-detail="description"]').click();
        setMobileDetails(true);
        setGarmentStatus('搭配已保存');
    } catch (error) { dialog.querySelector('.tw-combination-status').textContent = String(error); }
}

/**
 * 解析一套穿搭包含的实际服装，普通套装与单品均可直接成为搭配成员。
 * @param {WardrobeItem} item 已在存档或编辑入口校验的服装／搭配。
 * @param {Map<string, WardrobeItem>} items 成员所在服装表，保存前验证可传入待提交表。
 * @returns {WardrobeItem[]} 按保存顺序排列的实际服装。
 */
function getGarmentMembers(item, items = garments) {
    return item.componentIds ? item.componentIds.map(id => items.get(id)) : [item];
}

/**
 * 未编辑的搭配自动合并成员描述；用户整段编辑后使用保存的正文，旧补充说明继续保留在合并结果中。
 * @param {WardrobeItem} item 普通服装或搭配。
 * @param {Map<string, WardrobeItem>} items 成员所在服装表。
 * @returns {string} 模板使用的完整描述，保留成员名称与分类对应关系。
 */
function getGarmentDescription(item, items = garments) {
    if (!item.componentIds || item.descriptionOverride) return item.description;
    const lines = item.description ? [item.description] : [];
    for (const member of getGarmentMembers(item, items)) lines.push(`${member.name}（${CATEGORY_LABELS.get(member.category)}）：${member.description}`);
    return lines.join('\n');
}

/**
 * 读取唯一描述编辑框，未改动自动合并正文时保留引用，改动时保存为整套正文，避免重复追加成员描述。
 * @param {WardrobeItem} item 编辑前的服装或搭配，调整成员时也以原记录判断描述是否被修改。
 * @returns {{description: string, descriptionOverride?: boolean}} 待合并到服装记录的描述字段。
 */
function readGarmentDescriptionDraft(item) {
    const description = panel.querySelector('[name="garment_description"]').value.trim();
    if (!item.componentIds) return { description };
    if (description === getGarmentDescription(item).trim()) return { description: item.description };
    return { description, descriptionOverride: true };
}

/**
 * 在删除入口校验并清理全局、角色卡和聊天选择，过滤已删除 ID，保留显式保存的空选择。
 * @param {Map<string, WardrobeItem>} remaining 删除后仍存在的服装表。
 * @returns {Object} 随服装删除一次写入的全局及独立范围选择补丁。
 */
function pruneDeletedSelections(remaining) {
    const variables = getVariables({ type: 'script' });
    const scoped = variables.wardrobe_scoped_selections;
    const records = new Map(scoped && typeof scoped === 'object' ? Object.entries(scoped) : []);
    const saved = { wardrobe_scoped_selections: {} };
    // 全局项单独处理，不能把未迁移的全局选择写成空值，否则会阻断旧存档迁移。
    if (variables.wardrobe_selections !== undefined) records.set('global', variables.wardrobe_selections);
    for (const [key, record] of records) {
        const cleaned = { user: [], char: [] };
        for (const wearer of WEARERS) {
            if (!Array.isArray(record?.[wearer])) continue;
            for (const id of record[wearer]) if (remaining.has(id)) cleaned[wearer].push(id);
        }
        if (key === 'global') saved.wardrobe_selections = cleaned;
        else saved.wardrobe_scoped_selections[key] = cleaned;
    }
    return saved;
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
 * 按当前持久顺序填充标签名称与排序控件，取消时丢弃全部草稿。
 * @returns {void} 打开原生标签管理对话框。
 */
function openGarmentGroupManager() {
    const rows = panel.querySelector('.tw-group-rows');
    rows.replaceChildren();
    for (const [id, name] of garmentGroups) {
        const row = hostDocument.createElement('div');
        row.className = 'tw-group-row';
        row.dataset.groupId = id;
        const input = hostDocument.createElement('input');
        input.value = name;
        input.required = true;
        input.setAttribute('aria-label', `标签名称：${name}`);
        row.append(input);
        for (const [direction, label] of [['up', '上移'], ['down', '下移']]) {
            const button = hostDocument.createElement('button');
            button.type = 'button';
            button.dataset.groupMove = direction;
            button.textContent = direction === 'up' ? '↑' : '↓';
            button.setAttribute('aria-label', `${label}标签${name}`);
            row.append(button);
        }
        rows.append(row);
    }
    panel.querySelector('.tw-group-status').textContent = '';
    panel.querySelector('#tw-group-manager').showModal();
}

/**
 * 关闭标签管理而不提交表单，原生对话框恢复触发按钮的焦点。
 * @returns {void} 无返回值。
 */
function closeGarmentGroupManager() {
    const dialog = panel.querySelector('#tw-group-manager');
    if (dialog.open) dialog.close();
}

/**
 * 仅调整表单行的顺序，边界点击不移动；保留所有尚未保存的标签名称。
 * @param {MouseEvent} event 排序按钮点击事件。
 * @returns {void} 不写入存档。
 */
function reorderGarmentGroup(event) {
    const button = event.target.closest('[data-group-move]');
    if (!button) return;
    const row = button.closest('.tw-group-row');
    if (button.dataset.groupMove === 'up') row.previousElementSibling?.before(row);
    else row.nextElementSibling?.after(row);
    button.focus();
}

/**
 * 在表单入口校验非空与重名，按行顺序一次保存；稳定 ID 使服装归属和已选标签保持不变。
 * @param {SubmitEvent} event 标签编辑表单提交事件。
 * @returns {void} 保存成功关闭对话框，失败保留编辑内容。
 */
function saveGarmentGroups(event) {
    event.preventDefault();
    try {
        const groups = new Map();
        const names = new Set();
        for (const row of panel.querySelectorAll('.tw-group-row')) {
            const name = row.querySelector('input').value.trim();
            if (!name) throw new Error('标签名称不能为空。');
            if (names.has(name)) throw new Error(`标签名称“${name}”重复。`);
            names.add(name);
            groups.set(row.dataset.groupId, name);
        }
        commitGarments(garments, selectedGarmentId, groups, false);
        closeGarmentGroupManager();
        setLibraryStatus('标签名称与顺序已保存');
    } catch (error) { panel.querySelector('.tw-group-status').textContent = String(error); }
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
 * 详情标签选择后立即保存归属，仅刷新列表，避免切换筛选丢失分配或覆盖未保存的名称和描述。
 * @param {Event} event 当前服装标签选择器的变化事件。
 * @returns {void} 保存失败时恢复原标签并显示错误，成功后可立即按该标签筛选。
 */
function assignGarmentGroup(event) {
    const select = event.currentTarget;
    const item = garments.get(selectedGarmentId);
    const next = new Map(garments);
    next.set(item.id, { ...item, groupId: select.value });
    try {
        commitGarments(next, item.id, garmentGroups, false);
        setGarmentStatus('标签已保存');
    } catch (error) {
        select.value = item.groupId;
        setGarmentStatus(String(error), true);
    }
}

/**
 * 同步标签管理入口、带独立删除入口的标签导航和归类选择器，所有用户文本通过文本节点写入。
 * @returns {void} 无返回值。
 */
function renderGarmentGroups() {
    panel.querySelector('[data-action="manage-groups"]').disabled = garmentGroups.size === 0;
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
 * 同步多选模式、勾选及底部操作栏状态，不重建图片，保留勾选时的键盘焦点。
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
    for (const control of panel.querySelectorAll('[data-bulk], .tw-bulk-group, .tw-bulk-apply, .tw-bulk-category, .tw-bulk-favorite')) control.disabled = count === 0;
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
 * @returns {Promise<void>} 操作及异步导出结束后完成。
 */
async function handleBulkAction(event) {
    const control = event.type === 'change' ? event.currentTarget : event.target.closest('button[data-bulk]');
    if (!control || !checkedGarmentIds.size) return;
    // 应用后服装可能不再匹配“未分配”等筛选，先记住操作数量，避免重绘清空勾选后显示 0 件。
    const count = checkedGarmentIds.size;
    try {
        const action = event.type === 'change' ? control.value : control.dataset.bulk;
        if (action === 'export') await exportGarments(checkedGarmentIds);
        else if (action === 'delete') deleteGarments(new Set(checkedGarmentIds));
        else {
            const wearer = action.endsWith('-user') ? 'user' : 'char';
            const removing = action.startsWith('unapply-');
            applyGarments(checkedGarmentIds, wearer, removing);
            renderGarmentLibrary();
            renderWearerState();
            setLibraryStatus(removing ? `已取消 ${wearer === 'user' ? 'USER' : 'Char'} 的 ${count} 件服装应用` : `已应用 ${count} 件服装到 ${wearer === 'user' ? 'USER' : 'Char'}`);
        }
    } catch (error) { setLibraryStatus(String(error), true); }
    finally { if (event.type === 'change') control.value = ''; }
}

/**
 * 批量保存前验证发送内容；应用时同步记录最近使用，取消应用保留历史，任一失败不更新内存。
 * @param {Iterable<string>} ids 待处理的服装标识。
 * @param {string} wearer 目标角色 user 或 char。
 * @param {boolean} removing 是否取消应用。
 * @returns {void} 无返回值。
 */
function applyGarments(ids, wearer, removing = false) {
    const selections = readWearerSelections();
    const next = new Map(garments);
    const usedAt = Date.now();
    for (const id of ids) {
        if (removing) selections[wearer].delete(id);
        else {
            const item = garments.get(id);
            try { buildWardrobeContent(item, sendSettings); }
            catch (error) { throw new Error(`${item.name}：${error.message}`); }
            selections[wearer].add(id);
            next.set(id, { ...item, lastUsedAt: usedAt });
        }
    }
    // 归属与使用时间一次写入，避免归属保存失败却留下虚假的最近使用记录。
    const saved = buildWearerSelectionUpdate(selections);
    if (!removing) saved.wardrobe_items = Array.from(next.values());
    insertOrAssignVariables(saved, { type: 'script' });
    if (!removing) garments = next;
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
        const includesSelected = checkedGarmentIds.has(selectedGarmentId);
        const next = new Map(garments);
        for (const id of checkedGarmentIds) next.set(id, { ...next.get(id), groupId });
        commitGarments(next, selectedGarmentId, garmentGroups, false);
        if (includesSelected) panel.querySelector('[name="garment_group"]').value = groupId;
        setLibraryStatus(`已移动 ${count} 件服装`);
    } catch (error) { setLibraryStatus(String(error), true); }
}

/**
 * 将分类或收藏状态一次提交给全部勾选服装，保留归属、其他字段及详情草稿。
 * @param {Event} event 分类或收藏菜单的变化事件。
 * @returns {void} 保存失败保留原状态，菜单复位以便连续操作。
 */
function updateCheckedGarments(event) {
    const select = event.currentTarget;
    if (!checkedGarmentIds.size) return;
    const category = select.classList.contains('tw-bulk-category');
    const patch = category ? { category: select.value } : { favorite: select.value === 'favorite' };
    const count = checkedGarmentIds.size;
    const includesSelected = checkedGarmentIds.has(selectedGarmentId);
    try {
        const next = new Map(garments);
        for (const id of checkedGarmentIds) next.set(id, { ...next.get(id), ...patch });
        commitGarments(next, selectedGarmentId, garmentGroups, false);
        if (category && includesSelected) panel.querySelector('[name="garment_category"]').value = patch.category;
        setLibraryStatus(`已${category ? '修改分类：' : patch.favorite ? '收藏 ' : '取消收藏 '}${count} 件服装`);
    } catch (error) { setLibraryStatus(String(error), true); }
    finally { select.value = ''; }
}

/**
 * 在列表区域报告操作结果；成功提示 3 秒后清空，由空状态样式收起，错误保留供用户查看。
 * @param {string} message 操作结果。
 * @param {boolean} error 是否为错误。
 * @returns {void} 无返回值。
 */
function setLibraryStatus(message, error = false) {
    // 新提示替换旧提示时取消原计时，避免连续操作后新消息被旧计时提前清除。
    window.parent.clearTimeout(libraryStatusTimer);
    libraryStatusTimer = undefined;
    const status = panel.querySelector('.tw-library-status');
    status.textContent = message;
    status.dataset.error = String(error);
    if (message && !error) {
        libraryStatusTimer = window.parent.setTimeout(() => {
            status.textContent = '';
            libraryStatusTimer = undefined;
        }, 3000);
    }
}

/**
 * 在变量入口按当前范围读取并归一化选择；只有全局范围兼容旧聊天存档，独立范围从空选择开始。
 * @returns {{user: Set<string>, char: Set<string>}} 两个角色的有效服装标识集合。
 */
function readWearerSelections() {
    const selections = { user: new Set(), char: new Set() };
    let variables = getVariables({ type: 'script' });
    const location = getSelectionLocation(variables);
    if (location.scope !== 'global') {
        variables = { wardrobe_selections: location.key ? variables.wardrobe_scoped_selections?.[location.key] : undefined };
    }
    // 明确保存的空集合也是用户选择，不能让切换聊天重新激活旧服装。
    const migrating = location.scope === 'global' && variables.wardrobe_selections === undefined && Boolean(SillyTavern.getCurrentChatId());
    if (migrating) variables = getVariables({ type: 'chat' });
    const saved = variables.wardrobe_selections;
    if (saved && typeof saved === 'object') {
        for (const wearer of WEARERS) {
            if (!Array.isArray(saved[wearer])) continue;
            for (const id of saved[wearer]) if (garments.has(id)) selections[wearer].add(id);
        }
    } else if (garments.has(variables.wardrobe_active_id)) selections.char.add(variables.wardrobe_active_id);
    if (migrating && (saved !== undefined || variables.wardrobe_active_id != null)) saveWearerSelections(selections);
    return selections;
}

/**
 * 将两个角色的选择写入当前范围，与批量应用共用同一补丁构建入口。
 * @param {{user: Set<string>, char: Set<string>}} selections 已归一化的角色服装选择。
 * @returns {void} 无返回值；写入失败交由调用方报告。
 */
function saveWearerSelections(selections) {
    insertOrAssignVariables(buildWearerSelectionUpdate(selections), { type: 'script' });
}

/**
 * 使用角色卡头像文件名作为稳定标识；聊天再附加聊天 ID，避免同名聊天在不同角色或群组间串用。
 * @param {Object} variables 当前脚本变量，范围值在此入口归一化。
 * @returns {{scope: string, key: string|null}} 当前保存范围及独立存档键；没有所需上下文时键为空。
 */
function getSelectionLocation(variables) {
    const scope = ['character', 'chat'].includes(variables.wardrobe_selection_scope) ? variables.wardrobe_selection_scope : 'global';
    if (scope === 'global') return { scope, key: null };
    const context = SillyTavern.getContext();
    const avatar = context.characters[context.characterId]?.avatar;
    if (scope === 'character') return { scope, key: !context.groupId && avatar ? JSON.stringify(['character', avatar]) : null };
    const owner = context.groupId ? ['group', String(context.groupId)] : avatar ? ['character', avatar] : null;
    const chatId = SillyTavern.getCurrentChatId();
    return { scope, key: owner && chatId ? JSON.stringify(['chat', ...owner, chatId]) : null };
}

/**
 * 构建当前范围的存档补丁，使穿搭选择与最近使用记录仍能一次写入，不改变其他范围。
 * @param {{user: Set<string>, char: Set<string>}} selections 已归一化的角色服装选择。
 * @returns {Object} 交给脚本变量接口的字段补丁；缺少角色卡／聊天时抛错而不串用全局选择。
 */
function buildWearerSelectionUpdate(selections) {
    const variables = getVariables({ type: 'script' });
    const location = getSelectionLocation(variables);
    const saved = { user: Array.from(selections.user), char: Array.from(selections.char) };
    if (location.scope === 'global') return { wardrobe_selections: saved };
    if (!location.key) throw new Error(location.scope === 'character' ? '请先打开单角色聊天，再设置按角色卡的穿搭。' : '请先打开聊天，再设置按聊天的穿搭。');
    return { wardrobe_scoped_selections: { ...variables.wardrobe_scoped_selections, [location.key]: saved } };
}

/**
 * 保存范围偏好并刷新穿搭归属；不复制上一范围的选择，也不重填详情而丢失编辑草稿。
 * @param {Event} event 范围菜单变化事件，值限定为菜单中三个选项。
 * @returns {void} 无返回值，存储失败恢复菜单原值并显示错误。
 */
function selectSelectionScope(event) {
    try {
        insertOrAssignVariables({ wardrobe_selection_scope: event.currentTarget.value }, { type: 'script' });
        checkedGarmentIds.clear();
        renderGarmentLibrary();
        renderWearerState();
    } catch (error) {
        event.currentTarget.value = getSelectionLocation(getVariables({ type: 'script' })).scope;
        setLibraryStatus(String(error), true);
    }
}

/**
 * 按当前服装的复选框保存穿着归属，另一角色仅在用户单独勾选后才可使用。
 * @param {Event} event 归属复选框变化事件。
 * @returns {void} 无返回值。
 */
function selectWearer(event) {
    const input = event.target.closest('input[data-wearer]');
    if (!input) return;
    // 保存详情会刷新复选框，先保留用户本次选择，避免读取到刷新后的旧归属。
    const wearer = input.dataset.wearer;
    const removing = !input.checked;
    try {
        if (!removing && !saveSelectedGarment()) {
            renderWearerState();
            return;
        }
        applyGarments([selectedGarmentId], wearer, removing);
        refreshWardrobe();
        setGarmentStatus(removing ? '已取消该角色的穿着归属' : '已保存穿着归属');
    } catch (error) {
        renderWearerState();
        setGarmentStatus(String(error), true);
    }
}

/**
 * 从已保存的角色清单同步当前服装的归属，未指定的角色始终保持未勾选。
 * @returns {void} 无返回值。
 */
function renderWearerState() {
    const selections = readWearerSelections();
    const location = getSelectionLocation(getVariables({ type: 'script' }));
    panel.querySelector('.tw-selection-scope select').value = location.scope;
    panel.querySelector('.tw-selection-scope select').title = location.scope !== 'global' && !location.key ? '请打开对应的角色卡或聊天' : '';
    for (const input of panel.querySelectorAll('input[data-wearer]')) {
        input.checked = selections[input.dataset.wearer].has(selectedGarmentId);
        input.disabled = !selectedGarmentId || (location.scope !== 'global' && !location.key);
    }
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
 * 分类数量和可见列表共用筛选规则，归属始终读取当前穿搭范围；共享服装同时匹配两侧。
 * @param {WardrobeItem} item 已校验的服装记录。
 * @param {string} filter 分类或快捷筛选标识。
 * @param {{user: Set<string>, char: Set<string>}} selections 当前范围的穿着归属。
 * @returns {boolean} 服装是否满足筛选条件。
 */
function matchesGarmentFilter(item, filter, selections) {
    switch (filter) {
        case 'all': return true;
        case 'favorites': return item.favorite;
        case 'recent': return item.lastUsedAt > 0;
        case 'combinations': return Boolean(item.componentIds);
        case 'assigned-user': return selections.user.has(item.id);
        case 'assigned-char': return selections.char.has(item.id);
        case 'unassigned': return !selections.user.has(item.id) && !selections.char.has(item.id);
        case 'missing-description': return item.descriptionOverride ? !item.description.trim() : getGarmentMembers(item).some(member => !member.description.trim());
        case 'missing-image': return getGarmentMembers(item).some(member => !member.image);
        default: return item.category === filter;
    }
}

/**
 * 按标签、关键词和分类筛选后排序；数量与搜索同步，最近使用只显示有应用记录的服装。
 * @returns {void} 无返回值。
 */
function renderGarmentLibrary() {
    renderGarmentGroups();
    const selections = readWearerSelections();
    const counts = new Map();
    const cards = hostDocument.createDocumentFragment();
    const items = [];
    visibleGarmentIds = new Set();
    for (const item of garments.values()) {
        if (currentGroup !== '*' && currentGroup !== item.groupId) continue;
        if (garmentSearch && !`${item.name}\n${getGarmentDescription(item)}\n${CATEGORY_LABELS.get(item.category)}\n${garmentGroups.get(item.groupId) ?? '未分组'}`.toLocaleLowerCase().includes(garmentSearch)) continue;
        counts.set('all', (counts.get('all') ?? 0) + 1);
        counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
        // 快捷筛选数量与标签、搜索同步，按固定筛选数单次遍历，不逐件扫描角色清单。
        for (const [filter] of QUICK_FILTERS) if (matchesGarmentFilter(item, filter, selections)) counts.set(filter, (counts.get(filter) ?? 0) + 1);
        if (!matchesGarmentFilter(item, currentCategory, selections)) continue;
        items.push(item);
    }
    // 只排序筛选结果，不改动存档顺序；最近使用分类默认时间倒序，也允许用户主动选择名称排序。
    if (garmentSort === 'recent' || (currentCategory === 'recent' && garmentSort === 'default')) items.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
    else if (garmentSort === 'name-asc') items.sort((a, b) => GARMENT_NAME_COLLATOR.compare(a.name, b.name));
    else if (garmentSort === 'name-desc') items.sort((a, b) => GARMENT_NAME_COLLATOR.compare(b.name, a.name));
    for (const item of items) {
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
        const favorite = hostDocument.createElement('button');
        favorite.type = 'button';
        favorite.className = 'tw-favorite';
        favorite.dataset.favorite = item.id;
        favorite.setAttribute('aria-pressed', String(item.favorite));
        favorite.setAttribute('aria-label', `${item.favorite ? '取消收藏' : '收藏'}${item.name}`);
        favorite.title = item.favorite ? '取消收藏' : '收藏';
        favorite.innerHTML = icon('heart');
        const card = hostDocument.createElement('button');
        card.type = 'button';
        card.className = 'tw-garment-card';
        card.dataset.garment = item.id;
        card.setAttribute('aria-pressed', String(item.id === selectedGarmentId));
        const cover = item.image || (item.componentIds ? garments.get(item.componentIds[0]).image : '');
        if (cover) {
            const image = hostDocument.createElement('img');
            image.src = cover;
            image.alt = item.name;
            // 列表交给浏览器懒加载和异步解码原图路径，不在渲染时读取 Base64 或另存缩略副本。
            image.loading = 'lazy';
            image.decoding = 'async';
            card.append(image);
        } else card.innerHTML = icon(item.componentIds ? 'star' : 'shirt');
        const name = hostDocument.createElement('span');
        name.textContent = item.componentIds ? `${item.name}（${item.componentIds.length} 件搭配）` : item.name;
        card.append(name);
        const metadata = hostDocument.createElement('div');
        metadata.className = 'tw-card-meta';
        const badge = hostDocument.createElement('small');
        badge.textContent = selections.user.has(item.id) ? (selections.char.has(item.id) ? 'USER · Char' : 'USER') : (selections.char.has(item.id) ? 'Char' : '未分配');
        badge.title = `穿着归属：${badge.textContent}`;
        metadata.append(badge);
        const tags = hostDocument.createElement('div');
        tags.className = 'tw-card-tags';
        const tag = hostDocument.createElement('small');
        tag.textContent = garmentGroups.get(item.groupId) ?? '未分组';
        tag.title = `标签：${tag.textContent}`;
        tag.setAttribute('aria-label', tag.title);
        tags.append(tag);
        metadata.append(tags);
        card.append(metadata);
        entry.append(label, favorite, card);
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
        button.querySelector('.tw-count').textContent = String(counts.get(button.dataset.category) ?? 0);
    }
    panel.querySelector('#tw-empty-title').textContent = garmentSearch ? '没有匹配的服装' : currentCategory === 'all' ? '这里还没有服装' : currentCategory === 'favorites' ? '还没有收藏的服装' : currentCategory === 'recent' ? '还没有最近使用的服装' : `暂无${CATEGORY_LABELS.get(currentCategory)}`;
    renderBulkState();
}

/**
 * 根据当前选中服装填充详情，搭配的合并正文直接进入唯一描述编辑框，并同步当前范围的应用入口。
 * @returns {void} 无返回值。
 */
function renderGarmentDetails() {
    const item = garments.get(selectedGarmentId);
    renderGarmentImage();
    panel.querySelector('[name="garment_name"]').value = item?.name ?? '';
    panel.querySelector('[name="garment_category"]').value = item?.category ?? 'other';
    panel.querySelector('[name="garment_group"]').value = item?.groupId ?? '';
    panel.querySelector('[name="garment_description"]').value = item ? getGarmentDescription(item) : '';
    panel.querySelector('[name="garment_description"]').placeholder = '填写款式、颜色、材质等服装描述';
    panel.querySelector('.tw-description-actions').hidden = Boolean(item?.componentIds);
    panel.querySelector('.tw-combination-details').hidden = !item?.componentIds;
    setDescriptionBusy(Boolean(descriptionRequest));
    renderWearerState();
}

/**
 * 只更新图片预览与状态，详情加载和替换图片共用，不覆盖尚未保存的名称、分类和描述。
 * @returns {void} 无返回值。
 */
function renderGarmentImage() {
    const item = garments.get(selectedGarmentId);
    const preview = panel.querySelector('.tw-preview');
    preview.replaceChildren();
    preview.dataset.combination = String(Boolean(item?.componentIds));
    if (item?.componentIds) {
        for (const member of getGarmentMembers(item)) {
            const cell = hostDocument.createElement('div');
            cell.className = 'tw-preview-member';
            if (member.image) {
                const image = hostDocument.createElement('img');
                image.src = member.image;
                image.alt = member.name;
                cell.append(image);
            } else cell.innerHTML = icon('shirt');
            const name = hostDocument.createElement('span');
            name.textContent = member.name;
            name.title = member.name;
            cell.append(name);
            preview.append(cell);
        }
    } else if (item?.image) {
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
    panel.querySelector('#tw-garment-image-state').textContent = item?.componentIds ? '使用成员图片' : item ? (item.image ? '已导入' : '无图片') : '—';
}

/**
 * 收藏按钮独立切换状态；普通模式打开详情，多选模式点击卡片即勾选，手机不跳转到详情页。
 * @param {MouseEvent} event 服装列表点击事件。
 * @returns {void} 无返回值。
 */
function selectGarment(event) {
    const favorite = event.target.closest('[data-favorite]');
    if (favorite) {
        toggleGarmentFavorite(favorite.dataset.favorite);
        return;
    }
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
 * 即时保存指定服装的收藏状态，只刷新列表，保留预览选择、详情草稿和进行中的识图请求。
 * @param {string} id 收藏按钮对应的服装标识。
 * @returns {void} 保存失败时显示错误并保留原收藏状态。
 */
function toggleGarmentFavorite(id) {
    const item = garments.get(id);
    const next = new Map(garments);
    next.set(id, { ...item, favorite: !item.favorite });
    try {
        commitGarments(next, selectedGarmentId, garmentGroups, false);
    } catch (error) {
        setLibraryStatus(String(error), true);
    }
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
 * 使用所选提示词识别图片；JSON 回复填入名称和描述，并按 category 即时归类，纯文本保留名称和标签。
 * @returns {Promise<void>} 识别请求与编辑框更新完成后结束。
 */
async function generateGarmentDescription() {
    if (descriptionRequest) return;
    const item = garments.get(selectedGarmentId);
    let request;
    try {
        const config = savedApiSettings;
        if (config.mode === 'custom' && (!config.apiurl || !config.model)) throw new Error('请先在 API 页保存完整的接口地址与模型。');
        request = { generationId: `wardrobe-description-${window.parent.crypto.randomUUID()}` };
        descriptionRequest = request;
        setDescriptionBusy(true);
        setGarmentStatus('正在生成服装描述…');
        const result = await requestGarmentDescription(item, panel.querySelector('[name="description_mode"]').value, config, request);
        if (!result) return;
        // 先完整校验回复再更新表单，格式错误时保留原来的名称、描述和存档。
        if (result.category !== undefined) commitGeneratedGarment(garments.get(item.id), result, false);
        if (result.name !== undefined) panel.querySelector('[name="garment_name"]').value = result.name;
        panel.querySelector('[name="garment_description"]').value = result.description;
        setGarmentStatus(result.category !== undefined ? '标签已保存，名称与描述请保存或应用' : result.name !== undefined ? '名称与描述已生成，请保存或应用' : '描述已生成，请保存或应用');
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
 * 确认后逐张识别缺描述图片；缺描述筛选下只处理当前可见结果，其他页面沿用整个衣柜。
 * @returns {Promise<void>} 批次完成、取消或首个失败后结束；不提交当前编辑框的草稿。
 */
async function generateMissingGarmentDescriptions() {
    if (descriptionRequest) return;
    const ids = [];
    for (const item of garments.values()) {
        if (currentCategory === 'missing-description' && !visibleGarmentIds.has(item.id)) continue;
        // 编辑框里的文字尚未保存也视为已有描述，避免批量识别覆盖用户草稿。
        if (item.image && !item.description.trim() &&
            (item.id !== selectedGarmentId || !panel.querySelector('[name="garment_description"]').value.trim())) ids.push(item.id);
    }
    if (!ids.length) {
        setLibraryStatus('没有需要识图的图片，已有描述的图片会自动跳过');
        return;
    }
    if (!window.parent.confirm(`${currentCategory === 'missing-description' ? '当前筛选中' : '衣柜中'}有 ${ids.length} 张图片尚未识别，是否一键识图？\n仅识别没有描述的图片，已有描述的图片将跳过。识别结果会自动保存。`)) return;
    let request;
    let completed = 0;
    try {
        const config = savedApiSettings;
        if (config.mode === 'custom' && (!config.apiurl || !config.model)) throw new Error('请先在 API 页保存完整的接口地址与模型。');
        request = { generationId: '', bulk: true, completed: 0 };
        descriptionRequest = request;
        setDescriptionBusy(true);
        // 顺序请求沿用单张识图流程，避免同时请求大量图片；每张独立保存，失败后可只重试剩余图片。
        for (const id of ids) {
            const item = garments.get(id);
            if (!item?.image || item.description.trim()) continue;
            request.generationId = `wardrobe-description-${window.parent.crypto.randomUUID()}`;
            const result = await requestGarmentDescription(item, 'outfit', config, request);
            if (!result) return;
            // 等待接口时列表仍可删除或更新记录；只补全原图未变且仍无描述的服装。
            const latest = garments.get(id);
            if (!latest?.image || latest.image !== item.image || latest.description.trim()) continue;
            commitGeneratedGarment(latest, result, true);
            request.completed = ++completed;
            if (id === selectedGarmentId) {
                panel.querySelector('[name="garment_name"]').value = result.name ?? latest.name;
                panel.querySelector('[name="garment_description"]').value = result.description;
            }
        }
        setLibraryStatus(`识图完成，已识别并保存 ${completed} 张图片`);
    } catch (error) {
        if (root.isConnected && (!request || descriptionRequest === request)) {
            setLibraryStatus(`识图已停止，已保存 ${completed} 张图片。${describeApiError(error)}`, true);
        }
    } finally {
        if (request && descriptionRequest === request) {
            descriptionRequest = null;
            setDescriptionBusy(false);
        }
    }
}

/**
 * 单张与批量识图共用图片读取、提示词和回复校验，取消后不再发请求或接收结果。
 * @param {WardrobeItem} item 待识别的服装。
 * @param {string} promptMode 已选择的服装或单品提示词类型。
 * @param {Object} config 本次识图使用的已保存 API 配置。
 * @param {Object} request 当前可取消的识图请求。
 * @returns {Promise<Object|null>} 解析后的名称、描述与可选标签；已取消时返回空值。
 */
async function requestGarmentDescription(item, promptMode, config, request) {
    const { mode, ...customApi } = config;
    const values = { name: item.name, category: CATEGORY_LABELS.get(item.category) };
    const image = await loadImageDataUrl(item.image);
    // 读取原图期间也允许取消识别，取消后不再启动新的生成请求。
    if (descriptionRequest !== request) return null;
    const reply = await generateRaw({
        generation_id: request.generationId,
        image,
        // 仅替换一次变量，服装名中的模板标记保留为普通文本，不带入聊天历史或角色提示。
        user_input: `${descriptionPrompts[promptMode].replace(DESCRIPTION_VARIABLES, (_match, name) => values[name])}\n\n输出格式：仅返回包含 name、description、category 三个非空字符串字段的 JSON 对象，不要使用代码块。category 是根据图片判断的衣柜标签名称，优先选择合适的已有标签：${JSON.stringify(Array.from(garmentGroups.values()))}；没有合适标签时给出简短的新标签名称。`,
        ordered_prompts: ['user_input'],
        max_chat_history: 0,
        should_stream: false,
        should_silence: true,
        ...(mode === 'custom' ? { custom_api: customApi } : {}),
    });
    return descriptionRequest === request ? parseGarmentDescriptionReply(reply) : null;
}

/**
 * 在模型回复入口解析名称、描述和可选标签，兼容完整 JSON 代码块及旧提示词返回的纯文本。
 * @param {unknown} reply 模型返回的原始文本。
 * @returns {{name?: string, description: string, category?: string}} 去除首尾空白的字段；纯文本不提供名称或标签。
 */
function parseGarmentDescriptionReply(reply) {
    if (typeof reply !== 'string' || !reply.trim()) throw new Error('接口未返回服装描述。');
    const text = reply.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/i, '$1').trim();
    if (!text) throw new Error('接口未返回服装描述。');
    // 只解析完整 JSON，不截取混有额外说明的片段，避免把不完整的内容当成生成成功。
    if (!text.startsWith('{') && !text.startsWith('[')) return { description: text };
    let data;
    try { data = JSON.parse(text); }
    catch { throw new Error('AI 返回的 JSON 格式错误，请重新生成。'); }
    if (!data || Array.isArray(data) || typeof data.name !== 'string' || !data.name.trim() ||
        typeof data.description !== 'string' || !data.description.trim()) {
        throw new Error('AI 返回的 JSON 需要包含非空字符串 name 和 description，请检查提示词后重新生成。');
    }
    if (data.category !== undefined && (typeof data.category !== 'string' || !data.category.trim())) {
        throw new Error('AI 返回的 category 需要是非空的标签名称，请检查提示词后重新生成。');
    }
    return { name: data.name.trim(), description: data.description.trim(), category: data.category?.trim() };
}

/**
 * 复用或创建 AI 判断的标签；批量识图将名称、描述与标签同次保存，避免存储失败留下部分更新。
 * @param {WardrobeItem} item 识图对应的服装。
 * @param {Object} result 已在回复入口校验的名称、描述及可选标签。
 * @param {boolean} saveDescription 是否同时保存名称与描述；单张识图仍保留原有草稿流程。
 * @returns {void} 保存成功后同步当前服装的标签选择器，不提交其他编辑草稿。
 */
function commitGeneratedGarment(item, result, saveDescription) {
    const groups = new Map(garmentGroups);
    let groupId = item.groupId;
    if (result.category !== undefined) {
        groupId = undefined;
        for (const [id, label] of groups) {
            if (label === result.category) { groupId = id; break; }
        }
        if (!groupId) {
            groupId = window.parent.crypto.randomUUID();
            groups.set(groupId, result.category);
        }
    }
    const next = new Map(garments);
    next.set(item.id, { ...item, groupId, ...(saveDescription ? { name: result.name ?? item.name, description: result.description } : {}) });
    commitGarments(next, selectedGarmentId, groups, false);
    if (item.id === selectedGarmentId) panel.querySelector('[name="garment_group"]').value = groupId;
}

/**
 * 识别期间暂时锁定当前服装编辑；搭配直接引用成员图文，不对搭配另行上传或识图。
 * @param {boolean} busy 是否正在识别。
 * @returns {void} 无返回值。
 */
function setDescriptionBusy(busy) {
    const item = garments.get(selectedGarmentId);
    for (const control of panel.querySelectorAll('.tw-details input, .tw-details select, .tw-details textarea, [data-action="save-garment"]')) {
        control.disabled = !item || busy;
    }
    const button = panel.querySelector('[data-action="describe"]');
    button.disabled = !item?.image || busy;
    button.textContent = busy ? '正在生成…' : 'AI 生成描述';
    for (const control of panel.querySelectorAll('[data-action="export-one"], [data-action="delete-one"]')) control.disabled = !item || busy;
    panel.querySelector('[data-action="remove-image"]').disabled = !item?.image || busy;
    const replaceButton = panel.querySelector('[data-action="replace-image"]');
    replaceButton.disabled = !item || busy || replacingImage;
    replaceButton.textContent = replacingImage ? '上传中…' : item?.image ? '替换图片' : '上传图片';
    if (item?.componentIds) replaceButton.disabled = true;
    panel.querySelector('[data-action="edit-combination"]').disabled = !item?.componentIds || busy;
    const bulkButton = panel.querySelector('[data-action="describe-all"]');
    bulkButton.disabled = busy;
    bulkButton.textContent = descriptionRequest?.bulk ? '识图中…' : '一键识图';
}

/**
 * 切换服装、关闭衣柜或卸载时停止单张或批量识别，保留批量任务已经保存的结果。
 * @returns {void} 无返回值。
 */
function stopDescriptionRequest() {
    if (!descriptionRequest) return;
    const request = descriptionRequest;
    descriptionRequest = null;
    stopGenerationById(request.generationId);
    setDescriptionBusy(false);
    if (request.bulk) setLibraryStatus(`识图已取消，已保存 ${request.completed} 张图片`);
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
        const updated = { ...item, name: name.value, category: panel.querySelector('[name="garment_category"]').value, groupId: panel.querySelector('[name="garment_group"]').value, ...readGarmentDescriptionDraft(item) };
        const next = new Map(garments);
        next.set(item.id, updated);
        validateAppliedGarmentChange(item.id, next);
        commitGarments(next, item.id);
        setGarmentStatus('已保存');
        return updated;
    } catch (error) {
        setGarmentStatus(String(error), true);
        return undefined;
    }
}

/**
 * 验证正在应用的服装及依赖它的搭配，编辑描述和删除图片共用同一个提交前检查。
 * @param {string} changedId 本次修改的服装 ID。
 * @param {Map<string, WardrobeItem>} next 待提交的服装表。
 * @returns {void} 缺少当前发送方式要求的成员图文时抛出错误。
 */
function validateAppliedGarmentChange(changedId, next) {
    const selections = readWearerSelections();
    const applied = new Set([...selections.user, ...selections.char]);
    // 单品通过搭配间接应用时也要验证，避免保存成功后下一次聊天才发现成员资料不完整。
    for (const id of applied) {
        const active = next.get(id);
        if (id === changedId) buildWardrobeContent(active, sendSettings, next);
        else for (const memberId of active.componentIds ?? []) {
            if (memberId !== changedId) continue;
            buildWardrobeContent(active, sendSettings, next);
            break;
        }
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
 * 按发送模式构建一套穿搭；搭配按成员验证并发送多张图片，始终算一套。
 * @param {WardrobeItem} item 当前应用的服装。
 * @param {{content_type: string, position: string}} settings 已保存的发送设置。
 * @param {Map<string, WardrobeItem>} items 成员所在服装表。
 * @returns {Object[]} 符合酒馆多模态消息格式的内容块。
 */
function buildWardrobeContent(item, settings, items = garments) {
    const parts = [];
    const members = getGarmentMembers(item, items);
    if (settings.content_type !== 'image') {
        // 自定义整套正文已覆盖成员文字；自动合并模式仍逐件检查，不能用空成员凑出看似完整的描述。
        const describedItems = item.descriptionOverride ? [item] : members;
        for (const member of describedItems) if (!member.description.trim()) throw new Error(`“${member.name}”缺少描述，当前内容类型需要文字描述，请先填写服装描述。`);
        parts.push({ type: 'text', text: `当前服装：${item.name}\n${getGarmentDescription(item, items)}` });
    }
    if (settings.content_type !== 'text') {
        for (const member of members) {
            if (!member.image) throw new Error(`“${member.name}”缺少图片，当前内容类型需要图片，请先导入服装图片。`);
            parts.push({ type: 'image_url', image_url: { url: member.image, detail: 'auto' } });
        }
    }
    return parts;
}

/**
 * 按穿着归属分别构建角色服装内容，附带名称与标签对应关系，供文字及图片模板匹配场景。
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
    // 同一角色已选择搭配时，成员不再单独成为候选穿搭；共享单品仍可属于多套搭配或另一角色。
    const memberIds = new Set();
    for (const item of items) if (item.componentIds) for (const id of item.componentIds) memberIds.add(id);
    items = items.filter(item => !memberIds.has(item.id));
    const images = [];
    const outfitNames = [];
    const descriptions = [];
    const outfits = [];
    const taggedOutfits = [];
    const combinations = [];
    for (const item of items) {
        const imageStart = images.length + 1;
        for (const part of buildWardrobeContent(item, settings)) if (part.type === 'image_url') images.push(part);
        outfitNames.push(item.name);
        const description = getGarmentDescription(item);
        descriptions.push(description);
        outfits.push(`${outfits.length + 1}. ${item.name}\n${description}`);
        const members = getGarmentMembers(item);
        combinations.push(`${outfits.length}. ${item.name}：${members.map(member => `${member.name}（${CATEGORY_LABELS.get(member.category)}）`).join('＋')}${settings.content_type === 'text' ? '' : `；参考图 ${imageStart}—${images.length}，依次对应上述成员`}`);
        // 标签使用穿搭编号，成员图片另按组合分组；直接读取实际标签，不猜测未分组服装的场景。
        const tag = garmentGroups.get(item.groupId);
        if (tag) taggedOutfits.push(`${outfits.length}. ${item.name}：${tag}`);
    }
    const values = {
        user: names.user, char: names.char, wearer: names[wearer],
        name: outfitNames.join('、'), description: descriptions.join('\n'),
        outfits: outfits.join('\n\n'), count: String(items.length),
    };
    const field = items.length === 1 ? 'single' : 'wardrobe';
    // 归属说明独立于可编辑模板，文字和图片模式均明确边界；共享只由两边清单同时列出表达。
    const texts = [`【${wearer === 'user' ? 'USER' : 'Char'}（${names[wearer]}）的服装】以下服装文字及紧随其后的图片仅供该角色使用。另一角色只能使用其自身服装清单中明确列出的服装，不得将本清单中未分配给对方的服装转给对方，也不得根据性别自动共享。`];
    if (memberIds.size) texts.push(`穿搭组合（以下每个编号为一套，成员同时穿着；切换时按整套切换，不将单品当作不同套装，不跨套混搭。图片按下列分组对应，不按图片张数计算套数）：\n${combinations.join('\n')}`);
    // 标签不依赖模板占位符，纯图片模式也能拿到实际场景标签，且不混入另一角色的服装。
    if (taggedOutfits.length) texts.push(`服装标签（用于匹配场景）：\n${taggedOutfits.join('\n')}`);
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
 * 将当前范围的 USER 与 Char 服装选择注入请求，按各自套数独立切换模板，不读取未保存表单。
 * @param {{chat: Object[], dryRun: boolean}} event 酒馆最终消息与预览标记。
 * @returns {Promise<void>} 只修改发送载荷；酒馆等待图片读取及注入完成后再发送请求。
 */
async function injectWardrobeContent(event) {
    if (apiRequest?.generationId || descriptionRequest) return;
    try {
        const selections = readWearerSelections();
        const names = { user: SillyTavern.name1 || 'USER', char: SillyTavern.name2 || 'Char' };
        const parts = [];
        for (const wearer of WEARERS) {
            const items = Array.from(selections[wearer], id => garments.get(id));
            for (const part of buildWearerContent(items, wearer, sendSettings, wardrobeTemplates, names)) parts.push(part);
        }
        if (parts.length) {
            // 多模态接口需要图片内容；全部读取成功后才修改请求，失败时不会注入一半清单。
            for (const part of parts) if (part.type === 'image_url') part.image_url.url = await loadSendImageDataUrl(part.image_url.url);
            insertWardrobeContent(event.chat, parts, sendSettings.position);
        }
    } catch (error) {
        toastr.error(String(error), '服装内容未发送');
    }
}

/**
 * 加载角色及图片模板，缺失或仍为原版默认值时使用新模板，自定义内容保留并填入编辑器。
 * @returns {void} 无返回值。
 */
function loadWardrobeTemplates() {
    const saved = getVariables({ type: 'script' }).wardrobe_templates;
    for (const wearer of TEMPLATE_OWNERS) {
        const form = settingsPanel.querySelector(`[data-template-owner="${wearer}"]`);
        for (const field of TEMPLATE_FIELDS) {
            const value = saved?.[wearer]?.[field];
            wardrobeTemplates[wearer][field] = typeof value === 'string' && value.trim() && value !== PREVIOUS_DEFAULT_TEMPLATES[wearer][field] ? value : DEFAULT_TEMPLATES[wearer][field];
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
 * 处理设置备份的选择文件、导出与导入；只传递明确允许的五类设置，始终排除全部 API 参数。
 * @param {MouseEvent|Event} event 导入／导出按钮点击或设置文件选择事件。
 * @returns {Promise<void>} 下载触发或设置保存并刷新表单后完成，失败在当前页提示。
 */
async function handleWardrobeData(event) {
    const input = settingsPanel.querySelector('.tw-data-import');
    if (event.type === 'click' && event.currentTarget.dataset.action === 'import-data') {
        input.click();
        return;
    }
    const importing = event.type === 'change';
    if (importing && !input.files.length) return;
    const status = settingsPanel.querySelector('.tw-data-status');
    const buttons = settingsPanel.querySelectorAll('[data-action="import-data"], [data-action="export-data"]');
    for (const button of buttons) button.disabled = true;
    status.textContent = importing ? '正在导入…' : '正在导出…';
    status.dataset.error = 'false';
    try {
        if (importing) {
            const settings = parseWardrobeSettingsData(JSON.parse(await input.files[0].text()));
            if (!root.isConnected) return;
            // 与手动切换发送类型保持一致，导入配置不能让当前已应用服装变成不可发送的状态。
            const selections = readWearerSelections();
            for (const wearer of WEARERS) {
                for (const id of selections[wearer]) buildWardrobeContent(garments.get(id), settings.send);
            }
            // 所有设置校验成功后一次提交；不从文件展开对象，也不读取或写入 wardrobe_api。
            insertOrAssignVariables({
                wardrobe_send: settings.send,
                wardrobe_templates: settings.templates,
                wardrobe_description_prompts: settings.description_prompts,
            }, { type: 'script' });
            loadSendSettings();
            loadWardrobeTemplates();
            loadDescriptionPrompts();
        } else {
            const templates = {};
            for (const owner of TEMPLATE_OWNERS) {
                templates[owner] = { single: wardrobeTemplates[owner].single, wardrobe: wardrobeTemplates[owner].wardrobe };
            }
            // 按字段构造备份，不导出脚本变量或设置对象整体，防止带出地址、模型、密钥及新增 API 字段。
            downloadWardrobeJson({
                format: 'tw-wardrobe-settings', version: 1,
                settings: {
                    send: { content_type: sendSettings.content_type, position: sendSettings.position },
                    templates,
                    description_prompts: { outfit: descriptionPrompts.outfit, item: descriptionPrompts.item },
                },
            }, '衣柜设置.json');
        }
        status.textContent = importing ? '已导入设置' : '已导出设置';
    } catch (error) {
        status.textContent = `${importing ? '导入' : '导出'}失败：${String(error)}`;
        status.dataset.error = 'true';
    } finally {
        if (importing) input.value = '';
        for (const button of buttons) button.disabled = false;
    }
}

/**
 * 在设置文件入口校验完整格式，并只提取允许恢复的字段；未知字段（包括 API）全部丢弃。
 * @param {unknown} data 从用户选择的 JSON 文件解析的数据。
 * @returns {{send: Object, templates: Object, description_prompts: Object}} 可直接保存的设置，不含 API 或服装数据。
 */
function parseWardrobeSettingsData(data) {
    if (data?.format !== 'tw-wardrobe-settings' || data.version !== 1 || !data.settings) {
        throw new Error('请选择“导出数据”生成的衣柜设置 JSON；服装备份请使用“导入服装”。');
    }
    const settings = data.settings;
    if (!['text', 'image', 'text_image'].includes(settings.send?.content_type) ||
        !['system_end', 'context_end', 'user_end'].includes(settings.send?.position)) {
        throw new Error('发送内容设置无效。');
    }
    const templates = {};
    for (const owner of TEMPLATE_OWNERS) {
        templates[owner] = {};
        for (const field of TEMPLATE_FIELDS) {
            const value = settings.templates?.[owner]?.[field];
            if (typeof value !== 'string' || !value.trim()) throw new Error('模板需要包含完整的 USER、Char 和图片模板。');
            templates[owner][field] = value.trim();
        }
    }
    const prompts = {};
    for (const field of Object.keys(DEFAULT_DESCRIPTION_PROMPTS)) {
        const value = settings.description_prompts?.[field];
        if (typeof value !== 'string' || !value.trim()) throw new Error('描述生成设置需要包含服装和单品提示词。');
        prompts[field] = value.trim();
    }
    return {
        send: { content_type: settings.send.content_type, position: settings.send.position },
        templates, description_prompts: prompts,
    };
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
 * 切换 API、发送内容、模板、描述生成及数据设置页，保留服装详情的未保存内容。
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
 * 接收搜索词并合并连续输入，仅重绘列表，保留详情草稿；清空搜索立即恢复筛选结果。
 * @param {Event} event 搜索框输入事件。
 * @returns {void} 无返回值。
 */
function searchGarments(event) {
    window.parent.clearTimeout(garmentSearchTimer);
    garmentSearch = event.currentTarget.value.trim().toLocaleLowerCase();
    checkedGarmentIds.clear();
    // 输入期间延后 150 毫秒重建卡片，避免每敲一个字符都重建图片节点。
    if (garmentSearch) garmentSearchTimer = window.parent.setTimeout(renderGarmentLibrary, 150);
    else renderGarmentLibrary();
}

/**
 * 将原生菜单的排序选择用于当前列表，保留批量勾选和详情中的未保存内容。
 * @param {Event} event 排序菜单变化事件。
 * @returns {void} 无返回值。
 */
function sortGarments(event) {
    garmentSort = event.currentTarget.value;
    window.parent.clearTimeout(garmentSearchTimer);
    renderGarmentLibrary();
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
 * 关闭后清除临时提示并恢复入口焦点，重新打开时不会残留上一次操作结果。
 * @returns {void} 无返回值。
 */
function restoreFocus() {
    setLibraryStatus('');
    opener.focus({ preventScroll: true });
}

/**
 * 停用或重载时中止图片读取、注销请求和聊天监听，并清理界面。
 * @returns {void} 无返回值。
 */
function destroyWardrobe() {
    stopDescriptionRequest();
    if (importConflictDialog?.open) importConflictDialog.close();
    closeImageImport();
    closeGarmentGroupManager();
    closeCombinationEditor();
    window.parent.clearTimeout(garmentSearchTimer);
    window.parent.clearTimeout(libraryStatusTimer);
    for (const subscription of subscriptions) subscription.stop();
    imageReadController.abort();
    for (const reader of imageReaders) reader.abort();
    for (const decoded of imageDecoders) {
        decoded.onerror();
        decoded.src = '';
    }
    imageDataCache.clear();
    sendImageCache.clear();
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
