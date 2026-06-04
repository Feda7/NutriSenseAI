import sys

def simulate_ai_prediction():
    # هنا نقوم بمحاكاة الـ AI.. بدلاً من تشغيل الموديل، نرجع اسم الوجبة مباشرة
    # تأكدي أن هذا الاسم موجود تماماً في جدول الـ FoodItem أو food_dataset في قاعدة البيانات
    predicted_meal = "Bakhmari" 
    
    # نطبع الاسم ليقرأه كود Node.js (app.js) في السطر 43 فوراً
    print(predicted_meal)

if __name__ == "__main__":
    # حتى لو الفرونت إند أرسل مسار الصورة، سيتجاهلها البايثون حالياً ويعيد النتيجة فوراً
    simulate_ai_prediction()