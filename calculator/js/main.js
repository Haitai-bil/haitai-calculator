// 全局变量
let materialPrices = {};
let currentRecipe = null;
let recipeData = {};
let energyCostData = null;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        loadAllRecipes(),
        loadEnergyCost()
    ]);
    initializeMaterialLists();
    initializeEventListeners();
    loadPrices();
    showCopyrightInfo();
    
    // 初始化批量计算器并保存到全局变量
    window.batchCalculator = new BatchCalculator();
});

// 初始化材料列表
function initializeMaterialLists() {
    // 初始化杂货材料
    const miscItems = [
        "良之精火", "珍之精火", "灵之精火", "至纯精华",
        // 添加新的鱼鲜系列
        "1级鱼鲜", "2级鱼鲜", "3级鱼鲜", "4级鱼鲜", "5级鱼鲜",
        // 添加新的特殊物品
        "涵虚·麒麟兰寿", "雪豹兰寿", "玉面红袍"
    ];
    createMaterialList('misc-materials', miscItems);

    // 初始化矿物材料
    const mineItems = ["生铁砂", "石英棉", "粗黄铜", "黝钢沙", "粗银石", "雷碣片", "透花岩",
                      "雄黄虬", "岭皂", "碎榴晶", "玛瑙石", "黛晶珠", "灵矿髓"];
    createMaterialList('mine-materials', mineItems);

    // 初始化采摘材料
    const herbItems = ["无条盏", "蓇蓉华", "焉酸草", "苦辛萼", "黄雚盏", "金灯红", "祝余盏",
                      "天萹黄", "萤火萼", "都夷枝", "低光荷汁", "半边莲子", "灵草华"];
    createMaterialList('herb-materials', herbItems);

    // 初始化商店材料
    const shopItems = ["栎木", "麻布", "生皮", "毛纱", "银粉", "清泉", "天水",
                      "棉绳", "漆粉", "线"];
    createMaterialList('shop-materials', shopItems);
}

// 创建材料列表
function createMaterialList(containerId, items) {
    const container = document.getElementById(containerId);
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'material-item';
        div.innerHTML = `
            <span>${item}</span>
            <input type="number" class="price" data-material="${item}" value="0">
            <input type="number" class="quantity" data-material="${item}" value="0">
        `;
        container.appendChild(div);
    });
}

// 初始化事件监��器
function initializeEventListeners() {
    // 为所有材料价格输入框添加事件监听
    document.querySelectorAll('.material-item .price').forEach(input => {
        input.addEventListener('input', () => {
            calculateMaterialCost();
            calculateProfit();
        });
    });

    // 为所有材料数量输入框添加事件监听
    document.querySelectorAll('.material-item .quantity').forEach(input => {
        input.addEventListener('input', () => {
            calculateMaterialCost();
            calculateProfit();
        });
    });

    // 为拍卖行价格输入框添加事件监听
    document.getElementById('auction-price').addEventListener('input', () => {
        calculateProfit();
    });

    // 清除数量按钮的事件监听
    document.getElementById('clear-quantities').addEventListener('click', clearAllQuantities);
}

// 计算材总成本
function calculateMaterialCost() {
    let totalCost = 0;
    
    // 遍历所有材料项
    document.querySelectorAll('.material-item').forEach(item => {
        const price = parseFloat(item.querySelector('.price').value) || 0;
        const quantity = parseFloat(item.querySelector('.quantity').value) || 0;
        totalCost += price * quantity;
    });

    // 更新显示总成本
    document.getElementById('total-cost').textContent = formatNumber(totalCost) + ' 银两';
    
    return totalCost;
}

