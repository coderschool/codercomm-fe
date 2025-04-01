# CoderComm - Social Media for Developers

CoderComm is a social media platform designed for developers to connect, share ideas, and build a professional network. This project serves as both a functional social platform and an educational resource for learning modern React development practices.

![CoderComm Screenshot](./screenshots/homepage.png)

## Features

- 👤 **User Authentication**: Secure signup, login, and protected routes
- 👥 **User Profiles**: Customizable profiles with personal information
- 📝 **Posts**: Create, view, like, and delete posts
- 💬 **Comments**: Engage in discussions through comments on posts
- 🤝 **Friend System**: Send, accept, and manage friend requests
- 📱 **Responsive Design**: Optimized for both desktop and mobile devices

## Tech Stack

### Frontend
- **React** with **Vite** for an optimized development experience
- **React Router** for client-side routing
- **Zustand** for lightweight state management
- **React Query** for data fetching and caching
- **React Hook Form** with **Yup** for form validation
- **TailwindCSS** for utility-first styling
- **ShadCN UI** for accessible and customizable components
- **Axios** for HTTP requests

### Mock Backend
- **MirageJS** for simulating a REST API without requiring a real backend

> **Note about the Mock API**: CoderComm uses MirageJS as a "black box" backend. All API endpoints are pre-configured and ready to use, allowing you to focus exclusively on frontend development. This approach mirrors real-world scenarios where frontend developers work with a pre-defined API.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/codercomm-fe.git
   cd codercomm-fe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:5173
   ```

## Tutorial

This project includes a comprehensive tutorial that walks through building the application step by step. Find the tutorial in the `docs` directory:

[View Tutorial](./docs/README.md)

## Project Structure

```
codercomm-fe/
├── docs/                 # Tutorial documentation
├── public/               # Public assets
├── src/
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature-specific components
│   │   ├── comment/      # Comment-related components
│   │   ├── friend/       # Friend system components
│   │   ├── post/         # Post-related components
│   │   └── user/         # User profile components
│   ├── hooks/            # Custom React hooks
│   ├── layouts/          # Layout components
│   ├── lib/              # Utility libraries
│   ├── mockApi/          # MirageJS configuration
│   ├── pages/            # Page components
│   ├── routes/           # Routing configuration
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Root component
│   └── main.jsx          # Entry point
└── README.md             # Project documentation
```

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues

### Default User Accounts

For testing, you can use these pre-configured accounts:

- **Email**: john.doe@example.com
  **Password**: password123

- **Email**: jane.smith@example.com
  **Password**: password123

## Contributing

We welcome contributions to CoderComm! Please feel free to submit issues or pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- This project was created as part of the React learning curriculum at [CoderSchool](https://www.coderschool.vn)
- UI design inspired by modern social media platforms
- ShadCN UI for providing high-quality accessible components