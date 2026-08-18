/**
 * 臺中市 Section_ID (路段代號) -> 真實路段名稱與起訖/轉角標記 靜態對照字典檔
 * 由向量地圖幾何距離反查產生，支援路口轉角標記與 fallback 保護機制。
 */

export interface TaichungSectionInfo {
  roadName: string;
  district: string;
  isApproximate?: boolean;
  riskNote?: string;
}

export const TAICHUNG_SECTION_MAP: Record<string, TaichungSectionInfo> = {
  "1423501": {
    "roadName": "健行北路",
    "district": "烏日區"
  },
  "1433301": {
    "roadName": "三榮十三路",
    "district": "烏日區"
  },
  "1433401": {
    "roadName": "三榮七路",
    "district": "烏日區"
  },
  "1458101": {
    "roadName": "榮和路",
    "district": "烏日區"
  },
  "3705201": {
    "roadName": "大明路",
    "district": "大里區"
  },
  "3748801": {
    "roadName": "新光路",
    "district": "大里區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「新光路」(3.8m), 次路名「益民路一段62巷」(11.9m)"
  },
  "3748902": {
    "roadName": "新芳路",
    "district": "大里區"
  },
  "3767501": {
    "roadName": "德芳路二段",
    "district": "大里區"
  },
  "3767502": {
    "roadName": "德芳路一段",
    "district": "大里區"
  },
  "3767601": {
    "roadName": "德芳南路",
    "district": "大里區"
  },
  "3768601": {
    "roadName": "德芳南三街",
    "district": "大里區"
  },
  "3785801": {
    "roadName": "東榮路一段",
    "district": "大里區"
  },
  "4542701": {
    "roadName": "新平路二段",
    "district": "太平區"
  },
  "4547201": {
    "roadName": "新興路",
    "district": "太平區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「新興路」(4.6m), 次路名「新光國小旁人行道」(7.0m)"
  },
  "4556002": {
    "roadName": "市民大道一段",
    "district": "東區"
  },
  "4556003": {
    "roadName": "市民大道一段",
    "district": "太平區"
  },
  "5401402": {
    "roadName": "三光巷",
    "district": "北屯區"
  },
  "5424001": {
    "roadName": "崇德十九路",
    "district": "北屯區"
  },
  "5424104": {
    "roadName": "崇德路二段",
    "district": "北屯區"
  },
  "5424105": {
    "roadName": "崇德路二段",
    "district": "北屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「崇德路二段」(3.7m), 次路名「崇德路二段268巷」(13.3m)"
  },
  "5424106": {
    "roadName": "崇德路二段",
    "district": "北屯區"
  },
  "5424107": {
    "roadName": "崇德路三段",
    "district": "北屯區"
  },
  "5424108": {
    "roadName": "崇德路三段",
    "district": "北屯區"
  },
  "5424109": {
    "roadName": "崇德路三段",
    "district": "北屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「崇德路三段」(4.5m), 次路名「崇德十七路」(11.9m)"
  },
  "5432101": {
    "roadName": "敦富七街",
    "district": "北屯區"
  },
  "5436301": {
    "roadName": "北屯路大成巷",
    "district": "北屯區"
  },
  "5440406": {
    "roadName": "中清路二段",
    "district": "北屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「中清路二段」(15.6m), 次路名「雷中街」(23.5m)"
  },
  "5440417": {
    "roadName": "中清路二段",
    "district": "北屯區"
  },
  "5444131": {
    "roadName": "文心路四段",
    "district": "北屯區"
  },
  "5447103": {
    "roadName": "天津路三段",
    "district": "北屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「天津路三段」(3.0m), 次路名「梅川東路四段」(12.6m)"
  },
  "5448101": {
    "roadName": "文昌東三街",
    "district": "北屯區"
  },
  "5449001": {
    "roadName": "長生巷3弄",
    "district": "北屯區"
  },
  "5450201": {
    "roadName": "漢口路五段",
    "district": "北屯區"
  },
  "5453301": {
    "roadName": "昌平路二段156巷",
    "district": "北屯區"
  },
  "5453400": {
    "roadName": "北屯路",
    "district": "北屯區"
  },
  "5453401": {
    "roadName": "北屯路",
    "district": "北屯區"
  },
  "5453402": {
    "roadName": "北屯路",
    "district": "北屯區"
  },
  "5453413": {
    "roadName": "北屯路",
    "district": "北區"
  },
  "5453801": {
    "roadName": "四平路",
    "district": "北屯區"
  },
  "5454304": {
    "roadName": "北平路三段",
    "district": "北屯區"
  },
  "5456301": {
    "roadName": "北屯路212巷",
    "district": "北屯區"
  },
  "5464002": {
    "roadName": "后庄七街",
    "district": "北屯區"
  },
  "5465901": {
    "roadName": "后庄北路",
    "district": "北屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「后庄北路」(39.0m), 次路名「后庄北路240巷」(40.1m)"
  },
  "5465911": {
    "roadName": "同榮路",
    "district": "北屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「同榮路」(3.2m), 次路名「中清路二段1226巷30弄」(4.8m)"
  },
  "5480902": {
    "roadName": "東山路一段156-11巷",
    "district": "北屯區"
  },
  "5483903": {
    "roadName": "東光路",
    "district": "北屯區"
  },
  "5484101": {
    "roadName": "河北二街",
    "district": "北屯區"
  },
  "5486601": {
    "roadName": "松竹北二街",
    "district": "北屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「松竹北二街」(2.2m), 次路名「松竹路三段」(9.0m)"
  },
  "5495611": {
    "roadName": "洲際路",
    "district": "北屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「洲際路」(9.1m), 次路名「洲際一街」(13.3m)"
  },
  "5497500": {
    "roadName": "北屯路426之8巷",
    "district": "北屯區"
  },
  "6342101": {
    "roadName": "中山路二段237巷",
    "district": "潭子區"
  },
  "6356303": {
    "roadName": "福潭路",
    "district": "潭子區"
  },
  "6400803": {
    "roadName": "順平三街",
    "district": "西屯區"
  },
  "6403001": {
    "roadName": "臺灣大道三段686巷",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「臺灣大道三段686巷」(11.3m), 次路名「上安路173巷」(11.5m)"
  },
  "6403801": {
    "roadName": "福科路340巷",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「福科路340巷」(4.5m), 次路名「福泰街」(7.7m)"
  },
  "6420201": {
    "roadName": "凱旋一街",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「凱旋一街」(5.8m), 次路名「逢大路」(8.6m)"
  },
  "6423601": {
    "roadName": "逢甲路",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「逢甲路」(32.1m), 次路名「西屯路二段293巷」(36.7m)"
  },
  "6426501": {
    "roadName": "寶慶街50巷",
    "district": "西屯區"
  },
  "6430101": {
    "roadName": "大恩街",
    "district": "西屯區"
  },
  "6430402": {
    "roadName": "大隆路",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「大隆路」(0.7m), 次路名「大進街」(7.4m)"
  },
  "6430403": {
    "roadName": "大隆路",
    "district": "西屯區"
  },
  "6430801": {
    "roadName": "朝富路",
    "district": "西屯區"
  },
  "6430802": {
    "roadName": "朝富路",
    "district": "西屯區"
  },
  "6431201": {
    "roadName": "朝貴路",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「朝貴路」(8.0m), 次路名「朝馬路」(13.8m)"
  },
  "6432201": {
    "roadName": "凱旋路",
    "district": "西屯區"
  },
  "6432331": {
    "roadName": "凱旋三街",
    "district": "西屯區"
  },
  "6432351": {
    "roadName": "凱旋五街",
    "district": "西屯區"
  },
  "6433201": {
    "roadName": "智惠街",
    "district": "西屯區"
  },
  "6434302": {
    "roadName": "惠中路一段",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「惠中路一段」(0.9m), 次路名「市政北一路」(4.6m)"
  },
  "6434307": {
    "roadName": "路段 #6434307",
    "district": "其他區",
    "isApproximate": true,
    "riskNote": "距離最近道路仍超出一範圍 (308469.8m)"
  },
  "6434313": {
    "roadName": "惠中路二段",
    "district": "西屯區"
  },
  "6434801": {
    "roadName": "惠民路",
    "district": "西屯區"
  },
  "6434901": {
    "roadName": "上安路",
    "district": "西屯區"
  },
  "6435201": {
    "roadName": "大墩路",
    "district": "西屯區"
  },
  "6435212": {
    "roadName": "大墩路",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「大墩路」(4.0m), 次路名「大墩十八街」(7.0m)"
  },
  "6435702": {
    "roadName": "上石路",
    "district": "西屯區"
  },
  "6440417": {
    "roadName": "中清路二段",
    "district": "西屯區"
  },
  "6444132": {
    "roadName": "停車場徑",
    "district": "西屯區"
  },
  "6444133": {
    "roadName": "文心路二段",
    "district": "西屯區"
  },
  "6450204": {
    "roadName": "漢口路二段",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「漢口路二段」(1.5m), 次路名「寧漢三街」(3.3m)"
  },
  "6450205": {
    "roadName": "漢口路二段",
    "district": "西屯區"
  },
  "6450206": {
    "roadName": "漢口路二段",
    "district": "西屯區"
  },
  "6450207": {
    "roadName": "大有二街",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「大有二街」(16.9m), 次路名「大有東街」(18.6m)"
  },
  "6450802": {
    "roadName": "寧夏東七街",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「寧夏東七街」(3.5m), 次路名「寧夏路96巷」(3.7m)"
  },
  "6451002": {
    "roadName": "漢翔路",
    "district": "西屯區"
  },
  "6451203": {
    "roadName": "福康路119巷",
    "district": "西屯區"
  },
  "6451403": {
    "roadName": "福順路",
    "district": "西屯區"
  },
  "6451901": {
    "roadName": "漢翔東路",
    "district": "西屯區"
  },
  "6452801": {
    "roadName": "福順路295巷",
    "district": "西屯區"
  },
  "6453201": {
    "roadName": "福祥街",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「福祥街」(6.0m), 次路名「福祥街8巷」(6.1m)"
  },
  "6457101": {
    "roadName": "市政北一路",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「市政北一路」(4.1m), 次路名「惠文路」(5.9m)"
  },
  "6457102": {
    "roadName": "市政北一路",
    "district": "西屯區"
  },
  "6457201": {
    "roadName": "市政北七路",
    "district": "西屯區"
  },
  "6457301": {
    "roadName": "市政北二路",
    "district": "西屯區"
  },
  "6457401": {
    "roadName": "市政北三路",
    "district": "西屯區"
  },
  "6457402": {
    "roadName": "市政北三路",
    "district": "西屯區"
  },
  "6457501": {
    "roadName": "市政北五路",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「市政北五路」(6.4m), 次路名「惠中一街」(12.0m)"
  },
  "6457601": {
    "roadName": "市政北六路",
    "district": "西屯區"
  },
  "6457701": {
    "roadName": "市政路",
    "district": "西屯區"
  },
  "6457702": {
    "roadName": "市政路",
    "district": "西屯區"
  },
  "6457703": {
    "roadName": "市政路",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「市政路」(9.6m), 次路名「朝貴路」(19.5m)"
  },
  "6457901": {
    "roadName": "路段 #6457901",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "距離最近道路仍超出一範圍 (109.5m)"
  },
  "6458001": {
    "roadName": "寶慶街50巷",
    "district": "西屯區"
  },
  "6458003": {
    "roadName": "福星路",
    "district": "西屯區"
  },
  "6458701": {
    "roadName": "福科路",
    "district": "西屯區"
  },
  "6458702": {
    "roadName": "福林路60巷",
    "district": "西屯區"
  },
  "6459301": {
    "roadName": "玉門路",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「玉門路」(1.1m), 次路名「玉門路370巷16弄」(7.2m)"
  },
  "6460406": {
    "roadName": "上仁街",
    "district": "西屯區"
  },
  "6464703": {
    "roadName": "西屯路三段",
    "district": "西屯區"
  },
  "6464704": {
    "roadName": "西屯路三段",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「西屯路三段」(1.5m), 次路名「西屯路三段宏恩一巷」(4.3m)"
  },
  "6464705": {
    "roadName": "西屯路二段",
    "district": "西屯區"
  },
  "6465301": {
    "roadName": "西屯路二段297之8巷",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「西屯路二段297之8巷」(5.2m), 次路名「西屯路二段297之8巷12弄」(6.1m)"
  },
  "6465401": {
    "roadName": "西屯路二段126巷",
    "district": "西屯區"
  },
  "6465411": {
    "roadName": "西屯路二段180巷",
    "district": "西屯區"
  },
  "6465601": {
    "roadName": "僑大路",
    "district": "西屯區"
  },
  "6465801": {
    "roadName": "僑大八街",
    "district": "西屯區"
  },
  "6466803": {
    "roadName": "黎明路三段",
    "district": "西屯區"
  },
  "6466804": {
    "roadName": "黎明路三段",
    "district": "西屯區"
  },
  "6466805": {
    "roadName": "黎明路三段",
    "district": "西屯區"
  },
  "6466806": {
    "roadName": "黎明路二段",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「黎明路二段」(3.6m), 次路名「朝馬五街」(4.1m)"
  },
  "6466817": {
    "roadName": "黎明路二段",
    "district": "西屯區"
  },
  "6467002": {
    "roadName": "西苑路",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「西苑路」(4.5m), 次路名「西苑二街」(11.3m)"
  },
  "6469911": {
    "roadName": "西苑一街",
    "district": "西屯區"
  },
  "6480001": {
    "roadName": "青海路一段",
    "district": "西屯區"
  },
  "6480002": {
    "roadName": "青海路二段",
    "district": "西屯區"
  },
  "6480003": {
    "roadName": "青海路二段",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「青海路二段」(1.9m), 次路名「青海路二段193巷」(7.5m)"
  },
  "6480004": {
    "roadName": "青海路二段",
    "district": "西屯區"
  },
  "6480005": {
    "roadName": "青海路二段",
    "district": "西屯區"
  },
  "6480402": {
    "roadName": "東大路一段",
    "district": "西屯區"
  },
  "6484001": {
    "roadName": "忠義街",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「忠義街」(8.2m), 次路名「大弘街」(8.8m)"
  },
  "6486701": {
    "roadName": "東興路三段",
    "district": "西屯區"
  },
  "6487201": {
    "roadName": "寧夏東一街",
    "district": "西屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「寧夏東一街」(5.0m), 次路名「河南路一段」(10.8m)"
  },
  "6487203": {
    "roadName": "河南路二段",
    "district": "西屯區"
  },
  "6487204": {
    "roadName": "河南路二段",
    "district": "西屯區"
  },
  "6487205": {
    "roadName": "河南路二段",
    "district": "西屯區"
  },
  "6487207": {
    "roadName": "河南路三段",
    "district": "西屯區"
  },
  "6487208": {
    "roadName": "河南路四段",
    "district": "南屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「河南路四段」(4.2m), 次路名「惠文七街」(13.1m)"
  },
  "6739901": {
    "roadName": "復興街",
    "district": "后里區"
  },
  "6763401": {
    "roadName": "成功路",
    "district": "后里區"
  },
  "8544201": {
    "roadName": "路段 #8544201",
    "district": "和平區",
    "isApproximate": true,
    "riskNote": "距離最近道路仍超出一範圍 (34351.2m)"
  },
  "8553003": {
    "roadName": "路段 #8553003",
    "district": "和平區",
    "isApproximate": true,
    "riskNote": "距離最近道路仍超出一範圍 (38818.1m)"
  },
  "8583201": {
    "roadName": "路段 #8583201",
    "district": "和平區",
    "isApproximate": true,
    "riskNote": "距離最近道路仍超出一範圍 (38917.3m)"
  },
  "9137902": {
    "roadName": "路段 #9137902",
    "district": "豐原區",
    "isApproximate": true,
    "riskNote": "距離最近道路仍超出一範圍 (61.0m)"
  },
  "9199382": {
    "roadName": "樂天街53巷",
    "district": "豐原區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「樂天街53巷」(38.0m), 次路名「自強南街180巷」(46.1m)"
  },
  "9401380": {
    "roadName": "大業路",
    "district": "南屯區"
  },
  "9433101": {
    "roadName": "大富街",
    "district": "南屯區"
  },
  "9433505": {
    "roadName": "大業路",
    "district": "西屯區"
  },
  "9433511": {
    "roadName": "大業路",
    "district": "南屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「大業路」(1.5m), 次路名「大聖街」(7.3m)"
  },
  "9434305": {
    "roadName": "惠中路三段",
    "district": "南屯區"
  },
  "9434313": {
    "roadName": "惠中路二段",
    "district": "南屯區"
  },
  "9435203": {
    "roadName": "大墩路",
    "district": "南屯區"
  },
  "9435204": {
    "roadName": "大墩路",
    "district": "南屯區"
  },
  "9435212": {
    "roadName": "大墩路",
    "district": "南屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「大墩路」(5.1m), 次路名「大墩十六街」(10.9m)"
  },
  "9435215": {
    "roadName": "大墩路",
    "district": "南屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「大墩路」(6.9m), 次路名「大墩六街」(14.4m)"
  },
  "9440004": {
    "roadName": "公益路二段",
    "district": "南屯區"
  },
  "9440005": {
    "roadName": "公益路二段",
    "district": "南屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「公益路二段」(2.4m), 次路名「大觀路」(7.7m)"
  },
  "9440006": {
    "roadName": "河南路四段",
    "district": "南屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「河南路四段」(1.7m), 次路名「公益路二段」(6.4m)"
  },
  "9440007": {
    "roadName": "公益路二段",
    "district": "南屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「公益路二段」(4.3m), 次路名「三厝街」(6.9m)"
  },
  "9440008": {
    "roadName": "公益路二段",
    "district": "南屯區"
  },
  "9440013": {
    "roadName": "公益路二段",
    "district": "南屯區"
  },
  "9443504": {
    "roadName": "五權西路二段",
    "district": "南屯區"
  },
  "9443505": {
    "roadName": "五權西路二段",
    "district": "南屯區"
  },
  "9443506": {
    "roadName": "五權西路二段",
    "district": "南屯區"
  },
  "9443507": {
    "roadName": "五權西路二段",
    "district": "南屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「五權西路二段」(3.3m), 次路名「三厝街」(8.6m)"
  },
  "9443508": {
    "roadName": "五權西路二段",
    "district": "南屯區"
  },
  "9443513": {
    "roadName": "五權西路二段",
    "district": "南屯區"
  },
  "9444133": {
    "roadName": "文心路一段",
    "district": "南屯區"
  },
  "9445003": {
    "roadName": "文心南路",
    "district": "南屯區"
  },
  "9445004": {
    "roadName": "文心南路",
    "district": "南屯區"
  },
  "9448701": {
    "roadName": "水安街",
    "district": "南屯區"
  },
  "9456501": {
    "roadName": "市政南二路188巷",
    "district": "南屯區"
  },
  "9456603": {
    "roadName": "永春東六路",
    "district": "南屯區"
  },
  "9458300": {
    "roadName": "永春東路",
    "district": "南屯區"
  },
  "9460202": {
    "roadName": "向上南路一段",
    "district": "南屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「向上南路一段」(0.6m), 次路名「大英西二街」(5.1m)"
  },
  "9460211": {
    "roadName": "向上南路一段",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「向上南路一段」(0.3m), 次路名「大同街」(5.9m)"
  },
  "9460306": {
    "roadName": "向上路一段",
    "district": "南屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「向上路一段」(2.9m), 次路名「大光街」(9.5m)"
  },
  "9460308": {
    "roadName": "向上路二段",
    "district": "南屯區"
  },
  "9460310": {
    "roadName": "向上路三段",
    "district": "南屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「向上路三段」(1.8m), 次路名「益豐路四段」(7.3m)"
  },
  "9460315": {
    "roadName": "向上路一段",
    "district": "西區"
  },
  "9466808": {
    "roadName": "黎明路二段",
    "district": "南屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「黎明路二段」(13.7m), 次路名「大墩十二街」(14.8m)"
  },
  "9466817": {
    "roadName": "黎明路二段",
    "district": "南屯區"
  },
  "9476601": {
    "roadName": "龍德路一段",
    "district": "南屯區"
  },
  "9486702": {
    "roadName": "東興路三段",
    "district": "南屯區"
  },
  "9486703": {
    "roadName": "東興路三段",
    "district": "南屯區"
  },
  "9486714": {
    "roadName": "東興路三段",
    "district": "西區"
  },
  "9486715": {
    "roadName": "大墩六街",
    "district": "南屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「大墩六街」(2.1m), 次路名「東興路二段」(3.8m)"
  },
  "9487209": {
    "roadName": "河南路四段",
    "district": "南屯區"
  },
  "9487210": {
    "roadName": "河南路四段",
    "district": "南屯區"
  },
  "9488901": {
    "roadName": "嶺東路",
    "district": "南屯區"
  },
  "9499449": {
    "roadName": "向上路三段",
    "district": "南屯區"
  },
  "9499612": {
    "roadName": "南屯路二段415巷",
    "district": "南屯區"
  },
  "9499680": {
    "roadName": "懷德街145巷5弄",
    "district": "南屯區"
  },
  "9499943": {
    "roadName": "南屯路二段",
    "district": "南屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「南屯路二段」(34.2m), 次路名「向心南路981巷」(41.9m)"
  },
  "0434704": {
    "roadName": "三民路二段",
    "district": "中區"
  },
  "0434705": {
    "roadName": "三民路二段",
    "district": "中區"
  },
  "0440500": {
    "roadName": "中山路",
    "district": "中區"
  },
  "0440501": {
    "roadName": "中山路",
    "district": "中區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「中山路」(3.9m), 次路名「臺灣大道一段141巷」(8.9m)"
  },
  "0450000": {
    "roadName": "民權路14巷",
    "district": "中區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「民權路14巷」(3.5m), 次路名「民族路」(8.5m)"
  },
  "0450001": {
    "roadName": "民族路",
    "district": "中區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「民族路」(2.9m), 次路名「民權路80巷」(6.3m)"
  },
  "0450301": {
    "roadName": "綠川西街",
    "district": "中區"
  },
  "0450401": {
    "roadName": "綠川東街",
    "district": "中區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「綠川東街」(4.0m), 次路名「中山路」(10.3m)"
  },
  "0453602": {
    "roadName": "民權路",
    "district": "西區"
  },
  "0456802": {
    "roadName": "臺灣大道一段",
    "district": "中區"
  },
  "0456901": {
    "roadName": "市府路",
    "district": "中區"
  },
  "0456902": {
    "roadName": "市府路",
    "district": "中區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「市府路」(3.0m), 次路名「自由路二段35巷」(4.6m)"
  },
  "0459401": {
    "roadName": "福音街",
    "district": "中區"
  },
  "0460101": {
    "roadName": "光復路",
    "district": "中區"
  },
  "0463400": {
    "roadName": "成功路",
    "district": "中區"
  },
  "0463401": {
    "roadName": "成功路",
    "district": "中區"
  },
  "0463805": {
    "roadName": "自由路二段",
    "district": "中區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「自由路二段」(0.4m), 次路名「自由路二段70巷」(0.7m)"
  },
  "0463806": {
    "roadName": "自由路二段",
    "district": "中區"
  },
  "0490104": {
    "roadName": "雙十路一段",
    "district": "東區"
  },
  "0523801": {
    "roadName": "健行路",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「健行路」(1.4m), 次路名「健行路86巷」(3.4m)"
  },
  "0523802": {
    "roadName": "健行路",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「健行路」(1.3m), 次路名「大義街」(2.6m)"
  },
  "0523803": {
    "roadName": "健行路",
    "district": "北區"
  },
  "0523804": {
    "roadName": "健行路",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「健行路」(1.2m), 次路名「篤行路」(4.1m)"
  },
  "0523805": {
    "roadName": "健行路",
    "district": "北區"
  },
  "0523806": {
    "roadName": "健行路",
    "district": "北區"
  },
  "0524101": {
    "roadName": "崇德路一段",
    "district": "北區"
  },
  "0524102": {
    "roadName": "崇德路一段",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「崇德路一段」(3.7m), 次路名「崇德路一段256巷」(5.7m)"
  },
  "0524103": {
    "roadName": "崇德路一段",
    "district": "北區"
  },
  "0534502": {
    "roadName": "進化北路",
    "district": "北區"
  },
  "0534503": {
    "roadName": "進化北路",
    "district": "北區"
  },
  "0534701": {
    "roadName": "三民路三段",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「三民路三段」(4.7m), 次路名「興進路」(5.5m)"
  },
  "0534702": {
    "roadName": "三民路三段",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「三民路三段」(5.4m), 次路名「三民路三段201巷」(6.7m)"
  },
  "0534703": {
    "roadName": "三民路三段",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「三民路三段」(2.2m), 次路名「三民路三段89巷」(5.5m)"
  },
  "0536701": {
    "roadName": "博館路",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「博館路」(36.5m), 次路名「育德路」(38.4m)"
  },
  "0536712": {
    "roadName": "博館路",
    "district": "北區"
  },
  "0540401": {
    "roadName": "中清路一段",
    "district": "北區"
  },
  "0540402": {
    "roadName": "中清路一段",
    "district": "北區"
  },
  "0540403": {
    "roadName": "中清路一段",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「中清路一段」(7.1m), 次路名「中清路一段348巷」(7.4m)"
  },
  "0540404": {
    "roadName": "中清路一段",
    "district": "北區"
  },
  "0540405": {
    "roadName": "中清路一段",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「中清路一段」(4.8m), 次路名「天津路二段」(9.9m)"
  },
  "0540601": {
    "roadName": "中華路二段",
    "district": "北區"
  },
  "0543701": {
    "roadName": "五權路",
    "district": "北區"
  },
  "0543702": {
    "roadName": "五權路",
    "district": "北區"
  },
  "0543703": {
    "roadName": "五權路",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「五權路」(6.2m), 次路名「五權路315巷」(11.3m)"
  },
  "0543714": {
    "roadName": "五權路",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「五權路」(2.7m), 次路名「英士路」(5.1m)"
  },
  "0544131": {
    "roadName": "文心路四段",
    "district": "北區"
  },
  "0544132": {
    "roadName": "文心路三段",
    "district": "北屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「文心路三段」(8.9m), 次路名「北平二街」(9.7m)"
  },
  "0544401": {
    "roadName": "太平路",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「太平路」(2.1m), 次路名「太平路31巷」(8.8m)"
  },
  "0544402": {
    "roadName": "太平路",
    "district": "北區"
  },
  "0550201": {
    "roadName": "漢口路四段",
    "district": "北區"
  },
  "0550202": {
    "roadName": "漢口路四段",
    "district": "北區"
  },
  "0550203": {
    "roadName": "漢口路三段",
    "district": "北區"
  },
  "0553413": {
    "roadName": "北屯路",
    "district": "北區"
  },
  "0554303": {
    "roadName": "北平路二段",
    "district": "北區"
  },
  "0557002": {
    "roadName": "三民路三段52巷",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「三民路三段52巷」(9.6m), 次路名「太平路75巷」(18.2m)"
  },
  "0563301": {
    "roadName": "德化街",
    "district": "北區"
  },
  "0570001": {
    "roadName": "育才北路",
    "district": "北區"
  },
  "0570102": {
    "roadName": "學士路",
    "district": "北區"
  },
  "0571001": {
    "roadName": "育強街",
    "district": "北區"
  },
  "0573501": {
    "roadName": "育德路",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「育德路」(12.3m), 次路名「育德路48巷」(17.0m)"
  },
  "0576701": {
    "roadName": "錦南街",
    "district": "北區"
  },
  "0576811": {
    "roadName": "館前路",
    "district": "北區"
  },
  "0580801": {
    "roadName": "青島路三段",
    "district": "北區"
  },
  "0580809": {
    "roadName": "青島路一段",
    "district": "北區"
  },
  "0586901": {
    "roadName": "忠明路",
    "district": "北區"
  },
  "0586902": {
    "roadName": "忠明路",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「忠明路」(3.5m), 次路名「華興街」(11.7m)"
  },
  "0586903": {
    "roadName": "忠明路",
    "district": "北區"
  },
  "0586914": {
    "roadName": "忠明路",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「忠明路」(0.5m), 次路名「忠明路151巷」(3.5m)"
  },
  "0590101": {
    "roadName": "雙十路二段",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「雙十路二段」(1.8m), 次路名「雙十路二段75巷」(10.5m)"
  },
  "0590102": {
    "roadName": "雙十路二段",
    "district": "北區"
  },
  "0590103": {
    "roadName": "雙十路一段",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「雙十路一段」(8.3m), 次路名「福仁街」(9.8m)"
  },
  "0590402": {
    "roadName": "英才路",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「英才路」(3.2m), 次路名「華中街」(4.4m)"
  },
  "0590413": {
    "roadName": "英才路",
    "district": "北區"
  },
  "0593801": {
    "roadName": "美德街",
    "district": "北區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「美德街」(7.2m), 次路名「大義街」(12.3m)"
  },
  "0623807": {
    "roadName": "健行路",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「健行路」(0.4m), 次路名「健行路1021巷」(4.3m)"
  },
  "0633511": {
    "roadName": "大業路",
    "district": "南屯區"
  },
  "0634706": {
    "roadName": "三民路一段",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「三民路一段」(0.5m), 次路名「四維街」(9.4m)"
  },
  "0634717": {
    "roadName": "三民路一段",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「三民路一段」(0.0m), 次路名「三民路一段127巷」(7.8m)"
  },
  "0635215": {
    "roadName": "大墩路",
    "district": "南屯區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「大墩路」(2.2m), 次路名「大墩九街」(10.2m)"
  },
  "0636712": {
    "roadName": "博館路",
    "district": "西區"
  },
  "0638901": {
    "roadName": "博館三街",
    "district": "西區"
  },
  "0640001": {
    "roadName": "公益路",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「公益路」(0.1m), 次路名「模範街」(1.9m)"
  },
  "0640002": {
    "roadName": "公益路",
    "district": "西區"
  },
  "0640013": {
    "roadName": "公益路",
    "district": "西區"
  },
  "0640100": {
    "roadName": "公益路155巷",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「公益路155巷」(2.8m), 次路名「向上北路」(3.3m)"
  },
  "0640101": {
    "roadName": "公益路155巷",
    "district": "西區"
  },
  "0643202": {
    "roadName": "五權西五街",
    "district": "西區"
  },
  "0643401": {
    "roadName": "草悟道自行車道",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「草悟道自行車道」(10.3m), 次路名「五權西四街」(17.4m)"
  },
  "0643501": {
    "roadName": "五權西路一段",
    "district": "西區"
  },
  "0643502": {
    "roadName": "五權西路一段",
    "district": "西區"
  },
  "0643705": {
    "roadName": "五權路",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「五權路」(4.8m), 次路名「民族路」(9.2m)"
  },
  "0643706": {
    "roadName": "五權路",
    "district": "西區"
  },
  "0643707": {
    "roadName": "公舘路",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「公舘路」(10.8m), 次路名「五權路」(15.2m)"
  },
  "0643714": {
    "roadName": "五權路",
    "district": "西區"
  },
  "0644302": {
    "roadName": "公正路",
    "district": "西區"
  },
  "0646502": {
    "roadName": "五權六街",
    "district": "西區"
  },
  "0646701": {
    "roadName": "中興街",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「中興街」(1.7m), 次路名「博館三街」(11.2m)"
  },
  "0646702": {
    "roadName": "館前路",
    "district": "西區"
  },
  "0646703": {
    "roadName": "中興街",
    "district": "西區"
  },
  "0647702": {
    "roadName": "中美街",
    "district": "西區"
  },
  "0653903": {
    "roadName": "四維街",
    "district": "西區"
  },
  "0654005": {
    "roadName": "民生路",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「民生路」(0.7m), 次路名「向上路一段79巷」(3.7m)"
  },
  "0660211": {
    "roadName": "向上南路一段",
    "district": "南屯區"
  },
  "0660301": {
    "roadName": "向上路一段",
    "district": "西區"
  },
  "0660302": {
    "roadName": "向上路一段",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「向上路一段」(0.6m), 次路名「向上路一段79巷」(2.5m)"
  },
  "0660303": {
    "roadName": "向上路一段",
    "district": "西區"
  },
  "0660304": {
    "roadName": "向上路一段",
    "district": "西區"
  },
  "0660315": {
    "roadName": "向上路一段",
    "district": "西區"
  },
  "0660501": {
    "roadName": "昇平街",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「昇平街」(1.4m), 次路名「向上路一段79巷」(10.7m)"
  },
  "0660801": {
    "roadName": "向上路一段33巷",
    "district": "西區"
  },
  "0661001": {
    "roadName": "草悟道自行車道",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「草悟道自行車道」(43.0m), 次路名「公益路155巷」(45.3m)"
  },
  "0664501": {
    "roadName": "華美街",
    "district": "西區"
  },
  "0676811": {
    "roadName": "館前路",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「館前路」(5.9m), 次路名「博館三街」(13.4m)"
  },
  "0680101": {
    "roadName": "林森路",
    "district": "西區"
  },
  "0680102": {
    "roadName": "林森路",
    "district": "西區"
  },
  "0680103": {
    "roadName": "林森路",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「林森路」(0.5m), 次路名「五廊街」(5.3m)"
  },
  "0685001": {
    "roadName": "昇平街",
    "district": "西區"
  },
  "0686714": {
    "roadName": "東興路三段",
    "district": "西區"
  },
  "0686715": {
    "roadName": "東興路三段",
    "district": "西區"
  },
  "0686801": {
    "roadName": "公益路174巷",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「公益路174巷」(24.3m), 次路名「忠明南路」(24.9m)"
  },
  "0686802": {
    "roadName": "忠明南路",
    "district": "西區"
  },
  "0686803": {
    "roadName": "忠明南路",
    "district": "西區"
  },
  "0686814": {
    "roadName": "忠明南路",
    "district": "西區"
  },
  "0686905": {
    "roadName": "忠明路",
    "district": "西區"
  },
  "0686914": {
    "roadName": "忠明路",
    "district": "西區"
  },
  "0690404": {
    "roadName": "英才路",
    "district": "西區"
  },
  "0690405": {
    "roadName": "草悟道自行車道",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「草悟道自行車道」(1.8m), 次路名「英才路」(10.0m)"
  },
  "0690406": {
    "roadName": "英才路",
    "district": "西區"
  },
  "0696701": {
    "roadName": "美村路一段",
    "district": "西區"
  },
  "0696702": {
    "roadName": "公正路",
    "district": "西區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「公正路」(1.8m), 次路名「美村路一段」(2.9m)"
  },
  "0696703": {
    "roadName": "美村路一段",
    "district": "西區"
  },
  "0696704": {
    "roadName": "美村路一段",
    "district": "西區"
  },
  "0831801": {
    "roadName": "大智北一街",
    "district": "東區"
  },
  "0832001": {
    "roadName": "大智北路",
    "district": "東區"
  },
  "0837002": {
    "roadName": "復興路五段",
    "district": "東區"
  },
  "0837003": {
    "roadName": "復興路四段",
    "district": "東區"
  },
  "0853502": {
    "roadName": "台中路",
    "district": "東區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「台中路」(10.6m), 次路名「台中路376巷」(16.6m)"
  },
  "0853503": {
    "roadName": "台中路",
    "district": "南區"
  },
  "0863803": {
    "roadName": "自由路三段",
    "district": "東區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「自由路三段」(3.8m), 次路名「富台東街」(13.1m)"
  },
  "0863804": {
    "roadName": "自由路三段",
    "district": "東區"
  },
  "0864301": {
    "roadName": "樂業一路135巷",
    "district": "東區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「樂業一路135巷」(9.3m), 次路名「樂業南路」(9.7m)"
  },
  "0864501": {
    "roadName": "樂業路",
    "district": "東區"
  },
  "0865201": {
    "roadName": "樂業路58巷",
    "district": "東區"
  },
  "0874501": {
    "roadName": "旱溪西路一段523巷",
    "district": "東區"
  },
  "0893502": {
    "roadName": "建成路",
    "district": "東區"
  },
  "0897401": {
    "roadName": "南京路",
    "district": "東區"
  },
  "0902301": {
    "roadName": "大慶街一段130巷",
    "district": "南區"
  },
  "0923903": {
    "roadName": "國光路",
    "district": "南區"
  },
  "0923904": {
    "roadName": "國光路",
    "district": "南區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「國光路」(3.4m), 次路名「信義南街」(4.4m)"
  },
  "0934717": {
    "roadName": "三民路一段",
    "district": "南區"
  },
  "0937004": {
    "roadName": "復興路三段",
    "district": "南區"
  },
  "0937005": {
    "roadName": "復興路三段",
    "district": "南區"
  },
  "0937006": {
    "roadName": "復興路二段",
    "district": "南區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「復興路二段」(17.5m), 次路名「福平街」(18.4m)"
  },
  "0937007": {
    "roadName": "復興路二段",
    "district": "南區"
  },
  "0937008": {
    "roadName": "復興路二段",
    "district": "南區"
  },
  "0937009": {
    "roadName": "復興路一段",
    "district": "南區"
  },
  "0943601": {
    "roadName": "五權南路",
    "district": "南區"
  },
  "0943602": {
    "roadName": "五權南路",
    "district": "南區"
  },
  "0945001": {
    "roadName": "文心南路",
    "district": "南區"
  },
  "0945002": {
    "roadName": "文心南路",
    "district": "南區"
  },
  "0986805": {
    "roadName": "忠明南路",
    "district": "南區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「忠明南路」(1.5m), 次路名「忠明南路730巷」(7.4m)"
  },
  "0986806": {
    "roadName": "忠明南路",
    "district": "南區"
  },
  "0986807": {
    "roadName": "忠明南路",
    "district": "南區"
  },
  "0986814": {
    "roadName": "忠明南路",
    "district": "南區",
    "isApproximate": true,
    "riskNote": "路口轉角交叉疑慮: 主路名「忠明南路」(3.4m), 次路名「忠明南路506巷」(10.2m)"
  },
  "0996602": {
    "roadName": "美村南路",
    "district": "南區"
  },
  "0997638": {
    "roadName": "高工路",
    "district": "南區"
  }
};
