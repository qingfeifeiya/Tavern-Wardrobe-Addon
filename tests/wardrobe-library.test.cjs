const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
const scriptVariables = {};
const chatVariables = {};
const controls = new Map();
const wearerInputs = ['user', 'char'].map(wearer => ({ dataset: { wearer }, checked: false }));
const downloads = [];
const blobs = new Map();
const imageFiles = new Map();
const imageRequests = [];
const notices = [];
const statusTimers = new Map();
const mobileViewport = { matches: false };
const encodedLocalImages = new WeakSet();
let timerSequence = 0;
let uploadFailureAt = Infinity;
let uploads = 0;
let uploadEffect;
let failImageReads = false;
let detailRefreshes = 0;
let writesFail = false;
let sequence = 0;
let confirmation = true;
let promptValue = '';
let promptDefault = '';
let chatId = 'chat';
let chat = [];
let globalWorldbooks = [];
let characterWorldbook = null;
let chatWorldbook = null;
const characterCards = ['角色甲.png', '角色乙.png'].map(avatar => ({ avatar, name: '同名角色' }));
let characterAvatar = '角色甲.png';
let groupId = null;
let duplicateAction = 'keep';
let duplicatePrompts = 0;
let imageDimensions = [64, 64];
let encodedImage = 'data:image/jpeg;base64,Y29tcHJlc3NlZC1pbWFnZQ==';
let decodeFailure = false;
let imageDecodes = 0;
const imageDraws = [];

/**
 * 模拟浏览器解码和画布编码，保留真实压缩函数的缩放、灰底、缓存和失败分支。
 * @param {string} tag 创建的节点类型。
 * @returns {Object|undefined} 图片或画布替身，其他节点交由原有替身创建。
 */
function createImageTestNode(tag) {
    if (tag === 'img') return {
        naturalWidth: imageDimensions[0], naturalHeight: imageDimensions[1],
        set src(value) {
            if (!value || !this.onload) return;
            imageDecodes++;
            queueMicrotask(() => decodeFailure ? this.onerror() : this.onload());
        },
    };
    if (tag === 'canvas') return {
        /** 创建记录绘制过程的上下文；无参数，返回二维画布替身。 */
        getContext() {
            const canvas = this;
            return {
                /** 检查透明图合成使用中灰底；参数为绘制区域，无返回值。 */
                fillRect() { assert.equal(this.fillStyle, '#808080'); },
                /** 记录实际缩放尺寸；参数为图片和目标区域，无返回值。 */
                drawImage() { imageDraws.push([canvas.width, canvas.height]); },
            };
        },
        /** 检查参考图编码参数并返回模拟结果；参数为格式和质量，返回数据地址。 */
        toDataURL(type, quality) {
            assert.equal(type, 'image/jpeg');
            assert.equal(quality, 0.82);
            return encodedImage;
        },
    };
}

/**
 * 模拟原生重复项对话框，驱动真实选择回调并记录提示次数。
 * @returns {Object} 可显示、关闭并读取选择结果的对话框替身。
 */
function createImportDialog() {
    let onClose;
    return {
        setAttribute() {}, querySelector: () => ({}), remove() {},
        addEventListener: (_name, callback) => { onClose = callback; },
        showModal() { duplicatePrompts++; this.returnValue = duplicateAction; onClose(); },
    };
}

/**
 * 模拟酒馆图片上传、读取和删除，断言使用真实请求参数，文件内容保持字节一致。
 * @param {string} url 请求地址。
 * @param {Object} options 请求方法、正文和取消信号。
 * @returns {Promise<Object>} 与本次图片操作对应的响应。
 */
async function imageFetch(url, options = {}) {
    const body = options.body ? JSON.parse(options.body) : undefined;
    imageRequests.push({ url, body, options });
    if (url === '/api/images/upload') {
        assert.equal(options.method, 'POST');
        assert.equal(options.headers['X-CSRF-Token'], 'test-token');
        assert.equal(body.ch_name, 'tavern_wardrobe');
        assert.ok(['png', 'jpg', 'webp'].includes(body.format));
        if (++uploads === uploadFailureAt) return { ok: false, status: 500 };
        const imagePath = `user/images/${body.ch_name}/${body.filename}.${body.format}`;
        imageFiles.set(imagePath, Buffer.from(body.image, 'base64'));
        if (uploadEffect) uploadEffect();
        return { ok: true, json: async () => ({ path: `/${imagePath}` }) };
    }
    if (url === '/api/images/delete') {
        assert.equal(options.method, 'POST');
        // 删除请求发生时，已保存的存档必须不再引用该文件。
        assert.ok(!scriptVariables.wardrobe_items.some(item => item.image === body.path || item.backImage === body.path));
        const removed = imageFiles.delete(body.path);
        return { ok: removed, status: removed ? 200 : 404 };
    }
    if (options.signal?.aborted) throw new Error('读取已取消');
    if (failImageReads || !imageFiles.has(url)) return { ok: false, status: 404 };
    return { ok: true, blob: async () => new Blob([imageFiles.get(url)], { type: 'application/octet-stream' }) };
}

/** 模拟浏览器图片读取器，支持异步读取和卸载取消。 */
class ImageReader {
    /**
     * 把图片字节转为浏览器格式的数据地址。
     * @param {Blob} blob 用户导入的图片或服务端返回的原图。
     * @returns {void} 结果通过读取事件回传。
     */
    readAsDataURL(blob) {
        if (blob instanceof File) encodedLocalImages.add(blob);
        blob.arrayBuffer().then(bytes => {
            if (this.aborted) return;
            this.result = `data:${blob.type};base64,${Buffer.from(bytes).toString('base64')}`;
            this.onload();
            this.onloadend();
        });
    }
    /** 中止本次读取并触发清理事件；无参数，无返回值。 */
    abort() { this.aborted = true; this.onabort(); this.onloadend(); }
}

/**
 * 为不依赖布局的数据回归提供最小控件，实际渲染由浏览器检查。
 * @param {string} selector 产品函数使用的选择器。
 * @returns {Object} 可读写的控件替身。
 */
function control(selector) {
    if (selector === '.tw-named-wearer-tags' && !controls.has(selector)) controls.set(selector, createLibraryNode());
    if (!controls.has(selector)) controls.set(selector, { children: [], querySelector: child => selector === '[data-bulk-favorite]' ? control(`favorite-${child}`) : null, querySelectorAll: () => [], value: selector === '[name="garment_content_rating"]' ? 'unrated' : '', dataset: {}, disabled: false, textContent: '', setAttribute(name, value) { this[name] = value; } });
    return controls.get(selector);
}

const document = {
    body: { append() {} },
    createElement: tag => createImageTestNode(tag) ?? (tag === 'dialog' ? createImportDialog() : ({ click() { downloads.push({ href: this.href, name: this.download }); }, remove() {} })),
};
const sandbox = {
    URL,
    window: { parent: {
        document, matchMedia: () => mobileViewport, Blob, AbortController,
        FileReader: ImageReader, fetch: imageFetch,
        // 用可手动触发的计时器验证提示生命周期，不让回归测试实际等待三秒。
        setTimeout: (callback, delay) => { const id = ++timerSequence; statusTimers.set(id, { callback, delay }); return id; },
        clearTimeout: id => statusTimers.delete(id),
        crypto: { randomUUID: () => `new-${++sequence}`, subtle: require('node:crypto').webcrypto.subtle },
        atob: value => Buffer.from(value, 'base64').toString('binary'),
        URL: { createObjectURL: blob => { const url = `blob:${++sequence}`; blobs.set(url, blob); return url; }, revokeObjectURL: url => blobs.delete(url) },
        confirm: () => confirmation,
        /** 记录标签输入框的预填值；参数为提示与默认值，返回模拟的用户输入。 */
        prompt: (_message, defaultValue) => { promptDefault = defaultValue; return promptValue; },
    } },
    getVariables: option => option.type === 'script' ? scriptVariables : chatVariables,
    insertOrAssignVariables: (data, option) => {
        if (writesFail) throw new Error('存储失败');
        Object.assign(option.type === 'script' ? scriptVariables : chatVariables, structuredClone(data));
    },
    SillyTavern: {
        getCurrentChatId: () => chatId, getRequestHeaders: () => ({ 'X-CSRF-Token': 'test-token' }),
        getContext: () => ({ chat, characterId: characterCards.findIndex(card => card.avatar === characterAvatar), characters: characterCards, groupId }),
    },
    getGlobalWorldbookNames: () => globalWorldbooks,
    getCharWorldbookNames: () => ({ primary: characterWorldbook, additional: [] }),
    getChatWorldbookName: () => chatWorldbook,
    toastr: { error: message => notices.push(message), success: message => notices.push(message) },
    console,
    recordDetailRefresh: () => { detailRefreshes++; },
    testPanel: { dataset: { mobileScreen: 'library' }, append() {}, querySelector: control, querySelectorAll: selector => selector === 'input[data-wearer]' ? wearerInputs : [] },
};
vm.createContext(sandbox);
const hooks = `
panel = testPanel;
/** 用现有确认与输入替身驱动业务；参数为弹窗内容，返回模拟选择。 */
askDialog = async ({ message, input }) => input === undefined ? window.parent.confirm(message) : window.parent.prompt(message, input);
settingsPanel = { open: false };
root = { isConnected: true };
refreshWardrobe = () => { recordDetailRefresh(); renderWearerState(); };
const actualRenderGarmentLibrary = renderGarmentLibrary;
const actualRenderGarmentGroups = renderGarmentGroups;
renderGarmentLibrary = () => {};
const actualRenderBulkState = renderBulkState;
renderBulkState = () => {};
showGarmentDescription = () => {};
globalThis.api = { parseWardrobeData, parseWardrobeFile, loadGarments, exportGarments, importGarmentFiles, importGarments, applyGarments,
    assignGarmentGroup, handleGarmentTagPicker, filterGarmentGroupOptions, setLibraryStatus, toggleGarmentFavorite, selectGarment,
    migrateLegacyImages, loadImageDataUrl, readGarmentImage, loadCachedGarmentImage, handleGarmentAction, injectWardrobeContent, deleteGarmentImages,
    deleteGarments, addGarmentGroup, deleteGarmentGroup, moveCheckedGarments, selectAllGarments,
    readWearerSelections, selectWearer, renderWearerState, handleBulkAction, toggleMultiSelect, checkGarment, renderBulkState: actualRenderBulkState,
    searchGarments, sortGarments,
    handleGarmentTransfer, selectSelectionScope, selectSelectionCharacter, renderSelectionCharacters, readEffectiveSelections,
    markOutfitChatPrompt, applyIsolatedOutfits, addNamedWearerTag, removeNamedWearerTag, refreshWardrobeContext, restoreLegacyNamedWearers,
    loadSendImageDataUrl, openImageReplacement, replaceGarmentImage, updateCheckedGarments,
    openGarmentGroupManager, saveGarmentGroups, reorderDraftRow, dragDraftRow, getFilterGarmentGroups, updateCategory,
    updateGarmentGroupSelection, deleteManagedGarmentGroups,
    renderGarmentImage, openGarmentImage, closeGarmentImage,
    openCombinationEditor, closeCombinationEditor, saveCombination, saveSelectedGarment,
    buildWardrobeContent, buildWearerContent, getGarmentDescription, matchesGarmentFilter, renderGarmentDetails,
    openImageImport, closeImageImport, addPendingImports, addImportLink, selectPendingImports, confirmImageImport,
    markDetailsDirty, setDetailsDirty, toggleMobileDetails,
    pendingImports: () => pendingGarmentImports,
    state: () => ({ garments, garmentGroups, garmentGroupFilters, currentCategory, currentGroup, selectedGarmentId, checkedGarmentIds, multiSelectMode }),
    selectGroup: id => { currentGroup = id; },
    showIds: ids => { visibleGarmentIds = new Set(ids); },
    selectItem: id => { selectedGarmentId = id; },
    sendType: type => { sendSettings.content_type = type; },
    /** 切换测试中的换装模式；参数为模式标识，无返回值。 */
    markerMode: mode => { sendSettings.marker_mode = mode; },
    sendImageQuality: quality => { sendSettings.image_quality = quality; },
    selectCategory: id => { currentCategory = id; },
    renderLibrary: () => { renderGarmentGroups = () => {}; actualRenderGarmentLibrary(); },
    renderFullLibrary: actualRenderGarmentLibrary,
    enableLibraryRendering: () => { renderGarmentGroups = actualRenderGarmentGroups; renderGarmentLibrary = actualRenderGarmentLibrary; },
};
return;
`;
vm.runInContext(source.replace('// 等待宿主文档就绪', hooks + '\n// 等待宿主文档就绪'), sandbox);
const api = sandbox.api;
const blue = { id: 'blue', name: '蓝色外套', category: 'coats', description: '蓝色丝绸', image: 'data:image/png;base64,aGVsbG8=', groupId: 'slim' };
const red = { ...blue, id: 'red', name: '红色外套', groupId: '' };
scriptVariables.wardrobe_items = [blue, red];
scriptVariables.wardrobe_groups = [{ id: 'slim', name: '修身' }, { id: 'empty', name: '宽松' }];

/**
 * 覆盖多选显隐、导出回读、批量归类和应用，以及失败时不覆盖原存档的关键路径。
 * @returns {Promise<void>} 所有断言完成后结束。
 */
