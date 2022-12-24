const baseUrl = 'https://jsonplaceholder.typicode.com';

const resources = [
  {
    name: 'todos',
    url: `${baseUrl}/todos`,
    methods: ['GET'],
  },
  {
    name: 'selectedTodo',
  }
];

export default resources;