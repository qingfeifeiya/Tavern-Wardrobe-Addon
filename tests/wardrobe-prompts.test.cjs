const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

/**
 * 模拟现有模板表单的字段、原生必填校验和状态区，不依赖浏览器布局。
 * @param {string[]} fields 表单字段名称。
 * @param {string} owner 模板所属分组，描述生成表单留空。
 * @returns {Object} 可交给产品加载与保存函数使用的表单。
 */
function createForm(fields, owner = '') {
    const status = { textContent: '', dataset: {} };
    const inputs = new Map(fields.map(field => [field, { value: '' }]));
    const elements = Object.fromEntries(inputs);
    Object.defineProperty(elements, 'namedItem', { value: name => inputs.get(name) });
    // 复现浏览器中 item 方法与同名字段的冲突，避免普通对象替身掩盖控件读取问题。
    if (inputs.has('item')) elements.item = () => {};
    return {
        dataset: { templateOwner: owner },
        elements,
        querySelector: () => status,
        reportValidity() { return Array.from(inputs.values()).every(field => field.value.trim()); },
    };
}

const forms = new Map(['user', 'char', 'image'].map(owner => [`[data-template-owner="${owner}"]`, createForm(['single', 'wardrobe'], owner)]));
const descriptionForm = createForm(['outfit', 'item']);
forms.set('.tw-description-form', descriptionForm);
const sendForm = createForm(['content_type', 'position', 'marker_mode', 'send_content_rating']);
sendForm.elements.content_type.value = 'text';
sendForm.elements.position.value = 'user_end';
sendForm.elements.marker_mode.value = 'strip';
sendForm.elements.send_content_rating.checked = true;
const dataInput = { files: [], value: '', click() { this.opened = true; } };
const dataStatus = { textContent: '', dataset: {} };
const dataButtons = ['import-data', 'export-data'].map(action => ({ dataset: { action }, disabled: false }));
forms.set('.tw-data-import', dataInput);
forms.set('.tw-data-status', dataStatus);
const downloads = [];
const downloadBlobs = new Map();
const controls = {
    '[name="description_mode"]': { value: 'outfit' },
    '[name="description_category"]': { value: 'on' },
    '[name="description_tags"]': { value: 'on' },
    '[name="garment_name"]': { value: '手工填写的名称' },
    '[name="garment_category"]': { value: 'coats' },
    '[name="garment_content_rating"]': { value: 'unrated' },
    '[name="garment_group"]': { disabled: false },
    '[name="garment_description"]': { value: '' },
    '.tw-garment-status': { textContent: '', dataset: {} },
    '.tw-library-status': { textContent: '', dataset: {} },
    '[data-action="describe"]': { disabled: false, textContent: '' },
    '[data-action="describe-all"]': { disabled: false, textContent: '一键识图' },
    '[data-action="remove-image"]': { disabled: false },
    '[data-action="replace-image"]': { disabled: false, textContent: '' },
    '[data-action="edit-combination"]': { disabled: true },
};
const saved = { wardrobe_templates: {
    user: { single: '旧的 USER 单套', wardrobe: '{{user}} 的衣柜，共 {{count}} 套：\n{{outfits}}\n请根据剧情选择合适的一套，不要同时穿上所有套装。' },
    char: {
        single: '{{char}} 当前穿着：{{name}}\n{{description}}',
        wardrobe: '{{char}} 的衣柜，共 {{count}} 套：\n{{outfits}}\n请根据剧情选择合适的一套，不要同时穿上所有套装。',
    },
    image: {
        single: '{{wearer}} 的服装参考图：{{name}}。请仅参考图片中的服装、配饰、款式、颜色和穿搭，不采用图中人物的身份、面容、发型、身材、姿势或背景，不据此改变角色原有外貌。不编造看不到的服装细节。',
        wardrobe: '{{wearer}} 的衣柜包含 {{count}} 套服装，名称与图片按相同顺序对应：{{name}}。请根据剧情选择合适的一套，不要同时穿上所有套装。图片仅提供服装与配饰参考，忽略图中人物的身份、面容、发型、身材、姿势和背景，不改变角色原有外貌，不编造看不到的服装细节。',
    },
} };
const requests = [];
let imageReads = 0;
let writesFail = false;
let modelReply = '  生成的服装描述  ';
let idSequence = 0;
let confirmation = true;
let confirmationEffect;
const confirmations = [];
const stoppedGenerations = [];
let generationEffect;
const sandbox = {
    window: { parent: {
        document: {
            body: { append() {} },
            createElement: () => ({ click() { downloads.push({ name: this.download, href: this.href }); }, remove() {} }),
        },
        URL: {
            createObjectURL: blob => { const url = `blob:${downloads.length}`; downloadBlobs.set(url, blob); return url; },
            revokeObjectURL: url => downloadBlobs.delete(url),
        },
        matchMedia: () => ({ matches: false }), AbortController, Blob,
        crypto: { randomUUID: () => `test-${++idSequence}` },
        confirm: message => { confirmations.push(message); return confirmationEffect ? confirmationEffect(message) : confirmation; },
        setTimeout: () => 0, clearTimeout() {},
        /** 返回文件原图以验证描述生成前的异步读取；无参数，返回图片响应。 */
        fetch: async () => { imageReads++; return { ok: true, blob: async () => new Blob(['hello']) }; },
        /** 为描述生成模拟浏览器图片读取器。 */
        FileReader: class {
            /** 读取图片字节并触发成功事件；参数为图片 Blob，无返回值。 */
            readAsDataURL(blob) {
                blob.arrayBuffer().then(bytes => {
                    this.result = `data:${blob.type};base64,${Buffer.from(bytes).toString('base64')}`;
                    this.onload();
                    this.onloadend();
                });
            }
        },
    } },
    testSettingsPanel: { querySelector: selector => forms.get(selector), querySelectorAll: () => dataButtons },
    testSendForm: sendForm,
    testPanel: { querySelector: selector => controls[selector], querySelectorAll: () => [] },
    getVariables: () => saved,
    insertOrAssignVariables: data => { if (writesFail) throw new Error('存储失败'); Object.assign(saved, structuredClone(data)); },
    SillyTavern: { getCurrentChatId: () => '' },
    generateRaw: async config => { requests.push(config); return generationEffect ? generationEffect(config) : modelReply; },
    stopGenerationById: id => stoppedGenerations.push(id),
};
vm.createContext(sandbox);
const source = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
const hooks = `
settingsPanel = testSettingsPanel;
sendForm = testSendForm;
panel = testPanel;
root = { isConnected: true };
refreshWardrobe = () => {};
renderGarmentLibrary = () => {};
globalThis.api = { loadWardrobeTemplates, saveWardrobeTemplate, loadDescriptionPrompts, saveDescriptionPrompts,
    previousOutfitPrompt: PREVIOUS_DEFAULT_OUTFIT_PROMPT,
    previousItemPrompt: PREVIOUS_DEFAULT_ITEM_PROMPT,
    loadGarments, generateGarmentDescription, generateMissingGarmentDescriptions, stopDescriptionRequest, saveSelectedGarment, buildWearerContent,
    handleWardrobeData, parseWardrobeSettingsData, loadSendSettings,
    filterMissing: ids => { currentCategory = 'missing-description'; visibleGarmentIds = new Set(ids); },
    state: () => ({ wardrobeTemplates, descriptionPrompts, sendSettings, garments, garmentGroups }),
};
return;
`;
vm.runInContext(source.replace('// 等待宿主文档就绪', hooks + '\n// 等待宿主文档就绪'), sandbox);
const api = sandbox.api;

