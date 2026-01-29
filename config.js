/**
 * CONFIGURATION SETTINGS
 * * GOOGLE_API_KEY: Your unique key to access Google Places API.
 * cuisineMapping: Links user-friendly categories to Google's specific Place Types.
 */
export const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY";

export const cuisineMapping = {
    'Comfort': ['hamburger_restaurant', 'steak_house', 'pizza_restaurant'],
    'Spicy': ['mexican_restaurant', 'indian_restaurant', 'thai_restaurant'],
    'Fancy': ['fine_dining_restaurant', 'french_restaurant', 'seafood_restaurant'],
    'Healthy': ['vegan_restaurant', 'vegetarian_restaurant', 'salad_shop'],
    'Quick': ['sandwich_shop', 'cafe', 'bakery'],
    'Late Night': ['diner', 'pizza_restaurant', 'fast_food_restaurant']
};