// 计算预期利润
function calculateProfit() {
    const auctionPrice = parseFloat(document.getElementById('auction-price').value) || 0;
    const materialCost = calculateMaterialCost();
    const profession = document.getElementById('profession-select').value;
    const recipeName = document.getElementById('recipe-select').value;
    
    // 获取烹饪成本
    let cookingCost = 0;
    if (profession === 'cooking' && window.currentRecipe) {
        cookingCost = window.currentRecipe.cookingCost || 0;
    }
    
    // 预期利润 = 拍卖行价格 - 材料总成本 - 烹饪成本
    const profit = auctionPrice - materialCost - cookingCost;
    
    // 更新显示
    document.getElementById('total-cost').textContent = formatNumber(materialCost + cookingCost) + ' 银两';
    document.getElementById('profit').textContent = formatNumber(profit) + ' 银两';
    
    // 计算利润率
    const totalCost = materialCost + cookingCost;
    const profitRate = totalCost > 0 ? (profit / totalCost * 100) : 0;
    document.getElementById('profit-rate').textContent = formatNumber(profitRate, 2) + '%';
    
    // 获取元气消耗
    const makeEnergy = window.energyCostData?.[profession]?.[recipeName] || 0;
    console.log('元气消耗:', {profession, recipeName, makeEnergy, energyCostData: window.energyCostData}); // 调试日志
    
    // 更新元气消耗显示
    document.getElementById('make-energy').textContent = makeEnergy;
    
    // 计算每点元气收益
    const profitPerEnergy = makeEnergy > 0 ? profit / makeEnergy : 0;
    document.getElementById('profit-per-energy').textContent = formatNumber(profitPerEnergy, 2) + ' 银两';
}

// 显示版权信息
function showCopyrightInfo() {
    const modal = createModal({
        title: '海苔生活系统计算器',
        content: `
            <div style="text-align: center;">
                <p style="font-size: 14px; color: #666;">Version 1.0.0</p>
                <p style="font-weight: bold; margin: 15px 0;">© 2024 Haitai. All Rights Reserved.</p>
                <p style="color: #666;">本软件为海苔制作 有任何BUG请反馈QQ</p>
                <p style="color: #666;">保证永久免费 请勿用于商用贩售</p>
                <p style="color: #0066CC; margin-top: 15px;">海苔QQ：3180468481</p>
                <p style="color: #0066CC;">海苔工廠Q群：484403350</p>
            </div>
        `,
        showClose: true,
        autoClose: 5000
    });
}

