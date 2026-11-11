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
let messageVariableReads = 0;
let messageVariableWrites = 0;
const controls = new Map();
const wearerInputs = ['user', 'char'].map(wearer => ({ dataset: { wearer }, disabled: false, checked: false }));
const sendStatus = { textContent: '', dataset: {} };
const sendForm = {
    elements: { content_type: { value: 'text' }, position: { value: 'user_end' }, marker_mode: { value: 'strip' }, outfit_history_count: { value: '2' }, image_quality: { value: 'compressed' } },
    querySelector: () => sendStatus,
};
const outfitStatus = { textContent: '', dataset: {} };
const outfitForm = {
    elements: {
        prompt: { value: '' },
        /** 模拟按字段名获取控件；参数为字段名，返回输入框。 */
        namedItem(name) { return this[name]; },
    },
    /** 模拟选装提示词的原生必填校验；无参数，返回表单是否有效。 */
    reportValidity() { return Boolean(this.elements.prompt.value); },
    querySelector: () => outfitStatus,
};
const ratingStatus = { textContent: '', dataset: {} };
const ratingForm = {
    ...outfitForm,
    elements: { prompt: { value: '' }, send_content_rating: { checked: true } },
    querySelector: () => ratingStatus,
};
const sandbox = {
    window: { parent: { document: {}, matchMedia: () => ({ matches: false }), AbortController, crypto: require('node:crypto').webcrypto } },
    SillyTavern: {
        name1: '玩家', name2: '角色', getCurrentChatId: () => chatId,
        getContext: () => ({ chat, characterId: 0, characters: [{ avatar: 'card.png' }] }),
        /** 模拟酒馆从文本块和聊天补全回复提取正文；参数为响应体与 API 类型，返回正文。 */
        extractMessageFromData(data, apiType) {
            assert.equal(apiType, 'openai');
            return data?.content?.find(part => part.type === 'text')?.text ?? data?.choices?.[0]?.message?.content;
        },
    },
    getScriptId: () => 'wardrobe-test',
    /** 记录整楼变量读取次数；参数为变量作用域，返回当前存档。 */
    getVariables(option) {
        if (option.type !== 'message') return saved;
        messageVariableReads++;
        const floor = chat[option.message_id];
        return floor.variables?.[floor.swipe_id ?? 0] ?? {};
    },
    /** 模拟存档提交及失败；参数为更新对象，无返回值。 */
    insertOrAssignVariables(data, option) {
        if (writesFail) throw new Error('存储失败');
        if (option.type === 'message') messageVariableWrites++;
        const floor = chat[option.message_id];
        const target = option.type === 'message' ? ((floor.variables ??= [])[floor.swipe_id ?? 0] ??= {}) : saved;
        Object.assign(target, structuredClone(data));
    },
    /** 模拟按楼层写入原文和当前回复页；参数为更新列表及刷新选项，保存后完成。 */
    async setChatMessages(updates, options) {
        assert.equal(options.refresh, 'none', '写入隐藏注释时不重复发送渲染事件');
        for (const { message_id, message } of updates) {
            const reply = chat[message_id];
            reply.mes = message;
            reply.swipes[reply.swipe_id] = message;
        }
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
    testOutfitForm: outfitForm,
    testRatingForm: ratingForm,
    toastr: { error: message => assert.fail(message) },
    console,
};
const hooks = `
panel = testPanel;
sendForm = testSendForm;
outfitForm = testOutfitForm;
ratingForm = testRatingForm;
renderGarmentLibrary = () => {};
loadSendImageDataUrl = async (image, quality) => quality === 'original' ? image : '压缩:' + image;
globalThis.api = {
    loadGarments, readWearerSelections, saveWearerSelections, pruneDeletedSelections, applyGarments,
    resolveCurrentOutfits, readEffectiveSelections, clampCurrentAnchors, renderWearerState,
    matchGarmentByName, matchesGarmentFilter, buildWearerContent, stripOutfitMarkers, injectWardrobeContent,
    markOutfitChatPrompt, applyIsolatedOutfits, publishOutfitSnapshot, parseOutfitSnapshot, stopOutfitRequest,
    loadSendSettings, saveSendSettings, loadOutfitSettings, saveOutfitSettings, restorePromptDefaults, saveRatingSettings,
    wardrobeLogs,
    /** 替换已保存的模拟连接；参数为连接配置，无返回值。 */
    setApiConnection(config) { savedApiSettings = config; },
    /** 控制主请求读图等待；参数为图片读取函数，无返回值。 */
    setImageLoader(loader) { loadSendImageDataUrl = loader; },
    /** 模拟切换衣柜；参数为新分区标识，无返回值。 */
    setLibrary(id) { activeLibraryId = id; },
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
    api.loadOutfitSettings();
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
    const defaultPrompt = outfitForm.elements.prompt.value;
    const customPrompt = '优先选择适合室内的衣服。';
    const ratingPrompt = '分级仅供剧情选装参考。';
    outfitForm.elements.prompt.value = customPrompt;
    api.saveOutfitSettings({ preventDefault() {}, currentTarget: outfitForm });
    const submitRating = { preventDefault() {}, currentTarget: ratingForm };
    for (const enabled of [false, true]) {
        ratingForm.elements.send_content_rating.checked = enabled;
        ratingForm.elements.prompt.value = `  ${ratingPrompt}  `;
        sendForm.elements.position.value = 'context_end';
        api.saveRatingSettings(submitRating);
        assert.equal(saved.wardrobe_send.send_content_rating, enabled, '保存分级开关');
        assert.equal(saved.wardrobe_send.position, 'user_end', '服装分级页只保存本页的修改');
        assert.equal(saved.wardrobe_send.content_rating_prompt, ratingPrompt);
        sendForm.elements.position.value = 'user_end';
        ratingForm.elements.send_content_rating.checked = !enabled;
        ratingForm.elements.prompt.value = '未保存的提示词';
        api.saveSendSettings({ preventDefault() {} });
        assert.equal(saved.wardrobe_send.send_content_rating, enabled, '发送内容页只沿用已保存的分级');
        api.loadSendSettings();
        api.loadOutfitSettings();
        assert.equal(ratingForm.elements.send_content_rating.checked, enabled, '重载回填分级开关');
        assert.equal(ratingForm.elements.prompt.value, ratingPrompt, '重载回填分级提示词');
        assert.equal(outfitForm.elements.prompt.value, customPrompt, '重载回填选装提示词');
        const event = { chat: [{ role: 'user', content: '继续' }] };
        await api.injectWardrobeContent(event);
        const blocks = event.chat[0].content.filter(part => part.type === 'text');
        assert.equal(blocks.some(part => part.text.includes('内容分级')), enabled, '真实注入遵循已保存开关');
        const prompt = blocks.map(part => part.text).join('\n\n');
        assert.ok(prompt.includes(`\n\n${customPrompt}\n\n（换装记录：`) && !prompt.includes(defaultPrompt), '直接聊天原样使用自定义提示词');
        assert.equal(prompt.split(customPrompt).length - 1, 1, '两个角色只发送一份选装提示词');
        assert.equal(prompt.split(ratingPrompt).length - 1, enabled ? 1 : 0, '分级提示词开启时只发送一份');
    }
    ratingForm.elements.send_content_rating.checked = false;
    ratingForm.elements.prompt.value = '  ';
    api.saveRatingSettings(submitRating);
    assert.equal(saved.wardrobe_send.send_content_rating, true, '空提示词不提交分级更改');
    writesFail = true;
    ratingForm.elements.prompt.value = '保存失败的提示词';
    api.saveRatingSettings(submitRating);
    writesFail = false;
    assert.equal(api.state().sendSettings.send_content_rating, true, '保存失败仍使用原开关');
    assert.equal(saved.wardrobe_send.send_content_rating, true, '保存失败保留存档开关');
    assert.equal(saved.wardrobe_send.content_rating_prompt, ratingPrompt, '保存失败保留原分级提示词');
    assert.equal(ratingStatus.dataset.error, 'true');

    // 恢复默认先提供可编辑预览，保存后才切换请求并清除固定的自定义值。
    const submitOutfit = { preventDefault() {}, currentTarget: outfitForm };
    api.restorePromptDefaults({ currentTarget: { form: outfitForm, dataset: { promptDefaults: 'outfit' } } });
    assert.equal(outfitForm.elements.prompt.value, defaultPrompt);
    assert.match(outfitStatus.textContent, /保存后生效/);
    writesFail = true;
    api.saveOutfitSettings(submitOutfit);
    writesFail = false;
    assert.equal(saved.wardrobe_outfit_prompt, customPrompt, '恢复默认保存失败时仍保留自定义存档');
    const beforeRestore = { chat: [{ role: 'user', content: '继续' }] };
    await api.injectWardrobeContent(beforeRestore);
    assert.match(beforeRestore.chat[0].content.map(part => part.text).join('\n'), /优先选择适合室内的衣服/);
    api.saveOutfitSettings(submitOutfit);
    assert.equal(saved.wardrobe_outfit_prompt, null, '默认模式不固定保存当前版本的提示词');
    api.loadOutfitSettings();
    assert.equal(outfitForm.elements.prompt.value, defaultPrompt, '重新加载仍采用脚本默认词');
    const afterRestore = { chat: [{ role: 'user', content: '继续' }] };
    await api.injectWardrobeContent(afterRestore);
    assert.ok(afterRestore.chat[0].content.some(part => part.text?.includes(defaultPrompt)), '恢复后请求使用默认提示词');

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
    assert.match(event.chat[1].content.find(part => part.text?.includes('（换装记录：')).text,
        /普通转场或时间变化本身不触发换装[\s\S]*局部换衣也保留未换下的衣物[\s\S]*一身完整穿搭/);
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

/**
 * 验证剧情衣着的延续、两种发送方式的规则，以及独立选装只在穿搭资料变化时写注释。
 * @returns {Promise<void>} 发送请求及楼层注释断言完成后结束。
 */
async function checkStoryOutfitContinuity() {
    reset();
    saved.wardrobe_items.push(
        { id: 'socks', name: '丝滑长袜', category: 'socks', description: '有光泽的丝滑长袜', image: '' },
        { id: 'heels', name: '尖头高跟鞋', category: 'shoes', description: '尖头细跟鞋', image: '' },
    );
    saved.wardrobe_selections = { user: [], char: ['socks', 'heels'], current: { user: [], char: [] } };
    api.loadGarments();
    const opening = '她下班直接过来，穿着黑色中裙、LV 花色丝巾、短袜和平底鞋。';
    const followUp = '我请她坐下，问她今天工作怎么样。';
    const ratingAfterContinuity = /分级和场景分档只在允许选装时用于选择候选。\n\n服装内容分级/;
    chat = [{ mes: opening }, { is_user: true, mes: followUp }];
    const direct = { chat: [{ role: 'assistant', content: opening }, { role: 'user', content: followUp }] };
    await api.injectWardrobeContent(direct);
    assert.equal(direct.chat[0].content, opening);
    assert.match(currentText(direct.chat[1].content), /没有衣柜穿着记录，请沿用剧情中已明确的衣着/);
    assert.match(direct.chat[1].content, /开场白、剧情设定或前文已明确穿着[\s\S]*不能因此从候选中选装、补齐或用相似款替代/);
    assert.match(direct.chat[1].content, /口语点选衣物，也算要求局部换装/);
    assert.match(direct.chat[1].content, /时间变化本身不触发换装；回家或仅为换衣做准备也不触发/);
    assert.match(direct.chat[1].content, ratingAfterContinuity, '直接发送先判断换装时机，再应用分级提示词');
    assert.match(direct.chat[1].content, /沿用剧情既有穿着且衣柜记录没有变化时省略注释/);
    assert.doesNotMatch(direct.chat[1].content, /尚未确定，请结合剧情/);

    sendForm.elements.marker_mode.value = 'isolated';
    api.saveSendSettings({ preventDefault() {} });
    api.setApiConnection({ mode: 'host' });
    const received = [];
    sandbox.SillyTavern.getRequestHeaders = () => ({ 'Content-Type': 'application/json' });
    /** 捕获模型收到的选装指令；参数为请求路径与选项，返回模拟模型响应。 */
    sandbox.window.parent.fetch = async (_url, options) => {
        received.push(JSON.parse(options.body));
        const content = received.length === 2 ? '{"char":["socks","heels"]}' : '{}';
        return new Response(JSON.stringify({ choices: [{ message: { content } }] }));
    };
    const request = { messages: [{ role: 'assistant', content: opening }, { role: 'user', content: followUp }] };
    api.markOutfitChatPrompt({ prompt: request.messages }, false);
    await api.applyIsolatedOutfits(request);
    const [instructions, scenario] = received[0].messages;
    assert.match(instructions.content, /继续穿衣柜外服装的角色；全部保持则返回 \{\}/);
    assert.doesNotMatch(instructions.content, /尚无穿着时选择最合适/);
    assert.deepEqual(JSON.parse(scenario.content.split('\n')[1]).map(floor => floor.content), [opening, followUp]);
    assert.match(scenario.content, /开场白、剧情设定或前文已明确穿着[\s\S]*不能因此从候选中选装、补齐或用相似款替代/);
    assert.match(scenario.content, /时间变化本身不触发换装；回家或仅为换衣做准备也不触发/);
    assert.match(scenario.content, ratingAfterContinuity, '独立选装先判断换装时机，再应用分级提示词');
    assert.deepEqual(structuredClone(request.messages), [{ role: 'assistant', content: opening }, { role: 'user', content: followUp }]);
    assert.equal(api.readEffectiveSelections().current.char.size, 0, '沿用开场穿着时没有候选被记为当前穿着');

    const change = '要那个就是你以前穿的那个袜子滑滑的，还有高高的鞋子。';
    chat.push({ mes: '她坐下聊起工作。' }, { is_user: true, mes: change });
    const changed = { type: 'normal', messages: [{ role: 'user', content: change }] };
    const prepared = { prompt: changed.messages };
    api.markOutfitChatPrompt(prepared, false);
    changed.messages = structuredClone(prepared.prompt);
    await api.applyIsolatedOutfits(changed);
    assert.equal(received.length, 2, '宿主复制消息对象后仍发出独立选装请求');
    assert.match(received[1].messages[1].content, /口语点选衣物，也算要求局部换装/);
    assert.equal(JSON.parse(received[1].messages[1].content.split('\n')[1]).at(-1).content, change);
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.char), ['socks', 'heels']);
    assert.match(changed.messages[0].content, /本轮未换下的衣柜外衣物、鞋袜和配饰继续保留[\s\S]*丝滑长袜[\s\S]*尖头细跟鞋/);
    assert.deepEqual(structuredClone(changed.messages[1]), { role: 'user', content: change }, '临时标记不会进入主请求');
    const reply = { mes: '她换上了长袜和高跟鞋。', swipe_id: 0, swipes: ['她换上了长袜和高跟鞋。'] };
    chat.push(reply);
    await api.publishOutfitSnapshot(chat.length - 1, 'normal');
    assert.match(reply.mes, /<!-- outfit:char=\{"ids":\["socks","heels"\]/);
    assert.equal(reply.swipes[0], reply.mes, '注释写入当前回复页');

    const praise = '真的很滑，还很舒服。';
    chat.push({ is_user: true, mes: praise });
    const continued = { type: 'normal', messages: [{ role: 'assistant', content: reply.mes }, { role: 'user', content: praise }] };
    api.markOutfitChatPrompt({ prompt: continued.messages }, false);
    await api.applyIsolatedOutfits(continued);
    assert.equal(received.length, 3, '新楼层仍由独立接口判断是否换装');
    assert.match(continued.messages[0].content, /当前穿着[\s\S]*丝滑长袜[\s\S]*尖头细跟鞋/);
    assert.doesNotMatch(JSON.stringify(continued.messages), /<!-- outfit:/, '前一楼的注释不会随主请求发送');
    assert.doesNotMatch(JSON.stringify(received[2].messages), /<!-- outfit:/, '前一楼的注释也不会随独立请求发送');
    const ordinaryText = '她继续和你聊天。';
    const ordinary = { mes: ordinaryText, swipe_id: 0, swipes: [ordinaryText] };
    chat.push(ordinary);
    await api.publishOutfitSnapshot(chat.length - 1, 'normal');
    assert.equal(ordinary.mes, ordinaryText, '沿用同一身时，后续 AI 回复不重复写入注释');
    assert.match(reply.mes, /<!-- outfit:char=/, '已有注释留在首次记录对应穿搭的楼层');

    const unchangedNote = reply.mes.slice(reply.mes.indexOf('<!-- outfit:'));
    const stages = [
        { ids: ['heels', 'socks'], copied: unchangedNote, expected: undefined },
        { ids: ['socks'], expected: ['socks'] },
        { ids: [], expected: [] },
        { ids: [], expected: undefined },
    ];
    for (const { ids, copied, expected } of stages) {
        const userFloor = { is_user: true, mes: '下一轮', variables: [{ 'wardrobe_outfit:wardrobe-test:default-1': { char: ids } }] };
        const mes = copied ? `${ordinaryText}\n\n${copied}` : ordinaryText;
        const aiFloor = { mes, swipe_id: 0, swipes: [mes] };
        chat.push(userFloor, aiFloor);
        await api.publishOutfitSnapshot(chat.length - 1, 'normal');
        const note = aiFloor.mes.match(/<!-- outfit:char=(.*?) -->/)?.[1];
        assert.deepEqual(note && JSON.parse(note).ids, expected, '只重排时清除照抄的注释，真正换装或清空时各记录一次');
        assert.equal(aiFloor.swipes[0], aiFloor.mes, '写回当前回复页的正文和注释保持一致');
    }
}

test('开场白已有穿着时普通回复不要求首次选装，明确局部换装保留原有衣物', checkStoryOutfitContinuity);

/**
 * 通过酒馆发送事件与 HTTP 模拟验证独立选装、楼层数配置与辅助生成复用穿搭。
 * @returns {Promise<void>} 选装、失败和重生成断言完成后结束。
 */
async function checkIsolatedOutfits() {
    reset();
    sendForm.elements.marker_mode.value = 'isolated';
    api.saveSendSettings({ preventDefault() {} });
    const history = [
        { is_user: true, mes: '第一条旧剧情' },
        { mes: '第二条旧剧情' },
        { is_user: true, mes: '最近用户楼层' },
        { mes: '最近角色楼层\n<!-- outfit:char=["pants"] -->' },
        { is_system: true, mes: '隐藏楼层' },
        { is_user: true, mes: '本次输入' },
    ];
    chat = history.slice();
    const userMessage = Object.freeze({ role: 'user', content: '本次输入' });
    const received = [];
    let reply = '{"user":["red"]}';
    let warnings = 0;
    sandbox.toastr.warning = () => { warnings++; };
    sandbox.generateRaw = () => assert.fail('选装不能触发酒馆助手的生成事件');
    sandbox.SillyTavern.getRequestHeaders = () => ({ 'Content-Type': 'application/json' });
    sandbox.window.parent.fetch = async (url, options) => {
        assert.equal(url, '/api/backends/chat-completions/generate');
        assert.equal(options.method, 'POST');
        received.push(JSON.parse(options.body));
        return new Response(JSON.stringify({ choices: [{ message: { content: reply } }] }));
    };
    const preview = { prompt: [Object.freeze({ role: 'user', content: '预览' })] };
    await api.injectWardrobeContent({ chat: preview.prompt, dryRun: true });
    api.markOutfitChatPrompt(preview, true);
    await api.applyIsolatedOutfits({ messages: preview.prompt });
    const unmarked = [{ role: 'user', content: '未经过提示词构建的请求' }];
    await api.applyIsolatedOutfits({ messages: unmarked });
    assert.equal(received.length, 0, '预览和无标记请求不调用选装接口');
    assert.equal(preview.prompt.length, 1, '预览不附加穿搭');
    assert.equal(unmarked.length, 1, '无标记请求保持原样');
    const canceled = { prompt: [{ role: 'user', content: '已取消的请求' }] };
    api.markOutfitChatPrompt(canceled, false);
    api.stopOutfitRequest();
    const canceledRequest = { messages: structuredClone(canceled.prompt) };
    await api.applyIsolatedOutfits(canceledRequest);
    assert.equal(received.length, 0, '取消后迟到的请求不能触发选装');
    assert.deepEqual(structuredClone(canceledRequest.messages), [{ role: 'user', content: '已取消的请求' }], '即使已取消，也不发送临时标记');
    const request = {
        messages: [{ role: 'system', content: '主模型设定' }, userMessage],
        chat_completion_source: 'makersuite', model: 'host-model', reverse_proxy: 'https://proxy.example.test',
        stream: true, tools: [{ type: 'function' }], json_schema: { name: 'main_only' }, stop: ['主请求专用'],
    };
    await api.injectWardrobeContent({ chat: request.messages, dryRun: false });
    api.markOutfitChatPrompt({ prompt: request.messages }, false);
    request.messages = request.messages.slice();
    await api.applyIsolatedOutfits(request);
    const plot = JSON.parse(received[0].messages[1].content.split('\n')[1]);
    assert.deepEqual(plot.map(floor => floor.content.trim()), ['最近用户楼层', '最近角色楼层', '本次输入']);
    assert.equal(received[0].messages.length, 2, '选装只发独立构建的消息');
    assert.match(received[0].messages[1].content, /可选衣柜[\s\S]*蓝衣独有描述[\s\S]*红衣独有描述/);
    assert.equal(received[0].messages[1].content.split(outfitForm.elements.prompt.value).length - 1, 1, '两个角色共用一份独立选装提示词');
    assert.equal(received[0].messages[1].content.split(ratingForm.elements.prompt.value).length - 1, 1, '独立选装发送一份分级提示词');
    assert.doesNotMatch(received[0].messages[1].content, /主模型设定|第一条旧剧情/);
    assert.equal(received[0].chat_completion_source, request.chat_completion_source);
    assert.equal(received[0].reverse_proxy, request.reverse_proxy);
    assert.equal(received[0].stream, false);
    assert.equal(received[0].tools, undefined);
    assert.equal(received[0].json_schema, undefined);
    assert.equal(received[0].stop, undefined);
    assert.equal(request.stream, true);
    assert.equal(request.json_schema.name, 'main_only');
    assert.match(request.messages[0].content, /主模型设定[\s\S]*红衣独有描述/);
    assert.doesNotMatch(request.messages[0].content, /可选衣柜|蓝衣独有描述|outfit:/);
    assert.deepEqual(structuredClone(request.messages[1]), userMessage, '主请求保留用户消息内容并清除临时标记');
    assert.equal(chat.at(-1).mes, '本次输入', '选装只写楼层变量，保留已保存正文');
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.user), ['red']);
    await api.applyIsolatedOutfits(request);
    assert.equal(received.length, 1, '同一个原生请求只选装一次');
    assert.equal(request.messages[0].content.match(/红衣独有描述/g).length, 1, '同一请求只注入一次当前穿着');

    // 酒馆助手 generateRaw 跳过原生聊天的数据准备事件，内置生图走原生静默生成。两者都只读同一份快照。
    const outfitSnapshot = JSON.stringify(chat.at(-1).variables);
    for (const type of ['normal', 'quiet']) {
        const imagePrompt = Object.freeze({ role: 'user', content: '根据剧情编写生图提示词' });
        const prompt = [imagePrompt];
        await api.injectWardrobeContent({ chat: prompt, dryRun: false });
        if (type === 'quiet') api.markOutfitChatPrompt({ prompt }, false);
        const imageRequest = { type, messages: prompt.slice() };
        await api.applyIsolatedOutfits(imageRequest);
        assert.match(imageRequest.messages[0].content, /USER（玩家）的当前穿着[\s\S]*红衣独有描述/);
        assert.match(imageRequest.messages[0].content, /Char（角色）的当前穿着[\s\S]*长裤独有描述/);
        assert.doesNotMatch(imageRequest.messages[0].content, /可选衣柜|蓝衣独有描述/);
        assert.deepEqual(structuredClone(imageRequest.messages[1]), imagePrompt, '辅助生成保留原始生图指令');
    }
    assert.equal(received.length, 1, '辅助生成不重新请求选装接口');
    assert.equal(JSON.stringify(chat.at(-1).variables), outfitSnapshot, '辅助生成不写楼层变量');

    // 模拟第三方生图读取原始楼层，验证它能直接按已确认 ID 查到衣柜原文。
    const roleReply = {
        mes: '上一轮正文\n\n<!-- outfit:user=["blue"] -->', extra: { reasoning: '备选：蓝外套（blue）' },
        swipes: ['其他回复页', '上一轮正文'], swipe_id: 1,
    };
    const garment = api.state().garments.get('red');
    garment.description = '红衣独有描述 --> 后半段';
    chat.push(roleReply);
    const replyId = chat.length - 1;
    await api.publishOutfitSnapshot(replyId, 'extension');
    assert.match(roleReply.mes, /outfit:user=\["blue"\]/, '其他插件创建的楼层不写穿搭');
    await api.publishOutfitSnapshot(replyId, 'normal');
    const published = roleReply.mes;
    const markers = [...published.matchAll(/<!-- outfit:(user|char)=(.*?) -->/g)];
    assert.equal(markers.length, 2);
    const player = JSON.parse(markers[0][2]);
    assert.deepEqual(player.ids, ['red']);
    assert.equal(player.items.red.description, garment.description, '注释转义后仍能取回完整原文');
    assert.equal(JSON.parse(markers[1][2]).items.pants.description, '长裤独有描述');
    assert.deepEqual(Array.from(api.parseOutfitSnapshot(markers[0][2], new Set(['red']))), ['red']);
    assert.doesNotMatch(published, /blue|蓝外套/);
    assert.deepEqual(roleReply.swipes, ['其他回复页', published]);
    await api.publishOutfitSnapshot(replyId, 'normal');
    assert.equal(roleReply.mes, published, '重复收到同一楼层时不重复追加注释');
    const historyCopy = [{ role: 'assistant', content: published }];
    api.stripOutfitMarkers(historyCopy);
    assert.equal(historyCopy[0].content, '上一轮正文', '隐藏注释从后续模型请求剥离');
    assert.equal(received.length, 1, '发布注释无需再次选装');
    chat.pop();
    garment.description = '红衣独有描述';
    assert.equal(JSON.stringify(chat.at(-1).variables), outfitSnapshot);

    // 接口跨角色引用应整体拒绝，沿用之前的有效穿搭。
    chat.push({ mes: '上一轮正文' }, { is_user: true, mes: '继续剧情' });
    sendForm.elements.outfit_history_count.value = '0';
    api.saveSendSettings({ preventDefault() {} });
    api.loadSendSettings();
    assert.equal(sendForm.elements.outfit_history_count.value, '0');
    reply = '{"user":["blue"],"char":["red"]}';
    const failed = { messages: [{ role: 'user', content: '继续剧情' }] };
    api.markOutfitChatPrompt({ prompt: failed.messages }, false);
    await api.applyIsolatedOutfits(failed);
    assert.equal(warnings, 1);
    assert.deepEqual(JSON.parse(received[1].messages[1].content.split('\n')[1]), [{ role: 'user', content: '继续剧情' }]);
    assert.match(failed.messages[0].content, /红衣独有描述/);
    assert.equal(chat.at(-1).variables, undefined);

    sendForm.elements.outfit_history_count.value = '4';
    sendForm.elements.content_type.value = 'text_image';
    sendForm.elements.image_quality.value = 'original';
    api.saveSendSettings({ preventDefault() {} });
    assert.equal(saved.wardrobe_send.image_quality, 'original', '表单保存画质选项');
    const turn = chat.at(-1);
    turn.swipe_id = 1;
    turn.variables = [{ 'wardrobe_outfit:wardrobe-test:default-1': { user: ['blue'], char: ['pants'] } }];
    chat.push({ is_system: true, mes: '用户和回复之间的系统楼层' }, { mes: '即将替换的回复' }, { is_system: true, mes: '回复后的系统楼层' });
    reply = '{}';
    const input = { role: 'user', content: '继续剧情' };
    const regenerated = { messages: [input], model: 'host-model', proxy_password: 'host-key' };
    api.setApiConnection({ mode: 'custom', source: 'openai', apiurl: 'https://wardrobe.example.test/v1/', key: 'wardrobe-key', model: 'wardrobe-model', temperature: 0.3, max_tokens: 512 });
    api.markOutfitChatPrompt({ prompt: regenerated.messages }, false);
    await api.applyIsolatedOutfits(regenerated);
    const parts = received[2].messages[1].content;
    assert.deepEqual(JSON.parse(parts[0].text.split('\n')[1]).map(floor => floor.content.trim()),
        ['最近用户楼层', '最近角色楼层', '本次输入', '上一轮正文', '继续剧情']);
    assert.equal(parts.filter(part => part.type === 'image_url').length, 3, '候选图片送到选装请求');
    assert.ok(parts.filter(part => part.type === 'image_url').every(part => part.image_url.url === image), '独立选装使用原图选项');
    assert.deepEqual(turn.variables[1]['wardrobe_outfit:wardrobe-test:default-1'].user, ['red'], '跨过系统楼层写回原始用户楼层与当前回复页');
    assert.equal(messageVariableReads, 0, '直接读取当前回复页的衣柜快照，无需克隆整楼变量');
    assert.equal(received[2].reverse_proxy, 'https://wardrobe.example.test/v1');
    assert.equal(received[2].proxy_password, 'wardrobe-key');
    assert.equal(received[2].model, 'wardrobe-model');
    assert.equal(regenerated.proxy_password, 'host-key', '独立连接不覆盖主连接的鉴权');
    assert.equal(regenerated.messages[1].content.filter(part => part.type === 'image_url').length, 2, '主请求仅附两个角色选中的参考图');
    assert.ok(regenerated.messages[1].content.filter(part => part.type === 'image_url').every(part => part.image_url.url === image), '独立选装的主请求也使用原图');
    assert.deepEqual(structuredClone(regenerated.messages[2]), input);

    const imageRequest = { messages: [{ role: 'user', content: '编写生图提示词' }] };
    await api.injectWardrobeContent({ chat: imageRequest.messages, dryRun: false });
    await api.applyIsolatedOutfits(imageRequest);
    assert.deepEqual(imageRequest.messages[1], regenerated.messages[1], '图文模式下辅助生成复用主请求的实际穿着参考图');
    assert.equal(received.length, 3, '附加参考图也不触发选装');
    const continuation = { type: 'continue', messages: [{ role: 'user', content: '保留已选穿搭' }] };
    api.markOutfitChatPrompt({ prompt: continuation.messages }, false);
    await api.applyIsolatedOutfits(continuation);
    assert.equal(received.length, 3, '续写没有新用户楼层，不重复选装');
    assert.match(continuation.messages[0].content, /红衣独有描述/);

    sendForm.elements.outfit_history_count.value = '2.5';
    api.saveSendSettings({ preventDefault() {} });
    assert.equal(saved.wardrobe_send.outfit_history_count, 4, '非法楼层数不覆盖原设置');
}

test('独立 API 选装隔离主请求并按设置读取历史楼层', checkIsolatedOutfits);

/**
 * 通过两种请求入口验证套装去重提示，并检查模型修正的 ID 如何传到主请求和楼层注释。
 * @returns {Promise<void>} 重复鞋袜和缺鞋补充两个场景验证结束后完成。
 */
async function checkOutfitOverlap() {
    reset();
    const suit = { ...pants, id: 'lace-suit', name: '黑蕾丝深V长裙', category: 'outfits', description: '下配黑色薄款半透明连裤袜与黑色尖头踝带高跟鞋。' };
    const noShoes = { ...suit, id: 'no-shoes', name: '不含鞋的套装', description: '长裙搭配针织外套。' };
    const socks = { ...pants, id: 'stockings', name: '油光连裤丝袜', category: 'socks', description: '油光高腰连裤丝袜。' };
    const shoes = { ...pants, id: 'heels', name: '尖头漆皮高跟鞋', category: 'shoes', description: '尖头浅口细高跟单鞋。' };
    const overlapping = [suit.id, socks.id, shoes.id];
    const corrected = [suit.id];
    const supplemented = [noShoes.id, shoes.id];
    saved.wardrobe_items = [suit, noShoes, socks, shoes];
    saved.wardrobe_selections = { user: [], char: [...overlapping, noShoes.id], current: { user: [], char: overlapping } };
    api.loadGarments();
    chat = [{ is_user: true, mes: '继续在房间里聊天。' }];
    const direct = { chat: [{ role: 'user', content: chat[0].mes }] };
    await api.injectWardrobeContent(direct);
    const directPrompt = direct.chat[0].content;
    assert.match(directPrompt, /套装优先，单品按缺项补充[\s\S]*套装缺鞋时可以补鞋/);
    assert.match(directPrompt, /连衣裙同时占上装和下装[\s\S]*上装、下装、腿袜和鞋是否各自至多一个来源/);
    assert.match(directPrompt, /候选合适或部位空缺都不触发选装[\s\S]*只删重复 ID[\s\S]*不新增 ID/);
    assert.ok(directPrompt.includes(`\n\n${outfitForm.elements.prompt.value}\n\n（换装记录：`), '直接模式原样发送编辑框中的默认提示词');
    assert.match(directPrompt, /仅修正重复项时[\s\S]*输出前按选装提示词核对 ID/, '直接模式允许在不换装时修正快照');

    sendForm.elements.marker_mode.value = 'isolated';
    api.saveSendSettings({ preventDefault() {} });
    api.setApiConnection({ mode: 'host' });
    const received = [];
    const modelSelections = [corrected, supplemented];
    sandbox.SillyTavern.getRequestHeaders = () => ({ 'Content-Type': 'application/json' });
    /** 捕获独立选装请求，并按顺序返回模拟模型选择；参数为请求路径和选项，返回模拟响应。 */
    sandbox.window.parent.fetch = async (_url, options) => {
        const selection = modelSelections[received.length];
        received.push(JSON.parse(options.body));
        return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ char: selection }) } }] }));
    };
    const request = { messages: [{ role: 'user', content: chat[0].mes }] };
    api.markOutfitChatPrompt({ prompt: request.messages }, false);
    await api.applyIsolatedOutfits(request);
    const [instructions, candidates] = received[0].messages;
    assert.match(instructions.content, /输出前按选装提示词核对 ID[\s\S]*仅修正重复项时也返回完整数组/);
    assert.ok(candidates.content.endsWith(`\n\n${outfitForm.elements.prompt.value}`), '独立选装原样发送编辑框中的默认提示词');
    assert.match(candidates.content, /套装优先，单品按缺项补充[\s\S]*套装缺鞋时可以补鞋/);
    assert.match(candidates.content, /套装已占用的部位锁定[\s\S]*五、输出前自检（必须执行）[\s\S]*上装、下装、腿袜和鞋是否各自至多一个来源/);
    for (const item of [suit, socks, shoes]) assert.ok(candidates.content.includes(item.description), '选装仍可看到全部候选资料');
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.char), corrected);
    assert.match(request.messages[0].content, /黑蕾丝深V长裙/);
    assert.doesNotMatch(request.messages[0].content, /油光连裤丝袜|尖头漆皮高跟鞋/);

    const roleReply = { mes: '她继续聊天。', swipes: ['她继续聊天。'], swipe_id: 0 };
    chat.push(roleReply);
    await api.publishOutfitSnapshot(chat.length - 1, 'normal');
    const [, snapshot] = roleReply.mes.match(/<!-- outfit:char=(.*?) -->/);
    assert.deepEqual(JSON.parse(snapshot), { ids: corrected, items: { [suit.id]: { name: suit.name, description: suit.description } } });

    const customPrompt = '换装时按用户要求挑选鞋子。';
    outfitForm.elements.prompt.value = customPrompt;
    api.saveOutfitSettings({ preventDefault() {}, currentTarget: outfitForm });
    chat.push({ is_user: true, mes: '回家后换一身，另配一双高跟鞋。' });
    const changed = { messages: [{ role: 'user', content: chat.at(-1).mes }] };
    api.markOutfitChatPrompt({ prompt: changed.messages }, false);
    await api.applyIsolatedOutfits(changed);
    assert.ok(received[1].messages[1].content.endsWith(`\n\n${customPrompt}`), '独立选装原样使用已保存的自定义提示词');
    assert.doesNotMatch(received[1].messages[1].content, /套装优先，单品按缺项补充/, '自定义提示词替换默认规则');
    assert.deepEqual(Array.from(api.readEffectiveSelections().current.char), supplemented, '套装没有鞋时允许补充独立鞋');
    assert.match(changed.messages[0].content, /不含鞋的套装[\s\S]*尖头漆皮高跟鞋/);
}

test('套装优先提示、重复鞋袜快照修正及缺鞋补充', checkOutfitOverlap);

/**
 * 控制主请求读图的时机，覆盖同轮并发、重生成取消、换库、删除和存档失败。
 * @returns {Promise<void>} 发送内容和楼层快照验证结束后完成。
 */
async function checkIsolatedOutfitCommit() {
    reset();
    sendForm.elements.marker_mode.value = 'isolated';
    sendForm.elements.content_type.value = 'text_image';
    api.saveSendSettings({ preventDefault() {} });
    api.setApiConnection({ mode: 'host' });
    let selectionRequests = 0;
    let holdReference;
    sandbox.SillyTavern.getRequestHeaders = () => ({});
    sandbox.window.parent.fetch = async () => {
        selectionRequests++;
        return new Response(JSON.stringify({ choices: [{ message: { content: '{"user":["red"]}' } }] }));
    };
    api.setImageLoader(async url => {
        if (holdReference && selectionRequests === holdReference.requestNumber) {
            const gate = holdReference;
            holdReference = undefined;
            gate.start();
            await gate.released;
        }
        return url;
    });
    /** 暂停下一个选装任务的主请求参考图；无参数，返回读图开始和放行的控制对象。 */
    const holdNextReference = () => {
        const gate = { requestNumber: selectionRequests + 1 };
        gate.started = new Promise(resolve => { gate.start = resolve; });
        gate.released = new Promise((resolve, reject) => { gate.release = resolve; gate.reject = reject; });
        holdReference = gate;
        return gate;
    };
    /** 从酒馆事件启动请求；参数为用户输入和生成类型，返回请求与完成信号。 */
    const startRequest = (input, type = 'normal') => {
        const request = { type, messages: [{ role: 'user', content: input }] };
        api.markOutfitChatPrompt({ prompt: request.messages }, false);
        return { request, done: api.applyIsolatedOutfits(request) };
    };
    const key = 'wardrobe_outfit:wardrobe-test:default-1';
    const turn = { is_user: true, mes: '本轮换红衣' };
    chat = [turn];
    let gate = holdNextReference();
    const writesBefore = messageVariableWrites;
    const first = startRequest(turn.mes);
    await gate.started;
    const second = startRequest(turn.mes);
    assert.equal(turn.variables, undefined, '主请求参考图尚未就绪时不写楼层');
    assert.equal(second.request.messages.length, 1);
    gate.release();
    await Promise.all([first.done, second.done]);
    assert.equal(selectionRequests, 1, '同轮两个请求只选装一次');
    assert.equal(messageVariableWrites, writesBefore + 1, '同轮只提交一次楼层快照');
    assert.deepEqual(turn.variables[0][key].user, ['red']);
    assert.match(first.request.messages[0].content, /红衣独有描述/);
    assert.deepEqual(second.request.messages, first.request.messages, '两份请求注入同一份穿搭内容');
    assert.notEqual(second.request.messages[1].content, first.request.messages[1].content, '各请求独立持有图片内容块');

    turn.variables[0][key].user = ['blue'];
    chat.push({ mes: '正在替换的 AI 回复' });
    gate = holdNextReference();
    const canceled = startRequest(turn.mes, 'regenerate');
    await gate.started;
    api.stopOutfitRequest();
    assert.deepEqual(turn.variables[0][key].user, ['blue'], '等待主请求参考图时取消，保留上次快照');

    // 旧读图仍未完成时开始新任务，旧任务的清理不能释放新任务的槽位。
    const retryGate = holdNextReference();
    const retry = startRequest(turn.mes, 'regenerate');
    await retryGate.started;
    gate.release();
    await canceled.done;
    assert.equal(canceled.request.messages.length, 1);
    const joined = startRequest(turn.mes, 'regenerate');
    retryGate.release();
    await Promise.all([retry.done, joined.done]);
    assert.equal(selectionRequests, 3);
    assert.deepEqual(turn.variables[0][key].user, ['red']);
    assert.deepEqual(retry.request.messages, joined.request.messages);

    turn.variables[0][key].user = ['blue'];
    writesFail = true;
    const failed = startRequest(turn.mes, 'regenerate');
    try {
        await failed.done;
        assert.match(failed.request.messages[0].content, /蓝衣独有描述/, '存档失败沿用同一楼层上次成功的穿搭');
        assert.doesNotMatch(failed.request.messages[0].content, /红衣独有描述/);
        assert.deepEqual(turn.variables[0][key].user, ['blue']);
    } finally {
        writesFail = false;
    }

    gate = holdNextReference();
    const badReference = startRequest(turn.mes, 'regenerate');
    await gate.started;
    gate.reject(new Error('新穿搭参考图读取失败'));
    await badReference.done;
    assert.match(badReference.request.messages[0].content, /蓝衣独有描述/, '新穿搭读图失败沿用已有穿搭');
    assert.deepEqual(turn.variables[0][key].user, ['blue']);

    gate = holdNextReference();
    const deleting = startRequest(turn.mes, 'regenerate');
    await gate.started;
    saved.wardrobe_items = saved.wardrobe_items.filter(item => item.id !== 'red');
    api.loadGarments();
    gate.release();
    await deleting.done;
    assert.match(deleting.request.messages[0].content, /蓝衣独有描述/);
    assert.match(deleting.request.messages[0].content, /长裤独有描述/, '删除一件服装后仍注入其他角色的有效穿搭');
    assert.deepEqual(turn.variables[0][key].user, ['blue']);

    // 换库后即使旧模型回复迟到也不能写入当前衣柜或原衣柜的楼层变量。
    saved.wardrobe_items = structuredClone([blue, red, pants, combination]);
    api.loadGarments();
    gate = holdNextReference();
    const switching = startRequest(turn.mes, 'regenerate');
    await gate.started;
    api.stopOutfitRequest();
    api.setLibrary('default-2');
    gate.release();
    await switching.done;
    assert.equal(switching.request.messages.length, 1);
    assert.deepEqual(Object.keys(turn.variables[0]), [key]);
    assert.deepEqual(turn.variables[0][key].user, ['blue']);
    api.setLibrary('default-1');

    // 不同楼层排队，等上一楼层提交后读取其穿搭，再写回自己的用户楼层。
    chat = [turn];
    gate = holdNextReference();
    const earlier = startRequest(turn.mes);
    await gate.started;
    const nextTurn = { is_user: true, mes: '下一轮仍穿红衣' };
    chat.push(nextTurn);
    const requestsBeforeNextTurn = selectionRequests;
    const later = startRequest(nextTurn.mes);
    assert.equal(selectionRequests, requestsBeforeNextTurn, '其他楼层不会并行调用选装接口');
    gate.release();
    await Promise.all([earlier.done, later.done]);
    assert.equal(selectionRequests, requestsBeforeNextTurn + 1);
    assert.deepEqual(nextTurn.variables[0][key].user, ['red']);
    assert.match(later.request.messages[0].content, /红衣独有描述/);
}

test('独立选装在主请求就绪后提交，同轮共用快照并隔离迟到结果', checkIsolatedOutfitCommit);

/**
 * 验证兼容格式能提交穿搭，接口错误和无正文分别记录原因并沿用旧穿搭。
 * @returns {Promise<void>} 所有响应场景检查完成后结束。
 */
async function checkIsolatedOutfitResponses() {
    reset();
    sendForm.elements.marker_mode.value = 'isolated';
    api.saveSendSettings({ preventDefault() {} });
    api.setApiConnection({ mode: 'host' });
    let warnings = 0;
    sandbox.toastr.warning = () => { warnings++; };
    const cases = [
        [{ content: [{ type: 'text', text: '{"user":["red"]}' }] }, null],
        [{ error: { message: 'Unauthorized: test-proxy-password' } }, /选装接口报错：Unauthorized/],
        [{ error: true, quota_error: true }, /额度不足/],
        [{ choices: [{ message: { content: null }, finish_reason: 'length' }] }, /未返回文字（结束原因：length）/],
    ];
    for (const [body, error] of cases) {
        const floor = { is_user: true, mes: '这轮的剧情' };
        chat.push(floor);
        sandbox.window.parent.fetch = async () => new Response(JSON.stringify(body));
        const request = { messages: [{ role: 'user', content: floor.mes }], proxy_password: 'test-proxy-password' };
        api.markOutfitChatPrompt({ prompt: request.messages }, false);
        await api.applyIsolatedOutfits(request);
        assert.match(request.messages[0].content, /红衣独有描述/);
        if (error) {
            const log = api.wardrobeLogs.findLast(entry => entry.message === '独立选装失败，沿用原穿搭');
            assert.match(log.details, error);
            assert.doesNotMatch(log.details, /test-proxy-password/);
            assert.equal(floor.variables, undefined, '接口失败不覆盖楼层快照');
        } else {
            assert.deepEqual(floor.variables[0]['wardrobe_outfit:wardrobe-test:default-1'].user, ['red']);
        }
    }
    assert.equal(warnings, 3);
}

test('独立选装兼容酒馆回复格式并区分接口错误和空回复', checkIsolatedOutfitResponses);
