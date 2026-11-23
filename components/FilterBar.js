import Link from 'next/link';
import { CATEGORIES, CUISINES } from '@/lib/constants';

export default function FilterBar({ cuisine, category }) {
  return (
    <form action="/" method="get" className="filter-bar">
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
      <div className="filter-actions">
        <button type="submit" className="button button-primary">Apply filters</button>
        <Link href="/" className="button button-ghost">Clear</Link>
      </div>
    </form>
  );
}
