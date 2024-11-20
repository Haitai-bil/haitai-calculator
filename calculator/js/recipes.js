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
            'sculptor': 'data/recipes_sculptor.json'
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
 