/**
 * 验证提示词保存、两种生成模式的 JSON 字段、自动标签、失败保留及保存后的角色模板继承。
 * @returns {Promise<void>} 全部断言完成后结束。
 */
async function main() {
    api.loadWardrobeTemplates();
    api.loadDescriptionPrompts();
    assert.equal(descriptionForm.elements.namedItem('item').value, api.state().descriptionPrompts.item, '单品提示词填入实际控件');
    assert.equal(api.state().wardrobeTemplates.user.single, '旧的 USER 单套', '新增设置保留旧角色模板');
    for (const [owner, fields] of [['user', ['wardrobe']], ['char', ['single', 'wardrobe']], ['image', ['single', 'wardrobe']]]) {
        for (const field of fields) {
            assert.ok(api.state().wardrobeTemplates[owner][field].includes('严禁集中罗列'), '原版默认模板自动升级到细节分散描写要求');
        }
    }
    assert.ok(api.state().wardrobeTemplates.char.single.startsWith('{{char}} 的可选服装：'), 'Char 默认模板使用受支持的小写变量且不将候选冒充当前穿着');
    assert.ok(api.state().wardrobeTemplates.user.wardrobe.includes('仅在合理换装机会调整'), '文字衣柜模板按合理机会换装');
    assert.ok(api.state().wardrobeTemplates.image.wardrobe.includes('仅在合理换装机会调整'), '图片衣柜模板按合理机会换装');
    assert.ok(api.state().wardrobeTemplates.image.single.includes('服装参考图'), '旧存档补默认图片提示词');
    for (const prompt of Object.values(api.state().descriptionPrompts)) {
        assert.ok(prompt.includes('人物') && prompt.includes('背景') && prompt.includes('仅输出'), '默认提示词限制人物和背景，要求只输出描述');
    }

    // 升级仅替换原始默认提示词，用户编辑的两种提示词都应完整保留。
    const defaultOutfitPrompt = api.state().descriptionPrompts.outfit;
    assert.ok(defaultOutfitPrompt.includes('原始标准静态版型') && defaultOutfitPrompt.includes('200-280字'), '默认服装提示词使用新版静态版型及字数要求');
    assert.ok(defaultOutfitPrompt.includes('后背结构的合理补全') && defaultOutfitPrompt.includes('系统追加的最终输出格式'), '新版包含后背还原要求并服从最终输出格式');
    saved.wardrobe_description_prompts = { outfit: api.previousOutfitPrompt, item: '自定义单品提示词' };
    api.loadDescriptionPrompts();
    assert.equal(api.state().descriptionPrompts.outfit, defaultOutfitPrompt, '旧默认服装提示词自动升级');
    assert.equal(descriptionForm.elements.outfit.value, defaultOutfitPrompt, '设置表单同步显示新版服装提示词');
    assert.equal(api.state().descriptionPrompts.item, '自定义单品提示词', '升级不改写单品提示词');
    saved.wardrobe_description_prompts.outfit = '自定义服装提示词';
    api.loadDescriptionPrompts();
    assert.equal(api.state().descriptionPrompts.outfit, '自定义服装提示词', '升级不改写自定义服装提示词');
    saved.wardrobe_description_prompts.item = api.previousItemPrompt;
    api.loadDescriptionPrompts();
    const upgradedItemPrompt = api.state().descriptionPrompts.item;
    assert.ok(upgradedItemPrompt.includes('单品版型还原师') && upgradedItemPrompt.includes('120-220字'), '旧默认单品提示词升级为新版静态版型要求');
    assert.ok(upgradedItemPrompt.includes('{{name}}') && upgradedItemPrompt.includes('{{category}}'), '新版保留目标名称和预设分类占位符');
    assert.ok(upgradedItemPrompt.includes('完全无法辨认或不存在该目标单品') && upgradedItemPrompt.includes('不可见/后背结构的合理补全'), '新版包含目标缺失与背面固定结构要求');
    assert.equal(descriptionForm.elements.namedItem('item').value, upgradedItemPrompt, '单品表单同步升级');
    assert.equal(api.state().descriptionPrompts.outfit, '自定义服装提示词', '单品升级保留自定义服装提示词');
    saved.wardrobe_description_prompts.item = '自定义单品提示词';
    api.loadDescriptionPrompts();
    assert.equal(api.state().descriptionPrompts.item, '自定义单品提示词', '升级不改写自定义单品提示词');
    delete saved.wardrobe_description_prompts;
    api.loadDescriptionPrompts();
    assert.equal(api.state().descriptionPrompts.item, upgradedItemPrompt, '无存档时使用新版单品默认值');

    // 上一代剧情模板也必须升级，用户自行改写的旧选装规则则保留原文，由固定结构规则约束。
    saved.wardrobe_templates.char.wardrobe = '{{char}} 的衣柜，共 {{count}} 套：\n{{outfits}}\n请根据剧情选择合适的一套，不要同时穿上所有套装。\n（禁止编造以上之外的服装。根据场景标签匹配穿搭，若回复中出现场景转换则对应切换穿搭。严禁集中罗列服装信息，服装细节必须分散融入动作、触感、环境互动中，每次只带出一两个细节。）';
    saved.wardrobe_templates.user.single = '自定义：只选一条 {{name}}';
    api.loadWardrobeTemplates();
    assert.ok(api.state().wardrobeTemplates.char.wardrobe.includes('一身完整穿搭'), '上一代原始默认模板自动迁移');
    assert.equal(api.state().wardrobeTemplates.user.single, '自定义：只选一条 {{name}}', '自定义模板不自动改写');
    saved.wardrobe_templates.user.single = '旧的 USER 单套';
    api.loadWardrobeTemplates();

    const imageForm = forms.get('[data-template-owner="image"]');
    imageForm.elements.single.value = '  单套图片自定义 {{wearer}}  ';
    imageForm.elements.wardrobe.value = '衣柜图片自定义 {{count}}';
    api.saveWardrobeTemplate({ preventDefault() {}, currentTarget: imageForm });
    assert.equal(saved.wardrobe_templates.image.single, '单套图片自定义 {{wearer}}');
    assert.equal(saved.wardrobe_templates.user.single, '旧的 USER 单套');
    writesFail = true;
    imageForm.elements.single.value = '保存失败的图片模板';
    api.saveWardrobeTemplate({ preventDefault() {}, currentTarget: imageForm });
    assert.equal(api.state().wardrobeTemplates.image.single, '单套图片自定义 {{wearer}}', '图片模板保存失败不更新生效配置');
    writesFail = false;

    descriptionForm.elements.outfit.value = '服装提示|{{name}}|{{category}}|忽略人物';
    descriptionForm.elements.namedItem('item').value = '单品提示|{{name}}|{{category}}|忽略其他服装和人物';
    api.saveDescriptionPrompts({ preventDefault() {}, currentTarget: descriptionForm });
    assert.equal(saved.wardrobe_description_prompts.item, descriptionForm.elements.namedItem('item').value);
    api.loadWardrobeTemplates();
    api.loadDescriptionPrompts();
    assert.equal(imageForm.elements.single.value, '单套图片自定义 {{wearer}}', '重新加载保留图片模板');
    assert.equal(descriptionForm.elements.namedItem('item').value, saved.wardrobe_description_prompts.item, '重新加载保留单品提示词');

    const before = JSON.stringify(api.state().descriptionPrompts);
    descriptionForm.elements.namedItem('item').value = '保存失败的单品提示';
    writesFail = true;
    api.saveDescriptionPrompts({ preventDefault() {}, currentTarget: descriptionForm });
    writesFail = false;
    assert.equal(JSON.stringify(api.state().descriptionPrompts), before, '保存失败不覆盖生效提示词');
    descriptionForm.elements.namedItem('item').value = '   ';
    api.saveDescriptionPrompts({ preventDefault() {}, currentTarget: descriptionForm });
    assert.equal(JSON.stringify(api.state().descriptionPrompts), before, '空白提示词不能保存');

    saved.wardrobe_items = [{ id: 'coat', name: '外套 {{category}} $&', category: 'coats', description: '', image: 'data:image/png;base64,aGVsbG8=' }];
    api.loadGarments();
    for (const mode of ['outfit', 'item']) {
        controls['[name="description_mode"]'].value = mode;
        await api.generateGarmentDescription();
        const request = requests.at(-1);
        assert.ok(request.user_input.startsWith(mode === 'outfit' ? '服装提示|' : '单品提示|'), '请求使用选中类型的已保存提示词');
        assert.ok(request.user_input.includes('外套 {{category}} $&|外套|'), '名称仅替换一次，分类使用中文名称');
        assert.equal(request.image, saved.wardrobe_items[0].image, '请求发送当前原图');
        assert.equal(request.max_chat_history, 0, '描述生成不携带聊天历史');
        assert.deepEqual(Array.from(request.ordered_prompts), ['user_input'], '只使用服装识别提示词');
        assert.equal(controls['[name="garment_description"]'].value, '生成的服装描述', '生成结果写入编辑框');
        assert.equal(controls['[name="garment_name"]'].value, '手工填写的名称', '旧纯文本回复保留名称');
        assert.equal(saved.wardrobe_items[0].description, '', '生成结果不自动覆盖已保存服装');
    }
    saved.wardrobe_items[0].image = 'user/images/tavern_wardrobe/coat.png';
    api.loadGarments();
    await api.generateGarmentDescription();
    await api.generateGarmentDescription();
    assert.equal(requests.at(-1).image, 'data:image/png;base64,aGVsbG8=', '文件图片生成描述前恢复原图内容');
    assert.equal(imageReads, 1, '重复生成描述复用文件读取缓存');
    assert.equal(saved.wardrobe_items[0].image, 'user/images/tavern_wardrobe/coat.png', '描述生成不改回内嵌存储');

    saved.wardrobe_groups = [{ id: 'daily', name: '日常' }];
    api.loadGarments();
    const roleTemplates = {
        user: { single: '{{name}}|{{description}}', wardrobe: '{{outfits}}' },
        char: { single: '{{name}}|{{description}}', wardrobe: '{{outfits}}' },
    };
    const names = { user: '玩家', char: '角色' };
    for (const mode of ['outfit', 'item']) {
        controls['[name="description_mode"]'].value = mode;
        const generated = { name: `  ${mode === 'outfit' ? '黑金礼服' : '金边外套'}  `, description: '  黑色衣身，金色滚边。\n配有腰带。  ', category: mode === 'outfit' ? [' 礼服 ', ' 夏季 ', '礼服'] : ' 日常 ' };
        // 裸 JSON 覆盖多标签去重，代码块覆盖旧单标签回复；两者都不能把包装写入描述。
        modelReply = mode === 'outfit' ? JSON.stringify(generated) : '```json\n' + JSON.stringify(generated) + '\n```';
        const savedName = saved.wardrobe_items[0].name;
        await api.generateGarmentDescription();
        assert.equal(controls['[name="garment_name"]'].value, generated.name.trim(), 'JSON name 填入名称');
        assert.equal(controls['[name="garment_description"]'].value, generated.description.trim(), 'JSON description 单独填入描述');
        assert.equal(saved.wardrobe_items[0].name, savedName, '生成名称仍由用户保存');
        const groupId = saved.wardrobe_items[0].groupIds.at(-1);
        assert.equal(api.state().garmentGroups.get(groupId), mode === 'outfit' ? '夏季' : '日常', 'AI category 作为标签名称');
        assert.ok(saved.wardrobe_items[0].groupIds.includes(groupId), 'AI 标签立即保存到服装归属');
        assert.equal(saved.wardrobe_items[0].category, 'coats', 'AI 标签不覆盖内置分类');
        assert.equal(saved.wardrobe_groups.length, 3, '首次创建多个标签，之后复用已有标签');
        if (mode === 'item') {
            assert.equal(groupId, 'daily', '同名标签复用原标识');
            assert.deepEqual(saved.wardrobe_items[0].groupIds.map(id => api.state().garmentGroups.get(id)), ['礼服', '夏季', '日常'], '识图追加标签且保留之前整理的标签');
        }
        assert.ok(requests.at(-1).user_input.includes('category') && requests.at(-1).user_input.includes('日常'), '请求包含标签输出要求和现有标签');
        assert.ok(api.saveSelectedGarment(), '生成结果可通过原有保存入口持久化');
        const item = saved.wardrobe_items[0];
        assert.equal(item.name, generated.name.trim());
        assert.equal(item.description, generated.description.trim());
        for (const wearer of ['user', 'char']) {
            for (const items of [[item], [item, { ...item, id: 'second', name: '第二件' }]]) {
                const content = api.buildWearerContent(items, wearer, { content_type: 'text' }, roleTemplates, names);
                assert.ok(content[0].text.includes(item.name) && content[0].text.includes(item.description), '两种角色的单套和衣柜模板都继承生成字段');
                assert.ok(!content[0].text.includes('"description"'), '模板发送字段正文，不发送 JSON 包装');
            }
        }
    }

    const originalName = controls['[name="garment_name"]'].value;
    const originalDescription = controls['[name="garment_description"]'].value;
    const originalTag = JSON.stringify(saved.wardrobe_items[0].groupIds);
    const originalSaved = JSON.stringify(saved);
    for (const invalid of ['{"name":', '{"name":"外套","description":42}', '{"name":" ","description":"正文"}', '{"description":"正文"}', '[]', '{"name":"外套","description":"正文","category":[]}', '{"name":"外套","description":"正文","category":["夏季",42]}', '{"name":"外套","description":"正文","category":[" "]}', '{"name":"外套","description":"正文","category":" "}']) {
        modelReply = invalid;
        await api.generateGarmentDescription();
        assert.equal(controls['[name="garment_name"]'].value, originalName, '非法回复不覆盖名称');
        assert.equal(controls['[name="garment_description"]'].value, originalDescription, '非法回复不覆盖描述');
        assert.equal(JSON.stringify(saved.wardrobe_items[0].groupIds), originalTag, '非法回复不覆盖标签');
        assert.equal(JSON.stringify(saved), originalSaved, '非法回复不改存档或创建标签');
        assert.equal(controls['.tw-garment-status'].dataset.error, 'true', '格式错误明确提示');
    }
    modelReply = JSON.stringify({ name: '新名称', description: '新描述', category: '新标签' });
    writesFail = true;
    await api.generateGarmentDescription();
    writesFail = false;
    assert.equal(JSON.stringify(saved), originalSaved, '标签保存失败时不留下空标签或部分归属');
    assert.equal(controls['[name="garment_name"]'].value, originalName);
    assert.equal(controls['[name="garment_description"]'].value, originalDescription);

    modelReply = '{"name":"兼容名称","description":"兼容描述"}';
    await api.generateGarmentDescription();
    assert.equal(controls['[name="garment_name"]'].value, '兼容名称', '兼容没有 category 的旧 JSON');
    assert.equal(JSON.stringify(saved.wardrobe_items[0].groupIds), originalTag, '旧 JSON 保留标签');
    modelReply = '  兼容纯文本  ';
    await api.generateGarmentDescription();
    assert.equal(controls['[name="garment_name"]'].value, '兼容名称', '纯文本不改名');
    assert.equal(controls['[name="garment_description"]'].value, '兼容纯文本');
    assert.equal(JSON.stringify(saved.wardrobe_items[0].groupIds), originalTag, '纯文本保留标签');
    saved.wardrobe_description_prompts = { outfit: '', item: 123 };
    api.loadDescriptionPrompts();
    assert.ok(api.state().descriptionPrompts.outfit.includes('人物'), '空白存档回退到约束人物的默认提示词');
    assert.ok(api.state().descriptionPrompts.item.includes('单品'), '非法类型在存档入口回退默认值');

    // 设置备份必须按字段挑选，不能因其他对象附加 API 属性而泄露连接信息。
    api.loadSendSettings();
    const secret = 'test-secret-must-never-be-exported';
    saved.wardrobe_api = { mode: 'custom', apiurl: `https://${secret}.test`, key: secret, model: secret, temperature: 0.7, max_tokens: 4000 };
    saved.other_private_data = secret;
    api.state().sendSettings.key = secret;
    api.state().wardrobeTemplates.user.apiurl = secret;
    api.state().descriptionPrompts.model = secret;
    await api.handleWardrobeData({ type: 'click', currentTarget: dataButtons[1] });
    const settingsJson = await downloadBlobs.get(downloads.at(-1).href).text();
    const backup = JSON.parse(settingsJson);
    assert.equal(downloads.at(-1).name, '衣柜设置.json');
    assert.deepEqual(Object.keys(backup).sort(), ['format', 'settings', 'version']);
    assert.equal(backup.format, 'tw-wardrobe-settings');
    assert.deepEqual(Object.keys(backup.settings).sort(), ['description_prompts', 'send', 'templates']);
    assert.deepEqual(Object.keys(backup.settings.send).sort(), ['content_type', 'marker_mode', 'position', 'send_content_rating']);
    assert.equal(backup.settings.send.send_content_rating, true, '设置备份包含分级开关');
    assert.equal(backup.settings.send.marker_mode, 'strip', '导出包含默认换装记录模式');
    assert.deepEqual(Object.keys(backup.settings.description_prompts).sort(), ['item', 'outfit']);
    assert.deepEqual(Object.keys(backup.settings.templates).sort(), ['char', 'image', 'user']);
    for (const template of Object.values(backup.settings.templates)) assert.deepEqual(Object.keys(template).sort(), ['single', 'wardrobe']);
    assert.ok(!settingsJson.includes(secret), '真实下载文件中没有任何 API 字段值或私有脚本变量');
    assert.equal(dataStatus.dataset.error, 'false');
    assert.ok(dataButtons.every(button => !button.disabled), '导出后恢复按钮');
    await api.handleWardrobeData({ type: 'click', currentTarget: dataButtons[0] });
    assert.equal(dataInput.opened, true, '导入按钮打开独立的设置文件选择器');

    const clothesBefore = JSON.stringify(saved.wardrobe_items);
    const apiBefore = JSON.stringify(saved.wardrobe_api);
    backup.settings.send.position = 'context_end';
    backup.settings.send.marker_mode = 'keep';
    backup.settings.send.send_content_rating = false;
    backup.settings.templates.user.single = '恢复的 USER 模板 {{name}}';
    backup.settings.description_prompts.outfit = '恢复的服装提示词';
    // 即使外部文件夹带 API 字段，导入也只能写入三个允许的脚本变量。
    backup.wardrobe_api = { key: 'malicious-key' };
    backup.settings.api = { key: 'malicious-key' };
    backup.settings.send.model = 'malicious-model';
    backup.settings.templates.user.key = 'malicious-key';
    dataInput.files = [{ text: async () => JSON.stringify(backup) }];
    dataInput.value = 'selected';
    await api.handleWardrobeData({ type: 'change', currentTarget: dataInput });
    assert.equal(JSON.stringify(saved.wardrobe_api), apiBefore, '导入不覆盖 API 密钥、地址、模型或其他连接参数');
    assert.equal(JSON.stringify(saved.wardrobe_items), clothesBefore, '设置导入不改变服装或原图');
    assert.equal(saved.wardrobe_send.position, 'context_end');
    assert.equal(saved.wardrobe_templates.user.single, '恢复的 USER 模板 {{name}}');
    assert.equal(forms.get('[data-template-owner="user"]').elements.single.value, '恢复的 USER 模板 {{name}}', '导入后刷新模板表单');
    assert.equal(sendForm.elements.position.value, 'context_end', '导入后刷新发送选项');
    assert.equal(saved.wardrobe_send.marker_mode, 'keep', '导入保存换装记录模式');
    assert.equal(sendForm.elements.marker_mode.value, 'keep', '导入后刷新换装记录选项');
    assert.equal(saved.wardrobe_send.send_content_rating, false, '设置导入保留关闭分级');
    assert.equal(sendForm.elements.send_content_rating.checked, false, '设置导入回填分级开关');
    const legacyBackup = structuredClone(backup);
    delete legacyBackup.settings.send.marker_mode;
    delete legacyBackup.settings.send.send_content_rating;
    assert.equal(api.parseWardrobeSettingsData(legacyBackup).send.send_content_rating, true, '旧设置备份默认开启分级');
    const invalidRating = structuredClone(backup);
    invalidRating.settings.send.send_content_rating = 'false';
    assert.throws(() => api.parseWardrobeSettingsData(invalidRating), /发送内容设置无效/, '分级开关仅接受布尔值');
    assert.equal(api.parseWardrobeSettingsData(legacyBackup).send.marker_mode, 'strip', '旧备份缺失模式时使用默认值');
    const invalidMarker = structuredClone(backup);
    invalidMarker.settings.send.marker_mode = 'invalid';
    assert.throws(() => api.parseWardrobeSettingsData(invalidMarker), /发送内容设置无效/, '拒绝无效记录模式');
    assert.equal(descriptionForm.elements.outfit.value, '恢复的服装提示词', '导入后刷新描述生成提示词');
    assert.equal(saved.wardrobe_send.model, undefined, '丢弃发送设置中夹带的 API 字段');
    assert.equal(saved.wardrobe_templates.user.key, undefined, '丢弃模板中夹带的 API 字段');
    assert.equal(dataInput.value, '', '导入后允许再次选择同一文件');
    assert.equal(dataStatus.dataset.error, 'false');

    const beforeInvalidImport = JSON.stringify(saved);
    const incomplete = structuredClone(backup);
    delete incomplete.settings.templates.char.wardrobe;
    const invalidSend = structuredClone(backup);
    invalidSend.settings.send.content_type = 'invalid';
    const invalidPrompts = structuredClone(backup);
    invalidPrompts.settings.description_prompts.item = '';
    for (const invalid of ['{bad', JSON.stringify({ format: 'tw-wardrobe', version: 1, items: [], groups: [] }), JSON.stringify(incomplete), JSON.stringify(invalidSend), JSON.stringify(invalidPrompts)]) {
        dataInput.files = [{ text: async () => invalid }];
        await api.handleWardrobeData({ type: 'change', currentTarget: dataInput });
        assert.equal(JSON.stringify(saved), beforeInvalidImport, '文件校验失败时不提交部分设置');
        assert.equal(dataStatus.dataset.error, 'true');
        assert.ok(dataButtons.every(button => !button.disabled), '导入失败后恢复操作按钮');
    }
    dataInput.files = [{ text: async () => JSON.stringify(backup) }];
    writesFail = true;
    await api.handleWardrobeData({ type: 'change', currentTarget: dataInput });
    writesFail = false;
    assert.equal(JSON.stringify(saved), beforeInvalidImport, '保存失败不覆盖设置或 API');
    assert.match(dataStatus.textContent, /存储失败/);
    assert.equal(api.state().sendSettings.position, 'context_end', '保存失败保留当前发送缓存');

    saved.wardrobe_items[0].image = '';
    saved.wardrobe_selections = { user: ['coat'], char: [] };
    api.loadGarments();
    const beforeContentFailure = JSON.stringify(saved);
    backup.settings.send.content_type = 'image';
    await api.handleWardrobeData({ type: 'change', currentTarget: dataInput });
    assert.equal(JSON.stringify(saved), beforeContentFailure, '导入新发送类型时仍验证已应用服装是否具备图片');
    assert.match(dataStatus.textContent, /图片/);
    console.log('通过图片模板保存、旧模板兼容、描述提示词持久化、生成类型切换、实际请求及失败保留检查。');
    console.log('通过 JSON 名称与描述解析、AI 标签创建及复用、保存失败回滚、纯文本兼容及 USER/Char 模板继承检查。');
    console.log('通过设置导出字段白名单、API 零导出与零覆盖、设置恢复、错误文件及保存失败检查。');
    await checkGeneratedOrganization();
    await checkDescriptionOptions();
    await checkGeneratedTagApproval();
    await checkBulkDescriptions();
}

