const baseUrl = "https://jsonplaceholder.typicode.com";

const resources = [
  {
    name: "todos",
    url: `${baseUrl}/todos`,
    methods: ["GET"],
    persisted: true,
  },
  {
    name: "selectedTodo",
  },
];

export default resources;