async function main() {
    const libraryStatus = control('.tw-library-status');
    api.setLibraryStatus('已导出 2 件服装');
    assert.equal(libraryStatus.textContent, '已导出 2 件服装');
    assert.equal(statusTimers.values().next().value.delay, 3000, '成功提示停留三秒');
    const previousTimer = statusTimers.keys().next().value;
    api.setLibraryStatus('已导入');
    assert.equal(statusTimers.has(previousTimer), false, '新消息取消旧计时器');
    const [timerId, timer] = statusTimers.entries().next().value;
    statusTimers.delete(timerId);
    timer.callback();
    assert.equal(libraryStatus.textContent, '', '超时后清空提示，空状态样式会移除占位');
    api.setLibraryStatus('已导出');
    api.setLibraryStatus('存储失败', true);
    assert.equal(statusTimers.size, 1, '错误提示替换原有成功提示的计时器');
    assert.equal(statusTimers.values().next().value.delay, 8000, '错误提示沿用现有八秒停留时间');
    assert.equal(libraryStatus.textContent, '存储失败');
    api.setLibraryStatus('');
    assert.equal(libraryStatus.textContent, '');

    api.loadGarments();
    assert.equal(api.state().garments.get('blue').groupIds[0], 'slim');
    assert.equal(api.parseWardrobeData({ groups: [], items: [{ ...red, groupId: undefined }] }).items.get('red').groupIds[0], undefined, '旧服装默认未分组');
    assert.throws(() => api.parseWardrobeData({ groups: [], items: [{ ...red, image: 'https://bad.test/a.png' }] }), /有效图片/);
    assert.throws(() => api.parseWardrobeData({ groups: [], items: [red, red] }), /标识重复/);

    // 未标注不能静默变成 SFW；分级只在读取入口校验，后续编辑沿用原生选择框的取值。
    assert.equal(api.state().garments.get('blue').contentRating, 'unrated');
    for (const contentRating of ['sfw', 'nsfw', 'unrated']) {
        assert.equal(api.parseWardrobeData({ groups: [], items: [{ ...red, contentRating }] }).items.get('red').contentRating, contentRating);
    }
    for (const contentRating of ['', 'NSFW', null, true]) {
        assert.throws(() => api.parseWardrobeData({ groups: [], items: [{ ...red, contentRating }] }), /内容分级无效/);
    }
    control('[name="garment_name"]').value = blue.name;
    control('[name="garment_category"]').value = blue.category;
    control('[name="garment_description"]').value = blue.description;
    const ratingControl = control('[name="garment_content_rating"]');
    for (const contentRating of ['sfw', 'unrated', 'nsfw']) {
        ratingControl.value = contentRating;
        assert.equal(api.saveSelectedGarment().contentRating, contentRating, '真实保存入口读取当前分级');
        api.loadGarments();
        assert.equal(api.state().garments.get('blue').contentRating, contentRating, '重载保留分级');
    }
    writesFail = true;
    ratingControl.value = 'sfw';
    assert.equal(api.saveSelectedGarment(), undefined);
    assert.equal(api.state().garments.get('blue').contentRating, 'nsfw', '保存失败保留生效分级');
    assert.equal(scriptVariables.wardrobe_items[0].contentRating, 'nsfw', '保存失败保留存档分级');
    writesFail = false;
    ratingControl.value = 'nsfw';

    // 单件标签选择立即持久化，不能依赖额外保存，也不能顺带提交或重填其他编辑字段。
    const tagFieldset = control('[name="garment_group"]');
    control('[name="garment_name"]').value = '未保存的名称';
    control('[name="garment_description"]').value = '未保存的描述';
    const slimInput = { value: 'slim', checked: false };
    const emptyInput = { value: 'empty', checked: false };
    tagFieldset.querySelectorAll = () => [slimInput, emptyInput];
    const beforeTagRefresh = detailRefreshes;
    api.assignGarmentGroup({ target: slimInput });
    assert.equal(api.state().garments.get('blue').groupIds[0], undefined, '选择未分组后立即更新归属');
    api.loadGarments();
    assert.equal(api.state().garments.get('blue').groupIds[0], undefined, '重载仍保留已分配标签');
    assert.equal(api.state().garments.get('blue').name, blue.name, '标签分配不提交未保存的名称');
    assert.equal(api.state().garments.get('blue').description, blue.description, '标签分配不提交未保存的描述');
    assert.equal(control('[name="garment_description"]').value, '未保存的描述', '保留描述编辑框的草稿');
    assert.equal(detailRefreshes, beforeTagRefresh, '标签分配不重填详情表单');
    slimInput.checked = true;
    api.assignGarmentGroup({ target: slimInput });
    assert.equal(scriptVariables.wardrobe_items[0].groupIds[0], 'slim', '自定义标签立即保存到存档');
    writesFail = true;
    emptyInput.checked = true;
    api.assignGarmentGroup({ target: emptyInput });
    writesFail = false;
    assert.equal(slimInput.checked, true, '保存失败恢复原来的标签选择');
    assert.equal(emptyInput.checked, false, '保存失败撤销新增标签勾选');
    assert.equal(api.state().garments.get('blue').groupIds[0], 'slim', '保存失败保留原标签归属');
    assert.equal(scriptVariables.wardrobe_items[0].groupIds[0], 'slim');
    assert.match(control('.tw-garment-status').textContent, /存储失败/);

    chatId = '';
    control('[name="garment_name"]').value = blue.name;
    control('[name="garment_category"]').value = blue.category;
    control('[name="garment_description"]').value = blue.description;
    api.renderWearerState();
    assert.ok(wearerInputs.every(input => !input.checked), '未分配的服装不能默认允许任一角色穿');
    control('[name="garment_name"]').value = '未保存的新名称';
    control('[name="garment_description"]').value = '未保存的新描述';
    api.setDetailsDirty(true);
    const beforeWearer = detailRefreshes;
    // 通过真实的复选框处理函数验证：角色勾选与详情草稿独立保存。
    wearerInputs[1].checked = true;
    api.selectWearer({ target: { closest: () => wearerInputs[1] } });
    assert.equal(api.readWearerSelections().char.has('blue'), true, '只勾选 Char 时保存 Char 归属');
    assert.equal(api.readWearerSelections().user.has('blue'), false, 'Char 服装不得自动分配给 USER');
    assert.equal(api.state().garments.get('blue').name, blue.name, '勾选角色不提交名称草稿');
    assert.equal(api.state().garments.get('blue').description, blue.description, '勾选角色不提交描述草稿');
    assert.equal(control('[name="garment_description"]').value, '未保存的新描述');
    assert.equal(detailRefreshes, beforeWearer, '角色勾选不重填详情');
    confirmation = false;
    await api.selectGarment({ target: { closest: selector => selector === '[data-garment]' ? { dataset: { garment: 'red' } } : null } });
    confirmation = true;
    assert.equal(api.state().selectedGarmentId, 'blue', '取消切换留在当前服装');
    assert.equal(control('[name="garment_name"]').value, '未保存的新名称');
    assert.equal(control('[data-action="save-garment"]').dataset.dirty, 'true');
    wearerInputs[0].checked = true;
    api.selectWearer({ target: { closest: () => wearerInputs[0] } });
    assert.ok(wearerInputs.every(input => input.checked), '手动分别勾选两边才允许共享');
    wearerInputs[1].checked = false;
    api.selectWearer({ target: { closest: () => wearerInputs[1] } });
    assert.equal(api.readWearerSelections().user.has('blue'), true, '取消 Char 归属不影响 USER');
    writesFail = true;
    wearerInputs[0].checked = false;
    api.selectWearer({ target: { closest: () => wearerInputs[0] } });
    assert.equal(wearerInputs[0].checked, true, '存储失败时恢复已保存的归属勾选');
    writesFail = false;
    wearerInputs[0].checked = false;
    api.selectWearer({ target: { closest: () => wearerInputs[0] } });
    assert.ok(wearerInputs.every(input => !input.checked), '全部取消后不向任一角色分配');
    assert.equal(control('[name="garment_description"]').value, '未保存的新描述', '取消归属也保留草稿');
    control('[name="garment_name"]').value = blue.name;
    control('[name="garment_description"]').value = blue.description;
    api.setDetailsDirty(false);
    api.applyGarments(['blue', 'red'], 'user');
    api.applyGarments(['blue'], 'char');
    assert.equal(scriptVariables.wardrobe_selections.user.length, 2, '首页应用保存到共用脚本变量');
    assert.deepEqual(chatVariables, {}, '共用衣柜不写入聊天变量');
    assert.equal(api.readWearerSelections().user.size, 2, 'USER 一次应用多件');
    assert.equal(api.readWearerSelections().char.size, 1, '两个角色选择相互独立');
    api.renderBulkState();
    assert.equal(control('.tw-bulk-actions').hidden, true, '默认没有勾选时不显示操作栏');
    api.toggleMultiSelect();
    api.renderBulkState();
    assert.equal(api.state().multiSelectMode, true);
    assert.equal(control('.tw-bulk-actions').hidden, false, '开启多选立即显示操作栏，无需先勾选图片');
    const detailsButton = control('[data-action="toggle-details"]');
    mobileViewport.matches = true;
    assert.equal(detailsButton.disabled, true, '移动端多选时禁用详情入口');
    api.toggleMobileDetails();
    assert.equal(sandbox.testPanel.dataset.mobileScreen, 'library', '多选期间即使直接调用也不能打开详情');
    api.checkGarment({ target: { closest: () => ({ checked: true, dataset: { checkGarment: 'blue' } }) } });
    api.renderBulkState();
    assert.equal(control('.tw-bulk-actions').hidden, false, '勾选后继续显示操作栏');
    api.checkGarment({ target: { closest: () => ({ checked: false, dataset: { checkGarment: 'blue' } }) } });
    api.renderBulkState();
    assert.equal(control('.tw-bulk-actions').hidden, false, '取消最后一项仍保留操作栏，退出多选才收起');
    api.checkGarment({ target: { closest: () => ({ checked: true, dataset: { checkGarment: 'blue' } }) } });
    api.toggleMultiSelect();
    api.renderBulkState();
    assert.equal(api.state().checkedGarmentIds.size, 0, '关闭多选清空勾选');
    assert.equal(api.state().multiSelectMode, false);
    assert.equal(control('.tw-bulk-actions').hidden, true);
    const detailsLabel = {};
    detailsButton.querySelector = () => detailsLabel;
    detailsButton.focus = () => { detailsButton.focused = true; };
    assert.equal(detailsButton.disabled, false, '退出多选恢复详情入口');
    api.toggleMobileDetails();
    assert.equal(sandbox.testPanel.dataset.mobileScreen, 'details');
    assert.equal(detailsLabel.textContent, '返回列表');
    assert.equal(detailsButton.focused, true, '进入详情后焦点移到返回入口');
    api.toggleMobileDetails();
    assert.equal(sandbox.testPanel.dataset.mobileScreen, 'library');
    mobileViewport.matches = false;
    assert.equal(api.readWearerSelections().char.size, 1, '退出多选保留角色已应用的服装');
    api.applyGarments(['blue'], 'user', true);
    assert.equal(api.readWearerSelections().user.has('red'), true, '取消所选保留其他应用');
    api.applyGarments(['blue'], 'char', true);
    assert.equal(api.readWearerSelections().char.size, 0, '首页可以取消应用');
    api.applyGarments(['blue'], 'char');
    chatId = 'chat';
    assert.equal(api.readWearerSelections().char.has('blue'), true, '进入聊天沿用首页选择');
    chatVariables.wardrobe_selections = { user: [], char: ['red'] };
    chatId = 'other-chat';
    assert.equal(api.readWearerSelections().char.has('blue'), true, '切换聊天不覆盖共用选择');
    chatId = 'chat';

    await api.exportGarments(api.state().garments.keys(), true);
    const exported = JSON.parse(await blobs.get(downloads[0].href).text());
    assert.equal(api.parseWardrobeData(exported).items.get('blue').contentRating, 'nsfw', '备份导出回读保留分级');
    assert.equal(downloads[0].name, '衣柜-2件.json');
    assert.equal(exported.groups.length, 2, '整库备份保留空标签');
    assert.equal(api.parseWardrobeData(exported).items.get('blue').image, blue.image, '导出包含原始图片');
    await api.exportGarments(['blue']);
    assert.equal(blobs.size, 1, '下次下载释放旧地址');
    assert.equal(JSON.parse(await blobs.get(downloads[1].href).text()).items.length, 1, '单件导出只包含当前服装');

    const input = { files: [{ name: '衣柜.json', type: 'application/json', text: async () => JSON.stringify(exported) }], value: 'selected' };
    await api.importGarmentFiles(Array.from(input.files));
    assert.equal(api.state().garments.size, 4, '重新导入新增服装而非覆盖原件');
    assert.equal(api.state().garmentGroups.size, 2, '已有同名标签复用');
    const imported = Array.from(api.state().garments.values()).filter(item => item.id.startsWith('new-'));
    assert.equal(imported[0].groupIds[0], 'slim');
    assert.equal(imported[0].description, blue.description);
    assert.equal(imported[0].contentRating, 'nsfw', '实际重新导入恢复分级');

    const beforeInvalid = JSON.stringify(scriptVariables);
    input.files.push({ name: 'bad.json', type: 'application/json', text: async () => '{bad' });
    await api.importGarmentFiles(Array.from(input.files));
    assert.equal(JSON.stringify(scriptVariables), beforeInvalid, '混合文件部分失败时不保存任何新增服装');

    api.showIds(['blue', 'red']);
    api.selectAllGarments({ currentTarget: { checked: true } });
    assert.equal(api.state().checkedGarmentIds.size, 2, '全选只包含当前可见服装');
    assert.equal(api.state().checkedGarmentIds.has(imported[0].id), false);
    // 下拉菜单明确指定目标角色，取消操作不依赖详情页当前停留在哪个角色。
    for (const action of ['apply-user', 'apply-char', 'unapply-user', 'unapply-char']) {
        const select = { value: action };
        await api.handleBulkAction({ type: 'change', currentTarget: select });
        const wearer = action.endsWith('-user') ? 'user' : 'char';
        assert.equal(api.readWearerSelections()[wearer].size, action.startsWith('unapply-') ? 0 : 2, '下拉选项应应用或取消对应角色的全部所选服装');
        assert.equal(select.value, '', '操作完成复位菜单，允许再次选择同一动作');
        if (action === 'unapply-user') assert.equal(api.readWearerSelections().char.size, 2, '取消 USER 不影响 Char');
    }
    api.applyGarments(['blue', 'red'], 'user');
    api.applyGarments(['blue'], 'char');
    api.moveCheckedGarments('add:empty');
    assert.equal(api.state().garments.get('red').groupIds[0], 'empty');
    assert.deepEqual(scriptVariables.wardrobe_items.find(item => item.id === 'blue').groupIds, ['slim', 'empty'], '批量添加保留原标签并写入存档');

    promptValue = '新款';
    await api.addGarmentGroup();
    const newGroup = api.state().currentGroup;
    assert.equal(api.state().garmentGroups.get(newGroup), '新款');
    await api.addGarmentGroup();
    assert.equal(api.state().garmentGroups.size, 3, '相同名称不重复创建');
    api.selectGroup('empty');
    await api.deleteGarmentGroup();
    assert.equal(api.state().garments.size, 4, '删标签不删服装');
    assert.deepEqual(Array.from(api.state().garments.get('blue').groupIds), ['slim'], '删除标签保留其他归属');
    assert.equal(api.state().garmentGroups.has('empty'), false);

    scriptVariables.wardrobe_items = [...scriptVariables.wardrobe_items, { ...red, id: 'missing-description', description: '' }];
    api.loadGarments();
    const beforeApply = JSON.stringify(scriptVariables);
    assert.throws(() => api.applyGarments(['blue', 'missing-description'], 'char'), /红色外套.*描述/);
    assert.equal(JSON.stringify(scriptVariables), beforeApply, '一件无效时整批不写入');
    writesFail = true;
    assert.throws(() => api.applyGarments(['red'], 'char'), /存储失败/);
    assert.equal(JSON.stringify(scriptVariables), beforeApply, '应用保存失败保留共用选择');
    writesFail = false;
    confirmation = false;
    await api.deleteGarments(new Set(['blue', 'red']));
    assert.equal(api.state().garments.has('blue'), true, '取消删除保留原数据');
    confirmation = true;
    writesFail = true;
    await assert.rejects(() => api.deleteGarments(new Set(['blue'])), /存储失败/);
    assert.equal(api.state().garments.has('blue'), true, '存储失败不能删除内存数据');
    writesFail = false;
    chatId = '';
    await api.deleteGarments(new Set(['blue', 'red']));
    assert.equal(api.state().garments.has('blue'), false);
    assert.equal(api.readWearerSelections().user.size, 0, '删除同步清理 USER 应用');
    assert.equal(api.readWearerSelections().char.size, 0, '删除同步清理 Char 应用');
    assert.equal(scriptVariables.wardrobe_selections.char.length, 0, '首页删除也清理已保存的共用选择');
    assert.equal(scriptVariables.wardrobe_items.some(item => item.id === 'blue'), false);
    api.loadGarments();
    assert.equal(api.state().garmentGroups.get(newGroup), '新款', '重载保留标签');
    assert.equal(api.state().garments.has('blue'), false, '重载后删除仍然有效');

    // 迁移逐张提交：第一张成功、第二张失败时，已提交路径和剩余原图都能重新载入。
    scriptVariables.wardrobe_items = [blue, red];
    scriptVariables.wardrobe_groups = [];
    scriptVariables.wardrobe_selections = { user: ['blue'], char: ['red'] };
    api.loadGarments();
    uploadFailureAt = uploads + 2;
    const beforeMigrationRefresh = detailRefreshes;
    await api.migrateLegacyImages();
    assert.equal(detailRefreshes, beforeMigrationRefresh, '后台迁移不重填正在编辑的详情');
    const storedBlue = api.state().garments.get('blue').image;
    assert.equal(storedBlue, 'user/images/tavern_wardrobe/2cf24dba-5fb0-830e-a6e8-3b2ac5b9e29e.png', '原图 hello 的 SHA-256 固定派生 UUID v8');
    assert.equal(scriptVariables.wardrobe_items[0].image, storedBlue, '成功上传后路径持久保存');
    assert.equal(scriptVariables.wardrobe_items[1].image, red.image, '失败的原图保留');
    assert.equal(imageFiles.get(storedBlue).toString(), 'hello', '服务端收到原图字节');
    api.loadGarments();
    uploadFailureAt = Infinity;
    const beforeRetry = uploads;
    await api.migrateLegacyImages();
    assert.equal(uploads, beforeRetry + 1, '重试只迁移剩余图片');
    assert.equal(api.readWearerSelections().user.has('blue'), true, '迁移保留穿着归属');
    assert.equal(api.readWearerSelections().char.has('red'), true);

    const readsBefore = imageRequests.filter(request => request.url === storedBlue).length;
    const loaded = await Promise.all([api.loadImageDataUrl(storedBlue), api.loadImageDataUrl(storedBlue)]);
    assert.deepEqual(loaded, [blue.image, blue.image], '重复读取恢复相同原图');
    assert.equal(imageRequests.filter(request => request.url === storedBlue).length, readsBefore + 1, '并发及后续使用复用一次读取');
    api.sendType('image');
    const request = { chat: [{ role: 'user', content: '继续' }] };
    await api.injectWardrobeContent(request);
    const sentImages = request.chat[0].content.filter(part => part.type === 'image_url');
    assert.equal(sentImages.length, 2);
    assert.ok(sentImages.every(part => part.image_url.url === blue.image), '发送给 AI 的是图片内容');
    await api.exportGarments(api.state().garments.keys(), true);
    const portable = JSON.parse(await blobs.get(downloads.at(-1).href).text());
    assert.ok(portable.items.every(item => item.image === blue.image), '文件存储仍导出自包含备份');
    assert.equal(api.state().garments.get('blue').image, storedBlue, '发图和导出不把 Base64 写回存档');
    assert.equal(imageRequests.filter(request => request.url === storedBlue).length, readsBefore + 1, '导出和发图共用缓存');
    assert.throws(() => api.parseWardrobeData({ groups: [], items: [{ ...blue, image: storedBlue }] }, false), /本机路径.*跨设备/);

    // 删除共享路径时只释放最后一个引用，存档失败时不发送删除请求。
    api.sendType('text');
    const storedRed = api.state().garments.get('red').image;
    assert.equal(storedRed, storedBlue, '同图的不同服装迁移到同一路径');
    const shared = { ...blue, id: 'shared', image: storedBlue };
    scriptVariables.wardrobe_items.push(shared);
    api.loadGarments();
    await api.deleteGarments(new Set(['blue']));
    assert.equal(imageFiles.has(storedBlue), true, '仍有服装引用时保留原图');
    writesFail = true;
    await assert.rejects(() => api.deleteGarments(new Set(['shared'])), /存储失败/);
    assert.equal(imageFiles.has(storedBlue), true, '保存失败不删文件');
    writesFail = false;
    await api.deleteGarments(new Set(['shared']));
    assert.equal(imageFiles.has(storedBlue), true, '红色外套仍引用同图，不能提前清理文件');
    api.selectItem('red');
    control('[name="garment_name"]').value = red.name;
    control('[name="garment_description"]').value = red.description;
    control('[name="garment_category"]').value = red.category;
    await api.handleGarmentAction({ currentTarget: { dataset: { action: 'remove-image' } } });
    assert.equal(api.state().garments.get('red').image, '', '删除图片保留服装');
    assert.equal(imageFiles.has(storedRed), false);

    // 旧版备份兼容、图片格式及导入中途失败均通过真正的上传与清理函数验证。
    const originalCount = api.state().garments.size;
    const originalFiles = imageFiles.size;
    const imageInput = { files: [new File(['jpeg-bytes'], '上衣.jpg', { type: 'image/jpeg' }), new File(['webp-bytes'], '裙子.webp', { type: 'image/webp' })], value: 'selected' };
    uploadEffect = () => {
        // 第一张开始上传时，第二张仍只持有 File；整批完成后两张都已经编码上传。
        assert.ok(encodedLocalImages.has(imageInput.files[0]));
        assert.ok(!encodedLocalImages.has(imageInput.files[1]));
        uploadEffect = undefined;
    };
    try {
        assert.equal(await api.importGarmentFiles(Array.from(imageInput.files)), true);
    } finally {
        uploadEffect = undefined;
    }
    assert.ok(encodedLocalImages.has(imageInput.files[1]));
    assert.equal(api.state().garments.size, originalCount + 2);
    const jpgItem = Array.from(api.state().garments.values()).find(item => item.name === '上衣');
    assert.match(jpgItem.image, /\.jpg$/);
    assert.equal(await api.loadImageDataUrl(jpgItem.image), 'data:image/jpeg;base64,anBlZy1ieXRlcw==');
    const jpegPath = jpgItem.image.replace(/\.jpg$/, '.jpeg');
    imageFiles.set(jpegPath, imageFiles.get(jpgItem.image));
    const jpegItem = api.parseWardrobeData({ groups: [], items: [{ ...jpgItem, image: jpegPath }] }).items.get(jpgItem.id);
    assert.equal(await api.loadImageDataUrl(jpegItem.image), 'data:image/jpeg;base64,anBlZy1ieXRlcw==', '已有 .jpeg 路径按 JPEG 读取');
    await api.deleteGarmentImages([jpegPath]);
    const webpItem = Array.from(api.state().garments.values()).find(item => item.name === '裙子');
    assert.match(webpItem.image, /\.webp$/);
    assert.equal(await api.loadImageDataUrl(webpItem.image), 'data:image/webp;base64,d2VicC1ieXRlcw==');
    const filesAfterImport = imageFiles.size;
    const stateAfterImport = JSON.stringify(scriptVariables);
    imageInput.files.push({ name: '坏文件.json', type: 'application/json', text: async () => '{bad' });
    await api.importGarmentFiles(Array.from(imageInput.files));
    assert.equal(imageFiles.size, filesAfterImport, '读取中途失败清理整批上传');
    assert.equal(JSON.stringify(scriptVariables), stateAfterImport);
    imageInput.files.pop();
    writesFail = true;
    await api.importGarmentFiles(Array.from(imageInput.files));
    writesFail = false;
    assert.equal(imageFiles.size, filesAfterImport, '保存失败也清理整批上传');
    assert.equal(JSON.stringify(scriptVariables), stateAfterImport);
    assert.equal(filesAfterImport, originalFiles + 2);

    // 迁移保存失败不替换原图，也不遗留文件；网络恢复后能再次迁移。
    scriptVariables.wardrobe_items = [blue];
    api.loadGarments();
    writesFail = true;
    await api.migrateLegacyImages();
    writesFail = false;
    assert.equal(api.state().garments.get('blue').image, blue.image);
    assert.equal(imageFiles.size, filesAfterImport, '迁移存档失败清理新文件');
    uploadEffect = () => {
        scriptVariables.wardrobe_items = [{ ...blue, name: '上传期间修改的名字' }];
        api.loadGarments();
    };
    await api.migrateLegacyImages();
    uploadEffect = undefined;
    assert.equal(api.state().garments.get('blue').name, '上传期间修改的名字', '迁移合并最新服装数据');
    const finalImage = api.state().garments.get('blue').image;
    failImageReads = true;
    await assert.rejects(api.loadImageDataUrl(finalImage), /HTTP 404/);
    const unchanged = { chat: [{ role: 'user', content: '继续' }] };
    scriptVariables.wardrobe_selections = { user: ['blue'], char: [] };
    api.sendType('image');
    await api.injectWardrobeContent(unchanged);
    assert.equal(unchanged.chat[0].content, '继续', '读图失败时不注入部分清单');
    failImageReads = false;
    assert.equal(await api.loadImageDataUrl(finalImage), blue.image, '失败读取不会污染缓存，恢复后可重试');
    await checkOutfitManager();
    await checkFavorites();
    await checkLibraryBrowsing();
    await checkImportDuplicatesAndTransfers();
    await checkSelectionScopes();
    await checkNamedWearer();
    await checkLibraryImprovements();
    await checkImportPicker();
    await checkStableImageFilenames();
    await checkCombinations();
    await checkMultipleTags();
    await checkFilterGroups();
    checkOriginalImage();
    await checkImageSides();
    await checkImageCacheLimit();
    console.log('通过多选与操作栏显隐、衣柜导出回读、标签存储、可见范围全选、批量归类与角色应用、删除及失败回滚检查。');
    console.log('通过图片落盘、逐张迁移及重试、读取缓存、多模态注入、自包含备份、原图格式及删除和导入回滚检查。');
}

/**
 * 验证外部备份的字段转换、图片资源、分区合并及真正导入的失败回滚，防止兼容逻辑影响原衣柜。
 * @returns {Promise<void>} 外部备份解析、上传、保存与导出回读断言完成后结束。
 */
