const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
const secret = 'test-only-secret-do-not-export';
const connection = { mode: 'custom', apiurl: 'https://api.example.test/v1', key: secret, model: 'vision', temperature: 0, max_tokens: 1024 };
const storageKey = 'tavern-wardrobe:api:script-a';

/**
 * 执行真实 API 配置逻辑，仅替换宿主、浏览器存储及与布局相关的模型列表操作。
 * @param {Object} variables 初始脚本变量，会复制以避免测试互相影响。
 * @param {Map<string, string>} storage 可跨实例复用的浏览器本地存储。
 * @returns {Object} 产品入口、表单、脚本变量、请求记录及故障开关。
 */
function createHarness(variables = {}, storage = new Map()) {
    const saved = structuredClone(variables);
    const flags = { scriptId: 'script-a', readFails: false, writeFails: false, deleteFails: false, requestError: null };
    const status = { textContent: '', dataset: {} };
    const requests = [];
    const elements = {};
    for (const [name, value] of Object.entries({ mode: 'host', apiurl: '', key: '', model: '', temperature: '0.7', max_tokens: '4000' })) {
        elements[name] = {
            value, validity: { valid: true },
            get valueAsNumber() { return Number(this.value); },
            /** 模拟已通过原生校验的输入；参数为校验信息，无返回值。 */
            setCustomValidity() {},
        };
    }
    const customFields = {};
    const form = { elements, reportValidity: () => true, querySelector: selector => selector === '.tw-api-custom' ? customFields : status };
    const sandbox = {
        window: { parent: {
            document: {}, matchMedia: () => ({ matches: false }), AbortController,
            localStorage: {
                /** 读取配置并模拟浏览器拒绝访问；参数为存储键，返回 JSON 或空值。 */
                getItem(key) {
                    if (flags.readFails) throw new Error(secret);
                    return storage.get(key) ?? null;
                },
                /** 写入配置并模拟配额错误；参数为键和值，无返回值。 */
                setItem(key, value) {
                    if (flags.writeFails) throw new Error(secret);
                    storage.set(key, value);
                },
            },
        } },
        URL, testForm: form,
        getVariables: () => saved,
        getScriptId: () => flags.scriptId,
        getPreset: () => ({ settings: { temperature: 0.7, max_completion_tokens: 4000 } }),
        /** 删除指定旧变量，检查作用域并模拟宿主保存失败；返回删除结果。 */
        deleteVariable(name, options) {
            assert.equal(options.type, 'script');
            assert.equal(name, 'wardrobe_api');
            if (flags.deleteFails) throw new Error(secret);
            const existed = Object.hasOwn(saved, name);
            delete saved[name];
            return { variables: saved, delete_occurred: existed };
        },
        /** 禁止任何测试路径将密钥重新写入脚本变量；参数为更新对象，无返回值。 */
        insertOrAssignVariables(data) {
            assert.ok(!JSON.stringify(data).includes(secret));
            Object.assign(saved, structuredClone(data));
        },
        /** 模拟连接测试；参数为请求，返回固定短句或抛出指定错误。 */
        async generateRaw(config) {
            requests.push(config);
            if (flags.requestError) throw flags.requestError;
            return 'OK';
        },
        /** 模拟模型列表；参数为连接配置，返回模型名称或抛出指定错误。 */
        async getModelList(config) {
            requests.push(config);
            if (flags.requestError) throw flags.requestError;
            return ['vision'];
        },
    };
    const hooks = `
apiForm = testForm;
closeModelOptions = () => {};
openModelOptions = () => {};
setApiBusy = () => {};
globalThis.api = { loadApiSettings, saveApiSettings, requestApi, describeApiError,
    state: () => savedApiSettings, modelMessage: () => modelListMessage };
return;
`;
    vm.runInNewContext(source.replace('// 等待宿主文档就绪', hooks + '\n// 等待宿主文档就绪'), sandbox);
    return { api: sandbox.api, saved, storage, flags, status, elements, requests };
}

test('旧 API 配置先迁移到本机再删除，脚本导出不含密钥且重新加载保留连接', () => {
    const h = createHarness({ wardrobe_api: connection, wardrobe_items: [{ id: 'coat' }], unrelated: '保留' });
    h.api.loadApiSettings();
    assert.equal(h.elements.key.value, secret);
    assert.equal(h.api.state().temperature, 0, '零温度仍然有效');
    assert.equal(JSON.parse(h.storage.get(storageKey)).key, secret);
    assert.ok(!Object.hasOwn(h.saved, 'wardrobe_api'), '移除整个可导出连接');
    assert.ok(!JSON.stringify(h.saved).includes(secret), '模拟导出全部脚本变量也不含密钥');
    assert.equal(h.saved.unrelated, '保留');
    assert.deepEqual(h.saved.wardrobe_items, [{ id: 'coat' }]);
    const reloaded = createHarness(h.saved, h.storage);
    reloaded.api.loadApiSettings();
    assert.equal(reloaded.elements.key.value, secret);
    assert.equal(reloaded.elements.model.value, connection.model);
    assert.equal(reloaded.api.state().max_tokens, 1024);
});

