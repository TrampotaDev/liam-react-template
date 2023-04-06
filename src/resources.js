const baseUrl = 'https://jsonplaceholder.typicode.com';

const resources = [
  {
    name: 'todos',
    url: `${baseUrl}/todos`,
  },
  {
    name: 'users',
    url: `${baseUrl}/users`,
    transformResponse: (data) => {
      return data.map(item => ({...item, name: item.name.toUpperCase()}));
    }
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
    name: 'favorites',
    default: [],
  },
  { 
    name: 'todo',
    url: `${baseUrl}/todo`,
  }
];

export default resources;