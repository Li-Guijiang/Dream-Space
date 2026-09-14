import re
from datetime import datetime
from typing import Optional
from sqlmodel import Session, select, col
from app.models.visitor import Visitor

# 内存缓存 IP 地理位置，避免重复请求
_geo_cache: dict[str, dict] = {}

# 英文省份 → 中文 映射
_PROVINCE_MAP: dict[str, str] = {
    "beijing": "北京", "tianjin": "天津", "shanghai": "上海", "chongqing": "重庆",
    "hebei": "河北", "shanxi": "山西", "inner mongolia": "内蒙古",
    "liaoning": "辽宁", "jilin": "吉林", "heilongjiang": "黑龙江",
    "jiangsu": "江苏", "zhejiang": "浙江", "anhui": "安徽", "fujian": "福建",
    "jiangxi": "江西", "shandong": "山东", "henan": "河南", "hubei": "湖北",
    "hunan": "湖南", "guangdong": "广东", "guangxi": "广西", "hainan": "海南",
    "sichuan": "四川", "guizhou": "贵州", "yunnan": "云南", "tibet": "西藏",
    "shaanxi": "陕西", "gansu": "甘肃", "qinghai": "青海", "ningxia": "宁夏",
    "xinjiang": "新疆", "hong kong": "香港", "macau": "澳门", "taiwan": "台湾",
}

# 科技/云厂商 关键词映射
_VENDOR_MAP: dict[str, str] = {
    "alibaba": "阿里巴巴", "aliyun": "阿里云",
    "tencent": "腾讯", "tencent cloud": "腾讯云",
    "baidu": "百度", "baidu cloud": "百度云",
    "huawei": "华为", "huawei cloud": "华为云",
    "bytedance": "字节跳动", "volcengine": "火山引擎",
    "kuaishou": "快手", "meituan": "美团", "xiaomi": "小米",
    "jd.com": "京东", "netease": "网易",
    "kingsoft": "金山云", "qihoo 360": "奇虎360",
    "sina": "新浪", "sohu": "搜狐", "douban": "豆瓣",
    "amazon": "亚马逊", "aws": "亚马逊云", "microsoft": "微软",
    "azure": "微软云", "google": "谷歌", "google cloud": "谷歌云",
    "cloudflare": "Cloudflare", "oracle": "甲骨文",
    "ovh": "OVH", "digitalocean": "DigitalOcean", "hetzner": "Hetzner",
    "huawei cloud": "华为云",
    "apple": "苹果",
}

# 用 asn 号判断运营商
_ASN_ORG_MAP: dict[str, str] = {
    "56041": "中国移动", "56042": "中国移动", "56043": "中国移动",
    "56044": "中国移动", "56045": "中国移动", "56046": "中国移动",
    "56047": "中国移动", "56048": "中国移动", "58453": "中国移动",
    "9808": "中国移动", "24400": "中国移动", "24444": "中国移动", "24445": "中国移动",
    "4808": "中国联通", "4837": "中国联通", "9929": "中国联通", "17816": "中国联通",
    "4134": "中国电信", "4809": "中国电信", "4812": "中国电信",
    "23724": "中国电信", "140061": "中国电信",
    "4538": "中国教育网",
    "45102": "阿里云", "37963": "阿里云", "45090": "阿里云",
    "45069": "腾讯云", "132203": "腾讯云",
    "136907": "华为云", "55967": "百度云", "137696": "火山引擎",
    "13335": "Cloudflare", "209242": "Cloudflare",
}


