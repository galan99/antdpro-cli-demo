#### pro-components常见使用

```javascript
//必填
rules={[
    {
      required: true,
    },
  ]}

// 方法1-禁止输入空格，限制长度
fieldProps={{
    maxLength: 99,
    onInput: (e) => {
      e.target.value = e.target.value.trim();
    },
  }}
 // 方法2-禁止输入空格，限制长度
 getValueFromEvent={(e) => {
     let str = e.target.value.trim()
     return str.slice(0, 3) // 限制最大长度为3
 }}
  // 方法3-禁止输入空格，限制长度，友好提示
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
 
// ant-design/pro-components中的ModalForm怎么避免点击弹窗外面关闭
modalProps={{
    maskClosable: false, // 设置为 false 防止点击弹窗外部关闭
}}

// 获取其他表单属性
formRef.current?.getFieldValue('accountIds')

// 根据其他属性 监听显示隐藏
<ProFormDependency name={['proxyType']}>
{({ proxyType }) => {
  return (
    proxyType == 102 ? <ProFormSelect
      rules={[
        {
          required: true,
        },
      ]}
      options={dynamicProxyIPDictionary}
      width="lg"
      name="proxyId"
      placeholder="请选择代理账户"
      label="代理账户"
    />
    : null
  );
}}
</ProFormDependency>
// 表单添加className
formItemProps={{
  className: 'upload-form-text',
}}

```

#### pro-components的上传

```javascript
// 上传图片1
import { Upload, message } from 'antd';
export const getUploadBaseOpts = (options = {}) => {
  const { max = 500 } = options as any
  return {
    accept: '.jpg,.png,.jpeg,.gif',
    action: `${import.meta.env.VITE_APP_BASE_API}/common/upload`，
    maxCount: 1,
    beforeUpload: (file: any) => {
      if (!file) {
        message.error('请选择上传的文件');
        return Upload.LIST_IGNORE;
      }
      var allowedExtensions = /\.(jpg|png|gif|jpeg)$/i;
      if (file && !allowedExtensions.test(file.name)) {
        message.error('上传格式错误，仅限上传.jpg,.png,.jpeg,.gif后缀文件');
        return Upload.LIST_IGNORE;
      }
      if (file && file.size > max * 1024) {
        message.error(`上传图片大小不能超过${max}kb`);
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    headers: {
      Authorization: getHeaderToken(),
    },
  };
};

const uploadBaseOpts = getUploadBaseOpts({max: 100});
<>
    <ProFormUploadButton
      label="上传图片"
      name="upload"
      rules={[
        {
          required: true,
        },
      ]}
      beforeUpload={uploadBaseOpts.beforeUpload}
      action={uploadBaseOpts.action}
      fieldProps={{
        ...uploadBaseOpts,
      }}
    />
    <div style={{color: 'red', marginTop: '-15px'}}>图片尺寸限制100kb</div>
 </>


// 上传图片2
import React from 'react';
import { ProForm, ProFormUploadButton } from '@ant-design/pro-components';
import { message } from 'antd';

const ImageUploadForm = () => {
  const formRef = React.useRef();
  // 自定义上传逻辑
  const customUploadRequest = async (options) => {
    const { file, onSuccess, onError } = options;
    
    try {
      // 1. 检查文件大小 (2MB)
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        throw new Error('图片大小不能超过 2MB!');
      }

      // 2. 检查图片尺寸
      const isSizeValid = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            // 限制宽高不超过 800x600
            resolve(img.width <= 800 && img.height <= 600);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });

      if (!isSizeValid) {
        throw new Error('图片尺寸不能超过 800x600 像素!');
      }

      // 3. 调用自定义上传接口
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('https://your-api-endpoint/upload', {
        method: 'POST',
        body: formData,
        // 如果需要 token 等认证信息
        // headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('上传失败');
      
      const result = await response.json();
      
      
      // 上传成功后更新表单字段
      formRef.current?.setFieldsValue({
        imageUrl: result.url, // 假设接口返回 { url: 'https://...' }
        imageInfo: {
          name: file.name,
          size: file.size,
          width: img.width,
          height: img.height
        }
      });
      
      onSuccess(result); // 通知组件上传成功
      message.success('上传成功');
    } catch (error) {
      message.error(error.message || '上传失败');
      onError(error);
    }
  };

  return (
    <ProForm
      formRef={formRef}
      onFinish={async (values) => {
        console.log('表单提交数据:', values);
        // 提交表单逻辑...
      }}
    >
      <ProFormUploadButton
        name="image"
        label="产品图片"
        max={1}
        fieldProps={{
          name: 'file',
          listType: 'picture-card',
          customRequest: customUploadRequest,
          beforeUpload: () => false,
        }}
        extra="支持 JPG/PNG 格式，尺寸不超过800x600，大小不超过2MB"
      />
      
      {/* 隐藏字段存储图片信息 */}
      <ProFormText name="imageUrl" hidden />
      <ProForm.Item name="imageInfo" hidden />
    </ProForm>
  );
};

export default ImageUploadForm;

```

