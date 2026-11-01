const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// 直接执行产品中的内容构建与注入函数，跳过宿主界面启动，不复制一份实现作为测试对象。
const source = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
const marker = '// 等待宿主文档就绪';
assert.ok(source.includes(marker), '应能定位宿主启动边界');
const sandbox = { window: { parent: { document: {}, matchMedia: () => ({ matches: false }), AbortController } } };
vm.runInNewContext(source.replace(marker, 'globalThis.testApi = { buildWardrobeContent, buildWearerContent, insertWardrobeContent, loadGarments, readWearerSelections, injectWardrobeContent }; return;\n' + marker), sandbox);
const { buildWardrobeContent, buildWearerContent, insertWardrobeContent, loadGarments, readWearerSelections, injectWardrobeContent } = sandbox.testApi;
const item = { groupIds: [], id: 'blue', name: '蓝色外套', category: 'coats', description: '深蓝色，银色刺绣', image: 'data:image/png;base64,aGVsbG8=' };
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

// USER 和 Char 各自按候选记录数选择模板；保留旧命名的自定义模板，图片模式不套用角色文字模板。
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
            assert.equal(textParts.length, items.length ? 1 : 0, '有服装时附带对应的文字模板或图片提示词');
            if (textParts.length) {
                const text = textParts[0].text;
                assert.ok(text.startsWith(`【${wearer === 'user' ? 'USER' : 'Char'}（${names[wearer]}）的服装】`), '所有发送模式与自定义模板都必须明确穿着归属');
                assert.ok(text.includes('不得根据性别自动共享'), '不能将性别当成自动共享衣服的依据');
                assert.ok(text.includes(names[wearer]), '模板应使用对应角色名称');
                assert.ok(text.includes(`ID：${JSON.stringify(item.id)}`) && text.includes('分类：外套'), '自定义模板下仍有结构化候选信息');
                assert.ok(text.includes('固定穿搭规则') && text.includes('一身完整穿搭'), '三种发送类型都保留自由搭配规则');
                if (content_type === 'image') {
                    assert.ok(!text.includes(item.description), '默认图片提示词不强制附带已保存的文字描述');
                    assert.ok(!text.includes('USER单套|') && !text.includes('Char单套|'), '图片模式不套用角色文字模板');
                    assert.ok(text.includes('服装') && (text.includes('忽略') || text.includes('不采用')), '图片模式应附带服饰参考约束');
                    continue;
                }
                assert.ok(text.includes(`${wearer === 'user' ? 'USER' : 'Char'}${items.length === 1 ? '单套' : '衣柜'}|`), '模板应按角色和候选记录数独立选择');
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

// 自定义模板省略描述变量时，文字资料仍随候选清单提供，图片模式则保持不自动附加描述。
const briefTemplates = { user: { single: '自定义简短模板 {{name}}', wardrobe: '自定义简短模板 {{count}}' } };
for (const content_type of ['text', 'image', 'text_image']) {
    for (const items of [[item], [item, second]]) {
        const parts = buildWearerContent(items, 'user', { content_type }, briefTemplates, names);
        for (const candidate of items) assert.equal(parts[0].text.includes(candidate.description), content_type !== 'image');
        assert.equal(parts[0].text.includes('自定义简短模板'), content_type !== 'image', '不改写自定义模板，只补齐发送类型要求的资料');
    }
}

// 单条和衣柜图片提示词独立生效，兼容旧模板字段及尚未生成描述的图片。
const imageTemplates = { single: '单套图片|{{wearer}}|{{name}}', wardrobe: '衣柜图片|{{wearer}}|{{count}}|{{outfits}}' };
for (const wearer of ['user', 'char']) {
    for (const items of [[item], [item, second]]) {
        for (const content_type of ['text', 'image', 'text_image']) {
            const parts = buildWearerContent(items, wearer, { content_type }, templates, names, imageTemplates);
            const text = parts[0].text;
            const imagePrefix = items.length === 1 ? '单套图片|' : '衣柜图片|';
            assert.equal(text.includes(imagePrefix), content_type !== 'text', '图片提示词只用于含图片的发送方式');
            if (content_type !== 'text') {
                assert.ok(text.includes(`${imagePrefix}${names[wearer]}|`), '图片提示词替换对应角色名称');
                const urls = parts.filter(part => part.type === 'image_url').map(part => part.image_url.url);
                assert.deepEqual(Array.from(urls), items.map(item => item.image), '原图顺序与服装顺序一致');
            }
        }
    }
}
const imageWithoutDescription = buildWearerContent([{ ...item, description: '' }], 'char', { content_type: 'image' }, templates, names, imageTemplates);
assert.equal(imageWithoutDescription.length, 2, '未生成描述的图片也可以附带图片提示词发送');

// 旧聊天选择只迁移一次；之后首页、切换聊天和重载都以共用存档为准。
const chatVariables = { wardrobe_active_id: item.id };
const scriptVariables = { wardrobe_items: [item, second] };
let chatId = 'chat';
sandbox.SillyTavern = { getCurrentChatId: () => chatId };
sandbox.getVariables = option => option.type === 'script' ? scriptVariables : chatVariables;
sandbox.insertOrAssignVariables = (data, option) => {
    assert.equal(option.type, 'script', '旧选择迁移只写入共用脚本变量');
    Object.assign(scriptVariables, structuredClone(data));
};
loadGarments();
assert.equal(readWearerSelections().char.has(item.id), true, '旧版单套服装应保留为 Char 选择');
assert.deepEqual(scriptVariables.wardrobe_selections.char, [item.id], '旧选择持久迁移到共用存档');
chatVariables.wardrobe_selections = { user: [item.id, item.id, 'missing'], char: [second.id] };
assert.equal(readWearerSelections().char.has(item.id), true, '迁移后其他聊天旧值不覆盖共用选择');
delete scriptVariables.wardrobe_selections;
assert.equal(readWearerSelections().user.size, 1, '入口应去重并忽略不存在的服装');
assert.equal(readWearerSelections().char.has(second.id), true, '角色选择应相互独立');
chatId = '';
loadGarments();
assert.equal(readWearerSelections().char.has(second.id), true, '首页重载仍读取共用选择');
scriptVariables.wardrobe_selections = { user: [], char: [] };
chatId = 'other-chat';
assert.equal(readWearerSelections().char.size, 0, '取消全部选择后不得回退到旧版单套状态');

/**
 * 等待实际异步注入入口，验证两份角色清单与单角色发送，避免混合穿着归属。
 * @returns {Promise<void>} 两次注入和角色归属断言完成后结束。
 */
async function checkInjection() {
sandbox.SillyTavern.name1 = '男主';
sandbox.SillyTavern.name2 = '女主';
sandbox.SillyTavern.getContext = () => ({ chat: [] });
sandbox.toastr = { error(message) { assert.fail(message); } };
scriptVariables.wardrobe_selections = { user: [item.id], char: [second.id] };
const request = { chat: [{ role: 'user', content: '继续剧情' }] };
await injectWardrobeContent(request);
const roleBlocks = request.chat[0].content.filter(part => part.type === 'text' && part.text.startsWith('【'));
assert.equal(roleBlocks.length, 2, '两个角色分别生成服装清单');
assert.ok(roleBlocks[0].text.includes('USER（男主）') && roleBlocks[0].text.includes(item.name) && !roleBlocks[0].text.includes(second.name), 'USER 清单不能混入只分配给 Char 的服装');
assert.ok(roleBlocks[1].text.includes('Char（女主）') && roleBlocks[1].text.includes(second.name) && !roleBlocks[1].text.includes(item.name), 'Char 清单不能混入只分配给 USER 的服装');
scriptVariables.wardrobe_selections.user = [];
const charOnly = { chat: [{ role: 'user', content: '继续剧情' }] };
await injectWardrobeContent(charOnly);
assert.equal(typeof charOnly.chat[0].content, 'string');
assert.ok(charOnly.chat[0].content.includes('Char（女主）') && !charOnly.chat[0].content.includes('【USER'), '只分配给 Char 时不生成 USER 服装清单');

// 场景匹配需要真实标签；文字和图片模式都必须保留服装顺序与标签对应关系。
scriptVariables.wardrobe_items = [{ ...item, groupIds: ['day', 'summer'] }, { ...second, groupIds: ['evening'] }];
scriptVariables.wardrobe_groups = [{ id: 'day', name: '日常' }, { id: 'evening', name: '晚宴' }, { id: 'summer', name: '夏季' }];
loadGarments();
for (const wearer of ['user', 'char']) {
    for (const content_type of ['text', 'image', 'text_image']) {
        const parts = buildWearerContent(scriptVariables.wardrobe_items, wearer, { content_type }, templates, names, imageTemplates);
        const text = parts[0].text;
        assert.ok(text.includes(`1. ${item.name}：日常、夏季`), '第一套标签对应第一张图片');
        assert.ok(text.includes(`2. ${second.name}：晚宴`), '第二套标签对应第二张图片');
        const untagged = buildWearerContent([item], wearer, { content_type }, templates, names, imageTemplates);
        assert.ok(!untagged[0].text.includes('服装标签（用于匹配场景）'), '未分组的服装不补造场景标签');
        const single = buildWearerContent([scriptVariables.wardrobe_items[0]], wearer, { content_type }, templates, names, imageTemplates);
        assert.ok(single[0].text.includes('日常') && !single[0].text.includes('晚宴'), '角色清单只携带实际选择的标签');
    }
}
console.log(`通过 ${checked} 种发送位置组合、USER/Char 模板切换、多模态保留及旧选择兼容检查。`);
}

checkInjection().catch(error => { console.error(error); process.exitCode = 1; });
