import { memo, useCallback, useState } from 'react';
import './App.css';
import { useData, useUpdate } from './liamsAsyncRedux';

const App = () => {
  const [someBool, setSomeBool] = useState(true)
  const { data: [ users ], isLoading } = useData([ { name: 'users' }]);
  const updateSelectedUser = useUpdate({ name: 'selectedUser' });

  if (isLoading) {
    return (
      <div>
        Loading App
      </div>
    )
  }
  return (
      <div className="App">
        <button onClick={() => setSomeBool(!someBool)}>show user</button>
        Todos
        {users.data.map(user => (
          <button onClick={() => updateSelectedUser({ updateFn: () => user.id })}>
            {user.id}
          </button>
        ))}
        {someBool && <User />}
      </div>
  );
}

const User = memo(() => {
  const { data: [ selectedUser ] } = useData([
    { name: 'selectedUser' }
  ])
  const { isLoading, data: [ userPosts ] } = useData([
    { name: 'userPosts', parameters: { query: { userId: selectedUser.data }}, forceFetch: false }
  ]);
  console.log('render:', selectedUser, userPosts);


  
  if (isLoading) {
    return (
      <div>
        Loading
      </div>
    )
  }
  return (
    <div>
      <button onClick={userPosts.refetch}>
        refetch
      </button>
      {userPosts.data.map(post => (
        <Post post={post} userId={selectedUser.data} />
      ))}
    </div>
  )
});


const Post = memo(({ post, userId  }) => {
  const updatePosts = useUpdate({ name: 'userPosts', parameters: { query: { userId }} });
  const deletePost = (id) => {
    updatePosts({ refetch: true, unloadResources: [{ name: 'userPosts' }] });
  }

  return (
    <div>
      {post.title}
      <button onClick={() => deletePost(post.id)}>
        delete
      </button>
    </div>
  )
});



export default App;
