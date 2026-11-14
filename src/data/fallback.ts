import type { Gallery, Menu, MenuItem, OptionGroup, Restaurant } from "@/lib/types";

/**
 * Snapshot used only when the API cannot be reached, so the site still renders
 * (menu is shown read-only). Keep in sync with green-hands-backend/src/scripts/seedData.ts.
 */

export const FALLBACK_RESTAURANT: Restaurant = {
  name: "Green Hands African Restaurant",
  tagline: "Honest West and East African food, cooked from scratch with real spices and a family-kitchen welcome.",
  category: "Restaurant / Fast food",
  address: {
    line1: "7900 Governor Ritchie Highway",
    line2: "No. E113",
    city: "Glen Burnie",
    state: "MD",
    postalCode: "21061",
    country: "US",
    formatted: "7900 Governor Ritchie Highway, No. E113, Glen Burnie, MD 21061",
  },
  phone: "(410) 412-6694",
  phoneE164: "+14104126694",
  email: "greenhandsrestaurant@yahoo.com",
  instagram: "greenhandsresturant",
  timezone: "America/New_York",
  hours: [
    { days: "Tuesday - Saturday", hours: "11:00 am - 8:00 pm" },
    { days: "Sunday", hours: "11:00 am - 6:00 pm" },
    { days: "Monday", hours: "Closed" },
  ],
  hoursByDay: [
    { day: 0, open: "11:00", close: "18:00" },
    { day: 2, open: "11:00", close: "20:00" },
    { day: 3, open: "11:00", close: "20:00" },
    { day: 4, open: "11:00", close: "20:00" },
    { day: 5, open: "11:00", close: "20:00" },
    { day: 6, open: "11:00", close: "20:00" },
  ],
  isOpenNow: false,
  localDate: "",
  pickup: { leadMinutes: 20, slotMinutes: 15, maxDaysAhead: 7 },
  taxRate: 0.06,
  currency: "usd",
  paymentsProvider: "mock",
};

function group(name: string, options: string[]): OptionGroup {
  return {
    id: `fallback-${name.toLowerCase()}`,
    name,
    required: true,
    minSelect: 1,
    maxSelect: 1,
    options: options.map((o) => ({ id: `fallback-${o.toLowerCase().replace(/\W+/g, "-")}`, name: o, priceDeltaCents: 0, isAvailable: true })),
  };
}

const SWALLOW = group("Swallow", ["Fufu / Okele", "Amala / Yam", "Eba / Garri", "Poundo yam"]);
const PROTEIN_SWALLOW = group("Protein", ["Beef", "Chicken", "Turkey", "Fish"]);
const PROTEIN_RICE = group("Protein", [
  "Beef",
  "Stew chicken",
  "Fried chicken",
  "Fried turkey",
  "Stew turkey",
  "Fried fish",
  "Stew fish",
  "Assorted goat meat",
]);

function item(
  categoryId: string,
  slug: string,
  name: string,
  priceCents: number,
  description: string,
  image: string,
  imageAlt: string,
  extra: Partial<MenuItem> = {},
): MenuItem {
  return {
    id: `fallback-${slug}`,
    categoryId,
    name,
    slug,
    description,
    priceCents,
    isPriceConfirmed: true,
    imageUrl: image,
    imageAlt,
    dietaryLabels: [],
    isAvailable: true,
    isFeatured: false,
    sortOrder: 0,
    canOrder: false, // never orderable while offline
    optionGroups: [],
    ...extra,
  };
}

