// Recipe Box - v1: Recipe cards with detail view
(function () {
  'use strict';

  const STORAGE_KEY = 'recipe_box_recipes';

  const SAMPLE_RECIPES = [
    {
      id: 'margherita-pizza-1',
      name: 'Classic Margherita Pizza',
      cookingTime: 25,
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
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to load recipes from localStorage:', err);
    }
    // Preload sample recipes if storage is empty or fails
    saveRecipes(SAMPLE_RECIPES);
    return SAMPLE_RECIPES;
  }

  function saveRecipes(recipes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    } catch (err) {
      console.warn('Failed to save recipes to localStorage:', err);
    }
  }

  // Application State
  let recipes = loadRecipes();
  let currentDetailRecipeId = null;

  // DOM Elements
  const recipeForm = document.getElementById('recipe-form');
  const recipesGrid = document.getElementById('recipes-grid');
  const recipeModal = document.getElementById('recipe-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDismissBtn = document.getElementById('modal-dismiss-btn');
  const modalDeleteBtn = document.getElementById('modal-delete-btn');
  const modalRecipeTitle = document.getElementById('modal-recipe-title');
  const modalRecipeTime = document.getElementById('modal-recipe-time');
  const modalIngredientsList = document.getElementById('modal-ingredients-list');
  const modalStepsList = document.getElementById('modal-steps-list');

  // Render Recipes Grid
  function renderRecipes() {
    // Clear recipes grid safely
    while (recipesGrid.firstChild) {
      recipesGrid.removeChild(recipesGrid.firstChild);
    }

    if (recipes.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'empty-state-message';
      emptyMsg.textContent = 'No recipes found. Add your first recipe above!';
      recipesGrid.appendChild(emptyMsg);
      return;
    }

    recipes.forEach(function (recipe) {
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
      card.appendChild(header);

      // Card Meta
      const meta = document.createElement('div');
      meta.className = 'card-meta';

      const timeBadge = document.createElement('span');
      timeBadge.className = 'card-time';
      timeBadge.textContent = '⏱ ' + recipe.cookingTime + ' min';
      meta.appendChild(timeBadge);

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

  // Add Recipe Form Submission
  recipeForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const nameInput = document.getElementById('recipe-name');
    const timeInput = document.getElementById('recipe-time');
    const ingredientsInput = document.getElementById('recipe-ingredients');
    const stepsInput = document.getElementById('recipe-steps');

    const name = nameInput.value.trim();
    const cookingTime = parseInt(timeInput.value, 10);
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
