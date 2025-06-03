import {
  PageContainer,
  ProForm,
  ProFormDateRangePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import React, { useRef, useState } from 'react';
import { useRequest } from '@umijs/max';
import { Card, message, Typography } from 'antd';
import type { FC } from 'react';
import { fakeSubmitForm } from './service';
import useStyles from './style.style';

const { Text } = Typography;
const BasicForm: FC<Record<string, any>> = () => {
  const { styles } = useStyles();
  const formRef = useRef<any>(null);
  const { run } = useRequest(fakeSubmitForm, {
    manual: true,
    onSuccess: () => {
      message.success('提交成功');
    },
  });
  const onFinish = async (values: Record<string, any>) => {
    run(values);
  };

  const validateMinMax = (_, value) => {
    const min = formRef.current?.getFieldValue('min');
    const max = formRef.current?.getFieldValue('max');
    if (min === undefined || max === undefined) return;
    if (+min >= +max) {
      return Promise.reject(_.field === 'min' ? '最小值必须小于最大值' : '最大值必须大于最小值');
    }
    return Promise.resolve();
  };

  return (
    <PageContainer content="表单页用于向用户收集或验证信息，基础表单常见于数据项较少的表单场景。">
      <Card bordered={false}>
        <ProForm
          hideRequiredMark
          style={{
            margin: 'auto',
            marginTop: 8,
            maxWidth: 600,
          }}
          name="basic"
          layout="vertical"
          initialValues={{
            publicType: '1',
          }}
          onFinish={onFinish}
          formRef={formRef}
        >
          <ProFormText
            label="密码"  
            placeholder="密码"
            name="password"
            width={150}
            rules={
              [
                { required: true, message: '请输入密码' },
              ]
            }
          />
          <ProFormText
            label="确认密码"    
            placeholder="确认密码"
            width={150}
            name="password2"
            dependencies={['password']}
            rules={[
              {
                required: true,
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次密码不一致'));
                },
              }),
            ]}
          />
          <ProForm.Group label="打招呼间隔时间">
            <ProFormText  
              placeholder="最低间隔时间"
              name="min"
              width={150}
              getValueFromEvent={(e) => {
                const str = e.target.value.trim().replace(/[^0-9]/g, ''); // 只保留数字
                return str.slice(0, 3) // 限制最大长度为3
              }}
              rules={
                [
                  { required: true, message: '请输入最小值' },
                  { validator: validateMinMax },
                ]
              }
              fieldProps={{
                onBlur() {
                  // formRef.current?.validateFields(['max'])
                  formRef.current?.setFields([{ name: 'max', errors: [] }]);
                }
              }}
              addonAfter = {
                <Text type="secondary" style={{ fontSize: 12, marginRight: '8px' }}>
                  -
                </Text>
              } 
            />
            <ProFormText  
                placeholder="最高间隔时间"
                width={150}
                name="max"
                getValueFromEvent={(e) => {
                    const str = e.target.value.trim().replace(/[^0-9]/g, ''); // 只保留数字
                    return str.slice(0, 3) // 限制最大长度为3
                }}
                rules={
                [
                  { required: true, message: '请输入最大值' },
                  { validator: validateMinMax },
                ]
                }
                fieldProps={{
                  onBlur() {
                    // formRef.current?.validateFields(['min'])
                    formRef.current?.setFields([{ name: 'min', errors: [] }]);
                  }
                }}
                addonAfter={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    发送消息间隔会在最低最高之间随机分钟数
                  </Text>
                }
              />
          </ProForm.Group>


          <ProFormText
            width="md"
            label="标题"
            name="title"
            rules={[
              {
                required: true,
                message: '请输入标题',
              },
              {
                validator: (_, value) => {
                  const reg = /(^\s+)|(\s+$)/;
                  if(reg.test(value)) {
                    return Promise.reject(new Error('前后不能有空格'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
            placeholder="给目标起个名字"
            fieldProps={{
              // 限制空格长度-方法2
              // maxLength: 9,
              // onInput: (e) => {
              //   e.target.value = e.target.value.trim();
              // },
              // formatter: formatterFn,
              // parser: (value) => Number(value ? value.replace('%', '') : '0'),
            }}
            // 限制空格长度-方法3
            // getValueFromEvent={(e) => {
            //   let str = e.target.value.trim()
            //   return str.slice(0, 3) // 限制最大长度为9
            // }}
          />
          <ProFormDateRangePicker
            label="起止日期"
            width="md"
            name="date"
            rules={[
              {
                required: true,
                message: '请选择起止日期',
              },
            ]}
            placeholder={['开始日期', '结束日期']}
          />
          <ProFormTextArea
            label="目标描述"
            width="xl"
            name="goal"
            rules={[
              {
                required: true,
                message: '请输入目标描述',
              },
            ]}
            placeholder="请输入你的阶段性工作目标"
          />

          <ProFormTextArea
            label="衡量标准"
            name="standard"
            width="xl"
            rules={[
              {
                required: true,
                message: '请输入衡量标准',
              },
            ]}
            placeholder="请输入衡量标准"
          />

          <ProFormText
            width="md"
            label={
              <span>
                客户
                <em className={styles.optional}>（选填）</em>
              </span>
            }
            tooltip="目标的服务对象"
            name="client"
            placeholder="请描述你服务的客户，内部客户直接 @姓名／工号"
          />

          <ProFormText
            width="md"
            label={
              <span>
                邀评人
                <em className={styles.optional}>（选填）</em>
              </span>
            }
            name="invites"
            placeholder="请直接 @姓名／工号，最多可邀请 5 人"
          />

          <ProFormDigit
            label={
              <span>
                权重
                <em className={styles.optional}>（选填）</em>
              </span>
            }
            name="weight"
            placeholder="请输入"
            min={0}
            max={100}
            width="xs"
            fieldProps={{
              formatter: (value) => `${value || 0}%`,
              parser: (value) => Number(value ? value.replace('%', '') : '0'),
            }}
          />

          <ProFormRadio.Group
            options={[
              {
                value: '1',
                label: '公开',
              },
              {
                value: '2',
                label: '部分公开',
              },
              {
                value: '3',
                label: '不公开',
              },
            ]}
            label="目标公开"
            help="客户、邀评人默认被分享"
            name="publicType"
          />
          <ProFormDependency name={['publicType']}>
            {({ publicType }) => {
              return (
                <ProFormSelect
                  width="md"
                  name="publicUsers"
                  fieldProps={{
                    style: {
                      margin: '8px 0',
                      display: publicType && publicType === '2' ? 'block' : 'none',
                    },
                  }}
                  options={[
                    {
                      value: '1',
                      label: '同事甲',
                    },
                    {
                      value: '2',
                      label: '同事乙',
                    },
                    {
                      value: '3',
                      label: '同事丙',
                    },
                  ]}
                />
              );
            }}
          </ProFormDependency>
        </ProForm>
      </Card>
    </PageContainer>
  );
};
export default BasicForm;
