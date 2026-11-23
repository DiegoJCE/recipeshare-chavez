'use client';

import { useActionState } from 'react';
import { createRecipe } from '@/app/recipes/new/actions';
import { CATEGORIES, CUISINES } from '@/lib/constants';

const fields = [
  { name: 'authorName', label: 'Author name' },
  { name: 'title', label: 'Title' },
  { name: 'cuisine', label: 'Cuisine', options: CUISINES },
  { name: 'category', label: 'Category', options: CATEGORIES },
  { name: 'ingredients', label: 'Ingredients (one per line)', multiline: true },
  { name: 'steps', label: 'Steps (one per line)', multiline: true },
  { name: 'prepTimeMinutes', label: 'Prep time (minutes)', type: 'number', min: 1, step: 1 },
  { name: 'imageUrl', label: 'Image URL', type: 'url' },
];

export default function RecipeForm() {
  const [{ values, errors, attempt }, action, pending] = useActionState(createRecipe, {
    values: {},
    errors: {},
    attempt: 0,
  });

  return (
    <form action={action} noValidate className="recipe-form">
      {fields.map((field) => (
        <RecipeField key={`${field.name}-${attempt}`} field={field} value={values[field.name]} error={errors[field.name]} />
      ))}
      <div className="form-actions">
        <button type="submit" disabled={pending} className="button button-primary">Save recipe</button>
      </div>
    </form>
  );
}

function RecipeField({ field, value, error }) {
  const { name, label, options, multiline, type = 'text', min, step } = field;
  const errorId = `${name}-error`;
  const props = {
    id: name,
    name,
    required: true,
    defaultValue: value ?? '',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  };

  let input = <input {...props} type={type} min={min} step={step} />;
  if (options) {
    input = (
      <select {...props}>
        <option value="">Choose {label.toLowerCase()}</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    );
  } else if (multiline) {
    input = <textarea {...props} rows={4} />;
  }

  return (
    <div className={multiline || type === 'url' ? 'field field-wide' : 'field'}>
      <label htmlFor={name} className="field-label">{label}</label>
      {input}
      {error && <span id={errorId} role="alert" className="field-error">{error}</span>}
    </div>
  );
}
