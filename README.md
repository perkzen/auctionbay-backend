# AuctionBay Backend

AuctionBay is a full-stack auction web application that enables users to create and manage events for auctions. Registered users can create auction events, participate in bidding, and manage their auction events. The highest bid at the end of the auction period wins the item.

## Features

- **User Authentication**: JWT token-based authentication for secure user sessions.
- **Auction Creation and Management**: Users can create auctions by providing images, titles, descriptions, starting prices, and durations.
- **Bidding System**: Bidders can place bids, view the status of their bids, and the system automatically increments bids up to a maximum specified amount.
- **Bid History**: Users can view the history of bids for their auction events.
- **Security**: Implementation of security best practices according to OWASP guidelines.

## Technologies Used

- **Backend Framework**: NestJS (with Express)
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)

## Pre-requirements

- Node.js 20+
- Docker
- AWS Account


## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the root directory with the following content:

```env
PORT=8000
NODE_ENV=development
SWAGGER_PATH=docs
DATABASE_URL=postgresql://admin:admin@localhost:5432/auctionbay?schema=public
JWT_SECRET=secret
JWT_EXPIRATION=1d
CORS_ORIGIN=*
AWS_S3_REGION=
AWS_S3_BUCKET_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

### 3. Run database migrations

```bash
npx prisma migrate dev
```

### 4. Run the development server

```bash
npm run start:dev
```

The backend server will run on [http://localhost:8000](http://localhost:8000).

