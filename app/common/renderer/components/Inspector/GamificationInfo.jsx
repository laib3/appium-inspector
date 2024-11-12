import {Col, Row, Table, Progress, Space } from 'antd';
import {useEffect, useRef, useState} from 'react';

import {GAMIFICATION_INFO_PROPS, GAMIFICATION_INFO_TABLE_PARAMS} from '../../constants/gamification';
import InspectorStyles from './Inspector.module.css';
import Source from './Source.jsx'
let getSessionData;

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
  const {driver, t, pages, currentPageId, nInteractedSessionWidgets, nInteractableSessionWidgets, sourceJSON} = props;

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
              <Space direction="vertical" size="large" style={{display: 'block', margin: '8px'}}>
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
                  <div>Current Page Coverage:</div>
                  <Progress percent={currentPageId === null ? 0 : getCurrentPageCoverage()} showInfo={true}></Progress>
                  <div>Incremental Coverage:</div>
                  <Progress percent={Math.round((100 * nInteractedSessionWidgets) / nInteractableSessionWidgets)} showInfo={true}></Progress>
                  <div>{'Tot Interacted Widgets: ' + nInteractedSessionWidgets}</div>
                  <div>{'Tot Interactable Widgets: ' + nInteractableSessionWidgets}</div>
                </div>
                <Source {...props}></Source>
              </Space>
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
  }, [nInteractedSessionWidgets]);

  return getTable(gamificationArray, GAMIFICATION_INFO_TABLE_PARAMS.OUTER_KEY, true);
}

export default GamificationInfo;
