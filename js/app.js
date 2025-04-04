// 全局变量声明
let salesData = null;  // 存储销售数据 
let scheduleData = null;  // 存储主播排班数据
let matchedResults = null;  // 存储匹配结果
let currentPage = 1;  // 当前页码
let itemsPerPage = 10;  // 每页显示条数
let availableScheduleDates = [];  // 可用的排班日期
let analysisResults = [];  // 分析结果
let productCategoryAnalysis = {}; // 存储商品分类分析结果

// DOM 元素
const salesFileInput = document.getElementById('sales-file');
const scheduleFileInput = document.getElementById('schedule-file');
const analyzeBtn = document.getElementById('analyze-btn');
const clearBtn = document.getElementById('clear-btn');
const exportBtn = document.getElementById('export-btn');
const resultsSection = document.getElementById('results-section');

// =============== 文件上传处理 ===============

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，初始化文件上传功能...');
    
    // 初始化拖放区域
    initializeDropZones();
    
    // 修复模态框ARIA属性问题
    fixModalAriaAttributes();
    
    // 为文件输入框元素添加事件监听
    if (salesFileInput) {
        salesFileInput.addEventListener('change', handleFileSelect);
        console.log('已为销售数据文件输入框添加事件监听器');
    } else {
        console.error('未找到销售数据文件输入框元素');
    }
    
    if (scheduleFileInput) {
        scheduleFileInput.addEventListener('change', handleFileSelect);
        console.log('已为排班表文件输入框添加事件监听器');
    } else {
        console.error('未找到排班表文件输入框元素');
    }
    
    // 绑定按钮事件
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', startAnalysis);
        console.log('已为分析按钮添加事件监听器');
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearData);
        console.log('已为清除按钮添加事件监听器');
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportResults);
        console.log('已为导出按钮添加事件监听器');
    }
});

// 初始化拖放区域和文件选择按钮
function initializeDropZones() {
    console.log("正在初始化文件上传区域...");
    
    // 拖放区域
    const dropZones = document.querySelectorAll('.upload-area');
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const selectButtons = document.querySelectorAll('label[for^="sales-file"], label[for^="schedule-file"]');
    
    let initialized = 0;
    
    // 初始化每个拖放区域
    dropZones.forEach((dropZone, index) => {
        const fileType = dropZone.getAttribute('data-type');
        const fileInput = document.getElementById(`${fileType}-file`);
        const statusElement = document.getElementById(`${fileType}-status`);
        const fileTypeLabel = fileType === 'sales' ? '销售数据' : '主播排班表';
        
        if (!dropZone || !fileInput) {
            console.error(`无法找到拖放区域或文件输入 (${fileType})`);
            return;
        }
        
        initialized++;
        
        // 添加文件输入变更事件
        fileInput.addEventListener('change', function(e) {
            console.log(`${fileTypeLabel}文件输入变更事件触发，文件数量: ${this.files.length}`);
            if (this.files.length > 0) {
                const file = this.files[0];
                console.log(`已选择${fileTypeLabel}文件: ${file.name}`);
                processUploadedFile(file, fileType);
            }
        });
        
        // 拖放事件
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('drag-over');
            
            console.log(`文件被拖放到${fileTypeLabel}区域`);
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                console.log(`拖放的文件: ${file.name}`);
                processUploadedFile(file, fileType);
            }
        });
        
        console.log(`已初始化拖放区域 (${fileTypeLabel})`);
    });
    
    console.log(`完成初始化 ${initialized} 个拖放区域`);
    
    // 添加清除按钮事件
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            console.log("清除按钮被点击");
            resetFileInputs();
        });
    }
    
    // 添加开始分析按钮事件
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function() {
            console.log("开始分析按钮被点击");
            startAnalysis();
        });
    }
}

// 处理拖放区域的拖动悬停
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.add('dragover');
}

// 处理拖放区域的拖动离开
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('dragover');
}

// 处理文件拖放
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        console.log(`拖放文件: ${file.name}`);
        
        // 确定文件信息容器
        const type = this.dataset.type;
        if (!type) {
            console.error('未找到上传区域类型标记');
            return;
        }
        
        console.log(`文件类型: ${type}, 区域ID: ${this.id}, 数据属性:`, this.dataset);
        
        const fileInfoId = type === 'sales' ? 'sales-file-info' : 'schedule-file-info';
        const fileInfo = document.getElementById(fileInfoId);
        
        if (fileInfo) {
            console.log(`找到文件信息容器: #${fileInfoId}`);
            // 找到文件详情元素
            const fileDetails = fileInfo.querySelector('.file-details');
            const fileNameElem = fileInfo.querySelector('.file-name');
            const fileSizeElem = fileInfo.querySelector('.file-size');
            
            console.log(`文件详情元素: ${fileDetails ? '找到' : '未找到'}`);
            console.log(`文件名元素: ${fileNameElem ? '找到' : '未找到'}`);
            console.log(`文件大小元素: ${fileSizeElem ? '找到' : '未找到'}`);
            
            // 更新文件信息显示
            if (fileNameElem) fileNameElem.textContent = file.name;
            if (fileSizeElem) fileSizeElem.textContent = formatFileSize(file.size);
            
            // 显示文件详情区域
            if (fileDetails) fileDetails.classList.remove('d-none');
        } else {
            console.error(`未找到文件信息容器: #${fileInfoId}`);
        }
        
        // 检查是否是Excel文件
        const isExcel = /\.(xlsx|xls)$/i.test(file.name);
        console.log(`文件是否为Excel: ${isExcel}`);
        
        // 更新状态显示
        const statusId = this.dataset.status;
        console.log(`状态ID: ${statusId}`);
        
        if (isExcel) {
            processUploadedFile(file, type);
        } else {
            document.getElementById(statusId).innerHTML = 
                `<div class="alert alert-danger">请上传Excel文件 (.xlsx 或 .xls)</div>`;
        }
    } else {
        console.warn('没有接收到文件');
    }
}

// 处理文件选择
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        const file = files[0];
        console.log(`选择的文件: ${file.name}`);
        
        // 找到关联的上传区域
        const inputId = e.target.id;
        const type = inputId === 'sales-file' ? 'sales' : 'schedule';
        
        console.log(`输入框ID: ${inputId}, 文件类型: ${type}`);
        
        // 获取文件信息容器
        const fileInfoId = type === 'sales' ? 'sales-file-info' : 'schedule-file-info';
        const fileInfo = document.getElementById(fileInfoId);
        
        if (fileInfo) {
            console.log(`找到文件信息容器: #${fileInfoId}`);
            // 找到文件详情元素
            const fileDetails = fileInfo.querySelector('.file-details');
            const fileNameElem = fileInfo.querySelector('.file-name');
            const fileSizeElem = fileInfo.querySelector('.file-size');
            
            console.log(`文件详情元素: ${fileDetails ? '找到' : '未找到'}`);
            console.log(`文件名元素: ${fileNameElem ? '找到' : '未找到'}`);
            console.log(`文件大小元素: ${fileSizeElem ? '找到' : '未找到'}`);
            
            // 更新文件信息显示
            if (fileNameElem) fileNameElem.textContent = file.name;
            if (fileSizeElem) fileSizeElem.textContent = formatFileSize(file.size);
            
            // 显示文件详情区域
            if (fileDetails) fileDetails.classList.remove('d-none');
        } else {
            console.error(`未找到文件信息容器: #${fileInfoId}`);
        }
        
        // 检查是否是Excel文件
        const isExcel = /\.(xlsx|xls)$/i.test(file.name);
        console.log(`文件是否为Excel: ${isExcel}`);
        
        // 更新状态显示
        const statusId = type === 'sales' ? 'sales-status' : 'schedule-status';
        console.log(`状态ID: ${statusId}`);
        
        if (isExcel) {
            processUploadedFile(file, type);
        } else {
            document.getElementById(statusId).innerHTML = 
                `<div class="alert alert-danger">请上传Excel文件 (.xlsx 或 .xls)</div>`;
        }
    } else {
        console.warn('没有选择文件');
    }
}

// 处理上传的文件
function processUploadedFile(file, type) {
    if (!file) {
        console.error('没有文件可处理');
        return;
    }
    
    console.log(`开始处理${type === 'sales' ? '销售' : '排班表'}文件:`, file.name);
    
    const statusId = type === 'sales' ? 'sales-status' : 'schedule-status';
    document.getElementById(statusId).innerHTML = 
        `<div class="alert alert-info">正在处理${type === 'sales' ? '销售' : '排班表'}文件...</div>`;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            console.log(`正在解析${type === 'sales' ? '销售' : '排班表'}Excel文件...`);
            const data = parseExcel(e.target.result);
            
            if (data && data.length > 0) {
                if (type === 'sales') {
                    salesData = parseSalesData(data);
                    document.getElementById(statusId).innerHTML = 
                        `<div class="alert alert-success">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-check-circle-fill text-success me-2 fs-4"></i>
                                <div>
                                    <div class="fw-bold">已上传销售数据</div>
                                    <div class="small">共${salesData.length}条记录</div>
                                </div>
                            </div>
                        </div>`;
                    console.log('销售数据加载成功', salesData.length);
                } else {
                    // 处理排班表数据
                    scheduleData = data;
                    document.getElementById(statusId).innerHTML = 
                        `<div class="alert alert-success">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-check-circle-fill text-success me-2 fs-4"></i>
                                <div>
                                    <div class="fw-bold">已上传排班表数据</div>
                                    <div class="small">共${data.length}行</div>
                                </div>
                            </div>
                        </div>`;
                    console.log('排班表数据加载成功', data.length);
                }
                
                // 检查是否可以启用分析按钮
                checkAnalyzeReady();
            } else {
                document.getElementById(statusId).innerHTML = 
                    `<div class="alert alert-danger">${type === 'sales' ? '销售' : '排班表'}数据无效或为空</div>`;
                console.error(`${type === 'sales' ? '销售' : '排班表'}数据无效或为空`);
            }
        } catch (error) {
            console.error(`解析${type === 'sales' ? '销售' : '排班表'}数据出错:`, error);
            document.getElementById(statusId).innerHTML = 
                `<div class="alert alert-danger">解析文件出错: ${error.message}</div>`;
        }
    };
    
    reader.onerror = function(error) {
        console.error(`读取${type === 'sales' ? '销售' : '排班表'}文件失败:`, error);
        document.getElementById(statusId).innerHTML = 
            `<div class="alert alert-danger">读取文件失败</div>`;
    };
    
    // 开始读取文件
    reader.readAsArrayBuffer(file);
}

// 检查是否可以启用分析按钮
function checkAnalyzeReady() {
    if (scheduleData && salesData) {
        console.log('两种数据都已成功加载，启用分析按钮');
        console.log(`排班表数据: ${scheduleData.length}条记录`);
        console.log(`销售数据: ${salesData.length}条记录`);
        
        analyzeBtn.disabled = false;
        
        // 添加一个临时提示
        const noticeHtml = `
            <div class="alert alert-success text-center">
                <i class="bi bi-check-circle-fill me-2"></i>
                <strong>所有数据已就绪</strong>，可以点击"开始分析"按钮进行匹配分析
            </div>
        `;
        
        // 查找并更新提示区域
        const noticeArea = document.getElementById('notice-area');
        if (noticeArea) {
            noticeArea.innerHTML = noticeHtml;
        }
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 解析Excel文件
function parseExcel(data) {
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // 移除空行
    const filteredData = jsonData.filter(row => {
        return row.length > 0 && !row.every(cell => cell === null || cell === undefined || cell === '');
    });
    
    return filteredData;
}

// 解析销售数据
function parseSalesData(data) {
    // 简单实现，后续可以根据具体格式进行调整
    const headers = data[0];
    const result = [];
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row.length > 0) {
            const item = {};
            headers.forEach((header, index) => {
                if (index < row.length) {
                    item[header] = row[index];
                }
            });
            result.push(item);
        }
    }
    
    return result;
}

// 提取时间段（支持多种格式）
function extractTimeSlot(str) {
    if (!str || typeof str !== 'string') {
        console.log(`无效的时间段输入: ${str}`);
        return null;
    }
    
    // 规范化时间字符串：替换全角冒号和不同类型的连字符
    let normalizedStr = str.replace(/：/g, ':')  // 替换中文冒号
                          .replace(/[－—\-~～]/g, '-')  // 统一各种连字符
                          .replace(/\s+/g, ''); // 去除空格
    
    console.log(`尝试解析时间段: "${str}" -> "${normalizedStr}"`);
    
    let timeSlot = null;
    
    // 尝试匹配标准的时间段格式（如 08:00-10:00）
    const stdMatch = normalizedStr.match(/(\d{1,2}):(\d{1,2})-(\d{1,2}):(\d{1,2})/);
    if (stdMatch) {
        const startHour = stdMatch[1].padStart(2, '0');
        const startMin = stdMatch[2].padStart(2, '0');
        const endHour = stdMatch[3].padStart(2, '0');
        const endMin = stdMatch[4].padStart(2, '0');
        timeSlot = `${startHour}:${startMin}-${endHour}:${endMin}`;
        console.log(`  匹配标准时间段格式: ${timeSlot}`);
    } else {
        // 尝试匹配带"到"字符的时间段（如 08:00到10:00）
        const withDaoMatch = normalizedStr.match(/(\d{1,2}):(\d{1,2})到(\d{1,2}):(\d{1,2})/);
        if (withDaoMatch) {
            const startHour = withDaoMatch[1].padStart(2, '0');
            const startMin = withDaoMatch[2].padStart(2, '0');
            const endHour = withDaoMatch[3].padStart(2, '0');
            const endMin = withDaoMatch[4].padStart(2, '0');
            timeSlot = `${startHour}:${startMin}-${endHour}:${endMin}`;
            console.log(`  匹配带"到"的时间段: ${timeSlot}`);
        } 
        // 尝试匹配"点"格式（如 8点-10点）
        else {
            const withDianMatch = normalizedStr.match(/(\d{1,2})点(?:(\d{1,2})分)?-(\d{1,2})点(?:(\d{1,2})分)?/);
            if (withDianMatch) {
                const startHour = withDianMatch[1].padStart(2, '0');
                const startMin = withDianMatch[2] ? withDianMatch[2].padStart(2, '0') : '00';
                const endHour = withDianMatch[3].padStart(2, '0');
                const endMin = withDianMatch[4] ? withDianMatch[4].padStart(2, '0') : '00';
                timeSlot = `${startHour}:${startMin}-${endHour}:${endMin}`;
                console.log(`  匹配"点"格式时间段: ${timeSlot}`);
            } 
            // 尝试匹配简单的小时段（如8-10，默认补全为8:00-10:00）
            else {
                const hourOnlyMatch = normalizedStr.match(/^(\d{1,2})-(\d{1,2})$/);
                if (hourOnlyMatch) {
                    const startHour = hourOnlyMatch[1].padStart(2, '0');
                    const endHour = hourOnlyMatch[2].padStart(2, '0');
                    timeSlot = `${startHour}:00-${endHour}:00`;
                    console.log(`  匹配简单小时段: ${timeSlot}`);
                }
                // 尝试匹配单个时段（如8:00-12:00）
                else if (normalizedStr.match(/(\d{1,2})[点:](\d{1,2})?-(\d{1,2})[点:](\d{1,2})?/)) {
                    const timeMatch = normalizedStr.match(/(\d{1,2})[点:](\d{1,2})?-(\d{1,2})[点:](\d{1,2})?/);
                    if (timeMatch) {
                        const startHour = timeMatch[1].padStart(2, '0');
                        const startMin = timeMatch[2] ? timeMatch[2].padStart(2, '0') : '00';
                        const endHour = timeMatch[3].padStart(2, '0');
                        const endMin = timeMatch[4] ? timeMatch[4].padStart(2, '0') : '00';
                        timeSlot = `${startHour}:${startMin}-${endHour}:${endMin}`;
                        console.log(`  匹配混合时间段格式: ${timeSlot}`);
                    }
                }
                // 找出表格中的特殊时间段格式（例如"早场"、"晚场"）
                else if (normalizedStr.includes('早') || normalizedStr.includes('上午')) {
                    timeSlot = '08:00-12:00';
                    console.log(`  匹配"早场/上午"时间段: ${timeSlot}`);
                }
                else if (normalizedStr.includes('午') || normalizedStr.includes('中午')) {
                    timeSlot = '12:00-16:00';
                    console.log(`  匹配"午场/中午"时间段: ${timeSlot}`);
                }
                else if (normalizedStr.includes('晚') || normalizedStr.includes('下午') || normalizedStr.includes('夜')) {
                    timeSlot = '16:00-23:59';
                    console.log(`  匹配"晚场/下午/夜场"时间段: ${timeSlot}`);
                }
                // 尝试特定的时间关键词
                else if (normalizedStr.includes('全天') || normalizedStr.includes('全部')) {
                    timeSlot = '00:00-23:59';
                    console.log(`  匹配"全天"时间段: ${timeSlot}`);
                }
            }
        }
    }
    
    if (!timeSlot) {
        console.log(`  无法匹配任何时间段格式: "${str}"`);
    }
    
    return timeSlot;
}

// 标准化时间段格式
function standardizeTimeSlot(timeStr) {
    if (!timeStr) return null;
    
    // 尝试使用提取函数获取标准格式
    const result = extractTimeSlot(timeStr);
    if (result) {
        // 确保时间格式的一致性
        const [startTime, endTime] = result.split('-');
        const [startHour, startMin] = startTime.split(':');
        const [endHour, endMin] = endTime.split(':');
        
        // 规范化为HH:MM-HH:MM格式
        return `${startHour.padStart(2, '0')}:${startMin.padStart(2, '0')}-${endHour.padStart(2, '0')}:${endMin.padStart(2, '0')}`;
    }
    return result;
}

// 开始分析
function startAnalysis() {
    console.log("开始分析...");
    
    // 显示加载提示
    showLoading("正在分析数据...");
    
    // 使用requestAnimationFrame代替setTimeout，性能更好
    requestAnimationFrame(() => {
        try {
            // 处理主播排班数据
            const scheduleMap = processScheduleData(scheduleData);
            console.log("主播排班数据处理完成:", scheduleMap);
            
            // 规范化销售数据
            const normalizedSales = normalizeSalesData(salesData);
            console.log(`销售数据规范化完成，共 ${normalizedSales.length} 条记录`);
            
            // 匹配销售数据与主播排班
            matchedResults = matchSalesWithSchedule(normalizedSales, scheduleMap);
            console.log(`匹配完成，结果数量: ${matchedResults.length}`);
            
            // 显示结果
            displayResults(matchedResults);
            
            // 隐藏加载提示
            hideLoading();
            
            // 显示成功消息
            showNotice("success", `分析完成！共处理 ${normalizedSales.length} 条销售记录，成功匹配 ${matchedResults.filter(r => r.matched).length} 条。`);
        } catch (error) {
            console.error("分析过程中发生错误:", error);
            hideLoading();
            showNotice("danger", `分析失败: ${error.message || "未知错误"}`);
        }
    });
}

// 处理表格数据，获取主播排期信息
function processScheduleData(data) {
    console.log('开始处理排期数据');
    console.log('原始数据展示（前10行）：', data.slice(0, 10));

    // 检查数据是否有效
    if (!data || !data.length || data.length < 2) {
        console.error('排期数据无效或行数不足');
        return null;
    }

    // 创建排班映射表
    const scheduleMap = {};
    
    // 当前处理的日期和档位信息
    let currentDate = '';
    let tierInfo = '';
    
    // 遍历每一行数据
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        const row = data[rowIndex];
        if (!row || row.length < 2) {
            console.log(`第 ${rowIndex+1} 行数据不完整，跳过`);
            continue;
        }
        
        const firstCell = String(row[0] || '').trim();
        const secondCell = String(row[1] || '').trim();
        
        // 检查是否是日期行（通常包含"号"字或日期格式）
        const isDateRow = firstCell.includes('号') || firstCell.includes('日') || firstCell.match(/\d+月\d+/) || 
                         /\d{1,2}[-\/]\d{1,2}/.test(firstCell) || /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(firstCell);
                        
        if (isDateRow) {
            // 提取日期
            let dateString = '';
            if (firstCell.includes('月') && (firstCell.includes('日') || firstCell.includes('号'))) {
                const parts = firstCell.match(/(\d+)月(\d+)[号日]/);
                if (parts) {
                    currentDate = `${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                    dateString = firstCell;
                }
            } else if (firstCell.includes('/') || firstCell.includes('-')) {
                // 处理MM-DD或YYYY-MM-DD格式
                const parts = firstCell.split(/[-\/]/);
                if (parts.length === 2) {
                    currentDate = `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                    dateString = firstCell;
                } else if (parts.length >= 3) {
                    currentDate = `${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                    dateString = firstCell;
                }
            } else {
                // 尝试其他可能的日期格式
                const dateMatch = firstCell.match(/(\d+月\d+[号日])|(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})|(\d{1,2}[-\/]\d{1,2})/);
                if (dateMatch) {
                    dateString = dateMatch[0];
                }
            }
            
            if (currentDate) {
                console.log(`找到日期行: ${dateString} -> "${currentDate}"`);
                
                // 初始化该日期的映射表
                scheduleMap[currentDate] = {};
                
                // 提取档位信息（日期行第二列）
                tierInfo = secondCell || '';
                console.log(`档位信息: ${tierInfo}`);
            } else {
                console.log(`第 ${rowIndex+1} 行似乎是日期行，但无法提取有效日期: "${firstCell}"`);
            }
            
            continue; // 跳过日期行，处理下一行
        }
        
        // 如果尚未找到有效日期，跳过
        if (!currentDate || !scheduleMap[currentDate]) {
            console.log(`第 ${rowIndex+1} 行没有关联的日期，跳过`);
            continue;
        }
        
        // 处理主播和时间段
        const anchorName = firstCell;
        const timeSlotText = secondCell;
        
        if (!anchorName) {
            console.log(`第 ${rowIndex+1} 行无主播名称，跳过`);
            continue;
        }
        
        // 提取时间段
        const timeSlot = extractTimeSlot(timeSlotText);
        if (!timeSlot) {
            console.log(`无法从 "${timeSlotText}" 提取有效时间段，跳过第 ${rowIndex+1} 行`);
            continue;
        }
        
        console.log(`主播 "${anchorName}" 在 ${currentDate} 的时间段 ${timeSlot}`);
        
        // 初始化时间段
        if (!scheduleMap[currentDate][timeSlot]) {
            scheduleMap[currentDate][timeSlot] = [];
        }
        
        // 解析旺悦和源悦档位
        let wangTier = '非档';
        let yuanTier = '非档';
        
        // 从档位信息中提取
        if (tierInfo) {
            if (tierInfo.includes('旺大')) {
                wangTier = '大档';
            } else if (tierInfo.includes('旺小')) {
                wangTier = '小档';
            }
            
            if (tierInfo.includes('源大')) {
                yuanTier = '大档';
            } else if (tierInfo.includes('源小')) {
                yuanTier = '小档';
            }
        }
        
        // 将主播添加到旺悦和源悦的排班中
        scheduleMap[currentDate][timeSlot].push({
            anchor: anchorName,
            position: `旺悦${wangTier}`
        });
        
        scheduleMap[currentDate][timeSlot].push({
            anchor: anchorName,
            position: `源悦${yuanTier}`
        });
        
        console.log(`添加主播 "${anchorName}" 到 ${currentDate} ${timeSlot}，旺悦档位: ${wangTier}，源悦档位: ${yuanTier}`);
    }
    
    // 调试：检查生成的排班表中每个日期的时间段数量
    for (const date in scheduleMap) {
        const timeSlots = Object.keys(scheduleMap[date]);
        console.log(`日期 ${date} 有 ${timeSlots.length} 个时间段:`, timeSlots);
        
        // 检查每个时间段的主播信息
        for (const timeSlot of timeSlots) {
            const anchors = scheduleMap[date][timeSlot];
            console.log(`  时间段 ${timeSlot} 有 ${anchors.length} 个主播信息:`, 
                anchors.map(a => `${a.anchor}(${a.position})`).join(', '));
        }
    }
    
    console.log('最终排班表生成完成');
    return scheduleMap;
}

// 规范化销售数据
function normalizeSalesData(salesData) {
    console.log("规范化销售数据...");
    const normalizedSales = [];
    
    // 确定订单时间字段名称
    let timeFieldName = null;
    const possibleTimeFields = ["订单提交时间", "提交时间", "下单时间", "时间", "订单时间"];
    
    // 查找销售数据中使用的时间字段
    if (salesData.length > 0) {
        const firstItem = salesData[0];
        for (const field of possibleTimeFields) {
            if (firstItem[field] !== undefined) {
                timeFieldName = field;
                console.log(`找到时间字段: "${timeFieldName}"`);
                break;
            }
        }
    }
    
    if (!timeFieldName) {
        console.error("无法识别销售数据中的时间字段");
        // 尝试查看对象的键
        if (salesData.length > 0) {
            console.log("可用字段:", Object.keys(salesData[0]));
        }
        return normalizedSales;
    }
    
    salesData.forEach((sale, index) => {
        // 获取订单提交时间
        let orderTime = sale[timeFieldName];
        
        if (!orderTime) {
            console.warn(`订单 #${index + 1} 没有时间信息`);
            return; // 跳过此订单
        }
        
        try {
            // 标准化日期时间字符串
            let dateTimeStr = String(orderTime).trim();
            
            // 检查并处理不同的日期时间格式
            let dateTime = null;
            
            // 处理标准格式 "YYYY-MM-DD HH:MM:SS"
            if (/^\d{4}-\d{1,2}-\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}$/.test(dateTimeStr)) {
                dateTime = new Date(dateTimeStr);
            } 
            // 处理格式 "YYYY/MM/DD HH:MM:SS"
            else if (/^\d{4}\/\d{1,2}\/\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}$/.test(dateTimeStr)) {
                dateTimeStr = dateTimeStr.replace(/\//g, '-');
                dateTime = new Date(dateTimeStr);
            }
            // 处理Excel数值型日期
            else if (!isNaN(orderTime) && typeof orderTime === 'number') {
                // Excel日期是从1900年1月1日开始的天数
                // JavaScript日期从1970年1月1日开始的毫秒数
                // 需要转换: (excel_date - 25569) * 86400 * 1000
                const excelEpoch = new Date(1900, 0, 1);
                const msPerDay = 24 * 60 * 60 * 1000;
                dateTime = new Date(excelEpoch.getTime() + (orderTime - 1) * msPerDay);
            }
            // 最后尝试直接解析
            else {
                dateTime = new Date(dateTimeStr);
            }
            
            if (isNaN(dateTime.getTime())) {
                throw new Error(`无法解析日期时间: "${dateTimeStr}"`);
            }
            
            // 提取年、月、日、小时、分钟
            const year = dateTime.getFullYear();
            const month = (dateTime.getMonth() + 1).toString().padStart(2, '0');
            const day = dateTime.getDate().toString().padStart(2, '0');
            const hours = dateTime.getHours().toString().padStart(2, '0');
            const minutes = dateTime.getMinutes().toString().padStart(2, '0');
            
            // 创建标准化的日期和时间
            const standardDate = `${year}-${month}-${day}`;
            const standardTime = `${hours}:${minutes}`;
            
            // 创建标准化的销售数据
            normalizedSales.push({
                original: sale,
                date: standardDate,
                time: standardTime,
                hour: Number(hours),
                minute: Number(minutes)
            });
            
            if (index < 5 || index % 100 === 0) { // 只记录少量日志以避免过多输出
                console.log(`处理订单 #${index + 1}: ${dateTimeStr} -> ${standardDate} ${standardTime}`);
            }
        } catch (error) {
            console.error(`处理订单 #${index + 1} 时间出错:`, error, orderTime);
        }
    });
    
    // 汇总日期信息
    const dateSet = new Set();
    normalizedSales.forEach(sale => dateSet.add(sale.date));
    const dates = Array.from(dateSet).sort();
    
    console.log(`销售数据标准化完成，共 ${normalizedSales.length} 条记录，日期范围: ${dates.length > 0 ? `${dates[0]} 至 ${dates[dates.length-1]}` : '无数据'}`);
    console.log("销售数据包含的日期:", dates.join(", "));
    
    return normalizedSales;
}

// 匹配销售与排期数据
function matchSalesWithSchedule(salesData, scheduleMap) {
    console.log("开始匹配销售与排期数据");
    
    if (!salesData || !scheduleMap) {
        console.error("销售数据或排期数据无效");
        return [];
    }
    
    // 查看可用的排期日期
    const availableDates = Object.keys(scheduleMap);
    console.log("可用的排期日期:", availableDates);
    
    // 记录日期的实际匹配情况，用于调试
    const dateMatchingLog = {};
    
    // 处理每条销售记录
    const results = salesData.map((sale, index) => {
        const result = {
            sale: sale.original, // 保存原始销售数据
            matched: false,
            date: sale.date,     // 直接使用normalizeSalesData处理好的日期
            time: sale.time,     // 直接使用normalizeSalesData处理好的时间
            anchor: null,
            position: null,
            timeSlot: null,
            matchedDate: null,
            productBrand: null,  // 产品品牌（旺悦/源悦）
            productTier: null    // 产品档位（大档/小档/非档）
        };
        
        if (index < 10) {
            console.log(`处理销售记录 #${index+1}`, sale);
            console.log(`销售日期: ${result.date}, 时间: ${result.time}`);
        }
        
        // 如果无法提取日期或时间，则无法匹配
        if (!result.date || !result.time) {
            console.log(`记录 #${index+1} 无法提取日期或时间，跳过匹配`);
            return result;
        }
        
        // 从商品名称确定品牌和档位
        let productName = '';
        if (sale.original) {
            if (typeof sale.original === 'object' && !Array.isArray(sale.original)) {
                productName = sale.original['选购商品'] || sale.original['商品名称'] || sale.original['商品'] || '';
            } else if (Array.isArray(sale.original)) {
                productName = sale.original[0] || '';
            } else {
                productName = String(sale.original);
            }
            
            if (index < 10) {
                console.log(`分析商品名称: "${productName}"`);
            }
            
            // 增强品牌识别规则 - 旺悦/源悦
            if (productName.includes('旺玥') || productName.includes('旺悦') || 
                productName.includes('旺奶') || productName.includes('旺粉')) {
                result.productBrand = '旺悦';
            } else if (productName.includes('源玥') || productName.includes('源悦') || 
                       productName.includes('星') || productName.includes('皇家') || 
                       productName.includes('美素佳儿') || /Friso|MeadJohnson|aptamil/i.test(productName)) {
                result.productBrand = '源悦';
            }
            
            // 增强档位识别规则
            if (productName.includes('大档') || productName.includes('2段') || 
                productName.includes('3段') || productName.includes('4段') || /stage\s*[234]/i.test(productName)) {
                result.productTier = '大档';
            } else if (productName.includes('小档') || productName.includes('1段') || /stage\s*1/i.test(productName)) {
                result.productTier = '小档';
            } else {
                result.productTier = '非档';
            }
            
            if (index < 10) {
                console.log(`商品分析结果 - 品牌: ${result.productBrand || '未识别'}, 档位: ${result.productTier || '未识别'}`);
            }
        }
        
        // 如果没有明确品牌，使用额外特征词进行判断
        if (!result.productBrand && productName) {
            // 更多的特征词匹配规则
            if (productName.includes('星') || productName.includes('皇家') || 
                productName.match(/美素佳儿/i) || productName.includes('illuma') || 
                productName.includes('雅培') || productName.includes('惠氏') || 
                productName.includes('爱他美') || productName.includes('牛栏')) {
                result.productBrand = '源悦';
                if (index < 10) console.log(`根据特征词判断为源悦产品`);
            } else {
                // 默认为旺悦
                result.productBrand = '旺悦';
                if (index < 10) console.log(`未明确识别品牌，默认设为旺悦产品`);
            }
        }
        
        // 步骤1: 查找匹配的排期日期
        let matchingDate = null;
        
        // 特殊处理2月28日销售数据
        if (result.date.includes('2025-02-28') || result.date.includes('02-28')) {
            matchingDate = '02-28';
            if (index < 10) console.log(`特殊处理2月28日销售数据: ${result.date} -> ${matchingDate}`);
        }
        // 尝试直接匹配完整日期
        else if (availableDates.includes(result.date)) {
            matchingDate = result.date;
            if (index < 10) console.log(`找到完全匹配的日期: ${matchingDate}`);
        } 
        // 尝试匹配MM-DD格式
        else {
            const saleDateParts = result.date.split('-');
            if (saleDateParts.length >= 3) {
                const mmdd = `${saleDateParts[1]}-${saleDateParts[2]}`;
                if (availableDates.includes(mmdd)) {
                    matchingDate = mmdd;
                    if (index < 10) console.log(`找到月日匹配: ${mmdd}`);
                }
            }
            
            // 如果还没找到，尝试进行模糊匹配
            if (!matchingDate) {
                try {
                    const saleDateTime = new Date(result.date).getTime();
                    if (!isNaN(saleDateTime)) {
                        // 使用当前年份补全日期
                        const currentYear = new Date().getFullYear();
                        let closestDate = null;
                        let minDistance = Infinity;
                        
                        for (const scheduleDate of availableDates) {
                            // 补全年份构造完整日期
                            let fullDate = scheduleDate;
                            if (scheduleDate.length <= 5 && scheduleDate.includes('-')) {
                                fullDate = `${currentYear}-${scheduleDate}`;
                            }
                            
                            const scheduleDateTime = new Date(fullDate).getTime();
                            if (!isNaN(scheduleDateTime)) {
                                const distance = Math.abs(saleDateTime - scheduleDateTime) / (1000 * 60 * 60 * 24);
                                if (distance < minDistance && distance <= 3) { // 最多相差3天
                                    minDistance = distance;
                                    closestDate = scheduleDate;
                                }
                            }
                        }
                        
                        if (closestDate) {
                            matchingDate = closestDate;
                            if (index < 10) console.log(`找到最接近的日期: ${matchingDate}, 相差 ${minDistance.toFixed(1)} 天`);
                        }
                    }
                } catch (error) {
                    console.error(`日期匹配出错:`, error);
                }
            }
        }
        
        // 记录匹配情况
        dateMatchingLog[result.date] = matchingDate || "未匹配";
        
        // 步骤2: 如果找到匹配的日期，尝试匹配时间段
        if (matchingDate) {
            result.matchedDate = matchingDate;
            const availableTimeSlots = Object.keys(scheduleMap[matchingDate] || {});
            
            if (availableTimeSlots.length > 0) {
                if (index < 10) console.log(`日期 ${matchingDate} 有 ${availableTimeSlots.length} 个可用时间段`);
                
                // 将销售时间转换为分钟数，以便比较
                const saleTimeMinutes = timeToMinutes(result.time);
                if (saleTimeMinutes === null) {
                    console.log(`无法解析销售时间 ${result.time}`);
                    return result;
                }
                
                // 找出最佳匹配的时间段
                let bestTimeSlot = null;
                let minDistance = Infinity;
                
                for (const timeSlot of availableTimeSlots) {
                    const [startTime, endTime] = timeSlot.split('-');
                    const startMinutes = timeToMinutes(startTime);
                    const endMinutes = timeToMinutes(endTime);
                    
                    if (startMinutes === null || endMinutes === null) {
                        if (index < 10) console.log(`无法解析时间段 ${timeSlot}`);
                        continue;
                    }
                    
                    // 计算销售时间与时间段的匹配程度
                    let distance;
                    
                    // 处理跨午夜的情况
                    if (endMinutes < startMinutes) {
                        // 跨午夜情况 (如 22:00-02:00)
                        if (saleTimeMinutes >= startMinutes || saleTimeMinutes <= endMinutes) {
                            // 销售时间在时间段内
                            distance = 0;
                        } else {
                            // 销售时间在时间段外，计算最小距离
                            distance = Math.min(
                                Math.abs(saleTimeMinutes - startMinutes),
                                Math.abs(saleTimeMinutes - endMinutes)
                            );
                        }
                    } else {
                        // 正常情况 (如 08:00-12:00)
                        if (saleTimeMinutes >= startMinutes && saleTimeMinutes <= endMinutes) {
                            // 销售时间在时间段内
                            distance = 0;
                        } else {
                            // 销售时间在时间段外，计算最小距离
                            distance = Math.min(
                                Math.abs(saleTimeMinutes - startMinutes),
                                Math.abs(saleTimeMinutes - endMinutes)
                            );
                        }
                    }
                    
                    // 更新最佳匹配
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestTimeSlot = timeSlot;
                    }
                    
                    if (index < 10) console.log(`时间段 ${timeSlot} 距离: ${distance}`);
                }
                
                // 步骤3: 如果找到匹配的时间段，获取对应主播信息
                if (bestTimeSlot) {
                    if (index < 10) console.log(`找到最佳匹配时间段: ${bestTimeSlot}, 距离: ${minDistance}`);
                    result.timeSlot = bestTimeSlot;
                    
                    // 获取该时间段的主播信息
                    const anchors = scheduleMap[matchingDate][bestTimeSlot];
                    
                    if (anchors && anchors.length > 0) {
                        if (index < 10) console.log(`该时间段有 ${anchors.length} 个主播信息:`, anchors);
                        
                        // 根据产品品牌选择合适的主播信息
                        const matchingAnchors = anchors.filter(a => 
                            String(a.position || '').includes(result.productBrand || '')
                        );
                        
                        if (matchingAnchors.length > 0) {
                            // 从匹配品牌的主播中选择一个
                            const selectedAnchor = matchingAnchors[0];
                            if (index < 10) console.log(`选择匹配品牌的主播:`, selectedAnchor);
                            
                            result.matched = true;
                            result.anchor = String(selectedAnchor.anchor || '').trim();
                            result.position = selectedAnchor.position;
                        } else if (anchors.length > 0) {
                            // 如果没有匹配品牌的主播，使用第一个主播但调整档位
                            const fallbackAnchor = anchors[0];
                            if (index < 10) console.log(`没有匹配品牌的主播，选择第一个:`, fallbackAnchor);
                            
                            result.matched = true;
                            result.anchor = String(fallbackAnchor.anchor || '').trim();
                            
                            // 调整档位以匹配产品品牌
                            if (result.productBrand) {
                                if (result.productBrand === '旺悦') {
                                    result.position = `旺悦${result.productTier || '非档'}`;
                                } else if (result.productBrand === '源悦') {
                                    result.position = `源悦${result.productTier || '非档'}`;
                                } else {
                                    result.position = fallbackAnchor.position;
                                }
                                if (index < 10) console.log(`调整档位以匹配品牌: ${result.position}`);
                            } else {
                                result.position = fallbackAnchor.position;
                            }
                        }
                    } else {
                        if (index < 10) console.log(`时间段 ${bestTimeSlot} 没有主播信息`);
                    }
                } else {
                    if (index < 10) console.log(`未找到匹配的时间段`);
                }
            } else {
                if (index < 10) console.log(`日期 ${matchingDate} 没有可用时间段`);
            }
        } else {
            if (index < 10) console.log(`未找到匹配的排期日期`);
        }
        
        return result;
    });
    
    // 输出匹配统计
    const totalRecords = results.length;
    const matchedRecords = results.filter(r => r.matched).length;
    const matchRate = totalRecords > 0 ? ((matchedRecords / totalRecords) * 100).toFixed(2) : 0;
    
    console.log("匹配结果统计:");
    console.log(`总记录数: ${totalRecords}`);
    console.log(`成功匹配数: ${matchedRecords}`);
    console.log(`匹配率: ${matchRate}%`);
    
    // 输出每个品牌的匹配统计
    const brandStats = {
        '旺悦': { total: 0, matched: 0 },
        '源悦': { total: 0, matched: 0 }
    };
    
    results.forEach(r => {
        if (r.productBrand) {
            brandStats[r.productBrand].total++;
            if (r.matched) {
                brandStats[r.productBrand].matched++;
            }
        }
    });
    
    for (const brand in brandStats) {
        const stats = brandStats[brand];
        if (stats.total > 0) {
            const brandRate = ((stats.matched / stats.total) * 100).toFixed(2);
            console.log(`${brand}产品：共 ${stats.total} 条记录，成功匹配 ${stats.matched} 条，匹配率 ${brandRate}%`);
        }
    }
    
    // 输出关键日期的匹配情况
    console.log("关键日期匹配情况:", Object.entries(dateMatchingLog).slice(0, 5));
    
    return results;
}

