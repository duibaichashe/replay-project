/**
 * 销售数据与主播排班匹配分析系统 - 分页功能库
 * 此文件包含从app.js和pagination-enhancements.js中抽取的分页相关功能
 */

// 分页状态管理
const paginationState = {
    // 主页面分页状态
    main: {
        currentPage: 1,
        itemsPerPage: 10,
        results: []
    },
    
    // 订单详情模态框分页状态 (categoryId -> pagination state)
    details: {},
    
    // 获取当前主页面分页数据
    getMainPagination() {
        return this.main;
    },
    
    // 获取详情页分页数据
    getDetailPagination(categoryId) {
        if (!this.details[categoryId]) {
            this.initDetailPagination(categoryId);
        }
        return this.details[categoryId];
    },
    
    // 初始化详情页分页
    initDetailPagination(categoryId, options = {}) {
        this.details[categoryId] = {
            currentPage: options.currentPage || 1,
            itemsPerPage: options.itemsPerPage || 5,
            totalItems: options.totalItems || 0,
            totalPages: options.totalPages || 1,
            orders: options.orders || []
        };
        return this.details[categoryId];
    },
    
    // 更新分页状态
    updatePagination(type, id, updates) {
        if (type === 'main') {
            Object.assign(this.main, updates);
            return this.main;
        } else if (type === 'details' && id) {
            if (!this.details[id]) {
                this.initDetailPagination(id);
            }
            Object.assign(this.details[id], updates);
            return this.details[id];
        }
        return null;
    }
};

/**
 * 主页面分页功能
 */

// 显示结果的特定页面
function displayResultsPage(results, page) {
    const state = paginationState.getMainPagination();
    const { itemsPerPage } = state;
    
    // 更新分页状态
    paginationState.updatePagination('main', null, {
        currentPage: page,
        results: results
    });
    
    const tableBody = document.getElementById('matching-table-body');
    if (!tableBody) return;
    
    // 清空表格内容
    tableBody.innerHTML = '';
    
    // 计算当前页的起始和结束索引
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = Math.min(startIdx + itemsPerPage, results.length);
    
    // 检查是否有结果要显示
    if (results.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="7" class="text-center py-4">没有找到匹配的销售记录</td>';
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // 添加当前页的结果到表格
    for (let i = startIdx; i < endIdx; i++) {
        const result = results[i];
        const saleInfo = window.extractSaleInfo ? window.extractSaleInfo(result.sale) : {};
        let anchorName = "";
        let timeSlot = "";
        
        // 处理匹配的主播信息
        if (result.matched) {
            if (typeof result.anchor === 'string') {
                anchorName = result.anchor;
            } else if (result.anchor && result.anchor.name) {
                anchorName = result.anchor.name;
            }
            
            timeSlot = result.timeSlot || '';
        } else {
            anchorName = '<span class="text-muted">未匹配</span>';
            timeSlot = '<span class="text-muted">-</span>';
        }
        
        // 创建行并添加内容
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="product-name">${saleInfo.product || '-'}</div>
            </td>
            <td>${saleInfo.spec || '-'}</td>
            <td class="text-center">${saleInfo.quantity || '-'}</td>
            <td class="text-end">¥${saleInfo.price || '-'}</td>
            <td>${saleInfo.time || '-'}</td>
            <td class="text-center">${anchorName}</td>
            <td>${timeSlot}</td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // 更新分页按钮状态
    updatePaginationButtons(page, Math.ceil(results.length / itemsPerPage));
}

// 创建分页控制
function createPagination(totalItems) {
    const state = paginationState.getMainPagination();
    const { itemsPerPage } = state;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const paginationContainer = document.getElementById('pagination-controls');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = `
        <div class="btn-group">
            <button id="first-page" class="btn btn-outline-primary" disabled>
                <i class="bi bi-chevron-double-left"></i>
            </button>
            <button id="prev-page" class="btn btn-outline-primary" disabled>
                <i class="bi bi-chevron-left"></i>
            </button>
            <button id="pagination-info" class="btn btn-outline-secondary" disabled>
                第 1 页，共 ${totalPages} 页
            </button>
            <button id="next-page" class="btn btn-outline-primary">
                <i class="bi bi-chevron-right"></i>
            </button>
            <button id="last-page" class="btn btn-outline-primary">
                <i class="bi bi-chevron-double-right"></i>
            </button>
        </div>
        <div class="pagination-jump-wrapper">
            <input type="number" id="page-jump-input" min="1" max="${totalPages}" value="1">
            <button id="page-jump-btn" class="jump-page-btn">跳转</button>
        </div>
    `;
    
    // 添加分页事件监听器
    document.getElementById('first-page').addEventListener('click', function() {
        const state = paginationState.getMainPagination();
        if (state.currentPage > 1) {
            displayResultsPage(state.results, 1);
        }
    });
    
    document.getElementById('prev-page').addEventListener('click', function() {
        const state = paginationState.getMainPagination();
        if (state.currentPage > 1) {
            displayResultsPage(state.results, state.currentPage - 1);
        }
    });
    
    document.getElementById('next-page').addEventListener('click', function() {
        const state = paginationState.getMainPagination();
        if (state.currentPage < totalPages) {
            displayResultsPage(state.results, state.currentPage + 1);
        }
    });
    
    document.getElementById('last-page').addEventListener('click', function() {
        const state = paginationState.getMainPagination();
        if (state.currentPage < totalPages) {
            displayResultsPage(state.results, totalPages);
        }
    });
    
    // 添加页码跳转事件监听器
    document.getElementById('page-jump-btn').addEventListener('click', function() {
        jumpToMainPage();
    });
    
    document.getElementById('page-jump-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            jumpToMainPage();
        }
    });
}

