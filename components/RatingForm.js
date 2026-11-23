export default function RatingForm({ action }) {
  return (
    <form action={action} className="rating-form">
      <fieldset>
        <legend>Rate this recipe</legend>
        <div className="rating-buttons">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button key={rating} type="submit" name="rating" value={rating} className="rating-button">
              <span className="star" aria-hidden="true">★</span>
              {rating} {rating === 1 ? 'star' : 'stars'}
            </button>
          ))}
        </div>
      </fieldset>
    </form>
  );
}
