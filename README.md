# E Commerce Mini Store

A full stack e commerce web application built with React, TypeScript, Laravel, and PostgreSQL. The project demonstrates product management, session based authentication, shopping cart functionality, checkout, and order management in a single application.

## Overview

E Commerce Mini Store is a portfolio project designed to demonstrate full stack web development using a modern frontend and a Laravel REST API. Customers can browse products, manage a shopping cart, and place orders, while administrators can manage the product catalogue and oversee customer orders.

The application uses Laravel Sanctum for authentication and PostgreSQL for persistent application data.

**Project status:** Local development version completed. Public deployment is planned for a future stage.

## Features

### Customer Features

* User registration, login, and logout
* Role based access to customer and administrator areas
* Browse products and view product details
* Search, filter, and sort products
* Browse products by category
* View product availability and stock information
* Add products to a shopping cart
* Maintain a guest cart using browser local storage
* Checkout with authentication required
* View order history and order details
* Track order status

### Administrator Features

* Protected administrator dashboard
* Create, update, and delete products
* Upload product images
* Manage product names, descriptions, prices, categories, and stock quantities
* View customer orders and order details
* Update order statuses
* Enforce order status transition rules

### Technical Features

* Laravel REST API
* Laravel Sanctum authentication
* Role based authorization
* PostgreSQL database integration
* React and TypeScript frontend
* Zustand state management
* Axios API communication
* Responsive user interface
* Server side price and stock validation
* Transaction based order creation
* Stock locking to help prevent overselling
* Order items retain the product price at the time of purchase

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| State Management | Zustand |
| API Communication | Axios |
| Backend | PHP, Laravel |
| Authentication | Laravel Sanctum |
| Database | PostgreSQL |
| Development Tools | Git, GitHub, npm, Composer |

## Project Structure

```text
E-commerce_Mini_Store/
├── backend/
│   ├── app/
│   ├── database/
│   ├── routes/
│   ├── storage/
│   ├── tests/
│   ├── artisan
│   └── composer.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

The exact directory contents may vary with future updates.

## Product Categories

The catalogue supports the following product categories:

* Food & Groceries
* Clothing
* Home Decor
* Footwear
* Handicrafts

Product prices are stored in integer paisa to avoid floating point precision issues in monetary calculations and displayed in Pakistani rupees (PKR).

## Getting Started

Follow these instructions to run the application locally.

### Prerequisites

Install the following tools before starting:

* PHP with the required Laravel extensions, including PostgreSQL support
* Composer
* Node.js and npm
* PostgreSQL
* Git

A compatible PHP version must be selected according to the Laravel version specified in `backend/composer.json`.

### 1. Clone the Repository

```bash
git clone https://github.com/Umer-1911/E-commerce_MiniStore
cd E-commerce_Mini_Store
```

Replace the placeholder with your repository's actual GitHub URL.

### 2. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Install PHP dependencies:

```bash
composer install
```

Create the local environment file:

```bash
cp .env.example .env
```

On Windows, you can copy `.env.example` to `.env` manually or use:

```powershell
Copy-Item .env.example .env
```

Generate the Laravel application key:

```bash
php artisan key:generate
```

Configure the database settings in `backend/.env`:

```dotenv
APP_NAME="E Commerce Mini Store"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ecommerce_mini_store
DB_USERNAME=your_postgres_username
DB_PASSWORD=your_postgres_password
```

Create a PostgreSQL database named `ecommerce_mini_store`, or update the configuration to match your existing database.

Keep all passwords and other secrets private. Never commit your `.env` file.

Run database migrations:

```bash
php artisan migrate
```

If the project includes seeders that you want to use in your local development environment, review them first and then run:

```bash
php artisan db:seed
```

Start the Laravel development server:

```bash
php artisan serve
```

The backend should now be available at:

`http://localhost:8000`

### 3. Configure the Frontend

Open a separate terminal from the repository root:

