import { defineFakeRoute } from "vite-plugin-fake-server/client";

export default defineFakeRoute([
  // 用户管理
  {
    url: "/user",
    method: "post",
    response: ({ body }) => {
      let list = [
        {
          avatar: "https://avatars.githubusercontent.com/u/44761321",
          username: "admin",
          nickname: "管理员",
          phone: "15888886789",
          email: "admin@kirameku.com",
          sex: 0,
          id: 1,
          status: 1,
          dept: { id: 103, name: "研发部门" },
          remark: "管理员",
          createTime: 1605456000000
        },
        {
          avatar: "https://avatars.githubusercontent.com/u/52823142",
          username: "common",
          nickname: "普通用户",
          phone: "18288882345",
          email: "common@kirameku.com",
          sex: 1,
          id: 2,
          status: 1,
          dept: { id: 105, name: "测试部门" },
          remark: "普通用户",
          createTime: 1605456000000
        }
      ];
      list = list.filter(item => item.username.includes(body?.username));
      list = list.filter(item =>
        String(item.status).includes(String(body?.status))
      );
      if (body.phone) list = list.filter(item => item.phone === body.phone);
      if (body.deptId) list = list.filter(item => item.dept.id === body.deptId);
      return {
        code: 0,
        message: "操作成功",
        data: { list, total: list.length, pageSize: 10, currentPage: 1 }
      };
    }
  },
  // 用户管理-获取所有角色列表
  {
    url: "/list-all-role",
    method: "get",
    response: () => ({
      code: 0,
      message: "操作成功",
      data: [
        { id: 1, name: "超级管理员" },
        { id: 2, name: "普通角色" }
      ]
    })
  },
  // 用户管理-根据 userId 获取对应角色 id 列表
  {
    url: "/list-role-ids",
    method: "post",
    response: ({ body }) => {
      if (body.userId == 1) return { code: 0, message: "操作成功", data: [1] };
      if (body.userId == 2) return { code: 0, message: "操作成功", data: [2] };
      return { code: 10001, message: "请求参数缺失或格式不正确", data: [] };
    }
  },
  // 角色管理
  {
    url: "/role",
    method: "post",
    response: ({ body }) => {
      let list = [
        {
          createTime: 1605456000000,
          updateTime: 1684512000000,
          id: 1,
          name: "超级管理员",
          code: "admin",
          status: 1,
          remark: "超级管理员拥有最高权限"
        },
        {
          createTime: 1605456000000,
          updateTime: 1684512000000,
          id: 2,
          name: "普通角色",
          code: "common",
          status: 1,
          remark: "普通角色拥有部分权限"
        }
      ];
      list = list.filter(item => item.name.includes(body?.name));
      list = list.filter(item =>
        String(item.status).includes(String(body?.status))
      );
      if (body.code) list = list.filter(item => item.code === body.code);
      return {
        code: 0,
        message: "操作成功",
        data: { list, total: list.length, pageSize: 10, currentPage: 1 }
      };
    }
  },
  // 角色管理-权限-菜单权限
  {
    url: "/role-menu",
    method: "post",
    response: () => ({
      code: 0,
      message: "操作成功",
      data: [
        { parentId: 0, id: 200, menuType: 0, title: "menus.purePermission" },
        { parentId: 200, id: 201, menuType: 0, title: "menus.purePermissionPage" },
        { parentId: 200, id: 202, menuType: 0, title: "menus.purePermissionButton" },
        { parentId: 202, id: 203, menuType: 3, title: "添加" },
        { parentId: 202, id: 204, menuType: 3, title: "修改" },
        { parentId: 202, id: 205, menuType: 3, title: "删除" },
        { parentId: 0, id: 300, menuType: 0, title: "menus.pureSysManagement" },
        { parentId: 300, id: 301, menuType: 0, title: "menus.pureUser" },
        { parentId: 300, id: 302, menuType: 0, title: "menus.pureRole" },
        { parentId: 300, id: 303, menuType: 0, title: "menus.pureSystemMenu" },
        { parentId: 300, id: 304, menuType: 0, title: "menus.pureDept" },
        { parentId: 0, id: 400, menuType: 0, title: "menus.pureSysMonitor" },
        { parentId: 400, id: 401, menuType: 0, title: "menus.pureOnlineUser" },
        { parentId: 400, id: 402, menuType: 0, title: "menus.pureLoginLog" },
        { parentId: 400, id: 403, menuType: 0, title: "menus.pureOperationLog" },
        { parentId: 400, id: 404, menuType: 0, title: "menus.pureSystemLog" }
      ]
    })
  },
  // 角色管理-权限-菜单权限-根据角色 id 查对应菜单
  {
    url: "/role-menu-ids",
    method: "post",
    response: ({ body }) => {
      if (body.id == 1)
        return {
          code: 0,
          message: "操作成功",
          data: [200, 201, 202, 203, 204, 205, 300, 301, 302, 303, 304, 400, 401, 402, 403, 404]
        };
      if (body.id == 2)
        return { code: 0, message: "操作成功", data: [404] };
    }
  },
  // 菜单管理
  {
    url: "/menu",
    method: "post",
    response: () => ({
      code: 0,
      message: "操作成功",
      data: [
        {
          parentId: 0, id: 200, menuType: 0, title: "menus.purePermission",
          name: "PurePermission", path: "/permission", component: "", rank: 9,
          redirect: "", icon: "ep:lollipop", extraIcon: "", enterTransition: "",
          leaveTransition: "", activePath: "", auths: "", frameSrc: "",
          frameLoading: true, keepAlive: false, hiddenTag: false, fixedTag: false,
          showLink: true, showParent: false
        },
        {
          parentId: 200, id: 201, menuType: 0, title: "menus.purePermissionPage",
          name: "PermissionPage", path: "/permission/page/index", component: "",
          rank: null, redirect: "", icon: "", extraIcon: "", enterTransition: "",
          leaveTransition: "", activePath: "", auths: "", frameSrc: "",
          frameLoading: true, keepAlive: false, hiddenTag: false, fixedTag: false,
          showLink: true, showParent: false
        },
        {
          parentId: 200, id: 202, menuType: 0, title: "menus.purePermissionButton",
          name: "PermissionButton", path: "/permission/button", component: "",
          rank: null, redirect: "", icon: "", extraIcon: "", enterTransition: "",
          leaveTransition: "", activePath: "", auths: "", frameSrc: "",
          frameLoading: true, keepAlive: false, hiddenTag: false, fixedTag: false,
          showLink: true, showParent: false
        },
        {
          parentId: 202, id: 203, menuType: 0, title: "menus.purePermissionButtonRouter",
          name: "PermissionButtonRouter", path: "/permission/button/router",
          component: "permission/button/index", rank: null, redirect: "", icon: "",
          extraIcon: "", enterTransition: "", leaveTransition: "", activePath: "",
          auths: "", frameSrc: "", frameLoading: true, keepAlive: false,
          hiddenTag: false, fixedTag: false, showLink: true, showParent: false
        },
        {
          parentId: 203, id: 210, menuType: 3, title: "添加", name: "", path: "",
          component: "", rank: null, redirect: "", icon: "", extraIcon: "",
          enterTransition: "", leaveTransition: "", activePath: "",
          auths: "permission:btn:add", frameSrc: "", frameLoading: true,
          keepAlive: false, hiddenTag: false, fixedTag: false, showLink: true,
          showParent: false
        },
        {
          parentId: 203, id: 211, menuType: 3, title: "修改", name: "", path: "",
          component: "", rank: null, redirect: "", icon: "", extraIcon: "",
          enterTransition: "", leaveTransition: "", activePath: "",
          auths: "permission:btn:edit", frameSrc: "", frameLoading: true,
          keepAlive: false, hiddenTag: false, fixedTag: false, showLink: true,
          showParent: false
        },
        {
          parentId: 203, id: 212, menuType: 3, title: "删除", name: "", path: "",
          component: "", rank: null, redirect: "", icon: "", extraIcon: "",
          enterTransition: "", leaveTransition: "", activePath: "",
          auths: "permission:btn:delete", frameSrc: "", frameLoading: true,
          keepAlive: false, hiddenTag: false, fixedTag: false, showLink: true,
          showParent: false
        },
        {
          parentId: 202, id: 204, menuType: 0, title: "menus.purePermissionButtonLogin",
          name: "PermissionButtonLogin", path: "/permission/button/login",
          component: "permission/button/perms", rank: null, redirect: "", icon: "",
          extraIcon: "", enterTransition: "", leaveTransition: "", activePath: "",
          auths: "", frameSrc: "", frameLoading: true, keepAlive: false,
          hiddenTag: false, fixedTag: false, showLink: true, showParent: false
        },
        {
          parentId: 0, id: 300, menuType: 0, title: "menus.pureSysManagement",
          name: "PureSystem", path: "/system", component: "", rank: 10,
          redirect: "", icon: "ri:settings-3-line", extraIcon: "",
          enterTransition: "", leaveTransition: "", activePath: "", auths: "",
          frameSrc: "", frameLoading: true, keepAlive: false, hiddenTag: false,
          fixedTag: false, showLink: true, showParent: false
        },
        {
          parentId: 300, id: 301, menuType: 0, title: "menus.pureUser",
          name: "SystemUser", path: "/system/user/index", component: "",
          rank: null, redirect: "", icon: "ri:admin-line", extraIcon: "",
          enterTransition: "", leaveTransition: "", activePath: "", auths: "",
          frameSrc: "", frameLoading: true, keepAlive: false, hiddenTag: false,
          fixedTag: false, showLink: true, showParent: false
        },
        {
          parentId: 300, id: 302, menuType: 0, title: "menus.pureRole",
          name: "SystemRole", path: "/system/role/index", component: "",
          rank: null, redirect: "", icon: "ri:admin-fill", extraIcon: "",
          enterTransition: "", leaveTransition: "", activePath: "", auths: "",
          frameSrc: "", frameLoading: true, keepAlive: false, hiddenTag: false,
          fixedTag: false, showLink: true, showParent: false
        },
        {
          parentId: 300, id: 303, menuType: 0, title: "menus.pureSystemMenu",
          name: "SystemMenu", path: "/system/menu/index", component: "",
          rank: null, redirect: "", icon: "ep:menu", extraIcon: "",
          enterTransition: "", leaveTransition: "", activePath: "", auths: "",
          frameSrc: "", frameLoading: true, keepAlive: false, hiddenTag: false,
          fixedTag: false, showLink: true, showParent: false
        },
        {
          parentId: 300, id: 304, menuType: 0, title: "menus.pureDept",
          name: "SystemDept", path: "/system/dept/index", component: "",
          rank: null, redirect: "", icon: "ri:git-branch-line", extraIcon: "",
          enterTransition: "", leaveTransition: "", activePath: "", auths: "",
          frameSrc: "", frameLoading: true, keepAlive: false, hiddenTag: false,
          fixedTag: false, showLink: true, showParent: false
        },
        {
          parentId: 0, id: 400, menuType: 0, title: "menus.pureSysMonitor",
          name: "PureMonitor", path: "/monitor", component: "", rank: 11,
          redirect: "", icon: "ep:monitor", extraIcon: "", enterTransition: "",
          leaveTransition: "", activePath: "", auths: "", frameSrc: "",
          frameLoading: true, keepAlive: false, hiddenTag: false, fixedTag: false,
          showLink: true, showParent: false
        },
        {
          parentId: 400, id: 401, menuType: 0, title: "menus.pureOnlineUser",
          name: "OnlineUser", path: "/monitor/online-user",
          component: "monitor/online/index", rank: null, redirect: "",
          icon: "ri:user-voice-line", extraIcon: "", enterTransition: "",
          leaveTransition: "", activePath: "", auths: "", frameSrc: "",
          frameLoading: true, keepAlive: false, hiddenTag: false, fixedTag: false,
          showLink: true, showParent: false
        },
        {
          parentId: 400, id: 402, menuType: 0, title: "menus.pureLoginLog",
          name: "LoginLog", path: "/monitor/login-logs",
          component: "monitor/logs/login/index", rank: null, redirect: "",
          icon: "ri:window-line", extraIcon: "", enterTransition: "",
          leaveTransition: "", activePath: "", auths: "", frameSrc: "",
          frameLoading: true, keepAlive: false, hiddenTag: false, fixedTag: false,
          showLink: true, showParent: false
        },
        {
          parentId: 400, id: 403, menuType: 0, title: "menus.pureOperationLog",
          name: "OperationLog", path: "/monitor/operation-logs",
          component: "monitor/logs/operation/index", rank: null, redirect: "",
          icon: "ri:history-fill", extraIcon: "", enterTransition: "",
          leaveTransition: "", activePath: "", auths: "", frameSrc: "",
          frameLoading: true, keepAlive: false, hiddenTag: false, fixedTag: false,
          showLink: true, showParent: false
        },
        {
          parentId: 400, id: 404, menuType: 0, title: "menus.pureSystemLog",
          name: "SystemLog", path: "/monitor/system-logs",
          component: "monitor/logs/system/index", rank: null, redirect: "",
          icon: "ri:file-search-line", extraIcon: "", enterTransition: "",
          leaveTransition: "", activePath: "", auths: "", frameSrc: "",
          frameLoading: true, keepAlive: false, hiddenTag: false, fixedTag: false,
          showLink: true, showParent: false
        }
      ]
    })
  },
  // 部门管理
  {
    url: "/dept",
    method: "post",
    response: () => ({
      code: 0,
      message: "操作成功",
      data: [
        { name: "杭州总公司", parentId: 0, id: 100, sort: 0, phone: "15888888888", principal: "张三", email: "admin@kirameku.com", status: 1, type: 1, createTime: 1605456000000, remark: "总公司" },
        { name: "郑州分公司", parentId: 100, id: 101, sort: 1, phone: "15888888888", principal: "李四", email: "zhengzhou@kirameku.com", status: 1, type: 2, createTime: 1605456000000, remark: "分公司" },
        { name: "研发部门", parentId: 101, id: 103, sort: 1, phone: "15888888888", principal: "王五", email: "dev@kirameku.com", status: 1, type: 3, createTime: 1605456000000, remark: "研发部门" },
        { name: "市场部门", parentId: 102, id: 108, sort: 1, phone: "15888888888", principal: "赵六", email: "market@kirameku.com", status: 1, type: 3, createTime: 1605456000000, remark: "市场部门" },
        { name: "深圳分公司", parentId: 100, id: 102, sort: 2, phone: "15888888888", principal: "孙七", email: "shenzhen@kirameku.com", status: 1, type: 2, createTime: 1605456000000, remark: "分公司" },
        { name: "测试部门", parentId: 101, id: 105, sort: 3, phone: "15888888888", principal: "周八", email: "test@kirameku.com", status: 0, type: 3, createTime: 1605456000000, remark: "测试部门" }
      ]
    })
  },
  // 在线用户
  {
    url: "/online-logs",
    method: "post",
    response: ({ body }) => {
      let list = [
        { id: 1, username: "admin", ip: "192.168.1.100", address: "中国河南省信阳市", system: "macOS", browser: "Chrome", loginTime: new Date() },
        { id: 2, username: "common", ip: "192.168.1.101", address: "中国广东省深圳市", system: "Windows", browser: "Firefox", loginTime: new Date() }
      ];
      list = list.filter(item => item.username.includes(body?.username));
      return {
        code: 0, message: "操作成功",
        data: { list, total: list.length, pageSize: 10, currentPage: 1 }
      };
    }
  },
  // 登录日志
  {
    url: "/login-logs",
    method: "post",
    response: ({ body }) => {
      let list = [
        { id: 1, username: "admin", ip: "192.168.1.100", address: "中国河南省信阳市", system: "macOS", browser: "Chrome", status: 1, behavior: "账号登录", loginTime: new Date() },
        { id: 2, username: "common", ip: "192.168.1.101", address: "中国广东省深圳市", system: "Windows", browser: "Firefox", status: 0, behavior: "第三方登录", loginTime: new Date() }
      ];
      list = list.filter(item => item.username.includes(body?.username));
      list = list.filter(item => String(item.status).includes(String(body?.status)));
      return {
        code: 0, message: "操作成功",
        data: { list, total: list.length, pageSize: 10, currentPage: 1 }
      };
    }
  },
  // 操作日志
  {
    url: "/operation-logs",
    method: "post",
    response: ({ body }) => {
      let list = [
        { id: 1, username: "admin", ip: "192.168.1.100", address: "中国河南省信阳市", system: "macOS", browser: "Chrome", status: 1, summary: "菜单管理-添加菜单", module: "系统管理", operatingTime: new Date() },
        { id: 2, username: "common", ip: "192.168.1.101", address: "中国广东省深圳市", system: "Windows", browser: "Firefox", status: 0, summary: "列表分页查询", module: "在线用户", operatingTime: new Date() }
      ];
      list = list.filter(item => item.module.includes(body?.module));
      list = list.filter(item => String(item.status).includes(String(body?.status)));
      return {
        code: 0, message: "操作成功",
        data: { list, total: list.length, pageSize: 10, currentPage: 1 }
      };
    }
  },
  // 系统日志
  {
    url: "/system-logs",
    method: "post",
    response: ({ body }) => {
      let list = [
        { id: 1, level: 1, module: "菜单管理", url: "/menu", method: "post", ip: "192.168.1.100", address: "中国河南省信阳市", system: "macOS", browser: "Chrome", takesTime: 10, requestTime: new Date() },
        { id: 2, level: 0, module: "系统管理", url: "/get-system-info", method: "get", ip: "192.168.1.101", address: "中国广东省深圳市", system: "Windows", browser: "Firefox", takesTime: 1200, requestTime: new Date() }
      ];
      list = list.filter(item => item.module.includes(body?.module));
      return {
        code: 0, message: "操作成功",
        data: { list, total: list.length, pageSize: 10, currentPage: 1 }
      };
    }
  }
]);
