// Recipe Box - v4: Difficulty badge for recipes
(function () {
  'use strict';

  const STORAGE_KEY = 'recipe_box_recipes';

  const SAMPLE_RECIPES = [
    {
      id: 'margherita-pizza-1',
      name: 'Classic Margherita Pizza',
      cookingTime: 25,
      difficulty: 'Medium',
      isFavorite: true,
      ingredients: [
        '1 ball pizza dough (approx. 250g)',
        '1/2 cup San Marzano tomato sauce',
        '150g fresh mozzarella cheese, torn',
        'Fresh basil leaves',
        '2 tbsp extra virgin olive oil',
        'Sea salt to taste'
      ],
      steps: [
        'Preheat the oven to maximum temperature (250°C / 480°F) with a pizza stone or heavy baking tray inside.',
        'Stretch the rested pizza dough gently onto parchment paper into a 12-inch round.',
        'Spread the tomato sauce thinly across the surface, leaving a 1-inch border for the crust.',
        'Distribute torn fresh mozzarella pieces evenly over the tomato base.',
        'Bake for 10 to 12 minutes until the crust is blistered and golden and the cheese is bubbling.',
        'Garnish immediately with fresh basil leaves and a generous drizzle of olive oil before slicing.'
      ]
    },
    {
      id: 'garlic-butter-pasta-2',
      name: 'Garlic Herb Butter Pasta',
      cookingTime: 15,
      difficulty: 'Easy',
      isFavorite: false,
      ingredients: [
        '250g spaghetti or linguine',
        '4 cloves fresh garlic, finely sliced',
        '4 tbsp unsalted butter',
        '1 tbsp extra virgin olive oil',
        '1/4 cup chopped flat-leaf parsley',
        '1/3 cup freshly grated Parmesan cheese',
        'Sea salt and freshly cracked black pepper'
      ],
      steps: [
        'Bring a large pot of heavily salted water to a rolling boil and cook pasta until al dente.',
        'While pasta cooks, warm olive oil and melt butter in a wide skillet over medium-low heat.',
        'Add sliced garlic and gently sauté for 1-2 minutes until fragrant and pale golden (do not burn).',
        'Scoop out 1/3 cup of starchy pasta cooking water before draining the noodles.',
        'Add the hot pasta and cooking water to the skillet, tossing vigorously to emulsify the sauce.',
        'Remove from heat, fold in fresh parsley and Parmesan, and season with black pepper and salt.'
      ]
    }
  ];

  // Safe localStorage helper
  function loadRecipes() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure all recipes have a difficulty field
          return parsed.map(function (item) {
            if (!item.difficulty) {
              item.difficulty = 'Medium';
            }
            return item;
          });
        }
      }
    } catch (err) {
      console.warn('Failed to load recipes from localStorage:', err);
    }
    saveRecipes(SAMPLE_RECIPES);
    return SAMPLE_RECIPES;
  }

  function saveRecipes(recipesList) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipesList));
    } catch (err) {
      console.warn('Failed to save recipes to localStorage:', err);
    }
  }

  // Application State
  let recipes = loadRecipes();
  let currentDetailRecipeId = null;
  let searchQuery = '';
  let timeFilter = 'any';

  // DOM Elements
  const recipeForm = document.getElementById('recipe-form');
  const recipesGrid = document.getElementById('recipes-grid');
  const searchInput = document.getElementById('search-input');
  const timeFilterSelect = document.getElementById('time-filter');
  const recipeModal = document.getElementById('recipe-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDismissBtn = document.getElementById('modal-dismiss-btn');
  const modalDeleteBtn = document.getElementById('modal-delete-btn');
  const modalRecipeTitle = document.getElementById('modal-recipe-title');
  const modalRecipeTime = document.getElementById('modal-recipe-time');
  const modalRecipeDifficulty = document.getElementById('modal-recipe-difficulty');
  const modalIngredientsList = document.getElementById('modal-ingredients-list');
  const modalStepsList = document.getElementById('modal-steps-list');

  // Difficulty badge class helper
  function getDifficultyClass(difficulty) {
    const diff = (difficulty || 'Medium').toLowerCase();
    if (diff === 'easy') return 'badge badge-easy';
    if (diff === 'hard') return 'badge badge-hard';
    return 'badge badge-medium';
  }

  // Toggle Favorite
  function toggleFavorite(recipeId) {
    recipes = recipes.map(function (recipe) {
      if (recipe.id === recipeId) {
        return Object.assign({}, recipe, { isFavorite: !recipe.isFavorite });
      }
      return recipe;
    });
    saveRecipes(recipes);
    renderRecipes();
  }

  // Filter and sort recipes: favorites first, filtered by search query
  function getVisibleRecipes() {
    let result = recipes.slice();

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(function (recipe) {
        const matchesName = recipe.name.toLowerCase().indexOf(query) !== -1;
        const matchesIngredient = recipe.ingredients.some(function (ingredient) {
          return ingredient.toLowerCase().indexOf(query) !== -1;
        });
        return matchesName || matchesIngredient;
      });
    }

    // Filter by cooking time
    if (timeFilter !== 'any') {
      var maxTime = parseInt(timeFilter, 10);
      result = result.filter(function (recipe) {
        return recipe.cookingTime < maxTime;
      });
    }

    return result.sort(function (a, b) {
      if (a.isFavorite === b.isFavorite) {
        return 0;
      }
      return a.isFavorite ? -1 : 1;
    });
  }

  // Render Recipes Grid
  function renderRecipes() {
    while (recipesGrid.firstChild) {
      recipesGrid.removeChild(recipesGrid.firstChild);
    }

    const visibleRecipes = getVisibleRecipes();

    if (visibleRecipes.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-state-message';
      emptyMsg.textContent = 'No recipes found';
      recipesGrid.appendChild(emptyMsg);
      return;
    }

    visibleRecipes.forEach(function (recipe) {
      const card = document.createElement('article');
      card.className = 'recipe-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'View recipe: ' + recipe.name);

      // Card Header
      const header = document.createElement('div');
      header.className = 'card-header';

      const title = document.createElement('h3');
      title.className = 'card-title';
      title.textContent = recipe.name;
      header.appendChild(title);

      // Favorite button
      const favBtn = document.createElement('button');
      favBtn.type = 'button';
      favBtn.className = recipe.isFavorite ? 'btn-fav active' : 'btn-fav';
      favBtn.setAttribute('aria-label', recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites');
      favBtn.textContent = recipe.isFavorite ? '★' : '☆';

      favBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleFavorite(recipe.id);
      });

      favBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(recipe.id);
        }
      });

      header.appendChild(favBtn);
      card.appendChild(header);

      // Card Meta
      const meta = document.createElement('div');
      meta.className = 'card-meta';

      const timeBadge = document.createElement('span');
      timeBadge.className = 'card-time';
      timeBadge.textContent = '⏱ ' + recipe.cookingTime + ' min';
      meta.appendChild(timeBadge);

      const diffBadge = document.createElement('span');
      diffBadge.className = getDifficultyClass(recipe.difficulty);
      diffBadge.textContent = recipe.difficulty || 'Medium';
      meta.appendChild(diffBadge);

      card.appendChild(meta);

      // Card click opens modal
      card.addEventListener('click', function () {
        openModal(recipe.id);
      });

      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(recipe.id);
        }
      });

      recipesGrid.appendChild(card);
    });
  }

  // Modal handlers
  function openModal(recipeId) {
    const recipe = recipes.find(function (r) {
      return r.id === recipeId;
    });

    if (!recipe) return;

    currentDetailRecipeId = recipeId;
    modalRecipeTitle.textContent = recipe.name;
    modalRecipeTime.textContent = recipe.cookingTime + ' minutes';

    if (modalRecipeDifficulty) {
      modalRecipeDifficulty.className = 'meta-value ' + getDifficultyClass(recipe.difficulty);
      modalRecipeDifficulty.textContent = recipe.difficulty || 'Medium';
    }

    // Populate Ingredients
    while (modalIngredientsList.firstChild) {
      modalIngredientsList.removeChild(modalIngredientsList.firstChild);
    }
    recipe.ingredients.forEach(function (ingredient) {
      const li = document.createElement('li');
      li.textContent = ingredient;
      modalIngredientsList.appendChild(li);
    });

    // Populate Steps
    while (modalStepsList.firstChild) {
      modalStepsList.removeChild(modalStepsList.firstChild);
    }
    recipe.steps.forEach(function (step) {
      const li = document.createElement('li');
      li.textContent = step;
      modalStepsList.appendChild(li);
    });

    recipeModal.classList.remove('hidden');
    modalCloseBtn.focus();
  }

  function closeModal() {
    recipeModal.classList.add('hidden');
    currentDetailRecipeId = null;
  }

  // Delete Recipe
  function deleteCurrentRecipe() {
    if (!currentDetailRecipeId) return;

    recipes = recipes.filter(function (r) {
      return r.id !== currentDetailRecipeId;
    });
    saveRecipes(recipes);
    closeModal();
    renderRecipes();
  }

  // Search input event listener
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      searchQuery = e.target.value;
      renderRecipes();
    });
  }

  // Time filter event listener
  if (timeFilterSelect) {
    timeFilterSelect.addEventListener('change', function (e) {
      timeFilter = e.target.value;
      renderRecipes();
    });
  }

  // Random recipe picker
  var randomBtn = document.getElementById('random-btn');
  if (randomBtn) {
    randomBtn.addEventListener('click', function () {
      var visible = getVisibleRecipes();
      if (visible.length === 0) {
        alert('No recipes to pick from! Try changing your filters or adding a new recipe.');
        return;
      }
      var idx = Math.floor(Math.random() * visible.length);
      openModal(visible[idx].id);
    });
  }

  // Add Recipe Form Submission
  recipeForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const nameInput = document.getElementById('recipe-name');
    const timeInput = document.getElementById('recipe-time');
    const difficultyInput = document.getElementById('recipe-difficulty');
    const ingredientsInput = document.getElementById('recipe-ingredients');
    const stepsInput = document.getElementById('recipe-steps');

    const name = nameInput.value.trim();
    const cookingTime = parseInt(timeInput.value, 10);
    const difficulty = difficultyInput ? difficultyInput.value : 'Medium';
    const rawIngredients = ingredientsInput.value.trim();
    const rawSteps = stepsInput.value.trim();

    if (!name || isNaN(cookingTime) || !rawIngredients || !rawSteps) {
      return;
    }

    const ingredients = rawIngredients
      .split('\n')
      .map(function (line) {
        return line.trim();
      })
      .filter(function (line) {
        return line.length > 0;
      });

    const steps = rawSteps
      .split('\n')
      .map(function (line) {
        return line.trim();
      })
      .filter(function (line) {
        return line.length > 0;
      });

    const newRecipe = {
      id: 'recipe-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      name: name,
      cookingTime: cookingTime,
      difficulty: difficulty,
      isFavorite: false,
      ingredients: ingredients,
      steps: steps
    };

    recipes.push(newRecipe);
    saveRecipes(recipes);
    renderRecipes();
    recipeForm.reset();
  });

  // Modal event listeners
  modalCloseBtn.addEventListener('click', closeModal);
  modalDismissBtn.addEventListener('click', closeModal);
  modalDeleteBtn.addEventListener('click', deleteCurrentRecipe);

  recipeModal.addEventListener('click', function (e) {
    if (e.target === recipeModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !recipeModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Initial render
  renderRecipes();
})();
