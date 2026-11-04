const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

// 与现有测试一样执行产品源代码，仅跳过宿主启动；覆盖合并后新增功能与现有搭配、多标签的交叉路径。
const source = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
const saved = {};
let chat = [];
let chatId = 'chat-a';
let writesFail = false;
const controls = new Map();
const wearerInputs = ['user', 'char'].map(wearer => ({ dataset: { wearer }, disabled: false, checked: false }));
const sendStatus = { textContent: '', dataset: {} };
const sendForm = {
    elements: { content_type: { value: 'text' }, position: { value: 'user_end' }, marker_mode: { value: 'strip' }, send_content_rating: { checked: true } },
    querySelector: () => sendStatus,
};
const sandbox = {
    window: { parent: { document: {}, matchMedia: () => ({ matches: false }), AbortController } },
    SillyTavern: {
        name1: '玩家', name2: '角色', getCurrentChatId: () => chatId,
        getContext: () => ({ chat, characterId: 0, characters: [{ avatar: 'card.png' }] }),
    },
    getVariables: () => saved,
    /** 模拟存档提交及失败；参数为更新对象，无返回值。 */
    insertOrAssignVariables(data) {
        if (writesFail) throw new Error('存储失败');
        Object.assign(saved, structuredClone(data));
    },
    testPanel: {
        /** 获取复用的模拟控件；参数为选择器，返回可记录状态的对象。 */
        querySelector(selector) {
            if (!controls.has(selector)) controls.set(selector, { value: '', textContent: '', dataset: {} });
            return controls.get(selector);
        },
        querySelectorAll: selector => selector === 'input[data-wearer]' ? wearerInputs : [],
    },
    testSendForm: sendForm,
    toastr: { error: message => assert.fail(message) },
    console,
};
const hooks = `
panel = testPanel;
sendForm = testSendForm;
renderGarmentLibrary = () => {};
globalThis.api = {
    loadGarments, readWearerSelections, saveWearerSelections, pruneDeletedSelections, applyGarments,
    resolveCurrentOutfits, readEffectiveSelections, clampCurrentAnchors, renderWearerState,
    matchGarmentByName, matchesGarmentFilter, buildWearerContent, stripOutfitMarkers, injectWardrobeContent,
    loadSendSettings, saveSendSettings,
    select: id => { selectedGarmentId = id; },
    state: () => ({ garments, selectedGarmentId, sendSettings, wardrobeTemplates }),
};
return;
`;
vm.runInNewContext(source.replace('// 等待宿主文档就绪', hooks + '\n// 等待宿主文档就绪'), sandbox);
const api = sandbox.api;
const image = 'data:image/png;base64,aGVsbG8=';
const blue = { id: 'blue', name: '蓝外套', category: 'coats', description: '蓝衣独有描述', image, groupIds: ['summer'] };
const red = { id: 'red', name: '红外套', category: 'coats', description: '红衣独有描述', image, groupIds: ['summer', 'casual'] };
const pants = { id: 'pants', name: '长裤', category: 'bottoms', description: '长裤独有描述', image, groupIds: [] };
const combination = { id: 'combo', name: '日常搭配', category: 'outfits', description: '', image: '', groupIds: ['casual'], componentIds: ['blue', 'pants'] };
const names = { user: '玩家', char: '角色' };

/**
 * 重置有效存档和宿主状态，避免三种范围与三种模式之间互相影响。
 * @returns {void} 加载产品数据并恢复默认发送模式。
 */
function reset() {
    for (const key of Object.keys(saved)) delete saved[key];
    chat = [];
    chatId = 'chat-a';
    saved.wardrobe_items = structuredClone([blue, red, pants, combination]);
    saved.wardrobe_groups = [{ id: 'summer', name: '夏季' }, { id: 'casual', name: '休闲' }];
    saved.wardrobe_selections = {
        user: ['blue', 'red'], char: ['pants'], current: { user: 'blue', char: 'pants' },
        anchor: { user: null, char: null },
    };
    sendForm.elements.marker_mode.value = 'strip';
    sendForm.elements.content_type.value = 'text';
    sendForm.elements.position.value = 'user_end';
    api.loadGarments();
    api.loadSendSettings();
}