export const FALLBACK_MENU: Menu = {
  categories: [
    {
      id: "fallback-fast-food",
      name: "Fast food & snacks",
      slug: "fast-food",
      description: "Something satisfying, any time of day.",
      sortOrder: 0,
      isActive: true,
      items: [
        item("fallback-fast-food", "mega-fries", "Mega Fries", 1499, "Fried French fries baked with melted cheddar, mozzarella, and crispy bacon.", "/images/image-3.jpeg", "Loaded fries topped with melted cheese, bacon, and green onions", { isFeatured: true }),
        item("fallback-fast-food", "chicken-wings", "Chicken Wings", 799, "Fried chicken wings tossed with your choice of BBQ or buffalo sauce.", "/images/image-4.jpeg", "Seasoned chicken wings grilling over charcoal", { optionGroups: [group("Sauce", ["BBQ", "Buffalo"])] }),
        item("fallback-fast-food", "shawarma", "Shawarma", 1499, "Chicken with cabbage, carrot, mayonnaise, ketchup, and lemon juice.", "/images/image-5.jpeg", "Chicken shawarma wraps filled with chicken, vegetables, and creamy sauce"),
        item("fallback-fast-food", "quesadillas", "Quesadillas", 1499, "Cheddar cheese with your choice of chicken or steak, served with sour cream and salsa.", "/images/image-6.jpeg", "Stacked quesadillas with melted cheese, peppers, and a savory filling", { optionGroups: [group("Protein", ["Chicken", "Steak"])] }),
        item("fallback-fast-food", "vegetable-quesadillas", "Vegetable Quesadillas", 1499, "Cheddar, tomatoes, onions, green and red peppers, served with sour cream and salsa.", "/images/image-7.jpeg", "Vegetable quesadillas stacked with peppers, corn, beans, and melted cheese", { dietaryLabels: ["vegetarian"] }),
      ],
    },
    {
      id: "fallback-rice",
      name: "Rice plates",
      slug: "rice",
      description: "Served with plantains and your choice of protein, where listed.",
      sortOrder: 1,
      isActive: true,
      items: [
        item("fallback-rice", "jollof-rice", "Jollof Rice", 1600, "Rice cooked with fresh tomatoes, tomato paste, pepper, onions, chicken broth, bouillon, and oil. Served with plantains and your choice of protein.", "/images/image-8.jpeg", "Jollof rice cooked with red and green peppers", { isFeatured: true, dietaryLabels: ["spicy"], optionGroups: [PROTEIN_RICE] }),
        item("fallback-rice", "ofada-rice", "Ofada Rice & Ofada Stew", 1900, "Ofada rice with assorted meats, red and green pepper, palm oil, scotch bonnet, dried fish, crayfish, and locust beans. Served with plantains.", "/images/image-9.jpeg", "Ofada rice served with spicy stew, assorted meats, and an egg", { isFeatured: true, dietaryLabels: ["spicy"] }),
        item("fallback-rice", "wings-fish-fries", "Wings or Fish Fillet with Fries", 1600, "Seasoned fries served with your choice of chicken wings or fish fillet.", "/images/image-10.jpeg", "Golden fried fish fillet served with seasoned fries", { optionGroups: [group("Choose one", ["Chicken wings", "Fish fillet"])] }),
      ],
    },
    {
      id: "fallback-swallow",
      name: "Soups & swallow",
      slug: "swallow",
      description: "Choose your swallow and protein to make it your own.",
      sortOrder: 2,
      isActive: true,
      items: [
        item("fallback-swallow", "gbegiri-ewedu", "Gbegiri / Ewedu", 1700, "Brown beans and jute-leaf stew with crayfish, palm oil, and seasoning, served with assorted meat.", "/images/image-11.jpeg", "Gbegiri and green Ewedu served with assorted meat", { optionGroups: [SWALLOW, PROTEIN_SWALLOW] }),
        item("fallback-swallow", "egusi", "Egusi", 1700, "Ground melon seed cooked with palm oil, pepper, smoked fish, tripe, beef, iru, and spinach.", "/images/image-12.jpeg", "Egusi soup with leafy greens and assorted meats", { isFeatured: true, dietaryLabels: ["spicy"], optionGroups: [SWALLOW, PROTEIN_SWALLOW] }),
        item("fallback-swallow", "efo-riro", "Spinach / Efo Riro", 1700, "Spinach simmered with palm oil, onion, pepper, smoked fish, crayfish, beef, tripe, and iru.", "/images/image-13.jpeg", "Spinach Efo Riro simmered with peppers and assorted meats", { dietaryLabels: ["spicy"], optionGroups: [SWALLOW, PROTEIN_SWALLOW] }),
      ],
    },
    {
      id: "fallback-extras",
      name: "Extras",
      slug: "extras",
      description: "A little something extra for the table.",
      sortOrder: 3,
      isActive: true,
      items: [
        item("fallback-extras", "moin-moin", "Moin Moin", 500, "A savory, steamed bean pudding.", "/images/image-15.jpeg", "Steamed Moin Moin bean pudding wrapped in leaves", { dietaryLabels: ["vegetarian"] }),
        item("fallback-extras", "plantain", "Plantain / Dodo", 299, "Sweet plantains, fried until golden.", "/images/image-14.jpeg", "Golden fried plantain slices", { dietaryLabels: ["vegetarian", "vegan"] }),
        item("fallback-extras", "beans", "Beans", 399, "A hearty side of beans.", "", "A side of beans", { dietaryLabels: ["vegetarian"] }),
        item("fallback-extras", "iyan", "Iyan", 199, "Pounded yam.", "/images/image-18.jpeg", "White pounded yam being stirred in a bowl", { dietaryLabels: ["vegetarian", "vegan"] }),
        item("fallback-extras", "amala", "Amala", 199, "A soft, traditional yam-flour swallow.", "/images/image-16.jpeg", "Portions of Amala, a traditional yam-flour swallow", { dietaryLabels: ["vegetarian", "vegan"] }),
        item("fallback-extras", "eba", "Eba", 199, "A classic garri swallow.", "/images/image-17.jpeg", "Golden Eba portions served on a plate", { dietaryLabels: ["vegetarian", "vegan"] }),
        item("fallback-extras", "fufu", "Fufu", 199, "A soft, smooth traditional swallow, perfect with your favorite soup.", "/images/image-19.jpeg", "Three smooth white portions of Fufu served on a plate", { dietaryLabels: ["vegetarian", "vegan"] }),
        item("fallback-extras", "jollof-rice-side", "Jollof Rice (side)", 399, "A side of our tomato-rich Jollof Rice.", "/images/image-8.jpeg", "A serving of Jollof Rice cooked with peppers", { dietaryLabels: ["spicy"] }),
      ],
    },
  ],
};

