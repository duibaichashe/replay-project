/**
 * AI分析功能模块
 * 
 * 提供了AI辅助分析功能，包括设置配置、API调用和结果展示
 */

// 全局AI设置
let aiSettings = {
    apiUrl: '',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    useDemoMode: true
};

// 系统设置
let systemSettings = {
    timeTolerance: 15,
    itemsPerPage: 10,
    autoSaveResults: true
};

// AI分析结果
let aiAnalysisResults = {};

// 确保DOM加载完成后再初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('初始化AI分析功能...');
    initAIFeatures();
    
    // 确保模态框和Bootstrap组件正确初始化
    initBootstrapComponents();
});

/**
 * 初始化Bootstrap组件
 */
function initBootstrapComponents() {
    // 初始化系统设置模态框
    const settingsModalElement = document.getElementById('settings-modal');
    if (settingsModalElement) {
        // 为保存按钮添加事件监听器
        const saveButton = document.getElementById('save-settings');
        if (saveButton) {
            // 移除现有事件监听器以避免重复
            saveButton.removeEventListener('click', saveSettings);
            saveButton.addEventListener('click', saveSettings);
        }
        
        // 监听模态框显示事件
        settingsModalElement.addEventListener('shown.bs.modal', function() {
            console.log('系统设置模态框已显示');
        });
    }
}

/**
 * 初始化AI功能
 */
function initAIFeatures() {
    // 注意：此功能需要在基础分析完成后才能使用
    // 加载AI设置
    loadSettings();
    
    // 绑定AI设置表单事件
    bindSettingsEvents();
    
    // 绑定AI分析按钮事件
    bindAIAnalysisEvents();
    
    console.log('AI分析功能初始化完成');
}

/**
 * 加载设置
 */
function loadSettings() {
    try {
        // 从本地存储加载AI设置
        const savedAISettings = localStorage.getItem('aiSettings');
        if (savedAISettings) {
            aiSettings = JSON.parse(savedAISettings);
            
            // 填充AI设置表单
            document.getElementById('ai-api-url').value = aiSettings.apiUrl || '';
            document.getElementById('ai-api-key').value = aiSettings.apiKey || '';
            document.getElementById('ai-model').value = aiSettings.model || 'gpt-3.5-turbo';
            document.getElementById('use-demo-mode').checked = aiSettings.useDemoMode !== false;
            
            // 处理自定义模型
            if (aiSettings.model === 'custom' && aiSettings.customModel) {
                document.getElementById('custom-model').value = aiSettings.customModel;
                document.getElementById('custom-model-container').classList.remove('d-none');
            }
            
            // 根据演示模式显示/隐藏API测试区域
            const apiTestContainer = document.getElementById('api-test-container');
            if (apiTestContainer) {
                if (aiSettings.useDemoMode) {
                    apiTestContainer.classList.add('d-none');
                } else {
                    apiTestContainer.classList.remove('d-none');
                }
            }
            
            console.log('已加载AI设置:', aiSettings);
        }
        
        // 从本地存储加载系统设置
        const savedSystemSettings = localStorage.getItem('systemSettings');
        if (savedSystemSettings) {
            systemSettings = JSON.parse(savedSystemSettings);
            
            // 填充系统设置表单
            document.getElementById('time-tolerance').value = systemSettings.timeTolerance || 15;
            document.getElementById('items-per-page').value = systemSettings.itemsPerPage || 10;
            document.getElementById('auto-save-results').checked = systemSettings.autoSaveResults !== false;
            
            console.log('已加载系统设置:', systemSettings);
        }
    } catch (error) {
        console.error('加载设置时出错:', error);
    }
}

/**
 * 绑定设置表单事件
 */
function bindSettingsEvents() {
    // 模型选择变更
    const modelSelect = document.getElementById('ai-model');
    if (modelSelect) {
        modelSelect.addEventListener('change', function() {
            const customContainer = document.getElementById('custom-model-container');
            if (this.value === 'custom') {
                customContainer.classList.remove('d-none');
            } else {
                customContainer.classList.add('d-none');
            }
        });
    }
    
    // 演示模式切换
    const demoModeCheckbox = document.getElementById('use-demo-mode');
    if (demoModeCheckbox) {
        demoModeCheckbox.addEventListener('change', function() {
            const apiTestContainer = document.getElementById('api-test-container');
            if (this.checked) {
                apiTestContainer.classList.add('d-none');
            } else {
                apiTestContainer.classList.remove('d-none');
            }
        });
    }
    
    // API测试按钮
    const testApiButton = document.getElementById('test-api-connection');
    if (testApiButton) {
        testApiButton.addEventListener('click', testAPIConnection);
    }
    
    // 每页显示条数设置变更
    const itemsPerPageSelect = document.getElementById('items-per-page');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', function() {
            // 这里可以添加预览效果
            console.log('每页显示条数变更为:', this.value);
        });
    }
}

/**
 * 保存所有设置
 */
function saveSettings() {
    try {
        // 保存AI设置
        const apiUrl = document.getElementById('ai-api-url').value.trim();
        const apiKey = document.getElementById('ai-api-key').value.trim();
        const model = document.getElementById('ai-model').value;
        const useDemoMode = document.getElementById('use-demo-mode').checked;
        
        // 更新AI设置
        aiSettings = {
            apiUrl,
            apiKey,
            model,
            useDemoMode
        };
        
        // 处理自定义模型
        if (model === 'custom') {
            const customModel = document.getElementById('custom-model').value.trim();
            if (customModel) {
                aiSettings.customModel = customModel;
            }
        }
        
        // 保存到本地存储
        localStorage.setItem('aiSettings', JSON.stringify(aiSettings));
        
        // 保存系统设置
        const timeTolerance = parseInt(document.getElementById('time-tolerance').value) || 15;
        const itemsPerPage = parseInt(document.getElementById('items-per-page').value) || 10;
        const autoSaveResults = document.getElementById('auto-save-results').checked;
        
        // 更新系统设置
        systemSettings = {
            timeTolerance,
            itemsPerPage,
            autoSaveResults
        };
        
        // 保存到本地存储
        localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
        
        // 更新全局变量
        if (window.itemsPerPage !== undefined) {
            window.itemsPerPage = itemsPerPage;
            // 如果当前在查看结果页面，可以刷新分页
            if (window.matchedResults && window.matchedResults.length > 0) {
                // 如果存在刷新分页的函数则调用
                if (typeof window.refreshPagination === 'function') {
                    window.refreshPagination();
                }
            }
        }
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('settings-modal'));
        if (modal) {
            modal.hide();
        }
        
        // 显示保存成功消息
        showNotice('success', '设置已保存');
        
        console.log('设置已保存:', { aiSettings, systemSettings });
    } catch (error) {
        console.error('保存设置时出错:', error);
        showNotice('danger', '保存设置失败: ' + error.message);
    }
}

/**
 * 绑定AI分析按钮事件
 */
function bindAIAnalysisEvents() {
    // 只保留下方的开始AI分析按钮，移除右上角的按钮
    const startAnalysisBtn = document.getElementById('start-ai-analysis-btn');
    if (startAnalysisBtn) {
        startAnalysisBtn.addEventListener('click', startAIAnalysis);
    }
    
    // 导出分析结果按钮
    const exportButton = document.getElementById('export-ai-analysis-btn');
    if (exportButton) {
        exportButton.addEventListener('click', exportAIAnalysis);
    }
}

/**
 * 导出AI分析结果
 */
function exportAIAnalysis() {
    try {
        console.log('导出AI分析结果...');
        
        // 检查是否有分析结果
        if (!aiAnalysisResults || Object.keys(aiAnalysisResults).length === 0) {
            showNotice('warning', '没有可导出的分析结果');
            return;
        }
        
        // 调用导出报告函数
        exportAIAnalysisReport(aiAnalysisResults);
        
    } catch (error) {
        console.error('导出AI分析结果出错:', error);
        showNotice('danger', '导出失败: ' + error.message);
    }
}

/**
 * 开始AI分析
 */
async function startAIAnalysis() {
    try {
        console.log('开始AI分析...');
        
        // 显示加载提示
        showLoading('正在准备AI分析...');
        
        // 准备要分析的主播数据
        const anchorData = prepareAnchorDataForAI();
        
        // 确认是否有数据可分析
        if (Object.keys(anchorData).length === 0) {
            hideLoading();
            showNotice('warning', '请先进行基础数据分析，以便提取主播销售数据');
            return;
        }
        
        // 确保aiAnalysisResults已初始化
        if (!aiAnalysisResults) {
            aiAnalysisResults = {};
        }
        
        // 检查是否有已分析过的主播，如果有则排除已分析过的主播
        const analyzedAnchors = Object.keys(aiAnalysisResults);
        console.log('已分析的主播:', analyzedAnchors);
        
        // 过滤掉已分析的主播
        const remainingAnchors = {};
        Object.entries(anchorData).forEach(([name, data]) => {
            if (!analyzedAnchors.includes(name)) {
                remainingAnchors[name] = data;
            }
        });
        
        const totalRemaining = Object.keys(remainingAnchors).length;
        const totalAnchors = Object.keys(anchorData).length;
        
        console.log(`分析进度: 已分析 ${analyzedAnchors.length}/${totalAnchors} 位主播，剩余 ${totalRemaining} 位`);
        
        // 如果所有主播都已分析完毕，显示全部结果
        if (totalRemaining === 0) {
            hideLoading();
            showNotice('success', '所有主播已分析完毕');
            
            // 使用应急方法显示分析结果
            const lastAnalyzedAnchor = analyzedAnchors[analyzedAnchors.length - 1];
            if (lastAnalyzedAnchor && aiAnalysisResults[lastAnalyzedAnchor]) {
                displayAnalysisResult(aiAnalysisResults[lastAnalyzedAnchor]);
            }
            return;
        }
        
        try {
            // 取第一个未分析的主播 - 仅分析一个
            const nextAnchorName = Object.keys(remainingAnchors)[0];
            const nextAnchorData = {
                [nextAnchorName]: remainingAnchors[nextAnchorName]
            };
            
            console.log(`准备分析下一个主播: ${nextAnchorName}`);
            
            let results;
            
            // 根据模式选择AI分析方法
            if (aiSettings.useDemoMode) {
                // 演示模式使用本地模拟数据
                console.log('使用演示模式进行AI分析');
                results = await performDemoAIAnalysis(nextAnchorData);
            } else {
                // 真实模式调用AI API
                console.log('使用真实API模式进行AI分析');
                results = await performRealAIAnalysis(nextAnchorData);
            }
            
            // 将新分析结果合并到全局结果中
            aiAnalysisResults = { ...aiAnalysisResults, ...results };
            console.log('更新全局分析结果:', Object.keys(aiAnalysisResults));
            
            // 显示成功消息 - 虽然在上面的方法中也显示，这里再确保一下
            if (results && Object.keys(results).length > 0) {
                showNotice('success', `已完成主播 ${nextAnchorName} 的分析`);
            }
            
            // 确保隐藏加载提示
            hideLoading();
            
        } catch (error) {
            console.error('AI分析出错:', error);
            hideLoading();
            showNotice('danger', `AI分析失败: ${error.message}`);
        }
        
    } catch (error) {
        console.error('准备AI分析出错:', error);
        hideLoading();
        showNotice('danger', `准备AI分析失败: ${error.message}`);
    }
}

/**
 * 准备要发送给AI的主播数据
 */
function prepareAnchorDataForAI() {
    const anchorData = {};
    
    try {
        console.log('开始准备主播数据...');
        console.log('数据检查：', {
            matchedResults: window.matchedResults ? window.matchedResults.length : '未加载',
            anchorMonthlyMap: window.anchorMonthlyMap ? Object.keys(window.anchorMonthlyMap).length : '未加载',
            productCategoryAnalysis: window.productCategoryAnalysis ? Object.keys(window.productCategoryAnalysis).length : '未加载'
        });
        
        // 优先使用matchedResults处理每个主播的销售数据
        if (window.matchedResults && window.matchedResults.length > 0) {
            // 首先按主播分组所有订单
            const anchorOrderMap = {};
            
            window.matchedResults.forEach(result => {
                if (!result || !result.matched || !result.anchor) return;
                
                // 提取主播名称
                let anchorName;
                if (typeof result.anchor === 'object' && result.anchor.name) {
                    anchorName = result.anchor.name.toString().trim();
                } else if (typeof result.anchor === 'string') {
                    anchorName = result.anchor.trim();
                } else {
                    return;
                }
                
                // 初始化主播数据
                if (!anchorOrderMap[anchorName]) {
                    anchorOrderMap[anchorName] = [];
                }
                
                // 添加订单到主播
                anchorOrderMap[anchorName].push(result);
            });
            
            // 处理每个主播的订单
            Object.entries(anchorOrderMap).forEach(([anchorName, orders]) => {
                // 初始化主播数据
                anchorData[anchorName] = {
                    name: anchorName,
                    salesData: {
                        totalSales: 0,
                        totalOrders: orders.length,
                        brandStats: {
                            源悦: { orders: 0, amount: 0 },
                            莼悦: { orders: 0, amount: 0 },
                            旺玥: { orders: 0, amount: 0 },
                            皇家: { orders: 0, amount: 0 }
                        }
                    },
                    orderCount: orders.length,
                    productCount: 0
                };
                
                // 统计不重复的产品
                const productSet = new Set();
                
                // 处理每个订单
                orders.forEach(order => {
                    if (!order.sale) return;
                    
                    const saleInfo = extractSaleInfo(order.sale);
                    const productName = saleInfo.product || '';
                    const price = parseFloat(saleInfo.price) || 0;
                    
                    // 添加产品到集合
                    if (productName && productName !== '-') {
                        productSet.add(productName);
                    }
                    
                    // 确定品牌
                    let brand = 'other';
                    if (productName.includes('源悦')) {
                        brand = '源悦';
                    } else if (productName.includes('莼悦')) {
                        brand = '莼悦';
                    } else if (productName.includes('旺玥')) {
                        brand = '旺玥';
                    } else if (productName.includes('皇家') && !productName.includes('莼悦') && !productName.includes('旺玥') && !productName.includes('源悦')) {
                        brand = '皇家';
                    }
                    
                    // 更新品牌统计
                    if (anchorData[anchorName].salesData.brandStats[brand]) {
                        anchorData[anchorName].salesData.brandStats[brand].orders++;
                        anchorData[anchorName].salesData.brandStats[brand].amount += price;
                    }
                    
                    // 更新总销售额
                    anchorData[anchorName].salesData.totalSales += price;
                });
                
                // 更新产品数量
                anchorData[anchorName].productCount = productSet.size;
                
                // 添加工作时长数据
                if (typeof calculateAnchorWorkHours === 'function') {
                    const workHours = calculateAnchorWorkHours(anchorName);
                    if (workHours && workHours !== '-') {
                        anchorData[anchorName].workHours = parseFloat(workHours);
                    }
                }
                
                // 如果有主播月度资料数据，添加到分析数据中
                if (window.anchorMonthlyMap && window.anchorMonthlyMap[anchorName]) {
                    const monthlyData = window.anchorMonthlyMap[anchorName];
                    
                    // 添加月度指标
                    anchorData[anchorName].monthlyMetrics = {};
                    
                    // 复制所有数据
                    Object.entries(monthlyData).forEach(([key, value]) => {
                        // 排除复杂对象和函数
                        if (typeof value !== 'object' && typeof value !== 'function') {
                            anchorData[anchorName].monthlyMetrics[key] = value;
                        }
                    });
                }
            });
        } 
        // 如果没有matchedResults但是有productCategoryAnalysis，使用备选方法
        else if (window.productCategoryAnalysis) {
            console.log('使用productCategoryAnalysis数据作为备选');
            
            Object.entries(window.productCategoryAnalysis).forEach(([anchorName, categoryData]) => {
                // 排除非对象数据
                if (typeof categoryData !== 'object' || categoryData === null) return;
                
                // 计算总销售额
                let totalSales = 0;
                
                // 创建品牌统计数据
                const brandStats = {
                    源悦: { orders: 0, amount: 0 },
                    莼悦: { orders: 0, amount: 0 },
                    旺玥: { orders: 0, amount: 0 },
                    皇家: { orders: 0, amount: 0 }
                };
                
                // 提取各品牌销售额
                if (categoryData['源悦']) {
                    brandStats['源悦'].amount = parseFloat(categoryData['源悦']) || 0;
                    totalSales += brandStats['源悦'].amount;
                }
                
                if (categoryData['莼悦']) {
                    brandStats['莼悦'].amount = parseFloat(categoryData['莼悦']) || 0;
                    totalSales += brandStats['莼悦'].amount;
                }
                
                if (categoryData['旺玥']) {
                    brandStats['旺玥'].amount = parseFloat(categoryData['旺玥']) || 0;
                    totalSales += brandStats['旺玥'].amount;
                }
                
                if (categoryData['皇家']) {
                    brandStats['皇家'].amount = parseFloat(categoryData['皇家']) || 0;
                    totalSales += brandStats['皇家'].amount;
                }
                
                // 假设订单数量，根据销售额估算
                const estimatedOrders = Math.max(1, Math.round(totalSales / 1000));
                
                // 分配订单数量到各品牌
                Object.keys(brandStats).forEach(brand => {
                    if (brandStats[brand].amount > 0 && totalSales > 0) {
                        brandStats[brand].orders = Math.max(1, Math.round((brandStats[brand].amount / totalSales) * estimatedOrders));
                    }
                });
                
                // 创建主播数据
                anchorData[anchorName] = {
                    name: anchorName,
                    salesData: {
                        totalSales: totalSales,
                        totalOrders: estimatedOrders,
                        brandStats: brandStats
                    },
                    orderCount: estimatedOrders,
                    productCount: Object.values(brandStats).filter(b => b.amount > 0).length
                };
                
                // 添加工作时长数据
                if (typeof calculateAnchorWorkHours === 'function') {
                    const workHours = calculateAnchorWorkHours(anchorName);
                    if (workHours && workHours !== '-') {
                        anchorData[anchorName].workHours = parseFloat(workHours);
                    }
                }
                
                // 如果有主播月度资料数据，添加到分析数据中
                if (window.anchorMonthlyMap && window.anchorMonthlyMap[anchorName]) {
                    const monthlyData = window.anchorMonthlyMap[anchorName];
                    
                    // 添加月度指标
                    anchorData[anchorName].monthlyMetrics = {};
                    
                    // 复制所有数据
                    Object.entries(monthlyData).forEach(([key, value]) => {
                        // 排除复杂对象和函数
                        if (typeof value !== 'object' && typeof value !== 'function') {
                            anchorData[anchorName].monthlyMetrics[key] = value;
                        }
                    });
                }
            });
        }
        
        console.log('已准备主播数据用于AI分析:', Object.keys(anchorData).length, '位主播');
        console.log('主播数据详情:', anchorData);
        return anchorData;
        
    } catch (error) {
        console.error('准备AI分析数据时出错:', error);
        throw new Error(`准备分析数据出错: ${error.message}`);
    }
}

