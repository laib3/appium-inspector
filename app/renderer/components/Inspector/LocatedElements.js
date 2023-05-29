import React, { Component } from 'react';
import { clipboard } from '../../polyfills';
import { Input, Row, Button, Badge, List, Space, Tooltip } from 'antd';
import { CopyOutlined, AimOutlined, ClearOutlined, SendOutlined } from '@ant-design/icons';
import InspectorStyles from './Inspector.css';
import { withTranslation } from '../../util';

const ButtonGroup = Button.Group;

class LocatedElements extends Component {

  onSubmit () {
    const {locatedElements, locatorTestStrategy, locatorTestValue, searchForElement, clearSearchResults, hideLocatorTestModal} = this.props;
    if (locatedElements) {
      hideLocatorTestModal();
      clearSearchResults();
    } else {
      searchForElement(locatorTestStrategy, locatorTestValue);
    }
  }

  onCancel () {
    const {hideLocatorTestModal, clearSearchResults} = this.props;
    hideLocatorTestModal();
    clearSearchResults();
  }

  render () {
    const {
      locatedElements,
      applyClientMethod,
      setLocatorTestElement,
      locatorTestElement,
      t,
    } = this.props;

    return <>
      {locatedElements.length === 0 && <Row><i>{t('couldNotFindAnyElements')}</i></Row>}
      {locatedElements.length > 0 && <Space className={InspectorStyles.spaceContainer} direction='vertical' size='small'>
        <Row><span>{t('elementsCount')} <Badge count={locatedElements.length} offset={[0, -2]}/></span></Row>
        <Row>
          <List className={InspectorStyles.searchResultsList}
            size='small'
            dataSource={locatedElements}
            renderItem={(elementId) =>
              <List.Item type='text'
                {...(locatorTestElement === elementId ? { className: InspectorStyles.searchResultsSelectedItem } : {})}
                {...(locatorTestElement !== elementId ? { onClick: () => {setLocatorTestElement(elementId);} } : {})}
              >
                {elementId}
              </List.Item>
            }
          />
        </Row>
        <Row justify='center'>
          <Space direction='horizontal' size='small'>
            <Tooltip title={t('Copy ID')} placement='bottom'>
              <Button
                disabled={!locatorTestElement}
                icon={<CopyOutlined/>}
                onClick={() => clipboard.writeText(locatorTestElement)}/>
            </Tooltip>
            <Tooltip title={t('Tap')} placement='bottom'>
              <Button
                disabled={!locatorTestElement}
                icon={<AimOutlined/>}
                onClick={() => applyClientMethod({methodName: 'click', elementId: locatorTestElement})}
              />
            </Tooltip>
            <ButtonGroup className={InspectorStyles.searchResultsActions}>
              <Input className={InspectorStyles.searchResultsKeyInput}
                disabled={!locatorTestElement}
                placeholder={t('Enter Keys to Send')}
                allowClear={true}
                onChange={(e) => this.setState({...this.state, sendKeys: e.target.value})}/>
              <Tooltip title={t('Send Keys')} placement='bottom'>
                <Button
                  disabled={!locatorTestElement}
                  icon={<SendOutlined/>}
                  onClick={() => applyClientMethod({methodName: 'sendKeys', elementId: locatorTestElement, args: [this.state.sendKeys || '']})}
                />
              </Tooltip>
              <Tooltip title={t('Clear')} placement='bottom'>
                <Button
                  disabled={!locatorTestElement}
                  id='btnClearElement'
                  icon={<ClearOutlined/>}
                  onClick={() => applyClientMethod({methodName: 'clear', elementId: locatorTestElement})}
                />
              </Tooltip>
            </ButtonGroup>
          </Space>
        </Row>
      </Space>}
    </>;
  }
}

export default withTranslation(LocatedElements);