```bash
cd frontend
```

Install JavaScript dependencies:

```bash
npm install
```

Review the existing frontend environment configuration and set the local Laravel API URL using the variable name expected by the application.

For example, if the project uses a Vite environment variable named `VITE_API_URL`:

```dotenv
VITE_API_URL=http://localhost:8000
```

Use the actual environment variable and URL format expected by the existing Axios configuration. Do not introduce a new variable without updating the application to read it.

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed in your terminal, typically:

`http://localhost:5173`

### 4. Configure Authentication and CORS

Because the application uses Laravel Sanctum, the frontend and backend must be configured to communicate correctly.

For local development, verify the following:

* The frontend origin is allowed by the backend's CORS configuration.
* Sanctum stateful domains include the appropriate local development host and port.
* Session cookies and credentials are configured correctly in the existing Axios and Laravel setup.
* The CSRF cookie flow works before authenticated requests are made.

Use the existing project configuration as the source of truth for the required environment variables and settings.

## Order Processing

The application includes an order lifecycle with the following statuses:

`Pending → Processing → Shipped → Completed`

Orders can also be cancelled according to the application's status transition rules.

Order creation uses a database transaction and stock locking to reduce the risk of multiple simultaneous orders overselling available inventory. Product prices and stock are validated on the server rather than trusted from the frontend.

Each order item records the product price at the time the order is placed.

## API Overview

The Laravel backend exposes REST API endpoints for products, authentication, customer orders, and administrator operations.

Representative endpoint groups include:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/products` | Retrieve products |
| GET | `/api/products/{id}` | Retrieve product details |
| POST | `/api/admin/products` | Create a product |
| PUT/PATCH | `/api/admin/products/{id}` | Update a product |
| DELETE | `/api/admin/products/{id}` | Delete a product |
| GET | `/api/orders` | Retrieve the authenticated customer's orders |
| GET | `/api/orders/{order}` | Retrieve an order the customer is authorized to access |
| GET | `/api/admin/orders` | Retrieve orders for administration |
| GET | `/api/admin/orders/{order}` | Retrieve order details for administration |
| PATCH | `/api/admin/orders/{order}/status` | Update an order's status |

Authentication endpoints and middleware protection are implemented in the backend. Refer to `backend/routes/api.php` and the corresponding controllers for the current route definitions and request formats.

Administrator endpoints require appropriate authorization.

## Testing and Build

Run the backend test suite from the `backend/` directory:

```bash
php artisan test
```

Build the frontend from the `frontend/` directory:

```bash
npm run build
```

These commands help verify backend behavior and frontend production compilation. Run them against your current code before publishing new changes.

## Security Notes

* Never commit `.env` files, credentials, API keys, or production secrets.
* Use server side authorization for administrator functionality.
* Validate product prices, quantities, and stock on the backend.
* Configure HTTPS and secure session cookies before public deployment.
* Use separate production database credentials.
* Do not use development seed data or test credentials in a public production environment without reviewing them.
* A payment gateway is not represented as implemented by this project. Any future payment integration should include appropriate server side verification.

## Current Limitations

* The application is currently intended for local development and portfolio demonstration.
* Public deployment has not yet been completed.
* A production payment gateway is not yet implemented.
* Production image storage and other deployment specific services must be configured before hosting.
* Google sign in is not implemented and should not be considered a working authentication method.

## Future Improvements

* Deploy the frontend and backend to public hosting.
* Configure a production PostgreSQL database.
* Add persistent external storage for uploaded product images.
* Integrate a verified payment gateway.
* Add automated deployment and continuous integration.
* Expand automated testing and production monitoring.

## Author

Developed as a full stack portfolio project to demonstrate frontend development, backend API design, database integration, authentication, and e commerce workflows.

## License

No license has been specified yet. Unless a license is added to this repository, the project should not be assumed to be available for unrestricted reuse or redistribution.
