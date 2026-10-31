const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// 直接执行产品中的内容构建与注入函数，跳过宿主界面启动，不复制一份实现作为测试对象。
const source = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
const marker = '// 等待宿主文档就绪';
assert.ok(source.includes(marker), '应能定位宿主启动边界');
const sandbox = { window: { parent: { document: {}, matchMedia: () => ({ matches: false }) } } };
vm.runInNewContext(source.replace(marker, 'globalThis.testApi = { buildWardrobeContent, buildWearerContent, insertWardrobeContent, loadGarments, readWearerSelections }; return;\n' + marker), sandbox);
const { buildWardrobeContent, buildWearerContent, insertWardrobeContent, loadGarments, readWearerSelections } = sandbox.testApi;
const item = { id: 'blue', name: '蓝色外套', category: 'coats', description: '深蓝色，银色刺绣', image: 'data:image/png;base64,aGVsbG8=' };
const history = Object.freeze([
    Object.freeze({ role: 'system', content: '系统提示一' }),
    Object.freeze({ role: 'system', content: '系统提示二' }),
    Object.freeze({ role: 'user', content: '历史提问' }),
    Object.freeze({ role: 'assistant', content: '历史回答' }),
    Object.freeze({ role: 'user', content: '本次提问', name: '玩家' }),
]);
let checked = 0;

for (const content_type of ['text', 'image', 'text_image']) {
    for (const position of ['system_end', 'context_end', 'user_end']) {
        const parts = buildWardrobeContent(item, { content_type, position });
        assert.equal(parts.some(part => part.type === 'text'), content_type !== 'image', '文字模式应生成真正的文字块');
        assert.equal(parts.some(part => part.type === 'image_url'), content_type !== 'text', '图片模式应生成真正的图片块');
        const messages = history.slice();
        insertWardrobeContent(messages, parts, position);
        const targetIndex = position === 'system_end' ? 1 : position === 'user_end' ? 4 : 5;
        const target = messages[targetIndex];
        const blocks = typeof target.content === 'string' ? [{ type: 'text', text: target.content }] : target.content;
        const text = blocks.filter(part => part.type === 'text').map(part => part.text).join('\n');
        assert.equal(text.includes(item.description), content_type !== 'image', '目标消息的服装文字应符合发送类型');
        assert.equal(blocks.some(part => part.type === 'image_url' && part.image_url.url === item.image), content_type !== 'text', '目标消息的图片应符合发送类型');
        assert.equal(messages.length, position === 'context_end' ? 6 : 5, '只在上下文末尾增加独立消息');
        assert.equal(target.role, position === 'user_end' ? 'user' : 'system', '目标消息角色应符合注入位置');
        for (let index = 0; index < history.length; index++) {
            if (index !== targetIndex) assert.equal(messages[index], history[index], '非目标消息不应被改写');
        }
        assert.equal(history[1].content, '系统提示二', '系统历史不应被污染');
        assert.equal(history[4].content, '本次提问', '用户历史不应被污染');
        if (position === 'user_end') assert.equal(target.name, '玩家', '原有消息字段应被保留');
        checked++;
    }
}

// 没有对应角色时创建消息；已有图片、工具信息和原始内容数组均应保留。
for (const position of ['system_end', 'context_end', 'user_end']) {
    const messages = [];
    insertWardrobeContent(messages, buildWardrobeContent(item, { content_type: 'text_image' }), position);
    assert.equal(messages.length, 1, '空上下文也应生成一条可发送的消息');
}
const originalParts = Object.freeze([
    Object.freeze({ type: 'text', text: '原有消息' }),
    Object.freeze({ type: 'image_url', image_url: { url: 'https://example.test/original.png', detail: 'auto' } }),
]);
const multipart = [{ role: 'user', content: originalParts, tool_call_id: 'original-tool' }];
insertWardrobeContent(multipart, buildWardrobeContent(item, { content_type: 'text_image' }), 'user_end');
assert.equal(multipart[0].content.length, 4, '追加图文时应保留已有两个内容块');
assert.equal(originalParts.length, 2, '原始内容数组不能被追加');
assert.equal(multipart[0].tool_call_id, 'original-tool', '工具字段应保留');
assert.throws(() => buildWardrobeContent({ ...item, description: '' }, { content_type: 'text' }), /描述/, '缺少描述时不能假装发送成功');
assert.throws(() => buildWardrobeContent({ ...item, image: '' }, { content_type: 'image' }), /图片/, '缺少图片时不能把地址文字充当图片');

