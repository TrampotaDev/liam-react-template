const baseUrl = 'https://jsonplaceholder.typicode.com';

const resources = [
  {
    name: 'todos',
    url: `${baseUrl}/todos`,
  },
  {
    name: 'users',
    url: `${baseUrl}/users`
  },
  {
    name: 'userPosts',
    url: `${baseUrl}/posts`,
  },
  {
    name: 'selectedTodoDetail',
    url: `${baseUrl}/todos/:id`,
  },
  {
    name: 'selectedUser',
    default: 1
  },
  { 
    name: 'todo',
    url: `${baseUrl}/todo`,
  }
];

export default resources;