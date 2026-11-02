const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');

/**
 * 为分区回归提供最小宿主，保留真实切换、存档、导入导出和发送逻辑。
 * @param {Object} saved 可跨重载复用的脚本变量。
 * @returns {Object} 产品入口、控件、下载与可控制的宿主状态。
 */
function createHost(saved) {
    const controls = new Map();
    const downloads = [];
    const blobs = new Map();
    const deleted = [];
    const state = { fail: false, name: '他人的衣柜', sequence: 0 };
    /** 创建可记录属性的节点；无参数，返回最小 DOM 替身。 */
    function node() {
        return {
            dataset: {}, value: '', children: [],
            append(child) { this.children.push(child); },
            replaceChildren(...children) { this.children = children.flatMap(child => child.children); },
            setAttribute(name, value) { this[name] = value; },
            removeAttribute(name) { delete this[name]; },
            scrollIntoView() {},
            querySelector: control, querySelectorAll: () => [],
            click() { downloads.push({ name: this.download, blob: blobs.get(this.href) }); },
            remove() {},
        };
    }
    /** 按选择器复用控件；参数为选择器，返回可读写节点。 */
    function control(selector) {
        if (!controls.has(selector)) controls.set(selector, node());
        return controls.get(selector);
    }
    const sandbox = {
        window: { parent: {
            document: { createElement: node, createDocumentFragment: node, body: { append() {} } },
            matchMedia: () => ({ matches: false }), AbortController, Blob,
            clearTimeout() {}, setTimeout() {}, confirm: () => true, prompt: () => state.name,
            crypto: { randomUUID: () => `new-${++state.sequence}` },
            URL: { createObjectURL: blob => { const url = `blob:${++state.sequence}`; blobs.set(url, blob); return url; }, revokeObjectURL() {} },
            fetch: async (_url, options) => { deleted.push(JSON.parse(options.body).path); return { ok: true }; },
        } },
        getVariables: options => options.type === 'script' ? saved : { wardrobe_selections: { char: ['mine'] } },
        insertOrAssignVariables(update) {
            if (state.fail) throw new Error('存储失败');
            Object.assign(saved, structuredClone(update));
        },
        SillyTavern: {
            name1: '用户', name2: '角色', getCurrentChatId: () => 'chat', getRequestHeaders: () => ({}),
            getContext: () => ({ chat: [], characterId: 0, characters: [{ avatar: 'card.png' }] }),
        },
        testPanel: { dataset: {}, querySelector: control, querySelectorAll: () => [], setAttribute() {} },
        toastr: { error: message => assert.fail(message) }, console,
    };
    const hooks = `
        panel = testPanel;
        root = { isConnected: true };
        renderGarmentLibrary = () => {};
        renderGarmentDetails = () => {};
        showGarmentDescription = () => {};
        globalThis.api = { loadWardrobeLibraries, loadGarments, selectWardrobeLibrary, activateWardrobeLibrary,
            addWardrobeLibrary, importGarmentFiles, applyGarments, readWearerSelections, selectSelectionScope,
            exportGarments, deleteGarments, injectWardrobeContent, deleteGarmentImages, toggleGarmentFavorite,
            state: () => ({ activeLibraryId, wardrobeLibraries, garments, garmentGroups, currentCategory, currentGroup, garmentSearch, multiSelectMode }),
            busy: value => { importingGarments = value; },
            dirtyFilters: () => { currentCategory = 'coats'; currentGroup = 'mine'; garmentSearch = '旧搜索'; multiSelectMode = true; },
        };
        return;
    `;
    vm.runInNewContext(source.replace('// 等待宿主文档就绪', hooks + '\n// 等待宿主文档就绪'), sandbox);
    sandbox.api.loadWardrobeLibraries();
    sandbox.api.loadGarments();
    return { api: sandbox.api, controls, downloads, deleted, state };
}