// 跳转到主结果页指定页码
function jumpToMainPage() {
    const state = paginationState.getMainPagination();
    const pageInput = document.getElementById('page-jump-input');
    if (!pageInput) return;
    
    let pageNum = parseInt(pageInput.value);
    const totalPages = Math.ceil(state.results.length / state.itemsPerPage);
    
    if (isNaN(pageNum) || pageNum < 1) {
        if (window.showNotice) {
            window.showNotice("warning", "请输入有效的页码");
        } else {
            alert("请输入有效的页码");
        }
        pageInput.value = state.currentPage;
        return;
    }
    
    // 确保页码在有效范围内
    pageNum = Math.max(1, Math.min(pageNum, totalPages));
    
    // 跳转到指定页
    displayResultsPage(state.results, pageNum);
}

// 更新分页按钮状态
function updatePaginationButtons(currentPage, totalPages) {
    const firstPageBtn = document.getElementById('first-page');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const lastPageBtn = document.getElementById('last-page');
    const paginationInfo = document.getElementById('pagination-info');
    const pageJumpInput = document.getElementById('page-jump-input');
    
    if (firstPageBtn) firstPageBtn.disabled = currentPage <= 1;
    if (prevPageBtn) prevPageBtn.disabled = currentPage <= 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages;
    if (lastPageBtn) lastPageBtn.disabled = currentPage >= totalPages;
    
    if (paginationInfo) {
        paginationInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
    }
    
    if (pageJumpInput) {
        pageJumpInput.value = currentPage;
        pageJumpInput.max = totalPages;
    }
}

/**
 * 订单详情模态框分页功能
 */

