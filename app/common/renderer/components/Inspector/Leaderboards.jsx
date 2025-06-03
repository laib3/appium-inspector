import {Table, Typography, Space} from 'antd';
import React from 'react';
const {Title} = Typography;
import {useEffect} from 'react';
import {GAMIFICATION_BADGES} from '../../constants/gamification';

const Leaderboards = (props) => {
  const {score, addBadge, badges} = props;

  const dataSource = [
    { key: 'Maurizio', value: 400, name: "Maurizio", score: 400 },
    { key: "R0s3m4ry", value: 380, name: "R0s3m4ry", score: 380 },
    { key: "p3bble", value: 240, name: "p3bble", score: 240 },
  ]; 

  useEffect(() => {
   if(score > dataSource[0].score && badges.every(b => b.id !== "record-breaker")){
    addBadge(GAMIFICATION_BADGES.find(b => b.id === "record-breaker"))
   }
  }, [score]);

  const columns = [
    { title: "UserName", dataIndex: "name", key: "user-name" },
    { title: "Score", dataIndex: "score", key: "score" },
  ];

  return (
    <>
      <Title level={4}>Leaderboards</Title>
      <Space direction="vertical" size="middle" style={{display: "flex"}}>
        <Table
            columns={columns}
            dataSource={dataSource}
            bordered={true}
            pagination={false}
            size="small"
        />
        <span><b>Your score:</b> {score}</span>
      </Space>
    </>
  )
};

export default Leaderboards;

