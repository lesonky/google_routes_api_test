# Google Maps Routes API 测试工具

这是一个用于测试 Google Maps Platform Routes API 的网页应用。该应用允许用户输入起点和终点地址，选择出行方式和路线偏好，然后获取详细的路线规划信息。

## 功能特点

- 🗺️ 交互式地图显示
- 🚗 多种出行方式选择
  - 驾车
  - 自行车
  - 步行
  - 公共交通
- 🛣️ 灵活的路线偏好设置
  - 考虑路况
  - 最优路况
  - 不考虑路况
- 📝 详细的路线信息显示
  - 总距离
  - 预计时间
  - 起点和终点坐标
  - 分步骤导航说明
- 🎯 默认路线示例
  - 起点：北京天安门
  - 终点：北京港中旅维景国际大酒店

## 技术栈

- HTML5
- CSS3
- JavaScript
- Google Maps Platform API
  - Maps JavaScript API
  - Routes API
  - Geometry Library

## 配置说明

### API 密钥配置

1. 获取 Google Maps Platform API 密钥
   - 访问 [Google Cloud Console](https://console.cloud.google.com/)
   - 创建新项目或选择现有项目
   - 启用以下 API：
     - Maps JavaScript API
     - Routes API
     - Geometry Library
   - 创建凭据（API 密钥）
   - 设置 API 密钥限制（必须，否则前端无法通过请求来调用 Routes API）：
     1. 在 Google Cloud Console 中选择您的 API 密钥
     2. 在"应用程序限制"部分，选择"HTTP 引用来源（网站）"
     3. 添加以下来源（每行一个）：
        ```
        http://localhost:8000
        http://127.0.0.1:8000
        ```
     4. 如果部署到生产环境，请添加您的域名，例如：
        ```
        https://your-domain.com
        ```

2. 配置 API 密钥
   方法一：通过环境变量（推荐）
   ```bash
   # Linux/macOS
   export GOOGLE_MAPS_API_KEY='你的API密钥'
   
   # Windows
   set GOOGLE_MAPS_API_KEY=你的API密钥
   ```

   方法二：在 HTML 中配置
   ```html
   <script>
     window.GOOGLE_MAPS_API_KEY = '你的API密钥';
   </script>
   ```

## 使用方法

### 本地开发

1. 克隆项目到本地：
   ```bash
   git clone [项目地址]
   cd gmp_router_api_test
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 配置 API 密钥（见上方配置说明）

4. 启动开发服务器：
   ```bash
   npm start
   ```

5. 在浏览器中访问：
   ```
   http://localhost:8000
   ```

6. 使用应用：
   - 输入起点和终点地址（或使用默认值）
   - 选择出行方式
   - 选择路线偏好
   - 点击"计算路线"按钮
   - 查看地图上的路线和详细信息

### Cloud Run 部署

1. 确保已安装并配置 [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)

2. 设置项目 ID：
   ```bash
   export PROJECT_ID=你的项目ID
   ```

3. 构建 Docker 镜像：
   ```bash
   gcloud builds submit --tag gcr.io/$PROJECT_ID/gmp-router-api-test
   ```

4. 部署到 Cloud Run：
   ```bash
   gcloud run deploy gmp-router-api-test \
     --image gcr.io/$PROJECT_ID/gmp-router-api-test \
     --platform managed \
     --region asia-east1 \
     --allow-unauthenticated \
     --set-env-vars GOOGLE_MAPS_API_KEY=你的API密钥
   ```

5. 部署完成后，Cloud Run 会提供一个 HTTPS 网址，请将该网址添加到 API 密钥的 HTTP 引用来源限制中

## 注意事项

- 使用前请确保已获取有效的 Google Maps Platform API 密钥
- API 密钥需要启用以下服务：
  - Maps JavaScript API
  - Routes API
  - Geometry Library
- 请遵守 Google Maps Platform 的使用条款和配额限制
- 请妥善保管您的 API 密钥，不要将其提交到版本控制系统
- 由于 Routes API 需要在前端调用，必须正确配置 HTTP 引用来源限制
- 本地开发时请确保添加了 `http://localhost:8000` 和 `http://127.0.0.1:8000` 到允许的引用来源列表中
- 部署到 Cloud Run 后，请将 Cloud Run 提供的 HTTPS 网址添加到 API 密钥的引用来源限制中

## 开发说明

- `index.html`: 主页面结构
- `styles.css`: 页面样式
- `script.js`: 主要业务逻辑
- `test-routes.js`: Routes API 测试脚本（配置了API 密钥限制后，该脚本应该**跑不通**）
- `Dockerfile`: Cloud Run 部署配置

## 许可证

ISC 