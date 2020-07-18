import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { DataTestQuery } from './__generated__/DataTestQuery';
import { DataTestIncrementMutation } from './__generated__/DataTestIncrementMutation';
import { DataTestIncrementWriteQuery } from './__generated__/DataTestIncrementWriteQuery';
import { DataTestIncrementSubscription } from './__generated__/DataTestIncrementSubscription';

const DATA_TEST_QUERY = gql`
  query DataTestQuery {
    counter
  }
`;

const INCREMENT_MUTATION = gql`
  mutation DataTestIncrementMutation {
    counterIncrement
  }
`;
const INCREMENT_WRITE_QUERY = gql`
  query DataTestIncrementWriteQuery {
    counter
  }
`;

const INCREMENT_SUBSCRIPTION = gql`
  subscription DataTestIncrementSubscription {
    counterIncremented
  }
`;

const DataTest = () => {
  const { loading, error, data, client, subscribeToMore } = useQuery<
    DataTestQuery
  >(DATA_TEST_QUERY);
  const [increment] = useMutation<DataTestIncrementMutation>(
    INCREMENT_MUTATION
  );

  React.useEffect(() => {
    return subscribeToMore<DataTestIncrementSubscription>({
      document: INCREMENT_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        return { ...prev, counter: subscriptionData.data.counterIncremented };
      },
    });
  });

  const handleIncrement = async () => {
    const result = await increment();
    const newCounter = result.data?.counterIncrement;
    if (newCounter != null) {
      client.writeQuery<DataTestIncrementWriteQuery>({
        query: INCREMENT_WRITE_QUERY,
        data: {
          counter: newCounter,
        },
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error.message}</div>;
  }

  return (
    <div>
      Counter: {data?.counter}
      <button onClick={handleIncrement}>Increment</button>
    </div>
  );
};

export default DataTest;