/**
 * 验证选择读写清理、手动锚点、历史标记和实际注入，以及搭配成员和多标签兼容。
 * @returns {Promise<void>} 全部同步与异步断言完成后结束。
 */
async function checkCurrentOutfits() {
    reset();
    assert.equal(api.state().selectedGarmentId, 'pants', '加载时优先选中 Char 当前穿着');
    for (const scope of ['global', 'character', 'chat']) {
        saved.wardrobe_selection_scope = scope;
        const selection = api.readWearerSelections();
        selection.user.add('blue');
        selection.current.user = new Set(['blue']);
        selection.anchor.user = { chat: chatId, len: 2 };
        api.saveWearerSelections(selection);
        const loaded = api.readWearerSelections();
        assert.deepEqual(Array.from(loaded.current.user), ['blue'], `${scope} 保存并读取当前穿着`);
        assert.equal(loaded.anchor.user.len, 2, `${scope} 保存并读取锚点`);
    }
    const remaining = new Map(api.state().garments);
    remaining.delete('blue');
    const cleaned = api.pruneDeletedSelections(remaining);
    for (const record of [cleaned.wardrobe_selections, ...Object.values(cleaned.wardrobe_scoped_selections)]) {
        assert.deepEqual(Array.from(record.current.user), [], '删除同步清除各范围当前穿着');
        assert.equal(record.anchor.user.len, 2, '删除保留有效手动锚点');
        assert.ok(!record.user.includes('blue'));
    }
    reset();
    saved.wardrobe_selections.current.user = 'missing';
    saved.wardrobe_selections.anchor.user = { chat: 123, len: -1 };
    assert.equal(api.readWearerSelections().current.user.size, 0, '忽略无效当前穿着');
    assert.equal(api.readWearerSelections().anchor.user, null, '忽略无效锚点');
    delete saved.wardrobe_selections.current;
    delete saved.wardrobe_selections.anchor;
    assert.equal(api.readWearerSelections().current.user.size, 0, '旧存档兼容');
    reset();
    api.applyGarments(['blue'], 'user', true);
    assert.deepEqual(Array.from(saved.wardrobe_selections.current.user), [], '取消应用清理手动当前穿着');

    reset();
    chat = [{ mes: '<!-- outfit:user=红外套 -->' }];
    api.select('blue');
    api.renderWearerState();
    assert.equal(wearerInputs[0].checked, true, '详情继续显示 USER 已分配状态');
    assert.equal(wearerInputs[1].checked, false, '详情继续显示 Char 未分配状态');
    assert.equal(wearerInputs[1].disabled, false, '仍可为另一角色分配服装');
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['red'], '穿着仍由后台自动解析');
    chat.push({ mes: '<!-- outfit:user=红外套 -->' });
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['red'], '后续 AI 旧名称换装仍兼容');
    // 模拟旧版手动存档，验证移除操作入口后仍兼容已有空穿着与聊天锚点。
    saved.wardrobe_selections.current.user = [];
    saved.wardrobe_selections.anchor.user = { chat: chatId, len: chat.length };
    assert.equal(api.readEffectiveSelections().current.user.size, 0, '旧存档的空穿着仍屏蔽更早标记');
    chat.length = 0;
    const selections = api.readWearerSelections();
    api.clampCurrentAnchors(selections);
    assert.equal(saved.wardrobe_selections.anchor.user.len, 0, '删除楼层后收回过大锚点');
    chat.push({ mes: '<!-- outfit:user=蓝外套 --><!-- outfit:user=红外套 --><!-- outfit:user=不存在 -->' });
    chat.push({ is_user: true, mes: '<!-- outfit:user=蓝外套 -->' });
    chat.push({ is_system: true, mes: '<!-- outfit:user=蓝外套 -->' });
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['red'], '忽略用户、系统与无效名称，同楼层取最后有效记录');
    chat[0].mes = '<!-- outfit:user= 蓝 外 套 -->';
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['blue'], '编辑和滑动后的当前楼层直接生效');
    chatId = 'chat-b';
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['blue'], '其他聊天的手动锚点不屏蔽本聊天记录');

    reset();
    for (const content_type of ['text', 'image', 'text_image']) {
        const items = api.state().garments;
        const parts = api.buildWearerContent([items.get('combo'), items.get('blue'), items.get('red')],
            'user', { content_type }, api.state().wardrobeTemplates, names, undefined, new Set(['combo']));
        assert.equal(parts.filter(part => part.type === 'image_url').length, content_type === 'text' ? 0 : 3, '完整候选图保留，独立成员复用已有图号');
        assert.match(parts[0].text, /红外套：夏季、休闲/, '其他候选保留所有标签');
        assert.equal(parts[0].text.includes(red.description), content_type !== 'image', '其他候选按发送类型保留完整描述');
        if (content_type !== 'image') assert.ok(parts[0].text.includes(blue.description) && parts[0].text.includes(pants.description), '搭配沿用成员描述合并');
        const member = api.buildWearerContent([items.get('combo'), items.get('blue')], 'user', { content_type },
            api.state().wardrobeTemplates, names, undefined, new Set(['blue']));
        assert.equal(member.filter(part => part.type === 'image_url').length, content_type === 'text' ? 0 : 2, '显式当前单品与候选搭配共享图号');
        assert.ok(currentText(member[0].text).includes('ID："blue"') && !currentText(member[0].text).includes('长裤'), '候选搭配成员不会被标成当前穿着');
        assert.equal(member[0].text.includes(pants.description), content_type !== 'image', '候选搭配仍携带该发送类型要求的完整资料');
        const incomplete = { ...items.get('red'), description: '', image: '' };
        assert.throws(() => api.buildWearerContent([items.get('combo'), incomplete], 'user', { content_type },
            api.state().wardrobeTemplates, names, undefined, new Set(['combo'])), /缺少/, '已有当前穿着也校验完整候选资料');
    }

    // 冻结原历史以证明剥离只替换发送副本，保留图片、工具字段和用户文本。
    const oldMessage = Object.freeze({ role: 'assistant', tool_calls: [], content: Object.freeze([
        Object.freeze({ type: 'text', text: '历史正文\n<!-- outfit:user=红外套 -->' }),
        Object.freeze({ type: 'image_url', image_url: { url: image } }),
    ]) });
    const userMessage = { role: 'user', content: '<!-- outfit:user=蓝外套 -->' };
    const messages = [oldMessage, userMessage];
    api.stripOutfitMarkers(messages);
    assert.equal(messages[0].content[0].text, '历史正文');
    assert.equal(messages[0].content[1], oldMessage.content[1]);
    assert.equal(messages[0].tool_calls, oldMessage.tool_calls);
    assert.equal(messages[1], userMessage);
    assert.ok(oldMessage.content[0].text.includes('outfit:'));

    // 开关以保存后的配置生效，失败时不能提前影响下一次请求，也不能清掉服装分级。
    reset();
    for (const enabled of [false, true]) {
        sendForm.elements.send_content_rating.checked = enabled;
        api.saveSendSettings({ preventDefault() {} });
        assert.equal(saved.wardrobe_send.send_content_rating, enabled, '保存分级开关');
        sendForm.elements.send_content_rating.checked = !enabled;
        api.loadSendSettings();
        assert.equal(sendForm.elements.send_content_rating.checked, enabled, '重载回填分级开关');
        const event = { chat: [{ role: 'user', content: '继续' }] };
        await api.injectWardrobeContent(event);
        const blocks = event.chat[0].content.filter(part => part.type === 'text');
        assert.equal(blocks.some(part => part.text.includes('内容分级')), enabled, '真实注入遵循已保存开关');
    }
    writesFail = true;
    sendForm.elements.send_content_rating.checked = false;
    api.saveSendSettings({ preventDefault() {} });
    writesFail = false;
    assert.equal(api.state().sendSettings.send_content_rating, true, '保存失败仍使用原开关');
    assert.equal(saved.wardrobe_send.send_content_rating, true, '保存失败保留存档开关');

    for (const mode of ['strip', 'keep', 'off']) {
        reset();
        sendForm.elements.marker_mode.value = mode;
        api.saveSendSettings({ preventDefault() {} });
        assert.equal(saved.wardrobe_send.marker_mode, mode, '表单保存换装模式');
        chat = [{ mes: '<!-- outfit:user=红外套 -->' }, { is_user: true, mes: '继续' }];
        const history = Object.freeze({ role: 'assistant', content: '历史正文\n<!-- outfit:user=红外套 -->' });
        const event = { chat: [history, { role: 'user', content: '继续' }] };
        await api.injectWardrobeContent(event);
        assert.equal(event.chat[0].content.includes('outfit:'), mode === 'keep', '只有保留历史模式发送旧标记');
        const blocks = event.chat[1].content.filter(part => part.type === 'text');
        const userBlock = blocks.find(part => part.text.startsWith('【USER'));
        assert.ok(currentText(userBlock.text).includes(mode === 'off' ? 'ID："blue"' : 'ID："red"'), '各模式选择正确的当前穿着，不能靠候选描述判断');
        assert.equal(blocks.some(part => part.text.includes('（换装记录：')), mode !== 'off', '关闭模式不附新记录说明');
        assert.equal(blocks.filter(part => part.text.includes('（换装记录：')).length, mode === 'off' ? 0 : 1, '记录说明只附一次');
        assert.ok(history.content.includes('outfit:'), '请求处理不改动历史原对象');
    }
    reset();
    chat = [{ mes: '<!-- outfit:user=蓝外套 -->' }, { is_user: true, mes: '继续' }, { mes: '<!-- outfit:user=红外套 -->' }];
    const regeneration = { chat: [{ role: 'assistant', content: chat[0].mes }, { role: 'user', content: '继续' }] };
    await api.injectWardrobeContent(regeneration);
    assert.ok(currentText(regeneration.chat[1].content.find(part => part.text?.startsWith('【USER')).text).includes('ID："blue"'), '重新生成排除即将替换楼层的换装记录');

    // 明确约束注入顺序，防止后续合并把当前解析移到历史剥离之前或提前附说明。
    const injection = source.slice(source.indexOf('async function injectWardrobeContent('), source.indexOf('function loadWardrobeTemplates('));
    const positions = ['isRegeneratingLastReply(', 'stripOutfitMarkers(', 'resolveCurrentOutfits(', 'buildWearerContent(', 'buildMarkerNote('].map(name => injection.indexOf(name));
    assert.ok(positions.every((position, index) => position >= 0 && (index === 0 || position > positions[index - 1])), '注入顺序符合完整补丁');
}

