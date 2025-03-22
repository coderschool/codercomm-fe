// Sample users
export const users = [
  {
    _id: "user1",
    name: "John Doe",
    email: "john@example.com",
    avatarUrl: "https://via.placeholder.com/150?text=John",
    coverUrl: "https://via.placeholder.com/800x200?text=John+Cover",
    aboutMe: "Software developer passionate about React",
    city: "San Francisco",
    country: "USA",
    company: "Tech Inc",
    jobTitle: "Frontend Developer",
    facebookLink: "https://facebook.com",
    instagramLink: "https://instagram.com",
    linkedinLink: "https://linkedin.com",
    twitterLink: "https://twitter.com",
    createdAt: "2023-01-01T00:00:00.000Z"
  },
  {
    _id: "user2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatarUrl: "https://via.placeholder.com/150?text=Jane",
    coverUrl: "https://via.placeholder.com/800x200?text=Jane+Cover",
    aboutMe: "UX Designer with a love for clean interfaces",
    city: "Seattle",
    country: "USA",
    company: "Design Studio",
    jobTitle: "Senior UX Designer",
    facebookLink: "https://facebook.com",
    instagramLink: "https://instagram.com",
    linkedinLink: "https://linkedin.com",
    twitterLink: "https://twitter.com",
    createdAt: "2023-01-15T00:00:00.000Z"
  },
  {
    _id: "user3",
    name: "Bob Johnson",
    email: "bob@example.com",
    avatarUrl: "https://via.placeholder.com/150?text=Bob",
    coverUrl: "https://via.placeholder.com/800x200?text=Bob+Cover",
    aboutMe: "Backend developer specializing in Node.js",
    city: "Austin",
    country: "USA",
    company: "Backend Solutions",
    jobTitle: "Senior Backend Developer",
    facebookLink: "https://facebook.com",
    instagramLink: "https://instagram.com",
    linkedinLink: "https://linkedin.com",
    twitterLink: "https://twitter.com",
    createdAt: "2023-02-01T00:00:00.000Z"
  },
  {
    _id: "user4",
    name: "Alice Williams",
    email: "alice@example.com",
    avatarUrl: "https://via.placeholder.com/150?text=Alice",
    coverUrl: "https://via.placeholder.com/800x200?text=Alice+Cover",
    aboutMe: "Full-stack developer and tech enthusiast",
    city: "New York",
    country: "USA",
    company: "Tech Giants",
    jobTitle: "Full-stack Developer",
    facebookLink: "https://facebook.com",
    instagramLink: "https://instagram.com",
    linkedinLink: "https://linkedin.com",
    twitterLink: "https://twitter.com",
    createdAt: "2023-02-15T00:00:00.000Z"
  },
  {
    _id: "user5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    avatarUrl: "https://via.placeholder.com/150?text=Charlie",
    coverUrl: "https://via.placeholder.com/800x200?text=Charlie+Cover",
    aboutMe: "DevOps engineer with a passion for automation",
    city: "Chicago",
    country: "USA",
    company: "Cloud Services",
    jobTitle: "DevOps Engineer",
    facebookLink: "https://facebook.com",
    instagramLink: "https://instagram.com",
    linkedinLink: "https://linkedin.com",
    twitterLink: "https://twitter.com",
    createdAt: "2023-03-01T00:00:00.000Z"
  }
];

