import Link from 'next/link';
import { CATEGORIES, CUISINES } from '@/lib/constants';

export default function FilterBar({ cuisine, category }) {
  return (
    <form action="/" method="get">
      <label>
        Cuisine{' '}
        <select name="cuisine" defaultValue={cuisine}>
          <option value="">All</option>
          {CUISINES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>{' '}
      <label>
        Category{' '}
        <select name="category" defaultValue={category}>
          <option value="">All</option>
          {CATEGORIES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>{' '}
      <button type="submit">Apply filters</button>{' '}
      <Link href="/">Clear</Link>
    </form>
  );
}