#### pro-components的最大最小数对比--1

```javascript
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

const { Text } = Typography;
const BasicForm: FC<Record<string, any>> = () => {
  const { styles } = useStyles();
  const formRef = useRef<any>(null);
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

```

#### pro-components的最大最小数对比--2

```javascript
import { AddFriendPramsType, doAddFriends, getBusinessConfigList } from '@/api';
import { useResourceStore } from '@/store/index';
import { RECEIVER2_TYPE, YES_NO_TYPE } from '@/utils/enum';
import { fetchUploadParseTxtFile } from '@/utils/tools';
import { CloudUploadOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProForm,
  ProFormDateTimePicker,
  ProFormDependency,
  ProFormInstance,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import { Button, Form, Row, Col, message, Typography } from 'antd';
import { useRef, useState } from 'react';
import { FormSendContentComponent } from '../components/form-send-content';
import './add-friend.scss';

const { Text } = Typography;
export default ({
  trigger,
  tableRef,
}: {
  trigger: JSX.Element;
  tableRef: any;
}) => {
  const formRef = useRef<ProFormInstance>();
  const [minMaxInit, setMinMaxInit] = useState<any>({})
  const [form] = Form.useForm<{ name: string; company: string }>();
  const {
    allPhonelist,
    allPhoneDictionary,
    friendDivisionDictionary,
    friendTagsDictionary,
  } = useResourceStore(state => state);
  const uploadParseTxtFile = (event: any) => {
    const file = event.target.files[0];
    // setLoading(true);
    return fetchUploadParseTxtFile(file).then(res => {
      res && formRef?.current?.setFieldValue('account', res);
      message.success('上传成功,数据已回填下方输入框');
    });
  };
  const onChangeReceiver = (value: string) => {
    // const item = allPhonelist.find(k => k.id === value);
    // formRef?.current?.setFieldValue('addNum', item?.noUsedNum);
  };

  // 禁用今天以前的时间
  const disabledDate = (current: any) => {
    return current && current < dayjs().startOf('day');
  };

  dayjs.locale('zh-cn');

  function onOpenChange(visible:boolean) {
    if (visible) {
      const fetchData = async () => {
        try {
          const response = await getBusinessConfigList()
          const item = response.rows?.find((el: any) => el.listClass === 'all_hello')
          if (item) {
            const intervalMinTime = item.dictValue || ''
            const intervalMaxTime = item.dictValue2 || ''

            formRef?.current?.setFieldValue('intervalMinTime', intervalMinTime);
            formRef?.current?.setFieldValue('intervalMaxTime', intervalMaxTime);
          }
        } catch (error) {
          console.error(error);
        }
      };
      setMinMaxInit({})
      fetchData();
    }
  }

  const validateMinMax = (type: string) => {   
    const min = form.getFieldValue('intervalMinTime');
    const max = form.getFieldValue('intervalMaxTime');
    
    const isMin = type === 'min'
    let minMessage = ''
    let maxMessage = ''

    if (isMin) {
      if (!min) {
        minMessage = '请输入最低间隔时间'
      } else if (+min > +max && max && !minMaxInit?.maxMessage) {
        minMessage = '最低时间不能大于最高时间'
      }

      setMinMaxInit({
        ...minMaxInit,
        minMessage
      })
      if (minMessage) {
        return Promise.reject(new Error(minMessage));
      } else {
        return Promise.resolve();
      }
    } else {
      if (!max) {
        maxMessage = '请输入最高间隔时间'
      } else if (+max < +min && max && !minMaxInit?.minMessage) {
        maxMessage = '最低时间不能大于最高时间'
      }
      setMinMaxInit({
        ...minMaxInit,
        maxMessage
      })
      if (maxMessage) {
        return Promise.reject(new Error(maxMessage));
      } else {
        return Promise.resolve();
      }
    }
  };

  return (
    <DrawerForm<AddFriendPramsType>
      title="新增批量打招呼"
      resize={{
        minWidth: 840,
      }}
      form={form}
      formRef={formRef}
      className="drawer-form__friend"
      trigger={trigger}
      labelAlign="right"
      labelCol={{ span: 4 }}
      layout="horizontal"
      autoFocusFirstInput
      drawerProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      submitTimeout={2000}
      onOpenChange={onOpenChange}
      onFinish={async values => {
        const {contents=[],} = values;
        if (!contents.length) {
          message.error('请添加发送内容');
          return;
        }
        const res = await doAddFriends(values);
        if (res && res.code === 200) {
          message.success('新增成功');
          tableRef && tableRef?.reload();
          return true;
        }
        return false;
      }}>
      <ProFormText
        name="title"
        width="lg"
        label="任务名称"
        placeholder="请输入名称"
        rules={[
          {
            required: true,
          },
        ]}
      />

      <ProFormSelect
        options={friendDivisionDictionary}
        rules={[
          {
            required: false,
          },
        ]}
        placeholder="请选择分组"
        width="lg"
        mode="multiple"
        allowClear
        name="divisionId"
        label="分组"
        
      />
      <ProFormSelect
        options={friendTagsDictionary}
        rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                const input1Value = getFieldValue('divisionId');
                if (!value && !input1Value) {
                  return Promise.reject('分组 或 标签，二选一必填');
                }
                return Promise.resolve();
              },
            }),
          
        ]}
        placeholder="请选择标签"
        width="lg"
        mode="multiple"
        allowClear
        name="labelId"
        label="标签"
        
      />

      <ProFormRadio.Group
        name="receiverType"
        rules={[
          {
            required: true,
          },
        ]}
        label="添加方式"
        initialValue={1}
        options={RECEIVER2_TYPE}
      />

      <ProFormDependency name={['receiverType']}>
        {({ receiverType }) => {
          if (receiverType === 2) {
            return (
              <>
                <ProForm.Item label="上传好友">
                  <Button
                    className="upload-data"
                    icon={<CloudUploadOutlined />}>
                    上传数据
                    <label htmlFor="txtFile">上传数据</label>
                  </Button>

                  <input
                    type="file"
                    id="txtFile"
                    hidden
                    onChange={e => uploadParseTxtFile(e)}
                    accept=".txt"
                    style={{ display: 'none' }}
                  />
                </ProForm.Item>
                <ProFormTextArea
                  width="lg"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  formItemProps={{ wrapperCol: { offset: 4 } }}
                  name="account"
                  placeholder="请输入手机号，一行一个资源、以回车隔开，每行字符不能超过50"
                />
              </>
            );
          }
          return (
            <>
              <ProFormSelect
                rules={[
                  {
                    required: true,
                  },
                ]}
                options={allPhonelist.map(item => ({
                  label: `${item.title}(${item.noUsedNum})`,
                  value: item.id,
                }))}
                width="lg"
                name="phoneLibraryId"
                onChange={onChangeReceiver}
                label="手机库"
              />
            </>
          );
        }}
      </ProFormDependency>

      <ProFormText
        width="lg"
        name="addNum"
        label="添加数量"
        placeholder="请输入数量（即每个用户可以添加多少个手机号）"
        rules={[
          {
            required: true,
          },
        ]}
        fieldProps={{
          maxLength: 9,
          onInput: e => {
            var val = e.target.value.trim();
            val = val.replace(/[^0-9]/g, '');
            e.target.value = val;
          },
        }}
      />

      <ProFormDateTimePicker
        width="sm"
        name="delayTime"
        label="开始时间"
        placeholder="请选择几点开始执行"
        rules={[
          {
            required: true,
          },
        ]}
        fieldProps={{
          disabledDate: disabledDate,
        }}
        addonAfter={
          <Text type="secondary" style={{ fontSize: 12 }}>
            当前平台时间：{dayjs().format('YYYY-MM-DD HH:mm:ss')}
          </Text>
        }
      />

      <Form.Item
        label="打招呼间隔时间"
        className='proFormTextInsBox'
        required
      >
        <Row>
          <Col>
            <Form.Item
              name="intervalMinTime"
              className='proFormTextIns'
              rules={[
                { validator: validateMinMax.bind(null, 'min') },
              ]}
              style={{ marginBottom: 0 }}
            >
              <ProFormText  
                placeholder="最低间隔时间"
                width={150}
                fieldProps={{
                  maxLength: 2,
                  onInput: e => {
                    var val = e.target.value.trim();
                    val = val.replace(/[^0-9]/g, '');
                    e.target.value = val;
                  },
                  onBlur() {
                    formRef.current?.validateFields(['intervalMaxTime'])
                  }
                }}
                addonAfter = {
                  <Text type="secondary" style={{ fontSize: 12, marginRight: '8px' }}>
                    -
                  </Text>
                } 
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              name="intervalMaxTime"
              className='proFormTextIns'
              rules={[
                { validator: validateMinMax.bind(null, 'max') },
              ]}
              style={{ marginBottom: 0 }}
            >
              <ProFormText  
                placeholder="最高间隔时间"
                width={150}
                fieldProps={{
                  maxLength: 2,
                  onInput: e => {
                    var val = e.target.value.trim();
                    val = val.replace(/[^0-9]/g, '');
                    e.target.value = val;
                  },
                  onBlur() {
                    formRef.current?.validateFields(['intervalMinTime'])
                  }
                }}
                addonAfter={
                  // <span style={{color: 'red', marginLeft: '5px'}}>发送消息间隔会在最低最高之间随机分钟数</span>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    发送消息间隔会在最低最高之间随机分钟数
                  </Text>
                }
              />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>


      <ProFormRadio.Group
        name="isFk"
        rules={[
          {
            required: true,
          },
        ]}
        initialValue={0}
        label="是否启动风控"
        options={YES_NO_TYPE}
        addonAfter={
          <Text type="secondary" style={{ fontSize: 12 }}>
            开启后，封号超过3个会停止任务，任务开始后无法修改
          </Text>
        }
      />

      <ProFormRadio.Group
        name="isRepeat"
        rules={[
          {
            required: true,
          },
        ]}
        label="重复添加好友"
        options={YES_NO_TYPE}
        initialValue={1}
        addonAfter={
          <Text type="secondary" style={{ fontSize: 12 }}>
            “否”状态下，一个手机号仅限一个账号添加为好友
          </Text>
        }
      />

      <ProFormRadio.Group
        name="encryptedFlg"
        rules={[
          {
            required: true,
          },
        ]}
        label="信息是否加密"
        options={YES_NO_TYPE}
        initialValue={0}
        addonAfter={
          <Text type="secondary" style={{ fontSize: 12 }}>
            “是”状态下，好友收到的信息是加密提醒
          </Text>
        }
      />
      {/* <ProFormList
        name="contents"
        actionRef={contentsActionRef}
        creatorButtonProps={false}
        min={1}
        copyIconProps={false}
        deleteIconProps={false}
        className="card-children"
        initialValue={[
          {
            type: 'text',
            content: '',
            contentType: 0,
          },
        ]}
        itemRender={({ listDom, action }) => (
          <div className="card-children__item">
            {listDom}
            {action}
          </div>
        )}>
        {(f, index: number, action) => {
          const current = action.getCurrentRowData();
          return (
            <>
              <Flex
                justify="space-between"
                align="center"
                gap="large"
                className="space-flex">
                <div style={{ minWidth: '100px' }}>
                  类型：
                  <Text type="secondary">
                    {SEND_CONTENTTYPE_OBJ[current.type]}
                  </Text>
                </div>
                <div style={{ flex: 1 }}>
                  {current.type === 'text' && (
                    <ProFormRadio.Group
                      name="contentType"
                      formItemProps={{
                        className: 'pro-form-radio',
                      }}
                      options={SEND_TEXT_CONTENT_TYPE}
                    />
                  )}
                </div>
                <p>
                  <Link onClick={() => action.remove(index)}>
                    <DeleteOutlined />
                  </Link>
                </p>
              </Flex>
              <ProFormDependency name={['contentType']}>
                {({ contentType }) => {
                  if (current.type === 'text') {
                    return contentType !== 1 ? (
                      <ProFormTextArea
                        width="lg"
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                        name="content"
                        placeholder="请输入文本内容"
                      />
                    ) : null;
                  } else if (current.type === 'image') {
                    return (
                      <>
                        <Button
                          className="upload-data"
                          disabled={current.content != ''}
                          icon={<CloudUploadOutlined />}>
                          上传图片
                          <label htmlFor="imagesFile">上传图片</label>
                        </Button>

                        <input
                          type="file"
                          id="imagesFile"
                          hidden
                          onChange={e => uploadParseTxtFile(e)}
                          accept=".txt"
                          style={{ display: 'none' }}
                        />
                      </>
                    );
                  } else {
                    const content = (
                      SEND_CONTENTTYPE_OBJ[current.type] || ''
                    ).replace('添加', '');
                    return (
                      <p>
                        <Tag color="blue">给用户{content}</Tag>
                      </p>
                    );
                  }
                }}
              </ProFormDependency>
            </>
          );
        }}
      </ProFormList> */}
    </DrawerForm>
  );
};

```

