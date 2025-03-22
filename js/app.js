// 全局变量声明
let salesData = null;  // 存储销售数据 
let scheduleData = null;  // 存储主播排班数据
let matchedResults = null;  // 存储匹配结果
let currentPage = 1;  // 当前页码
let itemsPerPage = 10;  // 每页显示条数
let availableScheduleDates = [];  // 可用的排班日期
let analysisResults = [];  // 分析结果

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
    
    // 初始化分析按钮
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', startAnalysis);
        console.log('已为分析按钮添加事件监听器');
    }
    
    // 初始化清除按钮
    if (clearBtn) {
        clearBtn.addEventListener('click', clearData);
        console.log('已为清除按钮添加事件监听器');
    }
    
    // 初始化导出按钮
    if (exportBtn) {
        exportBtn.addEventListener('click', exportResults);
        console.log('已为导出按钮添加事件监听器');
    }
    
    console.log('初始化完成');
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
                handleFileSelection(dropZone, file);
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
                handleFileSelection(dropZone, file);
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
                        `<div class="alert alert-success">已上传销售数据，共${salesData.length} 条记录</div>`;
                    console.log('销售数据加载成功', salesData.length);
                } else {
                    // 处理排班表数据
                    scheduleData = data;
                    document.getElementById(statusId).innerHTML = 
                        `<div class="alert alert-success">已上传排班表数据，共${data.length} 行</div>`;
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
    
    setTimeout(() => {
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
    }, 500);
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
    console.log("显示匹配结果...");
    const resultsSection = document.getElementById('results-section');
    const tableBody = document.getElementById('matching-table-body');
    const summaryDiv = document.getElementById('matching-summary');
    
    if (!resultsSection || !tableBody || !summaryDiv) {
        console.error("找不到显示结果所需的DOM元素");
        return;
    }
    
    // 重置分页计数器
    currentPage = 1;
    
    // 清空现有内容
    tableBody.innerHTML = '';
    summaryDiv.innerHTML = '';
    
    // 显示结果统计
    const matchedCount = results.filter(result => result.matched).length;
    const matchRate = ((matchedCount / results.length) * 100).toFixed(1);
    
    summaryDiv.innerHTML = `
        <div class="alert alert-info">
            <strong>匹配统计:</strong> 共 ${results.length} 条销售记录，成功匹配 ${matchedCount} 条 (匹配率: ${matchRate}%)
        </div>
    `;
    
    // 如果没有结果，显示提示
    if (results.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">未找到匹配结果</td></tr>';
        resultsSection.classList.remove('d-none');
        return;
    }
    
    // 对结果进行排序：未匹配的放在前面，然后是已匹配的
    const sortedResults = [...results].sort((a, b) => {
        // 优先排序依据：未匹配在前，已匹配在后
        if (a.matched && !b.matched) return 1;  // a已匹配，b未匹配，a排后面
        if (!a.matched && b.matched) return -1; // a未匹配，b已匹配，a排前面
        
        // 如果匹配状态相同，按日期和时间排序
        return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
    });
    
    // 将排序后的结果赋值给全局变量
    matchedResults = sortedResults;
    
    // 显示第一页数据
    displayResultsPage(matchedResults, currentPage);
    
    // 创建分页控制
    createPagination(matchedResults.length);
    
    // 显示结果区域
    resultsSection.classList.remove('d-none');
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
            // 显示匹配的主播名称
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
            <td class="align-middle text-center">${quantity || '-'}</td>
            <td class="align-middle text-end">${price ? '¥' + price : '-'}</td>
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
        
        // 清空输入框
        pageInput.value = '';
    }
}

// 更新分页按钮状态
function updatePaginationButtons(currentPage, totalPages) {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('pagination-info');
    
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