// 查找最佳匹配的时间段
function findBestTimeSlot(saleTime, timeSlots) {
    console.log(`查找最佳时间段匹配，销售时间: ${saleTime}, 可用时间段:`, timeSlots);
    
    if (!saleTime || !timeSlots || !timeSlots.length) return null;
    
    // 转换销售时间为分钟数
    const saleMinutes = timeToMinutes(saleTime);
    if (saleMinutes === null) return timeSlots[0]; // 无法解析时间，返回第一个时间段
    
    // 计算每个时间段与销售时间的匹配程度
    const timeSlotMatches = timeSlots.map(slot => {
        const [start, end] = slot.split('-').map(t => timeToMinutes(t));
        
        // 处理跨午夜的时间段
        let distance;
        if (end < start) { // 跨午夜情况
            if (saleMinutes >= start || saleMinutes <= end) {
                // 销售时间在时间段内
                distance = 0;
            } else if (saleMinutes > end && saleMinutes < start) {
                // 销售时间在时间段外，计算到时间段边界的最小距离
                distance = Math.min(saleMinutes - end, start - saleMinutes);
            }
        } else { // 正常情况
            if (saleMinutes >= start && saleMinutes <= end) {
                // 销售时间在时间段内
                distance = 0;
            } else {
                // 销售时间在时间段外，计算到时间段边界的最小距离
                distance = Math.min(
                    Math.abs(saleMinutes - start),
                    Math.abs(saleMinutes - end)
                );
            }
        }
        
        return { timeSlot: slot, distance: distance };
    });
    
    // 按照距离排序，选择最匹配的时间段
    timeSlotMatches.sort((a, b) => a.distance - b.distance);
    
    const bestMatch = timeSlotMatches[0];
    console.log(`最佳匹配的时间段: ${bestMatch.timeSlot}, 距离: ${bestMatch.distance}`);
    
    return bestMatch.timeSlot;
}

// 查找匹配的排期日期
function findMatchingScheduleDate(saleDate, availableDates, dateFormatMap) {
    console.log(`查找匹配的排期日期，销售日期: ${saleDate}, 可用日期:`, availableDates);
    
    if (!saleDate || !availableDates || !availableDates.length) return null;
    
    // 如果有完全匹配的日期，直接返回
    if (availableDates.includes(saleDate)) {
        console.log(`找到完全匹配的日期: ${saleDate}`);
        return saleDate;
    }
    
    // 尝试MM-DD格式匹配
    const saleDateParts = saleDate.split('-');
    if (saleDateParts.length >= 3) {
        const mmdd = `${saleDateParts[1]}-${saleDateParts[2]}`;
        
        // 检查是否有匹配的月日
        for (const scheduleDate of availableDates) {
            if (scheduleDate === mmdd) {
                console.log(`找到月日匹配: ${mmdd} -> ${scheduleDate}`);
                return scheduleDate;
            }
        }
    }
    
    // 特殊处理：如果是2月28日，不进行近似匹配
    if (saleDate.match(/\d{4}-02-28/) || saleDate.includes('2-28') || saleDate.includes('2月28')) {
        console.log(`特殊日期2月28日，不进行近似匹配`);
        return null;
    }
    
    // 没有完全匹配，尝试查找最接近的日期（3天内）
    try {
        const saleDateTime = new Date(saleDate).getTime();
        if (!isNaN(saleDateTime)) {
            // 转换所有可用日期为Date对象并计算时间差
            const currentYear = new Date().getFullYear();
            const dateDistances = availableDates.map(scheduleDate => {
                let fullDate = scheduleDate;
                
                // 处理MM-DD格式
                if (scheduleDate.length <= 5 && scheduleDate.includes('-')) {
                    fullDate = `${currentYear}-${scheduleDate}`;
                }
                
                const scheduleDateTime = new Date(fullDate).getTime();
                
                // 跳过无效日期
                if (isNaN(scheduleDateTime)) return { date: scheduleDate, distance: Infinity };
                
                const distanceInDays = Math.abs(saleDateTime - scheduleDateTime) / (1000 * 60 * 60 * 24);
                return { date: scheduleDate, distance: distanceInDays };
            });
            
            // 按距离排序
            dateDistances.sort((a, b) => a.distance - b.distance);
            
            // 如果最接近的日期在3天内，则使用它
            if (dateDistances[0].distance <= 3) {
                console.log(`找到最接近的日期: ${dateDistances[0].date}, 相差 ${dateDistances[0].distance.toFixed(1)} 天`);
                return dateDistances[0].date;
            }
            
            console.log(`最接近的日期 ${dateDistances[0].date} 相差 ${dateDistances[0].distance.toFixed(1)} 天，超过3天限制`);
        } else {
            console.log(`日期 ${saleDate} 无法转换为有效日期对象`);
        }
    } catch (error) {
        console.error(`日期匹配时出错:`, error);
    }
    
    // 没有找到合适的匹配
    console.log(`未找到匹配的排期日期`);
    return null;
}

