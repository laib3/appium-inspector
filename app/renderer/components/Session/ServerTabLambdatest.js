import React from 'react';
import { Form, Input, Row, Col } from 'antd';
import { INPUT } from '../AntdTypes';

const lambdatestUsernamePlaceholder = (t) => {
  if (process.env.LAMBDATEST_USERNAME) {
    return t('usingDataFoundIn', {environmentVariable: 'LAMBDATEST_USERNAME'});
  }
  return t('yourUsername');
};

const lambdatestAccessKeyPlaceholder = (t) => {
  if (process.env.LAMBDATEST_ACCESS_KEY) {
    return t('usingDataFoundIn', {environmentVariable: 'LAMBDATEST_ACCESS_KEY'});
  }
  return t('yourAccessKey');
};

const ServerTabLambdatest = ({ server, setServerParam, t }) => (
  <Form>
    <Row gutter={8}>
      <Col span={12}>
        <Form.Item>
          <Input id='lambdatestUsername' placeholder={lambdatestUsernamePlaceholder(t)} addonBefore={t('LambdaTest Username')} value={server.lambdatest.username}
            onChange={(e) => setServerParam('username', e.target.value)} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item>
          <Input id='lambdatestPassword' type={INPUT.PASSWORD} placeholder={lambdatestAccessKeyPlaceholder(t)} addonBefore={t('LambdaTest Access Key')}
            value={server.lambdatest.accessKey} onChange={(e) => setServerParam('accessKey', e.target.value)} />
        </Form.Item>
      </Col>
    </Row>
  </Form>
);

export default ServerTabLambdatest;
