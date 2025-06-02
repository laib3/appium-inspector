import {Space, Alert, Button, Col, Input, Row, Spin, Table, Tooltip, notification, Card} from 'antd';
import {
  FundTwoTone, // first interaction 
  EditTwoTone, // your name
  PlusSquareTwoTone, // page explorer
  SecurityScanTwoTone, // high coverage 
} from '@ant-design/icons';
import React from 'react';
import {useEffect} from 'react';
import {GAMIFICATION_BADGES, PAGE_THRESHOLD} from '../../constants/gamification';

const Badges = (props) => {

  const {badges, pages, addBadge} = props;

  const notifyBadge = (badge) => {
    notification.success({
      message: "New Badge: " + badge.title + " - " + badge.description
    });
  };

  useEffect(() => {
    if(badges.every(b => b.id !== "page-explorer") && pages.length > PAGE_THRESHOLD + 1){
      addBadge(GAMIFICATION_BADGES.find(b => b.id === "page-explorer"));
    }
  }, [pages]);

  useEffect(() => {
    if(badges.length > 0){
      notifyBadge(badges[badges.length - 1]);
    }
  }, [badges]);

  const getIcon = (badgeId) => {
    switch(badgeId){
      case "first-interaction":
        return <FundTwoTone twoToneColor="#eb2f96"/>;
      case "your-name":
        return <EditTwoTone twoToneColor="#eb2f96"/>;
      case "page-explorer":
        return <PlusSquareTwoTone twoToneColor="#eb2f96"/>;
      case "high-coverage":
        return <SecurityScanTwoTone twoToneColor="#eb2f96"/>;
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