#### setstate异步同步

```javascript
import { flushSync } from "react-dom"
class ChangePwd extends React.Component {
    constructor(props){
    super(props)
    this.state = {
      num:100
    }
}
sub(){
    // React18版本中setState是异步的  异步变同步用flushSync包装
    // 在React18之前，还需要分情况讨论
    console.log("start....")
    // 把修改状态设置成同步
    flushSync(this.setState({
      num:10
    },()=>{
      console.log("setstate....")
    })
    console.log("end....")
}

// 函数写法
const fetchUserInfo = async () => {
  const userInfo = await initialState?.fetchUserInfo?.();
  if (userInfo) {
    flushSync(() => {
      setInitialState((s) => ({
        ...s,
        currentUser: userInfo,
      }));
    });
  }
};
```

#### umi-浏览器标题

```javascript
import { Helmet } from '@umijs/max';

<Helmet>
  <title>登录页</title>
</Helmet>
```

#### umi使用路由

```javascript
```

#### pro-components常见使用

```javascript
import { history, Link, useParams, useSearchParams } from '@umijs/max';

// 跳转路由
history.push('/list');

// 带参数跳转到指定路由
history.push('/list?a=b&c=d#anchor', state);
history.push({
    pathname: '/list',
    search: '?a=b&c=d',
    hash: 'anchor',
  },
  {
    some: 'state-data',
  }
);

// 跳转当前路径，并刷新 state
history.push({}, state)

// 跳转到上一个路由
history.back();
history.go(-1);

// 返回登录页面添加to参数，登录后返回to参数页面
const {location} = history
history.replace({
   pathname: '/user/login',
   query: {
     to: location.pathname
   },
});

// 获取路由参数
let [searchParams, setSearchParams] = useSearchParams();
const id = searchParams.get('id')

```

#### pro-components常见使用

```javascript
```
