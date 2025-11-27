import { BadgeData, Language } from "../types";

// Offline Fallback Data
const OFFLINE_DATA_EN = {
  names: ["ALEX CHEN", "SARAH CONNOR", "JOHNNY SILVERHAND", "MAJOR KUSANAGI", "RICK DECKARD", "NEO ANDERSON", "TRINITY", "DAVID MARTINEZ"],
  roles: ["NETRUNNER", "STREET SAMURAI", "OPERATIVE", "DETECTIVE", "HACKER", "ENFORCER", "ENGINEER", "PILOT"],
  companies: ["ARASAKA CORP", "MILITECH", "TYRELL CORP", "SECTION 9", "CYBERDYNE SYSTEMS", "MASSIVE DYNAMIC", "WEYLAND-YUTANI", "UMBRELLA CORP"],
  addresses: [
    "101 CALIFORNIA ST.\nNIGHT CITY, NC 2077",
    "221B BAKER STREET\nLONDON, UK",
    "742 EVERGREEN TERRACE\nSPRINGFIELD, USA",
    "1234 ELM STREET\nLOS ANGELES, CA 90028",
    "42 WALLABY WAY\nSYDNEY, AUSTRALIA"
  ],
  contacts: [
    "ALEX@NIGHTCITY.NET\n+1 555 0199",
    "S.CONNOR@RESISTANCE.ORG\n+1 555 2029",
    "JOHNNY@SAMURAI.BAND\n+1 555 2077",
    "MOTOKO@SECTION9.GOV.JP\n+81 3 5555 1234"
  ]
};

const OFFLINE_DATA_ZH = {
  names: ["李雷", "韩梅梅", "强尼·银手", "草薙素子", "瑞克·戴克", "尼奥", "崔妮蒂", "大卫·马丁内斯"],
  roles: ["网络黑客", "街头武士", "特工", "侦探", "骇客", "执法者", "工程师", "飞行员"],
  companies: ["荒坂公司", "军用科技", "泰瑞尔公司", "公安九课", "赛博达因系统", "巨型动力", "维兰德-尤塔尼", "保护伞公司"],
  addresses: [
    "加利福尼亚大街101号\n夜之城, NC 2077",
    "贝克街221B号\n伦敦, 英国",
    "常青台742号\n春田市, 美国",
    "榆树街1234号\n洛杉矶, 加利福尼亚 90028",
    "瓦拉比路42号\n悉尼, 澳大利亚"
  ],
  contacts: [
    "LEI@NIGHTCITY.NET\n+86 138 0000 0000",
    "HAN@RESISTANCE.ORG\n+86 139 1111 1111",
    "JOHNNY@SAMURAI.BAND\n+1 555 2077",
    "MOTOKO@SECTION9.GOV.JP\n+81 3 5555 1234"
  ]
};

const generateOfflinePersona = (lang: Language): BadgeData => {
  const dataSet = lang === 'zh' ? OFFLINE_DATA_ZH : OFFLINE_DATA_EN;
  
  const random = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const randomId = () => Math.floor(Math.random() * 100000000).toString().padStart(8, '0');

  const name = random(dataSet.names);
  const role = random(dataSet.roles);
  const id = randomId();
  const company = random(dataSet.companies);
  const address = random(dataSet.addresses);
  const contact = random(dataSet.contacts);

  const qrString = JSON.stringify({
    NAME: name,
    ROLE: role,
    ID: id,
    COMPANY: company,
    CONTACT: contact,
    ADDRESS: address
  }, null, 2);

  return {
    name,
    role,
    id,
    address,
    contact,
    company,
    qrValue: qrString,
    customFields: {},
  };
};

export const generatePersona = async (lang: Language): Promise<BadgeData | null> => {
  // Always use offline generator
  return generateOfflinePersona(lang);
};