def _get_org_cn(org: str, asn: str) -> str:
    """智能识别运营商/组织名，返回中文"""
    if not org:
        return ""

    org_lower = org.lower().replace(",", "").replace(".", "").replace("&", "and")

    # ---- 提取省份 ----
    found_province = ""
    for eng, cn in _PROVINCE_MAP.items():
        if eng in org_lower:
            found_province = cn
            break

    # ---- 识别运营商大类 ----
    is_mobile = "china mobile" in org_lower or "chinamobile" in org_lower or "cmcc" in org_lower
    is_unicom = "china unicom" in org_lower or "chinaunicom" in org_lower or "cucc" in org_lower
    is_telecom = "china telecom" in org_lower or "chinatelecom" in org_lower or "chinanet" in org_lower or "ctcc" in org_lower
    is_cernet = "cernet" in org_lower or "cernt" in org_lower or "china education" in org_lower

    if is_mobile:
        return f"中国移动({found_province})" if found_province else "中国移动"
    if is_unicom:
        return f"中国联通({found_province})" if found_province else "中国联通"
    if is_telecom:
        return f"中国电信({found_province})" if found_province else "中国电信"
    if is_cernet:
        return "中国教育网"

    # ---- 通用模式识别 ----
    # 含 mobile 但无 china mobile → 地方移动
    if "mobile" in org_lower or "移动" in org:
        return f"{found_province}移动" if found_province else "移动运营商"
    # 含 unicom/united network → 联通系
    if "unicom" in org_lower or "united network" in org_lower or "uninet" in org_lower:
        return f"{found_province}联通" if found_province else "中国联通"
    # 含 telecom/chinanet → 电信系
    if "telecom" in org_lower or "chinanet" in org_lower or "telecommunications" in org_lower:
        return f"{found_province}电信" if found_province else "中国电信"
    # 含 netcom → 网通（联通前身）
    if "netcom" in org_lower or "cnc" in org_lower:
        return "中国网通"

    # ---- 有线电视 / 广电 ----
    if "cable" in org_lower:
        if found_province:
            return f"{found_province}广电"
        return "有线电视网络"
    if "broadcast" in org_lower or "radio" in org_lower or "tv" in org_lower:
        return f"{found_province}广电" if found_province else "广电网络"

    # ---- Huashu (华数) ----
    if "huashu" in org_lower or "wasu" in org_lower:
        return "华数传媒"

    # ---- China Networks Inter-Exchange / 互联交换 ----
    if "inter-exchange" in org_lower or "interexchange" in org_lower:
        return "互联交换网络"
    if "china networks" in org_lower:
        return "中国网络交换"

    # ---- 科技/云厂商 ----
    for keyword, cn_name in _VENDOR_MAP.items():
        if keyword in org_lower:
            return cn_name

    # ---- 从 asn 号反查 ----
    if asn:
        asn_num = asn.replace("AS", "").replace("as", "").strip()
        if asn_num in _ASN_ORG_MAP:
            return _ASN_ORG_MAP[asn_num]

    # ---- 从 asn 文本匹配 ----
    if asn:
        asn_lower = asn.lower()
        is_mobile_asn = "china mobile" in asn_lower or "chinamobile" in asn_lower or "cmcc" in asn_lower
        is_unicom_asn = "china unicom" in asn_lower or "chinaunicom" in asn_lower
        is_telecom_asn = "china telecom" in asn_lower or "chinatelecom" in asn_lower or "chinanet" in asn_lower
        if is_mobile_asn:
            return "中国移动"
        if is_unicom_asn:
            return "中国联通"
        if is_telecom_asn:
            return "中国电信"

    return ""


def _parse_ua(ua: str) -> dict:
    """简单的 User-Agent 解析"""
    browser = "Unknown"
    if "Edg/" in ua:
        browser = "Edge"
    elif "Chrome/" in ua:
        browser = "Chrome"
    elif "Firefox/" in ua:
        browser = "Firefox"
    elif "Safari/" in ua:
        browser = "Safari"

    os = "Unknown"
    if "Win" in ua:
        os = "Windows"
    elif "Android" in ua:
        os = "Android"
    elif "iPhone" in ua or "iPad" in ua:
        os = "iOS"
    elif "Mac" in ua:
        os = "macOS"
    elif "Linux" in ua:
        os = "Linux"

    device = "手机" if any(k in ua for k in ("Mobi", "Android", "iPhone")) else "电脑"

    return {"browser": browser, "os": os, "device_type": device}


