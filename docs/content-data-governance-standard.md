# ArchZZ 内容数据治理标准

状态：评审稿  
适用范围：ArchZZ 海外站公开及候选模型  
关联文档：海外站产品与商业重构 PRD（专业性与交易信任）
使用者：产品、内容、开发、测试

一、目标与原则
前期内容抽检中发现，内容质量不达标是海外站用户无法建立信任并形成购买转化的重要因素之中，现存大量内容展示 --，封面图存在中文，下载后文件名为中文，不符合高质量国际化站点的内容质量基本要求。
本标准用于发现并治理模型的标题、分类、软件、专业参数、文件包、下载文件名、图片和公开状态问题。开发先输出全量数据报告，产品和素材运营团队再按标准决定自动修复、隐藏、人工处理或阻断。
- 首轮只读扫描，不直接修改、删除或下架；
- 能可靠修复的进入修复队列；缺失或不可靠的非关键字段前台隐藏；
- 影响购买判断、文件使用或交付的关键问题禁止公开或交易；
- 不展示 --、空标签、推断值或虚构值；隐藏不等于删除，原始值和问题原因必须保留；
- 自动翻译、OCR、图片质量分和识别模型只用于发现问题，不能单独决定下架；
- 批量修改前必须抽检，修改必须留痕并可回滚。

二、现有表与数据关系
本标准以数据库表结构 STRUCT_archzz.xls 为依据。相关数据分布如下：
作用
现有表
主要字段
商品与公开状态
overseas_commodity
commodityId、skuId、physicalModelId、classifyId、标题、图片、status、价格、format、type、owner
SKU 专业参数
modelfile、overseas_modelfile
id、physicalModelId、文件名/版本/大小、软件、Renderer、主格式、解析结果ID、面数、材质贴图、灯光、插件、代理及分辨率等
物理文件与原图
overseas_physicalmodel
physicalModelId、fileUrl、fileMd5、fileLength、version、主图/附图、status
处理后的详情图
overseas_detail_images_show
sku_id、原图/处理图URL、顺序、处理状态、图片规格、删除状态
多语言标题
overseas_model_multi_language
sku_id、中文、英文原文及日/韩/法/西等翻译
翻译失败
overseas_model_multi_language_fail
原始内容、文件名和错误信息
分类
domestic_overseas_classify
分类ID、名称、层级、父级、类型和展示状态
扩展属性
overseas_property、overseas_commoditypropertyvalue
属性定义、是否展示和商品属性值
预期主关联：overseas_commodity.skuId = modelfile.id，再通过 physicalModelId 关联 overseas_physicalmodel；图片和多语言表通过 sku_id 关联 SKU。开发必须先用实际数据验证覆盖率、一对一关系及孤立记录，再确定正式查询。
以下结构问题尚未确认：
1. modelfile 与 overseas_modelfile 字段几乎相同，但事实表、同步方向和差异未说明；不得简单合并计数；
2. package_parse_result_id 对应的结果表或接口不在本次表结构中；
3. 商品、SKU和物理模型分别有状态、版本、大小和图片字段，当前线上实际读取优先级需要开发确认；
4. 旧商品价格字段的单位和历史用途仍需识别，但不作为新版交易价格来源；新版普通付费 SKU 统一按服务端定价配置返回的 $1.99 USD 结算。

三、扫描层级
1. 数据库层： 全量检查商品—SKU—物理文件—分类—图片—多语言关联、字段缺失、枚举冲突、状态和价格；
2. 对象存储层： 对公开商品检查文件和图片URL，读取实际文件大小、图片尺寸和文件哈希；
3. 文件包层： 优先使用已有压缩包解析结果；无法取得时分批下载，检查解压、主文件、内部路径、贴图和依赖。
报告必须注明每层已扫描数量和覆盖率。“未扫描”不得记为“无问题”或 PASS。
模型能否由 SketchUp 或 3ds Max 正常打开，沿用知末中国既有上架验证结果，本次治理不要求对 90 万 SKU 重新执行软件打开验证。只有文件投诉、解压异常或专项排查时才另行人工复核，不作为全量治理层级。

