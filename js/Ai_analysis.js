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
    // 直接初始化AI设置模态框
    const settingsModalElement = document.getElementById('ai-settings-modal');
    if (settingsModalElement) {
        // 为保存按钮添加事件监听器
        const saveButton = document.getElementById('save-ai-settings');
        if (saveButton) {
            // 移除现有事件监听器以避免重复
            saveButton.removeEventListener('click', saveAISettings);
            saveButton.addEventListener('click', saveAISettings);
        }
        
        // 监听模态框显示事件
        settingsModalElement.addEventListener('shown.bs.modal', function() {
            console.log('AI设置模态框已显示');
        });
    }
}

/**
 * 初始化AI功能
 */
function initAIFeatures() {
    // 注意：此功能需要在基础分析完成后才能使用
    // 加载AI设置
    loadAISettings();
    
    // 绑定AI设置表单事件
    bindAISettingsEvents();
    
    // 绑定AI分析按钮事件
    bindAIAnalysisEvents();
    
    console.log('AI分析功能初始化完成');
}

/**
 * 加载AI设置
 */
function loadAISettings() {
    try {
        // 从本地存储加载设置
        const savedSettings = localStorage.getItem('aiSettings');
        if (savedSettings) {
            aiSettings = JSON.parse(savedSettings);
            
            // 填充设置表单
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
    } catch (error) {
        console.error('加载AI设置时出错:', error);
    }
}

/**
 * 绑定AI设置表单事件
 */
function bindAISettingsEvents() {
    // 注意：保存按钮的事件处理已经在initBootstrapComponents中设置，此处不再重复添加
    // 防止事件监听器重复导致的堆栈溢出
    
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
                    } else if (productName.includes('皇家') && !productName.includes('莼悦') && !productName.includes('旺玥')) {
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
                    ${renderMarkdown(result.analysis)}
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
                        ${renderMarkdown(result.analysis)}
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
    promptContent += "注意：返回的必须是有效的JSON格式，不要包含任何额外的标记或文本！返回内容必须可以直接通过JSON.parse()方法解析。\n";
    
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
                    content: "你是一位拥有20年资深经验的高级直播运营专家，擅长分析主播的销售业绩、直播表现和运营策略。你的分析深入专业，建议具有可操作性和针对性。请基于数据提供准确、专业的分析和实用建议。"
                },
                prompt
            ],
            temperature: 0.7,
            max_tokens: 2000
        };
        
        // 根据模型决定是否添加response_format (仅对某些模型添加)
        // 注意：只有部分GPT模型支持response_format，不要给Claude模型添加此参数
        if (modelName.includes('gpt-4') || modelName.includes('gpt-3.5-turbo')) {
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
        
        // 检查是否是函数调用结果
        if (result.choices?.[0]?.message?.function_call) {
            try {
                // 如果是函数调用，直接提取参数JSON
                const functionCallArgs = result.choices[0].message.function_call.arguments;
                console.log('函数调用参数:', functionCallArgs);
                return JSON.parse(functionCallArgs);
            } catch (e) {
                console.warn('无法解析函数调用参数:', e);
            }
        }
        
        // 如果不是函数调用或解析失败，尝试直接处理content
        if (content) {
            // 尝试解析JSON响应 - 处理可能的格式问题
            try {
                // 有时API可能返回```json 包裹的内容，尝试提取
                if (content.includes('```json')) {
                    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
                    if (match && match[1]) {
                        content = match[1].trim();
                        console.log('从Markdown代码块提取的JSON:', content);
                    }
                }
                
                // 尝试解析JSON
                return JSON.parse(content);
            } catch (e) {
                console.warn('无法解析AI返回的JSON数据，尝试其他格式:', e);
                console.log('尝试解析的原始内容:', content);
                
                // 尝试提取summary和analysis
                const summaryMatch = content.match(/summary[：:]\s*(.*?)(?=\n|$)/i);
                const summary = summaryMatch ? summaryMatch[1].trim() : '无法提取摘要';
                
                // 如果无法解析为JSON，处理为纯文本内容
                return {
                    summary: summary,
                    analysis: content
                };
            }
        }
        
        // 如果没有content字段，返回默认内容
        return {
            summary: "API返回的数据无法解析",
            analysis: "无法从API响应中提取有效内容。请检查API设置并重试。"
        };
    } catch (error) {
        console.error('调用AI API时出错:', error);
        throw error;
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
    
    // 替换标题
    text = text.replace(/## (.*?)$/gm, '<h4 class="mt-4">$1</h4>');
    text = text.replace(/# (.*?)$/gm, '<h3 class="mt-4">$1</h3>');
    
    // 替换列表
    text = text.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');
    text = text.replace(/^- (.*?)$/gm, '<li>$1</li>');
    
    // 将连续的列表项包装在列表标签中
    text = text.replace(/(<li>.*?<\/li>)+/g, function(match) {
        return '<ul class="mb-3">' + match + '</ul>';
    });
    
    // 替换加粗文本
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 替换斜体文本
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 替换换行符为段落
    text = text.replace(/\n\n/g, '</p><p>');
    
    // 包装在段落标签中
    text = '<p>' + text + '</p>';
    
    // 修复嵌套的段落标签
    text = text.replace(/<p><\/p>/g, '');
    
    return text;
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
    console.log('显示通知:', type, message);
    
    // 设置标记防止递归调用
    if (window._showingNotice) {
        console.warn('防止递归调用showNotice');
        return;
    }
    
    try {
        window._showingNotice = true;
        
        // 首先尝试使用app.js中的showNotice函数，但只在它不是当前函数的情况下
        if (typeof window.showNotice === 'function' && window.showNotice !== showNotice) {
            window.showNotice(type, message, duration);
            return;
        }
        
        // 检查是否已有通知容器
        let container = document.getElementById('notification-container');
        
        // 如果没有容器，创建一个
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.position = 'fixed';
            container.style.top = '20px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.role = 'alert';
        notification.style.minWidth = '250px';
        notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        notification.style.marginBottom = '10px';
        
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // 添加到容器
        container.appendChild(notification);
        
        // 添加点击关闭事件
        const closeButton = notification.querySelector('.btn-close');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                container.removeChild(notification);
            });
        }
        
        // 设置自动关闭
        setTimeout(() => {
            if (notification.parentNode === container) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode === container) {
                        container.removeChild(notification);
                    }
                }, 150);
            }
        }, duration);
        
        // 如果是一个重要的消息，也在控制台打印
        if (type === 'success' || type === 'danger') {
            console.log(`[通知] ${message}`);
        }
    } finally {
        // 确保清除标记
        window._showingNotice = false;
    }
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
 * 保存AI设置
 */
