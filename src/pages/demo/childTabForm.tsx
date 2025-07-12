import { Tabs, Form } from 'antd';
import { forwardRef, useImperativeHandle, useState } from 'react';

interface TabField {
  name: string;
  label: string;
  rules?: any[];
  component: React.ReactNode;
}

interface TabData {
  key: string;
  title: string;
  fields: TabField[];
}

interface ChildComponentProps {
  tabsData: any; //TabData[];
}

const ChildComponent = forwardRef<any, ChildComponentProps>(({ tabsData }, ref) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('en');

  // 暴露表单方法给父组件
  useImperativeHandle(ref, () => ({
    validateFields: form.validateFields,
    setActiveTab: setActiveTab
  }));

  return (
    <Form form={form} layout="vertical">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {tabsData.map(tab => (
          <Tabs.TabPane tab={tab.title} key={tab.key} forceRender>
            {/* 动态渲染字段，所有字段统一注册到form */}
            {tab.fields.map(field => (
              <Form.Item
                name={[tab.key, field.name]} // 嵌套字段命名如: tab1.username
                label={field.label}
                rules={field.rules}
                key={`${tab.key}_${field.name}`}
              >
                {field.component?.()}
              </Form.Item>
            ))}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </Form>
  );
});

export default ChildComponent