async function checkOutfitManager() {
    const outfit = { id: 'same', name: '汉服', description: '原始描述', category: '古风', subCategory: '冬装', sceneTag: '外出', imageData: blue.image, favorite: true, kits: [], activeKitId: null };
    const accessory = { id: 'same', name: '绣鞋', description: '', category: '鞋子', imageData: null };
    const backup = { type: 'user', outfits: [outfit, { ...outfit, id: 'text', name: '纯文字', imageData: null, sceneTag: '' }], accessories: [accessory], activeIds: ['same'], api: { key: '不得导入' } };
    const parsed = api.parseWardrobeFile(backup);
    const records = Array.from(parsed.items.values());
    assert.equal(records.length, 3);
    assert.equal(records[0].image, blue.image);
    assert.equal(records[0].description, outfit.description, '描述保持原文，不把对方配置或套装关系混入正文');
    assert.equal(records[0].category, 'outfits', '风格分类不误当作衣物类型');
    assert.equal(records[0].favorite, true);
    assert.equal(records[0].lastUsedAt, 0, '不把创建时间或对方应用状态当作最近使用');
    assert.equal(parsed.groups.get(records[0].groupIds[0]), '外出');
    assert.equal(parsed.groups.get(records[1].groupIds[0]), '古风 / 冬装', '无场景时保留原分类和子分类为标签');
    assert.equal(records[1].image, '', '纯文字记录不丢失');
    assert.equal(records[2].category, 'shoes', '单品匹配本衣柜分类');
    assert.equal(api.parseWardrobeFile({ ...backup, type: 'char', charName: '角色' }).items.size, 3);
    const chars = { A: { outfits: [outfit] }, B: { outfits: [outfit] }, __shared__: { outfits: [outfit] } };
    assert.equal(api.parseWardrobeFile({ type: 'chars_all', chars }).items.size, 3, '不同角色及通用衣柜的相同 ID 均保留');
    assert.equal(api.parseWardrobeFile({ ...backup, type: undefined, chars, presets: [{ outfits: [outfit] }] }).items.size, 6, '完整备份合并 User 和角色，不重复导入预设副本');
    const imagePath = '/api/plugins/outfit-manager/images/example.jpg';
    const packaged = { type: 'user', outfits: [{ ...outfit, imageData: imagePath }], _assets: { 'example.jpg': blue.image } };
    assert.equal(api.parseWardrobeFile(packaged).items.values().next().value.image, blue.image, '服务端图片从导出资源恢复');
    assert.throws(() => api.parseWardrobeFile({ ...packaged, _assets: {} }), /缺少原图/);
    assert.throws(() => api.parseWardrobeFile({ ...packaged, _assets: { 'example.jpg': null } }), /图片资源无效/);
    for (const changes of [{ imageData: 3 }, { imageData: 'https://example.com/a.jpg' }, { imageData: 'data:image/png;base64,??' }, { favorite: 'true' }, { sceneTag: [] }, { id: '' }, { description: 3 }]) {
        assert.throws(() => api.parseWardrobeFile({ type: 'user', outfits: [{ ...outfit, ...changes }] }), /格式错误|原图|有效图片/);
    }
    assert.throws(() => api.parseWardrobeFile({ type: 'user', outfits: [outfit, outfit] }), /标识重复/);
    for (const invalid of [{}, { format: 'tw-wardrobe', version: 2, outfits: [] }, { type: 'chars_all' }, { type: 'chars_all', chars: { broken: null } }, { type: 'user', outfits: [], accessories: {} }]) {
        assert.throws(() => api.parseWardrobeFile(invalid), /JSON|角色数据|列表格式/);
    }

    scriptVariables.wardrobe_items = [blue];
    scriptVariables.wardrobe_groups = [{ id: 'outside', name: '外出' }];
    scriptVariables.wardrobe_selections = { user: ['blue'], char: [] };
    scriptVariables.api = { key: '原有配置' };
    api.loadGarments();
    const oldSelections = JSON.stringify(scriptVariables.wardrobe_selections);
    const input = { files: [{ name: 'Outfit Manager.json', type: 'application/json', text: async () => JSON.stringify(backup) }], value: 'selected' };
    await api.importGarmentFiles(Array.from(input.files));
    assert.equal(api.state().garments.size, 4);
    const imported = Array.from(api.state().garments.values()).filter(item => item.id !== 'blue');
    assert.equal(imported[0].groupIds[0], 'outside', '场景标签复用已有同名标签');
    assert.equal(imageFiles.get(imported[0].image).toString(), 'hello', '复用原图上传流程');
    assert.equal(scriptVariables.api.key, '原有配置');
    assert.equal(JSON.stringify(scriptVariables.wardrobe_selections), oldSelections, '导入不改变 USER／Char 选择');
    await api.importGarmentFiles(Array.from(input.files));
    assert.equal(api.state().garments.size, 7, '重复导入新增副本');
    await api.exportGarments(imported.map(item => item.id));
    const exported = api.parseWardrobeFile(JSON.parse(await blobs.get(downloads.at(-1).href).text()));
    assert.equal(exported.items.size, 3, '转换后仍可用本衣柜格式导出和恢复');
    assert.equal(exported.items.get(imported[0].id).favorite, true);

    const beforeFailure = JSON.stringify(scriptVariables);
    const beforeFiles = imageFiles.size;
    writesFail = true;
    await api.importGarmentFiles(Array.from(input.files));
    writesFail = false;
    assert.equal(JSON.stringify(scriptVariables), beforeFailure, '保存失败不覆盖服装、设置或应用选择');
    assert.equal(imageFiles.size, beforeFiles, '保存失败清理本批原图');
    input.files.push({ name: '缺图.json', type: 'application/json', text: async () => JSON.stringify({ ...packaged, _assets: {} }) });
    await api.importGarmentFiles(Array.from(input.files));
    assert.equal(JSON.stringify(scriptVariables), beforeFailure, '混选文件中有缺图数据时整批不提交');
    assert.equal(imageFiles.size, beforeFiles);
    input.files.pop();
    input.files.push(input.files[0]);
    uploadFailureAt = uploads + 2;
    await api.importGarmentFiles(Array.from(input.files));
    uploadFailureAt = Infinity;
    assert.equal(JSON.stringify(scriptVariables), beforeFailure, '中途上传失败不提交新增记录');
    assert.equal(imageFiles.size, beforeFiles, '中途上传失败回收已上传的原图');
    console.log('通过 Outfit Manager 字段映射、User／角色／完整备份、资源原图、纯文字、收藏、合并导出及失败回滚检查。');
}

/**
 * 为真实卡片渲染及备份下载提供最小节点，保存子节点和属性以验证筛选结果和分类计数。
 * @returns {Object} 支持追加子节点、设置属性和替换内容的节点替身。
 */
function createLibraryNode() {
    return {
        dataset: {}, attributes: {}, children: [],
        append(...children) { this.children.push(...children); },
        replaceChildren(...children) { this.children = children; },
        setAttribute(name, value) { this.attributes[name] = value; },
        /** 读取节点属性以验证复选框复用；参数为属性名，返回属性值。 */
        getAttribute(name) { return this.attributes[name]; },
        /** 记录模拟下载链接的地址和文件名；无参数，无返回值。 */
        click() { downloads.push({ href: this.href, name: this.download }); },
        /** 模拟下载链接移除；节点替身不持有父节点，无参数，无返回值。 */
        remove() {},
    };
}

/**
 * 模拟标签管理器的名称和勾选控件，删除行后同步列表，供排序和批量删除共用。
 * @returns {Object} 保留标签行子控件的节点替身。
 */
function createGroupManagerNode() {
    const node = createLibraryNode();
    /** 按控件类型读取行内输入框；参数为选择器，返回对应控件。 */
    node.querySelector = selector => selector === 'input[type="text"]' ? node.children[1] : node.children[0].children[0];
    /** 模拟行从管理器中移除；无参数，无返回值。 */
    node.remove = () => {
        const rows = control('.tw-group-rows');
        rows.children = rows.children.filter(row => row !== node);
    };
    return node;
}

/**
 * 验证收藏保存、旧数据兼容、失败保留、导入导出，以及真实列表渲染的爱心、数量和标签筛选。
 * @returns {Promise<void>} 收藏交互和数据断言全部通过后结束。
 */
async function checkFavorites() {
    scriptVariables.wardrobe_items = [blue, red];
    scriptVariables.wardrobe_groups = [{ id: 'slim', name: '修身' }];
    scriptVariables.wardrobe_selections = { user: [], char: [] };
    api.selectGroup('*');
    api.loadGarments();
    assert.equal(api.state().garments.get('blue').favorite, false, '旧存档默认未收藏');
    assert.throws(() => api.parseWardrobeData({ groups: [], items: [{ ...blue, favorite: 'false' }] }), /收藏状态无效/);
    control('[name="garment_description"]').value = '未保存的描述草稿';
    const beforeRefresh = detailRefreshes;
    api.selectGarment({ target: { closest: selector => selector === '[data-favorite]' ? { dataset: { favorite: 'blue' } } : null } });
    assert.equal(scriptVariables.wardrobe_items[0].favorite, true, '点击爱心立即保存收藏');
    assert.equal(api.state().selectedGarmentId, 'blue', '收藏不会切换详情');
    assert.equal(api.state().multiSelectMode, false, '收藏不会开启多选');
    assert.equal(detailRefreshes, beforeRefresh, '收藏不重填详情');
    assert.equal(control('[name="garment_description"]').value, '未保存的描述草稿');
    api.loadGarments();
    assert.equal(api.state().garments.get('blue').favorite, true, '重新加载后仍保持收藏');
    writesFail = true;
    api.toggleGarmentFavorite('blue');
    writesFail = false;
    assert.equal(api.state().garments.get('blue').favorite, true, '保存失败不改变内存收藏');
    assert.equal(scriptVariables.wardrobe_items[0].favorite, true, '保存失败保留存档');
    await api.exportGarments(['blue']);
    const backup = JSON.parse(await blobs.get(downloads.at(-1).href).text());
    assert.equal(api.parseWardrobeData(backup).items.get('blue').favorite, true, '导出回读保留收藏状态');

    // 使用真实渲染函数检查列表和计数，避免只测存档却漏掉左侧收藏仍为空的问题。
    document.createElement = tag => createImageTestNode(tag) ?? (tag === 'dialog' ? createImportDialog() : createLibraryNode());
    document.createDocumentFragment = createLibraryNode;
    const categories = ['all', 'coats', 'favorites', 'recent', 'assigned-user', 'assigned-char', 'unassigned', 'missing-description', 'missing-image'].map(category => ({
        dataset: { category }, querySelector: () => control(`count-${category}`), setAttribute() {},
    }));
    const previousQueryAll = sandbox.testPanel.querySelectorAll;
    sandbox.testPanel.querySelectorAll = selector => selector === '[data-category]' ? categories : previousQueryAll(selector);
    const list = control('.tw-items');
    list.replaceChildren = fragment => { list.cards = fragment.children; };
    api.selectCategory('all');
    api.renderLibrary();
    assert.equal(list.cards.length, 2);
    assert.equal(control('count-all').textContent, '2', '总数不会重复累计收藏数');
    assert.equal(control('count-favorites').textContent, '1', '左侧显示收藏数量');
    const heart = list.cards[0].children[1];
    assert.equal(heart.className, 'tw-favorite');
    assert.equal(heart.attributes['aria-pressed'], 'true');
    assert.match(heart.innerHTML, /<svg/);
    assert.match(heart.attributes['aria-label'], /取消收藏/);
    api.selectCategory('favorites');
    api.renderLibrary();
    assert.equal(list.cards.length, 1, '收藏筛选只显示已收藏服装');
    assert.equal(list.cards[0].children[1].dataset.favorite, 'blue');
    api.selectGroup('');
    api.renderLibrary();
    assert.equal(list.cards.length, 0, '收藏筛选同时遵循当前标签');
    assert.equal(control('count-favorites').textContent, '0');
    api.selectGroup('*');
    api.toggleGarmentFavorite('blue');
    api.renderLibrary();
    assert.equal(list.cards.length, 0, '取消收藏后从收藏列表移除');
    assert.equal(control('.tw-empty').hidden, false);
    console.log('通过收藏切换、存档兼容、失败保留、导出回读、爱心渲染、收藏筛选与数量检查。');
}

/**
 * 验证搜索组合筛选、原生排序、可见范围全选与最近使用持久化，覆盖失败时不产生虚假记录。
 * @returns {Promise<void>} 列表交互、存档回读及备份断言全部通过后结束。
 */
async function checkLibraryBrowsing() {
    scriptVariables.wardrobe_items = [
        { ...blue, name: '外套10', description: 'Blue 丝绸', favorite: true, lastUsedAt: 100 },
        { ...red, name: '外套2', description: '棉质', lastUsedAt: 200 },
        { ...red, id: 'unused', name: '长裙', category: 'dresses', description: '丝绸' },
    ];
    scriptVariables.wardrobe_groups = [{ id: 'slim', name: '修身' }];
    scriptVariables.wardrobe_selections = { user: [], char: [] };
    api.sendType('text');
    api.selectGroup('*');
    api.selectCategory('all');
    api.loadGarments();
    const list = control('.tw-items');
    control('[name="garment_description"]').value = '不能被搜索和排序覆盖的草稿';
    const beforeRefresh = detailRefreshes;
    api.renderLibrary();
    assert.equal(api.state().garments.get('unused').lastUsedAt, 0, '旧服装默认没有使用记录');
    assert.throws(() => api.parseWardrobeData({ groups: [], items: [{ ...blue, lastUsedAt: -1 }] }), /使用时间无效/);
    assert.equal(control('count-recent').textContent, '2', '最近使用数量来自历史记录');

    api.sortGarments({ currentTarget: { value: 'name-asc' } });
    api.renderLibrary();
    assert.deepEqual(list.cards.map(entry => entry.children[2].dataset.garment), ['red', 'blue', 'unused'], '名称按中文和自然数字升序');
    api.sortGarments({ currentTarget: { value: 'name-desc' } });
    api.renderLibrary();
    assert.deepEqual(list.cards.map(entry => entry.children[2].dataset.garment), ['unused', 'blue', 'red']);
    api.sortGarments({ currentTarget: { value: 'recent' } });
    api.renderLibrary();
    assert.deepEqual(list.cards.map(entry => entry.children[2].dataset.garment), ['red', 'blue', 'unused'], '无使用记录的服装排在最后');
    api.sortGarments({ currentTarget: { value: 'default' } });
    api.renderLibrary();
    assert.deepEqual(list.cards.map(entry => entry.children[2].dataset.garment), ['blue', 'red', 'unused'], '切回默认排序恢复导入顺序');

    api.selectAllGarments({ currentTarget: { checked: true } });
    api.searchGarments({ currentTarget: { value: '不存在' } });
    const pending = Array.from(statusTimers).find(([, timer]) => timer.delay === 150);
    assert.ok(pending, '连续输入使用 150 毫秒防抖');
    api.searchGarments({ currentTarget: { value: '  BLUE  ' } });
    assert.equal(statusTimers.has(pending[0]), false, '新输入取消旧搜索任务');
    api.renderLibrary();
    assert.equal(api.state().checkedGarmentIds.size, 0, '修改搜索清除旧勾选');
    assert.deepEqual(list.cards.map(entry => entry.children[2].dataset.garment), ['blue'], '描述搜索忽略大小写与首尾空格');
    assert.equal(control('count-all').textContent, '1', '分类数量跟随搜索结果');
    api.searchGarments({ currentTarget: { value: '  UNUSED  ' } });
    api.renderLibrary();
    assert.deepEqual(list.cards.map(entry => entry.children[2].dataset.garment), ['unused'], '可按 ID 搜索');
    api.searchGarments({ currentTarget: { value: 'BLUE' } });
    api.renderLibrary();
    api.selectAllGarments({ currentTarget: { checked: true } });
    assert.deepEqual(Array.from(api.state().checkedGarmentIds), ['blue'], '搜索后全选只包含可见结果');
    api.searchGarments({ currentTarget: { value: '修身' } });
    api.renderLibrary();
    assert.equal(list.cards.length, 1, '可以搜索标签名称');
    api.selectGroup('');
    api.renderLibrary();
    assert.equal(list.cards.length, 0, '搜索与标签筛选同时生效');
    assert.equal(control('#tw-empty-title').textContent, '没有匹配的服装');
    api.selectGroup('*');
    api.searchGarments({ currentTarget: { value: '外套' } });
    api.renderLibrary();
    assert.equal(list.cards.length, 2, '可以搜索服装名称和分类');
    api.selectCategory('favorites');
    api.renderLibrary();
    assert.equal(list.cards.length, 1, '搜索与收藏筛选同时生效');
    api.selectCategory('dresses');
    api.renderLibrary();
    assert.equal(list.cards.length, 0, '搜索与服装分类同时生效');
    api.searchGarments({ currentTarget: { value: '' } });
    api.renderLibrary();
    assert.equal(list.cards.length, 1, '清空搜索恢复当前分类结果');
    assert.ok(!Array.from(statusTimers.values()).some(timer => timer.delay === 150), '清空搜索取消待执行任务');

    api.selectCategory('recent');
    api.renderLibrary();
    assert.deepEqual(list.cards.map(entry => entry.children[2].dataset.garment), ['red', 'blue'], '最近使用过滤未使用服装并默认按时间倒序');
    api.selectGroup('slim');
    api.renderLibrary();
    assert.equal(list.cards.length, 1, '最近使用遵循当前标签');
    assert.equal(control('count-recent').textContent, '1');
    api.selectGroup('*');
    const appliedAt = Date.now();
    api.applyGarments(['unused'], 'user');
    assert.ok(api.state().garments.get('unused').lastUsedAt >= appliedAt, '成功应用记录时间');
    api.loadGarments();
    const usedAt = api.state().garments.get('unused').lastUsedAt;
    assert.ok(usedAt >= appliedAt, '重载后保留最近使用');
    api.renderLibrary();
    assert.equal(list.cards[0].children[2].dataset.garment, 'unused', '新应用的服装排在最前');
    api.applyGarments(['unused'], 'user', true);
    assert.equal(api.state().garments.get('unused').lastUsedAt, usedAt, '取消应用保留使用历史');
    writesFail = true;
    assert.throws(() => api.applyGarments(['blue'], 'char'), /存储失败/);
    writesFail = false;
    assert.equal(api.state().garments.get('blue').lastUsedAt, 100, '保存失败不更新内存使用记录');
    api.loadGarments();
    assert.equal(api.state().garments.get('blue').lastUsedAt, 100, '保存失败不更新存档使用记录');
    assert.equal(api.readWearerSelections().char.has('blue'), false, '保存失败不写入穿着归属');
    await api.exportGarments(['unused']);
    const backup = JSON.parse(await blobs.get(downloads.at(-1).href).text());
    assert.equal(api.parseWardrobeData(backup).items.get('unused').lastUsedAt, usedAt, '备份回读保留使用历史');
    assert.equal(detailRefreshes, beforeRefresh, '搜索、排序和历史记录不重填详情');
    assert.equal(control('[name="garment_description"]').value, '不能被搜索和排序覆盖的草稿');
    assert.doesNotMatch(source, /data-detail(?:-page)?="preferences"|tw-detail-placeholder/, '详情设置页及专属占位样式已移除');
    console.log('通过搜索防抖及组合筛选、四种排序、搜索后全选、最近使用排序与持久化、失败保留和详情草稿检查。');
}

/**
 * 验证重复备份的三种处理、字节哈希、整批取消和回滚，以及拖放／粘贴共用导入入口。
 * @returns {Promise<void>} 导入及资源断言完成后结束。
 */
