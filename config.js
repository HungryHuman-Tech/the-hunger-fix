/**
 * REFINED CONFIGURATION
 * Removed: 'store', 'fish_market', 'grocery_store', 'hotel', 'lodging'
 * Focused strictly on restaurant and dining sub-types.
 */
export const GOOGLE_API_KEY = "AIzaSyBkYWkdgAQ0hB_hlFmTLcJxm0dvDDO7JVA";

export const cuisineMapping = {
    'Comfort': [
        'american_restaurant', 
        'steak_house', 
        'pizza_restaurant', 
        'italian_restaurant', 
        'barbecue_restaurant'
    ],
    'Spicy': [
        'mexican_restaurant', 
        'indian_restaurant', 
        'thai_restaurant', 
        'chinese_restaurant', 
        'vietnamese_restaurant'
    ],
    'Fancy': [
        'fine_dining_restaurant', 
        'seafood_restaurant', 
        'french_restaurant', 
        'mediterranean_restaurant'
    ],
    'Healthy': [
        'vegan_restaurant', 
        'vegetarian_restaurant', 
        'juice_shop', 
        'acai_shop', 
        'mediterranean_restaurant',
        'salad_restaurant',
        'indian_restaurant', 
    ],
    'Quick': [
        'sandwich_shop', 
        'cafe', 
        'bakery', 
        'coffee_shop'
    ],
    'Late Night': [
        'diner', 
        'pizza_restaurant', 
        'hamburger_restaurant'
    ]
};