// 创建订单详情分页控件
function createDetailPagination(categoryId, pagination) {
    const paginationContainer = document.getElementById(`${categoryId}-pagination-controls`);
    if (!paginationContainer) return;
    
    // 保存到分页状态
    paginationState.updatePagination('details', categoryId, pagination);
    
    // 渲染分页UI
    paginationContainer.innerHTML = `
        <div class="btn-group">
            <button id="${categoryId}-first-page" class="btn btn-outline-primary" ${pagination.currentPage <= 1 ? 'disabled' : ''}>
                <i class="bi bi-chevron-double-left"></i>
            </button>
            <button id="${categoryId}-prev-page" class="btn btn-outline-primary" ${pagination.currentPage <= 1 ? 'disabled' : ''}>
                <i class="bi bi-chevron-left"></i>
            </button>
            <button id="${categoryId}-page-info" class="btn btn-outline-secondary" disabled>
                第 ${pagination.currentPage} 页，共 ${pagination.totalPages} 页
            </button>
            <button id="${categoryId}-next-page" class="btn btn-outline-primary" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>
                <i class="bi bi-chevron-right"></i>
            </button>
            <button id="${categoryId}-last-page" class="btn btn-outline-primary" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>
                <i class="bi bi-chevron-double-right"></i>
            </button>
        </div>
        <div class="pagination-jump-wrapper">
            <input type="number" id="${categoryId}-page-input" min="1" max="${pagination.totalPages}" value="${pagination.currentPage}">
            <button id="${categoryId}-page-jump" class="jump-page-btn">跳转</button>
        </div>
    `;
    
    // 更新分页信息
    const paginationInfo = document.getElementById(`${categoryId}-pagination-info`);
    if (paginationInfo) {
        const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
        const end = Math.min(start + pagination.itemsPerPage - 1, pagination.totalItems);
        paginationInfo.innerHTML = `<div class="pagination-info-wrapper">显示 ${start} - ${end} 条，共 ${pagination.totalItems} 条订单</div>`;
    }
    
    // 添加分页按钮事件
    addDetailPaginationEvents(categoryId);
}

// 为详情页分页添加事件监听器
function addDetailPaginationEvents(categoryId) {
    // 获取分页状态
    const pagination = paginationState.getDetailPagination(categoryId);
    
    // 首页按钮事件
    const firstPageBtn = document.getElementById(`${categoryId}-first-page`);
    if (firstPageBtn) {
        firstPageBtn.addEventListener('click', function() {
            if (pagination.currentPage > 1) {
                pagination.currentPage = 1;
                updateDetailPagination(categoryId);
            }
        });
    }
    
    // 上一页按钮事件
    const prevPageBtn = document.getElementById(`${categoryId}-prev-page`);
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            if (pagination.currentPage > 1) {
                pagination.currentPage--;
                updateDetailPagination(categoryId);
            }
        });
    }
    
    // 下一页按钮事件
    const nextPageBtn = document.getElementById(`${categoryId}-next-page`);
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            if (pagination.currentPage < pagination.totalPages) {
                pagination.currentPage++;
                updateDetailPagination(categoryId);
            }
        });
    }
    
    // 末页按钮事件
    const lastPageBtn = document.getElementById(`${categoryId}-last-page`);
    if (lastPageBtn) {
        lastPageBtn.addEventListener('click', function() {
            if (pagination.currentPage < pagination.totalPages) {
                pagination.currentPage = pagination.totalPages;
                updateDetailPagination(categoryId);
            }
        });
    }
    
    // 跳转按钮事件
    const jumpBtn = document.getElementById(`${categoryId}-page-jump`);
    if (jumpBtn) {
        jumpBtn.addEventListener('click', function() {
            console.log(`跳转按钮点击事件触发，类别: ${categoryId}`);
            jumpToDetailPage(categoryId);
        });
    }
    
    // 输入框回车事件
    const pageInput = document.getElementById(`${categoryId}-page-input`);
    if (pageInput) {
        pageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log(`输入框回车事件触发，类别: ${categoryId}`);
                jumpToDetailPage(categoryId);
                e.preventDefault();
            }
        });
    }
}