// Sample posts
export const posts = [
  {
    _id: "post1",
    content: "Just finished building a new React component library! Check it out!",
    image: "https://via.placeholder.com/800x400?text=React+Component+Library",
    author: {
      _id: "user1",
      name: "John Doe",
      avatarUrl: "https://via.placeholder.com/150?text=John"
    },
    createdAt: "2023-06-10T12:00:00.000Z",
    updatedAt: "2023-06-10T12:00:00.000Z"
  },
  {
    _id: "post2",
    content: "Here's my latest UI design for a mobile app. Would love your feedback!",
    image: "https://via.placeholder.com/800x400?text=UI+Design",
    author: {
      _id: "user2",
      name: "Jane Smith",
      avatarUrl: "https://via.placeholder.com/150?text=Jane"
    },
    createdAt: "2023-06-09T15:30:00.000Z",
    updatedAt: "2023-06-09T15:30:00.000Z"
  },
  {
    _id: "post3",
    content: "Just deployed a new Node.js microservice. Performance is incredible!",
    image: null,
    author: {
      _id: "user3",
      name: "Bob Johnson",
      avatarUrl: "https://via.placeholder.com/150?text=Bob"
    },
    createdAt: "2023-06-08T09:45:00.000Z",
    updatedAt: "2023-06-08T09:45:00.000Z"
  },
  {
    _id: "post4",
    content: "Completed my first machine learning project. Amazing what we can do with data!",
    image: "https://via.placeholder.com/800x400?text=Machine+Learning",
    author: {
      _id: "user4",
      name: "Alice Williams",
      avatarUrl: "https://via.placeholder.com/150?text=Alice"
    },
    createdAt: "2023-06-07T14:20:00.000Z",
    updatedAt: "2023-06-07T14:20:00.000Z"
  },
  {
    _id: "post5",
    content: "Set up a new CI/CD pipeline for our project. Deployments are now so smooth!",
    image: null,
    author: {
      _id: "user5",
      name: "Charlie Brown",
      avatarUrl: "https://via.placeholder.com/150?text=Charlie"
    },
    createdAt: "2023-06-06T10:10:00.000Z",
    updatedAt: "2023-06-06T10:10:00.000Z"
  },
  {
    _id: "post6",
    content: "Learning Zustand and React Query. Such a great replacement for Redux!",
    image: "https://via.placeholder.com/800x400?text=Zustand+and+React+Query",
    author: {
      _id: "user1",
      name: "John Doe",
      avatarUrl: "https://via.placeholder.com/150?text=John"
    },
    createdAt: "2023-06-05T16:40:00.000Z",
    updatedAt: "2023-06-05T16:40:00.000Z"
  },
  {
    _id: "post7",
    content: "Just finished a new design system for our company. Consistency at last!",
    image: "https://via.placeholder.com/800x400?text=Design+System",
    author: {
      _id: "user2",
      name: "Jane Smith",
      avatarUrl: "https://via.placeholder.com/150?text=Jane"
    },
    createdAt: "2023-06-04T11:15:00.000Z",
    updatedAt: "2023-06-04T11:15:00.000Z"
  },
  {
    _id: "post8",
    content: "Optimized our database queries and saw a 40% performance improvement!",
    image: null,
    author: {
      _id: "user3",
      name: "Bob Johnson",
      avatarUrl: "https://via.placeholder.com/150?text=Bob"
    },
    createdAt: "2023-06-03T08:30:00.000Z",
    updatedAt: "2023-06-03T08:30:00.000Z"
  }
];

// Sample comments
export const comments = [
  {
    _id: "comment1",
    content: "This looks great! Can you share more about the implementation?",
    post: "post1",
    author: {
      _id: "user2",
      name: "Jane Smith",
      avatarUrl: "https://via.placeholder.com/150?text=Jane"
    },
    createdAt: "2023-06-10T12:30:00.000Z",
    updatedAt: "2023-06-10T12:30:00.000Z"
  },
  {
    _id: "comment2",
    content: "Very impressive work!",
    post: "post1",
    author: {
      _id: "user3",
      name: "Bob Johnson",
      avatarUrl: "https://via.placeholder.com/150?text=Bob"
    },
    createdAt: "2023-06-10T13:00:00.000Z",
    updatedAt: "2023-06-10T13:00:00.000Z"
  },
  {
    _id: "comment3",
    content: "I love the color scheme! Very modern.",
    post: "post2",
    author: {
      _id: "user1",
      name: "John Doe",
      avatarUrl: "https://via.placeholder.com/150?text=John"
    },
    createdAt: "2023-06-09T16:00:00.000Z",
    updatedAt: "2023-06-09T16:00:00.000Z"
  },
  {
    _id: "comment4",
    content: "Maybe consider making the buttons more prominent?",
    post: "post2",
    author: {
      _id: "user4",
      name: "Alice Williams",
      avatarUrl: "https://via.placeholder.com/150?text=Alice"
    },
    createdAt: "2023-06-09T16:30:00.000Z",
    updatedAt: "2023-06-09T16:30:00.000Z"
  },
  {
    _id: "comment5",
    content: "What tech stack are you using for this?",
    post: "post3",
    author: {
      _id: "user5",
      name: "Charlie Brown",
      avatarUrl: "https://via.placeholder.com/150?text=Charlie"
    },
    createdAt: "2023-06-08T10:15:00.000Z",
    updatedAt: "2023-06-08T10:15:00.000Z"
  },
  {
    _id: "comment6",
    content: "Very cool! Would love to learn more about your ML model.",
    post: "post4",
    author: {
      _id: "user1",
      name: "John Doe",
      avatarUrl: "https://via.placeholder.com/150?text=John"
    },
    createdAt: "2023-06-07T15:00:00.000Z",
    updatedAt: "2023-06-07T15:00:00.000Z"
  },
  {
    _id: "comment7",
    content: "Which CI/CD tools are you using?",
    post: "post5",
    author: {
      _id: "user3",
      name: "Bob Johnson",
      avatarUrl: "https://via.placeholder.com/150?text=Bob"
    },
    createdAt: "2023-06-06T11:00:00.000Z",
    updatedAt: "2023-06-06T11:00:00.000Z"
  },
  {
    _id: "comment8",
    content: "I switched to these too! The developer experience is so much better.",
    post: "post6",
    author: {
      _id: "user4",
      name: "Alice Williams",
      avatarUrl: "https://via.placeholder.com/150?text=Alice"
    },
    createdAt: "2023-06-05T17:10:00.000Z",
    updatedAt: "2023-06-05T17:10:00.000Z"
  }
];