/**
 * 演示模式 - 模拟AI分析
 */
async function performDemoAIAnalysis(anchorData) {
    try {
        console.log('使用演示模式进行AI分析');
        
        // 模拟网络延迟，让用户感觉到这是一个真实的AI处理过程
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 创建结果对象
        const results = {};
        
        // 获取要分析的第一个主播
        const anchorEntries = Object.entries(anchorData);
        if (anchorEntries.length === 0) {
            hideLoading();
            showNotice('warning', '没有找到可分析的主播数据');
            return results;
        }
        
        // 获取第一个要分析的主播
        const [anchorName, data] = anchorEntries[0];
        console.log(`演示模式分析主播: ${anchorName}`);
        showNotice('info', `正在分析主播: ${anchorName} (演示模式)`);
        
        // 调用通用的AI分析引擎来生成结果
        const analysisResult = generateDynamicAnalysis(anchorName, data);
        
        // 保存结果
        results[anchorName] = {
            name: anchorName,
            summary: analysisResult.summary,
            analysis: analysisResult.analysis,
            data: data,
            timestamp: new Date().toISOString()
        };
        
        // 输出分析结果到控制台
        console.log(`主播 ${anchorName} 分析完成(演示模式):`, results[anchorName]);
        
        // 显示完成通知
        showNotice('success', `已完成主播 ${anchorName} 的分析（演示模式）`);
        
        // 强制直接显示结果到DOM
        displayAnalysisResult(results[anchorName]);
        
        // 隐藏加载提示
        hideLoading();
        
        return results;
        
    } catch (error) {
        console.error('演示模式分析出错:', error);
        hideLoading();
        showNotice('warning', `演示模式分析出错: ${error.message}`);
        return {};
    }
}

/**
 * 演示模式 - 生成动态分析结果
 */
function generateDynamicAnalysis(anchorName, data) {
    // 准备基础数据
    const totalSales = data.salesData.totalSales || 0;
    const orderCount = data.orderCount || 0;
    const productCount = data.productCount || 0;
    const workHours = data.workHours || 0;
    
    // 设置变量来存储分析结果
    let summary = '';
    let analysis = '';
    const metrics = [];
    
    try {
        // 开始分析
        analysis = `## ${anchorName} 销售绩效分析\n\n`;
        
        // 分析总体销售情况
        analysis += `### 1. 销售绩效评估\n\n`;
        
        if (totalSales > 0) {
            // 销售额评估
            if (totalSales > 50000) {
                analysis += `主播${anchorName}的总销售额达到了¥${totalSales.toLocaleString('zh-CN')}，表现出色。`;
                metrics.push('销售额出色');
            } else if (totalSales > 10000) {
                analysis += `主播${anchorName}的总销售额为¥${totalSales.toLocaleString('zh-CN')}，表现良好。`;
                metrics.push('销售额良好');
            } else {
                analysis += `主播${anchorName}的总销售额为¥${totalSales.toLocaleString('zh-CN')}，有提升空间。`;
                metrics.push('销售额有待提升');
            }
            
            // 加入订单信息
            if (orderCount > 0) {
                const avgOrderValue = totalSales / orderCount;
                analysis += ` 共成交${orderCount}单，平均客单价为¥${avgOrderValue.toLocaleString('zh-CN', {maximumFractionDigits: 0})}。`;
                
                if (avgOrderValue > 3000) {
                    analysis += ` 客单价较高，表明销售了高价值产品。`;
                    metrics.push('高客单价');
                } else if (avgOrderValue < 800) {
                    analysis += ` 客单价偏低，可以考虑提高高价值产品的销售比例。`;
                    metrics.push('客单价偏低');
                }
            }
            
            analysis += '\n\n';
            
            // 分析品牌销售分布
            analysis += `**品牌销售分布：**\n\n`;
            let brandDistribution = '';
            
            // 遍历所有品牌
            Object.entries(data.salesData.brandStats).forEach(([brand, stats]) => {
                if (stats.orders > 0) {
                    const percentage = (stats.amount / totalSales * 100).toFixed(1);
                    brandDistribution += `- ${brand}：${stats.orders}单，销售额¥${stats.amount.toLocaleString('zh-CN')}（${percentage}%）\n`;
                }
            });
            
            if (brandDistribution) {
                analysis += brandDistribution + '\n';
            } else {
                analysis += '未能识别具体品牌销售数据\n\n';
            }
            
            // 找到销售额最高的品牌
            const topBrand = Object.entries(data.salesData.brandStats)
                .filter(([brand, stats]) => stats.orders > 0)
                .sort((a, b) => b[1].amount - a[1].amount)[0];
                
            if (topBrand) {
                const [brandName, stats] = topBrand;
                const percentage = (stats.amount / totalSales * 100).toFixed(1);
                analysis += `主播在${brandName}品牌的表现最为突出，占总销售额的${percentage}%。`;
                
                // 分析品牌集中度
                if (percentage > 80) {
                    analysis += ` 但销售过于集中在单一品牌，建议适当扩展其他品牌的销售。`;
                    metrics.push('品牌集中度过高');
                } else if (percentage < 40) {
                    analysis += ` 主播销售的品牌较为分散，没有明显的专注点。`;
                    metrics.push('品牌分散');
                }
                
                analysis += '\n\n';
            }
            
            // 分析效率
            if (workHours > 0) {
                const salesPerHour = totalSales / workHours;
                analysis += `**效率分析：** 主播直播时长约${workHours}小时，平均每小时销售额为¥${salesPerHour.toLocaleString('zh-CN', {maximumFractionDigits: 0})}。`;
                
                if (salesPerHour > 5000) {
                    analysis += ` 销售效率很高，说明主播能够有效转化流量。`;
                    metrics.push('高销售效率');
                } else if (salesPerHour < 1000) {
                    analysis += ` 销售效率有待提高，建议优化直播内容和销售技巧。`;
                    metrics.push('销售效率低');
                }
                
                analysis += '\n\n';
            }
        } else {
            analysis += `主播${anchorName}暂无销售数据或数据异常，无法进行深入分析。\n\n`;
        }
        
        // 优势与不足分析
        analysis += `### 2. 优势与不足\n\n`;
        
        // 根据收集的指标生成优势
        const strengths = [];
        if (metrics.includes('销售额出色') || metrics.includes('销售额良好')) {
            strengths.push('销售能力强');
        }
        if (metrics.includes('高客单价')) {
            strengths.push('善于销售高价值产品');
        }
        if (metrics.includes('高销售效率')) {
            strengths.push('直播转化效率高');
        }
        
        // 如果没有找到明确优势，添加一些通用优势
        if (strengths.length === 0) {
            if (productCount > 5) {
                strengths.push('能够销售多种产品');
            }
            if (orderCount > 10) {
                strengths.push('有一定的成交能力');
            }
        }
        
        // 生成优势文本
        if (strengths.length > 0) {
            analysis += `**优势：**\n\n`;
            strengths.forEach(strength => {
                analysis += `- ${strength}\n`;
            });
            analysis += '\n';
        }
        
        // 根据收集的指标生成不足
        const weaknesses = [];
        if (metrics.includes('销售额有待提升')) {
            weaknesses.push('整体销售表现不足');
        }
        if (metrics.includes('客单价偏低')) {
            weaknesses.push('客单价较低，高价值产品销售不足');
        }
        if (metrics.includes('销售效率低')) {
            weaknesses.push('直播时间利用效率不高');
        }
        if (metrics.includes('品牌集中度过高')) {
            weaknesses.push('品牌销售过于单一，缺乏多元化');
        }
        if (metrics.includes('品牌分散')) {
            weaknesses.push('缺乏明确的专注点，品牌定位不清晰');
        }
        
        // 如果没有找到明确劣势，添加一些改进点
        if (weaknesses.length === 0) {
            if (productCount < 3) {
                weaknesses.push('产品多样性不足');
            }
            if (orderCount < 5) {
                weaknesses.push('成交单数较少');
            }
        }
        
        // 生成不足文本
        if (weaknesses.length > 0) {
            analysis += `**不足：**\n\n`;
            weaknesses.forEach(weakness => {
                analysis += `- ${weakness}\n`;
            });
            analysis += '\n';
        }
        
        // 改进建议
        analysis += `### 3. 改进建议\n\n`;
        
        // 根据不足生成改进建议
        const suggestions = [];
        
        if (weaknesses.includes('整体销售表现不足')) {
            suggestions.push('加强产品知识培训，提高产品讲解的专业性和说服力');
            suggestions.push('优化直播间标题和封面，提高点击率');
        }
        
        if (weaknesses.includes('客单价偏低，高价值产品销售不足')) {
            suggestions.push('调整产品结构，增加高价值产品的展示和推荐频次');
            suggestions.push('学习高单价产品的销售话术和成交技巧');
        }
        
        if (weaknesses.includes('直播时间利用效率不高')) {
            suggestions.push('优化直播时间规划，将重点产品安排在流量高峰期');
            suggestions.push('提高互动环节的转化效率，减少无效内容');
        }
        
        if (weaknesses.includes('品牌销售过于单一，缺乏多元化')) {
            suggestions.push('适当扩展其他品牌的销售，降低单一品牌依赖风险');
            suggestions.push('尝试交叉销售不同品牌的互补产品');
        }
        
        if (weaknesses.includes('缺乏明确的专注点，品牌定位不清晰')) {
            suggestions.push('明确个人定位，选择2-3个擅长品牌重点发展');
            suggestions.push('打造与特定品牌关联的个人专业形象');
        }
        
        // 如果建议不足，添加通用建议
        if (suggestions.length < 3) {
            suggestions.push('增加粉丝互动环节，提高粉丝黏性和活跃度');
            suggestions.push('定期分析销售数据，找出最佳销售时段和产品类型');
            suggestions.push('建立售后回访机制，增加复购率');
        }
        
        // 限制建议数量在3-5个
        const finalSuggestions = suggestions.slice(0, Math.min(5, Math.max(3, suggestions.length)));
        
        // 生成建议文本
        finalSuggestions.forEach((suggestion, index) => {
            analysis += `${index + 1}. ${suggestion}\n`;
        });
        
        analysis += '\n';
        
        // 总结
        analysis += `### 4. 总结\n\n`;
        
        // 生成总结
        let summaryText = `主播${anchorName}`;
        
        if (totalSales > 50000) {
            summaryText += `销售业绩表现优秀，`;
        } else if (totalSales > 10000) {
            summaryText += `销售业绩表现良好，`;
        } else {
            summaryText += `销售业绩有提升空间，`;
        }
        
        if (strengths.length > 0) {
            summaryText += `优势在于${strengths[0]}，`;
        }
        
        if (weaknesses.length > 0) {
            summaryText += `需要改进的是${weaknesses[0]}。`;
        }
        
        if (finalSuggestions.length > 0) {
            summaryText += `建议${finalSuggestions[0].toLowerCase()}，以提升整体销售表现。`;
        }
        
        analysis += summaryText;
        
        // 设置简短总结
        summary = summaryText;
        
    } catch (error) {
        console.error('生成动态分析时出错:', error);
        summary = `无法为主播${anchorName}生成完整分析`;
        analysis = `生成分析时出错: ${error.message}`;
    }
    
    return {
        summary,
        analysis
    };
}

/**
 * 分析月度指标数据
 */
function analyzeMonthlyMetrics(monthlyMetrics) {
    let analysis = '';
    const metrics = [];
    const insights = [];
    const suggestions = [];
    
    // 分析粉丝数据
    if (monthlyMetrics['粉丝数']) {
        const fansCount = parseFloat(monthlyMetrics['粉丝数']);
        analysis += `主播目前拥有${monthlyMetrics['粉丝数']}名粉丝，`;
        
        if (fansCount > 10000) {
            metrics.push(`粉丝数量丰富(${monthlyMetrics['粉丝数']})`);
            insights.push(`拥有较大粉丝基础，具备良好的销售潜力`);
        } else if (fansCount > 5000) {
            metrics.push(`粉丝数量中等(${monthlyMetrics['粉丝数']})`);
        } else {
            metrics.push(`粉丝数量较少(${monthlyMetrics['粉丝数']})`);
            insights.push(`粉丝基础有待扩大`);
            suggestions.push(`增加粉丝获取渠道，考虑通过短视频等内容扩大粉丝基础`);
        }
    }
    
    // 分析互动率
    if (monthlyMetrics['互动率']) {
        analysis += `粉丝互动率为${monthlyMetrics['互动率']}。`;
        
        const interactionRate = parseFloat(monthlyMetrics['互动率']);
        if (!isNaN(interactionRate)) {
            if (interactionRate < 2) {
                metrics.push(`互动率偏低(${monthlyMetrics['互动率']})`);
                insights.push(`用户互动参与度较低，影响直播氛围`);
                suggestions.push(`增加互动环节，如有奖问答、抽奖等，提高观众参与热情`);
            } else if (interactionRate > 5) {
                metrics.push(`互动率优秀(${monthlyMetrics['互动率']})`);
                insights.push(`用户互动活跃，直播氛围良好`);
            } else {
                metrics.push(`互动率一般(${monthlyMetrics['互动率']})`);
            }
        }
    }
    
    // 分析转化率
    if (monthlyMetrics['转化率']) {
        analysis += `\n\n转化率为${monthlyMetrics['转化率']}，`;
        
        const conversionRate = parseFloat(monthlyMetrics['转化率']);
        if (!isNaN(conversionRate)) {
            if (conversionRate < 1) {
                metrics.push(`转化率偏低(${monthlyMetrics['转化率']})`);
                insights.push(`购买转化存在瓶颈，影响销售效果`);
                suggestions.push(`优化产品讲解和促销方式，强化产品价值传递`);
            } else if (conversionRate > 3) {
                metrics.push(`转化率优秀(${monthlyMetrics['转化率']})`);
                insights.push(`销售话术和策略有效，转化能力强`);
            } else {
                metrics.push(`转化率一般(${monthlyMetrics['转化率']})`);
            }
        }
    }
    
    // 分析留存率
    if (monthlyMetrics['留存率']) {
        analysis += `\n\n观众留存率为${monthlyMetrics['留存率']}，`;
        
        const retentionRate = parseFloat(monthlyMetrics['留存率']);
        if (!isNaN(retentionRate)) {
            if (retentionRate < 40) {
                metrics.push(`留存率偏低(${monthlyMetrics['留存率']})`);
                insights.push(`观众忠诚度不足，回访率低`);
                suggestions.push(`提升内容质量与稳定性，建立直播计划表增强用户黏性`);
            } else if (retentionRate > 70) {
                metrics.push(`留存率优秀(${monthlyMetrics['留存率']})`);
                insights.push(`观众忠诚度高，具有稳定的用户基础`);
            } else {
                metrics.push(`留存率一般(${monthlyMetrics['留存率']})`);
            }
        }
    }
    
    // 分析其他月度指标（动态处理所有存在的指标）
    Object.entries(monthlyMetrics).forEach(([key, value]) => {
        // 跳过已处理的指标
        if (['粉丝数', '互动率', '转化率', '留存率'].includes(key)) {
            return;
        }
        
        // 检查是否为数值型指标
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            analysis += `\n\n${key}为${value}。`;
            metrics.push(`${key}: ${value}`);
        }
    });
    
    return {
        analysis,
        metrics,
        insights,
        suggestions
    };
}

