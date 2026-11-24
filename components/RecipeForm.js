'use client';

import { useActionState, useState } from 'react';
import { CATEGORIES, CUISINES, DIETARY_TAGS } from '@/lib/constants';
import { PHOTO_TYPES, validatePhotoFile } from '@/lib/recipePhoto';

const fields = [
  { name: 'authorName', label: 'Author name' },
  { name: 'title', label: 'Title' },
  { name: 'cuisine', label: 'Cuisine', options: CUISINES },
  { name: 'category', label: 'Category', options: CATEGORIES },
  { name: 'ingredients', label: 'Ingredients (one per line)', multiline: true },
  { name: 'steps', label: 'Steps (one per line)', multiline: true },
  { name: 'prepTimeMinutes', label: 'Prep time (minutes)', type: 'number', min: 1, step: 1 },
  { name: 'imageUrl', label: 'Image URL', type: 'url', required: false },
];

export default function RecipeForm({ authorName, saveRecipe, initialValues = {} }) {
  const [{ values, errors, attempt }, action, pending] = useActionState(saveRecipe, {
    values: initialValues,
    errors: {},
    attempt: 0,
  });
  const [fileError, setFileError] = useState('');
  const photoError = fileError || errors.imageFile;

  function checkPhoto(event) {
    const file = event.currentTarget.elements.imageFile.files[0];
    const error = file && validatePhotoFile(file);
    if (error) {
      event.preventDefault();
      setFileError(error);
    }
  }

  return (
    <form action={action} onSubmit={checkPhoto} noValidate className="recipe-form">
      {fields.map((field) => (
        <RecipeField
          key={`${field.name}-${attempt}`}
          field={field}
          value={field.name === 'authorName' && authorName ? authorName : values[field.name]}
          readOnly={field.name === 'authorName' && Boolean(authorName)}
          error={errors[field.name]}
        />
      ))}
      <div key={`photo-${attempt}`} className="field field-wide">
        <label htmlFor="imageFile" className="field-label">Or upload a food photo</label>
        <input
          id="imageFile"
          name="imageFile"
          type="file"
          accept={PHOTO_TYPES.join(',')}
          onChange={() => setFileError('')}
          aria-invalid={photoError ? true : undefined}
          aria-describedby={photoError ? 'imageFile-help imageFile-error' : 'imageFile-help'}
        />
        <small id="imageFile-help">JPEG, PNG, WebP, or GIF, up to 4 MB. A selected file replaces the image URL.</small>
        {photoError && <span id="imageFile-error" role="alert" className="field-error">{photoError}</span>}
      </div>
      <fieldset key={attempt} className="field-wide dietary-fields">
        <legend className="field-label">Dietary tags (optional)</legend>
        {DIETARY_TAGS.map((tag) => (
          <label key={tag}>
            <input type="checkbox" name="dietaryTags" value={tag} defaultChecked={values.dietaryTags?.includes(tag)} />
            {tag}
          </label>
        ))}
      </fieldset>
      <div className="form-actions">
        <button type="submit" disabled={pending} className="button button-primary">Save recipe</button>
      </div>
    </form>
  );
}

function RecipeField({ field, value, readOnly, error }) {
  const { name, label, options, multiline, type = 'text', min, step, required = true } = field;
  const errorId = `${name}-error`;
  const props = {
    id: name,
    name,
    required,
    defaultValue: value ?? '',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  };

  let input = <input {...props} type={type} min={min} step={step} readOnly={readOnly} />;
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
