# 使用 Node.js 官方镜像作为基础镜像
FROM node:18-slim

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制所有源代码
COPY . .

# 暴露端口
EXPOSE 8000

# 设置环境变量
ENV NODE_ENV=production

# 启动命令
CMD ["npm", "start"] 