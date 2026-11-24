import React from 'react';

export const metadata = {
  title: 'Privacy | RecipeShare',
};

export default function PrivacyPage() {
  return (
    <main className="narrow">
      <h1>Privacy</h1>
      <p>RecipeShare uses your Google name, email, and account ID when you sign in.</p>
      <p>
        Your name appears on your recipes and comments. Your email stays private. RecipeShare uses your Google
        account ID to show your recipes on your profile and track your rating for each recipe.
        RecipeShare does not share your Google account data with third parties.
      </p>
    </main>
  );
}
