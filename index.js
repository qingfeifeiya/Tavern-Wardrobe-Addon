// 衣柜插件：将本文件完整复制到酒馆助手脚本编辑器，保存并启用。
// 模板、样式与界面逻辑均在本文件维护，不依赖外部界面资源。
/**
 * 隔离脚本内部状态，避免与酒馆及其他脚本共享变量。
 * @returns {void} 无返回值。
 */
(function runWardrobe() {
const ICONS = {
    layers: '<path d="m12 3 9 4.5-9 4.5-9-4.5L12 3Z"/><path d="m3 12 9 4.5 9-4.5M3 16.5 12 21l9-4.5"/>',
    combine: '<rect x="3" y="3" width="11" height="11" rx="2"/><rect x="10" y="10" width="11" height="11" rx="2"/>',
    sparkle: '<path d="M10 3c.8 5 2.8 7 8 8-5.2 1-7.2 3-8 8-.8-5-2.8-7-8-8 5.2-1 7.2-3 8-8Z"/><path d="M19 3v4M17 5h4"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    minus: '<path d="M6 12h12"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14c1 1.5 2.4 2.2 4 2.2s3-.7 4-2.2M9 9.5h.01M15 9.5h.01"/>',
    dashed: '<circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5L6 20"/>',
    hanger: '<path d="M9 5a3 3 0 1 1 5.2 2L12 9v3l9 6a1.2 1.2 0 0 1-.7 2H3.7a1.2 1.2 0 0 1-.7-2l9-6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    list: '<path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"/>',
    shirt: '<path d="m8 3-5 4 3 4 2-1v11h8V10l2 1 3-4-5-4c-1 3-7 3-8 0Z"/>',
    trousers: '<path d="M7 3h10l2 18h-5l-2-12-2 12H5L7 3Zm0 4h10M12 3v6"/>',
    dress: '<path d="m9 3-1 5 2 4-6 9h16l-6-9 2-4-1-5M8 8h8M10 12h4"/>',
    coat: '<path d="m9 3-5 3-2 13 4 1 2-10v11h8V10l2 10 4-1-2-13-5-3-3 4-3-4Zm3 4v14M9 3l-1 6 4-2 4 2-1-6"/>',
    bra: '<path d="M5 3 3 12m16-9 2 9M2 12c0 8 9 8 10 1 1 7 10 7 10-1-5-3-8-1-10 1-2-2-5-4-10-1Z"/>',
    sock: '<path d="M12 3h8v10c0 3-8 8-11 8-4 0-6-4-3-6l6-4V3Zm0 4h8M8 14l5 5"/>',
    shoe: '<path d="M3 14c4 0 6-3 8-6l4 4 6 2v6H3v-6Zm0 3h18M11 8l-1-3M12 11l2-2M15 13l2-2"/>',
    bow: '<path d="M10 10 4 5c-3 4-3 10 0 14l6-5m4-4 6-5c3 4 3 10 0 14l-6-5M10 10h4v4h-4zM10 14l-3 7m7-7 3 7"/>',
    star: '<path d="m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1 3-6Z"/>',
    more: '<circle cx="4" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="20" cy="12" r="1"/>',
    heart: '<path d="M12 21 3 12C-3 5 7-1 12 6 17-1 27 5 21 12l-9 9Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
    sliders: '<path d="M6 3v18M18 3v18M2 8h8m4 8h8"/>',
    settings: '<path d="m9 3 1-2h4l1 2 3 2 2 1v4l-2 2v3l1 2-3 3-3-1-2 1-2 1-3-3 1-3-1-2-3-1V8l3-1 1-2 3-2Z"/><circle cx="12" cy="11" r="3"/>',
    close: '<path d="m5 5 14 14M5 19 19 5"/>',
    plus: '<path d="M12 4v16M4 12h16"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    file: '<path d="M5 2h9l5 5v15H5V2Zm9 0v6h5M8 12h8M8 16h6"/>',
    tag: '<path d="M3 4v7l10 10 8-8L11 3H4l-1 1Z"/><circle cx="8" cy="8" r="1"/>',
    pencil: '<path d="m4 16 12-12 4 4L8 20l-5 1 1-5Zm10-10 4 4"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
    box: '<path d="m2 10 10-5 10 5-10 5-10-5Zm2 2v7l8 4 8-4v-7M12 15v8M2 10l-1 5 5 2m16-7 1 5-5 2M12 1V-1M5 3 3 1m16 2 2-2"/>',
};
const CATEGORIES = [
    ['all', '全部', 'grid'], ['tops', '上装', 'shirt'], ['bottoms', '下装', 'trousers'],
    ['dresses', '连衣裙', 'dress'], ['coats', '外套', 'coat'], ['underwear', '内衣', 'bra'],
    ['socks', '袜子', 'sock'], ['shoes', '鞋子', 'shoe'], ['accessories', '配饰', 'bow'],
    ['outfits', '套装', 'layers'], ['other', '其他', 'more'],
];
const QUICK_FILTERS = [
    ['combinations', '搭配', 'combine'],
    ['favorites', '收藏', 'heart'], ['recent', '最近使用', 'clock'],
    ['assigned-user', '已分配 USER', 'user'], ['assigned-char', '已分配 Char', 'smile'],
    ['unassigned', '未分配', 'dashed'], ['missing-description', '缺描述', 'file'], ['missing-image', '无图片', 'image'],
];
const CATEGORY_FILTERS = [...CATEGORIES, ...QUICK_FILTERS];
const CATEGORY_LABELS = new Map(CATEGORY_FILTERS.map(([id, label]) => [id, label]));
const CATEGORY_FILTER_MAP = new Map(CATEGORY_FILTERS.map(filter => [filter[0], filter]));
const GARMENT_CATEGORIES = new Set(CATEGORIES.slice(1).map(([id]) => id));
// 排序时复用中文比较器，避免为每一次名称比较重复创建格式化对象。
const GARMENT_NAME_COLLATOR = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' });
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
// 旧图片字段继续作为正面，避免升级时迁移或覆盖已有原图。
const IMAGE_FIELDS = ['image', 'backImage'];
const IMAGE_SIDE_LABELS = { image: '正面', backImage: '背面' };
const IMPORT_METADATA_FIELDS = ['description', 'contentRating', 'favorite', 'descriptionOverride'];
// 使用酒馆原生图片目录，存档只保留路径，避免每次保存服装时重复序列化整张原图。
const IMAGE_FOLDER = 'tavern_wardrobe';
const DATA_IMAGE_PATTERN = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/;
const STORED_IMAGE_PATTERN = /^user\/images\/tavern_wardrobe\/[^/\\?#%]+\.(png|jpg|webp)$/;
// GitHub Release 下载跳转缺少跨域许可，只有这种链接尝试使用酒馆自带的代理。
const GITHUB_RELEASE_DOWNLOAD = /^https:\/\/github\.com\/[^/]+\/[^/]+\/releases\/download\//;
// 限制聊天参考图的像素和 JPEG 质量，减少多套服装请求体积；不改动保存的原图。
const SEND_IMAGE_MAX_EDGE = 1280;
const SEND_IMAGE_QUALITY = 0.82;
const IMAGE_CACHE_MAX_BYTES = 16 * 1024 * 1024;
const IMPORT_LINK_TIMEOUT_MS = 60_000;
const WEARERS = ['user', 'char'];
// 仅在酒馆保存剧情回复时补写穿搭，开场白和其他插件创建的楼层不参与。
const OUTFIT_REPLY_TYPES = new Set(['normal', 'regenerate', 'swipe', 'continue', 'append', 'appendFinal']);
// 独立选装把快照保存在楼层变量；旧模式继续读取 AI 楼层标记，只有保留历史模式才发送标记。
const MARKER_MODES = ['off', 'strip', 'keep', 'isolated'];
const DEFAULT_MARKER_MODE = 'strip';
const DEFAULT_OUTFIT_HISTORY_COUNT = 2;
// 仅配合 matchAll 与 replace 使用，避免全局正则的 lastIndex 影响后续读取。
const OUTFIT_MARKER = /<!--\s*outfit:(user|char)\s*=\s*([\s\S]*?)\s*-->/g;
// 识别脚本发布的 JSON 快照，仍允许旧名称标记以花括号开头。
const PUBLISHED_OUTFIT_SNAPSHOT = /^\{\s*"ids"\s*:/;
// 结构规则独立于用户模板，防止旧模板继续把单品视作互斥套装，或在普通转场时强制换衣。
const STYLING_RULES = [
    '固定穿搭规则（优先于模板中只选一条候选或转场即换装的旧要求）：实际穿着以“当前实际穿着”段落为准，模板中的服装资料均为候选。',
    '从可选衣柜选择一身完整穿搭，不是只选一条记录，也不是把全部候选同时穿上。可自由组合相容的上装、下装和鞋子；连衣裙可替代上装与下装，套装按实际资料判断已包含的衣物。',
    '外套、袜子、内衣与配饰按剧情需要选择，明确叠穿时允许同类多件。保存的搭配必须保留全部成员，可补充相容的独立单品；同一件衣物只穿一次。',
    '仅随搭配提供的成员不可拆出独立选用，另外明确列为独立候选的成员可以单独选择。结合剧情、场景、季节、风格及实际标签和资料选装；无标签不补造标签，缺少衣物或资料不虚构衣柜外的服装。',
    '尚未确定穿着时首次选择；已有当前穿着时保持整身，仅在明确换衣、回家准备或时间跳转等合理换装机会调整，普通转场不换衣。其他候选的资料只用于选装，不得混入当前穿着描写。',
].join('');
const TEMPLATE_OWNERS = [...WEARERS, 'image'];
const TEMPLATE_FIELDS = ['single', 'wardrobe'];
const TEMPLATE_VARIABLES = /\{\{(user|char|wearer|name|description|outfits|count)\}\}/g;
const DESCRIPTION_VARIABLES = /\{\{(name|category)\}\}/g;
// 只存历代默认识图提示词的全文指纹，升级时仍可区分旧默认值和用户自定义。
const LEGACY_DESCRIPTION_PROMPT_FINGERPRINTS = {
    outfit: new Set([
        0xe4c3c149f2a2e940n, 0x1e85d1f97cfc441cn, 0x6ca572c7f6c3585dn,
        0x618e7a6cf6a5362cn, 0x970e815df84dc919n,
    ]),
    item: new Set([
        0x98ebc8017bc03eedn, 0x11a6e1ae2e38a5b0n, 0x6794bec87634c16en,
        0xe2d7242c3d43ad61n, 0xa39330cf24d7b7d2n, 0x970e815df84dc919n,
    ]),
};
const DEFAULT_DESCRIPTION_PROMPTS = {
    // 单张整套识图和一键识图都使用这份提示词，将各件结构合并到同一条描述。
    outfit: `你是一位同时精通常规服装版型与异形特殊服饰结构的穿搭还原师。你能对照参考图，逆向推导整套穿搭里每一件服饰的【原始标准静态结构】，写出客观、精准、可1:1复刻的结构化描述。描述要同时适合小说剧情自然调用和直接转图片生成提示词。

本提示词专用于【整套穿搭】：画面中有两件及以上服饰（上装、下装、连体、外套、袜、鞋、配饰等）。你的任务是把整套穿搭合并写成一条描述，而不是拆成单品。

━━━━━━━━━━━━━━━━
【第零步：套装硬性规则】
━━━━━━━━━━━━━━━━
1. 无论画面里有几件服饰，只输出【一个】JSON对象，category 固定为 "outfits"。
2. 严禁输出数组，严禁为每件各输出一个JSON，严禁拆成多段多对象。
3. 所有服饰写进同一个 description，件与件之间用"【品类】"标签分隔。
4. 即使画面里只有一件主体服饰，也按套装格式输出，只写那一件。
5. 逐件判断是"常规款"还是"特殊剪裁款"，并分别套用对应写法。禁止给常规件添加任何暴露、遮挡范围、性感相关的描述。

━━━━━━━━━━━━━━━━
【铁律A：去体型还原（每一件都适用）】
━━━━━━━━━━━━━━━━
你描述的是"衣服本身"，不是"衣服穿在某个人身上的效果"。描述必须换人也成立。

1. 位置只用通用解剖基准点或衣服自身结构点定位：锁骨、胸骨、胸线、肋缘、肚脐、自然腰线、髋线、耻骨、股沟、大腿中部、膝盖、脚踝、袖笼、侧缝。禁止写厘米数，禁止写"刚好""勉强""被撑开""刚遮住"。
2. 松紧只用版型词表达：超宽松 / 宽松 / 常规 / 修身 / 紧身贴合。判断依据是剪裁余量，不是衣服在这个人身上的紧绷程度。
3. 弹力面料因身材产生的拉伸纹、绷紧感、撑开感，一律忽略，按"自然放松状态"描述。
4. 衣长、领口深度、开衩高度，一律换算成基准点位置，不要按这个人的身高或胸围写。
5. 禁止出现任何与人相关的词：胸型、身材大小、腰臀比例、肉感、勒痕、挤压、皮肤、流汗、表情神态。
6. 特殊款的受力与压陷，只描述布料、绳体、金属件的受力方向与压陷方向，属于结构设计，不描述个人身体的具体反应。

━━━━━━━━━━━━━━━━
【铁律B：去形变还原（每一件都适用）】
━━━━━━━━━━━━━━━━
1. 过滤动作折痕：弯腰、坐姿、挤压造成的临时折痕、偏移，不得写成衣服的设计。
2. 还原对称版型：衣服原本对称，仅因姿势扭转显得不对称时，按对称结构描述。
3. 过滤叠穿造成的临时遮挡：某件衣服被另一件盖住的部分，按它自身的完整结构推导，不要写成"被遮住所以没有"。

━━━━━━━━━━━━━━━━
【铁律C：背面与固定结构，证据优先（每一件都适用）】
━━━━━━━━━━━━━━━━
看不到背面时，禁止写"不可见""推测"，按以下顺序推导，不得套用固定句式：

1. 先找画面中的直接证据：肩带或颈带走向、侧缝、腰侧和胯侧是否有布料、拉链头、搭扣、面料弹性。凡是能看到布料的部位，背面对应位置默认也有布料，不得写成裸露。
2. 没有直接证据的部位，按"常规可成立、遮挡不少于正面"补全：
   - 挂脖/颈圈式：颈后系带或搭扣；上背开口深度不超过正面；腰线以下后片完整
   - 双肩带/吊带：肩带在背后垂直或交叉，下接后片
   - 无肩带/抹胸：后中排扣或隐形拉链
   - 连衣裙/连体衣：后中或侧边隐形拉链，或直接套穿
   - 裙/裤：后中或侧边拉链，或松紧腰头
   - 细绳款：两侧细绳固定，后片宽度与正面一致
   - 鞋袜：后跟形状和固定方式、袜口罗纹或吊袜带夹扣
3. 只有出现明确线索（极细带结构、能看到背部大面积无布料、单品本身是裸背设计），才能写成露背或全开背。
4. 画面中手持、垂落、来源不明的细绳或带子，不得默认视为某件服饰的结构，除非能看到它与该件相连。
5. 背面颜色、面料、花纹默认与正面延续，不新增正面没有的绳子、五金和装饰。
6. 套装中每件的背面只写一句：怎么固定，后背遮到哪里。

━━━━━━━━━━━━━━━━
【套装写法：顺序与结构】
━━━━━━━━━━━━━━━━
1. 开头一句总述：共几件、整体风格类型（只写服装风格，不写人物气质）。
2. 逐件描述，顺序固定为由上到下、由内到外：头饰/颈饰 → 上装 → 外套 → 下装或连体 → 袜 → 鞋 → 其他配饰。
3. 每件以"【品类】"开头，如【上装】【外套】【下装】【袜】【鞋】【配饰】。
4. 件内写法：
   - 常规件，固定顺序：品类与廓形 → 领口与肩线 → 袖型 → 衣长与腰线位置 → 下摆/裤脚形状 → 门襟与固定方式 → 面料与颜色 → 明显的设计细节。不适用的项直接跳过，不得补编。
   - 特殊剪裁件（有刻意挖空、剪裁缺口、敞开设计，或由极简布料、细绳、金属链构成），按下方【特殊剪裁件写法】。
5. 【层叠与连接关系】是套装独有的必写信息，写在相关件的描述里或最后统一一句，包括：
   - 谁压在谁外面（如：皮带压在衬衫外；外套敞开露出内层）
   - 下摆与腰头的关系（如：衬衫下摆扎入裙腰；上衣下摆盖住腰头）
   - 袜口与下装下摆之间的衔接位置（如：吊带夹扣固定在袜口，吊带自裙摆下延伸）
   - 配饰与哪一件相连
6. 颜色、图案、五金严格限定在各自件内，禁止跨件混色，禁止纹样扩散到别的件。同色系的不同件，要分别标注色名。
7. 只写与服饰结构相关的搭配关系，不写人物姿态、神态、背景、手持道具。

━━━━━━━━━━━━━━━━
【特殊剪裁件写法：几何图块与物理连线】
━━━━━━━━━━━━━━━━
最高要求：100%直白还原真实的布料遮挡范围、剪裁缺口与外露区域。不得保守化，不得用晦涩词汇绕圈，不得把挖空、细绳款脑补成完整胸罩或内裤，不得自行增加布料面积或改变露出度。

1. 去制式化几何拆解：不使用"上衣""内衣""裤子"等传统品类名，把该件视为"几何图块"加"连接线"，逐块写明形状（三角形、水滴形、半月形、不规则多边形）、面积或宽度（微型、两指宽长条、极细线）、解剖基准点坐标（如"从胸骨正中垂直向下延伸至肚脐"）。
2. 明确遮挡与留白：写"布料遮住了哪里，留白了哪里"，必须指出未遮盖区域。
3. 物理连接：写明孤立图块之间如何连接（如"两块倒三角织物通过一枚金属O型环在胸骨处相连"），路径完整，不遗漏环、扣、线。
4. 受力锚点：写明布料、绳体、金属件的受力方向与悬垂方向（如"金属饰品依重力悬垂""极细绳体沿股沟、臀缝方向向内压陷"）。只写服饰的物理关系，不写人物反应与主观评价。
5. 压陷与垂坠：极细绑带或紧绷图块边缘写明压陷方向与边缘轮廓；垂坠布料写明自然下垂形态。
6. 色彩分区锁死：禁用笼统单色词，使用细分标准色名（酒红、香槟金、墨黑、雾粉等）；逐块标注颜色及覆盖边界，五金单独标色。
7. 图案边界锁死：纹样、蕾丝的尺寸、疏密、所在几何区块写全，只存在于标注区块内。
8. 透光层级，四档精准选择：完全不透明实色 / 半透视（隐约可见底层轮廓）/ 高透视薄纱 / 全镂空网眼。严禁把透视材质写成实色。
9. 光影绑定：乳胶、皮革带镜面高光；薄纱透出底层漫反射；网眼带细碎投影；紧绷图块表面平滑、反光增强。

━━━━━━━━━━━━━━━━
【字数规则】
━━━━━━━━━━━━━━━━
按件累计：
- 简单件（T恤、袜子、短裙、配饰）：60–100字
- 结构复杂的常规件（大衣、连衣裙、西装）：120–200字
- 特殊剪裁件：200–300字，必须覆盖几何形状、连接路径、遮挡与留白、透光等级
- 总述一句 + 层叠连接关系，合计约30–60字
- 整段总长控制在400–900字，写完即止，严禁为凑字数添加画面中没有的细节。

━━━━━━━━━━━━━━━━
【语言与禁忌】
━━━━━━━━━━━━━━━━
- 纯客观物理描述，无抒情，无头尾总结，无评价与感受句（如"非常性感""显得很修身""搭配和谐"）。
- 用最容易听懂的服装结构词，拒绝生僻工业术语。同一类结构每次使用同一个词，不换说法。
- 禁止描写人物长相、姿态、背景环境、手持道具，禁止主观氛围评价。
- 看不到的部分不写"看不到"，按铁律C补全。
- 套装模式下，输出永远是单个JSON对象。看到多件服饰不是拆分的理由，而是合并描述的理由。

━━━━━━━━━━━━━━━━
【输出格式】
━━━━━━━━━━━━━━━━
严格配合系统追加的最终输出格式，仅输出合法 JSON 对象，不含 markdown 代码块、\`\`\`json 标记或任何额外解释。若系统要求的格式是数组，则数组内也只放一个元素。

{
"name": "套装名称（8字以内，概括整体，如：衬衫铅笔裙套装）",
"description": "按上述规则写成的一段描述，件与件以【品类】标签分隔",
"category": "outfits",
"tags": ["套装", "再列2–4个各件关键词"]
}

category 固定为 outfits，只写id，不写中文，不得使用其他值。

━━━━━━━━━━━━━━━━
【示例（仅供学习写法与密度，不要照抄内容）】
━━━━━━━━━━━━━━━━

示例1（常规套装）：
{
"name":"衬衫铅笔裙套装","description":"四件组合的通勤风套装，由上至下依次为：【上装】米白色长袖衬衫，常规偏松廓形，小翻领，肩线自然，袖笼宽松，袖长垂至手腕，前中单排扣，面料为半透视薄质，隐约可见内层轮廓，下摆扎入裙腰，后片廓形与前片一致。【下装】炭灰色高腰一步铅笔裙，修身，腰头位于自然腰线，宽度适中，一条黑色细皮带压在衬衫之外，裙长止于膝盖附近，后中开衩，后中隐形拉链固定。【袜】黑色过膝高筒袜，紧身贴合，袜口位于大腿中上部，宽幅蕾丝边呈波浪形，袜身带点纹蕾丝，袜口处有吊带夹扣，吊带自裙摆下方向上连接。【鞋】黑色尖头细跟浅口高跟鞋，鞋面低开口仅覆盖脚背前段，后跟为细圆柱形高跟。","category":"outfits","tags":["套装","衬衫","铅笔裙","吊带袜"]
}

示例2（含特殊剪裁件的套装）：
{
"name":"挖空挂脖裙套装","description":"三件组合，由上至下依次为：【上装】挂脖式连体短裙，金色圆环连接颈带与三角胸片上缘。胸前为两片小三角织物，仅盖住胸部上半部，三角片正下方做半圆形挖空，下胸区域直接外露。胸下围横向抓褶收拢，细带环绕固定。下摆为一片式前裙摆，仅遮挡小腹与腿间，两侧无侧缝，超高开衩直达腰际，胯骨与大腿外侧外露。后背由颈后搭扣固定，上背开口不深于正面，腰线以下后片完整。面料为高弹氨纶，细密闪粉，微高光泽，完全不透明，酒红色，金属圆环与搭扣为金色。【袜】黑色过膝袜，紧身贴合，袜口位于大腿中上部，罗纹袜口，哑光。【鞋】黑色细跟短靴，靴口止于脚踝，侧边拉链固定。","category":"outfits","tags":["套装","挂脖裙","镂空","过膝袜"]
}`,
    // 默认单品直接从参考图选取主体，使用独立的九类分类规则。
    item: `你是一位同时精通常规服装版型与异形特殊服饰结构的穿搭还原师。你能对照参考图，逆向推导服装的【原始标准静态结构】，写出客观、精准、可1:1复刻的结构化描述。描述要同时适合小说剧情自然调用和直接转图片生成提示词。

本提示词专用于【单品】：只描述画面中最主体的一件服饰。若画面里同时出现其他服饰，忽略它们，不描述，不合并。

━━━━━━━━━━━━━━━━
【第零步：先分流，再描述】
━━━━━━━━━━━━━━━━
先判断该单品属于哪一类，再选择对应写法：

- 常规款：没有刻意挖空、开裆、极简布料、绑带结构的普通服装。按【常规款写法】描述。禁止给常规款添加任何暴露、遮挡范围、性感相关的描述。
- 特殊剪裁款：在胸部、下胸、胯部、裆部等处有刻意挖空、剪裁缺口、敞开设计，或由极简布料、细绳、金属链构成的服饰。按【特殊剪裁款写法】描述，并启用其中的几何拆解与部位联动规则。

━━━━━━━━━━━━━━━━
【铁律A：去体型还原（所有款式）】
━━━━━━━━━━━━━━━━
你描述的是"衣服本身"，不是"衣服穿在某个人身上的效果"。描述必须换人也成立。

1. 位置只用通用解剖基准点或衣服自身结构点定位：锁骨、胸骨、乳头、胸线、肋缘、肚脐、自然腰线、髋线、耻骨、股沟、大腿中部、膝盖、脚踝、袖笼、侧缝。禁止写厘米数，禁止写"刚好""勉强""被撑开""刚遮住"。
2. 松紧只用版型词表达：超宽松 / 宽松 / 常规 / 修身 / 紧身贴合。判断依据是剪裁余量（袖笼、侧缝、下摆的宽度），不是衣服在这个人身上的紧绷程度。
3. 弹力面料因身材产生的拉伸纹、绷紧感、撑开感，一律忽略，按"自然放松状态"描述。
4. 衣长、领口深度、开衩高度，一律换算成基准点位置，不要按这个人的身高或胸围写。
5. 禁止出现任何与人相关的词：胸型、身材大小、腰臀比例、肉感、勒痕、挤压、皮肤、流汗、表情神态。
6. 特殊款的"受力与压陷"只描述布料、绳体、金属件的受力方向与压陷方向，属于结构设计，不描述个人身体的具体反应。

━━━━━━━━━━━━━━━━
【铁律B：去形变还原（所有款式）】
━━━━━━━━━━━━━━━━
1. 过滤动作折痕：人物弯腰、坐姿、挤压造成的临时折痕、偏移，不得写成衣服的设计。
2. 还原对称版型：衣服原本对称，仅因姿势扭转显得不对称时，按对称结构描述。

━━━━━━━━━━━━━━━━
【铁律C：背面与固定结构，证据优先】
━━━━━━━━━━━━━━━━
看不到背面时，禁止写"不可见""推测"，但必须按以下顺序推导，不得套用固定句式：

1. 先找画面中的直接证据：肩带或颈带走向、侧缝、腰侧和胯侧是否有布料、拉链头、搭扣、面料弹性、裙片与腰部是否连在一起。凡是能看到布料的部位，背面对应位置默认也有布料，不得写成裸露。
2. 没有直接证据的部位，按"常规可成立、遮挡不少于正面"的原则补全：
   - 挂脖/颈圈式：颈后系带或搭扣；上背开口深度不超过正面开口深度；腰线以下后片完整
   - 双肩带/吊带：肩带在背后垂直或交叉，下接后片
   - 无肩带/抹胸：后中排扣或隐形拉链
   - 连衣裙/连体衣：后中或侧边隐形拉链，或直接套穿
   - 裙/裤：后中或侧边拉链，或松紧腰头
   - 内裤/细绳款：两侧细绳固定，后片宽度与正面一致
   - 鞋袜：后跟形状和固定方式、袜口罗纹或吊袜带夹扣
3. 只有出现明确线索，才能写成露背或全开背：正面是极细带结构、能看到背部大面积无布料、或单品本身是裸背设计。
4. 画面中手持、垂落、来源不明的细绳或带子，不得默认视为该单品的结构，除非能看到它与单品相连。
5. 背面颜色、面料、花纹默认与正面延续，不新增正面没有的绳子、五金和装饰。
6. 背面只写1–2句：怎么固定，后背遮到哪里。

━━━━━━━━━━━━━━━━
【常规款写法】
━━━━━━━━━━━━━━━━
按以下固定顺序写，该单品没有或不适用的项直接跳过，不得补编：

品类与廓形 → 领口与肩线 → 袖型 → 衣长与腰线位置 → 下摆/裤脚形状 → 门襟与固定方式 → 面料与颜色 → 明显的设计细节（口袋、车线、印花位置、配饰）

━━━━━━━━━━━━━━━━
【特殊剪裁款写法：几何图块与物理连线】
━━━━━━━━━━━━━━━━
最高要求：100%直白还原真实的布料遮挡范围、剪裁缺口与裸露部位。不得保守化，不得用晦涩词汇绕圈，不得把挖空、细绳款脑补成完整胸罩或内裤，不得自行增加布料面积或改变露出度。

1. 去制式化几何拆解：不使用"上衣""内衣""裤子"等传统品类名。把服饰视为"几何图块"加"连接线"，逐块写明形状（等腰三角形、水滴形、半月形、不规则多边形）、面积或宽度（微型、两指宽长条、极细线）、以及解剖学绝对坐标（如"从胸骨正中垂直向下延伸至肚脐""精准覆盖乳头并向两侧收束"）。
2. 绝对露出度：写"布料遮住了哪里，留白了哪里"。必须明确指出未遮盖区域（如"乳房上、下、两侧全部外露""耻骨至大腿根部无遮挡""侧腰大面积留白"）。
3. 物理连接：写明孤立图块之间如何连接（如"两块倒三角织物通过一枚金属O型环在胸骨处相连"），连接路径完整，不遗漏环、扣、线。
4. 部位联动与受力锚点：对乳头、乳晕、股沟等敏感部位，明确写出受力锚点与遮挡逻辑。
   示范：微型织物仅覆盖乳头与乳晕，周边乳房完全外露；金属饰品以两侧乳尖为支点，依重力悬垂；极细绳体沿股沟、臀缝向内压陷。
   只写服饰与部位的物理关系，不写人物反应与主观评价。
5. 压陷与垂坠：极细绑带或紧绷图块边缘写明压陷方向与边缘轮廓（压陷、边缘凹陷）；垂坠布料写明自然下垂形态。
6. 色彩分区锁死：禁用笼统单色词，使用细分标准色名（酒红、香槟金、墨黑、雾粉等）；逐块标注布料和线条的颜色及覆盖边界，五金单独标色；严禁跨区域混色。
7. 图案边界锁死：纹样、蕾丝的尺寸、疏密、所在几何区块要写全，纹样只存在于标注区块内，不得扩散。
8. 透光层级：从"完全不透明实色""半透视（隐约可见底层轮廓）""高透视薄纱""全镂空网眼"四档中精准选择，并写明透视面料下被覆盖部位轮廓的显露程度。严禁把透视材质写成实色。
9. 光影绑定：乳胶、皮革带镜面高光；薄纱透出底层漫反射；网眼带细碎投影；紧绷图块表面平滑无褶皱、反光增强，仅边缘受力点有轻微拉扯纹理。
10. 写作顺序融合为一段：图块与胸部 → 胸下围与腰部（有才写）→ 下摆与胯部 → 连接线路径 → 后背与固定（必写，守铁律C）→ 面料、透光与光影 → 色彩分区与五金配饰。

━━━━━━━━━━━━━━━━
【字数规则】
━━━━━━━━━━━━━━━━
- 简单单品（T恤、袜子、短裙、配饰）：80–150字
- 结构复杂的常规单品（大衣、连衣裙、西装）：150–250字
- 特殊剪裁款：250–350字，必须覆盖几何形状、物理尺寸、连接路径、绝对露出度、透光等级
- 严禁为凑字数添加画面中没有的细节，写完即止。

━━━━━━━━━━━━━━━━
【分类规则】
━━━━━━━━━━━━━━━━
category 只能从以下9个id中选1个，只写id，不写中文，不得自创：
tops, bottoms, dresses, coats, underwear, socks, shoes, accessories, other

- tops：单件上身衣物（T恤、衬衫、背心、针织衫、抹胸上衣）
- bottoms：单件下身衣物（长裤、短裤、半身裙）
- dresses：上下连为一体的单件（连衣裙、挂脖裙、连体衣、连体裤）
- coats：穿在最外层的衣物（大衣、风衣、夹克、西装外套、斗篷）
- underwear：胸罩、内裤、细绳款、泳装、由极简布片或绳体构成的服饰
- socks：各类袜子，含过膝袜、丝袜、吊带袜（袜带与袜一体时归此类）
- shoes：鞋与靴
- accessories：头饰、颈饰、手饰、腰带、耳环、手套、包等
- other：以上都无法归入
- 单品带有小配饰时，按主体服饰归类，不归 accessories
- 分类依据是服饰本身的结构，不依据暴露程度
- 单品模式禁止输出 outfits

━━━━━━━━━━━━━━━━
【语言与禁忌】
━━━━━━━━━━━━━━━━
- 纯客观物理描述，无抒情，无头尾总结，无评价与感受句（如"非常性感""显得很修身"）。
- 风格：客观、直白、精准、画面感强。用最容易听懂的服装结构词，拒绝生僻工业术语。同一类结构每次使用同一个词，不换说法。
- 禁止描写人物长相、姿态、背景环境、手持道具，禁止主观色情氛围评价。
- 看不到的部分不写"看不到"，按铁律C补全。

━━━━━━━━━━━━━━━━
【输出格式】
━━━━━━━━━━━━━━━━
严格配合系统追加的最终输出格式，仅输出合法 JSON 对象，不含 markdown 代码块、\`\`\`json 标记或任何额外解释：

{
"name": "穿搭名称（6字以内，直观准确）",
"description": "按上述规则写成的一段描述",
"category": "从上述9个id中选1个",
"tags": ["标签1", "标签2"]
}

━━━━━━━━━━━━━━━━
【示例（仅供学习写法与密度，不要照抄内容）】
━━━━━━━━━━━━━━━━

示例1（常规款）：
{
"name":"白色宽松圆领T恤","description":"H型直筒廓形的短袖圆领T恤，版型宽松。圆领口为罗纹包边，落肩，袖口自然松开，袖长止于上臂中部。衣长止于髋线附近，下摆平直微弧，套头穿着，无门襟。面料为中等厚度纯棉平纹针织，表面哑光，纯白色。正面无印花无口袋，后片廓形与前片一致，领后为同款罗纹包边。","category":"tops","tags":["T恤","宽松","基础款"]
}

示例2（常规款，下装）：
{
"name":"黑色高腰阔腿裤","description":"阔腿廓形的长裤，版型宽松。腰头位于自然腰线以上，宽腰头，前中为隐形拉链加一粒扣固定，腰头两侧有松紧收拢。前片左右各有一道正烫线，裤腿从髋线向下直线展开，裤长垂至脚踝。侧边有斜插袋，后片有两个装饰性假袋盖。面料为垂坠感较强的哑光西装布，颜色为纯黑。","category":"bottoms","tags":["阔腿裤","高腰","通勤"]
}

示例3（特殊剪裁款）：
{
"name":"挖空露乳挂脖裙","description":"挂脖式短裙，金色圆环连接颈带与三角胸片上缘。胸前为两片小三角胸罩轮廓，仅盖住乳房上半部，三角片正下方对应乳头与乳晕的位置做了半圆形挖空，乳头、乳晕及下胸区域直接裸露。胸下围横向抓褶收拢，并由细带环绕固定。下身为一片式前裙摆，仅遮挡小腹与腿间，两侧无侧缝，超高开衩直达腰际，胯骨与大腿外侧完全暴露。后背由颈后搭扣固定，上背开口不深于正面，腰线以下后片完整，宽度与正面一致。面料为高弹氨纶，表面带细密闪粉，微高光泽。主色为酒红色，金属圆环与搭扣为金色，配金色圆形耳环。","category":"dresses","tags":["挂脖裙","镂空","金色圆环"]
}`,
};
// 精确识别两代原始默认值，升级时保留用户实际编辑过的内容。
const PREVIOUS_DEFAULT_TEMPLATES = {
    user: {
        single: '{{user}} 当前穿着：{{name}}\n{{description}}',
        wardrobe: '{{user}} 的衣柜，共 {{count}} 套：\n{{outfits}}\n请根据剧情选择合适的一套，不要同时穿上所有套装。',
    },
    char: {
        single: '{{char}} 当前穿着：{{name}}\n{{description}}',
        wardrobe: '{{char}} 的衣柜，共 {{count}} 套：\n{{outfits}}\n请根据剧情选择合适的一套，不要同时穿上所有套装。',
    },
    image: {
        single: '{{wearer}} 的服装参考图：{{name}}。请仅参考图片中的服装、配饰、款式、颜色和穿搭，不采用图中人物的身份、面容、发型、身材、姿势或背景，不据此改变角色原有外貌。不编造看不到的服装细节。',
        wardrobe: '{{wearer}} 的衣柜包含 {{count}} 套服装，名称与图片按相同顺序对应：{{name}}。请根据剧情选择合适的一套，不要同时穿上所有套装。图片仅提供服装与配饰参考，忽略图中人物的身份、面容、发型、身材、姿势和背景，不改变角色原有外貌，不编造看不到的服装细节。',
    },
};

const PREVIOUS_STORY_TEMPLATES = {
    user: {
        single: '{{user}} 当前穿着：{{name}}\n{{description}}\n（禁止编造其他服装。严禁集中罗列服装信息，服装细节必须分散融入不同的动作、触感、环境互动中，每次只带出一两个细节。）',
        wardrobe: '{{user}} 的衣柜，共 {{count}} 套：\n{{outfits}}\n请根据剧情选择合适的一套，不要同时穿上所有套装。\n（禁止编造以上之外的服装。根据场景标签匹配穿搭，若回复中出现场景转换则对应切换穿搭。严禁集中罗列服装信息，服装细节必须分散融入动作、触感、环境互动中，每次只带出一两个细节。）',
    },
    char: {
        single: '{{char}} 当前穿着：{{name}}\n{{description}}\n（禁止编造其他服装。严禁集中罗列服装信息，服装细节必须分散融入不同的动作、触感、环境互动中，每次只带出一两个细节。）',
        wardrobe: '{{char}} 的衣柜，共 {{count}} 套：\n{{outfits}}\n请根据剧情选择合适的一套，不要同时穿上所有套装。\n（禁止编造以上之外的服装。根据场景标签匹配穿搭，若回复中出现场景转换则对应切换穿搭。严禁集中罗列服装信息，服装细节必须分散融入动作、触感、环境互动中，每次只带出一两个细节。）',
    },
    image: {
        single: '图中为角色当前穿着，禁止编造其他服装，也不编造看不到的服装细节。严禁集中罗列，服装细节必须分散融入动作、触感、环境互动中，每次只带出一两个细节。\n\n{{wearer}} 的服装参考图：{{name}}。请仅参考图片中的服装、配饰、款式、颜色和穿搭，不采用图中人物的身份、面容、发型、身材、姿势或背景，不据此改变角色原有外貌。',
        wardrobe: '以上图片为可选穿搭，根据场景标签匹配，场景转换则切换穿搭，禁止编造其他服装，也不编造看不到的服装细节。严禁集中罗列，细节分散融入动作和互动中。\n\n{{wearer}} 的衣柜包含 {{count}} 套服装，名称与图片按相同顺序对应：{{name}}。请根据剧情选择合适的一套，不要同时穿上所有套装。图片仅提供服装与配饰参考，忽略图中人物的身份、面容、发型、身材、姿势和背景，不改变角色原有外貌。',
    },
};

const DESCRIPTION_STYLE_NOTE = '禁止编造服装及看不到的细节。严禁集中罗列服装信息，服装细节分散融入动作、触感和环境互动，每次只带出一两个细节。';
const DEFAULT_TEMPLATES = {
    user: {
        single: '{{user}} 的可选服装：{{name}}\n{{description}}\n' + DESCRIPTION_STYLE_NOTE,
        wardrobe: '{{user}} 的可选衣柜，共 {{count}} 条候选：\n{{outfits}}\n根据剧情选择一身完整穿搭；仅在合理换装机会调整。\n' + DESCRIPTION_STYLE_NOTE,
    },
    char: {
        single: '{{char}} 的可选服装：{{name}}\n{{description}}\n' + DESCRIPTION_STYLE_NOTE,
        wardrobe: '{{char}} 的可选衣柜，共 {{count}} 条候选：\n{{outfits}}\n根据剧情选择一身完整穿搭；仅在合理换装机会调整。\n' + DESCRIPTION_STYLE_NOTE,
    },
    image: {
        single: '{{wearer}} 的可选服装参考图：{{name}}。图片对应候选清单中的图号，仅参考服装与配饰，忽略图中人物的身份、面容、发型、身材、姿势和背景，不改变角色原有外貌。' + DESCRIPTION_STYLE_NOTE,
        wardrobe: '{{wearer}} 的可选衣柜，共 {{count}} 条候选：{{name}}。图片与成员对应关系见候选清单，按一身穿搭选用；仅在合理换装机会调整。仅参考服装与配饰，忽略图中人物的身份、面容、发型、身材、姿势和背景，不改变角色原有外貌。' + DESCRIPTION_STYLE_NOTE,
    },
};

/**
 * 衣柜服装数据，导入和读取存档时统一校验，内部按稳定 ID 查找。
 * @typedef {Object} WardrobeItem
 * @property {string} id 服装标识。
 * @property {string} name 服装名称。
 * @property {string} category 服装分类标识。
 * @property {'unrated'|'sfw'|'nsfw'} contentRating 手动内容分级；旧数据保持未标注，不根据图片或描述猜测。
 * @property {string} description 发送给 AI 的服装描述。
 * @property {string} image 正面图片的酒馆路径或尚未迁移的数据地址，无图片时为空字符串。
 * @property {string} backImage 背面图片路径或数据地址，旧存档读取时补为空字符串。
 * @property {string[]} groupIds 不重复的标签标识，空数组表示未分组；旧 groupId 仅在读取入口迁移。
 * @property {boolean} favorite 是否已收藏，旧存档默认未收藏。
 * @property {number} lastUsedAt 最近一次成功应用的毫秒时间戳，0 表示尚无使用记录。
 * @property {string[]} [componentIds] 搭配包含的服装 ID；分类不限，成员不可再嵌套搭配，缺省表示普通服装。
 * @property {boolean} [descriptionOverride] 搭配描述是否已由用户整段编辑；未编辑时继续自动引用成员描述。
 */

/**
 * 生成重复使用的线条图标，所有图形随当前控件文字颜色显示。
 * @param {string} name 图标名称，来自本文件的图标表。
 * @param {string} className 图标的附加样式类名。
 * @returns {string} 仅用于内部模板的 SVG 标记。
 */
function icon(name, className = '') {
    return `<svg class="tw-icon ${className}" viewBox="0 0 24 24" fill="none" aria-hidden="true">${ICONS[name]}</svg>`;
}

/**
 * 生成分类或快捷筛选入口，服装载入后由列表渲染同步实际数量。
 * @param {string[]} category 分类标识、名称与图标名称。
 * @returns {string} 分类按钮标记。
 */
function renderCategory([id, label, symbol]) {
    return `<button type="button" class="tw-category" data-category="${id}" aria-pressed="${id === 'all'}">${icon(symbol)}<span class="tw-category-label">${label}</span><span class="tw-count">0</span></button>`;
}

/**
 * 把筛选入口按用途分组，侧栏用小标题区分分类、视图、穿着和待整理。
 * @param {string} title 分组标题。
 * @param {string[]} ids 该分组包含的筛选标识。
 * @param {string} extra 插入标题与入口之间的额外控件标记。
 * @returns {string} 分组标记。
 */
function renderNavSection(title, ids, extra = '') {
    return `<div class="tw-nav-section"><p class="tw-nav-heading">${title}</p>${extra}${ids.map(id => renderCategory(CATEGORY_FILTER_MAP.get(id))).join('')}</div>`;
}

/**
 * 为角色和图片提示词生成同结构的模板编辑页；实际模板在存档入口加载，不拼接用户文本。
 * @param {string} wearer 模板所属的 user、char 或 image。
 * @param {string} label 页面中显示的角色名称。
 * @returns {string} 模板设置页标记。
 */
function renderTemplateSettings(wearer, label) {
    return `<section id="tw-settings-${wearer}-template" data-settings-content="${wearer}-template" aria-labelledby="tw-${wearer}-template-title" hidden>
        <h3 id="tw-${wearer}-template-title">${label}模板</h3>
        <form class="tw-template-form" data-template-owner="${wearer}">
            <label><span>${wearer === 'image' ? '单条＋图片' : '单条模板'}</span><small>分配 1 条候选时生效</small><textarea name="single" aria-label="${label}单条模板" required spellcheck="false"></textarea></label>
            <label><span>${wearer === 'image' ? '衣柜＋图片' : '衣柜模式'}</span><small>分配多条候选时生效</small><textarea name="wardrobe" aria-label="${label}衣柜模式模板" required spellcheck="false"></textarea></label>
            <p class="tw-template-hint">变量：{{user}} 用户名 · {{char}} 角色名 · {{wearer}} 当前所属角色 · {{name}} 服装名称 · {{description}} 描述 · {{outfits}} 候选列表 · {{count}} 候选数</p>
            <div class="tw-send-actions"><button type="submit">保存</button></div>
            <p class="tw-template-status" role="status" aria-live="polite"></p>
        </form>
    </section>`;
}

const PANEL_HTML = `
<dialog id="tw-panel" aria-labelledby="tw-panel-title" data-mobile-screen="library">
    <div class="tw-shell">
        <header class="tw-header">
            <div class="tw-brand">
                ${icon('hanger')}
                <!-- 打开时聚焦标题以便先浏览服装，避免搜索框唤起软键盘；标题不占用 Tab 顺序。 -->
                <div><h1 id="tw-panel-title" tabindex="-1" autofocus>衣柜</h1><span class="tw-brand-subtitle">Wardrobe</span></div>
            </div>
            <div class="tw-library-switcher">
                <nav class="tw-library-tabs" aria-label="衣柜大分类"></nav>
                <button type="button" class="tw-add-library" data-action="add-library" title="新增空衣柜" aria-label="新增空衣柜">${icon('plus')}</button>
                <button type="button" class="tw-delete-library" data-action="delete-library" title="删除当前衣柜" aria-label="删除当前衣柜" aria-haspopup="dialog" aria-controls="tw-ask" hidden>${icon('trash')}</button>
            </div>
            <label class="tw-search">${icon('search')}<input type="search" placeholder="搜索名称、描述、标签或 ID…" aria-label="搜索服装"></label>
            <button type="button" class="tw-log-button" data-action="open-logs" aria-haspopup="dialog" aria-controls="tw-logs">${icon('file')}日志</button>
            <div class="tw-header-actions">
                <button type="button" class="tw-icon-button tw-settings-button" data-action="open-settings" aria-label="衣柜设置" title="衣柜设置" aria-haspopup="dialog" aria-controls="tw-settings">${icon('settings')}</button>
                <button type="button" class="tw-icon-button tw-close" data-action="close" aria-label="关闭衣柜" title="关闭">${icon('close')}</button>
            </div>
        </header>

        <div class="tw-body">
            <aside class="tw-sidebar" aria-label="服装筛选">
                <label class="tw-mobile-filter">
                    ${icon('sliders')}
                    <select aria-label="选择服装分类">
                        ${CATEGORY_FILTERS.map(([id, label]) => `<option value="${id}">${label}</option>`).join('')}
                    </select>
                </label>
                <nav class="tw-category-list" aria-label="服装分类">
                    ${renderNavSection('分类', ['all', ...CATEGORIES.slice(1).map(([id]) => id)])}
                    ${renderNavSection('视图', ['favorites', 'recent', 'combinations'])}
                    ${renderNavSection('穿着', ['assigned-user', 'assigned-char', 'unassigned'], `<label class="tw-selection-scope" title="角色归属保存在哪个范围"><span>归属范围</span><span class="tw-select-control"><select aria-label="穿搭范围">
                        <option value="global">全局</option><option value="character">按角色卡</option><option value="chat">按聊天</option>
                    </select>${icon('chevron')}</span></label>`)}
                    ${renderNavSection('待整理', ['missing-description', 'missing-image'])}
                </nav>
                <div class="tw-import-footer">
                    <button type="button" class="tw-import" data-action="import">${icon('plus')}<span>导入服装</span></button>
                    <button type="button" class="tw-export-all" data-action="export-all" title="选择衣柜和导出内容" aria-haspopup="dialog" aria-controls="tw-export-picker">${icon('download')}<span>导出服装</span></button>
                </div>
            </aside>

            <main class="tw-library" aria-label="服装列表" data-layout="grid" data-multi-select="false" data-has-items="false">
                <div class="tw-group-bar">
                    <nav class="tw-group-tabs" aria-label="服装标签"></nav>
                    <div class="tw-group-tools">
                        <button type="button" data-action="add-group" title="新增标签">${icon('plus')}<span>标签</span></button>
                        <button type="button" data-action="manage-groups" aria-label="管理标签" title="重命名、排序或删除标签">${icon('pencil')}</button>
                    </div>
                </div>
                <div class="tw-library-toolbar" role="group" aria-label="服装操作">
                    <div class="tw-toolbar-start">
                        <button type="button" class="tw-toggle-multi" data-action="toggle-multi" aria-pressed="false" aria-controls="tw-bulk-actions">${icon('checkCircle')}<span>多选</span></button>
                        <button type="button" data-action="create-combination" title="用勾选的服装合并为一套搭配">${icon('combine')}<span>合并搭配</span></button>
                        <button type="button" data-action="describe-all" title="为所有尚未描述的图片生成 AI 描述">${icon('sparkle')}<span>一键识图</span></button>
                    </div>
                    <span class="tw-result-count" role="status"></span>
                    <div class="tw-toolbar-end">
                        <label class="tw-sort" title="排序">${icon('sliders')}<span class="tw-select-control"><select aria-label="服装排序">
                            <option value="default">导入顺序</option><option value="name-asc">名称升序</option><option value="name-desc">名称降序</option><option value="recent">最近使用</option>
                        </select>${icon('chevron')}</span></label>
                        <label class="tw-density" title="卡片大小"><input type="range" min="128" max="288" step="8" value="176" aria-label="卡片大小"></label>
                        <div class="tw-view-modes" role="group" aria-label="服装显示方式">
                            <button type="button" class="tw-icon-button" data-view="grid" aria-label="网格视图" title="网格视图" aria-pressed="true">${icon('grid')}</button>
                            <button type="button" class="tw-icon-button" data-view="list" aria-label="列表视图" title="列表视图" aria-pressed="false">${icon('list')}</button>
                        </div>
                    </div>
                </div>
                <div class="tw-content-frame">
                <p class="tw-library-status" role="status" aria-live="polite"></p>
                <div class="tw-library-content">
                    <div class="tw-items" hidden></div>
                    <div class="tw-empty" role="status" aria-live="polite" data-kind="none">
                        ${icon('box')}
                        <h2 id="tw-empty-title">这里还没有服装</h2>
                        <p class="tw-empty-hint">导入图片即可创建服装，也可以直接把图片拖进来或粘贴。</p>
                        <button type="button" class="tw-empty-action" data-action="import">${icon('plus')}<span>导入服装</span></button>
                    </div>
                </div>
                </div>
                <div id="tw-bulk-actions" class="tw-bulk-actions" aria-label="服装批量操作" hidden>
                    <div class="tw-bulk-main">
                        <label class="tw-bulk-selection" title="全选当前列表"><input type="checkbox" class="tw-select-all" aria-label="全选当前列表"><span class="tw-selection-count">已选 0 件</span></label>
                        <span class="tw-bulk-sep" aria-hidden="true"></span>
                        <div class="tw-menu-wrap"><button type="button" class="tw-bulk-trigger" data-bulk-menu="apply" aria-haspopup="menu" aria-expanded="false" disabled>${icon('hanger')}<span>应用到</span>${icon('chevron')}</button><div class="tw-menu" data-menu="apply" role="menu" aria-label="应用到角色" hidden></div></div>
                        <div class="tw-menu-wrap"><button type="button" class="tw-bulk-trigger" data-bulk-menu="library" aria-haspopup="menu" aria-expanded="false" disabled>${icon('layers')}<span>移动到</span>${icon('chevron')}</button><div class="tw-menu" data-menu="library" role="menu" aria-label="移动到其他衣柜" hidden></div></div>
                        <div class="tw-menu-wrap"><button type="button" class="tw-bulk-trigger" data-bulk-menu="tags" aria-haspopup="menu" aria-expanded="false" disabled>${icon('tag')}<span>标签</span>${icon('chevron')}</button><div class="tw-menu tw-menu-wide" data-menu="tags" role="menu" aria-label="批量标签" hidden></div></div>
                        <div class="tw-menu-wrap"><button type="button" class="tw-bulk-trigger" data-bulk-menu="category" aria-haspopup="menu" aria-expanded="false" disabled>${icon('shirt')}<span>分类</span>${icon('chevron')}</button><div class="tw-menu" data-menu="category" role="menu" aria-label="修改分类" hidden></div></div>
                        <button type="button" class="tw-bulk-favorite-button" data-bulk-favorite aria-pressed="false" disabled>${icon('heart')}<span>收藏</span></button>
                        <button type="button" data-bulk="export" disabled>${icon('download')}<span>导出所选</span></button>
                        <span class="tw-bulk-sep" aria-hidden="true"></span>
                        <button type="button" class="tw-bulk-delete" data-bulk="delete" disabled>${icon('trash')}<span>删除</span></button>
                        <button type="button" class="tw-bulk-done" data-action="toggle-multi" aria-label="退出多选" title="退出多选">${icon('close')}</button>
                    </div>
                    <!-- 角色、标签、分类和收藏沿用隐藏选择器；跨衣柜移动由菜单直接提交两个分区。 -->
                    <select class="tw-bulk-apply" aria-label="批量应用到角色" hidden disabled>
                        <option value="" disabled selected>应用到…</option>
                        <optgroup label="应用到"><option value="apply-user">USER</option><option value="apply-char">Char</option></optgroup>
                        <optgroup label="取消应用"><option value="unapply-user">USER</option><option value="unapply-char">Char</option></optgroup>
                    </select>
                    <select class="tw-bulk-category" aria-label="批量修改分类" hidden disabled>
                        <option value="" disabled selected>修改分类…</option>${CATEGORIES.slice(1).map(([id, label]) => `<option value="${id}">${label}</option>`).join('')}
                    </select>
                    <select class="tw-bulk-favorite" aria-label="批量收藏" hidden disabled>
                        <option value="" disabled selected>收藏…</option><option value="favorite">收藏</option><option value="unfavorite">取消收藏</option>
                    </select>
                </div>
            </main>

            <aside id="tw-details" class="tw-details" aria-label="服装预览与详情" data-empty="true">
                <section class="tw-wearer-card" aria-label="穿着设置">
                    <div class="tw-wearer-row">
                        <span class="tw-wearer-label">可穿者</span>
                        <div class="tw-wearer-modes" role="group" aria-label="允许穿这件服装的角色">
                            <label><input type="checkbox" data-wearer="user" disabled><span>USER</span></label>
                            <label><input type="checkbox" data-wearer="char" disabled><span>Char</span></label>
                        </div>
                    </div>
                </section>
                <div class="tw-preview-wrap">
                    <div class="tw-preview">${icon('hanger')}<span>未选择服装</span></div>
                    <div class="tw-image-actions">
                        <button type="button" data-action="replace-front-image" data-image-field="image" disabled>替换正面图片</button>
                        <button type="button" data-action="replace-image" data-image-field="backImage" disabled>替换背面图片</button>
                        <button type="button" data-action="remove-image" disabled>删除图片</button>
                    </div>
                </div>
                <nav class="tw-detail-tabs" aria-label="详情分组">
                    <button type="button" data-detail="info" aria-pressed="true">${icon('info')}<span>信息</span></button>
                    <button type="button" data-detail="description" aria-pressed="false">${icon('file')}<span>描述</span></button>
                    <button type="button" data-detail="tags" aria-pressed="false">${icon('tag')}<span>标签</span></button>
                </nav>
                <div class="tw-detail-content">
                    <section data-detail-page="info" aria-label="服装信息">
                        <div class="tw-properties">
                            <label class="tw-field"><span>名称</span><input name="garment_name" aria-label="服装名称" placeholder="服装名称" required disabled></label>
                            <label class="tw-field"><span>分类</span><span class="tw-select-control"><select name="garment_category" aria-label="服装分类" disabled>${CATEGORIES.slice(1).map(([id, label]) => `<option value="${id}">${label}</option>`).join('')}</select>${icon('chevron')}</span></label>
                            <label class="tw-field"><span>分级</span><span class="tw-select-control"><select name="garment_content_rating" aria-label="服装内容分级" disabled><option value="unrated">未标注</option><option value="sfw">SFW（日常／非色情）</option><option value="nsfw">NSFW（色情／成人）</option></select>${icon('chevron')}</span></label>
                        </div>
                    </section>
                    <section data-detail-page="description" aria-label="服装描述" hidden>
                        <div class="tw-combination-details" hidden><span>搭配的描述由成员组合而成，也可以直接编辑。</span><button type="button" data-action="edit-combination">编辑搭配成员</button></div>
                        <div class="tw-properties tw-description-options">
                            <label class="tw-field"><span>AI 分类</span><span class="tw-select-control"><select name="description_category" aria-label="AI 分类" disabled><option value="on">开启</option><option value="off">关闭</option></select>${icon('chevron')}</span></label>
                            <label class="tw-field"><span>AI 标签</span><span class="tw-select-control"><select name="description_tags" aria-label="AI 标签" disabled><option value="on">开启</option><option value="off">关闭</option></select>${icon('chevron')}</span></label>
                        </div>
                        <div class="tw-description-actions">
                            <span class="tw-select-control"><select name="description_mode" aria-label="描述生成类型" disabled><option value="outfit">整套描述</option><option value="item">单品描述</option></select>${icon('chevron')}</span>
                            <button type="button" class="tw-describe" data-action="describe" disabled>${icon('sparkle')}<span>AI 生成描述</span></button>
                        </div>
                        <textarea name="garment_description" aria-label="服装描述" placeholder="填写款式、颜色、材质等服装描述" disabled></textarea>
                    </section>
                    <section data-detail-page="tags" aria-label="服装标签" hidden>
                        <div class="tw-tag-picker">
                            <p class="tw-tag-summary">选择标签</p>
                            <div class="tw-tag-dropdown">
                                <div class="tw-tag-search-row">
                                    <input class="tw-tag-search" type="search" placeholder="搜索标签…" aria-label="搜索标签" autocomplete="off" disabled>
                                    <button type="button" data-action="add-garment-group" disabled>${icon('plus')}<span>新标签</span></button>
                                </div>
                                <fieldset class="tw-garment-tag" name="garment_group" aria-label="服装标签" disabled></fieldset>
                                <p class="tw-tag-empty" role="status" hidden>没有匹配的标签</p>
                            </div>
                        </div>
                    </section>
                </div>
                <div class="tw-detail-actions">
                    <div class="tw-action-row">
                        <button type="button" class="tw-save" data-action="save-garment" disabled>${icon('check')}<span>保存修改</span></button>
                        <button type="button" data-action="export-one" title="导出这一件" disabled>${icon('download')}<span>导出</span></button>
                        <button type="button" class="tw-delete" data-action="delete-one" title="删除这件服装" disabled>${icon('trash')}<span>删除</span></button>
                    </div>
                    <p class="tw-garment-status" role="status" aria-live="polite"></p>
                </div>
            </aside>
        </div>
        <footer class="tw-mobile-actions" aria-label="衣柜操作">
            <button type="button" class="tw-mobile-import" data-action="import">${icon('plus')}<span>导入</span></button>
            <button type="button" data-action="export-all" aria-haspopup="dialog" aria-controls="tw-export-picker">${icon('download')}<span>导出</span></button>
            <button type="button" data-action="toggle-details" aria-controls="tw-details" aria-expanded="false">${icon('info')}<span>服装详情</span></button>
        </footer>
        <input class="tw-image-import" type="file" accept="image/png,image/jpeg,image/webp,application/json,.json" multiple hidden>
        <input class="tw-folder-import" type="file" accept="image/png,image/jpeg,image/webp" webkitdirectory multiple hidden>
        <input class="tw-image-replace" type="file" accept="image/png,image/jpeg,image/webp" hidden>
    </div>
    <dialog id="tw-ask" aria-labelledby="tw-ask-title" aria-describedby="tw-ask-message" data-danger="false">
        <form method="dialog" class="tw-ask-form">
            <h2 id="tw-ask-title"></h2>
            <p id="tw-ask-message" class="tw-ask-message"></p>
            <input class="tw-ask-input" type="text" autocomplete="off" spellcheck="false" hidden>
            <div class="tw-ask-actions"><button type="button" class="tw-ask-cancel">取消</button><button type="submit" value="ok" class="tw-ask-ok">确定</button></div>
        </form>
    </dialog>
    <dialog id="tw-import-picker" aria-labelledby="tw-import-picker-title">
        <header><h2 id="tw-import-picker-title">导入服装</h2><button type="button" data-action="cancel-import" aria-label="关闭导入">${icon('close')}</button></header>
        <div class="tw-import-tools">
            <button type="button" data-action="add-import-files">添加图片/文件</button>
            <button type="button" data-action="add-import-folder">选择图片文件夹</button>
            <button type="button" data-action="add-import-link">添加 JSON 链接</button>
            <button type="button" data-import-selection="all" disabled>全选</button>
            <button type="button" data-import-selection="none" disabled>全不选</button>
        </div>
        <p class="tw-import-empty">添加本地文件或 JSON 链接</p>
        <div class="tw-import-grid" aria-label="待导入文件"></div>
        <p class="tw-import-status" role="status" aria-live="polite"></p>
        <footer><span class="tw-import-count" aria-live="polite">已选 0 / 0 个文件</span><button type="button" data-action="confirm-import" disabled>导入所选</button></footer>
    </dialog>
    <dialog id="tw-export-picker" aria-labelledby="tw-export-picker-title">
        <form class="tw-export-form">
            <header><h2 id="tw-export-picker-title">导出服装</h2><button type="button" data-action="cancel-export" aria-label="关闭导出">${icon('close')}</button></header>
            <div class="tw-export-options">
                <label>衣柜<span class="tw-select-control"><select name="export_library" aria-label="选择导出的衣柜"></select>${icon('chevron')}</span></label>
                <label>导出内容<span class="tw-select-control"><select name="export_content" aria-label="选择导出内容"><option value="all">全部服装</option><option value="described">仅有描述的服装</option></select>${icon('chevron')}</span></label>
            </div>
            <p class="tw-export-status" role="status" aria-live="polite"></p>
            <footer><span class="tw-export-count" aria-live="polite"></span><button type="submit" data-action="confirm-export">导出</button></footer>
        </form>
    </dialog>
    <dialog id="tw-combination-editor" aria-labelledby="tw-combination-title">
        <form class="tw-combination-form">
            <h2 id="tw-combination-title">搭配</h2>
            <label class="tw-combination-name">名称<input name="combination_name" aria-label="搭配名称" required></label>
            <div class="tw-combination-items" aria-label="选择搭配成员"></div>
            <div class="tw-send-actions"><button type="button" data-action="cancel-combination">取消</button><button type="submit">保存搭配</button></div>
            <p class="tw-combination-status" role="status" aria-live="polite"></p>
        </form>
    </dialog>
    <dialog id="tw-original-image" aria-labelledby="tw-original-image-title">
        <header><h2 id="tw-original-image-title">服装原图</h2><button type="button" class="tw-icon-button" data-action="close-original-image" aria-label="关闭原图" autofocus>${icon('close')}</button></header>
        <img alt="">
    </dialog>
    <dialog id="tw-group-manager" aria-labelledby="tw-group-manager-title">
        <form class="tw-group-form">
            <h2 id="tw-group-manager-title">管理标签</h2>
            <div class="tw-group-toolbar">
                <label><input type="checkbox" class="tw-group-select-all" aria-controls="tw-group-rows">全选</label>
                <span class="tw-group-selection-count" role="status">已选 0 个</span>
                <button type="button" data-action="delete-groups" aria-haspopup="dialog" aria-controls="tw-ask" disabled>${icon('trash')}<span>删除所选</span></button>
            </div>
            <div id="tw-group-rows" class="tw-group-rows"></div>
            <div class="tw-send-actions"><button type="button" data-action="cancel-groups">取消</button><button type="submit">保存</button></div>
            <p class="tw-group-status" role="status" aria-live="polite"></p>
        </form>
    </dialog>
    <dialog id="tw-logs" aria-labelledby="tw-logs-title">
        <header class="tw-settings-header">
            <h2 id="tw-logs-title">日志</h2>
            <button type="button" class="tw-icon-button" data-log-action="close" aria-label="关闭日志" autofocus>${icon('close')}</button>
        </header>
        <div class="tw-log-toolbar">
            <select class="tw-log-filter" aria-label="日志级别">
                <option value="all">全部级别</option><option value="error">Error</option>
                <option value="warn">Warn</option><option value="debug">Debug</option>
                <option value="info">Info</option><option value="api">API 请求</option>
            </select>
            <input class="tw-log-search" type="search" placeholder="搜索日志…" aria-label="搜索日志">
            <button type="button" data-log-action="copy">复制全部</button>
            <button type="button" data-log-action="export">导出全部</button>
            <button type="button" data-log-action="clear">清空</button>
        </div>
        <p class="tw-log-status" role="status"></p>
        <div class="tw-log-list" tabindex="0" aria-label="日志记录"></div>
        <footer class="tw-log-footer">本次运行最近 1000 条；单条最多 12000 字符；密钥与图片数据已隐藏。</footer>
    </dialog>
    <dialog id="tw-settings" aria-labelledby="tw-settings-title">
        <header class="tw-settings-header">
            <h2 id="tw-settings-title">衣柜设置</h2>
            <button type="button" class="tw-icon-button" data-action="close-settings" aria-label="关闭设置" autofocus>${icon('close')}</button>
        </header>
        <div class="tw-settings-body">
            <nav class="tw-settings-nav" aria-label="设置分组">
                <button type="button" data-settings-page="api" aria-pressed="true" aria-controls="tw-settings-api">${icon('settings')}<span>API</span></button>
                <button type="button" data-settings-page="send" aria-pressed="false" aria-controls="tw-settings-send">${icon('file')}<span>发送内容</span></button>
                <button type="button" data-settings-page="user-template" aria-pressed="false" aria-controls="tw-settings-user-template">${icon('file')}<span>USER模板</span></button>
                <button type="button" data-settings-page="char-template" aria-pressed="false" aria-controls="tw-settings-char-template">${icon('file')}<span>Char模板</span></button>
                <button type="button" data-settings-page="image-template" aria-pressed="false" aria-controls="tw-settings-image-template">${icon('file')}<span>图片模板</span></button>
                <button type="button" data-settings-page="description" aria-pressed="false" aria-controls="tw-settings-description">${icon('pencil')}<span>描述生成</span></button>
                <button type="button" data-settings-page="data" aria-pressed="false" aria-controls="tw-settings-data">${icon('download')}<span>导入／导出数据</span></button>
            </nav>
            <div class="tw-settings-content">
                <section id="tw-settings-api" data-settings-content="api" aria-labelledby="tw-settings-api-title">
                    <h3 id="tw-settings-api-title">API</h3>
                    <form class="tw-api-form">
                        <fieldset class="tw-api-fields">
                            <label class="tw-api-field"><span>连接方式</span>
                                <select name="mode">
                                    <option value="host">使用酒馆连接</option>
                                    <option value="custom">自定义（OpenAI 兼容）</option>
                                </select>
                            </label>
                            <fieldset class="tw-api-custom" hidden disabled>
                                <label class="tw-api-field"><span>接口地址</span><input name="apiurl" type="url" placeholder="https://api.example.com/v1" autocomplete="off" spellcheck="false"></label>
                                <label class="tw-api-field"><span>API Key</span>
                                    <span class="tw-api-input-action"><input name="key" type="password" autocomplete="off" spellcheck="false"><button type="button" data-action="toggle-api-key" aria-label="显示 API Key" aria-pressed="false">显示</button></span>
                                </label>
                                <div class="tw-api-field"><label id="tw-api-model-label" for="tw-api-model">模型</label>
                                    <div class="tw-api-input-action">
                                        <div class="tw-model-picker">
                                            <div class="tw-model-control">
                                                <input id="tw-api-model" name="model" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="tw-api-models" placeholder="输入或选择模型" autocomplete="off" spellcheck="false">
                                                <button type="button" data-action="toggle-models" aria-label="展开模型列表" aria-controls="tw-api-models" aria-expanded="false">${icon('chevron')}</button>
                                            </div>
                                            <div id="tw-api-models" class="tw-model-options" role="listbox" aria-labelledby="tw-api-model-label" hidden></div>
                                        </div>
                                        <button type="button" data-api-action="models">获取模型</button>
                                    </div>
                                </div>
                                <div class="tw-api-parameters">
                                    <label class="tw-api-field"><span>温度</span><input name="temperature" type="number" min="0" max="2" step="any" required></label>
                                    <label class="tw-api-field"><span>最大回复 Token</span><input name="max_tokens" type="number" min="1" step="1" required></label>
                                </div>
                            </fieldset>
                        </fieldset>
                        <div class="tw-api-actions">
                            <button type="button" data-api-action="test">测试连接</button>
                            <button type="submit" class="tw-api-save" data-api-action="save">保存</button>
                        </div>
                        <p class="tw-api-status" role="status" aria-live="polite"></p>
                    </form>
                </section>
                <section id="tw-settings-send" data-settings-content="send" aria-labelledby="tw-settings-send-title" hidden>
                    <h3 id="tw-settings-send-title">发送内容</h3>
                    <form class="tw-send-form">
                        <fieldset class="tw-send-group">
                            <legend>发送给 AI 的内容类型</legend>
                            <div class="tw-send-options">
                                <label class="tw-send-choice"><input type="radio" name="content_type" value="text" checked><span>文字描述</span></label>
                                <label class="tw-send-choice"><input type="radio" name="content_type" value="image"><span>图片</span></label>
                                <label class="tw-send-choice"><input type="radio" name="content_type" value="text_image"><span>文字＋图片</span></label>
                            </div>
                        </fieldset>
                        <fieldset class="tw-send-group">
                            <legend>参考图画质</legend>
                            <div class="tw-send-options">
                                <label class="tw-send-choice"><input type="radio" name="image_quality" value="compressed" checked><span>压缩参考图</span></label>
                                <label class="tw-send-choice"><input type="radio" name="image_quality" value="original"><span>原图</span></label>
                            </div>
                        </fieldset>
                        <fieldset class="tw-send-group">
                            <legend>直接发送位置</legend>
                            <div class="tw-send-options">
                                <label class="tw-send-choice"><input type="radio" name="position" value="system_end"><span>系统提示末尾</span></label>
                                <label class="tw-send-choice"><input type="radio" name="position" value="context_end"><span>上下文末尾</span></label>
                                <label class="tw-send-choice"><input type="radio" name="position" value="user_end" checked><span>用户消息末尾</span></label>
                            </div>
                        </fieldset>
                        <fieldset class="tw-send-group">
                            <legend>换装记录</legend>
                            <div class="tw-send-options">
                                <label class="tw-send-choice"><input type="radio" name="marker_mode" value="isolated"><span>独立 API 选装</span></label>
                                <label class="tw-send-choice"><input type="radio" name="marker_mode" value="strip" checked><span>自动回写（只存不发）</span></label>
                                <label class="tw-send-choice"><input type="radio" name="marker_mode" value="keep"><span>自动回写（保留历史）</span></label>
                                <label class="tw-send-choice"><input type="radio" name="marker_mode" value="off"><span>关闭</span></label>
                            </div>
                            <label class="tw-outfit-history">独立选装读取前 <input type="number" name="outfit_history_count" min="0" step="1" value="${DEFAULT_OUTFIT_HISTORY_COUNT}" required aria-label="独立选装读取的历史楼层数"> 楼及本次输入</label>
                        </fieldset>
                        <fieldset class="tw-send-group">
                            <legend>服装分级</legend>
                            <label class="tw-send-choice"><input type="checkbox" name="send_content_rating" checked><span>发送 SFW / NSFW 分级</span></label>
                        </fieldset>
                        <div class="tw-send-actions"><button type="submit">保存</button></div>
                        <p class="tw-send-status" role="status" aria-live="polite"></p>
                    </form>
                </section>
                ${renderTemplateSettings('user', 'USER')}
                ${renderTemplateSettings('char', 'Char')}
                ${renderTemplateSettings('image', '图片')}
                <section id="tw-settings-description" data-settings-content="description" aria-labelledby="tw-settings-description-title" hidden>
                    <h3 id="tw-settings-description-title">描述生成</h3>
                    <form class="tw-template-form tw-description-form">
                        <label><span>整套描述</span><textarea name="outfit" aria-label="整套描述生成提示词" required spellcheck="false"></textarea></label>
                        <label><span>单品描述</span><textarea name="item" aria-label="单品描述生成提示词" required spellcheck="false"></textarea></label>
                        <p class="tw-template-hint">变量：{{name}} 当前服装名称 · {{category}} 当前分类。生成时在服装详情的“描述”页选择类型。</p>
                        <div class="tw-send-actions"><button type="submit">保存</button></div>
                        <p class="tw-template-status" role="status" aria-live="polite"></p>
                    </form>
                </section>
                <section id="tw-settings-data" data-settings-content="data" aria-labelledby="tw-settings-data-title" hidden>
                    <h3 id="tw-settings-data-title">导入／导出数据</h3>
                    <div class="tw-template-form">
                        <p class="tw-template-hint">发送内容、USER／Char／图片模板、描述生成提示词。仅导出已保存的设置；导入会替换这五项设置，不包含或覆盖任何 API 连接信息。</p>
                        <div class="tw-send-actions">
                            <button type="button" data-action="import-data">${icon('plus')}导入数据</button>
                            <button type="button" data-action="export-data">${icon('download')}导出数据</button>
                        </div>
                        <p class="tw-template-status tw-data-status" role="status" aria-live="polite"></p>
                        <input class="tw-data-import" type="file" accept="application/json,.json" hidden>
                    </div>
                </section>
            </div>
        </div>
    </dialog>
</dialog>`;

const PANEL_CSS = `
/* 样式只作用于衣柜，避免改变酒馆主题或其他脚本界面。 */
#tw-menu-entry {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none;
    user-select: none;
    touch-action: manipulation;
}

/* ───────── 设计令牌 ───────── */
#tw-panel {
    --tw-bg-base: #0b0c11;
    --tw-bg-surface: #11131b;
    --tw-bg-elevated: #181b27;
    --tw-bg-card: #141722;
    --tw-bg-hover: #202436;
    --tw-bg-input: #0c0e15;
    --tw-ink: #f1f2f7;
    --tw-ink-secondary: #c6c9d9;
    --tw-muted: #8d92a9;
    --tw-line: rgba(255, 255, 255, 0.07);
    --tw-line-strong: rgba(255, 255, 255, 0.15);
    --tw-accent: #c084fc;
    --tw-accent-strong: #9333ea;
    --tw-accent-ink: #f3e8ff;
    --tw-selected: rgba(168, 85, 247, 0.16);
    --tw-selected-border: rgba(192, 132, 252, 0.5);
    --tw-danger: #fb7185;
    --tw-danger-bg: rgba(244, 63, 94, 0.12);
    --tw-danger-border: rgba(244, 63, 94, 0.36);
    --tw-ok: #4ade80;
    --tw-radius: 10px;
    --tw-card-min: 176px;
    --tw-accent-glow: rgba(192, 132, 252, 0.22);
    --tw-pop-shadow: 0 18px 44px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.06);

    /* 占满酒馆视口：用 100% 而不是 100vw，避免页面滚动条的宽度把右栏挤出屏幕。 */
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
    border: 0;
    border-radius: 0;
    overflow: hidden;
    background: var(--tw-bg-base);
    color: var(--tw-ink);
    color-scheme: dark;
    box-shadow: none;
    font: 14px/1.5 "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    text-align: left;
    text-shadow: none;
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
}

#tw-panel::backdrop {
    background: rgba(5, 6, 11, 0.7);
}

#tw-panel, #tw-panel *, #tw-panel *::before, #tw-panel *::after {
    box-sizing: border-box;
}

/* 隐藏状态优先于组件的布局，收起的菜单、分组和空状态不占位。 */
#tw-panel [hidden] {
    display: none !important;
}

/* ───────── 抗污染基础：酒馆全局样式会改写按钮、输入框、复选框和标题，这里全部自行接管 ───────── */
#tw-panel :is(h1, h2, h3, p, button, input, select, textarea, dl, dt, dd, fieldset, legend, label, small) {
    margin: 0;
    color: inherit;
    font: inherit;
    text-shadow: none;
    letter-spacing: normal;
    text-transform: none;
}

#tw-panel button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    width: auto;
    min-width: 0;
    height: auto;
    padding: 0;
    border: 1px solid transparent;
    border-radius: var(--tw-radius);
    background: transparent;
    color: inherit;
    box-shadow: none;
    font-size: 13px;
    line-height: 1.2;
    white-space: nowrap;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    transition: background-color 0.14s ease, border-color 0.14s ease, color 0.14s ease, transform 0.1s ease, opacity 0.14s ease;
}

#tw-panel button:active:not(:disabled) {
    transform: scale(0.975);
}

#tw-panel button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
}

#tw-panel button, #tw-panel .tw-brand, #tw-panel .tw-nav-heading {
    -webkit-user-select: none;
    user-select: none;
}

#tw-panel :is(button, input, select, textarea, summary, [tabindex]):focus-visible {
    outline: 2px solid var(--tw-accent);
    outline-offset: 2px;
}

#tw-panel .tw-icon {
    display: block;
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    stroke: currentColor;
    stroke-width: 1.75;
    stroke-linecap: round;
    stroke-linejoin: round;
}

/* 文本输入、下拉与多行框 */
#tw-panel :is(input:not([type="checkbox"], [type="radio"], [type="range"], [type="file"], [type="submit"]), select, textarea) {
    width: 100%;
    min-width: 0;
    min-height: 38px;
    margin: 0;
    padding: 8px 12px;
    border: 1px solid var(--tw-line-strong);
    border-radius: var(--tw-radius);
    background-color: var(--tw-bg-input);
    background-image: none;
    box-shadow: none;
    color: var(--tw-ink);
    font-size: 13.5px;
    line-height: 1.4;
    -webkit-appearance: none;
    appearance: none;
    transition: border-color 0.14s ease, box-shadow 0.14s ease, background-color 0.14s ease;
}

#tw-panel :is(input, select, textarea)::placeholder {
    color: var(--tw-muted);
    opacity: 0.8;
}

#tw-panel :is(input:not([type="checkbox"], [type="radio"], [type="range"]), select, textarea):hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.26);
}

#tw-panel :is(input:not([type="checkbox"], [type="radio"], [type="range"]), select, textarea):focus {
    border-color: var(--tw-selected-border);
    box-shadow: 0 0 0 3px rgba(192, 132, 252, 0.14);
    outline: none;
}

#tw-panel :is(input, select, textarea):disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

#tw-panel input[type="search"]::-webkit-search-cancel-button {
    -webkit-appearance: none;
}

/* 原生下拉弹层跟随深色主题，避免出现灰底白字的系统样式 */
#tw-panel select {
    padding-right: 34px;
    cursor: pointer;
}

#tw-panel option, #tw-panel optgroup {
    background: #1b1e2b;
    color: #f1f2f7;
}

#tw-panel .tw-select-control {
    position: relative;
    display: block;
    min-width: 0;
}

#tw-panel .tw-select-control > .tw-icon {
    position: absolute;
    top: 50%;
    right: 11px;
    width: 15px;
    height: 15px;
    color: var(--tw-muted);
    pointer-events: none;
    transform: translateY(-50%);
}

/* 复选框、单选框：自绘，不依赖也不受酒馆主题影响 */
#tw-panel input:is([type="checkbox"], [type="radio"]) {
    position: relative;
    display: inline-block;
    flex: 0 0 auto;
    width: 18px;
    height: 18px;
    min-width: 18px;
    min-height: 18px;
    margin: 0;
    padding: 0;
    border: 1.5px solid rgba(255, 255, 255, 0.34);
    border-radius: 5px;
    background-color: rgba(8, 9, 14, 0.55);
    background-repeat: no-repeat;
    background-position: center;
    background-size: 13px;
    box-shadow: none;
    cursor: pointer;
    vertical-align: middle;
    -webkit-appearance: none;
    appearance: none;
    transition: background-color 0.12s ease, border-color 0.12s ease;
}

#tw-panel input:is([type="checkbox"], [type="radio"])::before,
#tw-panel input:is([type="checkbox"], [type="radio"])::after {
    content: none !important;
    display: none !important;
}

#tw-panel input[type="radio"] {
    border-radius: 50%;
}

#tw-panel input[type="checkbox"]:checked {
    border-color: var(--tw-accent);
    background-color: var(--tw-accent-strong);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m5 12.5 4.5 4.5L19 7'/%3E%3C/svg%3E");
}

#tw-panel input[type="checkbox"]:indeterminate {
    border-color: var(--tw-accent);
    background-color: var(--tw-accent-strong);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.4' stroke-linecap='round'%3E%3Cpath d='M6 12h12'/%3E%3C/svg%3E");
}

#tw-panel input[type="radio"]:checked {
    border-color: var(--tw-accent);
    background-color: var(--tw-accent-strong);
    background-image: radial-gradient(circle, #fff 0 32%, transparent 36%);
    background-size: 100% 100%;
}

#tw-panel input:is([type="checkbox"], [type="radio"]):disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

#tw-panel input[type="range"] {
    width: 100%;
    min-width: 0;
    height: 18px;
    margin: 0;
    padding: 0;
    background: transparent;
    accent-color: var(--tw-accent-strong);
    cursor: pointer;
}

/* 滚动条 */
#tw-panel :is(.tw-category-list, .tw-library-content, .tw-details, .tw-menu, .tw-tag-dropdown, .tw-import-grid, .tw-combination-items, .tw-settings-content, .tw-settings-nav, .tw-group-tabs, #tw-combination-editor, #tw-group-manager, #tw-import-picker) {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
}

#tw-panel ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

#tw-panel ::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.16);
}

#tw-panel ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.28);
}

#tw-panel ::-webkit-scrollbar-track {
    background: transparent;
}

/* 通用按钮层级：主按钮实心；次按钮描边；图标按钮方形 */
#tw-panel .tw-icon-button {
    width: 36px;
    height: 36px;
    border-color: var(--tw-line);
    background: var(--tw-bg-elevated);
    color: var(--tw-ink-secondary);
}

#tw-panel .tw-icon-button:not(:disabled):hover {
    border-color: var(--tw-line-strong);
    background: var(--tw-bg-hover);
    color: #fff;
}

#tw-panel .tw-close:not(:disabled):hover {
    border-color: var(--tw-danger-border);
    background: var(--tw-danger-bg);
    color: var(--tw-danger);
}

/* ───────── 外壳与顶栏 ───────── */
#tw-panel .tw-shell {
    display: grid;
    grid-template-rows: 58px minmax(0, 1fr);
    width: 100%;
    height: 100%;
    min-height: 0;
}

#tw-panel .tw-header {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
    padding: 0 16px;
    border-bottom: 1px solid var(--tw-line);
    background: var(--tw-bg-surface);
}

#tw-panel .tw-brand {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 11px;
}

#tw-panel .tw-brand > .tw-icon {
    width: 34px;
    height: 34px;
    padding: 7px;
    border: 1px solid var(--tw-selected-border);
    border-radius: 11px;
    background: linear-gradient(145deg, rgba(168, 85, 247, 0.3), rgba(99, 102, 241, 0.14));
    color: var(--tw-accent-ink);
}

#tw-panel h1 {
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.1;
    outline: none;
}

#tw-panel .tw-brand-subtitle {
    display: block;
    margin-top: 2px;
    color: var(--tw-muted);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

/* 大分类：末尾的操作按钮在窄屏保持可点击尺寸，页签区域可以横向滚动。 */
#tw-panel .tw-library-switcher {
    display: flex;
    flex: 0 1 auto;
    align-items: center;
    gap: 6px;
    min-width: 0;
}

#tw-panel .tw-library-tabs {
    display: flex;
    gap: 2px;
    min-width: 0;
    max-width: 46vw;
    padding: 3px;
    overflow-x: auto;
    border: 1px solid var(--tw-line);
    border-radius: 12px;
    background: var(--tw-bg-base);
    scrollbar-width: none;
}

#tw-panel .tw-library-tabs::-webkit-scrollbar {
    display: none;
}

#tw-panel .tw-library-tabs button {
    flex: 0 0 auto;
    height: 30px;
    padding: 0 14px;
    border-radius: 9px;
    color: var(--tw-ink-secondary);
    font-weight: 600;
}

#tw-panel .tw-library-tabs button:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
}

#tw-panel .tw-library-tabs button[aria-pressed="true"] {
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: var(--tw-accent-ink);
}

#tw-panel :is(.tw-add-library, .tw-delete-library) {
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 10px;
    color: var(--tw-muted);
}

#tw-panel .tw-add-library {
    border-style: dashed;
}

#tw-panel .tw-add-library:hover {
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: var(--tw-accent-ink);
}

#tw-panel .tw-delete-library:hover {
    border-color: var(--tw-danger-border);
    background: var(--tw-danger-bg);
    color: var(--tw-danger);
}

#tw-panel :is(.tw-add-library, .tw-delete-library) .tw-icon {
    width: 16px;
    height: 16px;
}

#tw-panel .tw-search {
    position: relative;
    display: block;
    flex: 1 1 280px;
    min-width: 140px;
    max-width: 460px;
    margin-left: auto;
}

#tw-panel .tw-search > .tw-icon {
    position: absolute;
    top: 50%;
    left: 12px;
    width: 16px;
    height: 16px;
    color: var(--tw-muted);
    pointer-events: none;
    transform: translateY(-50%);
}

#tw-panel .tw-search input {
    height: 38px;
    padding-left: 36px;
    border-radius: 999px;
    background-color: var(--tw-bg-base);
}

#tw-panel .tw-header-actions {
    display: flex;
    flex: 0 0 auto;
    gap: 8px;
}

/* ───────── 主体三栏 ───────── */
#tw-panel .tw-body {
    display: grid;
    grid-template-columns: clamp(208px, 15vw, 260px) minmax(0, 1fr) clamp(340px, 24vw, 440px);
    min-height: 0;
    min-width: 0;
}

#tw-panel .tw-mobile-actions,
#tw-panel .tw-mobile-filter {
    display: none;
}

/* ───────── 左栏：分组导航 ───────── */
#tw-panel .tw-sidebar {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    border-right: 1px solid var(--tw-line);
    background: var(--tw-bg-surface);
}

#tw-panel .tw-category-list {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 14px;
    min-height: 0;
    padding: 14px 10px;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
}

#tw-panel .tw-nav-section {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

#tw-panel .tw-nav-heading {
    padding: 0 10px 4px;
    color: var(--tw-muted);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
}

#tw-panel .tw-category {
    justify-content: flex-start;
    gap: 11px;
    width: 100%;
    height: 36px;
    padding: 0 8px 0 10px;
    border-radius: 9px;
    color: var(--tw-ink-secondary);
    font-size: 13.5px;
    text-align: left;
}

#tw-panel .tw-category > .tw-icon {
    width: 17px;
    height: 17px;
    color: var(--tw-muted);
}

#tw-panel .tw-category-label {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#tw-panel .tw-category:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
}

#tw-panel .tw-category:hover > .tw-icon {
    color: var(--tw-accent);
}

#tw-panel .tw-category[aria-pressed="true"] {
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: var(--tw-accent-ink);
    font-weight: 600;
}

#tw-panel .tw-category[aria-pressed="true"] > .tw-icon {
    color: var(--tw-accent);
}

#tw-panel .tw-count {
    min-width: 26px;
    padding: 1px 7px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    color: var(--tw-muted);
    font-size: 11.5px;
    font-variant-numeric: tabular-nums;
    text-align: center;
}

#tw-panel .tw-category[aria-pressed="true"] .tw-count {
    background: rgba(192, 132, 252, 0.25);
    color: #fff;
}

#tw-panel .tw-selection-scope {
    display: grid;
    gap: 5px;
    margin: 0 0 6px;
    padding: 0 2px 4px;
}

#tw-panel .tw-selection-scope > span:first-child {
    color: var(--tw-muted);
    font-size: 11.5px;
}

#tw-panel .tw-selection-scope select {
    min-height: 34px;
    padding: 5px 30px 5px 10px;
    font-size: 13px;
}

#tw-panel .tw-import-footer {
    display: grid;
    flex: 0 0 auto;
    gap: 8px;
    padding: 12px 12px 14px;
    border-top: 1px solid var(--tw-line);
    background: var(--tw-bg-surface);
}

#tw-panel .tw-import-footer button,
#tw-panel .tw-empty-action {
    height: 38px;
    padding: 0 14px;
    border-radius: var(--tw-radius);
    font-size: 13.5px;
    font-weight: 600;
}

#tw-panel .tw-import-footer .tw-import,
#tw-panel .tw-empty-action {
    border-color: rgba(192, 132, 252, 0.5);
    background: linear-gradient(135deg, #9333ea 0%, #6366f1 100%);
    color: #fff;
    box-shadow: 0 6px 18px -6px rgba(147, 51, 234, 0.6);
}

#tw-panel .tw-import-footer .tw-import:not(:disabled):hover,
#tw-panel .tw-empty-action:hover {
    filter: brightness(1.1);
}

#tw-panel .tw-import-footer .tw-export-all {
    border-color: var(--tw-line-strong);
    background: transparent;
    color: var(--tw-ink-secondary);
}

#tw-panel .tw-import-footer .tw-export-all:not(:disabled):hover {
    background: var(--tw-bg-hover);
    color: #fff;
}

/* ───────── 中栏：标签、工具栏、服装列表 ───────── */
#tw-panel .tw-library {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    background: var(--tw-bg-base);
}

#tw-panel .tw-group-bar {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 10px;
    min-width: 0;
    padding: 10px 16px;
    border-bottom: 1px solid var(--tw-line);
    background: var(--tw-bg-surface);
}

/* 仅标签列表横向滚动，新增与管理按钮固定在右侧，不会被长列表推走。 */
#tw-panel .tw-group-tabs {
    display: flex;
    flex: 1 1 0;
    align-items: center;
    gap: 6px;
    min-width: 0;
    padding: 2px 0;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 28px), transparent);
    mask-image: linear-gradient(90deg, #000 calc(100% - 28px), transparent);
}

#tw-panel .tw-group-tabs::-webkit-scrollbar {
    display: none;
}

#tw-panel .tw-group-tabs {
    scrollbar-width: none;
}

#tw-panel .tw-group-tabs > button,
#tw-panel .tw-group-tab {
    flex: 0 0 auto;
    height: 30px;
    border: 1px solid var(--tw-line);
    border-radius: 999px;
    background: var(--tw-bg-elevated);
    color: var(--tw-ink-secondary);
    font-size: 13px;
}

#tw-panel .tw-group-tabs > button {
    padding: 0 13px;
}

#tw-panel .tw-group-tab {
    display: inline-flex;
    align-items: center;
    overflow: hidden;
}

#tw-panel .tw-group-tab > button:first-child {
    height: 100%;
    padding: 0 6px 0 13px;
    border: 0;
    border-radius: 0;
    color: inherit;
}

#tw-panel .tw-group-tab [data-delete-group] {
    width: 0;
    height: 100%;
    padding: 0;
    border: 0;
    border-radius: 0;
    color: var(--tw-muted);
    opacity: 0;
    overflow: hidden;
    transition: width 0.12s ease, opacity 0.12s ease, color 0.12s ease, background-color 0.12s ease;
}

#tw-panel .tw-group-tab:hover [data-delete-group],
#tw-panel .tw-group-tab[data-active="true"] [data-delete-group],
#tw-panel .tw-group-tab:focus-within [data-delete-group] {
    width: 26px;
    opacity: 1;
}

#tw-panel .tw-group-tab > button:first-child {
    padding-right: 13px;
}

#tw-panel .tw-group-tab:hover > button:first-child,
#tw-panel .tw-group-tab[data-active="true"] > button:first-child,
#tw-panel .tw-group-tab:focus-within > button:first-child {
    padding-right: 4px;
}

#tw-panel .tw-group-tab [data-delete-group]:hover {
    background: var(--tw-danger-bg);
    color: var(--tw-danger);
}

#tw-panel [data-delete-group] .tw-icon {
    width: 13px;
    height: 13px;
}

#tw-panel .tw-group-tabs > button:hover,
#tw-panel .tw-group-tab:hover {
    border-color: var(--tw-line-strong);
    background: var(--tw-bg-hover);
    color: #fff;
}

#tw-panel .tw-group-tabs > button[aria-pressed="true"],
#tw-panel .tw-group-tab[data-active="true"] {
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: var(--tw-accent-ink);
    font-weight: 600;
}

#tw-panel .tw-group-tools {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 6px;
    padding-left: 10px;
    border-left: 1px solid var(--tw-line);
}

#tw-panel .tw-group-tools button {
    height: 30px;
    padding: 0 11px;
    border-color: var(--tw-line);
    border-radius: 999px;
    color: var(--tw-ink-secondary);
}

#tw-panel .tw-group-tools button[data-action="manage-groups"] {
    width: 30px;
    padding: 0;
}

#tw-panel .tw-group-tools button:not(:disabled):hover {
    border-color: var(--tw-line-strong);
    background: var(--tw-bg-hover);
    color: #fff;
}

#tw-panel .tw-group-tools .tw-icon {
    width: 15px;
    height: 15px;
}

#tw-panel .tw-library-toolbar {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 12px;
    min-width: 0;
    padding: 9px 16px;
    border-bottom: 1px solid var(--tw-line);
}

#tw-panel .tw-toolbar-start,
#tw-panel .tw-toolbar-end {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}

#tw-panel .tw-toolbar-end {
    margin-left: auto;
}

#tw-panel .tw-toolbar-start button {
    height: 34px;
    padding: 0 13px;
    border-color: var(--tw-line);
    background: var(--tw-bg-elevated);
    color: var(--tw-ink-secondary);
    font-weight: 500;
}

#tw-panel .tw-toolbar-start button:not(:disabled):hover {
    border-color: var(--tw-line-strong);
    background: var(--tw-bg-hover);
    color: #fff;
}

#tw-panel .tw-toolbar-start .tw-icon {
    width: 16px;
    height: 16px;
}

/* 多选是模式开关：开启后高亮，文字由状态表达 */
#tw-panel .tw-toggle-multi[aria-pressed="true"] {
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: var(--tw-accent-ink);
}

#tw-panel .tw-result-count {
    min-width: 0;
    overflow: hidden;
    color: var(--tw-muted);
    font-size: 12.5px;
    font-variant-numeric: tabular-nums;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#tw-panel .tw-sort {
    position: relative;
    display: block;
    width: 148px;
}

#tw-panel .tw-sort > .tw-icon {
    position: absolute;
    top: 50%;
    left: 11px;
    z-index: 1;
    width: 15px;
    height: 15px;
    color: var(--tw-muted);
    pointer-events: none;
    transform: translateY(-50%);
}

#tw-panel .tw-sort select {
    min-height: 34px;
    padding: 5px 30px 5px 32px;
    font-size: 13px;
}

#tw-panel .tw-density {
    display: block;
    width: 92px;
}

#tw-panel .tw-view-modes {
    display: flex;
    gap: 2px;
    padding: 2px;
    border: 1px solid var(--tw-line);
    border-radius: 11px;
    background: var(--tw-bg-base);
}

#tw-panel .tw-view-modes .tw-icon-button {
    width: 32px;
    height: 30px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: var(--tw-muted);
}

#tw-panel .tw-view-modes .tw-icon-button[aria-pressed="true"] {
    background: var(--tw-selected);
    color: var(--tw-accent-ink);
}

#tw-panel .tw-library[data-layout="list"] .tw-density {
    display: none;
}

#tw-panel .tw-library-content {
    flex: 1 1 auto;
    min-height: 0;
    padding: 18px 18px 28px;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
}

#tw-panel .tw-library[data-multi-select="true"] .tw-library-content {
    padding-bottom: 104px;
}

/* 操作结果浮在列表顶部且可点击穿透，不遮挡批量菜单；成功提示自动消失，错误保留到下一次操作。 */
#tw-panel .tw-content-frame {
    position: relative;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
}

#tw-panel .tw-library-status {
    position: absolute;
    top: 12px;
    left: 50%;
    z-index: 30;
    max-width: min(560px, calc(100% - 32px));
    padding: 10px 16px;
    border: 1px solid var(--tw-selected-border);
    border-radius: 12px;
    background: #231a38;
    box-shadow: var(--tw-pop-shadow);
    color: var(--tw-accent-ink);
    font-size: 13px;
    overflow-wrap: anywhere;
    pointer-events: none;
    transform: translateX(-50%);
}

#tw-panel .tw-library-status:empty {
    display: none;
}

#tw-panel .tw-library-status[data-error="true"] {
    border-color: var(--tw-danger-border);
    background: #35151d;
    color: #ffd7de;
}

/* ───────── 服装卡片：卡片较多时只绘制可见部分，滚动更流畅 ───────── */
#tw-panel .tw-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(var(--tw-card-min), 100%), 1fr));
    gap: 14px;
    width: 100%;
}

#tw-panel .tw-garment-entry {
    position: relative;
    min-width: 0;
    content-visibility: auto;
    contain-intrinsic-size: auto calc(var(--tw-card-min) + 86px);
}

#tw-panel .tw-garment-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-content: start;
    gap: 9px;
    width: 100%;
    padding: 8px 8px 10px;
    overflow: hidden;
    border: 1px solid var(--tw-line);
    border-radius: 14px;
    background: var(--tw-bg-card);
    color: var(--tw-ink);
    text-align: left;
}

#tw-panel .tw-garment-card:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: var(--tw-bg-elevated);
}

#tw-panel .tw-garment-card:focus-visible {
    outline-offset: -2px;
}

#tw-panel .tw-garment-card[aria-pressed="true"] {
    border-color: var(--tw-accent);
    background: linear-gradient(180deg, rgba(168, 85, 247, 0.2) 0%, var(--tw-bg-card) 100%);
    box-shadow: inset 0 0 0 1px rgba(192, 132, 252, 0.55);
}

#tw-panel .tw-garment-card img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: contain;
    padding: 6px;
    border-radius: 10px;
    background: radial-gradient(circle at 50% 40%, #252a3d 0%, #0f111a 100%);
}

#tw-panel .tw-garment-card > .tw-icon {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    padding: 34%;
    border-radius: 10px;
    background: radial-gradient(circle at 50% 40%, #222639 0%, #0f111a 100%);
    color: rgba(141, 146, 169, 0.7);
    stroke-width: 1.4;
}

#tw-panel .tw-garment-card > span {
    padding: 0 3px;
    overflow: hidden;
    color: var(--tw-ink);
    font-size: 13.5px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 穿着状态与标签保持单行，避免多标签或长名称撑高卡片。 */
#tw-panel .tw-card-meta {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 6px;
    min-width: 0;
    padding: 0 3px;
}

#tw-panel .tw-card-tags {
    display: flex;
    flex: 1 1 0;
    flex-wrap: nowrap;
    gap: 4px;
    justify-content: flex-end;
    min-width: 0;
    max-height: 24px;
    overflow: hidden;
    margin-left: auto;
}

#tw-panel .tw-card-meta > small {
    flex: 0 1 auto;
    max-width: 52%;
}

#tw-panel .tw-card-tags {
    min-width: 36px;
}

#tw-panel .tw-card-tags .tw-card-tag-overflow {
    flex: 0 0 auto;
}

#tw-panel .tw-garment-card small {
    min-width: 0;
    max-width: 100%;
    padding: 2px 8px;
    overflow: hidden;
    border: 1px solid rgba(192, 132, 252, 0.26);
    border-radius: 999px;
    background: rgba(192, 132, 252, 0.13);
    color: #e9d5ff;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.45;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#tw-panel .tw-card-tags small {
    border-color: var(--tw-line);
    background: rgba(255, 255, 255, 0.05);
    color: var(--tw-ink-secondary);
}

#tw-panel .tw-favorite {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 2;
    width: 30px;
    height: 30px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: rgba(9, 10, 16, 0.62);
    color: rgba(255, 255, 255, 0.82);
    opacity: 0;
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
}

#tw-panel .tw-garment-entry:hover .tw-favorite,
#tw-panel .tw-favorite:focus-visible,
#tw-panel .tw-favorite[aria-pressed="true"] {
    opacity: 1;
}

#tw-panel .tw-favorite:hover {
    background: rgba(9, 10, 16, 0.85);
    color: #fff;
}

#tw-panel .tw-favorite .tw-icon {
    width: 16px;
    height: 16px;
}

#tw-panel .tw-favorite[aria-pressed="true"] {
    color: #f472b6;
}

#tw-panel .tw-favorite[aria-pressed="true"] .tw-icon {
    fill: currentColor;
}

/* 普通模式彻底隐藏勾选框，鼠标悬停和键盘聚焦都不会意外进入多选。 */
#tw-panel .tw-item-check {
    position: absolute;
    top: 14px;
    left: 14px;
    z-index: 3;
    display: none;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: rgba(9, 10, 16, 0.6);
    cursor: pointer;
}

#tw-panel .tw-library[data-multi-select="true"] .tw-item-check {
    display: flex;
}

#tw-panel .tw-library[data-multi-select="true"] .tw-favorite {
    display: none;
}

#tw-panel .tw-garment-entry[data-checked="true"] .tw-garment-card {
    border-color: var(--tw-accent);
    background: linear-gradient(180deg, rgba(168, 85, 247, 0.26) 0%, var(--tw-bg-card) 100%);
    box-shadow: inset 0 0 0 1px rgba(192, 132, 252, 0.55);
}

/* 列表视图 */
#tw-panel .tw-library[data-layout="list"] .tw-items {
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
}

#tw-panel .tw-library[data-layout="list"] .tw-garment-entry {
    contain-intrinsic-size: auto 76px;
}

#tw-panel .tw-library[data-layout="list"] .tw-garment-card {
    grid-template-columns: 56px minmax(0, 1fr);
    align-items: center;
    gap: 3px 14px;
    padding: 8px 56px 8px 12px;
    border-radius: 12px;
}

#tw-panel .tw-library[data-layout="list"] .tw-garment-card > :is(img, .tw-icon) {
    grid-row: 1 / 3;
    width: 56px;
    height: 56px;
    padding: 4px;
}

#tw-panel .tw-library[data-layout="list"] .tw-garment-card > .tw-icon {
    padding: 14px;
    aspect-ratio: auto;
}

#tw-panel .tw-library[data-layout="list"] .tw-card-tags {
    justify-content: flex-start;
    margin-left: 0;
}

#tw-panel .tw-library[data-layout="list"] .tw-card-meta {
    justify-content: flex-start;
}

#tw-panel .tw-library[data-layout="list"] :is(.tw-item-check, .tw-favorite) {
    top: 50%;
    right: 14px;
    transform: translateY(-50%);
}

#tw-panel .tw-library[data-layout="list"] .tw-item-check {
    right: auto;
    left: 18px;
    top: 50%;
    z-index: 4;
}

#tw-panel .tw-library[data-layout="list"][data-multi-select="true"] .tw-garment-card {
    padding-left: 52px;
    padding-right: 12px;
}

#tw-panel .tw-library[data-layout="list"] .tw-favorite {
    opacity: 1;
    background: transparent;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    color: var(--tw-muted);
}

#tw-panel .tw-library[data-layout="list"] .tw-favorite[aria-pressed="true"] {
    color: #f472b6;
}

/* ───────── 空状态 ───────── */
#tw-panel .tw-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: min(420px, 60%);
    padding: 40px 16px;
    color: var(--tw-muted);
    text-align: center;
}

#tw-panel .tw-empty > .tw-icon {
    width: 76px;
    height: 76px;
    padding: 18px;
    border: 1px dashed var(--tw-line-strong);
    border-radius: 22px;
    background: var(--tw-bg-surface);
    color: rgba(192, 132, 252, 0.6);
    stroke-width: 1.4;
}

#tw-panel h2 {
    color: var(--tw-ink);
    font-size: 16px;
    font-weight: 600;
}

#tw-panel .tw-empty-hint {
    max-width: 34ch;
    margin: 0;
    font-size: 13px;
}

#tw-panel .tw-empty-action {
    margin-top: 6px;
}

#tw-panel .tw-empty:not([data-kind="no-garments"]) .tw-empty-hint,
#tw-panel .tw-empty:not([data-kind="no-garments"]) .tw-empty-action {
    display: none;
}

/* ───────── 批量操作栏 ───────── */
#tw-panel .tw-bulk-actions {
    position: absolute;
    right: 16px;
    bottom: 18px;
    left: 16px;
    z-index: 20;
    width: max-content;
    max-width: calc(100% - 32px);
    margin: 0 auto;
    padding: 8px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 16px;
    background: #181b28;
    box-shadow: var(--tw-pop-shadow);
}

#tw-panel .tw-bulk-main {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

#tw-panel .tw-bulk-selection {
    display: flex;
    align-items: center;
    gap: 9px;
    height: 36px;
    padding: 0 10px 0 8px;
    border-radius: 10px;
    color: var(--tw-ink);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
}

#tw-panel .tw-bulk-sep {
    width: 1px;
    height: 22px;
    margin: 0 4px;
    background: var(--tw-line-strong);
}

#tw-panel .tw-bulk-main button:not(.tw-menu-item) {
    height: 36px;
    padding: 0 12px;
    border-color: var(--tw-line);
    background: rgba(255, 255, 255, 0.04);
    color: var(--tw-ink-secondary);
    font-weight: 500;
}

#tw-panel .tw-bulk-main button:not(:disabled, .tw-menu-item):hover {
    border-color: var(--tw-line-strong);
    background: var(--tw-bg-hover);
    color: #fff;
}

#tw-panel .tw-bulk-trigger[aria-expanded="true"] {
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: var(--tw-accent-ink);
}

#tw-panel .tw-bulk-main .tw-icon {
    width: 16px;
    height: 16px;
}

#tw-panel .tw-bulk-trigger > .tw-icon:last-child {
    width: 13px;
    height: 13px;
    margin-left: -1px;
    color: var(--tw-muted);
}

#tw-panel .tw-bulk-favorite-button[aria-pressed="true"] {
    border-color: rgba(244, 114, 182, 0.4);
    background: rgba(244, 114, 182, 0.12);
    color: #f9a8d4;
}

#tw-panel .tw-bulk-favorite-button[aria-pressed="true"] .tw-icon {
    fill: currentColor;
}

#tw-panel .tw-bulk-main .tw-bulk-delete {
    border-color: var(--tw-danger-border);
    background: var(--tw-danger-bg);
    color: var(--tw-danger);
}

#tw-panel .tw-bulk-main .tw-bulk-delete:not(:disabled):hover {
    background: rgba(244, 63, 94, 0.24);
    color: #fff;
}

#tw-panel .tw-bulk-main .tw-bulk-done {
    width: 36px;
    padding: 0;
    border-color: transparent;
    background: transparent;
    color: var(--tw-muted);
}

/* 弹出菜单：向上展开，样式完全自控 */
#tw-panel .tw-menu-wrap {
    position: relative;
}

#tw-panel .tw-menu {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 0;
    z-index: 40;
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 224px;
    max-height: min(360px, 55dvh);
    padding: 6px;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    border: 1px solid var(--tw-line-strong);
    border-radius: 14px;
    background: #1b1e2c;
    box-shadow: var(--tw-pop-shadow);
}

#tw-panel .tw-menu-wide {
    width: 264px;
}

#tw-panel .tw-menu-title {
    padding: 6px 10px 4px;
    color: var(--tw-muted);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
}

#tw-panel .tw-menu-search {
    position: sticky;
    top: -6px;
    z-index: 1;
    margin: -6px -6px 4px;
    padding: 8px 8px 6px;
    background: #1b1e2c;
}

#tw-panel .tw-menu-search input {
    min-height: 34px;
    font-size: 13px;
}

#tw-panel .tw-menu-item {
    justify-content: flex-start;
    gap: 10px;
    width: 100%;
    height: 36px;
    padding: 0 10px;
    border: 0;
    border-radius: 9px;
    color: var(--tw-ink);
    font-size: 13.5px;
    text-align: left;
}

#tw-panel .tw-menu-item > span:last-child {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#tw-panel .tw-menu-item:hover,
#tw-panel .tw-menu-item:focus-visible {
    background: rgba(255, 255, 255, 0.07);
    outline: none;
}

/* 三态标记：全部选中、部分选中、未选 */
#tw-panel .tw-menu-mark {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 18px;
    height: 18px;
    border: 1.5px solid rgba(255, 255, 255, 0.34);
    border-radius: 5px;
    color: transparent;
}

#tw-panel .tw-menu-item[role="menuitemradio"] .tw-menu-mark {
    border-radius: 50%;
}

#tw-panel .tw-menu-mark .tw-icon {
    width: 12px;
    height: 12px;
    stroke-width: 3.2;
}

#tw-panel .tw-menu-item[aria-checked="true"] .tw-menu-mark,
#tw-panel .tw-menu-item[aria-checked="mixed"] .tw-menu-mark {
    border-color: var(--tw-accent);
    background: var(--tw-accent-strong);
    color: #fff;
}

#tw-panel .tw-menu-item[aria-checked="mixed"] .tw-menu-mark .tw-icon-check,
#tw-panel .tw-menu-item:not([aria-checked="mixed"]) .tw-menu-mark .tw-icon-minus {
    display: none;
}

#tw-panel .tw-menu-item[data-tone="danger"] {
    color: var(--tw-danger);
}

#tw-panel .tw-menu-divider {
    height: 1px;
    margin: 4px 2px;
    background: var(--tw-line);
}

#tw-panel .tw-menu-empty {
    padding: 10px;
    color: var(--tw-muted);
    font-size: 12.5px;
}

/* ───────── 右栏：预览与详情 ───────── */
#tw-panel .tw-details {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    min-height: 0;
    padding: 16px 16px 0;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    border-left: 1px solid var(--tw-line);
    background: var(--tw-bg-surface);
}

#tw-panel .tw-preview-wrap {
    display: grid;
    flex: 0 0 auto;
    gap: 8px;
}

#tw-panel .tw-preview {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: clamp(150px, 27dvh, 380px);
    padding: 12px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 16px;
    background:
        radial-gradient(circle at 50% 35%, rgba(168, 85, 247, 0.14) 0%, rgba(15, 17, 25, 0.96) 72%),
        var(--tw-bg-input);
    color: var(--tw-muted);
}

#tw-panel .tw-preview > .tw-icon {
    width: 56px;
    height: 56px;
    color: rgba(192, 132, 252, 0.45);
    stroke-width: 1.4;
}

#tw-panel .tw-preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 8px;
    filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45));
}

#tw-panel .tw-preview-image {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: stretch;
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: 0;
    border-radius: 8px;
    cursor: zoom-in;
}

#tw-panel .tw-preview-image img {
    flex: 1;
    min-height: 0;
    object-position: left center;
}

#tw-panel .tw-preview-image span {
    color: var(--tw-muted);
    font-size: 12px;
    text-align: left;
}

/* 正背面始终各占一列，缺图仍保留对应位置，避免误把另一面当作待替换图。 */
#tw-panel .tw-preview[data-sides="true"] {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    align-items: stretch;
}

#tw-panel .tw-preview-image:disabled {
    opacity: 1;
    justify-content: center;
    border: 1px dashed var(--tw-line-strong);
}

#tw-panel .tw-preview-image:disabled span {
    text-align: center;
}

#tw-panel .tw-preview-member:not(:disabled) {
    cursor: zoom-in;
}

/* 搭配直接用成员原图拼成预览，每个成员可单独放大。 */
#tw-panel .tw-preview[data-combination="true"] {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: minmax(0, 1fr);
    gap: 8px;
}

#tw-panel .tw-preview-member {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 0;
    min-height: 0;
    padding: 0;
    color: var(--tw-muted);
}

#tw-panel .tw-preview-member img {
    flex: 1;
    min-height: 0;
}

#tw-panel .tw-preview-member span {
    max-width: 100%;
    overflow: hidden;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#tw-panel .tw-image-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
}

#tw-panel .tw-image-actions button {
    flex: 1 1 auto;
    height: 30px;
    padding: 0 6px;
    border-color: var(--tw-line-strong);
    color: var(--tw-ink-secondary);
    font-size: 12.5px;
}

#tw-panel .tw-image-actions button:not(:disabled):hover {
    background: var(--tw-bg-hover);
    color: #fff;
}

#tw-panel .tw-image-actions button[data-action="remove-image"]:not(:disabled):hover {
    border-color: var(--tw-danger-border);
    background: var(--tw-danger-bg);
    color: var(--tw-danger);
}

/* 归属独立放在图片上方，避免与下方详情分页混淆。 */
#tw-panel .tw-wearer-card {
    display: grid;
    flex: 0 0 auto;
    gap: 10px;
    padding: 12px;
    border: 1px solid var(--tw-line);
    border-radius: 14px;
    background: var(--tw-bg-card);
}

#tw-panel .tw-wearer-row {
    display: grid;
    gap: 7px;
}

#tw-panel .tw-wearer-label {
    display: flex;
    align-items: baseline;
    gap: 8px;
    color: var(--tw-ink);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
}

#tw-panel .tw-wearer-label small {
    color: var(--tw-muted);
    font-size: 11.5px;
    font-weight: 400;
}

#tw-panel .tw-wearer-modes {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    min-width: 0;
}

#tw-panel .tw-wearer-modes label {
    display: flex;
    align-items: center;
    gap: 9px;
    height: 36px;
    padding: 0 12px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 10px;
    background: var(--tw-bg-input);
    color: var(--tw-ink-secondary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.14s ease, background-color 0.14s ease;
}

#tw-panel .tw-wearer-modes label:hover {
    border-color: rgba(255, 255, 255, 0.28);
}

#tw-panel .tw-wearer-modes label:has(:checked) {
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: var(--tw-accent-ink);
}

#tw-panel .tw-wearer-modes label:has(:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 详情分页 */
#tw-panel .tw-detail-tabs {
    display: grid;
    flex: 0 0 auto;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2px;
    padding: 3px;
    border: 1px solid var(--tw-line);
    border-radius: 12px;
    background: var(--tw-bg-base);
}

#tw-panel .tw-detail-tabs button {
    height: 32px;
    border-radius: 9px;
    color: var(--tw-muted);
    font-weight: 600;
}

#tw-panel .tw-detail-tabs .tw-icon {
    width: 15px;
    height: 15px;
}

#tw-panel .tw-detail-tabs button:hover {
    color: #fff;
}

#tw-panel .tw-detail-tabs button[aria-pressed="true"] {
    border-color: var(--tw-line-strong);
    background: var(--tw-bg-elevated);
    color: var(--tw-accent-ink);
}

#tw-panel .tw-detail-content {
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    min-height: 230px;
}

#tw-panel .tw-detail-content > section {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
}

#tw-panel .tw-properties {
    display: grid;
    gap: 12px;
}

#tw-panel .tw-description-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

#tw-panel .tw-field {
    display: grid;
    gap: 6px;
    min-width: 0;
}

#tw-panel .tw-field > span:first-child {
    color: var(--tw-muted);
    font-size: 12px;
    font-weight: 600;
}

#tw-panel .tw-description-actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
}

#tw-panel .tw-describe {
    height: 38px;
    padding: 0 14px;
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: var(--tw-accent-ink);
    font-weight: 600;
}

#tw-panel .tw-describe:not(:disabled):hover {
    background: rgba(168, 85, 247, 0.28);
}

#tw-panel .tw-describe .tw-icon {
    width: 16px;
    height: 16px;
}

#tw-panel .tw-details textarea {
    flex: 1 1 auto;
    min-height: 180px;
    padding: 10px 12px;
    resize: vertical;
    line-height: 1.6;
}

#tw-panel .tw-combination-details {
    display: grid;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 12px;
    background: var(--tw-bg-card);
    color: var(--tw-muted);
    font-size: 12.5px;
}

#tw-panel .tw-combination-details button {
    height: 36px;
    border-color: var(--tw-line-strong);
    color: var(--tw-ink);
}

#tw-panel .tw-combination-details button:not(:disabled):hover {
    background: var(--tw-bg-hover);
}

/* 标签页：直接展开，标签是可点选的胶囊，数百个标签也在本区域内滚动 */
#tw-panel .tw-tag-picker {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
}

#tw-panel .tw-tag-summary {
    color: var(--tw-muted);
    font-size: 12.5px;
    overflow-wrap: anywhere;
}

#tw-panel .tw-tag-dropdown {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
}

#tw-panel .tw-tag-search-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
}

#tw-panel .tw-tag-search-row button {
    height: 38px;
    padding: 0 12px;
    border-color: var(--tw-line-strong);
    color: var(--tw-ink-secondary);
    font-weight: 600;
}

#tw-panel .tw-tag-search-row button:not(:disabled):hover {
    background: var(--tw-bg-hover);
    color: #fff;
}

#tw-panel .tw-tag-search-row .tw-icon {
    width: 15px;
    height: 15px;
}

#tw-panel .tw-garment-tag {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 7px;
    min-width: 0;
    max-height: 46dvh;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    border: 0;
}

#tw-panel .tw-garment-tag > label {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 13px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 999px;
    background: var(--tw-bg-elevated);
    color: var(--tw-ink-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: border-color 0.12s ease, background-color 0.12s ease, color 0.12s ease;
}

#tw-panel .tw-garment-tag > label:hover {
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
}

#tw-panel .tw-garment-tag > label:has(:checked) {
    border-color: var(--tw-accent);
    background: var(--tw-selected);
    color: var(--tw-accent-ink);
    font-weight: 600;
}

#tw-panel .tw-garment-tag > label:has(:focus-visible) {
    outline: 2px solid var(--tw-accent);
    outline-offset: 2px;
}

#tw-panel .tw-garment-tag > label:has(:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 复选框仍保留给键盘和读屏，视觉上由整颗胶囊表达选中。 */
#tw-panel .tw-garment-tag input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    margin: 0;
    border: 0;
    border-radius: 999px;
    background: transparent !important;
    opacity: 0;
    cursor: inherit;
}

#tw-panel .tw-tag-empty {
    color: var(--tw-muted);
    font-size: 12.5px;
}

/* 底部操作：保存为主，导出次之，删除单独分隔并用红色强调 */
#tw-panel .tw-detail-actions {
    position: sticky;
    bottom: 0;
    z-index: 2;
    display: grid;
    flex: 0 0 auto;
    gap: 8px;
    margin: 0 -16px;
    padding: 12px 16px 14px;
    border-top: 1px solid var(--tw-line);
    background: var(--tw-bg-surface);
}

#tw-panel .tw-action-row {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) auto;
    gap: 8px;
}

#tw-panel .tw-action-row button {
    height: 38px;
    padding: 0 14px;
    border-color: var(--tw-line-strong);
    color: var(--tw-ink-secondary);
    font-weight: 600;
}

#tw-panel .tw-action-row button:not(:disabled):hover {
    background: var(--tw-bg-hover);
    color: #fff;
}

#tw-panel .tw-action-row .tw-icon {
    width: 16px;
    height: 16px;
}

#tw-panel .tw-action-row .tw-save:not(:disabled) {
    border-color: rgba(192, 132, 252, 0.5);
    background: linear-gradient(135deg, #9333ea 0%, #6366f1 100%);
    color: #fff;
}

#tw-panel .tw-action-row .tw-save:not(:disabled):hover {
    background: linear-gradient(135deg, #9333ea 0%, #6366f1 100%);
    filter: brightness(1.1);
}

#tw-panel .tw-action-row .tw-delete {
    width: 44px;
    padding: 0;
    border-color: var(--tw-danger-border);
    background: var(--tw-danger-bg);
    color: var(--tw-danger);
}

#tw-panel .tw-action-row .tw-delete span {
    display: none;
}

#tw-panel .tw-action-row .tw-delete:not(:disabled):hover {
    background: rgba(244, 63, 94, 0.26);
    color: #fff;
}

#tw-panel .tw-garment-status {
    min-height: 0;
    color: var(--tw-accent);
    font-size: 12.5px;
    overflow-wrap: anywhere;
}

#tw-panel .tw-garment-status:empty {
    display: none;
}

#tw-panel .tw-garment-status[data-error="true"] {
    color: var(--tw-danger);
}

/* 没有选中服装时只显示占位，不展示一整套禁用的表单 */
#tw-panel .tw-details[data-empty="true"] > :not(.tw-preview-wrap) {
    display: none;
}

#tw-panel .tw-details[data-empty="true"] .tw-preview-wrap {
    flex: 1 1 auto;
    grid-template-rows: minmax(0, 1fr);
}

#tw-panel .tw-details[data-empty="true"] .tw-preview {
    height: auto;
    min-height: 240px;
    border-style: dashed;
}

#tw-panel .tw-details[data-empty="true"] .tw-image-actions {
    display: none;
}

/* ───────── 弹窗统一外观 ───────── */
#tw-panel dialog:not(#tw-panel) {
    color: var(--tw-ink);
}

#tw-panel .tw-import-conflict,
#tw-panel #tw-ask,
#tw-panel #tw-import-picker,
#tw-panel #tw-export-picker,
#tw-panel #tw-group-manager,
#tw-panel #tw-combination-editor {
    margin: auto;
    padding: 20px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 18px;
    background: var(--tw-bg-surface);
    color: var(--tw-ink);
    box-shadow: 0 30px 80px -16px rgba(0, 0, 0, 0.85);
}

#tw-panel .tw-import-conflict::backdrop,
#tw-panel #tw-ask::backdrop,
#tw-panel #tw-import-picker::backdrop,
#tw-panel #tw-export-picker::backdrop,
#tw-panel #tw-group-manager::backdrop,
#tw-panel #tw-combination-editor::backdrop {
    background: rgba(4, 5, 10, 0.7);
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
}

#tw-panel .tw-import-conflict {
    width: min(440px, calc(100% - 32px));
}

#tw-panel .tw-import-conflict h2 {
    margin-bottom: 8px;
}

#tw-panel .tw-import-conflict p {
    margin-bottom: 16px;
    color: var(--tw-ink-secondary);
    overflow-wrap: anywhere;
}

#tw-panel .tw-import-conflict form {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

#tw-panel .tw-import-conflict button {
    flex: 1;
    height: 38px;
    padding: 0 12px;
    border-color: var(--tw-line-strong);
    background: var(--tw-bg-elevated);
    font-weight: 600;
}

/* 确认 / 输入弹窗：取代浏览器自带的 confirm 与 prompt */
#tw-panel #tw-ask {
    width: min(440px, calc(100% - 32px));
}

#tw-panel .tw-ask-form {
    display: grid;
    gap: 12px;
}

#tw-panel .tw-ask-message {
    color: var(--tw-ink-secondary);
    line-height: 1.6;
    overflow-wrap: anywhere;
    white-space: pre-line;
}

#tw-panel .tw-ask-message:empty {
    display: none;
}

#tw-panel .tw-ask-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 4px;
}

#tw-panel .tw-ask-actions button {
    height: 38px;
    min-width: 84px;
    padding: 0 18px;
    border-color: var(--tw-line-strong);
    background: var(--tw-bg-elevated);
    color: var(--tw-ink-secondary);
    font-weight: 600;
}

#tw-panel .tw-ask-actions button:hover {
    background: var(--tw-bg-hover);
    color: #fff;
}

#tw-panel .tw-ask-actions .tw-ask-ok {
    border-color: rgba(192, 132, 252, 0.5);
    background: linear-gradient(135deg, #9333ea 0%, #6366f1 100%);
    color: #fff;
}

#tw-panel #tw-ask[data-danger="true"] .tw-ask-ok {
    border-color: var(--tw-danger-border);
    background: #dc2650;
}

#tw-panel .tw-ask-actions .tw-ask-ok:hover {
    background: linear-gradient(135deg, #9333ea 0%, #6366f1 100%);
    filter: brightness(1.1);
}

#tw-panel #tw-ask[data-danger="true"] .tw-ask-ok:hover {
    background: #e63a63;
}

/* 导入与导出共用弹窗外观；导出先选择衣柜和内容，确认前不读取原图。 */
#tw-panel :is(#tw-import-picker, #tw-export-picker) {
    width: min(900px, calc(100vw - 24px));
    max-height: calc(100dvh - 32px);
    overflow-y: auto;
}

#tw-panel :is(#tw-import-picker, #tw-export-picker) header,
#tw-panel :is(#tw-import-picker, #tw-export-picker) footer,
#tw-panel .tw-import-tools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}

#tw-panel :is(#tw-import-picker, #tw-export-picker) header,
#tw-panel :is(#tw-import-picker, #tw-export-picker) footer {
    justify-content: space-between;
}

#tw-panel :is(#tw-import-picker, #tw-export-picker) header button {
    width: 34px;
    height: 34px;
}

#tw-panel :is(#tw-import-picker, #tw-export-picker) button {
    min-height: 38px;
    padding: 0 14px;
    border-color: var(--tw-line-strong);
    background: var(--tw-bg-elevated);
    color: var(--tw-ink-secondary);
    font-weight: 600;
}

#tw-panel :is(#tw-import-picker, #tw-export-picker) button:not(:disabled):hover {
    background: var(--tw-bg-hover);
    color: #fff;
}

#tw-panel .tw-import-tools {
    margin: 14px 0;
}

#tw-panel .tw-import-empty {
    padding: 36px 0;
    color: var(--tw-muted);
    text-align: center;
}

#tw-panel .tw-import-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
    gap: 10px;
    max-height: min(52dvh, 480px);
    overflow-y: auto;
}

#tw-panel .tw-import-grid:empty {
    display: none;
}

#tw-panel .tw-import-card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    padding: 8px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 12px;
    background: var(--tw-bg-card);
    cursor: pointer;
}

#tw-panel .tw-import-card:has(:checked) {
    border-color: var(--tw-accent);
    background: var(--tw-selected);
}

#tw-panel .tw-import-card input {
    position: absolute;
    top: 12px;
    right: 12px;
}

#tw-panel .tw-import-card img {
    width: 100%;
    height: 118px;
    object-fit: contain;
    border-radius: 8px;
    background: #0f111a;
}

#tw-panel .tw-import-card > .tw-icon {
    width: 100%;
    height: 118px;
    color: var(--tw-muted);
}

#tw-panel .tw-import-card span {
    overflow: hidden;
    font-size: 12.5px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#tw-panel :is(.tw-import-status, .tw-export-status) {
    margin-top: 8px;
    color: var(--tw-danger);
}

#tw-panel :is(.tw-import-status, .tw-export-status):empty {
    display: none;
}

#tw-panel :is(#tw-import-picker, #tw-export-picker) footer {
    margin-top: 14px;
}

#tw-panel :is(.tw-import-count, .tw-export-count) {
    color: var(--tw-muted);
    font-size: 13px;
}

#tw-panel #tw-import-picker [data-action="confirm-import"]:not(:disabled),
#tw-panel #tw-export-picker [data-action="confirm-export"]:not(:disabled) {
    border-color: rgba(192, 132, 252, 0.5);
    background: linear-gradient(135deg, #9333ea 0%, #6366f1 100%);
    color: #fff;
}

/* 两个原生选择器随窄屏自动换行，衣柜名称使用文本节点填充，保持自定义名称可读。 */
#tw-panel .tw-export-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
    gap: 16px;
    margin: 24px 0 32px;
}

#tw-panel .tw-export-options label {
    display: grid;
    gap: 8px;
    min-width: 0;
}

#tw-panel .tw-export-options select {
    min-height: 42px;
    background: var(--tw-bg-elevated);
}

/* 标签管理与搭配编辑 */
#tw-panel #tw-group-manager,
#tw-panel #tw-combination-editor {
    width: min(520px, calc(100vw - 24px));
    max-height: calc(100dvh - 40px);
    overflow-y: auto;
}

#tw-panel #tw-combination-editor {
    width: min(640px, calc(100vw - 24px));
}

#tw-panel .tw-combination-form > h2,
#tw-panel .tw-group-form > h2 {
    margin-bottom: 14px;
    font-size: 17px;
}

#tw-panel .tw-combination-name {
    display: grid;
    gap: 6px;
    color: var(--tw-muted);
    font-size: 12px;
    font-weight: 600;
}

#tw-panel .tw-combination-items {
    display: grid;
    gap: 8px;
    max-height: 46dvh;
    margin: 14px 0;
    overflow-y: auto;
}

#tw-panel .tw-combination-item {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 56px;
    padding: 6px 10px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 12px;
    background: var(--tw-bg-card);
}

#tw-panel .tw-combination-choice {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    gap: 8px;
    cursor: pointer;
}

#tw-panel .tw-combination-item:has(:checked) {
    border-color: var(--tw-accent);
    background: var(--tw-selected);
}

#tw-panel .tw-combination-item img {
    flex: 0 0 auto;
    width: 40px;
    height: 46px;
    object-fit: contain;
    border-radius: 6px;
    background: #0f111a;
}

#tw-panel .tw-combination-item span {
    min-width: 0;
    font-size: 12.5px;
    line-height: 1.35;
    overflow-wrap: anywhere;
}

#tw-panel .tw-combination-status,
#tw-panel .tw-group-status {
    margin-top: 8px;
    color: var(--tw-ink-secondary);
    font-size: 13px;
}

#tw-panel .tw-combination-status,
#tw-panel .tw-group-status[data-error="true"] {
    color: var(--tw-danger);
}

#tw-panel .tw-combination-status:empty,
#tw-panel .tw-group-status:empty {
    display: none;
}

/* 批量操作栏独立于滚动列表，便于长列表选完后直接确认。 */
#tw-panel .tw-group-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 10px;
    margin-bottom: 8px;
    color: var(--tw-ink-secondary);
    font-size: 13px;
}

#tw-panel .tw-group-toolbar label,
#tw-panel .tw-group-check {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 38px;
    padding: 0 9px;
    cursor: pointer;
}

#tw-panel .tw-group-toolbar button {
    min-height: 38px;
    margin-inline-start: auto;
    padding: 0 10px;
    border-color: var(--tw-line-strong);
    color: var(--tw-ink-secondary);
    font-weight: 600;
}

#tw-panel .tw-group-toolbar button:not(:disabled) {
    border-color: var(--tw-danger-border);
    color: var(--tw-danger);
}

#tw-panel .tw-group-toolbar button:hover:not(:disabled) {
    background: var(--tw-danger-bg);
}

#tw-panel .tw-group-rows {
    display: grid;
    gap: 8px;
    margin: 0 0 14px;
    max-height: 56dvh;
    overflow-y: auto;
}

#tw-panel .tw-group-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

#tw-panel .tw-group-row input[type="text"] {
    flex: 1;
}

#tw-panel .tw-group-row:has(:checked) input[type="text"] {
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
}

#tw-panel :is(.tw-group-row, .tw-combination-item) button {
    flex: 0 0 36px;
    width: 36px;
    height: 36px;
    border-color: var(--tw-line-strong);
    background: var(--tw-bg-elevated);
}

#tw-panel :is(.tw-group-row, .tw-combination-item) button:hover {
    background: var(--tw-bg-hover);
}

#tw-panel [data-sort-handle] {
    cursor: grab;
}

#tw-panel [data-sort-row][data-drop-position="before"] {
    box-shadow: inset 0 2px var(--tw-accent);
}

#tw-panel [data-sort-row][data-drop-position="after"] {
    box-shadow: inset 0 -2px var(--tw-accent);
}

/* 对话框底部按钮：取消次要、保存为主 */
#tw-panel .tw-send-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
}

#tw-panel .tw-send-actions button {
    min-height: 38px;
    padding: 6px 20px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 10px;
    background: var(--tw-bg-elevated);
    color: var(--tw-ink-secondary);
    font-weight: 600;
}

#tw-panel .tw-send-actions button:hover {
    background: var(--tw-bg-hover);
    color: #fff;
}

#tw-panel .tw-send-actions button[type="submit"] {
    border-color: rgba(192, 132, 252, 0.5);
    background: linear-gradient(135deg, #9333ea 0%, #6366f1 100%);
    color: #fff;
}

#tw-panel .tw-send-actions button[type="submit"]:hover {
    filter: brightness(1.1);
}

/* 原图查看 */
#tw-panel #tw-original-image {
    width: calc(100vw - 24px);
    height: calc(100dvh - 24px);
    max-width: none;
    max-height: none;
    margin: auto;
    padding: 14px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 18px;
    background: var(--tw-bg-base);
    color: var(--tw-ink);
}

#tw-panel #tw-original-image[open] {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

#tw-panel #tw-original-image::backdrop {
    background: rgba(3, 4, 8, 0.88);
}

#tw-panel #tw-original-image header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

#tw-panel #tw-original-image h2 {
    overflow: hidden;
    font-size: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#tw-panel #tw-original-image header button {
    flex-shrink: 0;
}

#tw-panel #tw-original-image > img {
    flex: 1;
    min-height: 0;
    width: 100%;
    object-fit: contain;
}

/* 矮屏幕：压缩预览与描述框下限，让编辑区域不被底部操作栏压住 */
@media (max-height: 860px) {
    #tw-panel .tw-preview {
        height: clamp(130px, 22dvh, 220px);
    }

    #tw-panel .tw-details textarea {
        min-height: 130px;
    }
}

#tw-panel #tw-settings,
#tw-panel #tw-logs {
    inset: 0;
    width: min(1056px, calc(100% - 48px));
    height: min(768px, calc(100% - 48px));
    max-width: none;
    max-height: none;
    margin: auto;
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--tw-line-strong);
    border-radius: 18px;
    background: var(--tw-bg-surface);
    color: var(--tw-ink);
    font: inherit;
    text-align: left;
    box-shadow: 0 28px 70px -12px rgba(0, 0, 0, 0.82);
}

#tw-panel #tw-settings[open],
#tw-panel #tw-logs[open] {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
}

#tw-panel #tw-settings::backdrop,
#tw-panel #tw-logs::backdrop {
    background: rgba(4, 5, 10, 0.65);
    backdrop-filter: blur(6px);
}

#tw-panel .tw-settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 22px;
    border-bottom: 1px solid var(--tw-line);
    background: var(--tw-bg-elevated);
}

/* 复用设置弹窗的尺寸和遮罩；日志只在打开时批量刷新，避免后台请求频繁重建界面。 */
#tw-panel #tw-logs[open] { grid-template-rows: auto auto auto minmax(0, 1fr) auto; }
#tw-panel .tw-log-button { display: flex; align-items: center; gap: 5px; white-space: nowrap; }
#tw-panel .tw-log-toolbar { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 16px; }
#tw-panel .tw-log-filter { width: auto; }
#tw-panel .tw-log-search { flex: 1; min-width: 120px; }
#tw-panel .tw-log-status { margin: 0; padding: 0 16px 8px; color: var(--tw-muted); }
#tw-panel .tw-log-list { overflow: auto; padding: 0 16px; min-height: 0; }
#tw-panel .tw-log-entry { border-bottom: 1px solid var(--tw-line); padding: 10px 0; }
#tw-panel .tw-log-entry summary { cursor: pointer; overflow-wrap: anywhere; white-space: pre-wrap; }
#tw-panel .tw-log-entry[data-level="error"] summary { color: var(--tw-danger); }
#tw-panel .tw-log-entry[data-level="warn"] summary { color: #fbbf24; }
#tw-panel .tw-log-entry[data-level="api"] summary { color: var(--tw-accent); }
#tw-panel .tw-log-entry pre { margin: 8px 0 0; font: 12px/1.6 ui-monospace, monospace; white-space: pre-wrap; overflow-wrap: anywhere; }
#tw-panel .tw-log-footer { padding: 10px 16px; border-top: 1px solid var(--tw-line); color: var(--tw-muted); font-size: 12px; }

#tw-panel .tw-settings-body {
    display: grid;
    grid-template-columns: 185px minmax(0, 1fr);
    min-height: 0;
}

#tw-panel .tw-settings-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 14px 10px;
    overflow-y: auto;
    border-right: 1px solid var(--tw-line);
    background: var(--tw-bg-base);
}

#tw-panel .tw-settings-nav button {
    flex: 0 0 auto;
    justify-content: flex-start;
    min-height: 38px;
    padding: 8px 12px;
    border-radius: 9px;
    color: var(--tw-ink-secondary);
    font-size: 13px;
    font-weight: 500;
}

#tw-panel .tw-settings-nav button:hover {
    background: rgba(255, 255, 255, 0.04);
    color: #fff;
}

#tw-panel .tw-settings-nav button[aria-pressed="true"] {
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: #f3e8ff;
}

#tw-panel .tw-settings-content {
    min-width: 0;
    min-height: 0;
    padding: 24px 28px;
    overflow-y: auto;
    overscroll-behavior: contain;
}

#tw-panel .tw-settings-content h3 {
    margin-bottom: 18px;
    font-size: 17px;
    font-weight: 600;
    color: #fff;
}

#tw-panel .tw-api-form,
#tw-panel .tw-api-fields,
#tw-panel .tw-api-custom {
    display: grid;
    gap: 16px;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
}

#tw-panel .tw-api-field {
    display: grid;
    gap: 6px;
    min-width: 0;
}

#tw-panel .tw-api-field > :is(span, label):first-child {
    color: var(--tw-ink-secondary);
    font-size: 13px;
    font-weight: 500;
}

#tw-panel .tw-api-field :is(input, select) {
    width: 100%;
    min-width: 0;
    min-height: 38px;
    padding: 8px 12px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 9px;
    background: var(--tw-bg-input);
    box-shadow: none;
    color-scheme: dark;
    font-size: 13px;
}

#tw-panel .tw-api-field input::placeholder {
    color: var(--tw-muted);
    opacity: 0.75;
}

#tw-panel .tw-api-input-action {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
}

#tw-panel .tw-api-input-action input {
    flex: 1 1 0;
}

#tw-panel .tw-api-form button {
    flex: 0 0 auto;
    min-height: 38px;
    padding: 6px 14px;
    border-color: var(--tw-line-strong);
    border-radius: 9px;
    background: var(--tw-bg-elevated);
    font-size: 13px;
    font-weight: 500;
}

#tw-panel .tw-api-form button:not(:disabled):hover {
    background: var(--tw-bg-hover);
}

#tw-panel .tw-model-picker {
    display: grid;
    flex: 1 1 0;
    align-content: start;
    gap: 6px;
    min-width: 0;
}

#tw-panel .tw-model-control {
    display: flex;
    align-items: center;
    min-width: 0;
    border: 1px solid var(--tw-line-strong);
    border-radius: 9px;
    background: var(--tw-bg-input);
}

#tw-panel .tw-model-control:focus-within {
    border-color: var(--tw-selected-border);
}

#tw-panel .tw-model-control input {
    border: 0;
    background: transparent;
}

#tw-panel .tw-model-control input:focus-visible {
    outline-offset: -3px;
}

#tw-panel .tw-model-control button {
    width: 36px;
    min-height: 36px;
    padding: 6px;
    border: 0;
    background: transparent;
    color: var(--tw-muted);
}

#tw-panel .tw-model-control .tw-icon {
    width: 16px;
    height: 16px;
}

#tw-panel .tw-model-options {
    display: grid;
    gap: 3px;
    max-height: 200px;
    padding: 6px;
    overflow-y: auto;
    overscroll-behavior: contain;
    border: 1px solid var(--tw-line-strong);
    border-radius: 10px;
    background: var(--tw-bg-elevated);
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.16) transparent;
}

#tw-panel .tw-model-options button {
    justify-content: flex-start;
    width: 100%;
    min-height: 34px;
    padding: 6px 10px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    text-align: left;
    overflow-wrap: anywhere;
}

#tw-panel .tw-model-options button:is(:hover, [aria-selected="true"]) {
    background: var(--tw-selected);
    color: #f3e8ff;
}

#tw-panel .tw-model-empty {
    padding: 8px 10px;
    color: var(--tw-muted);
    font-size: 12.5px;
}

#tw-panel .tw-model-empty[data-error="true"] {
    color: var(--tw-danger);
}

#tw-panel .tw-api-parameters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr));
    gap: 14px;
}

#tw-panel .tw-api-actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 4px;
}

#tw-panel .tw-api-actions .tw-api-save,
#tw-panel .tw-send-actions button {
    min-height: 38px;
    padding: 6px 20px;
    border-color: rgba(192, 132, 252, 0.45);
    border-radius: 9px;
    background: linear-gradient(135deg, #9333ea 0%, #6366f1 100%);
    color: #fff;
    font-weight: 600;
    box-shadow: 0 4px 14px -3px rgba(147, 51, 234, 0.45);
}

#tw-panel .tw-api-actions .tw-api-save:hover,
#tw-panel .tw-send-actions button:hover {
    filter: brightness(1.08);
}

#tw-panel .tw-api-status,
#tw-panel .tw-send-status,
#tw-panel .tw-template-status {
    min-height: 22px;
    margin: 0;
    overflow-wrap: anywhere;
    color: var(--tw-accent);
    font-size: 13px;
}

#tw-panel .tw-api-status[data-error="true"],
#tw-panel .tw-send-status[data-error="true"],
#tw-panel .tw-template-status[data-error="true"] {
    color: var(--tw-danger);
}

/* 发送设置单选卡 */
#tw-panel .tw-send-form {
    display: grid;
    gap: 20px;
    min-width: 0;
}

#tw-panel .tw-send-group {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
}

#tw-panel .tw-send-group legend {
    margin: 0 0 10px;
    padding: 0;
    color: var(--tw-ink-secondary);
    font: inherit;
    font-size: 13px;
    font-weight: 500;
}

#tw-panel .tw-send-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr));
    gap: 10px;
}

#tw-panel .tw-send-choice {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 46px;
    padding: 10px 14px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 10px;
    background: var(--tw-bg-input);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.16s ease;
}

#tw-panel .tw-send-choice:hover {
    background: var(--tw-bg-elevated);
}

#tw-panel .tw-send-choice:has(input:checked) {
    border-color: var(--tw-selected-border);
    background: var(--tw-selected);
    color: #f3e8ff;
    box-shadow: 0 2px 10px -2px rgba(147, 51, 234, 0.25);
}

#tw-panel .tw-send-choice input {
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
    accent-color: var(--tw-accent-strong);
}

/* 数字输入保持紧凑，窄屏也能看清它与前后文的关系。 */
#tw-panel .tw-outfit-history {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    color: var(--tw-ink-secondary);
    font-size: 13px;
}

#tw-panel .tw-outfit-history input {
    width: 7ch;
    min-height: 36px;
    padding: 4px 8px;
    border: 1px solid var(--tw-line-strong);
    border-radius: 8px;
    background: var(--tw-bg-input);
}

#tw-panel .tw-send-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-end;
}

/* 模板编辑表单 */
#tw-panel .tw-template-form,
#tw-panel .tw-template-form label {
    display: grid;
    gap: 8px;
    min-width: 0;
}

#tw-panel .tw-template-form {
    gap: 18px;
}

#tw-panel .tw-template-form small,
#tw-panel .tw-template-hint {
    color: var(--tw-muted);
    font-size: 12px;
}

#tw-panel .tw-template-form textarea {
    width: 100%;
    min-height: 136px;
    padding: 10px 12px;
    resize: vertical;
    border: 1px solid var(--tw-line-strong);
    border-radius: 10px;
    background: var(--tw-bg-input);
    color: inherit;
    font: inherit;
    font-size: 13px;
    line-height: 1.6;
    box-shadow: none;
}

#tw-panel .tw-template-form textarea:focus {
    border-color: var(--tw-selected-border);
    box-shadow: 0 0 0 3px rgba(192, 132, 252, 0.12);
}

#tw-panel .tw-template-hint {
    margin: 0;
    padding: 8px 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    overflow-wrap: anywhere;
    line-height: 1.7;
}

/* 移动端与紧凑视口响应式布局 */
#tw-panel .tw-menu-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

#tw-panel .tw-save[data-dirty="true"]::after {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #fde68a;
    box-shadow: 0 0 0 3px rgba(253, 230, 138, 0.22);
}

/* ───────── 中等宽度：工具栏允许换行，收起次要控件 ───────── */
#tw-panel .tw-library-toolbar {
    flex-wrap: wrap;
    row-gap: 8px;
}

@media (max-width: 1240px) {
    #tw-panel .tw-body {
        grid-template-columns: 208px minmax(0, 1fr) 328px;
    }

    #tw-panel .tw-result-count,
    #tw-panel .tw-density {
        display: none;
    }
}

/* ───────── 移动端与紧凑视口：单栏 + 底部操作栏 ───────── */
@media (max-width: 900px), (max-height: 500px) and (pointer: coarse) {
    #tw-panel .tw-shell {
        grid-template-rows: auto minmax(0, 1fr) auto;
    }

    #tw-panel .tw-header {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
    }

    #tw-panel .tw-brand {
        grid-column: 1;
        grid-row: 1;
    }

    /* 窄屏只留图标，标题保留给读屏和初始焦点 */
    #tw-panel .tw-brand > div {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
    }

    #tw-panel .tw-library-switcher {
        grid-column: 2;
        grid-row: 1;
    }

    #tw-panel .tw-header-actions {
        grid-column: 3;
        grid-row: 1;
    }

    #tw-panel .tw-library-tabs {
        max-width: none;
        flex: 1 1 auto;
    }

    #tw-panel .tw-search {
        grid-column: 1 / 3;
        grid-row: 2;
        flex: none;
        max-width: none;
        margin-left: 0;
    }

    #tw-panel .tw-log-button {
        grid-column: 3;
        grid-row: 2;
        justify-content: center;
    }

    #tw-panel .tw-icon-button {
        width: 40px;
        height: 40px;
    }

    #tw-panel .tw-body {
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    #tw-panel .tw-sidebar {
        flex: 0 0 auto;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-right: 0;
        border-bottom: 1px solid var(--tw-line);
    }

    #tw-panel .tw-mobile-filter {
        position: relative;
        display: block;
        flex: 0 0 44px;
        width: 44px;
        height: 40px;
    }

    #tw-panel .tw-mobile-filter > .tw-icon {
        position: absolute;
        inset: 11px;
        z-index: 1;
        pointer-events: none;
        color: var(--tw-accent);
    }

    #tw-panel .tw-mobile-filter select {
        width: 44px;
        height: 40px;
        min-height: 40px;
        padding: 0;
        color: transparent;
        opacity: 1;
    }

    #tw-panel .tw-category-list {
        flex-direction: row;
        flex: 1 1 auto;
        gap: 6px;
        padding: 0;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
    }

    #tw-panel .tw-category-list::-webkit-scrollbar {
        display: none;
    }

    #tw-panel .tw-nav-section {
        display: contents;
    }

    #tw-panel .tw-nav-heading {
        display: none;
    }

    #tw-panel .tw-category {
        flex: 0 0 auto;
        width: auto;
        height: 36px;
        padding: 0 10px;
        border-color: var(--tw-line);
        border-radius: 999px;
        background: var(--tw-bg-elevated);
    }

    #tw-panel .tw-category > .tw-icon {
        display: none;
    }

    #tw-panel .tw-selection-scope {
        order: 99;
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        gap: 6px;
        margin: 0 0 0 4px;
        padding: 0 0 0 10px;
        border-left: 1px solid var(--tw-line);
    }

    #tw-panel .tw-selection-scope select {
        width: auto;
        min-height: 36px;
    }

    #tw-panel .tw-import-footer {
        display: none;
    }

    #tw-panel .tw-library,
    #tw-panel .tw-details {
        flex: 1 1 0;
        min-height: 0;
    }

    #tw-panel[data-mobile-screen="library"] .tw-details,
    #tw-panel[data-mobile-screen="details"] .tw-sidebar,
    #tw-panel[data-mobile-screen="details"] .tw-library {
        display: none;
    }

    #tw-panel .tw-details {
        border-left: 0;
        padding-inline: 14px;
    }

    #tw-panel .tw-detail-actions {
        margin-inline: -14px;
        padding-inline: 14px;
    }

    #tw-panel .tw-preview {
        height: clamp(180px, 34dvh, 340px);
    }

    #tw-panel .tw-group-bar {
        padding: 8px 12px;
    }

    #tw-panel .tw-group-tools button span {
        display: none;
    }

    #tw-panel .tw-group-tools button {
        width: 34px;
        padding: 0;
    }

    #tw-panel .tw-library-toolbar {
        padding: 8px 12px;
    }

    #tw-panel .tw-toolbar-start {
        flex: 1 1 100%;
        overflow-x: auto;
        scrollbar-width: none;
    }

    #tw-panel .tw-toolbar-start button {
        flex: 0 0 auto;
        height: 38px;
    }

    #tw-panel .tw-toolbar-end {
        flex: 1 1 100%;
        margin-left: 0;
    }

    #tw-panel .tw-sort {
        flex: 1 1 auto;
        width: auto;
    }

    #tw-panel .tw-sort select {
        min-height: 38px;
    }

    #tw-panel .tw-view-modes .tw-icon-button {
        width: 38px;
        height: 34px;
    }

    #tw-panel .tw-library-content {
        padding: 12px 12px 24px;
    }

    #tw-panel .tw-items {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
    }

    /* 批量栏贴底；菜单改为底部面板，避免在窄屏溢出 */
    #tw-panel .tw-bulk-actions {
        right: 8px;
        bottom: 8px;
        left: 8px;
        width: auto;
        max-width: none;
    }

    #tw-panel .tw-bulk-main {
        justify-content: flex-start;
    }

    #tw-panel .tw-bulk-sep {
        display: none;
    }

    #tw-panel .tw-bulk-main button:not(.tw-menu-item),
    #tw-panel .tw-bulk-selection {
        height: 40px;
    }

    #tw-panel .tw-bulk-main .tw-bulk-done {
        margin-left: auto;
    }

    #tw-panel .tw-menu,
    #tw-panel .tw-menu-wide {
        position: fixed;
        right: 8px;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
        left: 8px;
        width: auto;
        max-height: 62dvh;
        border-radius: 18px;
    }

    #tw-panel .tw-menu-item {
        height: 44px;
    }

    #tw-panel .tw-library[data-multi-select="true"] .tw-library-content {
        padding-bottom: 150px;
    }

    #tw-panel .tw-mobile-actions {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px));
        border-top: 1px solid var(--tw-line);
        background: var(--tw-bg-surface);
    }

    #tw-panel .tw-mobile-actions button {
        height: 44px;
        border-color: var(--tw-line-strong);
        background: var(--tw-bg-elevated);
        color: var(--tw-ink-secondary);
        font-weight: 600;
    }

    /* 详情页只保留“返回列表”，避免与详情自己的保存/导出/删除重复 */
    #tw-panel[data-mobile-screen="details"] .tw-mobile-actions {
        grid-template-columns: minmax(0, 1fr);
    }

    #tw-panel[data-mobile-screen="details"] .tw-mobile-actions > :not([data-action="toggle-details"]) {
        display: none;
    }

    #tw-panel .tw-mobile-actions .tw-mobile-import {
        border-color: rgba(192, 132, 252, 0.5);
        background: linear-gradient(135deg, #9333ea 0%, #6366f1 100%);
        color: #fff;
    }

    #tw-panel .tw-mobile-actions button[aria-expanded="true"] {
        border-color: var(--tw-selected-border);
        background: var(--tw-selected);
        color: var(--tw-accent-ink);
    }

    #tw-panel #tw-settings,
    #tw-panel #tw-logs {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
        border: 0;
        border-radius: 0;
    }

    #tw-panel .tw-settings-header {
        padding: 12px 16px;
    }

    #tw-panel .tw-settings-body {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto minmax(0, 1fr);
    }

    #tw-panel .tw-settings-nav {
        flex-direction: row;
        padding: 8px 12px;
        overflow-x: auto;
        border-right: 0;
        border-bottom: 1px solid var(--tw-line);
    }

    #tw-panel .tw-settings-content {
        padding: 18px 16px;
    }

    #tw-panel #tw-import-picker,
    #tw-panel #tw-export-picker,
    #tw-panel #tw-group-manager,
    #tw-panel #tw-combination-editor {
        padding: 16px;
    }
}

/* 触屏没有悬停：收藏心形常驻显示，选中的标签始终可删除 */
@media (hover: none) {
    #tw-panel .tw-favorite {
        opacity: 1;
    }

    #tw-panel .tw-category:not([aria-pressed="true"]):hover {
        background: transparent;
    }
}

@media (pointer: coarse) {
    #tw-menu-entry {
        min-height: 44px;
        padding: 8px 10px;
    }

    #tw-panel button,
    #tw-panel select {
        touch-action: manipulation;
    }

    #tw-panel input:is([type="checkbox"], [type="radio"]) {
        width: 20px;
        height: 20px;
    }
}

@media (prefers-reduced-motion: reduce) {
    #tw-panel *, #tw-panel *::before, #tw-panel *::after {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
    }
}

`;

// 酒馆助手使用独立 iframe 执行脚本，面板元素挂载到父级文档。
const hostDocument = window.parent.document;
const compactViewport = window.parent.matchMedia('(max-width: 900px), (max-height: 500px) and (pointer: coarse)');
let root;
let menuEntry;
let panel;
let settingsPanel;
let logsPanel;
const wardrobeLogs = [];
const logSecrets = new Set();
const logCleanup = [];
let logRenderTimer;
let logSequence = 0;
let requestSequence = 0;
// 固定容量限制长时间运行和批量图片操作的内存占用，超出后优先保留最新现场。
const LOG_LIMIT = 1000;
const LOG_TEXT_LIMIT = 12000;
const LOG_SECRET_FIELD = /^(?:key|api[_-]?key|authorization|cookie|password|token|access[_-]?token|secret)$/i;
let apiForm;
let sendForm;
let apiRequest;
let apiModels = [];
let modelListMessage = '请先获取模型，或手动输入';
let modelListError = false;
let activeModelIndex = -1;
let opener;
/** @type {Map<string, string>} 独立衣柜的大分类；第一个分区沿用旧存档，更新脚本无需搬动原数据。 */
let wardrobeLibraries = new Map([['default-1', 'SFW'], ['default-2', 'NSFW']]);
let activeLibraryId = 'default-1';
/** @type {Map<string, WardrobeItem>} 已在存档入口校验的服装表，按 ID 直接查找。 */
let garments = new Map();
/** @type {Map<string, string>} 用户创建的标签，空标识保留给未分组。 */
let garmentGroups = new Map();
/** @type {Map<string, Set<string>>} 标签所属的筛选，保留当前筛选新建的空标签；同名标签共享一个标识。 */
let garmentGroupFilters = new Map();
/** @type {Map<string, string>} 各筛选上次选中的标签，切换分类时不携带其他分类的筛选状态。 */
const selectedGroupByFilter = new Map();
let currentGroup = '*';
let multiSelectMode = false;
const checkedGarmentIds = new Set();
let visibleGarmentIds = new Set();
let selectedGarmentId = null;
let currentCategory = 'all';
let draggedSortRow;
let sortDropRow;
let garmentSearch = '';
let garmentSearchIndex;
let garmentSort = 'default';
let garmentSearchTimer;
let garmentTagSearchTimer;
let wardrobeTemplates = { user: { ...DEFAULT_TEMPLATES.user }, char: { ...DEFAULT_TEMPLATES.char }, image: { ...DEFAULT_TEMPLATES.image } };
let descriptionPrompts = { ...DEFAULT_DESCRIPTION_PROMPTS };
let sendSettings = { content_type: 'text', position: 'user_end', marker_mode: DEFAULT_MARKER_MODE, send_content_rating: true, outfit_history_count: DEFAULT_OUTFIT_HISTORY_COUNT, image_quality: 'compressed' };
let descriptionRequest;
let outfitRequest;
// 用消息对象跨事件关联同一请求，区分原生聊天与只需读取穿搭的辅助生成。
const outfitChatPrompts = new WeakMap();
let savedApiSettings = { mode: 'host' };
const subscriptions = [];
const imageReaders = new Set();
// 原图和聊天参考图各自限额，避免大批量导出挤掉常用的聊天图片。
const imageDataCache = { entries: new Map(), bytes: 0 };
const sendImageCache = { entries: new Map(), bytes: 0 };
const imageDecoders = new Set();
const wardrobeReadController = new window.parent.AbortController();
let exportUrl;
let libraryStatusTimer;
let importingGarments = false;
/**
 * 待导入的远程 JSON，只保存地址，确认后才下载备份内容。
 * @typedef {Object} WardrobeImportLink
 * @property {string} name 待选列表中的文件名。
 * @property {string} backupUrl 已校验的 HTTP 或 HTTPS 地址。
 */
/** @type {Map<string, {file: File|WardrobeImportLink, url: string, selected: boolean}>} 本地文件和远程备份共用待选列表。 */
const pendingGarmentImports = new Map();
let replacingImage = false;
let importConflictDialog;

/**
 * 将外部错误和对象转为可复制的文本，同时去除密钥、循环引用和图片原文。
 * @param {unknown} value 控制台参数、请求摘要或异常。
 * @returns {string} 已脱敏且限制长度的文本。
 */
function formatLogValue(value) {
    const seen = new WeakSet();
    let text;
    try {
        text = typeof value === 'string' ? value : JSON.stringify(value, /** 将字段名和字段值脱敏后交给序列化器；返回可记录的值。 */ function logReplacer(key, entry) {
            if (LOG_SECRET_FIELD.test(key)) return '[已隐藏密钥]';
            // 生成参数可能包含多张大图，序列化前替换，避免先复制整份 Base64 再用正则删除。
            if (typeof entry === 'string' && entry.startsWith('data:image/')) return '[已隐藏图片数据]';
            if (entry && typeof entry === 'object') {
                if (seen.has(entry)) return '[循环引用]';
                seen.add(entry);
                // 宿主和脚本来自不同窗口，按堆栈特征识别错误，避免跨窗口 instanceof 失效。
                if (typeof entry.stack === 'string') return { name: entry.name, message: entry.message, stack: entry.stack, cause: entry.cause, status: entry.status, response: entry.response };
            }
            return typeof entry === 'bigint' ? String(entry) : entry;
        }, 2);
    } catch { text = '[无法序列化的日志参数]'; }
    text = String(text ?? value);
    for (const secret of [savedApiSettings.key, apiForm?.elements.key.value, ...logSecrets]) {
        if (secret) text = text.replaceAll(secret, '[已隐藏密钥]').replaceAll(JSON.stringify(secret).slice(1, -1), '[已隐藏密钥]');
    }
    text = text.replace(/data:image\/[^;\s]+;base64,[A-Za-z0-9+/=]+/gi, '[已隐藏图片数据]')
        .replace(/\bBearer\s+[^\s"',}]+/gi, 'Bearer [已隐藏密钥]')
        .replace(/([?&](?:api[_-]?key|key|token|access_token)=)[^&#\s"']+/gi, '$1[已隐藏密钥]');
    return text.length > LOG_TEXT_LIMIT ? `${text.slice(0, LOG_TEXT_LIMIT)}\n[内容过长，已截断]` : text;
}

/**
 * 将时间戳转为带 +08:00 时区的北京时间，供显示、复制和导出共用。
 * @param {number} [timestamp] 毫秒时间戳，默认使用当前时间。
 * @returns {string} 保留毫秒和时区偏移的时间文本。
 */
function formatBeijingLogTime(timestamp = Date.now()) {
    // 明确使用 UTC+8，不依赖用户设备的本地时区；日期换日交给 Date 处理。
    return new Date(timestamp + 8 * 60 * 60 * 1000).toISOString().replace('Z', '+08:00');
}

/**
 * 保存带北京时间和顺序的日志；关闭窗口仍采集，打开时合并刷新以控制批量操作成本。
 * @param {string} level 日志级别。
 * @param {string} message 操作或错误来源。
 * @param {...unknown} details 需要保留的异常或参数。
 * @returns {void} 无返回值。
 */
function recordWardrobeLog(level, message, ...details) {
    wardrobeLogs.push({ id: ++logSequence, time: formatBeijingLogTime(), level, message: formatLogValue(message), details: formatLogValue(details) });
    if (wardrobeLogs.length > LOG_LIMIT) wardrobeLogs.shift();
    if (logsPanel?.open && !logRenderTimer) logRenderTimer = window.parent.setTimeout(renderWardrobeLogs, 150);
}

/**
 * 只采集衣柜脚本窗口的输出和异常，以及挂载在酒馆页面中的衣柜资源失败；卸载时注销。
 * @returns {void} 无返回值。
 */
function installWardrobeLogging() {
    for (const level of ['log', 'debug', 'info', 'warn', 'error']) {
        const original = window.console[level];
        /** 转发脚本控制台调用并保留原参数；返回原始控制台结果。 */
        function loggedConsole(...args) {
            // 普通输出归入正常运行信息，只有显式 console.debug 才作为调试输出。
            recordWardrobeLog(level === 'log' ? 'info' : level, `衣柜脚本 console.${level}`, ...args);
            return original.apply(this, args);
        }
        window.console[level] = loggedConsole;
        /** 只撤销本次包装，避免覆盖运行期间接管的控制台；无参数和返回值。 */
        logCleanup.push(() => { if (window.console[level] === loggedConsole) window.console[level] = original; });
    }
    /** 接收脚本异常或衣柜资源失败，记录来源地址与行列；不阻止浏览器原有处理，无返回值。 */
    function logWindowError(event) {
        const resource = event.target;
        recordWardrobeLog('error', `衣柜脚本：${event.message || '资源加载失败'}`, event.error, {
            source: event.filename || resource?.currentSrc || resource?.src || resource?.href,
            line: event.lineno, column: event.colno,
        });
    }
    /** 接收脚本窗口内未处理的 Promise 拒绝并保留原始原因；无返回值。 */
    function logUnhandledRejection(event) { recordWardrobeLog('error', '衣柜脚本：未处理的 Promise 异常', event.reason); }
    /** 只接收衣柜根节点内的资源错误；忽略酒馆和其他脚本的全局异常，无返回值。 */
    function logWardrobeResourceError(event) {
        // 衣柜图片挂载在父文档，不能停掉父窗口监听；按实际节点归属过滤，避免无关资源刷屏。
        if (root?.contains(event.target)) logWindowError(event);
    }
    window.addEventListener('error', logWindowError, true);
    window.addEventListener('unhandledrejection', logUnhandledRejection);
    window.parent.addEventListener('error', logWardrobeResourceError, true);
    /** 清理跨窗口监听，防止重新启用脚本后重复采集；无参数和返回值。 */
    logCleanup.push(() => {
        window.removeEventListener('error', logWindowError, true);
        window.removeEventListener('unhandledrejection', logUnhandledRejection);
        window.parent.removeEventListener('error', logWardrobeResourceError, true);
    });
    // 即使初始化中途失败，也要在 iframe 卸载时注销已安装的日志监听。
    window.addEventListener('pagehide', stopWardrobeLogging, { once: true });
    recordWardrobeLog('info', '日志采集已启动', { userAgent: window.navigator.userAgent, viewport: `${window.parent.innerWidth}×${window.parent.innerHeight}` });
}

/**
 * 恢复被包装的控制台并移除异常监听和刷新任务。
 * @returns {void} 无返回值。
 */
function stopWardrobeLogging() {
    window.parent.clearTimeout(logRenderTimer);
    logRenderTimer = undefined;
    for (const cleanup of logCleanup.splice(0)) cleanup();
    window.removeEventListener('pagehide', stopWardrobeLogging);
}

/**
 * 记录本插件发起的请求及成功、失败结果，不改宿主全局请求函数或消费原响应体。
 * @param {string} kind 请求类型。
 * @param {Object} config 请求参数；图片和密钥在序列化入口隐藏。
 * @param {Function} execute 实际宿主请求，返回原始响应。
 * @returns {Promise<unknown>} 原始响应；失败时继续抛出原异常。
 */
async function traceWardrobeRequest(kind, config, execute) {
    const secret = config.custom_api?.key ?? config.key;
    if (secret) logSecrets.add(secret);
    const id = ++requestSequence;
    const started = Date.now();
    recordWardrobeLog('api', `请求 #${id} ${kind} 开始`, config);
    try {
        const result = await execute();
        const http = typeof result?.status === 'number' && typeof result.clone === 'function';
        recordWardrobeLog('api', `请求 #${id} ${kind} ${http && !result.ok ? 'HTTP 失败' : '完成'}（${Date.now() - started} ms）`,
            http ? { status: result.status, statusText: result.statusText, url: result.url } : result);
        if (http && !result.ok) {
            // 仅读取失败响应的副本，图片下载成功时不复制大体积响应，也不改变调用方读取流程。
            try { recordWardrobeLog('error', `请求 #${id} HTTP ${result.status}`, await result.clone().text()); }
            catch (error) { recordWardrobeLog('warn', `请求 #${id} 无法读取错误响应`, error); }
        }
        return result;
    } catch (error) {
        recordWardrobeLog('error', `请求 #${id} ${kind} 失败（${Date.now() - started} ms）`, error);
        throw error;
    }
}

/**
 * 经统一日志入口调用酒馆助手生成，保留参数摘要和原始回复以定位解析失败。
 * @param {Object} config 原始生成参数。
 * @returns {Promise<string>} 酒馆助手原始回复。
 */
function loggedGenerateRaw(config) {
    return traceWardrobeRequest('generateRaw', config, () => generateRaw(config));
}

/**
 * 经统一日志入口获取模型列表。
 * @param {Object} config 模型列表连接配置。
 * @returns {Promise<string[]>} 原始模型列表。
 */
function loggedGetModelList(config) {
    return traceWardrobeRequest('getModelList', config, () => getModelList(config));
}

/**
 * 记录衣柜 HTTP 请求的地址、方法、状态及耗时，省略包含聊天、图片或密钥的请求参数。
 * @param {string} url 图片或接口地址。
 * @param {RequestInit} [options] 原始请求参数。
 * @returns {Promise<Response>} 未消费的原始响应。
 */
function wardrobeFetch(url, options) {
    return traceWardrobeRequest('fetch', { url, method: options?.method ?? 'GET' }, () => window.parent.fetch(url, options));
}

/**
 * 打开与设置相同层级的原生模态窗口，保留衣柜浏览现场。
 * @returns {void} 无返回值。
 */
function openWardrobeLogs() {
    if (!logsPanel.open) logsPanel.showModal();
    renderWardrobeLogs();
}

/**
 * 合并搜索输入引起的列表重绘，避免逐键扫描和重建最多一千条记录。
 * @returns {void} 无返回值。
 */
function scheduleLogSearch() {
    window.parent.clearTimeout(logRenderTimer);
    logRenderTimer = window.parent.setTimeout(renderWardrobeLogs, 150);
}

/**
 * 初始化失败时打开已有界面和日志，避免再次读取损坏配置而失去排错入口。
 * @returns {void} 无返回值。
 */
function openFailedWardrobe() {
    opener = hostDocument.activeElement;
    if (!panel.open) panel.showModal();
    openWardrobeLogs();
}

/**
 * 根据级别与关键词批量绘制北京时间日志；仅当用户原本在底部时跟随新记录，保留向上查阅位置。
 * @returns {void} 无返回值。
 */
function renderWardrobeLogs() {
    window.parent.clearTimeout(logRenderTimer);
    logRenderTimer = undefined;
    const list = logsPanel.querySelector('.tw-log-list');
    const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 40;
    const scrollTop = list.scrollTop;
    const expanded = new Set(Array.from(list.querySelectorAll('details[open]'), node => Number(node.dataset.id)));
    const level = logsPanel.querySelector('.tw-log-filter').value;
    const query = logsPanel.querySelector('.tw-log-search').value.trim().toLocaleLowerCase();
    const fragment = hostDocument.createDocumentFragment();
    let count = 0;
    for (const entry of wardrobeLogs) {
        if (level !== 'all' && entry.level !== level) continue;
        if (query && !`${entry.message}\n${entry.details}`.toLocaleLowerCase().includes(query)) continue;
        const row = hostDocument.createElement('details');
        row.className = 'tw-log-entry';
        row.dataset.level = entry.level;
        row.dataset.id = entry.id;
        row.open = expanded.has(entry.id);
        const summary = hostDocument.createElement('summary');
        summary.textContent = `${entry.time.slice(11, 23)} 北京时间  ${entry.level.toUpperCase()}  ${entry.message}`;
        const detail = hostDocument.createElement('pre');
        detail.textContent = entry.details;
        row.append(summary, detail);
        fragment.append(row);
        count++;
    }
    list.replaceChildren(fragment);
    logsPanel.querySelector('.tw-log-status').textContent = `显示 ${count} / ${wardrobeLogs.length} 条`;
    if (!count) list.textContent = wardrobeLogs.length ? '没有匹配的日志' : '暂无日志';
    list.scrollTop = atBottom ? list.scrollHeight : scrollTop;
}

/**
 * 处理关闭、清空、复制和导出；复制与导出使用北京时间并包含全部保留记录，便于完整复现问题。
 * @param {MouseEvent} event 日志窗口内的按钮点击。
 * @returns {Promise<void>} 操作结束后完成。
 */
async function handleWardrobeLogs(event) {
    const action = event.target.closest('[data-log-action]')?.dataset.logAction;
    if (!action) return;
    if (action === 'close') { logsPanel.close(); return; }
    if (action === 'clear') { wardrobeLogs.length = 0; renderWardrobeLogs(); return; }
    const status = logsPanel.querySelector('.tw-log-status');
    try {
        if (action === 'export') {
            downloadWardrobeJson({ exportedAt: formatBeijingLogTime(), timeZone: 'Asia/Shanghai', userAgent: window.navigator.userAgent, logs: wardrobeLogs }, '衣柜日志.json');
            status.textContent = '已导出全部日志';
        } else if (action === 'copy') {
            await window.parent.navigator.clipboard.writeText(wardrobeLogs.map(entry => `[${entry.time}] ${entry.level.toUpperCase()} ${entry.message}\n${entry.details}`).join('\n\n'));
            status.textContent = '已复制全部日志';
        }
    } catch (error) {
        recordWardrobeLog('error', '复制或导出日志失败', error);
        renderWardrobeLogs();
        status.textContent = `操作失败：${formatLogValue(error.message ?? error)}；可尝试导出或手动选择日志文字复制。`;
    }
}

/* ───────── 界面辅助：批量弹出菜单、确认与输入弹窗、卡片大小 ───────── */
const BULK_ENGINES = { apply: '.tw-bulk-apply', category: '.tw-bulk-category', favorite: '.tw-bulk-favorite' };
let openBulkMenuName = '';
let askSession;

/**
 * 读取当前勾选的服装记录；已被删除的记录自动忽略。
 * @returns {object[]} 勾选的服装。
 */
function getCheckedGarments() {
    return Array.from(checkedGarmentIds, id => garments.get(id)).filter(Boolean);
}

/**
 * 把“有几件具备某属性”转为三态：全部具备、部分具备或都不具备。
 * @param {number} count 具备属性的件数。
 * @param {number} total 勾选总数。
 * @returns {string} aria-checked 使用的 true、mixed 或 false。
 */
function getTriState(count, total) {
    return total > 0 && count === total ? 'true' : count > 0 ? 'mixed' : 'false';
}

/**
 * 关闭所有批量弹出菜单；键盘关闭时把焦点还给触发按钮。
 * @param {boolean} restoreFocusToTrigger 是否恢复焦点。
 * @returns {void} 无返回值。
 */
function closeBulkMenus(restoreFocusToTrigger = false) {
    if (!panel) return;
    const name = openBulkMenuName;
    openBulkMenuName = '';
    for (const trigger of panel.querySelectorAll('[data-bulk-menu]')) trigger.setAttribute('aria-expanded', 'false');
    for (const menu of panel.querySelectorAll('.tw-menu')) menu.hidden = true;
    if (restoreFocusToTrigger && name) panel.querySelector(`[data-bulk-menu="${name}"]`)?.focus();
}

/**
 * 创建一个可点选的菜单项，三态由 aria-checked 表达，样式完全由衣柜自己绘制。
 * @param {{role: string, state: string, label: string, engine: string, value: string}} options 菜单项参数。
 * @returns {HTMLButtonElement} 菜单项按钮。
 */
function createMenuItem({ role, state, label, engine, value }) {
    const button = hostDocument.createElement('button');
    button.type = 'button';
    button.className = 'tw-menu-item';
    button.setAttribute('role', role);
    button.setAttribute('aria-checked', state);
    button.dataset.engine = engine;
    button.dataset.value = value;
    button.dataset.filterText = label.toLocaleLowerCase();
    button.innerHTML = `<span class="tw-menu-mark">${icon('check', 'tw-icon-check')}${icon('minus', 'tw-icon-minus')}</span>`;
    const text = hostDocument.createElement('span');
    text.textContent = label;
    button.append(text);
    return button;
}

/**
 * 按标签搜索框过滤批量标签菜单；数量很多时只切换可见性，不重建节点。
 * @param {HTMLElement} menu 标签菜单。
 * @returns {void} 无返回值。
 */
function filterBulkTagMenu(menu) {
    const input = menu.querySelector('.tw-menu-search input');
    const query = (input?.value ?? '').trim().toLocaleLowerCase();
    let visible = 0;
    for (const item of menu.querySelectorAll('.tw-menu-item[data-engine="tags"][data-value^="add:"], .tw-menu-item[data-engine="tags"][data-value^="remove:"]')) {
        item.hidden = Boolean(query) && !item.dataset.filterText.includes(query);
        if (!item.hidden) visible += 1;
    }
    const empty = menu.querySelector('.tw-menu-empty');
    if (empty) empty.hidden = visible !== 0;
}

/**
 * 根据勾选状态重建批量菜单：角色与标签为三态勾选，分类为单选，移动只列出其他衣柜。
 * 原有操作继续触发隐藏选择器，跨衣柜移动交由独立入口一次提交两个分区。
 * @param {string} name apply、library、tags 或 category。
 * @returns {void} 无返回值。
 */
function renderBulkMenu(name) {
    const menu = panel.querySelector(`[data-menu="${name}"]`);
    if (!menu) return;
    const items = getCheckedGarments();
    const total = items.length;
    const focusedValue = menu.contains(hostDocument.activeElement) ? hostDocument.activeElement.dataset?.value : undefined;
    const entries = [];
    if (name === 'apply') {
        const selections = readWearerSelections();
        for (const wearer of WEARERS) {
            const count = items.filter(item => selections[wearer].has(item.id)).length;
            const state = getTriState(count, total);
            entries.push(createMenuItem({ role: 'menuitemcheckbox', state, label: wearer === 'user' ? 'USER' : 'Char',
                engine: 'apply', value: `${state === 'true' ? 'unapply' : 'apply'}-${wearer}` }));
        }
        menu.replaceChildren(...entries);
        const title = hostDocument.createElement('p');
        title.className = 'tw-menu-title';
        title.textContent = '穿着归属';
        menu.prepend(title);
    } else if (name === 'library') {
        for (const [id, label] of wardrobeLibraries) {
            if (id === activeLibraryId) continue;
            const entry = createMenuItem({ role: 'menuitem', state: 'false', label, engine: 'library', value: id });
            entry.removeAttribute('aria-checked');
            entry.querySelector('.tw-menu-mark').hidden = true;
            entries.push(entry);
        }
        menu.replaceChildren(...entries);
    } else if (name === 'category') {
        const categories = new Set(items.map(item => item.category));
        const current = categories.size === 1 ? categories.values().next().value : '';
        for (const [id, label] of CATEGORIES.slice(1)) {
            entries.push(createMenuItem({ role: 'menuitemradio', state: String(id === current), label, engine: 'category', value: id }));
        }
        menu.replaceChildren(...entries);
    } else if (name === 'tags') {
        const groups = getFilterGarmentGroups();
        if (!menu.querySelector('.tw-menu-list')) {
            const search = hostDocument.createElement('div');
            search.className = 'tw-menu-search';
            const input = hostDocument.createElement('input');
            input.type = 'search';
            input.placeholder = '搜索标签…';
            input.setAttribute('aria-label', '搜索标签');
            input.autocomplete = 'off';
            input.addEventListener('input', () => filterBulkTagMenu(menu));
            input.addEventListener('keydown', event => {
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    menu.querySelector('.tw-menu-item:not([hidden])')?.focus();
                }
            });
            search.append(input);
            const list = hostDocument.createElement('div');
            list.className = 'tw-menu-list';
            menu.replaceChildren(search, list);
        }
        const search = menu.querySelector('.tw-menu-search');
        search.hidden = groups.size <= 6;
        for (const [id, label] of groups) {
            const count = items.filter(item => item.groupIds.includes(id)).length;
            const state = getTriState(count, total);
            const entry = createMenuItem({ role: 'menuitemcheckbox', state, label, engine: 'tags', value: `${state === 'true' ? 'remove' : 'add'}:${id}` });
            entries.push(entry);
        }
        const empty = hostDocument.createElement('p');
        empty.className = 'tw-menu-empty';
        empty.textContent = groups.size ? '没有匹配的标签' : '当前筛选下还没有标签，可在上方“＋ 标签”新增。';
        empty.hidden = groups.size !== 0 ? true : false;
        const clear = createMenuItem({ role: 'menuitem', state: 'false', label: '清空所选服装的全部标签', engine: 'tags', value: '' });
        clear.dataset.tone = 'danger';
        clear.querySelector('.tw-menu-mark').hidden = true;
        const divider = hostDocument.createElement('div');
        divider.className = 'tw-menu-divider';
        menu.querySelector('.tw-menu-list').replaceChildren(...entries, empty, divider, clear);
        filterBulkTagMenu(menu);
    }
    // 点击后菜单会按新状态重建；恢复焦点，键盘连续操作不会丢失位置。
    if (focusedValue !== undefined) {
        const next = Array.from(menu.querySelectorAll('.tw-menu-item')).find(item => item.dataset.engine && item.dataset.value.replace(/^(un)?apply-|^(add|remove):/, '') === focusedValue.replace(/^(un)?apply-|^(add|remove):/, ''));
        next?.focus();
    }
}

/**
 * 通过原有的隐藏选择器执行批量操作。
 * @param {string} engineName apply、category 或 favorite。
 * @param {string} value 选择器取值。
 * @returns {void} 无返回值。
 */
function runBulkEngine(engineName, value) {
    const engine = panel.querySelector(BULK_ENGINES[engineName]);
    engine.value = value;
    engine.dispatchEvent(new Event('change'));
}

/**
 * 批量栏上的点击入口：打开/关闭菜单、执行菜单项或切换收藏。
 * @param {MouseEvent} event 点击事件。
 * @returns {Promise<void>} 移走当前服装时等待草稿确认。
 */
async function handleBulkMenu(event) {
    const trigger = event.target.closest('[data-bulk-menu]');
    if (trigger) {
        if (trigger.disabled) return;
        const name = trigger.dataset.bulkMenu;
        if (openBulkMenuName === name) {
            closeBulkMenus();
            return;
        }
        closeBulkMenus();
        openBulkMenuName = name;
        trigger.setAttribute('aria-expanded', 'true');
        renderBulkMenu(name);
        const menu = panel.querySelector(`[data-menu="${name}"]`);
        menu.hidden = false;
        menu.querySelector('.tw-menu-item')?.focus();
        return;
    }
    const item = event.target.closest('.tw-menu-item');
    if (item) {
        if (item.dataset.engine === 'library') {
            closeBulkMenus(true);
            try {
                const targetId = item.dataset.value;
                const ids = getGarmentMoveIds(targetId);
                if (ids.has(selectedGarmentId) && hasDetailsDraft() && !await confirmDiscardDetails()) return;
                moveGarmentsToLibrary(targetId, ids);
            }
            catch (error) { recordWardrobeLog('error', 'handleBulkMenu：捕获异常', error); setLibraryStatus(String(error), true); }
            return;
        }
        if (item.dataset.engine === 'tags') {
            moveCheckedGarments(item.dataset.value);
            return;
        }
        runBulkEngine(item.dataset.engine, item.dataset.value);
        // 修改分类是一次性选择；角色和标签可连续勾选，菜单保持打开。
        if (item.dataset.engine === 'category') closeBulkMenus(true);
        return;
    }
    if (event.target.closest('[data-bulk-favorite]')) {
        const items = getCheckedGarments();
        if (items.length) runBulkEngine('favorite', items.every(entry => entry.favorite) ? 'unfavorite' : 'favorite');
    }
}

/**
 * 菜单内的键盘操作：上下键移动，Escape 只关闭菜单而不关闭整个衣柜。
 * @param {KeyboardEvent} event 键盘事件。
 * @returns {void} 无返回值。
 */
function handleBulkMenuKeys(event) {
    if (!openBulkMenuName) return;
    if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeBulkMenus(true);
        return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const menu = panel.querySelector(`[data-menu="${openBulkMenuName}"]`);
    if (!menu?.contains(event.target)) return;
    const items = Array.from(menu.querySelectorAll('.tw-menu-item:not([hidden])'));
    if (!items.length) return;
    event.preventDefault();
    const index = items.indexOf(hostDocument.activeElement);
    const step = event.key === 'ArrowDown' ? 1 : -1;
    items[(index + step + items.length) % items.length].focus();
}

/**
 * 点击菜单以外的位置时收起批量菜单。
 * @param {MouseEvent} event 点击事件。
 * @returns {void} 无返回值。
 */
function dismissBulkMenus(event) {
    // 菜单项点击后菜单会重建，事件目标可能已脱离文档；用点击发生时的事件路径判断才可靠。
    if (openBulkMenuName && !event.composedPath().some(node => node.classList?.contains('tw-menu-wrap'))) closeBulkMenus();
}

/**
 * 同步批量栏的菜单、收藏按钮状态；没有勾选或退出多选时收起菜单。
 * @returns {void} 无返回值。
 */
function renderBulkExtras() {
    const items = getCheckedGarments();
    const favorite = panel.querySelector('[data-bulk-favorite]');
    const allFavorite = items.length > 0 && items.every(item => item.favorite);
    favorite.setAttribute('aria-pressed', String(allFavorite));
    favorite.querySelector('span').textContent = allFavorite ? '取消收藏' : '收藏';
    for (const control of panel.querySelectorAll('[data-bulk-menu], [data-bulk-favorite]')) control.disabled = items.length === 0;
    if (!multiSelectMode || items.length === 0) closeBulkMenus();
    else if (openBulkMenuName) renderBulkMenu(openBulkMenuName);
}

/**
 * 调整卡片最小宽度，页面上图片很多时可以一屏看更多。
 * @param {Event} event 滑块输入事件。
 * @returns {void} 无返回值。
 */
function resizeGarmentCards(event) {
    panel.style.setProperty('--tw-card-min', `${event.currentTarget.value}px`);
}

/**
 * 更新按钮文字；按钮含图标时只改文字节点，保留图标。
 * @param {HTMLElement} button 目标按钮。
 * @param {string} text 新文字。
 * @returns {void} 无返回值。
 */
function setButtonLabel(button, text) {
    (button.querySelector('span') ?? button).textContent = text;
}

/**
 * 标记详情表单有尚未保存的修改，保存按钮旁出现提示点。
 * @param {boolean} dirty 是否有未保存修改。
 * @returns {void} 无返回值。
 */
function setDetailsDirty(dirty) {
    const save = panel.querySelector('[data-action="save-garment"]');
    save.dataset.dirty = String(dirty);
    save.title = dirty ? '有尚未保存的修改' : '';
}

/**
 * 读取保存按钮上与提示点共用的草稿状态。
 * @returns {boolean} 是否有未保存的详情修改。
 */
function hasDetailsDraft() {
    return panel.querySelector('[data-action="save-garment"]').dataset.dirty === 'true';
}

/**
 * 在即将重填详情前确认放弃草稿；由调用方在操作成功后重填，失败时仍可编辑。
 * @returns {Promise<boolean>} 是否确认放弃。
 */
function confirmDiscardDetails() {
    return askConfirm('放弃未保存的修改？', '当前服装的详情修改尚未保存。', { confirmText: '放弃修改', cancelText: '继续编辑', danger: true });
}

/**
 * 只有名称、分类、分级和描述需要点击保存；标签和穿着是即时保存的，不计入。
 * @param {Event} event 详情表单的输入或变更事件。
 * @returns {void} 无返回值。
 */
function markDetailsDirty(event) {
    if (['garment_name', 'garment_category', 'garment_content_rating', 'garment_description'].includes(event.target.name)) setDetailsDirty(true);
}

/**
 * 打开自带的确认/输入弹窗，替代浏览器原生 confirm 与 prompt。
 * 传入 input 时为输入框，取消返回 null；否则为确认框，返回 true 或 false。
 * @param {{title: string, message?: string, input?: string, confirmText?: string, cancelText?: string, danger?: boolean}} options 弹窗内容。
 * @returns {Promise<string|boolean|null>} 用户的选择。
 */
function askDialog({ title, message = '', input, confirmText = '确定', cancelText = '取消', danger = false }) {
    const dialog = panel.querySelector('#tw-ask');
    const withInput = input !== undefined;
    // 弹窗是模态的，正常不会重入；若被程序重入则按取消处理，避免互相覆盖。
    if (dialog.open) return Promise.resolve(withInput ? null : false);
    dialog.dataset.danger = String(danger);
    dialog.querySelector('#tw-ask-title').textContent = title;
    dialog.querySelector('.tw-ask-message').textContent = message;
    const field = dialog.querySelector('.tw-ask-input');
    field.hidden = !withInput;
    field.value = withInput ? input : '';
    field.setAttribute('aria-label', title);
    const ok = dialog.querySelector('.tw-ask-ok');
    const cancel = dialog.querySelector('.tw-ask-cancel');
    ok.textContent = confirmText;
    cancel.textContent = cancelText;
    dialog.returnValue = '';
    return new Promise(resolve => {
        askSession = { resolve, withInput };
        dialog.showModal();
        // 破坏性操作默认聚焦“取消”，避免按住回车误删。
        if (withInput) { field.focus(); field.select(); } else (danger ? cancel : ok).focus();
    });
}

/**
 * 确认类弹窗的简写。
 * @param {string} title 标题。
 * @param {string} message 说明。
 * @param {{confirmText?: string, cancelText?: string, danger?: boolean}} options 按钮文案与是否为危险操作。
 * @returns {Promise<boolean>} 用户是否确认。
 */
function askConfirm(title, message, options = {}) {
    return askDialog({ title, message, ...options });
}

/**
 * 弹窗关闭（点击按钮、回车或 Escape）后交回用户的选择。
 * @returns {void} 无返回值。
 */
function finishAskDialog() {
    if (!askSession) return;
    const { resolve, withInput } = askSession;
    askSession = undefined;
    const dialog = panel.querySelector('#tw-ask');
    const accepted = dialog.returnValue === 'ok';
    resolve(withInput ? (accepted ? dialog.querySelector('.tw-ask-input').value : null) : accepted);
}

/**
 * 创建衣柜并加载服装与配置；只注册请求注入监听，不主动发送生成请求。
 * @returns {void} 无返回值。
 */
function initializeWardrobe() {
    const menu = hostDocument.querySelector('#extensionsMenu');
    if (!menu) throw new Error('衣柜插件：找不到酒馆扩展菜单，请在酒馆助手脚本库中运行。');
    root = hostDocument.createElement('div');
    root.id = 'tw-script-root';
    root.innerHTML = `<style>${PANEL_CSS}</style>${PANEL_HTML}`;
    hostDocument.body.append(root);
    panel = root.querySelector('#tw-panel');
    settingsPanel = panel.querySelector('#tw-settings');
    logsPanel = panel.querySelector('#tw-logs');
    panel.querySelector('[data-action="open-logs"]').addEventListener('click', openWardrobeLogs);
    logsPanel.addEventListener('click', handleWardrobeLogs);
    logsPanel.querySelector('.tw-log-filter').addEventListener('change', renderWardrobeLogs);
    logsPanel.querySelector('.tw-log-search').addEventListener('input', scheduleLogSearch);
    apiForm = settingsPanel.querySelector('.tw-api-form');
    sendForm = settingsPanel.querySelector('.tw-send-form');

    menuEntry = hostDocument.createElement('button');
    menuEntry.id = 'tw-menu-entry';
    menuEntry.type = 'button';
    menuEntry.className = 'list-group-item flex-container flexGap5';
    menuEntry.innerHTML = '<i class="fa-solid fa-shirt" aria-hidden="true"></i><span>衣柜插件</span>';
    // 追加入口以保持酒馆已有菜单的顺序。
    menu.append(menuEntry);
    menuEntry.addEventListener('click', openWardrobe);
    panel.querySelector('[data-action="close"]').addEventListener('click', closeWardrobe);
    panel.addEventListener('cancel', closeWardrobe);
    panel.querySelector('.tw-library-tabs').addEventListener('click', selectWardrobeLibrary);
    panel.querySelector('[data-action="add-library"]').addEventListener('click', addWardrobeLibrary);
    panel.querySelector('[data-action="delete-library"]').addEventListener('click', deleteWardrobeLibrary);
    panel.querySelector('[data-action="open-settings"]').addEventListener('click', openSettings);
    settingsPanel.querySelector('[data-action="close-settings"]').addEventListener('click', closeSettings);
    settingsPanel.querySelector('.tw-settings-nav').addEventListener('click', selectSettingsPage);
    settingsPanel.querySelector('[data-action="export-data"]').addEventListener('click', handleWardrobeData);
    settingsPanel.querySelector('[data-action="import-data"]').addEventListener('click', handleWardrobeData);
    settingsPanel.querySelector('.tw-data-import').addEventListener('change', handleWardrobeData);
    apiForm.addEventListener('submit', saveApiSettings);
    sendForm.addEventListener('submit', saveSendSettings);
    sendForm.addEventListener('change', clearSendStatus);
    for (const form of settingsPanel.querySelectorAll('.tw-template-form[data-template-owner]')) {
        form.addEventListener('submit', saveWardrobeTemplate);
        form.addEventListener('input', clearTemplateStatus);
    }
    const descriptionForm = settingsPanel.querySelector('.tw-description-form');
    descriptionForm.addEventListener('submit', saveDescriptionPrompts);
    descriptionForm.addEventListener('input', clearTemplateStatus);
    apiForm.elements.mode.addEventListener('change', updateApiMode);
    apiForm.elements.apiurl.addEventListener('input', clearApiUrlValidity);
    apiForm.elements.model.addEventListener('focus', openModelOptions);
    apiForm.elements.model.addEventListener('input', openModelOptions);
    settingsPanel.addEventListener('keydown', navigateModelOptions);
    apiForm.querySelector('[data-action="toggle-models"]').addEventListener('click', toggleModelOptions);
    apiForm.querySelector('#tw-api-models').addEventListener('click', selectModelOption);
    apiForm.querySelector('.tw-model-picker').addEventListener('focusout', leaveModelOptions);
    settingsPanel.addEventListener('click', dismissModelOptions);
    apiForm.querySelector('[data-action="toggle-api-key"]').addEventListener('click', toggleApiKey);
    apiForm.querySelector('[data-api-action="models"]').addEventListener('click', requestApi);
    apiForm.querySelector('[data-api-action="test"]').addEventListener('click', requestApi);
    settingsPanel.addEventListener('close', stopApiRequest);
    for (const button of panel.querySelectorAll('[data-action="import"]')) button.addEventListener('click', openImageImport);
    panel.querySelector('.tw-image-import').addEventListener('change', importGarments);
    panel.querySelector('.tw-folder-import').addEventListener('change', importGarments);
    panel.querySelector('[data-action="add-import-files"]').addEventListener('click', chooseImportFiles);
    panel.querySelector('[data-action="add-import-folder"]').addEventListener('click', chooseImportFiles);
    panel.querySelector('[data-action="add-import-link"]').addEventListener('click', addImportLink);
    panel.querySelector('[data-action="cancel-import"]').addEventListener('click', closeImageImport);
    panel.querySelector('[data-action="confirm-import"]').addEventListener('click', confirmImageImport);
    panel.querySelector('.tw-import-grid').addEventListener('change', selectPendingImports);
    for (const button of panel.querySelectorAll('[data-import-selection]')) button.addEventListener('click', selectPendingImports);
    panel.querySelector('#tw-import-picker').addEventListener('close', clearPendingImports);
    panel.querySelector('#tw-import-picker').addEventListener('cancel', preventImportCancellation);
    panel.querySelector('[data-action="cancel-export"]').addEventListener('click', closeWardrobeExport);
    panel.querySelector('.tw-export-form').addEventListener('change', updateWardrobeExport);
    panel.querySelector('.tw-export-form').addEventListener('submit', confirmWardrobeExport);
    panel.querySelector('[data-action="replace-image"]').addEventListener('click', openImageReplacement);
    panel.querySelector('[data-action="replace-front-image"]').addEventListener('click', openImageReplacement);
    panel.querySelector('.tw-image-replace').addEventListener('change', replaceGarmentImage);
    panel.querySelector('.tw-preview').addEventListener('click', openGarmentImage);
    panel.querySelector('[data-action="close-original-image"]').addEventListener('click', closeGarmentImage);
    panel.querySelector('#tw-original-image').addEventListener('close', closeGarmentImage);
    panel.addEventListener('dragover', handleGarmentTransfer);
    panel.addEventListener('drop', handleGarmentTransfer);
    panel.addEventListener('paste', handleGarmentTransfer);
    panel.querySelector('.tw-selection-scope select').addEventListener('change', selectSelectionScope);
    panel.querySelector('.tw-items').addEventListener('click', selectGarment);
    panel.querySelector('.tw-items').addEventListener('change', checkGarment);
    panel.querySelector('.tw-select-all').addEventListener('change', selectAllGarments);
    panel.querySelector('.tw-bulk-actions').addEventListener('click', handleBulkAction);
    // 新建搭配直接打开成员选择弹窗，不受多选模式及批量操作的勾选门槛限制。
    panel.querySelector('[data-action="create-combination"]').addEventListener('click', openCombinationEditor);
    panel.querySelector('[data-action="edit-combination"]').addEventListener('click', openCombinationEditor);
    panel.querySelector('[data-action="cancel-combination"]').addEventListener('click', closeCombinationEditor);
    panel.querySelector('.tw-combination-form').addEventListener('submit', saveCombination);
    panel.querySelector('.tw-bulk-apply').addEventListener('change', handleBulkAction);
    panel.querySelector('.tw-bulk-category').addEventListener('change', updateCheckedGarments);
    panel.querySelector('.tw-bulk-favorite').addEventListener('change', updateCheckedGarments);
    panel.querySelector('[name="garment_group"]').addEventListener('change', assignGarmentGroup);
    panel.querySelector('.tw-tag-search').addEventListener('input', handleGarmentTagPicker);
    panel.querySelector('.tw-tag-picker').addEventListener('toggle', handleGarmentTagPicker);
    panel.querySelector('.tw-tag-picker').addEventListener('keydown', handleGarmentTagPicker);
    panel.addEventListener('click', handleGarmentTagPicker);
    panel.querySelector('.tw-group-tabs').addEventListener('click', selectGarmentGroup);
    panel.querySelector('.tw-group-tabs').addEventListener('click', deleteGarmentGroup);
    panel.querySelector('[data-action="add-group"]').addEventListener('click', addGarmentGroup);
    panel.querySelector('[data-action="add-garment-group"]').addEventListener('click', addGarmentGroup);
    panel.querySelector('[data-action="manage-groups"]').addEventListener('click', openGarmentGroupManager);
    panel.querySelector('[data-action="cancel-groups"]').addEventListener('click', closeGarmentGroupManager);
    panel.querySelector('[data-action="delete-groups"]').addEventListener('click', deleteManagedGarmentGroups);
    for (const selector of ['.tw-group-rows', '.tw-combination-items']) {
        const rows = panel.querySelector(selector);
        rows.addEventListener('click', reorderDraftRow);
        for (const type of ['dragstart', 'dragover', 'dragleave', 'drop', 'dragend']) rows.addEventListener(type, dragDraftRow);
        rows.closest('dialog').addEventListener('close', clearDraftDrag);
    }
    panel.querySelector('.tw-group-form').addEventListener('change', updateGarmentGroupSelection);
    panel.querySelector('.tw-group-form').addEventListener('submit', saveGarmentGroups);
    for (const button of panel.querySelectorAll('[data-action="toggle-multi"]')) button.addEventListener('click', toggleMultiSelect);
    panel.querySelector('.tw-bulk-actions').addEventListener('click', handleBulkMenu);
    panel.querySelector('.tw-bulk-actions').addEventListener('keydown', handleBulkMenuKeys);
    panel.addEventListener('click', dismissBulkMenus);
    panel.querySelector('.tw-density input').addEventListener('input', resizeGarmentCards);
    panel.querySelector('.tw-detail-content').addEventListener('input', markDetailsDirty);
    panel.querySelector('.tw-detail-content').addEventListener('change', markDetailsDirty);
    panel.querySelector('#tw-ask .tw-ask-cancel').addEventListener('click', () => panel.querySelector('#tw-ask').close('cancel'));
    panel.querySelector('#tw-ask').addEventListener('close', finishAskDialog);
    panel.querySelector('[data-action="describe-all"]').addEventListener('click', generateMissingGarmentDescriptions);
    for (const button of panel.querySelectorAll('[data-action="export-all"], [data-action="export-one"], [data-action="delete-one"], [data-action="remove-image"]')) {
        button.addEventListener('click', handleGarmentAction);
    }
    panel.querySelector('[data-action="save-garment"]').addEventListener('click', saveSelectedGarment);
    panel.querySelector('[data-action="describe"]').addEventListener('click', generateGarmentDescription);
    panel.querySelector('.tw-wearer-modes').addEventListener('change', selectWearer);
    panel.querySelector('.tw-category-list').addEventListener('click', selectCategory);
    panel.querySelector('.tw-mobile-filter select').addEventListener('change', selectCategoryOption);
    panel.querySelector('[data-action="toggle-details"]').addEventListener('click', toggleMobileDetails);
    panel.querySelector('.tw-view-modes').addEventListener('click', selectView);
    panel.querySelector('.tw-search input').addEventListener('input', searchGarments);
    panel.querySelector('.tw-sort select').addEventListener('change', sortGarments);
    panel.querySelector('.tw-detail-tabs').addEventListener('click', selectDetail);
    panel.addEventListener('close', restoreFocus);
    window.addEventListener('pagehide', destroyWardrobe, { once: true });
    appendInexistentScriptButtons([{ name: '衣柜插件', visible: true }]);
    subscriptions.push(eventOn(getButtonEvent('衣柜插件'), openWardrobe));
    subscriptions.push(eventOn(tavern_events.CHAT_CHANGED, stopOutfitRequest));
    subscriptions.push(eventOn(tavern_events.CHAT_CHANGED, refreshWardrobeContext));
    subscriptions.push(eventOn(tavern_events.GENERATION_STOPPED, stopOutfitRequest));
    subscriptions.push(eventMakeLast(tavern_events.CHAT_COMPLETION_PROMPT_READY, injectWardrobeContent));
    subscriptions.push(eventMakeLast(tavern_events.GENERATE_AFTER_DATA, markOutfitChatPrompt));
    subscriptions.push(eventMakeLast(tavern_events.CHAT_COMPLETION_SETTINGS_READY, applyIsolatedOutfits));
    subscriptions.push(eventMakeFirst(tavern_events.MESSAGE_RECEIVED, publishOutfitSnapshot));
    loadApiSettings();
    loadSendSettings();
    loadWardrobeTemplates();
    loadDescriptionPrompts();
    loadWardrobeLibraries();
    loadGarments();
    refreshWardrobe();
    void migrateLegacyImages();
    console.info('[衣柜插件] 面板已就绪。');
}

/**
 * 打开原生对话框，由标题的 autofocus 承接初始焦点，浏览器继续处理模态焦点和 Escape 关闭。
 * @returns {void} 无返回值。
 */
function openWardrobe() {
    if (panel.open) return;
    recordWardrobeLog('info', '打开衣柜', { library: activeLibraryId, items: garments.size });
    opener = hostDocument.activeElement;
    multiSelectMode = false;
    checkedGarmentIds.clear();
    setMobileDetails(false);
    refreshWardrobe();
    panel.showModal();
}

/**
 * 关闭当前面板前保护详情草稿；入口焦点由关闭事件恢复。
 * @param {Event} [event] 关闭按钮或原生 Escape 取消事件。
 * @returns {Promise<void>} 用户确认后清理并关闭，取消则保留面板。
 */
async function closeWardrobe(event) {
    if (event?.type === 'cancel') {
        if (event.target !== panel) return;
        event.preventDefault();
    }
    if (hasDetailsDraft() && !await confirmDiscardDetails()) return;
    stopDescriptionRequest();
    closeGarmentImage();
    closeBulkMenus();
    if (panel.querySelector('#tw-ask').open) panel.querySelector('#tw-ask').close('cancel');
    window.parent.clearTimeout(garmentSearchTimer);
    window.parent.clearTimeout(garmentTagSearchTimer);
    panel.querySelector('.tw-tag-picker').open = false;
    if (importConflictDialog?.open) importConflictDialog.close();
    closeImageImport();
    closeWardrobeExport();
    closeGarmentGroupManager();
    closeCombinationEditor();
    closeSettings();
    if (logsPanel.open) logsPanel.close();
    setDetailsDirty(false);
    panel.close();
}

/**
 * 在衣柜上方打开独立设置面板，保留衣柜的分类、详情和浏览位置。
 * @returns {void} 无返回值。
 */
function openSettings() {
    recordWardrobeLog('info', '打开衣柜设置');
    if (!settingsPanel.open) settingsPanel.showModal();
}

/**
 * 关闭设置并交由原生对话框恢复齿轮按钮焦点；关闭衣柜时一并使用此入口。
 * @returns {void} 无返回值。
 */
function closeSettings() {
    closeModelOptions();
    stopApiRequest();
    if (settingsPanel.open) settingsPanel.close();
}

/**
 * 加载当前大分类的有效服装，优先选中手动当前穿着，避免跨分区复用列表和详情。
 * @param {Object} [data] 切换大分类时已在入口校验的数据；省略时读取当前分区存档。
 * @returns {void} 无返回值。
 */
function loadGarments(data) {
    if (!data) {
        const saved = getLibraryVariables();
        data = parseWardrobeData({ items: saved.wardrobe_items ?? [], groups: saved.wardrobe_groups ?? [] });
    }
    garments = data.items;
    garmentGroups = data.groups;
    garmentGroupFilters = data.groupFilters;
    const selections = readWearerSelections();
    selectedGarmentId = selections.current.char.values().next().value ?? selections.current.user.values().next().value ?? selections.char.values().next().value ?? selections.user.values().next().value ?? garments.keys().next().value ?? null;
}

/**
 * 在存档入口读取大分类目录，旧版本自动使用 SFW、NSFW 两个默认分区并保留原衣柜。
 * @returns {void} 恢复上次打开的大分类；无效目录交由启动错误提示处理。
 */
function loadWardrobeLibraries() {
    const saved = getVariables({ type: 'script' });
    if (saved.wardrobe_libraries !== undefined) {
        if (!Array.isArray(saved.wardrobe_libraries)) throw new Error('衣柜大分类目录格式错误。');
        const libraries = new Map();
        for (const entry of saved.wardrobe_libraries) {
            if (!entry || typeof entry.id !== 'string' || !entry.id || libraries.has(entry.id) ||
                typeof entry.name !== 'string' || !entry.name.trim()) throw new Error('衣柜大分类名称或标识无效。');
            let name = entry.name.trim();
            // 仅升级两个旧默认名称，保留稳定标识及自定义名称，不搬动任何服装数据。
            if (entry.id === 'default-1' && name === '默认大分类1') name = 'SFW';
            else if (entry.id === 'default-2' && name === '默认大分类2') name = 'NSFW';
            libraries.set(entry.id, name);
        }
        if (!libraries.has('default-1') || !libraries.has('default-2')) throw new Error('衣柜缺少默认大分类。');
        wardrobeLibraries = libraries;
    }
    activeLibraryId = wardrobeLibraries.has(saved.wardrobe_active_library) ? saved.wardrobe_active_library : 'default-1';
    renderWardrobeLibraries();
}

/**
 * 读取指定大分类的数据；只有默认 SFW 分区沿用旧顶层字段，其余分区从独立空衣柜开始。
 * @param {string} [id] 大分类标识，默认为当前分区。
 * @returns {Object} 服装、标签和穿搭范围的存档，不合并其他分区字段。
 */
function getLibraryVariables(id = activeLibraryId) {
    const saved = getVariables({ type: 'script' });
    return id === 'default-1' ? saved : (saved.wardrobe_library_data?.[id] ?? {});
}

/**
 * 将服装与穿搭补丁一次写入当前大分类，保留其他分区和共用设置。
 * @param {Object} update 已由业务入口构造的存档补丁。
 * @returns {void} 保存失败向调用方抛错，不提前更新内存。
 */
function saveLibraryVariables(update) {
    if (activeLibraryId === 'default-1') insertOrAssignVariables(update, { type: 'script' });
    else {
        const saved = getVariables({ type: 'script' });
        insertOrAssignVariables({ wardrobe_library_data: { ...saved.wardrobe_library_data,
            [activeLibraryId]: { ...saved.wardrobe_library_data?.[activeLibraryId], ...update } } }, { type: 'script' });
    }
}

/**
 * 两个内置分区是存档目录的固定入口，通过标识区分，允许自建衣柜使用同名标签。
 * @param {string} id 大分类标识。
 * @returns {boolean} 是否为固定分区。
 */
function isDefaultWardrobeLibrary(id) {
    return id === 'default-1' || id === 'default-2';
}

/**
 * 用原生按钮渲染独立衣柜入口，动态名称按文本写入，支持键盘与选中状态朗读。
 * @returns {void} 更新页签和删除入口，不重绘服装或改动数据。
 */
function renderWardrobeLibraries() {
    const list = hostDocument.createDocumentFragment();
    let selectedButton;
    for (const [id, name] of wardrobeLibraries) {
        const button = hostDocument.createElement('button');
        button.type = 'button';
        button.dataset.libraryId = id;
        button.textContent = name;
        button.setAttribute('aria-pressed', String(id === activeLibraryId));
        if (id === activeLibraryId) selectedButton = button;
        list.append(button);
    }
    panel.querySelector('.tw-library-tabs').replaceChildren(list);
    panel.querySelector('[data-action="delete-library"]').hidden = isDefaultWardrobeLibrary(activeLibraryId);
    selectedButton.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

/**
 * 从顶部页签切换独立衣柜，与新建入口共用同一加载流程。
 * @param {MouseEvent} event 大分类导航的点击事件。
 * @returns {Promise<void>} 取消或失败时保留原分区与草稿。
 */
async function selectWardrobeLibrary(event) {
    const button = event.target.closest('button[data-library-id]');
    if (!button || button.dataset.libraryId === activeLibraryId) return;
    if (hasDetailsDraft() && !await confirmDiscardDetails()) return;
    try { activateWardrobeLibrary(button.dataset.libraryId); }
    catch (error) { recordWardrobeLog('error', 'selectWardrobeLibrary：捕获异常', error); setLibraryStatus(String(error), true); }
}

/**
 * 输入名称后新建并打开空衣柜，让外部数据有独立的导入目标。
 * @returns {Promise<void>} 取消或空名称不创建，存储失败保留当前衣柜。
 */
async function addWardrobeLibrary() {
    const name = (await askDialog({ title: '新增空衣柜', message: '为新的衣柜命名。', input: `衣柜${wardrobeLibraries.size + 1}`, confirmText: '创建' }))?.trim();
    if (!name || (hasDetailsDraft() && !await confirmDiscardDetails())) return;
    const id = window.parent.crypto.randomUUID();
    try { activateWardrobeLibrary(id, new Map([...wardrobeLibraries, [id, name]])); }
    catch (error) { recordWardrobeLog('error', 'addWardrobeLibrary：捕获异常', error); setLibraryStatus(String(error), true); }
}

/**
 * 确认后删除当前自建衣柜及其存档，再复用切换流程回到 SFW。
 * @returns {Promise<void>} 取消或保存失败时保留衣柜，保存后清理无引用的原图。
 */
async function deleteWardrobeLibrary() {
    const id = activeLibraryId;
    if (isDefaultWardrobeLibrary(id)) return;
    const name = wardrobeLibraries.get(id);
    const draftWarning = hasDetailsDraft() ? '\n当前服装未保存的详情修改也会丢弃。' : '';
    if (!await askConfirm('删除衣柜', `删除“${name}”及其中的 ${garments.size} 件服装、标签和穿搭设置？\n此操作不可撤销。${draftWarning}`, { confirmText: '删除衣柜', danger: true })) return;
    try {
        const removedGarments = garments;
        const libraries = new Map(wardrobeLibraries);
        libraries.delete(id);
        activateWardrobeLibrary('default-1', libraries, id);
        const images = [];
        for (const item of removedGarments.values()) {
            for (const field of IMAGE_FIELDS) if (item[field]) images.push(item[field]);
        }
        // 切换成功后才清理原图，保留其他分区引用的正背面图片；没有图片就无需扫描其余分区。
        if (images.length) void deleteGarmentImages(images);
        panel.querySelector('.tw-library-tabs [aria-pressed="true"]').focus();
        setLibraryStatus(`已删除衣柜“${name}”`);
    } catch (error) { recordWardrobeLog('error', 'deleteWardrobeLibrary：捕获异常', error); setLibraryStatus(String(error), true); }
}

/**
 * 校验目标存档并保存当前入口后切换数据，清空上个分区的筛选、多选和本地待导入文件。
 * @param {string} id 已由目录或新建入口确定的大分类标识。
 * @param {Map<string, string>} [libraries] 新建或删除后的大分类目录。
 * @param {string} [removedId] 要随目录一起删除的自建分区标识。
 * @returns {void} 导入或换图未结束时提示等待，避免异步提交写入另一分区。
 */
function activateWardrobeLibrary(id, libraries = wardrobeLibraries, removedId) {
    if (importingGarments || replacingImage) {
        throw new Error(`请等待当前导入或图片替换完成后再${removedId ? '删除衣柜' : '切换大分类'}。`);
    }
    const saved = getLibraryVariables(id);
    const data = parseWardrobeData({ items: saved.wardrobe_items ?? [], groups: saved.wardrobe_groups ?? [] });
    const update = { wardrobe_libraries: Array.from(libraries, ([id, name]) => ({ id, name })), wardrobe_active_library: id };
    if (removedId) {
        // 一次替换目录、当前入口和分区数据，保存失败时旧目录和原图仍能一起读取。
        const variables = getVariables({ type: 'script' });
        const libraryData = { ...variables.wardrobe_library_data };
        delete libraryData[removedId];
        replaceVariables({ ...variables, ...update, wardrobe_library_data: libraryData }, { type: 'script' });
    } else insertOrAssignVariables(update, { type: 'script' });
    stopDescriptionRequest();
    stopOutfitRequest();
    closeImageImport();
    closeWardrobeExport();
    closeGarmentImage();
    window.parent.clearTimeout(garmentSearchTimer);
    window.parent.clearTimeout(garmentTagSearchTimer);
    panel.querySelector('.tw-tag-picker').open = false;
    wardrobeLibraries = libraries;
    activeLibraryId = id;
    selectedGroupByFilter.clear();
    checkedGarmentIds.clear();
    multiSelectMode = false;
    currentCategory = 'all';
    currentGroup = '*';
    garmentSearch = '';
    panel.querySelector('.tw-search input').value = '';
    loadGarments(data);
    renderWardrobeLibraries();
    updateCategory('all');
    renderGarmentDetails();
    setMobileDetails(false);
    setLibraryStatus('');
    setGarmentStatus('');
}

/**
 * 将勾选服装与搭配成员移动到另一衣柜，图片复用原文件，同名标签复用目标分组。
 * @param {string} targetId 菜单选定的目标衣柜标识。
 * @param {Set<string>} [ids] 已校验的服装及搭配成员。
 * @returns {void} 两个分区一次保存成功后才更新当前界面，失败保留存档、多选与详情。
 */
function moveGarmentsToLibrary(targetId, ids = getGarmentMoveIds(targetId)) {
    if (!ids.size) return;
    const targetSaved = getLibraryVariables(targetId);
    const target = parseWardrobeData({ items: targetSaved.wardrobe_items ?? [], groups: targetSaved.wardrobe_groups ?? [] });
    const remaining = new Map(garments);
    const itemIds = new Map();
    const groupIds = new Map();
    // 目标可含相同 ID 或同名标签；先建索引再映射，成本随移动记录和标签数线性增长。
    const groupNames = new Map(Array.from(target.groups, ([id, name]) => [name, id]));
    for (const id of ids) {
        itemIds.set(id, target.items.has(id) ? window.parent.crypto.randomUUID() : id);
        for (const groupId of garments.get(id).groupIds) {
            if (groupIds.has(groupId)) continue;
            const name = garmentGroups.get(groupId);
            const mapped = groupNames.get(name) ?? (target.groups.has(groupId) ? window.parent.crypto.randomUUID() : groupId);
            groupIds.set(groupId, mapped);
            groupNames.set(name, mapped);
            target.groups.set(mapped, name);
            const filters = target.groupFilters.get(mapped) ?? new Set();
            for (const filter of garmentGroupFilters.get(groupId) ?? []) filters.add(filter);
            target.groupFilters.set(mapped, filters);
        }
    }
    for (const id of ids) {
        const item = garments.get(id);
        const mapped = itemIds.get(id);
        target.items.set(mapped, { ...item, id: mapped, groupIds: item.groupIds.map(groupId => groupIds.get(groupId)),
            ...(item.componentIds ? { componentIds: item.componentIds.map(memberId => itemIds.get(memberId)) } : {}) });
        remaining.delete(id);
    }
    const sourceUpdate = { wardrobe_items: Array.from(remaining.values()), ...pruneDeletedSelections(remaining) };
    const targetUpdate = { wardrobe_items: Array.from(target.items.values()),
        wardrobe_groups: Array.from(target.groups, ([id, name]) => ({ id, name,
            ...(target.groupFilters.get(id)?.size ? { filters: Array.from(target.groupFilters.get(id)) } : {}) })) };
    const saved = getVariables({ type: 'script' });
    const update = { wardrobe_library_data: { ...saved.wardrobe_library_data } };
    // 原衣柜清理全部范围的归属，目标不自动应用；同次提交避免仅删除原件或只留下目标副本。
    for (const [id, patch] of [[activeLibraryId, sourceUpdate], [targetId, targetUpdate]]) {
        if (id === 'default-1') Object.assign(update, patch);
        else update.wardrobe_library_data[id] = { ...saved.wardrobe_library_data?.[id], ...patch };
    }
    insertOrAssignVariables(update, { type: 'script' });
    stopDescriptionRequest();
    const movedSelected = ids.has(selectedGarmentId);
    garments = remaining;
    checkedGarmentIds.clear();
    if (movedSelected) selectedGarmentId = garments.keys().next().value ?? null;
    renderGarmentLibrary();
    // 未移动的预览保留名称和描述草稿，只有原预览已移走时才切换详情。
    if (movedSelected) renderGarmentDetails();
    else renderWearerState();
    setLibraryStatus(`已移动 ${ids.size} 件服装到“${wardrobeLibraries.get(targetId)}”`);
}

/**
 * 在移动入口验证目标与进行中的操作，展开搭配成员，并阻止原衣柜留下悬空搭配。
 * @param {string} targetId 待验证的目标衣柜标识。
 * @returns {Set<string>} 勾选服装及其成员的去重集合；无法整体移动时抛出具体原因。
 */
function getGarmentMoveIds(targetId) {
    if (!wardrobeLibraries.has(targetId) || targetId === activeLibraryId) throw new Error('请选择其他衣柜作为移动目标。');
    if (importingGarments || replacingImage) throw new Error('请等待当前导入或图片替换完成后再移动服装。');
    const ids = new Set(getCheckedGarments().map(item => item.id));
    for (const id of ids) for (const memberId of garments.get(id).componentIds ?? []) ids.add(memberId);
    for (const item of garments.values()) {
        if (!ids.has(item.id) && item.componentIds?.some(id => ids.has(id))) {
            throw new Error(`所选服装仍被搭配“${item.name}”使用，请一并勾选该搭配后移动，或先编辑搭配移除成员。`);
        }
    }
    return ids;
}

/**
 * 在存档或文件入口一次性校验数据，迁移旧单标签并合并同名标签及其筛选归属。
 * @param {unknown} data 待校验的衣柜数据。
 * @param {boolean} allowStoredImages 是否允许本机图片路径；导入备份时必须内嵌图片。
 * @returns {{items: Map<string, WardrobeItem>, groups: Map<string, string>, groupFilters: Map<string, Set<string>>, overwriteFields?: Map<string, Set<string>>}} 归一化数据及导入时可覆盖的字段。
 */
function parseWardrobeData(data, allowStoredImages = true) {
    if (!data || !Array.isArray(data.items) || !Array.isArray(data.groups)) throw new Error('服装文件格式错误，需要 items 和 groups 数组。');
    const groups = new Map();
    const groupFilters = new Map();
    for (const group of data.groups) {
        if (!group || typeof group.id !== 'string' || !group.id || group.id === '*' || groups.has(group.id) ||
            typeof group.name !== 'string' || !group.name.trim() ||
            (group.filters !== undefined && (!Array.isArray(group.filters) || group.filters.some(id => !CATEGORY_LABELS.has(id))))) throw new Error('标签格式错误、标识重复或筛选归属无效。');
        groups.set(group.id, group.name.trim());
        groupFilters.set(group.id, new Set(group.filters ?? []));
    }
    const items = new Map();
    const overwriteFields = allowStoredImages ? undefined : new Map();
    for (const item of data.items) {
        if (!item || !hasValidGarmentFields(item, items)) {
            throw new Error('服装数据缺少名称、描述、有效图片，或标识重复、标签无效、收藏状态无效、内容分级无效、使用时间无效。');
        }
        if (!allowStoredImages && IMAGE_FIELDS.some(field => STORED_IMAGE_PATTERN.test(item[field] ?? ''))) {
            throw new Error(`“${item.name}”的图片只有本机路径，无法跨设备导入。请在原酒馆中重新导出包含图片的 JSON。`);
        }
        items.set(item.id, {
            id: item.id, name: item.name, description: item.description, image: item.image, backImage: item.backImage ?? '',
            category: GARMENT_CATEGORIES.has(item.category) ? item.category : 'other',
            // 缺失分级不等于已确认安全，兼容旧备份时保留未标注状态。
            contentRating: item.contentRating ?? 'unrated',
            // 新字段显式为空时保持未分组，不重新带回旧标签；去重并丢弃已删除的标签引用。
            groupIds: Array.from(new Set(item.groupIds ?? (item.groupId ? [item.groupId] : []))).filter(id => groups.has(id)),
            favorite: item.favorite ?? false,
            lastUsedAt: item.lastUsedAt ?? 0,
            ...(item.componentIds !== undefined ? { componentIds: item.componentIds } : {}),
            ...(item.descriptionOverride ? { descriptionOverride: true } : {}),
        });
        if (overwriteFields) {
            // 区分备份里的明确值和为了兼容旧存档补上的默认值。
            const fields = new Set(IMPORT_METADATA_FIELDS.filter(field => item[field] !== undefined));
            if (GARMENT_CATEGORIES.has(item.category)) fields.add('category');
            if (item.groupIds !== undefined || item.groupId !== undefined) fields.add('groupIds');
            overwriteFields.set(item.id, fields);
        }
    }
    // 完整读取后一次校验关联，允许成员在文件中排在搭配之后；禁止空搭配、悬空和嵌套关系。
    for (const item of items.values()) {
        if (item.componentIds === undefined) continue;
        if (!Array.isArray(item.componentIds) || !item.componentIds.length || new Set(item.componentIds).size !== item.componentIds.length) {
            throw new Error('搭配必须包含不重复的服装成员。');
        }
        for (const id of item.componentIds) {
            if (typeof id !== 'string' || !items.has(id) || items.get(id).componentIds !== undefined) {
                throw new Error('搭配成员必须是文件中存在的普通服装，不能嵌套搭配。');
            }
        }
    }
    return { ...mergeNamedGarmentGroups(items, groups, groupFilters), overwriteFields };
}

/**
 * 在存档入口分别检查必填字段、图片及可选元数据，兼容旧存档没有背面和多标签的情况。
 * @param {Object} item 入口尚未验证的服装记录。
 * @param {Map<string, WardrobeItem>} items 已校验的服装，检查重复 ID。
 * @returns {boolean} 记录是否满足现有格式约束。
 */
function hasValidGarmentFields(item, items) {
    const validIdentity = typeof item.id === 'string' && item.id && !items.has(item.id) &&
        typeof item.name === 'string' && item.name.trim() && typeof item.description === 'string';
    if (!validIdentity) return false;
    for (const field of IMAGE_FIELDS) {
        const image = item[field];
        if (field === 'backImage' && image === undefined) continue;
        if (typeof image !== 'string' || (image && !DATA_IMAGE_PATTERN.test(image) && !STORED_IMAGE_PATTERN.test(image))) return false;
    }
    return (item.groupId === undefined || typeof item.groupId === 'string') &&
        (item.groupIds === undefined || (Array.isArray(item.groupIds) && item.groupIds.every(id => typeof id === 'string'))) &&
        (item.favorite === undefined || typeof item.favorite === 'boolean') &&
        (item.contentRating === undefined || ['unrated', 'sfw', 'nsfw'].includes(item.contentRating)) &&
        (item.descriptionOverride === undefined || typeof item.descriptionOverride === 'boolean') &&
        (item.lastUsedAt === undefined || (Number.isSafeInteger(item.lastUsedAt) && item.lastUsedAt >= 0));
}

/**
 * 按已归一化的名称合并标签，线性重映射服装归属，避免汇总、重命名和导入产生重复分组。
 * @param {Map<string, WardrobeItem>} items 已校验或由界面编辑的服装。
 * @param {Map<string, string>} groups 标签名称与期望顺序。
 * @param {Map<string, Set<string>>} groupFilters 标签所属的筛选。
 * @returns {{items: Map<string, WardrobeItem>, groups: Map<string, string>, groupFilters: Map<string, Set<string>>, aliases: Map<string, string>}} 合并结果与旧标识映射。
 */
function mergeNamedGarmentGroups(items, groups, groupFilters) {
    const names = new Map();
    const merged = new Map();
    const filters = new Map();
    const aliases = new Map();
    for (const [id, name] of groups) {
        const target = names.get(name) ?? id;
        names.set(name, target);
        merged.set(target, name);
        aliases.set(id, target);
        if (!filters.has(target)) filters.set(target, new Set());
        for (const filter of groupFilters.get(id) ?? []) filters.get(target).add(filter);
    }
    const next = new Map(items);
    if (merged.size !== groups.size) {
        // 仅有重名时才复制服装，稳定 ID 与其余字段保持原样。
        for (const [id, item] of items) next.set(id, { ...item, groupIds: Array.from(new Set(item.groupIds.map(groupId => aliases.get(groupId)))) });
    }
    return { items: next, groups: merged, groupFilters: filters, aliases };
}

/**
 * 在备份入口识别本衣柜与 Outfit Manager 数据，转换后复用现有合并、上传和回滚流程。
 * @param {unknown} data 本地或远程 JSON 的解析结果，支持 User、单角色、全部角色及完整备份。
 * @returns {{items: Map<string, WardrobeItem>, groups: Map<string, string>, groupFilters: Map<string, Set<string>>, overwriteFields: Map<string, Set<string>>}} 已校验的服装、标签和来源字段。
 */
function parseWardrobeFile(data) {
    if (data?.format === 'tw-wardrobe' && data.version === 1) return parseWardrobeData(data, false);
    if (!data || typeof data !== 'object' || data.format !== undefined ||
        (data.type !== undefined && !['user', 'char', 'chars_all'].includes(data.type)) ||
        (data.type !== 'chars_all' && !Array.isArray(data.outfits))) {
        throw new Error('请选择本衣柜或 Outfit Manager 导出的服装 JSON 文件。');
    }
    const partitions = data.type === 'chars_all' ? [] : [data];
    if (data.chars !== undefined) {
        if (!data.chars || typeof data.chars !== 'object' || Array.isArray(data.chars)) throw new Error('Outfit Manager 角色数据格式错误。');
        partitions.push(...Object.values(data.chars));
    } else if (data.type === 'chars_all') throw new Error('Outfit Manager 文件缺少角色数据。');
    if (data._assets !== undefined && (!data._assets || typeof data._assets !== 'object' || Array.isArray(data._assets))) {
        throw new Error('Outfit Manager 图片资源格式错误。');
    }
    const items = [];
    const groups = new Map();
    const descriptionsProvided = new Set();
    const categoriesProvided = new Set();
    const categoryIds = new Map(CATEGORIES.slice(1).map(([id, label]) => [label, id]));
    const imagePrefix = '/api/plugins/outfit-manager/images/';
    for (const [partitionIndex, partition] of partitions.entries()) {
        if (!partition || !Array.isArray(partition.outfits) ||
            (partition.accessories !== undefined && !Array.isArray(partition.accessories))) {
            throw new Error('Outfit Manager 穿搭或单品列表格式错误。');
        }
        for (const [kind, records] of [['outfits', partition.outfits], ['accessories', partition.accessories ?? []]]) {
            for (const item of records) {
                if (!item || typeof item !== 'object' ||
                    (item.category !== undefined && typeof item.category !== 'string') ||
                    (item.subCategory !== undefined && typeof item.subCategory !== 'string') ||
                    (item.sceneTag !== undefined && typeof item.sceneTag !== 'string') ||
                    (item.imageData != null && typeof item.imageData !== 'string')) {
                    throw new Error('Outfit Manager 服装分类、场景或图片格式错误。');
                }
                // 对方分类表示风格而非衣物类型；整套统一归入套装，场景优先作为现有标签。
                const category = item.category?.trim() ?? '';
                const subCategory = item.subCategory?.trim() ?? '';
                const label = item.sceneTag?.trim() || [category, subCategory].filter(Boolean).join(' / ');
                let groupId = '';
                if (label) {
                    if (!groups.has(label)) groups.set(label, `om-group-${groups.size}`);
                    groupId = groups.get(label);
                }
                let image = item.imageData ?? '';
                if (image && !image.startsWith('data:')) {
                    // 服务端导出通过 _assets 携带原图，不读取另一台酒馆的路径，避免导入缺图记录。
                    const assetName = image.startsWith(imagePrefix) ? image.slice(imagePrefix.length) : '';
                    if (!assetName || !Object.hasOwn(data._assets ?? {}, assetName)) {
                        throw new Error(`“${item.name}”的备份缺少原图，请在 Outfit Manager 中重新导出包含图片的 JSON。`);
                    }
                    image = data._assets[assetName];
                    if (typeof image !== 'string' || !image) throw new Error(`“${item.name}”的图片资源无效。`);
                }
                // 角色分区和穿搭／单品可使用相同 ID，增加来源前缀避免误判；最终导入仍生成新 ID。
                const id = typeof item.id === 'string' && item.id ? `${partitionIndex}:${kind}:${item.id}` : item.id;
                if (item.description != null) descriptionsProvided.add(id);
                if (kind === 'outfits' || categoryIds.has(category)) categoriesProvided.add(id);
                items.push({
                    id, name: item.name, description: item.description ?? '', image, groupId: groupId || undefined,
                    category: kind === 'outfits' ? 'outfits' : (categoryIds.get(category) ?? 'accessories'),
                    favorite: item.favorite,
                });
            }
        }
    }
    // 通用字段只在现有入口校验；不迁移对方的应用状态、设置或预设副本，保留当前衣柜行为。
    const parsed = parseWardrobeData({ items, groups: Array.from(groups, ([name, id]) => ({ id, name })) }, false);
    // 外部格式缺省的描述与分类只用于新增，不能用归一化后的空值覆盖已有资料。
    for (const [id, fields] of parsed.overwriteFields) {
        if (!descriptionsProvided.has(id)) fields.delete('description');
        if (!categoriesProvided.has(id)) fields.delete('category');
    }
    return parsed;
}

/**
 * 打开插件内的勾选面板，支持先选文件夹或分次添加文件，不依赖系统窗口的修饰键多选。
 * @returns {void} 无返回值。
 */
function openImageImport() {
    panel.querySelector('#tw-import-picker').showModal();
}

/**
 * 按入口打开文件或文件夹选择器，文件仍只在用户确认时上传。
 * @param {MouseEvent} event 添加图片/文件或选择图片文件夹按钮的点击事件。
 * @returns {void} 无返回值。
 */
function chooseImportFiles(event) {
    panel.querySelector(event.currentTarget.dataset.action === 'add-import-folder' ? '.tw-folder-import' : '.tw-image-import').click();
}

/**
 * 校验用户填写的备份地址并加入待选列表，确认前不发起网络请求。
 * @returns {Promise<void>} 用户取消、地址无效或更新待选列表后结束。
 */
async function addImportLink() {
    const value = await askDialog({ title: '添加 JSON 链接', message: '粘贴 JSON 备份文件的直链。', input: '', confirmText: '添加' });
    if (value === null) return;
    const status = panel.querySelector('.tw-import-status');
    let url;
    try { url = new URL(value); }
    catch { /* 无法解析的地址与不支持的协议使用同一条提示。 */ }
    if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:') || url.username || url.password) {
        status.textContent = '请输入有效的 HTTP 或 HTTPS 下载链接。';
        return;
    }
    // 片段不参与下载，同一地址重复添加时保留已有的勾选状态。
    url.hash = '';
    const key = `link:${url.href}`;
    if (!pendingGarmentImports.has(key)) {
        let name = url.pathname.split('/').at(-1) || url.hostname;
        try { name = decodeURIComponent(name); }
        catch { /* 文件名无法解码时保留原样，仍可用原地址下载。 */ }
        pendingGarmentImports.set(key, { file: { name, backupUrl: url.href }, url: '', selected: true });
    }
    status.textContent = '';
    renderPendingImports();
}

/**
 * 从直链读取原始 JSON，GitHub Release 跨域下载失败时尝试酒馆代理，直接解析响应以节省大备份内存。
 * @param {WardrobeImportLink} file 已校验地址与用于提示的备份文件名。
 * @returns {Promise<unknown>} 尚未通过衣柜格式校验的备份数据。
 */
async function readWardrobeImportLink({ name, backupUrl: url }) {
    const controller = new window.parent.AbortController();
    const { signal } = controller;
    const lifetime = wardrobeReadController.signal;
    /** 插件卸载时中止本次下载；无参数，无返回值。 */
    const cancel = () => controller.abort();
    lifetime.addEventListener('abort', cancel, { once: true });
    if (lifetime.aborted) cancel();
    // 直连、代理及读取响应体共用一次超时，避免单个链接锁住整个导入。
    let timedOut = false;
    /** 到达总时限时标记超时并中止响应读取；无参数，无返回值。 */
    const expire = () => {
        timedOut = true;
        cancel();
    };
    const timeout = window.parent.setTimeout(expire, IMPORT_LINK_TIMEOUT_MS);
    try {
        let response;
        // 地址可能含访问令牌，错误信息不带完整链接或响应正文。
        try { response = await window.parent.fetch(url, { signal }); }
        catch (error) {
            if (signal.aborted) throw error;
            if (!GITHUB_RELEASE_DOWNLOAD.test(url)) {
                throw new Error('无法下载 JSON，请检查链接是否可访问，以及来源是否允许跨域读取（CORS）。');
            }
            // 酒馆代理会转发部分请求头，省略登录凭据。
            try { response = await window.parent.fetch(`/proxy/${encodeURIComponent(url)}`, { signal, credentials: 'omit' }); }
            catch (proxyError) {
                if (signal.aborted) throw proxyError;
            }
            if (!response?.ok) {
                throw new Error('GitHub Release 限制网页跨域读取，酒馆代理未能下载。请在浏览器打开原链接下载，再通过「添加图片/文件」导入。');
            }
        }
        if (!response.ok) throw new Error(`下载 JSON 失败（HTTP ${response.status}）。`);
        try { return await response.json(); }
        catch (error) {
            if (signal.aborted) throw error;
            if (error.name === 'SyntaxError') throw new Error('链接未返回有效的 JSON，请使用备份文件的直链。');
            throw new Error('读取 JSON 下载内容失败，请重试。');
        }
    } catch (error) {
        if (timedOut) throw new Error(`下载“${name}”超时，请重试。`);
        if (signal.aborted) throw new Error('备份读取已取消。');
        throw error;
    } finally {
        window.parent.clearTimeout(timeout);
        lifetime.removeEventListener('abort', cancel);
    }
}

/**
 * 累积本次选择，文件夹只列出支持的图片；取消文件选择不清空之前已添加的文件。
 * @param {Event} event 图片选择器变化事件。
 * @returns {void} 更新待选缩略图，不读取原图数据或提交存档。
 */
function importGarments(event) {
    const input = event.currentTarget;
    addPendingImports(input.files, input.classList.contains('tw-folder-import'));
    input.value = '';
}

/**
 * 选择器与拖放共用的本地文件入口，按来源过滤支持的类型并保留之前的勾选状态。
 * @param {Iterable<File>} files 用户选择、拖入或粘贴的本地文件。
 * @param {boolean} folder 是否来自文件夹入口，文件夹仅接收图片。
 * @returns {void} 累积待选文件并更新缩略图。
 */
function addPendingImports(files, folder = false) {
    for (const file of files) {
        const image = IMAGE_TYPES.has(file.type);
        if (!image && (folder || !(/\.json$/i.test(file.name) || file.type === 'application/json'))) continue;
        // 文件相对路径、大小和修改时间仅用于待选列表去重，正式导入仍沿用原图哈希查重。
        const key = JSON.stringify([file.webkitRelativePath || file.name, file.size, file.lastModified]);
        // 文件夹用作浏览来源，默认不选；明确添加的文件默认选中，避免误导入整个图片目录。
        if (!pendingGarmentImports.has(key)) pendingGarmentImports.set(key, { file, url: image ? window.parent.URL.createObjectURL(file) : '', selected: !folder });
    }
    renderPendingImports();
}

/**
 * 用对象地址绘制本地缩略图，备份只显示文件名，避免确认前读取大文件。
 * @returns {void} 添加文件后重建列表，勾选时不重建图片。
 */
function renderPendingImports() {
    const list = hostDocument.createDocumentFragment();
    for (const [key, entry] of pendingGarmentImports) {
        const file = entry.file;
        const path = 'backupUrl' in file ? file.name : file.webkitRelativePath || file.name;
        const label = hostDocument.createElement('label');
        label.className = 'tw-import-card';
        const checkbox = hostDocument.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.importKey = key;
        checkbox.checked = entry.selected;
        checkbox.setAttribute('aria-label', `导入${path}`);
        if (entry.url) {
            const image = hostDocument.createElement('img');
            image.src = entry.url;
            image.alt = '';
            image.loading = 'lazy';
            image.decoding = 'async';
            label.append(image);
        } else label.innerHTML = icon('file');
        const name = hostDocument.createElement('span');
        name.textContent = file.name;
        label.title = path;
        label.append(checkbox, name);
        list.append(label);
    }
    panel.querySelector('.tw-import-grid').replaceChildren(list);
    updatePendingImportCount();
}

/**
 * 单击图片对应复选框即可切换选择，也支持全选和全不选；不触发任何上传。
 * @param {Event|MouseEvent} event 缩略图复选框变化或批量选择按钮事件。
 * @returns {void} 同步勾选与数量，保留当前焦点和缩略图。
 */
function selectPendingImports(event) {
    const input = event.target.closest('[data-import-key]');
    if (input) pendingGarmentImports.get(input.dataset.importKey).selected = input.checked;
    else {
        const selected = event.currentTarget.dataset.importSelection === 'all';
        for (const entry of pendingGarmentImports.values()) entry.selected = selected;
        for (const checkbox of panel.querySelectorAll('[data-import-key]')) checkbox.checked = selected;
    }
    updatePendingImportCount();
}

/**
 * 同步待选总数、已选数及空列表状态，只有选择了文件才允许开始导入。
 * @returns {void} 无返回值。
 */
function updatePendingImportCount() {
    let selected = 0;
    for (const entry of pendingGarmentImports.values()) if (entry.selected) selected++;
    panel.querySelector('.tw-import-count').textContent = `已选 ${selected} / ${pendingGarmentImports.size} 个文件`;
    panel.querySelector('.tw-import-empty').hidden = pendingGarmentImports.size > 0;
    panel.querySelector('[data-action="confirm-import"]').disabled = selected === 0;
    for (const button of panel.querySelectorAll('[data-import-selection]')) button.disabled = pendingGarmentImports.size === 0;
}

/**
 * 把勾选的本地文件和链接交给整批导入，成功后关闭；失败保留选择供重试。
 * @returns {Promise<void>} 导入完成并恢复面板控件后结束。
 */
async function confirmImageImport() {
    const files = [];
    for (const entry of pendingGarmentImports.values()) if (entry.selected) files.push(entry.file);
    if (!files.length || importingGarments) return;
    const dialog = panel.querySelector('#tw-import-picker');
    for (const control of dialog.querySelectorAll('button, input')) control.disabled = true;
    const status = panel.querySelector('.tw-import-status');
    try {
        if (await importGarmentFiles(files, status)) closeImageImport();
    } finally {
        for (const control of dialog.querySelectorAll('button, input')) control.disabled = false;
        updatePendingImportCount();
    }
}

/**
 * 导入过程中阻止 Escape 丢弃正在使用的待选列表，完成或失败后恢复原生关闭行为。
 * @param {Event} event 原生对话框取消事件。
 * @returns {void} 无返回值。
 */
function preventImportCancellation(event) {
    if (importingGarments) event.preventDefault();
}

/**
 * 关闭待选面板并释放缩略图对象地址；取消选择不改变现有衣柜。
 * @returns {void} 无返回值。
 */
function closeImageImport() {
    const dialog = panel.querySelector('#tw-import-picker');
    if (dialog.open) dialog.close();
    clearPendingImports();
}

/**
 * 在取消、导入成功或卸载时清空待选项并释放缩略图地址，避免重复打开时累积内存。
 * @returns {void} 无返回值。
 */
function clearPendingImports() {
    for (const entry of pendingGarmentImports.values()) if (entry.url) window.parent.URL.revokeObjectURL(entry.url);
    pendingGarmentImports.clear();
    panel.querySelector('.tw-import-grid').replaceChildren();
    panel.querySelector('.tw-import-status').textContent = '';
    updatePendingImportCount();
}

/**
 * 接收面板内拖放文件和剪贴板图片；文本编辑保留原生粘贴，设置面板不接收服装。
 * @param {DragEvent|ClipboardEvent} event 面板拖放或粘贴事件。
 * @returns {Promise<void>} 文件导入完成后结束。
 */
async function handleGarmentTransfer(event) {
    if (settingsPanel.open || logsPanel?.open || importConflictDialog?.open || panel.querySelector('#tw-ask').open) return;
    if (event.type === 'paste' && event.target.closest('input, textarea, [contenteditable="true"]')) return;
    const transfer = event.clipboardData ?? event.dataTransfer;
    if (event.type === 'dragover') {
        if (Array.from(transfer.types).includes('Files')) {
            event.preventDefault();
            transfer.dropEffect = 'copy';
        }
        return;
    }
    const files = Array.from(transfer.files).filter(file => event.type !== 'paste' || IMAGE_TYPES.has(file.type));
    if (!files.length) return;
    event.preventDefault();
    if (panel.querySelector('#tw-import-picker').open) {
        // 导入面板内拖放和粘贴只累积候选，保持“确认前不上传”的同一操作预期。
        addPendingImports(files);
    } else await importGarmentFiles(files);
}

/**
 * 先校验整批本地和远程文件并按名称与原图哈希处理重复项，再上传及一次提交；任一失败回收新图。
 * @param {(File|WardrobeImportLink)[]} files 待导入的本地文件或 JSON 链接。
 * @param {HTMLElement} [status] 导入弹窗内的状态区域；直接拖放或粘贴时省略。
 * @returns {Promise<boolean>} 成功保存或全部跳过时为真，取消、忙碌或失败时为假。
 */
async function importGarmentFiles(files, status) {
    if (!files.length || importingGarments) return false;
    importingGarments = true;
    if (status) status.textContent = '正在导入…';
    for (const button of panel.querySelectorAll('[data-action="import"]')) button.disabled = true;
    const uploaded = [];
    try {
        const candidates = [];
        const overwriteFields = new Map();
        const groups = new Map(garmentGroups);
        const groupFilters = new Map(Array.from(garmentGroupFilters, ([id, filters]) => [id, new Set(filters)]));
        let filtersChanged = false;
        const groupNames = new Map(Array.from(groups, ([id, name]) => [name, id]));
        const importGroup = currentGroup === '*' ? '' : currentGroup;
        for (const file of files) {
            const isLink = 'backupUrl' in file;
            if (isLink || /\.json$/i.test(file.name) || file.type === 'application/json') {
                const data = parseWardrobeFile(isLink ? await readWardrobeImportLink(file) : JSON.parse(await file.text()));
                const groupIds = new Map();
                // 每份文件先获得独立的临时 ID，防止多文件原 ID 相同；查重后再映射到最终记录。
                const itemIds = new Map(Array.from(data.items.keys(), id => [id, window.parent.crypto.randomUUID()]));
                // 标签按名称复用，服装等整批校验后再决定新增或覆盖，跳过项不上传图片。
                for (const [oldId, name] of data.groups) {
                    let id = groupNames.get(name);
                    if (!id) {
                        id = window.parent.crypto.randomUUID();
                        groups.set(id, name);
                        groupNames.set(name, id);
                    }
                    groupIds.set(oldId, id);
                    const filters = groupFilters.get(id) ?? new Set();
                    for (const filter of data.groupFilters.get(oldId)) {
                        if (!filters.has(filter)) filtersChanged = true;
                        filters.add(filter);
                    }
                    groupFilters.set(id, filters);
                }
                for (const item of data.items.values()) {
                    const id = itemIds.get(item.id);
                    overwriteFields.set(id, data.overwriteFields.get(item.id));
                    candidates.push({ ...item, id, groupIds: item.groupIds.map(id => groupIds.get(id)),
                        ...(item.componentIds ? { componentIds: item.componentIds.map(id => itemIds.get(id)) } : {}) });
                }
            } else {
                const image = await readGarmentImage(file);
                candidates.push({ name: file.name.replace(/\.[^.]+$/, '') || '未命名服装', category: 'other', contentRating: 'unrated', description: '', image, groupIds: importGroup ? [importGroup] : [], favorite: false, lastUsedAt: 0 });
            }
        }
        const names = new Set(candidates.map(item => item.name.trim()));
        const fingerprints = new Map();
        const imageHashes = new Map();
        const candidateItems = new Map(candidates.map(item => [item.id, item]));
        // 只读取本批同名的旧图片，并缓存同图哈希；索引查重避免每件导入都遍历整个衣柜。
        for (const item of garments.values()) {
            if (names.has(item.name.trim())) fingerprints.set(await garmentFingerprint(item, imageHashes), item);
        }
        const next = new Map();
        const importedIds = new Map();
        let duplicateAction;
        let skipped = 0;
        const overwrittenIds = new Set();
        for (const item of candidates) {
            const key = await garmentFingerprint(item, imageHashes, candidateItems);
            const existing = fingerprints.get(key);
            if (existing) {
                duplicateAction ??= await chooseImportDuplicate(item.name);
                if (!duplicateAction) {
                    if (status) status.textContent = '已取消导入，保留当前选择。';
                    return false;
                }
                if (duplicateAction === 'skip' || (duplicateAction === 'overwrite' && !overwriteFields.has(item.id))) {
                    importedIds.set(item.id, existing.id);
                    skipped++;
                    continue;
                }
            }
            const replacing = existing && duplicateAction === 'overwrite';
            const id = replacing ? existing.id : window.parent.crypto.randomUUID();
            importedIds.set(item.id, id);
            const imported = replacing ? mergeDuplicateGarment(existing, item, overwriteFields.get(item.id)) : {
                ...item, id, backImage: item.backImage ?? '', groupIds: item.groupIds.length || !importGroup ? item.groupIds : [importGroup],
            };
            next.set(id, imported);
            fingerprints.set(key, imported);
            if (replacing) overwrittenIds.add(id);
        }
        // 跳过或覆盖的成员也映射到实际保留项，搭配永远不引用备份里的旧 ID。
        for (const item of next.values()) {
            if (item.componentIds) item.componentIds = Array.from(new Set(item.componentIds.map(id => importedIds.get(id))));
        }
        // 整库备份允许只有空标签；没有新增服装时仍需恢复新标签，不能把有效备份当成空操作。
        if (!next.size && groups.size === garmentGroups.size && !filtersChanged) { setLibraryStatus(`已跳过 ${skipped} 件重复服装`); return true; }
        if (overwrittenIds.size) {
            const proposed = new Map(garments);
            for (const [id, item] of next) proposed.set(id, item);
            validateAppliedGarmentChanges(overwrittenIds, proposed);
        }
        for (const item of next.values()) {
            for (const field of IMAGE_FIELDS) {
                if (!DATA_IMAGE_PATTERN.test(item[field])) continue;
                item[field] = await uploadGarmentImage(item[field], imageHashes.get(item[field]));
                uploaded.push(item[field]);
            }
        }
        if (!root.isConnected) throw new Error('衣柜已卸载，导入已取消。');
        // 读文件和上传会等待网络，只合并本批记录，保留期间完成的其他服装编辑。
        const merged = new Map(garments);
        for (const [id, item] of next) merged.set(id, item);
        const preserveDraft = hasDetailsDraft();
        const selectedId = preserveDraft ? selectedGarmentId : next.keys().next().value ?? selectedGarmentId;
        commitGarments(merged, selectedId, groups, !preserveDraft, groupFilters);
        currentGroup = '*';
        updateCategory('all');
        setLibraryStatus(`已导入 ${next.size} 件，覆盖 ${overwrittenIds.size} 件，跳过 ${skipped} 件`);
        if (next.size && !preserveDraft) showGarmentDescription();
        return true;
    } catch (error) {
        recordWardrobeLog('error', 'importGarmentFiles：捕获异常', error);
        // 保存失败也要回收新文件；已经成功提交的路径由清理函数保留，不因界面刷新异常误删。
        await deleteGarmentImages(uploaded);
        if (root.isConnected) {
            if (status) status.textContent = String(error);
            setGarmentStatus(String(error), true);
            setLibraryStatus(String(error), true);
            toastr.error(String(error), '服装导入失败');
        }
        return false;
    } finally {
        importingGarments = false;
        for (const button of panel.querySelectorAll('[data-action="import"]')) button.disabled = false;
    }
}

/**
 * 覆盖相同图片的服装时只写备份声明的元数据，沿用已有图片文件和应用所依赖的 ID。
 * @param {WardrobeItem} existing 已有记录，可能是同批先导入的记录。
 * @param {WardrobeItem} incoming 已验证的备份记录。
 * @param {Set<string>} fields 备份实际提供、允许覆盖的字段。
 * @returns {WardrobeItem} 待提交的服装，搭配成员稍后统一映射。
 */
function mergeDuplicateGarment(existing, incoming, fields) {
    const merged = { ...existing, name: incoming.name, lastUsedAt: Math.max(incoming.lastUsedAt, existing.lastUsedAt) };
    for (const field of fields) {
        if (field === 'descriptionOverride' && !incoming.descriptionOverride) delete merged.descriptionOverride;
        else merged[field] = incoming[field];
    }
    if (incoming.componentIds) merged.componentIds = incoming.componentIds;
    return merged;
}

/**
 * 普通服装按名称与正背面原图 SHA-256 查重，防止背面不同的记录被覆盖；搭配再比较成员及顺序。
 * @param {WardrobeItem} item 已校验的服装或搭配。
 * @param {Map<string, string>} imageHashes 本批共享的图片路径／数据地址哈希缓存。
 * @param {Map<string, WardrobeItem>} items 关联成员所在的服装表，导入时使用本批临时表。
 * @returns {Promise<string>} 名称与图片哈希组成的稳定指纹。
 */
async function garmentFingerprint(item, imageHashes, items = garments) {
    if (item.componentIds) {
        const members = [];
        // 关联只允许一层，复用图片哈希缓存；同名但成员不同的搭配不会误判为重复。
        for (const id of item.componentIds) members.push(await garmentFingerprint(items.get(id), imageHashes, items));
        return JSON.stringify([item.name.trim(), 'combination', members]);
    }
    const hashes = [];
    for (const field of IMAGE_FIELDS) {
        const image = item[field] || '';
        let hash = imageHashes.get(image);
        if (hash === undefined) {
            hash = image ? await hashGarmentImage(await loadImageDataUrl(image)) : '';
            imageHashes.set(image, hash);
        }
        hashes.push(hash);
    }
    return JSON.stringify([item.name.trim(), ...hashes]);
}

/**
 * 对解码后的原图字节计算 SHA-256，供导入查重与固定文件名共用，避免名称或数据地址头影响结果。
 * @param {string} dataUrl 已在入口校验的原图数据地址。
 * @returns {Promise<string>} 由 64 个小写十六进制字符组成的 SHA-256 摘要。
 */
async function hashGarmentImage(dataUrl) {
    const binary = window.parent.atob(dataUrl.slice(dataUrl.indexOf(',') + 1));
    // 大图按原始字节长度一次分配，避免 TypedArray.from 对每个字节调用转换函数。
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < bytes.length; index++) bytes[index] = binary.charCodeAt(index);
    const digest = await window.parent.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * 使用原生对话框选择本批所有重复项的处理方式，Escape 或取消会放弃整批导入。
 * @param {string} name 首件重复服装的名称，通过文本节点显示。
 * @returns {Promise<string>} skip、overwrite、keep 或取消时的空字符串。
 */
function chooseImportDuplicate(name) {
    return new Promise(resolve => {
        const dialog = hostDocument.createElement('dialog');
        dialog.className = 'tw-import-conflict';
        dialog.setAttribute('aria-label', '处理重复服装');
        dialog.innerHTML = '<h2>发现重复服装</h2><p></p><form method="dialog"><button value="skip" autofocus>跳过</button><button value="overwrite">覆盖</button><button value="keep">保留两份</button><button value="">取消</button></form>';
        dialog.querySelector('p').textContent = `“${name}”名称和图片相同。此选择应用于本次所有重复项。`;
        dialog.addEventListener('close', () => {
            importConflictDialog = undefined;
            dialog.remove();
            resolve(dialog.returnValue);
        }, { once: true });
        panel.append(dialog);
        importConflictDialog = dialog;
        dialog.showModal();
    });
}

/**
 * 校验图片并读取数据地址，供上传、AI 或导出使用；统一登记读取器以便卸载时中止。
 * @param {File|Blob} file PNG、JPEG 或 WebP 图片文件或读取到的图片内容。
 * @returns {Promise<string>} 图片数据地址。
 */
function readGarmentImage(file) {
    if (!IMAGE_TYPES.has(file.type)) throw new Error('仅支持 PNG、JPEG、WebP 图片。');
    return new Promise((resolve, reject) => {
        const reader = new window.parent.FileReader();
        imageReaders.add(reader);
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error(file.name ? `无法读取图片：${file.name}` : '无法读取图片。'));
        reader.onabort = () => reject(new Error('图片读取已取消。'));
        reader.onloadend = () => imageReaders.delete(reader);
        reader.readAsDataURL(file);
    });
}

/**
 * 使用原图 SHA-256 派生固定 UUID 文件名，再按原格式上传；同图跨导入复用路径，不重新压缩或裁剪。
 * @param {string} dataUrl 已在导入入口校验或由读取器生成的图片数据地址。
 * @param {string} [imageHash] 本批查重已算出的完整哈希，省去重复解码和摘要计算；其他入口自行计算。
 * @returns {Promise<string>} 当前酒馆用户目录中的图片相对路径。
 */
async function uploadGarmentImage(dataUrl, imageHash) {
    const [, format, image] = DATA_IMAGE_PATTERN.exec(dataUrl);
    const hash = imageHash ?? await hashGarmentImage(dataUrl);
    // 截取摘要前 128 位并设置 UUID v8 的版本与变体位；查重仍使用完整 SHA-256，不用截断值代替。
    const variant = ((parseInt(hash[16], 16) & 3) | 8).toString(16);
    const filename = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-8${hash.slice(13, 16)}-${variant}${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
    const response = await wardrobeFetch('/api/images/upload', {
        method: 'POST',
        headers: SillyTavern.getRequestHeaders(),
        body: JSON.stringify({ image, format: format === 'jpeg' ? 'jpg' : format, filename, ch_name: IMAGE_FOLDER }),
    });
    if (!response.ok) throw new Error(`图片保存失败（HTTP ${response.status}）。`);
    const path = String((await response.json()).path ?? '').replace(/^\//, '');
    if (!STORED_IMAGE_PATTERN.test(path)) throw new Error(`酒馆返回了无法识别的图片路径：${path}`);
    return path;
}

/**
 * 删除本插件中已无服装引用的图片，供删除、导入回滚和迁移失败共用。
 * @param {Iterable<string>} images 待清理的路径；空值、数据地址和其他目录不会删除。
 * @returns {Promise<void>} 清理结束；文件删除失败只记录日志，不撤销已保存的服装操作。
 */
async function deleteGarmentImages(images) {
    // 一次收集所有大分类的引用，避免清理当前分区时误删其他分区仍在使用的原图。
    const referenced = new Set();
    for (const item of garments.values()) for (const field of IMAGE_FIELDS) if (item[field]) referenced.add(item[field]);
    const saved = getVariables({ type: 'script' });
    for (const id of wardrobeLibraries.keys()) {
        if (id === activeLibraryId) continue;
        const data = id === 'default-1' ? saved : saved.wardrobe_library_data?.[id];
        for (const item of data?.wardrobe_items ?? []) for (const field of IMAGE_FIELDS) if (item[field]) referenced.add(item[field]);
    }
    for (const image of new Set(images)) {
        if (!image || referenced.has(image)) continue;
        removeCachedGarmentImage(imageDataCache, image);
        removeCachedGarmentImage(sendImageCache, image);
        if (!STORED_IMAGE_PATTERN.test(image)) continue;
        try {
            const response = await wardrobeFetch('/api/images/delete', {
                method: 'POST', headers: SillyTavern.getRequestHeaders(), body: JSON.stringify({ path: image }),
            });
            if (!response.ok && response.status !== 404) console.warn(`[衣柜插件] 删除图片失败（HTTP ${response.status}）：${image}`);
        } catch (error) { recordWardrobeLog('error', 'deleteGarmentImages：捕获异常', error); console.warn('[衣柜插件] 删除图片失败：', image, error); }
    }
}

/**
 * 移除指定图片的缓存引用，同时扣除已经计入的容量。
 * @param {{entries: Map, bytes: number}} cache 原图或参考图缓存。
 * @param {string} image 缓存使用的路径或数据地址。
 * @returns {void} 无返回值。
 */
function removeCachedGarmentImage(cache, image) {
    const entry = cache.entries.get(image);
    if (!entry) return;
    cache.entries.delete(image);
    cache.bytes -= entry.bytes;
}

/**
 * 共用进行中的读取任务，完成后按最近使用顺序保留已读图片，失败或单图超限时释放缓存引用。
 * @param {{entries: Map, bytes: number}} cache 原图或参考图缓存，各有独立容量上限。
 * @param {string} image 缓存使用的路径或数据地址。
 * @param {() => Promise<string>} load 实际读取或生成数据地址的任务。
 * @returns {Promise<string>} 图片数据地址。
 */
function loadCachedGarmentImage(cache, image, load) {
    const { entries } = cache;
    const cached = entries.get(image);
    if (cached) {
        entries.delete(image);
        entries.set(image, cached);
        return cached.pending;
    }
    const entry = { bytes: 0, pending: undefined };
    entry.pending = Promise.resolve().then(load).then(value => {
        // 删除图片或卸载后，早先发出的请求不能重新留下缓存。
        if (entries.get(image) !== entry) return value;
        // 按 UTF-16 估算字符串占用，旧存档以数据地址为键时也计入容量。
        const bytes = 2 * (value.length + (image === value ? 0 : image.length));
        if (bytes > IMAGE_CACHE_MAX_BYTES) removeCachedGarmentImage(cache, image);
        else {
            entry.bytes = bytes;
            cache.bytes += bytes;
            for (const [key, older] of entries) {
                if (cache.bytes <= IMAGE_CACHE_MAX_BYTES) break;
                // 仍在读取的条目不计容量，保留它们以合并同图并发请求。
                if (older.bytes) removeCachedGarmentImage(cache, key);
            }
        }
        return value;
    }).catch(error => {
        if (entries.get(image) === entry) removeCachedGarmentImage(cache, image);
        recordWardrobeLog('error', '读取服装图片失败', error);
        throw error;
    });
    entries.set(image, entry);
    return entry.pending;
}

/**
 * 仅在 AI 和备份需要图片内容时读取文件；列表及预览直接交给浏览器加载和缓存。
 * @param {string} image 已校验的图片路径、旧数据地址或空字符串。
 * @returns {Promise<string>} 原图数据地址，无图片时返回空字符串。
 */
async function loadImageDataUrl(image) {
    if (!STORED_IMAGE_PATTERN.test(image)) return image;
    return loadCachedGarmentImage(imageDataCache, image, async () => {
        const response = await wardrobeFetch(image, { signal: wardrobeReadController.signal });
        if (!response.ok) throw new Error(`读取图片失败（HTTP ${response.status}）：${image}，文件可能已被删除。`);
        const type = image.endsWith('.jpg') ? 'image/jpeg' : image.endsWith('.webp') ? 'image/webp' : 'image/png';
        // 静态文件响应的 MIME 可能是通用二进制，按已校验的扩展名恢复图片类型。
        return readGarmentImage(new window.parent.Blob([await response.blob()], { type }));
    });
}

/**
 * 按本轮设置发送原图或生成长边最多 1280 像素的参考图；小图仅在压缩后更小时替换。
 * @param {string} image 已校验的原图路径或旧数据地址。
 * @param {string} quality 已保存的图片发送方式。
 * @returns {Promise<string>} 要发送的图片数据地址。
 */
async function loadSendImageDataUrl(image, quality = sendSettings.image_quality) {
    if (quality === 'original') return loadImageDataUrl(image);
    return loadCachedGarmentImage(sendImageCache, image, async () => {
        const original = await loadImageDataUrl(image);
        if (wardrobeReadController.signal.aborted) throw new Error('图片读取已取消。');
        return new Promise((resolve, reject) => {
            const decoded = hostDocument.createElement('img');
            imageDecoders.add(decoded);
            decoded.onerror = () => {
                imageDecoders.delete(decoded);
                reject(new Error('无法解码服装图片，请替换为有效图片后重试。'));
            };
            decoded.onload = () => {
                imageDecoders.delete(decoded);
                try {
                    const scale = Math.min(1, SEND_IMAGE_MAX_EDGE / Math.max(decoded.naturalWidth, decoded.naturalHeight));
                    const canvas = hostDocument.createElement('canvas');
                    canvas.width = Math.max(1, Math.round(decoded.naturalWidth * scale));
                    canvas.height = Math.max(1, Math.round(decoded.naturalHeight * scale));
                    const context = canvas.getContext('2d');
                    // JPEG 不保留透明度，铺白底避免透明服装图被默认合成为黑底。
                    context.fillStyle = '#fff';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(decoded, 0, 0, canvas.width, canvas.height);
                    const compressed = canvas.toDataURL('image/jpeg', SEND_IMAGE_QUALITY);
                    resolve(scale < 1 || compressed.length < original.length ? compressed : original);
                } catch (error) { reject(error); }
            };
            decoded.src = original;
        });
    });
}

/**
 * 选择替换文件时记住目标 ID 和正背面，避免选择器关闭后替换到另一件服装或另一面。
 * @param {MouseEvent} event 正面或背面替换按钮的点击事件。
 * @returns {void} 打开单图选择器，取消选择不更改原图。
 */
function openImageReplacement(event) {
    const input = panel.querySelector('.tw-image-replace');
    input.dataset.garmentId = selectedGarmentId;
    input.dataset.imageField = event.currentTarget.dataset.imageField;
    input.click();
}

/**
 * 上传新图后只替换图片字段，保留服装 ID、归属和详情草稿；存档成功才清理旧文件。
 * @param {Event} event 单图选择器的变化事件。
 * @returns {Promise<void>} 替换或失败回收结束后完成。
 */
async function replaceGarmentImage(event) {
    const input = event.currentTarget;
    if (!input.files.length || replacingImage) return;
    const id = input.dataset.garmentId;
    const field = input.dataset.imageField;
    replacingImage = true;
    panel.querySelector('[data-action="replace-image"]').disabled = true;
    panel.querySelector('[data-action="replace-front-image"]').disabled = true;
    let uploaded;
    try {
        uploaded = await uploadGarmentImage(await readGarmentImage(input.files[0]));
        const item = garments.get(id);
        if (!root.isConnected || !item) throw new Error('服装已删除或衣柜已卸载，图片替换已取消。');
        const next = new Map(garments);
        next.set(id, { ...item, [field]: uploaded });
        commitGarments(next, selectedGarmentId, garmentGroups, false);
        if (id === selectedGarmentId) {
            stopDescriptionRequest();
            renderGarmentImage();
        }
        await deleteGarmentImages([item[field]]);
        setLibraryStatus(`${IMAGE_SIDE_LABELS[field]}图片已替换`);
    } catch (error) {
        recordWardrobeLog('error', 'replaceGarmentImage：捕获异常', error);
        if (uploaded) await deleteGarmentImages([uploaded]);
        if (root.isConnected) setLibraryStatus(String(error), true);
    } finally {
        replacingImage = false;
        input.value = '';
        if (root.isConnected) setDescriptionBusy(Boolean(descriptionRequest));
    }
}

/**
 * 启动时逐张迁移旧图片，上传和存档都成功才替换原数据；失败后下次启动继续。
 * @returns {Promise<void>} 迁移结束，失败通过提示说明，尚未迁移的原图保留在存档中。
 */
async function migrateLegacyImages() {
    const libraryId = activeLibraryId;
    const legacy = [];
    for (const item of garments.values()) {
        for (const field of IMAGE_FIELDS) if (DATA_IMAGE_PATTERN.test(item[field])) legacy.push({ id: item.id, field, image: item[field] });
    }
    let migrated = 0;
    for (const item of legacy) {
        if (!root.isConnected || activeLibraryId !== libraryId) break;
        let uploaded;
        try {
            uploaded = await uploadGarmentImage(item.image);
            const current = garments.get(item.id);
            // 上传期间可能切换大分类；只提交原分区仍在显示且原图未变的记录，其余留待下次迁移。
            if (!root.isConnected || activeLibraryId !== libraryId || current?.[item.field] !== item.image) {
                await deleteGarmentImages([uploaded]);
                continue;
            }
            const next = new Map(garments);
            next.set(item.id, { ...current, [item.field]: uploaded });
            commitGarments(next, selectedGarmentId, garmentGroups, false);
            migrated++;
        } catch (error) {
            recordWardrobeLog('error', 'migrateLegacyImages：捕获异常', error);
            if (uploaded) await deleteGarmentImages([uploaded]);
            if (root.isConnected) toastr.error(`${String(error)} 未迁移的原图仍保留，下次启动继续。`, '服装图片迁移未完成');
            break;
        }
    }
    if (migrated && root.isConnected) toastr.success(`已将 ${migrated} 张服装图片保存为文件。`, '衣柜插件');
}

/**
 * 保存成功后才更新内存和界面，存储失败时继续保留原有服装记录。
 * @param {Map<string, WardrobeItem>} next 待保存的完整服装表。
 * @param {string|null} selectedId 保存后选中的服装标识。
 * @param {Map<string, string>} groups 同次保存的标签。
 * @param {boolean} refreshDetails 是否重填详情；后台迁移和标签分配保留用户正在编辑的表单及识别请求。
 * @param {Map<string, Set<string>>} groupFilters 同次保存的筛选归属，只有显式归属才写入，兼容旧存档。
 * @returns {void} 无返回值。
 */
function commitGarments(next, selectedId, groups = garmentGroups, refreshDetails = true, groupFilters = garmentGroupFilters) {
    const saved = { wardrobe_items: Array.from(next.values()), wardrobe_groups: Array.from(groups, ([id, name]) => ({ id, name,
        ...(groupFilters.get(id)?.size ? { filters: Array.from(groupFilters.get(id)) } : {}) })) };
    // 只有删除服装才清理所有范围，普通编辑不扫描历史聊天；与服装在同次提交中保存，失败不留半份删除。
    if (next.size < garments.size) Object.assign(saved, pruneDeletedSelections(next));
    saveLibraryVariables(saved);
    recordWardrobeLog('info', '服装数据已保存', { library: activeLibraryId, items: next.size, groups: groups.size, selectedId });
    if (refreshDetails && (selectedId !== selectedGarmentId || IMAGE_FIELDS.some(field => next.get(selectedId)?.[field] !== garments.get(selectedGarmentId)?.[field]))) stopDescriptionRequest();
    garments = next;
    garmentGroups = groups;
    garmentGroupFilters = new Map(Array.from(groups.keys(), id => [id, groupFilters.get(id) ?? new Set()]));
    if (currentGroup !== '*' && currentGroup && !groups.has(currentGroup)) currentGroup = '';
    selectedGarmentId = selectedId;
    // 不影响详情内容的更新只重绘列表，保留尚未保存的名称、描述和当前识别请求。
    if (refreshDetails) refreshWardrobe();
    else renderGarmentLibrary();
}

/**
 * 打开与导入一致的导出弹窗，默认选择当前独立衣柜并保留全部服装的备份方式。
 * @returns {void} 只显示选择和数量，确认前不下载文件或保存详情草稿。
 */
function openWardrobeExport() {
    const select = panel.querySelector('[name="export_library"]');
    const options = hostDocument.createDocumentFragment();
    for (const [id, name] of wardrobeLibraries) {
        const option = hostDocument.createElement('option');
        option.value = id;
        option.textContent = name;
        options.append(option);
    }
    select.replaceChildren(options);
    select.value = activeLibraryId;
    panel.querySelector('[name="export_content"]').value = 'all';
    updateWardrobeExport();
    panel.querySelector('#tw-export-picker').showModal();
}

/**
 * 读取指定衣柜的已保存图文和标签，不切换用户当前浏览的衣柜或覆盖详情草稿。
 * @param {string} libraryId 导出弹窗选择的独立衣柜标识。
 * @returns {{items: Map<string, WardrobeItem>, groups: Map<string, string>, groupFilters: Map<string, Set<string>>}} 入口校验后的衣柜数据。
 */
function getWardrobeExportData(libraryId) {
    if (libraryId === activeLibraryId) return { items: garments, groups: garmentGroups, groupFilters: garmentGroupFilters };
    if (!wardrobeLibraries.has(libraryId)) throw new Error('请选择要导出的衣柜。');
    const saved = getLibraryVariables(libraryId);
    return parseWardrobeData({ items: saved.wardrobe_items ?? [], groups: saved.wardrobe_groups ?? [] });
}

/**
 * 判断服装是否已有实际描述；搭配必须同时保留有描述的全部成员，避免过滤后留下断开的关联。
 * @param {WardrobeItem} item 待检查的服装或搭配。
 * @param {Map<string, WardrobeItem>} items 当前导出衣柜的服装表。
 * @returns {boolean} 普通服装描述非空，或搭配正文与所有成员描述均非空时为真。
 */
function hasExportDescription(item, items) {
    return Boolean(getGarmentDescription(item, items).trim()) &&
        (!item.componentIds || item.componentIds.every(id => items.get(id).description.trim()));
}

/**
 * 按衣柜及内容选项预览数量，空描述和纯空白描述使用同一筛选规则；预览不读取原图。
 * @returns {void} 没有符合条件的服装时禁用确认按钮并显示原因。
 */
function updateWardrobeExport() {
    const status = panel.querySelector('.tw-export-status');
    const button = panel.querySelector('[data-action="confirm-export"]');
    status.textContent = '';
    try {
        const { items } = getWardrobeExportData(panel.querySelector('[name="export_library"]').value);
        const describedOnly = panel.querySelector('[name="export_content"]').value === 'described';
        let count = 0;
        for (const item of items.values()) if (!describedOnly || hasExportDescription(item, items)) count++;
        panel.querySelector('.tw-export-count').textContent = `将导出 ${count} / ${items.size} 件服装`;
        button.disabled = count === 0;
        if (!count) status.textContent = describedOnly && items.size ? '没有有描述的服装，请先识图并保存描述。' : '这个衣柜还没有服装。';
    } catch (error) {
        status.textContent = String(error);
        panel.querySelector('.tw-export-count').textContent = '';
        button.disabled = true;
    }
}

/**
 * 确认选择后沿用原图备份流程，导出失败时保留弹窗和选项供重试。
 * @param {SubmitEvent} event 导出表单提交事件。
 * @returns {Promise<void>} 下载完成或错误提示显示后恢复弹窗控件。
 */
async function confirmWardrobeExport(event) {
    event.preventDefault();
    const button = panel.querySelector('[data-action="confirm-export"]');
    if (button.disabled) return;
    const libraryId = panel.querySelector('[name="export_library"]').value;
    const describedOnly = panel.querySelector('[name="export_content"]').value === 'described';
    const dialog = panel.querySelector('#tw-export-picker');
    const controls = dialog.querySelectorAll('button, select');
    for (const control of controls) control.disabled = true;
    button.disabled = true;
    panel.querySelector('.tw-export-status').textContent = '正在导出…';
    let errorMessage = '';
    try {
        await exportGarments(null, true, { libraryId, describedOnly });
        closeWardrobeExport();
    } catch (error) {
        recordWardrobeLog('error', '导出衣柜失败', error);
        errorMessage = String(error);
    } finally {
        for (const control of controls) control.disabled = false;
        if (dialog.open) updateWardrobeExport();
        if (errorMessage) panel.querySelector('.tw-export-status').textContent = errorMessage;
    }
}

/**
 * 取消或完成导出时关闭弹窗，选择衣柜和筛选内容不会修改任何服装记录。
 * @returns {void} 无返回值。
 */
function closeWardrobeExport() {
    const dialog = panel.querySelector('#tw-export-picker');
    if (dialog.open) dialog.close();
}

/**
 * 把指定服装、搭配成员及对应标签打包成可独立恢复的文件，支持选择独立衣柜及只导出有描述的记录。
 * @param {Iterable<string>|null} ids 待导出的服装标识；弹窗传入 null 表示所选衣柜的全部服装。
 * @param {boolean} includeEmptyGroups 是否连同空标签一起备份。
 * @param {{libraryId?: string, describedOnly?: boolean}} options 弹窗的目标衣柜与描述筛选；省略时保留原有单件和多选导出行为。
 * @returns {Promise<void>} 图片读取完成并触发下载后结束。
 */
async function exportGarments(ids, includeEmptyGroups = false, options = {}) {
    const data = getWardrobeExportData(options.libraryId ?? activeLibraryId);
    const libraryName = options.libraryId ? wardrobeLibraries.get(options.libraryId) : undefined;
    const items = [];
    const groupIds = new Set();
    // 单独导出搭配时同时包含成员，确保文件可独立恢复；Set 避免共享单品重复打包。
    const exportIds = new Set(ids ?? data.items.keys());
    for (const id of exportIds) {
        const item = data.items.get(id);
        // 描述作为完成识图或手工整理的依据，不额外添加历史记录没有的识图状态字段。
        if (options.describedOnly && !hasExportDescription(item, data.items)) continue;
        if (item.componentIds) for (const memberId of item.componentIds) exportIds.add(memberId);
        items.push({ ...item, ...(item.componentIds ? { descriptionOverride: Boolean(item.descriptionOverride) } : {}) });
        for (const groupId of item.groupIds) groupIds.add(groupId);
    }
    if (!items.length) throw new Error(options.describedOnly ? '没有有描述的服装，请先识图并保存描述。' : '没有可导出的服装。');
    const groups = Array.from(includeEmptyGroups ? data.groups.keys() : groupIds, id => ({ id, name: data.groups.get(id),
        ...(data.groupFilters.get(id)?.size ? { filters: Array.from(data.groupFilters.get(id)) } : {}) }));
    // 先快照记录及标签再读取图片，导出期间切换选择或编辑不会混入本次备份。
    for (const item of items) for (const field of IMAGE_FIELDS) item[field] = await loadImageDataUrl(item[field] || '');
    if (!root.isConnected) throw new Error('衣柜已卸载，导出已取消。');
    const backup = { format: 'tw-wardrobe', version: 1, groups, items };
    const name = (libraryName ?? (items.length === 1 ? items[0].name : '衣柜')).replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
    downloadWardrobeJson(backup, `${name}-${items.length}件.json`);
    setLibraryStatus(`已导出 ${items.length} 件服装`);
}

/**
 * 下载服装或设置备份共用的 JSON 文件，复用最近下载地址的释放流程。
 * @param {Object} data 调用方已明确选取字段的备份数据。
 * @param {string} filename 下载时显示的文件名。
 * @returns {void} 触发浏览器下载，不读取脚本变量或 API 配置。
 */
function downloadWardrobeJson(data, filename) {
    const blob = new window.parent.Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    // 保留最近一次下载地址供浏览器异步读取，下次导出或卸载时释放，不引入延迟定时器。
    if (exportUrl) window.parent.URL.revokeObjectURL(exportUrl);
    exportUrl = window.parent.URL.createObjectURL(blob);
    const link = hostDocument.createElement('a');
    link.href = exportUrl;
    link.download = filename;
    link.hidden = true;
    hostDocument.body.append(link);
    try { link.click(); } finally { link.remove(); }
}

/**
 * 衣柜导出先打开选择弹窗；单件导出先保存编辑内容，删除和移除图片沿用原有流程。
 * @param {MouseEvent} event 操作按钮的点击事件。
 * @returns {Promise<void>} 所选操作结束后完成。
 */
async function handleGarmentAction(event) {
    try {
        const action = event.currentTarget.dataset.action;
        if (action === 'export-all') openWardrobeExport();
        else if (action === 'export-one') {
            if (saveSelectedGarment()) await exportGarments([selectedGarmentId]);
        } else if (action === 'delete-one') await deleteGarments(new Set([selectedGarmentId]));
        else if (action === 'remove-image') {
            const item = garments.get(selectedGarmentId);
            const selections = readWearerSelections();
            if (sendSettings.content_type !== 'text' && (selections.user.has(item.id) || selections.char.has(item.id))) {
                throw new Error('这件服装正在以图片模式应用，请先取消应用或切换为文字模式，再删除图片。');
            }
            if (!await askConfirm('删除图片', '删除这件服装的正面和背面图片？名称和描述会保留。', { confirmText: '删除图片', danger: true })) return;
            const saved = saveSelectedGarment();
            if (!saved) return;
            const next = new Map(garments);
            next.set(item.id, { ...saved, image: '', backImage: '' });
            validateAppliedGarmentChanges(new Set([item.id]), next);
            commitGarments(next, item.id);
            void deleteGarmentImages(IMAGE_FIELDS.map(field => item[field]));
            setLibraryStatus('图片已删除，名称和描述已保留');
        }
    } catch (error) {
        recordWardrobeLog('error', 'handleGarmentAction：捕获异常', error);
        setLibraryStatus(String(error), true);
        setGarmentStatus(String(error), true);
    }
}

/**
 * 删除前阻止留下悬空搭配，删除成功时清理所有范围的应用选择，再回收无引用的原图。
 * @param {Set<string>} ids 待删除的服装标识集合。
 * @returns {Promise<void>} 确认后删除并安排回收图片。
 */
async function deleteGarments(ids) {
    for (const item of garments.values()) {
        if (!ids.has(item.id) && item.componentIds?.some(id => ids.has(id))) {
            throw new Error(`所选服装仍被搭配“${item.name}”使用，请先编辑该搭配移除成员，或一并删除搭配。`);
        }
    }
    const draftWarning = ids.has(selectedGarmentId) && hasDetailsDraft() ? '\n当前服装未保存的详情修改也会丢弃。' : '';
    if (!ids.size || !await askConfirm('删除服装', `删除所选的 ${ids.size} 件服装及其图片？\n此操作不可撤销。${draftWarning}`, { confirmText: '删除', danger: true })) return;
    const next = new Map(garments);
    const removedImages = [];
    for (const id of ids) {
        for (const field of IMAGE_FIELDS) removedImages.push(next.get(id)[field]);
        next.delete(id);
    }
    const selectedId = next.has(selectedGarmentId) ? selectedGarmentId : next.keys().next().value ?? null;
    commitGarments(next, selectedId, garmentGroups, selectedId !== selectedGarmentId || !hasDetailsDraft());
    // 先保存删除结果，再清理不再被引用的文件，存档失败时仍可继续查看原图。
    void deleteGarmentImages(removedImages);
    setLibraryStatus(`已删除 ${ids.size} 件服装`);
}

/**
 * 直接打开搭配编辑器，新建时可选地带入已有勾选，编辑时读取原搭配并保留当前详情草稿。
 * @param {MouseEvent} event 顶部新建或详情编辑按钮的点击事件，通过按钮动作区分两种入口。
 * @returns {void} 仅填充模态框，保存前不修改服装和应用选择。
 */
function openCombinationEditor(event) {
    const item = event.currentTarget.dataset.action === 'edit-combination' ? garments.get(selectedGarmentId) : undefined;
    const selected = new Set();
    for (const id of item?.componentIds ?? checkedGarmentIds) {
        const garment = garments.get(id);
        for (const member of getGarmentMembers(garment)) selected.add(member.id);
    }
    const dialog = panel.querySelector('#tw-combination-editor');
    dialog.dataset.garmentId = item?.id ?? '';
    dialog.querySelector('[name="combination_name"]').value = item ? panel.querySelector('[name="garment_name"]').value : '新搭配';
    const rows = dialog.querySelector('.tw-combination-items');
    rows.replaceChildren();
    // 已选成员先按保存顺序排列；新增候选沿用衣柜原顺序。
    for (const id of new Set([...selected, ...garments.keys()])) {
        const garment = garments.get(id);
        if (garment.componentIds) continue;
        const row = hostDocument.createElement('div');
        row.className = 'tw-combination-item';
        const checkbox = hostDocument.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `tw-combination-member-${rows.children.length}`;
        checkbox.value = garment.id;
        checkbox.checked = selected.has(garment.id);
        const choice = hostDocument.createElement('label');
        choice.className = 'tw-combination-choice';
        choice.htmlFor = checkbox.id;
        if (garment.image || garment.backImage) {
            const image = hostDocument.createElement('img');
            image.src = garment.image || garment.backImage;
            image.alt = '';
            image.loading = 'lazy';
            image.draggable = false;
            choice.append(image);
        }
        const name = hostDocument.createElement('span');
        name.textContent = `${garment.name} · ${CATEGORY_LABELS.get(garment.category)}`;
        choice.append(name);
        row.append(checkbox, choice);
        appendDraftSortControls(row, garment.name);
        rows.append(row);
    }
    dialog.querySelector('.tw-combination-status').textContent = '';
    dialog.showModal();
}

/** 关闭搭配编辑器并丢弃未提交的成员选择；无参数，无返回值。 */
function closeCombinationEditor() {
    const dialog = panel.querySelector('#tw-combination-editor');
    if (dialog.open) dialog.close();
}

/**
 * 一次保存搭配及成员关系，保留用户编辑的整段描述；未编辑描述时继续引用成员，不复制原图。
 * @param {SubmitEvent} event 搭配表单提交事件。
 * @returns {Promise<void>} 保存成功后显示搭配详情，失败保留编辑内容。
 */
async function saveCombination(event) {
    event.preventDefault();
    const dialog = panel.querySelector('#tw-combination-editor');
    try {
        const name = dialog.querySelector('[name="combination_name"]').value.trim();
        const componentIds = [];
        for (const input of dialog.querySelectorAll('.tw-combination-items input:checked')) {
            // 模态框打开期间可能删除记录；在这一个编辑入口确认成员仍存在。
            if (!garments.has(input.value) || garments.get(input.value).componentIds) throw new Error('搭配成员已变化，请重新打开编辑器。');
            componentIds.push(input.value);
        }
        if (!name || !componentIds.length) throw new Error('请填写搭配名称，并至少选择一件服装。');
        const previous = garments.get(dialog.dataset.garmentId);
        if (!previous && hasDetailsDraft() && !await confirmDiscardDetails()) return;
        const id = previous?.id ?? window.parent.crypto.randomUUID();
        const item = { id, name, category: 'outfits', description: '', image: '', groupIds: currentGroup && currentGroup !== '*' ? [currentGroup] : [],
            contentRating: 'unrated', favorite: false, lastUsedAt: 0, ...previous, componentIds };
        item.name = name;
        if (previous) {
            item.category = panel.querySelector('[name="garment_category"]').value;
            item.contentRating = panel.querySelector('[name="garment_content_rating"]').value;
            Object.assign(item, readGarmentDescriptionDraft(previous));
        }
        const next = new Map(garments);
        next.set(id, item);
        const selections = readWearerSelections();
        if (selections.user.has(id) || selections.char.has(id)) buildWardrobeContent(item, sendSettings, next);
        commitGarments(next, id);
        closeCombinationEditor();
        checkedGarmentIds.clear();
        multiSelectMode = false;
        currentGroup = '*';
        updateCategory('combinations');
        panel.querySelector('[data-detail="description"]').click();
        setMobileDetails(true);
        setGarmentStatus('搭配已保存');
    } catch (error) { recordWardrobeLog('error', 'saveCombination：捕获异常', error); dialog.querySelector('.tw-combination-status').textContent = String(error); }
}

/**
 * 解析一套穿搭包含的实际服装，普通套装与单品均可直接成为搭配成员。
 * @param {WardrobeItem} item 已在存档或编辑入口校验的服装／搭配。
 * @param {Map<string, WardrobeItem>} items 成员所在服装表，保存前验证可传入待提交表。
 * @returns {WardrobeItem[]} 按保存顺序排列的实际服装。
 */
function getGarmentMembers(item, items = garments) {
    return item.componentIds ? item.componentIds.map(id => items.get(id)) : [item];
}

/**
 * 获取对话使用的内容分级，搭配不能用自身的 SFW 标记盖过 NSFW 成员。
 * @param {WardrobeItem} item 普通服装或搭配。
 * @param {Map<string, WardrobeItem>} items 成员所在服装表。
 * @returns {string} 可直接加入候选清单的分级文字。
 */
function getGarmentContentRating(item, items = garments) {
    if (item.contentRating === 'nsfw' || (item.componentIds && getGarmentMembers(item, items).some(member => member.contentRating === 'nsfw'))) return 'NSFW（色情／成人服装）';
    return item.contentRating === 'sfw' ? 'SFW（日常／非色情服装）' : '未标注';
}

/**
 * 未编辑的搭配自动合并成员描述；用户整段编辑后使用保存的正文，旧补充说明继续保留在合并结果中。
 * @param {WardrobeItem} item 普通服装或搭配。
 * @param {Map<string, WardrobeItem>} items 成员所在服装表。
 * @returns {string} 模板使用的完整描述，保留成员名称与分类对应关系。
 */
function getGarmentDescription(item, items = garments) {
    if (!item.componentIds || item.descriptionOverride) return item.description;
    const lines = item.description ? [item.description] : [];
    for (const member of getGarmentMembers(item, items)) lines.push(`${member.name}（${CATEGORY_LABELS.get(member.category)}）：${member.description}`);
    return lines.join('\n');
}

/**
 * 读取唯一描述编辑框，未改动自动合并正文时保留引用，改动时保存为整套正文，避免重复追加成员描述。
 * @param {WardrobeItem} item 编辑前的服装或搭配，调整成员时也以原记录判断描述是否被修改。
 * @param {string} description 已解析的描述正文；省略时读取编辑框。
 * @returns {{description: string, descriptionOverride?: boolean}} 待合并到服装记录的描述字段。
 */
function readGarmentDescriptionDraft(item, description = panel.querySelector('[name="garment_description"]').value.trim()) {
    if (!item.componentIds) return { description };
    if (description === getGarmentDescription(item).trim()) return { description: item.description };
    return { description, descriptionOverride: true };
}

/**
 * 在删除或跨衣柜移动时清理全局、角色卡和聊天选择及当前穿着，保留锚点与显式空选择。
 * @param {Map<string, WardrobeItem>} remaining 原衣柜操作后仍存在的服装表。
 * @returns {Object} 随服装变更一次写入的全局及独立范围选择补丁。
 */
function pruneDeletedSelections(remaining) {
    const variables = getLibraryVariables();
    const scoped = variables.wardrobe_scoped_selections;
    const records = new Map(scoped && typeof scoped === 'object' ? Object.entries(scoped) : []);
    const saved = { wardrobe_scoped_selections: {} };
    if (variables.wardrobe_active_id != null && !remaining.has(variables.wardrobe_active_id)) saved.wardrobe_active_id = null;
    // 全局项单独处理，不能把未迁移的全局选择写成空值，否则会阻断旧存档迁移。
    if (variables.wardrobe_selections !== undefined) records.set('global', variables.wardrobe_selections);
    for (const [key, record] of records) {
        const cleaned = { user: [], char: [], current: { user: [], char: [] }, anchor: { user: null, char: null } };
        for (const wearer of WEARERS) {
            // 同时过滤归属和当前穿着，防止当前指向已删除或未分配给该角色的服装。
            const ids = new Set();
            if (Array.isArray(record?.[wearer])) {
                for (const id of record[wearer]) if (remaining.has(id)) ids.add(id);
            }
            cleaned[wearer] = Array.from(ids);
            cleaned.current[wearer] = Array.from(normalizeCurrentOutfit(record?.current?.[wearer], ids, remaining));
            cleaned.anchor[wearer] = normalizeAnchor(record?.anchor?.[wearer]);
        }
        if (key === 'global') saved.wardrobe_selections = cleaned;
        else saved.wardrobe_scoped_selections[key] = cleaned;
    }
    return saved;
}

/**
 * 同名复用标签；列表入口创建后切换筛选，详情入口创建并勾选到当前服装，保留编辑草稿。
 * @param {MouseEvent} [event] 创建按钮事件；省略时按列表入口处理。
 * @returns {void} 无返回值。
 */
async function addGarmentGroup(event) {
    const fromDetails = event?.currentTarget.dataset.action === 'add-garment-group';
    const search = panel.querySelector('.tw-tag-search');
    const name = (await askDialog({ title: '新增标签', message: '标签可用于筛选和整理服装。', input: fromDetails ? search.value.trim() : '', confirmText: '创建' }))?.trim();
    if (!name) return;
    try {
        let id;
        for (const [groupId, label] of garmentGroups) if (label === name) id = groupId;
        id ??= window.parent.crypto.randomUUID();
        const groups = new Map(garmentGroups);
        groups.set(id, name);
        const filters = new Map(garmentGroupFilters);
        filters.set(id, new Set([...(filters.get(id) ?? []), currentCategory]));
        const next = new Map(garments);
        if (fromDetails) {
            const item = garments.get(selectedGarmentId);
            // 标签和服装归属一次保存，失败时不留下空标签，也不提交名称、描述草稿。
            next.set(item.id, { ...item, groupIds: Array.from(new Set([...item.groupIds, id])) });
        }
        commitGarments(next, selectedGarmentId, groups, false, filters);
        if (fromDetails) {
            window.parent.clearTimeout(garmentTagSearchTimer);
            search.value = '';
            filterGarmentGroupOptions();
            search.focus();
            setGarmentStatus('标签已保存');
        } else {
            currentGroup = id;
            renderGarmentLibrary();
        }
    } catch (error) {
        recordWardrobeLog('error', 'addGarmentGroup：捕获异常', error);
        if (fromDetails) setGarmentStatus(String(error), true);
        else setLibraryStatus(String(error), true);
    }
}

/**
 * 只填充当前筛选的标签与操作控件；每次打开时重新建立编辑草稿并清除删除勾选。
 * @returns {void} 打开原生标签管理对话框。
 */
function openGarmentGroupManager() {
    const rows = panel.querySelector('.tw-group-rows');
    rows.replaceChildren();
    for (const [id, name] of getFilterGarmentGroups()) {
        const row = hostDocument.createElement('div');
        row.className = 'tw-group-row';
        row.dataset.groupId = id;
        const checkLabel = hostDocument.createElement('label');
        checkLabel.className = 'tw-group-check';
        const checkbox = hostDocument.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.setAttribute('aria-label', `选择标签：${name}`);
        checkLabel.append(checkbox);
        const input = hostDocument.createElement('input');
        input.type = 'text';
        input.value = name;
        input.required = true;
        input.setAttribute('aria-label', `标签名称：${name}`);
        row.append(checkLabel, input);
        appendDraftSortControls(row, `标签${name}`);
        rows.append(row);
    }
    panel.querySelector('.tw-group-status').textContent = '';
    updateGarmentGroupSelection();
    panel.querySelector('#tw-group-manager').showModal();
}

/**
 * 同步删除工具栏和全选框的半选状态；直接读取表单，排序后勾选仍随原行保留。
 * @param {Event} [event] 复选框变化事件；不传时只根据当前行刷新状态。
 * @returns {void} 只更新表单，不写入存档。
 */
function updateGarmentGroupSelection(event) {
    if (event && event.target.type !== 'checkbox') return;
    const selectAll = panel.querySelector('.tw-group-select-all');
    const checkboxes = panel.querySelectorAll('.tw-group-check input');
    let selected = 0;
    for (const checkbox of checkboxes) {
        if (event?.target === selectAll) checkbox.checked = selectAll.checked;
        if (checkbox.checked) selected++;
    }
    selectAll.checked = selected > 0 && selected === checkboxes.length;
    selectAll.indeterminate = selected > 0 && selected < checkboxes.length;
    panel.querySelector('.tw-group-selection-count').textContent = `已选 ${selected} 个`;
    panel.querySelector('[data-action="delete-groups"]').disabled = selected === 0;
}

/**
 * 确认后一次提交当前筛选的所选标签；其余行保留原节点，避免丢失未保存的名称或顺序。
 * @returns {Promise<void>} 保存失败保留原勾选，便于直接重试。
 */
async function deleteManagedGarmentGroups() {
    const rows = panel.querySelectorAll('.tw-group-row');
    const selected = Array.from(rows).filter(row => row.querySelector('input[type="checkbox"]').checked);
    if (!selected.length) return;
    const count = selected.length;
    const scope = currentCategory === 'all' ? '当前衣柜' : `「${CATEGORY_LABELS.get(currentCategory)}」筛选`;
    if (!await askConfirm('删除所选标签', `将从${scope}移除 ${count} 个标签。服装会保留。`, { confirmText: `删除 ${count} 个标签`, danger: true })) return;
    const status = panel.querySelector('.tw-group-status');
    try {
        saveFilterGarmentGroups(new Map(selected.map(row => [row.dataset.groupId, null])));
    } catch (error) {
        recordWardrobeLog('error', 'deleteManagedGarmentGroups：捕获异常', error);
        status.dataset.error = 'true';
        status.textContent = String(error);
        return;
    }
    for (const row of selected) row.remove();
    const message = `已删除 ${count} 个标签`;
    if (count === rows.length) {
        closeGarmentGroupManager();
        panel.querySelector('[data-action="add-group"]').focus();
        setLibraryStatus(message);
    } else {
        updateGarmentGroupSelection();
        panel.querySelector('.tw-group-select-all').focus();
        status.dataset.error = 'false';
        status.textContent = message;
    }
}

/**
 * 关闭标签管理而不提交表单，原生对话框恢复触发按钮的焦点。
 * @returns {void} 无返回值。
 */
function closeGarmentGroupManager() {
    const dialog = panel.querySelector('#tw-group-manager');
    if (dialog.open) dialog.close();
}

/**
 * 为排序行添加拖动把手和可通过键盘、触屏操作的上下移按钮。
 * @param {HTMLElement} row 标签或搭配成员草稿行。
 * @param {string} name 用于标识当前排序项的名称。
 * @returns {void} 无返回值。
 */
function appendDraftSortControls(row, name) {
    row.dataset.sortRow = '';
    const handle = hostDocument.createElement('span');
    handle.dataset.sortHandle = '';
    handle.draggable = true;
    handle.textContent = '⠿';
    handle.title = `拖动排序：${name}`;
    handle.setAttribute('aria-hidden', 'true');
    row.append(handle);
    for (const [direction, label] of [['up', '上移'], ['down', '下移']]) {
        const button = hostDocument.createElement('button');
        button.type = 'button';
        button.dataset.sortMove = direction;
        button.textContent = direction === 'up' ? '↑' : '↓';
        button.setAttribute('aria-label', `${label}${name}`);
        row.append(button);
    }
}

/**
 * 仅移动原表单节点，保留尚未保存的名称、勾选和按钮焦点。
 * @param {MouseEvent} event 排序按钮点击事件。
 * @returns {void} 不写入存档。
 */
function reorderDraftRow(event) {
    const button = event.target.closest('[data-sort-move]');
    if (!button) return;
    const row = button.closest('[data-sort-row]');
    if (button.dataset.sortMove === 'up') row.previousElementSibling?.before(row);
    else row.nextElementSibling?.after(row);
    button.focus();
}

/**
 * 清除拖动引用和插入提示，取消拖动或关闭弹窗时不改变行顺序。
 * @returns {void} 无返回值。
 */
function clearDraftDrag() {
    if (sortDropRow) delete sortDropRow.dataset.dropPosition;
    sortDropRow = draggedSortRow = undefined;
}

/**
 * 仅接收同一编辑器内从把手开始的拖动；按目标行上下半区决定放置方向。
 * @param {DragEvent} event 两个排序容器共享的原生拖放事件。
 * @returns {void} 放下时移动草稿行，文件拖放继续交给衣柜面板。
 */
function dragDraftRow(event) {
    const list = event.currentTarget;
    const row = event.target.closest('[data-sort-row]');
    if (event.type === 'dragstart') {
        if (!event.target.closest('[data-sort-handle]')) return;
        clearDraftDrag();
        draggedSortRow = row;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('application/x-wardrobe-sort', '');
        return;
    }
    if (draggedSortRow?.parentElement !== list) return;
    if (event.type === 'dragend') {
        clearDraftDrag();
        return;
    }
    if (event.type === 'dragleave') {
        if (sortDropRow && !list.contains(event.relatedTarget)) {
            delete sortDropRow.dataset.dropPosition;
            sortDropRow = undefined;
        }
        return;
    }
    if (sortDropRow && sortDropRow !== row) {
        delete sortDropRow.dataset.dropPosition;
        sortDropRow = undefined;
    }
    if (!row || row === draggedSortRow) {
        if (event.type === 'drop') clearDraftDrag();
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    const { top, height } = row.getBoundingClientRect();
    const position = event.clientY < top + height / 2 ? 'before' : 'after';
    if (event.type === 'drop') {
        row[position](draggedSortRow);
        clearDraftDrag();
    } else {
        event.dataTransfer.dropEffect = 'move';
        sortDropRow = row;
        if (row.dataset.dropPosition !== position) row.dataset.dropPosition = position;
    }
}

/**
 * 在表单入口校验非空，按行顺序保存当前筛选；同名合并并保留全部服装关联。
 * @param {SubmitEvent} event 标签编辑表单提交事件。
 * @returns {void} 保存成功关闭对话框，失败保留编辑内容。
 */
function saveGarmentGroups(event) {
    event.preventDefault();
    const status = panel.querySelector('.tw-group-status');
    try {
        const edits = new Map();
        for (const row of panel.querySelectorAll('.tw-group-row')) {
            const name = row.querySelector('input[type="text"]').value.trim();
            if (!name) throw new Error('标签名称不能为空。');
            edits.set(row.dataset.groupId, name);
        }
        saveFilterGarmentGroups(edits);
        closeGarmentGroupManager();
        setLibraryStatus('标签名称与顺序已保存');
    } catch (error) {
        recordWardrobeLog('error', 'saveGarmentGroups：捕获异常', error);
        status.dataset.error = 'true';
        status.textContent = String(error);
    }
}

/**
 * 删除当前筛选中的标签与相关服装归属；“全部”才删除整个标签，其他筛选的数据保留。
 * @param {MouseEvent} [event] 标签关闭按钮的点击事件。
 * @returns {void} 无返回值。
 */
async function deleteGarmentGroup(event) {
    const button = event?.target.closest('[data-delete-group]');
    if (event && !button) return;
    const groupId = button ? button.dataset.deleteGroup : currentGroup;
    if (!garmentGroups.has(groupId) || !await askConfirm('删除标签', `删除标签“${garmentGroups.get(groupId)}”？\n服装及其他标签将保留。`, { confirmText: '删除标签', danger: true })) return;
    try {
        saveFilterGarmentGroups(new Map([[groupId, null]]));
        setLibraryStatus('标签已删除');
    } catch (error) { recordWardrobeLog('error', 'deleteGarmentGroup：捕获异常', error); setLibraryStatus(String(error), true); }
}

/**
 * 保存当前筛选的重命名、排序或删除；共享标签先分离当前范围，再统一合并同名结果。
 * @param {Map<string, string|null>} edits 按显示顺序排列的标签名称，null 表示删除。
 * @returns {void} 保存失败抛出异常，内存和存档保持原样。
 */
function saveFilterGarmentGroups(edits) {
    const groups = new Map(garmentGroups);
    const filters = new Map(garmentGroupFilters);
    const next = new Map(garments);
    const selections = readWearerSelections();
    const affected = new Set();
    const remaining = new Set();
    // 每件服装只判断一次所属范围，避免每编辑一个标签都重新扫描整柜。
    for (const [id, item] of garments) {
        if (matchesGarmentFilter(item, currentCategory, selections)) affected.add(id);
        else for (const groupId of item.groupIds) remaining.add(groupId);
    }
    const replacements = new Map();
    const order = new Map();
    for (const [id, name] of edits) {
        if (name === groups.get(id)) { order.set(id, name); continue; }
        const scopes = new Set(filters.get(id));
        scopes.delete(currentCategory);
        const keepSource = currentCategory !== 'all' && (remaining.has(id) || scopes.size > 0);
        if (keepSource) filters.set(id, scopes);
        else { groups.delete(id); filters.delete(id); }
        const target = name === null ? null : keepSource ? window.parent.crypto.randomUUID() : id;
        replacements.set(id, target);
        if (target !== null) {
            groups.set(target, name);
            filters.set(target, currentCategory === 'all' ? new Set(garmentGroupFilters.get(id)) : new Set([currentCategory]));
            order.set(target, name);
        }
    }
    for (const id of affected) {
        const item = garments.get(id);
        if (!item.groupIds.some(groupId => replacements.has(groupId))) continue;
        const groupIds = new Set();
        for (const groupId of item.groupIds) {
            const target = replacements.has(groupId) ? replacements.get(groupId) : groupId;
            if (target !== null) groupIds.add(target);
        }
        next.set(id, { ...item, groupIds: Array.from(groupIds) });
    }
    // 表单中的标签按新顺序排列，其余筛选的标签继续保留原来的相对顺序。
    for (const [id, name] of groups) if (!order.has(id)) order.set(id, name);
    const merged = mergeNamedGarmentGroups(next, order, filters);
    const previous = replacements.has(currentGroup) ? replacements.get(currentGroup) : currentGroup;
    const selected = merged.aliases.get(previous) ?? '*';
    commitGarments(merged.items, selectedGarmentId, merged.groups, false, merged.groupFilters);
    currentGroup = previous === '' ? '' : selected;
    renderGarmentLibrary();
}

/**
 * 切换标签筛选；全选始终只作用于当前标签和分类下可见的服装。
 * @param {MouseEvent} event 标签导航点击事件。
 * @returns {void} 无返回值。
 */
function selectGarmentGroup(event) {
    const button = event.target.closest('[data-group]');
    if (!button) return;
    currentGroup = button.dataset.group;
    checkedGarmentIds.clear();
    renderGarmentLibrary();
}

/**
 * 每次勾选仅增减一个标签并立即保存，不提交名称或描述草稿；全部取消即未分组。
 * @param {Event} event 标签区域内复选框的变化事件。
 * @returns {void} 保存失败时恢复原勾选并显示错误。
 */
function assignGarmentGroup(event) {
    const input = event.target;
    const item = garments.get(selectedGarmentId);
    const groupIds = new Set(item.groupIds);
    if (input.checked) groupIds.add(input.value);
    else groupIds.delete(input.value);
    const next = new Map(garments);
    next.set(item.id, { ...item, groupIds: Array.from(groupIds) });
    try {
        commitGarments(next, item.id, garmentGroups, false);
        setGarmentStatus('标签已保存');
    } catch (error) {
        recordWardrobeLog('error', 'assignGarmentGroup：捕获异常', error);
        syncGarmentGroupSelection();
        setGarmentStatus(String(error), true);
    }
}

/**
 * 恢复勾选、已选名称与数量及禁用状态；摘要限一行，完整名称保留在提示中，不触碰搜索和其他草稿。
 * @returns {void} 无返回值。
 */
function syncGarmentGroupSelection() {
    const item = garments.get(selectedGarmentId);
    const selected = new Set(item?.groupIds);
    const fieldset = panel.querySelector('[name="garment_group"]');
    fieldset.disabled = !item || Boolean(descriptionRequest);
    panel.querySelector('[data-action="add-garment-group"]').disabled = fieldset.disabled;
    for (const input of fieldset.querySelectorAll('input')) input.checked = selected.has(input.value);
    const names = Array.from(selected, id => garmentGroups.get(id));
    const summary = panel.querySelector('.tw-tag-summary');
    summary.textContent = selected.size ? `已选 ${selected.size} 个：${names.slice(0, 3).join('、')}${selected.size > 3 ? '…' : ''}` : '选择标签';
    summary.title = names.join('、');
}

/**
 * 只隐藏不匹配的下拉选项，不改勾选与服装列表；搜索中的已选标签仍保留归属。
 * @returns {void} 无返回值。
 */
function filterGarmentGroupOptions() {
    const keyword = panel.querySelector('.tw-tag-search').value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const row of panel.querySelector('[name="garment_group"]').children) {
        row.hidden = !row.dataset.searchText.includes(keyword);
        if (!row.hidden) visible++;
    }
    panel.querySelector('.tw-tag-empty').hidden = visible !== 0;
}

/**
 * 管理下拉的搜索、焦点与关闭；连续输入合并筛选，Escape 只收起下拉而不关闭衣柜。
 * @param {Event|KeyboardEvent} event 搜索、展开、键盘或面板点击事件。
 * @returns {void} 收起时清除搜索和待执行的筛选，重新展开可查看全部标签。
 */
function handleGarmentTagPicker(event) {
    const picker = panel.querySelector('.tw-tag-picker');
    const search = panel.querySelector('.tw-tag-search');
    if (event.type === 'input') {
        window.parent.clearTimeout(garmentTagSearchTimer);
        // 数百个选项逐行更新可见性时合并连续输入；清空立即恢复，避免搜索框空白但列表仍被过滤。
        if (search.value) garmentTagSearchTimer = window.parent.setTimeout(filterGarmentGroupOptions, 100);
        else filterGarmentGroupOptions();
        return;
    }
    if (event.type === 'keydown') {
        if (event.key !== 'Escape' || !picker.open) return;
        event.preventDefault();
        event.stopPropagation();
        picker.open = false;
        picker.querySelector('summary').focus();
    } else if (event.type === 'click') {
        if (!picker.open || picker.contains(event.target)) return;
        picker.open = false;
    } else if (picker.open) {
        search.focus();
        return;
    }
    window.parent.clearTimeout(garmentTagSearchTimer);
    search.value = '';
    filterGarmentGroupOptions();
}

/**
 * 汇总当前筛选显式保存的空标签和其服装实际使用的标签，不让搜索暂时隐藏分组。
 * @param {string} filter 分类或快捷筛选，默认为当前筛选；“全部”返回完整标签表。
 * @param {Object} [selections] 当前角色归属，刷新列表时复用已读取的归属。
 * @returns {Map<string, string>} 按持久顺序排列且名称唯一的分组。
 */
function getFilterGarmentGroups(filter = currentCategory, selections) {
    if (filter === 'all') return garmentGroups;
    const ids = new Set();
    for (const [id, filters] of garmentGroupFilters) if (filters.has(filter)) ids.add(id);
    selections ??= readWearerSelections();
    for (const item of garments.values()) {
        if (matchesGarmentFilter(item, filter, selections)) for (const id of item.groupIds) ids.add(id);
    }
    const groups = new Map();
    for (const [id, name] of garmentGroups) if (ids.has(id)) groups.set(id, name);
    return groups;
}

/**
 * 同步当前筛选的标签导航；详情仍显示完整标签表以保留跨分类的服装标签。
 * 标签集合未变化时保留详情选项节点、搜索和焦点。
 * @param {Object} selections 列表本次读取的角色归属。
 * @returns {void} 无返回值。
 */
function renderGarmentGroups(selections) {
    const groups = getFilterGarmentGroups(currentCategory, selections);
    if (currentGroup && currentGroup !== '*' && !groups.has(currentGroup)) currentGroup = '*';
    selectedGroupByFilter.set(currentCategory, currentGroup);
    const manageButton = panel.querySelector('[data-action="manage-groups"]');
    manageButton.disabled = groups.size === 0;
    const tabs = hostDocument.createDocumentFragment();
    for (const [id, name] of [['*', '全部'], ['', '未分组'], ...groups]) {
        const button = hostDocument.createElement('button');
        button.type = 'button';
        button.dataset.group = id;
        button.textContent = name;
        button.setAttribute('aria-pressed', String(id === currentGroup));
        if (garmentGroups.has(id)) {
            const tab = hostDocument.createElement('span');
            tab.className = 'tw-group-tab';
            tab.dataset.active = String(id === currentGroup);
            const remove = hostDocument.createElement('button');
            remove.type = 'button';
            remove.dataset.deleteGroup = id;
            remove.setAttribute('aria-label', `删除标签${name}`);
            remove.title = `删除标签${name}`;
            remove.innerHTML = icon('close');
            tab.append(button, remove);
            tabs.append(tab);
        } else tabs.append(button);
    }
    // 只替换可滚动的标签，固定区的管理按钮保留原节点、点击监听和禁用状态。
    panel.querySelector('.tw-group-tabs').replaceChildren(tabs);
    const fieldset = panel.querySelector('[name="garment_group"]');
    const labels = Array.from(garmentGroups);
    const inputs = fieldset.querySelectorAll('input');
    // 列表每次刷新都经过这里；只在标签名称或顺序变化时重建，保证连续勾选和键盘焦点稳定。
    if (inputs.length !== labels.length || labels.some(([id, name], index) => inputs[index].value !== id || inputs[index].getAttribute('aria-label') !== name)) {
        fieldset.replaceChildren();
        for (const [id, name] of labels) {
            const label = hostDocument.createElement('label');
            // 名称只在标签变更时归一化，搜索数百个选项时复用，避免逐次读取和转换 DOM 文本。
            label.dataset.searchText = name.toLocaleLowerCase();
            const input = hostDocument.createElement('input');
            input.type = 'checkbox';
            input.value = id;
            input.setAttribute('aria-label', name);
            const text = hostDocument.createElement('span');
            text.textContent = name;
            label.append(input, text);
            fieldset.append(label);
        }
        filterGarmentGroupOptions();
    }
    syncGarmentGroupSelection();
}

/**
 * 切换卡片多选；退出时清空勾选并收起操作栏，保留单件预览和已应用的服装。
 * @returns {void} 无返回值。
 */
function toggleMultiSelect() {
    multiSelectMode = !multiSelectMode;
    if (!multiSelectMode) checkedGarmentIds.clear();
    renderBulkState();
}

/**
 * 勾选独立于预览选择，不因批量勾选在手机上跳入详情页。
 * @param {Event} event 服装复选框变化事件。
 * @returns {void} 无返回值。
 */
function checkGarment(event) {
    const input = event.target.closest('[data-check-garment]');
    if (!input) return;
    if (input.checked) {
        multiSelectMode = true;
        checkedGarmentIds.add(input.dataset.checkGarment);
    }
    else checkedGarmentIds.delete(input.dataset.checkGarment);
    renderBulkState();
}

/**
 * 一次勾选或取消当前筛选结果，隐藏服装不会混入批量操作。
 * @param {Event} event 全选框变化事件。
 * @returns {void} 无返回值。
 */
function selectAllGarments(event) {
    checkedGarmentIds.clear();
    if (event.currentTarget.checked) for (const id of visibleGarmentIds) checkedGarmentIds.add(id);
    renderBulkState();
}

/**
 * 进入多选即显示底部操作栏，零选中时只禁用批量操作；不重建图片，保留键盘焦点。
 * @returns {void} 无返回值。
 */
function renderBulkState() {
    const count = checkedGarmentIds.size;
    panel.querySelector('.tw-library').dataset.multiSelect = String(multiSelectMode);
    panel.querySelector('[data-action="toggle-multi"]').setAttribute('aria-pressed', String(multiSelectMode));
    panel.querySelector('.tw-bulk-actions').hidden = !multiSelectMode;
    const all = panel.querySelector('.tw-select-all');
    all.checked = count > 0 && count === visibleGarmentIds.size;
    all.indeterminate = count > 0 && count < visibleGarmentIds.size;
    all.disabled = visibleGarmentIds.size === 0;
    panel.querySelector('.tw-selection-count').textContent = `已选 ${count} 件`;
    for (const control of panel.querySelectorAll('[data-bulk], .tw-bulk-apply, .tw-bulk-category, .tw-bulk-favorite')) control.disabled = count === 0;
    for (const input of panel.querySelectorAll('[data-check-garment]')) {
        input.checked = checkedGarmentIds.has(input.dataset.checkGarment);
        const entry = input.closest('.tw-garment-entry');
        entry.dataset.checked = String(input.checked);
        const card = entry.querySelector('[data-garment]');
        card.setAttribute('aria-pressed', String(multiSelectMode ? input.checked : card.dataset.garment === selectedGarmentId));
    }
    // 空衣柜也能打开导出弹窗，允许直接选择其他已有服装的独立衣柜。
    renderBulkExtras();
}

/**
 * 统一处理批量按钮和角色下拉菜单，菜单操作后复位，允许连续对同一角色执行操作。
 * @param {MouseEvent|Event} event 批量按钮点击或角色菜单变化事件。
 * @returns {Promise<void>} 操作及异步导出结束后完成。
 */
async function handleBulkAction(event) {
    const control = event.type === 'change' ? event.currentTarget : event.target.closest('button[data-bulk]');
    if (!control || !checkedGarmentIds.size) return;
    // 应用后服装可能不再匹配“未分配”等筛选，先记住操作数量，避免重绘清空勾选后显示 0 件。
    const count = checkedGarmentIds.size;
    try {
        const action = event.type === 'change' ? control.value : control.dataset.bulk;
        if (action === 'export') await exportGarments(checkedGarmentIds);
        else if (action === 'delete') await deleteGarments(new Set(checkedGarmentIds));
        else {
            const wearer = action.endsWith('-user') ? 'user' : 'char';
            const removing = action.startsWith('unapply-');
            applyGarments(checkedGarmentIds, wearer, removing);
            renderGarmentLibrary();
            renderWearerState();
            setLibraryStatus(removing ? `已取消 ${wearer === 'user' ? 'USER' : 'Char'} 的 ${count} 件服装应用` : `已应用 ${count} 件服装到 ${wearer === 'user' ? 'USER' : 'Char'}`);
        }
    } catch (error) { recordWardrobeLog('error', 'handleBulkAction：捕获异常', error); setLibraryStatus(String(error), true); }
    finally { if (event.type === 'change') control.value = ''; }
}

/**
 * 批量保存前验证发送内容；应用时同步记录最近使用，取消应用保留历史，任一失败不更新内存。
 * @param {Iterable<string>} ids 待处理的服装标识。
 * @param {string} wearer 目标角色 user 或 char。
 * @param {boolean} removing 是否取消应用。
 * @param {string} [invalidContentHint] 发送资料校验失败时附加的详情保存提示。
 * @returns {void} 无返回值。
 */
function applyGarments(ids, wearer, removing = false, invalidContentHint = '') {
    const selections = readWearerSelections();
    // 取消分配基于实际整身穿着删减，并用新锚点屏蔽旧快照，避免丢掉其他仍在穿的衣物。
    if (removing) {
        selections.current[wearer] = resolveCurrentOutfits(selections)[wearer];
        selections.anchor[wearer] = currentChatAnchor();
    }
    const next = new Map(garments);
    const usedAt = Date.now();
    for (const id of ids) {
        if (removing) {
            selections[wearer].delete(id);
            selections.current[wearer].delete(id);
        }
        else {
            const item = garments.get(id);
            try { buildWardrobeContent(item, sendSettings); }
            catch (error) { recordWardrobeLog('error', 'applyGarments：捕获异常', error); throw new Error(`${item.name}：${error.message}${invalidContentHint}`); }
            selections[wearer].add(id);
            next.set(id, { ...item, lastUsedAt: usedAt });
        }
    }
    // 归属与使用时间一次写入，避免归属保存失败却留下虚假的最近使用记录。
    const saved = buildWearerSelectionUpdate(selections);
    if (!removing) saved.wardrobe_items = Array.from(next.values());
    saveLibraryVariables(saved);
    if (!removing) garments = next;
}

/**
 * 为已勾选服装批量添加、移除或清空标签，一次提交且保留未涉及的标签与详情草稿。
 * @param {string} action 菜单选择的 add:标签、remove:标签或空字符串（清空）。
 * @returns {void} 无返回值。
 */
function moveCheckedGarments(action) {
    try {
        const groupId = action.slice(action.indexOf(':') + 1);
        const count = checkedGarmentIds.size;
        const next = new Map(garments);
        for (const id of checkedGarmentIds) {
            const item = next.get(id);
            const groupIds = new Set(item.groupIds);
            if (!action) groupIds.clear();
            else if (action.startsWith('add:')) groupIds.add(groupId);
            else groupIds.delete(groupId);
            next.set(id, { ...item, groupIds: Array.from(groupIds) });
        }
        commitGarments(next, selectedGarmentId, garmentGroups, false);
        setLibraryStatus(`已更新 ${count} 件服装的标签`);
    } catch (error) { recordWardrobeLog('error', 'moveCheckedGarments：捕获异常', error); setLibraryStatus(String(error), true); }
}

/**
 * 将分类或收藏状态一次提交给全部勾选服装，保留归属、其他字段及详情草稿。
 * @param {Event} event 分类或收藏菜单的变化事件。
 * @returns {void} 保存失败保留原状态，菜单复位以便连续操作。
 */
function updateCheckedGarments(event) {
    const select = event.currentTarget;
    if (!checkedGarmentIds.size) return;
    const category = select.classList.contains('tw-bulk-category');
    const patch = category ? { category: select.value } : { favorite: select.value === 'favorite' };
    const count = checkedGarmentIds.size;
    const includesSelected = checkedGarmentIds.has(selectedGarmentId);
    try {
        const next = new Map(garments);
        for (const id of checkedGarmentIds) next.set(id, { ...next.get(id), ...patch });
        commitGarments(next, selectedGarmentId, garmentGroups, false);
        if (category && includesSelected) panel.querySelector('[name="garment_category"]').value = patch.category;
        setLibraryStatus(`已${category ? '修改分类：' : patch.favorite ? '收藏 ' : '取消收藏 '}${count} 件服装`);
    } catch (error) { recordWardrobeLog('error', 'updateCheckedGarments：捕获异常', error); setLibraryStatus(String(error), true); }
    finally { select.value = ''; }
}

/**
 * 在列表区域报告操作结果；成功提示 3 秒后清空，由空状态样式收起，错误保留供用户查看。
 * @param {string} message 操作结果。
 * @param {boolean} error 是否为错误。
 * @returns {void} 无返回值。
 */
function setLibraryStatus(message, error = false) {
    // 新提示替换旧提示时取消原计时，避免连续操作后新消息被旧计时提前清除。
    window.parent.clearTimeout(libraryStatusTimer);
    libraryStatusTimer = undefined;
    const status = panel.querySelector('.tw-library-status');
    status.textContent = message;
    status.dataset.error = String(error);
    if (message) {
        libraryStatusTimer = window.parent.setTimeout(() => {
            status.textContent = '';
            libraryStatusTimer = undefined;
        }, error ? 8000 : 3000);
    }
}

/**
 * 校验手动设置当前穿着时保存的聊天位置，供存档读取和删除清理两个入口复用。
 * @param {unknown} value 存档中的锚点。
 * @returns {{chat: string, len: number}|null} 有效聊天位置，无效或缺失时为空。
 */
function normalizeAnchor(value) {
    return value && typeof value.chat === 'string' && Number.isInteger(value.len) && value.len >= 0 ? { chat: value.chat, len: value.len } : null;
}

/**
 * 只读获取当前聊天楼层，不修改酒馆保存的消息。
 * @returns {Object[]} 当前楼层数组，没有聊天时为空数组。
 */
function readChat() {
    const chat = SillyTavern.getContext().chat;
    return Array.isArray(chat) ? chat : [];
}

/**
 * 从边界前查找最后一个非系统楼层，保留其在酒馆聊天数组中的原始下标。
 * @param {Object[]} chat 当前聊天楼层。
 * @param {number} [beforeIndex] 不包含的上界，默认从聊天末尾查找。
 * @returns {number} 原始楼层号，无对话楼层时为 -1。
 */
function lastDialogueIndex(chat, beforeIndex = chat.length) {
    for (let index = beforeIndex - 1; index >= 0; index--) {
        if (chat[index] && !chat[index].is_system) return index;
    }
    return -1;
}

/**
 * 记录手动设置时的聊天与楼层数，用于区分设置前后的自动换装记录。
 * @returns {{chat: string, len: number}|null} 当前聊天位置，未打开聊天时为空。
 */
function currentChatAnchor() {
    const chatId = SillyTavern.getCurrentChatId();
    return chatId ? { chat: String(chatId), len: readChat().length } : null;
}

/**
 * 整套搭配已经包含的成员不再另计一条当前记录，保留搭配本身及独立补充的衣物。
 * @param {Iterable<string>} ids 已确认存在的当前服装 ID。
 * @param {Map<string, WardrobeItem>} items 当前服装表，删除清理时使用剩余记录。
 * @returns {Set<string>} 去重后的整身记录，保持原有顺序。
 */
function compactOutfitIds(ids, items = garments) {
    const result = new Set(ids);
    const members = new Set();
    // 先收集再删除，避免边遍历边变更导致共享成员的处理依赖顺序；总成本随成员数量线性增长。
    for (const id of result) for (const memberId of items.get(id).componentIds ?? []) members.add(memberId);
    for (const id of members) result.delete(id);
    return result;
}

/**
 * 在存档入口兼容旧单 ID 和新数组，仅保留仍分配给该角色的有效记录。
 * @param {unknown} value 存档中的当前穿着。
 * @param {Set<string>} allowed 已归一化的角色分配集合。
 * @param {Map<string, WardrobeItem>} items 当前服装表。
 * @returns {Set<string>} 可供内部直接使用的当前穿着集合。
 */
function normalizeCurrentOutfit(value, allowed, items = garments) {
    const ids = new Set();
    for (const id of Array.isArray(value) ? value : typeof value === 'string' ? [value] : []) {
        if (allowed.has(id)) ids.add(id);
    }
    return compactOutfitIds(ids, items);
}

/**
 * 展开整身穿着中的搭配成员，用于当前筛选和状态展示，不改变独立分配权限。
 * @param {Iterable<string>} ids 当前穿着记录 ID。
 * @returns {Set<string>} 当前记录及其所有成员 ID。
 */
function expandOutfitIds(ids) {
    const expanded = new Set(ids);
    for (const id of ids) for (const memberId of garments.get(id).componentIds ?? []) expanded.add(memberId);
    return expanded;
}

/**
 * 只在该角色已分配服装中匹配名称，精确匹配优先，再忽略空白和大小写。
 * @param {string} name 换装标记中的服装名称。
 * @param {Iterable<string>} ids 角色已分配的服装标识。
 * @returns {string|null} 匹配标识，找不到时为空且不猜测。
 */
function matchGarmentByName(name, ids) {
    const wanted = name.trim();
    if (!wanted) return null;
    /** 将名称统一为宽松比较形式；参数为服装名称，返回去空白的小写名称。 */
    const loose = value => value.replace(/\s+/g, '').toLowerCase();
    // 目标名称在本次查找中不变，只转换一次；候选仍按顺序比较，保留精确匹配的优先级。
    const wantedLoose = loose(wanted);
    let fuzzy = null;
    for (const id of ids) {
        const garmentName = garments.get(id)?.name;
        if (garmentName === undefined) continue;
        if (garmentName === wanted) return id;
        if (!fuzzy && loose(garmentName) === wantedLoose) fuzzy = id;
    }
    return fuzzy;
}

/**
 * 在标记入口解析完整 ID 快照，兼容旧名称、ID 数组和附带描述的快照。
 * @param {string} value 标记等号后的内容。
 * @param {Set<string>} allowed 该角色已分配的记录集合。
 * @returns {Set<string>|null} 有效完整快照（可为空集合），无效时为空值。
 */
function parseOutfitSnapshot(value, allowed) {
    const hasDescription = PUBLISHED_OUTFIT_SNAPSHOT.test(value);
    if (!hasDescription && !value.startsWith('[')) {
        const id = matchGarmentByName(value, allowed);
        return id ? new Set([id]) : null;
    }
    let snapshot;
    try { snapshot = JSON.parse(value); }
    catch (error) { recordWardrobeLog('error', 'parseOutfitSnapshot：捕获异常', error); return null; }
    return validateOutfitIds(hasDescription ? snapshot.ids : snapshot, allowed);
}

/**
 * 将接口或楼层变量里的完整快照校验为当前角色可穿的 ID 集合。
 * @param {unknown} ids 外部返回的完整穿搭数组。
 * @param {Set<string>} allowed 当前角色已分配的服装。
 * @returns {Set<string>|null} 合法的整身穿搭，无效时为空值。
 */
function validateOutfitIds(ids, allowed) {
    return Array.isArray(ids) && ids.every(id => allowed.has(id)) ? compactOutfitIds(ids) : null;
}

/**
 * 为选装快照生成楼层变量键，避免同一聊天里的不同脚本或衣柜互相覆盖。
 * @returns {string} 当前脚本和衣柜专用的变量键。
 */
function getOutfitVariableKey() {
    return `wardrobe_outfit:${getScriptId()}:${activeLibraryId}`;
}

/**
 * 单次倒扫为两个角色解析实际穿着；只读当前回复页，以跟随滑动、编辑和删除。
 * @param {{user: Set<string>, char: Set<string>, current: Object, anchor: Object}} selections 已归一化的保存记录。
 * @param {{excludeLast?: boolean, beforeIndex?: number}} options 排除正在重新生成或即将重新选装的楼层。
 * @returns {{user: Set<string>, char: Set<string>}} 两个角色实际生效的整身穿着副本。
 */
function resolveCurrentOutfits(selections, { excludeLast = false, beforeIndex } = {}) {
    const resolved = { user: new Set(selections.current.user), char: new Set(selections.current.char) };
    const waiting = new Set(WEARERS.filter(wearer => selections[wearer].size));
    if (sendSettings.marker_mode === 'off' || !waiting.size) return resolved;
    const chat = readChat();
    const chatId = SillyTavern.getCurrentChatId();
    const end = beforeIndex ?? (excludeLast ? lastDialogueIndex(chat) : chat.length);
    const outfitKey = sendSettings.marker_mode === 'isolated' ? getOutfitVariableKey() : undefined;
    const start = {};
    for (const wearer of waiting) {
        const anchor = selections.anchor[wearer];
        // 同聊天只读取手动设置后新增的楼层；其他聊天的设置不屏蔽本聊天记录。
        start[wearer] = anchor && chatId && anchor.chat === String(chatId) ? anchor.len : 0;
    }
    for (let index = end - 1; index >= 0 && waiting.size; index--) {
        for (const wearer of waiting) if (index < start[wearer]) waiting.delete(wearer);
        if (!waiting.size) break;
        const message = chat[index];
        if (!message || message.is_system) continue;
        if (message.is_user) {
            // 与酒馆助手的楼层变量 API 使用同一个当前回复页，直接取衣柜键以免克隆其他插件变量。
            const snapshot = outfitKey && message.variables?.[message.swipe_id ?? 0]?.[outfitKey];
            if (!snapshot) continue;
            for (const wearer of waiting) {
                const outfit = validateOutfitIds(snapshot[wearer], selections[wearer]);
                if (!outfit) continue;
                resolved[wearer] = outfit;
                waiting.delete(wearer);
            }
        } else if (typeof message.mes === 'string' && message.mes.includes('outfit:')) {
            // 同一楼层每个角色取最后一个有效标记；独立模式的附描述标记只供其他插件读取。
            const found = new Map();
            for (const [, wearer, value] of message.mes.matchAll(OUTFIT_MARKER)) {
                if (!waiting.has(wearer) || (outfitKey && PUBLISHED_OUTFIT_SNAPSHOT.test(value))) continue;
                const outfit = parseOutfitSnapshot(value, selections[wearer]);
                if (outfit) found.set(wearer, outfit);
            }
            for (const [wearer, outfit] of found) {
                resolved[wearer] = outfit;
                waiting.delete(wearer);
            }
        }
    }
    return resolved;
}

/**
 * 为列表状态读取实际生效的穿着，避免把自动解析结果写回兼容保留的手动存档。
 * @returns {{user: Set<string>, char: Set<string>, current: Object, worn: Object, anchor: Object}} 含整身记录及展开成员的选择副本。
 */
function readEffectiveSelections() {
    const selections = readWearerSelections();
    const current = resolveCurrentOutfits(selections);
    return { ...selections, current, worn: { user: expandOutfitIds(current.user), char: expandOutfitIds(current.char) } };
}

/**
 * 删除楼层后收回超出聊天长度的锚点，避免后续新增楼层被当成手动设置之前的记录。
 * @param {{user: Set<string>, char: Set<string>, current: Object, anchor: Object}} selections 当前保存的选择记录。
 * @returns {void} 仅在锚点变化时保存，失败记录日志而不阻断发送。
 */
function clampCurrentAnchors(selections) {
    const chatId = SillyTavern.getCurrentChatId();
    if (!chatId) return;
    const length = readChat().length;
    let changed = false;
    for (const wearer of WEARERS) {
        const anchor = selections.anchor[wearer];
        if (anchor?.chat === String(chatId) && anchor.len > length) {
            anchor.len = length;
            changed = true;
        }
    }
    if (!changed) return;
    try { saveWearerSelections(selections); }
    catch (error) { recordWardrobeLog('error', 'clampCurrentAnchors：捕获异常', error); console.warn('[衣柜插件] 无法保存当前穿着位置', error); }
}

/**
 * 根据最后一个对话楼层是 AI、请求末尾是用户判断是否正在替换该回复。
 * @param {Object[]} prompt 即将发送的消息数组。
 * @returns {boolean} 是否应排除最后一楼的换装记录。
 */
function isRegeneratingLastReply(prompt) {
    const chat = readChat();
    const tail = chat[lastDialogueIndex(chat)];
    if (!tail || tail.is_user) return false;
    for (let index = prompt.length - 1; index >= 0; index--) if (prompt[index].role !== 'system') return prompt[index].role === 'user';
    return false;
}

/**
 * 从发送副本的 AI 历史消息中剥离标记，兼容纯文本和多模态内容，保留聊天原对象。
 * @param {Object[]} messages 发送消息数组，修改时替换元素而不改动原消息及内容块。
 * @returns {void} 无返回值。
 */
function stripOutfitMarkers(messages) {
    /** 去掉换装标记并仅在有修改时清除尾部空白；参数为原文，返回处理后的文字。 */
    const strip = text => {
        const stripped = text.replace(OUTFIT_MARKER, '');
        return stripped === text ? text : stripped.replace(/\s+$/, '');
    };
    for (let index = 0; index < messages.length; index++) {
        const message = messages[index];
        if (message?.role !== 'assistant') continue;
        if (typeof message.content === 'string') {
            const text = strip(message.content);
            if (text !== message.content) messages[index] = { ...message, content: text };
        } else if (Array.isArray(message.content)) {
            let changed = false;
            const content = message.content.map(part => {
                if (part?.type !== 'text' || typeof part.text !== 'string') return part;
                const text = strip(part.text);
                if (text === part.text) return part;
                changed = true;
                return { ...part, text };
            });
            if (changed) messages[index] = { ...message, content };
        }
    }
}

/**
 * 为有候选的角色生成首次选装与后续换装说明，始终记录完整一身，避免局部换衣丢掉其余部位。
 * @param {{user: Set<string>, char: Set<string>}} selections 角色服装选择。
 * @param {{user: string, char: string}} names 当前聊天的角色名称。
 * @returns {string} 完整快照说明，没有候选时为空字符串。
 */
function buildMarkerNote(selections, names) {
    const switchable = WEARERS.filter(wearer => selections[wearer].size > 0);
    if (!switchable.length) return '';
    const who = switchable.map(wearer => `${wearer} 指 ${names[wearer]}`).join('，');
    return `（换装记录：首次确定穿着或在合理机会发生实际换装时，在回复最末尾为每个受影响角色单独另起一行写 HTML 注释。格式：${switchable.map(wearer => `<!-- outfit:${wearer}=["候选ID1","候选ID2"] -->`).join('；')}；${who}。数组必须列出换装后完整一身的全部候选 ID，局部换衣也保留未换下的衣物；ID 必须来自该角色候选清单，不使用名称或编号。保存的搭配记录搭配自身 ID，并列出独立补充的单品 ID，不重复列成员。没有换装就不要写，不在正文里提及记录。）`;
}

/**
 * 在变量入口按当前分区和范围归一化选择；只有原始分区的全局范围兼容旧聊天存档。
 * @returns {{user: Set<string>, char: Set<string>, current: {user: Set<string>, char: Set<string>}, anchor: Object}} 分配集合、整身当前穿着及锚点；旧单 ID 在入口转为集合。
 */
function readWearerSelections() {
    const selections = { user: new Set(), char: new Set(), current: { user: new Set(), char: new Set() }, anchor: { user: null, char: null } };
    let variables = getLibraryVariables();
    const location = getSelectionLocation(variables);
    if (location.scope !== 'global') {
        variables = { wardrobe_selections: location.key ? variables.wardrobe_scoped_selections?.[location.key] : undefined };
    }
    // 旧聊天选择只迁入原始衣柜；新分区即使服装 ID 相同也不继承其他来源的角色归属。
    const migrating = activeLibraryId === 'default-1' && location.scope === 'global' && variables.wardrobe_selections === undefined && Boolean(SillyTavern.getCurrentChatId());
    if (migrating) variables = getVariables({ type: 'chat' });
    const saved = variables.wardrobe_selections;
    if (saved && typeof saved === 'object') {
        for (const wearer of WEARERS) {
            if (!Array.isArray(saved[wearer])) continue;
            for (const id of saved[wearer]) if (garments.has(id)) selections[wearer].add(id);
        }
        // 只在存档入口归一化新增字段，手动穿着必须属于同一角色的有效清单。
        for (const wearer of WEARERS) {
            selections.current[wearer] = normalizeCurrentOutfit(saved.current?.[wearer], selections[wearer]);
            selections.anchor[wearer] = normalizeAnchor(saved.anchor?.[wearer]);
        }
    } else if (garments.has(variables.wardrobe_active_id)) selections.char.add(variables.wardrobe_active_id);
    if (migrating && (saved !== undefined || variables.wardrobe_active_id != null)) {
        saveWearerSelections(selections);
        // 先迁移到当前衣柜，成功后才清除本次读到的旧聊天标识。
        if (variables.wardrobe_active_id != null) {
            try { deleteVariable('wardrobe_active_id', { type: 'chat' }); }
            catch (error) { recordWardrobeLog('error', '旧聊天穿着标识未清理', error); }
        }
    }
    return selections;
}

/**
 * 将两个角色的选择写入当前范围，与批量应用共用同一补丁构建入口。
 * @param {{user: Set<string>, char: Set<string>, current: Object, anchor: Object}} selections 已归一化的服装选择、手动当前穿着与聊天位置。
 * @returns {void} 无返回值；写入失败交由调用方报告。
 */
function saveWearerSelections(selections) {
    saveLibraryVariables(buildWearerSelectionUpdate(selections));
}

/**
 * 使用角色卡头像文件名作为稳定标识；聊天再附加聊天 ID，避免同名聊天在不同角色或群组间串用。
 * @param {Object} variables 当前脚本变量，范围值在此入口归一化。
 * @returns {{scope: string, key: string|null}} 当前保存范围及独立存档键；没有所需上下文时键为空。
 */
function getSelectionLocation(variables) {
    const scope = ['character', 'chat'].includes(variables.wardrobe_selection_scope) ? variables.wardrobe_selection_scope : 'global';
    if (scope === 'global') return { scope, key: null };
    const context = SillyTavern.getContext();
    const avatar = context.characters[context.characterId]?.avatar;
    if (scope === 'character') return { scope, key: !context.groupId && avatar ? JSON.stringify(['character', avatar]) : null };
    const owner = context.groupId ? ['group', String(context.groupId)] : avatar ? ['character', avatar] : null;
    const chatId = SillyTavern.getCurrentChatId();
    return { scope, key: owner && chatId ? JSON.stringify(['chat', ...owner, chatId]) : null };
}

/**
 * 构建当前范围的存档补丁，使穿搭选择与最近使用记录仍能一次写入，不改变其他范围。
 * @param {{user: Set<string>, char: Set<string>, current: Object, anchor: Object}} selections 已归一化的服装选择、手动当前穿着与聊天位置。
 * @returns {Object} 交给脚本变量接口的字段补丁；缺少角色卡／聊天时抛错而不串用全局选择。
 */
function buildWearerSelectionUpdate(selections) {
    const variables = getLibraryVariables();
    const location = getSelectionLocation(variables);
    const saved = {
        user: Array.from(selections.user), char: Array.from(selections.char),
        current: { user: Array.from(selections.current.user), char: Array.from(selections.current.char) },
        anchor: { user: selections.anchor.user, char: selections.anchor.char },
    };
    if (location.scope === 'global') return { wardrobe_selections: saved };
    if (!location.key) throw new Error(location.scope === 'character' ? '请先打开单角色聊天，再设置按角色卡的穿搭。' : '请先打开聊天，再设置按聊天的穿搭。');
    return { wardrobe_scoped_selections: { ...variables.wardrobe_scoped_selections, [location.key]: saved } };
}

/**
 * 保存范围偏好并刷新穿搭归属；不复制上一范围的选择，也不重填详情而丢失编辑草稿。
 * @param {Event} event 范围菜单变化事件，值限定为菜单中三个选项。
 * @returns {void} 无返回值，存储失败恢复菜单原值并显示错误。
 */
function selectSelectionScope(event) {
    try {
        saveLibraryVariables({ wardrobe_selection_scope: event.currentTarget.value });
        checkedGarmentIds.clear();
        renderGarmentLibrary();
        renderWearerState();
    } catch (error) {
        recordWardrobeLog('error', 'selectSelectionScope：捕获异常', error);
        event.currentTarget.value = getSelectionLocation(getLibraryVariables()).scope;
        setLibraryStatus(String(error), true);
    }
}

/**
 * 按当前服装的复选框保存穿着归属，另一角色仅在用户单独勾选后才可使用。
 * @param {Event} event 归属复选框变化事件。
 * @returns {void} 无返回值。
 */
function selectWearer(event) {
    const input = event.target.closest('input[data-wearer]');
    if (!input) return;
    const wearer = input.dataset.wearer;
    const removing = !input.checked;
    try {
        // 角色归属使用已保存资料，详情草稿仍由「保存修改」提交。
        const hint = !removing && hasDetailsDraft() ? ' 若已补齐资料，请先保存修改。' : '';
        applyGarments([selectedGarmentId], wearer, removing, hint);
        refreshWardrobeContext();
        setGarmentStatus(removing ? '已取消该角色的穿着归属' : '已保存穿着归属');
    } catch (error) {
        recordWardrobeLog('error', 'selectWearer：捕获异常', error);
        renderWearerState();
        setGarmentStatus(String(error), true);
    }
}

/**
 * 详情只编辑角色归属；当前穿着由后台解析，缺少独立范围上下文时禁用归属操作。
 * @returns {void} 无返回值。
 */
function renderWearerState() {
    const selections = readWearerSelections();
    const location = getSelectionLocation(getLibraryVariables());
    panel.querySelector('.tw-selection-scope select').value = location.scope;
    panel.querySelector('.tw-selection-scope select').title = location.scope !== 'global' && !location.key ? '请打开对应的角色卡或聊天' : '';
    for (const input of panel.querySelectorAll('input[data-wearer]')) {
        input.checked = selections[input.dataset.wearer].has(selectedGarmentId);
        input.disabled = !selectedGarmentId || (location.scope !== 'global' && !location.key);
    }
}

/**
 * 刷新服装列表与详情，在切换聊天或修改服装后同步应用状态。
 * @returns {void} 无返回值。
 */
function refreshWardrobe() {
    renderGarmentLibrary();
    renderGarmentDetails();
}

/**
 * 刷新受聊天与角色归属影响的界面，保留同一件服装的详情表单。
 * @returns {void} 无返回值。
 */
function refreshWardrobeContext() {
    renderGarmentLibrary();
    renderWearerState();
}

/**
 * 分类数量和可见列表共用筛选规则，归属始终读取当前穿搭范围；共享服装同时匹配两侧。
 * @param {WardrobeItem} item 已校验的服装记录。
 * @param {string} filter 分类或快捷筛选标识。
 * @param {{user: Set<string>, char: Set<string>}} selections 当前范围的角色归属。
 * @returns {boolean} 服装是否满足筛选条件。
 */
function matchesGarmentFilter(item, filter, selections) {
    switch (filter) {
        case 'all': return true;
        case 'favorites': return item.favorite;
        case 'recent': return item.lastUsedAt > 0;
        case 'combinations': return Boolean(item.componentIds);
        case 'assigned-user': return selections.user.has(item.id);
        case 'assigned-char': return selections.char.has(item.id);
        // 未分配只收录描述完整的服装；沿用缺描述规则，统一处理纯空白、搭配成员与整套覆盖正文。
        case 'unassigned': return !selections.user.has(item.id) && !selections.char.has(item.id) && !matchesGarmentFilter(item, 'missing-description', selections);
        case 'missing-description': return item.descriptionOverride ? !item.description.trim() : getGarmentMembers(item).some(member => !member.description.trim());
        case 'missing-image': return getGarmentMembers(item).some(member => !member.image && !member.backImage);
        default: return item.category === filter;
    }
}

/**
 * 仅在搜索需要时生成归一化文本，连续输入复用结果；标签改名和成员变动由列表刷新失效。
 * @param {WardrobeItem} item 当前服装或搭配。
 * @returns {string} 忽略大小写的搜索文本，包含当前记录 ID。
 */
function getGarmentSearchText(item) {
    garmentSearchIndex ??= { items: garments, groups: garmentGroups, text: new Map() };
    const { text } = garmentSearchIndex;
    let value = text.get(item.id);
    if (value === undefined) {
        const tags = item.groupIds.length ? item.groupIds.map(id => garmentGroups.get(id)).join('\n') : '未分组';
        value = `${item.name}\n${getGarmentDescription(item)}\n${CATEGORY_LABELS.get(item.category)}\n${tags}\n${item.id}`.toLocaleLowerCase();
        text.set(item.id, value);
    }
    return value;
}

/**
 * 按标签、关键词和分类筛选后排序；数量与搜索同步，最近使用只显示有应用记录的服装。
 * @returns {void} 无返回值。
 */
function renderGarmentLibrary() {
    const selections = readEffectiveSelections();
    renderGarmentGroups(selections);
    // 两张表在编辑后整体替换，清除旧文本也能避免继续持有切换前的衣柜。
    if (garmentSearchIndex && (garmentSearchIndex.items !== garments || garmentSearchIndex.groups !== garmentGroups)) garmentSearchIndex = undefined;
    const counts = new Map();
    const cards = hostDocument.createDocumentFragment();
    const items = [];
    visibleGarmentIds = new Set();
    for (const item of garments.values()) {
        if (currentGroup !== '*' && (currentGroup ? !item.groupIds.includes(currentGroup) : item.groupIds.length !== 0)) continue;
        if (garmentSearch && !getGarmentSearchText(item).includes(garmentSearch)) continue;
        counts.set('all', (counts.get('all') ?? 0) + 1);
        counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
        // 快捷筛选数量与标签、搜索同步，按固定筛选数单次遍历，不逐件扫描角色清单。
        for (const [filter] of QUICK_FILTERS) if (matchesGarmentFilter(item, filter, selections)) counts.set(filter, (counts.get(filter) ?? 0) + 1);
        if (!matchesGarmentFilter(item, currentCategory, selections)) continue;
        items.push(item);
    }
    // 只排序筛选结果，不改动存档顺序；最近使用分类默认时间倒序，也允许用户主动选择名称排序。
    if (garmentSort === 'recent' || (currentCategory === 'recent' && garmentSort === 'default')) items.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
    else if (garmentSort === 'name-asc') items.sort((a, b) => GARMENT_NAME_COLLATOR.compare(a.name, b.name));
    else if (garmentSort === 'name-desc') items.sort((a, b) => GARMENT_NAME_COLLATOR.compare(b.name, a.name));
    for (const item of items) {
        visibleGarmentIds.add(item.id);
        const entry = hostDocument.createElement('div');
        entry.className = 'tw-garment-entry';
        const label = hostDocument.createElement('label');
        label.className = 'tw-item-check';
        const checkbox = hostDocument.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.checkGarment = item.id;
        checkbox.setAttribute('aria-label', `选择${item.name}`);
        label.append(checkbox);
        const favorite = hostDocument.createElement('button');
        favorite.type = 'button';
        favorite.className = 'tw-favorite';
        favorite.dataset.favorite = item.id;
        favorite.setAttribute('aria-pressed', String(item.favorite));
        favorite.setAttribute('aria-label', `${item.favorite ? '取消收藏' : '收藏'}${item.name}`);
        favorite.title = item.favorite ? '取消收藏' : '收藏';
        favorite.innerHTML = icon('heart');
        const card = hostDocument.createElement('button');
        card.type = 'button';
        card.className = 'tw-garment-card';
        card.dataset.garment = item.id;
        card.setAttribute('aria-pressed', String(item.id === selectedGarmentId));
        const first = item.componentIds ? garments.get(item.componentIds[0]) : item;
        const cover = item.image || item.backImage || first.image || first.backImage;
        if (cover) {
            const image = hostDocument.createElement('img');
            image.src = cover;
            image.alt = item.name;
            // 列表交给浏览器懒加载和异步解码原图路径，不在渲染时读取 Base64 或另存缩略副本。
            image.loading = 'lazy';
            image.decoding = 'async';
            card.append(image);
        } else card.innerHTML = icon(item.componentIds ? 'combine' : 'shirt');
        const name = hostDocument.createElement('span');
        name.textContent = item.componentIds ? `${item.name}（${item.componentIds.length} 件搭配）` : item.name;
        card.append(name);
        const metadata = hostDocument.createElement('div');
        metadata.className = 'tw-card-meta';
        const badge = hostDocument.createElement('small');
        const owners = WEARERS.filter(wearer => selections[wearer].has(item.id) || selections.worn[wearer].has(item.id))
            .map(wearer => `${wearer === 'user' ? 'USER' : 'Char'}${selections.worn[wearer].has(item.id) ? selections.current[wearer].has(item.id) ? '（当前）' : '（随搭配穿着）' : ''}`);
        badge.textContent = owners.length ? owners.join(' · ') : '未分配';
        badge.title = `穿着归属：${badge.textContent}`;
        metadata.append(badge);
        const tags = hostDocument.createElement('div');
        tags.className = 'tw-card-tags';
        const tagNames = item.groupIds.length ? item.groupIds.map(id => garmentGroups.get(id)) : ['未分组'];
        tags.title = `标签：${tagNames.join('、')}`;
        tags.setAttribute('aria-label', tags.title);
        // 卡片最多创建两个名称节点，其余只显示数量；容器及每个子标签悬停均可查看完整名称。
        for (const name of tagNames.slice(0, 2)) {
            const tag = hostDocument.createElement('small');
            tag.textContent = name;
            tag.title = tags.title;
            tag.setAttribute('aria-label', `标签：${name}`);
            tags.append(tag);
        }
        if (tagNames.length > 2) {
            const overflow = hostDocument.createElement('small');
            overflow.className = 'tw-card-tag-overflow';
            overflow.textContent = `+${tagNames.length - 2}`;
            overflow.title = tags.title;
            overflow.setAttribute('aria-label', `另有 ${tagNames.length - 2} 个标签`);
            tags.append(overflow);
        }
        metadata.append(tags);
        card.append(metadata);
        entry.append(label, favorite, card);
        cards.append(entry);
    }
    // 删除、移除标签或切换筛选后移除不可见的勾选，避免误操作当前看不到的服装。
    for (const id of checkedGarmentIds) if (!visibleGarmentIds.has(id)) checkedGarmentIds.delete(id);
    const visible = visibleGarmentIds.size;
    const list = panel.querySelector('.tw-items');
    list.replaceChildren(cards);
    list.hidden = visible === 0;
    panel.querySelector('.tw-library').dataset.hasItems = String(visible !== 0);
    panel.querySelector('.tw-empty').hidden = visible !== 0;
    panel.querySelector('.tw-empty').dataset.kind = garments.size === 0 ? 'no-garments' : 'no-match';
    panel.querySelector('.tw-result-count').textContent = visible === garments.size ? `共 ${visible} 件` : `显示 ${visible} / 共 ${garments.size} 件`;
    for (const button of panel.querySelectorAll('[data-category]')) {
        button.querySelector('.tw-count').textContent = String(counts.get(button.dataset.category) ?? 0);
    }
    panel.querySelector('#tw-empty-title').textContent = garmentSearch ? '没有匹配的服装' : currentCategory === 'all' ? '这里还没有服装' : currentCategory === 'favorites' ? '还没有收藏的服装' : currentCategory === 'recent' ? '还没有最近使用的服装' : `暂无${CATEGORY_LABELS.get(currentCategory)}`;
    renderBulkState();
}

/**
 * 根据当前选中服装填充详情，搭配的合并正文直接进入唯一描述编辑框，并同步当前范围的应用入口。
 * @returns {void} 无返回值。
 */
function renderGarmentDetails() {
    const item = garments.get(selectedGarmentId);
    renderGarmentImage();
    panel.querySelector('[name="garment_name"]').value = item?.name ?? '';
    panel.querySelector('[name="garment_category"]').value = item?.category ?? 'other';
    panel.querySelector('[name="garment_content_rating"]').value = item?.contentRating ?? 'unrated';
    panel.querySelector('.tw-tag-picker').open = false;
    window.parent.clearTimeout(garmentTagSearchTimer);
    panel.querySelector('.tw-tag-search').value = '';
    filterGarmentGroupOptions();
    syncGarmentGroupSelection();
    panel.querySelector('[name="garment_description"]').value = item ? getGarmentDescription(item) : '';
    panel.querySelector('[name="garment_description"]').placeholder = '填写款式、颜色、材质等服装描述';
    panel.querySelector('.tw-description-actions').hidden = Boolean(item?.componentIds);
    panel.querySelector('.tw-description-options').hidden = Boolean(item?.componentIds);
    panel.querySelector('.tw-combination-details').hidden = !item?.componentIds;
    setDescriptionBusy(Boolean(descriptionRequest));
    renderWearerState();
    panel.querySelector('.tw-details').dataset.empty = String(!item);
    setDetailsDirty(false);
}

/**
 * 普通服装固定左正面右背面，搭配保留成员预览；替换后仅刷新图片，不覆盖文本草稿。
 * @returns {void} 无返回值。
 */
function renderGarmentImage() {
    const item = garments.get(selectedGarmentId);
    const preview = panel.querySelector('.tw-preview');
    preview.replaceChildren();
    preview.dataset.combination = String(Boolean(item?.componentIds));
    preview.dataset.sides = String(Boolean(item && !item.componentIds));
    if (item?.componentIds) {
        for (const member of getGarmentMembers(item)) {
            const cell = hostDocument.createElement('button');
            cell.type = 'button';
            cell.className = 'tw-preview-member';
            cell.dataset.previewGarment = member.id;
            cell.dataset.imageField = member.image ? 'image' : 'backImage';
            cell.disabled = !member.image && !member.backImage;
            cell.setAttribute('aria-label', `${!cell.disabled ? '查看原图：' : '无图片：'}${member.name}`);
            if (!cell.disabled) {
                const image = hostDocument.createElement('img');
                image.src = member.image || member.backImage;
                image.alt = member.name;
                cell.append(image);
            } else cell.innerHTML = icon('shirt');
            const name = hostDocument.createElement('span');
            name.textContent = member.name;
            name.title = member.name;
            cell.append(name);
            preview.append(cell);
        }
    } else if (item) {
        for (const field of IMAGE_FIELDS) {
            const side = IMAGE_SIDE_LABELS[field];
            const button = hostDocument.createElement('button');
            button.type = 'button';
            button.className = 'tw-preview-image';
            button.dataset.previewGarment = item.id;
            button.dataset.imageField = field;
            button.disabled = !item[field];
            button.setAttribute('aria-label', `${item[field] ? '查看原图' : '未上传'}：${item.name}（${side}）`);
            if (item[field]) {
                const image = hostDocument.createElement('img');
                image.src = item[field];
                image.alt = `${item.name}（${side}）`;
                button.append(image);
            }
            const label = hostDocument.createElement('span');
            label.textContent = item[field] ? side : `${side}未上传`;
            button.append(label);
            preview.append(button);
        }
    } else {
        preview.innerHTML = icon('hanger');
        const title = hostDocument.createElement('span');
        title.textContent = item?.name ?? '未选择服装';
        preview.append(title);
    }
}

/**
 * 将点击的单件或搭配成员原图放大显示，复用已保存的原始路径，不发起压缩或重新上传。
 * @param {MouseEvent} event 预览区域的按钮点击事件。
 * @returns {void} 无图或非图片区域不操作，有图时打开原生模态框。
 */
function openGarmentImage(event) {
    const button = event.target.closest('[data-preview-garment]');
    if (!button) return;
    const item = garments.get(button.dataset.previewGarment);
    const field = button.dataset.imageField;
    if (!item[field]) return;
    const dialog = panel.querySelector('#tw-original-image');
    const image = dialog.querySelector('img');
    image.src = item[field];
    image.alt = `${item.name}（${IMAGE_SIDE_LABELS[field]}）`;
    dialog.querySelector('h2').textContent = image.alt;
    dialog.showModal();
}

/**
 * 关闭原图并释放图片引用；按钮、Escape 关闭事件和衣柜卸载共用此清理入口。
 * @returns {void} 无返回值，原生模态框恢复预览按钮的焦点。
 */
function closeGarmentImage() {
    const dialog = panel.querySelector('#tw-original-image');
    if (dialog.open) dialog.close();
    dialog.querySelector('img').removeAttribute('src');
}

/**
 * 收藏按钮独立切换状态；普通模式打开详情，多选模式点击卡片即勾选，手机不跳转到详情页。
 * @param {MouseEvent} event 服装列表点击事件。
 * @returns {Promise<void>} 取消切换时保留当前详情。
 */
async function selectGarment(event) {
    const favorite = event.target.closest('[data-favorite]');
    if (favorite) {
        toggleGarmentFavorite(favorite.dataset.favorite);
        return;
    }
    const card = event.target.closest('[data-garment]');
    if (!card) return;
    if (multiSelectMode) {
        card.parentElement.querySelector('[data-check-garment]').click();
        return;
    }
    if (card.dataset.garment !== selectedGarmentId) {
        if (hasDetailsDraft() && !await confirmDiscardDetails()) return;
        stopDescriptionRequest();
        selectedGarmentId = card.dataset.garment;
        refreshWardrobe();
        setGarmentStatus('');
    }
    if (compactViewport.matches) setMobileDetails(true);
}

/**
 * 即时保存指定服装的收藏状态，只刷新列表，保留预览选择、详情草稿和进行中的识图请求。
 * @param {string} id 收藏按钮对应的服装标识。
 * @returns {void} 保存失败时显示错误并保留原收藏状态。
 */
function toggleGarmentFavorite(id) {
    const item = garments.get(id);
    const next = new Map(garments);
    next.set(id, { ...item, favorite: !item.favorite });
    try {
        commitGarments(next, selectedGarmentId, garmentGroups, false);
    } catch (error) {
        recordWardrobeLog('error', 'toggleGarmentFavorite：捕获异常', error);
        setLibraryStatus(String(error), true);
    }
}

/**
 * 打开描述编辑区域；手机同步显示详情，不复制表单内容。
 * @returns {void} 无返回值。
 */
function showGarmentDescription() {
    panel.querySelector('[data-detail="description"]').click();
    if (compactViewport.matches) setMobileDetails(true);
    panel.querySelector('[name="garment_description"]').focus();
}

/**
 * 使用所选提示词识别图片；JSON 回复填入名称和描述，仅即时保存用户开启的分类与标签。
 * @returns {Promise<void>} 识别请求与编辑框更新完成后结束。
 */
async function generateGarmentDescription() {
    if (descriptionRequest) return;
    const item = garments.get(selectedGarmentId);
    // 请求与错误脱敏始终使用同一份已保存连接，避免处理中修改设置后丢失本次密钥。
    const config = savedApiSettings;
    let request;
    try {
        if (config.mode === 'custom' && (!config.apiurl || !config.model)) throw new Error('请先在 API 页保存完整的接口地址与模型。');
        request = { generationId: `wardrobe-description-${window.parent.crypto.randomUUID()}` };
        descriptionRequest = request;
        setDescriptionBusy(true);
        setGarmentStatus('正在生成服装描述…');
        const result = await requestGarmentDescription(item, panel.querySelector('[name="description_mode"]').value, config, request);
        if (!result) return;
        // 先完整校验回复再更新表单，格式错误时保留原来的名称、描述和存档。
        if (result.category !== undefined || result.tags !== undefined) await commitGeneratedGarment(garments.get(item.id), result, false);
        if (result.name !== undefined) panel.querySelector('[name="garment_name"]').value = result.name;
        panel.querySelector('[name="garment_description"]').value = result.description;
        setDetailsDirty(true);
        const savedFields = [result.category !== undefined ? '分类' : '', result.tags !== undefined ? '标签' : ''].filter(Boolean).join('与');
        setGarmentStatus(savedFields ? `${savedFields}已保存，名称与描述请保存或应用` : result.name !== undefined ? '名称与描述已生成，请保存或应用' : '描述已生成，请保存或应用');
    } catch (error) {
        recordWardrobeLog('error', 'generateGarmentDescription：捕获异常', error);
        if (root.isConnected && (!request || descriptionRequest === request)) setGarmentStatus(describeApiError(error, config.key), true);
    } finally {
        if (request && descriptionRequest === request) {
            descriptionRequest = null;
            setDescriptionBusy(false);
        }
    }
}

/**
 * 确认后以最多两个并行请求识别缺描述图片，完成一张即补下一张；缺描述筛选只处理当前可见结果。
 * @returns {Promise<void>} 批次完成、取消或首个失败后结束；不提交当前编辑框的草稿。
 */
async function generateMissingGarmentDescriptions() {
    if (descriptionRequest) return;
    const ids = [];
    for (const item of garments.values()) {
        if (currentCategory === 'missing-description' && !visibleGarmentIds.has(item.id)) continue;
        // 编辑框里的文字尚未保存也视为已有描述，避免批量识别覆盖用户草稿。
        if (!item.componentIds && (item.image || item.backImage) && !item.description.trim() &&
            (item.id !== selectedGarmentId || !panel.querySelector('[name="garment_description"]').value.trim())) ids.push(item.id);
    }
    if (!ids.length) {
        setLibraryStatus('没有需要识图的图片，已有描述的图片会自动跳过');
        return;
    }
    if (!await askConfirm('一键识图', `${currentCategory === 'missing-description' ? '当前筛选中' : '衣柜中'}有 ${ids.length} 张图片尚未识别，是否一键识图？\n仅识别没有描述的图片，已有描述的图片将跳过。识别结果会自动保存。`, { confirmText: '开始识图' })) return;
    // 整批共用同一份连接，错误提示也按该连接移除密钥。
    const config = savedApiSettings;
    let request;
    let completed = 0;
    try {
        if (config.mode === 'custom' && (!config.apiurl || !config.model)) throw new Error('请先在 API 页保存完整的接口地址与模型。');
        request = { generations: new Map(), bulk: true, completed: 0 };
        descriptionRequest = request;
        setDescriptionBusy(true);
        let nextIndex = 0;
        let failed = false;
        while (nextIndex < ids.length || request.generations.size) {
            if (descriptionRequest !== request) return;
            // 固定两个请求槽位，任一结果保存后立即补位，不必等待同批另一张；每个请求使用独立编号以支持取消。
            while (!failed && nextIndex < ids.length && request.generations.size < 2) {
                const item = garments.get(ids[nextIndex++]);
                if (!item || (!item.image && !item.backImage) || item.description.trim()) continue;
                const generationId = `wardrobe-description-${window.parent.crypto.randomUUID()}`;
                // 将失败也交回统一处理，避免另一张正在确认标签时发生未处理的 Promise 拒绝。
                const pending = requestGarmentDescription(item, 'outfit', config, request, generationId).then(
                    result => ({ generationId, item, result }),
                    error => {
                        // 另一张尚在保存时也要停止补位，避免已知失败后继续发送排队图片。
                        failed = true;
                        return { generationId, error };
                    },
                );
                request.generations.set(generationId, pending);
            }
            if (!request.generations.size) break;
            const settled = await Promise.race(request.generations.values());
            request.generations.delete(settled.generationId);
            if (descriptionRequest !== request) return;
            if ('error' in settled) throw settled.error;
            const { item, result } = settled;
            if (!result) return;
            // 等待接口时列表仍可删除或更新记录；只补全原图未变且仍无描述的服装。
            const latest = garments.get(item.id);
            if (!latest || IMAGE_FIELDS.some(field => latest[field] !== item[field]) || latest.description.trim()) continue;
            // 接口并行、保存串行，避免新标签确认框重叠，以及旧标签快照覆盖另一张已保存的标签。
            await commitGeneratedGarment(latest, result, true);
            request.completed = ++completed;
            if (item.id === selectedGarmentId) {
                panel.querySelector('[name="garment_name"]').value = result.name ?? latest.name;
                panel.querySelector('[name="garment_description"]').value = result.description;
            }
        }
        setLibraryStatus(`识图完成，已识别并保存 ${completed} 张图片`);
    } catch (error) {
        recordWardrobeLog('error', 'generateMissingGarmentDescriptions：捕获异常', error);
        if (root.isConnected && (!request || descriptionRequest === request)) {
            setLibraryStatus(`识图已停止，已保存 ${completed} 张图片。${describeApiError(error, config.key)}`, true);
        }
    } finally {
        if (request && descriptionRequest === request) {
            descriptionRequest = null;
            // 首个接口或保存失败后停止另一槽位，迟到回复不再写入，也不启动后续图片。
            for (const generationId of request.generations.keys()) stopGenerationById(generationId);
            setDescriptionBusy(false);
        }
    }
}

/**
 * 单张与批量识图共用图片读取、选项快照、提示词和回复校验，取消后不再发请求或接收结果。
 * @param {WardrobeItem} item 待识别的服装。
 * @param {string} promptMode 已选择的整套或单品提示词类型。
 * @param {Object} config 本次识图使用的已保存 API 配置。
 * @param {Object} request 当前可取消的识图请求；首次读取分类与标签选项，整批沿用同一选择。
 * @param {string} generationId 本张图片的独立生成编号；单张识图默认使用请求自身的编号。
 * @returns {Promise<Object|null>} 解析后的名称、描述与可选分类、标签；已取消时返回空值。
 */
async function requestGarmentDescription(item, promptMode, config, request, generationId = request.generationId) {
    const { mode, ...customApi } = config;
    // 在读取图片前固定选项；批量处理不会因界面重绘或切换服装而改变后续图片的识别行为。
    const options = request.options ??= {
        category: panel.querySelector('[name="description_category"]').value === 'on',
        tags: panel.querySelector('[name="description_tags"]').value === 'on',
    };
    const values = { name: item.name, category: CATEGORY_LABELS.get(item.category) };
    const images = [];
    for (const field of IMAGE_FIELDS) if (item[field]) images.push(await loadImageDataUrl(item[field]));
    // 读取原图期间也允许取消识别，取消后不再启动新的生成请求。
    if (descriptionRequest !== request) return null;
    const prompt = descriptionPrompts[promptMode];
    const imageSides = IMAGE_FIELDS.filter(field => item[field]).map(field => IMAGE_SIDE_LABELS[field]).join('、');
    // 最终格式优先服从 AI 开关，并按内置提示词的识图范围给出分类选项。
    const isDefaultOutfit = promptMode === 'outfit' && prompt === DEFAULT_DESCRIPTION_PROMPTS.outfit;
    const isDefaultItem = promptMode === 'item' && prompt === DEFAULT_DESCRIPTION_PROMPTS.item;
    const categoryChoices = CATEGORIES.slice(1).filter(([id]) => !isDefaultItem || id !== 'outfits');
    const categoryRule = isDefaultItem
        ? '按画面中最主体的一件服饰的结构判断，无法归类时使用 other。'
        : '根据图片判断，独立单品按类型分类，多件完整穿搭归入 outfits，无法判断时使用 other，不沿用当前分类作为判断依据。';
    const categoryFormat = isDefaultOutfit
        ? 'category 为一个服装分类标识，固定为 outfits，即使图中只有一件服饰。'
        : `category 为一个服装分类标识，只能从 ${JSON.stringify(categoryChoices.map(([id, label]) => ({ id, name: label })))} 中选择 id。${categoryRule}`;
    const tagFormat = isDefaultOutfit
        ? '首项固定为“套装”，再列 2–4 个各件关键词。'
        : '可同时包含场景、季节、风格，例如 ["居家","夏季"]，没有适用标签时返回 []。';
    const reply = await loggedGenerateRaw({
        generation_id: generationId,
        // 宿主支持图片数组；单图保留原格式，双图按正面、背面顺序识别。
        image: images.length === 1 ? images[0] : images,
        // 仅替换一次变量，服装名中的模板标记保留为普通文本，不带入聊天历史或角色提示。
        user_input: `${prompt.replace(DESCRIPTION_VARIABLES, (_match, name) => values[name])}\n\n参考图顺序：${imageSides}，均对应同一条衣柜记录。\n\n最终输出格式（此处要求优先）：仅返回一个 JSON 对象，不要使用代码块。name、description 为非空字符串。${options.category ? categoryFormat : 'AI 分类已关闭，不判断服装分类，不返回 category 字段。'}${options.tags ? `tags 为标签名称数组，${tagFormat}现有标签：${JSON.stringify(Array.from(garmentGroups.values()))}。${isDefaultOutfit ? '除固定的“套装”外，' : ''}根据图片判断服装适合归入哪些标签，优先选择合适的已有标签并原样返回名称；仅在没有合适的已有标签时提议简短的新标签名称。所有新标签由用户确认后才能创建，不要为已有标签另造近义名称，避免重复或相互矛盾的标签。` : 'AI 标签已关闭，不判断或生成标签，不返回 tags 字段，也不使用旧版 category 字段返回标签。'}`,
        ordered_prompts: ['user_input'],
        max_chat_history: 0,
        should_stream: false,
        should_silence: true,
        ...(mode === 'custom' ? { custom_api: customApi } : {}),
    });
    return descriptionRequest === request ? parseGarmentDescriptionReply(reply, options) : null;
}

/**
 * 在描述入口解析名称、描述及已开启的分类、标签，模型回复兼容旧版 category 标签字段及纯文本。
 * @param {unknown} reply 模型返回或手动粘贴的原始文本。
 * @param {{category: boolean, tags: boolean, legacyCategoryTags?: boolean}} options 分类与标签选项；手动粘贴关闭旧版 category 标签兼容，避免将“未指定”建成标签。
 * @returns {{name?: string, description: string, category?: string, tags?: string[]}} 分类统一为内置标识，标签统一为去重数组；纯文本仅提供描述。
 */
function parseGarmentDescriptionReply(reply, options = { category: true, tags: true }) {
    if (typeof reply !== 'string' || !reply.trim()) throw new Error('接口未返回服装描述。');
    const text = reply.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/i, '$1').trim();
    if (!text) throw new Error('接口未返回服装描述。');
    // 只解析完整 JSON，不截取混有额外说明的片段，避免把不完整的内容当成生成成功。
    if (!text.startsWith('{') && !text.startsWith('[')) return { description: text };
    let data;
    try { data = JSON.parse(text); }
    catch (error) { recordWardrobeLog('error', 'parseGarmentDescriptionReply：捕获异常', error); throw new Error('描述中的 JSON 格式错误，请检查后重试。'); }
    if (!data || Array.isArray(data) || typeof data.name !== 'string' || !data.name.trim() ||
        typeof data.description !== 'string' || !data.description.trim()) {
        throw new Error('描述中的 JSON 需要包含非空字符串 name 和 description，请检查后重试。');
    }
    let category;
    let legacyTags;
    if (data.category !== undefined && (options.category || options.tags)) {
        if (typeof data.category === 'string') {
            const value = data.category.trim();
            category = GARMENT_CATEGORIES.has(value) ? value : CATEGORIES.find(([id, label]) => GARMENT_CATEGORIES.has(id) && label === value)?.[0];
        }
        // 旧提示词把 category 用作标签；只有明确匹配内置分类的字符串才改变服装分类。
        if (!category && options.legacyCategoryTags !== false) {
            legacyTags = typeof data.category === 'string' ? [data.category] : data.category;
            if (!Array.isArray(legacyTags) || !legacyTags.length || legacyTags.some(label => typeof label !== 'string' || !label.trim())) {
                throw new Error('AI 返回的 category 需要是服装分类标识或旧版非空标签名称数组，请检查提示词后重新生成。');
            }
        }
    }
    if (options.tags && data.tags !== undefined && (!Array.isArray(data.tags) || data.tags.some(label => typeof label !== 'string' || !label.trim()))) {
        throw new Error('描述中的 tags 需要是标签名称数组，请检查后重试。');
    }
    const tags = options.tags && (legacyTags !== undefined || data.tags !== undefined) ? Array.from(new Set((legacyTags ?? []).concat(data.tags ?? []).map(label => label.trim()))) : undefined;
    // 在入口丢弃关闭项，即使模型仍返回这些字段，也不会进入保存及新标签确认流程。
    return { name: data.name.trim(), description: data.description.trim(), category: options.category ? category : undefined, tags };
}

/**
 * 同次保存 AI 分类与追加标签，新标签需用户确认，已有标签直接复用；批量识图同时保存名称和描述。
 * @param {WardrobeItem} item 识图对应的服装。
 * @param {Object} result 已在回复入口校验的名称、描述及可选分类、标签。
 * @param {boolean} saveDescription 是否同时保存名称与描述；单张识图仍保留原有草稿流程。
 * @returns {void} 保存成功后同步当前服装的分类控件，不提交其他编辑草稿。
 */
async function commitGeneratedGarment(item, result, saveDescription) {
    const groups = new Map(garmentGroups);
    const groupIds = new Set(item.groupIds);
    if (result.tags !== undefined) {
        // 一次建名称索引，识别出多个标签时不为每个标签重新扫描全部已有标签。
        const names = new Map(Array.from(groups, ([id, label]) => [label, id]));
        const newLabels = result.tags.filter(label => !names.has(label));
        // 单张与批量共用确认入口；拒绝只跳过新标签，不丢弃描述、分类或可复用的已有标签。
        const createTags = !newLabels.length || await askConfirm('创建 AI 建议的标签？', `AI 为“${result.name ?? item.name}”建议新增以下标签：\n${newLabels.join('、')}\n\n跳过时只忽略新标签，已有标签和其他识图结果仍会保留。`, { confirmText: '创建并归入', cancelText: '跳过新标签' });
        for (const label of result.tags) {
            let id = names.get(label);
            if (!id) {
                if (!createTags) continue;
                id = window.parent.crypto.randomUUID();
                groups.set(id, label);
                names.set(label, id);
            }
            groupIds.add(id);
        }
    }
    const next = new Map(garments);
    next.set(item.id, { ...item, category: result.category ?? item.category, groupIds: Array.from(groupIds), ...(saveDescription ? { name: result.name ?? item.name, description: result.description } : {}) });
    commitGarments(next, selectedGarmentId, groups, false);
    // 列表刷新刻意保留详情草稿，分类需单独同步，防止随后保存名称、描述时写回识图前的分类。
    if (item.id === selectedGarmentId && result.category !== undefined) panel.querySelector('[name="garment_category"]').value = result.category;
}

/**
 * 识别期间暂时锁定当前服装编辑；搭配直接引用成员图文，不对搭配另行上传或识图。
 * @param {boolean} busy 是否正在识别。
 * @returns {void} 无返回值。
 */
function setDescriptionBusy(busy) {
    const item = garments.get(selectedGarmentId);
    panel.querySelector('[name="garment_group"]').disabled = !item || busy;
    for (const control of panel.querySelectorAll('.tw-details input, .tw-details select, .tw-details textarea, [data-action="save-garment"], [data-action="add-garment-group"]')) {
        control.disabled = !item || busy;
    }
    const button = panel.querySelector('[data-action="describe"]');
    button.disabled = !item || (!item.image && !item.backImage) || Boolean(item.componentIds) || busy;
    setButtonLabel(button, busy ? '正在生成…' : 'AI 生成描述');
    for (const control of panel.querySelectorAll('[data-action="export-one"], [data-action="delete-one"]')) control.disabled = !item || busy;
    panel.querySelector('[data-action="remove-image"]').disabled = !item || (!item.image && !item.backImage) || busy;
    for (const [action, field] of [['replace-front-image', 'image'], ['replace-image', 'backImage']]) {
        const replaceButton = panel.querySelector(`[data-action="${action}"]`);
        replaceButton.disabled = !item || Boolean(item.componentIds) || busy || replacingImage;
        replaceButton.textContent = `替换${IMAGE_SIDE_LABELS[field]}图片`;
    }
    panel.querySelector('[data-action="edit-combination"]').disabled = !item?.componentIds || busy;
    const bulkButton = panel.querySelector('[data-action="describe-all"]');
    bulkButton.disabled = busy;
    setButtonLabel(bulkButton, descriptionRequest?.bulk ? '识图中…' : '一键识图');
}

/**
 * 切换服装、关闭衣柜或卸载时停止单张或批量的全部并行请求，保留批量任务已经保存的结果。
 * @returns {void} 无返回值。
 */
function stopDescriptionRequest() {
    if (!descriptionRequest) return;
    const request = descriptionRequest;
    const generationIds = request.bulk ? Array.from(request.generations.keys()) : [request.generationId];
    recordWardrobeLog('info', '取消识图请求', { generationIds });
    descriptionRequest = null;
    for (const generationId of generationIds) stopGenerationById(generationId);
    setDescriptionBusy(false);
    if (request.bulk) setLibraryStatus(`识图已取消，已保存 ${request.completed} 张图片`);
}

/**
 * 保存名称、分类、手动分级和描述；粘贴 JSON 时拆分字段并追加标签，描述只保存正文。
 * 正在应用的服装仍检查修改后是否满足发送要求，校验和存储成功后才更新编辑框。
 * @returns {WardrobeItem|undefined} 保存后的服装，失败时为空。
 */
function saveSelectedGarment() {
    const item = garments.get(selectedGarmentId);
    if (!item) return undefined;
    const name = panel.querySelector('[name="garment_name"]');
    name.value = name.value.trim();
    try {
        const description = panel.querySelector('[name="garment_description"]');
        const text = description.value.trim();
        // 手动粘贴不依赖 AI 开关；完整校验后才建标签，格式错误或保存失败时保留原 JSON 草稿。
        const parsed = text.startsWith('{') || text.startsWith('[') || text.startsWith('```')
            ? parseGarmentDescriptionReply(text, { category: true, tags: true, legacyCategoryTags: false }) : undefined;
        // JSON 可提供名称；普通文本仍使用信息页的必填名称校验。
        if (!parsed?.name && !name.value) {
            panel.querySelector('[data-detail="info"]').click();
            name.reportValidity();
            return undefined;
        }
        const groups = new Map(garmentGroups);
        const groupIds = new Set(item.groupIds);
        if (parsed?.tags?.length) {
            // 标签多时只建立一次名称索引，避免逐个扫描；手动保存的标签直接创建，同名复用。
            const names = new Map(Array.from(groups, ([id, label]) => [label, id]));
            for (const label of parsed.tags) {
                let id = names.get(label);
                if (!id) {
                    id = window.parent.crypto.randomUUID();
                    groups.set(id, label);
                    names.set(label, id);
                }
                groupIds.add(id);
            }
        }
        // 保留即时保存的手动标签；空 tags 不清空原归属，未知分类沿用信息页的选择。
        const updated = { ...item, name: parsed?.name ?? name.value,
            category: parsed?.category ?? panel.querySelector('[name="garment_category"]').value,
            groupIds: Array.from(groupIds), contentRating: panel.querySelector('[name="garment_content_rating"]').value,
            ...readGarmentDescriptionDraft(item, parsed?.description ?? text) };
        const next = new Map(garments);
        next.set(item.id, updated);
        validateAppliedGarmentChanges(new Set([item.id]), next);
        commitGarments(next, item.id, groups);
        // 写入成功后才去除 JSON 包装，供保存、应用及单件导出共用同一正文。
        description.value = getGarmentDescription(updated);
        setGarmentStatus('已保存');
        return updated;
    } catch (error) {
        recordWardrobeLog('error', 'saveSelectedGarment：捕获异常', error);
        setGarmentStatus(String(error), true);
        return undefined;
    }
}

/**
 * 验证受编辑、删除图片或导入覆盖影响的已应用服装及搭配，每套只验证一次。
 * @param {Set<string>} changedIds 本次修改的服装 ID。
 * @param {Map<string, WardrobeItem>} next 待提交的服装表。
 * @returns {void} 缺少当前发送方式要求的成员图文时抛出错误。
 */
function validateAppliedGarmentChanges(changedIds, next) {
    const selections = readWearerSelections();
    const applied = new Set([...selections.user, ...selections.char]);
    // 单品通过搭配间接应用时也要验证，避免保存成功后下一次聊天才发现成员资料不完整。
    for (const id of applied) {
        const active = next.get(id);
        if (changedIds.has(id) || active.componentIds?.some(memberId => changedIds.has(memberId))) {
            buildWardrobeContent(active, sendSettings, next);
        }
    }
}

/**
 * 在详情区域显示保存或应用结果。
 * @param {string} message 状态文字。
 * @param {boolean} error 是否为操作错误。
 * @returns {void} 无返回值。
 */
function setGarmentStatus(message, error = false) {
    const status = panel.querySelector('.tw-garment-status');
    status.textContent = message;
    status.dataset.error = String(error);
}

/**
 * 按发送模式验证并构建一条候选；搭配引用成员资料，可包含多张参考图。
 * @param {WardrobeItem} item 当前应用的服装。
 * @param {{content_type: string, position: string, send_content_rating?: boolean}} settings 已保存的发送设置。
 * @param {Map<string, WardrobeItem>} items 成员所在服装表。
 * @returns {Object[]} 符合酒馆多模态消息格式的内容块。
 */
function buildWardrobeContent(item, settings, items = garments) {
    const parts = [];
    const members = getGarmentMembers(item, items);
    if (settings.content_type !== 'image') {
        // 自定义整套正文已覆盖成员文字；自动合并模式仍逐件检查，不能用空成员凑出看似完整的描述。
        const describedItems = item.descriptionOverride ? [item] : members;
        for (const member of describedItems) if (!member.description.trim()) throw new Error(`“${member.name}”缺少描述，当前内容类型需要文字描述，请先填写服装描述。`);
        parts.push({ type: 'text', text: `当前服装：${item.name}\n${getGarmentDescription(item, items)}` });
    }
    if (settings.content_type !== 'text') {
        for (const member of members) {
            if (!member.image && !member.backImage) throw new Error(`“${member.name}”缺少图片，当前内容类型需要图片，请先导入服装图片。`);
            for (const field of IMAGE_FIELDS) if (member[field]) parts.push({ type: 'image_url', image_url: { url: member[field], detail: 'auto' } });
        }
    }
    return parts;
}

/**
 * 按角色发送完整候选资料并单独标明当前整身穿着；分级由发送开关控制，独立分配的搭配成员仍保留为独立候选。
 * @param {WardrobeItem[]} items 该角色选择的服装。
 * @param {string} wearer user 或 char。
 * @param {{content_type: string, position: string, send_content_rating?: boolean}} settings 已保存的发送设置。
 * @param {Object} templates USER 和 Char 的已保存模板。
 * @param {{user: string, char: string}} names 当前聊天的用户与角色名称。
 * @param {{single: string, wardrobe: string}} imageTemplates 已保存的单条与衣柜图片模板。
 * @param {Set<string>} currentIds 已解析的当前整身记录，不改变候选范围和资料完整性。
 * @returns {Object[]} 该角色的模板文本与真实图片内容块，未选择时为空数组。
 */
function buildWearerContent(items, wearer, settings, templates, names, imageTemplates = wardrobeTemplates.image, currentIds = new Set()) {
    if (!items.length) return [];
    const sendContentRating = settings.send_content_rating !== false;
    const field = items.length === 1 ? 'single' : 'wardrobe';
    const textTemplate = settings.content_type === 'image' ? '' : templates[wearer][field];
    // 保留自定义模板原文，但文字模式必须带完整候选资料；模板未引用描述时在清单中补齐，避免资料丢失。
    const includeCandidateDescriptions = settings.content_type !== 'image' && !textTemplate.includes('{{outfits}}') && !textTemplate.includes('{{description}}');
    const images = [];
    const imageNumbers = new Map();
    const outfitNames = [];
    const descriptions = [];
    const outfits = [];
    const taggedOutfits = [];
    const candidates = [];
    const current = [];
    for (const item of items) {
        const members = getGarmentMembers(item);
        const type = item.componentIds ? '保存的搭配' : item.category === 'outfits' ? '套装' : '单品';
        const category = CATEGORY_LABELS.get(item.category);
        // 开启时在固定清单中附上分级；关闭时连同成员分级一起省略，不改动已保存的标记。
        const label = `${item.name}（${type}；分类：${category}${sendContentRating ? `；内容分级：${getGarmentContentRating(item)}` : ''}；ID：${JSON.stringify(item.id)}）`;
        const parts = buildWardrobeContent(item, settings);
        const references = [];
        let imageIndex = settings.content_type === 'image' ? 0 : 1;
        if (settings.content_type !== 'text') for (const member of members) {
            for (const field of IMAGE_FIELDS) {
                if (!member[field]) continue;
                const part = parts[imageIndex++];
                // 以成员和图片面向复用图号，共享成员的两面均只发送一次。
                const key = JSON.stringify([member.id, field]);
                if (!imageNumbers.has(key)) {
                    images.push(part);
                    imageNumbers.set(key, images.length);
                }
                references.push(`${member.name}（${IMAGE_SIDE_LABELS[field]}）＝图${imageNumbers.get(key)}`);
            }
        }
        outfitNames.push(item.name);
        const description = getGarmentDescription(item);
        descriptions.push(description);
        outfits.push(`${outfits.length + 1}. ${label}\n${description}`);
        const memberText = item.componentIds ? `；成员同时穿着：${members.map(member => `${member.name}（${CATEGORY_LABELS.get(member.category)}${sendContentRating ? `；内容分级：${getGarmentContentRating(member)}` : ''}）`).join('＋')}` : '';
        candidates.push(`${candidates.length + 1}. ${label}${memberText}${references.length ? `；参考图：${references.join('、')}` : ''}${includeCandidateDescriptions ? `\n${description}` : ''}`);
        if (currentIds.has(item.id)) current.push(label + memberText);
        // 标签不依赖自定义模板，图片模式也保留真实标签；无标签时不补造场景信息。
        const tag = item.groupIds.map(id => garmentGroups.get(id)).join('、');
        if (tag) taggedOutfits.push(`${outfits.length}. ${item.name}：${tag}`);
    }
    const values = {
        user: names.user, char: names.char, wearer: names[wearer],
        name: outfitNames.join('、'), description: descriptions.join('\n'),
        outfits: outfits.join('\n\n'), count: String(items.length),
    };
    // 归属说明独立于可编辑模板，文字和图片模式均明确边界；共享只由两边清单同时列出表达。
    const texts = [`【${wearer === 'user' ? 'USER' : 'Char'}（${names[wearer]}）的服装】以下服装文字及紧随其后的图片仅供该角色使用。另一角色只能使用其自身服装清单中明确列出的服装，不得将本清单中未分配给对方的服装转给对方，也不得根据性别自动共享。`];
    texts.push(current.length ? `当前实际穿着（完整一身，保持至合理换装机会）：\n${current.join('\n')}` : '当前实际穿着：尚未确定，请结合剧情从下列候选中首次选择一身。');
    texts.push(`可选衣柜（每个编号是一条候选，不代表完整一身；保存的搭配保留全部成员）：\n${candidates.join('\n')}`);
    if (sendContentRating) texts.push('内容分级用于说明服装性质：SFW 表示日常／非色情服装，NSFW 表示色情／成人服装，未标注表示尚未判断。NSFW 标记不代表当前剧情允许色情内容或要求进入色情情节，也不直接禁止外穿；是否选用由角色设定、世界观与剧情场景决定。');
    if (taggedOutfits.length) texts.push(`服装标签（用于匹配场景）：\n${taggedOutfits.join('\n')}`);
    // 一次替换受支持的变量，不再次解释服装描述里原有的双花括号，也不执行模板代码。
    if (settings.content_type !== 'image') texts.push(textTemplate.replace(TEMPLATE_VARIABLES, (_match, name) => values[name]));
    // 图片模式无需预先填写描述，但必须带上图片提示词，避免把图中人物当作角色设定。
    if (settings.content_type !== 'text') texts.push(imageTemplates[field].replace(TEMPLATE_VARIABLES, (_match, name) => values[name]));
    texts.push(STYLING_RULES);
    return [{ type: 'text', text: texts.join('\n\n') }, ...images];
}

/**
 * 复制目标消息后追加服装内容，保留原有文本、图片与工具字段，不修改聊天历史对象。
 * @param {Object} message 请求中的目标消息。
 * @param {Object[]} parts 要追加的服装内容块。
 * @returns {Object} 新的请求消息对象。
 */
function appendWardrobeContent(message, parts) {
    if (typeof message.content === 'string' && parts.length === 1 && parts[0].type === 'text') {
        return { ...message, content: message.content ? `${message.content}\n\n${parts[0].text}` : parts[0].text };
    }
    const content = Array.isArray(message.content) ? message.content.slice() : message.content ? [{ type: 'text', text: message.content }] : [];
    content.push(...parts);
    return { ...message, content };
}

/**
 * 将内容按三个位置写入最终请求：系统前缀末尾、完整上下文末尾或最后一条用户消息末尾。
 * @param {Object[]} messages 酒馆最终发送的消息数组。
 * @param {Object[]} parts 已构建的服装内容块。
 * @param {string} position 已保存的注入位置。
 * @returns {void} 原地更新请求数组，不修改原消息对象。
 */
function insertWardrobeContent(messages, parts, position) {
    if (position === 'system_end') {
        let end = 0;
        while (end < messages.length && messages[end].role === 'system') end++;
        if (end) messages[end - 1] = appendWardrobeContent(messages[end - 1], parts);
        else messages.unshift(appendWardrobeContent({ role: 'system', content: '' }, parts));
    } else if (position === 'user_end') {
        let index = messages.length - 1;
        while (index >= 0 && messages[index].role !== 'user') index--;
        if (index >= 0) messages[index] = appendWardrobeContent(messages[index], parts);
        else messages.push(appendWardrobeContent({ role: 'user', content: '' }, parts));
    } else {
        messages.push(appendWardrobeContent({ role: 'system', content: '' }, parts));
    }
}

/**
 * 中止本轮选装 HTTP 请求，并阻止未完成的选装更新楼层。
 * @returns {void} 无返回值。
 */
function stopOutfitRequest() {
    outfitRequest?.abort();
}

/**
 * 标记经过提示词构建的请求，只有原生聊天可进入选装流程。
 * @param {{prompt: Object[]}} data 本次生成的提示词消息。
 * @param {boolean} dryRun 是否仅预览。
 * @param {boolean} [nativeChat=true] 是否经过酒馆原生聊天的数据准备事件。
 * @returns {void} 无返回值。
 */
function markOutfitChatPrompt(data, dryRun, nativeChat = true) {
    if (dryRun || sendSettings.marker_mode !== 'isolated' || !Array.isArray(data.prompt)) return;
    // 酒馆构建最终参数时可能复制数组，保留的消息对象仍能标识这次请求。
    const message = data.prompt.findLast(message => message?.role === 'user') ?? data.prompt.at(-1);
    if (message) outfitChatPrompts.set(message, nativeChat);
}

/**
 * 在原生聊天发送前选装，并为辅助生成复用当前穿着。
 * @param {Object} data 酒馆聊天补全的最终请求参数。
 * @returns {Promise<void>} 为经过提示词构建的请求附加穿搭上下文。
 */
async function applyIsolatedOutfits(data) {
    if (sendSettings.marker_mode !== 'isolated' || !data.messages) return;
    let nativeChat;
    for (const message of data.messages) {
        const marker = outfitChatPrompts.get(message);
        if (marker === undefined) continue;
        // 其他插件可能在两个事件之间加入新消息，若同时有两种标记，以原生聊天为准。
        nativeChat ||= marker;
        outfitChatPrompts.delete(message);
    }
    if (nativeChat === undefined || apiRequest?.generationId || descriptionRequest) return;
    // 静默生成和续写都没有新剧情输入，直接沿用已保存穿着。
    const shouldSelect = nativeChat && data.type !== 'quiet' && data.type !== 'continue';
    if (shouldSelect && outfitRequest) return;
    try {
        const regenerating = shouldSelect && isRegeneratingLastReply(data.messages);
        stripOutfitMarkers(data.messages);
        const selections = readWearerSelections();
        const names = { user: SillyTavern.name1 || 'USER', char: SillyTavern.name2 || 'Char' };
        if (shouldSelect) {
            clampCurrentAnchors(selections);
            await injectIsolatedOutfits(data, selections, names, regenerating);
        } else {
            await appendCurrentOutfits(data.messages, resolveCurrentOutfits(selections), names, sendSettings);
        }
    } catch (error) {
        recordWardrobeLog('error', '独立选装模式未附加当前穿搭', error);
        toastr.error('详情见衣柜日志。', '服装内容未发送');
    }
}

/**
 * 取本次用户楼层及设定数量的可见剧情楼层，重生成时跳过即将被替换的 AI 回复。
 * @param {Object[]} chat 酒馆当前聊天楼层。
 * @param {boolean} regenerating 是否重生成最后一条回复。
 * @param {number} historyCount 用户保存的前文楼层数，不包含本次输入。
 * @returns {{index: number, messages: Object[]}|null} 本次选装上下文，续写等没有新用户输入的流程返回空值。
 */
function readOutfitTurn(chat, regenerating, historyCount) {
    const tail = lastDialogueIndex(chat);
    const index = regenerating ? lastDialogueIndex(chat, tail) : tail;
    const message = chat[index];
    if (!message?.is_user || message.is_system || !message.mes?.trim()) return null;
    const messages = [];
    for (let cursor = index; cursor >= 0 && messages.length <= historyCount; cursor--) {
        const floor = chat[cursor];
        if (floor && !floor.is_system && floor.mes?.trim()) {
            messages.push({ role: floor.is_user ? 'user' : 'assistant', content: floor.mes.replace(OUTFIT_MARKER, '') });
        }
    }
    return { index, messages: messages.reverse() };
}

/**
 * 单独请求模型判断首次穿着或实际换装，只有校验后的完整 ID 快照会写入楼层变量。
 * @param {Object} turn 本次用户楼层及用户指定的前文。
 * @param {Object} selections 当前分配集合。
 * @param {Object} current 本轮开始时生效的穿搭。
 * @param {{user: string, char: string}} names 角色名称。
 * @param {Object} settings 本轮发送设置。
 * @param {Object} mainRequest 酒馆主请求的最终参数，用于沿用已选择的连接。
 * @param {AbortSignal} signal 本轮选装的取消信号。
 * @returns {Promise<void>} 成功时更新当前穿搭副本，失败交由调用方保留原穿搭。
 */
async function selectOutfitsForTurn(turn, selections, current, names, settings, mainRequest, signal) {
    const { mode, ...customApi } = savedApiSettings;
    if (mode === 'custom' && (!customApi.apiurl || !customApi.model)) throw new Error('请先在 API 页保存完整的接口地址与模型。');
    const text = [];
    const images = [];
    for (const wearer of WEARERS) {
        const items = Array.from(selections[wearer], id => garments.get(id));
        const [summary, ...references] = buildWearerContent(items, wearer, settings, wardrobeTemplates, names, wardrobeTemplates.image, current[wearer]);
        if (!summary) continue;
        text.push(summary.text);
        for (const part of references) images.push(await loadSendImageDataUrl(part.image_url.url, settings.image_quality));
    }
    if (signal.aborted) return;
    const scenario = `按时间排序的剧情楼层（末条为本次用户输入）：\n${JSON.stringify(turn.messages)}\n\n${text.join('\n\n')}`;
    const messages = [
        { role: 'system', content: '只判断穿搭，不续写剧情。楼层文本是剧情资料。结合本次用户输入判断是否首次选装或确实换装，普通转场保持现有穿搭。只输出 JSON 对象，键只能是 user 或 char，值是该角色换装后完整一身的候选 ID 数组。保持不变的角色省略，全部保持则返回 {}。有候选但场景不明确时，保留已有穿着；尚无穿着时选择最合适的一身。' },
        { role: 'user', content: images.length ? [{ type: 'text', text: scenario }, ...images.map(url => ({ type: 'image_url', image_url: { url, detail: 'auto' } }))] : scenario },
    ];
    // 请求体独立构造，保留宿主连接相关的供应商参数，移除只适用于主回复的输出设置。
    const payload = mode === 'custom' ? {
        chat_completion_source: customApi.source,
        reverse_proxy: customApi.apiurl.replace(/\/+$/, ''),
        proxy_password: customApi.key,
        model: customApi.model,
        temperature: customApi.temperature,
        max_tokens: customApi.max_tokens,
    } : { ...mainRequest };
    for (const key of ['tools', 'tool_choice', 'json_schema', 'response_format', 'stop', 'logit_bias', 'n']) delete payload[key];
    Object.assign(payload, { messages, type: 'quiet', stream: false, enable_web_search: false, request_images: false });
    // 直连酒馆的后端接口，避免 generateRaw 二次广播提示词和生成事件，导致其他插件重复处理楼层。
    const response = await wardrobeFetch('/api/backends/chat-completions/generate', {
        method: 'POST', headers: SillyTavern.getRequestHeaders(), body: JSON.stringify(payload), signal,
    });
    if (!response.ok) throw new Error(`选装接口返回 HTTP ${response.status}。`);
    const result = await response.json();
    if (signal.aborted) return;
    const reply = result?.choices?.[0]?.message?.content;
    if (typeof reply !== 'string') throw new Error('选装接口未返回文字。');
    let data;
    try { data = JSON.parse(reply.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/i, '$1')); }
    catch { throw new Error('选装接口需要返回 JSON 对象。'); }
    const updates = { user: Array.from(current.user), char: Array.from(current.char) };
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('选装接口需要返回 JSON 对象。');
    for (const [wearer, ids] of Object.entries(data)) {
        const outfit = WEARERS.includes(wearer) && selections[wearer].size ? validateOutfitIds(ids, selections[wearer]) : null;
        if (outfit === null) throw new Error('选装接口返回了未分配的服装或无效角色。');
        updates[wearer] = Array.from(outfit);
    }
    // 完整覆盖本轮快照，避免重生成时仍保留上一次选装中已失效的角色状态。
    insertOrAssignVariables({ [getOutfitVariableKey()]: updates }, { type: 'message', message_id: turn.index });
    recordWardrobeLog('info', '已保存本轮选装', { floor: turn.index, ...updates });
    for (const wearer of WEARERS) current[wearer] = new Set(updates[wearer]);
}

/**
 * 用独立接口选装，并仅将实际穿搭放入主请求的系统提示。
 * @param {Object} mainRequest 酒馆主聊天的最终请求参数。
 * @param {Object} selections 当前分配集合。
 * @param {Object} names 当前角色名称。
 * @param {boolean} regenerating 是否重生成最后一条回复。
 * @returns {Promise<void>} 选装失败时沿用原穿搭，主请求继续执行。
 */
async function injectIsolatedOutfits(mainRequest, selections, names, regenerating) {
    if (!selections.user.size && !selections.char.size) return;
    const settings = sendSettings;
    const turn = readOutfitTurn(readChat(), regenerating, settings.outfit_history_count);
    let current = resolveCurrentOutfits(selections, { excludeLast: regenerating, beforeIndex: turn?.index });
    const controller = new window.parent.AbortController();
    const { signal } = controller;
    outfitRequest = controller;
    try {
        if (turn) {
            try { await selectOutfitsForTurn(turn, selections, current, names, settings, mainRequest, signal); }
            catch (error) {
                if (!signal.aborted) {
                    // 重试失败时仍可沿用本轮先前成功保存的穿搭，避免主请求和衣柜显示两份状态。
                    current = resolveCurrentOutfits(selections, { excludeLast: regenerating });
                    recordWardrobeLog('error', '独立选装失败，沿用原穿搭', error);
                    toastr.warning('已沿用已有穿搭，详情见衣柜日志。', '独立选装失败');
                }
            }
        }
        await appendCurrentOutfits(mainRequest.messages, current, names, settings, signal);
    } finally {
        outfitRequest = undefined;
    }
}

/**
 * 将实际穿着附加到聊天或辅助生成请求，让提示词模型使用同一份服装资料。
 * @param {Object[]} messages 最终请求的消息数组。
 * @param {{user: Set<string>, char: Set<string>}} current 已解析的当前穿着。
 * @param {{user: string, char: string}} names 当前角色名称。
 * @param {Object} settings 已保存的发送设置。
 * @param {AbortSignal} [signal] 主聊天选装的取消信号。
 * @returns {Promise<void>} 完成参考图读取后更新请求消息。
 */
async function appendCurrentOutfits(messages, current, names, settings, signal) {
    if (signal?.aborted) return;
    const texts = [];
    const references = [];
    for (const wearer of WEARERS) {
        if (!current[wearer].size) continue;
        const owner = `${wearer === 'user' ? 'USER' : 'Char'}（${names[wearer]}）`;
        texts.push(`【${owner}的当前穿着】需要描述衣着时，只使用以下已确认的衣物、鞋袜和配饰。剧情中的备选或购买计划不代表已经穿上。缺失的款式、颜色、材质等细节留空。${settings.content_type === 'text' ? '' : '参考图只用于识别衣物，保留角色原有外貌。'}`);
        for (const id of current[wearer]) {
            const item = garments.get(id);
            const outfit = buildWardrobeContent(item, settings);
            if (settings.content_type === 'image') texts.push(item.name);
            if (settings.content_type !== 'text') references.push({ type: 'text', text: `${owner}的服装参考图：${item.name}` });
            for (const part of outfit) {
                if (part.type === 'text') texts.push(part.text);
                else {
                    part.image_url.url = await loadSendImageDataUrl(part.image_url.url, settings.image_quality);
                    references.push(part);
                }
            }
        }
    }
    if (signal?.aborted || !texts.length) return;
    // 参考图作为单独的用户消息发送，兼容只接受 user 图片块的接口，并保留原始提示词。
    insertWardrobeContent(messages, [{ type: 'text', text: texts.join('\n\n') }], 'system_end');
    if (references.length) {
        const firstDialogue = messages.findIndex(message => message.role !== 'system');
        messages.splice(firstDialogue < 0 ? messages.length : firstDialogue, 0, { role: 'user', content: references });
    }
    recordWardrobeLog('info', '请求已附加当前穿搭', { user: current.user.size, char: current.char.size });
}

/**
 * 在剧情回复末尾发布已确认的穿搭，供读取原始楼层的插件直接获取衣柜资料。
 * @param {number} messageId 刚收到的 AI 回复楼层号。
 * @param {string} type 酒馆本次生成类型。
 * @returns {Promise<void>} 保存隐藏注释及当前回复页，避免重复触发渲染事件。
 */
async function publishOutfitSnapshot(messageId, type) {
    if (sendSettings.marker_mode !== 'isolated' || !OUTFIT_REPLY_TYPES.has(type)) return;
    const reply = readChat()[messageId];
    if (!reply || reply.is_user || reply.is_system || !reply.mes?.trim()) return;
    try {
        // 排除正在发布的回复，避免模型在正文中写的旧式标记覆盖已确认的快照。
        const current = resolveCurrentOutfits(readWearerSelections(), { beforeIndex: messageId });
        const markers = [];
        for (const wearer of WEARERS) {
            if (!current[wearer].size) continue;
            const ids = Array.from(current[wearer]);
            const items = Object.fromEntries(ids.map(id => {
                const item = garments.get(id);
                return [id, {
                    name: item.name,
                    description: sendSettings.content_type === 'image' ? '' : getGarmentDescription(item),
                }];
            }));
            // 其他插件可直接按 ID 查描述；转义连续连字符，避免衣柜原文意外结束 HTML 注释。
            const snapshot = JSON.stringify({ ids, items }).replaceAll('--', '\\u002d\\u002d');
            markers.push(`<!-- outfit:${wearer}=${snapshot} -->`);
        }
        if (!markers.length) return;
        const message = [reply.mes.replace(OUTFIT_MARKER, '').trimEnd(), ...markers].join('\n\n');
        if (message === reply.mes) return;
        await setChatMessages([{ message_id: messageId, message }], { refresh: 'none' });
        recordWardrobeLog('info', '已写入楼层穿搭注释', { floor: messageId, user: Array.from(current.user), char: Array.from(current.char) });
    } catch (error) {
        recordWardrobeLog('error', '楼层穿搭注释未写入', error);
    }
}

/**
 * 标记独立模式的请求，或在直接发送模式中构建并注入衣柜内容。
 * @param {{chat: Object[], dryRun: boolean}} event 酒馆最终消息与预览标记。
 * @returns {Promise<void>} 只修改发送载荷；酒馆等待图片读取及注入完成后再发送请求。
 */
async function injectWardrobeContent(event) {
    if (apiRequest?.generationId || descriptionRequest) return;
    if (sendSettings.marker_mode === 'isolated') {
        // 酒馆助手的 generateRaw 不经过原生聊天的数据准备事件，但仍可在最终请求中复用穿着。
        markOutfitChatPrompt({ prompt: event.chat }, event.dryRun, false);
        return;
    }
    try {
        const settings = sendSettings;
        // 必须先判断重新生成，排除即将被替换的 AI 楼层，随后才处理发送副本。
        const regenerating = isRegeneratingLastReply(event.chat);
        // 关闭模式也剥离旧记录，但不解析或请求新记录；聊天历史本身保持不变。
        if (settings.marker_mode !== 'keep') stripOutfitMarkers(event.chat);
        const selections = readWearerSelections();
        clampCurrentAnchors(selections);
        const names = { user: SillyTavern.name1 || 'USER', char: SillyTavern.name2 || 'Char' };
        const current = resolveCurrentOutfits(selections, { excludeLast: regenerating });
        const parts = [];
        for (const wearer of WEARERS) {
            const items = Array.from(selections[wearer], id => garments.get(id));
            for (const part of buildWearerContent(items, wearer, settings, wardrobeTemplates, names, wardrobeTemplates.image, current[wearer])) parts.push(part);
        }
        // 说明追加至最后一段文字，不改变角色内容块与图片的对应顺序。
        const note = settings.marker_mode === 'off' ? '' : buildMarkerNote(selections, names);
        if (note) {
            for (let index = parts.length - 1; index >= 0; index--) {
                if (parts[index].type === 'text') { parts[index].text += `\n\n${note}`; break; }
            }
        }
        if (parts.length) {
            // 多模态接口需要图片内容；全部读取成功后才修改请求，失败时不会注入一半清单。
            for (const part of parts) if (part.type === 'image_url') part.image_url.url = await loadSendImageDataUrl(part.image_url.url, settings.image_quality);
            insertWardrobeContent(event.chat, parts, settings.position);
            recordWardrobeLog('info', '已注入衣柜内容', { position: settings.position, parts: parts.length, library: activeLibraryId });
        }
    } catch (error) {
        recordWardrobeLog('error', 'injectWardrobeContent：捕获异常', error);
        toastr.error(String(error), '服装内容未发送');
    }
}

/**
 * 加载角色及图片模板，缺失或精确命中任一代原始默认值时升级，自定义内容保留并填入编辑器。
 * @returns {void} 无返回值。
 */
function loadWardrobeTemplates() {
    const saved = getVariables({ type: 'script' }).wardrobe_templates;
    for (const wearer of TEMPLATE_OWNERS) {
        const form = settingsPanel.querySelector(`[data-template-owner="${wearer}"]`);
        for (const field of TEMPLATE_FIELDS) {
            const value = saved?.[wearer]?.[field];
            wardrobeTemplates[wearer][field] = typeof value === 'string' && value.trim() && value !== PREVIOUS_DEFAULT_TEMPLATES[wearer][field] && value !== PREVIOUS_STORY_TEMPLATES[wearer][field] ? value : DEFAULT_TEMPLATES[wearer][field];
            form.elements[field].value = wardrobeTemplates[wearer][field];
        }
    }
}

/**
 * 独立保存当前角色或图片的两种模板；成功后才更新发送缓存，保留其他模板及设置。
 * @param {SubmitEvent} event 角色或图片模板表单提交事件。
 * @returns {void} 无返回值。
 */
function saveWardrobeTemplate(event) {
    event.preventDefault();
    const form = event.currentTarget;
    for (const field of TEMPLATE_FIELDS) form.elements[field].value = form.elements[field].value.trim();
    if (!form.reportValidity()) return;
    const wearer = form.dataset.templateOwner;
    const status = form.querySelector('.tw-template-status');
    try {
        const next = { ...wardrobeTemplates, [wearer]: { single: form.elements.single.value, wardrobe: form.elements.wardrobe.value } };
        insertOrAssignVariables({ wardrobe_templates: next }, { type: 'script' });
        wardrobeTemplates = next;
        status.textContent = '已保存';
        status.dataset.error = 'false';
    } catch (error) {
        recordWardrobeLog('error', 'saveWardrobeTemplate：捕获异常', error);
        status.textContent = `保存失败：${String(error)}`;
        status.dataset.error = 'true';
    }
}

/**
 * 修改模板后清除旧保存提示，避免尚未保存的模板被误认为已经用于发送。
 * @param {InputEvent} event 模板表单中的输入事件。
 * @returns {void} 无返回值。
 */
function clearTemplateStatus(event) {
    event.currentTarget.querySelector('.tw-template-status').textContent = '';
}

/**
 * 同步计算完整提示词的 64 位 FNV-1a 指纹，按 UTF-16 码元保留空白和转义差异。
 * @param {string} prompt 存档中的原始提示词。
 * @returns {bigint} 与旧默认值指纹比较用的无符号整数。
 */
function getDescriptionPromptFingerprint(prompt) {
    let hash = 0xcbf29ce484222325n;
    for (let index = 0; index < prompt.length; index++) {
        hash = BigInt.asUintN(64, (hash ^ BigInt(prompt.charCodeAt(index))) * 0x100000001b3n);
    }
    return hash;
}

/**
 * 在存档入口归一化两种描述提示词；缺失、空白或未编辑的旧默认值使用新版，自定义内容保持原样。
 * @returns {void} 无返回值。
 */
function loadDescriptionPrompts() {
    const saved = getVariables({ type: 'script' }).wardrobe_description_prompts;
    const form = settingsPanel.querySelector('.tw-description-form');
    for (const field of Object.keys(DEFAULT_DESCRIPTION_PROMPTS)) {
        const value = saved?.[field];
        const isCustomPrompt = typeof value === 'string' && value.trim() &&
            !LEGACY_DESCRIPTION_PROMPT_FINGERPRINTS[field].has(getDescriptionPromptFingerprint(value));
        descriptionPrompts[field] = isCustomPrompt ? value : DEFAULT_DESCRIPTION_PROMPTS[field];
        // item 与原生控件集合的方法同名，统一通过 namedItem 读取实际表单控件。
        form.elements.namedItem(field).value = descriptionPrompts[field];
    }
}

/**
 * 保存服装和单品的生成提示词；空白内容不可提交，存储失败时保留当前生效配置。
 * @param {SubmitEvent} event 描述生成设置表单的提交事件。
 * @returns {void} 无返回值。
 */
function saveDescriptionPrompts(event) {
    event.preventDefault();
    const form = event.currentTarget;
    for (const field of Object.keys(DEFAULT_DESCRIPTION_PROMPTS)) {
        const input = form.elements.namedItem(field);
        input.value = input.value.trim();
    }
    if (!form.reportValidity()) return;
    const status = form.querySelector('.tw-template-status');
    try {
        const next = { outfit: form.elements.namedItem('outfit').value, item: form.elements.namedItem('item').value };
        insertOrAssignVariables({ wardrobe_description_prompts: next }, { type: 'script' });
        descriptionPrompts = next;
        status.textContent = '已保存';
        status.dataset.error = 'false';
    } catch (error) {
        recordWardrobeLog('error', 'saveDescriptionPrompts：捕获异常', error);
        status.textContent = `保存失败：${String(error)}`;
        status.dataset.error = 'true';
    }
}

/**
 * 处理设置备份的选择文件、导出与导入；只传递明确允许的五类设置，始终排除全部 API 参数。
 * @param {MouseEvent|Event} event 导入／导出按钮点击或设置文件选择事件。
 * @returns {Promise<void>} 下载触发或设置保存并刷新表单后完成，失败在当前页提示。
 */
async function handleWardrobeData(event) {
    const input = settingsPanel.querySelector('.tw-data-import');
    if (event.type === 'click' && event.currentTarget.dataset.action === 'import-data') {
        input.click();
        return;
    }
    const importing = event.type === 'change';
    if (importing && !input.files.length) return;
    const status = settingsPanel.querySelector('.tw-data-status');
    const buttons = settingsPanel.querySelectorAll('[data-action="import-data"], [data-action="export-data"]');
    for (const button of buttons) button.disabled = true;
    status.textContent = importing ? '正在导入…' : '正在导出…';
    status.dataset.error = 'false';
    try {
        if (importing) {
            const settings = parseWardrobeSettingsData(JSON.parse(await input.files[0].text()));
            if (!root.isConnected) return;
            // 与手动切换发送类型保持一致，导入配置不能让当前已应用服装变成不可发送的状态。
            const selections = readWearerSelections();
            for (const wearer of WEARERS) {
                for (const id of selections[wearer]) buildWardrobeContent(garments.get(id), settings.send);
            }
            // 所有设置校验成功后一次提交；不从文件展开对象，也不读取或写入 wardrobe_api。
            insertOrAssignVariables({
                wardrobe_send: settings.send,
                wardrobe_templates: settings.templates,
                wardrobe_description_prompts: settings.description_prompts,
            }, { type: 'script' });
            loadSendSettings();
            loadWardrobeTemplates();
            loadDescriptionPrompts();
        } else {
            const templates = {};
            for (const owner of TEMPLATE_OWNERS) {
                templates[owner] = { single: wardrobeTemplates[owner].single, wardrobe: wardrobeTemplates[owner].wardrobe };
            }
            // 按字段构造备份，不导出脚本变量或设置对象整体，防止带出地址、模型、密钥及新增 API 字段。
            downloadWardrobeJson({
                format: 'tw-wardrobe-settings', version: 1,
                settings: {
                    send: {
                        content_type: sendSettings.content_type, position: sendSettings.position, marker_mode: sendSettings.marker_mode,
                        send_content_rating: sendSettings.send_content_rating, outfit_history_count: sendSettings.outfit_history_count,
                        image_quality: sendSettings.image_quality,
                    },
                    templates,
                    description_prompts: { outfit: descriptionPrompts.outfit, item: descriptionPrompts.item },
                },
            }, '衣柜设置.json');
        }
        status.textContent = importing ? '已导入设置' : '已导出设置';
    } catch (error) {
        recordWardrobeLog('error', 'handleWardrobeData：捕获异常', error);
        status.textContent = `${importing ? '导入' : '导出'}失败：${String(error)}`;
        status.dataset.error = 'true';
    } finally {
        if (importing) input.value = '';
        for (const button of buttons) button.disabled = false;
    }
}

/**
 * 在设置文件入口校验完整格式，并只提取允许恢复的字段；未知字段（包括 API）全部丢弃。
 * @param {unknown} data 从用户选择的 JSON 文件解析的数据。
 * @returns {{send: Object, templates: Object, description_prompts: Object}} 可直接保存的设置，不含 API 或服装数据。
 */
function parseWardrobeSettingsData(data) {
    if (data?.format !== 'tw-wardrobe-settings' || data.version !== 1 || !data.settings) {
        throw new Error('请选择“导出数据”生成的衣柜设置 JSON；服装备份请使用“导入服装”。');
    }
    const settings = data.settings;
    if (!['text', 'image', 'text_image'].includes(settings.send?.content_type) ||
        !['system_end', 'context_end', 'user_end'].includes(settings.send?.position)) {
        throw new Error('发送内容设置无效。');
    }
    // 旧备份缺失此字段时使用默认值，显式提供无效模式时拒绝导入。
    const markerMode = settings.send.marker_mode ?? DEFAULT_MARKER_MODE;
    if (!MARKER_MODES.includes(markerMode)) throw new Error('发送内容设置无效。');
    const imageQuality = settings.send.image_quality === undefined ? 'compressed' : settings.send.image_quality;
    if (imageQuality !== 'compressed' && imageQuality !== 'original') throw new Error('参考图画质设置无效。');
    if (settings.send.send_content_rating !== undefined && typeof settings.send.send_content_rating !== 'boolean') throw new Error('发送内容设置无效。');
    const historyCount = settings.send.outfit_history_count === undefined ? DEFAULT_OUTFIT_HISTORY_COUNT : settings.send.outfit_history_count;
    if (!isOutfitHistoryCount(historyCount)) throw new Error('历史楼层数须为非负整数。');
    const templates = {};
    for (const owner of TEMPLATE_OWNERS) {
        templates[owner] = {};
        for (const field of TEMPLATE_FIELDS) {
            const value = settings.templates?.[owner]?.[field];
            if (typeof value !== 'string' || !value.trim()) throw new Error('模板需要包含完整的 USER、Char 和图片模板。');
            templates[owner][field] = value.trim();
        }
    }
    const prompts = {};
    for (const field of Object.keys(DEFAULT_DESCRIPTION_PROMPTS)) {
        const value = settings.description_prompts?.[field];
        if (typeof value !== 'string' || !value.trim()) throw new Error('描述生成设置需要包含服装和单品提示词。');
        prompts[field] = value.trim();
    }
    return {
        send: {
            content_type: settings.send.content_type, position: settings.send.position, marker_mode: markerMode,
            send_content_rating: settings.send.send_content_rating ?? true, outfit_history_count: historyCount,
            image_quality: imageQuality,
        },
        templates, description_prompts: prompts,
    };
}

/**
 * 判断楼层数能否作为历史条数使用，允许只读本次输入的零值。
 * @param {unknown} count 表单或存档中的楼层数。
 * @returns {boolean} 是否为非负安全整数。
 */
function isOutfitHistoryCount(count) {
    return Number.isSafeInteger(count) && count >= 0;
}

/**
 * 加载发送设置；旧存档默认读取前两楼、发送分级并使用压缩参考图。
 * @returns {void} 无返回值。
 */
function loadSendSettings() {
    const saved = getVariables({ type: 'script' }).wardrobe_send;
    sendForm.elements.image_quality.value = saved?.image_quality === 'original' ? 'original' : 'compressed';
    sendForm.elements.send_content_rating.checked = typeof saved?.send_content_rating === 'boolean' ? saved.send_content_rating : true;
    const historyCount = isOutfitHistoryCount(saved?.outfit_history_count) ? saved.outfit_history_count : DEFAULT_OUTFIT_HISTORY_COUNT;
    sendForm.elements.outfit_history_count.value = String(historyCount);
    if (saved && typeof saved === 'object') {
        if (saved.content_type === 'text' || saved.content_type === 'image' || saved.content_type === 'text_image') {
            sendForm.elements.content_type.value = saved.content_type;
        }
        if (saved.position === 'system_end' || saved.position === 'context_end' || saved.position === 'user_end') {
            sendForm.elements.position.value = saved.position;
        }
        if (MARKER_MODES.includes(saved.marker_mode)) sendForm.elements.marker_mode.value = saved.marker_mode;
    }
    sendSettings = {
        content_type: sendForm.elements.content_type.value,
        position: sendForm.elements.position.value,
        marker_mode: sendForm.elements.marker_mode.value,
        send_content_rating: sendForm.elements.send_content_rating.checked,
        outfit_history_count: historyCount,
        image_quality: sendForm.elements.image_quality.value,
    };
}

/**
 * 选项变化后清除上次保存反馈，避免把尚未保存的选择误认为已保存。
 * @returns {void} 无返回值。
 */
function clearSendStatus() {
    sendForm.querySelector('.tw-send-status').textContent = '';
}

/**
 * 保存发送内容、参考图画质与选装设置；校验通过后再替换已保存设置。
 * @param {SubmitEvent} event 发送内容表单的提交事件。
 * @returns {void} 无返回值。
 */
function saveSendSettings(event) {
    event.preventDefault();
    const fields = sendForm.elements;
    const status = sendForm.querySelector('.tw-send-status');
    try {
        const historyCount = fields.outfit_history_count.value.trim() ? Number(fields.outfit_history_count.value) : NaN;
        if (!isOutfitHistoryCount(historyCount)) throw new Error('历史楼层数须为非负整数。');
        const nextSettings = {
            content_type: fields.content_type.value,
            position: fields.position.value,
            marker_mode: fields.marker_mode.value,
            send_content_rating: fields.send_content_rating.checked,
            outfit_history_count: historyCount,
            image_quality: fields.image_quality.value,
        };
        const selections = readWearerSelections();
        for (const wearer of WEARERS) {
            for (const id of selections[wearer]) buildWardrobeContent(garments.get(id), nextSettings);
        }
        insertOrAssignVariables({ wardrobe_send: nextSettings }, { type: 'script' });
        sendSettings = nextSettings;
        status.textContent = '已保存';
        status.dataset.error = 'false';
    } catch (error) {
        recordWardrobeLog('error', 'saveSendSettings：捕获异常', error);
        status.textContent = `保存失败：${String(error)}`;
        status.dataset.error = 'true';
    }
}

/**
 * 加载浏览器本地连接并迁移旧脚本变量；旧版跟随预设的参数显示为当前实际数值。
 * @returns {void} 无返回值。
 */
function loadApiSettings() {
    const legacy = getVariables({ type: 'script' }).wardrobe_api;
    if (legacy?.key) logSecrets.add(legacy.key);
    let saved = legacy;
    let storageFailed = false;
    try {
        const storage = window.parent.localStorage;
        const storageKey = getApiStorageKey();
        const stored = storage.getItem(storageKey);
        saved = stored === null ? legacy : JSON.parse(stored);
        if (saved?.key) logSecrets.add(saved.key);
        if (saved !== undefined && (!saved || typeof saved !== 'object' || Array.isArray(saved))) {
            throw new Error('API 配置格式不正确。');
        }
        if (legacy !== undefined) {
            // 先持久保存再删旧变量，防止存储被禁用时丢失密钥；本机已有配置时不被导入的脚本覆盖。
            if (stored === null) storage.setItem(storageKey, JSON.stringify(saved));
            deleteVariable('wardrobe_api', { type: 'script' });
        }
    } catch (error) {
        recordWardrobeLog('error', 'loadApiSettings：捕获异常', error);
        // 界面保留固定提示；日志在脱敏后记录原始异常和堆栈，便于排查存储权限和迁移失败。
        storageFailed = true;
    }
    const preset = getPreset('in_use').settings;
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        apiForm.elements.mode.value = saved.mode === 'custom' ? 'custom' : 'host';
        for (const name of ['apiurl', 'key', 'model']) {
            const value = saved[name];
            if (typeof value === 'string' || typeof value === 'number') {
                apiForm.elements[name].value = String(value);
            }
        }
    }
    // 参数只在配置入口归一化；零温度是有效配置，不能用真值判断覆盖它。
    for (const [name, fallback] of [['temperature', preset.temperature], ['max_tokens', preset.max_completion_tokens]]) {
        const value = saved?.[name];
        apiForm.elements[name].value = String(typeof value === 'number' && Number.isFinite(value) ? value : fallback);
    }
    updateApiMode();
    savedApiSettings = collectApiSettings();
    if (storageFailed) setApiStatus('API 配置读取或迁移失败，请检查浏览器本地存储权限及脚本变量清理权限；确认成功前不要分享脚本。', true);
}

/**
 * 为当前脚本生成浏览器存储键，避免多个衣柜脚本互相覆盖连接；此存储不进入脚本导出。
 * @returns {string} 当前酒馆站点及脚本使用的本地配置键。
 */
function getApiStorageKey() {
    return `tavern-wardrobe:api:${getScriptId()}`;
}

/**
 * 隐藏并禁用未使用的自定义字段，让酒馆连接不受这些字段的表单校验影响。
 * @returns {void} 无返回值。
 */
function updateApiMode() {
    closeModelOptions();
    const custom = apiForm.elements.mode.value === 'custom';
    const fields = apiForm.querySelector('.tw-api-custom');
    fields.hidden = !custom;
    fields.disabled = !custom;
    apiForm.elements.apiurl.required = custom;
    apiForm.elements.model.required = custom;
    apiForm.querySelector('.tw-api-status').textContent = '';
}

/**
 * 根据输入单次过滤模型；没有选项时展示本次获取状态，避免失败后仍显示首次使用提示。
 * @param {Event} [event] 输入事件触发搜索；焦点、展开按钮和刷新模型时展示全部选项。
 * @returns {void} 无返回值。
 */
function openModelOptions(event) {
    const input = apiForm.elements.model;
    const list = apiForm.querySelector('#tw-api-models');
    const query = event?.type === 'input' ? input.value.trim().toLowerCase() : '';
    const options = hostDocument.createDocumentFragment();
    let count = 0;
    for (const model of apiModels) {
        if (query && !model.toLowerCase().includes(query)) continue;
        const option = hostDocument.createElement('button');
        option.type = 'button';
        option.id = `tw-api-model-option-${count++}`;
        option.tabIndex = -1;
        option.dataset.model = model;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', String(model === input.value));
        option.textContent = model;
        options.append(option);
    }
    if (!count) {
        const empty = hostDocument.createElement('span');
        empty.className = 'tw-model-empty';
        empty.textContent = apiModels.length ? '无匹配模型，可继续手动输入' : modelListMessage;
        empty.dataset.error = String(!apiModels.length && modelListError);
        empty.setAttribute('role', 'status');
        options.append(empty);
    }
    list.replaceChildren(options);
    list.hidden = false;
    activeModelIndex = -1;
    input.removeAttribute('aria-activedescendant');
    input.setAttribute('aria-expanded', 'true');
    const toggle = apiForm.querySelector('[data-action="toggle-models"]');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '收起模型列表');
}

/**
 * 收起模型列表并清理辅助技术状态，保留输入的模型和已获取的模型数据。
 * @returns {void} 无返回值。
 */
function closeModelOptions() {
    apiForm.querySelector('#tw-api-models').hidden = true;
    apiForm.elements.model.setAttribute('aria-expanded', 'false');
    apiForm.elements.model.removeAttribute('aria-activedescendant');
    const toggle = apiForm.querySelector('[data-action="toggle-models"]');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '展开模型列表');
    activeModelIndex = -1;
}

/**
 * 用箭头按钮展开或收起列表，展开时将输入焦点交回模型框。
 * @returns {void} 无返回值。
 */
function toggleModelOptions() {
    if (!apiForm.querySelector('#tw-api-models').hidden) {
        closeModelOptions();
        return;
    }
    apiForm.elements.model.focus();
    openModelOptions();
}

/**
 * 输入框支持方向键选择与回车确认；滚动条将焦点交给对话框后，Escape 仍优先收起列表。
 * @param {KeyboardEvent} event 设置面板内冒泡的键盘事件。
 * @returns {void} 无返回值。
 */
function navigateModelOptions(event) {
    if (event.target !== apiForm.elements.model && event.key !== 'Escape') return;
    const list = apiForm.querySelector('#tw-api-models');
    if (event.key === 'Tab') {
        closeModelOptions();
        return;
    }
    if (event.key === 'Escape' && !list.hidden) {
        event.preventDefault();
        event.stopPropagation();
        closeModelOptions();
        return;
    }
    if (event.key === 'Enter' && !list.hidden) {
        event.preventDefault();
        const active = list.querySelectorAll('[role="option"]')[activeModelIndex];
        if (active) apiForm.elements.model.value = active.dataset.model;
        closeModelOptions();
        return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    if (list.hidden) openModelOptions();
    const options = list.querySelectorAll('[role="option"]');
    if (!options.length) return;
    activeModelIndex = activeModelIndex < 0 ? (event.key === 'ArrowDown' ? 0 : options.length - 1) : (activeModelIndex + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
    for (let index = 0; index < options.length; index++) {
        options[index].setAttribute('aria-selected', String(index === activeModelIndex));
    }
    const active = options[activeModelIndex];
    apiForm.elements.model.setAttribute('aria-activedescendant', active.id);
    active.scrollIntoView({ block: 'nearest' });
}

/**
 * 将点击的模型写回输入框，选项数据已经在模型接口入口校验。
 * @param {MouseEvent} event 模型列表内的点击事件。
 * @returns {void} 无返回值。
 */
function selectModelOption(event) {
    const option = event.target.closest('[data-model]');
    if (!option) return;
    apiForm.elements.model.value = option.dataset.model;
    apiForm.elements.model.focus();
    closeModelOptions();
}

/**
 * 焦点明确移到外部控件时收起列表；滚动条交互造成的空目标或对话框焦点回退仍保留列表。
 * @param {FocusEvent} event 模型选择器的焦点离开事件。
 * @returns {void} 无返回值。
 */
function leaveModelOptions(event) {
    // 浏览器点击原生滚动条时会把焦点交给外层对话框；是否点击外部空白由点击监听判断。
    if (event.relatedTarget && event.relatedTarget !== settingsPanel && !event.currentTarget.contains(event.relatedTarget)) closeModelOptions();
}

/**
 * 点击设置中的其他区域时收起模型列表，避免列表占用无关表单的空间。
 * @param {MouseEvent} event 设置面板的点击事件。
 * @returns {void} 无返回值。
 */
function dismissModelOptions(event) {
    // 获取按钮属于模型操作，保留刚展开的加载结果；点击其他区域仍按原有方式收起。
    if (!event.target.closest('.tw-model-picker, [data-api-action="models"]')) closeModelOptions();
}

/**
 * 按用户操作切换密钥可见性，不修改密钥内容或保存状态。
 * @param {MouseEvent} event 密钥显示按钮的点击事件。
 * @returns {void} 无返回值。
 */
function toggleApiKey(event) {
    const visible = apiForm.elements.key.type === 'password';
    apiForm.elements.key.type = visible ? 'text' : 'password';
    event.currentTarget.textContent = visible ? '隐藏' : '显示';
    event.currentTarget.setAttribute('aria-pressed', String(visible));
    event.currentTarget.setAttribute('aria-label', `${visible ? '隐藏' : '显示'} API Key`);
}

/**
 * 修改地址后清除上次协议校验提示，让原生表单能够再次触发保存校验。
 * @param {InputEvent} event 接口地址输入事件。
 * @returns {void} 无返回值。
 */
function clearApiUrlValidity(event) {
    event.currentTarget.setCustomValidity('');
}

/**
 * 校验用户输入并读取连接配置；获取模型时允许尚未填写模型名称。
 * @param {boolean} requireModel 是否要求自定义连接已填写模型。
 * @returns {Object|null} 可交给酒馆助手的配置及连接方式，校验不通过时返回空值。
 */
function readApiSettings(requireModel) {
    const fields = apiForm.elements;
    const custom = fields.mode.value === 'custom';
    fields.model.required = custom && requireModel;
    fields.apiurl.value = fields.apiurl.value.trim();
    fields.model.value = fields.model.value.trim();
    fields.apiurl.setCustomValidity('');
    if (custom && fields.apiurl.value && fields.apiurl.validity.valid) {
        const url = new URL(fields.apiurl.value);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            fields.apiurl.setCustomValidity('接口地址必须使用 HTTP 或 HTTPS。');
        }
    }
    if (!apiForm.reportValidity()) return null;
    return collectApiSettings();
}

/**
 * 将已校验或在加载入口归一化的表单值转换为 API 配置，供保存与首次加载共同使用。
 * @returns {Object} API 连接配置。
 */
function collectApiSettings() {
    const fields = apiForm.elements;
    return {
        mode: fields.mode.value,
        apiurl: fields.apiurl.value,
        key: fields.key.value.trim(),
        model: fields.model.value,
        source: 'openai',
        temperature: fields.temperature.valueAsNumber,
        max_tokens: fields.max_tokens.valueAsNumber,
    };
}

/**
 * 将连接保存在当前浏览器，清理可随脚本导出的旧配置；保存失败时不切换识图使用的连接。
 * @param {SubmitEvent} event API 表单的提交事件。
 * @returns {void} 无返回值。
 */
function saveApiSettings(event) {
    event.preventDefault();
    const config = readApiSettings(true);
    if (!config) return;
    if (config.key) logSecrets.add(config.key);
    try {
        window.parent.localStorage.setItem(getApiStorageKey(), JSON.stringify(config));
        deleteVariable('wardrobe_api', { type: 'script' });
        savedApiSettings = config;
        setApiStatus('已保存到当前浏览器');
    } catch (error) {
        recordWardrobeLog('error', 'saveApiSettings：捕获异常', error);
        setApiStatus('保存失败，请检查浏览器本地存储权限及脚本变量清理权限；确认成功前不要分享脚本。', true);
    }
}

/**
 * 获取模型或测试当前表单连接，复用宿主请求接口，避免另建跨域代理和请求协议。
 * @param {MouseEvent} event 获取模型或测试连接按钮的点击事件。
 * @returns {Promise<void>} 请求及状态更新完成后结束。
 */
async function requestApi(event) {
    const action = event.currentTarget.dataset.apiAction;
    const config = readApiSettings(action === 'test');
    if (!config) return;
    const request = { generationId: action === 'test' ? `wardrobe-test-${Date.now()}` : null };
    apiRequest = request;
    setApiBusy(true);
    if (action === 'models') {
        // 每次获取都绑定当前地址和密钥，失败时不继续展示上一次连接的旧模型。
        apiModels = [];
        modelListMessage = '正在获取模型…';
        modelListError = false;
        openModelOptions();
    }
    setApiStatus(action === 'models' ? '正在获取模型…' : '正在测试连接…');
    try {
        if (action === 'models') {
            const models = await loggedGetModelList({ apiurl: config.apiurl, key: config.key });
            if (apiRequest !== request) return;
            // 模型名称在接口入口校验一次，后续过滤与选择只处理已确定的字符串。
            if (!Array.isArray(models) || models.some(model => typeof model !== 'string')) {
                throw new Error('接口返回的模型列表格式不正确。');
            }
            apiModels = Array.from(new Set(models));
            // 宿主可能只返回空列表；没有明确鉴权错误时，不能断言一定是密钥无效。
            modelListMessage = '未获取到模型，请检查接口地址、API Key 或模型列表权限，也可手动输入';
            openModelOptions();
            setApiStatus(apiModels.length ? `已获取 ${apiModels.length} 个模型` : '接口未返回模型，可手动输入模型名称');
        } else {
            const { mode, ...customApi } = config;
            // 测试只发送固定短句，不携带角色、世界书或聊天历史，也不写入聊天记录。
            const reply = await loggedGenerateRaw({
                generation_id: request.generationId,
                user_input: '请只回复 OK。',
                ordered_prompts: ['user_input'],
                max_chat_history: 0,
                should_stream: false,
                should_silence: true,
                ...(mode === 'custom' ? { custom_api: customApi } : {}),
            });
            if (apiRequest !== request) return;
            if (typeof reply !== 'string' || !reply.trim()) throw new Error('接口未返回文本回复。');
            setApiStatus('连接成功，模型已响应');
        }
    } catch (error) {
        recordWardrobeLog('error', 'requestApi：捕获异常', error);
        if (apiRequest === request) {
            const message = describeApiError(error, config.key);
            if (action === 'models') {
                modelListMessage = `获取模型失败：${message}`;
                modelListError = true;
                openModelOptions();
            }
            setApiStatus(`请求失败：${message}`, true);
        }
    } finally {
        if (apiRequest === request) {
            apiRequest = null;
            setApiBusy(false);
        }
    }
}

/**
 * 将接口明确返回的鉴权或权限错误转成可操作提示，其余错误隐藏本次密钥后保留原因。
 * @param {unknown} error 宿主请求接口抛出的错误。
 * @param {string} [key] 本次请求使用的密钥，未指定时采用已保存连接的密钥。
 * @returns {string} 供识图、模型列表和连接测试共同使用的错误说明。
 */
function describeApiError(error, key = savedApiSettings.key) {
    const message = typeof error?.message === 'string' ? error.message : String(error);
    const status = String(error?.status ?? error?.response?.status ?? '');
    if (status === '401' || /\b401\b|unauthorized|(?:invalid|incorrect|expired)[\s_-]+(?:api[\s_-]+)?key/i.test(message)) {
        return 'API Key 验证失败，请检查密钥是否正确或已失效';
    }
    if (status === '403' || /\b403\b|forbidden/i.test(message)) {
        return '访问被拒绝，请检查 API Key 权限或服务端访问限制';
    }
    // 上游可能将请求参数写入错误文本；在所有 API 错误进入界面前移除实际使用的密钥。
    return key ? message.replaceAll(key, '[已隐藏密钥]') : message;
}

/**
 * 同步请求期间的可编辑状态，避免重复提交及返回结果对应到已改动的地址。
 * @param {boolean} busy 是否正在执行 API 请求。
 * @returns {void} 无返回值。
 */
function setApiBusy(busy) {
    if (busy) closeModelOptions();
    apiForm.querySelector('.tw-api-fields').disabled = busy;
    for (const button of apiForm.querySelectorAll('.tw-api-actions button')) button.disabled = busy;
    apiForm.setAttribute('aria-busy', String(busy));
}

/**
 * 将操作结果写入现有状态区，使键盘与屏幕阅读器用户都能收到结果。
 * @param {string} message 要显示的操作结果。
 * @param {boolean} error 是否使用错误样式。
 * @returns {void} 无返回值。
 */
function setApiStatus(message, error = false) {
    const status = apiForm.querySelector('.tw-api-status');
    status.textContent = message;
    status.dataset.error = String(error);
}

/**
 * 关闭或卸载时停止本次测试；宿主模型列表接口不提供取消能力，因此丢弃失效结果。
 * @returns {void} 无返回值。
 */
function stopApiRequest() {
    if (!apiRequest) return;
    recordWardrobeLog('info', '取消 API 请求', { generationId: apiRequest.generationId });
    const request = apiRequest;
    apiRequest = null;
    if (request.generationId) stopGenerationById(request.generationId);
    else {
        modelListMessage = '获取已取消，可重新获取模型或手动输入';
        modelListError = false;
        closeModelOptions();
    }
    setApiBusy(false);
    setApiStatus('请求已取消');
}

/**
 * 切换 API、发送内容、模板、描述生成及数据设置页，保留服装详情的未保存内容。
 * @param {MouseEvent} event 设置导航中的点击事件。
 * @returns {void} 无返回值。
 */
function selectSettingsPage(event) {
    const button = event.target.closest('button[data-settings-page]');
    if (!button) return;
    for (const item of settingsPanel.querySelectorAll('[data-settings-page]')) {
        item.setAttribute('aria-pressed', String(item === button));
    }
    for (const page of settingsPanel.querySelectorAll('[data-settings-content]')) {
        page.hidden = page.dataset.settingsContent !== button.dataset.settingsPage;
    }
    settingsPanel.querySelector('.tw-settings-content').scrollTop = 0;
}

/**
 * 切换分类高亮和真实服装列表，手机与侧栏共用同一分类状态。
 * @param {MouseEvent} event 分类列表中的点击事件。
 * @returns {void} 无返回值。
 */
function selectCategory(event) {
    const button = event.target.closest('button[data-category]');
    if (!button) return;
    updateCategory(button.dataset.category);
}

/**
 * 将手机选择器的分类选择转交给侧栏共用入口，避免两处选项状态分离。
 * @param {Event} event 原生分类选择器触发的变化事件。
 * @returns {void} 无返回值。
 */
function selectCategoryOption(event) {
    updateCategory(event.currentTarget.value);
}

/**
 * 同步分类按钮、手机选择器与独立标签选择；只在紧凑布局中滚动以露出当前分类。
 * @param {string} id 来自本文件分类入口的分类标识。
 * @returns {void} 无返回值。
 */
function updateCategory(id) {
    checkedGarmentIds.clear();
    selectedGroupByFilter.set(currentCategory, currentGroup);
    currentCategory = id;
    currentGroup = selectedGroupByFilter.get(id) ?? '*';
    let selectedButton;
    for (const item of panel.querySelectorAll('[data-category]')) {
        const selected = item.dataset.category === id;
        item.setAttribute('aria-pressed', String(selected));
        if (selected) selectedButton = item;
    }
    panel.querySelector('.tw-mobile-filter select').value = id;
    renderGarmentLibrary();
    if (compactViewport.matches) selectedButton.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

/**
 * 在手机列表和详情之间切换；界面状态保存在面板上，桌面仍由样式展示三栏。
 * @returns {void} 无返回值。
 */
function toggleMobileDetails() {
    setMobileDetails(panel.dataset.mobileScreen !== 'details');
}

/**
 * 同步手机内容区和底部返回入口，不复制预览或详情 DOM。
 * @param {boolean} expanded 是否展示详情页面。
 * @returns {void} 无返回值。
 */
function setMobileDetails(expanded) {
    panel.dataset.mobileScreen = expanded ? 'details' : 'library';
    const button = panel.querySelector('[data-action="toggle-details"]');
    button.setAttribute('aria-expanded', String(expanded));
    button.querySelector('span').textContent = expanded ? '返回列表' : '服装详情';
    // 每次进入详情从预览开始；返回列表时保留分类及列表原有的浏览位置。
    if (expanded) panel.querySelector('.tw-details').scrollTop = 0;
}

/**
 * 同步工具栏与真实服装列表的网格或列表显示方式。
 * @param {MouseEvent} event 显示方式按钮组中的点击事件。
 * @returns {void} 无返回值。
 */
function selectView(event) {
    const button = event.target.closest('button[data-view]');
    if (!button) return;
    for (const item of panel.querySelectorAll('[data-view]')) {
        item.setAttribute('aria-pressed', String(item.dataset.view === button.dataset.view));
    }
    panel.querySelector('.tw-library').dataset.layout = button.dataset.view;
}

/**
 * 接收搜索词并合并连续输入，仅重绘列表，保留详情草稿；清空搜索立即恢复筛选结果。
 * @param {Event} event 搜索框输入事件。
 * @returns {void} 无返回值。
 */
function searchGarments(event) {
    window.parent.clearTimeout(garmentSearchTimer);
    garmentSearch = event.currentTarget.value.trim().toLocaleLowerCase();
    checkedGarmentIds.clear();
    // 输入期间延后 150 毫秒重建卡片，避免每敲一个字符都重建图片节点。
    if (garmentSearch) garmentSearchTimer = window.parent.setTimeout(renderGarmentLibrary, 150);
    else renderGarmentLibrary();
}

/**
 * 将原生菜单的排序选择用于当前列表，保留批量勾选和详情中的未保存内容。
 * @param {Event} event 排序菜单变化事件。
 * @returns {void} 无返回值。
 */
function sortGarments(event) {
    garmentSort = event.currentTarget.value;
    window.parent.clearTimeout(garmentSearchTimer);
    renderGarmentLibrary();
}

/**
 * 切换右侧详情分组，保留名称、分类与描述的未保存编辑内容。
 * @param {MouseEvent} event 详情分组中的点击事件。
 * @returns {void} 无返回值。
 */
function selectDetail(event) {
    const button = event.target.closest('button[data-detail]');
    if (!button) return;
    for (const item of panel.querySelectorAll('[data-detail]')) {
        item.setAttribute('aria-pressed', String(item === button));
    }
    for (const page of panel.querySelectorAll('[data-detail-page]')) {
        page.hidden = page.dataset.detailPage !== button.dataset.detail;
    }
}

/**
 * 关闭后清除临时提示并恢复入口焦点，重新打开时不会残留上一次操作结果。
 * @returns {void} 无返回值。
 */
function restoreFocus() {
    setLibraryStatus('');
    opener.focus({ preventScroll: true });
}

/**
 * 停用或重载时中止图片和备份读取、注销请求和聊天监听，并清理界面。
 * @returns {void} 无返回值。
 */
function destroyWardrobe() {
    stopDescriptionRequest();
    stopOutfitRequest();
    closeGarmentImage();
    if (logsPanel.open) logsPanel.close();
    if (panel.querySelector('#tw-ask').open) panel.querySelector('#tw-ask').close('cancel');
    if (importConflictDialog?.open) importConflictDialog.close();
    closeImageImport();
    closeWardrobeExport();
    closeGarmentGroupManager();
    closeCombinationEditor();
    window.parent.clearTimeout(garmentSearchTimer);
    window.parent.clearTimeout(garmentTagSearchTimer);
    window.parent.clearTimeout(libraryStatusTimer);
    for (const subscription of subscriptions) subscription.stop();
    wardrobeReadController.abort();
    for (const reader of imageReaders) reader.abort();
    for (const decoded of imageDecoders) {
        decoded.onerror();
        decoded.src = '';
    }
    for (const cache of [imageDataCache, sendImageCache]) {
        cache.entries.clear();
        cache.bytes = 0;
    }
    garmentSearchIndex = undefined;
    if (exportUrl) window.parent.URL.revokeObjectURL(exportUrl);
    panel.removeEventListener('close', restoreFocus);
    closeSettings();
    if (panel.open) panel.close();
    menuEntry.remove();
    root.remove();
    stopWardrobeLogging();
}

/**
 * 在启动边界显示带脚本名称的错误提示，方便定位与其他脚本无关的报错。
 * @returns {void} 无返回值。
 */
function startWardrobe() {
    try {
        installWardrobeLogging();
        initializeWardrobe();
    } catch (error) {
        recordWardrobeLog('error', 'startWardrobe：捕获异常', error);
        console.error('[衣柜插件] 启动失败', error);
        // 配置损坏时刷新会再次失败，入口直接展示已创建的面板，让用户仍能导出启动日志。
        if (menuEntry && panel) {
            menuEntry.removeEventListener('click', openWardrobe);
            menuEntry.addEventListener('click', openFailedWardrobe);
        }
        toastr.error(String(error), '衣柜插件启动失败', { timeOut: 0, extendedTimeOut: 0 });
    }
}

// 等待宿主文档就绪，避免把脚本 iframe 的加载状态误当成酒馆页面状态。
if (hostDocument.readyState === 'loading') {
    hostDocument.addEventListener('DOMContentLoaded', startWardrobe, { once: true });
} else {
    startWardrobe();
}
})();
