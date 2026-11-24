import React from 'react';

export const metadata = {
  title: 'Privacy | RecipeShare',
};

export default function PrivacyPage() {
  return (
    <main className="narrow">
      <h1>Privacy</h1>
      <p>RecipeShare stores only your Google name and email to link recipes you publish to you as their author.</p>
      <p>
        Your name appears on your recipes. Your email stays private so RecipeShare can show your
        recipes on your profile. RecipeShare does not share your Google account data with third parties.
      </p>
    </main>
  );
}
