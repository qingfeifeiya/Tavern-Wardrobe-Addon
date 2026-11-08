const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');

/** 最小日志节点；无构造参数，用于验证实际渲染结果和文本安全。 */
class LogNode {
    /** 创建可展开的节点，返回节点实例。 */
    constructor() { this.children = []; this.dataset = {}; this.textContent = ''; this.open = false; this.scrollTop = 0; this.scrollHeight = 100; this.clientHeight = 100; }
    /** 接收子节点并展开文档片段；无返回值。 */
    append(...nodes) { for (const node of nodes) this.children.push(...(node.fragment ? node.children : [node])); }
    /** 用指定节点替换内容；无返回值。 */
    replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
    /** 返回展开记录，参数为详情选择器。 */
    querySelectorAll() { return this.children.filter(node => node.open); }
    /** 展开模态窗口；无参数和返回值。 */
    showModal() { this.open = true; }
    /** 关闭模态窗口；无参数和返回值。 */
    close() { this.open = false; }
}

/**
 * 在模拟的双窗口中运行真实日志代码，不启动依赖酒馆的衣柜初始化。
 * @returns {Object} 日志入口、窗口、节点、下载结果和计时任务。
 */
function createHarness() {
    const tasks = new Map();
    let timer = 0;
    /** 创建独立窗口的控制台和事件表；无参数，返回窗口对象。 */
    function createWindow() {
        const calls = [];
        return {
            calls, listeners: new Map(), navigator: { userAgent: '日志测试浏览器' },
            console: Object.fromEntries(['log', 'debug', 'info', 'warn', 'error'].map(level => [level, (...args) => calls.push({ level, args })])),
            /** 注册事件；接收名称和回调，无返回值。 */
            addEventListener(name, handler) { const entries = this.listeners.get(name) ?? new Set(); entries.add(handler); this.listeners.set(name, entries); },
            /** 注销事件；接收名称和回调，无返回值。 */
            removeEventListener(name, handler) { this.listeners.get(name)?.delete(handler); },
            /** 排队刷新；接收回调，返回计时标识。 */
            setTimeout(handler) { tasks.set(++timer, handler); return timer; },
            /** 取消刷新；接收计时标识，无返回值。 */
            clearTimeout(id) { tasks.delete(id); },
        };
    }
    const parent = createWindow();
    const window = createWindow();
    window.parent = parent;
    const elements = Object.fromEntries(['.tw-log-list', '.tw-log-filter', '.tw-log-search', '.tw-log-status'].map(selector => [selector, new LogNode()]));
    elements['.tw-log-filter'].value = 'all';
    elements['.tw-log-search'].value = '';
    const dialog = new LogNode();
    dialog.querySelector = selector => elements[selector];
    const downloads = [];
    const requests = [];
    const replies = { value: 'OK' };
    const wardrobeImage = { currentSrc: '/user/images/tavern_wardrobe/broken.png' };
    parent.document = {
        createElement: () => new LogNode(),
        createDocumentFragment: () => Object.assign(new LogNode(), { fragment: true }),
    };
    parent.matchMedia = () => ({ matches: false });
    parent.AbortController = AbortController;
    parent.navigator.clipboard = { writeText: async text => { parent.copied = text; } };
    parent.fetch = async (...args) => { requests.push(args); return replies.value; };
    const sandbox = {
        window, console: window.console, testDialog: dialog, testRoot: { contains: node => node === wardrobeImage },
        generateRaw: async config => { requests.push(config); if (replies.error) throw replies.error; return replies.value; },
        getModelList: async config => { requests.push(config); return ['vision']; },
        testDownload: (data, filename) => downloads.push({ data: JSON.parse(JSON.stringify(data)), filename }),
    };
    const hooks = `
logsPanel = testDialog;
root = testRoot;
savedApiSettings = { key: 'saved-secret' };
downloadWardrobeJson = testDownload;
globalThis.api = { installWardrobeLogging, stopWardrobeLogging, recordWardrobeLog, formatLogValue, formatBeijingLogTime,
    loggedGenerateRaw, loggedGetModelList, wardrobeFetch, openWardrobeLogs, renderWardrobeLogs,
    scheduleLogSearch, handleWardrobeLogs, logs: wardrobeLogs };
return;
`;
    vm.runInNewContext(source.replace('// 等待宿主文档就绪', hooks + '\n// 等待宿主文档就绪'), sandbox);
    return { api: sandbox.api, window, parent, elements, dialog, downloads, requests, replies, tasks, wardrobeImage };
}

