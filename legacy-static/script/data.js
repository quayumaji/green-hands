/* Photo inventory and editable menu content. Add image paths here; use /images/name.jpg. */
const GH_DATA = {
  business: {
    name: "Green Hands African Restaurant",
    phone: "(410) 412-6694",
    email: "greenhandsrestaurant@yahoo.com",
    instagram: "greenhandsresturant",
    address: "7900 Governor Ritchie Highway, No. E113, Glen Burnie, MD 21061",
    hours: ["Tuesday–Saturday · 11:00 am–8:00 pm", "Sunday · 11:00 am–6:00 pm", "Monday · Closed"]
  },
  photos: {
    hero: { image: "../images/image-1.jpg", alt: "Jollof rice with peppers, grilled fish, and skewers", label: "Jollof rice, grilled fish & sides" },
    jollof: { image: "../images/image-8.jpeg", alt: "Jollof rice cooked with red and green peppers", label: "Jollof Rice" },
    egusi: { image: "../images/image-12.jpeg", alt: "Egusi soup with leafy greens and assorted meats", label: "Egusi" },
    "mega-fries": { image: "../images/image-3.jpeg", alt: "Loaded fries topped with melted cheese, bacon, and green onions", label: "Mega Fries" },
    about: { image: "", alt: "The Green Hands family and restaurant kitchen", label: "Your restaurant or kitchen photo" },
    galleryInterior: { image: "", alt: "Inside Green Hands African Restaurant", label: "Restaurant interior" },
    galleryJollof: { image: "", alt: "A plate of Green Hands Jollof Rice", label: "Jollof Rice" },
    galleryCommunity: { image: "", alt: "Friends and family enjoying a meal at Green Hands", label: "Community & guests" },
    galleryOfada: { image: "", alt: "Ofada Rice and Ofada Stew, served at Green Hands", label: "Ofada Rice & Stew" },
    galleryKitchen: { image: "", alt: "A freshly prepared meal from the Green Hands kitchen", label: "Fresh from our kitchen" },
    galleryGathering: { image: "", alt: "A community gathering at Green Hands African Restaurant", label: "Community gathering" }
  },
  menu: [
    { id: "mega-fries", name: "Mega Fries", category: "fast-food", price: 1499, description: "Fried French fries baked with melted cheddar, mozzarella, and crispy bacon.", photo: { image: "../images/image-3.jpeg", alt: "Loaded fries topped with melted cheese, bacon, and green onions", label: "Photo of Mega Fries" }, tags: [] },
    { id: "chicken-wings", name: "Chicken Wings", category: "fast-food", price: 799, description: "Fried chicken wings tossed with your choice of BBQ or buffalo sauce.", photo: { image: "../images/image-4.jpeg", alt: "Seasoned chicken wings grilling over charcoal", label: "Photo of Chicken Wings" }, tags: [], choices: [{ name: "Sauce", values: ["BBQ", "Buffalo"] }] },
    { id: "shawarma", name: "Shawarma", category: "fast-food", price: 1499, description: "Chicken with cabbage, carrot, mayonnaise, ketchup, and lemon juice.", photo: { image: "../images/image-5.jpeg", alt: "Chicken shawarma wraps filled with chicken, vegetables, and creamy sauce", label: "Photo of Chicken Shawarma" }, tags: [] },
    { id: "quesadillas", name: "Quesadillas", category: "fast-food", price: 1499, description: "Cheddar cheese with your choice of chicken or steak, served with sour cream and salsa.", photo: { image: "../images/image-6.jpeg", alt: "Stacked quesadillas with melted cheese, peppers, and a savory filling", label: "Photo of Quesadillas" }, tags: [], choices: [{ name: "Protein", values: ["Chicken", "Steak"] }] },
    { id: "vegetable-quesadillas", name: "Vegetable Quesadillas", category: "fast-food", price: 1499, description: "Cheddar, tomatoes, onions, green and red peppers, served with sour cream and salsa. (Menu description also lists chicken; please confirm ingredients.)", photo: { image: "../images/image-7.jpeg", alt: "Vegetable quesadillas stacked with peppers, corn, beans, and melted cheese", label: "Photo of Vegetable Quesadillas" }, tags: ["Vegetarian? · please confirm"] },
    { id: "jollof-rice", name: "Jollof Rice", category: "rice", price: 1600, description: "Rice cooked with fresh tomatoes, tomato paste, pepper, onions, chicken broth, bouillon, and oil. Served with plantains and your choice of protein.", photo: { image: "../images/image-8.jpeg", alt: "Jollof rice cooked with red and green peppers", label: "Photo of Jollof Rice" }, tags: [], choices: [{ name: "Protein", values: ["Beef", "Stew chicken", "Fried chicken", "Fried turkey", "Stew turkey", "Fried fish", "Stew fish", "Assorted goat meat"] }] },
    { id: "ofada-rice", name: "Ofada Rice & Ofada Stew", category: "rice", price: 1900, description: "Ofada rice with assorted meats, red and green pepper, palm oil, scotch bonnet, dried fish, crayfish, and locust beans. Served with plantains.", photo: { image: "../images/image-9.jpeg", alt: "Ofada rice served with spicy stew, assorted meats, and an egg", label: "Ofada Rice & Stew" }, tags: ["Spicy"] },
    { id: "wings-fish-fries", name: "Wings or Fish Fillet with Fries", category: "rice", price: 1600, description: "Seasoned fries served with your choice of chicken wings or fish fillet.", photo: { image: "../images/image-10.jpeg", alt: "Golden fried fish fillet served with seasoned fries", label: "Photo of Wings or Fish with Fries" }, tags: [], choices: [{ name: "Choose one", values: ["Chicken wings", "Fish fillet"] }] },
    { id: "gbegiri-ewedu", name: "Gbegiri / Ewedu", category: "swallow", price: 1700, description: "Brown beans and jute-leaf stew with crayfish, palm oil, and seasoning, served with assorted meat.", photo: { image: "../images/image-11.jpeg", alt: "Gbegiri and green Ewedu served with assorted meat", label: "Gbegiri / Ewedu" }, tags: [], choices: [{ name: "Swallow", values: ["Fufu / Okele", "Amala / Yam", "Eba / Garri", "Poundo yam"] }, { name: "Protein", values: ["Beef", "Chicken", "Turkey", "Fish"] }] },
    { id: "egusi", name: "Egusi", category: "swallow", price: 1700, description: "Ground melon seed cooked with palm oil, pepper, smoked fish, tripe, beef, iru, and spinach.", photo: { image: "../images/image-12.jpeg", alt: "Egusi soup with leafy greens and assorted meats", label: "Egusi" }, tags: ["Spicy"], choices: [{ name: "Swallow", values: ["Fufu / Okele", "Amala / Yam", "Eba / Garri", "Poundo yam"] }, { name: "Protein", values: ["Beef", "Chicken", "Turkey", "Fish"] }] },
    { id: "efo-riro", name: "Spinach / Efo Riro", category: "swallow", price: 1700, description: "Spinach simmered with palm oil, onion, pepper, smoked fish, crayfish, beef, tripe, and iru.", photo: { image: "../images/image-13.jpeg", alt: "Spinach Efo Riro simmered with peppers and assorted meats", label: "Spinach / Efo Riro" }, tags: ["Spicy"], choices: [{ name: "Swallow", values: ["Fufu / Okele", "Amala / Yam", "Eba / Garri", "Poundo yam"] }, { name: "Protein", values: ["Beef", "Chicken", "Turkey", "Fish"] }] },
    { id: "moin-moin", name: "Moin Moin", category: "extras", price: 500, description: "A savory, steamed bean pudding.", photo: { image: "../images/image-15.jpeg", alt: "Steamed Moin Moin bean pudding wrapped in leaves", label: "Moin Moin" }, tags: [] },
    { id: "plantain", name: "Plantain / Dodo", category: "extras", price: 299, description: "Sweet plantains, fried until golden.", photo: { image: "../images/image-14.jpeg", alt: "Golden fried plantain slices", label: "Plantain / Dodo" }, tags: ["Vegetarian"] },
    { id: "beans", name: "Beans", category: "extras", price: 399, description: "A hearty side of beans.", photo: { image: "", alt: "A side of beans", label: "Photo of Beans" }, tags: ["Vegetarian"] },
    { id: "iyan", name: "Iyan", category: "extras", price: 199, description: "Pounded yam.", photo: { image: "../images/image-18.jpeg", alt: "White pounded yam being stirred in a bowl", label: "Iyan" }, tags: ["Vegetarian"] },
    { id: "amala", name: "Amala", category: "extras", price: 199, description: "A soft, traditional yam-flour swallow.", photo: { image: "../images/image-16.jpeg", alt: "Portions of Amala, a traditional yam-flour swallow", label: "Amala" }, tags: ["Vegetarian"] },
    { id: "eba", name: "Eba", category: "extras", price: 199, description: "A classic garri swallow.", photo: { image: "../images/image-17.jpeg", alt: "Golden Eba portions served on a plate", label: "Eba" }, tags: ["Vegetarian"] },
    { id: "fufu", name: "Fufu", category: "extras", price: 199, description: "A soft, smooth traditional swallow, perfect with your favorite soup.", photo: { image: "../images/image-19.jpeg", alt: "Three smooth white portions of Fufu served on a plate", label: "Fufu" }, tags: [] },
    { id: "jollof-rice-side", name: "Jollof Rice", category: "extras", price: 399, description: "A side of our tomato-rich Jollof Rice.", photo: { image: "../images/image-8.jpeg", alt: "A serving of Jollof Rice cooked with peppers", label: "Jollof Rice" }, tags: ["Vegetarian? · confirm broth"] }
  ],
  categories: [
    { id: "fast-food", title: "Fast food & snacks", intro: "Something satisfying, any time of day." },
    { id: "rice", title: "Rice plates", intro: "Served with plantains and your choice of protein, where listed." },
    { id: "swallow", title: "Soups & swallow", intro: "Choose your swallow and protein to make it your own." },
    { id: "extras", title: "Extras", intro: "A little something extra for the table." }
  ],
  gallery: ["galleryInterior", "galleryJollof", "galleryCommunity", "galleryOfada", "galleryKitchen", "galleryGathering"]
};

if (typeof window !== "undefined") window.GH_DATA = GH_DATA;
if (typeof module !== "undefined") module.exports = GH_DATA;
