const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
const scriptVariables = {};
const chatVariables = {};
const controls = new Map();
const downloads = [];
const blobs = new Map();
let writesFail = false;
let sequence = 0;
let confirmation = true;
let promptValue = '';
let chatId = 'chat';

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
        document, matchMedia: () => ({ matches: false }), Blob,
        crypto: { randomUUID: () => `new-${++sequence}` },
        URL: { createObjectURL: blob => { const url = `blob:${++sequence}`; blobs.set(url, blob); return url; }, revokeObjectURL: url => blobs.delete(url) },
        confirm: () => confirmation, prompt: () => promptValue,
    } },
    getVariables: option => option.type === 'script' ? scriptVariables : chatVariables,
    insertOrAssignVariables: (data, option) => {
        if (writesFail) throw new Error('存储失败');
        Object.assign(option.type === 'script' ? scriptVariables : chatVariables, structuredClone(data));
    },
    SillyTavern: { getCurrentChatId: () => chatId },
    toastr: { error() {} },
    testPanel: { querySelector: control, querySelectorAll: () => [] },
};
vm.createContext(sandbox);
const hooks = `
panel = testPanel;
root = { isConnected: true };
refreshWardrobe = () => {};
renderGarmentLibrary = () => {};
const actualRenderBulkState = renderBulkState;
renderBulkState = () => {};
showGarmentDescription = () => {};
globalThis.api = { parseWardrobeData, loadGarments, exportGarments, importGarments, applyGarments,
    deleteGarments, addGarmentGroup, deleteGarmentGroup, moveCheckedGarments, selectAllGarments,
    readWearerSelections, handleBulkAction, toggleMultiSelect, checkGarment, renderBulkState: actualRenderBulkState,
    state: () => ({ garments, garmentGroups, currentGroup, selectedGarmentId, checkedGarmentIds, multiSelectMode }),
    selectGroup: id => { currentGroup = id; },
    showIds: ids => { visibleGarmentIds = new Set(ids); },
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
    api.loadGarments();
    assert.equal(api.state().garments.get('blue').groupId, 'slim');
    assert.equal(api.parseWardrobeData({ groups: [], items: [{ ...red, groupId: undefined }] }).items.get('red').groupId, '', '旧服装默认未分组');
    assert.throws(() => api.parseWardrobeData({ groups: [], items: [{ ...red, image: 'https://bad.test/a.png' }] }), /有效图片/);
    assert.throws(() => api.parseWardrobeData({ groups: [], items: [red, red] }), /标识重复/);

    api.applyGarments(['blue', 'red'], 'user');
    api.applyGarments(['blue'], 'char');
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
    chatId = '';
    assert.throws(() => api.applyGarments(['blue'], 'char'), /打开一个聊天/);
    chatId = 'chat';

    api.exportGarments(api.state().garments.keys(), true);
    const exported = JSON.parse(await blobs.get(downloads[0].href).text());
    assert.equal(downloads[0].name, '衣柜-2件.json');
    assert.equal(exported.groups.length, 2, '整库备份保留空标签');
    assert.equal(api.parseWardrobeData(exported).items.get('blue').image, blue.image, '导出包含原始图片');
    api.exportGarments(['blue']);
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
        api.handleBulkAction({ type: 'change', currentTarget: select });
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
    const beforeApply = JSON.stringify(chatVariables);
    assert.throws(() => api.applyGarments(['blue', 'missing-description'], 'char'), /红色外套.*描述/);
    assert.equal(JSON.stringify(chatVariables), beforeApply, '一件无效时整批不写入');
    confirmation = false;
    api.deleteGarments(new Set(['blue', 'red']));
    assert.equal(api.state().garments.has('blue'), true, '取消删除保留原数据');
    confirmation = true;
    writesFail = true;
    assert.throws(() => api.deleteGarments(new Set(['blue'])), /存储失败/);
    assert.equal(api.state().garments.has('blue'), true, '存储失败不能删除内存数据');
    writesFail = false;
    api.deleteGarments(new Set(['blue', 'red']));
    assert.equal(api.state().garments.has('blue'), false);
    assert.equal(api.readWearerSelections().user.size, 0, '删除同步清理 USER 应用');
    assert.equal(api.readWearerSelections().char.size, 0, '删除同步清理 Char 应用');
    assert.equal(scriptVariables.wardrobe_items.some(item => item.id === 'blue'), false);
    api.loadGarments();
    assert.equal(api.state().garmentGroups.get(newGroup), '新款', '重载保留标签');
    assert.equal(api.state().garments.has('blue'), false, '重载后删除仍然有效');
    console.log('通过多选与操作栏显隐、衣柜导出回读、标签存储、可见范围全选、批量归类与角色应用、删除及失败回滚检查。');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
