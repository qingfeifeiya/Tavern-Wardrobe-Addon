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
const controls = {
    '[name="description_mode"]': { value: 'outfit' },
    '[name="garment_description"]': { value: '' },
};
const saved = { wardrobe_templates: { user: { single: '旧的 USER 单套', wardrobe: '旧的 USER 衣柜' } } };
const requests = [];
let writesFail = false;
const sandbox = {
    window: { parent: { document: {}, matchMedia: () => ({ matches: false }), crypto: { randomUUID: () => 'test-request' } } },
    testSettingsPanel: { querySelector: selector => forms.get(selector) },
    testPanel: { querySelector: selector => controls[selector] },
    getVariables: () => saved,
    insertOrAssignVariables: data => { if (writesFail) throw new Error('存储失败'); Object.assign(saved, structuredClone(data)); },
    SillyTavern: { getCurrentChatId: () => '' },
    generateRaw: async config => { requests.push(config); return '  生成的服装描述  '; },
};
vm.createContext(sandbox);
const source = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
const hooks = `
settingsPanel = testSettingsPanel;
panel = testPanel;
root = { isConnected: true };
setDescriptionBusy = () => {};
setGarmentStatus = () => {};
globalThis.api = { loadWardrobeTemplates, saveWardrobeTemplate, loadDescriptionPrompts, saveDescriptionPrompts,
    loadGarments, generateGarmentDescription,
    state: () => ({ wardrobeTemplates, descriptionPrompts }),
};
return;
`;
vm.runInContext(source.replace('// 等待宿主文档就绪', hooks + '\n// 等待宿主文档就绪'), sandbox);
const api = sandbox.api;

/**
 * 验证旧模板兼容、两类提示词保存与失败保留，以及实际生成请求使用所选提示词。
 * @returns {Promise<void>} 全部断言完成后结束。
 */
async function main() {
    api.loadWardrobeTemplates();
    api.loadDescriptionPrompts();
    assert.equal(descriptionForm.elements.namedItem('item').value, api.state().descriptionPrompts.item, '单品提示词填入实际控件');
    assert.equal(api.state().wardrobeTemplates.user.single, '旧的 USER 单套', '新增设置保留旧角色模板');
    assert.ok(api.state().wardrobeTemplates.image.single.includes('服装参考图'), '旧存档补默认图片提示词');
    for (const prompt of Object.values(api.state().descriptionPrompts)) {
        assert.ok(prompt.includes('人物') && prompt.includes('背景') && prompt.includes('仅输出'), '默认提示词限制人物和背景，要求只输出描述');
    }

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
        assert.equal(saved.wardrobe_items[0].description, '', '生成结果不自动覆盖已保存服装');
    }
    saved.wardrobe_description_prompts = { outfit: '', item: 123 };
    api.loadDescriptionPrompts();
    assert.ok(api.state().descriptionPrompts.outfit.includes('人物'), '空白存档回退到约束人物的默认提示词');
    assert.ok(api.state().descriptionPrompts.item.includes('单品'), '非法类型在存档入口回退默认值');
    console.log('通过图片模板保存、旧模板兼容、描述提示词持久化、生成类型切换、实际请求及失败保留检查。');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