/**
 * 真实模式 - 调用AI API进行分析
 */
async function performRealAIAnalysis(anchorData) {
    try {
        console.log('使用真实API进行AI分析');
        
        // 检查AI设置
        if (!aiSettings.apiUrl || !aiSettings.apiKey) {
            throw new Error('未配置AI API接口信息，请先在设置中配置API');
        }
        
        // 创建结果对象
        const results = {};
        
        // 获取要分析的第一个主播
        const anchorEntries = Object.entries(anchorData);
        if (anchorEntries.length === 0) {
            hideLoading();
            showNotice('warning', '没有找到可分析的主播数据');
            return results;
        }
        
        // 获取第一个要分析的主播
        const [anchorName, data] = anchorEntries[0];
        console.log(`正在分析主播: ${anchorName}`);
        showNotice('info', `正在分析主播: ${anchorName}`);
        
        try {
            // 构建提示信息
            const prompt = generateAIPrompt(anchorName, data);
            
            // 调用API
            const aiResult = await callAIAPI(prompt);
            
            // 处理主播结果
            results[anchorName] = {
                name: anchorName,
                summary: aiResult.summary || '无法生成摘要',
                analysis: aiResult.analysis || '无法生成分析',
                data: data,
                timestamp: new Date().toISOString()
            };
            
            // 输出分析结果到控制台
            console.log(`主播 ${anchorName} 分析完成:`, results[anchorName]);
            
            // 显示完成通知
            showNotice('success', `已完成主播 ${anchorName} 的分析`);
            
            // 强制直接显示结果到DOM
            displayAnalysisResult(results[anchorName]);
            
            // 隐藏加载提示
            hideLoading();
            
        } catch (error) {
            console.error(`分析主播 ${anchorName} 时出错:`, error);
            showNotice('warning', `分析主播 ${anchorName} 时出错: ${error.message}`);
            
            // 记录错误但仍显示
            results[anchorName] = {
                name: anchorName,
                summary: `分析出错: ${error.message}`,
                analysis: `无法完成分析，发生错误: ${error.message}`,
                data: data,
                timestamp: new Date().toISOString(),
                error: true
            };
            
            // 强制显示错误结果
            displayAnalysisResult(results[anchorName]);
            hideLoading();
        }
        
        return results;
        
    } catch (error) {
        console.error('调用AI API进行分析时出错:', error);
        hideLoading();
        throw error;
    }
}

/**
 * 直接在页面显示分析结果（应急方法）
 */
function displayAnalysisResult(result) {
    console.log('使用应急方法显示分析结果');
    
    // 先尝试获取现有容器
    let container = document.getElementById('ai-analysis-container');
    
    // 如果找不到容器，尝试找到父元素并创建容器
    if (!container) {
        console.log('找不到ai-analysis-container，尝试在页面中创建');
        
        // 尝试找到内容区域
        let contentArea = document.querySelector('.tab-content') || 
                          document.querySelector('.content-area') || 
                          document.querySelector('.main-content');
        
        if (!contentArea) {
            console.log('找不到合适的父容器，直接在body中创建');
            contentArea = document.body;
        }
        
        // 创建容器
        container = document.createElement('div');
        container.id = 'ai-analysis-container';
        container.className = 'ai-analysis-section mt-4 p-3 border rounded';
        contentArea.appendChild(container);
        console.log('已创建AI分析容器');
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 预处理分析内容，优化显示效果
    let analysisContent = result.analysis || '';
    
    // 创建结果HTML
    const resultHtml = `
        <div class="analysis-result p-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4>主播"${result.name}"的AI分析结果</h4>
                <button id="next-anchor-analysis-btn" class="btn btn-sm btn-primary">
                    分析下一位主播
                </button>
            </div>
            
            <div class="alert alert-info mb-3">
                <h5>分析摘要</h5>
                <p>${result.summary}</p>
            </div>
            
            <div class="card mb-3">
                <div class="card-header">详细分析</div>
                <div class="card-body analysis-content">
                    ${renderMarkdown(analysisContent)}
                </div>
            </div>
            
            <div class="text-muted mb-3">
                <small>分析时间: ${new Date(result.timestamp).toLocaleString('zh-CN')}</small>
            </div>
        </div>
    `;
    
    // 添加到容器
    container.innerHTML = resultHtml;
    
    // 确保容器在页面上可见
    container.style.display = 'block';
    if (container.classList.contains('d-none')) {
        container.classList.remove('d-none');
    }
    
    // 尝试找到对应的标签页，激活它
    try {
        const tabElement = document.querySelector('[data-bs-target="#ai-analysis-container"]') ||
                          document.querySelector('[href="#ai-analysis-container"]') ||
                          document.getElementById('ai-analysis-tab');
        
        if (tabElement && typeof bootstrap !== 'undefined') {
            const tab = new bootstrap.Tab(tabElement);
            tab.show();
            console.log('已激活AI分析标签页');
        }
    } catch (error) {
        console.warn('无法激活AI分析标签页:', error);
    }
    
    // 绑定"分析下一位主播"按钮的事件
    const nextButton = document.getElementById('next-anchor-analysis-btn');
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            console.log('用户请求分析下一位主播');
            startAIAnalysis();
        });
    }

    // 添加额外的初始化逻辑，确保内容正确显示
    setTimeout(() => {
        // 检查并修复可能的显示问题
        const contentDivs = document.querySelectorAll('.analysis-content');
        contentDivs.forEach(div => {
            // 如果内容中有未处理的转义字符，尝试再次处理
            if (div.innerHTML.includes('\\n')) {
                const fixedContent = div.innerHTML
                    .replace(/\\n/g, '<br>')
                    .replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\');
                div.innerHTML = fixedContent;
            }
        });
    }, 100);
}

/**
 * 显示单个主播分析结果
 */
function showSingleAnchorResult(result) {
    // 获取AI分析容器
    const container = document.getElementById('ai-analysis-container');
    if (!container) {
        console.error('找不到AI分析容器，无法显示结果');
        return;
    }
    
    // 清空现有内容
    container.innerHTML = '';
    
    // 预处理分析内容，优化显示效果
    let analysisContent = result.analysis || '';
    
    // 创建单个主播分析结果的UI
    const resultHtml = `
        <div class="single-result-container p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4>主播"${result.name}"的AI分析结果</h4>
                <button id="next-anchor-btn" class="btn btn-primary">
                    分析下一位主播
                </button>
            </div>
            
            <div class="alert alert-info mb-4">
                <h5>分析摘要</h5>
                <p>${result.summary}</p>
            </div>
            
            <div class="card mb-4">
                <div class="card-header bg-light">
                    <strong>详细分析</strong>
                </div>
                <div class="card-body">
                    <div class="analysis-content">
                        ${renderMarkdown(analysisContent)}
                    </div>
                </div>
            </div>
            
            <div class="text-muted mt-2">
                <small>分析时间: ${new Date(result.timestamp).toLocaleString('zh-CN')}</small>
            </div>
        </div>
    `;
    
    // 添加到容器
    container.innerHTML = resultHtml;
    
    // 绑定下一位主播按钮事件
    const nextButton = document.getElementById('next-anchor-btn');
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            console.log('用户请求分析下一位主播');
            startAIAnalysis();
        });
    }

    // 添加额外的初始化逻辑，确保内容正确显示
    setTimeout(() => {
        // 检查并修复可能的显示问题
        const contentDivs = document.querySelectorAll('.analysis-content');
        contentDivs.forEach(div => {
            // 如果内容中有未处理的转义字符，尝试再次处理
            if (div.innerHTML.includes('\\n')) {
                const fixedContent = div.innerHTML
                    .replace(/\\n/g, '<br>')
                    .replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\');
                div.innerHTML = fixedContent;
            }
        });
    }, 100);
}

/**
 * 生成AI提示
 */
function generateAIPrompt(anchorName, data) {
    // 提取必要的数据
    const { salesData, orderCount, productCount, workHours, monthlyMetrics } = data;
    const { totalSales, totalOrders, brandStats } = salesData || {};
    
    // 确保数据格式化
    const formattedSales = totalSales ? totalSales.toFixed(2) : 0;
    const formattedWorkHours = workHours || 0;
    
    // 构建提示内容
    let promptContent = `请对主播"${anchorName}"的销售表现进行专业分析并提供改进建议。\n\n`;
    
    // 添加销售数据
    promptContent += "### 销售数据摘要\n";
    promptContent += `- 总销售额: ¥${formattedSales}\n`;
    promptContent += `- 总订单数: ${totalOrders || 0}\n`;
    promptContent += `- 产品种类数: ${productCount || 0}\n`;
    promptContent += `- 直播工时: ${formattedWorkHours}小时\n\n`;
    
    // 添加品牌销售数据
    promptContent += "### 品牌销售情况\n";
    if (brandStats) {
        Object.entries(brandStats).forEach(([brand, stats]) => {
            if (stats.amount > 0 || stats.orders > 0) {
                promptContent += `- ${brand}: ¥${stats.amount.toFixed(2)}, ${stats.orders}个订单\n`;
            }
        });
    }
    promptContent += "\n";
    
    // 如果有月度指标数据，添加到提示
    if (monthlyMetrics && Object.keys(monthlyMetrics).length > 0) {
        promptContent += "### 主播月度指标\n";
        
        if (monthlyMetrics.fans) promptContent += `- 粉丝数: ${monthlyMetrics.fans}\n`;
        if (monthlyMetrics.conversionRate) promptContent += `- 转化率: ${monthlyMetrics.conversionRate}%\n`;
        if (monthlyMetrics.averageViewers) promptContent += `- 平均观看人数: ${monthlyMetrics.averageViewers}\n`;
        if (monthlyMetrics.totalLiveHours) promptContent += `- 月直播时长: ${monthlyMetrics.totalLiveHours}小时\n`;
        if (monthlyMetrics.averageOrderValue) promptContent += `- 客单价: ¥${monthlyMetrics.averageOrderValue}\n`;
        if (monthlyMetrics.giftValue) promptContent += `- 礼物收入: ¥${monthlyMetrics.giftValue}\n`;
        if (monthlyMetrics.engagementRate) promptContent += `- 互动率: ${monthlyMetrics.engagementRate}%\n`;
        if (monthlyMetrics.responseRate) promptContent += `- 响应率: ${monthlyMetrics.responseRate}%\n`;
        
        promptContent += "\n";
    }
    
    // 添加分析指导和要求
    promptContent += "### 分析要求\n";
    promptContent += "1. 请对以上数据进行深入分析，评估该主播的销售表现\n";
    promptContent += "2. 识别主播的优势和不足\n";
    promptContent += "3. 提供专业的改进建议和可执行的策略\n";
    promptContent += "4. 专注于如何提高销售额、转化率和客单价\n\n";
    
    // 明确要求返回JSON格式
    promptContent += "### 返回格式要求（非常重要）\n";
    promptContent += "必须严格按照以下JSON格式返回，不要添加任何其他内容，确保JSON格式有效：\n";
    promptContent += "```json\n";
    promptContent += "{\n";
    promptContent += '  "summary": "一句话概括主播表现(50字以内)",\n';
    promptContent += '  "analysis": "完整的分析内容，包括表现评估、优势、不足和改进建议，使用Markdown格式"\n';
    promptContent += "}\n";
    promptContent += "```\n";
    promptContent += "严格注意：\n";
    promptContent += "1. 返回的必须是有效的JSON格式，不要包含任何额外的标记或文本\n";
    promptContent += "2. 不要在JSON外添加任何说明、前缀或后缀\n";
    promptContent += "3. analysis字段中的Markdown格式（如**粗体**，*斜体*等）在JSON中必须正确转义引号和反斜杠\n";
    promptContent += "4. 确保JSON中没有未转义的引号或控制字符\n";
    promptContent += "5. 返回内容必须可以直接通过JSON.parse()方法解析，无需任何预处理\n";
    
    // 创建最终提示对象
    const finalPrompt = {
        role: "user",
        content: promptContent
    };
    
    // 调试输出
    console.log('生成的AI提示：', {
        anchorName,
        promptLength: promptContent.length
    });
    
    return finalPrompt;
}

/**
 * 调用AI API
 */
async function callAIAPI(prompt) {
    try {
        // 获取实际模型名称
        let modelName = aiSettings.model;
        if (modelName === 'custom' && aiSettings.customModel) {
            modelName = aiSettings.customModel;
        }
        
        // 构建请求体
        const requestBody = {
            model: modelName,
            messages: [
                {
                    role: "system",
                    content: "你是一位拥有20年资深经验的高级直播运营专家，擅长分析主播的销售业绩、直播表现和运营策略。你的分析深入专业，建议具有可操作性和针对性。请基于数据提供准确、专业的分析和实用建议。必须以有效的JSON格式返回结果。"
                },
                prompt
            ],
            temperature: 0.7,
            max_tokens: 2000
        };
        
        // 根据模型决定是否添加response_format (仅对某些模型添加)
        // 注意：只有部分GPT模型支持response_format，不要给Claude模型添加此参数
        if (modelName.includes('gpt-4') || modelName.includes('gpt-3.5-turbo')) {
            // 添加响应格式，要求返回JSON
            requestBody.response_format = { "type": "json_object" };
            
            // 添加函数调用作为更安全的JSON返回选项
            requestBody.functions = [{
                name: "analysis_result",
                description: "返回主播分析结果",
                parameters: {
                    type: "object",
                    properties: {
                        summary: {
                            type: "string",
                            description: "主播表现概述"
                        },
                        analysis: {
                            type: "string",
                            description: "详细分析内容"
                        }
                    },
                    required: ["summary", "analysis"]
                }
            }];
            requestBody.function_call = { name: "analysis_result" };
        }
        
        // 输出完整请求体以便调试
        console.log('完整API请求体:', JSON.stringify(requestBody, null, 2));
        console.log('发送AI请求:', {
            url: aiSettings.apiUrl,
            model: modelName,
            promptLength: prompt.content.length
        });
        
        // 发送请求
        const response = await fetch(aiSettings.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aiSettings.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        // 检查响应
        if (!response.ok) {
            let errorMessage = `HTTP错误 ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = `API错误: ${errorData.error?.message || response.statusText}`;
                console.error('API错误响应:', errorData);
            } catch (e) {
                console.error('无法解析错误响应:', e);
            }
            throw new Error(errorMessage);
        }
        
        // 解析响应
        const result = await response.json();
        console.log('AI响应结果:', result);
        
        // 提取AI回复内容
        let content = result.choices?.[0]?.message?.content;
        
        // 处理函数调用结果
        if (result.choices?.[0]?.message?.function_call) {
            try {
                // 如果是函数调用，直接提取参数JSON
                const functionCallArgs = result.choices[0].message.function_call.arguments;
                console.log('函数调用参数:', functionCallArgs);
                return JSON.parse(functionCallArgs);
            } catch (e) {
                console.warn('无法解析函数调用参数:', e);
                // 如果函数调用参数解析失败，继续尝试处理content
            }
        }
        
        // 处理文本内容
        if (!content) {
            console.warn('API响应中没有找到content字段');
            return {
                summary: "API返回的数据无法解析",
                analysis: "无法从API响应中提取有效内容。请检查API设置并重试。"
            };
        }
        
        // 尝试从Markdown格式中提取JSON
        if (content.includes('```json')) {
            const match = content.match(/```json\s*([\s\S]*?)\s*```/);
            if (match && match[1]) {
                content = match[1].trim();
                console.log('从Markdown代码块提取的JSON:', content);
            }
        }
        
        // 清理并解析JSON
        return parseAndSanitizeContent(content);
        
    } catch (error) {
        console.error('调用AI API时出错:', error);
        throw error;
    }
}

/**
 * 清理并解析内容为JSON，处理各种格式问题
 * @param {string} content - 原始内容
 * @returns {Object} - 解析后的对象
 */
function parseAndSanitizeContent(content) {
    try {
        // 如果内容为空，返回默认值
        if (!content) {
            console.warn('解析的内容为空');
            return {
                summary: "无法获取有效分析",
                analysis: "API返回的数据为空或无法解析。"
            };
        }

        // 预处理JSON字符串，处理常见问题
        let cleanedContent = content
            // 移除开头和结尾的反引号
            .replace(/^```json\s*/, '')
            .replace(/```$/, '')
            // 移除JSON字符串开头可能存在的BOM
            .replace(/^\s*\u{FEFF}/u, '')
            // 移除开头结尾的额外空白字符
            .trim();

        // 尝试直接解析JSON
        let result;
        try {
            result = JSON.parse(cleanedContent);
            console.log('成功直接解析JSON');
        } catch (jsonError) {
            // 如果直接解析失败，尝试使用更强大的修复方法
            console.warn('直接JSON解析失败，尝试修复格式问题:', jsonError);
            
            // 修复常见的JSON错误
            cleanedContent = cleanedContent
                // 修复字符串中未转义的引号
                .replace(/(?<!\\)\\(?!["\\])/g, '\\\\')
                // 修复斜杠的转义问题
                .replace(/\\\\/g, '\\')
                // 修复未转义的引号问题
                .replace(/"([^"]*)(?<!\\)"([^"]*)"(?!")/g, '"$1\\"$2"')
                // 替换控制字符
                .replace(/[\x00-\x1F\x7F]/g, '')
                // 确保所有属性名都有引号
                .replace(/(\s*)([a-zA-Z0-9_]+)(\s*):/g, '$1"$2"$3:');
            
            // 再次尝试解析
            try {
                result = JSON.parse(cleanedContent);
                console.log('成功修复并解析JSON');
            } catch (fixError) {
                console.error('JSON修复失败:', fixError);
                
                // 如果仍然无法解析，构建一个临时结果对象
                console.warn('构建临时结果对象');
                
                // 尝试提取summary和analysis
                const summaryMatch = content.match(/"summary"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
                const analysisMatch = content.match(/"analysis"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
                
                result = {
                    summary: summaryMatch ? summaryMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\') : "无法解析分析摘要",
                    analysis: analysisMatch ? analysisMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\') : "无法解析完整分析内容"
                };
            }
        }

        // 验证结果结构
        if (!result || typeof result !== 'object') {
            console.warn('解析结果不是有效对象');
            return {
                summary: "返回格式无效",
                analysis: "API返回的数据不是有效的JSON对象。"
            };
        }

        // 处理可能的function_call结构
        if (result.function_call && result.function_call.arguments) {
            try {
                const args = JSON.parse(result.function_call.arguments);
                console.log('从function_call中提取参数:', args);
                result = args;
            } catch (e) {
                console.warn('无法解析function_call参数:', e);
            }
        }

        // 确保包含必要的字段
        if (!result.summary) {
            result.summary = "未提供分析摘要";
        }
        
        if (!result.analysis) {
            result.analysis = "未提供详细分析";
        }

        // 清理内容中可能存在的转义问题
        // 对于分析内容，保留一些特定的Markdown格式标记
        result.summary = String(result.summary)
            .replace(/\\n/g, ' ')
            .replace(/\\t/g, ' ')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .trim();

        result.analysis = String(result.analysis)
            // 保持换行标记，但确保它们是一致的格式
            // 处理后，剩余的\n将在renderMarkdown函数中进一步处理
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '    ')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .trim();

        console.log('清理后的内容:', {
            summaryLength: result.summary.length,
            analysisLength: result.analysis.length
        });

        return result;
    } catch (error) {
        console.error('解析内容时出错:', error);
        return {
            summary: "解析失败",
            analysis: `无法解析API返回的内容: ${error.message}`
        };
    }
}

