# Green Hands African Restaurant

Static, front-end-only restaurant website. No server, API, payment processor, or email service is included.

## Run and publish

Open `pages/index.html` in a browser to preview the site. For deployment, publish the project folder to any static web host, keeping the `pages`, `script`, and `style` folders together. The menu, photo placeholders, cart, and gallery work in the browser. The cart is saved in browser storage.

## Ordering and contact

The cart prepares an order request in the visitor's default email app. The visitor must send the message, and the restaurant must confirm the order and arrange payment/pickup. No online payment is taken and no order is submitted or confirmed by this website. The contact form similarly opens an email draft; it does not send automatically.

To enable secure online payment, order notifications, or automatic contact form delivery later, connect a separate hosted checkout and backend/email service. Never put private payment or email credentials in front-end files.

## How to add my photos

1. Add optimized WebP or JPEG photos under an `images` folder at the project root.
2. In `script/data.js`, replace a photo's empty `image` value with its path, such as `/images/jollof-rice.webp`. The `photos` list covers the hero, About page, and gallery; each menu item has its own `photo` field.
3. Keep each `alt` value accurate. Existing photo spaces maintain their aspect ratio and use `object-fit: cover` when an image is added.
4. Add or edit dishes and categories in the `menu` and `categories` data in the same file. Prices use cents; leave unknown prices as `null` until confirmed.

## Before launch

- Add restaurant, dish, and community photos.
- Confirm the Vegetable Quesadillas price and listed chicken ingredient; confirm dietary labels and broth/stock ingredients.
- Confirm menu details, options, serving sizes, and pickup expectations.
- Decide whether to add a hosted payment and email/order backend in a later phase.
