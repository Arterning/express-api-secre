var express = require('express');
var router = express.Router();

const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const prisma = new PrismaClient();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


// 登录接口
router.post('/login', async (req, res) => {
  const { username, password, appId, appSecret } = req.body;

  // 验证 appId 和 appSecret
  const isValidApp = await validateAppIdAndSecret(appId, appSecret);
  if (!isValidApp) {
    return res.status(401).json({ message: 'Invalid App ID or App Secret' });
  }

  // 根据用户名和密码查询用户
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  // 验证用户信息
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // 返回登录成功的信息
  return res.json({ user, message: 'Login successful' });
});


// 注册接口
router.post('/register', async (req, res) => {
  const { username, password, email, appId, appSecret } = req.body;

  // 验证 appId 和 appSecret
  const isValidApp = await validateAppIdAndSecret(appId, appSecret);
  if (!isValidApp) {
    return res.status(401).json({ message: 'Invalid App ID or App Secret' });
  }

  // 创建新用户
  const newUser = await prisma.user.create({
    data: {
      username: username,
      password: password,
      email: email,
    },
  });

  // 返回注册成功的信息
  return res.json({ message: 'Registration successful', user: newUser });
});


// add appId and appSecret
router.post('/addApp', async (req, res) => {
  const { appId, appSecret } = req.body;

  // save to db
  const newApp = await prisma.appSecret.create({
    data: {
      appId: appId,
      secret: appSecret,
    },
  });

  return res.json({ message: 'App added successfully', app: newApp });

});


// 验证 appId 和 appSecret 的逻辑
async function validateAppIdAndSecret(appId, appSecret) {
  // 根据 appId 查询对应的 appSecret（这里假设有一个存储 appId 和 appSecret 的数据表）
  const storedAppSecret = await prisma.appSecret.findFirst({
    where: {
      appId: appId,
    },
  });

  // 验证 appId
  if (!storedAppSecret) {
    return false;
  }
  
  // 验证 appSecret
  if (storedAppSecret.secret !== appSecret) {
    return false;
  }

  return true;
}



module.exports = router;