function saveAISettings() {
    try {
        console.log('保存AI设置...');
        // 获取表单值
        const apiUrl = document.getElementById('ai-api-url').value.trim();
        const apiKey = document.getElementById('ai-api-key').value.trim();
        const model = document.getElementById('ai-model').value;
        const useDemoMode = document.getElementById('use-demo-mode').checked;
        
        // 构建设置对象
        const settings = {
            apiUrl,
            apiKey,
            model,
            useDemoMode
        };
        
        // 如果选择自定义模型，保存自定义模型名称
        if (model === 'custom') {
            settings.customModel = document.getElementById('custom-model').value.trim();
        }
        
        // 验证设置
        if (!useDemoMode) {
            if (!apiUrl) {
                alert('请输入API接口地址');
                return;
            }
            if (!apiKey) {
                alert('请输入API密钥');
                return;
            }
        }
        
        // 保存设置
        aiSettings = settings;
        localStorage.setItem('aiSettings', JSON.stringify(settings));
        
        // 显示成功提示
        showNotice('success', 'AI设置已保存');
        console.log('AI设置已保存:', settings);
        
        // 关闭模态框
        closeModal('ai-settings-modal');
    } catch (error) {
        console.error('保存AI设置时出错:', error);
        alert('保存设置时出错: ' + error.message);
    }
}
