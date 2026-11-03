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
    const state = { fail: false, name: '他人的衣柜', sequence: 0, writes: 0 };
    /** 创建可记录属性的节点；无参数，返回最小 DOM 替身。 */
    function node() {
        return {
            dataset: {}, value: '', children: [],
            append(child) { this.children.push(child); },
            /** 替换节点并展开文档片段；参数为新子节点，无返回值。 */
            replaceChildren(...children) { this.children = children.flatMap(child => child.fragment ? child.children : [child]); },
            setAttribute(name, value) { this[name] = value; },
            removeAttribute(name) { delete this[name]; },
            scrollIntoView() {},
            /** 模拟菜单未持有焦点；参数为节点，返回是否包含该节点。 */
            contains() { return false; },
            /** 提供菜单关闭后的焦点恢复入口；无参数，无返回值。 */
            focus() {},
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
            document: { createElement: node,
                /** 创建可被父节点展开的片段；无参数，返回片段替身。 */
                createDocumentFragment: () => ({ ...node(), fragment: true }), body: { append() {} } },
            matchMedia: () => ({ matches: false }), AbortController, Blob,
            clearTimeout() {}, setTimeout() {}, confirm: () => true, prompt: () => state.name,
            crypto: { randomUUID: () => `new-${++state.sequence}` },
            URL: { createObjectURL: blob => { const url = `blob:${++state.sequence}`; blobs.set(url, blob); return url; }, revokeObjectURL() {} },
            fetch: async (_url, options) => { deleted.push(JSON.parse(options.body).path); return { ok: true }; },
        } },
        getVariables: options => options.type === 'script' ? saved : { wardrobe_selections: { char: ['mine'] } },
        insertOrAssignVariables(update) {
            if (state.fail) throw new Error('存储失败');
            state.writes++;
            Object.assign(saved, structuredClone(update));
        },
        SillyTavern: {
            name1: '用户', name2: '角色', getCurrentChatId: () => 'chat', getRequestHeaders: () => ({}),
            getContext: () => ({ chat: [], characterId: 0, characters: [{ avatar: 'card.png' }] }),
        },
        testPanel: { dataset: {}, querySelector: control, querySelectorAll: () => [], setAttribute() {} },
        /** 返回模拟的异步弹窗结果；参数为弹窗配置，返回确认结果或输入名称。 */
        testAsk: options => Promise.resolve(options.input === undefined ? true : state.name),
        toastr: { error: message => assert.fail(message) }, console,
    };
    const hooks = `
        panel = testPanel;
        root = { isConnected: true };
        renderGarmentLibrary = () => {};
        renderGarmentDetails = () => {};
        showGarmentDescription = () => {};
        // 此宿主只验证分区业务，弹窗选择异步返回，真实弹窗交互由界面测试覆盖。
        askDialog = testAsk;
        globalThis.api = { loadWardrobeLibraries, loadGarments, selectWardrobeLibrary, activateWardrobeLibrary,
            addWardrobeLibrary, importGarmentFiles, applyGarments, readWearerSelections, selectSelectionScope,
            exportGarments, deleteGarments, injectWardrobeContent, deleteGarmentImages, toggleGarmentFavorite,
            moveGarmentsToLibrary, renderBulkMenu, handleBulkMenu,
            state: () => ({ activeLibraryId, wardrobeLibraries, garments, garmentGroups, checkedGarmentIds, selectedGarmentId, currentCategory, currentGroup, garmentSearch, multiSelectMode }),
            /** 指定批量勾选；参数为服装标识数组，无返回值。 */
            check: ids => { checkedGarmentIds.clear(); for (const id of ids) checkedGarmentIds.add(id); multiSelectMode = true; },
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
    await api.deleteGarments(new Set([id]));
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
    await api.addWardrobeLibrary();
    assert.equal(api.state().wardrobeLibraries.size, 2);
    state.name = '独立衣柜';
    state.fail = true;
    await api.addWardrobeLibrary();
    assert.equal(api.state().wardrobeLibraries.size, 2);
    assert.equal(api.state().activeLibraryId, 'default-1');
    assert.match(controls.get('.tw-library-status').textContent, /存储失败/);
    state.fail = false;
    await api.addWardrobeLibrary();
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

test('从移动菜单将 NSFW 服装移入 SFW，保留资料并清理原衣柜全部范围的应用', async () => {
    const item = { id: 'same', name: '待移动外套', category: 'coats', description: '保留描述', image: 'user/images/tavern_wardrobe/move.png',
        groupIds: ['home', 'collision'], contentRating: 'nsfw', favorite: true, lastUsedAt: 123 };
    const other = { ...item, id: 'stay', name: '留在原衣柜', groupIds: [] };
    const choices = { user: ['same', 'stay'], char: ['same'], current: { user: ['same', 'stay'], char: ['same'] },
        anchor: { user: { chat: 'chat', len: 0 }, char: null } };
    const targetChoices = { user: [], char: ['same'] };
    const saved = {
        wardrobe_active_library: 'default-2', wardrobe_send: { content_type: 'text' },
        wardrobe_items: [{ ...other, id: 'same', name: '目标原有服装' }],
        wardrobe_groups: [{ id: 'target-home', name: '居家', filters: ['tops'] }, { id: 'collision', name: '目标独有标签' }],
        wardrobe_selections: targetChoices,
        wardrobe_library_data: { 'default-2': { wardrobe_items: [item, other],
            wardrobe_groups: [{ id: 'home', name: '居家', filters: ['coats'] }, { id: 'collision', name: '源标签', filters: ['favorites'] }],
            wardrobe_selections: choices, wardrobe_scoped_selections: { character: choices, chat: choices }, wardrobe_selection_scope: 'chat' } },
    };
    const { api, state, controls, deleted } = createHost(saved);
    api.check(['same']);
    api.renderBulkMenu('library');
    const entries = controls.get('[data-menu="library"]').children;
    assert.deepEqual(entries.map(entry => entry.children[0].textContent), ['SFW'], '移动菜单只列出其他衣柜');
    assert.equal(entries[0].role, 'menuitem');
    assert.equal(entries[0]['aria-checked'], undefined, '移动目标是动作而非勾选项');
    const writes = state.writes;
    api.handleBulkMenu({ target: { closest: selector => selector === '.tw-menu-item' ? entries[0] : null } });
    assert.match(controls.get('.tw-library-status').textContent, /已移动 1 件服装到“SFW”/);
    assert.equal(state.writes - writes, 1, '源和目标必须一次提交');
    assert.equal(api.state().activeLibraryId, 'default-2', '移动完成后留在原衣柜');
    assert.deepEqual(Array.from(api.state().garments.keys()), ['stay']);
    assert.equal(api.state().checkedGarmentIds.size, 0);
    const moved = saved.wardrobe_items.find(record => record.name === item.name);
    assert.notEqual(moved.id, 'same', '与目标现有 ID 冲突时分配新 ID');
    assert.equal(saved.wardrobe_items[0].name, '目标原有服装');
    for (const key of ['name', 'category', 'description', 'image', 'contentRating', 'favorite', 'lastUsedAt']) assert.equal(moved[key], item[key]);
    assert.equal(moved.groupIds[0], 'target-home', '同名标签复用目标 ID');
    assert.notEqual(moved.groupIds[1], 'collision', '不同名标签的 ID 冲突不覆盖原标签');
    assert.deepEqual(saved.wardrobe_groups.find(group => group.id === 'target-home').filters, ['tops', 'coats']);
    assert.equal(saved.wardrobe_groups.find(group => group.id === moved.groupIds[1]).name, '源标签');
    assert.equal(saved.wardrobe_groups.find(group => group.id === 'collision').name, '目标独有标签');
    assert.deepEqual(saved.wardrobe_selections, targetChoices, '不改动目标已有应用，不自动应用新服装');
    const source = saved.wardrobe_library_data['default-2'];
    for (const record of [source.wardrobe_selections, ...Object.values(source.wardrobe_scoped_selections)]) {
        assert.deepEqual(record.user, ['stay']);
        assert.deepEqual(record.char, []);
        assert.deepEqual(record.current.user, ['stay']);
        assert.deepEqual(record.current.char, []);
        assert.deepEqual(record.anchor.user, { chat: 'chat', len: 0 });
    }
    assert.equal(source.wardrobe_selection_scope, 'chat');
    assert.deepEqual(saved.wardrobe_send, { content_type: 'text' });
    assert.deepEqual(deleted, [], '移动不得回收原图');
    const reloadedHost = createHost(saved);
    const reloaded = reloadedHost.api;
    reloaded.activateWardrobeLibrary('default-1');
    assert.equal(reloaded.state().garments.get(moved.id).image, item.image);
    assert.equal(reloaded.readWearerSelections().char.has(moved.id), false);
    await reloaded.deleteGarmentImages([item.image]);
    assert.deepEqual(reloadedHost.deleted, [], '目标衣柜继续引用原图，不会被回收');
});

test('SFW 与自定义衣柜双向移动，搭配成员去重并重映射，保留其他分区', () => {
    const member = { id: 'member', name: '单品', description: '成员描述', image: '', groupIds: [] };
    const combination = { ...member, id: 'look', name: '搭配', componentIds: ['member'] };
    const untouched = { wardrobe_items: [{ ...member, id: 'third' }], wardrobe_groups: [] };
    const saved = { wardrobe_items: [member, combination], wardrobe_groups: [],
        wardrobe_libraries: [{ id: 'default-1', name: 'SFW' }, { id: 'default-2', name: 'NSFW' }, { id: 'custom', name: '<自定义衣柜>' }],
        wardrobe_library_data: { 'default-2': untouched, custom: { wardrobe_items: [member, combination], wardrobe_groups: [] } } };
    const { api, controls } = createHost(saved);
    api.check(['look', 'member']);
    api.renderBulkMenu('library');
    assert.deepEqual(controls.get('[data-menu="library"]').children.map(entry => entry.children[0].textContent), ['NSFW', '<自定义衣柜>']);
    api.moveGarmentsToLibrary('custom');
    assert.equal(saved.wardrobe_items.length, 0);
    assert.equal(api.state().selectedGarmentId, null, '全部移走后清空预览');
    assert.equal(saved.wardrobe_library_data.custom.wardrobe_items.length, 4, '选中搭配和成员不会重复移动');
    assert.deepEqual(saved.wardrobe_library_data['default-2'], untouched);
    api.activateWardrobeLibrary('custom');
    const movedLook = Array.from(api.state().garments.values()).find(item => item.componentIds && item.id !== 'look');
    assert.notEqual(movedLook.componentIds[0], 'member');
    assert.equal(api.state().garments.get(movedLook.componentIds[0]).name, '单品');
    api.check([movedLook.id]);
    api.moveGarmentsToLibrary('default-1');
    assert.equal(saved.wardrobe_items.length, 2, '只选搭配也会带上成员');
    assert.equal(saved.wardrobe_library_data.custom.wardrobe_items.length, 2, '目标原有搭配不受移动影响');
    assert.equal(saved.wardrobe_items.find(item => item.componentIds).componentIds[0], movedLook.componentIds[0]);
    assert.doesNotThrow(() => createHost(saved).api.activateWardrobeLibrary('default-1'), '重载时两侧搭配关系都有效');
});

test('被其他搭配引用、目标无效、存储失败和导入进行中均保留原数据与勾选，失败后可重试', () => {
    const member = { id: 'member', name: '成员', description: '', image: '', groupIds: [] };
    const saved = { wardrobe_items: [member, { ...member, id: 'look', name: '相关搭配', componentIds: ['member'] }], wardrobe_groups: [] };
    const { api, state, controls } = createHost(saved);
    api.check(['member']);
    const before = JSON.stringify(saved);
    assert.throws(() => api.moveGarmentsToLibrary('default-2'), /相关搭配/);
    assert.equal(JSON.stringify(saved), before);
    assert.deepEqual(Array.from(api.state().checkedGarmentIds), ['member']);
    api.check(['look']);
    assert.throws(() => api.moveGarmentsToLibrary('default-1'), /其他衣柜/);
    assert.throws(() => api.moveGarmentsToLibrary('missing'), /其他衣柜/);
    api.busy(true);
    assert.throws(() => api.moveGarmentsToLibrary('default-2'), /等待当前导入/);
    api.busy(false);
    state.fail = true;
    const entry = { dataset: { engine: 'library', value: 'default-2' } };
    api.handleBulkMenu({ target: { closest: selector => selector === '.tw-menu-item' ? entry : null } });
    assert.match(controls.get('.tw-library-status').textContent, /存储失败/);
    assert.equal(JSON.stringify(saved), before);
    assert.equal(api.state().garments.size, 2);
    assert.equal(api.state().selectedGarmentId, 'member');
    assert.deepEqual(Array.from(api.state().checkedGarmentIds), ['look']);
    state.fail = false;
    api.moveGarmentsToLibrary('default-2');
    assert.equal(saved.wardrobe_items.length, 0);
    assert.equal(saved.wardrobe_library_data['default-2'].wardrobe_items.length, 2);
});
