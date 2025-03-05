// 从全局变量获取 API 密钥
const API_KEY = window.GOOGLE_MAPS_API_KEY;
const BASE_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

// 初始化地图
let map;

function initMap() {
    // 创建地图实例
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 39.9042, lng: 116.4074 }, // 默认中心点（北京）
        zoom: 12
    });
}

// 计算路线
async function calculateRoute() {
    if (!API_KEY) {
        alert('请先配置 Google Maps API 密钥');
        return;
    }

    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const travelMode = document.getElementById('travelMode').value;
    const routingPreference = document.getElementById('routingPreference').value;

    if (!origin || !destination) {
        alert('请输入起点和终点地址');
        return;
    }

    const requestBody = {
        origin: {
            address: origin
        },
        destination: {
            address: destination
        },
        travelMode: travelMode,
        routingPreference: routingPreference,
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
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': API_KEY,
                'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.legs,routes.polyline.encodedPolyline',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const leg = route.legs[0];
            
            // 显示路线详情
            const routeDetails = document.getElementById('routeDetails');
            routeDetails.innerHTML = `
                <div class="route-summary">
                    <h3>路线概览</h3>
                    <p><strong>总距离：</strong>${leg.localizedValues.distance.text}</p>
                    <p><strong>预计时间：</strong>${leg.localizedValues.duration.text}</p>
                    <p><strong>起点坐标：</strong>${leg.startLocation.latLng.latitude.toFixed(6)}, ${leg.startLocation.latLng.longitude.toFixed(6)}</p>
                    <p><strong>终点坐标：</strong>${leg.endLocation.latLng.latitude.toFixed(6)}, ${leg.endLocation.latLng.longitude.toFixed(6)}</p>
                </div>
                <div class="steps">
                    <h3>详细路线</h3>
                    ${leg.steps.map((step, index) => `
                        <div class="step">
                            <div class="step-header">
                                <span class="step-number">${index + 1}</span>
                                <span class="step-maneuver">${getManeuverIcon(step.navigationInstruction?.maneuver || 'UNKNOWN')}</span>
                            </div>
                            <p class="step-instruction">${step.navigationInstruction?.instructions || '继续前行'}</p>
                            <div class="step-details">
                                <p>距离：${step.localizedValues?.distance?.text || `${(step.distanceMeters / 1000).toFixed(2)} 公里`}</p>
                                <p>时间：${step.localizedValues?.staticDuration?.text || formatDuration(parseInt(step.staticDuration))}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            // 在地图上显示路线
            if (map) {
                // 清除之前的路线
                if (window.currentPolyline) {
                    window.currentPolyline.setMap(null);
                }

                // 创建新的路线
                const path = leg.steps.map(step => {
                    const points = google.maps.geometry.encoding.decodePath(step.polyline.encodedPolyline);
                    return points;
                }).flat();

                window.currentPolyline = new google.maps.Polyline({
                    path: path,
                    geodesic: true,
                    strokeColor: '#4285f4',
                    strokeOpacity: 0.8,
                    strokeWeight: 3
                });

                window.currentPolyline.setMap(map);

                // 计算边界
                const bounds = new google.maps.LatLngBounds();
                path.forEach(point => bounds.extend(point));
                
                // 添加一些边距
                const padding = {
                    top: 50,
                    right: 50,
                    bottom: 50,
                    left: 50
                };

                map.fitBounds(bounds, padding);
            }
        } else {
            throw new Error('未找到路线');
        }
    } catch (error) {
        console.error('路线计算错误：', error);
        alert('无法计算路线，请检查地址是否正确');
    }
}

// 获取导航动作图标
function getManeuverIcon(maneuver) {
    const icons = {
        'DEPART': '🚗',
        'TURN_RIGHT': '↪️',
        'TURN_LEFT': '↩️',
        'TURN_SLIGHT_RIGHT': '↗️',
        'TURN_SLIGHT_LEFT': '↖️',
        'TURN_SHARP_RIGHT': '⤴️',
        'TURN_SHARP_LEFT': '⤵️',
        'NAME_CHANGE': '🛣️',
        'MERGE': '🔄',
        'FORK': '🔀',
        'ARRIVE': '🏁',
        'UNKNOWN': '📍'
    };
    return icons[maneuver] || '📍';
}

// 格式化持续时间
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

// 页面加载完成后初始化
window.onload = function() {
    // 加载 Google Maps API（仅用于显示地图）
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);

    // 添加按钮点击事件
    document.getElementById('calculateRoute').addEventListener('click', calculateRoute);
}; 