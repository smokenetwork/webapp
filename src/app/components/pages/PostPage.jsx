import Post from './Post';

module.exports = {
  path: '/(:category/)@:username/:slug',
  component: Post
};
