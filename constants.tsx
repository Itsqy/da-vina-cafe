
import { DishVariant } from './types';

export const INITIAL_DISHES: DishVariant[] = [
  {
    id: 'avocado-salmon-1',
    name: 'Avocado Salmon',
    subtitle: 'Gourmet Dish',
    description: 'A delicious fusion of fresh avocado and tender salmon, served with crispy sides and a burst of citrus flavor.',
    themeColor: '#4ADE80', // Green-400
    frameCount: 240,
    sequenceBaseUrl: '/gif-avocado-salmon/frame_',
    suffix: '_delay-0.041s.webp',
    isDarkOverride: true
  },
  {
    id: 'classic-salmon',
    name: 'Classic Salmon',
    subtitle: 'Healthy Option',
    description: 'A lighter take on the Avocado Salmon, served with organic greens and a tangy citrus dressing.',
    themeColor: '#FB923C', // Orange-400
    frameCount: 120,
    sequenceBaseUrl: 'https://placehold.co/1920x1080/111/fff?text=Classic+Variant+Frame+',
    isDarkOverride: false
  },
  {
    id: 'spicy-salmon',
    name: 'Spicy Salmon',
    subtitle: 'Bold Flavor',
    description: 'For those who love a kick, this dish combines spicy seasoning with creamy avocado and fresh salmon.',
    themeColor: '#F87171', // Red-400
    frameCount: 120,
    sequenceBaseUrl: 'https://placehold.co/1920x1080/222/fff?text=Spicy+Variant+Frame+',
    isDarkOverride: true
  }
];

export const SOCIAL_LINKS = [
  { name: 'X', icon: 'fa-brands fa-x-twitter', url: '#' },
  { name: 'Instagram', icon: 'fa-brands fa-instagram', url: '#' },
  { name: 'Facebook', icon: 'fa-brands fa-facebook-f', url: '#' }
];
