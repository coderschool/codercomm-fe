// Sample users
export const users = [
  {
    _id: "user1",
    username: "learnreact",
    name: "Nguyen Van React",
    email: "reactlover@coderschool.vn",
    avatarUrl: "https://i.pravatar.cc/150?u=nguyen",
    coverUrl: "https://picsum.photos/id/1018/800/200",
    aboutMe: "React developer by day, phở connoisseur by night",
    city: "Ho Chi Minh City",
    country: "Vietnam",
    company: "CoderSchool",
    jobTitle: "Frontend Developer",
    facebookLink: "https://facebook.com",
    instagramLink: "https://instagram.com",
    linkedinLink: "https://linkedin.com",
    twitterLink: "https://twitter.com",
    createdAt: "2023-01-01T00:00:00.000Z"
  },
  {
    _id: "user2",
    username: "cssqueen",
    name: "Tran Thi CSS",
    email: "styling@coderschool.vn",
    avatarUrl: "https://i.pravatar.cc/150?u=tran",
    coverUrl: "https://picsum.photos/id/1019/800/200",
    aboutMe: "Making divs pretty since 2015. Can center anything vertically.",
    city: "Hanoi",
    country: "Vietnam",
    company: "Design Divas",
    jobTitle: "UI/UX Designer",
    facebookLink: "https://facebook.com",
    instagramLink: "https://instagram.com",
    linkedinLink: "https://linkedin.com",
    twitterLink: "https://twitter.com",
    createdAt: "2023-01-15T00:00:00.000Z"
  },
  {
    _id: "user3",
    username: "nodemaster",
    name: "Le Thanh Backend",
    email: "serverside@coderschool.vn",
    avatarUrl: "https://i.pravatar.cc/150?u=lethanh",
    coverUrl: "https://picsum.photos/id/1025/800/200",
    aboutMe: "I make APIs so fast even my coffee can't keep up",
    city: "Da Nang",
    country: "Vietnam",
    company: "Server Solutions",
    jobTitle: "Backend Developer",
    facebookLink: "https://facebook.com",
    instagramLink: "https://instagram.com",
    linkedinLink: "https://linkedin.com",
    twitterLink: "https://twitter.com",
    createdAt: "2023-02-01T00:00:00.000Z"
  },
  {
    _id: "user4",
    username: "fullstackdev",
    name: "Pham Minh Code",
    email: "fullstack@coderschool.vn",
    avatarUrl: "https://i.pravatar.cc/150?u=phamminh",
    coverUrl: "https://picsum.photos/id/1031/800/200",
    aboutMe: "I do frontend, backend, and can fix the office printer",
    city: "Hue",
    country: "Vietnam",
    company: "Viet Tech",
    jobTitle: "Full-stack Developer",
    facebookLink: "https://facebook.com",
    instagramLink: "https://instagram.com",
    linkedinLink: "https://linkedin.com",
    twitterLink: "https://twitter.com",
    createdAt: "2023-02-15T00:00:00.000Z"
  },
  {
    _id: "user5",
    username: "devopswhiz",
    name: "Hoang The Cloud",
    email: "cloudguru@coderschool.vn",
    avatarUrl: "https://i.pravatar.cc/150?u=hoangcloud",
    coverUrl: "https://picsum.photos/id/1039/800/200",
    aboutMe: "If it works on your machine, I'll make it work in production",
    city: "Can Tho",
    country: "Vietnam",
    company: "Cloud Crusaders",
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
    content: "Just built my first React component! Took me 5 cups of cà phê sữa đá but it was worth it! 🚀",
    image: "https://picsum.photos/id/237/800/400",
    author: {
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: "2023-06-10T12:00:00.000Z",
    updatedAt: "2023-06-10T12:00:00.000Z"
  },
  {
    _id: "post2",
    content: "Created a beautiful UI for a bánh mì ordering app. Swipe for the design! 🥖",
    image: "https://picsum.photos/id/292/800/400",
    author: {
      _id: "user2",
      name: "Tran Thi CSS",
      avatarUrl: "https://i.pravatar.cc/150?u=tran"
    },
    createdAt: "2023-06-09T15:30:00.000Z",
    updatedAt: "2023-06-09T15:30:00.000Z"
  },
  {
    _id: "post3",
    content: "Just deployed my Node.js API to the cloud. It's so fast, it delivered my phở before I ordered it! 🍜",
    image: "https://picsum.photos/id/42/800/400",
    author: {
      _id: "user3",
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
    },
    createdAt: "2023-06-08T09:45:00.000Z",
    updatedAt: "2023-06-08T09:45:00.000Z"
  },
  {
    _id: "post4",
    content: "Made an AI that can predict how spicy you want your bún bò Huế. Technology is amazing! 🌶️",
    image: "https://picsum.photos/id/91/800/400",
    author: {
      _id: "user4",
      name: "Pham Minh Code",
      avatarUrl: "https://i.pravatar.cc/150?u=phamminh"
    },
    createdAt: "2023-06-07T14:20:00.000Z",
    updatedAt: "2023-06-07T14:20:00.000Z"
  },
  {
    _id: "post5",
    content: "Set up CI/CD for our project. Now our code deploys faster than a Grab driver during rush hour! 🏍️",
    image: "https://picsum.photos/id/180/800/400",
    author: {
      _id: "user5",
      name: "Hoang The Cloud",
      avatarUrl: "https://i.pravatar.cc/150?u=hoangcloud"
    },
    createdAt: "2023-06-06T10:10:00.000Z",
    updatedAt: "2023-06-06T10:10:00.000Z"
  },
  {
    _id: "post6",
    content: "Learning React Hooks is like learning to use đũa (chopsticks) - awkward at first, but then you can't imagine coding without them! 🥢",
    image: "https://picsum.photos/id/24/800/400",
    author: {
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: "2023-06-05T16:40:00.000Z",
    updatedAt: "2023-06-05T16:40:00.000Z"
  },
  {
    _id: "post7",
    content: "Designed a mobile-responsive website that looks good on everything from an iPhone 13 Pro Max to my grandmother's Nokia! 📱",
    image: "https://picsum.photos/id/28/800/400",
    author: {
      _id: "user2",
      name: "Tran Thi CSS",
      avatarUrl: "https://i.pravatar.cc/150?u=tran"
    },
    createdAt: "2023-06-04T11:15:00.000Z",
    updatedAt: "2023-06-04T11:15:00.000Z"
  },
  {
    _id: "post8",
    content: "Optimized our database queries and now the app loads faster than you can say 'một, hai, ba, yo!' ⚡",
    image: "https://picsum.photos/id/4/800/400",
    author: {
      _id: "user3",
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
    },
    createdAt: "2023-06-03T08:30:00.000Z",
    updatedAt: "2023-06-03T08:30:00.000Z"
  }
];

// Sample comments
export const comments = [
  {
    _id: "comment1",
    content: "Siêu đỉnh! Can you share your code on GitHub?",
    post: "post1",
    author: {
      _id: "user2",
      name: "Tran Thi CSS",
      avatarUrl: "https://i.pravatar.cc/150?u=tran"
    },
    createdAt: "2023-06-10T12:30:00.000Z",
    updatedAt: "2023-06-10T12:30:00.000Z"
  },
  {
    _id: "comment2",
    content: "Quá đẹp! Did you use Redux for state management?",
    post: "post1",
    author: {
      _id: "user3",
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
    },
    createdAt: "2023-06-10T13:00:00.000Z",
    updatedAt: "2023-06-10T13:00:00.000Z"
  },
  {
    _id: "comment3",
    content: "The UI is cleaner than my browser history after a job interview! 😂",
    post: "post2",
    author: {
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: "2023-06-09T16:00:00.000Z",
    updatedAt: "2023-06-09T16:00:00.000Z"
  },
  {
    _id: "comment4",
    content: "Hay quá! But maybe make the checkout button bigger for hungry users?",
    post: "post2",
    author: {
      _id: "user4",
      name: "Pham Minh Code",
      avatarUrl: "https://i.pravatar.cc/150?u=phamminh"
    },
    createdAt: "2023-06-09T16:30:00.000Z",
    updatedAt: "2023-06-09T16:30:00.000Z"
  },
  {
    _id: "comment5",
    content: "Which hosting service are you using? My API is slower than Saigon traffic! 🛵",
    post: "post3",
    author: {
      _id: "user5",
      name: "Hoang The Cloud",
      avatarUrl: "https://i.pravatar.cc/150?u=hoangcloud"
    },
    createdAt: "2023-06-08T10:15:00.000Z",
    updatedAt: "2023-06-08T10:15:00.000Z"
  },
  {
    _id: "comment6",
    content: "Can your AI tell if I want fish sauce on the side? That's the real challenge! 🐟",
    post: "post4",
    author: {
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: "2023-06-07T15:00:00.000Z",
    updatedAt: "2023-06-07T15:00:00.000Z"
  },
  {
    _id: "comment7",
    content: "Share your CI/CD pipeline details! My deploys are breaking faster than my diet resolutions 😅",
    post: "post5",
    author: {
      _id: "user3",
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
    },
    createdAt: "2023-06-06T11:00:00.000Z",
    updatedAt: "2023-06-06T11:00:00.000Z"
  },
  {
    _id: "comment8",
    content: "useEffect(() => { setSoup('delicious') }, [hunger]); Best hook ever!",
    post: "post6",
    author: {
      _id: "user4",
      name: "Pham Minh Code",
      avatarUrl: "https://i.pravatar.cc/150?u=phamminh"
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
      name: "Tran Thi CSS",
      avatarUrl: "https://i.pravatar.cc/150?u=tran"
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
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
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
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
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
      name: "Pham Minh Code",
      avatarUrl: "https://i.pravatar.cc/150?u=phamminh"
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
      name: "Hoang The Cloud",
      avatarUrl: "https://i.pravatar.cc/150?u=hoangcloud"
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
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
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
      name: "Tran Thi CSS",
      avatarUrl: "https://i.pravatar.cc/150?u=tran"
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
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
    },
    createdAt: "2023-06-08T10:25:00.000Z"
  }
];

// Sample friendships (relationships between users)
export const friendships = [
  {
    _id: "friendship1",
    from: "user1", // Nguyen
    to: "user2",   // Tran
    status: "accepted",
    createdAt: "2023-05-01T00:00:00.000Z",
    updatedAt: "2023-05-01T01:00:00.000Z"
  },
  {
    _id: "friendship2",
    from: "user1", // Nguyen
    to: "user3",   // Le
    status: "accepted",
    createdAt: "2023-05-02T00:00:00.000Z",
    updatedAt: "2023-05-02T01:00:00.000Z"
  },
  {
    _id: "friendship3",
    from: "user2", // Tran
    to: "user4",   // Pham
    status: "accepted",
    createdAt: "2023-05-03T00:00:00.000Z",
    updatedAt: "2023-05-03T01:00:00.000Z"
  },
  {
    _id: "friendship4",
    from: "user3", // Le
    to: "user5",   // Hoang
    status: "accepted",
    createdAt: "2023-05-04T00:00:00.000Z",
    updatedAt: "2023-05-04T01:00:00.000Z"
  },
  {
    _id: "friendship5",
    from: "user4", // Pham
    to: "user5",   // Hoang
    status: "accepted",
    createdAt: "2023-05-05T00:00:00.000Z",
    updatedAt: "2023-05-05T01:00:00.000Z"
  },
  {
    _id: "friendship6",
    from: "user2", // Tran
    to: "user3",   // Le
    status: "accepted",
    createdAt: "2023-05-06T00:00:00.000Z",
    updatedAt: "2023-05-06T01:00:00.000Z"
  },
  {
    _id: "friendship7",
    from: "user1", // Nguyen
    to: "user5",   // Hoang
    status: "pending",
    createdAt: "2023-05-07T00:00:00.000Z",
    updatedAt: "2023-05-07T00:00:00.000Z"
  },
  {
    _id: "friendship8",
    from: "user4", // Pham
    to: "user1",   // Nguyen
    status: "pending",
    createdAt: "2023-05-08T00:00:00.000Z",
    updatedAt: "2023-05-08T00:00:00.000Z"
  }
];