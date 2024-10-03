import {Col, Row, Table} from 'antd';
import React, {useEffect, useRef, useState} from 'react';

import {GAMIFICATION_INFO_PROPS, GAMIFICATION_INFO_TABLE_PARAMS} from '../../constants/gamification';
import InspectorStyles from './Inspector.module.css';

let getSessionData;

const GamificationInfo = (props) => {
  const {driver, t} = props;

  const gamificationArray = Object.keys(GAMIFICATION_INFO_PROPS).map((key) => [
    key,
    String(GAMIFICATION_INFO_PROPS[key]),
  ]);

  const generateSessionTime = () => {
    const {sessionStartTime} = props;
    const currentTime = Date.now();
    const timeDiff = currentTime - sessionStartTime;

    const hours = timeDiff / 3600000;
    const minutes = (hours - Math.floor(hours)) * 60;
    const seconds = (minutes - Math.floor(minutes)) * 60;

    const showTime = (time) => String(Math.floor(time)).padStart(2, '0');

    return `${showTime(hours)}:${showTime(minutes)}:${showTime(seconds)}`;
  };

  const interval = useRef();
  const [time, setTime] = useState(generateSessionTime());

  const getTable = (tableValues, keyName, outerTable) => {
    const keyValue = `${keyName}_value`;
    const dataSource = tableValues.map(([name, value]) => ({
      key: name,
      [keyName]: outerTable ? t(value) : name,
      [keyValue]: value,
    }));

    const columns = [
      {
        dataIndex: keyName,
        key: keyName,
        ...(outerTable && {width: GAMIFICATION_INFO_TABLE_PARAMS.COLUMN_WIDTH}),
      },
      {
        dataIndex: keyValue,
        key: keyValue,
        render: outerTable
          ? (text) => generateSessionInfo(text)
          : (text) =>
              typeof text === 'object' ? <pre>{JSON.stringify(text, null, 2)}</pre> : String(text),
      },
    ];

    return outerTable ? (
      <div className={InspectorStyles['session-info-table']}>
        <Row>
          <Col span={24}>
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              showHeader={false}
              bordered={true}
              size="small"
            />
          </Col>
        </Row>
      </div>
    ) : (
      <Table
        className={InspectorStyles['session-inner-table']}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        showHeader={false}
        size="small"
        scroll={{y: GAMIFICATION_INFO_TABLE_PARAMS.SCROLL_DISTANCE_Y}}
      />
    );
  };

  const generateSessionInfo = (name) => {
    const {appId, status, nInteractedWidgets} = props;
    const {sessionId, connectedUrl} = driver || '';

    const sessionArray =
      getSessionData != null
        ? Object.keys(getSessionData).map((key) => [key, getSessionData[key]])
        : [];
    const serverStatusArray =
      status != null ? Object.keys(status).map((key) => [key, String(status[key])]) : [];

    // TODO: Fetch URL from Cloud Providers
    const sessionUrl =
      sessionId && connectedUrl
        ? `${connectedUrl}session/${sessionId}`
        : t('Error Fetching Session URL');

    switch (name) {
      case 'Session ID':
        return sessionId;
      case 'Session URL':
        return sessionUrl;
      case 'Session Length':
        return time;
      case 'Currently Active App ID':
        return appId;
      case 'Number of Interacted Widgets':
        return nInteractedWidgets;
      default:
        return name;
    }
  };

  useEffect(() => {
    const {getActiveAppId, getServerStatus, applyClientMethod} = props;
    const {isIOS, isAndroid} = driver.client;

    getActiveAppId(isIOS, isAndroid);
    getServerStatus();

    (async () => (getSessionData = await applyClientMethod({methodName: 'getSession'})))();
    interval.current = setInterval(() => {
      setTime(generateSessionTime());
    }, 1000);

    return () => clearInterval(interval.current); // cleanup
  }, []); 
  /* 
  	useEffect: connect to an external system (i.e. anything which is not managed by react itself)
  	arguments = 
	[1] a setup function which connects to the external system and returns a cleanup function
	[2] a list of dependencies including every value which is used inside the functions
  */

  return getTable(gamificationArray, GAMIFICATION_INFO_TABLE_PARAMS.OUTER_KEY, true);
};

export default GamificationInfo;