export const FALLBACK_GALLERY: Gallery = {
  categories: ["interior", "dishes", "events", "customers"],
  images: [
    { id: "g1", url: "/images/image-1.jpg", alt: "Jollof rice with peppers, grilled fish, and skewers", caption: "Jollof rice, grilled fish & sides", category: "dishes" },
    { id: "g2", url: "/images/image-8.jpeg", alt: "Jollof rice cooked with red and green peppers", caption: "Jollof Rice", category: "dishes" },
    { id: "g3", url: "/images/image-9.jpeg", alt: "Ofada rice served with spicy stew, assorted meats, and an egg", caption: "Ofada Rice & Stew", category: "dishes" },
    { id: "g4", url: "/images/image-12.jpeg", alt: "Egusi soup with leafy greens and assorted meats", caption: "Egusi", category: "dishes" },
    { id: "g5", url: "/images/image-13.jpeg", alt: "Spinach Efo Riro simmered with peppers and assorted meats", caption: "Efo Riro", category: "dishes" },
    { id: "g6", url: "/images/image-2.jpg", alt: "Loaded fries with melted cheese and grilled onions", caption: "Mega Fries", category: "dishes" },
  ],
};

/** Hero, favorites and story photos that live in this repo (not managed by the API). */
export const SITE_PHOTOS = {
  hero: { src: "/images/image-1.jpg", alt: "Jollof rice with peppers, grilled fish, and skewers", label: "Jollof rice, grilled fish & sides" },
  jollof: { src: "/images/image-8.jpeg", alt: "Jollof rice cooked with red and green peppers", label: "Jollof Rice" },
  egusi: { src: "/images/image-12.jpeg", alt: "Egusi soup with leafy greens and assorted meats", label: "Egusi" },
  megaFries: { src: "/images/image-3.jpeg", alt: "Loaded fries topped with melted cheese, bacon, and green onions", label: "Mega Fries" },
  about: { src: "", alt: "The Green Hands family and restaurant kitchen", label: "Your restaurant or kitchen photo" },
};
