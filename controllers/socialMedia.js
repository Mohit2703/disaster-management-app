import { io } from '../app.js';

const MOCK_POSTS = [
  { user: 'citizen1', post: '#flood Need food and water in NYC' },
  { user: 'volunteer2', post: 'We are sending help. #floodrelief' },
  { user: 'citizen2', post: 'URGENT: need medical aid at Brooklyn' },
  { user: 'responder1', post: 'Rescue teams deployed in Lower Manhattan' },
  { user: 'citizen3', post: 'SOS! Trapped in apartment basement' },
];

const PRIORITY_KEYWORDS = ['urgent', 'sos'];

function isPriority(post) {
  return PRIORITY_KEYWORDS.some(keyword =>
    post.post.toLowerCase().includes(keyword)
  );
}

const getMockSocialMediaPosts = async (req, res) => {
  const { id } = req.params;

  // Simulate filtering relevant posts for this disaster
  const filtered = MOCK_POSTS.map(post => ({
    ...post,
    priority: isPriority(post),
  }));

  // Emit the posts to the specific disaster room
  io.to(`disaster_${id}`).emit('social_media_posts', {
    disasterId: id,
    posts: filtered,
  });

  return res.json({
    disasterId: id,
    results: filtered,
  });
};

export default getMockSocialMediaPosts;