export default function RatingForm({ action }) {
  return (
    <form action={action}>
      <fieldset>
        <legend>Rate this recipe</legend>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button key={rating} type="submit" name="rating" value={rating}>
            {rating} {rating === 1 ? 'star' : 'stars'}
          </button>
        ))}
      </fieldset>
    </form>
  );
}
