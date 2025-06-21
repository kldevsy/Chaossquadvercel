import { useState, useEffect } from 'react';

interface BadgeState {
  id: string;
  isVisible: boolean;
  isAnimating: boolean;
}

export function useBadgeAnimations() {
  const [badgeStates, setBadgeStates] = useState<Map<string, BadgeState>>(new Map());

  const showBadge = (id: string, delay = 0) => {
    setTimeout(() => {
      setBadgeStates(prev => {
        const newMap = new Map(prev);
        newMap.set(id, {
          id,
          isVisible: true,
          isAnimating: true
        });
        return newMap;
      });

      // Reset animating state after animation completes
      setTimeout(() => {
        setBadgeStates(prev => {
          const newMap = new Map(prev);
          const current = newMap.get(id);
          if (current) {
            newMap.set(id, {
              ...current,
              isAnimating: false
            });
          }
          return newMap;
        });
      }, 800);
    }, delay);
  };

  const hideBadge = (id: string, delay = 0) => {
    setTimeout(() => {
      setBadgeStates(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(id);
        if (current) {
          newMap.set(id, {
            ...current,
            isAnimating: true
          });
        }
        return newMap;
      });

      // Hide after exit animation
      setTimeout(() => {
        setBadgeStates(prev => {
          const newMap = new Map(prev);
          newMap.set(id, {
            id,
            isVisible: false,
            isAnimating: false
          });
          return newMap;
        });
      }, 600);
    }, delay);
  };

  const getBadgeState = (id: string): BadgeState => {
    return badgeStates.get(id) || {
      id,
      isVisible: true,
      isAnimating: false
    };
  };

  const resetAllBadges = () => {
    setBadgeStates(new Map());
  };

  return {
    showBadge,
    hideBadge,
    getBadgeState,
    resetAllBadges
  };
}