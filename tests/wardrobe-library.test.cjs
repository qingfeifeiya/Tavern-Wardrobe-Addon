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
let chatId = 'chat';

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
        assert.ok(!scriptVariables.wardrobe_items.some(item => item.image === body.path));
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
    if (!controls.has(selector)) controls.set(selector, { value: '', dataset: {}, disabled: false, textContent: '', setAttribute(name, value) { this[name] = value; } });
    return controls.get(selector);
}

const document = {
    body: { append() {} },
    createElement: () => ({ click() { downloads.push({ href: this.href, name: this.download }); }, remove() {} }),
};
const sandbox = {
    window: { parent: {
        document, matchMedia: () => ({ matches: false }), Blob, AbortController,
        FileReader: ImageReader, fetch: imageFetch,
        // 用可手动触发的计时器验证提示生命周期，不让回归测试实际等待三秒。
        setTimeout: (callback, delay) => { const id = ++timerSequence; statusTimers.set(id, { callback, delay }); return id; },
        clearTimeout: id => statusTimers.delete(id),
        crypto: { randomUUID: () => `new-${++sequence}` },
        URL: { createObjectURL: blob => { const url = `blob:${++sequence}`; blobs.set(url, blob); return url; }, revokeObjectURL: url => blobs.delete(url) },
        confirm: () => confirmation, prompt: () => promptValue,
    } },
    getVariables: option => option.type === 'script' ? scriptVariables : chatVariables,
    insertOrAssignVariables: (data, option) => {
        if (writesFail) throw new Error('存储失败');
        Object.assign(option.type === 'script' ? scriptVariables : chatVariables, structuredClone(data));
    },
    SillyTavern: { getCurrentChatId: () => chatId, getRequestHeaders: () => ({ 'X-CSRF-Token': 'test-token' }) },
    toastr: { error: message => notices.push(message), success: message => notices.push(message) },
    console,
    recordDetailRefresh: () => { detailRefreshes++; },
    testPanel: { querySelector: control, querySelectorAll: selector => selector === 'input[data-wearer]' ? wearerInputs : [] },
};
vm.createContext(sandbox);
const hooks = `
panel = testPanel;
root = { isConnected: true };
refreshWardrobe = () => { recordDetailRefresh(); renderWearerState(); };
const actualRenderGarmentLibrary = renderGarmentLibrary;
renderGarmentLibrary = () => {};
const actualRenderBulkState = renderBulkState;
renderBulkState = () => {};
showGarmentDescription = () => {};
globalThis.api = { parseWardrobeData, loadGarments, exportGarments, importGarments, applyGarments,
    assignGarmentGroup, setLibraryStatus, toggleGarmentFavorite, selectGarment,
    migrateLegacyImages, loadImageDataUrl, handleGarmentAction, injectWardrobeContent, deleteGarmentImages,
    deleteGarments, addGarmentGroup, deleteGarmentGroup, moveCheckedGarments, selectAllGarments,
    readWearerSelections, selectWearer, renderWearerState, handleBulkAction, toggleMultiSelect, checkGarment, renderBulkState: actualRenderBulkState,
    searchGarments, sortGarments,
    state: () => ({ garments, garmentGroups, currentGroup, selectedGarmentId, checkedGarmentIds, multiSelectMode }),
    selectGroup: id => { currentGroup = id; },
    showIds: ids => { visibleGarmentIds = new Set(ids); },
    selectItem: id => { selectedGarmentId = id; },
    sendType: type => { sendSettings.content_type = type; },
    selectCategory: id => { currentCategory = id; },
    renderLibrary: () => { renderGarmentGroups = () => {}; actualRenderGarmentLibrary(); },
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
    assert.equal(statusTimers.size, 0, '错误提示不被成功消息的计时器清除');
    assert.equal(libraryStatus.textContent, '存储失败');
    api.setLibraryStatus('');
    assert.equal(libraryStatus.textContent, '');

    api.loadGarments();
    assert.equal(api.state().garments.get('blue').groupId, 'slim');
    assert.equal(api.parseWardrobeData({ groups: [], items: [{ ...red, groupId: undefined }] }).items.get('red').groupId, '', '旧服装默认未分组');
    assert.throws(() => api.parseWardrobeData({ groups: [], items: [{ ...red, image: 'https://bad.test/a.png' }] }), /有效图片/);
    assert.throws(() => api.parseWardrobeData({ groups: [], items: [red, red] }), /标识重复/);

    // 单件标签选择立即持久化，不能依赖额外保存，也不能顺带提交或重填其他编辑字段。
    const tagSelect = control('[name="garment_group"]');
    control('[name="garment_name"]').value = '未保存的名称';
    control('[name="garment_description"]').value = '未保存的描述';
    tagSelect.value = '';
    const beforeTagRefresh = detailRefreshes;
    api.assignGarmentGroup({ currentTarget: tagSelect });
    assert.equal(api.state().garments.get('blue').groupId, '', '选择未分组后立即更新归属');
    api.loadGarments();
    assert.equal(api.state().garments.get('blue').groupId, '', '重载仍保留已分配标签');
    assert.equal(api.state().garments.get('blue').name, blue.name, '标签分配不提交未保存的名称');
    assert.equal(api.state().garments.get('blue').description, blue.description, '标签分配不提交未保存的描述');
    assert.equal(control('[name="garment_description"]').value, '未保存的描述', '保留描述编辑框的草稿');
    assert.equal(detailRefreshes, beforeTagRefresh, '标签分配不重填详情表单');
    tagSelect.value = 'slim';
    api.assignGarmentGroup({ currentTarget: tagSelect });
    assert.equal(scriptVariables.wardrobe_items[0].groupId, 'slim', '自定义标签立即保存到存档');
    writesFail = true;
    tagSelect.value = 'empty';
    api.assignGarmentGroup({ currentTarget: tagSelect });
    writesFail = false;
    assert.equal(tagSelect.value, 'slim', '保存失败恢复原来的标签选择');
    assert.equal(api.state().garments.get('blue').groupId, 'slim', '保存失败保留原标签归属');
    assert.equal(scriptVariables.wardrobe_items[0].groupId, 'slim');
    assert.match(control('.tw-garment-status').textContent, /存储失败/);

    chatId = '';
    control('[name="garment_name"]').value = blue.name;
    control('[name="garment_category"]').value = blue.category;
    control('[name="garment_group"]').value = blue.groupId;
    control('[name="garment_description"]').value = blue.description;
    api.renderWearerState();
    assert.ok(wearerInputs.every(input => !input.checked), '未分配的服装不能默认允许任一角色穿');
    // 通过真实的复选框处理函数验证：保存详情刷新控件后仍应保留本次勾选意图。
    wearerInputs[1].checked = true;
    api.selectWearer({ target: { closest: () => wearerInputs[1] } });
    assert.equal(api.readWearerSelections().char.has('blue'), true, '只勾选 Char 时保存 Char 归属');
    assert.equal(api.readWearerSelections().user.has('blue'), false, 'Char 服装不得自动分配给 USER');
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
    assert.equal(control('.tw-bulk-actions').hidden, true, '只开启多选但未勾选时仍隐藏操作栏');
    api.checkGarment({ target: { closest: () => ({ checked: true, dataset: { checkGarment: 'blue' } }) } });
    api.renderBulkState();
    assert.equal(control('.tw-bulk-actions').hidden, false, '有勾选后才显示操作栏');
    api.checkGarment({ target: { closest: () => ({ checked: false, dataset: { checkGarment: 'blue' } }) } });
    api.renderBulkState();
    assert.equal(control('.tw-bulk-actions').hidden, true, '取消最后一项时收起操作栏');
    api.checkGarment({ target: { closest: () => ({ checked: true, dataset: { checkGarment: 'blue' } }) } });
    api.toggleMultiSelect();
    api.renderBulkState();
    assert.equal(api.state().checkedGarmentIds.size, 0, '关闭多选清空勾选');
    assert.equal(api.state().multiSelectMode, false);
    assert.equal(control('.tw-bulk-actions').hidden, true);
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
    assert.equal(downloads[0].name, '衣柜-2件.json');
    assert.equal(exported.groups.length, 2, '整库备份保留空标签');
    assert.equal(api.parseWardrobeData(exported).items.get('blue').image, blue.image, '导出包含原始图片');
    await api.exportGarments(['blue']);
    assert.equal(blobs.size, 1, '下次下载释放旧地址');
    assert.equal(JSON.parse(await blobs.get(downloads[1].href).text()).items.length, 1, '单件导出只包含当前服装');

    const input = { files: [{ name: '衣柜.json', type: 'application/json', text: async () => JSON.stringify(exported) }], value: 'selected' };
    await api.importGarments({ currentTarget: input });
    assert.equal(input.value, '', '完成后允许重复选择同一文件');
    assert.equal(api.state().garments.size, 4, '重新导入新增服装而非覆盖原件');
    assert.equal(api.state().garmentGroups.size, 2, '已有同名标签复用');
    const imported = Array.from(api.state().garments.values()).filter(item => item.id.startsWith('new-'));
    assert.equal(imported[0].groupId, 'slim');
    assert.equal(imported[0].description, blue.description);

    const beforeInvalid = JSON.stringify(scriptVariables);
    input.files.push({ name: 'bad.json', type: 'application/json', text: async () => '{bad' });
    await api.importGarments({ currentTarget: input });
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
    api.moveCheckedGarments({ currentTarget: { value: 'empty' } });
    assert.equal(api.state().garments.get('red').groupId, 'empty');
    assert.equal(scriptVariables.wardrobe_items.find(item => item.id === 'blue').groupId, 'empty', '批量归类写入存档');

    promptValue = '新款';
    api.addGarmentGroup();
    const newGroup = api.state().currentGroup;
    assert.equal(api.state().garmentGroups.get(newGroup), '新款');
    api.addGarmentGroup();
    assert.equal(api.state().garmentGroups.size, 3, '相同名称不重复创建');
    api.selectGroup('empty');
    api.deleteGarmentGroup();
    assert.equal(api.state().garments.size, 4, '删标签不删服装');
    assert.equal(api.state().garments.get('blue').groupId, '');
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
    api.deleteGarments(new Set(['blue', 'red']));
    assert.equal(api.state().garments.has('blue'), true, '取消删除保留原数据');
    confirmation = true;
    writesFail = true;
    assert.throws(() => api.deleteGarments(new Set(['blue'])), /存储失败/);
    assert.equal(api.state().garments.has('blue'), true, '存储失败不能删除内存数据');
    writesFail = false;
    chatId = '';
    api.deleteGarments(new Set(['blue', 'red']));
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
    assert.match(storedBlue, /^user\/images\/tavern_wardrobe\/.+\.png$/);
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
    const shared = { ...blue, id: 'shared', image: storedBlue };
    scriptVariables.wardrobe_items.push(shared);
    api.loadGarments();
    api.deleteGarments(new Set(['blue']));
    assert.equal(imageFiles.has(storedBlue), true, '仍有服装引用时保留原图');
    writesFail = true;
    assert.throws(() => api.deleteGarments(new Set(['shared'])), /存储失败/);
    assert.equal(imageFiles.has(storedBlue), true, '保存失败不删文件');
    writesFail = false;
    api.deleteGarments(new Set(['shared']));
    assert.equal(imageFiles.has(storedBlue), false, '最后一个引用删除后清理文件');
    api.selectItem('red');
    control('[name="garment_name"]').value = red.name;
    control('[name="garment_description"]').value = red.description;
    control('[name="garment_category"]').value = red.category;
    control('[name="garment_group"]').value = '';
    await api.handleGarmentAction({ currentTarget: { dataset: { action: 'remove-image' } } });
    assert.equal(api.state().garments.get('red').image, '', '删除图片保留服装');
    assert.equal(imageFiles.has(storedRed), false);

    // 旧版备份兼容、图片格式及导入中途失败均通过真正的上传与清理函数验证。
    const originalCount = api.state().garments.size;
    const originalFiles = imageFiles.size;
    const imageInput = { files: [new File(['jpeg-bytes'], '上衣.jpg', { type: 'image/jpeg' }), new File(['webp-bytes'], '裙子.webp', { type: 'image/webp' })], value: 'selected' };
    await api.importGarments({ currentTarget: imageInput });
    assert.equal(api.state().garments.size, originalCount + 2);
    const jpgItem = Array.from(api.state().garments.values()).find(item => item.name === '上衣');
    assert.match(jpgItem.image, /\.jpg$/);
    assert.equal(await api.loadImageDataUrl(jpgItem.image), 'data:image/jpeg;base64,anBlZy1ieXRlcw==');
    const webpItem = Array.from(api.state().garments.values()).find(item => item.name === '裙子');
    assert.match(webpItem.image, /\.webp$/);
    assert.equal(await api.loadImageDataUrl(webpItem.image), 'data:image/webp;base64,d2VicC1ieXRlcw==');
    const filesAfterImport = imageFiles.size;
    const stateAfterImport = JSON.stringify(scriptVariables);
    imageInput.files.push({ name: '坏文件.json', type: 'application/json', text: async () => '{bad' });
    await api.importGarments({ currentTarget: imageInput });
    assert.equal(imageFiles.size, filesAfterImport, '读取中途失败清理整批上传');
    assert.equal(JSON.stringify(scriptVariables), stateAfterImport);
    imageInput.files.pop();
    writesFail = true;
    await api.importGarments({ currentTarget: imageInput });
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
    await checkFavorites();
    await checkLibraryBrowsing();
    console.log('通过多选与操作栏显隐、衣柜导出回读、标签存储、可见范围全选、批量归类与角色应用、删除及失败回滚检查。');
    console.log('通过图片落盘、逐张迁移及重试、读取缓存、多模态注入、自包含备份、原图格式及删除和导入回滚检查。');
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
        /** 记录模拟下载链接的地址和文件名；无参数，无返回值。 */
        click() { downloads.push({ href: this.href, name: this.download }); },
        /** 模拟下载链接移除；节点替身不持有父节点，无参数，无返回值。 */
        remove() {},
    };
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
    document.createElement = createLibraryNode;
    document.createDocumentFragment = createLibraryNode;
    const categories = ['all', 'coats', 'favorites', 'recent'].map(category => ({
        dataset: { category }, querySelector: () => control(`count-${category}`),
    }));
    sandbox.testPanel.querySelectorAll = selector => selector === '[data-category]' ? categories : [];
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

main().catch(error => { console.error(error); process.exitCode = 1; });