async function checkImportDuplicatesAndTransfers() {
    scriptVariables.wardrobe_items = [blue, red];
    scriptVariables.wardrobe_groups = [];
    scriptVariables.wardrobe_selections = { user: ['blue'], char: ['red'] };
    api.selectGroup('*');
    api.selectCategory('all');
    api.sendType('text');
    api.loadGarments();
    await api.migrateLegacyImages();
    const storedImage = api.state().garments.get('blue').image;
    const backup = { format: 'tw-wardrobe', version: 1, groups: [], items: [{ ...blue, description: '备份中的新描述', favorite: true }, red] };
    const input = { value: 'selected', files: [{ name: '重复.json', type: 'application/json', text: async () => JSON.stringify(backup) }] };
    const beforeUploads = uploads;
    let prompts = duplicatePrompts;
    duplicateAction = 'skip';
    await api.importGarmentFiles(Array.from(input.files));
    await api.importGarmentFiles(Array.from(input.files));
    assert.equal(api.state().garments.size, 2, '相同备份重复导入不增加服装');
    assert.equal(uploads, beforeUploads, '跳过不上传任何图片');
    assert.equal(duplicatePrompts, prompts + 2, `每批重复项只提示一次；最近提示：${notices.at(-1)}`);
    assert.equal(api.state().garments.get('blue').description, blue.description, '跳过保留已有元数据');

    duplicateAction = 'overwrite';
    await api.importGarmentFiles(Array.from(input.files));
    assert.equal(api.state().garments.size, 2);
    assert.equal(api.state().garments.get('blue').description, '备份中的新描述');
    assert.equal(api.state().garments.get('blue').favorite, true);
    assert.equal(api.state().garments.get('blue').image, storedImage, '相同原图复用既有路径');
    assert.equal(uploads, beforeUploads, '覆盖无需重复上传相同原图');
    assert.equal(api.readWearerSelections().user.has('blue'), true, '覆盖保留原 ID 和应用关联');
    assert.equal(api.readWearerSelections().char.has('red'), true);

    const beforeRawImage = JSON.stringify(scriptVariables);
    const sameFile = new File(['hello'], `${blue.name}.png`, { type: 'image/png' });
    assert.equal(await api.importGarmentFiles([sameFile]), true);
    assert.equal(JSON.stringify(scriptVariables), beforeRawImage, '纯图片覆盖按跳过处理，保留已有资料');
    assert.ok(!encodedLocalImages.has(sameFile), '字节查重跳过的本地图没有经过 Base64 编码');
    assert.match(control('.tw-library-status').textContent, /跳过 1 件/);
    const oldBackup = { ...backup, items: [{ id: blue.id, name: blue.name, description: '旧备份正文', image: blue.image }] };
    const legacyFile = { name: '旧备份.json', text: async () => JSON.stringify(oldBackup) };
    api.selectItem('red');
    api.setDetailsDirty(true);
    control('[name="garment_description"]').value = '导入期间继续编辑的草稿';
    const beforeImportRefresh = detailRefreshes;
    assert.equal(await api.importGarmentFiles([legacyFile]), true);
    assert.equal(api.state().selectedGarmentId, 'red', '导入成功时有草稿就保留当前选择');
    assert.equal(control('[name="garment_description"]').value, '导入期间继续编辑的草稿');
    assert.equal(detailRefreshes, beforeImportRefresh);
    api.setDetailsDirty(false);
    assert.equal(api.state().garments.get('blue').description, '旧备份正文');
    assert.equal(api.state().garments.get('blue').favorite, true, '旧备份缺少收藏时保留已有值');
    assert.equal(api.state().garments.get('blue').category, 'coats', '旧备份缺少分类时保留已有值');
    oldBackup.items[0].favorite = false;
    assert.equal(await api.importGarmentFiles([legacyFile]), true);
    assert.equal(api.state().garments.get('blue').favorite, false, '明确提供的 false 可以覆盖收藏');
    oldBackup.items[0].description = '';
    assert.equal(await api.importGarmentFiles([legacyFile]), false, '拒绝使已应用的服装缺少描述的覆盖');
    assert.equal(api.state().garments.get('blue').description, '旧备份正文');
    oldBackup.items[0].description = backup.items[0].description;
    assert.equal(await api.importGarmentFiles([legacyFile]), true);

    const beforeOverwriteFailure = JSON.stringify(scriptVariables);
    backup.items[0].description = '保存失败时不能写入的描述';
    writesFail = true;
    await api.importGarmentFiles(Array.from(input.files));
    writesFail = false;
    assert.equal(JSON.stringify(scriptVariables), beforeOverwriteFailure, '覆盖存储失败保留原服装和应用关联');
    assert.equal(api.state().garments.get('blue').description, '备份中的新描述');
    backup.items[0].description = '备份中的新描述';

    duplicateAction = 'keep';
    const filesBeforeKeep = imageFiles.size;
    await api.importGarmentFiles(Array.from(input.files));
    assert.equal(api.state().garments.size, 4, '明确保留两份才增加副本');
    assert.equal(imageFiles.size, filesBeforeKeep, '保留两份增加记录，共用原图文件');
    assert.ok(Array.from(api.state().garments.values()).every(item => item.image === storedImage), '备份恢复与旧图迁移使用同一固定文件名');
    assert.equal(api.readWearerSelections().user.size, 1, '副本不自动应用');
    const beforeCancel = JSON.stringify(scriptVariables);
    const cancelUploads = uploads;
    duplicateAction = '';
    await api.importGarmentFiles(Array.from(input.files));
    assert.equal(JSON.stringify(scriptVariables), beforeCancel, '取消保留整批原存档');
    assert.equal(uploads, cancelUploads, '取消在上传前发生');

    // 同名但原图不同、同图但名称不同都不是重复，不能仅按文件名或 ID 去重。
    duplicateAction = 'skip';
    prompts = duplicatePrompts;
    input.files = [{ name: '不同.json', text: async () => JSON.stringify({ format: 'tw-wardrobe', version: 1, groups: [], items: [
        { ...blue, id: 'different-image', image: 'data:image/png;base64,d29ybGQ=' },
        { ...blue, id: 'different-name', name: '另一名称' },
    ] }) }];
    await api.importGarmentFiles(Array.from(input.files));
    assert.equal(api.state().garments.size, 6);
    assert.equal(duplicatePrompts, prompts, '仅名称与哈希同时相同才提示');

    input.files = [{ name: '批内.json', text: async () => JSON.stringify({ format: 'tw-wardrobe', version: 1, groups: [], items: [
        { ...blue, id: 'batch-one', name: '批内重复' }, { ...red, id: 'batch-two', name: '批内重复' },
    ] }) }];
    const beforeBatch = uploads;
    await api.importGarmentFiles(Array.from(input.files));
    assert.equal(api.state().garments.size, 7, '同一备份内部的重复也受处理方式控制');
    assert.equal(uploads, beforeBatch + 1);

    // 全部文件先校验，混入坏文件时连前面的有效图片都不上传。
    const beforeInvalid = JSON.stringify(scriptVariables);
    const invalidUploads = uploads;
    input.files = [new File(['valid'], '有效.png', { type: 'image/png' }), { name: '坏.json', text: async () => '{bad' }];
    await api.importGarmentFiles(Array.from(input.files));
    assert.equal(JSON.stringify(scriptVariables), beforeInvalid);
    assert.equal(uploads, invalidUploads);

    const transferFile = new File(['transfer-image'], '拖入.png', { type: 'image/png' });
    let prevented = 0;
    const transfer = {
        type: 'dragover', dataTransfer: { types: ['Files'], files: [transferFile] },
        target: { closest: () => null }, preventDefault() { prevented++; },
    };
    await api.handleGarmentTransfer(transfer);
    assert.equal(transfer.dataTransfer.dropEffect, 'copy');
    transfer.type = 'drop';
    await api.handleGarmentTransfer(transfer);
    assert.equal(prevented, 2);
    assert.ok(Array.from(api.state().garments.values()).some(item => item.name === '拖入'));
    const afterDrop = api.state().garments.size;
    await api.handleGarmentTransfer({ ...transfer, type: 'paste', clipboardData: { files: [transferFile] } });
    assert.equal(api.state().garments.size, afterDrop, '粘贴图片也走重复项检查');
    const pasted = new File(['clipboard-image'], '粘贴.png', { type: 'image/png' });
    await api.handleGarmentTransfer({ ...transfer, type: 'paste', clipboardData: { files: [pasted] } });
    assert.equal(api.state().garments.size, afterDrop + 1, '剪贴板图片成功上传');
    const beforeTextPaste = prevented;
    await api.handleGarmentTransfer({ ...transfer, type: 'paste', clipboardData: { files: [pasted] }, target: { closest: () => ({}) } });
    await api.handleGarmentTransfer({ ...transfer, type: 'paste', clipboardData: { files: [] } });
    assert.equal(prevented, beforeTextPaste, '输入框及纯文字粘贴不被拦截');
    input.files = [{ name: '空标签.json', text: async () => JSON.stringify({ format: 'tw-wardrobe', version: 1, items: [], groups: [{ id: 'empty-backup', name: '备份的空标签' }] }) }];
    await api.importGarmentFiles(Array.from(input.files));
    assert.ok(Array.from(api.state().garmentGroups.values()).includes('备份的空标签'), '只有空标签的整库备份仍可恢复');

    // 导入时复用旧单品，上传新成员期间旧单品被删除，整套导入应回滚并明确指出成员失效。
    const reused = Array.from(api.state().garments.values()).findLast(item => item.name === blue.name && item.image === storedImage);
    const member = { ...blue, id: 'new-member', name: '待上传成员', image: 'data:image/png;base64,bmV3LW1lbWJlcg==' };
    const look = { id: 'new-look', name: '导入搭配', category: 'outfits', description: '', image: '', componentIds: [reused.id, member.id] };
    const combined = { format: 'tw-wardrobe', version: 1, groups: [], items: [{ ...reused, image: blue.image }, member, look] };
    duplicateAction = 'skip';
    const originalFetch = sandbox.window.parent.fetch;
    let newPath;
    sandbox.window.parent.fetch = async (url, options) => {
        const response = await originalFetch(url, options);
        if (url === '/api/images/upload') {
            newPath = (await response.json()).path.slice(1);
            await api.deleteGarments(new Set([reused.id]));
        }
        return response;
    };
    try {
        assert.equal(await api.importGarmentFiles([{ name: '搭配.json', text: async () => JSON.stringify(combined) }]), false);
        assert.ok(newPath && !imageFiles.has(newPath), '成员失效后回收本批上传的图片');
        assert.ok(!api.state().garments.has(reused.id), '回滚不撤销期间已经完成的删除');
        assert.ok(!scriptVariables.wardrobe_items.some(item => item.name === look.name));
        assert.match(notices.at(-1), /搭配“导入搭配”的成员已失效/);
    } finally {
        sandbox.window.parent.fetch = originalFetch;
    }
    duplicateAction = 'keep';
    console.log('通过重复项跳过／覆盖／保留、字节哈希、批内去重、取消及校验前置、拖放和剪贴板图片检查。');
}

/**
 * 验证首页指定角色卡、归属保存、聊天实际注入及三种范围隔离，缺少上下文时不回退。
 * @returns {Promise<void>} 范围存档、发送及删除清理断言完成后结束。
 */
async function checkSelectionScopes() {
    scriptVariables.wardrobe_items = [blue, red];
    scriptVariables.wardrobe_groups = [];
    scriptVariables.wardrobe_selections = { user: ['blue'], char: ['red'] };
    scriptVariables.wardrobe_scoped_selections = {};
    delete scriptVariables.wardrobe_selection_scope;
    characterAvatar = '角色甲.png';
    chatId = '同名聊天';
    api.loadGarments();
    const scopeControl = control('.tw-selection-scope select');
    const target = control('.tw-selection-character select');
    Object.defineProperty(target, 'selectedOptions', { get: () => target.options.filter(option => option.value === target.value) });
    target.replaceChildren = fragment => { target.options = fragment.children; };
    api.renderSelectionCharacters();
    assert.deepEqual(Array.from(target.options.slice(1), option => option.textContent), ['同名角色（角色甲.png）', '同名角色（角色乙.png）']);
    control('[name="garment_description"]').value = '切换范围时保留的草稿';
    scopeControl.value = 'character';
    api.selectSelectionScope({ currentTarget: scopeControl });
    assert.equal(api.readWearerSelections().char.size, 0, '首次角色卡范围为空，不复制全局选择');
    assert.equal(control('[name="garment_description"]').value, '切换范围时保留的草稿');
    api.applyGarments(['blue'], 'char');
    api.applyGarments(['red'], 'user');
    chatId = '角色甲的另一聊天';
    assert.equal(api.readWearerSelections().char.has('blue'), true, '同一卡跨聊天共用选择');
    characterAvatar = undefined;
    chatId = '';
    api.selectSelectionCharacter();
    assert.equal(wearerInputs[1].disabled, true, '首页未指定卡时禁用归属');
    target.value = '角色乙.png';
    api.selectSelectionCharacter();
    assert.equal(wearerInputs[1].disabled, false, '首页选择具体卡后可以分配');
    assert.equal(control('.tw-wearer-character').textContent, '同名角色（角色乙.png）');
    api.selectItem('red');
    wearerInputs[1].checked = true;
    api.selectWearer({ target: { closest: () => wearerInputs[1] } });
    assert.deepEqual(scriptVariables.wardrobe_scoped_selections['["character","角色乙.png"]'].char, ['red']);
    assert.equal(api.readWearerSelections().char.size, 0, '首页编辑目标不参与聊天读取');
    assert.equal(control('[name="garment_description"]').value, '切换范围时保留的草稿');

    api.showIds(['blue']);
    api.selectAllGarments({ currentTarget: { checked: true } });
    await api.handleBulkAction({ type: 'change', currentTarget: { value: 'apply-char' } });
    assert.equal(api.readEffectiveSelections().char.has('blue'), true, '批量应用与单件编辑使用同一个目标卡');
    characterAvatar = '角色甲.png';
    chatId = '角色甲的另一聊天';
    chat = [{ mes: '<!-- outfit:char=["blue"] -->', is_user: false }];
    assert.equal(api.readEffectiveSelections().current.char.size, 0, '编辑乙时不展示甲的剧情穿着');
    await api.handleBulkAction({ type: 'change', currentTarget: { value: 'unapply-char' } });
    assert.equal(scriptVariables.wardrobe_scoped_selections['["character","角色乙.png"]'].anchor.char, null, '取消乙的归属不保存甲的聊天锚点');
    chat = [];
    const otherCardRequest = { chat: [{ role: 'user', content: '继续' }] };
    await api.injectWardrobeContent(otherCardRequest);
    assert.match(JSON.stringify(otherCardRequest.chat[0].content), /Char 的可选服装：蓝色外套/, '聊天仍按实际角色甲发送');
    characterAvatar = '角色乙.png';
    target.value = '';
    api.selectSelectionCharacter();
    const request = { chat: [{ role: 'user', content: '继续' }] };
    await api.injectWardrobeContent(request);
    assert.match(request.chat[0].content, /红色外套/);
    assert.doesNotMatch(request.chat[0].content, /蓝色外套/);
    characterAvatar = '角色甲.png';
    assert.equal(api.readWearerSelections().char.has('blue'), true, '切回原卡恢复原选择');
    assert.equal(api.readWearerSelections().user.has('red'), true, 'USER 归属也按范围隔离');

    scopeControl.value = 'chat';
    api.selectSelectionScope({ currentTarget: scopeControl });
    assert.equal(api.readWearerSelections().char.size, 0);
    chatId = '同名聊天';
    api.applyGarments(['red'], 'char');
    chatId = '另一聊天';
    assert.equal(api.readWearerSelections().char.size, 0, '同一卡的两个聊天独立');
    api.applyGarments(['blue'], 'char');
    chatId = '同名聊天';
    assert.equal(api.readWearerSelections().char.has('red'), true);
    characterAvatar = '角色乙.png';
    assert.equal(api.readWearerSelections().char.size, 0, '不同卡的同名聊天互不串用');
    api.applyGarments(['blue'], 'char');
    groupId = '群组甲';
    assert.equal(api.readWearerSelections().char.size, 0, '同名群聊与单聊隔离');
    api.applyGarments(['red'], 'char');
    groupId = '群组乙';
    assert.equal(api.readWearerSelections().char.size, 0, '不同群组的同名聊天隔离');
    groupId = null;

    const beforeFailure = JSON.stringify(scriptVariables);
    writesFail = true;
    assert.throws(() => api.applyGarments(['red'], 'char'), /存储失败/);
    scopeControl.value = 'global';
    api.selectSelectionScope({ currentTarget: scopeControl });
    writesFail = false;
    assert.equal(scopeControl.value, 'chat', '保存范围失败恢复原菜单值');
    assert.equal(JSON.stringify(scriptVariables), beforeFailure, '失败保留范围、归属和使用时间');
    chatId = '';
    assert.equal(api.readWearerSelections().char.size, 0, '首页没有聊天时不读取其他范围');
    assert.throws(() => api.applyGarments(['blue'], 'char'), /先打开聊天/);
    const emptyRequest = { chat: [{ role: 'user', content: '继续' }] };
    await api.injectWardrobeContent(emptyRequest);
    assert.equal(emptyRequest.chat[0].content, '继续', '无范围上下文时不发送全局服装');

    scopeControl.value = 'global';
    api.selectSelectionScope({ currentTarget: scopeControl });
    assert.equal(api.readWearerSelections().user.has('blue'), true);
    assert.equal(api.readWearerSelections().char.has('red'), true, '全局选择未被独立范围覆盖');
    await api.deleteGarments(new Set(['blue']));
    assert.ok(!scriptVariables.wardrobe_selections.user.includes('blue'));
    for (const record of Object.values(scriptVariables.wardrobe_scoped_selections)) {
        assert.ok(!record.user.includes('blue') && !record.char.includes('blue'), '删除清理所有范围的引用');
    }
    console.log('通过首页指定角色卡、单件及批量归属、编辑目标与聊天隔离、三种范围切换及删除清理检查。');
}

/**
 * 验证回车单独保存专属角色、角色标签按世界书回填和发送，以及旧标签的手动恢复。
 * @returns {Promise<void>} 所有归属和请求断言完成后结束。
 */
async function checkNamedWearer() {
    const originalChatId = chatId;
    const originalAvatar = characterAvatar;
    const outfit = { ...blue, name: '棕毛衣包臀裙', description: '棕色针织毛衣和包臀裙' };
    const combo = { ...red, id: 'combo', name: '秋日搭配', componentIds: ['blue', 'red'] };
    scriptVariables.wardrobe_items = [outfit, red, combo];
    scriptVariables.wardrobe_selections = { user: ['blue'], char: ['combo'] };
    scriptVariables.wardrobe_scoped_selections = { '["character","角色甲.png"]': { char: ['blue'] } };
    api.sendType('text');
    api.loadGarments();
    api.selectItem('blue');
    globalWorldbooks = ['世界甲'];
    const worldA = '["世界甲"]';
    const worldB = '["世界乙"]';
    api.refreshWardrobeContext();
    control('[name="garment_name"]').value = outfit.name;
    control('[name="garment_category"]').value = outfit.category;
    control('[name="garment_description"]').value = outfit.description;
    const owner = control('[name="garment_named_wearer"]');
    const tags = control('.tw-named-wearer-tags');
    const scope = control('.tw-selection-scope select');
    const enter = { key: 'Enter', currentTarget: owner, preventDefault() {} };
    const before = JSON.stringify(scriptVariables);
    const description = control('[name="garment_description"]');
    description.value = '尚未提交的描述草稿';
    api.setDetailsDirty(true);
    owner.value = ' 张莹 ';
    api.addNamedWearerTag({ ...enter, isComposing: true });
    assert.equal(tags.children.length, 0, '中文输入法确认候选时不生成标签');
    assert.equal(JSON.stringify(scriptVariables), before);
    writesFail = true;
    api.addNamedWearerTag(enter);
    writesFail = false;
    assert.equal(JSON.stringify(scriptVariables), before, '回车写入失败时保留服装和原有归属');
    assert.equal(owner.value, ' 张莹 ', '保存失败可直接再次回车重试');
    assert.equal(tags.children.length, 0, '保存失败不显示未写入的标签');
    assert.equal(control('.tw-garment-status').dataset.error, 'true');
    api.addNamedWearerTag(enter);
    assert.equal(owner.value, '', '回车保存标签后可继续输入');
    const savedOutfit = scriptVariables.wardrobe_items.find(item => item.id === 'blue');
    assert.deepEqual(Array.from(savedOutfit.namedWearersByWorld[worldA]), ['张莹']);
    assert.equal(savedOutfit.description, outfit.description, '保存专属角色不提交描述草稿');
    assert.equal(description.value, '尚未提交的描述草稿');
    assert.equal(control('[data-action="save-garment"]').dataset.dirty, 'true', '其他详情仍有草稿');
    const after = JSON.stringify(scriptVariables);
    owner.value = '张莹';
    api.addNamedWearerTag(enter);
    assert.equal(tags.children.length, 1, '同一个角色只生成一个标签');
    assert.equal(JSON.stringify(scriptVariables), after, '重复回车不改变存档');
    scope.value = 'character';
    api.selectSelectionScope({ currentTarget: scope });
    assert.equal(tags.children.length, 0, '新范围不继承已保存的角色标签');
    scope.value = 'global';
    api.selectSelectionScope({ currentTarget: scope });
    assert.deepEqual(tags.children.map(tag => tag.dataset.namedWearer), ['张莹'], '切回原范围回填回车保存的标签');
    assert.equal(description.value, '尚未提交的描述草稿');
    assert.deepEqual(scriptVariables.wardrobe_selections.user, [], '普通 USER 归属在同次提交移除');
    assert.deepEqual(scriptVariables.wardrobe_selections.char, [], '含专属单品的搭配退出普通候选');
    assert.deepEqual(scriptVariables.wardrobe_scoped_selections['["character","角色甲.png"]'].char, [], '清理其他范围的旧归属');
    assert.throws(() => api.applyGarments(['blue'], 'char'), /专属角色/);
    assert.equal(api.matchesGarmentFilter(api.state().garments.get('blue'), 'unassigned', api.readWearerSelections()), false);

    chat = [{ is_user: true, mes: '张莹离开了。' }, { is_user: true, mes: '李娜推开了门。' }];
    sandbox.SillyTavern.name2 = '张莹';
    const unrelated = { chat: [{ role: 'system', content: '张莹是背景设定中的人物。' }, { role: 'user', content: '李娜推开了门。' }] };
    await api.injectWardrobeContent(unrelated);
    delete sandbox.SillyTavern.name2;
    assert.equal(unrelated.chat[1].content, '李娜推开了门。', '背景设定、角色卡名和旧楼层均不触发专属服装');

    chat.push({ is_user: false, mes: '张莹突然走了进来。' });
    const regenerated = { chat: [{ role: 'user', content: '李娜推开了门。' }] };
    await api.injectWardrobeContent(regenerated);
    assert.equal(regenerated.chat[0].content, '李娜推开了门。', '待替换回复中的人物不影响重新生成');

    chat = [{ is_user: true, mes: '张莹和李娜来到客厅。' }];
    const request = { chat: [{ role: 'user', content: chat[0].mes }] };
    await api.injectWardrobeContent(request);
    const content = JSON.stringify(request.chat);
    assert.match(content, /【张莹的专属服装】棕毛衣包臀裙/);
    assert.match(content, /只有剧情已明确角色在场且需要描写其衣着时/);
    assert.match(content, /不得因服装资料安排人物登场/);
    assert.doesNotMatch(content, /秋日搭配/, '专属单品的归属不会自动发送其他未指定的搭配');
    assert.doesNotMatch(content, /【Char|【USER|李娜的专属服装/);

    // 独立选装只有专属服装时直接注入主请求，也保留图片和归属标题的对应关系。
    api.markerMode('isolated');
    api.sendType('image');
    api.sendImageQuality('original');
    const isolated = { messages: [{ role: 'user', content: '张莹和李娜在客厅。' }], type: 'normal' };
    api.markOutfitChatPrompt({ prompt: isolated.messages }, false, true);
    await api.applyIsolatedOutfits(isolated);
    assert.match(isolated.messages[0].content, /【张莹的专属服装】棕毛衣包臀裙/);
    assert.ok(isolated.messages[1].content.some(part => part.type === 'image_url'));
    assert.doesNotMatch(JSON.stringify(isolated.messages), /棕色针织毛衣和包臀裙/);
    api.markerMode('strip');
    api.sendType('text');
    api.sendImageQuality('compressed');

    description.value = outfit.description;
    api.setDetailsDirty(false);
    owner.value = '王琳';
    api.markDetailsDirty({ target: { name: 'garment_named_wearer' } });
    assert.equal(control('[data-action="save-garment"]').dataset.dirty, 'true');
    api.addNamedWearerTag(enter);
    assert.deepEqual(Array.from(api.state().garments.get('blue').namedWearersByWorld[worldA]), ['张莹', '王琳']);
    assert.equal(control('[data-action="save-garment"]').dataset.dirty, 'false', '回车后仅有的专属角色草稿已经保存');
    chat = [{ is_user: true, mes: '张莹和王琳见了面。' }];
    const shared = { chat: [{ role: 'user', content: chat[0].mes }] };
    await api.injectWardrobeContent(shared);
    assert.match(shared.chat[0].content, /【张莹、王琳的专属服装】棕毛衣包臀裙/);
    assert.equal(shared.chat[0].content.split('棕毛衣包臀裙').length, 2, '两个角色都出现时同一件服装只发送一次');

    globalWorldbooks = ['世界乙'];
    const otherWorld = { chat: [{ role: 'user', content: chat[0].mes }] };
    await api.injectWardrobeContent(otherWorld);
    assert.equal(otherWorld.chat[0].content, chat[0].mes, '发送时实时读取世界书，角色同名也不会借用另一组的归属');
    api.refreshWardrobeContext();
    assert.equal(tags.children.length, 0, '切换世界书清空界面中上一组的标签');
    owner.value = '李娜';
    api.addNamedWearerTag(enter);
    assert.deepEqual(Array.from(api.state().garments.get('blue').namedWearersByWorld[worldB]), ['李娜']);
    globalWorldbooks = [];
    chatId = '世界书测试聊天';
    chatWorldbook = '世界乙';
    api.refreshWardrobeContext();
    assert.deepEqual(tags.children.map(tag => tag.dataset.namedWearer), ['李娜'], '聊天绑定的世界书也能读取对应归属');
    chatWorldbook = null;
    characterWorldbook = '世界甲';
    api.refreshWardrobeContext();
    assert.deepEqual(tags.children.map(tag => tag.dataset.namedWearer), ['张莹', '王琳'], '角色卡绑定的世界书也能切换归属');
    characterWorldbook = null;
    globalWorldbooks = ['世界甲'];
    api.refreshWardrobeContext();
    assert.deepEqual(tags.children.map(tag => tag.dataset.namedWearer), ['张莹', '王琳'], '切回原世界书恢复原来的标签');
    chat = [];

    await api.exportGarments(['blue']);
    const backup = JSON.parse(await blobs.get(downloads.at(-1).href).text());
    const restoredWorlds = api.parseWardrobeFile(backup).items.get('blue').namedWearersByWorld;
    assert.deepEqual(Array.from(restoredWorlds[worldA]), ['张莹', '王琳']);
    assert.deepEqual(Array.from(restoredWorlds[worldB]), ['李娜']);
    const legacy = api.parseWardrobeData({ items: [{ ...outfit, namedWearer: ' 张莹 ' }], groups: [] });
    assert.deepEqual(Array.from(legacy.items.get('blue').namedWearers), ['张莹'], '旧版单个名字读取为一个标签');

    controls.set('.tw-preview', createLibraryNode());
    api.selectItem('combo');
    api.renderGarmentDetails();
    assert.equal(tags.children.length, 0, '切换服装时清除上一件的角色标签');
    owner.value = '李娜';
    api.addNamedWearerTag(enter);
    assert.match(control('.tw-garment-status').textContent, /搭配成员冲突/, '回车沿用搭配成员归属校验');
    assert.equal(owner.value, '李娜');
    owner.value = '王琳';
    assert.deepEqual(Array.from(api.saveSelectedGarment().namedWearersByWorld[worldA]), ['王琳']);

    api.selectItem('blue');
    api.renderGarmentDetails();
    assert.deepEqual(tags.children.map(tag => tag.dataset.namedWearer), ['张莹', '王琳'], '重新打开时回填保存的标签');
    owner.focus = () => {};
    for (const tag of tags.children.slice()) {
        tag.remove = () => { tags.children = tags.children.filter(child => child !== tag); };
        api.removeNamedWearerTag({ target: { closest: () => tag } });
    }
    const cleared = api.saveSelectedGarment().namedWearersByWorld;
    assert.deepEqual(Array.from(cleared[worldA]), []);
    assert.deepEqual(Array.from(cleared[worldB]), ['李娜'], '清空一组标签保留其他世界书归属');
    assert.equal(api.readWearerSelections().user.size, 0, '清空专属角色不恢复旧归属');

    scriptVariables.wardrobe_items = [{ ...outfit, namedWearer: ' 莹 ' }];
    api.loadGarments();
    api.renderGarmentDetails();
    const restore = control('[data-action="restore-named-wearers"]');
    assert.equal(tags.children.length, 0, '旧标签在确认归属前不显示在当前世界书');
    assert.equal(restore.hidden, false);
    api.restoreLegacyNamedWearers({ currentTarget: restore });
    const migrated = api.saveSelectedGarment();
    assert.deepEqual(Array.from(migrated.namedWearersByWorld[worldA]), ['莹']);
    assert.equal(migrated.namedWearers.length, 0);

    // 两张卡使用完全相同的世界书和角色名，发送时只认实际游玩的角色卡。
    const target = control('.tw-selection-character select');
    characterAvatar = '角色乙.png';
    target.value = '角色甲.png';
    scope.value = 'character';
    api.selectSelectionScope({ currentTarget: scope });
    assert.equal(tags.children.length, 0, '世界书旧标签不能自动套用到目标角色卡');
    assert.equal(restore.hidden, false);
    api.restoreLegacyNamedWearers({ currentTarget: restore });
    const cardKey = JSON.stringify([JSON.stringify(['character', '角色甲.png']), ['世界甲']]);
    assert.deepEqual(Array.from(api.saveSelectedGarment().namedWearersByWorld[cardKey]), ['莹']);
    chat = [{ is_user: true, mes: '莹推开了门。' }];
    const sameNameOtherCard = { chat: [{ role: 'user', content: chat[0].mes }] };
    await api.injectWardrobeContent(sameNameOtherCard);
    assert.equal(sameNameOtherCard.chat[0].content, chat[0].mes, '正在游玩乙卡时，甲卡的同名专属服装不发送');

    characterAvatar = '角色甲.png';
    target.value = '角色乙.png';
    api.selectSelectionCharacter();
    assert.equal(tags.children.length, 0, '详情按选择的乙卡显示归属');
    const boundCard = { chat: [{ role: 'user', content: chat[0].mes }] };
    await api.injectWardrobeContent(boundCard);
    assert.match(boundCard.chat[0].content, /【莹的专属服装】棕毛衣包臀裙/, '发送按游玩的甲卡匹配，与编辑目标无关');

    chat = [];
    characterAvatar = originalAvatar;
    chatId = originalChatId;
    globalWorldbooks = [];
    target.value = '';
    scope.value = 'global';
    api.selectSelectionScope({ currentTarget: scope });
    console.log('通过角色标签的世界书隔离、请求匹配、旧标签恢复、搭配限制和备份检查。');
}

