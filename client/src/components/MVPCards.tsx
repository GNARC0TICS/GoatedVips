/**
 * @deprecated Import from '@/components/mvp/MVPCards' instead
 * This file is maintained for backward compatibility.
 * It re-exports the improved MVP cards implementation.
 */

import { MVPCards as MVPCardsComponent, MVPCard } from './mvp';

// Re-export with same interface as before
export function MVPCards() {
  return <MVPCardsComponent />;
}

// Re-export the MVPCard component as MVPCardMemo for backward compatibility
export const MVPCardMemo = MVPCard;