def _fetch_geo(ip: str) -> dict:
    """查询 IP 地理位置（带内存缓存）"""
    if ip in _geo_cache:
        return _geo_cache[ip]

    # 跳过本地和内网 IP
    if ip in ("127.0.0.1", "::1", "") or ip.startswith("192.168.") or ip.startswith("10."):
        return {}

    result = {}

    # uapis.cn（国内 API，IPv4/IPv6 支持好，返回中文）
    try:
        import httpx
        resp = httpx.get(
            "https://uapis.cn/api/v1/network/ipinfo",
            params={"ip": ip},
            timeout=5,
        )
        data = resp.json()
        if data.get("ip"):
            # region 格式："国家 省份 城市" 或 "国家"
            parts = data.get("region", "").split()
            result = {
                "country": parts[0] if len(parts) >= 1 else "",
                "region": parts[1] if len(parts) >= 2 else "",
                "city": parts[2] if len(parts) >= 3 else "",
                "district": "",
                "org": data.get("isp", ""),
                "asn": data.get("asn", "") or data.get("as", "") or "",
                "is_mobile": False,
                "is_proxy": False,
                "is_hosting": False,
            }
    except Exception:
        pass

    # 回退：ip-api.com（仅 IPv4）
    if not result and ":" not in ip:
        try:
            import httpx
            resp = httpx.get(
                f"http://ip-api.com/json/{ip}?lang=zh-CN&fields=66846719",
                timeout=3,
            )
            data = resp.json()
            if data.get("status") == "success":
                result = {
                    "city": data.get("city", ""),
                    "region": data.get("regionName", ""),
                    "country": data.get("country", ""),
                    "district": data.get("district", ""),
                    "org": data.get("org", "") or data.get("isp", ""),
                    "asn": data.get("as", "") or "",
                    "is_mobile": bool(data.get("mobile", False)),
                    "is_proxy": bool(data.get("proxy", False)),
                    "is_hosting": bool(data.get("hosting", False)),
                }
        except Exception:
            pass

    if result:
        _geo_cache[ip] = result
    return result


def record_visit(
    session: Session,
    ip: str,
    path: str = "",
    user_agent: str = "",
):
    """记录一次访问"""
    ua_info = _parse_ua(user_agent)
    geo_info = _fetch_geo(ip)

    visitor = Visitor(
        ip=ip,
        path=path,
        user_agent=user_agent,
        city=geo_info.get("city", ""),
        region=geo_info.get("region", ""),
        country=geo_info.get("country", ""),
        district=geo_info.get("district", ""),
        org=geo_info.get("org", ""),
        asn=geo_info.get("asn", ""),
        is_mobile=geo_info.get("is_mobile", False),
        is_proxy=geo_info.get("is_proxy", False),
        is_hosting=geo_info.get("is_hosting", False),
        browser=ua_info["browser"],
        os=ua_info["os"],
        device_type=ua_info["device_type"],
    )
    session.add(visitor)
    session.commit()
    return visitor


def get_recent_visitors(
    session: Session,
    page: int = 1,
    size: int = 20,
) -> list[dict]:
    """获取最近访客列表"""
    q = (
        select(Visitor)
        .order_by(col(Visitor.created_at).desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    rows = list(session.exec(q).all())
    return [
        {
            "id": v.id,
            "ip": v.ip,
            "path": v.path,
            "city": v.city,
            "region": v.region,
            "country": v.country,
            "district": v.district,
            "org": v.org,
            "org_cn": _get_org_cn(v.org, v.asn),
            "asn": v.asn,
            "is_mobile": v.is_mobile,
            "is_proxy": v.is_proxy,
            "is_hosting": v.is_hosting,
            "browser": v.browser,
            "os": v.os,
            "device_type": v.device_type,
            "created_at": v.created_at.isoformat() if v.created_at else "",
        }
        for v in rows
    ]


def get_visitor_count(session: Session) -> int:
    """获取总访客数"""
    return len(list(session.exec(select(Visitor)).all()))


def delete_visitor(session: Session, visitor_id: int):
    """删除单条访客记录"""
    visitor = session.get(Visitor, visitor_id)
    if visitor:
        session.delete(visitor)
        session.commit()


def clear_visitors(session: Session):
    """清空所有访客记录"""
    from sqlmodel import delete
    session.exec(delete(Visitor)) # type: ignore
    session.commit()