// 更新详情页分页
function updateDetailPagination(categoryId) {
    const pagination = paginationState.getDetailPagination(categoryId);
    
    // 更新分页按钮状态
    const firstPageBtn = document.getElementById(`${categoryId}-first-page`);
    const prevPageBtn = document.getElementById(`${categoryId}-prev-page`);
    const nextPageBtn = document.getElementById(`${categoryId}-next-page`);
    const lastPageBtn = document.getElementById(`${categoryId}-last-page`);
    const pageInfoBtn = document.getElementById(`${categoryId}-page-info`);
    const pageInput = document.getElementById(`${categoryId}-page-input`);
    
    if (firstPageBtn) firstPageBtn.disabled = pagination.currentPage <= 1;
    if (prevPageBtn) prevPageBtn.disabled = pagination.currentPage <= 1;
    if (nextPageBtn) nextPageBtn.disabled = pagination.currentPage >= pagination.totalPages;
    if (lastPageBtn) lastPageBtn.disabled = pagination.currentPage >= pagination.totalPages;
    
    if (pageInfoBtn) {
        pageInfoBtn.textContent = `第 ${pagination.currentPage} 页，共 ${pagination.totalPages} 页`;
    }
    
    if (pageInput) {
        pageInput.value = pagination.currentPage;
        pageInput.max = pagination.totalPages;
    }
    
    // 更新分页信息文本
    const paginationInfo = document.getElementById(`${categoryId}-pagination-info`);
    if (paginationInfo) {
        const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
        const end = Math.min(start + pagination.itemsPerPage - 1, pagination.totalItems);
        paginationInfo.innerHTML = `<div class="pagination-info-wrapper">显示 ${start} - ${end} 条，共 ${pagination.totalItems} 条订单</div>`;
    }
    
    // 显示当前页的订单
    displayOrdersForCategory(categoryId);
}

// 跳转到详情页指定页码
function jumpToDetailPage(categoryId) {
    console.log(`执行页面跳转函数，类别: ${categoryId}`);
    
    const pagination = paginationState.getDetailPagination(categoryId);
    const pageInput = document.getElementById(`${categoryId}-page-input`);
    
    if (!pageInput) {
        console.error(`未找到类别 ${categoryId} 的页码输入框`);
        return;
    }
    
    let pageNum = parseInt(pageInput.value);
    console.log(`准备跳转到第 ${pageNum} 页，类别: ${categoryId}`);
    
    // 验证页码
    if (isNaN(pageNum) || pageNum < 1) {
        if (window.showNotice) {
            window.showNotice('warning', '请输入有效的页码');
        } else {
            alert('请输入有效的页码');
        }
        pageInput.value = pagination.currentPage;
        return;
    }
    
    // 确保页码在有效范围内
    pageNum = Math.max(1, Math.min(pageNum, pagination.totalPages));
    
    // 更新当前页码
    pagination.currentPage = pageNum;
    
    // 更新UI
    updateDetailPagination(categoryId);
    
    console.log(`跳转完成，当前页: ${pagination.currentPage}`);
}