// 创建模态框
function createModal(options) {
    const modalContainer = document.getElementById('modal-container');
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-header">
            <h3>${options.title}</h3>
            ${options.showClose ? '<span class="modal-close">&times;</span>' : ''}
        </div>
        <div class="modal-content">
            ${options.content}
        </div>
    `;

    modalContainer.innerHTML = '';
    modalContainer.appendChild(modal);
    modalContainer.style.display = 'block';

    if (options.showClose) {
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modalContainer.style.display = 'none';
        });
    }

    if (options.autoClose) {
        setTimeout(() => {
            modalContainer.style.display = 'none';
        }, options.autoClose);
    }

    return modal;
}

// 计算函数
function calculate() {
    let totalCost = 0;
    let quantities = {};

    // 收集所有材料的价格和数量
    document.querySelectorAll('.material-item').forEach(item => {
        const material = item.querySelector('.price').dataset.material;
        const price = parseFloat(item.querySelector('.price').value) || 0;
        const quantity = parseInt(item.querySelector('.quantity').value) || 0;
        
        if (quantity > 0 && price > 0) {
            totalCost += price * quantity;
        }
        quantities[material] = quantity;
    });

    // 更新显示
    document.getElementById('total-cost').textContent = `${totalCost} 银两`;

    // 计算利润
    const auctionPrice = parseFloat(document.getElementById('auction-price').value) || 0;
    const profit = auctionPrice - totalCost;
    document.getElementById('profit').textContent = `${profit} 银两`;

    // 计算利润率
    const profitRate = totalCost > 0 ? (profit / totalCost * 100).toFixed(2) : 0;
    document.getElementById('profit-rate').textContent = `${profitRate}%`;

    // 更新元气收益
    updateEnergyProfit(profit);
}

// 更新元气收益
function updateEnergyProfit(profit) {
    const recipe = document.getElementById('recipe-select').value;
    const profession = document.getElementById('profession-select').value;
    
    if (recipe && profession) {
        // 从配置文件获取元气值
        fetch(`data/energy_cost.json`)
            .then(response => response.json())
            .then(data => {
                const energyValue = data[profession]?.[recipe] || 0;
                document.getElementById('make-energy').textContent = energyValue;
                
                if (energyValue > 0) {
                    const energyProfit = Math.floor(profit / energyValue);
                    document.getElementById('profit-per-energy').textContent = `${energyProfit} 银两`;
                } else {
                    document.getElementById('profit-per-energy').textContent = '0 银两';
                }
            })
            .catch(error => {
                console.error('加载元气值失败:', error);
                document.getElementById('make-energy').textContent = '0';
                document.getElementById('profit-per-energy').textContent = '0 银两';
            });
    }
}

// 计算利润率
function formatNumber(number, decimals) {
    return number.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 计算利润率
function formatProfitRate(number) {
    return number.toFixed(2) + '%';
}

// 计算利润率
function formatAuctionPrice(number) {
    const profitRate = materialCost > 0 ? (profit / materialCost * 100) : 0;
    document.getElementById('profit-rate').textContent = formatNumber(profitRate, 2) + '%';
    
    // 计算元气收益
    const makeEnergy = currentRecipe?.energy || 0;
    document.getElementById('make-energy').textContent = makeEnergy;
    
    // 计算每点元气收益
    const profitPerEnergy = makeEnergy > 0 ? (profit / makeEnergy) : 0;
    document.getElementById('profit-per-energy').textContent = formatNumber(profitPerEnergy, 2) + ' 银两';
}

// 加载合成方式
async function loadCraftMethod(profession, type) {
    try {
        const response = await fetch('data/craft_methods.json');
        const data = await response.json();
        
        // 根据职业和类型获取合成方式
        const method = data[profession]?.[type] || '暂无合成方式说明';
        
        // 更新显示
        document.getElementById('craft-method').value = method;
    } catch (error) {
        console.error('加载合成方式失败:', error);
        document.getElementById('craft-method').value = '加载合成方式失败';
    }
}

// 加载具体配方
async function loadRecipe(recipeName) {
    const profession = document.getElementById('profession-select').value;
    const recipeFile = this.getRecipeFileName(profession);

    try {
        const response = await fetch(recipeFile);
        const data = await response.json();
        const recipe = data[recipeName];
        
        if (recipe) {
            // 更新全局当前配方
            window.currentRecipe = recipe;
            
            // 清所有材料数量
            document.querySelectorAll('.material-item .quantity').forEach(input => {
                input.value = 0;
            });

            // 设置配方所需材料数量
            recipe.materials.forEach(material => {
                const quantityInput = document.querySelector(`.material-item .quantity[data-material="${material.name}"]`);
                if (quantityInput) {
                    quantityInput.value = material.amount;
                }
            });

            // 显示合成公式
            displayCraftMethod(recipe);

            // 加载合成方式
            const type = getRecipeType(recipeName);
            await loadCraftMethod(profession, type);

            // 设置元气消耗
            const energyCost = energyCostData?.[profession]?.[recipeName] || 0;
            document.getElementById('make-energy').textContent = energyCost;
            window.currentRecipe.energy = energyCost;  // 保存到当前配方对象中

            // 触发计算
            calculateProfit();
        }
    } catch (error) {
        showNotification('加载配方失败', error.message, 'error');
    }
}

// 显示合成公式
function displayCraftMethod(recipe) {
    const craftMethodTextarea = document.getElementById('craft-method');
    if (recipe && recipe.materials) {
        let formula = '';
        recipe.materials.forEach(material => {
            formula += `${material.name} × ${material.amount}\n`;
        });
        craftMethodTextarea.value = formula;
    } else {
        craftMethodTextarea.value = '暂无合成公式';
    }
}

// 判断配方类型的辅助函数
function getRecipeType(recipeName) {
    // 根据配方名称判断类型
    if (recipeName.includes('剑') || recipeName.includes('刀') || recipeName.includes('环') || recipeName.includes('匣') || recipeName.includes('镜')) {
        return '武器';
    } else if (recipeName.includes('盔') || recipeName.includes('靴') || recipeName.includes('铠') || recipeName.includes('臂') || recipeName.includes('带')) {
        return '防具';
    } else if (recipeName.includes('符') || recipeName.includes('咒')) {
        return '符咒';
    } else if (recipeName.includes('丹') || recipeName.includes('丸')) {
        return '丹药';
    } else if (recipeName.includes('衣') || recipeName.includes('袍') || recipeName.includes('衫')) {
        return '衣服';
    } else {
        return '消耗品';
    }
}

// 加载价格
async function loadPrices() {
    try {
        // TODO: 将来这里会改为从游戏拍卖行API获取价格
        // 目前先使用本地存储的价格
        const savedPrices = localStorage.getItem('materialPrices');
        if (savedPrices) {
            const prices = JSON.parse(savedPrices);
            
            // 更新所有材料价格输入框
            document.querySelectorAll('.material-item .price').forEach(input => {
                const material = input.dataset.material;
                if (prices[material]) {
                    input.value = prices[material];
                }
            });
            
            // 重新计算
            calculateMaterialCost();
            calculateProfit();
            
            showNotification('加载价格', '成功加载历史价格', 'success');
        } else {
            showNotification('加载价格', '没有找到历史价格', 'info');
        }
    } catch (error) {
        console.error('加载价格失败:', error);
        showNotification('加载价格', '加载价格失败', 'error');
    }
}

// 保存价格
function savePrices() {
    try {
        const prices = {};
        document.querySelectorAll('.material-item .price').forEach(input => {
            const material = input.dataset.material;
            const price = parseFloat(input.value) || 0;
            prices[material] = price;
        });
        
        localStorage.setItem('materialPrices', JSON.stringify(prices));
        showNotification('保存价格', '价格保存成功', 'success');
    } catch (error) {
        console.error('保存价格失败:', error);
        showNotification('保存价格', '保存价格失败', 'error');
    }
}

// 添加加载配方数据的函数
async function loadAllRecipes() {
    const professions = ['blacksmith', 'tailor', 'alchemist', 'sculptor', 'cooking'];
    recipeData = {};
    
    for (const profession of professions) {
        try {
            const response = await fetch(`data/recipes_${profession}.json`);
            const data = await response.json();
            recipeData[profession] = data;
        } catch (error) {
            console.error(`加载${profession}配方失败:`, error);
        }
    }
}

// 添加加载元气消耗数据的函数
async function loadEnergyCost() {
    try {
        const response = await fetch('data/energy_cost.json');
        const data = await response.json();
        window.energyCostData = data;  // 保存到全局变量
        energyCostData = data;
    } catch (error) {
        console.error('加载元气消耗数据失败:', error);
        showNotification('错误', '加载元气消耗数据失败', 'error');
    }
}

// 添加清除数量的函数
function clearAllQuantities() {
    try {
        // 清除所有材料的数量
        document.querySelectorAll('.material-item .quantity').forEach(input => {
            input.value = '0';  // 确保设置为字符串 '0'
        });

        // 清除拍卖行价格
        const auctionPriceInput = document.getElementById('auction-price');
        if (auctionPriceInput) {
            auctionPriceInput.value = '0';
        }

        // 重新计算
        calculateMaterialCost();
        calculateProfit();

        showNotification('清除成功', '所有数量已重置为0', 'success');
    } catch (error) {
        console.error('清除数量失败:', error);
        showNotification('清除失败', '清除数量时发生错误', 'error');
    }
}

// 添加通知函数（如果还没有的话）
function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 100);
    
    // 3秒后移除通知
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
  