// 显示匹配结果
function displayResults(results) {
    console.log("显示分析结果...");
    
    // 保存结果以便重新绘制图表
    window.analysisResults = results;
    
    // 隐藏加载提示
    hideLoading();
    
    // 显示结果部分
    document.getElementById('results-section').classList.remove('d-none');
    
    // 确保默认选中匹配结果标签页
    const matchingTab = document.getElementById('matching-tab');
    const analysisTab = document.getElementById('analysis-tab');
    const matchingPane = document.getElementById('matching');
    const analysisPane = document.getElementById('analysis');
    
    if (matchingTab && analysisTab && matchingPane && analysisPane) {
        // 激活匹配结果标签页
        matchingTab.classList.add('active');
        matchingPane.classList.add('show', 'active');
        
        // 取消激活数据分析标签页
        analysisTab.classList.remove('active');
        analysisPane.classList.remove('show', 'active');
    }
    
    // 显示匹配统计信息
    const summaryDiv = document.getElementById('matching-summary');
    if (summaryDiv) {
        // 清空现有内容
        summaryDiv.innerHTML = '';
        
        // 计算匹配统计数据
        const matchedCount = results.filter(result => result.matched).length;
        const matchRate = ((matchedCount / results.length) * 100).toFixed(1);
        
        // 显示结果统计
        summaryDiv.innerHTML = `
            <div class="alert alert-info">
                <strong>匹配统计:</strong> 共 ${results.length} 条销售记录，成功匹配 ${matchedCount} 条 (匹配率: ${matchRate}%)
            </div>
        `;
        
        // 如果没有结果，显示提示
        if (results.length === 0) {
            summaryDiv.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>无匹配结果:</strong> 未找到任何匹配的销售记录
                </div>
            `;
        }
    }
    
    // 显示结果表格（分页显示）
    displayResultsPage(results, 1);
    
    // 创建分页控件
    createPagination(results.length);
    
    // 启用导出按钮 - 避免多次绑定事件
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        // 先移除之前可能绑定的事件
        exportBtn.removeEventListener('click', exportResults);
        // 重新绑定事件
        exportBtn.addEventListener('click', exportResults);
    }
    
    // 分析商品类别数据
    analyzeProductCategories(results);
    
    // 显示销售趋势图
    if (typeof displaySalesTrend === 'function') {
        displaySalesTrend(results);
    }
    
    // 添加AI分析建议
    if (typeof generateAISuggestions === 'function') {
        generateAISuggestions(results);
    }
    
    // 确保添加了主播名称的点击事件
    setTimeout(() => {
        if (typeof addAnchorClickEvents === 'function') {
            console.log("添加主播名称点击事件...");
            addAnchorClickEvents();
        }
    }, 500);
}

// 显示特定页的结果
function displayResultsPage(results, page) {
    const tableBody = document.getElementById('matching-table-body');
    tableBody.innerHTML = '';
    
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, results.length);
    
    console.log(`显示结果页面 ${page}，索引范围: ${startIndex}-${endIndex}，总数: ${results.length}`);
    
    // 仅显示当前页的数据
    for (let i = startIndex; i < endIndex; i++) {
        const result = results[i];
        console.log(`显示结果 #${i+1}:`, result);
        
        const row = document.createElement('tr');
        
        // 如果有匹配数据，使用绿色背景；如果未匹配，使用黄色背景
        if (result.matched) {
            row.classList.add('table-success');
        } else {
            row.classList.add('table-warning'); // 未匹配用黄色背景提醒
        }
        
        // 从销售数据中提取信息
        const { product, spec, quantity, price, time } = extractSaleInfo(result.sale);
        
        // 创建日期时间显示
        let timeDisplay = `${result.date} ${result.time}`;
        if (result.matchedDate && result.matchedDate !== result.date) {
            timeDisplay += `<br><small class="text-danger">(匹配到 ${result.matchedDate})</small>`;
        }
        
        // 确保主播名称正确显示 
        let anchorDisplay = '<span class="text-danger">未匹配</span>';
        if (result.matched && result.anchor) {
            // 匹配结果页不需要点击功能，移除anchor-name-cell类和样式
            anchorDisplay = `<span class="fw-bold">${String(result.anchor).trim()}</span>`;
            console.log(`结果 #${i+1} 的主播名称: "${result.anchor}"`);
        } else if (result.matched) {
            anchorDisplay = '<span class="text-warning">匹配成功但无主播信息</span>';
        }
        
        // 确定商品档位和品牌类型
        const productBrand = result.productBrand || '';
        const productTier = result.productTier || '';
        
        // 构建最终档位显示
        let positionDisplay = '-';
        if (result.matched && result.position) {
            // 直接使用匹配到的档位信息
            const positionText = String(result.position).trim();
            
            // 根据档位类型设置不同的徽章样式
            if (positionText.includes('旺悦')) {
                if (positionText.includes('大档')) {
                    positionDisplay = '<span class="badge bg-danger">旺悦大档</span>';
                } else if (positionText.includes('小档')) {
                    positionDisplay = '<span class="badge bg-warning text-dark">旺悦小档</span>';
                } else {
                    positionDisplay = '<span class="badge bg-secondary">旺悦非档</span>';
                }
            } else if (positionText.includes('源悦')) {
                if (positionText.includes('大档')) {
                    positionDisplay = '<span class="badge bg-primary">源悦大档</span>';
                } else if (positionText.includes('小档')) {
                    positionDisplay = '<span class="badge bg-info text-dark">源悦小档</span>';
                } else {
                    positionDisplay = '<span class="badge bg-secondary">源悦非档</span>';
                }
            } else {
                // 默认档位显示
                positionDisplay = `<span class="badge bg-secondary">${positionText}</span>`;
            }
        } else if (productBrand) {
            // 如果有品牌和档位信息但没有匹配成功，仍然显示产品信息
            if (productBrand === '旺悦') {
                if (productTier === '大档') {
                    positionDisplay = '<span class="badge bg-danger opacity-50">旺悦大档</span>';
                } else if (productTier === '小档') {
                    positionDisplay = '<span class="badge bg-warning text-dark opacity-50">旺悦小档</span>';
                } else {
                    positionDisplay = '<span class="badge bg-secondary opacity-50">旺悦非档</span>';
                }
            } else if (productBrand === '源悦') {
                if (productTier === '大档') {
                    positionDisplay = '<span class="badge bg-primary opacity-50">源悦大档</span>';
                } else if (productTier === '小档') {
                    positionDisplay = '<span class="badge bg-info text-dark opacity-50">源悦小档</span>';
                } else {
                    positionDisplay = '<span class="badge bg-secondary opacity-50">源悦非档</span>';
                }
            }
        }
        
        // 显示时间段
        let timeSlotDisplay = result.timeSlot || '-';
        
        // 创建行内容
        row.innerHTML = `
            <td class="align-middle"><span class="product-name">${product || '-'}</span></td>
            <td class="align-middle text-nowrap">${spec || '-'}</td>
            <td class="align-middle text-center no-wrap-text">${quantity || '-'}</td>
            <td class="align-middle text-center no-wrap-text">${price ? '¥' + price : '-'}</td>
            <td class="align-middle text-nowrap">${timeDisplay}</td>
            <td class="align-middle text-center">${anchorDisplay}</td>
            <td class="align-middle text-nowrap">${timeSlotDisplay}</td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // 更新分页按钮状态
    updatePaginationButtons(page, Math.ceil(results.length / itemsPerPage));
}

// 创建分页控制
function createPagination(totalItems) {
    const paginationContainer = document.getElementById('pagination-container');
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (!paginationContainer) {
        // 如果不存在分页容器，创建一个
        const matchingDiv = document.getElementById('matching');
        if (!matchingDiv) return;
        
        const paginationDiv = document.createElement('div');
        paginationDiv.id = 'pagination-container';
        paginationDiv.className = 'pagination-container d-flex justify-content-center mt-4';
        
        paginationDiv.innerHTML = `
            <div class="btn-group">
                <button id="home-page" class="btn btn-outline-primary" disabled>
                    <i class="bi bi-house-door"></i> 首页
                </button>
                <button id="prev-page" class="btn btn-outline-primary" disabled>
                    <i class="bi bi-chevron-left"></i> 上一页
                </button>
                <button id="pagination-info" class="btn btn-outline-secondary" disabled>
                    第 1 页，共 ${totalPages} 页
                </button>
                <button id="next-page" class="btn btn-outline-primary">
                    下一页 <i class="bi bi-chevron-right"></i>
                </button>
            </div>
            <div class="ms-3 d-flex align-items-center">
                <div class="input-group" style="width: 150px;">
                    <input type="number" id="page-jump-input" class="form-control" min="1" max="${totalPages}" placeholder="页码">
                    <button id="page-jump-btn" class="btn btn-outline-primary">跳转</button>
                </div>
            </div>
        `;
        
        // 在结果表格后添加分页控件
        const tableResponsive = matchingDiv.querySelector('.table-responsive');
        if (tableResponsive) {
            tableResponsive.parentNode.insertBefore(paginationDiv, tableResponsive.nextSibling);
        } else {
            matchingDiv.appendChild(paginationDiv);
        }
        
        // 添加首页按钮事件监听器
        document.getElementById('home-page').addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage = 1;
                displayResultsPage(matchedResults, currentPage);
            }
        });
        
        // 添加事件监听器
        document.getElementById('prev-page').addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                displayResultsPage(matchedResults, currentPage);
            }
        });
        
        document.getElementById('next-page').addEventListener('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                displayResultsPage(matchedResults, currentPage);
            }
        });
        
        // 添加页码跳转事件监听器
        document.getElementById('page-jump-btn').addEventListener('click', function() {
            jumpToPage();
        });
        
        document.getElementById('page-jump-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                jumpToPage();
            }
        });
    } else {
        // 如果分页容器已存在，更新其内容
        const pageInfo = document.getElementById('pagination-info');
        if (pageInfo) {
            pageInfo.textContent = `第 1 页，共 ${totalPages} 页`;
        }
        
        // 更新页码输入框的最大值
        const pageJumpInput = document.getElementById('page-jump-input');
        if (pageJumpInput) {
            pageJumpInput.max = totalPages;
        }
    }
    
    // 页码跳转函数
    function jumpToPage() {
        const pageInput = document.getElementById('page-jump-input');
        let pageNum = parseInt(pageInput.value);
        
        if (isNaN(pageNum)) {
            showNotice("warning", "请输入有效的页码");
            return;
        }
        
        // 确保页码在有效范围内
        if (pageNum < 1) pageNum = 1;
        if (pageNum > totalPages) pageNum = totalPages;
        
        // 跳转到指定页
        currentPage = pageNum;
        displayResultsPage(matchedResults, currentPage);
        
        // 不再清空输入框，保留用户输入的值
    }
}

// 更新分页按钮状态
function updatePaginationButtons(currentPage, totalPages) {
    const homeButton = document.getElementById('home-page');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('pagination-info');
    
    if (homeButton) {
        homeButton.disabled = currentPage <= 1;
    }
    
    if (prevButton) {
        prevButton.disabled = currentPage <= 1;
    }
    
    if (nextButton) {
        nextButton.disabled = currentPage >= totalPages;
    }
    
    if (pageInfo) {
        pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
    }
}

// 从销售数据中提取必要信息
function extractSaleInfo(saleRow) {
    // 针对不同的数据结构进行适配
    if (!saleRow) return { product: '-', spec: '-', quantity: '-', price: '-', time: '-' };
    
    // 如果是对象（已解析的JSON）
    if (typeof saleRow === 'object' && !Array.isArray(saleRow)) {
        return {
            product: saleRow['选购商品'] || saleRow['商品名称'] || saleRow['商品'] || '-',
            spec: saleRow['商品规格'] || saleRow['规格'] || '-',
            quantity: saleRow['商品数量'] || saleRow['数量'] || '-',
            price: saleRow['订单应付金额'] || saleRow['订单金额'] || saleRow['金额'] || '-',
            time: saleRow['订单提交时间'] || saleRow['提交时间'] || saleRow['下单时间'] || '-'
        };
    }
    
    // 如果是数组（原始Excel行数据）
    if (Array.isArray(saleRow)) {
        // 针对常见的数据格式进行处理
        // 假设格式为：[商品名, 规格, 数量, 价格, 时间]
        return {
            product: saleRow[0] || '-',
            spec: saleRow[1] || '-',
            quantity: saleRow[2] || '-',
            price: saleRow[3] || '-',
            time: saleRow[4] || '-'
        };
    }
    
    // 默认返回空值
    return { product: '-', spec: '-', quantity: '-', price: '-', time: '-' };
}

// 清除数据
function clearData() {
    // 重置全局数据
    salesData = null;
    scheduleData = null;
    matchedResults = null;
    
    // 重置UI状态
    document.getElementById('sales-status').innerHTML = '';
    document.getElementById('schedule-status').innerHTML = '';
    
    // 隐藏结果区域
    if (resultsSection) {
        resultsSection.classList.add('d-none');
    }
    
    // 禁用分析按钮
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
    }
    
    // 清空文件选择输入框
    if (salesFileInput) salesFileInput.value = '';
    if (scheduleFileInput) scheduleFileInput.value = '';
    
    // 重置文件详情显示
    const fileInfoIds = ['sales-file-info', 'schedule-file-info'];
    fileInfoIds.forEach(id => {
        const fileInfo = document.getElementById(id);
        if (fileInfo) {
            const fileDetails = fileInfo.querySelector('.file-details');
            if (fileDetails) {
                fileDetails.classList.add('d-none');
                
                const fileName = fileDetails.querySelector('.file-name');
                if (fileName) fileName.textContent = '';
                
                const fileSize = fileDetails.querySelector('.file-size');
                if (fileSize) fileSize.textContent = '';
            }
        }
    });
    
    // 清空通知区域
    const noticeArea = document.getElementById('notice-area');
    if (noticeArea) {
        noticeArea.innerHTML = '';
    }
    
    console.log('数据已清除');
}

// 导出结果
function exportResults() {
    alert('导出功能将在后续实现');
}

// 显示加载提示
function showLoading(message = "正在处理数据...") {
    const loadingModal = document.getElementById('loading-modal');
    const loadingMessage = document.getElementById('loading-message');
    const loadingProgress = document.getElementById('loading-progress');
    
    if (loadingMessage) {
        loadingMessage.textContent = message;
    }
    
    if (loadingProgress) {
        loadingProgress.style.width = '0%';
        
        // 模拟进度
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 90) progress = 90; // 最多到90%，等待完成时设置100%
            loadingProgress.style.width = `${progress}%`;
        }, 300);
        
        // 保存间隔ID以便后续清除
        window.loadingInterval = interval;
    }
    
    // 直接显示模态框，而不使用Bootstrap的Modal实例
    loadingModal.style.display = 'block';
    loadingModal.classList.add('show');
    document.body.classList.add('modal-open');
    
    // 添加模态框背景
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    document.body.appendChild(backdrop);
}

// 隐藏加载提示
function hideLoading() {
    const loadingModal = document.getElementById('loading-modal');
    const loadingProgress = document.getElementById('loading-progress');
    
    // 清除进度条动画间隔
    if (window.loadingInterval) {
        clearInterval(window.loadingInterval);
    }
    
    // 设置进度为100%表示完成
    if (loadingProgress) {
        loadingProgress.style.width = '100%';
    }
    
    // 短暂延迟以显示100%进度
    setTimeout(() => {
        // 直接隐藏模态框
        loadingModal.style.display = 'none';
        loadingModal.classList.remove('show');
        document.body.classList.remove('modal-open');
        
        // 移除模态框背景
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            document.body.removeChild(backdrop);
        }
        
        // 自动滚动到结果区域
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 300);
}

// 显示通知消息
function showNotice(type, message) {
    const noticeArea = document.getElementById('notice-area');
    if (!noticeArea) return;
    
    // 清除现有通知
    noticeArea.innerHTML = '';
    
    // 创建新通知
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} mt-3`;
    alert.role = 'alert';
    
    // 添加图标
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="bi bi-check-circle-fill me-2"></i>';
            break;
        case 'danger':
            icon = '<i class="bi bi-exclamation-triangle-fill me-2"></i>';
            break;
        case 'warning':
            icon = '<i class="bi bi-exclamation-circle-fill me-2"></i>';
            break;
        case 'info':
            icon = '<i class="bi bi-info-circle-fill me-2"></i>';
            break;
    }
    
    alert.innerHTML = `${icon} ${message}`;
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close';
    closeButton.setAttribute('data-bs-dismiss', 'alert');
    closeButton.setAttribute('aria-label', '关闭');
    alert.appendChild(closeButton);
    
    // 添加到通知区域
    noticeArea.appendChild(alert);
    
    // 5秒后自动消失
    setTimeout(() => {
        alert.classList.add('fade');
        setTimeout(() => {
            if (noticeArea.contains(alert)) {
                noticeArea.removeChild(alert);
            }
        }, 500);
    }, 5000);
}

// 从销售记录中提取日期
function extractSaleDate(sale) {
    // 检查sale对象结构
    if (!sale) return null;
    
    // 尝试获取日期时间字符串
    let dateTimeStr = '';
    
    // 处理不同的数据结构
    if (typeof sale === 'object' && sale !== null) {
        if (Array.isArray(sale)) {
            // 如果是数组，尝试在第五个元素中查找日期时间（基于常见格式）
            dateTimeStr = sale[4] || '';
        } else {
            // 如果是对象，尝试查找常见的日期属性名
            dateTimeStr = sale.datetime || sale.date || sale.orderTime || sale.time || '';
            
            // 如果仍未找到，则尝试检查所有属性值中是否包含日期格式
            if (!dateTimeStr) {
                for (const key in sale) {
                    const value = String(sale[key] || '');
                    if (value.match(/\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/)) {
                        dateTimeStr = value;
                        break;
                    }
                }
            }
        }
    } else {
        // 如果不是对象或数组，尝试转换为字符串并检查日期格式
        dateTimeStr = String(sale || '');
    }
    
    // 尝试从字符串中提取日期部分
    if (dateTimeStr) {
        // 匹配YYYY-MM-DD或YYYY/MM/DD格式
        const dateMatch = dateTimeStr.match(/(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/);
        if (dateMatch) {
            return dateMatch[0].replace(/\//g, '-'); // 统一替换为破折号格式
        }
        
        // 匹配MM-DD或MM/DD格式，使用当前年份
        const shortDateMatch = dateTimeStr.match(/(\d{1,2}[-\/]\d{1,2})/);
        if (shortDateMatch) {
            const currentYear = new Date().getFullYear();
            return `${currentYear}-${shortDateMatch[0].replace(/\//g, '-')}`;
        }
        
        // 匹配中文日期格式（X月X日）
        const chineseDateMatch = dateTimeStr.match(/(\d+月\d+[日号])/);
        if (chineseDateMatch) {
            const match = chineseDateMatch[0].match(/(\d+)月(\d+)[日号]/);
            if (match) {
                const month = match[1].padStart(2, '0');
                const day = match[2].padStart(2, '0');
                const currentYear = new Date().getFullYear();
                return `${currentYear}-${month}-${day}`;
            }
        }
    }
    
    console.warn(`无法从 ${dateTimeStr} 提取日期`);
    return null;
}

// 从销售记录中提取时间
function extractSaleTime(sale) {
    // 检查sale对象结构
    if (!sale) return null;
    
    // 尝试获取日期时间字符串
    let dateTimeStr = '';
    
    // 处理不同的数据结构
    if (typeof sale === 'object' && sale !== null) {
        if (Array.isArray(sale)) {
            // 如果是数组，尝试在第五个元素中查找时间（基于常见格式）
            dateTimeStr = sale[4] || '';
        } else {
            // 如果是对象，尝试查找常见的时间属性名
            dateTimeStr = sale.datetime || sale.date || sale.orderTime || sale.time || '';
            
            // 如果仍未找到，则尝试检查所有属性值中是否包含时间格式
            if (!dateTimeStr) {
                for (const key in sale) {
                    const value = String(sale[key] || '');
                    if (value.match(/\d{1,2}:\d{2}(:\d{2})?/)) {
                        dateTimeStr = value;
                        break;
                    }
                }
            }
        }
    } else {
        // 如果不是对象或数组，尝试转换为字符串并检查时间格式
        dateTimeStr = String(sale || '');
    }
    
    // 尝试从字符串中提取时间部分
    if (dateTimeStr) {
        // 匹配HH:MM:SS或HH:MM格式
        const timeMatch = dateTimeStr.match(/(\d{1,2}:\d{2}(:\d{2})?)/);
        if (timeMatch) {
            return timeMatch[0];
        }
    }
    
    console.warn(`无法从 ${dateTimeStr} 提取时间`);
    return null;
}

// 将时间转换为分钟数（用于时间比较）
function timeToMinutes(timeStr) {
    if (!timeStr) return null;
    
    const parts = timeStr.split(':');
    if (parts.length < 2) return null;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    return hours * 60 + minutes;
}

// 商品分类分析
function analyzeProductCategories(results) {
    console.log("开始商品分类分析...");
    
    // 创建分析结果对象
    productCategoryAnalysis = {};
    
    // 遍历所有匹配结果
    results.forEach(result => {
        if (!result.matched || !result.anchor) return; // 跳过未匹配的结果或无主播信息的结果
        
        const anchorName = result.anchor.trim();
        const saleInfo = extractSaleInfo(result.sale);
        const productName = saleInfo.product || '';
        const price = parseFloat(saleInfo.price) || 0;
        
        // 如果这个主播还没有数据，初始化
        if (!productCategoryAnalysis[anchorName]) {
            productCategoryAnalysis[anchorName] = {
                '源悦': 0,
                '莼悦': 0,
                '旺玥': 0,
                '皇家': 0
            };
        }
        
        // 根据商品名称分类
        if (productName.includes('源悦')) {
            productCategoryAnalysis[anchorName]['源悦'] += price;
        } else if (productName.includes('莼悦')) {
            productCategoryAnalysis[anchorName]['莼悦'] += price;
        } else if (productName.includes('旺玥')) {
            productCategoryAnalysis[anchorName]['旺玥'] += price;
        } else if (productName.includes('皇家') && !productName.includes('旺玥') && !productName.includes('莼悦')) {
            productCategoryAnalysis[anchorName]['皇家'] += price;
        }
    });
    
    // 输出分析结果到控制台
    console.log("商品分类分析结果:", productCategoryAnalysis);
    
    // 在数据分析选项卡中显示结果
    displayProductCategoryAnalysis();
    
    return productCategoryAnalysis;
}

// 显示商品分类分析结果
function displayProductCategoryAnalysis() {
    const analysisTab = document.getElementById('analysis');
    if (!analysisTab) {
        console.error("找不到显示分析结果的选项卡");
        return;
    }
    
    // 查找分析选项卡中的内容容器
    const cardBody = analysisTab.querySelector('.card-body');
    if (!cardBody) {
        console.error("找不到分析选项卡的内容容器");
        return;
    }
    
    // 查找或创建显示分类分析的容器
    let categoryContainer = document.getElementById('product-category-analysis');
    if (!categoryContainer) {
        // 创建新的行和列结构
        const newRow = document.createElement('div');
        newRow.className = 'row mb-4';
        
        const newCol = document.createElement('div');
        newCol.className = 'col-md-12';
        
        categoryContainer = document.createElement('div');
        categoryContainer.id = 'product-category-analysis';
        
        newCol.appendChild(categoryContainer);
        newRow.appendChild(newCol);
        
        // 在第一个图表行之前插入新行
        const existingRow = cardBody.querySelector('.row');
        if (existingRow) {
            cardBody.insertBefore(newRow, existingRow);
        } else {
            cardBody.appendChild(newRow);
        }
    }
    
    // 创建内容 - 使用更美观的卡片设计
    let html = `
    <div class="card shadow-sm border-0 mb-4">
        <div class="card-header bg-primary text-white py-3">
            <h5 class="mb-0 fw-bold">
                <i class="bi bi-bar-chart-fill me-2"></i>各主播商品类别销售额分析
            </h5>
        </div>
        <div class="card-body p-0">
    `;
    
    // 如果没有数据
    if (Object.keys(productCategoryAnalysis).length === 0) {
        html += `
        <div class="p-4">
            <div class="alert alert-warning d-flex align-items-center" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div>无可用数据进行商品分类分析</div>
            </div>
        </div>`;
    } else {
        // 创建表格 - 改进样式
        html += `
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-bottom: 2px solid #4e73df; min-width: 100px;">主播</th>
                            <th class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-bottom: 2px solid #4e73df; color: #4e73df;">源悦类</th>
                            <th class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-bottom: 2px solid #1cc88a; color: #1cc88a;">莼悦类</th>
                            <th class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-bottom: 2px solid #f6c23e; color: #f6c23e;">旺玥类</th>
                            <th class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-bottom: 2px solid #e74a3b; color: #e74a3b;">皇家类</th>
                            <th class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-bottom: 2px solid #36b9cc; color: #36b9cc; min-width: 120px;">总计</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // 计算总销售额
        let totalSourceSales = 0;
        let totalChunSales = 0; 
        let totalWangSales = 0;
        let totalRoyalSales = 0;
        let grandTotal = 0;
        
        // 为每个主播添加一行 - 改进样式
        Object.entries(productCategoryAnalysis).forEach(([anchor, categories], index) => {
            const total = categories['源悦'] + categories['莼悦'] + categories['旺玥'] + categories['皇家'];
            
            // 累加总销售额
            totalSourceSales += categories['源悦'];
            totalChunSales += categories['莼悦'];
            totalWangSales += categories['旺玥'];
            totalRoyalSales += categories['皇家'];
            grandTotal += total;
            
            // 格式化数字显示
            const formatNumber = num => {
                return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            };
            
            const rowClass = index % 2 === 0 ? '' : 'bg-light-subtle';
            
            html += `
                <tr class="${rowClass} hover-effect">
                    <td class="py-3 px-4 text-center fw-bold text-primary">${anchor}</td>
                    <td class="py-3 px-4 text-center" style="position: relative;">
                        <span class="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 w-100">
                            ¥ ${formatNumber(categories['源悦'])}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-center" style="position: relative;">
                        <span class="badge rounded-pill bg-success bg-opacity-10 text-success px-3 py-2 w-100">
                            ¥ ${formatNumber(categories['莼悦'])}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-center" style="position: relative;">
                        <span class="badge rounded-pill bg-warning bg-opacity-10 text-warning px-3 py-2 w-100">
                            ¥ ${formatNumber(categories['旺玥'])}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-center" style="position: relative;">
                        <span class="badge rounded-pill bg-danger bg-opacity-10 text-danger px-3 py-2 w-100">
                            ¥ ${formatNumber(categories['皇家'])}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-center fw-bold text-primary" style="position: relative;">
                        <span class="badge rounded-pill bg-info bg-opacity-10 text-info px-3 py-2 w-100 fs-6">
                            ¥ ${formatNumber(total)}
                        </span>
                    </td>
                </tr>
            `;
        });
        
        // 添加总计行
        html += `
            <tr style="background-color: #f8f9fa;">
                <td class="py-3 px-4 text-center fw-bold" style="background-color: #f8f9fa; border-top: 2px solid #4e73df;">总计</td>
                <td class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-top: 2px solid #4e73df; position: relative;">
                    <span class="badge rounded-pill bg-primary px-3 py-2 w-100 text-white">
                        ¥ ${totalSourceSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </span>
                </td>
                <td class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-top: 2px solid #1cc88a; position: relative;">
                    <span class="badge rounded-pill bg-success px-3 py-2 w-100 text-white">
                        ¥ ${totalChunSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </span>
                </td>
                <td class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-top: 2px solid #f6c23e; position: relative;">
                    <span class="badge rounded-pill bg-warning px-3 py-2 w-100 text-white">
                        ¥ ${totalWangSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </span>
                </td>
                <td class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-top: 2px solid #e74a3b; position: relative;">
                    <span class="badge rounded-pill bg-danger px-3 py-2 w-100 text-white">
                        ¥ ${totalRoyalSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </span>
                </td>
                <td class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-top: 2px solid #36b9cc; position: relative;">
                    <span class="badge rounded-pill bg-dark px-3 py-2 w-100 text-white fs-6">
                        ¥ ${grandTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </span>
                </td>
            </tr>
        `;
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    html += `
        </div>
    </div>
    `;
    
    // 更新容器内容
    categoryContainer.innerHTML = html;
    
    // 如果有数据，创建图表
    if (Object.keys(productCategoryAnalysis).length > 0) {
        createProductCategoryCharts();
    }
}

// 创建商品类别销售分析图表
function createProductCategoryCharts() {
    console.log("创建商品分类图表...");
    
    // 检查数据是否存在
    if (!productCategoryAnalysis || Object.keys(productCategoryAnalysis).length === 0) {
        console.warn("没有可用数据来创建图表");
        return;
    }
    
    // 为图表创建一个新行
    const analysisTab = document.getElementById('analysis');
    if (!analysisTab) return;
    
    const cardBody = analysisTab.querySelector('.card-body');
    if (!cardBody) return;
    
    // 查找是否已存在这个图表行
    let chartRow = document.getElementById('product-category-charts-row');
    if (!chartRow) {
        chartRow = document.createElement('div');
        chartRow.id = 'product-category-charts-row';
        chartRow.className = 'row mt-4';
        
        // 创建图表卡片容器
        const pieChartCol = document.createElement('div');
        pieChartCol.className = 'col-md-12 mb-4';
        
        const pieChartCard = document.createElement('div');
        pieChartCard.className = 'card shadow-sm border-0';
        
        const pieChartCardHeader = document.createElement('div');
        pieChartCardHeader.className = 'card-header bg-gradient-primary text-white py-3';
        pieChartCardHeader.innerHTML = '<h5 class="mb-0 fw-bold"><i class="bi bi-pie-chart-fill me-2"></i>商品类别销售额分布</h5>';
        
        const pieChartCardBody = document.createElement('div');
        pieChartCardBody.className = 'card-body';
        
        // 创建图表容器的行列结构
        const chartContainerRow = document.createElement('div');
        chartContainerRow.className = 'row';
        
        // 左侧饼图
        const pieChartColLeft = document.createElement('div');
        pieChartColLeft.className = 'col-md-6';
        
        const pieChartContainer = document.createElement('div');
        pieChartContainer.className = 'chart-container';
        pieChartContainer.style.position = 'relative';
        pieChartContainer.style.height = '350px';
        
        // 创建canvas元素
        const pieChartCanvas = document.createElement('canvas');
        pieChartCanvas.id = 'product-category-pie-chart';
        
        // 右侧统计和信息
        const statsColRight = document.createElement('div');
        statsColRight.className = 'col-md-6';
        statsColRight.id = 'product-category-stats';
        
        // 组合元素
        pieChartContainer.appendChild(pieChartCanvas);
        pieChartColLeft.appendChild(pieChartContainer);
        chartContainerRow.appendChild(pieChartColLeft);
        chartContainerRow.appendChild(statsColRight);
        
        pieChartCardBody.appendChild(chartContainerRow);
        pieChartCard.appendChild(pieChartCardHeader);
        pieChartCard.appendChild(pieChartCardBody);
        pieChartCol.appendChild(pieChartCard);
        chartRow.appendChild(pieChartCol);
        
        // 添加到分析选项卡
        cardBody.appendChild(chartRow);
    }
    
    // 计算总销售额
    let totalSourceSales = 0;
    let totalChunSales = 0;
    let totalWangSales = 0;
    let totalRoyalSales = 0;
    
    Object.entries(productCategoryAnalysis).forEach(([anchor, categories]) => {
        totalSourceSales += categories['源悦'];
        totalChunSales += categories['莼悦'];
        totalWangSales += categories['旺玥'];
        totalRoyalSales += categories['皇家'];
    });
    
    const totalSales = totalSourceSales + totalChunSales + totalWangSales + totalRoyalSales;
    
    // 创建饼图数据
    const pieData = {
        labels: ['源悦类', '莼悦类', '旺玥类', '皇家类'],
        datasets: [{
            data: [totalSourceSales, totalChunSales, totalWangSales, totalRoyalSales],
            backgroundColor: ['#4e73df', '#1cc88a', '#f6c23e', '#e74a3b'],
            hoverBackgroundColor: ['#2e59d9', '#17a673', '#f4b619', '#d52a1a'],
            borderWidth: 3,
            borderColor: '#ffffff',
            hoverOffset: 15
        }]
    };
    
    // 如果已存在图表实例，先销毁它
    if (window.productCategoryPieChart) {
        window.productCategoryPieChart.destroy();
    }
    
    // 获取Canvas上下文
    const pieChartCanvas = document.getElementById('product-category-pie-chart');
    if (!pieChartCanvas) {
        console.error("找不到商品类别饼图的Canvas元素");
        return;
    }
    
    const pieCtx = pieChartCanvas.getContext('2d');
    
    // 创建饼图
    window.productCategoryPieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: pieData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            layout: {
                padding: 20
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 14
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    titleFont: {
                        weight: 'bold',
                        size: 16
                    },
                    bodyColor: '#333',
                    bodyFont: {
                        size: 14
                    },
                    borderColor: '#e0e0e0',
                    borderWidth: 1,
                    cornerRadius: 6,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / totalSales) * 100).toFixed(1);
                            return `${context.label}: ¥${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (${percentage}%)`;
                        }
                    }
                }
            },
            elements: {
                arc: {
                    borderWidth: 2
                }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: function(chart) {
                const width = chart.width;
                const height = chart.height;
                const ctx = chart.ctx;
                
                ctx.restore();
                
                // 绘制中心文本 - 总销售额
                const fontSize = (height / 200).toFixed(2) * 16;
                ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                
                // 总计文本
                ctx.fillStyle = '#666';
                const totalText = '总销售额';
                ctx.fillText(totalText, width / 2, height / 2 - fontSize * 0.6);
                
                // 总额
                ctx.fillStyle = '#4e73df';
                ctx.font = `bold ${fontSize * 1.5}px 'Segoe UI', sans-serif`;
                const formattedTotal = `¥${totalSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                ctx.fillText(formattedTotal, width / 2, height / 2 + fontSize * 0.8);
                
                ctx.save();
            }
        }]
    });
    
    // 更新右侧统计信息
    updateProductCategoryStats(totalSourceSales, totalChunSales, totalWangSales, totalRoyalSales, totalSales);
    
    // 添加主播名称点击事件，用于查看单个主播的类目销售详情
    // 使用requestAnimationFrame优化性能
    requestAnimationFrame(() => {
        addAnchorClickEvents();
    });
}

// 更新商品类别统计信息
function updateProductCategoryStats(sourceAmount, chunAmount, wangAmount, royalAmount, totalAmount) {
    const statsContainer = document.getElementById('product-category-stats');
    if (!statsContainer) return;
    
    // 计算百分比
    const sourcePercent = ((sourceAmount / totalAmount) * 100).toFixed(1);
    const chunPercent = ((chunAmount / totalAmount) * 100).toFixed(1);
    const wangPercent = ((wangAmount / totalAmount) * 100).toFixed(1);
    const royalPercent = ((royalAmount / totalAmount) * 100).toFixed(1);
    
    // 创建统计卡片
    statsContainer.innerHTML = `
        <h5 class="text-gray-800 mb-4">类别销售占比</h5>
        
        <div class="category-stat-item mb-4">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <h6 class="mb-0"><span class="badge bg-primary me-2">●</span> 源悦类</h6>
                <span class="text-dark fw-bold">${sourcePercent}%</span>
            </div>
            <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-primary" role="progressbar" style="width: ${sourcePercent}%" 
                     aria-valuenow="${sourcePercent}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div class="small text-end mt-1">¥${sourceAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
        </div>
        
        <div class="category-stat-item mb-4">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <h6 class="mb-0"><span class="badge bg-success me-2">●</span> 莼悦类</h6>
                <span class="text-dark fw-bold">${chunPercent}%</span>
            </div>
            <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${chunPercent}%" 
                     aria-valuenow="${chunPercent}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div class="small text-end mt-1">¥${chunAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
        </div>
        
        <div class="category-stat-item mb-4">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <h6 class="mb-0"><span class="badge bg-warning me-2">●</span> 旺玥类</h6>
                <span class="text-dark fw-bold">${wangPercent}%</span>
            </div>
            <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-warning" role="progressbar" style="width: ${wangPercent}%" 
                     aria-valuenow="${wangPercent}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div class="small text-end mt-1">¥${wangAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
        </div>
        
        <div class="category-stat-item mb-4">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <h6 class="mb-0"><span class="badge bg-danger me-2">●</span> 皇家类</h6>
                <span class="text-dark fw-bold">${royalPercent}%</span>
            </div>
            <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-danger" role="progressbar" style="width: ${royalPercent}%" 
                     aria-valuenow="${royalPercent}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div class="small text-end mt-1">¥${royalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
        </div>
        
        <div class="alert alert-light mt-4">
            <div class="d-flex align-items-center">
                <i class="bi bi-lightbulb-fill text-warning me-3 fs-4"></i>
                <div>
                    <h6 class="mb-1">销售分析洞察</h6>
                    <p class="mb-0 small">${getProductCategoryInsight(sourcePercent, chunPercent, wangPercent, royalPercent)}</p>
                </div>
            </div>
        </div>
    `;
}

// 根据类别占比生成销售分析洞察
function getProductCategoryInsight(sourcePercent, chunPercent, wangPercent, royalPercent) {
    // 找出占比最高的类别
    const percentages = [
        {name: '源悦类', value: parseFloat(sourcePercent)},
        {name: '莼悦类', value: parseFloat(chunPercent)},
        {name: '旺玥类', value: parseFloat(wangPercent)},
        {name: '皇家类', value: parseFloat(royalPercent)}
    ];
    
    percentages.sort((a, b) => b.value - a.value);
    
    const topCategory = percentages[0];
    const secondCategory = percentages[1];
    
    // 判断销售分布是否均衡
    const isBalanced = percentages[0].value - percentages[3].value < 30;
    
    if (isBalanced) {
        return `销售分布较为均衡，各类商品都有不错的表现。建议继续保持当前的销售策略，同时可以尝试进一步提升${topCategory.name}和${secondCategory.name}的销售占比。`;
    } else {
        return `${topCategory.name}表现突出，占据了销售的主要份额(${topCategory.value}%)。建议重点关注${percentages[3].name}的提升空间，可以考虑调整营销策略或主播排班方式来平衡各类商品销售。`;
    }
}

function createAnchorCategoryCharts(anchorName) {
    console.log(`创建主播 ${anchorName} 的类目销售额饼图`);
    
    try {
        // 检查数据是否存在
        if (!productCategoryAnalysis || !productCategoryAnalysis[anchorName]) {
            console.warn(`没有找到主播 ${anchorName} 的销售数据`);
            alert(`没有找到主播 ${anchorName} 的销售数据`);
            return;
        }
        
        // 获取模态框元素
        const modalElement = document.getElementById('anchor-chart-modal');
        if (!modalElement) {
            console.error('找不到主播类目分析模态框');
            alert('无法显示主播类目分析');
            return;
        }

        // 销毁现有的图表实例
        if (window.anchorCategoryPieChart instanceof Chart) {
            try {
                window.anchorCategoryPieChart.destroy();
                console.log('已销毁旧的图表实例');
            } catch (e) {
                console.error('销毁旧图表实例失败', e);
            }
            window.anchorCategoryPieChart = null;
        }

        // 修改模态框标题
        const modalTitle = modalElement.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = `${anchorName} 类目销售分析`;
        }

        // 获取该主播的类目销售数据
        const categoryData = productCategoryAnalysis[anchorName];
        
        // 计算总销售额
        const totalSales = Object.values(categoryData).reduce((sum, value) => sum + value, 0);
        
        // 设置总销售额显示
        const totalSalesElement = document.getElementById('anchor-total-sales');
        if (totalSalesElement) {
            totalSalesElement.textContent = `¥${totalSales.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
        
        // 生成表格HTML
        const categoryTable = document.getElementById('anchor-category-table');
        if (categoryTable) {
            categoryTable.innerHTML = '';
            
            [
                { name: '源悦类', value: categoryData['源悦'] || 0, color: '#4e73df' },
                { name: '莼悦类', value: categoryData['莼悦'] || 0, color: '#1cc88a' },
                { name: '旺玥类', value: categoryData['旺玥'] || 0, color: '#f6c23e' },
                { name: '皇家类', value: categoryData['皇家'] || 0, color: '#e74a3b' }
            ].forEach(category => {
                const percentage = totalSales > 0 ? ((category.value / totalSales) * 100).toFixed(1) : '0.0';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            <span class="badge me-2" style="background-color: ${category.color}; width: 15px; height: 15px;"></span>
                            <span>${category.name}</span>
                        </div>
                    </td>
                    <td class="text-end">¥${category.value.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td class="text-end">${percentage}%</td>
                `;
                categoryTable.appendChild(row);
            });
        }
        
        // 创建饼图
        const ctx = document.getElementById('anchor-category-pie-chart').getContext('2d');
        window.anchorCategoryPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['源悦类', '莼悦类', '旺玥类', '皇家类'],
                datasets: [{
                    data: [
                        categoryData['源悦'] || 0,
                        categoryData['莼悦'] || 0,
                        categoryData['旺玥'] || 0,
                        categoryData['皇家'] || 0
                    ],
                    backgroundColor: ['#4e73df', '#1cc88a', '#f6c23e', '#e74a3b'],
                    hoverBackgroundColor: ['#2e59d9', '#17a673', '#f4b619', '#d52a1a'],
                    hoverBorderColor: "rgba(234, 236, 244, 1)",
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `¥${value.toLocaleString('zh-CN')} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%',
                elements: {
                    arc: {
                        borderWidth: 0
                    }
                }
            }
        });
        
        // 显示模态框
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // 为新增按钮添加事件处理
        // 导出数据按钮
        const exportDataBtn = document.getElementById('export-anchor-data');
        if (exportDataBtn) {
            exportDataBtn.onclick = function() {
                // 创建导出数据
                const exportData = {
                    anchor: anchorName,
                    categories: {
                        '源悦类': categoryData['源悦'] || 0,
                        '莼悦类': categoryData['莼悦'] || 0,
                        '旺玥类': categoryData['旺玥'] || 0,
                        '皇家类': categoryData['皇家'] || 0
                    },
                    totalSales: totalSales,
                    date: new Date().toLocaleDateString('zh-CN')
                };
                
                // 转换为CSV字符串
                const csvContent = "数据:,金额(元),占比\n" + 
                    Object.entries(exportData.categories).map(([key, value]) => {
                        const percentage = totalSales > 0 ? ((value / totalSales) * 100).toFixed(1) : '0.0';
                        return `${key},${value.toFixed(2)},${percentage}%`;
                    }).join('\n');
                
                // 创建下载链接
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `${anchorName}-类目销售数据-${new Date().toLocaleDateString('zh-CN')}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // 显示提示
                showNotice('success', '数据导出成功！');
            };
        }
        
        // 查看详情按钮
        const showDetailsBtn = document.getElementById('show-anchor-details');
        if (showDetailsBtn) {
            showDetailsBtn.onclick = function() {
                // 获取当前模态框并隐藏
                const currentModal = bootstrap.Modal.getInstance(document.getElementById('anchor-chart-modal'));
                if (currentModal) {
                    currentModal.hide();
                }
                
                // 确保全局分析结果存在
                if (!window.analysisResults || !Array.isArray(window.analysisResults) || window.analysisResults.length === 0) {
                    console.error('无法获取分析结果，请重新分析数据');
                    showNotice('error', '无法获取分析结果，请重新分析数据');
                    return;
                }
                
                console.log(`使用全局分析结果 (${window.analysisResults.length}条记录) 查找${anchorName}的订单`);
                
                // 筛选出该主播的所有订单
                const anchorOrders = window.analysisResults.filter(result => {
                    return result.anchor && (
                        // 支持两种可能的数据结构：anchor作为字符串或带有name属性的对象
                        (typeof result.anchor === 'string' && result.anchor.trim() === anchorName) || 
                        (result.anchor.name && result.anchor.name === anchorName)
                    );
                });
                
                if (anchorOrders.length === 0) {
                    console.warn(`未找到${anchorName}的订单记录`);
                    showNotice('warning', `未找到${anchorName}的订单记录`);
                    return;
                }
                
                console.log(`找到${anchorOrders.length}条${anchorName}的订单记录`);
                
                // 按照商品类别分组订单
                const ordersByCategory = {
                    '旺玥': [],
                    '源悦': [],
                    '莼悦': [],
                    '皇家': []
                };
                
                // 为保持分组的可见性，我们使用一个常量存储类目顺序
                const CATEGORY_ORDER = ['旺玥', '源悦', '莼悦', '皇家'];
                
                // 分类统计
                let categorizedCount = 0;
                
                anchorOrders.forEach(order => {
                    const saleInfo = extractSaleInfo(order.sale);
                    const productName = saleInfo.product || '';
                    
                    let matched = false;
                    
                    // 尝试根据产品名称包含的关键词来分类
                    if (productName.includes('旺玥')) {
                        ordersByCategory['旺玥'].push(order);
                        matched = true;
                    } else if (productName.includes('源悦')) {
                        ordersByCategory['源悦'].push(order);
                        matched = true;
                    } else if (productName.includes('莼悦')) {
                        ordersByCategory['莼悦'].push(order);
                        matched = true;
                    } else if (productName.includes('皇家')) {
                        ordersByCategory['皇家'].push(order);
                        matched = true;
                    }
                    
                    // 如果上面没有匹配成功，尝试通过商品名称进行更宽松的匹配
                    if (!matched) {
                        // 可以添加更多匹配规则，比如其他关键词匹配
                        if (productName.includes('旺') || productName.includes('玥')) {
                            ordersByCategory['旺玥'].push(order);
                            matched = true;
                        } else if (productName.includes('源') || productName.includes('悦')) {
                            ordersByCategory['源悦'].push(order);
                            matched = true;
                        } else if (productName.includes('莼')) {
                            ordersByCategory['莼悦'].push(order);
                            matched = true;
                        } else if (productName.includes('皇') || productName.includes('家') || productName.includes('royal')) {
                            ordersByCategory['皇家'].push(order);
                            matched = true;
                        } else {
                            // 如果仍然无法分类，默认放入皇家类别
                            ordersByCategory['皇家'].push(order);
                            matched = true;
                        }
                    }
                    
                    if (matched) {
                        categorizedCount++;
                    }
                });
                
                console.log(`成功分类${categorizedCount}/${anchorOrders.length}条订单`);
                console.log('各类别订单数量:', 
                    '旺玥:', ordersByCategory['旺玥'].length,
                    '源悦:', ordersByCategory['源悦'].length,
                    '莼悦:', ordersByCategory['莼悦'].length,
                    '皇家:', ordersByCategory['皇家'].length
                );
                
                // 创建详情弹窗内容
                let detailsHTML = `
                    <div class="modal fade" id="anchor-details-modal" tabindex="-1">
                        <div class="modal-dialog modal-xl">
                            <div class="modal-content">
                                <div class="modal-header bg-primary text-white">
                                    <h5 class="modal-title">${anchorName} 订单明细</h5>
                                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <ul class="nav nav-tabs" id="categoryTabs" role="tablist">`;
                
                // 创建标签页
                let firstCategory = true;
                // 使用CATEGORY_ORDER确保按照指定顺序显示标签页
                CATEGORY_ORDER.forEach(category => {
                    if (ordersByCategory[category] && ordersByCategory[category].length > 0) {
                        // 使用固定的categoryId映射
                        const categoryIdMap = {
                            '旺玥': 'wang',
                            '源悦': 'yuan',
                            '莼悦': 'chun',
                            '皇家': 'royal'
                        };
                        const categoryId = categoryIdMap[category] || category.toLowerCase();
                        
                        detailsHTML += `
                            <li class="nav-item" role="presentation">
                                <button class="nav-link ${firstCategory ? 'active' : ''}" 
                                    id="${categoryId}-tab" 
                                    data-bs-toggle="tab" 
                                    data-bs-target="#${categoryId}-content" 
                                    type="button" role="tab">
                                    ${category}类 (${ordersByCategory[category].length})
                                </button>
                            </li>`;
                        firstCategory = false;
                    }
                });
                
                detailsHTML += `
                                    </ul>
                                    <div class="tab-content mt-3" id="categoryTabsContent">`;
                
                // 创建每个类别的内容
                firstCategory = true;
                for (const category in ordersByCategory) {
                    if (ordersByCategory[category].length > 0) {
                        // 使用固定的categoryId映射
                        const categoryIdMap = {
                            '旺玥': 'wang',
                            '源悦': 'yuan',
                            '莼悦': 'chun',
                            '皇家': 'royal'
                        };
                        const categoryId = categoryIdMap[category] || category.toLowerCase();
                        
                        detailsHTML += `
                            <div class="tab-pane fade ${firstCategory ? 'show active' : ''}" 
                                id="${categoryId}-content" role="tabpanel">
                                <div class="table-responsive">
                                    <table class="table table-striped table-hover">
                                        <thead>
                                            <tr>
                                                <th>商品名称</th>
                                                <th>规格</th>
                                                <th>数量</th>
                                                <th>金额</th>
                                                <th>订单时间</th>
                                            </tr>
                                        </thead>
                                        <tbody id="${categoryId}-orders-table">
                                            <!-- 订单数据将通过JS动态生成 -->
                                        </tbody>
                                        <tfoot>
                                            <tr class="table-active">
                                                <td colspan="3" class="text-end fw-bold">类别合计：</td>
                                                <td class="text-end fw-bold" id="${categoryId}-total">¥0.00</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mt-4">
                                    <div class="pagination-info text-muted small" id="${categoryId}-pagination-info">
                                        <!-- 分页信息 -->
                                    </div>
                                    <div class="pagination-controls" id="${categoryId}-pagination-controls">
                                        <!-- 分页控件 -->
                                    </div>
                                </div>
                            </div>`;
                        
                        firstCategory = false;
                    }
                }
                
                detailsHTML += `
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <div class="row w-100">
                                        <div class="col-md-6 mb-2 mb-md-0">
                                            <button type="button" id="export-detail-data" class="btn btn-primary w-100">
                                                <i class="bi bi-download me-1"></i>导出订单明细
                                            </button>
                                        </div>
                                        <div class="col-md-6">
                                            <button type="button" class="btn btn-secondary w-100" data-bs-dismiss="modal">
                                                <i class="bi bi-x-circle me-1"></i>关闭
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                
                // 添加到文档并显示
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = detailsHTML;
                document.body.appendChild(tempDiv.firstElementChild);
                
                // 为每个类别初始化分页和数据
                const itemsPerDetailPage = 5; // 每页显示5条订单
                const categoryPagination = {};
                
                CATEGORY_ORDER.forEach(category => {
                    if (ordersByCategory[category] && ordersByCategory[category].length > 0) {
                        const categoryIdMap = {
                            '旺玥': 'wang',
                            '源悦': 'yuan',
                            '莼悦': 'chun',
                            '皇家': 'royal'
                        };
                        const categoryId = categoryIdMap[category] || category.toLowerCase();
                        
                        // 初始化分页状态
                        categoryPagination[categoryId] = {
                            currentPage: 1,
                            itemsPerPage: itemsPerDetailPage,
                            totalItems: ordersByCategory[category].length,
                            totalPages: Math.ceil(ordersByCategory[category].length / itemsPerDetailPage)
                        };
                        
                        // 计算类别总销售额
                        let categoryTotal = 0;
                        ordersByCategory[category].forEach(order => {
                            const saleInfo = extractSaleInfo(order.sale);
                            categoryTotal += parseFloat(saleInfo.price) || 0;
                        });
                        
                        // 更新总计金额
                        const totalElement = document.getElementById(`${categoryId}-total`);
                        if (totalElement) {
                            totalElement.textContent = `¥${categoryTotal.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                        }
                        
                        // 创建分页控件
                        createDetailPagination(categoryId, categoryPagination[categoryId]);
                        
                        // 显示第一页数据
                        displayOrdersForCategory(categoryId, ordersByCategory[category], 1, itemsPerDetailPage);
                    }
                });
                
                // 导出订单明细功能
                document.getElementById('export-detail-data').addEventListener('click', function() {
                    exportAnchorDetails(anchorName, ordersByCategory);
                });
                
                const detailsModal = new bootstrap.Modal(document.getElementById('anchor-details-modal'));
                detailsModal.show();
                
                // 添加事件处理程序，关闭后删除模态框
                document.getElementById('anchor-details-modal').addEventListener('hidden.bs.modal', function() {
                    document.body.removeChild(document.getElementById('anchor-details-modal'));
                });
            };
        }
        
        // 添加到报告按钮
        const addToReportBtn = document.getElementById('add-to-report-btn');
        if (addToReportBtn) {
            addToReportBtn.onclick = function() {
                // 显示添加成功的提示
                showNotice('success', `已将${anchorName}的销售数据添加到报告`);
                // 这里可以实现将当前数据添加到报告的逻辑
            };
        }
        
    } catch (error) {
        console.error('创建主播类目销售图表时出错:', error);
        alert('创建销售分析图表时出错，请重试。');
    }
}

// 添加点击主播名称事件，显示该主播的类目销售饼图
function addAnchorClickEvents() {
    console.log('添加主播名称点击事件');
    
    // 只查找数据分析模块中的主播名称单元格
    const analysisTables = document.querySelectorAll('#product-category-analysis table');
    
    if (!analysisTables || analysisTables.length === 0) {
        console.warn("未找到主播分析表格，无法添加点击事件");
        return;
    }
    
    console.log(`找到 ${analysisTables.length} 个分析表格`);
    
    // 先移除所有现有的点击事件处理程序
    document.querySelectorAll('.anchor-name-cell').forEach(cell => {
        // 使用更安全的方式移除事件监听器，防止内存泄漏
        const newCell = cell.cloneNode(true);
        cell.parentNode.replaceChild(newCell, cell);
    });
    
    // 重新为表格中的主播名称添加点击事件
    analysisTables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const firstCell = row.querySelector('td:first-child');
            if (firstCell && firstCell.textContent && firstCell.textContent.trim() !== '总计') {
                const anchorName = firstCell.textContent.trim();
                
                // 添加视觉提示
                firstCell.classList.add('anchor-name-cell');
                firstCell.style.cursor = 'pointer';
                firstCell.style.textDecoration = 'underline';
                firstCell.title = `点击查看${anchorName}的类目销售详情`;
                
                // 添加点击事件 - 使用更简单的点击处理
                firstCell.addEventListener('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    console.log(`点击查看主播 ${anchorName} 的销售详情`);
                    
                    // 强制清理任何可能存在的模态框
                    const existingModal = document.querySelector('.modal.show');
                    if (existingModal) {
                        try {
                            // 尝试使用Bootstrap API关闭模态框
                            const instance = bootstrap.Modal.getInstance(existingModal);
                            if (instance) {
                                instance.hide();
                                console.log('已关闭现有模态框');
                            }
                        } catch (e) {
                            console.error('关闭现有模态框时出错', e);
                        }
                    }
                    
                    // 显示该主播的类目销售饼图
                    createAnchorCategoryCharts(anchorName);
                });
            }
        });
    });
    
    console.log('已为所有主播名称添加点击事件');
}

// 显示销售趋势图
function displaySalesTrend(results) {
    console.log("显示销售趋势图...");
    
    // 保存结果以便重绘和查询详情
    window.analysisResults = results;
    console.log(`已保存${results.length}条分析结果到全局变量`);
    
    // 查找图表容器
    const salesTrendChart = document.getElementById('sales-trend-chart');
    if (!salesTrendChart) {
        console.error("找不到销售趋势图容器");
        return;
    }
    
    try {
        // 销售数据按日期分组
        const salesByDate = {};
        
        results.forEach(result => {
            const saleInfo = extractSaleInfo(result.sale);
            const date = extractSaleDate(result.sale);
            
            if (date) {
                if (!salesByDate[date]) {
                    salesByDate[date] = 0;
                }
                
                const price = parseFloat(saleInfo.price) || 0;
                salesByDate[date] += price;
            }
        });
        
        // 转换为图表数据
        const dates = Object.keys(salesByDate).sort();
        const salesData = dates.map(date => salesByDate[date]);
        
        // 如果有已存在的图表，先销毁它
        if (window.salesTrendChartInstance) {
            try {
                window.salesTrendChartInstance.destroy();
            } catch (e) {
                console.error("销毁销售趋势图失败:", e);
            }
        }
        
        // 确保Canvas已准备好
        const ctx = salesTrendChart.getContext('2d');
        if (!ctx) {
            console.error("无法获取销售趋势图的2D上下文");
            return;
        }
        
        // 创建渐变背景
        const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
        gradientFill.addColorStop(0, 'rgba(78, 115, 223, 0.6)');
        gradientFill.addColorStop(1, 'rgba(78, 115, 223, 0)');
        
        // 计算平均销售额
        const avgSales = salesData.reduce((sum, value) => sum + value, 0) / salesData.length;
        
        // 创建图表
        window.salesTrendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: '每日销售额',
                        lineTension: 0.3,
                        backgroundColor: "rgba(78, 115, 223, 0.05)",
                        borderColor: "rgba(78, 115, 223, 1)",
                        pointRadius: 3,
                        pointBackgroundColor: "rgba(78, 115, 223, 1)",
                        pointBorderColor: "rgba(78, 115, 223, 1)",
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
                        pointHoverBorderColor: "rgba(78, 115, 223, 1)",
                        pointHitRadius: 10,
                        pointBorderWidth: 2,
                        fill: true,
                        data: salesData
                    },
                    {
                        label: '平均销售额',
                        lineTension: 0,
                        backgroundColor: "transparent",
                        borderColor: "rgba(246, 194, 62, 0.7)",
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        fill: false,
                        data: salesData.map(() => {
                            const average = salesData.reduce((sum, val) => sum + val, 0) / salesData.length;
                            return average;
                        })
                    }
                ],
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 12,
                                family: "'Segoe UI', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: "rgb(255, 255, 255)",
                        bodyColor: "#858796",
                        titleColor: "#6e707e",
                        titleMarginBottom: 10,
                        borderColor: "#dddfeb",
                        borderWidth: 1,
                        padding: 15,
                        displayColors: false,
                        intersect: false,
                        mode: 'index',
                        caretPadding: 10,
                        callbacks: {
                            label: function(context) {
                                return '销售额: ¥' + context.parsed.y.toLocaleString('zh-CN');
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        gridLines: {
                            color: "rgb(234, 236, 244)",
                            drawBorder: false,
                            zeroLineColor: "rgb(234, 236, 244)",
                        },
                        ticks: {
                            padding: 10,
                            callback: function(value) {
                                return '¥' + value.toLocaleString('zh-CN', {
                                    useGrouping: true,
                                    maximumFractionDigits: 0,
                                }) + '万';
                            }
                        }
                    },
                    x: {
                        gridLines: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            maxTicksLimit: 7
                        }
                    }
                }
            }
        });
        
        // 动态生成销售摘要统计卡片
        const summaryContainer = document.getElementById('sales-summary-container');
        if (summaryContainer) {
            // 计算总销售额
            const totalSales = salesData.reduce((sum, val) => sum + val, 0);
            
            // 计算平均单日销售额
            const averageSales = totalSales / salesData.length;
            
            // 找出销售最高日
            let maxSalesValue = 0;
            let maxSalesDate = '';
            
            salesData.forEach((value, index) => {
                if (value > maxSalesValue) {
                    maxSalesValue = value;
                    maxSalesDate = dates[index];
                }
            });
            
            // 生成HTML
            summaryContainer.innerHTML = `
                <div class="col-md-4">
                    <div class="card bg-light shadow-sm border-0">
                        <div class="card-body text-center py-4">
                            <h6 class="text-primary mb-2">总销售额</h6>
                            <h3 class="mb-0 fw-bold">¥${totalSales.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-light shadow-sm border-0">
                        <div class="card-body text-center py-4">
                            <h6 class="text-primary mb-2">平均单日销售</h6>
                            <h3 class="mb-0 fw-bold">¥${averageSales.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-light shadow-sm border-0">
                        <div class="card-body text-center py-4">
                            <h6 class="text-primary mb-2">销售最高日</h6>
                            <h3 class="mb-0 fw-bold">${maxSalesDate}</h3>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (e) {
        console.error("创建销售趋势图表时出错:", e);
    }
}

// 显示主播业绩图
function displayAnchorPerformance(results) {
    console.log("显示主播业绩图...");
    
    // 查找图表容器
    const anchorChart = document.getElementById('anchor-performance-chart');
    if (!anchorChart) {
        console.error("找不到主播业绩图容器");
        return;
    }
    
    // 按主播分组销售数据
    const anchorSales = {};
    
    results.forEach(result => {
        if (!result.matched || !result.anchor) return;
        
        const anchorName = result.anchor.trim();
        const saleInfo = extractSaleInfo(result.sale);
        const price = parseFloat(saleInfo.price) || 0;
        
        if (!anchorSales[anchorName]) {
            anchorSales[anchorName] = 0;
        }
        
        anchorSales[anchorName] += price;
    });
    
    // 转换为数组并按销售额排序（降序）
    const sortedAnchors = Object.entries(anchorSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // 只取前10名
    
    const anchorNames = sortedAnchors.map(item => item[0]);
    const salesData = sortedAnchors.map(item => item[1]);
    
    // 如果有已存在的图表，先销毁它
    if (window.anchorPerformanceChartInstance) {
        window.anchorPerformanceChartInstance.destroy();
    }
    
    // 创建图表
    const ctx = anchorChart.getContext('2d');
    window.anchorPerformanceChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: anchorNames,
            datasets: [{
                label: '销售额',
                data: salesData,
                backgroundColor: '#1cc88a',
                borderColor: '#17a673',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: '主播销售业绩排行',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let value = context.raw || 0;
                            return `销售额: ¥ ${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '销售金额 (元)'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 10000) {
                                return '¥' + (value / 10000).toFixed(1) + '万';
                            }
                            return '¥' + value;
                        }
                    }
                }
            }
        }
    });
}