// 显示指定类别的订单
function displayOrdersForCategory(categoryId) {
    // 获取当前分页状态
    const pagination = paginationState.getDetailPagination(categoryId);
    
    // 如果有内置函数，优先使用
    if (typeof window.displayOrdersForCategory === 'function') {
        window.displayOrdersForCategory(
            categoryId, 
            pagination.orders, 
            pagination.currentPage, 
            pagination.itemsPerPage
        );
        return;
    }
    
    // 获取表格体
    const tableBody = document.getElementById(`${categoryId}-orders-table`);
    if (!tableBody) {
        console.error(`未找到类别 ${categoryId} 的订单表格`);
        return;
    }
    
    // 清空当前表格内容
    tableBody.innerHTML = '';
    
    // 计算当前页的订单
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = Math.min(start + pagination.itemsPerPage, pagination.orders.length);
    const pageOrders = pagination.orders.slice(start, end);
    
    // 检查是否有订单
    if (pageOrders.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" class="text-center">没有找到订单数据</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    // 添加订单到表格
    pageOrders.forEach(order => {
        const saleInfo = window.extractSaleInfo ? window.extractSaleInfo(order.sale) : {};
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
}

/**
 * 分页增强功能
 */

// 增强模态框分页
function enhanceModalPagination() {
    console.log('正在增强模态框分页...');
    
    // 获取模态框标题以提取主播名称
    const modalTitle = document.querySelector('#anchor-details-modal .modal-title');
    if (!modalTitle) {
        console.error('无法找到模态框标题');
        return;
    }
    
    // 提取主播名称
    const anchorName = modalTitle.textContent.split(' ')[0];
    console.log('主播名称:', anchorName);
    
    // 美化左下角分页信息
    beautifyPaginationInfo();
    
    // 修改所有分页控件
    const paginationControls = document.querySelectorAll('[id$="-pagination-controls"]');
    paginationControls.forEach(control => {
        // 提取分类ID
        const controlId = control.id;
        const categoryId = controlId.replace('-pagination-controls', '');
        
        // 查找该类别的所有订单
        if (!paginationState.details[categoryId]) {
            const orders = window.utils.findAnchorCategoryOrders(anchorName, categoryId);
            
            // 初始化分页状态
            paginationState.initDetailPagination(categoryId, {
                currentPage: 1,
                itemsPerPage: 5,
                totalItems: orders.length,
                totalPages: Math.ceil(orders.length / 5),
                orders: orders
            });
        }
        
        // 创建分页控件
        createDetailPagination(categoryId, paginationState.getDetailPagination(categoryId));
    });
}

// 美化分页信息显示
function beautifyPaginationInfo() {
    const paginationInfoElems = document.querySelectorAll('[id$="-pagination-info"]');
    paginationInfoElems.forEach(info => {
        if (info.textContent.includes('显示')) {
            const text = info.textContent;
            info.innerHTML = `<div class="pagination-info-wrapper">${text}</div>`;
        }
    });
}

// 设置全局事件监听器
function setupGlobalPaginationListeners() {
    // 全局事件监听器用于跳转按钮点击事件（处理动态创建的元素）
    document.addEventListener('click', function(event) {
        const target = event.target;
        // 检查点击的是否是跳转按钮
        if (target && target.id && target.id.endsWith('-page-jump')) {
            const categoryId = target.id.replace('-page-jump', '');
            console.log(`检测到跳转按钮点击，类别ID: ${categoryId}`);
            jumpToDetailPage(categoryId);
        }
    });
    
    // 全局事件监听器用于输入框回车事件
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && event.target && event.target.id && event.target.id.endsWith('-page-input')) {
            const categoryId = event.target.id.replace('-page-input', '');
            console.log(`检测到输入框回车，类别ID: ${categoryId}`);
            jumpToDetailPage(categoryId);
            event.preventDefault();
        }
    });
}

// 监听模态框显示事件
function setupModalEvents() {
    document.addEventListener('shown.bs.modal', function(event) {
        if (event.target && event.target.id === 'anchor-details-modal') {
            console.log('模态框显示，应用分页增强');
            setTimeout(enhanceModalPagination, 100);
        }
    });
}

// 初始化分页功能
function initPagination() {
    console.log('初始化分页功能');
    setupGlobalPaginationListeners();
    setupModalEvents();
}

// 导出分页模块
window.pagination = {
    // 状态管理
    getState: () => paginationState,
    
    // 主页面分页
    displayResultsPage,
    createPagination,
    jumpToMainPage,
    updatePaginationButtons,
    
    // 详情页分页
    createDetailPagination,
    updateDetailPagination,
    jumpToDetailPage,
    displayOrdersForCategory,
    
    // 增强功能
    enhanceModalPagination,
    beautifyPaginationInfo,
    
    // 初始化
    init: initPagination
}; 