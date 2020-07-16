import React from 'react';
import { useQuery, gql } from '@apollo/client';

const COUNTER = gql`
  query DataTest {
    counter
  }
`;

const DataTest = () => {
  const { loading, error, data } = useQuery(COUNTER);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error.message}</div>;
  }

  return <div>Counter: {data.counter}</div>;
};

export default DataTest;