// 显示销售时段分布图
function displayHourlySales(results) {
    console.log("显示销售时段分布图...");
    
    // 查找图表容器
    const hourlySalesChart = document.getElementById('hourly-sales-chart');
    if (!hourlySalesChart) {
        console.error("找不到销售时段分布图容器");
        return;
    }
    
    // 按小时统计销售数据
    const hourlySales = {};
    
    // 初始化所有小时的数据
    for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0');
        hourlySales[hour] = 0;
    }
    
    results.forEach(result => {
        const saleInfo = extractSaleInfo(result.sale);
        const saleTime = extractSaleTime(result.sale);
        const price = parseFloat(saleInfo.price) || 0;
        
        if (saleTime) {
            const hour = saleTime.split(':')[0].padStart(2, '0');
            hourlySales[hour] += price;
        }
    });
    
    // 转换为图表数据
    const hours = Object.keys(hourlySales).sort();
    const salesData = hours.map(hour => hourlySales[hour]);
    
    // 格式化小时标签
    const hourLabels = hours.map(hour => `${hour}:00`);
    
    // 如果有已存在的图表，先销毁它
    if (window.hourlySalesChartInstance) {
        window.hourlySalesChartInstance.destroy();
    }
    
    // 创建图表
    const ctx = hourlySalesChart.getContext('2d');
    window.hourlySalesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: hourLabels,
            datasets: [{
                label: '销售额',
                data: salesData,
                backgroundColor: '#36b9cc',
                borderColor: '#2c9faf',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: '24小时销售分布',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let value = context.raw || 0;
                            return `销售额: ¥ ${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '销售金额 (元)'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 10000) {
                                return '¥' + (value / 10000).toFixed(1) + '万';
                            }
                            return '¥' + value;
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '时间段'
                    }
                }
            }
        }
    });
}

// 生成AI分析建议
function generateAISuggestions(results) {
    console.log("生成AI分析建议...");
    
    // 查找显示建议的容器
    const aiSuggestions = document.getElementById('ai-suggestions');
    const overallAnalysis = document.getElementById('overall-analysis');
    const anchorSuggestions = document.getElementById('anchor-suggestions');
    
    if (!aiSuggestions || !overallAnalysis || !anchorSuggestions) {
        console.error("找不到AI建议容器");
        return;
    }
    
    // 清空现有内容
    aiSuggestions.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-3">正在分析销售数据...</p></div>';
    overallAnalysis.innerHTML = '';
    anchorSuggestions.innerHTML = '';
    
    // 模拟AI分析延迟，创造更真实的体验
    setTimeout(() => {
        // 基础统计
        const totalSales = results.reduce((total, result) => {
            const saleInfo = extractSaleInfo(result.sale);
            const price = parseFloat(saleInfo.price) || 0;
            return total + price;
        }, 0);
        
        const matchedCount = results.filter(result => result.matched).length;
        const matchRate = ((matchedCount / results.length) * 100).toFixed(1);
        
        // 按主播统计销售
        const anchorSales = {};
        const anchorProducts = {};
        
        results.forEach(result => {
            if (!result.matched || !result.anchor) return;
            
            const anchorName = result.anchor.trim();
            const saleInfo = extractSaleInfo(result.sale);
            const price = parseFloat(saleInfo.price) || 0;
            const product = saleInfo.product || '';
            
            if (!anchorSales[anchorName]) {
                anchorSales[anchorName] = 0;
                anchorProducts[anchorName] = {};
            }
            
            anchorSales[anchorName] += price;
            
            // 记录产品销售
            if (product) {
                if (!anchorProducts[anchorName][product]) {
                    anchorProducts[anchorName][product] = 0;
                }
                anchorProducts[anchorName][product] += price;
            }
        });
        
        // 销售趋势分析
        const salesByDate = {};
        results.forEach(result => {
            const date = extractSaleDate(result.sale);
            const saleInfo = extractSaleInfo(result.sale);
            const price = parseFloat(saleInfo.price) || 0;
            
            if (date) {
                if (!salesByDate[date]) {
                    salesByDate[date] = 0;
                }
                salesByDate[date] += price;
            }
        });
        
        // 计算日增长率
        const dates = Object.keys(salesByDate).sort();
        const growthRates = [];
        
        for (let i = 1; i < dates.length; i++) {
            const prevSale = salesByDate[dates[i-1]];
            const currSale = salesByDate[dates[i]];
            if (prevSale > 0) {
                const growthRate = ((currSale - prevSale) / prevSale * 100).toFixed(1);
                growthRates.push({
                    date: dates[i],
                    rate: parseFloat(growthRate),
                    sales: currSale
                });
            }
        }
        
        // 查找销售增长最快和最慢的日期
        growthRates.sort((a, b) => b.rate - a.rate);
        const highestGrowth = growthRates.length > 0 ? growthRates[0] : null;
        const lowestGrowth = growthRates.length > 0 ? growthRates[growthRates.length - 1] : null;
        
        // 检测销售趋势
        let trend = "稳定";
        if (growthRates.length >= 3) {
            const recentRates = growthRates.slice(-3);
            const positiveCount = recentRates.filter(item => item.rate > 0).length;
            if (positiveCount >= 2) {
                trend = "上升";
            } else if (positiveCount <= 1) {
                trend = "下降";
            }
        }
        
        // 销售时段分析
        const salesByHour = {};
        
        results.forEach(result => {
            const time = extractSaleTime(result.sale);
            if (!time) return;
            
            const hour = time.split(':')[0];
            const saleInfo = extractSaleInfo(result.sale);
            const price = parseFloat(saleInfo.price) || 0;
            
            if (!salesByHour[hour]) {
                salesByHour[hour] = 0;
            }
            salesByHour[hour] += price;
        });
        
        // 找出销售额最高的时段
        const bestHours = Object.entries(salesByHour)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        // 生成整体分析
        overallAnalysis.innerHTML = `
            <div class="row g-4">
                <div class="col-md-6">
                    <div class="card h-100 border-left-primary shadow-sm">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-4">
                                <div class="icon-circle bg-primary text-white">
                                    <i class="bi bi-graph-up"></i>
                                </div>
                                <h5 class="card-title ms-3 mb-0 fw-bold">销售概况</h5>
                            </div>
                            
                            <div class="row text-center mb-4">
                                <div class="col">
                                    <h6 class="text-muted mb-1">总销售额</h6>
                                    <h3 class="text-primary font-weight-bold">¥${totalSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h3>
                                </div>
                                <div class="col border-start">
                                    <h6 class="text-muted mb-1">订单数</h6>
                                    <h3 class="text-primary font-weight-bold">${results.length}</h3>
                                </div>
                                <div class="col border-start">
                                    <h6 class="text-muted mb-1">匹配率</h6>
                                    <h3 class="text-primary font-weight-bold">${matchRate}%</h3>
                                </div>
                            </div>
                            
                            <div class="alert alert-${trend === "上升" ? "success" : (trend === "下降" ? "warning" : "info")} d-flex align-items-center">
                                <i class="bi bi-${trend === "上升" ? "arrow-up-circle" : (trend === "下降" ? "arrow-down-circle" : "arrow-left-right")}-fill me-2 fs-4"></i>
                                <div>
                                    销售趋势呈<strong>${trend}</strong>态势
                                    ${highestGrowth ? `，${highestGrowth.date}日增长率达${highestGrowth.rate}%` : ''}
                                </div>
                            </div>
                            
                            <h6 class="text-primary mt-4 mb-3"><i class="bi bi-bullseye me-2"></i>销售建议</h6>
                            <ul class="mb-0">
                                <li>根据最近趋势，建议${trend === "上升" ? "维持当前销售策略，持续监控增长" : (trend === "下降" ? "调整产品推广策略，加强营销力度" : "关注产品结构调整，提高客单价")}</li>
                                <li>加强主播排班与销售高峰期的匹配度，优化人力资源配置</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card h-100 border-left-success shadow-sm">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-4">
                                <div class="icon-circle bg-success text-white">
                                    <i class="bi bi-clock"></i>
                                </div>
                                <h5 class="card-title ms-3 mb-0 fw-bold">时段分析</h5>
                            </div>
                            
                            <div class="mb-4">
                                <h6 class="text-muted mb-3">销售黄金时段</h6>
                                <div class="d-flex justify-content-between">
                                    ${bestHours.map((hour, index) => `
                                        <div class="peak-time-box text-center ${index === 0 ? 'peak-time-best' : ''}">
                                            <div class="peak-time-hour">${hour[0]}:00</div>
                                            <div class="peak-time-label">${index === 0 ? '最佳' : '热门'}</div>
                                            <div class="peak-time-sales">¥${hour[1].toFixed(0)}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <h6 class="text-primary mt-4 mb-3"><i class="bi bi-lightning-charge me-2"></i>优化策略</h6>
                            <div class="strategy-list">
                                <div class="strategy-item d-flex mb-3">
                                    <div class="strategy-icon me-3 bg-primary-light">
                                        <i class="bi bi-people"></i>
                                    </div>
                                    <div>
                                        <h6 class="mb-1">主播资源优化</h6>
                                        <p class="mb-0 small">在${bestHours[0][0]}:00-${parseInt(bestHours[0][0])+1}:00安排更多有经验的主播，提高转化率</p>
                                    </div>
                                </div>
                                
                                <div class="strategy-item d-flex mb-3">
                                    <div class="strategy-icon me-3 bg-success-light">
                                        <i class="bi bi-tags"></i>
                                    </div>
                                    <div>
                                        <h6 class="mb-1">促销时间优化</h6>
                                        <p class="mb-0 small">将促销活动集中在${bestHours.map(h => h[0]+':00').join('、')}等时段，最大化曝光效果</p>
                                    </div>
                                </div>
                                
                                <div class="strategy-item d-flex">
                                    <div class="strategy-icon me-3 bg-warning-light">
                                        <i class="bi bi-bar-chart"></i>
                                    </div>
                                    <div>
                                        <h6 class="mb-1">销售数据持续监控</h6>
                                        <p class="mb-0 small">建立销售时段动态监控机制，及时调整人力和资源配置</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .icon-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                }
                
                .border-left-primary {
                    border-left: 4px solid #4e73df;
                }
                
                .border-left-success {
                    border-left: 4px solid #1cc88a;
                }
                
                .peak-time-box {
                    background-color: #f8f9fc;
                    border-radius: 8px;
                    padding: 12px;
                    flex: 1;
                    margin: 0 5px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                
                .peak-time-best {
                    background-color: #edf7f2;
                    border: 1px solid #1cc88a;
                }
                
                .peak-time-hour {
                    font-size: 18px;
                    font-weight: bold;
                    color: #333;
                }
                
                .peak-time-label {
                    font-size: 12px;
                    color: #888;
                    margin: 4px 0;
                }
                
                .peak-time-sales {
                    font-size: 14px;
                    color: #4e73df;
                    font-weight: bold;
                }
                
                .strategy-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .bg-primary-light {
                    background-color: rgba(78, 115, 223, 0.1);
                    color: #4e73df;
                }
                
                .bg-success-light {
                    background-color: rgba(28, 200, 138, 0.1);
                    color: #1cc88a;
                }
                
                .bg-warning-light {
                    background-color: rgba(246, 194, 62, 0.1);
                    color: #f6c23e;
                }
            </style>
        `;
        
        // 生成主播分析建议
        const sortedAnchors = Object.entries(anchorSales)
            .sort((a, b) => b[1] - a[1]);
        
        // 主播表现分析
        let anchorsHtml = '';
        
        sortedAnchors.slice(0, 5).forEach(([anchor, sales], index) => {
            // 获取主播销售最好的产品
            const products = anchorProducts[anchor];
            const topProducts = Object.entries(products)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2);
            
            const productsList = topProducts.map(([product, sales]) => {
                return `<div class="top-product">
                    <span class="badge rounded-pill bg-light text-dark border">${product}</span>
                    <span class="text-primary ms-2">¥${sales.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                </div>`;
            }).join('');
            
            // 检查主播不同品类的销售情况
            let categoryStrength = '';
            let categoryAdvice = '';
            
            if (productCategoryAnalysis && productCategoryAnalysis[anchor]) {
                const categories = productCategoryAnalysis[anchor];
                const sortedCategories = Object.entries(categories)
                    .sort((a, b) => b[1] - a[1]);
                
                if (sortedCategories.length > 0) {
                    const topCategory = sortedCategories[0][0];
                    const secondCategory = sortedCategories.length > 1 ? sortedCategories[1][0] : null;
                    const weakCategory = sortedCategories.length > 2 ? sortedCategories[sortedCategories.length - 1][0] : null;
                    
                    categoryStrength = `在<strong>${topCategory}</strong>类商品销售方面表现突出`;
                    
                    if (weakCategory && sortedCategories[0][1] > sortedCategories[sortedCategories.length - 1][1] * 3) {
                        categoryAdvice = `建议加强<strong>${weakCategory}</strong>类商品的推广能力，平衡各品类销售`;
                    } else if (secondCategory) {
                        categoryAdvice = `建议继续发挥${topCategory}与${secondCategory}的优势，进一步提升销售业绩`;
                    }
                }
            }
            
            anchorsHtml += `
                <div class="col-md-4 mb-4">
                    <div class="card shadow-sm h-100 anchor-card ${index === 0 ? 'anchor-card-top' : ''}">
                        <div class="card-header py-3 d-flex justify-content-between align-items-center">
                            <h6 class="m-0 font-weight-bold text-primary">
                                <i class="bi bi-person-badge me-2"></i>${anchor}
                            </h6>
                            ${index === 0 ? '<span class="badge bg-primary">销售冠军</span>' : ''}
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div class="sales-amount">
                                    <span class="text-xs text-gray-500">总销售额</span>
                                    <h4 class="font-weight-bold text-gray-800 mt-1">¥${sales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h4>
                                </div>
                                <div class="sales-rank text-center">
                                    <span class="text-xs text-gray-500">排名</span>
                                    <h4 class="font-weight-bold text-${index < 3 ? 'primary' : 'gray-800'} mt-1">#${index + 1}</h4>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <h6 class="text-xs text-gray-500 mb-2">畅销商品</h6>
                                ${productsList || '<div class="text-muted small">无销售数据</div>'}
                            </div>
                            
                            <div class="anchor-strength mb-4">
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-award-fill text-warning me-2"></i>
                                    <div>${categoryStrength || '销售数据不足，无法分析产品类别优势'}</div>
                                </div>
                            </div>
                            
                            <div class="anchor-advice">
                                <div class="d-flex align-items-start">
                                    <i class="bi bi-lightbulb-fill text-info me-2 mt-1"></i>
                                    <div>${categoryAdvice || '建议尝试多种产品类别，找到最适合的销售方向'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        anchorSuggestions.innerHTML = `
            <div class="card mb-4">
                <div class="card-header bg-gradient-info text-white py-3">
                    <h3 class="h5 mb-0"><i class="bi bi-people-fill me-2"></i>主播表现分析</h3>
                </div>
                <div class="card-body">
                    <div class="row">
                        ${anchorsHtml}
                    </div>
                </div>
            </div>
            
            <style>
                .anchor-card {
                    transition: all 0.3s ease;
                    border-top: 3px solid #e3e6f0;
                }
                
                .anchor-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                }
                
                .anchor-card-top {
                    border-top: 3px solid #4e73df;
                }
                
                .top-product {
                    display: inline-flex;
                    align-items: center;
                    margin-right: 10px;
                    margin-bottom: 5px;
                }
                
                .bg-gradient-info {
                    background: linear-gradient(to right, #36b9cc, #1cc88a);
                }
            </style>
        `;
        
        // 更新预览区域的内容
        aiSuggestions.innerHTML = `
            <div class="alert alert-primary mb-4">
                <div class="d-flex">
                    <div class="me-3">
                        <i class="bi bi-robot fs-1"></i>
                    </div>
                    <div>
                        <h6 class="alert-heading mb-1">根据销售数据和主播排班匹配分析，我们发现：</h6>
                        <ul class="mb-0">
                            <li>销售高峰时段主要集中在${bestHours.map(h => h[0]+':00').join('、')}点。建议增加该时段的主播数量和优质商品推广。</li>
                            <li>不同主播在各商品类别上表现不同，可根据专长进行更精准的排班和商品分配。</li>
        `;
    });
    
    // 简短总结
    aiSuggestions.innerHTML = `
        <p>根据销售数据和主播排班匹配分析，我们发现：</p>
        <ul>
            <li>销售高峰时段主要集中在中午和下午，建议增加这些时段的主播数量和优质商品推广。</li>
            <li>不同主播在特定商品类别上展现出明显的销售优势，可根据专长进行更精准的排班和商品分配。</li>
            <li>整体销售情况良好，匹配率高，建议持续监控并动态调整排班策略。</li>
        </ul>
        <p>请查看"AI建议"选项卡获取更详细的分析和主播个性化建议。</p>
    `;
}

// 修复模态框ARIA属性问题
function fixModalAriaAttributes() {
    console.log('正在初始化模态框无障碍属性...');
    
    // 获取所有模态框元素
    const modalElements = document.querySelectorAll('.modal');
    if (!modalElements || modalElements.length === 0) {
        console.warn('没有找到模态框元素');
        return;
    }
    
    // 为每个模态框设置正确的ARIA属性和事件处理
    modalElements.forEach(modal => {
        // 先移除可能导致问题的aria-hidden属性
        if (modal.getAttribute('aria-hidden') === 'true') {
            modal.removeAttribute('aria-hidden');
        }
        
        // 获取该模态框的所有关闭按钮
        const closeButtons = modal.querySelectorAll('[data-bs-dismiss="modal"]');
        
        // 移除并重新绑定关闭按钮事件
        closeButtons.forEach(button => {
            // 克隆按钮以移除所有现有事件监听器
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // 给新按钮添加点击事件
            newButton.addEventListener('click', function(event) {
                console.log('模态框关闭按钮被点击');
                
                try {
                    // 尝试使用Bootstrap API关闭模态框
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) {
                        modalInstance.hide();
                    } else {
                        // 如果无法获取实例，使用备用方法关闭
                        modal.classList.remove('show');
                        document.body.classList.remove('modal-open');
                        const backdrops = document.querySelectorAll('.modal-backdrop');
                        backdrops.forEach(backdrop => backdrop.remove());
                    }
                } catch (error) {
                    console.error('关闭模态框失败:', error);
                    
                    // 最后的备用方法：直接设置样式
                    modal.style.display = 'none';
                    document.body.classList.remove('modal-open');
                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    backdrops.forEach(backdrop => backdrop.remove());
                }
            });
        });
        
        // 一个变量来存储模态框打开前的活动元素
        let previouslyFocusedElement = null;
        
        // 设置模态框显示前事件
        const showHandler = function() {
            console.log('模态框将要显示');
            // 存储当前焦点元素
            previouslyFocusedElement = document.activeElement;
            
            // 确保模态框可以正常获得焦点
            modal.removeAttribute('aria-hidden');
            
            // 使模态框中的元素可聚焦
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea');
            focusableElements.forEach(el => {
                if (el.getAttribute('tabindex') === '-1') {
                    el.removeAttribute('tabindex');
                }
            });
        };
        
        // 设置模态框显示后事件
        const shownHandler = function() {
            console.log('模态框已显示');
            // 将焦点设置到第一个可聚焦元素（通常是关闭按钮）
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea');
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 50);
            }
        };
        
        // 设置模态框隐藏前事件
        const hideHandler = function() {
            console.log('模态框将要隐藏');
            // 移除内部元素的焦点
            if (document.activeElement && modal.contains(document.activeElement)) {
                document.activeElement.blur();
            }
        };
        
        // 设置模态框隐藏后事件
        const hiddenHandler = function() {
            console.log('模态框已隐藏');
            
            // 恢复原始焦点
            if (previouslyFocusedElement && document.body.contains(previouslyFocusedElement)) {
                setTimeout(() => {
                    try {
                        previouslyFocusedElement.focus();
                    } catch (e) {
                        console.warn('恢复焦点失败', e);
                    }
                    previouslyFocusedElement = null;
                }, 10);
            }
            
            // 确保饼图实例被销毁
            if (window.anchorCategoryPieChart instanceof Chart) {
                try {
                    window.anchorCategoryPieChart.destroy();
                    window.anchorCategoryPieChart = null;
                } catch (e) {
                    console.warn('销毁图表失败:', e);
                }
            }
            
            // 设置aria-hidden属性
            modal.setAttribute('aria-hidden', 'true');
            
            // 确保模态框完全关闭并清理
            setTimeout(() => {
                if (!modal.classList.contains('show')) {
                    // 移除可能残留的背景
                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    backdrops.forEach(backdrop => backdrop.remove());
                    
                    // 确保body不再有modal-open类
                    if (!document.querySelector('.modal.show')) {
                        document.body.classList.remove('modal-open');
                    }
                }
            }, 150);
        };
        
        // 移除并重新添加事件监听器，避免重复绑定
        ['show.bs.modal', 'shown.bs.modal', 'hide.bs.modal', 'hidden.bs.modal'].forEach(event => {
            // 使用事件冒泡的特性，先移除所有事件，然后添加一个新事件
            modal.removeEventListener(event, modal[`${event.split('.')[0]}Handler`]);
        });
        
        // 存储处理程序引用，以便将来移除
        modal.showHandler = showHandler;
        modal.shownHandler = shownHandler;
        modal.hideHandler = hideHandler;
        modal.hiddenHandler = hiddenHandler;
        
        // 添加新的事件监听器
        modal.addEventListener('show.bs.modal', showHandler);
        modal.addEventListener('shown.bs.modal', shownHandler);
        modal.addEventListener('hide.bs.modal', hideHandler);
        modal.addEventListener('hidden.bs.modal', hiddenHandler);
    });
    
    console.log('模态框无障碍属性初始化完成');
}

// 创建订单详情分页控件
function createDetailPagination(categoryId, pagination) {
    const paginationContainer = document.getElementById(`${categoryId}-pagination-controls`);
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = `
        <div class="btn-group">
            <button id="${categoryId}-first-page" class="btn btn-sm btn-outline-primary" ${pagination.currentPage <= 1 ? 'disabled' : ''}>
                <i class="bi bi-chevron-double-left"></i>
            </button>
            <button id="${categoryId}-prev-page" class="btn btn-sm btn-outline-primary" ${pagination.currentPage <= 1 ? 'disabled' : ''}>
                <i class="bi bi-chevron-left"></i>
            </button>
            <button id="${categoryId}-page-info" class="btn btn-sm btn-outline-secondary" disabled>
                第 ${pagination.currentPage} 页，共 ${pagination.totalPages} 页
            </button>
            <button id="${categoryId}-next-page" class="btn btn-sm btn-outline-primary" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>
                <i class="bi bi-chevron-right"></i>
            </button>
            <button id="${categoryId}-last-page" class="btn btn-sm btn-outline-primary" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>
                <i class="bi bi-chevron-double-right"></i>
            </button>
        </div>
        <div class="ms-2 d-flex align-items-center">
            <div class="input-group input-group-sm" style="width: 120px;">
                <input type="number" id="${categoryId}-page-input" class="form-control form-control-sm" min="1" max="${pagination.totalPages}" value="${pagination.currentPage}">
                <button id="${categoryId}-page-jump" class="btn btn-outline-primary">跳转</button>
            </div>
        </div>
    `;
    
    // 更新分页信息
    const paginationInfo = document.getElementById(`${categoryId}-pagination-info`);
    if (paginationInfo) {
        const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
        const end = Math.min(start + pagination.itemsPerPage - 1, pagination.totalItems);
        paginationInfo.textContent = `显示 ${start} - ${end} 条，共 ${pagination.totalItems} 条订单`;
    }
    
    // 添加分页按钮事件
    document.getElementById(`${categoryId}-first-page`).addEventListener('click', function() {
        if (pagination.currentPage > 1) {
            pagination.currentPage = 1;
            updateDetailPagination(categoryId, pagination);
        }
    });
    
    document.getElementById(`${categoryId}-prev-page`).addEventListener('click', function() {
        if (pagination.currentPage > 1) {
            pagination.currentPage--;
            updateDetailPagination(categoryId, pagination);
        }
    });
    
    document.getElementById(`${categoryId}-next-page`).addEventListener('click', function() {
        if (pagination.currentPage < pagination.totalPages) {
            pagination.currentPage++;
            updateDetailPagination(categoryId, pagination);
        }
    });
    
    document.getElementById(`${categoryId}-last-page`).addEventListener('click', function() {
        if (pagination.currentPage < pagination.totalPages) {
            pagination.currentPage = pagination.totalPages;
            updateDetailPagination(categoryId, pagination);
        }
    });
    
    document.getElementById(`${categoryId}-page-jump`).addEventListener('click', function() {
        const input = document.getElementById(`${categoryId}-page-input`);
        let page = parseInt(input.value);
        if (!isNaN(page) && page >= 1 && page <= pagination.totalPages) {
            pagination.currentPage = page;
            updateDetailPagination(categoryId, pagination);
        } else {
            input.value = pagination.currentPage;
            showNotice('warning', '请输入有效的页码');
        }
    });
    
    document.getElementById(`${categoryId}-page-input`).addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const input = document.getElementById(`${categoryId}-page-input`);
            let page = parseInt(input.value);
            if (!isNaN(page) && page >= 1 && page <= pagination.totalPages) {
                pagination.currentPage = page;
                updateDetailPagination(categoryId, pagination);
            } else {
                input.value = pagination.currentPage;
                showNotice('warning', '请输入有效的页码');
            }
        }
    });
}

// 更新订单详情分页
function updateDetailPagination(categoryId, pagination) {
    // 更新分页按钮状态
    document.getElementById(`${categoryId}-first-page`).disabled = pagination.currentPage <= 1;
    document.getElementById(`${categoryId}-prev-page`).disabled = pagination.currentPage <= 1;
    document.getElementById(`${categoryId}-next-page`).disabled = pagination.currentPage >= pagination.totalPages;
    document.getElementById(`${categoryId}-last-page`).disabled = pagination.currentPage >= pagination.totalPages;
    
    // 更新页码信息
    document.getElementById(`${categoryId}-page-info`).textContent = `第 ${pagination.currentPage} 页，共 ${pagination.totalPages} 页`;
    document.getElementById(`${categoryId}-page-input`).value = pagination.currentPage;
    
    // 更新分页信息文本
    const paginationInfo = document.getElementById(`${categoryId}-pagination-info`);
    if (paginationInfo) {
        const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
        const end = Math.min(start + pagination.itemsPerPage - 1, pagination.totalItems);
        paginationInfo.textContent = `显示 ${start} - ${end} 条，共 ${pagination.totalItems} 条订单`;
    }
    
    // 重新获取类别映射回实际类别
    const categoryMap = {
        'wang': '旺玥',
        'yuan': '源悦', 
        'chun': '莼悦',
        'royal': '皇家'
    };
    const category = categoryMap[categoryId] || categoryId;
    
    // 获取当前主播名称
    const modalTitle = document.querySelector('#anchor-details-modal .modal-title');
    let anchorName = '';
    if (modalTitle) {
        // 从标题中提取主播名称（格式: "主播名称 订单明细"）
        anchorName = modalTitle.textContent.split(' ')[0];
    }
    
    if (!anchorName) {
        console.error('无法获取主播名称');
        return;
    }
    
    console.log(`正在查询${anchorName}的${category}类订单...`);
    
    // 从全局匹配结果中筛选正确的订单
    const orders = window.analysisResults.filter(result => {
        if (!result.anchor) return false;
        
        // 检查是否为当前主播的订单
        const isCurrentAnchor = (typeof result.anchor === 'string') 
            ? result.anchor.trim() === anchorName
            : (result.anchor.name && result.anchor.name === anchorName);
        if (!isCurrentAnchor) return false;
        
        // 检查订单商品是否属于当前类别
        const saleInfo = extractSaleInfo(result.sale);
        const productName = saleInfo.product || '';
        return productName.includes(category);
    });
    
    console.log(`找到${orders.length}条${category}类订单记录`);
    
    // 显示当前页的订单
    displayOrdersForCategory(categoryId, orders, pagination.currentPage, pagination.itemsPerPage);
}

// 显示订单详情页
function displayDetailPage(categoryId, orders, page, itemsPerPage) {
    // 这个函数已被替换为 displayOrdersForCategory
    // 为了保持兼容性，调用新函数
    displayOrdersForCategory(categoryId, orders, page, itemsPerPage);
}

// 导出主播订单明细
function exportAnchorDetails(anchorName, ordersByCategory) {
    try {
        // 准备CSV内容
        let csvContent = `主播名称,商品类别,商品名称,规格,数量,订单金额,订单时间\n`;
        
        // 添加订单数据
        for (const category in ordersByCategory) {
            if (ordersByCategory[category] && ordersByCategory[category].length > 0) {
                ordersByCategory[category].forEach(order => {
                    const saleInfo = extractSaleInfo(order.sale);
                    
                    // 处理CSV字段中的逗号（用双引号包围）
                    const productName = saleInfo.product ? `"${saleInfo.product.replace(/"/g, '""')}"` : '-';
                    const spec = saleInfo.spec ? `"${saleInfo.spec.replace(/"/g, '""')}"` : '-';
                    
                    csvContent += `${anchorName},${category},${productName},${spec},${saleInfo.quantity || 0},${parseFloat(saleInfo.price) || 0},${saleInfo.time || '-'}\n`;
                });
            }
        }
        
        // 创建Blob对象
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${anchorName}-订单明细-${new Date().toLocaleDateString('zh-CN')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 显示提示
        showNotice('success', '订单明细导出成功！');
    } catch (error) {
        console.error('导出订单明细时出错:', error);
        showNotice('danger', '导出订单明细失败，请重试');
    }
}

