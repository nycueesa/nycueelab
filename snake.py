import json
import os
import re
import requests

def download_file(file_id, destination):
    """處理 Google Drive 下載與大檔案確認"""
    URL = "https://docs.google.com/uc?export=download"
    session = requests.Session()
    response = session.get(URL, params={'id': file_id}, stream=True)
    
    token = None
    for key, value in response.cookies.items():
        if key.startswith('download_warning'):
            token = value
            break
    if token:
        response = session.get(URL, params={'id': file_id, 'confirm': token}, stream=True)
    
    with open(destination, "wb") as f:
        for chunk in response.iter_content(32768):
            if chunk: 
                f.write(chunk)

def main():
    # --- 路徑設定 ---
    backend_dir = 'backend'
    json_path = os.path.join(backend_dir, 'NewData.json')
    slide_dir = os.path.join(backend_dir, 'slide')
    
    # 1. 確保 backend/slide 目錄存在
    os.makedirs(slide_dir, exist_ok=True)

    # 2. 讀取 backend/NewData.json
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"錯誤：找不到檔案 {json_path}。請確認 backend 資料夾是否存在。")
        return

    professors = data.get("professors", [])
    download_limit = 10
    download_count = 0

    print(f"正在處理後端資料：{json_path}")

    for prof in professors:
        if download_count >= download_limit:
            break

        prof_id = prof.get("id")
        links = prof.get("link", [])
        
        # 3. 尋找「投影片」連結
        slide_item = next((l for l in links if l["linkName"] == "投影片" and l["link"]), None)
        
        if slide_item and 'drive.google.com' in slide_item["link"]:
            match = re.search(r'/d/([a-zA-Z0-9_-]+)', slide_item["link"])
            if match:
                file_id = match.group(1)
                
                # 4. 設定檔名與相對路徑
                file_name = f"professor_id{prof_id}.pdf"
                abs_dest_path = os.path.join(slide_dir, file_name)
                # 存入 JSON 的相對路徑：slide/professor_id1.pdf
                json_relative_path = f"slide/{file_name}"

                print(f"[{download_count + 1}/{download_limit}] 下載 ID {prof_id} -> {file_name}")
                try:
                    download_file(file_id, abs_dest_path)
                    
                    # 5. 更新 JSON：加入「本地投影片」
                    # 避免重複寫入相同 linkName
                    if not any(l["linkName"] == "本地投影片" for l in links):
                        prof['link'].append({
                            "linkName": "本地投影片",
                            "link": json_relative_path
                        })
                    
                    download_count += 1
                except Exception as e:
                    print(f"ID {prof_id} 下載失敗: {e}")
            else:
                print(f"跳過 ID {prof_id}：無法解析 ID")

    # 6. 寫回 backend/NewData.json
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n處理完成！已更新 {json_path} 並儲存 PDF 至 {slide_dir}")

if __name__ == "__main__":
    main()