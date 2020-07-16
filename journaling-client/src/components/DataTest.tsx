import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { DataTestQuery } from './__generated__/DataTestQuery';

const DATA_TEST_QUERY = gql`
  query DataTestQuery {
    counter
  }
`;

const DataTest = () => {
  const { loading, error, data } = useQuery<DataTestQuery>(DATA_TEST_QUERY);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error.message}</div>;
  }

  return <div>Counter: {data?.counter}</div>;
};

export default DataTest;
