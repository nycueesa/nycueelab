import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# For debugging purposes, temporarily allow all origins.
# In production, you should restrict this to your frontend's actual domain.
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_latest_professor_data():
    """
    Finds and loads the professor data from the JSON file.
    In the future, this function can be modified to fetch data from a database.
    """

    data_file_path = Path(__file__).parent.parent / "NewData.json"

    if not data_file_path.is_file():
        # If the file doesn't exist, raise a 500 Internal Server Error
        raise HTTPException(status_code=500, detail="未在根目錄中找到NewData.json，請檢查是否存在此文件")

    try:
        with open(data_file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except json.JSONDecodeError:
        # If the file is not valid JSON, raise a 500 error
        raise HTTPException(status_code=500, detail="Error decoding professor data file.")
    except Exception as e:
        # Catch other potential file reading errors
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
    
@app.get("/api/professors")
def read_all_professors():
    """
    獲取所有教授資訊(NewData.json)
    API endpoint to get all professor information.
    """
    return get_latest_professor_data()

@app.get("/api/data")
def read_data():
    """
    獲取完整的資料檔案內容
    API endpoint to get complete data file.
    """
    return get_latest_professor_data()

@app.get("/api/professors/id={id}")
def read_professors_byID(id : int):
    """
    獲取對應id的教授資訊
    """
    data = get_latest_professor_data()
    target_professor = None
    for person in data['professors'] :
        if person['id'] == id:
            target_professor = person
            break

    if target_professor is None:
        raise HTTPException(status_code=404, detail=f"找不到 ID 為 {id} 的教授")

    return target_professor

@app.get("/")
def read_root():
    return {"status": "API is running"}