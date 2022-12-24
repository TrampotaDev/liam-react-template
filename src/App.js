import { memo, useCallback } from 'react';
import './App.css';
import { useData, useUpdate } from './liamsAsyncRedux';

const App = () => {
  const { data: { selectedTodo } } = useData([{ name: 'selectedTodo' }]);
  return (
      <div className="App">
        Todos
        <div>
          Selected: {selectedTodo.data?.title}
        </div>
        <Todos />
      </div>
  );
}

const Todos = memo(() => {
  const { isLoading, data: { todos } } = useData([{ name: 'todos' }]);
  const { updateSelectedTodo, updateTodos } = useUpdate([ { name: 'selectedTodo'},  { name: 'todos' }]);

  const selectOnClick = useCallback((todo) => {
    updateSelectedTodo(() => ({ ...todo, selected: true }));
    updateTodos((todos) => todos.map(item => {
      if (item.id === todo.id) {
        return ({
          ...todo,
          selected: true
        });
      }
      if (item.selected) {
        return ({
          ...item,
          selected: false
        });
      }
      return item;
    }))
  }, []);

  const deleteOnClick = useCallback((todo) => {
    updateSelectedTodo(() => null);
    updateTodos((todos) => {
      const updatedTodos = todos.filter(item => item.id !== todo.id);
      return updatedTodos;
    })
  }, []);

  if (isLoading) {
    return (
      <div>
        Loading
      </div>
    )
  }
  return (
    <div>
      {todos.data.map(todo => (
        <Todo todo={todo} onSelect={selectOnClick} onDelete={deleteOnClick} />
      ))}
    </div>
  )
});

const Todo = memo(({ todo, onSelect, onDelete }) => {
  return (
    <div>
      {todo.title}
      <button onClick={() => onSelect(todo)}>
        select
      </button>
      <button onClick={() => onDelete(todo)}>
        delete
      </button>
    </div>
  )
});



export default App;
