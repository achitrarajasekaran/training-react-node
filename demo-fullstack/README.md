# Full-Stack Demo Project

A comprehensive demonstration of full-stack development practices including:
- Express server with middleware and circuit breaker
- Provider-Repository Pattern
- React hooks and components
- Testing practices
- Development patterns

## Features

### Backend
- Express server with middleware architecture
- Circuit breaker pattern for resilience
- Provider-Repository pattern for data abstraction
- Async/await with proper error handling
- Comprehensive testing suite
- Input validation using Joi
- Logging with Winston

### Frontend
- React with hooks (useState, useEffect, useCallback)
- Reusable components with prop validation
- Custom hooks for data management
- Responsive design with CSS
- Form validation
- Error handling
- React Testing Library tests

## Project Structure

```
demo-fullstack/
├── src/
│   ├── server/
│   │   ├── index.js                 # Express server setup
│   │   ├── middleware/              # Express middleware
│   │   ├── providers/               # Data providers
│   │   ├── repositories/            # Data repositories
│   │   └── __tests__/              # Server tests
│   └── client/
│       ├── src/
│       │   ├── components/          # React components
│       │   ├── hooks/              # Custom React hooks
│       │   ├── App.js              # Main React component
│       │   └── __tests__/          # Frontend tests
│       └── package.json
└── package.json
```

## Getting Started

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Start development servers:
   ```bash
   npm run dev
   ```
   This will start both the backend server (port 3001) and frontend development server (port 3000).

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## Development Practices Demonstrated

1. **Fail-Fast Development**
   - Input validation
   - Prop validation
   - Error boundaries
   - Comprehensive testing

2. **Code Organization**
   - Clear separation of concerns
   - Provider-Repository pattern
   - Reusable components
   - Custom hooks

3. **Testing**
   - Unit tests
   - Integration tests
   - Component tests
   - Hook testing
   - Mock implementations

4. **Error Handling**
   - Circuit breaker pattern
   - Try-catch blocks
   - Error boundaries
   - User feedback

5. **Performance**
   - React.memo for optimization
   - useCallback for memoization
   - Proper state management
   - Efficient re-renders

## API Endpoints

- GET /api/users - Get all users
- POST /api/users - Create new user
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