/**
 * 验证识图携带全部标签、已有标签免确认、新标签同意或拒绝及批量识图的逐图授权。
 * @returns {Promise<void>} 标签创建授权与结果保留断言通过后结束。
 */
async function checkGeneratedTagApproval() {
    saved.wardrobe_selections = { user: [], char: [] };
    saved.wardrobe_groups = [{ id: 'daily', name: '日常' }, { id: 'formal', name: '正式', filters: ['shoes'] }];
    saved.wardrobe_items = [{ id: 'approval', name: '待识别', category: 'other', description: '', image: 'data:image/png;base64,aGVsbG8=', groupIds: ['daily'] }];
    api.loadGarments();
    controls['[name="garment_description"]'].value = '';
    modelReply = JSON.stringify({ name: '外套', description: '外套描述', category: 'coats', tags: ['正式'] });
    const beforeExisting = confirmations.length;
    await api.generateGarmentDescription();
    assert.equal(confirmations.length, beforeExisting, '只有已有标签时不弹创建确认');
    assert.ok(requests.at(-1).user_input.includes('现有标签：["日常","正式"]'), '发送完整标签表，包括其他分类中的标签');
    assert.ok(requests.at(-1).user_input.includes('用户确认后才能创建'), '请求明确新标签需要用户同意');
    assert.deepEqual(saved.wardrobe_items[0].groupIds, ['daily', 'formal'], '直接匹配已有标签，保留手动标签');

    modelReply = JSON.stringify({ name: '冬季外套', description: '冬季外套描述', category: 'coats', tags: ['日常', ' 冬季 ', '冬季', '保暖'] });
    await api.generateGarmentDescription();
    assert.equal(confirmations.length, beforeExisting + 1, '同张图片多个新标签只确认一次');
    assert.match(confirmations.at(-1), /冬季外套.*建议新增以下标签：[\s\S]*冬季、保暖/);
    assert.ok(!confirmations.at(-1).includes('日常'), '确认框只列新标签');
    assert.deepEqual(saved.wardrobe_groups.map(group => group.name), ['日常', '正式', '冬季', '保暖'], '同意后创建且去重');
    await api.generateGarmentDescription();
    assert.equal(confirmations.length, beforeExisting + 1, '创建成功后再次匹配不重复确认');
    assert.ok(requests.at(-1).user_input.includes('现有标签：["日常","正式","冬季","保暖"]'), '后续识图携带刚获准创建的标签');

    confirmation = false;
    // 旧版 category 标签字段同样必须获得授权，不能绕过新标签创建规则。
    modelReply = JSON.stringify({ name: '夏季服装', description: '夏季描述', category: ['夏季', '日常'] });
    await api.generateGarmentDescription();
    assert.ok(!saved.wardrobe_groups.some(group => group.name === '夏季'), '拒绝后不创建旧格式提议的新标签');
    assert.equal(controls['[name="garment_name"]'].value, '夏季服装', '拒绝新标签仍填入名称');
    assert.equal(controls['[name="garment_description"]'].value, '夏季描述', '拒绝新标签仍填入描述');
    assert.equal(controls['.tw-garment-status'].dataset.error, 'false', '拒绝新增不视为识图失败');

    saved.wardrobe_items = saved.wardrobe_items.concat({ ...saved.wardrobe_items[0], id: 'second', name: '第二件', groupIds: [] });
    api.loadGarments();
    controls['[name="garment_description"]'].value = '';
    confirmationEffect = message => !message.includes('建议新增以下标签');
    modelReply = JSON.stringify({ name: '批量套装', description: '批量描述', category: 'outfits', tags: ['正式', '待批准'] });
    const beforeBatch = confirmations.length;
    await api.generateMissingGarmentDescriptions();
    assert.equal(confirmations.length, beforeBatch + 3, '批次启动确认不代替每张图片的新标签确认');
    assert.ok(!saved.wardrobe_groups.some(group => group.name === '待批准'), '批量拒绝新标签不创建空标签');
    for (const item of saved.wardrobe_items) {
        assert.equal(item.category, 'outfits', '批量拒绝新标签仍保存分类');
        assert.equal(item.name, '批量套装');
        assert.equal(item.description, '批量描述');
        assert.ok(item.groupIds.includes('formal'), '批量拒绝新标签仍保存匹配到的已有标签');
    }
    assert.match(controls['.tw-library-status'].textContent, /已识别并保存 2 张/);
    confirmationEffect = undefined;
    confirmation = true;
    console.log('通过全部标签发送、已有标签免确认、新标签创建授权、旧格式兼容与批量拒绝后继续保存检查。');
}

