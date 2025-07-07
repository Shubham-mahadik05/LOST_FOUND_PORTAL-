import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc, // <-- Add this
  doc        // <-- Add this
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion } from "framer-motion";
import "./index.css";

const firebaseConfig = {
  apiKey: "AIzaSyATqudH7Hw5cpJCBrJnuhGE48RGcUsxHJw",
  authDomain: "lost-found-portal-da2a1.firebaseapp.com",
  projectId: "lost-found-portal-da2a1",
  storageBucket: "lost-found-portal-da2a1.appspot.com", // <-- FIXED HERE
  messagingSenderId: "922749142719",
  appId: "1:922749142719:web:3e59cf445297f015d2280a",
  measurementId: "G-XDZMY1ZL30"
};  

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

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

  const handleLogout = () => {
    signOut(auth);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, image: files[0] }); // Store the File object
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please sign in to submit an item.");
      return;
    }

    if (!form.image) {
      alert("Please select an image.");
      return;
    }

    try {
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `images/${Date.now()}_${form.image.name}`);
      await uploadBytes(imageRef, form.image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, "items"), {
        title: form.title,
        description: form.description,
        category: form.category,
        imageUrl,
        user: user.email,
        createdAt: new Date()
      });

      await fetchItems();
      setForm({ title: "", description: "", category: "lost", image: null });
    } catch (error) {
      console.error("Error uploading item:", error);
      alert("Error uploading item: " + error.message);
    }
  };

  // Add this function to handle deletion
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "items", id));
    fetchItems();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100 relative overflow-x-hidden">
      {/* Decorative background pattern */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-30" aria-hidden>
        <svg className="w-full h-full" fill="none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#a78bfa" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-10 bg-white/70 backdrop-blur-md shadow-lg border-b border-purple-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎒</span>
            <span className="text-2xl font-extrabold text-purple-700 tracking-wide drop-shadow">Lost & Found Portal</span>
          </div>
          <div>
            {user ? (
              <div className="flex items-center gap-3">
                <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border-2 border-purple-400 shadow" />
                <span className="font-medium text-purple-800">{user.displayName}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-red-700 transition ml-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold px-5 py-2 rounded-lg shadow hover:from-purple-600 hover:to-indigo-600 transition"
                onClick={handleLogin}
              >
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-10">
        {/* Section Header */}
        <motion.h2
          className="text-4xl font-bold text-center text-purple-800 mb-10 drop-shadow"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Welcome to the Lost & Found Portal
        </motion.h2>

        {/* Form Section */}
        {user && (
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-14 border border-purple-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <input
              type="text"
              name="title"
              placeholder="Item Title"
              className="border border-purple-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-400 bg-purple-50 placeholder-purple-300 font-medium"
              value={form.title}
              onChange={handleFormChange}
              required
            />
            <select
              name="category"
              className="border border-purple-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-400 bg-purple-50 font-medium"
              value={form.category}
              onChange={handleFormChange}
            >
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
            <textarea
              name="description"
              placeholder="Item Description"
              className="border border-purple-200 p-3 rounded-lg col-span-1 md:col-span-2 h-32 resize-none focus:ring-2 focus:ring-purple-400 bg-purple-50 placeholder-purple-300 font-medium"
              value={form.description}
              onChange={handleFormChange}
              required
            ></textarea>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="col-span-1 md:col-span-2 border border-purple-200 p-2 rounded-lg bg-purple-50"
              onChange={handleFormChange}
              required
            />
            <button
              type="submit"
              className="col-span-1 md:col-span-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-3 rounded-lg shadow hover:from-purple-600 hover:to-indigo-600 transition"
            >
              Submit Item
            </button>
          </motion.form>
        )}

        {/* Items Section */}
        <section>
          <h3 className="text-2xl font-bold text-purple-700 mb-6">Recent Items</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.length === 0 && (
              <div className="col-span-full text-center text-gray-400 italic">No items yet. Be the first to add!</div>
            )}
            {items.map((item) => (
              <motion.div
                key={item.id}
                className="bg-white/90 rounded-2xl shadow-lg p-5 flex flex-col justify-between border border-purple-100 hover:shadow-2xl transition group"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-xl mb-4 border-2 border-purple-100 group-hover:border-purple-300 transition"
                  />
                  <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow ${item.category === 'lost'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                    }`}>
                    {item.category.toUpperCase()}
                  </span>
                  {/* Show delete button only for the item's owner */}
                  {user && item.user === user.email && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-3 right-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow hover:bg-red-700 transition"
                      title="Delete this item"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-purple-800 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex justify-between items-center mt-auto pt-2">
                  <span className="text-xs text-gray-400">{item.user}</span>
                  <span className="text-xs text-gray-400">{item.createdAt?.toDate?.().toLocaleString?.() || ""}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-lg border-t border-purple-200 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <span className="text-sm text-gray-500">© 2023 Lost & Found Portal. All rights reserved.</span>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
              <a href="#" className="text-purple-600 hover:underline">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