/**
 * 验证六项图片与整理改进，覆盖压缩缓存、替换回收、标签编辑、批量保存及快捷筛选。
 * @returns {Promise<void>} 产品函数的状态与请求断言通过后结束。
 */
async function checkLibraryImprovements() {
    assert.match(source, /class="tw-image-import"[^>]+multiple/, '原生文件入口允许一次选择多张图片');
    imageDimensions = [3200, 1600];
    const original = `data:image/png;base64,${Buffer.from('original-image'.repeat(100)).toString('base64')}`;
    const decodesBefore = imageDecodes;
    const compressed = await Promise.all([api.loadSendImageDataUrl(original), api.loadSendImageDataUrl(original)]);
    assert.deepEqual(compressed, [encodedImage, encodedImage]);
    assert.deepEqual(imageDraws.at(-1), [1280, 640], '长边限制且保留宽高比');
    assert.equal(imageDecodes, decodesBefore + 1, '同图并发共用一次压缩');
    assert.equal(await api.loadSendImageDataUrl(original), encodedImage);
    assert.equal(imageDecodes, decodesBefore + 1, '后续发送复用参考图');
    imageDimensions = [600, 1200];
    const portrait = `data:image/png;base64,${Buffer.from('portrait-image'.repeat(100)).toString('base64')}`;
    assert.equal(await api.loadSendImageDataUrl(portrait), encodedImage);
    assert.deepEqual(imageDraws.at(-1), [600, 1200], '小图不放大，竖图保持比例');
    decodeFailure = true;
    const failedImage = `data:image/png;base64,${Buffer.from('failed-image'.repeat(100)).toString('base64')}`;
    await assert.rejects(api.loadSendImageDataUrl(failedImage), /无法解码/);
    decodeFailure = false;
    assert.equal(await api.loadSendImageDataUrl(failedImage), encodedImage, '解码失败允许重新生成');
    imageDimensions = [64, 64];
    assert.equal(await api.loadSendImageDataUrl('data:image/png;base64,eA=='), 'data:image/png;base64,eA==', '压缩更大的小图继续使用原图');

    scriptVariables.wardrobe_items = [
        { ...blue, image: original }, { ...red, image: portrait },
        { ...red, id: 'shared-improvement', description: '', image: '' },
        { ...red, id: 'empty-improvement', description: ' \n ', image: '' },
        { ...red, id: 'blank-improvement', description: '' },
        { ...red, id: 'ready-improvement', description: '已有描述，等待分配' },
    ];
    scriptVariables.wardrobe_groups = [{ id: 'slim', name: '修身' }, { id: 'daily', name: '日常' }];
    scriptVariables.wardrobe_selection_scope = 'global';
    scriptVariables.wardrobe_selections = { user: ['blue', 'shared-improvement'], char: ['red', 'shared-improvement'] };
    api.loadGarments();
    api.selectGroup('*');
    api.selectCategory('all');
    api.searchGarments({ currentTarget: { value: '' } });
    const list = control('.tw-items');
    for (const [filter, expected] of [
        ['assigned-user', ['blue', 'shared-improvement']],
        ['assigned-char', ['red', 'shared-improvement']],
        ['unassigned', ['ready-improvement']],
        ['missing-description', ['shared-improvement', 'empty-improvement', 'blank-improvement']],
        ['missing-image', ['shared-improvement', 'empty-improvement']],
    ]) {
        api.selectCategory(filter);
        api.renderLibrary();
        assert.deepEqual(list.cards.map(entry => entry.children[2].dataset.garment), expected, `${filter} 显示正确记录`);
        assert.equal(control(`count-${filter}`).textContent, String(expected.length));
    }
    api.selectGroup('slim');
    api.renderLibrary();
    assert.equal(list.cards.length, 0, '快捷筛选与标签共同生效');
    assert.equal(control('count-assigned-user').textContent, '1', '计数跟随标签');
    api.selectGroup('*');
    api.selectCategory('all');
    api.sendType('image');
    scriptVariables.wardrobe_selections = { user: ['blue'], char: ['red'] };
    const sent = { chat: [{ role: 'user', content: '继续' }] };
    await api.injectWardrobeContent(sent);
    assert.ok(sent.chat[0].content.filter(part => part.type === 'image_url').every(part => part.image_url.url === encodedImage), '聊天发送缓存参考图');
    const beforeOriginal = imageDecodes;
    api.sendImageQuality('original');
    const originalRequest = { chat: [{ role: 'user', content: '继续' }] };
    await api.injectWardrobeContent(originalRequest);
    assert.deepEqual(Array.from(originalRequest.chat[0].content.filter(part => part.type === 'image_url'), part => part.image_url.url), [original, portrait]);
    assert.equal(imageDecodes, beforeOriginal, '切换原图后绕过压缩缓存与画布');
    api.sendImageQuality('compressed');
    await api.exportGarments(['blue', 'red']);
    const backup = JSON.parse(await blobs.get(downloads.at(-1).href).text());
    assert.deepEqual(backup.items.map(item => item.image), [original, portrait], '压缩不影响备份原图');

    api.showIds(['blue', 'red']);
    api.selectAllGarments({ currentTarget: { checked: true } });
    api.selectItem('blue');
    control('[name="garment_name"]').value = '名称草稿';
    control('[name="garment_description"]').value = '描述草稿';
    const categoryMenu = { value: 'dresses', classList: { contains: name => name === 'tw-bulk-category' } };
    api.updateCheckedGarments({ currentTarget: categoryMenu });
    assert.equal(categoryMenu.value, '');
    assert.equal(api.state().garments.get('blue').category, 'dresses');
    assert.equal(api.state().garments.get('red').category, 'dresses');
    assert.equal(control('[name="garment_category"]').value, 'dresses');
    assert.equal(api.state().garments.get('shared-improvement').category, 'coats', '仅修改勾选的服装');
    const favoriteMenu = { value: 'favorite', classList: { contains: () => false } };
    api.updateCheckedGarments({ currentTarget: favoriteMenu });
    assert.equal(scriptVariables.wardrobe_items[0].favorite, true);
    assert.equal(scriptVariables.wardrobe_items[1].favorite, true);
    favoriteMenu.value = 'unfavorite';
    writesFail = true;
    api.updateCheckedGarments({ currentTarget: favoriteMenu });
    writesFail = false;
    assert.equal(api.state().garments.get('blue').favorite, true, '批量保存失败保留内存');
    favoriteMenu.value = 'unfavorite';
    api.updateCheckedGarments({ currentTarget: favoriteMenu });
    assert.equal(api.state().garments.get('blue').favorite, false);
    assert.equal(api.readWearerSelections().user.has('blue'), true, '批量分类收藏保留穿着归属');
    assert.equal(control('[name="garment_name"]').value, '名称草稿');
    assert.equal(control('[name="garment_description"]').value, '描述草稿');

    const preview = control('.tw-preview');
    preview.replaceChildren = () => {};
    preview.append = () => {};
    const replaceInput = control('.tw-image-replace');
    replaceInput.click = () => {};
    api.openImageReplacement({ currentTarget: { dataset: { imageField: 'image' } } });
    assert.equal(replaceInput.dataset.garmentId, 'blue');
    replaceInput.files = [];
    await api.replaceGarmentImage({ currentTarget: replaceInput });
    assert.equal(api.state().garments.get('blue').image, original, '取消文件选择保留原图');
    const file = new Blob(['replacement'], { type: 'image/png' });
    file.name = '替换.png';
    replaceInput.files = [file];
    await api.replaceGarmentImage({ currentTarget: replaceInput });
    const replacement = api.state().garments.get('blue').image;
    assert.match(replacement, /^user\/images\/tavern_wardrobe\/.+\.png$/);
    assert.equal(imageFiles.get(replacement).toString(), 'replacement');
    assert.equal(api.readWearerSelections().user.has('blue'), true);
    assert.equal(api.state().garments.get('blue').category, 'dresses');
    assert.equal(control('[name="garment_name"]').value, '名称草稿', '替换只刷新图片');
    assert.equal(control('[name="garment_description"]').value, '描述草稿');
    assert.equal(replaceInput.value, '', '替换后允许重复选择同一文件');
    const fileCount = imageFiles.size;
    writesFail = true;
    await api.replaceGarmentImage({ currentTarget: replaceInput });
    writesFail = false;
    assert.equal(api.state().garments.get('blue').image, replacement, '保存失败保留旧图片');
    assert.equal(imageFiles.size, fileCount, '替换保存失败回收新图');
    uploadFailureAt = uploads + 1;
    await api.replaceGarmentImage({ currentTarget: replaceInput });
    uploadFailureAt = Infinity;
    assert.equal(api.state().garments.get('blue').image, replacement, '上传失败保留原图');
    await api.replaceGarmentImage({ currentTarget: replaceInput });
    assert.equal(api.state().garments.get('blue').image, replacement, '反复替换相同原图仍使用同一路径');
    assert.equal(imageFiles.has(replacement), true, '替换相同原图时不能误删当前文件');
    replaceInput.files = [new File(['different-replacement'], '替换.png', { type: 'image/png' })];
    await api.replaceGarmentImage({ currentTarget: replaceInput });
    assert.equal(imageFiles.has(replacement), false, '成功替换后回收无引用旧文件');
    api.selectItem('empty-improvement');
    api.openImageReplacement({ currentTarget: { dataset: { imageField: 'image' } } });
    await api.replaceGarmentImage({ currentTarget: replaceInput });
    assert.ok(api.state().garments.get('empty-improvement').image, '无图片记录也可补上传');

    const rows = control('.tw-group-rows');
    rows.replaceChildren = () => { rows.children = []; };
    rows.append = row => rows.children.push(row);
    const dialog = control('#tw-group-manager');
    dialog.showModal = () => { dialog.open = true; };
    dialog.close = () => { dialog.open = false; };
    const previousCreateElement = document.createElement;
    document.createElement = createGroupManagerNode;
    api.openGarmentGroupManager();
    document.createElement = previousCreateElement;
    const previousQueryAll = sandbox.testPanel.querySelectorAll;
    sandbox.testPanel.querySelectorAll = selector => selector === '.tw-group-row' ? rows.children : previousQueryAll(selector);
    assert.equal(dialog.open, true);
    assert.deepEqual(rows.children.map(row => row.querySelector('input[type="text"]').value), ['修身', '日常']);
    const first = rows.children[0];
    const second = rows.children[1];
    second.previousElementSibling = first;
    first.before = row => { rows.children = [row, first]; second.previousElementSibling = null; };
    const up = { dataset: { sortMove: 'up' }, closest: () => second, focus() {} };
    api.reorderDraftRow({ target: { closest: () => up } });
    api.reorderDraftRow({ target: { closest: () => up } });
    assert.equal(rows.children[0].dataset.groupId, 'daily', '上移及到顶边界不丢失编辑行');
    first.querySelector('input[type="text"]').value = '  新修身  ';
    api.selectGroup('slim');
    const submit = { preventDefault() {} };
    writesFail = true;
    api.saveGarmentGroups(submit);
    writesFail = false;
    assert.equal(dialog.open, true, '保存失败保留管理表单');
    assert.equal(api.state().garmentGroups.get('slim'), '修身');
    second.querySelector('input[type="text"]').value = '  ';
    api.saveGarmentGroups(submit);
    assert.match(control('.tw-group-status').textContent, /不能为空/);
    second.querySelector('input[type="text"]').value = '日常';
    api.saveGarmentGroups(submit);
    assert.equal(dialog.open, false);
    assert.equal(api.state().currentGroup, 'slim', '重命名不改变当前标签 ID');
    assert.equal(api.state().garments.get('blue').groupIds[0], 'slim', '重命名不改变服装的标签归属');
    assert.deepEqual(scriptVariables.wardrobe_groups, [{ id: 'daily', name: '日常' }, { id: 'slim', name: '新修身' }]);
    api.loadGarments();
    assert.deepEqual(Array.from(api.state().garmentGroups.keys()), ['daily', 'slim'], '重新加载保留排序');
    sandbox.testPanel.querySelectorAll = previousQueryAll;
    console.log('通过多图入口、聊天参考图压缩与缓存、原图备份、替换失败回收、批量分类收藏、标签重命名排序及五项筛选检查。');
}

/**
 * 验证文件夹勾选、本地文件与链接混合导入，以及确认前不发请求、失败重试和对象地址清理。
 * @returns {Promise<void>} 所有待选面板与真实导入断言通过后结束。
 */