// 显示指定类别的订单（首次加载使用）
function displayOrdersForCategory(categoryId, orders, page, itemsPerPage) {
    const tableBody = document.getElementById(`${categoryId}-orders-table`);
    if (!tableBody) return;
    
    // 清空当前表格内容
    tableBody.innerHTML = '';
    
    // 计算当前页的订单
    const start = (page - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, orders.length);
    const pageOrders = orders.slice(start, end);
    
    // 添加订单到表格
    pageOrders.forEach(order => {
        const saleInfo = extractSaleInfo(order.sale);
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${saleInfo.product || '-'}</td>
            <td>${saleInfo.spec || '-'}</td>
            <td class="text-center">${saleInfo.quantity || '-'}</td>
            <td class="text-end">¥${(parseFloat(saleInfo.price) || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td>${saleInfo.time || '-'}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 如果没有订单，显示无数据提示
    if (pageOrders.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" class="text-center">没有找到订单数据</td>`;
        tableBody.appendChild(row);
    }
    
    // 更新分页信息
    const paginationInfo = document.getElementById(`${categoryId}-pagination-info`);
    if (paginationInfo) {
        const start = (page - 1) * itemsPerPage + 1;
        const end = Math.min(start + itemsPerPage - 1, orders.length);
        paginationInfo.textContent = `显示 ${start} - ${end} 条，共 ${orders.length} 条订单`;
    }
}

// 动态创建主播订单详情模态框
function createAnchorDetailsModal(anchorName, ordersByCategory) {
    // 如果已经存在模态框，先删除
    const existingModal = document.getElementById('anchor-details-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // 为保持分组的可见性，使用一个常量存储类目顺序
    const CATEGORY_ORDER = ['旺玥', '源悦', '莼悦', '皇家'];
    
    // 创建详情弹窗内容
    let detailsHTML = `
        <div class="modal fade" id="anchor-details-modal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">${anchorName} 订单明细</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <ul class="nav nav-tabs" id="categoryTabs" role="tablist">`;
    
    // 创建标签页
    let firstCategory = true;
    // 使用CATEGORY_ORDER确保按照指定顺序显示标签页
    CATEGORY_ORDER.forEach(category => {
        if (ordersByCategory[category] && ordersByCategory[category].length > 0) {
            // 使用固定的categoryId映射
            const categoryIdMap = {
                '旺玥': 'wang',
                '源悦': 'yuan',
                '莼悦': 'chun',
                '皇家': 'royal'
            };
            const categoryId = categoryIdMap[category] || category.toLowerCase();
            
            detailsHTML += `
                <li class="nav-item" role="presentation">
                    <button class="nav-link ${firstCategory ? 'active' : ''}" 
                        id="${categoryId}-tab" 
                        data-bs-toggle="tab" 
                        data-bs-target="#${categoryId}-content" 
                        type="button" role="tab"
                        aria-controls="${categoryId}-content"
                        aria-selected="${firstCategory ? 'true' : 'false'}">
                        ${category}类 (${ordersByCategory[category].length})
                    </button>
                </li>`;
            firstCategory = false;
        }
    });
    
    detailsHTML += `
                        </ul>
                        <div class="tab-content mt-3" id="categoryTabsContent">`;
    
    // 创建每个类别的内容
    firstCategory = true;
    for (const category of CATEGORY_ORDER) {
        if (ordersByCategory[category] && ordersByCategory[category].length > 0) {
            // 使用固定的categoryId映射
            const categoryIdMap = {
                '旺玥': 'wang',
                '源悦': 'yuan',
                '莼悦': 'chun',
                '皇家': 'royal'
            };
            const categoryId = categoryIdMap[category] || category.toLowerCase();
            
            detailsHTML += `
                <div class="tab-pane fade ${firstCategory ? 'show active' : ''}" 
                    id="${categoryId}-content" 
                    role="tabpanel" 
                    aria-labelledby="${categoryId}-tab">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>商品名称</th>
                                    <th>规格</th>
                                    <th>数量</th>
                                    <th>金额</th>
                                    <th>订单时间</th>
                                </tr>
                            </thead>
                            <tbody id="${categoryId}-orders-table">
                                <!-- 订单数据将通过JS动态生成 -->
                            </tbody>
                            <tfoot>
                                <tr class="table-active">
                                    <td colspan="3" class="text-end fw-bold">类别合计：</td>
                                    <td class="text-end fw-bold" id="${categoryId}-total">¥0.00</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-4">
                        <div class="pagination-info text-muted small" id="${categoryId}-pagination-info">
                            <!-- 分页信息 -->
                        </div>
                        <div class="pagination-controls" id="${categoryId}-pagination-controls">
                            <!-- 分页控件 -->
                        </div>
                    </div>
                </div>`;
            
            firstCategory = false;
        }
    }
    
    detailsHTML += `
                        </div>
                    </div>
                    <div class="modal-footer">
                        <div class="row w-100">
                            <div class="col-md-6 mb-2 mb-md-0">
                                <button type="button" id="export-detail-data" class="btn btn-primary w-100">
                                    <i class="bi bi-download me-1"></i>导出订单明细
                                </button>
                            </div>
                            <div class="col-md-6">
                                <button type="button" class="btn btn-secondary w-100" data-bs-dismiss="modal">
                                    <i class="bi bi-x-circle me-1"></i>关闭
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    
// 全局变量声明
let salesData = null;  // 存储销售数据 
let scheduleData = null;  // 存储主播排班数据
let matchedResults = null;  // 存储匹配结果
let currentPage = 1;  // 当前页码
let itemsPerPage = 10;  // 每页显示条数
let availableScheduleDates = [];  // 可用的排班日期
let analysisResults = [];  // 分析结果
let productCategoryAnalysis = {}; // 存储商品分类分析结果

// DOM 元素
const salesFileInput = document.getElementById('sales-file');
const scheduleFileInput = document.getElementById('schedule-file');
const analyzeBtn = document.getElementById('analyze-btn');
const clearBtn = document.getElementById('clear-btn');
const exportBtn = document.getElementById('export-btn');
const resultsSection = document.getElementById('results-section');

// =============== 文件上传处理 ===============

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，初始化文件上传功能...');
    
    // 初始化拖放区域
    initializeDropZones();
    
    // 修复模态框ARIA属性问题
    fixModalAriaAttributes();
    
    // 为文件输入框元素添加事件监听
    if (salesFileInput) {
        salesFileInput.addEventListener('change', handleFileSelect);
        console.log('已为销售数据文件输入框添加事件监听器');
    } else {
        console.error('未找到销售数据文件输入框元素');
    }
    
    if (scheduleFileInput) {
        scheduleFileInput.addEventListener('change', handleFileSelect);
        console.log('已为排班表文件输入框添加事件监听器');
    } else {
        console.error('未找到排班表文件输入框元素');
    }
    
    // 绑定按钮事件
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', startAnalysis);
        console.log('已为分析按钮添加事件监听器');
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearData);
        console.log('已为清除按钮添加事件监听器');
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportResults);
        console.log('已为导出按钮添加事件监听器');
    }
});

// 初始化拖放区域和文件选择按钮
function initializeDropZones() {
    console.log("正在初始化文件上传区域...");
    
    // 拖放区域
    const dropZones = document.querySelectorAll('.upload-area');
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const selectButtons = document.querySelectorAll('label[for^="sales-file"], label[for^="schedule-file"]');
    
    let initialized = 0;
    
    // 初始化每个拖放区域
    dropZones.forEach((dropZone, index) => {
        const fileType = dropZone.getAttribute('data-type');
        const fileInput = document.getElementById(`${fileType}-file`);
        const statusElement = document.getElementById(`${fileType}-status`);
        const fileTypeLabel = fileType === 'sales' ? '销售数据' : '主播排班表';
        
        if (!dropZone || !fileInput) {
            console.error(`无法找到拖放区域或文件输入 (${fileType})`);
            return;
        }
        
        initialized++;
        
        // 添加文件输入变更事件
        fileInput.addEventListener('change', function(e) {
            console.log(`${fileTypeLabel}文件输入变更事件触发，文件数量: ${this.files.length}`);
            if (this.files.length > 0) {
                const file = this.files[0];
                console.log(`已选择${fileTypeLabel}文件: ${file.name}`);
                processUploadedFile(file, fileType);
            }
        });
        
        // 拖放事件
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('drag-over');
            
            console.log(`文件被拖放到${fileTypeLabel}区域`);
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                console.log(`拖放的文件: ${file.name}`);
                processUploadedFile(file, fileType);
            }
        });
        
        console.log(`已初始化拖放区域 (${fileTypeLabel})`);
    });
    
    console.log(`完成初始化 ${initialized} 个拖放区域`);
    
    // 添加清除按钮事件
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            console.log("清除按钮被点击");
            resetFileInputs();
        });
    }
    
    // 添加开始分析按钮事件
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function() {
            console.log("开始分析按钮被点击");
            startAnalysis();
        });
    }
}

// 处理拖放区域的拖动悬停
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.add('dragover');
}

// 处理拖放区域的拖动离开
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('dragover');
}

// 处理文件拖放
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        console.log(`拖放文件: ${file.name}`);
        
        // 确定文件信息容器
        const type = this.dataset.type;
        if (!type) {
            console.error('未找到上传区域类型标记');
            return;
        }
        
        console.log(`文件类型: ${type}, 区域ID: ${this.id}, 数据属性:`, this.dataset);
        
        const fileInfoId = type === 'sales' ? 'sales-file-info' : 'schedule-file-info';
        const fileInfo = document.getElementById(fileInfoId);
        
        if (fileInfo) {
            console.log(`找到文件信息容器: #${fileInfoId}`);
            // 找到文件详情元素
            const fileDetails = fileInfo.querySelector('.file-details');
            const fileNameElem = fileInfo.querySelector('.file-name');
            const fileSizeElem = fileInfo.querySelector('.file-size');
            
            console.log(`文件详情元素: ${fileDetails ? '找到' : '未找到'}`);
            console.log(`文件名元素: ${fileNameElem ? '找到' : '未找到'}`);
            console.log(`文件大小元素: ${fileSizeElem ? '找到' : '未找到'}`);
            
            // 更新文件信息显示
            if (fileNameElem) fileNameElem.textContent = file.name;
            if (fileSizeElem) fileSizeElem.textContent = formatFileSize(file.size);
            
            // 显示文件详情区域
            if (fileDetails) fileDetails.classList.remove('d-none');
        } else {
            console.error(`未找到文件信息容器: #${fileInfoId}`);
        }
        
        // 检查是否是Excel文件
        const isExcel = /\.(xlsx|xls)$/i.test(file.name);
        console.log(`文件是否为Excel: ${isExcel}`);
        
        // 更新状态显示
        const statusId = this.dataset.status;
        console.log(`状态ID: ${statusId}`);
        
        if (isExcel) {
            processUploadedFile(file, type);
        } else {
            document.getElementById(statusId).innerHTML = 
                `<div class="alert alert-danger">请上传Excel文件 (.xlsx 或 .xls)</div>`;
        }
    } else {
        console.warn('没有接收到文件');
    }
}

// 处理文件选择
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        const file = files[0];
        console.log(`选择的文件: ${file.name}`);
        
        // 找到关联的上传区域
        const inputId = e.target.id;
        const type = inputId === 'sales-file' ? 'sales' : 'schedule';
        
        console.log(`输入框ID: ${inputId}, 文件类型: ${type}`);
        
        // 获取文件信息容器
        const fileInfoId = type === 'sales' ? 'sales-file-info' : 'schedule-file-info';
        const fileInfo = document.getElementById(fileInfoId);
        
        if (fileInfo) {
            console.log(`找到文件信息容器: #${fileInfoId}`);
            // 找到文件详情元素
            const fileDetails = fileInfo.querySelector('.file-details');
            const fileNameElem = fileInfo.querySelector('.file-name');
            const fileSizeElem = fileInfo.querySelector('.file-size');
            
            console.log(`文件详情元素: ${fileDetails ? '找到' : '未找到'}`);
            console.log(`文件名元素: ${fileNameElem ? '找到' : '未找到'}`);
            console.log(`文件大小元素: ${fileSizeElem ? '找到' : '未找到'}`);
            
            // 更新文件信息显示
            if (fileNameElem) fileNameElem.textContent = file.name;
            if (fileSizeElem) fileSizeElem.textContent = formatFileSize(file.size);
            
            // 显示文件详情区域
            if (fileDetails) fileDetails.classList.remove('d-none');
        } else {
            console.error(`未找到文件信息容器: #${fileInfoId}`);
        }
        
        // 检查是否是Excel文件
        const isExcel = /\.(xlsx|xls)$/i.test(file.name);
        console.log(`文件是否为Excel: ${isExcel}`);
        
        // 更新状态显示
        const statusId = type === 'sales' ? 'sales-status' : 'schedule-status';
        console.log(`状态ID: ${statusId}`);
        
        if (isExcel) {
            processUploadedFile(file, type);
        } else {
            document.getElementById(statusId).innerHTML = 
                `<div class="alert alert-danger">请上传Excel文件 (.xlsx 或 .xls)</div>`;
        }
    } else {
        console.warn('没有选择文件');
    }
}

// 处理上传的文件
function processUploadedFile(file, type) {
    if (!file) {
        console.error('没有文件可处理');
        return;
    }
    
    console.log(`开始处理${type === 'sales' ? '销售' : '排班表'}文件:`, file.name);
    
    const statusId = type === 'sales' ? 'sales-status' : 'schedule-status';
    document.getElementById(statusId).innerHTML = 
        `<div class="alert alert-info">正在处理${type === 'sales' ? '销售' : '排班表'}文件...</div>`;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            console.log(`正在解析${type === 'sales' ? '销售' : '排班表'}Excel文件...`);
            const data = parseExcel(e.target.result);
            
            if (data && data.length > 0) {
                if (type === 'sales') {
                    salesData = parseSalesData(data);
                    document.getElementById(statusId).innerHTML = 
                        `<div class="alert alert-success">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-check-circle-fill text-success me-2 fs-4"></i>
                                <div>
                                    <div class="fw-bold">已上传销售数据</div>
                                    <div class="small">共${salesData.length}条记录</div>
                                </div>
                            </div>
                        </div>`;
                    console.log('销售数据加载成功', salesData.length);
                } else {
                    // 处理排班表数据
                    scheduleData = data;
                    document.getElementById(statusId).innerHTML = 
                        `<div class="alert alert-success">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-check-circle-fill text-success me-2 fs-4"></i>
                                <div>
                                    <div class="fw-bold">已上传排班表数据</div>
                                    <div class="small">共${data.length}行</div>
                                </div>
                            </div>
                        </div>`;
                    console.log('排班表数据加载成功', data.length);
                }
                
                // 检查是否可以启用分析按钮
                checkAnalyzeReady();
            } else {
                document.getElementById(statusId).innerHTML = 
                    `<div class="alert alert-danger">${type === 'sales' ? '销售' : '排班表'}数据无效或为空</div>`;
                console.error(`${type === 'sales' ? '销售' : '排班表'}数据无效或为空`);
            }
        } catch (error) {
            console.error(`解析${type === 'sales' ? '销售' : '排班表'}数据出错:`, error);
            document.getElementById(statusId).innerHTML = 
                `<div class="alert alert-danger">解析文件出错: ${error.message}</div>`;
        }
    };
    
    reader.onerror = function(error) {
        console.error(`读取${type === 'sales' ? '销售' : '排班表'}文件失败:`, error);
        document.getElementById(statusId).innerHTML = 
            `<div class="alert alert-danger">读取文件失败</div>`;
    };
    
    // 开始读取文件
    reader.readAsArrayBuffer(file);
}

// 检查是否可以启用分析按钮
function checkAnalyzeReady() {
    if (scheduleData && salesData) {
        console.log('两种数据都已成功加载，启用分析按钮');
        console.log(`排班表数据: ${scheduleData.length}条记录`);
        console.log(`销售数据: ${salesData.length}条记录`);
        
        analyzeBtn.disabled = false;
        
        // 添加一个临时提示
        const noticeHtml = `
            <div class="alert alert-success text-center">
                <i class="bi bi-check-circle-fill me-2"></i>
                <strong>所有数据已就绪</strong>，可以点击"开始分析"按钮进行匹配分析
            </div>
        `;
        
        // 查找并更新提示区域
        const noticeArea = document.getElementById('notice-area');
        if (noticeArea) {
            noticeArea.innerHTML = noticeHtml;
        }
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 解析Excel文件
function parseExcel(data) {
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // 移除空行
    const filteredData = jsonData.filter(row => {
        return row.length > 0 && !row.every(cell => cell === null || cell === undefined || cell === '');
    });
    
    return filteredData;
}

// 解析销售数据
function parseSalesData(data) {
    // 简单实现，后续可以根据具体格式进行调整
    const headers = data[0];
    const result = [];
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row.length > 0) {
            const item = {};
            headers.forEach((header, index) => {
                if (index < row.length) {
                    item[header] = row[index];
                }
            });
            result.push(item);
        }
    }
    
    return result;
}

// 提取时间段（支持多种格式）
function extractTimeSlot(str) {
    if (!str || typeof str !== 'string') {
        console.log(`无效的时间段输入: ${str}`);
        return null;
    }
    
    // 规范化时间字符串：替换全角冒号和不同类型的连字符
    let normalizedStr = str.replace(/：/g, ':')  // 替换中文冒号
                          .replace(/[－—\-~～]/g, '-')  // 统一各种连字符
                          .replace(/\s+/g, ''); // 去除空格
    
    console.log(`尝试解析时间段: "${str}" -> "${normalizedStr}"`);
    
    let timeSlot = null;
    
    // 尝试匹配标准的时间段格式（如 08:00-10:00）
    const stdMatch = normalizedStr.match(/(\d{1,2}):(\d{1,2})-(\d{1,2}):(\d{1,2})/);
    if (stdMatch) {
        const startHour = stdMatch[1].padStart(2, '0');
        const startMin = stdMatch[2].padStart(2, '0');
        const endHour = stdMatch[3].padStart(2, '0');
        const endMin = stdMatch[4].padStart(2, '0');
        timeSlot = `${startHour}:${startMin}-${endHour}:${endMin}`;
        console.log(`  匹配标准时间段格式: ${timeSlot}`);
    } else {
        // 尝试匹配带"到"字符的时间段（如 08:00到10:00）
        const withDaoMatch = normalizedStr.match(/(\d{1,2}):(\d{1,2})到(\d{1,2}):(\d{1,2})/);
        if (withDaoMatch) {
            const startHour = withDaoMatch[1].padStart(2, '0');
            const startMin = withDaoMatch[2].padStart(2, '0');
            const endHour = withDaoMatch[3].padStart(2, '0');
            const endMin = withDaoMatch[4].padStart(2, '0');
            timeSlot = `${startHour}:${startMin}-${endHour}:${endMin}`;
            console.log(`  匹配带"到"的时间段: ${timeSlot}`);
        } 
        // 尝试匹配"点"格式（如 8点-10点）
        else {
            const withDianMatch = normalizedStr.match(/(\d{1,2})点(?:(\d{1,2})分)?-(\d{1,2})点(?:(\d{1,2})分)?/);
            if (withDianMatch) {
                const startHour = withDianMatch[1].padStart(2, '0');
                const startMin = withDianMatch[2] ? withDianMatch[2].padStart(2, '0') : '00';
                const endHour = withDianMatch[3].padStart(2, '0');
                const endMin = withDianMatch[4] ? withDianMatch[4].padStart(2, '0') : '00';
                timeSlot = `${startHour}:${startMin}-${endHour}:${endMin}`;
                console.log(`  匹配"点"格式时间段: ${timeSlot}`);
            } 
            // 尝试匹配简单的小时段（如8-10，默认补全为8:00-10:00）
            else {
                const hourOnlyMatch = normalizedStr.match(/^(\d{1,2})-(\d{1,2})$/);
                if (hourOnlyMatch) {
                    const startHour = hourOnlyMatch[1].padStart(2, '0');
                    const endHour = hourOnlyMatch[2].padStart(2, '0');
                    timeSlot = `${startHour}:00-${endHour}:00`;
                    console.log(`  匹配简单小时段: ${timeSlot}`);
                }
                // 尝试匹配单个时段（如8:00-12:00）
                else if (normalizedStr.match(/(\d{1,2})[点:](\d{1,2})?-(\d{1,2})[点:](\d{1,2})?/)) {
                    const timeMatch = normalizedStr.match(/(\d{1,2})[点:](\d{1,2})?-(\d{1,2})[点:](\d{1,2})?/);
                    if (timeMatch) {
                        const startHour = timeMatch[1].padStart(2, '0');
                        const startMin = timeMatch[2] ? timeMatch[2].padStart(2, '0') : '00';
                        const endHour = timeMatch[3].padStart(2, '0');
                        const endMin = timeMatch[4] ? timeMatch[4].padStart(2, '0') : '00';
                        timeSlot = `${startHour}:${startMin}-${endHour}:${endMin}`;
                        console.log(`  匹配混合时间段格式: ${timeSlot}`);
                    }
                }
                // 找出表格中的特殊时间段格式（例如"早场"、"晚场"）
                else if (normalizedStr.includes('早') || normalizedStr.includes('上午')) {
                    timeSlot = '08:00-12:00';
                    console.log(`  匹配"早场/上午"时间段: ${timeSlot}`);
                }
                else if (normalizedStr.includes('午') || normalizedStr.includes('中午')) {
                    timeSlot = '12:00-16:00';
                    console.log(`  匹配"午场/中午"时间段: ${timeSlot}`);
                }
                else if (normalizedStr.includes('晚') || normalizedStr.includes('下午') || normalizedStr.includes('夜')) {
                    timeSlot = '16:00-23:59';
                    console.log(`  匹配"晚场/下午/夜场"时间段: ${timeSlot}`);
                }
                // 尝试特定的时间关键词
                else if (normalizedStr.includes('全天') || normalizedStr.includes('全部')) {
                    timeSlot = '00:00-23:59';
                    console.log(`  匹配"全天"时间段: ${timeSlot}`);
                }
            }
        }
    }
    
    if (!timeSlot) {
        console.log(`  无法匹配任何时间段格式: "${str}"`);
    }
    
    return timeSlot;
}

// 标准化时间段格式
function standardizeTimeSlot(timeStr) {
    if (!timeStr) return null;
    
    // 尝试使用提取函数获取标准格式
    const result = extractTimeSlot(timeStr);
    if (result) {
        // 确保时间格式的一致性
        const [startTime, endTime] = result.split('-');
        const [startHour, startMin] = startTime.split(':');
        const [endHour, endMin] = endTime.split(':');
        
        // 规范化为HH:MM-HH:MM格式
        return `${startHour.padStart(2, '0')}:${startMin.padStart(2, '0')}-${endHour.padStart(2, '0')}:${endMin.padStart(2, '0')}`;
    }
    return result;
}

// 开始分析
function startAnalysis() {
    console.log("开始分析...");
    
    // 显示加载提示
    showLoading("正在分析数据...");
    
    // 使用requestAnimationFrame代替setTimeout，性能更好
    requestAnimationFrame(() => {
        try {
            // 处理主播排班数据
            const scheduleMap = processScheduleData(scheduleData);
            console.log("主播排班数据处理完成:", scheduleMap);
            
            // 规范化销售数据
            const normalizedSales = normalizeSalesData(salesData);
            console.log(`销售数据规范化完成，共 ${normalizedSales.length} 条记录`);
            
            // 匹配销售数据与主播排班
            matchedResults = matchSalesWithSchedule(normalizedSales, scheduleMap);
            console.log(`匹配完成，结果数量: ${matchedResults.length}`);
            
            // 显示结果
            displayResults(matchedResults);
            
            // 隐藏加载提示
            hideLoading();
            
            // 显示成功消息
            showNotice("success", `分析完成！共处理 ${normalizedSales.length} 条销售记录，成功匹配 ${matchedResults.filter(r => r.matched).length} 条。`);
        } catch (error) {
            console.error("分析过程中发生错误:", error);
            hideLoading();
            showNotice("danger", `分析失败: ${error.message || "未知错误"}`);
        }
    });
}

// 处理表格数据，获取主播排期信息
function processScheduleData(data) {
    console.log('开始处理排期数据');
    console.log('原始数据展示（前10行）：', data.slice(0, 10));

    // 检查数据是否有效
    if (!data || !data.length || data.length < 2) {
        console.error('排期数据无效或行数不足');
        return null;
    }

    // 创建排班映射表
    const scheduleMap = {};
    
    // 当前处理的日期和档位信息
    let currentDate = '';
    let tierInfo = '';
    
    // 遍历每一行数据
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        const row = data[rowIndex];
        if (!row || row.length < 2) {
            console.log(`第 ${rowIndex+1} 行数据不完整，跳过`);
            continue;
        }
        
        const firstCell = String(row[0] || '').trim();
        const secondCell = String(row[1] || '').trim();
        
        // 检查是否是日期行（通常包含"号"字或日期格式）
        const isDateRow = firstCell.includes('号') || firstCell.includes('日') || firstCell.match(/\d+月\d+/) || 
                         /\d{1,2}[-\/]\d{1,2}/.test(firstCell) || /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(firstCell);
                        
        if (isDateRow) {
            // 提取日期
            let dateString = '';
            if (firstCell.includes('月') && (firstCell.includes('日') || firstCell.includes('号'))) {
                const parts = firstCell.match(/(\d+)月(\d+)[号日]/);
                if (parts) {
                    currentDate = `${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                    dateString = firstCell;
                }
            } else if (firstCell.includes('/') || firstCell.includes('-')) {
                // 处理MM-DD或YYYY-MM-DD格式
                const parts = firstCell.split(/[-\/]/);
                if (parts.length === 2) {
                    currentDate = `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                    dateString = firstCell;
                } else if (parts.length >= 3) {
                    currentDate = `${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                    dateString = firstCell;
                }
            } else {
                // 尝试其他可能的日期格式
                const dateMatch = firstCell.match(/(\d+月\d+[号日])|(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})|(\d{1,2}[-\/]\d{1,2})/);
                if (dateMatch) {
                    dateString = dateMatch[0];
                }
            }
            
            if (currentDate) {
                console.log(`找到日期行: ${dateString} -> "${currentDate}"`);
                
                // 初始化该日期的映射表
                scheduleMap[currentDate] = {};
                
                // 提取档位信息（日期行第二列）
                tierInfo = secondCell || '';
                console.log(`档位信息: ${tierInfo}`);
            } else {
                console.log(`第 ${rowIndex+1} 行似乎是日期行，但无法提取有效日期: "${firstCell}"`);
            }
            
            continue; // 跳过日期行，处理下一行
        }
        
        // 如果尚未找到有效日期，跳过
        if (!currentDate || !scheduleMap[currentDate]) {
            console.log(`第 ${rowIndex+1} 行没有关联的日期，跳过`);
            continue;
        }
        
        // 处理主播和时间段
        const anchorName = firstCell;
        const timeSlotText = secondCell;
        
        if (!anchorName) {
            console.log(`第 ${rowIndex+1} 行无主播名称，跳过`);
            continue;
        }
        
        // 提取时间段
        const timeSlot = extractTimeSlot(timeSlotText);
        if (!timeSlot) {
            console.log(`无法从 "${timeSlotText}" 提取有效时间段，跳过第 ${rowIndex+1} 行`);
            continue;
        }
        
        console.log(`主播 "${anchorName}" 在 ${currentDate} 的时间段 ${timeSlot}`);
        
        // 初始化时间段
        if (!scheduleMap[currentDate][timeSlot]) {
            scheduleMap[currentDate][timeSlot] = [];
        }
        
        // 解析旺悦和源悦档位
        let wangTier = '非档';
        let yuanTier = '非档';
        
        // 从档位信息中提取
        if (tierInfo) {
            if (tierInfo.includes('旺大')) {
                wangTier = '大档';
            } else if (tierInfo.includes('旺小')) {
                wangTier = '小档';
            }
            
            if (tierInfo.includes('源大')) {
                yuanTier = '大档';
            } else if (tierInfo.includes('源小')) {
                yuanTier = '小档';
            }
        }
        
        // 将主播添加到旺悦和源悦的排班中
        scheduleMap[currentDate][timeSlot].push({
            anchor: anchorName,
            position: `旺悦${wangTier}`
        });
        
        scheduleMap[currentDate][timeSlot].push({
            anchor: anchorName,
            position: `源悦${yuanTier}`
        });
        
        console.log(`添加主播 "${anchorName}" 到 ${currentDate} ${timeSlot}，旺悦档位: ${wangTier}，源悦档位: ${yuanTier}`);
    }
    
    // 调试：检查生成的排班表中每个日期的时间段数量
    for (const date in scheduleMap) {
        const timeSlots = Object.keys(scheduleMap[date]);
        console.log(`日期 ${date} 有 ${timeSlots.length} 个时间段:`, timeSlots);
        
        // 检查每个时间段的主播信息
        for (const timeSlot of timeSlots) {
            const anchors = scheduleMap[date][timeSlot];
            console.log(`  时间段 ${timeSlot} 有 ${anchors.length} 个主播信息:`, 
                anchors.map(a => `${a.anchor}(${a.position})`).join(', '));
        }
    }
    
    console.log('最终排班表生成完成');
    return scheduleMap;
}

// 规范化销售数据
function normalizeSalesData(salesData) {
    console.log("规范化销售数据...");
    const normalizedSales = [];
    
    // 确定订单时间字段名称
    let timeFieldName = null;
    const possibleTimeFields = ["订单提交时间", "提交时间", "下单时间", "时间", "订单时间"];
    
    // 查找销售数据中使用的时间字段
    if (salesData.length > 0) {
        const firstItem = salesData[0];
        for (const field of possibleTimeFields) {
            if (firstItem[field] !== undefined) {
                timeFieldName = field;
                console.log(`找到时间字段: "${timeFieldName}"`);
                break;
            }
        }
    }
    
    if (!timeFieldName) {
        console.error("无法识别销售数据中的时间字段");
        // 尝试查看对象的键
        if (salesData.length > 0) {
            console.log("可用字段:", Object.keys(salesData[0]));
        }
        return normalizedSales;
    }
    
    salesData.forEach((sale, index) => {
        // 获取订单提交时间
        let orderTime = sale[timeFieldName];
        
        if (!orderTime) {
            console.warn(`订单 #${index + 1} 没有时间信息`);
            return; // 跳过此订单
        }
        
        try {
            // 标准化日期时间字符串
            let dateTimeStr = String(orderTime).trim();
            
            // 检查并处理不同的日期时间格式
            let dateTime = null;
            
            // 处理标准格式 "YYYY-MM-DD HH:MM:SS"
            if (/^\d{4}-\d{1,2}-\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}$/.test(dateTimeStr)) {
                dateTime = new Date(dateTimeStr);
            } 
            // 处理格式 "YYYY/MM/DD HH:MM:SS"
            else if (/^\d{4}\/\d{1,2}\/\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}$/.test(dateTimeStr)) {
                dateTimeStr = dateTimeStr.replace(/\//g, '-');
                dateTime = new Date(dateTimeStr);
            }
            // 处理Excel数值型日期
            else if (!isNaN(orderTime) && typeof orderTime === 'number') {
                // Excel日期是从1900年1月1日开始的天数
                // JavaScript日期从1970年1月1日开始的毫秒数
                // 需要转换: (excel_date - 25569) * 86400 * 1000
                const excelEpoch = new Date(1900, 0, 1);
                const msPerDay = 24 * 60 * 60 * 1000;
                dateTime = new Date(excelEpoch.getTime() + (orderTime - 1) * msPerDay);
            }
            // 最后尝试直接解析
            else {
                dateTime = new Date(dateTimeStr);
            }
            
            if (isNaN(dateTime.getTime())) {
                throw new Error(`无法解析日期时间: "${dateTimeStr}"`);
            }
            
            // 提取年、月、日、小时、分钟
            const year = dateTime.getFullYear();
            const month = (dateTime.getMonth() + 1).toString().padStart(2, '0');
            const day = dateTime.getDate().toString().padStart(2, '0');
            const hours = dateTime.getHours().toString().padStart(2, '0');
            const minutes = dateTime.getMinutes().toString().padStart(2, '0');
            
            // 创建标准化的日期和时间
            const standardDate = `${year}-${month}-${day}`;
            const standardTime = `${hours}:${minutes}`;
            
            // 创建标准化的销售数据
            normalizedSales.push({
                original: sale,
                date: standardDate,
                time: standardTime,
                hour: Number(hours),
                minute: Number(minutes)
            });
            
            if (index < 5 || index % 100 === 0) { // 只记录少量日志以避免过多输出
                console.log(`处理订单 #${index + 1}: ${dateTimeStr} -> ${standardDate} ${standardTime}`);
            }
        } catch (error) {
            console.error(`处理订单 #${index + 1} 时间出错:`, error, orderTime);
        }
    });
    
    // 汇总日期信息
    const dateSet = new Set();
    normalizedSales.forEach(sale => dateSet.add(sale.date));
    const dates = Array.from(dateSet).sort();
    
    console.log(`销售数据标准化完成，共 ${normalizedSales.length} 条记录，日期范围: ${dates.length > 0 ? `${dates[0]} 至 ${dates[dates.length-1]}` : '无数据'}`);
    console.log("销售数据包含的日期:", dates.join(", "));
    
    return normalizedSales;
}

// 匹配销售与排期数据
function matchSalesWithSchedule(salesData, scheduleMap) {
    console.log("开始匹配销售与排期数据");
    
    if (!salesData || !scheduleMap) {
        console.error("销售数据或排期数据无效");
        return [];
    }
    
    // 查看可用的排期日期
    const availableDates = Object.keys(scheduleMap);
    console.log("可用的排期日期:", availableDates);
    
    // 记录日期的实际匹配情况，用于调试
    const dateMatchingLog = {};
    
    // 处理每条销售记录
    const results = salesData.map((sale, index) => {
        const result = {
            sale: sale.original, // 保存原始销售数据
            matched: false,
            date: sale.date,     // 直接使用normalizeSalesData处理好的日期
            time: sale.time,     // 直接使用normalizeSalesData处理好的时间
            anchor: null,
            position: null,
            timeSlot: null,
            matchedDate: null,
            productBrand: null,  // 产品品牌（旺悦/源悦）
            productTier: null    // 产品档位（大档/小档/非档）
        };
        
        if (index < 10) {
            console.log(`处理销售记录 #${index+1}`, sale);
            console.log(`销售日期: ${result.date}, 时间: ${result.time}`);
        }
        
        // 如果无法提取日期或时间，则无法匹配
        if (!result.date || !result.time) {
            console.log(`记录 #${index+1} 无法提取日期或时间，跳过匹配`);
            return result;
        }
        
        // 从商品名称确定品牌和档位
        let productName = '';
        if (sale.original) {
            if (typeof sale.original === 'object' && !Array.isArray(sale.original)) {
                productName = sale.original['选购商品'] || sale.original['商品名称'] || sale.original['商品'] || '';
            } else if (Array.isArray(sale.original)) {
                productName = sale.original[0] || '';
            } else {
                productName = String(sale.original);
            }
            
            if (index < 10) {
                console.log(`分析商品名称: "${productName}"`);
            }
            
            // 增强品牌识别规则 - 旺悦/源悦
            if (productName.includes('旺玥') || productName.includes('旺悦') || 
                productName.includes('旺奶') || productName.includes('旺粉')) {
                result.productBrand = '旺悦';
            } else if (productName.includes('源玥') || productName.includes('源悦') || 
                       productName.includes('星') || productName.includes('皇家') || 
                       productName.includes('美素佳儿') || /Friso|MeadJohnson|aptamil/i.test(productName)) {
                result.productBrand = '源悦';
            }
            
            // 增强档位识别规则
            if (productName.includes('大档') || productName.includes('2段') || 
                productName.includes('3段') || productName.includes('4段') || /stage\s*[234]/i.test(productName)) {
                result.productTier = '大档';
            } else if (productName.includes('小档') || productName.includes('1段') || /stage\s*1/i.test(productName)) {
                result.productTier = '小档';
            } else {
                result.productTier = '非档';
            }
            
            if (index < 10) {
                console.log(`商品分析结果 - 品牌: ${result.productBrand || '未识别'}, 档位: ${result.productTier || '未识别'}`);
            }
        }
        
        // 如果没有明确品牌，使用额外特征词进行判断
        if (!result.productBrand && productName) {
            // 更多的特征词匹配规则
            if (productName.includes('星') || productName.includes('皇家') || 
                productName.match(/美素佳儿/i) || productName.includes('illuma') || 
                productName.includes('雅培') || productName.includes('惠氏') || 
                productName.includes('爱他美') || productName.includes('牛栏')) {
                result.productBrand = '源悦';
                if (index < 10) console.log(`根据特征词判断为源悦产品`);
            } else {
                // 默认为旺悦
                result.productBrand = '旺悦';
                if (index < 10) console.log(`未明确识别品牌，默认设为旺悦产品`);
            }
        }
        
        // 步骤1: 查找匹配的排期日期
        let matchingDate = null;
        
        // 特殊处理2月28日销售数据
        if (result.date.includes('2025-02-28') || result.date.includes('02-28')) {
            matchingDate = '02-28';
            if (index < 10) console.log(`特殊处理2月28日销售数据: ${result.date} -> ${matchingDate}`);
        }
        // 尝试直接匹配完整日期
        else if (availableDates.includes(result.date)) {
            matchingDate = result.date;
            if (index < 10) console.log(`找到完全匹配的日期: ${matchingDate}`);
        } 
        // 尝试匹配MM-DD格式
        else {
            const saleDateParts = result.date.split('-');
            if (saleDateParts.length >= 3) {
                const mmdd = `${saleDateParts[1]}-${saleDateParts[2]}`;
                if (availableDates.includes(mmdd)) {
                    matchingDate = mmdd;
                    if (index < 10) console.log(`找到月日匹配: ${mmdd}`);
                }
            }
            
            // 如果还没找到，尝试进行模糊匹配
            if (!matchingDate) {
                try {
                    const saleDateTime = new Date(result.date).getTime();
                    if (!isNaN(saleDateTime)) {
                        // 使用当前年份补全日期
                        const currentYear = new Date().getFullYear();
                        let closestDate = null;
                        let minDistance = Infinity;
                        
                        for (const scheduleDate of availableDates) {
                            // 补全年份构造完整日期
                            let fullDate = scheduleDate;
                            if (scheduleDate.length <= 5 && scheduleDate.includes('-')) {
                                fullDate = `${currentYear}-${scheduleDate}`;
                            }
                            
                            const scheduleDateTime = new Date(fullDate).getTime();
                            if (!isNaN(scheduleDateTime)) {
                                const distance = Math.abs(saleDateTime - scheduleDateTime) / (1000 * 60 * 60 * 24);
                                if (distance < minDistance && distance <= 3) { // 最多相差3天
                                    minDistance = distance;
                                    closestDate = scheduleDate;
                                }
                            }
                        }
                        
                        if (closestDate) {
                            matchingDate = closestDate;
                            if (index < 10) console.log(`找到最接近的日期: ${matchingDate}, 相差 ${minDistance.toFixed(1)} 天`);
                        }
                    }
                } catch (error) {
                    console.error(`日期匹配出错:`, error);
                }
            }
        }
        
        // 记录匹配情况
        dateMatchingLog[result.date] = matchingDate || "未匹配";
        
        // 步骤2: 如果找到匹配的日期，尝试匹配时间段
        if (matchingDate) {
            result.matchedDate = matchingDate;
            const availableTimeSlots = Object.keys(scheduleMap[matchingDate] || {});
            
            if (availableTimeSlots.length > 0) {
                if (index < 10) console.log(`日期 ${matchingDate} 有 ${availableTimeSlots.length} 个可用时间段`);
                
                // 将销售时间转换为分钟数，以便比较
                const saleTimeMinutes = timeToMinutes(result.time);
                if (saleTimeMinutes === null) {
                    console.log(`无法解析销售时间 ${result.time}`);
                    return result;
                }
                
                // 找出最佳匹配的时间段
                let bestTimeSlot = null;
                let minDistance = Infinity;
                
                for (const timeSlot of availableTimeSlots) {
                    const [startTime, endTime] = timeSlot.split('-');
                    const startMinutes = timeToMinutes(startTime);
                    const endMinutes = timeToMinutes(endTime);
                    
                    if (startMinutes === null || endMinutes === null) {
                        if (index < 10) console.log(`无法解析时间段 ${timeSlot}`);
                        continue;
                    }
                    
                    // 计算销售时间与时间段的匹配程度
                    let distance;
                    
                    // 处理跨午夜的情况
                    if (endMinutes < startMinutes) {
                        // 跨午夜情况 (如 22:00-02:00)
                        if (saleTimeMinutes >= startMinutes || saleTimeMinutes <= endMinutes) {
                            // 销售时间在时间段内
                            distance = 0;
                        } else {
                            // 销售时间在时间段外，计算最小距离
                            distance = Math.min(
                                Math.abs(saleTimeMinutes - startMinutes),
                                Math.abs(saleTimeMinutes - endMinutes)
                            );
                        }
                    } else {
                        // 正常情况 (如 08:00-12:00)
                        if (saleTimeMinutes >= startMinutes && saleTimeMinutes <= endMinutes) {
                            // 销售时间在时间段内
                            distance = 0;
                        } else {
                            // 销售时间在时间段外，计算最小距离
                            distance = Math.min(
                                Math.abs(saleTimeMinutes - startMinutes),
                                Math.abs(saleTimeMinutes - endMinutes)
                            );
                        }
                    }
                    
                    // 更新最佳匹配
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestTimeSlot = timeSlot;
                    }
                    
                    if (index < 10) console.log(`时间段 ${timeSlot} 距离: ${distance}`);
                }
                
                // 步骤3: 如果找到匹配的时间段，获取对应主播信息
                if (bestTimeSlot) {
                    if (index < 10) console.log(`找到最佳匹配时间段: ${bestTimeSlot}, 距离: ${minDistance}`);
                    result.timeSlot = bestTimeSlot;
                    
                    // 获取该时间段的主播信息
                    const anchors = scheduleMap[matchingDate][bestTimeSlot];
                    
                    if (anchors && anchors.length > 0) {
                        if (index < 10) console.log(`该时间段有 ${anchors.length} 个主播信息:`, anchors);
                        
                        // 根据产品品牌选择合适的主播信息
                        const matchingAnchors = anchors.filter(a => 
                            String(a.position || '').includes(result.productBrand || '')
                        );
                        
                        if (matchingAnchors.length > 0) {
                            // 从匹配品牌的主播中选择一个
                            const selectedAnchor = matchingAnchors[0];
                            if (index < 10) console.log(`选择匹配品牌的主播:`, selectedAnchor);
                            
                            result.matched = true;
                            result.anchor = String(selectedAnchor.anchor || '').trim();
                            result.position = selectedAnchor.position;
                        } else if (anchors.length > 0) {
                            // 如果没有匹配品牌的主播，使用第一个主播但调整档位
                            const fallbackAnchor = anchors[0];
                            if (index < 10) console.log(`没有匹配品牌的主播，选择第一个:`, fallbackAnchor);
                            
                            result.matched = true;
                            result.anchor = String(fallbackAnchor.anchor || '').trim();
                            
                            // 调整档位以匹配产品品牌
                            if (result.productBrand) {
                                if (result.productBrand === '旺悦') {
                                    result.position = `旺悦${result.productTier || '非档'}`;
                                } else if (result.productBrand === '源悦') {
                                    result.position = `源悦${result.productTier || '非档'}`;
                                } else {
                                    result.position = fallbackAnchor.position;
                                }
                                if (index < 10) console.log(`调整档位以匹配品牌: ${result.position}`);
                            } else {
                                result.position = fallbackAnchor.position;
                            }
                        }
                    } else {
                        if (index < 10) console.log(`时间段 ${bestTimeSlot} 没有主播信息`);
                    }
                } else {
                    if (index < 10) console.log(`未找到匹配的时间段`);
                }
            } else {
                if (index < 10) console.log(`日期 ${matchingDate} 没有可用时间段`);
            }
        } else {
            if (index < 10) console.log(`未找到匹配的排期日期`);
        }
        
        return result;
    });
    
    // 输出匹配统计
    const totalRecords = results.length;
    const matchedRecords = results.filter(r => r.matched).length;
    const matchRate = totalRecords > 0 ? ((matchedRecords / totalRecords) * 100).toFixed(2) : 0;
    
    console.log("匹配结果统计:");
    console.log(`总记录数: ${totalRecords}`);
    console.log(`成功匹配数: ${matchedRecords}`);
    console.log(`匹配率: ${matchRate}%`);
    
    // 输出每个品牌的匹配统计
    const brandStats = {
        '旺悦': { total: 0, matched: 0 },
        '源悦': { total: 0, matched: 0 }
    };
    
    results.forEach(r => {
        if (r.productBrand) {
            brandStats[r.productBrand].total++;
            if (r.matched) {
                brandStats[r.productBrand].matched++;
            }
        }
    });
    
    for (const brand in brandStats) {
        const stats = brandStats[brand];
        if (stats.total > 0) {
            const brandRate = ((stats.matched / stats.total) * 100).toFixed(2);
            console.log(`${brand}产品：共 ${stats.total} 条记录，成功匹配 ${stats.matched} 条，匹配率 ${brandRate}%`);
        }
    }
    
    // 输出关键日期的匹配情况
    console.log("关键日期匹配情况:", Object.entries(dateMatchingLog).slice(0, 5));
    
    return results;
}

