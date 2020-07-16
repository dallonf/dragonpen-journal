import React from 'react';
import { ApolloProvider } from '@apollo/client';
import DataTest from './components/DataTest';
import { client } from './data/apollo-client';
import './App.css';

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="app">
        <DataTest />
      </div>
    </ApolloProvider>
  );
}

export default App;
