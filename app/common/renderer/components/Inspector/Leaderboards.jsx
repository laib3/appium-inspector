import {Table} from 'antd';
import React from 'react';

const Leaderboards = (props) => {
  const {badges} = props;

  const dataSource = [
    { key: 'Maurizio', value: 300, name: "Maurizio", score: 300 },
    { key: "R0s3m4ry", value: 250, name: "R0s3m4ry", score: 250 },
    { key: "p3bble", value: 180, name: "p3bble", score: 180 },
  ]; 

  const columns = [
    { title: "UserName", dataIndex: "name", key: "user-name" },
    { title: "Score", dataIndex: "score", key: "score" },
  ];

  return (
    <Table
        columns={columns}
        dataSource={dataSource}
        bordered={true}
        size="small"
    />
  )
};

export default Leaderboards;