// 查找最佳匹配的时间段
function findBestTimeSlot(saleTime, timeSlots) {
    console.log(`查找最佳时间段匹配，销售时间: ${saleTime}, 可用时间段:`, timeSlots);
    
    if (!saleTime || !timeSlots || !timeSlots.length) return null;
    
    // 转换销售时间为分钟数
    const saleMinutes = timeToMinutes(saleTime);
    if (saleMinutes === null) return timeSlots[0]; // 无法解析时间，返回第一个时间段
    
    // 计算每个时间段与销售时间的匹配程度
    const timeSlotMatches = timeSlots.map(slot => {
        const [start, end] = slot.split('-').map(t => timeToMinutes(t));
        
        // 处理跨午夜的时间段
        let distance;
        if (end < start) { // 跨午夜情况
            if (saleMinutes >= start || saleMinutes <= end) {
                // 销售时间在时间段内
                distance = 0;
            } else if (saleMinutes > end && saleMinutes < start) {
                // 销售时间在时间段外，计算到时间段边界的最小距离
                distance = Math.min(saleMinutes - end, start - saleMinutes);
            }
        } else { // 正常情况
            if (saleMinutes >= start && saleMinutes <= end) {
                // 销售时间在时间段内
                distance = 0;
            } else {
                // 销售时间在时间段外，计算到时间段边界的最小距离
                distance = Math.min(
                    Math.abs(saleMinutes - start),
                    Math.abs(saleMinutes - end)
                );
            }
        }
        
        return { timeSlot: slot, distance: distance };
    });
    
    // 按照距离排序，选择最匹配的时间段
    timeSlotMatches.sort((a, b) => a.distance - b.distance);
    
    const bestMatch = timeSlotMatches[0];
    console.log(`最佳匹配的时间段: ${bestMatch.timeSlot}, 距离: ${bestMatch.distance}`);
    
    return bestMatch.timeSlot;
}

// 查找匹配的排期日期
function findMatchingScheduleDate(saleDate, availableDates, dateFormatMap) {
    console.log(`查找匹配的排期日期，销售日期: ${saleDate}, 可用日期:`, availableDates);
    
    if (!saleDate || !availableDates || !availableDates.length) return null;
    
    // 如果有完全匹配的日期，直接返回
    if (availableDates.includes(saleDate)) {
        console.log(`找到完全匹配的日期: ${saleDate}`);
        return saleDate;
    }
    
    // 尝试MM-DD格式匹配
    const saleDateParts = saleDate.split('-');
    if (saleDateParts.length >= 3) {
        const mmdd = `${saleDateParts[1]}-${saleDateParts[2]}`;
        
        // 检查是否有匹配的月日
        for (const scheduleDate of availableDates) {
            if (scheduleDate === mmdd) {
                console.log(`找到月日匹配: ${mmdd} -> ${scheduleDate}`);
                return scheduleDate;
            }
        }
    }
    
    // 特殊处理：如果是2月28日，不进行近似匹配
    if (saleDate.match(/\d{4}-02-28/) || saleDate.includes('2-28') || saleDate.includes('2月28')) {
        console.log(`特殊日期2月28日，不进行近似匹配`);
        return null;
    }
    
    // 没有完全匹配，尝试查找最接近的日期（3天内）
    try {
        const saleDateTime = new Date(saleDate).getTime();
        if (!isNaN(saleDateTime)) {
            // 转换所有可用日期为Date对象并计算时间差
            const currentYear = new Date().getFullYear();
            const dateDistances = availableDates.map(scheduleDate => {
                let fullDate = scheduleDate;
                
                // 处理MM-DD格式
                if (scheduleDate.length <= 5 && scheduleDate.includes('-')) {
                    fullDate = `${currentYear}-${scheduleDate}`;
                }
                
                const scheduleDateTime = new Date(fullDate).getTime();
                
                // 跳过无效日期
                if (isNaN(scheduleDateTime)) return { date: scheduleDate, distance: Infinity };
                
                const distanceInDays = Math.abs(saleDateTime - scheduleDateTime) / (1000 * 60 * 60 * 24);
                return { date: scheduleDate, distance: distanceInDays };
            });
            
            // 按距离排序
            dateDistances.sort((a, b) => a.distance - b.distance);
            
            // 如果最接近的日期在3天内，则使用它
            if (dateDistances[0].distance <= 3) {
                console.log(`找到最接近的日期: ${dateDistances[0].date}, 相差 ${dateDistances[0].distance.toFixed(1)} 天`);
                return dateDistances[0].date;
            }
            
            console.log(`最接近的日期 ${dateDistances[0].date} 相差 ${dateDistances[0].distance.toFixed(1)} 天，超过3天限制`);
        } else {
            console.log(`日期 ${saleDate} 无法转换为有效日期对象`);
        }
    } catch (error) {
        console.error(`日期匹配时出错:`, error);
    }
    
    // 没有找到合适的匹配
    console.log(`未找到匹配的排期日期`);
    return null;
}

// 显示匹配结果
function displayResults(results) {
    console.log("显示分析结果...");
    
    // 保存结果以便重新绘制图表
    window.analysisResults = results;
    
    // 隐藏加载提示
    hideLoading();
    
    // 显示结果部分
    document.getElementById('results-section').classList.remove('d-none');
    
    // 确保默认选中匹配结果标签页
    const matchingTab = document.getElementById('matching-tab');
    const analysisTab = document.getElementById('analysis-tab');
    const matchingPane = document.getElementById('matching');
    const analysisPane = document.getElementById('analysis');
    
    if (matchingTab && analysisTab && matchingPane && analysisPane) {
        // 激活匹配结果标签页
        matchingTab.classList.add('active');
        matchingPane.classList.add('show', 'active');
        
        // 取消激活数据分析标签页
        analysisTab.classList.remove('active');
        analysisPane.classList.remove('show', 'active');
    }
    
    // 显示匹配统计信息
    const summaryDiv = document.getElementById('matching-summary');
    if (summaryDiv) {
        // 清空现有内容
        summaryDiv.innerHTML = '';
        
        // 计算匹配统计数据
        const matchedCount = results.filter(result => result.matched).length;
        const matchRate = ((matchedCount / results.length) * 100).toFixed(1);
        
        // 显示结果统计
        summaryDiv.innerHTML = `
            <div class="alert alert-info">
                <strong>匹配统计:</strong> 共 ${results.length} 条销售记录，成功匹配 ${matchedCount} 条 (匹配率: ${matchRate}%)
            </div>
        `;
        
        // 如果没有结果，显示提示
        if (results.length === 0) {
            summaryDiv.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>无匹配结果:</strong> 未找到任何匹配的销售记录
                </div>
            `;
        }
    }
    
    // 显示结果表格（分页显示）
    displayResultsPage(results, 1);
    
    // 创建分页控件
    createPagination(results.length);
    
    // 启用导出按钮 - 避免多次绑定事件
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        // 先移除之前可能绑定的事件
        exportBtn.removeEventListener('click', exportResults);
        // 重新绑定事件
        exportBtn.addEventListener('click', exportResults);
    }
    
    // 分析商品类别数据
    analyzeProductCategories(results);
    
    // 显示销售趋势图
    if (typeof displaySalesTrend === 'function') {
        displaySalesTrend(results);
    }
    
    // 添加AI分析建议
    if (typeof generateAISuggestions === 'function') {
        generateAISuggestions(results);
    }
    
    // 确保添加了主播名称的点击事件
    setTimeout(() => {
        if (typeof addAnchorClickEvents === 'function') {
            console.log("添加主播名称点击事件...");
            addAnchorClickEvents();
        }
    }, 500);
}

// 显示特定页的结果
function displayResultsPage(results, page) {
    const tableBody = document.getElementById('matching-table-body');
    tableBody.innerHTML = '';
    
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, results.length);
    
    console.log(`显示结果页面 ${page}，索引范围: ${startIndex}-${endIndex}，总数: ${results.length}`);
    
    // 仅显示当前页的数据
    for (let i = startIndex; i < endIndex; i++) {
        const result = results[i];
        console.log(`显示结果 #${i+1}:`, result);
        
        const row = document.createElement('tr');
        
        // 如果有匹配数据，使用绿色背景；如果未匹配，使用黄色背景
        if (result.matched) {
            row.classList.add('table-success');
        } else {
            row.classList.add('table-warning'); // 未匹配用黄色背景提醒
        }
        
        // 从销售数据中提取信息
        const { product, spec, quantity, price, time } = extractSaleInfo(result.sale);
        
        // 创建日期时间显示
        let timeDisplay = `${result.date} ${result.time}`;
        if (result.matchedDate && result.matchedDate !== result.date) {
            timeDisplay += `<br><small class="text-danger">(匹配到 ${result.matchedDate})</small>`;
        }
        
        // 确保主播名称正确显示 
        let anchorDisplay = '<span class="text-danger">未匹配</span>';
        if (result.matched && result.anchor) {
            // 匹配结果页不需要点击功能，移除anchor-name-cell类和样式
            anchorDisplay = `<span class="fw-bold">${String(result.anchor).trim()}</span>`;
            console.log(`结果 #${i+1} 的主播名称: "${result.anchor}"`);
        } else if (result.matched) {
            anchorDisplay = '<span class="text-warning">匹配成功但无主播信息</span>';
        }
        
        // 确定商品档位和品牌类型
        const productBrand = result.productBrand || '';
        const productTier = result.productTier || '';
        
        // 构建最终档位显示
        let positionDisplay = '-';
        if (result.matched && result.position) {
            // 直接使用匹配到的档位信息
            const positionText = String(result.position).trim();
            
            // 根据档位类型设置不同的徽章样式
            if (positionText.includes('旺悦')) {
                if (positionText.includes('大档')) {
                    positionDisplay = '<span class="badge bg-danger">旺悦大档</span>';
                } else if (positionText.includes('小档')) {
                    positionDisplay = '<span class="badge bg-warning text-dark">旺悦小档</span>';
                } else {
                    positionDisplay = '<span class="badge bg-secondary">旺悦非档</span>';
                }
            } else if (positionText.includes('源悦')) {
                if (positionText.includes('大档')) {
                    positionDisplay = '<span class="badge bg-primary">源悦大档</span>';
                } else if (positionText.includes('小档')) {
                    positionDisplay = '<span class="badge bg-info text-dark">源悦小档</span>';
                } else {
                    positionDisplay = '<span class="badge bg-secondary">源悦非档</span>';
                }
            } else {
                // 默认档位显示
                positionDisplay = `<span class="badge bg-secondary">${positionText}</span>`;
            }
        } else if (productBrand) {
            // 如果有品牌和档位信息但没有匹配成功，仍然显示产品信息
            if (productBrand === '旺悦') {
                if (productTier === '大档') {
                    positionDisplay = '<span class="badge bg-danger opacity-50">旺悦大档</span>';
                } else if (productTier === '小档') {
                    positionDisplay = '<span class="badge bg-warning text-dark opacity-50">旺悦小档</span>';
                } else {
                    positionDisplay = '<span class="badge bg-secondary opacity-50">旺悦非档</span>';
                }
            } else if (productBrand === '源悦') {
                if (productTier === '大档') {
                    positionDisplay = '<span class="badge bg-primary opacity-50">源悦大档</span>';
                } else if (productTier === '小档') {
                    positionDisplay = '<span class="badge bg-info text-dark opacity-50">源悦小档</span>';
                } else {
                    positionDisplay = '<span class="badge bg-secondary opacity-50">源悦非档</span>';
                }
            }
        }
        
        // 显示时间段
        let timeSlotDisplay = result.timeSlot || '-';
        
        // 创建行内容
        row.innerHTML = `
            <td class="align-middle"><span class="product-name">${product || '-'}</span></td>
            <td class="align-middle text-nowrap">${spec || '-'}</td>
            <td class="align-middle text-center no-wrap-text">${quantity || '-'}</td>
            <td class="align-middle text-center no-wrap-text">${price ? '¥' + price : '-'}</td>
            <td class="align-middle text-nowrap">${timeDisplay}</td>
            <td class="align-middle text-center">${anchorDisplay}</td>
            <td class="align-middle text-nowrap">${timeSlotDisplay}</td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // 更新分页按钮状态
    updatePaginationButtons(page, Math.ceil(results.length / itemsPerPage));
}

// 创建分页控制
function createPagination(totalItems) {
    const paginationContainer = document.getElementById('pagination-container');
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (!paginationContainer) {
        // 如果不存在分页容器，创建一个
        const matchingDiv = document.getElementById('matching');
        if (!matchingDiv) return;
        
        const paginationDiv = document.createElement('div');
        paginationDiv.id = 'pagination-container';
        paginationDiv.className = 'pagination-container d-flex justify-content-center mt-4';
        
        paginationDiv.innerHTML = `
            <div class="btn-group">
                <button id="home-page" class="btn btn-outline-primary" disabled>
                    <i class="bi bi-house-door"></i> 首页
                </button>
                <button id="prev-page" class="btn btn-outline-primary" disabled>
                    <i class="bi bi-chevron-left"></i> 上一页
                </button>
                <button id="pagination-info" class="btn btn-outline-secondary" disabled>
                    第 1 页，共 ${totalPages} 页
                </button>
                <button id="next-page" class="btn btn-outline-primary">
                    下一页 <i class="bi bi-chevron-right"></i>
                </button>
            </div>
            <div class="ms-3 d-flex align-items-center">
                <div class="input-group" style="width: 150px;">
                    <input type="number" id="page-jump-input" class="form-control" min="1" max="${totalPages}" placeholder="页码">
                    <button id="page-jump-btn" class="btn btn-outline-primary">跳转</button>
                </div>
            </div>
        `;
        
        // 在结果表格后添加分页控件
        const tableResponsive = matchingDiv.querySelector('.table-responsive');
        if (tableResponsive) {
            tableResponsive.parentNode.insertBefore(paginationDiv, tableResponsive.nextSibling);
        } else {
            matchingDiv.appendChild(paginationDiv);
        }
        
        // 添加首页按钮事件监听器
        document.getElementById('home-page').addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage = 1;
                displayResultsPage(matchedResults, currentPage);
            }
        });
        
        // 添加事件监听器
        document.getElementById('prev-page').addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                displayResultsPage(matchedResults, currentPage);
            }
        });
        
        document.getElementById('next-page').addEventListener('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                displayResultsPage(matchedResults, currentPage);
            }
        });
        
        // 添加页码跳转事件监听器
        document.getElementById('page-jump-btn').addEventListener('click', function() {
            jumpToPage();
        });
        
        document.getElementById('page-jump-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                jumpToPage();
            }
        });
    } else {
        // 如果分页容器已存在，更新其内容
        const pageInfo = document.getElementById('pagination-info');
        if (pageInfo) {
            pageInfo.textContent = `第 1 页，共 ${totalPages} 页`;
        }
        
        // 更新页码输入框的最大值
        const pageJumpInput = document.getElementById('page-jump-input');
        if (pageJumpInput) {
            pageJumpInput.max = totalPages;
        }
    }
    
    // 页码跳转函数
    function jumpToPage() {
        const pageInput = document.getElementById('page-jump-input');
        let pageNum = parseInt(pageInput.value);
        
        if (isNaN(pageNum)) {
            showNotice("warning", "请输入有效的页码");
            return;
        }
        
        // 确保页码在有效范围内
        if (pageNum < 1) pageNum = 1;
        if (pageNum > totalPages) pageNum = totalPages;
        
        // 跳转到指定页
        currentPage = pageNum;
        displayResultsPage(matchedResults, currentPage);
        
        // 不再清空输入框，保留用户输入的值
    }
}

// 更新分页按钮状态
function updatePaginationButtons(currentPage, totalPages) {
    const homeButton = document.getElementById('home-page');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('pagination-info');
    
    if (homeButton) {
        homeButton.disabled = currentPage <= 1;
    }
    
    if (prevButton) {
        prevButton.disabled = currentPage <= 1;
    }
    
    if (nextButton) {
        nextButton.disabled = currentPage >= totalPages;
    }
    
    if (pageInfo) {
        pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
    }
}

// 从销售数据中提取必要信息
function extractSaleInfo(saleRow) {
    // 针对不同的数据结构进行适配
    if (!saleRow) return { product: '-', spec: '-', quantity: '-', price: '-', time: '-' };
    
    // 如果是对象（已解析的JSON）
    if (typeof saleRow === 'object' && !Array.isArray(saleRow)) {
        return {
            product: saleRow['选购商品'] || saleRow['商品名称'] || saleRow['商品'] || '-',
            spec: saleRow['商品规格'] || saleRow['规格'] || '-',
            quantity: saleRow['商品数量'] || saleRow['数量'] || '-',
            price: saleRow['订单应付金额'] || saleRow['订单金额'] || saleRow['金额'] || '-',
            time: saleRow['订单提交时间'] || saleRow['提交时间'] || saleRow['下单时间'] || '-'
        };
    }
    
    // 如果是数组（原始Excel行数据）
    if (Array.isArray(saleRow)) {
        // 针对常见的数据格式进行处理
        // 假设格式为：[商品名, 规格, 数量, 价格, 时间]
        return {
            product: saleRow[0] || '-',
            spec: saleRow[1] || '-',
            quantity: saleRow[2] || '-',
            price: saleRow[3] || '-',
            time: saleRow[4] || '-'
        };
    }
    
    // 默认返回空值
    return { product: '-', spec: '-', quantity: '-', price: '-', time: '-' };
}

// 清除数据
function clearData() {
    // 重置全局数据
    salesData = null;
    scheduleData = null;
    matchedResults = null;
    
    // 重置UI状态
    document.getElementById('sales-status').innerHTML = '';
    document.getElementById('schedule-status').innerHTML = '';
    
    // 隐藏结果区域
    if (resultsSection) {
        resultsSection.classList.add('d-none');
    }
    
    // 禁用分析按钮
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
    }
    
    // 清空文件选择输入框
    if (salesFileInput) salesFileInput.value = '';
    if (scheduleFileInput) scheduleFileInput.value = '';
    
    // 重置文件详情显示
    const fileInfoIds = ['sales-file-info', 'schedule-file-info'];
    fileInfoIds.forEach(id => {
        const fileInfo = document.getElementById(id);
        if (fileInfo) {
            const fileDetails = fileInfo.querySelector('.file-details');
            if (fileDetails) {
                fileDetails.classList.add('d-none');
                
                const fileName = fileDetails.querySelector('.file-name');
                if (fileName) fileName.textContent = '';
                
                const fileSize = fileDetails.querySelector('.file-size');
                if (fileSize) fileSize.textContent = '';
            }
        }
    });
    
    // 清空通知区域
    const noticeArea = document.getElementById('notice-area');
    if (noticeArea) {
        noticeArea.innerHTML = '';
    }
    
    console.log('数据已清除');
}

// 导出结果
function exportResults() {
    alert('导出功能将在后续实现');
}

// 显示加载提示
function showLoading(message = "正在处理数据...") {
    const loadingModal = document.getElementById('loading-modal');
    const loadingMessage = document.getElementById('loading-message');
    const loadingProgress = document.getElementById('loading-progress');
    
    if (loadingMessage) {
        loadingMessage.textContent = message;
    }
    
    if (loadingProgress) {
        loadingProgress.style.width = '0%';
        
        // 模拟进度
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 90) progress = 90; // 最多到90%，等待完成时设置100%
            loadingProgress.style.width = `${progress}%`;
        }, 300);
        
        // 保存间隔ID以便后续清除
        window.loadingInterval = interval;
    }
    
    // 直接显示模态框，而不使用Bootstrap的Modal实例
    loadingModal.style.display = 'block';
    loadingModal.classList.add('show');
    document.body.classList.add('modal-open');
    
    // 添加模态框背景
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    document.body.appendChild(backdrop);
}

// 隐藏加载提示
function hideLoading() {
    const loadingModal = document.getElementById('loading-modal');
    const loadingProgress = document.getElementById('loading-progress');
    
    // 清除进度条动画间隔
    if (window.loadingInterval) {
        clearInterval(window.loadingInterval);
    }
    
    // 设置进度为100%表示完成
    if (loadingProgress) {
        loadingProgress.style.width = '100%';
    }
    
    // 短暂延迟以显示100%进度
    setTimeout(() => {
        // 直接隐藏模态框
        loadingModal.style.display = 'none';
        loadingModal.classList.remove('show');
        document.body.classList.remove('modal-open');
        
        // 移除模态框背景
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            document.body.removeChild(backdrop);
        }
        
        // 自动滚动到结果区域
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 300);
}

// 显示通知消息
function showNotice(type, message) {
    const noticeArea = document.getElementById('notice-area');
    if (!noticeArea) return;
    
    // 清除现有通知
    noticeArea.innerHTML = '';
    
    // 创建新通知
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} mt-3`;
    alert.role = 'alert';
    
    // 添加图标
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="bi bi-check-circle-fill me-2"></i>';
            break;
        case 'danger':
            icon = '<i class="bi bi-exclamation-triangle-fill me-2"></i>';
            break;
        case 'warning':
            icon = '<i class="bi bi-exclamation-circle-fill me-2"></i>';
            break;
        case 'info':
            icon = '<i class="bi bi-info-circle-fill me-2"></i>';
            break;
    }
    
    alert.innerHTML = `${icon} ${message}`;
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close';
    closeButton.setAttribute('data-bs-dismiss', 'alert');
    closeButton.setAttribute('aria-label', '关闭');
    alert.appendChild(closeButton);
    
    // 添加到通知区域
    noticeArea.appendChild(alert);
    
    // 5秒后自动消失
    setTimeout(() => {
        alert.classList.add('fade');
        setTimeout(() => {
            if (noticeArea.contains(alert)) {
                noticeArea.removeChild(alert);
            }
        }, 500);
    }, 5000);
}

// 从销售记录中提取日期
function extractSaleDate(sale) {
    // 检查sale对象结构
    if (!sale) return null;
    
    // 尝试获取日期时间字符串
    let dateTimeStr = '';
    
    // 处理不同的数据结构
    if (typeof sale === 'object' && sale !== null) {
        if (Array.isArray(sale)) {
            // 如果是数组，尝试在第五个元素中查找日期时间（基于常见格式）
            dateTimeStr = sale[4] || '';
        } else {
            // 如果是对象，尝试查找常见的日期属性名
            dateTimeStr = sale.datetime || sale.date || sale.orderTime || sale.time || '';
            
            // 如果仍未找到，则尝试检查所有属性值中是否包含日期格式
            if (!dateTimeStr) {
                for (const key in sale) {
                    const value = String(sale[key] || '');
                    if (value.match(/\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/)) {
                        dateTimeStr = value;
                        break;
                    }
                }
            }
        }
    } else {
        // 如果不是对象或数组，尝试转换为字符串并检查日期格式
        dateTimeStr = String(sale || '');
    }
    
    // 尝试从字符串中提取日期部分
    if (dateTimeStr) {
        // 匹配YYYY-MM-DD或YYYY/MM/DD格式
        const dateMatch = dateTimeStr.match(/(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/);
        if (dateMatch) {
            return dateMatch[0].replace(/\//g, '-'); // 统一替换为破折号格式
        }
        
        // 匹配MM-DD或MM/DD格式，使用当前年份
        const shortDateMatch = dateTimeStr.match(/(\d{1,2}[-\/]\d{1,2})/);
        if (shortDateMatch) {
            const currentYear = new Date().getFullYear();
            return `${currentYear}-${shortDateMatch[0].replace(/\//g, '-')}`;
        }
        
        // 匹配中文日期格式（X月X日）
        const chineseDateMatch = dateTimeStr.match(/(\d+月\d+[日号])/);
        if (chineseDateMatch) {
            const match = chineseDateMatch[0].match(/(\d+)月(\d+)[日号]/);
            if (match) {
                const month = match[1].padStart(2, '0');
                const day = match[2].padStart(2, '0');
                const currentYear = new Date().getFullYear();
                return `${currentYear}-${month}-${day}`;
            }
        }
    }
    
    console.warn(`无法从 ${dateTimeStr} 提取日期`);
    return null;
}

// 从销售记录中提取时间
function extractSaleTime(sale) {
    // 检查sale对象结构
    if (!sale) return null;
    
    // 尝试获取日期时间字符串
    let dateTimeStr = '';
    
    // 处理不同的数据结构
    if (typeof sale === 'object' && sale !== null) {
        if (Array.isArray(sale)) {
            // 如果是数组，尝试在第五个元素中查找时间（基于常见格式）
            dateTimeStr = sale[4] || '';
        } else {
            // 如果是对象，尝试查找常见的时间属性名
            dateTimeStr = sale.datetime || sale.date || sale.orderTime || sale.time || '';
            
            // 如果仍未找到，则尝试检查所有属性值中是否包含时间格式
            if (!dateTimeStr) {
                for (const key in sale) {
                    const value = String(sale[key] || '');
                    if (value.match(/\d{1,2}:\d{2}(:\d{2})?/)) {
                        dateTimeStr = value;
                        break;
                    }
                }
            }
        }
    } else {
        // 如果不是对象或数组，尝试转换为字符串并检查时间格式
        dateTimeStr = String(sale || '');
    }
    
    // 尝试从字符串中提取时间部分
    if (dateTimeStr) {
        // 匹配HH:MM:SS或HH:MM格式
        const timeMatch = dateTimeStr.match(/(\d{1,2}:\d{2}(:\d{2})?)/);
        if (timeMatch) {
            return timeMatch[0];
        }
    }
    
    console.warn(`无法从 ${dateTimeStr} 提取时间`);
    return null;
}

// 将时间转换为分钟数（用于时间比较）
function timeToMinutes(timeStr) {
    if (!timeStr) return null;
    
    const parts = timeStr.split(':');
    if (parts.length < 2) return null;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    return hours * 60 + minutes;
}

// 商品分类分析
function analyzeProductCategories(results) {
    console.log("开始商品分类分析...");
    
    // 创建分析结果对象
    productCategoryAnalysis = {};
    
    // 遍历所有匹配结果
    results.forEach(result => {
        if (!result.matched || !result.anchor) return; // 跳过未匹配的结果或无主播信息的结果
        
        const anchorName = result.anchor.trim();
        const saleInfo = extractSaleInfo(result.sale);
        const productName = saleInfo.product || '';
        const price = parseFloat(saleInfo.price) || 0;
        
        // 如果这个主播还没有数据，初始化
        if (!productCategoryAnalysis[anchorName]) {
            productCategoryAnalysis[anchorName] = {
                '源悦': 0,
                '莼悦': 0,
                '旺玥': 0,
                '皇家': 0
            };
        }
        
        // 根据商品名称分类
        if (productName.includes('源悦')) {
            productCategoryAnalysis[anchorName]['源悦'] += price;
        } else if (productName.includes('莼悦')) {
            productCategoryAnalysis[anchorName]['莼悦'] += price;
        } else if (productName.includes('旺玥')) {
            productCategoryAnalysis[anchorName]['旺玥'] += price;
        } else if (productName.includes('皇家') && !productName.includes('旺玥') && !productName.includes('莼悦')) {
            productCategoryAnalysis[anchorName]['皇家'] += price;
        }
    });
    
    // 输出分析结果到控制台
    console.log("商品分类分析结果:", productCategoryAnalysis);
    
    // 在数据分析选项卡中显示结果
    displayProductCategoryAnalysis();
    
    return productCategoryAnalysis;
}

// 显示商品分类分析结果
function displayProductCategoryAnalysis() {
    const analysisTab = document.getElementById('analysis');
    if (!analysisTab) {
        console.error("找不到显示分析结果的选项卡");
        return;
    }
    
    // 查找分析选项卡中的内容容器
    const cardBody = analysisTab.querySelector('.card-body');
    if (!cardBody) {
        console.error("找不到分析选项卡的内容容器");
        return;
    }
    
    // 查找或创建显示分类分析的容器
    let categoryContainer = document.getElementById('product-category-analysis');
    if (!categoryContainer) {
        // 创建新的行和列结构
        const newRow = document.createElement('div');
        newRow.className = 'row mb-4';
        
        const newCol = document.createElement('div');
        newCol.className = 'col-md-12';
        
        categoryContainer = document.createElement('div');
        categoryContainer.id = 'product-category-analysis';
        
        newCol.appendChild(categoryContainer);
        newRow.appendChild(newCol);
        
        // 在第一个图表行之前插入新行
        const existingRow = cardBody.querySelector('.row');
        if (existingRow) {
            cardBody.insertBefore(newRow, existingRow);
        } else {
            cardBody.appendChild(newRow);
        }
    }
    
    // 创建内容 - 使用更美观的卡片设计
    let html = `
    <div class="card shadow-sm border-0 mb-4">
        <div class="card-header bg-primary text-white py-3">
            <h5 class="mb-0 fw-bold">
                <i class="bi bi-bar-chart-fill me-2"></i>各主播商品类别销售额分析
            </h5>
        </div>
        <div class="card-body p-0">
    `;
    
    // 如果没有数据
    if (Object.keys(productCategoryAnalysis).length === 0) {
        html += `
        <div class="p-4">
            <div class="alert alert-warning d-flex align-items-center" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div>无可用数据进行商品分类分析</div>
            </div>
        </div>`;
    } else {
        // 创建表格 - 改进样式
        html += `
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-bottom: 2px solid #4e73df; min-width: 100px;">主播</th>
                            <th class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-bottom: 2px solid #4e73df; color: #4e73df;">源悦类</th>
                            <th class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-bottom: 2px solid #1cc88a; color: #1cc88a;">莼悦类</th>
                            <th class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-bottom: 2px solid #f6c23e; color: #f6c23e;">旺玥类</th>
                            <th class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-bottom: 2px solid #e74a3b; color: #e74a3b;">皇家类</th>
                            <th class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-bottom: 2px solid #36b9cc; color: #36b9cc; min-width: 120px;">总计</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // 计算总销售额
        let totalSourceSales = 0;
        let totalChunSales = 0; 
        let totalWangSales = 0;
        let totalRoyalSales = 0;
        let grandTotal = 0;
        
        // 为每个主播添加一行 - 改进样式
        Object.entries(productCategoryAnalysis).forEach(([anchor, categories], index) => {
            const total = categories['源悦'] + categories['莼悦'] + categories['旺玥'] + categories['皇家'];
            
            // 累加总销售额
            totalSourceSales += categories['源悦'];
            totalChunSales += categories['莼悦'];
            totalWangSales += categories['旺玥'];
            totalRoyalSales += categories['皇家'];
            grandTotal += total;
            
            // 格式化数字显示
            const formatNumber = num => {
                return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            };
            
            const rowClass = index % 2 === 0 ? '' : 'bg-light-subtle';
            
            html += `
                <tr class="${rowClass} hover-effect">
                    <td class="py-3 px-4 text-center fw-bold text-primary">${anchor}</td>
                    <td class="py-3 px-4 text-center" style="position: relative;">
                        <span class="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 w-100">
                            ¥ ${formatNumber(categories['源悦'])}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-center" style="position: relative;">
                        <span class="badge rounded-pill bg-success bg-opacity-10 text-success px-3 py-2 w-100">
                            ¥ ${formatNumber(categories['莼悦'])}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-center" style="position: relative;">
                        <span class="badge rounded-pill bg-warning bg-opacity-10 text-warning px-3 py-2 w-100">
                            ¥ ${formatNumber(categories['旺玥'])}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-center" style="position: relative;">
                        <span class="badge rounded-pill bg-danger bg-opacity-10 text-danger px-3 py-2 w-100">
                            ¥ ${formatNumber(categories['皇家'])}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-center fw-bold text-primary" style="position: relative;">
                        <span class="badge rounded-pill bg-info bg-opacity-10 text-info px-3 py-2 w-100 fs-6">
                            ¥ ${formatNumber(total)}
                        </span>
                    </td>
                </tr>
            `;
        });
        
        // 添加总计行
        html += `
            <tr style="background-color: #f8f9fa;">
                <td class="py-3 px-4 text-center fw-bold" style="background-color: #f8f9fa; border-top: 2px solid #4e73df;">总计</td>
                <td class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-top: 2px solid #4e73df; position: relative;">
                    <span class="badge rounded-pill bg-primary px-3 py-2 w-100 text-white">
                        ¥ ${totalSourceSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </span>
                </td>
                <td class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-top: 2px solid #1cc88a; position: relative;">
                    <span class="badge rounded-pill bg-success px-3 py-2 w-100 text-white">
                        ¥ ${totalChunSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </span>
                </td>
                <td class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-top: 2px solid #f6c23e; position: relative;">
                    <span class="badge rounded-pill bg-warning px-3 py-2 w-100 text-white">
                        ¥ ${totalWangSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </span>
                </td>
                <td class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-top: 2px solid #e74a3b; position: relative;">
                    <span class="badge rounded-pill bg-danger px-3 py-2 w-100 text-white">
                        ¥ ${totalRoyalSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </span>
                </td>
                <td class="py-3 px-4 text-center" style="background-color: #f8f9fa; border-top: 2px solid #36b9cc; position: relative;">
                    <span class="badge rounded-pill bg-dark px-3 py-2 w-100 text-white fs-6">
                        ¥ ${grandTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </span>
                </td>
            </tr>
        `;
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    html += `
        </div>
    </div>
    `;
    
    // 更新容器内容
    categoryContainer.innerHTML = html;
    
    // 如果有数据，创建图表
    if (Object.keys(productCategoryAnalysis).length > 0) {
        createProductCategoryCharts();
    }
}

// 创建商品类别销售分析图表
function createProductCategoryCharts() {
    console.log("创建商品分类图表...");
    
    // 检查数据是否存在
    if (!productCategoryAnalysis || Object.keys(productCategoryAnalysis).length === 0) {
        console.warn("没有可用数据来创建图表");
        return;
    }
    
    // 为图表创建一个新行
    const analysisTab = document.getElementById('analysis');
    if (!analysisTab) return;
    
    const cardBody = analysisTab.querySelector('.card-body');
    if (!cardBody) return;
    
    // 查找是否已存在这个图表行
    let chartRow = document.getElementById('product-category-charts-row');
    if (!chartRow) {
        chartRow = document.createElement('div');
        chartRow.id = 'product-category-charts-row';
        chartRow.className = 'row mt-4';
        
        // 创建图表卡片容器
        const pieChartCol = document.createElement('div');
        pieChartCol.className = 'col-md-12 mb-4';
        
        const pieChartCard = document.createElement('div');
        pieChartCard.className = 'card shadow-sm border-0';
        
        const pieChartCardHeader = document.createElement('div');
        pieChartCardHeader.className = 'card-header bg-gradient-primary text-white py-3';
        pieChartCardHeader.innerHTML = '<h5 class="mb-0 fw-bold"><i class="bi bi-pie-chart-fill me-2"></i>商品类别销售额分布</h5>';
        
        const pieChartCardBody = document.createElement('div');
        pieChartCardBody.className = 'card-body';
        
        // 创建图表容器的行列结构
        const chartContainerRow = document.createElement('div');
        chartContainerRow.className = 'row';
        
        // 左侧饼图
        const pieChartColLeft = document.createElement('div');
        pieChartColLeft.className = 'col-md-6';
        
        const pieChartContainer = document.createElement('div');
        pieChartContainer.className = 'chart-container';
        pieChartContainer.style.position = 'relative';
        pieChartContainer.style.height = '350px';
        
        // 创建canvas元素
        const pieChartCanvas = document.createElement('canvas');
        pieChartCanvas.id = 'product-category-pie-chart';
        
        // 右侧统计和信息
        const statsColRight = document.createElement('div');
        statsColRight.className = 'col-md-6';
        statsColRight.id = 'product-category-stats';
        
        // 组合元素
        pieChartContainer.appendChild(pieChartCanvas);
        pieChartColLeft.appendChild(pieChartContainer);
        chartContainerRow.appendChild(pieChartColLeft);
        chartContainerRow.appendChild(statsColRight);
        
        pieChartCardBody.appendChild(chartContainerRow);
        pieChartCard.appendChild(pieChartCardHeader);
        pieChartCard.appendChild(pieChartCardBody);
        pieChartCol.appendChild(pieChartCard);
        chartRow.appendChild(pieChartCol);
        
        // 添加到分析选项卡
        cardBody.appendChild(chartRow);
    }
    
    // 计算总销售额
    let totalSourceSales = 0;
    let totalChunSales = 0;
    let totalWangSales = 0;
    let totalRoyalSales = 0;
    
    Object.entries(productCategoryAnalysis).forEach(([anchor, categories]) => {
        totalSourceSales += categories['源悦'];
        totalChunSales += categories['莼悦'];
        totalWangSales += categories['旺玥'];
        totalRoyalSales += categories['皇家'];
    });
    
    const totalSales = totalSourceSales + totalChunSales + totalWangSales + totalRoyalSales;
    
    // 创建饼图数据
    const pieData = {
        labels: ['源悦类', '莼悦类', '旺玥类', '皇家类'],
        datasets: [{
            data: [totalSourceSales, totalChunSales, totalWangSales, totalRoyalSales],
            backgroundColor: ['#4e73df', '#1cc88a', '#f6c23e', '#e74a3b'],
            hoverBackgroundColor: ['#2e59d9', '#17a673', '#f4b619', '#d52a1a'],
            borderWidth: 3,
            borderColor: '#ffffff',
            hoverOffset: 15
        }]
    };
    
    // 如果已存在图表实例，先销毁它
    if (window.productCategoryPieChart) {
        window.productCategoryPieChart.destroy();
    }
    
    // 获取Canvas上下文
    const pieChartCanvas = document.getElementById('product-category-pie-chart');
    if (!pieChartCanvas) {
        console.error("找不到商品类别饼图的Canvas元素");
        return;
    }
    
    const pieCtx = pieChartCanvas.getContext('2d');
    
    // 创建饼图
    window.productCategoryPieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: pieData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            layout: {
                padding: 20
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 14
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    titleFont: {
                        weight: 'bold',
                        size: 16
                    },
                    bodyColor: '#333',
                    bodyFont: {
                        size: 14
                    },
                    borderColor: '#e0e0e0',
                    borderWidth: 1,
                    cornerRadius: 6,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / totalSales) * 100).toFixed(1);
                            return `${context.label}: ¥${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (${percentage}%)`;
                        }
                    }
                }
            },
            elements: {
                arc: {
                    borderWidth: 2
                }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: function(chart) {
                const width = chart.width;
                const height = chart.height;
                const ctx = chart.ctx;
                
                ctx.restore();
                
                // 绘制中心文本 - 总销售额
                const fontSize = (height / 200).toFixed(2) * 16;
                ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                
                // 总计文本
                ctx.fillStyle = '#666';
                const totalText = '总销售额';
                ctx.fillText(totalText, width / 2, height / 2 - fontSize * 0.6);
                
                // 总额
                ctx.fillStyle = '#4e73df';
                ctx.font = `bold ${fontSize * 1.5}px 'Segoe UI', sans-serif`;
                const formattedTotal = `¥${totalSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                ctx.fillText(formattedTotal, width / 2, height / 2 + fontSize * 0.8);
                
                ctx.save();
            }
        }]
    });
    
    // 更新右侧统计信息
    updateProductCategoryStats(totalSourceSales, totalChunSales, totalWangSales, totalRoyalSales, totalSales);
    
    // 添加主播名称点击事件，用于查看单个主播的类目销售详情
    // 使用requestAnimationFrame优化性能
    requestAnimationFrame(() => {
        addAnchorClickEvents();
    });
}

// 更新商品类别统计信息
function updateProductCategoryStats(sourceAmount, chunAmount, wangAmount, royalAmount, totalAmount) {
    const statsContainer = document.getElementById('product-category-stats');
    if (!statsContainer) return;
    
    // 计算百分比
    const sourcePercent = ((sourceAmount / totalAmount) * 100).toFixed(1);
    const chunPercent = ((chunAmount / totalAmount) * 100).toFixed(1);
    const wangPercent = ((wangAmount / totalAmount) * 100).toFixed(1);
    const royalPercent = ((royalAmount / totalAmount) * 100).toFixed(1);
    
    // 创建统计卡片
    statsContainer.innerHTML = `
        <h5 class="text-gray-800 mb-4">类别销售占比</h5>
        
        <div class="category-stat-item mb-4">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <h6 class="mb-0"><span class="badge bg-primary me-2">●</span> 源悦类</h6>
                <span class="text-dark fw-bold">${sourcePercent}%</span>
            </div>
            <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-primary" role="progressbar" style="width: ${sourcePercent}%" 
                     aria-valuenow="${sourcePercent}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div class="small text-end mt-1">¥${sourceAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
        </div>
        
        <div class="category-stat-item mb-4">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <h6 class="mb-0"><span class="badge bg-success me-2">●</span> 莼悦类</h6>
                <span class="text-dark fw-bold">${chunPercent}%</span>
            </div>
            <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${chunPercent}%" 
                     aria-valuenow="${chunPercent}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div class="small text-end mt-1">¥${chunAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
        </div>
        
        <div class="category-stat-item mb-4">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <h6 class="mb-0"><span class="badge bg-warning me-2">●</span> 旺玥类</h6>
                <span class="text-dark fw-bold">${wangPercent}%</span>
            </div>
            <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-warning" role="progressbar" style="width: ${wangPercent}%" 
                     aria-valuenow="${wangPercent}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div class="small text-end mt-1">¥${wangAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
        </div>
        
        <div class="category-stat-item mb-4">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <h6 class="mb-0"><span class="badge bg-danger me-2">●</span> 皇家类</h6>
                <span class="text-dark fw-bold">${royalPercent}%</span>
            </div>
            <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-danger" role="progressbar" style="width: ${royalPercent}%" 
                     aria-valuenow="${royalPercent}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div class="small text-end mt-1">¥${royalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
        </div>
        
        <div class="alert alert-light mt-4">
            <div class="d-flex align-items-center">
                <i class="bi bi-lightbulb-fill text-warning me-3 fs-4"></i>
                <div>
                    <h6 class="mb-1">销售分析洞察</h6>
                    <p class="mb-0 small">${getProductCategoryInsight(sourcePercent, chunPercent, wangPercent, royalPercent)}</p>
                </div>
            </div>
        </div>
    `;
}

// 根据类别占比生成销售分析洞察
function getProductCategoryInsight(sourcePercent, chunPercent, wangPercent, royalPercent) {
    // 找出占比最高的类别
    const percentages = [
        {name: '源悦类', value: parseFloat(sourcePercent)},
        {name: '莼悦类', value: parseFloat(chunPercent)},
        {name: '旺玥类', value: parseFloat(wangPercent)},
        {name: '皇家类', value: parseFloat(royalPercent)}
    ];
    
    percentages.sort((a, b) => b.value - a.value);
    
    const topCategory = percentages[0];
    const secondCategory = percentages[1];
    
    // 判断销售分布是否均衡
    const isBalanced = percentages[0].value - percentages[3].value < 30;
    
    if (isBalanced) {
        return `销售分布较为均衡，各类商品都有不错的表现。建议继续保持当前的销售策略，同时可以尝试进一步提升${topCategory.name}和${secondCategory.name}的销售占比。`;
    } else {
        return `${topCategory.name}表现突出，占据了销售的主要份额(${topCategory.value}%)。建议重点关注${percentages[3].name}的提升空间，可以考虑调整营销策略或主播排班方式来平衡各类商品销售。`;
    }
}

function createAnchorCategoryCharts(anchorName) {
    console.log(`创建主播 ${anchorName} 的类目销售额饼图`);
    
    try {
        // 检查数据是否存在
        if (!productCategoryAnalysis || !productCategoryAnalysis[anchorName]) {
            console.warn(`没有找到主播 ${anchorName} 的销售数据`);
            alert(`没有找到主播 ${anchorName} 的销售数据`);
            return;
        }
        
        // 获取模态框元素
        const modalElement = document.getElementById('anchor-chart-modal');
        if (!modalElement) {
            console.error('找不到主播类目分析模态框');
            alert('无法显示主播类目分析');
            return;
        }

        // 销毁现有的图表实例
        if (window.anchorCategoryPieChart instanceof Chart) {
            try {
                window.anchorCategoryPieChart.destroy();
                console.log('已销毁旧的图表实例');
            } catch (e) {
                console.error('销毁旧图表实例失败', e);
            }
            window.anchorCategoryPieChart = null;
        }

        // 修改模态框标题
        const modalTitle = modalElement.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = `${anchorName} 类目销售分析`;
        }

        // 获取该主播的类目销售数据
        const categoryData = productCategoryAnalysis[anchorName];
        
        // 计算总销售额
        const totalSales = Object.values(categoryData).reduce((sum, value) => sum + value, 0);
        
        // 设置总销售额显示
        const totalSalesElement = document.getElementById('anchor-total-sales');
        if (totalSalesElement) {
            totalSalesElement.textContent = `¥${totalSales.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
        
        // 生成表格HTML
        const categoryTable = document.getElementById('anchor-category-table');
        if (categoryTable) {
            categoryTable.innerHTML = '';
            
            [
                { name: '源悦类', value: categoryData['源悦'] || 0, color: '#4e73df' },
                { name: '莼悦类', value: categoryData['莼悦'] || 0, color: '#1cc88a' },
                { name: '旺玥类', value: categoryData['旺玥'] || 0, color: '#f6c23e' },
                { name: '皇家类', value: categoryData['皇家'] || 0, color: '#e74a3b' }
            ].forEach(category => {
                const percentage = totalSales > 0 ? ((category.value / totalSales) * 100).toFixed(1) : '0.0';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            <span class="badge me-2" style="background-color: ${category.color}; width: 15px; height: 15px;"></span>
                            <span>${category.name}</span>
                        </div>
                    </td>
                    <td class="text-end">¥${category.value.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td class="text-end">${percentage}%</td>
                `;
                categoryTable.appendChild(row);
            });
        }
        
        // 创建饼图
        const ctx = document.getElementById('anchor-category-pie-chart').getContext('2d');
        window.anchorCategoryPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['源悦类', '莼悦类', '旺玥类', '皇家类'],
                datasets: [{
                    data: [
                        categoryData['源悦'] || 0,
                        categoryData['莼悦'] || 0,
                        categoryData['旺玥'] || 0,
                        categoryData['皇家'] || 0
                    ],
                    backgroundColor: ['#4e73df', '#1cc88a', '#f6c23e', '#e74a3b'],
                    hoverBackgroundColor: ['#2e59d9', '#17a673', '#f4b619', '#d52a1a'],
                    hoverBorderColor: "rgba(234, 236, 244, 1)",
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `¥${value.toLocaleString('zh-CN')} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%',
                elements: {
                    arc: {
                        borderWidth: 0
                    }
                }
            }
        });
        
        // 显示模态框
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // 为新增按钮添加事件处理
        // 导出数据按钮
        const exportDataBtn = document.getElementById('export-anchor-data');
        if (exportDataBtn) {
            exportDataBtn.onclick = function() {
                // 创建导出数据
                const exportData = {
                    anchor: anchorName,
                    categories: {
                        '源悦类': categoryData['源悦'] || 0,
                        '莼悦类': categoryData['莼悦'] || 0,
                        '旺玥类': categoryData['旺玥'] || 0,
                        '皇家类': categoryData['皇家'] || 0
                    },
                    totalSales: totalSales,
                    date: new Date().toLocaleDateString('zh-CN')
                };
                
                // 转换为CSV字符串
                const csvContent = "数据:,金额(元),占比\n" + 
                    Object.entries(exportData.categories).map(([key, value]) => {
                        const percentage = totalSales > 0 ? ((value / totalSales) * 100).toFixed(1) : '0.0';
                        return `${key},${value.toFixed(2)},${percentage}%`;
                    }).join('\n');
                
                // 创建下载链接
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `${anchorName}-类目销售数据-${new Date().toLocaleDateString('zh-CN')}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // 显示提示
                showNotice('success', '数据导出成功！');
            };
        }
        
        // 查看详情按钮
        const showDetailsBtn = document.getElementById('show-anchor-details');
        if (showDetailsBtn) {
            showDetailsBtn.onclick = function() {
                // 获取当前模态框并隐藏
                const currentModal = bootstrap.Modal.getInstance(document.getElementById('anchor-chart-modal'));
                if (currentModal) {
                    currentModal.hide();
                }
                
                // 确保全局分析结果存在
                if (!window.analysisResults || !Array.isArray(window.analysisResults) || window.analysisResults.length === 0) {
                    console.error('无法获取分析结果，请重新分析数据');
                    showNotice('error', '无法获取分析结果，请重新分析数据');
                    return;
                }
                
                console.log(`使用全局分析结果 (${window.analysisResults.length}条记录) 查找${anchorName}的订单`);
                
                // 筛选出该主播的所有订单
                const anchorOrders = window.analysisResults.filter(result => {
                    return result.anchor && (
                        // 支持两种可能的数据结构：anchor作为字符串或带有name属性的对象
                        (typeof result.anchor === 'string' && result.anchor.trim() === anchorName) || 
                        (result.anchor.name && result.anchor.name === anchorName)
                    );
                });
                
                if (anchorOrders.length === 0) {
                    console.warn(`未找到${anchorName}的订单记录`);
                    showNotice('warning', `未找到${anchorName}的订单记录`);
                    return;
                }
                
                console.log(`找到${anchorOrders.length}条${anchorName}的订单记录`);
                
                // 按照商品类别分组订单
                const ordersByCategory = {
                    '旺玥': [],
                    '源悦': [],
                    '莼悦': [],
                    '皇家': []
                };
                
                // 为保持分组的可见性，我们使用一个常量存储类目顺序
                const CATEGORY_ORDER = ['旺玥', '源悦', '莼悦', '皇家'];
                
                // 分类统计
                let categorizedCount = 0;
                
                anchorOrders.forEach(order => {
                    const saleInfo = extractSaleInfo(order.sale);
                    const productName = saleInfo.product || '';
                    
                    let matched = false;
                    
                    // 尝试根据产品名称包含的关键词来分类
                    if (productName.includes('旺玥')) {
                        ordersByCategory['旺玥'].push(order);
                        matched = true;
                    } else if (productName.includes('源悦')) {
                        ordersByCategory['源悦'].push(order);
                        matched = true;
                    } else if (productName.includes('莼悦')) {
                        ordersByCategory['莼悦'].push(order);
                        matched = true;
                    } else if (productName.includes('皇家')) {
                        ordersByCategory['皇家'].push(order);
                        matched = true;
                    }
                    
                    // 如果上面没有匹配成功，尝试通过商品名称进行更宽松的匹配
                    if (!matched) {
                        // 可以添加更多匹配规则，比如其他关键词匹配
                        if (productName.includes('旺') || productName.includes('玥')) {
                            ordersByCategory['旺玥'].push(order);
                            matched = true;
                        } else if (productName.includes('源') || productName.includes('悦')) {
                            ordersByCategory['源悦'].push(order);
                            matched = true;
                        } else if (productName.includes('莼')) {
                            ordersByCategory['莼悦'].push(order);
                            matched = true;
                        } else if (productName.includes('皇') || productName.includes('家') || productName.includes('royal')) {
                            ordersByCategory['皇家'].push(order);
                            matched = true;
                        } else {
                            // 如果仍然无法分类，默认放入皇家类别
                            ordersByCategory['皇家'].push(order);
                            matched = true;
                        }
                    }
                    
                    if (matched) {
                        categorizedCount++;
                    }
                });
                
                console.log(`成功分类${categorizedCount}/${anchorOrders.length}条订单`);
                console.log('各类别订单数量:', 
                    '旺玥:', ordersByCategory['旺玥'].length,
                    '源悦:', ordersByCategory['源悦'].length,
                    '莼悦:', ordersByCategory['莼悦'].length,
                    '皇家:', ordersByCategory['皇家'].length
                );
                
                // 创建详情弹窗内容
                let detailsHTML = `
                    <div class="modal fade" id="anchor-details-modal" tabindex="-1">
                        <div class="modal-dialog modal-xl">
                            <div class="modal-content">
                                <div class="modal-header bg-primary text-white">
                                    <h5 class="modal-title">${anchorName} 订单明细</h5>
                                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <ul class="nav nav-tabs" id="categoryTabs" role="tablist">`;
                
                // 创建标签页
                let firstCategory = true;
                // 使用CATEGORY_ORDER确保按照指定顺序显示标签页
                CATEGORY_ORDER.forEach(category => {
                    if (ordersByCategory[category] && ordersByCategory[category].length > 0) {
                        // 使用固定的categoryId映射
                        const categoryIdMap = {
                            '旺玥': 'wang',
                            '源悦': 'yuan',
                            '莼悦': 'chun',
                            '皇家': 'royal'
                        };
                        const categoryId = categoryIdMap[category] || category.toLowerCase();
                        
                        detailsHTML += `
                            <li class="nav-item" role="presentation">
                                <button class="nav-link ${firstCategory ? 'active' : ''}" 
                                    id="${categoryId}-tab" 
                                    data-bs-toggle="tab" 
                                    data-bs-target="#${categoryId}-content" 
                                    type="button" role="tab">
                                    ${category}类 (${ordersByCategory[category].length})
                                </button>
                            </li>`;
                        firstCategory = false;
                    }
                });
                
                detailsHTML += `
                                    </ul>
                                    <div class="tab-content mt-3" id="categoryTabsContent">`;
                
                // 创建每个类别的内容
                firstCategory = true;
                for (const category in ordersByCategory) {
                    if (ordersByCategory[category].length > 0) {
                        // 使用固定的categoryId映射
                        const categoryIdMap = {
                            '旺玥': 'wang',
                            '源悦': 'yuan',
                            '莼悦': 'chun',
                            '皇家': 'royal'
                        };
                        const categoryId = categoryIdMap[category] || category.toLowerCase();
                        
                        detailsHTML += `
                            <div class="tab-pane fade ${firstCategory ? 'show active' : ''}" 
                                id="${categoryId}-content" role="tabpanel">
                                <div class="table-responsive">
                                    <table class="table table-striped table-hover">
                                        <thead>
                                            <tr>
                                                <th>商品名称</th>
                                                <th>规格</th>
                                                <th>数量</th>
                                                <th>金额</th>
                                                <th>订单时间</th>
                                            </tr>
                                        </thead>
                                        <tbody id="${categoryId}-orders-table">
                                            <!-- 订单数据将通过JS动态生成 -->
                                        </tbody>
                                        <tfoot>
                                            <tr class="table-active">
                                                <td colspan="3" class="text-end fw-bold">类别合计：</td>
                                                <td class="text-end fw-bold" id="${categoryId}-total">¥0.00</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mt-4">
                                    <div class="pagination-info text-muted small" id="${categoryId}-pagination-info">
                                        <!-- 分页信息 -->
                                    </div>
                                    <div class="pagination-controls" id="${categoryId}-pagination-controls">
                                        <!-- 分页控件 -->
                                    </div>
                                </div>
                            </div>`;
                        
                        firstCategory = false;
                    }
                }
                
                detailsHTML += `
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <div class="row w-100">
                                        <div class="col-md-6 mb-2 mb-md-0">
                                            <button type="button" id="export-detail-data" class="btn btn-primary w-100">
                                                <i class="bi bi-download me-1"></i>导出订单明细
                                            </button>
                                        </div>
                                        <div class="col-md-6">
                                            <button type="button" class="btn btn-secondary w-100" data-bs-dismiss="modal">
                                                <i class="bi bi-x-circle me-1"></i>关闭
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                
                // 添加到文档并显示
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = detailsHTML;
                document.body.appendChild(tempDiv.firstElementChild);
                
                // 为每个类别初始化分页和数据
                const itemsPerDetailPage = 5; // 每页显示5条订单
                const categoryPagination = {};
                
                CATEGORY_ORDER.forEach(category => {
                    if (ordersByCategory[category] && ordersByCategory[category].length > 0) {
                        const categoryIdMap = {
                            '旺玥': 'wang',
                            '源悦': 'yuan',
                            '莼悦': 'chun',
                            '皇家': 'royal'
                        };
                        const categoryId = categoryIdMap[category] || category.toLowerCase();
                        
                        // 初始化分页状态
                        categoryPagination[categoryId] = {
                            currentPage: 1,
                            itemsPerPage: itemsPerDetailPage,
                            totalItems: ordersByCategory[category].length,
                            totalPages: Math.ceil(ordersByCategory[category].length / itemsPerDetailPage)
                        };
                        
                        // 计算类别总销售额
                        let categoryTotal = 0;
                        ordersByCategory[category].forEach(order => {
                            const saleInfo = extractSaleInfo(order.sale);
                            categoryTotal += parseFloat(saleInfo.price) || 0;
                        });
                        
                        // 更新总计金额
                        const totalElement = document.getElementById(`${categoryId}-total`);
                        if (totalElement) {
                            totalElement.textContent = `¥${categoryTotal.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                        }
                        
                        // 创建分页控件
                        createDetailPagination(categoryId, categoryPagination[categoryId]);
                        
                        // 显示第一页数据
                        displayOrdersForCategory(categoryId, ordersByCategory[category], 1, itemsPerDetailPage);
                    }
                });
                
                // 导出订单明细功能
                document.getElementById('export-detail-data').addEventListener('click', function() {
                    exportAnchorDetails(anchorName, ordersByCategory);
                });
                
                const detailsModal = new bootstrap.Modal(document.getElementById('anchor-details-modal'));
                detailsModal.show();
                
                // 添加事件处理程序，关闭后删除模态框
                document.getElementById('anchor-details-modal').addEventListener('hidden.bs.modal', function() {
                    document.body.removeChild(document.getElementById('anchor-details-modal'));
                });
            };
        }
        
        // 添加到报告按钮
        const addToReportBtn = document.getElementById('add-to-report-btn');
        if (addToReportBtn) {
            addToReportBtn.onclick = function() {
                // 显示添加成功的提示
                showNotice('success', `已将${anchorName}的销售数据添加到报告`);
                // 这里可以实现将当前数据添加到报告的逻辑
            };
        }
        
    } catch (error) {
        console.error('创建主播类目销售图表时出错:', error);
        alert('创建销售分析图表时出错，请重试。');
    }
}

