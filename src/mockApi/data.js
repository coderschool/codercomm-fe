// Sample users with relative creation dates
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
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year ago
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
    createdAt: new Date(Date.now() - 340 * 24 * 60 * 60 * 1000).toISOString() // 340 days ago
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
    createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString() // 300 days ago
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
    createdAt: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toISOString() // 270 days ago
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
    createdAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString() // 240 days ago
  }
];

// Sample posts with relative creation dates
// Posts that user1 can see (from user1 or his friends)
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
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "post2",
    content: "Created a beautiful UI for a bánh mì ordering app. Swipe for the design! 🥖",
    image: "https://picsum.photos/id/292/800/400",
    author: {
      _id: "user2", // Friend of user1
      name: "Tran Thi CSS",
      avatarUrl: "https://i.pravatar.cc/150?u=tran"
    },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "post3",
    content: "Just deployed my Node.js API to the cloud. It's so fast, it delivered my phở before I ordered it! 🍜",
    image: "https://picsum.photos/id/42/800/400",
    author: {
      _id: "user3", // Friend of user1
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "post4",
    content: "Learning React Hooks is like learning to use đũa (chopsticks) - awkward at first, but then you can't imagine coding without them! 🥢",
    image: "https://picsum.photos/id/24/800/400",
    author: {
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "post5",
    content: "Designed a mobile-responsive website that looks good on everything from an iPhone 13 Pro Max to my grandmother's Nokia! 📱",
    image: "https://picsum.photos/id/28/800/400",
    author: {
      _id: "user2", // Friend of user1
      name: "Tran Thi CSS",
      avatarUrl: "https://i.pravatar.cc/150?u=tran"
    },
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
    updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "post6",
    content: "Optimized our database queries and now the app loads faster than you can say 'một, hai, ba, yo!' ⚡",
    image: "https://picsum.photos/id/4/800/400",
    author: {
      _id: "user3", // Friend of user1
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Sample comments with relative creation dates
// Only comments on posts that user1 can see
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
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 3 days ago + 2 hours
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
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
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 3 days ago + 4 hours
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString()
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
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 4 days ago + 3 hours
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "comment4",
    content: "useEffect(() => { setSoup('delicious') }, [hunger]); Best hook ever!",
    post: "post4",
    author: {
      _id: "user3",
      name: "Le Thanh Backend",
      avatarUrl: "https://i.pravatar.cc/150?u=lethanh"
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(), // 14 days ago + 5 hours
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "comment5",
    content: "Are you using Tailwind for this? The responsive design is on point! 👌",
    post: "post5",
    author: {
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(), // 21 days ago + 6 hours
    updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "comment6",
    content: "Share your database optimization tricks! I need to speed up my queries too.",
    post: "post6",
    author: {
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 30 days ago + 4 hours
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString()
  }
];

// Sample reactions with relative creation dates
// Only reactions to posts or comments that user1 can see
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
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString() // 3 days ago + 1 hour
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
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString() // 3 days ago + 3 hours
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
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString() // 4 days ago + 2 hours
  },
  {
    _id: "reaction4",
    targetType: "Comment",
    targetId: "comment1",
    emoji: "like",
    author: {
      _id: "user1",
      name: "Nguyen Van React",
      avatarUrl: "https://i.pravatar.cc/150?u=nguyen"
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000).toISOString() // 3 days ago + 2.5 hours
  },
  {
    _id: "reaction5",
    targetType: "Comment",
    targetId: "comment3",
    emoji: "like",
    author: {
      _id: "user2",
      name: "Tran Thi CSS",
      avatarUrl: "https://i.pravatar.cc/150?u=tran"
    },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3.5 * 60 * 60 * 1000).toISOString() // 4 days ago + 3.5 hours
  }
];

// Sample friendships with relative creation dates
// Focus on friendships involving user1
export const friendships = [
  {
    _id: "friendship1",
    from: "user1", // Nguyen
    to: "user2",   // Tran
    status: "accepted",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString() // 90 days ago + 1 hour
  },
  {
    _id: "friendship2",
    from: "user1", // Nguyen
    to: "user3",   // Le
    status: "accepted",
    createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(), // 85 days ago
    updatedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString() // 85 days ago + 1 hour
  },
  {
    _id: "friendship3",
    from: "user1", // Nguyen 
    to: "user5",   // Hoang
    status: "pending",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "friendship4",
    from: "user4", // Pham
    to: "user1",   // Nguyen
    status: "pending",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "friendship5",
    from: "user3", // Le
    to: "user1",   // Nguyen
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "friendship6",
    from: "user2", // Tran
    to: "user1",   // Nguyen 
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "friendship7",
    from: "user1", // Nguyen
    to: "user4",   // Pham
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "friendship8",
    from: "user5", // Hoang
    to: "user1",   // Nguyen
    status: "pending",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];