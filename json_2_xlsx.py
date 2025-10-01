import json
import pandas as pd

# Загружаем JSON из файла
with open("firestore_dump.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Берем коллекцию "guests"
guests = data.get("guests", {})

# Конвертируем в список словарей
rows = []
for key, value in guests.items():
    row = {"_id": key}  # чтобы сохранить ID документа
    row.update(value)
    rows.append(row)

# Превращаем в DataFrame
df = pd.DataFrame(rows)

# Сохраняем в Excel
df.to_excel("guests.xlsx", index=False)

print("✅ Данные успешно экспортированы в guests.xlsx")
