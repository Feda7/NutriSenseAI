import os
import torch
import timm
from flask import Flask, request, jsonify
from flask_cors import CORS
from torchvision import transforms
from PIL import Image
import mysql.connector
import io

# تصحيح دائم: name بشرطتين
app = Flask(__name__)
CORS(app)

# الخروج خطوتين للوراء (..) و (..) للوصول إلى المجلد الأب الكبير AI_Model ومنه إلى Models
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "Models", "best_swin_food101 (4).pth")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# قائمة الأصناف
FOOD_CLASSES = [
    'apple_pie', 'baby_back_ribs', 'baklava', 'beef_carpaccio', 'beef_tartare', 'beet_salad', 'beignets', 
    'bibimbap', 'bread_pudding', 'breakfast_burrito', 'bruschetta', 'caesar_salad', 'cannoli', 'caprese_salad', 
    'carrot_cake', 'ceviche', 'cheesecake', 'cheese_plate', 'chicken_curry', 'chicken_quesadilla', 'chicken_wings', 
    'chocolate_cake', 'chocolate_mousse', 'churros', 'clam_chowder', 'club_sandwich', 'crab_cakes', 'creme_brulee', 
    'croque_madame', 'cup_cakes', 'deviled_eggs', 'donuts', 'dumplings', 'edamame', 'eggs_benedict', 'escargots', 
    'falafel', 'filet_mignon', 'fish_and_chips', 'foie_gras', 'french_fries', 'french_onion_soup', 'french_toast', 
    'fried_calamari', 'fried_rice', 'frozen_yogurt', 'garlic_bread', 'gnocchi', 'greek_salad', 'grilled_cheese_sandwich', 
    'grilled_salmon', 'guacamole', 'gyoza', 'hamburger', 'hot_and_sour_soup', 'hot_dog', 'huevos_rancheros', 
    'hummus', 'ice_cream', 'lasagna', 'lobster_bisque', 'lobster_roll_sandwich', 'macaroni_and_cheese', 'macarons', 
    'miso_soup', 'mussels', 'nachos', 'omelette', 'onion_rings', 'oysters', 'pad_thai', 'paella', 'pancakes', 
    'panna_cotta', 'peking_duck', 'pho', 'pizza', 'pork_chop', 'poutine', 'prime_rib', 'pulled_pork_sandwich', 
    'ramen', 'ravioli', 'red_velvet_cake', 'risotto', 'samosa', 'sashimi', 'scallops', 'seaweed_salad', 
    'shrimp_and_grits', 'spaghetti_bolognese', 'spaghetti_carbonara', 'spring_rolls', 'steak', 'strawberry_shortcake', 
    'sushi', 'tacos', 'takoyaki', 'tiramisu', 'tuna_tartare', 'waffles'
]

# 2. إعدادات قاعدة البيانات
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'nutrisense_db'
}

# 3. تحميل الموديل
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

model = timm.create_model('swin_tiny_patch4_window7_224.ms_in1k', pretrained=False, num_classes=101)

try:
    # تحميل الأوزان
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model.to(DEVICE)
    model.eval()
    print("✅✅✅ ممتاز! تم تحميل الموديل بنجاح!")
except Exception as e:
    print(f"❌ خطأ: تأكدي أن ملف الموديل موجود داخل مجلد Models. التفاصيل: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        image = Image.open(io.BytesIO(file.read())).convert('RGB')
        
        input_tensor = transform(image).unsqueeze(0).to(DEVICE)
        
        with torch.no_grad():
            outputs = model(input_tensor)
            _, predicted = torch.max(outputs, 1)
            idx = predicted.item()
            
            food_name_en = FOOD_CLASSES[idx]

        # الربط مع الداتابيز
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        query = "SELECT * FROM fooditem WHERE ModelLabel = %s"
        cursor.execute(query, (food_name_en,))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()

        if result:
            return jsonify({
                'foodItemId': result['FoodItemID'], 
                'class_name': food_name_en,
                'food_name': result['Name'],
                'calories': result['Calories']
            })
        else:
            return jsonify({
                'foodItemId': None, 
                'class_name': food_name_en,
                'message': f'تم التعرف على ({food_name_en}) ولكنها غير مضافة للداتابيس'
            }), 200
    except Exception as e:
        print(f"❌ Error during prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500

# تشغيل السيرفر مع حماية إضافية للويندوز لمنع تعليق البورت
if __name__ == '__main__':
    app.run(port=5050, debug=True, use_reloader=False)