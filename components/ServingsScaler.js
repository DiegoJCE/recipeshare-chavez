'use client';

import { useState } from 'react';
import { scaleIngredient } from '@/lib/servings';

export default function ServingsScaler({ ingredients }) {
  const [original, setOriginal] = useState('');
  const [target, setTarget] = useState('');

  return (
    <section>
      <h2>Ingredients</h2>
      <div className="serving-fields">
        <label className="field">
          <span className="field-label">Original servings</span>
          <input type="number" min="1" step="1" value={original} onChange={(event) => setOriginal(event.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Target servings</span>
          <input type="number" min="1" step="1" value={target} onChange={(event) => setTarget(event.target.value)} />
        </label>
      </div>
      <ul className="ingredient-list" aria-live="polite">
        {ingredients.map((ingredient, index) => (
          <li key={index}>{scaleIngredient(ingredient, Number(original), Number(target))}</li>
        ))}
      </ul>
    </section>
  );
}