test('本机已有连接优先，分享过来的旧变量被清理，其他脚本保持隔离', () => {
    const local = { ...connection, key: 'local-only-key' };
    const storage = new Map([[storageKey, JSON.stringify(local)]]);
    const h = createHarness({ wardrobe_api: connection }, storage);
    h.api.loadApiSettings();
    assert.equal(h.elements.key.value, local.key);
    assert.ok(!Object.hasOwn(h.saved, 'wardrobe_api'));
    const other = createHarness({}, storage);
    other.flags.scriptId = 'script-b';
    other.api.loadApiSettings();
    assert.equal(other.elements.key.value, '');
    assert.equal(other.api.state().mode, 'host');
});

test('保存只写浏览器，连接测试与模型列表仍使用完整密钥', async () => {
    const h = createHarness({ wardrobe_items: [] });
    h.api.loadApiSettings();
    for (const [name, value] of Object.entries(connection)) h.elements[name].value = String(value);
    h.api.saveApiSettings({ preventDefault() {} });
    assert.equal(h.status.dataset.error, 'false');
    assert.equal(JSON.parse(h.storage.get(storageKey)).key, secret);
    assert.deepEqual(h.saved, { wardrobe_items: [] });
    await h.api.requestApi({ currentTarget: { dataset: { apiAction: 'test' } } });
    assert.equal(h.requests[0].custom_api.key, secret);
    assert.equal(h.requests[0].custom_api.model, connection.model);
    assert.equal(h.requests[0].max_chat_history, 0);
    await h.api.requestApi({ currentTarget: { dataset: { apiAction: 'models' } } });
    assert.equal(h.requests[1].key, secret);
    h.elements.key.value = '';
    h.api.saveApiSettings({ preventDefault() {} });
    assert.equal(JSON.parse(h.storage.get(storageKey)).key, '', '清空并保存能删除本机旧密钥');
});

test('迁移或保存失败时保留原配置，提示不回显异常中的密钥并允许重试', () => {
    const h = createHarness({ wardrobe_api: connection });
    h.flags.writeFails = true;
    h.api.loadApiSettings();
    assert.equal(h.saved.wardrobe_api.key, secret, '未持久保存成功前不删除唯一配置');
    assert.equal(h.storage.size, 0);
    assert.equal(h.status.dataset.error, 'true');
    assert.ok(!h.status.textContent.includes(secret));
    h.flags.writeFails = false;
    h.flags.deleteFails = true;
    h.api.loadApiSettings();
    assert.equal(JSON.parse(h.storage.get(storageKey)).key, secret);
    assert.equal(h.status.dataset.error, 'true');
    assert.ok(!h.status.textContent.includes(secret));
    h.flags.deleteFails = false;
    h.api.loadApiSettings();
    assert.ok(!Object.hasOwn(h.saved, 'wardrobe_api'));
    h.elements.key.value = 'unsaved-key';
    h.flags.writeFails = true;
    h.api.saveApiSettings({ preventDefault() {} });
    assert.equal(h.api.state().key, secret, '失败时识图仍使用原连接');
    assert.equal(JSON.parse(h.storage.get(storageKey)).key, secret);
    assert.equal(h.status.dataset.error, 'true');
    assert.ok(!h.status.textContent.includes(secret));
});

test('读取被拒或 JSON 损坏时不泄露错误、不覆盖本机文件或删除旧配置', () => {
    const h = createHarness({ wardrobe_api: connection });
    h.flags.readFails = true;
    h.api.loadApiSettings();
    assert.equal(h.status.dataset.error, 'true');
    assert.ok(!h.status.textContent.includes(secret));
    assert.equal(h.saved.wardrobe_api.key, secret);
    h.flags.readFails = false;
    h.storage.set(storageKey, `broken-json-${secret}`);
    h.api.loadApiSettings();
    assert.equal(h.status.dataset.error, 'true');
    assert.ok(!h.status.textContent.includes(secret));
    assert.equal(h.saved.wardrobe_api.key, secret);
    assert.equal(h.storage.get(storageKey), `broken-json-${secret}`);
});

test('测试、模型列表和识图共用错误说明，隐藏各自实际使用的密钥', async () => {
    const h = createHarness({ wardrobe_api: connection });
    h.api.loadApiSettings();
    assert.ok(!h.api.describeApiError(new Error(`上游异常 ${secret} / ${secret}`)).includes(secret));
    const unsavedKey = 'form-key-not-saved';
    h.elements.key.value = unsavedKey;
    h.flags.requestError = new Error(`上游异常 ${unsavedKey}`);
    for (const action of ['test', 'models']) {
        await h.api.requestApi({ currentTarget: { dataset: { apiAction: action } } });
        assert.equal(h.status.dataset.error, 'true');
        assert.ok(!h.status.textContent.includes(unsavedKey));
    }
    assert.ok(!h.api.modelMessage().includes(unsavedKey));
    assert.match(h.api.describeApiError({ status: 401, message: secret }), /验证失败/);
    assert.match(h.api.describeApiError({ status: 403, message: secret }), /访问被拒绝/);
});