/**
 * 验证单张与批量识图保存分类和标签，详情后续保存不回退分类，非法字段与存储失败不产生部分更新。
 * @returns {Promise<void>} 分类、标签及旧格式兼容断言完成后结束。
 */
async function checkGeneratedOrganization() {
    saved.wardrobe_selections = { user: [], char: [] };
    saved.wardrobe_groups = [{ id: 'daily', name: '日常' }];
    saved.wardrobe_items = [{ id: 'auto', name: '待识别', category: 'other', description: '', image: 'data:image/png;base64,aGVsbG8=', groupIds: ['daily'] }];
    api.loadGarments();
    controls['[name="garment_category"]'].value = 'other';
    for (const [category, expected, tags] of [['coats', 'coats', ['日常', ' 冬季 ', '冬季']], ['鞋子', 'shoes', []]]) {
        modelReply = JSON.stringify({ name: '识别名称', description: '识别描述', category, tags });
        await api.generateGarmentDescription();
        assert.equal(saved.wardrobe_items[0].category, expected, '识图支持分类标识和中文分类名');
        assert.equal(controls['[name="garment_category"]'].value, expected, '详情分类同步识图结果');
        assert.deepEqual(saved.wardrobe_items[0].groupIds.map(id => api.state().garmentGroups.get(id)), ['日常', '冬季'], '标签去重并复用已有标签，空数组保留手动标签');
        assert.ok(api.saveSelectedGarment(), '可继续保存生成的名称与描述');
        assert.equal(saved.wardrobe_items[0].category, expected, '后续保存不会写回原分类');
    }
    assert.equal(saved.wardrobe_groups.length, 2, '内置分类不会误创建为分组');
    assert.ok(requests.at(-1).user_input.includes('最终输出格式') && requests.at(-1).user_input.includes('"id":"coats"') && requests.at(-1).user_input.includes('tags 为标签名称数组'), '自定义旧提示词后仍附带分类枚举与独立标签协议');

    const original = JSON.stringify(saved);
    const originalCategory = controls['[name="garment_category"]'].value;
    for (const tags of [null, '冬季', [42], [' ']]) {
        modelReply = JSON.stringify({ name: '不应更新', description: '不应更新', category: 'dresses', tags });
        await api.generateGarmentDescription();
        assert.equal(JSON.stringify(saved), original, '非法标签不得部分保存有效分类');
        assert.equal(controls['[name="garment_category"]'].value, originalCategory, '非法回复保留详情分类');
        assert.equal(controls['.tw-garment-status'].dataset.error, 'true');
    }
    modelReply = JSON.stringify({ name: '不应更新', description: '不应更新', category: 'dresses', tags: ['新分组'] });
    writesFail = true;
    await api.generateGarmentDescription();
    writesFail = false;
    assert.equal(JSON.stringify(saved), original, '保存失败保留分类、标签和描述');
    assert.equal(api.state().garments.get('auto').category, originalCategory, '保存失败保留内存分类');
    assert.equal(controls['[name="garment_category"]'].value, originalCategory, '保存失败不提前修改分类控件');

    // 只有分类或只有标签的回复仍可各自生效，兼容旧 JSON 缺少新增字段的情况。
    for (const fields of [{ category: 'tops' }, { tags: ['夏季'] }, { category: ['旧分组'], tags: ['夏季'] }]) {
        modelReply = JSON.stringify({ name: '识别名称', description: '识别描述', ...fields });
        await api.generateGarmentDescription();
        assert.equal(saved.wardrobe_items[0].category, 'tops', '缺少分类或旧版 category 数组均保留现有分类');
    }
    assert.deepEqual(saved.wardrobe_items[0].groupIds.map(id => api.state().garmentGroups.get(id)), ['日常', '冬季', '夏季', '旧分组']);

    saved.wardrobe_items[0].description = '';
    api.loadGarments();
    controls['[name="garment_description"]'].value = '';
    modelReply = JSON.stringify({ name: '批量套装', description: '批量描述', category: 'outfits', tags: ['正式'] });
    await api.generateMissingGarmentDescriptions();
    assert.equal(saved.wardrobe_items[0].category, 'outfits', '批量识图同次保存内置分类');
    assert.equal(controls['[name="garment_category"]'].value, 'outfits', '批量识图同步当前详情分类');
    assert.equal(saved.wardrobe_items[0].description, '批量描述');
    assert.ok(saved.wardrobe_items[0].groupIds.some(id => api.state().garmentGroups.get(id) === '正式'), '批量识图自动归入标签分组');
    console.log('通过单张与批量识图自动分类、标签归组、详情同步、旧格式兼容及失败保留检查。');
}

