import {
  AlertFilled,
  BulbFilled,
  CrownFilled,
  EyeFilled,
  FireFilled,
  HeartFilled,
  RobotFilled,
  RocketFilled,
  SkinFilled,
  SmileFilled,
  StarFilled,
  SunFilled,
  ThunderboltFilled
} from '@ant-design/icons';
import {Col, Row, Table, Progress, Input, Typography} from 'antd';
import {useEffect, useRef, useState} from 'react';
import {notification} from 'antd';

import {GAMIFICATION_INFO_PROPS, GAMIFICATION_INFO_TABLE_PARAMS} from '../../constants/gamification';
import InspectorStyles from './Inspector.module.css';
import Source from './Source.jsx'
let getSessionData;

const {Title} = Typography;

// a simple algorithm to build a page id from its content:
// just concatenate the name of each widget.
// sort of HASH function
const buildPageId = (json) => {
    // explore page 
    const firstCapitalMatch = json.attributes.class.match(/[A-Z]/);
    const widgetName = firstCapitalMatch ? json.attributes.class.slice(firstCapitalMatch.index) : json.attributes.class;
    const pageId = widgetName + json.children.map(c => buildPageId(c)).join("");
    return pageId;
}

/* all widgets may be interacted with Appium Inspector */
const countWidgets = (json) => {
  let sum = 1;
  for(const child of json.children){
    sum += countWidgets(child);
  }
  return sum;
}

const GamificationInfo = (props) => {
  const {driver, t, pages, currentPageId, 
    nInteractedSessionWidgets, nInteractableSessionWidgets, sourceJSON,
    user, setUser} = props;

  const gamificationArray = Object.keys(GAMIFICATION_INFO_PROPS).map((key) => [
    key,
    String(GAMIFICATION_INFO_PROPS[key]),
  ]);

  const getCurrentPageCoverage = () => {
    if(currentPageId === null || currentPageId === undefined){
      return 0;
    } else {
      const currentPage = pages.find(p => p.pageId === currentPageId);
      return Math.round(100 * currentPage.nInteractedWidgets / currentPage.nInteractableWidgets)
    }
  }

  const pickIcon = (iconName) => {
    switch (iconName) {
      case "alert":
        return <AlertFilled/>;
     case "bulb":
        return <BulbFilled/>;
     case "crown":
        return <CrownFilled/>;
     case "eye":
        return <EyeFilled/>;
     case "fire":
        return <FireFilled/>;
     case "heart":
        return <HeartFilled/>;
     case "robot":
        return <RobotFilled/>;
     case "rocket":
        return <RocketFilled/>;
     case "skin":
        return <SkinFilled/>;
     case "smile":
        return <SmileFilled/>;
     case "star":
        return <StarFilled/>;
     case "sun":
        return <SunFilled/>;
     case "thunderbolt":
        return <ThunderboltFilled/>;
    }
  }

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

    const newPagesFound = 0;

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
              <div>
                <div id="userInfo" style={{paddingTop: '16px', paddingBottom: '16px'}}>
                  <Input 
                    size="large" 
                    placeholder="UserName"
                    prefix={user === null ? "?" : pickIcon(user.icon)}
                    onBlur={(e) => { setUser({...user, name: e.target.value}); }}
                  >
                  </Input>
                </div>
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
                <div style={{paddingTop: '16px', paddingBottom: '16px'}}>
                  <div style={{paddingBottom: '4px'}}><b>New Pages Found:</b> {newPagesFound}</div>
                  <div><b>Current Page Coverage:</b></div>
                  <Progress
                    percent={currentPageId === null ? 0 : getCurrentPageCoverage()}
                    showInfo={true}
                  ></Progress>
                  <div><b>Incremental Coverage:</b></div>
                  <Progress
                    percent={Math.round((100 * nInteractedSessionWidgets) / nInteractableSessionWidgets)}
                    showInfo={true}
                  ></Progress>
                </div>
                {/*}
                <div id="sourceContainer">
                  <Title level={5}>Source</Title>
                  <Source {...props}></Source>
                </div>
                */}
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
    const {appId, nInteractedSessionWidgets, interactedWidgetIds} = props;
    const {sessionId, connectedUrl} = driver || '';


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
        return nInteractedSessionWidgets;
      case 'Last interacted widget':
        return interactedWidgetIds[0];
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
      // TODO: logTime
    }, 1000);

    return () => clearInterval(interval.current); // cleanup
  }, []); 

  /* update current pageId whenever the sourceJSON is changed and possibly add to the list of pages */
  useEffect(() => {
    const {setCurrentPageId, pages, addPage} = props;
    if(sourceJSON){
      const pageId = buildPageId(sourceJSON);
      if(! pages.some(p => p.pageId == pageId)){ 
        const newPage = { pageId: pageId, nInteractableWidgets: countWidgets(sourceJSON), nInteractedWidgets: 0 };
        addPage(newPage);
        setCurrentPageId(pageId);
      } else {
        setCurrentPageId(pageId);
      }
    } else 
      setCurrentPageId(null);
  }, [sourceJSON]);

  /* update current app ID whenever you interact with a new widget */
  useEffect(() => {
    const {getActiveAppId} = props;
    if(driver) {
      const {isIOS, isAndroid} = driver.client;
      getActiveAppId(isIOS, isAndroid);
    }
    // notification.error({
    //   message: "You interacted with a new widget!"
    // });
  }, [nInteractedSessionWidgets]);

  useEffect(() => {
    const icons = ["alert", "bulb", "crown", "eye", "fire", "heart", "robot", "rocket", "skin", "smile", "star", "sun", "thunderbolt"];
    const random_idx = Math.round(100 * Math.random() % icons.length);
    const random_icon = icons[random_idx];
    if(user === null){ // generate random user name and icon
      setUser({ name : `user${random_idx}`, icon: `${random_icon}` });
    }
  }, []);

  return getTable(gamificationArray, GAMIFICATION_INFO_TABLE_PARAMS.OUTER_KEY, true);
}

export default GamificationInfo;
