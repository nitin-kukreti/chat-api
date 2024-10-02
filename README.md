# NestJS Chat Application

A robust real-time chat application built with NestJS, featuring WebSocket support, JWT authentication, and Firebase notifications. This project uses PostgreSQL as the database and TypeORM for data management.

## Features

- **User Authentication**: Secure JWT-based authentication with route protection.
- **Real-time Chat**: One-on-one and group chat functionality using WebSockets.
- **Database Integration**: PostgreSQL with TypeORM for efficient data handling.
- **Push Notifications**: Firebase Cloud Messaging (FCM) for real-time alerts.
- **RESTful API**: Well-structured endpoints for user and chat management.
- **API Documentation**: Swagger UI for interactive API exploration and testing.

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL (v12 or later)
- Firebase Project (with service account credentials)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nestjs-chat-application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the project root with the following content:
   ```
   # Server Configuration
   PORT=3000

   # PostgreSQL Configuration
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=citizix_user
   DATABASE_PASSWORD=S3cret
   DATABASE_NAME=chat_api

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRATION=60m

   # Firebase Configuration
   FIREBASE_SERVICE_ACCOUNT=./firebase.json
   ```

4. **Firebase Setup**
   - Download your Firebase service account JSON file.
   - Rename it to `firebase.json` and place it in the project root.

## Running the Application

1. Ensure PostgreSQL is running (or use Docker).
2. Start the application:
   ```bash
   npm run start:dev
   ```
3. The API will be available at `http://localhost:3000`.
4. Access the Swagger API documentation at `http://localhost:3000/api#/`.

## API Documentation

The application includes Swagger UI for easy API exploration and testing. To access the interactive API documentation:

1. Start the application as described above.
2. Open a web browser and navigate to `http://localhost:3000/api#/`.
3. You'll see a list of all available endpoints, their required parameters, and response schemas.
4. You can test the API directly from this interface, which is especially useful for development and debugging.

## API Endpoints

### Authentication
- `POST /auth/login`: User login
- `POST /users/register`: New user registration

### User Management
- `POST /users/add-device-token`: Add or update FCM device token for the authenticated user

### Chat
- `POST /chat/rooms`: Create a new chat room
- `GET /chat/rooms`: List user's chat rooms (paginated)
- `GET /chat/rooms/{roomId}/messages`: Get room messages (paginated)
- `GET /chat/users/{targetUserId}/messages`: Get messages with a specific user (paginated)
- `GET /chat/joined-rooms`: List rooms the user has joined
- `POST /chat/rooms/{roomId}/join`: Join a chat room
- `POST /chat/rooms/{roomId}/leave`: Leave a chat room
- `DELETE /chat/rooms/{roomId}`: Delete a chat room (owner only)

## WebSocket Integration

### Connection
Connect to the WebSocket server using:
```javascript
const ws = new WebSocket('ws://localhost:3000/ws/chat?token=<JWT_TOKEN>');
```

### Events
- `message`: Receive real-time messages

#### Message Payload Structure
```json
{
  "event": "message",
  "data": {
    "from": 123,
    "message": "Hello!",
    "createdAt": "2024-10-03T12:34:56Z",
    "room": 456
  }
}
```

## Security Considerations
- All chat endpoints are protected and require a valid JWT token.
- Implement rate limiting on sensitive endpoints to prevent abuse.
- Regularly update dependencies to patch security vulnerabilities.

## Testing
Run the test suite with:
```bash
npm run test
```

## Contributing
Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.