/**
 * 验证分类、标签四种选项组合同时约束请求与保存；批量识图沿用同一选项，不触碰关闭项。
 * @returns {Promise<void>} 单张、旧字段兼容及批量断言通过后结束。
 */
async function checkDescriptionOptions() {
    const image = 'data:image/png;base64,aGVsbG8=';
    for (const category of ['on', 'off']) for (const tags of ['on', 'off']) {
        controls['[name="description_category"]'].value = category;
        controls['[name="description_tags"]'].value = tags;
        saved.wardrobe_items = [{ id: 'options', name: '原名称', category: 'tops', description: '', image, groupIds: ['daily'] }];
        saved.wardrobe_groups = [{ id: 'daily', name: '日常' }];
        api.loadGarments();
        controls['[name="garment_category"]'].value = 'tops';
        const previousConfirmations = confirmations.length;
        // 故意让模型始终返回全部字段，确保关闭项在回复入口被丢弃，而不只是修改提示词。
        modelReply = JSON.stringify({ name: '生成名称', description: '生成描述', category: 'coats', tags: ['冬季'] });
        await api.generateGarmentDescription();
        const request = requests.at(-1).user_input;
        assert.ok(request.includes(category === 'on' ? 'category 为一个服装分类标识' : 'AI 分类已关闭'));
        assert.ok(request.includes(tags === 'on' ? 'tags 为标签名称数组' : 'AI 标签已关闭'));
        assert.equal(saved.wardrobe_items[0].category, category === 'on' ? 'coats' : 'tops');
        assert.equal(controls['[name="garment_category"]'].value, category === 'on' ? 'coats' : 'tops');
        assert.equal(saved.wardrobe_groups.length, tags === 'on' ? 2 : 1);
        assert.deepEqual(saved.wardrobe_items[0].groupIds.map(id => api.state().garmentGroups.get(id)), tags === 'on' ? ['日常', '冬季'] : ['日常']);
        assert.equal(confirmations.length - previousConfirmations, tags === 'on' ? 1 : 0, '关闭标签时不弹出创建确认');
        assert.equal(controls['[name="garment_name"]'].value, '生成名称');
        assert.equal(controls['[name="garment_description"]'].value, '生成描述');
        assert.equal(saved.wardrobe_items[0].description, '', '单张识图仍保留描述草稿流程');
    }
    // 旧提示词用 category 返回标签；关闭分类后仍能使用标签，关闭标签则不从旧字段创建。
    for (const tags of ['on', 'off']) {
        controls['[name="description_tags"]'].value = tags;
        modelReply = JSON.stringify({ name: '旧名称', description: '旧描述', category: ['旧标签'] });
        const previousGroups = saved.wardrobe_groups.length;
        await api.generateGarmentDescription();
        assert.equal(saved.wardrobe_groups.length, previousGroups + (tags === 'on' ? 1 : 0));
        assert.equal(saved.wardrobe_items[0].category, 'tops');
    }
    saved.wardrobe_items = [
        { id: 'bulk-off-a', name: '甲', category: 'tops', description: '', image, groupIds: ['daily'] },
        { id: 'bulk-off-b', name: '乙', category: 'shoes', description: '', image, groupIds: [] },
    ];
    saved.wardrobe_groups = [{ id: 'daily', name: '日常' }];
    api.loadGarments();
    controls['[name="garment_description"]'].value = '';
    modelReply = JSON.stringify({ name: '批量名称', description: '批量描述', category: 'outfits', tags: ['不应新增'] });
    await api.generateMissingGarmentDescriptions();
    assert.deepEqual(saved.wardrobe_items.map(item => item.category), ['tops', 'shoes'], '批量关闭分类时保留每张原分类');
    assert.deepEqual(saved.wardrobe_items.map(item => item.groupIds), [['daily'], []], '批量关闭标签时保留原标签');
    assert.ok(saved.wardrobe_items.every(item => item.name === '批量名称' && item.description === '批量描述'), '关闭可选项仍生成并保存批量描述');
    assert.equal(saved.wardrobe_groups.length, 1);
    controls['[name="description_category"]'].value = 'on';
    controls['[name="description_tags"]'].value = 'on';
    console.log('通过分类与标签四种选项、关闭项无写入或确认、旧字段兼容及批量描述生成检查。');
}

