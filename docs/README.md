# CoderComm Frontend Tutorial

Welcome to the CoderComm Frontend Tutorial! This tutorial series guides you through building a complete social media application using React, with an emphasis on best practices and modern development techniques.

## Target Audience

This tutorial is designed for developers with:
- Basic knowledge of React (1-2 months experience)
- Understanding of JavaScript fundamentals
- Familiarity with web development concepts

## Tutorial Steps

Follow these steps in order to build the complete CoderComm application:

1. [**Project Setup and Configuration**](./steps/01-project-setup.md)  
   Initialize a React project with Vite, configure TailwindCSS and ShadCN UI, and set up MirageJS for API mocking.

2. [**Authentication System**](./steps/02-authentication-system.md)  
   Create login and registration pages, implement JWT-based authentication, and set up protected routes.

3. [**Main Layout and Basic Header**](./steps/03-main-layout-navigation.md)  
   Design a responsive layout with a sidebar navigation system and a mobile-friendly header.

4. [**User Profile System**](./steps/04-user-profile-system.md)  
   Develop user profiles with editing functionality and display user-specific content.

5. [**Post Creation and Display**](./steps/05-post-creation-feed.md)  
   Build a post creation form, display posts within profile contexts, and add post interactions.

6. [**Comments System**](./steps/06-comments-system.md)  
   Add comment creation and display, implement comment interactions, and create expandable comment sections.

7. [**Friend System (Tab Integration)**](./steps/07-friend-system.md)  
   Implement friend list, requests, and user search within tabs on the main home page.

8. [**Summary and Next Steps**](./steps/08-summary-and-next-steps.md)  
   Review what you've built and explore ideas for enhancing the application.

## Features

By the end of this tutorial, your application will have:

- **User Authentication**: Registration, login, and protected routes
- **User Profiles**: View profiles (own via tab, others via page) and edit own profile
- **Posts and Display**: Create posts and view posts within user profile contexts (no separate global feed)
- **Comments**: Add comments to posts and interact with them
- **Friend System**: Manage friends and requests via tabs on the home page
- **Responsive Design**: Basic responsiveness handled by layout and components

## Technologies Used

- **React**: JavaScript library for building user interfaces
- **Vite**: Next generation frontend tooling
- **React Router**: For navigation and routing
- **Zustand**: Lightweight state management
- **React Query**: For data fetching and caching
- **React Hook Form**: Form handling and validation
- **TailwindCSS**: Utility-first CSS framework
- **ShadCN UI**: Accessible and customizable component library
- **MirageJS**: API mocking library (used as a black box to simulate a backend)

> **Note about the Mock API**: This tutorial treats the mock API as a black box - it's set up once at the beginning with all necessary endpoints, and you won't need to modify it in subsequent steps. This approach allows you to focus purely on frontend development, similar to how you'd work with a pre-defined API in a real-world project.

## Getting Started

To start the tutorial:

1. Begin with [Step 1: Project Setup](./steps/01-project-setup.md)
2. Follow each step in order, completing the code examples and explanations
3. Reference the summary at the end of each step to ensure you've understood key concepts

## Need Help?

If you encounter any issues while following the tutorial:

- Re-read the relevant sections carefully
- Check your code against the examples provided
- Look for common errors like typos, missing imports, or incorrect paths
- Try searching online for specific error messages

## Extending the Application

After completing the tutorial, consider implementing some of the enhancement ideas in the [Summary and Next Steps](./steps/08-summary-and-next-steps.md) section to further develop your skills.

Happy coding! 