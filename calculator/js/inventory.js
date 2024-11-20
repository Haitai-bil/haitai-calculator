// 库存管理相关功能
class InventoryManager {
    constructor() {
        this.inventory = new Map();
        this.suggestedStock = new Map();
    }

    // 显示库存管理对话框
    showInventoryDialog() {
        const modal = createModal({
            title: '材料库存管理',
            content: this.createInventoryContent(),
            showClose: true,
            width: '800px'
        });

        this.bindInventoryEvents(modal);
        this.loadInventory();
    }

    // 创建库存管理内容
    createInventoryContent() {
        return `
            <div class="inventory-container">
                <div class="inventory-list">
                    <table id="inventory-table">
                        <thead>
                            <tr>
                                <th>材料名称</th>
                                <th>当前库存</th>
                                <th>建议库存</th>
                                <th>缺少数量</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                <div class="inventory-input">
                    <div class="input-group">
                        <label>材料名称:</label>
                        <select id="material-select"></select>
                    </div>
                    <div class="input-group">
                        <label>库存数量:</label>
                        <input type="number" id="stock-amount" min="0" value="0">
                    </div>
                    <div class="input-group">
                        <button id="update-stock">更新</button>
                        <button id="save-inventory">保存</button>
                    </div>
                </div>
            </div>
        `;
    }

    // 绑定库存管理事件
    bindInventoryEvents(modal) {
        const updateBtn = modal.querySelector('#update-stock');
        const saveBtn = modal.querySelector('#save-inventory');
        const materialSelect = modal.querySelector('#material-select');

        // 填充材料选择下拉框
        this.fillMaterialSelect(materialSelect);

        updateBtn.addEventListener('click', () => {
            this.updateStock(
                materialSelect.value,
                document.getElementById('stock-amount').value
            );
        });

        saveBtn.addEventListener('click', () => {
            this.saveInventory();
        });
    }

    // 填充材料选择下拉框
    fillMaterialSelect(select) {
        const allMaterials = [
            ...miscItems,
            ...mineItems,
            ...herbItems,
            ...shopItems
        ];

        allMaterials.forEach(material => {
            const option = document.createElement('option');
            option.value = material;
            option.textContent = material;
            select.appendChild(option);
        });
    }

    // 加载库存数据
    async loadInventory() {
        try {
            const response = await fetch('data/inventory.json');
            const data = await response.json();
            
            this.inventory = new Map(Object.entries(data.stock || {}));
            this.suggestedStock = new Map(Object.entries(data.suggested || {}));
            
            this.updateInventoryTable();
            
        } catch (error) {
            showNotification('加载库存失败', error.message, 'error');
        }
    }

    // 更新库存表格
    updateInventoryTable() {
        const tbody = document.querySelector('#inventory-table tbody');
        tbody.innerHTML = '';

        const allMaterials = [
            ...miscItems,
            ...mineItems,
            ...herbItems,
            ...shopItems
        ];

        allMaterials.forEach(material => {
            const currentStock = this.inventory.get(material) || 0;
            const suggestedStock = this.suggestedStock.get(material) || 0;
            const missing = Math.max(0, suggestedStock - currentStock);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${material}</td>
                <td>${currentStock}</td>
                <td>${suggestedStock}</td>
                <td>${missing}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // 更新库存
    updateStock(material, amount) {
        if (!material || amount < 0) {
            showNotification('更新失败', '请输入有效的数量', 'error');
            return;
        }

        this.inventory.set(material, parseInt(amount));
        this.updateInventoryTable();
        showNotification('更新成功', `${material} 库存已更新`, 'success');
    }

    // 保存库存数据
    async saveInventory() {
        try {
            const data = {
                stock: Object.fromEntries(this.inventory),
                suggested: Object.fromEntries(this.suggestedStock)
            };

            const response = await fetch('api/save_inventory.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('保存失败');
            }

            showNotification('保存成功', '库存数据已保存', 'success');

        } catch (error) {
            showNotification('保存失败', error.message, 'error');
        }
    }
}

// 创建库存管理器实例
const inventoryManager = new InventoryManager();

// 绑定库存管理按钮事件
document.getElementById('inventory').addEventListener('click', () => {
    inventoryManager.showInventoryDialog();
}); 