test('日志采集、API 成败、脱敏、筛选复制导出、容量与卸载清理', async () => {
    const h = createHarness();
    const originalWarn = h.parent.console.warn;
    const originalDebug = h.window.console.debug;
    h.api.installWardrobeLogging();
    assert.equal(h.api.logs[0].level, 'info', '正常启动属于运行信息');
    assert.equal(h.api.formatBeijingLogTime(Date.parse('2026-11-05T16:36:13.232Z')), '2026-11-06T00:36:13.232+08:00', '固定使用北京时间并正确换日');
    assert.ok(h.api.logs[0].time.endsWith('+08:00'));
    h.window.console.debug('识图准备', { count: 2 });
    h.window.console.log('普通运行输出');
    assert.ok(h.api.logs.some(entry => entry.level === 'info' && entry.details.includes('普通运行输出')));
    h.window.console.warn('衣柜警告');
    const beforeUnrelated = h.api.logs.length;
    h.parent.console.warn('酒馆警告');
    h.parent.console.error('其他脚本错误');
    for (const listener of h.parent.listeners.get('unhandledrejection') ?? []) listener({ reason: new Error('无关 Promise') });
    for (const listener of h.parent.listeners.get('error')) {
        listener({ target: { currentSrc: '/user/images/unrelated.png' } });
        listener({ target: h.parent, message: '酒馆全局异常', filename: 'other-extension.js', error: new Error('无关异常') });
        // 即使地址相同，其他界面的图片也不属于衣柜，不按路径猜测归属。
        listener({ target: { currentSrc: h.wardrobeImage.currentSrc } });
    }
    assert.equal(h.api.logs.length, beforeUnrelated, '酒馆控制台、全局异常、Promise 和外部资源均不进入衣柜日志');
    assert.equal(h.parent.console.warn, originalWarn, '不接管父窗口控制台');
    const crash = new Error('现场异常 saved-secret');
    for (const listener of h.window.listeners.get('error')) listener({ message: '运行失败', error: crash, filename: 'wardrobe.js', lineno: 23, colno: 4 });
    for (const listener of h.window.listeners.get('unhandledrejection')) listener({ reason: crash });
    for (const listener of h.parent.listeners.get('error')) listener({ target: h.wardrobeImage });
    assert.equal(h.window.calls[0].args[0], '识图准备', '原控制台仍收到调用');
    assert.ok(h.api.logs.some(entry => entry.level === 'debug' && entry.details.includes('识图准备')));
    assert.ok(h.api.logs.some(entry => entry.level === 'warn'));
    assert.ok(h.api.logs.some(entry => entry.details.includes('wardrobe.js') && entry.details.includes('23')));
    assert.ok(h.api.logs.some(entry => entry.message.includes('Promise') && entry.details.includes('Error: 现场异常')));
    assert.ok(h.api.logs.some(entry => entry.details.includes('broken.png')));
    assert.equal(h.tasks.size, 0, '关闭日志时不安排渲染');

    const config = { generation_id: 'test-1', custom_api: { key: 'draft-secret', model: 'vision' }, image: 'data:image/png;base64,AAAA' };
    assert.equal(await h.api.loggedGenerateRaw(config), 'OK');
    assert.equal(h.requests[0], config, '原始请求参数完整传入宿主');
    assert.equal(h.requests[0].custom_api.key, 'draft-secret');
    h.replies.error = new Error('请求失败 draft-secret');
    await assert.rejects(h.api.loggedGenerateRaw(config), error => error === h.replies.error);
    assert.ok(h.api.logs.some(entry => entry.message.includes('失败（') && entry.details.includes('请求失败')));
    assert.equal((await h.api.loggedGetModelList({ key: 'draft-secret' }))[0], 'vision');
    const response = new Response('upstream failure draft-secret', { status: 403 });
    h.replies.value = response;
    assert.equal(await h.api.wardrobeFetch('/api/images/upload', { method: 'POST' }), response);
    assert.equal(await response.text(), 'upstream failure draft-secret', '日志读取副本，原响应仍可消费');
    assert.ok(h.api.logs.some(entry => entry.message.includes('HTTP 403') && entry.details.includes('upstream failure')));
    const circular = { authorization: 'unknown-key' }; circular.self = circular;
    h.api.recordWardrobeLog('debug', '循环对象', circular, 'Bearer unknown-bearer', 'https://example.test?key=query-secret');
    const all = JSON.stringify(h.api.logs);
    for (const hidden of ['saved-secret', 'draft-secret', 'AAAA', 'unknown-key', 'unknown-bearer', 'query-secret']) assert.ok(!all.includes(hidden), hidden);
    assert.ok(all.includes('[循环引用]'));

    h.api.openWardrobeLogs();
    assert.equal(h.dialog.open, true);
    assert.ok(h.elements['.tw-log-list'].children[0].children[0].textContent.startsWith(`${h.api.logs[0].time.slice(11, 23)} 北京时间`), '界面显示北京时间');
    h.elements['.tw-log-filter'].value = 'error';
    h.api.renderWardrobeLogs();
    assert.ok(h.elements['.tw-log-list'].children.every(row => row.dataset.level === 'error'));
    h.elements['.tw-log-search'].value = 'upstream';
    h.api.scheduleLogSearch();
    h.api.scheduleLogSearch();
    assert.equal(h.tasks.size, 1, '连续搜索合并刷新');
    h.api.renderWardrobeLogs();
    assert.equal(h.elements['.tw-log-list'].children.length, 1);
    assert.equal(h.elements['.tw-log-list'].children[0].children[1].textContent.includes('upstream'), true);
    /** 通过实际点击入口派发操作；参数为操作名，返回操作完成任务。 */
    const click = action => h.api.handleWardrobeLogs({ target: { closest: () => ({ dataset: { logAction: action } }) } });
    await click('copy');
    assert.ok(h.parent.copied.includes('DEBUG') && h.parent.copied.includes('WARN'), '复制全部而非筛选子集');
    assert.ok(h.parent.copied.includes(`[${h.api.logs[0].time}]`), '复制保留北京时间及时区');
    await click('export');
    assert.equal(h.downloads[0].data.logs.length, h.api.logs.length);
    assert.equal(h.downloads[0].filename, '衣柜日志.json');
    assert.equal(h.downloads[0].data.timeZone, 'Asia/Shanghai');
    assert.ok(h.downloads[0].data.exportedAt.endsWith('+08:00'), '导出时间使用北京时间');
    assert.ok(h.downloads[0].data.logs.every(entry => entry.time.endsWith('+08:00')));
    await click('clear');
    assert.equal(h.api.logs.length, 0);
    for (let index = 0; index < 1005; index++) h.api.recordWardrobeLog('debug', `记录 ${index}`);
    assert.equal(h.api.logs.length, 1000);
    assert.equal(h.api.logs[0].message, '记录 5');
    assert.ok(h.api.formatLogValue('x'.repeat(13000)).endsWith('[内容过长，已截断]'));
    await click('close');
    assert.equal(h.dialog.open, false);
    h.api.stopWardrobeLogging();
    assert.equal(h.parent.console.warn, originalWarn);
    assert.equal(h.window.console.debug, originalDebug);
    assert.equal(h.tasks.size, 0);
    for (const target of [h.window, h.parent]) for (const listeners of target.listeners.values()) assert.equal(listeners.size, 0);
});
