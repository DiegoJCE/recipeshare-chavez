import Link from 'next/link';
import { CATEGORIES, CUISINES, DIETARY_TAGS } from '@/lib/constants';

export default function FilterBar({ cuisine, category, q, sort, dietaryTag }) {
  return (
    <form action="/" method="get" className="filter-bar">
      <label className="field">
        <span className="field-label">Search recipes</span>
        <input name="q" type="search" placeholder="Title or ingredient" defaultValue={q} />
      </label>
      <label className="field">
        <span className="field-label">Cuisine</span>
        <select name="cuisine" defaultValue={cuisine}>
          <option value="">All</option>
          {CUISINES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="field-label">Category</span>
        <select name="category" defaultValue={category}>
          <option value="">All</option>
          {CATEGORIES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="field-label">Dietary tag</span>
        <select name="dietaryTag" defaultValue={dietaryTag}>
          <option value="">All</option>
          {DIETARY_TAGS.map((tag) => <option key={tag}>{tag}</option>)}
        </select>
      </label>
      <label className="field">
        <span className="field-label">Sort by</span>
        <select name="sort" defaultValue={sort === 'highest-rated' ? sort : 'newest'}>
          <option value="newest">Newest</option>
          <option value="highest-rated">Highest rated</option>
        </select>
      </label>
      <div className="filter-actions">
        <button type="submit" className="button button-primary">Apply filters</button>
        <Link href="/" className="button button-ghost">Clear</Link>
      </div>
    </form>
  );
}