// 添加点击主播名称事件，显示该主播的类目销售饼图
function addAnchorClickEvents() {
    console.log('添加主播名称点击事件');
    
    // 只查找数据分析模块中的主播名称单元格
    const analysisTables = document.querySelectorAll('#product-category-analysis table');
    
    if (!analysisTables || analysisTables.length === 0) {
        console.warn("未找到主播分析表格，无法添加点击事件");
        return;
    }
    
    console.log(`找到 ${analysisTables.length} 个分析表格`);
    
    // 先移除所有现有的点击事件处理程序
    document.querySelectorAll('.anchor-name-cell').forEach(cell => {
        // 使用更安全的方式移除事件监听器，防止内存泄漏
        const newCell = cell.cloneNode(true);
        cell.parentNode.replaceChild(newCell, cell);
    });
    
    // 重新为表格中的主播名称添加点击事件
    analysisTables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const firstCell = row.querySelector('td:first-child');
            if (firstCell && firstCell.textContent && firstCell.textContent.trim() !== '总计') {
                const anchorName = firstCell.textContent.trim();
                
                // 添加视觉提示
                firstCell.classList.add('anchor-name-cell');
                firstCell.style.cursor = 'pointer';
                firstCell.style.textDecoration = 'underline';
                firstCell.title = `点击查看${anchorName}的类目销售详情`;
                
                // 添加点击事件 - 使用更简单的点击处理
                firstCell.addEventListener('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    console.log(`点击查看主播 ${anchorName} 的销售详情`);
                    
                    // 强制清理任何可能存在的模态框
                    const existingModal = document.querySelector('.modal.show');
                    if (existingModal) {
                        try {
                            // 尝试使用Bootstrap API关闭模态框
                            const instance = bootstrap.Modal.getInstance(existingModal);
                            if (instance) {
                                instance.hide();
                                console.log('已关闭现有模态框');
                            }
                        } catch (e) {
                            console.error('关闭现有模态框时出错', e);
                        }
                    }
                    
                    // 显示该主播的类目销售饼图
                    createAnchorCategoryCharts(anchorName);
                });
            }
        });
    });
    
    console.log('已为所有主播名称添加点击事件');
}

// 显示销售趋势图
function displaySalesTrend(results) {
    console.log("显示销售趋势图...");
    
    // 保存结果以便重绘和查询详情
    window.analysisResults = results;
    console.log(`已保存${results.length}条分析结果到全局变量`);
    
    // 查找图表容器
    const salesTrendChart = document.getElementById('sales-trend-chart');
    if (!salesTrendChart) {
        console.error("找不到销售趋势图容器");
        return;
    }
    
    try {
        // 销售数据按日期分组
        const salesByDate = {};
        
        results.forEach(result => {
            const saleInfo = extractSaleInfo(result.sale);
            const date = extractSaleDate(result.sale);
            
            if (date) {
                if (!salesByDate[date]) {
                    salesByDate[date] = 0;
                }
                
                const price = parseFloat(saleInfo.price) || 0;
                salesByDate[date] += price;
            }
        });
        
        // 转换为图表数据
        const dates = Object.keys(salesByDate).sort();
        const salesData = dates.map(date => salesByDate[date]);
        
        // 如果有已存在的图表，先销毁它
        if (window.salesTrendChartInstance) {
            try {
                window.salesTrendChartInstance.destroy();
            } catch (e) {
                console.error("销毁销售趋势图失败:", e);
            }
        }
        
        // 确保Canvas已准备好
        const ctx = salesTrendChart.getContext('2d');
        if (!ctx) {
            console.error("无法获取销售趋势图的2D上下文");
            return;
        }
        
        // 创建渐变背景
        const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
        gradientFill.addColorStop(0, 'rgba(78, 115, 223, 0.6)');
        gradientFill.addColorStop(1, 'rgba(78, 115, 223, 0)');
        
        // 计算平均销售额
        const avgSales = salesData.reduce((sum, value) => sum + value, 0) / salesData.length;
        
        // 创建图表
        window.salesTrendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: '每日销售额',
                        lineTension: 0.3,
                        backgroundColor: "rgba(78, 115, 223, 0.05)",
                        borderColor: "rgba(78, 115, 223, 1)",
                        pointRadius: 3,
                        pointBackgroundColor: "rgba(78, 115, 223, 1)",
                        pointBorderColor: "rgba(78, 115, 223, 1)",
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
                        pointHoverBorderColor: "rgba(78, 115, 223, 1)",
                        pointHitRadius: 10,
                        pointBorderWidth: 2,
                        fill: true,
                        data: salesData
                    },
                    {
                        label: '平均销售额',
                        lineTension: 0,
                        backgroundColor: "transparent",
                        borderColor: "rgba(246, 194, 62, 0.7)",
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        fill: false,
                        data: salesData.map(() => {
                            const average = salesData.reduce((sum, val) => sum + val, 0) / salesData.length;
                            return average;
                        })
                    }
                ],
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 12,
                                family: "'Segoe UI', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: "rgb(255, 255, 255)",
                        bodyColor: "#858796",
                        titleColor: "#6e707e",
                        titleMarginBottom: 10,
                        borderColor: "#dddfeb",
                        borderWidth: 1,
                        padding: 15,
                        displayColors: false,
                        intersect: false,
                        mode: 'index',
                        caretPadding: 10,
                        callbacks: {
                            label: function(context) {
                                return '销售额: ¥' + context.parsed.y.toLocaleString('zh-CN');
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        gridLines: {
                            color: "rgb(234, 236, 244)",
                            drawBorder: false,
                            zeroLineColor: "rgb(234, 236, 244)",
                        },
                        ticks: {
                            padding: 10,
                            callback: function(value) {
                                return '¥' + value.toLocaleString('zh-CN', {
                                    useGrouping: true,
                                    maximumFractionDigits: 0,
                                }) + '万';
                            }
                        }
                    },
                    x: {
                        gridLines: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            maxTicksLimit: 7
                        }
                    }
                }
            }
        });
        
        // 动态生成销售摘要统计卡片
        const summaryContainer = document.getElementById('sales-summary-container');
        if (summaryContainer) {
            // 计算总销售额
            const totalSales = salesData.reduce((sum, val) => sum + val, 0);
            
            // 计算平均单日销售额
            const averageSales = totalSales / salesData.length;
            
            // 找出销售最高日
            let maxSalesValue = 0;
            let maxSalesDate = '';
            
            salesData.forEach((value, index) => {
                if (value > maxSalesValue) {
                    maxSalesValue = value;
                    maxSalesDate = dates[index];
                }
            });
            
            // 生成HTML
            summaryContainer.innerHTML = `
                <div class="col-md-4">
                    <div class="card bg-light shadow-sm border-0">
                        <div class="card-body text-center py-4">
                            <h6 class="text-primary mb-2">总销售额</h6>
                            <h3 class="mb-0 fw-bold">¥${totalSales.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-light shadow-sm border-0">
                        <div class="card-body text-center py-4">
                            <h6 class="text-primary mb-2">平均单日销售</h6>
                            <h3 class="mb-0 fw-bold">¥${averageSales.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-light shadow-sm border-0">
                        <div class="card-body text-center py-4">
                            <h6 class="text-primary mb-2">销售最高日</h6>
                            <h3 class="mb-0 fw-bold">${maxSalesDate}</h3>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (e) {
        console.error("创建销售趋势图表时出错:", e);
    }
}

// 显示主播业绩图
function displayAnchorPerformance(results) {
    console.log("显示主播业绩图...");
    
    // 查找图表容器
    const anchorChart = document.getElementById('anchor-performance-chart');
    if (!anchorChart) {
        console.error("找不到主播业绩图容器");
        return;
    }
    
    // 按主播分组销售数据
    const anchorSales = {};
    
    results.forEach(result => {
        if (!result.matched || !result.anchor) return;
        
        const anchorName = result.anchor.trim();
        const saleInfo = extractSaleInfo(result.sale);
        const price = parseFloat(saleInfo.price) || 0;
        
        if (!anchorSales[anchorName]) {
            anchorSales[anchorName] = 0;
        }
        
        anchorSales[anchorName] += price;
    });
    
    // 转换为数组并按销售额排序（降序）
    const sortedAnchors = Object.entries(anchorSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // 只取前10名
    
    const anchorNames = sortedAnchors.map(item => item[0]);
    const salesData = sortedAnchors.map(item => item[1]);
    
    // 如果有已存在的图表，先销毁它
    if (window.anchorPerformanceChartInstance) {
        window.anchorPerformanceChartInstance.destroy();
    }
    
    // 创建图表
    const ctx = anchorChart.getContext('2d');
    window.anchorPerformanceChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: anchorNames,
            datasets: [{
                label: '销售额',
                data: salesData,
                backgroundColor: '#1cc88a',
                borderColor: '#17a673',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: '主播销售业绩排行',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let value = context.raw || 0;
                            return `销售额: ¥ ${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '销售金额 (元)'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 10000) {
                                return '¥' + (value / 10000).toFixed(1) + '万';
                            }
                            return '¥' + value;
                        }
                    }
                }
            }
        }
    });
}

