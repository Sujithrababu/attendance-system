import os
import pickle

print("🔍 Checking Colab files integration...")

# Check face_data.pkl
if os.path.exists('face_data.pkl'):
    try:
        with open('face_data.pkl', 'rb') as f:
            data = pickle.load(f)
        print(f"✅ face_data.pkl: Found {len(data['names'])} students")
        print(f"   Student names: {data['names']}")
        print(f"   Student IDs: {data['ids']}")
    except Exception as e:
        print(f"❌ Error reading face_data.pkl: {e}")
else:
    print("❌ face_data.pkl not found!")

# Check registered_faces
if os.path.exists('registered_faces'):
    image_files = [f for f in os.listdir('registered_faces') if f.endswith(('.jpg', '.png'))]
    print(f"✅ registered_faces/: Found {len(image_files)} face images")
    print(f"   Images: {image_files}")
else:
    print("❌ registered_faces/ folder not found!")

print("\n🎯 Ready to start the system!")