/**
 * 验证一键识图的确认、空白判断、自动保存及失败和取消后保留数据，继续复用当前模拟宿主。
 * @returns {Promise<void>} 所有批量识图断言通过后结束。
 */
async function checkBulkDescriptions() {
    const image = 'data:image/png;base64,aGVsbG8=';
    saved.wardrobe_selections = { user: [], char: [] };
    saved.wardrobe_groups = [{ id: 'daily', name: '日常' }];
    saved.wardrobe_items = [
        { id: 'draft', name: '草稿', category: 'tops', description: '', image },
        { id: 'done', name: '已识别', category: 'tops', description: ' 已有描述 ', image },
        { id: 'empty', name: '未识别', category: 'tops', description: '', image },
        { id: 'spaces', name: '空白描述', category: 'coats', description: ' \n\t ', image },
        { id: 'no-image', name: '无图片', category: 'tops', description: '', image: '' },
    ];
    controls['[name="garment_description"]'].value = '还未保存的描述';
    api.loadGarments();
    const original = JSON.stringify(saved.wardrobe_items);
    const start = requests.length;
    confirmation = false;
    await api.generateMissingGarmentDescriptions();
    assert.match(confirmations.at(-1), /2 张图片尚未识别/);
    assert.match(confirmations.at(-1), /仅识别没有描述的图片/);
    assert.equal(requests.length, start, '取消确认后不发送请求');
    assert.equal(JSON.stringify(saved.wardrobe_items), original, '取消后不改存档');

    confirmation = true;
    modelReply = JSON.stringify({ name: '识别名称', description: '识别描述', category: 'shoes', tags: ['日常'] });
    controls['[name="description_mode"]'].value = 'item';
    await api.generateMissingGarmentDescriptions();
    assert.equal(requests.length - start, 2, '只识别空描述和纯空白描述，不受分类或多选影响');
    for (const item of saved.wardrobe_items) {
        if (item.id === 'empty' || item.id === 'spaces') {
            assert.equal(item.name, '识别名称');
            assert.equal(item.description, '识别描述', '批量描述自动持久化');
            assert.equal(item.category, 'shoes', '批量识图自动更新未选中服装的分类');
            assert.equal(item.groupIds[0], 'daily', '复用同名标签');
        }
    }
    assert.equal(saved.wardrobe_items[1].description, ' 已有描述 ', '已有描述完整保留');
    assert.equal(controls['[name="garment_description"]'].value, '还未保存的描述', '保留当前描述草稿');
    assert.ok(requests.at(-1).user_input.startsWith(api.state().descriptionPrompts.outfit), '一键识图使用服装提示词');
    const promptCount = confirmations.length;
    await api.generateMissingGarmentDescriptions();
    assert.equal(confirmations.length, promptCount, '没有待识别图片时直接提示，不再确认');
    assert.match(controls['.tw-library-status'].textContent, /没有需要识图/);

    controls['[name="garment_description"]'].value = '';
    saved.wardrobe_items = saved.wardrobe_items.slice(2, 4).map(item => ({ ...item, description: '' }));
    api.loadGarments();
    let calls = 0;
    generationEffect = () => ++calls === 1 ? modelReply : '{"name":';
    await api.generateMissingGarmentDescriptions();
    assert.equal(saved.wardrobe_items[0].description, '识别描述', '后续失败保留已保存的结果');
    assert.equal(saved.wardrobe_items[1].description, '', '非法回复不写入描述');
    assert.match(controls['.tw-library-status'].textContent, /已保存 1 张图片/);
    assert.equal(controls['.tw-library-status'].dataset.error, 'true');

    generationEffect = undefined;
    writesFail = true;
    const beforeFailure = JSON.stringify(saved);
    await api.generateMissingGarmentDescriptions();
    writesFail = false;
    assert.equal(JSON.stringify(saved), beforeFailure, '存储失败不留下部分名称、描述或标签');
    assert.match(controls['.tw-library-status'].textContent, /存储失败/);

    let resolveGeneration;
    generationEffect = () => new Promise(resolve => { resolveGeneration = resolve; });
    const pending = api.generateMissingGarmentDescriptions();
    while (!resolveGeneration) await Promise.resolve();
    assert.equal(controls['[data-action="describe-all"]'].disabled, true, '执行期间禁用批量入口');
    const beforeDuplicate = requests.length;
    await api.generateMissingGarmentDescriptions();
    await api.generateGarmentDescription();
    assert.equal(requests.length, beforeDuplicate, '执行期间不重复启动单张或批量请求');
    api.stopDescriptionRequest();
    resolveGeneration(modelReply);
    await pending;
    generationEffect = undefined;
    assert.equal(JSON.stringify(saved), beforeFailure, '取消后忽略迟到回复');
    assert.ok(stoppedGenerations.at(-1).startsWith('wardrobe-description-'), '取消时停止实际生成');
    assert.equal(controls['[data-action="describe-all"]'].disabled, false);
    assert.equal(controls['[data-action="describe-all"]'].textContent, '一键识图');
    saved.wardrobe_items = [
        { id: 'visible', name: '当前标签', category: 'tops', description: '', image },
        { id: 'hidden', name: '其他标签', category: 'tops', description: '', image },
        { id: 'no-picture', name: '缺图片', category: 'tops', description: '', image: '' },
    ];
    api.loadGarments();
    api.filterMissing(['visible', 'no-picture']);
    controls['[name="garment_description"]'].value = '';
    const beforeFiltered = requests.length;
    await api.generateMissingGarmentDescriptions();
    assert.equal(requests.length - beforeFiltered, 1, '缺描述筛选仅识别当前可见且有图片的记录');
    assert.match(confirmations.at(-1), /当前筛选中有 1 张/);
    assert.equal(saved.wardrobe_items[0].description, '识别描述');
    assert.equal(saved.wardrobe_items[1].description, '', '不识别其他标签或搜索隐藏的记录');
    assert.equal(saved.wardrobe_items[2].description, '', '无图记录留待补图');
    console.log('通过一键识图的数量确认、跳过已有描述及草稿、自动保存、重复点击、失败保留和取消检查。');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
