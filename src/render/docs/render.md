## 这个文档主要是介绍后端函数接口返回的数据，前端怎么渲染成组件

首先在服务目录上点击函数时候，需要调用后端的这个接口（get）
http://127.0.0.1:8080/api/v1/runner-func/:函数id
来获取到函数的信息,下面是获取到的函数信息
```json
{
    "code": 0,
    "msg": "成功",
    "data": {
        "id": 26,
        "created_at": "2025-05-08 22:03:37",
        "updated_at": "2025-05-08 22:03:37",
        "created_by": "beiluo",
        "updated_by": "beiluo",
        "deleted_by": "",
        "title": "添加计算记录",
        "name": "add",
        "description": "添加计算记录",
        "tags": "",
        "request": { 
            "children": [
                {
                    "code": "a",
                    "desc": "",
                    "name": "值a",
                    "widget": {
                        "mode": "line_text",
                        "type": "string",
                        "widget": "input",
                        "example": "100",
                        "text_limit": "",
                        "placeholder": "请输入值a",
                        "number_limit": "[-20000,10000]",
                        "default_value": ""
                    },
                    "required": true
                },
                {
                    "code": "b",
                    "desc": "",
                    "name": "值b",
                    "widget": {
                        "mode": "line_text",
                        "type": "string",
                        "widget": "input",
                        "example": "200",
                        "text_limit": "",
                        "placeholder": "请输入值b",
                        "number_limit": "[-20000,10000]",
                        "default_value": ""
                    },
                    "required": true
                },
                {
                    "code": "receiver",
                    "desc": "",
                    "name": "接收人",
                    "widget": {
                        "mode": "line_text",
                        "type": "string",
                        "widget": "input",
                        "example": "",
                        "text_limit": "1-20",
                        "placeholder": "请输入接收人",
                        "number_limit": "",
                        "default_value": "beiluo"
                    },
                    "required": false
                },
                {
                    "code": "desc",
                    "desc": "",
                    "name": "描述",
                    "widget": {
                        "mode": "line_text",
                        "type": "string",
                        "widget": "input",
                        "example": "",
                        "text_limit": "1-50",
                        "placeholder": "请描述此次计算",
                        "number_limit": "",
                        "default_value": ""
                    },
                    "required": false
                }
            ],
            "render_type": ""
        },
        "response": {
            "children": [
                {
                    "code": "result",
                    "name": "计算结果",
                    "widget": {
                        "mode": "line_text",
                        "type": "string",
                        "widget": "input",
                        "example": "30000",
                        "text_limit": "",
                        "placeholder": "",
                        "number_limit": "",
                        "default_value": ""
                    }
                }
            ],
            "render_type": ""
        },
        "callbacks": "OnPageLoad,OnApiCreated,OnInputValidate",
        "use_tables": "calc",
        "is_public": false,
        "user": "beiluo",
        "tree_id": 86,
        "runner_id": 28,
        "fork_from_version": "",
        "fork_from_id": null,
        "method": "POST",
        "path": "beiluo/test0001/calc/add"
    }
}
```
request下的children标识了有哪些表单的组件
widget(渲染成什么组件)：（默认input）还有很多其他组件，现在先不管
mode：line_text(默认),text_area（文本域）
type（数据类型）：string，number，time，float
text_limit：string类型限制条件，文本限制输入框的文本限制ps:1-100（默认不限制）
placeholder：提示信息
number_limit：（number类型限制条件）
default_value：如果这个值不为空，可以默认给这个组件赋值为default_value的值
example：示例数据
required：是否必填字段
code：对应的英文字段名
desc：详细描述（可以通过下拉展开看这个参数的详细描述）
name：表单这个字段的label

response是表示运行这个函数后会输入哪些参数，我们先展示出来即可，运行后获取到值后在给response的字段赋值