// 显示销售时段分布图
function displayHourlySales(results) {
    console.log("显示销售时段分布图...");
    
    // 查找图表容器
    const hourlySalesChart = document.getElementById('hourly-sales-chart');
    if (!hourlySalesChart) {
        console.error("找不到销售时段分布图容器");
        return;
    }
    
    // 按小时统计销售数据
    const hourlySales = {};
    
    // 初始化所有小时的数据
    for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0');
        hourlySales[hour] = 0;
    }
    
    results.forEach(result => {
        const saleInfo = extractSaleInfo(result.sale);
        const saleTime = extractSaleTime(result.sale);
        const price = parseFloat(saleInfo.price) || 0;
        
        if (saleTime) {
            const hour = saleTime.split(':')[0].padStart(2, '0');
            hourlySales[hour] += price;
        }
    });
    
    // 转换为图表数据
    const hours = Object.keys(hourlySales).sort();
    const salesData = hours.map(hour => hourlySales[hour]);
    
    // 格式化小时标签
    const hourLabels = hours.map(hour => `${hour}:00`);
    
    // 如果有已存在的图表，先销毁它
    if (window.hourlySalesChartInstance) {
        window.hourlySalesChartInstance.destroy();
    }
    
    // 创建图表
    const ctx = hourlySalesChart.getContext('2d');
    window.hourlySalesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: hourLabels,
            datasets: [{
                label: '销售额',
                data: salesData,
                backgroundColor: '#36b9cc',
                borderColor: '#2c9faf',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: '24小时销售分布',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let value = context.raw || 0;
                            return `销售额: ¥ ${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '销售金额 (元)'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 10000) {
                                return '¥' + (value / 10000).toFixed(1) + '万';
                            }
                            return '¥' + value;
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '时间段'
                    }
                }
            }
        }
    });
}

// 生成AI分析建议
function generateAISuggestions(results) {
    console.log("生成AI分析建议...");
    
    // 查找显示建议的容器
    const aiSuggestions = document.getElementById('ai-suggestions');
    const overallAnalysis = document.getElementById('overall-analysis');
    const anchorSuggestions = document.getElementById('anchor-suggestions');
    
    if (!aiSuggestions || !overallAnalysis || !anchorSuggestions) {
        console.error("找不到AI建议容器");
        return;
    }
    
    // 清空现有内容
    aiSuggestions.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-3">正在分析销售数据...</p></div>';
    overallAnalysis.innerHTML = '';
    anchorSuggestions.innerHTML = '';
    
    // 模拟AI分析延迟，创造更真实的体验
    setTimeout(() => {
        // 基础统计
        const totalSales = results.reduce((total, result) => {
            const saleInfo = extractSaleInfo(result.sale);
            const price = parseFloat(saleInfo.price) || 0;
            return total + price;
        }, 0);
        
        const matchedCount = results.filter(result => result.matched).length;
        const matchRate = ((matchedCount / results.length) * 100).toFixed(1);
        
        // 按主播统计销售
        const anchorSales = {};
        const anchorProducts = {};
        
        results.forEach(result => {
            if (!result.matched || !result.anchor) return;
            
            const anchorName = result.anchor.trim();
            const saleInfo = extractSaleInfo(result.sale);
            const price = parseFloat(saleInfo.price) || 0;
            const product = saleInfo.product || '';
            
            if (!anchorSales[anchorName]) {
                anchorSales[anchorName] = 0;
                anchorProducts[anchorName] = {};
            }
            
            anchorSales[anchorName] += price;
            
            // 记录产品销售
            if (product) {
                if (!anchorProducts[anchorName][product]) {
                    anchorProducts[anchorName][product] = 0;
                }
                anchorProducts[anchorName][product] += price;
            }
        });
        
        // 销售趋势分析
        const salesByDate = {};
        results.forEach(result => {
            const date = extractSaleDate(result.sale);
            const saleInfo = extractSaleInfo(result.sale);
            const price = parseFloat(saleInfo.price) || 0;
            
            if (date) {
                if (!salesByDate[date]) {
                    salesByDate[date] = 0;
                }
                salesByDate[date] += price;
            }
        });
        
        // 计算日增长率
        const dates = Object.keys(salesByDate).sort();
        const growthRates = [];
        
        for (let i = 1; i < dates.length; i++) {
            const prevSale = salesByDate[dates[i-1]];
            const currSale = salesByDate[dates[i]];
            if (prevSale > 0) {
                const growthRate = ((currSale - prevSale) / prevSale * 100).toFixed(1);
                growthRates.push({
                    date: dates[i],
                    rate: parseFloat(growthRate),
                    sales: currSale
                });
            }
        }
        
        // 查找销售增长最快和最慢的日期
        growthRates.sort((a, b) => b.rate - a.rate);
        const highestGrowth = growthRates.length > 0 ? growthRates[0] : null;
        const lowestGrowth = growthRates.length > 0 ? growthRates[growthRates.length - 1] : null;
        
        // 检测销售趋势
        let trend = "稳定";
        if (growthRates.length >= 3) {
            const recentRates = growthRates.slice(-3);
            const positiveCount = recentRates.filter(item => item.rate > 0).length;
            if (positiveCount >= 2) {
                trend = "上升";
            } else if (positiveCount <= 1) {
                trend = "下降";
            }
        }
        
        // 销售时段分析
        const salesByHour = {};
        
        results.forEach(result => {
            const time = extractSaleTime(result.sale);
            if (!time) return;
            
            const hour = time.split(':')[0];
            const saleInfo = extractSaleInfo(result.sale);
            const price = parseFloat(saleInfo.price) || 0;
            
            if (!salesByHour[hour]) {
                salesByHour[hour] = 0;
            }
            salesByHour[hour] += price;
        });
        
        // 找出销售额最高的时段
        const bestHours = Object.entries(salesByHour)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        // 生成整体分析
        overallAnalysis.innerHTML = `
            <div class="row g-4">
                <div class="col-md-6">
                    <div class="card h-100 border-left-primary shadow-sm">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-4">
                                <div class="icon-circle bg-primary text-white">
                                    <i class="bi bi-graph-up"></i>
                                </div>
                                <h5 class="card-title ms-3 mb-0 fw-bold">销售概况</h5>
                            </div>
                            
                            <div class="row text-center mb-4">
                                <div class="col">
                                    <h6 class="text-muted mb-1">总销售额</h6>
                                    <h3 class="text-primary font-weight-bold">¥${totalSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h3>
                                </div>
                                <div class="col border-start">
                                    <h6 class="text-muted mb-1">订单数</h6>
                                    <h3 class="text-primary font-weight-bold">${results.length}</h3>
                                </div>
                                <div class="col border-start">
                                    <h6 class="text-muted mb-1">匹配率</h6>
                                    <h3 class="text-primary font-weight-bold">${matchRate}%</h3>
                                </div>
                            </div>
                            
                            <div class="alert alert-${trend === "上升" ? "success" : (trend === "下降" ? "warning" : "info")} d-flex align-items-center">
                                <i class="bi bi-${trend === "上升" ? "arrow-up-circle" : (trend === "下降" ? "arrow-down-circle" : "arrow-left-right")}-fill me-2 fs-4"></i>
                                <div>
                                    销售趋势呈<strong>${trend}</strong>态势
                                    ${highestGrowth ? `，${highestGrowth.date}日增长率达${highestGrowth.rate}%` : ''}
                                </div>
                            </div>
                            
                            <h6 class="text-primary mt-4 mb-3"><i class="bi bi-bullseye me-2"></i>销售建议</h6>
                            <ul class="mb-0">
                                <li>根据最近趋势，建议${trend === "上升" ? "维持当前销售策略，持续监控增长" : (trend === "下降" ? "调整产品推广策略，加强营销力度" : "关注产品结构调整，提高客单价")}</li>
                                <li>加强主播排班与销售高峰期的匹配度，优化人力资源配置</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card h-100 border-left-success shadow-sm">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-4">
                                <div class="icon-circle bg-success text-white">
                                    <i class="bi bi-clock"></i>
                                </div>
                                <h5 class="card-title ms-3 mb-0 fw-bold">时段分析</h5>
                            </div>
                            
                            <div class="mb-4">
                                <h6 class="text-muted mb-3">销售黄金时段</h6>
                                <div class="d-flex justify-content-between">
                                    ${bestHours.map((hour, index) => `
                                        <div class="peak-time-box text-center ${index === 0 ? 'peak-time-best' : ''}">
                                            <div class="peak-time-hour">${hour[0]}:00</div>
                                            <div class="peak-time-label">${index === 0 ? '最佳' : '热门'}</div>
                                            <div class="peak-time-sales">¥${hour[1].toFixed(0)}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <h6 class="text-primary mt-4 mb-3"><i class="bi bi-lightning-charge me-2"></i>优化策略</h6>
                            <div class="strategy-list">
                                <div class="strategy-item d-flex mb-3">
                                    <div class="strategy-icon me-3 bg-primary-light">
                                        <i class="bi bi-people"></i>
                                    </div>
                                    <div>
                                        <h6 class="mb-1">主播资源优化</h6>
                                        <p class="mb-0 small">在${bestHours[0][0]}:00-${parseInt(bestHours[0][0])+1}:00安排更多有经验的主播，提高转化率</p>
                                    </div>
                                </div>
                                
                                <div class="strategy-item d-flex mb-3">
                                    <div class="strategy-icon me-3 bg-success-light">
                                        <i class="bi bi-tags"></i>
                                    </div>
                                    <div>
                                        <h6 class="mb-1">促销时间优化</h6>
                                        <p class="mb-0 small">将促销活动集中在${bestHours.map(h => h[0]+':00').join('、')}等时段，最大化曝光效果</p>
                                    </div>
                                </div>
                                
                                <div class="strategy-item d-flex">
                                    <div class="strategy-icon me-3 bg-warning-light">
                                        <i class="bi bi-bar-chart"></i>
                                    </div>
                                    <div>
                                        <h6 class="mb-1">销售数据持续监控</h6>
                                        <p class="mb-0 small">建立销售时段动态监控机制，及时调整人力和资源配置</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .icon-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                }
                
                .border-left-primary {
                    border-left: 4px solid #4e73df;
                }
                
                .border-left-success {
                    border-left: 4px solid #1cc88a;
                }
                
                .peak-time-box {
                    background-color: #f8f9fc;
                    border-radius: 8px;
                    padding: 12px;
                    flex: 1;
                    margin: 0 5px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                
                .peak-time-best {
                    background-color: #edf7f2;
                    border: 1px solid #1cc88a;
                }
                
                .peak-time-hour {
                    font-size: 18px;
                    font-weight: bold;
                    color: #333;
                }
                
                .peak-time-label {
                    font-size: 12px;
                    color: #888;
                    margin: 4px 0;
                }
                
                .peak-time-sales {
                    font-size: 14px;
                    color: #4e73df;
                    font-weight: bold;
                }
                
                .strategy-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .bg-primary-light {
                    background-color: rgba(78, 115, 223, 0.1);
                    color: #4e73df;
                }
                
                .bg-success-light {
                    background-color: rgba(28, 200, 138, 0.1);
                    color: #1cc88a;
                }
                
                .bg-warning-light {
                    background-color: rgba(246, 194, 62, 0.1);
                    color: #f6c23e;
                }
            </style>
        `;
        
        // 生成主播分析建议
        const sortedAnchors = Object.entries(anchorSales)
            .sort((a, b) => b[1] - a[1]);
        
        // 主播表现分析
        let anchorsHtml = '';
        
        sortedAnchors.slice(0, 5).forEach(([anchor, sales], index) => {
            // 获取主播销售最好的产品
            const products = anchorProducts[anchor];
            const topProducts = Object.entries(products)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2);
            
            const productsList = topProducts.map(([product, sales]) => {
                return `<div class="top-product">
                    <span class="badge rounded-pill bg-light text-dark border">${product}</span>
                    <span class="text-primary ms-2">¥${sales.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                </div>`;
            }).join('');
            
            // 检查主播不同品类的销售情况
            let categoryStrength = '';
            let categoryAdvice = '';
            
            if (productCategoryAnalysis && productCategoryAnalysis[anchor]) {
                const categories = productCategoryAnalysis[anchor];
                const sortedCategories = Object.entries(categories)
                    .sort((a, b) => b[1] - a[1]);
                
                if (sortedCategories.length > 0) {
                    const topCategory = sortedCategories[0][0];
                    const secondCategory = sortedCategories.length > 1 ? sortedCategories[1][0] : null;
                    const weakCategory = sortedCategories.length > 2 ? sortedCategories[sortedCategories.length - 1][0] : null;
                    
                    categoryStrength = `在<strong>${topCategory}</strong>类商品销售方面表现突出`;
                    
                    if (weakCategory && sortedCategories[0][1] > sortedCategories[sortedCategories.length - 1][1] * 3) {
                        categoryAdvice = `建议加强<strong>${weakCategory}</strong>类商品的推广能力，平衡各品类销售`;
                    } else if (secondCategory) {
                        categoryAdvice = `建议继续发挥${topCategory}与${secondCategory}的优势，进一步提升销售业绩`;
                    }
                }
            }
            
            anchorsHtml += `
                <div class="col-md-4 mb-4">
                    <div class="card shadow-sm h-100 anchor-card ${index === 0 ? 'anchor-card-top' : ''}">
                        <div class="card-header py-3 d-flex justify-content-between align-items-center">
                            <h6 class="m-0 font-weight-bold text-primary">
                                <i class="bi bi-person-badge me-2"></i>${anchor}
                            </h6>
                            ${index === 0 ? '<span class="badge bg-primary">销售冠军</span>' : ''}
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div class="sales-amount">
                                    <span class="text-xs text-gray-500">总销售额</span>
                                    <h4 class="font-weight-bold text-gray-800 mt-1">¥${sales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h4>
                                </div>
                                <div class="sales-rank text-center">
                                    <span class="text-xs text-gray-500">排名</span>
                                    <h4 class="font-weight-bold text-${index < 3 ? 'primary' : 'gray-800'} mt-1">#${index + 1}</h4>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <h6 class="text-xs text-gray-500 mb-2">畅销商品</h6>
                                ${productsList || '<div class="text-muted small">无销售数据</div>'}
                            </div>
                            
                            <div class="anchor-strength mb-4">
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-award-fill text-warning me-2"></i>
                                    <div>${categoryStrength || '销售数据不足，无法分析产品类别优势'}</div>
                                </div>
                            </div>
                            
                            <div class="anchor-advice">
                                <div class="d-flex align-items-start">
                                    <i class="bi bi-lightbulb-fill text-info me-2 mt-1"></i>
                                    <div>${categoryAdvice || '建议尝试多种产品类别，找到最适合的销售方向'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        anchorSuggestions.innerHTML = `
            <div class="card mb-4">
                <div class="card-header bg-gradient-info text-white py-3">
                    <h3 class="h5 mb-0"><i class="bi bi-people-fill me-2"></i>主播表现分析</h3>
                </div>
                <div class="card-body">
                    <div class="row">
                        ${anchorsHtml}
                    </div>
                </div>
            </div>
            
            <style>
                .anchor-card {
                    transition: all 0.3s ease;
                    border-top: 3px solid #e3e6f0;
                }
                
                .anchor-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                }
                
                .anchor-card-top {
                    border-top: 3px solid #4e73df;
                }
                
                .top-product {
                    display: inline-flex;
                    align-items: center;
                    margin-right: 10px;
                    margin-bottom: 5px;
                }
                
                .bg-gradient-info {
                    background: linear-gradient(to right, #36b9cc, #1cc88a);
                }
            </style>
        `;
        
        // 更新预览区域的内容
        aiSuggestions.innerHTML = `
            <div class="alert alert-primary mb-4">
                <div class="d-flex">
                    <div class="me-3">
                        <i class="bi bi-robot fs-1"></i>
                    </div>
                    <div>
                        <h6 class="alert-heading mb-1">根据销售数据和主播排班匹配分析，我们发现：</h6>
                        <ul class="mb-0">
                            <li>销售高峰时段主要集中在${bestHours.map(h => h[0]+':00').join('、')}点。建议增加该时段的主播数量和优质商品推广。</li>
                            <li>不同主播在各商品类别上表现不同，可根据专长进行更精准的排班和商品分配。</li>
        `;
    });
    
    // 简短总结
    aiSuggestions.innerHTML = `
        <p>根据销售数据和主播排班匹配分析，我们发现：</p>
        <ul>
            <li>销售高峰时段主要集中在中午和下午，建议增加这些时段的主播数量和优质商品推广。</li>
            <li>不同主播在特定商品类别上展现出明显的销售优势，可根据专长进行更精准的排班和商品分配。</li>
            <li>整体销售情况良好，匹配率高，建议持续监控并动态调整排班策略。</li>
        </ul>
        <p>请查看"AI建议"选项卡获取更详细的分析和主播个性化建议。</p>
    `;
}

// 修复模态框ARIA属性问题
function fixModalAriaAttributes() {
    console.log('正在初始化模态框无障碍属性...');
    
    // 获取所有模态框元素
    const modalElements = document.querySelectorAll('.modal');
    if (!modalElements || modalElements.length === 0) {
        console.warn('没有找到模态框元素');
        return;
    }
    
    // 为每个模态框设置正确的ARIA属性和事件处理
    modalElements.forEach(modal => {
        // 先移除可能导致问题的aria-hidden属性
        if (modal.getAttribute('aria-hidden') === 'true') {
            modal.removeAttribute('aria-hidden');
        }
        
        // 获取该模态框的所有关闭按钮
        const closeButtons = modal.querySelectorAll('[data-bs-dismiss="modal"]');
        
        // 移除并重新绑定关闭按钮事件
        closeButtons.forEach(button => {
            // 克隆按钮以移除所有现有事件监听器
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // 给新按钮添加点击事件
            newButton.addEventListener('click', function(event) {
                console.log('模态框关闭按钮被点击');
                
                try {
                    // 尝试使用Bootstrap API关闭模态框
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) {
                        modalInstance.hide();
                    } else {
                        // 如果无法获取实例，使用备用方法关闭
                        modal.classList.remove('show');
                        document.body.classList.remove('modal-open');
                        const backdrops = document.querySelectorAll('.modal-backdrop');
                        backdrops.forEach(backdrop => backdrop.remove());
                    }
                } catch (error) {
                    console.error('关闭模态框失败:', error);
                    
                    // 最后的备用方法：直接设置样式
                    modal.style.display = 'none';
                    document.body.classList.remove('modal-open');
                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    backdrops.forEach(backdrop => backdrop.remove());
                }
            });
        });
        
        // 一个变量来存储模态框打开前的活动元素
        let previouslyFocusedElement = null;
        
        // 设置模态框显示前事件
        const showHandler = function() {
            console.log('模态框将要显示');
            // 存储当前焦点元素
            previouslyFocusedElement = document.activeElement;
            
            // 确保模态框可以正常获得焦点
            modal.removeAttribute('aria-hidden');
            
            // 使模态框中的元素可聚焦
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea');
            focusableElements.forEach(el => {
                if (el.getAttribute('tabindex') === '-1') {
                    el.removeAttribute('tabindex');
                }
            });
        };
        
        // 设置模态框显示后事件
        const shownHandler = function() {
            console.log('模态框已显示');
            // 将焦点设置到第一个可聚焦元素（通常是关闭按钮）
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea');
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 50);
            }
        };
        
        // 设置模态框隐藏前事件
        const hideHandler = function() {
            console.log('模态框将要隐藏');
            // 移除内部元素的焦点
            if (document.activeElement && modal.contains(document.activeElement)) {
                document.activeElement.blur();
            }
        };
        
        // 设置模态框隐藏后事件
        const hiddenHandler = function() {
            console.log('模态框已隐藏');
            
            // 恢复原始焦点
            if (previouslyFocusedElement && document.body.contains(previouslyFocusedElement)) {
                setTimeout(() => {
                    try {
                        previouslyFocusedElement.focus();
                    } catch (e) {
                        console.warn('恢复焦点失败', e);
                    }
                    previouslyFocusedElement = null;
                }, 10);
            }
            
            // 确保饼图实例被销毁
            if (window.anchorCategoryPieChart instanceof Chart) {
                try {
                    window.anchorCategoryPieChart.destroy();
                    window.anchorCategoryPieChart = null;
                } catch (e) {
                    console.warn('销毁图表失败:', e);
                }
            }
            
            // 设置aria-hidden属性
            modal.setAttribute('aria-hidden', 'true');
            
            // 确保模态框完全关闭并清理
            setTimeout(() => {
                if (!modal.classList.contains('show')) {
                    // 移除可能残留的背景
                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    backdrops.forEach(backdrop => backdrop.remove());
                    
                    // 确保body不再有modal-open类
                    if (!document.querySelector('.modal.show')) {
                        document.body.classList.remove('modal-open');
                    }
                }
            }, 150);
        };
        
        // 移除并重新添加事件监听器，避免重复绑定
        ['show.bs.modal', 'shown.bs.modal', 'hide.bs.modal', 'hidden.bs.modal'].forEach(event => {
            // 使用事件冒泡的特性，先移除所有事件，然后添加一个新事件
            modal.removeEventListener(event, modal[`${event.split('.')[0]}Handler`]);
        });
        
        // 存储处理程序引用，以便将来移除
        modal.showHandler = showHandler;
        modal.shownHandler = shownHandler;
        modal.hideHandler = hideHandler;
        modal.hiddenHandler = hiddenHandler;
        
        // 添加新的事件监听器
        modal.addEventListener('show.bs.modal', showHandler);
        modal.addEventListener('shown.bs.modal', shownHandler);
        modal.addEventListener('hide.bs.modal', hideHandler);
        modal.addEventListener('hidden.bs.modal', hiddenHandler);
    });
    
    console.log('模态框无障碍属性初始化完成');
}

// 创建订单详情分页控件
function createDetailPagination(categoryId, pagination) {
    const paginationContainer = document.getElementById(`${categoryId}-pagination-controls`);
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = `
        <div class="btn-group">
            <button id="${categoryId}-first-page" class="btn btn-sm btn-outline-primary" ${pagination.currentPage <= 1 ? 'disabled' : ''}>
                <i class="bi bi-chevron-double-left"></i>
            </button>
            <button id="${categoryId}-prev-page" class="btn btn-sm btn-outline-primary" ${pagination.currentPage <= 1 ? 'disabled' : ''}>
                <i class="bi bi-chevron-left"></i>
            </button>
            <button id="${categoryId}-page-info" class="btn btn-sm btn-outline-secondary" disabled>
                第 ${pagination.currentPage} 页，共 ${pagination.totalPages} 页
            </button>
            <button id="${categoryId}-next-page" class="btn btn-sm btn-outline-primary" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>
                <i class="bi bi-chevron-right"></i>
            </button>
            <button id="${categoryId}-last-page" class="btn btn-sm btn-outline-primary" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>
                <i class="bi bi-chevron-double-right"></i>
            </button>
        </div>
        <div class="ms-2 d-flex align-items-center">
            <div class="input-group input-group-sm" style="width: 120px;">
                <input type="number" id="${categoryId}-page-input" class="form-control form-control-sm" min="1" max="${pagination.totalPages}" value="${pagination.currentPage}">
                <button id="${categoryId}-page-jump" class="btn btn-outline-primary">跳转</button>
            </div>
        </div>
    `;
    
    // 更新分页信息
    const paginationInfo = document.getElementById(`${categoryId}-pagination-info`);
    if (paginationInfo) {
        const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
        const end = Math.min(start + pagination.itemsPerPage - 1, pagination.totalItems);
        paginationInfo.textContent = `显示 ${start} - ${end} 条，共 ${pagination.totalItems} 条订单`;
    }
    
    // 添加分页按钮事件
    document.getElementById(`${categoryId}-first-page`).addEventListener('click', function() {
        if (pagination.currentPage > 1) {
            pagination.currentPage = 1;
            updateDetailPagination(categoryId, pagination);
        }
    });
    
    document.getElementById(`${categoryId}-prev-page`).addEventListener('click', function() {
        if (pagination.currentPage > 1) {
            pagination.currentPage--;
            updateDetailPagination(categoryId, pagination);
        }
    });
    
    document.getElementById(`${categoryId}-next-page`).addEventListener('click', function() {
        if (pagination.currentPage < pagination.totalPages) {
            pagination.currentPage++;
            updateDetailPagination(categoryId, pagination);
        }
    });
    
    document.getElementById(`${categoryId}-last-page`).addEventListener('click', function() {
        if (pagination.currentPage < pagination.totalPages) {
            pagination.currentPage = pagination.totalPages;
            updateDetailPagination(categoryId, pagination);
        }
    });
    
    document.getElementById(`${categoryId}-page-jump`).addEventListener('click', function() {
        const input = document.getElementById(`${categoryId}-page-input`);
        let page = parseInt(input.value);
        if (!isNaN(page) && page >= 1 && page <= pagination.totalPages) {
            pagination.currentPage = page;
            updateDetailPagination(categoryId, pagination);
        } else {
            input.value = pagination.currentPage;
            showNotice('warning', '请输入有效的页码');
        }
    });
    
    document.getElementById(`${categoryId}-page-input`).addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const input = document.getElementById(`${categoryId}-page-input`);
            let page = parseInt(input.value);
            if (!isNaN(page) && page >= 1 && page <= pagination.totalPages) {
                pagination.currentPage = page;
                updateDetailPagination(categoryId, pagination);
            } else {
                input.value = pagination.currentPage;
                showNotice('warning', '请输入有效的页码');
            }
        }
    });
}

// 更新订单详情分页
function updateDetailPagination(categoryId, pagination) {
    // 更新分页按钮状态
    document.getElementById(`${categoryId}-first-page`).disabled = pagination.currentPage <= 1;
    document.getElementById(`${categoryId}-prev-page`).disabled = pagination.currentPage <= 1;
    document.getElementById(`${categoryId}-next-page`).disabled = pagination.currentPage >= pagination.totalPages;
    document.getElementById(`${categoryId}-last-page`).disabled = pagination.currentPage >= pagination.totalPages;
    
    // 更新页码信息
    document.getElementById(`${categoryId}-page-info`).textContent = `第 ${pagination.currentPage} 页，共 ${pagination.totalPages} 页`;
    document.getElementById(`${categoryId}-page-input`).value = pagination.currentPage;
    
    // 更新分页信息文本
    const paginationInfo = document.getElementById(`${categoryId}-pagination-info`);
    if (paginationInfo) {
        const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
        const end = Math.min(start + pagination.itemsPerPage - 1, pagination.totalItems);
        paginationInfo.textContent = `显示 ${start} - ${end} 条，共 ${pagination.totalItems} 条订单`;
    }
    
    // 重新获取类别映射回实际类别
    const categoryMap = {
        'wang': '旺玥',
        'yuan': '源悦', 
        'chun': '莼悦',
        'royal': '皇家'
    };
    const category = categoryMap[categoryId] || categoryId;
    
    // 获取当前主播名称
    const modalTitle = document.querySelector('#anchor-details-modal .modal-title');
    let anchorName = '';
    if (modalTitle) {
        // 从标题中提取主播名称（格式: "主播名称 订单明细"）
        anchorName = modalTitle.textContent.split(' ')[0];
    }
    
    if (!anchorName) {
        console.error('无法获取主播名称');
        return;
    }
    
    console.log(`正在查询${anchorName}的${category}类订单...`);
    
    // 从全局匹配结果中筛选正确的订单
    const orders = window.analysisResults.filter(result => {
        if (!result.anchor) return false;
        
        // 检查是否为当前主播的订单
        const isCurrentAnchor = (typeof result.anchor === 'string') 
            ? result.anchor.trim() === anchorName
            : (result.anchor.name && result.anchor.name === anchorName);
        if (!isCurrentAnchor) return false;
        
        // 检查订单商品是否属于当前类别
        const saleInfo = extractSaleInfo(result.sale);
        const productName = saleInfo.product || '';
        return productName.includes(category);
    });
    
    console.log(`找到${orders.length}条${category}类订单记录`);
    
    // 显示当前页的订单
    displayOrdersForCategory(categoryId, orders, pagination.currentPage, pagination.itemsPerPage);
}

// 显示订单详情页
function displayDetailPage(categoryId, orders, page, itemsPerPage) {
    // 这个函数已被替换为 displayOrdersForCategory
    // 为了保持兼容性，调用新函数
    displayOrdersForCategory(categoryId, orders, page, itemsPerPage);
}

// 导出主播订单明细
function exportAnchorDetails(anchorName, ordersByCategory) {
    try {
        // 准备CSV内容
        let csvContent = `主播名称,商品类别,商品名称,规格,数量,订单金额,订单时间\n`;
        
        // 添加订单数据
        for (const category in ordersByCategory) {
            if (ordersByCategory[category] && ordersByCategory[category].length > 0) {
                ordersByCategory[category].forEach(order => {
                    const saleInfo = extractSaleInfo(order.sale);
                    
                    // 处理CSV字段中的逗号（用双引号包围）
                    const productName = saleInfo.product ? `"${saleInfo.product.replace(/"/g, '""')}"` : '-';
                    const spec = saleInfo.spec ? `"${saleInfo.spec.replace(/"/g, '""')}"` : '-';
                    
                    csvContent += `${anchorName},${category},${productName},${spec},${saleInfo.quantity || 0},${parseFloat(saleInfo.price) || 0},${saleInfo.time || '-'}\n`;
                });
            }
        }
        
        // 创建Blob对象
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${anchorName}-订单明细-${new Date().toLocaleDateString('zh-CN')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 显示提示
        showNotice('success', '订单明细导出成功！');
    } catch (error) {
        console.error('导出订单明细时出错:', error);
        showNotice('danger', '导出订单明细失败，请重试');
    }
}

// 显示指定类别的订单（首次加载使用）
function displayOrdersForCategory(categoryId, orders, page, itemsPerPage) {
    const tableBody = document.getElementById(`${categoryId}-orders-table`);
    if (!tableBody) return;
    
    // 清空当前表格内容
    tableBody.innerHTML = '';
    
    // 计算当前页的订单
    const start = (page - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, orders.length);
    const pageOrders = orders.slice(start, end);
    
    // 添加订单到表格
    pageOrders.forEach(order => {
        const saleInfo = extractSaleInfo(order.sale);
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${saleInfo.product || '-'}</td>
            <td>${saleInfo.spec || '-'}</td>
            <td class="text-center">${saleInfo.quantity || '-'}</td>
            <td class="text-end">¥${(parseFloat(saleInfo.price) || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td>${saleInfo.time || '-'}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 如果没有订单，显示无数据提示
    if (pageOrders.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" class="text-center">没有找到订单数据</td>`;
        tableBody.appendChild(row);
    }
    
    // 更新分页信息
    const paginationInfo = document.getElementById(`${categoryId}-pagination-info`);
    if (paginationInfo) {
        const start = (page - 1) * itemsPerPage + 1;
        const end = Math.min(start + itemsPerPage - 1, orders.length);
        paginationInfo.textContent = `显示 ${start} - ${end} 条，共 ${orders.length} 条订单`;
    }
}

// 动态创建主播订单详情模态框
function createAnchorDetailsModal(anchorName, ordersByCategory) {
    // 如果已经存在模态框，先删除
    const existingModal = document.getElementById('anchor-details-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // 创建详情弹窗内容
    let detailsHTML = `
        <div class="modal fade" id="anchor-details-modal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">${anchorName} 订单明细</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <ul class="nav nav-tabs" id="categoryTabs" role="tablist">`;
                
                // 创建标签页
                let firstCategory = true;
                // 使用CATEGORY_ORDER确保按照指定顺序显示标签页
                CATEGORY_ORDER.forEach(category => {
                    if (ordersByCategory[category] && ordersByCategory[category].length > 0) {
                        // 使用固定的categoryId映射
                        const categoryIdMap = {
                            '旺玥': 'wang',
                            '源悦': 'yuan',
                            '莼悦': 'chun',
                            '皇家': 'royal'
                        };
                        const categoryId = categoryIdMap[category] || category.toLowerCase();
                        
                        detailsHTML += `
                            <li class="nav-item" role="presentation">
                                <button class="nav-link ${firstCategory ? 'active' : ''}" 
                                    id="${categoryId}-tab" 
                                    data-bs-toggle="tab" 
                                    data-bs-target="#${categoryId}-content" 
                                    type="button" role="tab">
                                    ${category}类 (${ordersByCategory[category].length})
                                </button>
                            </li>`;
                        firstCategory = false;
                    }
                });
                
                detailsHTML += `
                                    </ul>
                                    <div class="tab-content mt-3" id="categoryTabsContent">`;
                
                // 创建每个类别的内容
                firstCategory = true;
                for (const category in ordersByCategory) {
                    if (ordersByCategory[category].length > 0) {
                        // 使用固定的categoryId映射
                        const categoryIdMap = {
                            '旺玥': 'wang',
                            '源悦': 'yuan',
                            '莼悦': 'chun',
                            '皇家': 'royal'
                        };
                        const categoryId = categoryIdMap[category] || category.toLowerCase();
                        
                        detailsHTML += `
                            <div class="tab-pane fade ${firstCategory ? 'show active' : ''}" 
                                id="${categoryId}-content" role="tabpanel">
                                <div class="table-responsive">
                                    <table class="table table-striped table-hover">
                                        <thead>
                                            <tr>
                                                <th>商品名称</th>
                                                <th>规格</th>
                                                <th>数量</th>
                                                <th>金额</th>
                                                <th>订单时间</th>
                                            </tr>
                                        </thead>
                                        <tbody id="${categoryId}-orders-table">
                                            <!-- 订单数据将通过JS动态生成 -->
                                        </tbody>
                                        <tfoot>
                                            <tr class="table-active">
                                                <td colspan="3" class="text-end fw-bold">类别合计：</td>
                                                <td class="text-end fw-bold" id="${categoryId}-total">¥0.00</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mt-4">
                                    <div class="pagination-info text-muted small" id="${categoryId}-pagination-info">
                                        <!-- 分页信息 -->
                                    </div>
                                    <div class="pagination-controls" id="${categoryId}-pagination-controls">
                                        <!-- 分页控件 -->
                                    </div>
                                </div>
                            </div>`;
                        
                        firstCategory = false;
                    }
                }
                
                detailsHTML += `
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <div class="row w-100">
                                        <div class="col-md-6 mb-2 mb-md-0">
                                            <button type="button" id="export-detail-data" class="btn btn-primary w-100">
                                                <i class="bi bi-download me-1"></i>导出订单明细
                                            </button>
                                        </div>
                                        <div class="col-md-6">
                                            <button type="button" class="btn btn-secondary w-100" data-bs-dismiss="modal">
                                                <i class="bi bi-x-circle me-1"></i>关闭
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                
                // 添加到文档并显示
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = detailsHTML;
                document.body.appendChild(tempDiv.firstElementChild);
                
                // 为每个类别初始化分页和数据
                const itemsPerDetailPage = 5; // 每页显示5条订单
                const categoryPagination = {};
                
                CATEGORY_ORDER.forEach(category => {
                    if (ordersByCategory[category] && ordersByCategory[category].length > 0) {
                        const categoryIdMap = {
                            '旺玥': 'wang',
                            '源悦': 'yuan',
                            '莼悦': 'chun',
                            '皇家': 'royal'
                        };
                        const categoryId = categoryIdMap[category] || category.toLowerCase();
                        
                        // 初始化分页状态
                        categoryPagination[categoryId] = {
                            currentPage: 1,
                            itemsPerPage: itemsPerDetailPage,
                            totalItems: ordersByCategory[category].length,
                            totalPages: Math.ceil(ordersByCategory[category].length / itemsPerDetailPage)
                        };
                        
                        // 计算类别总销售额
                        let categoryTotal = 0;
                        ordersByCategory[category].forEach(order => {
                            const saleInfo = extractSaleInfo(order.sale);
                            categoryTotal += parseFloat(saleInfo.price) || 0;
                        });
                        
                        // 更新总计金额
                        const totalElement = document.getElementById(`${categoryId}-total`);
                        if (totalElement) {
                            totalElement.textContent = `¥${categoryTotal.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                        }
                        
                        // 创建分页控件
                        createDetailPagination(categoryId, categoryPagination[categoryId]);
                        
                        // 显示第一页数据
                        displayOrdersForCategory(categoryId, ordersByCategory[category], 1, itemsPerDetailPage);
                    }
                });
                
                // 导出订单明细功能
                document.getElementById('export-detail-data').addEventListener('click', function() {
                    exportAnchorDetails(anchorName, ordersByCategory);
                });
                
                const detailsModal = new bootstrap.Modal(document.getElementById('anchor-details-modal'));
                detailsModal.show();
                
                // 添加事件处理程序，关闭后删除模态框
                document.getElementById('anchor-details-modal').addEventListener('hidden.bs.modal', function() {
                    document.body.removeChild(document.getElementById('anchor-details-modal'));
                });
            };
        }
        
        // 添加到报告按钮
        const addToReportBtn = document.getElementById('add-to-report-btn');
        if (addToReportBtn) {
            addToReportBtn.onclick = function() {
                // 显示添加成功的提示
                showNotice('success', `已将${anchorName}的销售数据添加到报告`);
                // 这里可以实现将当前数据添加到报告的逻辑
            };
        }
        
    