// Sample reactions (likes/dislikes)
export const reactions = [
  {
    _id: "reaction1",
    targetType: "Post",
    targetId: "post1",
    emoji: "like",
    author: {
      _id: "user2",
      name: "Jane Smith",
      avatarUrl: "https://via.placeholder.com/150?text=Jane"
    },
    createdAt: "2023-06-10T12:35:00.000Z"
  },
  {
    _id: "reaction2",
    targetType: "Post",
    targetId: "post1",
    emoji: "like",
    author: {
      _id: "user3",
      name: "Bob Johnson",
      avatarUrl: "https://via.placeholder.com/150?text=Bob"
    },
    createdAt: "2023-06-10T13:05:00.000Z"
  },
  {
    _id: "reaction3",
    targetType: "Post",
    targetId: "post2",
    emoji: "like",
    author: {
      _id: "user1",
      name: "John Doe",
      avatarUrl: "https://via.placeholder.com/150?text=John"
    },
    createdAt: "2023-06-09T16:05:00.000Z"
  },
  {
    _id: "reaction4",
    targetType: "Post",
    targetId: "post2",
    emoji: "like",
    author: {
      _id: "user4",
      name: "Alice Williams",
      avatarUrl: "https://via.placeholder.com/150?text=Alice"
    },
    createdAt: "2023-06-09T16:35:00.000Z"
  },
  {
    _id: "reaction5",
    targetType: "Post",
    targetId: "post3",
    emoji: "like",
    author: {
      _id: "user5",
      name: "Charlie Brown",
      avatarUrl: "https://via.placeholder.com/150?text=Charlie"
    },
    createdAt: "2023-06-08T10:20:00.000Z"
  },
  {
    _id: "reaction6",
    targetType: "Comment",
    targetId: "comment1",
    emoji: "like",
    author: {
      _id: "user1",
      name: "John Doe",
      avatarUrl: "https://via.placeholder.com/150?text=John"
    },
    createdAt: "2023-06-10T12:40:00.000Z"
  },
  {
    _id: "reaction7",
    targetType: "Comment",
    targetId: "comment3",
    emoji: "like",
    author: {
      _id: "user2",
      name: "Jane Smith",
      avatarUrl: "https://via.placeholder.com/150?text=Jane"
    },
    createdAt: "2023-06-09T16:10:00.000Z"
  },
  {
    _id: "reaction8",
    targetType: "Comment",
    targetId: "comment5",
    emoji: "like",
    author: {
      _id: "user3",
      name: "Bob Johnson",
      avatarUrl: "https://via.placeholder.com/150?text=Bob"
    },
    createdAt: "2023-06-08T10:25:00.000Z"
  }
];

// Sample friendships (relationships between users)
export const friendships = [
  {
    _id: "friendship1",
    from: "user1", // John
    to: "user2",   // Jane
    status: "accepted",
    createdAt: "2023-05-01T00:00:00.000Z",
    updatedAt: "2023-05-01T01:00:00.000Z"
  },
  {
    _id: "friendship2",
    from: "user1", // John
    to: "user3",   // Bob
    status: "accepted",
    createdAt: "2023-05-02T00:00:00.000Z",
    updatedAt: "2023-05-02T01:00:00.000Z"
  },
  {
    _id: "friendship3",
    from: "user2", // Jane
    to: "user4",   // Alice
    status: "accepted",
    createdAt: "2023-05-03T00:00:00.000Z",
    updatedAt: "2023-05-03T01:00:00.000Z"
  },
  {
    _id: "friendship4",
    from: "user3", // Bob
    to: "user5",   // Charlie
    status: "accepted",
    createdAt: "2023-05-04T00:00:00.000Z",
    updatedAt: "2023-05-04T01:00:00.000Z"
  },
  {
    _id: "friendship5",
    from: "user4", // Alice
    to: "user5",   // Charlie
    status: "accepted",
    createdAt: "2023-05-05T00:00:00.000Z",
    updatedAt: "2023-05-05T01:00:00.000Z"
  },
  {
    _id: "friendship6",
    from: "user2", // Jane
    to: "user3",   // Bob
    status: "accepted",
    createdAt: "2023-05-06T00:00:00.000Z",
    updatedAt: "2023-05-06T01:00:00.000Z"
  },
  {
    _id: "friendship7",
    from: "user1", // John
    to: "user5",   // Charlie
    status: "pending",
    createdAt: "2023-05-07T00:00:00.000Z",
    updatedAt: "2023-05-07T00:00:00.000Z"
  },
  {
    _id: "friendship8",
    from: "user4", // Alice
    to: "user1",   // John
    status: "pending",
    createdAt: "2023-05-08T00:00:00.000Z",
    updatedAt: "2023-05-08T00:00:00.000Z"
  }
];