test('大分类保留旧衣柜，隔离导入、标签、穿搭、发送、导出和删除，并恢复上次入口', async () => {
    const mine = { id: 'mine', name: '我的外套', category: 'coats', description: '我的独有描述', image: '', groupIds: ['mine-tag'] };
    const saved = { wardrobe_items: [mine], wardrobe_groups: [{ id: 'mine-tag', name: '我的标签' }], wardrobe_send: { content_type: 'text' } };
    const { api, controls, downloads } = createHost(saved);
    assert.deepEqual(Array.from(api.state().wardrobeLibraries.values()), ['SFW', 'NSFW']);
    assert.equal(api.state().garments.get('mine').name, mine.name);
    api.applyGarments(['mine'], 'char');
    api.dirtyFilters();
    api.selectWardrobeLibrary({ target: { closest: () => ({ dataset: { libraryId: 'default-2' } }) } });
    assert.equal(api.state().activeLibraryId, 'default-2');
    assert.equal(api.state().garments.size, 0);
    assert.equal(api.state().garmentGroups.size, 0);
    assert.equal(api.state().currentCategory, 'all');
    assert.equal(api.state().currentGroup, '*');
    assert.equal(api.state().garmentSearch, '');
    assert.equal(api.state().multiSelectMode, false);
    assert.equal(api.readWearerSelections().char.size, 0, '新分区不迁入旧聊天中的归属');
    const foreign = { ...mine, id: 'foreign', name: '他人的裙子', description: '外部独有描述', groupIds: ['foreign-tag'] };
    assert.equal(await api.importGarmentFiles([{ name: '外部.json', text: async () => JSON.stringify({ format: 'tw-wardrobe', version: 1, items: [foreign], groups: [{ id: 'foreign-tag', name: '外部标签' }] }) }]), true);
    const id = api.state().garments.keys().next().value;
    api.toggleGarmentFavorite(id);
    api.applyGarments([id], 'char');
    api.selectSelectionScope({ currentTarget: { value: 'chat' } });
    assert.equal(api.readWearerSelections().char.size, 0);
    api.applyGarments([id], 'char');
    const event = { chat: [{ role: 'user', content: '你好' }], dryRun: false };
    await api.injectWardrobeContent(event);
    assert.match(JSON.stringify(event.chat), /外部独有描述/);
    assert.doesNotMatch(JSON.stringify(event.chat), /我的独有描述/);
    await api.exportGarments(api.state().garments.keys(), true);
    const backup = JSON.parse(await downloads[0].blob.text());
    assert.equal(backup.items.length, 1);
    assert.equal(backup.items[0].name, foreign.name);
    assert.equal(backup.groups[0].name, '外部标签');
    assert.deepEqual(saved.wardrobe_items.map(item => item.id), ['mine']);
    assert.deepEqual(saved.wardrobe_selections.char, ['mine']);
    assert.equal(saved.wardrobe_selection_scope, undefined);
    api.activateWardrobeLibrary('default-1');
    assert.equal(api.readWearerSelections().char.has('mine'), true);
    assert.equal(api.state().garmentGroups.get('mine-tag'), '我的标签');
    api.activateWardrobeLibrary('default-2');
    assert.equal(api.state().garments.get(id).favorite, true);
    assert.equal(api.readWearerSelections().char.has(id), true);
    const reloaded = createHost(saved).api;
    assert.equal(reloaded.state().activeLibraryId, 'default-2');
    assert.equal(reloaded.state().garments.get(id).name, foreign.name);
    api.deleteGarments(new Set([id]));
    assert.equal(api.readWearerSelections().char.size, 0);
    assert.deepEqual(saved.wardrobe_items.map(item => item.id), ['mine']);
    assert.equal(controls.get('.tw-library-tabs').children.length, 2);
});

test('旧默认名称升级为 SFW、NSFW，保留自定义名称和原分区数据', () => {
    const saved = {
        wardrobe_libraries: [{ id: 'default-1', name: '默认大分类1' }, { id: 'default-2', name: '默认大分类2' }, { id: 'custom', name: '默认大分类1' }],
        wardrobe_active_library: 'default-2',
        wardrobe_library_data: { 'default-2': { wardrobe_items: [{ id: 'old', name: '已有服装', description: '', image: '' }], wardrobe_groups: [] } },
    };
    const { api } = createHost(saved);
    assert.deepEqual(Array.from(api.state().wardrobeLibraries.values()), ['SFW', 'NSFW', '默认大分类1']);
    assert.equal(api.state().activeLibraryId, 'default-2');
    assert.equal(api.state().garments.get('old').name, '已有服装');
    api.activateWardrobeLibrary('default-1');
    assert.deepEqual(saved.wardrobe_libraries.map(entry => entry.name), ['SFW', 'NSFW', '默认大分类1']);
});

test('新建、取消和保存失败不覆盖现有分区，其他分区引用的图片不会被回收', async () => {
    const shared = 'user/images/tavern_wardrobe/shared.png';
    const saved = { wardrobe_items: [{ id: 'mine', name: '原图', description: '', image: shared }], wardrobe_groups: [] };
    const { api, state, controls, deleted } = createHost(saved);
    state.name = '   ';
    api.addWardrobeLibrary();
    assert.equal(api.state().wardrobeLibraries.size, 2);
    state.name = '独立衣柜';
    state.fail = true;
    api.addWardrobeLibrary();
    assert.equal(api.state().wardrobeLibraries.size, 2);
    assert.equal(api.state().activeLibraryId, 'default-1');
    assert.match(controls.get('.tw-library-status').textContent, /存储失败/);
    state.fail = false;
    api.addWardrobeLibrary();
    assert.equal(api.state().wardrobeLibraries.size, 3);
    assert.equal(api.state().garments.size, 0);
    assert.equal(createHost(saved).api.state().activeLibraryId, api.state().activeLibraryId);
    await api.deleteGarmentImages([shared, 'user/images/tavern_wardrobe/unused.png']);
    assert.deepEqual(deleted, ['user/images/tavern_wardrobe/unused.png']);
    api.busy(true);
    api.selectWardrobeLibrary({ target: { closest: () => ({ dataset: { libraryId: 'default-1' } }) } });
    assert.notEqual(api.state().activeLibraryId, 'default-1');
    assert.match(controls.get('.tw-library-status').textContent, /等待当前导入/);
});
