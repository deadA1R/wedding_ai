import firebase_admin
from firebase_admin import credentials, firestore
import json

# Загружаем ключ сервисного аккаунта (скачивается из Firebase Console → Project Settings → Service accounts)
cred = credentials.Certificate("M:\Свадьба\Пригласительные\wedding_invite_v3\weddingsite-2112a-firebase-adminsdk-fbsvc-2ce459dd78.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

def get_all_collections():
    return [col.id for col in db.collections()]

def export_firestore():
    result = {}
    for col_id in get_all_collections():
        docs = db.collection(col_id).stream()
        result[col_id] = {}
        for doc in docs:
            result[col_id][doc.id] = doc.to_dict()
    return result

data = export_firestore()

# Сохраняем в JSON
with open("firestore_dump.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print("✅ Firestore экспортирован в firestore_dump.json")