/**
 * 根据分析状态更新UI
 */
function updateAIAnalysisUI(state, data = null) {
    // 获取AI分析容器
    const container = document.getElementById('ai-analysis-container');
    if (!container) {
        console.error('找不到AI分析容器元素');
        return;
    }
    
    console.log(`更新AI分析UI状态: ${state}`, data ? Object.keys(data).length || data : '无数据');
    
    // 清空现有内容
    container.innerHTML = '';
    
    switch (state) {
        case 'loading':
            // 显示加载状态
            container.innerHTML = `
                <div class="text-center p-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">加载中...</span>
                    </div>
                    <p class="mt-3">正在进行AI分析，请稍候...</p>
                </div>
            `;
            break;
            
        case 'in-progress':
            // 显示进行中状态，带有部分结果
            const { current, total, results } = data || { current: 0, total: 0, results: {} };
            const progressPercentage = total > 0 ? Math.round((current / total) * 100) : 0;
            
            let progressHtml = `
                <div class="mb-4">
                    <h4>主播AI分析进行中</h4>
                    <div class="d-flex justify-content-between mb-1">
                        <span>已完成分析 ${current}/${total} 位主播</span>
                        <span>${progressPercentage}%</span>
                    </div>
                    <div class="progress mb-3" style="height: 20px;">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" 
                            role="progressbar" 
                            style="width: ${progressPercentage}%" 
                            aria-valuenow="${progressPercentage}" 
                            aria-valuemin="0" 
                            aria-valuemax="100">
                        </div>
                    </div>
                </div>
            `;
            
            // 如果有结果，显示当前结果
            if (results && Object.keys(results).length > 0) {
                progressHtml += `
                    <div class="partial-results mb-4">
                        <h5>已完成的分析结果</h5>
                        <div class="row ai-analysis-cards">
                `;
                
                Object.values(results).forEach(result => {
                    progressHtml += `
                        <div class="col-md-6 col-lg-4 mb-4">
                            <div class="card h-100 ${result.error ? 'border-warning' : ''}">
                                <div class="card-header bg-light">
                                    <strong>${result.name}</strong>
                                </div>
                                <div class="card-body">
                                    <p>${result.summary}</p>
                                    <button class="btn btn-sm btn-primary view-analysis-btn" 
                                            data-anchor="${result.name}">
                                        查看详细分析
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                progressHtml += `
                        </div>
                    </div>
                `;
            }
            
            container.innerHTML = progressHtml;
            
            // 绑定详情查看按钮事件 - 使用事件委托
            container.addEventListener('click', function(e) {
                const target = e.target;
                if (target.classList.contains('view-analysis-btn') || 
                    target.closest('.view-analysis-btn')) {
                    const button = target.classList.contains('view-analysis-btn') ? 
                        target : target.closest('.view-analysis-btn');
                    const anchorName = button.getAttribute('data-anchor');
                    if (results && results[anchorName]) {
                        console.log('查看主播分析详情:', anchorName);
                        showAnalysisDetailsModal(results[anchorName]);
                    }
                }
            });
            
            break;
            
        case 'results':
            // 显示分析结果
            if (!data || Object.keys(data).length === 0) {
                container.innerHTML = `<div class="alert alert-warning">没有分析结果可显示</div>`;
                return;
            }
            
            // 创建分析结果的UI
            const resultsHtml = `
                <div class="ai-results-header mb-4">
                    <h4>主播AI智能分析结果</h4>
                    <p class="text-muted">共分析了 ${Object.keys(data).length} 位主播的数据</p>
                    <button id="export-ai-analysis" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-download"></i> 导出分析报告
                    </button>
                </div>
                
                <div class="row ai-analysis-cards">
                    ${Object.values(data).map(result => `
                        <div class="col-md-6 col-lg-4 mb-4">
                            <div class="card h-100 ${result.error ? 'border-warning' : ''}">
                                <div class="card-header bg-light">
                                    <strong>${result.name}</strong>
                                </div>
                                <div class="card-body">
                                    <p>${result.summary}</p>
                                    <button class="btn btn-sm btn-primary view-analysis-btn" 
                                            data-anchor="${result.name}">
                                        查看详细分析
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            container.innerHTML = resultsHtml;
            
            // 绑定详情查看按钮事件 - 使用事件委托
            container.addEventListener('click', function(e) {
                const target = e.target;
                if (target.classList.contains('view-analysis-btn') || 
                    target.closest('.view-analysis-btn')) {
                    const button = target.classList.contains('view-analysis-btn') ? 
                        target : target.closest('.view-analysis-btn');
                    const anchorName = button.getAttribute('data-anchor');
                    if (data[anchorName]) {
                        console.log('查看主播分析详情:', anchorName);
                        showAnalysisDetailsModal(data[anchorName]);
                    }
                }
            });
            
            // 绑定导出按钮事件
            const exportButton = document.getElementById('export-ai-analysis');
            if (exportButton) {
                exportButton.addEventListener('click', function() {
                    exportAIAnalysisReport(data);
                });
            }
            
            break;
            
        case 'error':
            // 显示错误信息
            container.innerHTML = `
                <div class="alert alert-danger">
                    <h5>分析过程中发生错误</h5>
                    <p>${data ? data.message || '未知错误' : '未知错误'}</p>
                    <button id="retry-ai-analysis" class="btn btn-sm btn-outline-danger">
                        重试
                    </button>
                </div>
            `;
            
            // 绑定重试按钮事件
            const retryButton = document.getElementById('retry-ai-analysis');
            if (retryButton) {
                retryButton.addEventListener('click', function() {
                    startAIAnalysis();
                });
            }
            
            break;
            
        default:
            // 默认显示提示信息
            container.innerHTML = `
                <div class="text-center p-5">
                    <div class="ai-placeholder">
                        <i class="bi bi-robot" style="font-size: 3rem;"></i>
                        <h5 class="mt-3">AI智能分析</h5>
                        <p class="text-muted">点击"开始AI分析"按钮，对主播数据进行智能分析</p>
                        <button id="start-ai-analysis-btn" class="btn btn-primary">
                            开始AI分析
                        </button>
                    </div>
                </div>
            `;
            
            // 绑定开始分析按钮事件
            const startButton = document.getElementById('start-ai-analysis-btn');
            if (startButton) {
                startButton.addEventListener('click', function() {
                    startAIAnalysis();
                });
            }
    }
}

/**
 * 显示AI分析详情模态框
 */
function showAnalysisDetailsModal(result) {
    // 检查是否已存在模态框
    let modal = document.getElementById('analysis-details-modal');
    
    // 如果不存在，创建模态框
    if (!modal) {
        const modalHtml = `
            <div class="modal fade" id="analysis-details-modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">AI分析详情</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="analysis-details-content">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 添加到页面
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('analysis-details-modal');
    }
    
    // 更新模态框内容
    const contentElement = document.getElementById('analysis-details-content');
    if (contentElement) {
        contentElement.innerHTML = `
            <h4 class="mb-3">${result.name} 分析报告</h4>
            <div class="analysis-content">
                ${renderMarkdown(result.analysis)}
            </div>
            <div class="analysis-metadata text-muted mt-4">
                <small>分析时间: ${new Date(result.timestamp).toLocaleString('zh-CN')}</small>
            </div>
        `;
    }
    
    // 显示模态框
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

/**
 * 简单的Markdown渲染函数
 */
function renderMarkdown(text) {
    if (!text) return '';
    
    try {
        // 预处理文本，处理潜在的格式问题
        let processedText = String(text)
            // 确保文本是字符串并替换非打印字符
            .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
            // 修复可能的多余空格
            .replace(/\s+\n/g, '\n')
            // 确保标题标记前有换行
            .replace(/([^\n])#/g, '$1\n#');
        
        // 清理AI返回中常见的特殊标记
        processedText = processedText
            // 处理AI返回的编号列表 \n1. \n2. 等
            .replace(/\\n(\d+)\./g, '<br>$1.')
            // 处理换行标记
            .replace(/\\n/g, '<br>')
            // 处理\t制表符
            .replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
            // 处理markdown格式的列表\n- 项目 格式
            .replace(/\\n\s*[-*]\s+/g, '<br>• ');

        // 替换标题
        processedText = processedText.replace(/### (.*?)$/gm, '<h5 class="mt-3">$1</h5>');
        processedText = processedText.replace(/## (.*?)$/gm, '<h4 class="mt-4">$1</h4>');
        processedText = processedText.replace(/# (.*?)$/gm, '<h3 class="mt-4">$1</h3>');
        
        // 替换有序和无序列表
        processedText = processedText.replace(/^\d+\.\s+(.*?)$/gm, '<li>$1</li>');
        processedText = processedText.replace(/^[*\-+•]\s+(.*?)$/gm, '<li>$1</li>');
        
        // 将连续的列表项包装在列表标签中
        processedText = processedText.replace(/(<li>.*?<\/li>)+/g, function(match) {
            // 检测是否包含有序列表项
            if (match.includes('<li>1.') || match.includes('<li>1 ')) {
                return '<ol class="mb-3">' + match + '</ol>';
            } else {
                return '<ul class="mb-3">' + match + '</ul>';
            }
        });
        
        // 替换加粗文本
        processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        processedText = processedText.replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        // 替换斜体文本
        processedText = processedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        processedText = processedText.replace(/_(.*?)_/g, '<em>$1</em>');
        
        // 替换代码块
        processedText = processedText.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
        processedText = processedText.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // 处理代码中可能出现的类似\u00A5等Unicode转义序列
        processedText = processedText.replace(/\\u([0-9a-fA-F]{4})/g, 
            (match, p1) => String.fromCharCode(parseInt(p1, 16)));
        
        // 替换链接
        processedText = processedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // 替换引用块
        processedText = processedText.replace(/^>\s+(.*?)$/gm, '<blockquote class="ps-3 border-start border-3 text-muted">$1</blockquote>');
        
        // 水平线
        processedText = processedText.replace(/^---+$/gm, '<hr class="my-3">');
        
        // 处理表格 - 简单表格支持
        const tableRegex = /^\|(.*?)\|\s*$/gm;
        if (tableRegex.test(processedText)) {
            // 查找表格行
            let tableLines = processedText.match(/^\|(.*?)\|\s*$/gm);
            if (tableLines && tableLines.length > 1) {
                let tableHtml = '<div class="table-responsive"><table class="table table-bordered table-sm">';
                
                // 处理表头
                let headerLine = tableLines[0];
                tableHtml += '<thead><tr>';
                headerLine.split('|').filter(cell => cell.trim() !== '').forEach(cell => {
                    tableHtml += `<th>${cell.trim()}</th>`;
                });
                tableHtml += '</tr></thead>';
                
                // 处理分隔行
                if (tableLines.length > 2) {
                    tableHtml += '<tbody>';
                    // 跳过分隔行，处理数据行
                    for (let i = 2; i < tableLines.length; i++) {
                        tableHtml += '<tr>';
                        tableLines[i].split('|').filter(cell => cell.trim() !== '').forEach(cell => {
                            tableHtml += `<td>${cell.trim()}</td>`;
                        });
                        tableHtml += '</tr>';
                    }
                    tableHtml += '</tbody>';
                }
                
                tableHtml += '</table></div>';
                
                // 替换原始表格文本
                for (const line of tableLines) {
                    processedText = processedText.replace(line, '');
                }
                processedText += tableHtml;
            }
        }
        
        // 替换换行符为<br>标签
        processedText = processedText.replace(/\n/g, '<br>');
        
        // 修复一些常见问题
        // 修复可能的嵌套段落
        processedText = processedText.replace(/<\/p><br><p>/g, '</p><p>');
        // 去除多余的<br>标签
        processedText = processedText.replace(/<br><br>/g, '<br>');
        processedText = processedText.replace(/<br><br>/g, '<br>'); // 再执行一次以处理可能的多个连续换行
        // 修复列表内部的<br>
        processedText = processedText.replace(/<li>(.*?)<br>/g, '<li>$1');
        
        // 修复可能包含的未处理转义字符，常见于AI生成的内容
        processedText = processedText
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, "\\");
        
        // 修复最终呈现
        if (!processedText.startsWith('<')) {
            processedText = '<p>' + processedText + '</p>';
        }
        
        return processedText;
    } catch (error) {
        console.error('Markdown渲染出错:', error);
        // 出错时返回纯文本，但尝试最基本的换行处理
        return `<p>${String(text).replace(/\n/g, '<br>').replace(/\\n/g, '<br>')}</p>`;
    }
}

/**
 * 导出AI分析报告
 */
function exportAIAnalysisReport(results) {
    try {
        // 创建HTML内容
        let htmlContent = `
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>主播AI分析报告</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .container { max-width: 1200px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .anchor-report { margin-bottom: 40px; border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
                    .anchor-name { color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                    .summary { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    h1, h2, h3, h4 { margin-top: 20px; }
                    .footer { text-align: center; margin-top: 50px; color: #777; font-size: 0.8rem; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>主播AI智能分析报告</h1>
                        <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
                    </div>
        `;
        
        // 添加每个主播的分析
        Object.values(results).forEach(result => {
            htmlContent += `
                <div class="anchor-report">
                    <h2 class="anchor-name">${result.name}</h2>
                    <div class="summary">
                        <strong>摘要：</strong> ${result.summary}
                    </div>
                    <div class="analysis">
                        ${renderMarkdown(result.analysis)}
                    </div>
                </div>
            `;
        });
        
        // 添加页脚
        htmlContent += `
                    <div class="footer">
                        <p>本报告由AI分析引擎生成，仅供参考</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        // 创建Blob
        const blob = new Blob([htmlContent], { type: 'text/html' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `主播AI分析报告_${new Date().toLocaleDateString('zh-CN')}.html`;
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
        
    } catch (error) {
        console.error('导出报告时出错:', error);
        showNotice('danger', '导出报告失败: ' + error.message);
    }
}

/**
 * 工具函数：提取销售信息
 */
function extractSaleInfo(saleRow) {
    // 针对不同的数据结构进行适配
    if (!saleRow) return { product: '-', spec: '-', quantity: '-', price: '-', time: '-', category: '', brand: '' };
    
    let product = '-';
    let spec = '-';
    let quantity = '-';
    let price = '-';
    let time = '-';
    let category = '';
    let brand = '';
    
    try {
        // 如果是对象（已解析的JSON）
        if (typeof saleRow === 'object' && !Array.isArray(saleRow)) {
            // 这可能是格式化后的数据对象
            if (saleRow.product !== undefined) {
                // 如果已经有product和category属性，可能是已经处理过的对象
                if (saleRow.category !== undefined) {
                    return saleRow;
                }
                // 否则补充category属性
                product = saleRow.product;
                spec = saleRow.spec || '-';
                quantity = saleRow.quantity || '-';
                price = saleRow.price || '-';
                time = saleRow.time || '-';
                brand = saleRow.brand || '';
            } else {
                // 从原始数据中提取
                product = saleRow['选购商品'] || saleRow['商品名称'] || saleRow['商品'] || '-';
                spec = saleRow['商品规格'] || saleRow['规格'] || '-';
                quantity = saleRow['商品数量'] || saleRow['数量'] || '-';
                price = saleRow['订单应付金额'] || saleRow['订单金额'] || saleRow['金额'] || '-';
                time = saleRow['订单提交时间'] || saleRow['提交时间'] || saleRow['下单时间'] || '-';
            }
        }
        // 如果是数组（原始Excel行数据）
        else if (Array.isArray(saleRow)) {
            // 针对常见的数据格式进行处理
            product = saleRow[0] || '-';
            spec = saleRow[1] || '-';
            quantity = saleRow[2] || '-';
            price = saleRow[3] || '-';
            time = saleRow[4] || '-';
        }
        else if (typeof saleRow === 'string') {
            // 对于字符串类型，尝试解析为JSON
            try {
                const jsonObj = JSON.parse(saleRow);
                return extractSaleInfo(jsonObj); // 递归处理解析后的对象
            } catch (e) {
                // 如果不是JSON字符串，则按普通字符串处理
                
                // 字符串处理：尝试提取产品名称和价格
                const productMatch = saleRow.match(/([^0-9]+)/);
                const priceMatch = saleRow.match(/(\d+(\.\d+)?)/);
                
                product = productMatch ? productMatch[0].trim() : '-';
                price = priceMatch ? priceMatch[0] : '-';
                
                // 从商品名称中提取规格和数量信息
                // 例如："美素佳儿源悦3段幼儿配方奶粉800g 荷兰原装进口"
                
                // 提取规格 - 常见的格式有：N段、N阶段
                const specMatch = product.match(/(\d+段|\d+阶段)/);
                if (specMatch) {
                    spec = specMatch[0];
                }
                
                // 提取数量 - 常见的格式有：NNNg、NNNml、NNN克、NNN毫升
                const quantityMatch = saleRow.match(/(\d+[g克]|\d+[ml毫升])/);
                if (quantityMatch) {
                    quantity = quantityMatch[0];
                }
            }
        } else {
            // 尝试转换为字符串处理
            try {
                const saleText = String(saleRow);
                return extractSaleInfo(saleText); // 递归处理转换后的字符串
            } catch (e) {
                console.error('无法将销售数据转换为字符串:', e);
            }
        }
        
        // 确定产品类别/品牌
        if (product.includes('源悦')) {
            category = '源悦';
            brand = '源悦';
        } else if (product.includes('莼悦')) {
            category = '莼悦';
            brand = '莼悦';
        } else if (product.includes('旺玥')) {
            category = '旺玥';
            brand = '旺玥';
        } else if (product.includes('皇家')) {
            category = '皇家';
            brand = '皇家';
        }
        
    } catch (error) {
        console.error('提取销售信息错误:', error);
    }
    
    // 确保价格是数值类型，用于计算
    const numericPrice = parseFloat(price) || 0;
    
    return { 
        product, 
        spec, 
        quantity, 
        price, 
        time,
        category,
        brand,
        amount: numericPrice  // 兼容旧版属性
    };
}

/**
 * 工具函数：显示通知消息
 */
function showNotice(type, message, duration = 3000) {
    // 检查是否已存在通知容器
    let noticeContainer = document.getElementById('notice-container');
    
    // 如果不存在，创建一个
    if (!noticeContainer) {
        noticeContainer = document.createElement('div');
        noticeContainer.id = 'notice-container';
        noticeContainer.style.position = 'fixed';
        noticeContainer.style.top = '20px';
        noticeContainer.style.right = '20px';
        noticeContainer.style.zIndex = '9999';
        document.body.appendChild(noticeContainer);
    }
    
    // 创建通知元素
    const notice = document.createElement('div');
    notice.className = `alert alert-${type} alert-dismissible fade show`;
    notice.role = 'alert';
    notice.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // 添加到容器
    noticeContainer.appendChild(notice);
    
    // 添加定时器自动关闭
    setTimeout(() => {
        notice.classList.remove('show');
        setTimeout(() => {
            if (notice.parentNode) {
                notice.parentNode.removeChild(notice);
            }
        }, 150);
    }, duration);
}

/**
 * 工具函数：显示加载提示
 */
function showLoading(message = '加载中...') {
    // 检查是否已有加载提示
    let loader = document.getElementById('global-loader');
    
    // 如果没有，创建一个
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.style.position = 'fixed';
        loader.style.top = '0';
        loader.style.left = '0';
        loader.style.width = '100%';
        loader.style.height = '100%';
        loader.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        loader.style.display = 'flex';
        loader.style.justifyContent = 'center';
        loader.style.alignItems = 'center';
        loader.style.zIndex = '10000';
        document.body.appendChild(loader);
    }
    
    // 更新加载提示内容
    loader.innerHTML = `
        <div class="bg-white p-4 rounded shadow-sm text-center">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">加载中...</span>
            </div>
            <div>${message}</div>
        </div>
    `;
    
    // 显示加载提示
    loader.style.display = 'flex';
}

/**
 * 工具函数：隐藏加载提示
 */
function hideLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * 关闭模态框的辅助函数
 * @param {string|Element} modalId - 模态框的ID或DOM元素
 */
function closeModal(modalId) {
    console.log('尝试关闭模态框:', modalId);
    
    // 获取模态框元素
    const modalElement = typeof modalId === 'string' 
        ? document.getElementById(modalId) 
        : modalId;
    
    if (!modalElement) {
        console.warn('找不到模态框元素:', modalId);
        return;
    }
    
    try {
        // 尝试使用Bootstrap API
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            // 先尝试获取已存在的实例
            let modalInstance = bootstrap.Modal.getInstance(modalElement);
            
            // 如果没有实例，创建一个
            if (!modalInstance) {
                modalInstance = new bootstrap.Modal(modalElement);
            }
            
            // 隐藏模态框
            modalInstance.hide();
            console.log('使用Bootstrap API关闭模态框成功');
            return;
        }
    } catch (err) {
        console.error('使用Bootstrap API关闭模态框失败:', err);
    }
    
    // 回退方法：手动处理DOM
    try {
        // 移除模态框的显示类和内联样式
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('aria-modal');
        
        // 移除body上的类和样式
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // 移除模态框背景
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
            backdrop.classList.remove('show');
            setTimeout(() => {
                if (backdrop.parentNode) {
                    backdrop.parentNode.removeChild(backdrop);
                }
            }, 150);
        });
        
        console.log('使用DOM方法关闭模态框成功');
    } catch (err) {
        console.error('使用DOM方法关闭模态框失败:', err);
    }
}

/**
 * 测试API连接
 */
async function testAPIConnection() {
    const resultContainer = document.getElementById('api-test-result');
    resultContainer.innerHTML = '<div class="alert alert-info">正在测试API连接...</div>';
    
    try {
        const apiUrl = document.getElementById('ai-api-url').value.trim();
        const apiKey = document.getElementById('ai-api-key').value.trim();
        const modelSelect = document.getElementById('ai-model');
        
        // 调试输出
        console.log('API URL:', apiUrl);
        console.log('API Key:', apiKey ? '已设置' : '未设置');
        
        if (!apiUrl || !apiKey) {
            resultContainer.innerHTML = '<div class="alert alert-danger">请填写API URL和密钥</div>';
            return;
        }
        
        // 获取正确的模型名称
        let modelName = modelSelect.value;
        if (modelName === 'custom') {
            // 使用自定义模型输入框的值
            const customModelInput = document.getElementById('custom-model');
            if (customModelInput && customModelInput.value.trim()) {
                modelName = customModelInput.value.trim();
            } else {
                resultContainer.innerHTML = '<div class="alert alert-danger">请填写自定义模型名称</div>';
                return;
            }
        }
        
        console.log('测试API连接，使用模型:', modelName);
        
        // 创建请求数据
        const requestData = {
            model: modelName,
            messages: [
                {role: "system", content: "你是人工智能助手。"},
                {role: "user", content: "测试API连接，请回复'连接成功'。"}
            ],
            max_tokens: 20
        };
        
        console.log('发送API请求数据:', JSON.stringify(requestData));
        
        // 简单的测试请求
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestData)
        });
        
        console.log('API响应状态:', response.status);
        
        if (response.ok) {
            const jsonResponse = await response.json();
            console.log('API响应数据:', jsonResponse);
            resultContainer.innerHTML = '<div class="alert alert-success">API连接成功！</div>';
        } else {
            let errorMessage = '';
            try {
                const errorData = await response.json();
                console.error('API错误响应:', errorData);
                errorMessage = errorData.error?.message || response.statusText;
            } catch (e) {
                errorMessage = `HTTP错误: ${response.status} ${response.statusText}`;
            }
            resultContainer.innerHTML = `<div class="alert alert-danger">API连接失败: ${errorMessage}</div>`;
        }
    } catch (error) {
        console.error('测试API连接时出错:', error);
        resultContainer.innerHTML = `<div class="alert alert-danger">API连接错误: ${error.message}</div>`;
    }
}

/**
 * 关闭模态框
 * @param {string} modalId 模态框ID
 */
function closeModal(modalId) {
    try {
        const modalEl = document.getElementById(modalId);
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) {
                modal.hide();
            }
        }
    } catch (error) {
        console.error('关闭模态框出错:', error);
    }
}

/**
 * AI文件预处理功能模块
 */

// 全局变量
let aiPreprocessFile = null;  // 存储待处理的文件
let processedFileData = null; // 存储处理后的文件数据

// 初始化AI文件预处理功能
document.addEventListener('DOMContentLoaded', function() {
    initAIPreprocessFeature();
});

/**
 * 初始化AI文件预处理功能
 */
function initAIPreprocessFeature() {
    // 绑定文件上传事件
    const fileInput = document.getElementById('ai-preprocess-file');
    if (fileInput) {
        fileInput.addEventListener('change', handlePreprocessFileSelect);
    }
    
    // 初始化拖放区域
    initPreprocessDropZone();
    
    // 绑定开始处理按钮事件
    const startBtn = document.getElementById('start-ai-preprocess-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startAIPreprocess);
    }
    
    // 绑定下载按钮事件
    const downloadBtn = document.getElementById('download-processed-file-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadProcessedFile);
    }
    
    console.log('AI文件预处理功能初始化完成');
}

/**
 * 初始化文件拖放区域
 */
function initPreprocessDropZone() {
    const dropZone = document.getElementById('ai-preprocess-upload-area');
    if (!dropZone) return;
    
    // 阻止默认拖放行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    // 高亮显示拖放区域
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('highlight');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('highlight');
        }, false);
    });
    
    // 处理文件拖放
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            const fileInput = document.getElementById('ai-preprocess-file');
            fileInput.files = files;
            handlePreprocessFileSelect({ target: fileInput });
        }
    }, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
}

/**
 * 处理预处理文件选择
 */
function handlePreprocessFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
        showNotice('warning', '请上传Excel文件(.xlsx或.xls)');
        return;
    }
    
    // 保存文件
    aiPreprocessFile = file;
    
    // 显示文件信息
    updatePreprocessFileInfo(file);
    
    // 启用开始处理按钮
    document.getElementById('start-ai-preprocess-btn').disabled = false;
    
    console.log('已选择预处理文件:', file.name);
}

/**
 * 更新预处理文件信息显示
 */
function updatePreprocessFileInfo(file) {
    const fileInfo = document.getElementById('ai-preprocess-file-info');
    const fileDetails = fileInfo.querySelector('.file-details');
    
    fileDetails.querySelector('.file-name').textContent = file.name;
    fileDetails.querySelector('.file-size').textContent = formatFileSize(file.size);
    fileDetails.classList.remove('d-none');
    
    // 显示文件上传成功消息
    showStatusMessage('ai-preprocess-status', '文件已选择，可以开始处理', 'success');
}

/**
 * 开始AI预处理
 */
async function startAIPreprocess() {
    if (!aiPreprocessFile) {
        showNotice('warning', '请先选择要处理的文件');
        return;
    }
    
    let instruction = document.getElementById('ai-preprocess-instruction').value.trim();
    if (!instruction) {
        showNotice('warning', '请输入处理指令');
        return;
    }
    
    try {
        // 显示进度条
        const progressContainer = document.getElementById('ai-preprocess-progress-container');
        const progressBar = document.getElementById('ai-preprocess-progress-bar');
        const progressText = document.getElementById('ai-preprocess-progress-text');
        
        progressContainer.classList.remove('d-none');
        progressBar.style.width = '10%';
        progressText.textContent = '正在读取文件...';
        
        // 禁用按钮
        document.getElementById('start-ai-preprocess-btn').disabled = true;
        
        // 读取文件内容
        const fileData = await readFileAsArrayBuffer(aiPreprocessFile);
        
        // 更新进度
        progressBar.style.width = '20%';
        progressText.textContent = '文件读取完成，正在分析指令...';
        
        // 处理用户指令，使其更加规范化
        instruction = preprocessInstruction(instruction);
        
        // 更新进度
        progressBar.style.width = '30%';
        progressText.textContent = '指令分析完成，正在发送到AI进行处理...';
        
        // 发送到AI处理
        processedFileData = await sendToAIForProcessing(fileData, instruction);
        
        // 更新进度
        progressBar.style.width = '90%';
        progressText.textContent = '处理完成，准备下载...';
        
        // 启用下载按钮
        document.getElementById('download-processed-file-btn').disabled = false;
        
        // 完成进度
        progressBar.style.width = '100%';
        progressText.textContent = '处理完成！可以下载或继续使用';
        
        // 显示成功消息
        showNotice('success', 'AI文件处理完成');
        
    } catch (error) {
        console.error('AI预处理出错:', error);
        showNotice('danger', 'AI处理失败: ' + error.message);
        
        // 隐藏进度条
        document.getElementById('ai-preprocess-progress-container').classList.add('d-none');
        
        // 重新启用按钮
        document.getElementById('start-ai-preprocess-btn').disabled = false;
    }
}

/**
 * 预处理用户指令，使其更加规范化
 */
function preprocessInstruction(instruction) {
    // 转换为标准格式
    let processedInstruction = instruction;
    
    // 处理各种常见的列操作表达
    if (instruction.includes('只保留') || instruction.includes('仅保留') || instruction.includes('保留列')) {
        // 提取引号中的列名
        const columnMatches = instruction.match(/['"](.*?)['"]|['"]([^'"]+?)['"]|['"](.*?)['"]/g) || [];
        
        if (columnMatches.length > 0) {
            // 提取并规范化列名
            const columnNames = columnMatches.map(col => col.replace(/['"]/g, '').trim());
            
            // 构建更明确的指令
            processedInstruction = `严格地只保留以下列，任何其他列必须全部清除：\n`;
            columnNames.forEach(col => {
                processedInstruction += `- "${col}"\n`;
            });
            
            // 添加明确的操作类型提示和严格的参数说明
            processedInstruction += `\n操作类型：filter_columns\n`;
            processedInstruction += `参数：严格包含以上${columnNames.length}列，移除所有其他列\n`;
            processedInstruction += `注意：最终结果必须且只能有${columnNames.length}列\n`;
            processedInstruction += `\n原始指令：${instruction}`;
        }
    }
    
    console.log('原始指令:', instruction);
    console.log('处理后指令:', processedInstruction);
    
    return processedInstruction;
}

/**
 * 读取文件为ArrayBuffer
 */
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        
        reader.onerror = (e) => {
            reject(new Error('读取文件失败'));
        };
        
        reader.readAsArrayBuffer(file);
    });
}

/**
 * 发送到AI处理
 * @param {ArrayBuffer} fileData - 文件数据
 * @param {string} instruction - 处理指令
 * @returns {ArrayBuffer} - 处理后的文件数据
 */
async function sendToAIForProcessing(fileData, instruction) {
    // 检查是否使用演示模式
    if (aiSettings.useDemoMode) {
        // 演示模式下，模拟AI处理过程
        return await simulateAIProcessing(fileData, instruction);
    } else {
        // 实际API调用模式
        return await callAIProcessingAPI(fileData, instruction);
    }
}

/**
 * 模拟AI处理（演示模式）
 */
function simulateAIProcessing(fileData, instruction) {
    return new Promise((resolve) => {
        // 模拟处理延迟
        setTimeout(() => {
            // 这里简单返回原始文件，实际项目中应当根据instruction对数据进行处理
            console.log('模拟AI处理，处理指令:', instruction);
            resolve(fileData);
        }, 2000);
    });
}

/**
 * 调用AI处理API
 */
async function callAIProcessingAPI(fileData, instruction) {
    try {
        // 检查API配置
        if (!aiSettings.apiUrl || !aiSettings.apiKey) {
            throw new Error('请先在设置中配置AI API');
        }
        
        // 解析Excel文件并提取数据摘要
        const dataSummary = await extractExcelSummary(fileData);
        const fileName = aiPreprocessFile.name;
        
        // 获取实际模型名称
        let modelName = aiSettings.model;
        if (modelName === 'custom' && aiSettings.customModel) {
            modelName = aiSettings.customModel;
        }
        
        // 构建系统消息，明确要求输出结构化的处理步骤
        const systemMessage = `你是一个专业的Excel数据处理专家，能够理解用户的数据处理需求并执行数据清洗、转换和分析操作。
你的任务是分析Excel文件数据，并精确按照用户的要求提供具体的处理步骤。

用户可能会要求保留特定的列、删除特定的行、筛选数据等操作。例如:
- 如果用户要求"只保留A,B,C列"，你应该使用filter_columns操作并在params中设置include参数为这些列名
  - 这是一个严格的要求，结果中必须且只能有这些指定的列，不能多也不能少
  - "只保留"或"仅保留"意味着其他所有列都必须被删除，最终结果只有这些明确指定的列
- 如果用户要求"删除所有D列"，你应该使用filter_columns操作并在params中设置exclude参数
- 如果用户要求"筛选行"或"保留符合条件的行"，你应该使用filter_rows操作

请务必严格解析用户需求，执行精确的操作。尤其是当用户使用"只"、"仅"等限定词时，表示要严格遵照执行。

你必须以JSON格式返回处理步骤，包含以下字段：
1. "summary": 简短描述你将执行的处理操作
2. "operations": 包含具体操作步骤的数组，每个操作必须包含:
   - "type": 操作类型，支持的操作有:
      * "filter_columns": 筛选列(保留或排除列)
      * "remove_rows": 删除指定范围的行
      * "filter_rows": 按条件筛选行
      * "sort": 排序数据
      * "rename_columns": 重命名列
      * "transform_data": 转换数据值
   - "params": 该操作所需的参数对象，根据操作类型而异

请确保你的返回结果是有效的JSON格式，可以被JSON.parse()解析。`;

        // 构建用户消息，明确说明需要实际处理文件而不仅是建议
        const userMessage = `我需要你对我的Excel文件"${fileName}"进行数据处理。请务必执行我的具体要求，而不是仅提供建议。

具体处理要求如下：
${instruction}

请按照以下方式理解我的请求:
1. 如果我指定"只保留某些列"或"仅保留某些列"，这意味着处理后的文件中必须且只能包含这些列，其他所有列都必须删除
2. 如果我指定"删除某些列"，请使用filter_columns操作，设置exclude参数为这些列名
3. 如果我要求筛选满足特定条件的行，请使用filter_rows操作
4. 要求清晰明确执行这些操作，这是一个数据清洗任务，必须严格按照我的要求处理

以下是文件的数据摘要，请根据这些信息提供具体的处理步骤：
${dataSummary}

重要: 请输出严格按照我的要求的JSON格式处理步骤，你的处理步骤将会被直接应用到数据上。`;
        
        // 构建请求体
        const requestBody = {
            model: modelName,
            messages: [
                {
                    role: "system",
                    content: systemMessage
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            temperature: 0.2,
            max_tokens: 2000,
            response_format: { type: "json_object" } // 明确要求JSON格式
        };
        
        // 移除不支持的参数
        if (!modelName.includes('gpt')) {
            delete requestBody.response_format;
        }
        
        console.log('发送文件处理请求到AI API...');
        
        // 发送请求
        const response = await fetch(aiSettings.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aiSettings.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        // 检查响应状态
        if (!response.ok) {
            let errorMessage = `HTTP错误 ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = `API错误: ${errorData.error?.message || response.statusText}`;
                console.error('API错误响应:', errorData);
            } catch (e) {
                console.error('无法解析错误响应:', e);
            }
            throw new Error(errorMessage);
        }
        
        // 获取AI回复
        const responseData = await response.json();
        
        // 检查是否有内容响应
        const contentString = responseData.choices?.[0]?.message?.content || '';
        console.log('AI处理响应:', contentString.substring(0, 200) + '...');
        
        try {
            // 尝试解析JSON响应
            let processingSteps;
            
            // 处理可能的格式问题
            if (contentString.includes('```json')) {
                const match = contentString.match(/```json\s*([\s\S]*?)\s*```/);
                if (match && match[1]) {
                    processingSteps = JSON.parse(match[1].trim());
                }
            } else {
                processingSteps = JSON.parse(contentString);
            }
            
            // 如果成功解析出处理步骤，应用到文件数据
            if (processingSteps && (processingSteps.operations || processingSteps.steps)) {
                const result = await processExcelWithAIGuidance(fileData, instruction, processingSteps);
                // 验证结果是否有效
                if (!(result instanceof ArrayBuffer) && !result.buffer) {
                    console.error('处理结果不是有效的二进制数据，尝试进行转换');
                    // 尝试转换为ArrayBuffer
                    if (Array.isArray(result)) {
                        return new Uint8Array(result).buffer;
                    } else {
                        // 无法转换，使用原始文件数据生成报告
                        return await processExcelWithAIGuidance(fileData, instruction, { 
                            summary: '处理结果不是有效格式', 
                            text: '处理步骤已应用，但结果格式错误。请尝试其他处理指令。' 
                        });
                    }
                }
                return result;
            } else {
                throw new Error('AI返回的处理步骤格式不正确');
            }
        } catch (parseError) {
            console.error('解析AI返回的处理步骤失败:', parseError);
            showNotice('warning', `无法解析AI的处理步骤，将保留原始数据并显示建议`);
            return await processExcelWithAIGuidance(fileData, instruction, { summary: '无法解析处理步骤', text: contentString });
        }
    } catch (error) {
        console.error('AI API调用失败:', error);
        // 确保即使在错误情况下也能返回有效数据
        try {
            return await processExcelWithAIGuidance(fileData, instruction, { 
                summary: 'API调用失败', 
                error: error.message, 
                text: '处理过程中发生错误，无法完成请求。请检查API设置或稍后重试。' 
            });
        } catch (fallbackError) {
            console.error('创建错误报告也失败:', fallbackError);
            // 最后的回退方案：返回原始文件数据
            return fileData;
        }
    }
}

/**
 * 从Excel文件中提取数据摘要
 */
async function extractExcelSummary(fileData) {
    try {
        // 使用SheetJS库读取Excel
        const workbook = XLSX.read(new Uint8Array(fileData), {type: 'array'});
        const sheetNames = workbook.SheetNames;
        
        if (sheetNames.length === 0) {
            return '文件不包含任何工作表。';
        }
        
        let summary = `文件包含 ${sheetNames.length} 个工作表: ${sheetNames.join(', ')}\n\n`;
        
        // 辅助函数：检测值是否可能是Excel日期
        function isLikelyExcelDate(value) {
            // 如果是数字，且在有效的Excel日期范围内（1900年至今，约为0-44000之间的数字）
            return typeof value === 'number' && value > 0 && value < 50000;
        }
        
        // 辅助函数：获取列的数据类型
        function detectColumnTypes(jsonData) {
            if (jsonData.length < 2) return {}; // 需要至少有表头和一行数据
            
            const headers = jsonData[0];
            const columnTypes = {};
            
            // 对每一列进行类型检测
            for (let colIndex = 0; colIndex < headers.length; colIndex++) {
                const header = headers[colIndex];
                if (header === undefined || header === null) continue;
                
                let dateCount = 0;
                let numberCount = 0;
                let stringCount = 0;
                let totalCount = 0;
                
                // 检查最多20行数据来判断列类型
                for (let rowIndex = 1; rowIndex < Math.min(jsonData.length, 21); rowIndex++) {
                    if (!jsonData[rowIndex] || colIndex >= jsonData[rowIndex].length) continue;
                    
                    const cellValue = jsonData[rowIndex][colIndex];
                    if (cellValue === undefined || cellValue === null) continue;
                    
                    totalCount++;
                    
                    if (isLikelyExcelDate(cellValue)) {
                        dateCount++;
                    } else if (typeof cellValue === 'number' || !isNaN(parseFloat(cellValue))) {
                        numberCount++;
                    } else {
                        stringCount++;
                    }
                }
                
                // 确定列的主要类型
                if (totalCount > 0) {
                    // 超过70%的单元格是日期格式，判定为日期列
                    if (dateCount / totalCount > 0.7) {
                        columnTypes[header] = '日期';
                    } 
                    // 超过70%的单元格是数字，判定为数字列
                    else if (numberCount / totalCount > 0.7) {
                        columnTypes[header] = '数字';
                    } 
                    // 其他情况判定为文本列
                    else {
                        columnTypes[header] = '文本';
                    }
                }
            }
            
            return columnTypes;
        }
        
        // 对每个工作表进行摘要
        for (let i = 0; i < Math.min(sheetNames.length, 3); i++) { // 最多处理前3个工作表
            const sheetName = sheetNames[i];
            const worksheet = workbook.Sheets[sheetName];
            
            if (!worksheet) {
                summary += `工作表 "${sheetName}" 为空或无法访问。\n\n`;
                continue;
            }
            
            try {
                // 转换为JSON格式以便处理
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
                
                // 工作表信息
                const rowCount = jsonData.length;
                const colCount = rowCount > 0 ? jsonData[0].length : 0;
                
                summary += `工作表 "${sheetName}":\n`;
                summary += `- 行数: ${rowCount}, 列数: ${colCount}\n`;
                
                // 列出表头 (第一行)
                if (rowCount > 0 && Array.isArray(jsonData[0])) {
                    const headers = jsonData[0]
                        .filter(h => h !== undefined && h !== null)
                        .map(h => String(h).substring(0, 30)) // 限制每个表头长度
                        .slice(0, 10); // 最多显示10个表头
                        
                    summary += `- 表头: ${headers.join(', ')}${jsonData[0].length > 10 ? '...(更多)' : ''}\n`;
                    
                    // 检测列类型
                    if (rowCount > 1) {
                        const columnTypes = detectColumnTypes(jsonData);
                        if (Object.keys(columnTypes).length > 0) {
                            summary += `- 列类型:\n`;
                            for (const [header, type] of Object.entries(columnTypes)) {
                                if (type === '日期') {
                                    summary += `  "${header}": ${type} (Excel存储格式，需要特殊处理)\n`;
                                } else {
                                    summary += `  "${header}": ${type}\n`;
                                }
                            }
                        }
                    }
                    
                    // 添加数据行示例
                    if (rowCount > 1) {
                        summary += `- 数据示例:\n`;
                        // 最多显示3行数据
                        for (let j = 1; j < Math.min(rowCount, 4); j++) {
                            if (Array.isArray(jsonData[j])) {
                                const row = jsonData[j]
                                    .filter(cell => cell !== undefined && cell !== null)
                                    .map(cell => {
                                        // 将所有数据类型转换为字符串并限制长度
                                        const cellStr = String(cell);
                                        return cellStr.length > 15 ? cellStr.substring(0, 15) + '...' : cellStr;
                                    })
                                    .slice(0, 5); // 每行最多显示5个单元格
                                    
                                const rowSummary = row.join(', ');
                                summary += `  行${j}: ${rowSummary}${jsonData[j].length > 5 ? '...(更多)' : ''}\n`;
                            }
                        }
                        
                        if (rowCount > 4) {
                            summary += `  ...(共${rowCount}行数据)\n`;
                        }
                    }
                } else {
                    summary += `- 工作表为空或无有效表头\n`;
                }
                
                summary += '\n';
            } catch (sheetError) {
                console.error(`处理工作表 "${sheetName}" 时出错:`, sheetError);
                summary += `工作表 "${sheetName}" 处理出错: ${sheetError.message}\n\n`;
            }
        }
        
        if (sheetNames.length > 3) {
            summary += `...(文件还包含 ${sheetNames.length - 3} 个未显示的工作表)\n`;
        }
        
        // 添加提示，告知AI关于Excel日期格式的特殊处理
        summary += '\n注意：Excel将日期存储为自1900年1月1日起的天数（如45716表示2025年1月1日），需要特殊处理才能正确显示。\n';
        
        // 限制摘要总长度
        if (summary.length > 4000) {
            summary = summary.substring(0, 4000) + '...(摘要已截断)';
        }
        
        return summary;
    } catch (error) {
        console.error('提取Excel摘要失败:', error);
        return `无法提取Excel摘要: ${error.message}。文件可能损坏或格式不支持。`;
    }
}

/**
 * 根据AI建议处理Excel文件
 */
async function processExcelWithAIGuidance(fileData, instruction, processingSteps) {
    try {
        // 使用原始文件数据
        const workbook = XLSX.read(new Uint8Array(fileData), {type: 'array'});
        
        // 检查处理步骤结构
        let operations = processingSteps.operations || processingSteps.steps || [];
        const summary = processingSteps.summary || '未提供处理摘要';
        
        // 如果处理步骤是字符串(文本内容)，则只生成报告不处理数据
        if (typeof processingSteps === 'string' || processingSteps.text) {
            return createReportWorkbook(workbook, instruction, processingSteps);
        }
        
        console.log('应用的处理步骤:', operations);
        console.log('用户原始指令:', instruction);
        
        // 对每个工作表应用操作
        const sheetNames = workbook.SheetNames;
        
        // 创建处理结果工作表
        const resultWorkbook = XLSX.utils.book_new();
        
        // 检查是否包含filter_columns操作，记录原始表头和处理后表头用于验证
        let hasFilterColumnsOp = false;
        let originalHeadersAll = {};
        let processedHeadersAll = {};
        
        // 辅助函数：检测值是否可能是Excel日期
        function isLikelyExcelDate(value) {
            // 如果是数字，且在有效的Excel日期范围内（1900年至今，约为0-50000之间的数字）
            return typeof value === 'number' && value > 0 && value < 50000;
        }
        
        // 辅助函数：检测列的数据类型
        function detectDateColumns(jsonData) {
            if (jsonData.length < 2) return []; // 需要至少有表头和一行数据
            
            const headers = jsonData[0];
            const dateColumns = [];
            
            // 对每一列进行类型检测
            for (let colIndex = 0; colIndex < headers.length; colIndex++) {
                const header = headers[colIndex];
                if (header === undefined || header === null) continue;
                
                // 检查列名是否包含时间/日期相关关键词
                const isTimeColumn = /时间|日期|date|time/i.test(String(header));
                if (!isTimeColumn) continue; // 如果列名不包含时间相关关键词，跳过
                
                let dateCount = 0;
                let totalCount = 0;
                
                // 检查最多20行数据来判断是否为日期列
                for (let rowIndex = 1; rowIndex < Math.min(jsonData.length, 21); rowIndex++) {
                    if (!jsonData[rowIndex] || colIndex >= jsonData[rowIndex].length) continue;
                    
                    const cellValue = jsonData[rowIndex][colIndex];
                    if (cellValue === undefined || cellValue === null) continue;
                    
                    totalCount++;
                    
                    if (isLikelyExcelDate(cellValue)) {
                        dateCount++;
                    }
                }
                
                // 如果超过70%的单元格是日期格式，判定为日期列
                if (totalCount > 0 && dateCount / totalCount > 0.7) {
                    dateColumns.push({
                        column: header,
                        index: colIndex
                    });
                }
            }
            
            return dateColumns;
        }
        
        // 处理每个工作表
        for (const sheetName of sheetNames) {
            // 获取原始工作表
            const originalSheet = workbook.Sheets[sheetName];
            
            // 转换为JSON以便处理
            let jsonData = XLSX.utils.sheet_to_json(originalSheet, {header: 1});
            
            // 如果没有数据，跳过此工作表
            if (jsonData.length === 0) {
                // 保留空工作表
                XLSX.utils.book_append_sheet(resultWorkbook, originalSheet, sheetName);
                continue;
            }
            
            // 处理前先保存列名(第一行)
            const originalHeaders = jsonData.length > 0 ? [...jsonData[0]] : [];
            originalHeadersAll[sheetName] = originalHeaders;
            
            // 检测是否存在可能的日期列
            const dateColumns = detectDateColumns(jsonData);
            if (dateColumns.length > 0) {
                console.log(`在工作表 "${sheetName}" 中检测到 ${dateColumns.length} 个可能的日期列:`, 
                    dateColumns.map(col => col.column).join(', '));
                
                // 自动添加日期格式化操作
                let hasExplicitDateFormatting = false;
                
                // 检查是否已经有明确的日期格式化操作
                for (const operation of operations) {
                    if (operation.type === 'transform_data' && 
                        operation.params && 
                        operation.params.operations) {
                        for (const op of operation.params.operations) {
                            if (op.type === 'format_date') {
                                hasExplicitDateFormatting = true;
                                break;
                            }
                        }
                    }
                    if (hasExplicitDateFormatting) break;
                }
                
                // 如果没有明确的日期格式化操作，添加自动格式化
                if (!hasExplicitDateFormatting) {
                    // 创建日期格式化操作
                    const dateFormatOperations = dateColumns.map(col => ({
                        type: 'format_date',
                        column: col.column
                    }));
                    
                    // 添加到操作列表
                    operations.push({
                        type: 'transform_data',
                        params: {
                            operations: dateFormatOperations,
                            skipHeader: true
                        },
                        auto_generated: true // 标记为自动生成的操作
                    });
                    
                    console.log('已自动添加日期格式化操作:', dateFormatOperations);
                }
            }
            
            // 应用每个操作
            for (const operation of operations) {
                try {
                    const type = operation.type;
                    const params = operation.params || {};
                    
                    // 记录哪些工作表有列筛选操作
                    if (type === 'filter_columns') {
                        hasFilterColumnsOp = true;
                        // 将原始指令添加到参数中，以便在filterColumns函数中使用
                        params.originalInstruction = instruction;
                    }
                    
                    // 记录操作前的数据行列
                    const rowsBefore = jsonData.length;
                    const colsBefore = jsonData[0] ? jsonData[0].length : 0;
                    
                    // 执行相应的处理操作
                    switch (type) {
                        case 'filter_columns':
                            jsonData = filterColumns(jsonData, params);
                            break;
                        case 'remove_rows':
                            jsonData = removeRows(jsonData, params);
                            break;
                        case 'filter_rows':
                            jsonData = filterRows(jsonData, params);
                            break;
                        case 'sort':
                            jsonData = sortData(jsonData, params);
                            break;
                        case 'rename_columns':
                            jsonData = renameColumns(jsonData, params);
                            break;
                        case 'transform_data':
                            jsonData = transformData(jsonData, params);
                            break;
                        default:
                            console.warn(`未知的操作类型: ${type}`);
                    }
                    
                    // 记录操作后的数据行列
                    const rowsAfter = jsonData.length;
                    const colsAfter = jsonData[0] ? jsonData[0].length : 0;
                    
                    const operationInfo = operation.auto_generated ? '[自动生成] ' : '';
                    console.log(`${operationInfo}操作 ${type} 执行结果: 行数 ${rowsBefore}->${rowsAfter}, 列数 ${colsBefore}->${colsAfter}`);
                    
                    // 判断是否有效处理，如果操作后数据没有任何变化，可能是处理有问题
                    if (type === 'filter_columns' && colsBefore === colsAfter && 
                        instruction.toLowerCase().includes('只保留') && params.include) {
                        console.warn(`警告: filter_columns操作没有减少列数，请检查列名是否匹配`);
                    }
                } catch (opError) {
                    console.error(`执行操作 ${operation.type} 时出错:`, opError);
                }
            }
            
            // 保存处理后的表头
            if (jsonData.length > 0) {
                processedHeadersAll[sheetName] = [...jsonData[0]];
            }
            
            // 将处理后的JSON数据转换回工作表
            const processedSheet = XLSX.utils.aoa_to_sheet(jsonData);
            
            // 添加到结果工作簿
            XLSX.utils.book_append_sheet(resultWorkbook, processedSheet, `${sheetName}_处理后`);
        }
        
        // 验证处理结果是否符合预期（仅对明确的列筛选需求进行验证）
        if (hasFilterColumnsOp && instruction.toLowerCase().includes('只保留')) {
            console.log('验证列筛选结果...');
            // 提取用户要求保留的列名
            const keepColumns = extractColumnNamesFromInstruction(instruction);
            
            if (keepColumns.length > 0) {
                console.log('用户要求保留的列:', keepColumns);
                
                // 检查每个工作表处理后的表头
                for (const sheetName in processedHeadersAll) {
                    const processedHeaders = processedHeadersAll[sheetName];
                    const originalHeaders = originalHeadersAll[sheetName] || [];
                    
                    console.log(`工作表 ${sheetName} 原始表头:`, originalHeaders);
                    console.log(`工作表 ${sheetName} 处理后表头:`, processedHeaders);
                    
                    // 检查是否成功保留了指定的列
                    const allKeptColumnsFound = keepColumns.every(col => processedHeaders.includes(col));
                    const anyExtraColumns = processedHeaders.some(col => !keepColumns.includes(col));
                    
                    if (!allKeptColumnsFound) {
                        console.warn(`警告: 工作表 ${sheetName} 没有保留所有指定的列`);
                    }
                    
                    if (anyExtraColumns && keepColumns.length > 0) {
                        console.warn(`警告: 工作表 ${sheetName} 保留了一些未指定的列`);
                    }
                }
            }
        }
        
        // 如果没有成功添加任何工作表，可能是操作失败
        if (resultWorkbook.SheetNames.length === 0) {
            throw new Error('所有处理操作失败，无有效工作表输出');
        }
        
        // 添加AI处理报告工作表
        addProcessingReportSheet(resultWorkbook, instruction, processingSteps);
        
        // 转回二进制
        const wbout = XLSX.write(resultWorkbook, {bookType:'xlsx', type:'array'});
        
        // 确保返回的是ArrayBuffer
        const buffer = wbout.buffer || new Uint8Array(wbout).buffer;
        console.log('处理结果类型:', buffer.constructor.name, '大小:', buffer.byteLength);
        return buffer;
    } catch (error) {
        console.error('Excel处理失败:', error);
        
        // 如果处理失败，创建一个只包含报告的工作簿
        try {
            const fallbackWorkbook = XLSX.read(new Uint8Array(fileData), {type: 'array'});
            const reportWorkbook = createReportWorkbook(fallbackWorkbook, instruction, {
                summary: '处理失败',
                error: error.message,
                text: typeof processingSteps === 'string' ? processingSteps : JSON.stringify(processingSteps, null, 2)
            });
            
            // 确保返回的是ArrayBuffer
            if (reportWorkbook instanceof ArrayBuffer) {
                console.log('报告结果类型: ArrayBuffer, 大小:', reportWorkbook.byteLength);
                return reportWorkbook;
            } else if (reportWorkbook instanceof Uint8Array || reportWorkbook.buffer) {
                const buffer = reportWorkbook.buffer || new Uint8Array(reportWorkbook).buffer;
                console.log('报告结果类型(转换后): ArrayBuffer, 大小:', buffer.byteLength);
                return buffer;
            } else {
                console.error('无法获取有效的ArrayBuffer，返回原始文件');
                return fileData;
            }
        } catch (fallbackError) {
            console.error('创建报告工作簿也失败:', fallbackError);
            return fileData; // 返回原始文件
        }
    }
}

/**
 * 从指令中提取列名
 * 用于验证处理结果是否符合预期
 */
function extractColumnNamesFromInstruction(instruction) {
    // 检查"只保留...列"模式
    let match;
    let columns = [];
    
    // 尝试匹配常见的保留列模式
    if (instruction.includes('只保留')) {
        // 例如："只保留'选购商品''商品规格''商品数量''订单应付金额''订单提交时间'这5列"
        const regex = /只保留[\s'"]*([^'"]+?)['"][\s'"]*[,，、][\s'"]*([^'"]+?)['"][\s'"]*[,，、][\s'"]*([^'"]+?)['"][\s'"]*[,，、][\s'"]*([^'"]+?)['"][\s'"]*[,，、][\s'"]*([^'"]+?)['"][\s'"]*这/;
        match = instruction.match(regex);
        if (match) {
            for (let i = 1; i < match.length; i++) {
                if (match[i]) columns.push(match[i].trim());
            }
        }
        
        // 如果上面的正则没匹配成功，尝试更宽松的模式
        if (columns.length === 0) {
            // 提取引号中的文本作为列名
            const quotedTexts = instruction.match(/['"]([^'"]+?)['"]/g) || [];
            columns = quotedTexts.map(text => text.replace(/['"]/g, '').trim());
        }
    }
    
    return columns;
}

/**
 * 添加处理报告工作表
 */
function addProcessingReportSheet(workbook, instruction, processingSteps) {
    // 创建建议数据数组
    const reportRows = [];
    
    // 添加标题
    reportRows.push(['AI数据处理报告']);
    reportRows.push(['']);
    
    // 添加处理时间
    reportRows.push(['处理时间:', new Date().toLocaleString()]);
    reportRows.push(['']);
    
    // 添加原始文件名
    if (typeof aiPreprocessFile !== 'undefined' && aiPreprocessFile && aiPreprocessFile.name) {
        reportRows.push(['原始文件:', aiPreprocessFile.name]);
        reportRows.push(['']);
    }
    
    // 添加处理需求
    reportRows.push(['处理需求:']);
    if (instruction) {
        instruction.split('\n').forEach(line => {
            reportRows.push([line]);
        });
    } else {
        reportRows.push(['未提供指令']);
    }
    reportRows.push(['']);
    
    // 添加处理摘要
    reportRows.push(['处理摘要:']);
    if (typeof processingSteps === 'string') {
        reportRows.push([processingSteps]);
    } else if (processingSteps) {
        reportRows.push([processingSteps.summary || '未提供摘要']);
    } else {
        reportRows.push(['未提供处理步骤']);
    }
    reportRows.push(['']);
    
    // 检查是否有错误信息
    if (processingSteps && processingSteps.error) {
        reportRows.push(['错误信息:']);
        reportRows.push([processingSteps.error]);
        reportRows.push(['']);
    }
    
    // 检查是否有详细说明
    if (processingSteps && processingSteps.text) {
        reportRows.push(['详细说明:']);
        reportRows.push([processingSteps.text]);
        reportRows.push(['']);
    }
    
    // 检查是否有自动生成的操作
    if (processingSteps && typeof processingSteps !== 'string') {
        const operations = processingSteps.operations || processingSteps.steps || [];
        const autoOps = operations.filter(op => op.auto_generated);
        
        if (autoOps.length > 0) {
            const autoDateOps = autoOps.filter(op => 
                op.type === 'transform_data' && 
                op.params && 
                op.params.operations && 
                op.params.operations.some(subOp => subOp.type === 'format_date')
            );
            
            if (autoDateOps.length > 0) {
                // 收集所有自动格式化的日期列
                const dateColumns = [];
                autoDateOps.forEach(op => {
                    if (op.params && op.params.operations) {
                        op.params.operations.forEach(subOp => {
                            if (subOp.type === 'format_date' && subOp.column) {
                                dateColumns.push(subOp.column);
                            }
                        });
                    }
                });
                
                // 添加到报告中
                if (dateColumns.length > 0) {
                    reportRows.push(['自动格式化:']);
                    reportRows.push([`系统检测到并自动格式化了以下日期列: ${dateColumns.join(', ')}`]);
                    reportRows.push(['Excel将日期存储为数字（自1900年1月1日起的天数），系统已将这些数字转换为可读的日期格式。']);
                    reportRows.push(['']);
                }
            }
        }
    }
    
    // 添加处理步骤详情
    if (processingSteps && typeof processingSteps !== 'string') {
        const operations = processingSteps.operations || processingSteps.steps || [];
        
        if (operations.length > 0) {
            reportRows.push(['应用的处理步骤:']);
            
            operations.forEach((op, index) => {
                const isAuto = op.auto_generated ? '[自动] ' : '';
                reportRows.push([`${index + 1}. ${isAuto}${op.type || '未知操作'}`]);
                
                // 添加参数详情
                if (op.params) {
                    Object.entries(op.params).forEach(([key, value]) => {
                        if (key === 'operations' && Array.isArray(value)) {
                            // 特殊处理transform_data的operations数组
                            reportRows.push([`   - ${key}:`]);
                            value.forEach((subOp, subIndex) => {
                                let subOpDesc = `     ${subIndex + 1}. ${subOp.type}`;
                                if (subOp.column) {
                                    subOpDesc += ` (列: ${subOp.column})`;
                                }
                                reportRows.push([subOpDesc]);
                            });
                        } else {
                            const valueStr = Array.isArray(value) ? value.join(', ') : String(value);
                            reportRows.push([`   - ${key}: ${valueStr}`]);
                        }
                    });
                }
            });
            
            reportRows.push(['']);
        }
    }
    
    // 添加说明
    reportRows.push(['说明:']);
    reportRows.push(['1. 原始数据已保留在原始工作表中']);
    reportRows.push(['2. 处理后的数据保存在带有"_处理后"后缀的工作表中']);
    reportRows.push(['3. 如有需要，您可以手动复制所需数据']);
    
    // 创建一个新的工作表记录处理报告
    const reportSheet = XLSX.utils.aoa_to_sheet(reportRows);
    
    // 设置列宽
    reportSheet['!cols'] = [{ wch: 80 }];
    
    // 添加到工作簿(放在第一个位置)
    XLSX.utils.book_append_sheet(workbook, reportSheet, 'AI处理报告', true);
    
    // 确保报告工作表在第一位
    const reportSheetIndex = workbook.SheetNames.indexOf('AI处理报告');
    if (reportSheetIndex > 0) {
        const sheetNames = workbook.SheetNames;
        const reportSheet = sheetNames.splice(reportSheetIndex, 1)[0];
        sheetNames.unshift(reportSheet);
        workbook.SheetNames = sheetNames;
    }
}

/**
 * 创建只包含报告的工作簿
 */
function createReportWorkbook(originalWorkbook, instruction, content) {
    // 创建新工作簿
    const reportWorkbook = XLSX.utils.book_new();
    
    // 获取字符串内容
    let textContent = '';
    if (typeof content === 'string') {
        textContent = content;
    } else if (content.text) {
        textContent = content.text;
    } else {
        textContent = JSON.stringify(content, null, 2);
    }
    
    // 创建报告数据
    const reportRows = [
        ['AI数据处理报告'],
        [''],
        ['处理时间:', new Date().toLocaleString()],
        [''],
        ['原始文件:', aiPreprocessFile.name],
        [''],
        ['处理需求:'],
        [instruction],
        [''],
        ['处理结果:'],
        [content.summary || '未提供摘要'],
        [''],
        ['详细信息:']
    ];
    
    // 添加文本内容，按行分割
    textContent.split('\n').forEach(line => {
        reportRows.push([line]);
    });
    
    // 添加错误信息(如果有)
    if (content.error) {
        reportRows.push(['']);
        reportRows.push(['错误信息:']);
        reportRows.push([content.error]);
    }
    
    // 添加说明
    reportRows.push(['']);
    reportRows.push(['说明:']);
    reportRows.push(['处理过程中遇到了问题，无法生成处理后的数据']);
    reportRows.push(['请检查处理需求或联系技术支持']);
    
    // 创建报告工作表
    const reportSheet = XLSX.utils.aoa_to_sheet(reportRows);
    
    // 设置列宽
    reportSheet['!cols'] = [{ wch: 80 }];
    
    // 添加到工作簿
    XLSX.utils.book_append_sheet(reportWorkbook, reportSheet, 'AI处理报告');
    
    // 尝试保留原始数据
    try {
        // 最多复制前3个工作表
        const originalSheetNames = originalWorkbook.SheetNames.slice(0, 3);
        for (const sheetName of originalSheetNames) {
            const sheet = originalWorkbook.Sheets[sheetName];
            XLSX.utils.book_append_sheet(reportWorkbook, sheet, `原始_${sheetName}`);
        }
    } catch (e) {
        console.error('复制原始工作表失败', e);
    }
    
    // 转回二进制
    const wbout = XLSX.write(reportWorkbook, {bookType:'xlsx', type:'array'});
    
    // 确保返回的是ArrayBuffer
    const buffer = wbout.buffer || new Uint8Array(wbout).buffer;
    console.log('报告工作簿类型:', buffer.constructor.name, '大小:', buffer.byteLength);
    return buffer;
}

// ========== 数据处理函数 ==========

/**
 * 筛选列
 */
function filterColumns(jsonData, params) {
    // 没有数据直接返回
    if (!jsonData || jsonData.length === 0) return jsonData;
    
    // 获取要保留的列
    const includeColumns = params.include || [];
    const excludeColumns = params.exclude || [];
    
    // 如果没有指定任何操作，返回原始数据
    if (includeColumns.length === 0 && excludeColumns.length === 0) {
        return jsonData;
    }
    
    // 获取表头
    const headers = jsonData[0];
    console.log('filterColumns - 原始表头:', headers);
    console.log('filterColumns - 要包含的列:', includeColumns);
    console.log('filterColumns - 要排除的列:', excludeColumns);
    
    // 执行名称规范化以提高匹配率
    const normalizedHeaders = headers.map(h => String(h).trim());
    const normalizedInclude = includeColumns.map(col => String(col).trim());
    const normalizedExclude = excludeColumns.map(col => String(col).trim());
    
    // 找出要保留的列索引
    let columnsToKeep = [];
    
    if (includeColumns.length > 0) {
        // 如果指定了要包含的列，只保留这些列
        // 使用精确匹配，但如果精确匹配找不到列，再考虑使用模糊匹配
        
        // 第一步：尝试精确匹配
        let exactMatches = normalizedHeaders.map((header, index) => {
            return normalizedInclude.includes(header) ? index : -1;
        }).filter(idx => idx !== -1);
        
        // 如果找到了精确匹配的列，就只使用它们
        if (exactMatches.length > 0) {
            console.log('使用精确匹配的列:', exactMatches);
            columnsToKeep = exactMatches;
        } else {
            // 第二步：如果没有精确匹配，尝试部分匹配
            // 为了严格控制，我们优先使用包含关系，而不是被包含关系
            
            const partialMatches = [];
            for (const includeCol of normalizedInclude) {
                let bestMatchIndex = -1;
                let bestMatchScore = 0;
                
                // 计算每个表头与当前要包含列的匹配分数
                normalizedHeaders.forEach((header, index) => {
                    // 完全匹配
                    if (header === includeCol) {
                        bestMatchIndex = index;
                        bestMatchScore = Infinity; // 使用无限大代表精确匹配
                        return;
                    }
                    
                    // 包含关系匹配
                    if (header.includes(includeCol)) {
                        // 如果表头包含要包含的列名，这是一个较好的匹配
                        const score = includeCol.length / header.length; // 匹配部分越长，分数越高
                        if (score > bestMatchScore) {
                            bestMatchScore = score;
                            bestMatchIndex = index;
                        }
                    } else if (includeCol.includes(header)) {
                        // 如果要包含的列名包含表头，这是次优的匹配
                        const score = header.length / includeCol.length * 0.8; // 乘以0.8是为了降低优先级
                        if (score > bestMatchScore) {
                            bestMatchScore = score;
                            bestMatchIndex = index;
                        }
                    }
                });
                
                // 如果找到了匹配
                if (bestMatchIndex !== -1) {
                    console.log(`部分匹配: "${includeCol}" 匹配到表头 "${normalizedHeaders[bestMatchIndex]}" (分数: ${bestMatchScore})`);
                    partialMatches.push(bestMatchIndex);
                } else {
                    console.warn(`未找到与 "${includeCol}" 匹配的列`);
                }
            }
            
            // 确保没有重复
            columnsToKeep = [...new Set(partialMatches)];
            
            // 如果"仅保留"或"只保留"模式，但匹配的列数与请求的列数不符，输出警告
            const instruction = params.originalInstruction || '';
            if ((instruction.includes('仅保留') || instruction.includes('只保留')) && 
                columnsToKeep.length !== normalizedInclude.length) {
                console.warn(`警告: 请求保留 ${normalizedInclude.length} 列，但只找到了 ${columnsToKeep.length} 列匹配`);
            }
        }
    } else {
        // 如果只指定了要排除的列，保留所有未被排除的列
        columnsToKeep = normalizedHeaders.map((header, index) => {
            // 检查精确匹配
            if (normalizedExclude.includes(header)) {
                return -1;
            }
            // 检查部分匹配（如果没有精确匹配）
            for (const excludeCol of normalizedExclude) {
                // 如果标题包含要排除的列名，或者要排除的列名包含标题
                if (header.includes(excludeCol) || excludeCol.includes(header)) {
                    console.log(`部分匹配: 表头 "${header}" 排除于 "${excludeCol}"`);
                    return -1;
                }
            }
            return index;
        }).filter(idx => idx !== -1);
    }
    
    console.log('filterColumns - 保留的列索引:', columnsToKeep);
    
    // 筛选列
    const result = jsonData.map(row => {
        return columnsToKeep.map(index => row[index]);
    });
    
    console.log('filterColumns - 处理后表头:', result[0]);
    console.log('filterColumns - 最终保留的列数:', result[0].length);
    return result;
}

/**
 * 删除行
 */
function removeRows(jsonData, params) {
    // 没有数据直接返回
    if (!jsonData || jsonData.length === 0) return jsonData;
    
    // 获取要删除的行范围
    const start = params.start || 0;
    const end = params.end || jsonData.length;
    const skipHeader = params.skipHeader || false;
    
    // 保留表头
    const headerRow = skipHeader ? [jsonData[0]] : [];
    
    // 筛选行
    const filteredRows = jsonData.filter((_, index) => {
        // 如果是要跳过的表头，保留
        if (skipHeader && index === 0) return true;
        // 其他行，如果不在删除范围内，保留
        return index < start || index >= end;
    });
    
    return filteredRows;
}

/**
 * 筛选行
 */
function filterRows(jsonData, params) {
    // 没有数据直接返回
    if (!jsonData || jsonData.length === 0) return jsonData;
    
    // 获取筛选条件
    const conditions = params.conditions || [];
    const skipHeader = params.skipHeader !== false; // 默认跳过表头
    
    // 如果没有条件，返回原始数据
    if (conditions.length === 0) return jsonData;
    
    // 获取表头以便查找列索引
    const headers = jsonData[0];
    
    // 保留第一行(表头)
    const headerRow = skipHeader ? [jsonData[0]] : [];
    
    // 对每一行应用条件
    const filteredRows = jsonData.filter((row, rowIndex) => {
        // 跳过表头行
        if (skipHeader && rowIndex === 0) return true;
        
        // 检查是否满足所有条件
        return conditions.every(condition => {
            const columnIndex = headers.indexOf(condition.column);
            if (columnIndex === -1) return true; // 如果找不到列，跳过此条件
            
            const cellValue = row[columnIndex];
            const targetValue = condition.value;
            
            // 根据操作符比较
            switch (condition.operator) {
                case 'equals':
                    return cellValue == targetValue;
                case 'not_equals':
                    return cellValue != targetValue;
                case 'contains':
                    return String(cellValue).includes(String(targetValue));
                case 'not_contains':
                    return !String(cellValue).includes(String(targetValue));
                case 'greater_than':
                    return Number(cellValue) > Number(targetValue);
                case 'less_than':
                    return Number(cellValue) < Number(targetValue);
                case 'empty':
                    return cellValue === undefined || cellValue === null || cellValue === '';
                case 'not_empty':
                    return cellValue !== undefined && cellValue !== null && cellValue !== '';
                default:
                    return true;
            }
        });
    });
    
    return filteredRows;
}

/**
 * 排序数据
 */
function sortData(jsonData, params) {
    // 没有数据直接返回
    if (!jsonData || jsonData.length < 2) return jsonData;
    
    // 获取排序列和方向
    const column = params.column;
    const direction = params.direction || 'asc'; // 默认升序
    const skipHeader = params.skipHeader !== false; // 默认跳过表头
    
    // 如果没有指定列，返回原始数据
    if (!column) return jsonData;
    
    // 获取表头和数据行
    const headers = jsonData[0];
    const dataRows = skipHeader ? jsonData.slice(1) : jsonData;
    
    // 找到列索引
    const columnIndex = headers.indexOf(column);
    if (columnIndex === -1) return jsonData; // 如果找不到列，返回原始数据
    
    // 对数据行排序
    dataRows.sort((a, b) => {
        let valueA = a[columnIndex];
        let valueB = b[columnIndex];
        
        // 尝试数字比较
        if (!isNaN(Number(valueA)) && !isNaN(Number(valueB))) {
            valueA = Number(valueA);
            valueB = Number(valueB);
        } else {
            valueA = String(valueA || '');
            valueB = String(valueB || '');
        }
        
        // 根据方向排序
        if (direction.toLowerCase() === 'asc') {
            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
            return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
    });
    
    // 重组数据
    return skipHeader ? [headers, ...dataRows] : dataRows;
}

/**
 * 重命名列
 */
function renameColumns(jsonData, params) {
    // 没有数据直接返回
    if (!jsonData || jsonData.length === 0) return jsonData;
    
    // 获取重命名映射
    const mapping = params.mapping || {};
    
    // 如果没有映射，返回原始数据
    if (Object.keys(mapping).length === 0) return jsonData;
    
    // 获取表头
    const headers = [...jsonData[0]];
    
    // 应用重命名
    Object.entries(mapping).forEach(([oldName, newName]) => {
        const index = headers.indexOf(oldName);
        if (index !== -1) {
            headers[index] = newName;
        }
    });
    
    // 返回新的数据集
    return [headers, ...jsonData.slice(1)];
}

/**
 * 转换数据
 */
function transformData(jsonData, params) {
    // 没有数据直接返回
    if (!jsonData || jsonData.length === 0) return jsonData;
    
    // 获取转换操作
    const operations = params.operations || [];
    const skipHeader = params.skipHeader !== false; // 默认跳过表头
    
    // 如果没有操作，返回原始数据
    if (operations.length === 0) return jsonData;
    
    // 获取表头
    const headers = jsonData[0];
    
    // 创建结果数组
    const result = skipHeader ? [headers] : [];
    
    // 获取数据行
    const dataRows = skipHeader ? jsonData.slice(1) : jsonData;
    
    // 对每一行应用转换
    dataRows.forEach(row => {
        const newRow = [...row]; // 复制行以避免修改原始数据
        
        // 应用每个转换操作
        operations.forEach(operation => {
            const columnIndex = headers.indexOf(operation.column);
            if (columnIndex === -1) return; // 如果找不到列，跳过此操作
            
            // 获取单元格值
            let cellValue = newRow[columnIndex];
            
            // 根据操作类型转换数据
            switch (operation.type) {
                case 'to_upper':
                    if (cellValue) newRow[columnIndex] = String(cellValue).toUpperCase();
                    break;
                case 'to_lower':
                    if (cellValue) newRow[columnIndex] = String(cellValue).toLowerCase();
                    break;
                case 'multiply':
                    if (!isNaN(Number(cellValue))) {
                        newRow[columnIndex] = Number(cellValue) * (operation.value || 1);
                    }
                    break;
                case 'divide':
                    if (!isNaN(Number(cellValue)) && operation.value !== 0) {
                        newRow[columnIndex] = Number(cellValue) / (operation.value || 1);
                    }
                    break;
                case 'add':
                    if (!isNaN(Number(cellValue))) {
                        newRow[columnIndex] = Number(cellValue) + (operation.value || 0);
                    }
                    break;
                case 'subtract':
                    if (!isNaN(Number(cellValue))) {
                        newRow[columnIndex] = Number(cellValue) - (operation.value || 0);
                    }
                    break;
                case 'replace':
                    if (cellValue !== undefined && cellValue !== null) {
                        newRow[columnIndex] = String(cellValue).replace(
                            operation.search || '',
                            operation.replacement || ''
                        );
                    }
                    break;
                case 'format_date':
                    try {
                        if (cellValue) {
                            // 判断列名是否可能是时间相关字段
                            const columnName = headers[columnIndex] || '';
                            const isTimeColumn = /时间|日期|date|time/i.test(columnName);
                            
                            // 判断是否为Excel日期数值格式（如45716.93505）
                            if ((typeof cellValue === 'number' || (typeof cellValue === 'string' && !isNaN(parseFloat(cellValue)))) && isTimeColumn) {
                                const excelDateValue = parseFloat(cellValue);
                                // Excel日期从1900年1月1日开始，但有一个1900年2月29日的bug（1900年不是闰年）
                                // 因此大于等于60的数值需要减1进行修正
                                let dateValue = excelDateValue;
                                if (dateValue >= 60) {
                                    dateValue -= 1;
                                }
                                // 计算日期：Excel基准日期是1899年12月30日（而不是31日，因为历史原因）
                                const baseDate = new Date(1899, 11, 30);
                                const excelDate = new Date(baseDate.getTime() + dateValue * 24 * 60 * 60 * 1000);
                                
                                // 检查日期是否有效
                                if (!isNaN(excelDate.getTime())) {
                                    // 格式化日期时间
                                    const year = excelDate.getFullYear();
                                    const month = String(excelDate.getMonth() + 1).padStart(2, '0');
                                    const day = String(excelDate.getDate()).padStart(2, '0');
                                    
                                    // 如果有小数部分，说明包含时间
                                    if (excelDateValue % 1 !== 0) {
                                        const hours = String(excelDate.getHours()).padStart(2, '0');
                                        const minutes = String(excelDate.getMinutes()).padStart(2, '0');
                                        const seconds = String(excelDate.getSeconds()).padStart(2, '0');
                                        newRow[columnIndex] = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                                    } else {
                                        // 只有日期部分
                                        newRow[columnIndex] = `${year}-${month}-${day}`;
                                    }
                                }
                            } else if (isTimeColumn) {
                                // 只有时间列才尝试标准日期格式解析
                                const date = new Date(cellValue);
                                if (!isNaN(date.getTime())) {
                                    // 使用标准格式化
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const day = String(date.getDate()).padStart(2, '0');
                                    
                                    // 检查是否包含时间
                                    if (date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0) {
                                        const hours = String(date.getHours()).padStart(2, '0');
                                        const minutes = String(date.getMinutes()).padStart(2, '0');
                                        const seconds = String(date.getSeconds()).padStart(2, '0');
                                        newRow[columnIndex] = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                                    } else {
                                        newRow[columnIndex] = `${year}-${month}-${day}`;
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.error('日期格式化失败:', e, '原始值:', cellValue);
                    }
                    break;
                case 'extract':
                    if (cellValue) {
                        const match = String(cellValue).match(operation.pattern || /./);
                        newRow[columnIndex] = match ? match[0] : cellValue;
                    }
                    break;
                case 'set_value':
                    newRow[columnIndex] = operation.value;
                    break;
            }
        });
        
        // 添加转换后的行
        result.push(newRow);
    });
    
    return result;
}

/**
 * 下载处理后的文件
 */
function downloadProcessedFile() {
    // 检查是否有处理后的文件
    if (!processedFileData) {
        showNotice('warning', '没有处理后的文件可下载');
        console.error('下载失败: processedFileData 为空');
        return;
    }
    
    try {
        console.log('准备下载文件，数据类型:', processedFileData.constructor.name);
        console.log('数据大小:', processedFileData.byteLength || '未知');
        
        // 准备二进制数据
        let binaryData;
        
        // 处理不同类型的数据
        if (processedFileData instanceof ArrayBuffer) {
            binaryData = processedFileData;
            console.log('使用ArrayBuffer数据下载');
        } else if (processedFileData instanceof Uint8Array) {
            binaryData = processedFileData.buffer;
            console.log('使用Uint8Array数据下载');
        } else if (Array.isArray(processedFileData)) {
            binaryData = new Uint8Array(processedFileData).buffer;
            console.log('使用Array数据下载，已转换为ArrayBuffer');
        } else if (typeof processedFileData === 'object' && processedFileData.buffer) {
            binaryData = processedFileData.buffer;
            console.log('使用带buffer属性的对象下载');
        } else {
            console.error('无法识别的数据类型:', processedFileData);
            showNotice('danger', '数据格式错误，无法下载');
            return;
        }
        
        // 显示下载进度
        showStatusMessage('ai-preprocess-status', '正在生成下载链接...', 'info');
        
        // 创建Blob和下载链接
        const blob = new Blob([binaryData], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        const url = URL.createObjectURL(blob);
        
        // 生成文件名（原文件名前加"AI处理_"前缀）
        const originalFileName = aiPreprocessFile.name;
        const extension = originalFileName.lastIndexOf('.') !== -1 ? 
                        originalFileName.substring(originalFileName.lastIndexOf('.')) : '.xlsx';
        const baseFileName = originalFileName.lastIndexOf('.') !== -1 ? 
                        originalFileName.substring(0, originalFileName.lastIndexOf('.')) : originalFileName;
        const fileName = `AI处理_${baseFileName}${extension}`;
        
        // 创建下载链接
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        
        // 显示下载进度
        showStatusMessage('ai-preprocess-status', '正在下载文件...', 'success');
        
        // 触发下载
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showStatusMessage('ai-preprocess-status', '文件已下载成功', 'success');
        }, 100);
        
        console.log('文件下载成功');
    } catch (error) {
        console.error('下载文件时出错:', error);
        showNotice('danger', '下载文件失败: ' + error.message);
        showStatusMessage('ai-preprocess-status', '下载失败: ' + error.message, 'danger');
    }
}

/**
 * 工具函数：显示状态消息
 */
function showStatusMessage(elementId, message, type = 'info') {
    const statusElement = document.getElementById(elementId);
    if (!statusElement) return;
    
    // 清除旧消息
    statusElement.innerHTML = '';
    
    // 创建新消息
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} py-1 px-2 small`;
    alertDiv.textContent = message;
    
    statusElement.appendChild(alertDiv);
}

/**
 * 工具函数：格式化文件大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
