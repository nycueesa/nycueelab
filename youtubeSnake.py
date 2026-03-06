import yt_dlp
import json
import re
import os

def extract_professor_name(title):
    """
    從標題中提取教授姓名
    範例格式：第166組，廖育德教授指導
    """
    # 邏輯 1：匹配 「第...組，」之後到「教授」之前的文字
    match_with_group = re.search(r"第\d+組[，,]\s*(.+?)教授", title)
    if match_with_group:
        return match_with_group.group(1).strip()
    
    # 邏輯 2：匹配 「Prof.」 之後的中文字 (相容舊格式)
    match_prof = re.search(r"Prof\.\s*([\u4e00-\u9fa5]+)", title)
    if match_prof:
        return match_prof.group(1).strip()
    
    # 邏輯 3：直接匹配 「姓名教授」
    match_simple = re.search(r"([\u4e00-\u9fa5]{2,4})教授", title)
    if match_simple:
        return match_simple.group(1).strip()
        
    return None

def main():
    playlist_url = 'https://www.youtube.com/playlist?list=PLSZirWLX11qTT_gzAmueudtWKQ32CfQNA'
    output_dir = 'backend'
    output_file = os.path.join(output_dir, 'yt_professors.json')

    # 1. 建立 backend 資料夾
    os.makedirs(output_dir, exist_ok=True)

    ydl_opts = {
        'quiet': True,
        'extract_flat': True,  # 只抓取清單資訊，不下載影片
        'force_generic_extractor': True,
    }

    result_data = {}

    print(f"正在分析播放清單：{playlist_url} ...")
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            playlist_info = ydl.extract_info(playlist_url, download=False)
            if 'entries' in playlist_info:
                for entry in playlist_info['entries']:
                    title = entry.get('title', '')
                    # 組合完整 YouTube 連結
                    url = f"https://www.youtube.com/watch?v={entry.get('id')}"
                    
                    # 提取教授名
                    name = extract_professor_name(title)
                    
                    if name:
                        # 處理同一位教授有多個影片的情況
                        if name in result_data:
                            # 如果已經是清單則 append，否則轉成清單
                            if isinstance(result_data[name], list):
                                result_data[name].append(url)
                            else:
                                result_data[name] = [result_data[name], url]
                        else:
                            result_data[name] = url
                        print(f"成功提取：{name} -> {title}")
                    else:
                        print(f"無法解析標題：{title}")
                        
        except Exception as e:
            print(f"執行出錯: {e}")
            return

    # 2. 輸出為 JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result_data, f, ensure_ascii=False, indent=2)

    print(f"\n下載完成！JSON 檔案路徑：{output_file}")

if __name__ == "__main__":
    main()