async function checkImportPicker() {
    scriptVariables.wardrobe_items = [];
    scriptVariables.wardrobe_groups = [];
    scriptVariables.wardrobe_selections = { user: [], char: [] };
    api.loadGarments();
    api.selectGroup('*');
    api.selectCategory('all');
    const grid = control('.tw-import-grid');
    grid.replaceChildren = fragment => { grid.children = fragment?.children ?? []; };
    const dialog = control('#tw-import-picker');
    dialog.showModal = () => { dialog.open = true; };
    dialog.close = () => { dialog.open = false; };
    dialog.querySelectorAll = () => [control('[data-action="confirm-import"]'), control('[data-action="cancel-import"]')];
    api.openImageImport();
    assert.equal(dialog.open, true);
    const first = new File(['first-photo'], '第一张.png', { type: 'image/png', lastModified: 100 });
    const second = new File(['second-photo'], '第二张.png', { type: 'image/png', lastModified: 100 });
    const input = { files: [first], value: 'selected', classList: { contains: () => false } };
    const beforeUploads = uploads;
    const beforeUrls = blobs.size;
    api.importGarments({ currentTarget: input });
    assert.equal(input.value, '', '每次添加后复位，允许继续添加');
    input.files = [second];
    api.importGarments({ currentTarget: input });
    assert.equal(api.pendingImports().size, 2, '分次选择的文件累积而不互相覆盖');
    assert.equal(uploads, beforeUploads, '添加与预览阶段没有上传请求');
    assert.equal(api.state().garments.size, 0, '确认前不改变衣柜');
    assert.equal(blobs.size, beforeUrls + 2, '每张图只创建一个可释放的缩略图地址');
    const keys = Array.from(api.pendingImports().keys());
    api.selectPendingImports({ target: { closest: () => ({ dataset: { importKey: keys[1] }, checked: false }) } });
    assert.equal(api.pendingImports().get(keys[1]).selected, false, '普通点击切换单张选择');
    api.importGarments({ currentTarget: input });
    assert.equal(api.pendingImports().size, 2, '重复添加文件不重复列出');
    assert.equal(api.pendingImports().get(keys[1]).selected, false, '再次添加不覆盖已有勾选状态');
    input.files = [];
    api.importGarments({ currentTarget: input });
    assert.equal(api.pendingImports().size, 2, '取消系统选择器保留之前的文件');
    await api.handleGarmentTransfer({
        type: 'drop', target: { closest: () => null }, preventDefault() {}, dataTransfer: { files: [second] },
    });
    assert.equal(uploads, beforeUploads, '面板内拖放也只累积候选，不直接上传');

    const folderImage = new File(['folder-photo'], '第三张.png', { type: 'image/png', lastModified: 100 });
    Object.defineProperty(folderImage, 'webkitRelativePath', { value: '服装/第三张.png' });
    const backup = new File(['{}'], '备份.json', { type: 'application/json' });
    api.addPendingImports([folderImage, backup, new File(['说明'], '说明.txt', { type: 'text/plain' })], true);
    assert.equal(api.pendingImports().size, 3, '文件夹只列出支持的图片');
    const folderKey = Array.from(api.pendingImports().keys()).at(-1);
    assert.equal(api.pendingImports().get(folderKey).selected, false, '文件夹中的图片默认待勾选');
    api.selectPendingImports({ target: { closest: () => null }, currentTarget: { dataset: { importSelection: 'none' } } });
    assert.equal(control('[data-action="confirm-import"]').disabled, true);
    api.selectPendingImports({ target: { closest: () => ({ dataset: { importKey: keys[0] }, checked: true }) } });
    api.selectPendingImports({ target: { closest: () => ({ dataset: { importKey: folderKey }, checked: true }) } });
    assert.equal(control('.tw-import-count').textContent, '已选 2 / 3 个文件');

    writesFail = true;
    await api.confirmImageImport();
    writesFail = false;
    assert.equal(api.state().garments.size, 0, '保存失败不留下部分服装');
    assert.equal(api.pendingImports().size, 3, '失败保留文件列表和选择，允许重试');
    assert.equal(dialog.open, true);
    await api.confirmImageImport();
    assert.deepEqual(Array.from(api.state().garments.values(), item => item.name), ['第一张', '第三张'], '只上传并保存勾选文件');
    assert.equal(dialog.open, false);
    assert.equal(api.pendingImports().size, 0);
    assert.equal(blobs.size, beforeUrls, '成功关闭释放所有缩略图地址');

    api.openImageImport();
    api.addPendingImports([backup]);
    assert.equal(api.pendingImports().size, 1, '普通文件入口仍支持 JSON 备份');
    api.addPendingImports([first]);
    api.closeImageImport();
    assert.equal(api.pendingImports().size, 0, '取消关闭清空待选文件');
    assert.equal(blobs.size, beforeUrls, '取消也释放对象地址');
    assert.equal(api.state().garments.size, 2, '取消不改变现有服装');

    api.openImageImport();
    api.addPendingImports([second]);
    promptValue = 'file:///backup.json';
    await api.addImportLink();
    const status = control('.tw-import-status');
    assert.match(status.textContent, /HTTP 或 HTTPS/);
    assert.equal(api.pendingImports().size, 1, '无效链接不影响已有本地文件');

    const backupUrl = 'https://files.example.test/download?token=temporary';
    const previousFetch = sandbox.window.parent.fetch;
    let downloads = 0;
    const responses = [new Response(null, { status: 404 }), new Response('<html>分享页面</html>'), Response.json({
        format: 'tw-wardrobe', version: 1, groups: [{ id: 'slim', name: '修身' }], items: [blue],
    })];
    /** 提供备份的失败与成功响应，图片请求继续走原有存储替身；返回本次响应。 */
    sandbox.window.parent.fetch = async (url, options) => {
        if (url !== backupUrl) return previousFetch(url, options);
        assert.equal(options.signal.aborted, false, '备份请求使用可在卸载时取消的信号');
        return responses[downloads++];
    };
    try {
        promptValue = ` ${backupUrl}#preview `;
        await api.addImportLink();
        promptValue = backupUrl;
        await api.addImportLink();
        assert.equal(api.pendingImports().size, 2, '链接和本地文件共用待选列表，同一地址只列出一次');
        assert.equal(downloads, 0, '确认前不下载备份');
        const uploadsBeforeLink = uploads;
        await api.confirmImageImport();
        assert.match(status.textContent, /HTTP 404/);
        await api.confirmImageImport();
        assert.match(status.textContent, /未返回有效的 JSON/);
        assert.equal(uploads, uploadsBeforeLink, '整批备份校验前不上传本地图片');
        assert.equal(dialog.open, true, '链接失败时保留待选项供重试');
        await api.confirmImageImport();
        assert.equal(downloads, 3);
        assert.equal(dialog.open, false);
        assert.equal(api.pendingImports().size, 0);
        const restored = Array.from(api.state().garments.values()).find(item => item.name === blue.name);
        assert.equal(restored.description, blue.description);
        assert.equal(api.state().garmentGroups.get(restored.groupIds[0]), '修身');
        assert.equal(imageFiles.get(restored.image).toString(), 'hello');
        assert.ok(Array.from(api.state().garments.values()).some(item => item.name === '第二张'));

        const releaseUrl = 'https://github.com/example/wardrobe/releases/download/v1/backup.json';
        const proxyUrl = `/proxy/${encodeURIComponent(releaseUrl)}`;
        let proxyResponse = new Response(null, { status: 404 });
        let proxySignal;
        /** 模拟 GitHub 的跨域拒绝及酒馆代理响应，返回下载结果或原有图片请求结果。 */
        sandbox.window.parent.fetch = async (url, options) => {
            if (url === releaseUrl) throw new TypeError('Failed to fetch');
            if (url !== proxyUrl) return previousFetch(url, options);
            assert.equal(options.credentials, 'omit', '酒馆登录凭据不交给下载代理');
            proxySignal = options.signal;
            return proxyResponse;
        };
        api.openImageImport();
        promptValue = releaseUrl;
        await api.addImportLink();
        await api.confirmImageImport();
        assert.match(status.textContent, /GitHub Release.*添加图片\/文件/);
        assert.equal(dialog.open, true, '代理不可用时保留本次选择');
        let startBody;
        const bodyStarted = new Promise(resolve => { startBody = resolve; });
        proxyResponse = {
            ok: true,
            /** 模拟一直挂起的响应体；无参数，超时中止时拒绝。 */
            json() {
                startBody();
                return new Promise((_, reject) => proxySignal.addEventListener('abort', () => reject(proxySignal.reason), { once: true }));
            },
        };
        const beforeTimeout = JSON.stringify(scriptVariables);
        const pendingDownload = api.confirmImageImport();
        await bodyStarted;
        const [timeoutId, timeout] = Array.from(statusTimers).find(([, timer]) => timer.delay === 60_000);
        timeout.callback();
        await pendingDownload;
        assert.equal(statusTimers.has(timeoutId), false, '响应体超时后清理定时器');
        assert.match(status.textContent, /backup\.json.*超时/);
        assert.equal(JSON.stringify(scriptVariables), beforeTimeout, '超时不提交部分导入结果');
        assert.equal(dialog.open, true);
        assert.equal(control('[data-action="confirm-import"]').disabled, false, '超时恢复导入按钮，保留待选项');
        proxyResponse = Response.json({ format: 'tw-wardrobe', version: 1, groups: [], items: [red] });
        await api.confirmImageImport();
        assert.equal(dialog.open, false, '代理下载后走同一套备份导入');
        assert.ok(Array.from(api.state().garments.values()).some(item => item.name === red.name));
    } finally {
        sandbox.window.parent.fetch = previousFetch;
    }
    console.log('通过文件夹勾选、本地与链接混合导入、确认前零下载和上传、失败重试及缩略图释放检查。');
}

/**
 * 验证文件名只由原图字节决定，覆盖改名导入、跨存档重导入、不同内容及共享文件的失败回收。
 * @returns {Promise<void>} 固定命名、原图保留和回滚断言完成后结束。
 */
