import json
import os

file_path = r'C:\Users\doral\OneDrive\桌面\系學會網站\lab notion\nycueelab\backend\data\NewData.json'

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for prof in data.get('professors', []):
    name = prof.get('name', '')
    if name == "Prof. 劉建男":
        prof['photo'] = "/images/professor_liu.png"
    else:
        # Remove "Prof. " from the beginning of the name
        clean_name = name.replace("Prof. ", "", 1)
        prof['photo'] = f"/images/{clean_name}.png"

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Successfully updated NewData.json")
