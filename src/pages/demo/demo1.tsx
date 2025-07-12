import { history, useIntl } from '@umijs/max';
import { Button, Input, message, Modal, Result } from 'antd';
import React, { useRef, useState } from 'react';
import ChildComponent from './childTabForm';

const DemoPage: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const formRef = useRef();
  const [data, setData] = useState([
    {
      key: 'en',
      title: 'en',
      fields: [
        {
          name: 'name',
          label: '姓名',
          rules: [
            {
              required: true,
              message: '请输入姓名',
            }
          ],
          component: () => {
            return (
              <Input />
            )
          },
        }
      ]
    },
    {
      key: 'china',
      title: 'china',
      fields: [
        {
          name: 'age',
          label: '年龄',
          rules: [
            {
              required: true,
              message: '请输入年龄',
            }
          ],
          component: () => {
            return (
              <Input />
            )
          },
        }
      ]
    }
  ])

  const handleSubmit = () => {
    formRef.current.validateFields()
      .then(values => {
        // 提交所有Tab数据
        console.log('All form values:', values);
        setVisible(false);
      })
      .catch(({ errorFields }) => {
        // 自动定位到第一个错误Tab
        const firstErrorTab = errorFields[0]?.name?.[0];
        console.log('>>>>', errorFields, firstErrorTab)
        if (firstErrorTab) {
          // message.error(`请检查 ${firstErrorTab} Tab 的表单`);
          formRef.current.setActiveTab(firstErrorTab)
        }
      });
  };
  return (
  <div>
      <div>
        <p>Model里tab表单校验</p>
        <Button onClick={() => setVisible(true)}>打开表单</Button>
        <Modal
          title="统一表单校验"
          visible={visible}
          onOk={handleSubmit}
          onCancel={() => setVisible(false)}
          width={800}
        >
          <ChildComponent ref={formRef} tabsData={data} />
        </Modal>
      </div>
  </div>
);
}

export default DemoPage;
