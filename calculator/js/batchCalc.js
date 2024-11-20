class BatchCalculator {
    constructor() {
        this.modal = null;
        this.selectedRecipes = new Map(); // 存储选中的配方和数量
        this.initializeModal();
        this.bindEvents();
    }

    initializeModal() {
        const template = document.getElementById('batch-calc-modal');
        this.modal = template.content.cloneNode(true).querySelector('.modal');
        document.getElementById('modal-container').appendChild(this.modal);
    }

    bindEvents() {
        // 绑定关闭按钮
        this.modal.querySelector('.close').addEventListener('click', () => {
            this.hideModal();
        });

        // 绑定批量计算按钮
        document.getElementById('batch-calc').addEventListener('click', () => {
            this.showModal();
        });
    }

    showModal() {
        try {
            this.updateRecipeList();
            this.modal.style.display = 'block';
            document.getElementById('modal-container').style.display = 'block';
        } catch (error) {
            console.error('显示批量计算模态框失败:', error);
            alert('打开批量计算窗口失败，请检查控制台获取详细信息');
        }
    }

    hideModal() {
        this.modal.style.display = 'none';
        document.getElementById('modal-container').style.display = 'none';
    }

    updateRecipeList() {
        const recipeList = this.modal.querySelector('.recipe-list');
        recipeList.innerHTML = '';
        const currentProfession = document.getElementById('profession-select').value;
        
        // 检查 recipeData 是否存在
        if (!window.recipeData || !window.recipeData[currentProfession]) {
            console.error('配方数据未加载');
            return;
        }

        const recipes = window.recipeData[currentProfession];

        for (const [id, recipe] of Object.entries(recipes)) {
            const recipeDiv = document.createElement('div');
            recipeDiv.className = 'recipe-item';
            recipeDiv.innerHTML = `
                <label>
                    <input type="checkbox" data-recipe-id="${id}">
                    ${recipe.name}
                </label>
                <input type="number" value="1" min="1" class="recipe-quantity" disabled>
            `;
            recipeList.appendChild(recipeDiv);

            const checkbox = recipeDiv.querySelector('input[type="checkbox"]');
            const quantityInput = recipeDiv.querySelector('input[type="number"]');

            checkbox.addEventListener('change', (e) => {
                quantityInput.disabled = !e.target.checked;
                if (e.target.checked) {
                    this.selectedRecipes.set(id, {
                        recipe: recipe,
                        quantity: parseInt(quantityInput.value)
                    });
                } else {
                    this.selectedRecipes.delete(id);
                }
                this.calculateTotal();
            });

            quantityInput.addEventListener('change', (e) => {
                if (checkbox.checked) {
                    this.selectedRecipes.get(id).quantity = parseInt(e.target.value);
                    this.calculateTotal();
                }
            });
        }
    }

    calculateTotal() {
        const materialTotals = new Map();
        let totalCost = 0;
        let totalEnergy = 0;

        // 计算所有选中配方的材料总和
        for (const [_, data] of this.selectedRecipes) {
            const { recipe, quantity } = data;
            
            // 累加材料
            for (const material of recipe.materials) {
                const totalAmount = material.amount * quantity;
                if (materialTotals.has(material.name)) {
                    materialTotals.set(
                        material.name,
                        materialTotals.get(material.name) + totalAmount
                    );
                } else {
                    materialTotals.set(material.name, totalAmount);
                }
            }

            // 累加元气消耗
            totalEnergy += (recipe.energy || 0) * quantity;
        }

        // 计算总成本
        for (const [materialName, amount] of materialTotals) {
            const price = this.getMaterialPrice(materialName);
            totalCost += price * amount;
        }

        this.updateResults(materialTotals, totalCost, totalEnergy);
    }

    getMaterialPrice(materialName) {
        // 从现有的材料列表中获取价格
        const allMaterialLists = [
            'misc-materials',
            'mine-materials',
            'herb-materials',
            'shop-materials'
        ];

        for (const listId of allMaterialLists) {
            const list = document.getElementById(listId);
            const materialItem = list.querySelector(`.material-item:has(span:contains("${materialName}"))`);
            if (materialItem) {
                const priceInput = materialItem.querySelector('.price');
                return parseFloat(priceInput.value) || 0;
            }
        }
        return 0;
    }

    updateResults(materialTotals, totalCost, totalEnergy) {
        const summaryDiv = this.modal.querySelector('.materials-summary');
        summaryDiv.innerHTML = '';

        // 显示材料清单
        for (const [material, amount] of materialTotals) {
            const materialDiv = document.createElement('div');
            materialDiv.className = 'material-summary-item';
            materialDiv.innerHTML = `
                <span class="material-name">${material}</span>
                <span class="material-amount">${amount}</span>
            `;
            summaryDiv.appendChild(materialDiv);
        }

        // 更新总计
        this.modal.querySelector('.total-cost').textContent = `${totalCost.toFixed(2)} 银两`;
        this.modal.querySelector('.total-energy').textContent = totalEnergy;
    }
}

// 添加辅助函数用于查找文本内容
Element.prototype.contains = function(text) {
    return this.textContent.includes(text);
}; 