test('当前穿着、换装记录及搭配多标签合并回归', checkCurrentOutfits);

/**
 * 提取独立的当前穿着段落，避免把完整候选资料误当成已经穿上的衣物。
 * @param {string} text 实际发送的服装文字。
 * @returns {string} 当前穿着段落。
 */
function currentText(text) {
    return text.split('\n\n').find(part => part.startsWith('当前实际穿着'));
}

/**
 * 验证三十件衣柜、完整快照、局部换衣、无效记录及整套补充的实际跨轮注入。
 * @returns {Promise<void>} 所有整身选装与连续剧情断言结束后完成。
 */
async function checkMultiItemOutfits() {
    reset();
    const items = [];
    for (const category of ['tops', 'bottoms', 'shoes']) {
        for (let index = 0; index < 10; index++) {
            items.push({ ...blue, id: `${category}-${index}`, name: `${category}服装${index}`, category, description: `${category}独有描述${index}` });
        }
    }
    saved.wardrobe_items = items;
    saved.wardrobe_selections = { user: items.map(item => item.id), char: ['tops-9'], current: { user: [], char: [] } };
    api.loadGarments();
    for (const content_type of ['text', 'image', 'text_image']) {
        const parts = api.buildWearerContent(items, 'user', { content_type }, api.state().wardrobeTemplates, names);
        const text = parts[0].text;
        assert.equal(parts.filter(part => part.type === 'image_url').length, content_type === 'text' ? 0 : 30);
        assert.match(text, /分类：上装/);
        assert.match(text, /分类：下装/);
        assert.match(text, /分类：鞋子/);
        assert.match(text, /一身完整穿搭/);
        assert.match(text, /普通转场不换衣/);
        assert.match(text, /共 30 条候选/);
        for (const item of items) {
            assert.ok(text.includes(`ID：${JSON.stringify(item.id)}`), '三十条候选均有可用于快照的稳定 ID');
            assert.equal(text.includes(item.description), content_type !== 'image', '每条候选按发送类型提供完整资料');
        }
    }
    chat = [{ mes: '<!-- outfit:user=["tops-0","bottoms-0","shoes-0"] --><!-- outfit:char=["tops-9"] -->' }];
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['tops-0', 'bottoms-0', 'shoes-0']);
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.char), ['tops-9'], '两角色快照互不混合');
    chat.push({ is_user: true, mes: '从客厅走到阳台' }, { mes: '她走到阳台。' });
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['tops-0', 'bottoms-0', 'shoes-0'], '普通转场没有记录时保持整身');
    chat.push({ mes: '回家换了上衣。<!-- outfit:user=["tops-1","bottoms-0","shoes-0","tops-1"] -->' });
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['tops-1', 'bottoms-0', 'shoes-0'], '换上衣后裤子与鞋保留，重复 ID 去重');
    for (const invalid of ['["tops-2","missing"]', '["tops-2",3]', '["tops-2",]']) chat.push({ mes: `<!-- outfit:user=${invalid} -->` });
    chat.push({ mes: '<!-- outfit:char=["tops-0"] -->' });
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['tops-1', 'bottoms-0', 'shoes-0'], '坏快照整体忽略，不保留其中有效的局部');
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.char), ['tops-9'], '另一角色的候选不可越权引用');
    chat.push({ is_user: true, mes: '继续' });
    const event = { chat: [{ role: 'assistant', content: '已换装<!-- outfit:user=["tops-1","bottoms-0","shoes-0"] -->' }, { role: 'user', content: '继续' }] };
    await api.injectWardrobeContent(event);
    const block = event.chat[1].content.find(part => part.text?.startsWith('【USER')).text;
    for (const id of ['tops-1', 'bottoms-0', 'shoes-0']) assert.ok(currentText(block).includes(`ID："${id}"`));
    assert.ok(!currentText(block).includes('ID："tops-0"'), '已换下的上衣只作为候选发送');
    assert.ok(block.includes('tops独有描述0'), '下一轮仍有完整其他候选资料');
    assert.match(event.chat[1].content.find(part => part.text?.includes('（换装记录：')).text, /局部换衣也保留未换下的衣物/);
    assert.ok(!event.chat[0].content.includes('outfit:'), '新数组记录也从发送副本中剥离');

    // 三种注入位置都必须携带整身当前穿着，不能只在默认用户消息位置正确。
    for (const position of ['system_end', 'context_end', 'user_end']) {
        sendForm.elements.position.value = position;
        api.saveSendSettings({ preventDefault() {} });
        const request = { chat: [{ role: 'system', content: '系统原文' }, { role: 'user', content: '继续剧情' }] };
        await api.injectWardrobeContent(request);
        const target = request.chat[position === 'system_end' ? 0 : position === 'user_end' ? 1 : 2];
        const text = typeof target.content === 'string' ? target.content : target.content.filter(part => part.type === 'text').map(part => part.text).join('\n\n');
        for (const id of ['tops-1', 'bottoms-0', 'shoes-0']) assert.ok(currentText(text).includes(`ID："${id}"`));
        assert.ok(text.includes('tops独有描述9'), '完整其他候选资料随整身一起注入');
    }
    chat.push({ mes: '<!-- outfit:user=["tops-2","bottoms-0","shoes-0"] -->' });
    const regeneration = { chat: [{ role: 'user', content: '重新生成这轮' }] };
    await api.injectWardrobeContent(regeneration);
    assert.ok(currentText(regeneration.chat[0].content.find(part => part.text?.startsWith('【USER')).text).includes('ID："tops-1"'), '重新生成排除最后一楼的新数组快照');
    chat[chat.length - 1].mes = '<!-- outfit:user=["tops-3","bottoms-0","shoes-0"] -->';
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['tops-3', 'bottoms-0', 'shoes-0'], '滑动或编辑后的多件快照即时生效');
    chat.pop();
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['tops-1', 'bottoms-0', 'shoes-0'], '删除多件快照后回到上一身');

    // 保存、取消分配和删除都必须只移除受影响的记录，不能退回旧的单件状态。
    for (const scope of ['global', 'character', 'chat']) {
        saved.wardrobe_selection_scope = scope;
        const selection = api.readWearerSelections();
        selection.user = new Set(items.map(item => item.id));
        selection.current.user = new Set(['tops-1', 'bottoms-0', 'shoes-0']);
        selection.anchor.user = { chat: chatId, len: chat.length };
        api.saveWearerSelections(selection);
        assert.deepEqual(Array.from(api.readWearerSelections().current.user), ['tops-1', 'bottoms-0', 'shoes-0'], `${scope} 重新读取整身不丢部位`);
    }
    const remaining = new Map(api.state().garments);
    remaining.delete('tops-1');
    const cleaned = api.pruneDeletedSelections(remaining);
    for (const record of [cleaned.wardrobe_selections, ...Object.values(cleaned.wardrobe_scoped_selections)]) {
        assert.deepEqual(Array.from(record.current.user), ['bottoms-0', 'shoes-0'], '跨范围删除只清理该件');
    }
    saved.wardrobe_selection_scope = 'global';
    api.applyGarments(['tops-1'], 'user', true);
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['bottoms-0', 'shoes-0'], '取消分配保留当前裤子和鞋');
    chat.push({ mes: '<!-- outfit:user=[] -->' });
    assert.equal(api.readEffectiveSelections().current.user.size, 0, '显式空快照有效，不恢复更早穿着');

    reset();
    const dress = { ...blue, id: 'dress', name: '连衣裙', category: 'dresses' };
    const shoes = { ...blue, id: 'shoes', name: '鞋子', category: 'shoes' };
    const suit = { ...blue, id: 'suit', name: '正装', category: 'outfits' };
    saved.wardrobe_items.push(dress, shoes, suit);
    saved.wardrobe_selections.user = ['combo', 'blue', 'red', 'dress', 'shoes', 'suit'];
    saved.wardrobe_selections.current.user = ['combo', 'blue', 'red', 'combo'];
    api.loadGarments();
    assert.deepEqual(Array.from(api.readWearerSelections().current.user), ['combo', 'red'], '当前搭配与成员的重复引用在入口合并');
    assert.ok(api.readEffectiveSelections().worn.user.has('pants'), '后台状态仍包含随整套穿着的成员');
    chat = [{ mes: '<!-- outfit:user=["combo","red","blue"] -->' }];
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['combo', 'red'], '搭配快照允许补充独立外套并合并重复成员');
    chat.push({ mes: '<!-- outfit:user=["pants","red"] -->' });
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['combo', 'red'], '仅间接分配的成员不得拆出候选');
    chat.push({ mes: '<!-- outfit:user=["dress","shoes"] -->' });
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['dress', 'shoes'], '连衣裙可配独立鞋');
    chat.push({ mes: '<!-- outfit:user=["suit","shoes"] -->' });
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['suit', 'shoes'], '普通套装可补充独立鞋');
    chat.push({ mes: '<!-- outfit:user=["blue","shoes"] -->' });
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['blue', 'shoes'], '另行分配的成员允许自由选用');
}

test('多件当前穿着、三十件候选与剧情换装快照', checkMultiItemOutfits);
