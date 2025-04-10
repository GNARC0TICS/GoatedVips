import React from 'react';
import { MVPCards } from './MVPCards';

/**
 * Simple test wrapper for MVPCards component
 * This is just to verify if the component renders without errors
 */
export function MVPCardsTest() {
  console.log('Rendering MVPCardsTest');
  return (
    <div>
      <h1>Testing MVPCards Component</h1>
      <MVPCards />
    </div>
  );
}