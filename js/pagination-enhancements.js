/**
 * 订单详情模态框分页功能增强
 * 1. 美化左下角分页信息显示
 * 2. 防止页码输入框随页面切换而自动更新
 * 3. 优化跳转模块UI，使其与周围按钮协调
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('订单详情模态框分页功能增强初始化...');
    
    // 使用pagination模块初始化全局分页功能
    if (window.pagination) {
        window.pagination.init();
    } else {
        console.error('未找到pagination模块，使用传统方式初始化');
        setupLegacyPagination();
    }
});

// 兼容性处理：当pagination模块不可用时的回退函数
function setupLegacyPagination() {
    // 监听模态框的显示事件
    document.addEventListener('shown.bs.modal', function(event) {
        if (event.target && event.target.id === 'anchor-details-modal') {
            console.log('模态框显示，应用分页增强（传统方式）');
            setTimeout(enhanceModalPaginationLegacy, 100);
        }
    });
    
    // 全局事件监听器用于跳转按钮点击事件（处理动态创建的元素）
    document.addEventListener('click', function(event) {
        const target = event.target;
        // 检查点击的是否是跳转按钮
        if (target && target.id && target.id.endsWith('-page-jump')) {
            const categoryId = target.id.replace('-page-jump', '');
            console.log(`检测到跳转按钮点击，类别ID: ${categoryId}`);
            jumpToPage(categoryId);
        }
    });
    
    // 全局事件监听器用于输入框回车事件
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && event.target && event.target.id && event.target.id.endsWith('-page-input')) {
            const categoryId = event.target.id.replace('-page-input', '');
            console.log(`检测到输入框回车，类别ID: ${categoryId}`);
            jumpToPage(categoryId);
            event.preventDefault();
        }
    });
}

// 传统方式的模态框分页增强（兼容性保留，不应再被直接调用）
function enhanceModalPaginationLegacy() {
    console.warn('使用传统方式增强模态框分页，建议升级到pagination模块');
    
    if (window.pagination && window.pagination.enhanceModalPagination) {
        window.pagination.enhanceModalPagination();
        return;
    }
    
    // 以下代码仅作为兼容性保留
    console.log('无法找到pagination模块，使用内置方法增强模态框分页');
    
    // ... 这里不再需要复制原有代码，如有需要可回退到原始实现
}

// 跳转到指定页（兼容性保留，但应优先使用pagination模块）
function jumpToPage(categoryId) {
    if (window.pagination && window.pagination.jumpToDetailPage) {
        window.pagination.jumpToDetailPage(categoryId);
        return;
    }
    
    console.warn(`使用传统方式跳转页面，建议升级到pagination模块`);
    // ... 这里不再需要复制原有代码，如有需要可回退到原始实现
} 