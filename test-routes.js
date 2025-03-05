const fetch = require('node-fetch');

// 从环境变量获取 API 密钥
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const BASE_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

async function testRoutes() {
    if (!API_KEY) {
        console.error('错误: 未设置 GOOGLE_MAPS_API_KEY 环境变量');
        return;
    }

    const requestBody = {
        origin: {
            address: "北京天安门"
        },
        destination: {
            address: "北京故宫"
        },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: true,
        routeModifiers: {
            vehicleInfo: {
                emissionType: "GASOLINE"
            }
        },
        languageCode: "zh-CN",
        units: "METRIC"
    };

    try {
        console.log('发送请求...');
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': API_KEY,
                'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.legs,routes.polyline.encodedPolyline',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('响应状态:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('错误详情:', JSON.stringify(errorData, null, 2));
            return;
        }

        const data = await response.json();
        console.log('响应数据:', JSON.stringify(data, null, 2));

        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const leg = route.legs[0];
            
            console.log('\n路线详情:');
            console.log(`总距离: ${(route.distanceMeters / 1000).toFixed(2)} 公里`);
            console.log(`预计时间: ${formatDuration(parseInt(route.duration))}`);
            console.log(`起点地址: ${requestBody.origin.address}`);
            console.log(`终点地址: ${requestBody.destination.address}`);
            
            if (leg.steps) {
                console.log('\n详细路线:');
                leg.steps.forEach((step, index) => {
                    console.log(`\n步骤 ${index + 1}:`);
                    console.log(`说明: ${step.navigationInstruction.instructions}`);
                    console.log(`距离: ${(step.distanceMeters / 1000).toFixed(2)} 公里`);
                    console.log(`时间: ${formatDuration(parseInt(step.staticDuration))}`);
                });
            }
        } else {
            console.log('未找到路线');
        }
    } catch (error) {
        console.error('请求错误:', error);
    }
}

function formatDuration(duration) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    let result = '';
    if (hours > 0) result += `${hours}小时`;
    if (minutes > 0) result += `${minutes}分钟`;
    if (seconds > 0) result += `${seconds}秒`;
    
    return result || '小于1秒';
}

// 运行测试
testRoutes(); 