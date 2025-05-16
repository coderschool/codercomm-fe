import { v4 as uuidv4 } from "uuid";

const daysAgo = (days) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (hours) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const minutesAgo = (minutes) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

export const USER_IDS = {
  user1: uuidv4(),
  user2: uuidv4(),
  user3: uuidv4(),
  user4: uuidv4(),
  user5: uuidv4(),
};

export const POST_IDS = {
  post1: uuidv4(),
  post2: uuidv4(),
  post3: uuidv4(),
  post4: uuidv4(),
  post5: uuidv4(),
  post6: uuidv4(),
};

export const COMMENT_IDS = {
  comment1: uuidv4(),
  comment2: uuidv4(),
  comment3: uuidv4(),
  comment4: uuidv4(),
  comment5: uuidv4(),
  comment6: uuidv4(),
};

export const users = [
  {
    _id: USER_IDS.user1,
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
    createdAt: daysAgo(365),
    password: "password",
  },
  {
    _id: USER_IDS.user2,
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
    createdAt: daysAgo(340),
    password: "password",
  },
  {
    _id: USER_IDS.user3,
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
    createdAt: daysAgo(300),
    password: "password",
  },
  {
    _id: USER_IDS.user4,
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
    createdAt: daysAgo(270),
    password: "password",
  },
  {
    _id: USER_IDS.user5,
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
    createdAt: daysAgo(240),
    password: "password",
  },
];

export const posts = [
  {
    _id: POST_IDS.post1,
    content:
      "Just built my first React component! Took me 5 cups of cà phê sữa đá but it was worth it! 🚀",
    image: "https://picsum.photos/id/237/800/400",
    author: USER_IDS.user1,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    _id: POST_IDS.post2,
    content:
      "Created a beautiful UI for a bánh mì ordering app. Swipe for the design! 🥖",
    image: "https://picsum.photos/id/292/800/400",
    author: USER_IDS.user2,
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
  {
    _id: POST_IDS.post3,
    content:
      "Just deployed my Node.js API to the cloud. It's so fast, it delivered my phở before I ordered it! 🍜",
    image: "https://picsum.photos/id/42/800/400",
    author: USER_IDS.user3,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },
  {
    _id: POST_IDS.post4,
    content:
      "Learning React Hooks is like learning to use đũa (chopsticks) - awkward at first, but then you can\\'t imagine coding without them! 🥢",
    image: "https://picsum.photos/id/24/800/400",
    author: USER_IDS.user1,
    createdAt: daysAgo(14),
    updatedAt: daysAgo(14),
  },
  {
    _id: POST_IDS.post5,
    content:
      "Designed a mobile-responsive website that looks good on everything from an iPhone 13 Pro Max to my grandmother's Nokia! 📱",
    image: "https://picsum.photos/id/28/800/400",
    author: USER_IDS.user2,
    createdAt: daysAgo(21),
    updatedAt: daysAgo(21),
  },
  {
    _id: POST_IDS.post6,
    content:
      "Optimized our database queries and now the app loads faster than you can say 'một, hai, ba, yo!' ⚡",
    image: "https://picsum.photos/id/4/800/400",
    author: USER_IDS.user3,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(30),
  },
];

export const comments = [
  {
    _id: COMMENT_IDS.comment1,
    content: "Siêu đỉnh! Can you share your code on GitHub?",
    post: POST_IDS.post1,
    author: USER_IDS.user2,
    createdAt: hoursAgo(70),
    updatedAt: hoursAgo(70),
    reactions: [],
  },
  {
    _id: COMMENT_IDS.comment2,
    content: "Quá đẹp! Did you use Zustand for state management?",
    post: POST_IDS.post1,
    author: USER_IDS.user3,
    createdAt: hoursAgo(68),
    updatedAt: hoursAgo(68),
    reactions: [],
  },
  {
    _id: COMMENT_IDS.comment3,
    content:
      "The UI is cleaner than my browser history after a job interview! 😂",
    post: POST_IDS.post2,
    author: USER_IDS.user1,
    createdAt: hoursAgo(93),
    updatedAt: hoursAgo(93),
    reactions: [],
  },
  {
    _id: COMMENT_IDS.comment4,
    content:
      "useEffect(() => { setPho('delicious') }, [hunger]); Best hook ever!",
    post: POST_IDS.post4,
    author: USER_IDS.user3,
    createdAt: hoursAgo(331),
    updatedAt: hoursAgo(331),
    reactions: [],
  },
  {
    _id: COMMENT_IDS.comment5,
    content:
      "Are you using Tailwind for this? The responsive design is on point! 👌",
    post: POST_IDS.post5,
    author: USER_IDS.user1,
    createdAt: hoursAgo(500),
    updatedAt: hoursAgo(500),
    reactions: [],
  },
  {
    _id: COMMENT_IDS.comment6,
    content:
      "Share your database optimization tricks! I need to speed up my queries too.",
    post: POST_IDS.post6,
    author: USER_IDS.user1,
    createdAt: hoursAgo(716),
    updatedAt: hoursAgo(716),
    reactions: [],
  },
];

export const reactions = [
  {
    _id: uuidv4(),
    targetType: "POST",
    targetId: POST_IDS.post1,
    emoji: "LIKE",
    author: USER_IDS.user2,
    createdAt: hoursAgo(71),
  },
  {
    _id: uuidv4(),
    targetType: "POST",
    targetId: POST_IDS.post1,
    emoji: "LIKE",
    author: USER_IDS.user3,
    createdAt: hoursAgo(69),
  },
  {
    _id: uuidv4(),
    targetType: "POST",
    targetId: POST_IDS.post2,
    emoji: "LIKE",
    author: USER_IDS.user1,
    createdAt: hoursAgo(94),
  },
  {
    _id: uuidv4(),
    targetType: "COMMENT",
    targetId: COMMENT_IDS.comment1,
    emoji: "LIKE",
    author: USER_IDS.user1,
    createdAt: hoursAgo(69.5),
  },
  {
    _id: uuidv4(),
    targetType: "COMMENT",
    targetId: COMMENT_IDS.comment3,
    emoji: "LIKE",
    author: USER_IDS.user2,
    createdAt: hoursAgo(92.5),
  },
];

export const friendships = [
  {
    _id: uuidv4(),
    from: USER_IDS.user1,
    to: USER_IDS.user2,
    status: "ACCEPTED",
    createdAt: daysAgo(90),
    updatedAt: daysAgo(89),
  },
  {
    _id: uuidv4(),
    from: USER_IDS.user3,
    to: USER_IDS.user1,
    status: "ACCEPTED",
    createdAt: daysAgo(85),
    updatedAt: daysAgo(84),
  },
  {
    _id: uuidv4(),
    from: USER_IDS.user1,
    to: USER_IDS.user5,
    status: "PENDING",
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  {
    _id: uuidv4(),
    from: USER_IDS.user4,
    to: USER_IDS.user1,
    status: "PENDING",
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
  },
  {
    _id: uuidv4(),
    from: USER_IDS.user3,
    to: USER_IDS.user1,
    status: "PENDING",
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
  },
  {
    _id: uuidv4(),
    from: USER_IDS.user2,
    to: USER_IDS.user1,
    status: "PENDING",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    _id: uuidv4(),
    from: USER_IDS.user1,
    to: USER_IDS.user4,
    status: "PENDING",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    _id: uuidv4(),
    from: USER_IDS.user5,
    to: USER_IDS.user1,
    status: "PENDING",
    createdAt: minutesAgo(1),
    updatedAt: minutesAgo(1),
  },
];
