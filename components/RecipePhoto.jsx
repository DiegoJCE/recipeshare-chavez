'use client';

import React, { useCallback, useState } from 'react';

export default function RecipePhoto({ imageUrl, title }) {
  const [failed, setFailed] = useState(false);
  const checkImage = useCallback((image) => {
    // The request may have failed before React attached the error handler.
    if (image?.complete && image.naturalWidth === 0) setFailed(true);
  }, []);

  if (!imageUrl || failed) {
    return (
      <div className="recipe-photo-placeholder">
        <span className="recipe-photo-stamp">Photo unavailable</span>
      </div>
    );
  }

  return <img ref={checkImage} src={imageUrl} alt={title} onError={() => setFailed(true)} />;
}
