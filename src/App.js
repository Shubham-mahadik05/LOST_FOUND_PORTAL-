import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { motion } from "framer-motion";
import "./index.css";

const firebaseConfig = {
  apiKey: "AIzaSyATqudH7Hw5cpJCBrJnuhGE48RGcUsxHJw",
  authDomain: "lost-found-portal-da2a1.firebaseapp.com",
  projectId: "lost-found-portal-da2a1",
  storageBucket: "lost-found-portal-da2a1.firebasestorage.app",
  messagingSenderId: "922749142719",
  appId: "1:922749142719:web:3e59cf445297f015d2280a",
  measurementId: "G-XDZMY1ZL30"
};  


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function App() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "lost",
    image: null,
  });

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const querySnapshot = await getDocs(collection(db, "items"));
    const fetchedItems = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setItems(fetchedItems);
  };

  const handleLogin = () => {
    signInWithPopup(auth, provider);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
          setForm({ ...form, image: compressedBase64 });
        };
      };
      reader.readAsDataURL(file);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "items"), {
      ...form,
      imageUrl: form.image,
      user: user.email,
      createdAt: new Date(),
    });
    fetchItems();
    setForm({ title: "", description: "", category: "lost", image: null });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 text-gray-800 font-sans">
      <header className="bg-purple-600 text-white p-6 flex justify-between items-center shadow-lg">
        <h1 className="text-3xl font-extrabold tracking-wide">🎒 Lost & Found Portal</h1>
        {user ? (
          <div className="text-sm font-medium">Welcome, {user.displayName}</div>
        ) : (
          <button
            className="bg-white text-purple-600 font-semibold px-4 py-2 rounded hover:bg-purple-100 transition"
            onClick={handleLogin}
          >
            Sign in with Google
          </button>
        )}
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {user && (
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <input
              type="text"
              name="title"
              placeholder="Item Title"
              className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-purple-400"
              value={form.title}
              onChange={handleFormChange}
              required
            />
            <select
              name="category"
              className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-purple-400"
              value={form.category}
              onChange={handleFormChange}
            >
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
            <textarea
              name="description"
              placeholder="Item Description"
              className="border border-gray-300 p-3 rounded col-span-1 md:col-span-2 h-32 resize-none focus:ring-2 focus:ring-purple-400"
              value={form.description}
              onChange={handleFormChange}
              required
            ></textarea>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="col-span-1 md:col-span-2 border p-2 rounded"
              onChange={handleFormChange}
              required
            />
            <button
              type="submit"
              className="col-span-1 md:col-span-2 bg-purple-600 text-white font-semibold py-3 rounded hover:bg-purple-700 transition"
            >
              Submit Item
            </button>
          </motion.form>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <motion.div
              key={item.id}
              className="bg-white rounded-xl shadow-lg p-5 flex flex-col justify-between"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h3 className="text-xl font-semibold text-purple-800 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.category === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {item.category.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">{item.user}</span>
              </div>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}
