# Unique Showroom

The showroom storefront is a React app. Its maintenance-store checkout creates
pending orders in a Node.js API backed by MySQL, and the admin dashboard at
`/admin` lets staff approve orders and manage discount codes.

## Run the project with XAMPP

1. Start **MySQL** in the XAMPP Control Panel.
2. Open phpMyAdmin (`http://localhost/phpmyadmin`), select **SQL**, and run the
   statements in [`mysql.txt`](./mysql.txt). This creates `unique_showroom`, its
   tables, and the product price/stock catalog used by checkout.
   If you imported an earlier version of this file, run the updated SQL again
   to add the authentication and service-booking tables and service catalog.
3. Copy `server/.env.example` to `server/.env`. Set `DB_USER`, `DB_PASSWORD`,
   and `DB_NAME` to match your local MySQL configuration. The example admin
   login is `admin` / `admin@123`; change it in `server/.env` before sharing
   the app or deploying it. Replace `ADMIN_TOKEN_SECRET` with a long random
   value as well.
4. In a terminal at the project root, install and start the API:

   ```sh
   cd server
   npm install
   npm start
   ```

   The API runs at `http://localhost:5000`. It checks the MySQL connection
   during startup and reports a clear error if MySQL is unavailable.
5. In a second terminal at the project root, start the React app:

   ```sh
   npm install
   npm start
   ```

   Open `http://localhost:3000`, add in-stock products from the Maintenance
   Store, and place an order with customer and delivery details. Orders start
   as **Pending approval**. Open `http://localhost:3000/admin` (or use the
   Admin dashboard at `/admin`) to review orders, browse registered customer
   accounts, see customer service bookings and car-wash request counts, view
   daily estimated service income and package breakdowns, filter bookings by
   date, export CSV reports, and manage discount codes.

Open `http://localhost:3000/login` to sign in. Customer accounts are stored in
MySQL: first access creates an account using the name, email, and password;
returning customers sign in with their email and password. Passwords are
salted and hashed by the API. The admin account is seeded into MySQL from
`ADMIN_USERNAME` and `ADMIN_PASSWORD` in `server/.env` when the API starts,
and its password is also stored as a salted hash. Admin access additionally
requires `ADMIN_TOKEN_SECRET`.

The API creates the customer and admin authentication tables at startup if they
do not exist; the same table definitions are included in `mysql.txt`.

For backend development with automatic restart, use `npm run server:dev` from
the project root after installing `server` dependencies.

The API recalculates prices, stock, discounts, and service booking estimates
using MySQL data. Admin endpoints require the admin sign-in token. Service
income reports are booking estimates (rejected requests are excluded); the app
does not record customer payments, costs, or profit/loss.

## Create React App scripts

This project was bootstrapped with Create React App. Use `npm test` to run
frontend tests, and `npm run build` to create a production build.