四、现有字段治理规则
检查项
现有数据来源
处理规则
商品/SKU 关联
overseas_commodity.skuId、modelfile.id、双方 physicalModelId
缺失、重复或物理模型ID冲突时禁止交易，进入技术核验
公开状态
商品、SKU、物理模型三张表的 status
商品上架但SKU删除或物理模型未通过时禁止交易；状态枚举先由开发核实
软件类型
商品/SKU的 type、soft_name、model_main_format、实际扩展名
多字段一致时判定SU/3ds Max；冲突时不进入软件频道并核验
英文标题
overseas_commodity.title、多语言表 original_text
空、纯中文、乱码、网址/联系方式或无意义编号时修复；审核后再写正式字段
多语言
多语言表和失败表
统计各语言覆盖率及失败数；缺失时回退英文，不阻断英文站公开
分类
classifyId 与分类表
缺失、无效、隐藏分类或类型冲突时不进入频道/推荐；错分人工修复
文件名
modelfile.file_name
中文和不安全字符可直接统计；下载响应使用英文别名，不修改原文件
文件版本
modelfile.file_version、物理模型 version
一致才展示；缺失或冲突时隐藏并报告
文件大小
SKU大小、物理模型大小、对象存储实际大小
以实际对象校验；不一致时修复，无法访问时禁止交易
Renderer
modelfile.renderer、商品 format
有效且不冲突才展示；缺失或异常时隐藏，不按软件补值
材质/贴图/灯光
SKU相关专业字段
先统计非空率和枚举；非空不等于完整可用，必要时检查文件包
面数等参数
polys、precision、代理/组件/场景/分辨率字段
合法且通过值域检查才展示；缺失或异常时隐藏
商品图片
商品、SKU、物理模型三处图片字段
先确认前台实际来源；统计缺图、URL失效和来源不一致
详情图处理
overseas_detail_images_show
原则上仅使用未删除且处理成功的图片；最终以核实后的前端逻辑为准
价格
服务端新版定价配置；商品旧价格、原价、单位和旧会员字段
新版普通付费 SKU 统一按 $1.99 USD 结算；旧字段仅用于历史识别和报告，不作为新版结算依据
来源
商品 owner、physicalModelId
暂时前台统一显示 ArchZZ Studio；不把 owner 直接当可靠作者展示

五、文件包与下载名
- 外层下载名由服务端生成：archzz-{sku}-{english-slug}.zip，不需要修改 modelfile.file_name 或存储对象；
- file_name 中的中文可直接统计；内部中文目录、主文件名和贴图路径只能从解析结果或文件包取得；
- 不得直接批量重命名包内文件，避免破坏贴图、代理和场景引用；
- 重打包后必须重新执行解压、打开和依赖检查；原始包保留用于回滚；
- 文件缺失、URL失效、不可解压、无 .skp/.max 主文件、含不安全程序或依赖损坏时禁止交易。

六、图片治理
- 以线上实际使用的列表图、主图和详情图为检查对象；
- URL失效、损坏、主体不可辨、货图不符、含促销中文、价格、联系方式、二维码、站外水印、教程或大面积软件界面时，不得作为公开封面；
- 场景本身自然存在的文字不自动违规，由人工复核；
- 图片尺寸必须请求实际图片读取，数据库URL和处理参数不能代替原图检查；
- 建议原图长边不少于1200px、短边不少于800px；低于标准进入替换队列，不通过放大伪造清晰度；
- 审美不足但准确、清晰、不误导的商品可以销售，但不得进入首页首屏、Today's Free、Editor's Picks 或广告精选位；
- OCR、感知哈希、水印/UI截图识别和美学评分只生成候选问题，不自动下架。

