import {Space, Alert, Button, Col, Input, Row, Spin, Table, Tooltip, notification, Card} from 'antd';
import {
  FieldBinaryOutlined, // first interaction 
  FontColorsOutlined,
} from '@ant-design/icons';
import React from 'react';
import {useEffect} from 'react';

const Badges = (props) => {

  const {badges} = props;

  const notifyBadge = (badge) => {
    notification.success({
      message: "New Badge: " + badge.title + " - " + badge.description
    });
  };

  useEffect(() => {
    if(badges.length > 0){
      notifyBadge(badges[badges.length - 1]);
    }
  }, [badges]);

  const getIcon = (badgeId) => {
    switch(badgeId){
      case "first-interaction":
        return <FieldBinaryOutlined / >;
      case "your-name":
        return <FontColorsOutlined / >;
    }
  }

  const renderBadges = badges.map((badge) => {
    return <Card
        title={<span>{getIcon(badge.id)}<b> {badge.title}</b></span>}
        style={{width: 150}}
      >
        <p>{badge.description}</p>
      </Card>
  });

  return (
    <Space>
      {renderBadges}
    </Space>
  )
};

export default Badges;