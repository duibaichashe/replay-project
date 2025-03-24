/**
 * 销售数据与主播排班匹配分析系统 - 工具函数库
 * 此文件包含从app.js和pagination-enhancements.js中抽取的通用工具函数
 */

// 全局常量
const CATEGORY_ORDER = ['旺玥', '源悦', '莼悦', '皇家'];
const CATEGORY_ID_MAP = {
    '旺玥': 'wang',
    '源悦': 'yuan',
    '莼悦': 'chun',
    '皇家': 'royal'
};

// 反向映射（ID到名称）
const CATEGORY_NAME_MAP = {};
Object.keys(CATEGORY_ID_MAP).forEach(key => {
    CATEGORY_NAME_MAP[CATEGORY_ID_MAP[key]] = key;
});

/**
 * 时间处理工具函数
 */

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

// 从销售记录中提取日期
function extractSaleDate(sale) {
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

/**
 * 格式化工具函数
 */

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 产品分类工具函数
 */

// 按照商品类别对订单进行分类
function categorizeOrders(orders) {
    // 按照商品类别分组订单
    const ordersByCategory = {
        '旺玥': [],
        '源悦': [],
        '莼悦': [],
        '皇家': []
    };
    
    // 分类统计
    let categorizedCount = 0;
    
    orders.forEach(order => {
        if (!order || !order.sale) return;
        
        const saleInfo = window.extractSaleInfo ? window.extractSaleInfo(order.sale) : order.sale;
        const productName = typeof saleInfo === 'object' ? (saleInfo.product || '') : String(saleInfo);
        
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
    
    console.log(`成功分类${categorizedCount}/${orders.length}条订单`);
    
    return ordersByCategory;
}

// 查找指定主播指定类别的订单
function findAnchorCategoryOrders(anchorName, categoryId) {
    if (!window.analysisResults || !anchorName) {
        console.error('无法获取数据或主播名称');
        return [];
    }
    
    const categoryName = CATEGORY_NAME_MAP[categoryId] || categoryId;
    console.log(`查找主播 ${anchorName} 的 ${categoryName} 类别订单`);
    
    // 筛选该主播该类别的所有订单
    return window.analysisResults.filter(result => {
        // 检查主播是否匹配
        const resultAnchor = result.anchor;
        let isCurrentAnchor = false;
        
        if (typeof resultAnchor === 'string') {
            isCurrentAnchor = resultAnchor.trim() === anchorName;
        } else if (resultAnchor && resultAnchor.name) {
            isCurrentAnchor = resultAnchor.name === anchorName;
        }
        
        if (!isCurrentAnchor) return false;
        
        // 检查类别是否匹配
        const saleInfo = window.extractSaleInfo ? window.extractSaleInfo(result.sale) : {};
        const productName = saleInfo.product || '';
        return productName.includes(categoryName);
    });
}

/**
 * 通用工具函数
 */

// 检查元素是否存在
function elementExists(id) {
    return document.getElementById(id) !== null;
}

// 清空元素内容
function clearElement(element) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (element) {
        element.innerHTML = '';
    }
}

// 导出工具函数
window.utils = {
    // 常量
    CATEGORY_ORDER,
    CATEGORY_ID_MAP,
    CATEGORY_NAME_MAP,
    
    // 时间处理函数
    extractTimeSlot,
    standardizeTimeSlot,
    timeToMinutes,
    extractSaleDate,
    extractSaleTime,
    
    // 格式化函数
    formatFileSize,
    
    // 产品分类函数
    categorizeOrders,
    findAnchorCategoryOrders,
    
    // 通用工具
    elementExists,
    clearElement
}; 