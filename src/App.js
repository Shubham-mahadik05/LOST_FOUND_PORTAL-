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
    if (files) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result });
      };
      reader.readAsDataURL(files[0]);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-800">Lost & Found Portal</h1>
        {user ? (
          <div className="text-sm text-purple-700">Welcome, {user.displayName}</div>
        ) : (
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700"
            onClick={handleLogin}
          >
            Sign in with Google
          </button>
        )}
      </header>

      {user && (
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md grid grid-cols-1 md:grid-cols-2 gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <input
            type="text"
            name="title"
            placeholder="Item Title"
            className="border p-2 rounded"
            value={form.title}
            onChange={handleFormChange}
            required
          />
          <select
            name="category"
            className="border p-2 rounded"
            value={form.category}
            onChange={handleFormChange}
          >
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
          <textarea
            name="description"
            placeholder="Item Description"
            className="border p-2 rounded col-span-2"
            value={form.description}
            onChange={handleFormChange}
            required
          ></textarea>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="col-span-2"
            onChange={handleFormChange}
            required
          />
          <button
            type="submit"
            className="col-span-2 bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          >
            Submit
          </button>
        </motion.form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="bg-white rounded shadow-md p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded mb-3" />
            <h3 className="text-xl font-semibold text-purple-800">{item.title}</h3>
            <p className="text-sm text-gray-700">{item.description}</p>
            <span className="text-xs font-medium text-white bg-purple-400 px-2 py-1 inline-block mt-2 rounded">
              {item.category.toUpperCase()}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