async function checkStableImageFilenames() {
    scriptVariables.wardrobe_items = [];
    scriptVariables.wardrobe_groups = [];
    scriptVariables.wardrobe_selections = { user: [], char: [] };
    api.loadGarments();
    api.selectGroup('*');
    duplicateAction = 'keep';
    const bytes = 'stable-original-image';
    const first = new File([bytes], '第一次.png', { type: 'image/png' });
    const renamed = new File([bytes], '改名后.png', { type: 'image/png' });
    await api.importGarmentFiles([first, renamed]);
    const items = Array.from(api.state().garments.values());
    const path = items[0].image;
    assert.match(path, /^user\/images\/tavern_wardrobe\/[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.png$/);
    assert.equal(items[1].image, path, '原图改名不改变上传文件名');
    assert.notEqual(items[0].id, items[1].id, '服装仍保留独立 ID');
    assert.equal(imageFiles.get(path).toString(), bytes, '派生文件名不改变原图字节');

    // 保存失败时，本批与旧服装共用的图片必须保留，真正新增的图片才回收。
    const filesBeforeFailure = imageFiles.size;
    const savedBeforeFailure = JSON.stringify(scriptVariables);
    writesFail = true;
    assert.equal(await api.importGarmentFiles([first, new File(['stable-new-image'], '新图.png', { type: 'image/png' })]), false);
    writesFail = false;
    assert.equal(JSON.stringify(scriptVariables), savedBeforeFailure);
    assert.equal(imageFiles.size, filesBeforeFailure, '失败只回收新图，不删共享文件');
    assert.equal(imageFiles.get(path).toString(), bytes);

    // 清空测试存档后重新读取，排除沿用内存记录或备份 ID 才得到固定路径的假象。
    scriptVariables.wardrobe_items = [];
    api.loadGarments();
    await api.importGarmentFiles([renamed]);
    const restored = Array.from(api.state().garments.values())[0];
    assert.equal(restored.image, path, '独立存档重导入仍得到相同文件名');
    assert.notEqual(restored.id, items[0].id);
    await api.importGarmentFiles([new File([`${bytes}-changed`], renamed.name, { type: 'image/png' })]);
    const changed = Array.from(api.state().garments.values())[1];
    assert.notEqual(changed.image, path, '文件名相同但原图字节不同，派生结果不同');
    assert.equal(imageFiles.get(path).toString(), bytes, '不同原图不能覆盖先前文件');
    console.log('通过 SHA-256 固定 UUID、改名及跨存档导入、独立服装 ID、同图复用、不同图隔离与共享图片失败回收检查。');
}

/**
 * 验证自由组合、真实编辑入口、整套发送与图片分组、成员复用、备份关联重映射及失败保留。
 * @returns {Promise<void>} 搭配与现有服装流程的关键回归断言完成后结束。
 */
async function checkCombinations() {
    const members = ['tops', 'bottoms', 'shoes', 'outfits', 'accessories', 'socks'].map((category, index) => ({
        ...blue, id: `member-${index}`, name: `服装${index}`, category, groupIds: [], description: `描述${index}`,
    }));
    const casual = { ...red, id: 'casual', name: '日常搭配', description: '', groupIds: [], image: '', componentIds: members.slice(0, 3).map(item => item.id) };
    const formal = { ...casual, id: 'formal', name: '正装搭配', componentIds: [members[3].id, members[0].id, members[4].id, members[5].id, members[2].id] };
    members[0].contentRating = 'nsfw';
    casual.contentRating = 'sfw';
    scriptVariables.wardrobe_items = [...members, casual, formal];
    scriptVariables.wardrobe_groups = [];
    scriptVariables.wardrobe_selection_scope = 'global';
    scriptVariables.wardrobe_selections = { user: [], char: [] };
    api.loadGarments();
    api.selectGroup('*');
    api.selectCategory('all');
    api.sendType('text');
    const selections = api.readWearerSelections();
    assert.ok(api.matchesGarmentFilter(casual, 'combinations', selections));
    assert.ok(!api.matchesGarmentFilter(members[3], 'combinations', selections), '套装分类本身不是关联搭配');
    assert.ok(!api.matchesGarmentFilter(casual, 'missing-description', selections), '搭配使用成员描述，无需再填一份');
    assert.ok(api.matchesGarmentFilter(casual, 'unassigned', selections), '成员描述完整的未分配搭配可以待分配');
    assert.ok(!api.matchesGarmentFilter({ ...casual, descriptionOverride: true, description: ' \n ' }, 'unassigned', selections), '整套覆盖正文为空白时归入缺描述');
    assert.ok(!api.matchesGarmentFilter(casual, 'missing-image', selections), '搭配使用成员图片，无需拼接封面');
    for (const componentIds of [[], ['missing'], ['casual'], [members[0].id, members[0].id], 'bad']) {
        assert.throws(() => api.parseWardrobeData({ groups: [], items: [...members, { ...casual, componentIds }] }), /搭配/);
    }
    assert.throws(() => api.parseWardrobeData({ groups: [], items: [...members, casual, { ...formal, componentIds: ['casual'] }] }), /嵌套/);

    const templates = {
        user: { single: '单套|{{count}}|{{name}}|{{description}}', wardrobe: '衣柜|{{count}}|{{outfits}}' },
        char: { single: '角色单套|{{count}}|{{description}}', wardrobe: '角色衣柜|{{count}}|{{outfits}}' },
    };
    for (const content_type of ['text', 'image', 'text_image']) {
        const parts = api.buildWearerContent([casual, members[0]], 'user', { content_type }, templates, { user: '玩家', char: '角色' });
        assert.match(parts[0].text, /每个编号是一条候选/);
        assert.ok(parts[0].text.includes('日常搭配（保存的搭配；分类：外套；内容分级：NSFW（色情／成人服装）'), '搭配的 SFW 不能覆盖 NSFW 成员，三种发送类型均保留分级');
        const disabled = api.buildWearerContent([casual, members[0]], 'user', { content_type, send_content_rating: false }, templates, { user: '玩家', char: '角色' });
        assert.doesNotMatch(disabled[0].text, /内容分级|NSFW|SFW/, '关闭时搭配和成员也不能泄漏分级');
        assert.match(parts[0].text, /成员同时穿着/);
        if (content_type !== 'image') {
            assert.match(parts[0].text, /衣柜\|2\|1\. 日常搭配/);
            assert.match(parts[0].text, /2\. 服装0（单品；分类：上装/);
            for (const item of members.slice(0, 3)) assert.ok(parts[0].text.includes(item.description));
        }
        assert.equal(parts.filter(part => part.type === 'image_url').length, content_type === 'text' ? 0 : 3);
        if (content_type !== 'text') assert.match(parts[0].text, /参考图：服装0（正面）＝图1、服装1（正面）＝图2、服装2（正面）＝图3/);
        const multiple = api.buildWearerContent([casual, formal], 'char', { content_type }, templates, { user: '玩家', char: '角色' });
        if (content_type !== 'image') assert.match(multiple[0].text, /角色衣柜\|2\|/);
        if (content_type !== 'text') {
            assert.equal(multiple.filter(part => part.type === 'image_url').length, 6, '共享成员只发一次图片');
            assert.match(multiple[0].text, /参考图：服装3（正面）＝图4、服装0（正面）＝图1、服装4（正面）＝图5、服装5（正面）＝图6、服装2（正面）＝图3/);
        }
    }
    const currentMember = api.state().garments.get(members[0].id);
    currentMember.description = '更新后的上装描述';
    assert.ok(api.getGarmentDescription(casual).includes(currentMember.description), '共享成员编辑后所有搭配立即生效');
    currentMember.description = '';
    // 未分配与缺描述互斥，不能把自动合并时生成的成员名称误当作有效描述。
    assert.ok(!api.matchesGarmentFilter(casual, 'unassigned', selections), '任一成员缺描述时搭配不显示在未分配');
    assert.ok(api.matchesGarmentFilter({ ...casual, descriptionOverride: true, description: '已编辑整套描述' }, 'unassigned', selections), '手动整套描述有效时不再要求成员描述');
    assert.throws(() => api.buildWardrobeContent(casual, { content_type: 'text' }), /服装0.*描述/);
    assert.equal(api.buildWardrobeContent(casual, { content_type: 'image' }).length, 3, '图片模式不要求成员描述');
    currentMember.description = members[0].description;

    // 直接执行详情渲染和保存：合并正文必须进入编辑框，未编辑保存不能重复追加或冻结成员引用。
    control('.tw-preview').replaceChildren = () => {};
    control('.tw-preview').append = () => {};
    api.selectItem(casual.id);
    api.renderGarmentDetails();
    assert.equal(control('[name="garment_content_rating"]').value, 'sfw', '详情回填手动分级，发送时仍以 NSFW 成员为准');
    assert.equal(control('[name="garment_description"]').value, api.getGarmentDescription(casual));
    assert.ok(control('[name="garment_description"]').value.includes(members[0].description));
    assert.equal(control('.tw-description-actions').hidden, true, '搭配不展示不可用的识图操作');
    api.saveSelectedGarment();
    assert.equal(api.state().garments.get(casual.id).description, '', '未编辑的合并内容继续自动引用成员');
    assert.equal(api.state().garments.get(casual.id).descriptionOverride, undefined);
    assert.equal(api.getGarmentDescription(api.state().garments.get(casual.id)).split(members[0].description).length, 2, '保存后成员正文不重复');
    api.selectItem(members[0].id);
    api.renderGarmentDetails();
    assert.equal(control('[name="garment_description"]').value, members[0].description);
    assert.equal(control('.tw-description-actions').hidden, false, '普通服装保留原有识图入口');

    // 驱动真实表单构建和提交，避免只验证手写的搭配数据而漏掉用户入口。
    const dialog = control('#tw-combination-editor');
    const rows = createLibraryNode();
    const nameInput = { value: '' };
    const status = { textContent: '' };
    dialog.querySelector = selector => selector === '.tw-combination-items' ? rows : selector === '[name="combination_name"]' ? nameInput : status;
    dialog.querySelectorAll = () => rows.children.map(row => row.children[0]).filter(input => input.checked);
    dialog.showModal = () => { dialog.open = true; };
    dialog.close = () => { dialog.open = false; };
    sandbox.testPanel.dataset = {};
    control('[data-detail="description"]').click = () => {};
    control('[data-action="toggle-details"]').querySelector = () => ({ textContent: '' });
    api.state().checkedGarmentIds.clear();
    const beforeOpening = JSON.stringify(scriptVariables);
    api.openCombinationEditor({ currentTarget: { dataset: { action: 'create-combination' } } });
    assert.equal(dialog.open, true, '无需多选和勾选，直接打开合并搭配弹窗');
    assert.equal(dialog.querySelectorAll().length, 0, '未勾选时由用户在弹窗内选择成员');
    assert.equal(dialog.dataset.garmentId, '', '当前查看已有服装时也必须新建搭配');
    assert.equal(JSON.stringify(scriptVariables), beforeOpening, '仅打开弹窗不修改存档或角色选择');
    api.closeCombinationEditor();
    api.state().checkedGarmentIds.add(casual.id);
    api.state().checkedGarmentIds.add(members[4].id);
    api.openCombinationEditor({ currentTarget: { dataset: { action: 'create-combination' } } });
    assert.equal(rows.children.length, members.length, '可选所有分类的普通服装，禁止嵌套搭配');
    assert.equal(dialog.querySelectorAll().length, 4, '以现有搭配继续组合时展开并去重成员');
    const firstRow = rows.children[0];
    const secondRow = rows.children[1];
    firstRow.parentElement = rows;
    secondRow.getBoundingClientRect = () => ({ top: 0, height: 40 });
    secondRow.after = row => { rows.children.splice(0, 2, secondRow, row); };
    const transfer = { setData() {} };
    api.dragDraftRow({
        type: 'dragstart', currentTarget: rows, dataTransfer: transfer,
        target: { closest: selector => selector === '[data-sort-row]' ? firstRow : {} },
    });
    const dropEvent = { currentTarget: rows, dataTransfer: transfer, clientY: 30, preventDefault() {}, stopPropagation() {}, target: { closest: () => secondRow } };
    api.dragDraftRow({ ...dropEvent, type: 'dragover' });
    assert.equal(secondRow.dataset.dropPosition, 'after');
    api.dragDraftRow({ ...dropEvent, type: 'drop' });
    assert.equal(secondRow.dataset.dropPosition, undefined, '放下后清除位置提示');
    assert.equal(JSON.stringify(scriptVariables), beforeOpening, '拖动只调整草稿顺序');
    nameInput.value = '自定义搭配';
    const beforeSave = JSON.stringify(scriptVariables);
    writesFail = true;
    api.saveCombination({ preventDefault() {} });
    writesFail = false;
    assert.equal(JSON.stringify(scriptVariables), beforeSave);
    assert.equal(dialog.open, true, '保存失败保留模态框和勾选');
    assert.match(status.textContent, /存储失败/);
    api.saveCombination({ preventDefault() {} });
    assert.equal(dialog.open, false);
    const created = api.state().garments.get(api.state().selectedGarmentId);
    assert.equal(created.name, '自定义搭配');
    assert.equal(created.componentIds.length, 4);
    assert.equal(created.componentIds[0], secondRow.children[0].value, '按拖拽后的顺序保存搭配');
    assert.equal(api.state().multiSelectMode, false);
    assert.equal(api.readWearerSelections().user.size, 0, '合成搭配不擅自修改角色应用选择');
    control('[name="garment_name"]').value = created.name;
    control('[name="garment_description"]').value = '手动编辑后的整套描述';
    control('[name="garment_category"]').value = 'outfits';
    api.openCombinationEditor({ currentTarget: { dataset: { action: 'edit-combination' } } });
    assert.deepEqual(rows.children.slice(0, 4).map(row => row.children[0].value), Array.from(created.componentIds), '编辑搭配按已保存顺序还原成员');
    nameInput.value = '修改后的搭配';
    rows.children[0].children[0].checked = false;
    api.saveCombination({ preventDefault() {} });
    assert.equal(api.state().garments.get(created.id).componentIds.length, 3);
    assert.equal(api.state().garments.get(created.id).description, '手动编辑后的整套描述');
    assert.equal(api.state().garments.get(created.id).descriptionOverride, true);
    api.renderGarmentDetails();
    assert.equal(control('[name="garment_description"]').value, '手动编辑后的整套描述', '重新打开只显示编辑后的完整正文');
    const custom = api.state().garments.get(created.id);
    assert.equal(api.getGarmentDescription(custom), custom.description, '发送正文不再拼接一遍原成员描述');
    control('[name="garment_description"]').value = '再次修改的正文';
    writesFail = true;
    assert.equal(api.saveSelectedGarment(), undefined);
    writesFail = false;
    assert.equal(api.state().garments.get(created.id).description, '手动编辑后的整套描述');
    assert.ok(api.saveSelectedGarment());
    assert.equal(api.state().garments.get(created.id).description, '再次修改的正文');
    await api.exportGarments([created.id]);
    const customBackup = api.parseWardrobeFile(JSON.parse(await blobs.get(downloads.at(-1).href).text()));
    assert.equal(customBackup.items.get(created.id).descriptionOverride, true, '备份保留整段编辑状态');
    assert.equal(api.getGarmentDescription(customBackup.items.get(created.id)), '再次修改的正文');
    assert.throws(() => api.parseWardrobeData({ groups: [], items: [{ ...members[0], descriptionOverride: 'true' }] }), /服装数据/);
    api.applyGarments([casual.id], 'user');
    api.applyGarments([formal.id], 'char');
    api.sendType('text_image');
    const request = { chat: [{ role: 'user', content: '继续剧情' }] };
    await api.injectWardrobeContent(request);
    const content = request.chat[0].content;
    assert.equal(content.filter(part => part.type === 'image_url').length, 8, '实际请求保留两位角色的所有成员图');
    const wearerTexts = content.filter(part => part.type === 'text' && part.text.includes('的服装】'));
    assert.equal(wearerTexts.length, 2);
    assert.ok(wearerTexts[0].text.includes(casual.name) && !wearerTexts[0].text.includes(formal.name));
    assert.ok(wearerTexts[1].text.includes(formal.name) && !wearerTexts[1].text.includes(casual.name), '两位角色的组合与图片分组独立');
    api.sendType('text');
    await assert.rejects(() => api.deleteGarments(new Set([members[0].id])), /搭配.*使用/);
    api.selectItem(members[0].id);
    control('[name="garment_name"]').value = members[0].name;
    control('[name="garment_category"]').value = members[0].category;
    control('[name="garment_description"]').value = '';
    assert.equal(api.saveSelectedGarment(), undefined, '不能清空当前已应用搭配的成员描述');
    assert.match(control('.tw-garment-status').textContent, /描述/);
    assert.equal(api.state().garments.get(members[0].id).description, members[0].description);

    await api.exportGarments([casual.id, formal.id]);
    const backup = JSON.parse(await blobs.get(downloads.at(-1).href).text());
    assert.equal(backup.items.length, 8, '两套搭配及六件成员打包，共享成员只导出一次');
    assert.equal(api.parseWardrobeFile(backup).items.size, 8);
    scriptVariables.wardrobe_items = [];
    scriptVariables.wardrobe_selections = { user: [], char: [] };
    api.loadGarments();
    const file = { name: '搭配.json', type: 'application/json', text: async () => JSON.stringify(backup) };
    duplicateAction = 'keep';
    assert.equal(await api.importGarmentFiles([file]), true);
    let restored = Array.from(api.state().garments.values());
    assert.equal(restored.length, 8);
    const restoredCasual = restored.find(item => item.name === casual.name);
    const restoredFormal = restored.find(item => item.name === formal.name);
    assert.equal(restoredCasual.componentIds.length, 3);
    for (const id of restoredFormal.componentIds) assert.ok(api.state().garments.has(id) && !id.startsWith('member-'), '所有关联重映射到新 ID');
    assert.ok(restoredFormal.componentIds.includes(restoredCasual.componentIds[0]), '共享单品恢复后仍为同一条记录');
    duplicateAction = 'skip';
    await api.importGarmentFiles([file]);
    assert.equal(api.state().garments.size, 8, '重复跳过包含搭配，不把相同成员组合重复导入');
    duplicateAction = 'overwrite';
    await api.importGarmentFiles([file]);
    assert.equal(api.state().garments.size, 8, '覆盖保留原搭配及成员 ID');
    duplicateAction = 'keep';
    await api.importGarmentFiles([file, file]);
    restored = Array.from(api.state().garments.values());
    assert.equal(restored.length, 24, '同一批多文件旧 ID 相同仍各自独立恢复');
    for (const item of restored) if (item.componentIds) assert.equal(api.buildWardrobeContent(item, { content_type: 'text_image' }).length, item.componentIds.length + 1);
    const beforeFailure = JSON.stringify(scriptVariables);
    writesFail = true;
    assert.equal(await api.importGarmentFiles([file]), false);
    writesFail = false;
    assert.equal(JSON.stringify(scriptVariables), beforeFailure, '搭配备份保存失败不留下部分成员');
    await api.deleteGarments(new Set(api.state().garments.keys()));
    assert.equal(api.state().garments.size, 0, '搭配与成员可以一次整体删除');
    console.log('通过自由品类组合、搭配新建编辑、图文整套发送、共享成员、删除约束、自包含备份、关联重映射与失败回滚检查。');
}

/**
 * 验证多标签迁移、真实复选框与卡片渲染、下拉创建、组合筛选、批量增减、备份回读及失败回滚。
 * @returns {Promise<void>} 数据与交互断言完成后结束。
 */
async function checkMultipleTags() {
    const groups = [{ id: 'home', name: '居家' }, { id: 'summer', name: '夏季' }, { id: 'formal', name: '正式' }];
    const tagged = { ...blue, image: '', groupIds: ['home', 'summer'] };
    const parsed = api.parseWardrobeData({ groups, items: [{ ...tagged, groupIds: ['home', 'home', 'missing', 'summer'] }] });
    assert.deepEqual(Array.from(parsed.items.get('blue').groupIds), ['home', 'summer'], '入口去重并清理悬空引用');
    assert.deepEqual(Array.from(api.parseWardrobeData({ groups, items: [{ ...tagged, groupId: 'formal', groupIds: [] }] }).items.get('blue').groupIds), [], '显式空数组不恢复旧标签');
    for (const groupIds of ['home', null, [1], ['home', null]]) {
        assert.throws(() => api.parseWardrobeData({ groups, items: [{ ...tagged, groupIds }] }), /服装数据/, '标签字段只在入口校验');
    }
    scriptVariables.wardrobe_items = [tagged, { ...red, image: '', groupIds: [] }];
    scriptVariables.wardrobe_groups = groups;
    scriptVariables.wardrobe_selections = { user: [], char: [] };
    api.selectGroup('*');
    api.selectCategory('all');
    api.searchGarments({ currentTarget: { value: '' } });
    api.loadGarments();
    api.selectItem('blue');
    document.createElement = tag => tag === 'dialog' ? createImportDialog() : createLibraryNode();
    document.createDocumentFragment = createLibraryNode;
    controls.set('.tw-group-tabs', createLibraryNode());
    const fieldset = createLibraryNode();
    // 详情标签只有复选框行，此处保持与真实 DOM 相同的后代查询结果。
    fieldset.querySelectorAll = () => fieldset.children.map(label => label.children[0]);
    controls.set('[name="garment_group"]', fieldset);
    api.enableLibraryRendering();
    api.renderFullLibrary();
    const inputs = fieldset.querySelectorAll();
    assert.deepEqual(inputs.map(input => input.checked), [true, true, false], '详情同时展示多个勾选');
    const list = control('.tw-items');
    const tags = list.cards[0].children[2].children.at(-1).children[1];
    assert.deepEqual(tags.children.map(tag => tag.textContent), ['居家', '夏季'], '两个标签直接显示，不添加数量占位');
    api.selectGroup('summer');
    api.renderFullLibrary();
    assert.equal(list.cards.length, 1, '第二个标签也能筛选到服装');
    api.searchGarments({ currentTarget: { value: '居家' } });
    api.renderFullLibrary();
    assert.equal(list.cards.length, 1, '标签搜索与另一标签筛选共同生效');
    api.searchGarments({ currentTarget: { value: '' } });
    api.selectGroup('');
    api.renderFullLibrary();
    assert.equal(list.cards.length, 1);
    assert.equal(list.cards[0].children[2].dataset.garment, 'red', '未分组只包含零标签服装');
    api.selectGroup('*');
    api.renderFullLibrary();
    control('[name="garment_name"]').value = '未保存名称';
    control('[name="garment_description"]').value = '未保存描述';
    inputs[2].checked = true;
    api.assignGarmentGroup({ target: inputs[2] });
    assert.deepEqual(scriptVariables.wardrobe_items[0].groupIds, ['home', 'summer', 'formal']);
    const overflowTags = list.cards[0].children[2].children.at(-1).children[1];
    assert.deepEqual(overflowTags.children.map(tag => tag.textContent), ['居家', '夏季', '+1'], '第三个标签起只显示额外数量');
    assert.equal(overflowTags.title, '标签：居家、夏季、正式', '容器悬停包含全部标签');
    assert.ok(overflowTags.children.every(tag => tag.title === overflowTags.title), '悬停名称或数量也显示全部标签');
    assert.equal(fieldset.querySelectorAll()[2], inputs[2], '勾选刷新保留节点及键盘焦点');
    writesFail = true;
    inputs[0].checked = false;
    api.assignGarmentGroup({ target: inputs[0] });
    writesFail = false;
    assert.equal(inputs[0].checked, true, '保存失败恢复被取消的标签');
    assert.equal(control('[name="garment_name"]').value, '未保存名称');
    assert.equal(control('[name="garment_description"]').value, '未保存描述');
    api.showIds(['blue', 'red']);
    api.selectAllGarments({ currentTarget: { checked: true } });
    api.moveCheckedGarments('add:summer');
    api.moveCheckedGarments('add:summer');
    assert.deepEqual(scriptVariables.wardrobe_items[0].groupIds, ['home', 'summer', 'formal'], '重复批量添加不重复也不覆盖');
    assert.deepEqual(scriptVariables.wardrobe_items[1].groupIds, ['summer']);
    api.moveCheckedGarments('remove:home');
    assert.deepEqual(scriptVariables.wardrobe_items[0].groupIds, ['summer', 'formal'], '批量移除只影响指定标签');
    const beforeFailure = JSON.stringify(scriptVariables);
    writesFail = true;
    api.moveCheckedGarments('');
    writesFail = false;
    assert.equal(JSON.stringify(scriptVariables), beforeFailure, '批量保存失败保留全部标签');
    await api.exportGarments(['blue']);
    const backup = JSON.parse(await blobs.get(downloads.at(-1).href).text());
    assert.deepEqual(backup.items[0].groupIds, ['summer', 'formal']);
    assert.deepEqual(backup.groups.map(group => group.name), ['夏季', '正式'], '单件导出包含全部关联标签');
    assert.equal(Object.hasOwn(backup.items[0], 'groupId'), false, '新存档仅保留数组字段');
    assert.equal(await api.importGarmentFiles([{ name: '多标签.json', text: async () => JSON.stringify(backup) }]), true, control('.tw-library-status').textContent);
    assert.deepEqual(Array.from(Array.from(api.state().garments.values()).at(-1).groupIds), ['summer', 'formal'], '导入按名称映射全部标签');
    api.selectGroup('formal');
    await api.deleteGarmentGroup();
    assert.deepEqual(Array.from(api.state().garments.get('blue').groupIds), ['summer'], '删标签保留其他标签');
    api.loadGarments();
    assert.deepEqual(Array.from(api.state().garments.get('blue').groupIds), ['summer'], '重载保留多标签变更');
    api.selectGroup('*');
    api.renderFullLibrary();
    api.selectAllGarments({ currentTarget: { checked: true } });
    api.moveCheckedGarments('');
    assert.ok(scriptVariables.wardrobe_items.every(item => item.groupIds.length === 0), '清空后所有所选服装回到未分组');
    // 用数百个标签验证下拉搜索只过滤选项，不把搜索外的勾选从存档中删掉。
    scriptVariables.wardrobe_groups = Array.from({ length: 300 }, (_, index) => ({ id: `large-${index}`, name: index === 0 ? 'Summer' : `标签${String(index).padStart(3, '0')}` }));
    scriptVariables.wardrobe_items[0].groupIds = ['large-1'];
    api.loadGarments();
    api.selectItem(scriptVariables.wardrobe_items[0].id);
    api.renderFullLibrary();
    assert.equal(fieldset.children.length, 300);
    assert.equal(control('.tw-tag-summary').textContent, '已选 1 个：标签001');
    const search = control('.tw-tag-search');
    search.value = ' summer ';
    api.filterGarmentGroupOptions();
    assert.deepEqual(fieldset.children.filter(row => !row.hidden).map(row => row.dataset.searchText), ['summer'], '搜索忽略大小写和首尾空白');
    api.handleGarmentTagPicker({ currentTarget: search });
    search.value = '299';
    api.handleGarmentTagPicker({ currentTarget: search });
    const scheduled = Array.from(statusTimers).filter(([, timer]) => timer.delay === 100);
    assert.equal(scheduled.length, 1, '连续输入只保留一次待执行筛选');
    statusTimers.delete(scheduled[0][0]);
    scheduled[0][1].callback();
    assert.equal(fieldset.children.filter(row => !row.hidden).length, 1);
    const matchingInput = fieldset.querySelectorAll()[299];
    matchingInput.checked = true;
    api.assignGarmentGroup({ target: matchingInput });
    assert.deepEqual(scriptVariables.wardrobe_items[0].groupIds, ['large-1', 'large-299'], '搜索后勾选保留被隐藏的已选标签');
    assert.equal(search.value, '299', '连续勾选时保留搜索词');
    assert.equal(control('.tw-tag-summary').textContent, '已选 2 个：标签001、标签299');
    search.value = '没有这个标签';
    api.filterGarmentGroupOptions();
    assert.equal(control('.tw-tag-empty').hidden, false, '零结果有明确反馈');
    search.value = '299';
    api.handleGarmentTagPicker({ currentTarget: search });
    search.value = '';
    api.handleGarmentTagPicker({ currentTarget: search });
    assert.ok(fieldset.children.every(row => !row.hidden), '清空常驻搜索框立即恢复全部标签');
    assert.ok(Array.from(statusTimers.values()).every(timer => timer.delay !== 100), '清空搜索取消待执行的筛选');
    // 数百个标签仅生成两个名称与一个数量节点，完整名称仍可通过悬停和读屏获取。
    scriptVariables.wardrobe_items[0].groupIds = scriptVariables.wardrobe_groups.map(group => group.id);
    api.loadGarments();
    api.renderFullLibrary();
    const manyTags = list.cards[0].children[2].children.at(-1).children[1];
    assert.deepEqual(manyTags.children.map(tag => tag.textContent), ['Summer', '标签001', '+298']);
    assert.ok(manyTags.title.endsWith('标签299'), '悬停包含未渲染的末尾标签');
    assert.equal(manyTags.attributes['aria-label'], manyTags.title, '读屏同样可以获取全部标签');
    // 标签页内创建与关联一次提交；验证重复、取消和失败时不破坏既有勾选与编辑草稿。
    const addTagEvent = { currentTarget: { dataset: { action: 'add-garment-group' } } };
    const selectedId = api.state().selectedGarmentId;
    const previousGroup = api.state().currentGroup;
    const beforeDetailRefresh = detailRefreshes;
    let searchFocused = false;
    /** 记录搜索框焦点恢复；无参数，无返回值。 */
    search.focus = () => { searchFocused = true; };
    search.value = '  页内新标签  ';
    control('[name="garment_name"]').value = '新建标签时保留的名称草稿';
    control('[name="garment_description"]').value = '新建标签时保留的描述草稿';
    promptValue = '  页内新标签  ';
    await api.addGarmentGroup(addTagEvent);
    const created = scriptVariables.wardrobe_groups.find(group => group.name === '页内新标签');
    assert.equal(promptDefault, '页内新标签', '搜索内容预填为标签名');
    assert.ok(scriptVariables.wardrobe_items[0].groupIds.includes(created.id), '创建后自动关联当前服装');
    assert.equal(fieldset.querySelectorAll().find(input => input.value === created.id).checked, true, '新增选项立即勾选');
    assert.equal(api.state().currentGroup, previousGroup, '页内创建不切换列表标签');
    assert.equal(api.state().selectedGarmentId, selectedId, '页内创建保留当前服装');
    assert.equal(search.value, '', '成功后显示全部标签');
    assert.equal(searchFocused, true, '成功后返回搜索框继续操作');
    assert.equal(detailRefreshes, beforeDetailRefresh, '创建标签不重填详情');
    assert.equal(control('[name="garment_name"]').value, '新建标签时保留的名称草稿');
    assert.equal(control('[name="garment_description"]').value, '新建标签时保留的描述草稿');
    const afterCreation = JSON.stringify(scriptVariables);
    await api.addGarmentGroup(addTagEvent);
    assert.equal(JSON.stringify(scriptVariables), afterCreation, '同名复用且不重复勾选');
    for (const cancelled of [null, '   ']) {
        promptValue = cancelled;
        await api.addGarmentGroup(addTagEvent);
        assert.equal(JSON.stringify(scriptVariables), afterCreation, '取消或空白不产生标签');
    }
    search.value = '保存失败的标签';
    promptValue = search.value;
    writesFail = true;
    await api.addGarmentGroup(addTagEvent);
    writesFail = false;
    assert.equal(JSON.stringify(scriptVariables), afterCreation, '失败时标签与归属都不提交');
    assert.equal(api.state().garmentGroups.size, 301, '失败不留下内存中的空标签');
    assert.equal(search.value, '保存失败的标签', '失败保留搜索内容便于重试');
    assert.match(control('.tw-garment-status').textContent, /存储失败/);
    api.selectItem(null);
    api.renderFullLibrary();
    assert.equal(control('[data-action="add-garment-group"]').disabled, true, '未选服装时禁用详情创建');
    api.selectItem(selectedId);
    api.renderFullLibrary();
    assert.equal(control('[data-action="add-garment-group"]').disabled, false, '选中服装后可创建');
    search.value = '';
    api.filterGarmentGroupOptions();
    console.log('通过标签页内创建并勾选、同名复用、取消、失败回滚、禁用状态及草稿保留检查。');
    console.log('通过 300 个常驻标签的搜索多选、输入合并、隐藏选择保留、数量摘要、零结果及清空搜索检查。');
    console.log('通过多标签迁移、复选框复用、卡片与组合筛选、批量添加移除清空、备份回读及失败回滚检查。');
}

/**
 * 验证筛选独立的空分组、选择记忆、同名汇总与局部编辑，以及存档和备份中的归属恢复。
 * @returns {Promise<void>} 交互、数据合并和失败回滚断言完成后结束。
 */
async function checkFilterGroups() {
    scriptVariables.wardrobe_items = [
        { ...blue, id: 'top', category: 'tops', image: '', groupIds: ['daily'], favorite: true },
        { ...red, id: 'shoe', category: 'shoes', image: '', groupIds: ['daily'] },
    ];
    scriptVariables.wardrobe_groups = [{ id: 'daily', name: '日常' }];
    scriptVariables.wardrobe_selections = { user: [], char: [] };
    api.selectCategory('all');
    api.selectGroup('*');
    api.loadGarments();
    api.searchGarments({ currentTarget: { value: '' } });
    api.updateCategory('tops');
    assert.deepEqual(Array.from(api.getFilterGarmentGroups().keys()), ['daily'], '旧标签按实际服装出现在对应分类');
    promptValue = '上装专用';
    await api.addGarmentGroup();
    const topGroup = api.state().currentGroup;
    assert.deepEqual(scriptVariables.wardrobe_groups.find(group => group.id === topGroup).filters, ['tops'], '空分组保存创建时的筛选');
    api.loadGarments();
    assert.equal(api.getFilterGarmentGroups().has(topGroup), true, '重载保留空分组');
    api.updateCategory('shoes');
    assert.equal(api.state().currentGroup, '*', '首次切换筛选不沿用上装标签');
    assert.equal(api.getFilterGarmentGroups().has(topGroup), false, '鞋子不显示上装的空分组');
    promptValue = '鞋子专用';
    await api.addGarmentGroup();
    const shoeGroup = api.state().currentGroup;
    api.updateCategory('tops');
    assert.equal(api.state().currentGroup, topGroup, '切回上装恢复其独立标签选择');
    assert.equal(api.getFilterGarmentGroups().has(shoeGroup), false);
    api.updateCategory('favorites');
    assert.deepEqual(Array.from(api.getFilterGarmentGroups().keys()), ['daily'], '快捷筛选仅显示相关标签');
    promptValue = '收藏专用';
    await api.addGarmentGroup();
    const favoriteGroup = api.state().currentGroup;
    api.updateCategory('missing-image');
    assert.equal(api.getFilterGarmentGroups().has(favoriteGroup), false, '快捷筛选也独立保存空分组');
    api.updateCategory('shoes');
    promptValue = '上装专用';
    await api.addGarmentGroup();
    assert.equal(api.state().currentGroup, topGroup, '其他筛选同名分组复用稳定 ID');
    assert.deepEqual(scriptVariables.wardrobe_groups.find(group => group.id === topGroup).filters, ['tops', 'shoes']);
    api.updateCategory('all');
    assert.equal(Array.from(api.getFilterGarmentGroups().values()).filter(name => name === '上装专用').length, 1, '全部汇总同名只显示一次');

    const rows = control('.tw-group-rows');
    const previousCreate = document.createElement;
    const previousQuery = sandbox.testPanel.querySelectorAll;
    document.createElement = createGroupManagerNode;
    /** 提供管理器行与复选框；参数为选择器，返回当前表单中的控件。 */
    sandbox.testPanel.querySelectorAll = selector => {
        if (selector === '.tw-group-row') return rows.children;
        if (selector === '.tw-group-check input') return rows.children.map(row => row.querySelector('input[type="checkbox"]'));
        return previousQuery(selector);
    };
    const submit = { preventDefault() {} };
    api.updateCategory('tops');
    api.openGarmentGroupManager();
    assert.deepEqual(rows.children.map(row => row.querySelector('input[type="text"]').value), ['日常', '上装专用'], '管理器只管理当前筛选分组');
    rows.children.find(row => row.dataset.groupId === 'daily').querySelector('input[type="text"]').value = '上装日常';
    const beforeFailure = JSON.stringify(scriptVariables);
    writesFail = true;
    api.saveGarmentGroups(submit);
    writesFail = false;
    assert.equal(JSON.stringify(scriptVariables), beforeFailure, '局部重命名失败不改变归属或服装标签');
    api.saveGarmentGroups(submit);
    const renamed = api.state().garments.get('top').groupIds[0];
    assert.equal(api.state().garmentGroups.get(renamed), '上装日常');
    assert.deepEqual(Array.from(api.state().garments.get('shoe').groupIds), ['daily'], '重命名上装分组保留鞋子的原分组');
    assert.equal(api.getFilterGarmentGroups('shoes').has(renamed), false);
    api.selectGroup(topGroup);
    await api.deleteGarmentGroup();
    assert.equal(api.getFilterGarmentGroups().has(topGroup), false, '当前筛选删除其空分组');
    assert.equal(api.getFilterGarmentGroups('shoes').has(topGroup), true, '其他筛选的同名空分组继续保留');

    api.updateCategory('all');
    api.openGarmentGroupManager();
    rows.children.find(row => row.dataset.groupId === renamed).querySelector('input[type="text"]').value = '日常';
    api.saveGarmentGroups(submit);
    const daily = Array.from(api.state().garmentGroups).find(([, name]) => name === '日常')[0];
    assert.equal(Array.from(api.state().garmentGroups.values()).filter(name => name === '日常').length, 1, '重命名重名直接合并');
    assert.ok(Array.from(api.state().garments.values()).every(item => item.groupIds.length === 1 && item.groupIds[0] === daily), '合并重映射所有服装且不丢失关联');
    await api.exportGarments(api.state().garments.keys(), true);
    const backup = JSON.parse(await blobs.get(downloads.at(-1).href).text());
    assert.deepEqual(backup.groups.find(group => group.id === topGroup).filters, ['shoes'], '整库备份保留空分组的独立筛选归属');
    scriptVariables.wardrobe_items = [];
    scriptVariables.wardrobe_groups = [];
    api.loadGarments();
    assert.equal(await api.importGarmentFiles([{ name: '分组.json', text: async () => JSON.stringify(backup) }]), true);
    assert.ok(Array.from(api.getFilterGarmentGroups('shoes').values()).includes('上装专用'));
    assert.equal(Array.from(api.getFilterGarmentGroups('tops').values()).includes('上装专用'), false, '备份恢复不混入其他分类');
    const scopeOnly = { format: 'tw-wardrobe', version: 1, items: [], groups: [{ id: 'source', name: '上装专用', filters: ['bottoms'] }] };
    const scopeFile = { name: '空分组.json', text: async () => JSON.stringify(scopeOnly) };
    const itemCount = api.state().garments.size;
    writesFail = true;
    assert.equal(await api.importGarmentFiles([scopeFile]), false);
    writesFail = false;
    assert.equal(Array.from(api.getFilterGarmentGroups('bottoms').values()).includes('上装专用'), false, '导入失败不提前修改内存中的筛选归属');
    assert.equal(await api.importGarmentFiles([scopeFile]), true);
    assert.equal(api.state().garments.size, itemCount, '只恢复空分组归属时不新增服装');
    assert.ok(Array.from(api.getFilterGarmentGroups('bottoms').values()).includes('上装专用'), '同名空分组的新筛选归属不能当成重复导入跳过');

    const duplicate = api.parseWardrobeData({
        groups: [{ id: 'a', name: ' 同名 ', filters: ['tops'] }, { id: 'b', name: '同名', filters: ['shoes'] }],
        items: [{ ...blue, groupIds: ['a', 'b'] }],
    });
    assert.equal(duplicate.groups.size, 1, '旧存档或备份入口合并去空白后的重名');
    assert.deepEqual(Array.from(duplicate.items.get('blue').groupIds), ['a']);
    assert.deepEqual(Array.from(duplicate.groupFilters.get('a')), ['tops', 'shoes']);
    assert.throws(() => api.parseWardrobeData({ items: [], groups: [{ id: 'a', name: '无效', filters: ['unknown'] }] }), /筛选归属/);

    // 同时删除已关联服装的标签和跨筛选的空标签，验证批量提交仍遵循单个删除的范围。
    const keptId = 'keep';
    scriptVariables.wardrobe_items = [
        { ...blue, id: 'top', category: 'tops', image: '', groupIds: ['daily'] },
        { ...red, id: 'shoe', category: 'shoes', image: '', groupIds: ['daily', keptId] },
    ];
    scriptVariables.wardrobe_groups = [
        { id: 'daily', name: '日常' },
        { id: 'empty', name: '上装专用', filters: ['shoes', 'bottoms'] },
        { id: keptId, name: '保留标签' },
    ];
    api.loadGarments();
    api.updateCategory('shoes');
    api.selectGroup('daily');
    api.openGarmentGroupManager();
    const selectAll = control('.tw-group-select-all');
    const deleteButton = control('[data-action="delete-groups"]');
    const count = control('.tw-group-selection-count');
    selectAll.type = 'checkbox';
    selectAll.focus = () => {};
    control('[data-action="add-group"]').focus = () => {};
    assert.equal(deleteButton.disabled, true);
    selectAll.checked = true;
    api.updateGarmentGroupSelection({ target: selectAll });
    assert.equal(count.textContent, '已选 3 个');
    selectAll.checked = false;
    api.updateGarmentGroupSelection({ target: selectAll });
    assert.equal(deleteButton.disabled, true, '取消全选后禁用删除');
    selectAll.checked = true;
    api.updateGarmentGroupSelection({ target: selectAll });
    const keptRow = rows.children.find(row => row.dataset.groupId === keptId);
    const keepCheckbox = keptRow.querySelector('input[type="checkbox"]');
    keepCheckbox.checked = false;
    api.updateGarmentGroupSelection({ target: keepCheckbox });
    assert.equal(selectAll.indeterminate, true);
    assert.equal(count.textContent, '已选 2 个');
    keptRow.querySelector('input[type="text"]').value = '未保存的名称';
    const beforeDelete = JSON.stringify(scriptVariables);
    confirmation = false;
    await api.deleteManagedGarmentGroups();
    confirmation = true;
    assert.equal(JSON.stringify(scriptVariables), beforeDelete, '取消确认不修改存档');
    writesFail = true;
    await api.deleteManagedGarmentGroups();
    writesFail = false;
    assert.equal(JSON.stringify(scriptVariables), beforeDelete, '保存失败不产生部分删除');
    assert.equal(count.textContent, '已选 2 个', '失败保留勾选以便重试');
    await api.deleteManagedGarmentGroups();
    assert.deepEqual(rows.children, [keptRow], '批量删除后保留其余草稿行');
    assert.equal(keptRow.querySelector('input[type="text"]').value, '未保存的名称');
    assert.equal(api.state().garmentGroups.get(keptId), '保留标签', '删除时不提交重命名草稿');
    assert.deepEqual(Array.from(api.state().garments.get('shoe').groupIds), [keptId], '保留范围内服装的其他标签');
    assert.equal(api.state().garments.get('top').groupIds.length, 1, '范围外服装保留标签');
    assert.ok(Array.from(api.getFilterGarmentGroups('bottoms').values()).includes('上装专用'), '范围外空标签继续保留');
    assert.equal(api.state().currentGroup, '*', '当前标签被移除后回到全部标签');
    assert.equal(deleteButton.disabled, true, '删除后清除勾选');
    control('#tw-group-manager').close();
    api.updateCategory('all');
    api.openGarmentGroupManager();
    selectAll.checked = true;
    api.updateGarmentGroupSelection({ target: selectAll });
    await api.deleteManagedGarmentGroups();
    api.loadGarments();
    assert.equal(control('#tw-group-manager').open, false, '删完所有标签后退出管理器');
    assert.equal(api.state().garmentGroups.size, 0, '全部筛选中删除整个衣柜的标签');
    assert.equal(api.state().garments.size, 2, '删除标签保留服装');
    document.createElement = previousCreate;
    sandbox.testPanel.querySelectorAll = previousQuery;
    console.log('通过筛选独立空分组、快捷筛选、选择记忆、局部重命名、批量删除、同名合并、备份恢复与失败回滚检查。');
}

/**
 * 验证单件和搭配成员通过可聚焦按钮打开原图，无图片时不打开，关闭后清理图片引用。
 * @returns {void} 全部原图预览断言完成后结束。
 */
function checkOriginalImage() {
    scriptVariables.wardrobe_items = [
        { ...blue, groupIds: [] },
        { ...red, image: '', groupIds: [] },
        { ...red, id: 'combo-preview', image: '', groupIds: [], componentIds: ['blue', 'red'] },
    ];
    scriptVariables.wardrobe_groups = [];
    api.loadGarments();
    const previousCreate = document.createElement;
    document.createElement = createLibraryNode;
    const preview = createLibraryNode();
    controls.set('.tw-preview', preview);
    const dialog = control('#tw-original-image');
    const image = { removeAttribute(name) { delete this[name]; } };
    const heading = {};
    dialog.querySelector = selector => selector === 'img' ? image : heading;
    dialog.showModal = () => { dialog.open = true; };
    dialog.close = () => { dialog.open = false; };
    api.selectItem('blue');
    api.renderGarmentImage();
    const button = preview.children[0];
    assert.equal(button.type, 'button', '单件预览使用原生按钮支持键盘打开');
    assert.equal(button.dataset.previewGarment, 'blue');
    api.openGarmentImage({ target: { closest: () => button } });
    assert.equal(dialog.open, true);
    assert.equal(image.src, blue.image, '直接显示保存的原图，不引用压缩副本');
    assert.equal(image.alt, `${blue.name}（正面）`);
    assert.equal(heading.textContent, `${blue.name}（正面）`);
    api.closeGarmentImage();
    assert.equal(dialog.open, false);
    assert.equal(image.src, undefined, '关闭后移除原图引用');
    api.selectItem('combo-preview');
    api.renderGarmentImage();
    assert.deepEqual(preview.children.map(cell => cell.dataset.previewGarment), ['blue', 'red']);
    assert.equal(preview.children[1].disabled, true, '无图成员不提供无效入口');
    api.openGarmentImage({ target: { closest: () => preview.children[0] } });
    assert.equal(image.src, blue.image, '搭配按点击的成员打开原图');
    api.closeGarmentImage();
    api.openGarmentImage({ target: { closest: () => preview.children[1] } });
    assert.equal(dialog.open, false);
    api.openGarmentImage({ target: { closest: () => null } });
    assert.equal(dialog.open, false, '预览占位区域不打开空弹窗');
    document.createElement = previousCreate;
    console.log('通过单件与搭配成员原图打开、无图禁用、原图路径复用及关闭清理检查。');
}

/**
 * 验证正背面独立保存、预览及失败回滚，覆盖备份恢复、共享文件和双图发送。
 * @returns {Promise<void>} 双图的数据与交互断言全部完成后结束。
 */
async function checkImageSides() {
    const backData = 'data:image/webp;base64,YmFjay1pbWFnZQ==';
    scriptVariables.wardrobe_items = [{ ...blue, backImage: backData }, { ...red, image: '' }];
    scriptVariables.wardrobe_groups = [];
    scriptVariables.wardrobe_selections = { user: [], char: [] };
    api.loadGarments();
    assert.equal(api.state().garments.get('red').backImage, '', '旧记录补空背面，不复制正面');
    for (const backImage of [null, 1, 'https://bad.test/back.png']) {
        assert.throws(() => api.parseWardrobeData({ groups: [], items: [{ ...blue, backImage }] }), /有效图片/);
    }
    assert.throws(() => api.parseWardrobeData({ groups: [], items: [{ ...blue, backImage: 'user/images/tavern_wardrobe/back.png' }] }, false), /本机路径/);
    await api.migrateLegacyImages();
    const front = api.state().garments.get('blue').image;
    const back = api.state().garments.get('blue').backImage;
    assert.ok(imageFiles.has(front) && imageFiles.has(back), '两面均迁移到原图文件');
    api.selectItem('blue');
    const previousCreate = document.createElement;
    document.createElement = createLibraryNode;
    const preview = createLibraryNode();
    controls.set('.tw-preview', preview);
    api.renderGarmentImage();
    assert.deepEqual(preview.children.map(button => button.dataset.imageField), ['image', 'backImage'], '固定左正面右背面');
    assert.deepEqual(preview.children.map(button => button.children[0].src), [front, back]);
    const dialog = control('#tw-original-image');
    api.openGarmentImage({ target: { closest: () => preview.children[1] } });
    assert.equal(dialog.querySelector('img').src, back, '背面打开对应原图');
    api.closeGarmentImage();
    control('[name="garment_name"]').value = '双图草稿';
    control('[name="garment_description"]').value = '双图描述草稿';
    const input = control('.tw-image-replace');
    input.click = () => {};
    api.openImageReplacement({ currentTarget: { dataset: { imageField: 'backImage' } } });
    assert.equal(input.dataset.imageField, 'backImage');
    // 选择器打开后切换详情，文件仍替换原记录的背面。
    api.selectItem('red');
    input.files = [new File(['new-back'], 'back.png', { type: 'image/png' })];
    await api.replaceGarmentImage({ currentTarget: input });
    let item = api.state().garments.get('blue');
    const nextBack = item.backImage;
    assert.equal(item.image, front, '替换背面不修改正面');
    assert.equal(api.state().garments.get('red').backImage, '', '切换选择不会替换错记录');
    assert.equal(imageFiles.has(back), false, '成功提交后回收旧背面');
    assert.equal(control('[name="garment_name"]').value, '双图草稿');
    api.selectItem('blue');
    api.openImageReplacement({ currentTarget: { dataset: { imageField: 'image' } } });
    input.files = [new File(['new-front'], 'front.png', { type: 'image/png' })];
    await api.replaceGarmentImage({ currentTarget: input });
    item = api.state().garments.get('blue');
    const nextFront = item.image;
    assert.equal(item.backImage, nextBack, '替换正面不修改背面');
    api.openImageReplacement({ currentTarget: { dataset: { imageField: 'backImage' } } });
    input.files = [new File(['failed-back'], 'failed.png', { type: 'image/png' })];
    const filesBefore = imageFiles.size;
    writesFail = true;
    await api.replaceGarmentImage({ currentTarget: input });
    writesFail = false;
    assert.equal(api.state().garments.get('blue').backImage, nextBack, '保存失败保留原背面');
    assert.equal(imageFiles.size, filesBefore, '保存失败回收本次新背面');
    await api.exportGarments(['blue']);
    const backup = JSON.parse(await blobs.get(downloads.at(-1).href).text());
    assert.equal(backup.items[0].image, await api.loadImageDataUrl(nextFront));
    assert.equal(backup.items[0].backImage, await api.loadImageDataUrl(nextBack), '备份内嵌两张原图');
    duplicateAction = 'overwrite';
    await api.importGarmentFiles([{ name: '双图.json', type: 'application/json', text: async () => JSON.stringify(backup) }]);
    assert.equal(api.state().garments.get('blue').backImage, nextBack, '重复导入两面均复用文件');
    backup.items[0].backImage = backData;
    await api.importGarmentFiles([{ name: '另一背面.json', type: 'application/json', text: async () => JSON.stringify(backup) }]);
    assert.equal(api.state().garments.size, 3, '同名同正面但背面不同，不覆盖原服装');
    api.loadGarments();
    item = api.state().garments.get('blue');
    assert.equal(item.backImage, nextBack, '重新加载保留背面');
    const templates = { user: { single: '{{name}}', wardrobe: '{{outfits}}' } };
    const parts = api.buildWearerContent([item, item], 'user', { content_type: 'image' }, templates, { user: '玩家' });
    assert.equal(parts.filter(part => part.type === 'image_url').length, 2, '共享记录两面各发一次');
    assert.match(parts[0].text, /蓝色外套（正面）＝图1、蓝色外套（背面）＝图2/);
    const backOnly = { ...item, image: '' };
    assert.equal(api.matchesGarmentFilter(backOnly, 'missing-image', {}), false, '仅有背面仍视为有图');
    assert.equal(api.buildWardrobeContent(backOnly, { content_type: 'image' })[0].image_url.url, nextBack);
    // 另一件服装的背面仍引用正面文件时，不允许清理该共享文件。
    scriptVariables.wardrobe_items.push({ ...red, id: 'back-shared', image: '', backImage: nextFront });
    api.loadGarments();
    await api.deleteGarmentImages([nextFront]);
    assert.equal(imageFiles.has(nextFront), true);
    api.selectItem('blue');
    api.sendType('text');
    control('[name="garment_name"]').value = item.name;
    control('[name="garment_description"]').value = item.description;
    await api.handleGarmentAction({ currentTarget: { dataset: { action: 'remove-image' } } });
    assert.equal(api.state().garments.get('blue').image, '');
    assert.equal(api.state().garments.get('blue').backImage, '', '删除图片同时清空两面');
    api.renderGarmentImage();
    assert.equal(preview.children.length, 2, '无图时仍保留正背面位置');
    assert.ok(preview.children.every(button => button.disabled));
    document.createElement = previousCreate;
    console.log('通过正背面独立替换、双图迁移备份恢复、失败回滚、图号复用与共享文件清理检查。');
}

/**
 * 验证缓存合并并发、按最近使用淘汰及超限单图释放，并检查 Blob 读取错误。
 * @returns {Promise<void>} 所有缓存与读取器断言完成。
 */
async function checkImageCacheLimit() {
    const cache = { entries: new Map(), bytes: 0 };
    let reads = 0;
    /** 返回约占 6 MiB 的参考图数据；无参数，返回数据地址。 */
    const load = async () => {
        reads++;
        return `data:image/png;base64,${'A'.repeat(3 * 1024 * 1024)}`;
    };
    const first = api.loadCachedGarmentImage(cache, 'first', load);
    assert.equal(api.loadCachedGarmentImage(cache, 'first', load), first, '同图共用进行中的读取任务');
    await first;
    await api.loadCachedGarmentImage(cache, 'second', load);
    await api.loadCachedGarmentImage(cache, 'first', load);
    await api.loadCachedGarmentImage(cache, 'third', load);
    assert.equal(reads, 3);
    assert.deepEqual([...cache.entries.keys()], ['first', 'third'], '淘汰最近最少使用的条目');
    assert.ok(cache.bytes <= 16 * 1024 * 1024);
    await api.loadCachedGarmentImage(cache, 'oversized', async () => 'A'.repeat(9 * 1024 * 1024));
    assert.equal(cache.entries.has('oversized'), false, '超限单图返回后不留缓存');

    const previousReader = sandbox.window.parent.FileReader;
    sandbox.window.parent.FileReader = class {
        /** 模拟读取失败；无参数，无返回值。 */
        readAsDataURL() { this.onerror(); this.onloadend(); }
    };
    try {
        await assert.rejects(api.readGarmentImage(new Blob([], { type: 'image/png' })), { message: '无法读取图片。' });
        await assert.rejects(api.readGarmentImage(new File([], '文件.png', { type: 'image/png' })), /无法读取图片：文件.png/);
    } finally {
        sandbox.window.parent.FileReader = previousReader;
    }
}

// 使用已有的内置测试运行器等待主流程，异步流程意外悬空时必须失败，避免漏跑后续断言。
require('node:test')('衣柜数据与交互回归', main);
