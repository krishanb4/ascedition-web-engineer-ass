# Next.js Web Engineering Assessment

A comprehensive Next.js application demonstrating modern web development practices through a series of interconnected challenges including navigation, authentication, data visualization, and security features.

## 🚀 Overview

This project consists of four main challenges that build upon each other to create a complete web application:

1. **Basic Navbar** - Responsive navigation with collapsible mobile menu
2. **Advanced Login Flow** - Multi-step authentication with secure word generation and MFA
3. **Data Table** - Transaction history display with API integration
4. **Unit Tests** - Comprehensive testing suite (Optional)

## 📋 Features

### Challenge 1: Basic Navbar
- ✅ Responsive design (Desktop & Mobile views)
- ✅ Collapsible hamburger menu
- ✅ Search input field (UI only)
- ✅ Custom branding/title
- ✅ Navigation to login flow

### Challenge 2: Login Flow
- ✅ Multi-step authentication process
- ✅ Username validation
- ✅ Secure word generation with HMAC
- ✅ Rate limiting (10-second intervals)
- ✅ Password hashing with Web Crypto API
- ✅ Time-based MFA (TOTP-compatible)
- ✅ Session management with JWT
- ✅ Security constraints and expiration handling

### Challenge 3: Data Table
- ✅ Transaction history display
- ✅ Mock API integration
- ✅ Responsive table design
- ✅ Real-time data fetching

### Challenge 4: Unit Tests
- ✅ Comprehensive test coverage
- ✅ API endpoint testing
- ✅ Component testing
- ✅ Authentication flow testing

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: JWT + Web Crypto API
- **Testing**: Jest + React Testing Library
- **Security**: HMAC, bcrypt, rate limiting
- **State Management**: React Hooks

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/krishanb4/ascedition-web-engineer-ass.git
   cd ascedition-web-engineer-ass
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   SECURE_WORD_SECRET=your-hmac-secret-for-secure-word-generation
   MFA_SECRET=your-mfa-secret-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

### Run Unit Tests
```bash
npm test
# or
yarn test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
# or
yarn test:watch
```

### Generate Test Coverage Report
```bash
npm run test:coverage
# or
yarn test:coverage
```

## 🏗 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── getSecureWord/ # Secure word generation
│   │   │   ├── login/         # Login authentication
│   │   │   ├── verifyMfa/     # MFA verification
│   │   │   └── transaction-history/ # Mock transaction data
│   │   ├── login/             # Login flow pages
│   │   ├── dashboard/         # Post-login dashboard
│   │   └── layout.tsx         # Root layout with navbar
│   ├── components/            # Reusable components
│   │   ├── Navbar.tsx         # Navigation component
│   │   ├── LoginForm.tsx      # Multi-step login
│   │   ├── TransactionTable.tsx # Data table
│   │   └── ui/                # UI primitives
│   ├── lib/                   # Utility functions
│   │   ├── auth.ts            # Authentication helpers
│   │   ├── crypto.ts          # Cryptographic functions
│   │   └── validation.ts      # Input validation
│   └── types/                 # TypeScript definitions
├── __tests__/                 # Test files
├── public/                    # Static assets
├── tailwind.config.js         # Tailwind configuration
├── next.config.js             # Next.js configuration
└── package.json               # Dependencies and scripts
```

## 🔐 API Endpoints

### Authentication APIs

#### POST /api/getSecureWord
Generates a secure word for the login process.

**Request:**
```json
{
  "username": "string"
}
```

**Response:**
```json
{
  "secureWord": "string",
  "expiresAt": "timestamp",
  "message": "string"
}
```

**Security Features:**
- Rate limiting (10-second intervals per user)
- HMAC-based secure word generation
- 60-second expiration
- In-memory session storage

#### POST /api/login
Authenticates user with username, hashed password, and secure word.

**Request:**
```json
{
  "username": "string",
  "hashedPassword": "string",
  "secureWord": "string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "message": "string"
}
```

#### POST /api/verifyMfa
Verifies Multi-Factor Authentication code.

**Request:**
```json
{
  "username": "string",
  "code": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

**Security Features:**
- TOTP-compatible code generation
- 3 attempt limit before lockout
- Time-based validation

### Data APIs

#### GET /api/transaction-history
Returns mock transaction data for the authenticated user.

**Response:**
```json
{
  "transactions": [
    {
      "date": "string",
      "referenceId": "string",
      "to": "string",
      "transactionType": "string",
      "amount": "string"
    }
  ]
}
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

### Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Tailwind CSS** for styling

### Git Hooks

Pre-commit hooks are configured to:
- Run type checking
- Execute linting
- Run tests
- Format code

## 🧭 User Journey

### Complete Authentication Flow

1. **Landing Page** - User sees the navbar with Login button
2. **Username Entry** - User enters username and requests secure word
3. **Secure Word Display** - System displays time-limited secure word (60s)
4. **Password Entry** - User enters password (hashed client-side)
5. **MFA Challenge** - User enters 6-digit TOTP code
6. **Dashboard Access** - User redirected to transaction history table

### Security Features

- **Rate Limiting**: Prevents brute force attacks
- **Secure Word Expiration**: 60-second time limit
- **Password Hashing**: Client-side hashing before transmission
- **MFA Protection**: Time-based one-time passwords
- **JWT Sessions**: Secure session management
- **Attempt Limiting**: MFA lockout after 3 failed attempts

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

### Mobile Features
- Collapsible hamburger menu
- Touch-friendly buttons
- Optimized form layouts
- Responsive table design

## 🔍 Testing Strategy

### Unit Tests
- Component rendering
- User interactions
- API endpoint logic
- Authentication flows

### Integration Tests
- Complete login journey
- API integration
- State management
- Error handling

### Security Tests
- Rate limiting validation
- Token expiration
- Input sanitization
- Authentication bypass attempts

## 🚨 Known Issues & Limitations

1. **In-Memory Storage**: Session data is stored in memory (resets on server restart)
2. **Mock APIs**: Transaction data is hardcoded for demonstration
3. **MFA Simulation**: Uses mock TOTP generation (not real authenticator integration)
4. **Rate Limiting**: Simple in-memory implementation (not production-ready)

## 🔮 Future Enhancements

- Database integration for persistent storage
- Real authenticator app integration
- Advanced rate limiting with Redis
- Email/SMS notifications
- Audit logging
- Advanced security headers
- Progressive Web App (PWA) features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Demo Instructions

For the live demonstration during the interview:

1. **Setup Verification**: Ensure all dependencies are installed and server runs without errors
2. **Challenge 1**: Demonstrate responsive navbar functionality
3. **Challenge 2**: Walk through complete authentication flow
4. **Challenge 3**: Show transaction table with API integration
5. **Challenge 4**: Run test suite and show coverage report
6. **Code Review**: Explain architectural decisions and security implementations

### Demo Checklist

- [ ] Project runs locally without errors
- [ ] All features work as expected
- [ ] Tests pass successfully
- [ ] Code is well-documented
- [ ] Security features are demonstrated
- [ ] Responsive design is showcased

## 📞 Support

For questions or issues regarding this assessment:

- **Email**: [krishanbandara4444@gmail.com]
- **GitHub Issues**: [Repository Issues](https://github.com/krishanb4/ascedition-web-engineer-ass/issues)

---

**Note**: This is an assessment project created to demonstrate Next.js development skills, authentication flows, and modern web development practices. The security implementations are for demonstration purposes and should be enhanced for production use.