七、治理状态与建议新增表
治理状态：SCAN_PENDING、PASS、PASS_WITH_HIDDEN_FIELDS、AUTO_FIX_PENDING、MANUAL_REVIEW、BLOCKED。
现有业务表没有治理状态、问题明细、规则版本和修改记录。建议独立新增：
7.1`overseas_sku_governance`
每个SKU一行，建议至少记录：sku_id、governance_status、各扫描层完成状态、rule_version、recommendation_eligible、last_scanned_at、last_reviewed_at。具体字段、索引、运行批次和状态计算方式由技术方案确定。
7.2`overseas_sku_governance_issue`
一个SKU可有多条问题：id、sku_id、reason_code、severity、source_table、source_column、detected_value、issue_status、detected_by、detected_at、resolved_at。
首版 reason code：
COMMODITY_SKU_MISSING、SKU_PHYSICAL_MISSING、PHYSICAL_ID_CONFLICT、STATUS_CONFLICT、SOFTWARE_UNKNOWN、SOFTWARE_CONFLICT、TITLE_MISSING、TITLE_NON_ENGLISH、TRANSLATION_MISSING、CATEGORY_MISSING、CATEGORY_INVALID、IMAGE_MISSING、IMAGE_URL_INVALID、IMAGE_LOW_RES、IMAGE_PROMOTIONAL_TEXT、IMAGE_UI_SCREENSHOT、FILE_URL_INVALID、FILE_SIZE_CONFLICT、FILENAME_NON_ENGLISH、ARCHIVE_INVALID、MAIN_FILE_MISSING、INTERNAL_PATH_NON_ENGLISH、VERSION_MISSING、VERSION_CONFLICT、RENDERER_MISSING、RENDERER_CONFLICT、ASSET_METADATA_UNKNOWN、ASSET_DEPENDENCY_BROKEN、PRICE_LEGACY_OR_INVALID。
新增代码必须同步更新规则版本和数据字典。
7.3`overseas_sku_governance_change_log`
记录批量修改：id、sku_id、table_name、column_name、old_value、new_value、task_id、operator、created_at。
新增治理表只记录检测和整改结果，不替代现有业务表。首轮只生成报告；批量修改或启用 BLOCKED 拦截前必须完成抽检。本文只规定业务所需结果，不限定最终技术表结构。

八、开发首轮报告
开发输出两份CSV：SKU明细和聚合汇总。
SKU明细至少包含：commodityId、skuId、physicalModelId、三张主表状态、关联结果、软件相关字段、标题与多语言状态、classifyId、图片URL与处理状态、file_name、两个版本字段、三个文件大小值、Renderer两个来源、专业字段非空状态、价格字段、各扫描层状态、治理状态、reason code和建议动作。
聚合汇总必须给出：
- 商品、两张SKU表和物理模型表各自记录数，以及关联成功、缺失、重复和冲突数量；
- SketchUp、3ds Max、无法识别及软件字段冲突数量；
- 英文标题、多语言、分类、图片、文件名、版本、Renderer和专业参数覆盖率；
- 中文标题、中文 file_name、封面OCR中文、低清图、失效图和疑似教程/UI截图数量；
- 文件URL失效、大小不一致、压缩包失败、主文件缺失和依赖异常数量，并标明扫描覆盖率；
- 旧价格、旧会员字段及新版价格状态分布；
- 按软件、分类、公开状态、高曝光/高点击/高退款和Today's Free候选分组的问题分布。
报告总数必须与同一数据库快照对账，可下钻至SKU。无法从现有字段得出的结论必须标记为“待文件/图片检测”，不得填成否或通过。

九、处理顺序与验收
处理顺序：Today's Free、首页/精选和广告候选 → 高曝光/高点击/高退款商品 → 其余公开商品 → 未公开库存。
- 只有完成相应扫描且无阻断问题的SKU才可进入Today's Free和高价值曝光位；
- 自动修复必须先抽检，保留变更前后值并可回滚；
- BLOCKED 启用后必须在搜索、推荐、PDP、Cart和Checkout同步失效；
- 修复后重新运行对应检查，不能仅由人工修改状态；
- 测试抽检下载、解压、打开、页面显示和回滚。

十、待技术确认
1. modelfile 与 overseas_modelfile 的事实表和同步关系；
2. package_parse_result_id 对应的数据表或服务；
3. 商品列表、PDP和下载当前实际读取的图片、版本、文件大小及Renderer字段优先级；
4. 商品/SKU/物理模型状态枚举的线上实际含义；
5. price、original_price 和 priceUnit 的历史金额单位及旧业务用途，以便迁移和报表识别；
6. 90万SKU进行对象存储和文件包扫描的资源预算、批次和完成周期；
7. OCR、图片风险和审美抽检的准确率门槛与抽样方案。