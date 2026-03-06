import json

def merge_data():
    # 檔案路徑設定
    newdata_path = 'backend/NewData.json'
    yt_data_path = 'backend/yt_professors.json'
    
    # 1. 讀取 NewData.json
    try:
        with open(newdata_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"錯誤：找不到 {newdata_path}")
        return

    # 2. 讀取 yt_professors.json
    try:
        with open(yt_data_path, 'r', encoding='utf-8') as f:
            yt_links = json.load(f)
    except FileNotFoundError:
        print(f"錯誤：找不到 {yt_data_path}")
        return

    # 建立姓名對應表 (Key: 姓名, Value: 教授物件在 data 中的索引)
    name_to_idx = {}
    for idx, prof in enumerate(data['professors']):
        # 去除 "Prof. " 標記以便比對
        clean_name = prof['name'].replace("Prof. ", "").strip()
        if clean_name:
            name_to_idx[clean_name] = idx

    # 3. 執行合併
    for yt_name, links in yt_links.items():
        if yt_name in name_to_idx:
            target_idx = name_to_idx[yt_name]
            # 確保 link 欄位是列表
            if data['professors'][target_idx]['link'] is None:
                data['professors'][target_idx]['link'] = []
            
            # 處理單一字串或多個連結的情況
            if isinstance(links, str):
                links = [links]
            
            # 加入專題影片連結
            for link_url in links:
                data['professors'][target_idx]['link'].append({
                    "linkName": "專題影片",
                    "link": link_url
                })
        else:
            # 4. 教授不在 NewData.json 時輸出 Log
            print(f"{yt_name} 沒有在 NewData.json")

    # 5. 寫回 NewData.json
    with open(newdata_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n合併完成，已更新 {newdata_path}")

if __name__ == "__main__":
    merge_data()