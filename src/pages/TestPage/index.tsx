import React from 'react';
import { useParams } from 'react-router-dom';
import Typography from '../../components/atoms/Typography';

const TestPage = () => {
  const { name } = useParams<{ name: string }>();
  return <Typography variant="title">This is {name} Page</Typography>;
};

export default TestPage;