// USER 和 Char 各自按实际套数选择模板；图片模式不额外附加文字描述。
const templates = {
    user: { single: 'USER单套|{{user}}|{{name}}|{{description}}', wardrobe: 'USER衣柜|{{wearer}}|{{count}}|{{outfits}}' },
    char: { single: 'Char单套|{{char}}|{{name}}|{{description}}', wardrobe: 'Char衣柜|{{wearer}}|{{count}}|{{outfits}}' },
};
const names = { user: '玩家甲', char: '角色乙' };
const second = { ...item, id: 'red', name: '红色长裙', description: '红色丝绸' };
for (const wearer of ['user', 'char']) {
    for (const items of [[], [item], [item, second]]) {
        for (const content_type of ['text', 'image', 'text_image']) {
            const parts = buildWearerContent(items, wearer, { content_type }, templates, names);
            const textParts = parts.filter(part => part.type === 'text');
            const images = parts.filter(part => part.type === 'image_url');
            assert.equal(images.length, content_type === 'text' ? 0 : items.length, '每套图片均应保留');
            assert.equal(textParts.length, items.length && content_type !== 'image' ? 1 : 0, '没有选择或只发图片时不生成模板文字');
            if (textParts.length) {
                const text = textParts[0].text;
                assert.ok(text.includes(names[wearer]), '模板应使用对应角色名称');
                assert.ok(text.startsWith(`${wearer === 'user' ? 'USER' : 'Char'}${items.length === 1 ? '单套' : '衣柜'}|`), '模板应按角色和套数独立选择');
                assert.ok(text.includes(item.description), '模板应包含第一套服装');
                if (items.length > 1) assert.ok(text.includes(second.description) && text.includes('|2|'), '衣柜模板应包含全部服装与数量');
            }
        }
    }
}
for (const position of ['system_end', 'context_end', 'user_end']) {
    const parts = [
        ...buildWearerContent([item], 'user', { content_type: 'text_image' }, templates, names),
        ...buildWearerContent([item, second], 'char', { content_type: 'text_image' }, templates, names),
    ];
    const messages = history.slice();
    insertWardrobeContent(messages, parts, position);
    const target = messages[position === 'system_end' ? 1 : position === 'user_end' ? 4 : 5];
    const text = target.content.filter(part => part.type === 'text').map(part => part.text).join('\n');
    assert.ok(text.includes('USER单套') && text.includes('Char衣柜'), '两种角色可同时使用不同模式');
    assert.equal(target.content.filter(part => part.type === 'image_url').length, 3, '同时发送应保留两种角色的全部图片');
}
const literal = buildWearerContent([{ ...item, description: '{{char}} $&' }], 'user', { content_type: 'text' }, templates, names);
assert.ok(literal[0].text.includes('{{char}} $&'), '服装描述中的占位符和替换符不得被二次解释');

// 入口兼容旧版 Char 单套状态，新版明确的空集合不会重新激活旧状态。
const chatVariables = { wardrobe_active_id: item.id };
sandbox.SillyTavern = { getCurrentChatId: () => 'chat' };
sandbox.getVariables = option => option.type === 'script' ? { wardrobe_items: [item, second] } : chatVariables;
loadGarments();
assert.equal(readWearerSelections().char.has(item.id), true, '旧版单套服装应保留为 Char 选择');
chatVariables.wardrobe_selections = { user: [item.id, item.id, 'missing'], char: [second.id] };
assert.equal(readWearerSelections().user.size, 1, '入口应去重并忽略不存在的服装');
assert.equal(readWearerSelections().char.has(second.id), true, '角色选择应相互独立');
chatVariables.wardrobe_selections = { user: [], char: [] };
assert.equal(readWearerSelections().char.size, 0, '取消全部选择后不得回退到旧版单套状态');
console.log(`通过 ${checked} 种发送位置组合、USER/Char 模板切换、多模态保留及旧选择兼容检查。`);
