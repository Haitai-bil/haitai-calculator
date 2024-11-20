// 配方管理相关功能
class RecipeManager {
    constructor() {
        this.recipes = new Map();
        this.currentProfession = '';
        this.initializeEventListeners();
    }

    // 初始化事件监听器
    initializeEventListeners() {
        // 监听职业选择变化
        document.getElementById('profession-select').addEventListener('change', () => {
            this.updateRecipeList();
        });

        // 监听配方选择变化
        document.getElementById('recipe-select').addEventListener('change', (e) => {
            this.loadRecipe(e.target.value);
        });
    }

    // 更新配方列表
    async updateRecipeList() {
        const professionSelect = document.getElementById('profession-select');
        const recipeSelect = document.getElementById('recipe-select');
        const profession = professionSelect.value;
        
        // 清空现有选项
        recipeSelect.innerHTML = '';
        
        try {
            const recipes = await this.loadRecipes(profession);
            recipes.forEach(recipe => {
                const option = document.createElement('option');
                option.value = recipe;
                option.textContent = recipe;
                recipeSelect.appendChild(option);
            });

            // 自动加载第一个配方
            if (recipes.length > 0) {
                this.loadRecipe(recipes[0]);
            }

            // 如果选择了烹饪职业，显示中央提示
            if (profession === 'cooking') {
                createModal({
                    title: '烹饪制作说明',
                    content: `
                        <div style="text-align: center; padding: 20px;">
                            <p style="font-size: 16px; color: #2c3e50; margin-bottom: 15px;">
                                <strong>烹饪制作费用说明</strong>
                            </p>
                            <p style="color: #34495e; line-height: 1.6;">
                                制作烹饪配方时，系统会自动计入额外的制作费用。<br>
                                此费用将在最终利润中自动扣除。
                            </p>
                        </div>
                    `,
                    showClose: true,
                    autoClose: 4000
                });
            }
        } catch (error) {
            showNotification('加载配方失败', error.message, 'error');
        }
    }

    // 加载配方数据
    async loadRecipes(profession) {
        const recipeFile = this.getRecipeFileName(profession);
        try {
            const response = await fetch(recipeFile);
            const data = await response.json();
            return Object.keys(data);
        } catch (error) {
            console.error('加载配方文件失败:', error);
            return [];
        }
    }

    // 获取配方文件名
    getRecipeFileName(profession) {
        const fileMap = {
            'blacksmith': 'data/recipes_blacksmith.json',
            'tailor': 'data/recipes_tailor.json',
            'alchemist': 'data/recipes_alchemist.json',
            'sculptor': 'data/recipes_sculptor.json',
            'cooking': 'data/recipes_cooking.json'
        };
        return fileMap[profession];
    }

    // 加载具体配方
    async loadRecipe(recipeName) {
        const profession = document.getElementById('profession-select').value;
        const recipeFile = this.getRecipeFileName(profession);

        try {
            const response = await fetch(recipeFile);
            const data = await response.json();
            const recipe = data[recipeName];
            
            if (recipe) {
                // 更新全局当前配方
                window.currentRecipe = recipe;
                
                // 清空所有材料数量
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

                // 设置元气消耗 - 从全局 energyCostData 中获取
                const energyCost = window.energyCostData?.[profession]?.[recipeName] || 0;
                document.getElementById('make-energy').textContent = energyCost;
                window.currentRecipe.energy = energyCost;

                // 触发计算
                calculateProfit();
            }
        } catch (error) {
            showNotification('加载配方失败', error.message, 'error');
        }
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

// 创建配方管理器实例
const recipeManager = new RecipeManager();
 